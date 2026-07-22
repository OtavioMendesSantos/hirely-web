import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HeaderComponent } from '../../core/components/header/header';
import { FooterComponent } from '../../shared/components/footer/footer';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent, ...HlmButtonImports],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoggedIn = computed(() => {
    const user = this.authService.currentUser();
    const token = this.authService.getToken();
    return user !== null || !!token;
  });

  constructor() {
    effect(() => {
      if (this.isLoggedIn()) {
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      }
    });
  }

  ngOnInit() {
    if (this.isLoggedIn()) {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    }
  }
}
