import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CampHubModal, type CampStationTab } from './components/CampHubModal';
import { CampaignAtlasModal } from './components/CampaignAtlasModal';
import { CombatCutscene } from './components/CombatCutscene';
import { DeploymentPrepBar } from './components/DeploymentPrepBar';
import { OutcomeModal, PauseModal } from './components/GameModals';
import { LevelUpToast } from './components/LevelUpToast';
import { RosterArmoryModal, type RosterModalTab } from './components/RosterArmoryModal';
import { ShopModal } from './components/ShopModal';
import { StoryDialogue } from './components/StoryDialogue';
import { TacticalHUD, type ActionMenuOption } from './components/TacticalHUD';
import { TitleScreen } from './components/TitleScreen';
import { TradeModal } from './components/TradeModal';
import { pickBattleQuote, type CombatSpeechBubble } from './game/battleQuotes';
import { CAMP_SPARRING_COST_GOLD, CAMP_SPARRING_EXP_GAIN } from './game/campData';
import { getCampaignMapById } from './game/campaignData';
import {
  ARMOR_SLOTS,
  ARMOR_TEMPLATES,
  buildPartyUnitsForAct,
  buildUnlockedRosterUnits,
  canUnitStandOnTerrain,
  createEquipmentInstance,
  evaluateUnlockedTitles,
  fuseArmorInstances,
  fuseWeaponForge,
  GEMS,
  getItemSellPrice,
  getUnitTitleBonuses,
  getWeaponSellPrice,
  getWeatherForTurn,
  isNavalPassableTerrain,
  ITEMS,
  levelUpArmorInstance,
  levelUpWeaponForge,
  SKILLS,
  socketGemIntoArmor,
  socketGemIntoWeapon,
  temperArmorInstance,
  temperWeaponForge,
  TERRAIN_DATA,
  TITLES,
  unsocketGemFromArmor,
  unsocketGemFromWeapon,
  WEAPONS,
} from './game/data';
import {
  applyExpAndLevelUp,
  applyItemToUnit,
  calculateCombatForecast,
  canPromoteUnit,
  canUnitAttackAtDistance,
  canUnitEquipWeapon,
  canUnitHealAtDistance,
  canUnitTakeEquippedArmorFromOwner,
  canUnitUseSkill,
  checkBattleOutcome,
  computeEnemyDangerZone,
  decideEnemyAction,
  equipPersonalWeapon,
  findAvailableSealForUnit,
  findPath,
  getActiveSkills,
  getAdjacentTradePartners,
  getAttackableTilesFromPos,
  getEffectiveUnitStats,
  getHealAmount,
  getReachableTiles,
  getSanctuaryHealTargets,
  getTotalActionRangeTiles,
  getUnitCarriedItemCounts,
  hasSkill,
  isUnitCarryFull,
  manhattan,
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
} from './game/engine';
import {
  computeFormationPlacement,
  generateMap,
  swapOrMoveDeploymentUnit,
} from './game/mapGenerator';
import {
  TacticalBoardRenderer,
  type FloatingText,
  type MovingSpriteState,
  type TacticalRenderState,
} from './game/pixelRenderer';
import { soundEngine } from './game/sound';
import {
  createFreshSave,
  loadCampaignSave,
  mergeUnitsIntoSavedRoster,
  saveCampaignData,
} from './game/storage';
import type {
  ArmorSlot,
  ArmorTemplate,
  BattleLootDrop,
  CampaignSaveData,
  CombatForecast,
  CombatResolution,
  EquipmentInstance,
  FormationPresetId,
  GameItem,
  GameScreenState,
  GameSettings,
  GeneratedMapData,
  LevelUpGain,
  PromotionResult,
  ShopKind,
  SkillId,
  TileCoord,
  TitleDef,
  Unit,
  UnitClassId,
  Weapon,
  WeaponForgeState,
  WeatherType,
} from './game/types';

type TacticalSubMode =
  | 'DEPLOYMENT'
  | 'IDLE'
  | 'UNIT_SELECTED'
  | 'ANIMATING_MOVE'
  | 'ACTION_MENU'
  | 'TARGET_ATTACK'
  | 'TARGET_HEAL'
  | 'FORECAST';

interface PendingCombat {
  attacker: Unit;
  defender: Unit;
  resolution: CombatResolution;
  onComplete: () => void;
}

interface OutcomeSnapshot {
  outcome: 'VICTORY' | 'DEFEAT';
  reason: string;
  turnsTaken: number;
  enemiesDefeated: number;
  alliesRemaining: number;
  totalAllies: number;
  clearedMapsCount: number;
  goldEarned?: number;
  rewardNotes?: string[];
}

function getAutostartFlag(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('autostart') === '1';
}

const VALID_WEATHERS = new Set<WeatherType>([
  'NONE',
  'SUNLIGHT',
  'RAIN',
  'STORM',
  'SNOW',
  'MIST',
  'SAND',
  'EMBERS',
  'SPARKS',
  'LEAVES',
]);

function getWeatherOverride(): WeatherType | null {
  if (typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get('weather')?.toUpperCase() as
    | WeatherType
    | undefined;
  return raw && VALID_WEATHERS.has(raw) ? raw : null;
}

export default function App() {
  const [saveData, setSaveData] = useState<CampaignSaveData>(() => {
    const loaded = loadCampaignSave();
    const initial = loaded ?? createFreshSave();
    soundEngine.setMuted(initial.settings.muted);
    return initial;
  });

  const [screen, setScreen] = useState<GameScreenState>(() =>
    getAutostartFlag() ? 'playing' : 'title'
  );
  const [atlasOpen, setAtlasOpen] = useState(false);
  const [campOpen, setCampOpen] = useState(false);
  const [campInitialTab, setCampInitialTab] = useState<CampStationTab>('BARRACKS');
  const [rosterOpen, setRosterOpen] = useState(false);
  const [rosterFocusUnitId, setRosterFocusUnitId] = useState<string | null>(null);
  const [rosterInitialTab, setRosterInitialTab] = useState<RosterModalTab>('FORGE');
  const [activeShopKind, setActiveShopKind] = useState<ShopKind | null>(null);
  const [tradeModalState, setTradeModalState] = useState<{
    leftUnitId: string;
    rightUnitId: string;
  } | null>(null);

  // Active battle state
  const [mapData, setMapData] = useState<GeneratedMapData>(() => generateMap(1));
  const [units, setUnits] = useState<Unit[]>([]);
  const [unlockedAllies, setUnlockedAllies] = useState<Unit[]>([]);
  const [activeFormation, setActiveFormation] = useState<FormationPresetId>(
    () => saveData.preferredFormation ?? 'BALANCED'
  );
  const [swapSourceCoord, setSwapSourceCoord] = useState<TileCoord | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState<'PLAYER' | 'ENEMY'>('PLAYER');
  const [cursor, setCursor] = useState<TileCoord>({ x: 1, y: 4 });
  const [subMode, setSubMode] = useState<TacticalSubMode>('DEPLOYMENT');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedActiveSkillId, setSelectedActiveSkillId] = useState<SkillId | null>(null);
  const [preMoveOrigin, setPreMoveOrigin] = useState<TileCoord | null>(null);
  const [showDangerZone, setShowDangerZone] = useState(false);

  const [dialogueState, setDialogueState] = useState<{
    mode: 'INTRO' | 'OUTRO';
    onDone: () => void;
  } | null>(null);

  const [forecastTargetId, setForecastTargetId] = useState<string | null>(null);
  const [pendingCombat, setPendingCombat] = useState<PendingCombat | null>(null);
  const [phaseBanner, setPhaseBanner] = useState<string | null>(null);
  const [levelUpToast, setLevelUpToast] = useState<LevelUpGain | null>(null);
  const [promotionToast, setPromotionToast] = useState<PromotionResult | null>(null);
  const [titleUnlockedToast, setTitleUnlockedToast] = useState<TitleDef | null>(null);
  const [weatherShiftToast, setWeatherShiftToast] = useState<WeatherType | null>(null);
  const [lootDropToast, setLootDropToast] = useState<BattleLootDrop | null>(null);
  const [outcomeSnapshot, setOutcomeSnapshot] = useState<OutcomeSnapshot | null>(null);
  const [enemiesDefeatedThisMap, setEnemiesDefeatedThisMap] = useState(0);
  const [initialAlliesCount, setInitialAlliesCount] = useState(4);

  // Refs for isolated 60fps canvas renderer & async enemy turn orchestration
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const boardRendererRef = useRef<TacticalBoardRenderer>(new TacticalBoardRenderer());
  const movingSpriteRef = useRef<MovingSpriteState | null>(null);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const combatBubblesRef = useRef<CombatSpeechBubble[]>([]);
  const enemyTurnAbortRef = useRef(0);
  const unitsRef = useRef<Unit[]>(units);
  const unlockedAlliesRef = useRef<Unit[]>(unlockedAllies);
  const mapDataRef = useRef<GeneratedMapData>(mapData);
  const turnRef = useRef(turn);
  const saveDataRef = useRef(saveData);
  const enemiesDefeatedRef = useRef(enemiesDefeatedThisMap);
  const levelUpTimerRef = useRef<number | null>(null);
  const lootDropTimerRef = useRef<number | null>(null);
  const dragPanRef = useRef<{
    down: boolean;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    moved: boolean;
  }>({ down: false, startX: 0, startY: 0, lastX: 0, lastY: 0, moved: false });

  unitsRef.current = units;
  unlockedAlliesRef.current = unlockedAllies;
  mapDataRef.current = mapData;
  turnRef.current = turn;
  saveDataRef.current = saveData;
  enemiesDefeatedRef.current = enemiesDefeatedThisMap;

  const activeWeather = useMemo<WeatherType>(
    () => getWeatherOverride() ?? getWeatherForTurn(mapData.meta.weather, turn),
    [mapData.meta.weather, turn]
  );
  const commanderTitleId = saveData.commanderTitleId || 'vanguard_valoria';
  const isOutOfBattle = screen !== 'playing' && screen !== 'paused';
  const isOutOfBattleRef = useRef(isOutOfBattle);
  isOutOfBattleRef.current = isOutOfBattle;

  const isFreeLogistics = isOutOfBattle || subMode === 'DEPLOYMENT';
  const isFreeLogisticsRef = useRef(isFreeLogistics);
  isFreeLogisticsRef.current = isFreeLogistics;

  // Sync document.body.dataset.state strictly to game state machine
  useEffect(() => {
    document.body.dataset.state = screen;
  }, [screen]);

  const spawnFloatingText = useCallback((text: string, x: number, y: number, color: string) => {
    floatingTextsRef.current.push({ text, x, y, color, age: 0, duration: 1.05 });
  }, []);

  const spawnCombatBubble = useCallback((unit: Unit, liveHp: number, isCrit = false) => {
    const maxHp = Math.max(unit.stats.maxHp, getEffectiveUnitStats(unit).maxHp);
    const quote = pickBattleQuote(unit, liveHp, maxHp, { isCrit });
    const existing = combatBubblesRef.current;
    const filtered = existing.filter((b) => b.unitId !== unit.id);
    filtered.push({
      id: `${unit.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      unitId: unit.id,
      x: unit.x,
      y: unit.y,
      text: quote.text,
      faction: unit.faction,
      hpBand: quote.hpBand,
      hpPercent: quote.hpPercent,
      isCrit: quote.isCrit,
      age: 0,
      duration: 2.4,
    });
    combatBubblesRef.current = filtered;
  }, []);

  const flashPhaseBanner = useCallback((text: string, isPlayer: boolean) => {
    setPhaseBanner(text);
    soundEngine.phaseBanner(isPlayer);
    window.setTimeout(() => {
      setPhaseBanner((cur) => (cur === text ? null : cur));
    }, 1050);
  }, []);

  const showLevelUp = useCallback((lvl: LevelUpGain) => {
    if (levelUpTimerRef.current !== null) {
      window.clearTimeout(levelUpTimerRef.current);
      levelUpTimerRef.current = null;
    }
    setLevelUpToast(lvl);
    soundEngine.levelUp();
    levelUpTimerRef.current = window.setTimeout(() => {
      levelUpTimerRef.current = null;
      setLevelUpToast((cur) =>
        cur?.unitId === lvl.unitId && cur.newLevel === lvl.newLevel ? null : cur
      );
    }, 3400);
  }, []);

  useEffect(() => {
    return () => {
      if (levelUpTimerRef.current !== null) {
        window.clearTimeout(levelUpTimerRef.current);
      }
      if (lootDropTimerRef.current !== null) {
        window.clearTimeout(lootDropTimerRef.current);
      }
    };
  }, []);

  const showLootDropToast = useCallback((drop: BattleLootDrop) => {
    if (lootDropTimerRef.current !== null) {
      window.clearTimeout(lootDropTimerRef.current);
    }
    setLootDropToast(drop);
    soundEngine.levelUp();
    lootDropTimerRef.current = window.setTimeout(() => {
      lootDropTimerRef.current = null;
      setLootDropToast((cur) =>
        cur?.id === drop.id && cur.recipientUnitId === drop.recipientUnitId ? null : cur
      );
    }, 4300);
  }, []);

  const showPromotionToast = useCallback((promo: PromotionResult) => {
    setPromotionToast(promo);
    soundEngine.levelUp();
    window.setTimeout(() => {
      setPromotionToast((cur) => (cur?.unitId === promo.unitId ? null : cur));
    }, 3400);
  }, []);

  const showTitleUnlocked = useCallback((title: TitleDef) => {
    setTitleUnlockedToast(title);
    soundEngine.levelUp();
    window.setTimeout(() => {
      setTitleUnlockedToast((cur) => (cur?.id === title.id ? null : cur));
    }, 3600);
  }, []);

  const showWeatherShift = useCallback((w: WeatherType) => {
    setWeatherShiftToast(w);
    window.setTimeout(() => {
      setWeatherShiftToast((cur) => (cur === w ? null : cur));
    }, 3200);
  }, []);

  // Persists save data AND evaluates Title achievements automatically
  const commitSaveWithTitles = useCallback(
    (candidateSave: CampaignSaveData): CampaignSaveData => {
      const { allUnlocked, newlyUnlocked } = evaluateUnlockedTitles(candidateSave);
      const finalized: CampaignSaveData = {
        ...candidateSave,
        unlockedTitleIds: allUnlocked,
      };
      saveDataRef.current = finalized;
      saveCampaignData(finalized);
      setSaveData(finalized);
      if (newlyUnlocked.length > 0) {
        showTitleUnlocked(newlyUnlocked[0]);
      }
      return finalized;
    },
    [showTitleUnlocked]
  );

  // Load and initialize a specific Map (1..120) with interactive Pre-Battle Deployment
  const startBattleMap = useCallback(
    (mapId: number, activeSave: CampaignSaveData, skipIntroDialogue = false) => {
      enemyTurnAbortRef.current += 1;
      const generated = generateMap(mapId);
      const preset: FormationPresetId = activeSave.preferredFormation ?? 'BALANCED';

      const unlockedPoolRaw = buildUnlockedRosterUnits(
        generated.meta.actNumber,
        activeSave.roster,
        generated.meta.recommendedLevel,
        activeSave.equipmentBag ?? [],
        activeSave.weaponForges ?? {}
      );
      const unlockedPool = unlockedPoolRaw.map((u) => {
        const effMaxHp = getEffectiveUnitStats(u, activeSave.commanderTitleId).maxHp;
        return {
          ...u,
          acted: false,
          hp: effMaxHp,
          sp: Math.min(u.maxSp, Math.max(60, u.sp)),
        };
      });

      const navalSpawnCount = generated.playerSpawns.filter((s) =>
        isNavalPassableTerrain(generated.grid[s.y]?.[s.x] ?? 'PLAIN')
      ).length;

      const party = buildPartyUnitsForAct(
        generated.meta.actNumber,
        activeSave.roster,
        generated.meta.recommendedLevel,
        activeSave.equipmentBag ?? [],
        activeSave.weaponForges ?? {},
        generated.meta.maxDeploySlots,
        activeSave.preferredSquadIds,
        navalSpawnCount > 0
      );

      const hydratedParty = party.map((u) => {
        const effMaxHp = getEffectiveUnitStats(u, activeSave.commanderTitleId).maxHp;
        return {
          ...u,
          acted: false,
          hp: effMaxHp,
          sp: Math.min(u.maxSp, Math.max(60, u.sp)),
        };
      });

      // Arrange party onto numbered deployment slots along the map's AttackAxis toward Throne (strictly water-only for NAVAL)
      const deployedParty = computeFormationPlacement(
        hydratedParty,
        generated.playerSpawns,
        preset,
        generated.throneCoord,
        generated.grid
      );

      const allUnits = [...deployedParty, ...generated.enemies];
      const nextSave: CampaignSaveData = {
        ...activeSave,
        currentMapId: mapId,
      };
      saveDataRef.current = nextSave;
      saveCampaignData(nextSave);
      setSaveData(nextSave);

      setMapData(generated);
      setUnlockedAllies(unlockedPool);
      unlockedAlliesRef.current = unlockedPool;
      setUnits(allUnits);
      unitsRef.current = allUnits;
      setActiveFormation(preset);
      setSwapSourceCoord(null);
      setInitialAlliesCount(deployedParty.length);
      setEnemiesDefeatedThisMap(0);
      setTurn(1);
      setPhase('PLAYER');
      setSubMode('DEPLOYMENT');
      setSelectedUnitId(null);
      setSelectedActiveSkillId(null);
      setPreMoveOrigin(null);
      setForecastTargetId(null);
      setPendingCombat(null);
      setOutcomeSnapshot(null);
      setLootDropToast(null);
      setAtlasOpen(false);
      setCampOpen(false);
      setTradeModalState(null);
      setRosterOpen(false);
      setRosterFocusUnitId(null);
      setActiveShopKind(null);
      movingSpriteRef.current = null;
      floatingTextsRef.current = [];
      combatBubblesRef.current = [];
      boardRendererRef.current.clearEffects();
      boardRendererRef.current.resetCamera();

      const leadUnit = deployedParty.find((u) => u.isLord) ?? deployedParty[0];
      const startCursor = leadUnit
        ? { x: leadUnit.x, y: leadUnit.y }
        : generated.playerSpawns[0];
      setCursor(startCursor);

      // Default wide tactical maps (>= 20 columns) to 170% close-up tactical zoom centered on vanguard
      // so 192x192 unit models appear large and clear immediately (with instant 100% full-panorama reset via HUD/wheel)
      const useCloseUpZoom = generated.width >= 20;
      const initialZoom = useCloseUpZoom
        ? boardRendererRef.current.setZoomLevel(1.7)
        : boardRendererRef.current.setZoomLevel(1.35);
      setZoomLevel(initialZoom);
      window.requestAnimationFrame(() => {
        boardRendererRef.current.centerCameraOnTile(startCursor);
      });

      // Immediately enter 'playing' state (t = 0ms)
      document.body.dataset.state = 'playing';
      setScreen('playing');

      if (skipIntroDialogue) {
        setDialogueState(null);
      } else {
        setDialogueState({
          mode: 'INTRO',
          onDone: () => {
            setDialogueState(null);
          },
        });
      }
    },
    []
  );

  // Open Doanh Trại Liên Quân / Kho Quân Đoàn out of battle with all unlocked heroes hydrated
  const handleOpenCampHub = useCallback((initialTab: CampStationTab = 'BARRACKS') => {
    soundEngine.select();
    enemyTurnAbortRef.current += 1;
    setDialogueState(null);
    setPendingCombat(null);
    setOutcomeSnapshot(null);
    setTradeModalState(null);
    setRosterOpen(false);
    setActiveShopKind(null);

    const curSave = saveDataRef.current;
    const nextMapId = Math.max(
      1,
      Math.min(200, curSave.currentMapId || curSave.highestReachedMap || 1)
    );
    const campMeta = getCampaignMapById(nextMapId);
    const rawPool = buildUnlockedRosterUnits(
      campMeta.actNumber,
      curSave.roster,
      campMeta.recommendedLevel,
      curSave.equipmentBag ?? [],
      curSave.weaponForges ?? {}
    );
    const hydratedPool = rawPool.map((u) => {
      const effMax = getEffectiveUnitStats(u, curSave.commanderTitleId).maxHp;
      return {
        ...u,
        acted: false,
        hp: effMax,
        sp: 100,
      };
    });
    unlockedAlliesRef.current = hydratedPool;
    setUnlockedAllies(hydratedPool);
    unitsRef.current = [];
    setUnits([]);
    document.body.dataset.state = 'title';
    setScreen('title');
    setCampInitialTab(initialTab);
    setCampOpen(true);
  }, []);

  const handleZoomChange = useCallback((delta: number) => {
    const next = boardRendererRef.current.adjustZoom(delta);
    setZoomLevel(next);
  }, []);

  const handleZoomReset = useCallback(() => {
    boardRendererRef.current.resetCamera();
    setZoomLevel(boardRendererRef.current.getZoomLevel());
  }, []);

  const handleSelectFormation = useCallback((preset: FormationPresetId) => {
    soundEngine.select();
    setActiveFormation(preset);
    setSwapSourceCoord(null);
    const currentMap = mapDataRef.current;
    const allies = unitsRef.current.filter((u) => u.faction === 'PLAYER' && u.hp > 0);
    const enemies = unitsRef.current.filter((u) => u.faction === 'ENEMY');
    const placed = computeFormationPlacement(
      allies,
      currentMap.playerSpawns,
      preset,
      currentMap.throneCoord,
      currentMap.grid
    );
    const nextUnits = [...placed, ...enemies];
    unitsRef.current = nextUnits;
    setUnits(nextUnits);
    const lord = placed.find((u) => u.isLord) ?? placed[0];
    if (lord) setCursor({ x: lord.x, y: lord.y });

    const nextSave: CampaignSaveData = {
      ...saveDataRef.current,
      preferredFormation: preset,
    };
    saveDataRef.current = nextSave;
    saveCampaignData(nextSave);
    setSaveData(nextSave);
  }, []);

  const handleToggleHeroDeploy = useCallback(
    (templateId: string) => {
      if (subMode !== 'DEPLOYMENT') return;
      const currentMap = mapDataRef.current;
      const currentAllies = unitsRef.current.filter((u) => u.faction === 'PLAYER' && u.hp > 0);
      const enemies = unitsRef.current.filter((u) => u.faction === 'ENEMY');
      const existing = currentAllies.find((u) => u.templateId === templateId);

      let nextAllies: Unit[];
      if (existing) {
        if (existing.isLord || currentAllies.length <= 1) return;
        soundEngine.cancel();
        nextAllies = currentAllies.filter((u) => u.templateId !== templateId);
      } else {
        if (currentAllies.length >= currentMap.meta.maxDeploySlots) return;
        const candidate = unlockedAlliesRef.current.find((u) => u.templateId === templateId);
        if (!candidate) return;
        if (candidate.moveType === 'NAVAL') {
          const navalBerthCap = currentMap.playerSpawns.filter((s) =>
            isNavalPassableTerrain(currentMap.grid[s.y]?.[s.x] ?? 'PLAIN')
          ).length;
          const deployedNavalCount = currentAllies.filter((u) => u.moveType === 'NAVAL').length;
          if (deployedNavalCount >= navalBerthCap) {
            soundEngine.cancel();
            const msg =
              navalBerthCap === 0
                ? 'Chiến trường nội địa không có vùng nước để triển khai tàu chiến!'
                : 'Đã kín bến neo đậu tàu chiến trên bản đồ này!';
            setPhaseBanner(msg);
            window.setTimeout(() => {
              setPhaseBanner((cur) => (cur === msg ? null : cur));
            }, 2200);
            return;
          }
        }
        soundEngine.select();
        const effMaxHp = getEffectiveUnitStats(candidate, saveDataRef.current.commanderTitleId).maxHp;
        nextAllies = [
          ...currentAllies,
          {
            ...candidate,
            acted: false,
            hp: effMaxHp,
            sp: Math.min(candidate.maxSp, Math.max(60, candidate.sp)),
          },
        ];
      }

      const placed = computeFormationPlacement(
        nextAllies,
        currentMap.playerSpawns,
        activeFormation,
        currentMap.throneCoord,
        currentMap.grid
      );
      const nextUnits = [...placed, ...enemies];
      unitsRef.current = nextUnits;
      setUnits(nextUnits);
      setInitialAlliesCount(placed.length);
      setSwapSourceCoord(null);

      const nextSquadIds = placed.map((u) => u.templateId);
      const nextSave: CampaignSaveData = {
        ...saveDataRef.current,
        preferredSquadIds: nextSquadIds,
      };
      saveDataRef.current = nextSave;
      saveCampaignData(nextSave);
      setSaveData(nextSave);
    },
    [subMode, activeFormation]
  );

  const handleConfirmDeployment = useCallback(() => {
    if (subMode !== 'DEPLOYMENT') return;
    soundEngine.select();
    setSwapSourceCoord(null);
    const deployedAllies = unitsRef.current.filter((u) => u.faction === 'PLAYER' && u.hp > 0);
    setInitialAlliesCount(deployedAllies.length);
    setSubMode('IDLE');
    const lord = deployedAllies.find((u) => u.isLord) ?? deployedAllies[0];
    if (lord) {
      setCursor({ x: lord.x, y: lord.y });
    }
    flashPhaseBanner('LƯỢT PHE TA', true);
  }, [subMode, flashPhaseBanner]);

  // Support ?autostart=1 directly into Map 1 live tactical battlefield
  const autostartRanRef = useRef(false);
  useEffect(() => {
    if (getAutostartFlag() && !autostartRanRef.current) {
      autostartRanRef.current = true;
      startBattleMap(saveData.currentMapId || 1, saveData, true);
    }
  }, [saveData, startBattleMap]);

  // Derived unit & tactical range computations
  const selectedUnit = useMemo(
    () => units.find((u) => u.id === selectedUnitId && u.hp > 0) ?? null,
    [units, selectedUnitId]
  );

  const reachableTiles = useMemo(() => {
    if (subMode !== 'UNIT_SELECTED' || !selectedUnit) return new Map<string, number>();
    return getReachableTiles(selectedUnit, mapData.grid, units);
  }, [subMode, selectedUnit, mapData.grid, units]);

  const actionRangeOverlay = useMemo<{ tiles: Set<string>; kind: 'ATTACK' | 'HEAL' }>(() => {
    if (!selectedUnit) return { tiles: new Set<string>(), kind: 'ATTACK' };
    const isStaff = selectedUnit.weapon.type === 'STAFF';
    if (subMode === 'UNIT_SELECTED') {
      return {
        tiles: getTotalActionRangeTiles(selectedUnit, reachableTiles, mapData.width, mapData.height),
        kind: isStaff ? 'HEAL' : 'ATTACK',
      };
    }
    if (subMode === 'TARGET_ATTACK' || subMode === 'TARGET_HEAL' || subMode === 'FORECAST') {
      const coords = getAttackableTilesFromPos(
        { x: selectedUnit.x, y: selectedUnit.y },
        selectedUnit,
        mapData.width,
        mapData.height,
        selectedActiveSkillId
      );
      return {
        tiles: new Set(coords.map((c) => `${c.x},${c.y}`)),
        kind: isStaff ? 'HEAL' : 'ATTACK',
      };
    }
    return { tiles: new Set<string>(), kind: 'ATTACK' };
  }, [selectedUnit, subMode, reachableTiles, mapData.width, mapData.height, selectedActiveSkillId]);

  const targetableUnits = useMemo(() => {
    if (!selectedUnit) return [];
    if (subMode === 'TARGET_ATTACK' || subMode === 'ACTION_MENU' || subMode === 'FORECAST') {
      if (selectedUnit.weapon.type === 'STAFF') return [];
      return units.filter(
        (u) =>
          u.faction === 'ENEMY' &&
          u.hp > 0 &&
          canUnitAttackAtDistance(selectedUnit, manhattan(selectedUnit, u), selectedActiveSkillId)
      );
    }
    if (subMode === 'TARGET_HEAL') {
      return units.filter(
        (u) =>
          u.faction === 'PLAYER' &&
          u.hp > 0 &&
          u.id !== selectedUnit.id &&
          u.hp < u.stats.maxHp &&
          canUnitHealAtDistance(selectedUnit, manhattan(selectedUnit, u))
      );
    }
    return [];
  }, [selectedUnit, subMode, units, selectedActiveSkillId]);

  const targetableUnitIds = useMemo(() => {
    if (subMode !== 'TARGET_ATTACK' && subMode !== 'TARGET_HEAL') return new Set<string>();
    return new Set(targetableUnits.map((u) => u.id));
  }, [subMode, targetableUnits]);

  const dangerZone = useMemo(
    () => (showDangerZone ? computeEnemyDangerZone(mapData.grid, units) : new Set<string>()),
    [showDangerZone, mapData.grid, units]
  );

  const previewPath = useMemo(() => {
    if (subMode !== 'UNIT_SELECTED' || !selectedUnit) return [];
    const key = `${cursor.x},${cursor.y}`;
    if (!reachableTiles.has(key)) return [];
    return findPath(selectedUnit, cursor, mapData.grid, units);
  }, [subMode, selectedUnit, cursor, reachableTiles, mapData.grid, units]);

  const inspectedUnit = useMemo(() => {
    const hovered = units.find((u) => u.hp > 0 && u.x === cursor.x && u.y === cursor.y);
    return hovered ?? selectedUnit ?? null;
  }, [units, cursor, selectedUnit]);

  const hoveredTerrain =
    mapData.grid[cursor.y]?.[cursor.x] ?? 'PLAIN';

  const forecastData = useMemo<{
    attacker: Unit;
    defender: Unit;
    forecast: CombatForecast;
  } | null>(() => {
    if (subMode !== 'FORECAST' || !selectedUnit || !forecastTargetId) return null;
    const defender = units.find((u) => u.id === forecastTargetId && u.hp > 0);
    if (!defender) return null;
    const dist = manhattan(selectedUnit, defender);
    const forecast = calculateCombatForecast(
      selectedUnit,
      defender,
      mapData.grid[selectedUnit.y][selectedUnit.x],
      mapData.grid[defender.y][defender.x],
      dist,
      selectedActiveSkillId,
      activeWeather,
      commanderTitleId
    );
    return { attacker: selectedUnit, defender, forecast };
  }, [
    subMode,
    selectedUnit,
    forecastTargetId,
    units,
    mapData.grid,
    selectedActiveSkillId,
    activeWeather,
    commanderTitleId,
  ]);

  // Keep render state ref synced for isolated 60fps Canvas loop
  const renderStateRef = useRef<TacticalRenderState>({
    grid: mapData.grid,
    biome: mapData.meta.biome,
    weather: activeWeather,
    units,
    cursor,
    selectedUnitId,
    reachableTiles,
    actionRangeTiles: actionRangeOverlay.tiles,
    actionRangeKind: actionRangeOverlay.kind,
    targetableUnitIds,
    dangerZone,
    showDangerZone,
    previewPath,
    movingSprite: null,
    floatingTexts: floatingTextsRef.current,
    combatBubbles: combatBubblesRef.current,
    throneCoord: mapData.throneCoord,
    isDeployment: subMode === 'DEPLOYMENT',
    deploymentSlots: mapData.playerSpawns,
    swapSourceCoord,
  });

  renderStateRef.current = {
    grid: mapData.grid,
    biome: mapData.meta.biome,
    weather: activeWeather,
    units,
    cursor,
    selectedUnitId,
    reachableTiles,
    actionRangeTiles: actionRangeOverlay.tiles,
    actionRangeKind: actionRangeOverlay.kind,
    targetableUnitIds,
    dangerZone,
    showDangerZone,
    previewPath,
    movingSprite: movingSpriteRef.current,
    floatingTexts: floatingTextsRef.current,
    combatBubbles: combatBubblesRef.current,
    throneCoord: mapData.throneCoord,
    isDeployment: subMode === 'DEPLOYMENT',
    deploymentSlots: mapData.playerSpawns,
    swapSourceCoord,
  };

  const modalOpenRef = useRef(false);
  modalOpenRef.current = Boolean(
    rosterOpen || atlasOpen || campOpen || tradeModalState || activeShopKind || pendingCombat
  );

  // Mount Canvas 2D loop ONCE (decoupled from React renders)
  useEffect(() => {
    if (screen === 'title') return;
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = Math.max(320, Math.floor(rect.width));
      canvas.height = Math.max(240, Math.floor(rect.height));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let rafId = 0;
    let lastNow = performance.now();
    let lastRender = 0;

    const frame = (now: number) => {
      rafId = requestAnimationFrame(frame);
      if (modalOpenRef.current) {
        lastNow = now;
        return;
      }
      // Smooth 30fps cap keeps pixel animation crisp while keeping CPU/software Canvas2D responsive
      if (now - lastRender < 32) return;
      lastRender = now;

      const dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;
      const timeSec = now / 1000;

      // Update floating texts & tactical combat dialogue bubbles in-place
      const texts = floatingTextsRef.current;
      for (let i = texts.length - 1; i >= 0; i--) {
        texts[i].age += dt;
        if (texts[i].age >= texts[i].duration) {
          texts.splice(i, 1);
        }
      }

      const bubbles = combatBubblesRef.current;
      for (let i = bubbles.length - 1; i >= 0; i--) {
        bubbles[i].age += dt;
        if (bubbles[i].age >= bubbles[i].duration) {
          bubbles.splice(i, 1);
        }
      }

      const st = renderStateRef.current;
      st.movingSprite = movingSpriteRef.current;
      st.floatingTexts = texts;
      st.combatBubbles = bubbles;

      boardRendererRef.current.render(ctx, canvas.width, canvas.height, st, timeSec, dt);
    };

    rafId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [screen === 'title']);

  // Animate a unit walking smoothly along an A* path
  const animateUnitWalk = useCallback((unitId: string, path: TileCoord[]): Promise<void> => {
    if (path.length <= 1) return Promise.resolve();
    return new Promise((resolve) => {
      const tilesPerSec = saveDataRef.current.settings.fastMode ? 14 : 9;
      movingSpriteRef.current = { unitId, path, progress: 0 };
      let lastStepIdx = 0;
      let lastTime = performance.now();

      const tick = (now: number) => {
        const dt = Math.max(0, Math.min(0.05, (now - lastTime) / 1000));
        lastTime = now;
        const ms = movingSpriteRef.current;
        if (!ms || ms.unitId !== unitId) {
          resolve();
          return;
        }
        ms.progress += dt * tilesPerSec;
        const stepIdx = Math.floor(ms.progress);
        if (stepIdx > lastStepIdx) {
          lastStepIdx = stepIdx;
          soundEngine.step();
        }
        if (ms.progress >= path.length - 1) {
          movingSpriteRef.current = null;
          resolve();
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, []);

  // Evaluate Victory / Defeat and persist progress across 120 maps
  const evaluateAndHandleOutcome = useCallback(
    (latestUnits: Unit[], latestTurn: number, throneSeized = false): boolean => {
      const currentMap = mapDataRef.current;
      const result = checkBattleOutcome(latestUnits, currentMap.meta, latestTurn, throneSeized);
      if (result.status === 'ONGOING') return false;

      enemyTurnAbortRef.current += 1;
      const alivePlayers = latestUnits.filter((u) => u.faction === 'PLAYER' && u.hp > 0);
      const totalEnemies = currentMap.enemies.length;
      const remainingEnemies = latestUnits.filter((u) => u.faction === 'ENEMY' && u.hp > 0).length;
      const defeatedCount = Math.max(enemiesDefeatedRef.current, totalEnemies - remainingEnemies);

      if (result.status === 'VICTORY') {
        soundEngine.victory();
        let nextSave = mergeUnitsIntoSavedRoster(saveDataRef.current, latestUnits, {
          restockPotions: true,
        });
        const clearedSet = new Set(nextSave.clearedMaps);
        const isFirstClear = !clearedSet.has(currentMap.meta.id);
        clearedSet.add(currentMap.meta.id);
        const baseGoldReward = 600 + currentMap.meta.id * 18 + (currentMap.meta.chapterInAct === 12 ? 450 : 0);
        const cmdTitle = TITLES[nextSave.commanderTitleId || 'vanguard_valoria'];
        const goldBonusPct = cmdTitle?.combatBonuses?.goldBonusPercent ?? 0;
        const goldReward = Math.round(baseGoldReward * (1 + goldBonusPct / 100));
        const nextBag: Record<string, number> = { ...(nextSave.itemBag ?? {}) };
        const rewardNotes: string[] = [];

        if (isFirstClear) {
          if (currentMap.meta.id === 1 || currentMap.meta.id % 3 === 0) {
            nextBag.master_seal = (nextBag.master_seal ?? 0) + 1;
            rewardNotes.push('+1 Ấn Tiến Hóa (Bậc II)');
          }
          if (currentMap.meta.chapterInAct === 6 || currentMap.meta.chapterInAct === 12) {
            nextBag.royal_crest = (nextBag.royal_crest ?? 0) + 1;
            rewardNotes.push('+1 Vương Ấn Hoàng Gia (Bậc III)');
          }
          if (currentMap.meta.id >= 24 && currentMap.meta.chapterInAct === 12) {
            nextBag.mythic_crown = (nextBag.mythic_crown ?? 0) + 1;
            rewardNotes.push('+1 Vương Miện Thần Thoại (Bậc IV)');
          }
          if (currentMap.meta.id % 5 === 0) {
            nextBag.silver_bullion = (nextBag.silver_bullion ?? 0) + 1;
            rewardNotes.push('+1 Thỏi Bạc (Bán 1.500G)');
          }
        }

        const winWeather = getWeatherForTurn(currentMap.meta.weather, latestTurn);
        const isHarshWeather =
          winWeather === 'RAIN' ||
          winWeather === 'STORM' ||
          winWeather === 'SNOW' ||
          winWeather === 'SAND' ||
          winWeather === 'MIST' ||
          winWeather === 'EMBERS' ||
          winWeather === 'SPARKS';

        const nextHighest = Math.min(200, Math.max(nextSave.highestReachedMap, currentMap.meta.id + 1));
        nextSave = commitSaveWithTitles({
          ...nextSave,
          highestReachedMap: nextHighest,
          clearedMaps: Array.from(clearedSet).sort((a, b) => a - b),
          gold: (nextSave.gold ?? 2500) + goldReward,
          itemBag: nextBag,
          masterSeals: nextBag.master_seal ?? nextSave.masterSeals,
          totalTurns: nextSave.totalTurns + latestTurn,
          totalDefeatedEnemies: nextSave.totalDefeatedEnemies + defeatedCount,
          weatherBattlesWon: (nextSave.weatherBattlesWon ?? 0) + (isHarshWeather ? 1 : 0),
        });

        const snap: OutcomeSnapshot = {
          outcome: 'VICTORY',
          reason: result.reason,
          turnsTaken: latestTurn,
          enemiesDefeated: defeatedCount,
          alliesRemaining: alivePlayers.length,
          totalAllies: initialAlliesCount,
          clearedMapsCount: nextSave.clearedMaps.length,
          goldEarned: goldReward,
          rewardNotes,
        };

        // Play continuous Outro story dialogue, then display Victory Mastery modal
        setDialogueState({
          mode: 'OUTRO',
          onDone: () => {
            setDialogueState(null);
            setOutcomeSnapshot(snap);
            setScreen('gameover');
          },
        });
      } else {
        soundEngine.defeat();
        const snap: OutcomeSnapshot = {
          outcome: 'DEFEAT',
          reason: result.reason,
          turnsTaken: latestTurn,
          enemiesDefeated: defeatedCount,
          alliesRemaining: alivePlayers.length,
          totalAllies: initialAlliesCount,
          clearedMapsCount: saveDataRef.current.clearedMaps.length,
        };
        window.setTimeout(() => {
          setOutcomeSnapshot(snap);
          setScreen('gameover');
        }, 450);
      }
      return true;
    },
    [initialAlliesCount, commitSaveWithTitles]
  );

  // Apply combat results (HP, EXP, Level Up, deaths) to units state
  const applyCombatResolutionToUnits = useCallback(
    (attackerId: string, defenderId: string, resolution: CombatResolution): Unit[] => {
      let defeatedDelta = 0;
      const usedSkill = resolution.forecast.activeSkillId
        ? SKILLS[resolution.forecast.activeSkillId]
        : null;
      const updated = unitsRef.current.map((u) => {
        if (u.id === attackerId) {
          const nextSp = usedSkill
            ? Math.max(0, u.sp - (usedSkill.spCost ?? 0))
            : Math.min(u.maxSp, u.sp + 15);
          let next: Unit = {
            ...u,
            hp: resolution.attackerEndHp,
            sp: nextSp,
            acted: u.faction === 'PLAYER' ? true : u.acted,
          };
          if (next.faction === 'PLAYER' && next.hp > 0 && resolution.expGained > 0) {
            if (resolution.levelUp) {
              const lvl = resolution.levelUp;
              const ns = { ...next.stats };
              if (lvl.gains.hp) ns.maxHp += lvl.gains.hp;
              if (lvl.gains.str) ns.str += lvl.gains.str;
              if (lvl.gains.mag) ns.mag += lvl.gains.mag;
              if (lvl.gains.skl) ns.skl += lvl.gains.skl;
              if (lvl.gains.spd) ns.spd += lvl.gains.spd;
              if (lvl.gains.lck) ns.lck += lvl.gains.lck;
              if (lvl.gains.def) ns.def += lvl.gains.def;
              if (lvl.gains.res) ns.res += lvl.gains.res;
              next = {
                ...next,
                level: lvl.newLevel,
                exp: (next.exp + resolution.expGained) % 100,
                hp: Math.min(ns.maxHp, next.hp + (lvl.gains.hp ?? 0)),
                stats: ns,
              };
            } else {
              next = { ...next, exp: Math.min(99, next.exp + resolution.expGained) };
            }
          }
          if (next.faction === 'ENEMY' && next.hp <= 0) defeatedDelta++;
          return next;
        }
        if (u.id === defenderId) {
          let next: Unit = {
            ...u,
            hp: resolution.defenderEndHp,
            sp: Math.min(u.maxSp, u.sp + 12),
          };
          if (next.faction === 'PLAYER' && next.hp > 0 && resolution.expGained > 0) {
            if (resolution.levelUp) {
              const lvl = resolution.levelUp;
              const ns = { ...next.stats };
              if (lvl.gains.hp) ns.maxHp += lvl.gains.hp;
              if (lvl.gains.str) ns.str += lvl.gains.str;
              if (lvl.gains.mag) ns.mag += lvl.gains.mag;
              if (lvl.gains.skl) ns.skl += lvl.gains.skl;
              if (lvl.gains.spd) ns.spd += lvl.gains.spd;
              if (lvl.gains.lck) ns.lck += lvl.gains.lck;
              if (lvl.gains.def) ns.def += lvl.gains.def;
              if (lvl.gains.res) ns.res += lvl.gains.res;
              next = {
                ...next,
                level: lvl.newLevel,
                exp: (next.exp + resolution.expGained) % 100,
                hp: Math.min(ns.maxHp, next.hp + (lvl.gains.hp ?? 0)),
                stats: ns,
              };
            } else {
              next = { ...next, exp: Math.min(99, next.exp + resolution.expGained) };
            }
          }
          if (next.faction === 'ENEMY' && next.hp <= 0) defeatedDelta++;
          return next;
        }
        return u;
      });

      const atk = updated.find((u) => u.id === attackerId);
      const def = updated.find((u) => u.id === defenderId);
      const attackerCritted = resolution.strikes.some(
        (s) => s.actor === 'ATTACKER' && s.hit && s.crit
      );
      const defenderCritted = resolution.strikes.some(
        (s) => s.actor === 'DEFENDER' && s.hit && s.crit
      );
      const playerCritCount = resolution.strikes.filter(
        (s) =>
          s.hit &&
          s.crit &&
          ((s.actor === 'ATTACKER' && atk?.faction === 'PLAYER') ||
            (s.actor === 'DEFENDER' && def?.faction === 'PLAYER'))
      ).length;

      let finalUnits = updated;

      if (defeatedDelta > 0 || playerCritCount > 0) {
        if (defeatedDelta > 0) setEnemiesDefeatedThisMap((c) => c + defeatedDelta);
        const killedUnits = finalUnits.filter(
          (u) => (u.id === attackerId || u.id === defenderId) && u.faction === 'ENEMY' && u.hp <= 0
        );
        const bossKillDelta = killedUnits.filter((e) => e.isBoss).length;
        const playerActor =
          atk?.faction === 'PLAYER' ? atk : def?.faction === 'PLAYER' ? def : null;
        const goldPct = playerActor
          ? getUnitTitleBonuses(playerActor, saveDataRef.current.commanderTitleId).goldBonusPercent
          : 0;
        const rawKillGold = killedUnits.reduce((sum, e) => sum + (e.isBoss ? 450 : 120), 0);
        const killGold = Math.round(rawKillGold * (1 + goldPct / 100));

        let nextConvoyWeaponIds = saveDataRef.current.convoyWeaponIds;
        let nextItemBag = saveDataRef.current.itemBag ?? {};
        let nextEquipmentBag = saveDataRef.current.equipmentBag ?? [];
        let latestDrop: BattleLootDrop | null = null;

        // Combat Victory Random Loot Drop: 0.05% - 0.1% chance per defeated enemy for ANY random item.
        // If winning hero's pack is full (6/6), the dropped item is sent straight into Kho Quân Đoàn!
        if (killedUnits.length > 0 && playerActor && playerActor.hp > 0) {
          let currentWinner = playerActor;
          for (const killedEnemy of killedUnits) {
            const dropRes = rollAndDeliverBattleLootDrop(currentWinner, killedEnemy, {
              convoyWeaponIds: nextConvoyWeaponIds,
              itemBag: nextItemBag,
              equipmentBag: nextEquipmentBag,
            });
            if (dropRes) {
              currentWinner = dropRes.updatedWinner;
              nextConvoyWeaponIds = dropRes.nextConvoyWeaponIds;
              nextItemBag = dropRes.nextItemBag;
              nextEquipmentBag = dropRes.nextEquipmentBag;
              latestDrop = dropRes.drop;
              finalUnits = finalUnits.map((u) =>
                u.id === currentWinner.id ? currentWinner : u
              );
              unlockedAlliesRef.current = unlockedAlliesRef.current.map((u) =>
                u.id === currentWinner.id ? currentWinner : u
              );
              setUnlockedAllies(unlockedAlliesRef.current);
            }
          }
        }

        const candidateSave = mergeUnitsIntoSavedRoster(
          {
            ...saveDataRef.current,
            gold: (saveDataRef.current.gold ?? 2500) + killGold,
            convoyWeaponIds: nextConvoyWeaponIds,
            itemBag: nextItemBag,
            masterSeals: nextItemBag.master_seal ?? 0,
            equipmentBag: nextEquipmentBag,
            totalDefeatedEnemies: (saveDataRef.current.totalDefeatedEnemies ?? 0) + defeatedDelta,
            totalBossKills: (saveDataRef.current.totalBossKills ?? 0) + bossKillDelta,
            totalCrits: (saveDataRef.current.totalCrits ?? 0) + playerCritCount,
          },
          [...unlockedAlliesRef.current, ...finalUnits]
        );
        commitSaveWithTitles(candidateSave);

        if (killGold > 0) {
          const goldPos = killedUnits[0];
          if (goldPos) {
            spawnFloatingText(`+${killGold}G`, goldPos.x, goldPos.y, '#fcd34d');
          }
        }

        if (latestDrop && playerActor) {
          spawnFloatingText(
            latestDrop.sentToConvoy
              ? `✦ Rơi ${latestDrop.name} → Gửi Kho!`
              : `✦ Nhặt ${latestDrop.name}!`,
            playerActor.x,
            playerActor.y,
            '#fde047'
          );
          showLootDropToast(latestDrop);
        }
      }

      if (def) {
        const totalDefDmg = resolution.attackerStartHp - resolution.attackerEndHp;
        const totalAtkDmg = resolution.defenderStartHp - resolution.defenderEndHp;
        if (totalAtkDmg > 0) {
          if (attackerCritted) {
            boardRendererRef.current.triggerCritEffect(def.x, def.y, '#fbbf24');
            spawnFloatingText(`CHÍ MẠNG! -${totalAtkDmg}`, def.x, def.y, '#fde047');
          } else {
            boardRendererRef.current.triggerHitEffect(def.x, def.y, false, '#fbbf24');
            spawnFloatingText(`-${totalAtkDmg}`, def.x, def.y, '#fbbf24');
          }
        } else {
          spawnFloatingText('TRƯỢT', def.x, def.y, '#cbd5e1');
        }
        if (atk && totalDefDmg > 0) {
          if (defenderCritted) {
            boardRendererRef.current.triggerCritEffect(atk.x, atk.y, '#f87171');
            spawnFloatingText(`CHÍ MẠNG! -${totalDefDmg}`, atk.x, atk.y, '#fca5a5');
          } else {
            boardRendererRef.current.triggerHitEffect(atk.x, atk.y, false, '#f87171');
            spawnFloatingText(`-${totalDefDmg}`, atk.x, atk.y, '#f87171');
          }
        }
      }

      // Display randomized class & HP%-based dialogue bubbles above surviving combatants on the tactical board
      if (atk && atk.hp > 0) {
        spawnCombatBubble(atk, atk.hp, attackerCritted);
      }
      if (def && def.hp > 0) {
        spawnCombatBubble(def, def.hp, defenderCritted);
      }

      if (resolution.levelUp) {
        showLevelUp(resolution.levelUp);
      }

      unitsRef.current = finalUnits;
      setUnits(finalUnits);
      return finalUnits;
    },
    [spawnFloatingText, spawnCombatBubble, showLevelUp, showLootDropToast, commitSaveWithTitles]
  );

  // Run combat (either full animated pixel cutscene or quick map-level exchange)
  const executeCombatSequence = useCallback(
    (attacker: Unit, defender: Unit, activeSkillId: SkillId | null = null): Promise<Unit[]> => {
      return new Promise((resolve) => {
        const grid = mapDataRef.current.grid;
        const dist = manhattan(attacker, defender);
        const curWeather = getWeatherForTurn(mapDataRef.current.meta.weather, turnRef.current);
        const resolution = resolveCombat(
          attacker,
          defender,
          grid[attacker.y][attacker.x],
          grid[defender.y][defender.x],
          dist,
          Math.random,
          activeSkillId,
          curWeather,
          saveDataRef.current.commanderTitleId
        );

        const finish = () => {
          setPendingCombat(null);
          const updated = applyCombatResolutionToUnits(attacker.id, defender.id, resolution);
          resolve(updated);
        };

        if (saveDataRef.current.settings.combatAnimations) {
          setPendingCombat({ attacker, defender, resolution, onComplete: finish });
        } else {
          if (attacker.weapon.isMagic) soundEngine.magic();
          else soundEngine.slash(resolution.strikes.some((s) => s.crit));
          finish();
        }
      });
    },
    [applyCombatResolutionToUnits]
  );

  // Terrain Fort/Throne healing at the start of a faction's phase
  const applyTerrainHealing = useCallback(
    (faction: 'PLAYER' | 'ENEMY', currentUnits: Unit[]): Unit[] => {
      const grid = mapDataRef.current.grid;
      return currentUnits.map((u) => {
        if (u.faction !== faction || u.hp <= 0) return u;
        const terrain = TERRAIN_DATA[grid[u.y][u.x]];
        if (terrain.healPercent > 0 && u.hp < u.stats.maxHp) {
          const amount = Math.max(2, Math.round((u.stats.maxHp * terrain.healPercent) / 100));
          const healed = Math.min(u.stats.maxHp, u.hp + amount);
          spawnFloatingText(`+${healed - u.hp} HP`, u.x, u.y, '#34d399');
          return { ...u, hp: healed };
        }
        return u;
      });
    },
    [spawnFloatingText]
  );

  // Full Enemy AI Phase Sequencer
  const runEnemyPhase = useCallback(async () => {
    const token = ++enemyTurnAbortRef.current;
    setPhase('ENEMY');
    setSubMode('IDLE');
    setSelectedUnitId(null);
    setPreMoveOrigin(null);
    setForecastTargetId(null);
    flashPhaseBanner('LƯỢT QUÂN ĐỊCH', false);

    // Terrain healing for enemies on forts/throne
    const healedEnemies = applyTerrainHealing('ENEMY', unitsRef.current).map((u) =>
      u.faction === 'ENEMY' ? { ...u, acted: false } : u
    );
    unitsRef.current = healedEnemies;
    setUnits(healedEnemies);

    const delay = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
    await delay(saveDataRef.current.settings.fastMode ? 450 : 850);
    if (enemyTurnAbortRef.current !== token) return;

    const enemyIds = unitsRef.current
      .filter((u) => u.faction === 'ENEMY' && u.hp > 0)
      .map((u) => u.id);

    for (const enemyId of enemyIds) {
      if (enemyTurnAbortRef.current !== token) return;
      const enemy = unitsRef.current.find((u) => u.id === enemyId && u.hp > 0);
      if (!enemy) continue;

      const decision = decideEnemyAction(enemy, mapDataRef.current.grid, unitsRef.current);
      setCursor({ x: enemy.x, y: enemy.y });

      if (decision.moveTo.x !== enemy.x || decision.moveTo.y !== enemy.y) {
        const path = findPath(enemy, decision.moveTo, mapDataRef.current.grid, unitsRef.current);
        await animateUnitWalk(enemy.id, path);
        if (enemyTurnAbortRef.current !== token) return;

        const movedUnits = unitsRef.current.map((u) =>
          u.id === enemy.id ? { ...u, x: decision.moveTo.x, y: decision.moveTo.y } : u
        );
        unitsRef.current = movedUnits;
        setUnits(movedUnits);
        setCursor(decision.moveTo);
      }

      if (decision.healTargetId) {
        const latestHealer = unitsRef.current.find((u) => u.id === enemy.id && u.hp > 0);
        const healTarget = unitsRef.current.find((u) => u.id === decision.healTargetId && u.hp > 0);
        if (latestHealer && healTarget) {
          soundEngine.heal();
          const curWeather = getWeatherForTurn(mapDataRef.current.meta.weather, turnRef.current);
          const healAmt = getHealAmount(latestHealer, curWeather, null);
          const actualHeal = Math.min(healAmt, healTarget.stats.maxHp - healTarget.hp);
          if (actualHeal > 0) {
            spawnFloatingText(`+${actualHeal} HP`, healTarget.x, healTarget.y, '#34d399');
            const healedUnits = unitsRef.current.map((u) =>
              u.id === healTarget.id ? { ...u, hp: u.hp + actualHeal } : u
            );
            unitsRef.current = healedUnits;
            setUnits(healedUnits);
          }
        }
      } else if (decision.targetId) {
        const latestEnemy = unitsRef.current.find((u) => u.id === enemy.id && u.hp > 0);
        const target = unitsRef.current.find((u) => u.id === decision.targetId && u.hp > 0);
        if (latestEnemy && target) {
          const updatedUnits = await executeCombatSequence(latestEnemy, target);
          if (enemyTurnAbortRef.current !== token) return;
          if (evaluateAndHandleOutcome(updatedUnits, turnRef.current, false)) return;
        }
      }

      await delay(saveDataRef.current.settings.fastMode ? 120 : 240);
    }

    if (enemyTurnAbortRef.current !== token) return;

    // Advance to next Player Turn & check dynamic weather shift
    const prevTurn = turnRef.current;
    const nextTurn = prevTurn + 1;
    turnRef.current = nextTurn;
    setTurn(nextTurn);

    const prevWeather = getWeatherForTurn(mapDataRef.current.meta.weather, prevTurn);
    const nextWeather = getWeatherForTurn(mapDataRef.current.meta.weather, nextTurn);
    if (nextWeather !== prevWeather) {
      showWeatherShift(nextWeather);
    }

    // Check SURVIVE victory condition at start of new Player Turn
    if (evaluateAndHandleOutcome(unitsRef.current, nextTurn, false)) return;

    const resetPlayers = applyTerrainHealing('PLAYER', unitsRef.current).map((u) => {
      if (u.faction !== 'PLAYER') return u;
      const spRegen = hasSkill(u, 'ARCANE_SURGE') ? 30 : 20;
      return {
        ...u,
        acted: false,
        sp: Math.min(u.maxSp, u.sp + spRegen),
      };
    });
    unitsRef.current = resetPlayers;
    setUnits(resetPlayers);
    setPhase('PLAYER');
    flashPhaseBanner('LƯỢT PHE TA', true);

    const lord = resetPlayers.find((u) => u.isLord && u.hp > 0) ?? resetPlayers.find((u) => u.faction === 'PLAYER' && u.hp > 0);
    if (lord) setCursor({ x: lord.x, y: lord.y });
  }, [
    animateUnitWalk,
    applyTerrainHealing,
    evaluateAndHandleOutcome,
    executeCombatSequence,
    flashPhaseBanner,
    showWeatherShift,
  ]);

  // Check if all allied units have acted -> automatically trigger Enemy Phase
  const finalizeUnitAction = useCallback(
    (updatedUnits: Unit[], throneSeized = false) => {
      unitsRef.current = updatedUnits;
      setUnits(updatedUnits);
      setSubMode('IDLE');
      setSelectedUnitId(null);
      setSelectedActiveSkillId(null);
      setPreMoveOrigin(null);
      setForecastTargetId(null);

      if (evaluateAndHandleOutcome(updatedUnits, turnRef.current, throneSeized)) return;

      const remainingAllies = updatedUnits.filter(
        (u) => u.faction === 'PLAYER' && u.hp > 0 && !u.acted
      );
      if (remainingAllies.length === 0) {
        void runEnemyPhase();
      }
    },
    [evaluateAndHandleOutcome, runEnemyPhase]
  );

  // Cancel current action / revert move
  const cancelCurrentSelection = useCallback(() => {
    soundEngine.cancel();
    if (subMode === 'FORECAST') {
      setForecastTargetId(null);
      setSubMode('TARGET_ATTACK');
      return;
    }
    if (subMode === 'TARGET_ATTACK' || subMode === 'TARGET_HEAL') {
      setSelectedActiveSkillId(null);
      setSubMode('ACTION_MENU');
      return;
    }
    if (subMode === 'ACTION_MENU' && selectedUnitId && preMoveOrigin) {
      const reverted = unitsRef.current.map((u) =>
        u.id === selectedUnitId ? { ...u, x: preMoveOrigin.x, y: preMoveOrigin.y } : u
      );
      unitsRef.current = reverted;
      setUnits(reverted);
      setCursor(preMoveOrigin);
      setSelectedActiveSkillId(null);
      setSubMode('UNIT_SELECTED');
      setPreMoveOrigin(null);
      return;
    }
    setSubMode('IDLE');
    setSelectedUnitId(null);
    setSelectedActiveSkillId(null);
    setPreMoveOrigin(null);
    setForecastTargetId(null);
  }, [subMode, selectedUnitId, preMoveOrigin]);

  // Equip weapon/spell from personal inventory, or (ONLY when out of battle) from Convoy.
  // If personal pack is already 6/6, equipping from Convoy swaps the previously wielded weapon back to Convoy!
  const handleEquipWeapon = useCallback((unitId: string, weaponId: string) => {
    const weapon = WEAPONS[weaponId];
    if (!weapon) return;
    const targetUnit =
      unitsRef.current.find((u) => u.id === unitId && u.hp > 0) ??
      unlockedAlliesRef.current.find((u) => u.id === unitId);
    if (!targetUnit || !canUnitEquipWeapon(targetUnit, weapon)) return;

    const alreadyInPersonalInv = targetUnit.inventory.some((w) => w.id === weapon.id);
    if (!alreadyInPersonalInv) {
      // Strictly sealed during battle (even for Lord Kaelen!)
      if (!isOutOfBattleRef.current) {
        soundEngine.cancel();
        return;
      }
    }

    const swapOldEquippedToConvoy = !alreadyInPersonalInv && isUnitCarryFull(targetUnit);
    const prevEquippedId = targetUnit.weapon.id;

    soundEngine.select();
    const forgeState = saveDataRef.current.weaponForges?.[weapon.id];
    const applyEquip = (u: Unit): Unit => {
      if (u.id !== unitId) return u;
      const hasInInv = u.inventory.some((w) => w.id === weapon.id);
      if (hasInInv) {
        return {
          ...u,
          weapon,
          weaponForge: forgeState,
        };
      }
      if (swapOldEquippedToConvoy) {
        let replaced = false;
        const swappedInv = u.inventory.map((w) => {
          if (!replaced && w.id === prevEquippedId) {
            replaced = true;
            return weapon;
          }
          return w;
        });
        if (!replaced) swappedInv.unshift(weapon);
        return {
          ...u,
          weapon,
          weaponForge: forgeState,
          inventory: swappedInv,
        };
      }
      return {
        ...u,
        weapon,
        weaponForge: forgeState,
        inventory: [...u.inventory, weapon],
      };
    };
    const updated = unitsRef.current.map(applyEquip);
    const updatedBench = unlockedAlliesRef.current.map(applyEquip);
    unitsRef.current = updated;
    unlockedAlliesRef.current = updatedBench;
    setUnits(updated);
    setUnlockedAllies(updatedBench);

    let nextConvoy = saveDataRef.current.convoyWeaponIds;
    if (!alreadyInPersonalInv) {
      const cIdx = nextConvoy.indexOf(weapon.id);
      if (cIdx >= 0) {
        nextConvoy = [...nextConvoy];
        nextConvoy.splice(cIdx, 1);
      }
      if (swapOldEquippedToConvoy && prevEquippedId !== weapon.id) {
        nextConvoy = [...nextConvoy, prevEquippedId];
      }
    }

    const nextSave = mergeUnitsIntoSavedRoster(
      {
        ...saveDataRef.current,
        convoyWeaponIds: nextConvoy,
      },
      [...updatedBench, ...updated]
    );
    saveDataRef.current = nextSave;
    saveCampaignData(nextSave);
    setSaveData(nextSave);
  }, []);

  // Helper: sync updated equipmentBag & weaponForges onto live battle units, bench pool & persist save
  const syncEquipmentAndCommit = useCallback(
    (
      nextEquipmentBag: EquipmentInstance[],
      nextWeaponForges: Record<string, WeaponForgeState>,
      saveOverrides: Partial<CampaignSaveData>,
      updatedUnitsOverride?: Unit[],
      updatedBenchOverride?: Unit[]
    ) => {
      const bagByUid = new Map<string, EquipmentInstance>();
      for (const eq of nextEquipmentBag) bagByUid.set(eq.uid, eq);

      const cmdTitle = saveOverrides.commanderTitleId ?? saveDataRef.current.commanderTitleId;
      const syncOne = (u: Unit): Unit => {
        if (u.faction !== 'PLAYER') return u;
        const oldEffMax = getEffectiveUnitStats(u, cmdTitle).maxHp;
        const nextEquip: Partial<Record<ArmorSlot, EquipmentInstance>> = {};
        const wornUids = new Set<string>();
        if (u.equipment) {
          for (const slot of ARMOR_SLOTS) {
            const cur = u.equipment[slot];
            if (cur && bagByUid.has(cur.uid)) {
              nextEquip[slot] = bagByUid.get(cur.uid)!;
              wornUids.add(cur.uid);
            }
          }
        }
        const cleanedCarriedArmor = (u.carriedArmorUids ?? []).filter(
          (id) => bagByUid.has(id) && !wornUids.has(id)
        );
        const nextUnit: Unit = {
          ...u,
          equipment: nextEquip,
          carriedArmorUids: cleanedCarriedArmor,
          weaponForge: nextWeaponForges[u.weapon.id],
        };
        const newEffMax = getEffectiveUnitStats(nextUnit, cmdTitle).maxHp;
        const hpDelta = newEffMax - oldEffMax;
        nextUnit.hp = Math.max(1, Math.min(newEffMax, u.hp + Math.max(0, hpDelta)));
        return nextUnit;
      };

      const syncedUnits = (updatedUnitsOverride ?? unitsRef.current).map(syncOne);
      const syncedBench = (updatedBenchOverride ?? unlockedAlliesRef.current).map((b) => {
        const liveMatch = syncedUnits.find((u) => u.id === b.id);
        return liveMatch ?? syncOne(b);
      });

      unitsRef.current = syncedUnits;
      unlockedAlliesRef.current = syncedBench;
      setUnits(syncedUnits);
      setUnlockedAllies(syncedBench);

      const merged = mergeUnitsIntoSavedRoster(
        {
          ...saveDataRef.current,
          ...saveOverrides,
          equipmentBag: nextEquipmentBag,
          weaponForges: nextWeaponForges,
        },
        [...syncedBench, ...syncedUnits]
      );
      commitSaveWithTitles(merged);
    },
    [commitSaveWithTitles]
  );

  const handleEquipArmor = useCallback(
    (unitId: string, uid: string) => {
      const bag = saveDataRef.current.equipmentBag ?? [];
      const piece = bag.find((e) => e.uid === uid);
      if (!piece) return;

      const recipient =
        unitsRef.current.find((u) => u.id === unitId && u.hp > 0) ??
        unlockedAlliesRef.current.find((u) => u.id === unitId);
      if (!recipient) return;

      const isCarriedBySelf = Boolean(recipient.carriedArmorUids?.includes(uid));
      const allKnownAllies = [
        ...unitsRef.current.filter((u) => u.faction === 'PLAYER' && u.hp > 0),
        ...unlockedAlliesRef.current,
      ];
      const owner = allKnownAllies.find(
        (u) =>
          u.id !== unitId &&
          (u.equipment?.[piece.slot]?.uid === uid || Boolean(u.carriedArmorUids?.includes(uid)))
      );

      if (!isOutOfBattleRef.current) {
        // In battle (or pre-turn-1 map deployment): Kho Quân Đoàn is SEALED for everyone including Kaelen!
        if (!isCarriedBySelf && !owner) {
          soundEngine.cancel();
          return;
        }
        if (owner && !isFreeLogisticsRef.current) {
          const deployed = unitsRef.current.filter((u) => u.faction === 'PLAYER' && u.hp > 0);
          const check = canUnitTakeEquippedArmorFromOwner(recipient, owner, deployed, false, uid);
          if (!check.allowed) {
            soundEngine.cancel();
            return;
          }
          setPreMoveOrigin(null);
        }
      }

      soundEngine.select();

      const prevRecipientWorn = recipient.equipment?.[piece.slot];
      const ownerWorePiece = Boolean(owner && owner.equipment?.[piece.slot]?.uid === uid);
      const ownerCarriedPiece = Boolean(owner && owner.carriedArmorUids?.includes(uid));

      const applyArmor = (u: Unit): Unit => {
        if (u.faction !== 'PLAYER') return u;
        const nextEquip = { ...(u.equipment ?? {}) };
        let nextCarried = (u.carriedArmorUids ?? []).filter((id) => id !== uid);

        if (u.id !== unitId) {
          if (nextEquip[piece.slot]?.uid === uid) {
            if (!isOutOfBattleRef.current && prevRecipientWorn && prevRecipientWorn.uid !== uid) {
              nextEquip[piece.slot] = prevRecipientWorn;
            } else {
              delete nextEquip[piece.slot];
            }
          } else if (
            !isOutOfBattleRef.current &&
            owner &&
            u.id === owner.id &&
            ownerCarriedPiece &&
            prevRecipientWorn &&
            prevRecipientWorn.uid !== uid
          ) {
            nextCarried = [...nextCarried, prevRecipientWorn.uid];
          }
          return { ...u, equipment: nextEquip, carriedArmorUids: nextCarried };
        }

        const prevWorn = nextEquip[piece.slot];
        nextEquip[piece.slot] = piece;
        // If swapping from own personal pack mid-battle, put replaced worn armor into own personal pack
        if (
          !isOutOfBattleRef.current &&
          isCarriedBySelf &&
          !ownerWorePiece &&
          !ownerCarriedPiece &&
          prevWorn &&
          prevWorn.uid !== uid
        ) {
          nextCarried = [...nextCarried, prevWorn.uid];
        }
        return { ...u, equipment: nextEquip, carriedArmorUids: nextCarried };
      };

      const updatedUnits = unitsRef.current.map(applyArmor);
      const updatedBench = unlockedAlliesRef.current.map(applyArmor);
      syncEquipmentAndCommit(
        bag,
        saveDataRef.current.weaponForges ?? {},
        {},
        updatedUnits,
        updatedBench
      );
    },
    [syncEquipmentAndCommit]
  );

  const handleUnequipArmor = useCallback(
    (unitId: string, slot: ArmorSlot) => {
      const target =
        unitsRef.current.find((u) => u.id === unitId && u.hp > 0) ??
        unlockedAlliesRef.current.find((u) => u.id === unitId);
      const removed = target?.equipment?.[slot];
      if (!target || !removed) return;

      // Mid-battle: cannot dump worn armor into Kho Quân Đoàn; must have room in personal 6-slot pack!
      if (!isOutOfBattleRef.current && isUnitCarryFull(target)) {
        soundEngine.cancel();
        return;
      }

      soundEngine.select();
      const stripArmor = (u: Unit): Unit => {
        if (u.id !== unitId) return u;
        const nextEquip = { ...(u.equipment ?? {}) };
        delete nextEquip[slot];
        const nextCarried = !isOutOfBattleRef.current
          ? [...(u.carriedArmorUids ?? []), removed.uid]
          : u.carriedArmorUids ?? [];
        return { ...u, equipment: nextEquip, carriedArmorUids: nextCarried };
      };
      const updatedUnits = unitsRef.current.map(stripArmor);
      const updatedBench = unlockedAlliesRef.current.map(stripArmor);
      syncEquipmentAndCommit(
        saveDataRef.current.equipmentBag ?? [],
        saveDataRef.current.weaponForges ?? {},
        {},
        updatedUnits,
        updatedBench
      );
    },
    [syncEquipmentAndCommit]
  );

  const handleTemperArmor = useCallback(
    (uid: string) => {
      if (!isOutOfBattleRef.current) {
        soundEngine.cancel();
        return;
      }
      const cur = saveDataRef.current;
      const bag = cur.equipmentBag ?? [];
      const target = bag.find((e) => e.uid === uid);
      if (!target) return;
      const res = temperArmorInstance(target, cur.gold ?? 0, cur.itemBag ?? {});
      if (!res) return;
      soundEngine.levelUp();
      const nextEqBag = bag.map((e) => (e.uid === uid ? res.updated : e));
      syncEquipmentAndCommit(nextEqBag, cur.weaponForges ?? {}, {
        gold: res.nextGold,
        itemBag: res.nextBag,
      });
    },
    [syncEquipmentAndCommit]
  );

  const handleLevelUpArmor = useCallback(
    (uid: string) => {
      if (!isOutOfBattleRef.current) {
        soundEngine.cancel();
        return;
      }
      const cur = saveDataRef.current;
      const bag = cur.equipmentBag ?? [];
      const target = bag.find((e) => e.uid === uid);
      if (!target) return;
      const res = levelUpArmorInstance(target, cur.gold ?? 0, cur.itemBag ?? {});
      if (!res) return;
      soundEngine.select();
      const nextEqBag = bag.map((e) => (e.uid === uid ? res.updated : e));
      syncEquipmentAndCommit(nextEqBag, cur.weaponForges ?? {}, {
        gold: res.nextGold,
        itemBag: res.nextBag,
      });
    },
    [syncEquipmentAndCommit]
  );

  const handleSocketArmorGem = useCallback(
    (uid: string, gemId: string) => {
      if (!isOutOfBattleRef.current) {
        soundEngine.cancel();
        return;
      }
      const cur = saveDataRef.current;
      const bag = cur.equipmentBag ?? [];
      const target = bag.find((e) => e.uid === uid);
      if (!target) return;
      const res = socketGemIntoArmor(target, gemId, cur.itemBag ?? {});
      if (!res) return;
      soundEngine.heal();
      const nextEqBag = bag.map((e) => (e.uid === uid ? res.updated : e));
      syncEquipmentAndCommit(nextEqBag, cur.weaponForges ?? {}, {
        itemBag: res.nextBag,
      });
    },
    [syncEquipmentAndCommit]
  );

  const handleUnsocketArmorGem = useCallback(
    (uid: string, socketIndex: number) => {
      if (!isOutOfBattleRef.current) {
        soundEngine.cancel();
        return;
      }
      const cur = saveDataRef.current;
      const bag = cur.equipmentBag ?? [];
      const target = bag.find((e) => e.uid === uid);
      if (!target) return;
      const res = unsocketGemFromArmor(target, socketIndex, cur.itemBag ?? {});
      if (!res) return;
      soundEngine.select();
      const nextEqBag = bag.map((e) => (e.uid === uid ? res.updated : e));
      syncEquipmentAndCommit(nextEqBag, cur.weaponForges ?? {}, {
        itemBag: res.nextBag,
      });
    },
    [syncEquipmentAndCommit]
  );

  const handleFuseArmor = useCallback(
    (baseUid: string, materialUid: string) => {
      if (!isOutOfBattleRef.current) {
        soundEngine.cancel();
        return;
      }
      const cur = saveDataRef.current;
      const bag = cur.equipmentBag ?? [];
      const base = bag.find((e) => e.uid === baseUid);
      const mat = bag.find((e) => e.uid === materialUid);
      if (!base || !mat) return;
      const res = fuseArmorInstances(base, mat, cur.gold ?? 0, cur.itemBag ?? {});
      if (!res) return;
      soundEngine.levelUp();
      const nextEqBag = bag
        .filter((e) => e.uid !== materialUid)
        .map((e) => (e.uid === baseUid ? res.fused : e));
      syncEquipmentAndCommit(nextEqBag, cur.weaponForges ?? {}, {
        gold: res.nextGold,
        itemBag: res.nextBag,
      });
    },
    [syncEquipmentAndCommit]
  );

  const handleTemperWeapon = useCallback(
    (weaponId: string) => {
      if (!isOutOfBattleRef.current) {
        soundEngine.cancel();
        return;
      }
      const cur = saveDataRef.current;
      const weapon = WEAPONS[weaponId];
      if (!weapon) return;
      const forges = cur.weaponForges ?? {};
      const res = temperWeaponForge(weapon, forges[weaponId], cur.gold ?? 0, cur.itemBag ?? {});
      if (!res) return;
      soundEngine.levelUp();
      syncEquipmentAndCommit(
        cur.equipmentBag ?? [],
        { ...forges, [weaponId]: res.updated },
        { gold: res.nextGold, itemBag: res.nextBag }
      );
    },
    [syncEquipmentAndCommit]
  );

  const handleLevelUpWeapon = useCallback(
    (weaponId: string) => {
      if (!isOutOfBattleRef.current) {
        soundEngine.cancel();
        return;
      }
      const cur = saveDataRef.current;
      const weapon = WEAPONS[weaponId];
      if (!weapon) return;
      const forges = cur.weaponForges ?? {};
      const res = levelUpWeaponForge(weapon, forges[weaponId], cur.gold ?? 0, cur.itemBag ?? {});
      if (!res) return;
      soundEngine.select();
      syncEquipmentAndCommit(
        cur.equipmentBag ?? [],
        { ...forges, [weaponId]: res.updated },
        { gold: res.nextGold, itemBag: res.nextBag }
      );
    },
    [syncEquipmentAndCommit]
  );

  const handleSocketWeaponGem = useCallback(
    (weaponId: string, gemId: string) => {
      if (!isOutOfBattleRef.current) {
        soundEngine.cancel();
        return;
      }
      const cur = saveDataRef.current;
      const weapon = WEAPONS[weaponId];
      if (!weapon) return;
      const forges = cur.weaponForges ?? {};
      const res = socketGemIntoWeapon(weapon, forges[weaponId], gemId, cur.itemBag ?? {});
      if (!res) return;
      soundEngine.heal();
      syncEquipmentAndCommit(
        cur.equipmentBag ?? [],
        { ...forges, [weaponId]: res.updated },
        { itemBag: res.nextBag }
      );
    },
    [syncEquipmentAndCommit]
  );

  const handleUnsocketWeaponGem = useCallback(
    (weaponId: string, socketIndex: number) => {
      if (!isOutOfBattleRef.current) {
        soundEngine.cancel();
        return;
      }
      const cur = saveDataRef.current;
      const weapon = WEAPONS[weaponId];
      if (!weapon) return;
      const forges = cur.weaponForges ?? {};
      const res = unsocketGemFromWeapon(weapon, forges[weaponId], socketIndex, cur.itemBag ?? {});
      if (!res) return;
      soundEngine.select();
      syncEquipmentAndCommit(
        cur.equipmentBag ?? [],
        { ...forges, [weaponId]: res.updated },
        { itemBag: res.nextBag }
      );
    },
    [syncEquipmentAndCommit]
  );

  const handleFuseWeapon = useCallback(
    (weaponId: string) => {
      if (!isOutOfBattleRef.current) {
        soundEngine.cancel();
        return;
      }
      const cur = saveDataRef.current;
      const weapon = WEAPONS[weaponId];
      if (!weapon) return;
      const forges = cur.weaponForges ?? {};
      const res = fuseWeaponForge(
        weapon,
        forges[weaponId],
        cur.convoyWeaponIds ?? [],
        cur.gold ?? 0,
        cur.itemBag ?? {}
      );
      if (!res) return;
      soundEngine.levelUp();
      syncEquipmentAndCommit(
        cur.equipmentBag ?? [],
        { ...forges, [weaponId]: res.updated },
        {
          gold: res.nextGold,
          itemBag: res.nextBag,
          convoyWeaponIds: res.nextConvoyWeaponIds,
        }
      );
    },
    [syncEquipmentAndCommit]
  );

  const handleBuyArmor = useCallback(
    (armor: ArmorTemplate) => {
      const cur = saveDataRef.current;
      if ((cur.gold ?? 0) < armor.price) return;
      soundEngine.select();
      const created = createEquipmentInstance(armor.id);
      const nextEqBag = [...(cur.equipmentBag ?? []), created];

      // In-battle field shop: deliver to active unit's pack if < 6/6, otherwise auto-send straight to Kho Quân Đoàn!
      if (!isOutOfBattleRef.current && selectedUnitId) {
        const buyer = unitsRef.current.find((u) => u.id === selectedUnitId && u.hp > 0);
        if (buyer) {
          if (!isUnitCarryFull(buyer)) {
            const updatedBuyer: Unit = {
              ...buyer,
              carriedArmorUids: [...(buyer.carriedArmorUids ?? []), created.uid],
            };
            const nextUnits = unitsRef.current.map((u) => (u.id === buyer.id ? updatedBuyer : u));
            const nextBench = unlockedAlliesRef.current.map((u) =>
              u.id === buyer.id ? updatedBuyer : u
            );
            unitsRef.current = nextUnits;
            unlockedAlliesRef.current = nextBench;
            setUnits(nextUnits);
            setUnlockedAllies(nextBench);
            const merged = mergeUnitsIntoSavedRoster(
              {
                ...cur,
                gold: cur.gold - armor.price,
                equipmentBag: nextEqBag,
                totalShopPurchases: (cur.totalShopPurchases ?? 0) + 1,
              },
              [...nextBench, ...nextUnits]
            );
            commitSaveWithTitles(merged);
            return;
          }
          spawnFloatingText('Đầy túi → Gửi Kho!', buyer.x, buyer.y, '#fbbf24');
        }
      }

      commitSaveWithTitles({
        ...cur,
        gold: cur.gold - armor.price,
        equipmentBag: nextEqBag,
        totalShopPurchases: (cur.totalShopPurchases ?? 0) + 1,
      });
    },
    [commitSaveWithTitles, selectedUnitId, spawnFloatingText]
  );

  // Promote eligible hero across 3 evolution stages (Lv.5 -> Lv.15 -> Lv.30)
  // Out of battle: uses Kho Quân Đoàn (`itemBag`). Mid-battle: uses ONLY personal carried seal (`unit.carriedItems`)!
  const handlePromoteUnit = useCallback(
    (unitId: string) => {
      const target =
        unitsRef.current.find((u) => u.id === unitId && u.hp > 0) ??
        unlockedAlliesRef.current.find((u) => u.id === unitId);
      if (!target) return;

      const outOfBattle = isOutOfBattleRef.current;
      const accessibleBag = outOfBattle
        ? saveDataRef.current.itemBag ?? {}
        : getUnitCarriedItemCounts(target);

      if (!canPromoteUnit(target, accessibleBag)) {
        soundEngine.cancel();
        return;
      }
      const sealUsed = findAvailableSealForUnit(target, accessibleBag);
      if (!sealUsed) return;
      const promoted = promoteUnit(target);
      if (!promoted) return;

      let finalPromotedUnit = promoted.updatedUnit;
      let consumedFromPersonal = false;
      if (!outOfBattle || (saveDataRef.current.itemBag?.[sealUsed] ?? 0) <= 0) {
        const curCarried = [...(finalPromotedUnit.carriedItems ?? [])];
        const sIdx = curCarried.indexOf(sealUsed);
        if (sIdx < 0) return;
        curCarried.splice(sIdx, 1);
        finalPromotedUnit = { ...finalPromotedUnit, carriedItems: curCarried };
        consumedFromPersonal = true;
      }

      const updated = unitsRef.current.map((u) => (u.id === unitId ? finalPromotedUnit : u));
      const updatedBench = unlockedAlliesRef.current.map((u) =>
        u.id === unitId ? finalPromotedUnit : u
      );
      unitsRef.current = updated;
      unlockedAlliesRef.current = updatedBench;
      setUnits(updated);
      setUnlockedAllies(updatedBench);

      const mergedSave = mergeUnitsIntoSavedRoster(saveDataRef.current, [...updatedBench, ...updated]);
      const nextBag = { ...(mergedSave.itemBag ?? {}) };
      if (!consumedFromPersonal) {
        nextBag[sealUsed] = Math.max(0, (nextBag[sealUsed] ?? 0) - 1);
        if (nextBag[sealUsed] === 0) delete nextBag[sealUsed];
      }

      commitSaveWithTitles({
        ...mergedSave,
        itemBag: nextBag,
        masterSeals: nextBag.master_seal ?? 0,
        totalPromotions: (mergedSave.totalPromotions ?? 0) + 1,
      });

      if (unitsRef.current.some((u) => u.id === unitId)) {
        spawnFloatingText(`★ ${promoted.result.toClassName}`, target.x, target.y, '#fbbf24');
      }
      showPromotionToast(promoted.result);
    },
    [showPromotionToast, spawnFloatingText, commitSaveWithTitles]
  );

  // Equip Personal Hero Title
  const handleEquipHeroTitle = useCallback((unitId: string, titleId: string) => {
    if (!TITLES[titleId]) return;
    soundEngine.select();
    const updated = unitsRef.current.map((u) =>
      u.id === unitId ? { ...u, equippedTitleId: titleId } : u
    );
    const updatedBench = unlockedAlliesRef.current.map((u) =>
      u.id === unitId ? { ...u, equippedTitleId: titleId } : u
    );
    unitsRef.current = updated;
    unlockedAlliesRef.current = updatedBench;
    setUnits(updated);
    setUnlockedAllies(updatedBench);
    const nextSave = mergeUnitsIntoSavedRoster(saveDataRef.current, [...updatedBench, ...updated]);
    saveDataRef.current = nextSave;
    saveCampaignData(nextSave);
    setSaveData(nextSave);
  }, []);

  // Equip Commander Title (Army-wide Aura)
  const handleEquipCommanderTitle = useCallback((titleId: string) => {
    if (!TITLES[titleId]) return;
    soundEngine.select();
    const nextSave: CampaignSaveData = {
      ...saveDataRef.current,
      commanderTitleId: titleId,
    };
    saveDataRef.current = nextSave;
    saveCampaignData(nextSave);
    setSaveData(nextSave);
  }, []);

  // Free Reclass across 30 Playable Lineages for non-Lord heroes
  const handleReclassUnit = useCallback(
    (unitId: string, targetTier1ClassId: UnitClassId) => {
      const target =
        unitsRef.current.find((u) => u.id === unitId && u.hp > 0) ??
        unlockedAlliesRef.current.find((u) => u.id === unitId);
      if (!target) return;
      const reclassed = reclassUnit(target, targetTier1ClassId);
      if (!reclassed) return;

      const isActiveInBattle = unitsRef.current.some((u) => u.id === unitId && u.hp > 0);
      if (isActiveInBattle) {
        const currentTile = mapDataRef.current.grid[target.y]?.[target.x];
        if (currentTile && !canUnitStandOnTerrain(reclassed.moveType, currentTile)) {
          soundEngine.cancel();
          const msg =
            reclassed.moveType === 'NAVAL'
              ? 'Tàu chiến chỉ có thể hoạt động dưới nước — hãy chuyển hệ tại Doanh Trại hoặc trên mặt nước!'
              : 'Đơn vị bộ/thiết giáp không thể đứng giữa vùng nước sâu — hãy chuyển hệ tại Doanh Trại!';
          setPhaseBanner(msg);
          window.setTimeout(() => {
            setPhaseBanner((cur) => (cur === msg ? null : cur));
          }, 2400);
          return;
        }
      }

      soundEngine.levelUp();
      const updated = unitsRef.current.map((u) => (u.id === unitId ? reclassed : u));
      const updatedBench = unlockedAlliesRef.current.map((u) =>
        u.id === unitId ? reclassed : u
      );
      unitsRef.current = updated;
      unlockedAlliesRef.current = updatedBench;
      setUnits(updated);
      setUnlockedAllies(updatedBench);
      const nextSave = mergeUnitsIntoSavedRoster(saveDataRef.current, [...updatedBench, ...updated]);
      saveDataRef.current = nextSave;
      saveCampaignData(nextSave);
      setSaveData(nextSave);
      if (isActiveInBattle) {
        spawnFloatingText(`⇄ ${reclassed.className}`, target.x, target.y, '#38bdf8');
      }
    },
    [spawnFloatingText]
  );

  // Use Potion, Permanent Stat Booster, or EXP Manual on a hero
  // Out of battle: uses Kho Quân Đoàn (`itemBag`) or personal pack. Mid-battle: STRICTLY personal pack (`potions` / `carriedItems`)!
  const handleUseItem = useCallback(
    (unitId: string, itemId: string) => {
      const target =
        unitsRef.current.find((u) => u.id === unitId && u.hp > 0) ??
        unlockedAlliesRef.current.find((u) => u.id === unitId);
      const item = ITEMS[itemId];
      if (!target || !item) return;

      const outOfBattle = isOutOfBattleRef.current;
      const bag = saveDataRef.current.itemBag ?? {};
      let consumeMode: 'CONVOY' | 'PERSONAL_POTION' | 'PERSONAL_ITEM' | null = null;

      if (outOfBattle) {
        if ((bag[itemId] ?? 0) > 0) {
          consumeMode = 'CONVOY';
        } else if (itemId === 'vulnerary' && target.potions > 0) {
          consumeMode = 'PERSONAL_POTION';
        } else if (target.carriedItems?.includes(itemId)) {
          consumeMode = 'PERSONAL_ITEM';
        }
      } else {
        // Strictly sealed mid-battle: NEVER read from Kho Quân Đoàn (`itemBag`), even for Kaelen!
        if (itemId === 'vulnerary' && target.potions > 0) {
          consumeMode = 'PERSONAL_POTION';
        } else if (target.carriedItems?.includes(itemId)) {
          consumeMode = 'PERSONAL_ITEM';
        }
      }

      if (!consumeMode) {
        soundEngine.cancel();
        return;
      }

      const res = applyItemToUnit(target, item);
      if (!res) return;

      let finalUnit = res.updatedUnit;
      if (consumeMode === 'PERSONAL_POTION') {
        finalUnit = { ...finalUnit, potions: Math.max(0, finalUnit.potions - 1) };
      } else if (consumeMode === 'PERSONAL_ITEM') {
        const nextCarried = [...(finalUnit.carriedItems ?? [])];
        const idx = nextCarried.indexOf(itemId);
        if (idx >= 0) nextCarried.splice(idx, 1);
        finalUnit = { ...finalUnit, carriedItems: nextCarried };
      }

      if (!isFreeLogisticsRef.current) {
        setPreMoveOrigin(null);
      }

      soundEngine.heal();
      const updated = unitsRef.current.map((u) => (u.id === unitId ? finalUnit : u));
      const updatedBench = unlockedAlliesRef.current.map((u) =>
        u.id === unitId ? finalUnit : u
      );
      unitsRef.current = updated;
      unlockedAlliesRef.current = updatedBench;
      setUnits(updated);
      setUnlockedAllies(updatedBench);

      const mergedSave = mergeUnitsIntoSavedRoster(saveDataRef.current, [...updatedBench, ...updated]);
      const nextBag = { ...(mergedSave.itemBag ?? {}) };
      if (consumeMode === 'CONVOY') {
        nextBag[itemId] = Math.max(0, (nextBag[itemId] ?? 0) - 1);
        if (nextBag[itemId] === 0) delete nextBag[itemId];
      }

      const nextSave: CampaignSaveData = {
        ...mergedSave,
        itemBag: nextBag,
        masterSeals: nextBag.master_seal ?? 0,
      };
      saveDataRef.current = nextSave;
      saveCampaignData(nextSave);
      setSaveData(nextSave);

      if (unitsRef.current.some((u) => u.id === unitId)) {
        spawnFloatingText(res.summary, target.x, target.y, '#34d399');
      }
      if (res.levelUp) {
        showLevelUp(res.levelUp);
      }
    },
    [showLevelUp, spawnFloatingText]
  );

  // ==========================================================================
  // UNIT-TO-UNIT PROXIMITY TRADING, DEDICATED CONVOY & CAMP BARRACKS HANDLERS
  // ==========================================================================

  const findLiveOrCampHero = useCallback((unitId: string): Unit | undefined => {
    return (
      unitsRef.current.find((u) => u.id === unitId && u.hp > 0) ??
      unlockedAlliesRef.current.find((u) => u.id === unitId)
    );
  }, []);

  const commitHeroUpdates = useCallback(
    (replacements: Unit[], savePatch: Partial<CampaignSaveData> = {}) => {
      const byId = new Map(replacements.map((u) => [u.id, u]));
      const nextUnits = unitsRef.current.map((u) => byId.get(u.id) ?? u);
      const nextBench = unlockedAlliesRef.current.map((u) => byId.get(u.id) ?? u);
      unitsRef.current = nextUnits;
      unlockedAlliesRef.current = nextBench;
      setUnits(nextUnits);
      setUnlockedAllies(nextBench);

      if (!isFreeLogisticsRef.current) {
        setPreMoveOrigin(null);
      }

      const nextSave = mergeUnitsIntoSavedRoster(
        { ...saveDataRef.current, ...savePatch },
        [...nextBench, ...nextUnits]
      );
      saveDataRef.current = nextSave;
      saveCampaignData(nextSave);
      setSaveData(nextSave);
    },
    []
  );

  const handleTradeWeapon = useCallback(
    (
      fromUnitId: string,
      toUnitId: string,
      fromWeaponIndex: number,
      swapToWeaponIndex?: number
    ): { ok: boolean; message?: string } => {
      const fromUnit = findLiveOrCampHero(fromUnitId);
      const toUnit = findLiveOrCampHero(toUnitId);
      if (!fromUnit || !toUnit) return { ok: false };
      const res = tradeWeaponBetweenUnits(fromUnit, toUnit, fromWeaponIndex, {
        swapToWeaponIndex,
        weaponForges: saveDataRef.current.weaponForges ?? {},
        isFreeLogistics: isFreeLogisticsRef.current,
      });
      if (!res) {
        soundEngine.cancel();
        return { ok: false };
      }
      soundEngine.select();
      commitHeroUpdates([res.fromUnit, res.toUnit]);
      return { ok: true, message: res.message };
    },
    [findLiveOrCampHero, commitHeroUpdates]
  );

  const handleEquipPersonalWeapon = useCallback(
    (unitId: string, weaponId: string) => {
      const unit = findLiveOrCampHero(unitId);
      if (!unit) return;
      const updated = equipPersonalWeapon(unit, weaponId, saveDataRef.current.weaponForges ?? {});
      if (!updated) return;
      soundEngine.select();
      commitHeroUpdates([updated]);
    },
    [findLiveOrCampHero, commitHeroUpdates]
  );

  const handleTradeArmorSlot = useCallback(
    (unitAId: string, unitBId: string, slot: ArmorSlot): { ok: boolean; message?: string } => {
      const unitA = findLiveOrCampHero(unitAId);
      const unitB = findLiveOrCampHero(unitBId);
      if (!unitA || !unitB) return { ok: false };
      const res = tradeArmorSlotBetweenUnits(unitA, unitB, slot, {
        commanderTitleId: saveDataRef.current.commanderTitleId,
        isFreeLogistics: isFreeLogisticsRef.current,
      });
      if (!res) {
        soundEngine.cancel();
        return { ok: false };
      }
      soundEngine.select();
      commitHeroUpdates([res.unitA, res.unitB]);
      return { ok: true, message: res.message };
    },
    [findLiveOrCampHero, commitHeroUpdates]
  );

  const handleTradePotion = useCallback(
    (fromUnitId: string, toUnitId: string): { ok: boolean; message?: string } => {
      const fromUnit = findLiveOrCampHero(fromUnitId);
      const toUnit = findLiveOrCampHero(toUnitId);
      if (!fromUnit || !toUnit) return { ok: false };
      const res = tradePotionBetweenUnits(fromUnit, toUnit, isFreeLogisticsRef.current);
      if (!res) {
        soundEngine.cancel();
        return { ok: false };
      }
      soundEngine.heal();
      commitHeroUpdates([res.fromUnit, res.toUnit]);
      return { ok: true, message: res.message };
    },
    [findLiveOrCampHero, commitHeroUpdates]
  );

  const handleTradePersonalItem = useCallback(
    (fromUnitId: string, toUnitId: string, itemIndex: number): { ok: boolean; message?: string } => {
      const fromUnit = findLiveOrCampHero(fromUnitId);
      const toUnit = findLiveOrCampHero(toUnitId);
      if (!fromUnit || !toUnit) return { ok: false };
      const res = tradePersonalItemBetweenUnits(
        fromUnit,
        toUnit,
        itemIndex,
        isFreeLogisticsRef.current
      );
      if (!res) {
        soundEngine.cancel();
        return { ok: false };
      }
      soundEngine.select();
      commitHeroUpdates([res.fromUnit, res.toUnit]);
      return { ok: true, message: res.message };
    },
    [findLiveOrCampHero, commitHeroUpdates]
  );

  const handleTradeCarriedArmor = useCallback(
    (fromUnitId: string, toUnitId: string, armorUid: string): { ok: boolean; message?: string } => {
      const fromUnit = findLiveOrCampHero(fromUnitId);
      const toUnit = findLiveOrCampHero(toUnitId);
      if (!fromUnit || !toUnit) return { ok: false };
      const res = tradeCarriedArmorBetweenUnits(
        fromUnit,
        toUnit,
        armorUid,
        saveDataRef.current.equipmentBag ?? [],
        isFreeLogisticsRef.current
      );
      if (!res) {
        soundEngine.cancel();
        return { ok: false };
      }
      soundEngine.select();
      commitHeroUpdates([res.fromUnit, res.toUnit]);
      return { ok: true, message: res.message };
    },
    [findLiveOrCampHero, commitHeroUpdates]
  );

  // Dedicated Kho Quân Đoàn Transfer Handlers — STRICTLY LOCKED during battle (including Lord Kaelen)!
  const handleStoreWeaponToConvoy = useCallback(
    (unitId: string, weaponId: string): { ok: boolean; message?: string } => {
      if (!isOutOfBattleRef.current) {
        soundEngine.cancel();
        return { ok: false };
      }
      const unit = findLiveOrCampHero(unitId);
      if (!unit) return { ok: false };
      const res = storeUnitWeaponToConvoy(
        unit,
        weaponId,
        saveDataRef.current.convoyWeaponIds,
        saveDataRef.current.weaponForges ?? {}
      );
      if (!res) {
        soundEngine.cancel();
        return { ok: false };
      }
      soundEngine.select();
      commitHeroUpdates([res.updatedUnit], { convoyWeaponIds: res.nextConvoyWeaponIds });
      return {
        ok: true,
        message: `Đã gửi ${WEAPONS[weaponId]?.name ?? 'vũ khí'} vào Kho Quân Đoàn.`,
      };
    },
    [findLiveOrCampHero, commitHeroUpdates]
  );

  const handleWithdrawConvoyWeapon = useCallback(
    (unitId: string, weaponId: string, equipNow = false): { ok: boolean; message?: string } => {
      if (!isOutOfBattleRef.current) {
        soundEngine.cancel();
        return { ok: false };
      }
      const unit = findLiveOrCampHero(unitId);
      if (!unit) return { ok: false };
      const res = withdrawConvoyWeaponToUnit(
        unit,
        weaponId,
        saveDataRef.current.convoyWeaponIds,
        equipNow,
        saveDataRef.current.weaponForges ?? {}
      );
      if (!res) {
        soundEngine.cancel();
        return { ok: false };
      }
      soundEngine.select();
      commitHeroUpdates([res.updatedUnit], { convoyWeaponIds: res.nextConvoyWeaponIds });
      return {
        ok: true,
        message: `${unit.name} đã rút ${WEAPONS[weaponId]?.name ?? 'vũ khí'} từ Kho Quân Đoàn.`,
      };
    },
    [findLiveOrCampHero, commitHeroUpdates]
  );

  const handleStorePotionToConvoy = useCallback(
    (unitId: string): { ok: boolean; message?: string } => {
      if (!isOutOfBattleRef.current) {
        soundEngine.cancel();
        return { ok: false };
      }
      const unit = findLiveOrCampHero(unitId);
      if (!unit) return { ok: false };
      const res = storeUnitPotionToConvoy(unit, saveDataRef.current.itemBag ?? {});
      if (!res) {
        soundEngine.cancel();
        return { ok: false };
      }
      soundEngine.select();
      commitHeroUpdates([res.updatedUnit], {
        itemBag: res.nextItemBag,
        masterSeals: res.nextItemBag.master_seal ?? 0,
      });
      return { ok: true, message: `Đã gửi 1 Bình Thuốc vào Kho Quân Đoàn.` };
    },
    [findLiveOrCampHero, commitHeroUpdates]
  );

  const handleWithdrawPotionFromConvoy = useCallback(
    (unitId: string): { ok: boolean; message?: string } => {
      if (!isOutOfBattleRef.current) {
        soundEngine.cancel();
        return { ok: false };
      }
      const unit = findLiveOrCampHero(unitId);
      if (!unit) return { ok: false };
      const res = withdrawConvoyPotionToUnit(unit, saveDataRef.current.itemBag ?? {});
      if (!res) {
        soundEngine.cancel();
        return { ok: false };
      }
      soundEngine.heal();
      commitHeroUpdates([res.updatedUnit], {
        itemBag: res.nextItemBag,
        masterSeals: res.nextItemBag.master_seal ?? 0,
      });
      return { ok: true, message: `${unit.name} đã rút 1 Bình Thuốc vào túi cá nhân.` };
    },
    [findLiveOrCampHero, commitHeroUpdates]
  );

  const handleStorePersonalItemToConvoy = useCallback(
    (unitId: string, itemIndex: number): { ok: boolean; message?: string } => {
      if (!isOutOfBattleRef.current) {
        soundEngine.cancel();
        return { ok: false };
      }
      const unit = findLiveOrCampHero(unitId);
      if (!unit) return { ok: false };
      const res = storeUnitItemToConvoy(unit, itemIndex, saveDataRef.current.itemBag ?? {});
      if (!res) {
        soundEngine.cancel();
        return { ok: false };
      }
      soundEngine.select();
      const name = ITEMS[res.itemId]?.name ?? GEMS[res.itemId]?.name ?? res.itemId;
      commitHeroUpdates([res.updatedUnit], {
        itemBag: res.nextItemBag,
        masterSeals: res.nextItemBag.master_seal ?? 0,
      });
      return { ok: true, message: `Đã gửi ${name} vào Kho Quân Đoàn.` };
    },
    [findLiveOrCampHero, commitHeroUpdates]
  );

  const handleWithdrawItemFromConvoy = useCallback(
    (unitId: string, itemId: string): { ok: boolean; message?: string } => {
      if (!isOutOfBattleRef.current) {
        soundEngine.cancel();
        return { ok: false };
      }
      const unit = findLiveOrCampHero(unitId);
      if (!unit) return { ok: false };
      const res = withdrawConvoyItemToUnit(unit, itemId, saveDataRef.current.itemBag ?? {});
      if (!res) {
        soundEngine.cancel();
        return { ok: false };
      }
      soundEngine.select();
      const name = ITEMS[itemId]?.name ?? GEMS[itemId]?.name ?? itemId;
      commitHeroUpdates([res.updatedUnit], {
        itemBag: res.nextItemBag,
        masterSeals: res.nextItemBag.master_seal ?? 0,
      });
      return { ok: true, message: `${unit.name} đã rút ${name} vào túi cá nhân.` };
    },
    [findLiveOrCampHero, commitHeroUpdates]
  );

  const handleStoreCarriedArmorToConvoy = useCallback(
    (unitId: string, armorUid: string): { ok: boolean; message?: string } => {
      if (!isOutOfBattleRef.current) {
        soundEngine.cancel();
        return { ok: false };
      }
      const unit = findLiveOrCampHero(unitId);
      if (!unit) return { ok: false };
      const res = storeUnitArmorToConvoy(unit, armorUid);
      if (!res) {
        soundEngine.cancel();
        return { ok: false };
      }
      soundEngine.select();
      const eq = (saveDataRef.current.equipmentBag ?? []).find((e) => e.uid === armorUid);
      const name = eq ? ARMOR_TEMPLATES[eq.templateId]?.name ?? 'Trang bị' : 'Trang bị';
      commitHeroUpdates([res.updatedUnit]);
      return { ok: true, message: `Đã gửi ${name} vào Kho Quân Đoàn.` };
    },
    [findLiveOrCampHero, commitHeroUpdates]
  );

  const handleWithdrawArmorToPack = useCallback(
    (unitId: string, armorUid: string): { ok: boolean; message?: string } => {
      if (!isOutOfBattleRef.current) {
        soundEngine.cancel();
        return { ok: false };
      }
      const unit = findLiveOrCampHero(unitId);
      if (!unit) return { ok: false };
      const allKnownAllies = [
        ...unitsRef.current.filter((u) => u.faction === 'PLAYER' && u.hp > 0),
        ...unlockedAlliesRef.current,
      ];
      const res = withdrawConvoyArmorToUnit(
        unit,
        armorUid,
        saveDataRef.current.equipmentBag ?? [],
        allKnownAllies
      );
      if (!res) {
        soundEngine.cancel();
        return { ok: false };
      }
      soundEngine.select();
      const eq = (saveDataRef.current.equipmentBag ?? []).find((e) => e.uid === armorUid);
      const name = eq ? ARMOR_TEMPLATES[eq.templateId]?.name ?? 'Trang bị' : 'Trang bị';
      commitHeroUpdates([res.updatedUnit]);
      return { ok: true, message: `${unit.name} đã rút ${name} vào túi cá nhân.` };
    },
    [findLiveOrCampHero, commitHeroUpdates]
  );

  const handleSparTrainUnit = useCallback(
    (unitId: string): { ok: boolean; message: string } => {
      const curSave = saveDataRef.current;
      const target = findLiveOrCampHero(unitId);
      if (!target) return { ok: false, message: 'Không tìm thấy anh hùng.' };
      if ((curSave.gold ?? 0) < CAMP_SPARRING_COST_GOLD) {
        soundEngine.cancel();
        return { ok: false, message: 'Không đủ Vàng để tổ chức đấu tập.' };
      }
      const nextMapId = Math.max(
        1,
        Math.min(200, curSave.currentMapId || curSave.highestReachedMap || 1)
      );
      const maxSparLevel = getCampaignMapById(nextMapId).recommendedLevel + 2;
      if (target.level >= maxSparLevel) {
        soundEngine.cancel();
        return {
          ok: false,
          message: `${target.name} đã đạt trần huấn luyện doanh trại hiện tại (Lv.${maxSparLevel}).`,
        };
      }

      const expRes = applyExpAndLevelUp(target, CAMP_SPARRING_EXP_GAIN);
      const effMax = getEffectiveUnitStats(expRes.updatedUnit, curSave.commanderTitleId).maxHp;
      const refreshedUnit: Unit = {
        ...expRes.updatedUnit,
        hp: effMax,
      };

      soundEngine.slash();
      commitHeroUpdates([refreshedUnit], {
        gold: (curSave.gold ?? 0) - CAMP_SPARRING_COST_GOLD,
      });

      if (expRes.levelUp) {
        showLevelUp(expRes.levelUp);
        return {
          ok: true,
          message: `${target.name} đấu tập xuất sắc và thăng lên Lv.${expRes.levelUp.newLevel}!`,
        };
      }
      return {
        ok: true,
        message: `${target.name} hoàn thành hiệp đấu tập (+${CAMP_SPARRING_EXP_GAIN} EXP)!`,
      };
    },
    [findLiveOrCampHero, commitHeroUpdates, showLevelUp]
  );

  const handleTogglePreferredSquadHero = useCallback((templateId: string, maxSlots: number) => {
    if (templateId === 'kaelen') return;
    const curSave = saveDataRef.current;
    const baseIds =
      curSave.preferredSquadIds && curSave.preferredSquadIds.length > 0
        ? Array.from(new Set(['kaelen', ...curSave.preferredSquadIds]))
        : unlockedAlliesRef.current.slice(0, maxSlots).map((u) => u.templateId);

    let nextIds: string[];
    if (baseIds.includes(templateId)) {
      soundEngine.cancel();
      nextIds = baseIds.filter((id) => id !== templateId);
    } else {
      if (baseIds.length >= maxSlots) {
        soundEngine.cancel();
        return;
      }
      soundEngine.select();
      nextIds = [...baseIds, templateId];
    }

    const nextSave: CampaignSaveData = {
      ...curSave,
      preferredSquadIds: nextIds,
    };
    saveDataRef.current = nextSave;
    saveCampaignData(nextSave);
    setSaveData(nextSave);
  }, []);

  const handleSelectPreferredFormation = useCallback((preset: FormationPresetId) => {
    soundEngine.select();
    setActiveFormation(preset);
    const nextSave: CampaignSaveData = {
      ...saveDataRef.current,
      preferredFormation: preset,
    };
    saveDataRef.current = nextSave;
    saveCampaignData(nextSave);
    setSaveData(nextSave);
  }, []);

  // Shop Transactions (Camp Bazaar out-of-battle -> Convoy; In-Map Shops -> Hero 6/6 pack or auto-Convoy if full!)
  const handleBuyWeapon = useCallback(
    (weapon: Weapon) => {
      const cur = saveDataRef.current;
      if ((cur.gold ?? 0) < weapon.price) return;
      soundEngine.select();

      if (!isOutOfBattleRef.current && selectedUnitId) {
        const buyer = unitsRef.current.find((u) => u.id === selectedUnitId && u.hp > 0);
        if (buyer) {
          if (!isUnitCarryFull(buyer) && !buyer.inventory.some((w) => w.id === weapon.id)) {
            const updatedBuyer: Unit = {
              ...buyer,
              inventory: [...buyer.inventory, weapon],
            };
            const nextUnits = unitsRef.current.map((u) => (u.id === buyer.id ? updatedBuyer : u));
            const nextBench = unlockedAlliesRef.current.map((u) =>
              u.id === buyer.id ? updatedBuyer : u
            );
            unitsRef.current = nextUnits;
            unlockedAlliesRef.current = nextBench;
            setUnits(nextUnits);
            setUnlockedAllies(nextBench);
            const merged = mergeUnitsIntoSavedRoster(
              {
                ...cur,
                gold: cur.gold - weapon.price,
                totalShopPurchases: (cur.totalShopPurchases ?? 0) + 1,
              },
              [...nextBench, ...nextUnits]
            );
            commitSaveWithTitles(merged);
            return;
          }
          spawnFloatingText('Đầy túi → Gửi Kho!', buyer.x, buyer.y, '#fbbf24');
        }
      }

      commitSaveWithTitles({
        ...cur,
        gold: cur.gold - weapon.price,
        convoyWeaponIds: [...cur.convoyWeaponIds, weapon.id],
        totalShopPurchases: (cur.totalShopPurchases ?? 0) + 1,
      });
    },
    [commitSaveWithTitles, selectedUnitId, spawnFloatingText]
  );

  const handleBuyItem = useCallback(
    (item: GameItem) => {
      const cur = saveDataRef.current;
      if ((cur.gold ?? 0) < item.price) return;
      soundEngine.select();

      if (!isOutOfBattleRef.current && selectedUnitId) {
        const buyer = unitsRef.current.find((u) => u.id === selectedUnitId && u.hp > 0);
        if (buyer) {
          if (!isUnitCarryFull(buyer)) {
            const updatedBuyer: Unit =
              item.id === 'vulnerary'
                ? { ...buyer, potions: buyer.potions + 1 }
                : { ...buyer, carriedItems: [...(buyer.carriedItems ?? []), item.id] };
            const nextUnits = unitsRef.current.map((u) => (u.id === buyer.id ? updatedBuyer : u));
            const nextBench = unlockedAlliesRef.current.map((u) =>
              u.id === buyer.id ? updatedBuyer : u
            );
            unitsRef.current = nextUnits;
            unlockedAlliesRef.current = nextBench;
            setUnits(nextUnits);
            setUnlockedAllies(nextBench);
            const merged = mergeUnitsIntoSavedRoster(
              {
                ...cur,
                gold: cur.gold - item.price,
                totalShopPurchases: (cur.totalShopPurchases ?? 0) + 1,
              },
              [...nextBench, ...nextUnits]
            );
            commitSaveWithTitles(merged);
            return;
          }
          spawnFloatingText('Đầy túi → Gửi Kho!', buyer.x, buyer.y, '#fbbf24');
        }
      }

      const nextBag = { ...(cur.itemBag ?? {}) };
      nextBag[item.id] = (nextBag[item.id] ?? 0) + 1;
      commitSaveWithTitles({
        ...cur,
        gold: cur.gold - item.price,
        itemBag: nextBag,
        masterSeals: nextBag.master_seal ?? 0,
        totalShopPurchases: (cur.totalShopPurchases ?? 0) + 1,
      });
    },
    [commitSaveWithTitles, selectedUnitId, spawnFloatingText]
  );

  const handleSellWeapon = useCallback((weaponId: string) => {
    if (!isOutOfBattleRef.current) {
      soundEngine.cancel();
      return;
    }
    const cur = saveDataRef.current;
    const idx = cur.convoyWeaponIds.indexOf(weaponId);
    if (idx < 0) return;
    const w = WEAPONS[weaponId];
    if (!w) return;
    soundEngine.select();
    const nextConvoy = [...cur.convoyWeaponIds];
    nextConvoy.splice(idx, 1);
    const nextSave: CampaignSaveData = {
      ...cur,
      gold: (cur.gold ?? 0) + getWeaponSellPrice(w),
      convoyWeaponIds: nextConvoy,
    };
    saveDataRef.current = nextSave;
    saveCampaignData(nextSave);
    setSaveData(nextSave);
  }, []);

  const handleSellItem = useCallback((itemId: string) => {
    if (!isOutOfBattleRef.current) {
      soundEngine.cancel();
      return;
    }
    const cur = saveDataRef.current;
    const count = cur.itemBag?.[itemId] ?? 0;
    const item = ITEMS[itemId];
    if (count <= 0 || !item) return;
    soundEngine.select();
    const nextBag = { ...(cur.itemBag ?? {}) };
    nextBag[itemId] = count - 1;
    if (nextBag[itemId] <= 0) delete nextBag[itemId];
    const nextSave: CampaignSaveData = {
      ...cur,
      gold: (cur.gold ?? 0) + getItemSellPrice(item),
      itemBag: nextBag,
      masterSeals: nextBag.master_seal ?? 0,
    };
    saveDataRef.current = nextSave;
    saveCampaignData(nextSave);
    setSaveData(nextSave);
  }, []);

  // Contextual Action Menu options for currently moved ally
  const actionMenuOptions = useMemo<ActionMenuOption[] | null>(() => {
    if (subMode !== 'ACTION_MENU' || !selectedUnit) return null;
    const opts: ActionMenuOption[] = [];

    const enemiesInRange = units.filter(
      (u) =>
        u.faction === 'ENEMY' &&
        u.hp > 0 &&
        canUnitAttackAtDistance(selectedUnit, manhattan(selectedUnit, u))
    );
    const healableAllies = units.filter(
      (u) =>
        u.faction === 'PLAYER' &&
        u.hp > 0 &&
        u.id !== selectedUnit.id &&
        u.hp < u.stats.maxHp &&
        canUnitHealAtDistance(selectedUnit, manhattan(selectedUnit, u))
    );

    if (
      mapData.meta.objective === 'SEIZE' &&
      selectedUnit.isLord &&
      selectedUnit.x === mapData.throneCoord.x &&
      selectedUnit.y === mapData.throneCoord.y
    ) {
      opts.push({ id: 'SEIZE', label: 'Chiếm Cứ Điểm', shortcut: '1', accent: 'gold' });
    }

    if (enemiesInRange.length > 0) {
      opts.push({
        id: 'ATTACK',
        label: `Tấn Công (${enemiesInRange.length})`,
        sublabel: selectedUnit.weapon.name,
        shortcut: '1',
        accent: 'danger',
      });
    }

    // Active Combat Arts & AoE Magic Skills
    const activeSkills = getActiveSkills(selectedUnit);
    for (const skillId of activeSkills) {
      const sk = SKILLS[skillId];
      if (!sk || !canUnitUseSkill(selectedUnit, skillId)) continue;
      if (sk.aoeHeal) {
        const aoeTargets = getSanctuaryHealTargets(selectedUnit, units);
        if (aoeTargets.length > 0) {
          opts.push({
            id: `SKILL:${skillId}`,
            label: `${sk.name} (${aoeTargets.length})`,
            sublabel: `${sk.spCost ?? 0} SP · ${sk.shortDesc}`,
            shortcut: 'S',
            accent: 'skill',
          });
        }
      } else if (selectedUnit.weapon.type !== 'STAFF') {
        const skillTargets = units.filter(
          (u) =>
            u.faction === 'ENEMY' &&
            u.hp > 0 &&
            canUnitAttackAtDistance(selectedUnit, manhattan(selectedUnit, u), skillId)
        );
        if (skillTargets.length > 0) {
          opts.push({
            id: `SKILL:${skillId}`,
            label: `${sk.name} (${skillTargets.length})`,
            sublabel: `${sk.spCost ?? 0} SP · ${sk.shortDesc}`,
            shortcut: 'S',
            accent: 'skill',
          });
        }
      }
    }

    if (healableAllies.length > 0) {
      opts.push({
        id: 'HEAL',
        label: `Hồi Máu (${healableAllies.length})`,
        sublabel: selectedUnit.weapon.name,
        shortcut: '1',
        accent: 'heal',
      });
    }

    if (selectedUnit.potions > 0 && selectedUnit.hp < selectedUnit.stats.maxHp) {
      opts.push({
        id: 'POTION',
        label: `Dùng Thuốc (${selectedUnit.potions})`,
        shortcut: '2',
        accent: 'heal',
      });
    }

    // In-Map Shop Tile Detection (Tiệm Rèn Chiến Trường / Thương Nhân Bí Mật)
    const standingTerrain = mapData.grid[selectedUnit.y]?.[selectedUnit.x];
    const shopKindAtTile = standingTerrain ? TERRAIN_DATA[standingTerrain]?.shopKind : undefined;
    if (shopKindAtTile) {
      opts.push({
        id: 'SHOP',
        label:
          shopKindAtTile === 'IN_MAP_ARMORY'
            ? 'Vào Tiệm Rèn Chiến Trường'
            : 'Vào Thương Nhân Bí Mật',
        sublabel: 'Hàng hiếm thực địa (khác Quân Nhu)',
        shortcut: 'G',
        accent: 'gold',
      });
    }

    // Adjacent Ally Direct Trading (Manhattan distance === 1)
    const adjacentAllies = getAdjacentTradePartners(selectedUnit, units);
    if (adjacentAllies.length > 0) {
      opts.push({
        id: 'TRADE',
        label: `Trao Đổi Đồ (${adjacentAllies.length})`,
        sublabel: `Đứng cạnh: ${adjacentAllies.map((a) => a.name).join(', ')}`,
        shortcut: 'T',
        accent: 'heal',
      });
    }

    opts.push({
      id: 'EQUIP',
      label: 'Đổi Vũ Khí / Vật Phẩm',
      sublabel: selectedUnit.weapon.name,
      shortcut: 'C',
      accent: 'neutral',
    });

    const personalPromotionBag = getUnitCarriedItemCounts(selectedUnit);
    if (canPromoteUnit(selectedUnit, personalPromotionBag)) {
      opts.push({
        id: 'PROMOTE',
        label: `Tiến Hóa Bậc ${selectedUnit.tier + 1} ★`,
        sublabel: 'Đủ cấp & Ấn mang theo trong túi!',
        shortcut: 'U',
        accent: 'gold',
      });
    }

    opts.push({ id: 'WAIT', label: 'Chờ Tại Chỗ', shortcut: 'W', accent: 'neutral' });
    opts.push({ id: 'CANCEL', label: 'Quay Lại', shortcut: 'Esc', accent: 'neutral' });
    return opts;
  }, [subMode, selectedUnit, units, mapData.grid, mapData.meta.objective, mapData.throneCoord]);

  const handleActionMenuSelect = useCallback(
    (actionId: ActionMenuOption['id']) => {
      if (!selectedUnit) return;
      if (actionId === 'CANCEL') {
        cancelCurrentSelection();
        return;
      }
      if (actionId === 'TRADE') {
        const partners = getAdjacentTradePartners(selectedUnit, unitsRef.current);
        if (partners.length > 0) {
          soundEngine.select();
          setTradeModalState({ leftUnitId: selectedUnit.id, rightUnitId: partners[0].id });
        }
        return;
      }
      if (actionId === 'SHOP') {
        const standingTerrain = mapDataRef.current.grid[selectedUnit.y]?.[selectedUnit.x];
        const shopKindAtTile = standingTerrain ? TERRAIN_DATA[standingTerrain]?.shopKind : undefined;
        if (shopKindAtTile) {
          soundEngine.select();
          setActiveShopKind(shopKindAtTile);
        }
        return;
      }
      if (actionId === 'EQUIP' || actionId === 'PROMOTE') {
        soundEngine.select();
        setRosterFocusUnitId(selectedUnit.id);
        setRosterInitialTab(actionId === 'PROMOTE' ? 'PROMOTE' : 'WEAPONS');
        setRosterOpen(true);
        return;
      }
      if (actionId === 'SEIZE') {
        soundEngine.select();
        const updated = unitsRef.current.map((u) =>
          u.id === selectedUnit.id ? { ...u, acted: true } : u
        );
        finalizeUnitAction(updated, true);
        return;
      }
      if (actionId.startsWith('SKILL:')) {
        const skillId = actionId.slice(6) as SkillId;
        const skill = SKILLS[skillId];
        if (!skill || !canUnitUseSkill(selectedUnit, skillId)) return;

        if (skill.aoeHeal) {
          soundEngine.heal();
          const aoeTargets = getSanctuaryHealTargets(selectedUnit, unitsRef.current);
          const aoeSet = new Set(aoeTargets.map((t) => t.id));
          const healAmt = Math.max(10, Math.round(selectedUnit.stats.mag * 0.9 + 10));
          const { updatedUnit: leveledCaster, levelUp } = applyExpAndLevelUp(selectedUnit, 24);
          if (levelUp) showLevelUp(levelUp);
          const updated = unitsRef.current.map((u) => {
            if (u.id === selectedUnit.id) {
              const selfHeal = aoeSet.has(u.id) ? Math.min(healAmt, leveledCaster.stats.maxHp - u.hp) : 0;
              if (selfHeal > 0) spawnFloatingText(`+${selfHeal} HP`, u.x, u.y, '#34d399');
              return {
                ...leveledCaster,
                hp: Math.min(leveledCaster.stats.maxHp, u.hp + selfHeal),
                sp: Math.max(0, u.sp - (skill.spCost ?? 0)),
                acted: true,
              };
            }
            if (aoeSet.has(u.id)) {
              const actual = Math.min(healAmt, u.stats.maxHp - u.hp);
              if (actual > 0) spawnFloatingText(`+${actual} HP`, u.x, u.y, '#34d399');
              return { ...u, hp: u.hp + actual };
            }
            return u;
          });
          finalizeUnitAction(updated);
          return;
        }

        soundEngine.select();
        setSelectedActiveSkillId(skillId);
        const targets = unitsRef.current.filter(
          (u) =>
            u.faction === 'ENEMY' &&
            u.hp > 0 &&
            canUnitAttackAtDistance(selectedUnit, manhattan(selectedUnit, u), skillId)
        );
        if (targets.length === 1) {
          setForecastTargetId(targets[0].id);
          setCursor({ x: targets[0].x, y: targets[0].y });
          setSubMode('FORECAST');
        } else {
          setSubMode('TARGET_ATTACK');
          if (targets[0]) setCursor({ x: targets[0].x, y: targets[0].y });
        }
        return;
      }
      if (actionId === 'ATTACK') {
        soundEngine.select();
        setSelectedActiveSkillId(null);
        const targets = unitsRef.current.filter(
          (u) =>
            u.faction === 'ENEMY' &&
            u.hp > 0 &&
            canUnitAttackAtDistance(selectedUnit, manhattan(selectedUnit, u))
        );
        if (targets.length === 1) {
          setForecastTargetId(targets[0].id);
          setCursor({ x: targets[0].x, y: targets[0].y });
          setSubMode('FORECAST');
        } else {
          setSubMode('TARGET_ATTACK');
          if (targets[0]) setCursor({ x: targets[0].x, y: targets[0].y });
        }
        return;
      }
      if (actionId === 'HEAL') {
        soundEngine.select();
        setSelectedActiveSkillId(null);
        const targets = unitsRef.current.filter(
          (u) =>
            u.faction === 'PLAYER' &&
            u.hp > 0 &&
            u.id !== selectedUnit.id &&
            u.hp < u.stats.maxHp &&
            canUnitHealAtDistance(selectedUnit, manhattan(selectedUnit, u))
        );
        setSubMode('TARGET_HEAL');
        if (targets[0]) setCursor({ x: targets[0].x, y: targets[0].y });
        return;
      }
      if (actionId === 'POTION') {
        soundEngine.heal();
        const healAmt = 15;
        const updated = unitsRef.current.map((u) =>
          u.id === selectedUnit.id
            ? {
                ...u,
                hp: Math.min(u.stats.maxHp, u.hp + healAmt),
                potions: Math.max(0, u.potions - 1),
                acted: true,
              }
            : u
        );
        spawnFloatingText(`+${Math.min(healAmt, selectedUnit.stats.maxHp - selectedUnit.hp)} HP`, selectedUnit.x, selectedUnit.y, '#34d399');
        finalizeUnitAction(updated);
        return;
      }
      if (actionId === 'WAIT') {
        soundEngine.select();
        const updated = unitsRef.current.map((u) =>
          u.id === selectedUnit.id ? { ...u, acted: true } : u
        );
        finalizeUnitAction(updated);
      }
    },
    [selectedUnit, cancelCurrentSelection, finalizeUnitAction, spawnFloatingText, showLevelUp]
  );

  const handleConfirmAttack = useCallback(async () => {
    if (!selectedUnit || !forecastTargetId) return;
    const defender = unitsRef.current.find((u) => u.id === forecastTargetId && u.hp > 0);
    if (!defender) return;
    const skillId = selectedActiveSkillId;
    setForecastTargetId(null);
    setSelectedActiveSkillId(null);
    setSubMode('ANIMATING_MOVE');
    const updated = await executeCombatSequence(selectedUnit, defender, skillId);
    finalizeUnitAction(updated);
  }, [selectedUnit, forecastTargetId, selectedActiveSkillId, executeCombatSequence, finalizeUnitAction]);

  // Tile interaction handler (shared by Mouse Click and Keyboard Enter)
  const handleActivateTile = useCallback(
    async (tile: TileCoord) => {
      if (
        screen !== 'playing' ||
        phase !== 'PLAYER' ||
        dialogueState ||
        pendingCombat ||
        atlasOpen ||
        rosterOpen ||
        activeShopKind ||
        campOpen ||
        Boolean(tradeModalState)
      ) {
        return;
      }

      const unitAtTile = unitsRef.current.find((u) => u.hp > 0 && u.x === tile.x && u.y === tile.y);

      if (subMode === 'DEPLOYMENT') {
        const isSpawnSlot = mapData.playerSpawns.some((s) => s.x === tile.x && s.y === tile.y);
        setCursor(tile);
        if (!isSpawnSlot) {
          soundEngine.cursor();
          setSwapSourceCoord(null);
          return;
        }
        if (!swapSourceCoord) {
          if (unitAtTile && unitAtTile.faction === 'PLAYER') {
            soundEngine.select();
            setSwapSourceCoord(tile);
          } else {
            soundEngine.cursor();
          }
          return;
        }
        if (swapSourceCoord.x === tile.x && swapSourceCoord.y === tile.y) {
          soundEngine.cancel();
          setSwapSourceCoord(null);
          return;
        }
        const swapped = swapOrMoveDeploymentUnit(
          unitsRef.current,
          swapSourceCoord,
          tile,
          mapData.playerSpawns,
          mapData.grid
        );
        if (swapped.changed) {
          soundEngine.select();
          unitsRef.current = swapped.units;
          setUnits(swapped.units);
        } else {
          soundEngine.cancel();
        }
        setSwapSourceCoord(null);
        return;
      }

      if (subMode === 'IDLE') {
        if (unitAtTile && unitAtTile.faction === 'PLAYER' && !unitAtTile.acted) {
          soundEngine.select();
          setSelectedUnitId(unitAtTile.id);
          setSubMode('UNIT_SELECTED');
          setCursor(tile);
        } else {
          soundEngine.cursor();
          setCursor(tile);
        }
        return;
      }

      if (subMode === 'UNIT_SELECTED' && selectedUnit) {
        const key = `${tile.x},${tile.y}`;
        // Clicking another unmoved ally switches selection smoothly
        if (
          unitAtTile &&
          unitAtTile.faction === 'PLAYER' &&
          !unitAtTile.acted &&
          unitAtTile.id !== selectedUnit.id
        ) {
          soundEngine.select();
          setSelectedUnitId(unitAtTile.id);
          setCursor(tile);
          return;
        }

        // Direct click on enemy within attack range from an accessible tile: auto-move + open forecast!
        if (unitAtTile && unitAtTile.faction === 'ENEMY' && selectedUnit.weapon.type !== 'STAFF') {
          let bestStand: TileCoord | null = null;
          let bestDist = Infinity;
          for (const rk of reachableTiles.keys()) {
            const [rx, ry] = rk.split(',').map(Number);
            const pos = { x: rx, y: ry };
            if (canUnitAttackAtDistance(selectedUnit, manhattan(pos, tile))) {
              const d = manhattan({ x: selectedUnit.x, y: selectedUnit.y }, pos);
              if (d < bestDist) {
                bestDist = d;
                bestStand = pos;
              }
            }
          }
          if (bestStand) {
            soundEngine.select();
            const origin = { x: selectedUnit.x, y: selectedUnit.y };
            setPreMoveOrigin(origin);
            setSubMode('ANIMATING_MOVE');
            const path = findPath(selectedUnit, bestStand, mapData.grid, unitsRef.current);
            await animateUnitWalk(selectedUnit.id, path);
            const moved = unitsRef.current.map((u) =>
              u.id === selectedUnit.id ? { ...u, x: bestStand!.x, y: bestStand!.y } : u
            );
            unitsRef.current = moved;
            setUnits(moved);
            setCursor(tile);
            setForecastTargetId(unitAtTile.id);
            setSubMode('FORECAST');
            return;
          }
        }

        if (reachableTiles.has(key)) {
          soundEngine.select();
          const origin = { x: selectedUnit.x, y: selectedUnit.y };
          setPreMoveOrigin(origin);
          setSubMode('ANIMATING_MOVE');
          const path = findPath(selectedUnit, tile, mapData.grid, unitsRef.current);
          await animateUnitWalk(selectedUnit.id, path);
          const moved = unitsRef.current.map((u) =>
            u.id === selectedUnit.id ? { ...u, x: tile.x, y: tile.y } : u
          );
          unitsRef.current = moved;
          setUnits(moved);
          setCursor(tile);
          setSubMode('ACTION_MENU');
          return;
        }

        // Clicking outside reachable tiles deselects
        cancelCurrentSelection();
        return;
      }

      if (subMode === 'TARGET_ATTACK' && selectedUnit) {
        if (
          unitAtTile &&
          unitAtTile.faction === 'ENEMY' &&
          canUnitAttackAtDistance(selectedUnit, manhattan(selectedUnit, unitAtTile), selectedActiveSkillId)
        ) {
          soundEngine.select();
          setForecastTargetId(unitAtTile.id);
          setSubMode('FORECAST');
        } else {
          cancelCurrentSelection();
        }
        return;
      }

      if (subMode === 'TARGET_HEAL' && selectedUnit) {
        if (
          unitAtTile &&
          unitAtTile.faction === 'PLAYER' &&
          unitAtTile.id !== selectedUnit.id &&
          unitAtTile.hp < unitAtTile.stats.maxHp &&
          canUnitHealAtDistance(selectedUnit, manhattan(selectedUnit, unitAtTile))
        ) {
          soundEngine.heal();
          const curWeather = getWeatherForTurn(mapDataRef.current.meta.weather, turnRef.current);
          const amount = getHealAmount(selectedUnit, curWeather, saveDataRef.current.commanderTitleId);
          const actualHeal = Math.min(amount, unitAtTile.stats.maxHp - unitAtTile.hp);
          const { updatedUnit: leveledHealer, levelUp } = applyExpAndLevelUp(selectedUnit, 22);
          if (levelUp) showLevelUp(levelUp);
          const updated = unitsRef.current.map((u) => {
            if (u.id === unitAtTile.id) return { ...u, hp: u.hp + actualHeal };
            if (u.id === selectedUnit.id) return { ...leveledHealer, acted: true };
            return u;
          });
          spawnFloatingText(`+${actualHeal} HP`, unitAtTile.x, unitAtTile.y, '#34d399');
          finalizeUnitAction(updated);
        } else {
          cancelCurrentSelection();
        }
      }
    },
    [
      screen,
      phase,
      dialogueState,
      pendingCombat,
      atlasOpen,
      rosterOpen,
      activeShopKind,
      campOpen,
      tradeModalState,
      subMode,
      swapSourceCoord,
      mapData.playerSpawns,
      selectedUnit,
      selectedActiveSkillId,
      reachableTiles,
      mapData.grid,
      animateUnitWalk,
      cancelCurrentSelection,
      finalizeUnitAction,
      showLevelUp,
      spawnFloatingText,
    ]
  );

  // Cycle to next unmoved ally [Tab]
  const handleCycleAlly = useCallback(() => {
    if (phase !== 'PLAYER' || subMode === 'ANIMATING_MOVE') return;
    const unmoved = unitsRef.current.filter((u) => u.faction === 'PLAYER' && u.hp > 0 && !u.acted);
    if (unmoved.length === 0) return;
    const curIdx = unmoved.findIndex((u) => u.id === selectedUnitId);
    const next = unmoved[(curIdx + 1) % unmoved.length];
    soundEngine.select();
    if (subMode === 'ACTION_MENU' && selectedUnitId && preMoveOrigin) {
      const reverted = unitsRef.current.map((u) =>
        u.id === selectedUnitId ? { ...u, x: preMoveOrigin.x, y: preMoveOrigin.y } : u
      );
      unitsRef.current = reverted;
      setUnits(reverted);
      setPreMoveOrigin(null);
    }
    setSelectedUnitId(next.id);
    setSubMode('UNIT_SELECTED');
    setCursor({ x: next.x, y: next.y });
  }, [phase, subMode, selectedUnitId, preMoveOrigin]);

  const handleUpdateSettings = useCallback((patch: Partial<GameSettings>) => {
    setSaveData((prev) => {
      const next: CampaignSaveData = {
        ...prev,
        settings: { ...prev.settings, ...patch },
      };
      soundEngine.setMuted(next.settings.muted);
      saveCampaignData(next);
      return next;
    });
  }, []);

  // Unified PC x86 Keyboard Handler (Title Enter/Space, Tactical WASD/Arrows/Enter/Esc/Tab/R/E/P/M)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Modal stack Escape handling (TradeModal -> Roster / Shop / Atlas -> CampHub)
      if (tradeModalState) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setTradeModalState(null);
        }
        return;
      }

      if (atlasOpen || rosterOpen || activeShopKind) {
        if (
          e.key === 'Escape' ||
          (rosterOpen && e.key.toLowerCase() === 'c') ||
          (activeShopKind && e.key.toLowerCase() === 'b')
        ) {
          e.preventDefault();
          setAtlasOpen(false);
          setRosterOpen(false);
          setActiveShopKind(null);
        }
        return;
      }

      if (campOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setCampOpen(false);
        }
        return;
      }

      // Title screen start handshake (Enter / Space) & Doanh Trại shortcut [D]
      if (screen === 'title') {
        if (e.key.toLowerCase() === 'd') {
          e.preventDefault();
          handleOpenCampHub();
          return;
        }
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const hasSaved = saveData.highestReachedMap > 1 || saveData.clearedMaps.length > 0;
          startBattleMap(hasSaved ? saveData.currentMapId : 1, saveData, false);
        }
        return;
      }

      if (screen === 'paused') {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
          e.preventDefault();
          setScreen('playing');
        }
        return;
      }

      if (screen !== 'playing' || dialogueState || pendingCombat) return;

      const key = e.key.toLowerCase();

      if (key === 'c') {
        e.preventDefault();
        setRosterFocusUnitId(selectedUnitId ?? null);
        setRosterInitialTab('FORGE');
        setRosterOpen(true);
        return;
      }

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomChange(0.2);
        return;
      }

      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomChange(-0.2);
        return;
      }

      if (e.key === '0') {
        e.preventDefault();
        handleZoomReset();
        return;
      }

      if (key === 'm') {
        e.preventDefault();
        handleUpdateSettings({ muted: !saveData.settings.muted });
        return;
      }

      if (key === 'p') {
        e.preventDefault();
        setScreen('paused');
        return;
      }

      if (key === 'r') {
        e.preventDefault();
        setShowDangerZone((v) => !v);
        return;
      }

      if (phase !== 'PLAYER' || subMode === 'ANIMATING_MOVE') return;

      if (subMode === 'DEPLOYMENT') {
        if (e.key === ' ') {
          e.preventDefault();
          handleConfirmDeployment();
          return;
        }
        if (key === '1') {
          e.preventDefault();
          handleSelectFormation('BALANCED');
          return;
        }
        if (key === '2') {
          e.preventDefault();
          handleSelectFormation('PHALANX');
          return;
        }
        if (key === '3') {
          e.preventDefault();
          handleSelectFormation('SPEARHEAD');
          return;
        }
        if (key === '4') {
          e.preventDefault();
          handleSelectFormation('PINCER');
          return;
        }
        if (e.key === 'Escape' || key === 'x') {
          e.preventDefault();
          if (swapSourceCoord) {
            soundEngine.cancel();
            setSwapSourceCoord(null);
          } else {
            setScreen('paused');
          }
          return;
        }
      }

      if (key === 'tab' && subMode !== 'DEPLOYMENT') {
        e.preventDefault();
        handleCycleAlly();
        return;
      }

      if (key === 'e' && subMode === 'IDLE') {
        e.preventDefault();
        void runEnemyPhase();
        return;
      }

      if ((e.key === 'Escape' || key === 'x') && subMode !== 'DEPLOYMENT') {
        e.preventDefault();
        if (subMode === 'IDLE') {
          setScreen('paused');
        } else {
          cancelCurrentSelection();
        }
        return;
      }

      if (subMode === 'FORECAST') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          void handleConfirmAttack();
        }
        return;
      }

      if (subMode === 'ACTION_MENU' && actionMenuOptions) {
        if (key === 't') {
          const tradeOpt = actionMenuOptions.find((o) => o.id === 'TRADE');
          if (tradeOpt) {
            e.preventDefault();
            handleActionMenuSelect('TRADE');
          }
        } else if (key === 'g') {
          const shopOpt = actionMenuOptions.find((o) => o.id === 'SHOP');
          if (shopOpt) {
            e.preventDefault();
            handleActionMenuSelect('SHOP');
          }
        } else if (key === 'w') {
          e.preventDefault();
          handleActionMenuSelect('WAIT');
        } else if (key === '1') {
          e.preventDefault();
          const first = actionMenuOptions[0];
          if (first) handleActionMenuSelect(first.id);
        } else if (key === '2') {
          e.preventDefault();
          const pot = actionMenuOptions.find((o) => o.id === 'POTION');
          if (pot) handleActionMenuSelect('POTION');
        }
        return;
      }

      // WASD / Arrow Keys move tactical cursor
      let dx = 0;
      let dy = 0;
      if (key === 'w' || e.key === 'ArrowUp') dy = -1;
      else if (key === 's' || e.key === 'ArrowDown') dy = 1;
      else if (key === 'a' || e.key === 'ArrowLeft') dx = -1;
      else if (key === 'd' || e.key === 'ArrowRight') dx = 1;

      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        soundEngine.cursor();
        setCursor((c) => ({
          x: Math.max(0, Math.min(mapData.width - 1, c.x + dx)),
          y: Math.max(0, Math.min(mapData.height - 1, c.y + dy)),
        }));
        return;
      }

      if (e.key === 'Enter' || key === 'z') {
        e.preventDefault();
        void handleActivateTile(cursor);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    screen,
    atlasOpen,
    rosterOpen,
    activeShopKind,
    campOpen,
    tradeModalState,
    selectedUnitId,
    saveData,
    dialogueState,
    pendingCombat,
    phase,
    subMode,
    swapSourceCoord,
    actionMenuOptions,
    cursor,
    mapData.width,
    mapData.height,
    startBattleMap,
    handleOpenCampHub,
    handleZoomChange,
    handleZoomReset,
    handleConfirmDeployment,
    handleSelectFormation,
    handleUpdateSettings,
    handleCycleAlly,
    runEnemyPhase,
    cancelCurrentSelection,
    handleConfirmAttack,
    handleActionMenuSelect,
    handleActivateTile,
  ]);

  // Canvas pointer, wheel zoom, drag-pan & minimap jump handlers using live getBoundingClientRect()
  const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (
      screen !== 'playing' ||
      dialogueState ||
      pendingCombat ||
      atlasOpen ||
      rosterOpen ||
      activeShopKind ||
      campOpen ||
      Boolean(tradeModalState)
    ) {
      return;
    }
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    const next = boardRendererRef.current.adjustZoom(delta);
    setZoomLevel(next);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    dragPanRef.current = {
      down: true,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      moved: false,
    };
  };

  const handleCanvasMouseUp = () => {
    dragPanRef.current.down = false;
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (
      screen !== 'playing' ||
      dialogueState ||
      pendingCombat ||
      atlasOpen ||
      rosterOpen ||
      activeShopKind ||
      campOpen ||
      Boolean(tradeModalState)
    ) {
      return;
    }

    if (dragPanRef.current.down && boardRendererRef.current.getZoomLevel() > 1.01) {
      const dist = Math.hypot(
        e.clientX - dragPanRef.current.startX,
        e.clientY - dragPanRef.current.startY
      );
      if (dist > 6 || dragPanRef.current.moved) {
        dragPanRef.current.moved = true;
        const dx = e.clientX - dragPanRef.current.lastX;
        const dy = e.clientY - dragPanRef.current.lastY;
        dragPanRef.current.lastX = e.clientX;
        dragPanRef.current.lastY = e.clientY;
        boardRendererRef.current.panByScreenDelta(-dx, -dy);
        return;
      }
    }

    if (phase !== 'PLAYER') return;
    if (subMode === 'ACTION_MENU' || subMode === 'FORECAST' || subMode === 'ANIMATING_MOVE') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const tile = boardRendererRef.current.screenToTile(
      e.clientX,
      e.clientY,
      canvas.getBoundingClientRect()
    );
    if (tile && (tile.x !== cursor.x || tile.y !== cursor.y)) {
      setCursor(tile);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragPanRef.current.moved) {
      dragPanRef.current.moved = false;
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    // Check tactical Corner Minimap click first (instant camera & cursor jump across Large/Colossal maps!)
    const miniTile = boardRendererRef.current.minimapScreenToTile(e.clientX, e.clientY, rect);
    if (miniTile) {
      soundEngine.cursor();
      setCursor(miniTile);
      boardRendererRef.current.centerCameraOnTile(miniTile);
      return;
    }

    const tile = boardRendererRef.current.screenToTile(e.clientX, e.clientY, rect);
    if (tile) {
      void handleActivateTile(tile);
    }
  };

  const handleCanvasContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (subMode === 'DEPLOYMENT' && swapSourceCoord) {
      soundEngine.cancel();
      setSwapSourceCoord(null);
      return;
    }
    if (subMode !== 'IDLE' && subMode !== 'DEPLOYMENT' && phase === 'PLAYER') {
      cancelCurrentSelection();
    }
  };

  const aliveAllies = units.filter((u) => u.faction === 'PLAYER' && u.hp > 0);
  const unmovedAllies = aliveAllies.filter((u) => !u.acted);
  const aliveEnemies = units.filter((u) => u.faction === 'ENEMY' && u.hp > 0);
  const hasPromotableAlly = isOutOfBattle
    ? aliveAllies.some((u) => canPromoteUnit(u, saveData.itemBag)) ||
      unlockedAllies.some((u) => canPromoteUnit(u, saveData.itemBag))
    : aliveAllies.some((u) => canPromoteUnit(u, getUnitCarriedItemCounts(u)));

  const swapSourceUnit = useMemo(() => {
    if (!swapSourceCoord) return null;
    return (
      aliveAllies.find((u) => u.x === swapSourceCoord.x && u.y === swapSourceCoord.y) ?? null
    );
  }, [aliveAllies, swapSourceCoord]);

  const rosterModalUnits = useMemo(() => {
    if (!isFreeLogistics) {
      // During active battlefield turns, only deployed field allies are present (no bench heroes at camp)
      return [...aliveAllies, ...aliveEnemies];
    }
    const deployedIds = new Set(aliveAllies.map((u) => u.id));
    const benchOnly = unlockedAllies.filter((u) => !deployedIds.has(u.id));
    return [...aliveAllies, ...benchOnly, ...aliveEnemies];
  }, [isFreeLogistics, aliveAllies, unlockedAllies, aliveEnemies]);

  const activeTradeUnits = useMemo(() => {
    if (!tradeModalState) return null;
    const pool = isFreeLogistics ? unlockedAllies : aliveAllies;
    const left = pool.find((u) => u.id === tradeModalState.leftUnitId);
    if (!left) return null;
    const eligiblePartners = isFreeLogistics
      ? pool.filter((u) => u.id !== left.id)
      : getAdjacentTradePartners(left, aliveAllies);
    const right =
      eligiblePartners.find((u) => u.id === tradeModalState.rightUnitId) ??
      eligiblePartners[0];
    if (!right) return null;
    return { left, right, eligiblePartners };
  }, [tradeModalState, isFreeLogistics, unlockedAllies, aliveAllies]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0b0e14]">
      {screen === 'title' ? (
        <TitleScreen
          saveData={saveData}
          onStartNew={() => {
            const fresh = { ...createFreshSave(), settings: saveData.settings };
            saveCampaignData(fresh);
            setSaveData(fresh);
            startBattleMap(1, fresh, false);
          }}
          onContinue={() => startBattleMap(saveData.currentMapId || 1, saveData, false)}
          onOpenCamp={() => handleOpenCampHub('BARRACKS')}
          onOpenAtlas={() => setAtlasOpen(true)}
        />
      ) : (
        <div
          ref={canvasContainerRef}
          className="relative w-full h-full overflow-hidden"
        >
          {/* Dedicated isolated 60fps Modern Pixel-Art Battlefield Canvas */}
          <canvas
            ref={canvasRef}
            data-testid="tactical-canvas"
            onWheel={handleCanvasWheel}
            onMouseDown={handleCanvasMouseDown}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onMouseMove={handleCanvasMouseMove}
            onClick={handleCanvasClick}
            onContextMenu={handleCanvasContextMenu}
            className="block w-full h-full pixel-art cursor-crosshair"
          />

          {/* World-matched Perimeter HUD (hidden during StoryDialogue for clean narrative framing) */}
          {!dialogueState && (
            <TacticalHUD
              meta={mapData.meta}
              turn={turn}
              phase={phase}
              gold={saveData.gold ?? 2500}
              aliveAlliesCount={aliveAllies.length}
              unmovedAlliesCount={unmovedAllies.length}
              aliveEnemiesCount={aliveEnemies.length}
              hasPromotableAlly={hasPromotableAlly}
              inspectedUnit={inspectedUnit}
              hoveredTerrain={hoveredTerrain}
              cursor={cursor}
              showDangerZone={showDangerZone}
              muted={saveData.settings.muted}
              actionMenuOptions={actionMenuOptions}
              forecastData={forecastData}
              phaseBanner={phaseBanner}
              promotionToast={promotionToast}
              activeWeather={activeWeather}
              commanderTitleId={commanderTitleId}
              titleUnlockedToast={titleUnlockedToast}
              weatherShiftToast={weatherShiftToast}
              lootDropToast={lootDropToast}
              isDeployment={subMode === 'DEPLOYMENT'}
              zoomLevel={zoomLevel}
              onZoomChange={handleZoomChange}
              onZoomReset={handleZoomReset}
              onConfirmDeployment={handleConfirmDeployment}
              onActionMenuSelect={handleActionMenuSelect}
              onConfirmAttack={() => void handleConfirmAttack()}
              onCancelForecast={cancelCurrentSelection}
              onToggleDangerZone={() => setShowDangerZone((v) => !v)}
              onCycleAlly={handleCycleAlly}
              onEndTurn={() => void runEnemyPhase()}
              onOpenRoster={(unitId) => {
                setRosterFocusUnitId(unitId ?? selectedUnitId ?? null);
                setRosterInitialTab('FORGE');
                setRosterOpen(true);
              }}
              onOpenAtlas={() => setAtlasOpen(true)}
              onToggleMute={() => handleUpdateSettings({ muted: !saveData.settings.muted })}
              onPause={() => setScreen('paused')}
            />
          )}

          {/* Pre-Battle Troop Arrangement, Squad Selection & Formation Presets Dock */}
          {!dialogueState && subMode === 'DEPLOYMENT' && (
            <DeploymentPrepBar
              meta={mapData.meta}
              unlockedAllies={unlockedAllies}
              deployedAllies={aliveAllies}
              enemies={aliveEnemies}
              commanderTitleId={commanderTitleId}
              activeFormation={activeFormation}
              swapSourceUnit={swapSourceUnit}
              onToggleHeroDeploy={handleToggleHeroDeploy}
              onSelectFormation={handleSelectFormation}
              onOpenRoster={() => {
                setRosterFocusUnitId(selectedUnitId ?? null);
                setRosterInitialTab('FORGE');
                setRosterOpen(true);
              }}
              onReturnToCamp={() => handleOpenCampHub('CONVOY')}
              onConfirmDeployment={handleConfirmDeployment}
            />
          )}
        </div>
      )}

      {/* Pre-battle / Post-battle Continuous Story Dialogue */}
      {screen === 'playing' && dialogueState && (
        <StoryDialogue
          meta={mapData.meta}
          mode={dialogueState.mode}
          lines={
            dialogueState.mode === 'INTRO'
              ? mapData.meta.introDialogue
              : mapData.meta.outroDialogue
          }
          onComplete={dialogueState.onDone}
        />
      )}

      {/* Animated Modern Pixel Combat Cutscene */}
      {pendingCombat && (
        <CombatCutscene
          attacker={pendingCombat.attacker}
          defender={pendingCombat.defender}
          biome={mapData.meta.biome}
          resolution={pendingCombat.resolution}
          fastMode={saveData.settings.fastMode}
          onFinish={pendingCombat.onComplete}
        />
      )}

      {/* Pause Modal */}
      {screen === 'paused' && (
        <PauseModal
          meta={mapData.meta}
          settings={saveData.settings}
          onResume={() => setScreen('playing')}
          onRestartMap={() => startBattleMap(mapData.meta.id, saveData, true)}
          onUpdateSettings={handleUpdateSettings}
          onReturnTitle={() => {
            enemyTurnAbortRef.current += 1;
            setDialogueState(null);
            setPendingCombat(null);
            setScreen('title');
          }}
        />
      )}

      {/* Victory / Defeat Modal */}
      {screen === 'gameover' && outcomeSnapshot && (
        <OutcomeModal
          outcome={outcomeSnapshot.outcome}
          reason={outcomeSnapshot.reason}
          meta={mapData.meta}
          turnsTaken={outcomeSnapshot.turnsTaken}
          enemiesDefeated={outcomeSnapshot.enemiesDefeated}
          alliesRemaining={outcomeSnapshot.alliesRemaining}
          totalAllies={outcomeSnapshot.totalAllies}
          clearedMapsCount={outcomeSnapshot.clearedMapsCount}
          goldEarned={outcomeSnapshot.goldEarned}
          rewardNotes={outcomeSnapshot.rewardNotes}
          onNextMap={() =>
            startBattleMap(Math.min(200, mapData.meta.id + 1), saveData, false)
          }
          onRetryMap={() => startBattleMap(mapData.meta.id, saveData, true)}
          onOpenCampConvoy={() => handleOpenCampHub('CONVOY')}
          onOpenCampShop={() => setActiveShopKind('CAMP_BAZAAR')}
          onOpenAtlas={() => setAtlasOpen(true)}
          onReturnTitle={() => {
            setOutcomeSnapshot(null);
            setScreen('title');
          }}
        />
      )}

      {/* Out-of-Battle Doanh Trại Liên Quân Hub (Hero Conversations, Sparring, Trade & Dedicated Kho Quân Đoàn) */}
      {screen === 'title' && campOpen && (
        <CampHubModal
          saveData={saveData}
          campUnits={unlockedAllies}
          commanderTitleId={commanderTitleId}
          initialTab={campInitialTab}
          onTradeWeapon={handleTradeWeapon}
          onEquipPersonalWeapon={handleEquipPersonalWeapon}
          onTradeArmorSlot={handleTradeArmorSlot}
          onTradePotion={handleTradePotion}
          onTradePersonalItem={handleTradePersonalItem}
          onTradeCarriedArmor={handleTradeCarriedArmor}
          onStoreWeaponToConvoy={handleStoreWeaponToConvoy}
          onWithdrawConvoyWeapon={handleWithdrawConvoyWeapon}
          onStorePotionToConvoy={handleStorePotionToConvoy}
          onWithdrawPotionFromConvoy={handleWithdrawPotionFromConvoy}
          onStorePersonalItemToConvoy={handleStorePersonalItemToConvoy}
          onWithdrawItemFromConvoy={handleWithdrawItemFromConvoy}
          onStoreCarriedArmorToConvoy={handleStoreCarriedArmorToConvoy}
          onWithdrawArmorToPack={handleWithdrawArmorToPack}
          onEquipConvoyArmor={handleEquipArmor}
          onUnequipWornArmorToConvoy={handleUnequipArmor}
          onSparTrainUnit={handleSparTrainUnit}
          onTogglePreferredSquadHero={handleTogglePreferredSquadHero}
          onSelectPreferredFormation={handleSelectPreferredFormation}
          onOpenRosterModal={(unitId, tab) => {
            setRosterFocusUnitId(unitId ?? null);
            setRosterInitialTab(tab ?? 'FORGE');
            setRosterOpen(true);
          }}
          onOpenCampShop={() => setActiveShopKind('CAMP_BAZAAR')}
          onDeployCurrentMap={() => {
            setCampOpen(false);
            startBattleMap(saveData.currentMapId || saveData.highestReachedMap || 1, saveData, false);
          }}
          onClose={() => setCampOpen(false)}
        />
      )}

      {/* Adjacent Tactical In-Battle Item & Equipment Trade Modal (strictly 2-unit personal items, no Convoy) */}
      {activeTradeUnits && (
        <TradeModal
          leftUnit={activeTradeUnits.left}
          rightUnit={activeTradeUnits.right}
          availableRightUnits={activeTradeUnits.eligiblePartners}
          onSelectRightUnit={(partnerId) =>
            setTradeModalState((cur) => (cur ? { ...cur, rightUnitId: partnerId } : null))
          }
          isFreeLogistics={isFreeLogistics}
          commanderTitleId={commanderTitleId}
          equipmentBag={saveData.equipmentBag ?? []}
          onTradeWeapon={handleTradeWeapon}
          onEquipPersonalWeapon={handleEquipPersonalWeapon}
          onTradeArmorSlot={handleTradeArmorSlot}
          onTradePotion={handleTradePotion}
          onTradePersonalItem={handleTradePersonalItem}
          onTradeCarriedArmor={handleTradeCarriedArmor}
          onClose={() => setTradeModalState(null)}
        />
      )}

      {/* Roster, Armory, Dedicated Kho Quân Đoàn, 6-Slot Equipment Forge, Items, Skills, 3-Stage Evolution, Titles & Codex */}
      {rosterOpen && (
        <RosterArmoryModal
          units={rosterModalUnits}
          deployedUnits={aliveAllies}
          isFreeLogistics={isFreeLogistics}
          isOutOfBattle={isOutOfBattle}
          gold={saveData.gold ?? 3000}
          itemBag={saveData.itemBag ?? {}}
          convoyWeaponIds={saveData.convoyWeaponIds}
          equipmentBag={saveData.equipmentBag ?? []}
          weaponForges={saveData.weaponForges ?? {}}
          unlockedTitleIds={saveData.unlockedTitleIds ?? []}
          commanderTitleId={commanderTitleId}
          initialSelectedUnitId={rosterFocusUnitId}
          initialTab={rosterInitialTab}
          onEquipWeapon={handleEquipWeapon}
          onEquipArmor={handleEquipArmor}
          onUnequipArmor={handleUnequipArmor}
          onTemperArmor={handleTemperArmor}
          onLevelUpArmor={handleLevelUpArmor}
          onSocketArmorGem={handleSocketArmorGem}
          onUnsocketArmorGem={handleUnsocketArmorGem}
          onFuseArmor={handleFuseArmor}
          onTemperWeapon={handleTemperWeapon}
          onLevelUpWeapon={handleLevelUpWeapon}
          onSocketWeaponGem={handleSocketWeaponGem}
          onUnsocketWeaponGem={handleUnsocketWeaponGem}
          onFuseWeapon={handleFuseWeapon}
          onUseItem={handleUseItem}
          onPromoteUnit={handlePromoteUnit}
          onEquipHeroTitle={handleEquipHeroTitle}
          onEquipCommanderTitle={handleEquipCommanderTitle}
          onReclassUnit={handleReclassUnit}
          onOpenTradeWithPartner={(unitId, partnerId) => {
            setRosterOpen(false);
            setTradeModalState({ leftUnitId: unitId, rightUnitId: partnerId });
          }}
          onStoreWeaponToConvoy={handleStoreWeaponToConvoy}
          onWithdrawConvoyWeapon={handleWithdrawConvoyWeapon}
          onStorePotionToConvoy={handleStorePotionToConvoy}
          onWithdrawPotionFromConvoy={handleWithdrawPotionFromConvoy}
          onStorePersonalItemToConvoy={handleStorePersonalItemToConvoy}
          onWithdrawItemFromConvoy={handleWithdrawItemFromConvoy}
          onStoreCarriedArmorToConvoy={handleStoreCarriedArmorToConvoy}
          onWithdrawArmorToPack={handleWithdrawArmorToPack}
          onOpenShop={
            isOutOfBattle
              ? () => {
                  setRosterOpen(false);
                  setActiveShopKind('CAMP_BAZAAR');
                }
              : undefined
          }
          onClose={() => setRosterOpen(false)}
        />
      )}

      {/* Out-of-Map Camp Bazaar & In-Map Battlefield Shops (Armory / Secret Vendor) */}
      {activeShopKind && (
        <ShopModal
          kind={activeShopKind}
          mapId={screen === 'title' ? saveData.currentMapId || 1 : mapData.meta.id}
          biome={mapData.meta.biome}
          gold={saveData.gold ?? 3000}
          convoyWeaponIds={saveData.convoyWeaponIds}
          equipmentBag={saveData.equipmentBag ?? []}
          itemBag={saveData.itemBag ?? {}}
          onBuyWeapon={handleBuyWeapon}
          onBuyArmor={handleBuyArmor}
          onBuyItem={handleBuyItem}
          onSellWeapon={handleSellWeapon}
          onSellItem={handleSellItem}
          onClose={() => setActiveShopKind(null)}
        />
      )}

      {/* 10-Act / 120-Map Campaign Chronicle Atlas */}
      {atlasOpen && (
        <CampaignAtlasModal
          saveData={saveData}
          currentMapId={mapData.meta.id}
          onSelectMap={(mapId) => {
            setAtlasOpen(false);
            startBattleMap(mapId, saveData, false);
          }}
          onImportSave={(imported) => {
            saveCampaignData(imported);
            setSaveData(imported);
            soundEngine.setMuted(imported.settings.muted);
          }}
          onClose={() => setAtlasOpen(false)}
        />
      )}
      {/* Animated Level-Up Celebration Banner with Pixel Particle Burst (renders above battlefield & modals) */}
      {levelUpToast && (
        <LevelUpToast
          key={`${levelUpToast.unitId}-${levelUpToast.newLevel}`}
          levelUp={levelUpToast}
          unit={rosterModalUnits.find((u) => u.id === levelUpToast.unitId) ?? null}
        />
      )}
    </div>
  );
}
