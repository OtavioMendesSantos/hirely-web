import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { toast } from '@spartan-ng/brain/sonner';
import { AuthService } from '../../../../core/services/auth';
import { SocialAuthButtonsComponent } from '../social-auth-buttons/social-auth-buttons';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ...HlmInputImports,
    ...HlmButtonImports,
    ...HlmFieldImports,
    ...HlmSpinnerImports,
    NgIcon,
    SocialAuthButtonsComponent,
  ],
  providers: [
    provideIcons({
      lucideEye,
      lucideEyeOff,
    }),
  ],
  host: {
    class: 'block w-full flex-1 lg:order-2',
  },
  templateUrl: './register-form.html',
})
export class RegisterFormComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly toggleMode = output<void>();
  readonly inProgress = output<string>();

  name = '';
  email = '';
  password = '';
  rememberMe = true;
  showPassword = signal(false);
  isLoading = signal(false);

  toggleShowPassword() {
    this.showPassword.update((s) => !s);
  }

  clearForm() {
    this.name = '';
    this.email = '';
    this.password = '';
    this.rememberMe = true;
    this.showPassword.set(false);
  }

  onInProgress(feature: string) {
    this.inProgress.emit(feature);
  }

  async onRegister() {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.authService.register(this.name, this.email, this.password, this.rememberMe).subscribe({
      next: () => {
        this.isLoading.set(false);
        console.log('Register successful');
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
