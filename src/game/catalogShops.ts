import { ITEMS } from './catalogItems';
import { WEAPONS } from './catalogWeapons';
import { ARMOR_TEMPLATE_LIST, GEM_LIST } from './equipmentSystem';
import type { BiomeId, GameItem, ShopKind, ShopStock, Weapon } from './types';

function actFromMap(mapId: number): number {
  return Math.max(1, Math.min(10, Math.ceil(mapId / 12)));
}

/**
 * Deterministic biome bonus weapon picks so each region's in-map shops feel distinct and thematic.
 */
const BIOME_ARMORY_SPECIALS: Record<BiomeId, string[]> = {
  VALORIA_PLAINS: ['rapier_valoria', 'ridersbane', 'short_bow', 'wind_edge'],
  ELDWOOD_FOREST: ['longbow', 'wind_bow', 'wo_dao', 'hatchet_scout'],
  HOWLING_CANYON: ['javelin', 'short_spear', 'hand_axe', 'short_axe'],
  SOLARA_DESERT: ['killing_edge', 'killer_lance', 'killer_axe', 'killer_bow'],
  BLACKMIST_HARBOR: ['lancereaver_blade', 'armor_crossbow', 'heavy_spear', 'hammer_axe'],
  DARKSEAL_SWAMP: ['armorslayer', 'zanbato', 'halberd_axe', 'moon_halberd'],
  FROSTPEAK_TUNDRA: ['spear_storm', 'tomahawk', 'deadeye_longbow', 'sol_katti'],
  MAGMA_FORTRESS: ['brave_sword', 'brave_lance', 'brave_axe', 'brave_bow'],
  AETHELGARD_CITY: ['alondite_edge', 'wishblade', 'urvan_eclipse', 'double_bow'],
  CRIMSON_SANCTUM: ['durandal_flame', 'gradivus_imperial', 'armads_thunder', 'parthia_sun'],
};

const BIOME_VENDOR_SPECIALS: Record<BiomeId, string[]> = {
  VALORIA_PLAINS: ['levin_sword', 'blessing_rod', 'elwind_tome', 'shining_bow'],
  ELDWOOD_FOREST: ['elwind_tome', 'blizzard_tome', 'physic_staff', 'flame_brand'],
  HOWLING_CANYON: ['elthunder_tome', 'flame_lance', 'bolt_axe', 'physic_staff'],
  SOLARA_DESERT: ['arcfire_tome', 'divine_tome', 'nosferatu', 'solar_staff'],
  BLACKMIST_HARBOR: ['frost_brand', 'glacier_pike', 'frost_bow', 'lunar_staff'],
  DARKSEAL_SWAMP: ['runesword', 'luna_tome', 'nosferatu', 'sanctuary_staff'],
  FROSTPEAK_TUNDRA: ['fimbulvetr_tome', 'excalibur_tome', 'thoron_tome', 'fortify_staff'],
  MAGMA_FORTRESS: ['bolganone', 'magma_cleaver', 'aura_tome', 'ruin_eclipse'],
  AETHELGARD_CITY: ['forblaze_mythic', 'mjolnir_mythic', 'aureola_mythic', 'seraph_scepter'],
  CRIMSON_SANCTUM: ['forseti_mythic', 'glacies_mythic', 'apocalypse_mythic', 'latona_relic'],
};

/**
 * Computes the exact Shop inventory for:
 * 1) CAMP_BAZAAR (Ngoài màn chơi — Quân Nhu Doanh Trại): Standard army weapons, basic tomes, healing potions, basic seals & scrolls.
 * 2) IN_MAP_ARMORY (Trong màn chơi — Tiệm Rèn Chiến Trường): Exclusive Killer, Anti-Armor/Cavalry/Flying, 1–2 range physical, Brave & Tier-IV weapons + Combat Tonics/STR-SKL-DEF boosters.
 * 3) IN_MAP_VENDOR (Trong màn chơi — Thương Nhân Bí Mật): Exclusive Arcane Tomes, Magic Blades/Bows, Long-Range Staves, Permanent Stat Boosters (Swift Boots, Seraph Robe, Speedwing...), Mythic Crowns & High EXP Codices.
 */
export function getShopStock(kind: ShopKind, mapId: number, biome: BiomeId): ShopStock {
  const act = actFromMap(mapId);
  const maxUnlockedTier = act >= 8 ? 4 : act >= 5 ? 3 : act >= 2 ? 2 : 2;
  const allWeapons = Object.values(WEAPONS);
  const allItems = Object.values(ITEMS);

  if (kind === 'CAMP_BAZAAR') {
    // Out-of-map Camp Shop: Standard reliable CAMP gear only (never sells In-Map exclusive Killer/Brave/Stat Boosters)
    const campMaxTier = act >= 6 ? 3 : act >= 3 ? 2 : 1;
    const weaponIds = allWeapons
      .filter((w) => w.shopTag === 'CAMP' && w.tier <= campMaxTier)
      .sort((a, b) => a.tier - b.tier || a.price - b.price)
      .map((w) => w.id);

    const itemIds = allItems
      .filter(
        (it) =>
          it.category !== 'TREASURE' &&
          (it.shopTag === 'CAMP' || it.shopTag === 'BOTH') &&
          it.tier <= Math.max(2, campMaxTier)
      )
      .sort((a, b) => a.tier - b.tier || a.price - b.price)
      .map((it) => it.id);

    const armorIds = ARMOR_TEMPLATE_LIST.filter(
      (a) => a.shopTag === 'CAMP' && a.tier <= Math.max(2, campMaxTier)
    )
      .sort((a, b) => a.tier - b.tier || a.price - b.price)
      .map((a) => a.id);

    const gemIds = GEM_LIST.filter(
      (g) => g.rarity === 'COMMON' || g.rarity === 'RARE'
    ).map((g) => g.id);

    return {
      kind,
      title: 'Quân Nhu Doanh Trại',
      subtitle: 'Cửa Hàng Ngoài Màn Chơi — Chuẩn Bị Quân Trang, Giáp & Bảo Ngọc',
      badgeText: 'NGOÀI MÀN CHƠI',
      accentColor: '#f59e0b',
      exclusivityNote:
        'Bán vũ khí tiêu chuẩn, bộ 5 giáp cơ bản, nguyên liệu Lò Rèn (Đá Tôi Luyện, Tinh Thiết, Tinh Thể Hợp Nhất) và Bảo Ngọc sơ cấp. Giáp & Ngọc Thần Thoại xuất hiện tại Cửa Hàng TRONG MÀN CHƠI!',
      weaponIds,
      itemIds,
      armorIds,
      gemIds,
    };
  }

  if (kind === 'IN_MAP_ARMORY') {
    const specials = BIOME_ARMORY_SPECIALS[biome] ?? [];
    const pool = allWeapons
      .filter((w) => w.shopTag === 'IN_MAP_ARMORY' && w.tier <= maxUnlockedTier)
      .sort((a, b) => a.tier - b.tier || a.price - b.price)
      .map((w) => w.id);

    // Always put biome specials at top (even 1 tier ahead as a battlefield discovery reward!)
    const weaponIds = Array.from(new Set([...specials, ...pool])).slice(0, 26);

    const itemIds = allItems
      .filter(
        (it) =>
          it.category !== 'TREASURE' &&
          (it.shopTag === 'IN_MAP_ARMORY' || it.id === 'concoction' || it.id === 'elixir')
      )
      .sort((a, b) => a.tier - b.tier || a.price - b.price)
      .map((it) => it.id);

    const armorIds = ARMOR_TEMPLATE_LIST.filter(
      (a) => a.shopTag === 'IN_MAP_ARMORY' && a.tier <= Math.max(2, maxUnlockedTier)
    )
      .sort((a, b) => a.tier - b.tier || a.price - b.price)
      .map((a) => a.id);

    const gemIds = GEM_LIST.filter(
      (g) => g.id === 'gem_ruby' || g.id === 'gem_topaz' || g.id === 'gem_diamond'
    ).map((g) => g.id);

    return {
      kind,
      title: 'Tiệm Rèn Chiến Trường',
      subtitle: `Cửa Hàng Trong Màn ${mapId} — Vũ Khí & Trọng Giáp Độc Quyền`,
      badgeText: 'TRONG MÀN CHƠI · RÈN',
      accentColor: '#f43f5e',
      exclusivityNote:
        'Độc quyền thực địa! Bán vũ khí Phá Giáp/Sát Thủ/Song Kích, Giáp Bậc II–III, Kim Cương Hộ Thể và nguyên liệu Tôi Luyện không có ở Doanh Trại.',
      weaponIds,
      itemIds,
      armorIds,
      gemIds,
    };
  }

  // IN_MAP_VENDOR
  const specials = BIOME_VENDOR_SPECIALS[biome] ?? [];
  const pool = allWeapons
    .filter((w) => w.shopTag === 'IN_MAP_VENDOR' && w.tier <= maxUnlockedTier)
    .sort((a, b) => a.tier - b.tier || a.price - b.price)
    .map((w) => w.id);

  const weaponIds = Array.from(new Set([...specials, ...pool])).slice(0, 26);

  const itemIds = allItems
    .filter(
      (it) =>
        it.category !== 'TREASURE' &&
        (it.shopTag === 'IN_MAP_VENDOR' || it.id === 'royal_crest' || it.id === 'elixir')
    )
    .sort((a, b) => a.tier - b.tier || a.price - b.price)
    .map((it) => it.id);

  const armorIds = ARMOR_TEMPLATE_LIST.filter(
    (a) => a.shopTag === 'IN_MAP_VENDOR' || a.tier >= 3
  )
    .sort((a, b) => a.tier - b.tier || a.price - b.price)
    .map((a) => a.id);

  const gemIds = GEM_LIST.filter(
    (g) => g.rarity === 'EPIC' || g.rarity === 'LEGENDARY' || g.rarity === 'MYTHIC' || g.id === 'gem_sapphire'
  ).map((g) => g.id);

  return {
    kind,
    title: 'Thương Nhân Bí Mật',
    subtitle: `Cửa Hàng Trong Màn ${mapId} — Pháp Điển, Thần Giáp & Bảo Ngọc Hiếm`,
    badgeText: 'TRONG MÀN CHƠI · BÍ MẬT',
    accentColor: '#10b981',
    exclusivityNote:
      'Độc quyền Thương Nhân Bí Mật! Bán Pháp Điển Cao Cấp, Thần Giáp Bậc IV, Hài Thần Phong (+1 MOV), Thái Dương Thạch & Hư Không Bảo Thạch!',
    weaponIds,
    itemIds,
    armorIds,
    gemIds,
  };
}

export function getWeaponSellPrice(weapon: Weapon): number {
  return Math.max(100, Math.floor(weapon.price * 0.5));
}

export function getItemSellPrice(item: GameItem): number {
  if (item.category === 'TREASURE' && item.sellValue) {
    return item.sellValue;
  }
  return Math.max(80, Math.floor(item.price * 0.5));
}
