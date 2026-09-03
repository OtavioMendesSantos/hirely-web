import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

interface AuthResponse {
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  currentUser = signal<User | null>(null);

  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('is_logged_in');
    }
    return null;
  }

  private setLoginState(loggedIn: boolean) {
    if (typeof localStorage !== 'undefined') {
      if (loggedIn) {
        localStorage.setItem('is_logged_in', 'true');
      } else {
        localStorage.removeItem('is_logged_in');
      }
    }
  }

  login(email: string, password: string, rememberMe = true) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password, rememberMe })
      .pipe(
        tap((response) => {
          this.setLoginState(true);
          this.currentUser.set(response.user);
        })
      );
  }

  getOAuthUrl() {
    return this.http.get<{ url: string }>(`${environment.apiUrl}/auth/google/url`);
  }

  oauthLogin(code: string, redirectUri: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/google/login`, {
        code,
        redirect_uri: redirectUri,
      })
      .pipe(
        tap((response) => {
          this.setLoginState(true);
          this.currentUser.set(response.user);
        })
      );
  }

  register(name: string, email: string, password: string, rememberMe = true) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/users`, { name, email, password })
      .pipe(
        tap((response) => {
          this.setLoginState(true);
          this.currentUser.set(response.user);
        })
      );
  }

  checkAuth() {
    return this.http.get<User>(`${environment.apiUrl}/users/me`).pipe(
      tap((user) => {
        this.setLoginState(true);
        this.currentUser.set(user);
      }),
      catchError((error) => {
        this.logout();
        this.router.navigate(['/auth']);
        return throwError(() => error);
      })
    );
  }

  logout() {
    this.currentUser.set(null);
    this.setLoginState(false);
  }
}
