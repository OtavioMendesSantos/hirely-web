import { Component, inject } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { AppLayoutComponent } from '../../core/components/app-layout/app-layout';
import { PreferencesService } from '../../core/services/preferences';
import { FormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmNativeSelectImports } from '@spartan-ng/helm/native-select';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    FormsModule,
    ...HlmButtonImports,
    ...HlmNativeSelectImports,
    AppLayoutComponent,
    ...HlmCardImports,
    ...HlmSkeletonImports,
  ],
  templateUrl: './profile.html',
})
export class Profile {
  private authService = inject(AuthService);
  readonly preferencesService = inject(PreferencesService);
  currentUser = this.authService.currentUser;
}
