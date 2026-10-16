import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { CelebrationService, CONFETTI_LOADER } from './celebration';
import { PreferencesService } from './preferences';
import { AuthService } from './auth';
import { DEFAULT_PREFERENCES } from '../models/user-preferences.model';
import { User } from '../models/user.model';

const originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');

describe('CelebrationService', () => {
  const preferences = signal({ ...DEFAULT_PREFERENCES });
  const currentUser = signal<User | null>(null);
  const stop = vi.fn();
  const confettiRain = vi.fn();
  const loadConfetti = vi.fn();
  let service: CelebrationService;
  let complete: (() => void) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    preferences.set({ ...DEFAULT_PREFERENCES });
    currentUser.set({ id: 'a', name: 'A', email: 'a@example.com', createdAt: '' });
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });
    complete = undefined;
    stop.mockImplementation(() => complete?.());
    confettiRain.mockImplementation((done) => {
      complete = done;
      return stop;
    });
    loadConfetti.mockResolvedValue({ confettiRain });
    TestBed.configureTestingModule({
      providers: [
        { provide: CONFETTI_LOADER, useValue: loadConfetti },
        { provide: PreferencesService, useValue: { preferences } },
        { provide: AuthService, useValue: { currentUser } },
      ],
    });
    service = TestBed.inject(CelebrationService);
    TestBed.tick();
  });

  afterEach(() => {
    if (originalMatchMedia) Object.defineProperty(window, 'matchMedia', originalMatchMedia);
    else Reflect.deleteProperty(window, 'matchMedia');
    complete?.();
  });

  it('celebrates an acceptance once while an animation is active', async () => {
    service.celebrateAcceptance('OFFER', 'ACCEPTED');
    service.celebrateAcceptance('INTERVIEW', 'ACCEPTED');
    await Promise.resolve();
    expect(confettiRain).toHaveBeenCalledTimes(1);
  });

  it('does not celebrate an existing acceptance or another status', async () => {
    service.celebrateAcceptance('ACCEPTED', 'ACCEPTED');
    service.celebrateAcceptance('APPLIED', 'INTERVIEW');
    await Promise.resolve();
    expect(confettiRain).not.toHaveBeenCalled();
  });

  it('respects the confetti preference and reduced motion', async () => {
    preferences.set({ ...DEFAULT_PREFERENCES, confetti_enabled: false });
    service.celebrateAcceptance('OFFER', 'ACCEPTED');
    preferences.set({ ...DEFAULT_PREFERENCES });
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList);
    service.celebrateAcceptance('OFFER', 'ACCEPTED');
    await Promise.resolve();
    expect(confettiRain).not.toHaveBeenCalled();
  });

  it('stops an active celebration when the preference is disabled', async () => {
    service.celebrateAcceptance('OFFER', 'ACCEPTED');
    await Promise.resolve();
    preferences.set({ ...DEFAULT_PREFERENCES, confetti_enabled: false });
    TestBed.tick();
    expect(stop).toHaveBeenCalledOnce();
  });

  it('stops on logout and ignores an animation still being loaded', async () => {
    service.celebrateAcceptance('OFFER', 'ACCEPTED');
    currentUser.set(null);
    TestBed.tick();
    await Promise.resolve();
    expect(confettiRain).not.toHaveBeenCalled();
  });

  it('does not propagate animation failures', async () => {
    confettiRain.mockImplementation(() => {
      throw new Error('Canvas unavailable');
    });
    service.celebrateAcceptance('OFFER', 'ACCEPTED');
    await Promise.resolve();
    expect(confettiRain).toHaveBeenCalledOnce();
  });

  it('does not propagate chunk loading failures', async () => {
    loadConfetti.mockRejectedValue(new Error('Chunk unavailable'));
    service.celebrateAcceptance('OFFER', 'ACCEPTED');
    await Promise.resolve();
    expect(confettiRain).not.toHaveBeenCalled();
  });
});
