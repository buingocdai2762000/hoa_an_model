export type GameScreenState = 'title' | 'playing' | 'paused' | 'gameover';

export type Faction = 'PLAYER' | 'ENEMY';

export type WeaponType = 'SWORD' | 'LANCE' | 'AXE' | 'BOW' | 'TOME' | 'STAFF';

export type MagicElement = 'NONE' | 'FIRE' | 'THUNDER' | 'WIND' | 'ICE' | 'LIGHT' | 'DARK';

export type MoveType = 'FOOT' | 'MOUNTED' | 'FLYING' | 'ARMORED';

export type UnitTier = 1 | 2 | 3 | 4;

export type UnitClassId =
  // === 30 Tier 1 Base Classes (Bậc I - Khởi Nguyên) ===
  | 'LORD'
  | 'CAVALIER'
  | 'ARCHER'
  | 'MAGE'
  | 'CLERIC'
  | 'KNIGHT'
  | 'PEGASUS'
  | 'MYRMIDON'
  | 'FIGHTER'
  | 'WYVERN_RIDER'
  | 'THIEF'
  | 'DARK_MAGE'
  | 'MERCENARY'
  | 'SOLDIER'
  | 'MONK'
  | 'NOMAD'
  | 'SPELLBLADE'
  // New 13 Lineages — Tier 1
  | 'TROUBADOUR'
  | 'PIRATE'
  | 'GRIFFIN_RIDER'
  | 'SAMURAI'
  | 'SHAMAN'
  | 'BRAWLER'
  | 'OUTRIDER'
  | 'DARK_KNIGHT'
  | 'WAR_CLERIC'
  | 'DRAGOON'
  | 'NINJA'
  | 'TEMPLAR'
  | 'CHRONOMANCER'
  // === 30 Tier 2 Evolved Classes (Bậc II - Lv.5) ===
  | 'GREAT_LORD'
  | 'PALADIN'
  | 'SNIPER'
  | 'SAGE'
  | 'BISHOP'
  | 'GENERAL'
  | 'FALCON_KNIGHT'
  | 'SWORDMASTER'
  | 'BERSERKER'
  | 'WYVERN_LORD'
  | 'ASSASSIN'
  | 'NECROMANCER'
  | 'HERO'
  | 'HALBERDIER'
  | 'EXORCIST'
  | 'NOMAD_TROOPER'
  | 'MORTAL_SAVANT'
  // New 13 Lineages — Tier 2
  | 'VALKYRIE'
  | 'CORSAIR'
  | 'GRIFFIN_LORD'
  | 'RONIN_MASTER'
  | 'SPIRIT_CALLER'
  | 'WAR_MONK'
  | 'RANGER_KNIGHT'
  | 'DOOM_RIDER'
  | 'BATTLE_PRIEST'
  | 'WYRM_SLAYER'
  | 'MASTER_NINJA'
  | 'AEGIS_GUARD'
  | 'ASTROLOGER'
  // === 30 Tier 3 Master Classes (Bậc III - Lv.15) ===
  | 'SOVEREIGN'
  | 'SILVER_KNIGHT'
  | 'MARKSMAN'
  | 'ARCHSAGE'
  | 'SAINT'
  | 'MARSHAL'
  | 'SERAPH_KNIGHT'
  | 'TRUEBLADE'
  | 'REAVER'
  | 'DRAGONLORD'
  | 'WHISPER'
  | 'DARK_DRUID'
  | 'VANGUARD'
  | 'SENTINEL'
  | 'INQUISITOR'
  | 'BOW_KNIGHT'
  | 'RUNE_BLADE'
  // New 13 Lineages — Tier 3
  | 'SERAPH_RIDER'
  | 'DREAD_CAPTAIN'
  | 'SUN_GRIFFIN'
  | 'SHOGUN_BLADE'
  | 'ELDER_ORACLE'
  | 'IRON_FIST_MASTER'
  | 'HORIZON_LANCER'
  | 'DEATH_KNIGHT'
  | 'CRUSADER_BISHOP'
  | 'DRAGON_KNIGHT'
  | 'SHADOW_KAGE'
  | 'HOLY_BASTION'
  | 'TIME_WEAVER'
  // === 30 Tier 4 Mythic Classes (Bậc IV - Lv.30) ===
  | 'EMPEROR_LORD'
  | 'ASTRAL_CAVALIER'
  | 'STARFALL_ARCHER'
  | 'ASTRAL_ORACLE'
  | 'SERAPH_PROPHET'
  | 'TITAN_CITADEL'
  | 'CELESTIAL_VALKYRIE'
  | 'SWORD_SAINT'
  | 'WAR_GOD'
  | 'SKY_SOVEREIGN'
  | 'PHANTOM_REAPER'
  | 'ABYSSAL_ARCHON'
  | 'LEGEND_CHAMPION'
  | 'SPEAR_EMPEROR'
  | 'SOLAR_HIEROPHANT'
  | 'TEMPEST_KHAN'
  | 'AETHER_SOVEREIGN'
  // New 13 Lineages — Tier 4
  | 'CELESTIAL_EMPRESS'
  | 'OCEAN_LEVIATHAN'
  | 'SOLAR_APEX_KNIGHT'
  | 'HEAVEN_KENSEI'
  | 'PRIMORDIAL_AVATAR'
  | 'TITAN_DEMIGOD'
  | 'STORM_STRIDER'
  | 'ABYSS_SOVEREIGN'
  | 'WRATHFUL_SERAPH'
  | 'ETERNAL_DRAGOON'
  | 'PHANTOM_SHOGUN'
  | 'DIVINE_WARDEN'
  | 'ETERNAL_CHRONOS'
  // === Unique Boss Class ===
  | 'DARK_GENERAL';

export type SkillId =
  // Active Combat Arts (Tuyệt Kỹ)
  | 'LUNA_STRIKE'
  | 'SOL_STRIKE'
  | 'ASTRA_FLURRY'
  | 'IGNIS_BURST'
  | 'DEADEYE_SHOT'
  | 'DRAGON_FANG'
  | 'LETHALITY_STRIKE'
  | 'SANCTUARY_AURA'
  | 'VOID_COLLAPSE'
  // Passive Skills (Nội Tại)
  | 'ROYAL_CHARM'
  | 'VANTAGE'
  | 'WRATH'
  | 'PAVISE'
  | 'AEGIS'
  | 'DUELIST_BLOW'
  | 'LIFETAKER'
  | 'CANTO_AGILITY'
  | 'SHADOW_STEP'
  | 'ARCANE_SURGE';

export interface SkillDef {
  id: SkillId;
  name: string;
  kind: 'ACTIVE' | 'PASSIVE';
  shortDesc: string;
  detailDesc: string;
  accentColor: string;
  spCost?: number;
  damageBonus?: number;
  damageMultiplier?: number;
  hitBonus?: number;
  critBonus?: number;
  rangeBonus?: number;
  ignoreDefenseRatio?: number;
  drainRatio?: number;
  scaleByStat?: 'def' | 'mag' | 'spd' | 'str';
  scaleRatio?: number;
  aoeHeal?: boolean;
}

export type AIPolicy = 'CHASER' | 'GUARDIAN' | 'KITER' | 'FLANKER' | 'HEALER' | 'BOSS';

export type FormationPresetId = 'BALANCED' | 'PHALANX' | 'SPEARHEAD' | 'PINCER';

export type TerrainType =
  | 'PLAIN'
  | 'FOREST'
  | 'FORT'
  | 'MOUNTAIN'
  | 'WATER'
  | 'WALL'
  | 'BRIDGE'
  | 'ROAD'
  | 'SAND'
  | 'SNOW'
  | 'LAVA'
  | 'THRONE'
  | 'SHOP_ARMORY'
  | 'SHOP_VENDOR';

export type BiomeId =
  | 'VALORIA_PLAINS'
  | 'ELDWOOD_FOREST'
  | 'HOWLING_CANYON'
  | 'SOLARA_DESERT'
  | 'BLACKMIST_HARBOR'
  | 'DARKSEAL_SWAMP'
  | 'FROSTPEAK_TUNDRA'
  | 'MAGMA_FORTRESS'
  | 'AETHELGARD_CITY'
  | 'CRIMSON_SANCTUM';

export type WeatherType =
  | 'NONE'
  | 'SUNLIGHT'
  | 'LEAVES'
  | 'MIST'
  | 'SAND'
  | 'RAIN'
  | 'STORM'
  | 'SNOW'
  | 'EMBERS'
  | 'SPARKS';

export interface WeatherInfo {
  id: WeatherType;
  name: string;
  shortEffect: string;
  description: string;
  accentColor: string;
  badgeBg: string;
  elementDamageBonus?: Partial<Record<MagicElement, number>>;
  bowHitMod?: number;
  allAvoidMod?: number;
  allCritMod?: number;
  allHitMod?: number;
  healMod?: number;
  meleeDamageBonus?: number;
  magicDamageBonus?: number;
}

export type TitleRarity = 'COMMON' | 'RARE' | 'EPIC' | 'MYTHIC';

export interface TitleDef {
  id: string;
  name: string;
  rarity: TitleRarity;
  category: 'COMBAT' | 'CAMPAIGN' | 'EVOLUTION' | 'WEALTH' | 'WEATHER' | 'STARTER';
  accentColor: string;
  description: string;
  unlockConditionText: string;
  statBonuses: Partial<UnitStats>;
  combatBonuses?: {
    hit?: number;
    crit?: number;
    avoid?: number;
    goldBonusPercent?: number;
  };
}

export type MapObjective = 'ROUT' | 'DEFEAT_BOSS' | 'SEIZE' | 'SURVIVE';

export type LayoutTemplate =
  | 'border_gate'
  | 'river_crossing'
  | 'forest_ambush'
  | 'canyon_pass'
  | 'desert_oasis'
  | 'harbor_docks'
  | 'swamp_ruins'
  | 'snow_ridge'
  | 'lava_fortress'
  | 'capital_streets'
  | 'twin_bridges'
  | 'sanctum_throne';

export type WeaponShopTag = 'CAMP' | 'IN_MAP_ARMORY' | 'IN_MAP_VENDOR' | 'EXOTIC';

export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  element?: MagicElement;
  might: number;
  hit: number;
  crit: number;
  minRange: number;
  maxRange: number;
  isMagic: boolean;
  effectiveVsFlying?: boolean;
  effectiveVsArmor?: boolean;
  effectiveVsCavalry?: boolean;
  brave?: boolean;
  drainRatio?: number;
  ignoreDefenseRatio?: number;
  healPower?: number;
  description?: string;
  tier: UnitTier;
  price: number;
  shopTag?: WeaponShopTag;
}

export type ItemCategory =
  | 'POTION'
  | 'STAT_BOOST'
  | 'SEAL'
  | 'EXP_MANUAL'
  | 'TREASURE'
  | 'FORGE_MAT'
  | 'GEM';

export type ArmorSlot = 'HELMET' | 'ARMOR' | 'GAUNTLETS' | 'GREAVES' | 'BOOTS';

export type EquipmentRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';

export interface ArmorTemplate {
  id: string;
  name: string;
  slot: ArmorSlot;
  tier: UnitTier;
  price: number;
  shopTag: 'CAMP' | 'IN_MAP_ARMORY' | 'IN_MAP_VENDOR';
  accentColor: string;
  description: string;
  baseStats: Partial<UnitStats>;
  baseHit?: number;
  baseCrit?: number;
  baseAvoid?: number;
}

export interface GemDef {
  id: string;
  name: string;
  rarity: EquipmentRarity;
  price: number;
  color: string;
  shortBonus: string;
  description: string;
  statBonuses: Partial<UnitStats>;
  hitBonus?: number;
  critBonus?: number;
  avoidBonus?: number;
}

export interface EquipmentInstance {
  uid: string;
  templateId: string;
  slot: ArmorSlot;
  rarity: EquipmentRarity;
  level: number; // 1..20
  temperLevel: number; // 0..10
  gems: string[]; // gemIds from GEMS
}

export interface WeaponForgeState {
  rarity: EquipmentRarity;
  level: number; // 1..20
  temperLevel: number; // 0..10
  gems: string[]; // gemIds from GEMS
}

export type SealItemId = 'master_seal' | 'royal_crest' | 'mythic_crown' | 'omni_seal';

export interface GameItem {
  id: string;
  name: string;
  category: ItemCategory;
  tier: UnitTier;
  price: number;
  sellValue?: number; // Full sell value for Treasure Bullions
  shopTag: 'CAMP' | 'IN_MAP_ARMORY' | 'IN_MAP_VENDOR' | 'BOTH';
  accentColor: string;
  description: string;
  healHp?: number;
  restoreSp?: number;
  statBoost?: Partial<UnitStats>;
  expGrant?: number;
  sealTargetTier?: 2 | 3 | 4 | 'ANY';
}

export type ShopKind = 'CAMP_BAZAAR' | 'IN_MAP_ARMORY' | 'IN_MAP_VENDOR';

export interface ShopStock {
  kind: ShopKind;
  title: string;
  subtitle: string;
  badgeText: string;
  accentColor: string;
  exclusivityNote: string;
  weaponIds: string[];
  itemIds: string[];
  armorIds?: string[];
  gemIds?: string[];
}

export interface UnitStats {
  maxHp: number;
  str: number;
  mag: number;
  skl: number;
  spd: number;
  lck: number;
  def: number;
  res: number;
  mov: number;
}

export interface StatGrowths {
  hp: number;
  str: number;
  mag: number;
  skl: number;
  spd: number;
  lck: number;
  def: number;
  res: number;
}

export interface ClassPromotionDef {
  toClass: UnitClassId;
  minLevel: 5 | 15 | 30;
  sealItemId: 'master_seal' | 'royal_crest' | 'mythic_crown';
  statBonuses: Partial<UnitStats>;
  unlockSkill: SkillId;
  allowedWeaponTypes: WeaponType[];
  description: string;
}

export interface Unit {
  id: string;
  templateId: string;
  name: string;
  title?: string;
  equippedTitleId?: string;
  classId: UnitClassId;
  className: string;
  tier: UnitTier;
  promoted?: boolean;
  faction: Faction;
  moveType: MoveType;
  level: number;
  exp: number;
  hp: number;
  sp: number;
  maxSp: number;
  stats: UnitStats;
  growths: StatGrowths;
  weapon: Weapon;
  weaponForge?: WeaponForgeState;
  equipment?: Partial<Record<ArmorSlot, EquipmentInstance>>;
  inventory: Weapon[];
  carriedItems?: string[]; // Personal carried items/gems (count toward per-unit carry limit)
  carriedArmorUids?: string[]; // Personal carried unequipped armor uids (count toward per-unit carry limit)
  skills: SkillId[];
  potions: number;
  x: number;
  y: number;
  acted: boolean;
  isLord?: boolean;
  isBoss?: boolean;
  isElite?: boolean;
  aiPolicy: AIPolicy;
  portraitKey?: string;
  accentColor: string;
}

export interface TileCoord {
  x: number;
  y: number;
}

export interface TerrainInfo {
  type: TerrainType;
  name: string;
  defBonus: number;
  avoBonus: number;
  healPercent: number;
  moveCost: Record<MoveType, number>; // 99 = impassable
  shopKind?: 'IN_MAP_ARMORY' | 'IN_MAP_VENDOR';
}

export interface DialogueLine {
  speaker: string;
  role: string;
  portraitKey: string;
  side: 'left' | 'right';
  text: string;
  speakerClassId?: UnitClassId;
  speakerAccent?: string;
  speakerFaction?: Faction;
}

export interface ActDefinition {
  actNumber: number; // 1..10
  roman: string;
  title: string;
  regionName: string;
  biome: BiomeId;
  weather: WeatherType;
  synopsis: string;
  antagonist: string;
  recruitedHeroId?: string;
}

export interface CampaignMapMeta {
  id: number; // 1..120
  actNumber: number; // 1..10
  chapterInAct: number; // 1..12
  chapterCode: string; // e.g. "I-1", "IV-7"
  title: string;
  subtitle: string;
  storyArcBeat: string; // Role of this battle inside the Act's continuous plot
  previousMapLink: string; // Causal link from Map N-1
  nextMapHook: string; // Causal bridge leading directly into Map N+1
  biome: BiomeId;
  weather: WeatherType;
  layout: LayoutTemplate;
  mapWidth: number;
  mapHeight: number;
  maxDeploySlots: number;
  recruitedHeroIds?: string[];
  objective: MapObjective;
  surviveTurns?: number;
  recommendedLevel: number;
  bossName: string;
  bossTitle: string;
  bossClass: UnitClassId;
  bossWeaponId: string;
  introDialogue: DialogueLine[];
  outroDialogue: DialogueLine[];
}

export interface GeneratedMapData {
  meta: CampaignMapMeta;
  width: number;
  height: number;
  grid: TerrainType[][];
  playerSpawns: TileCoord[];
  throneCoord: TileCoord;
  armoryShopCoord: TileCoord;
  vendorShopCoord: TileCoord;
  enemies: Unit[];
}

export interface CombatForecast {
  attackerId: string;
  defenderId: string;
  activeSkillId?: SkillId | null;
  attackerDamage: number;
  attackerHit: number;
  attackerCrit: number;
  attackerDoubles: boolean;
  attackerStrikeCount: number;
  attackerAdvantage: -1 | 0 | 1;
  defenderCanCounter: boolean;
  defenderFirst?: boolean;
  defenderDamage: number;
  defenderHit: number;
  defenderCrit: number;
  defenderDoubles: boolean;
  defenderStrikeCount: number;
  defenderAdvantage: -1 | 0 | 1;
  effectiveAttacker: boolean;
  effectiveDefender: boolean;
  effectiveLabelAttacker?: string;
  attackerNotes: string[];
  defenderNotes: string[];
}

export interface CombatStrike {
  actor: 'ATTACKER' | 'DEFENDER';
  hit: boolean;
  crit: boolean;
  damage: number;
  healedAmount?: number;
  skillTriggered?: SkillId;
  targetHpAfter: number;
  actorHpAfter: number;
}

export interface LevelUpGain {
  unitId: string;
  unitName: string;
  newLevel: number;
  gains: Partial<Record<keyof StatGrowths, number>>;
  unlockedSkill?: SkillId;
  readyToPromote?: boolean;
}

export interface PromotionResult {
  unitId: string;
  unitName: string;
  fromClassName: string;
  toClassName: string;
  toClassId: UnitClassId;
  newTier: UnitTier;
  statBonuses: Partial<UnitStats>;
  unlockedSkill: SkillId;
  sealConsumedId: SealItemId;
}

export interface CombatResolution {
  forecast: CombatForecast;
  strikes: CombatStrike[];
  attackerStartHp: number;
  defenderStartHp: number;
  attackerEndHp: number;
  defenderEndHp: number;
  attackerDied: boolean;
  defenderDied: boolean;
  expGained: number;
  levelUp: LevelUpGain | null;
}

export type BattleLootDropKind = 'WEAPON' | 'ARMOR' | 'ITEM' | 'GEM';

export interface BattleLootDrop {
  kind: BattleLootDropKind;
  id: string;
  name: string;
  categoryLabel: string;
  accentColor: string;
  dropChance: number;
  sentToConvoy: boolean;
  recipientUnitId: string;
  recipientName: string;
  createdArmor?: EquipmentInstance;
}

export interface BattleOutcome {
  status: 'ONGOING' | 'VICTORY' | 'DEFEAT';
  reason: string;
}

export interface GameSettings {
  muted: boolean;
  combatAnimations: boolean;
  fastMode: boolean;
  casualMode: boolean;
}

export interface SavedHeroProgress {
  templateId: string;
  classId?: UnitClassId;
  tier?: UnitTier;
  promoted?: boolean;
  equippedTitleId?: string;
  level: number;
  exp: number;
  stats: UnitStats;
  weaponId: string;
  equippedArmorUids?: Partial<Record<ArmorSlot, string>>;
  inventoryIds?: string[];
  carriedItemIds?: string[];
  carriedArmorUids?: string[];
  skills?: SkillId[];
  potions: number;
}

export interface CampaignSaveData {
  version: number;
  highestReachedMap: number; // 1..120
  clearedMaps: number[];
  currentMapId: number;
  totalTurns: number;
  totalDefeatedEnemies: number;
  totalCrits: number;
  totalPromotions: number;
  totalShopPurchases: number;
  totalBossKills: number;
  weatherBattlesWon: number;
  unlockedTitleIds: string[];
  commanderTitleId: string;
  gold: number; // Quân Phí Hoàng Kim (Vàng)
  masterSeals: number; // Legacy synced mirror of itemBag.master_seal
  itemBag: Record<string, number>; // Shared consumables, stat boosters, promotion seals, EXP manuals, forge mats, gems, treasure
  convoyWeaponIds: string[]; // Shared Army Armory (Kho Vũ Khí & Pháp Điển)
  equipmentBag?: EquipmentInstance[]; // Owned Armor Instances (Mũ, Áo Giáp, Giáp Tay, Giáp Chân, Giày)
  weaponForges?: Record<string, WeaponForgeState>; // Per-weapon Forge upgrades (Tôi luyện, Lên cấp, Khảm ngọc, Hợp nhất)
  preferredSquadIds?: string[]; // Player's preferred deployment templateIds
  preferredFormation?: FormationPresetId; // Player's last-used formation preset
  roster: SavedHeroProgress[];
  settings: GameSettings;
  updatedAt: number;
}
