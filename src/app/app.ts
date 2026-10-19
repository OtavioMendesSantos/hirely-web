import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmToasterImports } from '@spartan-ng/helm/sonner';
import { AuthService } from './core/services/auth';
import { PreferencesService } from './core/services/preferences';
import { BrandLoadingComponent } from './shared/components/brand-loading/brand-loading';
import { StartupLoadingService } from './core/services/startup-loading';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BrandLoadingComponent, ...HlmToasterImports],
  template: `
    <div [attr.inert]="startup.visible() || startup.error() ? '' : null">
      <router-outlet></router-outlet>
    </div>
    @if (startup.visible() || startup.error()) {
      <div
        animate.leave="loading-exit"
        class="bg-background fixed inset-0 z-[100] flex flex-col items-center justify-center"
      >
        @if (startup.error()) {
          <div role="alert" class="text-foreground max-w-sm px-6 text-center">
            <p class="font-semibold">{{ startup.error() }}</p>
            <button
              type="button"
              (click)="retryStartup()"
              class="bg-primary text-primary-foreground mt-5 rounded-md px-5 py-2"
            >
              Try again
            </button>
          </div>
        } @else {
          <app-brand-loading variant="loading" message="Connecting to your workspace" />
        }
      </div>
    }
    <hlm-toaster></hlm-toaster>
  `,
  standalone: true,
})
export class App {
  protected readonly title = signal('Hirely');
  private authService = inject(AuthService);
  private readonly preferencesService = inject(PreferencesService);
  readonly startup = inject(StartupLoadingService);

  retryStartup() {
    window.location.reload();
  }

  constructor() {
    if (this.authService.getToken()) {
      this.authService.checkAuth().subscribe({
        error: () => {
          /* Session errors are surfaced by the startup overlay or auth redirect. */
        },
      });
    }
  }
}
