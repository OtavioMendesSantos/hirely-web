import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideUser,
  lucideSun,
  lucideMoon,
  lucideMonitor,
  lucideLogOut,
  lucideChevronsUpDown,
} from '@ng-icons/lucide';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmMenubarImports } from '@spartan-ng/helm/menubar';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { AuthService } from '../../services/auth';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [
    RouterLink,
    NgIcon,
    ...HlmSidebarImports,
    ...HlmAlertDialogImports,
    ...HlmMenubarImports,
    ...HlmDropdownMenuImports,
  ],
  providers: [
    provideIcons({
      lucideUser,
      lucideSun,
      lucideMoon,
      lucideMonitor,
      lucideLogOut,
      lucideChevronsUpDown,
    }),
  ],
  templateUrl: './user-menu.html',
})
export class UserMenuComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  themeService = inject(ThemeService);

  readonly variant = input<'sidebar' | 'header'>('sidebar');
  readonly side = input<'top' | 'bottom' | 'left' | 'right'>('top');
  readonly align = input<'start' | 'center' | 'end'>('start');

  currentUser = this.authService.currentUser;
  isLogoutConfirmOpen = signal(false);

  userInitials = computed(() => {
    const name = this.currentUser()?.name || 'Recruiter User';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  });

  openLogoutConfirm() {
    this.isLogoutConfirmOpen.set(true);
  }

  cancelLogout() {
    this.isLogoutConfirmOpen.set(false);
  }

  onLogoutDialogStateChanged(state: string) {
    if (state === 'closed') {
      this.isLogoutConfirmOpen.set(false);
    }
  }

  confirmLogout() {
    this.isLogoutConfirmOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
