import { vi } from 'vitest';
import { confettiRain } from './confetti-rain';

const originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');

describe('confettiRain', () => {
  const context = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    save: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    fillRect: vi.fn(),
    restore: vi.fn(),
  };
  let callback: FrameRequestCallback;
  let motionChange: (() => void) | undefined;
  let reducedMotion: boolean;

  beforeEach(() => {
    vi.clearAllMocks();
    reducedMotion = false;
    motionChange = undefined;
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D
    );
    vi.spyOn(performance, 'now').mockReturnValue(0);
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((fn: FrameRequestCallback) => {
        callback = fn;
        return 1;
      })
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn(() => ({
        get matches() {
          return reducedMotion;
        },
        addEventListener: (_event: string, listener: () => void) => {
          motionChange = listener;
        },
        removeEventListener: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    if (originalMatchMedia) Object.defineProperty(window, 'matchMedia', originalMatchMedia);
    else Reflect.deleteProperty(window, 'matchMedia');
    document.querySelectorAll('canvas').forEach((canvas) => canvas.remove());
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('draws from the top without intercepting clicks and cleans up after three seconds', () => {
    const done = vi.fn();
    confettiRain(done);
    const canvas = document.querySelector('canvas')!;
    expect(canvas.getAttribute('aria-hidden')).toBe('true');
    expect(canvas.style.pointerEvents).toBe('none');
    callback(100);
    expect(context.fillRect).toHaveBeenCalled();
    expect(context.translate.mock.calls[0][1]).toBeGreaterThan(-12);
    callback(3000);
    expect(document.querySelector('canvas')).toBeNull();
    expect(done).toHaveBeenCalledOnce();
  });

  it('cancels and cleans up if reduced motion is enabled during the animation', () => {
    const done = vi.fn();
    const stop = confettiRain(done);
    reducedMotion = true;
    motionChange?.();
    stop();
    expect(document.querySelector('canvas')).toBeNull();
    expect(done).toHaveBeenCalledOnce();
  });

  it('finishes harmlessly when canvas is unavailable', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const done = vi.fn();
    confettiRain(done)();
    expect(document.querySelector('canvas')).toBeNull();
    expect(done).toHaveBeenCalledOnce();
  });
});
