import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { environment } from '../../../environments/environment';
import { vi } from 'vitest';
import { StartupLoadingService } from '../services/startup-loading';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
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
    vi.useRealTimers();
  });

  it('should attach withCredentials to true for apiUrl', () => {
    http.get(`${environment.apiUrl}/users/me`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  it('shows the brand throughout a 15-second cold start and clears it on success', () => {
    vi.useFakeTimers();
    const loading = TestBed.inject(StartupLoadingService);
    http.get(`${environment.apiUrl}/users/me`).subscribe();
    const request = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    expect(loading.visible()).toBe(false);
    vi.advanceTimersByTime(200);
    expect(loading.visible()).toBe(true);
    vi.advanceTimersByTime(14800);
    expect(loading.visible()).toBe(true);
    expect(request.cancelled).toBe(false);
    request.flush({});
    expect(loading.visible()).toBe(false);
    expect(loading.error()).toBeNull();
  });

  it('avoids flashing for fast responses and never sends credentials to a lookalike origin', () => {
    vi.useFakeTimers();
    const loading = TestBed.inject(StartupLoadingService);
    http.get(`${environment.apiUrl}/users/me`).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/users/me`).flush({});
    vi.advanceTimersByTime(200);
    expect(loading.visible()).toBe(false);
    http.get(`${environment.apiUrl}.invalid/users/me`).subscribe();
    const external = httpMock.expectOne(`${environment.apiUrl}.invalid/users/me`);
    expect(external.request.withCredentials).toBe(false);
    external.flush({});
  });

  it('releases the loading state and offers recovery when the server times out', () => {
    vi.useFakeTimers();
    const loading = TestBed.inject(StartupLoadingService);
    const errors: unknown[] = [];
    http.get(`${environment.apiUrl}/users/me`).subscribe({ error: (error) => errors.push(error) });
    const request = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    vi.advanceTimersByTime(45000);
    expect(request.cancelled).toBe(true);
    expect(errors).toHaveLength(1);
    expect(loading.visible()).toBe(false);
    expect(loading.error()).toContain('try again');
  });
});
