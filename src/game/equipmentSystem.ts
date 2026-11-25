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
    label: 'Mũ Giáp',
    shortLabel: 'Mũ',
    description: 'Bảo hộ đầu, tăng Thủ, Kháng Phép và Kỹ Năng.',
    accent: '#fbbf24',
  },
  ARMOR: {
    label: 'Áo Giáp',
    shortLabel: 'Áo Giáp',
    description: 'Giáp thân chủ lực, tăng mạnh Sinh Lực, Thủ và Kháng.',
    accent: '#60a5fa',
  },
  GAUNTLETS: {
    label: 'Giáp Tay',
    shortLabel: 'Giáp Tay',
    description: 'Hộ uyển chiến đấu, tăng Công, Ma Lực, Chính Xác và Chí Mạng.',
    accent: '#f87171',
  },
  GREAVES: {
    label: 'Giáp Chân',
    shortLabel: 'Giáp Chân',
    description: 'Hộ túc vững chãi, cân bằng Phòng Thủ, Sinh Lực và Né Tránh.',
    accent: '#a78bfa',
  },
  BOOTS: {
    label: 'Giày Chiến',
    shortLabel: 'Giày',
    description: 'Tăng Tốc Độ, Né Tránh, May Mắn và Di Chuyển (MOV).',
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
    label: 'Phổ Thông',
    color: '#cbd5e1',
    borderClass: 'border-slate-500/80',
    bgClass: 'bg-slate-800/70',
    multiplier: 1.0,
    maxSockets: 1,
  },
  RARE: {
    label: 'Hiếm',
    color: '#38bdf8',
    borderClass: 'border-sky-400/85',
    bgClass: 'bg-sky-950/65',
    multiplier: 1.25,
    maxSockets: 1,
  },
  EPIC: {
    label: 'Sử Thi',
    color: '#c084fc',
    borderClass: 'border-purple-400/90',
    bgClass: 'bg-purple-950/65',
    multiplier: 1.55,
    maxSockets: 2,
  },
  LEGENDARY: {
    label: 'Truyền Thuyết',
    color: '#fbbf24',
    borderClass: 'border-amber-400/95',
    bgClass: 'bg-amber-950/65',
    multiplier: 1.9,
    maxSockets: 2,
  },
  MYTHIC: {
    label: 'Thần Thoại',
    color: '#fb7185',
    borderClass: 'border-rose-400',
    bgClass: 'bg-rose-950/70',
    multiplier: 2.35,
    maxSockets: 3,
  },
};

export const MAX_EQUIPMENT_LEVEL = 20;
export const MAX_TEMPER_LEVEL = 10;

// === 25 ARMOR TEMPLATES ACROSS 5 SLOTS (Mũ, Áo Giáp, Giáp Tay, Giáp Chân, Giày) ===
export const ARMOR_TEMPLATES: Record<string, ArmorTemplate> = {
  // 1. HELMET (Mũ — 5)
  iron_helm: {
    id: 'iron_helm',
    name: 'Mũ Sắt Tiên Phong',
    slot: 'HELMET',
    tier: 1,
    price: 380,
    shopTag: 'CAMP',
    accentColor: '#94a3b8',
    description: 'Mũ sắt rèn chắc chắn của quân đoàn Valoria, tăng Thủ và Sinh Lực.',
    baseStats: { maxHp: 2, def: 2, skl: 1 },
  },
  mage_circlet: {
    id: 'mage_circlet',
    name: 'Vòng Đầu Nguyệt Quang',
    slot: 'HELMET',
    tier: 1,
    price: 420,
    shopTag: 'CAMP',
    accentColor: '#38bdf8',
    description: 'Khắc phù văn hội tụ ma lực, nâng cao Kháng Phép và Ma Công.',
    baseStats: { mag: 2, res: 2, skl: 1 },
  },
  knight_sallet: {
    id: 'knight_sallet',
    name: 'Mũ Kỵ Sĩ Hoàng Kim',
    slot: 'HELMET',
    tier: 2,
    price: 920,
    shopTag: 'IN_MAP_ARMORY',
    accentColor: '#f59e0b',
    description: 'Mũ trụ kỵ binh mạ vàng với kính che mặt tinh xảo.',
    baseStats: { maxHp: 4, def: 3, res: 2, skl: 2 },
    baseHit: 5,
  },
  dragon_helm: {
    id: 'dragon_helm',
    name: 'Long Giác Vương Miện',
    slot: 'HELMET',
    tier: 3,
    price: 1850,
    shopTag: 'IN_MAP_ARMORY',
    accentColor: '#ef4444',
    description: 'Chế tác từ sừng cổ long, gia tăng uy áp và tỉ lệ chí mạng.',
    baseStats: { maxHp: 5, str: 2, def: 4, res: 3 },
    baseCrit: 6,
  },
  celestial_diadem: {
    id: 'celestial_diadem',
    name: 'Vương Miện Tinh Tú',
    slot: 'HELMET',
    tier: 4,
    price: 3600,
    shopTag: 'IN_MAP_VENDOR',
    accentColor: '#e879f9',
    description: 'Thánh vật ánh sao ban phước toàn diện cả Công, Phép và Phòng Thủ.',
    baseStats: { maxHp: 7, str: 2, mag: 3, skl: 3, def: 4, res: 5 },
    baseHit: 8,
    baseCrit: 8,
  },

  // 2. ARMOR (Áo Giáp — 5)
  valoria_mail: {
    id: 'valoria_mail',
    name: 'Áo Giáp Xích Valoria',
    slot: 'ARMOR',
    tier: 1,
    price: 460,
    shopTag: 'CAMP',
    accentColor: '#60a5fa',
    description: 'Giáp xích thép chuẩn mực của kỵ sĩ hoàng gia, bền bỉ trước đao kiếm.',
    baseStats: { maxHp: 4, def: 3, res: 1 },
  },
  astral_robe: {
    id: 'astral_robe',
    name: 'Áo Choàng Sao Đêm',
    slot: 'ARMOR',
    tier: 1,
    price: 480,
    shopTag: 'CAMP',
    accentColor: '#818cf8',
    description: 'Áo choàng dệt tơ huyền thuật giúp kháng cự ma pháp mạnh mẽ.',
    baseStats: { maxHp: 3, mag: 2, def: 1, res: 4 },
  },
  paladin_cuirass: {
    id: 'paladin_cuirass',
    name: 'Chiến Giáp Thánh Kỵ',
    slot: 'ARMOR',
    tier: 2,
    price: 1120,
    shopTag: 'IN_MAP_ARMORY',
    accentColor: '#fbbf24',
    description: 'Giáp tấm nguyên khối chạm phù hiệu thánh quang, hộ thể toàn diện.',
    baseStats: { maxHp: 6, def: 5, res: 3 },
  },
  wyvern_plate: {
    id: 'wyvern_plate',
    name: 'Lân Giáp Bạo Long',
    slot: 'ARMOR',
    tier: 3,
    price: 2200,
    shopTag: 'IN_MAP_ARMORY',
    accentColor: '#f97316',
    description: 'Ghép từ vảy rồng lửa bất hoại, cường hóa cả thể phách lẫn sức công.',
    baseStats: { maxHp: 9, str: 2, def: 6, res: 4 },
  },
  aegis_regalia: {
    id: 'aegis_regalia',
    name: 'Thần Giáp Bất Diệt',
    slot: 'ARMOR',
    tier: 4,
    price: 4100,
    shopTag: 'IN_MAP_VENDOR',
    accentColor: '#fde047',
    description: 'Bảo giáp truyền thuyết của đại đế cổ đại, gần như miễn nhiễm thương tích.',
    baseStats: { maxHp: 12, str: 2, mag: 2, def: 8, res: 7 },
    baseAvoid: 6,
  },

  // 3. GAUNTLETS (Giáp Tay — 5)
  warrior_bracers: {
    id: 'warrior_bracers',
    name: 'Giáp Tay Chiến Binh',
    slot: 'GAUNTLETS',
    tier: 1,
    price: 360,
    shopTag: 'CAMP',
    accentColor: '#f87171',
    description: 'Hộ uyển bọc thép giúp đòn vung vũ khí thêm uy lực và chuẩn xác.',
    baseStats: { str: 2, skl: 1, def: 1 },
    baseHit: 4,
  },
  rune_gloves: {
    id: 'rune_gloves',
    name: 'Găng Phù Văn Lôi Quang',
    slot: 'GAUNTLETS',
    tier: 1,
    price: 400,
    shopTag: 'CAMP',
    accentColor: '#22d3ee',
    description: 'Găng tay khắc ấn ký nguyên tố khuếch đại phép thuật và chí mạng.',
    baseStats: { mag: 2, skl: 2, res: 1 },
    baseCrit: 5,
  },
  duelist_vambraces: {
    id: 'duelist_vambraces',
    name: 'Hộ Uyển Kiếm Thánh',
    slot: 'GAUNTLETS',
    tier: 2,
    price: 960,
    shopTag: 'IN_MAP_ARMORY',
    accentColor: '#fb7185',
    description: 'Thiết kế tinh gọn cho kiếm sĩ bậc thầy, bùng nổ tốc độ và chí mạng.',
    baseStats: { str: 3, skl: 3, spd: 1 },
    baseHit: 6,
    baseCrit: 7,
  },
  titan_gauntlets: {
    id: 'titan_gauntlets',
    name: 'Thiết Thủ Khổng Lồ',
    slot: 'GAUNTLETS',
    tier: 3,
    price: 1900,
    shopTag: 'IN_MAP_ARMORY',
    accentColor: '#f59e0b',
    description: 'Găng chiến rèn từ huyền thiết, nghiền nát khiên giáp đối phương.',
    baseStats: { str: 5, skl: 2, def: 3 },
    baseCrit: 8,
  },
  seraph_grips: {
    id: 'seraph_grips',
    name: 'Thần Thủ Thiên Sứ',
    slot: 'GAUNTLETS',
    tier: 4,
    price: 3500,
    shopTag: 'IN_MAP_VENDOR',
    accentColor: '#fcd34d',
    description: 'Đôi hộ uyển rực sáng thánh quang, nâng cực đại sức công và chí mạng.',
    baseStats: { str: 5, mag: 5, skl: 4, def: 2, res: 2 },
    baseHit: 10,
    baseCrit: 12,
  },

  // 4. GREAVES (Giáp Chân — 5)
  steel_greaves: {
    id: 'steel_greaves',
    name: 'Giáp Chân Thép Rèn',
    slot: 'GREAVES',
    tier: 1,
    price: 380,
    shopTag: 'CAMP',
    accentColor: '#a78bfa',
    description: 'Hộ túc thép giữ thế đứng vững vàng khi giao tranh trực diện.',
    baseStats: { maxHp: 3, def: 2, spd: 1 },
  },
  scout_legguards: {
    id: 'scout_legguards',
    name: 'Hộ Túc Trinh Sát',
    slot: 'GREAVES',
    tier: 1,
    price: 410,
    shopTag: 'CAMP',
    accentColor: '#4ade80',
    description: 'Giáp chân da thuộc nhẹ nhàng, tăng khả năng xoay trở và né đòn.',
    baseStats: { spd: 2, lck: 2, def: 1 },
    baseAvoid: 6,
  },
  vanguard_cuisses: {
    id: 'vanguard_cuisses',
    name: 'Giáp Chân Tiên Phong',
    slot: 'GREAVES',
    tier: 2,
    price: 980,
    shopTag: 'IN_MAP_ARMORY',
    accentColor: '#60a5fa',
    description: 'Hộ túc quân đoàn tinh nhuệ kết hợp lớp đệm chống xung chấn.',
    baseStats: { maxHp: 5, def: 4, res: 2, spd: 1 },
    baseAvoid: 5,
  },
  shadow_greaves: {
    id: 'shadow_greaves',
    name: 'Hộ Túc Ảnh Sát',
    slot: 'GREAVES',
    tier: 3,
    price: 1920,
    shopTag: 'IN_MAP_VENDOR',
    accentColor: '#c084fc',
    description: 'Rèn từ hắc thiết không gây tiếng động, tăng mạnh tốc độ và né tránh.',
    baseStats: { maxHp: 4, spd: 4, lck: 3, def: 3, res: 3 },
    baseAvoid: 12,
  },
  sovereign_greaves: {
    id: 'sovereign_greaves',
    name: 'Túc Giáp Hoàng Đế',
    slot: 'GREAVES',
    tier: 4,
    price: 3650,
    shopTag: 'IN_MAP_VENDOR',
    accentColor: '#fbbf24',
    description: 'Bọc vàng ròng khắc cổ ngữ bất động như sơn, uy chấn chiến trường.',
    baseStats: { maxHp: 8, def: 6, res: 5, spd: 3, lck: 3 },
    baseAvoid: 10,
  },

  // 5. BOOTS (Giày — 5)
  march_boots: {
    id: 'march_boots',
    name: 'Giày Hành Quân',
    slot: 'BOOTS',
    tier: 1,
    price: 390,
    shopTag: 'CAMP',
    accentColor: '#34d399',
    description: 'Ủng da dẻo dai của quân đội Valoria, nâng bước tiến và độ linh hoạt.',
    baseStats: { spd: 2, lck: 1, def: 1 },
    baseAvoid: 5,
  },
  gale_treads: {
    id: 'gale_treads',
    name: 'Giày Cánh Gió',
    slot: 'BOOTS',
    tier: 2,
    price: 1080,
    shopTag: 'CAMP',
    accentColor: '#2dd4bf',
    description: 'Khắc phong ấn nhẹ tựa lông hồng, tăng rõ rệt Tốc Độ và Né Tránh.',
    baseStats: { spd: 3, lck: 2, res: 1 },
    baseAvoid: 10,
  },
  cavalier_spurs: {
    id: 'cavalier_spurs',
    name: 'Ủng Xung Phong',
    slot: 'BOOTS',
    tier: 3,
    price: 2150,
    shopTag: 'IN_MAP_ARMORY',
    accentColor: '#38bdf8',
    description: 'Đôi ủng huyền thoại gia tăng +1 Tầm Di Chuyển (MOV) trên chiến trường!',
    baseStats: { spd: 3, def: 2, mov: 1 },
    baseAvoid: 8,
  },
  hermes_sandals: {
    id: 'hermes_sandals',
    name: 'Hài Thần Phong',
    slot: 'BOOTS',
    tier: 4,
    price: 3950,
    shopTag: 'IN_MAP_VENDOR',
    accentColor: '#fde047',
    description: 'Đôi hài có cánh ánh kim ban +1 MOV, Tốc Độ và Né Tránh đỉnh cao.',
    baseStats: { spd: 5, lck: 4, res: 3, mov: 1 },
    baseAvoid: 16,
  },
  astral_striders: {
    id: 'astral_striders',
    name: 'Chiến Hài Tinh Vẫn',
    slot: 'BOOTS',
    tier: 4,
    price: 4200,
    shopTag: 'IN_MAP_VENDOR',
    accentColor: '#c084fc',
    description: 'Bước qua không gian giữa màn sao, cường hóa Công, Phép và +1 MOV.',
    baseStats: { str: 2, mag: 2, spd: 5, def: 3, res: 3, mov: 1 },
    baseAvoid: 14,
  },
};

export const ARMOR_TEMPLATE_LIST = Object.values(ARMOR_TEMPLATES);

// === 8 SOCKETABLE GEMS (BẢO NGỌC) ===
export const GEMS: Record<string, GemDef> = {
  gem_ruby: {
    id: 'gem_ruby',
    name: 'Hồng Ngọc Hỏa Diễm',
    rarity: 'COMMON',
    price: 450,
    color: '#ef4444',
    shortBonus: '+2 STR · +3% CM',
    description: 'Ngọn lửa cô đặc giúp tăng Sức Mạnh Vật Lý và tỉ lệ Chí Mạng.',
    statBonuses: { str: 2 },
    critBonus: 3,
  },
  gem_sapphire: {
    id: 'gem_sapphire',
    name: 'Lam Ngọc Huyền Bí',
    rarity: 'COMMON',
    price: 450,
    color: '#38bdf8',
    shortBonus: '+2 MAG · +2 RES',
    description: 'Tinh thể ma lực cổ đại tăng Ma Lực và Kháng Phép.',
    statBonuses: { mag: 2, res: 2 },
  },
  gem_emerald: {
    id: 'gem_emerald',
    name: 'Lục Bảo Tật Phong',
    rarity: 'COMMON',
    price: 480,
    color: '#34d399',
    shortBonus: '+2 SPD · +5% NÉ',
    description: 'Mang luồng gió thanh thoát giúp tăng Tốc Độ và Né Tránh.',
    statBonuses: { spd: 2 },
    avoidBonus: 5,
  },
  gem_topaz: {
    id: 'gem_topaz',
    name: 'Hoàng Ngọc Ưng Nhãn',
    rarity: 'RARE',
    price: 620,
    color: '#facc15',
    shortBonus: '+2 SKL · +6% CX',
    description: 'Rèn ánh nhìn sắc bén, tăng Kỹ Năng và Chính Xác vượt trội.',
    statBonuses: { skl: 2 },
    hitBonus: 6,
  },
  gem_amethyst: {
    id: 'gem_amethyst',
    name: 'Tử Ngọc Sinh Mệnh',
    rarity: 'RARE',
    price: 600,
    color: '#a855f7',
    shortBonus: '+5 HP · +2 LCK',
    description: 'Dồi dào sinh khí, bồi đắp Sinh Lực tối đa và May Mắn.',
    statBonuses: { maxHp: 5, lck: 2 },
  },
  gem_diamond: {
    id: 'gem_diamond',
    name: 'Kim Cương Hộ Thể',
    rarity: 'EPIC',
    price: 880,
    color: '#e2e8f0',
    shortBonus: '+3 DEF · +2 RES',
    description: 'Cứng rắn bất hoại, gia cố cả Giáp Vật Lý lẫn Kháng Phép.',
    statBonuses: { def: 3, res: 2 },
  },
  gem_sunstone: {
    id: 'gem_sunstone',
    name: 'Thái Dương Thạch',
    rarity: 'LEGENDARY',
    price: 1450,
    color: '#fb923c',
    shortBonus: '+3 STR · +3 MAG · +6% CM',
    description: 'Báu vật mặt trời rực cháy, khuếch đại song công và chí mạng.',
    statBonuses: { str: 3, mag: 3 },
    critBonus: 6,
  },
  gem_void_opal: {
    id: 'gem_void_opal',
    name: 'Hư Không Bảo Thạch',
    rarity: 'MYTHIC',
    price: 2400,
    color: '#e879f9',
    shortBonus: '+3 SPD · +3 SKL · +1 MOV',
    description: 'Thần ngọc hiếm có cho phép bước nhanh hơn (+1 MOV) và tăng Tốc Độ.',
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
    // Kaelen starter equipped set (with duplicate iron_helm & warrior_bracers in bag for immediate Fusion!)
    createEquipmentInstance('iron_helm', { uid: 'eq_start_helm_1', rarity: 'COMMON' }),
    createEquipmentInstance('valoria_mail', { uid: 'eq_start_armor_1', rarity: 'COMMON' }),
    createEquipmentInstance('warrior_bracers', { uid: 'eq_start_gaunt_1', rarity: 'COMMON' }),
    createEquipmentInstance('steel_greaves', { uid: 'eq_start_greaves_1', rarity: 'COMMON' }),
    createEquipmentInstance('march_boots', { uid: 'eq_start_boots_1', rarity: 'COMMON' }),

    // Lyra starter pieces
    createEquipmentInstance('knight_sallet', { uid: 'eq_start_helm_lyra', rarity: 'RARE' }),
    createEquipmentInstance('valoria_mail', { uid: 'eq_start_armor_lyra', rarity: 'COMMON' }),

    // Soren starter pieces
    createEquipmentInstance('mage_circlet', { uid: 'eq_start_helm_soren', rarity: 'COMMON' }),
    createEquipmentInstance('astral_robe', { uid: 'eq_start_armor_soren', rarity: 'COMMON' }),
    createEquipmentInstance('rune_gloves', { uid: 'eq_start_gaunt_soren', rarity: 'COMMON' }),

    // Unassigned spare pieces in Army Armory (including duplicates ready to Equip or Fuse on Turn 1!)
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
  // Level scaling (+6% per level above 1) & Temper scaling (+10% per temper rank)
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
      // MOV stays crisp & tactical (+1 base, +2 only at MYTHIC & temper >= 10)
      stats.mov += base + (instance.rarity === 'MYTHIC' && instance.temperLevel >= 10 ? 1 : 0);
    } else {
      stats[key] += Math.max(base, Math.round(base * totalMult));
    }
  }

  // Flat milestone bonuses so every Temper (+1..+10) and Level (+1..Lv.20) feels immediately rewarding!
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

  // Add Socketed Gems (Bảo Ngọc)
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

  // Keep total equipment MOV bonus capped at +2 for crisp tactical map pacing
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

  // Return any gems that were socketed in the sacrificed material item back to bag!
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

  // Requires either 1 spare copy of the same weapon in convoy OR extra fusion_crystal (+2 crystals)
  const copyIdx = convoyWeaponIds.indexOf(weapon.id);
  let nextConvoy = [...convoyWeaponIds];
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
