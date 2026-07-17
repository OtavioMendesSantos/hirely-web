import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmToasterImports } from '@spartan-ng/helm/sonner';
import { AuthService } from './core/services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ...HlmToasterImports],
  templateUrl: './app.html',
  styleUrl: './app.sass',
})
export class App {
  protected readonly title = signal('Hirely');
  private authService = inject(AuthService);

  constructor() {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('jwt_token')) {
      this.authService.checkAuth().subscribe({
        error: () => {},
      });
    }
  }
}
