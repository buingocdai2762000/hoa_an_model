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
  UnitDomain,
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

export const UNIT_DOMAIN_LABEL: Record<UnitDomain, string> = {
  INFANTRY: 'Bộ Binh & Đặc Nhiệm',
  ARMOR: 'Thiết Giáp & Cơ Giới',
  ARTILLERY: 'Pháo Binh & Tên Lửa',
  AIRCRAFT: 'Không Quân Chiến Đấu',
  NAVAL: 'Hải Quân Chiến Hạm',
};

export const WEATHER_DATA: Record<WeatherType, WeatherInfo> = {
  NONE: {
    id: 'NONE',
    name: 'Trời Quang Đãng',
    shortEffect: 'Tầm nhìn chuẩn xác ổn định',
    description: 'Bầu trời quang đãng, mọi binh chủng Lục – Thiết – Pháo – Không – Hải phát huy tối đa thông số kỹ thuật.',
    accentColor: '#94a3b8',
    badgeBg: 'rgba(30, 41, 59, 0.88)',
  },
  SUNLIGHT: {
    id: 'SUNLIGHT',
    name: 'Nắng Gắt Chiến Tuyến',
    shortEffect: 'Đạn Nhiệt & Chiếu Sáng +18% ST · Quân y +15%',
    description: 'Quang độ cao giúp trinh sát pháo, đạn nhiệt nổ và công tác quân y dã chiến đạt hiệu suất vượt trội.',
    accentColor: '#fbbf24',
    badgeBg: 'rgba(120, 53, 15, 0.84)',
    elementDamageBonus: { FIRE: 0.18, LIGHT: 0.18, DARK: -0.1 },
    healMod: 0.15,
  },
  LEAVES: {
    id: 'LEAVES',
    name: 'Gió Mùa Mặt Trận',
    shortEffect: 'Không Kích +15% ST · +8% Né toàn quân',
    description: 'Luồng gió xuôi chiều nâng tầm cơ động phi đội không kích và che khuất đường đạn tầm xa.',
    accentColor: '#a3e635',
    badgeBg: 'rgba(54, 83, 20, 0.84)',
    elementDamageBonus: { WIND: 0.15 },
    allAvoidMod: 8,
  },
  RAIN: {
    id: 'RAIN',
    name: 'Mưa Bùn Chiến Hào',
    shortEffect: 'Pháo Xung Kích +20% · Nhiệt -15% · Bắn tỉa -10% CX',
    description: 'Mưa lớn làm lầy lội chiến hào và giảm tầm kính ngắm, nhưng tăng sức ép sóng xung kích đạn pháo.',
    accentColor: '#60a5fa',
    badgeBg: 'rgba(30, 58, 138, 0.86)',
    elementDamageBonus: { THUNDER: 0.2, FIRE: -0.15 },
    bowHitMod: -10,
  },
  STORM: {
    id: 'STORM',
    name: 'Giông Bão Đại Dương',
    shortEffect: 'Xung Kích +30% ST · +10% CM · Bắn tỉa -15% CX',
    description: 'Sóng dữ và sấm chớp dữ dội trên biển khơi đẩy đòn hải pháo & xung kích lên cực đại nhưng hạn chế xạ thủ.',
    accentColor: '#38bdf8',
    badgeBg: 'rgba(12, 74, 110, 0.88)',
    elementDamageBonus: { THUNDER: 0.3, WIND: 0.15, FIRE: -0.2 },
    bowHitMod: -15,
    allCritMod: 10,
  },
  MIST: {
    id: 'MIST',
    name: 'Sương Mù Biển Bắc',
    shortEffect: 'Pháo Nặng +15% ST · +14% Né · -10% CX',
    description: 'Sương mù dày đặc giúp tàu ngầm U-Boat và biệt kích ẩn mình né đạn, giảm tầm quan sát quang học.',
    accentColor: '#cbd5e1',
    badgeBg: 'rgba(51, 65, 85, 0.88)',
    elementDamageBonus: { DARK: 0.15, LIGHT: -0.1 },
    allAvoidMod: 14,
    allHitMod: -10,
  },
  SAND: {
    id: 'SAND',
    name: 'Bão Cát Bắc Phi',
    shortEffect: 'Đột kích gần +2 ST · Bắn tỉa -12% CX · -6% CX',
    description: 'Cát đỏ sa mạc che mờ kính ngắm tầm xa, tạo cơ hội vàng cho thiết giáp và bộ binh áp sát công kích.',
    accentColor: '#f59e0b',
    badgeBg: 'rgba(113, 63, 18, 0.86)',
    meleeDamageBonus: 2,
    bowHitMod: -12,
    allHitMod: -6,
  },
  SNOW: {
    id: 'SNOW',
    name: 'Bão Tuyết Mùa Đông',
    shortEffect: 'Đạn Sơn Cước/Hàn Băng +25% · Nhiệt -15% · +8% Né',
    description: 'Tuyết lạnh âm ba mươi độ phủ trắng mặt trận, tăng uy lực pháo sơn cước và khả năng ngụy trang mùa đông.',
    accentColor: '#e0f2fe',
    badgeBg: 'rgba(14, 116, 144, 0.86)',
    elementDamageBonus: { ICE: 0.25, FIRE: -0.15 },
    allAvoidMod: 8,
  },
  EMBERS: {
    id: 'EMBERS',
    name: 'Bão Lửa Pháo Kích',
    shortEffect: 'Đạn Nhiệt +25% ST · Xung kích gần +2 ST',
    description: 'Khói lửa đạn pháo rực đỏ khắp phòng tuyến, khuếch đại sức công phá của súng phun lửa, nhiệt áp và xung kích.',
    accentColor: '#fb923c',
    badgeBg: 'rgba(124, 45, 18, 0.88)',
    elementDamageBonus: { FIRE: 0.25, ICE: -0.15 },
    meleeDamageBonus: 2,
  },
  SPARKS: {
    id: 'SPARKS',
    name: 'Đêm Pháo Sáng Tổng Lực',
    shortEffect: 'Pháo/Không Kích +3 ST · +12% CM · Nặng/Sáng +15%',
    description: 'Hàng trăm đèn pha phòng không và pháo sáng rọi rực trời đêm, mở khóa hỏa lực pháo binh và chí mạng toàn mặt trận.',
    accentColor: '#e879f9',
    badgeBg: 'rgba(88, 28, 135, 0.88)',
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
 * then smoothly shifts every 3 turns through a theater-coherent meteorological progression.
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
  kaelen: '/src/assets/images/ww_portrait_commander_1795612384550.jpg',
  malakor: '/src/assets/images/ww_portrait_marshal_1795612382620.jpg',
};

export const TITLE_BG_ASSET = '/src/assets/images/ww_title_bg_1795612377750.jpg';

export const BATTLE_STAGE_ASSETS = {
  plains: '/src/assets/images/ww_stage_frontline_1795612380054.jpg',
  citadel: '/src/assets/images/ww_stage_naval_fortress_1795612382194.jpg',
};

export const MAGIC_ELEMENT_LABEL: Record<MagicElement, string> = {
  NONE: 'Đạn Động Năng',
  FIRE: 'Đạn Nhiệt Nổ',
  THUNDER: 'Pháo Xung Kích',
  WIND: 'Không Kích',
  ICE: 'Sơn Cước / Hàn Đới',
  LIGHT: 'Pháo Chiếu Sáng',
  DARK: 'Pháo Hạng Nặng',
};

export const WEAPON_TYPE_LABEL: Record<WeaponType, string> = {
  SWORD: 'Súng Bộ Binh',
  LANCE: 'Pháo Xuyên Giáp',
  AXE: 'Hỏa Lực Nặng',
  BOW: 'Bắn Tỉa / P.Không',
  TOME: 'Pháo / Không Kích',
  STAFF: 'Quân Y / Công Binh',
};

export const SKILLS: Record<SkillId, SkillDef> = {
  // === ACTIVE COMBAT ARTS (CHIẾN THUẬT CHỦ ĐỘNG) ===
  LUNA_STRIKE: {
    id: 'LUNA_STRIKE',
    name: 'Đạn Lõi Thép Xuyên Giáp',
    kind: 'ACTIVE',
    shortDesc: 'Xuyên 50% giáp/công sự, +4 ST',
    detailDesc: 'Khai hỏa đạn xuyên giáp tốc độ cao bỏ qua 50% DEF/RES mục tiêu, tăng +4 sát thương và +10% chính xác.',
    accentColor: '#38bdf8',
    spCost: 35,
    damageBonus: 4,
    hitBonus: 10,
    ignoreDefenseRatio: 0.5,
  },
  SOL_STRIKE: {
    id: 'SOL_STRIKE',
    name: 'Tiếp Viện Khẩn Cấp',
    kind: 'ACTIVE',
    shortDesc: 'Khôi phục 50% ST thành HP, +3 ST',
    detailDesc: 'Vừa công kích áp chế vừa thu hồi tiếp tế chiến trường, hồi phục 50% sát thương gây ra thành HP.',
    accentColor: '#fbbf24',
    spCost: 35,
    damageBonus: 3,
    hitBonus: 10,
    drainRatio: 0.5,
  },
  ASTRA_FLURRY: {
    id: 'ASTRA_FLURRY',
    name: 'Loạt Bắn Tốc Xạ Liên Thanh',
    kind: 'ACTIVE',
    shortDesc: 'ST ×1.45, +20% Chí mạng',
    detailDesc: 'Xả toàn bộ băng đạn/loạt pháo liên hoàn với mật độ dày đặc, nhân 1.45 sát thương và +20% chí mạng.',
    accentColor: '#f43f5e',
    spCost: 45,
    damageMultiplier: 1.45,
    critBonus: 20,
    hitBonus: 10,
  },
  IGNIS_BURST: {
    id: 'IGNIS_BURST',
    name: 'Loạt Pháo Hủy Diệt Toàn Khẩu Đội',
    kind: 'ACTIVE',
    shortDesc: 'Cộng 50% DEF/MAG vào ST',
    detailDesc: 'Huy động toàn bộ hỏa lực thiết giáp hoặc tọa độ pháo binh, cộng 50% chỉ số cao hơn giữa DEF/MAG vào sát thương.',
    accentColor: '#fb923c',
    spCost: 35,
    scaleByStat: 'def',
    scaleRatio: 0.5,
    hitBonus: 10,
  },
  DEADEYE_SHOT: {
    id: 'DEADEYE_SHOT',
    name: 'Khóa Ngắm Quang Học Tầm Xa',
    kind: 'ACTIVE',
    shortDesc: '+35% CX, +25% CM, +1 Tầm bắn',
    detailDesc: 'Sử dụng kính ngắm quang học độ phóng đại cao tăng +1 ô tầm bắn, +35% chính xác và +25% chí mạng.',
    accentColor: '#84cc16',
    spCost: 35,
    damageBonus: 3,
    hitBonus: 35,
    critBonus: 25,
    rangeBonus: 1,
  },
  DRAGON_FANG: {
    id: 'DRAGON_FANG',
    name: 'Cắt Bom Bổ Nhào / Ngư Lôi Đột Kích',
    kind: 'ACTIVE',
    shortDesc: 'ST ×1.4, Xuyên 25% giáp',
    detailDesc: 'Đòn công kích bổ nhào thẳng đứng hoặc phóng ngư lôi đồng loạt nhân 1.4 sát thương và xuyên 25% giáp.',
    accentColor: '#10b981',
    spCost: 40,
    damageMultiplier: 1.4,
    ignoreDefenseRatio: 0.25,
    hitBonus: 12,
  },
  LETHALITY_STRIKE: {
    id: 'LETHALITY_STRIKE',
    name: 'Đột Kích Phá Hoại Kho Đạn',
    kind: 'ACTIVE',
    shortDesc: '+45% Chí mạng, +5 ST',
    detailDesc: 'Nhắm thẳng vào buồng đạn hoặc khoang động cơ đối phương, tăng +45% chí mạng và +5 sát thương.',
    accentColor: '#a855f7',
    spCost: 40,
    damageBonus: 5,
    critBonus: 45,
    hitBonus: 15,
  },
  SANCTUARY_AURA: {
    id: 'SANCTUARY_AURA',
    name: 'Trạm Cấp Cứu & Đại Tu Tiền Phương',
    kind: 'ACTIVE',
    shortDesc: 'Hồi HP tất cả đồng minh bán kính 2 ô',
    detailDesc: 'Triển khai kíp quân y và công binh sửa chữa khẩn cấp cho toàn bộ đồng minh trong bán kính 2 ô.',
    accentColor: '#fde047',
    spCost: 40,
    aoeHeal: true,
  },
  VOID_COLLAPSE: {
    id: 'VOID_COLLAPSE',
    name: 'Pháo Kích Trải Thảm Tọa Độ Đỏ',
    kind: 'ACTIVE',
    shortDesc: 'Xuyên 60% công sự, Hồi 35% HP',
    detailDesc: 'Dội bão lửa trọng pháo/thảm bom xuyên thủng 60% kháng lực công sự và thu hồi lợi thế chiến thuật.',
    accentColor: '#c084fc',
    spCost: 45,
    damageBonus: 5,
    ignoreDefenseRatio: 0.6,
    drainRatio: 0.35,
    hitBonus: 15,
  },

  // === PASSIVE SKILLS (HUẤN LUYỆN & HỌC THUYẾT NỘI TẠI) ===
  ROYAL_CHARM: {
    id: 'ROYAL_CHARM',
    name: 'Chỉ Huy Vô Tuyến Tiền Phương',
    kind: 'PASSIVE',
    shortDesc: '+10% CX & +10% Né khi giao chiến',
    detailDesc: 'Thông tin liên lạc vô tuyến sắc bén giúp tăng +10% chính xác và +10% né tránh trong mọi cuộc đọ súng.',
    accentColor: '#60a5fa',
  },
  VANTAGE: {
    id: 'VANTAGE',
    name: 'Chốt Súng Phục Kích Chiến Hào',
    kind: 'PASSIVE',
    shortDesc: 'HP < 50% luôn khai hỏa phản kích trước',
    detailDesc: 'Khi bị đối phương áp sát lúc HP dưới 50%, đơn vị lập tức nổ súng phủ đầu trước khi địch kịp bóp cò.',
    accentColor: '#f43f5e',
  },
  WRATH: {
    id: 'WRATH',
    name: 'Tử Thủ Không Lùi Bước',
    kind: 'PASSIVE',
    shortDesc: 'HP < 50% tăng +30% Chí mạng',
    detailDesc: 'Khi tổn thất vượt quá nửa quân số, ý chí tử thủ đẩy tỷ lệ bắn trúng điểm yếu (+30% CM) lên đỉnh điểm.',
    accentColor: '#ef4444',
  },
  PAVISE: {
    id: 'PAVISE',
    name: 'Giáp Nghiêng Thép Hàn',
    kind: 'PASSIVE',
    shortDesc: 'Giảm 20% sát thương đạn động năng',
    detailDesc: 'Thiết kế giáp nghiêng và tấm chắn thép giúp làm trượt đạn, giảm 20% sát thương trực diện nhận vào.',
    accentColor: '#94a3b8',
  },
  AEGIS: {
    id: 'AEGIS',
    name: 'Lưới Chắn Chống Mảnh & Phòng Không',
    kind: 'PASSIVE',
    shortDesc: 'Giảm 25% sát thương pháo/không kích/bắn tỉa',
    detailDesc: 'Hệ thống giáp diềm chống nổ lõm và lưới ngụy trang giảm 25% sát thương từ pháo binh, không kích và bắn tỉa.',
    accentColor: '#38bdf8',
  },
  DUELIST_BLOW: {
    id: 'DUELIST_BLOW',
    name: 'Xung Phong Cơ Động Chớp Nhoáng',
    kind: 'PASSIVE',
    shortDesc: '+20% Né khi chủ động khai hỏa',
    detailDesc: 'Di chuyển chiến thuật zíc-zắc khi chủ động tấn công giúp tăng +20% né tránh trước hỏa lực bắn trả.',
    accentColor: '#2dd4bf',
  },
  LIFETAKER: {
    id: 'LIFETAKER',
    name: 'Thu Chiến Lợi Phẩm Tiếp Tế',
    kind: 'PASSIVE',
    shortDesc: 'Hồi 6 HP ngay khi tiêu diệt mục tiêu',
    detailDesc: 'Thu giữ quân nhu và phụ tùng ngay sau khi tiêu diệt đơn vị địch, hồi phục lập tức 6 HP.',
    accentColor: '#c084fc',
  },
  CANTO_AGILITY: {
    id: 'CANTO_AGILITY',
    name: 'Tác Chiến Cơ Giới Thần Tốc',
    kind: 'PASSIVE',
    shortDesc: '+2 ST & +10% Né khi chủ công',
    detailDesc: 'Ưu thế tốc độ động cơ đốt trong tăng +2 sát thương và +10% né tránh khi chủ động mở mũi đột kích.',
    accentColor: '#14b8a6',
  },
  SHADOW_STEP: {
    id: 'SHADOW_STEP',
    name: 'Ngụy Trang Đêm & Tàng Hình Sơn Phủ',
    kind: 'PASSIVE',
    shortDesc: '+15% Né & +15% Chí mạng',
    detailDesc: 'Kỹ thuật ngụy trang chiến trường tăng thường trực +15% né tránh và +15% tỷ lệ chí mạng.',
    accentColor: '#818cf8',
  },
  ARCANE_SURGE: {
    id: 'ARCANE_SURGE',
    name: 'Đoàn Tiếp Đạn Pháo Tự Động',
    kind: 'PASSIVE',
    shortDesc: '+3 ST pháo/không kích & +10 SP/lượt',
    detailDesc: 'Dây chuyền nạp đạn cơ khí hóa tăng +3 sát thương hỏa lực diện rộng và hồi nhanh năng lượng chiến thuật mỗi lượt.',
    accentColor: '#34d399',
  },
};

export const TERRAIN_DATA: Record<TerrainType, TerrainInfo> = {
  PLAIN: {
    type: 'PLAIN',
    name: 'Bình Nguyên',
    defBonus: 0,
    avoBonus: 0,
    healPercent: 0,
    moveCost: { FOOT: 1, MOUNTED: 1, FLYING: 1, ARMORED: 1, NAVAL: 99 },
  },
  ROAD: {
    type: 'ROAD',
    name: 'Tuyến Quân Lộ',
    defBonus: 0,
    avoBonus: 0,
    healPercent: 0,
    moveCost: { FOOT: 1, MOUNTED: 1, FLYING: 1, ARMORED: 1, NAVAL: 99 },
  },
  FOREST: {
    type: 'FOREST',
    name: 'Rừng Ngụy Trang',
    defBonus: 1,
    avoBonus: 20,
    healPercent: 0,
    moveCost: { FOOT: 2, MOUNTED: 3, FLYING: 1, ARMORED: 2, NAVAL: 99 },
  },
  FORT: {
    type: 'FORT',
    name: 'Pháo Đài Bê Tông',
    defBonus: 2,
    avoBonus: 20,
    healPercent: 20,
    moveCost: { FOOT: 1, MOUNTED: 2, FLYING: 1, ARMORED: 1, NAVAL: 99 },
  },
  MOUNTAIN: {
    type: 'MOUNTAIN',
    name: 'Cao Điểm Đá',
    defBonus: 2,
    avoBonus: 30,
    healPercent: 0,
    moveCost: { FOOT: 3, MOUNTED: 99, FLYING: 1, ARMORED: 99, NAVAL: 99 },
  },
  WATER: {
    type: 'WATER',
    name: 'Vùng Biển / Sông Lớn',
    defBonus: 1,
    avoBonus: 10,
    healPercent: 0,
    moveCost: { FOOT: 99, MOUNTED: 99, FLYING: 1, ARMORED: 99, NAVAL: 1 },
  },
  WALL: {
    type: 'WALL',
    name: 'Tường Chắn Bê Tông',
    defBonus: 0,
    avoBonus: 0,
    healPercent: 0,
    moveCost: { FOOT: 99, MOUNTED: 99, FLYING: 99, ARMORED: 99, NAVAL: 99 },
  },
  BRIDGE: {
    type: 'BRIDGE',
    name: 'Cầu Thép / Âu Tàu',
    defBonus: 0,
    avoBonus: 0,
    healPercent: 0,
    moveCost: { FOOT: 1, MOUNTED: 1, FLYING: 1, ARMORED: 1, NAVAL: 2 },
  },
  SAND: {
    type: 'SAND',
    name: 'Bãi Đổ Bộ / Cát Sa Mạc',
    defBonus: 0,
    avoBonus: 5,
    healPercent: 0,
    moveCost: { FOOT: 2, MOUNTED: 3, FLYING: 1, ARMORED: 3, NAVAL: 99 },
  },
  SNOW: {
    type: 'SNOW',
    name: 'Chiến Tuyến Tuyết Trắng',
    defBonus: 0,
    avoBonus: 10,
    healPercent: 0,
    moveCost: { FOOT: 1, MOUNTED: 2, FLYING: 1, ARMORED: 2, NAVAL: 99 },
  },
  LAVA: {
    type: 'LAVA',
    name: 'Hố Lửa Dầu Cháy',
    defBonus: 0,
    avoBonus: 0,
    healPercent: 0,
    moveCost: { FOOT: 99, MOUNTED: 99, FLYING: 1, ARMORED: 99, NAVAL: 99 },
  },
  THRONE: {
    type: 'THRONE',
    name: 'Sở Chỉ Huy',
    defBonus: 3,
    avoBonus: 25,
    healPercent: 20,
    moveCost: { FOOT: 1, MOUNTED: 1, FLYING: 1, ARMORED: 1, NAVAL: 99 },
  },
  SHOP_ARMORY: {
    type: 'SHOP_ARMORY',
    name: 'Kho Quân Giới Tiền Phương',
    defBonus: 1,
    avoBonus: 10,
    healPercent: 10,
    moveCost: { FOOT: 1, MOUNTED: 1, FLYING: 1, ARMORED: 1, NAVAL: 99 },
    shopKind: 'IN_MAP_ARMORY',
  },
  SHOP_VENDOR: {
    type: 'SHOP_VENDOR',
    name: 'Trạm Quân Nhu Tiền Tuyến',
    defBonus: 1,
    avoBonus: 10,
    healPercent: 10,
    moveCost: { FOOT: 1, MOUNTED: 1, FLYING: 1, ARMORED: 1, NAVAL: 99 },
    shopKind: 'IN_MAP_VENDOR',
  },
};

export function isNavalPassableTerrain(t: TerrainType): boolean {
  return TERRAIN_DATA[t].moveCost.NAVAL < 99;
}

export function canUnitStandOnTerrain(moveType: MoveType, t: TerrainType): boolean {
  return TERRAIN_DATA[t].moveCost[moveType] < 99;
}

export interface ClassMeta {
  id: UnitClassId;
  name: string;
  tier: UnitTier;
  domain: UnitDomain;
  moveType: MoveType;
  accent: string;
  roleSummary: string;
  allowedWeaponTypes: WeaponType[];
  defaultSkills: SkillId[];
  promotion?: ClassPromotionDef;
}

interface LineageConfig {
  accent: string;
  domain: UnitDomain;
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
 * 30 Combined-Arms Military Lineages × 4 Historical Tiers (WWI Early -> WWI Late -> WWII Mid -> WWII Late)
 * = 120 Playable Classes + DARK_GENERAL Supreme Axis Marshal = 121 Total Classes across 5 Domains:
 * - INFANTRY (Bộ binh, súng trường, tiểu liên, đại liên, phun lửa, bắn tỉa, phòng không, lính dù, TQLC, SAS, quân y)
 * - ARMOR (Xe bọc thép, xe tăng Mark V / Sherman / T-34 / KV-1 / Tiger / IS-2, pháo tự hành diệt tăng, xe phòng không)
 * - ARTILLERY (Cối chiến hào, lựu pháo 75mm/155mm, pháo đường sắt, siêu pháo 800mm, pháo phản lực Katyusha/Nebelwerfer)
 * - AIRCRAFT (Tiêm kích cánh kép Sopwith, Spitfire, Mustang P-51, phản lực Me-262, cường kích Stuka, IL-2, thủy phi cơ, B-17)
 * - NAVAL (Tàu khu trục, tuần dương hạm, thiết giáp hạm Dreadnought/406mm, tàu ngầm U-Boat, hàng không mẫu hạm)
 */
export const CLASS_LINEAGES: LineageConfig[] = [
  // 1. LORD LINEAGE — INFANTRY COMMANDER
  {
    accent: '#3b82f6',
    domain: 'INFANTRY',
    moveType: 'FOOT',
    tiers: [
      { id: 'LORD', name: 'Sĩ Quan Chỉ Huy', role: 'Chỉ huy bộ binh tiền tuyến tinh thông súng trường và súng ngắn chỉ huy.', weapons: ['SWORD'], skills: ['ROYAL_CHARM', 'LUNA_STRIKE'] },
      { id: 'GREAT_LORD', name: 'Tiểu Đoàn Trưởng', role: 'Chỉ huy xung kích trang bị cả súng bộ binh và hỏa lực chống tăng.', weapons: ['SWORD', 'LANCE'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 5, str: 3, skl: 2, spd: 2, def: 2, res: 2, mov: 1 }, promoDesc: 'Mở khóa Pháo Xuyên Giáp, +1 MOV và Tiếp Viện Khẩn Cấp.', accent: '#2563eb' },
      { id: 'SOVEREIGN', name: 'Tư Lệnh Sư Đoàn', role: 'Tướng lĩnh dạn dày trận mạc, chống mảnh pháo và chỉ huy hiệp đồng.', weapons: ['SWORD', 'LANCE'], unlockSkill: 'AEGIS', bonuses: { maxHp: 6, str: 3, mag: 2, skl: 3, spd: 3, def: 3, res: 3 }, promoDesc: 'Mở khóa Lưới Chắn Chống Mảnh giảm 25% sát thương pháo & bắn tỉa.', accent: '#1d4ed8' },
      { id: 'EMPEROR_LORD', name: 'Tổng Tư Lệnh Mặt Trận', role: 'Tổng tư lệnh tối cao điều phối cả hỏa lực chiến lược liên binh chủng.', weapons: ['SWORD', 'LANCE', 'TOME'], unlockSkill: 'ASTRA_FLURRY', bonuses: { maxHp: 8, str: 4, mag: 4, skl: 4, spd: 4, def: 4, res: 4, mov: 1 }, promoDesc: 'Đạt Bậc IV Tối Thượng! Gọi Pháo/Không Kích, +1 MOV & Loạt Bắn Tốc Xạ.', accent: '#f59e0b' },
    ],
  },
  // 2. CAVALIER LINEAGE — LIGHT -> MEDIUM -> HEAVY -> MAIN BATTLE TANK (ARMOR)
  {
    accent: '#14b8a6',
    domain: 'ARMOR',
    moveType: 'MOUNTED',
    tiers: [
      { id: 'CAVALIER', name: 'Xe Tăng Hạng Nhẹ', role: 'Xe tăng hạng nhẹ cơ động cao tháp pháo xoay 360°, yểm trợ bộ binh đột kích.', weapons: ['LANCE', 'SWORD'], skills: ['CANTO_AGILITY'] },
      { id: 'PALADIN', name: 'Xe Tăng Hạng Trung', role: 'Xe tăng hạng trung cân bằng hoàn hảo giữa tốc độ hành tiến, giáp nghiêng và pháo 76–85mm.', weapons: ['LANCE', 'SWORD'], unlockSkill: 'AEGIS', bonuses: { maxHp: 5, str: 3, skl: 2, spd: 2, def: 2, res: 3, mov: 1 }, promoDesc: 'Tăng +1 MOV, lắp giáp diềm chống nổ lõm giảm 25% ST pháo.', accent: '#0d9488' },
      { id: 'SILVER_KNIGHT', name: 'Xe Tăng Đột Kích', role: 'Chiến xa xung kích bọc giáp dày trang bị pháo 90–105mm xuyên thủng phòng tuyến.', weapons: ['LANCE', 'SWORD', 'AXE'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 6, str: 3, skl: 3, spd: 3, def: 3, res: 3 }, promoDesc: 'Làm chủ cả 3 nhóm hỏa lực trực diện & Tiếp Viện Khẩn Cấp.', accent: '#06b6d4' },
      { id: 'ASTRAL_CAVALIER', name: 'Xe Tăng Chiến Đấu Chủ Lực', role: 'Đỉnh cao xe tăng chủ lực giáp phản ứng nổ và pháo nòng trơn hiện đại.', weapons: ['LANCE', 'SWORD', 'AXE'], unlockSkill: 'LUNA_STRIKE', bonuses: { maxHp: 8, str: 5, skl: 4, spd: 4, def: 4, res: 4, mov: 1 }, promoDesc: 'Đạt Bậc IV! +1 MOV & Đạn Lõi Thép Xuyên Giáp 50%.', accent: '#38bdf8' },
    ],
  },
  // 3. ARCHER LINEAGE — SNIPER & ANTI-AIR ARTILLERY (INFANTRY)
  {
    accent: '#84cc16',
    domain: 'INFANTRY',
    moveType: 'FOOT',
    tiers: [
      { id: 'ARCHER', name: 'Xạ Thủ Bắn Tỉa', role: 'Khống chế cự ly xa chuẩn xác bằng súng bắn tỉa quang học, bắn hạ mục tiêu bay thấp.', weapons: ['BOW'], skills: ['DEADEYE_SHOT'] },
      { id: 'SNIPER', name: 'Xạ Thủ Bắn Tỉa Tầm Xa', role: 'Sử dụng súng bắn tỉa cỡ đạn lớn tiêu diệt sĩ quan và khí tài địch từ xa.', weapons: ['BOW'], unlockSkill: 'DUELIST_BLOW', bonuses: { maxHp: 4, str: 3, skl: 4, spd: 3, def: 1, res: 1, mov: 1 }, promoDesc: '+4 SKL/+3 SPD, +1 MOV và Xung Phong Cơ Động.', accent: '#65a30d' },
      { id: 'MARKSMAN', name: 'Khẩu Đội Pháo Cao Xạ', role: 'Pháo cao xạ tốc độ bắn cao quét sạch máy bay tầm trung trên bầu trời mặt trận.', weapons: ['BOW'], unlockSkill: 'SHADOW_STEP', bonuses: { maxHp: 5, str: 4, skl: 4, spd: 4, def: 2, res: 2 }, promoDesc: 'Lưới ngụy trang phòng không (+15% Né & +15% Chí mạng).', accent: '#4d7c0f' },
      { id: 'STARFALL_ARCHER', name: 'Tổ Hợp Phòng Không Hạng Nặng', role: 'Tổ hợp pháo – tên lửa phòng không khắc tinh của cả oanh tạc cơ lẫn thiết giáp.', weapons: ['BOW'], unlockSkill: 'ASTRA_FLURRY', bonuses: { maxHp: 7, str: 5, skl: 6, spd: 5, def: 3, res: 3, mov: 1 }, promoDesc: 'Đạt Bậc IV! +1 MOV, SKL +6 & Loạt Bắn Tốc Xạ Liên Thanh.', accent: '#a3e635' },
    ],
  },
  // 4. MAGE LINEAGE — MORTAR -> HOWITZER -> ROCKET ARTILLERY -> THERMOBARIC MLRS (ARTILLERY)
  {
    accent: '#10b981',
    domain: 'ARTILLERY',
    moveType: 'FOOT',
    tiers: [
      { id: 'MAGE', name: 'Pháo Cối Chiến Hào', role: 'Pháo nòng ngắn bắn cầu vồng vượt địa hình vào chiến hào và mục tiêu che khuất.', weapons: ['TOME'], skills: ['ARCANE_SURGE'] },
      { id: 'SAGE', name: 'Lựu Pháo Dã Chiến', role: 'Trọng pháo nòng dài 105–155mm tầm xa chế áp toàn phân khu phòng ngự đối phương.', weapons: ['TOME', 'STAFF'], unlockSkill: 'IGNIS_BURST', bonuses: { maxHp: 4, mag: 4, skl: 3, spd: 2, res: 4, mov: 1 }, promoDesc: 'Hỗ trợ Công Binh/Quân Y, +4 MAG và Loạt Pháo Hủy Diệt.', accent: '#059669' },
      { id: 'ARCHSAGE', name: 'Pháo Phản Lực Phóng Loạt', role: 'Dàn pháo phản lực cơ giới dội cơn mưa rocket phủ kín toàn tuyến hào địch.', weapons: ['TOME', 'STAFF'], unlockSkill: 'AEGIS', bonuses: { maxHp: 5, mag: 5, skl: 3, spd: 3, def: 2, res: 5 }, promoDesc: 'Công sự pháo binh kiên cố (+5 MAG/+5 RES) & Chống Phản Pháo.', accent: '#047857' },
      { id: 'ASTRAL_ORACLE', name: 'Pháo Phản Lực Nhiệt Áp', role: 'Tổ hợp pháo phản lực bọc thép đầu đạn nhiệt áp thiêu rụi mọi công sự kiên cố.', weapons: ['TOME', 'STAFF'], unlockSkill: 'VOID_COLLAPSE', bonuses: { maxHp: 7, mag: 6, skl: 5, spd: 4, def: 3, res: 6, mov: 1 }, promoDesc: 'Đạt Bậc IV! +6 MAG, +1 MOV & Pháo Kích Trải Thảm Tọa Độ Đỏ.', accent: '#34d399' },
    ],
  },
  // 5. CLERIC LINEAGE — FIELD MEDIC & SURGICAL CORPS (INFANTRY)
  {
    accent: '#f59e0b',
    domain: 'INFANTRY',
    moveType: 'FOOT',
    tiers: [
      { id: 'CLERIC', name: 'Quân Y Chiến Tuyến', role: 'Cứu thương tuyến lửa, giữ vững quân số cho các tiểu đoàn xung kích.', weapons: ['STAFF'], skills: ['SANCTUARY_AURA'] },
      { id: 'BISHOP', name: 'Bác Sĩ Quân Y Dã Chiến', role: 'Điều hành trạm phẫu thuật tiền phương và gọi pháo sáng yểm trợ.', weapons: ['STAFF', 'TOME'], unlockSkill: 'AEGIS', bonuses: { maxHp: 4, mag: 4, skl: 2, spd: 2, lck: 3, res: 5, mov: 1 }, promoDesc: 'Mở khóa Pháo Chiếu Sáng, +5 RES và Lưới Chắn Chống Mảnh.', accent: '#d97706' },
      { id: 'SAINT', name: 'Chủ Nhiệm Quân Y Sư Đoàn', role: 'Đơn vị quân y cơ động cứu sống đồng đội dưới mưa bom bão đạn.', weapons: ['STAFF', 'TOME'], unlockSkill: 'ARCANE_SURGE', bonuses: { maxHp: 5, mag: 5, skl: 3, spd: 3, lck: 4, res: 5 }, promoDesc: 'Tăng cường tiếp vận y tế (+3 hiệu lực & hồi SP nhanh).', accent: '#eab308' },
      { id: 'SERAPH_PROPHET', name: 'Bệnh Viện Dã Chiến Tiền Phương', role: 'Trung tâm quân y chiến dịch hiện đại bảo toàn sinh lực toàn tập đoàn quân.', weapons: ['STAFF', 'TOME'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 7, mag: 6, skl: 4, spd: 4, lck: 6, res: 7, mov: 1 }, promoDesc: 'Đạt Bậc IV! +1 MOV, +6 MAG/+7 RES & Tiếp Viện Khẩn Cấp.', accent: '#fde047' },
    ],
  },
  // 6. KNIGHT LINEAGE — TRENCH -> HEAVY -> BREAKTHROUGH -> SUPER-HEAVY TANK (ARMOR)
  {
    accent: '#94a3b8',
    domain: 'ARMOR',
    moveType: 'ARMORED',
    tiers: [
      { id: 'KNIGHT', name: 'Xe Tăng Chiến Hào', role: 'Chiến xa vượt chiến hào Thế Chiến I, giáp thép dày chống đạn súng máy.', weapons: ['LANCE'], skills: ['PAVISE'] },
      { id: 'GENERAL', name: 'Xe Tăng Hạng Nặng', role: 'Pháo đài di động bọc giáp dày trang bị pháo xuyên giáp và đại pháo.', weapons: ['LANCE', 'AXE'], unlockSkill: 'IGNIS_BURST', bonuses: { maxHp: 7, str: 4, skl: 2, def: 5, res: 2, mov: 1 }, promoDesc: 'Lắp thêm pháo nổ mạnh, +5 DEF, +1 MOV và Loạt Pháo Hủy Diệt!', accent: '#64748b' },
      { id: 'MARSHAL', name: 'Xe Tăng Đột Phá Hạng Nặng', role: 'Chiến xa giáp nghiêng pháo nòng dài thống trị mọi cuộc đấu tăng tầm xa.', weapons: ['LANCE', 'AXE', 'SWORD'], unlockSkill: 'AEGIS', bonuses: { maxHp: 8, str: 4, skl: 3, spd: 2, def: 5, res: 4 }, promoDesc: 'Trang bị súng máy đồng trục & giáp chống đạn lõm toàn diện.', accent: '#475569' },
      { id: 'TITAN_CITADEL', name: 'Siêu Tăng Pháo Đài Chiến Lược', role: 'Đỉnh cao thiết giáp hạng siêu nặng pháo 125–140mm đập tan mọi cứ điểm bê tông.', weapons: ['LANCE', 'AXE', 'SWORD'], unlockSkill: 'LUNA_STRIKE', bonuses: { maxHp: 12, str: 5, skl: 3, spd: 2, def: 7, res: 5, mov: 1 }, promoDesc: 'Đạt Bậc IV! +12 HP, +7 DEF, +1 MOV & Đạn Lõi Thép Xuyên Giáp.', accent: '#cbd5e1' },
    ],
  },
  // 7. PEGASUS LINEAGE — BIPLANE -> INTERCEPTOR -> STRIKE FIGHTER -> SUPERSONIC JET FIGHTER (AIRCRAFT)
  {
    accent: '#38bdf8',
    domain: 'AIRCRAFT',
    moveType: 'FLYING',
    tiers: [
      { id: 'PEGASUS', name: 'Tiêm Kích Cánh Kép', role: 'Máy bay tiêm kích cánh kép trinh sát và không chiến vượt địa hình sông núi.', weapons: ['LANCE'], skills: ['CANTO_AGILITY'] },
      { id: 'FALCON_KNIGHT', name: 'Tiêm Kích Đánh Chặn', role: 'Tiêm kích cánh đơn tốc độ cao bảo vệ bầu trời với súng máy cánh và pháo 20mm.', weapons: ['LANCE', 'SWORD', 'STAFF'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 5, str: 3, skl: 3, spd: 3, res: 4, mov: 1 }, promoDesc: 'Trang bị pháo cánh 20mm, thả dù tiếp tế, +1 MOV (8 ô) & Tiếp Viện.', accent: '#0284c7' },
      { id: 'SERAPH_KNIGHT', name: 'Tiêm Kích Đa Năng', role: 'Tiêm kích bom đa năng vừa không chiến vừa phóng rocket và cắt bom diệt tăng.', weapons: ['LANCE', 'SWORD', 'STAFF'], unlockSkill: 'AEGIS', bonuses: { maxHp: 6, str: 4, mag: 3, skl: 4, spd: 4, res: 5 }, promoDesc: 'Khung thân hợp kim khí động học giảm 25% sát thương phòng không.', accent: '#0ea5e9' },
      { id: 'CELESTIAL_VALKYRIE', name: 'Tiêm Kích Phản Lực Chiếm Ưu Thế', role: 'Tiêm kích phản lực hai động cơ cánh cụp xé toạc mọi biên đội không quân địch.', weapons: ['LANCE', 'SWORD', 'STAFF', 'TOME'], unlockSkill: 'ASTRA_FLURRY', bonuses: { maxHp: 7, str: 5, mag: 4, skl: 5, spd: 5, def: 3, res: 6, mov: 1 }, promoDesc: 'Đạt Bậc IV! Mang tên lửa dẫn đường, +1 MOV & Tốc Xạ Liên Thanh.', accent: '#7dd3fc' },
    ],
  },
  // 8. MYRMIDON LINEAGE — SMG -> URBAN ASSAULT -> SHOCK GUARD -> ASSAULT RIFLE SPEC-OPS (INFANTRY)
  {
    accent: '#f43f5e',
    domain: 'INFANTRY',
    moveType: 'FOOT',
    tiers: [
      { id: 'MYRMIDON', name: 'Xung Kích Tiểu Liên', role: 'Đột kích cận chiến cực nhanh bằng tiểu liên chiến hào và lựu đạn.', weapons: ['SWORD'], skills: ['VANTAGE', 'DUELIST_BLOW'] },
      { id: 'SWORDMASTER', name: 'Biệt Kích Tiểu Liên Đô Thị', role: 'Quét sạch giao thông hào và tác chiến đô thị bằng tiểu liên tốc xạ & phóng lựu.', weapons: ['SWORD'], unlockSkill: 'ASTRA_FLURRY', bonuses: { maxHp: 5, str: 3, skl: 4, spd: 4, def: 2, mov: 1 }, promoDesc: '+4 SKL/+4 SPD, +1 MOV và Loạt Bắn Tốc Xạ Liên Thanh!', accent: '#e11d48' },
      { id: 'TRUEBLADE', name: 'Cận Vệ Xung Kích Tinh Nhuệ', role: 'Hỏa lực tiểu liên băng trống dày đặc áp đảo mọi đợt phản kích tầm gần.', weapons: ['SWORD'], unlockSkill: 'SHADOW_STEP', bonuses: { maxHp: 6, str: 4, skl: 5, spd: 5, def: 2, res: 2 }, promoDesc: 'Ngụy trang tác chiến đô thị (+15% Né & +15% Chí mạng).', accent: '#be123c' },
      { id: 'SWORD_SAINT', name: 'Đặc Nhiệm Súng Trường Tấn Công', role: 'Đơn vị đặc nhiệm trang bị súng trường tấn công kính ngắm quang học hiện đại.', weapons: ['SWORD'], unlockSkill: 'LUNA_STRIKE', bonuses: { maxHp: 8, str: 5, skl: 6, spd: 6, def: 3, res: 3, mov: 1 }, promoDesc: 'Đạt Bậc IV! +6 SKL/+6 SPD, +1 MOV & Đạn Lõi Thép Xuyên Giáp.', accent: '#fb7185' },
    ],
  },
  // 9. FIGHTER LINEAGE — HEAVY MG -> FLAMETHROWER -> ROTARY GRENADIER -> HEAVY ASSAULT TROOPER (INFANTRY)
  {
    accent: '#ea580c',
    domain: 'INFANTRY',
    moveType: 'FOOT',
    tiers: [
      { id: 'FIGHTER', name: 'Khẩu Đội Đại Liên', role: 'Khẩu đội súng máy hạng nặng và phóng lựu đơn áp chế bộ binh diện rộng.', weapons: ['AXE'], skills: ['WRATH'] },
      { id: 'BERSERKER', name: 'Xung Kích Súng Phun Lửa', role: 'Thiêu rụi boong-ke và công sự ngầm bằng luồng lửa áp suất cao.', weapons: ['AXE'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 7, str: 5, skl: 2, spd: 3, def: 2, mov: 1 }, promoDesc: '+7 HP/+5 STR, +1 MOV và Tiếp Viện Khẩn Cấp.', accent: '#c2410c' },
      { id: 'REAVER', name: 'Tổ Hỏa Lực Đại Liên & Phóng Lựu', role: 'Hỏa lực đại liên tốc độ cao kết hợp súng phóng lựu ổ xoay công phá công sự.', weapons: ['AXE', 'BOW'], unlockSkill: 'LIFETAKER', bonuses: { maxHp: 8, str: 5, skl: 3, spd: 3, def: 3, res: 2 }, promoDesc: 'Mở khóa giá bắn Phòng Không & Thu Chiến Lợi Phẩm (+6 HP/mạng).', accent: '#9a3412' },
      { id: 'WAR_GOD', name: 'Phân Đội Hỏa Lực Nhiệt Áp', role: 'Mũi nhọn hỏa lực hạng nặng mang giáp chống đạn và vũ khí nhiệt áp phá boong-ke.', weapons: ['AXE', 'BOW'], unlockSkill: 'DRAGON_FANG', bonuses: { maxHp: 11, str: 7, skl: 4, spd: 4, def: 4, res: 3, mov: 1 }, promoDesc: 'Đạt Bậc IV! +11 HP/+7 STR, +1 MOV & Đột Kích Bộc Phá.', accent: '#f97316' },
    ],
  },
  // 10. WYVERN RIDER LINEAGE — EARLY BOMBER -> DIVE BOMBER -> GROUND-ATTACK -> STRATEGIC BOMBER (AIRCRAFT)
  {
    accent: '#059669',
    domain: 'AIRCRAFT',
    moveType: 'FLYING',
    tiers: [
      { id: 'WYVERN_RIDER', name: 'Máy Bay Ném Bom Sơ Kỳ', role: 'Phi đội máy bay ném bom cánh kép Thế Chiến I mang bom phá công sự và cơ giới.', weapons: ['AXE', 'LANCE'], skills: ['DRAGON_FANG'] },
      { id: 'WYVERN_LORD', name: 'Cường Kích Bổ Nhào', role: 'Cắt bom bổ nhào chính xác từng nóc xe tăng, lô cốt và chiến hạm đối phương.', weapons: ['AXE', 'LANCE'], unlockSkill: 'PAVISE', bonuses: { maxHp: 6, str: 4, skl: 3, spd: 2, def: 4, mov: 1 }, promoDesc: '+6 HP/+4 STR/+4 DEF, +1 MOV và Buồng Lái Bọc Thép (-20% ST)!', accent: '#047857' },
      { id: 'DRAGONLORD', name: 'Cường Kích Bọc Thép Hạng Nặng', role: 'Cường kích bọc thép gắn pháo 23–37mm săn lùng sư đoàn thiết giáp và tàu chiến.', weapons: ['AXE', 'LANCE', 'SWORD'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 7, str: 5, skl: 3, spd: 3, def: 4, res: 3 }, promoDesc: 'Trang bị pháo xuyên giáp cánh và khả năng tự duy trì chiến đấu.', accent: '#065f46' },
      { id: 'SKY_SOVEREIGN', name: 'Pháo Đài Bay Chiến Lược', role: 'Oanh tạc cơ chiến lược 4 động cơ tầm xa rải thảm bom hủy diệt cứ điểm đối phương.', weapons: ['AXE', 'LANCE', 'SWORD'], unlockSkill: 'IGNIS_BURST', bonuses: { maxHp: 10, str: 6, skl: 4, spd: 4, def: 6, res: 4, mov: 1 }, promoDesc: 'Đạt Bậc IV! +10 HP/+6 STR/+6 DEF & Thảm Bom Hủy Diệt.', accent: '#10b981' },
    ],
  },
  // 11. THIEF LINEAGE — RECON SCOUT & SPECIAL INTELLIGENCE (INFANTRY)
  {
    accent: '#818cf8',
    domain: 'INFANTRY',
    moveType: 'FOOT',
    tiers: [
      { id: 'THIEF', name: 'Trinh Sát Tiền Tiêu', role: 'Luồn sâu cắt dây thép gai, trinh sát tọa độ với tốc độ và né tránh cực cao.', weapons: ['SWORD'], skills: ['SHADOW_STEP'] },
      { id: 'ASSASSIN', name: 'Biệt Kích Giảm Thanh', role: 'Sử dụng súng giảm thanh và súng bắn tỉa tiêu diệt sĩ quan chỉ huy địch.', weapons: ['SWORD', 'BOW'], unlockSkill: 'LETHALITY_STRIKE', bonuses: { maxHp: 4, str: 3, skl: 5, spd: 4, lck: 3, mov: 1 }, promoDesc: 'Mở khóa Bắn Tỉa, +5 SKL/+4 SPD & Đột Kích Phá Hoại Kho Đạn!', accent: '#6366f1' },
      { id: 'WHISPER', name: 'Sĩ Quan Tình Báo Mật Mã', role: 'Thu thập mật điện chiến trường để luôn nổ súng phản kích đi trước một bước.', weapons: ['SWORD', 'BOW'], unlockSkill: 'VANTAGE', bonuses: { maxHp: 5, str: 4, skl: 5, spd: 5, lck: 4, def: 2 }, promoDesc: 'Mở khóa Chốt Súng Phục Kích — luôn đánh trước khi HP < 50%.', accent: '#4f46e5' },
      { id: 'PHANTOM_REAPER', name: 'Đặc Vụ Tình Báo Chiến Lược', role: 'Đơn vị trinh sát đặc nhiệm hậu phương làm tê liệt đầu não chỉ huy đối phương.', weapons: ['SWORD', 'BOW'], unlockSkill: 'LIFETAKER', bonuses: { maxHp: 7, str: 5, skl: 6, spd: 6, lck: 6, def: 3, res: 3, mov: 1 }, promoDesc: 'Đạt Bậc IV! +6 SKL/+6 SPD, +1 MOV & Thu Chiến Lợi Phẩm.', accent: '#a5b4fc' },
    ],
  },
  // 12. DARK MAGE LINEAGE — SIEGE MORTAR -> RAILWAY GUN -> TACTICAL BALLISTIC -> STRATEGIC MISSILE (ARTILLERY)
  {
    accent: '#a855f7',
    domain: 'ARTILLERY',
    moveType: 'FOOT',
    tiers: [
      { id: 'DARK_MAGE', name: 'Pháo Công Thành Hạng Nặng', role: 'Cối công thành hạng nặng 210–305mm bắn đạn xuyên phá hầm ngầm và pháo đài bê tông.', weapons: ['TOME'], skills: ['LIFETAKER'] },
      { id: 'NECROMANCER', name: 'Đại Pháo Đường Sắt', role: 'Siêu pháo đặt trên bệ đường sắt chuyên công phá các cụm pháo đài kiên cố.', weapons: ['TOME', 'STAFF'], unlockSkill: 'VOID_COLLAPSE', bonuses: { maxHp: 5, mag: 5, skl: 3, def: 2, res: 4, mov: 1 }, promoDesc: 'Hỗ trợ Công Binh, +5 MAG & Pháo Kích Trải Thảm (xuyên 60% công sự)!', accent: '#9333ea' },
      { id: 'DARK_DRUID', name: 'Tên Lửa Đạn Đạo Chiến Thuật', role: 'Bệ phóng cơ động tên lửa đạn đạo vượt âm đánh thẳng sở chỉ huy đối phương.', weapons: ['TOME', 'STAFF'], unlockSkill: 'WRATH', bonuses: { maxHp: 6, mag: 5, skl: 4, spd: 3, def: 3, res: 5 }, promoDesc: 'Tử Thủ Không Lùi Bước (+30% CM khi HP < 50%) & +5 MAG/+5 RES.', accent: '#7e22ce' },
      { id: 'ABYSSAL_ARCHON', name: 'Tổ Hợp Tên Lửa Chiến Lược', role: 'Xe bệ phóng tên lửa đạn đạo tầm xa mang sức công phá chấn động toàn chiến trường.', weapons: ['TOME', 'STAFF'], unlockSkill: 'ARCANE_SURGE', bonuses: { maxHp: 8, mag: 7, skl: 5, spd: 4, def: 4, res: 6, mov: 1 }, promoDesc: 'Đạt Bậc IV! +7 MAG, +1 MOV & Đoàn Tiếp Đạn Tự Động.', accent: '#c084fc' },
    ],
  },
  // 13. MERCENARY LINEAGE — SHOCK INFANTRY (INFANTRY)
  {
    accent: '#dc2626',
    domain: 'INFANTRY',
    moveType: 'FOOT',
    tiers: [
      { id: 'MERCENARY', name: 'Bộ Binh Xung Kích', role: 'Bộ binh tinh nhuệ tiên phong đột phá chiến hào bằng súng trường và lựu đạn.', weapons: ['SWORD'], skills: ['DUELIST_BLOW'] },
      { id: 'HERO', name: 'Đại Đội Trưởng Xung Kích', role: 'Chiến binh dày dạn sử dụng cả súng bộ binh lẫn hỏa lực hạng nặng.', weapons: ['SWORD', 'AXE'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 6, str: 4, skl: 3, spd: 3, def: 3, mov: 1 }, promoDesc: 'Mở khóa Hỏa Lực Nặng, +6 HP/+4 STR, +1 MOV & Tiếp Viện Khẩn Cấp.', accent: '#b91c1c' },
      { id: 'VANGUARD', name: 'Trung Đoàn Trưởng Cận Vệ', role: 'Trụ cột phòng tuyến trang bị giáp ngực chống mảnh đạn và vũ khí tổng hợp.', weapons: ['SWORD', 'AXE'], unlockSkill: 'PAVISE', bonuses: { maxHp: 7, str: 4, skl: 4, spd: 3, def: 4, res: 2 }, promoDesc: 'Trang bị Giáp Thép Ngực giảm 20% sát thương đạn trực diện.', accent: '#991b1b' },
      { id: 'LEGEND_CHAMPION', name: 'Sư Đoàn Trưởng Cận Vệ Thép', role: 'Đơn vị bộ binh cơ giới chủ lực bách chiến bách thắng trên mọi chiến trường.', weapons: ['SWORD', 'AXE', 'LANCE'], unlockSkill: 'LUNA_STRIKE', bonuses: { maxHp: 9, str: 6, skl: 5, spd: 5, def: 5, res: 4, mov: 1 }, promoDesc: 'Đạt Bậc IV! Làm chủ vũ khí chống tăng, +1 MOV & Đạn Xuyên Giáp.', accent: '#ef4444' },
    ],
  },
  // 14. SOLDIER LINEAGE — ANTI-TANK INFANTRY & ROCKET LAUNCHERS (INFANTRY)
  {
    accent: '#0284c7',
    domain: 'INFANTRY',
    moveType: 'FOOT',
    tiers: [
      { id: 'SOLDIER', name: 'Bộ Binh Chống Tăng', role: 'Trang bị súng trường xuyên giáp cỡ nòng lớn chặn đứng xe bọc thép đối phương.', weapons: ['LANCE'], skills: ['LUNA_STRIKE'] },
      { id: 'HALBERDIER', name: 'Khẩu Đội Pháo Chống Tăng', role: 'Phục kích diệt xe tăng địch từ công sự ngụy trang với độ chính xác cực cao.', weapons: ['LANCE'], unlockSkill: 'WRATH', bonuses: { maxHp: 5, str: 4, skl: 4, spd: 3, def: 3, mov: 1 }, promoDesc: '+4 STR/+4 SKL, +1 MOV và Tử Thủ (+30% CM khi thấp máu).', accent: '#0369a1' },
      { id: 'SENTINEL', name: 'Tổ Súng Phóng Lựu Diệt Tăng', role: 'Súng phóng đạn lõm vác vai biến mọi góc phố và chiến hào thành mồ chôn xe tăng.', weapons: ['LANCE'], unlockSkill: 'PAVISE', bonuses: { maxHp: 7, str: 4, skl: 4, spd: 4, def: 4, res: 3 }, promoDesc: 'Lá chắn thép công sự giảm 20% sát thương đạn động năng.', accent: '#075985' },
      { id: 'SPEAR_EMPEROR', name: 'Phân Đội Tên Lửa Diệt Tăng', role: 'Trang bị ống phóng tên lửa chống tăng dẫn đường xuyên thủng mọi loại giáp hộp.', weapons: ['LANCE', 'SWORD'], unlockSkill: 'ASTRA_FLURRY', bonuses: { maxHp: 9, str: 6, skl: 6, spd: 5, def: 5, res: 4, mov: 1 }, promoDesc: 'Đạt Bậc IV! Trang bị thêm tiểu liên tự vệ, +6 STR/+6 SKL & Tốc Xạ.', accent: '#38bdf8' },
    ],
  },
  // 15. MONK LINEAGE — FORWARD OBSERVER & SELF-PROPELLED HOWITZER BATTERY (ARTILLERY)
  {
    accent: '#eab308',
    domain: 'ARTILLERY',
    moveType: 'FOOT',
    tiers: [
      { id: 'MONK', name: 'Trinh Sát Pháo Binh', role: 'Hiệu chỉnh tọa độ pháo chiếu sáng và hỏa lực yểm trợ chuẩn từng mét.', weapons: ['TOME'], skills: ['ROYAL_CHARM'] },
      { id: 'EXORCIST', name: 'Pháo Đội Chiếu Sáng Yểm Trợ', role: 'Bắn đạn pháo sáng vạch trần mục tiêu ngụy trang và điều phối công binh.', weapons: ['TOME', 'STAFF'], unlockSkill: 'SANCTUARY_AURA', bonuses: { maxHp: 4, mag: 4, skl: 3, spd: 3, res: 4, mov: 1 }, promoDesc: 'Mở khóa Quân Y/Công Binh, +4 MAG/+4 RES & Trạm Cấp Cứu.', accent: '#ca8a04' },
      { id: 'INQUISITOR', name: 'Pháo Tự Hành Dẫn Đường Vô Tuyến', role: 'Kết nối vô tuyến trực tiếp giữa đài quan sát và cụm pháo tự hành bọc thép.', weapons: ['TOME', 'STAFF'], unlockSkill: 'AEGIS', bonuses: { maxHp: 6, mag: 5, skl: 4, spd: 3, def: 3, res: 5 }, promoDesc: 'Tháp pháo bọc thép chống mảnh giảm 25% sát thương phản pháo.', accent: '#a16207' },
      { id: 'SOLAR_HIEROPHANT', name: 'Lữ Đoàn Pháo Tự Hành Hạng Nặng', role: 'Pháo tự hành 155mm nạp đạn tự động điều khiển bằng máy tính đường đạn số hóa.', weapons: ['TOME', 'STAFF'], unlockSkill: 'IGNIS_BURST', bonuses: { maxHp: 8, mag: 6, skl: 5, spd: 5, def: 4, res: 7, mov: 1 }, promoDesc: 'Đạt Bậc IV! +6 MAG/+7 RES, +1 MOV & Loạt Pháo Hủy Diệt.', accent: '#facc15' },
    ],
  },
  // 16. NOMAD LINEAGE — MOTORIZED RECON -> ARMORED CAR -> WHEELED TD (ARMOR)
  {
    accent: '#16a34a',
    domain: 'ARMOR',
    moveType: 'MOUNTED',
    tiers: [
      { id: 'NOMAD', name: 'Mô-tô Trinh Sát Vũ Trang', role: 'Cơ giới trinh sát ba bánh cực nhanh trang bị súng máy cơ động.', weapons: ['BOW'], skills: ['CANTO_AGILITY', 'DEADEYE_SHOT'] },
      { id: 'NOMAD_TROOPER', name: 'Xe Cơ Giới Đột Kích', role: 'Xe việt dã vũ trang đại liên luồn lách đánh tạt sườn trên sa mạc và thảo nguyên.', weapons: ['BOW', 'SWORD'], unlockSkill: 'DUELIST_BLOW', bonuses: { maxHp: 5, str: 3, skl: 4, spd: 4, def: 2, mov: 1 }, promoDesc: 'Trang bị thêm súng bộ binh, +1 MOV (8 ô!) & Xung Phong Cơ Động.', accent: '#15803d' },
      { id: 'BOW_KNIGHT', name: 'Thiết Giáp Trinh Sát Sáu Bánh', role: 'Xe bọc thép 6 bánh tốc độ cao bọc sườn tiêu diệt pháo binh và máy bay bay thấp.', weapons: ['BOW', 'SWORD'], unlockSkill: 'SHADOW_STEP', bonuses: { maxHp: 6, str: 4, skl: 4, spd: 5, def: 3, res: 3 }, promoDesc: 'Lưới ngụy trang cơ động (+15% Né & +15% Chí mạng).', accent: '#166534' },
      { id: 'TEMPEST_KHAN', name: 'Pháo Tự Hành Săn Tăng Cơ Động', role: 'Chiến xa săn tăng tốc độ cao trang bị pháo xuyên giáp 90mm truy kích thiết giáp địch.', weapons: ['BOW', 'SWORD', 'LANCE'], unlockSkill: 'DRAGON_FANG', bonuses: { maxHp: 8, str: 5, skl: 5, spd: 6, def: 4, res: 4, mov: 1 }, promoDesc: 'Đạt Bậc IV! Mở khóa Pháo Xuyên Giáp, +1 MOV & Đột Kích.', accent: '#22c55e' },
    ],
  },
  // 17. SPELLBLADE LINEAGE — AIRBORNE PARATROOPERS (INFANTRY)
  {
    accent: '#ec4899',
    domain: 'INFANTRY',
    moveType: 'FOOT',
    tiers: [
      { id: 'SPELLBLADE', name: 'Khinh Binh Nhảy Dù', role: 'Đổ bộ đường không phía sau lưng địch với súng carbine báng gấp và cối cá nhân.', weapons: ['SWORD', 'TOME'], skills: ['ARCANE_SURGE', 'IGNIS_BURST'] },
      { id: 'MORTAL_SAVANT', name: 'Biệt Kích Dù Tinh Nhuệ', role: 'Chiếm giữ cầu cống trọng yếu và gọi chi viện hỏa lực không quân cận chiến.', weapons: ['SWORD', 'TOME'], unlockSkill: 'VANTAGE', bonuses: { maxHp: 5, str: 3, mag: 4, skl: 3, spd: 3, res: 3, mov: 1 }, promoDesc: '+3 STR/+4 MAG, +1 MOV & Chốt Súng Phục Kích khi HP < 50%.', accent: '#db2777' },
      { id: 'RUNE_BLADE', name: 'Tiểu Đoàn Đổ Bộ Đường Không', role: 'Vừa chiến đấu độc lập giữa vòng vây vừa tự cứu thương tiếp tế tại chỗ.', weapons: ['SWORD', 'TOME', 'STAFF'], unlockSkill: 'LUNA_STRIKE', bonuses: { maxHp: 6, str: 4, mag: 5, skl: 4, spd: 4, def: 3, res: 4 }, promoDesc: 'Mở khóa Quân Y nhảy dù & Đạn Lõi Thép Xuyên Giáp 50%.', accent: '#be185d' },
      { id: 'AETHER_SOVEREIGN', name: 'Lữ Đoàn Không Vận Chiến Lược', role: 'Lực lượng phản ứng nhanh đường không tinh nhuệ bậc nhất, tác chiến mọi địa hình.', weapons: ['SWORD', 'TOME', 'STAFF'], unlockSkill: 'ASTRA_FLURRY', bonuses: { maxHp: 8, str: 5, mag: 6, skl: 5, spd: 5, def: 4, res: 5, mov: 1 }, promoDesc: 'Đạt Bậc IV! +1 MOV, +5 STR/+6 MAG & Loạt Bắn Tốc Xạ.', accent: '#f472b6' },
    ],
  },
  // 18. TROUBADOUR LINEAGE — HALF-TRACK -> APC -> IFV -> COMMAND & LOGISTICS IFV (ARMOR)
  {
    accent: '#f472b6',
    domain: 'ARMOR',
    moveType: 'MOUNTED',
    tiers: [
      { id: 'TROUBADOUR', name: 'Xe Bán Xích Quân Y', role: 'Xe bán xích chở quân & cứu thương cơ động bám sát các mũi xung kích.', weapons: ['STAFF'], skills: ['CANTO_AGILITY', 'SANCTUARY_AURA'] },
      { id: 'VALKYRIE', name: 'Thiết Giáp Chở Quân Bọc Thép', role: 'Thiết giáp bánh xích chở bộ binh vượt lưới lửa pháo kích kiêm chi viện quân y.', weapons: ['STAFF', 'TOME'], unlockSkill: 'ARCANE_SURGE', bonuses: { maxHp: 4, mag: 4, skl: 3, spd: 3, res: 4, mov: 1 }, promoDesc: 'Mở khóa Pháo Yểm Trợ, +1 MOV (7 ô) & Tiếp Đạn Tự Động!', accent: '#ec4899' },
      { id: 'SERAPH_RIDER', name: 'Xe Chiến Đấu Bộ Binh', role: 'Trang bị pháo tự động 30mm vừa yểm trợ hỏa lực vừa bảo toàn sinh lực tuyến đầu.', weapons: ['STAFF', 'TOME'], unlockSkill: 'AEGIS', bonuses: { maxHp: 6, mag: 5, skl: 4, spd: 4, def: 2, res: 5 }, promoDesc: 'Giáp hộp chống mảnh đạn pháo giảm 25% sát thương diện rộng.', accent: '#db2777' },
      { id: 'CELESTIAL_EMPRESS', name: 'Thiết Giáp Chỉ Huy & Tiếp Vận', role: 'Trung tâm chỉ huy – hậu cần bọc thép nuôi sống toàn bộ chiến dịch hợp vây.', weapons: ['STAFF', 'TOME', 'SWORD'], unlockSkill: 'ROYAL_CHARM', bonuses: { maxHp: 8, mag: 6, skl: 5, spd: 5, lck: 5, def: 3, res: 7, mov: 1 }, promoDesc: 'Đạt Bậc IV! +1 MOV, +6 MAG/+7 RES & Chỉ Huy Vô Tuyến.', accent: '#fbcfe8' },
    ],
  },
  // 19. PIRATE LINEAGE — DESTROYER -> HEAVY CRUISER -> BATTLESHIP -> GUIDED-MISSILE CRUISER (NAVAL)
  {
    accent: '#0d9488',
    domain: 'NAVAL',
    moveType: 'NAVAL',
    tiers: [
      { id: 'PIRATE', name: 'Khu Trục Hạm Phóng Lôi', role: 'Chiến hạm săn ngầm cơ động trên sông biển, phóng ngư lôi và hải pháo 127mm.', weapons: ['AXE', 'LANCE'], skills: ['WRATH'] },
      { id: 'CORSAIR', name: 'Tuần Dương Hạm Hạng Nặng', role: 'Tuần dương hạm tháp pháo 203mm bảo vệ hạm đội và pháo kích yểm trợ ven biển.', weapons: ['AXE', 'LANCE', 'SWORD'], unlockSkill: 'DUELIST_BLOW', bonuses: { maxHp: 6, str: 4, skl: 3, spd: 4, lck: 3, mov: 1 }, promoDesc: 'Trang bị pháo bắn nhanh, +4 STR/+4 SPD, +1 MOV & Cơ Động Biển.', accent: '#0f766e' },
      { id: 'DREAD_CAPTAIN', name: 'Thiết Giáp Hạm Chủ Lực', role: 'Pháo đài nổi bọc thép dày với dàn đại pháo 380–460mm thống trị đại dương.', weapons: ['AXE', 'LANCE', 'SWORD'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 8, str: 5, skl: 4, spd: 4, def: 4, lck: 4 }, promoDesc: 'Kiểm soát hư hỏng tàu chiến tự khôi phục HP giữa hải chiến.', accent: '#115e59' },
      { id: 'OCEAN_LEVIATHAN', name: 'Tuần Dương Hạm Tên Lửa Chiến Lược', role: 'Soái hạm hiện đại trang bị bệ phóng tên lửa thẳng đứng, radar mảng pha và hải pháo.', weapons: ['AXE', 'LANCE', 'SWORD', 'TOME'], unlockSkill: 'IGNIS_BURST', bonuses: { maxHp: 12, str: 7, mag: 4, skl: 5, spd: 5, def: 5, res: 4, mov: 1 }, promoDesc: 'Đạt Bậc IV! Bắn hải pháo & tên lửa tầm xa, +12 HP/+7 STR & Loạt Pháo Hủy Diệt.', accent: '#2dd4bf' },
    ],
  },
  // 20. GRIFFIN RIDER LINEAGE — SEAPLANE/TRANSPORT -> TRANSPORT HELI -> ATTACK HELI -> NAVAL STRIKE HELI (AIRCRAFT)
  {
    accent: '#f59e0b',
    domain: 'AIRCRAFT',
    moveType: 'FLYING',
    tiers: [
      { id: 'GRIFFIN_RIDER', name: 'Thủy Phi Cơ Tuần Tiễu', role: 'Máy bay vận tải & tuần tiễu biển tầm xa, thả tiếp tế và yểm trợ hỏa lực.', weapons: ['LANCE', 'AXE'], skills: ['CANTO_AGILITY', 'DUELIST_BLOW'] },
      { id: 'GRIFFIN_LORD', name: 'Trực Thăng Đổ Bộ Đa Năng', role: 'Trực thăng cất hạ cánh thẳng đứng, cơ động vượt mọi vách núi và eo biển.', weapons: ['LANCE', 'AXE', 'SWORD'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 5, str: 4, skl: 4, spd: 4, def: 3, mov: 1 }, promoDesc: 'Trang bị đại liên sườn, +4 STR/+4 SPD, +1 MOV & Tiếp Viện Khẩn Cấp.', accent: '#d97706' },
      { id: 'SUN_GRIFFIN', name: 'Trực Thăng Vũ Trang Diệt Tăng', role: 'Trực thăng tiến công bọc thép gắn pháo xoay nòng và giàn rocket xuyên giáp.', weapons: ['LANCE', 'AXE', 'SWORD'], unlockSkill: 'LUNA_STRIKE', bonuses: { maxHp: 7, str: 5, skl: 4, spd: 5, def: 4, res: 3 }, promoDesc: 'Tên lửa chống tăng & rocket xuyên 50% giáp xe tăng và chiến hạm.', accent: '#b45309' },
      { id: 'SOLAR_APEX_KNIGHT', name: 'Trực Thăng Tác Chiến Hải Quân', role: 'Trực thăng hiện đại mang radar vòm, ngư lôi tự dẫn và tên lửa chống hạm.', weapons: ['LANCE', 'AXE', 'SWORD'], unlockSkill: 'ASTRA_FLURRY', bonuses: { maxHp: 9, str: 6, skl: 5, spd: 6, def: 5, res: 5, mov: 1 }, promoDesc: 'Đạt Bậc IV! +1 MOV, +6 STR/+6 SPD & Loạt Công Kích Liên Thanh.', accent: '#fde047' },
    ],
  },
  // 21. SAMURAI LINEAGE — NAVAL INFANTRY / MARINES (INFANTRY)
  {
    accent: '#e11d48',
    domain: 'INFANTRY',
    moveType: 'FOOT',
    tiers: [
      { id: 'SAMURAI', name: 'Lính Thủy Đánh Bộ', role: 'Đổ bộ từ tàu lên bãi biển dưới làn đạn, phản kích cận chiến cực kỳ sắc bén.', weapons: ['SWORD'], skills: ['VANTAGE', 'DUELIST_BLOW'] },
      { id: 'RONIN_MASTER', name: 'Biệt Kích Hải Quân Đổ Bộ', role: 'Tinh thông súng trường bán tự động chống ẩm và hỏa lực bắn tỉa bờ biển.', weapons: ['SWORD', 'BOW'], unlockSkill: 'ASTRA_FLURRY', bonuses: { maxHp: 5, str: 4, skl: 5, spd: 4, def: 2, mov: 1 }, promoDesc: 'Mở khóa Bắn Tỉa/P.Không, +5 SKL/+4 SPD & Tốc Xạ Liên Thanh!', accent: '#be123c' },
      { id: 'SHOGUN_BLADE', name: 'Tiểu Đoàn Thủy Quân Lục Chiến', role: 'Đánh chiếm từng hòn đảo san hô và quân cảng kiên cố bằng hỏa lực tổng hợp.', weapons: ['SWORD', 'BOW', 'LANCE'], unlockSkill: 'PAVISE', bonuses: { maxHp: 7, str: 5, skl: 5, spd: 5, def: 4, res: 3 }, promoDesc: 'Mở khóa Súng Chống Tăng & Áo Chống Mảnh (-20% ST trực diện).', accent: '#9f1239' },
      { id: 'HEAVEN_KENSEI', name: 'Lữ Đoàn Hải Quân Đánh Bộ Tinh Nhuệ', role: 'Lực lượng đổ bộ xung kích chủ lực làm chủ mọi chiến dịch vượt biển.', weapons: ['SWORD', 'BOW', 'LANCE'], unlockSkill: 'LUNA_STRIKE', bonuses: { maxHp: 9, str: 6, skl: 7, spd: 6, def: 5, res: 4, mov: 1 }, promoDesc: 'Đạt Bậc IV! +7 SKL/+6 SPD, +1 MOV & Đạn Lõi Thép Xuyên Giáp.', accent: '#fb7185' },
    ],
  },
  // 22. SHAMAN LINEAGE — SMOKE/INCENDIARY MORTAR -> MULTI-BARREL ROCKET -> ATGM -> MULTI-ROLE MISSILE (ARTILLERY)
  {
    accent: '#7c3aed',
    domain: 'ARTILLERY',
    moveType: 'FOOT',
    tiers: [
      { id: 'SHAMAN', name: 'Khẩu Đội Cối Hóa Học & Đạn Cháy', role: 'Bắn đạn khói che mắt địch và đạn nhiệt phá hủy sinh lực cố thủ trong hào.', weapons: ['TOME'], skills: ['ARCANE_SURGE', 'LIFETAKER'] },
      { id: 'SPIRIT_CALLER', name: 'Pháo Phản Lực Sáu Nòng', role: 'Dàn rocket 150–210mm sáu nòng gầm rú chế áp cụm hỏa điểm và hỗ trợ công binh.', weapons: ['TOME', 'STAFF'], unlockSkill: 'VOID_COLLAPSE', bonuses: { maxHp: 5, mag: 5, skl: 3, spd: 3, res: 4, mov: 1 }, promoDesc: 'Hỗ trợ Công Binh, +5 MAG/+4 RES & Pháo Kích Trải Thảm!', accent: '#6d28d9' },
      { id: 'ELDER_ORACLE', name: 'Tổ Hợp Tên Lửa Chống Tăng Có Điều Khiển', role: 'Bắn tên lửa dẫn đường chính xác xuyên giáp từ khoảng cách an toàn.', weapons: ['TOME', 'STAFF'], unlockSkill: 'SANCTUARY_AURA', bonuses: { maxHp: 6, mag: 5, skl: 4, spd: 4, def: 3, res: 5 }, promoDesc: 'Triển khai trạm tiếp sức công binh bán kính 2 ô.', accent: '#5b21b6' },
      { id: 'PRIMORDIAL_AVATAR', name: 'Hệ Thống Tên Lửa Dẫn Đường Đa Năng', role: 'Xe phóng tên lửa dẫn đường đa mục tiêu xóa sổ cả thiết giáp lẫn phòng không địch.', weapons: ['TOME', 'STAFF'], unlockSkill: 'IGNIS_BURST', bonuses: { maxHp: 9, mag: 7, skl: 5, spd: 5, def: 4, res: 7, mov: 1 }, promoDesc: 'Đạt Bậc IV! +7 MAG/+7 RES, +1 MOV & Loạt Tên Lửa Hủy Diệt.', accent: '#a78bfa' },
    ],
  },
  // 23. BRAWLER LINEAGE — COMBAT ENGINEERS & ASSAULT SAPPERS (INFANTRY)
  {
    accent: '#ea580c',
    domain: 'INFANTRY',
    moveType: 'FOOT',
    tiers: [
      { id: 'BRAWLER', name: 'Công Binh Bộc Phá', role: 'Phá gỡ mìn, cắt kẽm gai và đánh sập lô cốt bằng khối nổ định hình.', weapons: ['AXE', 'SWORD'], skills: ['WRATH', 'DUELIST_BLOW'] },
      { id: 'WAR_MONK', name: 'Công Binh Xung Kích Giáp Thép', role: 'Mặc yếm giáp thép chống đạn vừa đánh bộc phá vừa củng cố công sự đồng đội.', weapons: ['AXE', 'SWORD', 'STAFF'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 7, str: 4, skl: 3, spd: 4, def: 3, mov: 1 }, promoDesc: 'Mở khóa Công Binh Sửa Chữa, +7 HP/+4 STR/+4 SPD & Tiếp Viện.', accent: '#c2410c' },
      { id: 'IRON_FIST_MASTER', name: 'Tiểu Đoàn Công Binh Phá Lô Cốt', role: 'Không một bức tường bê tông hay bãi mìn nào cản nổi bước tiến đại quân.', weapons: ['AXE', 'SWORD', 'STAFF'], unlockSkill: 'PAVISE', bonuses: { maxHp: 9, str: 5, skl: 4, spd: 4, def: 5, res: 3 }, promoDesc: 'Yếm giáp thép dày giảm 20% sát thương đạn súng máy.', accent: '#9a3412' },
      { id: 'TITAN_DEMIGOD', name: 'Lữ Đoàn Công Binh Đột Phá', role: 'Lực lượng công binh cơ giới hạng nặng mở đường vượt sông và san bằng pháo đài ngầm.', weapons: ['AXE', 'SWORD', 'STAFF'], unlockSkill: 'DRAGON_FANG', bonuses: { maxHp: 12, str: 7, skl: 5, spd: 5, def: 6, res: 4, mov: 1 }, promoDesc: 'Đạt Bậc IV! +12 HP/+7 STR/+6 DEF & Khối Nổ Xuyên Phá.', accent: '#fb923c' },
    ],
  },
  // 24. OUTRIDER LINEAGE — SELF-PROPELLED ANTI-AIRCRAFT ARMOR (ARMOR)
  {
    accent: '#06b6d4',
    domain: 'ARMOR',
    moveType: 'MOUNTED',
    tiers: [
      { id: 'OUTRIDER', name: 'Xe Bán Xích Phòng Không', role: 'Xe thiết giáp bán xích gắn súng máy 4 nòng bảo vệ đội hình khỏi máy bay địch.', weapons: ['BOW', 'LANCE'], skills: ['CANTO_AGILITY', 'SHADOW_STEP'] },
      { id: 'RANGER_KNIGHT', name: 'Thiết Giáp Phòng Không Nhẹ', role: 'Thiết giáp cơ động cao gắn pháo liên thanh kép hộ tống mũi thọc sâu.', weapons: ['BOW', 'LANCE'], unlockSkill: 'DEADEYE_SHOT', bonuses: { maxHp: 5, str: 3, skl: 5, spd: 4, def: 2, mov: 1 }, promoDesc: '+5 SKL/+4 SPD, +1 MOV & Khóa Ngắm Quang Học (+1 tầm).', accent: '#0891b2' },
      { id: 'HORIZON_LANCER', name: 'Pháo Phòng Không Tự Hành Bốn Nòng', role: 'Tháp pháo 4 nòng 23mm đặt trên khung gầm bánh xích cơ động khắp chiến trường.', weapons: ['BOW', 'LANCE', 'SWORD'], unlockSkill: 'LUNA_STRIKE', bonuses: { maxHp: 6, str: 4, skl: 5, spd: 5, def: 3, res: 3 }, promoDesc: 'Đạn xuyên giáp cao tốc xuyên 50% vỏ giáp mục tiêu.', accent: '#0e7490' },
      { id: 'STORM_STRIDER', name: 'Tổ Hợp Pháo – Tên Lửa Phòng Không Tự Hành', role: 'Thiết giáp phòng không tích hợp radar dẫn bắn, pháo 30mm kép và tên lửa tầm nhiệt.', weapons: ['BOW', 'LANCE', 'SWORD'], unlockSkill: 'ASTRA_FLURRY', bonuses: { maxHp: 8, str: 5, skl: 6, spd: 7, def: 4, res: 4, mov: 1 }, promoDesc: 'Đạt Bậc IV! +7 SPD, +1 MOV & Loạt Bắn Tốc Xạ Liên Thanh.', accent: '#22d3ee' },
    ],
  },
  // 25. DARK KNIGHT LINEAGE — SUBMARINES (NAVAL)
  {
    accent: '#9333ea',
    domain: 'NAVAL',
    moveType: 'NAVAL',
    tiers: [
      { id: 'DARK_KNIGHT', name: 'Tàu Ngầm Tuần Tiễu Ven Biển', role: 'Ẩn mình dưới mặt nước, bất ngờ phóng ngư lôi và bắn hải pháo boong tàu.', weapons: ['LANCE', 'TOME'], skills: ['LIFETAKER', 'ARCANE_SURGE'] },
      { id: 'DOOM_RIDER', name: 'Tàu Ngầm Phóng Lôi Đại Dương', role: 'Tàu ngầm tầm xa rình rập cắt đứt tuyến vận tải và kết liễu chiến hạm đối phương.', weapons: ['LANCE', 'TOME', 'SWORD'], unlockSkill: 'VOID_COLLAPSE', bonuses: { maxHp: 6, str: 3, mag: 4, skl: 3, def: 3, res: 3, mov: 1 }, promoDesc: 'Trang bị pháo boong 88mm, +4 MAG/+3 STR, +1 MOV & Loạt Ngư Lôi Đỏ.', accent: '#7e22ce' },
      { id: 'DEATH_KNIGHT', name: 'Tàu Ngầm Tiến Công Tàng Hình', role: 'Tàu ngầm thân thuôn giảm tiếng ồn với ngư lôi dẫn đường âm thanh phản kích phủ đầu.', weapons: ['LANCE', 'TOME', 'SWORD'], unlockSkill: 'VANTAGE', bonuses: { maxHp: 7, str: 4, mag: 5, skl: 4, spd: 4, def: 4, res: 4 }, promoDesc: 'Sonar thụ động phóng ngư lôi trước khi địch kịp thả bom chìm.', accent: '#6b21a8' },
      { id: 'ABYSS_SOVEREIGN', name: 'Tàu Ngầm Hạt Nhân Tên Lửa Chiến Lược', role: 'Đỉnh cao hạm đội ngầm phóng cả ngư lôi hạng nặng lẫn tên lửa hành trình từ lòng biển.', weapons: ['LANCE', 'TOME', 'SWORD'], unlockSkill: 'DRAGON_FANG', bonuses: { maxHp: 10, str: 6, mag: 6, skl: 5, spd: 5, def: 5, res: 6, mov: 1 }, promoDesc: 'Đạt Bậc IV! +6 STR/+6 MAG, +1 MOV & Loạt Ngư Lôi & Tên Lửa Đồng Loạt.', accent: '#c084fc' },
    ],
  },
  // 26. WAR CLERIC LINEAGE — ARMORED RECOVERY & FIELD ENGINEERING (INFANTRY)
  {
    accent: '#d97706',
    domain: 'INFANTRY',
    moveType: 'FOOT',
    tiers: [
      { id: 'WAR_CLERIC', name: 'Tổ Kỹ Thuật Cứu Kéo', role: 'Vừa sử dụng hỏa lực nặng tự vệ vừa đại tu xe pháo và cứu thương ngay tại trận.', weapons: ['AXE', 'STAFF'], skills: ['SANCTUARY_AURA', 'ROYAL_CHARM'] },
      { id: 'BATTLE_PRIEST', name: 'Đại Đội Công Binh Đại Tu Chiến Xa', role: 'Hàn nối xích xe tăng, khắc phục hư hỏng tháp pháo ngay giữa làn đạn pháo.', weapons: ['AXE', 'STAFF'], unlockSkill: 'SOL_STRIKE', bonuses: { maxHp: 6, str: 4, mag: 3, skl: 3, def: 3, res: 4, mov: 1 }, promoDesc: '+6 HP/+4 STR/+4 RES, +1 MOV & Tiếp Viện Khẩn Cấp.', accent: '#b45309' },
      { id: 'CRUSADER_BISHOP', name: 'Trạm Kỹ Thuật Quân Giới Tiền Phương', role: 'Cung cấp cả hỏa lực pháo yểm trợ lẫn bảo dưỡng toàn diện cho đội hình thiết giáp.', weapons: ['AXE', 'STAFF', 'TOME'], unlockSkill: 'AEGIS', bonuses: { maxHp: 7, str: 5, mag: 4, skl: 4, def: 4, res: 5 }, promoDesc: 'Mở khóa Pháo Yểm Trợ & Lưới Chắn Chống Mảnh (-25% ST).', accent: '#92400e' },
      { id: 'WRATHFUL_SERAPH', name: 'Đoàn Bảo Đảm Kỹ Thuật Chiến Dịch', role: 'Đơn vị kỹ thuật quân giới tối tân khôi phục sức chiến đấu cho toàn bộ quân đoàn.', weapons: ['AXE', 'STAFF', 'TOME'], unlockSkill: 'IGNIS_BURST', bonuses: { maxHp: 10, str: 6, mag: 6, skl: 5, spd: 4, def: 5, res: 6, mov: 1 }, promoDesc: 'Đạt Bậc IV! +6 STR/+6 MAG, +1 MOV & Loạt Pháo Hủy Diệt.', accent: '#fbbf24' },
    ],
  },
  // 27. DRAGOON LINEAGE — ASSAULT GUN & HEAVY TANK DESTROYER (ARMOR)
  {
    accent: '#0ea5e9',
    domain: 'ARMOR',
    moveType: 'ARMORED',
    tiers: [
      { id: 'DRAGOON', name: 'Pháo Xung Kích Tự Hành', role: 'Thân xe thấp bọc giáp nghiêng gắn pháo 75mm chuyên phục kích diệt thiết giáp.', weapons: ['LANCE'], skills: ['DRAGON_FANG'] },
      { id: 'WYRM_SLAYER', name: 'Pháo Tự Hành Diệt Tăng', role: 'Pháo 100mm nòng dài bắn xuyên giáp trước xe tăng hạng nặng từ cự ly xa.', weapons: ['LANCE', 'BOW'], unlockSkill: 'LUNA_STRIKE', bonuses: { maxHp: 6, str: 4, skl: 4, spd: 3, def: 4, mov: 1 }, promoDesc: 'Mở khóa Bắn Chặn P.Không, +4 STR/+4 DEF, +1 MOV & Xuyên Giáp 50%.', accent: '#0284c7' },
      { id: 'DRAGON_KNIGHT', name: 'Pháo Diệt Tăng Giáp Nghiêng', role: 'Kết hợp pháo 88–122mm uy lực lớn trên khung gầm bọc giáp nghiêng liền khối.', weapons: ['LANCE', 'BOW', 'SWORD'], unlockSkill: 'PAVISE', bonuses: { maxHp: 8, str: 5, skl: 5, spd: 4, def: 5, res: 3 }, promoDesc: 'Giáp nghiêng liền khối giảm 20% sát thương đạn xuyên giáp.', accent: '#0369a1' },
      { id: 'ETERNAL_DRAGOON', name: 'Siêu Pháo Tự Hành Phá Công Sự', role: 'Pháo tự hành 152mm hạng nặng thổi bay cả tháp pháo xe tăng lẫn boong-ke bê tông.', weapons: ['LANCE', 'BOW', 'SWORD'], unlockSkill: 'IGNIS_BURST', bonuses: { maxHp: 10, str: 7, skl: 6, spd: 5, def: 6, res: 4, mov: 1 }, promoDesc: 'Đạt Bậc IV! +7 STR/+6 DEF, +1 MOV & Loạt Pháo Hủy Diệt.', accent: '#38bdf8' },
    ],
  },
  // 28. NINJA LINEAGE — NIGHT COMMANDOS & SPECIAL OPERATIONS (INFANTRY)
  {
    accent: '#4f46e5',
    domain: 'INFANTRY',
    moveType: 'FOOT',
    tiers: [
      { id: 'NINJA', name: 'Biệt Kích Đột Kích Đêm', role: 'Đột nhập sân bay và bến cảng địch trong đêm bằng tiểu liên giảm thanh.', weapons: ['SWORD', 'BOW'], skills: ['SHADOW_STEP', 'DUELIST_BLOW'] },
      { id: 'MASTER_NINJA', name: 'Phân Đội Đặc Nhiệm Viễn Chinh', role: 'Đánh úp kho nhiên liệu, đài radar và sân bay địch với tốc độ chớp nhoáng.', weapons: ['SWORD', 'BOW'], unlockSkill: 'LETHALITY_STRIKE', bonuses: { maxHp: 4, str: 3, skl: 5, spd: 5, lck: 4, mov: 1 }, promoDesc: '+5 SKL/+5 SPD, +1 MOV & Đột Kích Phá Hoại Kho Đạn (+45% CM)!', accent: '#4338ca' },
      { id: 'SHADOW_KAGE', name: 'Đặc Công Người Nhái Hải Quân', role: 'Bí mật luồn sâu gài mìn từ tính phá hủy cầu cảng và mục tiêu trọng yếu.', weapons: ['SWORD', 'BOW'], unlockSkill: 'VANTAGE', bonuses: { maxHp: 5, str: 4, skl: 5, spd: 6, lck: 5, res: 4 }, promoDesc: 'Luôn nổ súng phản kích trước khi HP xuống dưới 50%.', accent: '#3730a3' },
      { id: 'PHANTOM_SHOGUN', name: 'Lực Lượng Đặc Nhiệm Tối Tinh Nhuệ', role: 'Trang bị kính nhìn đêm đa phổ và vũ khí giảm thanh tác chiến đặc biệt.', weapons: ['SWORD', 'BOW'], unlockSkill: 'ASTRA_FLURRY', bonuses: { maxHp: 7, str: 5, skl: 7, spd: 7, lck: 6, def: 3, res: 5, mov: 1 }, promoDesc: 'Đạt Bậc IV! +7 SKL/+7 SPD, +1 MOV & Loạt Bắn Tốc Xạ.', accent: '#818cf8' },
    ],
  },
  // 29. TEMPLAR LINEAGE — LANDING SHIP -> ESCORT CARRIER -> FLEET CARRIER -> SUPERCARRIER (NAVAL)
  {
    accent: '#eab308',
    domain: 'NAVAL',
    moveType: 'NAVAL',
    tiers: [
      { id: 'TEMPLAR', name: 'Tàu Đổ Bộ Hạng Nặng', role: 'Tàu đổ bộ bọc thép áp sát bờ biển chi viện hỏa lực và tiếp vận tiền phương.', weapons: ['SWORD', 'LANCE'], skills: ['PAVISE', 'ROYAL_CHARM'] },
      { id: 'AEGIS_GUARD', name: 'Tàu Sân Bay Hộ Tống', role: 'Tàu sân bay hộ tống vừa phóng phi đội tuần tra vừa tiếp tế bảo vệ hạm đội.', weapons: ['SWORD', 'LANCE', 'STAFF'], unlockSkill: 'AEGIS', bonuses: { maxHp: 7, str: 3, def: 5, res: 5, mov: 1 }, promoDesc: 'Mở khóa Quân Y/Sửa Chữa Hạm Đội, +5 DEF/+5 RES, +1 MOV & Phòng Không.', accent: '#ca8a04' },
      { id: 'HOLY_BASTION', name: 'Tàu Sân Bay Hạm Đội', role: 'Tàu sân bay chủ lực chở nhiều phi đội tiêm kích, cường kích và phóng lôi.', weapons: ['SWORD', 'LANCE', 'STAFF', 'TOME'], unlockSkill: 'SANCTUARY_AURA', bonuses: { maxHp: 9, str: 4, mag: 5, def: 6, res: 6 }, promoDesc: 'Tung phi đội Không Kích tầm xa & Trạm Đại Tu Hạm Đội 2 ô.', accent: '#a16207' },
      { id: 'DIVINE_WARDEN', name: 'Siêu Tàu Sân Bay Chiến Lược', role: 'Siêu hàng không mẫu hạm đường băng chéo làm chủ cả bầu trời lẫn đại dương.', weapons: ['SWORD', 'LANCE', 'STAFF', 'TOME'], unlockSkill: 'IGNIS_BURST', bonuses: { maxHp: 12, str: 6, mag: 6, def: 8, res: 8, mov: 1 }, promoDesc: 'Đạt Bậc IV! +12 HP/+8 DEF/+8 RES, +1 MOV & Xuất Kích Toàn Hạm Đội.', accent: '#fef08a' },
    ],
  },
  // 30. CHRONOMANCER LINEAGE — RADIO -> RADAR -> ELECTRONIC WARFARE -> C4ISR COMMAND (INFANTRY)
  {
    accent: '#22d3ee',
    domain: 'INFANTRY',
    moveType: 'FOOT',
    tiers: [
      { id: 'CHRONOMANCER', name: 'Sĩ Quan Thông Tin Điện Đài', role: 'Điều phối hỏa lực không – pháo và liên lạc chiến dịch bằng điện đài dã chiến.', weapons: ['TOME', 'STAFF'], skills: ['ARCANE_SURGE', 'ROYAL_CHARM'] },
      { id: 'ASTROLOGER', name: 'Trạm Trinh Sát Radar Tiền Phương', role: 'Phát hiện sớm biên đội máy bay và pháo binh địch xuyên qua màn đêm sương mù.', weapons: ['TOME', 'STAFF'], unlockSkill: 'SANCTUARY_AURA', bonuses: { maxHp: 4, mag: 5, skl: 4, spd: 4, res: 4, mov: 1 }, promoDesc: '+5 MAG/+4 SPD/+4 SKL, +1 MOV & Trạm Chi Viện Bán Kính 2 Ô.', accent: '#06b6d4' },
      { id: 'TIME_WEAVER', name: 'Tổ Tác Chiến Điện Tử', role: 'Gây nhiễu vô tuyến đối phương và dẫn đường chính xác cho hỏa lực xuyên boong-ke.', weapons: ['TOME', 'STAFF'], unlockSkill: 'LUNA_STRIKE', bonuses: { maxHp: 6, mag: 6, skl: 5, spd: 5, res: 5 }, promoDesc: 'Dẫn đường radar xuyên 50% kháng lực công sự mục tiêu.', accent: '#0891b2' },
      { id: 'ETERNAL_CHRONOS', name: 'Trung Tâm Chỉ Huy Tác Chiến Điện Tử', role: 'Hệ thống radar mảng pha kết nối Lục – Thiết – Pháo – Không – Hải theo thời gian thực.', weapons: ['TOME', 'STAFF'], unlockSkill: 'VOID_COLLAPSE', bonuses: { maxHp: 8, mag: 8, skl: 6, spd: 6, lck: 6, res: 7, mov: 1 }, promoDesc: 'Đạt Bậc IV! +8 MAG/+6 SPD, +1 MOV & Pháo Kích Tọa Độ Đỏ.', accent: '#67e8f9' },
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
      domain: lineage.domain,
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
      domain: lineage.domain,
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
      domain: lineage.domain,
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
      domain: lineage.domain,
      moveType: t4Move,
      accent: t4Accent,
      roleSummary: t4.role,
      allowedWeaponTypes: t4.weapons,
      defaultSkills: Array.from(new Set([...t1.skills, t2.unlockSkill, t3.unlockSkill, t4.unlockSkill])),
    };
  }

  // Unique Supreme Antagonist Armored Marshal Class
  map.DARK_GENERAL = {
    id: 'DARK_GENERAL',
    name: 'Thống Chế Thiết Giáp Tối Thượng',
    tier: 4,
    domain: 'ARMOR',
    moveType: 'ARMORED',
    accent: '#991b1b',
    roleSummary: 'Tổng Tư Lệnh tối cao điều khiển siêu chiến xa chỉ huy bọc thép.',
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
  unlockAct: number; // Act 1..16 across WWI & WWII when officer joins Command HQ
  weaponId: string;
  startingInventoryIds: string[];
  portraitKey?: string;
  isLord?: boolean;
  accentColor: string;
  baseStats: Unit['stats'];
  growths: Unit['growths'];
}

/**
 * 30 Playable Officers spanning all 30 Combined-Arms Lineages!
 * Act 1 starts with 8 Officers covering ALL 5 Military Domains immediately:
 * - INFANTRY: Kaelen (Officer), Rowan (Sniper/AA), Elara (Field Medic), Garrick (Stormtrooper)
 * - ARMOR: Lyra (Armored Recon / Sherman Tank)
 * - ARTILLERY: Soren (Mortar / Field Howitzer / Katyusha)
 * - AIRCRAFT: Veyra (Biplane / Dive Bomber / B-17)
 * - NAVAL: Drake (Destroyer / Cruiser / Dreadnought Battleship)
 */
export const HERO_TEMPLATES: HeroTemplate[] = [
  {
    templateId: 'kaelen',
    name: 'Kaelen',
    title: 'Đại Úy Chỉ Huy Tiền Phương',
    classId: 'LORD',
    unlockAct: 1,
    weaponId: 'iron_sword',
    startingInventoryIds: ['iron_sword', 'rapier_valoria', 'steel_sword'],
    portraitKey: 'kaelen',
    isLord: true,
    accentColor: '#3b82f6',
    baseStats: { maxHp: 26, str: 9, mag: 3, skl: 10, spd: 10, lck: 8, def: 7, res: 5, mov: 5 },
    growths: { hp: 85, str: 65, mag: 25, skl: 65, spd: 65, lck: 55, def: 50, res: 35 },
  },
  {
    templateId: 'lyra',
    name: 'Lyra',
    title: 'Chỉ Huy Thiết Giáp Tiên Phong',
    classId: 'CAVALIER',
    unlockAct: 1,
    weaponId: 'iron_lance',
    startingInventoryIds: ['iron_lance', 'javelin', 'ridersbane'],
    accentColor: '#14b8a6',
    baseStats: { maxHp: 27, str: 9, mag: 2, skl: 9, spd: 9, lck: 6, def: 9, res: 4, mov: 6 },
    growths: { hp: 82, str: 58, mag: 15, skl: 58, spd: 55, lck: 45, def: 58, res: 30 },
  },
  {
    templateId: 'soren',
    name: 'Soren',
    title: 'Tham Mưu Pháo Binh Dã Chiến',
    classId: 'MAGE',
    unlockAct: 1,
    weaponId: 'fire_tome',
    startingInventoryIds: ['fire_tome', 'thunder_tome', 'wind_tome', 'ice_tome'],
    accentColor: '#10b981',
    baseStats: { maxHp: 22, str: 2, mag: 11, skl: 10, spd: 10, lck: 7, def: 4, res: 10, mov: 5 },
    growths: { hp: 65, str: 15, mag: 75, skl: 65, spd: 60, lck: 45, def: 25, res: 65 },
  },
  {
    templateId: 'rowan',
    name: 'Rowan',
    title: 'Xạ Thủ Bắn Tỉa & Phòng Không',
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
    title: 'Bác Sĩ Quân Y Chiến Tuyến',
    classId: 'CLERIC',
    unlockAct: 1,
    weaponId: 'heal_staff',
    startingInventoryIds: ['heal_staff', 'mend_staff', 'light_shine'],
    accentColor: '#f59e0b',
    baseStats: { maxHp: 21, str: 1, mag: 10, skl: 8, spd: 8, lck: 10, def: 4, res: 10, mov: 5 },
    growths: { hp: 62, str: 10, mag: 72, skl: 55, spd: 55, lck: 70, def: 22, res: 70 },
  },
  {
    templateId: 'veyra',
    name: 'Veyra',
    title: 'Phi Đội Trưởng Cường Kích',
    classId: 'WYVERN_RIDER',
    unlockAct: 1,
    weaponId: 'iron_axe',
    startingInventoryIds: ['iron_axe', 'hand_axe', 'iron_lance'],
    accentColor: '#059669',
    baseStats: { maxHp: 28, str: 11, mag: 2, skl: 9, spd: 9, lck: 6, def: 10, res: 4, mov: 7 },
    growths: { hp: 85, str: 70, mag: 10, skl: 55, spd: 55, lck: 40, def: 65, res: 25 },
  },
  {
    templateId: 'drake',
    name: 'Drake',
    title: 'Hạm Trưởng Khu Trục Hạm',
    classId: 'PIRATE',
    unlockAct: 1,
    weaponId: 'hand_axe',
    startingInventoryIds: ['hand_axe', 'iron_axe', 'javelin'],
    accentColor: '#0d9488',
    baseStats: { maxHp: 29, str: 11, mag: 2, skl: 9, spd: 10, lck: 8, def: 9, res: 5, mov: 6 },
    growths: { hp: 88, str: 72, mag: 15, skl: 60, spd: 68, lck: 55, def: 52, res: 30 },
  },
  {
    templateId: 'garrick',
    name: 'Garrick',
    title: 'Đội Trưởng Lính Xung Kích',
    classId: 'MERCENARY',
    unlockAct: 1,
    weaponId: 'steel_sword',
    startingInventoryIds: ['steel_sword', 'armorslayer', 'iron_sword'],
    accentColor: '#dc2626',
    baseStats: { maxHp: 27, str: 10, mag: 1, skl: 10, spd: 10, lck: 7, def: 8, res: 4, mov: 5 },
    growths: { hp: 85, str: 65, mag: 10, skl: 70, spd: 65, lck: 50, def: 55, res: 25 },
  },
  // Act 2 (1915 Ypres)
  {
    templateId: 'zephyr',
    name: 'Zephyr',
    title: 'Trinh Sát Mật Mã Chiến Hào',
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
    title: 'Xạ Thủ Chống Tăng Tiền Phương',
    classId: 'SOLDIER',
    unlockAct: 2,
    weaponId: 'steel_lance',
    startingInventoryIds: ['steel_lance', 'javelin', 'killer_lance'],
    accentColor: '#0284c7',
    baseStats: { maxHp: 26, str: 10, mag: 2, skl: 11, spd: 10, lck: 8, def: 9, res: 5, mov: 5 },
    growths: { hp: 80, str: 60, mag: 15, skl: 70, spd: 65, lck: 55, def: 60, res: 35 },
  },
  // Act 3 (1915 Gallipoli Naval & Air)
  {
    templateId: 'mira',
    name: 'Mira',
    title: 'Ách Chủ Bài Tiêm Kích',
    classId: 'PEGASUS',
    unlockAct: 3,
    weaponId: 'silver_lance',
    startingInventoryIds: ['silver_lance', 'javelin', 'ridersbane'],
    accentColor: '#38bdf8',
    baseStats: { maxHp: 24, str: 9, mag: 4, skl: 11, spd: 14, lck: 9, def: 6, res: 10, mov: 7 },
    growths: { hp: 70, str: 50, mag: 30, skl: 70, spd: 75, lck: 60, def: 35, res: 60 },
  },
  {
    templateId: 'malrik',
    name: 'Malrik',
    title: 'Thuyền Trưởng Tàu Ngầm Săn Đêm',
    classId: 'DARK_KNIGHT',
    unlockAct: 3,
    weaponId: 'luna_tome',
    startingInventoryIds: ['luna_tome', 'silver_lance', 'dark_flux'],
    accentColor: '#9333ea',
    baseStats: { maxHp: 29, str: 11, mag: 12, skl: 10, spd: 11, lck: 7, def: 10, res: 10, mov: 6 },
    growths: { hp: 82, str: 58, mag: 68, skl: 62, spd: 60, lck: 45, def: 58, res: 58 },
  },
  // Act 4 (1916 Verdun)
  {
    templateId: 'borin',
    name: 'Borin',
    title: 'Trưởng Xe Tăng Hạng Nặng',
    classId: 'KNIGHT',
    unlockAct: 4,
    weaponId: 'silver_lance',
    startingInventoryIds: ['silver_lance', 'javelin', 'hammer_axe'],
    accentColor: '#94a3b8',
    baseStats: { maxHp: 33, str: 12, mag: 1, skl: 8, spd: 5, lck: 5, def: 15, res: 5, mov: 5 },
    growths: { hp: 95, str: 65, mag: 5, skl: 45, spd: 25, lck: 35, def: 80, res: 25 },
  },
  {
    templateId: 'tormund',
    name: 'Tormund',
    title: 'Đội Trưởng Đại Liên & Phun Lửa',
    classId: 'FIGHTER',
    unlockAct: 4,
    weaponId: 'killer_axe',
    startingInventoryIds: ['killer_axe', 'hand_axe', 'hammer_axe'],
    accentColor: '#ea580c',
    baseStats: { maxHp: 34, str: 14, mag: 1, skl: 10, spd: 11, lck: 7, def: 9, res: 4, mov: 5 },
    growths: { hp: 95, str: 80, mag: 5, skl: 55, spd: 60, lck: 45, def: 45, res: 20 },
  },
  // Act 5 (1916 Jutland Naval)
  {
    templateId: 'aurelia',
    name: 'Aurelia',
    title: 'Phi Đội Trưởng Thủy Phi Cơ',
    classId: 'GRIFFIN_RIDER',
    unlockAct: 5,
    weaponId: 'silver_lance',
    startingInventoryIds: ['silver_lance', 'javelin', 'hand_axe'],
    accentColor: '#f59e0b',
    baseStats: { maxHp: 27, str: 11, mag: 3, skl: 11, spd: 13, lck: 8, def: 9, res: 7, mov: 7 },
    growths: { hp: 80, str: 65, mag: 20, skl: 68, spd: 72, lck: 55, def: 52, res: 45 },
  },
  {
    templateId: 'valen',
    name: 'Valen',
    title: 'Đô Đốc Tàu Sân Bay Hộ Tống',
    classId: 'TEMPLAR',
    unlockAct: 5,
    weaponId: 'javelin',
    startingInventoryIds: ['javelin', 'silver_lance', 'steel_sword'],
    accentColor: '#eab308',
    baseStats: { maxHp: 34, str: 12, mag: 6, skl: 11, spd: 8, lck: 10, def: 15, res: 13, mov: 6 },
    growths: { hp: 94, str: 65, mag: 40, skl: 58, spd: 40, lck: 62, def: 82, res: 76 },
  },
  // Act 6 (1916-1917 Somme Mechanized)
  {
    templateId: 'falkor',
    name: 'Falkor',
    title: 'Chỉ Huy Thiết Giáp Phòng Không',
    classId: 'OUTRIDER',
    unlockAct: 6,
    weaponId: 'wind_bow',
    startingInventoryIds: ['wind_bow', 'silver_lance', 'killer_bow'],
    accentColor: '#06b6d4',
    baseStats: { maxHp: 26, str: 11, mag: 2, skl: 13, spd: 15, lck: 10, def: 7, res: 6, mov: 7 },
    growths: { hp: 76, str: 60, mag: 15, skl: 78, spd: 82, lck: 62, def: 42, res: 38 },
  },
  {
    templateId: 'celeste',
    name: 'Celeste',
    title: 'Chỉ Huy Xe Quân Y Bọc Thép',
    classId: 'TROUBADOUR',
    unlockAct: 6,
    weaponId: 'mend_staff',
    startingInventoryIds: ['mend_staff', 'heal_staff', 'light_shine'],
    accentColor: '#f472b6',
    baseStats: { maxHp: 23, str: 2, mag: 11, skl: 9, spd: 11, lck: 11, def: 6, res: 11, mov: 6 },
    growths: { hp: 65, str: 10, mag: 75, skl: 60, spd: 70, lck: 75, def: 28, res: 75 },
  },
  // Act 7 (1917 Alps & Eastern Front)
  {
    templateId: 'cassian',
    name: 'Cassian',
    title: 'Sĩ Quan Trinh Sát Pháo Binh',
    classId: 'MONK',
    unlockAct: 7,
    weaponId: 'divine_tome',
    startingInventoryIds: ['divine_tome', 'light_shine', 'heal_staff'],
    accentColor: '#eab308',
    baseStats: { maxHp: 24, str: 3, mag: 12, skl: 11, spd: 11, lck: 10, def: 6, res: 12, mov: 5 },
    growths: { hp: 70, str: 15, mag: 75, skl: 65, spd: 60, lck: 65, def: 35, res: 75 },
  },
  {
    templateId: 'brutus',
    name: 'Brutus',
    title: 'Đội Trưởng Công Binh Bộc Phá',
    classId: 'BRAWLER',
    unlockAct: 7,
    weaponId: 'hammer_axe',
    startingInventoryIds: ['hammer_axe', 'killer_axe', 'steel_sword'],
    accentColor: '#ea580c',
    baseStats: { maxHp: 33, str: 13, mag: 2, skl: 10, spd: 12, lck: 7, def: 10, res: 4, mov: 5 },
    growths: { hp: 92, str: 74, mag: 15, skl: 60, spd: 68, lck: 48, def: 58, res: 25 },
  },
  // Act 8 (1918 Hundred Days)
  {
    templateId: 'morgath',
    name: 'Morgath',
    title: 'Chỉ Huy Đại Pháo Công Thành',
    classId: 'DARK_MAGE',
    unlockAct: 8,
    weaponId: 'nosferatu',
    startingInventoryIds: ['nosferatu', 'dark_flux', 'luna_tome'],
    accentColor: '#a855f7',
    baseStats: { maxHp: 26, str: 3, mag: 14, skl: 11, spd: 10, lck: 6, def: 8, res: 12, mov: 5 },
    growths: { hp: 75, str: 15, mag: 80, skl: 60, spd: 55, lck: 40, def: 45, res: 70 },
  },
  {
    templateId: 'orion',
    name: 'Orion',
    title: 'Pháo Trưởng Rocket Đa Nòng',
    classId: 'SHAMAN',
    unlockAct: 8,
    weaponId: 'wind_tome',
    startingInventoryIds: ['wind_tome', 'nosferatu', 'dark_flux'],
    accentColor: '#7c3aed',
    baseStats: { maxHp: 25, str: 2, mag: 13, skl: 10, spd: 10, lck: 8, def: 6, res: 12, mov: 5 },
    growths: { hp: 72, str: 10, mag: 80, skl: 62, spd: 58, lck: 50, def: 38, res: 72 },
  },
  // Act 9 (1939-1940 WWII Opening — Blitzkrieg & Dunkirk)
  {
    templateId: 'sylvara',
    name: 'Sylvara',
    title: 'Tiểu Đoàn Trưởng Lính Dù Không Vận',
    classId: 'SPELLBLADE',
    unlockAct: 9,
    weaponId: 'levin_sword',
    startingInventoryIds: ['levin_sword', 'steel_sword', 'ice_tome'],
    accentColor: '#ec4899',
    baseStats: { maxHp: 26, str: 10, mag: 12, skl: 12, spd: 12, lck: 8, def: 7, res: 9, mov: 5 },
    growths: { hp: 74, str: 52, mag: 68, skl: 68, spd: 72, lck: 52, def: 42, res: 58 },
  },
  {
    templateId: 'kain',
    name: 'Kain',
    title: 'Đội Trưởng Biệt Kích Tiểu Liên',
    classId: 'MYRMIDON',
    unlockAct: 9,
    weaponId: 'wo_dao',
    startingInventoryIds: ['wo_dao', 'steel_sword', 'brave_sword'],
    accentColor: '#f43f5e',
    baseStats: { maxHp: 28, str: 12, mag: 2, skl: 15, spd: 16, lck: 9, def: 8, res: 6, mov: 6 },
    growths: { hp: 75, str: 58, mag: 15, skl: 80, spd: 82, lck: 55, def: 38, res: 32 },
  },
  // Act 10 (1941-1942 North Africa)
  {
    templateId: 'kaelith',
    name: 'Kaelith',
    title: 'Lữ Đoàn Trưởng Săn Tăng Sa Mạc',
    classId: 'NOMAD',
    unlockAct: 10,
    weaponId: 'wind_bow',
    startingInventoryIds: ['wind_bow', 'short_bow', 'killer_bow'],
    accentColor: '#16a34a',
    baseStats: { maxHp: 28, str: 12, mag: 2, skl: 14, spd: 15, lck: 10, def: 8, res: 7, mov: 7 },
    growths: { hp: 76, str: 58, mag: 15, skl: 76, spd: 82, lck: 58, def: 42, res: 38 },
  },
  // Act 11 (1941-1942 Atlantic & Midway)
  {
    templateId: 'kenji',
    name: 'Kenji',
    title: 'Chỉ Huy Thủy Quân Lục Chiến Đổ Bộ',
    classId: 'SAMURAI',
    unlockAct: 11,
    weaponId: 'wo_dao',
    startingInventoryIds: ['wo_dao', 'steel_sword', 'brave_sword'],
    accentColor: '#e11d48',
    baseStats: { maxHp: 29, str: 13, mag: 2, skl: 15, spd: 15, lck: 9, def: 9, res: 6, mov: 5 },
    growths: { hp: 78, str: 64, mag: 15, skl: 82, spd: 78, lck: 55, def: 48, res: 32 },
  },
  // Act 12 (1942-1943 Stalingrad)
  {
    templateId: 'seraphina',
    name: 'Seraphina',
    title: 'Công Trình Sư Đại Tu Chiến Xa',
    classId: 'WAR_CLERIC',
    unlockAct: 12,
    weaponId: 'killer_axe',
    startingInventoryIds: ['killer_axe', 'mend_staff', 'hand_axe'],
    accentColor: '#d97706',
    baseStats: { maxHp: 30, str: 13, mag: 12, skl: 11, spd: 11, lck: 11, def: 10, res: 12, mov: 5 },
    growths: { hp: 82, str: 65, mag: 58, skl: 58, spd: 56, lck: 65, def: 52, res: 64 },
  },
  // Act 13 (1943 Kursk Tank Battle)
  {
    templateId: 'darius',
    name: 'Darius',
    title: 'Chỉ Huy Pháo Tự Hành Diệt Tăng',
    classId: 'DRAGOON',
    unlockAct: 13,
    weaponId: 'dragon_spear',
    startingInventoryIds: ['dragon_spear', 'javelin', 'silver_lance'],
    accentColor: '#0ea5e9',
    baseStats: { maxHp: 34, str: 15, mag: 2, skl: 13, spd: 11, lck: 9, def: 14, res: 7, mov: 5 },
    growths: { hp: 88, str: 74, mag: 12, skl: 72, spd: 62, lck: 50, def: 68, res: 35 },
  },
  // Act 14 (1944 Normandy D-Day)
  {
    templateId: 'kage',
    name: 'Kage',
    title: 'Chỉ Huy Phân Đội Đặc Nhiệm SAS',
    classId: 'NINJA',
    unlockAct: 14,
    weaponId: 'brave_sword',
    startingInventoryIds: ['brave_sword', 'wo_dao', 'killer_bow'],
    accentColor: '#4f46e5',
    baseStats: { maxHp: 28, str: 13, mag: 3, skl: 17, spd: 18, lck: 13, def: 8, res: 9, mov: 6 },
    growths: { hp: 68, str: 56, mag: 20, skl: 86, spd: 88, lck: 72, def: 32, res: 48 },
  },
  // Act 15 (1944-1945 Leyte Gulf & Radar Operations)
  {
    templateId: 'astraea',
    name: 'Astraea',
    title: 'Cục Trưởng Tác Chiến Radar Điện Tử',
    classId: 'CHRONOMANCER',
    unlockAct: 15,
    weaponId: 'astral_tome',
    startingInventoryIds: ['astral_tome', 'physic_staff', 'thunder_tome'],
    accentColor: '#22d3ee',
    baseStats: { maxHp: 28, str: 3, mag: 17, skl: 15, spd: 15, lck: 13, def: 8, res: 16, mov: 5 },
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
  kaelen: 'field_scout',
  lyra: 'field_scout',
  soren: 'arcane_initiate',
  rowan: 'vanguard_valoria',
  elara: 'vanguard_valoria',
  veyra: 'field_scout',
  drake: 'field_scout',
  garrick: 'vanguard_valoria',
};

export function getDefaultCarriedItemsForDomain(domain: UnitDomain): string[] {
  switch (domain) {
    case 'ARMOR':
      return ['herbal_salve', 'aether_tonic']; // Bộ hàn giáp & cơ số đạn xuyên giáp + diesel
    case 'ARTILLERY':
      return ['mana_draught', 'spirit_elixir']; // Cơ số đạn pháo & đầu đạn nhiệt áp/tên lửa
    case 'AIRCRAFT':
      return ['crimson_nectar']; // Thùng dầu hàng không, bom chùm & pháo sáng nhiễu
    case 'NAVAL':
      return ['concoction', 'spirit_elixir']; // Bộ bơm chống chìm & cơ số ngư lôi/bom chìm
    case 'INFANTRY':
    default:
      return ['mana_draught', 'vulnerary']; // Cơ số đạn bộ binh/lựu đạn 40mm & túi cứu thương IFAK
  }
}

export function createInitialRoster(): SavedHeroProgress[] {
  const { starterLoadouts } = createStarterEquipmentBag();
  return HERO_TEMPLATES.map((h) => {
    const domain = CLASS_META[h.classId]?.domain ?? 'INFANTRY';
    return {
      templateId: h.templateId,
      classId: h.classId,
      tier: 1,
      promoted: false,
      equippedTitleId: DEFAULT_HERO_TITLES[h.templateId] ?? 'vanguard_valoria',
      level: h.templateId === 'veyra' ? 3 : h.unlockAct === 1 ? 1 : Math.max(2, h.unlockAct * 3 - 2),
      exp: 0,
      stats: { ...h.baseStats },
      weaponId: h.weaponId,
      equippedArmorUids: starterLoadouts[h.templateId] ? { ...starterLoadouts[h.templateId] } : {},
      inventoryIds: [...h.startingInventoryIds],
      carriedItemIds: getDefaultCarriedItemsForDomain(domain),
      skills: [...CLASS_META[h.classId].defaultSkills],
      potions: 1,
    };
  });
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
    if (actNumber >= 9 && tpl.templateId === 'kaelen') weaponId = 'valoria_blade';
    else if (actNumber >= 4 && weaponId === 'iron_sword') weaponId = 'steel_sword';
    else if (actNumber >= 5 && weaponId === 'iron_lance') weaponId = 'silver_lance';
    else if (actNumber >= 10 && weaponId === 'silver_lance') weaponId = 'dragon_spear';
    else if (actNumber >= 5 && weaponId === 'hunting_bow') weaponId = 'wind_bow';
    else if (actNumber >= 5 && weaponId === 'fire_tome') weaponId = 'thunder_tome';
    else if (actNumber >= 10 && weaponId === 'thunder_tome') weaponId = 'astral_tome';
  }

  const stats = saved ? { ...saved.stats } : { ...tpl.baseStats };
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

  // 5-slot worn equipment (Mũ thép, Áo giáp, Khóa nòng, Khung gầm, Ủng/Động cơ) NEVER consumes any of the 6 personal bag slots
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

  const defaultDomainCarried =
    saved?.carriedItemIds !== undefined
      ? saved.carriedItemIds
      : getDefaultCarriedItemsForDomain(classMeta.domain);
  const carriedItems = defaultDomainCarried
    .filter((id) => Boolean(ITEMS[id] || GEMS[id]))
    .slice(0, remainingSlots);
  remainingSlots = Math.max(0, remainingSlots - carriedItems.length);

  const rawPotions = saved?.potions !== undefined ? Math.max(0, saved.potions) : 1;
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
 * Builds ALL unlocked playable officers for the given Act (up to all 30 combined-arms lineages).
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
 * Selects the active deployed squad for a battle (always led by Commander Kaelen),
 * honoring player-preferred squad IDs when provided and filling remaining slots
 * with combined-arms officers up to `maxDeploySlots`.
 */
export function buildPartyUnitsForAct(
  actNumber: number,
  savedRoster: SavedHeroProgress[],
  recommendedLevel: number,
  equipmentBag: EquipmentInstance[] = [],
  weaponForges: Record<string, WeaponForgeState> = {},
  maxDeploySlots = 8,
  preferredSquadIds?: string[],
  allowNaval = true
): Unit[] {
  const allUnlockedRaw = buildUnlockedRosterUnits(
    actNumber,
    savedRoster,
    recommendedLevel,
    equipmentBag,
    weaponForges
  );
  const allUnlocked = allowNaval
    ? allUnlockedRaw
    : allUnlockedRaw.filter((u) => u.isLord || u.moveType !== 'NAVAL');
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

  const remaining = allUnlocked.filter((u) => !chosenIds.has(u.templateId));
  // Guarantee at least one Field Medic / Repair engineer if available and not yet in squad
  if (chosen.length < limit && !chosen.some((u) => u.weapon.type === 'STAFF')) {
    const healer = remaining.find((u) => u.weapon.type === 'STAFF');
    if (healer) {
      chosen.push(healer);
      chosenIds.add(healer.templateId);
    }
  }

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
