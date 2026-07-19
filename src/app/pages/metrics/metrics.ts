import { Component, inject } from '@angular/core';
import { AppLayoutComponent } from '../../core/components/app-layout/app-layout';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [AppLayoutComponent, ...HlmCardImports],
  templateUrl: './metrics.html',
})
export class Metrics {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;
}
