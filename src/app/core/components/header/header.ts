import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ThemeService } from '../../services/theme';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMonitor, lucideSun, lucideMoon } from '@ng-icons/lucide';
import { UserMenuComponent } from '../user-menu/user-menu';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, ...HlmButtonImports, NgIcon, UserMenuComponent],
  providers: [provideIcons({ lucideMonitor, lucideSun, lucideMoon })],
  templateUrl: './header.html',
})
export class HeaderComponent {
  private authService = inject(AuthService);
  themeService = inject(ThemeService);

  isLoggedIn = computed(() => {
    const user = this.authService.currentUser();
    const token = this.authService.getToken();
    return user !== null || !!token;
  });
}
