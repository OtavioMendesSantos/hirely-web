import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { HeaderComponent } from '../../shared/components/header/header';
import { FooterComponent } from '../../shared/components/footer/footer';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, ...HlmCardImports],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser();
}
