import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'hirely_theme';
  readonly theme = signal<ThemeMode>('system');

  constructor() {
    this.initTheme();
  }

  private initTheme() {
    if (typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY) as ThemeMode;
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        this.theme.set(savedTheme);
      } else {
        this.theme.set('system');
      }
    }
    this.applyTheme(this.theme());

    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.theme() === 'system') {
          this.applyTheme('system');
        }
      });
    }
  }

  setTheme(mode: ThemeMode) {
    this.theme.set(mode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, mode);
    }
    this.applyTheme(mode);
  }

  toggleTheme() {
    const current = this.theme();
    if (current === 'system') {
      this.setTheme('light');
    } else if (current === 'light') {
      this.setTheme('dark');
    } else {
      this.setTheme('system');
    }
  }

  private applyTheme(mode: ThemeMode) {
    if (typeof document === 'undefined') return;

    const isDark =
      mode === 'dark' ||
      (mode === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
