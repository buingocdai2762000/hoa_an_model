import { CAMPAIGN_MAPS, getCampaignMapById } from './campaignData';
import {
  CLASS_META,
  TERRAIN_DATA,
  WEAPONS,
  canUnitStandOnTerrain,
  isNavalPassableTerrain,
} from './data';
import type {
  AIPolicy,
  BiomeId,
  FormationPresetId,
  GeneratedMapData,
  MapObjective,
  TerrainType,
  TheaterProfile,
  TileCoord,
  Unit,
  UnitClassId,
} from './types';

// Deterministic Mulberry32 PRNG so every Map 1..200 has a consistent, reproducible layout
export function createSeededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type AttackAxis =
  | 'WEST_TO_EAST'
  | 'EAST_TO_WEST'
  | 'SOUTH_TO_NORTH'
  | 'NORTH_TO_SOUTH'
  | 'NORTH_W_TO_SOUTH_E'
  | 'SOUTH_W_TO_NORTH_E'
  | 'SPLIT_PINCER'
  | 'CENTER_HOLDOUT';

export function pickAttackAxis(
  mapId: number,
  chapterInAct: number,
  objective: MapObjective
): AttackAxis {
  if (mapId === 1) return 'WEST_TO_EAST';
  if (objective === 'SURVIVE' || chapterInAct === 6) return 'CENTER_HOLDOUT';
  const actIdx = Math.floor((mapId - 1) / 12);
  switch (chapterInAct) {
    case 2:
      return 'NORTH_W_TO_SOUTH_E';
    case 3:
      return actIdx % 2 === 0 ? 'EAST_TO_WEST' : 'WEST_TO_EAST';
    case 4:
      return 'SOUTH_TO_NORTH';
    case 5:
      return actIdx % 2 === 0 ? 'NORTH_TO_SOUTH' : 'EAST_TO_WEST';
    case 7:
      return 'SOUTH_W_TO_NORTH_E';
    case 8:
      return actIdx % 3 === 0 ? 'NORTH_TO_SOUTH' : 'WEST_TO_EAST';
    case 9:
      return 'SOUTH_TO_NORTH';
    case 10:
      return 'SPLIT_PINCER';
    case 11:
      return actIdx % 2 === 0 ? 'SOUTH_W_TO_NORTH_E' : 'NORTH_W_TO_SOUTH_E';
    case 12:
    default:
      return actIdx % 3 === 2 ? 'SOUTH_TO_NORTH' : actIdx % 2 === 1 ? 'SPLIT_PINCER' : 'WEST_TO_EAST';
  }
}

function getBiomeBaseTerrain(biome: BiomeId): TerrainType {
  switch (biome) {
    case 'SOLARA_DESERT':
      return 'SAND';
    case 'FROSTPEAK_TUNDRA':
      return 'SNOW';
    case 'AETHELGARD_CITY':
    case 'CRIMSON_SANCTUM':
      return 'ROAD';
    default:
      return 'PLAIN';
  }
}

function getBiomeHazardTerrain(biome: BiomeId): TerrainType {
  switch (biome) {
    case 'MAGMA_FORTRESS':
    case 'CRIMSON_SANCTUM':
      return 'LAVA';
    case 'HOWLING_CANYON':
    case 'FROSTPEAK_TUNDRA':
      return 'MOUNTAIN';
    case 'AETHELGARD_CITY':
      return 'WALL';
    default:
      return 'WATER';
  }
}

function isFootPassable(t: TerrainType): boolean {
  return TERRAIN_DATA[t].moveCost.FOOT < 99;
}

function clampCoord(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function carveWindingRoad(
  grid: TerrainType[][],
  from: TileCoord,
  to: TileCoord,
  rng: () => number,
  wide = false
): void {
  const height = grid.length;
  const width = grid[0].length;
  let cx = clampCoord(from.x, 0, width - 1);
  let cy = clampCoord(from.y, 0, height - 1);
  const tx = clampCoord(to.x, 0, width - 1);
  const ty = clampCoord(to.y, 0, height - 1);

  const paintRoad = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const cur = grid[y][x];
    if (cur === 'FORT' || cur === 'THRONE' || cur === 'SHOP_ARMORY' || cur === 'SHOP_VENDOR') return;
    grid[y][x] = cur === 'WATER' || cur === 'LAVA' ? 'BRIDGE' : 'ROAD';
  };

  paintRoad(cx, cy);
  let guard = 0;
  while ((cx !== tx || cy !== ty) && guard < width * height) {
    guard++;
    const dx = tx - cx;
    const dy = ty - cy;
    const moveHoriz =
      dx !== 0 && (dy === 0 || Math.abs(dx) / (Math.abs(dx) + Math.abs(dy)) > rng() * 0.85);
    if (moveHoriz) {
      cx += dx > 0 ? 1 : -1;
    } else if (dy !== 0) {
      cy += dy > 0 ? 1 : -1;
    }
    paintRoad(cx, cy);
    if (wide) {
      if (Math.abs(dx) >= Math.abs(dy) && cy + 1 < height - 1) paintRoad(cx, cy + 1);
      else if (cx + 1 < width - 1) paintRoad(cx + 1, cy);
    }
  }
}

function stampOrganicBlob(
  grid: TerrainType[][],
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  terrain: TerrainType,
  rng: () => number
): void {
  const height = grid.length;
  const width = grid[0].length;
  const minY = Math.max(1, Math.floor(cy - ry));
  const maxY = Math.min(height - 2, Math.ceil(cy + ry));
  const minX = Math.max(1, Math.floor(cx - rx));
  const maxX = Math.min(width - 2, Math.ceil(cx + rx));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const nx = (x - cx) / Math.max(1, rx);
      const ny = (y - cy) / Math.max(1, ry);
      const distSq = nx * nx + ny * ny;
      if (distSq <= 0.72 + rng() * 0.42) {
        grid[y][x] = terrain;
      }
    }
  }
}

/**
 * Guarantees every walkable spawn, shop, throne & enemy anchor connects to playerSpawn[0] via foot-passable tiles,
 * while strictly preserving protected WATER tiles (naval deployment berths & naval enemy warships).
 */
function ensureConnectivity(
  grid: TerrainType[][],
  origin: TileCoord,
  targets: TileCoord[],
  protectedWaterTiles?: Set<string>
): void {
  const height = grid.length;
  const width = grid[0].length;
  const dirs: Array<[number, number]> = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  const getReachableSet = (): Set<string> => {
    const visited = new Set<string>();
    const queue: TileCoord[] = [origin];
    visited.add(`${origin.x},${origin.y}`);
    while (queue.length > 0) {
      const cur = queue.shift()!;
      for (const [dx, dy] of dirs) {
        const nx = cur.x + dx;
        const ny = cur.y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const key = `${nx},${ny}`;
        if (visited.has(key)) continue;
        if (isFootPassable(grid[ny][nx])) {
          visited.add(key);
          queue.push({ x: nx, y: ny });
        }
      }
    }
    return visited;
  };

  if (!isFootPassable(grid[origin.y][origin.x])) {
    grid[origin.y][origin.x] = 'ROAD';
  }

  let reachable = getReachableSet();
  for (const target of targets) {
    const targetKey = `${target.x},${target.y}`;
    if (protectedWaterTiles?.has(targetKey)) continue;
    if (!isFootPassable(grid[target.y][target.x])) {
      grid[target.y][target.x] = 'ROAD';
    }
    if (reachable.has(targetKey)) continue;

    // Dijkstra shortest carve from current reachable foot network to target avoiding protectedWaterTiles
    const dist = Array.from({ length: height }, () => Array(width).fill(Infinity));
    const prev: Array<Array<TileCoord | null>> = Array.from({ length: height }, () =>
      Array(width).fill(null)
    );
    const bucket: TileCoord[] = [];
    for (const rKey of reachable) {
      const [rxStr, ryStr] = rKey.split(',');
      const rx = Number(rxStr);
      const ry = Number(ryStr);
      dist[ry][rx] = 0;
      bucket.push({ x: rx, y: ry });
    }

    while (bucket.length > 0) {
      let bestIdx = 0;
      for (let i = 1; i < bucket.length; i++) {
        if (dist[bucket[i].y][bucket[i].x] < dist[bucket[bestIdx].y][bucket[bestIdx].x]) {
          bestIdx = i;
        }
      }
      const cur = bucket.splice(bestIdx, 1)[0];
      if (cur.x === target.x && cur.y === target.y) break;
      const curDist = dist[cur.y][cur.x];

      for (const [dx, dy] of dirs) {
        const nx = cur.x + dx;
        const ny = cur.y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const nKey = `${nx},${ny}`;
        const stepCost = isFootPassable(grid[ny][nx])
          ? 0
          : protectedWaterTiles?.has(nKey)
          ? 5000
          : grid[ny][nx] === 'WATER' || grid[ny][nx] === 'LAVA'
          ? 1
          : 2;
        const nextDist = curDist + stepCost;
        if (nextDist < dist[ny][nx]) {
          dist[ny][nx] = nextDist;
          prev[ny][nx] = cur;
          bucket.push({ x: nx, y: ny });
        }
      }
    }

    let step: TileCoord | null = target;
    while (step) {
      const sKey = `${step.x},${step.y}`;
      if (!isFootPassable(grid[step.y][step.x]) && !protectedWaterTiles?.has(sKey)) {
        grid[step.y][step.x] =
          grid[step.y][step.x] === 'WATER' || grid[step.y][step.x] === 'LAVA' ? 'BRIDGE' : 'ROAD';
      }
      step = prev[step.y][step.x];
    }

    reachable = getReachableSet();
  }
}

function pickEnemyWeaponId(classId: UnitClassId, actNumber: number, isElite = false): string {
  const meta = CLASS_META[classId];
  const tier = actNumber >= 13 ? 4 : actNumber >= 9 ? 3 : actNumber >= 5 ? 2 : 1;
  const primary = meta?.allowedWeaponTypes[0] ?? 'SWORD';

  if (primary === 'STAFF') {
    return tier >= 3 ? 'physic_staff' : tier >= 2 ? 'mend_staff' : 'heal_staff';
  }

  if (classId === 'DARK_GENERAL') {
    return tier >= 4 ? 'urvan_eclipse' : tier >= 3 ? 'crimson_halberd' : 'short_axe';
  }
  if (
    classId === 'DARK_MAGE' ||
    classId === 'NECROMANCER' ||
    classId === 'DARK_DRUID' ||
    classId === 'ABYSSAL_ARCHON'
  ) {
    return tier >= 4 ? 'apocalypse_mythic' : tier >= 3 ? 'luna_tome' : tier >= 2 ? 'nosferatu' : 'dark_flux';
  }
  if (
    classId === 'MONK' ||
    classId === 'EXORCIST' ||
    classId === 'INQUISITOR' ||
    classId === 'SOLAR_HIEROPHANT'
  ) {
    return tier >= 4 ? 'aureola_mythic' : tier >= 3 ? 'aura_tome' : tier >= 2 ? 'divine_tome' : 'light_shine';
  }
  if (
    classId === 'SPELLBLADE' ||
    classId === 'MORTAL_SAVANT' ||
    classId === 'RUNE_BLADE' ||
    classId === 'AETHER_SOVEREIGN'
  ) {
    return tier >= 4 ? 'alondite_edge' : tier >= 3 ? 'runesword' : tier >= 2 ? 'levin_sword' : 'wind_edge';
  }

  if (isElite) {
    switch (primary) {
      case 'AXE':
        return tier >= 3 ? 'crimson_halberd' : tier >= 2 ? 'short_axe' : 'hand_axe';
      case 'LANCE':
        return tier >= 3 ? 'dragon_spear' : tier >= 2 ? 'short_spear' : 'javelin';
      case 'BOW':
        return tier >= 3 ? 'deadeye_longbow' : tier >= 2 ? 'armor_crossbow' : 'short_bow';
      case 'TOME':
        return tier >= 3 ? 'astral_tome' : tier >= 2 ? 'elthunder_tome' : 'thunder_tome';
      case 'SWORD':
      default:
        return tier >= 3 ? 'runesword' : tier >= 2 ? 'levin_sword' : 'armorslayer';
    }
  }

  switch (primary) {
    case 'AXE':
      return tier >= 4 ? 'urvan_eclipse' : tier >= 3 ? 'dragon_axe' : tier >= 2 ? 'steel_axe' : 'iron_axe';
    case 'LANCE':
      return tier >= 4 ? 'wishblade' : tier >= 3 ? 'dragon_spear' : tier >= 2 ? 'steel_lance' : 'iron_lance';
    case 'BOW':
      return tier >= 4 ? 'parthia_sun' : tier >= 3 ? 'deadeye_longbow' : tier >= 2 ? 'wind_bow' : 'hunting_bow';
    case 'TOME':
      return tier >= 4 ? 'forblaze_mythic' : tier >= 3 ? 'astral_tome' : tier >= 2 ? 'elthunder_tome' : 'fire_tome';
    case 'SWORD':
    default:
      return tier >= 4 ? 'durandal_flame' : tier >= 3 ? 'sol_katti' : tier >= 2 ? 'steel_sword' : 'iron_sword';
  }
}

function createEnemyUnit(
  id: string,
  name: string,
  classId: UnitClassId,
  level: number,
  actNumber: number,
  x: number,
  y: number,
  aiPolicy: AIPolicy,
  isBoss: boolean,
  customWeaponId?: string,
  title?: string,
  isElite = false
): Unit {
  const meta = CLASS_META[classId];
  const weaponId = customWeaponId ?? pickEnemyWeaponId(classId, actNumber, isElite);
  const scale = Math.max(0, level - 1);

  let maxHp = 18 + Math.round(scale * 1.48);
  let str = 6 + Math.round(scale * 0.52);
  let mag = 1 + Math.round(scale * 0.16);
  let skl = 6 + Math.round(scale * 0.48);
  let spd = 6 + Math.round(scale * 0.45);
  let lck = 4 + Math.round(scale * 0.34);
  let def = 4 + Math.round(scale * 0.43);
  let res = 2 + Math.round(scale * 0.32);
  let mov = 5;

  const primaryType = meta.allowedWeaponTypes[0];

  if (meta.moveType === 'ARMORED') {
    maxHp += 5;
    str += 2;
    def += 4;
    spd = Math.max(3, spd - 2);
    mov = 4;
  } else if (meta.moveType === 'NAVAL') {
    maxHp += 6;
    str += 2;
    def += 3;
    res += 2;
    mov = 5;
  } else if (meta.moveType === 'MOUNTED') {
    maxHp += 2;
    mov = 6;
  } else if (meta.moveType === 'FLYING') {
    if (primaryType === 'AXE') {
      maxHp += 4;
      str += 3;
      def += 3;
      res = Math.max(1, res - 1);
    } else {
      spd += 3;
      res += 4;
      def = Math.max(2, def - 1);
    }
    mov = 6;
  } else if (primaryType === 'TOME' || primaryType === 'STAFF') {
    maxHp -= 2;
    str = 2;
    mag = 7 + Math.round(scale * 0.56);
    res += 4;
    def = Math.max(2, def - 2);
  } else if (primaryType === 'BOW') {
    skl += 2;
    spd += 1;
    def = Math.max(2, def - 1);
  } else if (meta.allowedWeaponTypes.includes('TOME')) {
    mag = 6 + Math.round(scale * 0.48);
    res += 3;
    spd += 2;
  }

  if (meta.tier >= 2) {
    const tierStep = meta.tier - 1;
    maxHp += tierStep * 3;
    str += tierStep;
    mag += primaryType === 'TOME' || primaryType === 'STAFF' ? tierStep * 2 : 0;
    skl += tierStep;
    def += tierStep;
    res += tierStep;
  }

  if (isElite && !isBoss) {
    maxHp += 4 + Math.round(actNumber * 0.4);
    str += 2;
    mag += primaryType === 'TOME' ? 2 : 0;
    skl += 2;
    spd += 1;
    def += 2;
    res += 2;
  }

  if (isBoss) {
    maxHp += 8 + Math.round(actNumber * 1.1);
    str += 3;
    mag += primaryType === 'TOME' ? 4 : 1;
    skl += 3;
    spd += 2;
    def += 3;
    res += 3;
  }

  const baseEquipped = WEAPONS[weaponId] ?? WEAPONS.iron_sword;
  const equipped = isBoss
    ? {
        ...baseEquipped,
        minRange: 1,
        maxRange: Math.max(2, baseEquipped.maxRange),
      }
    : baseEquipped;

  return {
    id,
    templateId: `enemy_${classId.toLowerCase()}`,
    name,
    title,
    classId,
    className: meta.name,
    tier: meta.tier,
    promoted: meta.tier > 1,
    faction: 'ENEMY',
    moveType: meta.moveType,
    level,
    exp: 0,
    hp: maxHp,
    sp: isBoss ? 65 : isElite ? 45 : 25,
    maxSp: 100,
    stats: { maxHp, str, mag, skl, spd, lck, def, res, mov },
    growths: { hp: 50, str: 40, mag: 20, skl: 40, spd: 40, lck: 30, def: 35, res: 25 },
    weapon: equipped,
    inventory: [equipped],
    skills: isBoss || isElite ? [...meta.defaultSkills] : meta.defaultSkills.slice(0, 1),
    potions: isBoss ? 1 : isElite && actNumber >= 3 ? 1 : 0,
    x,
    y,
    acted: false,
    isBoss,
    isElite: isElite || undefined,
    aiPolicy,
    portraitKey: isBoss ? 'malakor' : undefined,
    accentColor: isBoss ? '#f59e0b' : isElite ? '#fb7185' : '#ef4444',
  };
}

export type TacticalFormationRole =
  | 'LORD'
  | 'TANK'
  | 'MELEE'
  | 'FLANKER'
  | 'RANGED'
  | 'SUPPORT';

export function classifyUnitFormationRole(unit: Unit): TacticalFormationRole {
  if (unit.isLord) return 'LORD';
  if (unit.weapon.type === 'STAFF') return 'SUPPORT';
  if (unit.moveType === 'ARMORED' || unit.stats.def >= unit.stats.spd + 3) return 'TANK';
  if (unit.weapon.type === 'BOW' || unit.weapon.type === 'TOME' || unit.weapon.minRange >= 2) {
    return 'RANGED';
  }
  if (unit.moveType === 'FLYING' || unit.moveType === 'MOUNTED' || unit.stats.mov >= 6) {
    return 'FLANKER';
  }
  return 'MELEE';
}

/**
 * Direction-Aware Tactical Formation Solver:
 * Computes the unit vector from the deployment zone centroid toward `throneCoord`,
 * so all 4 tactical doctrines (BALANCED, PHALANX, SPEARHEAD, PINCER) orient accurately
 * whether the map attacks East, West, North, South, Diagonally, or from a Split/Center camp!
 */
export function computeFormationPlacement(
  allies: Unit[],
  spawns: TileCoord[],
  preset: FormationPresetId,
  throneCoord: TileCoord,
  grid?: TerrainType[][]
): Unit[] {
  if (allies.length === 0 || spawns.length === 0) return allies;

  const uniqueSpawns: TileCoord[] = [];
  const seen = new Set<string>();
  for (const s of spawns) {
    const k = `${s.x},${s.y}`;
    if (!seen.has(k)) {
      seen.add(k);
      uniqueSpawns.push(s);
    }
  }

  const cx = uniqueSpawns.reduce((sum, s) => sum + s.x, 0) / uniqueSpawns.length;
  const cy = uniqueSpawns.reduce((sum, s) => sum + s.y, 0) / uniqueSpawns.length;
  const rawDx = throneCoord.x - cx;
  const rawDy = throneCoord.y - cy;
  const len = Math.hypot(rawDx, rawDy) || 1;
  const dirX = rawDx / len;
  const dirY = rawDy / len;
  const perpX = -dirY;
  const perpY = dirX;

  const forwardScore = (s: TileCoord) => (s.x - cx) * dirX + (s.y - cy) * dirY;
  const lateralScore = (s: TileCoord) => (s.x - cx) * perpX + (s.y - cy) * perpY;

  const sortUnitsForPreset = (subset: Unit[]): Unit[] => {
    if (preset === 'BALANCED') {
      const rolePriority: Record<TacticalFormationRole, number> = {
        LORD: 0,
        TANK: 1,
        MELEE: 2,
        FLANKER: 3,
        RANGED: 4,
        SUPPORT: 5,
      };
      return [...subset].sort(
        (a, b) => rolePriority[classifyUnitFormationRole(a)] - rolePriority[classifyUnitFormationRole(b)]
      );
    }
    if (preset === 'PHALANX') {
      const frontPriority: Record<TacticalFormationRole, number> = {
        TANK: 0,
        MELEE: 1,
        FLANKER: 2,
        LORD: 3,
        RANGED: 4,
        SUPPORT: 5,
      };
      return [...subset].sort((a, b) => {
        const pa = frontPriority[classifyUnitFormationRole(a)];
        const pb = frontPriority[classifyUnitFormationRole(b)];
        if (pa !== pb) return pa - pb;
        return b.stats.def - a.stats.def;
      });
    }
    if (preset === 'SPEARHEAD') {
      const wedgePriority: Record<TacticalFormationRole, number> = {
        FLANKER: 0,
        LORD: 1,
        MELEE: 2,
        TANK: 3,
        RANGED: 4,
        SUPPORT: 5,
      };
      return [...subset].sort((a, b) => {
        const pa = wedgePriority[classifyUnitFormationRole(a)];
        const pb = wedgePriority[classifyUnitFormationRole(b)];
        if (pa !== pb) return pa - pb;
        return b.stats.mov - a.stats.mov;
      });
    }
    const wingPriority: Record<TacticalFormationRole, number> = {
      FLANKER: 0,
      MELEE: 1,
      TANK: 2,
      RANGED: 3,
      LORD: 4,
      SUPPORT: 5,
    };
    return [...subset].sort(
      (a, b) => wingPriority[classifyUnitFormationRole(a)] - wingPriority[classifyUnitFormationRole(b)]
    );
  };

  const orderSpawnsForPreset = (subset: TileCoord[]): TileCoord[] => {
    if (subset.length <= 1) return [...subset];
    if (preset === 'BALANCED') {
      return [...subset].sort((a, b) => {
        const scoreA = Math.abs(lateralScore(a)) - forwardScore(a) * 0.45;
        const scoreB = Math.abs(lateralScore(b)) - forwardScore(b) * 0.45;
        return scoreA - scoreB;
      });
    }
    if (preset === 'PHALANX') {
      return [...subset].sort((a, b) => {
        const df = forwardScore(b) - forwardScore(a);
        if (Math.abs(df) > 0.35) return df;
        return Math.abs(lateralScore(a)) - Math.abs(lateralScore(b));
      });
    }
    if (preset === 'SPEARHEAD') {
      return [...subset].sort((a, b) => {
        const da = Math.abs(throneCoord.x - a.x) + Math.abs(throneCoord.y - a.y);
        const db = Math.abs(throneCoord.x - b.x) + Math.abs(throneCoord.y - b.y);
        return da - db;
      });
    }
    const leftWing = subset
      .filter((s) => lateralScore(s) <= 0)
      .sort((a, b) => lateralScore(a) - lateralScore(b) || forwardScore(b) - forwardScore(a));
    const rightWing = subset
      .filter((s) => lateralScore(s) > 0)
      .sort((a, b) => lateralScore(b) - lateralScore(a) || forwardScore(b) - forwardScore(a));
    const interleavedWings: TileCoord[] = [];
    const maxLen = Math.max(leftWing.length, rightWing.length);
    for (let i = 0; i < maxLen; i++) {
      if (leftWing[i]) interleavedWings.push(leftWing[i]);
      if (rightWing[i]) interleavedWings.push(rightWing[i]);
    }
    return interleavedWings;
  };

  if (!grid) {
    const sortedUnits = sortUnitsForPreset(allies);
    const orderedSpawns = orderSpawnsForPreset(uniqueSpawns);
    return sortedUnits.map((u, idx) => {
      const sp = orderedSpawns[idx % orderedSpawns.length];
      return { ...u, x: sp.x, y: sp.y };
    });
  }

  // Domain-strict placement when terrain grid is provided:
  // NAVAL units can ONLY occupy WATER/BRIDGE berths; land units occupy dry land / bridge berths.
  const waterOnlySpawns = orderSpawnsForPreset(
    uniqueSpawns.filter((s) => grid[s.y]?.[s.x] === 'WATER')
  );
  const bridgeSpawns = orderSpawnsForPreset(
    uniqueSpawns.filter((s) => grid[s.y]?.[s.x] === 'BRIDGE')
  );
  const dryLandSpawns = orderSpawnsForPreset(
    uniqueSpawns.filter((s) => {
      const t = grid[s.y]?.[s.x];
      return Boolean(t && t !== 'WATER' && t !== 'BRIDGE' && isFootPassable(t));
    })
  );

  const navalBerths = [...waterOnlySpawns, ...bridgeSpawns];
  const usedSpawnKeys = new Set<string>();
  const placedResult: Unit[] = [];

  const navalAllies = sortUnitsForPreset(allies.filter((u) => u.moveType === 'NAVAL'));
  for (const nu of navalAllies) {
    const berth = navalBerths.find((s) => !usedSpawnKeys.has(`${s.x},${s.y}`));
    if (!berth) continue; // Never place a warship on dry land
    usedSpawnKeys.add(`${berth.x},${berth.y}`);
    placedResult.push({ ...nu, x: berth.x, y: berth.y });
  }

  const landPool = orderSpawnsForPreset([...dryLandSpawns, ...bridgeSpawns]).filter(
    (s) => !usedSpawnKeys.has(`${s.x},${s.y}`)
  );
  const remainingWaterForAir = waterOnlySpawns.filter((s) => !usedSpawnKeys.has(`${s.x},${s.y}`));

  const nonNavalAllies = sortUnitsForPreset(allies.filter((u) => u.moveType !== 'NAVAL'));
  for (const lu of nonNavalAllies) {
    let slot = landPool.find(
      (s) => !usedSpawnKeys.has(`${s.x},${s.y}`) && canUnitStandOnTerrain(lu.moveType, grid[s.y][s.x])
    );
    if (!slot) {
      slot = landPool.find((s) => !usedSpawnKeys.has(`${s.x},${s.y}`));
    }
    if (!slot && lu.moveType === 'FLYING') {
      slot = remainingWaterForAir.find((s) => !usedSpawnKeys.has(`${s.x},${s.y}`));
    }
    if (!slot && landPool.length > 0) {
      slot = landPool.find((s) => canUnitStandOnTerrain(lu.moveType, grid[s.y][s.x])) ?? landPool[0];
    }
    if (slot) {
      usedSpawnKeys.add(`${slot.x},${slot.y}`);
      placedResult.push({ ...lu, x: slot.x, y: slot.y });
    }
  }

  return placedResult;
}

export function swapOrMoveDeploymentUnit(
  units: Unit[],
  fromCoord: TileCoord,
  toCoord: TileCoord,
  validSpawns: TileCoord[],
  grid?: TerrainType[][]
): { units: Unit[]; changed: boolean; action: 'SWAPPED' | 'MOVED' | 'NONE' } {
  if (fromCoord.x === toCoord.x && fromCoord.y === toCoord.y) {
    return { units, changed: false, action: 'NONE' };
  }
  const spawnSet = new Set(validSpawns.map((s) => `${s.x},${s.y}`));
  if (!spawnSet.has(`${fromCoord.x},${fromCoord.y}`) || !spawnSet.has(`${toCoord.x},${toCoord.y}`)) {
    return { units, changed: false, action: 'NONE' };
  }

  const unitA = units.find(
    (u) => u.faction === 'PLAYER' && u.hp > 0 && u.x === fromCoord.x && u.y === fromCoord.y
  );
  if (!unitA) {
    return { units, changed: false, action: 'NONE' };
  }

  const unitB = units.find(
    (u) => u.faction === 'PLAYER' && u.hp > 0 && u.x === toCoord.x && u.y === toCoord.y
  );

  if (grid) {
    const toTerrain = grid[toCoord.y]?.[toCoord.x];
    const fromTerrain = grid[fromCoord.y]?.[fromCoord.x];
    if (!toTerrain || !canUnitStandOnTerrain(unitA.moveType, toTerrain)) {
      return { units, changed: false, action: 'NONE' };
    }
    if (unitB && (!fromTerrain || !canUnitStandOnTerrain(unitB.moveType, fromTerrain))) {
      return { units, changed: false, action: 'NONE' };
    }
  }

  if (unitB) {
    return {
      units: units.map((u) => {
        if (u.id === unitA.id) return { ...u, x: toCoord.x, y: toCoord.y };
        if (u.id === unitB.id) return { ...u, x: fromCoord.x, y: fromCoord.y };
        return u;
      }),
      changed: true,
      action: 'SWAPPED',
    };
  }

  const enemyBlocker = units.find(
    (u) => u.faction === 'ENEMY' && u.hp > 0 && u.x === toCoord.x && u.y === toCoord.y
  );
  if (enemyBlocker) {
    return { units, changed: false, action: 'NONE' };
  }

  return {
    units: units.map((u) => (u.id === unitA.id ? { ...u, x: toCoord.x, y: toCoord.y } : u)),
    changed: true,
    action: 'MOVED',
  };
}

/**
 * Generates 14 distinct tactical deployment slots & the opposing Throne stronghold
 * based on 1 of 8 distinct AttackAxis geometries!
 */
function buildAxisSpawnsAndThrone(
  width: number,
  height: number,
  axis: AttackAxis,
  mapId: number
): { playerSpawns: TileCoord[]; throneCoord: TileCoord } {
  const midX = Math.floor(width / 2);
  const midY = Math.floor(height / 2);
  const jitter = (mapId % 3) - 1;

  const collectCluster = (cx: number, cy: number, offsets: Array<[number, number]>): TileCoord[] => {
    const out: TileCoord[] = [];
    const seen = new Set<string>();
    for (const [ox, oy] of offsets) {
      const x = clampCoord(cx + ox, 1, width - 2);
      const y = clampCoord(cy + oy, 1, height - 2);
      const k = `${x},${y}`;
      if (!seen.has(k)) {
        seen.add(k);
        out.push({ x, y });
      }
    }
    return out;
  };

  switch (axis) {
    case 'SOUTH_TO_NORTH': {
      const playerSpawns = collectCluster(midX, height - 3, [
        [0, 0], [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1],
        [-2, 0], [2, 0], [-2, -1], [2, -1],
        [-3, 1], [3, 1], [-1, 1], [1, 1],
      ]);
      const throneCoord = { x: clampCoord(midX + jitter, 3, width - 4), y: 2 };
      return { playerSpawns, throneCoord };
    }
    case 'NORTH_TO_SOUTH': {
      const playerSpawns = collectCluster(midX, 2, [
        [0, 0], [-1, 0], [1, 0], [0, 1], [-1, 1], [1, 1],
        [-2, 0], [2, 0], [-2, 1], [2, 1],
        [-3, -1], [3, -1], [-1, -1], [1, -1],
      ]);
      const throneCoord = { x: clampCoord(midX - jitter, 3, width - 4), y: height - 3 };
      return { playerSpawns, throneCoord };
    }
    case 'EAST_TO_WEST': {
      const playerSpawns = collectCluster(width - 3, midY, [
        [0, 0], [0, -1], [-1, 0], [-1, -1], [1, 0], [1, -1],
        [0, -2], [0, 1], [-1, -2], [-1, 1],
        [1, -2], [1, 1], [0, -3], [0, 2],
      ]);
      const throneCoord = { x: 2, y: clampCoord(midY + jitter, 2, height - 3) };
      return { playerSpawns, throneCoord };
    }
    case 'NORTH_W_TO_SOUTH_E': {
      const playerSpawns = collectCluster(3, 3, [
        [0, 0], [1, 0], [0, 1], [1, 1], [-1, 0], [0, -1],
        [2, 0], [0, 2], [2, 1], [1, 2],
        [-1, 1], [1, -1], [3, 0], [0, 3],
      ]);
      const throneCoord = { x: width - 3, y: height - 3 };
      return { playerSpawns, throneCoord };
    }
    case 'SOUTH_W_TO_NORTH_E': {
      const playerSpawns = collectCluster(3, height - 4, [
        [0, 0], [1, 0], [0, -1], [1, -1], [-1, 0], [0, 1],
        [2, 0], [0, -2], [2, -1], [1, -2],
        [-1, -1], [1, 1], [3, 0], [0, -3],
      ]);
      const throneCoord = { x: width - 3, y: 2 };
      return { playerSpawns, throneCoord };
    }
    case 'SPLIT_PINCER': {
      // Two distinct strike detachments: North-West Wing & South-West Wing!
      const northY = clampCoord(3, 2, midY - 3);
      const southY = clampCoord(height - 4, midY + 2, height - 3);
      const wingA = collectCluster(2, northY, [
        [0, 0], [1, 0], [0, 1], [1, 1], [2, 0], [0, -1], [1, -1],
      ]);
      const wingB = collectCluster(2, southY, [
        [0, 0], [1, 0], [0, -1], [1, -1], [2, 0], [0, 1], [1, 1],
      ]);
      const interleaved: TileCoord[] = [];
      for (let i = 0; i < Math.max(wingA.length, wingB.length); i++) {
        if (wingA[i]) interleaved.push(wingA[i]);
        if (wingB[i]) interleaved.push(wingB[i]);
      }
      const throneCoord = { x: width - 3, y: clampCoord(midY + jitter, 3, height - 4) };
      return { playerSpawns: interleaved, throneCoord };
    }
    case 'CENTER_HOLDOUT': {
      const playerSpawns = collectCluster(midX, midY, [
        [0, 0], [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [1, -1], [-1, 1], [1, 1],
        [-2, 0], [2, 0], [0, -2], [0, 2], [-2, -1],
      ]);
      const throneCoord = { x: width - 3, y: clampCoord(midY + jitter, 2, height - 3) };
      return { playerSpawns, throneCoord };
    }
    case 'WEST_TO_EAST':
    default: {
      const playerSpawns = collectCluster(2, midY, [
        [0, -1], [0, 0], [1, -1], [1, 0], [-1, -1], [-1, 0],
        [0, -2], [0, 1], [1, -2], [1, 1],
        [-1, -3], [-1, 2], [0, -3], [0, 2],
      ]);
      const throneCoord = { x: width - 2, y: clampCoord(midY + jitter, 2, height - 3) };
      return { playerSpawns, throneCoord };
    }
  }
}

export function generateMap(mapId: number): GeneratedMapData {
  const meta = getCampaignMapById(mapId);
  const rng = createSeededRng(mapId * 7919 + meta.actNumber * 104729 + meta.chapterInAct * 3571);
  const width = meta.mapWidth || 18;
  const height = meta.mapHeight || 12;
  const midX = Math.floor(width / 2);
  const midY = Math.floor(height / 2);

  const axis = pickAttackAxis(mapId, meta.chapterInAct, meta.objective);
  const variant = (mapId + meta.chapterInAct) % 4;

  const base = getBiomeBaseTerrain(meta.biome);
  const hazard = getBiomeHazardTerrain(meta.biome);
  const grid: TerrainType[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => base)
  );

  const { playerSpawns, throneCoord } = buildAxisSpawnsAndThrone(width, height, axis, mapId);
  const spawnCentroid: TileCoord = {
    x: Math.round(playerSpawns.reduce((s, p) => s + p.x, 0) / playerSpawns.length),
    y: Math.round(playerSpawns.reduce((s, p) => s + p.y, 0) / playerSpawns.length),
  };

  const fortPositions: TileCoord[] = [];
  const stampFort = (fx: number, fy: number) => {
    const sx = clampCoord(Math.round(fx), 2, width - 3);
    const sy = clampCoord(Math.round(fy), 2, height - 3);
    grid[sy][sx] = 'FORT';
    fortPositions.push({ x: sx, y: sy });
  };

  // Sculpt rich, non-identical macro-landmarks tailored to BOTH layout & AttackAxis + variant
  switch (meta.layout) {
    case 'border_gate': {
      if (axis === 'SOUTH_TO_NORTH' || axis === 'NORTH_TO_SOUTH') {
        const wallY = Math.round(height * (axis === 'SOUTH_TO_NORTH' ? 0.38 : 0.62));
        for (let x = 1; x < width - 1; x++) {
          const isCenterGate = Math.abs(x - midX) <= 1;
          const isFlankGate = x === 3 || x === width - 4;
          if (!isCenterGate && !isFlankGate) grid[wallY][x] = 'WALL';
        }
        // Outer mountain shoulders
        stampOrganicBlob(grid, 2, wallY - 2, 2.5, 2, 'MOUNTAIN', rng);
        stampOrganicBlob(grid, width - 3, wallY + 2, 2.5, 2, 'MOUNTAIN', rng);
        stampFort(midX - 4, wallY + (axis === 'SOUTH_TO_NORTH' ? 2 : -2));
        stampFort(midX + 4, wallY + (axis === 'SOUTH_TO_NORTH' ? 2 : -2));
        stampFort(midX - 3, wallY + (axis === 'SOUTH_TO_NORTH' ? -2 : 2));
        stampFort(midX + 3, wallY + (axis === 'SOUTH_TO_NORTH' ? -2 : 2));
      } else {
        const gateX = Math.round(width * (0.54 + (variant - 1) * 0.06));
        for (let y = 1; y < height - 1; y++) {
          const bend = Math.round(Math.sin(y * 0.45 + variant) * 1.4);
          const wx = clampCoord(gateX + bend, 5, width - 5);
          const isGate = Math.abs(y - midY) <= 1 || y === 2 || y === height - 3;
          if (!isGate) grid[y][wx] = 'WALL';
        }
        // Forested flanks + watchtower forts
        stampOrganicBlob(grid, Math.round(width * 0.3), 3, 3, 2, 'FOREST', rng);
        stampOrganicBlob(grid, Math.round(width * 0.34), height - 4, 3, 2, 'FOREST', rng);
        stampFort(gateX - 3, 3);
        stampFort(gateX - 3, height - 4);
        stampFort(gateX + 3, midY - 2);
        stampFort(gateX + 3, midY + 2);
      }
      break;
    }

    case 'river_crossing': {
      const riverTerr = hazard === 'MOUNTAIN' || hazard === 'WALL' ? 'WATER' : hazard;
      if (axis === 'SOUTH_TO_NORTH' || axis === 'NORTH_TO_SOUTH') {
        // Horizontal meandering river with a fortified central river island!
        for (let x = 0; x < width; x++) {
          const ry = clampCoord(
            Math.round(midY + Math.sin(x * 0.35 + variant) * 2),
            3,
            height - 4
          );
          grid[ry][x] = riverTerr;
          grid[ry + 1][x] = riverTerr;
        }
        stampOrganicBlob(grid, midX, midY, 3.2, 2.2, base, rng);
        stampFort(midX, midY);
        const bridgeCols = [4, midX, width - 5];
        for (const bx of bridgeCols) {
          for (let y = midY - 3; y <= midY + 3; y++) {
            if (grid[y]?.[bx] === riverTerr) grid[y][bx] = 'BRIDGE';
          }
        }
        stampFort(5, midY - 4);
        stampFort(width - 6, midY + 4);
      } else {
        // Vertical S-curve river + central island bastion + 3 distinct crossings
        for (let y = 0; y < height; y++) {
          const rx = clampCoord(
            Math.round(midX + Math.sin(y * 0.42 + variant) * 2.4),
            5,
            width - 6
          );
          grid[y][rx] = riverTerr;
          grid[y][rx + 1] = riverTerr;
          if (width >= 28 && y % 3 === 0) grid[y][rx - 1] = riverTerr;
        }
        if (width >= 24) {
          stampOrganicBlob(grid, midX + 1, midY, 2.4, 2.4, base, rng);
          stampFort(midX + 1, midY);
        }
        const bridgeRows = [2, midY, height - 3];
        for (const by of bridgeRows) {
          for (let x = midX - 4; x <= midX + 5; x++) {
            if (grid[by]?.[x] === riverTerr) grid[by][x] = 'BRIDGE';
          }
        }
        stampFort(Math.round(width * 0.32), midY - 2);
        stampFort(Math.round(width * 0.72), 3);
        stampFort(Math.round(width * 0.72), height - 4);
      }
      break;
    }

    case 'forest_ambush': {
      // 4–6 distinct dense ancient woodland groves separated by sunlit clearings & ruins
      const groveCount = width >= 28 ? 7 : 5;
      for (let g = 0; g < groveCount; g++) {
        const gx = 4 + Math.floor(rng() * (width - 8));
        const gy = 2 + Math.floor(rng() * (height - 4));
        stampOrganicBlob(grid, gx, gy, 2.6 + rng() * 2, 2.0 + rng() * 1.5, 'FOREST', rng);
      }
      if (variant % 2 === 0) {
        stampOrganicBlob(grid, midX, midY + (variant === 0 ? -3 : 3), 2.5, 1.8, 'WATER', rng);
      }
      stampFort(Math.round(width * 0.36), 3);
      stampFort(Math.round(width * 0.52), midY);
      stampFort(Math.round(width * 0.68), height - 4);
      if (width >= 28) stampFort(Math.round(width * 0.76), 3);
      break;
    }

    case 'canyon_pass': {
      // Dramatic jagged mountain rims + diagonal/split canyon pillars creating 2–3 switchback valleys
      for (let x = 2; x < width - 2; x++) {
        const topDepth = 1 + Math.floor((Math.sin(x * 0.5 + variant) + 1) * 0.9);
        const botDepth = 1 + Math.floor((Math.cos(x * 0.45 + variant) + 1) * 0.9);
        for (let y = 0; y < topDepth; y++) grid[y][x] = 'MOUNTAIN';
        for (let y = height - botDepth; y < height; y++) grid[y][x] = 'MOUNTAIN';
      }
      stampOrganicBlob(grid, Math.round(width * 0.38), midY - 2, 3.2, 1.8, 'MOUNTAIN', rng);
      stampOrganicBlob(grid, Math.round(width * 0.62), midY + 2, 3.2, 1.8, 'MOUNTAIN', rng);
      stampFort(Math.round(width * 0.34), midY + 2);
      stampFort(Math.round(width * 0.52), midY);
      stampFort(Math.round(width * 0.7), midY - 2);
      stampFort(Math.round(width * 0.74), height - 4);
      break;
    }

    case 'desert_oasis': {
      // Twin emerald oases + sunken sandstone ruin walls + palm groves
      const o1x = Math.round(width * 0.38);
      const o1y = clampCoord(midY - 2 + (variant % 2), 3, height - 4);
      stampOrganicBlob(grid, o1x, o1y, 3.0, 2.2, 'WATER', rng);
      stampOrganicBlob(grid, o1x, o1y - 3, 3.2, 1.2, 'FOREST', rng);

      if (width >= 24) {
        const o2x = Math.round(width * 0.66);
        const o2y = clampCoord(midY + 2 - (variant % 2), 3, height - 4);
        stampOrganicBlob(grid, o2x, o2y, 2.6, 2.0, 'WATER', rng);
        stampOrganicBlob(grid, o2x, o2y + 3, 2.8, 1.2, 'FOREST', rng);
      }
      // Ancient ruin colonnade
      const ruinX = Math.round(width * 0.52);
      for (let y = 2; y < height - 2; y += 2) {
        grid[y][ruinX] = 'WALL';
      }
      stampFort(Math.round(width * 0.32), height - 4);
      stampFort(ruinX + 2, midY);
      stampFort(Math.round(width * 0.74), 3);
      stampFort(Math.round(width * 0.74), height - 4);
      break;
    }

    case 'harbor_docks': {
      // Multi-island naval harbor: open sea basins + stone quays + wooden pier bridges!
      for (let y = 1; y < height - 1; y++) {
        for (let x = 5; x < width - 3; x++) {
          if (y <= 2 || y >= height - 3 || (x >= Math.round(width * 0.42) && x <= Math.round(width * 0.58))) {
            grid[y][x] = 'WATER';
          }
        }
      }
      // Raise 2–3 fortified dockyard islands in the harbor channel
      stampOrganicBlob(grid, Math.round(width * 0.5), clampCoord(4, 3, height - 4), 3.4, 2.0, 'ROAD', rng);
      stampOrganicBlob(grid, Math.round(width * 0.5), clampCoord(height - 5, 3, height - 4), 3.4, 2.0, 'ROAD', rng);
      if (height >= 16) {
        stampOrganicBlob(grid, Math.round(width * 0.5), midY, 2.8, 1.8, 'ROAD', rng);
      }
      // Span wooden pier bridges across water channels
      const pierRows = height >= 16 ? [3, midY, height - 4] : [3, height - 4];
      for (const py of pierRows) {
        for (let x = 4; x < width - 2; x++) {
          if (grid[py][x] === 'WATER') grid[py][x] = 'BRIDGE';
        }
      }
      stampFort(Math.round(width * 0.5), clampCoord(4, 3, height - 4));
      stampFort(Math.round(width * 0.5), clampCoord(height - 5, 3, height - 4));
      stampFort(Math.round(width * 0.74), midY);
      break;
    }

    case 'swamp_ruins': {
      // Fen pools, sunken temple walls, dead-tree thickets & raised stone causeways
      const poolCount = width >= 28 ? 6 : 4;
      for (let p = 0; p < poolCount; p++) {
        const px = 4 + Math.floor(rng() * (width - 8));
        const py = 2 + Math.floor(rng() * (height - 4));
        stampOrganicBlob(grid, px, py, 2.4, 1.8, 'WATER', rng);
      }
      for (let f = 0; f < poolCount + 1; f++) {
        const fx = 3 + Math.floor(rng() * (width - 6));
        const fy = 1 + Math.floor(rng() * (height - 2));
        stampOrganicBlob(grid, fx, fy, 2.2, 1.8, 'FOREST', rng);
      }
      // Sunken ruin chamber in center
      for (let x = midX - 3; x <= midX + 3; x++) {
        if (x !== midX) {
          grid[clampCoord(midY - 3, 1, height - 2)][x] = 'WALL';
          grid[clampCoord(midY + 3, 1, height - 2)][x] = 'WALL';
        }
      }
      stampFort(midX, midY);
      stampFort(Math.round(width * 0.34), 3);
      stampFort(Math.round(width * 0.72), height - 4);
      break;
    }

    case 'snow_ridge': {
      // Glacial mountain ridges + pine forest windbreaks + frozen pass forts
      stampOrganicBlob(grid, Math.round(width * 0.36), Math.round(height * 0.3), 3.4, 2.0, 'MOUNTAIN', rng);
      stampOrganicBlob(grid, Math.round(width * 0.62), Math.round(height * 0.7), 3.4, 2.0, 'MOUNTAIN', rng);
      if (width >= 28) {
        stampOrganicBlob(grid, Math.round(width * 0.52), Math.round(height * 0.25), 2.8, 1.8, 'FOREST', rng);
        stampOrganicBlob(grid, Math.round(width * 0.48), Math.round(height * 0.75), 2.8, 1.8, 'FOREST', rng);
      }
      for (let i = 0; i < 4; i++) {
        stampOrganicBlob(
          grid,
          4 + Math.floor(rng() * (width - 8)),
          2 + Math.floor(rng() * (height - 4)),
          2.2,
          1.6,
          'FOREST',
          rng
        );
      }
      stampFort(Math.round(width * 0.4), midY + 2);
      stampFort(Math.round(width * 0.58), midY - 2);
      stampFort(Math.round(width * 0.76), midY);
      break;
    }

    case 'lava_fortress': {
      // Branching volcanic magma rivers + inner obsidian citadel bailey
      for (let y = 0; y < height; y++) {
        const lx1 = clampCoord(Math.round(width * 0.36 + Math.sin(y * 0.4 + variant) * 1.6), 4, width - 6);
        grid[y][lx1] = 'LAVA';
        if (width >= 26) {
          const lx2 = clampCoord(Math.round(width * 0.66 + Math.cos(y * 0.35 + variant) * 1.6), 8, width - 4);
          grid[y][lx2] = 'LAVA';
        }
      }
      stampOrganicBlob(grid, midX, midY, 2.5, 2.0, 'ROAD', rng);
      const bridgeRows = [2, midY, height - 3];
      for (const by of bridgeRows) {
        for (let x = 3; x < width - 2; x++) {
          if (grid[by][x] === 'LAVA') grid[by][x] = 'BRIDGE';
        }
      }
      stampFort(midX, midY);
      stampFort(Math.round(width * 0.52), 3);
      stampFort(Math.round(width * 0.52), height - 4);
      stampFort(Math.round(width * 0.78), midY - 2);
      break;
    }

    case 'capital_streets': {
      // Grand multi-district walled city avenues, plazas & concentric palace keep!
      const blockCols = width >= 28 ? [0.26, 0.46, 0.66] : [0.3, 0.58];
      for (const ratio of blockCols) {
        const bx = Math.round(width * ratio);
        for (let dx = -2; dx <= 2; dx++) {
          const x = clampCoord(bx + dx, 3, width - 4);
          grid[2][x] = 'WALL';
          grid[3][x] = 'WALL';
          grid[height - 4][x] = 'WALL';
          grid[height - 3][x] = 'WALL';
          if (height >= 18 && Math.abs(dx) <= 1) {
            grid[midY - 3][x] = 'WALL';
            grid[midY + 3][x] = 'WALL';
          }
        }
      }
      stampFort(Math.round(width * 0.4), midY);
      stampFort(Math.round(width * 0.62), 4);
      stampFort(Math.round(width * 0.62), height - 5);
      stampFort(Math.round(width * 0.78), midY);
      break;
    }

    case 'twin_bridges': {
      const chasmTerr = hazard === 'WALL' ? 'WATER' : hazard;
      if (axis === 'SOUTH_TO_NORTH' || axis === 'NORTH_TO_SOUTH') {
        for (let y = midY - 1; y <= midY + 1; y++) {
          for (let x = 0; x < width; x++) grid[y][x] = chasmTerr;
        }
        const spans = width >= 28 ? [4, midX - 4, midX + 4, width - 5] : [4, width - 5];
        for (const sx of spans) {
          for (let y = midY - 2; y <= midY + 2; y++) {
            grid[y][sx] = 'BRIDGE';
            if (sx + 1 < width - 1) grid[y][sx + 1] = 'BRIDGE';
          }
        }
        stampFort(5, midY - 3);
        stampFort(width - 6, midY - 3);
        stampFort(midX, midY + 3);
      } else {
        const chasmX = Math.round(width * 0.46);
        for (let y = 0; y < height; y++) {
          grid[y][chasmX] = chasmTerr;
          grid[y][chasmX + 1] = chasmTerr;
          if (width >= 24) grid[y][chasmX + 2] = chasmTerr;
        }
        const spanRows = height >= 16 ? [2, midY, height - 3] : [2, height - 3];
        for (const sy of spanRows) {
          for (let x = chasmX - 1; x <= chasmX + 3; x++) {
            grid[sy][x] = 'BRIDGE';
          }
        }
        stampFort(chasmX - 3, midY);
        stampFort(chasmX + 5, 3);
        stampFort(chasmX + 5, height - 4);
      }
      break;
    }

    case 'sanctum_throne': {
      // Concentric Grand Cathedral / Crimson Citadel with Outer & Inner Sanctum Walls!
      for (let y = 0; y < height; y++) {
        grid[y][0] = 'WALL';
        grid[y][width - 1] = 'WALL';
      }
      for (let x = 0; x < width; x++) {
        grid[0][x] = 'WALL';
        grid[height - 1][x] = 'WALL';
      }
      // Inner sanctum ring with 3 breach gates
      const ringLeft = Math.round(width * 0.34);
      const ringRight = Math.round(width * 0.72);
      const ringTop = 3;
      const ringBot = height - 4;
      for (let y = ringTop; y <= ringBot; y++) {
        if (Math.abs(y - midY) > 1) {
          grid[y][ringLeft] = 'WALL';
          grid[y][ringRight] = 'WALL';
        }
      }
      for (let x = ringLeft; x <= ringRight; x += 3) {
        if (Math.abs(x - midX) > 2) {
          grid[ringTop][x] = 'WALL';
          grid[ringBot][x] = 'WALL';
        }
      }
      stampFort(ringLeft + 2, midY - 2);
      stampFort(ringLeft + 2, midY + 2);
      stampFort(Math.round((ringLeft + ringRight) / 2), midY);
      stampFort(ringRight - 2, ringTop + 1);
      stampFort(ringRight - 2, ringBot - 1);
      break;
    }
  }

  // Theater-specific historical terrain sculpting so every battleground matches its historical geography & title!
  switch (meta.theaterProfile) {
    case 'FLEET_NAVAL': {
      // Broad open sea lanes for fleet engagements + island outposts linked by pier causeways
      for (let y = 1; y < height - 1; y++) {
        for (let x = 4; x < width - 3; x++) {
          if (y <= 3 || y >= height - 4 || Math.abs(x - midX) <= Math.max(3, Math.floor(width * 0.2))) {
            grid[y][x] = 'WATER';
          }
        }
      }
      stampOrganicBlob(grid, midX - 2, clampCoord(4, 3, height - 4), 2.4, 1.5, 'SAND', rng);
      stampOrganicBlob(grid, midX + 2, clampCoord(height - 5, 3, height - 4), 2.4, 1.5, 'SAND', rng);
      stampFort(midX - 2, clampCoord(4, 3, height - 4));
      stampFort(midX + 2, clampCoord(height - 5, 3, height - 4));
      const causewayY = [clampCoord(4, 2, height - 3), midY, clampCoord(height - 5, 2, height - 3)];
      for (const cy of causewayY) {
        for (let x = 3; x < width - 2; x++) {
          if (grid[cy][x] === 'WATER') grid[cy][x] = 'BRIDGE';
        }
      }
      break;
    }
    case 'AMPHIBIOUS_LANDING': {
      // Surf zone + golden landing beachhead + landing pier bridges + coastal bunker line
      if (axis === 'SOUTH_TO_NORTH' || axis === 'NORTH_TO_SOUTH') {
        const surfY = axis === 'SOUTH_TO_NORTH' ? height - 5 : 4;
        const sandY = axis === 'SOUTH_TO_NORTH' ? height - 6 : 5;
        const bunkerY = axis === 'SOUTH_TO_NORTH' ? height - 8 : 7;
        for (let x = 1; x < width - 1; x++) {
          grid[clampCoord(surfY, 1, height - 2)][x] = 'WATER';
          grid[clampCoord(surfY + (axis === 'SOUTH_TO_NORTH' ? 1 : -1), 1, height - 2)][x] = 'WATER';
          grid[clampCoord(sandY, 1, height - 2)][x] = 'SAND';
        }
        for (const px of [4, midX, width - 5]) {
          for (let dy = -2; dy <= 2; dy++) {
            const py = clampCoord(surfY + dy, 1, height - 2);
            if (grid[py][px] === 'WATER') grid[py][px] = 'BRIDGE';
          }
        }
        stampFort(Math.round(width * 0.28), bunkerY);
        stampFort(midX, bunkerY);
        stampFort(Math.round(width * 0.72), bunkerY);
      } else {
        const seawardWest = spawnCentroid.x < midX;
        const surfX = seawardWest ? 4 : width - 5;
        const sandX = seawardWest ? 6 : width - 7;
        const bunkerX = seawardWest ? 8 : width - 9;
        for (let y = 1; y < height - 1; y++) {
          grid[y][clampCoord(surfX, 1, width - 2)] = 'WATER';
          grid[y][clampCoord(surfX + (seawardWest ? 1 : -1), 1, width - 2)] = 'WATER';
          grid[y][clampCoord(sandX, 1, width - 2)] = 'SAND';
        }
        for (const py of [2, midY, height - 3]) {
          for (let dx = -2; dx <= 2; dx++) {
            const px = clampCoord(surfX + dx, 1, width - 2);
            if (grid[py][px] === 'WATER') grid[py][px] = 'BRIDGE';
          }
        }
        stampFort(bunkerX, 3);
        stampFort(bunkerX, midY);
        stampFort(bunkerX, height - 4);
      }
      break;
    }
    case 'FORTRESS_SIEGE': {
      // Concentric concrete fortress belt around HQ + woodland groves (e.g., Meuse Valley & Liège Forts!)
      if (base === 'PLAIN') {
        stampOrganicBlob(grid, Math.round(width * 0.28), 2, 2.6, 1.8, 'FOREST', rng);
        stampOrganicBlob(grid, Math.round(width * 0.3), height - 3, 2.6, 1.8, 'FOREST', rng);
        stampOrganicBlob(grid, Math.round(width * 0.64), 2, 2.2, 1.5, 'FOREST', rng);
      }
      const fortRingOffsets: Array<[number, number]> = [
        [-4, -3],
        [-4, 3],
        [-3, 0],
        [0, -3],
        [0, 3],
      ];
      for (const [ox, oy] of fortRingOffsets) {
        const fx = clampCoord(throneCoord.x + (throneCoord.x > midX ? ox : -ox), 3, width - 4);
        const fy = clampCoord(throneCoord.y + oy, 2, height - 3);
        if (grid[fy][fx] !== 'WATER' && grid[fy][fx] !== 'BRIDGE') {
          stampFort(fx, fy);
        }
      }
      // Broken outer parapet segments with wide assault breaches
      const wallX = clampCoord(throneCoord.x + (throneCoord.x > midX ? -5 : 5), 4, width - 5);
      for (let y = 2; y < height - 2; y++) {
        if (y % 3 === 1 && Math.abs(y - midY) > 1 && grid[y][wallX] !== 'WATER' && grid[y][wallX] !== 'BRIDGE') {
          grid[y][wallX] = 'WALL';
        }
      }
      break;
    }
    case 'TRENCH_FRONT': {
      // Parallel trench strongpoints, staggered sandbag parapets & shell-hole craters
      const line1X = Math.round(width * 0.42);
      const line2X = Math.round(width * 0.68);
      for (const lx of [line1X, line2X]) {
        for (let y = 2; y < height - 2; y += 3) {
          if (Math.abs(y - midY) > 1 && grid[y][lx] !== 'WATER' && grid[y][lx] !== 'BRIDGE') {
            grid[y][lx] = 'WALL';
          }
        }
      }
      stampFort(line1X + 1, clampCoord(midY - 3, 2, height - 3));
      stampFort(line2X - 1, clampCoord(midY + 3, 2, height - 3));
      stampOrganicBlob(grid, Math.round(width * 0.54), clampCoord(midY - 3, 2, height - 3), 1.8, 1.4, 'WATER', rng);
      if (base === 'PLAIN') {
        stampOrganicBlob(grid, Math.round(width * 0.34), clampCoord(midY + 3, 2, height - 3), 2.2, 1.5, 'FOREST', rng);
      }
      break;
    }
    case 'RIVER_CANAL': {
      // Ensure a continuous navigable river/canal exists even if base layout was сухопутный
      let existingWater = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) if (grid[y][x] === 'WATER') existingWater++;
      }
      if (existingWater < 12) {
        for (let y = 0; y < height; y++) {
          const rx = clampCoord(Math.round(midX + Math.sin(y * 0.4 + variant) * 1.6), 4, width - 5);
          grid[y][rx] = 'WATER';
          grid[y][rx + 1] = 'WATER';
        }
        for (const by of [2, midY, height - 3]) {
          for (let x = midX - 3; x <= midX + 4; x++) {
            if (grid[by][x] === 'WATER') grid[by][x] = 'BRIDGE';
          }
        }
      }
      break;
    }
    case 'URBAN_ASSAULT': {
      // Add an urban river/canal embankment (Volga, Spree, Seine, Huangpu) along the southern quay
      let existingWater = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) if (grid[y][x] === 'WATER') existingWater++;
      }
      if (existingWater < 8 && height >= 12) {
        const canalY = height - 2;
        for (let x = 2; x < width - 2; x++) {
          grid[canalY][x] = x % 6 === 0 ? 'BRIDGE' : 'WATER';
        }
      }
      break;
    }
    case 'JUNGLE_ISLAND': {
      // Lush tropical jungle canopy + coastal lagoon & sandy landing coves
      stampOrganicBlob(grid, Math.round(width * 0.44), midY - 2, 2.8, 2.0, 'FOREST', rng);
      stampOrganicBlob(grid, Math.round(width * 0.62), midY + 2, 2.8, 2.0, 'FOREST', rng);
      for (let x = 2; x < width - 2; x++) {
        if (grid[1][x] === base) grid[1][x] = 'WATER';
        if (grid[2][x] === base && x % 3 !== 0) grid[2][x] = 'SAND';
      }
      break;
    }
    default:
      break;
  }

  // Center Holdout defensive ring: surround player's central plateau with tactical Forts & choke walls!
  if (axis === 'CENTER_HOLDOUT') {
    stampOrganicBlob(grid, midX, midY, 3.6, 2.8, 'ROAD', rng);
    stampFort(midX - 3, midY - 2);
    stampFort(midX + 3, midY - 2);
    stampFort(midX - 3, midY + 2);
    stampFort(midX + 3, midY + 2);
  }

  // Carve organic main & flanking supply roads linking Deployment -> Midfield -> Throne!
  carveWindingRoad(grid, spawnCentroid, { x: midX, y: midY }, rng, width >= 26);
  carveWindingRoad(grid, { x: midX, y: midY }, throneCoord, rng, width >= 26);
  // Secondary flanking trail
  const flankWaypoint: TileCoord = {
    x: clampCoord(midX + (variant % 2 === 0 ? -4 : 4), 3, width - 4),
    y: clampCoord(variant < 2 ? 3 : height - 4, 2, height - 3),
  };
  carveWindingRoad(grid, spawnCentroid, flankWaypoint, rng, false);
  carveWindingRoad(grid, flankWaypoint, throneCoord, rng, false);

  // Clear & stamp Player Land Deployment Zone tiles first
  for (const sp of playerSpawns) {
    grid[sp.y][sp.x] = base === 'SAND' ? 'SAND' : base === 'SNOW' ? 'SNOW' : 'ROAD';
  }

  // Stamp Throne & ensure open approach tiles around it
  grid[throneCoord.y][throneCoord.x] = 'THRONE';
  for (const [dx, dy] of [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]) {
    const nx = throneCoord.x + dx;
    const ny = throneCoord.y + dy;
    if (nx >= 1 && ny >= 1 && nx < width - 1 && ny < height - 1 && !isFootPassable(grid[ny][nx])) {
      grid[ny][nx] = 'ROAD';
    }
  }

  // Place In-Map Armory & Secret Vendor on distinct tactical side-objectives away from spawns & throne!
  const spawnKeySet = new Set(playerSpawns.map((p) => `${p.x},${p.y}`));
  const pickShopCoord = (preferNearSpawn: boolean, avoidKey: string): TileCoord => {
    for (let attempt = 0; attempt < 50; attempt++) {
      const ratio = preferNearSpawn ? 0.28 + rng() * 0.22 : 0.55 + rng() * 0.28;
      const sx = clampCoord(
        Math.round(spawnCentroid.x + (throneCoord.x - spawnCentroid.x) * ratio + (rng() - 0.5) * 6),
        2,
        width - 3
      );
      const sy = preferNearSpawn
        ? mapId % 2 === 0
          ? 2
          : height - 3
        : mapId % 2 === 0
        ? height - 3
        : 2;
      const key = `${sx},${sy}`;
      if (
        !spawnKeySet.has(key) &&
        key !== `${throneCoord.x},${throneCoord.y}` &&
        key !== avoidKey
      ) {
        return { x: sx, y: sy };
      }
    }
    return preferNearSpawn ? { x: 4, y: 2 } : { x: width - 5, y: height - 3 };
  };

  const armoryShopCoord = pickShopCoord(true, '');
  const vendorShopCoord = pickShopCoord(false, `${armoryShopCoord.x},${armoryShopCoord.y}`);
  grid[armoryShopCoord.y][armoryShopCoord.x] = 'SHOP_ARMORY';
  grid[vendorShopCoord.y][vendorShopCoord.x] = 'SHOP_VENDOR';

  // Scale Enemy Legion count with BOTH 16-Act progression AND Battlefield Area (Medium -> Large -> Colossal!)
  const area = width * height;
  const sizeBonus = area >= 600 ? 6 : area >= 480 ? 4 : area >= 330 ? 2 : 0;
  const baseGrunts =
    6 +
    Math.floor(meta.actNumber * 0.65) +
    sizeBonus +
    (meta.chapterInAct >= 12 ? 2 : 0);
  const totalEnemyCount = Math.min(24, Math.max(8, baseGrunts + 1));

  // Theater-specific historical force pools across all 4 tiers & 5 military domains!
  const getTheaterTierPool = (theater: TheaterProfile | undefined, tier: 1 | 2 | 3 | 4): UnitClassId[] => {
    const byLineage = (
      t1: UnitClassId,
      t2: UnitClassId,
      t3: UnitClassId,
      t4: UnitClassId
    ): UnitClassId => (tier === 1 ? t1 : tier === 2 ? t2 : tier === 3 ? t3 : t4);

    // Core historical branches
    const rifleInf = byLineage('MERCENARY', 'HERO', 'VANGUARD', 'LEGEND_CHAMPION');
    const smgAssault = byLineage('MYRMIDON', 'SWORDMASTER', 'TRUEBLADE', 'SWORD_SAINT');
    const mgFlame = byLineage('FIGHTER', 'BERSERKER', 'REAVER', 'WAR_GOD');
    const antiTankInf = byLineage('SOLDIER', 'HALBERDIER', 'SENTINEL', 'SPEAR_EMPEROR');
    const sniperAA = byLineage('ARCHER', 'SNIPER', 'MARKSMAN', 'STARFALL_ARCHER');
    const sapper = byLineage('BRAWLER', 'WAR_MONK', 'IRON_FIST_MASTER', 'TITAN_DEMIGOD');
    const marine = byLineage('SAMURAI', 'RONIN_MASTER', 'SHOGUN_BLADE', 'HEAVEN_KENSEI');
    const commando = byLineage('NINJA', 'MASTER_NINJA', 'SHADOW_KAGE', 'PHANTOM_SHOGUN');
    const scout = byLineage('THIEF', 'ASSASSIN', 'WHISPER', 'PHANTOM_REAPER');
    const paratroop = byLineage('SPELLBLADE', 'MORTAL_SAVANT', 'RUNE_BLADE', 'AETHER_SOVEREIGN');
    const radar = byLineage('CHRONOMANCER', 'ASTROLOGER', 'TIME_WEAVER', 'ETERNAL_CHRONOS');
    const signal = byLineage('MONK', 'EXORCIST', 'INQUISITOR', 'SOLAR_HIEROPHANT');

    const medTank = byLineage('CAVALIER', 'PALADIN', 'SILVER_KNIGHT', 'ASTRAL_CAVALIER');
    const heavyTank = byLineage('KNIGHT', 'GENERAL', 'MARSHAL', 'TITAN_CITADEL');
    const tankDestr = byLineage('DRAGOON', 'WYRM_SLAYER', 'DRAGON_KNIGHT', 'ETERNAL_DRAGOON');
    const reconArmor = byLineage('NOMAD', 'NOMAD_TROOPER', 'BOW_KNIGHT', 'TEMPEST_KHAN');
    const apcIfv = byLineage('TROUBADOUR', 'VALKYRIE', 'SERAPH_RIDER', 'CELESTIAL_EMPRESS');
    const spaaAirArmor = byLineage('OUTRIDER', 'RANGER_KNIGHT', 'HORIZON_LANCER', 'STORM_STRIDER');

    const howitzerMlrs = byLineage('MAGE', 'SAGE', 'ARCHSAGE', 'ASTRAL_ORACLE');
    const siegeMissile = byLineage('DARK_MAGE', 'NECROMANCER', 'DARK_DRUID', 'ABYSSAL_ARCHON');
    const thermoRocket = byLineage('SHAMAN', 'SPIRIT_CALLER', 'ELDER_ORACLE', 'PRIMORDIAL_AVATAR');

    const fighter = byLineage('PEGASUS', 'FALCON_KNIGHT', 'SERAPH_KNIGHT', 'CELESTIAL_VALKYRIE');
    const bomber = byLineage('WYVERN_RIDER', 'WYVERN_LORD', 'DRAGONLORD', 'SKY_SOVEREIGN');
    const heliTrans = byLineage('GRIFFIN_RIDER', 'GRIFFIN_LORD', 'SUN_GRIFFIN', 'SOLAR_APEX_KNIGHT');

    const warship = byLineage('PIRATE', 'CORSAIR', 'DREAD_CAPTAIN', 'OCEAN_LEVIATHAN');
    const submarine = byLineage('DARK_KNIGHT', 'DOOM_RIDER', 'DEATH_KNIGHT', 'ABYSS_SOVEREIGN');
    const carrierLst = byLineage('TEMPLAR', 'AEGIS_GUARD', 'HOLY_BASTION', 'DIVINE_WARDEN');

    switch (theater) {
      case 'FLEET_NAVAL':
        return [warship, warship, submarine, carrierLst, fighter, bomber, heliTrans, marine, radar, siegeMissile];
      case 'AMPHIBIOUS_LANDING':
        return [marine, marine, sapper, warship, carrierLst, bomber, fighter, mgFlame, howitzerMlrs, antiTankInf, spaaAirArmor];
      case 'ARMORED_CLASH':
        return [medTank, medTank, heavyTank, heavyTank, tankDestr, reconArmor, apcIfv, antiTankInf, howitzerMlrs, thermoRocket, bomber, fighter];
      case 'AIR_DEFENSE':
        return [fighter, fighter, bomber, bomber, heliTrans, spaaAirArmor, sniperAA, radar, signal, paratroop, siegeMissile];
      case 'AIRBORNE_BRIDGE':
        return [paratroop, paratroop, heliTrans, fighter, spaaAirArmor, reconArmor, smgAssault, sniperAA, commando, sapper, medTank];
      case 'FORTRESS_SIEGE':
        return [siegeMissile, howitzerMlrs, heavyTank, sapper, mgFlame, rifleInf, sniperAA, antiTankInf, thermoRocket, bomber];
      case 'URBAN_ASSAULT':
        return [smgAssault, smgAssault, mgFlame, sapper, sniperAA, rifleInf, heavyTank, tankDestr, thermoRocket, commando, apcIfv];
      case 'MOUNTAIN_WINTER':
        return [sniperAA, rifleInf, sapper, commando, scout, howitzerMlrs, mgFlame, medTank, heliTrans, antiTankInf];
      case 'DESERT_MOBILE':
        return [medTank, reconArmor, tankDestr, apcIfv, spaaAirArmor, fighter, bomber, rifleInf, howitzerMlrs, heavyTank];
      case 'RIVER_CANAL':
        return [sapper, rifleInf, antiTankInf, medTank, howitzerMlrs, marine, warship, sniperAA, mgFlame, heliTrans];
      case 'JUNGLE_ISLAND':
        return [marine, commando, scout, sapper, mgFlame, sniperAA, smgAssault, heliTrans, warship, carrierLst, howitzerMlrs];
      case 'TRENCH_FRONT':
      default:
        return [rifleInf, mgFlame, smgAssault, howitzerMlrs, siegeMissile, sapper, sniperAA, antiTankInf, medTank, heavyTank, fighter, reconArmor];
    }
  };

  const t1Pool = getTheaterTierPool(meta.theaterProfile, 1);
  const t2Pool = getTheaterTierPool(meta.theaterProfile, 2);
  const t3Pool = getTheaterTierPool(meta.theaterProfile, 3);
  const t4Pool = getTheaterTierPool(meta.theaterProfile, 4);

  const poolClasses: UnitClassId[] =
    meta.actNumber >= 13
      ? t4Pool
      : meta.actNumber === 12
      ? [...t4Pool.slice(0, 6), ...t3Pool.slice(0, 6)]
      : meta.actNumber >= 9
      ? t3Pool
      : meta.actNumber === 8
      ? [...t3Pool.slice(0, 6), ...t2Pool.slice(0, 6)]
      : meta.actNumber >= 5
      ? t2Pool
      : meta.actNumber === 4
      ? [...t2Pool.slice(0, 6), ...t1Pool.slice(0, 6)]
      : t1Pool;

  const healerClass: UnitClassId =
    meta.actNumber >= 13
      ? 'SERAPH_PROPHET'
      : meta.actNumber >= 9
      ? 'SAINT'
      : meta.actNumber >= 5
      ? 'BISHOP'
      : 'CLERIC';

  // Track WATER tiles reserved for naval berths & naval enemy warships so road connectivity never overwrites them!
  const protectedWaterTiles = new Set<string>();
  const landSpawnKeySet = new Set<string>(playerSpawns.map((p) => `${p.x},${p.y}`));

  // Helper to link a naval WATER tile into the nearest main WATER body using WATER/BRIDGE channel tiles
  const connectWaterTileToMainChannel = (wx: number, wy: number) => {
    let bestTarget: TileCoord | null = null;
    let bestDist = Infinity;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if ((x === wx && y === wy) || protectedWaterTiles.has(`${x},${y}`)) continue;
        if (grid[y][x] === 'WATER') {
          const d = Math.abs(x - wx) + Math.abs(y - wy);
          if (d < bestDist) {
            bestDist = d;
            bestTarget = { x, y };
          }
        }
      }
    }
    if (!bestTarget || bestDist <= 1) return;
    let cx = wx;
    let cy = wy;
    while (cx !== bestTarget.x || cy !== bestTarget.y) {
      if (cy !== bestTarget.y && (cx === bestTarget.x || Math.abs(bestTarget.y - cy) >= Math.abs(bestTarget.x - cx))) {
        cy += cy < bestTarget.y ? 1 : -1;
      } else {
        cx += cx < bestTarget.x ? 1 : -1;
      }
      const cKey = `${cx},${cy}`;
      if (
        cKey === `${throneCoord.x},${throneCoord.y}` ||
        cKey === `${armoryShopCoord.x},${armoryShopCoord.y}` ||
        cKey === `${vendorShopCoord.x},${vendorShopCoord.y}` ||
        grid[cy][cx] === 'FORT'
      ) {
        continue;
      }
      if (protectedWaterTiles.has(cKey) || grid[cy][cx] === 'WATER') continue;
      if (landSpawnKeySet.has(cKey) || grid[cy][cx] === 'ROAD' || grid[cy][cx] === 'BRIDGE') {
        grid[cy][cx] = 'BRIDGE';
      } else {
        grid[cy][cx] = 'WATER';
      }
    }
  };

  // Count navigable water on this battlefield; if riverine/coastal/naval, create 3 WATER berths at the tail of playerSpawns!
  let mapWaterTiles = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === 'WATER') mapWaterTiles++;
    }
  }
  const hasNavalTheaterWater =
    meta.theaterProfile === 'FLEET_NAVAL' ||
    meta.theaterProfile === 'AMPHIBIOUS_LANDING' ||
    meta.theaterProfile === 'RIVER_CANAL' ||
    meta.theaterProfile === 'JUNGLE_ISLAND' ||
    meta.layout === 'harbor_docks' ||
    meta.layout === 'river_crossing' ||
    meta.layout === 'twin_bridges' ||
    mapWaterTiles >= 14;

  if (hasNavalTheaterWater && mapWaterTiles >= 6 && playerSpawns.length >= 10) {
    const berthCount = Math.min(3, playerSpawns.length - 8);
    const navalBerthSpawns = playerSpawns.slice(playerSpawns.length - berthCount);
    for (const berth of navalBerthSpawns) {
      const bKey = `${berth.x},${berth.y}`;
      landSpawnKeySet.delete(bKey);
      grid[berth.y][berth.x] = 'WATER';
      protectedWaterTiles.add(bKey);
    }
    for (const berth of navalBerthSpawns) {
      connectWaterTileToMainChannel(berth.x, berth.y);
    }
  }

  const nonNavalPool: UnitClassId[] = poolClasses.filter(
    (c) => CLASS_META[c].moveType !== 'NAVAL'
  );
  const safeLandPool: UnitClassId[] = nonNavalPool.length > 0 ? nonNavalPool : ['MERCENARY'];

  const occupied = new Set<string>(playerSpawns.map((p) => `${p.x},${p.y}`));
  occupied.add(`${throneCoord.x},${throneCoord.y}`);
  occupied.add(`${armoryShopCoord.x},${armoryShopCoord.y}`);
  occupied.add(`${vendorShopCoord.x},${vendorShopCoord.y}`);

  const minSafeDistFromSpawn = (x: number, y: number): number => {
    let best = Infinity;
    for (const sp of playerSpawns) {
      const d = Math.abs(x - sp.x) + Math.abs(y - sp.y);
      if (d < best) best = d;
    }
    return best;
  };

  // Helper: find an orthogonally adjacent foot-passable coastal/pier tile for a WATER tile
  const findAdjacentLandTile = (x: number, y: number): TileCoord | null => {
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (
        nx >= 0 &&
        ny >= 0 &&
        nx < width &&
        ny < height &&
        !protectedWaterTiles.has(`${nx},${ny}`) &&
        isFootPassable(grid[ny][nx])
      ) {
        return { x: nx, y: ny };
      }
    }
    return null;
  };

  // Ensure every player WATER berth has an adjacent foot-passable pier/shore anchor
  const connectivityAnchors: TileCoord[] = [];
  for (const sp of playerSpawns) {
    if (protectedWaterTiles.has(`${sp.x},${sp.y}`)) {
      const adj = findAdjacentLandTile(sp.x, sp.y);
      if (adj) {
        connectivityAnchors.push(adj);
      }
    }
  }

  const enemies: Unit[] = [];

  // 1. Place Map Boss: land/air bosses on Command HQ (Throne); NAVAL bosses strictly on adjacent connected WATER!
  const bossLevel = meta.recommendedLevel + (meta.chapterInAct >= 12 ? 3 : 2);
  let bossX = throneCoord.x;
  let bossY = throneCoord.y;
  if (CLASS_META[meta.bossClass].moveType === 'NAVAL') {
    const bossAdjCandidates: TileCoord[] = [
      { x: throneCoord.x - 1, y: throneCoord.y },
      { x: throneCoord.x + 1, y: throneCoord.y },
      { x: throneCoord.x, y: throneCoord.y - 1 },
      { x: throneCoord.x, y: throneCoord.y + 1 },
    ].filter(
      (c) =>
        c.x >= 1 &&
        c.x <= width - 2 &&
        c.y >= 1 &&
        c.y <= height - 2 &&
        !occupied.has(`${c.x},${c.y}`)
    );
    // Sort existing WATER first, then tiles closer to map center so throne keeps open land approach
    bossAdjCandidates.sort((a, b) => {
      const aWater = grid[a.y][a.x] === 'WATER' ? 0 : 1;
      const bWater = grid[b.y][b.x] === 'WATER' ? 0 : 1;
      if (aWater !== bWater) return aWater - bWater;
      return Math.abs(a.y - midY) - Math.abs(b.y - midY);
    });
    const chosenBossWater = bossAdjCandidates[0];
    if (chosenBossWater) {
      bossX = chosenBossWater.x;
      bossY = chosenBossWater.y;
      grid[bossY][bossX] = 'WATER';
      const bKey = `${bossX},${bossY}`;
      occupied.add(bKey);
      protectedWaterTiles.add(bKey);
      connectWaterTileToMainChannel(bossX, bossY);
      // Guarantee throneCoord still has at least one foot-passable land approach neighbor
      let hasThroneFootNeighbor = false;
      for (const [dx, dy] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        const nx = throneCoord.x + dx;
        const ny = throneCoord.y + dy;
        if (
          nx >= 0 &&
          ny >= 0 &&
          nx < width &&
          ny < height &&
          !(nx === bossX && ny === bossY) &&
          isFootPassable(grid[ny][nx])
        ) {
          hasThroneFootNeighbor = true;
        }
      }
      if (!hasThroneFootNeighbor) {
        for (const [dx, dy] of [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ]) {
          const nx = throneCoord.x + dx;
          const ny = throneCoord.y + dy;
          if (nx >= 1 && ny >= 1 && nx < width - 1 && ny < height - 1 && !(nx === bossX && ny === bossY)) {
            grid[ny][nx] = 'ROAD';
            break;
          }
        }
      }
    }
  }
  enemies.push(
    createEnemyUnit(
      `enemy_boss_${mapId}`,
      meta.bossName,
      meta.bossClass,
      bossLevel,
      meta.actNumber,
      bossX,
      bossY,
      'BOSS',
      true,
      meta.bossWeaponId,
      meta.bossTitle,
      false
    )
  );
  connectivityAnchors.push(throneCoord);

  // 2. Place 1–3 Elite Sub-Commanders on Bunker/Fort strongpoints (strictly non-naval since FORT is dry land)
  const eliteBudget = area >= 500 ? 3 : mapId >= 24 ? 2 : mapId >= 2 ? 1 : 0;
  const availableForts = fortPositions.filter(
    (f) =>
      grid[f.y]?.[f.x] === 'FORT' &&
      minSafeDistFromSpawn(f.x, f.y) >= 6 &&
      !occupied.has(`${f.x},${f.y}`)
  );
  for (let eIdx = 0; eIdx < eliteBudget && eIdx < availableForts.length; eIdx++) {
    const fCoord = availableForts[eIdx];
    occupied.add(`${fCoord.x},${fCoord.y}`);
    const eliteClass = safeLandPool[(mapId * 5 + eIdx * 7) % safeLandPool.length];
    const eliteMeta = CLASS_META[eliteClass];
    enemies.push(
      createEnemyUnit(
        `enemy_elite_${mapId}_${eIdx + 1}`,
        `Chỉ Huy ${eliteMeta.name}`,
        eliteClass,
        meta.recommendedLevel + 1,
        meta.actNumber,
        fCoord.x,
        fCoord.y,
        'GUARDIAN',
        false,
        undefined,
        'Đơn Vị Tinh Nhuệ',
        true
      )
    );
    connectivityAnchors.push(fCoord);
  }

  // 3. Place 1–2 Enemy Field Medics near enemy mid-rear / Boss command zone
  const healerBudget = totalEnemyCount >= 14 ? 2 : 1;
  for (let hIdx = 0; hIdx < healerBudget && enemies.length < totalEnemyCount; hIdx++) {
    let hCoord: TileCoord | null = null;
    for (let attempt = 0; attempt < 45; attempt++) {
      const tRatio = 0.62 + rng() * 0.3;
      const tx = clampCoord(
        Math.round(spawnCentroid.x + (throneCoord.x - spawnCentroid.x) * tRatio + (rng() - 0.5) * 6),
        1,
        width - 2
      );
      const ty = clampCoord(
        Math.round(spawnCentroid.y + (throneCoord.y - spawnCentroid.y) * tRatio + (rng() - 0.5) * 6),
        1,
        height - 2
      );
      const key = `${tx},${ty}`;
      const hMetaCheck = CLASS_META[healerClass];
      if (
        !occupied.has(key) &&
        !protectedWaterTiles.has(key) &&
        isFootPassable(grid[ty][tx]) &&
        canUnitStandOnTerrain(hMetaCheck.moveType, grid[ty][tx]) &&
        minSafeDistFromSpawn(tx, ty) >= 7
      ) {
        hCoord = { x: tx, y: ty };
        occupied.add(key);
        break;
      }
    }
    if (hCoord) {
      const hMeta = CLASS_META[healerClass];
      enemies.push(
        createEnemyUnit(
          `enemy_healer_${mapId}_${hIdx + 1}`,
          `${hMeta.name} Quân Y`,
          healerClass,
          Math.max(1, meta.recommendedLevel),
          meta.actNumber,
          hCoord.x,
          hCoord.y,
          'HEALER',
          false
        )
      );
      connectivityAnchors.push(hCoord);
    }
  }

  // 4. Fill remaining tactical enemy squad across Vanguard, Flanking Wings, Naval Escorts & HQ Guard!
  let gruntIndex = 1;
  while (enemies.length < totalEnemyCount) {
    const classIdx = (mapId * 3 + gruntIndex * 2) % poolClasses.length;
    let classId = poolClasses[classIdx];
    let cMeta = CLASS_META[classId];

    let placed: TileCoord | null = null;
    let anchorForPlaced: TileCoord | null = null;

    // Naval units MUST spawn strictly on WATER tiles adjacent to shore/bridge — NEVER fall back to land!
    if (cMeta.moveType === 'NAVAL') {
      for (let attempt = 0; attempt < 60; attempt++) {
        const wx = 1 + Math.floor(rng() * (width - 2));
        const wy = 1 + Math.floor(rng() * (height - 2));
        const key = `${wx},${wy}`;
        if (!occupied.has(key) && grid[wy][wx] === 'WATER' && minSafeDistFromSpawn(wx, wy) >= 5) {
          const adj = findAdjacentLandTile(wx, wy);
          if (adj) {
            placed = { x: wx, y: wy };
            anchorForPlaced = adj;
            occupied.add(key);
            protectedWaterTiles.add(key);
            break;
          }
        }
      }
      if (!placed) {
        for (let wy = 1; wy < height - 1 && !placed; wy++) {
          for (let wx = 1; wx < width - 1 && !placed; wx++) {
            const key = `${wx},${wy}`;
            if (!occupied.has(key) && grid[wy][wx] === 'WATER' && minSafeDistFromSpawn(wx, wy) >= 5) {
              const adj = findAdjacentLandTile(wx, wy);
              if (adj) {
                placed = { x: wx, y: wy };
                anchorForPlaced = adj;
                occupied.add(key);
                protectedWaterTiles.add(key);
              }
            }
          }
        }
      }
      // If no valid coastal water slot remains on this map, convert unit to a non-naval class before land placement!
      if (!placed) {
        classId = safeLandPool[(mapId * 3 + gruntIndex * 2) % safeLandPool.length];
        cMeta = CLASS_META[classId];
      }
    }

    const primaryWeapon = cMeta.allowedWeaponTypes[0];
    const aiPolicy: AIPolicy =
      primaryWeapon === 'BOW' || primaryWeapon === 'TOME'
        ? 'KITER'
        : cMeta.moveType === 'ARMORED' || cMeta.moveType === 'NAVAL'
        ? 'GUARDIAN'
        : cMeta.moveType === 'FLYING' ||
          classId.includes('THIEF') ||
          classId.includes('ASSASSIN') ||
          classId.includes('NINJA') ||
          classId.includes('MYRMIDON') ||
          classId.includes('SWORD')
        ? 'FLANKER'
        : 'CHASER';

    if (!placed) {
      for (let attempt = 0; attempt < 60; attempt++) {
        let tx: number;
        let ty: number;
        if (axis === 'CENTER_HOLDOUT') {
          const edge = (gruntIndex + attempt) % 4;
          tx =
            edge === 0
              ? 1 + Math.floor(rng() * 4)
              : edge === 1
              ? width - 2 - Math.floor(rng() * 4)
              : 2 + Math.floor(rng() * (width - 4));
          ty =
            edge === 2
              ? 1 + Math.floor(rng() * 3)
              : edge === 3
              ? height - 2 - Math.floor(rng() * 3)
              : 2 + Math.floor(rng() * (height - 4));
        } else {
          const bandRatio = gruntIndex <= 4 ? 0.38 + rng() * 0.22 : 0.55 + rng() * 0.4;
          tx = clampCoord(
            Math.round(
              spawnCentroid.x +
                (throneCoord.x - spawnCentroid.x) * bandRatio +
                (rng() - 0.5) * width * 0.45
            ),
            1,
            width - 2
          );
          ty = clampCoord(
            Math.round(
              spawnCentroid.y +
                (throneCoord.y - spawnCentroid.y) * bandRatio +
                (rng() - 0.5) * height * 0.65
            ),
            1,
            height - 2
          );
        }

        const key = `${tx},${ty}`;
        if (
          !occupied.has(key) &&
          !protectedWaterTiles.has(key) &&
          isFootPassable(grid[ty][tx]) &&
          canUnitStandOnTerrain(cMeta.moveType, grid[ty][tx]) &&
          minSafeDistFromSpawn(tx, ty) >= 5
        ) {
          placed = { x: tx, y: ty };
          anchorForPlaced = placed;
          occupied.add(key);
          break;
        }
      }
    }

    if (!placed) {
      for (let fy = 1; fy < height - 1 && !placed; fy++) {
        for (let fx = 1; fx < width - 1 && !placed; fx++) {
          const key = `${fx},${fy}`;
          if (!occupied.has(key) && !protectedWaterTiles.has(key) && minSafeDistFromSpawn(fx, fy) >= 5) {
            if (!isFootPassable(grid[fy][fx]) || !canUnitStandOnTerrain(cMeta.moveType, grid[fy][fx])) {
              grid[fy][fx] = 'ROAD';
            }
            placed = { x: fx, y: fy };
            anchorForPlaced = placed;
            occupied.add(key);
          }
        }
      }
    }
    if (!placed) break;

    const lvl = Math.max(1, meta.recommendedLevel - (gruntIndex % 3 === 0 ? 1 : 0));
    enemies.push(
      createEnemyUnit(
        `enemy_${mapId}_${gruntIndex}`,
        `${cMeta.name} Địch ${gruntIndex}`,
        classId,
        lvl,
        meta.actNumber,
        placed.x,
        placed.y,
        aiPolicy,
        false
      )
    );
    if (anchorForPlaced) {
      connectivityAnchors.push(anchorForPlaced);
    }
    gruntIndex += 1;
  }

  // Guarantee 100% foot connectivity between playerSpawns[0], all land spawns, shops, HQ & every enemy shore anchor!
  const landSpawnsForReach = playerSpawns
    .slice(1)
    .filter((sp) => !protectedWaterTiles.has(`${sp.x},${sp.y}`));
  const mustReach: TileCoord[] = [
    ...landSpawnsForReach,
    armoryShopCoord,
    vendorShopCoord,
    throneCoord,
    ...connectivityAnchors,
  ];
  ensureConnectivity(grid, playerSpawns[0], mustReach, protectedWaterTiles);

  // Final safety restore of special objective & protected naval water tiles
  for (const wKey of protectedWaterTiles) {
    const [wxStr, wyStr] = wKey.split(',');
    grid[Number(wyStr)][Number(wxStr)] = 'WATER';
  }
  grid[armoryShopCoord.y][armoryShopCoord.x] = 'SHOP_ARMORY';
  grid[vendorShopCoord.y][vendorShopCoord.x] = 'SHOP_VENDOR';
  grid[throneCoord.y][throneCoord.x] = 'THRONE';

  return {
    meta,
    width,
    height,
    grid,
    playerSpawns,
    throneCoord,
    armoryShopCoord,
    vendorShopCoord,
    enemies,
  };
}

export function getTotalMapCount(): number {
  return CAMPAIGN_MAPS.length;
}
