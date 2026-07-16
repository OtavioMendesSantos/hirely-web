import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { toast } from '@spartan-ng/brain/sonner';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    FormsModule,
    ...HlmCardImports,
    ...HlmInputImports,
    ...HlmLabelImports,
    ...HlmButtonImports,
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.sass',
})
export class Auth {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoginMode = signal(true);

  name = '';
  email = '';
  password = '';

  toggleMode() {
    this.isLoginMode.update((value) => !value);
    this.clearForm();
  }

  clearForm() {
    this.name = '';
    this.email = '';
    this.password = '';
  }

  async onLogin() {
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        console.log('Login successful', this.authService.currentUser);
        this.router.navigate(['/dashboard']);
      },
      error: ({ error, message }: HttpErrorResponse) => {
        const msg = error?.error?.message ?? message;
        toast.error(msg, { duration: 3000 });
      },
    });
  }

  async onRegister() {
    this.authService.register(this.name, this.email, this.password).subscribe({
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
