import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HeaderComponent } from '../../core/components/header/header';
import { FooterComponent } from '../../shared/components/footer/footer';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHome, lucideLayoutDashboard } from '@ng-icons/lucide';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, ...HlmButtonImports, HeaderComponent, FooterComponent, NgIcon],
  providers: [provideIcons({ lucideHome, lucideLayoutDashboard })],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  private authService = inject(AuthService);

  isLoggedIn = computed(() => {
    const user = this.authService.currentUser();
    const token = this.authService.getToken();
    return user !== null || !!token;
  });
}
