import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { toast } from '@spartan-ng/brain/sonner';
import { SocialAuthButtonsComponent } from './components/social-auth-buttons/social-auth-buttons';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ...HlmInputImports,
    ...HlmLabelImports,
    ...HlmButtonImports,
    ...HlmCardImports,
    SocialAuthButtonsComponent,
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.sass',
})
export class Auth {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoginMode = signal(true);

  name = '';
  email = '';
  password = '';

  constructor() {
    this.route.queryParams.subscribe((params) => {
      if (params['mode'] === 'register') {
        this.isLoginMode.set(false);
      } else if (params['mode'] === 'login') {
        this.isLoginMode.set(true);
      }
    });
  }

  toggleMode() {
    this.isLoginMode.update((value) => !value);
    this.clearForm();
  }

  clearForm() {
    this.name = '';
    this.email = '';
    this.password = '';
  }

  onInProgress(feature: string) {
    toast.info(`In progress: "${feature}" estará disponível em breve!`, { duration: 3500 });
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
