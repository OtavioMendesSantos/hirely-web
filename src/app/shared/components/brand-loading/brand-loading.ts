import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  NgZone,
  signal,
  viewChild,
} from '@angular/core';
import type { AnimationItem } from 'lottie-web';
import { BrandComponent } from '../brand/brand';

@Component({
  selector: 'app-brand-loading',
  standalone: true,
  imports: [BrandComponent],
  template: `
    <div class="brand-loading" role="status" aria-live="polite" aria-atomic="true">
      <div class="motion" aria-hidden="true">
        @if (!ready()) {
          <app-brand class="fallback" />
        }
        <div #player class="player" [class.is-ready]="ready()"></div>
      </div>
      <p class="message">{{ message() }}</p>
      <p class="hint">
        {{
          slow()
            ? 'The first connection can take a little longer. Hang tight.'
            : 'Your next opportunity starts here.'
        }}
      </p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .brand-loading {
      display: flex;
      min-height: 20rem;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      text-align: center;
    }
    .motion {
      position: relative;
      width: min(20rem, 80vw);
      aspect-ratio: 420/220;
      display: grid;
      place-items: center;
    }
    .fallback {
      height: 4rem;
    }
    .player {
      position: absolute;
      inset: 0;
      visibility: hidden;
    }
    .player.is-ready {
      visibility: visible;
    }
    .message {
      margin-top: 0.25rem;
      color: var(--foreground);
      font-weight: 600;
      font-size: 0.95rem;
    }
    .hint {
      margin-top: 0.5rem;
      max-width: 20rem;
      color: var(--muted-foreground);
      font-size: 0.8rem;
      line-height: 1.6;
    }
  `,
})
export class BrandLoadingComponent {
  readonly message = input('Preparing your workspace');
  readonly variant = input<'loading' | 'splash' | 'symbol'>('loading');
  readonly slow = signal(false);
  readonly ready = signal(false);
  private readonly player = viewChild.required<ElementRef<HTMLDivElement>>('player');
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);
  private animation?: AnimationItem;

  constructor() {
    afterNextRender(() => {
      if (typeof window.matchMedia !== 'function') return;
      const slowTimer = setTimeout(() => this.slow.set(true), 8000);
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      let isLoop = this.variant() !== 'splash';
      const stillFrame = () => (isLoop ? 60 : 48);
      const onMotionChange = () => {
        if (motion.matches) this.animation?.goToAndStop(stillFrame(), true);
        else this.animation?.play();
      };
      motion.addEventListener('change', onMotionChange);
      this.destroyRef.onDestroy(() => {
        clearTimeout(slowTimer);
        motion.removeEventListener('change', onMotionChange);
        this.animation?.destroy();
      });
      // Load the player only while a real wait is visible; never add it to the initial bundle.
      this.zone.runOutsideAngular(async () => {
        try {
          const [{ default: lottie }, response] = await Promise.all([
            import('lottie-web/build/player/lottie_light'),
            fetch(`animations/hirely-${this.variant()}.json`),
          ]);
          if (!response.ok) return;
          const animationData = await response.json();
          if (this.destroyRef.destroyed) return;
          this.animation = lottie.loadAnimation({
            container: this.player().nativeElement,
            renderer: 'svg',
            loop: this.variant() !== 'splash',
            autoplay: !motion.matches,
            animationData,
            rendererSettings: { progressiveLoad: false, hideOnTransparent: true },
          });
          if (motion.matches) this.animation.goToAndStop(stillFrame(), true);
          if (this.variant() === 'splash') {
            this.animation.addEventListener('complete', async () => {
              // A cold start may outlast the entrance. Keep moving until the request settles.
              this.animation?.goToAndStop(48, true);
              try {
                const loopResponse = await fetch('animations/hirely-loading.json');
                if (!loopResponse.ok) return;
                const loopData = await loopResponse.json();
                if (this.destroyRef.destroyed) return;
                this.animation?.destroy();
                isLoop = true;
                this.animation = lottie.loadAnimation({
                  container: this.player().nativeElement,
                  renderer: 'svg',
                  loop: true,
                  autoplay: !motion.matches,
                  animationData: loopData,
                });
                if (motion.matches) this.animation.goToAndStop(60, true);
              } catch {
                /* Keep the completed wordmark if the loop cannot load. */
              }
            });
          }
          this.zone.run(() => this.ready.set(true));
        } catch {
          // The static SVG identity remains visible if the player or asset cannot load.
        }
      });
    });
  }
}
