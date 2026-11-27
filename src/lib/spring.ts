/**
 * Gesture physics for direct-manipulation UI (apple-design skill §3–§6, §9), without another animation
 * library. Springs are described the way Apple does it: damping ratio (1 = no overshoot) and response
 * (seconds to settle, roughly), not mass/stiffness. Every spring starts from the live value and the
 * current velocity, so it can be grabbed and re-targeted mid-flight without a jump.
 */

export type Spring = {
  /** Live value and velocity (units/s), read these when interrupting. */
  readonly value: number;
  readonly velocity: number;
  stop: () => void;
};

type SpringOpts = {
  from: number;
  to: number;
  /** Initial velocity in units/s, typically the pointer's release velocity. */
  velocity?: number;
  /** Damping ratio: 1 = critically damped (default); ~0.8 only after a flick. */
  damping?: number;
  /** Seconds; lower = snappier. */
  response?: number;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
};

export function spring({ from, to, velocity = 0, damping = 1, response = 0.35, onUpdate, onComplete }: SpringOpts): Spring {
  const w = (2 * Math.PI) / response; // natural frequency
  let x = from - to; // displacement from target
  let v = velocity;
  let raf = 0;
  let last = 0;
  const state = {
    get value() {
      return to + x;
    },
    get velocity() {
      return v;
    },
    stop: () => cancelAnimationFrame(raf),
  };

  // Closed-form solution of the damped spring: exact for any frame gap, so a dropped frame skips ahead
  // instead of turning the motion into slow motion. Damping is clamped to (0, 1].
  const z = Math.min(Math.max(damping, 0.05), 1);
  const advance = (t: number) => {
    const x0 = x;
    const v0 = v;
    const decay = Math.exp(-z * w * t);
    if (z >= 0.999) {
      const c = v0 + w * x0;
      x = (x0 + c * t) * decay;
      v = (v0 - w * c * t) * decay;
    } else {
      const wd = w * Math.sqrt(1 - z * z);
      const B = (v0 + z * w * x0) / wd;
      const cos = Math.cos(wd * t);
      const sin = Math.sin(wd * t);
      x = decay * (x0 * cos + B * sin);
      v = decay * ((B * wd - z * w * x0) * cos - (x0 * wd + z * w * B) * sin);
    }
  };

  const step = (now: number) => {
    const dt = last ? Math.min(0.25, (now - last) / 1000) : 1 / 60;
    last = now;
    advance(dt);
    if (Math.abs(x) < Math.max(0.0005, Math.abs(from - to) * 0.0005) && Math.abs(v) < Math.max(0.01, Math.abs(from - to) * 0.01)) {
      x = 0;
      v = 0;
      onUpdate(to);
      onComplete?.();
      return;
    }
    onUpdate(to + x);
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return state;
}

/** Where a flick would come to rest (Apple's projection; 0.998 = scroll feel, 0.99 = snappier). */
export function project(velocity: number, decelerationRate = 0.99) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Progressive resistance past a boundary: the further you pull, the less it follows. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/** Release velocity (px/s) from a short pointer history. */
export class VelocityTracker {
  private samples: { x: number; t: number }[] = [];
  add(x: number, t = performance.now()) {
    this.samples.push({ x, t });
    while (this.samples.length > 1 && t - this.samples[0].t > 100) this.samples.shift();
  }
  get velocity() {
    const s = this.samples;
    if (s.length < 2) return 0;
    const a = s[0];
    const b = s[s.length - 1];
    const dt = (b.t - a.t) / 1000;
    return dt > 0 ? (b.x - a.x) / dt : 0;
  }
  reset() {
    this.samples = [];
  }
}
