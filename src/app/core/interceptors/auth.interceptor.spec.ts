import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { environment } from '../../../environments/environment';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

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
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should attach Authorization header when jwt_token exists in localStorage and url starts with apiUrl', () => {
    localStorage.setItem('jwt_token', 'my-fake-token');

    http.get(`${environment.apiUrl}/users/me`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-fake-token');
    req.flush({});
  });

  it('should not attach Authorization header when jwt_token does not exist', () => {
    http.get(`${environment.apiUrl}/users/me`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
