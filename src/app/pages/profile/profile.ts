import { Component, inject } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { AppLayoutComponent } from '../../core/components/app-layout/app-layout';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [AppLayoutComponent, ...HlmCardImports, ...HlmSkeletonImports],
  templateUrl: './profile.html',
})
export class Profile {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;
}
