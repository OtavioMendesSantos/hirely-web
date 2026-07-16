import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, ...HlmButtonImports, ...HlmAlertDialogImports],
  template: `
    <header class="w-full bg-surface/90 backdrop-blur-md border-b border-border-subtle px-6 sm:px-12 md:px-20 py-4 flex items-center justify-between sticky top-0 z-50">
      <!-- Hirely num canto -->
      <a routerLink="/" class="flex items-center gap-2.5 text-xl font-heading font-bold tracking-tight text-primary hover:opacity-90 transition-opacity cursor-pointer">
        <div class="w-8 h-8 rounded bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shadow-sm">H</div>
        <span>Hirely</span>
      </a>

      <!-- Btn de login e register (ou Dashboard / Log Out se logado) -->
      <div class="flex items-center gap-3">
        @if (isLoggedIn()) {
          <a
            routerLink="/dashboard"
            class="text-sm font-semibold text-on-surface hover:text-primary transition-colors px-3 py-2 cursor-pointer"
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
              class="border-border-subtle hover:bg-surface-muted text-on-surface font-semibold px-4 py-2 rounded transition-colors cursor-pointer"
            >
              Log Out
            </button>
            <hlm-alert-dialog-content *hlmAlertDialogPortal="let ctx">
              <hlm-alert-dialog-header>
                <h2 hlmAlertDialogTitle class="font-heading font-bold text-on-surface">Confirm Log Out</h2>
                <p hlmAlertDialogDescription class="font-body text-on-surface-variant leading-relaxed">
                  Are you sure you want to log out of your account?
                </p>
              </hlm-alert-dialog-header>
              <hlm-alert-dialog-footer>
                <button hlmAlertDialogCancel type="button">Cancel</button>
                <button hlmAlertDialogAction type="button" (click)="ctx.close(); confirmLogout()">Log Out</button>
              </hlm-alert-dialog-footer>
            </hlm-alert-dialog-content>
          </hlm-alert-dialog>
        } @else {
          <a
            routerLink="/auth"
            [queryParams]="{ mode: 'login' }"
            class="text-sm font-semibold text-on-surface hover:text-primary transition-colors px-3 py-2 cursor-pointer"
          >
            Log In
          </a>
          <a
            hlmBtn
            size="sm"
            routerLink="/auth"
            [queryParams]="{ mode: 'register' }"
            class="font-semibold px-4 py-2 rounded transition-colors shadow-sm cursor-pointer"
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
