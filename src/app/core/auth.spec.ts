import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from './services/auth';
import { environment } from '../../environments/environment';
import { User } from './models/user.model';

describe('AuthService (core)', () => {
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

  it('should logout and redirect to /auth when checkAuth fails', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    localStorage.setItem('jwt_token', 'invalid-token');

    service.checkAuth().subscribe({
      error: () => {
        expect(localStorage.getItem('jwt_token')).toBeNull();
        expect(service.currentUser()).toBeNull();
        expect(navigateSpy).toHaveBeenCalledWith(['/auth']);
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });
});
