import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from './models/user.model';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs';

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  currentUser = signal<User | null>(null);

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/users:login`, { email, password })
      .pipe(
        tap((response) => {
          localStorage.setItem('jwt_token', response.token);
          this.currentUser.set(response.user);
        }),
      );
  }

  register(name: string, email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/users`, { name, email, password })
      .pipe(
        tap((response) => {
          localStorage.setItem('jwt_token', response.token);
          this.currentUser.set(response.user);
        }),
      );
  }

  logout() {
    localStorage.removeItem('jwt_token');
    this.currentUser.set(null);
  }
}
