import {
  getUnitSpriteSheet,
  SPRITE_H,
  SPRITE_SHEET_COLS,
  SPRITE_W,
  type SpriteAnimFrame,
  type SpriteAnimState,
} from './pixelSprites';
import { TITLES } from './catalogTitles';
import type { CombatSpeechBubble } from './battleQuotes';
import { getUnitEquipmentBonuses } from './equipmentSystem';
import type { BiomeId, TerrainType, TileCoord, TitleDef, Unit, WeatherType } from './types';

export interface UnitAnimationFrame {
  state: SpriteAnimState;
  row: 0 | 1 | 2;
  col: SpriteAnimFrame;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  offsetY: number;
  shadowScale: number;
  breathScaleX: number;
  breathScaleY: number;
}

function hashUnitPhase(unitId: string): number {
  let h = 2166136261;
  for (let i = 0; i < unitId.length; i++) {
    h ^= unitId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 250; // Deterministic 0..4s phase offset per unit
}

export interface TitleAuraVisual {
  rarity: Exclude<TitleDef['rarity'], 'COMMON'>;
  titleId: string;
  titleName: string;
  outerColor: string;
  innerColor: string;
  accentColor: string;
  sparkColor: string;
  glowRgba: string;
  ringWidth: number;
  orbCount: number;
  orbitSpeed: number;
  pulse: number;
  phaseOffset: number;
  radiusScale: number;
  hasDoubleRing: boolean;
  hasRisingMotes: boolean;
}

/**
 * Pure deterministic Title Foot Aura resolver.
 * Returns null for untitled or COMMON-title units; returns distinct color/geometry
 * profiles for high-tier titles: RARE (Tinh Anh), EPIC (Sử Thi), and MYTHIC (Thần Thoại).
 */
export function computeTitleAuraVisual(
  unit: Pick<Unit, 'id' | 'equippedTitleId'>,
  timeSec: number
): TitleAuraVisual | null {
  if (!unit.equippedTitleId) return null;
  const title = TITLES[unit.equippedTitleId];
  if (!title || title.rarity === 'COMMON') return null;

  const phaseOffset = hashUnitPhase(unit.id);
  const pulse = 0.65 + 0.35 * Math.sin(timeSec * 3.8 + phaseOffset * 1.9);

  if (title.rarity === 'RARE') {
    return {
      rarity: 'RARE',
      titleId: title.id,
      titleName: title.name,
      outerColor: '#38bdf8',
      innerColor: '#bae6fd',
      accentColor: '#0284c7',
      sparkColor: '#e0f2fe',
      glowRgba: 'rgba(56, 189, 248, 0.34)',
      ringWidth: 1.8,
      orbCount: 3,
      orbitSpeed: 1.7,
      pulse,
      phaseOffset,
      radiusScale: 0.36,
      hasDoubleRing: false,
      hasRisingMotes: false,
    };
  }

  if (title.rarity === 'EPIC') {
    return {
      rarity: 'EPIC',
      titleId: title.id,
      titleName: title.name,
      outerColor: '#c084fc',
      innerColor: '#f5d0fe',
      accentColor: '#9333ea',
      sparkColor: '#fdf4ff',
      glowRgba: 'rgba(168, 85, 247, 0.42)',
      ringWidth: 2.1,
      orbCount: 5,
      orbitSpeed: 2.25,
      pulse,
      phaseOffset,
      radiusScale: 0.4,
      hasDoubleRing: true,
      hasRisingMotes: true,
    };
  }

  // MYTHIC (Thần Thoại) — Solar Gold & Royal Crimson Celestial Halo
  return {
    rarity: 'MYTHIC',
    titleId: title.id,
    titleName: title.name,
    outerColor: '#fbbf24',
    innerColor: '#fef08a',
    accentColor: '#f43f5e',
    sparkColor: '#ffffff',
    glowRgba: 'rgba(251, 191, 36, 0.48)',
    ringWidth: 2.4,
    orbCount: 7,
    orbitSpeed: 2.8,
    pulse,
    phaseOffset,
    radiusScale: 0.44,
    hasDoubleRing: true,
    hasRisingMotes: true,
  };
}

/**
 * Pure deterministic sprite-sheet frame & idle-breathing animation resolver.
 * Maps a unit's state (idle / selected / walk) and clock time onto the exact
 * (sx, sy, sw, sh) frame rectangle inside the 4x3 character sprite sheet,
 * plus subtle vertical breathing/hover offsets and grounded shadow scaling.
 */
export function computeUnitAnimationFrame(
  unit: Pick<Unit, 'id' | 'moveType' | 'acted' | 'faction'>,
  timeSec: number,
  isSelected: boolean,
  isWalking: boolean
): UnitAnimationFrame {
  const phaseOffset = hashUnitPhase(unit.id);
  const state: SpriteAnimState = isWalking ? 'walk' : isSelected ? 'selected' : 'idle';
  const row: 0 | 1 | 2 = state === 'walk' ? 2 : state === 'selected' ? 1 : 0;

  // Frame cadence: brisk march when walking, lively ready bounce when selected, calm breathing when idle
  const fps =
    state === 'walk'
      ? 10.5
      : state === 'selected'
      ? 6.4
      : unit.acted && unit.faction === 'PLAYER'
      ? 1.8
      : 3.4;

  const rawIndex = Math.floor((timeSec + phaseOffset) * fps);
  const col = (((rawIndex % SPRITE_SHEET_COLS) + SPRITE_SHEET_COLS) % SPRITE_SHEET_COLS) as SpriteAnimFrame;

  const breathCycle = Math.sin((timeSec + phaseOffset) * (unit.acted ? 2.2 : 4.2));
  const isFlying = unit.moveType === 'FLYING';

  let offsetY = 0;
  let shadowScale = 1;
  let breathScaleX = 1;
  let breathScaleY = 1;

  if (state === 'walk') {
    const hop = Math.abs(Math.sin(timeSec * 15));
    offsetY = Math.round(-hop * 4.5);
    shadowScale = 1 - hop * 0.14;
  } else if (state === 'selected') {
    const bounce = Math.abs(Math.sin((timeSec + phaseOffset) * 8));
    offsetY = Math.round(-bounce * (isFlying ? 4 : 2.5));
    shadowScale = 1 - bounce * 0.1;
    breathScaleY = 1 + bounce * 0.02;
    breathScaleX = 1 - bounce * 0.012;
  } else if (isFlying) {
    // Smooth rhythmic hovering for Wyvern Riders & Pegasus Knights
    const hover = Math.sin((timeSec + phaseOffset) * 4.4);
    offsetY = Math.round(-2 + hover * 2.5);
    shadowScale = 0.88 + hover * 0.08;
  } else {
    // Subtle organic breathing motion while standing idle
    offsetY = breathCycle > 0.45 ? -1 : 0;
    breathScaleY = 1 + breathCycle * 0.018;
    breathScaleX = 1 - breathCycle * 0.012;
    shadowScale = 1 - breathCycle * 0.04;
  }

  return {
    state,
    row,
    col,
    sx: col * SPRITE_W,
    sy: row * SPRITE_H,
    sw: SPRITE_W,
    sh: SPRITE_H,
    offsetY,
    shadowScale,
    breathScaleX,
    breathScaleY,
  };
}

export interface ImpactParticle {
  tileX: number;
  tileY: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  gravity: number;
  size: number;
  color: string;
  age: number;
  maxAge: number;
  kind: 'SPARK' | 'EMBER' | 'SHARD';
}

export interface ImpactShockwave {
  tileX: number;
  tileY: number;
  age: number;
  maxAge: number;
  color: string;
  isCrit: boolean;
}

export interface ScreenShakeState {
  remaining: number;
  duration: number;
  intensity: number;
}

/**
 * Pure helper generating a crisp radial pixel-art particle burst for critical strikes
 * (34 high-energy golden/crimson/white sparks, shards & embers) or normal hits (10 sparks).
 */
export function createCritImpactParticles(
  tileX: number,
  tileY: number,
  isCrit: boolean,
  accentColor = '#fbbf24',
  rng: () => number = Math.random
): ImpactParticle[] {
  const particles: ImpactParticle[] = [];
  const count = isCrit ? 34 : 10;
  const critPalette = ['#ffffff', '#fef08a', accentColor, '#f97316', '#ef4444'];
  const hitPalette = ['#ffffff', '#fef08a', accentColor];

  for (let i = 0; i < count; i++) {
    const baseAngle = (Math.PI * 2 * i) / count;
    const angle = baseAngle + (rng() - 0.5) * 0.45;
    const speed = isCrit ? 1.8 + rng() * 3.8 : 0.9 + rng() * 1.9;
    const palette = isCrit ? critPalette : hitPalette;
    const color = palette[Math.floor(rng() * palette.length) % palette.length];
    const kind: ImpactParticle['kind'] = isCrit
      ? i % 3 === 0
        ? 'SPARK'
        : i % 3 === 1
        ? 'SHARD'
        : 'EMBER'
      : 'SPARK';

    particles.push({
      tileX,
      tileY,
      ox: (rng() - 0.5) * 0.18,
      oy: (rng() - 0.5) * 0.18,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (isCrit ? 0.55 : 0.25),
      gravity: kind === 'EMBER' ? -0.8 : isCrit ? 4.2 : 2.6,
      size: isCrit ? (kind === 'SPARK' ? 5 : 4) : 3,
      color,
      age: 0,
      maxAge: isCrit ? 0.34 + rng() * 0.32 : 0.2 + rng() * 0.16,
      kind,
    });
  }
  return particles;
}

/**
 * Pure physics integrator for battlefield impact particles.
 */
export function stepImpactParticles(particles: ImpactParticle[], dt: number): ImpactParticle[] {
  if (particles.length === 0 || dt <= 0) return particles;
  const drag = Math.pow(0.18, dt);
  const next: ImpactParticle[] = [];
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const age = p.age + dt;
    if (age >= p.maxAge) continue;
    const vx = p.vx * drag;
    const vy = p.vy * drag + p.gravity * dt;
    next.push({
      ...p,
      ox: p.ox + vx * dt,
      oy: p.oy + vy * dt,
      vx,
      vy,
      age,
    });
  }
  return next;
}

/**
 * Pure damped screen-shake displacement calculator.
 * Uses quadratic decay with dual-frequency oscillation for crisp, punchy impact feedback.
 */
export function computeScreenShakeOffset(
  shake: ScreenShakeState,
  timeSec: number
): { dx: number; dy: number } {
  if (shake.remaining <= 0 || shake.duration <= 0 || shake.intensity <= 0) {
    return { dx: 0, dy: 0 };
  }
  const progress = Math.max(0, Math.min(1, shake.remaining / shake.duration));
  const mag = shake.intensity * Math.pow(progress, 1.5);
  const dx = Math.round(Math.sin(timeSec * 84) * mag);
  const dy = Math.round(Math.cos(timeSec * 68) * mag * 0.72);
  return { dx, dy };
}

export interface FloatingText {
  text: string;
  x: number;
  y: number;
  color: string;
  age: number;
  duration: number;
}

export interface MovingSpriteState {
  unitId: string;
  path: TileCoord[];
  progress: number;
}

export interface TacticalRenderState {
  grid: TerrainType[][];
  biome: BiomeId;
  weather: WeatherType;
  units: Unit[];
  cursor: TileCoord;
  selectedUnitId: string | null;
  reachableTiles: Map<string, number>;
  actionRangeTiles: Set<string>;
  actionRangeKind: 'ATTACK' | 'HEAL';
  targetableUnitIds: Set<string>;
  dangerZone: Set<string>;
  showDangerZone: boolean;
  previewPath: TileCoord[];
  movingSprite: MovingSpriteState | null;
  floatingTexts: FloatingText[];
  combatBubbles?: CombatSpeechBubble[];
  throneCoord: TileCoord;
  isDeployment?: boolean;
  deploymentSlots?: TileCoord[];
  swapSourceCoord?: TileCoord | null;
}

interface BiomePalette {
  bg: string;
  // Hue-shifted terrain ramps (cool shadows -> warm sunlit highlights)
  grassShadow: string;
  grassMid: string;
  grassLight: string;
  grassSpec: string;
  flowerA: string;
  flowerB: string;
  roadBorder: string;
  roadDark: string;
  roadMid: string;
  roadLight: string;
  treeDeep: string;
  treeShadow: string;
  treeMid: string;
  treeLight: string;
  treeSpec: string;
  barkDark: string;
  barkLight: string;
  waterRim: string;
  waterShallow: string;
  waterDeep: string;
  waterFoam: string;
  wallShadow: string;
  wallDark: string;
  wallMid: string;
  wallTop: string;
  wallSpec: string;
  mountShadow: string;
  mountMid: string;
  mountLit: string;
  mountPeak: string;
  sunBeam: string;
  ambientTint: string;
}

const BIOME_PALETTES: Record<BiomeId, BiomePalette> = {
  VALORIA_PLAINS: {
    bg: '#0c121b',
    grassShadow: '#2a4d34',
    grassMid: '#3f7242',
    grassLight: '#5a944a',
    grassSpec: '#88bd5c',
    flowerA: '#fde047',
    flowerB: '#f8fafc',
    roadBorder: '#524637',
    roadDark: '#7a6952',
    roadMid: '#a18d70',
    roadLight: '#c4b191',
    treeDeep: '#102624',
    treeShadow: '#1b4032',
    treeMid: '#2f693e',
    treeLight: '#52964b',
    treeSpec: '#8bc961',
    barkDark: '#3b2419',
    barkLight: '#6b442a',
    waterRim: '#2e473d',
    waterShallow: '#287799',
    waterDeep: '#1a4f73',
    waterFoam: '#9be4f5',
    wallShadow: '#212736',
    wallDark: '#3d465c',
    wallMid: '#64708a',
    wallTop: '#9aa7c2',
    wallSpec: '#cfd9eb',
    mountShadow: '#383033',
    mountMid: '#63544e',
    mountLit: '#948073',
    mountPeak: '#cfc2b4',
    sunBeam: 'rgba(255, 232, 165, 0.055)',
    ambientTint: 'rgba(255, 224, 150, 0.03)',
  },
  ELDWOOD_FOREST: {
    bg: '#081114',
    grassShadow: '#19362e',
    grassMid: '#285240',
    grassLight: '#3c7354',
    grassSpec: '#63a372',
    flowerA: '#6ee7b7',
    flowerB: '#e0f2fe',
    roadBorder: '#3b3933',
    roadDark: '#595449',
    roadMid: '#7d7564',
    roadLight: '#a39984',
    treeDeep: '#0a1c1c',
    treeShadow: '#12302c',
    treeMid: '#1f4f42',
    treeLight: '#377a61',
    treeSpec: '#68b58b',
    barkDark: '#2b1f1a',
    barkLight: '#523b30',
    waterRim: '#1c383b',
    waterShallow: '#23667a',
    waterDeep: '#143f52',
    waterFoam: '#88d6e3',
    wallShadow: '#1c2429',
    wallDark: '#34424a',
    wallMid: '#556973',
    wallTop: '#859ca6',
    wallSpec: '#b8ccd4',
    mountShadow: '#2a3033',
    mountMid: '#4c575c',
    mountLit: '#78878c',
    mountPeak: '#b0bfc4',
    sunBeam: 'rgba(130, 235, 210, 0.05)',
    ambientTint: 'rgba(110, 210, 195, 0.05)',
  },
  HOWLING_CANYON: {
    bg: '#161012',
    grassShadow: '#4f3f33',
    grassMid: '#735c47',
    grassLight: '#94785b',
    grassSpec: '#ba9a75',
    flowerA: '#fbbf24',
    flowerB: '#fdba74',
    roadBorder: '#47362b',
    roadDark: '#6b5544',
    roadMid: '#967c63',
    roadLight: '#bda184',
    treeDeep: '#1f291c',
    treeShadow: '#2f4228',
    treeMid: '#4c6638',
    treeLight: '#73914d',
    treeSpec: '#a3bd6d',
    barkDark: '#362118',
    barkLight: '#633e2b',
    waterRim: '#4a3d33',
    waterShallow: '#2d6882',
    waterDeep: '#1c445c',
    waterFoam: '#9bd2e8',
    wallShadow: '#2e2422',
    wallDark: '#52403c',
    wallMid: '#7a625c',
    wallTop: '#ad938b',
    wallSpec: '#d9c2ba',
    mountShadow: '#3d2822',
    mountMid: '#734d3d',
    mountLit: '#a8785d',
    mountPeak: '#deb395',
    sunBeam: 'rgba(255, 196, 128, 0.055)',
    ambientTint: 'rgba(245, 175, 110, 0.04)',
  },
  SOLARA_DESERT: {
    bg: '#19120b',
    grassShadow: '#8c6838',
    grassMid: '#ba9052',
    grassLight: '#d4ac6a',
    grassSpec: '#edd093',
    flowerA: '#fef08a',
    flowerB: '#fca5a5',
    roadBorder: '#694d2c',
    roadDark: '#8f6c41',
    roadMid: '#b58f5e',
    roadLight: '#d9b784',
    treeDeep: '#1f3318',
    treeShadow: '#2f5222',
    treeMid: '#4c7a30',
    treeLight: '#78ab46',
    treeSpec: '#b0d96c',
    barkDark: '#472c18',
    barkLight: '#784e2d',
    waterRim: '#8a6d43',
    waterShallow: '#2694a3',
    waterDeep: '#186375',
    waterFoam: '#a7f0f5',
    wallShadow: '#423020',
    wallDark: '#735539',
    wallMid: '#a37d56',
    wallTop: '#cfb082',
    wallSpec: '#f0dbb4',
    mountShadow: '#4f331d',
    mountMid: '#8a5b37',
    mountLit: '#bf8756',
    mountPeak: '#ebd995',
    sunBeam: 'rgba(255, 220, 130, 0.07)',
    ambientTint: 'rgba(255, 195, 95, 0.05)',
  },
  BLACKMIST_HARBOR: {
    bg: '#090e17',
    grassShadow: '#26343d',
    grassMid: '#3a4d59',
    grassLight: '#506775',
    grassSpec: '#728c9c',
    flowerA: '#93c5fd',
    flowerB: '#cbd5e1',
    roadBorder: '#282d38',
    roadDark: '#464e5e',
    roadMid: '#687387',
    roadLight: '#8f9bb0',
    treeDeep: '#0d1c21',
    treeShadow: '#183338',
    treeMid: '#285257',
    treeLight: '#427a7d',
    treeSpec: '#6ea8a8',
    barkDark: '#261e1c',
    barkLight: '#473935',
    waterRim: '#1c2b3b',
    waterShallow: '#1f4e75',
    waterDeep: '#112d4a',
    waterFoam: '#8ac4eb',
    wallShadow: '#1a1f29',
    wallDark: '#333d4f',
    wallMid: '#55637a',
    wallTop: '#8596b0',
    wallSpec: '#b8c8e0',
    mountShadow: '#232833',
    mountMid: '#434c5e',
    mountLit: '#6c7991',
    mountPeak: '#a4b2c9',
    sunBeam: 'rgba(130, 180, 245, 0.05)',
    ambientTint: 'rgba(95, 145, 220, 0.06)',
  },
  DARKSEAL_SWAMP: {
    bg: '#0f0c17',
    grassShadow: '#242b29',
    grassMid: '#37423a',
    grassLight: '#4d5c4c',
    grassSpec: '#708264',
    flowerA: '#c084fc',
    flowerB: '#86efac',
    roadBorder: '#2a2433',
    roadDark: '#453d52',
    roadMid: '#645a75',
    roadLight: '#887c9c',
    treeDeep: '#110d1c',
    treeShadow: '#211936',
    treeMid: '#362957',
    treeLight: '#584485',
    treeSpec: '#856bb8',
    barkDark: '#211924',
    barkLight: '#3f3045',
    waterRim: '#241e33',
    waterShallow: '#42366b',
    waterDeep: '#261f42',
    waterFoam: '#a892db',
    wallShadow: '#1c1824',
    wallDark: '#362f45',
    wallMid: '#574c6e',
    wallTop: '#8678a3',
    wallSpec: '#b8acd4',
    mountShadow: '#221c2b',
    mountMid: '#413752',
    mountLit: '#695c80',
    mountPeak: '#9c8eb5',
    sunBeam: 'rgba(175, 120, 245, 0.055)',
    ambientTint: 'rgba(135, 85, 210, 0.06)',
  },
  FROSTPEAK_TUNDRA: {
    bg: '#0b131f',
    grassShadow: '#5b7691',
    grassMid: '#809db8',
    grassLight: '#a6c2db',
    grassSpec: '#d9ecfa',
    flowerA: '#7dd3fc',
    flowerB: '#ffffff',
    roadBorder: '#3b4859',
    roadDark: '#55657a',
    roadMid: '#778aa3',
    roadLight: '#9fb4cf',
    treeDeep: '#102430',
    treeShadow: '#1c3f4f',
    treeMid: '#2e6375',
    treeLight: '#5292a3',
    treeSpec: '#bfe5f2',
    barkDark: '#2e2421',
    barkLight: '#54433d',
    waterRim: '#486680',
    waterShallow: '#2b709e',
    waterDeep: '#184469',
    waterFoam: '#c4ecfc',
    wallShadow: '#263342',
    wallDark: '#44576e',
    wallMid: '#6b829e',
    wallTop: '#a2b9d4',
    wallSpec: '#dceafa',
    mountShadow: '#344459',
    mountMid: '#5b718c',
    mountLit: '#94adc9',
    mountPeak: '#eef7ff',
    sunBeam: 'rgba(185, 230, 255, 0.06)',
    ambientTint: 'rgba(165, 215, 255, 0.05)',
  },
  MAGMA_FORTRESS: {
    bg: '#140a0a',
    grassShadow: '#262023',
    grassMid: '#3b3236',
    grassLight: '#54464b',
    grassSpec: '#735e63',
    flowerA: '#fb923c',
    flowerB: '#fde047',
    roadBorder: '#241b1d',
    roadDark: '#453538',
    roadMid: '#665054',
    roadLight: '#8c7075',
    treeDeep: '#1a1112',
    treeShadow: '#2e1d1f',
    treeMid: '#4f2c2c',
    treeLight: '#7d413b',
    treeSpec: '#b5634e',
    barkDark: '#211515',
    barkLight: '#402727',
    waterRim: '#4a1d14',
    waterShallow: '#e6581c',
    waterDeep: '#991e0e',
    waterFoam: '#ffd559',
    wallShadow: '#1a1417',
    wallDark: '#33272c',
    wallMid: '#544047',
    wallTop: '#82656f',
    wallSpec: '#b3929d',
    mountShadow: '#241719',
    mountMid: '#4a2e30',
    mountLit: '#7a4b49',
    mountPeak: '#b87667',
    sunBeam: 'rgba(255, 125, 65, 0.065)',
    ambientTint: 'rgba(255, 95, 45, 0.06)',
  },
  AETHELGARD_CITY: {
    bg: '#0f111a',
    grassShadow: '#314733',
    grassMid: '#496946',
    grassLight: '#658c5b',
    grassSpec: '#90ba77',
    flowerA: '#fbbf24',
    flowerB: '#f472b6',
    roadBorder: '#353a47',
    roadDark: '#545b6e',
    roadMid: '#798299',
    roadLight: '#a4aec7',
    treeDeep: '#12241a',
    treeShadow: '#1e3d29',
    treeMid: '#31613d',
    treeLight: '#528f58',
    treeSpec: '#87c47a',
    barkDark: '#36231a',
    barkLight: '#614030',
    waterRim: '#2d3b4d',
    waterShallow: '#296b96',
    waterDeep: '#194569',
    waterFoam: '#9ed2f2',
    wallShadow: '#212533',
    wallDark: '#3d455c',
    wallMid: '#636e8c',
    wallTop: '#9aa7c7',
    wallSpec: '#d2dcf2',
    mountShadow: '#2e3342',
    mountMid: '#525a70',
    mountLit: '#828ca6',
    mountPeak: '#bdc6db',
    sunBeam: 'rgba(255, 205, 140, 0.055)',
    ambientTint: 'rgba(255, 195, 130, 0.04)',
  },
  CRIMSON_SANCTUM: {
    bg: '#120a14',
    grassShadow: '#2f263b',
    grassMid: '#493c59',
    grassLight: '#67567a',
    grassSpec: '#937eab',
    flowerA: '#fde047',
    flowerB: '#f472b6',
    roadBorder: '#2a2033',
    roadDark: '#4a3a59',
    roadMid: '#6e5882',
    roadLight: '#9c83b3',
    treeDeep: '#1a1024',
    treeShadow: '#301c42',
    treeMid: '#4f2c6b',
    treeLight: '#7b46a1',
    treeSpec: '#b67ad9',
    barkDark: '#26172e',
    barkLight: '#492c57',
    waterRim: '#4a1828',
    waterShallow: '#d9324b',
    waterDeep: '#871429',
    waterFoam: '#ffad85',
    wallShadow: '#211729',
    wallDark: '#3e2d4d',
    wallMid: '#674c7d',
    wallTop: '#a382bd',
    wallSpec: '#d9c0ed',
    mountShadow: '#291a33',
    mountMid: '#503461',
    mountLit: '#845b9c',
    mountPeak: '#c89ee0',
    sunBeam: 'rgba(245, 110, 155, 0.065)',
    ambientTint: 'rgba(225, 85, 135, 0.06)',
  },
};

export interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
  depth: number;
}

interface WeatherSplash {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  radius: number;
}

export interface WeatherAnimationProfile {
  activeParticles: number;
  hasSplashes: boolean;
  hasCloudBands: boolean;
  hasWindRibbons: boolean;
  hasLightning: boolean;
  hasGodRays: boolean;
  hasMistBanks: boolean;
  hasHeatGlow: boolean;
}

export function getWeatherAnimationProfile(weather: WeatherType): WeatherAnimationProfile {
  switch (weather) {
    case 'RAIN':
      return {
        activeParticles: 115,
        hasSplashes: true,
        hasCloudBands: true,
        hasWindRibbons: false,
        hasLightning: false,
        hasGodRays: false,
        hasMistBanks: false,
        hasHeatGlow: false,
      };
    case 'STORM':
      return {
        activeParticles: 120,
        hasSplashes: true,
        hasCloudBands: true,
        hasWindRibbons: true,
        hasLightning: true,
        hasGodRays: false,
        hasMistBanks: false,
        hasHeatGlow: false,
      };
    case 'SNOW':
      return {
        activeParticles: 110,
        hasSplashes: false,
        hasCloudBands: false,
        hasWindRibbons: true,
        hasLightning: false,
        hasGodRays: false,
        hasMistBanks: false,
        hasHeatGlow: false,
      };
    case 'SUNLIGHT':
      return {
        activeParticles: 56,
        hasSplashes: false,
        hasCloudBands: false,
        hasWindRibbons: false,
        hasLightning: false,
        hasGodRays: true,
        hasMistBanks: false,
        hasHeatGlow: false,
      };
    case 'MIST':
      return {
        activeParticles: 64,
        hasSplashes: false,
        hasCloudBands: false,
        hasWindRibbons: false,
        hasLightning: false,
        hasGodRays: false,
        hasMistBanks: true,
        hasHeatGlow: false,
      };
    case 'SAND':
      return {
        activeParticles: 115,
        hasSplashes: false,
        hasCloudBands: false,
        hasWindRibbons: true,
        hasLightning: false,
        hasGodRays: false,
        hasMistBanks: false,
        hasHeatGlow: false,
      };
    case 'EMBERS':
      return {
        activeParticles: 92,
        hasSplashes: false,
        hasCloudBands: false,
        hasWindRibbons: false,
        hasLightning: false,
        hasGodRays: false,
        hasMistBanks: false,
        hasHeatGlow: true,
      };
    case 'SPARKS':
      return {
        activeParticles: 88,
        hasSplashes: false,
        hasCloudBands: false,
        hasWindRibbons: false,
        hasLightning: false,
        hasGodRays: false,
        hasMistBanks: false,
        hasHeatGlow: false,
      };
    case 'LEAVES':
      return {
        activeParticles: 72,
        hasSplashes: false,
        hasCloudBands: false,
        hasWindRibbons: true,
        hasLightning: false,
        hasGodRays: false,
        hasMistBanks: false,
        hasHeatGlow: false,
      };
    default:
      return {
        activeParticles: 0,
        hasSplashes: false,
        hasCloudBands: false,
        hasWindRibbons: false,
        hasLightning: false,
        hasGodRays: false,
        hasMistBanks: false,
        hasHeatGlow: false,
      };
  }
}

/**
 * Pure deterministic weather particle stepper with parallax depth scaling
 * and seamless toroidal [0, 1) screen wrapping.
 */
export function stepWeatherParticle(
  p: WeatherParticle,
  weather: WeatherType,
  timeSec: number,
  dt: number
): WeatherParticle {
  const depth = p.depth || 1;
  let x = p.x;
  let y = p.y;

  if (weather === 'RAIN') {
    x -= dt * 0.22 * depth;
    y += dt * 0.96 * depth;
  } else if (weather === 'STORM') {
    x -= dt * 0.42 * depth;
    y += dt * 1.28 * depth;
  } else if (weather === 'SNOW') {
    x += (Math.sin(timeSec * 1.5 + p.phase) * 0.065 + 0.025) * dt * depth;
    y += dt * 0.17 * depth;
  } else if (weather === 'EMBERS') {
    x += Math.sin(timeSec * 2.1 + p.phase) * dt * 0.055 * depth;
    y -= dt * 0.16 * depth;
  } else if (weather === 'SPARKS') {
    x += Math.cos(timeSec * 2.4 + p.phase) * dt * 0.048 * depth;
    y -= dt * 0.13 * depth;
  } else if (weather === 'SAND') {
    x += dt * 0.48 * depth;
    y += (0.045 + Math.sin(timeSec * 3.1 + p.phase) * 0.02) * dt * depth;
  } else if (weather === 'SUNLIGHT') {
    x += Math.sin(timeSec * 0.9 + p.phase) * dt * 0.022 * depth;
    y -= dt * 0.036 * depth;
  } else if (weather === 'MIST') {
    x += dt * 0.055 * depth;
    y += Math.sin(timeSec * 0.65 + p.phase) * dt * 0.012;
  } else if (weather === 'LEAVES') {
    x += (0.065 + Math.sin(timeSec * 1.9 + p.phase) * 0.045) * dt * depth;
    y += (0.075 + Math.cos(timeSec * 1.4 + p.phase) * 0.02) * dt * depth;
  }

  x = ((x % 1) + 1) % 1;
  y = ((y % 1) + 1) % 1;

  return { ...p, x, y };
}

const PARTICLE_POOL_SIZE = 120;
const SPLASH_POOL_SIZE = 22;
const TILE_PX = 32; // Native 32x32 studio pixel-art tile resolution!

export class TacticalBoardRenderer {
  private particles: WeatherParticle[] = [];
  private splashes: WeatherSplash[] = [];
  private impactParticles: ImpactParticle[] = [];
  private shockwaves: ImpactShockwave[] = [];
  private screenShake: ScreenShakeState = { remaining: 0, duration: 0.4, intensity: 0 };
  private critFlashAlpha = 0;
  private boardRect = { offsetX: 0, offsetY: 0, tileSize: 48, width: 18, height: 12 };
  private viewportRect = { x: 0, y: 0, w: 800, h: 500 };
  private minimapRect = { x: 0, y: 0, w: 0, h: 0, visible: false };
  private zoomLevel = 1.0;
  private camPanX = 0;
  private camPanY = 0;
  private lastTrackedCursor: TileCoord | null = null;

  // Cached 32x32-per-tile offscreen terrain canvas (rebuilt ONLY when map/biome changes)
  private terrainCache: HTMLCanvasElement | null = null;
  private terrainCacheKey = '';

  constructor() {
    for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
      const depth = 0.65 + (i % 7) * 0.115;
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: 0.02 + Math.random() * 0.04,
        vy: 0.03 + Math.random() * 0.05,
        size: depth > 1.1 ? 3 : 2,
        alpha: 0.35 + (depth - 0.65) * 0.62,
        phase: Math.random() * Math.PI * 2,
        depth,
      });
    }
    for (let i = 0; i < SPLASH_POOL_SIZE; i++) {
      const maxAge = 0.36 + (i % 5) * 0.07;
      this.splashes.push({
        x: Math.random(),
        y: Math.random(),
        age: Math.random() * maxAge,
        maxAge,
        radius: 5 + (i % 4) * 2.2,
      });
    }
  }

  public getZoomLevel(): number {
    return this.zoomLevel;
  }

  public setZoomLevel(nextZoom: number): number {
    const clamped = Math.max(1.0, Math.min(2.25, Math.round(nextZoom * 100) / 100));
    this.zoomLevel = clamped;
    if (clamped <= 1.01) {
      this.camPanX = 0;
      this.camPanY = 0;
    }
    return this.zoomLevel;
  }

  public adjustZoom(delta: number): number {
    return this.setZoomLevel(this.zoomLevel + delta);
  }

  public resetCamera(): void {
    this.zoomLevel = 1.0;
    this.camPanX = 0;
    this.camPanY = 0;
    this.lastTrackedCursor = null;
  }

  public panByScreenDelta(dx: number, dy: number): void {
    if (this.zoomLevel <= 1.01) return;
    this.camPanX += dx;
    this.camPanY += dy;
  }

  public centerCameraOnTile(tile: TileCoord): void {
    const { tileSize, width, height } = this.boardRect;
    const boardW = tileSize * width;
    const boardH = tileSize * height;
    this.camPanX = (tile.x + 0.5) * tileSize - boardW / 2;
    this.camPanY = (tile.y + 0.5) * tileSize - boardH / 2;
    this.lastTrackedCursor = { x: tile.x, y: tile.y };
  }

  /**
   * Triggers a dramatic Critical Hit particle explosion, shockwave slash cross,
   * brief impact flash, and punchy damped screen shake centered on (tileX, tileY).
   */
  public triggerCritEffect(tileX: number, tileY: number, accentColor = '#fbbf24') {
    const burst = createCritImpactParticles(tileX, tileY, true, accentColor);
    this.impactParticles.push(...burst);
    this.shockwaves.push({
      tileX,
      tileY,
      age: 0,
      maxAge: 0.42,
      color: accentColor,
      isCrit: true,
    });
    this.screenShake = {
      remaining: 0.42,
      duration: 0.42,
      intensity: 11,
    };
    this.critFlashAlpha = 0.28;
  }

  /**
   * Triggers either a full Critical Hit burst or a crisp normal hit spark + micro-shake.
   */
  public triggerHitEffect(tileX: number, tileY: number, isCrit: boolean, accentColor = '#fbbf24') {
    if (isCrit) {
      this.triggerCritEffect(tileX, tileY, accentColor);
      return;
    }
    const burst = createCritImpactParticles(tileX, tileY, false, accentColor);
    this.impactParticles.push(...burst);
    this.shockwaves.push({
      tileX,
      tileY,
      age: 0,
      maxAge: 0.22,
      color: accentColor,
      isCrit: false,
    });
    if (this.screenShake.remaining <= 0.05) {
      this.screenShake = {
        remaining: 0.16,
        duration: 0.16,
        intensity: 4,
      };
    }
  }

  public clearEffects() {
    this.impactParticles = [];
    this.shockwaves = [];
    this.screenShake = { remaining: 0, duration: 0.4, intensity: 0 };
    this.critFlashAlpha = 0;
  }

  public getBoardMetrics() {
    return this.boardRect;
  }

  public minimapScreenToTile(
    clientX: number,
    clientY: number,
    canvasRect: DOMRect
  ): TileCoord | null {
    if (!this.minimapRect.visible) return null;
    const localX = clientX - canvasRect.left;
    const localY = clientY - canvasRect.top;
    const { x, y, w, h } = this.minimapRect;
    if (localX < x || localY < y || localX > x + w || localY > y + h) return null;
    const { width, height } = this.boardRect;
    const tx = Math.max(0, Math.min(width - 1, Math.floor(((localX - x) / Math.max(1, w)) * width)));
    const ty = Math.max(0, Math.min(height - 1, Math.floor(((localY - y) / Math.max(1, h)) * height)));
    return { x: tx, y: ty };
  }

  public screenToTile(
    clientX: number,
    clientY: number,
    canvasRect: DOMRect
  ): TileCoord | null {
    const localX = clientX - canvasRect.left;
    const localY = clientY - canvasRect.top;
    if (this.minimapRect.visible) {
      const m = this.minimapRect;
      if (localX >= m.x - 4 && localX <= m.x + m.w + 4 && localY >= m.y - 4 && localY <= m.y + m.h + 18) {
        return null;
      }
    }
    const v = this.viewportRect;
    if (localX < v.x || localY < v.y || localX > v.x + v.w || localY > v.y + v.h) {
      return null;
    }
    const { offsetX, offsetY, tileSize, width, height } = this.boardRect;
    const tx = Math.floor((localX - offsetX) / tileSize);
    const ty = Math.floor((localY - offsetY) / tileSize);
    if (tx < 0 || ty < 0 || tx >= width || ty >= height) return null;
    return { x: tx, y: ty };
  }

  /**
   * Builds a rich 32x32-per-tile HD-2D pixel-art terrain map with auto-tiling,
   * cast shadows, layered multi-tree forests, cobblestone roads, miniature forts,
   * and atmospheric sunbeams onto a cached offscreen canvas.
   */
  private ensureTerrainCache(grid: TerrainType[][], biome: BiomeId): HTMLCanvasElement {
    const rows = grid.length;
    const cols = grid[0].length;
    const sig = `${biome}_${cols}x${rows}_${grid.map((r) => r.join(',')).join('|')}`;
    if (this.terrainCache && this.terrainCacheKey === sig) {
      return this.terrainCache;
    }

    const canvas = document.createElement('canvas');
    canvas.width = cols * TILE_PX;
    canvas.height = rows * TILE_PX;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const p = BIOME_PALETTES[biome];

    // Pass 1: Base ground, auto-tiled roads, water/lava banks, bridges
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        this.bakeBaseTile(ctx, grid, x, y, p);
      }
    }

    // Pass 2: Directional cast shadows (southeast drop shadows from tall walls, forts, mountains, trees)
    ctx.fillStyle = 'rgba(10, 14, 28, 0.28)';
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const t = grid[y][x];
        if (
          t === 'WALL' ||
          t === 'FORT' ||
          t === 'MOUNTAIN' ||
          t === 'FOREST' ||
          t === 'SHOP_ARMORY' ||
          t === 'SHOP_VENDOR'
        ) {
          const px = x * TILE_PX;
          const py = y * TILE_PX;
          // Cast south shadow onto tile below if ground
          if (y + 1 < rows && grid[y + 1][x] !== 'WALL' && grid[y + 1][x] !== 'WATER') {
            ctx.fillRect(px + 3, (y + 1) * TILE_PX, TILE_PX - 2, t === 'WALL' ? 8 : 5);
          }
          // Cast east shadow
          if (x + 1 < cols && grid[y][x + 1] !== 'WALL' && grid[y][x + 1] !== 'WATER') {
            ctx.fillRect((x + 1) * TILE_PX, py + 4, 4, TILE_PX - 4);
          }
        }
      }
    }

    // Pass 3: Detailed 32x32 vertical structures (multi-tree forests, sculpted peaks, masonry walls, forts, throne)
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        this.bakeFeatureTile(ctx, grid, x, y, p);
      }
    }

    // Pass 4: Crisp subtle HD-2D pixel tile seams & diagonal warm sunbeams
    ctx.fillStyle = 'rgba(0, 0, 0, 0.11)';
    for (let x = 1; x < cols; x++) {
      ctx.fillRect(x * TILE_PX, 0, 1, rows * TILE_PX);
    }
    for (let y = 1; y < rows; y++) {
      ctx.fillRect(0, y * TILE_PX, cols * TILE_PX, 1);
    }

    // Diagonal golden sunlight shafts baked cleanly once (zero runtime cost!)
    ctx.save();
    ctx.fillStyle = p.sunBeam;
    for (let i = 0; i < 4; i++) {
      const sx = i * 145 + 35;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx + 58, 0);
      ctx.lineTo(sx - 68, rows * TILE_PX);
      ctx.lineTo(sx - 126, rows * TILE_PX);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    this.terrainCache = canvas;
    this.terrainCacheKey = sig;
    return canvas;
  }

  private fillPixelDisc(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    rx: number,
    ry: number
  ) {
    for (let dy = -ry; dy <= ry; dy++) {
      const span = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.35))));
      if (span > 0) {
        ctx.fillRect(Math.round(cx - span), Math.round(cy + dy), span * 2, 1);
      }
    }
  }

  private bakeBaseTile(
    ctx: CanvasRenderingContext2D,
    grid: TerrainType[][],
    gx: number,
    gy: number,
    p: BiomePalette
  ) {
    const px = gx * TILE_PX;
    const py = gy * TILE_PX;
    const t = grid[gy][gx];
    const h1 = ((gx * 73856093) ^ (gy * 19349663)) >>> 0;
    const h2 = ((gx * 83492791) ^ (gy * 2971215073)) >>> 0;
    const h3 = ((gx * 2654435761) ^ (gy * 2246822519)) >>> 0;

    // 1. Rich hue-shifted Meadow / Sand / Snow ground base
    const isSand = t === 'SAND';
    const isSnow = t === 'SNOW';
    const cShadow = isSand ? '#946f3d' : isSnow ? '#64819e' : p.grassShadow;
    const cMid = isSand ? '#be9456' : isSnow ? '#8ba8c4' : p.grassMid;
    const cLight = isSand ? '#d9b170' : isSnow ? '#b1cde6' : p.grassLight;
    const cSpec = isSand ? '#f0d499' : isSnow ? '#e3f2ff' : p.grassSpec;

    ctx.fillStyle = cMid;
    ctx.fillRect(px, py, TILE_PX, TILE_PX);

    // Organic pixel-sculpted turf swells & checkerboard dithering (zero boxy rectangles!)
    ctx.fillStyle = (gx + gy) % 2 === 0 ? cLight : cShadow;
    ctx.globalAlpha = 0.24;
    this.fillPixelDisc(ctx, px + 8 + (h1 % 9), py + 9 + ((h1 >>> 3) % 8), 8, 5);
    this.fillPixelDisc(ctx, px + 22 - (h2 % 7), py + 22 - ((h2 >>> 4) % 7), 7, 5);
    ctx.globalAlpha = 1;

    // Dappled pixel grass tufts / sand dunes / snow drifts
    for (let i = 0; i < 7; i++) {
      const bx = ((h1 + i * 17 + (h3 % 5)) % 25) + 3;
      const by = ((h2 + i * 21 + ((h3 >>> 3) % 5)) % 25) + 3;
      if (isSand) {
        ctx.fillStyle = i % 2 === 0 ? cShadow : cLight;
        ctx.fillRect(px + bx, py + by, 6, 1);
        ctx.fillRect(px + bx + 2, py + by + 1, 5, 1);
        ctx.fillStyle = cSpec;
        ctx.fillRect(px + bx + 1, py + by - 1, 3, 1);
      } else {
        // Classic 3-blade GBA pixel-art grass tuft
        ctx.fillStyle = cShadow;
        ctx.fillRect(px + bx, py + by + 2, 4, 1);
        ctx.fillStyle = i % 2 === 0 ? cLight : cShadow;
        ctx.fillRect(px + bx, py + by, 1, 2);
        ctx.fillRect(px + bx + 2, py + by - 1, 1, 3);
        ctx.fillRect(px + bx + 4, py + by + 1, 1, 2);
        if (i % 3 === 0) {
          ctx.fillStyle = cSpec;
          ctx.fillRect(px + bx + 2, py + by - 1, 1, 1);
        }
      }
    }

    // Lush wildflowers, clover patches & weathered pebbles on open plain tiles
    if (t === 'PLAIN' && h1 % 3 === 0) {
      const fx = 5 + (h2 % 18);
      const fy = 5 + ((h1 >>> 3) % 18);
      ctx.fillStyle = cShadow;
      ctx.fillRect(px + fx, py + fy + 2, 5, 2);
      ctx.fillStyle = p.treeLight;
      ctx.fillRect(px + fx + 1, py + fy + 1, 3, 2);
      ctx.fillStyle = h2 % 2 === 0 ? p.flowerA : p.flowerB;
      ctx.fillRect(px + fx, py + fy, 2, 2);
      ctx.fillRect(px + fx + 4, py + fy + 1, 2, 1);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + fx, py + fy, 1, 1);
    } else if (t === 'PLAIN' && h1 % 6 === 1) {
      const rx = 7 + (h2 % 16);
      const ry = 7 + ((h1 >>> 2) % 16);
      ctx.fillStyle = cShadow;
      ctx.fillRect(px + rx, py + ry + 3, 6, 2);
      ctx.fillStyle = p.wallDark;
      ctx.fillRect(px + rx, py + ry + 1, 5, 3);
      ctx.fillStyle = p.wallTop;
      ctx.fillRect(px + rx + 1, py + ry, 3, 2);
      ctx.fillStyle = p.wallSpec;
      ctx.fillRect(px + rx + 1, py + ry, 2, 1);
    }

    // 2. Auto-tiled Medieval Cobblestone Road with organic dirt shoulders & hash-varied flagstones
    if (t === 'ROAD' || t === 'THRONE') {
      const isRoadLike = (nx: number, ny: number) => {
        if (ny < 0 || nx < 0 || ny >= grid.length || nx >= grid[0].length) return true;
        const nt = grid[ny][nx];
        return nt === 'ROAD' || nt === 'BRIDGE' || nt === 'THRONE';
      };
      const n = isRoadLike(gx, gy - 1);
      const s = isRoadLike(gx, gy + 1);
      const w = isRoadLike(gx - 1, gy);
      const e = isRoadLike(gx + 1, gy);

      const padT = n ? 0 : 4;
      const padB = s ? 0 : 4;
      const padL = w ? 0 : 4;
      const padR = e ? 0 : 4;

      // Stepped natural earth shoulder border along grass transitions
      ctx.fillStyle = p.roadBorder;
      ctx.fillRect(
        px + padL - (w ? 0 : 1),
        py + padT - (n ? 0 : 1),
        TILE_PX - padL - padR + (w ? 0 : 1) + (e ? 0 : 1),
        TILE_PX - padT - padB + (n ? 0 : 1) + (s ? 0 : 1)
      );
      // Organic grass blades overhanging the road curb so borders look hand-painted
      if (!n) {
        for (let k = 2; k < 30; k += 5) {
          ctx.fillStyle = (k + h1) % 2 === 0 ? cShadow : cLight;
          ctx.fillRect(px + k, py + 3, 2, 2);
        }
      }
      if (!s) {
        for (let k = 3; k < 29; k += 5) {
          ctx.fillStyle = (k + h2) % 2 === 0 ? cShadow : cLight;
          ctx.fillRect(px + k, py + TILE_PX - 5, 2, 2);
        }
      }

      // Warm mortar base
      ctx.fillStyle = p.roadDark;
      ctx.fillRect(px + padL, py + padT, TILE_PX - padL - padR, TILE_PX - padT - padB);

      // Hash-varied organic medieval flagstones (breaks repetition across adjacent road tiles!)
      const variant = ((h1 ^ (gx * 3 + gy * 7)) >>> 0) % 3;
      const stoneSets: Array<Array<[number, number, number, number]>> = [
        [
          [2, 2, 12, 8],
          [16, 2, 13, 7],
          [2, 12, 9, 8],
          [13, 11, 16, 9],
          [2, 22, 14, 8],
          [18, 22, 11, 8],
        ],
        [
          [2, 2, 9, 9],
          [13, 2, 16, 8],
          [2, 13, 15, 7],
          [19, 12, 10, 9],
          [2, 22, 11, 8],
          [15, 23, 14, 7],
        ],
        [
          [2, 2, 15, 7],
          [19, 2, 10, 8],
          [2, 11, 11, 9],
          [15, 12, 14, 8],
          [2, 22, 13, 8],
          [17, 22, 12, 8],
        ],
      ];

      const stones = stoneSets[variant];
      for (let i = 0; i < stones.length; i++) {
        const [sx, sy, sw, sh] = stones[i];
        const x1 = Math.max(padL + 1, sx);
        const y1 = Math.max(padT + 1, sy);
        const x2 = Math.min(TILE_PX - padR - 1, sx + sw);
        const y2 = Math.min(TILE_PX - padB - 1, sy + sh);
        if (x2 - x1 < 4 || y2 - y1 < 3) continue;

        const tone = (i + h2) % 4;
        ctx.fillStyle = tone === 0 ? p.roadMid : tone === 3 ? p.roadDark : p.roadLight;
        // Rounded beveled corners on flagstones
        ctx.fillRect(px + x1 + 1, py + y1, x2 - x1 - 2, y2 - y1);
        ctx.fillRect(px + x1, py + y1 + 1, x2 - x1, y2 - y1 - 2);
        // Bottom-right shadow bevel
        ctx.fillStyle = p.roadBorder;
        ctx.fillRect(px + x1 + 1, py + y2 - 1, x2 - x1 - 2, 1);
        // Top-left warm sunlit edge highlight
        ctx.fillStyle = 'rgba(255, 250, 235, 0.34)';
        ctx.fillRect(px + x1 + 1, py + y1, x2 - x1 - 3, 1);
      }
      // Occasional tiny moss pixel in mortar
      if (h3 % 3 === 0) {
        ctx.fillStyle = cShadow;
        ctx.fillRect(px + 12 + (h1 % 6), py + 10 + (h2 % 8), 2, 1);
      }
      return;
    }

    // 3. Auto-tiled Deep Water & Glowing Lava with sculpted embankments
    if (t === 'WATER' || t === 'LAVA') {
      const isLava = t === 'LAVA';
      const isLiquid = (nx: number, ny: number) => {
        if (ny < 0 || nx < 0 || ny >= grid.length || nx >= grid[0].length) return true;
        return grid[ny][nx] === t || grid[ny][nx] === 'BRIDGE';
      };
      ctx.fillStyle = isLava ? '#9c1f0e' : p.waterDeep;
      ctx.fillRect(px, py, TILE_PX, TILE_PX);

      // Subtle deep water caustics
      ctx.fillStyle = isLava ? '#b82c12' : p.waterShallow;
      ctx.globalAlpha = 0.25;
      this.fillPixelDisc(ctx, px + 10 + (h1 % 10), py + 12 + (h2 % 10), 8, 4);
      ctx.globalAlpha = 1;

      const rimColor = isLava ? '#521f18' : p.waterRim;
      const shallowColor = isLava ? '#db541a' : p.waterShallow;

      if (!isLiquid(gx, gy - 1)) {
        ctx.fillStyle = rimColor;
        ctx.fillRect(px, py, TILE_PX, 4);
        ctx.fillStyle = shallowColor;
        ctx.fillRect(px, py + 4, TILE_PX, 4);
      }
      if (!isLiquid(gx, gy + 1)) {
        ctx.fillStyle = shallowColor;
        ctx.fillRect(px, py + TILE_PX - 6, TILE_PX, 3);
        ctx.fillStyle = rimColor;
        ctx.fillRect(px, py + TILE_PX - 3, TILE_PX, 3);
      }
      if (!isLiquid(gx - 1, gy)) {
        ctx.fillStyle = rimColor;
        ctx.fillRect(px, py, 3, TILE_PX);
        ctx.fillStyle = shallowColor;
        ctx.fillRect(px + 3, py, 3, TILE_PX);
      }
      if (!isLiquid(gx + 1, gy)) {
        ctx.fillStyle = shallowColor;
        ctx.fillRect(px + TILE_PX - 6, py, 3, TILE_PX);
        ctx.fillStyle = rimColor;
        ctx.fillRect(px + TILE_PX - 3, py, 3, TILE_PX);
      }
      return;
    }

    // 4. Ornate Timber Bridge over water/chasm with planks, railings & iron nails
    if (t === 'BRIDGE') {
      ctx.fillStyle = p.waterDeep;
      ctx.fillRect(px, py, TILE_PX, TILE_PX);
      ctx.fillStyle = p.waterShallow;
      ctx.fillRect(px, py + 2, TILE_PX, 2);
      ctx.fillRect(px, py + TILE_PX - 4, TILE_PX, 2);
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(px, py + TILE_PX - 5, TILE_PX, 3);
      ctx.fillStyle = '#5c3c22';
      ctx.fillRect(px, py + 4, TILE_PX, TILE_PX - 8);
      for (let i = 0; i < 6; i++) {
        const bx = px + i * 5 + 1;
        ctx.fillStyle = i % 2 === 0 ? '#8c5e35' : '#7a502c';
        ctx.fillRect(bx, py + 6, 4, TILE_PX - 12);
        ctx.fillStyle = '#ad7949';
        ctx.fillRect(bx, py + 6, 4, 2);
        ctx.fillStyle = '#291a10';
        ctx.fillRect(bx + 1, py + 8, 1, 1);
        ctx.fillRect(bx + 1, py + TILE_PX - 9, 1, 1);
      }
      ctx.fillStyle = '#472c17';
      ctx.fillRect(px, py + 3, TILE_PX, 3);
      ctx.fillRect(px, py + TILE_PX - 6, TILE_PX, 3);
      ctx.fillStyle = '#b88654';
      ctx.fillRect(px, py + 3, TILE_PX, 1);
      ctx.fillRect(px, py + TILE_PX - 6, TILE_PX, 1);
    }
  }

  private bakeFeatureTile(
    ctx: CanvasRenderingContext2D,
    grid: TerrainType[][],
    gx: number,
    gy: number,
    p: BiomePalette
  ) {
    const px = gx * TILE_PX;
    const py = gy * TILE_PX;
    const t = grid[gy][gx];
    const h = ((gx * 374761393) ^ (gy * 668265263)) >>> 0;

    // 1. FOREST: Lush Sculpted Pixel-Art Woodland Cluster (rounded multi-tiered canopies + undergrowth!)
    if (t === 'FOREST') {
      // Soft mossy woodland shadow carpet on tile floor
      ctx.fillStyle = p.treeDeep;
      ctx.globalAlpha = 0.35;
      this.fillPixelDisc(ctx, px + 16, py + 23, 13, 6);
      ctx.globalAlpha = 1;

      const drawOakTree = (cx: number, cy: number, rx: number, ry: number) => {
        // Grounded shadow
        ctx.fillStyle = 'rgba(8, 16, 22, 0.48)';
        this.fillPixelDisc(ctx, cx + 1, cy + 7, rx - 1, 3);
        // Sculpted bark trunk with roots
        ctx.fillStyle = p.barkDark;
        ctx.fillRect(cx - 2, cy + 1, 5, 7);
        ctx.fillRect(cx - 3, cy + 6, 7, 2);
        ctx.fillStyle = p.barkLight;
        ctx.fillRect(cx - 1, cy + 1, 2, 6);
        // Deep silhouette canopy outline
        ctx.fillStyle = p.treeDeep;
        this.fillPixelDisc(ctx, cx, cy - 2, rx + 1, ry + 1);
        // Cool shadow foliage base
        ctx.fillStyle = p.treeShadow;
        this.fillPixelDisc(ctx, cx, cy - 3, rx, ry);
        // Midtone organic leaf puffs
        ctx.fillStyle = p.treeMid;
        this.fillPixelDisc(ctx, cx - 2, cy - 4, Math.max(3, rx - 2), Math.max(3, ry - 2));
        this.fillPixelDisc(ctx, cx + 2, cy - 3, Math.max(3, rx - 3), Math.max(2, ry - 2));
        // Sunlit top-left foliage crown
        ctx.fillStyle = p.treeLight;
        this.fillPixelDisc(ctx, cx - 2, cy - 5, Math.max(2, rx - 4), Math.max(2, ry - 3));
        ctx.fillRect(cx + 1, cy - ry, 3, 2);
        // Crisp warm leaf specular dots
        ctx.fillStyle = p.treeSpec;
        ctx.fillRect(cx - 4, cy - ry, 2, 2);
        ctx.fillRect(cx - 1, cy - ry - 1, 2, 1);
        ctx.fillRect(cx + 2, cy - ry + 1, 1, 1);
      };

      // Three overlapping handcrafted woodland trees filling the tile naturally
      drawOakTree(px + 9 + (h % 2), py + 14, 7, 6);
      drawOakTree(px + 23 - (h % 2), py + 15, 7, 6);
      drawOakTree(px + 16, py + 22, 9, 7);
      return;
    }

    // 2. MOUNTAIN: Dramatic Faceted Stepped Mountain Ridge with sunlit rock planes
    if (t === 'MOUNTAIN') {
      const drawPeak = (cx: number, baseY: number, halfW: number, height: number) => {
        for (let row = 0; row < height; row++) {
          const frac = row / height;
          const span = Math.max(1, Math.round(halfW * frac));
          const ry = baseY - height + row;
          ctx.fillStyle = p.mountShadow;
          ctx.fillRect(cx - span, ry, span * 2, 1);
          ctx.fillStyle = p.mountMid;
          ctx.fillRect(cx - span, ry, Math.max(1, Math.round(span * 1.35)), 1);
          ctx.fillStyle = p.mountLit;
          ctx.fillRect(cx - span, ry, Math.max(1, Math.round(span * 0.72)), 1);
          if (frac < 0.34) {
            ctx.fillStyle = p.mountPeak;
            ctx.fillRect(cx - span, ry, Math.max(1, Math.round(span * 1.15)), 1);
          }
        }
      };

      drawPeak(px + 9, py + 26, 9, 17);
      drawPeak(px + 23, py + 27, 9, 15);
      drawPeak(px + 16, py + 31, 13, 24);
      return;
    }

    // 3. WALL: Auto-tiled 3D Stone Fortress Ramparts with Textured Walkway & Crenellations!
    if (t === 'WALL') {
      const hasWallN = gy - 1 >= 0 && grid[gy - 1][gx] === 'WALL';
      const hasWallS = gy + 1 < grid.length && grid[gy + 1][gx] === 'WALL';
      const hasWallW = gx - 1 >= 0 && grid[gy][gx - 1] === 'WALL';
      const hasWallE = gx + 1 < grid[0].length && grid[gy][gx + 1] === 'WALL';

      // Dark stone base outline
      ctx.fillStyle = p.wallShadow;
      ctx.fillRect(px, py, TILE_PX, TILE_PX);

      const topH = hasWallS ? TILE_PX : 14;

      // Top Stone Parapet Walkway with textured ashlar flagstones (never flat!)
      ctx.fillStyle = p.wallMid;
      ctx.fillRect(px, py, TILE_PX, topH);

      // Flagstone grid across the rampart deck
      for (let ry = 1; ry < topH - 2; ry += 6) {
        const rowShift = ((ry / 6) % 2) * 6;
        for (let rx = 1; rx < TILE_PX - 2; rx += 10) {
          const sx = px + ((rx + rowShift) % (TILE_PX - 4));
          const sw = Math.min(9, px + TILE_PX - 2 - sx);
          if (sw < 3) continue;
          ctx.fillStyle = (rx + ry + h) % 3 === 0 ? p.wallMid : p.wallTop;
          ctx.fillRect(sx, py + ry, sw, Math.min(5, topH - ry - 1));
          ctx.fillStyle = p.wallSpec;
          ctx.fillRect(sx, py + ry, sw, 1);
          ctx.fillStyle = p.wallDark;
          ctx.fillRect(sx, py + ry + Math.min(4, topH - ry - 2), sw, 1);
        }
      }

      // Raised outer stone parapet ledges with crenellation merlons on exposed sides
      if (!hasWallW) {
        ctx.fillStyle = p.wallShadow;
        ctx.fillRect(px, py, 4, topH);
        ctx.fillStyle = p.wallSpec;
        ctx.fillRect(px + 1, py + 1, 2, topH - 2);
        for (let my = 4; my < topH - 4; my += 10) {
          ctx.fillStyle = p.wallDark;
          ctx.fillRect(px + 1, py + my, 3, 4);
        }
      }
      if (!hasWallE) {
        ctx.fillStyle = p.wallShadow;
        ctx.fillRect(px + TILE_PX - 4, py, 4, topH);
        ctx.fillStyle = p.wallTop;
        ctx.fillRect(px + TILE_PX - 3, py + 1, 2, topH - 2);
        for (let my = 4; my < topH - 4; my += 10) {
          ctx.fillStyle = p.wallDark;
          ctx.fillRect(px + TILE_PX - 4, py + my, 3, 4);
        }
      }
      if (!hasWallN) {
        ctx.fillStyle = p.wallSpec;
        ctx.fillRect(px, py, TILE_PX, 2);
      }

      // Front 3D Vertical Masonry Wall Face when exposed to the south
      if (!hasWallS) {
        ctx.fillStyle = p.wallShadow;
        ctx.fillRect(px, py + 13, TILE_PX, 2);
        // Crenellation merlon notches along front lip
        ctx.fillStyle = p.wallSpec;
        ctx.fillRect(px + 1, py + 11, 6, 3);
        ctx.fillRect(px + 10, py + 11, 5, 3);
        ctx.fillRect(px + 18, py + 11, 5, 3);
        ctx.fillRect(px + 26, py + 11, 5, 3);

        ctx.fillStyle = p.wallDark;
        ctx.fillRect(px + 1, py + 15, TILE_PX - 2, TILE_PX - 16);

        // Weathered staggered stone masonry blocks
        for (let row = 0; row < 3; row++) {
          const by = py + 15 + row * 5;
          const shift = (row % 2) * 5;
          for (let col = 0; col < 3; col++) {
            const bx = px + 2 + ((col * 10 + shift) % 24);
            const bw = Math.min(9, px + TILE_PX - 2 - bx);
            if (bw < 3) continue;
            ctx.fillStyle = (row + col) % 2 === 0 ? p.wallMid : p.wallDark;
            ctx.fillRect(bx, by, bw, 4);
            ctx.fillStyle = p.wallTop;
            ctx.fillRect(bx, by, bw, 1);
          }
        }
        // Dark mortar bottom base trim
        ctx.fillStyle = p.wallShadow;
        ctx.fillRect(px, py + TILE_PX - 2, TILE_PX, 2);
      }
      return;
    }

    // 4. FORT: Miniature 32x32 Stone Citadel Keep with Grounded Courtyard Apron, Twin Turrets & Portcullis
    if (t === 'FORT') {
      // Rounded cobblestone courtyard apron blending naturally into surrounding meadow
      ctx.fillStyle = p.roadBorder;
      this.fillPixelDisc(ctx, px + 16, py + 24, 14, 7);
      ctx.fillStyle = p.roadMid;
      this.fillPixelDisc(ctx, px + 16, py + 24, 12, 5);
      // Base foundation stone outline
      ctx.fillStyle = p.wallShadow;
      ctx.fillRect(px + 3, py + 4, 26, 24);
      // Main keep body
      ctx.fillStyle = p.wallDark;
      ctx.fillRect(px + 4, py + 9, 24, 18);
      ctx.fillStyle = p.wallMid;
      ctx.fillRect(px + 5, py + 10, 22, 15);

      // Left & Right crenellated corner turrets
      for (const tx of [px + 3, px + 21]) {
        ctx.fillStyle = p.wallShadow;
        ctx.fillRect(tx, py + 3, 8, 25);
        ctx.fillStyle = p.wallMid;
        ctx.fillRect(tx + 1, py + 6, 6, 21);
        ctx.fillStyle = p.wallTop;
        ctx.fillRect(tx + 1, py + 4, 2, 3);
        ctx.fillRect(tx + 5, py + 4, 2, 3);
        ctx.fillStyle = p.wallSpec;
        ctx.fillRect(tx + 1, py + 4, 2, 1);
        ctx.fillRect(tx + 5, py + 4, 2, 1);
        // Arrow slit window
        ctx.fillStyle = '#0f131f';
        ctx.fillRect(tx + 3, py + 11, 2, 5);
      }

      // Center battlement parapet
      ctx.fillStyle = p.wallTop;
      ctx.fillRect(px + 11, py + 8, 10, 4);
      ctx.fillStyle = p.wallSpec;
      ctx.fillRect(px + 11, py + 8, 10, 1);
      ctx.fillStyle = p.wallShadow;
      ctx.fillRect(px + 13, py + 9, 2, 2);
      ctx.fillRect(px + 17, py + 9, 2, 2);

      // Arched Iron Portcullis Gate
      ctx.fillStyle = '#0d1019';
      ctx.fillRect(px + 12, py + 17, 8, 10);
      ctx.fillRect(px + 13, py + 16, 6, 2);
      ctx.fillStyle = '#334155';
      ctx.fillRect(px + 14, py + 17, 1, 9);
      ctx.fillRect(px + 17, py + 17, 1, 9);
      ctx.fillRect(px + 12, py + 20, 8, 1);
      // Golden banner pole on spire
      ctx.fillStyle = '#d4a345';
      ctx.fillRect(px + 15, py + 1, 1, 8);
      return;
    }

    // 5. THRONE: Grand Stepped Marble Dais with Crimson Carpet & Golden Royal Seal
    if (t === 'THRONE') {
      ctx.fillStyle = '#291d2b';
      ctx.fillRect(px + 1, py + 1, 30, 30);
      ctx.fillStyle = '#9ca3af';
      ctx.fillRect(px + 2, py + 2, 28, 28);
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(px + 2, py + 2, 28, 2);
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(px + 6, py + 3, 20, 26);
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(px + 8, py + 4, 16, 24);
      ctx.fillStyle = '#d4a345';
      ctx.fillRect(px + 7, py + 4, 1, 24);
      ctx.fillRect(px + 24, py + 4, 1, 24);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px + 10, py + 4, 12, 16);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(px + 11, py + 5, 10, 14);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(px + 12, py + 5, 8, 2);
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(px + 13, py + 8, 6, 8);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(px + 3, py + 23, 4, 5);
      ctx.fillRect(px + 25, py + 23, 4, 5);
      return;
    }

    // 6. SHOP_ARMORY: Crimson-Roofed Medieval Battlefield Forge & Sword Signboard
    if (t === 'SHOP_ARMORY') {
      ctx.fillStyle = p.roadBorder;
      this.fillPixelDisc(ctx, px + 16, py + 25, 14, 6);
      ctx.fillStyle = p.roadLight;
      this.fillPixelDisc(ctx, px + 16, py + 25, 12, 4);
      // Stone smithy base
      ctx.fillStyle = '#1c1518';
      ctx.fillRect(px + 3, py + 8, 26, 20);
      ctx.fillStyle = '#786258';
      ctx.fillRect(px + 4, py + 15, 24, 12);
      ctx.fillStyle = '#a89080';
      ctx.fillRect(px + 5, py + 15, 22, 3);
      // Chimney on right
      ctx.fillStyle = '#334155';
      ctx.fillRect(px + 22, py + 3, 5, 10);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(px + 23, py + 3, 3, 2);
      // Crimson tiled pitched roof
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(px + 2, py + 10, 28, 6);
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(px + 4, py + 7, 24, 7);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(px + 6, py + 5, 20, 4);
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(px + 8, py + 5, 16, 1);
      // Warm forge doorway + anvil
      ctx.fillStyle = '#1f1210';
      ctx.fillRect(px + 11, py + 18, 10, 9);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(px + 13, py + 20, 6, 5);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(px + 14, py + 21, 4, 3);
      // Bright Golden Crossed-Sword Signboard crest on roof center
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(px + 11, py + 7, 10, 7);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px + 12, py + 8, 8, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 13, py + 9, 2, 1);
      ctx.fillRect(px + 15, py + 10, 2, 1);
      ctx.fillRect(px + 17, py + 11, 2, 1);
      ctx.fillRect(px + 17, py + 9, 2, 1);
      ctx.fillRect(px + 13, py + 11, 2, 1);
      return;
    }

    // 7. SHOP_VENDOR: Emerald-Gold Secret Merchant Pavilion & Mystic Potion Signboard
    if (t === 'SHOP_VENDOR') {
      ctx.fillStyle = p.roadBorder;
      this.fillPixelDisc(ctx, px + 16, py + 25, 14, 6);
      ctx.fillStyle = p.roadLight;
      this.fillPixelDisc(ctx, px + 16, py + 25, 12, 4);
      // Timber counter & goods shadow
      ctx.fillStyle = '#0c1f1a';
      ctx.fillRect(px + 3, py + 8, 26, 20);
      ctx.fillStyle = '#5c3c22';
      ctx.fillRect(px + 4, py + 16, 24, 11);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(px + 5, py + 20, 22, 6);
      // Potion bottles & magic scrolls displayed on counter
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px + 7, py + 17, 3, 3);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(px + 12, py + 17, 3, 3);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(px + 17, py + 17, 4, 3);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(px + 22, py + 17, 3, 3);
      // Emerald & antique-gold striped pavilion canopy
      ctx.fillStyle = '#065f46';
      ctx.fillRect(px + 2, py + 9, 28, 7);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(px + 4, py + 6, 24, 8);
      // Gold canopy stripes
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px + 6, py + 6, 4, 9);
      ctx.fillRect(px + 14, py + 5, 4, 10);
      ctx.fillRect(px + 22, py + 6, 4, 9);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(px + 6, py + 5, 20, 1);
      // Hanging emerald crystal lantern bracket
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 13, py + 8, 6, 6);
      ctx.fillStyle = '#34d399';
      ctx.fillRect(px + 14, py + 9, 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 15, py + 10, 2, 2);
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    state: TacticalRenderState,
    timeSec: number,
    dt: number
  ) {
    const rows = state.grid.length;
    const cols = state.grid[0].length;
    const palette = BIOME_PALETTES[state.biome];

    // Crisp integer tile sizing framed comfortably within perimeter HUD safe areas + smooth Camera Zoom & Pan
    const topSafe = 58;
    const bottomSafe = state.isDeployment ? 156 : 122;
    const sideSafe = 20;
    const availW = Math.max(320, canvasWidth - sideSafe * 2);
    const availH = Math.max(200, canvasHeight - topSafe - bottomSafe);
    const fitTileSize = Math.max(16, Math.floor(Math.min(availW / cols, availH / rows)));
    const tileSize = Math.max(16, Math.round(fitTileSize * this.zoomLevel));
    const boardW = tileSize * cols;
    const boardH = tileSize * rows;

    const viewW = Math.min(availW, boardW);
    const viewH = Math.min(availH, boardH);
    const viewX = Math.floor((canvasWidth - viewW) / 2);
    const viewY = Math.floor(topSafe + (availH - viewH) / 2);

    const maxPanX = Math.max(0, (boardW - viewW) / 2);
    const maxPanY = Math.max(0, (boardH - viewH) / 2);

    // Smoothly auto-pan camera to keep tactical cursor inside comfortable safe margin when zoomed in
    if (this.zoomLevel > 1.01) {
      const prev = this.lastTrackedCursor;
      if (!prev || prev.x !== state.cursor.x || prev.y !== state.cursor.y) {
        const cursorBoardX = (state.cursor.x + 0.5) * tileSize - boardW / 2;
        const cursorBoardY = (state.cursor.y + 0.5) * tileSize - boardH / 2;
        const deadZoneX = viewW * 0.28;
        const deadZoneY = viewH * 0.28;
        if (cursorBoardX - this.camPanX > deadZoneX) {
          this.camPanX = cursorBoardX - deadZoneX;
        } else if (cursorBoardX - this.camPanX < -deadZoneX) {
          this.camPanX = cursorBoardX + deadZoneX;
        }
        if (cursorBoardY - this.camPanY > deadZoneY) {
          this.camPanY = cursorBoardY - deadZoneY;
        } else if (cursorBoardY - this.camPanY < -deadZoneY) {
          this.camPanY = cursorBoardY + deadZoneY;
        }
        this.lastTrackedCursor = { x: state.cursor.x, y: state.cursor.y };
      }
    } else {
      this.camPanX = 0;
      this.camPanY = 0;
    }

    this.camPanX = Math.max(-maxPanX, Math.min(maxPanX, this.camPanX));
    this.camPanY = Math.max(-maxPanY, Math.min(maxPanY, this.camPanY));

    const offsetX = Math.round(viewX + (viewW - boardW) / 2 - this.camPanX);
    const offsetY = Math.round(viewY + (viewH - boardH) / 2 - this.camPanY);

    this.boardRect = { offsetX, offsetY, tileSize, width: cols, height: rows };
    this.viewportRect = { x: viewX, y: viewY, w: viewW, h: viewH };

    // Update impact VFX timers, particles & damped screen shake
    if (this.screenShake.remaining > 0) {
      this.screenShake.remaining = Math.max(0, this.screenShake.remaining - dt);
    }
    if (this.critFlashAlpha > 0) {
      this.critFlashAlpha = Math.max(0, this.critFlashAlpha - dt * 1.85);
    }
    if (this.impactParticles.length > 0) {
      this.impactParticles = stepImpactParticles(this.impactParticles, dt);
    }
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      this.shockwaves[i].age += dt;
      if (this.shockwaves[i].age >= this.shockwaves[i].maxAge) {
        this.shockwaves.splice(i, 1);
      }
    }

    const { dx: shakeX, dy: shakeY } = computeScreenShakeOffset(this.screenShake, timeSec);

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();
    if (shakeX !== 0 || shakeY !== 0) {
      ctx.translate(shakeX, shakeY);
    }

    // Ornate carved obsidian & antique-gold tactical frame border around active viewport
    ctx.fillStyle = '#07090f';
    ctx.fillRect(viewX - 8, viewY - 8, viewW + 16, viewH + 16);
    ctx.strokeStyle = 'rgba(212, 163, 69, 0.62)';
    ctx.lineWidth = 2;
    ctx.strokeRect(viewX - 5, viewY - 5, viewW + 10, viewH + 10);
    ctx.strokeStyle = 'rgba(255, 236, 179, 0.22)';
    ctx.lineWidth = 1;
    ctx.strokeRect(viewX - 2, viewY - 2, viewW + 4, viewH + 4);
    // Corner gold pixel rivets
    ctx.fillStyle = '#eab308';
    const rivets: Array<[number, number]> = [
      [viewX - 7, viewY - 7],
      [viewX + viewW + 3, viewY - 7],
      [viewX - 7, viewY + viewH + 3],
      [viewX + viewW + 3, viewY + viewH + 3],
    ];
    for (const [rx, ry] of rivets) ctx.fillRect(rx, ry, 4, 4);

    // Clip battlefield rendering cleanly inside viewportRect when zoomed in
    ctx.save();
    ctx.beginPath();
    ctx.rect(viewX, viewY, viewW, viewH);
    ctx.clip();

    // 1. Blit Cached 32x32 HD-2D Pixel Terrain Atlas (viewport-culled sub-rect when zoomed!)
    const terrainCanvas = this.ensureTerrainCache(state.grid, state.biome);
    if (boardW <= viewW && boardH <= viewH) {
      ctx.drawImage(terrainCanvas, offsetX, offsetY, boardW, boardH);
    } else {
      const visLeft = Math.max(viewX, offsetX);
      const visTop = Math.max(viewY, offsetY);
      const visRight = Math.min(viewX + viewW, offsetX + boardW);
      const visBottom = Math.min(viewY + viewH, offsetY + boardH);
      const visW = Math.max(1, visRight - visLeft);
      const visH = Math.max(1, visBottom - visTop);
      const srcScaleX = terrainCanvas.width / boardW;
      const srcScaleY = terrainCanvas.height / boardH;
      ctx.drawImage(
        terrainCanvas,
        (visLeft - offsetX) * srcScaleX,
        (visTop - offsetY) * srcScaleY,
        visW * srcScaleX,
        visH * srcScaleY,
        visLeft,
        visTop,
        visW,
        visH
      );
    }

    // Visible tile bounds inside viewportRect (with 1-tile safety margin)
    const minVisCol = Math.max(0, Math.floor((viewX - offsetX) / tileSize) - 1);
    const maxVisCol = Math.min(cols - 1, Math.ceil((viewX + viewW - offsetX) / tileSize) + 1);
    const minVisRow = Math.max(0, Math.floor((viewY - offsetY) / tileSize) - 1);
    const maxVisRow = Math.min(rows - 1, Math.ceil((viewY + viewH - offsetY) / tileSize) + 1);

    // 2. Animated Micro-Details (water ripples, flickering fort torches/flags, throne braziers)
    const scale = tileSize / TILE_PX;
    for (let y = minVisRow; y <= maxVisRow; y++) {
      for (let x = minVisCol; x <= maxVisCol; x++) {
        const t = state.grid[y][x];
        const px = offsetX + x * tileSize;
        const py = offsetY + y * tileSize;
        if (t === 'WATER' || t === 'LAVA') {
          const isLava = t === 'LAVA';
          const wave = Math.round(Math.sin(timeSec * 2.6 + x * 0.9 + y * 0.7) * 3 * scale);
          ctx.fillStyle = isLava ? '#ffbd38' : palette.waterFoam;
          ctx.fillRect(px + 6 * scale + wave, py + 10 * scale, 7 * scale, Math.max(1.5, 1.5 * scale));
          ctx.fillRect(px + 15 * scale - wave, py + 21 * scale, 5 * scale, Math.max(1.5, 1.5 * scale));
        } else if (t === 'FORT') {
          // Flickering amber torchlight + fluttering crimson-gold banner pennant
          const flick = Math.sin(timeSec * 11 + x * 3 + y) > 0;
          ctx.fillStyle = flick ? 'rgba(251, 191, 36, 0.25)' : 'rgba(249, 115, 22, 0.16)';
          ctx.fillRect(px + 8 * scale, py + 14 * scale, 6 * scale, 6 * scale);
          ctx.fillStyle = flick ? '#fef08a' : '#f97316';
          ctx.fillRect(px + 10 * scale, py + 16 * scale, 2 * scale, 2 * scale);
          // Fluttering banner on central spire
          const flap = Math.sin(timeSec * 6 + x) > 0 ? 1 : 0;
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(px + 16 * scale, py + (1 + flap) * scale, 6 * scale, 3 * scale);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(px + 16 * scale, py + (2 + flap) * scale, 3 * scale, 1.2 * scale);
        } else if (t === 'THRONE') {
          // Twin flickering golden braziers + glowing Crimson Seal gem
          const flick = Math.sin(timeSec * 10) > 0;
          ctx.fillStyle = flick ? '#fde047' : '#f97316';
          ctx.fillRect(px + 4 * scale, py + 20 * scale, 2.5 * scale, 3 * scale);
          ctx.fillRect(px + 25.5 * scale, py + 20 * scale, 2.5 * scale, 3 * scale);
          ctx.fillStyle = flick ? 'rgba(253, 224, 71, 0.24)' : 'rgba(251, 146, 60, 0.14)';
          ctx.fillRect(px + 2 * scale, py + 18 * scale, 7 * scale, 7 * scale);
          ctx.fillRect(px + 23 * scale, py + 18 * scale, 7 * scale, 7 * scale);
        } else if (t === 'SHOP_ARMORY') {
          // Flickering warm forge glow + rising chimney smoke pixel
          const flick = Math.sin(timeSec * 9 + x) > 0;
          ctx.fillStyle = flick ? 'rgba(249, 115, 22, 0.34)' : 'rgba(251, 191, 36, 0.2)';
          ctx.fillRect(px + 11 * scale, py + 18 * scale, 10 * scale, 9 * scale);
          const smokeRise = Math.floor((timeSec * 6 + x) % 5);
          ctx.fillStyle = 'rgba(226, 232, 240, 0.55)';
          ctx.fillRect(px + (23 + (smokeRise % 2)) * scale, py + (2 - smokeRise * 0.7) * scale, 2.5 * scale, 2.5 * scale);
        } else if (t === 'SHOP_VENDOR') {
          // Pulsing mystic emerald-gold merchant lantern sparkle
          const glow = 0.22 + 0.16 * Math.sin(timeSec * 6 + y);
          ctx.fillStyle = `rgba(52, 211, 153, ${glow})`;
          ctx.fillRect(px + 10 * scale, py + 6 * scale, 12 * scale, 10 * scale);
          if (Math.sin(timeSec * 7 + x) > 0.3) {
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(px + 15 * scale, py + 3 * scale, 2 * scale, 2 * scale);
          }
        }
      }
    }

    // 3. Tactical Range & Deployment Overlays
    const pulse = 0.5 + 0.5 * Math.sin(timeSec * 4.5);

    if (state.isDeployment && state.deploymentSlots && state.deploymentSlots.length > 0) {
      state.deploymentSlots.forEach((slot, idx) => {
        const px = offsetX + slot.x * tileSize;
        const py = offsetY + slot.y * tileSize;
        const isSwapSrc =
          state.swapSourceCoord &&
          state.swapSourceCoord.x === slot.x &&
          state.swapSourceCoord.y === slot.y;
        const hasAlly = state.units.some(
          (u) => u.faction === 'PLAYER' && u.hp > 0 && u.x === slot.x && u.y === slot.y
        );

        ctx.fillStyle = isSwapSrc
          ? `rgba(250, 204, 21, ${0.42 + pulse * 0.16})`
          : hasAlly
          ? `rgba(14, 165, 233, ${0.28 + pulse * 0.1})`
          : `rgba(16, 185, 129, ${0.22 + pulse * 0.12})`;
        ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);

        ctx.strokeStyle = isSwapSrc
          ? '#fde047'
          : hasAlly
          ? 'rgba(125, 211, 252, 0.92)'
          : 'rgba(110, 231, 183, 0.82)';
        ctx.lineWidth = isSwapSrc ? 2.6 : 1.8;
        ctx.strokeRect(px + 2.5, py + 2.5, tileSize - 5, tileSize - 5);

        // Slot number tag at top-right of deployment tile
        const labelFont = Math.max(9, Math.floor(tileSize * 0.22));
        ctx.font = `700 ${labelFont}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'rgba(7, 10, 18, 0.82)';
        ctx.fillRect(px + tileSize - 18, py + 3, 15, labelFont + 3);
        ctx.fillStyle = isSwapSrc ? '#fde047' : hasAlly ? '#bae6fd' : '#a7f3d0';
        ctx.fillText(`${idx + 1}`, px + tileSize - 4, py + 4);
      });
    }

    if (state.showDangerZone && state.dangerZone.size > 0) {
      for (const key of state.dangerZone) {
        const [xs, ys] = key.split(',');
        const px = offsetX + Number(xs) * tileSize;
        const py = offsetY + Number(ys) * tileSize;
        ctx.fillStyle = `rgba(220, 38, 38, ${0.22 + pulse * 0.08})`;
        ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
        ctx.strokeStyle = 'rgba(248, 113, 113, 0.58)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px + 2.5, py + 2.5, tileSize - 5, tileSize - 5);
      }
    }

    if (state.reachableTiles.size > 0) {
      for (const key of state.reachableTiles.keys()) {
        const [xs, ys] = key.split(',');
        const px = offsetX + Number(xs) * tileSize;
        const py = offsetY + Number(ys) * tileSize;
        ctx.fillStyle = `rgba(37, 99, 235, ${0.34 + pulse * 0.1})`;
        ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
        // Inner crisp bevel highlight
        ctx.fillStyle = 'rgba(191, 219, 254, 0.25)';
        ctx.fillRect(px + 3, py + 3, tileSize - 6, 3);
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.88)';
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
      }
    }

    if (state.actionRangeTiles.size > 0) {
      const isHeal = state.actionRangeKind === 'HEAL';
      for (const key of state.actionRangeTiles) {
        const [xs, ys] = key.split(',');
        const px = offsetX + Number(xs) * tileSize;
        const py = offsetY + Number(ys) * tileSize;
        ctx.fillStyle = isHeal
          ? `rgba(16, 185, 129, ${0.32 + pulse * 0.1})`
          : `rgba(220, 38, 38, ${0.34 + pulse * 0.1})`;
        ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
        ctx.strokeStyle = isHeal ? 'rgba(110, 231, 183, 0.9)' : 'rgba(252, 165, 165, 0.9)';
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
      }
    }

    // 4. Classic Fire Emblem Curved Golden Movement Arrow
    if (state.previewPath.length >= 2) {
      this.drawPathArrow(ctx, state.previewPath, offsetX, offsetY, tileSize);
    }

    // 5. Crisp 24x24 Hand-Crafted Multi-Frame Pixel Character Sprites sorted by Y
    const aliveUnits = state.units
      .filter((u) => u.hp > 0)
      .sort((a, b) => a.y - b.y);

    for (const unit of aliveUnits) {
      let drawX = unit.x;
      let drawY = unit.y;
      let isWalking = false;

      if (state.movingSprite && state.movingSprite.unitId === unit.id && state.movingSprite.path.length > 1) {
        const safeProgress = Math.max(0, state.movingSprite.progress);
        const maxIdx = state.movingSprite.path.length - 1;
        const idx = Math.max(0, Math.min(Math.floor(safeProgress), maxIdx));
        const frac = Math.max(0, Math.min(1, safeProgress - idx));
        const from = state.movingSprite.path[idx];
        const to = state.movingSprite.path[Math.min(idx + 1, maxIdx)];
        if (from && to) {
          drawX = from.x + (to.x - from.x) * frac;
          drawY = from.y + (to.y - from.y) * frac;
          isWalking = true;
        }
      }

      const px = offsetX + drawX * tileSize;
      const py = offsetY + drawY * tileSize;
      if (
        px + tileSize < viewX - tileSize ||
        px > viewX + viewW + tileSize ||
        py + tileSize < viewY - tileSize ||
        py > viewY + viewH + tileSize
      ) {
        continue;
      }
      const isSelected = state.selectedUnitId === unit.id;
      const isTargetable = state.targetableUnitIds.has(unit.id);

      this.drawUnit(ctx, unit, px, py, tileSize, timeSec, isSelected, isTargetable, isWalking);
    }

    // 6. Animated Golden Pixel Tactical Cursor
    this.drawCursor(
      ctx,
      offsetX + state.cursor.x * tileSize,
      offsetY + state.cursor.y * tileSize,
      tileSize,
      timeSec
    );

    // 7. Ambient Weather Particles (clipped to visible viewport intersection)
    const wx = Math.max(viewX, offsetX);
    const wy = Math.max(viewY, offsetY);
    const ww = Math.max(1, Math.min(viewX + viewW, offsetX + boardW) - wx);
    const wh = Math.max(1, Math.min(viewY + viewH, offsetY + boardH) - wy);
    ctx.save();
    ctx.beginPath();
    ctx.rect(wx, wy, ww, wh);
    ctx.clip();
    ctx.fillStyle = palette.ambientTint;
    ctx.fillRect(wx, wy, ww, wh);
    this.drawWeather(ctx, state.weather, wx, wy, ww, wh, timeSec, dt);
    ctx.restore();

    // 7.5 Critical Hit Shockwaves, Pixel Slash Crosses & Radial Particle Bursts
    if (this.shockwaves.length > 0 || this.impactParticles.length > 0 || this.critFlashAlpha > 0) {
      this.drawImpactEffects(ctx, offsetX, offsetY, boardW, boardH, tileSize);
    }

    // 8. Crisp Outlined Floating Combat Numbers
    for (const ft of state.floatingTexts) {
      const t = Math.min(1, ft.age / ft.duration);
      const isCritText = ft.text.includes('CHÍ MẠNG');
      const fx = offsetX + (ft.x + 0.5) * tileSize;
      const fy = offsetY + (ft.y + (isCritText ? 0.02 : 0.12)) * tileSize - t * (isCritText ? 38 : 30);
      ctx.save();
      ctx.globalAlpha = 1 - Math.max(0, (t - 0.65) / 0.35);
      const fontSize = Math.max(14, Math.floor(tileSize * (isCritText ? 0.36 : 0.32)));
      ctx.font = `800 ${fontSize}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.lineWidth = isCritText ? 5 : 4;
      ctx.strokeStyle = isCritText ? 'rgba(69, 10, 10, 0.96)' : 'rgba(0, 0, 0, 0.94)';
      ctx.strokeText(ft.text, fx, fy);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, fx, fy);
      ctx.restore();
    }

    // 9. Combat Dialogue Bubbles above tactical units
    if (state.combatBubbles && state.combatBubbles.length > 0) {
      this.drawCombatBubbles(ctx, state.combatBubbles, offsetX, offsetY, boardW, boardH, tileSize);
    }

    // Close viewport clip
    ctx.restore();

    // 10. Interactive Tactical Corner Minimap (projects live terrain cache + unit & throne beacons + camera viewport box)
    this.drawMinimap(
      ctx,
      terrainCanvas,
      state,
      canvasWidth,
      topSafe,
      viewX,
      viewY,
      viewW,
      viewH,
      offsetX,
      offsetY,
      boardW,
      boardH
    );

    ctx.restore();
  }

  private drawMinimap(
    ctx: CanvasRenderingContext2D,
    terrainCanvas: HTMLCanvasElement,
    state: TacticalRenderState,
    canvasWidth: number,
    topSafe: number,
    viewX: number,
    viewY: number,
    viewW: number,
    viewH: number,
    offsetX: number,
    offsetY: number,
    boardW: number,
    boardH: number
  ) {
    if (canvasWidth < 760) {
      this.minimapRect = { x: 0, y: 0, w: 0, h: 0, visible: false };
      return;
    }
    const cols = state.grid[0].length;
    const rows = state.grid.length;
    const maxMiniW = 148;
    const cellPx = Math.max(4, Math.min(7, Math.floor(maxMiniW / cols)));
    const miniW = cols * cellPx;
    const miniH = rows * cellPx;
    const mx = 14;
    const my = topSafe + 8;

    this.minimapRect = { x: mx, y: my, w: miniW, h: miniH, visible: true };

    ctx.save();
    ctx.fillStyle = 'rgba(9, 13, 22, 0.92)';
    ctx.fillRect(mx - 4, my - 4, miniW + 8, miniH + 20);
    ctx.strokeStyle = 'rgba(217, 166, 72, 0.65)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(mx - 3.5, my - 3.5, miniW + 7, miniH + 19);

    ctx.globalAlpha = 0.86;
    ctx.drawImage(terrainCanvas, mx, my, miniW, miniH);
    ctx.globalAlpha = 1;

    // Throne golden diamond marker
    const tx = mx + state.throneCoord.x * cellPx;
    const ty = my + state.throneCoord.y * cellPx;
    ctx.fillStyle = '#fde047';
    ctx.fillRect(tx, ty, cellPx, cellPx);

    // Live Ally / Enemy / Elite / Boss radar pips
    for (const u of state.units) {
      if (u.hp <= 0) continue;
      const ux = mx + u.x * cellPx;
      const uy = my + u.y * cellPx;
      ctx.fillStyle =
        u.faction === 'PLAYER'
          ? u.isLord
            ? '#fde047'
            : '#38bdf8'
          : u.isBoss
          ? '#f59e0b'
          : u.isElite
          ? '#fb7185'
          : '#ef4444';
      ctx.fillRect(ux, uy, Math.max(3, cellPx - 1), Math.max(3, cellPx - 1));
    }

    // Cursor marker
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      mx + state.cursor.x * cellPx - 0.5,
      my + state.cursor.y * cellPx - 0.5,
      cellPx + 1,
      cellPx + 1
    );

    // Camera viewport frame when zoomed in
    if (this.zoomLevel > 1.01 && boardW > 0 && boardH > 0) {
      const vxRatio = Math.max(0, (viewX - offsetX) / boardW);
      const vyRatio = Math.max(0, (viewY - offsetY) / boardH);
      const vwRatio = Math.min(1, viewW / boardW);
      const vhRatio = Math.min(1, viewH / boardH);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(
        mx + vxRatio * miniW,
        my + vyRatio * miniH,
        vwRatio * miniW,
        vhRatio * miniH
      );
    }

    // Micro caption bar
    ctx.font = '600 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${cols}×${rows}`, mx, my + miniH + 3);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fcd34d';
    ctx.fillText(`${Math.round(this.zoomLevel * 100)}%`, mx + miniW, my + miniH + 3);
    ctx.restore();
  }

  private drawCombatBubbles(
    ctx: CanvasRenderingContext2D,
    bubbles: CombatSpeechBubble[],
    offsetX: number,
    offsetY: number,
    boardW: number,
    boardH: number,
    tileSize: number
  ) {
    const placedRects: Array<{ x: number; y: number; w: number; h: number }> = [];

    for (const b of bubbles) {
      const progress = Math.min(1, b.age / Math.max(0.1, b.duration));
      const popIn = Math.min(1, b.age / 0.16);
      const fadeOut = progress > 0.78 ? Math.max(0, 1 - (progress - 0.78) / 0.22) : 1;
      const alpha = popIn * fadeOut;
      if (alpha <= 0.02) continue;

      ctx.save();
      ctx.globalAlpha = alpha;
      const fontSize = Math.max(11, Math.min(13, Math.round(tileSize * 0.22)));
      ctx.font = `600 ${fontSize}px "Be Vietnam Pro", system-ui, sans-serif`;

      const quoteStr = `“${b.text}”`;
      const maxTextW = Math.min(220, Math.max(148, boardW * 0.34));
      // Wrap into at most 2 crisp lines
      const words = quoteStr.split(' ');
      const lines: string[] = [];
      let cur = '';
      for (const word of words) {
        const test = cur ? `${cur} ${word}` : word;
        if (ctx.measureText(test).width <= maxTextW || !cur) {
          cur = test;
        } else {
          lines.push(cur);
          cur = word;
        }
      }
      if (cur) lines.push(cur);
      if (lines.length > 2) {
        lines[1] = `${lines.slice(1).join(' ').slice(0, 26)}…”`;
        lines.length = 2;
      }

      const lineH = fontSize + 4;
      const measuredW = Math.max(...lines.map((l) => ctx.measureText(l).width), 64);
      const padX = 9;
      const padY = 6;
      const boxW = Math.ceil(measuredW + padX * 2);
      const boxH = Math.ceil(lines.length * lineH + padY * 2);

      const unitCenterX = offsetX + (b.x + 0.5) * tileSize;
      const unitTopY = offsetY + b.y * tileSize;
      const floatUp = (1 - popIn) * 6;

      let bx = Math.round(unitCenterX - boxW / 2);
      bx = Math.max(offsetX + 6, Math.min(offsetX + boardW - boxW - 6, bx));

      let by = Math.round(unitTopY - boxH - 10 + floatUp);
      let pointerBelow = true;
      if (by < offsetY + 6) {
        by = Math.round(unitTopY + tileSize + 8 - floatUp);
        pointerBelow = false;
      }

      // Prevent simultaneous adjacent-unit bubbles from overlapping
      for (const rect of placedRects) {
        const overlapsX = bx < rect.x + rect.w + 4 && bx + boxW + 4 > rect.x;
        const overlapsY = by < rect.y + rect.h + 4 && by + boxH + 4 > rect.y;
        if (overlapsX && overlapsY) {
          if (pointerBelow && rect.y - boxH - 6 >= offsetY + 4) {
            by = rect.y - boxH - 6;
          } else if (rect.y + rect.h + 6 + boxH <= offsetY + boardH - 4) {
            by = rect.y + rect.h + 6;
          }
        }
      }
      placedRects.push({ x: bx, y: by, w: boxW, h: boxH });

      const bgColor = b.isCrit
        ? 'rgba(24, 18, 10, 0.94)'
        : b.hpBand === 'LOW'
        ? 'rgba(28, 11, 18, 0.95)'
        : b.faction === 'PLAYER'
        ? 'rgba(13, 21, 38, 0.94)'
        : 'rgba(28, 14, 22, 0.94)';

      const borderColor = b.isCrit
        ? '#fcd34d'
        : b.hpBand === 'LOW'
        ? '#f87171'
        : b.hpBand === 'MID'
        ? '#fbbf24'
        : b.faction === 'PLAYER'
        ? '#38bdf8'
        : '#fb7185';

      // Drop shadow + pixel-beveled speech frame
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fillRect(bx + 2, by + 3, boxW, boxH);

      ctx.fillStyle = bgColor;
      ctx.fillRect(bx, by, boxW, boxH);

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = b.isCrit || b.hpBand === 'LOW' ? 1.8 : 1.3;
      ctx.strokeRect(bx + 0.5, by + 0.5, boxW - 1, boxH - 1);

      // Tiny inner top specular highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(bx + 2, by + 1, boxW - 4, 1);

      // Speech pointer triangle aimed at unit center
      const tipX = Math.max(bx + 10, Math.min(bx + boxW - 10, Math.round(unitCenterX)));
      ctx.beginPath();
      if (pointerBelow) {
        ctx.moveTo(tipX - 5, by + boxH - 1);
        ctx.lineTo(tipX, by + boxH + 6);
        ctx.lineTo(tipX + 5, by + boxH - 1);
      } else {
        ctx.moveTo(tipX - 5, by + 1);
        ctx.lineTo(tipX, by - 6);
        ctx.lineTo(tipX + 5, by + 1);
      }
      ctx.closePath();
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1.25;
      ctx.stroke();

      // Quote text
      ctx.fillStyle = b.isCrit ? '#fef3c7' : '#f8fafc';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      lines.forEach((line, idx) => {
        ctx.fillText(line, bx + boxW / 2, by + padY + idx * lineH);
      });

      ctx.restore();
    }
  }

  private drawImpactEffects(
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    boardW: number,
    boardH: number,
    tileSize: number
  ) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Brief warm golden-crimson impact flash across battlefield on Critical Hits
    if (this.critFlashAlpha > 0) {
      ctx.fillStyle = `rgba(254, 240, 138, ${this.critFlashAlpha * 0.55})`;
      ctx.fillRect(offsetX, offsetY, boardW, boardH);
    }

    // Expanding shockwaves & razor crit cross-slashes at impact tile center
    for (const sw of this.shockwaves) {
      const t = Math.min(1, sw.age / sw.maxAge);
      const ease = 1 - Math.pow(1 - t, 3);
      const cx = Math.round(offsetX + (sw.tileX + 0.5) * tileSize);
      const cy = Math.round(offsetY + (sw.tileY + 0.45) * tileSize);
      const alpha = Math.max(0, 1 - t);

      if (sw.isCrit) {
        // Outer golden shockwave ring
        const outerR = Math.round(tileSize * (0.28 + ease * 0.95));
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = alpha * 0.95;
        ctx.lineWidth = Math.max(2, Math.round(5 * (1 - t)));
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.stroke();

        // Inner white-hot core flash ring
        const innerR = Math.round(tileSize * (0.14 + ease * 0.55));
        ctx.strokeStyle = '#ffffff';
        ctx.globalAlpha = alpha;
        ctx.lineWidth = Math.max(1.5, Math.round(3 * (1 - t)));
        ctx.beginPath();
        ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
        ctx.stroke();

        // Dramatic Fire Emblem pixel diagonal crit X-slash flare
        if (t < 0.65) {
          const slashAlpha = 1 - t / 0.65;
          const reach = Math.round(tileSize * (0.45 + ease * 0.65));
          ctx.globalAlpha = slashAlpha;
          ctx.lineCap = 'square';
          ctx.strokeStyle = sw.color;
          ctx.lineWidth = Math.max(4, Math.round(tileSize * 0.12 * slashAlpha));
          ctx.beginPath();
          ctx.moveTo(cx - reach, cy - reach * 0.72);
          ctx.lineTo(cx + reach, cy + reach * 0.72);
          ctx.moveTo(cx + reach * 0.85, cy - reach * 0.85);
          ctx.lineTo(cx - reach * 0.85, cy + reach * 0.85);
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.max(2, Math.round(tileSize * 0.05 * slashAlpha));
          ctx.stroke();
        }
      } else {
        const r = Math.round(tileSize * (0.18 + ease * 0.45));
        ctx.strokeStyle = '#fef08a';
        ctx.globalAlpha = alpha * 0.85;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Crisp pixel spark / shard / ember particles flying outward from impact point
    for (const p of this.impactParticles) {
      const lifeRatio = 1 - p.age / p.maxAge;
      const px = Math.round(offsetX + (p.tileX + 0.5 + p.ox) * tileSize);
      const py = Math.round(offsetY + (p.tileY + 0.45 + p.oy) * tileSize);
      const sz = Math.max(2, Math.round(p.size * (0.45 + lifeRatio * 0.65)));

      ctx.globalAlpha = Math.max(0, Math.min(1, lifeRatio * 1.25));
      // Subtle dark pixel shadow behind sparks for punchy readability over bright grass/stone
      ctx.fillStyle = 'rgba(10, 12, 20, 0.75)';
      ctx.fillRect(px - Math.floor(sz / 2) + 1, py - Math.floor(sz / 2) + 1, sz, sz);

      ctx.fillStyle = p.color;
      if (p.kind === 'SPARK') {
        // Crisp 4-point pixel star glint
        ctx.fillRect(px - Math.floor(sz / 2), py - Math.floor(sz / 2), sz, sz);
        if (sz >= 4) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px - 1, py - 1, 2, 2);
        }
      } else if (p.kind === 'SHARD') {
        // Elongated pixel splinter aligned along velocity vector
        ctx.fillRect(px - Math.floor(sz / 2), py - Math.floor(sz / 2), sz + 2, Math.max(2, sz - 1));
      } else {
        ctx.fillRect(px - Math.floor(sz / 2), py - Math.floor(sz / 2), sz, sz);
      }
    }

    ctx.restore();
  }

  private drawUnit(
    ctx: CanvasRenderingContext2D,
    unit: Unit,
    px: number,
    py: number,
    size: number,
    timeSec: number,
    isSelected: boolean,
    isTargetable: boolean,
    isWalking: boolean
  ) {
    // Targetable pulse ring
    if (isTargetable) {
      const pulse = 0.55 + 0.45 * Math.sin(timeSec * 8);
      ctx.strokeStyle =
        unit.faction === 'ENEMY' ? `rgba(248, 113, 113, ${pulse})` : `rgba(52, 211, 153, ${pulse})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(px + 2, py + 2, size - 4, size - 4);
    }

    // Selected radiant gold floor highlight
    if (isSelected) {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.28)';
      ctx.fillRect(px + 2, py + 2, size - 4, size - 4);
    }

    // Resolve active 4-frame sprite-sheet cell (idle breathing / selected ready / walk cycle)
    const anim = computeUnitAnimationFrame(unit, timeSec, isSelected, isWalking);
    const sheet = getUnitSpriteSheet(unit, false);

    // Resolve high-tier Title Foot Aura (RARE / EPIC / MYTHIC)
    const titleAura = computeTitleAuraVisual(unit, timeSec);

    // Grounded elliptical shadow + Evolved Tier aura ring beneath unit boots
    const shadowRx1 = Math.round(size * 0.31 * anim.shadowScale);
    const shadowRy1 = Math.max(3, Math.round(size * 0.085 * anim.shadowScale));
    const shadowRx2 = Math.round(size * 0.39 * anim.shadowScale);
    const shadowRy2 = Math.max(4, Math.round(size * 0.115 * anim.shadowScale));
    const shadowCx = Math.round(px + size * 0.5);
    const shadowCy = Math.round(py + size * 0.81);

    if (titleAura) {
      this.drawTitleAuraBack(ctx, titleAura, px, py, size, timeSec);
    }

    if (unit.tier >= 2 || unit.promoted) {
      const auraPulse = 0.28 + 0.14 * Math.sin(timeSec * 4 + unit.x);
      ctx.save();
      ctx.fillStyle =
        unit.faction === 'ENEMY'
          ? `rgba(239, 68, 68, ${auraPulse})`
          : unit.tier >= 4
          ? `rgba(244, 63, 94, ${auraPulse + 0.1})`
          : unit.tier === 3
          ? `rgba(56, 189, 248, ${auraPulse + 0.08})`
          : `rgba(250, 204, 21, ${auraPulse})`;
      ctx.beginPath();
      ctx.ellipse(
        shadowCx,
        shadowCy,
        Math.round(size * 0.4),
        Math.max(4, Math.round(size * 0.12)),
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      if (unit.tier >= 4 && unit.faction === 'PLAYER') {
        ctx.strokeStyle = `rgba(254, 240, 138, ${auraPulse + 0.25})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = 'rgba(7, 10, 20, 0.34)';
    ctx.beginPath();
    ctx.ellipse(shadowCx, shadowCy, shadowRx2, shadowRy2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(7, 10, 20, 0.62)';
    ctx.beginPath();
    ctx.ellipse(shadowCx, shadowCy, shadowRx1, shadowRy1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2.5D HD-2D 64x72 sprite scale: boots at y=65/72 plant cleanly onto shadowCy!
    const tierScaleBoost =
      unit.tier >= 4 ? 1.45 : unit.tier === 3 ? 1.37 : unit.tier === 2 ? 1.31 : 1.26;
    const baseSpriteW = Math.round(size * tierScaleBoost);
    const baseSpriteH = Math.round((anim.sh / anim.sw) * baseSpriteW);
    const spriteW = Math.round(baseSpriteW * anim.breathScaleX);
    const spriteH = Math.round(baseSpriteH * anim.breathScaleY);
    const drawX = Math.round(px + (size - spriteW) / 2);
    const bootInset = Math.round(spriteH * (7 / 72));
    const drawY = Math.round(shadowCy + 2 - (spriteH - bootInset) + anim.offsetY);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    // Enemies face left toward Valoria heroes, Players face right!
    if (unit.faction === 'ENEMY') {
      ctx.translate(drawX + spriteW, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(sheet.canvas, anim.sx, anim.sy, anim.sw, anim.sh, 0, 0, spriteW, spriteH);
    } else {
      ctx.drawImage(sheet.canvas, anim.sx, anim.sy, anim.sw, anim.sh, drawX, drawY, spriteW, spriteH);
    }
    ctx.restore();

    // Front half of Title Foot Aura (wraps crisply in front of the hero's boots in 2.5D!)
    if (titleAura) {
      this.drawTitleAuraFront(ctx, titleAura, px, py, size, timeSec);
    }

    // Boss Crown, Elite Chevron, Lord Star, or Evolved Tier 2/3/4 Badge at top-left corner of tile
    if (unit.isBoss || unit.isElite || unit.isLord || unit.tier >= 2) {
      const bx = px + 2;
      const by = py + 2;
      ctx.fillStyle = '#0d1017';
      ctx.fillRect(bx, by, 10, 8);
      ctx.fillStyle = unit.isBoss
        ? '#f59e0b'
        : unit.isElite
        ? '#fb7185'
        : unit.tier >= 4
        ? '#f43f5e'
        : unit.tier === 3
        ? '#38bdf8'
        : unit.tier === 2
        ? '#fde047'
        : '#60a5fa';
      ctx.fillRect(bx + 1, by + 3, 8, 4);
      ctx.fillRect(bx + 1, by + 1, 2, 2);
      ctx.fillRect(bx + 4, by + 1, 2, 2);
      ctx.fillRect(bx + 7, by + 1, 2, 2);
    }

    // Crisp 2-tone specular micro HP bar at tile bottom
    const barW = size - 10;
    const barH = Math.max(4, Math.floor(size * 0.095));
    const bx = px + 5;
    const by = py + size - barH - 2;
    const effMaxHp = Math.max(unit.hp, unit.stats.maxHp + getUnitEquipmentBonuses(unit).stats.maxHp);
    const hpRatio = Math.max(0, Math.min(1, unit.hp / Math.max(1, effMaxHp)));
    const fillW = Math.round(barW * hpRatio);

    ctx.fillStyle = '#090c14';
    ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
    ctx.fillStyle = '#1e2536';
    ctx.fillRect(bx, by, barW, barH);
    ctx.fillStyle =
      unit.faction === 'PLAYER'
        ? hpRatio > 0.45
          ? '#0ea5e9'
          : '#d97706'
        : hpRatio > 0.45
        ? '#dc2626'
        : '#ea580c';
    ctx.fillRect(bx, by, fillW, barH);
    // Specular top pixel line on HP fill
    if (fillW > 0) {
      ctx.fillStyle =
        unit.faction === 'PLAYER'
          ? hpRatio > 0.45
            ? '#7dd3fc'
            : '#fde047'
          : '#fca5a5';
      ctx.fillRect(bx, by, fillW, 1);
    }
  }

  private drawPathArrow(
    ctx: CanvasRenderingContext2D,
    path: TileCoord[],
    offsetX: number,
    offsetY: number,
    tileSize: number
  ) {
    ctx.save();
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';

    const tracePath = () => {
      ctx.beginPath();
      path.forEach((p, idx) => {
        const cx = offsetX + (p.x + 0.5) * tileSize;
        const cy = offsetY + (p.y + 0.5) * tileSize;
        if (idx === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();
    };

    // Dark outline
    ctx.strokeStyle = 'rgba(15, 10, 5, 0.85)';
    ctx.lineWidth = Math.max(9, Math.floor(tileSize * 0.25));
    tracePath();
    // Rich amber gold body
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = Math.max(5, Math.floor(tileSize * 0.17));
    tracePath();
    // Specular sunlit highlight centerline
    ctx.strokeStyle = '#fef3c7';
    ctx.lineWidth = Math.max(2, Math.floor(tileSize * 0.06));
    tracePath();

    // Outlined Arrowhead at destination tile
    const last = path[path.length - 1];
    const prev = path[path.length - 2];
    const dx = last.x - prev.x;
    const dy = last.y - prev.y;
    const cx = offsetX + (last.x + 0.5) * tileSize;
    const cy = offsetY + (last.y + 0.5) * tileSize;
    const r = tileSize * 0.28;

    ctx.beginPath();
    ctx.moveTo(cx + dx * r, cy + dy * r);
    ctx.lineTo(cx - dx * r * 0.65 - dy * r * 0.9, cy - dy * r * 0.65 + dx * r * 0.9);
    ctx.lineTo(cx - dx * r * 0.65 + dy * r * 0.9, cy - dy * r * 0.65 - dx * r * 0.9);
    ctx.closePath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(15, 10, 5, 0.9)';
    ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.restore();
  }

  private drawCursor(
    ctx: CanvasRenderingContext2D,
    px: number,
    py: number,
    size: number,
    timeSec: number
  ) {
    const expand = Math.round(Math.sin(timeSec * 6) * 1.5);
    const arm = Math.max(7, Math.floor(size * 0.26));
    const pad = 1 - expand;

    ctx.save();
    const x1 = px + pad;
    const y1 = py + pad;
    const x2 = px + size - pad;
    const y2 = py + size - pad;

    const strokeBrackets = () => {
      ctx.beginPath();
      ctx.moveTo(x1, y1 + arm);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x1 + arm, y1);
      ctx.moveTo(x2 - arm, y1);
      ctx.lineTo(x2, y1);
      ctx.lineTo(x2, y1 + arm);
      ctx.moveTo(x2, y2 - arm);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x2 - arm, y2);
      ctx.moveTo(x1 + arm, y2);
      ctx.lineTo(x1, y2);
      ctx.lineTo(x1, y2 - arm);
      ctx.stroke();
    };

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.88)';
    ctx.lineWidth = 5;
    strokeBrackets();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2.5;
    strokeBrackets();
    ctx.restore();
  }

  private drawTitleAuraBack(
    ctx: CanvasRenderingContext2D,
    aura: TitleAuraVisual,
    px: number,
    py: number,
    size: number,
    timeSec: number
  ) {
    const cx = px + size * 0.5;
    const cy = py + size * 0.81;
    const rx = size * aura.radiusScale * (0.96 + 0.06 * aura.pulse);
    const ry = rx * 0.42;

    ctx.save();
    // 1. Soft radial ground glow pool directly under the hero's stance
    const glow = ctx.createRadialGradient(cx, cy, rx * 0.1, cx, cy, rx * 1.18);
    glow.addColorStop(0, aura.glowRgba);
    glow.addColorStop(0.65, aura.glowRgba.replace(/[\d.]+\)$/, '0.16)'));
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 1.18, ry * 1.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1.5 Subtle dark grounding under-stroke so gold/sky/violet auras pop cleanly even on bright stone roads
    ctx.globalAlpha = 0.52;
    ctx.strokeStyle = '#060a14';
    ctx.lineWidth = aura.ringWidth + 2.2;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 1, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Primary glowing elliptical halo ring
    ctx.globalAlpha = 0.84 + 0.16 * aura.pulse;
    ctx.strokeStyle = aura.outerColor;
    ctx.lineWidth = aura.ringWidth + 0.35;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Double concentric arcane/celestial ring for EPIC & MYTHIC titles
    if (aura.hasDoubleRing) {
      ctx.save();
      ctx.strokeStyle = aura.rarity === 'MYTHIC' ? aura.accentColor : aura.innerColor;
      ctx.lineWidth = aura.rarity === 'MYTHIC' ? 1.7 : 1.25;
      ctx.globalAlpha = 0.62 + 0.3 * aura.pulse;
      ctx.setLineDash(aura.rarity === 'MYTHIC' ? [5, 3] : [3, 3]);
      ctx.lineDashOffset = -timeSec * (aura.rarity === 'MYTHIC' ? 18 : 11);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * 0.74, ry * 0.74, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Back-half orbiting pixel rune motes (behind hero sprite)
    for (let i = 0; i < aura.orbCount; i++) {
      const ang = timeSec * aura.orbitSpeed + aura.phaseOffset + (i * Math.PI * 2) / aura.orbCount;
      if (Math.sin(ang) >= 0) continue; // front half drawn after sprite
      const ox = Math.round(cx + Math.cos(ang) * rx);
      const oy = Math.round(cy + Math.sin(ang) * ry);
      const sz = aura.rarity === 'MYTHIC' && i % 2 === 0 ? 3 : 2;
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = i % 2 === 0 ? aura.sparkColor : aura.outerColor;
      ctx.fillRect(ox - 1, oy - 1, sz, sz);
    }

    ctx.restore();
  }

  private drawTitleAuraFront(
    ctx: CanvasRenderingContext2D,
    aura: TitleAuraVisual,
    px: number,
    py: number,
    size: number,
    timeSec: number
  ) {
    const cx = px + size * 0.5;
    const cy = py + size * 0.81;
    const rx = size * aura.radiusScale * (0.96 + 0.06 * aura.pulse);
    const ry = rx * 0.42;

    ctx.save();
    // 1. Crisp front-arc specular rim highlight wrapping around the hero's boots
    ctx.globalAlpha = 0.7 + 0.26 * aura.pulse;
    ctx.strokeStyle = aura.innerColor;
    ctx.lineWidth = aura.rarity === 'MYTHIC' ? 1.8 : 1.3;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0.08 * Math.PI, 0.92 * Math.PI);
    ctx.stroke();

    // 2. Front-half orbiting glowing pixel stars
    for (let i = 0; i < aura.orbCount; i++) {
      const ang = timeSec * aura.orbitSpeed + aura.phaseOffset + (i * Math.PI * 2) / aura.orbCount;
      if (Math.sin(ang) < 0) continue;
      const ox = Math.round(cx + Math.cos(ang) * rx);
      const oy = Math.round(cy + Math.sin(ang) * ry);
      const sz = aura.rarity === 'MYTHIC' && i % 2 === 0 ? 3 : 2;
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = i % 2 === 0 ? aura.outerColor : aura.accentColor;
      ctx.fillRect(ox - 1, oy - 1, sz + 1, sz + 1);
      ctx.fillStyle = aura.sparkColor;
      ctx.fillRect(ox, oy, Math.max(1, sz - 1), Math.max(1, sz - 1));
    }

    // 3. Gentle rising vertical pixel motes for EPIC & MYTHIC titles
    if (aura.hasRisingMotes) {
      const moteCount = aura.rarity === 'MYTHIC' ? 4 : 2;
      for (let m = 0; m < moteCount; m++) {
        const life = (timeSec * 0.72 + aura.phaseOffset * 0.4 + m / moteCount) % 1;
        const spread = Math.sin(m * 2.3 + aura.phaseOffset) * rx * 0.78;
        const mx = Math.round(cx + spread + Math.sin(timeSec * 3 + m) * 2);
        const my = Math.round(cy - life * size * 0.48);
        ctx.globalAlpha = Math.sin(life * Math.PI) * 0.85;
        ctx.fillStyle = m % 2 === 0 ? aura.sparkColor : aura.outerColor;
        ctx.fillRect(mx, my, 2, 2);
      }
    }

    ctx.restore();
  }

  private drawWeather(
    ctx: CanvasRenderingContext2D,
    weather: WeatherType,
    ox: number,
    oy: number,
    w: number,
    h: number,
    timeSec: number,
    dt: number
  ) {
    if (weather === 'NONE') return;
    const profile = getWeatherAnimationProfile(weather);

    // 1. Multi-Layered Atmospheric Lighting, Cloud Shadows, God-Rays, Mist Banks & Lightning
    ctx.save();
    if (weather === 'SUNLIGHT') {
      const grad = ctx.createLinearGradient(ox, oy, ox + w * 0.8, oy + h);
      grad.addColorStop(0, 'rgba(254, 240, 138, 0.24)');
      grad.addColorStop(0.5, 'rgba(251, 191, 36, 0.1)');
      grad.addColorStop(1, 'rgba(251, 146, 60, 0.04)');
      ctx.fillStyle = grad;
      ctx.fillRect(ox, oy, w, h);
      // 5 animated sweeping diagonal golden sun god-rays
      for (let r = 0; r < 5; r++) {
        const sway = Math.sin(timeSec * 0.35 + r * 1.2) * 0.05;
        const rayX = ox + (r * 0.23 - 0.05 + sway) * w;
        const rayAlpha = 0.06 + 0.045 * Math.sin(timeSec * 0.9 + r * 1.7);
        ctx.fillStyle = `rgba(254, 249, 195, ${rayAlpha})`;
        ctx.beginPath();
        ctx.moveTo(rayX, oy);
        ctx.lineTo(rayX + w * 0.1, oy);
        ctx.lineTo(rayX + w * 0.32, oy + h);
        ctx.lineTo(rayX + w * 0.15, oy + h);
        ctx.closePath();
        ctx.fill();
      }
    } else if (weather === 'RAIN') {
      ctx.fillStyle = 'rgba(12, 34, 72, 0.24)';
      ctx.fillRect(ox, oy, w, h);
    } else if (weather === 'STORM') {
      ctx.fillStyle = 'rgba(8, 18, 46, 0.36)';
      ctx.fillRect(ox, oy, w, h);
    } else if (weather === 'MIST') {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.17)';
      ctx.fillRect(ox, oy, w, h);
    } else if (weather === 'SAND') {
      const sandGrad = ctx.createLinearGradient(ox, oy, ox + w, oy + h);
      sandGrad.addColorStop(0, 'rgba(217, 119, 6, 0.22)');
      sandGrad.addColorStop(1, 'rgba(146, 64, 14, 0.16)');
      ctx.fillStyle = sandGrad;
      ctx.fillRect(ox, oy, w, h);
    } else if (weather === 'SNOW') {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.16)';
      ctx.fillRect(ox, oy, w, h);
    } else if (weather === 'EMBERS') {
      ctx.fillStyle = 'rgba(124, 45, 18, 0.17)';
      ctx.fillRect(ox, oy, w, h);
      // Pulsing volcanic magma underglow along lower edge of battlefield
      const glowPulse = 0.16 + 0.07 * Math.sin(timeSec * 2.4);
      const lavaGrad = ctx.createLinearGradient(ox, oy + h * 0.55, ox, oy + h);
      lavaGrad.addColorStop(0, 'rgba(234, 88, 12, 0)');
      lavaGrad.addColorStop(1, `rgba(239, 68, 68, ${glowPulse})`);
      ctx.fillStyle = lavaGrad;
      ctx.fillRect(ox, oy + h * 0.55, w, h * 0.45);
    } else if (weather === 'SPARKS') {
      const arcPulse = 0.13 + 0.05 * Math.sin(timeSec * 2.2);
      ctx.fillStyle = `rgba(88, 28, 135, ${arcPulse})`;
      ctx.fillRect(ox, oy, w, h);
    }

    // 1B. Sweeping Cloud Shadow Bands for RAIN & STORM
    if (profile.hasCloudBands) {
      const bandCount = weather === 'STORM' ? 4 : 3;
      const speed = weather === 'STORM' ? 0.14 : 0.065;
      for (let b = 0; b < bandCount; b++) {
        const progress = ((timeSec * speed + b / bandCount) % 1.4) - 0.2;
        const bx = ox + progress * w;
        const bandW = w * 0.28;
        const g = ctx.createLinearGradient(bx, oy, bx + bandW, oy + h * 0.5);
        g.addColorStop(0, 'rgba(6, 12, 28, 0)');
        g.addColorStop(0.5, weather === 'STORM' ? 'rgba(6, 12, 32, 0.24)' : 'rgba(8, 20, 44, 0.13)');
        g.addColorStop(1, 'rgba(6, 12, 28, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(bx, oy);
        ctx.lineTo(bx + bandW, oy);
        ctx.lineTo(bx + bandW - w * 0.16, oy + h);
        ctx.lineTo(bx - w * 0.16, oy + h);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 1C. Multi-Layer Undulating Fog Banks for MIST
    if (profile.hasMistBanks) {
      for (let layer = 0; layer < 4; layer++) {
        const drift = ((timeSec * (0.025 + layer * 0.012) + layer * 0.27) % 1.5) - 0.25;
        const mx = ox + drift * w;
        const my = oy + (0.14 + layer * 0.23) * h + Math.sin(timeSec * 0.7 + layer) * 10;
        const mw = w * 0.52;
        const mistGrad = ctx.createRadialGradient(mx, my, mw * 0.08, mx, my, mw * 0.55);
        mistGrad.addColorStop(0, 'rgba(226, 232, 240, 0.22)');
        mistGrad.addColorStop(0.6, 'rgba(203, 213, 225, 0.11)');
        mistGrad.addColorStop(1, 'rgba(203, 213, 225, 0)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(ox, oy, w, h);
      }
    }

    // 1D. Sweeping Wind-Gust Ribbons for STORM, SNOW, SAND, LEAVES
    if (profile.hasWindRibbons) {
      const gustCount = weather === 'SAND' ? 7 : 5;
      for (let g = 0; g < gustCount; g++) {
        const speed = weather === 'SAND' ? 0.55 : weather === 'STORM' ? 0.48 : 0.22;
        const dir = weather === 'STORM' ? -1 : 1;
        const prog = ((timeSec * speed + g * 0.23) % 1.35) - 0.18;
        const gx = dir > 0 ? ox + prog * w : ox + (1 - prog) * w;
        const gy = oy + ((g * 0.19 + 0.08) % 0.88) * h + Math.sin(timeSec * 2.5 + g) * 8;
        const len = weather === 'SAND' ? 115 : 88;
        ctx.strokeStyle =
          weather === 'SAND'
            ? 'rgba(253, 230, 138, 0.28)'
            : weather === 'SNOW'
            ? 'rgba(224, 242, 254, 0.24)'
            : weather === 'LEAVES'
            ? 'rgba(254, 215, 170, 0.18)'
            : 'rgba(186, 230, 253, 0.24)';
        ctx.lineWidth = weather === 'SAND' ? 2.2 : 1.5;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.quadraticCurveTo(
          gx + dir * len * 0.5,
          gy - 7 + Math.sin(timeSec * 4 + g) * 5,
          gx + dir * len,
          gy + (weather === 'STORM' ? 16 : 4)
        );
        ctx.stroke();
      }
    }

    // 1E. Forked Pixel Lightning Bolt + Sky Flash for STORM
    if (profile.hasLightning) {
      const boltCycle = timeSec % 4.2;
      if (boltCycle < 0.28) {
        const flashAlpha = (1 - boltCycle / 0.28) * 0.44;
        ctx.fillStyle = `rgba(224, 242, 254, ${flashAlpha})`;
        ctx.fillRect(ox, oy, w, h);
        const seed = Math.floor(timeSec / 4.2);
        const bx = ox + w * (0.2 + ((seed * 41) % 62) / 100);
        const pts: Array<[number, number]> = [
          [bx, oy],
          [bx - 18, oy + h * 0.2],
          [bx + 14, oy + h * 0.4],
          [bx - 20, oy + h * 0.62],
          [bx + 8, oy + h * 0.84],
          [bx - 6, oy + h * 0.96],
        ];
        // Outer electric cyan glow
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.85 * (1 - boltCycle / 0.28)})`;
        ctx.lineWidth = 8;
        ctx.beginPath();
        pts.forEach(([px0, py0], idx) => (idx === 0 ? ctx.moveTo(px0, py0) : ctx.lineTo(px0, py0)));
        ctx.stroke();

        // Main jagged white-hot bolt + 2 fork branches
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        pts.forEach(([px0, py0], idx) => (idx === 0 ? ctx.moveTo(px0, py0) : ctx.lineTo(px0, py0)));
        // Fork branch 1
        ctx.moveTo(pts[1][0], pts[1][1]);
        ctx.lineTo(pts[1][0] - 28, pts[1][1] + h * 0.14);
        ctx.lineTo(pts[1][0] - 42, pts[1][1] + h * 0.22);
        // Fork branch 2
        ctx.moveTo(pts[2][0], pts[2][1]);
        ctx.lineTo(pts[2][0] + 32, pts[2][1] + h * 0.15);
        ctx.stroke();
      }
    }
    ctx.restore();

    // 2. Ground Puddle Ripple Splashes (RAIN & STORM)
    if (profile.hasSplashes) {
      ctx.save();
      for (let i = 0; i < this.splashes.length; i++) {
        const sp = this.splashes[i];
        sp.age += dt * (weather === 'STORM' ? 1.45 : 1.0);
        if (sp.age >= sp.maxAge) {
          sp.age -= sp.maxAge;
          sp.x = ((sp.x + 0.37 + i * 0.13) % 0.96) + 0.02;
          sp.y = ((sp.y + 0.53 + i * 0.19) % 0.92) + 0.04;
        }
        const t = sp.age / sp.maxAge;
        const sx = ox + sp.x * w;
        const sy = oy + sp.y * h;
        const curR = 2 + t * sp.radius;
        ctx.globalAlpha = (1 - t) * (weather === 'STORM' ? 0.65 : 0.52);
        ctx.strokeStyle = weather === 'STORM' ? '#e0f2fe' : '#93c5fd';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(sx, sy, curR, curR * 0.42, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Tiny upward bounce droplet at start of impact
        if (t < 0.35) {
          ctx.fillStyle = '#e0f2fe';
          ctx.fillRect(Math.round(sx - 1), Math.round(sy - t * 14), 2, 2);
        }
      }
      ctx.restore();
    }

    // 3. Depth-Layered Parallax Weather Particles
    const activeCount = Math.min(this.particles.length, profile.activeParticles);
    for (let i = 0; i < activeCount; i++) {
      const next = stepWeatherParticle(this.particles[i], weather, timeSec, dt);
      this.particles[i] = next;

      const sx = ox + next.x * w;
      const sy = oy + next.y * h;
      const depth = next.depth;

      ctx.save();
      ctx.globalAlpha = Math.min(1, next.alpha * (weather === 'STORM' ? 1.25 : 1.15));

      if (weather === 'RAIN' || weather === 'STORM') {
        const isStorm = weather === 'STORM';
        const dx = (isStorm ? 11 : 6.5) * depth;
        const dy = (isStorm ? 24 : 18) * depth;
        ctx.strokeStyle = depth > 1.02 ? '#e0f2fe' : isStorm ? '#7dd3fc' : '#93c5fd';
        ctx.lineWidth = depth > 1.08 ? (isStorm ? 2.4 : 2.0) : 1.35;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - dx, sy + dy);
        ctx.stroke();
      } else if (weather === 'SNOW') {
        const rx = Math.round(sx);
        const ry = Math.round(sy);
        if (depth > 1.05) {
          // Crisp 5x5 pixel snow crystal '+' cross with ice-blue halo
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(rx - 2, ry, 5, 1);
          ctx.fillRect(rx, ry - 2, 1, 5);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(rx - 1, ry - 1, 3, 3);
        } else {
          ctx.fillStyle = i % 3 === 0 ? '#bae6fd' : '#ffffff';
          ctx.fillRect(rx, ry, next.size, next.size);
        }
      } else if (weather === 'EMBERS') {
        const rx = Math.round(sx);
        const ry = Math.round(sy);
        const flicker = 0.65 + 0.35 * Math.sin(timeSec * 14 + next.phase);
        ctx.globalAlpha = Math.min(1, next.alpha * flicker * 1.3);
        if (i % 5 === 0) {
          // Dark volcanic ash flake
          ctx.fillStyle = '#475569';
          ctx.fillRect(rx, ry, 3, 2);
        } else {
          // Glowing fiery ember with white-hot core
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(rx - 1, ry - 1, next.size + 2, next.size + 2);
          ctx.fillStyle = i % 2 === 0 ? '#fde047' : '#fb923c';
          ctx.fillRect(rx, ry, next.size, next.size);
          if (depth > 1.08) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(rx, ry, 1, 1);
          }
        }
      } else if (weather === 'SPARKS') {
        const rx = Math.round(sx);
        const ry = Math.round(sy);
        const twinkle = 0.55 + 0.45 * Math.sin(timeSec * 9 + next.phase);
        ctx.globalAlpha = Math.min(1, twinkle);
        const color = i % 3 === 0 ? '#f472b6' : i % 3 === 1 ? '#38bdf8' : '#fde047';
        ctx.fillStyle = color;
        ctx.fillRect(rx, ry, next.size, next.size);
        if (depth > 1.02) {
          // 4-point arcane pixel star flare
          ctx.fillRect(rx - 2, ry, next.size + 4, 1);
          ctx.fillRect(rx, ry - 2, 1, next.size + 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(rx, ry, 1, 1);
        }
      } else if (weather === 'SAND') {
        ctx.fillStyle = i % 2 === 0 ? '#fde68a' : '#d97706';
        ctx.fillRect(Math.round(sx), Math.round(sy), Math.round(next.size * 3.8 * depth), 2);
      } else if (weather === 'MIST') {
        ctx.fillStyle = 'rgba(226, 232, 240, 0.24)';
        ctx.fillRect(Math.round(sx), Math.round(sy), Math.round((34 + next.size * 10) * depth), 8);
      } else if (weather === 'SUNLIGHT') {
        const rx = Math.round(sx);
        const ry = Math.round(sy);
        const glint = 0.45 + 0.55 * Math.sin(timeSec * 5 + next.phase);
        ctx.globalAlpha = glint * 0.9;
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(rx, ry, 2, 2);
        if (i % 3 === 0) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(rx - 2, ry, 6, 1);
          ctx.fillRect(rx, ry - 2, 1, 6);
        }
      } else {
        // LEAVES — tumbling fluttering autumn pixel leaves
        const rx = Math.round(sx);
        const ry = Math.round(sy);
        const flip = Math.sin(timeSec * 5.2 + next.phase);
        const lw = Math.max(2, Math.round((4 + depth) * Math.abs(flip)));
        const lh = Math.max(2, Math.round(3 + depth * 0.8));
        ctx.fillStyle =
          i % 4 === 0 ? '#f59e0b' : i % 4 === 1 ? '#ef4444' : i % 4 === 2 ? '#a3e635' : '#fb923c';
        ctx.fillRect(rx, ry, lw, lh);
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(rx, ry, 1, 1);
      }
      ctx.restore();
    }
  }
}
