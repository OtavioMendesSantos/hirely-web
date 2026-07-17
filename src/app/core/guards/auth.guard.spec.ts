import { TestBed } from '@angular/core/testing';
import { CanActivateFn, provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { firstValueFrom, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth';
import { User } from '../models/user.model';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let router: Router;
  let authServiceMock: {
    currentUser: ReturnType<typeof signal<User | null>>;
    checkAuth: ReturnType<typeof vi.fn>;
    getToken: ReturnType<typeof vi.fn>;
  };

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
    Object.defineProperty(globalThis, 'sessionStorage', { value: sessionStorageMock, writable: true });

    authServiceMock = {
      currentUser: signal<User | null>(null),
      checkAuth: vi.fn(),
      getToken: vi.fn().mockImplementation(() => {
        if (typeof localStorage !== 'undefined' && localStorage.getItem('jwt_token')) {
          return localStorage.getItem('jwt_token');
        }
        if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('jwt_token')) {
          return sessionStorage.getItem('jwt_token');
        }
        return null;
      }),
    };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    });

    router = TestBed.inject(Router);
  });

  it('should redirect to /auth and return false when jwt_token is not in localStorage or sessionStorage', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    const result = executeGuard({} as any, {} as any);

    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/auth']);
  });

  it('should return true immediately when currentUser is not null and token exists in localStorage', () => {
    localStorage.setItem('jwt_token', 'valid-token');
    authServiceMock.currentUser.set({
      id: '1',
      name: 'User',
      email: 'user@example.com',
      createdAt: '2026-01-01',
    });

    const result = executeGuard({} as any, {} as any);
    expect(result).toBe(true);
    expect(authServiceMock.checkAuth).not.toHaveBeenCalled();
  });

  it('should return true immediately when currentUser is not null and token exists in sessionStorage', () => {
    sessionStorage.setItem('jwt_token', 'valid-session-token');
    authServiceMock.currentUser.set({
      id: '1',
      name: 'User',
      email: 'user@example.com',
      createdAt: '2026-01-01',
    });

    const result = executeGuard({} as any, {} as any);
    expect(result).toBe(true);
    expect(authServiceMock.checkAuth).not.toHaveBeenCalled();
  });

  it('should call checkAuth when jwt_token exists and currentUser is null, returning true on success', async () => {
    localStorage.setItem('jwt_token', 'valid-token');
    authServiceMock.checkAuth.mockReturnValue(
      of({ id: '1', name: 'User', email: 'user@example.com', createdAt: '2026-01-01' })
    );

    const result$ = executeGuard({} as any, {} as any) as any;
    const canActivate = await firstValueFrom(result$);
    expect(canActivate).toBe(true);
    expect(authServiceMock.checkAuth).toHaveBeenCalled();
  });

  it('should return false when checkAuth throws error', async () => {
    localStorage.setItem('jwt_token', 'expired-token');
    authServiceMock.checkAuth.mockReturnValue(throwError(() => new Error('401 Unauthorized')));

    const result$ = executeGuard({} as any, {} as any) as any;
    const canActivate = await firstValueFrom(result$);
    expect(canActivate).toBe(false);
    expect(authServiceMock.checkAuth).toHaveBeenCalled();
  });
});
