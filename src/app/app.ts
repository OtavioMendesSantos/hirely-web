import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmToasterImports } from '@spartan-ng/helm/sonner';
import { AuthService } from './core/services/auth';
import { PreferencesService } from './core/services/preferences';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ...HlmToasterImports],
  template: `
    <router-outlet></router-outlet>
    <hlm-toaster></hlm-toaster>
  `,
  standalone: true,
})
export class App {
  protected readonly title = signal('Hirely');
  private authService = inject(AuthService);
  private readonly preferencesService = inject(PreferencesService);

  constructor() {
    if (this.authService.getToken()) {
      this.authService.checkAuth().subscribe({
        error: () => {},
      });
    }
  }
}
