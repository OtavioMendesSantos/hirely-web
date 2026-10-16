import { DestroyRef, Injectable, InjectionToken, NgZone, effect, inject } from '@angular/core';
import { PreferencesService } from './preferences';
import { AuthService } from './auth';
import { ApplicationStatus } from '../models/application.model';

export const CONFETTI_LOADER = new InjectionToken<() => Promise<typeof import('./confetti-rain')>>(
  'CONFETTI_LOADER',
  { providedIn: 'root', factory: () => () => import('./confetti-rain') }
);

@Injectable({ providedIn: 'root' })
export class CelebrationService {
  private readonly preferences = inject(PreferencesService);
  private readonly auth = inject(AuthService);
  private readonly zone = inject(NgZone);
  private readonly loadConfetti = inject(CONFETTI_LOADER);
  private active = false;
  private destroyed = false;
  private activeUserId: string | undefined;
  private cancel: (() => void) | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.cancel?.();
    });
    effect(() => {
      const userId = this.auth.currentUser()?.id;
      if (!this.preferences.preferences().confetti_enabled || userId !== this.activeUserId)
        this.cancel?.();
    });
  }

  celebrateAcceptance(previous: ApplicationStatus, next: ApplicationStatus) {
    if (previous === 'ACCEPTED' || next !== 'ACCEPTED') return;
    void this.celebrate();
  }

  private async celebrate() {
    if (
      this.active ||
      !this.preferences.preferences().confetti_enabled ||
      typeof window === 'undefined'
    )
      return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    this.active = true;
    const userId = this.auth.currentUser()?.id;
    try {
      const { confettiRain } = await this.loadConfetti();
      if (
        this.destroyed ||
        !this.preferences.preferences().confetti_enabled ||
        this.auth.currentUser()?.id !== userId
      )
        return;
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
      this.activeUserId = userId;
      await this.zone.runOutsideAngular(
        () =>
          new Promise<void>((resolve) => {
            this.cancel = confettiRain(resolve);
          })
      );
    } catch {
      // Celebration is optional and must never affect a saved application.
    } finally {
      this.active = false;
      this.cancel = null;
      this.activeUserId = undefined;
    }
  }
}
