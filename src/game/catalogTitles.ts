import type { CampaignSaveData, TitleDef, Unit, UnitStats } from './types';

export const STARTER_TITLE_IDS: string[] = [
  'vanguard_valoria',
  'blade_of_dawn',
  'arcane_initiate',
  'field_scout',
];

export const TITLES: Record<string, TitleDef> = {
  // === STARTER MILITARY MEDALS & COMMENDATIONS (Unlocked from Turn 1) ===
  vanguard_valoria: {
    id: 'vanguard_valoria',
    name: 'Tiên Phong Mặt Trận 1914',
    rarity: 'COMMON',
    category: 'STARTER',
    accentColor: '#60a5fa',
    description: 'Phù hiệu danh dự của Đại Đội Tiên Phong giữ vững chiến tuyến Sông Marne, tăng đồng đều Sinh lực, Hỏa lực và Giáp.',
    unlockConditionText: 'Mở khóa mặc định khi bắt đầu chiến dịch.',
    statBonuses: { maxHp: 2, str: 1, def: 1 },
    combatBonuses: { hit: 5 },
  },
  blade_of_dawn: {
    id: 'blade_of_dawn',
    name: 'Huân Chương Sao Vàng Đồng Minh',
    rarity: 'MYTHIC',
    category: 'STARTER',
    accentColor: '#fbbf24',
    description: 'Lời thề tối thượng bảo vệ hòa bình qua hai cuộc Thế Chiến — tỏa hào quang Chỉ Huy Tối Cao.',
    unlockConditionText: 'Mở khóa mặc định khi bắt đầu chiến dịch.',
    statBonuses: { str: 2, skl: 2 },
    combatBonuses: { hit: 6, crit: 5 },
  },
  arcane_initiate: {
    id: 'arcane_initiate',
    name: 'Sĩ Quan Tham Mưu Hỏa Lực',
    rarity: 'EPIC',
    category: 'STARTER',
    accentColor: '#c084fc',
    description: 'Tinh thông hiệu chỉnh tọa độ pháo binh, không kích và hải pháo — tăng Kỹ Thuật (MAG) & Kháng Nổ (RES).',
    unlockConditionText: 'Mở khóa mặc định khi bắt đầu chiến dịch.',
    statBonuses: { mag: 2, res: 2 },
    combatBonuses: { hit: 5 },
  },
  field_scout: {
    id: 'field_scout',
    name: 'Trinh Sát Tiền Tiêu Không Ảnh',
    rarity: 'RARE',
    category: 'STARTER',
    accentColor: '#38bdf8',
    description: 'Cơ động trên mọi mặt trận đất liền, bầu trời và hải dương — tăng Tốc độ & Né tránh.',
    unlockConditionText: 'Mở khóa mặc định khi bắt đầu chiến dịch.',
    statBonuses: { spd: 2, lck: 1 },
    combatBonuses: { avoid: 8 },
  },

  // === COMBAT ACHIEVEMENT MEDALS ===
  first_blood: {
    id: 'first_blood',
    name: 'Huân Chương Khai Hỏa Đầu Tiên',
    rarity: 'COMMON',
    category: 'COMBAT',
    accentColor: '#f87171',
    description: 'Chiến công tiêu diệt mục tiêu đầu tiên tại chiến hào Thế Chiến I.',
    unlockConditionText: 'Tiêu diệt ít nhất 1 đơn vị địch.',
    statBonuses: { str: 2, maxHp: 2 },
    combatBonuses: { crit: 5 },
  },
  veteran_slayer: {
    id: 'veteran_slayer',
    name: 'Chiến Sĩ Dày Dạn Chiến Hào',
    rarity: 'RARE',
    category: 'COMBAT',
    accentColor: '#fb923c',
    description: 'Vượt qua mưa bom bão đạn với kỹ năng xạ kích điêu luyện.',
    unlockConditionText: 'Tiêu diệt tổng cộng 15 đơn vị địch.',
    statBonuses: { maxHp: 3, str: 2, spd: 1 },
    combatBonuses: { hit: 8, crit: 6 },
  },
  crimson_reaper: {
    id: 'crimson_reaper',
    name: 'Ác Chủ Bài Mặt Trận (Ace)',
    rarity: 'EPIC',
    category: 'COMBAT',
    accentColor: '#ef4444',
    description: 'Danh hiệu Ác Chủ Bài khiến các sư đoàn thiết giáp và phi đội địch khiếp sợ.',
    unlockConditionText: 'Tiêu diệt tổng cộng 50 đơn vị địch.',
    statBonuses: { str: 4, mag: 3, spd: 2 },
    combatBonuses: { crit: 14, hit: 8 },
  },
  god_of_battle: {
    id: 'god_of_battle',
    name: 'Huyền Thoại Hai Cuộc Đại Chiến',
    rarity: 'MYTHIC',
    category: 'COMBAT',
    accentColor: '#f43f5e',
    description: 'Biểu tượng bất khả chiến bại xuyên suốt Thế Chiến I & Thế Chiến II.',
    unlockConditionText: 'Tiêu diệt tổng cộng 150 đơn vị địch.',
    statBonuses: { maxHp: 6, str: 5, mag: 5, spd: 3, def: 3, res: 3 },
    combatBonuses: { hit: 12, crit: 18, avoid: 12 },
  },
  keen_executioner: {
    id: 'keen_executioner',
    name: 'Xạ Thủ Bách Phát Bách Trúng',
    rarity: 'RARE',
    category: 'COMBAT',
    accentColor: '#facc15',
    description: 'Chuyên gia bắn xuyên khe ngắm và khoang đạn đối phương.',
    unlockConditionText: 'Tung ra ít nhất 3 đòn Chí Mạng trong chiến dịch.',
    statBonuses: { skl: 3, lck: 2 },
    combatBonuses: { crit: 12 },
  },
  fate_breaker: {
    id: 'fate_breaker',
    name: 'Sát Thủ Diệt Tăng & Tàu Chiến',
    rarity: 'EPIC',
    category: 'COMBAT',
    accentColor: '#fbbf24',
    description: 'Những phát đạn xuyên giáp chí mạng định đoạt cục diện chiến dịch.',
    unlockConditionText: 'Tung ra tổng cộng 15 đòn Chí Mạng.',
    statBonuses: { str: 3, skl: 4, spd: 2 },
    combatBonuses: { crit: 20, hit: 10 },
  },
  kingslayer: {
    id: 'kingslayer',
    name: 'Khắc Tinh Tư Lệnh Địch',
    rarity: 'RARE',
    category: 'COMBAT',
    accentColor: '#e879f9',
    description: 'Đánh sập sở chỉ huy và hạ gục các tướng lĩnh chủ chốt của đối phương.',
    unlockConditionText: 'Hạ gục 3 Chỉ Huy Địch (Boss) chiến dịch.',
    statBonuses: { maxHp: 4, str: 3, mag: 2, def: 2 },
    combatBonuses: { hit: 10, crit: 8 },
  },
  sovereign_bane: {
    id: 'sovereign_bane',
    name: 'Người Khuất Phục Thống Chế',
    rarity: 'MYTHIC',
    category: 'COMBAT',
    accentColor: '#d946ef',
    description: 'Huân chương tối cao dành cho người đánh bại hàng loạt Thống Chế & Đô Đốc đối phương.',
    unlockConditionText: 'Hạ gục 15 Chỉ Huy Địch (Boss) chiến dịch.',
    statBonuses: { maxHp: 6, str: 4, mag: 4, def: 4, res: 4 },
    combatBonuses: { hit: 15, crit: 15 },
  },

  // === CAMPAIGN PROGRESSION MEDALS (1914 -> 1945, 200 Battles) ===
  border_guardian: {
    id: 'border_guardian',
    name: 'Lá Chắn Phòng Tuyến Sông Marne',
    rarity: 'COMMON',
    category: 'CAMPAIGN',
    accentColor: '#38bdf8',
    description: 'Chặn đứng mũi xung kích đầu tiên của quân xâm lược mùa thu 1914.',
    unlockConditionText: 'Hoàn thành Trận 1 chiến dịch.',
    statBonuses: { maxHp: 3, def: 2, res: 1 },
    combatBonuses: { avoid: 6 },
  },
  liberator_valoria: {
    id: 'liberator_valoria',
    name: 'Huân Chương Chiến Thắng Hồi I',
    rarity: 'RARE',
    category: 'CAMPAIGN',
    accentColor: '#60a5fa',
    description: 'Giữ vững phòng tuyến phía Tây năm 1914 trọn vẹn 12 trận đầu tiên.',
    unlockConditionText: 'Hoàn thành 12 trận (trọn vẹn Hồi I - Thế Chiến I).',
    statBonuses: { maxHp: 4, str: 2, mag: 2, def: 2, res: 2 },
    combatBonuses: { hit: 8, avoid: 8 },
  },
  continental_marshal: {
    id: 'continental_marshal',
    name: 'Anh Hùng Đình Chiến 1918',
    rarity: 'EPIC',
    category: 'CAMPAIGN',
    accentColor: '#fbbf24',
    description: 'Chinh phục chiến trường Thế Chiến Thứ Nhất và dẫn dắt quân đoàn bước sang kỷ nguyên cơ giới.',
    unlockConditionText: 'Hoàn thành 100 trận (Khép lại Phần I: Thế Chiến I) hoặc 48 trận.',
    statBonuses: { maxHp: 5, str: 3, mag: 3, skl: 3, spd: 3, def: 3, res: 3 },
    combatBonuses: { hit: 10, avoid: 10, goldBonusPercent: 15 },
  },
  chronicle_emperor: {
    id: 'chronicle_emperor',
    name: 'Đại Thống Chế Hòa Bình Thế Giới 1945',
    rarity: 'MYTHIC',
    category: 'CAMPAIGN',
    accentColor: '#fde047',
    description: 'Tổng Tư Lệnh tối cao đi trọn chặng đường lịch sử Thế Chiến I & Thế Chiến II.',
    unlockConditionText: 'Hoàn thành từ 120 đến 200 trận chiến dịch.',
    statBonuses: { maxHp: 8, str: 5, mag: 5, skl: 5, spd: 4, lck: 5, def: 5, res: 5, mov: 1 },
    combatBonuses: { hit: 15, crit: 15, avoid: 15, goldBonusPercent: 25 },
  },

  // === EVOLUTION / MODERNIZATION MEDALS ===
  awakened_vanguard: {
    id: 'awakened_vanguard',
    name: 'Cải Tiến Quân Giới Bậc II',
    rarity: 'RARE',
    category: 'EVOLUTION',
    accentColor: '#38bdf8',
    description: 'Hiện đại hóa biên chế từ trang bị sơ kỳ 1914 lên đơn vị chủ lực.',
    unlockConditionText: 'Thực hiện ít nhất 1 lần Thăng Cấp biên chế.',
    statBonuses: { maxHp: 3, str: 2, mag: 2, spd: 1 },
    combatBonuses: { hit: 8 },
  },
  grandmaster_ascendant: {
    id: 'grandmaster_ascendant',
    name: 'Sư Đoàn Cơ Giới Hóa Bậc III',
    rarity: 'EPIC',
    category: 'EVOLUTION',
    accentColor: '#a855f7',
    description: 'Xây dựng lực lượng hiệp đồng Lục – Thiết – Pháo – Không – Hải chuẩn Thế Chiến II.',
    unlockConditionText: 'Thực hiện 5 lần Thăng Cấp hoặc sở hữu đơn vị Bậc III.',
    statBonuses: { maxHp: 5, str: 3, mag: 3, skl: 3, spd: 2 },
    combatBonuses: { hit: 10, crit: 10 },
  },
  mythic_paragon: {
    id: 'mythic_paragon',
    name: 'Siêu Binh Chủng Tối Tân 1945',
    rarity: 'MYTHIC',
    category: 'EVOLUTION',
    accentColor: '#f43f5e',
    description: 'Đạt đỉnh cao khí tài Bậc IV (Tăng Hạng Nặng, Tiêm Kích Phản Lực, Pháo Đài Bay, Tàu Sân Bay Hạm Đội).',
    unlockConditionText: 'Có đơn vị đạt Bậc IV (Lv.30) hoặc thực hiện 12 lần Thăng Cấp.',
    statBonuses: { maxHp: 7, str: 5, mag: 5, spd: 4, def: 4, res: 4 },
    combatBonuses: { hit: 14, crit: 16, avoid: 12 },
  },

  // === LOGISTICS & WAR ECONOMY MEDALS ===
  guild_patron: {
    id: 'guild_patron',
    name: 'Sĩ Quan Tiếp Vận Tiền Phương',
    rarity: 'COMMON',
    category: 'WEALTH',
    accentColor: '#eab308',
    description: 'Đảm bảo nguồn cung đạn dược và thuốc men từ Bộ Tư Lệnh đến tiền tuyến.',
    unlockConditionText: 'Mua ít nhất 1 vũ khí hoặc vật tư tại cửa hàng quân nhu.',
    statBonuses: { lck: 3, maxHp: 2 },
    combatBonuses: { goldBonusPercent: 15 },
  },
  royal_quartermaster: {
    id: 'royal_quartermaster',
    name: 'Chủ Nhiệm Tổng Cục Hậu Cần',
    rarity: 'RARE',
    category: 'WEALTH',
    accentColor: '#f59e0b',
    description: 'Xây dựng Kho Quân Đoàn dồi dào vũ khí dự phòng cho mọi mặt trận.',
    unlockConditionText: 'Sở hữu từ 12 món vũ khí trở lên hoặc mua sắm 5 lần.',
    statBonuses: { maxHp: 3, def: 2, res: 2, lck: 3 },
    combatBonuses: { hit: 6, goldBonusPercent: 25 },
  },
  golden_sovereign: {
    id: 'golden_sovereign',
    name: 'Kiến Trúc Sư Công Nghiệp Quốc Phòng',
    rarity: 'EPIC',
    category: 'WEALTH',
    accentColor: '#fde047',
    description: 'Nguồn ngân sách chiến tranh hùng hậu vận hành cả hạm đội và tập đoàn quân.',
    unlockConditionText: 'Tích lũy từ 8.000G trở lên hoặc mua sắm 15 lần.',
    statBonuses: { maxHp: 4, str: 2, mag: 2, lck: 6, def: 3 },
    combatBonuses: { crit: 10, avoid: 10, goldBonusPercent: 40 },
  },

  // === WEATHER & COMBINED-ARMS TACTICAL MEDALS ===
  storm_walker: {
    id: 'storm_walker',
    name: 'Chiến Binh Vượt Bão Tuyết & Bùn Lầy',
    rarity: 'RARE',
    category: 'WEATHER',
    accentColor: '#38bdf8',
    description: 'Dù mưa dầm Flanders, bão cát Bắc Phi hay mùa đông nước Nga vẫn giữ vững đường ngắm.',
    unlockConditionText: 'Giành chiến thắng ít nhất 2 trận dưới thời tiết khắc nghiệt.',
    statBonuses: { spd: 2, skl: 2, res: 2 },
    combatBonuses: { hit: 12, avoid: 10 },
  },
  tempest_sovereign: {
    id: 'tempest_sovereign',
    name: 'Đô Đốc Vượt Đại Dương Giông Bão',
    rarity: 'EPIC',
    category: 'WEATHER',
    accentColor: '#22d3ee',
    description: 'Lợi dụng sương mù biển Bắc, bão cát và giông lốc để tung đòn tập kích bất ngờ.',
    unlockConditionText: 'Giành chiến thắng 8 trận dưới thời tiết khắc nghiệt.',
    statBonuses: { mag: 4, spd: 3, skl: 3, res: 3 },
    combatBonuses: { hit: 15, crit: 10, avoid: 12 },
  },
  tactician_prodigy: {
    id: 'tactician_prodigy',
    name: 'Chiến Lược Gia Hiệp Đồng Binh Chủng',
    rarity: 'RARE',
    category: 'CAMPAIGN',
    accentColor: '#a78bfa',
    description: 'Phối hợp nhịp nhàng Bộ Binh, Thiết Giáp, Pháo Binh, Không Quân và Hải Quân.',
    unlockConditionText: 'Hoàn thành 5 trận chiến dịch.',
    statBonuses: { skl: 3, mag: 2, spd: 2, res: 2 },
    combatBonuses: { hit: 10, avoid: 8 },
  },
  sky_astral_knight: {
    id: 'sky_astral_knight',
    name: 'Tư Lệnh Không – Hải Liên Hợp',
    rarity: 'MYTHIC',
    category: 'WEATHER',
    accentColor: '#67e8f9',
    description: 'Làm chủ bầu trời và đại dương trong mọi điều kiện khí tượng toàn cầu.',
    unlockConditionText: 'Hoàn thành 24 trận và thắng 12 trận dưới thời tiết biến đổi.',
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
    label: 'Tinh Nhuệ',
    border: 'border-sky-400/55',
    bg: 'bg-sky-950/55',
    text: 'text-sky-200',
    badge: 'bg-sky-900/75 text-sky-200 border-sky-400/50',
  },
  EPIC: {
    label: 'Chiến Công',
    border: 'border-purple-400/60',
    bg: 'bg-purple-950/55',
    text: 'text-purple-200',
    badge: 'bg-purple-900/75 text-purple-200 border-purple-400/55',
  },
  MYTHIC: {
    label: 'Nguyên Soái',
    border: 'border-amber-400/75',
    bg: 'bg-gradient-to-br from-amber-950/70 via-rose-950/50 to-slate-950/80',
    text: 'text-amber-200',
    badge: 'bg-amber-900/80 text-amber-200 border-amber-400/70',
  },
};

export function evaluateUnlockedTitles(save: CampaignSaveData): {
  allUnlocked: string[];
  newlyUnlocked: TitleDef[];
} {
  const currentSet = new Set<string>([...STARTER_TITLE_IDS, ...(save.unlockedTitleIds ?? [])]);
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
  check('continental_marshal', completed >= 48);
  check('chronicle_emperor', completed >= 120);

  check('awakened_vanguard', promos >= 1);
  check('grandmaster_ascendant', promos >= 5 || hasTier3);
  check('mythic_paragon', promos >= 12 || hasTier4);

  check('guild_patron', purchases >= 1);
  check('royal_quartermaster', ownedWeapons >= 12 || purchases >= 5);
  check('golden_sovereign', save.gold >= 8000 || purchases >= 15);

  check('storm_walker', weatherWins >= 2);
  check('tempest_sovereign', weatherWins >= 8);
  check('sky_astral_knight', completed >= 24 && weatherWins >= 12);

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
    const auraScale = personal && personal.id === commander.id ? 0.35 : 0.5;
    applyTitle(commander, auraScale);
  }

  return { stats, hit, crit, avoid, goldBonusPercent, activeTitleNames };
}
