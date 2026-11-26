import type {
  ArmorSlot,
  ArmorTemplate,
  EquipmentInstance,
  EquipmentRarity,
  GemDef,
  Unit,
  UnitStats,
  Weapon,
  WeaponForgeState,
} from './types';

export const ARMOR_SLOTS: ArmorSlot[] = ['HELMET', 'ARMOR', 'GAUNTLETS', 'GREAVES', 'BOOTS'];

export const ARMOR_SLOT_META: Record<
  ArmorSlot,
  { label: string; shortLabel: string; description: string; accent: string }
> = {
  HELMET: {
    label: 'Mũ Thép & Quang Học',
    shortLabel: 'Mũ Thép',
    description: 'Mũ sắt, tai nghe liên lạc & kính ngắm tăng Thủ, Kháng Nổ và Kỹ Năng.',
    accent: '#fbbf24',
  },
  ARMOR: {
    label: 'Áo Chống Mảnh & Vỏ Giáp',
    shortLabel: 'Giáp Thân',
    description: 'Áo chống mảnh đạn & giáp thép tăng mạnh Sinh Lực, Giáp và Kháng Nổ.',
    accent: '#60a5fa',
  },
  GAUNTLETS: {
    label: 'Khóa Nòng & Điều Khiển Bắn',
    shortLabel: 'Hỏa Khống',
    description: 'Găng xạ thủ, bệ tỳ & máy ngắm tăng Hỏa Lực, Kỹ Thuật, Chính Xác & Chí Mạng.',
    accent: '#f87171',
  },
  GREAVES: {
    label: 'Khung Gầm & Hộ Giáp Sườn',
    shortLabel: 'Giáp Sườn',
    description: 'Diềm chắn đạn lõm & đai bảo hộ cân bằng Phòng Thủ, Độ Bền và Né Tránh.',
    accent: '#a78bfa',
  },
  BOOTS: {
    label: 'Ủng Hành Quân & Động Cơ',
    shortLabel: 'Cơ Động',
    description: 'Ủng chiến hào, bánh xích & động cơ tăng Tốc Độ, Né Tránh và Di Chuyển (MOV).',
    accent: '#34d399',
  },
};

export const RARITY_ORDER: EquipmentRarity[] = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];

export const EQUIPMENT_RARITY_META: Record<
  EquipmentRarity,
  {
    label: string;
    color: string;
    borderClass: string;
    bgClass: string;
    multiplier: number;
    maxSockets: number;
  }
> = {
  COMMON: {
    label: 'Tiêu Chuẩn',
    color: '#cbd5e1',
    borderClass: 'border-slate-500/80',
    bgClass: 'bg-slate-800/70',
    multiplier: 1.0,
    maxSockets: 1,
  },
  RARE: {
    label: 'Tinh Nhuệ',
    color: '#38bdf8',
    borderClass: 'border-sky-400/85',
    bgClass: 'bg-sky-950/65',
    multiplier: 1.25,
    maxSockets: 1,
  },
  EPIC: {
    label: 'Đặc Chủng',
    color: '#c084fc',
    borderClass: 'border-purple-400/90',
    bgClass: 'bg-purple-950/65',
    multiplier: 1.55,
    maxSockets: 2,
  },
  LEGENDARY: {
    label: 'Chiến Lược',
    color: '#fbbf24',
    borderClass: 'border-amber-400/95',
    bgClass: 'bg-amber-950/65',
    multiplier: 1.9,
    maxSockets: 2,
  },
  MYTHIC: {
    label: 'Tối Tân',
    color: '#fb7185',
    borderClass: 'border-rose-400',
    bgClass: 'bg-rose-950/70',
    multiplier: 2.35,
    maxSockets: 3,
  },
};

export const MAX_EQUIPMENT_LEVEL = 20;
export const MAX_TEMPER_LEVEL = 10;

// === 25 MILITARY GEAR TEMPLATES ACROSS 5 SLOTS (Preserving all 25 IDs) ===
export const ARMOR_TEMPLATES: Record<string, ArmorTemplate> = {
  // 1. HELMET (Mũ Thép & Quang Học — 5)
  iron_helm: {
    id: 'iron_helm',
    name: 'Mũ Thép Đĩa Brodie Mk I',
    slot: 'HELMET',
    tier: 1,
    price: 380,
    shopTag: 'CAMP',
    accentColor: '#94a3b8',
    description: 'Mũ thép rộng vành kinh điển Thế Chiến I chống mảnh pháo dội từ trên không.',
    baseStats: { maxHp: 2, def: 2, skl: 1 },
  },
  mage_circlet: {
    id: 'mage_circlet',
    name: 'Tai Nghe Điện Đài & Kính Trinh Sát',
    slot: 'HELMET',
    tier: 1,
    price: 420,
    shopTag: 'CAMP',
    accentColor: '#38bdf8',
    description: 'Tai nghe liên lạc pháo binh giúp hiệu chỉnh tọa độ và kháng chấn động nổ.',
    baseStats: { mag: 2, res: 2, skl: 1 },
  },
  knight_sallet: {
    id: 'knight_sallet',
    name: 'Mũ Thép Chiến Đấu M1 / Stahlhelm',
    slot: 'HELMET',
    tier: 2,
    price: 920,
    shopTag: 'IN_MAP_ARMORY',
    accentColor: '#f59e0b',
    description: 'Mũ thép hợp kim mangan Thế Chiến II bảo vệ gáy và thái dương vượt trội.',
    baseStats: { maxHp: 4, def: 3, res: 2, skl: 2 },
    baseHit: 5,
  },
  dragon_helm: {
    id: 'dragon_helm',
    name: 'Mũ Bay & Kính Tiềm Vọng Thiết Giáp',
    slot: 'HELMET',
    tier: 3,
    price: 1850,
    shopTag: 'IN_MAP_ARMORY',
    accentColor: '#ef4444',
    description: 'Tích hợp kính ngắm góc rộng và ống thông thoại chống ồn cho trưởng xe & phi công.',
    baseStats: { maxHp: 5, str: 2, def: 4, res: 3 },
    baseCrit: 6,
  },
  celestial_diadem: {
    id: 'celestial_diadem',
    name: 'Hệ Thống Chỉ Huy Quang-Radar Tác Chiến',
    slot: 'HELMET',
    tier: 4,
    price: 3600,
    shopTag: 'IN_MAP_VENDOR',
    accentColor: '#e879f9',
    description: 'Thiết bị quan sát đêm hồng ngoại & dẫn đường hỏa lực tối tân cuối Thế Chiến II.',
    baseStats: { maxHp: 7, str: 2, mag: 3, skl: 3, def: 4, res: 5 },
    baseHit: 8,
    baseCrit: 8,
  },

  // 2. ARMOR (Áo Chống Mảnh & Vỏ Giáp — 5)
  valoria_mail: {
    id: 'valoria_mail',
    name: 'Áo Khoác Dạ Chiến Hào & Bao Đạn',
    slot: 'ARMOR',
    tier: 1,
    price: 460,
    shopTag: 'CAMP',
    accentColor: '#60a5fa',
    description: 'Quân phục dạ dày kèm tấm che ngực thép Thế Chiến I chống mảnh văng.',
    baseStats: { maxHp: 4, def: 3, res: 1 },
  },
  astral_robe: {
    id: 'astral_robe',
    name: 'Áo Chống Cháy & Bảo Hộ Pháo Khẩu',
    slot: 'ARMOR',
    tier: 1,
    price: 480,
    shopTag: 'CAMP',
    accentColor: '#818cf8',
    description: 'Vải amiăng chống nhiệt và sóng xung kích dành cho kíp pháo & thủy thủ.',
    baseStats: { maxHp: 3, mag: 2, def: 1, res: 4 },
  },
  paladin_cuirass: {
    id: 'paladin_cuirass',
    name: 'Giáp Thép Cán Nghiêng SN-42 / Flak Vest',
    slot: 'ARMOR',
    tier: 2,
    price: 1120,
    shopTag: 'IN_MAP_ARMORY',
    accentColor: '#fbbf24',
    description: 'Giáp ngực thép 2mm của công binh xung kích & áo chống mảnh pháo phòng không.',
    baseStats: { maxHp: 6, def: 5, res: 3 },
  },
  wyvern_plate: {
    id: 'wyvern_plate',
    name: 'Giáp Phức Hợp Thép Krupp / Đai Giáp Hạm',
    slot: 'ARMOR',
    tier: 3,
    price: 2200,
    shopTag: 'IN_MAP_ARMORY',
    accentColor: '#f97316',
    description: 'Tấm giáp thép tôi bề mặt dày dặn chịu được đạn xuyên giáp trực diện.',
    baseStats: { maxHp: 9, str: 2, def: 6, res: 4 },
  },
  aegis_regalia: {
    id: 'aegis_regalia',
    name: 'Giáp Nghiêng Đa Lớp Chiến Lược 1945',
    slot: 'ARMOR',
    tier: 4,
    price: 4100,
    shopTag: 'IN_MAP_VENDOR',
    accentColor: '#fde047',
    description: 'Kết cấu giáp hộp phân khoang chống đạn lõm & ngư lôi bậc nhất Thế Chiến II.',
    baseStats: { maxHp: 12, str: 2, mag: 2, def: 8, res: 7 },
    baseAvoid: 6,
  },

  // 3. GAUNTLETS (Khóa Nòng & Điều Khiển Bắn — 5)
  warrior_bracers: {
    id: 'warrior_bracers',
    name: 'Găng Da Xạ Thủ & Dây Đeo Ổn Định',
    slot: 'GAUNTLETS',
    tier: 1,
    price: 360,
    shopTag: 'CAMP',
    accentColor: '#f87171',
    description: 'Giữ chắc đường ngắm súng trường và giảm độ giật khi điểm xạ liên tục.',
    baseStats: { str: 2, skl: 1, def: 1 },
    baseHit: 4,
  },
  rune_gloves: {
    id: 'rune_gloves',
    name: 'Thước Ngắm Toàn Cảnh & Bảng Phần Tử Bắn',
    slot: 'GAUNTLETS',
    tier: 1,
    price: 400,
    shopTag: 'CAMP',
    accentColor: '#22d3ee',
    description: 'Tính toán góc tầm và sức gió cho pháo binh, không kích và hải pháo.',
    baseStats: { mag: 2, skl: 2, res: 1 },
    baseCrit: 5,
  },
  duelist_vambraces: {
    id: 'duelist_vambraces',
    name: 'Cơ Cấu Giảm Giật Đầu Nòng & Chân Chống',
    slot: 'GAUNTLETS',
    tier: 2,
    price: 960,
    shopTag: 'IN_MAP_ARMORY',
    accentColor: '#fb7185',
    description: 'Tập trung chụm đạn sát thủ, tăng mạnh tốc độ ngắm bắn và chí mạng.',
    baseStats: { str: 3, skl: 3, spd: 1 },
    baseHit: 6,
    baseCrit: 7,
  },
  titan_gauntlets: {
    id: 'titan_gauntlets',
    name: 'Hệ Thống Quay Tháp Pháo Thủy Lực',
    slot: 'GAUNTLETS',
    tier: 3,
    price: 1900,
    shopTag: 'IN_MAP_ARMORY',
    accentColor: '#f59e0b',
    description: 'Xoay nòng bắt mục tiêu tức thì, tăng mạnh hỏa lực xuyên phá và chí mạng.',
    baseStats: { str: 5, skl: 2, def: 3 },
    baseCrit: 8,
  },
  seraph_grips: {
    id: 'seraph_grips',
    name: 'Ổn Định Con Quay Hồi Chuyển Mk 37',
    slot: 'GAUNTLETS',
    tier: 4,
    price: 3500,
    shopTag: 'IN_MAP_VENDOR',
    accentColor: '#fcd34d',
    description: 'Hệ thống ổn định đường ngắm tự động khi đang cơ động trên bộ, trên không và trên biển!',
    baseStats: { str: 5, mag: 5, skl: 4, def: 2, res: 2 },
    baseHit: 10,
    baseCrit: 12,
  },

  // 4. GREAVES (Khung Gầm & Hộ Giáp Sườn — 5)
  steel_greaves: {
    id: 'steel_greaves',
    name: 'Xà Cạp Chiến Hào & Đệm Đầu Gối Thép',
    slot: 'GREAVES',
    tier: 1,
    price: 380,
    shopTag: 'CAMP',
    accentColor: '#a78bfa',
    description: 'Bảo vệ đôi chân người lính giữa bùn lầy, dây thép gai và mảnh đạn.',
    baseStats: { maxHp: 3, def: 2, spd: 1 },
  },
  scout_legguards: {
    id: 'scout_legguards',
    name: 'Đồ Ngụy Trang Trinh Sát Tiền Tiêu',
    slot: 'GREAVES',
    tier: 1,
    price: 410,
    shopTag: 'CAMP',
    accentColor: '#4ade80',
    description: 'Vải bạt ngụy trang lá rừng nhẹ gọn, tăng khả năng luồn lách và né đạn.',
    baseStats: { spd: 2, lck: 2, def: 1 },
    baseAvoid: 6,
  },
  vanguard_cuisses: {
    id: 'vanguard_cuisses',
    name: 'Diềm Thép Chắn Sườn Schürzen',
    slot: 'GREAVES',
    tier: 2,
    price: 980,
    shopTag: 'IN_MAP_ARMORY',
    accentColor: '#60a5fa',
    description: 'Tấm giáp phụ treo hai bên sườn kích nổ sớm đạn chống tăng & mảnh cối.',
    baseStats: { maxHp: 5, def: 4, res: 2, spd: 1 },
    baseAvoid: 5,
  },
  shadow_greaves: {
    id: 'shadow_greaves',
    name: 'Lớp Phủ Chống Từ Zimmerit & Giảm Âm',
    slot: 'GREAVES',
    tier: 3,
    price: 1920,
    shopTag: 'IN_MAP_VENDOR',
    accentColor: '#c084fc',
    description: 'Chống mìn nam châm & hấp thụ sóng sonar, tăng mạnh tốc độ và né tránh.',
    baseStats: { maxHp: 4, spd: 4, lck: 3, def: 3, res: 3 },
    baseAvoid: 12,
  },
  sovereign_greaves: {
    id: 'sovereign_greaves',
    name: 'Khung Gầm Thanh Xoắn & Đai Chống Ngư Lôi',
    slot: 'GREAVES',
    tier: 4,
    price: 3650,
    shopTag: 'IN_MAP_VENDOR',
    accentColor: '#fbbf24',
    description: 'Kết cấu chịu lực đỉnh cao giữ đơn vị vững vàng trước mọi hỏa lực hạng nặng.',
    baseStats: { maxHp: 8, def: 6, res: 5, spd: 3, lck: 3 },
    baseAvoid: 10,
  },

  // 5. BOOTS (Ủng Hành Quân, Bánh Xích & Động Cơ — 5)
  march_boots: {
    id: 'march_boots',
    name: 'Ủng Đinh Tán Hành Quân Chiến Hào',
    slot: 'BOOTS',
    tier: 1,
    price: 390,
    shopTag: 'CAMP',
    accentColor: '#34d399',
    description: 'Ủng da đế đinh chống trượt trên bùn lầy Thế Chiến I.',
    baseStats: { spd: 2, lck: 1, def: 1 },
    baseAvoid: 5,
  },
  gale_treads: {
    id: 'gale_treads',
    name: 'Ủng Nhảy Dù & Lốp Dã Chiến Chống Đạn',
    slot: 'BOOTS',
    tier: 2,
    price: 1080,
    shopTag: 'CAMP',
    accentColor: '#2dd4bf',
    description: 'Tăng rõ rệt tốc độ triển khai đội hình và khả năng cơ động né hỏa lực.',
    baseStats: { spd: 3, lck: 2, res: 1 },
    baseAvoid: 10,
  },
  cavalier_spurs: {
    id: 'cavalier_spurs',
    name: 'Bánh Xích Rộng Ostketten (+1 MOV)',
    slot: 'BOOTS',
    tier: 3,
    price: 2150,
    shopTag: 'IN_MAP_ARMORY',
    accentColor: '#38bdf8',
    description: 'Vượt lầy tuyết không cản trở — tăng +1 Tầm Di Chuyển (MOV) trên chiến trường!',
    baseStats: { spd: 3, def: 2, mov: 1 },
    baseAvoid: 8,
  },
  hermes_sandals: {
    id: 'hermes_sandals',
    name: 'Động Cơ Hàng Không Merlin Siêu Tăng Áp',
    slot: 'BOOTS',
    tier: 4,
    price: 3950,
    shopTag: 'IN_MAP_VENDOR',
    accentColor: '#fde047',
    description: 'Sức kéo phi thường ban +1 MOV, Tốc Độ và Né Tránh đỉnh cao.',
    baseStats: { spd: 5, lck: 4, res: 3, mov: 1 },
    baseAvoid: 16,
  },
  astral_striders: {
    id: 'astral_striders',
    name: 'Tua-Bin Phản Lực & Hơi Nước Cao Áp 1945',
    slot: 'BOOTS',
    tier: 4,
    price: 4200,
    shopTag: 'IN_MAP_VENDOR',
    accentColor: '#c084fc',
    description: 'Công nghệ động lực cuối Thế Chiến II: cường hóa Hỏa Lực, Kỹ Thuật và +1 MOV!',
    baseStats: { str: 2, mag: 2, spd: 5, def: 3, res: 3, mov: 1 },
    baseAvoid: 14,
  },
};

export const ARMOR_TEMPLATE_LIST = Object.values(ARMOR_TEMPLATES);

// === 8 SOCKETABLE TACTICAL TECH MODULES (Preserving all 8 gem_* IDs) ===
export const GEMS: Record<string, GemDef> = {
  gem_ruby: {
    id: 'gem_ruby',
    name: 'Đạn Lõi Thép Xuyên Phá',
    rarity: 'COMMON',
    price: 450,
    color: '#ef4444',
    shortBonus: '+2 STR · +3% CM',
    description: 'Đầu đạn lõi cứng tăng Hỏa Lực Vật Lý và tỉ lệ Chí Mạng.',
    statBonuses: { str: 2 },
    critBonus: 3,
  },
  gem_sapphire: {
    id: 'gem_sapphire',
    name: 'Bộ Khuếch Đại Vô Tuyến',
    rarity: 'COMMON',
    price: 450,
    color: '#38bdf8',
    shortBonus: '+2 MAG · +2 RES',
    description: 'Đèn chân không thu phát sóng nâng cao Hỏa Lực Kỹ Thuật và Kháng Nổ.',
    statBonuses: { mag: 2, res: 2 },
  },
  gem_emerald: {
    id: 'gem_emerald',
    name: 'Bộ Chế Hòa Khí Tăng Tốc',
    rarity: 'COMMON',
    price: 480,
    color: '#34d399',
    shortBonus: '+2 SPD · +5% NÉ',
    description: 'Tối ưu tỉ lệ nhiên liệu giúp tăng Tốc Độ và Né Tránh.',
    statBonuses: { spd: 2 },
    avoidBonus: 5,
  },
  gem_topaz: {
    id: 'gem_topaz',
    name: 'Kính Ngắm Quang Học Zeiss',
    rarity: 'RARE',
    price: 620,
    color: '#facc15',
    shortBonus: '+2 SKL · +6% CX',
    description: 'Thấu kính tráng phủ chống lóa tăng Kỹ Năng và Chính Xác vượt trội.',
    statBonuses: { skl: 2 },
    hitBonus: 6,
  },
  gem_amethyst: {
    id: 'gem_amethyst',
    name: 'Tấm Lót Chống Mảnh Văng',
    rarity: 'RARE',
    price: 600,
    color: '#a855f7',
    shortBonus: '+5 HP · +2 LCK',
    description: 'Lớp đệm hấp thụ mảnh đạn gia tăng Sinh Lực tối đa và May Mắn.',
    statBonuses: { maxHp: 5, lck: 2 },
  },
  gem_diamond: {
    id: 'gem_diamond',
    name: 'Giáp Phản Ứng Chắn Đạn Lõm',
    rarity: 'EPIC',
    price: 880,
    color: '#e2e8f0',
    shortBonus: '+3 DEF · +2 RES',
    description: 'Gia cố vỏ giáp trước cả đạn xuyên động năng lẫn sức ép pháo kích.',
    statBonuses: { def: 3, res: 2 },
  },
  gem_sunstone: {
    id: 'gem_sunstone',
    name: 'Ngòi Nổ Cận Đích Vô Tuyến VT',
    rarity: 'LEGENDARY',
    price: 1450,
    color: '#fb923c',
    shortBonus: '+3 STR · +3 MAG · +6% CM',
    description: 'Phát minh quân sự đột phá Thế Chiến II, khuếch đại song hỏa lực và chí mạng.',
    statBonuses: { str: 3, mag: 3 },
    critBonus: 6,
  },
  gem_void_opal: {
    id: 'gem_void_opal',
    name: 'Radar Bước Sóng Cực Ngắn H2X',
    rarity: 'MYTHIC',
    price: 2400,
    color: '#e879f9',
    shortBonus: '+3 SPD · +3 SKL · +1 MOV',
    description: 'Khí tài dẫn đường xuyên mây mù cho phép tiến quân xa hơn (+1 MOV) và tăng Tốc Độ.',
    statBonuses: { spd: 3, skl: 3, mov: 1 },
    avoidBonus: 6,
  },
};

export const GEM_LIST = Object.values(GEMS);

// === HELPER FACTORIES ===
let equipmentUidCounter = 1;

export function createEquipmentInstance(
  templateId: string,
  options?: {
    uid?: string;
    rarity?: EquipmentRarity;
    level?: number;
    temperLevel?: number;
    gems?: string[];
  }
): EquipmentInstance {
  const tpl = ARMOR_TEMPLATES[templateId] ?? ARMOR_TEMPLATES.iron_helm;
  const uid = options?.uid ?? `eq_${templateId}_${Date.now().toString(36)}_${equipmentUidCounter++}`;
  return {
    uid,
    templateId: tpl.id,
    slot: tpl.slot,
    rarity: options?.rarity ?? (tpl.tier >= 4 ? 'LEGENDARY' : tpl.tier === 3 ? 'EPIC' : tpl.tier === 2 ? 'RARE' : 'COMMON'),
    level: Math.max(1, Math.min(MAX_EQUIPMENT_LEVEL, options?.level ?? 1)),
    temperLevel: Math.max(0, Math.min(MAX_TEMPER_LEVEL, options?.temperLevel ?? 0)),
    gems: Array.isArray(options?.gems) ? [...options.gems] : [],
  };
}

export function createDefaultWeaponForge(weapon: Weapon): WeaponForgeState {
  const rarity: EquipmentRarity =
    weapon.tier >= 4 ? 'LEGENDARY' : weapon.tier === 3 ? 'EPIC' : weapon.tier === 2 ? 'RARE' : 'COMMON';
  return {
    rarity,
    level: 1,
    temperLevel: 0,
    gems: [],
  };
}

export function getMaxSocketsForRarity(rarity: EquipmentRarity): number {
  return EQUIPMENT_RARITY_META[rarity]?.maxSockets ?? 1;
}

export function getNextRarity(rarity: EquipmentRarity): EquipmentRarity | null {
  const idx = RARITY_ORDER.indexOf(rarity);
  if (idx < 0 || idx >= RARITY_ORDER.length - 1) return null;
  return RARITY_ORDER[idx + 1];
}

// === STARTER ARMORY & INITIAL HERO LOADOUT ===
export function createStarterEquipmentBag(): {
  equipmentBag: EquipmentInstance[];
  starterLoadouts: Record<string, Partial<Record<ArmorSlot, string>>>;
} {
  const items: EquipmentInstance[] = [
    createEquipmentInstance('iron_helm', { uid: 'eq_start_helm_1', rarity: 'COMMON' }),
    createEquipmentInstance('valoria_mail', { uid: 'eq_start_armor_1', rarity: 'COMMON' }),
    createEquipmentInstance('warrior_bracers', { uid: 'eq_start_gaunt_1', rarity: 'COMMON' }),
    createEquipmentInstance('steel_greaves', { uid: 'eq_start_greaves_1', rarity: 'COMMON' }),
    createEquipmentInstance('march_boots', { uid: 'eq_start_boots_1', rarity: 'COMMON' }),

    createEquipmentInstance('knight_sallet', { uid: 'eq_start_helm_lyra', rarity: 'RARE' }),
    createEquipmentInstance('valoria_mail', { uid: 'eq_start_armor_lyra', rarity: 'COMMON' }),

    createEquipmentInstance('mage_circlet', { uid: 'eq_start_helm_soren', rarity: 'COMMON' }),
    createEquipmentInstance('astral_robe', { uid: 'eq_start_armor_soren', rarity: 'COMMON' }),
    createEquipmentInstance('rune_gloves', { uid: 'eq_start_gaunt_soren', rarity: 'COMMON' }),

    createEquipmentInstance('iron_helm', { uid: 'eq_spare_helm_2', rarity: 'COMMON' }),
    createEquipmentInstance('valoria_mail', { uid: 'eq_spare_armor_2', rarity: 'COMMON' }),
    createEquipmentInstance('warrior_bracers', { uid: 'eq_spare_gaunt_2', rarity: 'COMMON' }),
    createEquipmentInstance('steel_greaves', { uid: 'eq_spare_greaves_2', rarity: 'COMMON' }),
    createEquipmentInstance('march_boots', { uid: 'eq_spare_boots_2', rarity: 'COMMON' }),
    createEquipmentInstance('scout_legguards', { uid: 'eq_spare_greaves_scout', rarity: 'COMMON' }),
    createEquipmentInstance('gale_treads', { uid: 'eq_spare_boots_gale', rarity: 'RARE' }),
  ];

  const starterLoadouts: Record<string, Partial<Record<ArmorSlot, string>>> = {
    kaelen: {
      HELMET: 'eq_start_helm_1',
      ARMOR: 'eq_start_armor_1',
      GAUNTLETS: 'eq_start_gaunt_1',
      GREAVES: 'eq_start_greaves_1',
      BOOTS: 'eq_start_boots_1',
    },
    lyra: {
      HELMET: 'eq_start_helm_lyra',
      ARMOR: 'eq_start_armor_lyra',
    },
    soren: {
      HELMET: 'eq_start_helm_soren',
      ARMOR: 'eq_start_armor_soren',
      GAUNTLETS: 'eq_start_gaunt_soren',
    },
  };

  return { equipmentBag: items, starterLoadouts };
}

// === PURE STAT COMPUTATION FOR ARMOR & WEAPON FORGING ===
export interface ComputedEquipmentBonuses {
  stats: UnitStats;
  hit: number;
  crit: number;
  avoid: number;
  weaponMight: number;
  weaponHit: number;
  weaponCrit: number;
  equippedSlotsCount: number;
}

export function emptyStats(): UnitStats {
  return { maxHp: 0, str: 0, mag: 0, skl: 0, spd: 0, lck: 0, def: 0, res: 0, mov: 0 };
}

export function computeArmorInstanceBonuses(instance: EquipmentInstance): {
  stats: UnitStats;
  hit: number;
  crit: number;
  avoid: number;
} {
  const tpl = ARMOR_TEMPLATES[instance.templateId];
  const stats = emptyStats();
  if (!tpl) return { stats, hit: 0, crit: 0, avoid: 0 };

  const rarityMult = EQUIPMENT_RARITY_META[instance.rarity]?.multiplier ?? 1;
  const levelMult = 1 + (Math.max(1, instance.level) - 1) * 0.06;
  const temperMult = 1 + Math.max(0, instance.temperLevel) * 0.1;
  const totalMult = rarityMult * levelMult * temperMult;

  const statKeys: Array<keyof UnitStats> = [
    'maxHp',
    'str',
    'mag',
    'skl',
    'spd',
    'lck',
    'def',
    'res',
    'mov',
  ];

  for (const key of statKeys) {
    const base = tpl.baseStats[key] ?? 0;
    if (base <= 0) continue;
    if (key === 'mov') {
      stats.mov += base + (instance.rarity === 'MYTHIC' && instance.temperLevel >= 10 ? 1 : 0);
    } else {
      stats[key] += Math.max(base, Math.round(base * totalMult));
    }
  }

  const lvGain = Math.max(0, instance.level - 1);
  if (lvGain > 0) {
    const lvStep = Math.ceil(lvGain / 2);
    if (instance.slot === 'HELMET') {
      stats.maxHp += lvGain;
      stats.res += Math.floor(lvGain / 2);
    } else if (instance.slot === 'ARMOR') {
      stats.maxHp += lvGain;
      stats.def += Math.floor(lvGain / 2);
    } else if (instance.slot === 'GAUNTLETS') {
      stats.skl += lvStep;
      stats.str += Math.floor(lvGain / 2);
    } else if (instance.slot === 'GREAVES') {
      stats.maxHp += lvStep;
      stats.def += Math.floor(lvGain / 2);
    } else if (instance.slot === 'BOOTS') {
      stats.spd += lvStep;
      stats.lck += Math.floor(lvGain / 2);
    }
  }

  if (instance.temperLevel > 0) {
    const flatStep = Math.ceil(instance.temperLevel / 2);
    if (instance.slot === 'HELMET') {
      stats.def += flatStep;
      stats.res += Math.floor(instance.temperLevel / 3);
    } else if (instance.slot === 'ARMOR') {
      stats.maxHp += instance.temperLevel;
      stats.def += flatStep;
    } else if (instance.slot === 'GAUNTLETS') {
      stats.str += flatStep;
      stats.mag += Math.floor(instance.temperLevel / 2);
    } else if (instance.slot === 'GREAVES') {
      stats.def += flatStep;
      stats.spd += Math.floor(instance.temperLevel / 3);
    } else if (instance.slot === 'BOOTS') {
      stats.spd += flatStep;
      stats.lck += Math.floor(instance.temperLevel / 3);
    }
  }

  let hit = Math.round((tpl.baseHit ?? 0) * rarityMult);
  let crit = Math.round((tpl.baseCrit ?? 0) * rarityMult);
  let avoid = Math.round((tpl.baseAvoid ?? 0) * rarityMult) + (instance.slot === 'BOOTS' ? instance.temperLevel : 0);

  for (const gemId of instance.gems) {
    const gem = GEMS[gemId];
    if (!gem) continue;
    for (const key of statKeys) {
      if (gem.statBonuses[key]) {
        stats[key] += gem.statBonuses[key]!;
      }
    }
    hit += gem.hitBonus ?? 0;
    crit += gem.critBonus ?? 0;
    avoid += gem.avoidBonus ?? 0;
  }

  return { stats, hit, crit, avoid };
}

export function computeWeaponForgeBonuses(
  weapon: Weapon,
  forge?: WeaponForgeState | null
): {
  might: number;
  hit: number;
  crit: number;
  avoid: number;
  stats: UnitStats;
} {
  const stats = emptyStats();
  if (!forge) return { might: 0, hit: 0, crit: 0, avoid: 0, stats };

  const defaultForge = createDefaultWeaponForge(weapon);
  const baseIdx = RARITY_ORDER.indexOf(defaultForge.rarity);
  const curIdx = RARITY_ORDER.indexOf(forge.rarity);
  const rarityStepsAboveBase = Math.max(0, curIdx - baseIdx);

  const might =
    forge.temperLevel +
    Math.floor((Math.max(1, forge.level) - 1) / 3) +
    rarityStepsAboveBase * 3;
  let hit =
    forge.temperLevel * 2 +
    Math.floor((Math.max(1, forge.level) - 1) / 2) +
    rarityStepsAboveBase * 4;
  let crit =
    Math.floor(forge.temperLevel / 2) * 2 +
    Math.floor((Math.max(1, forge.level) - 1) / 4) * 2 +
    rarityStepsAboveBase * 4;
  let avoid = 0;

  for (const gemId of forge.gems) {
    const gem = GEMS[gemId];
    if (!gem) continue;
    for (const [k, v] of Object.entries(gem.statBonuses)) {
      if (v) stats[k as keyof UnitStats] += v;
    }
    hit += gem.hitBonus ?? 0;
    crit += gem.critBonus ?? 0;
    avoid += gem.avoidBonus ?? 0;
  }

  return { might, hit, crit, avoid, stats };
}

export function getUnitEquipmentBonuses(unit: Unit): ComputedEquipmentBonuses {
  const stats = emptyStats();
  let hit = 0;
  let crit = 0;
  let avoid = 0;
  let equippedSlotsCount = 0;

  if (unit.equipment) {
    for (const slot of ARMOR_SLOTS) {
      const piece = unit.equipment[slot];
      if (!piece) continue;
      equippedSlotsCount += 1;
      const b = computeArmorInstanceBonuses(piece);
      stats.maxHp += b.stats.maxHp;
      stats.str += b.stats.str;
      stats.mag += b.stats.mag;
      stats.skl += b.stats.skl;
      stats.spd += b.stats.spd;
      stats.lck += b.stats.lck;
      stats.def += b.stats.def;
      stats.res += b.stats.res;
      stats.mov += b.stats.mov;
      hit += b.hit;
      crit += b.crit;
      avoid += b.avoid;
    }
  }

  const wf = computeWeaponForgeBonuses(unit.weapon, unit.weaponForge);
  stats.maxHp += wf.stats.maxHp;
  stats.str += wf.stats.str;
  stats.mag += wf.stats.mag;
  stats.skl += wf.stats.skl;
  stats.spd += wf.stats.spd;
  stats.lck += wf.stats.lck;
  stats.def += wf.stats.def;
  stats.res += wf.stats.res;
  stats.mov += wf.stats.mov;
  avoid += wf.avoid;

  stats.mov = Math.min(2, stats.mov);

  return {
    stats,
    hit,
    crit,
    avoid,
    weaponMight: wf.might,
    weaponHit: wf.hit,
    weaponCrit: wf.crit,
    equippedSlotsCount,
  };
}

// === FORGE COSTS ===
export function getTemperCost(currentTemper: number): { gold: number; stones: number } {
  return {
    gold: 160 + currentTemper * 120,
    stones: 1 + Math.floor(currentTemper / 3),
  };
}

export function getLevelUpEquipmentCost(currentLevel: number): { gold: number; ingots: number } {
  return {
    gold: 120 + (currentLevel - 1) * 75,
    ingots: 1 + Math.floor((currentLevel - 1) / 5),
  };
}

export function getFusionCost(currentRarity: EquipmentRarity): { gold: number; crystals: number } {
  const idx = Math.max(0, RARITY_ORDER.indexOf(currentRarity));
  return {
    gold: 400 + idx * 450,
    crystals: 1 + Math.floor(idx / 2),
  };
}

// === PURE FORGE ACTIONS (ARMOR INSTANCES) ===
export function temperArmorInstance(
  item: EquipmentInstance,
  gold: number,
  itemBag: Record<string, number>
): { updated: EquipmentInstance; nextGold: number; nextBag: Record<string, number> } | null {
  if (item.temperLevel >= MAX_TEMPER_LEVEL) return null;
  const cost = getTemperCost(item.temperLevel);
  const ownedStones = itemBag.temper_stone ?? 0;
  if (gold < cost.gold || ownedStones < cost.stones) return null;

  const nextBag: Record<string, number> = { ...itemBag, temper_stone: ownedStones - cost.stones };
  if (nextBag.temper_stone <= 0) delete nextBag.temper_stone;

  return {
    updated: { ...item, temperLevel: item.temperLevel + 1 },
    nextGold: gold - cost.gold,
    nextBag,
  };
}

export function levelUpArmorInstance(
  item: EquipmentInstance,
  gold: number,
  itemBag: Record<string, number>
): { updated: EquipmentInstance; nextGold: number; nextBag: Record<string, number> } | null {
  if (item.level >= MAX_EQUIPMENT_LEVEL) return null;
  const cost = getLevelUpEquipmentCost(item.level);
  const ownedIngots = itemBag.star_ingot ?? 0;
  if (gold < cost.gold || ownedIngots < cost.ingots) return null;

  const nextBag: Record<string, number> = { ...itemBag, star_ingot: ownedIngots - cost.ingots };
  if (nextBag.star_ingot <= 0) delete nextBag.star_ingot;

  return {
    updated: { ...item, level: item.level + 1 },
    nextGold: gold - cost.gold,
    nextBag,
  };
}

export function socketGemIntoArmor(
  item: EquipmentInstance,
  gemId: string,
  itemBag: Record<string, number>
): { updated: EquipmentInstance; nextBag: Record<string, number> } | null {
  if (!GEMS[gemId]) return null;
  const maxSockets = getMaxSocketsForRarity(item.rarity);
  if (item.gems.length >= maxSockets) return null;
  const owned = itemBag[gemId] ?? 0;
  if (owned <= 0) return null;

  const nextBag = { ...itemBag, [gemId]: owned - 1 };
  if (nextBag[gemId] <= 0) delete nextBag[gemId];

  return {
    updated: { ...item, gems: [...item.gems, gemId] },
    nextBag,
  };
}

export function unsocketGemFromArmor(
  item: EquipmentInstance,
  socketIndex: number,
  itemBag: Record<string, number>
): { updated: EquipmentInstance; nextBag: Record<string, number>; removedGemId: string } | null {
  if (socketIndex < 0 || socketIndex >= item.gems.length) return null;
  const removedGemId = item.gems[socketIndex];
  const nextGems = item.gems.filter((_, idx) => idx !== socketIndex);
  const nextBag = { ...itemBag, [removedGemId]: (itemBag[removedGemId] ?? 0) + 1 };

  return {
    updated: { ...item, gems: nextGems },
    nextBag,
    removedGemId,
  };
}

export function fuseArmorInstances(
  baseItem: EquipmentInstance,
  materialItem: EquipmentInstance,
  gold: number,
  itemBag: Record<string, number>
): {
  fused: EquipmentInstance;
  nextGold: number;
  nextBag: Record<string, number>;
  returnedGems: string[];
} | null {
  if (baseItem.uid === materialItem.uid) return null;
  if (baseItem.slot !== materialItem.slot) return null;
  if (baseItem.rarity !== materialItem.rarity) return null;
  const nextRarity = getNextRarity(baseItem.rarity);
  if (!nextRarity) return null;

  const cost = getFusionCost(baseItem.rarity);
  const ownedCrystals = itemBag.fusion_crystal ?? 0;
  if (gold < cost.gold || ownedCrystals < cost.crystals) return null;

  const nextBag: Record<string, number> = { ...itemBag, fusion_crystal: ownedCrystals - cost.crystals };
  if (nextBag.fusion_crystal <= 0) delete nextBag.fusion_crystal;

  const returnedGems = [...materialItem.gems];
  for (const gid of returnedGems) {
    nextBag[gid] = (nextBag[gid] ?? 0) + 1;
  }

  const fused: EquipmentInstance = {
    ...baseItem,
    rarity: nextRarity,
    level: Math.min(MAX_EQUIPMENT_LEVEL, Math.max(baseItem.level, materialItem.level) + 1),
    temperLevel: Math.max(baseItem.temperLevel, materialItem.temperLevel),
    gems: [...baseItem.gems],
  };

  return {
    fused,
    nextGold: gold - cost.gold,
    nextBag,
    returnedGems,
  };
}

// === PURE FORGE ACTIONS (WEAPONS) ===
export function temperWeaponForge(
  weapon: Weapon,
  currentForge: WeaponForgeState | undefined,
  gold: number,
  itemBag: Record<string, number>
): { updated: WeaponForgeState; nextGold: number; nextBag: Record<string, number> } | null {
  const state = currentForge ?? createDefaultWeaponForge(weapon);
  if (state.temperLevel >= MAX_TEMPER_LEVEL) return null;
  const cost = getTemperCost(state.temperLevel);
  const ownedStones = itemBag.temper_stone ?? 0;
  if (gold < cost.gold || ownedStones < cost.stones) return null;

  const nextBag: Record<string, number> = { ...itemBag, temper_stone: ownedStones - cost.stones };
  if (nextBag.temper_stone <= 0) delete nextBag.temper_stone;

  return {
    updated: { ...state, temperLevel: state.temperLevel + 1 },
    nextGold: gold - cost.gold,
    nextBag,
  };
}

export function levelUpWeaponForge(
  weapon: Weapon,
  currentForge: WeaponForgeState | undefined,
  gold: number,
  itemBag: Record<string, number>
): { updated: WeaponForgeState; nextGold: number; nextBag: Record<string, number> } | null {
  const state = currentForge ?? createDefaultWeaponForge(weapon);
  if (state.level >= MAX_EQUIPMENT_LEVEL) return null;
  const cost = getLevelUpEquipmentCost(state.level);
  const ownedIngots = itemBag.star_ingot ?? 0;
  if (gold < cost.gold || ownedIngots < cost.ingots) return null;

  const nextBag: Record<string, number> = { ...itemBag, star_ingot: ownedIngots - cost.ingots };
  if (nextBag.star_ingot <= 0) delete nextBag.star_ingot;

  return {
    updated: { ...state, level: state.level + 1 },
    nextGold: gold - cost.gold,
    nextBag,
  };
}

export function socketGemIntoWeapon(
  weapon: Weapon,
  currentForge: WeaponForgeState | undefined,
  gemId: string,
  itemBag: Record<string, number>
): { updated: WeaponForgeState; nextBag: Record<string, number> } | null {
  if (!GEMS[gemId]) return null;
  const state = currentForge ?? createDefaultWeaponForge(weapon);
  if (state.gems.length >= getMaxSocketsForRarity(state.rarity)) return null;
  const owned = itemBag[gemId] ?? 0;
  if (owned <= 0) return null;

  const nextBag = { ...itemBag, [gemId]: owned - 1 };
  if (nextBag[gemId] <= 0) delete nextBag[gemId];

  return {
    updated: { ...state, gems: [...state.gems, gemId] },
    nextBag,
  };
}

export function unsocketGemFromWeapon(
  weapon: Weapon,
  currentForge: WeaponForgeState | undefined,
  socketIndex: number,
  itemBag: Record<string, number>
): { updated: WeaponForgeState; nextBag: Record<string, number>; removedGemId: string } | null {
  const state = currentForge ?? createDefaultWeaponForge(weapon);
  if (socketIndex < 0 || socketIndex >= state.gems.length) return null;
  const removedGemId = state.gems[socketIndex];
  const nextGems = state.gems.filter((_, idx) => idx !== socketIndex);
  const nextBag = { ...itemBag, [removedGemId]: (itemBag[removedGemId] ?? 0) + 1 };

  return {
    updated: { ...state, gems: nextGems },
    nextBag,
    removedGemId,
  };
}

export function fuseWeaponForge(
  weapon: Weapon,
  currentForge: WeaponForgeState | undefined,
  convoyWeaponIds: string[],
  gold: number,
  itemBag: Record<string, number>
): {
  updated: WeaponForgeState;
  nextConvoyWeaponIds: string[];
  nextGold: number;
  nextBag: Record<string, number>;
} | null {
  const state = currentForge ?? createDefaultWeaponForge(weapon);
  const nextRarity = getNextRarity(state.rarity);
  if (!nextRarity) return null;

  const cost = getFusionCost(state.rarity);
  const ownedCrystals = itemBag.fusion_crystal ?? 0;
  if (gold < cost.gold || ownedCrystals < cost.crystals) return null;

  const copyIdx = convoyWeaponIds.indexOf(weapon.id);
  const nextConvoy = [...convoyWeaponIds];
  let crystalsNeeded = cost.crystals;
  if (copyIdx >= 0) {
    nextConvoy.splice(copyIdx, 1);
  } else {
    crystalsNeeded = cost.crystals + 2;
    if (ownedCrystals < crystalsNeeded) return null;
  }

  const nextBag: Record<string, number> = { ...itemBag, fusion_crystal: ownedCrystals - crystalsNeeded };
  if (nextBag.fusion_crystal <= 0) delete nextBag.fusion_crystal;

  return {
    updated: {
      ...state,
      rarity: nextRarity,
      level: Math.min(MAX_EQUIPMENT_LEVEL, state.level + 1),
    },
    nextConvoyWeaponIds: nextConvoy,
    nextGold: gold - cost.gold,
    nextBag,
  };
}
