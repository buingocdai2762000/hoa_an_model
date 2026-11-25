import type { CampaignSaveData, TitleDef, Unit, UnitStats } from './types';

export const STARTER_TITLE_IDS: string[] = [
  'vanguard_valoria',
  'blade_of_dawn',
  'arcane_initiate',
  'field_scout',
];

export const TITLES: Record<string, TitleDef> = {
  // === STARTER TITLES (Unlocked from Turn 1) ===
  vanguard_valoria: {
    id: 'vanguard_valoria',
    name: 'Tiên Phong Valoria',
    rarity: 'COMMON',
    category: 'STARTER',
    accentColor: '#60a5fa',
    description: 'Danh hiệu mở đầu của đội tiên phong hoàng gia Valoria, tăng đồng đều sinh lực và công kích.',
    unlockConditionText: 'Mở khóa mặc định khi bắt đầu chiến dịch.',
    statBonuses: { maxHp: 2, str: 1, def: 1 },
    combatBonuses: { hit: 5 },
  },
  blade_of_dawn: {
    id: 'blade_of_dawn',
    name: 'Kiếm Sĩ Bình Minh',
    rarity: 'MYTHIC',
    category: 'STARTER',
    accentColor: '#fbbf24',
    description: 'Lời thề tối thượng bảo vệ ánh dương Aethelis — tỏa hào quang Hoàng Kim Thần Thoại.',
    unlockConditionText: 'Mở khóa mặc định khi bắt đầu chiến dịch.',
    statBonuses: { str: 2, skl: 2 },
    combatBonuses: { hit: 6, crit: 5 },
  },
  arcane_initiate: {
    id: 'arcane_initiate',
    name: 'Học Giả Ma Đạo',
    rarity: 'EPIC',
    category: 'STARTER',
    accentColor: '#c084fc',
    description: 'Am hiểu huyền thuật cổ thư, gia tăng Ma lực, Kháng phép và tỏa hào quang Sử Thi.',
    unlockConditionText: 'Mở khóa mặc định khi bắt đầu chiến dịch.',
    statBonuses: { mag: 2, res: 2 },
    combatBonuses: { hit: 5 },
  },
  field_scout: {
    id: 'field_scout',
    name: 'Trinh Sát Chiến Trường',
    rarity: 'RARE',
    category: 'STARTER',
    accentColor: '#38bdf8',
    description: 'Thân pháp linh hoạt trên mọi địa hình, tăng Tốc độ, Né tránh và tỏa hào quang Tinh Anh.',
    unlockConditionText: 'Mở khóa mặc định khi bắt đầu chiến dịch.',
    statBonuses: { spd: 2, lck: 1 },
    combatBonuses: { avoid: 8 },
  },

  // === COMBAT ACHIEVEMENT TITLES ===
  first_blood: {
    id: 'first_blood',
    name: 'Kẻ Khai Hỏa',
    rarity: 'COMMON',
    category: 'COMBAT',
    accentColor: '#f87171',
    description: 'Chiến công đầu tiên trên chiến trường biên giới Valoria.',
    unlockConditionText: 'Tiêu diệt ít nhất 1 kẻ địch.',
    statBonuses: { str: 2, maxHp: 2 },
    combatBonuses: { crit: 5 },
  },
  veteran_slayer: {
    id: 'veteran_slayer',
    name: 'Bách Chiến Dũng Sĩ',
    rarity: 'RARE',
    category: 'COMBAT',
    accentColor: '#fb923c',
    description: 'Dày dạn sa trường, mỗi nhát chém đều mang sát khí kinh người.',
    unlockConditionText: 'Tiêu diệt tổng cộng 15 kẻ địch.',
    statBonuses: { maxHp: 3, str: 2, spd: 1 },
    combatBonuses: { hit: 8, crit: 6 },
  },
  crimson_reaper: {
    id: 'crimson_reaper',
    name: 'Tử Thần Thiết Huyết',
    rarity: 'EPIC',
    category: 'COMBAT',
    accentColor: '#ef4444',
    description: 'Nỗi khiếp sợ của quân đoàn Thiết Huyết — sát thương và chí mạng vượt trội.',
    unlockConditionText: 'Tiêu diệt tổng cộng 50 kẻ địch.',
    statBonuses: { str: 4, mag: 3, spd: 2 },
    combatBonuses: { crit: 14, hit: 8 },
  },
  god_of_battle: {
    id: 'god_of_battle',
    name: 'Chiến Thần Bất Bại',
    rarity: 'MYTHIC',
    category: 'COMBAT',
    accentColor: '#f43f5e',
    description: 'Huyền thoại bất khả chiến bại, uy thế bao trùm toàn cõi Aethelis.',
    unlockConditionText: 'Tiêu diệt tổng cộng 150 kẻ địch.',
    statBonuses: { maxHp: 6, str: 5, mag: 5, spd: 3, def: 3, res: 3 },
    combatBonuses: { hit: 12, crit: 18, avoid: 12 },
  },
  keen_executioner: {
    id: 'keen_executioner',
    name: 'Nhát Chém Trí Mạng',
    rarity: 'RARE',
    category: 'COMBAT',
    accentColor: '#facc15',
    description: 'Bậc thầy điểm huyệt yếu điểm giáp địch.',
    unlockConditionText: 'Tung ra ít nhất 3 đòn Chí Mạng trong chiến dịch.',
    statBonuses: { skl: 3, lck: 2 },
    combatBonuses: { crit: 12 },
  },
  fate_breaker: {
    id: 'fate_breaker',
    name: 'Phá Toái Thiên Mệnh',
    rarity: 'EPIC',
    category: 'COMBAT',
    accentColor: '#fbbf24',
    description: 'Chém vỡ định mệnh bằng những đòn chí mạng rực sáng.',
    unlockConditionText: 'Tung ra tổng cộng 15 đòn Chí Mạng.',
    statBonuses: { str: 3, skl: 4, spd: 2 },
    combatBonuses: { crit: 20, hit: 10 },
  },
  kingslayer: {
    id: 'kingslayer',
    name: 'Kẻ Trảm Tướng',
    rarity: 'RARE',
    category: 'COMBAT',
    accentColor: '#e879f9',
    description: 'Hạ gục các chỉ huy tinh nhuệ của Đế Chế Thiết Huyết.',
    unlockConditionText: 'Hạ gục 3 Thủ Lĩnh (Boss) chiến dịch.',
    statBonuses: { maxHp: 4, str: 3, mag: 2, def: 2 },
    combatBonuses: { hit: 10, crit: 8 },
  },
  sovereign_bane: {
    id: 'sovereign_bane',
    name: 'Khắc Tinh Huyết Tướng',
    rarity: 'MYTHIC',
    category: 'COMBAT',
    accentColor: '#d946ef',
    description: 'Danh hiệu tối thượng dành cho người hạ gục hàng loạt Nguyên Soái Thiết Huyết.',
    unlockConditionText: 'Hạ gục 15 Thủ Lĩnh (Boss) chiến dịch.',
    statBonuses: { maxHp: 6, str: 4, mag: 4, def: 4, res: 4 },
    combatBonuses: { hit: 15, crit: 15 },
  },

  // === CAMPAIGN PROGRESSION TITLES ===
  border_guardian: {
    id: 'border_guardian',
    name: 'Hộ Vệ Biên Cương',
    rarity: 'COMMON',
    category: 'CAMPAIGN',
    accentColor: '#38bdf8',
    description: 'Giữ vững tuyến phòng thủ đầu tiên trước đại quân xâm lược.',
    unlockConditionText: 'Hoàn thành Màn 1 chiến dịch.',
    statBonuses: { maxHp: 3, def: 2, res: 1 },
    combatBonuses: { avoid: 6 },
  },
  liberator_valoria: {
    id: 'liberator_valoria',
    name: 'Người Giải Phóng Valoria',
    rarity: 'RARE',
    category: 'CAMPAIGN',
    accentColor: '#60a5fa',
    description: 'Quét sạch quân địch khỏi lãnh thổ Valoria trong Hồi I.',
    unlockConditionText: 'Hoàn thành 12 màn (trọn vẹn Hồi I).',
    statBonuses: { maxHp: 4, str: 2, mag: 2, def: 2, res: 2 },
    combatBonuses: { hit: 8, avoid: 8 },
  },
  continental_marshal: {
    id: 'continental_marshal',
    name: 'Đại Nguyên Soái Lục Địa',
    rarity: 'EPIC',
    category: 'CAMPAIGN',
    accentColor: '#fbbf24',
    description: 'Thống lĩnh liên minh các vương quốc tiến sâu vào đất địch.',
    unlockConditionText: 'Hoàn thành 36 màn chiến dịch.',
    statBonuses: { maxHp: 5, str: 3, mag: 3, skl: 3, spd: 3, def: 3, res: 3 },
    combatBonuses: { hit: 10, avoid: 10, goldBonusPercent: 15 },
  },
  chronicle_emperor: {
    id: 'chronicle_emperor',
    name: 'Hoàng Đế Huyết Ấn',
    rarity: 'MYTHIC',
    category: 'CAMPAIGN',
    accentColor: '#fde047',
    description: 'Vị quân vương tối cao thống nhất toàn bộ lục địa Aethelis.',
    unlockConditionText: 'Hoàn thành 72 màn chiến dịch trở lên.',
    statBonuses: { maxHp: 8, str: 5, mag: 5, skl: 5, spd: 4, lck: 5, def: 5, res: 5, mov: 1 },
    combatBonuses: { hit: 15, crit: 15, avoid: 15, goldBonusPercent: 25 },
  },

  // === EVOLUTION / CLASS MASTERY TITLES ===
  awakened_vanguard: {
    id: 'awakened_vanguard',
    name: 'Kẻ Thức Tỉnh Bậc II',
    rarity: 'RARE',
    category: 'EVOLUTION',
    accentColor: '#38bdf8',
    description: 'Vượt ngưỡng sơ cấp, tiến hóa thành chiến binh tinh nhuệ.',
    unlockConditionText: 'Thực hiện ít nhất 1 lần Tiến Hóa lớp nhân vật.',
    statBonuses: { maxHp: 3, str: 2, mag: 2, spd: 1 },
    combatBonuses: { hit: 8 },
  },
  grandmaster_ascendant: {
    id: 'grandmaster_ascendant',
    name: 'Tông Sư Thăng Hoa',
    rarity: 'EPIC',
    category: 'EVOLUTION',
    accentColor: '#a855f7',
    description: 'Đào tạo hàng loạt anh hùng đạt đẳng cấp Tông Sư lừng lẫy.',
    unlockConditionText: 'Thực hiện tổng cộng 5 lần Tiến Hóa hoặc sở hữu tướng Bậc III.',
    statBonuses: { maxHp: 5, str: 3, mag: 3, skl: 3, spd: 2 },
    combatBonuses: { hit: 10, crit: 10 },
  },
  mythic_paragon: {
    id: 'mythic_paragon',
    name: 'Thần Thoại Giáng Lâm',
    rarity: 'MYTHIC',
    category: 'EVOLUTION',
    accentColor: '#f43f5e',
    description: 'Chạm tới đỉnh cao Bậc IV Thần Thoại — hào quang chấn động càn khôn.',
    unlockConditionText: 'Có tướng đạt Bậc IV (Lv.30) hoặc thực hiện 12 lần Tiến Hóa.',
    statBonuses: { maxHp: 7, str: 5, mag: 5, spd: 4, def: 4, res: 4 },
    combatBonuses: { hit: 14, crit: 16, avoid: 12 },
  },

  // === WEALTH & ARMORY TITLES ===
  guild_patron: {
    id: 'guild_patron',
    name: 'Thương Hội Bảo Trợ',
    rarity: 'COMMON',
    category: 'WEALTH',
    accentColor: '#eab308',
    description: 'Giao thương rộng khắp Tiệm Rèn chiến trường và Thương Xá Doanh Trại.',
    unlockConditionText: 'Mua ít nhất 1 vũ khí hoặc vật phẩm tại cửa hàng.',
    statBonuses: { lck: 3, maxHp: 2 },
    combatBonuses: { goldBonusPercent: 15 },
  },
  royal_quartermaster: {
    id: 'royal_quartermaster',
    name: 'Quân Nhu Đại Sư',
    rarity: 'RARE',
    category: 'WEALTH',
    accentColor: '#f59e0b',
    description: 'Tích trữ kho binh khí hùng hậu cho đại quân Valoria.',
    unlockConditionText: 'Sở hữu từ 12 món vũ khí trở lên hoặc mua sắm 5 lần.',
    statBonuses: { maxHp: 3, def: 2, res: 2, lck: 3 },
    combatBonuses: { hit: 6, goldBonusPercent: 25 },
  },
  golden_sovereign: {
    id: 'golden_sovereign',
    name: 'Đế Vương Hoàng Kim',
    rarity: 'EPIC',
    category: 'WEALTH',
    accentColor: '#fde047',
    description: 'Kho báu hoàng kim dồi dào, tiếp tế không ngừng nghỉ cho đại quân.',
    unlockConditionText: 'Tích lũy từ 8.000G trở lên hoặc mua sắm 15 lần.',
    statBonuses: { maxHp: 4, str: 2, mag: 2, lck: 6, def: 3 },
    combatBonuses: { crit: 10, avoid: 10, goldBonusPercent: 40 },
  },

  // === WEATHER & TACTICAL MASTERY TITLES ===
  storm_walker: {
    id: 'storm_walker',
    name: 'Kẻ Bước Qua Giông Bão',
    rarity: 'RARE',
    category: 'WEATHER',
    accentColor: '#38bdf8',
    description: 'Dù mưa bão hay bão tuyết mù mịt, đường kiếm vẫn chuẩn xác tuyệt đối.',
    unlockConditionText: 'Giành chiến thắng ít nhất 2 trận dưới điều kiện thời tiết khắc nghiệt.',
    statBonuses: { spd: 2, skl: 2, res: 2 },
    combatBonuses: { hit: 12, avoid: 10 },
  },
  tempest_sovereign: {
    id: 'tempest_sovereign',
    name: 'Chúa Tể Thiên Tượng',
    rarity: 'EPIC',
    category: 'WEATHER',
    accentColor: '#22d3ee',
    description: 'Thuận theo gió bão, nắng gắt và sương mù để đảo ngược cục diện chiến trường.',
    unlockConditionText: 'Giành chiến thắng 8 trận dưới thời tiết khắc nghiệt.',
    statBonuses: { mag: 4, spd: 3, skl: 3, res: 3 },
    combatBonuses: { hit: 15, crit: 10, avoid: 12 },
  },
  tactician_prodigy: {
    id: 'tactician_prodigy',
    name: 'Kỳ Tài Quân Sư',
    rarity: 'RARE',
    category: 'CAMPAIGN',
    accentColor: '#a78bfa',
    description: 'Sắp đặt thế trận mẫu mực, dẫn dắt binh đoàn 30 hệ phái tiến công hoàn mỹ.',
    unlockConditionText: 'Hoàn thành 5 màn chiến dịch.',
    statBonuses: { skl: 3, mag: 2, spd: 2, res: 2 },
    combatBonuses: { hit: 10, avoid: 8 },
  },
  sky_astral_knight: {
    id: 'sky_astral_knight',
    name: 'Hiệp Sĩ Tinh Tú',
    rarity: 'MYTHIC',
    category: 'WEATHER',
    accentColor: '#67e8f9',
    description: 'Được ánh sao trời chúc phúc, sở hữu tốc độ và cơ động phi phàm.',
    unlockConditionText: 'Hoàn thành 24 màn và thắng 12 trận dưới thời tiết biến đổi.',
    statBonuses: { maxHp: 5, str: 3, mag: 3, spd: 4, mov: 1 },
    combatBonuses: { hit: 12, crit: 12, avoid: 15 },
  },
};

export const TITLE_LIST: TitleDef[] = Object.values(TITLES);

export const TITLE_RARITY_META: Record<
  TitleDef['rarity'],
  { label: string; border: string; bg: string; text: string; badge: string }
> = {
  COMMON: {
    label: 'Phổ Thông',
    border: 'border-slate-400/45',
    bg: 'bg-slate-800/75',
    text: 'text-slate-100',
    badge: 'bg-slate-700/80 text-slate-200 border-slate-500/40',
  },
  RARE: {
    label: 'Tinh Anh',
    border: 'border-sky-400/55',
    bg: 'bg-sky-950/55',
    text: 'text-sky-200',
    badge: 'bg-sky-900/75 text-sky-200 border-sky-400/50',
  },
  EPIC: {
    label: 'Sử Thi',
    border: 'border-purple-400/60',
    bg: 'bg-purple-950/55',
    text: 'text-purple-200',
    badge: 'bg-purple-900/75 text-purple-200 border-purple-400/55',
  },
  MYTHIC: {
    label: 'Thần Thoại',
    border: 'border-amber-400/75',
    bg: 'bg-gradient-to-br from-amber-950/70 via-rose-950/50 to-slate-950/80',
    text: 'text-amber-200',
    badge: 'bg-amber-900/80 text-amber-200 border-amber-400/70',
  },
};

/**
 * Pure deterministic achievement evaluator: checks current save state and returns
 * the full deduplicated set of unlocked title IDs plus any newly unlocked ones.
 */
export function evaluateUnlockedTitles(save: CampaignSaveData): {
  allUnlocked: string[];
  newlyUnlocked: TitleDef[];
} {
  const currentSet = new Set<string>([...STARTER_TITLE_IDS, ...(save.unlockedTitleIds ?? [])]);
  const prevSize = currentSet.size;
  const newlyUnlocked: TitleDef[] = [];

  const completed = save.clearedMaps?.length ?? 0;
  const kills = save.totalDefeatedEnemies ?? 0;
  const crits = save.totalCrits ?? 0;
  const promos = save.totalPromotions ?? 0;
  const purchases = save.totalShopPurchases ?? 0;
  const bossKills = save.totalBossKills ?? 0;
  const weatherWins = save.weatherBattlesWon ?? 0;
  const ownedWeapons = save.convoyWeaponIds?.length ?? 0;
  const heroRecords = save.roster ?? [];
  const hasTier3 = heroRecords.some((h) => (h.tier ?? 1) >= 3);
  const hasTier4 = heroRecords.some((h) => (h.tier ?? 1) >= 4);

  const check = (id: string, condition: boolean) => {
    if (condition && !currentSet.has(id) && TITLES[id]) {
      currentSet.add(id);
      newlyUnlocked.push(TITLES[id]);
    }
  };

  check('first_blood', kills >= 1);
  check('veteran_slayer', kills >= 15);
  check('crimson_reaper', kills >= 50);
  check('god_of_battle', kills >= 150);
  check('keen_executioner', crits >= 3);
  check('fate_breaker', crits >= 15);
  check('kingslayer', bossKills >= 3);
  check('sovereign_bane', bossKills >= 15);

  check('border_guardian', completed >= 1);
  check('tactician_prodigy', completed >= 5);
  check('liberator_valoria', completed >= 12);
  check('continental_marshal', completed >= 36);
  check('chronicle_emperor', completed >= 72);

  check('awakened_vanguard', promos >= 1);
  check('grandmaster_ascendant', promos >= 5 || hasTier3);
  check('mythic_paragon', promos >= 12 || hasTier4);

  check('guild_patron', purchases >= 1);
  check('royal_quartermaster', ownedWeapons >= 12 || purchases >= 5);
  check('golden_sovereign', save.gold >= 8000 || purchases >= 15);

  check('storm_walker', weatherWins >= 2);
  check('tempest_sovereign', weatherWins >= 8);
  check('sky_astral_knight', completed >= 24 && weatherWins >= 12);

  void prevSize;
  return {
    allUnlocked: Array.from(currentSet),
    newlyUnlocked,
  };
}

export interface ComputedTitleBonuses {
  stats: UnitStats;
  hit: number;
  crit: number;
  avoid: number;
  goldBonusPercent: number;
  activeTitleNames: string[];
}

/**
 * Computes combined stat & combat bonuses from a unit's equipped personal title
 * plus the player's Commander Title (for PLAYER faction units).
 * If a hero wears the same title as Commander, personal bonus is applied at 100%
 * and Commander aura applies half bonus (rounded up) to avoid trivial double-stacking.
 */
export function getUnitTitleBonuses(
  unit: Unit,
  commanderTitleId?: string | null
): ComputedTitleBonuses {
  const stats: UnitStats = {
    maxHp: 0,
    str: 0,
    mag: 0,
    skl: 0,
    spd: 0,
    lck: 0,
    def: 0,
    res: 0,
    mov: 0,
  };
  let hit = 0;
  let crit = 0;
  let avoid = 0;
  let goldBonusPercent = 0;
  const activeTitleNames: string[] = [];

  if (unit.faction !== 'PLAYER') {
    return { stats, hit, crit, avoid, goldBonusPercent, activeTitleNames };
  }

  const applyTitle = (title: TitleDef, scale: number) => {
    for (const key of Object.keys(title.statBonuses) as Array<keyof UnitStats>) {
      const val = title.statBonuses[key];
      if (val) {
        stats[key] += scale >= 1 ? val : Math.ceil(val * scale);
      }
    }
    if (title.combatBonuses) {
      hit += Math.round((title.combatBonuses.hit ?? 0) * scale);
      crit += Math.round((title.combatBonuses.crit ?? 0) * scale);
      avoid += Math.round((title.combatBonuses.avoid ?? 0) * scale);
      goldBonusPercent += Math.round((title.combatBonuses.goldBonusPercent ?? 0) * scale);
    }
    activeTitleNames.push(title.name);
  };

  const personal = unit.equippedTitleId ? TITLES[unit.equippedTitleId] : undefined;
  const commander = commanderTitleId ? TITLES[commanderTitleId] : undefined;

  if (personal) {
    applyTitle(personal, 1);
  }
  if (commander) {
    // Commander title grants a global army aura (50% of its stats & combat bonuses to all heroes!)
    const auraScale = personal && personal.id === commander.id ? 0.35 : 0.5;
    applyTitle(commander, auraScale);
  }

  return { stats, hit, crit, avoid, goldBonusPercent, activeTitleNames };
}
