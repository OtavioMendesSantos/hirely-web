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

export function getTokenFromStorage(): string | null {
  if (typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('jwt_token');
    if (token) return token;
  }
  if (typeof sessionStorage !== 'undefined') {
    const token = sessionStorage.getItem('jwt_token');
    if (token) return token;
  }
  return null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  currentUser = signal<User | null>(null);

  getToken(): string | null {
    return getTokenFromStorage();
  }

  private saveToken(token: string, rememberMe: boolean) {
    if (rememberMe) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('jwt_token', token);
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('jwt_token');
      }
    } else {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('jwt_token', token);
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('jwt_token');
      }
    }
  }

  login(email: string, password: string, rememberMe = true) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/users:login`, { email, password, rememberMe })
      .pipe(
        tap((response) => {
          this.saveToken(response.token, rememberMe);
          this.currentUser.set(response.user);
        })
      );
  }

  register(name: string, email: string, password: string, rememberMe = true) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/users`, { name, email, password })
      .pipe(
        tap((response) => {
          this.saveToken(response.token, rememberMe);
          this.currentUser.set(response.user);
        })
      );
  }

  checkAuth() {
    return this.http.get<User>(`${environment.apiUrl}/users/me`).pipe(
      tap((user) => {
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
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('jwt_token');
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('jwt_token');
    }
    this.currentUser.set(null);
  }
}
