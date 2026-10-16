interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  color: string;
}

// Loaded only when celebrating an accepted application.
export function confettiRain(onComplete: () => void): () => void {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    onComplete();
    return () => {
      /* No canvas was created. */
    };
  }
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:10000';
  const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let width = 0;
  let height = 0;
  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  const colors = ['#6366f1', '#f59e0b', '#ec4899', '#10b981', '#38bdf8'];
  const particles: Particle[] = [];
  const started = performance.now();
  let previous = started;
  let frame = 0;
  let finished = false;
  let emission = 0;
  const stop = () => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
    motion?.removeEventListener('change', onMotionChange);
    canvas.remove();
    onComplete();
  };
  const onMotionChange = () => {
    if (motion?.matches) stop();
  };
  const animate = (now: number) => {
    if (finished) return;
    if (now - started >= 3000) {
      stop();
      return;
    }
    try {
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      context.clearRect(0, 0, width, height);
      // Stop emission early enough for the final particles to fade away.
      if (now - started < 2200) {
        emission += dt * 85;
        while (emission >= 1) {
          emission--;
          particles.push({
            x: Math.random() * width,
            y: -12,
            vx: (Math.random() - 0.5) * 65,
            vy: height * (0.4 + Math.random() * 0.25),
            size: 5 + Math.random() * 5,
            rotation: Math.random() * Math.PI,
            spin: (Math.random() - 0.5) * 8,
            color: colors[Math.floor(Math.random() * colors.length)],
          });
        }
      }
      context.globalAlpha = Math.min(1, (3000 - (now - started)) / 500);
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.rotation += particle.spin * dt;
        if (particle.y > height + 15) {
          particles.splice(i, 1);
          continue;
        }
        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.fillStyle = particle.color;
        context.fillRect(
          -particle.size / 2,
          -particle.size / 3,
          particle.size,
          particle.size * 0.65
        );
        context.restore();
      }
      frame = requestAnimationFrame(animate);
    } catch {
      stop();
    }
  };
  resize();
  document.body.append(canvas);
  window.addEventListener('resize', resize);
  motion?.addEventListener('change', onMotionChange);
  if (motion?.matches) stop();
  else frame = requestAnimationFrame(animate);
  return stop;
}
