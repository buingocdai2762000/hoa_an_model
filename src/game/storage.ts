import {
  ARMOR_SLOTS,
  createInitialRoster,
  createStarterEquipmentBag,
  evaluateUnlockedTitles,
  STARTER_TITLE_IDS,
  STARTING_CONVOY_WEAPONS,
  STARTING_ITEM_BAG,
} from './data';
import type { ArmorSlot, CampaignSaveData, GameSettings, Unit } from './types';

const STORAGE_KEY = 'huyet_an_chronicle_save_ww_v6';

export const DEFAULT_SETTINGS: GameSettings = {
  muted: false,
  combatAnimations: true,
  fastMode: false,
  casualMode: true,
};

export function createFreshSave(): CampaignSaveData {
  const { equipmentBag } = createStarterEquipmentBag();
  return {
    version: 6,
    highestReachedMap: 1,
    clearedMaps: [],
    currentMapId: 1,
    totalTurns: 0,
    totalDefeatedEnemies: 0,
    totalCrits: 0,
    totalPromotions: 0,
    totalShopPurchases: 0,
    totalBossKills: 0,
    weatherBattlesWon: 0,
    unlockedTitleIds: [...STARTER_TITLE_IDS],
    commanderTitleId: 'vanguard_valoria',
    gold: 3000, // Starting Royal Treasury for Camp Bazaar, Armor, Gems, and Blacksmith Forge!
    masterSeals: STARTING_ITEM_BAG.master_seal ?? 2,
    itemBag: { ...STARTING_ITEM_BAG },
    convoyWeaponIds: [...STARTING_CONVOY_WEAPONS],
    equipmentBag,
    weaponForges: {},
    roster: createInitialRoster(),
    settings: { ...DEFAULT_SETTINGS },
    updatedAt: Date.now(),
  };
}

function hydrateSave(parsed: Partial<CampaignSaveData>): CampaignSaveData {
  const fresh = createFreshSave();
  const hasSavedEquipmentBag = Array.isArray(parsed.equipmentBag) && parsed.equipmentBag.length > 0;
  const equipmentBag = hasSavedEquipmentBag ? parsed.equipmentBag! : fresh.equipmentBag!;

  const mergedRoster = fresh.roster.map((baseHero) => {
    const savedHero = parsed.roster?.find((r) => r.templateId === baseHero.templateId);
    return savedHero
      ? {
          ...baseHero,
          ...savedHero,
          equippedTitleId: savedHero.equippedTitleId ?? baseHero.equippedTitleId,
          equippedArmorUids: hasSavedEquipmentBag
            ? savedHero.equippedArmorUids ?? {}
            : baseHero.equippedArmorUids,
        }
      : baseHero;
  });

  const mergedBag: Record<string, number> = {
    ...fresh.itemBag,
    ...(parsed.itemBag ?? {}),
  };
  if (typeof parsed.masterSeals === 'number' && parsed.itemBag?.master_seal === undefined) {
    mergedBag.master_seal = Math.max(parsed.masterSeals, mergedBag.master_seal ?? 0);
  }

  const hydrated: CampaignSaveData = {
    ...fresh,
    ...parsed,
    version: 6,
    totalCrits: typeof parsed.totalCrits === 'number' ? parsed.totalCrits : 0,
    totalPromotions: typeof parsed.totalPromotions === 'number' ? parsed.totalPromotions : 0,
    totalShopPurchases: typeof parsed.totalShopPurchases === 'number' ? parsed.totalShopPurchases : 0,
    totalBossKills: typeof parsed.totalBossKills === 'number' ? parsed.totalBossKills : 0,
    weatherBattlesWon: typeof parsed.weatherBattlesWon === 'number' ? parsed.weatherBattlesWon : 0,
    unlockedTitleIds: Array.from(
      new Set([...STARTER_TITLE_IDS, ...(Array.isArray(parsed.unlockedTitleIds) ? parsed.unlockedTitleIds : [])])
    ),
    commanderTitleId: parsed.commanderTitleId || 'vanguard_valoria',
    gold: typeof parsed.gold === 'number' ? parsed.gold : fresh.gold,
    itemBag: mergedBag,
    masterSeals: mergedBag.master_seal ?? 0,
    convoyWeaponIds:
      Array.isArray(parsed.convoyWeaponIds) && parsed.convoyWeaponIds.length > 0
        ? parsed.convoyWeaponIds
        : fresh.convoyWeaponIds,
    equipmentBag,
    weaponForges: parsed.weaponForges && typeof parsed.weaponForges === 'object' ? parsed.weaponForges : {},
    roster: mergedRoster,
    settings: {
      ...DEFAULT_SETTINGS,
      ...(parsed.settings ?? {}),
    },
  };

  const { allUnlocked } = evaluateUnlockedTitles(hydrated);
  hydrated.unlockedTitleIds = allUnlocked;
  return hydrated;
}

export function loadCampaignSave(): CampaignSaveData | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CampaignSaveData>;
    if (!parsed || typeof parsed.highestReachedMap !== 'number' || !Array.isArray(parsed.roster)) {
      return null;
    }
    return hydrateSave(parsed);
  } catch {
    return null;
  }
}

export function saveCampaignData(data: CampaignSaveData): void {
  try {
    const synced: CampaignSaveData = {
      ...data,
      masterSeals: data.itemBag?.master_seal ?? data.masterSeals ?? 0,
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
  } catch {
    // Ignore storage quota issues in private browsing
  }
}

export function mergeUnitsIntoSavedRoster(
  save: CampaignSaveData,
  battleUnits: Unit[],
  options?: { restockPotions?: boolean }
): CampaignSaveData {
  const restockPotions = options?.restockPotions ?? false;
  const maxCarrySlots = 6;
  const nextRoster = save.roster.map((savedHero) => {
    const live = battleUnits.find((u) => u.faction === 'PLAYER' && u.templateId === savedHero.templateId);
    if (!live) return savedHero;
    const equippedArmorUids: Partial<Record<ArmorSlot, string>> = {};
    const wornUidSet = new Set<string>();
    if (live.equipment) {
      for (const slot of ARMOR_SLOTS) {
        if (live.equipment[slot]?.uid) {
          equippedArmorUids[slot] = live.equipment[slot]!.uid;
          wornUidSet.add(live.equipment[slot]!.uid);
        }
      }
    }
    const inventoryIds = live.inventory.map((w) => w.id);
    let skippedEquipped = false;
    let spareWeaponCount = 0;
    for (const id of inventoryIds) {
      if (!skippedEquipped && id === live.weapon.id) {
        skippedEquipped = true;
        continue;
      }
      spareWeaponCount += 1;
    }
    const carriedItemIds = [...(live.carriedItems ?? [])];
    const carriedArmorUids = (live.carriedArmorUids ?? []).filter((uid) => !wornUidSet.has(uid));
    const nonPotionCarry = spareWeaponCount + carriedItemIds.length + carriedArmorUids.length;
    const maxPotionsRoom = Math.max(0, maxCarrySlots - nonPotionCarry);
    const curPotions = Math.min(maxPotionsRoom, Math.max(0, live.potions));
    const finalPotions = restockPotions
      ? Math.min(maxPotionsRoom, Math.max(2, curPotions))
      : curPotions;

    return {
      ...savedHero,
      classId: live.classId,
      tier: live.tier,
      promoted: Boolean(live.promoted || live.tier > 1),
      equippedTitleId: live.equippedTitleId ?? savedHero.equippedTitleId,
      level: live.level,
      exp: live.exp,
      stats: { ...live.stats },
      weaponId: live.weapon.id,
      equippedArmorUids,
      inventoryIds,
      carriedItemIds,
      carriedArmorUids,
      skills: [...live.skills],
      potions: finalPotions,
    };
  });

  return {
    ...save,
    masterSeals: save.itemBag?.master_seal ?? save.masterSeals ?? 0,
    roster: nextRoster,
    updatedAt: Date.now(),
  };
}

export function exportSaveToJson(save: CampaignSaveData): string {
  return JSON.stringify(save, null, 2);
}

export function parseImportedSave(jsonText: string): CampaignSaveData | null {
  try {
    const parsed = JSON.parse(jsonText) as Partial<CampaignSaveData>;
    if (
      !parsed ||
      typeof parsed.highestReachedMap !== 'number' ||
      parsed.highestReachedMap < 1 ||
      parsed.highestReachedMap > 200 ||
      !Array.isArray(parsed.roster)
    ) {
      return null;
    }
    return {
      ...hydrateSave(parsed),
      updatedAt: Date.now(),
    };
  } catch {
    return null;
  }
}
