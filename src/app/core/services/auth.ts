import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { catchError, tap, throwError } from 'rxjs';

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  currentUser = signal<User | null>(null);

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/users:login`, { email, password })
      .pipe(
        tap((response) => {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('jwt_token', response.token);
          }
          this.currentUser.set(response.user);
        }),
      );
  }

  register(name: string, email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/users`, { name, email, password })
      .pipe(
        tap((response) => {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('jwt_token', response.token);
          }
          this.currentUser.set(response.user);
        }),
      );
  }

  checkAuth() {
    return this.http
      .get<User>(`${environment.apiUrl}/users/me`)
      .pipe(
        tap((user) => {
          this.currentUser.set(user);
        }),
        catchError((error) => {
          this.logout();
          this.router.navigate(['/auth']);
          return throwError(() => error);
        }),
      );
  }

  logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('jwt_token');
    }
    this.currentUser.set(null);
  }
}
