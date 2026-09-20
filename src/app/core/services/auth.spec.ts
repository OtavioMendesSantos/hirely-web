import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    const store: Record<string, string> = {};
    const localStorageMock = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const k in store) delete store[k];
      },
    };
    Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

    const sessionStore: Record<string, string> = {};
    const sessionStorageMock = {
      getItem: (key: string) => sessionStore[key] || null,
      setItem: (key: string, value: string) => {
        sessionStore[key] = value;
      },
      removeItem: (key: string) => {
        delete sessionStore[key];
      },
      clear: () => {
        for (const k in sessionStore) delete sessionStore[k];
      },
    };
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: sessionStorageMock,
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set logged-in state when login succeeds with rememberMe=true', () => {
    const mockUser: User = {
      id: '1',
      name: 'Otavio',
      email: 'otavio@example.com',
      createdAt: '2026-01-01',
    };
    sessionStorage.setItem('jwt_token', 'old-session-token');

    service.login('otavio@example.com', 'secret', true).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.body).toEqual({
      email: 'otavio@example.com',
      password: 'secret',
      rememberMe: true,
    });
    req.flush({ user: mockUser });

    // O JWT agora vive em cookie (HttpOnly) no servidor; o front só marca o estado.
    expect(localStorage.getItem('is_logged_in')).toBe('true');
    expect(sessionStorage.getItem('jwt_token')).toBe('old-session-token');
    expect(service.getToken()).toBe('true');
    expect(service.currentUser()).toEqual(mockUser);
  });

  it('should set logged-in state when login succeeds with rememberMe=false', () => {
    const mockUser: User = {
      id: '1',
      name: 'Otavio',
      email: 'otavio@example.com',
      createdAt: '2026-01-01',
    };
    localStorage.setItem('jwt_token', 'old-local-token');

    service.login('otavio@example.com', 'secret', false).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.body).toEqual({
      email: 'otavio@example.com',
      password: 'secret',
      rememberMe: false,
    });
    req.flush({ user: mockUser });

    expect(localStorage.getItem('is_logged_in')).toBe('true');
    expect(service.getToken()).toBe('true');
    expect(service.currentUser()).toEqual(mockUser);
  });

  it('should call /v1/users/me on checkAuth and set currentUser upon success', () => {
    const mockUser: User = {
      id: '1',
      name: 'Otavio',
      email: 'otavio@example.com',
      createdAt: '2026-01-01',
    };

    service.checkAuth().subscribe((user: User) => {
      expect(user).toEqual(mockUser);
      expect(service.currentUser()).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should logout and clear logged-in state when /users/me returns 401', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    localStorage.setItem('is_logged_in', 'true');

    service.checkAuth().subscribe({
      error: () => {
        expect(localStorage.getItem('is_logged_in')).toBeNull();
        expect(service.currentUser()).toBeNull();
        expect(navigateSpy).toHaveBeenCalledWith(['/auth']);
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });
});
