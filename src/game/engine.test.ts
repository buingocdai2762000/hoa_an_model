import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyExpAndLevelUp,
  applyItemToUnit,
  areUnitsAdjacentForTrade,
  calculateCombatForecast,
  canPromoteUnit,
  canUnitAccessConvoy,
  canUnitAttackAtDistance,
  canUnitTakeEquippedArmorFromOwner,
  checkBattleOutcome,
  computeBattleLootDropChance,
  computeCombatExpGain,
  computeEnemyDangerZone,
  computeUnitCombatPower,
  decideEnemyAction,
  equipPersonalWeapon,
  findAvailableSealForUnit,
  findPath,
  getAdjacentTradePartners,
  getEffectiveUnitStats,
  getHealAmount,
  getPromotionChain,
  getReachableTiles,
  getSpareWeaponCount,
  getUnitCarryCount,
  getWeaponTriangleAdvantage,
  isUnitCarryFull,
  MAX_BATTLE_LOOT_DROP_CHANCE,
  MAX_UNIT_CARRY_SLOTS,
  MIN_BATTLE_LOOT_DROP_CHANCE,
  promoteUnit,
  reclassUnit,
  resolveCombat,
  rollAndDeliverBattleLootDrop,
  storeUnitArmorToConvoy,
  storeUnitItemToConvoy,
  storeUnitPotionToConvoy,
  storeUnitWeaponToConvoy,
  tradeArmorSlotBetweenUnits,
  tradeCarriedArmorBetweenUnits,
  tradePersonalItemBetweenUnits,
  tradePotionBetweenUnits,
  tradeWeaponBetweenUnits,
  withdrawConvoyArmorToUnit,
  withdrawConvoyItemToUnit,
  withdrawConvoyPotionToUnit,
  withdrawConvoyWeaponToUnit,
} from './engine';
import { CAMPAIGN_ACTS, CAMPAIGN_MAPS, getMapScaleLabel } from './campaignData';
import {
  ARMOR_SLOTS,
  ARMOR_TEMPLATES,
  buildPartyUnitsForAct,
  buildUnlockedRosterUnits,
  CLASS_COUNT,
  CLASS_LINEAGES,
  CLASS_META,
  computeArmorInstanceBonuses,
  computeWeaponForgeBonuses,
  createEquipmentInstance,
  createInitialRoster,
  createStarterEquipmentBag,
  evaluateUnlockedTitles,
  fuseArmorInstances,
  fuseWeaponForge,
  GEMS,
  getMaxSocketsForRarity,
  getShopStock,
  getTurnsUntilWeatherShift,
  getUnitEquipmentBonuses,
  getUnitTitleBonuses,
  getWeatherForTurn,
  ITEMS,
  levelUpArmorInstance,
  levelUpWeaponForge,
  socketGemIntoArmor,
  socketGemIntoWeapon,
  STARTER_TITLE_IDS,
  temperArmorInstance,
  temperWeaponForge,
  TERRAIN_DATA,
  TITLE_LIST,
  unsocketGemFromArmor,
  unsocketGemFromWeapon,
  WEAPONS,
  WEATHER_DATA,
} from './data';
import {
  computeFormationPlacement,
  generateMap,
  pickAttackAxis,
  swapOrMoveDeploymentUnit,
} from './mapGenerator';
import {
  BATTLE_QUOTE_POOLS,
  computeHpPercent,
  getHpBand,
  pickBattleQuote,
  resolveBattleVoiceArchetype,
} from './battleQuotes';
import {
  computeScreenShakeOffset,
  computeTitleAuraVisual,
  computeUnitAnimationFrame,
  createCritImpactParticles,
  getWeatherAnimationProfile,
  stepImpactParticles,
  stepWeatherParticle,
} from './pixelRenderer';
import { createLevelUpBurst, stepLevelUpBurst } from './levelUpParticles';
import {
  getPaletteForUnit,
  measureSpriteSilhouette,
  PORTRAIT_H,
  PORTRAIT_W,
  renderUnitPortraitBuffer,
  SPRITE_H,
  SPRITE_W,
} from './pixelSprites';
import { createFreshSave, mergeUnitsIntoSavedRoster } from './storage';
import { CAMP_SPARRING_COST_GOLD, CAMP_SPARRING_EXP_GAIN, getHeroCampDialogue } from './campData';
import type { TerrainType, Unit } from './types';

function makeTestUnit(overrides: Partial<Unit>): Unit {
  const weapon = overrides.weapon ?? WEAPONS.iron_sword;
  return {
    id: 'test_u1',
    templateId: 'kaelen',
    name: 'Kaelen',
    classId: 'LORD',
    className: 'Lãnh Chúa',
    tier: 1,
    promoted: false,
    faction: 'PLAYER',
    moveType: 'FOOT',
    level: 1,
    exp: 0,
    hp: 24,
    sp: 80,
    maxSp: 100,
    stats: { maxHp: 24, str: 9, mag: 2, skl: 10, spd: 11, lck: 8, def: 7, res: 4, mov: 5 },
    growths: { hp: 80, str: 60, mag: 20, skl: 60, spd: 60, lck: 50, def: 45, res: 30 },
    weapon,
    inventory: [weapon],
    skills: [],
    potions: 2,
    x: 1,
    y: 1,
    acted: false,
    isLord: true,
    aiPolicy: 'CHASER',
    accentColor: '#3b82f6',
    ...overrides,
  };
}

test('Weapon triangle follows SWORD > AXE > LANCE > SWORD', () => {
  assert.equal(getWeaponTriangleAdvantage('SWORD', 'AXE'), 1);
  assert.equal(getWeaponTriangleAdvantage('AXE', 'LANCE'), 1);
  assert.equal(getWeaponTriangleAdvantage('LANCE', 'SWORD'), 1);
  assert.equal(getWeaponTriangleAdvantage('AXE', 'SWORD'), -1);
  assert.equal(getWeaponTriangleAdvantage('SWORD', 'BOW'), 0);
  assert.equal(getWeaponTriangleAdvantage('TOME', 'SWORD'), 0);
});

test('Combat forecast accounts for weapon triangle, terrain DEF, speed doubling, and magic vs RES', () => {
  const swordLord = makeTestUnit({ weapon: WEAPONS.iron_sword, stats: { maxHp: 24, str: 10, mag: 2, skl: 10, spd: 12, lck: 6, def: 7, res: 3, mov: 5 } });
  const axeFighter = makeTestUnit({
    id: 'enemy_1',
    faction: 'ENEMY',
    isLord: false,
    weapon: WEAPONS.iron_axe,
    stats: { maxHp: 22, str: 10, mag: 1, skl: 6, spd: 7, lck: 4, def: 6, res: 2, mov: 5 },
  });

  const forecastPlain = calculateCombatForecast(swordLord, axeFighter, 'PLAIN', 'PLAIN', 1);
  const forecastFort = calculateCombatForecast(swordLord, axeFighter, 'PLAIN', 'FORT', 1);

  assert.equal(forecastPlain.attackerAdvantage, 1);
  assert.equal(forecastPlain.attackerDoubles, true);
  assert.equal(forecastPlain.defenderCanCounter, true);
  // Fort adds +2 DEF, reducing damage by 2
  assert.equal(forecastFort.attackerDamage, forecastPlain.attackerDamage - 2);
  assert.ok(forecastFort.attackerHit < forecastPlain.attackerHit);

  // Bow at distance 2 prevents melee sword counter-attack and deals bonus vs Flying
  const archer = makeTestUnit({ id: 'archer', weapon: WEAPONS.hunting_bow });
  const pegasus = makeTestUnit({
    id: 'peg',
    faction: 'ENEMY',
    moveType: 'FLYING',
    weapon: WEAPONS.iron_lance,
    stats: { maxHp: 22, str: 8, mag: 2, skl: 9, spd: 10, lck: 5, def: 5, res: 9, mov: 6 },
  });
  const bowForecast = calculateCombatForecast(archer, pegasus, 'PLAIN', 'PLAIN', 2);
  assert.equal(bowForecast.defenderCanCounter, false);
  assert.equal(bowForecast.effectiveAttacker, true);
});

test('Combat resolution applies deterministic strikes, HP drain, and EXP/Level Up', () => {
  const attacker = makeTestUnit({ exp: 80 });
  const defender = makeTestUnit({
    id: 'enemy_weak',
    faction: 'ENEMY',
    isLord: false,
    hp: 8,
    weapon: WEAPONS.iron_axe,
    stats: { maxHp: 18, str: 7, mag: 1, skl: 6, spd: 5, lck: 4, def: 4, res: 2, mov: 5 },
  });

  // Deterministic RNG returning 0.35 guarantees hits without crits and triggers high growths
  const resolution = resolveCombat(attacker, defender, 'PLAIN', 'PLAIN', 1, () => 0.35);
  assert.equal(resolution.defenderDied, true);
  assert.equal(resolution.defenderEndHp, 0);
  assert.ok(resolution.expGained >= 20);
  assert.ok(resolution.levelUp !== null);
  assert.equal(resolution.levelUp?.newLevel, 2);

  const levelResult = applyExpAndLevelUp(attacker, 30, () => 0.1);
  assert.equal(levelResult.updatedUnit.level, 2);
  assert.ok(levelResult.updatedUnit.stats.maxHp > attacker.stats.maxHp);
});

test('Reachable tiles and A* pathfinding respect walls, water, and enemy blockers', () => {
  const grid: TerrainType[][] = [
    ['PLAIN', 'PLAIN', 'WATER', 'PLAIN', 'PLAIN'],
    ['PLAIN', 'PLAIN', 'BRIDGE', 'PLAIN', 'PLAIN'],
    ['PLAIN', 'WALL', 'WATER', 'PLAIN', 'PLAIN'],
  ];
  const hero = makeTestUnit({ x: 0, y: 1, stats: { maxHp: 24, str: 8, mag: 2, skl: 8, spd: 8, lck: 6, def: 6, res: 4, mov: 4 } });
  const reachable = getReachableTiles(hero, grid, [hero]);

  assert.equal(reachable.has('2,0'), false); // Water impassable to foot
  assert.equal(reachable.has('1,2'), false); // Wall impassable
  assert.equal(reachable.has('2,1'), true); // Bridge passable
  assert.equal(reachable.has('4,1'), true); // Reachable across bridge in 4 mov

  const path = findPath(hero, { x: 4, y: 1 }, grid, [hero]);
  assert.equal(path[0].x, 0);
  assert.equal(path[path.length - 1].x, 4);
  assert.equal(path.length, 5);
});

test('Enemy AI policies behave distinctly (BOSS holds throne, KITER attacks at range 2, CHASER pursues)', () => {
  const grid: TerrainType[][] = Array.from({ length: 6 }, () =>
    Array.from({ length: 8 }, () => 'PLAIN' as TerrainType)
  );
  const player = makeTestUnit({ id: 'p1', x: 2, y: 2 });
  const boss = makeTestUnit({ id: 'b1', faction: 'ENEMY', isBoss: true, aiPolicy: 'BOSS', x: 7, y: 2, weapon: WEAPONS.iron_axe });
  const kiter = makeTestUnit({ id: 'k1', faction: 'ENEMY', aiPolicy: 'KITER', x: 5, y: 2, weapon: WEAPONS.hunting_bow });
  const chaser = makeTestUnit({ id: 'c1', faction: 'ENEMY', aiPolicy: 'CHASER', x: 6, y: 4, weapon: WEAPONS.iron_axe });

  const units = [player, boss, kiter, chaser];
  const bossAct = decideEnemyAction(boss, grid, units);
  assert.deepEqual(bossAct.moveTo, { x: 7, y: 2 }); // Boss stays on Throne

  const kiterAct = decideEnemyAction(kiter, grid, units);
  assert.equal(kiterAct.targetId, 'p1');
  const kiterDist = Math.abs(kiterAct.moveTo.x - player.x) + Math.abs(kiterAct.moveTo.y - player.y);
  assert.equal(kiterDist, 2); // Archer kites at range 2

  const chaserAct = decideEnemyAction(chaser, grid, units);
  const oldDist = Math.abs(chaser.x - player.x) + Math.abs(chaser.y - player.y);
  const newDist = Math.abs(chaserAct.moveTo.x - player.x) + Math.abs(chaserAct.moveTo.y - player.y);
  assert.ok(newDist < oldDist); // Chaser closes distance

  const danger = computeEnemyDangerZone(grid, units);
  assert.ok(danger.has('2,2'));
});

test('Win and defeat conditions evaluate ROUT, DEFEAT_BOSS, SEIZE, SURVIVE, and Lord loss', () => {
  const map1 = CAMPAIGN_MAPS[0]; // ROUT
  const map4 = CAMPAIGN_MAPS[3]; // SEIZE
  const map6 = CAMPAIGN_MAPS[5]; // SURVIVE
  const map12 = CAMPAIGN_MAPS[11]; // DEFEAT_BOSS

  const lord = makeTestUnit({ id: 'lord', isLord: true, hp: 20 });
  const boss = makeTestUnit({ id: 'boss', faction: 'ENEMY', isLord: false, isBoss: true, hp: 20 });

  assert.equal(checkBattleOutcome([lord], map1, 1, false).status, 'VICTORY');
  assert.equal(checkBattleOutcome([{ ...lord, hp: 0 }, boss], map1, 1, false).status, 'DEFEAT');
  assert.equal(checkBattleOutcome([lord, boss], map4, 2, true).status, 'VICTORY');
  assert.equal(checkBattleOutcome([lord, boss], map6, 7, false).status, 'VICTORY');
  assert.equal(checkBattleOutcome([lord, { ...boss, hp: 0 }], map12, 3, false).status, 'VICTORY');
});

test('All 120 campaign maps generate cleanly with unique titles, story continuity, and 100% foot connectivity', () => {
  assert.equal(CAMPAIGN_ACTS.length, 10);
  assert.equal(CAMPAIGN_MAPS.length, 120);

  const seenTitles = new Set<string>();
  const roster = createInitialRoster();

  for (let id = 1; id <= 120; id++) {
    const map = generateMap(id);
    assert.equal(map.meta.id, id);
    assert.ok(!seenTitles.has(map.meta.title), `Duplicate map title on map ${id}: ${map.meta.title}`);
    seenTitles.add(map.meta.title);

    assert.ok(map.meta.introDialogue.length >= 2, `Map ${id} missing intro dialogue`);
    assert.ok(map.meta.outroDialogue.length >= 2, `Map ${id} missing outro dialogue`);
    assert.ok(map.enemies.length >= 4, `Map ${id} has too few enemies`);
    assert.ok(map.enemies.some((e) => e.isBoss), `Map ${id} missing boss`);

    // Verify player party builds cleanly for this Act
    const party = buildPartyUnitsForAct(map.meta.actNumber, roster, map.meta.recommendedLevel);
    assert.ok(party.length >= 4);
    assert.ok(party[0].isLord);

    // BFS flood-fill from playerSpawns[0] across foot-passable terrain to confirm zero walled-off objectives/enemies
    const visited = new Set<string>();
    const start = map.playerSpawns[0];
    const queue = [start];
    visited.add(`${start.x},${start.y}`);
    while (queue.length > 0) {
      const cur = queue.shift()!;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = cur.x + dx;
        const ny = cur.y + dy;
        if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue;
        const key = `${nx},${ny}`;
        if (visited.has(key)) continue;
        if (TERRAIN_DATA[map.grid[ny][nx]].moveCost.FOOT < 99) {
          visited.add(key);
          queue.push({ x: nx, y: ny });
        }
      }
    }

    assert.ok(
      visited.has(`${map.throneCoord.x},${map.throneCoord.y}`),
      `Map ${id} throne not reachable from player spawn`
    );
    for (const enemy of map.enemies) {
      assert.ok(
        visited.has(`${enemy.x},${enemy.y}`),
        `Map ${id} enemy ${enemy.id} at (${enemy.x},${enemy.y}) not reachable`
      );
    }
  }
});

test('Active Combat Arts, Passive Skills, and Special Weapons (Brave, Armorslayer, Nosferatu) compute accurately', () => {
  const knight = makeTestUnit({
    id: 'enemy_knight',
    faction: 'ENEMY',
    isLord: false,
    classId: 'KNIGHT',
    moveType: 'ARMORED',
    hp: 36,
    weapon: WEAPONS.iron_lance,
    stats: { maxHp: 36, str: 12, mag: 1, skl: 8, spd: 5, lck: 4, def: 16, res: 4, mov: 4 },
  });

  // 1. LUNA_STRIKE pierces 50% DEF and deals much higher damage than standard attack
  const hero = makeTestUnit({
    weapon: WEAPONS.steel_sword,
    skills: ['LUNA_STRIKE', 'SOL_STRIKE'],
    stats: { maxHp: 28, str: 13, mag: 2, skl: 12, spd: 12, lck: 8, def: 8, res: 5, mov: 5 },
  });
  const normalFc = calculateCombatForecast(hero, knight, 'PLAIN', 'PLAIN', 1);
  const lunaFc = calculateCombatForecast(hero, knight, 'PLAIN', 'PLAIN', 1, 'LUNA_STRIKE');
  assert.ok(lunaFc.attackerDamage > normalFc.attackerDamage + 5);
  assert.equal(lunaFc.activeSkillId, 'LUNA_STRIKE');

  // 2. SOL_STRIKE drains HP when landing a hit
  const woundedHero = { ...hero, hp: 14 };
  const solRes = resolveCombat(woundedHero, knight, 'PLAIN', 'PLAIN', 1, () => 0.3, 'SOL_STRIKE');
  assert.ok((solRes.strikes[0].healedAmount ?? 0) > 0);

  // 3. DEADEYE_SHOT extends bow attack range from 2 to 3
  const archer = makeTestUnit({ weapon: WEAPONS.hunting_bow, skills: ['DEADEYE_SHOT'] });
  assert.equal(canUnitAttackAtDistance(archer, 3, null), false);
  assert.equal(canUnitAttackAtDistance(archer, 3, 'DEADEYE_SHOT'), true);

  // 4. Armorslayer deals effective bonus damage against Armored Knights
  const armorKiller = makeTestUnit({ weapon: WEAPONS.armorslayer });
  const armorFc = calculateCombatForecast(armorKiller, knight, 'PLAIN', 'PLAIN', 1);
  assert.equal(armorFc.effectiveAttacker, true);

  // 5. Brave Sword triggers 2 consecutive strikes on initiation
  const braveHero = makeTestUnit({ weapon: WEAPONS.brave_sword });
  const braveRes = resolveCombat(braveHero, knight, 'PLAIN', 'PLAIN', 1, () => 0.3);
  assert.equal(braveRes.strikes[0].actor, 'ATTACKER');
  assert.equal(braveRes.strikes[1].actor, 'ATTACKER');

  // 6. VANTAGE lets wounded defender strike FIRST
  const vantageDefender = makeTestUnit({
    id: 'vantage_def',
    faction: 'ENEMY',
    isLord: false,
    hp: 8,
    skills: ['VANTAGE', 'WRATH'],
    weapon: WEAPONS.iron_sword,
    stats: { maxHp: 28, str: 11, mag: 2, skl: 10, spd: 10, lck: 6, def: 8, res: 5, mov: 5 },
  });
  const vantageRes = resolveCombat(hero, vantageDefender, 'PLAIN', 'PLAIN', 1, () => 0.35);
  assert.equal(vantageRes.strikes[0].actor, 'DEFENDER');
});

test('Class Promotion supports 3-stage evolution (Lv.5 -> Lv.15 -> Lv.30) across all 30 lineages (121 classes)', () => {
  assert.equal(CLASS_LINEAGES.length, 30);
  assert.equal(CLASS_COUNT, 121);
  assert.equal(Object.keys(CLASS_META).length, 121);

  // Verify every lineage forms an exact 4-tier chain at minLevel 5, 15, 30
  for (const lineage of CLASS_LINEAGES) {
    assert.equal(lineage.tiers.length, 4);
    const chain = getPromotionChain(lineage.tiers[0].id);
    assert.equal(chain.length, 4);
    assert.equal(CLASS_META[chain[0]].tier, 1);
    assert.equal(CLASS_META[chain[0]].promotion?.minLevel, 5);
    assert.equal(CLASS_META[chain[1]].tier, 2);
    assert.equal(CLASS_META[chain[1]].promotion?.minLevel, 15);
    assert.equal(CLASS_META[chain[2]].tier, 3);
    assert.equal(CLASS_META[chain[2]].promotion?.minLevel, 30);
    assert.equal(CLASS_META[chain[3]].tier, 4);
  }

  // Test full 3-stage evolution on Wyvern Rider: Lv.5 (master_seal) -> Lv.15 (royal_crest) -> Lv.30 (mythic_crown)
  const wyvern = makeTestUnit({
    id: 'hero_veyra',
    name: 'Veyra',
    classId: 'WYVERN_RIDER',
    className: 'Long Kỵ Sĩ',
    moveType: 'FLYING',
    level: 5,
    tier: 1,
    promoted: false,
    weapon: WEAPONS.iron_axe,
    skills: ['DRAGON_FANG'],
  });

  assert.equal(canPromoteUnit(wyvern, {}), false);
  assert.equal(canPromoteUnit(wyvern, { master_seal: 1 }), true);

  const stage1 = promoteUnit(wyvern);
  assert.ok(stage1 !== null);
  assert.equal(stage1.updatedUnit.classId, 'WYVERN_LORD');
  assert.equal(stage1.updatedUnit.tier, 2);
  assert.equal(stage1.updatedUnit.promoted, true);
  assert.ok(stage1.updatedUnit.stats.maxHp > wyvern.stats.maxHp);
  assert.ok(stage1.updatedUnit.skills.includes(stage1.result.unlockedSkill));

  // Cannot promote to Tier 3 at Lv.5; can at Lv.15 with royal_crest or omni_seal
  assert.equal(canPromoteUnit(stage1.updatedUnit, { royal_crest: 1 }), false);
  const lv15Wyvern: Unit = { ...stage1.updatedUnit, level: 15 };
  assert.equal(canPromoteUnit(lv15Wyvern, { master_seal: 2 }), false);
  assert.equal(canPromoteUnit(lv15Wyvern, { royal_crest: 1 }), true);
  assert.equal(findAvailableSealForUnit(lv15Wyvern, { omni_seal: 1 }), 'omni_seal');

  const stage2 = promoteUnit(lv15Wyvern);
  assert.ok(stage2 !== null);
  assert.equal(stage2.updatedUnit.classId, 'DRAGONLORD');
  assert.equal(stage2.updatedUnit.tier, 3);

  // Stage 3 Mythic evolution at Lv.30 with mythic_crown
  const lv30Wyvern: Unit = { ...stage2.updatedUnit, level: 30 };
  assert.equal(canPromoteUnit(lv30Wyvern, { royal_crest: 1 }), false);
  assert.equal(canPromoteUnit(lv30Wyvern, { mythic_crown: 1 }), true);
  const stage3 = promoteUnit(lv30Wyvern);
  assert.ok(stage3 !== null);
  assert.equal(stage3.updatedUnit.classId, 'SKY_SOVEREIGN');
  assert.equal(stage3.updatedUnit.tier, 4);
  assert.equal(canPromoteUnit(stage3.updatedUnit, { mythic_crown: 5, omni_seal: 5 }), false);
});

test('Sprite-sheet animation cycles 4 idle breathing frames, selected row, walk row, and flyer hover', () => {
  const hero = makeTestUnit({ id: 'hero_kaelen', moveType: 'FOOT' });
  const wyvern = makeTestUnit({ id: 'hero_veyra', moveType: 'FLYING' });

  // Sample idle frames across 1.2s and confirm all 4 columns (0..3) appear on Row 0 (sy = 0)
  const seenCols = new Set<number>();
  const seenBreathScales = new Set<number>();
  for (let i = 0; i < 20; i++) {
    const f = computeUnitAnimationFrame(hero, i * 0.08, false, false);
    assert.equal(f.state, 'idle');
    assert.equal(f.row, 0);
    assert.equal(f.sy, 0);
    assert.equal(f.sx, f.col * SPRITE_W);
    assert.equal(f.sw, SPRITE_W);
    assert.equal(f.sh, SPRITE_H);
    seenCols.add(f.col);
    seenBreathScales.add(Math.round(f.breathScaleY * 1000));
  }
  assert.deepEqual([...seenCols].sort(), [0, 1, 2, 3]);
  assert.ok(seenBreathScales.size >= 4, 'Idle breathing should gently modulate vertical breath scale');

  // Selected state maps to Row 1 (sy = SPRITE_H), Walk state maps to Row 2 (sy = 2 * SPRITE_H)
  const sel = computeUnitAnimationFrame(hero, 0.5, true, false);
  assert.equal(sel.state, 'selected');
  assert.equal(sel.row, 1);
  assert.equal(sel.sy, SPRITE_H);

  const walk = computeUnitAnimationFrame(hero, 0.5, false, true);
  assert.equal(walk.state, 'walk');
  assert.equal(walk.row, 2);
  assert.equal(walk.sy, SPRITE_H * 2);

  // Flying unit smoothly hovers with dynamic vertical offset and synchronized shadow scale
  const flyOffsets = new Set<number>();
  for (let i = 0; i < 16; i++) {
    const f = computeUnitAnimationFrame(wyvern, i * 0.1, false, false);
    flyOffsets.add(f.offsetY);
    assert.ok(f.shadowScale >= 0.75 && f.shadowScale <= 1.05);
  }
  assert.ok(flyOffsets.size >= 3, 'Flying units should smoothly hover vertically while idle');
});

test('Crit impact effect spawns dense radial particles, integrates physics cleanly, and damps screen shake to zero', () => {
  const critParticles = createCritImpactParticles(7, 4, true, '#fbbf24', () => 0.5);
  const hitParticles = createCritImpactParticles(7, 4, false, '#fbbf24', () => 0.5);

  assert.equal(critParticles.length, 34);
  assert.equal(hitParticles.length, 10);
  assert.ok(critParticles.every((p) => p.tileX === 7 && p.tileY === 4 && p.age === 0));

  // Stepping particles moves them outward and eventually expires all of them
  const moved = stepImpactParticles(critParticles, 0.1);
  assert.equal(moved.length, 34);
  assert.ok(moved.some((p) => Math.hypot(p.ox, p.oy) > 0.08));

  const expired = stepImpactParticles(moved, 1.5);
  assert.equal(expired.length, 0);

  // Damped screen shake starts strong, decays smoothly, and returns {0, 0} when elapsed
  const peak = computeScreenShakeOffset({ remaining: 0.42, duration: 0.42, intensity: 11 }, 0.02);
  const late = computeScreenShakeOffset({ remaining: 0.08, duration: 0.42, intensity: 11 }, 0.02);
  const done = computeScreenShakeOffset({ remaining: 0, duration: 0.42, intensity: 11 }, 0.02);

  assert.ok(Math.hypot(peak.dx, peak.dy) > Math.hypot(late.dx, late.dy));
  assert.deepEqual(done, { dx: 0, dy: 0 });
});

test('Expanded Weapons & Items catalog (4x-5x scale), distinct In-Map vs Out-of-Map Shops, and Item usage', () => {
  const weaponCount = Object.keys(WEAPONS).length;
  const itemCount = Object.keys(ITEMS).length;
  assert.ok(weaponCount >= 120, `Expected >= 120 weapons, got ${weaponCount}`);
  assert.ok(itemCount >= 30, `Expected >= 30 items, got ${itemCount}`);

  // Distinct inventories across Out-of-Map Camp Bazaar vs In-Map Armory vs In-Map Secret Vendor
  const camp = getShopStock('CAMP_BAZAAR', 12, 'VALORIA_PLAINS');
  const armory = getShopStock('IN_MAP_ARMORY', 12, 'VALORIA_PLAINS');
  const vendor = getShopStock('IN_MAP_VENDOR', 12, 'VALORIA_PLAINS');

  const campWeaponSet = new Set(camp.weaponIds);
  const campItemSet = new Set(camp.itemIds);
  assert.ok(
    armory.weaponIds.some((id) => !campWeaponSet.has(id)),
    'In-Map Armory must carry exclusive weapons not in Camp Bazaar'
  );
  assert.ok(
    vendor.weaponIds.some((id) => !campWeaponSet.has(id)),
    'In-Map Secret Vendor must carry exclusive tomes/staves not in Camp Bazaar'
  );
  assert.ok(
    vendor.itemIds.some((id) => !campItemSet.has(id)),
    'In-Map Secret Vendor must carry exclusive stat boosters/seals not in Camp Bazaar'
  );

  // Applying permanent stat booster & EXP manual mutates hero cleanly
  const hero = makeTestUnit({ hp: 14, level: 1, exp: 0 });
  const boosted = applyItemToUnit(hero, ITEMS.energy_drop);
  assert.ok(boosted !== null);
  assert.equal(boosted.updatedUnit.stats.str, hero.stats.str + 2);

  const trained = applyItemToUnit(hero, ITEMS.grandmaster_tome, () => 0.1);
  assert.ok(trained !== null);
  assert.ok(trained.updatedUnit.level >= 5, 'Grandmaster Tome (+500 EXP) should grant multiple level-ups');
});

test('Every map 1..120 has causal story continuity links AND reachable In-Map Armory & Vendor tiles', () => {
  for (let id = 1; id <= 120; id++) {
    const map = generateMap(id);
    assert.ok(map.meta.chapterCode.length > 0, `Map ${id} missing chapterCode`);
    assert.ok(map.meta.storyArcBeat.length > 0, `Map ${id} missing storyArcBeat`);
    assert.ok(map.meta.previousMapLink.length > 10, `Map ${id} missing previousMapLink`);
    assert.ok(map.meta.nextMapHook.length > 10, `Map ${id} missing nextMapHook`);

    // Verify In-Map Shop tiles exist on grid
    assert.equal(
      map.grid[map.armoryShopCoord.y][map.armoryShopCoord.x],
      'SHOP_ARMORY',
      `Map ${id} missing SHOP_ARMORY tile`
    );
    assert.equal(
      map.grid[map.vendorShopCoord.y][map.vendorShopCoord.x],
      'SHOP_VENDOR',
      `Map ${id} missing SHOP_VENDOR tile`
    );

    // Check continuity: Map N>1 references previous map title or Act bridge
    if (id > 1) {
      const prev = CAMPAIGN_MAPS[id - 2];
      assert.ok(
        map.meta.previousMapLink.includes(prev.title) ||
          map.meta.previousMapLink.includes(prev.chapterCode),
        `Map ${id} previousMapLink should reference Map ${id - 1}`
      );
    }
  }
});

test('4-Tier Visual Evolution silhouettes grow unmistakably grander from Bậc I to Bậc IV Thần Thoại across all 30 lineages', () => {
  assert.equal(SPRITE_W, 64);
  assert.equal(SPRITE_H, 72);

  assert.equal(CLASS_LINEAGES.length, 30);
  for (const lin of CLASS_LINEAGES) {
    const baseClassId = lin.tiers[0].id;
    const chain = getPromotionChain(baseClassId);
    assert.equal(chain.length, 4);

    const metrics = chain.map((cid, idx) => {
      const meta = CLASS_META[cid];
      const u = makeTestUnit({
        classId: cid,
        className: meta.name,
        tier: (idx + 1) as 1 | 2 | 3 | 4,
        promoted: idx >= 1,
        accentColor: meta.accent,
      });
      return measureSpriteSilhouette(u);
    });

    // Strict progressive visual density & majesty: Tier 4 > Tier 3 > Tier 2 > Tier 1
    assert.ok(
      metrics[0].uniqueColors >= 12,
      `${baseClassId} T1 should have rich multi-tone shading (>=12 colors, got ${metrics[0].uniqueColors})`
    );
    assert.ok(
      metrics[1].filledPixels > metrics[0].filledPixels,
      `${baseClassId} T2 (${metrics[1].filledPixels}) should be grander than T1 (${metrics[0].filledPixels})`
    );
    assert.ok(
      metrics[2].filledPixels > metrics[1].filledPixels,
      `${baseClassId} T3 (${metrics[2].filledPixels}) should be grander than T2 (${metrics[1].filledPixels})`
    );
    assert.ok(
      metrics[3].filledPixels > metrics[2].filledPixels,
      `${baseClassId} T4 (${metrics[3].filledPixels}) should be grander than T3 (${metrics[2].filledPixels})`
    );
    assert.ok(
      metrics[3].bboxWidth >= 46,
      `${baseClassId} T4 Mythic wings/weapon span (${metrics[3].bboxWidth}) should be >= 46px wide`
    );
  }
});

test('Dynamic Battlefield Weather cycles every 3 turns and modifies combat & healing accurately', () => {
  assert.ok(Object.keys(WEATHER_DATA).length >= 9);
  assert.equal(getWeatherForTurn('RAIN', 1), 'RAIN');
  assert.equal(getWeatherForTurn('RAIN', 3), 'RAIN');
  assert.equal(getWeatherForTurn('RAIN', 4), 'STORM');
  assert.equal(getWeatherForTurn('RAIN', 7), 'MIST');
  assert.equal(getTurnsUntilWeatherShift(1), 3);
  assert.equal(getTurnsUntilWeatherShift(3), 1);

  const thunderMage = makeTestUnit({
    weapon: WEAPONS.thunder_tome,
    stats: { maxHp: 24, str: 2, mag: 14, skl: 10, spd: 10, lck: 6, def: 5, res: 10, mov: 5 },
  });
  const archer = makeTestUnit({ weapon: WEAPONS.hunting_bow });
  const healer = makeTestUnit({
    weapon: WEAPONS.heal_staff,
    stats: { maxHp: 22, str: 2, mag: 14, skl: 9, spd: 9, lck: 8, def: 4, res: 10, mov: 5 },
  });
  const enemy = makeTestUnit({
    id: 'e_weather',
    faction: 'ENEMY',
    isLord: false,
    weapon: WEAPONS.iron_lance,
    stats: { maxHp: 30, str: 9, mag: 2, skl: 8, spd: 8, lck: 5, def: 8, res: 5, mov: 5 },
  });

  // STORM boosts Thunder magic damage and boosts crit
  const clearThunder = calculateCombatForecast(thunderMage, enemy, 'PLAIN', 'PLAIN', 2, null, 'NONE');
  const stormThunder = calculateCombatForecast(thunderMage, enemy, 'PLAIN', 'PLAIN', 2, null, 'STORM');
  assert.ok(stormThunder.attackerDamage > clearThunder.attackerDamage);
  assert.ok(stormThunder.attackerCrit > clearThunder.attackerCrit);

  // RAIN reduces Bow accuracy
  const clearBow = calculateCombatForecast(archer, enemy, 'PLAIN', 'PLAIN', 2, null, 'NONE');
  const rainBow = calculateCombatForecast(archer, enemy, 'PLAIN', 'PLAIN', 2, null, 'RAIN');
  assert.ok(rainBow.attackerHit < clearBow.attackerHit);

  // SUNLIGHT boosts Staff healing
  assert.ok(getHealAmount(healer, 'SUNLIGHT') > getHealAmount(healer, 'NONE'));
});

test('Hero & Commander Title System unlocks achievements, stacks aura bonuses, and supports 30-lineage reclassing', () => {
  assert.ok(TITLE_LIST.length >= 24, `Expected >= 24 titles, got ${TITLE_LIST.length}`);
  assert.equal(STARTER_TITLE_IDS.length, 4);

  const hero = makeTestUnit({
    id: 'hero_lyra',
    isLord: false,
    classId: 'CAVALIER',
    equippedTitleId: 'blade_of_dawn',
  });
  const bonuses = getUnitTitleBonuses(hero, 'vanguard_valoria');
  assert.ok(bonuses.stats.str > 0);
  assert.ok(bonuses.hit > 0);
  assert.ok(bonuses.crit > 0);

  const effStats = getEffectiveUnitStats(hero, 'vanguard_valoria');
  assert.ok(effStats.str > hero.stats.str);
  assert.ok(effStats.skl > hero.stats.skl);

  // Achievement unlock checks
  const fresh = createFreshSave();
  const res = evaluateUnlockedTitles({
    ...fresh,
    totalDefeatedEnemies: 20,
    totalCrits: 5,
    totalPromotions: 1,
    totalShopPurchases: 2,
    weatherBattlesWon: 3,
    clearedMaps: [1],
  });
  assert.ok(res.allUnlocked.includes('first_blood'));
  assert.ok(res.allUnlocked.includes('veteran_slayer'));
  assert.ok(res.allUnlocked.includes('keen_executioner'));
  assert.ok(res.allUnlocked.includes('awakened_vanguard'));
  assert.ok(res.allUnlocked.includes('guild_patron'));
  assert.ok(res.allUnlocked.includes('storm_walker'));
  assert.ok(res.allUnlocked.includes('border_guardian'));

  // Reclass non-Lord hero into one of the 13 new lineages (e.g. SAMURAI)
  const samurai = reclassUnit(hero, 'SAMURAI');
  assert.ok(samurai !== null);
  assert.equal(samurai.classId, 'SAMURAI');
  assert.equal(samurai.weapon.type, 'SWORD');
});

test('LevelUpToast particle burst spawns scaled stars/sparks, expands shockwave ring, and decays cleanly', () => {
  let seed = 42;
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const smallBurst = createLevelUpBurst(580, 250, 2, rng);
  const bigBurst = createLevelUpBurst(580, 250, 7, rng);

  assert.ok(bigBurst.particles.length > smallBurst.particles.length);
  assert.ok(bigBurst.particles.some((p) => p.kind === 'STAR'));
  assert.ok(bigBurst.particles.some((p) => p.kind === 'RISER'));
  assert.equal(bigBurst.ringAlpha, 0.92);

  // Step forward 0.25s and confirm ring expands while fading and particles displace
  const initialPositions = bigBurst.particles.map((p) => ({ x: p.x, y: p.y }));
  let state = stepLevelUpBurst(bigBurst, 0.25);
  assert.ok(state.ringRadius > bigBurst.ringRadius);
  assert.ok(state.ringAlpha < bigBurst.ringAlpha);
  assert.ok(
    state.particles.some((p, i) => p.x !== initialPositions[i]?.x || p.y !== initialPositions[i]?.y)
  );

  // Step until completion (3.0s total) and ensure zero lingering particles or ring alpha
  for (let i = 0; i < 60; i++) {
    state = stepLevelUpBurst(state, 0.05);
  }
  assert.equal(state.particles.length, 0);
  assert.equal(state.ringAlpha, 0);
});

test('5-Slot Armor System (Helmet, Armor, Gauntlets, Greaves, Boots) & Starter Armory populate all slots cleanly', () => {
  assert.deepEqual(ARMOR_SLOTS, ['HELMET', 'ARMOR', 'GAUNTLETS', 'GREAVES', 'BOOTS']);
  const templates = Object.values(ARMOR_TEMPLATES);
  assert.ok(templates.length >= 25, `Expected >= 25 armor templates, got ${templates.length}`);
  for (const slot of ARMOR_SLOTS) {
    const slotItems = templates.filter((t) => t.slot === slot);
    assert.ok(slotItems.length >= 5, `Expected >= 5 templates for slot ${slot}, got ${slotItems.length}`);
  }

  assert.ok(Object.keys(GEMS).length >= 8, 'Expected at least 8 distinct gems');

  const starter = createStarterEquipmentBag();
  assert.ok(starter.equipmentBag.length >= 10);
  const kaelenLoadout = starter.starterLoadouts.kaelen;
  assert.ok(kaelenLoadout);
  for (const slot of ARMOR_SLOTS) {
    assert.ok(kaelenLoadout[slot], `Kaelen should start equipped with ${slot}`);
  }

  // Shops expose 5-slot armor & gems
  const camp = getShopStock('CAMP_BAZAAR', 12, 'VALORIA_PLAINS');
  assert.ok((camp.armorIds?.length ?? 0) >= 5);
  assert.ok((camp.gemIds?.length ?? 0) >= 3);
});

test('Blacksmith Mechanics: Armor Tempering (+0..+10), Leveling (Lv.1..20), Gem Socketing, and Fusion ascend stats & sockets', () => {
  let helm = createEquipmentInstance('iron_helm', { rarity: 'COMMON' });
  const fodderHelm = createEquipmentInstance('iron_helm', { rarity: 'COMMON' });
  const baseBonus = computeArmorInstanceBonuses(helm);
  assert.equal(getMaxSocketsForRarity(helm.rarity), 1);

  // 1. Temper +1 -> increases stats & deducts gold + temper_stone
  const temperRes = temperArmorInstance(helm, 1000, { temper_stone: 5 });
  assert.ok(temperRes !== null);
  helm = temperRes.updated;
  assert.equal(helm.temperLevel, 1);
  assert.ok(temperRes.nextGold < 1000);
  assert.ok((temperRes.nextBag.temper_stone ?? 0) < 5);
  assert.ok(computeArmorInstanceBonuses(helm).stats.def >= baseBonus.stats.def);

  // 2. Level Up Lv.1 -> Lv.2 -> scales stats cleanly
  const beforeLv = computeArmorInstanceBonuses(helm);
  const lvRes = levelUpArmorInstance(helm, 1000, { star_ingot: 5 });
  assert.ok(lvRes !== null);
  helm = lvRes.updated;
  assert.equal(helm.level, 2);
  const afterLv = computeArmorInstanceBonuses(helm);
  assert.ok(
    afterLv.stats.maxHp + afterLv.stats.def + afterLv.stats.res >
      beforeLv.stats.maxHp + beforeLv.stats.def + beforeLv.stats.res
  );

  // 3. Socket Ruby Gem, verify STR & Crit increase, then unsocket cleanly
  const sockRes = socketGemIntoArmor(helm, 'gem_ruby', { gem_ruby: 2 });
  assert.ok(sockRes !== null);
  helm = sockRes.updated;
  assert.equal(helm.gems[0], 'gem_ruby');
  assert.equal(sockRes.nextBag.gem_ruby, 1);
  assert.ok(computeArmorInstanceBonuses(helm).stats.str >= (GEMS.gem_ruby.statBonuses.str ?? 0));
  assert.ok(computeArmorInstanceBonuses(helm).crit >= (GEMS.gem_ruby.critBonus ?? 0));

  const unsockRes = unsocketGemFromArmor(helm, 0, sockRes.nextBag);
  assert.ok(unsockRes !== null);
  assert.equal(unsockRes.removedGemId, 'gem_ruby');
  assert.equal(unsockRes.updated.gems.length, 0);
  assert.equal(unsockRes.nextBag.gem_ruby, 2);

  // Put a gem on the fodder piece too, so fusion verifies returnedGems preservation
  const fodderSock = socketGemIntoArmor(fodderHelm, 'gem_sapphire', { gem_sapphire: 1 });
  assert.ok(fodderSock !== null);

  // 4. Fuse COMMON + COMMON -> RARE (scales stats & returns fodder's gem), then RARE + RARE -> EPIC (unlocks 2nd socket)
  const beforeFuse = computeArmorInstanceBonuses(unsockRes.updated);
  const fuseRes = fuseArmorInstances(unsockRes.updated, fodderSock.updated, 2000, { fusion_crystal: 4 });
  assert.ok(fuseRes !== null);
  assert.equal(fuseRes.fused.rarity, 'RARE');
  assert.equal(getMaxSocketsForRarity(fuseRes.fused.rarity), 1);
  assert.deepEqual(fuseRes.returnedGems, ['gem_sapphire']);
  assert.equal(fuseRes.nextBag.gem_sapphire, 1);
  const afterFuse = computeArmorInstanceBonuses(fuseRes.fused);
  assert.ok(
    afterFuse.stats.maxHp + afterFuse.stats.def > beforeFuse.stats.maxHp + beforeFuse.stats.def
  );

  const rareFodder = createEquipmentInstance('iron_helm', { rarity: 'RARE' });
  const epicFuse = fuseArmorInstances(fuseRes.fused, rareFodder, 3000, { fusion_crystal: 4 });
  assert.ok(epicFuse !== null);
  assert.equal(epicFuse.fused.rarity, 'EPIC');
  assert.equal(getMaxSocketsForRarity(epicFuse.fused.rarity), 2);
});

test('Weapon Forging & Full 5-Slot Armor Loadout directly boost effective stats and Combat Forecast damage/crit/avoid', () => {
  const bareHero = makeTestUnit({
    weapon: WEAPONS.iron_sword,
    stats: { maxHp: 24, str: 10, mag: 2, skl: 10, spd: 10, lck: 6, def: 7, res: 4, mov: 5 },
  });
  const enemy = makeTestUnit({
    id: 'enemy_forge_dummy',
    faction: 'ENEMY',
    isLord: false,
    weapon: WEAPONS.iron_lance,
    stats: { maxHp: 30, str: 11, mag: 1, skl: 9, spd: 8, lck: 4, def: 9, res: 4, mov: 5 },
  });

  // Equip 5 forged pieces + forged weapon
  const helm = createEquipmentInstance('iron_helm', { rarity: 'RARE' });
  const armor = createEquipmentInstance('valoria_mail', { rarity: 'RARE' });
  const gauntlets = createEquipmentInstance('warrior_bracers', { rarity: 'RARE' });
  const greaves = createEquipmentInstance('steel_greaves', { rarity: 'RARE' });
  const boots = createEquipmentInstance('cavalier_spurs', { rarity: 'EPIC' }); // adds +1 MOV & SPD

  const wTemp = temperWeaponForge(WEAPONS.iron_sword, undefined, 2000, { temper_stone: 10 });
  assert.ok(wTemp !== null);
  const wLv = levelUpWeaponForge(WEAPONS.iron_sword, wTemp.updated, 2000, { star_ingot: 10 });
  assert.ok(wLv !== null);
  const wFuse = fuseWeaponForge(WEAPONS.iron_sword, wLv.updated, ['iron_sword'], 2000, { fusion_crystal: 10 });
  assert.ok(wFuse !== null);
  assert.equal(wFuse.updated.rarity, 'RARE');
  assert.equal(wFuse.nextConvoyWeaponIds.length, 0);
  const wGem = socketGemIntoWeapon(WEAPONS.iron_sword, wFuse.updated, 'gem_ruby', { gem_ruby: 2 });
  assert.ok(wGem !== null);
  const wUnsock = unsocketGemFromWeapon(WEAPONS.iron_sword, wGem.updated, 0, wGem.nextBag);
  assert.ok(wUnsock !== null && wUnsock.removedGemId === 'gem_ruby');
  const wFinal = socketGemIntoWeapon(WEAPONS.iron_sword, wUnsock.updated, 'gem_ruby', wUnsock.nextBag)!.updated;

  const wfBonuses = computeWeaponForgeBonuses(WEAPONS.iron_sword, wFinal);
  assert.ok(wfBonuses.might > 0);
  assert.ok(wfBonuses.hit > 0);
  assert.ok(wfBonuses.crit > 0);

  const equippedHero: Unit = {
    ...bareHero,
    weaponForge: wFinal,
    equipment: {
      HELMET: helm,
      ARMOR: armor,
      GAUNTLETS: gauntlets,
      GREAVES: greaves,
      BOOTS: boots,
    },
  };

  const eqTotals = getUnitEquipmentBonuses(equippedHero);
  assert.ok(eqTotals.stats.maxHp > 0);
  assert.ok(eqTotals.stats.str > 0);
  assert.ok(eqTotals.stats.def > 0);
  assert.ok(eqTotals.stats.mov > 0);

  const effBare = getEffectiveUnitStats(bareHero);
  const effFull = getEffectiveUnitStats(equippedHero);
  assert.ok(effFull.maxHp > effBare.maxHp);
  assert.ok(effFull.str > effBare.str);
  assert.ok(effFull.def > effBare.def);
  assert.ok(effFull.mov > effBare.mov);

  const fcBare = calculateCombatForecast(bareHero, enemy, 'PLAIN', 'PLAIN', 1);
  const fcFull = calculateCombatForecast(equippedHero, enemy, 'PLAIN', 'PLAIN', 1);
  assert.ok(fcFull.attackerDamage > fcBare.attackerDamage, 'Forged weapon + armor should raise combat damage');
  assert.ok(fcFull.attackerCrit > fcBare.attackerCrit, 'Forged weapon + Ruby gem should raise crit rate');
  assert.ok(fcFull.defenderDamage < fcBare.defenderDamage, '5-slot armor should reduce incoming enemy damage');
});

test('Prestige Title Foot Aura scales colors, rings, and orbiting sparks across RARE, EPIC, and MYTHIC tiers', () => {
  const untitled = makeTestUnit({ id: 'u_none', equippedTitleId: undefined });
  const commonUnit = makeTestUnit({ id: 'u_common', equippedTitleId: 'vanguard_valoria' });
  const rareUnit = makeTestUnit({ id: 'u_rare', equippedTitleId: 'field_scout' });
  const epicUnit = makeTestUnit({ id: 'u_epic', equippedTitleId: 'arcane_initiate' });
  const mythicUnit = makeTestUnit({ id: 'u_mythic', equippedTitleId: 'chronicle_emperor' });

  assert.equal(computeTitleAuraVisual(untitled, 1.2), null);
  assert.equal(computeTitleAuraVisual(commonUnit, 1.2), null);

  const rareAura = computeTitleAuraVisual(rareUnit, 1.2);
  const epicAura = computeTitleAuraVisual(epicUnit, 1.2);
  const mythicAura = computeTitleAuraVisual(mythicUnit, 1.2);

  assert.ok(rareAura && rareAura.rarity === 'RARE');
  assert.ok(epicAura && epicAura.rarity === 'EPIC');
  assert.ok(mythicAura && mythicAura.rarity === 'MYTHIC');

  // Distinct outer colors per rarity tier
  assert.notEqual(rareAura.outerColor, epicAura.outerColor);
  assert.notEqual(epicAura.outerColor, mythicAura.outerColor);
  assert.notEqual(rareAura.outerColor, mythicAura.outerColor);

  // Escalating visual grandeur: orb count, radius, double rings & rising motes
  assert.ok(epicAura.orbCount > rareAura.orbCount);
  assert.ok(mythicAura.orbCount > epicAura.orbCount);
  assert.ok(mythicAura.radiusScale > epicAura.radiusScale);
  assert.equal(rareAura.hasDoubleRing, false);
  assert.equal(epicAura.hasDoubleRing, true);
  assert.equal(mythicAura.hasDoubleRing, true);
  assert.equal(mythicAura.hasRisingMotes, true);
});

test('Weather animation engine provides distinct multi-layered profiles and parallax particle motion for all 9 weathers', () => {
  const activeWeathers = [
    'RAIN',
    'STORM',
    'SNOW',
    'SUNLIGHT',
    'MIST',
    'SAND',
    'EMBERS',
    'SPARKS',
    'LEAVES',
  ] as const;

  assert.equal(getWeatherAnimationProfile('NONE').activeParticles, 0);
  assert.equal(getWeatherAnimationProfile('RAIN').hasSplashes, true);
  assert.equal(getWeatherAnimationProfile('STORM').hasLightning, true);
  assert.equal(getWeatherAnimationProfile('SUNLIGHT').hasGodRays, true);
  assert.equal(getWeatherAnimationProfile('MIST').hasMistBanks, true);
  assert.equal(getWeatherAnimationProfile('EMBERS').hasHeatGlow, true);
  assert.equal(getWeatherAnimationProfile('SAND').hasWindRibbons, true);

  for (const w of activeWeathers) {
    const profile = getWeatherAnimationProfile(w);
    assert.ok(profile.activeParticles >= 50, `${w} should render >= 50 parallax particles`);

    const backParticle = { x: 0.5, y: 0.5, vx: 0.02, vy: 0.03, size: 2, alpha: 0.5, phase: 0.4, depth: 0.7 };
    const frontParticle = { ...backParticle, depth: 1.3 };

    const nextBack = stepWeatherParticle(backParticle, w, 1.0, 0.1);
    const nextFront = stepWeatherParticle(frontParticle, w, 1.0, 0.1);

    // Coordinates stay wrapped cleanly inside [0, 1)
    assert.ok(nextFront.x >= 0 && nextFront.x < 1, `${w} x wrapped cleanly`);
    assert.ok(nextFront.y >= 0 && nextFront.y < 1, `${w} y wrapped cleanly`);

    // Foreground parallax particle moves faster than background particle
    const distBack = Math.hypot(nextBack.x - 0.5, nextBack.y - 0.5);
    const distFront = Math.hypot(nextFront.x - 0.5, nextFront.y - 0.5);
    assert.ok(distFront > distBack, `${w} foreground particle should exhibit stronger parallax motion`);
  }

  // Rising weathers (EMBERS, SPARKS) move upward (y decreases), falling weathers (RAIN, SNOW) move downward (y increases)
  const p0 = { x: 0.5, y: 0.5, vx: 0, vy: 0, size: 2, alpha: 0.7, phase: 0, depth: 1 };
  assert.ok(stepWeatherParticle(p0, 'RAIN', 0, 0.1).y > 0.5);
  assert.ok(stepWeatherParticle(p0, 'SNOW', 0, 0.1).y > 0.5);
  assert.ok(stepWeatherParticle(p0, 'EMBERS', 0, 0.1).y < 0.5);
  assert.ok(stepWeatherParticle(p0, 'SPARKS', 0, 0.1).y < 0.5);
});

test('Battle dialogue quote engine classifies HP% bands cleanly and maps all 121 classes + bosses to voice archetypes', () => {
  // HP% band boundary checks: HIGH >= 65%, MID 30%-64%, LOW < 30%
  assert.equal(getHpBand(30, 30), 'HIGH');
  assert.equal(getHpBand(20, 30), 'HIGH'); // 66.7%
  assert.equal(getHpBand(65, 100), 'HIGH');
  assert.equal(getHpBand(64, 100), 'MID');
  assert.equal(getHpBand(30, 100), 'MID');
  assert.equal(getHpBand(29, 100), 'LOW');
  assert.equal(getHpBand(1, 30), 'LOW');
  assert.equal(getHpBand(0, 30), 'LOW');
  assert.equal(computeHpPercent(9, 30), 30);

  // Specific archetype checks across distinct classes & enemy roles
  const staffWeapon = Object.values(WEAPONS).find((w) => w.type === 'STAFF') ?? WEAPONS.iron_sword;
  const lord = makeTestUnit({ classId: 'LORD', isLord: true, weapon: WEAPONS.iron_sword });
  const mage = makeTestUnit({ classId: 'MAGE', isLord: false, weapon: WEAPONS.fire_tome });
  const cleric = makeTestUnit({ classId: 'CLERIC', isLord: false, weapon: staffWeapon });
  const archer = makeTestUnit({ classId: 'ARCHER', isLord: false, weapon: WEAPONS.iron_bow });
  const wyvern = makeTestUnit({ classId: 'WYVERN_RIDER', isLord: false, moveType: 'FLYING', weapon: WEAPONS.iron_axe });
  const armored = makeTestUnit({ classId: 'KNIGHT', isLord: false, moveType: 'ARMORED', weapon: WEAPONS.iron_lance });
  const boss = makeTestUnit({ faction: 'ENEMY', isBoss: true, isLord: false, classId: 'GENERAL', moveType: 'ARMORED' });
  const grunt = makeTestUnit({ faction: 'ENEMY', isLord: false, classId: 'SOLDIER', moveType: 'FOOT', weapon: WEAPONS.iron_lance });

  assert.equal(resolveBattleVoiceArchetype(lord), 'ROYAL_LORD');
  assert.equal(resolveBattleVoiceArchetype(mage), 'MAGE');
  assert.equal(resolveBattleVoiceArchetype(cleric), 'CLERIC');
  assert.equal(resolveBattleVoiceArchetype(archer), 'ARCHER');
  assert.equal(resolveBattleVoiceArchetype(wyvern), 'FLIER');
  assert.equal(resolveBattleVoiceArchetype(armored), 'ARMORED');
  assert.equal(resolveBattleVoiceArchetype(boss), 'ENEMY_BOSS');
  assert.equal(resolveBattleVoiceArchetype(grunt), 'ENEMY_SOLDIER');

  // Every one of the 121 classes resolves to a valid archetype with non-empty HIGH/MID/LOW pools
  for (const meta of Object.values(CLASS_META)) {
    const primaryWeapon = meta.allowedWeaponTypes[0];
    const sample = makeTestUnit({
      classId: meta.id,
      moveType: meta.moveType,
      isLord: meta.id === 'LORD',
      weapon:
        primaryWeapon === 'TOME'
          ? WEAPONS.fire_tome
          : primaryWeapon === 'BOW'
          ? WEAPONS.iron_bow
          : primaryWeapon === 'STAFF'
          ? staffWeapon
          : primaryWeapon === 'AXE'
          ? WEAPONS.iron_axe
          : primaryWeapon === 'LANCE'
          ? WEAPONS.iron_lance
          : WEAPONS.iron_sword,
    });
    const arch = resolveBattleVoiceArchetype(sample);
    assert.ok(BATTLE_QUOTE_POOLS[arch].HIGH.length >= 4, `${meta.id} -> ${arch} HIGH pool`);
    assert.ok(BATTLE_QUOTE_POOLS[arch].MID.length >= 4, `${meta.id} -> ${arch} MID pool`);
    assert.ok(BATTLE_QUOTE_POOLS[arch].LOW.length >= 4, `${meta.id} -> ${arch} LOW pool`);
  }
});

test('pickBattleQuote selects randomized class/HP%-specific quotes and avoids immediate repetition', () => {
  const hero = makeTestUnit({ classId: 'LORD', isLord: true, weapon: WEAPONS.iron_sword });
  const mage = makeTestUnit({ classId: 'MAGE', weapon: WEAPONS.fire_tome });

  // Same RNG yields distinct pools for HIGH vs MID vs LOW HP%
  const qHigh = pickBattleQuote(hero, 30, 30, { rng: () => 0.1 });
  const qMid = pickBattleQuote(hero, 15, 30, { rng: () => 0.1 });
  const qLow = pickBattleQuote(hero, 5, 30, { rng: () => 0.1 });

  assert.equal(qHigh.hpBand, 'HIGH');
  assert.equal(qHigh.hpPercent, 100);
  assert.equal(qMid.hpBand, 'MID');
  assert.equal(qMid.hpPercent, 50);
  assert.equal(qLow.hpBand, 'LOW');
  assert.equal(qLow.hpPercent, 17);
  assert.notEqual(qHigh.text, qMid.text);
  assert.notEqual(qMid.text, qLow.text);
  assert.notEqual(qHigh.text, qLow.text);

  // Different classes get different quotes even at identical HP% and RNG
  const qMageHigh = pickBattleQuote(mage, 30, 30, { rng: () => 0.1 });
  assert.equal(qMageHigh.archetype, 'MAGE');
  assert.notEqual(qMageHigh.text, qHigh.text);

  // Deterministic RNG selects different items across the pool
  const q0 = pickBattleQuote(hero, 30, 30, { rng: () => 0.01 });
  const qLast = pickBattleQuote(hero, 30, 30, { rng: () => 0.99 });
  assert.notEqual(q0.text, qLast.text);

  // Anti-repeat guard prevents repeating the exact same quote back-to-back
  const qNoRepeat = pickBattleQuote(hero, 30, 30, { avoidText: q0.text, rng: () => 0.01 });
  assert.notEqual(qNoRepeat.text, q0.text);
});

test('HD-2D Enemy class palettes, twilight acted shading, and 48x48 RPG bust portraits are distinct and rich', () => {
  // Enemy archetypes get distinct armor hues rather than identical monochrome red cylinders
  const enemySoldierPal = getPaletteForUnit('SOLDIER', 'imperial_soldier', 'ENEMY', false, false);
  const enemyMagePal = getPaletteForUnit('DARK_MAGE', 'imperial_mage', 'ENEMY', false, false);
  const enemyKnightPal = getPaletteForUnit('KNIGHT', 'imperial_knight', 'ENEMY', false, false);
  const enemyBossPal = getPaletteForUnit('GENERAL', 'boss_cmd', 'ENEMY', true, false);

  assert.notEqual(enemySoldierPal.armorMid, enemyMagePal.armorMid);
  assert.notEqual(enemySoldierPal.armorMid, enemyKnightPal.armorMid);
  assert.notEqual(enemyMagePal.armorMid, enemyKnightPal.armorMid);
  assert.notEqual(enemyBossPal.capeMid, enemySoldierPal.capeMid);

  // Acted heroes retain readable twilight skin vs armor vs hair separation
  const actedKaelenPal = getPaletteForUnit('LORD', 'kaelen', 'PLAYER', false, true);
  assert.notEqual(actedKaelenPal.skinMid, actedKaelenPal.armorMid);
  assert.notEqual(actedKaelenPal.hairMid, actedKaelenPal.capeMid);

  // Procedural 48x48 RPG bust portrait fills full grid with rich shading across archetypes
  const sampleUnits = [
    makeTestUnit({ classId: 'LORD', templateId: 'rowan', tier: 1 }),
    makeTestUnit({ classId: 'SAMURAI', templateId: 'kenji', tier: 3, promoted: true }),
    makeTestUnit({ classId: 'DARK_MAGE', templateId: 'cultist', faction: 'ENEMY', tier: 2 }),
    makeTestUnit({ classId: 'TITAN_CITADEL', templateId: 'borin', tier: 4, promoted: true }),
  ];

  for (const u of sampleUnits) {
    const grid = renderUnitPortraitBuffer(u);
    assert.equal(grid.length, PORTRAIT_H);
    assert.equal(grid[0].length, PORTRAIT_W);
    const colors = new Set<string>();
    for (const row of grid) {
      for (const hex of row) {
        assert.ok(hex.startsWith('#') && hex.length === 7);
        colors.add(hex);
      }
    }
    assert.ok(
      colors.size >= 16,
      `Portrait for ${u.classId} should contain >=16 distinct shaded hues (got ${colors.size})`
    );
  }
});

test('120 Campaign maps span Medium, Large, and Colossal dimensions up to 36x22 with 8 non-identical AttackAxes', () => {
  const scaleBuckets = { 'Cỡ Vừa': 0, 'Cỡ Lớn': 0, 'Đại Chiến Trường': 0 };
  const axesSeen = new Set<string>();
  let maxArea = 0;

  for (const meta of CAMPAIGN_MAPS) {
    const label = getMapScaleLabel(meta.mapWidth, meta.mapHeight);
    scaleBuckets[label] += 1;
    axesSeen.add(pickAttackAxis(meta.id, meta.chapterInAct, meta.objective));
    maxArea = Math.max(maxArea, meta.mapWidth * meta.mapHeight);

    // Every speaker in intro & outro dialogues has a valid speakerClassId for 96x96 HD-2D portraits
    for (const line of [...meta.introDialogue, ...meta.outroDialogue]) {
      assert.ok(line.speakerClassId && CLASS_META[line.speakerClassId], `Map ${meta.id} speaker ${line.speaker} missing valid speakerClassId`);
    }
  }

  assert.ok(scaleBuckets['Cỡ Vừa'] >= 15, `Expected >=15 Medium maps, got ${scaleBuckets['Cỡ Vừa']}`);
  assert.ok(scaleBuckets['Cỡ Lớn'] >= 35, `Expected >=35 Large maps, got ${scaleBuckets['Cỡ Lớn']}`);
  assert.ok(scaleBuckets['Đại Chiến Trường'] >= 35, `Expected >=35 Colossal maps, got ${scaleBuckets['Đại Chiến Trường']}`);
  assert.equal(axesSeen.size, 8, 'All 8 distinct AttackAxis geometries must appear across campaign');
  assert.equal(maxArea, 36 * 22, 'Final Colossal maps reach 36x22 (792 tiles)');

  // Consecutive chapters inside Act 1 vary in dimensions & attack direction rather than repeating identical boxes
  const act1Shapes = CAMPAIGN_MAPS.slice(0, 6).map(
    (m) => `${m.mapWidth}x${m.mapHeight}:${pickAttackAxis(m.id, m.chapterInAct, m.objective)}`
  );
  assert.equal(new Set(act1Shapes).size, 6, 'First 6 chapters of Act 1 must each have distinct shape/axis');

  // Verify generated Colossal & North-South maps have >=12 spawns, 1-2 range Bosses, and Elite/Healer enemies
  for (const sampleId of [1, 4, 6, 10, 12, 60, 120]) {
    const gen = generateMap(sampleId);
    assert.equal(gen.width, gen.meta.mapWidth);
    assert.equal(gen.height, gen.meta.mapHeight);
    assert.ok(gen.playerSpawns.length >= 12, `Map ${sampleId} should provide >=12 deployment slots`);
    const boss = gen.enemies.find((e) => e.isBoss);
    assert.ok(boss, `Map ${sampleId} must have a Boss`);
    assert.equal(boss.weapon.minRange, 1, `Map ${sampleId} Boss must counter melee (minRange 1)`);
    assert.ok(boss.weapon.maxRange >= 2, `Map ${sampleId} Boss must counter ranged pokes (maxRange >= 2)`);
    assert.ok(gen.enemies.some((e) => e.aiPolicy === 'HEALER'), `Map ${sampleId} must field an Enemy Healer`);
    if (sampleId >= 2) {
      assert.ok(gen.enemies.some((e) => e.isElite), `Map ${sampleId} must field at least 1 Elite Sub-Commander`);
    }
  }
});

test('30-Hero Unlocked Pool, Custom Squad Selection, Direction-Aware Formations & Tile Swapping', () => {
  const roster = createInitialRoster();
  const act1Unlocked = buildUnlockedRosterUnits(1, roster, 1);
  const act8Unlocked = buildUnlockedRosterUnits(8, roster, 24);
  assert.equal(act1Unlocked.length, 8, 'Act 1 unlocks 8 heroes (6 active + 2 tactical reserves)');
  assert.equal(act8Unlocked.length, 30, 'All 30 playable heroes unlock by Act 8');

  // Custom preferredSquadIds overrides default squad while keeping Kaelen (isLord) mandatory
  const pickedLateIds = act8Unlocked.slice(-7).map((u) => u.templateId);
  const customSquad = buildPartyUnitsForAct(8, roster, 24, [], {}, 8, pickedLateIds);
  assert.equal(customSquad.length, 8);
  assert.equal(customSquad[0].templateId, 'kaelen', 'Lord Kaelen stays mandatory in slot 0');
  assert.ok(customSquad.some((u) => u.templateId === pickedLateIds[0]));
  assert.ok(customSquad.some((u) => u.templateId === pickedLateIds[1]));

  // Direction-aware formation presets work on both WEST_TO_EAST (Map 1) and SOUTH_TO_NORTH (Map 4)
  const map4 = generateMap(4); // SOUTH_TO_NORTH: spawns near bottom, Throne near y=2
  const party4 = buildPartyUnitsForAct(1, roster, 3, [], {}, map4.meta.maxDeploySlots);
  const phalanx4 = computeFormationPlacement(party4, map4.playerSpawns, 'PHALANX', map4.throneCoord);
  const spear4 = computeFormationPlacement(party4, map4.playerSpawns, 'SPEARHEAD', map4.throneCoord);
  const pincer4 = computeFormationPlacement(party4, map4.playerSpawns, 'PINCER', map4.throneCoord);

  // In SOUTH_TO_NORTH Phalanx, frontline armored/melee vanguard stands closer to northern Throne (smaller Y) than backline caster/cleric
  const frontTank = phalanx4.find((u) => u.moveType === 'ARMORED') ?? phalanx4[0];
  const backSupport =
    phalanx4.find((u) => u.weapon.type === 'STAFF' || u.weapon.type === 'TOME') ??
    phalanx4[phalanx4.length - 1];
  assert.ok(
    frontTank.y <= backSupport.y,
    `SOUTH_TO_NORTH Phalanx puts tank ${frontTank.name} (y=${frontTank.y}) ahead of support ${backSupport.name} (y=${backSupport.y})`
  );
  assert.notDeepEqual(
    spear4.map((u) => `${u.id}@${u.x},${u.y}`),
    pincer4.map((u) => `${u.id}@${u.x},${u.y}`)
  );

  // Tile swapping swaps two heroes or moves a hero onto an empty deployment slot
  const u0 = phalanx4[0];
  const u1 = phalanx4[1];
  const swapRes = swapOrMoveDeploymentUnit(
    phalanx4,
    { x: u0.x, y: u0.y },
    { x: u1.x, y: u1.y },
    map4.playerSpawns
  );
  assert.equal(swapRes.changed, true);
  assert.equal(swapRes.action, 'SWAPPED');
  const swappedU0 = swapRes.units.find((u) => u.id === u0.id)!;
  assert.equal(swappedU0.x, u1.x);
  assert.equal(swappedU0.y, u1.y);

  const occupiedKeys = new Set(swapRes.units.map((u) => `${u.x},${u.y}`));
  const emptySlot = map4.playerSpawns.find((s) => !occupiedKeys.has(`${s.x},${s.y}`))!;
  const moveRes = swapOrMoveDeploymentUnit(
    swapRes.units,
    { x: swappedU0.x, y: swappedU0.y },
    emptySlot,
    map4.playerSpawns
  );
  assert.equal(moveRes.changed, true);
  assert.equal(moveRes.action, 'MOVED');
});

test('Power Balancing: Enemy Healer AI heals wounded allies & Rubber-Band EXP scales fairly', () => {
  const grid: TerrainType[][] = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => 'PLAIN' as TerrainType)
  );
  const enemyHealer = makeTestUnit({
    id: 'enemy_healer',
    faction: 'ENEMY',
    classId: 'CLERIC',
    x: 5,
    y: 4,
    weapon: WEAPONS.heal_staff,
    aiPolicy: 'HEALER',
  });
  const woundedGrunt = makeTestUnit({
    id: 'enemy_wounded',
    faction: 'ENEMY',
    classId: 'SOLDIER',
    x: 4,
    y: 4,
    hp: 8,
    stats: { maxHp: 28, str: 9, mag: 1, skl: 8, spd: 8, lck: 5, def: 8, res: 3, mov: 5 },
  });
  const playerHero = makeTestUnit({
    id: 'player_1',
    faction: 'PLAYER',
    x: 1,
    y: 4,
  });

  const decision = decideEnemyAction(enemyHealer, grid, [enemyHealer, woundedGrunt, playerHero]);
  assert.equal(decision.healTargetId, 'enemy_wounded', 'Enemy Healer prioritizes wounded frontline ally');

  // Rubber-band EXP: underleveled hero earns bonus EXP; overleveled hero earns reduced EXP
  const underLvlHero = makeTestUnit({ level: 3, tier: 1 });
  const expUnder = computeCombatExpGain(3, 7, true, true);
  const expOver = computeCombatExpGain(12, 7, true, true);
  assert.ok(expUnder > expOver + 25, `Underleveled kill EXP (${expUnder}) should meaningfully exceed overleveled EXP (${expOver})`);
  assert.ok(computeUnitCombatPower(underLvlHero) > 0);
});

test('Tactical Proximity Rules: adjacent (1 tile) allies can trade; distant allies (>1 tile) cannot trade or pull from Convoy', () => {
  const kaelen = makeTestUnit({
    id: 'u_kaelen',
    templateId: 'kaelen',
    name: 'Kaelen',
    isLord: true,
    x: 2,
    y: 2,
  });
  const adjacentAlly = makeTestUnit({
    id: 'u_adj',
    templateId: 'garrett',
    name: 'Garrett',
    isLord: false,
    x: 3,
    y: 2,
  });
  const diagonalAlly = makeTestUnit({
    id: 'u_diag',
    templateId: 'lyra',
    name: 'Lyra',
    isLord: false,
    x: 3,
    y: 3,
  });
  const distantAlly = makeTestUnit({
    id: 'u_far',
    templateId: 'sylas',
    name: 'Sylas',
    isLord: false,
    x: 8,
    y: 2,
  });
  const benchedHero = makeTestUnit({
    id: 'u_bench',
    templateId: 'elena',
    name: 'Elena',
    isLord: false,
    x: 0,
    y: 0,
  });

  const deployed = [kaelen, adjacentAlly, diagonalAlly, distantAlly];

  // Adjacency checks (orthogonal Manhattan distance === 1)
  assert.equal(areUnitsAdjacentForTrade(kaelen, adjacentAlly), true);
  assert.equal(areUnitsAdjacentForTrade(kaelen, diagonalAlly), false, 'Diagonal (dist 2) is not orthogonally adjacent');
  assert.equal(areUnitsAdjacentForTrade(kaelen, distantAlly), false, '6 tiles away cannot trade in battle');
  assert.equal(getAdjacentTradePartners(kaelen, deployed).length, 1);
  assert.equal(getAdjacentTradePartners(kaelen, deployed)[0].id, 'u_adj');

  // Convoy access rules: TOTALLY SEALED mid-battle for everyone including Lord Kaelen!
  assert.equal(canUnitAccessConvoy(kaelen, deployed, false), false, 'Even Lord Kaelen cannot access Convoy mid-battle');
  assert.equal(canUnitAccessConvoy(adjacentAlly, deployed, false), false, 'Adjacent ally cannot access Convoy mid-battle');
  assert.equal(canUnitAccessConvoy(diagonalAlly, deployed, false), false, 'Diagonal ally cannot access Convoy mid-battle');
  assert.equal(canUnitAccessConvoy(distantAlly, deployed, false), false, 'Distant ally cannot access Convoy mid-battle');
  assert.equal(canUnitAccessConvoy(kaelen, deployed, true), true, 'Lord Kaelen accesses Convoy when out of battle');
  assert.equal(canUnitAccessConvoy(distantAlly, deployed, true), true, 'Everyone accesses Convoy freely when out of battle');

  // Taking equipped armor from another owner
  const farArmorCheck = canUnitTakeEquippedArmorFromOwner(distantAlly, kaelen, deployed, false);
  assert.equal(farArmorCheck.allowed, false, 'Distant unit cannot strip armor off Kaelen 6 tiles away');
  assert.equal(farArmorCheck.distance, 6);

  const benchArmorCheck = canUnitTakeEquippedArmorFromOwner(distantAlly, benchedHero, deployed, false);
  assert.equal(benchArmorCheck.allowed, false, 'Cannot strip armor off a benched hero back at camp mid-battle');

  const farConvoyArmorCheck = canUnitTakeEquippedArmorFromOwner(distantAlly, undefined, deployed, false);
  assert.equal(farConvoyArmorCheck.allowed, false, 'Distant unit cannot pull unequipped armor from Convoy mid-battle');

  const adjArmorCheck = canUnitTakeEquippedArmorFromOwner(adjacentAlly, kaelen, deployed, false);
  assert.equal(adjArmorCheck.allowed, true, 'Adjacent ally (1 tile) can receive armor from Kaelen');
  assert.equal(adjArmorCheck.distance, 1);

  const campArmorCheck = canUnitTakeEquippedArmorFromOwner(distantAlly, benchedHero, [], true);
  assert.equal(campArmorCheck.allowed, true, 'In Camp Hub (isFreeLogistics = true), any two heroes can swap armor freely');
});

test('Unit-to-Unit Trading & Camp Hub Logistics: weapons, 5-slot armor, potions, and exact potion save persistence', () => {
  const helmetA = createEquipmentInstance('iron_helm', { uid: 'test_helm_a' });
  const helmetB = createEquipmentInstance('knight_sallet', { uid: 'test_helm_b' });
  const altSword = Object.values(WEAPONS).find((w) => w.type === 'SWORD' && w.id !== 'iron_sword' && w.id !== 'steel_sword')!;

  const heroA = makeTestUnit({
    id: 'kaelen',
    templateId: 'kaelen',
    name: 'Kaelen',
    classId: 'LORD',
    isLord: true,
    x: 4,
    y: 4,
    weapon: WEAPONS.iron_sword,
    inventory: [WEAPONS.iron_sword, WEAPONS.steel_sword],
    equipment: { HELMET: helmetA },
    potions: 2,
  });

  const heroFar = makeTestUnit({
    id: 'lyra_far',
    templateId: 'lyra',
    name: 'Lyra',
    classId: 'MERCENARY',
    x: 9,
    y: 9,
    weapon: altSword,
    inventory: [altSword],
    equipment: { HELMET: helmetB },
    potions: 2,
  });

  // 1. Mid-battle trade fails when units are far apart (dist = 10)
  assert.equal(tradeWeaponBetweenUnits(heroA, heroFar, 1, { isFreeLogistics: false }), null);
  assert.equal(tradeArmorSlotBetweenUnits(heroA, heroFar, 'HELMET', { isFreeLogistics: false }), null);
  assert.equal(tradePotionBetweenUnits(heroA, heroFar, false), null);

  // 2. Move Lyra orthogonally adjacent (dist = 1) -> trades succeed!
  const heroAdj: Unit = { ...heroFar, id: 'lyra', x: 5, y: 4 };

  const giveRes = tradeWeaponBetweenUnits(heroA, heroAdj, 1, { isFreeLogistics: false });
  assert.ok(giveRes, 'Adjacent hero can hand over spare steel_sword');
  assert.equal(giveRes.fromUnit.inventory.length, 1);
  assert.equal(giveRes.toUnit.inventory.length, 2);

  // Cannot give away the very last equippable weapon (prevents unarmed softlock)
  assert.equal(
    tradeWeaponBetweenUnits(giveRes.fromUnit, giveRes.toUnit, 0, { isFreeLogistics: false }),
    null,
    'Unit cannot hand away their last equippable weapon without receiving one back'
  );

  // 1-for-1 weapon swap works cleanly even when unitA only has 1 weapon
  const swapRes = tradeWeaponBetweenUnits(giveRes.fromUnit, giveRes.toUnit, 0, {
    swapToWeaponIndex: 1,
    isFreeLogistics: false,
  });
  assert.ok(swapRes, '1-for-1 swap between iron_sword and steel_sword succeeds');
  assert.equal(swapRes.fromUnit.weapon.id, 'steel_sword');

  // Personal weapon equip switches active weapon from personal inventory
  const personalSwitch = equipPersonalWeapon(giveRes.toUnit, 'steel_sword');
  assert.ok(personalSwitch);
  assert.equal(personalSwitch.weapon.id, 'steel_sword');

  // 5-slot Armor swap between adjacent allies
  const armorTrade = tradeArmorSlotBetweenUnits(heroA, heroAdj, 'HELMET', { isFreeLogistics: false });
  assert.ok(armorTrade, 'Adjacent allies swap HELMET slot');
  assert.equal(armorTrade.unitA.equipment?.HELMET?.uid, 'test_helm_b');
  assert.equal(armorTrade.unitB.equipment?.HELMET?.uid, 'test_helm_a');

  // Convoy weapon deposit & withdrawal
  const stored = storeUnitWeaponToConvoy(heroA, 'steel_sword', []);
  assert.ok(stored);
  assert.deepEqual(stored.nextConvoyWeaponIds, ['steel_sword']);
  const withdrawn = withdrawConvoyWeaponToUnit(stored.updatedUnit, 'steel_sword', stored.nextConvoyWeaponIds, true);
  assert.ok(withdrawn);
  assert.equal(withdrawn.updatedUnit.weapon.id, 'steel_sword');
  assert.equal(withdrawn.nextConvoyWeaponIds.length, 0);

  // 3. Camp Hub Free Logistics (isFreeLogistics = true) works regardless of coordinates + preserves exact potion counts
  const campPotionTrade = tradePotionBetweenUnits(heroA, heroFar, true);
  assert.ok(campPotionTrade, 'Camp Hub allows trading potions freely between any unlocked heroes');
  assert.equal(campPotionTrade.fromUnit.potions, 1);
  assert.equal(campPotionTrade.toUnit.potions, 3);

  const freshSave = createFreshSave();
  const mergedCampSave = mergeUnitsIntoSavedRoster(
    freshSave,
    [campPotionTrade.fromUnit, { ...campPotionTrade.toUnit, templateId: 'lyra', id: 'lyra' }],
    { restockPotions: false }
  );
  const hydratedCampRoster = buildUnlockedRosterUnits(
    1,
    mergedCampSave.roster,
    1,
    mergedCampSave.equipmentBag ?? [],
    mergedCampSave.weaponForges ?? {}
  );
  const savedKaelen = hydratedCampRoster.find((u) => u.templateId === 'kaelen')!;
  const savedLyra = hydratedCampRoster.find((u) => u.templateId === 'lyra')!;
  assert.equal(savedKaelen.potions, 1, 'Camp trade preserves exact 1 potion on giver without duplicating');
  assert.equal(savedLyra.potions, 3, 'Camp trade preserves exact 3 potions on recipient');

  // Post-battle VICTORY restocks depleted potions back up to >= 2
  const postVictorySave = mergeUnitsIntoSavedRoster(mergedCampSave, [savedKaelen, savedLyra], {
    restockPotions: true,
  });
  const postVictoryRoster = buildUnlockedRosterUnits(
    1,
    postVictorySave.roster,
    1,
    postVictorySave.equipmentBag ?? [],
    postVictorySave.weaponForges ?? {}
  );
  assert.equal(postVictoryRoster.find((u) => u.templateId === 'kaelen')!.potions, 2);
  assert.equal(postVictoryRoster.find((u) => u.templateId === 'lyra')!.potions, 3);

  // Camp Hub dialogue & sparring constants sanity check
  const dialogue = getHeroCampDialogue(savedKaelen);
  assert.ok(dialogue.greeting.length > 10);
  assert.ok(dialogue.campaignThought.length > 10);
  assert.equal(CAMP_SPARRING_COST_GOLD, 100);
  assert.equal(CAMP_SPARRING_EXP_GAIN, 50);
});

test('Carry Limit (6/6 Excludes Worn Armor & Equipped Weapon), Dedicated Convoy Transfers, Auto-Convoy Overflow & 0.05%-0.1% Battle Loot Drop', () => {
  assert.equal(MAX_UNIT_CARRY_SLOTS, 6);
  assert.equal(MIN_BATTLE_LOOT_DROP_CHANCE, 0.0005);
  assert.equal(MAX_BATTLE_LOOT_DROP_CHANCE, 0.001);

  // Verify fresh campaign starter roster excludes equipped weapon & worn Mũ/Giáp/Giày:
  // Kaelen wears 5 armor pieces + wields iron_sword, and carries 2 spare swords + 2 potions = 4/6!
  // Soren wields fire + carries 3 spare tomes + 2 potions = 5/6!
  const freshSave = createFreshSave();
  const starterUnits = buildUnlockedRosterUnits(
    1,
    freshSave.roster,
    1,
    freshSave.equipmentBag ?? [],
    freshSave.weaponForges ?? {}
  );
  const starterKaelen = starterUnits.find((u) => u.templateId === 'kaelen')!;
  const starterSoren = starterUnits.find((u) => u.templateId === 'soren')!;
  assert.equal(Object.keys(starterKaelen.equipment ?? {}).length, 5, 'Kaelen wears all 5 armor slots');
  assert.equal(getSpareWeaponCount(starterKaelen), 2);
  assert.equal(getUnitCarryCount(starterKaelen), 4, 'Kaelen 5 worn armor + 1 equipped sword = 0 bag slots; 2 spare swords + 2 potions = 4/6');
  assert.equal(getUnitCarryCount(starterSoren), 5, 'Soren 1 equipped tome = 0 bag slots; 3 spare tomes + 2 potions = 5/6');

  const wornHelmet = createEquipmentInstance('iron_helm', { uid: 'worn_helm_1' });
  const wornArmor = createEquipmentInstance('valoria_mail', { uid: 'worn_armor_1' });
  const wornGauntlets = createEquipmentInstance('warrior_bracers', { uid: 'worn_gaunt_1' });
  const wornGreaves = createEquipmentInstance('steel_greaves', { uid: 'worn_greaves_1' });
  const wornBoots = createEquipmentInstance('swift_boots', { uid: 'worn_boots_1' });
  const spareBoots = createEquipmentInstance('swift_boots', { uid: 'spare_boots_1' });
  const convoyRing = createEquipmentInstance('warrior_bracers', { uid: 'convoy_bracers_1' });

  let hero = makeTestUnit({
    id: 'kaelen',
    templateId: 'kaelen',
    name: 'Kaelen',
    classId: 'LORD',
    isLord: true,
    x: 2,
    y: 2,
    weapon: starterKaelen.weapon, // Equipped weapon in hand = 0 bag slots
    inventory: [...starterKaelen.inventory], // 1 equipped + 2 spare weapons = 2 bag slots
    potions: 2, // +2 = 4 bag slots
    carriedItems: ['master_seal'], // +1 = 5 bag slots
    carriedArmorUids: [spareBoots.uid], // +1 = 6 bag slots (FULL 6/6!)
    equipment: {
      HELMET: wornHelmet,
      ARMOR: wornArmor,
      GAUNTLETS: wornGauntlets,
      GREAVES: wornGreaves,
      BOOTS: wornBoots,
    }, // All 5 worn slots (Mũ, Giáp, Tay, Chân, Giày) = 0 bag slots!
  });

  assert.equal(getSpareWeaponCount(hero), 2);
  assert.equal(
    getUnitCarryCount(hero),
    6,
    'Worn 5-slot Mũ/Giáp/Giày + equipped weapon excluded; 2 spare weapons + 2 potions + 1 item + 1 spare armor = 6/6'
  );
  assert.equal(isUnitCarryFull(hero), true);

  // Full pack (6/6) blocks withdrawing a 7th spare item/weapon/potion/armor INTO the bag
  assert.equal(withdrawConvoyWeaponToUnit(hero, 'silver_sword', ['silver_sword'], false), null);
  assert.equal(withdrawConvoyPotionToUnit(hero, { vulnerary: 3 }), null);
  assert.equal(withdrawConvoyItemToUnit(hero, 'energy_drop', { energy_drop: 2 }), null);
  assert.equal(
    withdrawConvoyArmorToUnit(hero, convoyRing.uid, [wornHelmet, spareBoots, convoyRing], [hero]),
    null
  );

  // However, equipping a weapon directly into hand (`equipImmediately = true`) WORKS even at 6/6
  // by swapping the old equipped weapon (`iron_sword`) back into Kho Quân Đoàn!
  const swappedEquip = withdrawConvoyWeaponToUnit(hero, 'silver_sword', ['silver_sword'], true);
  assert.ok(swappedEquip, 'Direct weapon equip at 6/6 swaps old equipped weapon back to Convoy');
  assert.equal(swappedEquip.updatedUnit.weapon.id, 'silver_sword');
  assert.deepEqual(swappedEquip.nextConvoyWeaponIds, ['iron_sword']);
  assert.equal(getUnitCarryCount(swappedEquip.updatedUnit), 6, 'Bag count stays cleanly at 6/6 after weapon swap');

  // Deposit 1 potion and 1 personal item to Convoy -> frees 2 slots (4/6)
  const storedPot = storeUnitPotionToConvoy(hero, { vulnerary: 1 });
  assert.ok(storedPot);
  assert.equal(storedPot.nextItemBag.vulnerary, 2);
  hero = storedPot.updatedUnit;
  assert.equal(getUnitCarryCount(hero), 5);

  const storedItem = storeUnitItemToConvoy(hero, 0, storedPot.nextItemBag);
  assert.ok(storedItem);
  assert.equal(storedItem.itemId, 'master_seal');
  assert.equal(storedItem.nextItemBag.master_seal, 1);
  hero = storedItem.updatedUnit;
  assert.equal(getUnitCarryCount(hero), 4);

  // Store & withdraw spare armor in Convoy
  const storedArm = storeUnitArmorToConvoy(hero, spareBoots.uid);
  assert.ok(storedArm);
  hero = storedArm.updatedUnit;
  assert.equal(getUnitCarryCount(hero), 3);

  const withdrawnArm = withdrawConvoyArmorToUnit(
    hero,
    convoyRing.uid,
    [wornHelmet, spareBoots, convoyRing],
    [hero]
  );
  assert.ok(withdrawnArm);
  hero = withdrawnArm.updatedUnit;
  assert.equal(getUnitCarryCount(hero), 4);

  // Adjacent personal item & carried armor trades respect 1-tile adjacency and 6/6 limit
  const allyAdj = makeTestUnit({
    id: 'lyra',
    templateId: 'lyra',
    name: 'Lyra',
    x: 3,
    y: 2,
    inventory: [WEAPONS.iron_sword],
    potions: 1,
    carriedItems: ['speedwing'],
  });
  const itemTrade = tradePersonalItemBetweenUnits(allyAdj, hero, 0, false);
  assert.ok(itemTrade, 'Adjacent ally transfers speedwing into hero pack (now 5/6)');
  hero = itemTrade.toUnit;
  assert.equal(getUnitCarryCount(hero), 5);

  const armorTrade = tradeCarriedArmorBetweenUnits(
    hero,
    itemTrade.fromUnit,
    convoyRing.uid,
    [wornHelmet, spareBoots, convoyRing],
    false
  );
  assert.ok(armorTrade, 'Adjacent hero transfers carried armor to ally');
  hero = armorTrade.fromUnit;
  assert.equal(getUnitCarryCount(hero), 4);

  // Battle victory loot drop probability strictly within [0.0005, 0.001] (0.05% - 0.1%)
  const gruntChance = computeBattleLootDropChance({ stats: { ...hero.stats, lck: 0 } }, { isBoss: false, isElite: false });
  const bossChance = computeBattleLootDropChance({ stats: { ...hero.stats, lck: 99 } }, { isBoss: true, isElite: true });
  assert.ok(gruntChance >= 0.0005 && gruntChance <= 0.001);
  assert.ok(bossChance >= 0.0005 && bossChance <= 0.001);
  assert.equal(gruntChance, 0.0005);
  assert.equal(bossChance, 0.001);

  // Roll >= dropChance -> no drop
  const noDrop = rollAndDeliverBattleLootDrop(
    hero,
    { isBoss: false, isElite: false },
    { convoyWeaponIds: [], itemBag: {}, equipmentBag: [wornHelmet] },
    () => 0.5
  );
  assert.equal(noDrop, null);

  // Roll < dropChance when hero has free space (4/6) -> goes directly into hero's personal pack!
  let seq = [0.0001, 0.0, 0.5]; // triggers drop, picks index 0 (first WEAPON)
  let seqIdx = 0;
  const packDrop = rollAndDeliverBattleLootDrop(
    hero,
    { isBoss: false, isElite: false },
    { convoyWeaponIds: [], itemBag: {}, equipmentBag: [wornHelmet] },
    () => seq[seqIdx++ % seq.length]
  );
  assert.ok(packDrop, 'Drop triggers when RNG < 0.05%-0.1% threshold');
  assert.equal(packDrop.drop.sentToConvoy, false, 'Hero had 4/6 slots so drop goes to hero pack');
  assert.equal(getUnitCarryCount(packDrop.updatedWinner), 5);
  assert.equal(packDrop.nextConvoyWeaponIds.length, 0);

  // Fill hero to 6/6, then trigger another drop -> MUST automatically route straight into Kho Quân Đoàn!
  const fullWinner: Unit = {
    ...packDrop.updatedWinner,
    potions: packDrop.updatedWinner.potions + 1, // 6/6 FULL!
  };
  assert.equal(getUnitCarryCount(fullWinner), 6);
  assert.equal(isUnitCarryFull(fullWinner), true);

  for (const frac of [0.02, 0.42, 0.78, 0.96]) {
    let callIdx = 0;
    const vals = [0.0001, frac, 0.85];
    const overflowDrop = rollAndDeliverBattleLootDrop(
      fullWinner,
      { isBoss: true, isElite: false },
      { convoyWeaponIds: [], itemBag: {}, equipmentBag: [wornHelmet] },
      () => vals[callIdx++ % vals.length]
    );
    assert.ok(overflowDrop);
    assert.equal(overflowDrop.drop.sentToConvoy, true, 'Full 6/6 winner automatically sends dropped item straight to Convoy');
    assert.equal(getUnitCarryCount(overflowDrop.updatedWinner), 6, 'Winner pack never exceeds 6/6');
    const addedToConvoy =
      overflowDrop.nextConvoyWeaponIds.length > 0 ||
      Object.keys(overflowDrop.nextItemBag).length > 0 ||
      overflowDrop.nextEquipmentBag.length > 1;
    assert.equal(addedToConvoy, true, 'Dropped item was stored into Kho Quân Đoàn');
  }
});



