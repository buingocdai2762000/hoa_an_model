import type { MagicElement, UnitTier, Weapon, WeaponShopTag, WeaponType } from './types';

function w(
  id: string,
  name: string,
  type: WeaponType,
  might: number,
  hit: number,
  crit: number,
  minRange: number,
  maxRange: number,
  tier: UnitTier,
  price: number,
  shopTag: WeaponShopTag,
  description: string,
  extra: Partial<Weapon> = {}
): Weapon {
  const isMagic = extra.isMagic ?? (type === 'TOME' || type === 'STAFF');
  const element: MagicElement = extra.element ?? 'NONE';
  return {
    id,
    name,
    type,
    element,
    might,
    hit,
    crit,
    minRange,
    maxRange,
    isMagic,
    tier,
    price,
    shopTag,
    description,
    ...extra,
  };
}

/**
 * 136 WWI & WWII Combined-Arms Weapons, Cannons, Torpedoes, Anti-Air Flak, Artillery/Airstrikes & Field Medkits
 * across 6 categories, 6 tactical munition elements, and 4 power tiers (1914 -> 1945).
 */
export const WEAPONS: Record<string, Weapon> = {
  // =========================================================================
  // SWORD -> SÚNG BỘ BINH & TIỂU LIÊN (INFANTRY FIREARMS) — 24 weapons
  // =========================================================================
  bronze_sword: w('bronze_sword', 'Carbine Huấn Luyện M1903', 'SWORD', 4, 100, 0, 1, 1, 1, 280, 'CAMP', 'Súng carbine tiêu chuẩn tân binh Thế Chiến I, ngắm bắn cực chuẩn xác.'),
  iron_sword: w('iron_sword', 'Súng Trường Lee-Enfield', 'SWORD', 6, 92, 5, 1, 2, 1, 450, 'CAMP', 'Súng trường lên đạn tay kinh điển Thế Chiến I, khai hỏa tầm 1–2 ô.'),
  slim_sword: w('slim_sword', 'Súng Ngắn Sĩ Quan Mauser C96 / M1911', 'SWORD', 5, 98, 12, 1, 1, 1, 520, 'CAMP', 'Súng ngắn bán tự động gọn nhẹ cho bộ binh & sĩ quan, phản xạ nhanh và dễ bắn hiểm.'),
  rapier_valoria: w('rapier_valoria', 'Súng Trường Xuyên Giáp K-Bullet', 'SWORD', 8, 95, 15, 1, 2, 1, 980, 'IN_MAP_ARMORY', 'Đạn lõi thép đặc biệt của Sĩ Quan Chỉ Huy — khắc chế Thiết Giáp & Cơ Giới (×2).', { effectiveVsArmor: true, effectiveVsCavalry: true }),
  steel_sword: w('steel_sword', 'Súng Tiểu Liên Chiến Hào MP18 / MP40', 'SWORD', 9, 88, 8, 1, 1, 1, 780, 'CAMP', 'Súng tiểu liên bộ binh xung kích quét sạch chiến hào và đô thị tầm gần.'),
  armorslayer: w('armorslayer', 'Súng Trường Chống Tăng T-Gewehr', 'SWORD', 9, 84, 6, 1, 2, 2, 1150, 'IN_MAP_ARMORY', 'Súng trường chống tăng 13.2mm chuyên xuyên thủng vỏ thép (×2 Thiết Giáp).', { effectiveVsArmor: true }),
  zanbato: w('zanbato', 'Súng Trường Chống Cơ Giới Boys .55', 'SWORD', 9, 85, 8, 1, 2, 2, 1180, 'IN_MAP_ARMORY', 'Đạn xuyên động năng chuyên bắn hạ xe thiết giáp trinh sát & cơ giới (×2 Cơ Giới).', { effectiveVsCavalry: true }),
  wo_dao: w('wo_dao', 'Shotgun Chiến Hào M1897', 'SWORD', 10, 90, 35, 1, 1, 2, 1380, 'IN_MAP_ARMORY', 'Súng săn nạp bơm nòng ngắn càn quét giao thông hào (+35% Chí Mạng).'),
  killing_edge: w('killing_edge', 'Tiểu Liên Giảm Thanh Sten Mk IIS', 'SWORD', 10, 88, 32, 1, 1, 2, 1420, 'IN_MAP_ARMORY', 'Tiểu liên đặc nhiệm giảm thanh chuyên phục kích ban đêm (+32% CM).'),
  lancereaver_blade: w('lancereaver_blade', 'Súng Trường Bán Tự Động SVT-40', 'SWORD', 10, 92, 12, 1, 2, 2, 1320, 'IN_MAP_ARMORY', 'Đạn xuyên thép tốc độ cao bỏ qua 20% Giáp mục tiêu.', { ignoreDefenseRatio: 0.2 }),
  silver_sword: w('silver_sword', 'Súng Trường M1 Garand', 'SWORD', 13, 92, 10, 1, 2, 2, 1650, 'CAMP', 'Súng trường bán tự động chủ lực Thế Chiến II, tầm bắn 1–2 ô ổn định.'),
  wind_edge: w('wind_edge', 'Carbine Nhảy Dù M1A1', 'SWORD', 9, 90, 10, 1, 2, 2, 1520, 'IN_MAP_ARMORY', 'Súng carbine báng gấp của lính dù Đồng Minh, cơ động tầm 1–2 ô.', { element: 'WIND' }),
  levin_sword: w('levin_sword', 'Súng Phóng Lựu Đơn 40mm / Schiessbecher', 'SWORD', 11, 86, 12, 1, 2, 2, 1950, 'IN_MAP_VENDOR', 'Súng phóng lựu đơn bắn đạn nổ phá công sự tầm 1–2 ô (tính theo MAG).', { isMagic: true, element: 'THUNDER' }),
  flame_brand: w('flame_brand', 'Súng Trường Đạn Cháy Phốt-Pho', 'SWORD', 12, 86, 10, 1, 2, 2, 2050, 'IN_MAP_VENDOR', 'Đạn vạch đường nhiệt nhôm đốt cháy công sự đối phương tầm 1–2 ô.', { isMagic: true, element: 'FIRE' }),
  frost_brand: w('frost_brand', 'Tiểu Liên Sơn Cước Suomi KP-31', 'SWORD', 12, 92, 16, 1, 2, 3, 2450, 'IN_MAP_VENDOR', 'Hoạt động bền bỉ giữa bão tuyết Bắc Âu, xuyên 20% công sự.', { isMagic: true, element: 'ICE', ignoreDefenseRatio: 0.2 }),
  runesword: w('runesword', 'Tiểu Liên Chiến Thuật Tiếp Tế Đặc Nhiệm', 'SWORD', 12, 88, 12, 1, 2, 3, 2750, 'IN_MAP_VENDOR', 'Vũ khí đặc nhiệm thu hồi tiếp tế chiến trường, hồi 40% sát thương thành HP.', { isMagic: true, element: 'DARK', drainRatio: 0.4 }),
  brave_sword: w('brave_sword', 'Tiểu Liên Trống Đạn PPSh-41', 'SWORD', 9, 86, 10, 1, 1, 3, 2850, 'IN_MAP_ARMORY', 'Tốc độ nhả đạn 900 viên/phút — bắn 2 loạt liên hoàn khi chủ động xung phong!', { brave: true }),
  adamant_blade: w('adamant_blade', 'Tiểu Liên Thompson M1928', 'SWORD', 16, 88, 14, 1, 2, 3, 2600, 'CAMP', 'Khẩu Tommy Gun .45 ACP huyền thoại của sĩ quan xung kích Thế Chiến II.'),
  sol_katti: w('sol_katti', 'Súng Trường Lính Dù FG-42', 'SWORD', 15, 95, 38, 1, 2, 3, 3400, 'IN_MAP_ARMORY', 'Súng trường tự động tinh xảo bậc nhất, xuyên 25% giáp & +38% Chí Mạng.', { element: 'WIND', ignoreDefenseRatio: 0.25 }),
  valoria_blade: w('valoria_blade', 'Súng Trường Chỉ Huy M1941 Johnson', 'SWORD', 16, 95, 22, 1, 2, 3, 3800, 'EXOTIC', 'Vũ khí danh dự của Bộ Tư Lệnh Đồng Minh, xuyên giáp thiết giáp (×2).', { element: 'LIGHT', effectiveVsArmor: true }),
  durandal_flame: w('durandal_flame', 'Súng Trường Tấn Công StG-44', 'SWORD', 19, 92, 24, 1, 2, 4, 5200, 'IN_MAP_ARMORY', 'Khẩu súng trường tấn công hiện đại đầu tiên Bậc IV, xuyên 30% DEF & khắc chế Giáp.', { element: 'FIRE', effectiveVsArmor: true, ignoreDefenseRatio: 0.3 }),
  alondite_edge: w('alondite_edge', 'Súng Máy Cá Nhân BAR M1918A2', 'SWORD', 18, 94, 22, 1, 2, 4, 5600, 'IN_MAP_ARMORY', 'Hỏa lực áp chế tự động Bậc IV tầm 1–2 ô, đục thủng mọi chiến tuyến.', { element: 'LIGHT' }),
  muramasa_crimson: w('muramasa_crimson', 'Tiểu Liên Đặc Nhiệm Đêm Vampyr', 'SWORD', 17, 94, 48, 1, 2, 4, 5800, 'IN_MAP_ARMORY', 'Gắn kính ngắm hồng ngoại thế hệ đầu, 48% Chí Mạng & hồi 35% HP.', { element: 'DARK', drainRatio: 0.35 }),
  aether_sovereign_blade: w('aether_sovereign_blade', 'Súng Xung Kích Nguyên Mẫu T-45', 'SWORD', 20, 96, 30, 1, 2, 4, 6800, 'EXOTIC', 'Tuyệt tác quân giới 1945: bắn 2 loạt liên thanh tầm 1–2 ô và hồi 30% HP.', { isMagic: true, element: 'LIGHT', brave: true, drainRatio: 0.3 }),

  // =========================================================================
  // LANCE -> PHÁO XUYÊN GIÁP, TÊN LỬA CHỐNG TĂNG & NGƯ LÔI — 22 weapons
  // =========================================================================
  bronze_lance: w('bronze_lance', 'Pháo Cơ Giới 37mm Puteaux', 'LANCE', 5, 96, 0, 1, 1, 1, 300, 'CAMP', 'Pháo nòng ngắn Thế Chiến I lắp trên xe bọc thép & tăng nhẹ FT-17.'),
  iron_lance: w('iron_lance', 'Pháo Tăng 57mm Hotchkiss', 'LANCE', 7, 88, 5, 1, 1, 1, 480, 'CAMP', 'Pháo cận chiến của xe tăng Mark V & thiết giáp tiên phong Thế Chiến I.'),
  slim_lance: w('slim_lance', 'Súng Máy Đồng Trục Cơ Giới', 'LANCE', 6, 94, 12, 1, 2, 1, 560, 'CAMP', 'Hỏa lực cơ động lắp trên xe trinh sát và tiêm kích tuần tiễu.'),
  steel_lance: w('steel_lance', 'Pháo Chống Tăng 45mm M1937', 'LANCE', 10, 84, 6, 1, 2, 1, 820, 'CAMP', 'Pháo xuyên giáp tốc độ sơ tốc cao, áp chế đội hình bộ binh và xe nhẹ.'),
  javelin: w('javelin', 'Lựu Đạn Chống Tăng RPG-40', 'LANCE', 8, 80, 5, 1, 2, 1, 880, 'IN_MAP_ARMORY', 'Đạn nổ lõm ném tay hoặc phóng tầm 1–2 ô vào sườn xe tăng.'),
  ridersbane: w('ridersbane', 'Pháo Chống Cơ Giới Pak 38 50mm', 'LANCE', 10, 84, 6, 1, 2, 2, 1200, 'IN_MAP_ARMORY', 'Chuyên bắn chặn đoàn xe thiết giáp cơ giới tốc độ cao (×2 Cơ Giới).', { effectiveVsCavalry: true }),
  heavy_spear: w('heavy_spear', 'Súng Phóng Tên Lửa Bazooka M1', 'LANCE', 10, 82, 6, 1, 2, 2, 1240, 'IN_MAP_ARMORY', 'Đầu đạn lõm HEAT xuyên thủng giáp xe tăng hạng nặng (×2 Thiết Giáp).', { effectiveVsArmor: true }),
  killer_lance: w('killer_lance', 'Pháo Xuyên Giáp Lõi Vonfram 57mm', 'LANCE', 11, 88, 32, 1, 2, 2, 1460, 'IN_MAP_ARMORY', 'Đạn xuyên dưới cỡ APCR nhắm thẳng khoang đạn xe địch (+32% CM).'),
  short_spear: w('short_spear', 'Súng Chống Tăng PIAT', 'LANCE', 10, 84, 8, 1, 2, 2, 1580, 'IN_MAP_ARMORY', 'Súng phóng đạn lõm lò xo không khói lộ vị trí, tầm bắn 1–2 ô.'),
  silver_lance: w('silver_lance', 'Pháo Tăng 75mm M3 Sherman', 'LANCE', 14, 88, 8, 1, 2, 2, 1720, 'CAMP', 'Pháo chính tiêu chuẩn của thiết giáp trung tâm Thế Chiến II.'),
  flame_lance: w('flame_lance', 'Ngư Lôi Nhiệt Hơi Nước 533mm', 'LANCE', 12, 84, 10, 1, 2, 2, 2100, 'IN_MAP_VENDOR', 'Ngư lôi hạng nặng phóng từ tàu khu trục & tàu ngầm, phá hủy mạn tàu.', { isMagic: true, element: 'FIRE' }),
  glacier_pike: w('glacier_pike', 'Ngư Lôi Từ Trường Bắc Đại Tây Dương', 'LANCE', 13, 88, 14, 1, 2, 3, 2550, 'IN_MAP_VENDOR', 'Kích nổ dưới sống tàu chiến địch, xuyên 20% vách ngăn chống ngầm.', { isMagic: true, element: 'ICE', ignoreDefenseRatio: 0.2 }),
  spear_storm: w('spear_storm', 'Súng Phóng Đạn Lõm Panzerfaust 60', 'LANCE', 13, 86, 14, 1, 2, 3, 2650, 'IN_MAP_ARMORY', 'Đầu đạn xuyên 200mm thép cán đồng nhất tầm 1–2 ô.', { element: 'THUNDER', effectiveVsArmor: true }),
  brave_lance: w('brave_lance', 'Ống Phóng Ngư Lôi Kép 533mm', 'LANCE', 10, 84, 10, 1, 2, 3, 2950, 'IN_MAP_ARMORY', 'Phóng 2 quả ngư lôi / đạn xuyên liên tiếp khi chủ động công kích!', { brave: true }),
  mithril_halberd: w('mithril_halberd', 'Pháo Tăng 85mm ZiS-S-53 (T-34/85)', 'LANCE', 16, 88, 14, 1, 2, 3, 2700, 'CAMP', 'Pháo tăng 85mm lừng danh nghiền nát thiết giáp đối phương.'),
  moon_halberd: w('moon_halberd', 'Pháo Diệt Tăng 17-Pounder Sabot', 'LANCE', 15, 88, 22, 1, 2, 3, 3300, 'IN_MAP_ARMORY', 'Đạn guốc tách vỏ APDS xuyên thẳng 40% Giáp xe tăng hạng nặng.', { ignoreDefenseRatio: 0.4 }),
  dragon_spear: w('dragon_spear', 'Pháo Đa Dụng 88mm KwK 36', 'LANCE', 17, 90, 18, 1, 2, 3, 3900, 'EXOTIC', 'Khẩu pháo 88mm huyền thoại — khắc chế cả Cơ Giới lẫn Không Quân (×2).', { effectiveVsCavalry: true, effectiveVsFlying: true }),
  wishblade: w('wishblade', 'Pháo Tăng Dài 88mm KwK 43 L/71', 'LANCE', 19, 92, 24, 1, 2, 4, 5400, 'IN_MAP_ARMORY', 'Pháo diệt tăng Bậc IV tầm 1–2 ô, xuyên 25% giáp ở mọi cự ly.', { element: 'LIGHT', ignoreDefenseRatio: 0.25 }),
  gradivus_imperial: w('gradivus_imperial', 'Hải Pháo Xuyên Giáp 380mm Hạm Đội', 'LANCE', 19, 94, 20, 1, 3, 4, 5800, 'IN_MAP_ARMORY', 'Tháp pháo chính thiết giáp hạm tầm 1–3 ô, tái nạp hậu cần hồi 35% HP.', { element: 'LIGHT', drainRatio: 0.35 }),
  gungnir_sky: w('gungnir_sky', 'Tên Lửa Chống Tăng Panzerschreck RPzB 54', 'LANCE', 20, 98, 26, 1, 2, 4, 6200, 'IN_MAP_ARMORY', 'Khắc chế hủy diệt cả Thiết Giáp Hạng Nặng và Trực Thăng/Máy Bay tầm thấp.', { element: 'THUNDER', effectiveVsFlying: true, effectiveVsArmor: true }),
  vampire_pike: w('vampire_pike', 'Ngư Lôi Dẫn Đường Âm Thanh T5 Zaunkönig', 'LANCE', 17, 90, 28, 1, 2, 4, 5100, 'IN_MAP_ARMORY', 'Ngư lôi tự dẫn săn tàu chiến của U-Boat Bậc IV, hồi phục 50% độ bền.', { element: 'DARK', drainRatio: 0.5 }),
  celestial_trident: w('celestial_trident', 'Tháp Hải Pháo Ba Nòng 406mm Mk 7', 'LANCE', 17, 92, 22, 1, 3, 4, 6600, 'EXOTIC', 'Loạt đạn xuyên giáp 16-inch song kích tầm 1–3 ô của Siêu Thiết Giáp Hạm!', { element: 'THUNDER', brave: true }),

  // =========================================================================
  // AXE -> CÔNG PHÁ, SÚNG MÁY HẠNG NẶNG & HỎA LỰC NẶNG — 22 weapons
  // =========================================================================
  bronze_axe: w('bronze_axe', 'Lựu Đạn Chày M1915', 'AXE', 6, 90, 0, 1, 1, 1, 310, 'CAMP', 'Lựu đạn cán gỗ công phá giao thông hào và ụ súng máy.'),
  iron_axe: w('iron_axe', 'Súng Máy Hạng Nhẹ Lewis .303', 'AXE', 9, 80, 5, 1, 2, 1, 490, 'CAMP', 'Súng máy đĩa tròn làm mát bằng không khí, hỏa lực áp chế mạnh.'),
  hatchet_scout: w('hatchet_scout', 'Bó Lựu Đạn Xung Kích Công Binh', 'AXE', 7, 88, 8, 1, 2, 1, 790, 'CAMP', 'Gói thuốc nổ ném xa 1–2 ô phá hàng rào kẽm gai và lô cốt.'),
  steel_axe: w('steel_axe', 'Súng Máy Hạng Nặng Vickers', 'AXE', 12, 78, 6, 1, 2, 1, 860, 'CAMP', 'Súng máy làm mát bằng nước bắn liên tục suốt nhiều giờ liền.'),
  hand_axe: w('hand_axe', 'Súng Phóng Lựu Đơn Chiến Hào VB', 'AXE', 8, 78, 5, 1, 2, 1, 890, 'IN_MAP_ARMORY', 'Súng phóng lựu đơn bắn đạn nổ mảnh tầm 1–2 ô vượt qua bờ chiến hào.'),
  hammer_axe: w('hammer_axe', 'Bộc Phá Phá Boong-ke 10kg', 'AXE', 12, 76, 6, 1, 1, 2, 1250, 'IN_MAP_ARMORY', 'Khối thuốc nổ TNT chuyên thổi bay xe tăng và lô cốt thép (×2 Thiết Giáp).', { effectiveVsArmor: true }),
  halberd_axe: w('halberd_axe', 'Mìn Chống Cơ Giới Tellermine', 'AXE', 11, 78, 8, 1, 1, 2, 1280, 'IN_MAP_ARMORY', 'Đứt xích và phá hủy hoàn toàn xe cơ giới đối phương (×2 Cơ Giới).', { effectiveVsCavalry: true }),
  killer_axe: w('killer_axe', 'Súng Máy Siêu Tốc MG-34', 'AXE', 12, 82, 35, 1, 2, 2, 1520, 'IN_MAP_ARMORY', 'Đường đạn sắc lẹm cắt đôi đội hình xung phong (+35% Chí Mạng).'),
  short_axe: w('short_axe', 'Súng Phun Lửa Chiến Hào Wechselapparat', 'AXE', 11, 82, 10, 1, 2, 2, 1650, 'IN_MAP_ARMORY', 'Luồng lửa áp suất cao quét sạch công sự tầm 1–2 ô.'),
  silver_axe: w('silver_axe', 'Đại Liên Browning M2 .50 Cal', 'AXE', 16, 82, 8, 1, 2, 2, 1780, 'CAMP', 'Đại liên 12.7mm uy lực khủng khiếp lắp trên xe tăng, tàu chiến và trực thăng.'),
  bolt_axe: w('bolt_axe', 'Bom Chìm & Ngư Lôi Săn Ngầm Hedgehog', 'AXE', 14, 82, 12, 1, 2, 2, 2200, 'IN_MAP_VENDOR', 'Dàn cối săn ngầm phóng 24 quả bom chìm tầm 1–2 ô diệt tàu ngầm & công sự.', { isMagic: true, element: 'THUNDER' }),
  magma_cleaver: w('magma_cleaver', 'Súng Phun Lửa Dã Chiến M2-2', 'AXE', 15, 82, 15, 1, 2, 3, 2650, 'IN_MAP_VENDOR', 'Phun hỗn hợp Napalm đặc tầm 1–2 ô, xuyên 20% công sự ngầm.', { isMagic: true, element: 'FIRE', ignoreDefenseRatio: 0.2 }),
  tomahawk: w('tomahawk', 'Súng Phóng Lựu Ổ Xoay 6 Viên MGL-40', 'AXE', 14, 82, 16, 1, 2, 3, 2750, 'IN_MAP_ARMORY', 'Súng phóng lựu ổ xoay bắn liên tiếp 6 quả lựu đạn 40mm phá công sự tầm 1–2 ô.'),
  brave_axe: w('brave_axe', 'Súng Máy Lưỡi Cưa MG-42', 'AXE', 11, 80, 12, 1, 2, 3, 3050, 'IN_MAP_ARMORY', '1.200 phát/phút — nhả 2 loạt đạn hủy diệt liên hoàn khi chủ động khai hỏa!', { brave: true }),
  obsidian_greataxe: w('obsidian_greataxe', 'Pháo Nặng Xe Tăng 122mm D-25T (IS-2)', 'AXE', 18, 82, 14, 1, 2, 3, 2800, 'CAMP', 'Khẩu đại pháo 122mm của xe tăng hạng nặng IS-2 — một phát nát tháp pháo.'),
  crusher_maul: w('crusher_maul', 'Pháo Công Phá Tự Hành 152mm ML-20S', 'AXE', 16, 84, 18, 1, 2, 3, 3450, 'IN_MAP_ARMORY', 'Sát thủ diệt tăng hạng nặng ISU-152, xuyên 35% Giáp & ×2 Thiết Giáp.', { effectiveVsArmor: true, ignoreDefenseRatio: 0.35 }),
  dragon_axe: w('dragon_axe', 'Tháp Đại Liên Bốn Nòng M45 Quadmount', 'AXE', 18, 84, 22, 1, 2, 3, 3850, 'EXOTIC', 'Bốn khẩu .50 Cal đồng bộ — xé toạc cả Máy Bay lẫn Thiết Giáp Nhẹ!', { effectiveVsArmor: true, effectiveVsFlying: true }),
  crimson_halberd: w('crimson_halberd', 'Pháo Tự Hành Hạng Nặng 128mm Pak 44', 'AXE', 18, 86, 20, 1, 2, 3, 4100, 'EXOTIC', 'Vũ khí tối mật của Tập Đoàn Thiết Giáp Thống Chế, tầm bắn 1–2 ô.', { element: 'DARK', effectiveVsArmor: true }),
  armads_thunder: w('armads_thunder', 'Cối Phản Lực Công Thành 380mm Sturmtiger', 'AXE', 21, 88, 25, 1, 2, 4, 5500, 'IN_MAP_ARMORY', 'Đạn rocket 380mm Bậc IV san phẳng cả tòa nhà, xuyên 30% DEF & ×2 Giáp.', { element: 'THUNDER', effectiveVsArmor: true, ignoreDefenseRatio: 0.3 }),
  urvan_eclipse: w('urvan_eclipse', 'Xe Tăng Phun Lửa Crocodile', 'AXE', 20, 90, 30, 1, 2, 4, 5900, 'IN_MAP_ARMORY', 'Vòi phun lửa bọc thép tầm 1–2 ô, thu hồi nhiên liệu hồi 30% HP.', { element: 'DARK', drainRatio: 0.3 }),
  basilikos_fury: w('basilikos_fury', 'Cối Công Thành Khổng Lồ 600mm Karl-Gerät', 'AXE', 22, 86, 36, 1, 2, 4, 6100, 'IN_MAP_ARMORY', 'Đầu đạn 2 tấn xuyên bê tông pháo đài Bậc IV, 36% Chí Mạng.'),
  hels_wrath: w('hels_wrath', 'Bom Chấn Động Grand Slam 10 Tấn', 'AXE', 19, 88, 42, 1, 2, 4, 5700, 'IN_MAP_ARMORY', 'Tạo động đất nhân tạo sụp đổ hầm ngầm kiên cố, 42% CM & hồi 45% HP.', { element: 'DARK', drainRatio: 0.45 }),
  titan_worldbreaker: w('titan_worldbreaker', 'Hải Pháo Siêu Hạng 460mm Thiết Giáp Hạm', 'AXE', 19, 88, 24, 1, 3, 4, 6800, 'EXOTIC', 'Cực phẩm Bậc IV bắn loạt đạn 18.1-inch song kích tầm 1–3 ô hủy diệt!', { brave: true, effectiveVsArmor: true }),

  // =========================================================================
  // BOW -> SÚNG BẮN TỈA & PHÁO PHÒNG KHÔNG (SNIPER & ANTI-AIR FLAK) — 20 weapons
  // =========================================================================
  training_bow: w('training_bow', 'Súng Trường Ngắm Cơ Bản SMLE', 'BOW', 5, 98, 5, 2, 2, 1, 290, 'CAMP', 'Súng trường ngắm bắn tầm 2 ô, khắc chế Máy Bay bay thấp (×2).', { effectiveVsFlying: true }),
  hunting_bow: w('hunting_bow', 'Súng Bắn Tỉa Springfield M1903', 'BOW', 7, 92, 12, 2, 2, 1, 480, 'CAMP', 'Kính ngắm quang học Thế Chiến I, tiêu diệt xạ thủ & phi công địch (×2 Không Quân).', { effectiveVsFlying: true }),
  short_bow: w('short_bow', 'Súng Máy Phòng Không Cơ Động MG-08/15', 'BOW', 6, 92, 14, 1, 2, 1, 860, 'IN_MAP_ARMORY', 'Bắn được cả cận chiến lẫn tầm xa (1–2 ô), đặc trị máy bay cánh kép!', { effectiveVsFlying: true }),
  steel_bow: w('steel_bow', 'Súng Bắn Tỉa Mosin-Nagant PU', 'BOW', 10, 88, 12, 2, 2, 1, 820, 'CAMP', 'Khẩu súng bắn tỉa huyền thoại mặt trận phía Đông, bền bỉ và chính xác.', { effectiveVsFlying: true }),
  longbow: w('longbow', 'Súng Bắn Tỉa Tầm Xa Kar98k Zielfernrohr', 'BOW', 9, 84, 14, 2, 3, 2, 1380, 'IN_MAP_ARMORY', 'Kính ngắm 6x bắn tỉa siêu xa tầm 2–3 ô ngoài tầm bắn trả của bộ binh!', { effectiveVsFlying: true }),
  killer_bow: w('killer_bow', 'Súng Bắn Tỉa Hồng Tâm Lee-Enfield No.4(T)', 'BOW', 10, 92, 35, 2, 2, 2, 1480, 'IN_MAP_ARMORY', 'Tinh chỉnh nòng thủ công với tỷ lệ bắn trúng yếu điểm +35% Chí Mạng.', { effectiveVsFlying: true }),
  armor_crossbow: w('armor_crossbow', 'Pháo Phòng Không Tự Động 20mm Oerlikon', 'BOW', 11, 88, 12, 1, 2, 2, 1620, 'IN_MAP_ARMORY', 'Pháo 20mm lắp trên tàu chiến & xe cơ giới — khắc chế cả Không Quân lẫn Thiết Giáp!', { effectiveVsFlying: true, effectiveVsArmor: true }),
  wind_bow: w('wind_bow', 'Pháo Phòng Không 37mm M1A2', 'BOW', 12, 92, 18, 2, 3, 2, 1920, 'IN_MAP_ARMORY', 'Đạn nổ mảnh định tầm 2–3 ô dựng lưới lửa khóa chặt bầu trời.', { element: 'WIND', effectiveVsFlying: true }),
  silver_bow: w('silver_bow', 'Pháo Phòng Không Liên Thanh Bofors 40mm', 'BOW', 14, 92, 14, 2, 3, 2, 1750, 'CAMP', 'Khẩu pháo phòng không xuất sắc nhất Thế Chiến II trên cả đất liền và hạm đội.', { effectiveVsFlying: true }),
  shining_bow: w('shining_bow', 'Đèn Chiếu Phòng Không & Đạn Vạch Đường', 'BOW', 12, 94, 15, 1, 2, 2, 2150, 'IN_MAP_VENDOR', 'Khóa mục tiêu bằng chùm sáng cao áp tầm 1–2 ô, tính theo Kỹ Thuật (MAG).', { isMagic: true, element: 'LIGHT', effectiveVsFlying: true }),
  frost_bow: w('frost_bow', 'Súng Bắn Tỉa Bão Tuyết“Cái Chết Trắng”', 'BOW', 13, 96, 22, 2, 3, 3, 2650, 'IN_MAP_VENDOR', 'Ngụy trang tuyết trắng tầm 2–3 ô, xuyên 20% công sự.', { isMagic: true, element: 'ICE', effectiveVsFlying: true, ignoreDefenseRatio: 0.2 }),
  brave_bow: w('brave_bow', 'Pháo Phòng Không Bốn Nòng 20mm Flakvierling', 'BOW', 9, 88, 12, 2, 2, 3, 2980, 'IN_MAP_ARMORY', 'Bốn nòng 20mm khai hỏa kép (×2 loạt đạn) quét sạch phi đội địch!', { brave: true, effectiveVsFlying: true }),
  mithril_bow: w('mithril_bow', 'Súng Bắn Tỉa Bán Tự Động Gewehr 43 ZF4', 'BOW', 16, 92, 18, 2, 3, 3, 2720, 'CAMP', 'Súng bắn tỉa bán tự động tốc độ cao tầm 2–3 ô.', { effectiveVsFlying: true }),
  deadeye_longbow: w('deadeye_longbow', 'Súng Trường Bắn Tỉa Siêu Xa .50 BMG', 'BOW', 15, 94, 28, 2, 3, 3, 3350, 'IN_MAP_ARMORY', 'Đạn 12.7mm kính ngắm Unertl 8x tầm 2–3 ô, xuyên 30% Giáp.', { effectiveVsFlying: true, ignoreDefenseRatio: 0.3 }),
  storm_ballista: w('storm_ballista', 'Pháo Phòng Không - Chống Tăng Flak 36 88mm', 'BOW', 16, 90, 22, 1, 3, 3, 3680, 'IN_MAP_ARMORY', 'Hạ nòng bắn tăng, nâng nòng bắn máy bay tầm 1–3 ô (×2 Không Quân & Cơ Giới).', { element: 'THUNDER', effectiveVsFlying: true, effectiveVsCavalry: true }),
  parthia_sun: w('parthia_sun', 'Pháo Phòng Không Hạng Nặng 90mm M1', 'BOW', 19, 96, 26, 2, 3, 4, 5400, 'IN_MAP_ARMORY', 'Đầu đạn ngòi nổ vô tuyến VT Bậc IV tầm 2–3 ô, xuyên 25% DEF.', { element: 'FIRE', effectiveVsFlying: true, ignoreDefenseRatio: 0.25 }),
  nidhogg_fang: w('nidhogg_fang', 'Tổ Hợp Phòng Không Tự Hành Ostwind 37mm', 'BOW', 19, 94, 34, 1, 2, 4, 5700, 'IN_MAP_ARMORY', 'Tháp pháo bọc thép tự hành tầm 1–2 ô, tự động tiếp đạn hồi 35% HP.', { element: 'DARK', effectiveVsFlying: true, drainRatio: 0.35 }),
  double_bow: w('double_bow', 'Hải Pháo Phòng Không Kép 127mm Mk 38', 'BOW', 16, 94, 24, 1, 3, 4, 6200, 'IN_MAP_ARMORY', 'Tháp pháo kép ngòi nổ cận đích VT tầm 1–3 ô bắn Song Kích (×2)!', { brave: true, effectiveVsFlying: true }),
  starfall_arc: w('starfall_arc', 'Pháo Cao Xạ Siêu Tầm 128mm Flakzwilling 40', 'BOW', 18, 98, 40, 2, 3, 4, 6400, 'IN_MAP_ARMORY', 'Đỉnh cao phòng không Bậc IV tầm 2–3 ô, 40% Chí Mạng & xuyên 35% DEF.', { element: 'LIGHT', effectiveVsFlying: true, ignoreDefenseRatio: 0.35 }),
  zephyr_sovereign_bow: w('zephyr_sovereign_bow', 'Hệ Thống Pháo Phòng Không Dẫn Đường Radar SCR-584', 'BOW', 20, 98, 30, 1, 3, 4, 6900, 'EXOTIC', 'Điều khiển hỏa lực tự động bằng Radar tầm 1–3 ô, Song Kích hạ mọi Máy Bay & Cơ Giới.', { element: 'WIND', effectiveVsFlying: true, effectiveVsCavalry: true, brave: true }),

  // =========================================================================
  // TOME -> PHÁO BINH, PHÁO PHẢN LỰC, KHÔNG KÍCH & HẢI PHÁO (ARTILLERY & AIRSTRIKE) — 26 weapons
  // =========================================================================
  // FIRE (Pháo Nòng Ngắn / Nòng Dài / Phản Lực Phóng Loạt & Nhiệt Áp)
  fire_tome: w('fire_tome', 'Pháo Nòng Ngắn — Cối Chiến Hào 81mm', 'TOME', 7, 92, 5, 1, 2, 1, 480, 'CAMP', 'Pháo nòng ngắn bắn cầu vồng chính xác vào chiến hào và boong-ke.', { isMagic: true, element: 'FIRE' }),
  elfire_tome: w('elfire_tome', 'Pháo Dã Chiến 75mm M1897', 'TOME', 11, 88, 10, 1, 2, 2, 1280, 'CAMP', 'Khẩu pháo 75mm tốc xạ trứ danh với cơ cấu giật thủy lực.', { isMagic: true, element: 'FIRE' }),
  arcfire_tome: w('arcfire_tome', 'Lựu Pháo Hạng Trung 105mm M2A1', 'TOME', 14, 88, 16, 1, 3, 3, 2450, 'IN_MAP_VENDOR', 'Trụ cột pháo binh tầm 1–3 ô, đạn nổ phá hủy Thiết Giáp (×2).', { isMagic: true, element: 'FIRE', effectiveVsArmor: true }),
  bolganone: w('bolganone', 'Pháo Nòng Dài 155mm Long Tom', 'TOME', 17, 86, 18, 1, 3, 3, 3150, 'IN_MAP_VENDOR', 'Pháo nòng dài tầm xa 155mm dội bão lửa thiêu rụi toàn bộ tuyến phòng thủ.', { isMagic: true, element: 'FIRE' }),
  forblaze_mythic: w('forblaze_mythic', 'Pháo Phản Lực Nhiệt Áp & Katyusha BM-13', 'TOME', 20, 94, 28, 1, 3, 4, 5800, 'IN_MAP_VENDOR', 'Pháo phản lực phóng loạt & đầu đạn nhiệt áp tầm 1–3 ô, xuyên 30% Công Sự!', { isMagic: true, element: 'FIRE', ignoreDefenseRatio: 0.3 }),

  // THUNDER (Tên Lửa Dẫn Đường / Không Đối Đất / Pháo Phản Lực)
  thunder_tome: w('thunder_tome', 'Súng Máy Không Chiến Đồng Bộ Vickers', 'TOME', 9, 86, 18, 1, 2, 1, 620, 'CAMP', 'Súng máy bắn xuyên cánh quạt của máy bay cánh bằng Thế Chiến I.', { isMagic: true, element: 'THUNDER' }),
  elthunder_tome: w('elthunder_tome', 'Pháo Hàng Không 20mm Hispano Mk II', 'TOME', 12, 88, 26, 1, 2, 2, 1480, 'IN_MAP_VENDOR', 'Pháo cánh tiêm kích & tiêm kích bom bắn nổ tung phi cơ địch (×2 Không Quân).', { isMagic: true, element: 'THUNDER', effectiveVsFlying: true }),
  thoron_tome: w('thoron_tome', 'Tên Lửa Dẫn Đường Không Đối Đất / ATGM', 'TOME', 14, 88, 28, 1, 3, 3, 2950, 'IN_MAP_VENDOR', 'Tên lửa dẫn đường chính xác phóng từ tiêm kích bom & trực thăng vũ trang tầm 1–3 ô!', { isMagic: true, element: 'THUNDER' }),
  mjolnir_mythic: w('mjolnir_mythic', 'Tổ Hợp Tên Lửa Dẫn Đường & Nebelwerfer 300mm', 'TOME', 19, 92, 42, 1, 3, 4, 6100, 'IN_MAP_VENDOR', 'Dàn phóng rocket & tên lửa dẫn đường đa mục tiêu tầm 1–3 ô, chí mạng hủy diệt 42%.', { isMagic: true, element: 'THUNDER', effectiveVsFlying: true }),

  // WIND (Không Kích / Tiêm Kích Bom / Máy Bay Ném Bom Chiến Lược)
  wind_tome: w('wind_tome', 'Bom Cánh Bằng Phi Đội Trinh Sát', 'TOME', 7, 98, 12, 1, 2, 1, 560, 'CAMP', 'Yểm trợ ném bom chính xác từ máy bay cánh bằng, khắc chế Không Quân (×2).', { isMagic: true, element: 'WIND', effectiveVsFlying: true }),
  elwind_tome: w('elwind_tome', 'Bom Bổ Nhào Còi Hú Ju-87 Stuka', 'TOME', 11, 96, 16, 1, 2, 2, 1420, 'IN_MAP_VENDOR', 'Lao thẳng 80 độ cắt bom chính xác tuyệt đối vào mục tiêu.', { isMagic: true, element: 'WIND', effectiveVsFlying: true }),
  excalibur_tome: w('excalibur_tome', 'Tiêm Kích Bom & Cường Kích IL-2 / P-47', 'TOME', 15, 98, 28, 1, 2, 3, 3250, 'IN_MAP_VENDOR', 'Tiêm kích bom mang pháo 23mm, rocket và bom chùm không trượt phát nào.', { isMagic: true, element: 'WIND', effectiveVsFlying: true }),
  forseti_mythic: w('forseti_mythic', 'Máy Bay Ném Bom Chiến Lược B-17 / B-29', 'TOME', 18, 100, 32, 1, 3, 4, 6200, 'IN_MAP_VENDOR', 'Thảm bom chiến lược Bậc IV tầm 1–3 ô Song Kích chính xác 100%!', { isMagic: true, element: 'WIND', effectiveVsFlying: true, brave: true }),

  // ICE (Pháo Sơn Cước / Trực Thăng Săn Ngầm / Hải Pháo)
  ice_tome: w('ice_tome', 'Pháo Nòng Ngắn Sơn Cước 75mm GebG 36', 'TOME', 9, 92, 14, 1, 2, 1, 680, 'CAMP', 'Sơn pháo tháo lắp cơ động trên vách núi Alps và rừng tuyết.', { isMagic: true, element: 'ICE' }),
  blizzard_tome: w('blizzard_tome', 'Pháo Cối Màn Khói Đông Giá 120mm', 'TOME', 12, 86, 18, 1, 3, 2, 1850, 'IN_MAP_VENDOR', 'Cối hạng nặng 120mm tầm 1–3 ô làm tê liệt tầm nhìn đối phương.', { isMagic: true, element: 'ICE' }),
  fimbulvetr_tome: w('fimbulvetr_tome', 'Hải Pháo Tuần Dương Hạm 203mm', 'TOME', 16, 92, 24, 1, 3, 3, 3100, 'IN_MAP_VENDOR', 'Loạt hải pháo 8-inch xuyên 25% công sự từ tuần dương hạm hạng nặng.', { isMagic: true, element: 'ICE', ignoreDefenseRatio: 0.25 }),
  glacies_mythic: w('glacies_mythic', 'Phi Đội Tàu Sân Bay & Trực Thăng Săn Ngầm', 'TOME', 19, 95, 30, 1, 3, 4, 5950, 'IN_MAP_VENDOR', 'Đòn phối hợp máy bay ném bom, phóng lôi & trực thăng săn ngầm tầm 1–3 ô, xuyên 40% RES!', { isMagic: true, element: 'ICE', ignoreDefenseRatio: 0.4 }),

  // LIGHT (Pháo Chiếu Sáng / Tên Lửa Phòng Không / Hải Pháo Hạm Đội)
  light_shine: w('light_shine', 'Đạn Pháo Chiếu Sáng Tọa Độ 75mm', 'TOME', 8, 98, 15, 1, 2, 1, 640, 'CAMP', 'Thắp sáng mục tiêu ban đêm, tăng độ chính xác gần như tuyệt đối.', { isMagic: true, element: 'LIGHT' }),
  divine_tome: w('divine_tome', 'Pháo Kích Chỉ Thị Vô Tuyến Tiền Phương', 'TOME', 11, 96, 20, 1, 2, 2, 1450, 'IN_MAP_VENDOR', 'Trinh sát điện đài gọi pháo dập trúng nóc hầm địch.', { isMagic: true, element: 'LIGHT' }),
  aura_tome: w('aura_tome', 'Dàn Pháo Phản Lực Phóng Loạt Calliope', 'TOME', 15, 94, 24, 1, 2, 3, 2980, 'IN_MAP_VENDOR', '60 ống phóng rocket lắp trên tháp pháo Sherman, hồi 25% HP tiếp vận.', { isMagic: true, element: 'LIGHT', drainRatio: 0.25 }),
  astral_tome: w('astral_tome', 'Tên Lửa Phòng Không & Dẫn Đường Radar', 'TOME', 16, 94, 24, 1, 3, 3, 3600, 'IN_MAP_VENDOR', 'Tên lửa dẫn đường radar thời gian thực tầm 1–3 ô, xuyên 30% công sự.', { isMagic: true, element: 'LIGHT', ignoreDefenseRatio: 0.3 }),
  aureola_mythic: w('aureola_mythic', 'Hải Pháo & Tên Lửa Tuần Dương Hạm D-Day', 'TOME', 20, 98, 32, 1, 4, 4, 6500, 'IN_MAP_VENDOR', 'Bão lửa hải pháo & tên lửa hạm đội ngoài khơi tầm 1–4 ô, xuyên 35% RES & hồi 30% HP!', { isMagic: true, element: 'LIGHT', ignoreDefenseRatio: 0.35, drainRatio: 0.3 }),

  // DARK (Pháo Công Thành / Pháo Đường Sắt / Tên Lửa Đạn Đạo Chiến Thuật & Chiến Lược)
  dark_flux: w('dark_flux', 'Cối Công Thành Minenwerfer 170mm', 'TOME', 9, 86, 8, 1, 2, 1, 690, 'CAMP', 'Súng cối công thành Thế Chiến I tạo hố bom phá công sự ngầm.', { isMagic: true, element: 'DARK' }),
  nosferatu: w('nosferatu', 'Đạn Nhiệt Áp & Thu Hồi Chiến Lợi Phẩm', 'TOME', 10, 84, 8, 1, 2, 2, 1780, 'IN_MAP_VENDOR', 'Chế áp công sự địch và thu hồi vật tư hồi 50% sát thương thành HP.', { isMagic: true, element: 'DARK', drainRatio: 0.5 }),
  luna_tome: w('luna_tome', 'Đạn Xuyên Bê Tông Röchling 210mm', 'TOME', 12, 88, 22, 1, 2, 3, 2850, 'IN_MAP_VENDOR', 'Đạn mũi kim xuyên sâu qua lớp đất đá, bỏ qua 60% Công Sự (RES)!', { isMagic: true, element: 'DARK', ignoreDefenseRatio: 0.6 }),
  ruin_eclipse: w('ruin_eclipse', 'Tên Lửa Đạn Đạo Chiến Thuật V-2 / Pháo 280mm', 'TOME', 17, 88, 34, 1, 3, 3, 3650, 'IN_MAP_VENDOR', 'Tên lửa đạn đạo chiến thuật & đại pháo đường sắt tầm 1–3 ô, xuyên 40% RES & 34% CM.', { isMagic: true, element: 'DARK', ignoreDefenseRatio: 0.4 }),
  apocalypse_mythic: w('apocalypse_mythic', 'Tên Lửa Chiến Lược & Siêu Pháo 800mm Gustav', 'TOME', 21, 92, 35, 1, 4, 4, 6800, 'IN_MAP_VENDOR', 'Hỏa lực chiến lược tối thượng tầm 1–4 ô, xuyên 50% RES & hồi 40% HP!', { isMagic: true, element: 'DARK', ignoreDefenseRatio: 0.5, drainRatio: 0.4 }),

  // =========================================================================
  // STAFF -> QUÂN Y, CÔNG BINH SỬA CHỮA & TIẾP VẬN KHÔNG ĐỘI (MEDIC & REPAIR) — 14 kits
  // =========================================================================
  novice_staff: w('novice_staff', 'Túi Băng Gạc Sơ Cứu Chiến Hào', 'STAFF', 0, 100, 0, 1, 1, 1, 260, 'CAMP', 'Băng gạc vô trùng và thuốc sát trùng sơ cứu lính bị thương kề bên.', { isMagic: true, element: 'LIGHT', healPower: 10 }),
  heal_staff: w('heal_staff', 'Túi Quân Y Chữ Thập Đỏ', 'STAFF', 0, 100, 0, 1, 1, 1, 480, 'CAMP', 'Hồi phục sinh lực & sửa chữa nhanh cho đơn vị đồng minh đứng cạnh.', { isMagic: true, element: 'LIGHT', healPower: 14 }),
  mend_staff: w('mend_staff', 'Vali Phẫu Thuật & Huyết Tương', 'STAFF', 0, 100, 0, 1, 1, 2, 1050, 'CAMP', 'Truyền huyết tương khô và khâu vết thương nặng ngay tại tiền tuyến.', { isMagic: true, element: 'LIGHT', healPower: 26 }),
  blessing_rod: w('blessing_rod', 'Tổ Tải Thương & Cờ Lê Công Binh', 'STAFF', 0, 100, 0, 1, 2, 2, 1380, 'IN_MAP_VENDOR', 'Cứu thương & hàn vỏ thép linh hoạt ở khoảng cách 1–2 ô.', { isMagic: true, element: 'LIGHT', healPower: 20 }),
  physic_staff: w('physic_staff', 'Thả Dù Tiếp Tế Y Tế Tầm Xa', 'STAFF', 0, 100, 0, 1, 3, 2, 1950, 'IN_MAP_VENDOR', 'Bắn pháo hiệu gọi thùng tiếp tế quân y & phụ tùng tầm 1–3 ô!', { isMagic: true, element: 'LIGHT', healPower: 20 }),
  recover_staff: w('recover_staff', 'Trạm Quân Y Kháng Sinh Penicillin', 'STAFF', 0, 100, 0, 1, 1, 3, 2400, 'CAMP', 'Kháng sinh Penicillin Thế Chiến II cứu sống thương binh nguy kịch (+42 HP).', { isMagic: true, element: 'LIGHT', healPower: 42 }),
  sanctuary_staff: w('sanctuary_staff', 'Xe Cứu Thương Bọc Thép M3', 'STAFF', 0, 100, 0, 1, 3, 3, 2950, 'IN_MAP_VENDOR', 'Cơ động băng qua làn đạn cứu chữa đồng đội trong bán kính 1–3 ô.', { isMagic: true, element: 'LIGHT', healPower: 30 }),
  fortify_staff: w('fortify_staff', 'Cầu Hàng Không Tiếp Vận C-47 Skytrain', 'STAFF', 0, 100, 0, 1, 4, 3, 3550, 'IN_MAP_VENDOR', 'Thả dù khẩn cấp thuốc men, đạn dược và phụ tùng sửa tăng tầm 1–4 ô!', { isMagic: true, element: 'LIGHT', healPower: 34 }),
  lunar_staff: w('lunar_staff', 'Tàu Bệnh Viện & Đấu Nối Cứu Hộ', 'STAFF', 0, 100, 0, 1, 2, 3, 2680, 'IN_MAP_VENDOR', 'Bơm hút nước chống chìm & cấp cứu thủy thủ đoàn tầm 1–2 ô.', { isMagic: true, element: 'ICE', healPower: 36 }),
  solar_staff: w('solar_staff', 'Xe Công Binh Cứu Hộ Thiết Giáp M32', 'STAFF', 0, 100, 0, 1, 3, 3, 3300, 'IN_MAP_VENDOR', 'Cần cẩu bọc thép thay động cơ & hàn tháp pháo tại chỗ tầm 1–3 ô (+38 HP).', { isMagic: true, element: 'FIRE', healPower: 38 }),
  seraph_scepter: w('seraph_scepter', 'Bệnh Viện Dã Chiến Tiền Phương MASH', 'STAFF', 0, 100, 0, 1, 4, 4, 4800, 'IN_MAP_VENDOR', 'Tổ hợp quân y - kỹ thuật Bậc IV tầm 1–4 ô hồi 48 HP.', { isMagic: true, element: 'LIGHT', healPower: 48 }),
  latona_relic: w('latona_relic', 'Mạng Lưới Tiếp Vận Chiến Lược Red Ball', 'STAFF', 0, 100, 0, 1, 5, 4, 5600, 'IN_MAP_VENDOR', 'Tuyến hậu cần thần tốc vượt chiến trường 1–5 ô, hồi 52 HP.', { isMagic: true, element: 'LIGHT', healPower: 52 }),
  ashera_staff: w('ashera_staff', 'Phi Đội Cứu Hộ Đường Không Đặc Biệt', 'STAFF', 0, 100, 0, 1, 5, 4, 6200, 'EXOTIC', 'Cực phẩm Bậc IV tầm 1–5 ô hồi 64 HP cho cả Bộ Binh, Thiết Giáp & Hạm Đội.', { isMagic: true, element: 'LIGHT', healPower: 64 }),
  aether_caduceus: w('aether_caduceus', 'Tổng Trạm Hậu Cần Bộ Tư Lệnh Tối Cao', 'STAFF', 0, 100, 0, 1, 6, 4, 6800, 'EXOTIC', 'Hỗ trợ y tế & đại tu thiết giáp toàn chiến trường tầm 1–6 ô (+72 HP).', { isMagic: true, element: 'LIGHT', healPower: 72 }),
};

export const WEAPON_COUNT = Object.keys(WEAPONS).length;
