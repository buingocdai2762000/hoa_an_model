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
 * 136 distinct Weapons, Spells & Staves across 6 categories, 6 magic elements, and 4 power tiers.
 * Camp Bazaar stocks reliable army standards; In-Map Armory stocks exclusive tactical/killer/brave/range weapons;
 * In-Map Vendor stocks exclusive rare Tomes, long-range Staves, and Arcane Runeblades.
 */
export const WEAPONS: Record<string, Weapon> = {
  // =========================================================================
  // SWORDS (KIẾM) — 24 weapons
  // =========================================================================
  bronze_sword: w('bronze_sword', 'Kiếm Đồng Tân Binh', 'SWORD', 4, 100, 0, 1, 1, 1, 280, 'CAMP', 'Kiếm tập luyện siêu chuẩn xác, gần như không thể đánh trượt.'),
  iron_sword: w('iron_sword', 'Kiếm Sắt', 'SWORD', 6, 92, 5, 1, 1, 1, 450, 'CAMP', 'Thanh kiếm tiêu chuẩn sắc bén, chính xác cao.'),
  slim_sword: w('slim_sword', 'Kiếm Mảnh Khinh Binh', 'SWORD', 5, 98, 12, 1, 1, 1, 520, 'CAMP', 'Kiếm nhẹ tốc độ cao, dễ tung đòn chí mạng.'),
  rapier_valoria: w('rapier_valoria', 'Liễu Kiếm Vương Tộc', 'SWORD', 8, 95, 15, 1, 1, 1, 980, 'IN_MAP_ARMORY', 'Khắc chế cả Trọng Giáp và Kỵ Binh — báu vật chiến trường.', { effectiveVsArmor: true, effectiveVsCavalry: true }),
  steel_sword: w('steel_sword', 'Kiếm Thép', 'SWORD', 9, 86, 6, 1, 1, 1, 780, 'CAMP', 'Kiếm thép tôi rèn cân bằng giữa sát thương và độ bền.'),
  armorslayer: w('armorslayer', 'Kiếm Phá Giáp', 'SWORD', 8, 84, 5, 1, 1, 2, 1150, 'IN_MAP_ARMORY', 'Lưỡi kiếm nặng chuyên đâm thủng giáp sắt (×2 Trọng Giáp).', { effectiveVsArmor: true }),
  zanbato: w('zanbato', 'Trảm Mã Đao', 'SWORD', 9, 85, 8, 1, 1, 2, 1180, 'IN_MAP_ARMORY', 'Đại đao bản rộng chuyên chém hạ kỵ binh (×2 Kỵ Binh).', { effectiveVsCavalry: true }),
  wo_dao: w('wo_dao', 'Yêu Đao Bạch Ngân', 'SWORD', 9, 90, 35, 1, 1, 2, 1380, 'IN_MAP_ARMORY', 'Lưỡi đao tinh xảo với tỷ lệ chí mạng cực cao (+35% CM).'),
  killing_edge: w('killing_edge', 'Đoạn Hồn Kiếm', 'SWORD', 10, 88, 32, 1, 1, 2, 1420, 'IN_MAP_ARMORY', 'Thanh kiếm sát thủ tạo ra các nhát chém chí mạng liên tiếp.'),
  lancereaver_blade: w('lancereaver_blade', 'Kiếm Bẻ Thương', 'SWORD', 10, 92, 12, 1, 1, 2, 1320, 'IN_MAP_ARMORY', 'Lưỡi móc tinh xảo giúp xuyên thủng 20% phòng thủ đối phương.', { ignoreDefenseRatio: 0.2 }),
  silver_sword: w('silver_sword', 'Kiếm Bạc Hoàng Gia', 'SWORD', 13, 90, 10, 1, 1, 2, 1650, 'CAMP', 'Kiếm bạc tinh luyện của kỵ sĩ cận vệ kinh đô.'),
  wind_edge: w('wind_edge', 'Phong Nhận Kiếm', 'SWORD', 8, 84, 8, 1, 2, 2, 1520, 'IN_MAP_ARMORY', 'Phóng lưỡi gió vật lý tầm 1–2 ô, chuyên phản công cung thủ.', { element: 'WIND' }),
  levin_sword: w('levin_sword', 'Lôi Đình Ma Kiếm', 'SWORD', 11, 86, 12, 1, 2, 2, 1950, 'IN_MAP_VENDOR', 'Kiếm ma thuật phóng sét tầm 1–2 ô, tính theo Ma Lực (MAG).', { isMagic: true, element: 'THUNDER' }),
  flame_brand: w('flame_brand', 'Hỏa Diễm Kiếm', 'SWORD', 12, 85, 10, 1, 2, 2, 2050, 'IN_MAP_VENDOR', 'Lưỡi kiếm rực lửa đánh xuyên giáp vật lý bằng sát thương phép.', { isMagic: true, element: 'FIRE' }),
  frost_brand: w('frost_brand', 'Hàn Băng Ma Kiếm', 'SWORD', 12, 90, 15, 1, 2, 3, 2450, 'IN_MAP_VENDOR', 'Kiếm băng cổ đại chém tầm 1–2 ô, xuyên 20% kháng phép.', { isMagic: true, element: 'ICE', ignoreDefenseRatio: 0.2 }),
  runesword: w('runesword', 'Ma Kiếm Cổ Ngữ', 'SWORD', 12, 88, 12, 1, 2, 3, 2750, 'IN_MAP_VENDOR', 'Kiếm ma pháp tầm 1–2 ô, hút 40% sát thương thành HP.', { isMagic: true, element: 'DARK', drainRatio: 0.4 }),
  brave_sword: w('brave_sword', 'Song Kiếm Dũng Sĩ', 'SWORD', 8, 86, 8, 1, 1, 3, 2850, 'IN_MAP_ARMORY', 'Chém 2 nhát liên hoàn mỗi khi chủ động tấn công.', { brave: true }),
  adamant_blade: w('adamant_blade', 'Kiếm Tinh Cương', 'SWORD', 16, 86, 12, 1, 1, 3, 2600, 'CAMP', 'Đại kiếm tinh cương nặng nề nhưng sức công phá khủng khiếp.'),
  sol_katti: w('sol_katti', 'Nhật Nguyệt Thần Đao', 'SWORD', 15, 95, 38, 1, 1, 3, 3400, 'IN_MAP_ARMORY', 'Thần đao gió thánh xuyên 25% giáp và chí mạng áp đảo.', { element: 'WIND', ignoreDefenseRatio: 0.25 }),
  valoria_blade: w('valoria_blade', 'Thánh Kiếm Valoria', 'SWORD', 16, 95, 22, 1, 1, 3, 3800, 'EXOTIC', 'Bảo kiếm vương tộc chém xuyên Trọng Giáp và ánh sáng bất diệt.', { element: 'LIGHT', effectiveVsArmor: true }),
  durandal_flame: w('durandal_flame', 'Hỏa Thần Kiếm Durandal', 'SWORD', 19, 92, 24, 1, 1, 4, 5200, 'IN_MAP_ARMORY', 'Thần kiếm Bậc IV rực cháy, khắc chế Trọng Giáp & xuyên 30% DEF.', { element: 'FIRE', effectiveVsArmor: true, ignoreDefenseRatio: 0.3 }),
  alondite_edge: w('alondite_edge', 'Tinh Ngân Thánh Kiếm', 'SWORD', 18, 94, 22, 1, 2, 4, 5600, 'IN_MAP_ARMORY', 'Thánh kiếm Bậc IV phát kiếm khí tầm 1–2 ô, đánh xuyên phòng tuyến.', { element: 'LIGHT' }),
  muramasa_crimson: w('muramasa_crimson', 'Huyết Đao Muramasa', 'SWORD', 16, 94, 48, 1, 1, 4, 5800, 'IN_MAP_ARMORY', 'Yêu đao Bậc IV hút 35% HP mỗi nhát chém, tỷ lệ chí mạng 48%.', { element: 'DARK', drainRatio: 0.35 }),
  aether_sovereign_blade: w('aether_sovereign_blade', 'Thái Hư Vương Kiếm', 'SWORD', 20, 96, 30, 1, 2, 4, 6800, 'EXOTIC', 'Cực phẩm Ma Kiếm Bậc IV song kích và hút sinh lực 30%.', { isMagic: true, element: 'LIGHT', brave: true, drainRatio: 0.3 }),

  // =========================================================================
  // LANCES (THƯƠNG & KÍCH) — 22 weapons
  // =========================================================================
  bronze_lance: w('bronze_lance', 'Thương Đồng Tân Binh', 'LANCE', 5, 96, 0, 1, 1, 1, 300, 'CAMP', 'Thương tập dễ cầm, độ chính xác tuyệt đối.'),
  iron_lance: w('iron_lance', 'Thương Sắt', 'LANCE', 7, 86, 5, 1, 1, 1, 480, 'CAMP', 'Vũ khí kỵ binh vững chắc, khắc chế Kiếm.'),
  slim_lance: w('slim_lance', 'Thương Mảnh Phong Hành', 'LANCE', 6, 94, 12, 1, 1, 1, 560, 'CAMP', 'Thương nhẹ giúp kỵ sĩ Thiên Mã tung đòn chính xác.'),
  steel_lance: w('steel_lance', 'Thương Thép', 'LANCE', 10, 82, 6, 1, 1, 1, 820, 'CAMP', 'Thương thép hạng nặng uy lực cao.'),
  javelin: w('javelin', 'Lao Phóng', 'LANCE', 7, 78, 5, 1, 2, 1, 880, 'IN_MAP_ARMORY', 'Có thể ném tấn công tầm xa 1–2 ô.'),
  ridersbane: w('ridersbane', 'Kích Phá Kỵ', 'LANCE', 9, 82, 5, 1, 1, 2, 1200, 'IN_MAP_ARMORY', 'Chuyên đâm ngã kỵ binh địch (×2 Kỵ Binh).', { effectiveVsCavalry: true }),
  heavy_spear: w('heavy_spear', 'Trọng Thương Phá Giáp', 'LANCE', 9, 80, 5, 1, 1, 2, 1240, 'IN_MAP_ARMORY', 'Mũi thương tứ giác xuyên thủng giáp nặng (×2 Trọng Giáp).', { effectiveVsArmor: true }),
  killer_lance: w('killer_lance', 'Sát Thương Huyết Ảnh', 'LANCE', 10, 86, 32, 1, 1, 2, 1460, 'IN_MAP_ARMORY', 'Ngọn thương mài sắc bén chuyên tung đòn chí mạng (+32% CM).'),
  short_spear: w('short_spear', 'Đoản Thương Tinh Luyện', 'LANCE', 10, 82, 8, 1, 2, 2, 1580, 'IN_MAP_ARMORY', 'Lao thép tầm 1–2 ô chuẩn xác và mạnh mẽ hơn Lao Phóng.'),
  silver_lance: w('silver_lance', 'Thương Bạc Hoàng Gia', 'LANCE', 14, 86, 8, 1, 1, 2, 1720, 'CAMP', 'Ngọn thương bạc danh giá của đội kỵ sĩ cận vệ.'),
  flame_lance: w('flame_lance', 'Viêm Long Ma Thương', 'LANCE', 12, 84, 10, 1, 2, 2, 2100, 'IN_MAP_VENDOR', 'Ngọn thương phép thuật tầm 1–2 ô thiêu đốt theo Ma Lực.', { isMagic: true, element: 'FIRE' }),
  glacier_pike: w('glacier_pike', 'Hàn Băng Trường Kích', 'LANCE', 13, 88, 14, 1, 2, 3, 2550, 'IN_MAP_VENDOR', 'Kích băng tầm 1–2 ô đánh vào Kháng Phép và xuyên 20% RES.', { isMagic: true, element: 'ICE', ignoreDefenseRatio: 0.2 }),
  spear_storm: w('spear_storm', 'Lôi Kích Phóng Xuyên', 'LANCE', 13, 86, 14, 1, 2, 3, 2650, 'IN_MAP_ARMORY', 'Đại kích phóng sét vật lý tầm 1–2 ô, áp chế hàng sau địch.', { element: 'THUNDER' }),
  brave_lance: w('brave_lance', 'Song Thương Hào Kiệt', 'LANCE', 9, 82, 8, 1, 1, 3, 2950, 'IN_MAP_ARMORY', 'Đâm 2 đòn chớp nhoáng liên tiếp khi mở giao tranh.', { brave: true }),
  mithril_halberd: w('mithril_halberd', 'Mithril Đại Kích', 'LANCE', 16, 86, 14, 1, 1, 3, 2700, 'CAMP', 'Đại kích rèn từ bạc tinh thể, uy lực hủy diệt.'),
  moon_halberd: w('moon_halberd', 'Nguyệt Nha Phá Giáp Kích', 'LANCE', 14, 88, 22, 1, 1, 3, 3300, 'IN_MAP_ARMORY', 'Lưỡi kích trăng khuyết xuyên thẳng 40% phòng thủ mục tiêu.', { ignoreDefenseRatio: 0.4 }),
  dragon_spear: w('dragon_spear', 'Long Nha Thần Thương', 'LANCE', 17, 90, 18, 1, 2, 3, 3900, 'EXOTIC', 'Thần thương tầm 1–2 ô khắc chế Kỵ Binh và Không Kỵ.', { effectiveVsCavalry: true, effectiveVsFlying: true }),
  wishblade: w('wishblade', 'Thiên Mệnh Thần Kích', 'LANCE', 19, 92, 24, 1, 2, 4, 5400, 'IN_MAP_ARMORY', 'Thần kích Bậc IV tấn công tầm 1–2 ô, xuyên 25% giáp.', { element: 'LIGHT', ignoreDefenseRatio: 0.25 }),
  gradivus_imperial: w('gradivus_imperial', 'Đế Vương Thương Gradivus', 'LANCE', 19, 94, 20, 1, 2, 4, 5800, 'IN_MAP_ARMORY', 'Thần thương Bậc IV tầm 1–2 ô, hấp thụ 35% sát thương thành HP.', { element: 'LIGHT', drainRatio: 0.35 }),
  gungnir_sky: w('gungnir_sky', 'Thương Thần Gungnir', 'LANCE', 20, 98, 26, 1, 2, 4, 6200, 'IN_MAP_ARMORY', 'Bách phát bách trúng, khắc chế Không Kỵ và Trọng Giáp.', { element: 'THUNDER', effectiveVsFlying: true, effectiveVsArmor: true }),
  vampire_pike: w('vampire_pike', 'Huyết Ma Trường Thương', 'LANCE', 17, 88, 28, 1, 1, 4, 5100, 'IN_MAP_ARMORY', 'Hấp thụ 50% sát thương thành HP, càng đánh càng bất tử.', { element: 'DARK', drainRatio: 0.5 }),
  celestial_trident: w('celestial_trident', 'Hải Thần Tam Xoa Kích', 'LANCE', 16, 92, 20, 1, 2, 4, 6600, 'EXOTIC', 'Cực phẩm Bậc IV song kích tầm 1–2 ô mang sức mạnh sấm sét.', { element: 'THUNDER', brave: true }),

  // =========================================================================
  // AXES (RÌU & BÚA) — 22 weapons
  // =========================================================================
  bronze_axe: w('bronze_axe', 'Rìu Đồng Tân Binh', 'AXE', 6, 90, 0, 1, 1, 1, 310, 'CAMP', 'Rìu nhẹ dễ điều khiển cho chiến binh mới nhập ngũ.'),
  iron_axe: w('iron_axe', 'Rìu Sắt', 'AXE', 9, 78, 5, 1, 1, 1, 490, 'CAMP', 'Rìu nặng uy lực lớn, khắc chế Thương.'),
  hatchet_scout: w('hatchet_scout', 'Rìu Nhỏ Du Kích', 'AXE', 7, 88, 8, 1, 2, 1, 790, 'CAMP', 'Rìu ném nhẹ tầm 1–2 ô với độ chính xác vượt trội.'),
  steel_axe: w('steel_axe', 'Rìu Thép', 'AXE', 12, 74, 6, 1, 1, 1, 860, 'CAMP', 'Rìu chiến hai lưỡi bổ nát khiên địch.'),
  hand_axe: w('hand_axe', 'Rìu Ném', 'AXE', 8, 74, 5, 1, 2, 1, 890, 'IN_MAP_ARMORY', 'Rìu chiến tầm 1–2 ô, dùng được cả cận chiến lẫn tầm xa.'),
  hammer_axe: w('hammer_axe', 'Búa Phá Thành', 'AXE', 11, 74, 5, 1, 1, 2, 1250, 'IN_MAP_ARMORY', 'Nghiền nát mọi giáp nặng (×2 Trọng Giáp).', { effectiveVsArmor: true }),
  halberd_axe: w('halberd_axe', 'Rìu Trảm Kỵ', 'AXE', 11, 76, 8, 1, 1, 2, 1280, 'IN_MAP_ARMORY', 'Lưỡi rìu dài chuyên đốn ngã chiến mã (×2 Kỵ Binh).', { effectiveVsCavalry: true }),
  killer_axe: w('killer_axe', 'Cuồng Phủ Sát Thần', 'AXE', 12, 80, 35, 1, 1, 2, 1520, 'IN_MAP_ARMORY', 'Rìu khát máu bùng nổ tỷ lệ chí mạng cực đại (+35% CM).'),
  short_axe: w('short_axe', 'Chiến Phủ Phi Đao', 'AXE', 11, 80, 10, 1, 2, 2, 1650, 'IN_MAP_ARMORY', 'Rìu ném hạng nặng tầm 1–2 ô, uy lực vượt xa Rìu Ném.'),
  silver_axe: w('silver_axe', 'Chiến Phủ Bạc', 'AXE', 16, 80, 8, 1, 1, 2, 1780, 'CAMP', 'Đại rìu rèn bạc với sức bổ kinh hồn.'),
  bolt_axe: w('bolt_axe', 'Lôi Thần Ma Phủ', 'AXE', 14, 82, 12, 1, 2, 2, 2200, 'IN_MAP_VENDOR', 'Ma phủ tầm 1–2 ô giáng sét hủy diệt theo Ma Lực.', { isMagic: true, element: 'THUNDER' }),
  magma_cleaver: w('magma_cleaver', 'Dung Nham Ma Phủ', 'AXE', 15, 80, 15, 1, 2, 3, 2650, 'IN_MAP_VENDOR', 'Rìu dung nham tấn công phép tầm 1–2 ô, xuyên 20% RES.', { isMagic: true, element: 'FIRE', ignoreDefenseRatio: 0.2 }),
  tomahawk: w('tomahawk', 'Bạo Phong Phủ', 'AXE', 14, 82, 16, 1, 2, 3, 2750, 'IN_MAP_ARMORY', 'Rìu ném thượng hạng tầm 1–2 ô của các chiến tướng.'),
  brave_axe: w('brave_axe', 'Song Phủ Cuồng Chiến', 'AXE', 10, 76, 10, 1, 1, 3, 3050, 'IN_MAP_ARMORY', 'Bổ 2 nhát sấm sét liên hoàn mỗi khi chủ động giao tranh.', { brave: true }),
  obsidian_greataxe: w('obsidian_greataxe', 'Hắc Diện Đại Phủ', 'AXE', 18, 80, 14, 1, 1, 3, 2800, 'CAMP', 'Đại rìu đá hắc diện siêu nặng, một nhát định càn khôn.'),
  crusher_maul: w('crusher_maul', 'Thiên Lôi Chiến Chùy', 'AXE', 16, 84, 18, 1, 1, 3, 3450, 'IN_MAP_ARMORY', 'Chiến chùy xuyên 35% giáp và khắc chế Trọng Giáp.', { effectiveVsArmor: true, ignoreDefenseRatio: 0.35 }),
  dragon_axe: w('dragon_axe', 'Long Cốt Đại Phủ', 'AXE', 18, 84, 22, 1, 1, 3, 3850, 'EXOTIC', 'Rèn từ nanh rồng cổ đại, chém xuyên Trọng Giáp và Không Kỵ.', { effectiveVsArmor: true, effectiveVsFlying: true }),
  crimson_halberd: w('crimson_halberd', 'Huyết Ấn Đại Kích', 'AXE', 18, 86, 20, 1, 2, 3, 4100, 'EXOTIC', 'Thần kích nhuốm máu của thống soái Thiết Huyết, đánh tầm 1–2 ô.', { element: 'DARK', effectiveVsArmor: true }),
  armads_thunder: w('armads_thunder', 'Thiên Lôi Phủ Armads', 'AXE', 21, 88, 25, 1, 1, 4, 5500, 'IN_MAP_ARMORY', 'Thần phủ Bậc IV sấm sét, xuyên 30% DEF và khắc chế Trọng Giáp.', { element: 'THUNDER', effectiveVsArmor: true, ignoreDefenseRatio: 0.3 }),
  urvan_eclipse: w('urvan_eclipse', 'Nhật Thực Thần Phủ', 'AXE', 20, 90, 30, 1, 2, 4, 5900, 'IN_MAP_ARMORY', 'Thần phủ Bậc IV ném tầm 1–2 ô, hút 30% sát thương thành HP.', { element: 'DARK', drainRatio: 0.3 }),
  basilikos_fury: w('basilikos_fury', 'Bá Vương Chiến Phủ', 'AXE', 22, 86, 36, 1, 1, 4, 6100, 'IN_MAP_ARMORY', 'Sức sát thương vật lý tối thượng Bậc IV, 36% chí mạng.'),
  hels_wrath: w('hels_wrath', 'Minh Phủ Huyết Lệ', 'AXE', 18, 86, 42, 1, 1, 4, 5700, 'IN_MAP_ARMORY', 'Hấp thụ 45% HP và tỷ lệ chí mạng hủy diệt 42%.', { element: 'DARK', drainRatio: 0.45 }),
  titan_worldbreaker: w('titan_worldbreaker', 'Khai Thiên Song Phủ', 'AXE', 18, 86, 22, 1, 2, 4, 6800, 'EXOTIC', 'Cực phẩm Bậc IV song kích tầm 1–2 ô, nghiền nát mọi đội hình.', { brave: true, effectiveVsArmor: true }),

  // =========================================================================
  // BOWS (CUNG & NỎ) — 20 weapons
  // =========================================================================
  training_bow: w('training_bow', 'Cung Gỗ Tập Bắn', 'BOW', 5, 98, 5, 2, 2, 1, 290, 'CAMP', 'Cung nhẹ dễ ngắm, khắc chế Không Kỵ (×2).', { effectiveVsFlying: true }),
  hunting_bow: w('hunting_bow', 'Cung Săn Rừng', 'BOW', 7, 92, 10, 2, 2, 1, 480, 'CAMP', 'Khắc chế cực mạnh các đơn vị bay (×2 Không Kỵ).', { effectiveVsFlying: true }),
  short_bow: w('short_bow', 'Đoản Cung Cận Chiến', 'BOW', 6, 92, 14, 1, 2, 1, 860, 'IN_MAP_ARMORY', 'Bắn được cả cận chiến (1–2 ô), không sợ bị áp sát!', { effectiveVsFlying: true }),
  steel_bow: w('steel_bow', 'Cung Thép Trường Lực', 'BOW', 10, 86, 10, 2, 2, 1, 820, 'CAMP', 'Lực kéo mạnh mẽ, tên thép xuyên gió.', { effectiveVsFlying: true }),
  longbow: w('longbow', 'Trường Cung Tầm Xa', 'BOW', 8, 82, 10, 2, 3, 2, 1380, 'IN_MAP_ARMORY', 'Bắn tỉa siêu xa tầm 2–3 ô ngoài tầm phản công của pháp sư!', { effectiveVsFlying: true }),
  killer_bow: w('killer_bow', 'Cung Sát Thủ', 'BOW', 10, 92, 35, 2, 2, 2, 1480, 'IN_MAP_ARMORY', 'Mũi tên đen hiểm hóc với tỷ lệ chí mạng siêu cao (+35% CM).', { effectiveVsFlying: true }),
  armor_crossbow: w('armor_crossbow', 'Nỏ Phá Giáp Liên Hoàn', 'BOW', 11, 86, 12, 1, 2, 2, 1620, 'IN_MAP_ARMORY', 'Bắn tầm 1–2 ô, khắc chế cả Trọng Giáp và Không Kỵ!', { effectiveVsFlying: true, effectiveVsArmor: true }),
  wind_bow: w('wind_bow', 'Phong Cung Thiên Ưng', 'BOW', 12, 92, 18, 2, 3, 2, 1920, 'IN_MAP_ARMORY', 'Cung gió thần tầm 2–3 ô, chuyên săn mục tiêu từ xa.', { element: 'WIND', effectiveVsFlying: true }),
  silver_bow: w('silver_bow', 'Cung Bạc Hoàng Gia', 'BOW', 14, 90, 14, 2, 2, 2, 1750, 'CAMP', 'Cung bạc chạm khắc tinh xảo của ngự lâm xạ thủ.', { effectiveVsFlying: true }),
  shining_bow: w('shining_bow', 'Quang Minh Ma Cung', 'BOW', 12, 92, 15, 1, 2, 2, 2150, 'IN_MAP_VENDOR', 'Bắn mũi tên ánh sáng tầm 1–2 ô, tính theo Ma Lực (MAG).', { isMagic: true, element: 'LIGHT', effectiveVsFlying: true }),
  frost_bow: w('frost_bow', 'Hàn Băng Ma Cung', 'BOW', 13, 94, 20, 2, 3, 3, 2650, 'IN_MAP_VENDOR', 'Tên băng tầm 2–3 ô xuyên 20% kháng phép.', { isMagic: true, element: 'ICE', effectiveVsFlying: true, ignoreDefenseRatio: 0.2 }),
  brave_bow: w('brave_bow', 'Song Cung Bão Táp', 'BOW', 8, 86, 10, 2, 2, 3, 2980, 'IN_MAP_ARMORY', 'Bắn 2 mũi tên liên tiếp mỗi khi chủ động tấn công.', { brave: true, effectiveVsFlying: true }),
  mithril_bow: w('mithril_bow', 'Cung Mithril Tinh Quang', 'BOW', 16, 92, 18, 2, 2, 3, 2720, 'CAMP', 'Cung hợp kim mithril độ chính xác hoàn mỹ.', { effectiveVsFlying: true }),
  deadeye_longbow: w('deadeye_longbow', 'Ưng Nhãn Trường Cung', 'BOW', 14, 94, 28, 2, 3, 3, 3350, 'IN_MAP_ARMORY', 'Trường cung tầm 2–3 ô xuyên 30% giáp kẻ địch.', { effectiveVsFlying: true, ignoreDefenseRatio: 0.3 }),
  storm_ballista: w('storm_ballista', 'Lôi Nỏ Săn Rồng', 'BOW', 16, 90, 22, 1, 3, 3, 3680, 'IN_MAP_ARMORY', 'Bắn linh hoạt tầm 1–3 ô, khắc chế Không Kỵ và Kỵ Binh.', { element: 'THUNDER', effectiveVsFlying: true, effectiveVsCavalry: true }),
  parthia_sun: w('parthia_sun', 'Thái Dương Cung Parthia', 'BOW', 19, 96, 26, 2, 3, 4, 5400, 'IN_MAP_ARMORY', 'Thần cung Bậc IV tầm 2–3 ô, xuyên 25% giáp và rực lửa.', { element: 'FIRE', effectiveVsFlying: true, ignoreDefenseRatio: 0.25 }),
  nidhogg_fang: w('nidhogg_fang', 'Độc Long Cung Nidhogg', 'BOW', 19, 94, 34, 1, 2, 4, 5700, 'IN_MAP_ARMORY', 'Thần cung cận-viễn Bậc IV hút 35% sát thương thành HP.', { element: 'DARK', effectiveVsFlying: true, drainRatio: 0.35 }),
  double_bow: w('double_bow', 'Thiên Phạt Song Liên Cung', 'BOW', 16, 94, 24, 1, 3, 4, 6200, 'IN_MAP_ARMORY', 'Bắn tầm 1–3 ô với hiệu ứng Song Kích liên hoàn (×2 đòn)!', { brave: true, effectiveVsFlying: true }),
  starfall_arc: w('starfall_arc', 'Tinh Vẫn Thần Cung', 'BOW', 18, 98, 40, 2, 3, 4, 6400, 'IN_MAP_ARMORY', 'Mũi tên sao băng tầm 2–3 ô, chí mạng 40% & xuyên 35% DEF.', { element: 'LIGHT', effectiveVsFlying: true, ignoreDefenseRatio: 0.35 }),
  zephyr_sovereign_bow: w('zephyr_sovereign_bow', 'Thiên Phong Đế Cung', 'BOW', 20, 98, 30, 1, 3, 4, 6900, 'EXOTIC', 'Cực phẩm Bậc IV tầm 1–3 ô khắc chế mọi đơn vị Bay & Kỵ Binh.', { element: 'WIND', effectiveVsFlying: true, effectiveVsCavalry: true, brave: true }),

  // =========================================================================
  // TOMES & ELEMENTAL MAGIC (PHÁP ĐIỂN MA THUẬT) — 26 spells
  // =========================================================================
  // FIRE (Hỏa)
  fire_tome: w('fire_tome', 'Hỏa Cầu Thư', 'TOME', 7, 92, 5, 1, 2, 1, 480, 'CAMP', 'Ma pháp Hỏa cơ bản, cân bằng và chính xác.', { isMagic: true, element: 'FIRE' }),
  elfire_tome: w('elfire_tome', 'Liệt Hỏa Pháp Điển', 'TOME', 11, 86, 10, 1, 2, 2, 1280, 'CAMP', 'Triệu hồi cột lửa thiêu đốt mọi phòng tuyến.', { isMagic: true, element: 'FIRE' }),
  arcfire_tome: w('arcfire_tome', 'Hỏa Long Pháp Điển', 'TOME', 14, 88, 16, 1, 2, 3, 2450, 'IN_MAP_VENDOR', 'Ngọn lửa rồng công phá dữ dội, khắc chế Trọng Giáp.', { isMagic: true, element: 'FIRE', effectiveVsArmor: true }),
  bolganone: w('bolganone', 'Địa Ngục Dung Nham', 'TOME', 17, 84, 18, 1, 2, 3, 3150, 'IN_MAP_VENDOR', 'Phun trào nham thạch đốt cháy cả bầu trời chiến địa.', { isMagic: true, element: 'FIRE' }),
  forblaze_mythic: w('forblaze_mythic', 'Thần Hỏa Thư Forblaze', 'TOME', 20, 94, 28, 1, 3, 4, 5800, 'IN_MAP_VENDOR', 'Cấm thư Bậc IV tầm 1–3 ô, xuyên 30% RES và bùng cháy.', { isMagic: true, element: 'FIRE', ignoreDefenseRatio: 0.3 }),

  // THUNDER (Lôi)
  thunder_tome: w('thunder_tome', 'Lôi Điện Pháp Điển', 'TOME', 9, 84, 18, 1, 2, 1, 620, 'CAMP', 'Ma pháp Lôi chuyên gây đột biến chí mạng.', { isMagic: true, element: 'THUNDER' }),
  elthunder_tome: w('elthunder_tome', 'Cửu Thiên Lôi Thư', 'TOME', 12, 86, 26, 1, 2, 2, 1480, 'IN_MAP_VENDOR', 'Sét đánh chí mạng cao, khắc chế Chiến Long & Không Kỵ.', { isMagic: true, element: 'THUNDER', effectiveVsFlying: true }),
  thoron_tome: w('thoron_tome', 'Lôi Phạt Trường Kích Thư', 'TOME', 14, 88, 28, 1, 3, 3, 2950, 'IN_MAP_VENDOR', 'Tia sét xuyên thẳng tầm 1–3 ô với chí mạng cực cao!', { isMagic: true, element: 'THUNDER' }),
  mjolnir_mythic: w('mjolnir_mythic', 'Lôi Thần Thư Mjölnir', 'TOME', 19, 92, 42, 1, 3, 4, 6100, 'IN_MAP_VENDOR', 'Thần thư Bậc IV tầm 1–3 ô, tỷ lệ chí mạng hủy diệt 42%.', { isMagic: true, element: 'THUNDER', effectiveVsFlying: true }),

  // WIND (Phong)
  wind_tome: w('wind_tome', 'Cuồng Phong Pháp Điển', 'TOME', 7, 98, 12, 1, 2, 1, 560, 'CAMP', 'Lưỡi gió siêu chuẩn xác, khắc chế Không Kỵ (×2).', { isMagic: true, element: 'WIND', effectiveVsFlying: true }),
  elwind_tome: w('elwind_tome', 'Bão Tố Pháp Điển', 'TOME', 11, 96, 16, 1, 2, 2, 1420, 'IN_MAP_VENDOR', 'Cơn lốc sắc lẹm chuyên bắn hạ mọi kỵ sĩ bay (×2).', { isMagic: true, element: 'WIND', effectiveVsFlying: true }),
  excalibur_tome: w('excalibur_tome', 'Thánh Phong Excalibur', 'TOME', 15, 98, 28, 1, 2, 3, 3250, 'IN_MAP_VENDOR', 'Gió thần cổ đại bách phát bách trúng, khắc chế Không Kỵ.', { isMagic: true, element: 'WIND', effectiveVsFlying: true }),
  forseti_mythic: w('forseti_mythic', 'Thần Phong Thư Forseti', 'TOME', 18, 100, 32, 1, 3, 4, 6200, 'IN_MAP_VENDOR', 'Cấm thư Bậc IV tầm 1–3 ô Song Kích gió thần không bao giờ trượt!', { isMagic: true, element: 'WIND', effectiveVsFlying: true, brave: true }),

  // ICE (Băng)
  ice_tome: w('ice_tome', 'Hàn Băng Pháp Điển', 'TOME', 9, 92, 14, 1, 2, 1, 680, 'CAMP', 'Triệu hồi mảnh băng xuyên giáp lạnh thấu xương.', { isMagic: true, element: 'ICE' }),
  blizzard_tome: w('blizzard_tome', 'Bão Tuyết Pháp Điển', 'TOME', 12, 86, 18, 1, 3, 2, 1850, 'IN_MAP_VENDOR', 'Cơn bão băng giá tầm 1–3 ô, đóng băng mục tiêu từ xa.', { isMagic: true, element: 'ICE' }),
  fimbulvetr_tome: w('fimbulvetr_tome', 'Vĩnh Đông Fimbulvetr', 'TOME', 16, 92, 24, 1, 2, 3, 3100, 'IN_MAP_VENDOR', 'Hàn khí tận thế xuyên 25% kháng phép.', { isMagic: true, element: 'ICE', ignoreDefenseRatio: 0.25 }),
  glacies_mythic: w('glacies_mythic', 'Băng Đế Thư Glacies', 'TOME', 19, 95, 30, 1, 3, 4, 5950, 'IN_MAP_VENDOR', 'Thần thư Bậc IV tầm 1–3 ô xuyên 40% kháng phép địch.', { isMagic: true, element: 'ICE', ignoreDefenseRatio: 0.4 }),

  // LIGHT (Quang)
  light_shine: w('light_shine', 'Quang Minh Pháp Điển', 'TOME', 8, 98, 15, 1, 2, 1, 640, 'CAMP', 'Ánh sáng thánh khiết có độ chính xác gần tuyệt đối.', { isMagic: true, element: 'LIGHT' }),
  divine_tome: w('divine_tome', 'Thánh Phạt Pháp Điển', 'TOME', 11, 96, 20, 1, 2, 2, 1450, 'IN_MAP_VENDOR', 'Tia sáng phán xét trừng phạt mọi thế lực hắc ám.', { isMagic: true, element: 'LIGHT' }),
  aura_tome: w('aura_tome', 'Thái Dương Hào Quang', 'TOME', 15, 94, 24, 1, 2, 3, 2980, 'IN_MAP_VENDOR', 'Cột sáng thần linh hút 25% sát thương chữa lành bản thân.', { isMagic: true, element: 'LIGHT', drainRatio: 0.25 }),
  astral_tome: w('astral_tome', 'Tinh Tú Thánh Thư', 'TOME', 16, 94, 24, 1, 2, 3, 3600, 'IN_MAP_VENDOR', 'Ma pháp tinh tú cổ đại xuyên 30% kháng phép.', { isMagic: true, element: 'LIGHT', ignoreDefenseRatio: 0.3 }),
  aureola_mythic: w('aureola_mythic', 'Thánh Quang Cực Đỉnh', 'TOME', 20, 98, 32, 1, 3, 4, 6500, 'IN_MAP_VENDOR', 'Thần thư Bậc IV tầm 1–3 ô xuyên 35% RES và hồi 30% HP.', { isMagic: true, element: 'LIGHT', ignoreDefenseRatio: 0.35, drainRatio: 0.3 }),

  // DARK (Ám)
  dark_flux: w('dark_flux', 'Hắc Ám Dòng Chảy', 'TOME', 9, 86, 8, 1, 2, 1, 690, 'CAMP', 'Hắc ma thuật cổ đại gây sát thương nặng nề.', { isMagic: true, element: 'DARK' }),
  nosferatu: w('nosferatu', 'Hấp Huyết Cổ Thư', 'TOME', 10, 84, 8, 1, 2, 2, 1780, 'IN_MAP_VENDOR', 'Hắc thuật hút 50% sát thương gây ra thành HP.', { isMagic: true, element: 'DARK', drainRatio: 0.5 }),
  luna_tome: w('luna_tome', 'Nguyệt Thực Cấm Thư', 'TOME', 11, 88, 22, 1, 2, 3, 2850, 'IN_MAP_VENDOR', 'Cấm thuật xuyên thẳng 60% kháng phép (RES) đối thủ.', { isMagic: true, element: 'DARK', ignoreDefenseRatio: 0.6 }),
  ruin_eclipse: w('ruin_eclipse', 'Hư Không Diệt Thế Thư', 'TOME', 17, 88, 34, 1, 3, 3, 3650, 'IN_MAP_VENDOR', 'Hắc thuật tầm 1–3 ô, xuyên 40% RES với chí mạng 34%.', { isMagic: true, element: 'DARK', ignoreDefenseRatio: 0.4 }),
  apocalypse_mythic: w('apocalypse_mythic', 'Tận Thế Cổ Thư Apocalypse', 'TOME', 21, 92, 35, 1, 3, 4, 6800, 'IN_MAP_VENDOR', 'Cấm thư Bậc IV tầm 1–3 ô xuyên 50% RES & hút 40% HP!', { isMagic: true, element: 'DARK', ignoreDefenseRatio: 0.5, drainRatio: 0.4 }),

  // =========================================================================
  // STAVES (TRƯỢNG TRỊ THƯƠNG) — 14 staves
  // =========================================================================
  novice_staff: w('novice_staff', 'Trượng Gỗ Tân Tu', 'STAFF', 0, 100, 0, 1, 1, 1, 260, 'CAMP', 'Trượng cầu nguyện cơ bản hồi lượng HP nhỏ.', { isMagic: true, element: 'LIGHT', healPower: 10 }),
  heal_staff: w('heal_staff', 'Trượng Hồi Phục', 'STAFF', 0, 100, 0, 1, 1, 1, 480, 'CAMP', 'Hồi phục HP cho đồng minh kề cạnh.', { isMagic: true, element: 'LIGHT', healPower: 14 }),
  mend_staff: w('mend_staff', 'Trượng Đại Trị Liệu', 'STAFF', 0, 100, 0, 1, 1, 2, 1050, 'CAMP', 'Chữa lành vết thương nặng với lượng hồi HP cực lớn.', { isMagic: true, element: 'LIGHT', healPower: 26 }),
  blessing_rod: w('blessing_rod', 'Trượng Phúc Lành', 'STAFF', 0, 100, 0, 1, 2, 2, 1380, 'IN_MAP_VENDOR', 'Trượng tầm 1–2 ô chữa trị linh hoạt tuyến giữa.', { isMagic: true, element: 'LIGHT', healPower: 20 }),
  physic_staff: w('physic_staff', 'Trượng Viễn Trị', 'STAFF', 0, 100, 0, 1, 3, 2, 1950, 'IN_MAP_VENDOR', 'Trị thương từ xa tầm 1–3 ô an toàn cho đội hình.', { isMagic: true, element: 'LIGHT', healPower: 20 }),
  recover_staff: w('recover_staff', 'Trượng Toàn Phục', 'STAFF', 0, 100, 0, 1, 1, 3, 2400, 'CAMP', 'Hồi phục gần như toàn bộ sinh lực cho đồng minh.', { isMagic: true, element: 'LIGHT', healPower: 42 }),
  sanctuary_staff: w('sanctuary_staff', 'Trượng Thánh Điện', 'STAFF', 0, 100, 0, 1, 3, 3, 2950, 'IN_MAP_VENDOR', 'Chữa lành từ xa tầm 1–3 ô với thánh quang dồi dào.', { isMagic: true, element: 'LIGHT', healPower: 30 }),
  fortify_staff: w('fortify_staff', 'Trượng Bất Tử Viễn Trị', 'STAFF', 0, 100, 0, 1, 4, 3, 3550, 'IN_MAP_VENDOR', 'Tầm trị thương siêu xa 1–4 ô, bảo kê mọi mũi tiên phong!', { isMagic: true, element: 'LIGHT', healPower: 34 }),
  lunar_staff: w('lunar_staff', 'Trượng Nguyệt Quang', 'STAFF', 0, 100, 0, 1, 2, 3, 2680, 'IN_MAP_VENDOR', 'Ánh trăng thanh tẩy hồi lượng HP cực lớn tầm 1–2 ô.', { isMagic: true, element: 'ICE', healPower: 36 }),
  solar_staff: w('solar_staff', 'Trượng Thái Dương', 'STAFF', 0, 100, 0, 1, 3, 3, 3300, 'IN_MAP_VENDOR', 'Nhiệt quang rực rỡ hồi 38 HP tầm 1–3 ô.', { isMagic: true, element: 'FIRE', healPower: 38 }),
  seraph_scepter: w('seraph_scepter', 'Quyền Trượng Thiên Sứ', 'STAFF', 0, 100, 0, 1, 4, 4, 4800, 'IN_MAP_VENDOR', 'Thần trượng Bậc IV tầm 1–4 ô hồi 48 HP.', { isMagic: true, element: 'LIGHT', healPower: 48 }),
  latona_relic: w('latona_relic', 'Thánh Khí Latona', 'STAFF', 0, 100, 0, 1, 5, 4, 5600, 'IN_MAP_VENDOR', 'Tầm trị liệu vượt chiến trường 1–5 ô, hồi 52 HP.', { isMagic: true, element: 'LIGHT', healPower: 52 }),
  ashera_staff: w('ashera_staff', 'Trượng Nữ Thần Ashera', 'STAFF', 0, 100, 0, 1, 5, 4, 6200, 'EXOTIC', 'Cực phẩm Bậc IV tầm 1–5 ô hồi 64 HP, cứu nguy tức thì.', { isMagic: true, element: 'LIGHT', healPower: 64 }),
  aether_caduceus: w('aether_caduceus', 'Thái Hư Thánh Trượng', 'STAFF', 0, 100, 0, 1, 6, 4, 6800, 'EXOTIC', 'Thánh trượng huyền thoại tầm 1–6 ô hồi 72 HP.', { isMagic: true, element: 'LIGHT', healPower: 72 }),
};

export const WEAPON_COUNT = Object.keys(WEAPONS).length;
