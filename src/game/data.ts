import { ITEMS, STARTING_ITEM_BAG } from './catalogItems';
import {
  evaluateUnlockedTitles,
  getUnitTitleBonuses,
  STARTER_TITLE_IDS,
  TITLE_LIST,
  TITLE_RARITY_META,
  TITLES,
} from './catalogTitles';
import { WEAPONS } from './catalogWeapons';
import {
  ARMOR_SLOT_META,
  ARMOR_SLOTS,
  ARMOR_TEMPLATE_LIST,
  ARMOR_TEMPLATES,
  computeArmorInstanceBonuses,
  computeWeaponForgeBonuses,
  createDefaultWeaponForge,
  createEquipmentInstance,
  createStarterEquipmentBag,
  EQUIPMENT_RARITY_META,
  fuseArmorInstances,
  fuseWeaponForge,
  GEM_LIST,
  GEMS,
  getFusionCost,
  getLevelUpEquipmentCost,
  getMaxSocketsForRarity,
  getNextRarity,
  getTemperCost,
  getUnitEquipmentBonuses,
  levelUpArmorInstance,
  levelUpWeaponForge,
  MAX_EQUIPMENT_LEVEL,
  MAX_TEMPER_LEVEL,
  RARITY_ORDER,
  socketGemIntoArmor,
  socketGemIntoWeapon,
  temperArmorInstance,
  temperWeaponForge,
  unsocketGemFromArmor,
  unsocketGemFromWeapon,
} from './equipmentSystem';
import type {
  ArmorSlot,
  ClassPromotionDef,
  EquipmentInstance,
  MagicElement,
  MoveType,
  SavedHeroProgress,
  SkillDef,
  SkillId,
  TerrainInfo,
  TerrainType,
  Unit,
  UnitClassId,
  UnitTier,
  Weapon,
  WeaponForgeState,
  WeaponType,
  WeatherInfo,
  WeatherType,
} from './types';

export { ITEMS, STARTING_ITEM_BAG } from './catalogItems';
export { WEAPONS } from './catalogWeapons';
export { getItemSellPrice, getShopStock, getWeaponSellPrice } from './catalogShops';
export {
  evaluateUnlockedTitles,
  getUnitTitleBonuses,
  STARTER_TITLE_IDS,
  TITLE_LIST,
  TITLE_RARITY_META,
  TITLES,
};
export {
  ARMOR_SLOT_META,
  ARMOR_SLOTS,
  ARMOR_TEMPLATE_LIST,
  ARMOR_TEMPLATES,
  computeArmorInstanceBonuses,
  computeWeaponForgeBonuses,
  createDefaultWeaponForge,
  createEquipmentInstance,
  createStarterEquipmentBag,
  EQUIPMENT_RARITY_META,
  fuseArmorInstances,
  fuseWeaponForge,
  GEM_LIST,
  GEMS,
  getFusionCost,
  getLevelUpEquipmentCost,
  getMaxSocketsForRarity,
  getNextRarity,
  getTemperCost,
  getUnitEquipmentBonuses,
  levelUpArmorInstance,
  levelUpWeaponForge,
  MAX_EQUIPMENT_LEVEL,
  MAX_TEMPER_LEVEL,
  RARITY_ORDER,
  socketGemIntoArmor,
  socketGemIntoWeapon,
  temperArmorInstance,
  temperWeaponForge,
  unsocketGemFromArmor,
  unsocketGemFromWeapon,
};

export const WEATHER_DATA: Record<WeatherType, WeatherInfo> = {
  NONE: {
    id: 'NONE',
    name: 'Trời Quang Đãng',
    shortEffect: 'Không biến động thời tiết',
    description: 'Bầu trời trong xanh ổn định, mọi binh chủng và phép thuật phát huy đúng thực lực.',
    accentColor: '#94a3b8',
    badgeBg: 'rgba(30, 41, 59, 0.85)',
  },
  SUNLIGHT: {
    id: 'SUNLIGHT',
    name: 'Nắng Gắt Bình Minh',
    shortEffect: 'Hỏa & Quang +18% ST · Hồi máu +15%',
    description: 'Ánh dương chói lọi cường hóa phép Hỏa, Quang Minh và tăng hiệu quả Trượng trị thương.',
    accentColor: '#fbbf24',
    badgeBg: 'rgba(120, 53, 15, 0.78)',
    elementDamageBonus: { FIRE: 0.18, LIGHT: 0.18, DARK: -0.1 },
    healMod: 0.15,
  },
  LEAVES: {
    id: 'LEAVES',
    name: 'Gió Thu Lá Rơi',
    shortEffect: 'Phong +15% ST · +8% Né toàn quân',
    description: 'Làn gió mùa thu cuốn lá vàng tiếp thêm lực cho Phong thuật và gia tăng độ linh hoạt khi né đòn.',
    accentColor: '#a3e635',
    badgeBg: 'rgba(54, 83, 20, 0.78)',
    elementDamageBonus: { WIND: 0.15 },
    allAvoidMod: 8,
  },
  RAIN: {
    id: 'RAIN',
    name: 'Mưa Rào Nặng Hạt',
    shortEffect: 'Lôi +20% ST · Hỏa -15% · Cung -10% CX',
    description: 'Cơn mưa tầm tã làm ẩm dây cung và dập lửa, nhưng dẫn điện khiến Lôi pháp bùng nổ sát thương.',
    accentColor: '#60a5fa',
    badgeBg: 'rgba(30, 58, 138, 0.82)',
    elementDamageBonus: { THUNDER: 0.2, FIRE: -0.15 },
    bowHitMod: -10,
  },
  STORM: {
    id: 'STORM',
    name: 'Bão Sấm Sét',
    shortEffect: 'Lôi +30% ST · +10% CM · Cung -15% CX',
    description: 'Sấm chớp rạch ngang chiến trường! Lôi thuật cuồng bạo, tỷ lệ chí mạng tăng vọt nhưng xạ thủ khó ngắm.',
    accentColor: '#38bdf8',
    badgeBg: 'rgba(12, 74, 110, 0.86)',
    elementDamageBonus: { THUNDER: 0.3, WIND: 0.15, FIRE: -0.2 },
    bowHitMod: -15,
    allCritMod: 10,
  },
  MIST: {
    id: 'MIST',
    name: 'Sương Mù U Tịch',
    shortEffect: 'Ám +15% ST · +14% Né · -10% CX',
    description: 'Màn sương dày đặc che khuất tầm nhìn, tăng mạnh Né tránh và cường hóa Ma thuật Bóng Tối.',
    accentColor: '#cbd5e1',
    badgeBg: 'rgba(51, 65, 85, 0.85)',
    elementDamageBonus: { DARK: 0.15, LIGHT: -0.1 },
    allAvoidMod: 14,
    allHitMod: -10,
  },
  SAND: {
    id: 'SAND',
    name: 'Bão Cát Sa Mạc',
    shortEffect: 'Cận chiến +2 ST · Cung -12% CX · -6% CX',
    description: 'Gió cát mù mịt khiến tầm ngắm giảm mạnh nhưng kích thích chiến ý mãnh liệt ở cự ly gần.',
    accentColor: '#f59e0b',
    badgeBg: 'rgba(113, 63, 18, 0.82)',
    meleeDamageBonus: 2,
    bowHitMod: -12,
    allHitMod: -6,
  },
  SNOW: {
    id: 'SNOW',
    name: 'Bão Tuyết Băng Giá',
    shortEffect: 'Băng +25% ST · Hỏa -15% · +8% Né',
    description: 'Tuyết trắng phủ kín chiến trường, gia tăng uy lực Băng thuật và làm chệch đường đánh kẻ thù.',
    accentColor: '#e0f2fe',
    badgeBg: 'rgba(14, 116, 144, 0.8)',
    elementDamageBonus: { ICE: 0.25, FIRE: -0.15 },
    allAvoidMod: 8,
  },
  EMBERS: {
    id: 'EMBERS',
    name: 'Mưa Tro Hỏa Ngục',
    shortEffect: 'Hỏa +25% ST · Cận chiến +2 ST · Băng -15%',
    description: 'Tàn tro núi lửa rực hồng đốt cháy bầu không khí, cường hóa Hỏa thuật và mọi đòn cận chiến.',
    accentColor: '#fb923c',
    badgeBg: 'rgba(124, 45, 18, 0.85)',
    elementDamageBonus: { FIRE: 0.25, ICE: -0.15 },
    meleeDamageBonus: 2,
  },
  SPARKS: {
    id: 'SPARKS',
    name: 'Bão Ma Lực Huyết Ấn',
    shortEffect: 'Phép +3 ST · +12% CM · Ám/Quang +15%',
    description: 'Dòng ma lực cổ xưa tràn ngập không trung, đẩy sát thương phép và chí mạng lên đỉnh điểm.',
    accentColor: '#e879f9',
    badgeBg: 'rgba(88, 28, 135, 0.85)',
    elementDamageBonus: { DARK: 0.15, LIGHT: 0.15 },
    magicDamageBonus: 3,
    allCritMod: 12,
  },
};

const WEATHER_CYCLES: Record<WeatherType, WeatherType[]> = {
  NONE: ['SUNLIGHT', 'LEAVES', 'RAIN'],
  SUNLIGHT: ['SUNLIGHT', 'LEAVES', 'RAIN'],
  LEAVES: ['LEAVES', 'RAIN', 'SUNLIGHT'],
  RAIN: ['RAIN', 'STORM', 'MIST'],
  STORM: ['STORM', 'RAIN', 'MIST'],
  MIST: ['MIST', 'RAIN', 'SPARKS'],
  SAND: ['SAND', 'SUNLIGHT', 'EMBERS'],
  SNOW: ['SNOW', 'MIST', 'STORM'],
  EMBERS: ['EMBERS', 'SPARKS', 'SAND'],
  SPARKS: ['SPARKS', 'STORM', 'EMBERS'],
};

/**
 * Dynamic battlefield weather cycle: starts with the chapter's signature weather on Turns 1-3,
 * then smoothly shifts every 3 turns through a biome-coherent weather progression!
 */
export function getWeatherForTurn(baseWeather: WeatherType, turn: number): WeatherType {
  const cycle = WEATHER_CYCLES[baseWeather] ?? WEATHER_CYCLES.LEAVES;
  const idx = Math.floor(Math.max(0, turn - 1) / 3) % cycle.length;
  return cycle[idx];
}

export function getTurnsUntilWeatherShift(turn: number): number {
  const rem = turn % 3;
  return rem === 0 ? 1 : 4 - rem;
}

export const PORTRAIT_ASSETS: Record<string, string> = {
  kaelen: '/src/assets/images/portrait_kaelen_1795539961339.jpg',
  lyra: '/src/assets/images/portrait_lyra_1795539960713.jpg',
  soren: '/src/assets/images/portrait_soren_1795539959913.jpg',
  malakor: '/src/assets/images/portrait_malakor_1795539960277.jpg',
};

export const TITLE_BG_ASSET = '/src/assets/images/title_bg_1795539959897.jpg';

export const BATTLE_STAGE_ASSETS = {
  plains: '/src/assets/images/battle_stage_plains_1795541562938.jpg',
  citadel: '/src/assets/images/battle_stage_citadel_1795541564542.jpg',
};

export const MAGIC_ELEMENT_LABEL: Record<MagicElement, string> = {
  NONE: 'Vật Lý',
  FIRE: 'Hỏa',
  THUNDER: 'Lôi',
  WIND: 'Phong',
  ICE: 'Băng',
  LIGHT: 'Quang',
  DARK: 'Ám',
};

export const WEAPON_TYPE_LABEL: Record<WeaponType, string> = {
  SWORD: 'Kiếm',
  LANCE: 'Thương',
  AXE: 'Rìu',
  BOW: 'Cung',
  TOME: 'Pháp Điển',
  STAFF: 'Trượng',
};

export const SKILLS: Record<SkillId, SkillDef> = {
  // === ACTIVE COMBAT ARTS (TUYỆT KỸ) ===
  LUNA_STRIKE: {
    id: 'LUNA_STRIKE',
    name: 'Nguyệt Trảm',
    kind: 'ACTIVE',
    shortDesc: 'Xuyên 50% giáp, +4 ST',
    detailDesc: 'Tuyệt kỹ chém xuyên 50% DEF/RES mục tiêu, tăng +4 sát thương và +10% chính xác.',
    accentColor: '#38bdf8',
    spCost: 35,
    damageBonus: 4,
    hitBonus: 10,
    ignoreDefenseRatio: 0.5,
  },
  SOL_STRIKE: {
    id: 'SOL_STRIKE',
    name: 'Thái Dương Kích',
    kind: 'ACTIVE',
    shortDesc: 'Hút 50% ST thành HP, +3 ST',
    detailDesc: 'Đòn đánh rực sáng hồi lại 50% sát thương gây ra thành HP cho bản thân.',
    accentColor: '#fbbf24',
    spCost: 35,
    damageBonus: 3,
    hitBonus: 10,
    drainRatio: 0.5,
  },
  ASTRA_FLURRY: {
    id: 'ASTRA_FLURRY',
    name: 'Tinh Hà Ngũ Trảm',
    kind: 'ACTIVE',
    shortDesc: 'ST ×1.45, +20% Chí mạng',
    detailDesc: 'Liên hoàn kiếm khí chớp nhoáng, nhân 1.45 lần sát thương và tăng 20% tỷ lệ chí mạng.',
    accentColor: '#f43f5e',
    spCost: 45,
    damageMultiplier: 1.45,
    critBonus: 20,
    hitBonus: 10,
  },
  IGNIS_BURST: {
    id: 'IGNIS_BURST',
    name: 'Hỏa Ngục Bộc Phá',
    kind: 'ACTIVE',
    shortDesc: 'Cộng 50% DEF/MAG vào ST',
    detailDesc: 'Kết hợp nội lực phòng thủ hoặc ma lực, cộng thêm 50% giá trị cao hơn giữa DEF/MAG vào sát thương.',
    accentColor: '#fb923c',
    spCost: 35,
    scaleByStat: 'def',
    scaleRatio: 0.5,
    hitBonus: 10,
  },
  DEADEYE_SHOT: {
    id: 'DEADEYE_SHOT',
    name: 'Bắn Tỉa Xuyên Giáp',
    kind: 'ACTIVE',
    shortDesc: '+35% CX, +25% CM, +1 Tầm',
    detailDesc: 'Mũi tên thần chuẩn xác tăng thêm +1 tầm bắn, +35% chính xác và +25% chí mạng.',
    accentColor: '#84cc16',
    spCost: 35,
    damageBonus: 3,
    hitBonus: 35,
    critBonus: 25,
    rangeBonus: 1,
  },
  DRAGON_FANG: {
    id: 'DRAGON_FANG',
    name: 'Long Nha Xung Kích',
    kind: 'ACTIVE',
    shortDesc: 'ST ×1.4, Xuyên 25% giáp',
    detailDesc: 'Đòn lao bổ từ không trung mang uy lực rồng cổ đại, nhân 1.4 sát thương và xuyên 25% giáp.',
    accentColor: '#10b981',
    spCost: 40,
    damageMultiplier: 1.4,
    ignoreDefenseRatio: 0.25,
    hitBonus: 12,
  },
  LETHALITY_STRIKE: {
    id: 'LETHALITY_STRIKE',
    name: 'Ảnh Sát Chí Tử',
    kind: 'ACTIVE',
    shortDesc: '+45% Chí mạng, +5 ST',
    detailDesc: 'Đòn ám sát chí mạng nhằm vào tử huyệt, tăng +45% chí mạng và +5 sát thương.',
    accentColor: '#a855f7',
    spCost: 40,
    damageBonus: 5,
    critBonus: 45,
    hitBonus: 15,
  },
  SANCTUARY_AURA: {
    id: 'SANCTUARY_AURA',
    name: 'Hào Quang Cứu Rỗi',
    kind: 'ACTIVE',
    shortDesc: 'Hồi HP tất cả đồng minh lân cận',
    detailDesc: 'Triệu hồi thánh quang chữa lành cho toàn bộ đồng minh trong phạm vi 2 ô.',
    accentColor: '#fde047',
    spCost: 40,
    aoeHeal: true,
  },
  VOID_COLLAPSE: {
    id: 'VOID_COLLAPSE',
    name: 'Hư Không Diệt Thế',
    kind: 'ACTIVE',
    shortDesc: 'Xuyên 60% RES, Hút 35% HP',
    detailDesc: 'Cấm thuật hắc ám xé toạc kháng phép mục tiêu và hấp thụ sinh lực.',
    accentColor: '#c084fc',
    spCost: 45,
    damageBonus: 5,
    ignoreDefenseRatio: 0.6,
    drainRatio: 0.35,
    hitBonus: 15,
  },

  // === PASSIVE SKILLS (NỘI TẠI) ===
  ROYAL_CHARM: {
    id: 'ROYAL_CHARM',
    name: 'Uy Nghi Hoàng Tộc',
    kind: 'PASSIVE',
    shortDesc: '+10% CX & +10% Né khi giao tranh',
    detailDesc: 'Khí chất lãnh chúa tăng +10% chính xác và +10% né tránh trong mọi trận giao tranh.',
    accentColor: '#60a5fa',
  },
  VANTAGE: {
    id: 'VANTAGE',
    name: 'Phản Kích Tiên Phong',
    kind: 'PASSIVE',
    shortDesc: 'HP < 50% luôn phản đòn trước',
    detailDesc: 'Khi bị tấn công lúc HP dưới 50%, đơn vị này sẽ ra đòn phản công trước kẻ địch.',
    accentColor: '#f43f5e',
  },
  WRATH: {
    id: 'WRATH',
    name: 'Cuồng Nộ',
    kind: 'PASSIVE',
    shortDesc: 'HP < 50% tăng +30% Chí mạng',
    detailDesc: 'Khi máu xuống dưới 50%, sát khí bùng nổ cộng thẳng +30% tỷ lệ chí mạng.',
    accentColor: '#ef4444',
  },
  PAVISE: {
    id: 'PAVISE',
    name: 'Khiên Bất Khuất',
    kind: 'PASSIVE',
    shortDesc: 'Giảm 20% sát thương vật lý',
    detailDesc: 'Giáp nặng tinh luyện giúp giảm 20% mọi sát thương vật lý nhận vào.',
    accentColor: '#94a3b8',
  },
  AEGIS: {
    id: 'AEGIS',
    name: 'Hộ Pháp Ma Lực',
    kind: 'PASSIVE',
    shortDesc: 'Giảm 25% sát thương phép thuật',
    detailDesc: 'Kết giới ma pháp tự nhiên giảm 25% sát thương từ mọi phép thuật và cung tên.',
    accentColor: '#38bdf8',
  },
  DUELIST_BLOW: {
    id: 'DUELIST_BLOW',
    name: 'Thân Pháp Quyết Đấu',
    kind: 'PASSIVE',
    shortDesc: '+20% Né khi chủ động tấn công',
    detailDesc: 'Chủ động tấn công giúp tăng +20% né tránh trước đòn phản công của địch.',
    accentColor: '#2dd4bf',
  },
  LIFETAKER: {
    id: 'LIFETAKER',
    name: 'Hấp Huyết',
    kind: 'PASSIVE',
    shortDesc: 'Hồi 6 HP khi hạ gục kẻ địch',
    detailDesc: 'Mỗi lần tiêu diệt đối thủ sẽ hấp thụ sinh lực, hồi ngay 6 HP.',
    accentColor: '#c084fc',
  },
  CANTO_AGILITY: {
    id: 'CANTO_AGILITY',
    name: 'Kỵ Chiến Linh Hoạt',
    kind: 'PASSIVE',
    shortDesc: '+2 ST & +10% Né khi chủ công',
    detailDesc: 'Đà xung phong của thú cưỡi tăng +2 sát thương và +10% né tránh khi mở giao tranh.',
    accentColor: '#14b8a6',
  },
  SHADOW_STEP: {
    id: 'SHADOW_STEP',
    name: 'Ảnh Bộ',
    kind: 'PASSIVE',
    shortDesc: '+15% Né & +15% Chí mạng',
    detailDesc: 'Bước chân vô hình tăng thường trực +15% né tránh và +15% tỷ lệ chí mạng.',
    accentColor: '#818cf8',
  },
  ARCANE_SURGE: {
    id: 'ARCANE_SURGE',
    name: 'Ma Lực Dâng Trào',
    kind: 'PASSIVE',
    shortDesc: '+3 ST phép & hồi thêm +10 SP/lượt',
    detailDesc: 'Tăng +3 sát thương khi dùng pháp điển và hồi nhanh năng lượng Tuyệt Kỹ mỗi lượt.',
    accentColor: '#34d399',
  },
};

export const TERRAIN_DATA: Record<TerrainType, TerrainInfo> = {
  PLAIN: { type: 'PLAIN', name: 'Đồng Cỏ', defBonus: 0, avoBonus: 0, healPercent: 0, moveCost: { FOOT: 1, MOUNTED: 1, FLYING: 1, ARMORED: 1 } },
  ROAD: { type: 'ROAD', name: 'Đại Lộ', defBonus: 0, avoBonus: 0, healPercent: 0, moveCost: { FOOT: 1, MOUNTED: 1, FLYING: 1, ARMORED: 1 } },
  FOREST: { type: 'FOREST', name: 'Rừng Rậm', defBonus: 1, avoBonus: 20, healPercent: 0, moveCost: { FOOT: 2, MOUNTED: 3, FLYING: 1, ARMORED: 2 } },
  FORT: { type: 'FORT', name: 'Pháo Đài', defBonus: 2, avoBonus: 20, healPercent: 20, moveCost: { FOOT: 1, MOUNTED: 2, FLYING: 1, ARMORED: 1 } },
  MOUNTAIN: { type: 'MOUNTAIN', name: 'Núi Đá', defBonus: 2, avoBonus: 30, healPercent: 0, moveCost: { FOOT: 3, MOUNTED: 99, FLYING: 1, ARMORED: 99 } },
  WATER: { type: 'WATER', name: 'Sông Biển', defBonus: 0, avoBonus: 0, healPercent: 0, moveCost: { FOOT: 99, MOUNTED: 99, FLYING: 1, ARMORED: 99 } },
  WALL: { type: 'WALL', name: 'Tường Thành', defBonus: 0, avoBonus: 0, healPercent: 0, moveCost: { FOOT: 99, MOUNTED: 99, FLYING: 99, ARMORED: 99 } },
  BRIDGE: { type: 'BRIDGE', name: 'Cầu Đá', defBonus: 0, avoBonus: 0, healPercent: 0, moveCost: { FOOT: 1, MOUNTED: 1, FLYING: 1, ARMORED: 1 } },
  SAND: { type: 'SAND', name: 'Sa Mạc', defBonus: 0, avoBonus: 5, healPercent: 0, moveCost: { FOOT: 2, MOUNTED: 3, FLYING: 1, ARMORED: 3 } },
  SNOW: { type: 'SNOW', name: 'Tuyết Phủ', defBonus: 0, avoBonus: 10, healPercent: 0, moveCost: { FOOT: 1, MOUNTED: 2, FLYING: 1, ARMORED: 2 } },
  LAVA: { type: 'LAVA', name: 'Dung Nham', defBonus: 0, avoBonus: 0, healPercent: 0, moveCost: { FOOT: 99, MOUNTED: 99, FLYING: 1, ARMORED: 99 } },
  THRONE: { type: 'THRONE', name: 'Ngai Vàng', defBonus: 3, avoBonus: 25, healPercent: 20, moveCost: { FOOT: 1, MOUNTED: 1, FLYING: 1, ARMORED: 1 } },
  SHOP_ARMORY: {
    type: 'SHOP_ARMORY',
    name: 'Tiệm Rèn Chiến Trường',
    defBonus: 1,
    avoBonus: 10,
    healPercent: 10,
    moveCost: { FOOT: 1, MOUNTED: 1, FLYING: 1, ARMORED: 1 },
    shopKind: 'IN_MAP_ARMORY',
  },
  SHOP_VENDOR: {
    type: 'SHOP_VENDOR',
    name: 'Thương Nhân Bí Mật',
    defBonus: 1,
    avoBonus: 10,
    healPercent: 10,
    moveCost: { FOOT: 1, MOUNTED: 1, FLYING: 1, ARMORED: 1 },
    shopKind: 'IN_MAP_VENDOR',
  },
};

export interface ClassMeta {
  id: UnitClassId;
  name: string;
  tier: UnitTier;
  moveType: MoveType;
  accent: string;
  roleSummary: string;
  allowedWeaponTypes: WeaponType[];
  defaultSkills: SkillId[];
  promotion?: ClassPromotionDef;
}

interface LineageConfig {
  accent: string;
  moveType: MoveType;
  tiers: [
    {
      id: UnitClassId;
      name: string;
      role: string;
      weapons: WeaponType[];
      skills: SkillId[];
    },
    {
      id: UnitClassId;
      name: string;
      role: string;
      weapons: WeaponType[];
      unlockSkill: SkillId;
      bonuses: Partial<Unit['stats']>;
      promoDesc: string;
      moveType?: MoveType;
      accent?: string;
    },
    {
      id: UnitClassId;
      name: string;
      role: string;
      weapons: WeaponType[];
      unlockSkill: SkillId;
      bonuses: Partial<Unit['stats']>;
      promoDesc: string;
      moveType?: MoveType;
      accent?: string;
    },
    {
      id: UnitClassId;
      name: string;
      role: string;
      weapons: WeaponType[];
      unlockSkill: SkillId;
      bonuses: Partial<Unit['stats']>;
      promoDesc: string;
      moveType?: MoveType;
      accent?: string;
    },
  ];
}

/**
 * 17 Playable Class Lineages × 4 Tiers (Bậc I -> Bậc II @ Lv.5 -> Bậc III @ Lv.15 -> Bậc IV @ Lv.30)
 * = 68 playable classes + DARK_GENERAL boss = 69 total classes!
 */
export const CLASS_LINEAGES: LineageConfig[] = [
  // 1. LORD LINEAGE
  {
    accent: '#3b82f6',
    moveType: 'FOOT',
    tiers: [
      { id: 'LORD', name: 'Lãnh Chúa', role: 'Chỉ huy tiên phong cân bằng công thủ.', weapons: ['SWORD'], skills: ['ROYAL_CHARM', 'LUNA_STRIKE'] },
      { id: 'GREAT_LORD', name: 'Đại Lãnh Chúa', role: 'Thống soái hoàng gia cầm cả Kiếm và Thương.', weapons: ['SWORD', 'LANCE'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 5, str: 3, skl: 2, spd: 2, def: 2, res: 2, mov: 1 }, promoDesc: 'Mở khóa Thương, +1 MOV và tuyệt kỹ hồi máu Thái Dương Kích.', accent: '#2563eb' },
      { id: 'SOVEREIGN', name: 'Thánh Vương Valoria', role: 'Bậc thầy chiến trận xuyên giáp và chống phép.', weapons: ['SWORD', 'LANCE'], unlockSkill: 'AEGIS', bonuses: { maxHp: 6, str: 3, mag: 2, skl: 3, spd: 3, def: 3, res: 3 }, promoDesc: 'Thức tỉnh Hộ Pháp Ma Lực giảm 25% sát thương phép & cung tên.', accent: '#1d4ed8' },
      { id: 'EMPEROR_LORD', name: 'Đế Vương Thái Dương', role: 'Đỉnh cao vương giả toàn năng chiến trường.', weapons: ['SWORD', 'LANCE', 'TOME'], unlockSkill: 'ASTRA_FLURRY', bonuses: { maxHp: 8, str: 4, mag: 4, skl: 4, spd: 4, def: 4, res: 4, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! Mở khóa Pháp Điển, +1 MOV & Tinh Hà Ngũ Trảm.', accent: '#f59e0b' },
    ],
  },
  // 2. CAVALIER LINEAGE
  {
    accent: '#14b8a6',
    moveType: 'MOUNTED',
    tiers: [
      { id: 'CAVALIER', name: 'Kỵ Sĩ', role: 'Cơ động cao, thiện chiến với Thương & Kiếm.', weapons: ['LANCE', 'SWORD'], skills: ['CANTO_AGILITY'] },
      { id: 'PALADIN', name: 'Thánh Kỵ Sĩ', role: 'Kỵ binh tinh nhuệ, phòng thủ phép tốt và dẻo dai.', weapons: ['LANCE', 'SWORD'], unlockSkill: 'AEGIS', bonuses: { maxHp: 5, str: 3, skl: 2, spd: 2, def: 2, res: 3, mov: 1 }, promoDesc: 'Tăng +1 MOV, kháng phép vượt trội và mở khóa Hộ Pháp Ma Lực.', accent: '#0d9488' },
      { id: 'SILVER_KNIGHT', name: 'Ngân Giáp Kỵ Sĩ', role: 'Xung kích tốc độ cao với Thương, Kiếm và Rìu.', weapons: ['LANCE', 'SWORD', 'AXE'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 6, str: 3, skl: 3, spd: 3, def: 3, res: 3 }, promoDesc: 'Làm chủ Tam Giác Vũ Khí (Kiếm-Thương-Rìu) & Thái Dương Kích.', accent: '#06b6d4' },
      { id: 'ASTRAL_CAVALIER', name: 'Tinh Hà Thánh Kỵ', role: 'Thần kỵ bất bại càn quét mọi phòng tuyến.', weapons: ['LANCE', 'SWORD', 'AXE'], unlockSkill: 'LUNA_STRIKE', bonuses: { maxHp: 8, str: 5, skl: 4, spd: 4, def: 4, res: 4, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +1 MOV, đột kích xuyên giáp với Nguyệt Trảm.', accent: '#38bdf8' },
    ],
  },
  // 3. ARCHER LINEAGE
  {
    accent: '#84cc16',
    moveType: 'FOOT',
    tiers: [
      { id: 'ARCHER', name: 'Cung Thủ', role: 'Tấn công tầm xa chuẩn xác, khắc chế Không Kỵ.', weapons: ['BOW'], skills: ['DEADEYE_SHOT'] },
      { id: 'SNIPER', name: 'Thần Tiễn Thủ', role: 'Xạ thủ chí mạng cao, khống chế toàn bầu trời.', weapons: ['BOW'], unlockSkill: 'DUELIST_BLOW', bonuses: { maxHp: 4, str: 3, skl: 4, spd: 3, def: 1, res: 1, mov: 1 }, promoDesc: 'Tăng mạnh SKL/SPD, +1 MOV và mở khóa Thân Pháp Quyết Đấu.', accent: '#65a30d' },
      { id: 'MARKSMAN', name: 'Ưng Nhãn Thần Xạ', role: 'Chuyên gia bắn tỉa chí mạng từ cự ly cực xa.', weapons: ['BOW'], unlockSkill: 'SHADOW_STEP', bonuses: { maxHp: 5, str: 4, skl: 4, spd: 4, def: 2, res: 2 }, promoDesc: 'Khai mở Ảnh Bộ (+15% Né & +15% Chí mạng thường trực).', accent: '#4d7c0f' },
      { id: 'STARFALL_ARCHER', name: 'Tinh Vẫn Xạ Thần', role: 'Xạ thần huyền thoại bách phát bách trúng.', weapons: ['BOW'], unlockSkill: 'ASTRA_FLURRY', bonuses: { maxHp: 7, str: 5, skl: 6, spd: 5, def: 3, res: 3, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +1 MOV, SKL +6 & tuyệt kỹ Tinh Hà Ngũ Trảm.', accent: '#a3e635' },
    ],
  },
  // 4. MAGE LINEAGE
  {
    accent: '#10b981',
    moveType: 'FOOT',
    tiers: [
      { id: 'MAGE', name: 'Pháp Sư', role: 'Điều khiển Hỏa-Lôi-Phong-Băng xuyên giáp sắt.', weapons: ['TOME'], skills: ['ARCANE_SURGE'] },
      { id: 'SAGE', name: 'Hiền Triết', role: 'Đại pháp sư kết hợp phép nguyên tố và Trượng trị thương.', weapons: ['TOME', 'STAFF'], unlockSkill: 'IGNIS_BURST', bonuses: { maxHp: 4, mag: 4, skl: 3, spd: 2, res: 4, mov: 1 }, promoDesc: 'Dùng thêm Trượng trị thương, +4 MAG và tuyệt kỹ Hỏa Ngục Bộc Phá.', accent: '#059669' },
      { id: 'ARCHSAGE', name: 'Đại Hiền Triết', role: 'Chưởng khống nguyên tố cổ đại với kháng phép siêu việt.', weapons: ['TOME', 'STAFF'], unlockSkill: 'AEGIS', bonuses: { maxHp: 5, mag: 5, skl: 3, spd: 3, def: 2, res: 5 }, promoDesc: 'Ma lực bùng nổ (+5 MAG/+5 RES) và kết giới Hộ Pháp Ma Lực.', accent: '#047857' },
      { id: 'ASTRAL_ORACLE', name: 'Tinh Tú Đại Pháp Thần', role: 'Hóa thân ma đạo tối thượng làm chủ sao trời.', weapons: ['TOME', 'STAFF'], unlockSkill: 'VOID_COLLAPSE', bonuses: { maxHp: 7, mag: 6, skl: 5, spd: 4, def: 3, res: 6, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +6 MAG, +1 MOV và cấm thuật Hư Không Diệt Thế.', accent: '#34d399' },
    ],
  },
  // 5. CLERIC LINEAGE
  {
    accent: '#f59e0b',
    moveType: 'FOOT',
    tiers: [
      { id: 'CLERIC', name: 'Tu Sĩ', role: 'Trị thương cứu nguy đồng minh tuyến sau.', weapons: ['STAFF'], skills: ['SANCTUARY_AURA'] },
      { id: 'BISHOP', name: 'Giám Mục', role: 'Thánh nhân dùng cả Trượng trị liệu và Quang Minh Pháp.', weapons: ['STAFF', 'TOME'], unlockSkill: 'AEGIS', bonuses: { maxHp: 4, mag: 4, skl: 2, spd: 2, lck: 3, res: 5, mov: 1 }, promoDesc: 'Mở khóa Pháp Điển tấn công, +5 RES và Hộ Pháp Ma Lực.', accent: '#d97706' },
      { id: 'SAINT', name: 'Thánh Nữ Quang Minh', role: 'Cứu thế chủ hồi phục và tiêu diệt hắc ám.', weapons: ['STAFF', 'TOME'], unlockSkill: 'ARCANE_SURGE', bonuses: { maxHp: 5, mag: 5, skl: 3, spd: 3, lck: 4, res: 5 }, promoDesc: 'Tăng cường ma lực thánh quang với Ma Lực Dâng Trào (+3 ST & +SP).', accent: '#eab308' },
      { id: 'SERAPH_PROPHET', name: 'Thiên Sứ Tiên Tri', role: 'Thần sứ bất tử che chở toàn quân.', weapons: ['STAFF', 'TOME'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 7, mag: 6, skl: 4, spd: 4, lck: 6, res: 7, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +1 MOV, +6 MAG/+7 RES & Thái Dương Kích.', accent: '#fde047' },
    ],
  },
  // 6. KNIGHT LINEAGE
  {
    accent: '#94a3b8',
    moveType: 'ARMORED',
    tiers: [
      { id: 'KNIGHT', name: 'Trọng Giáp', role: 'Pháo đài di động với phòng thủ vật lý đỉnh cao.', weapons: ['LANCE'], skills: ['PAVISE'] },
      { id: 'GENERAL', name: 'Đại Tướng Giáp', role: 'Chiến giáp bất khả xâm phạm dùng Thương & Rìu.', weapons: ['LANCE', 'AXE'], unlockSkill: 'IGNIS_BURST', bonuses: { maxHp: 7, str: 4, skl: 2, def: 5, res: 2, mov: 1 }, promoDesc: 'Cầm thêm Rìu, +5 DEF, +1 MOV và Hỏa Ngục Bộc Phá theo DEF!', accent: '#64748b' },
      { id: 'MARSHAL', name: 'Nguyên Soái Thiết Bích', role: 'Thống lĩnh thiết giáp làm chủ Kiếm-Thương-Rìu.', weapons: ['LANCE', 'AXE', 'SWORD'], unlockSkill: 'AEGIS', bonuses: { maxHp: 8, str: 4, skl: 3, spd: 2, def: 5, res: 4 }, promoDesc: 'Vừa chống vật lý vừa chống phép thuật với Hộ Pháp Ma Lực.', accent: '#475569' },
      { id: 'TITAN_CITADEL', name: 'Thần Giáp Cự Nhân', role: 'Pháo đài thần thoại không thể bị xuyên thủng.', weapons: ['LANCE', 'AXE', 'SWORD'], unlockSkill: 'LUNA_STRIKE', bonuses: { maxHp: 12, str: 5, skl: 3, spd: 2, def: 7, res: 5, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +12 HP, +7 DEF, +1 MOV & Nguyệt Trảm.', accent: '#cbd5e1' },
    ],
  },
  // 7. PEGASUS LINEAGE
  {
    accent: '#38bdf8',
    moveType: 'FLYING',
    tiers: [
      { id: 'PEGASUS', name: 'Thiên Mã', role: 'Không kỵ siêu cơ động, kháng phép cao.', weapons: ['LANCE'], skills: ['CANTO_AGILITY'] },
      { id: 'FALCON_KNIGHT', name: 'Thần Ưng Kỵ Sĩ', role: 'Nữ thần bầu trời dùng Thương, Kiếm và Trượng.', weapons: ['LANCE', 'SWORD', 'STAFF'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 5, str: 3, skl: 3, spd: 3, res: 4, mov: 1 }, promoDesc: 'Mở khóa Kiếm & Trượng, +1 MOV (8 ô!) và Thái Dương Kích.', accent: '#0284c7' },
      { id: 'SERAPH_KNIGHT', name: 'Thiên Sứ Kỵ Sĩ', role: 'Đội quân cánh trắng bất khả chiến bại trên không.', weapons: ['LANCE', 'SWORD', 'STAFF'], unlockSkill: 'AEGIS', bonuses: { maxHp: 6, str: 4, mag: 3, skl: 4, spd: 4, res: 5 }, promoDesc: 'Miễn nhiễm hỏa lực phép & cung tốt hơn với Hộ Pháp Ma Lực.', accent: '#0ea5e9' },
      { id: 'CELESTIAL_VALKYRIE', name: 'Nữ Thần Chiến Trận', role: 'Chúa tể thiên không tốc độ ánh sáng.', weapons: ['LANCE', 'SWORD', 'STAFF', 'TOME'], unlockSkill: 'ASTRA_FLURRY', bonuses: { maxHp: 7, str: 5, mag: 4, skl: 5, spd: 5, def: 3, res: 6, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! Dùng cả Pháp Điển, +1 MOV & Tinh Hà Ngũ Trảm.', accent: '#7dd3fc' },
    ],
  },
  // 8. MYRMIDON LINEAGE
  {
    accent: '#f43f5e',
    moveType: 'FOOT',
    tiers: [
      { id: 'MYRMIDON', name: 'Kiếm Khách', role: 'Tốc độ và chí mạng cao, phản đòn chớp nhoáng.', weapons: ['SWORD'], skills: ['VANTAGE', 'DUELIST_BLOW'] },
      { id: 'SWORDMASTER', name: 'Kiếm Thánh', role: 'Đỉnh cao kiếm thuật với Tinh Hà Ngũ Trảm.', weapons: ['SWORD'], unlockSkill: 'ASTRA_FLURRY', bonuses: { maxHp: 5, str: 3, skl: 4, spd: 4, def: 2, mov: 1 }, promoDesc: '+4 SKL/+4 SPD, +1 MOV và mở khóa Tinh Hà Ngũ Trảm!', accent: '#e11d48' },
      { id: 'TRUEBLADE', name: 'Chân Kiếm Tông Sư', role: 'Kiếm ảnh vô hình né tránh mọi đòn đánh.', weapons: ['SWORD'], unlockSkill: 'SHADOW_STEP', bonuses: { maxHp: 6, str: 4, skl: 5, spd: 5, def: 2, res: 2 }, promoDesc: 'Đạt cảnh giới Ảnh Bộ (+15% Né & +15% Chí mạng).', accent: '#be123c' },
      { id: 'SWORD_SAINT', name: 'Thần Kiếm Bất Diệt', role: 'Nhất kiếm khai thiên, chém tan mọi giáp trụ.', weapons: ['SWORD'], unlockSkill: 'LUNA_STRIKE', bonuses: { maxHp: 8, str: 5, skl: 6, spd: 6, def: 3, res: 3, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +6 SKL/+6 SPD, +1 MOV & Nguyệt Trảm.', accent: '#fb7185' },
    ],
  },
  // 9. FIGHTER LINEAGE
  {
    accent: '#ea580c',
    moveType: 'FOOT',
    tiers: [
      { id: 'FIGHTER', name: 'Chiến Binh Rìu', role: 'HP dồi dào, sức đánh vật lý cực đại.', weapons: ['AXE'], skills: ['WRATH'] },
      { id: 'BERSERKER', name: 'Cuồng Chiến Sĩ', role: 'Sát thần rìu chiến nghiền nát mọi đội hình.', weapons: ['AXE'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 7, str: 5, skl: 2, spd: 3, def: 2, mov: 1 }, promoDesc: '+7 HP/+5 STR, +1 MOV và hồi sinh lực bằng Thái Dương Kích.', accent: '#c2410c' },
      { id: 'REAVER', name: 'Hủy Diệt Chiến Tướng', role: 'Cuồng chiến sĩ thiện nghệ cả Rìu và Cung.', weapons: ['AXE', 'BOW'], unlockSkill: 'LIFETAKER', bonuses: { maxHp: 8, str: 5, skl: 3, spd: 3, def: 3, res: 2 }, promoDesc: 'Mở khóa Cung chiến & nội tại Hấp Huyết hồi 6 HP mỗi mạng hạ gục.', accent: '#9a3412' },
      { id: 'WAR_GOD', name: 'Chiến Thần Phá Giới', role: 'Uy lực hủy diệt tuyệt đối trên mặt đất.', weapons: ['AXE', 'BOW'], unlockSkill: 'DRAGON_FANG', bonuses: { maxHp: 11, str: 7, skl: 4, spd: 4, def: 4, res: 3, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +11 HP/+7 STR, +1 MOV & Long Nha Xung Kích.', accent: '#f97316' },
    ],
  },
  // 10. WYVERN RIDER LINEAGE
  {
    accent: '#059669',
    moveType: 'FLYING',
    tiers: [
      { id: 'WYVERN_RIDER', name: 'Long Kỵ Sĩ', role: 'Không kỵ bọc giáp cưỡi Chiến Long, công thủ mạnh.', weapons: ['AXE', 'LANCE'], skills: ['DRAGON_FANG'] },
      { id: 'WYVERN_LORD', name: 'Long Thống Soái', role: 'Chúa tể bầu trời với giáp rồng cực dày.', weapons: ['AXE', 'LANCE'], unlockSkill: 'PAVISE', bonuses: { maxHp: 6, str: 4, skl: 3, spd: 2, def: 4, mov: 1 }, promoDesc: '+6 HP/+4 STR/+4 DEF, +1 MOV và Khiên Bất Khuất (-20% ST vật lý)!', accent: '#047857' },
      { id: 'DRAGONLORD', name: 'Thánh Long Tướng Quân', role: 'Bá chủ không trung cầm cả Kiếm, Thương và Rìu.', weapons: ['AXE', 'LANCE', 'SWORD'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 7, str: 5, skl: 3, spd: 3, def: 4, res: 3 }, promoDesc: 'Bổ sung Kiếm chiến và Thái Dương Kích tự hồi máu giữa đội hình địch.', accent: '#065f46' },
      { id: 'SKY_SOVEREIGN', name: 'Thương Khung Long Đế', role: 'Thần Long chí tôn áp đảo cả lục địa.', weapons: ['AXE', 'LANCE', 'SWORD'], unlockSkill: 'IGNIS_BURST', bonuses: { maxHp: 10, str: 6, skl: 4, spd: 4, def: 6, res: 4, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +10 HP/+6 STR/+6 DEF & Hỏa Ngục Bộc Phá.', accent: '#10b981' },
    ],
  },
  // 11. THIEF LINEAGE
  {
    accent: '#818cf8',
    moveType: 'FOOT',
    tiers: [
      { id: 'THIEF', name: 'Thích Khách', role: 'Siêu nhanh nhẹn, né tránh và chí mạng cao.', weapons: ['SWORD'], skills: ['SHADOW_STEP'] },
      { id: 'ASSASSIN', name: 'Ám Sát Giả', role: 'Sát thủ bóng đêm dùng Kiếm & Cung kết liễu chớp nhoáng.', weapons: ['SWORD', 'BOW'], unlockSkill: 'LETHALITY_STRIKE', bonuses: { maxHp: 4, str: 3, skl: 5, spd: 4, lck: 3, mov: 1 }, promoDesc: 'Mở khóa Cung, +5 SKL/+4 SPD & tuyệt kỹ Ảnh Sát Chí Tử (+45% CM)!', accent: '#6366f1' },
      { id: 'WHISPER', name: 'U Linh Đao Khách', role: 'Bóng ma phản kích tiên phong giữa vòng vây.', weapons: ['SWORD', 'BOW'], unlockSkill: 'VANTAGE', bonuses: { maxHp: 5, str: 4, skl: 5, spd: 5, lck: 4, def: 2 }, promoDesc: 'Thức tỉnh Phản Kích Tiên Phong — luôn đánh trước khi máu dưới 50%.', accent: '#4f46e5' },
      { id: 'PHANTOM_REAPER', name: 'Tử Thần Hư Ảnh', role: 'Ác mộng chí mạng một kích tất sát.', weapons: ['SWORD', 'BOW'], unlockSkill: 'LIFETAKER', bonuses: { maxHp: 7, str: 5, skl: 6, spd: 6, lck: 6, def: 3, res: 3, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +6 SKL/+6 SPD, +1 MOV & Hấp Huyết.', accent: '#a5b4fc' },
    ],
  },
  // 12. DARK MAGE LINEAGE
  {
    accent: '#a855f7',
    moveType: 'FOOT',
    tiers: [
      { id: 'DARK_MAGE', name: 'Hắc Pháp Sư', role: 'Sử dụng cấm thuật hút máu và xuyên kháng phép.', weapons: ['TOME'], skills: ['LIFETAKER'] },
      { id: 'NECROMANCER', name: 'Tử Linh Pháp Sư', role: 'Bậc thầy hắc thuật sở hữu Hư Không Diệt Thế.', weapons: ['TOME', 'STAFF'], unlockSkill: 'VOID_COLLAPSE', bonuses: { maxHp: 5, mag: 5, skl: 3, def: 2, res: 4, mov: 1 }, promoDesc: 'Mở khóa Trượng, +5 MAG & cấm thuật Hư Không Diệt Thế (xuyên 60% RES)!', accent: '#9333ea' },
      { id: 'DARK_DRUID', name: 'Hắc Ám Đại Tế Ti', role: 'Bất tử nhờ cấm thuật hút sinh lực và Cuồng Nộ.', weapons: ['TOME', 'STAFF'], unlockSkill: 'WRATH', bonuses: { maxHp: 6, mag: 5, skl: 4, spd: 3, def: 3, res: 5 }, promoDesc: 'Thức tỉnh Cuồng Nộ (+30% Chí mạng khi HP < 50%) & +5 MAG/+5 RES.', accent: '#7e22ce' },
      { id: 'ABYSSAL_ARCHON', name: 'Vực Thẳm Ma Hoàng', role: 'Chúa tể hư không thống trị bóng tối tuyệt đối.', weapons: ['TOME', 'STAFF'], unlockSkill: 'ARCANE_SURGE', bonuses: { maxHp: 8, mag: 7, skl: 5, spd: 4, def: 4, res: 6, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +7 MAG, +1 MOV & Ma Lực Dâng Trào.', accent: '#c084fc' },
    ],
  },

  // =========================================================================
  // 5 BRAND-NEW BASE CLASS LINEAGES (+20 NEW CLASSES across 4 Tiers!)
  // =========================================================================

  // 13. MERCENARY LINEAGE (Lính Đánh Thuê -> Anh Hùng -> Tiên Phong Vương -> Huyền Thoại Chiến Thần)
  {
    accent: '#dc2626',
    moveType: 'FOOT',
    tiers: [
      { id: 'MERCENARY', name: 'Lính Đánh Thuê', role: 'Kiếm sĩ dạn dày kinh nghiệm, công thủ toàn diện.', weapons: ['SWORD'], skills: ['DUELIST_BLOW'] },
      { id: 'HERO', name: 'Anh Hùng Chiến Trường', role: 'Chiến tướng linh hoạt dùng Kiếm & Rìu, tự hồi máu.', weapons: ['SWORD', 'AXE'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 6, str: 4, skl: 3, spd: 3, def: 3, mov: 1 }, promoDesc: 'Mở khóa Rìu chiến, +6 HP/+4 STR, +1 MOV & Thái Dương Kích.', accent: '#b91c1c' },
      { id: 'VANGUARD', name: 'Tiên Phong Vương', role: 'Mũi nhọn phá vỡ mọi đội hình bằng sức mạnh tuyệt đối.', weapons: ['SWORD', 'AXE'], unlockSkill: 'PAVISE', bonuses: { maxHp: 7, str: 4, skl: 4, spd: 3, def: 4, res: 2 }, promoDesc: 'Sở hữu Khiên Bất Khuất giảm 20% sát thương vật lý tuyến đầu.', accent: '#991b1b' },
      { id: 'LEGEND_CHAMPION', name: 'Huyền Thoại Chiến Thần', role: 'Chiến thần bất bại mọi thời đại.', weapons: ['SWORD', 'AXE', 'LANCE'], unlockSkill: 'LUNA_STRIKE', bonuses: { maxHp: 9, str: 6, skl: 5, spd: 5, def: 5, res: 4, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! Tinh thông toàn bộ cận chiến, +1 MOV & Nguyệt Trảm.', accent: '#ef4444' },
    ],
  },
  // 14. SOLDIER LINEAGE (Thương Binh -> Kích Sĩ -> Thánh Vệ Kích -> Thương Đế Hoàng Kim)
  {
    accent: '#0284c7',
    moveType: 'FOOT',
    tiers: [
      { id: 'SOLDIER', name: 'Thương Binh', role: 'Bộ binh dùng Thương kỷ luật, công thủ chắc chắn.', weapons: ['LANCE'], skills: ['LUNA_STRIKE'] },
      { id: 'HALBERDIER', name: 'Kích Sĩ Hoàng Gia', role: 'Chuyên gia trường kích phản công cực mạnh.', weapons: ['LANCE'], unlockSkill: 'WRATH', bonuses: { maxHp: 5, str: 4, skl: 4, spd: 3, def: 3, mov: 1 }, promoDesc: '+4 STR/+4 SKL, +1 MOV và mở khóa Cuồng Nộ (+30% CM khi thấp máu).', accent: '#0369a1' },
      { id: 'SENTINEL', name: 'Thánh Vệ Kích', role: 'Cận vệ vương triều không lùi một bước.', weapons: ['LANCE'], unlockSkill: 'PAVISE', bonuses: { maxHp: 7, str: 4, skl: 4, spd: 4, def: 4, res: 3 }, promoDesc: 'Giáp tinh luyện giảm 20% sát thương vật lý với Khiên Bất Khuất.', accent: '#075985' },
      { id: 'SPEAR_EMPEROR', name: 'Thương Đế Hoàng Kim', role: 'Đỉnh cao thương thuật xuyên phá vạn quân.', weapons: ['LANCE', 'SWORD'], unlockSkill: 'ASTRA_FLURRY', bonuses: { maxHp: 9, str: 6, skl: 6, spd: 5, def: 5, res: 4, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! Mở khóa Kiếm, +6 STR/+6 SKL & Tinh Hà Ngũ Trảm.', accent: '#38bdf8' },
    ],
  },
  // 15. MONK LINEAGE (Tu Sĩ Quang Minh -> Trừ Ma Sư -> Thẩm Phán Thánh Quang -> Thái Dương Đại Tế Ti)
  {
    accent: '#eab308',
    moveType: 'FOOT',
    tiers: [
      { id: 'MONK', name: 'Tu Sĩ Quang Minh', role: 'Chiến tăng sử dụng Quang Minh Pháp chuẩn xác.', weapons: ['TOME'], skills: ['ROYAL_CHARM'] },
      { id: 'EXORCIST', name: 'Trừ Ma Sư', role: 'Dùng Pháp Điển & Trượng thanh tẩy hắc ám.', weapons: ['TOME', 'STAFF'], unlockSkill: 'SANCTUARY_AURA', bonuses: { maxHp: 4, mag: 4, skl: 3, spd: 3, res: 4, mov: 1 }, promoDesc: 'Mở khóa Trượng trị thương, +4 MAG/+4 RES & Hào Quang Cứu Rỗi.', accent: '#ca8a04' },
      { id: 'INQUISITOR', name: 'Thẩm Phán Thánh Quang', role: 'Vệ sĩ thánh điện với kháng phép tuyệt đỉnh.', weapons: ['TOME', 'STAFF'], unlockSkill: 'AEGIS', bonuses: { maxHp: 6, mag: 5, skl: 4, spd: 3, def: 3, res: 5 }, promoDesc: 'Giảm 25% sát thương phép & cung bằng Hộ Pháp Ma Lực.', accent: '#a16207' },
      { id: 'SOLAR_HIEROPHANT', name: 'Thái Dương Đại Tế Ti', role: 'Hiện thân ánh mặt trời bất diệt.', weapons: ['TOME', 'STAFF'], unlockSkill: 'IGNIS_BURST', bonuses: { maxHp: 8, mag: 6, skl: 5, spd: 5, def: 4, res: 7, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +6 MAG/+7 RES, +1 MOV & Hỏa Ngục Bộc Phá.', accent: '#facc15' },
    ],
  },
  // 16. NOMAD LINEAGE (Du Mục Cung Kỵ -> Thảo Nguyên Cung Kỵ -> Kỵ Cung Hoàng Gia -> Phong Bạo Khả Hãn)
  {
    accent: '#16a34a',
    moveType: 'MOUNTED',
    tiers: [
      { id: 'NOMAD', name: 'Du Mục Cung Kỵ', role: 'Cung thủ cưỡi ngựa siêu cơ động, tập kích chớp nhoáng.', weapons: ['BOW'], skills: ['CANTO_AGILITY', 'DEADEYE_SHOT'] },
      { id: 'NOMAD_TROOPER', name: 'Thảo Nguyên Cung Kỵ', role: 'Kỵ sĩ thảo nguyên tinh thông cả Cung và Kiếm.', weapons: ['BOW', 'SWORD'], unlockSkill: 'DUELIST_BLOW', bonuses: { maxHp: 5, str: 3, skl: 4, spd: 4, def: 2, mov: 1 }, promoDesc: 'Mở khóa Kiếm cận chiến, +1 MOV (7 ô!) & Thân Pháp Quyết Đấu.', accent: '#15803d' },
      { id: 'BOW_KNIGHT', name: 'Kỵ Cung Hoàng Gia', role: 'Bắn tỉa tốc độ gió trên lưng chiến mã.', weapons: ['BOW', 'SWORD'], unlockSkill: 'SHADOW_STEP', bonuses: { maxHp: 6, str: 4, skl: 4, spd: 5, def: 3, res: 3 }, promoDesc: 'Khai mở Ảnh Bộ (+15% Né & +15% Chí mạng mọi trận chiến).', accent: '#166534' },
      { id: 'TEMPEST_KHAN', name: 'Phong Bạo Khả Hãn', role: 'Đế vương thảo nguyên cuốn phăng mọi quân đoàn.', weapons: ['BOW', 'SWORD', 'LANCE'], unlockSkill: 'DRAGON_FANG', bonuses: { maxHp: 8, str: 5, skl: 5, spd: 6, def: 4, res: 4, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +1 MOV (8 ô!), +6 SPD & Long Nha Xung Kích.', accent: '#22c55e' },
    ],
  },
  // 17. SPELLBLADE LINEAGE (Ma Kiếm Sĩ -> Ma Đạo Kiếm Sư -> Cổ Ngữ Kiếm Thánh -> Thái Hư Ma Kiếm Đế)
  {
    accent: '#ec4899',
    moveType: 'FOOT',
    tiers: [
      { id: 'SPELLBLADE', name: 'Ma Kiếm Sĩ', role: 'Song tu Kiếm thuật và Pháp Điển nguyên tố.', weapons: ['SWORD', 'TOME'], skills: ['ARCANE_SURGE', 'IGNIS_BURST'] },
      { id: 'MORTAL_SAVANT', name: 'Ma Đạo Kiếm Sư', role: 'Bậc thầy ma kiếm chém xuyên cả vật lý lẫn kháng phép.', weapons: ['SWORD', 'TOME'], unlockSkill: 'VANTAGE', bonuses: { maxHp: 5, str: 3, mag: 4, skl: 3, spd: 3, res: 3, mov: 1 }, promoDesc: '+3 STR/+4 MAG, +1 MOV & Phản Kích Tiên Phong khi HP < 50%.', accent: '#db2777' },
      { id: 'RUNE_BLADE', name: 'Cổ Ngữ Kiếm Thánh', role: 'Khắc cổ ngữ thánh quang lên kiếm, công thủ hoàn mỹ.', weapons: ['SWORD', 'TOME', 'STAFF'], unlockSkill: 'LUNA_STRIKE', bonuses: { maxHp: 6, str: 4, mag: 5, skl: 4, spd: 4, def: 3, res: 4 }, promoDesc: 'Mở khóa Trượng hỗ trợ và Nguyệt Trảm xuyên 50% giáp/kháng phép.', accent: '#be185d' },
      { id: 'AETHER_SOVEREIGN', name: 'Thái Hư Ma Kiếm Đế', role: 'Huyền thoại song tu Ma Pháp & Kiếm Đạo tối thượng.', weapons: ['SWORD', 'TOME', 'STAFF'], unlockSkill: 'ASTRA_FLURRY', bonuses: { maxHp: 8, str: 5, mag: 6, skl: 5, spd: 5, def: 4, res: 5, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +1 MOV, +5 STR/+6 MAG & Tinh Hà Ngũ Trảm.', accent: '#f472b6' },
    ],
  },

  // =========================================================================
  // 13 BRAND-NEW BASE CLASS LINEAGES (Lineages #18 -> #30, +52 NEW CLASSES!)
  // =========================================================================

  // 18. TROUBADOUR LINEAGE (Nữ Kỵ Y Sư -> Chiến Thần Nữ Kỵ -> Thiên Sứ Kỵ -> Tinh Không Nữ Đế)
  {
    accent: '#f472b6',
    moveType: 'MOUNTED',
    tiers: [
      { id: 'TROUBADOUR', name: 'Nữ Kỵ Y Sư', role: 'Kỵ binh trị thương cơ động cao, cứu nguy đồng đội tuyến đầu.', weapons: ['STAFF'], skills: ['CANTO_AGILITY', 'SANCTUARY_AURA'] },
      { id: 'VALKYRIE', name: 'Chiến Thần Nữ Kỵ', role: 'Kỵ sĩ phép thuật cầm cả Trượng và Pháp Điển ánh sáng.', weapons: ['STAFF', 'TOME'], unlockSkill: 'ARCANE_SURGE', bonuses: { maxHp: 4, mag: 4, skl: 3, spd: 3, res: 4, mov: 1 }, promoDesc: 'Mở khóa Pháp Điển, +1 MOV (7 ô) & Ma Lực Dâng Trào!', accent: '#ec4899' },
      { id: 'SERAPH_RIDER', name: 'Thiên Sứ Kỵ Sĩ', role: 'Cận vệ ánh sáng vừa trị thương diện rộng vừa đánh phép cực mạnh.', weapons: ['STAFF', 'TOME'], unlockSkill: 'AEGIS', bonuses: { maxHp: 6, mag: 5, skl: 4, spd: 4, def: 2, res: 5 }, promoDesc: 'Kích hoạt Hộ Pháp Ma Lực giảm 25% sát thương phép & cung.', accent: '#db2777' },
      { id: 'CELESTIAL_EMPRESS', name: 'Tinh Không Nữ Đế', role: 'Nữ hoàng tinh tú ngự giá chiến mã thần thoại.', weapons: ['STAFF', 'TOME', 'SWORD'], unlockSkill: 'ROYAL_CHARM', bonuses: { maxHp: 8, mag: 6, skl: 5, spd: 5, lck: 5, def: 3, res: 7, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +1 MOV, +6 MAG/+7 RES & Hào Quang Vương Giả.', accent: '#fbcfe8' },
    ],
  },
  // 19. PIRATE LINEAGE (Hải Tặc -> Đô Đốc Biển Khơi -> Thuyền Trưởng Hắc Hải -> Hải Thần Cự Ngạc)
  {
    accent: '#0d9488',
    moveType: 'FOOT',
    tiers: [
      { id: 'PIRATE', name: 'Hải Tặc Chiến Phủ', role: 'Chiến binh biển cả cuồng bạo với tốc độ và chí mạng ấn tượng.', weapons: ['AXE'], skills: ['WRATH'] },
      { id: 'CORSAIR', name: 'Hải Tặc Đô Đốc', role: 'Bậc thầy Rìu & Kiếm với những đòn đột kích hiểm hóc.', weapons: ['AXE', 'SWORD'], unlockSkill: 'DUELIST_BLOW', bonuses: { maxHp: 6, str: 4, skl: 3, spd: 4, lck: 3, mov: 1 }, promoDesc: 'Mở khóa Kiếm, +4 STR/+4 SPD, +1 MOV & Thân Pháp Quyết Đấu.', accent: '#0f766e' },
      { id: 'DREAD_CAPTAIN', name: 'Thuyền Trưởng Hắc Hải', role: 'Chúa tể sóng gió càn quét tuyến địch bằng sát khí chí mạng.', weapons: ['AXE', 'SWORD'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 8, str: 5, skl: 4, spd: 4, def: 3, lck: 4 }, promoDesc: 'Thức tỉnh Thái Dương Kích tự hồi máu ngay giữa vòng vây.', accent: '#115e59' },
      { id: 'OCEAN_LEVIATHAN', name: 'Hải Thần Cự Kình', role: 'Ác thần biển sâu sở hữu sức phá hủy kinh thiên.', weapons: ['AXE', 'SWORD'], unlockSkill: 'IGNIS_BURST', bonuses: { maxHp: 11, str: 7, skl: 5, spd: 5, def: 4, res: 3, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +11 HP/+7 STR, +1 MOV & Hỏa Ngục Bộc Phá.', accent: '#2dd4bf' },
    ],
  },
  // 20. GRIFFIN RIDER LINEAGE (Sư Ưng Kỵ Sĩ -> Sư Ưng Thống Soái -> Nhật Dương Sư Ưng -> Thái Dương Không Đế)
  {
    accent: '#f59e0b',
    moveType: 'FLYING',
    tiers: [
      { id: 'GRIFFIN_RIDER', name: 'Sư Ưng Kỵ Sĩ', role: 'Không kỵ cưỡi Sư Ưng hoàng kim, cân bằng tốc độ và sức công.', weapons: ['LANCE', 'AXE'], skills: ['CANTO_AGILITY', 'DUELIST_BLOW'] },
      { id: 'GRIFFIN_LORD', name: 'Sư Ưng Thống Soái', role: 'Chúa tể không chiến kết hợp Thương, Rìu và Kiếm.', weapons: ['LANCE', 'AXE', 'SWORD'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 5, str: 4, skl: 4, spd: 4, def: 3, mov: 1 }, promoDesc: 'Mở khóa Kiếm, +4 STR/+4 SPD, +1 MOV & Thái Dương Kích.', accent: '#d97706' },
      { id: 'SUN_GRIFFIN', name: 'Nhật Dương Sư Ưng', role: 'Đôi cánh mặt trời gieo rắc kinh hoàng từ trên không.', weapons: ['LANCE', 'AXE', 'SWORD'], unlockSkill: 'LUNA_STRIKE', bonuses: { maxHp: 7, str: 5, skl: 4, spd: 5, def: 4, res: 3 }, promoDesc: 'Khai mở Nguyệt Trảm xuyên 50% giáp địch trên không trung.', accent: '#b45309' },
      { id: 'SOLAR_APEX_KNIGHT', name: 'Thái Dương Không Đế', role: 'Thần thú Sư Ưng tối thượng thống trị bầu trời bình minh.', weapons: ['LANCE', 'AXE', 'SWORD'], unlockSkill: 'ASTRA_FLURRY', bonuses: { maxHp: 9, str: 6, skl: 5, spd: 6, def: 5, res: 5, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +1 MOV, +6 STR/+6 SPD & Tinh Hà Ngũ Trảm.', accent: '#fde047' },
    ],
  },
  // 21. SAMURAI LINEAGE (Võ Sĩ Đạo -> Lãng Khách Đại Sư -> Tướng Quân Kiếm Đạo -> Thiên Kiếm Thánh Đế)
  {
    accent: '#e11d48',
    moveType: 'FOOT',
    tiers: [
      { id: 'SAMURAI', name: 'Võ Sĩ Đạo', role: 'Kiếm khách phương Đông chuyên phản kích tiên phong với kiếm khí sắc bén.', weapons: ['SWORD'], skills: ['VANTAGE', 'DUELIST_BLOW'] },
      { id: 'RONIN_MASTER', name: 'Lãng Khách Đại Sư', role: 'Bậc thầy rút kiếm chớp nhoáng, tinh thông cả Cung dài.', weapons: ['SWORD', 'BOW'], unlockSkill: 'ASTRA_FLURRY', bonuses: { maxHp: 5, str: 4, skl: 5, spd: 4, def: 2, mov: 1 }, promoDesc: 'Mở khóa Cung, +5 SKL/+4 SPD & tuyệt kỹ Tinh Hà Ngũ Trảm!', accent: '#be123c' },
      { id: 'SHOGUN_BLADE', name: 'Tướng Quân Kiếm Đạo', role: 'Thống lĩnh giáp võ sĩ uy nghi, bất bại trong quyết đấu.', weapons: ['SWORD', 'BOW', 'LANCE'], unlockSkill: 'PAVISE', bonuses: { maxHp: 7, str: 5, skl: 5, spd: 5, def: 4, res: 3 }, promoDesc: 'Mở khóa Thương và Khiên Bất Khuất (-20% ST vật lý).', accent: '#9f1239' },
      { id: 'HEAVEN_KENSEI', name: 'Thiên Kiếm Thánh Đế', role: 'Kiếm Thánh tối cao một đường đao trảm đoạn tinh tú.', weapons: ['SWORD', 'BOW', 'LANCE'], unlockSkill: 'LUNA_STRIKE', bonuses: { maxHp: 9, str: 6, skl: 7, spd: 6, def: 5, res: 4, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +7 SKL/+6 SPD, +1 MOV & Nguyệt Trảm.', accent: '#fb7185' },
    ],
  },
  // 22. SHAMAN LINEAGE (Vu Sư Cổ Ngữ -> Thông Linh Sư -> Trưởng Lão Tiên Tri -> Nguyên Sơ Thần Linh)
  {
    accent: '#7c3aed',
    moveType: 'FOOT',
    tiers: [
      { id: 'SHAMAN', name: 'Vu Sư Cổ Ngữ', role: 'Pháp sư cổ thuật kết hợp nguyên tố tự nhiên và hút sinh lực.', weapons: ['TOME'], skills: ['ARCANE_SURGE', 'LIFETAKER'] },
      { id: 'SPIRIT_CALLER', name: 'Thông Linh Đại Sư', role: 'Triệu gọi linh lực cổ đại, sử dụng cả Pháp Điển và Trượng.', weapons: ['TOME', 'STAFF'], unlockSkill: 'VOID_COLLAPSE', bonuses: { maxHp: 5, mag: 5, skl: 3, spd: 3, res: 4, mov: 1 }, promoDesc: 'Mở khóa Trượng, +5 MAG/+4 RES & Hư Không Diệt Thế!', accent: '#6d28d9' },
      { id: 'ELDER_ORACLE', name: 'Trưởng Lão Tiên Tri', role: 'Nhà tiên tri nắm giữ bí mật nguyên thủy của Aethelis.', weapons: ['TOME', 'STAFF'], unlockSkill: 'SANCTUARY_AURA', bonuses: { maxHp: 6, mag: 5, skl: 4, spd: 4, def: 3, res: 5 }, promoDesc: 'Hào Quang Cứu Rỗi trị thương toàn quân bán kính 2 ô.', accent: '#5b21b6' },
      { id: 'PRIMORDIAL_AVATAR', name: 'Nguyên Sơ Thần Linh', role: 'Hóa thân tối thượng của linh hồn đất trời.', weapons: ['TOME', 'STAFF'], unlockSkill: 'IGNIS_BURST', bonuses: { maxHp: 9, mag: 7, skl: 5, spd: 5, def: 4, res: 7, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +7 MAG/+7 RES, +1 MOV & Hỏa Ngục Bộc Phá.', accent: '#a78bfa' },
    ],
  },
  // 23. BRAWLER LINEAGE (Quyền Đấu Sĩ -> Võ Tăng Chiến Giáp -> Thiết Quyền Tông Sư -> Cự Thần Kim Cương)
  {
    accent: '#ea580c',
    moveType: 'FOOT',
    tiers: [
      { id: 'BRAWLER', name: 'Quyền Đấu Sĩ', role: 'Võ sĩ cận chiến máu trâu, tốc độ nhanh và đòn đánh cực nặng.', weapons: ['AXE', 'SWORD'], skills: ['WRATH', 'DUELIST_BLOW'] },
      { id: 'WAR_MONK', name: 'Võ Tăng Chiến Giáp', role: 'Chiến tăng kết hợp võ học và pháp trượng trị thương.', weapons: ['AXE', 'SWORD', 'STAFF'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 7, str: 4, skl: 3, spd: 4, def: 3, mov: 1 }, promoDesc: 'Mở khóa Trượng, +7 HP/+4 STR/+4 SPD & Thái Dương Kích.', accent: '#c2410c' },
      { id: 'IRON_FIST_MASTER', name: 'Thiết Quyền Tông Sư', role: 'Đỉnh cao võ đạo mình đồng da sắt, công thủ vẹn toàn.', weapons: ['AXE', 'SWORD', 'STAFF'], unlockSkill: 'PAVISE', bonuses: { maxHp: 9, str: 5, skl: 4, spd: 4, def: 5, res: 3 }, promoDesc: 'Kích hoạt Khiên Bất Khuất giảm 20% sát thương vật lý.', accent: '#9a3412' },
      { id: 'TITAN_DEMIGOD', name: 'Cự Thần Kim Cương', role: 'Bán thần võ học một quyền chấn động núi sông.', weapons: ['AXE', 'SWORD', 'STAFF'], unlockSkill: 'DRAGON_FANG', bonuses: { maxHp: 12, str: 7, skl: 5, spd: 5, def: 6, res: 4, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +12 HP/+7 STR/+6 DEF & Long Nha Xung Kích.', accent: '#fb923c' },
    ],
  },
  // 24. OUTRIDER LINEAGE (Khinh Kỵ Trinh Sát -> Du Hiệp Kỵ Sĩ -> Thương Kỵ Chân Trời -> Lôi Phong Kỵ Thần)
  {
    accent: '#06b6d4',
    moveType: 'MOUNTED',
    tiers: [
      { id: 'OUTRIDER', name: 'Khinh Kỵ Trinh Sát', role: 'Kỵ binh hạng nhẹ cơ động 7 ô, bắn tỉa và tập kích cực nhanh.', weapons: ['BOW', 'LANCE'], skills: ['CANTO_AGILITY', 'SHADOW_STEP'] },
      { id: 'RANGER_KNIGHT', name: 'Du Hiệp Kỵ Sĩ', role: 'Chuyên gia săn đuổi trên lưng ngựa với Cung & Thương.', weapons: ['BOW', 'LANCE'], unlockSkill: 'DEADEYE_SHOT', bonuses: { maxHp: 5, str: 3, skl: 5, spd: 4, def: 2, mov: 1 }, promoDesc: '+5 SKL/+4 SPD, +1 MOV & Bắn Tỉa Xuyên Giáp (+1 tầm).', accent: '#0891b2' },
      { id: 'HORIZON_LANCER', name: 'Thương Kỵ Chân Trời', role: 'Xung phong như tia chớp xuyên qua mọi phòng tuyến.', weapons: ['BOW', 'LANCE', 'SWORD'], unlockSkill: 'LUNA_STRIKE', bonuses: { maxHp: 6, str: 4, skl: 5, spd: 5, def: 3, res: 3 }, promoDesc: 'Mở khóa Kiếm & Nguyệt Trảm xuyên 50% giáp địch.', accent: '#0e7490' },
      { id: 'STORM_STRIDER', name: 'Lôi Phong Kỵ Thần', role: 'Thần kỵ cưỡi gió giông, tốc độ đứng đầu toàn đại quân.', weapons: ['BOW', 'LANCE', 'SWORD'], unlockSkill: 'ASTRA_FLURRY', bonuses: { maxHp: 8, str: 5, skl: 6, spd: 7, def: 4, res: 4, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +7 SPD, +1 MOV & Tinh Hà Ngũ Trảm.', accent: '#22d3ee' },
    ],
  },
  // 25. DARK KNIGHT LINEAGE (Hắc Kỵ Sĩ -> Ma Kỵ Tận Thế -> Tử Thần Kỵ Sĩ -> Vực Thẳm Ma Vương)
  {
    accent: '#9333ea',
    moveType: 'MOUNTED',
    tiers: [
      { id: 'DARK_KNIGHT', name: 'Hắc Kỵ Sĩ', role: 'Kỵ binh bóng tối kết hợp Thương và Hắc Pháp Điển.', weapons: ['LANCE', 'TOME'], skills: ['LIFETAKER', 'ARCANE_SURGE'] },
      { id: 'DOOM_RIDER', name: 'Ma Kỵ Tận Thế', role: 'Kỵ sĩ giáp hắc ám gieo rắc nỗi kinh hoàng bằng ma kiếm.', weapons: ['LANCE', 'TOME', 'SWORD'], unlockSkill: 'VOID_COLLAPSE', bonuses: { maxHp: 6, str: 3, mag: 4, skl: 3, def: 3, res: 3, mov: 1 }, promoDesc: 'Mở khóa Kiếm, +4 MAG/+3 STR, +1 MOV & Hư Không Diệt Thế.', accent: '#7e22ce' },
      { id: 'DEATH_KNIGHT', name: 'Tử Thần Kỵ Sĩ', role: 'Tướng quân hắc kỵ bất khả chiến bại, đánh đâu thắng đó.', weapons: ['LANCE', 'TOME', 'SWORD'], unlockSkill: 'VANTAGE', bonuses: { maxHp: 7, str: 4, mag: 5, skl: 4, spd: 4, def: 4, res: 4 }, promoDesc: 'Thức tỉnh Phản Kích Tiên Phong trên lưng chiến mã hắc ám.', accent: '#6b21a8' },
      { id: 'ABYSS_SOVEREIGN', name: 'Vực Thẳm Ma Đế', role: 'Chúa tể kỵ binh vực thẳm với hào quang hủy diệt.', weapons: ['LANCE', 'TOME', 'SWORD'], unlockSkill: 'DRAGON_FANG', bonuses: { maxHp: 10, str: 6, mag: 6, skl: 5, spd: 5, def: 5, res: 6, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +6 STR/+6 MAG, +1 MOV & Long Nha Xung Kích.', accent: '#c084fc' },
    ],
  },
  // 26. WAR CLERIC LINEAGE (Chiến Mục Sư -> Thánh Chiến Tế Ti -> Thập Tự Giám Mục -> Phẫn Nộ Thiên Sứ)
  {
    accent: '#d97706',
    moveType: 'FOOT',
    tiers: [
      { id: 'WAR_CLERIC', name: 'Chiến Mục Sư', role: 'Tu sĩ cầm Chiến Phủ vừa trị thương vừa bổ nát hàng địch.', weapons: ['AXE', 'STAFF'], skills: ['SANCTUARY_AURA', 'ROYAL_CHARM'] },
      { id: 'BATTLE_PRIEST', name: 'Thánh Chiến Tế Ti', role: 'Vừa đánh cận chiến cực rát vừa duy trì sinh lực toàn đội.', weapons: ['AXE', 'STAFF'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 6, str: 4, mag: 3, skl: 3, def: 3, res: 4, mov: 1 }, promoDesc: '+6 HP/+4 STR/+4 RES, +1 MOV & Thái Dương Kích.', accent: '#b45309' },
      { id: 'CRUSADER_BISHOP', name: 'Thập Tự Giám Mục', role: 'Thủ lĩnh thánh chiến miễn nhiễm phép thuật và áp đảo cận chiến.', weapons: ['AXE', 'STAFF', 'TOME'], unlockSkill: 'AEGIS', bonuses: { maxHp: 7, str: 5, mag: 4, skl: 4, def: 4, res: 5 }, promoDesc: 'Mở khóa Pháp Điển & Hộ Pháp Ma Lực (-25% ST phép/cung).', accent: '#92400e' },
      { id: 'WRATHFUL_SERAPH', name: 'Phẫn Nộ Thiên Sứ', role: 'Thiên sứ phán xét vung rìu thánh quang giáng xuống kẻ thù.', weapons: ['AXE', 'STAFF', 'TOME'], unlockSkill: 'IGNIS_BURST', bonuses: { maxHp: 10, str: 6, mag: 6, skl: 5, spd: 4, def: 5, res: 6, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +6 STR/+6 MAG, +1 MOV & Hỏa Ngục Bộc Phá.', accent: '#fbbf24' },
    ],
  },
  // 27. DRAGOON LINEAGE (Long Thương Bộ Binh -> Đồ Long Thương Sĩ -> Long Giáp Kỵ Sĩ -> Vĩnh Hằng Long Thương)
  {
    accent: '#0ea5e9',
    moveType: 'FOOT',
    tiers: [
      { id: 'DRAGOON', name: 'Long Thương Bộ Binh', role: 'Chiến binh giáp vảy rồng chuyên diệt kỵ binh và phi long.', weapons: ['LANCE'], skills: ['DRAGON_FANG'] },
      { id: 'WYRM_SLAYER', name: 'Đồ Long Thương Sĩ', role: 'Thợ săn rồng cầm Thương dài và Cung săn không kỵ.', weapons: ['LANCE', 'BOW'], unlockSkill: 'LUNA_STRIKE', bonuses: { maxHp: 6, str: 4, skl: 4, spd: 3, def: 4, mov: 1 }, promoDesc: 'Mở khóa Cung, +4 STR/+4 DEF, +1 MOV & Nguyệt Trảm.', accent: '#0284c7' },
      { id: 'DRAGON_KNIGHT', name: 'Long Giáp Chiến Tướng', role: 'Chiến tướng giáp long lân bất hoại, xuyên thủng mọi đội hình.', weapons: ['LANCE', 'BOW', 'SWORD'], unlockSkill: 'PAVISE', bonuses: { maxHp: 8, str: 5, skl: 5, spd: 4, def: 5, res: 3 }, promoDesc: 'Mở khóa Kiếm & Khiên Bất Khuất (-20% ST vật lý).', accent: '#0369a1' },
      { id: 'ETERNAL_DRAGOON', name: 'Vĩnh Hằng Long Đế', role: 'Huyền thoại Long Thương với uy lực xuyên phá trời xanh.', weapons: ['LANCE', 'BOW', 'SWORD'], unlockSkill: 'IGNIS_BURST', bonuses: { maxHp: 10, str: 7, skl: 6, spd: 5, def: 6, res: 4, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +7 STR/+6 DEF, +1 MOV & Hỏa Ngục Bộc Phá.', accent: '#38bdf8' },
    ],
  },
  // 28. NINJA LINEAGE (Ảnh Nhẫn -> Thượng Nhẫn -> Ảnh Kage -> Ảo Ảnh Tướng Quân)
  {
    accent: '#4f46e5',
    moveType: 'FOOT',
    tiers: [
      { id: 'NINJA', name: 'Ảnh Nhẫn', role: 'Nhẫn giả ẩn mình trong bóng tối, né tránh đỉnh cao và đánh tầm xa.', weapons: ['SWORD', 'BOW'], skills: ['SHADOW_STEP', 'DUELIST_BLOW'] },
      { id: 'MASTER_NINJA', name: 'Thượng Nhẫn', role: 'Bậc thầy ám sát với tỷ lệ chí mạng và tốc độ kinh hoàng.', weapons: ['SWORD', 'BOW'], unlockSkill: 'LETHALITY_STRIKE', bonuses: { maxHp: 4, str: 3, skl: 5, spd: 5, lck: 4, mov: 1 }, promoDesc: '+5 SKL/+5 SPD, +1 MOV & Ảnh Sát Chí Tử (+45% CM)!', accent: '#4338ca' },
      { id: 'SHADOW_KAGE', name: 'Ảnh Kage', role: 'Thủ lĩnh nhẫn tộc điều khiển ảo ảnh đoạt mạng chớp nhoáng.', weapons: ['SWORD', 'BOW'], unlockSkill: 'VANTAGE', bonuses: { maxHp: 5, str: 4, skl: 5, spd: 6, lck: 5, res: 4 }, promoDesc: 'Kích hoạt Phản Kích Tiên Phong kết hợp Ảnh Bộ chí mạng.', accent: '#3730a3' },
      { id: 'PHANTOM_SHOGUN', name: 'Ảo Ảnh Nhẫn Đế', role: 'Huyền thoại bất khả xâm phạm của giới nhẫn giả.', weapons: ['SWORD', 'BOW'], unlockSkill: 'ASTRA_FLURRY', bonuses: { maxHp: 7, str: 5, skl: 7, spd: 7, lck: 6, def: 3, res: 5, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +7 SKL/+7 SPD, +1 MOV & Tinh Hà Ngũ Trảm.', accent: '#818cf8' },
    ],
  },
  // 29. TEMPLAR LINEAGE (Thánh Điện Kỵ -> Khiên Hộ Thánh -> Pháo Đài Thánh Quang -> Thần Hộ Vệ Đế Quốc)
  {
    accent: '#eab308',
    moveType: 'ARMORED',
    tiers: [
      { id: 'TEMPLAR', name: 'Thánh Điện Kỵ', role: 'Hiệp sĩ trọng giáp bảo vệ thánh điện, kháng phép vượt trội.', weapons: ['SWORD', 'LANCE'], skills: ['PAVISE', 'ROYAL_CHARM'] },
      { id: 'AEGIS_GUARD', name: 'Khiên Hộ Thánh', role: 'Bức tường thánh quang miễn nhiễm cả vật lý lẫn ma pháp.', weapons: ['SWORD', 'LANCE', 'STAFF'], unlockSkill: 'AEGIS', bonuses: { maxHp: 7, str: 3, def: 5, res: 5, mov: 1 }, promoDesc: 'Mở khóa Trượng, +5 DEF/+5 RES, +1 MOV & Hộ Pháp Ma Lực.', accent: '#ca8a04' },
      { id: 'HOLY_BASTION', name: 'Pháo Đài Thánh Quang', role: 'Bất khả xâm phạm tuyến đầu, hồi phục liên tục cho đồng đội.', weapons: ['SWORD', 'LANCE', 'STAFF'], unlockSkill: 'SANCTUARY_AURA', bonuses: { maxHp: 9, str: 4, mag: 3, def: 6, res: 6 }, promoDesc: '+9 HP/+6 DEF/+6 RES & Hào Quang Cứu Rỗi diện rộng.', accent: '#a16207' },
      { id: 'DIVINE_WARDEN', name: 'Thần Hộ Vệ Hoàng Kim', role: 'Vệ thần tối thượng của Valoria, không đòn nào xuyên thủng.', weapons: ['SWORD', 'LANCE', 'STAFF'], unlockSkill: 'IGNIS_BURST', bonuses: { maxHp: 12, str: 6, mag: 4, def: 8, res: 8, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +12 HP/+8 DEF/+8 RES, +1 MOV & Hỏa Ngục Bộc Phá.', accent: '#fef08a' },
    ],
  },
  // 30. CHRONOMANCER LINEAGE (Thời Không Sư -> Chiêm Tinh Sư -> Dệt Sợi Thời Gian -> Vĩnh Hằng Thời Không Đế)
  {
    accent: '#22d3ee',
    moveType: 'FOOT',
    tiers: [
      { id: 'CHRONOMANCER', name: 'Thời Không Sư', role: 'Pháp sư tinh tú thao túng thời gian, chuẩn xác và tốc độ cực cao.', weapons: ['TOME', 'STAFF'], skills: ['ARCANE_SURGE', 'ROYAL_CHARM'] },
      { id: 'ASTROLOGER', name: 'Chiêm Tinh Đại Sư', role: 'Đọc vị vận mệnh chiến trường, tăng mạnh tốc độ và ma lực.', weapons: ['TOME', 'STAFF'], unlockSkill: 'SANCTUARY_AURA', bonuses: { maxHp: 4, mag: 5, skl: 4, spd: 4, res: 4, mov: 1 }, promoDesc: '+5 MAG/+4 SPD/+4 SKL, +1 MOV & Hào Quang Cứu Rỗi.', accent: '#06b6d4' },
      { id: 'TIME_WEAVER', name: 'Chức Thời Tông Sư', role: 'Bẻ cong dòng thời gian để tung đòn xuyên giáp không thể cản.', weapons: ['TOME', 'STAFF'], unlockSkill: 'LUNA_STRIKE', bonuses: { maxHp: 6, mag: 6, skl: 5, spd: 5, res: 5 }, promoDesc: 'Khai mở Nguyệt Trảm xuyên 50% kháng phép mục tiêu.', accent: '#0891b2' },
      { id: 'ETERNAL_CHRONOS', name: 'Vĩnh Hằng Thời Không Đế', role: 'Chúa tể tinh hà và thời gian, sức mạnh vượt ngoài quy luật.', weapons: ['TOME', 'STAFF'], unlockSkill: 'VOID_COLLAPSE', bonuses: { maxHp: 8, mag: 8, skl: 6, spd: 6, lck: 6, res: 7, mov: 1 }, promoDesc: 'Đạt Thần Vị Bậc IV! +8 MAG/+6 SPD, +1 MOV & Hư Không Diệt Thế.', accent: '#67e8f9' },
    ],
  },
];

export const CLASS_LINEAGES_LIST = CLASS_LINEAGES;

function buildClassMeta(): Record<UnitClassId, ClassMeta> {
  const map = {} as Record<UnitClassId, ClassMeta>;
  for (const lineage of CLASS_LINEAGES) {
    const [t1, t2, t3, t4] = lineage.tiers;
    const t2Move = t2.moveType ?? lineage.moveType;
    const t3Move = t3.moveType ?? t2Move;
    const t4Move = t4.moveType ?? t3Move;
    const t2Accent = t2.accent ?? lineage.accent;
    const t3Accent = t3.accent ?? t2Accent;
    const t4Accent = t4.accent ?? t3Accent;

    map[t1.id] = {
      id: t1.id,
      name: t1.name,
      tier: 1,
      moveType: lineage.moveType,
      accent: lineage.accent,
      roleSummary: t1.role,
      allowedWeaponTypes: t1.weapons,
      defaultSkills: t1.skills,
      promotion: {
        toClass: t2.id,
        minLevel: 5,
        sealItemId: 'master_seal',
        statBonuses: t2.bonuses,
        unlockSkill: t2.unlockSkill,
        allowedWeaponTypes: t2.weapons,
        description: t2.promoDesc,
      },
    };

    map[t2.id] = {
      id: t2.id,
      name: t2.name,
      tier: 2,
      moveType: t2Move,
      accent: t2Accent,
      roleSummary: t2.role,
      allowedWeaponTypes: t2.weapons,
      defaultSkills: Array.from(new Set([...t1.skills, t2.unlockSkill])),
      promotion: {
        toClass: t3.id,
        minLevel: 15,
        sealItemId: 'royal_crest',
        statBonuses: t3.bonuses,
        unlockSkill: t3.unlockSkill,
        allowedWeaponTypes: t3.weapons,
        description: t3.promoDesc,
      },
    };

    map[t3.id] = {
      id: t3.id,
      name: t3.name,
      tier: 3,
      moveType: t3Move,
      accent: t3Accent,
      roleSummary: t3.role,
      allowedWeaponTypes: t3.weapons,
      defaultSkills: Array.from(new Set([...t1.skills, t2.unlockSkill, t3.unlockSkill])),
      promotion: {
        toClass: t4.id,
        minLevel: 30,
        sealItemId: 'mythic_crown',
        statBonuses: t4.bonuses,
        unlockSkill: t4.unlockSkill,
        allowedWeaponTypes: t4.weapons,
        description: t4.promoDesc,
      },
    };

    map[t4.id] = {
      id: t4.id,
      name: t4.name,
      tier: 4,
      moveType: t4Move,
      accent: t4Accent,
      roleSummary: t4.role,
      allowedWeaponTypes: t4.weapons,
      defaultSkills: Array.from(new Set([...t1.skills, t2.unlockSkill, t3.unlockSkill, t4.unlockSkill])),
    };
  }

  // Unique Antagonist Boss Class
  map.DARK_GENERAL = {
    id: 'DARK_GENERAL',
    name: 'Hắc Ám Đại Tướng',
    tier: 4,
    moveType: 'ARMORED',
    accent: '#991b1b',
    roleSummary: 'Thống soái Hắc Đế quyền năng tối thượng.',
    allowedWeaponTypes: ['SWORD', 'LANCE', 'AXE', 'TOME'],
    defaultSkills: ['PAVISE', 'AEGIS', 'VOID_COLLAPSE'],
  };

  return map;
}

export const CLASS_META: Record<UnitClassId, ClassMeta> = buildClassMeta();

export const CLASS_COUNT = Object.keys(CLASS_META).length;

export function getClassLineage(classId: UnitClassId): UnitClassId[] {
  for (const lineage of CLASS_LINEAGES) {
    const ids = lineage.tiers.map((t) => t.id);
    if (ids.includes(classId)) return ids;
  }
  return [classId];
}

export interface HeroTemplate {
  templateId: string;
  name: string;
  title: string;
  classId: UnitClassId;
  unlockAct: number; // Act 1..10 when hero joins the party
  weaponId: string;
  startingInventoryIds: string[];
  portraitKey?: string;
  isLord?: boolean;
  accentColor: string;
  baseStats: Unit['stats'];
  growths: Unit['growths'];
}

export const HERO_TEMPLATES: HeroTemplate[] = [
  {
    templateId: 'kaelen',
    name: 'Kaelen',
    title: 'Hoàng Tử Valoria',
    classId: 'LORD',
    unlockAct: 1,
    weaponId: 'iron_sword',
    startingInventoryIds: ['iron_sword', 'rapier_valoria', 'steel_sword'],
    portraitKey: 'kaelen',
    isLord: true,
    accentColor: '#3b82f6',
    baseStats: { maxHp: 25, str: 9, mag: 3, skl: 10, spd: 10, lck: 8, def: 7, res: 5, mov: 5 },
    growths: { hp: 85, str: 65, mag: 25, skl: 65, spd: 65, lck: 55, def: 50, res: 35 },
  },
  {
    templateId: 'lyra',
    name: 'Lyra',
    title: 'Đội Trưởng Kỵ Sĩ',
    classId: 'CAVALIER',
    unlockAct: 1,
    weaponId: 'iron_lance',
    startingInventoryIds: ['iron_lance', 'javelin', 'ridersbane'],
    portraitKey: 'lyra',
    accentColor: '#14b8a6',
    baseStats: { maxHp: 26, str: 9, mag: 2, skl: 8, spd: 9, lck: 6, def: 8, res: 4, mov: 6 },
    growths: { hp: 80, str: 55, mag: 15, skl: 55, spd: 55, lck: 45, def: 55, res: 30 },
  },
  {
    templateId: 'soren',
    name: 'Soren',
    title: 'Quân Sư Ma Đạo',
    classId: 'MAGE',
    unlockAct: 1,
    weaponId: 'fire_tome',
    startingInventoryIds: ['fire_tome', 'thunder_tome', 'wind_tome', 'ice_tome'],
    portraitKey: 'soren',
    accentColor: '#10b981',
    baseStats: { maxHp: 21, str: 2, mag: 11, skl: 10, spd: 10, lck: 7, def: 4, res: 10, mov: 5 },
    growths: { hp: 65, str: 15, mag: 75, skl: 65, spd: 60, lck: 45, def: 25, res: 65 },
  },
  {
    templateId: 'rowan',
    name: 'Rowan',
    title: 'Xạ Thủ Rừng Già',
    classId: 'ARCHER',
    unlockAct: 1,
    weaponId: 'hunting_bow',
    startingInventoryIds: ['hunting_bow', 'short_bow', 'killer_bow'],
    accentColor: '#84cc16',
    baseStats: { maxHp: 22, str: 8, mag: 1, skl: 11, spd: 9, lck: 7, def: 5, res: 4, mov: 5 },
    growths: { hp: 70, str: 55, mag: 15, skl: 75, spd: 65, lck: 50, def: 30, res: 30 },
  },
  {
    templateId: 'elara',
    name: 'Elara',
    title: 'Nữ Tu Thánh Quang',
    classId: 'CLERIC',
    unlockAct: 1,
    weaponId: 'heal_staff',
    startingInventoryIds: ['heal_staff', 'mend_staff', 'light_shine'],
    accentColor: '#f59e0b',
    baseStats: { maxHp: 20, str: 1, mag: 10, skl: 8, spd: 8, lck: 10, def: 3, res: 10, mov: 5 },
    growths: { hp: 60, str: 10, mag: 70, skl: 55, spd: 55, lck: 70, def: 20, res: 70 },
  },
  {
    templateId: 'veyra',
    name: 'Veyra',
    title: 'Long Kỵ Sĩ Lục Lâm',
    classId: 'WYVERN_RIDER',
    unlockAct: 1,
    weaponId: 'iron_axe',
    startingInventoryIds: ['iron_axe', 'hand_axe', 'iron_lance'],
    accentColor: '#059669',
    baseStats: { maxHp: 28, str: 11, mag: 2, skl: 9, spd: 9, lck: 6, def: 10, res: 3, mov: 7 },
    growths: { hp: 85, str: 70, mag: 10, skl: 55, spd: 55, lck: 40, def: 65, res: 20 },
  },
  {
    templateId: 'sylvara',
    name: 'Sylvara',
    title: 'Nữ Ma Kiếm Sĩ Valoria',
    classId: 'SPELLBLADE',
    unlockAct: 1,
    weaponId: 'levin_sword',
    startingInventoryIds: ['levin_sword', 'steel_sword', 'ice_tome'],
    accentColor: '#ec4899',
    baseStats: { maxHp: 24, str: 8, mag: 10, skl: 10, spd: 11, lck: 7, def: 6, res: 8, mov: 5 },
    growths: { hp: 72, str: 50, mag: 65, skl: 65, spd: 70, lck: 50, def: 40, res: 55 },
  },
  {
    templateId: 'garrick',
    name: 'Garrick',
    title: 'Đội Trưởng Lính Đánh Thuê',
    classId: 'MERCENARY',
    unlockAct: 1,
    weaponId: 'steel_sword',
    startingInventoryIds: ['steel_sword', 'armorslayer', 'iron_sword'],
    accentColor: '#dc2626',
    baseStats: { maxHp: 27, str: 10, mag: 1, skl: 10, spd: 10, lck: 7, def: 8, res: 4, mov: 5 },
    growths: { hp: 85, str: 65, mag: 10, skl: 70, spd: 65, lck: 50, def: 55, res: 25 },
  },
  {
    templateId: 'zephyr',
    name: 'Zephyr',
    title: 'Thích Khách Bóng Đêm',
    classId: 'THIEF',
    unlockAct: 2,
    weaponId: 'wo_dao',
    startingInventoryIds: ['wo_dao', 'iron_sword', 'steel_sword'],
    accentColor: '#818cf8',
    baseStats: { maxHp: 23, str: 9, mag: 2, skl: 13, spd: 15, lck: 11, def: 5, res: 5, mov: 6 },
    growths: { hp: 65, str: 50, mag: 15, skl: 80, spd: 85, lck: 70, def: 25, res: 35 },
  },
  {
    templateId: 'nadia',
    name: 'Nadia',
    title: 'Nữ Thương Binh Tiên Phong',
    classId: 'SOLDIER',
    unlockAct: 2,
    weaponId: 'steel_lance',
    startingInventoryIds: ['steel_lance', 'javelin', 'killer_lance'],
    accentColor: '#0284c7',
    baseStats: { maxHp: 26, str: 10, mag: 2, skl: 11, spd: 10, lck: 8, def: 9, res: 5, mov: 5 },
    growths: { hp: 80, str: 60, mag: 15, skl: 70, spd: 65, lck: 55, def: 60, res: 35 },
  },
  {
    templateId: 'mira',
    name: 'Mira',
    title: 'Kỵ Sĩ Thiên Mã',
    classId: 'PEGASUS',
    unlockAct: 3,
    weaponId: 'silver_lance',
    startingInventoryIds: ['silver_lance', 'javelin', 'ridersbane'],
    accentColor: '#38bdf8',
    baseStats: { maxHp: 24, str: 9, mag: 4, skl: 11, spd: 14, lck: 9, def: 6, res: 10, mov: 7 },
    growths: { hp: 70, str: 50, mag: 30, skl: 70, spd: 75, lck: 60, def: 35, res: 60 },
  },
  {
    templateId: 'cassian',
    name: 'Cassian',
    title: 'Tu Sĩ Quang Minh',
    classId: 'MONK',
    unlockAct: 3,
    weaponId: 'divine_tome',
    startingInventoryIds: ['divine_tome', 'light_shine', 'heal_staff'],
    accentColor: '#eab308',
    baseStats: { maxHp: 24, str: 3, mag: 12, skl: 11, spd: 11, lck: 10, def: 6, res: 12, mov: 5 },
    growths: { hp: 70, str: 15, mag: 75, skl: 65, spd: 60, lck: 65, def: 35, res: 75 },
  },
  {
    templateId: 'borin',
    name: 'Borin',
    title: 'Bức Tường Thép',
    classId: 'KNIGHT',
    unlockAct: 4,
    weaponId: 'silver_lance',
    startingInventoryIds: ['silver_lance', 'javelin', 'hammer_axe'],
    accentColor: '#94a3b8',
    baseStats: { maxHp: 33, str: 12, mag: 1, skl: 8, spd: 5, lck: 5, def: 15, res: 5, mov: 5 },
    growths: { hp: 95, str: 65, mag: 5, skl: 45, spd: 25, lck: 35, def: 80, res: 25 },
  },
  {
    templateId: 'kaelith',
    name: 'Kaelith',
    title: 'Du Mục Thảo Nguyên',
    classId: 'NOMAD',
    unlockAct: 4,
    weaponId: 'wind_bow',
    startingInventoryIds: ['wind_bow', 'short_bow', 'killer_bow'],
    accentColor: '#16a34a',
    baseStats: { maxHp: 26, str: 10, mag: 2, skl: 12, spd: 14, lck: 9, def: 7, res: 6, mov: 7 },
    growths: { hp: 75, str: 55, mag: 15, skl: 75, spd: 80, lck: 55, def: 40, res: 35 },
  },
  {
    templateId: 'kain',
    name: 'Kain',
    title: 'Kiếm Khách Lãng Du',
    classId: 'MYRMIDON',
    unlockAct: 5,
    weaponId: 'wo_dao',
    startingInventoryIds: ['wo_dao', 'steel_sword', 'brave_sword'],
    accentColor: '#f43f5e',
    baseStats: { maxHp: 27, str: 11, mag: 2, skl: 14, spd: 16, lck: 8, def: 7, res: 5, mov: 6 },
    growths: { hp: 75, str: 55, mag: 15, skl: 80, spd: 80, lck: 55, def: 35, res: 30 },
  },
  {
    templateId: 'morgath',
    name: 'Morgath',
    title: 'Hắc Pháp Sư Ẩn Sĩ',
    classId: 'DARK_MAGE',
    unlockAct: 6,
    weaponId: 'nosferatu',
    startingInventoryIds: ['nosferatu', 'dark_flux', 'luna_tome'],
    accentColor: '#a855f7',
    baseStats: { maxHp: 26, str: 3, mag: 14, skl: 11, spd: 10, lck: 6, def: 8, res: 12, mov: 5 },
    growths: { hp: 75, str: 15, mag: 80, skl: 60, spd: 55, lck: 40, def: 45, res: 70 },
  },
  {
    templateId: 'tormund',
    name: 'Tormund',
    title: 'Chiến Binh Cuồng Rìu',
    classId: 'FIGHTER',
    unlockAct: 7,
    weaponId: 'killer_axe',
    startingInventoryIds: ['killer_axe', 'hand_axe', 'hammer_axe'],
    accentColor: '#ea580c',
    baseStats: { maxHp: 35, str: 15, mag: 1, skl: 10, spd: 11, lck: 7, def: 9, res: 4, mov: 5 },
    growths: { hp: 95, str: 80, mag: 5, skl: 55, spd: 60, lck: 45, def: 45, res: 20 },
  },
  // 13 New Heroes representing Lineages #18 -> #30!
  {
    templateId: 'celeste',
    name: 'Celeste',
    title: 'Nữ Kỵ Y Sư Hoàng Gia',
    classId: 'TROUBADOUR',
    unlockAct: 2,
    weaponId: 'mend_staff',
    startingInventoryIds: ['mend_staff', 'heal_staff', 'light_shine'],
    accentColor: '#f472b6',
    baseStats: { maxHp: 22, str: 2, mag: 11, skl: 9, spd: 11, lck: 11, def: 5, res: 11, mov: 6 },
    growths: { hp: 65, str: 10, mag: 75, skl: 60, spd: 70, lck: 75, def: 25, res: 75 },
  },
  {
    templateId: 'drake',
    name: 'Drake',
    title: 'Thuyền Trưởng Hải Tặc',
    classId: 'PIRATE',
    unlockAct: 2,
    weaponId: 'killer_axe',
    startingInventoryIds: ['killer_axe', 'hand_axe', 'iron_axe'],
    accentColor: '#0d9488',
    baseStats: { maxHp: 29, str: 12, mag: 1, skl: 9, spd: 12, lck: 9, def: 7, res: 3, mov: 5 },
    growths: { hp: 88, str: 72, mag: 10, skl: 58, spd: 72, lck: 60, def: 42, res: 20 },
  },
  {
    templateId: 'aurelia',
    name: 'Aurelia',
    title: 'Kỵ Sĩ Sư Ưng Hoàng Kim',
    classId: 'GRIFFIN_RIDER',
    unlockAct: 3,
    weaponId: 'silver_lance',
    startingInventoryIds: ['silver_lance', 'javelin', 'iron_axe'],
    accentColor: '#f59e0b',
    baseStats: { maxHp: 27, str: 11, mag: 3, skl: 11, spd: 13, lck: 8, def: 9, res: 7, mov: 7 },
    growths: { hp: 80, str: 65, mag: 20, skl: 68, spd: 72, lck: 55, def: 52, res: 45 },
  },
  {
    templateId: 'kenji',
    name: 'Kenji',
    title: 'Võ Sĩ Đạo Phương Đông',
    classId: 'SAMURAI',
    unlockAct: 3,
    weaponId: 'wo_dao',
    startingInventoryIds: ['wo_dao', 'steel_sword', 'brave_sword'],
    accentColor: '#e11d48',
    baseStats: { maxHp: 26, str: 11, mag: 2, skl: 14, spd: 14, lck: 8, def: 8, res: 5, mov: 5 },
    growths: { hp: 78, str: 64, mag: 15, skl: 82, spd: 78, lck: 55, def: 48, res: 32 },
  },
  {
    templateId: 'orion',
    name: 'Orion',
    title: 'Vu Sư Cổ Ngữ Rừng Sâu',
    classId: 'SHAMAN',
    unlockAct: 4,
    weaponId: 'nosferatu',
    startingInventoryIds: ['nosferatu', 'wind_tome', 'dark_flux'],
    accentColor: '#7c3aed',
    baseStats: { maxHp: 24, str: 2, mag: 13, skl: 10, spd: 10, lck: 8, def: 6, res: 12, mov: 5 },
    growths: { hp: 72, str: 10, mag: 80, skl: 62, spd: 58, lck: 50, def: 38, res: 72 },
  },
  {
    templateId: 'brutus',
    name: 'Brutus',
    title: 'Quyền Đấu Sĩ Bất Khuất',
    classId: 'BRAWLER',
    unlockAct: 4,
    weaponId: 'hammer_axe',
    startingInventoryIds: ['hammer_axe', 'killer_axe', 'steel_sword'],
    accentColor: '#ea580c',
    baseStats: { maxHp: 33, str: 13, mag: 2, skl: 10, spd: 12, lck: 7, def: 10, res: 4, mov: 5 },
    growths: { hp: 92, str: 74, mag: 15, skl: 60, spd: 68, lck: 48, def: 58, res: 25 },
  },
  {
    templateId: 'falkor',
    name: 'Falkor',
    title: 'Khinh Kỵ Trinh Sát Bão Tố',
    classId: 'OUTRIDER',
    unlockAct: 5,
    weaponId: 'wind_bow',
    startingInventoryIds: ['wind_bow', 'silver_lance', 'killer_bow'],
    accentColor: '#06b6d4',
    baseStats: { maxHp: 26, str: 11, mag: 2, skl: 13, spd: 15, lck: 10, def: 7, res: 6, mov: 7 },
    growths: { hp: 76, str: 60, mag: 15, skl: 78, spd: 82, lck: 62, def: 42, res: 38 },
  },
  {
    templateId: 'malrik',
    name: 'Malrik',
    title: 'Hắc Kỵ Sĩ Lãng Du',
    classId: 'DARK_KNIGHT',
    unlockAct: 5,
    weaponId: 'luna_tome',
    startingInventoryIds: ['luna_tome', 'silver_lance', 'dark_flux'],
    accentColor: '#9333ea',
    baseStats: { maxHp: 29, str: 11, mag: 12, skl: 10, spd: 11, lck: 7, def: 10, res: 10, mov: 6 },
    growths: { hp: 82, str: 58, mag: 68, skl: 62, spd: 60, lck: 45, def: 58, res: 58 },
  },
  {
    templateId: 'seraphina',
    name: 'Seraphina',
    title: 'Chiến Mục Sư Thánh Phủ',
    classId: 'WAR_CLERIC',
    unlockAct: 6,
    weaponId: 'killer_axe',
    startingInventoryIds: ['killer_axe', 'mend_staff', 'hand_axe'],
    accentColor: '#d97706',
    baseStats: { maxHp: 28, str: 12, mag: 10, skl: 10, spd: 10, lck: 10, def: 9, res: 11, mov: 5 },
    growths: { hp: 82, str: 65, mag: 58, skl: 58, spd: 56, lck: 65, def: 52, res: 64 },
  },
  {
    templateId: 'darius',
    name: 'Darius',
    title: 'Long Thương Đồ Long',
    classId: 'DRAGOON',
    unlockAct: 6,
    weaponId: 'dragon_spear',
    startingInventoryIds: ['dragon_spear', 'javelin', 'silver_lance'],
    accentColor: '#0ea5e9',
    baseStats: { maxHp: 31, str: 14, mag: 2, skl: 12, spd: 11, lck: 8, def: 12, res: 6, mov: 5 },
    growths: { hp: 88, str: 74, mag: 12, skl: 72, spd: 62, lck: 50, def: 68, res: 35 },
  },
  {
    templateId: 'kage',
    name: 'Kage',
    title: 'Ảnh Nhẫn U Minh',
    classId: 'NINJA',
    unlockAct: 7,
    weaponId: 'brave_sword',
    startingInventoryIds: ['brave_sword', 'wo_dao', 'killer_bow'],
    accentColor: '#4f46e5',
    baseStats: { maxHp: 25, str: 11, mag: 3, skl: 16, spd: 17, lck: 12, def: 6, res: 8, mov: 6 },
    growths: { hp: 68, str: 56, mag: 20, skl: 86, spd: 88, lck: 72, def: 32, res: 48 },
  },
  {
    templateId: 'valen',
    name: 'Valen',
    title: 'Thánh Điện Kỵ Sĩ',
    classId: 'TEMPLAR',
    unlockAct: 8,
    weaponId: 'silver_lance',
    startingInventoryIds: ['silver_lance', 'steel_sword', 'mend_staff'],
    accentColor: '#eab308',
    baseStats: { maxHp: 35, str: 13, mag: 6, skl: 11, spd: 8, lck: 10, def: 16, res: 14, mov: 5 },
    growths: { hp: 94, str: 65, mag: 35, skl: 58, spd: 40, lck: 62, def: 82, res: 76 },
  },
  {
    templateId: 'astraea',
    name: 'Astraea',
    title: 'Thời Không Sư Tinh Tú',
    classId: 'CHRONOMANCER',
    unlockAct: 8,
    weaponId: 'astral_tome',
    startingInventoryIds: ['astral_tome', 'physic_staff', 'thunder_tome'],
    accentColor: '#22d3ee',
    baseStats: { maxHp: 25, str: 2, mag: 16, skl: 14, spd: 14, lck: 12, def: 7, res: 15, mov: 5 },
    growths: { hp: 68, str: 10, mag: 86, skl: 78, spd: 76, lck: 72, def: 35, res: 82 },
  },
];

export const STARTING_CONVOY_WEAPONS: string[] = [
  'steel_sword',
  'armorslayer',
  'wo_dao',
  'wind_edge',
  'javelin',
  'silver_lance',
  'ridersbane',
  'hand_axe',
  'killer_axe',
  'hammer_axe',
  'short_bow',
  'killer_bow',
  'wind_bow',
  'elfire_tome',
  'thunder_tome',
  'wind_tome',
  'ice_tome',
  'light_shine',
  'dark_flux',
  'nosferatu',
  'mend_staff',
  'physic_staff',
  'runesword',
  'brave_sword',
  'brave_lance',
  'brave_bow',
  'luna_tome',
  'astral_tome',
  'valoria_blade',
  'dragon_spear',
];

const DEFAULT_HERO_TITLES: Record<string, string> = {
  kaelen: 'field_scout',       // RARE (Azure Sapphire Aura — Mythic earned through campaign deeds!)
  lyra: 'field_scout',         // RARE (Azure Sapphire Aura)
  soren: 'arcane_initiate',    // EPIC (Amethyst Violet Aura)
  rowan: 'vanguard_valoria',   // COMMON (No Aura)
  elara: 'vanguard_valoria',   // COMMON (No Aura)
  veyra: 'field_scout',        // RARE (Azure Sapphire Aura)
  sylvara: 'arcane_initiate',  // EPIC (Amethyst Violet Aura)
  garrick: 'vanguard_valoria', // COMMON (No Aura)
};

export function createInitialRoster(): SavedHeroProgress[] {
  const { starterLoadouts } = createStarterEquipmentBag();
  return HERO_TEMPLATES.map((h) => ({
    templateId: h.templateId,
    classId: h.classId,
    tier: 1,
    promoted: false,
    equippedTitleId: DEFAULT_HERO_TITLES[h.templateId] ?? 'vanguard_valoria',
    // Balanced Act-1 curve: Veyra starts as a seasoned Lv.3 vanguard (reaching Lv.5 promotion naturally in Act I)
    level: h.templateId === 'veyra' ? 3 : h.unlockAct === 1 ? 1 : Math.max(2, h.unlockAct * 3 - 2),
    exp: 0,
    stats: { ...h.baseStats },
    weaponId: h.weaponId,
    equippedArmorUids: starterLoadouts[h.templateId] ? { ...starterLoadouts[h.templateId] } : {},
    inventoryIds: [...h.startingInventoryIds],
    skills: [...CLASS_META[h.classId].defaultSkills],
    potions: 2,
  }));
}

function hydrateHeroTemplateToUnit(
  tpl: HeroTemplate,
  actNumber: number,
  savedRoster: SavedHeroProgress[],
  recommendedLevel: number,
  bagByUid: Map<string, EquipmentInstance>,
  weaponForges: Record<string, WeaponForgeState>
): Unit {
  const saved = savedRoster.find((r) => r.templateId === tpl.templateId);
  const activeClassId = saved?.classId ?? tpl.classId;
  const classMeta = CLASS_META[activeClassId] ?? CLASS_META[tpl.classId];
  const baseLevel = saved ? saved.level : Math.max(1, recommendedLevel - 1);

  let weaponId = saved?.weaponId ?? tpl.weaponId;
  if (!saved?.weaponId) {
    if (actNumber >= 7 && tpl.templateId === 'kaelen') weaponId = 'valoria_blade';
    else if (actNumber >= 4 && weaponId === 'iron_sword') weaponId = 'steel_sword';
    else if (actNumber >= 5 && weaponId === 'iron_lance') weaponId = 'silver_lance';
    else if (actNumber >= 8 && weaponId === 'silver_lance') weaponId = 'dragon_spear';
    else if (actNumber >= 5 && weaponId === 'hunting_bow') weaponId = 'wind_bow';
    else if (actNumber >= 5 && weaponId === 'fire_tome') weaponId = 'thunder_tome';
    else if (actNumber >= 8 && weaponId === 'thunder_tome') weaponId = 'astral_tome';
  }

  const stats = saved ? { ...saved.stats } : { ...tpl.baseStats };
  // Ensure Armored Knights get balanced mov >= 5 on legacy saves
  if (activeClassId === 'KNIGHT' && stats.mov < 5) {
    stats.mov = 5;
  }

  const targetFloorLevel = Math.max(1, recommendedLevel - 2);
  if (baseLevel < targetFloorLevel) {
    const diff = targetFloorLevel - baseLevel;
    stats.maxHp += Math.round(diff * (tpl.growths.hp / 100));
    stats.str += Math.round(diff * (tpl.growths.str / 100));
    stats.mag += Math.round(diff * (tpl.growths.mag / 100));
    stats.skl += Math.round(diff * (tpl.growths.skl / 100));
    stats.spd += Math.round(diff * (tpl.growths.spd / 100));
    stats.lck += Math.round(diff * (tpl.growths.lck / 100));
    stats.def += Math.round(diff * (tpl.growths.def / 100));
    stats.res += Math.round(diff * (tpl.growths.res / 100));
  }

  const equippedWeapon = WEAPONS[weaponId] ?? WEAPONS[tpl.weaponId];
  const rawInvIds = saved?.inventoryIds
    ? [equippedWeapon.id, ...saved.inventoryIds.filter((id) => id !== equippedWeapon.id)]
    : Array.from(new Set([equippedWeapon.id, ...tpl.startingInventoryIds])).slice(0, 4);
  // 1 equipped weapon in hand + up to 6 spare weapons in personal bag = max 7 weapons
  const inventory = rawInvIds
    .map((id) => WEAPONS[id])
    .filter((w): w is Weapon => Boolean(w))
    .slice(0, 7);

  const skills = Array.from(
    new Set([...(saved?.skills ?? classMeta.defaultSkills), ...classMeta.defaultSkills])
  );

  // 5-slot worn armor (Mũ, Giáp, Giáp tay, Giáp chân, Giày) does NOT consume any of the 6 personal bag slots
  const equipment: Partial<Record<ArmorSlot, EquipmentInstance>> = {};
  const wornUidSet = new Set<string>();
  if (saved?.equippedArmorUids) {
    for (const slot of ARMOR_SLOTS) {
      const uid = saved.equippedArmorUids[slot];
      if (uid && bagByUid.has(uid)) {
        equipment[slot] = bagByUid.get(uid)!;
        wornUidSet.add(uid);
      }
    }
  }

  const spareWeaponCount = inventory.filter((w, idx) => !(idx === 0 && w.id === equippedWeapon.id)).length;
  let remainingSlots = Math.max(0, 6 - spareWeaponCount);
  const carriedArmorUids = (saved?.carriedArmorUids ?? [])
    .filter((uid) => bagByUid.has(uid) && !wornUidSet.has(uid))
    .slice(0, remainingSlots);
  remainingSlots = Math.max(0, remainingSlots - carriedArmorUids.length);

  const carriedItems = (saved?.carriedItemIds ?? [])
    .filter((id) => Boolean(ITEMS[id] || GEMS[id]))
    .slice(0, remainingSlots);
  remainingSlots = Math.max(0, remainingSlots - carriedItems.length);

  const rawPotions = saved?.potions !== undefined ? Math.max(0, saved.potions) : 2;
  const potions = Math.min(remainingSlots, rawPotions);

  const weaponForge = weaponForges[equippedWeapon.id];
  const unitBase: Unit = {
    id: `ally_${tpl.templateId}`,
    templateId: tpl.templateId,
    name: tpl.name,
    title: tpl.title,
    equippedTitleId: saved?.equippedTitleId ?? DEFAULT_HERO_TITLES[tpl.templateId] ?? 'vanguard_valoria',
    classId: activeClassId,
    className: classMeta.name,
    tier: classMeta.tier,
    promoted: Boolean(saved?.promoted || classMeta.tier > 1),
    faction: 'PLAYER',
    moveType: classMeta.moveType,
    level: Math.max(baseLevel, targetFloorLevel),
    exp: saved?.exp ?? 0,
    hp: stats.maxHp,
    sp: 60,
    maxSp: 100,
    stats,
    growths: { ...tpl.growths },
    weapon: equippedWeapon,
    weaponForge,
    equipment,
    inventory,
    carriedItems,
    carriedArmorUids,
    skills,
    potions,
    x: 0,
    y: 0,
    acted: false,
    isLord: tpl.isLord,
    aiPolicy: 'CHASER',
    portraitKey: tpl.portraitKey,
    accentColor: tpl.accentColor,
  };

  const eqBonus = getUnitEquipmentBonuses(unitBase);
  unitBase.hp = stats.maxHp + eqBonus.stats.maxHp;
  return unitBase;
}

/**
 * Builds ALL unlocked playable heroes for the given Act (up to all 30 lineages!),
 * removing the old 8-unit ceiling so players can freely assemble their battle squad.
 */
export function buildUnlockedRosterUnits(
  actNumber: number,
  savedRoster: SavedHeroProgress[],
  recommendedLevel: number,
  equipmentBag: EquipmentInstance[] = [],
  weaponForges: Record<string, WeaponForgeState> = {}
): Unit[] {
  const unlockedTemplates = HERO_TEMPLATES.filter((h) => h.unlockAct <= actNumber);
  const bagByUid = new Map<string, EquipmentInstance>();
  for (const eq of equipmentBag) {
    bagByUid.set(eq.uid, eq);
  }
  return unlockedTemplates.map((tpl) =>
    hydrateHeroTemplateToUnit(tpl, actNumber, savedRoster, recommendedLevel, bagByUid, weaponForges)
  );
}

/**
 * Selects the active deployed squad for a battle (always led by Lord Kaelen),
 * honoring player-preferred squad IDs when provided and filling remaining slots
 * with role-diverse unlocked heroes up to `maxDeploySlots`.
 */
export function buildPartyUnitsForAct(
  actNumber: number,
  savedRoster: SavedHeroProgress[],
  recommendedLevel: number,
  equipmentBag: EquipmentInstance[] = [],
  weaponForges: Record<string, WeaponForgeState> = {},
  maxDeploySlots = 8,
  preferredSquadIds?: string[]
): Unit[] {
  const allUnlocked = buildUnlockedRosterUnits(
    actNumber,
    savedRoster,
    recommendedLevel,
    equipmentBag,
    weaponForges
  );
  const limit = Math.max(1, Math.min(allUnlocked.length, maxDeploySlots));
  const lord = allUnlocked.find((u) => u.isLord) ?? allUnlocked[0];
  if (!lord) return [];

  const chosen: Unit[] = [lord];
  const chosenIds = new Set<string>([lord.templateId]);

  if (preferredSquadIds && preferredSquadIds.length > 0) {
    for (const tid of preferredSquadIds) {
      if (chosen.length >= limit) break;
      if (chosenIds.has(tid)) continue;
      const match = allUnlocked.find((u) => u.templateId === tid);
      if (match) {
        chosen.push(match);
        chosenIds.add(tid);
      }
    }
  }

  // Prioritize newly unlocked Act heroes first when no custom preference is saved yet,
  // ensuring a balanced mix (healer + flyer/cavalry + magic + frontline)
  const remaining = allUnlocked.filter((u) => !chosenIds.has(u.templateId));
  // Guarantee at least one Staff healer if available and not yet in squad
  if (chosen.length < limit && !chosen.some((u) => u.weapon.type === 'STAFF')) {
    const healer = remaining.find((u) => u.weapon.type === 'STAFF');
    if (healer) {
      chosen.push(healer);
      chosenIds.add(healer.templateId);
    }
  }

  // Sort remaining candidates slightly favoring newest Act recruits & higher level veterans
  const sortedRemaining = allUnlocked
    .filter((u) => !chosenIds.has(u.templateId))
    .sort((a, b) => {
      const tplA = HERO_TEMPLATES.find((h) => h.templateId === a.templateId);
      const tplB = HERO_TEMPLATES.find((h) => h.templateId === b.templateId);
      const recentA = tplA?.unlockAct === actNumber ? 1 : 0;
      const recentB = tplB?.unlockAct === actNumber ? 1 : 0;
      if (recentB !== recentA) return recentB - recentA;
      return b.level - a.level;
    });

  for (const cand of sortedRemaining) {
    if (chosen.length >= limit) break;
    chosen.push(cand);
    chosenIds.add(cand.templateId);
  }

  return chosen;
}
