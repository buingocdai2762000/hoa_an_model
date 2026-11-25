import {
  ARMOR_SLOT_META,
  ARMOR_SLOTS,
  ARMOR_TEMPLATES,
  CLASS_META,
  createEquipmentInstance,
  EQUIPMENT_RARITY_META,
  GEMS,
  getClassLineage,
  getUnitEquipmentBonuses,
  getUnitTitleBonuses,
  ITEMS,
  SKILLS,
  TERRAIN_DATA,
  WEAPON_TYPE_LABEL,
  WEAPONS,
  WEATHER_DATA,
} from './data';
import type {
  ArmorSlot,
  BattleLootDrop,
  BattleOutcome,
  CampaignMapMeta,
  CombatForecast,
  CombatResolution,
  CombatStrike,
  EquipmentInstance,
  EquipmentRarity,
  GameItem,
  LevelUpGain,
  PromotionResult,
  SealItemId,
  SkillId,
  StatGrowths,
  TerrainType,
  TileCoord,
  Unit,
  UnitClassId,
  UnitStats,
  Weapon,
  WeaponForgeState,
  WeaponType,
  WeatherType,
} from './types';

export function getEffectiveUnitStats(
  unit: Unit,
  commanderTitleId?: string | null
): UnitStats {
  const bonus = getUnitTitleBonuses(unit, commanderTitleId);
  const eq = getUnitEquipmentBonuses(unit);
  return {
    maxHp: unit.stats.maxHp + bonus.stats.maxHp + eq.stats.maxHp,
    str: unit.stats.str + bonus.stats.str + eq.stats.str,
    mag: unit.stats.mag + bonus.stats.mag + eq.stats.mag,
    skl: unit.stats.skl + bonus.stats.skl + eq.stats.skl,
    spd: unit.stats.spd + bonus.stats.spd + eq.stats.spd,
    lck: unit.stats.lck + bonus.stats.lck + eq.stats.lck,
    def: unit.stats.def + bonus.stats.def + eq.stats.def,
    res: unit.stats.res + bonus.stats.res + eq.stats.res,
    mov: unit.stats.mov + bonus.stats.mov + eq.stats.mov,
  };
}

export function reclassUnit(
  unit: Unit,
  targetTier1ClassId: UnitClassId
): Unit | null {
  if (unit.faction !== 'PLAYER' || unit.isLord) return null;
  const lineage = getClassLineage(targetTier1ClassId);
  const targetClassId = lineage[Math.min(lineage.length - 1, Math.max(0, unit.tier - 1))] ?? targetTier1ClassId;
  const targetMeta = CLASS_META[targetClassId];
  if (!targetMeta) return null;

  let nextWeapon = unit.weapon;
  let nextInventory = [...unit.inventory];
  if (!targetMeta.allowedWeaponTypes.includes(unit.weapon.type)) {
    const compat = nextInventory.find((w) => targetMeta.allowedWeaponTypes.includes(w.type));
    if (compat) {
      nextWeapon = compat;
    } else {
      const primary = targetMeta.allowedWeaponTypes[0];
      const fallbackId =
        primary === 'SWORD'
          ? 'steel_sword'
          : primary === 'LANCE'
          ? 'steel_lance'
          : primary === 'AXE'
          ? 'killer_axe'
          : primary === 'BOW'
          ? 'hunting_bow'
          : primary === 'TOME'
          ? 'fire_tome'
          : 'heal_staff';
      nextWeapon = WEAPONS[fallbackId] ?? WEAPONS.iron_sword;
      nextInventory = [nextWeapon, ...nextInventory.filter((w) => w.id !== nextWeapon.id)];
    }
  }

  return {
    ...unit,
    classId: targetMeta.id,
    className: targetMeta.name,
    tier: targetMeta.tier,
    promoted: targetMeta.tier > 1,
    moveType: targetMeta.moveType,
    weapon: nextWeapon,
    inventory: nextInventory,
    skills: Array.from(new Set([...unit.skills, ...targetMeta.defaultSkills])),
    accentColor: targetMeta.accent,
  };
}

export function manhattan(a: TileCoord, b: TileCoord): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Classic Fire Emblem Weapon Triangle:
 * SWORD > AXE > LANCE > SWORD
 */
export function getWeaponTriangleAdvantage(attacker: WeaponType, defender: WeaponType): -1 | 0 | 1 {
  if (attacker === 'SWORD' && defender === 'AXE') return 1;
  if (attacker === 'AXE' && defender === 'LANCE') return 1;
  if (attacker === 'LANCE' && defender === 'SWORD') return 1;
  if (attacker === 'AXE' && defender === 'SWORD') return -1;
  if (attacker === 'LANCE' && defender === 'AXE') return -1;
  if (attacker === 'SWORD' && defender === 'LANCE') return -1;
  return 0;
}

export function hasSkill(unit: Unit, skillId: SkillId): boolean {
  return Array.isArray(unit.skills) && unit.skills.includes(skillId);
}

export function getActiveSkills(unit: Unit): SkillId[] {
  if (!Array.isArray(unit.skills)) return [];
  return unit.skills.filter((s) => SKILLS[s]?.kind === 'ACTIVE');
}

export function canUnitUseSkill(unit: Unit, skillId: SkillId): boolean {
  const def = SKILLS[skillId];
  if (!def || def.kind !== 'ACTIVE') return false;
  if (!hasSkill(unit, skillId)) return false;
  if ((unit.sp ?? 0) < (def.spCost ?? 0)) return false;
  if (def.aoeHeal) return true;
  return unit.weapon.type !== 'STAFF';
}

export function canUnitEquipWeapon(unit: Unit, weapon: Weapon): boolean {
  const meta = CLASS_META[unit.classId];
  if (!meta) return false;
  return meta.allowedWeaponTypes.includes(weapon.type);
}

export function getPromotionChain(classId: UnitClassId): UnitClassId[] {
  return getClassLineage(classId);
}

/**
 * Resolves which Promotion Seal from the bag can promote this unit across all 3 milestones:
 * - Bậc I -> Bậc II (Lv.5): master_seal or omni_seal
 * - Bậc II -> Bậc III (Lv.15): royal_crest or omni_seal
 * - Bậc III -> Bậc IV (Lv.30): mythic_crown or omni_seal
 */
export function findAvailableSealForUnit(
  unit: Unit,
  itemBagOrMasterSeals: Record<string, number> | number
): SealItemId | null {
  if (unit.faction !== 'PLAYER' || unit.hp <= 0) return null;
  const meta = CLASS_META[unit.classId];
  if (!meta || !meta.promotion) return null;
  if (unit.level < meta.promotion.minLevel) return null;

  const neededSeal = meta.promotion.sealItemId;
  if (typeof itemBagOrMasterSeals === 'number') {
    return neededSeal === 'master_seal' && itemBagOrMasterSeals > 0 ? 'master_seal' : null;
  }

  if ((itemBagOrMasterSeals[neededSeal] ?? 0) > 0) {
    return neededSeal;
  }
  if ((itemBagOrMasterSeals.omni_seal ?? 0) > 0) {
    return 'omni_seal';
  }
  return null;
}

export function canPromoteUnit(
  unit: Unit,
  itemBagOrMasterSeals: Record<string, number> | number
): boolean {
  return findAvailableSealForUnit(unit, itemBagOrMasterSeals) !== null;
}

export function promoteUnit(
  unit: Unit,
  sealConsumedId?: SealItemId
): { updatedUnit: Unit; result: PromotionResult } | null {
  const meta = CLASS_META[unit.classId];
  if (!meta || !meta.promotion) return null;
  const promo = meta.promotion;
  const targetMeta = CLASS_META[promo.toClass];
  if (!targetMeta) return null;

  const bonuses = promo.statBonuses;
  const nextStats = {
    maxHp: unit.stats.maxHp + (bonuses.maxHp ?? 0),
    str: unit.stats.str + (bonuses.str ?? 0),
    mag: unit.stats.mag + (bonuses.mag ?? 0),
    skl: unit.stats.skl + (bonuses.skl ?? 0),
    spd: unit.stats.spd + (bonuses.spd ?? 0),
    lck: unit.stats.lck + (bonuses.lck ?? 0),
    def: unit.stats.def + (bonuses.def ?? 0),
    res: unit.stats.res + (bonuses.res ?? 0),
    mov: unit.stats.mov + (bonuses.mov ?? 0),
  };

  const nextSkills = Array.from(new Set([...(unit.skills ?? []), promo.unlockSkill]));

  const updatedUnit: Unit = {
    ...unit,
    classId: promo.toClass,
    className: targetMeta.name,
    tier: targetMeta.tier,
    promoted: targetMeta.tier > 1,
    moveType: targetMeta.moveType,
    stats: nextStats,
    hp: Math.min(nextStats.maxHp, unit.hp + (bonuses.maxHp ?? 0) + 8),
    sp: Math.min(unit.maxSp ?? 100, (unit.sp ?? 50) + 45),
    skills: nextSkills,
    accentColor: targetMeta.accent,
  };

  return {
    updatedUnit,
    result: {
      unitId: unit.id,
      unitName: unit.name,
      fromClassName: meta.name,
      toClassName: targetMeta.name,
      toClassId: promo.toClass,
      newTier: targetMeta.tier,
      statBonuses: bonuses,
      unlockedSkill: promo.unlockSkill,
      sealConsumedId: sealConsumedId ?? promo.sealItemId,
    },
  };
}

export function applyItemToUnit(
  unit: Unit,
  item: GameItem,
  rng: () => number = Math.random
): { updatedUnit: Unit; summary: string; levelUp: LevelUpGain | null } | null {
  if (
    item.category === 'SEAL' ||
    item.category === 'TREASURE' ||
    item.category === 'FORGE_MAT' ||
    item.category === 'GEM'
  ) {
    return null;
  }

  let nextUnit: Unit = {
    ...unit,
    stats: { ...unit.stats },
  };
  const notes: string[] = [];
  let levelUp: LevelUpGain | null = null;

  if (item.statBoost) {
    const statLabels: Record<keyof Unit['stats'], string> = {
      maxHp: 'MaxHP',
      str: 'STR',
      mag: 'MAG',
      skl: 'SKL',
      spd: 'SPD',
      lck: 'LCK',
      def: 'DEF',
      res: 'RES',
      mov: 'MOV',
    };
    for (const [k, delta] of Object.entries(item.statBoost)) {
      if (!delta) continue;
      const key = k as keyof Unit['stats'];
      nextUnit.stats[key] += delta;
      if (key === 'maxHp') {
        const effMaxHp = getEffectiveUnitStats(nextUnit).maxHp;
        nextUnit.hp = Math.min(effMaxHp, nextUnit.hp + delta);
      }
      notes.push(`+${delta} ${statLabels[key]}`);
    }
  }

  if (item.healHp && item.healHp > 0) {
    const before = nextUnit.hp;
    const effMaxHp = getEffectiveUnitStats(nextUnit).maxHp;
    nextUnit.hp = Math.min(effMaxHp, nextUnit.hp + item.healHp);
    const healed = nextUnit.hp - before;
    if (healed > 0) notes.push(`+${healed} HP`);
  }

  if (item.restoreSp && item.restoreSp > 0) {
    const before = nextUnit.sp;
    nextUnit.sp = Math.min(nextUnit.maxSp, nextUnit.sp + item.restoreSp);
    const gainedSp = nextUnit.sp - before;
    if (gainedSp > 0) notes.push(`+${gainedSp} SP`);
  }

  if (item.expGrant && item.expGrant > 0) {
    const expRes = applyExpAndLevelUp(nextUnit, item.expGrant, rng);
    nextUnit = expRes.updatedUnit;
    levelUp = expRes.levelUp;
    notes.push(`+${item.expGrant} EXP`);
    if (levelUp) {
      notes.push(`Đạt Lv.${levelUp.newLevel}!`);
    }
  }

  if (notes.length === 0) {
    return null;
  }

  return {
    updatedUnit: nextUnit,
    summary: `${unit.name} sử dụng ${item.name}: ${notes.join(', ')}`,
    levelUp,
  };
}

export function canUnitAttackAtDistance(
  unit: Unit,
  distance: number,
  activeSkillId?: SkillId | null
): boolean {
  if (unit.weapon.type === 'STAFF') return false;
  const rangeBonus = activeSkillId ? SKILLS[activeSkillId]?.rangeBonus ?? 0 : 0;
  return distance >= unit.weapon.minRange && distance <= unit.weapon.maxRange + rangeBonus;
}

export function canUnitHealAtDistance(unit: Unit, distance: number): boolean {
  if (unit.weapon.type !== 'STAFF') return false;
  return distance >= unit.weapon.minRange && distance <= unit.weapon.maxRange;
}

function getEffectiveness(weapon: Weapon, target: Unit): { effective: boolean; label?: string } {
  if (weapon.effectiveVsFlying && target.moveType === 'FLYING') {
    return { effective: true, label: 'Khắc chế Không Kỵ (×2)' };
  }
  if (weapon.effectiveVsArmor && target.moveType === 'ARMORED') {
    return { effective: true, label: 'Phá Giáp Trọng Giáp (×2)' };
  }
  if (weapon.effectiveVsCavalry && target.moveType === 'MOUNTED') {
    return { effective: true, label: 'Phá Kỵ Binh (×2)' };
  }
  return { effective: false };
}

export function calculateCombatForecast(
  attacker: Unit,
  defender: Unit,
  attackerTerrain: TerrainType,
  defenderTerrain: TerrainType,
  distance: number,
  activeSkillId: SkillId | null = null,
  weather: WeatherType = 'NONE',
  commanderTitleId: string | null = null
): CombatForecast {
  const atkAdv = getWeaponTriangleAdvantage(attacker.weapon.type, defender.weapon.type);
  const defAdv = (atkAdv * -1) as -1 | 0 | 1;

  const atkTerrainInfo = TERRAIN_DATA[attackerTerrain];
  const defTerrainInfo = TERRAIN_DATA[defenderTerrain];
  const weatherInfo = WEATHER_DATA[weather] ?? WEATHER_DATA.NONE;

  const atkTitle = getUnitTitleBonuses(attacker, commanderTitleId);
  const defTitle = getUnitTitleBonuses(defender, commanderTitleId);
  const atkEq = getUnitEquipmentBonuses(attacker);
  const defEq = getUnitEquipmentBonuses(defender);
  const atkStats = getEffectiveUnitStats(attacker, commanderTitleId);
  const defStats = getEffectiveUnitStats(defender, commanderTitleId);

  const effAtk = getEffectiveness(attacker.weapon, defender);
  const effDef = getEffectiveness(defender.weapon, attacker);

  const skill = activeSkillId ? SKILLS[activeSkillId] : null;
  const attackerNotes: string[] = [];
  const defenderNotes: string[] = [];

  if (skill) attackerNotes.push(`Tuyệt kỹ: ${skill.name}`);
  if (attacker.weapon.brave) attackerNotes.push('Song Kích (×2 đòn)');
  if ((attacker.weapon.drainRatio ?? 0) > 0 || (skill?.drainRatio ?? 0) > 0) {
    attackerNotes.push('Hấp thụ HP');
  }
  if (atkTitle.activeTitleNames.length > 0) {
    attackerNotes.push(`Danh hiệu: ${atkTitle.activeTitleNames[0]}`);
  }
  if (defTitle.activeTitleNames.length > 0) {
    defenderNotes.push(`Danh hiệu: ${defTitle.activeTitleNames[0]}`);
  }

  const atkOffenseStat = attacker.weapon.isMagic ? atkStats.mag : atkStats.str;
  const rawDefStat = (attacker.weapon.isMagic ? defStats.res : defStats.def) + defTerrainInfo.defBonus;
  const pierceRatio = Math.min(
    0.8,
    (attacker.weapon.ignoreDefenseRatio ?? 0) + (skill?.ignoreDefenseRatio ?? 0)
  );
  const effectiveDefStat = Math.floor(rawDefStat * (1 - pierceRatio));

  let atkBonusDmg = 0;
  if (skill?.damageBonus) atkBonusDmg += skill.damageBonus;
  if (skill?.scaleByStat && skill.scaleRatio) {
    const statVal =
      skill.scaleByStat === 'def'
        ? Math.max(atkStats.def, atkStats.mag)
        : atkStats[skill.scaleByStat];
    atkBonusDmg += Math.floor(statVal * skill.scaleRatio);
  }
  if (hasSkill(attacker, 'CANTO_AGILITY')) atkBonusDmg += 2;
  if (hasSkill(attacker, 'ARCANE_SURGE') && attacker.weapon.isMagic) atkBonusDmg += 3;
  if (!attacker.weapon.isMagic && attacker.weapon.type !== 'BOW' && weatherInfo.meleeDamageBonus) {
    atkBonusDmg += weatherInfo.meleeDamageBonus;
  }
  if (attacker.weapon.isMagic && weatherInfo.magicDamageBonus) {
    atkBonusDmg += weatherInfo.magicDamageBonus;
  }

  const atkWeaponMight =
    (attacker.weapon.might + atkEq.weaponMight) * (effAtk.effective ? 2 : 1) + atkAdv * 2;
  let attackerDamage = Math.max(0, atkOffenseStat + atkWeaponMight + atkBonusDmg - effectiveDefStat);
  if (skill?.damageMultiplier) {
    attackerDamage = Math.round(attackerDamage * skill.damageMultiplier);
  }

  // Weather elemental damage amplification/dampening
  const atkElMod =
    attacker.weapon.element && weatherInfo.elementDamageBonus?.[attacker.weapon.element]
      ? weatherInfo.elementDamageBonus[attacker.weapon.element]!
      : 0;
  if (atkElMod !== 0 && attackerDamage > 0) {
    attackerDamage = Math.max(1, Math.round(attackerDamage * (1 + atkElMod)));
    attackerNotes.push(
      `Thời tiết (${weatherInfo.name}): ${atkElMod > 0 ? '+' : ''}${Math.round(atkElMod * 100)}% ST`
    );
  } else if (weather !== 'NONE' && (weatherInfo.meleeDamageBonus || weatherInfo.magicDamageBonus)) {
    attackerNotes.push(`Thời tiết: ${weatherInfo.name}`);
  }

  if (!attacker.weapon.isMagic && attacker.weapon.type !== 'BOW' && hasSkill(defender, 'PAVISE')) {
    attackerDamage = Math.max(0, Math.round(attackerDamage * 0.8));
    defenderNotes.push('Khiên Bất Khuất (-20% ST)');
  }
  if ((attacker.weapon.isMagic || attacker.weapon.type === 'BOW') && hasSkill(defender, 'AEGIS')) {
    attackerDamage = Math.max(0, Math.round(attackerDamage * 0.75));
    defenderNotes.push('Hộ Pháp Ma Lực (-25% ST)');
  }

  let atkRawHit =
    attacker.weapon.hit +
    atkEq.weaponHit +
    atkEq.hit +
    atkStats.skl * 2 +
    Math.floor(atkStats.lck / 2) +
    atkAdv * 15 +
    (skill?.hitBonus ?? 0) +
    atkTitle.hit +
    (weatherInfo.allHitMod ?? 0) +
    (attacker.weapon.type === 'BOW' ? weatherInfo.bowHitMod ?? 0 : 0);
  if (hasSkill(attacker, 'ROYAL_CHARM')) atkRawHit += 10;

  let defAvoid =
    defStats.spd * 2 +
    defStats.lck +
    defTerrainInfo.avoBonus +
    defTitle.avoid +
    defEq.avoid +
    (weatherInfo.allAvoidMod ?? 0);
  if (hasSkill(defender, 'ROYAL_CHARM')) defAvoid += 10;
  if (hasSkill(defender, 'SHADOW_STEP')) defAvoid += 15;
  const attackerHit = Math.max(15, Math.min(100, atkRawHit - defAvoid));

  let atkCritBonus =
    (skill?.critBonus ?? 0) +
    atkTitle.crit +
    atkEq.crit +
    atkEq.weaponCrit +
    (weatherInfo.allCritMod ?? 0);
  if (hasSkill(attacker, 'SHADOW_STEP')) atkCritBonus += 15;
  if (hasSkill(attacker, 'WRATH') && attacker.hp < atkStats.maxHp * 0.5) {
    atkCritBonus += 30;
    attackerNotes.push('Cuồng Nộ (+30% CM)');
  }
  const attackerCrit = Math.max(
    0,
    Math.min(95, attacker.weapon.crit + Math.floor(atkStats.skl / 2) + atkCritBonus - defStats.lck)
  );

  const attackerDoubles = !skill && atkStats.spd - defStats.spd >= 4;
  const baseAtkHits = attacker.weapon.brave && !skill ? 2 : 1;
  const attackerStrikeCount = baseAtkHits * (attackerDoubles ? 2 : 1);

  const defenderCanCounter = canUnitAttackAtDistance(defender, distance);
  const defenderFirst =
    defenderCanCounter && hasSkill(defender, 'VANTAGE') && defender.hp < defStats.maxHp * 0.5;
  if (defenderFirst) defenderNotes.push('Phản Kích Tiên Phong');

  let defenderDamage = 0;
  let defenderHit = 0;
  let defenderCrit = 0;
  let defenderDoubles = false;
  let defenderStrikeCount = 0;

  if (defenderCanCounter) {
    const defOffenseStat = defender.weapon.isMagic ? defStats.mag : defStats.str;
    const atkRawDefStat = (defender.weapon.isMagic ? atkStats.res : atkStats.def) + atkTerrainInfo.defBonus;
    const defPierce = defender.weapon.ignoreDefenseRatio ?? 0;
    const atkEffDef = Math.floor(atkRawDefStat * (1 - defPierce));

    let defBonus = 0;
    if (hasSkill(defender, 'ARCANE_SURGE') && defender.weapon.isMagic) defBonus += 3;
    if (!defender.weapon.isMagic && defender.weapon.type !== 'BOW' && weatherInfo.meleeDamageBonus) {
      defBonus += weatherInfo.meleeDamageBonus;
    }
    if (defender.weapon.isMagic && weatherInfo.magicDamageBonus) {
      defBonus += weatherInfo.magicDamageBonus;
    }

    const defWeaponMight =
      (defender.weapon.might + defEq.weaponMight) * (effDef.effective ? 2 : 1) + defAdv * 2;
    defenderDamage = Math.max(0, defOffenseStat + defWeaponMight + defBonus - atkEffDef);

    const defElMod =
      defender.weapon.element && weatherInfo.elementDamageBonus?.[defender.weapon.element]
        ? weatherInfo.elementDamageBonus[defender.weapon.element]!
        : 0;
    if (defElMod !== 0 && defenderDamage > 0) {
      defenderDamage = Math.max(1, Math.round(defenderDamage * (1 + defElMod)));
    }

    if (!defender.weapon.isMagic && defender.weapon.type !== 'BOW' && hasSkill(attacker, 'PAVISE')) {
      defenderDamage = Math.max(0, Math.round(defenderDamage * 0.8));
    }
    if ((defender.weapon.isMagic || defender.weapon.type === 'BOW') && hasSkill(attacker, 'AEGIS')) {
      defenderDamage = Math.max(0, Math.round(defenderDamage * 0.75));
    }

    let defRawHit =
      defender.weapon.hit +
      defEq.weaponHit +
      defEq.hit +
      defStats.skl * 2 +
      Math.floor(defStats.lck / 2) +
      defAdv * 15 +
      defTitle.hit +
      (weatherInfo.allHitMod ?? 0) +
      (defender.weapon.type === 'BOW' ? weatherInfo.bowHitMod ?? 0 : 0);
    if (hasSkill(defender, 'ROYAL_CHARM')) defRawHit += 10;

    let atkAvoid =
      atkStats.spd * 2 +
      atkStats.lck +
      atkTerrainInfo.avoBonus +
      atkTitle.avoid +
      atkEq.avoid +
      (weatherInfo.allAvoidMod ?? 0);
    if (hasSkill(attacker, 'ROYAL_CHARM')) atkAvoid += 10;
    if (hasSkill(attacker, 'DUELIST_BLOW')) atkAvoid += 20;
    if (hasSkill(attacker, 'CANTO_AGILITY')) atkAvoid += 10;
    if (hasSkill(attacker, 'SHADOW_STEP')) atkAvoid += 15;
    defenderHit = Math.max(15, Math.min(100, defRawHit - atkAvoid));

    let defCritBonus =
      defTitle.crit + defEq.crit + defEq.weaponCrit + (weatherInfo.allCritMod ?? 0);
    if (hasSkill(defender, 'SHADOW_STEP')) defCritBonus += 15;
    if (hasSkill(defender, 'WRATH') && defender.hp < defStats.maxHp * 0.5) {
      defCritBonus += 30;
      defenderNotes.push('Cuồng Nộ (+30% CM)');
    }
    defenderCrit = Math.max(
      0,
      Math.min(95, defender.weapon.crit + Math.floor(defStats.skl / 2) + defCritBonus - atkStats.lck)
    );
    defenderDoubles = defStats.spd - atkStats.spd >= 4;
    defenderStrikeCount = defenderDoubles ? 2 : 1;
  }

  return {
    attackerId: attacker.id,
    defenderId: defender.id,
    activeSkillId,
    attackerDamage,
    attackerHit,
    attackerCrit,
    attackerDoubles,
    attackerStrikeCount,
    attackerAdvantage: atkAdv,
    defenderCanCounter,
    defenderFirst,
    defenderDamage,
    defenderHit,
    defenderCrit,
    defenderDoubles,
    defenderStrikeCount,
    defenderAdvantage: defAdv,
    effectiveAttacker: effAtk.effective,
    effectiveDefender: effDef.effective,
    effectiveLabelAttacker: effAtk.label,
    attackerNotes,
    defenderNotes,
  };
}

export function applyExpAndLevelUp(
  unit: Unit,
  expGain: number,
  rng: () => number = Math.random
): { updatedUnit: Unit; levelUp: LevelUpGain | null } {
  if (unit.faction !== 'PLAYER' || expGain <= 0) {
    return { updatedUnit: unit, levelUp: null };
  }

  let newExp = unit.exp + expGain;
  let newLevel = unit.level;
  const newStats = { ...unit.stats };
  let newHp = unit.hp;
  const totalGains: Partial<Record<keyof StatGrowths, number>> = {};
  let leveledUpAny = false;

  const keys: Array<[keyof StatGrowths, keyof Unit['stats']]> = [
    ['hp', 'maxHp'],
    ['str', 'str'],
    ['mag', 'mag'],
    ['skl', 'skl'],
    ['spd', 'spd'],
    ['lck', 'lck'],
    ['def', 'def'],
    ['res', 'res'],
  ];

  while (newExp >= 100 && newLevel < 50) {
    newExp -= 100;
    newLevel += 1;
    leveledUpAny = true;

    let thisLevelGains = 0;
    for (const [growthKey, statKey] of keys) {
      if (rng() * 100 < unit.growths[growthKey]) {
        newStats[statKey] += 1;
        totalGains[growthKey] = (totalGains[growthKey] ?? 0) + 1;
        thisLevelGains += 1;
        if (growthKey === 'hp') newHp += 1;
      }
    }
    if (thisLevelGains === 0) {
      newStats.maxHp += 1;
      newHp += 1;
      totalGains.hp = (totalGains.hp ?? 0) + 1;
      if (unit.weapon.isMagic) {
        newStats.mag += 1;
        totalGains.mag = (totalGains.mag ?? 0) + 1;
      } else {
        newStats.str += 1;
        totalGains.str = (totalGains.str ?? 0) + 1;
      }
    }
  }

  let levelUp: LevelUpGain | null = null;
  if (leveledUpAny) {
    const meta = CLASS_META[unit.classId];
    const readyToPromote = Boolean(meta?.promotion && newLevel >= meta.promotion.minLevel);
    levelUp = {
      unitId: unit.id,
      unitName: unit.name,
      newLevel,
      gains: totalGains,
      readyToPromote,
    };
  }

  return {
    updatedUnit: {
      ...unit,
      level: newLevel,
      exp: newLevel >= 50 ? 0 : Math.min(99, newExp),
      hp: Math.min(newStats.maxHp, newHp),
      stats: newStats,
    },
    levelUp,
  };
}

export function resolveCombat(
  attacker: Unit,
  defender: Unit,
  attackerTerrain: TerrainType,
  defenderTerrain: TerrainType,
  distance: number,
  rng: () => number = Math.random,
  activeSkillId: SkillId | null = null,
  weather: WeatherType = 'NONE',
  commanderTitleId: string | null = null
): CombatResolution {
  const forecast = calculateCombatForecast(
    attacker,
    defender,
    attackerTerrain,
    defenderTerrain,
    distance,
    activeSkillId,
    weather,
    commanderTitleId
  );
  let atkHp = attacker.hp;
  let defHp = defender.hp;
  const strikes: CombatStrike[] = [];

  const activeSkillDef = activeSkillId ? SKILLS[activeSkillId] : null;

  const performStrike = (actor: 'ATTACKER' | 'DEFENDER', isFirstAtkStrike = false) => {
    const hitChance = actor === 'ATTACKER' ? forecast.attackerHit : forecast.defenderHit;
    const critChance = actor === 'ATTACKER' ? forecast.attackerCrit : forecast.defenderCrit;
    const baseDmg = actor === 'ATTACKER' ? forecast.attackerDamage : forecast.defenderDamage;

    const hitRoll = ((rng() + rng()) / 2) * 100;
    const hit = hitRoll < hitChance;
    const crit = hit && rng() * 100 < critChance;
    const damage = hit ? baseDmg * (crit ? 3 : 1) : 0;

    let healedAmount = 0;
    if (actor === 'ATTACKER') {
      const actualDmg = Math.min(defHp, damage);
      defHp = Math.max(0, defHp - damage);
      const drainRatio = Math.max(
        attacker.weapon.drainRatio ?? 0,
        activeSkillDef?.drainRatio ?? 0
      );
      const atkMaxHp = getEffectiveUnitStats(attacker, commanderTitleId).maxHp;
      if (hit && drainRatio > 0 && actualDmg > 0) {
        healedAmount = Math.max(1, Math.floor(actualDmg * drainRatio));
        atkHp = Math.min(atkMaxHp, atkHp + healedAmount);
      }
      if (defHp <= 0 && hasSkill(attacker, 'LIFETAKER')) {
        healedAmount += 6;
        atkHp = Math.min(atkMaxHp, atkHp + 6);
      }
      strikes.push({
        actor,
        hit,
        crit,
        damage,
        healedAmount: healedAmount > 0 ? healedAmount : undefined,
        skillTriggered: isFirstAtkStrike && activeSkillId ? activeSkillId : undefined,
        targetHpAfter: defHp,
        actorHpAfter: atkHp,
      });
    } else {
      const actualDmg = Math.min(atkHp, damage);
      atkHp = Math.max(0, atkHp - damage);
      const drainRatio = defender.weapon.drainRatio ?? 0;
      const defMaxHp = getEffectiveUnitStats(defender, commanderTitleId).maxHp;
      if (hit && drainRatio > 0 && actualDmg > 0) {
        healedAmount = Math.max(1, Math.floor(actualDmg * drainRatio));
        defHp = Math.min(defMaxHp, defHp + healedAmount);
      }
      if (atkHp <= 0 && hasSkill(defender, 'LIFETAKER')) {
        healedAmount += 6;
        defHp = Math.min(defMaxHp, defHp + 6);
      }
      strikes.push({
        actor,
        hit,
        crit,
        damage,
        healedAmount: healedAmount > 0 ? healedAmount : undefined,
        targetHpAfter: atkHp,
        actorHpAfter: defHp,
      });
    }
  };

  if (forecast.defenderFirst && defHp > 0) {
    performStrike('DEFENDER');
  }

  if (atkHp > 0 && defHp > 0) {
    performStrike('ATTACKER', true);
    if (attacker.weapon.brave && !activeSkillId && atkHp > 0 && defHp > 0) {
      performStrike('ATTACKER', false);
    }
  }

  if (!forecast.defenderFirst && atkHp > 0 && defHp > 0 && forecast.defenderCanCounter) {
    performStrike('DEFENDER');
  }

  if (atkHp > 0 && defHp > 0) {
    if (forecast.attackerDoubles) {
      performStrike('ATTACKER', false);
      if (attacker.weapon.brave && !activeSkillId && atkHp > 0 && defHp > 0) {
        performStrike('ATTACKER', false);
      }
    } else if (forecast.defenderCanCounter && forecast.defenderDoubles) {
      performStrike('DEFENDER');
    }
  }

  let expGained = 0;
  let levelUp: LevelUpGain | null = null;
  const playerUnit = attacker.faction === 'PLAYER' ? attacker : defender.faction === 'PLAYER' ? defender : null;
  const enemyUnit = attacker.faction === 'ENEMY' ? attacker : defender.faction === 'ENEMY' ? defender : null;

  if (playerUnit && enemyUnit) {
    const playerSurvived = playerUnit.id === attacker.id ? atkHp > 0 : defHp > 0;
    const enemyDied = enemyUnit.id === defender.id ? defHp <= 0 : atkHp <= 0;
    const dealtDamage =
      playerUnit.id === attacker.id
        ? defender.hp - defHp > 0
        : attacker.hp - atkHp > 0;
    if (playerSurvived) {
      expGained = computeCombatExpGain(
        playerUnit.level,
        enemyUnit.level,
        dealtDamage,
        enemyDied,
        Boolean(enemyUnit.isBoss),
        Boolean(enemyUnit.isElite)
      );
      const res = applyExpAndLevelUp(
        { ...playerUnit, hp: playerUnit.id === attacker.id ? atkHp : defHp },
        expGained,
        rng
      );
      levelUp = res.levelUp;
    }
  }

  return {
    forecast,
    strikes,
    attackerStartHp: attacker.hp,
    defenderStartHp: defender.hp,
    attackerEndHp: atkHp,
    defenderEndHp: defHp,
    attackerDied: atkHp <= 0,
    defenderDied: defHp <= 0,
    expGained,
    levelUp,
  };
}

export function getHealAmount(
  healer: Unit,
  weather: WeatherType = 'NONE',
  commanderTitleId: string | null = null
): number {
  const effStats = getEffectiveUnitStats(healer, commanderTitleId);
  const weatherInfo = WEATHER_DATA[weather] ?? WEATHER_DATA.NONE;
  const baseHeal = (healer.weapon.healPower ?? 12) + Math.floor(effStats.mag * 0.65);
  return Math.max(1, Math.round(baseHeal * (1 + (weatherInfo.healMod ?? 0))));
}

export function getSanctuaryHealTargets(caster: Unit, allUnits: Unit[]): Unit[] {
  return allUnits.filter(
    (u) =>
      u.faction === caster.faction &&
      u.hp > 0 &&
      u.hp < getEffectiveUnitStats(u).maxHp &&
      manhattan(caster, u) <= 2
  );
}

export function getReachableTiles(
  unit: Unit,
  grid: TerrainType[][],
  allUnits: Unit[]
): Map<string, number> {
  const height = grid.length;
  const width = grid[0].length;
  const bestCost = new Map<string, number>();
  const validDestinations = new Map<string, number>();

  const unitAt = new Map<string, Unit>();
  for (const u of allUnits) {
    if (u.hp > 0 && u.id !== unit.id) {
      unitAt.set(`${u.x},${u.y}`, u);
    }
  }

  const startKey = `${unit.x},${unit.y}`;
  bestCost.set(startKey, 0);
  validDestinations.set(startKey, 0);

  const queue: Array<{ x: number; y: number; cost: number }> = [{ x: unit.x, y: unit.y, cost: 0 }];
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const cur = queue.shift()!;
    if (cur.cost > (bestCost.get(`${cur.x},${cur.y}`) ?? Infinity)) continue;

    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

      const terrainCost = TERRAIN_DATA[grid[ny][nx]].moveCost[unit.moveType];
      if (terrainCost >= 99) continue;

      const nKey = `${nx},${ny}`;
      const blocker = unitAt.get(nKey);
      if (blocker && blocker.faction !== unit.faction) continue;

      const nextCost = cur.cost + terrainCost;
      if (nextCost > unit.stats.mov) continue;

      if (nextCost < (bestCost.get(nKey) ?? Infinity)) {
        bestCost.set(nKey, nextCost);
        queue.push({ x: nx, y: ny, cost: nextCost });
        if (!blocker) {
          validDestinations.set(nKey, nextCost);
        }
      }
    }
  }

  return validDestinations;
}

export function getAttackableTilesFromPos(
  pos: TileCoord,
  unit: Unit,
  width: number,
  height: number,
  activeSkillId?: SkillId | null
): TileCoord[] {
  const results: TileCoord[] = [];
  const minR = unit.weapon.minRange;
  const maxR = unit.weapon.maxRange + (activeSkillId ? SKILLS[activeSkillId]?.rangeBonus ?? 0 : 0);

  for (let dy = -maxR; dy <= maxR; dy++) {
    for (let dx = -maxR; dx <= maxR; dx++) {
      const dist = Math.abs(dx) + Math.abs(dy);
      if (dist < minR || dist > maxR) continue;
      const nx = pos.x + dx;
      const ny = pos.y + dy;
      if (nx >= 0 && ny >= 0 && nx < width && ny < height) {
        results.push({ x: nx, y: ny });
      }
    }
  }
  return results;
}

export function getTotalActionRangeTiles(
  unit: Unit,
  reachable: Map<string, number>,
  width: number,
  height: number
): Set<string> {
  const actionTiles = new Set<string>();
  for (const key of reachable.keys()) {
    const [xs, ys] = key.split(',');
    const tiles = getAttackableTilesFromPos({ x: Number(xs), y: Number(ys) }, unit, width, height);
    for (const t of tiles) {
      const tKey = `${t.x},${t.y}`;
      if (!reachable.has(tKey)) {
        actionTiles.add(tKey);
      }
    }
  }
  return actionTiles;
}

export function computeEnemyDangerZone(
  grid: TerrainType[][],
  allUnits: Unit[]
): Set<string> {
  const height = grid.length;
  const width = grid[0].length;
  const danger = new Set<string>();

  for (const unit of allUnits) {
    if (unit.faction !== 'ENEMY' || unit.hp <= 0 || unit.weapon.type === 'STAFF') continue;
    const reachable = getReachableTiles(unit, grid, allUnits);
    for (const key of reachable.keys()) {
      const [xs, ys] = key.split(',');
      const attackTiles = getAttackableTilesFromPos({ x: Number(xs), y: Number(ys) }, unit, width, height);
      for (const t of attackTiles) {
        danger.add(`${t.x},${t.y}`);
      }
    }
  }
  return danger;
}

export function findPath(
  unit: Unit,
  dest: TileCoord,
  grid: TerrainType[][],
  allUnits: Unit[]
): TileCoord[] {
  if (unit.x === dest.x && unit.y === dest.y) return [{ x: unit.x, y: unit.y }];

  const height = grid.length;
  const width = grid[0].length;
  const unitAt = new Map<string, Unit>();
  for (const u of allUnits) {
    if (u.hp > 0 && u.id !== unit.id) {
      unitAt.set(`${u.x},${u.y}`, u);
    }
  }

  const startKey = `${unit.x},${unit.y}`;
  const destKey = `${dest.x},${dest.y}`;

  const open: Array<{ x: number; y: number; g: number; f: number }> = [
    { x: unit.x, y: unit.y, g: 0, f: manhattan({ x: unit.x, y: unit.y }, dest) },
  ];
  const cameFrom = new Map<string, TileCoord>();
  const gScore = new Map<string, number>([[startKey, 0]]);
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const cur = open.shift()!;
    const curKey = `${cur.x},${cur.y}`;

    if (curKey === destKey) {
      const path: TileCoord[] = [];
      let step: TileCoord | undefined = dest;
      while (step) {
        path.unshift(step);
        step = cameFrom.get(`${step.x},${step.y}`);
      }
      return path;
    }

    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

      const tCost = TERRAIN_DATA[grid[ny][nx]].moveCost[unit.moveType];
      if (tCost >= 99) continue;

      const nKey = `${nx},${ny}`;
      const blocker = unitAt.get(nKey);
      if (blocker && blocker.faction !== unit.faction) continue;

      const tentativeG = cur.g + tCost;
      if (tentativeG > unit.stats.mov) continue;

      if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
        cameFrom.set(nKey, { x: cur.x, y: cur.y });
        gScore.set(nKey, tentativeG);
        open.push({ x: nx, y: ny, g: tentativeG, f: tentativeG + manhattan({ x: nx, y: ny }, dest) });
      }
    }
  }

  return [{ x: unit.x, y: unit.y }];
}

/**
 * Balanced Rubber-Band EXP curve:
 * - Rewards under-leveled recruits catching up (+6 EXP per level below target)
 * - Softly tapers EXP for over-leveled juggernauts (>= 3 levels above target) so no single hero hogs all growth
 * - Grants distinct tactical bonuses for defeating Elite Sub-Commanders and Chapter Bosses
 */
export function computeCombatExpGain(
  playerLevel: number,
  enemyLevel: number,
  dealtDamage: boolean,
  defeatedEnemy: boolean,
  enemyIsBoss = false,
  enemyIsElite = false
): number {
  const diff = enemyLevel - playerLevel;
  if (!dealtDamage && !defeatedEnemy) {
    return Math.max(5, Math.min(14, 8 + diff));
  }

  if (defeatedEnemy) {
    const baseKill = 42;
    const scaled =
      diff >= 0
        ? baseKill + diff * 6
        : Math.round(baseKill * Math.pow(0.8, Math.min(8, Math.abs(diff))));
    const rankBonus = enemyIsBoss ? 30 : enemyIsElite ? 16 : 0;
    return Math.max(12, Math.min(95, scaled + rankBonus));
  }

  const baseChip = 18;
  const scaledChip =
    diff >= 0
      ? baseChip + diff * 3
      : Math.round(baseChip * Math.pow(0.82, Math.min(8, Math.abs(diff))));
  const rankChip = enemyIsBoss ? 8 : enemyIsElite ? 5 : 0;
  return Math.max(6, Math.min(42, scaledChip + rankChip));
}

/**
 * Computes an honest composite Combat Power score for pre-battle force comparison.
 */
export function computeUnitCombatPower(
  unit: Unit,
  commanderTitleId?: string | null
): number {
  const eff = getEffectiveUnitStats(unit, commanderTitleId);
  const offense = unit.weapon.type === 'STAFF'
    ? eff.mag * 2.1 + (unit.weapon.healPower ?? 12) * 1.4
    : (unit.weapon.isMagic ? eff.mag : eff.str) * 2.1 + unit.weapon.might * 1.5;
  const bulk = eff.maxHp * 1.15 + (eff.def + eff.res) * 1.65;
  const tempo = eff.spd * 1.5 + eff.skl * 1.1 + eff.lck * 0.6 + eff.mov * 3.2;
  const skillScore = unit.skills.length * 8 + (unit.tier - 1) * 18 + (unit.isBoss ? 32 : unit.isElite ? 16 : 0);
  return Math.max(20, Math.round(offense + bulk + tempo + skillScore));
}

export interface EnemyAIAction {
  moveTo: TileCoord;
  targetId: string | null;
  healTargetId?: string | null;
}

export function decideEnemyAction(
  enemy: Unit,
  grid: TerrainType[][],
  allUnits: Unit[]
): EnemyAIAction {
  const players = allUnits.filter((u) => u.faction === 'PLAYER' && u.hp > 0);
  if (players.length === 0) {
    return { moveTo: { x: enemy.x, y: enemy.y }, targetId: null };
  }

  if (enemy.aiPolicy === 'BOSS') {
    let bestTarget: Unit | null = null;
    let bestScore = -Infinity;
    for (const p of players) {
      const dist = manhattan(enemy, p);
      if (!canUnitAttackAtDistance(enemy, dist)) continue;
      const forecast = calculateCombatForecast(enemy, p, grid[enemy.y][enemy.x], grid[p.y][p.x], dist);
      const score =
        forecast.attackerDamage * forecast.attackerStrikeCount +
        (forecast.attackerDamage >= p.hp ? 40 : 0);
      if (score > bestScore) {
        bestScore = score;
        bestTarget = p;
      }
    }
    return { moveTo: { x: enemy.x, y: enemy.y }, targetId: bestTarget?.id ?? null };
  }

  const reachable = getReachableTiles(enemy, grid, allUnits);
  const candidatePositions: TileCoord[] = Array.from(reachable.keys()).map((k) => {
    const [xs, ys] = k.split(',');
    return { x: Number(xs), y: Number(ys) };
  });

  // Battlefield Medic AI ('HEALER'): prioritize healing wounded enemy allies while staying out of player melee reach
  if (enemy.aiPolicy === 'HEALER' || enemy.weapon.type === 'STAFF') {
    const enemyAllies = allUnits.filter(
      (u) => u.faction === 'ENEMY' && u.hp > 0 && u.id !== enemy.id
    );
    const woundedAllies = enemyAllies.filter(
      (u) => u.hp < getEffectiveUnitStats(u).maxHp
    );

    if (woundedAllies.length > 0) {
      let bestHeal: { moveTo: TileCoord; healTargetId: string; score: number } | null = null;
      for (const pos of candidatePositions) {
        const nearestPlayerDist = Math.min(...players.map((p) => manhattan(pos, p)));
        const safetyScore = Math.min(6, nearestPlayerDist) * 3 + TERRAIN_DATA[grid[pos.y][pos.x]].defBonus * 2;
        for (const ally of woundedAllies) {
          const dist = manhattan(pos, ally);
          if (!canUnitHealAtDistance(enemy, dist)) continue;
          const allyMax = getEffectiveUnitStats(ally).maxHp;
          const missingRatio = (allyMax - ally.hp) / Math.max(1, allyMax);
          const priorityBonus = ally.isBoss ? 45 : ally.isElite ? 24 : 10;
          const score = missingRatio * 65 + priorityBonus + safetyScore;
          if (!bestHeal || score > bestHeal.score) {
            bestHeal = { moveTo: pos, healTargetId: ally.id, score };
          }
        }
      }
      if (bestHeal) {
        return {
          moveTo: bestHeal.moveTo,
          targetId: null,
          healTargetId: bestHeal.healTargetId,
        };
      }
    }

    // No wounded ally in staff reach: shadow safely 2–3 tiles behind the frontline/Boss
    const anchor =
      enemyAllies.find((u) => u.isElite) ??
      enemyAllies.find((u) => u.aiPolicy !== 'HEALER') ??
      enemyAllies[0];
    if (anchor) {
      let bestEscortPos = { x: enemy.x, y: enemy.y };
      let bestEscortScore = -Infinity;
      for (const pos of candidatePositions) {
        const distToAnchor = manhattan(pos, anchor);
        const nearestPlayerDist = Math.min(...players.map((p) => manhattan(pos, p)));
        const score =
          -Math.abs(distToAnchor - 2) * 5 +
          Math.min(7, nearestPlayerDist) * 4 +
          (pos.x >= anchor.x ? 4 : 0) +
          TERRAIN_DATA[grid[pos.y][pos.x]].defBonus * 2;
        if (score > bestEscortScore) {
          bestEscortScore = score;
          bestEscortPos = pos;
        }
      }
      return { moveTo: bestEscortPos, targetId: null, healTargetId: null };
    }
    return { moveTo: { x: enemy.x, y: enemy.y }, targetId: null, healTargetId: null };
  }

  let bestAttack: { moveTo: TileCoord; targetId: string; score: number } | null = null;

  for (const pos of candidatePositions) {
    const terrain = grid[pos.y][pos.x];
    const terrainDef = TERRAIN_DATA[terrain].defBonus;
    for (const p of players) {
      const dist = manhattan(pos, p);
      if (!canUnitAttackAtDistance(enemy, dist)) continue;

      const forecast = calculateCombatForecast(enemy, p, terrain, grid[p.y][p.x], dist);
      const expectedDmg =
        forecast.attackerDamage * (forecast.attackerDoubles ? 1.85 : 1) * (forecast.attackerHit / 100);
      const expectedTaken = forecast.defenderCanCounter
        ? forecast.defenderDamage * (forecast.defenderDoubles ? 1.85 : 1) * (forecast.defenderHit / 100)
        : 0;

      let score = expectedDmg * 2.2 - expectedTaken * 1.1 + terrainDef * 2;
      if (forecast.attackerDamage >= p.hp) score += 35;
      if (forecast.attackerAdvantage > 0) score += 6;

      if (enemy.aiPolicy === 'KITER') {
        if (!forecast.defenderCanCounter) score += 18;
        score += dist * 3;
      } else if (enemy.aiPolicy === 'FLANKER') {
        score += Math.max(0, 12 - p.stats.def) * 1.5;
        if (p.weapon.type === 'STAFF' || p.weapon.type === 'BOW' || p.weapon.type === 'TOME') score += 10;
      }

      if (!bestAttack || score > bestAttack.score) {
        bestAttack = { moveTo: pos, targetId: p.id, score };
      }
    }
  }

  if (bestAttack) {
    return { moveTo: bestAttack.moveTo, targetId: bestAttack.targetId };
  }

  if (enemy.aiPolicy === 'GUARDIAN') {
    const nearestDist = Math.min(...players.map((p) => manhattan(enemy, p)));
    if (nearestDist > enemy.stats.mov + 3) {
      return { moveTo: { x: enemy.x, y: enemy.y }, targetId: null };
    }
  }

  let focusPlayer = players[0];
  let bestFocusMetric = Infinity;
  for (const p of players) {
    const dist = manhattan(enemy, p);
    const metric = enemy.aiPolicy === 'FLANKER' ? dist * 2 + p.stats.def : dist;
    if (metric < bestFocusMetric) {
      bestFocusMetric = metric;
      focusPlayer = p;
    }
  }

  let bestMove = { x: enemy.x, y: enemy.y };
  let bestMoveScore = -Infinity;

  for (const pos of candidatePositions) {
    const dist = manhattan(pos, focusPlayer);
    const terrainBonus = TERRAIN_DATA[grid[pos.y][pos.x]].defBonus * 1.5;
    let moveScore = -dist * 4 + terrainBonus;

    if (enemy.aiPolicy === 'KITER') {
      const idealDist = Math.max(2, enemy.weapon.maxRange + 1);
      moveScore = -Math.abs(dist - idealDist) * 4 + terrainBonus;
    }

    if (moveScore > bestMoveScore) {
      bestMoveScore = moveScore;
      bestMove = pos;
    }
  }

  return { moveTo: bestMove, targetId: null };
}

export function checkBattleOutcome(
  units: Unit[],
  meta: CampaignMapMeta,
  turn: number,
  throneSeized: boolean
): BattleOutcome {
  const alivePlayers = units.filter((u) => u.faction === 'PLAYER' && u.hp > 0);
  const aliveEnemies = units.filter((u) => u.faction === 'ENEMY' && u.hp > 0);

  const lordAlive = alivePlayers.some((u) => u.isLord);
  if (!lordAlive || alivePlayers.length === 0) {
    return { status: 'DEFEAT', reason: 'Hoàng tử Kaelen đã gục ngã trên chiến trường.' };
  }

  if (meta.objective === 'SEIZE' && throneSeized) {
    return { status: 'VICTORY', reason: 'Hoàng tử Kaelen đã chiếm giữ Cứ Điểm Vương Ấn!' };
  }

  if (meta.objective === 'DEFEAT_BOSS') {
    const bossAlive = aliveEnemies.some((u) => u.isBoss);
    if (!bossAlive) {
      return { status: 'VICTORY', reason: `Đã hạ gục chỉ huy ${meta.bossName}!` };
    }
  }

  if (meta.objective === 'SURVIVE' && turn > (meta.surviveTurns ?? 6)) {
    return { status: 'VICTORY', reason: `Đã phòng thủ thành công suốt ${meta.surviveTurns ?? 6} lượt!` };
  }

  if (aliveEnemies.length === 0) {
    return { status: 'VICTORY', reason: 'Toàn bộ quân địch trên chiến trường đã bị tiêu diệt!' };
  }

  return { status: 'ONGOING', reason: '' };
}

// ============================================================================
// PER-UNIT CARRY CAPACITY, CONVOY LOCKDOWN, PROXIMITY TRADING & LOOT DROPS
// ============================================================================

/**
 * Maximum total items a single character can carry in their personal pack
 * (Spare Unequipped Weapons + Potions + Personal Items/Gems + Unequipped Spare Armor).
 * Currently equipped gear worn on the hero — the active main weapon (`unit.weapon`) AND
 * all 5 worn armor slots (`HELMET` Mũ, `ARMOR` Giáp, `GAUNTLETS` Giáp tay, `GREAVES` Giáp chân, `BOOTS` Giày) —
 * NEVER consume personal pack slots.
 */
export const MAX_UNIT_CARRY_SLOTS = 6;
export const MAX_UNIT_INVENTORY = MAX_UNIT_CARRY_SLOTS + 1;
export const MAX_UNIT_POTIONS = MAX_UNIT_CARRY_SLOTS;

export const MIN_BATTLE_LOOT_DROP_CHANCE = 0.0005; // 0.05%
export const MAX_BATTLE_LOOT_DROP_CHANCE = 0.001; // 0.10% (0.1%)

export function getSpareWeaponCount(
  unit: Pick<Unit, 'weapon' | 'inventory'>
): number {
  if (!unit.weapon) return unit.inventory.length;
  let skippedEquipped = false;
  let count = 0;
  for (const w of unit.inventory) {
    if (!skippedEquipped && w.id === unit.weapon.id) {
      skippedEquipped = true;
      continue;
    }
    count += 1;
  }
  return count;
}

export function getUnitCarryCount(
  unit: Pick<Unit, 'weapon' | 'inventory' | 'potions' | 'carriedItems' | 'carriedArmorUids'>
): number {
  return (
    getSpareWeaponCount(unit) +
    Math.max(0, unit.potions) +
    (unit.carriedItems?.length ?? 0) +
    (unit.carriedArmorUids?.length ?? 0)
  );
}

export function isUnitCarryFull(
  unit: Pick<Unit, 'weapon' | 'inventory' | 'potions' | 'carriedItems' | 'carriedArmorUids'>
): boolean {
  return getUnitCarryCount(unit) >= MAX_UNIT_CARRY_SLOTS;
}

export function getUnitCarriedItemCounts(
  unit: Pick<Unit, 'carriedItems'>
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const id of unit.carriedItems ?? []) {
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

/**
 * In active tactical combat, two allies must be alive, on the PLAYER faction,
 * and standing orthogonally adjacent (Manhattan distance === 1) to trade gear.
 */
export function areUnitsAdjacentForTrade(unitA: Unit, unitB: Unit): boolean {
  if (unitA.id === unitB.id) return false;
  if (unitA.faction !== 'PLAYER' || unitB.faction !== 'PLAYER') return false;
  if (unitA.hp <= 0 || unitB.hp <= 0) return false;
  return manhattan(unitA, unitB) === 1;
}

export function getAdjacentTradePartners(unit: Unit, allUnits: Unit[]): Unit[] {
  if (unit.faction !== 'PLAYER' || unit.hp <= 0) return [];
  return allUnits.filter((other) => areUnitsAdjacentForTrade(unit, other));
}

/**
 * Strict Convoy Rule:
 * - Kho Quân Đoàn is a separate rear-base storehouse.
 * - During ANY battle (`isOutOfBattle === false`), NO ONE — NOT EVEN Lord Kaelen (`isLord`) —
 *   is allowed to withdraw from or deposit into Kho Quân Đoàn!
 * - Only when the battle ends / outside of battle (`isOutOfBattle === true`) can heroes use Kho Quân Đoàn.
 */
export function canUnitAccessConvoy(
  _unit: Unit,
  _deployedUnits: Unit[],
  isOutOfBattle: boolean
): boolean {
  return Boolean(isOutOfBattle);
}

/**
 * Validates whether `recipient` is allowed to equip an armor piece `armorUid`
 * currently worn/carried by `owner` (or sitting unowned in Kho Quân Đoàn).
 */
export function canUnitTakeEquippedArmorFromOwner(
  recipient: Unit,
  owner: Unit | undefined,
  deployedUnits: Unit[],
  isOutOfBattle: boolean,
  armorUid?: string
): { allowed: boolean; distance?: number; reason?: string } {
  if (owner && owner.id === recipient.id) {
    return { allowed: true, distance: 0 };
  }
  if (armorUid && recipient.carriedArmorUids?.includes(armorUid)) {
    return { allowed: true, distance: 0 };
  }
  if (isOutOfBattle) {
    return { allowed: true, distance: 0 };
  }

  const liveRecipient = deployedUnits.find(
    (u) => u.id === recipient.id && u.faction === 'PLAYER' && u.hp > 0
  );
  if (!liveRecipient) {
    return {
      allowed: false,
      reason: 'Nhân vật dự bị ở hậu phương không thể đổi trang bị khi trận đánh đang diễn ra.',
    };
  }

  if (armorUid && liveRecipient.carriedArmorUids?.includes(armorUid)) {
    return { allowed: true, distance: 0 };
  }

  if (!owner) {
    return {
      allowed: false,
      reason:
        'Kho Quân Đoàn đã khóa trong trận — không ai (kể cả Chủ Tướng) được lấy trang bị từ Kho cho tới khi hết trận.',
    };
  }

  const liveOwner = deployedUnits.find(
    (u) => u.id === owner.id && u.faction === 'PLAYER' && u.hp > 0
  );
  if (!liveOwner) {
    return {
      allowed: false,
      reason: `${owner.name} đang ở doanh trại hậu phương, không thể lấy trang bị từ xa.`,
    };
  }

  const dist = manhattan(liveRecipient, liveOwner);
  if (dist > 1) {
    return {
      allowed: false,
      distance: dist,
      reason: `Cách ${owner.name} ${dist} ô — phải đứng sát cạnh (1 ô) mới trao đổi hoặc lấy đồ được.`,
    };
  }

  return { allowed: true, distance: dist };
}

function clampUnitHpAfterGearChange(
  prevUnit: Unit,
  nextUnit: Unit,
  commanderTitleId?: string | null
): Unit {
  const oldMax = getEffectiveUnitStats(prevUnit, commanderTitleId).maxHp;
  const newMax = getEffectiveUnitStats(nextUnit, commanderTitleId).maxHp;
  const hpDelta = newMax - oldMax;
  return {
    ...nextUnit,
    hp: Math.max(1, Math.min(newMax, prevUnit.hp + Math.max(0, hpDelta))),
  };
}

/**
 * Equips a weapon already carried in `unit.inventory` without touching Kho Quân Đoàn.
 */
export function equipPersonalWeapon(
  unit: Unit,
  weaponId: string,
  weaponForges: Record<string, WeaponForgeState> = {}
): Unit | null {
  const match = unit.inventory.find((w) => w.id === weaponId);
  if (!match || !canUnitEquipWeapon(unit, match)) return null;
  return {
    ...unit,
    weapon: match,
    weaponForge: weaponForges[match.id],
  };
}

/**
 * Transfers or swaps a weapon between `fromUnit` and `toUnit`.
 * - Enforces adjacency (`manhattan === 1`) unless `isFreeLogistics` is true.
 * - Enforces per-unit carry limit (`MAX_UNIT_CARRY_SLOTS`) on 1-way handoff.
 * - Guarantees `fromUnit` (and `toUnit` on swap) always retains at least 1 equippable weapon.
 */
export function tradeWeaponBetweenUnits(
  fromUnit: Unit,
  toUnit: Unit,
  fromWeaponIndex: number,
  options?: {
    swapToWeaponIndex?: number;
    weaponForges?: Record<string, WeaponForgeState>;
    isFreeLogistics?: boolean;
  }
): { fromUnit: Unit; toUnit: Unit; message: string } | null {
  const isFree = options?.isFreeLogistics ?? false;
  const weaponForges = options?.weaponForges ?? {};
  const swapIdx = options?.swapToWeaponIndex;

  if (!isFree && !areUnitsAdjacentForTrade(fromUnit, toUnit)) {
    return null;
  }

  const givenWeapon = fromUnit.inventory[fromWeaponIndex];
  if (!givenWeapon) return null;

  // Case 1: 1-for-1 Swap between fromUnit and toUnit (carry counts stay unchanged!)
  if (swapIdx !== undefined) {
    const swappedBack = toUnit.inventory[swapIdx];
    if (!swappedBack) return null;
    if (givenWeapon.id === swappedBack.id) return null;

    if (fromUnit.inventory.some((w, idx) => idx !== fromWeaponIndex && w.id === swappedBack.id)) {
      return null;
    }
    if (toUnit.inventory.some((w, idx) => idx !== swapIdx && w.id === givenWeapon.id)) {
      return null;
    }

    const nextFromInv = fromUnit.inventory.map((w, idx) =>
      idx === fromWeaponIndex ? swappedBack : w
    );
    const nextToInv = toUnit.inventory.map((w, idx) => (idx === swapIdx ? givenWeapon : w));

    const fromEquippable = nextFromInv.filter((w) => canUnitEquipWeapon(fromUnit, w));
    const toEquippable = nextToInv.filter((w) => canUnitEquipWeapon(toUnit, w));
    if (fromEquippable.length === 0 || toEquippable.length === 0) {
      return null;
    }

    const nextFromActive =
      fromUnit.weapon.id === givenWeapon.id
        ? canUnitEquipWeapon(fromUnit, swappedBack)
          ? swappedBack
          : fromEquippable[0]
        : fromUnit.weapon;

    const nextToActive =
      toUnit.weapon.id === swappedBack.id
        ? canUnitEquipWeapon(toUnit, givenWeapon)
          ? givenWeapon
          : toEquippable[0]
        : toUnit.weapon;

    return {
      fromUnit: {
        ...fromUnit,
        inventory: nextFromInv,
        weapon: nextFromActive,
        weaponForge: weaponForges[nextFromActive.id],
      },
      toUnit: {
        ...toUnit,
        inventory: nextToInv,
        weapon: nextToActive,
        weaponForge: weaponForges[nextToActive.id],
      },
      message: `${fromUnit.name} và ${toUnit.name} đã hoán đổi ${givenWeapon.name} ⇄ ${swappedBack.name}.`,
    };
  }

  // Case 2: 1-way handoff from fromUnit to toUnit (requires room in toUnit's 6-slot pack!)
  if (isUnitCarryFull(toUnit)) return null;
  if (toUnit.inventory.some((w) => w.id === givenWeapon.id)) return null;

  const nextFromInv = fromUnit.inventory.filter((_, idx) => idx !== fromWeaponIndex);
  const fromEquippable = nextFromInv.filter((w) => canUnitEquipWeapon(fromUnit, w));
  if (fromEquippable.length === 0) {
    return null;
  }

  const nextFromActive =
    fromUnit.weapon.id === givenWeapon.id ? fromEquippable[0] : fromUnit.weapon;
  const nextToInv = [...toUnit.inventory, givenWeapon];

  return {
    fromUnit: {
      ...fromUnit,
      inventory: nextFromInv,
      weapon: nextFromActive,
      weaponForge: weaponForges[nextFromActive.id],
    },
    toUnit: {
      ...toUnit,
      inventory: nextToInv,
    },
    message: `${fromUnit.name} đã trao ${givenWeapon.name} cho ${toUnit.name}.`,
  };
}

/**
 * Transfers or swaps an equipped Armor piece (`HELMET`, `ARMOR`, `GAUNTLETS`, `GREAVES`, `BOOTS`)
 * directly between two units, enforcing adjacency (`manhattan === 1`) during active combat.
 */
export function tradeArmorSlotBetweenUnits(
  unitA: Unit,
  unitB: Unit,
  slot: ArmorSlot,
  options?: {
    commanderTitleId?: string | null;
    isFreeLogistics?: boolean;
  }
): { unitA: Unit; unitB: Unit; message: string } | null {
  if (!ARMOR_SLOTS.includes(slot)) return null;
  const isFree = options?.isFreeLogistics ?? false;
  if (!isFree && !areUnitsAdjacentForTrade(unitA, unitB)) {
    return null;
  }

  const eqA: EquipmentInstance | undefined = unitA.equipment?.[slot];
  const eqB: EquipmentInstance | undefined = unitB.equipment?.[slot];
  if (!eqA && !eqB) return null;

  const nextEquipA: Partial<Record<ArmorSlot, EquipmentInstance>> = { ...(unitA.equipment ?? {}) };
  const nextEquipB: Partial<Record<ArmorSlot, EquipmentInstance>> = { ...(unitB.equipment ?? {}) };

  if (eqB) nextEquipA[slot] = eqB;
  else delete nextEquipA[slot];

  if (eqA) nextEquipB[slot] = eqA;
  else delete nextEquipB[slot];

  const updatedA = clampUnitHpAfterGearChange(
    unitA,
    { ...unitA, equipment: nextEquipA },
    options?.commanderTitleId
  );
  const updatedB = clampUnitHpAfterGearChange(
    unitB,
    { ...unitB, equipment: nextEquipB },
    options?.commanderTitleId
  );

  const nameA = eqA ? ARMOR_TEMPLATES[eqA.templateId]?.name ?? ARMOR_SLOT_META[slot].label : null;
  const nameB = eqB ? ARMOR_TEMPLATES[eqB.templateId]?.name ?? ARMOR_SLOT_META[slot].label : null;
  const message =
    nameA && nameB
      ? `${unitA.name} và ${unitB.name} đã đổi ${nameA} ⇄ ${nameB}.`
      : nameA
      ? `${unitA.name} đã trao ${nameA} cho ${unitB.name}.`
      : `${unitB.name} đã trao ${nameB} cho ${unitA.name}.`;

  return { unitA: updatedA, unitB: updatedB, message };
}

/**
 * Transfers 1 personal healing potion (`unit.potions`) from `fromUnit` to `toUnit`,
 * enforcing adjacency (`manhattan === 1`) during combat and `MAX_UNIT_CARRY_SLOTS`.
 */
export function tradePotionBetweenUnits(
  fromUnit: Unit,
  toUnit: Unit,
  isFreeLogistics = false
): { fromUnit: Unit; toUnit: Unit; message: string } | null {
  if (!isFreeLogistics && !areUnitsAdjacentForTrade(fromUnit, toUnit)) {
    return null;
  }
  if (fromUnit.potions <= 0 || isUnitCarryFull(toUnit)) {
    return null;
  }
  return {
    fromUnit: { ...fromUnit, potions: fromUnit.potions - 1 },
    toUnit: { ...toUnit, potions: toUnit.potions + 1 },
    message: `${fromUnit.name} đã đưa 1 Bình Thuốc cho ${toUnit.name}.`,
  };
}

/**
 * Transfers 1 carried personal item/gem (`unit.carriedItems`) from `fromUnit` to `toUnit`.
 */
export function tradePersonalItemBetweenUnits(
  fromUnit: Unit,
  toUnit: Unit,
  itemIndex: number,
  isFreeLogistics = false
): { fromUnit: Unit; toUnit: Unit; message: string } | null {
  if (!isFreeLogistics && !areUnitsAdjacentForTrade(fromUnit, toUnit)) {
    return null;
  }
  const sourceItems = fromUnit.carriedItems ?? [];
  const itemId = sourceItems[itemIndex];
  if (!itemId || isUnitCarryFull(toUnit)) return null;

  const itemName = ITEMS[itemId]?.name ?? GEMS[itemId]?.name ?? itemId;
  const nextFromItems = sourceItems.filter((_, idx) => idx !== itemIndex);
  const nextToItems = [...(toUnit.carriedItems ?? []), itemId];

  return {
    fromUnit: { ...fromUnit, carriedItems: nextFromItems },
    toUnit: { ...toUnit, carriedItems: nextToItems },
    message: `${fromUnit.name} đã chuyển ${itemName} sang túi của ${toUnit.name}.`,
  };
}

/**
 * Transfers 1 carried unequipped armor (`unit.carriedArmorUids`) from `fromUnit` to `toUnit`.
 */
export function tradeCarriedArmorBetweenUnits(
  fromUnit: Unit,
  toUnit: Unit,
  armorUid: string,
  equipmentBag: EquipmentInstance[],
  isFreeLogistics = false
): { fromUnit: Unit; toUnit: Unit; message: string } | null {
  if (!isFreeLogistics && !areUnitsAdjacentForTrade(fromUnit, toUnit)) {
    return null;
  }
  const sourceUids = fromUnit.carriedArmorUids ?? [];
  if (!sourceUids.includes(armorUid) || isUnitCarryFull(toUnit)) return null;

  const piece = equipmentBag.find((e) => e.uid === armorUid);
  const armorName = piece ? ARMOR_TEMPLATES[piece.templateId]?.name ?? 'Trang bị' : 'Trang bị';

  return {
    fromUnit: {
      ...fromUnit,
      carriedArmorUids: sourceUids.filter((id) => id !== armorUid),
    },
    toUnit: {
      ...toUnit,
      carriedArmorUids: [...(toUnit.carriedArmorUids ?? []), armorUid],
    },
    message: `${fromUnit.name} đã chuyển ${armorName} sang túi của ${toUnit.name}.`,
  };
}

// ============================================================================
// DEDICATED REAR-BASE CONVOY (`KHO QUÂN ĐOÀN`) TRANSFER ENGINE (OUT OF BATTLE)
// ============================================================================

export function storeUnitWeaponToConvoy(
  unit: Unit,
  weaponId: string,
  convoyWeaponIds: string[],
  weaponForges: Record<string, WeaponForgeState> = {}
): { updatedUnit: Unit; nextConvoyWeaponIds: string[] } | null {
  const idx = unit.inventory.findIndex((w) => w.id === weaponId);
  if (idx < 0) return null;
  const remaining = unit.inventory.filter((_, i) => i !== idx);
  const equippable = remaining.filter((w) => canUnitEquipWeapon(unit, w));
  if (equippable.length === 0) return null;

  const nextActive = unit.weapon.id === weaponId ? equippable[0] : unit.weapon;
  return {
    updatedUnit: {
      ...unit,
      inventory: remaining,
      weapon: nextActive,
      weaponForge: weaponForges[nextActive.id],
    },
    nextConvoyWeaponIds: [...convoyWeaponIds, weaponId],
  };
}

export function withdrawConvoyWeaponToUnit(
  unit: Unit,
  weaponId: string,
  convoyWeaponIds: string[],
  equipImmediately = false,
  weaponForges: Record<string, WeaponForgeState> = {}
): { updatedUnit: Unit; nextConvoyWeaponIds: string[] } | null {
  if (unit.inventory.some((w) => w.id === weaponId)) return null;
  const convoyIdx = convoyWeaponIds.indexOf(weaponId);
  if (convoyIdx < 0) return null;
  const weapon = WEAPONS[weaponId];
  if (!weapon) return null;

  const shouldEquip = equipImmediately && canUnitEquipWeapon(unit, weapon);
  const full = isUnitCarryFull(unit);

  // Adding a spare weapon to the personal bag requires a free bag slot (< 6/6).
  // However, equipping directly into hand (`shouldEquip`) works even at 6/6 by returning
  // the previously equipped weapon to Kho Quân Đoàn!
  if (full && !shouldEquip) return null;

  const nextConvoy = [...convoyWeaponIds];
  nextConvoy.splice(convoyIdx, 1);

  if (full && shouldEquip) {
    const prevEquippedId = unit.weapon.id;
    let replaced = false;
    const swappedInventory = unit.inventory.map((w) => {
      if (!replaced && w.id === prevEquippedId) {
        replaced = true;
        return weapon;
      }
      return w;
    });
    if (!replaced) {
      swappedInventory.unshift(weapon);
    } else {
      nextConvoy.push(prevEquippedId);
    }
    return {
      updatedUnit: {
        ...unit,
        inventory: swappedInventory,
        weapon,
        weaponForge: weaponForges[weapon.id],
      },
      nextConvoyWeaponIds: nextConvoy,
    };
  }

  const nextActive = shouldEquip ? weapon : unit.weapon;

  return {
    updatedUnit: {
      ...unit,
      inventory: [...unit.inventory, weapon],
      weapon: nextActive,
      weaponForge: weaponForges[nextActive.id],
    },
    nextConvoyWeaponIds: nextConvoy,
  };
}

export function storeUnitPotionToConvoy(
  unit: Unit,
  itemBag: Record<string, number>
): { updatedUnit: Unit; nextItemBag: Record<string, number> } | null {
  if (unit.potions <= 0) return null;
  return {
    updatedUnit: { ...unit, potions: unit.potions - 1 },
    nextItemBag: {
      ...itemBag,
      vulnerary: (itemBag.vulnerary ?? 0) + 1,
    },
  };
}

export function withdrawConvoyPotionToUnit(
  unit: Unit,
  itemBag: Record<string, number>
): { updatedUnit: Unit; nextItemBag: Record<string, number> } | null {
  if (isUnitCarryFull(unit)) return null;
  if ((itemBag.vulnerary ?? 0) <= 0) return null;
  const nextBag: Record<string, number> = { ...itemBag, vulnerary: itemBag.vulnerary - 1 };
  if (nextBag.vulnerary <= 0) delete nextBag.vulnerary;
  return {
    updatedUnit: { ...unit, potions: unit.potions + 1 },
    nextItemBag: nextBag,
  };
}

export function storeUnitItemToConvoy(
  unit: Unit,
  itemIndex: number,
  itemBag: Record<string, number>
): { updatedUnit: Unit; nextItemBag: Record<string, number>; itemId: string } | null {
  const cur = unit.carriedItems ?? [];
  const itemId = cur[itemIndex];
  if (!itemId) return null;
  return {
    updatedUnit: {
      ...unit,
      carriedItems: cur.filter((_, idx) => idx !== itemIndex),
    },
    nextItemBag: {
      ...itemBag,
      [itemId]: (itemBag[itemId] ?? 0) + 1,
    },
    itemId,
  };
}

export function withdrawConvoyItemToUnit(
  unit: Unit,
  itemId: string,
  itemBag: Record<string, number>
): { updatedUnit: Unit; nextItemBag: Record<string, number> } | null {
  if (isUnitCarryFull(unit)) return null;
  if ((itemBag[itemId] ?? 0) <= 0) return null;
  if (!ITEMS[itemId] && !GEMS[itemId]) return null;

  const nextBag = { ...itemBag, [itemId]: itemBag[itemId] - 1 };
  if (nextBag[itemId] <= 0) delete nextBag[itemId];

  if (itemId === 'vulnerary') {
    return {
      updatedUnit: { ...unit, potions: unit.potions + 1 },
      nextItemBag: nextBag,
    };
  }

  return {
    updatedUnit: {
      ...unit,
      carriedItems: [...(unit.carriedItems ?? []), itemId],
    },
    nextItemBag: nextBag,
  };
}

export function storeUnitArmorToConvoy(
  unit: Unit,
  armorUid: string
): { updatedUnit: Unit } | null {
  const cur = unit.carriedArmorUids ?? [];
  if (!cur.includes(armorUid)) return null;
  return {
    updatedUnit: {
      ...unit,
      carriedArmorUids: cur.filter((id) => id !== armorUid),
    },
  };
}

export function withdrawConvoyArmorToUnit(
  unit: Unit,
  armorUid: string,
  equipmentBag: EquipmentInstance[],
  allUnits: Unit[]
): { updatedUnit: Unit } | null {
  if (isUnitCarryFull(unit)) return null;
  const piece = equipmentBag.find((e) => e.uid === armorUid);
  if (!piece) return null;
  const isHeldByAnyone = allUnits.some(
    (u) =>
      Object.values(u.equipment ?? {}).some((eq) => eq?.uid === armorUid) ||
      Boolean(u.carriedArmorUids?.includes(armorUid))
  );
  if (isHeldByAnyone) return null;

  return {
    updatedUnit: {
      ...unit,
      carriedArmorUids: [...(unit.carriedArmorUids ?? []), armorUid],
    },
  };
}

// ============================================================================
// BATTLE VICTORY RANDOM LOOT DROP ENGINE (0.05% - 0.1%, ANY ITEM, AUTO-CONVOY)
// ============================================================================

type LootCandidateEntry =
  | { kind: 'WEAPON'; id: string }
  | { kind: 'ARMOR'; id: string }
  | { kind: 'ITEM'; id: string }
  | { kind: 'GEM'; id: string };

let cachedAllLootCandidates: LootCandidateEntry[] | null = null;

function getAllLootCandidates(): LootCandidateEntry[] {
  if (cachedAllLootCandidates) return cachedAllLootCandidates;
  const pool: LootCandidateEntry[] = [];
  for (const wid of Object.keys(WEAPONS)) {
    pool.push({ kind: 'WEAPON', id: wid });
  }
  for (const aid of Object.keys(ARMOR_TEMPLATES)) {
    pool.push({ kind: 'ARMOR', id: aid });
  }
  for (const iid of Object.keys(ITEMS)) {
    pool.push({ kind: 'ITEM', id: iid });
  }
  for (const gid of Object.keys(GEMS)) {
    pool.push({ kind: 'GEM', id: gid });
  }
  cachedAllLootCandidates = pool;
  return pool;
}

/**
 * Computes the exact battle-win loot drop probability strictly within [0.05%, 0.1%]
 * (`0.0005` to `0.001`).
 */
export function computeBattleLootDropChance(
  winner: Pick<Unit, 'stats'>,
  defeatedEnemy: Pick<Unit, 'isBoss' | 'isElite'>
): number {
  const base = defeatedEnemy.isBoss
    ? 0.00095
    : defeatedEnemy.isElite
    ? 0.00075
    : MIN_BATTLE_LOOT_DROP_CHANCE;
  const luckBonus = Math.max(0, winner.stats.lck) * 0.00001;
  return Math.max(
    MIN_BATTLE_LOOT_DROP_CHANCE,
    Math.min(MAX_BATTLE_LOOT_DROP_CHANCE, base + luckBonus)
  );
}

function pickRandomArmorRarity(rng: () => number): EquipmentRarity {
  const r = rng();
  if (r < 0.45) return 'COMMON';
  if (r < 0.75) return 'RARE';
  if (r < 0.91) return 'EPIC';
  if (r < 0.98) return 'LEGENDARY';
  return 'MYTHIC';
}

/**
 * Rolls (`0.05%` to `0.1%`) when a PLAYER unit defeats an ENEMY unit in battle:
 * - Picks 1 completely random item (`đồ bất kỳ`) across ALL Weapons, 5-Slot Armors, Items, and Gems.
 * - If `winner` has room (`getUnitCarryCount(winner) < MAX_UNIT_CARRY_SLOTS`), places it into `winner`'s pack.
 * - If `winner`'s pack is FULL (`>= MAX_UNIT_CARRY_SLOTS`), automatically routes the new drop straight into `Kho Quân Đoàn`!
 */
export function rollAndDeliverBattleLootDrop(
  winner: Unit,
  defeatedEnemy: Pick<Unit, 'isBoss' | 'isElite'>,
  convoyState: {
    convoyWeaponIds: string[];
    itemBag: Record<string, number>;
    equipmentBag: EquipmentInstance[];
  },
  rng: () => number = Math.random
): {
  drop: BattleLootDrop;
  updatedWinner: Unit;
  nextConvoyWeaponIds: string[];
  nextItemBag: Record<string, number>;
  nextEquipmentBag: EquipmentInstance[];
} | null {
  const dropChance = computeBattleLootDropChance(winner, defeatedEnemy);
  const roll = rng();
  if (roll >= dropChance) {
    return null;
  }

  const pool = getAllLootCandidates();
  if (pool.length === 0) return null;
  const pickIdx = Math.min(pool.length - 1, Math.max(0, Math.floor(rng() * pool.length)));
  const chosen = pool[pickIdx];
  const full = isUnitCarryFull(winner);

  let updatedWinner: Unit = winner;
  let nextConvoyWeaponIds = convoyState.convoyWeaponIds;
  let nextItemBag = convoyState.itemBag;
  let nextEquipmentBag = convoyState.equipmentBag;

  if (chosen.kind === 'WEAPON') {
    const w = WEAPONS[chosen.id]!;
    if (full) {
      nextConvoyWeaponIds = [...convoyState.convoyWeaponIds, w.id];
    } else {
      updatedWinner = {
        ...winner,
        inventory: [...winner.inventory, w],
      };
    }
    return {
      drop: {
        kind: 'WEAPON',
        id: w.id,
        name: w.name,
        categoryLabel: WEAPON_TYPE_LABEL[w.type],
        accentColor: '#fbbf24',
        dropChance,
        sentToConvoy: full,
        recipientUnitId: winner.id,
        recipientName: winner.name,
      },
      updatedWinner,
      nextConvoyWeaponIds,
      nextItemBag,
      nextEquipmentBag,
    };
  }

  if (chosen.kind === 'ARMOR') {
    const tpl = ARMOR_TEMPLATES[chosen.id]!;
    const rarity = pickRandomArmorRarity(rng);
    const created = createEquipmentInstance(tpl.id, { rarity });
    nextEquipmentBag = [...convoyState.equipmentBag, created];
    if (!full) {
      updatedWinner = {
        ...winner,
        carriedArmorUids: [...(winner.carriedArmorUids ?? []), created.uid],
      };
    }
    return {
      drop: {
        kind: 'ARMOR',
        id: tpl.id,
        name: `${tpl.name} (${EQUIPMENT_RARITY_META[rarity].label})`,
        categoryLabel: ARMOR_SLOT_META[tpl.slot].label,
        accentColor: EQUIPMENT_RARITY_META[rarity].color,
        dropChance,
        sentToConvoy: full,
        recipientUnitId: winner.id,
        recipientName: winner.name,
        createdArmor: created,
      },
      updatedWinner,
      nextConvoyWeaponIds,
      nextItemBag,
      nextEquipmentBag,
    };
  }

  if (chosen.kind === 'GEM') {
    const gem = GEMS[chosen.id]!;
    if (full) {
      nextItemBag = {
        ...convoyState.itemBag,
        [gem.id]: (convoyState.itemBag[gem.id] ?? 0) + 1,
      };
    } else {
      updatedWinner = {
        ...winner,
        carriedItems: [...(winner.carriedItems ?? []), gem.id],
      };
    }
    return {
      drop: {
        kind: 'GEM',
        id: gem.id,
        name: gem.name,
        categoryLabel: 'Bảo Ngọc',
        accentColor: gem.color,
        dropChance,
        sentToConvoy: full,
        recipientUnitId: winner.id,
        recipientName: winner.name,
      },
      updatedWinner,
      nextConvoyWeaponIds,
      nextItemBag,
      nextEquipmentBag,
    };
  }

  // chosen.kind === 'ITEM'
  const item = ITEMS[chosen.id]!;
  if (full) {
    nextItemBag = {
      ...convoyState.itemBag,
      [item.id]: (convoyState.itemBag[item.id] ?? 0) + 1,
    };
  } else if (item.id === 'vulnerary') {
    updatedWinner = {
      ...winner,
      potions: winner.potions + 1,
    };
  } else {
    updatedWinner = {
      ...winner,
      carriedItems: [...(winner.carriedItems ?? []), item.id],
    };
  }

  return {
    drop: {
      kind: 'ITEM',
      id: item.id,
      name: item.name,
      categoryLabel: 'Vật Phẩm',
      accentColor: item.accentColor,
      dropChance,
      sentToConvoy: full,
      recipientUnitId: winner.id,
      recipientName: winner.name,
    },
    updatedWinner,
    nextConvoyWeaponIds,
    nextItemBag,
    nextEquipmentBag,
  };
}


