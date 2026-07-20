import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
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
    SocialAuthButtonsComponent,
  ],
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

  clearForm() {
    this.name = '';
    this.email = '';
    this.password = '';
    this.rememberMe = true;
  }

  onInProgress(feature: string) {
    this.inProgress.emit(feature);
  }

  async onRegister() {
    this.authService.register(this.name, this.email, this.password, this.rememberMe).subscribe({
      next: () => {
        console.log('Register successful');
        this.router.navigate(['/dashboard']);
      },
      error: ({ error, message }: HttpErrorResponse) => {
        const msg = error?.error?.message ?? message;
        toast.error(msg, { duration: 3000 });
      },
    });
  }
}
