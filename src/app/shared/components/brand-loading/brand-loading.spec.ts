import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { BrandLoadingComponent } from './brand-loading';

const player = vi.hoisted(() => ({
  loadAnimation: vi.fn(),
  animation: { goToAndStop: vi.fn(), play: vi.fn(), destroy: vi.fn(), addEventListener: vi.fn() },
}));
vi.mock('lottie-web/build/player/lottie_light', () => ({
  default: { loadAnimation: player.loadAnimation },
}));

const originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');

describe('BrandLoadingComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    player.loadAnimation.mockReturnValue(player.animation);
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ fr: 30, op: 72 }) })
    );
    TestBed.configureTestingModule({ imports: [BrandLoadingComponent] });
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
    if (originalMatchMedia) Object.defineProperty(window, 'matchMedia', originalMatchMedia);
    else Reflect.deleteProperty(window, 'matchMedia');
  });

  it('uses a complete static frame for reduced motion and destroys the player on exit', async () => {
    const fixture = TestBed.createComponent(BrandLoadingComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await vi.waitFor(() => expect(player.loadAnimation).toHaveBeenCalled());
    expect(player.loadAnimation).toHaveBeenCalledWith(expect.objectContaining({ autoplay: false }));
    expect(player.animation.goToAndStop).toHaveBeenCalledWith(60, true);
    fixture.destroy();
    expect(player.animation.destroy).toHaveBeenCalledOnce();
  });

  it('keeps the SVG fallback when an animation asset fails to load', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('offline'));
    const fixture = TestBed.createComponent(BrandLoadingComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.ready()).toBe(false);
    expect(fixture.nativeElement.querySelector('app-brand')).toBeTruthy();
    expect(player.loadAnimation).not.toHaveBeenCalled();
  });
});
