export type LevelUpParticleKind = 'SPARK' | 'STAR' | 'DIAMOND' | 'RISER';

export interface LevelUpParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  kind: LevelUpParticleKind;
  age: number;
  lifetime: number;
  twinklePhase: number;
  gravity: number;
  drag: number;
}

export interface LevelUpBurstState {
  elapsed: number;
  originX: number;
  originY: number;
  ringRadius: number;
  ringMaxRadius: number;
  ringAlpha: number;
  particles: LevelUpParticle[];
}

const GOLD_PALETTE = ['#fef08a', '#fde047', '#fbbf24', '#f59e0b', '#ffffff'];
const STAT_ACCENT_PALETTE = ['#6ee7b7', '#34d399', '#fde047', '#38bdf8', '#fef9c3'];

/**
 * Pure deterministic factory for the LevelUpToast canvas particle celebration.
 * Generates an initial golden shockwave ring, radial burst sparks/diamonds, and
 * rising twinkling pixel stars scaled to the number of stat gains achieved.
 */
export function createLevelUpBurst(
  width: number,
  height: number,
  statGainCount: number,
  rng: () => number = Math.random
): LevelUpBurstState {
  const originX = width * 0.5;
  const originY = height * 0.48;
  const clampedStats = Math.max(1, Math.min(8, statGainCount));
  const particles: LevelUpParticle[] = [];

  // 1. Radial golden celebration burst emanating from the banner's perimeter halo
  const burstCount = 28 + clampedStats * 4;
  const haloRx = width * 0.27;
  const haloRy = height * 0.2;
  for (let i = 0; i < burstCount; i++) {
    const angle = (Math.PI * 2 * i) / burstCount + (rng() - 0.5) * 0.3;
    const speed = 95 + rng() * 165;
    const kind: LevelUpParticleKind =
      i % 3 === 0 ? 'STAR' : i % 3 === 1 ? 'DIAMOND' : 'SPARK';
    const palette = i % 4 === 0 ? STAT_ACCENT_PALETTE : GOLD_PALETTE;
    particles.push({
      x: originX + Math.cos(angle) * haloRx * (0.85 + rng() * 0.25),
      y: originY + Math.sin(angle) * haloRy * (0.85 + rng() * 0.25),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * 0.7 - 22,
      size: kind === 'STAR' ? 5 : kind === 'DIAMOND' ? 4 : rng() > 0.4 ? 3 : 2,
      color: palette[Math.floor(rng() * palette.length)],
      kind,
      age: 0,
      lifetime: 0.85 + rng() * 0.95,
      twinklePhase: rng() * Math.PI * 2,
      gravity: 34,
      drag: 0.945,
    });
  }

  // 2. Ascending pixel shimmer motes & stars around the banner flanks and top rim
  const riserCount = 18 + clampedStats * 2;
  for (let i = 0; i < riserCount; i++) {
    const palette = i % 3 === 0 ? STAT_ACCENT_PALETTE : GOLD_PALETTE;
    const sideChoice = i % 3;
    const rx =
      sideChoice === 0
        ? width * (0.06 + rng() * 0.14)
        : sideChoice === 1
        ? width * (0.8 + rng() * 0.14)
        : width * (0.18 + rng() * 0.64);
    const ry =
      sideChoice === 2
        ? height * (0.16 + rng() * 0.14)
        : height * (0.42 + rng() * 0.34);
    particles.push({
      x: rx,
      y: ry,
      vx: (rng() - 0.5) * 28,
      vy: -(28 + rng() * 54),
      size: i % 2 === 0 ? 4 : 3,
      color: palette[Math.floor(rng() * palette.length)],
      kind: i % 2 === 0 ? 'STAR' : 'RISER',
      age: -(rng() * 0.65), // Staggered emergence across the first 0.65s
      lifetime: 1.25 + rng() * 1.2,
      twinklePhase: rng() * Math.PI * 2,
      gravity: -6,
      drag: 0.985,
    });
  }

  return {
    elapsed: 0,
    originX,
    originY,
    ringRadius: 24,
    ringMaxRadius: Math.min(width * 0.48, 290),
    ringAlpha: 0.92,
    particles,
  };
}

/**
 * Pure physics integrator for LevelUpToast canvas particles and shockwave ring.
 * Advances simulation by dt seconds and prunes expired particles.
 */
export function stepLevelUpBurst(state: LevelUpBurstState, dt: number): LevelUpBurstState {
  const safeDt = Math.max(0, Math.min(0.1, dt));
  const nextElapsed = state.elapsed + safeDt;

  // Expanding golden shockwave ring completes over ~0.48s
  const ringProgress = Math.min(1, nextElapsed / 0.48);
  const easedRing = 1 - Math.pow(1 - ringProgress, 3);
  const ringRadius = 18 + (state.ringMaxRadius - 18) * easedRing;
  const ringAlpha = ringProgress >= 1 ? 0 : (1 - ringProgress) * 0.85;

  const nextParticles: LevelUpParticle[] = [];
  for (const p of state.particles) {
    const nextAge = p.age + safeDt;
    if (nextAge >= p.lifetime) continue;

    if (nextAge < 0) {
      // Waiting for staggered spawn
      nextParticles.push({ ...p, age: nextAge });
      continue;
    }

    const dragFactor = Math.pow(p.drag, safeDt * 60);
    const vx = p.vx * dragFactor;
    const vy = (p.vy + p.gravity * safeDt) * dragFactor;

    nextParticles.push({
      ...p,
      x: p.x + vx * safeDt,
      y: p.y + vy * safeDt,
      vx,
      vy,
      age: nextAge,
    });
  }

  return {
    ...state,
    elapsed: nextElapsed,
    ringRadius,
    ringAlpha,
    particles: nextParticles,
  };
}
