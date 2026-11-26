import { CAMPAIGN_MAPS } from './campaignData';
import { ITEMS } from './catalogItems';
import { WEAPONS } from './catalogWeapons';
import { ARMOR_TEMPLATE_LIST, GEM_LIST } from './equipmentSystem';
import type { BiomeId, GameItem, ShopKind, ShopStock, Weapon } from './types';

function actFromMap(mapId: number): number {
  const meta = CAMPAIGN_MAPS[mapId - 1];
  if (meta) return meta.actNumber;
  if (mapId <= 96) return Math.max(1, Math.min(8, Math.ceil(mapId / 12)));
  return Math.max(9, Math.min(16, 8 + Math.ceil((mapId - 96) / 13)));
}

/**
 * Deterministic theater bonus weapon picks so each WWI/WWII frontline depot feels authentic.
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
 * Computes Shop inventory across 16 Acts / 200 Battles (WWI Acts 1..8 -> WWII Acts 9..16):
 * 1) CAMP_BAZAAR (Ngoài trận — Quân Nhu Bộ Tư Lệnh)
 * 2) IN_MAP_ARMORY (Trong trận — Kho Quân Giới Tiền Phương)
 * 3) IN_MAP_VENDOR (Trong trận — Trạm Tiếp Vận Đặc Nhiệm)
 */
export function getShopStock(kind: ShopKind, mapId: number, biome: BiomeId): ShopStock {
  const act = actFromMap(mapId);
  const maxUnlockedTier = act >= 13 ? 4 : act >= 9 ? 3 : act >= 3 ? 2 : 2;
  const allWeapons = Object.values(WEAPONS);
  const allItems = Object.values(ITEMS);

  if (kind === 'CAMP_BAZAAR') {
    const campMaxTier = act >= 10 ? 3 : act >= 4 ? 2 : 1;
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
      title: 'Quân Nhu Bộ Tư Lệnh',
      subtitle: 'Hậu Cần Ngoài Trận — Vũ Khí Biên Chế, Quân Trang & Vật Tư Xưởng Quân Giới',
      badgeText: 'NGOÀI TRẬN · BỘ TƯ LỆNH',
      accentColor: '#f59e0b',
      exclusivityNote:
        'Cung cấp súng pháo tiêu chuẩn, bộ 5 khí tài cơ bản, vật liệu Xưởng Quân Giới (Thép Vonfram, Phôi Thép Cán, Bản Vẽ Cải Tiến) và Mô-đun sơ cấp. Vũ khí Đặc Chủng & Radar Tối Tân mở bán tại Kho Tiền Phương TRONG TRẬN!',
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
      title: 'Kho Quân Giới Tiền Phương',
      subtitle: `Tiếp Vận Trận ${mapId}/200 — Vũ Khí Chống Tăng, Phòng Không & Liên Thanh`,
      badgeText: 'TRONG TRẬN · QUÂN GIỚI',
      accentColor: '#f43f5e',
      exclusivityNote:
        'Độc quyền thực địa! Cung cấp Bazooka/Panzerfaust, Pháo Phòng Không Bofors/Flak 88, Tiểu liên liên thanh PPSh/MG-42 và Giáp Thép Cán không bán ở Căn Cứ.',
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
    title: 'Trạm Tiếp Vận Đặc Nhiệm',
    subtitle: `Tiếp Vận Trận ${mapId}/200 — Pháo Phản Lực, Không Kích, Hải Pháo & Khí Tài Tối Mật`,
    badgeText: 'TRONG TRẬN · ĐẶC NHIỆM',
    accentColor: '#10b981',
    exclusivityNote:
      'Độc quyền Đặc Nhiệm! Bán Dàn Katyusha, Phi Đội Stuka/B-17, Hải Pháo Hạm Đội, Ngư Lôi U-Boat, Động Cơ Merlin (+1 MOV), Ngòi Nổ VT & Radar H2X!',
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
