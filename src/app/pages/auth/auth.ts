import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.sass',
})
export class Auth {
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

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
        this.snackBar.open(msg, 'Close', { duration: 3000 });
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
        this.snackBar.open(msg, 'Close', { duration: 3000 });
      },
    });
  }
}
