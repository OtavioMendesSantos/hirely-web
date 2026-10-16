import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { toast } from '@spartan-ng/brain/sonner';
import { environment } from '../../../environments/environment';
import { DEFAULT_PREFERENCES, UserPreferences } from '../models/user-preferences.model';
import { AuthService } from './auth';
import { ThemeMode, ThemeService } from './theme';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly appearance = inject(ThemeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly url = `${environment.apiUrl}/users/me/preferences`;
  private userId: string | null = null;
  private generation = 0;
  private revision = 0;
  private confirmed: UserPreferences = { ...DEFAULT_PREFERENCES };
  private queue: Partial<UserPreferences>[] = [];
  private failedPatch: Partial<UserPreferences> | null = null;
  private loadPending = false;

  readonly preferences = signal<UserPreferences>({ ...DEFAULT_PREFERENCES });
  readonly theme = computed(() => this.preferences().theme);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const userId = this.auth.currentUser()?.id ?? null;
      untracked(() => {
        if (userId !== this.userId) this.switchUser(userId);
      });
    });
    const onVisible = () => {
      if (document.visibilityState === 'visible') this.load();
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisible);
      this.destroyRef.onDestroy(() => document.removeEventListener('visibilitychange', onVisible));
    }
    this.destroyRef.onDestroy(() => this.generation++);
  }

  private switchUser(userId: string | null) {
    this.generation++;
    this.revision++;
    this.userId = userId;
    this.queue = [];
    this.failedPatch = null;
    this.loadPending = false;
    this.loading.set(false);
    this.saving.set(false);
    this.error.set(null);
    this.confirmed = this.readCache(userId);
    this.apply(this.confirmed);
    if (userId) this.load();
  }

  load() {
    if (!this.userId || this.saving() || this.loadPending) return;
    const generation = this.generation;
    const revision = this.revision;
    this.loadPending = true;
    this.loading.set(true);
    this.http.get<UserPreferences>(this.url).subscribe({
      next: (preferences) => {
        if (generation !== this.generation || this.auth.currentUser()?.id !== this.userId) return;
        this.loadPending = false;
        this.loading.set(false);
        if (revision !== this.revision || this.saving()) return;
        this.confirmed = preferences;
        this.failedPatch = null;
        this.apply(preferences);
        this.writeCache(preferences);
        this.error.set(null);
      },
      error: () => {
        if (generation !== this.generation || this.auth.currentUser()?.id !== this.userId) return;
        this.loadPending = false;
        this.loading.set(false);
        if (revision === this.revision)
          this.error.set("Couldn't load your preferences. Try again.");
      },
    });
  }

  update(patch: Partial<UserPreferences>) {
    // Auth may have changed before Angular has run the synchronization effect.
    const userId = this.auth.currentUser()?.id ?? null;
    if (userId !== this.userId) this.switchUser(userId);
    this.revision++;
    this.error.set(null);
    this.failedPatch = null;
    this.apply({ ...this.preferences(), ...patch });
    if (!this.userId) return;
    this.queue.push(patch);
    if (!this.saving()) {
      this.saving.set(true);
      this.saveNext();
    }
  }

  setTheme(mode: ThemeMode) {
    this.update({ theme: mode });
  }

  toggleTheme() {
    const current = this.theme();
    this.setTheme(current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system');
  }

  retry() {
    if (this.failedPatch) this.update(this.failedPatch);
    else this.load();
  }

  private saveNext() {
    const generation = this.generation;
    const patch = this.queue[0];
    this.http.patch<UserPreferences>(this.url, patch).subscribe({
      next: (preferences) => {
        if (generation !== this.generation || this.auth.currentUser()?.id !== this.userId) return;
        this.confirmed = preferences;
        this.finishSave();
      },
      error: () => {
        if (generation !== this.generation || this.auth.currentUser()?.id !== this.userId) return;
        this.failedPatch = patch;
        this.error.set("Couldn't save your changes. They haven't synced to your account.");
        toast.error("Couldn't save your changes. Try again.");
        this.finishSave();
      },
    });
  }

  private finishSave() {
    this.queue.shift();
    const pending = this.queue.reduce<UserPreferences>(
      (value, patch) => ({ ...value, ...patch }),
      this.confirmed
    );
    this.apply(pending);
    this.writeCache(this.confirmed);
    if (this.queue.length) this.saveNext();
    else {
      this.saving.set(false);
      if (!this.error()) toast.success('Preferences saved');
    }
  }

  private apply(preferences: UserPreferences) {
    this.preferences.set({ ...preferences });
    this.appearance.setTheme(preferences.theme);
  }

  private readCache(userId: string | null): UserPreferences {
    if (!userId) return { ...DEFAULT_PREFERENCES };
    try {
      const raw = localStorage.getItem(`hirely_preferences:${userId}`);
      const cached = raw ? JSON.parse(raw) : null;
      if (
        cached &&
        ['light', 'dark', 'system'].includes(cached.theme) &&
        typeof cached.confetti_enabled === 'boolean'
      ) {
        return { theme: cached.theme, confetti_enabled: cached.confetti_enabled };
      }
    } catch {
      /* Storage can be unavailable or contain an older value. */
    }
    return { ...DEFAULT_PREFERENCES };
  }

  private writeCache(preferences: UserPreferences) {
    if (!this.userId) return;
    try {
      localStorage.setItem(`hirely_preferences:${this.userId}`, JSON.stringify(preferences));
    } catch {
      /* Saving to the account still works when browser storage is unavailable. */
    }
  }
}
