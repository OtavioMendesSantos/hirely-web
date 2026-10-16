import { vi } from 'vitest';
import { toast } from '@spartan-ng/brain/sonner';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth';
import { PreferencesService } from './preferences';
import { ThemeService } from './theme';
import { User } from '../models/user.model';
import { DEFAULT_PREFERENCES } from '../models/user-preferences.model';
import { environment } from '../../../environments/environment';

const url = `${environment.apiUrl}/users/me/preferences`;
const account = (id: string): User => ({ id, name: id, email: `${id}@example.com`, createdAt: '' });

describe('PreferencesService', () => {
  const currentUser = signal<User | null>(null);
  let service: PreferencesService;
  let http: HttpTestingController;

  beforeEach(() => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
    });
    vi.spyOn(toast, 'success').mockReturnValue('preferences-saved');
    currentUser.set(null);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { currentUser } },
      ],
    });
    service = TestBed.inject(PreferencesService);
    http = TestBed.inject(HttpTestingController);
    TestBed.tick();
  });

  afterEach(() => {
    http.verify();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function signIn(id = 'a') {
    currentUser.set(account(id));
    TestBed.tick();
    return http.expectOne(url);
  }

  it('loads account preferences and applies the theme', () => {
    signIn().flush({ theme: 'dark', confetti_enabled: false });
    expect(service.preferences()).toEqual({ theme: 'dark', confetti_enabled: false });
    expect(TestBed.inject(ThemeService).theme()).toBe('dark');
    expect(toast.success).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem('hirely_preferences:a')!)).toEqual(
      service.preferences()
    );
  });

  it('serializes rapid saves and keeps the newest theme visible', () => {
    signIn().flush(DEFAULT_PREFERENCES);
    service.setTheme('dark');
    const first = http.expectOne(url);
    expect(first.request.method).toBe('PATCH');
    expect(first.request.body).toEqual({ theme: 'dark' });
    service.update({ confetti_enabled: false });
    service.setTheme('light');
    http.expectNone(url);
    first.flush({ theme: 'dark', confetti_enabled: true });
    expect(service.theme()).toBe('light');
    expect(service.preferences().confetti_enabled).toBe(false);
    expect(toast.success).not.toHaveBeenCalled();
    const second = http.expectOne(url);
    expect(second.request.body).toEqual({ confetti_enabled: false });
    second.flush({ theme: 'dark', confetti_enabled: false });
    expect(service.theme()).toBe('light');
    expect(toast.success).not.toHaveBeenCalled();
    http.expectOne(url).flush({ theme: 'light', confetti_enabled: false });
    expect(service.saving()).toBe(false);
    expect(toast.success).toHaveBeenCalledExactlyOnceWith('Preferences saved');
  });

  it('ignores a load response that started before a save', () => {
    const load = signIn();
    service.setTheme('dark');
    const save = http.expectOne(url);
    save.flush({ theme: 'dark', confetti_enabled: true });
    load.flush(DEFAULT_PREFERENCES);
    expect(service.theme()).toBe('dark');
  });

  it('restores the confirmed theme on failure and supports retry', () => {
    signIn().flush(DEFAULT_PREFERENCES);
    service.setTheme('dark');
    expect(TestBed.inject(ThemeService).theme()).toBe('dark');
    http.expectOne(url).flush({}, { status: 500, statusText: 'Server error' });
    expect(service.theme()).toBe('system');
    expect(TestBed.inject(ThemeService).theme()).toBe('system');
    expect(service.error()).toContain("haven't synced");
    expect(toast.success).not.toHaveBeenCalled();
    service.retry();
    const retry = http.expectOne(url);
    expect(retry.request.body).toEqual({ theme: 'dark' });
    retry.flush({ theme: 'dark', confetti_enabled: true });
    expect(service.error()).toBeNull();
    expect(toast.success).toHaveBeenCalledExactlyOnceWith('Preferences saved');
  });

  it('keeps cache on load failure without logging out', () => {
    localStorage.setItem(
      'hirely_preferences:a',
      JSON.stringify({ theme: 'dark', confetti_enabled: false })
    );
    const request = signIn();
    expect(service.theme()).toBe('dark');
    request.flush({}, { status: 503, statusText: 'Unavailable' });
    expect(service.theme()).toBe('dark');
    expect(service.error()).toContain('load');
    expect(currentUser()?.id).toBe('a');
    service.retry();
    http.expectOne(url).flush(DEFAULT_PREFERENCES);
    expect(service.error()).toBeNull();
  });

  it('isolates accounts and ignores responses from the previous account', () => {
    signIn().flush({ theme: 'dark', confetti_enabled: false });
    service.setTheme('light');
    const oldSave = http.expectOne(url);
    const nextLoad = signIn('b');
    expect(service.preferences()).toEqual(DEFAULT_PREFERENCES);
    oldSave.flush({ theme: 'light', confetti_enabled: false });
    expect(service.preferences()).toEqual(DEFAULT_PREFERENCES);
    expect(toast.success).not.toHaveBeenCalled();
    nextLoad.flush({ theme: 'system', confetti_enabled: true });
    currentUser.set(null);
    TestBed.tick();
    expect(service.preferences()).toEqual(DEFAULT_PREFERENCES);
    expect(service.saving()).toBe(false);
  });

  it('refreshes on returning to the tab but skips refresh while saving', () => {
    signIn().flush(DEFAULT_PREFERENCES);
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
    http.expectOne(url).flush({ theme: 'dark', confetti_enabled: false });
    expect(service.theme()).toBe('dark');
    service.setTheme('light');
    const save = http.expectOne(url);
    document.dispatchEvent(new Event('visibilitychange'));
    http.expectNone(url);
    save.flush({ theme: 'light', confetti_enabled: false });
  });
});
