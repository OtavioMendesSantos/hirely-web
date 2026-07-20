import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucideLayoutDashboard,
  lucideActivity,
  lucideChevronsUpDown,
} from '@ng-icons/lucide';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AuthService } from '../../services/auth';
import { UserMenuComponent } from '../user-menu/user-menu';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgIcon,
    ...HlmSidebarImports,
    ...HlmButtonImports,
    UserMenuComponent,
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucideLayoutDashboard,
      lucideActivity,
      lucideChevronsUpDown,
    }),
  ],
  templateUrl: './app-sidebar.html',
})
export class AppSidebarComponent {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;
}
