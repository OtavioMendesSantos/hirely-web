import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { toast } from '@spartan-ng/brain/sonner';
import { AuthService } from '../../../../core/services/auth';
import { SocialAuthButtonsComponent } from '../social-auth-buttons/social-auth-buttons';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ...HlmInputImports,
    ...HlmLabelImports,
    ...HlmButtonImports,
    ...HlmFieldImports,
    ...HlmSpinnerImports,
    SocialAuthButtonsComponent,
  ],
  host: {
    class: 'block w-full flex-1',
  },
  templateUrl: './login-form.html',
})
export class LoginFormComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly toggleMode = output<void>();
  readonly inProgress = output<string>();

  email = '';
  password = '';
  rememberMe = true;
  isLoading = signal(false);

  clearForm() {
    this.email = '';
    this.password = '';
    this.rememberMe = true;
  }

  onInProgress(feature: string) {
    this.inProgress.emit(feature);
  }

  async onLogin() {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.authService.login(this.email, this.password, this.rememberMe).subscribe({
      next: () => {
        this.isLoading.set(false);
        console.log('Login successful', this.authService.currentUser);
        this.router.navigate(['/dashboard']);
      },
      error: ({ error, message }: HttpErrorResponse) => {
        this.isLoading.set(false);
        const msg = error?.error?.message ?? message;
        toast.error(msg, { duration: 3000 });
      },
    });
  }
}
