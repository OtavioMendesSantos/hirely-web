import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ThemeService } from '../../services/theme';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMonitor, lucideSun, lucideMoon } from '@ng-icons/lucide';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, ...HlmButtonImports, ...HlmAlertDialogImports, NgIcon],
  providers: [provideIcons({ lucideMonitor, lucideSun, lucideMoon })],
  template: `
    <header
      class="bg-surface/90 border-border-subtle sticky top-0 z-50 flex w-full items-center justify-between border-b px-6 py-4 backdrop-blur-md sm:px-12 md:px-20"
    >
      <!-- Hirely num canto -->
      <a
        routerLink="/"
        class="font-heading text-primary flex cursor-pointer items-center gap-2.5 text-xl font-bold tracking-tight transition-opacity hover:opacity-90"
      >
        <img src="hirely_logo.png" alt="Hirely Logo" class="h-8 w-auto object-contain" />
        <span>Hirely</span>
      </a>

      <!-- Btn de login e register (ou Dashboard / Log Out se logado) -->
      <div class="flex items-center gap-3">
        <!-- Botão de Dark Mode (Alterna entre Claro, Escuro e Sistema) -->
        <button
          hlmBtn
          variant="ghost"
          size="icon"
          type="button"
          (click)="themeService.toggleTheme()"
          [title]="'Theme: ' + themeService.theme()"
          class="text-on-surface hover:bg-surface-muted hover:text-primary flex cursor-pointer items-center justify-center rounded-full transition-colors"
        >
          @switch (themeService.theme()) {
            @case ('light') {
              <ng-icon name="lucideSun" class="text-base" />
            }
            @case ('dark') {
              <ng-icon name="lucideMoon" class="text-base" />
            }
            @default {
              <ng-icon name="lucideMonitor" class="text-base" />
            }
          }
        </button>

        @if (isLoggedIn()) {
          <a
            routerLink="/dashboard"
            class="text-on-surface hover:text-primary cursor-pointer px-3 py-2 text-sm font-semibold transition-colors"
          >
            Dashboard
          </a>
          <hlm-alert-dialog>
            <button
              hlmAlertDialogTrigger
              hlmBtn
              variant="outline"
              size="sm"
              type="button"
              class="border-border-subtle hover:bg-surface-muted text-on-surface cursor-pointer rounded px-4 py-2 font-semibold transition-colors"
            >
              Log Out
            </button>
            <hlm-alert-dialog-content *hlmAlertDialogPortal="let ctx">
              <hlm-alert-dialog-header>
                <h2 hlmAlertDialogTitle class="font-heading text-on-surface font-bold">
                  Confirm Log Out
                </h2>
                <p
                  hlmAlertDialogDescription
                  class="font-body text-on-surface-variant leading-relaxed"
                >
                  Are you sure you want to log out of your account?
                </p>
              </hlm-alert-dialog-header>
              <hlm-alert-dialog-footer>
                <button hlmAlertDialogCancel type="button">Cancel</button>
                <button hlmAlertDialogAction type="button" (click)="ctx.close(); confirmLogout()">
                  Log Out
                </button>
              </hlm-alert-dialog-footer>
            </hlm-alert-dialog-content>
          </hlm-alert-dialog>
        } @else {
          <a
            routerLink="/auth"
            [queryParams]="{ mode: 'login' }"
            class="text-on-surface hover:text-primary cursor-pointer px-3 py-2 text-sm font-semibold transition-colors"
          >
            Log In
          </a>
          <a
            hlmBtn
            size="sm"
            routerLink="/auth"
            [queryParams]="{ mode: 'register' }"
            class="cursor-pointer rounded px-4 py-2 font-semibold shadow-sm transition-colors"
          >
            Sign Up
          </a>
        }
      </div>
    </header>
  `,
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  themeService = inject(ThemeService);

  isLogoutConfirmOpen = signal(false);

  isLoggedIn = computed(() => {
    const user = this.authService.currentUser();
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    return user !== null || !!token;
  });

  openLogoutConfirm() {
    this.isLogoutConfirmOpen.set(true);
  }

  cancelLogout() {
    this.isLogoutConfirmOpen.set(false);
  }

  confirmLogout() {
    this.isLogoutConfirmOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
