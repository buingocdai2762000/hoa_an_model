import type { Faction, MagicElement, Unit, UnitClassId, UnitTier, WeaponType } from './types';

// ============================================================================
// ARCHETYPE CLASSIFIERS FOR ALL 121 CLASSES (30 PLAYABLE LINEAGES + BOSS)
// ============================================================================

function isPegasusClass(c: UnitClassId): boolean {
  return c === 'PEGASUS' || c === 'FALCON_KNIGHT' || c === 'SERAPH_KNIGHT' || c === 'CELESTIAL_VALKYRIE';
}

function isWyvernClass(c: UnitClassId): boolean {
  return c === 'WYVERN_RIDER' || c === 'WYVERN_LORD' || c === 'DRAGONLORD' || c === 'SKY_SOVEREIGN';
}

function isGriffinClass(c: UnitClassId): boolean {
  return c === 'GRIFFIN_RIDER' || c === 'GRIFFIN_LORD' || c === 'SUN_GRIFFIN' || c === 'SOLAR_APEX_KNIGHT';
}

function isHorseClass(c: UnitClassId): boolean {
  return (
    c === 'CAVALIER' || c === 'PALADIN' || c === 'SILVER_KNIGHT' || c === 'ASTRAL_CAVALIER' ||
    c === 'NOMAD' || c === 'NOMAD_TROOPER' || c === 'BOW_KNIGHT' || c === 'TEMPEST_KHAN' ||
    c === 'TROUBADOUR' || c === 'VALKYRIE' || c === 'SERAPH_RIDER' || c === 'CELESTIAL_EMPRESS' ||
    c === 'OUTRIDER' || c === 'RANGER_KNIGHT' || c === 'HORIZON_LANCER' || c === 'STORM_STRIDER' ||
    c === 'DARK_KNIGHT' || c === 'DOOM_RIDER' || c === 'DEATH_KNIGHT' || c === 'ABYSS_SOVEREIGN'
  );
}

function isMountedClass(c: UnitClassId): boolean {
  return isHorseClass(c) || isPegasusClass(c) || isWyvernClass(c) || isGriffinClass(c);
}

function isHeavyArmorClass(c: UnitClassId): boolean {
  return (
    c === 'KNIGHT' || c === 'GENERAL' || c === 'MARSHAL' || c === 'TITAN_CITADEL' ||
    c === 'TEMPLAR' || c === 'AEGIS_GUARD' || c === 'HOLY_BASTION' || c === 'DIVINE_WARDEN' ||
    c === 'DARK_GENERAL'
  );
}

function isSamuraiClass(c: UnitClassId): boolean {
  return c === 'SAMURAI' || c === 'RONIN_MASTER' || c === 'SHOGUN_BLADE' || c === 'HEAVEN_KENSEI';
}

function isNinjaClass(c: UnitClassId): boolean {
  return c === 'NINJA' || c === 'MASTER_NINJA' || c === 'SHADOW_KAGE' || c === 'PHANTOM_SHOGUN';
}

function isPirateClass(c: UnitClassId): boolean {
  return c === 'PIRATE' || c === 'CORSAIR' || c === 'DREAD_CAPTAIN' || c === 'OCEAN_LEVIATHAN';
}

function isBrawlerClass(c: UnitClassId): boolean {
  return c === 'BRAWLER' || c === 'WAR_MONK' || c === 'IRON_FIST_MASTER' || c === 'TITAN_DEMIGOD';
}

function isDragoonClass(c: UnitClassId): boolean {
  return c === 'DRAGOON' || c === 'WYRM_SLAYER' || c === 'DRAGON_KNIGHT' || c === 'ETERNAL_DRAGOON';
}

function isChronoClass(c: UnitClassId): boolean {
  return c === 'CHRONOMANCER' || c === 'ASTROLOGER' || c === 'TIME_WEAVER' || c === 'ETERNAL_CHRONOS';
}

function isShamanClass(c: UnitClassId): boolean {
  return c === 'SHAMAN' || c === 'SPIRIT_CALLER' || c === 'ELDER_ORACLE' || c === 'PRIMORDIAL_AVATAR';
}

function isWarClericClass(c: UnitClassId): boolean {
  return c === 'WAR_CLERIC' || c === 'BATTLE_PRIEST' || c === 'CRUSADER_BISHOP' || c === 'WRATHFUL_SERAPH';
}

function isHelmClass(c: UnitClassId): boolean {
  return (
    isHeavyArmorClass(c) ||
    isDragoonClass(c) ||
    c === 'BERSERKER' || c === 'REAVER' || c === 'WAR_GOD' ||
    c === 'SENTINEL' || c === 'SPEAR_EMPEROR' ||
    c === 'DOOM_RIDER' || c === 'DEATH_KNIGHT' || c === 'ABYSS_SOVEREIGN'
  );
}

function isLightClericClass(c: UnitClassId): boolean {
  return (
    c === 'CLERIC' || c === 'BISHOP' || c === 'SAINT' || c === 'SERAPH_PROPHET' ||
    c === 'MONK' || c === 'EXORCIST' || c === 'INQUISITOR' || c === 'SOLAR_HIEROPHANT' ||
    isWarClericClass(c) ||
    c === 'TROUBADOUR' || c === 'VALKYRIE' || c === 'SERAPH_RIDER' || c === 'CELESTIAL_EMPRESS'
  );
}

function isDarkCasterClass(c: UnitClassId): boolean {
  return (
    c === 'DARK_MAGE' || c === 'NECROMANCER' || c === 'DARK_DRUID' || c === 'ABYSSAL_ARCHON' ||
    c === 'DARK_KNIGHT' || c === 'DOOM_RIDER' || c === 'DEATH_KNIGHT' || c === 'ABYSS_SOVEREIGN' ||
    isShamanClass(c)
  );
}

function isRobeClass(c: UnitClassId): boolean {
  return (
    c === 'MAGE' || c === 'SAGE' || c === 'ARCHSAGE' || c === 'ASTRAL_ORACLE' ||
    isChronoClass(c) ||
    isLightClericClass(c) ||
    isDarkCasterClass(c)
  );
}

function isHoodClass(c: UnitClassId): boolean {
  return (
    c === 'THIEF' || c === 'ASSASSIN' || c === 'WHISPER' || c === 'PHANTOM_REAPER' ||
    isNinjaClass(c) ||
    isShamanClass(c) ||
    c === 'DARK_MAGE' || c === 'NECROMANCER' || c === 'DARK_DRUID' || c === 'ABYSSAL_ARCHON'
  );
}

function isKatanaClass(c: UnitClassId): boolean {
  return (
    c === 'MYRMIDON' || c === 'SWORDMASTER' || c === 'TRUEBLADE' || c === 'SWORD_SAINT' ||
    isSamuraiClass(c) ||
    c === 'MORTAL_SAVANT' || c === 'RUNE_BLADE' || c === 'AETHER_SOVEREIGN'
  );
}

function isDaggerClass(c: UnitClassId): boolean {
  return (
    c === 'THIEF' || c === 'ASSASSIN' || c === 'WHISPER' || c === 'PHANTOM_REAPER' ||
    isNinjaClass(c)
  );
}

function isShieldClass(c: UnitClassId, tier: UnitTier): boolean {
  if (isHeavyArmorClass(c)) return true;
  if (
    c === 'CAVALIER' || c === 'PALADIN' || c === 'SILVER_KNIGHT' || c === 'ASTRAL_CAVALIER' ||
    c === 'SOLDIER' || c === 'HALBERDIER' || c === 'SENTINEL' || c === 'SPEAR_EMPEROR'
  ) {
    return tier >= 2 || c === 'CAVALIER';
  }
  if (
    c === 'LORD' || c === 'GREAT_LORD' || c === 'SOVEREIGN' || c === 'EMPEROR_LORD' ||
    c === 'MERCENARY' || c === 'HERO' || c === 'VANGUARD' || c === 'LEGEND_CHAMPION'
  ) {
    return tier >= 2;
  }
  return false;
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
  return (
    isPegasusClass(classId) ||
    classId === 'CLERIC' || classId === 'BISHOP' || classId === 'SAINT' || classId === 'SERAPH_PROPHET' ||
    classId === 'TROUBADOUR' || classId === 'VALKYRIE' || classId === 'SERAPH_RIDER' || classId === 'CELESTIAL_EMPRESS' ||
    isWarClericClass(classId)
  );
}

function getTier4WingStyle(c: UnitClassId): 'SERAPH' | 'DRACONIC' | 'ASTRAL' {
  if (
    c === 'EMPEROR_LORD' || c === 'SERAPH_PROPHET' || c === 'SOLAR_HIEROPHANT' ||
    c === 'CELESTIAL_VALKYRIE' || c === 'CELESTIAL_EMPRESS' || c === 'DIVINE_WARDEN' ||
    c === 'WRATHFUL_SERAPH' || c === 'SOLAR_APEX_KNIGHT' || c === 'TITAN_CITADEL' ||
    c === 'ASTRAL_CAVALIER'
  ) {
    return 'SERAPH';
  }
  if (
    c === 'SKY_SOVEREIGN' || c === 'WAR_GOD' || c === 'ABYSSAL_ARCHON' ||
    c === 'ABYSS_SOVEREIGN' || c === 'PHANTOM_REAPER' || c === 'PHANTOM_SHOGUN' ||
    c === 'OCEAN_LEVIATHAN' || c === 'TITAN_DEMIGOD' || c === 'ETERNAL_DRAGOON' ||
    c === 'PRIMORDIAL_AVATAR' || c === 'DARK_GENERAL'
  ) {
    return 'DRACONIC';
  }
  return 'ASTRAL';
}

// ============================================================================
// 64x72 HIGH-DENSITY 32-BIT HD-2D SPRITE ENGINE + 48x48 BUST PORTRAIT ENGINE
// ============================================================================

export const SPRITE_W = 64;
export const SPRITE_H = 72;
export const SPRITE_SHEET_COLS = 4;
export const SPRITE_SHEET_ROWS = 3;

export const PORTRAIT_W = 96;
export const PORTRAIT_H = 96;

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
// COLOR SCIENCE HELPERS (HUE-SHIFTED OUTLINES & TWILIGHT ACTED DESATURATION)
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
    [clamp(r), clamp(g), clamp(b)]
      .map((c) => c.toString(16).padStart(2, '0'))
      .join('')
  );
}

function mixHex(hexA: string, hexB: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

function desaturateToTwilight(hex: string, amount = 0.54): string {
  const [r, g, b] = hexToRgb(hex);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  // Cool twilight slate tint so acted units look dimmed/rested yet retain readable skin, hair & armor!
  const slateR = lum * 0.72 + 18;
  const slateG = lum * 0.76 + 24;
  const slateB = lum * 0.86 + 38;
  return rgbToHex(
    r + (slateR - r) * amount,
    g + (slateG - g) * amount,
    b + (slateB - b) * amount
  );
}

function getMagicGlowColor(el: MagicElement | undefined, faction: Faction): string {
  switch (el) {
    case 'FIRE':
      return '#fb923c';
    case 'THUNDER':
      return '#fde047';
    case 'WIND':
      return '#4ade80';
    case 'ICE':
      return '#67e8f9';
    case 'LIGHT':
      return '#fef08a';
    case 'DARK':
      return '#d946ef';
    default:
      return faction === 'ENEMY' ? '#fb7185' : '#38bdf8';
  }
}

export function getPaletteForUnit(
  classId: UnitClassId,
  templateId: string,
  faction: Faction,
  isBoss: boolean,
  acted: boolean,
  element?: MagicElement
): CharacterPalette {
  const glow = getMagicGlowColor(element, faction);
  let pal: CharacterPalette;

  if (faction === 'PLAYER') {
    const base: CharacterPalette = {
      outline: '#0d1322',
      crease: '#172036',
      hairLight: '#60a5fa',
      hairMid: '#2563eb',
      hairDark: '#1e3a8a',
      skinLight: '#fff0de',
      skinMid: '#f6cca2',
      skinShade: '#cf9066',
      armorLight: '#e0f2fe',
      armorMid: '#2563eb',
      armorDark: '#172554',
      capeLight: '#fb7185',
      capeMid: '#dc2626',
      capeDark: '#7f1d1d',
      goldLight: '#fef08a',
      goldMid: '#eab308',
      goldDark: '#92400e',
      steelLight: '#f8fafc',
      steelMid: '#cbd5e1',
      steelDark: '#475569',
      eyeColor: '#1d4ed8',
      mountLight: '#f8fafc',
      mountMid: '#cbd5e1',
      mountDark: '#64748b',
      magicGlow: glow,
      auraLight: '#fef08a',
      auraMid: '#38bdf8',
    };

    switch (templateId) {
      case 'kaelen':
        pal = { ...base };
        break;
      case 'lyra':
        pal = {
          ...base,
          hairLight: '#5eead4', hairMid: '#0d9488', hairDark: '#115e59',
          armorLight: '#ccfbf1', armorMid: '#0f766e', armorDark: '#134e4a',
          capeLight: '#93c5fd', capeMid: '#2563eb', capeDark: '#1e3a8a',
          mountLight: '#fef3c7', mountMid: '#d97706', mountDark: '#78350f',
          eyeColor: '#0f766e',
        };
        break;
      case 'soren':
        pal = {
          ...base,
          hairLight: '#a7f3d0', hairMid: '#10b981', hairDark: '#065f46',
          armorLight: '#d1fae5', armorMid: '#047857', armorDark: '#064e3b',
          capeLight: '#fde047', capeMid: '#ca8a04', capeDark: '#713f12',
          eyeColor: '#059669',
          auraMid: '#34d399',
        };
        break;
      case 'rowan':
        pal = {
          ...base,
          hairLight: '#fbbf24', hairMid: '#b45309', hairDark: '#451a03',
          armorLight: '#d9f99d', armorMid: '#4d7c0f', armorDark: '#1a2e05',
          capeLight: '#fcd34d', capeMid: '#b45309', capeDark: '#78350f',
          eyeColor: '#3f6212',
        };
        break;
      case 'elara':
        pal = {
          ...base,
          hairLight: '#fef9c3', hairMid: '#eab308', hairDark: '#a16207',
          armorLight: '#ffffff', armorMid: '#fde68a', armorDark: '#b45309',
          capeLight: '#7dd3fc', capeMid: '#0284c7', capeDark: '#075985',
          eyeColor: '#0284c7',
        };
        break;
      case 'veyra':
        pal = {
          ...base,
          hairLight: '#6ee7b7', hairMid: '#059669', hairDark: '#064e3b',
          armorLight: '#e2e8f0', armorMid: '#334155', armorDark: '#0f172a',
          capeLight: '#fb7185', capeMid: '#e11d48', capeDark: '#881337',
          mountLight: '#34d399', mountMid: '#047857', mountDark: '#064e3b',
          eyeColor: '#e11d48',
          auraMid: '#10b981',
        };
        break;
      case 'zephyr':
      case 'kage':
        pal = {
          ...base,
          hairLight: '#e0e7ff', hairMid: '#6366f1', hairDark: '#312e81',
          armorLight: '#818cf8', armorMid: '#312e81', armorDark: '#1e1b4b',
          capeLight: '#fb7185', capeMid: '#be123c', capeDark: '#4c0519',
          eyeColor: '#f43f5e',
          auraMid: '#818cf8',
        };
        break;
      case 'borin':
      case 'valen':
        pal = {
          ...base,
          hairLight: '#f1f5f9', hairMid: '#94a3b8', hairDark: '#334155',
          armorLight: '#f8fafc', armorMid: '#64748b', armorDark: '#1e293b',
          capeLight: '#60a5fa', capeMid: '#1d4ed8', capeDark: '#1e3a8a',
          eyeColor: '#0284c7',
        };
        break;
      case 'mira':
      case 'celeste':
        pal = {
          ...base,
          hairLight: '#fce7f3', hairMid: '#ec4899', hairDark: '#9d174d',
          armorLight: '#ffffff', armorMid: '#38bdf8', armorDark: '#0369a1',
          capeLight: '#bae6fd', capeMid: '#0284c7', capeDark: '#0c4a6e',
          mountLight: '#ffffff', mountMid: '#e2e8f0', mountDark: '#94a3b8',
          eyeColor: '#db2777',
        };
        break;
      case 'kain':
      case 'kenji':
        pal = {
          ...base,
          hairLight: '#fecaca', hairMid: '#dc2626', hairDark: '#7f1d1d',
          armorLight: '#ffe4e6', armorMid: '#be123c', armorDark: '#4c0519',
          capeLight: '#f1f5f9', capeMid: '#475569', capeDark: '#1e293b',
          eyeColor: '#b91c1c',
          auraMid: '#fb7185',
        };
        break;
      case 'tormund':
      case 'brutus':
      case 'drake':
        pal = {
          ...base,
          hairLight: '#fed7aa', hairMid: '#ea580c', hairDark: '#7c2d12',
          armorLight: '#ffedd5', armorMid: '#c2410c', armorDark: '#431407',
          capeLight: '#fde68a', capeMid: '#b45309', capeDark: '#451a03',
          eyeColor: '#b45309',
        };
        break;
      case 'morgath':
      case 'orion':
      case 'malrik':
        pal = {
          ...base,
          hairLight: '#f3e8ff', hairMid: '#9333ea', hairDark: '#581c87',
          armorLight: '#d8b4fe', armorMid: '#6b21a8', armorDark: '#2e1065',
          capeLight: '#f472b6', capeMid: '#9d174d', capeDark: '#500724',
          mountLight: '#64748b', mountMid: '#312e81', mountDark: '#0f0e24',
          eyeColor: '#c084fc',
          auraMid: '#c084fc',
        };
        break;
      case 'sylvara':
        pal = {
          ...base,
          hairLight: '#fbcfe8', hairMid: '#ec4899', hairDark: '#831843',
          armorLight: '#fce7f3', armorMid: '#db2777', armorDark: '#831843',
          capeLight: '#67e8f9', capeMid: '#0284c7', capeDark: '#0c4a6e',
          eyeColor: '#0891b2',
          auraMid: '#f472b6',
        };
        break;
      case 'aurelia':
        pal = {
          ...base,
          hairLight: '#fef08a', hairMid: '#f59e0b', hairDark: '#92400e',
          armorLight: '#fef9c3', armorMid: '#d97706', armorDark: '#78350f',
          capeLight: '#ffffff', capeMid: '#cbd5e1', capeDark: '#475569',
          mountLight: '#fef08a', mountMid: '#d97706', mountDark: '#78350f',
          eyeColor: '#d97706',
        };
        break;
      case 'astraea':
        pal = {
          ...base,
          hairLight: '#cffafe', hairMid: '#06b6d4', hairDark: '#155e75',
          armorLight: '#ecfeff', armorMid: '#0891b2', armorDark: '#164e63',
          capeLight: '#fde047', capeMid: '#9333ea', capeDark: '#4c1d95',
          eyeColor: '#06b6d4',
          auraMid: '#22d3ee',
        };
        break;
      default:
        if (isSamuraiClass(classId)) {
          pal = {
            ...base,
            hairLight: '#e2e8f0', hairMid: '#334155', hairDark: '#0f172a',
            armorLight: '#fecdd3', armorMid: '#be123c', armorDark: '#4c0519',
            capeLight: '#fef08a', capeMid: '#ca8a04', capeDark: '#713f12',
          };
        } else if (isGriffinClass(classId)) {
          pal = {
            ...base,
            armorLight: '#fef3c7', armorMid: '#d97706', armorDark: '#78350f',
            mountLight: '#fde68a', mountMid: '#d97706', mountDark: '#78350f',
          };
        } else if (isDarkCasterClass(classId)) {
          pal = {
            ...base,
            hairLight: '#e9d5ff', hairMid: '#7e22ce', hairDark: '#3b0764',
            armorLight: '#c084fc', armorMid: '#581c87', armorDark: '#2e1065',
            capeLight: '#f472b6', capeMid: '#9d174d', capeDark: '#500724',
            mountLight: '#475569', mountMid: '#1e1b4b', mountDark: '#09091a',
            auraMid: '#c084fc',
          };
        } else if (isLightClericClass(classId)) {
          pal = {
            ...base,
            hairLight: '#fef9c3', hairMid: '#eab308', hairDark: '#854d0e',
            armorLight: '#ffffff', armorMid: '#fde68a', armorDark: '#b45309',
            capeLight: '#7dd3fc', capeMid: '#0284c7', capeDark: '#075985',
          };
        } else if (isChronoClass(classId)) {
          pal = {
            ...base,
            hairLight: '#bae6fd', hairMid: '#0284c7', hairDark: '#0c4a6e',
            armorLight: '#ecfeff', armorMid: '#0891b2', armorDark: '#164e63',
            capeLight: '#d8b4fe', capeMid: '#7c3aed', capeDark: '#3b0764',
            auraMid: '#22d3ee',
          };
        } else if (isPirateClass(classId)) {
          pal = {
            ...base,
            hairLight: '#fdba74', hairMid: '#c2410c', hairDark: '#431407',
            armorLight: '#99f6e4', armorMid: '#0f766e', armorDark: '#134e4a',
            capeLight: '#fca5a5', capeMid: '#b91c1c', capeDark: '#450a0a',
          };
        } else if (isWyvernClass(classId)) {
          pal = {
            ...base,
            armorLight: '#e2e8f0', armorMid: '#334155', armorDark: '#0f172a',
            mountLight: '#34d399', mountMid: '#047857', mountDark: '#064e3b',
          };
        } else if (isNinjaClass(classId) || isDaggerClass(classId)) {
          pal = {
            ...base,
            hairLight: '#cbd5e1', hairMid: '#475569', hairDark: '#0f172a',
            armorLight: '#818cf8', armorMid: '#312e81', armorDark: '#1e1b4b',
            capeLight: '#fb7185', capeMid: '#be123c', capeDark: '#4c0519',
          };
        } else {
          pal = { ...base };
        }
        break;
    }
  } else {
    // ========================================================================
    // DISTINCT ENEMY IMPERIAL CLASS PALETTES (ALWAYS READABLE AS FOES VIA
    // CRIMSON WAR-TRIM / CLOAKS, YET VISUALLY DISTINCT BY ARCHETYPE!)
    // ========================================================================
    const enemyBase: CharacterPalette = {
      outline: '#120810',
      crease: '#24101c',
      hairLight: isBoss ? '#fef08a' : '#cbd5e1',
      hairMid: isBoss ? '#ca8a04' : '#64748b',
      hairDark: isBoss ? '#713f12' : '#1e293b',
      skinLight: '#f6dfd0',
      skinMid: '#dba98a',
      skinShade: '#a46c50',
      armorLight: '#fca5a5',
      armorMid: '#b91c1c',
      armorDark: '#450a0a',
      capeLight: '#94a3b8',
      capeMid: '#334155',
      capeDark: '#0f172a',
      goldLight: isBoss ? '#fef08a' : '#fdba74',
      goldMid: isBoss ? '#eab308' : '#d97706',
      goldDark: isBoss ? '#854d0e' : '#7c2d12',
      steelLight: '#f1f5f9',
      steelMid: '#94a3b8',
      steelDark: '#334155',
      eyeColor: '#ef4444',
      mountLight: '#64748b',
      mountMid: '#334155',
      mountDark: '#0f172a',
      magicGlow: glow,
      auraLight: '#fca5a5',
      auraMid: '#ef4444',
    };

    if (isBoss) {
      pal = {
        ...enemyBase,
        armorLight: '#fecdd3',
        armorMid: '#881337',
        armorDark: '#2c0614',
        capeLight: '#d8b4fe',
        capeMid: '#6b21a8',
        capeDark: '#2e1065',
        mountLight: isWyvernClass(classId) ? '#b91c1c' : '#475569',
        mountMid: isWyvernClass(classId) ? '#450a0a' : '#1e1b4b',
        mountDark: '#090712',
        auraLight: '#fef08a',
        auraMid: '#f43f5e',
      };
    } else if (isDarkCasterClass(classId) || isRobeClass(classId)) {
      // Imperial Blood-Cult Mages & Shamans: Deep Amethyst-Obsidian Robes + Crimson Trim
      pal = {
        ...enemyBase,
        hairLight: '#e9d5ff',
        hairMid: '#7e22ce',
        hairDark: '#3b0764',
        armorLight: '#d8b4fe',
        armorMid: '#581c87',
        armorDark: '#240a40',
        capeLight: '#fb7185',
        capeMid: '#be123c',
        capeDark: '#4c0519',
        auraMid: '#d946ef',
      };
    } else if (isHeavyArmorClass(classId)) {
      // Imperial Black-Iron Juggernauts: Gunmetal Obsidian Plate + Blood-Red Pauldron Trim & Cape
      pal = {
        ...enemyBase,
        armorLight: '#cbd5e1',
        armorMid: '#475569',
        armorDark: '#1e293b',
        capeLight: '#f87171',
        capeMid: '#b91c1c',
        capeDark: '#450a0a',
      };
    } else if (isDaggerClass(classId) || classId === 'ARCHER' || classId === 'SNIPER' || classId === 'MARKSMAN' || classId === 'STARFALL_ARCHER') {
      // Imperial Shadow-Hunters & Marksmen: Night-Slate Garb + Crimson Scarf
      pal = {
        ...enemyBase,
        hairLight: '#94a3b8',
        hairMid: '#334155',
        hairDark: '#0f172a',
        armorLight: '#94a3b8',
        armorMid: '#3f2e3e',
        armorDark: '#1c121e',
        capeLight: '#fb7185',
        capeMid: '#dc2626',
        capeDark: '#7f1d1d',
      };
    } else if (isPirateClass(classId) || classId === 'FIGHTER' || classId === 'BERSERKER' || classId === 'REAVER' || classId === 'WAR_GOD') {
      // Raiders & Marauders: Warm Bronze-Rust Brigandine + Crimson Warpaint/Sash
      pal = {
        ...enemyBase,
        hairLight: '#fdba74',
        hairMid: '#9a3412',
        hairDark: '#431407',
        armorLight: '#fed7aa',
        armorMid: '#9a3412',
        armorDark: '#431407',
        capeLight: '#fca5a5',
        capeMid: '#b91c1c',
        capeDark: '#450a0a',
      };
    } else if (isWyvernClass(classId) || isGriffinClass(classId)) {
      pal = {
        ...enemyBase,
        mountLight: isWyvernClass(classId) ? '#dc2626' : '#d97706',
        mountMid: isWyvernClass(classId) ? '#7f1d1d' : '#92400e',
        mountDark: '#2b090c',
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
// HIGH-CRAFT PIXEL RASTERIZER WITH SELECTIVE HUE-TINTED OUTLINING
// ============================================================================

class PixelCanvas {
  public buf: (string | null)[][];
  constructor(public w: number, public h: number) {
    this.buf = Array.from({ length: h }, () => Array<string | null>(w).fill(null));
  }

  set(x: number, y: number, color: string) {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix >= 0 && ix < this.w && iy >= 0 && iy < this.h) {
      this.buf[iy][ix] = color;
    }
  }

  get(x: number, y: number): string | null {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix >= 0 && ix < this.w && iy >= 0 && iy < this.h) {
      return this.buf[iy][ix];
    }
    return null;
  }

  rect(x: number, y: number, w: number, h: number, color: string) {
    const x0 = Math.round(x);
    const y0 = Math.round(y);
    const iw = Math.round(w);
    const ih = Math.round(h);
    for (let dy = 0; dy < ih; dy++) {
      for (let dx = 0; dx < iw; dx++) {
        this.set(x0 + dx, y0 + dy, color);
      }
    }
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, color: string) {
    const minX = Math.floor(cx - rx);
    const maxX = Math.ceil(cx + rx);
    const minY = Math.floor(cy - ry);
    const maxY = Math.ceil(cy + ry);
    const rx2 = Math.max(0.5, rx) * Math.max(0.5, rx);
    const ry2 = Math.max(0.5, ry) * Math.max(0.5, ry);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if ((dx * dx) / rx2 + (dy * dy) / ry2 <= 1.0) {
          this.set(x, y, color);
        }
      }
    }
  }

  line(x0: number, y0: number, x1: number, y1: number, color: string, thickness = 1) {
    let ix0 = Math.round(x0);
    let iy0 = Math.round(y0);
    const ix1 = Math.round(x1);
    const iy1 = Math.round(y1);
    const dx = Math.abs(ix1 - ix0);
    const dy = Math.abs(iy1 - iy0);
    const sx = ix0 < ix1 ? 1 : -1;
    const sy = iy0 < iy1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
      if (thickness <= 1) {
        this.set(ix0, iy0, color);
      } else {
        this.rect(ix0, iy0, thickness, thickness, color);
      }
      if (ix0 === ix1 && iy0 === iy1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        ix0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        iy0 += sy;
      }
    }
  }

  triangle(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string
  ) {
    const minX = Math.floor(Math.min(x0, x1, x2));
    const maxX = Math.ceil(Math.max(x0, x1, x2));
    const minY = Math.floor(Math.min(y0, y1, y2));
    const maxY = Math.ceil(Math.max(y0, y1, y2));
    const edge = (ax: number, ay: number, bx: number, by: number, px: number, py: number) =>
      (px - ax) * (by - ay) - (py - ay) * (bx - ax);
    const area = edge(x0, y0, x1, y1, x2, y2);
    if (Math.abs(area) < 0.001) {
      this.line(x0, y0, x1, y1, color);
      this.line(x1, y1, x2, y2, color);
      return;
    }
    const sign = area > 0 ? 1 : -1;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        const w0 = edge(x1, y1, x2, y2, px, py) * sign;
        const w1 = edge(x2, y2, x0, y0, px, py) * sign;
        const w2 = edge(x0, y0, x1, y1, px, py) * sign;
        if (w0 >= -0.01 && w1 >= -0.01 && w2 >= -0.01) {
          this.set(x, y, color);
        }
      }
    }
  }

  /**
   * Selective Hue-Shifted Outlining ("Sel-Out"):
   * Darkens and tints each 1px silhouette border pixel toward its adjacent material color
   * so hair, gold halos, blades, and skin look crisp and painterly rather than boxed in flat black.
   */
  addSelectiveOutline(baseOutline: string) {
    const copy = this.buf.map((row) => [...row]);
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    const outlineCache = new Map<string, string>();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (copy[y][x] !== null) continue;
        let neighbor: string | null = null;
        for (const [dx, dy] of dirs) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < this.w && ny >= 0 && ny < this.h && copy[ny][nx] !== null) {
            neighbor = copy[ny][nx];
            break;
          }
        }
        if (neighbor) {
          let tinted = outlineCache.get(neighbor);
          if (!tinted) {
            tinted = mixHex(neighbor, baseOutline, 0.76);
            outlineCache.set(neighbor, tinted);
          }
          this.buf[y][x] = tinted;
        }
      }
    }
  }
}

// ============================================================================
// TIER 3 & TIER 4 MAJESTIC BACK-LAYER AURAS, RUNES & FULL-SPAN MYTHIC WINGS
// ============================================================================

function drawTierBackGrandeur(
  p: PixelCanvas,
  pal: CharacterPalette,
  classId: UnitClassId,
  tier: UnitTier,
  cx: number,
  torsoY: number,
  frame: SpriteAnimFrame,
  isMounted: boolean
) {
  if (tier < 3) return;

  const wingFlap = frame === 1 ? -2 : frame === 3 ? 1 : 0;

  // === TIER 3: FLOATING ROYAL ARCANE RUNE HALO & TWIN STREAMERS ===
  if (tier === 3) {
    const ringY = torsoY + 1;
    const r = isMounted ? 16 : 14;
    for (let deg = 195; deg <= 345; deg += 8) {
      const rad = (deg * Math.PI) / 180;
      const rx = Math.round(cx + Math.cos(rad) * r);
      const ry = Math.round(ringY + Math.sin(rad) * (r * 0.65));
      p.set(rx, ry, deg % 16 === 0 ? pal.goldLight : pal.auraMid);
      if (deg % 24 === 0) {
        p.set(rx, ry - 1, '#ffffff');
        p.set(rx, ry + 1, pal.goldMid);
      }
    }
    // Twin floating royal energy streamers flanking shoulders
    const sway = frame % 2 === 0 ? 0 : 1;
    p.rect(cx - r - 2, torsoY + 2 + sway, 3, 12, pal.auraMid);
    p.rect(cx - r - 2, torsoY + 1 + sway, 3, 2, pal.goldLight);
    p.set(cx - r - 1, torsoY + 14 + sway, pal.goldLight);

    p.rect(cx + r, torsoY + 2 - sway, 3, 12, pal.auraMid);
    p.rect(cx + r, torsoY + 1 - sway, 3, 2, pal.goldLight);
    p.set(cx + r + 1, torsoY + 14 - sway, pal.goldLight);
    return;
  }

  // === TIER 4 (THẦN THOẠI): MASSIVE FULL-SPAN MYTHIC WINGS (SPANNING ~54px!) ===
  const style = getTier4WingStyle(classId);
  const wy = torsoY + wingFlap;

  if (style === 'SERAPH') {
    // 6-Winged Radiant Golden-White Seraphim Span!
    for (const s of [-1, 1]) {
      // Upper grand arch wing
      p.triangle(cx + s * 5, wy + 2, cx + s * 25, wy - 13, cx + s * 21, wy - 3, '#ffffff');
      p.triangle(cx + s * 5, wy + 3, cx + s * 21, wy - 3, cx + s * 16, wy + 3, '#fef9c3');
      // Golden upper wing spar & filigree
      p.line(cx + s * 5, wy + 1, cx + s * 25, wy - 13, pal.goldMid, 2);
      p.line(cx + s * 6, wy, cx + s * 24, wy - 13, pal.goldLight, 1);

      // Middle seraphic wing pair
      p.triangle(cx + s * 5, wy + 5, cx + s * 26, wy - 1, cx + s * 20, wy + 7, '#ffffff');
      p.line(cx + s * 6, wy + 5, cx + s * 25, wy - 1, pal.goldLight, 1);

      // Lower trailing cherubim plumes
      p.triangle(cx + s * 4, wy + 8, cx + s * 19, wy + 10, cx + s * 13, wy + 17, pal.goldLight);
      p.line(cx + s * 5, wy + 9, cx + s * 18, wy + 10, '#ffffff', 1);

      // Individual feather tip highlights
      p.set(cx + s * 26, wy - 13, '#ffffff');
      p.set(cx + s * 27, wy - 1, '#fef08a');
      p.set(cx + s * 20, wy + 10, '#ffffff');
    }
  } else if (style === 'DRACONIC') {
    // Great Outstretched Sovereign Wyrm / Demon-Lord Wings!
    for (const s of [-1, 1]) {
      // Leathery wing membranes
      p.triangle(cx + s * 5, wy + 2, cx + s * 25, wy - 13, cx + s * 23, wy - 1, pal.capeMid);
      p.triangle(cx + s * 5, wy + 4, cx + s * 23, wy - 1, cx + s * 17, wy + 10, pal.armorDark);
      p.triangle(cx + s * 5, wy + 6, cx + s * 17, wy + 10, cx + s * 11, wy + 16, pal.capeDark);

      // Heavy armored wing-arm & jagged bone ribs
      p.line(cx + s * 5, wy + 1, cx + s * 16, wy - 11, pal.armorMid, 2);
      p.line(cx + s * 16, wy - 11, cx + s * 26, wy - 13, pal.goldMid, 2);
      p.line(cx + s * 16, wy - 10, cx + s * 24, wy - 1, pal.armorLight, 1);
      p.line(cx + s * 16, wy - 10, cx + s * 17, wy + 10, pal.armorMid, 1);

      // Wing-thumb horn & blazing vein highlights
      p.line(cx + s * 16, wy - 11, cx + s * 18, wy - 16, pal.goldLight, 1);
      p.line(cx + s * 8, wy - 1, cx + s * 21, wy - 7, pal.auraLight, 1);
      p.set(cx + s * 27, wy - 13, pal.goldLight);
    }
  } else {
    // ASTRAL PHOENIX STARLIGHT WINGS!
    for (const s of [-1, 1]) {
      p.triangle(cx + s * 5, wy + 2, cx + s * 26, wy - 12, cx + s * 21, wy - 2, pal.auraMid);
      p.triangle(cx + s * 6, wy + 4, cx + s * 24, wy + 1, cx + s * 17, wy + 9, '#e0f2fe');
      p.triangle(cx + s * 5, wy + 7, cx + s * 18, wy + 11, cx + s * 12, wy + 17, pal.goldLight);

      p.line(cx + s * 5, wy + 1, cx + s * 26, wy - 12, pal.goldLight, 1);
      p.line(cx + s * 7, wy + 3, cx + s * 23, wy - 5, '#ffffff', 1);
      p.set(cx + s * 27, wy - 12, '#ffffff');
      p.set(cx + s * 25, wy + 1, pal.goldLight);
    }
  }
}

// ============================================================================
// FLOWING MULTI-FOLD BACK CAPE (BILLOWING BEHIND RIGHT-FACING HERO)
// ============================================================================

function drawFlowingCape(
  p: PixelCanvas,
  pal: CharacterPalette,
  classId: UnitClassId,
  tier: UnitTier,
  isBoss: boolean,
  cx: number,
  shoulderY: number,
  frame: SpriteAnimFrame,
  isMounted: boolean
) {
  const hasBaseCloak =
    tier >= 2 ||
    isBoss ||
    classId === 'LORD' ||
    isRobeClass(classId) ||
    classId === 'CAVALIER' ||
    isPirateClass(classId);

  if (!hasBaseCloak) return;

  const wave = frame === 1 ? -1 : frame === 2 ? 1 : frame === 3 ? 2 : 0;
  const capeLen =
    tier >= 4
      ? isMounted ? 22 : 31
      : tier === 3
      ? isMounted ? 19 : 27
      : tier === 2 || isBoss
      ? isMounted ? 16 : 22
      : 14;
  const flareLeft =
    tier >= 4 ? 16 + wave : tier === 3 ? 13 + wave : tier === 2 || isBoss ? 10 + wave : 7 + wave;

  // Deep shadow lining of cloak
  p.triangle(
    cx - 4,
    shoulderY + 1,
    cx + 4,
    shoulderY + 2,
    cx - flareLeft + 4,
    shoulderY + capeLen,
    pal.capeDark
  );
  // Rich mid-body billowing drape
  p.triangle(
    cx - 5,
    shoulderY,
    cx - flareLeft,
    shoulderY + capeLen - 2,
    cx - 2,
    shoulderY + capeLen,
    pal.capeMid
  );
  // Lit upper-left wind-caught fold
  p.line(cx - 5, shoulderY + 1, cx - flareLeft + 1, shoulderY + capeLen - 3, pal.capeLight, 2);

  // Interior vertical fold crease for cloth volume
  p.line(
    cx - 4,
    shoulderY + 4,
    cx - Math.round(flareLeft * 0.55),
    shoulderY + capeLen - 2,
    pal.capeDark,
    1
  );

  // Royal gold hem border on Tier 3+ or Boss
  if (tier >= 3 || isBoss) {
    p.line(
      cx - flareLeft,
      shoulderY + capeLen - 2,
      cx - 2,
      shoulderY + capeLen,
      pal.goldMid,
      1
    );
    p.set(cx - flareLeft, shoulderY + capeLen - 2, pal.goldLight);
  }
}

// ============================================================================
// SCULPTED 3/4 ANIME-PIXEL HEAD, EYES, LAYERED HAIR & TIERED HEADGEAR
// ============================================================================

function drawHeroHead(
  p: PixelCanvas,
  pal: CharacterPalette,
  classId: UnitClassId,
  templateId: string,
  isBoss: boolean,
  tier: UnitTier,
  cx: number,
  headTopY: number,
  frame: SpriteAnimFrame
) {
  const female = isFemaleStyledUnit(templateId, classId);
  const fullHelm = isHelmClass(classId) && (tier >= 2 || isHeavyArmorClass(classId));
  const hooded = isHoodClass(classId);
  const hairSway = frame % 2 === 1 ? 1 : 0;

  // 1. Back hair flowing behind neck/shoulders (before face!)
  if (!fullHelm && !hooded) {
    if (female || isLightClericClass(classId) || isChronoClass(classId)) {
      // Long flowing waist/shoulder-length locks trailing left
      p.triangle(
        cx - 6,
        headTopY + 5,
        cx - 12 - hairSway,
        headTopY + 19,
        cx - 2,
        headTopY + 18,
        pal.hairDark
      );
      p.triangle(
        cx - 6,
        headTopY + 4,
        cx - 10 - hairSway,
        headTopY + 17,
        cx - 4,
        headTopY + 16,
        pal.hairMid
      );
    } else if (isKatanaClass(classId) || isBrawlerClass(classId) || classId === 'ARCHER' || classId === 'SNIPER') {
      // High spirited samurai/archer ponytail streaming behind head!
      p.triangle(
        cx - 6,
        headTopY + 2,
        cx - 14 - hairSway,
        headTopY + 7,
        cx - 9 - hairSway,
        headTopY + 13,
        pal.hairMid
      );
      p.line(cx - 7, headTopY + 3, cx - 13 - hairSway, headTopY + 6, pal.hairLight, 1);
      p.rect(cx - 7, headTopY + 2, 2, 2, pal.goldMid); // Ponytail tie
    }
  }

  // 2. Neck & Collar shadow
  p.rect(cx - 2, headTopY + 12, 5, 3, pal.skinShade);
  p.line(cx - 2, headTopY + 12, cx + 3, headTopY + 12, pal.crease, 1);

  if (fullHelm) {
    // Sculpted Knight / Dragoon / Berserker Greathelm!
    p.ellipse(cx, headTopY + 6, 6.5, 6.2, pal.armorMid);
    p.rect(cx - 5, headTopY + 5, 11, 7, pal.armorMid);
    // Specular brow & crown ridge
    p.rect(cx - 4, headTopY + 2, 7, 3, pal.armorLight);
    p.line(cx - 5, headTopY + 6, cx + 6, headTopY + 6, pal.goldMid, 1);
    // Dark T-visor slit + fierce glowing eyes inside!
    p.rect(cx - 2, headTopY + 7, 8, 2, pal.outline);
    p.rect(cx + 2, headTopY + 7, 2, 5, pal.outline);
    p.set(cx, headTopY + 7, isBoss ? '#ef4444' : pal.auraLight);
    p.set(cx + 4, headTopY + 7, isBoss ? '#ef4444' : pal.auraLight);
    // Cheekplates
    p.rect(cx - 5, headTopY + 8, 4, 4, pal.armorDark);
    p.rect(cx + 4, headTopY + 8, 2, 4, pal.armorLight);

    // Progressive Helm Crests / Horns / Plumes!
    if (isDragoonClass(classId)) {
      // Swept Dragoon Wyrm-Horns!
      p.line(cx - 2, headTopY + 2, cx - 9, headTopY - 4 - (tier >= 3 ? 2 : 0), pal.goldLight, 2);
      p.line(cx + 3, headTopY + 2, cx + 8, headTopY - 3 - (tier >= 3 ? 2 : 0), pal.goldMid, 1);
    } else if (classId === 'BERSERKER' || classId === 'REAVER' || classId === 'WAR_GOD' || isBoss) {
      // Fierce Bull/Demon War-Horns!
      p.line(cx - 4, headTopY + 2, cx - 9, headTopY - 4, pal.goldLight, 2);
      p.line(cx + 4, headTopY + 2, cx + 9, headTopY - 4, pal.goldLight, 2);
    }
    if (tier >= 2 || isBoss) {
      // Flowing Horsehair / Royal Crest Plume!
      const plumeH = tier >= 4 ? 7 : tier === 3 ? 5 : 4;
      p.triangle(
        cx - 1,
        headTopY,
        cx + 3,
        headTopY - plumeH,
        cx - 9 - hairSway,
        headTopY + 4,
        pal.capeMid
      );
      p.line(cx, headTopY - 1, cx + 3, headTopY - plumeH, pal.capeLight, 1);
      p.rect(cx - 1, headTopY - 1, 3, 2, pal.goldLight);
    }
  } else {
    // 3. Sculpted 3/4 Anime-RPG Face (facing right +x)
    p.ellipse(cx, headTopY + 6, 6, 5.8, pal.skinMid);
    // Tapered heroic chin & right cheek plane
    p.rect(cx - 3, headTopY + 9, 8, 2, pal.skinMid);
    p.rect(cx - 1, headTopY + 11, 5, 1, pal.skinMid);
    // Warm forehead & cheek light
    p.rect(cx, headTopY + 4, 4, 4, pal.skinLight);
    // Left jaw shadow & ear
    p.rect(cx - 5, headTopY + 6, 2, 4, pal.skinShade);
    p.rect(cx - 6, headTopY + 7, 1, 2, pal.skinLight);

    if (hooded) {
      // Deep Sculpted Assassin / Dark-Mage / Ninja Hood!
      p.ellipse(cx, headTopY + 5, 7, 6, pal.armorDark);
      p.triangle(cx - 7, headTopY + 4, cx + 6, headTopY + 2, cx - 9, headTopY + 10, pal.armorMid);
      p.line(cx - 4, headTopY, cx + 5, headTopY + 2, pal.armorLight, 1);
      // Upper face cast in mysterious shadow
      p.rect(cx - 3, headTopY + 5, 9, 3, pal.outline);
      // Ninja / Whisper lower face mask
      if (isNinjaClass(classId) || classId === 'ASSASSIN' || classId === 'WHISPER' || classId === 'PHANTOM_REAPER') {
        p.rect(cx - 3, headTopY + 9, 9, 3, pal.armorMid);
        p.line(cx - 3, headTopY + 9, cx + 5, headTopY + 9, pal.goldMid, 1);
      }
      // Piercing glowing eyes beneath hood!
      p.set(cx, headTopY + 7, '#ffffff');
      p.set(cx + 1, headTopY + 7, pal.magicGlow);
      p.set(cx + 4, headTopY + 7, '#ffffff');
      p.set(cx + 5, headTopY + 7, pal.magicGlow);
    } else {
      // Expressive 3/4 Anime-Pixel Eyes (inset cleanly inside both cheeks!)
      // Near eye (x = cx - 2 .. cx)
      p.line(cx - 2, headTopY + 6, cx, headTopY + 6, pal.outline, 1);
      p.rect(cx - 1, headTopY + 7, 2, 2, pal.eyeColor);
      p.set(cx - 2, headTopY + 7, '#ffffff'); // Specular catchlight!
      // Far eye (x = cx + 3 .. cx + 4, leaving cx + 5 for cheek/sidelock!)
      p.line(cx + 3, headTopY + 6, cx + 4, headTopY + 6, pal.outline, 1);
      p.rect(cx + 3, headTopY + 7, 2, 2, pal.eyeColor);
      p.set(cx + 3, headTopY + 7, '#ffffff');
      // Soft cheek highlight & brows
      p.set(cx - 2, headTopY + 9, female ? '#fda4af' : pal.skinLight);
      p.line(cx - 2, headTopY + 5, cx, headTopY + 5, pal.hairDark, 1);
      p.line(cx + 3, headTopY + 5, cx + 4, headTopY + 5, pal.hairDark, 1);
      p.set(cx + 1, headTopY + 10, pal.skinShade);

      // 4. Layered Crown Hair, Feathered Bangs & Dual Sidelocks!
      p.ellipse(cx, headTopY + 2.5, 6.8, 3.4, pal.hairMid);
      // Specular hair angel-ring highlight across crown!
      p.line(cx - 4, headTopY + 1, cx + 3, headTopY + 1, pal.hairLight, 1);
      p.set(cx - 1, headTopY, pal.hairLight);
      // Feathered multi-strand anime bangs over forehead
      p.triangle(cx - 5, headTopY + 2, cx, headTopY + 2, cx - 3, headTopY + 6, pal.hairMid);
      p.triangle(cx - 1, headTopY + 2, cx + 4, headTopY + 2, cx + 1, headTopY + 6, pal.hairMid);
      p.triangle(cx + 3, headTopY + 2, cx + 6, headTopY + 4, cx + 5, headTopY + 7, pal.hairDark);
      // Tapered left & right sidelocks framing both cheeks cleanly!
      p.triangle(cx - 6, headTopY + 3, cx - 4, headTopY + 3, cx - 6, headTopY + 11, pal.hairMid);
      p.line(cx - 6, headTopY + 7, cx - 5, headTopY + 10, pal.hairDark, 1);
      p.line(cx + 5, headTopY + 3, cx + 6, headTopY + 7, pal.hairDark, 1);

      // 5. Class-Specific Hats, Crowns, Kabutos & Mitres!
      if (isSamuraiClass(classId) && tier >= 2) {
        // Samurai Kabuto Bowl + Golden Crescent Maedate!
        p.ellipse(cx, headTopY + 2, 7, 3, pal.armorDark);
        p.line(cx - 6, headTopY + 3, cx + 6, headTopY + 3, pal.goldMid, 1);
        // Sikoro neck-guard plates on left
        p.rect(cx - 7, headTopY + 4, 3, 5, pal.armorMid);
        // Golden crescent horns!
        const hornH = tier >= 3 ? 5 : 3;
        p.line(cx + 2, headTopY + 2, cx - 2, headTopY - hornH, pal.goldLight, 1);
        p.line(cx + 2, headTopY + 2, cx + 7, headTopY - hornH, pal.goldLight, 1);
      } else if (
        classId === 'MAGE' || classId === 'SAGE' || classId === 'ARCHSAGE' || classId === 'ASTRAL_ORACLE' ||
        isChronoClass(classId)
      ) {
        if (tier <= 2) {
          // Iconic Pointed Wizard Brimmed Hat!
          p.line(cx - 8, headTopY + 3, cx + 8, headTopY + 3, pal.armorDark, 2);
          p.line(cx - 7, headTopY + 3, cx + 7, headTopY + 3, pal.goldMid, 1);
          p.triangle(cx - 5, headTopY + 3, cx + 5, headTopY + 3, cx - 4, headTopY - 6, pal.armorMid);
          p.line(cx - 2, headTopY + 2, cx - 4, headTopY - 6, pal.armorLight, 1);
          p.rect(cx, headTopY + 2, 2, 2, pal.goldLight);
        } else {
          // Grand Archsage / Astral Star-Crown!
          p.line(cx - 4, headTopY + 2, cx + 5, headTopY + 2, pal.goldMid, 2);
          p.line(cx - 3, headTopY + 1, cx - 4, headTopY - 3, pal.goldLight, 1);
          p.line(cx + 1, headTopY + 1, cx + 1, headTopY - 5, pal.goldLight, 2);
          p.line(cx + 5, headTopY + 1, cx + 6, headTopY - 3, pal.goldLight, 1);
          p.set(cx + 1, headTopY - 2, pal.magicGlow);
        }
      } else if (isLightClericClass(classId)) {
        // Sacred Cleric Veil / Golden Sun-Mitre!
        p.line(cx - 4, headTopY + 2, cx + 5, headTopY + 2, pal.goldLight, 1);
        p.set(cx + 1, headTopY + 1, '#38bdf8');
        if (tier >= 2) {
          p.triangle(cx - 3, headTopY + 2, cx + 4, headTopY + 2, cx + 1, headTopY - 4, '#ffffff');
          p.line(cx + 1, headTopY + 1, cx + 1, headTopY - 3, pal.goldMid, 1);
        }
      } else if (isPirateClass(classId)) {
        // Buccaneer Bandana (T1) -> Dread Captain Tricorn Hat (T2+)!
        if (tier === 1) {
          p.rect(cx - 6, headTopY + 1, 12, 3, pal.capeMid);
          p.line(cx - 6, headTopY + 2, cx - 10, headTopY + 5, pal.capeMid, 2);
        } else {
          p.line(cx - 8, headTopY + 3, cx + 8, headTopY + 3, pal.armorDark, 2);
          p.triangle(cx - 6, headTopY + 3, cx + 6, headTopY + 3, cx, headTopY - 3, pal.capeDark);
          p.line(cx - 6, headTopY + 2, cx + 6, headTopY + 2, pal.goldLight, 1);
          p.line(cx - 3, headTopY, cx - 8, headTopY - 4, '#ffffff', 2); // Feather plume!
        }
      } else if (
        classId === 'LORD' || classId === 'GREAT_LORD' || classId === 'SOVEREIGN' || classId === 'EMPEROR_LORD' ||
        tier >= 3 || isBoss
      ) {
        // Noble Diadem -> Royal Sovereign Crown!
        p.line(cx - 4, headTopY + 2, cx + 5, headTopY + 2, pal.goldMid, 1);
        p.set(cx + 1, headTopY + 1, pal.goldLight);
        if (tier >= 2 || isBoss) {
          p.set(cx - 2, headTopY, pal.goldLight);
          p.line(cx + 1, headTopY + 1, cx + 1, headTopY - 2, pal.goldLight, 1);
          p.set(cx + 4, headTopY, pal.goldLight);
          p.set(cx + 1, headTopY + 2, '#ef4444');
        }
      }
    }
  }

  // === TIER 4 MYTHIC CELESTIAL HALO FLOATING ABOVE ALL HEADGEAR ===
  if (tier >= 4) {
    const haloY = headTopY - 6 + (frame % 2 === 0 ? 0 : -1);
    for (let dx = -6; dx <= 6; dx++) {
      const dy = Math.abs(dx) >= 5 ? 1 : 0;
      p.set(cx + dx, haloY + dy, Math.abs(dx) <= 2 ? '#ffffff' : pal.goldLight);
    }
    p.set(cx, haloY - 2, '#ffffff');
    p.set(cx, haloY - 1, pal.goldLight);
  }
}

// ============================================================================
// HIGH-DETAIL WEAPONS GRIPPED DIRECTLY IN FRONT GAUNTLETED HAND
// ============================================================================

function drawHeldWeapon(
  p: PixelCanvas,
  pal: CharacterPalette,
  wType: WeaponType,
  classId: UnitClassId,
  handX: number,
  handY: number,
  tier: UnitTier,
  frame: SpriteAnimFrame,
  animState: SpriteAnimState
) {
  const readyTilt = animState === 'selected' ? 1 : 0;
  const tierLen = tier >= 4 ? 6 : tier === 3 ? 4 : tier === 2 ? 2 : 0;

  if (wType === 'SWORD') {
    if (isKatanaClass(classId)) {
      // Sleek Curved Nihonto Katana with Golden Tsuba!
      const tipX = handX + 14 + tierLen;
      const tipY = handY - 13 - tierLen + readyTilt * 2;
      p.line(handX - 3, handY + 3, handX, handY, pal.capeDark, 2); // Tsuka hilt
      p.line(handX - 1, handY - 2, handX + 2, handY + 1, pal.goldLight, 1); // Tsuba guard
      p.line(handX + 1, handY - 1, tipX, tipY, pal.steelMid, 2);
      p.line(handX + 1, handY - 2, tipX, tipY - 1, '#ffffff', 1); // Razor hamon edge!
      if (tier >= 3) {
        p.line(handX + 3, handY - 4, tipX - 2, tipY + 1, pal.auraMid, 1);
      }
    } else if (isDaggerClass(classId)) {
      // Reverse-gripped lethal Kris / Twin-edge Assassin Blade!
      const len = 10 + Math.floor(tierLen * 0.7);
      p.line(handX - 1, handY - 1, handX + 2, handY + 2, pal.goldMid, 1);
      p.line(handX, handY + 1, handX + len, handY + 6, pal.steelMid, 2);
      p.line(handX + 1, handY, handX + len, handY + 5, '#ffffff', 1);
      if (tier >= 2) {
        p.line(handX + 2, handY + 2, handX + len - 1, handY + 6, pal.magicGlow, 1);
      }
    } else if (isBrawlerClass(classId)) {
      // Blazing Dragon-Claw Cestus Gauntlets!
      p.rect(handX - 1, handY - 2, 5, 5, pal.goldMid);
      p.rect(handX, handY - 2, 4, 2, pal.goldLight);
      p.line(handX + 4, handY - 2, handX + 9 + Math.floor(tierLen / 2), handY - 4, '#ffffff', 1);
      p.line(handX + 4, handY, handX + 10 + Math.floor(tierLen / 2), handY, '#ffffff', 1);
      p.line(handX + 4, handY + 2, handX + 9 + Math.floor(tierLen / 2), handY + 3, pal.auraLight, 1);
    } else {
      // Heroic Knightly Broadsword / Royal Runeblade!
      const bladeLen = 14 + tierLen;
      const tipX = handX + bladeLen;
      const tipY = handY - bladeLen + readyTilt * 3;
      // Pommel & grip
      p.set(handX - 3, handY + 3, pal.goldLight);
      p.line(handX - 2, handY + 2, handX, handY, pal.armorDark, 2);
      // Wide cruciform / winged gold crossguard
      p.line(handX - 3, handY - 2, handX + 3, handY + 3, pal.goldMid, 2);
      p.set(handX - 3, handY - 2, pal.goldLight);
      p.set(handX + 3, handY + 3, pal.goldLight);
      // Beveled broad blade with fuller!
      p.line(handX + 1, handY - 1, tipX, tipY, pal.steelDark, 3);
      p.line(handX + 1, handY - 2, tipX, tipY, pal.steelLight, 2);
      p.line(handX + 2, handY - 2, tipX, tipY, '#ffffff', 1);
      if (tier >= 3) {
        p.line(handX + 3, handY - 3, tipX - 3, tipY + 3, pal.magicGlow, 1);
      }
    }
  } else if (wType === 'LANCE') {
    // Long Knightly Lance / Winged Halberd!
    const x0 = handX - 8;
    const y0 = handY + 6;
    const x1 = handX + 16 + tierLen;
    const y1 = handY - 14 - Math.floor(tierLen * 0.7) + readyTilt * 2;
    p.line(x0, y0, x1 - 5, y1 + 4, '#78350f', 2); // Polished ash/mahogany shaft
    p.line(x0, y0 - 1, x1 - 5, y1 + 3, '#b45309', 1);
    // Pennant banner fluttering below spearhead on Tier 2+!
    if (tier >= 2) {
      const sway = frame % 2 === 0 ? 0 : 2;
      p.triangle(x1 - 7, y1 + 5, x1 - 11, y1 + 9, x1 - 6 - sway, y1 + 13, pal.capeMid);
      p.set(x1 - 7, y1 + 5, pal.goldLight);
    }
    // Broad diamond spearhead + halberd crescent wing on Tier 3+
    p.rect(x1 - 6, y1 + 3, 3, 3, pal.goldMid);
    p.triangle(x1 - 5, y1 + 2, x1 - 2, y1 + 6, x1 + 3, y1 - 2, pal.steelMid);
    p.line(x1 - 4, y1 + 2, x1 + 3, y1 - 2, '#ffffff', 1);
    if (tier >= 3) {
      p.triangle(x1 - 5, y1 + 3, x1 - 9, y1 - 3, x1 - 2, y1, pal.steelLight);
    }
  } else if (wType === 'AXE') {
    // Heavy Bearded War-Axe / Double-Crescent Battleaxe!
    const headX = handX + 11 + Math.floor(tierLen * 0.6);
    const headY = handY - 11 - Math.floor(tierLen * 0.5);
    p.line(handX - 5, handY + 6, headX + 1, headY - 1, '#78350f', 2);
    p.set(headX + 2, headY - 2, pal.goldLight); // Top spike
    // Sweeping crescent forward blade
    p.triangle(headX - 1, headY + 1, headX + 6, headY - 3, headX + 5, headY + 7, pal.steelMid);
    p.line(headX + 5, headY - 3, headX + 5, headY + 7, '#ffffff', 2);
    p.rect(headX - 1, headY, 3, 3, pal.goldMid);
    if (tier >= 2) {
      // Rear counter-blade for double-headed War-Axe!
      p.triangle(headX - 1, headY + 1, headX - 6, headY - 4, headX - 5, headY + 4, pal.steelDark);
      p.line(headX - 6, headY - 4, headX - 5, headY + 4, pal.steelLight, 1);
    }
  } else if (wType === 'BOW') {
    // Sculpted Recurved Composite / Astral Longbow + Nocked Arrow!
    const bx = handX + 3;
    const by = handY - 1;
    const r = 9 + Math.floor(tierLen * 0.4);
    // Upper & lower recurve limbs
    p.line(bx, by - 2, bx - 3, by - r, '#b45309', 2);
    p.line(bx - 3, by - r, bx - 5, by - r - 2, pal.goldLight, 2);
    p.line(bx, by + 2, bx - 3, by + r, '#b45309', 2);
    p.line(bx - 3, by + r, bx - 5, by + r + 2, pal.goldLight, 2);
    p.rect(bx - 1, by - 2, 3, 4, pal.goldMid); // Riser grip
    // Taut bowstring
    p.line(bx - 5, by - r - 1, bx - 7, by, '#e2e8f0', 1);
    p.line(bx - 5, by + r + 1, bx - 7, by, '#e2e8f0', 1);
    // Fletched arrow drawn across bow!
    p.line(bx - 7, by, bx + 8 + Math.floor(tierLen / 2), by, '#fef08a', 1);
    p.triangle(
      bx + 7 + Math.floor(tierLen / 2),
      by - 2,
      bx + 7 + Math.floor(tierLen / 2),
      by + 2,
      bx + 11 + Math.floor(tierLen / 2),
      by,
      tier >= 3 ? pal.magicGlow : '#ffffff'
    );
  } else if (wType === 'TOME') {
    // Open Illuminated Grimoire + Floating Elemental Rune Sphere above palm!
    const tx = handX + 3;
    const ty = handY + 1;
    p.rect(tx - 4, ty, 10, 5, pal.capeDark); // Leather cover
    p.line(tx - 4, ty + 4, tx + 5, ty + 4, pal.goldMid, 1);
    p.rect(tx - 3, ty - 1, 4, 4, '#fef9c3'); // Left parchment page
    p.rect(tx + 2, ty - 1, 4, 4, '#fffbeb'); // Right parchment page
    p.line(tx + 1, ty - 1, tx + 1, ty + 3, pal.goldDark, 1); // Spine

    // Floating arcane orb & orbiting sparks above open pages!
    const floatY = ty - 7 - (frame % 2);
    p.ellipse(tx + 2, floatY, 3 + (tier >= 3 ? 1 : 0), 3 + (tier >= 3 ? 1 : 0), pal.magicGlow);
    p.rect(tx + 1, floatY - 1, 2, 2, '#ffffff');
    const orbit = frame % 2 === 0 ? -4 : 4;
    p.set(tx + 2 + orbit, floatY - 2, pal.goldLight);
    p.set(tx + 2 - orbit, floatY + 2, '#ffffff');
  } else if (wType === 'STAFF') {
    // Tall Gilded Bishop Crosier / Seraphic Sun-Staff!
    const sx = handX + 3;
    const topY = handY - 17 - Math.floor(tierLen * 0.5);
    p.line(sx, handY + 12, sx, topY + 4, '#b45309', 2);
    p.line(sx, handY + 12, sx, topY + 4, pal.goldMid, 1);
    // Ornate filigree head + sacred crystal!
    p.ellipse(sx, topY + 2, 4 + (tier >= 3 ? 1 : 0), 4 + (tier >= 3 ? 1 : 0), pal.goldLight);
    p.ellipse(sx, topY + 2, 2, 2, '#38bdf8');
    p.set(sx, topY + 1, '#ffffff');
    if (tier >= 2) {
      p.line(sx - 5, topY + 3, sx - 2, topY, pal.goldLight, 1);
      p.line(sx + 5, topY + 3, sx + 2, topY, pal.goldLight, 1);
    }
  }
}

// ============================================================================
// HERALDIC SHIELD ON NEAR FLANK (SO BOTH SHIELD & WEAPON READ CLEARLY!)
// ============================================================================

function drawHeraldicShield(
  p: PixelCanvas,
  pal: CharacterPalette,
  tier: UnitTier,
  isHeavy: boolean,
  sx: number,
  sy: number
) {
  const w = isHeavy ? 10 : 8;
  const h = isHeavy ? 16 : 13;
  // Shield body + pointed kite bottom
  p.rect(sx, sy, w, h - 4, pal.armorDark);
  p.rect(sx + 1, sy + 1, w - 2, h - 5, pal.armorMid);
  p.triangle(sx, sy + h - 4, sx + w - 1, sy + h - 4, sx + Math.floor(w / 2), sy + h, pal.armorMid);
  // Metallic gold/steel rim
  p.line(sx, sy, sx + w - 1, sy, pal.goldLight, 1);
  p.line(sx, sy, sx, sy + h - 4, pal.goldMid, 1);
  p.line(sx + w - 1, sy, sx + w - 1, sy + h - 4, pal.goldDark, 1);
  // Central heraldic cross / boss emblem
  const midX = sx + Math.floor(w / 2);
  p.line(midX, sy + 2, midX, sy + h - 3, pal.goldLight, 1);
  p.line(sx + 2, sy + 5, sx + w - 3, sy + 5, pal.goldLight, 1);
  if (tier >= 3) {
    p.set(midX, sy + 5, pal.magicGlow);
  }
}

// ============================================================================
// ANATOMICAL 64x72 FOOT HERO RENDERER (ALL INFANTRY, ARMOR, CASTERS, MARTIAL)
// ============================================================================

function drawFootUnit(
  p: PixelCanvas,
  pal: CharacterPalette,
  classId: UnitClassId,
  templateId: string,
  wType: WeaponType,
  isBoss: boolean,
  tier: UnitTier,
  frame: SpriteAnimFrame,
  animState: SpriteAnimState
) {
  const cx = 29;
  const footY = 64;
  const isHeavy = isHeavyArmorClass(classId);
  const isRobe = isRobeClass(classId);

  // Subtle idle breathing vs alert combat crouch vs 4-frame stride bob
  const bob =
    animState === 'walk'
      ? frame === 1 || frame === 3 ? -2 : 0
      : animState === 'selected'
      ? 1
      : frame === 1 || frame === 2 ? -1 : 0;

  const torsoY = 31 + bob;
  const headTopY = 17 + bob;

  // 1. Tier 3 Arcane Ring / Tier 4 Full-Span Mythic Wings (furthest back)
  drawTierBackGrandeur(p, pal, classId, tier, cx, torsoY, frame, false);

  // 2. Flowing Multi-Fold Back Cape
  drawFlowingCape(p, pal, classId, tier, isBoss, cx, torsoY, frame, false);

  // 3. 3/4 Stance Legs, Tassets, Greaves & Armored Sabatons!
  const stride =
    animState === 'walk'
      ? frame === 0 ? 4 : frame === 2 ? -4 : 0
      : animState === 'selected'
      ? 2
      : 0;

  // Far/Forward Right Leg (viewer's right: cx + 1 .. cx + 6)
  const rKneeX = cx + 4 + Math.round(stride * 0.6);
  const rFootX = cx + 4 + stride;
  const rLift = animState === 'walk' && frame === 1 ? -3 : 0;
  p.line(cx + 2, torsoY + 14, rKneeX, footY - 9 + rLift, pal.armorDark, 4);
  p.line(rKneeX, footY - 9 + rLift, rFootX, footY - 3 + rLift, pal.steelMid, 4);
  p.line(rKneeX + 2, footY - 9 + rLift, rFootX + 2, footY - 3 + rLift, pal.steelLight, 1); // Shin highlight
  p.rect(rKneeX, footY - 10 + rLift, 4, 2, pal.goldMid); // Knee cop
  // Boot / Sabaton pointing right
  p.rect(rFootX - 1, footY - 3 + rLift, 7, 4, pal.armorDark);
  p.rect(rFootX + 2, footY - 2 + rLift, 4, 2, pal.steelMid);

  // Near/Trailing Left Leg (viewer's left: cx - 6 .. cx - 1)
  const lKneeX = cx - 4 - Math.round(stride * 0.6);
  const lFootX = cx - 5 - stride;
  const lLift = animState === 'walk' && frame === 3 ? -3 : 0;
  p.line(cx - 4, torsoY + 14, lKneeX, footY - 9 + lLift, pal.armorMid, 4);
  // Inner leg separation crease so legs NEVER merge!
  p.line(cx, torsoY + 15, cx, footY - 5, pal.crease, 1);
  p.line(lKneeX, footY - 9 + lLift, lFootX, footY - 3 + lLift, pal.armorMid, 4);
  p.line(lKneeX + 1, footY - 9 + lLift, lFootX + 1, footY - 3 + lLift, pal.armorLight, 1);
  p.rect(lKneeX, footY - 10 + lLift, 4, 2, pal.goldLight);
  p.rect(lFootX - 1, footY - 3 + lLift, 7, 4, pal.armorDark);
  p.rect(lFootX + 1, footY - 2 + lLift, 4, 2, pal.armorLight);

  // 4. Sculpted Torso: Cuirass / Robes / Surcoat + Tassets!
  if (isRobe) {
    // Flowing Arcane / Cleric Vestments with Gold-Trimmed Stole!
    p.triangle(cx - 6, torsoY, cx + 6, torsoY, cx - 9, footY - 4, pal.armorMid);
    p.triangle(cx + 6, torsoY, cx + 9, footY - 4, cx - 9, footY - 4, pal.armorMid);
    // Shaded left fold & lit right chest
    p.triangle(cx - 6, torsoY + 2, cx - 2, torsoY + 2, cx - 9, footY - 4, pal.armorDark);
    p.rect(cx - 1, torsoY + 2, 6, 12, pal.armorLight);
    // Center front parting slit + golden stole ribbons!
    p.line(cx + 2, torsoY + 12, cx + 3, footY - 5, pal.crease, 2);
    p.line(cx - 2, torsoY + 1, cx - 3, footY - 5, pal.goldMid, 2);
    p.line(cx + 4, torsoY + 1, cx + 5, footY - 5, pal.goldLight, 1);
    // Ornate high collar & waist sash
    p.rect(cx - 5, torsoY - 1, 11, 3, pal.goldMid);
    p.rect(cx - 6, torsoY + 11, 13, 3, pal.capeMid);
    p.rect(cx, torsoY + 11, 3, 3, pal.goldLight);
  } else {
    const chestW = isHeavy ? 16 : 13;
    const chestLeft = cx - Math.floor(chestW / 2);
    // Sculpted V-tapered Breastplate / Brigandine
    p.rect(chestLeft, torsoY, chestW, 13, pal.armorMid);
    p.rect(chestLeft, torsoY + 2, 4, 11, pal.armorDark); // Left shadow plane
    p.rect(cx - 2, torsoY + 2, chestW - 6, 7, pal.armorLight); // Lit pectoral plate!
    p.line(cx + 1, torsoY + 2, cx + 1, torsoY + 11, '#ffffff', 1); // Specular breastplate keel!

    // Samurai / Martial Diagonal Collar or Knightly Baldric
    if (isSamuraiClass(classId) || isKatanaClass(classId)) {
      p.line(chestLeft + 2, torsoY + 1, cx + 3, torsoY + 10, pal.goldLight, 1);
      p.line(cx + 4, torsoY + 1, cx - 1, torsoY + 10, pal.capeMid, 1);
    } else if (!isHeavy) {
      p.line(chestLeft + 2, torsoY + 1, cx + 4, torsoY + 11, pal.goldDark, 2);
      p.line(chestLeft + 2, torsoY + 1, cx + 4, torsoY + 11, pal.goldLight, 1);
    }

    // Gorget neck-guard + War Belt + Hanging Battle Tabard & Tassets!
    p.line(chestLeft + 2, torsoY, chestLeft + chestW - 3, torsoY, pal.goldLight, 2);
    p.rect(chestLeft, torsoY + 12, chestW, 3, pal.crease);
    p.rect(cx, torsoY + 12, 3, 3, pal.goldLight); // Belt buckle!

    // Armored hip tassets + progressive battle tabard (sleek on T1 so thighs read cleanly!)
    p.rect(chestLeft - 1, torsoY + 15, 4, isHeavy ? 7 : 4, pal.armorMid);
    p.line(chestLeft - 1, torsoY + 15, chestLeft + 2, torsoY + 15, pal.goldMid, 1);
    p.rect(chestLeft + chestW - 3, torsoY + 15, 4, isHeavy ? 7 : 4, pal.armorDark);
    const tabardH = tier >= 3 ? 10 : tier === 2 ? 7 : 3;
    const tabardW = tier >= 3 ? 5 : 3;
    const tabardX = cx - Math.floor(tabardW / 2);
    p.rect(tabardX, torsoY + 15, tabardW, tabardH, pal.capeMid);
    if (tier >= 2) {
      p.line(tabardX, torsoY + 14 + tabardH, tabardX + tabardW - 1, torsoY + 14 + tabardH, pal.goldLight, 1);
    }
  }

  // 5. Escalating Tiered Pauldrons (Shoulder Armor)!
  const pauldronSize = isHeavy ? 6 + tier : tier >= 3 ? 6 : tier === 2 ? 5 : 3;
  // Far right pauldron
  p.ellipse(cx + 6, torsoY + 2, pauldronSize * 0.7, pauldronSize * 0.65, pal.armorMid);
  p.line(cx + 4, torsoY, cx + 6 + Math.floor(pauldronSize * 0.6), torsoY + 1, pal.goldLight, 1);
  // Near left pauldron (overlapping shoulder with crisp dark crease!)
  p.ellipse(cx - 6, torsoY + 2, pauldronSize * 0.85, pauldronSize * 0.75, pal.armorLight);
  p.line(cx - 6 - Math.floor(pauldronSize * 0.7), torsoY + 3, cx - 3, torsoY + 4, pal.goldMid, 1);
  p.line(cx - 3, torsoY + 1, cx - 3, torsoY + 5, pal.crease, 1);
  if (tier >= 3 || isBoss) {
    // Winged sovereign shoulder spikes!
    p.line(cx - 7, torsoY + 1, cx - 11 - (tier >= 4 ? 2 : 0), torsoY - 3, pal.goldLight, 2);
    p.line(cx + 7, torsoY + 1, cx + 10 + (tier >= 4 ? 2 : 0), torsoY - 3, pal.goldMid, 1);
  }

  // 6. Articulated Forward Weapon Arm + Gauntleted Hand!
  const armReach = animState === 'selected' ? 2 : frame === 2 ? 1 : 0;
  const elbowX = cx + 5;
  const elbowY = torsoY + 6;
  const handX = cx + 10 + armReach;
  const handY = torsoY + 7 - (animState === 'selected' ? 2 : 0);

  p.line(cx + 3, torsoY + 3, elbowX, elbowY, pal.armorDark, 3);
  p.line(elbowX, elbowY, handX, handY, pal.armorMid, 3);
  p.line(elbowX, elbowY - 1, handX, handY - 1, pal.goldMid, 1); // Vambrace trim

  // Draw the weapon anchored cleanly inside the hand!
  drawHeldWeapon(p, pal, wType, classId, handX, handY, tier, frame, animState);

  // Draw the gripping gauntleted hand / fingers OVER the weapon hilt!
  p.rect(handX - 1, handY - 1, 3, 3, isHeavy || tier >= 2 ? pal.goldLight : pal.skinMid);
  p.set(handX - 1, handY + 1, pal.crease);

  // 7. Near-Side Articulated Left Arm & Heraldic Shield (if shield class)!
  if (isShieldClass(classId, tier)) {
    drawHeraldicShield(p, pal, tier, isHeavy, cx - 13, torsoY + 2);
  } else {
    const swing = animState === 'walk' ? -Math.round(stride * 0.5) : 0;
    p.line(cx - 6, torsoY + 4, cx - 8 + swing, torsoY + 9, pal.armorMid, 3);
    p.line(cx - 8 + swing, torsoY + 9, cx - 6 + swing, torsoY + 13, pal.armorLight, 3);
    p.line(cx - 5, torsoY + 5, cx - 5, torsoY + 11, pal.crease, 1); // Arm-torso separation crease!
    p.rect(cx - 6 + swing, torsoY + 13, 3, 3, pal.skinMid);
  }

  // 8. Heroic 3/4 Head, Expressive Eyes, Layered Hair & Headgear (drawn cleanly over collar!)
  drawHeroHead(p, pal, classId, templateId, isBoss, tier, cx, headTopY, frame);
}

// ============================================================================
// ANATOMICAL 64x72 MOUNTED HERO RENDERER (WARHORSE, PEGASUS, WYVERN, GRIFFIN)
// ============================================================================

function drawMountedUnit(
  p: PixelCanvas,
  pal: CharacterPalette,
  classId: UnitClassId,
  templateId: string,
  wType: WeaponType,
  isBoss: boolean,
  tier: UnitTier,
  frame: SpriteAnimFrame,
  animState: SpriteAnimState
) {
  const isPeg = isPegasusClass(classId);
  const isWyv = isWyvernClass(classId);
  const isGrif = isGriffinClass(classId);
  const isFlyer = isPeg || isWyv || isGrif;

  const hover = isFlyer ? (frame === 1 ? -2 : frame === 3 ? 1 : 0) : animState === 'walk' && frame % 2 === 1 ? -1 : 0;
  const bodyY = 44 + hover;
  const riderX = 27;
  const riderTorsoY = 23 + hover;
  const riderHeadY = 10 + hover;

  // 1. Tier 3/4 Mythic Back Aura / Sovereign Wings behind Rider
  drawTierBackGrandeur(p, pal, classId, tier, riderX, riderTorsoY, frame, true);

  // 2. Far-Side Flyer Wing (behind rider!)
  if (isFlyer) {
    const flapY = frame === 1 ? -7 : frame === 2 ? -2 : frame === 3 ? 4 : -4;
    if (isWyv) {
      p.triangle(28, bodyY - 4, 42, bodyY - 22 + flapY, 44, bodyY - 9 + flapY, pal.mountDark);
      p.line(28, bodyY - 4, 42, bodyY - 22 + flapY, pal.goldDark, 1);
    } else {
      p.triangle(
        28,
        bodyY - 4,
        42,
        bodyY - 22 + flapY,
        41,
        bodyY - 9 + flapY,
        isGrif ? pal.goldMid : '#cbd5e1'
      );
    }
  }

  // 3. Flowing Rider Cape
  drawFlowingCape(p, pal, classId, tier, isBoss, riderX, riderTorsoY, frame, true);

  // 4. Anatomical Mount Tail, Legs, Muscular Barrel, Arched Neck & Head!
  const tailSway = frame % 2 === 0 ? 0 : 2;
  if (isWyv) {
    // Sinuous Barbed Wyvern Tail!
    p.line(15, bodyY + 2, 6, bodyY + 6 + tailSway, pal.mountMid, 3);
    p.line(6, bodyY + 6 + tailSway, 3, bodyY + 2 + tailSway, pal.mountDark, 2);
    p.triangle(2, bodyY + 1 + tailSway, 5, bodyY + tailSway, 4, bodyY + 5 + tailSway, pal.goldLight);
  } else if (isGrif) {
    // Tufted Lion Tail!
    p.line(15, bodyY + 1, 7, bodyY + 5 + tailSway, pal.mountMid, 2);
    p.ellipse(6, bodyY + 5 + tailSway, 2.5, 2, pal.mountDark);
  } else {
    // Full Flowing Warhorse / Pegasus Tail!
    p.triangle(15, bodyY - 1, 6, bodyY + 4 + tailSway, 9, bodyY + 13, pal.mountMid);
    p.line(14, bodyY, 7, bodyY + 5 + tailSway, pal.mountLight, 1);
  }

  // 4 Articulated Mount Legs (gallop stride in walk / proud stance in idle!)
  const gStride = animState === 'walk' ? (frame === 0 ? 4 : frame === 2 ? -4 : 2) : 0;
  const footBaseY = isFlyer ? bodyY + 16 : 64;

  // Far hind & far foreleg (dark shade for depth!)
  p.line(19, bodyY + 5, 17 - gStride, footBaseY - 2, pal.mountDark, 3);
  p.line(39, bodyY + 5, 43 + gStride, footBaseY - 2, pal.mountDark, 3);

  // Sculpted Mount Hindquarters, Barrel & Muscular Chest!
  p.ellipse(20, bodyY + 2, 7.5, 6, pal.mountMid); // Hindquarters
  p.ellipse(29, bodyY + 2, 9, 5.8, pal.mountMid); // Barrel
  p.ellipse(39, bodyY + 1, 7, 6.2, pal.mountLight); // Muscular chest!
  p.line(17, bodyY + 6, 42, bodyY + 6, pal.mountDark, 2); // Belly shadow

  // Royal Caparison Barding & Saddle Cloth!
  p.triangle(21, bodyY - 4, 35, bodyY - 4, 24, bodyY + 9, pal.capeMid);
  p.line(21, bodyY + 7, 33, bodyY + 6, pal.goldLight, 1);
  if (tier >= 2 || isBoss) {
    // Armored Chest Peytral Barding!
    p.triangle(36, bodyY - 3, 46, bodyY + 1, 39, bodyY + 7, pal.armorMid);
    p.line(37, bodyY - 2, 46, bodyY + 1, pal.goldLight, 1);
  }

  // Near Hind Leg (hock-jointed!) & Near Foreleg!
  p.line(17, bodyY + 4, 14 + gStride, bodyY + 11, pal.mountMid, 3);
  p.line(14 + gStride, bodyY + 11, 16 + gStride, footBaseY, pal.mountLight, 3);
  p.rect(15 + gStride, footBaseY - 1, 4, 2, isWyv || isGrif ? pal.goldMid : pal.outline);

  p.line(40, bodyY + 4, 42 - gStride, bodyY + 11, pal.mountLight, 3);
  p.line(42 - gStride, bodyY + 11, 45 - gStride, footBaseY - (isFlyer ? 2 : 0), pal.mountLight, 3);
  p.rect(44 - gStride, footBaseY - 1 - (isFlyer ? 2 : 0), 4, 2, isWyv || isGrif ? pal.goldLight : pal.outline);

  // Sculpted Mount Neck & Distinct Species Head (x = 41..58)!
  if (isWyv) {
    // Fierce Horned Wyvern Neck & Snapping Jaws!
    p.line(40, bodyY - 1, 48, bodyY - 12, pal.mountMid, 6);
    p.line(42, bodyY - 1, 50, bodyY - 11, pal.goldLight, 1); // Throat scales
    // Horned Dragon Skull
    p.triangle(46, bodyY - 15, 59, bodyY - 11, 48, bodyY - 7, pal.mountLight);
    p.line(46, bodyY - 15, 40, bodyY - 19, pal.goldLight, 2); // Swept dragon horn!
    p.line(49, bodyY - 9, 58, bodyY - 8, pal.mountDark, 2); // Lower jaw
    p.set(52, bodyY - 13, '#fef08a'); // Reptilian eye
    p.set(56, bodyY - 10, '#ffffff'); // Fang!
  } else if (isGrif) {
    // Proud Aquiline Sun-Griffin Neck, Plumed Head & Hooked Golden Beak!
    p.line(40, bodyY - 1, 47, bodyY - 12, '#ffffff', 6);
    p.ellipse(49, bodyY - 13, 5, 4, '#ffffff');
    p.line(45, bodyY - 16, 41, bodyY - 19, pal.goldLight, 2); // Plumed ear tuft
    // Hooked Golden Eagle Beak!
    p.triangle(53, bodyY - 15, 59, bodyY - 12, 53, bodyY - 10, pal.goldLight);
    p.set(58, bodyY - 10, pal.goldMid);
    p.set(51, bodyY - 14, '#dc2626');
  } else {
    // Noble Arched Warhorse / Pegasus Neck, Flowing Mane, Ears & Bridle!
    p.line(39, bodyY - 1, 46, bodyY - 13, pal.mountMid, 6);
    p.line(41, bodyY - 1, 48, bodyY - 12, pal.mountLight, 3);
    // Flowing Mane along back of neck
    p.line(38, bodyY - 4, 45, bodyY - 16, isPeg ? '#ffffff' : pal.goldDark, 2);
    // Tapered Equine Head & Muzzle
    p.triangle(45, bodyY - 16, 57, bodyY - 10, 47, bodyY - 7, pal.mountLight);
    p.rect(54, bodyY - 11, 3, 3, pal.mountMid);
    // Pointed Ears
    p.triangle(46, bodyY - 16, 48, bodyY - 20, 49, bodyY - 16, pal.mountLight);
    // Eye + Golden Bridle & Reins back to rider!
    p.set(50, bodyY - 13, pal.outline);
    p.line(46, bodyY - 14, 55, bodyY - 10, pal.goldMid, 1);
    p.line(53, bodyY - 9, riderX + 6, riderTorsoY + 9, pal.goldDark, 1);
    if (tier >= 2 || isBoss) {
      // Steel/Gold Chamfron Faceplate + Unicorn/Valkyrie Horn on Tier 3+ Pegasus!
      p.line(48, bodyY - 16, 56, bodyY - 11, pal.goldLight, 1);
      if (isPeg && tier >= 3) {
        p.line(50, bodyY - 16, 56, bodyY - 22, '#fef08a', 1);
      }
    }
  }

  // 5. Seated Rider: Armored Thigh & Boot in Stirrup + Sculpted Torso + Weapon + Head!
  // Rider's leg seated over saddle!
  p.line(riderX, riderTorsoY + 13, riderX + 4, bodyY + 1, pal.armorDark, 4);
  p.line(riderX + 4, bodyY + 1, riderX + 2, bodyY + 7, pal.steelMid, 3);
  p.rect(riderX + 1, bodyY + 7, 5, 2, pal.goldMid); // Stirrup!

  // Rider Torso & Pauldrons
  p.rect(riderX - 5, riderTorsoY, 11, 13, pal.armorMid);
  p.rect(riderX - 2, riderTorsoY + 2, 6, 7, pal.armorLight);
  p.rect(riderX - 5, riderTorsoY + 11, 11, 2, pal.crease);
  p.rect(riderX, riderTorsoY + 11, 2, 2, pal.goldLight);
  p.ellipse(riderX - 5, riderTorsoY + 2, 4, 3.5, pal.armorLight);
  p.ellipse(riderX + 5, riderTorsoY + 2, 3.5, 3, pal.armorMid);

  // Rider Weapon Arm & Held Weapon
  const handX = riderX + 9;
  const handY = riderTorsoY + 7;
  p.line(riderX + 4, riderTorsoY + 3, handX, handY, pal.armorMid, 3);
  drawHeldWeapon(p, pal, wType, classId, handX, handY, tier, frame, animState);
  p.rect(handX - 1, handY - 1, 3, 3, pal.goldLight);

  // Near-side Shield for Mounted Cavaliers/Paladins
  if (isShieldClass(classId, tier)) {
    drawHeraldicShield(p, pal, tier, false, riderX - 11, riderTorsoY + 2);
  }

  // Rider Head, Hair & Tiered Crown/Helm
  drawHeroHead(p, pal, classId, templateId, isBoss, tier, riderX, riderHeadY, frame);

  // 6. Near-Side Sweeping Flyer Wing (gracefully framing mount flank!)
  if (isFlyer) {
    const flapY = frame === 1 ? -8 : frame === 2 ? -2 : frame === 3 ? 5 : -4;
    if (isWyv) {
      p.triangle(26, bodyY - 2, 11, bodyY - 22 + flapY, 15, bodyY - 6 + flapY, pal.mountMid);
      p.line(26, bodyY - 2, 11, bodyY - 22 + flapY, pal.goldMid, 2);
      p.line(18, bodyY - 12 + Math.round(flapY * 0.6), 15, bodyY - 4 + flapY, pal.mountDark, 1);
    } else {
      const wCol = isGrif ? '#fef3c7' : '#ffffff';
      const wShade = isGrif ? pal.goldMid : '#bae6fd';
      p.triangle(27, bodyY - 2, 10, bodyY - 23 + flapY, 14, bodyY - 7 + flapY, wCol);
      p.triangle(26, bodyY, 14, bodyY - 7 + flapY, 18, bodyY + 1 + Math.round(flapY * 0.5), wShade);
      p.line(27, bodyY - 2, 10, bodyY - 23 + flapY, pal.goldLight, 1);
    }
  }
}

// ============================================================================
// 96x96 HIGH-RESOLUTION 32-BIT HD-2D BUST PORTRAIT GENERATOR (FIRE EMBLEM / OCTOPATH STYLE)
// ============================================================================

export function renderUnitPortraitBuffer(unit: Unit): string[][] {
  const el = unit.weapon?.element ?? 'NONE';
  const tier: UnitTier = unit.tier ?? (unit.promoted ? 2 : 1);
  const pal = getPaletteForUnit(
    unit.classId,
    unit.templateId,
    unit.faction,
    Boolean(unit.isBoss),
    false,
    el
  );

  // Rich atmospheric radial vignette backdrop with subtle pixel dithering
  const bgOuter = unit.isBoss
    ? '#14081c'
    : unit.faction === 'ENEMY'
    ? '#190910'
    : '#0a1324';
  const bgInner = unit.isBoss
    ? '#3b1348'
    : unit.faction === 'ENEMY'
    ? '#421322'
    : '#1d3863';

  const grid: string[][] = Array.from({ length: PORTRAIT_H }, (_, y) =>
    Array.from({ length: PORTRAIT_W }, (_, x) => {
      const d = Math.hypot(x - 48, y - 38) / 56;
      const bayer = ((x & 1) ^ (y & 1)) * 0.03;
      return mixHex(bgInner, bgOuter, Math.min(1, Math.max(0, d + bayer)));
    })
  );

  const fg = new PixelCanvas(PORTRAIT_W, PORTRAIT_H);
  const cx = 48;
  const female = isFemaleStyledUnit(unit.templateId, unit.classId);
  const fullHelm = isHelmClass(unit.classId) && (tier >= 2 || isHeavyArmorClass(unit.classId));
  const hooded = isHoodClass(unit.classId);
  const lightEye = mixHex(pal.eyeColor, '#ffffff', 0.45);
  const deepSkin = mixHex(pal.skinShade, pal.outline, 0.28);

  // Subtle royal crest halo ring in backdrop for Tier 2+ / Bosses
  if (tier >= 2 || unit.isBoss) {
    const r = tier >= 4 ? 38 : 34;
    for (let deg = 0; deg < 360; deg += 4) {
      const rad = (deg * Math.PI) / 180;
      const rx = Math.round(cx + Math.cos(rad) * r);
      const ry = Math.round(38 + Math.sin(rad) * r);
      if (rx >= 2 && rx < PORTRAIT_W - 2 && ry >= 2 && ry < PORTRAIT_H - 2) {
        grid[ry][rx] =
          deg % 24 === 0 ? pal.goldLight : mixHex(pal.auraMid, bgInner, tier >= 3 ? 0.35 : 0.6);
      }
    }
  }

  // 1. Flowing Back Hair or Deep Cowl Drape behind Neck & Shoulders
  if (hooded) {
    // Full outer & inner hood cowl enveloping head, neck, and collar
    fg.ellipse(cx, 40, 28, 28, pal.capeDark);
    fg.triangle(cx - 32, 72, cx + 32, 72, cx, 16, pal.capeDark);
    fg.ellipse(cx, 42, 21, 22, pal.outline);
  } else if (!fullHelm) {
    if (female || isLightClericClass(unit.classId) || isRobeClass(unit.classId)) {
      fg.ellipse(cx - 2, 48, 26, 28, pal.hairDark);
      fg.ellipse(cx - 3, 46, 23, 24, pal.hairMid);
      // Individual flowing shoulder hair locks
      fg.triangle(cx - 27, 42, cx - 17, 42, cx - 29, 84, pal.hairMid);
      fg.triangle(cx + 16, 44, cx + 25, 44, cx + 27, 82, pal.hairDark);
    } else if (isKatanaClass(unit.classId) || unit.classId === 'ARCHER' || unit.classId === 'SNIPER') {
      // High samurai / archer ponytail sweeping left behind head + nape hair
      fg.ellipse(cx - 2, 46, 21, 16, pal.hairDark);
      fg.triangle(cx - 14, 22, cx - 38, 32, cx - 24, 52, pal.hairDark);
      fg.triangle(cx - 14, 21, cx - 34, 30, cx - 23, 47, pal.hairMid);
      fg.line(cx - 16, 23, cx - 32, 30, pal.hairLight, 2);
    } else {
      // Heroic nape hair volume & spikes framing neck cleanly
      fg.ellipse(cx - 2, 47, 22, 16, pal.hairDark);
      fg.triangle(cx - 23, 40, cx - 14, 50, cx - 26, 58, pal.hairDark);
      fg.triangle(cx + 15, 42, cx + 22, 50, cx + 24, 58, pal.hairDark);
    }
  }

  // 2. Sculpted Heroic Bust: Flowing Mantle, Cuirass/Robes, Pauldrons & Clasp (y = 65..95)
  fg.triangle(cx - 44, 95, cx + 44, 95, cx, 62, pal.capeDark);
  fg.triangle(cx - 40, 95, cx + 40, 95, cx, 65, pal.capeMid);
  // Lit cape lapel folds
  fg.triangle(cx - 38, 95, cx - 23, 95, cx - 13, 69, pal.capeLight);
  fg.line(cx - 23, 95, cx - 12, 69, pal.goldMid, 2);
  fg.line(cx + 22, 95, cx + 12, 69, pal.goldDark, 2);

  // Inner Breastplate / Vestments
  fg.rect(cx - 21, 70, 42, 26, pal.armorDark);
  fg.rect(cx - 18, 71, 36, 25, pal.armorMid);
  fg.triangle(cx - 13, 73, cx + 15, 73, cx + 2, 95, pal.armorLight);
  fg.line(cx + 2, 74, cx + 2, 94, '#ffffff', 1);

  // Beveled Left & Right Pauldrons with Gold Trim
  fg.ellipse(cx - 28, 81, 14, 10, pal.armorMid);
  fg.ellipse(cx - 27, 79, 11, 7, pal.armorLight);
  fg.line(cx - 40, 82, cx - 16, 84, pal.goldLight, 2);

  fg.ellipse(cx + 28, 82, 13, 9.5, pal.armorDark);
  fg.ellipse(cx + 27, 80, 10, 6.5, pal.armorMid);
  fg.line(cx + 16, 84, cx + 39, 82, pal.goldMid, 2);

  // High Gorget Collar & Gemmed Cloak Brooch!
  fg.rect(cx - 13, 65, 26, 7, pal.armorDark);
  fg.line(cx - 13, 65, cx + 13, 65, pal.goldLight, 2);
  fg.ellipse(cx + 1, 73, 5, 5, pal.goldLight);
  fg.ellipse(cx + 1, 73, 3, 3, pal.magicGlow);
  fg.set(cx, 72, '#ffffff');

  // 3. Sturdy Anatomical Neck & Cast Chin Shadow (y = 57..66)
  fg.rect(cx - 8, 57, 16, 9, pal.skinMid);
  fg.rect(cx - 8, 57, 6, 9, pal.skinShade);
  fg.triangle(cx - 8, 57, cx + 8, 57, cx + 1, 63, deepSkin);

  if (fullHelm) {
    // High-Detail Close-Up Knight / Dragoon Greathelm Portrait!
    fg.ellipse(cx, 39, 21, 22, pal.armorDark);
    fg.ellipse(cx + 1, 38, 19, 20, pal.armorMid);
    fg.ellipse(cx + 2, 27, 13, 8, pal.armorLight);
    // Golden brow band & nasal guard
    fg.line(cx - 18, 37, cx + 19, 37, pal.goldMid, 3);
    fg.line(cx - 17, 36, cx + 18, 36, pal.goldLight, 1);
    // Dark T-Visor + Glowing Fierce Eyes
    fg.rect(cx - 11, 40, 25, 5, pal.outline);
    fg.rect(cx + 2, 40, 4, 16, pal.outline);
    fg.rect(cx - 7, 41, 4, 3, unit.isBoss ? '#ef4444' : pal.auraLight);
    fg.set(cx - 6, 41, '#ffffff');
    fg.rect(cx + 9, 41, 4, 3, unit.isBoss ? '#ef4444' : pal.auraLight);
    fg.set(cx + 10, 41, '#ffffff');
    // Sweeping Helm Plume
    fg.triangle(cx - 4, 16, cx + 9, 5, cx - 26, 27, pal.capeMid);
    fg.line(cx - 2, 15, cx + 9, 5, pal.capeLight, 2);
    fg.rect(cx - 3, 15, 7, 4, pal.goldLight);
  } else {
    // 4. Smooth Sculpted 96x96 3/4 Anime-RPG Head, Rounded Cheeks & Tapered Chin!
    // Overlapping cranium + cheek + chin ellipses create an organic, step-free contour
    fg.ellipse(cx, 36, 19.5, 16.5, pal.skinMid);
    fg.ellipse(cx + 1, 45, 16.5, 12.5, pal.skinMid);
    fg.ellipse(cx + 1.5, 53, 10.5, 6.5, pal.skinMid);
    fg.ellipse(cx + 2, 57, 5.5, 3, pal.skinMid);

    // Forehead & cheek key lighting
    fg.ellipse(cx + 3, 32, 12, 9, pal.skinLight);
    fg.ellipse(cx - 7, 45, 5, 4, pal.skinLight);
    fg.ellipse(cx + 9, 45, 4, 3.5, pal.skinLight);

    // Left temple & jaw contour shading + sculpted left ear
    fg.ellipse(cx - 16, 42, 3.5, 8, pal.skinShade);
    fg.ellipse(cx - 20, 41, 3, 5.5, pal.skinMid);
    fg.line(cx - 20, 39, cx - 20, 43, pal.skinShade, 1);

    // 5. Expressive Almond-Shaped 32-Bit Anime Eyes!
    // Near Eye (left of center: cx - 11 .. cx - 3, y = 38..44)
    fg.rect(cx - 10, 39, 7, 6, '#ffffff');
    fg.rect(cx - 9, 39, 5, 6, pal.eyeColor);
    fg.rect(cx - 9, 39, 5, 2, pal.hairDark);
    fg.line(cx - 8, 44, cx - 5, 44, lightEye, 1);
    fg.rect(cx - 7, 40, 2, 3, pal.outline);
    fg.rect(cx - 9, 39, 2, 2, '#ffffff');
    fg.set(cx - 5, 43, '#ffffff');
    fg.line(cx - 12, 39, cx - 10, 38, pal.outline, 1);
    fg.line(cx - 10, 38, cx - 3, 38, pal.outline, 2);
    fg.line(cx - 11, 35, cx - 3, 36, pal.hairDark, 2);

    // Far Eye (right of center: cx + 5 .. cx + 12, y = 38..44)
    fg.rect(cx + 6, 39, 6, 6, '#ffffff');
    fg.rect(cx + 7, 39, 4, 6, pal.eyeColor);
    fg.rect(cx + 7, 39, 4, 2, pal.hairDark);
    fg.line(cx + 7, 44, cx + 10, 44, lightEye, 1);
    fg.rect(cx + 8, 40, 2, 3, pal.outline);
    fg.rect(cx + 7, 39, 2, 2, '#ffffff');
    fg.line(cx + 6, 38, cx + 12, 38, pal.outline, 2);
    fg.line(cx + 6, 36, cx + 12, 35, pal.hairDark, 2);

    // Sculpted 3/4 Nose Bridge & Mouth!
    fg.line(cx + 2, 41, cx + 3, 47, pal.skinLight, 1);
    fg.line(cx + 3, 47, cx + 1, 48, pal.skinShade, 1);
    if (
      hooded &&
      (isNinjaClass(unit.classId) ||
        unit.classId === 'ASSASSIN' ||
        unit.classId === 'WHISPER' ||
        unit.classId === 'PHANTOM_REAPER')
    ) {
      // Sleek Assassin / Ninja Faceplate Mask!
      fg.triangle(cx - 17, 47, cx + 17, 47, cx + 2, 60, pal.armorDark);
      fg.triangle(cx - 15, 48, cx + 15, 48, cx + 2, 59, pal.armorMid);
      fg.line(cx - 16, 47, cx + 16, 47, pal.goldMid, 1);
    } else {
      if (female) {
        fg.ellipse(cx - 10, 46, 3, 1.5, '#fda4af');
        fg.ellipse(cx + 10, 46, 2.5, 1.5, '#fda4af');
      }
      fg.line(cx - 2, 52, cx + 5, 52, deepSkin, 1);
      fg.set(cx + 5, 51, pal.skinShade);
      fg.line(cx - 1, 53, cx + 3, 53, pal.skinLight, 1);
    }

    // 6. Multi-Lock Layered Anime Hair, Specular Angel-Ring & Class Headgear!
    if (hooded) {
      // Deep Mysterious Mage / Ranger / Assassin Cowl Arching Over Brow!
      fg.ellipse(cx, 25, 25, 16, pal.capeDark);
      fg.ellipse(cx + 1, 23, 22, 13, pal.capeMid);
      // Pointed hood peak & side cowl drapes framing cheeks down to shoulders
      fg.triangle(cx - 14, 15, cx + 14, 15, cx - 2, 5, pal.capeMid);
      fg.triangle(cx - 26, 26, cx - 15, 65, cx - 13, 24, pal.capeMid);
      fg.triangle(cx + 25, 26, cx + 16, 65, cx + 14, 24, pal.capeDark);
      // Golden rune trim along hood brow edge
      fg.line(cx - 17, 27, cx + 1, 23, pal.goldMid, 2);
      fg.line(cx + 1, 23, cx + 18, 27, pal.goldMid, 2);
      fg.ellipse(cx + 1, 23, 2.2, 2.2, pal.magicGlow);
    } else {
      // Full layered hair dome
      fg.ellipse(cx, 23, 22, 12, pal.hairDark);
      fg.ellipse(cx, 22, 20.5, 10.5, pal.hairMid);
      // Specular hair angel-ring shine across crown!
      fg.line(cx - 13, 18, cx + 12, 18, pal.hairLight, 2);
      fg.line(cx - 9, 16, cx + 8, 16, '#ffffff', 1);

      // Swept multi-lock forehead bangs
      fg.triangle(cx - 19, 21, cx - 9, 21, cx - 14, 37, pal.hairMid);
      fg.triangle(cx - 10, 20, cx - 1, 20, cx - 5, 38, pal.hairMid);
      fg.line(cx - 7, 22, cx - 5, 35, pal.hairLight, 1);
      fg.triangle(cx - 1, 20, cx + 8, 20, cx + 3, 37, pal.hairMid);
      fg.line(cx + 3, 22, cx + 3, 34, pal.hairLight, 1);
      fg.triangle(cx + 7, 21, cx + 17, 22, cx + 13, 37, pal.hairDark);

      // Graceful tapered cheek sidelocks on both sides
      fg.triangle(cx - 21, 24, cx - 15, 24, cx - 18, 54, pal.hairMid);
      fg.triangle(cx + 15, 24, cx + 20, 26, cx + 18, 52, pal.hairDark);

      // Class Hats, Mitres, Kabuto & Royal Crowns!
      if (
        unit.classId === 'MAGE' ||
        unit.classId === 'SAGE' ||
        isChronoClass(unit.classId)
      ) {
        fg.line(cx - 26, 20, cx + 26, 21, pal.armorDark, 4);
        fg.line(cx - 24, 20, cx + 24, 21, pal.goldMid, 1);
        fg.triangle(cx - 16, 20, cx + 16, 20, cx - 8, 3, pal.armorMid);
        fg.line(cx - 4, 18, cx - 8, 3, pal.armorLight, 2);
      } else if (isSamuraiClass(unit.classId) && tier >= 2) {
        fg.line(cx - 15, 19, cx + 15, 19, pal.goldMid, 2);
        fg.line(cx + 1, 19, cx - 10, 7, pal.goldLight, 2);
        fg.line(cx + 1, 19, cx + 13, 7, pal.goldLight, 2);
      } else if (
        unit.classId === 'LORD' ||
        unit.classId === 'GREAT_LORD' ||
        unit.classId === 'SOVEREIGN' ||
        unit.classId === 'EMPEROR_LORD' ||
        tier >= 2 ||
        unit.isBoss
      ) {
        fg.line(cx - 14, 19, cx + 14, 19, pal.goldMid, 3);
        fg.line(cx - 13, 18, cx + 13, 18, pal.goldLight, 1);
        fg.triangle(cx - 4, 18, cx + 5, 18, cx + 1, 8, pal.goldLight);
        fg.triangle(cx - 13, 18, cx - 8, 18, cx - 11, 11, pal.goldMid);
        fg.triangle(cx + 9, 18, cx + 14, 18, cx + 12, 11, pal.goldMid);
        fg.ellipse(cx + 1, 17, 2, 2, pal.magicGlow);
      }
    }
  }

  fg.addSelectiveOutline(pal.outline);

  for (let y = 0; y < PORTRAIT_H; y++) {
    for (let x = 0; x < PORTRAIT_W; x++) {
      const px = fg.buf[y][x];
      if (px) grid[y][x] = px;
    }
  }
  return grid;
}

// ============================================================================
// PURE BUFFER RASTERIZER (WORKS IN BOTH BROWSER CANVAS & NODE UNIT TESTS!)
// ============================================================================

export function renderUnitFrameBuffer(
  unit: Unit,
  pal?: CharacterPalette,
  frame: SpriteAnimFrame = 0,
  animState: SpriteAnimState = 'idle'
): (string | null)[][] {
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

  if (isMountedClass(unit.classId)) {
    drawMountedUnit(
      p,
      resolvedPal,
      unit.classId,
      unit.templateId,
      wType,
      Boolean(unit.isBoss),
      tier,
      frame,
      animState
    );
  } else {
    drawFootUnit(
      p,
      resolvedPal,
      unit.classId,
      unit.templateId,
      wType,
      Boolean(unit.isBoss),
      tier,
      frame,
      animState
    );
  }

  p.addSelectiveOutline(resolvedPal.outline);
  return p.buf;
}

/**
 * Pure diagnostic helper for automated verification: measures filled pixel area,
 * bounding box width/height, and unique color richness for any unit sprite.
 */
export function measureSpriteSilhouette(unit: Unit): {
  filledPixels: number;
  bboxWidth: number;
  bboxHeight: number;
  uniqueColors: number;
} {
  const buf = renderUnitFrameBuffer(unit, undefined, 0, 'idle');
  let filledPixels = 0;
  let minX = SPRITE_W;
  let maxX = -1;
  let minY = SPRITE_H;
  let maxY = -1;
  const colors = new Set<string>();

  for (let y = 0; y < SPRITE_H; y++) {
    for (let x = 0; x < SPRITE_W; x++) {
      const c = buf[y][x];
      if (!c) continue;
      filledPixels++;
      colors.add(c);
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
    uniqueColors: colors.size,
  };
}

// ============================================================================
// CACHED BROWSER CANVAS SPRITE SHEETS, FRAMES & PORTRAIT DATA-URLS
// ============================================================================

const spriteSheetCache = new Map<string, UnitSpriteSheet>();
const spriteCache = new Map<string, HTMLCanvasElement>();
const previewUrlCache = new Map<string, string>();
const portraitUrlCache = new Map<string, string>();

export function getUnitSpriteSheet(unit: Unit, flashWhite = false): UnitSpriteSheet {
  const el = unit.weapon?.element ?? 'NONE';
  const wType = unit.weapon?.type ?? 'SWORD';
  const tier: UnitTier = unit.tier ?? (unit.promoted ? 2 : 1);
  const key = `sheet64_${unit.classId}_${unit.templateId}_${unit.faction}_${wType}_${el}_${tier}_${
    unit.isBoss ? 1 : 0
  }_${unit.acted ? 1 : 0}_${flashWhite ? 1 : 0}`;

  const existing = spriteSheetCache.get(key);
  if (existing) return existing;

  const pal = getPaletteForUnit(
    unit.classId,
    unit.templateId,
    unit.faction,
    Boolean(unit.isBoss),
    unit.acted,
    el
  );

  const canvas = document.createElement('canvas');
  canvas.width = SPRITE_W * SPRITE_SHEET_COLS;
  canvas.height = SPRITE_H * SPRITE_SHEET_ROWS;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const rowStates: SpriteAnimState[] = ['idle', 'selected', 'walk'];
  for (let row = 0; row < SPRITE_SHEET_ROWS; row++) {
    const animState = rowStates[row];
    for (let col = 0; col < SPRITE_SHEET_COLS; col++) {
      const buf = renderUnitFrameBuffer(unit, pal, col as SpriteAnimFrame, animState);
      const ox = col * SPRITE_W;
      const oy = row * SPRITE_H;
      for (let y = 0; y < SPRITE_H; y++) {
        for (let x = 0; x < SPRITE_W; x++) {
          const colHex = buf[y][x];
          if (!colHex) continue;
          ctx.fillStyle = flashWhite ? '#ffffff' : colHex;
          ctx.fillRect(ox + x, oy + y, 1, 1);
        }
      }
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
  const key = `c64_${unit.classId}_${unit.templateId}_${unit.faction}_${wType}_${el}_${tier}_${
    unit.isBoss ? 1 : 0
  }_${unit.acted ? 1 : 0}_${animState}_${frame}_${flashWhite ? 1 : 0}`;

  const existing = spriteCache.get(key);
  if (existing) return existing;

  const sheet = getUnitSpriteSheet(unit, flashWhite);
  const row = animState === 'walk' ? 2 : animState === 'selected' ? 1 : 0;
  const canvas = document.createElement('canvas');
  canvas.width = SPRITE_W;
  canvas.height = SPRITE_H;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    sheet.canvas,
    frame * SPRITE_W,
    row * SPRITE_H,
    SPRITE_W,
    SPRITE_H,
    0,
    0,
    SPRITE_W,
    SPRITE_H
  );

  spriteCache.set(key, canvas);
  return canvas;
}

export function getUnitSpriteDataUrl(unit: Unit, frame: 0 | 1 = 0): string {
  if (typeof document === 'undefined') return '';
  const el = unit.weapon?.element ?? 'NONE';
  const tier: UnitTier = unit.tier ?? (unit.promoted ? 2 : 1);
  const key = `url64_${unit.classId}_${unit.templateId}_${unit.faction}_${unit.weapon?.type}_${el}_${tier}_${
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
  const key = `port96_${unit.classId}_${unit.templateId}_${unit.faction}_${el}_${tier}_${
    unit.isBoss ? 1 : 0
  }`;
  const existing = portraitUrlCache.get(key);
  if (existing) return existing;

  const grid = renderUnitPortraitBuffer(unit);
  const canvas = document.createElement('canvas');
  canvas.width = PORTRAIT_W;
  canvas.height = PORTRAIT_H;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < PORTRAIT_H; y++) {
    for (let x = 0; x < PORTRAIT_W; x++) {
      ctx.fillStyle = grid[y][x];
      ctx.fillRect(x, y, 1, 1);
    }
  }
  const url = canvas.toDataURL('image/png');
  portraitUrlCache.set(key, url);
  return url;
}
