import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { PreferencesService } from '../../core/services/preferences';
import { Profile } from './profile';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  const preferences = {
    preferences: signal({ theme: 'system', confetti_enabled: true }),
    theme: signal('system'),
    loading: signal(false),
    saving: signal(false),
    error: signal<string | null>(null),
    setTheme: vi.fn(),
    update: vi.fn(),
    retry: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    preferences.loading.set(false);
    preferences.error.set(null);
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: PreferencesService, useValue: preferences },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows preference controls and saves changes', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('sign in on another device');
    const theme = element.querySelector<HTMLSelectElement>('#preferred-theme')!;
    expect(Array.from(theme.options).map((option) => option.value)).toEqual([
      'light',
      'dark',
      'system',
    ]);
    theme.value = 'dark';
    theme.dispatchEvent(new Event('change'));
    expect(preferences.setTheme).toHaveBeenCalledWith('dark');
    const confetti = element.querySelector<HTMLInputElement>('#confetti-enabled')!;
    confetti.click();
    expect(preferences.update).toHaveBeenCalledWith({ confetti_enabled: false });
  });

  it('shows loading placeholders and retry after failure', () => {
    preferences.loading.set(true);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[aria-label="Loading preferences"]')).toBeTruthy();
    preferences.loading.set(false);
    preferences.error.set('Could not save preferences.');
    fixture.detectChanges();
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Could not save');
    element.querySelector<HTMLButtonElement>('button[hlmBtn]')!.click();
    expect(preferences.retry).toHaveBeenCalledOnce();
  });
});
