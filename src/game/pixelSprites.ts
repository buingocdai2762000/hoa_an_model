import type { Faction, MagicElement, Unit, UnitClassId, UnitDomain, UnitTier, WeaponType } from './types';
import { drawRealisticPortraitCanvas, drawRealisticUnitCanvas } from './realisticMilitaryArt';

// ============================================================================
// MODERN WWI/WWII 5-DOMAIN CLASSIFIERS FOR ALL 121 CLASSES (30 LINEAGES + BOSS)
// ============================================================================

function isFighterPlaneClass(c: UnitClassId): boolean {
  return c === 'PEGASUS' || c === 'FALCON_KNIGHT' || c === 'SERAPH_KNIGHT' || c === 'CELESTIAL_VALKYRIE';
}

function isBomberPlaneClass(c: UnitClassId): boolean {
  return c === 'WYVERN_RIDER' || c === 'WYVERN_LORD' || c === 'DRAGONLORD' || c === 'SKY_SOVEREIGN';
}

function isHeliTransportClass(c: UnitClassId): boolean {
  return c === 'GRIFFIN_RIDER' || c === 'GRIFFIN_LORD' || c === 'SUN_GRIFFIN' || c === 'SOLAR_APEX_KNIGHT';
}

function isMediumTankClass(c: UnitClassId): boolean {
  return c === 'CAVALIER' || c === 'PALADIN' || c === 'SILVER_KNIGHT' || c === 'ASTRAL_CAVALIER';
}

function isHeavyTankClass(c: UnitClassId): boolean {
  return (
    c === 'KNIGHT' || c === 'GENERAL' || c === 'MARSHAL' || c === 'TITAN_CITADEL' ||
    c === 'DARK_GENERAL'
  );
}

function isTankDestroyerClass(c: UnitClassId): boolean {
  return c === 'DRAGOON' || c === 'WYRM_SLAYER' || c === 'DRAGON_KNIGHT' || c === 'ETERNAL_DRAGOON';
}

function isReconCarClass(c: UnitClassId): boolean {
  return c === 'NOMAD' || c === 'NOMAD_TROOPER' || c === 'BOW_KNIGHT' || c === 'TEMPEST_KHAN';
}

function isApcIfvClass(c: UnitClassId): boolean {
  return c === 'TROUBADOUR' || c === 'VALKYRIE' || c === 'SERAPH_RIDER' || c === 'CELESTIAL_EMPRESS';
}

function isSpaaAirArmorClass(c: UnitClassId): boolean {
  return c === 'OUTRIDER' || c === 'RANGER_KNIGHT' || c === 'HORIZON_LANCER' || c === 'STORM_STRIDER';
}

function isHowitzerMlrsClass(c: UnitClassId): boolean {
  return c === 'MAGE' || c === 'SAGE' || c === 'ARCHSAGE' || c === 'ASTRAL_ORACLE';
}

function isSiegeMissileClass(c: UnitClassId): boolean {
  return c === 'DARK_MAGE' || c === 'NECROMANCER' || c === 'DARK_DRUID' || c === 'ABYSSAL_ARCHON';
}

function isThermoRocketClass(c: UnitClassId): boolean {
  return c === 'SHAMAN' || c === 'SPIRIT_CALLER' || c === 'ELDER_ORACLE' || c === 'PRIMORDIAL_AVATAR';
}

function isSurfaceWarshipClass(c: UnitClassId): boolean {
  return c === 'PIRATE' || c === 'CORSAIR' || c === 'DREAD_CAPTAIN' || c === 'OCEAN_LEVIATHAN';
}

function isSubmarineClass(c: UnitClassId): boolean {
  return c === 'DARK_KNIGHT' || c === 'DOOM_RIDER' || c === 'DEATH_KNIGHT' || c === 'ABYSS_SOVEREIGN';
}

function isCarrierLandingClass(c: UnitClassId): boolean {
  return c === 'TEMPLAR' || c === 'AEGIS_GUARD' || c === 'HOLY_BASTION' || c === 'DIVINE_WARDEN';
}

function isCommanderClass(c: UnitClassId): boolean {
  return c === 'LORD' || c === 'GREAT_LORD' || c === 'SOVEREIGN' || c === 'EMPEROR_LORD';
}

function isMedicClass(c: UnitClassId): boolean {
  return (
    c === 'CLERIC' || c === 'BISHOP' || c === 'SAINT' || c === 'SERAPH_PROPHET' ||
    c === 'WAR_CLERIC' || c === 'BATTLE_PRIEST' || c === 'CRUSADER_BISHOP' || c === 'WRATHFUL_SERAPH'
  );
}

function isRadarSignalClass(c: UnitClassId): boolean {
  return (
    c === 'CHRONOMANCER' || c === 'ASTROLOGER' || c === 'TIME_WEAVER' || c === 'ETERNAL_CHRONOS' ||
    c === 'MONK' || c === 'EXORCIST' || c === 'INQUISITOR' || c === 'SOLAR_HIEROPHANT'
  );
}

function isSniperClass(c: UnitClassId): boolean {
  return c === 'ARCHER' || c === 'SNIPER' || c === 'MARKSMAN' || c === 'STARFALL_ARCHER';
}

function isHeavyMgFlameClass(c: UnitClassId): boolean {
  return c === 'FIGHTER' || c === 'BERSERKER' || c === 'REAVER' || c === 'WAR_GOD';
}

function isAntiTankInfClass(c: UnitClassId): boolean {
  return c === 'SOLDIER' || c === 'HALBERDIER' || c === 'SENTINEL' || c === 'SPEAR_EMPEROR';
}

function isSmgAssaultClass(c: UnitClassId): boolean {
  return c === 'MYRMIDON' || c === 'SWORDMASTER' || c === 'TRUEBLADE' || c === 'SWORD_SAINT';
}

function isGrenadierSapperClass(c: UnitClassId): boolean {
  return (
    c === 'BRAWLER' || c === 'WAR_MONK' || c === 'IRON_FIST_MASTER' || c === 'TITAN_DEMIGOD' ||
    c === 'SPELLBLADE' || c === 'MORTAL_SAVANT' || c === 'RUNE_BLADE' || c === 'AETHER_SOVEREIGN'
  );
}

function isStealthCommandoClass(c: UnitClassId): boolean {
  return (
    c === 'THIEF' || c === 'ASSASSIN' || c === 'WHISPER' || c === 'PHANTOM_REAPER' ||
    c === 'NINJA' || c === 'MASTER_NINJA' || c === 'SHADOW_KAGE' || c === 'PHANTOM_SHOGUN'
  );
}

function resolveSpriteDomain(c: UnitClassId): UnitDomain {
  if (isFighterPlaneClass(c) || isBomberPlaneClass(c) || isHeliTransportClass(c)) return 'AIRCRAFT';
  if (isSurfaceWarshipClass(c) || isSubmarineClass(c) || isCarrierLandingClass(c)) return 'NAVAL';
  if (
    isMediumTankClass(c) ||
    isHeavyTankClass(c) ||
    isTankDestroyerClass(c) ||
    isReconCarClass(c) ||
    isApcIfvClass(c) ||
    isSpaaAirArmorClass(c)
  ) {
    return 'ARMOR';
  }
  if (isHowitzerMlrsClass(c) || isSiegeMissileClass(c) || isThermoRocketClass(c)) return 'ARTILLERY';
  return 'INFANTRY';
}

function isFemaleStyledUnit(templateId: string, classId: UnitClassId): boolean {
  const tid = templateId.toLowerCase();
  if (
    tid === 'lyra' || tid === 'elara' || tid === 'veyra' || tid === 'mira' ||
    tid === 'celeste' || tid === 'sylvara' || tid === 'aurelia' || tid === 'astraea' ||
    tid === 'seraphina' || tid === 'freya' || tid === 'nyx' || tid === 'isolde'
  ) {
    return true;
  }
  return isMedicClass(classId) || isApcIfvClass(classId);
}

// ============================================================================
// 192x192 ULTRA-HD MILITARY PIXEL SPRITE + 192x192 BUST PORTRAIT ENGINE
// ============================================================================

export const SPRITE_W = 192;
export const SPRITE_H = 192;
export const SPRITE_SHEET_COLS = 4;
export const SPRITE_SHEET_ROWS = 3;

export const PORTRAIT_W = 192;
export const PORTRAIT_H = 192;

export type SpriteAnimState = 'idle' | 'selected' | 'walk';
export type SpriteAnimFrame = 0 | 1 | 2 | 3;

export interface UnitSpriteSheet {
  canvas: HTMLCanvasElement;
  frameWidth: number;
  frameHeight: number;
  cols: number;
  rows: number;
}

export interface CharacterPalette {
  outline: string;
  crease: string;
  hairLight: string;
  hairMid: string;
  hairDark: string;
  skinLight: string;
  skinMid: string;
  skinShade: string;
  armorLight: string;
  armorMid: string;
  armorDark: string;
  capeLight: string;
  capeMid: string;
  capeDark: string;
  goldLight: string;
  goldMid: string;
  goldDark: string;
  steelLight: string;
  steelMid: string;
  steelDark: string;
  eyeColor: string;
  mountLight: string;
  mountMid: string;
  mountDark: string;
  magicGlow: string;
  auraLight: string;
  auraMid: string;
}

// ============================================================================
// COLOR SCIENCE HELPERS
// ============================================================================

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2]
      : clean.padEnd(6, '0');
  const n = parseInt(full.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    '#' +
    ((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b))
      .toString(16)
      .slice(1)
  );
}

function packAbgr(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
}

function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

function desaturateToTwilight(hex: string, factor = 0.56): string {
  const [r, g, b] = hexToRgb(hex);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const nr = r * (1 - factor) + lum * 0.72 * factor;
  const ng = g * (1 - factor) + lum * 0.78 * factor;
  const nb = b * (1 - factor) + (lum * 0.92 + 12) * factor;
  return rgbToHex(nr, ng, nb);
}

function elementGlowColor(el?: MagicElement): string {
  switch (el) {
    case 'FIRE':
      return '#fb923c';
    case 'THUNDER':
      return '#facc15';
    case 'WIND':
      return '#4ade80';
    case 'ICE':
      return '#38bdf8';
    case 'DARK':
      return '#ef4444';
    case 'LIGHT':
      return '#fef08a';
    default:
      return '#fbbf24';
  }
}

export function getPaletteForUnit(
  classId: UnitClassId,
  templateId: string,
  faction: Faction,
  isBoss = false,
  acted = false,
  element: MagicElement = 'NONE'
): CharacterPalette {
  const glow = elementGlowColor(element);
  const domain = resolveSpriteDomain(classId);
  let pal: CharacterPalette;

  if (faction === 'PLAYER') {
    const base: CharacterPalette = {
      outline: '#101619',
      crease: '#1e2822',
      hairLight: '#d8b480',
      hairMid: '#755132',
      hairDark: '#332013',
      skinLight: '#fae3cf',
      skinMid: '#e2b18c',
      skinShade: '#ad7653',
      armorLight: '#9cb079',
      armorMid: '#5c6f42',
      armorDark: '#2c371f',
      capeLight: '#7dd3fc',
      capeMid: '#1d6fa5',
      capeDark: '#10375c',
      goldLight: '#fef08a',
      goldMid: '#d49b1a',
      goldDark: '#784c0c',
      steelLight: '#dce4ec',
      steelMid: '#8a99ab',
      steelDark: '#313d4b',
      eyeColor: '#1e40af',
      mountLight: '#93a874',
      mountMid: '#53663b',
      mountDark: '#27321b',
      magicGlow: glow,
      auraLight: '#bae6fd',
      auraMid: '#38bdf8',
    };

    if (domain === 'NAVAL') {
      pal = {
        ...base,
        armorLight: '#cbd5e1',
        armorMid: '#64748b',
        armorDark: '#1e293b',
        mountLight: isSubmarineClass(classId) ? '#6c7a89' : '#cfd8e3',
        mountMid: isSubmarineClass(classId) ? '#36414f' : '#697a8f',
        mountDark: isSubmarineClass(classId) ? '#131b26' : '#263445',
        capeLight: '#7dd3fc',
        capeMid: '#0369a1',
        capeDark: '#0c4a6e',
      };
    } else if (domain === 'AIRCRAFT') {
      pal = {
        ...base,
        armorLight: '#b0c0d0',
        armorMid: '#5d7288',
        armorDark: '#293847',
        mountLight: isHeliTransportClass(classId) ? '#8fa472' : '#b4c3d1',
        mountMid: isHeliTransportClass(classId) ? '#4f6339' : '#5e7389',
        mountDark: isHeliTransportClass(classId) ? '#253119' : '#283645',
        capeLight: '#7dd3fc',
        capeMid: '#1d6fa5',
        capeDark: '#103454',
      };
    } else if (domain === 'ARMOR') {
      pal = {
        ...base,
        armorLight: '#99ad76',
        armorMid: '#55693c',
        armorDark: '#28331b',
        mountLight: isHeavyTankClass(classId) ? '#8ca076' : '#99ad76',
        mountMid: isHeavyTankClass(classId) ? '#4b5c39' : '#55693c',
        mountDark: isHeavyTankClass(classId) ? '#222b19' : '#28331b',
      };
    } else if (domain === 'ARTILLERY') {
      pal = {
        ...base,
        armorLight: '#9ead80',
        armorMid: '#576942',
        armorDark: '#29331e',
        mountLight: '#92a178',
        mountMid: '#4f5d3c',
        mountDark: '#252d1b',
        capeLight: '#fcd34d',
        capeMid: '#b45309',
        capeDark: '#652b09',
      };
    } else if (isMedicClass(classId)) {
      pal = {
        ...base,
        hairLight: '#f3d9a4',
        hairMid: '#a1683a',
        hairDark: '#4a2c16',
        armorLight: '#9eb082',
        armorMid: '#5b6d45',
        armorDark: '#2b3620',
        capeLight: '#fca5a5',
        capeMid: '#dc2626',
        capeDark: '#7f1d1d',
      };
    } else if (isCommanderClass(classId)) {
      pal = {
        ...base,
        hairLight: '#dfc08e',
        hairMid: '#6e4c2f',
        hairDark: '#2d1c10',
        armorLight: '#a6b884',
        armorMid: '#596b3f',
        armorDark: '#28331b',
        capeLight: '#7dd3fc',
        capeMid: '#1d4ed8',
        capeDark: '#1e3a8a',
      };
    } else {
      const tid = templateId.toLowerCase();
      if (tid === 'lyra' || tid === 'mira' || tid === 'seraphina') {
        pal = { ...base, hairLight: '#f3d796', hairMid: '#b07437', hairDark: '#523114', eyeColor: '#0369a1' };
      } else if (tid === 'veyra' || tid === 'elara') {
        pal = { ...base, hairLight: '#e09f87', hairMid: '#8c3b2b', hairDark: '#3d150e', eyeColor: '#15803d' };
      } else if (tid === 'ren' || tid === 'kurogane' || tid === 'soren') {
        pal = { ...base, hairLight: '#94a3b8', hairMid: '#334155', hairDark: '#0f172a', armorLight: '#839672', armorMid: '#49593c', armorDark: '#21291b' };
      } else {
        pal = { ...base };
      }
    }
  } else {
    const enemyBase: CharacterPalette = {
      outline: '#120e10',
      crease: '#221b1e',
      hairLight: isBoss ? '#e5c98b' : '#b8c0c8',
      hairMid: isBoss ? '#8c5828' : '#5b6470',
      hairDark: isBoss ? '#3b220c' : '#20262e',
      skinLight: '#f4dccb',
      skinMid: '#d8a686',
      skinShade: '#9e694d',
      armorLight: '#8d998e',
      armorMid: '#4c584e',
      armorDark: '#232a24',
      capeLight: '#f87171',
      capeMid: '#dc2626',
      capeDark: '#7f1d1d',
      goldLight: isBoss ? '#fef08a' : '#fdba74',
      goldMid: isBoss ? '#d49b1a' : '#c26a1b',
      goldDark: isBoss ? '#784c0c' : '#6c310d',
      steelLight: '#dce4ec',
      steelMid: '#8a99ab',
      steelDark: '#2f3a47',
      eyeColor: '#991b1b',
      mountLight: '#88919b',
      mountMid: '#48515c',
      mountDark: '#1f252d',
      magicGlow: glow,
      auraLight: '#fca5a5',
      auraMid: '#ef4444',
    };

    if (isBoss) {
      pal = {
        ...enemyBase,
        armorLight: '#b6bec8',
        armorMid: '#39414d',
        armorDark: '#151921',
        mountLight: '#9aa2ad',
        mountMid: '#3e4550',
        mountDark: '#181c22',
        capeLight: '#fca5a5',
        capeMid: '#991b1b',
        capeDark: '#450a0a',
        auraLight: '#fef08a',
        auraMid: '#ef4444',
      };
    } else if (domain === 'NAVAL') {
      pal = {
        ...enemyBase,
        armorLight: '#94a3b8',
        armorMid: '#3c4858',
        armorDark: '#131b26',
        mountLight: isSubmarineClass(classId) ? '#636b75' : '#96a4b5',
        mountMid: isSubmarineClass(classId) ? '#313740' : '#4a5768',
        mountDark: '#141b24',
      };
    } else if (domain === 'AIRCRAFT') {
      pal = {
        ...enemyBase,
        armorLight: '#9ea7b2',
        armorMid: '#535d69',
        armorDark: '#252b33',
        mountLight: '#9ea7b2',
        mountMid: '#535d69',
        mountDark: '#252b33',
        capeLight: '#f87171',
        capeMid: '#dc2626',
        capeDark: '#7f1d1d',
      };
    } else if (domain === 'ARMOR') {
      pal = {
        ...enemyBase,
        armorLight: '#808994',
        armorMid: '#363f4b',
        armorDark: '#171c23',
        mountLight: '#868f99',
        mountMid: '#424b57',
        mountDark: '#1c2129',
      };
    } else if (domain === 'ARTILLERY') {
      pal = {
        ...enemyBase,
        armorLight: '#8e8a7d',
        armorMid: '#4a473d',
        armorDark: '#22201a',
        mountLight: '#918c7f',
        mountMid: '#4e4a40',
        mountDark: '#23211c',
        capeLight: '#fb923c',
        capeMid: '#c2410c',
        capeDark: '#7c2d12',
      };
    } else {
      pal = enemyBase;
    }
  }

  if (acted) {
    return {
      ...pal,
      outline: desaturateToTwilight(pal.outline, 0.35),
      crease: desaturateToTwilight(pal.crease, 0.45),
      hairLight: desaturateToTwilight(pal.hairLight, 0.56),
      hairMid: desaturateToTwilight(pal.hairMid, 0.56),
      hairDark: desaturateToTwilight(pal.hairDark, 0.56),
      skinLight: desaturateToTwilight(pal.skinLight, 0.46),
      skinMid: desaturateToTwilight(pal.skinMid, 0.48),
      skinShade: desaturateToTwilight(pal.skinShade, 0.5),
      armorLight: desaturateToTwilight(pal.armorLight, 0.58),
      armorMid: desaturateToTwilight(pal.armorMid, 0.58),
      armorDark: desaturateToTwilight(pal.armorDark, 0.58),
      capeLight: desaturateToTwilight(pal.capeLight, 0.58),
      capeMid: desaturateToTwilight(pal.capeMid, 0.58),
      capeDark: desaturateToTwilight(pal.capeDark, 0.58),
      goldLight: desaturateToTwilight(pal.goldLight, 0.55),
      goldMid: desaturateToTwilight(pal.goldMid, 0.55),
      goldDark: desaturateToTwilight(pal.goldDark, 0.55),
      steelLight: desaturateToTwilight(pal.steelLight, 0.5),
      steelMid: desaturateToTwilight(pal.steelMid, 0.5),
      steelDark: desaturateToTwilight(pal.steelDark, 0.5),
      mountLight: desaturateToTwilight(pal.mountLight, 0.55),
      mountMid: desaturateToTwilight(pal.mountMid, 0.55),
      mountDark: desaturateToTwilight(pal.mountDark, 0.55),
      auraLight: desaturateToTwilight(pal.auraLight, 0.6),
      auraMid: desaturateToTwilight(pal.auraMid, 0.6),
    };
  }
  return pal;
}

// ============================================================================
// HIGH-SPEED PALETTE-INDEXED 192x192 PIXEL RASTERIZER (BROWSER + NODE TESTS)
// ============================================================================

class PixelCanvas {
  public readonly w: number;
  public readonly h: number;
  public readonly data: Uint16Array;
  public readonly colorHex: string[] = [''];
  public readonly colorAbgr: number[] = [0];
  private readonly colorMap = new Map<string, number>();

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.data = new Uint16Array(w * h);
  }

  public colorIdx(hex: string | null): number {
    if (!hex) return 0;
    const found = this.colorMap.get(hex);
    if (found !== undefined) return found;
    const idx = this.colorHex.length;
    this.colorHex.push(hex);
    this.colorAbgr.push(packAbgr(hex));
    this.colorMap.set(hex, idx);
    return idx;
  }

  public set(x: number, y: number, color: string | null) {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.w || iy >= this.h) return;
    this.data[iy * this.w + ix] = this.colorIdx(color);
  }

  public rect(x: number, y: number, rw: number, rh: number, color: string) {
    const c = this.colorIdx(color);
    const x0 = Math.max(0, Math.round(x));
    const y0 = Math.max(0, Math.round(y));
    const x1 = Math.min(this.w, Math.round(x + rw));
    const y1 = Math.min(this.h, Math.round(y + rh));
    if (x1 <= x0 || y1 <= y0) return;
    for (let py = y0; py < y1; py++) {
      this.data.fill(c, py * this.w + x0, py * this.w + x1);
    }
  }

  public bevelBox(
    x: number,
    y: number,
    rw: number,
    rh: number,
    mid: string,
    light: string,
    dark: string,
    bevel = 2
  ) {
    this.rect(x, y, rw, rh, dark);
    if (rw > bevel * 2 && rh > bevel * 2) {
      this.rect(x + bevel, y + bevel, rw - bevel * 2, rh - bevel * 2, mid);
      this.rect(x + bevel, y + bevel, rw - bevel * 2, bevel, light);
      this.rect(x + bevel, y + bevel, bevel, rh - bevel * 3, light);
    }
  }

  public ditherRect(x: number, y: number, rw: number, rh: number, colA: string, colB: string, _step = 2) {
    const splitH = Math.max(1, Math.round(rh * 0.55));
    this.rect(x, y, rw, splitH, colA);
    if (rh > splitH) {
      this.rect(x, y + splitH, rw, rh - splitH, colB);
    }
  }

  public ellipse(cx: number, cy: number, rx: number, ry: number, color: string) {
    if (rx <= 0 || ry <= 0) return;
    const c = this.colorIdx(color);
    const minY = Math.max(0, Math.floor(cy - ry));
    const maxY = Math.min(this.h - 1, Math.ceil(cy + ry));
    for (let py = minY; py <= maxY; py++) {
      const dy = (py - cy) / ry;
      const rem = 1 - dy * dy;
      if (rem < 0) continue;
      const span = rx * Math.sqrt(rem);
      const minX = Math.max(0, Math.round(cx - span));
      const maxX = Math.min(this.w - 1, Math.round(cx + span));
      if (maxX >= minX) {
        this.data.fill(c, py * this.w + minX, py * this.w + maxX + 1);
      }
    }
  }

  public line(x0: number, y0: number, x1: number, y1: number, color: string, thickness = 1) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))));
    const half = Math.floor(thickness / 2);
    const c = this.colorIdx(color);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = Math.round(x0 + dx * t);
      const py = Math.round(y0 + dy * t);
      if (thickness <= 1) {
        if (px >= 0 && py >= 0 && px < this.w && py < this.h) {
          this.data[py * this.w + px] = c;
        }
      } else {
        const rx0 = Math.max(0, px - half);
        const ry0 = Math.max(0, py - half);
        const rx1 = Math.min(this.w, px - half + thickness);
        const ry1 = Math.min(this.h, py - half + thickness);
        for (let yy = ry0; yy < ry1; yy++) {
          this.data.fill(c, yy * this.w + rx0, yy * this.w + rx1);
        }
      }
    }
  }

  public poly(pts: ReadonlyArray<readonly [number, number]>, color: string) {
    const n = pts.length;
    if (n < 3) return;
    const c = this.colorIdx(color);
    let minY = this.h;
    let maxY = -1;
    for (let i = 0; i < n; i++) {
      const y = pts[i][1];
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const y0 = Math.max(0, Math.floor(minY));
    const y1 = Math.min(this.h - 1, Math.ceil(maxY));
    const xs: number[] = [];
    for (let py = y0; py <= y1; py++) {
      xs.length = 0;
      const sampleY = py + 0.5;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = pts[i][0];
        const yi = pts[i][1];
        const xj = pts[j][0];
        const yj = pts[j][1];
        if ((yi <= sampleY && yj > sampleY) || (yj <= sampleY && yi > sampleY)) {
          xs.push(xi + ((sampleY - yi) / (yj - yi)) * (xj - xi));
        }
      }
      xs.sort((a, b) => a - b);
      const rowOff = py * this.w;
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const startX = Math.max(0, Math.round(xs[k]));
        const endX = Math.min(this.w - 1, Math.round(xs[k + 1]));
        if (endX >= startX) {
          this.data.fill(c, rowOff + startX, rowOff + endX + 1);
        }
      }
    }
  }

  public strokePoly(
    pts: ReadonlyArray<readonly [number, number]>,
    color: string,
    thickness = 1,
    closed = true
  ) {
    if (pts.length < 2) return;
    for (let i = 0; i < pts.length - 1; i++) {
      this.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], color, thickness);
    }
    if (closed && pts.length >= 3) {
      const last = pts[pts.length - 1];
      this.line(last[0], last[1], pts[0][0], pts[0][1], color, thickness);
    }
  }

  public capsule(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    r0: number,
    r1: number,
    color: string
  ) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) * 1.15));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const r = Math.max(0.6, r0 + (r1 - r0) * t);
      this.ellipse(x0 + dx * t, y0 + dy * t, r, r, color);
    }
  }

  public litCapsule(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    r0: number,
    r1: number,
    dark: string,
    mid: string,
    light: string
  ) {
    this.capsule(x0, y0, x1, y1, r0, r1, dark);
    const len = Math.max(1, Math.hypot(x1 - x0, y1 - y0));
    // Normal pointing toward top-left light source
    let nx = -(y1 - y0) / len;
    let ny = (x1 - x0) / len;
    if (nx * -0.6 + ny * -0.8 < 0) {
      nx = -nx;
      ny = -ny;
    }
    this.capsule(
      x0 + nx * 0.7,
      y0 + ny * 0.7,
      x1 + nx * 0.7,
      y1 + ny * 0.7,
      Math.max(0.8, r0 * 0.78),
      Math.max(0.8, r1 * 0.78),
      mid
    );
    this.capsule(
      x0 + nx * (r0 * 0.34),
      y0 + ny * (r0 * 0.34),
      x1 + nx * (r1 * 0.34),
      y1 + ny * (r1 * 0.34),
      Math.max(0.6, r0 * 0.36),
      Math.max(0.6, r1 * 0.36),
      light
    );
  }

  public triangle(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string
  ) {
    const c = this.colorIdx(color);
    const minX = Math.max(0, Math.floor(Math.min(x0, x1, x2)));
    const maxX = Math.min(this.w - 1, Math.ceil(Math.max(x0, x1, x2)));
    const minY = Math.max(0, Math.floor(Math.min(y0, y1, y2)));
    const maxY = Math.min(this.h - 1, Math.ceil(Math.max(y0, y1, y2)));
    const area = (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
    if (Math.abs(area) < 0.001) return;
    for (let py = minY; py <= maxY; py++) {
      const rowOff = py * this.w;
      for (let px = minX; px <= maxX; px++) {
        const w0 = (x1 - px) * (y2 - py) - (y1 - py) * (x2 - px);
        const w1 = (x2 - px) * (y0 - py) - (y2 - py) * (x0 - px);
        const w2 = (x0 - px) * (y1 - py) - (y0 - py) * (x1 - px);
        if (
          (area > 0 && w0 >= 0 && w1 >= 0 && w2 >= 0) ||
          (area < 0 && w0 <= 0 && w1 <= 0 && w2 <= 0)
        ) {
          this.data[rowOff + px] = c;
        }
      }
    }
  }

  public quad(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    color: string
  ) {
    this.triangle(x0, y0, x1, y1, x2, y2, color);
    this.triangle(x0, y0, x2, y2, x3, y3, color);
  }

  public rivetRow(x0: number, y0: number, x1: number, y1: number, count: number, light: string, dark: string) {
    if (count <= 0) return;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const rx = Math.round(x0 + (x1 - x0) * t);
      const ry = Math.round(y0 + (y1 - y0) * t);
      this.rect(rx, ry, 2, 2, dark);
      this.set(rx, ry, light);
    }
  }

  public wheelDetailed(
    cx: number,
    cy: number,
    outerR: number,
    rimR: number,
    hubR: number,
    tireDark: string,
    tireMid: string,
    rimCol: string,
    hubCol: string,
    shift = 0
  ) {
    this.ellipse(cx, cy, outerR, outerR, tireDark);
    this.ellipse(cx, cy - 0.5, Math.max(2, outerR - 2), Math.max(2, outerR - 2), tireMid);
    // Subtle outer tread notches
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4 + shift * 0.35;
      this.rect(
        Math.round(cx + Math.cos(a) * (outerR - 1.5)) - 1,
        Math.round(cy + Math.sin(a) * (outerR - 1.5)) - 1,
        2,
        2,
        tireDark
      );
    }
    this.ellipse(cx, cy, rimR, rimR, tireDark);
    this.ellipse(cx, cy - 0.5, Math.max(2, rimR - 1.5), Math.max(2, rimR - 1.5), rimCol);
    // Wheel lug bolts around hub
    if (rimR >= 7) {
      for (let b = 0; b < 5; b++) {
        const ba = (b * Math.PI * 2) / 5 + shift * 0.4;
        this.set(cx + Math.cos(ba) * (hubR + 2), cy + Math.sin(ba) * (hubR + 2), tireDark);
      }
    }
    this.ellipse(cx, cy, hubR, hubR, hubCol);
    this.set(cx - 1, cy - 1, '#f8fafc');
  }

  public addSelectiveOutline(outlineColor: string, thickness = 2) {
    const outIdx = this.colorIdx(outlineColor);
    const w = this.w;
    const h = this.h;
    for (let pass = 0; pass < thickness; pass++) {
      const snap = new Uint16Array(this.data);
      for (let y = 0; y < h; y++) {
        const rowOff = y * w;
        for (let x = 0; x < w; x++) {
          if (snap[rowOff + x] !== 0) continue;
          if (
            (x > 0 && snap[rowOff + x - 1] !== 0) ||
            (x + 1 < w && snap[rowOff + x + 1] !== 0) ||
            (y > 0 && snap[rowOff - w + x] !== 0) ||
            (y + 1 < h && snap[rowOff + w + x] !== 0)
          ) {
            this.data[rowOff + x] = outIdx;
          }
        }
      }
    }
  }

  public toNullableGrid(): (string | null)[][] {
    const rows: (string | null)[][] = new Array(this.h);
    const hex = this.colorHex;
    for (let y = 0; y < this.h; y++) {
      const row = new Array<string | null>(this.w);
      const off = y * this.w;
      for (let x = 0; x < this.w; x++) {
        const idx = this.data[off + x];
        row[x] = idx === 0 ? null : hex[idx];
      }
      rows[y] = row;
    }
    return rows;
  }
}

// ============================================================================
// 1. REALISTIC 192x192 MILITARY INFANTRY RENDERER (1:5.8 ANATOMICAL PROPORTIONS)
// ============================================================================

function drawRealisticBoot(
  p: PixelCanvas,
  ankleX: number,
  soleY: number,
  bootLen: number,
  leatherDark: string,
  leatherMid: string,
  leatherLight: string
) {
  // Sculpted combat boot with distinct heel block, arched instep, rounded toe cap & lugged sole
  p.poly(
    [
      [ankleX - 8, soleY - 17],
      [ankleX + 6, soleY - 17],
      [ankleX + 9, soleY - 9],
      [ankleX + bootLen - 2, soleY - 6],
      [ankleX + bootLen, soleY - 2],
      [ankleX - 9, soleY - 2],
    ],
    leatherDark
  );
  p.poly(
    [
      [ankleX - 6, soleY - 15],
      [ankleX + 5, soleY - 15],
      [ankleX + 8, soleY - 8],
      [ankleX + bootLen - 4, soleY - 5],
      [ankleX + bootLen - 3, soleY - 3],
      [ankleX - 7, soleY - 3],
    ],
    leatherMid
  );
  p.ellipse(ankleX + bootLen - 6, soleY - 5, 5, 2.5, leatherLight);
  // Rubber lugged sole + heel gap
  p.rect(ankleX - 9, soleY - 2, 8, 3, '#09090b');
  p.rect(ankleX + 2, soleY - 2, bootLen - 1, 3, '#09090b');
  // Boot laces
  for (let ly = soleY - 14; ly <= soleY - 8; ly += 3) {
    p.line(ankleX + 3, ly, ankleX + 7, ly, '#78716c', 1);
  }
}

function drawInfantryUnit(
  p: PixelCanvas,
  pal: CharacterPalette,
  classId: UnitClassId,
  wType: WeaponType,
  isBoss: boolean,
  tier: UnitTier,
  frame: SpriteAnimFrame,
  animState: SpriteAnimState
) {
  const cx = 82;
  const bob = animState === 'walk' ? (frame % 2 === 1 ? -4 : 0) : frame === 1 || frame === 2 ? -2 : 0;
  const stride = animState === 'walk' ? (frame === 1 ? 11 : frame === 3 ? -11 : 0) : 0;
  const armLift = animState === 'selected' ? -4 : 0;
  const tStep = tier - 1; // 0, 1, 2, 3
  const isGermanHelmetStyle = pal.eyeColor === '#991b1b' || isBoss;
  const trouserDark = mixHex(pal.armorDark, '#1c1917', 0.28);
  const trouserMid = mixHex(pal.armorMid, '#44403c', 0.22);
  const trouserLight = mixHex(pal.armorLight, '#a8a29e', 0.16);
  const webDark = tier >= 3 ? '#1f2937' : '#3e2718';
  const webLight = tier >= 3 ? '#4b5563' : '#6f482c';

  // 1. Rear Tactical Coat / Field Cloak (T3-T4) & Era-Authentic Rucksack / Radio / Fuel Rig
  if (tier >= 3 || isCommanderClass(classId) || isBoss) {
    // Wind-swept military rain-cape / tactical Half-Mantle behind rear shoulder (adds authentic silhouette breadth)
    const capeLeft = cx - 32 - tStep * 7;
    const capeBottom = 136 + tStep * 8 + bob;
    p.poly(
      [
        [cx - 12, 66 + bob],
        [cx + 6, 70 + bob],
        [cx - 8, capeBottom - 6],
        [capeLeft, capeBottom],
        [capeLeft + 6, 98 + bob],
      ],
      tier >= 4 ? pal.armorDark : mixHex(pal.armorDark, pal.capeDark, 0.35)
    );
    p.poly(
      [
        [cx - 11, 68 + bob],
        [cx + 2, 72 + bob],
        [cx - 10, capeBottom - 10],
        [capeLeft + 4, capeBottom - 4],
        [capeLeft + 9, 100 + bob],
      ],
      tier >= 4 ? mixHex(pal.armorMid, pal.capeDark, 0.25) : pal.armorMid
    );
  }

  const packW = 20 + tStep * 5;
  const packH = 34 + tStep * 5;
  const packX = cx - 28 - tStep * 5;
  const packY = 68 - tStep * 2 + bob;

  if (isRadarSignalClass(classId)) {
    // Field Radio / Forward Observer SATCOM Pack with Fold-Out Dish & Whip Antenna
    p.bevelBox(packX, packY, packW, packH, pal.steelMid, pal.steelLight, pal.steelDark, 2);
    p.rect(packX + 4, packY + 6, packW - 8, 10, '#0f172a');
    p.rect(packX + 6, packY + 8, Math.max(4, packW - 12), 3, '#4ade80');
    const dishR = 11 + tStep * 4;
    const dishCx = Math.max(18, packX - 4 - tStep * 2);
    const dishCy = Math.max(22, packY - 12 - tStep * 4);
    p.line(packX + 8, packY + 4, dishCx, dishCy, pal.steelDark, 4);
    p.ellipse(dishCx, dishCy, dishR, dishR - 2, pal.steelDark);
    p.ellipse(dishCx + 1, dishCy - 1, dishR - 2, dishR - 4, pal.steelLight);
    p.ellipse(dishCx + 2, dishCy - 1, Math.max(4, dishR - 6), Math.max(4, dishR - 7), '#0369a1');
    p.line(dishCx + 2, dishCy - 1, dishCx + dishR - 1, dishCy - 4, pal.goldLight, 2);
  } else if (isHeavyMgFlameClass(classId) && tier >= 2) {
    // Heavy Ammo Backpack / Twin Pressurized Fuel Cylinders
    const cylR = 5 + tStep;
    p.litCapsule(packX + cylR, packY + 4, packX + cylR, packY + packH - 4, cylR, cylR, '#450a0a', '#991b1b', '#f87171');
    p.litCapsule(packX + cylR * 2 + 3, packY + 4, packX + cylR * 2 + 3, packY + packH - 4, cylR, cylR, '#1e293b', pal.steelMid, pal.steelLight);
    p.rect(packX, packY + 10, cylR * 3 + 5, 4, pal.steelDark);
    p.rect(packX, packY + packH - 12, cylR * 3 + 5, 4, pal.steelDark);
  } else {
    // Canvas / CORDURA Field Rucksack + Rolled Bedroll on Top
    p.bevelBox(packX, packY + 5, packW, packH - 5, pal.armorMid, pal.armorLight, pal.armorDark, 2);
    p.litCapsule(packX + 2, packY + 3, packX + packW - 2, packY + 3, 4.5, 4.5, '#3e2718', '#6b462b', '#a67c52');
    p.rect(packX + 3, packY + 14, packW - 6, 4, webDark);
    p.rect(packX + Math.floor(packW / 2) - 2, packY + 13, 4, 6, pal.goldMid);
    if (tier >= 2) {
      const antTop = Math.max(14, packY - 18 - tStep * 7);
      p.line(packX + 6, packY + 4, packX + 2, antTop, pal.steelDark, 2);
      p.set(packX + 2, antTop, tier >= 4 ? '#38bdf8' : '#4ade80');
    }
  }

  // Tier 4 Compact Tactical Recon Quad-Rotor UAV hovering over rear flank (modern spec-ops force multiplier)
  if (tier >= 4) {
    const uavY = 30 + bob + (frame % 2 === 0 ? 0 : -3);
    p.line(10, uavY - 4, 48, uavY - 4, pal.steelDark, 3);
    p.line(8, uavY - 7, 23, uavY - 7, '#cbd5e1', 2);
    p.line(35, uavY - 7, 50, uavY - 7, '#cbd5e1', 2);
    p.poly(
      [
        [18, uavY - 5],
        [40, uavY - 5],
        [43, uavY + 2],
        [36, uavY + 6],
        [22, uavY + 6],
        [15, uavY + 2],
      ],
      pal.steelMid
    );
    p.line(20, uavY - 4, 38, uavY - 4, pal.steelLight, 2);
    p.ellipse(30, uavY + 7, 4, 4, '#0f172a');
    p.ellipse(31, uavY + 7, 2, 2, '#38bdf8');
  }

  // 2. Dynamic 3/4 Braced Combat Legs (Anatomical Thighs, Bent Knees, Bloused Calves & Laced Combat Boots)
  const hipY = 117 + bob;
  const rearHipX = cx - 9 + Math.round(stride * 0.5);
  const rearKneeX = cx - 18 - tStep * 3 + stride;
  const rearKneeY = 146 + Math.round(bob * 0.5);
  const rearAnkleX = cx - 25 - tStep * 4 + stride;
  const soleY = 180;

  const frontHipX = cx + 9 - Math.round(stride * 0.5);
  const frontKneeX = cx + 21 + tStep * 3 - stride;
  const frontKneeY = 145 + Math.round(bob * 0.5);
  const frontAnkleX = cx + 18 + tStep * 4 - stride;

  // Rear Leg (Thigh -> Knee -> Calf -> Boot)
  p.litCapsule(rearHipX, hipY, rearKneeX, rearKneeY, 9 + tStep * 0.6, 7.5 + tStep * 0.5, trouserDark, trouserMid, trouserLight);
  p.litCapsule(rearKneeX, rearKneeY, rearAnkleX, soleY - 14, 7.5 + tStep * 0.5, 6, trouserDark, trouserMid, trouserLight);
  if (tier === 1) {
    // WWI Spiral Wool Puttees
    for (let py = rearKneeY + 4; py <= soleY - 16; py += 4) {
      p.line(rearAnkleX - 5, py, rearKneeX + 3, py + 1, trouserDark, 2);
    }
  } else if (tier === 2) {
    // WWII Canvas Gaiters / Leggings
    p.capsule(rearKneeX - 1, rearKneeY + 5, rearAnkleX, soleY - 14, 6.2, 5.8, '#8c7d65');
  } else {
    // Modern Molded Tactical Knee Pad
    p.ellipse(rearKneeX + 2, rearKneeY, 6, 5, '#1e293b');
    p.ellipse(rearKneeX + 3, rearKneeY - 1, 3.5, 3, pal.steelMid);
  }
  drawRealisticBoot(p, rearAnkleX, soleY, 20 + tStep, '#18181b', '#332f2c', '#57534e');

  // Front Leg (Thigh -> Bent Knee -> Shin -> Boot)
  p.litCapsule(frontHipX, hipY, frontKneeX, frontKneeY, 9.5 + tStep * 0.7, 8 + tStep * 0.5, trouserDark, trouserMid, trouserLight);
  p.litCapsule(frontKneeX, frontKneeY, frontAnkleX, soleY - 14, 8 + tStep * 0.5, 6.2, trouserDark, trouserMid, trouserLight);
  // Cargo thigh pocket
  p.bevelBox(frontHipX + 1, hipY + 9, 10, 11, trouserDark, trouserMid, '#141812', 1);
  if (tier === 1) {
    for (let py = frontKneeY + 4; py <= soleY - 16; py += 4) {
      p.line(frontAnkleX - 5, py, frontAnkleX + 5, py + 1, trouserDark, 2);
    }
  } else if (tier === 2) {
    p.capsule(frontKneeX - 1, frontKneeY + 5, frontAnkleX, soleY - 14, 6.5, 6, '#9c8c72');
  } else {
    p.ellipse(frontKneeX + 3, frontKneeY, 6.5, 5.5, '#1e293b');
    p.ellipse(frontKneeX + 4, frontKneeY - 1, 4, 3, pal.steelLight);
  }
  drawRealisticBoot(p, frontAnkleX, soleY, 21 + tStep, '#18181b', '#3a3532', '#68625d');

  // 3. Tailored 3/4 Military Field Tunic, Flared Coat Skirt, Webbing & Ballistic Plate Carrier
  const shoulderHalf = 19 + tStep * 2.5;
  const waistHalf = 15 + tStep * 2;
  const skirtHalf = 19 + tStep * 2.5;
  const torsoTop = 64 + bob;
  const waistY = 102 + bob;
  const skirtBot = 122 + bob;

  // Flared Field Tunic Skirt (overlaps hips naturally like a real WWI/WWII/combat jacket!)
  p.poly(
    [
      [cx - waistHalf, waistY],
      [cx + waistHalf + 2, waistY],
      [cx + skirtHalf + 4, skirtBot],
      [cx - skirtHalf - 2, skirtBot],
    ],
    pal.armorDark
  );
  p.poly(
    [
      [cx - waistHalf + 2, waistY + 1],
      [cx + waistHalf, waistY + 1],
      [cx + skirtHalf + 2, skirtBot - 2],
      [cx - skirtHalf + 1, skirtBot - 2],
    ],
    pal.armorMid
  );
  p.line(cx + 3, waistY + 2, cx + 4, skirtBot - 2, pal.crease, 2); // Coat center split

  // Sculpted Anatomical Upper Torso (Broad Shoulders tapering to Waist)
  p.poly(
    [
      [cx - shoulderHalf, torsoTop + 3],
      [cx - 7, torsoTop - 1],
      [cx + 9, torsoTop - 1],
      [cx + shoulderHalf + 2, torsoTop + 4],
      [cx + waistHalf + 2, waistY + 2],
      [cx - waistHalf, waistY + 2],
    ],
    pal.armorDark
  );
  p.poly(
    [
      [cx - shoulderHalf + 2, torsoTop + 4],
      [cx - 6, torsoTop + 1],
      [cx + 8, torsoTop + 1],
      [cx + shoulderHalf, torsoTop + 5],
      [cx + waistHalf, waistY],
      [cx - waistHalf + 2, waistY],
    ],
    pal.armorMid
  );
  // Chest zenith light plane
  p.poly(
    [
      [cx - shoulderHalf + 5, torsoTop + 5],
      [cx + shoulderHalf - 2, torsoTop + 5],
      [cx + waistHalf - 2, torsoTop + 21],
      [cx - waistHalf + 5, torsoTop + 21],
    ],
    pal.armorLight
  );

  // Open Collar Lapels + Undershirt + Medic Armband / Shoulder Epaulettes
  p.triangle(cx - 5, torsoTop, cx + 9, torsoTop, cx + 3, torsoTop + 14, '#292524');
  p.line(cx - 7, torsoTop + 1, cx + 2, torsoTop + 14, pal.armorDark, 3);
  p.line(cx + 10, torsoTop + 1, cx + 3, torsoTop + 14, pal.armorDark, 3);

  // Branch / Faction Shoulder Insignia & Deltoid Armor Pads (T3-T4)
  if (tier >= 3) {
    p.bevelBox(cx - shoulderHalf - 4, torsoTop + 1, 13, 16, pal.steelMid, pal.steelLight, pal.steelDark, 2);
    p.rect(cx - shoulderHalf - 1, torsoTop + 5, 7, 5, pal.capeMid);
    p.bevelBox(cx + shoulderHalf - 7, torsoTop + 1, 13, 16, pal.steelMid, pal.steelLight, pal.steelDark, 2);
  } else {
    p.line(cx - shoulderHalf + 2, torsoTop + 3, cx - 8, torsoTop + 1, pal.capeMid, 3);
    p.line(cx + 8, torsoTop + 1, cx + shoulderHalf, torsoTop + 3, pal.capeMid, 3);
  }

  // Load-Bearing Harness, Belt, Buckle, Canteen & Ammo Pouches
  p.rect(cx - waistHalf - 1, waistY - 3, waistHalf * 2 + 4, 7, webDark);
  p.bevelBox(cx + 1, waistY - 4, 8, 8, pal.goldMid, pal.goldLight, pal.goldDark, 1);
  // Canteen / Holster at hip
  p.bevelBox(cx - waistHalf - 2, waistY + 2, 9, 13, webDark, webLight, '#14110f', 1);

  if (tier <= 2) {
    // WWI/WWII Y-Strap Leather Harness + Brass Buttons + Cartridge Pouches
    p.line(cx - 10, torsoTop + 3, cx - 5, waistY - 3, webDark, 3);
    p.line(cx + 11, torsoTop + 3, cx + 8, waistY - 3, webDark, 3);
    if (isCommanderClass(classId) || tier === 1) {
      p.line(cx - 12, torsoTop + 4, cx + 10, waistY - 2, webLight, 3); // Sam Browne cross-strap
    }
    p.bevelBox(cx - 13, waistY - 6, 10, 10, webDark, webLight, '#14110f', 1);
    p.bevelBox(cx + 10, waistY - 6, 10, 10, webDark, webLight, '#14110f', 1);
  } else {
    // Modern SAPI Ballistic Plate Carrier + Triple STANAG Mag Shingles + Comms PTT
    p.bevelBox(cx - 13, torsoTop + 10, 28, 28, pal.armorDark, pal.armorMid, '#141a14', 2);
    for (let m = 0; m < 3; m++) {
      p.bevelBox(cx - 11 + m * 8, torsoTop + 23, 7, 13, webDark, webLight, '#0f1419', 1);
    }
    if (tier >= 4 || isBoss) {
      // Tactical Chest ATAK Comms Module
      p.bevelBox(cx - 6, torsoTop + 12, 14, 9, '#0f172a', pal.steelLight, '#020617', 1);
      p.rect(cx - 3, torsoTop + 14, 8, 4, '#38bdf8');
    }
  }

  // 4. Realistic Proportioned 3/4 Human Head (Cranium ~24x27px — Authentic Soldier Scale!)
  const headCx = cx + 2;
  const headCy = 44 + bob;
  // Muscular neck + chin shadow
  p.litCapsule(headCx - 2, headCy + 10, cx, torsoTop + 2, 6.5, 7.5, pal.skinShade, pal.skinMid, pal.skinLight);
  // Cranium & sculpted 3/4 jawline
  p.ellipse(headCx, headCy - 2, 12.5, 13, pal.skinShade);
  p.poly(
    [
      [headCx - 11, headCy - 2],
      [headCx + 12, headCy - 2],
      [headCx + 11, headCy + 8],
      [headCx + 5, headCy + 14],
      [headCx - 3, headCy + 13],
      [headCx - 10, headCy + 7],
    ],
    pal.skinMid
  );
  p.ellipse(headCx + 3, headCy - 4, 8.5, 8, pal.skinLight);
  // Ear & cheekbone shade
  p.ellipse(headCx - 10, headCy + 2, 3, 4.5, pal.skinShade);
  p.line(headCx - 6, headCy + 9, headCx + 4, headCy + 13, pal.skinShade, 2);

  // Subtle Realistic Facial Features (No cartoon 8x8 white blocks!)
  if (tier >= 4 && !isCommanderClass(classId) && !isMedicClass(classId)) {
    // Spec-Ops Ballistic Half-Mask + Articulated Quad-Tube GPNVG-18 Night Vision
    p.poly(
      [
        [headCx - 9, headCy + 3],
        [headCx + 12, headCy + 3],
        [headCx + 10, headCy + 13],
        [headCx - 5, headCy + 13],
      ],
      '#1e293b'
    );
    p.rect(headCx - 4, headCy - 5, 19, 7, '#0f172a');
    for (let g = 0; g < 3; g++) {
      const gx = headCx - 1 + g * 6;
      p.ellipse(gx + 2, headCy - 2, 2.8, 2.8, '#0f172a');
      p.ellipse(gx + 2, headCy - 2, 1.8, 1.8, '#4ade80');
    }
  } else if (tier === 3 && !isCommanderClass(classId) && !isMedicClass(classId)) {
    // Modern Tinted Ballistic Combat Eye-Pro (Oakley M-Frame / ESS) + Mic Boom
    p.poly(
      [
        [headCx - 5, headCy - 5],
        [headCx + 13, headCy - 5],
        [headCx + 12, headCy + 1],
        [headCx - 3, headCy + 1],
      ],
      '#0f172a'
    );
    p.line(headCx - 2, headCy - 3, headCx + 11, headCy - 3, '#38bdf8', 2);
    p.line(headCx + 9, headCy + 1, headCx + 11, headCy + 5, pal.skinShade, 1); // nose
    p.line(headCx + 2, headCy + 9, headCx + 8, headCy + 9, pal.skinShade, 2); // mouth
    p.line(headCx - 9, headCy + 5, headCx + 4, headCy + 9, '#1e293b', 2); // headset boom mic
  } else {
    // Realistic 3/4 Soldier Eyes, Brow Shadow, Nose Bridge & Determined Mouth
    p.line(headCx - 4, headCy - 5, headCx + 11, headCy - 5, pal.hairDark, 2); // brow ridge shadow
    // Left (near-center) eye
    p.rect(headCx - 2, headCy - 3, 4, 2, '#f8fafc');
    p.rect(headCx - 1, headCy - 3, 2, 2, pal.outline);
    // Right (far) eye
    p.rect(headCx + 7, headCy - 3, 3, 2, '#f8fafc');
    p.rect(headCx + 8, headCy - 3, 2, 2, pal.outline);
    // Nose bridge & tip
    p.line(headCx + 5, headCy - 3, headCx + 7, headCy + 3, pal.skinLight, 2);
    p.line(headCx + 4, headCy + 4, headCx + 7, headCy + 4, pal.skinShade, 1);
    if (isStealthCommandoClass(classId)) {
      p.poly(
        [
          [headCx - 9, headCy + 3],
          [headCx + 12, headCy + 3],
          [headCx + 10, headCy + 13],
          [headCx - 5, headCy + 13],
        ],
        pal.armorDark
      );
    } else {
      p.line(headCx + 1, headCy + 8, headCx + 7, headCy + 8, mixHex(pal.skinShade, pal.outline, 0.35), 2);
    }
  }

  // 5. Authentic Historical & Modern Military Headgear
  if (isCommanderClass(classId) || isBoss) {
    // High-Peak Crushed Officer Visor Cap (WWI/WWII General / Field Officer)
    p.poly(
      [
        [headCx - 16, headCy - 9],
        [headCx - 18, headCy - 18],
        [headCx + 4, headCy - 23],
        [headCx + 20, headCy - 16],
        [headCx + 15, headCy - 9],
      ],
      pal.armorMid
    );
    p.line(headCx - 15, headCy - 18, headCx + 17, headCy - 16, pal.armorLight, 3);
    p.rect(headCx - 14, headCy - 11, 29, 5, '#18181b'); // cap band
    p.line(headCx - 13, headCy - 9, headCx + 14, headCy - 9, pal.goldMid, 2); // gold chin cord
    p.poly(
      [
        [headCx + 2, headCy - 7],
        [headCx + 21, headCy - 6],
        [headCx + 18, headCy - 3],
        [headCx + 4, headCy - 5],
      ],
      '#09090b'
    ); // glossy black visor peak
    p.ellipse(headCx + 5, headCy - 16, 3.5, 3.5, pal.goldLight); // officer cap eagle/cockade
  } else if (isMedicClass(classId)) {
    // Combat Medic M1 Steel Pot Helmet with Crisp White Panel & Red Cross
    p.ellipse(headCx, headCy - 8, 16, 12, pal.armorDark);
    p.ellipse(headCx, headCy - 9, 14.5, 10.5, pal.armorMid);
    p.rect(headCx - 17, headCy - 6, 34, 3, pal.armorDark);
    p.ellipse(headCx + 3, headCy - 12, 7, 6.5, '#f8fafc');
    p.rect(headCx + 2, headCy - 16, 3, 9, '#dc2626');
    p.rect(headCx - 1, headCy - 13, 9, 3, '#dc2626');
    p.line(headCx - 10, headCy - 4, headCx - 4, headCy + 12, '#3e2718', 2); // chinstrap
  } else if (isStealthCommandoClass(classId) && tier <= 2) {
    // SAS / Commando Slanted Wool Beret with Cap Badge
    p.poly(
      [
        [headCx - 16, headCy - 7],
        [headCx - 15, headCy - 16],
        [headCx + 5, headCy - 18],
        [headCx + 16, headCy - 10],
        [headCx + 13, headCy - 6],
      ],
      pal.capeMid
    );
    p.line(headCx - 13, headCy - 15, headCx + 6, headCy - 16, pal.capeLight, 3);
    p.rect(headCx - 14, headCy - 8, 28, 3, '#0f172a');
    p.rect(headCx + 6, headCy - 14, 4, 5, pal.goldLight);
  } else if (tier === 1) {
    if (isGermanHelmetStyle) {
      // Iconic WWI M1916 Stahlhelm with Flared Neck Skirt & Brow Lug!
      p.ellipse(headCx - 1, headCy - 9, 15, 11, pal.armorDark);
      p.ellipse(headCx, headCy - 10, 13.5, 9.5, pal.armorMid);
      p.ellipse(headCx - 2, headCy - 14, 8, 4, pal.armorLight);
      p.poly(
        [
          [headCx - 18, headCy + 1],
          [headCx - 14, headCy - 7],
          [headCx + 16, headCy - 6],
          [headCx + 18, headCy - 3],
          [headCx - 2, headCy - 3],
          [headCx - 12, headCy + 3],
        ],
        pal.armorDark
      );
    } else {
      // Iconic WWI Allied Mk I Brodie Wide-Brimmed Steel Dish Helmet!
      p.ellipse(headCx, headCy - 11, 14, 9, pal.armorDark);
      p.ellipse(headCx, headCy - 12, 12, 7.5, pal.armorMid);
      p.ellipse(headCx - 2, headCy - 15, 7, 3.5, pal.armorLight);
      p.ellipse(headCx, headCy - 7, 22, 4, pal.armorDark);
      p.line(headCx - 19, headCy - 7, headCx + 19, headCy - 7, pal.armorLight, 2);
      p.line(headCx - 9, headCy - 4, headCx - 4, headCy + 12, '#3e2718', 2);
    }
  } else if (tier === 2) {
    // WWII M1 Helmet (with Netting & Dust Goggles) or WWII M40 Stahlhelm
    p.ellipse(headCx, headCy - 9, 16, 12, pal.armorDark);
    p.ellipse(headCx, headCy - 10, 14, 10, pal.armorMid);
    p.ellipse(headCx - 3, headCy - 14, 8, 4, pal.armorLight);
    if (isGermanHelmetStyle) {
      p.poly(
        [
          [headCx - 17, headCy],
          [headCx - 14, headCy - 7],
          [headCx + 16, headCy - 6],
          [headCx + 17, headCy - 4],
          [headCx - 11, headCy + 2],
        ],
        pal.armorDark
      );
    } else {
      p.rect(headCx - 16, headCy - 6, 32, 3, pal.armorDark);
    }
    // Dust goggles strapped on helmet brow
    p.bevelBox(headCx - 9, headCy - 12, 11, 6, '#334155', '#94a3b8', '#0f172a', 1);
    p.bevelBox(headCx + 3, headCy - 12, 10, 6, '#334155', '#94a3b8', '#0f172a', 1);
  } else {
    // Tier 3 PASGT/MICH -> Tier 4 High-Cut Ops-Core FAST Helmet with ARC Rails & Peltor Comms Headset
    p.ellipse(headCx, headCy - 9, 16, 12, pal.armorDark);
    p.ellipse(headCx, headCy - 10, 14, 10, pal.armorMid);
    p.line(headCx - 12, headCy - 9, headCx + 4, headCy - 9, pal.steelLight, 2); // ARC accessory rail
    p.ellipse(headCx - 9, headCy, 4.5, 6, '#1e293b'); // Peltor earcup
    if (tier >= 4) {
      p.bevelBox(headCx + 8, headCy - 14, 8, 6, '#0f172a', pal.steelLight, '#020617', 1); // NVG shroud mount
    }
  }

  // 6. Front Support Arm + Authentic Scaled Firearms + Rear Trigger Arm (Two-Handed Combat Grip!)
  const wy = 88 + bob + armLift;
  const reach = tStep * 10; // progressive weapon modernization & span (T1 -> T4)
  const handCol = tier >= 3 ? '#1f2937' : pal.skinMid;
  const handLight = tier >= 3 ? '#4b5563' : pal.skinLight;

  // Far (Front Support) Arm extending from right shoulder to forend/handguard
  const foreHandX = isAntiTankInfClass(classId) ? cx + 28 : cx + 38 + Math.min(10, tStep * 3);
  const foreHandY = isAntiTankInfClass(classId) ? wy - 10 : wy - 2;
  p.litCapsule(cx + 12, torsoTop + 7, cx + 24, wy + 7, 6.5, 5.5, pal.armorDark, pal.armorMid, pal.armorLight);
  p.litCapsule(cx + 24, wy + 7, foreHandX, foreHandY, 5.5, 4.5, pal.armorDark, pal.armorMid, pal.armorLight);

  if (isMedicClass(classId) || wType === 'STAFF') {
    // Combat Medic Carbine + slung Trauma Kit Satchel with Red Cross (& T3/T4 Med-Drone)
    const satchelX = cx + 10;
    const satchelY = waistY + 1;
    p.bevelBox(satchelX, satchelY, 22 + tStep * 2, 18 + tStep, '#e2e8f0', '#ffffff', '#64748b', 2);
    p.rect(satchelX + 9 + tStep, satchelY + 4, 4, 10, '#dc2626');
    p.rect(satchelX + 6 + tStep, satchelY + 7, 10, 4, '#dc2626');
    // Compact M1 Carbine / PDW held at ready
    const bEnd = Math.min(176, cx + 52 + reach);
    p.line(cx + 2, wy + 5, cx + 34, wy - 2, '#5c3a21', 5);
    p.line(cx + 18, wy, bEnd, wy - 8, pal.steelDark, 4);
    p.line(cx + 20, wy - 1, bEnd - 2, wy - 9, pal.steelLight, 1);
    if (tier >= 3) {
      const drX = Math.min(158, bEnd - 6);
      p.line(drX - 6, wy - 26, drX + 24, wy - 26, '#cbd5e1', 2);
      p.bevelBox(drX, wy - 24, 18, 13, '#f8fafc', '#ffffff', '#64748b', 2);
      p.rect(drX + 7, wy - 21, 4, 7, '#dc2626');
      p.rect(drX + 5, wy - 19, 8, 3, '#dc2626');
    }
  } else if (isAntiTankInfClass(classId)) {
    // Shoulder-Fired Anti-Tank Launcher: M1 Bazooka / Panzerschreck -> RPG-7 -> Carl-Gustaf / FGM-148 Javelin!
    const tubeRearX = cx - 32 - tStep * 4;
    const tubeFrontX = Math.min(178, cx + 52 + reach);
    const tubeThick = tier >= 3 ? 11 : 8;
    p.line(tubeRearX, wy - 6, tubeFrontX, wy - 18, pal.armorDark, tubeThick);
    p.line(tubeRearX + 3, wy - 8, tubeFrontX - 3, wy - 20, pal.armorLight, 2);
    // Flared exhaust venturi cone at rear
    p.poly(
      [
        [tubeRearX - 7, wy - 12],
        [tubeRearX, wy - 9],
        [tubeRearX, wy - 2],
        [tubeRearX - 7, wy + 1],
      ],
      pal.steelDark
    );
    // Protruding shaped-charge HEAT warhead / CLU thermal seeker
    if (tier >= 3) {
      p.bevelBox(cx + 10, wy - 30, 20 + tStep * 3, 13, '#0f172a', pal.steelMid, '#020617', 2);
      p.ellipse(cx + 28 + tStep * 2, wy - 24, 3.5, 3.5, '#4ade80');
      p.bevelBox(tubeFrontX - 8, wy - 25, 16, 14, pal.armorDark, pal.steelLight, '#090d14', 2);
    } else {
      if (tier === 2) {
        p.line(cx + 22, wy - 24, cx + 24, wy - 2, pal.steelMid, 4); // Panzerschreck blast shield
      }
      p.poly(
        [
          [tubeFrontX - 2, wy - 22],
          [tubeFrontX + 12, wy - 18],
          [tubeFrontX - 2, wy - 13],
        ],
        '#b91c1c'
      );
    }
  } else if (isSniperClass(classId) || wType === 'BOW') {
    // Precision Marksman Rifle: Scoped Springfield/Kar98k -> SVD Dragunov -> Barrett M82A1 .50 BMG Anti-Materiel!
    const stockCol = tier >= 3 ? '#1e293b' : '#5c3820';
    const stockHi = tier >= 3 ? '#475569' : '#8c5835';
    const muzzleX = Math.min(184, cx + 68 + reach);
    // Sculpted rifle buttstock & cheekpiece braced into shoulder
    p.poly(
      [
        [cx - 4, wy + 2],
        [cx + 26, wy - 2],
        [cx + 26, wy + 4],
        [cx - 3, wy + 11],
      ],
      stockCol
    );
    p.line(cx - 2, wy + 3, cx + 24, wy - 1, stockHi, 2);
    // Long free-floated precision barrel + fluted muzzle brake / suppressor
    p.line(cx + 20, wy - 1, muzzleX, wy - 11, pal.steelDark, tier >= 3 ? 5 : 4);
    p.line(cx + 22, wy - 2, muzzleX - 3, wy - 12, pal.steelLight, 1);
    p.bevelBox(muzzleX - 11, wy - 15, 13, 7, pal.steelMid, pal.steelLight, pal.steelDark, 1);
    // Telescopic long-range optic + sunshade
    const scopeW = 24 + tStep * 5;
    p.line(cx + 16, wy - 8, cx + 16 + scopeW, wy - 11, '#0f172a', 5);
    p.line(cx + 18, wy - 9, cx + 14 + scopeW, wy - 12, pal.steelMid, 1);
    p.rect(cx + 15 + scopeW, wy - 14, 3, 6, '#38bdf8');
    if (tier >= 2) {
      p.rect(cx + 27, wy + 2, 9, 11, pal.steelDark); // box magazine
    }
    if (tier >= 3) {
      const bpX = cx + 52 + tStep * 4;
      p.line(bpX, wy - 7, bpX + 8, wy + 14, pal.steelDark, 2);
      p.line(bpX, wy - 7, bpX - 6, wy + 13, pal.steelMid, 2);
    }
  } else if (isGrenadierSapperClass(classId)) {
    // Combat Engineer / Grenadier: Trench Gun -> M79 -> Milkor M32A1 6-Shot 40mm Rotary Grenade Launcher!
    const stockCol = tier >= 3 ? '#1e293b' : '#5c3820';
    p.poly(
      [
        [cx - 2, wy + 2],
        [cx + 22, wy - 1],
        [cx + 22, wy + 6],
        [cx - 1, wy + 11],
      ],
      stockCol
    );
    const drumX = cx + 31 + tStep * 2;
    const drumR = 9 + (tier >= 3 ? 3 : 0);
    p.ellipse(drumX, wy + 1, drumR, drumR, pal.steelDark);
    p.ellipse(drumX, wy, drumR - 2, drumR - 2, pal.steelMid);
    const bEnd = Math.min(180, drumX + 26 + reach);
    p.line(drumX + 6, wy - 2, bEnd, wy - 6, pal.steelDark, 8);
    p.line(drumX + 8, wy - 4, bEnd - 2, wy - 8, pal.steelLight, 2);
    p.rect(bEnd - 4, wy - 9, 5, 7, '#f97316');
  } else if (isHeavyMgFlameClass(classId) || wType === 'AXE') {
    // Heavy Machine Gunner: Lewis / MG08 -> MG42 -> M240B -> Handheld M134 Rotary Minigun + Brass Belt!
    const muzzleX = Math.min(183, cx + 62 + reach);
    p.bevelBox(cx + 8, wy - 4, 30 + tStep * 4, 12, pal.steelMid, pal.steelLight, pal.steelDark, 2);
    if (tier >= 4) {
      for (let b = -4; b <= 4; b += 4) {
        p.line(cx + 38, wy + b, muzzleX, wy + b - 3, pal.steelLight, 2);
      }
      p.rect(muzzleX - 10, wy - 8, 4, 13, pal.steelDark);
      p.rect(muzzleX - 3, wy - 8, 4, 13, pal.goldMid);
    } else {
      // Perforated barrel cooling jacket + flash hider
      p.line(cx + 34, wy, muzzleX, wy - 6, pal.steelDark, 7);
      p.line(cx + 36, wy - 2, muzzleX - 3, wy - 8, pal.steelLight, 2);
      for (let vx = cx + 38; vx < muzzleX - 10; vx += 7) {
        p.set(vx, wy - 2, '#090d14');
      }
    }
    // Box drum + gleaming brass ammunition belt feed
    p.bevelBox(cx + 22, wy + 7, 15 + tStep * 2, 13, '#4b5563', '#9ca3af', '#1f2937', 1);
    for (let by = wy + 2; by <= wy + 9; by += 3) {
      p.line(cx + 25, by, cx + 31, by, pal.goldLight, 2);
    }
    p.line(cx + 50 + tStep * 3, wy - 2, cx + 58 + tStep * 3, wy + 17, pal.steelDark, 2);
  } else if (isSmgAssaultClass(classId)) {
    // Shock Trooper / Assault Rifleman: MP18/Thompson -> StG-44 -> M4A1 SOPMOD -> Suppressed HK416!
    const stockCol = tier <= 2 ? '#5c3820' : '#1e293b';
    const bEnd = Math.min(178, cx + 52 + reach);
    p.poly(
      [
        [cx - 2, wy + 3],
        [cx + 22, wy - 1],
        [cx + 22, wy + 5],
        [cx, wy + 10],
      ],
      stockCol
    );
    p.bevelBox(cx + 16, wy - 5, 26 + tStep * 3, 8, pal.steelMid, pal.steelLight, pal.steelDark, 1);
    p.line(cx + 38, wy - 2, bEnd, wy - 6, pal.steelDark, tier >= 4 ? 6 : 4);
    p.line(cx + 40, wy - 3, bEnd - 2, wy - 7, pal.steelLight, 1);
    if (tier === 1 || tier === 2) {
      // Iconic Tommy Gun drum or curved MP40 stick mag
      p.ellipse(cx + 30, wy + 8, 7, 7, pal.steelDark);
      p.ellipse(cx + 30, wy + 8, 4, 4, pal.steelMid);
    } else {
      // Curved 30-rd STANAG magazine + EOTech Holo Sight
      p.poly(
        [
          [cx + 28, wy + 3],
          [cx + 35, wy + 3],
          [cx + 39, wy + 17],
          [cx + 32, wy + 17],
        ],
        '#0f172a'
      );
      p.bevelBox(cx + 23, wy - 11, 11, 6, '#0f172a', pal.steelLight, '#020617', 1);
      p.set(cx + 32, wy - 9, '#ef4444');
    }
  } else {
    // Standard Infantry Rifleman & Officer: Lee-Enfield/Mauser w/ Bayonet -> M1 Garand -> FN FAL/M16 -> Modular Rifle!
    const stockCol = tier >= 3 ? '#1e293b' : '#633d22';
    const stockHi = tier >= 3 ? '#475569' : '#96613b';
    const bEnd = Math.min(178, cx + 56 + reach);
    p.poly(
      [
        [cx - 3, wy + 3],
        [cx + 38 + tStep * 2, wy - 4],
        [cx + 38 + tStep * 2, wy + 2],
        [cx - 1, wy + 11],
      ],
      stockCol
    );
    p.line(cx, wy + 3, cx + 36 + tStep * 2, wy - 3, stockHi, 2);
    p.line(cx + 20, wy - 1, bEnd, wy - 9, pal.steelDark, tier >= 3 ? 5 : 4);
    p.line(cx + 22, wy - 2, bEnd - 2, wy - 10, pal.steelLight, 1);
    if (tier === 1) {
      // Gleaming WWI Fixed Steel Bayonet!
      const bayoTip = Math.min(184, bEnd + 16);
      p.line(bEnd - 2, wy - 7, bayoTip, wy - 11, '#cbd5e1', 2);
      p.line(bEnd - 1, wy - 8, bayoTip, wy - 12, '#ffffff', 1);
    } else if (tier >= 2) {
      p.poly(
        [
          [cx + 28, wy + 2],
          [cx + 35, wy + 1],
          [cx + 38, wy + 15],
          [cx + 31, wy + 15],
        ],
        pal.steelDark
      );
    }
    if (tier >= 3) {
      p.bevelBox(cx + 22, wy - 11, 13, 6, '#0f172a', pal.steelMid, '#020617', 1);
      p.set(cx + 33, wy - 9, '#38bdf8');
    }
  }

  // Forward Support Hand cradling weapon forend
  p.ellipse(foreHandX, foreHandY, 4.2, 3.8, handCol);
  p.ellipse(foreHandX + 1, foreHandY - 1, 2.2, 2, handLight);

  // Near (Rear Trigger) Arm: Shoulder -> Bent Elbow -> Forearm -> Trigger Hand
  const shX = cx - 9;
  const shY = torsoTop + 8;
  const elbX = cx - 4;
  const elbY = wy + 10;
  const trigX = cx + 13;
  const trigY = wy + 3;
  p.litCapsule(shX, shY, elbX, elbY, 7 + tStep * 0.4, 6, pal.armorDark, pal.armorMid, pal.armorLight);
  p.litCapsule(elbX, elbY, trigX, trigY, 5.8, 4.5, pal.armorDark, pal.armorMid, pal.armorLight);
  if (isMedicClass(classId)) {
    // Authentic White Red-Cross Brassard Armband on left sleeve!
    p.rect(shX - 5, shY + 5, 11, 8, '#f8fafc');
    p.rect(shX - 1, shY + 6, 3, 6, '#dc2626');
    p.rect(shX - 3, shY + 8, 7, 2, '#dc2626');
  }
  p.ellipse(trigX + 1, trigY, 4.2, 3.8, handCol);
  p.ellipse(trigX + 2, trigY - 1, 2.2, 2, handLight);
}

// ============================================================================
// 2. REALISTIC 192x192 ARMORED VEHICLE RENDERER (TANKS, TDs, IFVs, RECON, SPAA)
// ============================================================================

function drawAlliedStarOrCross(
  p: PixelCanvas,
  cx: number,
  cy: number,
  size: number,
  isAxis: boolean
) {
  if (isAxis) {
    // Balkenkreuz tactical vehicle emblem
    p.rect(cx - size, cy - 1, size * 2 + 1, 3, '#f8fafc');
    p.rect(cx - 1, cy - size, 3, size * 2 + 1, '#f8fafc');
    p.rect(cx - size + 1, cy, size * 2 - 1, 1, '#09090b');
    p.rect(cx, cy - size + 1, 1, size * 2 - 1, '#09090b');
  } else {
    // White Allied Tactical Star
    p.triangle(cx, cy - size, cx - size, cy + size - 1, cx + size, cy + size - 1, '#f8fafc');
    p.triangle(cx - size, cy - size + 2, cx + size, cy - size + 2, cx, cy + size, '#f8fafc');
  }
}

function drawTrackedRunningGear(
  p: PixelCanvas,
  trackX: number,
  trackY: number,
  trackW: number,
  trackH: number,
  roadWheels: number,
  wheelShift: number,
  sideSkirtCol?: string,
  sideSkirtLight?: string
) {
  const botY = trackY + trackH; // 180
  const rearSprocketX = trackX + 13;
  const frontSprocketX = trackX + trackW - 13;
  const sprocketY = trackY + 13;
  const firstWheelX = trackX + 28;
  const lastWheelX = trackX + trackW - 28;

  // Realistic Trapezoidal Caterpillar Track Belt (angled front & rear runs up to raised sprocket/idler!)
  p.poly(
    [
      [trackX + 4, trackY + 3],
      [trackX + trackW - 4, trackY + 3],
      [trackX + trackW, sprocketY + 2],
      [lastWheelX + 8, botY - 1],
      [firstWheelX - 8, botY - 1],
      [trackX, sprocketY + 2],
    ],
    '#18181b'
  );
  p.poly(
    [
      [trackX + 7, trackY + 6],
      [trackX + trackW - 7, trackY + 6],
      [trackX + trackW - 4, sprocketY + 2],
      [lastWheelX + 5, botY - 4],
      [firstWheelX - 5, botY - 4],
      [trackX + 4, sprocketY + 2],
    ],
    '#27272a'
  );
  // Deep shadow inside suspension bay
  p.poly(
    [
      [trackX + 12, trackY + 9],
      [trackX + trackW - 12, trackY + 9],
      [lastWheelX + 2, botY - 7],
      [firstWheelX - 2, botY - 7],
    ],
    '#0d0f12'
  );

  // Steel track-link cleats along ground run & top run
  for (let lx = firstWheelX - 6 + wheelShift * 4; lx <= lastWheelX + 4; lx += 7) {
    p.rect(lx, botY - 3, 4, 3, '#52525b');
  }
  for (let lx = trackX + 8 + wheelShift * 4; lx <= trackX + trackW - 12; lx += 8) {
    p.rect(lx, trackY + 2, 4, 2, '#71717a');
  }

  // Return Rollers along upper track run
  for (let r = 0; r < 3; r++) {
    const rx = Math.round(firstWheelX + 8 + (r * (lastWheelX - firstWheelX - 16)) / 2);
    p.ellipse(rx, trackY + 10, 3.5, 3.5, '#52525b');
    p.set(rx, trackY + 10, '#d4d4d8');
  }

  // Raised Rear Idler & Toothed Front Drive Sprocket
  p.wheelDetailed(rearSprocketX, sprocketY, 10, 6.5, 3, '#09090b', '#3f3f46', '#71717a', '#d4d4d8', wheelShift);
  p.wheelDetailed(frontSprocketX, sprocketY, 10.5, 7, 3.5, '#09090b', '#3f3f46', '#71717a', '#e4e4e7', wheelShift);

  // Rubber-Rimmed Roadwheels with Torsion-Bar Hubs
  const wheelR = roadWheels >= 6 ? 9.5 : 11;
  const wy = botY - Math.round(wheelR) - 3;
  for (let i = 0; i < roadWheels; i++) {
    const wx = Math.round(firstWheelX + (i * (lastWheelX - firstWheelX)) / Math.max(1, roadWheels - 1));
    p.line(wx - 4, wy - 4, wx, wy, '#3f3f46', 2); // torsion arm
    p.wheelDetailed(wx, wy, wheelR, wheelR - 3, 3.5, '#09090b', '#27272a', '#6b7280', '#d4d4d8', wheelShift);
  }

  // Overhanging Steel Mudguard / Armored Side-Skirt (Schürzen / Chobham Skirts on T3/T4!)
  if (sideSkirtCol && sideSkirtLight) {
    const skirtH = 14;
    p.poly(
      [
        [trackX - 1, trackY],
        [trackX + trackW + 1, trackY],
        [trackX + trackW - 2, trackY + skirtH],
        [trackX + 2, trackY + skirtH],
      ],
      sideSkirtCol
    );
    p.line(trackX, trackY + 1, trackX + trackW, trackY + 1, sideSkirtLight, 2);
    for (let sx = trackX + 22; sx < trackX + trackW - 18; sx += 22) {
      p.line(sx, trackY + 1, sx, trackY + skirtH - 1, '#18181b', 2);
    }
  } else {
    // Classic tank fender strip with front/rear mudflaps
    p.poly(
      [
        [trackX - 2, trackY + 5],
        [trackX + 6, trackY],
        [trackX + trackW - 6, trackY],
        [trackX + trackW + 2, trackY + 6],
        [trackX + trackW, trackY + 9],
        [trackX + trackW - 7, trackY + 4],
        [trackX + 7, trackY + 4],
        [trackX, trackY + 9],
      ],
      '#3f3f46'
    );
    p.line(trackX + 6, trackY + 1, trackX + trackW - 6, trackY + 1, '#a1a1aa', 1);
  }
}

function drawArmorUnit(
  p: PixelCanvas,
  pal: CharacterPalette,
  classId: UnitClassId,
  isBoss: boolean,
  tier: UnitTier,
  frame: SpriteAnimFrame,
  animState: SpriteAnimState
) {
  const rumble = animState === 'walk' ? (frame % 2 === 1 ? -2 : 0) : frame === 2 ? -1 : 0;
  const wheelShift = animState === 'walk' ? frame % 2 : 0;
  const tStep = tier - 1; // 0, 1, 2, 3
  const isAxis = pal.eyeColor === '#991b1b' || isBoss;

  // Progressive Vehicle Length: T1(124) -> T2(140) -> T3(156) -> T4(172)
  const hullW = 124 + tStep * 16;
  const hullX = Math.max(6, Math.round(92 - hullW / 2));

  // SUBTYPE 1: Wheeled Armored Recon Cars (4x4 WWI -> 6x6 Puma/Greyhound -> 8x8 LAV -> 8x8 Stryker MGS)
  if (isReconCarClass(classId)) {
    const bodyTop = 94 - tStep * 2 + rumble;
    const bodyBot = 148 + rumble;
    // Sculpted Multi-Faceted Wheeled AFV Hull with Boat-Shaped Lower Glacis
    p.poly(
      [
        [hullX + 6, bodyBot],
        [hullX, bodyTop + 20],
        [hullX + 16, bodyTop + 4],
        [hullX + hullW - 28, bodyTop],
        [hullX + hullW, bodyTop + 18],
        [hullX + hullW - 8, bodyBot],
      ],
      pal.mountDark
    );
    p.poly(
      [
        [hullX + 8, bodyBot - 4],
        [hullX + 3, bodyTop + 20],
        [hullX + 18, bodyTop + 6],
        [hullX + hullW - 29, bodyTop + 2],
        [hullX + hullW - 3, bodyTop + 19],
        [hullX + hullW - 10, bodyBot - 4],
      ],
      pal.mountMid
    );
    p.line(hullX + 18, bodyTop + 4, hullX + hullW - 30, bodyTop + 2, pal.mountLight, 3);
    // Driver armored vision block + engine louvers + headlight
    p.bevelBox(hullX + hullW - 38, bodyTop + 6, 16, 9, '#0369a1', '#7dd3fc', '#0f172a', 1);
    for (let lx = hullX + 14; lx <= hullX + 34; lx += 6) {
      p.line(lx, bodyTop + 14, lx, bodyTop + 26, pal.crease, 2);
    }
    p.rect(hullX + hullW - 6, bodyTop + 18, 5, 5, '#fef08a');
    drawAlliedStarOrCross(p, hullX + 54, bodyTop + 20, 5, isAxis);

    if (tier >= 3) {
      // Ceramic/slat applique armor panels along hull flank
      for (let ax = hullX + 18; ax < hullX + hullW - 26; ax += 22) {
        p.bevelBox(ax, bodyTop + 24, 19, 13, pal.armorMid, pal.armorLight, pal.armorDark, 1);
      }
    }

    // Low-Profile Recon Turret + High-Velocity Autocannon / 105mm MGS Gun
    const turW = 42 + tStep * 9;
    const turX = hullX + Math.round(hullW * 0.28);
    const turY = bodyTop - 22 - tStep * 2;
    p.poly(
      [
        [turX, bodyTop + 2],
        [turX + 8, turY],
        [turX + turW - 10, turY],
        [turX + turW + 4, bodyTop - 6],
        [turX + turW, bodyTop + 2],
      ],
      pal.mountDark
    );
    p.poly(
      [
        [turX + 3, bodyTop],
        [turX + 9, turY + 2],
        [turX + turW - 11, turY + 2],
        [turX + turW + 1, bodyTop - 6],
        [turX + turW - 2, bodyTop],
      ],
      pal.mountMid
    );
    p.line(turX + 9, turY + 3, turX + turW - 12, turY + 3, pal.mountLight, 2);
    if (tier >= 3) {
      p.bevelBox(turX + 10, turY - 11, 13, 11, '#0f172a', pal.steelLight, '#020617', 1);
      p.ellipse(turX + 18, turY - 6, 3, 3, '#38bdf8');
    }
    const bEnd = Math.min(185, turX + turW + 30 + tStep * 9);
    p.litCapsule(turX + turW - 2, turY + 11, bEnd, turY + 8, tier >= 4 ? 4.5 : 3.5, tier >= 4 ? 3.8 : 2.8, pal.steelDark, pal.steelMid, pal.steelLight);
    p.bevelBox(bEnd - 8, turY + 4, 9, 8, pal.steelMid, pal.steelLight, pal.steelDark, 1);

    // Sculpted Wheel-Well Arches + Heavy Offroad Tactical Tires (4x4 -> 6x6 -> 8x8)
    const wheelCount = tier === 1 ? 2 : tier === 2 ? 3 : 4;
    const wR = wheelCount === 4 ? 16 : 18;
    for (let i = 0; i < wheelCount; i++) {
      const wx = Math.round(hullX + 24 + (i * (hullW - 48)) / Math.max(1, wheelCount - 1));
      p.ellipse(wx, 180 - wR - 1, wR + 4, wR + 4, '#09090b');
      p.wheelDetailed(wx, 180 - wR, wR, wR - 6, 4.5, '#18181b', '#3f3f46', pal.mountMid, '#d4d4d8', wheelShift);
    }
    return;
  }

  // SUBTYPE 2: Half-Track (T1) -> M113 APC (T2) -> M2 Bradley IFV (T3) -> Heavy BUSK/Puma IFV (T4)
  if (isApcIfvClass(classId)) {
    const hullTop = 92 - tStep * 2 + rumble;
    const hullBot = 142 + rumble;
    // Authentic WWII Half-Track on Tier 1 (Front Steered Wheel + Rear Track!)
    p.poly(
      [
        [hullX + 4, hullBot],
        [hullX, hullTop + 10],
        [hullX + 10, hullTop],
        [hullX + hullW - 34, hullTop],
        [hullX + hullW - 22, hullTop + 14],
        [hullX + hullW - 2, hullTop + 18],
        [hullX + hullW, hullBot - 6],
        [hullX + hullW - 8, hullBot],
      ],
      pal.mountDark
    );
    p.poly(
      [
        [hullX + 6, hullBot - 2],
        [hullX + 3, hullTop + 10],
        [hullX + 12, hullTop + 2],
        [hullX + hullW - 35, hullTop + 2],
        [hullX + hullW - 23, hullTop + 15],
        [hullX + hullW - 4, hullTop + 19],
        [hullX + hullW - 3, hullBot - 7],
        [hullX + hullW - 10, hullBot - 2],
      ],
      pal.mountMid
    );
    p.line(hullX + 12, hullTop + 3, hullX + hullW - 36, hullTop + 3, pal.mountLight, 3);
    // Infantry Vision Blocks & Firing Ports along Troop Bay
    for (let px = hullX + 16; px < hullX + hullW - 42; px += 20) {
      p.bevelBox(px, hullTop + 10, 12, 8, '#0369a1', '#7dd3fc', '#0f172a', 1);
      if (tier >= 3) {
        p.bevelBox(px - 2, hullTop + 26, 16, 13, pal.armorMid, pal.armorLight, pal.armorDark, 1);
      }
    }
    drawAlliedStarOrCross(p, hullX + hullW - 22, hullTop + 28, 5, isAxis);

    if (tier === 1) {
      // Pintle .50 cal M2HB + Gun Shield on Half-Track
      p.line(hullX + 74, hullTop - 12, hullX + 74, hullTop + 2, pal.steelDark, 3);
      p.line(hullX + 68, hullTop - 10, hullX + 108, hullTop - 12, pal.steelDark, 4);
      p.rect(hullX + 80, hullTop - 17, 5, 11, pal.mountLight);
      // Rear track bogie + Front steered wheel!
      drawTrackedRunningGear(p, hullX + 2, 142, Math.round(hullW * 0.62), 38, 3, wheelShift);
      const fwx = hullX + hullW - 20;
      p.ellipse(fwx, 161, 20, 20, '#09090b');
      p.wheelDetailed(fwx, 162, 17, 10, 4.5, '#18181b', '#3f3f46', pal.mountMid, '#d4d4d8', wheelShift);
      return;
    }

    // Tier 2..4 IFV Turret + 25mm/30mm Bushmaster Chain Gun + Twin TOW ATGM Pod
    const turW = 42 + tStep * 8;
    const turX = hullX + Math.round(hullW * 0.30);
    const turY = hullTop - 22;
    p.poly(
      [
        [turX, hullTop + 1],
        [turX + 8, turY],
        [turX + turW - 8, turY],
        [turX + turW + 4, hullTop - 5],
        [turX + turW, hullTop + 1],
      ],
      pal.mountMid
    );
    p.line(turX + 8, turY + 2, turX + turW - 8, turY + 2, pal.mountLight, 2);
    const bEnd = Math.min(184, turX + turW + 26 + tStep * 8);
    p.litCapsule(turX + turW, turY + 11, bEnd, turY + 8, 3.5, 2.8, pal.steelDark, pal.steelMid, pal.steelLight);
    if (tier >= 3) {
      // Side-mounted Twin TOW Anti-Tank Missile Pod!
      p.bevelBox(turX + 6, turY - 12, 28, 11, pal.armorDark, pal.armorLight, '#090d14', 1);
      p.ellipse(turX + 31, turY - 7, 3, 4, '#ef4444');
    }
    drawTrackedRunningGear(
      p,
      hullX,
      140,
      hullW,
      40,
      4 + tStep,
      wheelShift,
      tier >= 3 ? pal.armorMid : undefined,
      tier >= 3 ? pal.armorLight : undefined
    );
    return;
  }

  // SUBTYPE 3: Self-Propelled Anti-Aircraft Gun / SAM (Flakpanzer -> Gepard -> Tunguska/Pantsir)
  if (isSpaaAirArmorClass(classId)) {
    const hullY = 102 + rumble;
    p.poly(
      [
        [hullX + 4, hullY + 38],
        [hullX, hullY + 12],
        [hullX + 12, hullY],
        [hullX + hullW - 24, hullY],
        [hullX + hullW, hullY + 16],
        [hullX + hullW - 6, hullY + 38],
      ],
      pal.mountMid
    );
    p.line(hullX + 12, hullY + 2, hullX + hullW - 25, hullY + 2, pal.mountLight, 3);

    const turW = 50 + tStep * 9;
    const turX = hullX + 24;
    const turY = 60 - tStep * 2 + rumble;
    p.poly(
      [
        [turX, hullY + 2],
        [turX + 8, turY],
        [turX + turW - 10, turY],
        [turX + turW + 4, turY + 20],
        [turX + turW, hullY + 2],
      ],
      pal.mountMid
    );
    p.line(turX + 9, turY + 2, turX + turW - 10, turY + 2, pal.mountLight, 3);
    drawAlliedStarOrCross(p, turX + 22, turY + 22, 5, isAxis);

    // Elevated Twin/Quad High-Velocity Autocannons Aimed Skyward
    const gEndX = Math.min(184, turX + turW + 34 + tStep * 9);
    const gEndY = 24 - tStep * 2 + rumble;
    p.litCapsule(turX + turW - 6, turY + 14, gEndX, gEndY, 4, 3, pal.steelDark, pal.steelMid, pal.steelLight);
    if (tier >= 2) {
      p.litCapsule(turX + turW - 2, turY + 24, Math.min(185, gEndX + 4), gEndY + 11, 4, 3, pal.steelDark, pal.steelMid, pal.steelLight);
    }
    // Search & Fire-Control Radar Dish (T3/T4) + Quad SAM Canisters (T4)
    if (tier >= 3) {
      p.ellipse(turX + 8, turY - 14, 12 + (tier >= 4 ? 3 : 0), 15, pal.steelDark);
      p.ellipse(turX + 10, turY - 14, 9 + (tier >= 4 ? 2 : 0), 12, pal.steelLight);
      p.ellipse(turX + 46, turY + 12, 8, 8, '#cbd5e1'); // front tracking radome
    }
    if (tier >= 4) {
      p.line(turX + 18, turY + 6, turX + 54, turY - 8, '#475569', 9);
      p.line(turX + 20, turY + 4, turX + 52, turY - 9, '#cbd5e1', 3);
    }
    drawTrackedRunningGear(
      p,
      hullX,
      140,
      hullW,
      40,
      4 + Math.min(2, tStep),
      wheelShift,
      tier >= 3 ? pal.armorMid : undefined,
      tier >= 3 ? pal.armorLight : undefined
    );
    return;
  }

  // SUBTYPE 4: Low-Slung Sloped Casemate Tank Destroyer (StuG III -> Jagdpanther/SU-100 -> Composite TD)
  if (isTankDestroyerClass(classId)) {
    const tdW = 112 + tStep * 18;
    const tdX = Math.max(6, Math.round(82 - tdW / 2));
    const hullBot = 148 + rumble;
    const deckY = 122 + rumble;
    const caseTop = 94 - tStep * 2 + rumble;
    // Continuous Low-Slung Wedge Casemate Fighting Compartment (Authentic StuG / Jagdpanther / SU-100!)
    p.poly(
      [
        [tdX + 4, hullBot],
        [tdX, deckY + 6],
        [tdX + 10, deckY],
        [tdX + 30, deckY],
        [tdX + 42, caseTop],
        [tdX + tdW - 32, caseTop],
        [tdX + tdW, deckY + 14],
        [tdX + tdW - 8, hullBot],
      ],
      pal.mountDark
    );
    p.poly(
      [
        [tdX + 6, hullBot - 2],
        [tdX + 3, deckY + 6],
        [tdX + 12, deckY + 2],
        [tdX + 32, deckY + 2],
        [tdX + 44, caseTop + 2],
        [tdX + tdW - 34, caseTop + 2],
        [tdX + tdW - 4, deckY + 14],
        [tdX + tdW - 10, hullBot - 2],
      ],
      pal.mountMid
    );
    p.line(tdX + 44, caseTop + 2, tdX + tdW - 34, caseTop + 2, pal.mountLight, 3);
    p.line(tdX + tdW - 33, caseTop + 3, tdX + tdW - 4, deckY + 14, pal.mountLight, 3);
    drawAlliedStarOrCross(p, tdX + 58, caseTop + 14, 4.5, isAxis);
    // Commander scissor periscope & hatch
    p.bevelBox(tdX + 50, caseTop - 7, 15, 7, pal.mountDark, pal.mountLight, '#090d14', 1);
    if (tier >= 3) {
      p.rect(tdX + 60, caseTop - 5, 4, 3, '#4ade80');
    }
    // Heavy Cast Saukopf ("Boar's Head") Collar Gun Mantlet + Long High-Velocity Anti-Tank Gun!
    const mantX = tdX + tdW - 26;
    const mantY = caseTop + 12;
    p.ellipse(mantX + 5, mantY + 4, 12, 9, pal.mountDark);
    p.ellipse(mantX + 4, mantY + 3, 9, 6.5, pal.mountLight);
    const bEnd = Math.min(186, tdX + tdW + 32 + tStep * 8);
    p.litCapsule(mantX + 8, mantY + 4, bEnd, mantY, tier >= 3 ? 5.2 : 4.2, tier >= 3 ? 3.8 : 3.2, pal.steelDark, pal.steelMid, pal.steelLight);
    p.bevelBox(bEnd - 10, mantY - 5, 11, 10, pal.steelMid, pal.steelLight, pal.steelDark, 1);

    drawTrackedRunningGear(
      p,
      tdX,
      148,
      tdW,
      31,
      5 + Math.min(2, tStep),
      wheelShift,
      tier >= 2 ? pal.armorMid : undefined,
      tier >= 2 ? pal.armorLight : undefined
    );
    return;
  }

  // SUBTYPE 5 & 6: Medium & Heavy Battle Tanks (FT-17 -> Sherman/Tiger -> M60/T-72 -> M1A2 Abrams / Leopard 2A7!)
  const heavyLine = isHeavyTankClass(classId) || isBoss;
  const effHullW = 108 + tStep * 18 + (heavyLine ? 6 : 0); // 108 -> 126 -> 144 -> 162 (+6 heavy)
  const effHullX = Math.max(6, Math.round(80 - effHullW / 2));
  const hullTop = (tier === 1 ? 118 : 122) + rumble;
  const hullBot = 148 + rumble;

  // Sleek Low-Profile Tank Hull with Raised Rear Engine Deck, Sharply Sloped Upper Glacis & Lower Bow Plate
  p.poly(
    [
      [effHullX + 6, hullBot],
      [effHullX, hullTop + 10],
      [effHullX + 8, hullTop + 1],
      [effHullX + 42, hullTop],
      [effHullX + effHullW - 26, hullTop + 2],
      [effHullX + effHullW, hullTop + 13],
      [effHullX + effHullW - 10, hullBot],
    ],
    pal.mountDark
  );
  p.poly(
    [
      [effHullX + 8, hullBot - 2],
      [effHullX + 3, hullTop + 10],
      [effHullX + 10, hullTop + 3],
      [effHullX + 42, hullTop + 2],
      [effHullX + effHullW - 27, hullTop + 4],
      [effHullX + effHullW - 3, hullTop + 13],
      [effHullX + effHullW - 12, hullBot - 2],
    ],
    pal.mountMid
  );
  p.line(effHullX + 10, hullTop + 2, effHullX + effHullW - 27, hullTop + 3, pal.mountLight, 2);
  p.line(effHullX + effHullW - 27, hullTop + 3, effHullX + effHullW - 4, hullTop + 13, pal.mountLight, 3);
  // Engine radiator louvers + External rear fuel drum (T2/T3) + Glacis headlight
  p.bevelBox(effHullX + 10, hullTop + 6, 20, 9, '#1f2937', '#4b5563', '#09090b', 1);
  if (tier === 2 || tier === 3) {
    p.litCapsule(effHullX - 3, hullTop + 7, effHullX + 5, hullTop + 7, 5, 5, '#27272a', '#52525b', '#a1a1aa');
  }
  p.rect(effHullX + effHullW - 12, hullTop + 8, 4, 4, '#fef08a');
  if (tier === 1) {
    // WWI FT-17 Trench-Crossing Tail Skid & Rivet Seam!
    p.poly(
      [
        [effHullX - 9, hullBot - 2],
        [effHullX + 4, hullTop + 10],
        [effHullX + 6, hullBot - 2],
      ],
      pal.steelDark
    );
    p.rivetRow(effHullX + 16, hullTop + 16, effHullX + effHullW - 20, hullTop + 16, 7, pal.mountLight, pal.outline);
  }

  // Era-Authentic Low-Slung Tank Turret Geometry!
  const turW = 44 + tStep * 14 + (heavyLine ? 6 : 0); // 44 -> 58 -> 72 -> 86
  const turX = effHullX + Math.round((effHullW - turW) * 0.44);
  const turY = (tier === 1 ? 92 : tier === 2 ? 95 : 98) - (heavyLine ? 2 : 0) + rumble;
  const turBot = hullTop + 2;

  if (tier >= 3) {
    // Modern Wide Low-Profile Wedge Composite Turret (M1A2 Abrams / Leopard 2A7!)
    p.poly(
      [
        [turX - 12, turY + 13],
        [turX - 8, turY + 2],
        [turX + turW - 10, turY],
        [turX + turW + 16, turY + 12],
        [turX + turW, turBot],
        [turX + 2, turBot],
      ],
      pal.mountDark
    );
    p.poly(
      [
        [turX - 9, turY + 12],
        [turX - 6, turY + 4],
        [turX + turW - 11, turY + 2],
        [turX + turW + 13, turY + 12],
        [turX + turW - 2, turBot - 1],
        [turX + 4, turBot - 1],
      ],
      pal.mountMid
    );
    p.line(turX - 6, turY + 3, turX + turW - 11, turY + 2, pal.mountLight, 2);
    p.line(turX + turW - 11, turY + 2, turX + turW + 13, turY + 12, pal.mountLight, 3);
    p.line(turX + 20, turY + 4, turX + 20, turBot - 2, pal.crease, 2);
    // Bustle stowage rack + Smoke grenade dischargers
    p.bevelBox(turX - 18, turY + 3, 11, 11, pal.steelDark, pal.steelMid, '#090d14', 1);
    for (let sm = 0; sm < 3; sm++) {
      p.line(turX + turW - 14 + sm * 4, turY + 8, turX + turW - 8 + sm * 4, turY + 4, pal.steelLight, 2);
    }
    drawAlliedStarOrCross(p, turX + Math.round(turW * 0.42), turY + 12, 4.5, isAxis);
  } else {
    // WWI Octagonal FT-17 Turret (T1) -> WWII Cast Sherman / Tiger Turret with Rounded Mantlet (T2)
    p.poly(
      [
        [turX, turBot],
        [turX + 4, turY + 4],
        [turX + 12, turY],
        [turX + turW - 8, turY],
        [turX + turW + 2, turY + 8],
        [turX + turW, turBot],
      ],
      pal.mountDark
    );
    p.poly(
      [
        [turX + 2, turBot - 1],
        [turX + 6, turY + 5],
        [turX + 13, turY + 2],
        [turX + turW - 9, turY + 2],
        [turX + turW, turY + 9],
        [turX + turW - 2, turBot - 1],
      ],
      pal.mountMid
    );
    p.line(turX + 13, turY + 2, turX + turW - 9, turY + 2, pal.mountLight, 2);
    p.bevelBox(turX + turW - 5, turY + 6, 11, 16, pal.mountDark, pal.mountLight, '#090d14', 2);
    drawAlliedStarOrCross(p, turX + Math.round(turW * 0.42), turY + 14, 4.5, isAxis);
  }

  // Commander Cupola, Periscopes, CITV Thermal Sight & Pintle .50 Cal M2HB Heavy MG (T3/T4)
  p.bevelBox(turX + 10, turY - 7, 17, 8, pal.mountDark, pal.mountLight, '#090d14', 1);
  p.rect(turX + 14, turY - 5, 9, 3, tier >= 3 ? '#38bdf8' : pal.steelLight);
  if (tier >= 4) {
    p.bevelBox(turX + 34, turY - 11, 12, 11, pal.steelMid, pal.steelLight, pal.steelDark, 1);
    p.rect(turX + 40, turY - 9, 4, 5, '#4ade80');
    p.line(turX + 20, turY - 13, turX + 20, turY - 6, pal.steelDark, 2);
    p.line(turX + 14, turY - 13, Math.min(180, turX + 54), turY - 14, pal.steelDark, 3);
    p.line(turX + 16, turY - 14, Math.min(179, turX + 52), turY - 15, pal.steelLight, 1);
  }

  // Long High-Velocity Main Tank Cannon (37mm -> 76mm/88mm -> 105mm -> 120mm L/55 Smoothbore!)
  const bStart = turX + turW + (tier >= 3 ? 10 : 4);
  const bEnd = Math.min(186, tier === 1 ? bStart + 20 : bStart + 32 + tStep * 11);
  const bR0 = heavyLine || tier >= 3 ? 5 : 3.8;
  const bR1 = heavyLine || tier >= 3 ? 4 : 3;
  const gunY = turY + 12;
  p.litCapsule(bStart - 4, gunY, bEnd, gunY - 2, bR0, bR1, pal.steelDark, pal.steelMid, pal.steelLight);
  if (tier >= 3) {
    const midBx = Math.round((bStart + bEnd) * 0.46);
    p.litCapsule(midBx - 8, gunY - 1, midBx + 8, gunY - 1, bR0 + 1.8, bR0 + 1.8, pal.mountDark, pal.mountMid, pal.mountLight);
  }
  if (heavyLine || tier === 2) {
    p.bevelBox(bEnd - 9, gunY - 6, 10, 10, pal.steelMid, pal.steelLight, pal.steelDark, 1);
  }

  // Sleek Low-Profile Caterpillar Track & Torsion Suspension (31px tall instead of boxy 40px!)
  const trackX = Math.max(5, effHullX - 2);
  const trackW = Math.min(178, effHullW + 4);
  const roadWheels = 4 + Math.min(3, tStep);
  drawTrackedRunningGear(
    p,
    trackX,
    148,
    trackW,
    31,
    roadWheels,
    wheelShift,
    tier >= 3 || heavyLine ? pal.armorMid : undefined,
    tier >= 3 || heavyLine ? pal.armorLight : undefined
  );
}

// ============================================================================
// 3. REALISTIC 192x192 ARTILLERY & MISSILE LAUNCHER RENDERER
// ============================================================================

function drawArtilleryUnit(
  p: PixelCanvas,
  pal: CharacterPalette,
  classId: UnitClassId,
  tier: UnitTier,
  frame: SpriteAnimFrame,
  animState: SpriteAnimState
) {
  const rumble = animState === 'walk' ? (frame % 2 === 1 ? -2 : 0) : 0;
  const wheelShift = animState === 'walk' ? frame % 2 : 0;
  const tStep = tier - 1;
  const isAxis = pal.eyeColor === '#991b1b';

  // TIER 3 & TIER 4: Self-Propelled Howitzer (M109A6/PzH2000), Armored MLRS/TOS-1A & 8x8 Ballistic TEL!
  if (tier >= 3) {
    const chasW = tier >= 4 ? 174 : 154;
    const chasX = tier >= 4 ? 9 : 19;

    if (isSiegeMissileClass(classId)) {
      // Heavy 8x8 Tactical Ballistic Missile TEL Truck (9P117 Scud-B -> 9P78-1 Iskander-M)
      const bedY = 124 + rumble;
      // Heavy steel multi-axle truck frame + equipment lockers
      p.bevelBox(chasX, bedY, chasW, 24, pal.mountMid, pal.mountLight, pal.mountDark, 2);
      for (let lx = chasX + 16; lx < chasX + chasW - 60; lx += 28) {
        p.bevelBox(lx, bedY + 4, 22, 14, pal.armorDark, pal.armorMid, '#090d14', 1);
      }
      // Forward Angled Armored 8x8 Crew Cab (Authentic MAZ-543 / MZKT-7930 Wedge Cab!)
      const cabX = chasX + chasW - 52;
      const cabTop = bedY - 34;
      p.poly(
        [
          [cabX, bedY + 4],
          [cabX, cabTop],
          [cabX + 38, cabTop],
          [cabX + 52, cabTop + 20],
          [cabX + 52, bedY + 18],
          [cabX, bedY + 18],
        ],
        pal.mountDark
      );
      p.poly(
        [
          [cabX + 2, bedY + 2],
          [cabX + 2, cabTop + 2],
          [cabX + 36, cabTop + 2],
          [cabX + 49, cabTop + 20],
          [cabX + 49, bedY + 15],
          [cabX + 2, bedY + 15],
        ],
        pal.mountMid
      );
      p.line(cabX + 2, cabTop + 3, cabX + 36, cabTop + 3, pal.mountLight, 2);
      // Angled armored windshield + side window + radiator grille
      p.poly(
        [
          [cabX + 28, cabTop + 6],
          [cabX + 37, cabTop + 6],
          [cabX + 46, cabTop + 19],
          [cabX + 28, cabTop + 19],
        ],
        '#0369a1'
      );
      p.line(cabX + 30, cabTop + 8, cabX + 37, cabTop + 8, '#bae6fd', 2);
      p.rect(cabX + 47, bedY + 4, 4, 6, '#fef08a');

      if (tier >= 4) {
        // Deployed hydraulic stabilizer jacks + roof SATCOM dome
        p.bevelBox(chasX - 2, bedY + 10, 10, 44, pal.steelMid, pal.steelLight, pal.steelDark, 1);
        p.rect(chasX - 5, 175, 16, 5, pal.steelDark);
        p.bevelBox(cabX + 8, cabTop - 10, 18, 10, pal.steelMid, pal.steelLight, pal.steelDark, 1);
        p.ellipse(cabX + 17, cabTop - 5, 3, 3, '#38bdf8');
      }

      // Hydraulic Erector Boom + Cylindrical Multi-Stage Ballistic Missile elevated at firing readiness!
      const mR = tier >= 4 ? 13 : 10;
      const mX0 = chasX + 20;
      const mY0 = bedY - 6;
      const mX1 = cabX + 2;
      const mY1 = 34 + rumble;
      p.line(mX0 + 8, bedY, Math.round((mX0 + mX1) * 0.58), Math.round((bedY + mY1) * 0.58), pal.steelDark, 8); // hydraulic piston
      p.litCapsule(mX0, mY0, mX1, mY1, mR, mR - 1, '#334155', '#cbd5e1', '#ffffff');
      // Conical Re-Entry Vehicle Warhead + Cruciform Tail Fins
      p.poly(
        [
          [mX1 - 6, mY1 - mR + 1],
          [mX1 + 26, mY1 - 15],
          [mX1 + 4, mY1 + mR - 1],
        ],
        '#b91c1c'
      );
      p.poly(
        [
          [mX0 - 8, mY0 - 4],
          [mX0 + 12, mY0 - mR - 8],
          [mX0 + 14, mY0 + mR + 4],
        ],
        '#475569'
      );
      drawAlliedStarOrCross(p, Math.round((mX0 + mX1) * 0.5), Math.round((mY0 + mY1) * 0.5), 5, isAxis);

      const wheels = tier >= 4 ? 4 : 3;
      for (let i = 0; i < wheels; i++) {
        const wx = Math.round(chasX + 24 + (i * (chasW - 48)) / (wheels - 1));
        p.ellipse(wx, 161, 20, 20, '#09090b');
        p.wheelDetailed(wx, 162, 18, 11, 4.5, '#18181b', '#3f3f46', pal.mountMid, '#e4e4e7', wheelShift);
      }
      return;
    }

    if (isThermoRocketClass(classId) || (isHowitzerMlrsClass(classId) && tier >= 4)) {
      // Tracked Armored Heavy MLRS / TOS-1A Solntsepyok 24-Tube Rocket Launcher!
      const hullY = 104 + rumble;
      p.poly(
        [
          [chasX + 4, hullY + 36],
          [chasX, hullY + 10],
          [chasX + 10, hullY],
          [chasX + chasW - 56, hullY],
          [chasX + chasW - 52, hullY - 26],
          [chasX + chasW - 12, hullY - 26],
          [chasX + chasW, hullY + 8],
          [chasX + chasW - 6, hullY + 36],
        ],
        pal.mountMid
      );
      p.line(chasX + chasW - 50, hullY - 24, chasX + chasW - 13, hullY - 24, pal.mountLight, 3);
      // Armored blast-shuttered cab windows
      p.bevelBox(chasX + chasW - 30, hullY - 19, 18, 12, '#0369a1', '#7dd3fc', '#0f172a', 1);
      p.rect(chasX + chasW - 6, hullY + 10, 5, 6, '#fef08a');

      // Angled Rectangular Multi-Cell Armored Rocket Pod!
      const podPts: Array<[number, number]> = [
        [chasX + 10, hullY - 12],
        [chasX + 98, 24 + rumble],
        [chasX + 116, 54 + rumble],
        [chasX + 28, hullY + 8],
      ];
      p.poly(podPts, pal.mountDark);
      p.poly(
        [
          [chasX + 13, hullY - 11],
          [chasX + 97, 27 + rumble],
          [chasX + 112, 52 + rumble],
          [chasX + 28, hullY + 5],
        ],
        pal.mountMid
      );
      p.line(chasX + 13, hullY - 11, chasX + 97, 27 + rumble, pal.mountLight, 3);
      // Visible warhead nosecones inside recessed launch tubes
      const tubes = tier >= 4 ? 5 : 4;
      for (let i = 0; i < tubes; i++) {
        const tx = chasX + 97 + Math.round((i * 15) / (tubes - 1));
        const ty = 29 + Math.round((i * 22) / (tubes - 1)) + rumble;
        p.ellipse(tx, ty, 3.5, 3.5, '#090d14');
        p.ellipse(tx + 2, ty - 1, 2.5, 2.5, isThermoRocketClass(classId) ? '#f97316' : '#ef4444');
      }
      drawTrackedRunningGear(p, chasX, 140, chasW, 40, tier >= 4 ? 6 : 5, wheelShift, pal.armorMid, pal.armorLight);
      return;
    }

    // Tier 3 Self-Propelled 155mm Howitzer (M109A6 Paladin / PzH 2000)!
    const hullY = 104 + rumble;
    p.poly(
      [
        [chasX + 4, hullY + 36],
        [chasX, hullY + 10],
        [chasX + 12, hullY],
        [chasX + chasW - 26, hullY],
        [chasX + chasW, hullY + 16],
        [chasX + chasW - 8, hullY + 36],
      ],
      pal.mountMid
    );
    p.line(chasX + 12, hullY + 2, chasX + chasW - 26, hullY + 2, pal.mountLight, 3);
    // Large Rear-Set Faceted Artillery Turret + Bustle Autoloader
    const turTop = 58 + rumble;
    p.poly(
      [
        [chasX + 6, hullY + 2],
        [chasX + 10, turTop + 4],
        [chasX + 22, turTop],
        [chasX + 82, turTop],
        [chasX + 96, turTop + 20],
        [chasX + 92, hullY + 2],
      ],
      pal.mountMid
    );
    p.line(chasX + 22, turTop + 2, chasX + 82, turTop + 2, pal.mountLight, 3);
    drawAlliedStarOrCross(p, chasX + 44, turTop + 22, 5, isAxis);
    p.bevelBox(chasX + 58, turTop - 10, 16, 10, '#0f172a', pal.steelLight, '#020617', 1);
    // Long Elevated 155mm L/52 Howitzer Barrel + Bore Evacuator + Double-Baffle Muzzle Brake
    p.litCapsule(chasX + 90, turTop + 18, 179, 28 + rumble, 6.5, 5, pal.steelDark, pal.steelMid, pal.steelLight);
    p.litCapsule(124, 54 + rumble, 142, 45 + rumble, 8.5, 8.5, pal.mountDark, pal.mountMid, pal.mountLight);
    p.bevelBox(170, 21 + rumble, 14, 14, pal.steelMid, pal.steelLight, pal.steelDark, 1);
    // Barrel travel lock folded on front glacis
    p.line(chasX + chasW - 26, hullY, chasX + chasW - 14, hullY - 12, pal.steelDark, 3);
    drawTrackedRunningGear(p, chasX, 140, chasW, 40, 6, wheelShift, pal.armorMid, pal.armorLight);
    return;
  }

  // TIER 1 (WWI 75mm Field Gun) -> TIER 2 (WWII Split-Trail 155mm Howitzer / 6-Tube Nebelwerfer)
  const trailStart = tier === 1 ? 26 : 12;
  const barrelReach = tier === 1 ? 158 : 178;
  const barrelTopY = isSiegeMissileClass(classId) ? (tier === 1 ? 46 : 28) : tier === 1 ? 58 : 38;

  // Tier 2 Emplacement Sandbags & Brass 155mm Artillery Shells
  if (tier === 2) {
    for (let sx = 118; sx <= 150; sx += 16) {
      p.litCapsule(sx, 173, sx + 14, 173, 5, 5, '#4c3f2b', '#8f7b56', '#c8b48a');
      p.litCapsule(sx + 4, 165, sx + 16, 165, 4.5, 4.5, '#4c3f2b', '#9c8760', '#d6c49e');
    }
    for (let sh = 0; sh < 3; sh++) {
      p.litCapsule(16 + sh * 7, 162, 16 + sh * 7, 177, 2.8, 2.8, '#784c0c', '#d49b1a', '#fef08a');
    }
  }

  // Heavy Split-Trail Box Beam + Dug-In Recoil Spade + Brass Elevation Handwheel
  p.poly(
    [
      [trailStart, 177],
      [trailStart + 6, 169],
      [104, 134 + rumble],
      [106, 145 + rumble],
      [trailStart + 12, 178],
    ],
    pal.mountDark
  );
  p.line(trailStart + 6, 171, 102, 137 + rumble, pal.mountLight, 3);
  p.poly(
    [
      [trailStart - 6, 179],
      [trailStart + 2, 166],
      [trailStart + 12, 170],
      [trailStart + 8, 179],
    ],
    pal.steelMid
  );
  p.ellipse(84, 128 + rumble, 6.5, 6.5, pal.goldMid); // elevation handwheel

  // Realistic Kneeling Artillery Gunner Crewman behind Breech (1:5.8 Human Scale!)
  const gx = tier === 1 ? 54 : 44;
  const gy = 98 + rumble;
  // Kneeling rear leg + planted front boot
  p.litCapsule(gx - 6, gy + 36, gx - 18, 174, 7, 5.5, pal.armorDark, pal.armorMid, pal.armorLight);
  p.litCapsule(gx + 5, gy + 34, gx + 16, 156, 7.5, 6, pal.armorDark, pal.armorMid, pal.armorLight);
  p.litCapsule(gx + 16, 156, gx + 14, 173, 6, 5, pal.armorDark, pal.armorMid, pal.armorLight);
  drawRealisticBoot(p, gx + 14, 179, 16, '#18181b', '#3a3532', '#68625d');
  // Torso leaning forward toward breech
  p.poly(
    [
      [gx - 12, gy + 4],
      [gx + 10, gy + 2],
      [gx + 12, gy + 36],
      [gx - 10, gy + 38],
    ],
    pal.armorMid
  );
  p.line(gx - 9, gy + 4, gx + 8, gy + 3, pal.armorLight, 3);
  // Proportioned head + Brodie/Stahlhelm helmet
  p.ellipse(gx + 2, gy - 9, 9.5, 10, pal.skinMid);
  p.ellipse(gx + 4, gy - 11, 6, 6, pal.skinLight);
  p.rect(gx + 5, gy - 10, 2, 2, pal.outline);
  p.ellipse(gx + 1, gy - 16, 13, 8, pal.armorDark);
  p.ellipse(gx + 1, gy - 17, 11, 6.5, pal.armorMid);
  p.line(gx - 14, gy - 13, gx + 16, gy - 13, pal.armorDark, 3);
  // Articulated arm pulling firing lanyard
  p.litCapsule(gx + 6, gy + 10, 78, 116 + rumble, 5, 4, pal.armorDark, pal.armorMid, pal.armorLight);

  if (isThermoRocketClass(classId) && tier === 2) {
    // WWII 6-Barreled 15cm Nebelwerfer 41 Rocket Mortar Cluster!
    p.litCapsule(80, 114 + rumble, 154, 48 + rumble, 14, 14, pal.steelDark, pal.steelMid, pal.steelLight);
    p.ellipse(154, 48 + rumble, 12, 13, '#0f172a');
    for (let c = 0; c < 6; c++) {
      const a = (c * Math.PI) / 3;
      p.ellipse(154 + Math.cos(a) * 6, 48 + rumble + Math.sin(a) * 6, 2.5, 2.5, '#f97316');
    }
  } else {
    // Breech Ring + Hydro-Pneumatic Recoil Cradle + Long Tapered Artillery Barrel!
    p.bevelBox(74, 106 + rumble, 18, 16, pal.steelMid, pal.steelLight, pal.steelDark, 2); // sliding wedge breech
    // Under-barrel recoil recuperator sled
    const midX = Math.round((86 + barrelReach) * 0.56);
    const midY = Math.round((114 + barrelTopY) * 0.56) + rumble;
    p.litCapsule(84, 118 + rumble, midX, midY + 7, 5.5, 4.5, pal.mountDark, pal.mountMid, pal.mountLight);
    // Tapered steel ordnance barrel
    const bR0 = tier === 1 ? 6 : 8;
    const bR1 = tier === 1 ? 4.2 : 5.8;
    p.litCapsule(82, 110 + rumble, barrelReach, barrelTopY + rumble, bR0, bR1, pal.steelDark, pal.steelMid, pal.steelLight);
    if (tier === 2) {
      p.bevelBox(barrelReach - 10, barrelTopY - 8 + rumble, 15, 15, pal.steelMid, pal.steelLight, pal.steelDark, 1);
    }
  }

  // Angled Riveted Armored Gun Shield (Sloped Backward Like Real 75mm / Pak / 105mm!)
  p.poly(
    [
      [108, 140 + rumble],
      [88, 82 - tStep * 6 + rumble],
      [98, 80 - tStep * 6 + rumble],
      [118, 138 + rumble],
    ],
    pal.mountMid
  );
  p.line(90, 82 - tStep * 6 + rumble, 110, 138 + rumble, pal.mountLight, 3);
  p.rivetRow(94, 86 + rumble, 112, 134 + rumble, 5, pal.mountLight, pal.outline);

  // Large Artillery Carriage Wheel (Spoked Wood/Iron Rim on T1 -> Heavy Pneumatic Disc Wheel on T2)
  const wheelR = tier === 1 ? 25 : 28;
  const wCy = 180 - wheelR;
  if (tier === 1) {
    // Authentic WWI Spoked Artillery Wheel!
    p.ellipse(102, wCy, wheelR, wheelR, '#1c1917');
    p.ellipse(102, wCy, wheelR - 3, wheelR - 3, '#784c0c');
    p.ellipse(102, wCy, wheelR - 6, wheelR - 6, '#0d1418');
    // Clear interior between spokes by drawing spokes over dark shadow disc
    for (let s = 0; s < 8; s++) {
      const sa = (s * Math.PI) / 4 + wheelShift * 0.25;
      p.line(
        102,
        wCy,
        102 + Math.cos(sa) * (wheelR - 5),
        wCy + Math.sin(sa) * (wheelR - 5),
        '#a16207',
        3
      );
    }
    p.ellipse(102, wCy, 6.5, 6.5, pal.steelMid);
    p.ellipse(102, wCy, 3, 3, pal.steelLight);
  } else {
    p.wheelDetailed(102, wCy, wheelR, wheelR - 8, 6, '#18181b', '#3f3f46', pal.mountMid, pal.steelLight, wheelShift);
  }
}

// ============================================================================
// 4. 192x192 REALISTIC 3/4 BANKING AIRCRAFT & ATTACK HELICOPTER RENDERER
// ============================================================================

function drawAirInsignia(p: PixelCanvas, cx: number, cy: number, r: number, isAxis: boolean, outerCol: string) {
  if (isAxis) {
    const s = Math.max(3, Math.round(r));
    p.rect(cx - s, cy - Math.max(2, Math.round(s * 0.36)), s * 2 + 1, Math.max(4, Math.round(s * 0.72)), '#f8fafc');
    p.rect(cx - Math.max(2, Math.round(s * 0.36)), cy - s, Math.max(4, Math.round(s * 0.72)), s * 2 + 1, '#f8fafc');
    p.rect(cx - s + 1, cy - Math.max(1, Math.round(s * 0.2)), s * 2 - 1, Math.max(2, Math.round(s * 0.4)), '#111827');
    p.rect(cx - Math.max(1, Math.round(s * 0.2)), cy - s + 1, Math.max(2, Math.round(s * 0.4)), s * 2 - 1, '#111827');
  } else {
    p.ellipse(cx, cy, r, Math.max(2, r * 0.78), outerCol);
    p.ellipse(cx, cy, Math.max(2, r - 2.2), Math.max(1.6, (r - 2.2) * 0.78), '#f8fafc');
    p.ellipse(cx, cy, Math.max(1.2, r - 4.2), Math.max(1, (r - 4.2) * 0.78), '#dc2626');
  }
}

function drawSpinningPropDisc(p: PixelCanvas, cx: number, cy: number, rx: number, ry: number, rotorWide: boolean, hubCol: string) {
  // Translucent-style motion arc + crisp angled propeller blades + spinner cone
  p.ellipse(cx, cy, rx, ry, '#94a3b8');
  p.ellipse(cx, cy, Math.max(1, rx - 1.5), Math.max(2, ry - 4), '#cbd5e1');
  if (rotorWide) {
    p.line(cx - rx + 1, cy - ry + 2, cx + rx - 1, cy + ry - 2, '#334155', 3);
    p.line(cx - rx + 2, cy + ry - 3, cx + rx - 2, cy - ry + 3, '#f8fafc', 2);
  } else {
    p.line(cx, cy - ry, cx, cy + ry, '#334155', 3);
    p.line(cx - rx, cy, cx + rx, cy, '#f8fafc', 2);
  }
  p.ellipse(cx + 1, cy, 4.5, 4, hubCol);
  p.ellipse(cx + 2, cy - 1, 2, 1.8, '#ffffff');
}

function drawAircraftUnit(
  p: PixelCanvas,
  pal: CharacterPalette,
  classId: UnitClassId,
  tier: UnitTier,
  frame: SpriteAnimFrame,
  animState: SpriteAnimState
) {
  const hover = Math.round(Math.sin((frame / 4) * Math.PI * 2) * 4) + (animState === 'selected' ? -4 : 0);
  const rotorWide = frame % 2 === 0;
  const cy = 98 + hover;
  const tStep = tier - 1; // 0, 1, 2, 3
  const isAxis = pal.eyeColor === '#991b1b';

  // LINEAGE C (T3-T4): Mi-24 / Cobra Gunship (T3) -> AH-64D Apache Longbow Tandem Attack Helicopter (T4)
  if (isHeliTransportClass(classId) && tier >= 3) {
    const isApex = tier >= 4;
    const tailX = isApex ? 12 : 24;
    const noseX = isApex ? 166 : 154;

    // 1. Far Stub Wing (3/4 upper-right perspective)
    p.poly(
      [
        [98, cy - 6],
        [118, cy - 4],
        [128, cy - (isApex ? 22 : 17)],
        [110, cy - (isApex ? 24 : 18)],
      ],
      pal.mountDark
    );

    // 2. Tapered Armored Tail Boom + Swept Fin + Horizontal Stabilator + 4-Blade X-Tail Rotor
    p.poly(
      [
        [tailX, cy - 8],
        [82, cy - 10],
        [84, cy + 8],
        [tailX + 4, cy + 2],
      ],
      pal.mountMid
    );
    p.line(tailX + 4, cy - 7, 80, cy - 9, pal.mountLight, 3);
    p.poly(
      [
        [tailX - 2, cy - (isApex ? 38 : 32)],
        [tailX + 10, cy - (isApex ? 38 : 32)],
        [tailX + 20, cy - 6],
        [tailX + 2, cy + 2],
      ],
      pal.mountMid
    );
    p.line(tailX, cy - (isApex ? 36 : 30), tailX + 8, cy - 8, pal.mountLight, 2);
    // Tail wheel strut
    p.line(tailX + 12, cy + 2, tailX + 8, cy + 14, pal.steelDark, 2);
    p.ellipse(tailX + 8, cy + 15, 3.5, 3.5, '#18181b');
    // Spinning X-tail rotor
    p.ellipse(tailX + 5, cy - 22, 10, 10, '#94a3b8');
    if (rotorWide) {
      p.line(tailX - 3, cy - 30, tailX + 13, cy - 14, '#1e293b', 2);
      p.line(tailX - 3, cy - 14, tailX + 13, cy - 30, '#f8fafc', 2);
    } else {
      p.line(tailX + 5, cy - 32, tailX + 5, cy - 12, '#1e293b', 2);
      p.line(tailX - 5, cy - 22, tailX + 15, cy - 22, '#f8fafc', 2);
    }

    // 3. Sculpted Gunship Fuselage + Twin T700 Turboshaft Nacelles + Black Hole IR Exhaust
    p.poly(
      [
        [76, cy - 12],
        [118, cy - 16],
        [noseX - 8, cy - 2],
        [noseX, cy + 8],
        [noseX - 10, cy + 16],
        [82, cy + 16],
        [74, cy + 8],
      ],
      pal.mountMid
    );
    p.poly(
      [
        [82, cy + 10],
        [noseX - 10, cy + 10],
        [noseX - 14, cy + 17],
        [84, cy + 17],
      ],
      pal.mountDark
    );
    // Twin turboshaft engine pod + circular intake + IR exhaust duct
    p.litCapsule(86, cy - 15, 120, cy - 14, 9, 8, pal.mountDark, pal.mountMid, pal.mountLight);
    p.ellipse(121, cy - 14, 4, 6, '#0f172a');
    p.bevelBox(80, cy - 20, 14, 9, '#1e293b', '#475569', '#09090b', 1);

    // 4. Stepped Flat-Pane Armored Ballistic-Glass Tandem Cockpits (Pilot Rear-High + Gunner Front-Low)
    p.poly(
      [
        [106, cy - 14],
        [124, cy - 22],
        [142, cy - 14],
        [156, cy - 4],
        [152, cy + 3],
        [106, cy + 2],
      ],
      '#0c4a6e'
    );
    p.poly(
      [
        [110, cy - 13],
        [124, cy - 19],
        [139, cy - 12],
        [152, cy - 3],
        [148, cy + 1],
        [110, cy],
      ],
      '#38bdf8'
    );
    // Two helmeted crew silhouettes + armored canopy frame bars
    p.ellipse(120, cy - 11, 3.5, 4, '#1e293b');
    p.ellipse(138, cy - 6, 3.5, 4, '#1e293b');
    p.line(124, cy - 21, 126, cy + 2, '#0f172a', 2);
    p.line(140, cy - 14, 141, cy + 2, '#0f172a', 2);
    p.line(114, cy - 16, 122, cy - 18, '#e0f2fe', 2);

    // 5. Nose TADS/PNVS Sensor Turret + Under-Chin 30mm M230 Chain Gun + Wheeled Landing Gear
    p.ellipse(noseX + 2, cy + 6, isApex ? 8 : 6, isApex ? 7 : 5, '#334155');
    p.ellipse(noseX + 4, cy + 6, 3.5, 3.5, '#38bdf8');
    p.set(noseX + 5, cy + 5, '#ffffff');
    // Chin 30mm M230 autocannon
    p.bevelBox(132, cy + 15, 12, 7, pal.steelDark, pal.steelMid, '#09090b', 1);
    p.line(142, cy + 19, noseX + (isApex ? 8 : 2), cy + 20, pal.steelDark, 3);
    p.line(142, cy + 18, noseX + (isApex ? 6 : 0), cy + 19, pal.steelLight, 1);
    // Forward wheeled taildragger landing struts
    p.line(118, cy + 15, 126, cy + 29, pal.steelMid, 3);
    p.wheelDetailed(127, cy + 30, 6, 3, 4, '#18181b', '#3f3f46', pal.steelMid, pal.steelLight, frame);

    // 6. Near Stub Wing + 19-Tube Hydra-70 Rocket Pod + AGM-114 Hellfire ATGMs
    p.poly(
      [
        [94, cy + 6],
        [118, cy + 6],
        [106, cy + (isApex ? 26 : 20)],
        [84, cy + (isApex ? 24 : 19)],
      ],
      pal.mountMid
    );
    p.line(94, cy + 7, 116, cy + 7, pal.mountLight, 2);
    // Cylindrical 19-tube Hydra rocket pod
    p.litCapsule(86, cy + 22, 114, cy + 23, 5.5, 5.5, pal.steelDark, pal.steelMid, pal.steelLight);
    p.ellipse(115, cy + 23, 3.5, 5, '#1e293b');
    if (isApex) {
      // Quad AGM-114 Hellfire missiles on rail rack
      for (let m = 0; m < 2; m++) {
        const my = cy + 30 + m * 5;
        p.litCapsule(84, my, 118, my + 1, 2.2, 2.2, '#1e293b', '#cbd5e1', '#ffffff');
        p.ellipse(119, my + 1, 2.5, 2, '#f59e0b');
      }
    }
    drawAirInsignia(p, 72, cy - 2, 4.5, isAxis, pal.capeMid);

    // 7. Rotor Mast + Tilted 3D Perspective 4-Blade Composite Rotor Disc + AN/APG-78 Longbow Radar Dome (T4)
    const mastX = 110;
    const rotorY = cy - 32;
    p.bevelBox(mastX - 5, rotorY, 10, 17, pal.steelMid, pal.steelLight, pal.steelDark, 1);
    const spanRx = isApex ? 76 : 62; // T4 reaches x = 110-76..110+76 = 34..186 (with tailX=12 -> 12..186 = 175px!)
    // Subtle rotor tip path ring + 4 swept composite blades
    p.line(mastX - spanRx, rotorY, mastX + spanRx, rotorY, '#64748b', 3);
    p.line(mastX - spanRx + 6, rotorY - 1, mastX + spanRx - 6, rotorY - 1, '#e2e8f0', 1);
    if (rotorWide) {
      p.line(mastX - Math.round(spanRx * 0.72), rotorY - 7, mastX + Math.round(spanRx * 0.72), rotorY + 7, '#334155', 3);
      p.line(mastX - Math.round(spanRx * 0.65), rotorY + 6, mastX + Math.round(spanRx * 0.65), rotorY - 6, '#cbd5e1', 2);
    } else {
      p.line(mastX - Math.round(spanRx * 0.45), rotorY - 8, mastX + Math.round(spanRx * 0.45), rotorY + 8, '#334155', 3);
      p.line(mastX - spanRx, rotorY + 2, mastX + spanRx, rotorY - 2, '#cbd5e1', 2);
    }
    p.ellipse(mastX, rotorY, 8, 4, pal.steelDark);
    if (isApex) {
      // Iconic AN/APG-78 Longbow Fire-Control Millimeter-Wave Radar Cheese-Wheel Radome!
      p.ellipse(mastX, rotorY - 9, 14, 6.5, '#475569');
      p.ellipse(mastX, rotorY - 10, 12, 5, '#cbd5e1');
      p.ellipse(mastX - 2, rotorY - 11, 7, 2.5, '#f8fafc');
    }
    return;
  }

  // LINEAGE B: Strategic Bombers (T1-T4) & Early Recon/Paratroop Transport (T1-T2) in 3/4 Banking Flight!
  if (isBomberPlaneClass(classId) || isHeliTransportClass(classId)) {
    const tailX = 46 - tStep * 11; // 46, 35, 24, 13
    const noseX = 142 + tStep * 12; // 142, 154, 166, 178 -> T4 span 13..182 = 170px!
    const tailY = cy - 12;
    const noseY = cy + 10;
    const midX = Math.round((tailX + noseX) * 0.52);
    const midY = Math.round((tailY + noseY) * 0.52);
    const wingReachY = 36 + tStep * 10; // 36, 46, 56, 66

    // 1. Far Swept Starboard Wing (sweeping BACKWARD up-left in authentic aerodynamic perspective!) + Far Engine Pods
    const farTipX = midX - (tier >= 3 ? 20 + tStep * 4 : 4);
    const farTipY = midY - wingReachY;
    p.poly(
      [
        [midX - 10 - tStep * 4, midY - 5],
        [midX + 20 + tStep * 5, midY - 1],
        [farTipX + 14, farTipY + 3],
        [farTipX - 2, farTipY],
      ],
      pal.mountDark
    );
    p.line(midX + 18 + tStep * 5, midY - 2, farTipX + 12, farTipY + 3, pal.mountLight, 2);

    if (tier === 2) {
      // Far Radial Engine Nacelle + Spinning Prop
      const fx = Math.round((midX + farTipX) * 0.54) + 6;
      const fy = Math.round((midY + farTipY) * 0.54);
      p.litCapsule(fx - 10, fy - 2, fx + 8, fy + 2, 5.5, 5, pal.steelDark, pal.mountMid, pal.mountLight);
      drawSpinningPropDisc(p, fx + 10, fy + 3, 3.5, rotorWide ? 12 : 9, rotorWide, '#dc2626');
    } else if (tier === 3) {
      // Far Underwing Jet Pod
      const fx = Math.round((midX + farTipX) * 0.52) + 4;
      const fy = Math.round((midY + farTipY) * 0.52);
      p.litCapsule(fx - 10, fy - 1, fx + 10, fy + 3, 4.5, 4.5, pal.steelDark, pal.steelMid, pal.steelLight);
    }

    // 2. Horizontal Tailplane Stabilizers + Swept Vertical Tail Fin
    p.poly(
      [
        [tailX + 2, tailY + 2],
        [tailX + 18, tailY + 5],
        [tailX + 28, tailY - 12 - tStep * 3],
        [tailX + 14, tailY - 14 - tStep * 3],
      ],
      pal.mountDark
    );
    p.poly(
      [
        [tailX, tailY + 4],
        [tailX + 18, tailY + 8],
        [tailX + 6, tailY + 20 + tStep * 3],
        [tailX - 6, tailY + 17 + tStep * 3],
      ],
      pal.mountMid
    );
    // Tall swept vertical tail fin with rudder stripe
    p.poly(
      [
        [tailX + 2, tailY - 2],
        [tailX + 24 + tStep * 3, tailY + 3],
        [tailX + 10, tailY - 32 - tStep * 5],
        [tailX - 2, tailY - 30 - tStep * 5],
      ],
      pal.mountMid
    );
    p.line(tailX + 10, tailY - 31 - tStep * 5, tailX + 22 + tStep * 3, tailY + 2, pal.mountLight, 2);
    p.rect(tailX + 2, tailY - 26 - tStep * 5, 6, 12, pal.capeMid);

    // 3. Supersonic Twin Afterburners at Tail Root (T4 B-1B / Tu-160 Strategic Bomber!)
    if (tier >= 4) {
      p.litCapsule(tailX + 6, tailY + 4, tailX + 26, tailY + 8, 6, 6, '#18181b', '#334155', '#64748b');
      p.poly(
        [
          [tailX + 6, tailY],
          [tailX + 6, tailY + 11],
          [Math.max(4, tailX - 16), tailY + 3],
        ],
        '#f97316'
      );
      p.poly(
        [
          [tailX + 6, tailY + 3],
          [tailX + 6, tailY + 8],
          [Math.max(7, tailX - 9), tailY + 4],
        ],
        '#fef08a'
      );
    }

    // 4. Heavy Aerodynamic Bomber Fuselage (3/4 cylindrical shaded body)
    const bodyR = 9 + tStep * 1.8;
    p.litCapsule(tailX + 6, tailY, noseX - 10, noseY - 2, bodyR * 0.65, bodyR, pal.mountDark, pal.mountMid, pal.mountLight);
    if (tier === 2 && isBomberPlaneClass(classId)) {
      // WWII Dorsal Plexiglas Gun Turret (B-17 / B-25 / He-111)!
      p.ellipse(midX - 6, midY - bodyR + 1, 7, 5, '#38bdf8');
      p.line(midX - 10, midY - bodyR - 1, midX - 18, midY - bodyR - 5, pal.steelDark, 2);
    }

    // 5. Cockpit & Nose Cone: Open Recon (T1) -> Glazed He-111/B-17 Bombardier Nose (T2) -> Jet Flight Deck (T3) -> Supersonic Needle Radome (T4)
    if (tier === 1) {
      p.ellipse(midX - 4, midY - 5, 6, 3.5, '#1e293b');
      p.ellipse(midX - 4, midY - 7, 3.5, 3.5, pal.skinMid);
      p.litCapsule(noseX - 14, noseY - 3, noseX - 2, noseY, 7.5, 6.5, pal.steelDark, pal.steelMid, pal.steelLight);
      drawSpinningPropDisc(p, noseX + 1, noseY + 1, 4, rotorWide ? 18 : 13, rotorWide, '#78350f');
    } else if (tier === 2) {
      // Framed glass greenhouse bombardier nose + stepped pilot windscreen
      p.poly(
        [
          [noseX - 28, noseY - 11],
          [noseX - 14, noseY - 12],
          [noseX - 6, noseY - 6],
          [noseX - 26, noseY - 4],
        ],
        '#38bdf8'
      );
      p.ellipse(noseX - 4, noseY - 1, 9, 7, '#0284c7');
      p.ellipse(noseX - 2, noseY - 2, 6, 5, '#7dd3fc');
      p.line(noseX - 8, noseY - 7, noseX - 6, noseY + 5, '#0f172a', 2);
    } else {
      // Pointed strategic radar nose + multi-pane jet flight deck windscreen
      p.poly(
        [
          [noseX - 16, noseY - 10],
          [noseX + 8, noseY + 3],
          [noseX - 16, noseY + 8],
        ],
        tier >= 4 ? '#1e293b' : pal.mountMid
      );
      p.poly(
        [
          [noseX - 30, noseY - 11],
          [noseX - 14, noseY - 11],
          [noseX - 8, noseY - 5],
          [noseX - 28, noseY - 4],
        ],
        '#0284c7'
      );
      p.line(noseX - 26, noseY - 9, noseX - 14, noseY - 9, '#bae6fd', 2);
    }

    // 6. Near Swept Port Wing (extending down-left in 3/4 perspective) + Multi-Engine Nacelles & Cruise Missiles
    const nearTipX = midX - (tier >= 3 ? 38 + tStep * 4 : 24);
    const nearTipY = midY + wingReachY + 4;
    p.poly(
      [
        [midX - 14 - tStep * 3, midY + 3],
        [midX + 16 + tStep * 4, midY + 7],
        [nearTipX + 16, nearTipY],
        [nearTipX, nearTipY - 4],
      ],
      pal.mountMid
    );
    p.line(midX + 14 + tStep * 4, midY + 7, nearTipX + 15, nearTipY - 1, pal.mountLight, 3);
    drawAirInsignia(p, Math.round((midX + nearTipX) * 0.5) + 4, Math.round((midY + nearTipY) * 0.5), 6.5, isAxis, pal.capeMid);

    if (tier === 1) {
      // Biplane upper wing struts
      p.line(midX + 4, midY - 18, midX - 6, midY + 16, '#78350f', 2);
      p.line(midX + 14, midY - 14, midX + 6, midY + 14, '#78350f', 2);
    } else if (tier === 2) {
      // Near WWII Radial Engine Nacelle + Spinning 3-Blade Propeller
      const nx = Math.round((midX + nearTipX) * 0.58) + 6;
      const ny = Math.round((midY + nearTipY) * 0.48) + 2;
      p.litCapsule(nx - 10, ny - 2, nx + 10, ny + 3, 6.5, 6, pal.steelDark, pal.mountMid, pal.mountLight);
      drawSpinningPropDisc(p, nx + 12, ny + 4, 4, rotorWide ? 14 : 10, rotorWide, '#dc2626');
    } else if (tier === 3) {
      // Twin Slung Turbofan Engine Pods under Swept Jet Wing!
      for (let e = 0; e < 2; e++) {
        const t = 0.36 + e * 0.28;
        const ex = Math.round(midX + (nearTipX - midX) * t) + 6;
        const ey = Math.round(midY + (nearTipY - midY) * t) + 4;
        p.litCapsule(ex - 10, ey - 2, ex + 11, ey + 3, 5, 4.5, pal.steelDark, pal.steelMid, pal.steelLight);
        p.ellipse(ex + 11, ey + 3, 2.5, 4, '#0f172a');
      }
    } else {
      // Tier 4 Supersonic Strategic Bomber Underwing ALCM Stealth Cruise Missiles!
      for (let m = 0; m < 2; m++) {
        const t = 0.35 + m * 0.26;
        const mx = Math.round(midX + (nearTipX - midX) * t) + 8;
        const my = Math.round(midY + (nearTipY - midY) * t) + 6;
        p.litCapsule(mx - 12, my - 2, mx + 14, my + 4, 3.2, 2.8, '#475569', '#e2e8f0', '#ffffff');
        p.ellipse(mx + 14, my + 4, 3, 2.2, '#dc2626');
      }
    }
    return;
  }

  // LINEAGE A: Fighter Aircraft in 3/4 Banking Flight!
  // Sopwith/Fokker Biplane (T1) -> Spitfire/Mustang (T2) -> F-16/Phantom Jet (T3) -> F-22A Stealth Raptor (T4)
  const tailX = 48 - tStep * 12; // 48, 36, 24, 12
  const noseX = 140 + tStep * 12; // 140, 152, 164, 176 -> T4 span 8..182 = 175px!
  const tailY = cy - 11;
  const noseY = cy + 9;
  const midX = Math.round((tailX + noseX) * 0.52);
  const midY = Math.round((tailY + noseY) * 0.52);
  const wingReachY = 32 + tStep * 10; // 32, 42, 52, 62

  // 1. Far Swept/Elliptical Wing (sweeping BACKWARD up-left so both wings form a sleek aerodynamic > arrowhead!)
  const farTipX = midX - (tier >= 3 ? 22 + tStep * 4 : 6);
  const farTipY = midY - wingReachY;
  p.poly(
    [
      [midX - 14 - tStep * 5, midY - 4],
      [midX + 22 + tStep * 5, midY],
      [farTipX + 14, farTipY + 3],
      [farTipX - 2, farTipY],
    ],
    pal.mountDark
  );
  p.line(midX + 20 + tStep * 5, midY - 1, farTipX + 13, farTipY + 3, pal.mountLight, 2);
  if (tier >= 3) {
    // Far wingtip AIM-9 Sidewinder / AIM-120 rail
    p.litCapsule(farTipX - 6, farTipY - 1, farTipX + 16, farTipY + 4, 2, 2, '#475569', '#f8fafc', '#ffffff');
    p.ellipse(farTipX + 17, farTipY + 4, 2, 2, '#dc2626');
  }

  // 2. Tail Stabilizers: Classic Empennage (T1-T3) vs Twin Outward-Canted Stealth Tails (T4 F-22A Raptor!)
  p.poly(
    [
      [tailX, tailY + 4],
      [tailX + 18, tailY + 8],
      [tailX + 4, tailY + 20 + tStep * 3],
      [tailX - 6, tailY + 16 + tStep * 3],
    ],
    pal.mountMid
  );
  if (tier >= 4) {
    // Far canted stealth tail
    p.poly(
      [
        [tailX + 8, tailY - 3],
        [tailX + 28, tailY + 1],
        [tailX + 20, tailY - 34],
        [tailX + 6, tailY - 32],
      ],
      pal.mountDark
    );
    // Near canted stealth tail with sawtooth highlight
    p.poly(
      [
        [tailX, tailY + 1],
        [tailX + 22, tailY + 5],
        [tailX + 10, tailY - 38],
        [tailX - 4, tailY - 34],
      ],
      pal.mountMid
    );
    p.line(tailX + 10, tailY - 37, tailX + 21, tailY + 4, pal.mountLight, 2);
  } else {
    p.poly(
      [
        [tailX + 2, tailY - 1],
        [tailX + 22 + tStep * 2, tailY + 3],
        [tailX + 8, tailY - 28 - tStep * 4],
        [tailX - 2, tailY - 25 - tStep * 4],
      ],
      pal.mountMid
    );
    p.line(tailX + 8, tailY - 27 - tStep * 4, tailX + 20 + tStep * 2, tailY + 2, pal.mountLight, 2);
    p.rect(tailX + 1, tailY - 22 - tStep * 4, 5, 10, pal.capeMid);
  }

  // 3. Jet Exhaust & Shock-Diamond Supersonic Afterburner (T3 Single Nozzle -> T4 Twin Vectoring Nozzles!)
  if (tier >= 3) {
    const flameX = tier >= 4 ? Math.max(4, tailX - 18) : Math.max(8, tailX - 13);
    p.bevelBox(tailX - 1, tailY - 4, 9, tier >= 4 ? 12 : 9, '#18181b', '#475569', '#09090b', 1);
    p.poly(
      [
        [tailX, tailY - 3],
        [tailX, tailY + (tier >= 4 ? 8 : 5)],
        [flameX, tailY + 1],
      ],
      '#f97316'
    );
    p.poly(
      [
        [tailX, tailY],
        [tailX, tailY + (tier >= 4 ? 5 : 3)],
        [flameX + 7, tailY + 1],
      ],
      '#fef08a'
    );
  }

  // 4. Sleek Tapered Fighter Fuselage + Air Intakes / Exhaust Stacks
  const fR = 8 + tStep * 1.4;
  p.litCapsule(tailX + 6, tailY + 1, noseX - 10, noseY - 1, fR * 0.62, fR, pal.mountDark, pal.mountMid, pal.mountLight);
  if (tier === 2) {
    // WWII Merlin / Daimler-Benz V12 exhaust stubs + ventral radiator scoop
    for (let ex = noseX - 30; ex <= noseX - 14; ex += 5) {
      p.rect(ex, noseY - 2, 3, 2, '#292524');
    }
    p.bevelBox(midX - 6, midY + 6, 16, 6, pal.mountDark, pal.mountMid, '#09090b', 1);
  } else if (tier >= 3) {
    // Cheek/Chin supersonic jet air intake
    p.poly(
      [
        [midX + 10, midY + 2],
        [midX + 26, midY + 4],
        [midX + 22, midY + 11],
        [midX + 8, midY + 9],
      ],
      '#0f172a'
    );
  }

  // 5. Cockpit & Nose: Open Biplane Pilot (T1) -> Framed Spitfire Bubble (T2) -> F-16 Bubble (T3) -> Gold Stealth Raptor Canopy (T4)
  if (tier === 1) {
    // Open cockpit + goggled WWI ace + rotary radial engine cowling
    p.ellipse(midX - 2, midY - 5, 6, 3.5, '#1c1917');
    p.ellipse(midX - 1, midY - 8, 4, 4, '#5c3a21');
    p.line(midX - 5, midY - 7, midX - 13, midY - 9, '#f8fafc', 2); // silk aviator scarf!
    p.litCapsule(noseX - 12, noseY - 3, noseX - 2, noseY, 7.5, 7, pal.steelDark, pal.steelMid, pal.steelLight);
    drawSpinningPropDisc(p, noseX + 2, noseY + 1, 4, rotorWide ? 19 : 14, rotorWide, '#78350f');
  } else if (tier === 2) {
    // WWII Teardrop Bubble Canopy + Pointed Aerodynamic Spinner + 4-Blade Propeller
    p.ellipse(midX + 2, midY - 6, 12, 5.5, '#0284c7');
    p.ellipse(midX + 2, midY - 7, 9, 4, '#7dd3fc');
    p.ellipse(midX + 1, midY - 6, 3, 3, '#44403c'); // pilot head
    p.line(midX - 2, midY - 11, midX - 2, midY - 1, pal.mountDark, 2);
    p.line(midX + 7, midY - 10, midX + 7, midY - 1, pal.mountDark, 2);
    p.poly(
      [
        [noseX - 8, noseY - 6],
        [noseX + 4, noseY],
        [noseX - 8, noseY + 5],
      ],
      isAxis ? '#facc15' : '#dc2626'
    );
    drawSpinningPropDisc(p, noseX + 4, noseY, 4, rotorWide ? 21 : 15, rotorWide, isAxis ? '#facc15' : '#dc2626');
  } else if (tier === 3) {
    // Frameless Smoked Polycarbonate Jet Bubble Canopy + Dark Radome Nose Cone
    p.ellipse(midX + 8, midY - 6, 15, 6, '#0369a1');
    p.ellipse(midX + 8, midY - 7, 11, 4, '#38bdf8');
    p.line(midX + 4, midY - 10, midX + 14, midY - 9, '#e0f2fe', 2);
    p.poly(
      [
        [noseX - 14, noseY - 7],
        [noseX + 8, noseY + 2],
        [noseX - 14, noseY + 6],
      ],
      '#334155'
    );
    p.line(noseX + 6, noseY + 2, noseX + 13, noseY + 3, pal.steelLight, 1); // nose pitot tube
  } else {
    // Tier 4 Gold-Tinted Radar-Absorbent F-22A Canopy + Chined Stealth Diamond Nose!
    p.ellipse(midX + 10, midY - 6, 17, 6.5, '#92400e');
    p.ellipse(midX + 10, midY - 7, 13, 4.5, '#eab308');
    p.line(midX + 5, midY - 10, midX + 16, midY - 9, '#fef9c3', 2);
    p.poly(
      [
        [noseX - 18, noseY - 8],
        [noseX + 10, noseY + 2],
        [noseX - 18, noseY + 7],
      ],
      '#475569'
    );
    p.line(noseX - 18, noseY - 1, noseX + 9, noseY + 2, '#cbd5e1', 2); // stealth nose chine!
  }

  // 6. Near Swept/Elliptical Wing (sweeping BACKWARD down-left in authentic > fighter arrowhead!) + Weapons & Stripes
  const nearTipX = midX - (tier >= 3 ? 28 + tStep * 5 : 14);
  const nearTipY = midY + wingReachY + 4;
  p.poly(
    [
      [midX - 16 - tStep * 5, midY + 2],
      [midX + 22 + tStep * 5, midY + 6],
      [nearTipX + 15, nearTipY],
      [nearTipX - 1, nearTipY - 4],
    ],
    pal.mountMid
  );
  p.line(midX + 20 + tStep * 5, midY + 6, nearTipX + 14, nearTipY - 1, pal.mountLight, 3);

  if (tier === 1) {
    // WWI Biplane Upper Parasol Wing + Wooden Interplane N-Struts & Rigging!
    p.poly(
      [
        [midX - 10, midY - 16],
        [midX + 18, midY - 12],
        [nearTipX + 20, nearTipY - 16],
        [nearTipX + 4, nearTipY - 20],
      ],
      pal.mountLight
    );
    p.line(nearTipX + 12, nearTipY - 18, nearTipX + 10, nearTipY - 3, '#78350f', 2);
    p.line(midX + 6, midY - 14, midX + 4, midY + 3, '#78350f', 2);
    p.line(nearTipX + 12, nearTipY - 17, midX + 4, midY + 2, '#cbd5e1', 1);
  } else if (tier === 2) {
    // WWII D-Day Stripes (Allied) & Protruding 20mm Hispano Wing Cannons!
    if (!isAxis) {
      p.line(midX - 2, midY + 8, midX - 12, midY + 22, '#f8fafc', 4);
      p.line(midX + 2, midY + 9, midX - 8, midY + 23, '#18181b', 3);
    }
    p.line(midX + 6, midY + 14, midX + 20, midY + 17, pal.steelDark, 2);
    p.line(midX, midY + 22, midX + 14, midY + 25, pal.steelDark, 2);
  } else if (tier >= 3) {
    // Wingtip & Underwing AIM-9X / AIM-120D Air-to-Air Missiles!
    p.litCapsule(nearTipX - 4, nearTipY - 4, nearTipX + 22, nearTipY + 1, 2.4, 2.2, '#475569', '#f8fafc', '#ffffff');
    p.ellipse(nearTipX + 23, nearTipY + 1, 2.5, 2, '#dc2626');
    if (tier >= 4) {
      const px = Math.round((midX + nearTipX) * 0.56);
      const py = Math.round((midY + nearTipY) * 0.56) + 3;
      p.litCapsule(px - 10, py - 2, px + 16, py + 3, 2.6, 2.4, '#334155', '#e2e8f0', '#ffffff');
      p.ellipse(px + 17, py + 3, 2.5, 2, '#f59e0b');
    }
  }
  drawAirInsignia(p, Math.round((midX + nearTipX) * 0.48) + 2, Math.round((midY + nearTipY) * 0.52), 5.5, isAxis, pal.capeMid);
}

// ============================================================================
// 5. 192x192 REALISTIC LOW-FREEBOARD NAVAL WARSHIP, SUBMARINE & CARRIER RENDERER
// ============================================================================

function drawNavalGunTurret(
  p: PixelCanvas,
  tx: number,
  ty: number,
  tw: number,
  th: number,
  barrelLen: number,
  dir: 1 | -1,
  barrels: 1 | 2 | 3,
  pal: CharacterPalette,
  stealth = false
) {
  if (stealth) {
    p.poly(
      [
        [tx, ty + th],
        [tx + 4, ty],
        [tx + tw - 3, ty],
        [tx + tw, ty + th],
      ],
      pal.mountMid
    );
    p.line(tx + 4, ty + 1, tx + tw - 3, ty + 1, pal.mountLight, 2);
  } else {
    p.poly(
      [
        [tx, ty + th],
        [tx + 2, ty + 2],
        [tx + tw - 4, ty],
        [tx + tw, ty + 4],
        [tx + tw, ty + th],
      ],
      pal.mountMid
    );
    p.line(tx + 3, ty + 2, tx + tw - 4, ty + 1, pal.mountLight, 2);
    // White/Khaki canvas blast bag at barrel root
    const bagX = dir === 1 ? tx + tw - 2 : tx - 3;
    p.ellipse(bagX, ty + Math.round(th * 0.45), 3.5, 3, '#e2e8f0');
  }

  const rootX = dir === 1 ? tx + tw - 1 : tx + 1;
  const tipX = Math.max(5, Math.min(186, rootX + dir * barrelLen));
  if (barrels >= 2) {
    p.line(rootX, ty + 3, tipX, ty - 3, pal.steelDark, 2);
    p.line(rootX, ty + 6, tipX, ty, pal.steelMid, 2);
    if (barrels === 3) {
      p.line(rootX, ty + 4, tipX, ty - 2, pal.steelLight, 1);
    }
  } else {
    p.line(rootX, ty + 4, tipX, ty - 2, pal.steelDark, 3);
    p.line(rootX, ty + 3, tipX, ty - 3, pal.steelLight, 1);
  }
}

function drawNavalUnit(
  p: PixelCanvas,
  pal: CharacterPalette,
  classId: UnitClassId,
  tier: UnitTier,
  frame: SpriteAnimFrame
) {
  const bob = frame === 1 || frame === 2 ? -2 : 0;
  const wakeShift = frame % 2 === 0 ? 0 : 5;
  const tStep = tier - 1; // 0, 1, 2, 3

  // Sleek hydrodynamic hull length: T1(126) -> T2(144) -> T3(162) -> T4(178)
  const hullSpan = 126 + tStep * 17 + (tier === 4 ? 1 : 0);
  const hullLeft = Math.max(7, Math.round(96 - hullSpan / 2));
  const hullRight = Math.min(185, hullLeft + hullSpan);
  const waterlineY = 164;

  // Deep Ocean Waterline Trough + Multi-Layered Kelvin Wake & Curling Bow Foam
  p.ellipse(96, waterlineY + 4, Math.round(hullSpan * 0.53), 6, '#0c4a6e');
  p.ellipse(96, waterlineY + 3, Math.round(hullSpan * 0.5), 4, '#0284c7');

  // LINEAGE B: Coastal U-Boat (T1) -> Type VII U-Boat (T2) -> Virginia SSN (T3) -> Ohio/Typhoon SSBN (T4)
  if (isSubmarineClass(classId)) {
    const subLeft = hullLeft;
    const subRight = hullRight;
    const hullH = 14 + tStep * 2; // sleek low-lying cigar/teardrop hull

    // Pressure hull + saddle tank / missile turtleback deck
    p.litCapsule(
      subLeft + 8,
      waterlineY - 4 + bob,
      subRight - 10,
      waterlineY - 4 + bob,
      hullH * 0.72,
      hullH * 0.78,
      pal.mountDark,
      pal.mountMid,
      pal.mountLight
    );
    // Red anti-fouling lower hull strip just at waterline
    p.line(subLeft + 14, waterlineY + 1 + bob, subRight - 14, waterlineY + 1 + bob, '#7f1d1d', 3);

    if (tier <= 2) {
      // WWI/WWII U-Boat slotted casing deck, saddle tank blister, bow net-cutter & jumping wire!
      p.poly(
        [
          [subLeft + 10, waterlineY - 8 + bob],
          [subLeft + 26, waterlineY - 14 + bob],
          [subRight - 16, waterlineY - 15 + bob],
          [subRight - 2, waterlineY - 6 + bob],
          [subRight - 8, waterlineY - 2 + bob],
          [subLeft + 12, waterlineY - 2 + bob],
        ],
        pal.mountMid
      );
      p.line(subLeft + 26, waterlineY - 14 + bob, subRight - 16, waterlineY - 15 + bob, pal.mountLight, 2);
      for (let vx = subLeft + 26; vx <= subRight - 24; vx += 10) {
        p.rect(vx, waterlineY - 8 + bob, 5, 2, '#0f172a'); // free-flooding casing slots
      }
      // Conning tower + Wintergarten AA platform
      const cxTower = 92;
      const twW = tier === 1 ? 22 : 28;
      const twH = tier === 1 ? 18 : 22;
      const twY = waterlineY - 14 - twH + bob;
      p.poly(
        [
          [cxTower - 8, waterlineY - 14 + bob],
          [cxTower - 6, twY + 4],
          [cxTower + twW - 8, twY],
          [cxTower + twW - 4, waterlineY - 14 + bob],
        ],
        pal.mountMid
      );
      p.line(cxTower - 5, twY + 3, cxTower + twW - 8, twY + 1, pal.mountLight, 2);
      // Dual periscopes & jumping wire
      p.line(cxTower + 4, twY, cxTower + 4, twY - 16, pal.steelLight, 2);
      p.line(cxTower + 10, twY, cxTower + 10, twY - 11, pal.steelMid, 2);
      p.line(subLeft + 14, waterlineY - 10 + bob, cxTower - 5, twY + 3, '#64748b', 1);
      p.line(cxTower + twW - 8, twY + 2, subRight - 8, waterlineY - 12 + bob, '#64748b', 1);
      if (tier === 2) {
        // WWII 88mm U-Boat Deck Gun forward of conning tower + 20mm AA aft!
        drawNavalGunTurret(p, cxTower + twW + 4, waterlineY - 22 + bob, 10, 8, 16, 1, 1, pal);
        p.line(cxTower - 8, twY + 6, cxTower - 18, twY + 1, pal.steelDark, 2);
      }
    } else {
      // Modern Nuclear SSN (T3) -> Ohio/Typhoon Ballistic Missile SSBN with Raised Missile Turtleback (T4)!
      const sailX = tier >= 4 ? 116 : 104;
      const sailW = tier >= 4 ? 26 : 24;
      const sailH = tier >= 4 ? 28 : 24;
      const sailY = waterlineY - 14 - sailH + bob;

      if (tier >= 4) {
        // Raised SSBN Ballistic Missile Turtleback Deck with 6 SLBM Silo Hatches!
        p.poly(
          [
            [subLeft + 20, waterlineY - 12 + bob],
            [subLeft + 30, waterlineY - 22 + bob],
            [sailX + 2, waterlineY - 22 + bob],
            [sailX + 6, waterlineY - 12 + bob],
          ],
          pal.mountMid
        );
        p.line(subLeft + 30, waterlineY - 21 + bob, sailX, waterlineY - 21 + bob, pal.mountLight, 2);
        for (let s = 0; s < 5; s++) {
          const sx = subLeft + 34 + s * 15;
          p.bevelBox(sx, waterlineY - 20 + bob, 11, 6, '#334155', '#94a3b8', '#0f172a', 1);
        }
        // One open missile hatch revealing a white/orange Trident D5 SLBM nosecone!
        p.line(subLeft + 64, waterlineY - 20 + bob, subLeft + 60, waterlineY - 30 + bob, pal.steelLight, 2);
        p.ellipse(subLeft + 69, waterlineY - 22 + bob, 3.5, 5, '#f8fafc');
        p.ellipse(subLeft + 69, waterlineY - 25 + bob, 2.5, 2.5, '#f97316');
      }

      // Filleted Hydrodynamic Nuclear Sail + Fairwater Diving Planes + Optronic Masts
      p.poly(
        [
          [sailX - 4, waterlineY - 13 + bob],
          [sailX, sailY + 2],
          [sailX + sailW - 4, sailY],
          [sailX + sailW, waterlineY - 13 + bob],
        ],
        pal.mountMid
      );
      p.line(sailX + 1, sailY + 2, sailX + sailW - 4, sailY + 1, pal.mountLight, 2);
      p.bevelBox(sailX + 8, sailY + 10, 14, 5, pal.steelMid, pal.steelLight, pal.steelDark, 1); // fairwater plane
      p.line(sailX + 8, sailY, sailX + 8, sailY - 18, pal.steelLight, 3);
      p.bevelBox(sailX + 6, sailY - 20, 8, 5, '#0284c7', '#7dd3fc', '#0f172a', 1);
      p.line(sailX + 16, sailY, sailX + 16, sailY - 12, pal.steelMid, 2);
      // Stern X-rudder / shrouded pump-jet stabilizer fin
      p.poly(
        [
          [subLeft + 4, waterlineY - 8 + bob],
          [subLeft + 18, waterlineY - 10 + bob],
          [subLeft + 8, waterlineY - 26 + bob],
          [subLeft + 2, waterlineY - 24 + bob],
        ],
        pal.mountDark
      );
    }

    // Foaming White Surface Spray Over Submarine Casing & Bow
    p.line(subLeft + 8 + wakeShift, waterlineY + 3, subLeft + 46 + wakeShift, waterlineY + 3, '#e0f2fe', 3);
    p.line(subRight - 28, waterlineY + 2, subRight + 4, waterlineY + 3, '#ffffff', 3);
    return;
  }

  // LINEAGE C: Amphibious LST (T1) -> WWII Fleet Carrier (T2) -> Forrestal Carrier (T3) -> Ford/Nimitz Nuclear Supercarrier (T4)
  if (isCarrierLandingClass(classId)) {
    if (tier === 1) {
      // Authentic WWII LST / LCT Armored Tank Landing Craft (Sleek Low Well-Deck + Embarked Sherman + Bow Ramp!)
      const deckY = 142 + bob;
      p.poly(
        [
          [hullLeft + 4, waterlineY + bob],
          [hullLeft, deckY + 2],
          [hullRight - 8, deckY],
          [hullRight, waterlineY - 4 + bob],
          [hullRight - 6, waterlineY + bob],
        ],
        pal.mountMid
      );
      p.line(hullLeft + 2, waterlineY - 2 + bob, hullRight - 6, waterlineY - 2 + bob, '#7f1d1d', 3);
      p.line(hullLeft + 2, deckY + 2, hullRight - 10, deckY + 1, pal.mountLight, 2);
      // Stern Armored Pilot House + Signal Mast + Oerlikon AA Tub
      p.poly(
        [
          [hullLeft + 6, deckY + 1],
          [hullLeft + 8, deckY - 22],
          [hullLeft + 34, deckY - 22],
          [hullLeft + 38, deckY + 1],
        ],
        pal.mountMid
      );
      p.line(hullLeft + 8, deckY - 21, hullLeft + 34, deckY - 21, pal.mountLight, 2);
      p.bevelBox(hullLeft + 14, deckY - 17, 16, 6, '#0c4a6e', '#7dd3fc', '#020617', 1);
      p.line(hullLeft + 20, deckY - 22, hullLeft + 20, deckY - 38, pal.steelLight, 2);
      // Embarked Olive Tank Visible Inside Open Well-Deck!
      p.bevelBox(hullLeft + 52, deckY - 12, 34, 12, pal.armorMid, pal.armorLight, pal.armorDark, 2);
      p.ellipse(hullLeft + 68, deckY - 14, 9, 5, pal.armorLight);
      p.line(hullLeft + 76, deckY - 15, hullLeft + 94, deckY - 17, pal.steelLight, 2);
      // Heavy Steel Hinged Bow Ramp + Winch Cables
      p.poly(
        [
          [hullRight - 8, deckY - 8],
          [hullRight - 2, deckY - 10],
          [hullRight + 6, waterlineY - 2 + bob],
          [hullRight, waterlineY + bob],
        ],
        pal.steelMid
      );
      p.line(hullRight - 16, deckY - 6, hullRight + 1, deckY - 8, pal.steelLight, 1);
      p.line(hullLeft + 4 + wakeShift, waterlineY + 3, hullLeft + 42 + wakeShift, waterlineY + 3, '#e0f2fe', 3);
      p.line(hullRight - 18, waterlineY + 2, hullRight + 6, waterlineY + 3, '#ffffff', 3);
      return;
    }

    // Tier 2..4 Aircraft Carriers: Flared Hangar Hull + Angled Cantilevered Flight Deck + Starboard Island + Parked Air Wing!
    const flightDeckY = (tier >= 4 ? 124 : 128) + bob;
    const hangarTopY = flightDeckY + (tier >= 4 ? 10 : 8);

    // Sleek Flared Carrier Hull with Sponsons & Hangar Bay Openings
    p.poly(
      [
        [hullLeft + 12, waterlineY + bob],
        [hullLeft + 2, hangarTopY],
        [hullRight - 2, hangarTopY - 2],
        [hullRight - 14, waterlineY + bob],
      ],
      pal.mountMid
    );
    p.poly(
      [
        [hullRight - 28, hangarTopY - 2],
        [hullRight - 2, hangarTopY - 2],
        [hullRight - 14, waterlineY + bob],
        [hullRight - 32, waterlineY + bob],
      ],
      pal.mountDark
    );
    p.line(hullLeft + 12, waterlineY - 2 + bob, hullRight - 14, waterlineY - 2 + bob, '#7f1d1d', 3);
    // Open side hangar deck bays
    for (let hx = hullLeft + 34; hx <= hullRight - 46; hx += 28) {
      p.rect(hx, hangarTopY + 5, 16, 7, '#0f172a');
    }

    // Cantilevered Steel Flight Deck (3/4 Perspective Trapezoid Showing Angled Landing Strip & Markings!)
    p.poly(
      [
        [hullLeft - 2, hangarTopY],
        [hullLeft + 6, flightDeckY],
        [hullRight - 2, flightDeckY - 2],
        [hullRight + 3, hangarTopY - 2],
      ],
      '#334155'
    );
    p.line(hullLeft + 6, flightDeckY + 1, hullRight - 2, flightDeckY - 1, '#64748b', 2);
    // Dashed white centerline + yellow EMALS catapult tracks (T3/T4)
    for (let dx = hullLeft + 14; dx <= hullRight - 16; dx += 14) {
      p.line(dx, flightDeckY + 4, dx + 7, flightDeckY + 4, '#f8fafc', 2);
    }
    if (tier >= 3) {
      p.line(hullLeft + 46, flightDeckY + 7, hullRight - 8, flightDeckY + 5, '#facc15', 2);
    }
    if (tier >= 4) {
      // SeaRAM / Phalanx CIWS Sponsons
      p.ellipse(hullRight - 22, hangarTopY + 6, 4.5, 5, '#f8fafc');
      p.ellipse(hullLeft + 20, hangarTopY + 6, 4.5, 5, '#f8fafc');
    }

    // Starboard Carrier Island Superstructure + 3D Radar / Phased-Array Mast
    const islX = tier >= 4 ? hullLeft + 24 : hullLeft + 34;
    const islW = 24 + tStep * 4;
    const islH = 26 + tStep * 5;
    const islY = flightDeckY - islH + 2;
    p.poly(
      [
        [islX, flightDeckY + 2],
        [islX + 3, islY],
        [islX + islW - 3, islY],
        [islX + islW, flightDeckY + 2],
      ],
      pal.mountMid
    );
    p.line(islX + 3, islY + 1, islX + islW - 3, islY + 1, pal.mountLight, 2);
    // Primary Flight Control ("Pri-Fly") & Navigation Bridge Windows
    p.bevelBox(islX + 5, islY + 6, islW - 10, 5, '#0c4a6e', '#7dd3fc', '#020617', 1);
    p.bevelBox(islX + 7, islY + 13, islW - 12, 4, '#0c4a6e', '#38bdf8', '#020617', 1);
    // Mast & Radar Array
    p.line(islX + Math.round(islW * 0.5), islY, islX + Math.round(islW * 0.5), islY - 18, pal.steelLight, 2);
    p.bevelBox(
      islX + 4,
      islY - 13,
      islW - 8,
      6,
      tier >= 4 ? '#0284c7' : pal.steelMid,
      tier >= 4 ? '#7dd3fc' : '#ffffff',
      pal.steelDark,
      1
    );

    // Embarked Carrier Air Wing Spotted on Flight Deck (Corsairs -> Tomcats -> F-35C Stealth Jets + E-2D Hawkeye!)
    const planeCount = tier; // 2, 3, 4 miniature aircraft
    for (let i = 0; i < planeCount; i++) {
      const px = hullRight - 24 - i * 24;
      if (px > islX + islW + 4) {
        if (tier >= 4 && i === planeCount - 1) {
          // E-2D Hawkeye AWACS with white circular rotodome radar dish!
          p.litCapsule(px, flightDeckY - 3, px + 16, flightDeckY - 3, 3, 2.5, '#334155', '#94a3b8', '#f8fafc');
          p.ellipse(px + 7, flightDeckY - 9, 8, 2.5, '#ffffff');
        } else {
          // Miniature Fighter Aircraft on Deck
          p.poly(
            [
              [px, flightDeckY - 2],
              [px + 16, flightDeckY - 3],
              [px + 6, flightDeckY - 8],
              [px + 2, flightDeckY - 7],
            ],
            tier === 2 ? '#1e3a8a' : '#64748b'
          );
          p.line(px + 2, flightDeckY - 4, px + 15, flightDeckY - 4, '#cbd5e1', 2);
          p.set(px + 12, flightDeckY - 5, tier >= 4 ? '#facc15' : '#38bdf8');
        }
      }
    }

    p.line(hullLeft + 8 + wakeShift, waterlineY + 3, hullLeft + 52 + wakeShift, waterlineY + 3, '#e0f2fe', 3);
    p.line(hullRight - 26, waterlineY + 2, hullRight + 4, waterlineY + 3, '#ffffff', 3);
    return;
  }

  // LINEAGE A: Surface Combatants — WWI Destroyer (T1) -> WWII Cruiser (T2) -> Fast Battleship (T3) -> Modern Aegis Cruiser (T4)
  // Sleek Low-Freeboard Hydrodynamic Warship Hull with Raised Forecastle & Raked Clipper Bow!
  const qDeckY = 146 + bob; // aft quarterdeck
  const fDeckY = 136 + bob; // raised forward forecastle sheerline
  const breakX = Math.round(hullLeft + hullSpan * 0.45);

  p.poly(
    [
      [hullLeft + 8, waterlineY + bob],
      [hullLeft + 2, qDeckY],
      [breakX, qDeckY],
      [breakX + 12, fDeckY + 2],
      [hullRight, fDeckY - 4],
      [hullRight - 12, waterlineY + bob],
    ],
    pal.mountMid
  );
  // Bow flare shadow + crisp forecastle sheer highlight + red boot-topping + anchor hawsepipe
  p.poly(
    [
      [hullRight - 28, fDeckY],
      [hullRight, fDeckY - 4],
      [hullRight - 12, waterlineY + bob],
      [hullRight - 34, waterlineY + bob],
    ],
    pal.mountDark
  );
  p.line(hullLeft + 3, qDeckY + 1, breakX, qDeckY + 1, pal.mountLight, 2);
  p.line(breakX + 12, fDeckY + 2, hullRight - 2, fDeckY - 3, pal.mountLight, 2);
  p.line(hullLeft + 8, waterlineY - 2 + bob, hullRight - 12, waterlineY - 2 + bob, '#7f1d1d', 3);
  p.ellipse(hullRight - 14, fDeckY + 5, 2.5, 2, '#0f172a'); // anchor hawsepipe
  if (tier <= 3) {
    for (let ph = hullLeft + 20; ph <= breakX + 16; ph += 12) {
      p.set(ph, qDeckY + 6, '#0f172a');
      p.set(ph + 1, qDeckY + 6, '#0f172a');
    }
  }

  if (tier >= 4) {
    // TIER 4 MODERN AEGIS GUIDED-MISSILE CRUISER / DESTROYER (Arleigh Burke / Ticonderoga)!
    // Aft Helicopter Hangar + Aft Mk-41 VLS Deck
    p.poly(
      [
        [hullLeft + 22, qDeckY],
        [hullLeft + 26, qDeckY - 16],
        [hullLeft + 58, qDeckY - 16],
        [hullLeft + 62, qDeckY],
      ],
      pal.mountMid
    );
    p.line(hullLeft + 26, qDeckY - 15, hullLeft + 58, qDeckY - 15, pal.mountLight, 2);
    // Slanted Quad Harpoon Anti-Ship Missile Canisters midships
    p.litCapsule(hullLeft + 64, qDeckY - 4, hullLeft + 80, qDeckY - 16, 4, 4, pal.steelDark, pal.steelMid, pal.steelLight);
    // White Phalanx CIWS R2-D2 Close-In Weapon System dome!
    p.rect(hullLeft + 46, qDeckY - 21, 7, 5, pal.steelDark);
    p.ellipse(hullLeft + 49, qDeckY - 24, 3.5, 5, '#f8fafc');

    // Forward Sloped Stealth Superstructure + Octagonal SPY-1D/SPY-6 Phased-Array Radar Panels!
    const supX = breakX + 6;
    const supW = 42;
    const supTop = fDeckY - 34;
    p.poly(
      [
        [supX - 4, fDeckY + 2],
        [supX + 4, supTop],
        [supX + supW - 6, supTop],
        [supX + supW + 4, fDeckY + 1],
      ],
      pal.mountMid
    );
    p.line(supX + 4, supTop + 1, supX + supW - 6, supTop + 1, pal.mountLight, 2);
    // Armored stealth bridge windows
    p.bevelBox(supX + 10, supTop + 6, supW - 18, 5, '#0f172a', '#38bdf8', '#020617', 1);
    // Iconic Octagonal Aegis SPY Phased-Array Radar Faces!
    p.poly(
      [
        [supX + 12, supTop + 15],
        [supX + 20, supTop + 15],
        [supX + 23, supTop + 21],
        [supX + 20, supTop + 27],
        [supX + 12, supTop + 27],
        [supX + 9, supTop + 21],
      ],
      '#0284c7'
    );
    p.poly(
      [
        [supX + 28, supTop + 16],
        [supX + 35, supTop + 16],
        [supX + 37, supTop + 21],
        [supX + 35, supTop + 26],
        [supX + 28, supTop + 26],
        [supX + 26, supTop + 21],
      ],
      '#38bdf8'
    );
    // Enclosed Composite Stealth Mast + White SATCOM Radomes
    p.poly(
      [
        [supX + 14, supTop],
        [supX + 18, supTop - 26],
        [supX + 23, supTop - 26],
        [supX + 26, supTop],
      ],
      pal.mountLight
    );
    p.ellipse(supX + 20, supTop - 28, 3, 3, '#38bdf8');
    p.ellipse(supX + 8, supTop - 4, 4, 4, '#f8fafc'); // SATCOM dome

    // Fore Mk-41 Vertical Launch System (VLS) Cells + Faceted 127mm Mk-45 Stealth Bow Gun!
    p.bevelBox(supX + supW + 4, fDeckY - 4, 16, 5, '#cbd5e1', '#ffffff', '#475569', 1);
    drawNavalGunTurret(p, supX + supW + 22, fDeckY - 10, 14, 9, 18, 1, 1, pal, true);
  } else {
    // TIER 1 (WWI Torpedo Destroyer) -> TIER 2 (WWII Heavy Cruiser) -> TIER 3 (Iowa / Bismarck Fast Battleship)
    const supX = breakX - 6;
    const supW = 24 + tStep * 6;
    const supH = 20 + tStep * 8; // 20, 28, 36
    const supTop = fDeckY - supH;

    // Raked Naval Smokestack Funnels (Twin Funnels on T1/T2, Massive Armored Funnel on T3!)
    const funCount = tier <= 2 ? 2 : 1;
    for (let f = 0; f < funCount; f++) {
      const fx = supX - 14 - f * 14;
      const fw = tier === 3 ? 13 : 9;
      const fh = 18 + tStep * 3;
      p.poly(
        [
          [fx, qDeckY],
          [fx - 4, qDeckY - fh],
          [fx - 4 + fw, qDeckY - fh],
          [fx + fw, qDeckY],
        ],
        pal.steelMid
      );
      p.line(fx - 4, qDeckY - fh + 2, fx - 4 + fw, qDeckY - fh + 2, '#18181b', 4); // black soot cap
    }

    if (tier === 1) {
      // Midships WWI Triple Torpedo-Tube Launcher!
      p.litCapsule(hullLeft + 28, qDeckY - 4, hullLeft + 44, qDeckY - 5, 3.5, 3.5, pal.steelDark, pal.steelMid, pal.steelLight);
    } else if (tier === 3) {
      // Secondary 5-inch dual-purpose turret midships on Battleship
      drawNavalGunTurret(p, supX - 28, qDeckY - 9, 12, 8, 11, -1, 2, pal);
    }

    // Tiered Armored Conning / Pagoda Bridge Tower + Stereo Optical Rangefinder + Tripod Radar Mast
    p.poly(
      [
        [supX, fDeckY + 2],
        [supX + 3, supTop + 8],
        [supX + supW - 2, supTop + 8],
        [supX + supW + 2, fDeckY + 2],
      ],
      pal.mountMid
    );
    p.bevelBox(supX + 5, supTop, supW - 8, 10, pal.mountLight, '#f8fafc', pal.mountDark, 1);
    p.bevelBox(supX + 7, supTop + 3, supW - 12, 4, '#0c4a6e', '#7dd3fc', '#020617', 1);
    if (tier >= 2) {
      // Optical stereo rangefinder arms atop armored director!
      p.line(supX + 2, supTop - 4, supX + supW - 2, supTop - 4, pal.steelLight, 3);
      p.ellipse(supX + 2, supTop - 4, 2, 2, '#f8fafc');
      p.ellipse(supX + supW - 2, supTop - 4, 2, 2, '#f8fafc');
    }
    // Tripod Mast & Yardarm
    const mastX = supX + Math.round(supW * 0.45);
    p.line(mastX, supTop, mastX - 2, supTop - 20 - tStep * 3, pal.steelLight, 2);
    p.line(mastX - 8, supTop - 13 - tStep * 2, mastX + 8, supTop - 13 - tStep * 2, pal.steelMid, 2);

    // Forward & Aft Main Naval Gun Batteries!
    if (tier === 1) {
      drawNavalGunTurret(p, supX + supW + 8, fDeckY - 8, 11, 8, 14, 1, 1, pal);
      drawNavalGunTurret(p, hullLeft + 10, qDeckY - 8, 11, 8, 13, -1, 1, pal);
    } else if (tier === 2) {
      // Superfiring B-Turret + Forward A-Turret + Aft X-Turret (Twin 8-inch Cruiser Guns!)
      drawNavalGunTurret(p, supX + supW + 2, fDeckY - 15, 13, 8, 16, 1, 2, pal);
      p.rect(supX + supW + 3, fDeckY - 7, 11, 8, pal.mountDark); // barbette
      drawNavalGunTurret(p, supX + supW + 18, fDeckY - 9, 14, 9, 17, 1, 2, pal);
      drawNavalGunTurret(p, hullLeft + 14, qDeckY - 9, 14, 9, 16, -1, 2, pal);
    } else {
      // Tier 3 Fast Battleship: Massive Superfiring 3-Gun 16-inch Main Turrets (A, B, and Aft X)!
      drawNavalGunTurret(p, supX + supW + 2, fDeckY - 17, 16, 9, 20, 1, 3, pal);
      p.rect(supX + supW + 4, fDeckY - 8, 12, 9, pal.mountDark); // armored barbette
      drawNavalGunTurret(p, supX + supW + 20, fDeckY - 10, 18, 10, 22, 1, 3, pal);
      drawNavalGunTurret(p, hullLeft + 14, qDeckY - 10, 18, 10, 20, -1, 3, pal);
    }
  }

  // Foaming White Kelvin Wake & Curling Clipper Bow Spray
  p.line(hullLeft + 6 + wakeShift, waterlineY + 3, hullLeft + 48 + wakeShift, waterlineY + 3, '#e0f2fe', 3);
  p.line(82 - wakeShift, waterlineY + 5, 124 - wakeShift, waterlineY + 5, '#bae6fd', 2);
  p.line(hullRight - 22, waterlineY + 2, hullRight + 4, waterlineY + 3, '#ffffff', 3);
}

// ============================================================================
// 192x192 REALISTIC MILITARY OFFICER & SPECIALIST BUST PORTRAIT ENGINE
// ============================================================================

export function renderUnitPortraitBuffer(unit: Unit): string[][] {
  const el = unit.weapon?.element ?? 'NONE';
  const pal = getPaletteForUnit(
    unit.classId,
    unit.templateId,
    unit.faction,
    Boolean(unit.isBoss),
    false,
    el
  );
  const tier: UnitTier = unit.tier ?? (unit.promoted ? 2 : 1);
  const domain = resolveSpriteDomain(unit.classId);
  const female = isFemaleStyledUnit(unit.templateId, unit.classId);

  const bgOuter = unit.faction === 'PLAYER' ? '#0b1622' : '#1f0b0f';
  const bgInner = unit.faction === 'PLAYER' ? '#1e3852' : '#4a1820';

  // Smooth 25-band studio portrait vignette backdrop
  const bandColors: string[] = [];
  for (let b = 0; b <= 24; b++) {
    bandColors.push(mixHex(bgInner, bgOuter, Math.pow(b / 24, 1.25)));
  }

  const grid: string[][] = Array.from({ length: PORTRAIT_H }, (_, y) => {
    const dy = (y - 88) / 96;
    const row = new Array<string>(PORTRAIT_W);
    for (let x = 0; x < PORTRAIT_W; x++) {
      const dx = (x - 96) / 96;
      const d = Math.min(1, Math.sqrt(dx * dx + dy * dy));
      row[x] = bandColors[Math.round(d * 24)];
    }
    return row;
  });

  const fg = new PixelCanvas(PORTRAIT_W, PORTRAIT_H);
  const cx = 96;
  const deepSkin = mixHex(pal.skinShade, pal.outline, 0.34);
  const midShadeSkin = mixHex(pal.skinMid, pal.skinShade, 0.5);
  const lipColor = female ? mixHex(pal.skinShade, '#b91c1c', 0.32) : mixHex(pal.skinShade, '#7f1d1d', 0.18);
  const lightEye = mixHex(pal.eyeColor, '#ffffff', 0.45);

  // 1. Back Hair Silhouette (tucked cleanly for military grooming)
  if (female) {
    fg.ellipse(cx - 4, 96, 44, 48, pal.hairDark);
    fg.ellipse(cx - 5, 92, 39, 42, pal.hairMid);
    fg.poly(
      [
        [cx - 46, 86],
        [cx - 30, 86],
        [cx - 36, 148],
        [cx - 50, 144],
      ],
      pal.hairMid
    );
    fg.poly(
      [
        [cx + 28, 86],
        [cx + 42, 86],
        [cx + 46, 144],
        [cx + 32, 146],
      ],
      pal.hairDark
    );
  } else {
    fg.ellipse(cx - 2, 84, 38, 28, pal.hairDark);
  }

  // 2. Realistic Tailored Military Service Tunic, Lapels, Shirt, Tie, Epaulettes & Ribbons
  fg.poly(
    [
      [cx - 84, 191],
      [cx - 68, 146],
      [cx - 26, 130],
      [cx + 26, 130],
      [cx + 68, 146],
      [cx + 84, 191],
    ],
    pal.armorMid
  );
  // Left shadow plane of uniform jacket + pocket flaps + brass buttons
  fg.poly(
    [
      [cx - 84, 191],
      [cx - 68, 146],
      [cx - 26, 130],
      [cx - 12, 191],
    ],
    pal.armorDark
  );
  fg.line(cx + 26, 132, cx + 66, 147, pal.armorLight, 3);
  // Crisp notched uniform lapels + khaki/white shirt collar + dark service tie
  fg.poly(
    [
      [cx - 28, 130],
      [cx - 14, 130],
      [cx, 178],
      [cx - 22, 156],
    ],
    pal.armorDark
  );
  fg.poly(
    [
      [cx + 28, 130],
      [cx + 14, 130],
      [cx, 178],
      [cx + 22, 156],
    ],
    pal.armorLight
  );
  fg.poly(
    [
      [cx - 15, 128],
      [cx + 15, 128],
      [cx, 168],
    ],
    '#e2e8f0'
  );
  fg.poly(
    [
      [cx - 4, 136],
      [cx + 4, 136],
      [cx + 6, 172],
      [cx, 180],
      [cx - 6, 172],
    ],
    '#1e293b'
  );
  // Branch Collar Insignia Tabs
  fg.bevelBox(cx - 32, 136, 13, 9, pal.capeMid, pal.capeLight, pal.capeDark, 1);
  fg.bevelBox(cx + 19, 136, 13, 9, pal.capeMid, pal.capeLight, pal.capeDark, 1);
  fg.rect(cx - 27, 139, 4, 3, pal.goldLight);
  fg.rect(cx + 24, 139, 4, 3, pal.goldLight);

  // Shoulder Epaulette Straps with Rank Stars + Sam Browne Leather Cross-Strap
  fg.poly(
    [
      [cx - 68, 146],
      [cx - 32, 133],
      [cx - 28, 141],
      [cx - 64, 155],
    ],
    pal.armorLight
  );
  fg.poly(
    [
      [cx + 68, 146],
      [cx + 32, 133],
      [cx + 28, 141],
      [cx + 64, 155],
    ],
    pal.armorLight
  );
  for (let s = 0; s < tier; s++) {
    fg.rect(cx - 60 + s * 7, 145 - s * 2, 4, 4, pal.goldLight);
    fg.rect(cx + 56 - s * 7, 145 - s * 2, 4, 4, pal.goldLight);
  }
  // Diagonal leather officer strap
  fg.line(cx + 36, 136, cx - 10, 190, '#451a03', 6);
  fg.line(cx + 35, 136, cx - 11, 190, '#78350f', 2);
  // Service Ribbon Bar & Brass Pocket Button on Left Chest
  fg.bevelBox(cx + 20, 162, 28, 8, '#dc2626', '#fca5a5', '#7f1d1d', 1);
  fg.rect(cx + 29, 163, 9, 6, '#eab308');
  fg.rect(cx + 39, 163, 8, 6, '#0284c7');
  fg.bevelBox(cx + 18, 174, 32, 9, pal.armorMid, pal.armorLight, pal.armorDark, 1);
  fg.ellipse(cx + 34, 178, 2.5, 2.5, pal.goldLight);

  // 3. Anatomically Proportioned Neck & Sculpted 3/4 Human Facial Planes (No Cartoon Bobble Eyes!)
  fg.poly(
    [
      [cx - 15, 108],
      [cx + 15, 108],
      [cx + 17, 134],
      [cx - 17, 134],
    ],
    pal.skinMid
  );
  fg.poly(
    [
      [cx - 15, 108],
      [cx - 3, 108],
      [cx - 5, 134],
      [cx - 17, 134],
    ],
    pal.skinShade
  );
  // Under-chin cast shadow
  fg.poly(
    [
      [cx - 14, 113],
      [cx + 13, 113],
      [cx + 3, 123],
      [cx - 10, 122],
    ],
    deepSkin
  );

  // Sculpted Cranium, Cheekbones & Chiseled Jawline (slightly narrower for female, squarer jaw for male)
  const jawW = female ? 26 : 30;
  fg.ellipse(cx, 72, 35, 30, pal.skinMid);
  fg.poly(
    [
      [cx - 34, 74],
      [cx + 34, 74],
      [cx + jawW, 100],
      [cx + 9, 114],
      [cx - 5, 114],
      [cx - jawW - 2, 100],
    ],
    pal.skinMid
  );
  // Left cheek/temple shadow plane + forehead & cheekbone studio lighting
  fg.poly(
    [
      [cx - 34, 68],
      [cx - 22, 68],
      [cx - 20, 104],
      [cx - jawW - 2, 100],
    ],
    pal.skinShade
  );
  fg.ellipse(cx + 6, 63, 20, 12, pal.skinLight); // forehead highlight
  fg.ellipse(cx + 18, 88, 9, 6, pal.skinLight); // right cheekbone highlight
  fg.ellipse(cx - 14, 89, 7, 5, midShadeSkin); // left cheekbone contour
  // Anatomically placed ear with inner helix shadow
  fg.ellipse(cx - 36, 82, 5.5, 10, pal.skinShade);
  fg.ellipse(cx - 36, 82, 3, 6, deepSkin);

  // Realistic Human Almond Eyes (12x6px, natural iris & eyelid anatomy instead of 15x13 cartoon squares!)
  // Left Eye (slightly narrower in 3/4 turn)
  fg.poly(
    [
      [cx - 22, 77],
      [cx - 11, 75],
      [cx - 8, 78],
      [cx - 11, 81],
      [cx - 21, 80],
    ],
    '#f1f5f9'
  );
  fg.ellipse(cx - 14, 78, 3.6, 3, pal.eyeColor);
  fg.ellipse(cx - 14, 79, 2.4, 1.5, lightEye);
  fg.rect(cx - 15, 77, 2, 3, pal.outline); // pupil
  fg.set(cx - 16, 76, '#ffffff'); // crisp natural catchlight
  fg.line(cx - 22, 76, cx - 8, 76, pal.outline, 2); // upper lash crease
  fg.line(cx - 20, 81, cx - 10, 81, midShadeSkin, 1); // subtle lower lid
  fg.line(cx - 24, 70, cx - 8, 72, pal.hairDark, female ? 2 : 3); // sculpted eyebrow

  // Right Eye
  fg.poly(
    [
      [cx + 8, 78],
      [cx + 12, 75],
      [cx + 23, 76],
      [cx + 21, 80],
      [cx + 11, 81],
    ],
    '#f1f5f9'
  );
  fg.ellipse(cx + 15, 78, 3.8, 3, pal.eyeColor);
  fg.ellipse(cx + 15, 79, 2.5, 1.5, lightEye);
  fg.rect(cx + 15, 77, 2, 3, pal.outline); // pupil
  fg.set(cx + 14, 76, '#ffffff'); // catchlight
  fg.line(cx + 8, 76, cx + 23, 76, pal.outline, 2); // upper lash crease
  fg.line(cx + 10, 81, cx + 21, 81, midShadeSkin, 1); // subtle lower lid
  fg.line(cx + 8, 72, cx + 25, 70, pal.hairDark, female ? 2 : 3); // sculpted eyebrow

  // Realistic 3D Nose Bridge, Side Shadow, Tip & Nostrils
  fg.poly(
    [
      [cx - 1, 75],
      [cx + 3, 75],
      [cx + 4, 92],
      [cx - 3, 92],
    ],
    midShadeSkin
  );
  fg.line(cx + 3, 75, cx + 5, 91, pal.skinLight, 2); // sunlit nose bridge
  fg.ellipse(cx + 4, 91, 3.5, 2.5, pal.skinLight); // nose tip
  fg.line(cx - 2, 93, cx + 7, 93, deepSkin, 2); // nose base shadow
  fg.set(cx, 92, pal.outline); // left nostril
  fg.set(cx + 5, 92, pal.outline); // right nostril

  // Natural Lips, Philtrum & Chin Highlight
  fg.line(cx + 2, 95, cx + 2, 98, midShadeSkin, 2); // philtrum
  fg.poly(
    [
      [cx - 7, 101],
      [cx - 1, 99],
      [cx + 3, 100],
      [cx + 6, 99],
      [cx + 11, 101],
      [cx + 2, 102],
    ],
    lipColor
  );
  fg.line(cx - 6, 102, cx + 10, 102, deepSkin, 1); // mouth parting line
  fg.line(cx - 4, 104, cx + 8, 104, mixHex(pal.skinMid, lipColor, 0.45), 2); // lower lip
  fg.line(cx - 2, 106, cx + 6, 106, deepSkin, 1); // mentolabial crease
  fg.ellipse(cx + 3, 110, 5, 2.5, pal.skinLight); // chin highlight

  // Natural Hairline & Temple Strands under Headgear
  fg.ellipse(cx, 52, 36, 14, pal.hairMid);
  fg.poly([[cx - 35, 54], [cx - 26, 54], [cx - 32, 74]], pal.hairDark);
  fg.poly([[cx + 26, 54], [cx + 34, 54], [cx + 31, 72]], pal.hairDark);
  if (female) {
    fg.poly([[cx - 20, 52], [cx - 4, 52], [cx - 14, 67]], pal.hairLight);
  }

  // 4. Domain-Authentic Realistic Military Headgear!
  if (domain === 'NAVAL') {
    // Crisp White Naval Officer Combination Visor Cap with Gold Chin Cord & Fouled Anchor Crest
    fg.poly(
      [
        [cx - 46, 40],
        [cx - 36, 22],
        [cx + 36, 22],
        [cx + 48, 38],
        [cx + 36, 46],
        [cx - 36, 46],
      ],
      '#f8fafc'
    );
    fg.line(cx - 34, 24, cx + 34, 24, '#ffffff', 3);
    fg.bevelBox(cx - 37, 43, 74, 10, '#0f172a', '#334155', '#020617', 1);
    fg.line(cx - 35, 48, cx + 35, 48, pal.goldLight, 2);
    // Glossy black patent-leather visor brim
    fg.poly(
      [
        [cx - 35, 53],
        [cx + 37, 53],
        [cx + 30, 61],
        [cx - 26, 61],
      ],
      '#09090b'
    );
    fg.line(cx - 28, 55, cx + 28, 55, '#475569', 1);
    fg.ellipse(cx + 2, 38, 7, 7, pal.goldMid);
    fg.ellipse(cx + 2, 38, 4, 4, pal.goldLight);
  } else if (domain === 'AIRCRAFT') {
    // Tier 1/2 Leather Aviator Cap & Goggles vs Tier 3/4 HGU-55 Flight Helmet with Smoked Visor & Boom Mic!
    if (tier >= 3) {
      fg.ellipse(cx, 48, 42, 28, '#cbd5e1');
      fg.ellipse(cx + 2, 44, 37, 22, '#f1f5f9');
      // Raised dark polycarbonate sun-visor housing + side comms earcups + boom mic
      fg.poly(
        [
          [cx - 34, 36],
          [cx + 36, 36],
          [cx + 32, 54],
          [cx - 30, 54],
        ],
        '#0f172a'
      );
      fg.line(cx - 26, 40, cx + 28, 40, '#38bdf8', 2);
      fg.ellipse(cx - 38, 78, 6, 12, '#1e293b');
      fg.line(cx - 36, 86, cx - 4, 102, '#334155', 2);
      fg.ellipse(cx - 3, 102, 3.5, 2.5, '#09090b');
    } else {
      fg.ellipse(cx, 48, 41, 26, '#451a03');
      fg.ellipse(cx + 2, 44, 36, 21, '#78350f');
      fg.rect(cx - 41, 52, 9, 38, '#451a03');
      fg.rect(cx + 32, 52, 8, 34, '#451a03');
      // Split angled brass/glass aviator goggles strapped on forehead
      fg.bevelBox(cx - 29, 41, 25, 13, '#0284c7', '#7dd3fc', '#1e293b', 2);
      fg.bevelBox(cx + 5, 41, 25, 13, '#0284c7', '#7dd3fc', '#1e293b', 2);
      fg.line(cx - 4, 47, cx + 5, 47, pal.goldMid, 3);
    }
  } else if (domain === 'ARMOR') {
    // Ribbed CVC Tanker Helmet with Dust Goggles & Throat/Boom Comms Headset
    fg.ellipse(cx, 46, 42, 26, '#27272a');
    fg.ellipse(cx + 2, 42, 37, 21, '#3f3f46');
    for (let rx = -24; rx <= 24; rx += 12) {
      fg.litCapsule(cx + rx, 24, cx + rx, 48, 3.5, 3.5, '#18181b', '#52525b', '#71717a');
    }
    fg.ellipse(cx - 39, 78, 7, 13, '#18181b');
    fg.ellipse(cx + 37, 78, 6, 12, '#18181b');
    fg.bevelBox(cx - 28, 43, 25, 12, '#ca8a04', '#fef08a', '#422006', 2);
    fg.bevelBox(cx + 5, 43, 25, 12, '#ca8a04', '#fef08a', '#422006', 2);
  } else if (isCommanderClass(unit.classId) || unit.isBoss) {
    // High-Crown Military Officer Peaked Visor Cap with Gold Oak-Leaf Wreath & Cockade
    fg.poly(
      [
        [cx - 48, 38],
        [cx - 38, 20],
        [cx + 38, 20],
        [cx + 50, 36],
        [cx + 38, 45],
        [cx - 38, 45],
      ],
      pal.armorMid
    );
    fg.line(cx - 36, 22, cx + 36, 22, pal.armorLight, 3);
    fg.bevelBox(cx - 38, 43, 76, 10, pal.capeDark, pal.capeMid, '#09090b', 1);
    fg.line(cx - 36, 49, cx + 36, 49, pal.goldLight, 2);
    fg.poly(
      [
        [cx - 36, 53],
        [cx + 38, 53],
        [cx + 31, 61],
        [cx - 27, 61],
      ],
      '#09090b'
    );
    fg.ellipse(cx + 2, 36, 8, 7, pal.goldMid);
    fg.ellipse(cx + 2, 36, 3.5, 3.5, pal.capeMid);
  } else if (isMedicClass(unit.classId)) {
    // Olive Drab Combat Medic M1 Steel Pot Helmet with Crisp White Panel & Geneva Red Cross
    fg.ellipse(cx, 46, 44, 25, pal.armorDark);
    fg.ellipse(cx, 43, 40, 21, pal.armorMid);
    fg.line(cx - 45, 53, cx + 45, 53, pal.armorDark, 5);
    fg.ellipse(cx + 2, 38, 12, 11, '#f8fafc');
    fg.rect(cx - 1, 30, 6, 16, '#dc2626');
    fg.rect(cx - 6, 35, 16, 6, '#dc2626');
    fg.line(cx - 34, 55, cx - 28, 104, '#44403c', 2); // canvas chinstrap
  } else {
    // Combat Steel / Kevlar Infantry Helmet with Camo Band, Rim Shadow & Chinstrap
    fg.ellipse(cx, 46, 44, 25, pal.armorDark);
    fg.ellipse(cx + 1, 43, 40, 21, pal.armorMid);
    fg.ellipse(cx + 6, 35, 24, 10, pal.armorLight);
    fg.line(cx - 46, 53, cx + 46, 53, pal.armorDark, 5);
    fg.line(cx - 42, 47, cx + 42, 47, '#3f3f46', 3); // rubber/webbing helmet band
    fg.line(cx - 34, 55, cx - 28, 104, '#292524', 2); // leather/webbing chinstrap
    if (tier >= 3) {
      // NVG shroud mount bracket on modern Kevlar/FAST helmet
      fg.bevelBox(cx - 6, 34, 14, 12, pal.steelMid, pal.steelLight, pal.steelDark, 1);
    }
  }

  fg.addSelectiveOutline(pal.outline, 2);

  const hexTable = fg.colorHex;
  for (let y = 0; y < PORTRAIT_H; y++) {
    const off = y * PORTRAIT_W;
    const row = grid[y];
    for (let x = 0; x < PORTRAIT_W; x++) {
      const idx = fg.data[off + x];
      if (idx !== 0) row[x] = hexTable[idx];
    }
  }
  return grid;
}

// ============================================================================
// PURE RASTERIZER & FAST IMAGE-DATA SPRITE SHEET / PORTRAIT CACHE
// ============================================================================

function buildUnitPixelCanvas(
  unit: Unit,
  pal?: CharacterPalette,
  frame: SpriteAnimFrame = 0,
  animState: SpriteAnimState = 'idle'
): PixelCanvas {
  const el = unit.weapon?.element ?? 'NONE';
  const resolvedPal =
    pal ??
    getPaletteForUnit(
      unit.classId,
      unit.templateId,
      unit.faction,
      Boolean(unit.isBoss),
      unit.acted,
      el
    );
  const p = new PixelCanvas(SPRITE_W, SPRITE_H);
  const tier: UnitTier = unit.tier ?? (unit.promoted ? 2 : 1);
  const wType: WeaponType = unit.weapon?.type ?? 'SWORD';
  const domain = resolveSpriteDomain(unit.classId);

  if (domain === 'AIRCRAFT') {
    drawAircraftUnit(p, resolvedPal, unit.classId, tier, frame, animState);
  } else if (domain === 'NAVAL') {
    drawNavalUnit(p, resolvedPal, unit.classId, tier, frame);
  } else if (domain === 'ARMOR') {
    drawArmorUnit(p, resolvedPal, unit.classId, Boolean(unit.isBoss), tier, frame, animState);
  } else if (domain === 'ARTILLERY') {
    drawArtilleryUnit(p, resolvedPal, unit.classId, tier, frame, animState);
  } else {
    drawInfantryUnit(p, resolvedPal, unit.classId, wType, Boolean(unit.isBoss), tier, frame, animState);
  }

  p.addSelectiveOutline(resolvedPal.outline, 2);
  return p;
}

export function renderUnitFrameBuffer(
  unit: Unit,
  pal?: CharacterPalette,
  frame: SpriteAnimFrame = 0,
  animState: SpriteAnimState = 'idle'
): (string | null)[][] {
  return buildUnitPixelCanvas(unit, pal, frame, animState).toNullableGrid();
}

export function measureSpriteSilhouette(unit: Unit): {
  filledPixels: number;
  bboxWidth: number;
  bboxHeight: number;
  uniqueColors: number;
} {
  const pc = buildUnitPixelCanvas(unit, undefined, 0, 'idle');
  let filledPixels = 0;
  let minX = SPRITE_W;
  let maxX = -1;
  let minY = SPRITE_H;
  let maxY = -1;
  const seenIdx = new Uint8Array(pc.colorHex.length);
  let uniqueColors = 0;

  for (let y = 0; y < SPRITE_H; y++) {
    const off = y * SPRITE_W;
    for (let x = 0; x < SPRITE_W; x++) {
      const idx = pc.data[off + x];
      if (idx === 0) continue;
      filledPixels++;
      if (!seenIdx[idx]) {
        seenIdx[idx] = 1;
        uniqueColors++;
      }
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  return {
    filledPixels,
    bboxWidth: maxX >= minX ? maxX - minX + 1 : 0,
    bboxHeight: maxY >= minY ? maxY - minY + 1 : 0,
    uniqueColors,
  };
}

const spriteSheetCache = new Map<string, UnitSpriteSheet>();
const spriteCache = new Map<string, HTMLCanvasElement>();
const previewUrlCache = new Map<string, string>();
const portraitUrlCache = new Map<string, string>();

export function getUnitSpriteSheet(unit: Unit, flashWhite = false): UnitSpriteSheet {
  const el = unit.weapon?.element ?? 'NONE';
  const wType = unit.weapon?.type ?? 'SWORD';
  const tier: UnitTier = unit.tier ?? (unit.promoted ? 2 : 1);
  const key = `ww192hd2_${unit.classId}_${unit.templateId}_${unit.faction}_${wType}_${el}_${tier}_${
    unit.isBoss ? 1 : 0
  }_${unit.acted ? 1 : 0}_${flashWhite ? 1 : 0}`;

  const existing = spriteSheetCache.get(key);
  if (existing) return existing;

  const sheetW = SPRITE_W * SPRITE_SHEET_COLS;
  const sheetH = SPRITE_H * SPRITE_SHEET_ROWS;
  const canvas = document.createElement('canvas');
  canvas.width = sheetW;
  canvas.height = sheetH;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const rowStates: SpriteAnimState[] = ['idle', 'selected', 'walk'];
  for (let row = 0; row < SPRITE_SHEET_ROWS; row++) {
    const animState = rowStates[row];
    const oy = row * SPRITE_H;
    for (let col = 0; col < SPRITE_SHEET_COLS; col++) {
      const ox = col * SPRITE_W;
      const cellCanvas = getUnitSpriteCanvas(unit, col as SpriteAnimFrame, flashWhite, animState);
      ctx.drawImage(cellCanvas, ox, oy);
    }
  }

  const sheet: UnitSpriteSheet = {
    canvas,
    frameWidth: SPRITE_W,
    frameHeight: SPRITE_H,
    cols: SPRITE_SHEET_COLS,
    rows: SPRITE_SHEET_ROWS,
  };
  spriteSheetCache.set(key, sheet);
  return sheet;
}

export function getUnitSpriteCanvas(
  unit: Unit,
  frame: 0 | 1 | 2 | 3,
  flashWhite = false,
  animState: SpriteAnimState = 'idle'
): HTMLCanvasElement {
  const el = unit.weapon?.element ?? 'NONE';
  const wType = unit.weapon?.type ?? 'SWORD';
  const tier: UnitTier = unit.tier ?? (unit.promoted ? 2 : 1);
  const key = `wwc192hd2_${unit.classId}_${unit.templateId}_${unit.faction}_${wType}_${el}_${tier}_${
    unit.isBoss ? 1 : 0
  }_${unit.acted ? 1 : 0}_${animState}_${frame}_${flashWhite ? 1 : 0}`;

  const existing = spriteCache.get(key);
  if (existing) return existing;

  if (spriteCache.size > 640) {
    spriteCache.clear();
  }

  const pal = getPaletteForUnit(
    unit.classId,
    unit.templateId,
    unit.faction,
    Boolean(unit.isBoss),
    unit.acted,
    el
  );

  const canvas = document.createElement('canvas');
  canvas.width = SPRITE_W;
  canvas.height = SPRITE_H;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (unit.acted && !flashWhite) {
    ctx.filter = 'saturate(0.42) brightness(0.78)';
  }
  drawRealisticUnitCanvas(ctx, unit, pal, frame, animState);
  ctx.filter = 'none';

  if (flashWhite) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, SPRITE_W, SPRITE_H);
    ctx.restore();
  }

  spriteCache.set(key, canvas);
  return canvas;
}

export function getUnitSpriteDataUrl(unit: Unit, frame: 0 | 1 = 0): string {
  if (typeof document === 'undefined') return '';
  const el = unit.weapon?.element ?? 'NONE';
  const tier: UnitTier = unit.tier ?? (unit.promoted ? 2 : 1);
  const key = `wwurl192hd2_${unit.classId}_${unit.templateId}_${unit.faction}_${unit.weapon?.type}_${el}_${tier}_${
    unit.isBoss ? 1 : 0
  }_${frame}`;
  const existing = previewUrlCache.get(key);
  if (existing) return existing;
  const c = getUnitSpriteCanvas({ ...unit, acted: false }, frame, false, 'idle');
  const url = c.toDataURL('image/png');
  previewUrlCache.set(key, url);
  return url;
}

export function getUnitPortraitDataUrl(unit: Unit): string {
  if (typeof document === 'undefined') return '';
  const el = unit.weapon?.element ?? 'NONE';
  const tier: UnitTier = unit.tier ?? (unit.promoted ? 2 : 1);
  const key = `wwport192hd2_${unit.classId}_${unit.templateId}_${unit.faction}_${el}_${tier}_${
    unit.isBoss ? 1 : 0
  }`;
  const existing = portraitUrlCache.get(key);
  if (existing) return existing;

  const pal = getPaletteForUnit(
    unit.classId,
    unit.templateId,
    unit.faction,
    Boolean(unit.isBoss),
    false,
    el
  );

  const canvas = document.createElement('canvas');
  canvas.width = PORTRAIT_W;
  canvas.height = PORTRAIT_H;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  drawRealisticPortraitCanvas(ctx, unit, pal);

  const url = canvas.toDataURL('image/png');
  portraitUrlCache.set(key, url);
  return url;
}
