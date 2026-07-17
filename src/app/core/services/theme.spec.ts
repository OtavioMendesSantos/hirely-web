import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme';
import { vi } from 'vitest';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('hirely_theme');
    }
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
    }

    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create with default system mode', () => {
    expect(service).toBeTruthy();
    expect(service.theme()).toBe('system');
  });

  it('should change theme mode and persist to localStorage when setTheme is called', () => {
    service.setTheme('dark');
    expect(service.theme()).toBe('dark');
    if (typeof localStorage !== 'undefined') {
      expect(localStorage.getItem('hirely_theme')).toBe('dark');
    }
    if (typeof document !== 'undefined') {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    }
  });

  it('should cycle between system -> light -> dark -> system when toggleTheme is called', () => {
    expect(service.theme()).toBe('system');

    service.toggleTheme();
    expect(service.theme()).toBe('light');
    if (typeof document !== 'undefined') {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    }

    service.toggleTheme();
    expect(service.theme()).toBe('dark');
    if (typeof document !== 'undefined') {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    }

    service.toggleTheme();
    expect(service.theme()).toBe('system');
  });
});
