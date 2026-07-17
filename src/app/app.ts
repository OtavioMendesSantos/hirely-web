import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmToasterImports } from '@spartan-ng/helm/sonner';
import { AuthService } from './core/services/auth';
import { ThemeService } from './core/services/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ...HlmToasterImports],
  templateUrl: './app.html',
  styleUrl: './app.sass',
  standalone: true,
})
export class App {
  protected readonly title = signal('Hirely');
  private authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  
  constructor() {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('jwt_token')) {
      this.authService.checkAuth().subscribe({
        error: () => {},
      });
    }
  }
}
