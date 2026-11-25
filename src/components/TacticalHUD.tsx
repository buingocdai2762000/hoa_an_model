import {
  Award,
  CloudFog,
  CloudLightning,
  CloudRain,
  Coins,
  Crown,
  Crosshair,
  Flame,
  Map as MapIcon,
  Minus,
  Pause,
  Play,
  Plus,
  ShieldAlert,
  SkipForward,
  Snowflake,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
  Wind,
} from 'lucide-react';
import { getMapScaleLabel, getObjectiveLabel } from '../game/campaignData';
import {
  getTurnsUntilWeatherShift,
  MAGIC_ELEMENT_LABEL,
  PORTRAIT_ASSETS,
  SKILLS,
  TERRAIN_DATA,
  TITLE_RARITY_META,
  TITLES,
  WEAPON_TYPE_LABEL,
  WEATHER_DATA,
} from '../game/data';
import {
  getEffectiveUnitStats,
  getUnitCarryCount,
  MAX_UNIT_CARRY_SLOTS,
} from '../game/engine';
import { getUnitPortraitDataUrl } from '../game/pixelSprites';
import type {
  BattleLootDrop,
  CampaignMapMeta,
  CombatForecast,
  PromotionResult,
  SkillId,
  TerrainType,
  TileCoord,
  TitleDef,
  Unit,
  WeatherType,
} from '../game/types';

export type ActionMenuOption = {
  id:
    | 'ATTACK'
    | 'HEAL'
    | 'POTION'
    | 'TRADE'
    | 'SEIZE'
    | 'SHOP'
    | 'WAIT'
    | 'CANCEL'
    | 'EQUIP'
    | 'PROMOTE'
    | `SKILL:${SkillId}`;
  label: string;
  sublabel?: string;
  shortcut: string;
  accent?: 'danger' | 'heal' | 'gold' | 'skill' | 'neutral';
};

interface TacticalHUDProps {
  meta: CampaignMapMeta;
  turn: number;
  phase: 'PLAYER' | 'ENEMY';
  gold: number;
  aliveAlliesCount: number;
  unmovedAlliesCount: number;
  aliveEnemiesCount: number;
  hasPromotableAlly: boolean;
  inspectedUnit: Unit | null;
  hoveredTerrain: TerrainType;
  cursor: TileCoord;
  showDangerZone: boolean;
  muted: boolean;
  actionMenuOptions: ActionMenuOption[] | null;
  forecastData: {
    attacker: Unit;
    defender: Unit;
    forecast: CombatForecast;
  } | null;
  phaseBanner: string | null;
  promotionToast: PromotionResult | null;
  activeWeather: WeatherType;
  commanderTitleId: string;
  titleUnlockedToast: TitleDef | null;
  weatherShiftToast: WeatherType | null;
  lootDropToast?: BattleLootDrop | null;
  isDeployment: boolean;
  zoomLevel: number;
  onZoomChange: (delta: number) => void;
  onZoomReset: () => void;
  onConfirmDeployment: () => void;
  onActionMenuSelect: (id: ActionMenuOption['id']) => void;
  onConfirmAttack: () => void;
  onCancelForecast: () => void;
  onToggleDangerZone: () => void;
  onCycleAlly: () => void;
  onEndTurn: () => void;
  onOpenRoster: (unitId?: string) => void;
  onOpenAtlas: () => void;
  onToggleMute: () => void;
  onPause: () => void;
}

function WeatherGlyph({ weather, className }: { weather: WeatherType; className?: string }) {
  switch (weather) {
    case 'RAIN':
      return <CloudRain className={className} />;
    case 'STORM':
      return <CloudLightning className={className} />;
    case 'SUNLIGHT':
      return <Sun className={className} />;
    case 'SNOW':
      return <Snowflake className={className} />;
    case 'MIST':
      return <CloudFog className={className} />;
    case 'EMBERS':
      return <Flame className={className} />;
    case 'SPARKS':
      return <Sparkles className={className} />;
    case 'SAND':
    case 'LEAVES':
    default:
      return <Wind className={className} />;
  }
}

export function TacticalHUD({
  meta,
  turn,
  phase,
  gold,
  aliveAlliesCount,
  unmovedAlliesCount,
  aliveEnemiesCount,
  hasPromotableAlly,
  inspectedUnit,
  hoveredTerrain,
  cursor,
  showDangerZone,
  muted,
  actionMenuOptions,
  forecastData,
  phaseBanner,
  promotionToast,
  activeWeather,
  commanderTitleId,
  titleUnlockedToast,
  weatherShiftToast,
  lootDropToast,
  isDeployment,
  zoomLevel,
  onZoomChange,
  onZoomReset,
  onConfirmDeployment,
  onActionMenuSelect,
  onConfirmAttack,
  onCancelForecast,
  onToggleDangerZone,
  onCycleAlly,
  onEndTurn,
  onOpenRoster,
  onOpenAtlas,
  onToggleMute,
  onPause,
}: TacticalHUDProps) {
  const terrainInfo = TERRAIN_DATA[hoveredTerrain];
  const weatherInfo = WEATHER_DATA[activeWeather] ?? WEATHER_DATA.NONE;
  const turnsUntilShift = getTurnsUntilWeatherShift(turn);
  const inspectedPortraitUrl = inspectedUnit
    ? (inspectedUnit.portraitKey && PORTRAIT_ASSETS[inspectedUnit.portraitKey]) ||
      PORTRAIT_ASSETS[inspectedUnit.templateId] ||
      getUnitPortraitDataUrl(inspectedUnit)
    : '';
  const inspectedEffStats = inspectedUnit
    ? getEffectiveUnitStats(inspectedUnit, commanderTitleId)
    : null;
  const inspectedTitle =
    inspectedUnit?.faction === 'PLAYER' && inspectedUnit.equippedTitleId
      ? TITLES[inspectedUnit.equippedTitleId]
      : null;
  const commanderTitle = commanderTitleId ? TITLES[commanderTitleId] : null;

  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between">
      {/* TOP PERIMETER BATTLEFIELD RIBBON */}
      <div className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-2 bg-[#0c101b]/95 border-b border-amber-500/35 shadow-lg">
        {/* Left: Chapter, Map Scale & Objective */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="min-w-0">
            <div className="text-[11px] font-mono-num text-amber-400 tracking-wide truncate max-w-[380px]">
              {meta.chapterCode} · {getMapScaleLabel(meta.mapWidth, meta.mapHeight)} ({meta.mapWidth}×{meta.mapHeight}) ·{' '}
              <span className="text-slate-300">{getObjectiveLabel(meta)}</span>
            </div>
            <div className="font-display text-sm md:text-base font-bold text-amber-50 truncate max-w-[290px]">
              {meta.title}
            </div>
          </div>
        </div>

        {/* Center: Live Turn & Phase Counter */}
        <div className="flex items-center gap-2.5 shrink-0 font-mono-num">
          {!isDeployment && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase">Lượt</span>
              <span className="text-lg font-bold text-amber-200">{turn}</span>
            </div>
          )}

          <div
            className={`px-2.5 py-0.5 text-xs font-semibold border whitespace-nowrap ${
              isDeployment
                ? 'bg-amber-950/85 text-amber-200 border-amber-400/60'
                : phase === 'PLAYER'
                ? 'bg-sky-950/80 text-sky-200 border-sky-400/50'
                : 'bg-red-950/80 text-red-200 border-red-400/50'
            }`}
          >
            {isDeployment
              ? `Chuẩn Bị (${aliveAlliesCount}/${meta.maxDeploySlots})`
              : phase === 'PLAYER'
              ? `Phe Ta (${unmovedAlliesCount}/${aliveAlliesCount})`
              : 'Quân Địch'}
          </div>

          <div className="hidden sm:flex items-baseline gap-1 text-xs text-slate-300 whitespace-nowrap">
            <span className="text-slate-400">Địch:</span>
            <span className="font-bold text-red-300">{aliveEnemiesCount}</span>
          </div>
        </div>

        {/* Right: Gold, Zoom, Camp Shop, Roster/Evolution, Tactical Utilities & End Turn / Launch */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            title="Ngân khố quân đoàn (Vàng)"
            className="h-9 px-2.5 hidden xl:flex items-center gap-1.5 text-xs font-mono-num font-bold bg-[#121827] text-amber-300 border border-amber-500/35 whitespace-nowrap"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{gold.toLocaleString('vi-VN')}G</span>
          </div>

          {/* Camera Zoom Controls for Medium / Large / Colossal Maps */}
          <div
            role="group"
            aria-label="Thu phóng bản đồ"
            className="hidden md:flex items-center h-9 bg-[#121827] border border-slate-600/60 font-mono-num text-xs"
          >
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onZoomChange(-0.2);
              }}
              title="Thu nhỏ bản đồ [-]"
              aria-label="Thu nhỏ bản đồ"
              className="w-7 h-full flex items-center justify-center text-slate-300 hover:bg-[#1e2940] hover:text-amber-200 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onZoomReset();
              }}
              title="Đặt lại góc nhìn toàn cảnh 100%"
              aria-label="Đặt lại góc nhìn 100 phần trăm"
              className="px-1.5 h-full flex items-center justify-center text-[11px] font-semibold text-amber-200 hover:bg-[#1e2940] border-x border-slate-700/70 cursor-pointer whitespace-nowrap"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onZoomChange(0.2);
              }}
              title="Phóng to chi tiết chiến trường [+]"
              aria-label="Phóng to bản đồ"
              className="w-7 h-full flex items-center justify-center text-slate-300 hover:bg-[#1e2940] hover:text-amber-200 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenRoster(inspectedUnit?.faction === 'PLAYER' ? inspectedUnit.id : undefined);
            }}
            title="Quân Đoàn, Vũ Khí, Vật Phẩm & Tiến Hóa 3 Cấp [C]"
            aria-label="Mở Quân Đoàn và Tiến Hóa"
            className="h-9 px-2.5 flex items-center gap-1.5 text-xs font-semibold bg-[#1c2338] hover:bg-[#263252] text-amber-200 border border-amber-400/60 cursor-pointer whitespace-nowrap relative"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Đội Hình [C]</span>
            {hasPromotableAlly && (
              <span
                aria-hidden="true"
                className="w-2 h-2 bg-amber-300 inline-block"
              />
            )}
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onCycleAlly();
            }}
            disabled={phase !== 'PLAYER'}
            title="Chọn đơn vị chưa hành động [Tab]"
            aria-label="Chọn đơn vị tiếp theo"
            className="h-9 px-2.5 flex items-center gap-1.5 text-xs font-medium bg-[#151c2c] hover:bg-[#1e2940] disabled:opacity-40 text-slate-200 border border-slate-600/60 cursor-pointer whitespace-nowrap"
          >
            <Crosshair className="w-3.5 h-3.5 text-sky-300" />
            <span className="hidden 2xl:inline">[Tab]</span>
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleDangerZone();
            }}
            title="Bật/Tắt vùng nguy hiểm quân địch [R]"
            aria-label="Bật tắt vùng nguy hiểm"
            className={`h-9 px-2.5 flex items-center gap-1.5 text-xs font-medium border cursor-pointer whitespace-nowrap ${
              showDangerZone
                ? 'bg-red-950/90 text-red-200 border-red-400/70'
                : 'bg-[#151c2c] hover:bg-[#1e2940] text-slate-200 border-slate-600/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden 2xl:inline">Nguy hiểm [R]</span>
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenAtlas();
            }}
            title="Mở Biên Niên Sử 120 Bản Đồ"
            aria-label="Mở Biên Niên Sử 120 Bản Đồ"
            className="h-9 px-2.5 flex items-center gap-1.5 text-xs font-medium bg-[#151c2c] hover:bg-[#1e2940] text-amber-200 border border-amber-500/40 cursor-pointer whitespace-nowrap"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">120 Maps</span>
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            title="Bật/Tắt âm thanh [M]"
            aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="w-9 h-9 flex items-center justify-center bg-[#151c2c] hover:bg-[#1e2940] text-slate-200 border border-slate-600/60 cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onPause();
            }}
            title="Tạm dừng [P]"
            aria-label="Tạm dừng"
            className="w-9 h-9 flex items-center justify-center bg-[#151c2c] hover:bg-[#1e2940] text-slate-200 border border-slate-600/60 cursor-pointer"
          >
            <Pause className="w-4 h-4" />
          </button>

          {isDeployment ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onConfirmDeployment();
              }}
              className="h-9 px-3 flex items-center gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-200 cursor-pointer whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Xuất Trận [Space]</span>
            </button>
          ) : (
            <button
              type="button"
              tabIndex={-1}
              disabled={phase !== 'PLAYER'}
              onClick={(e) => {
                e.currentTarget.blur();
                onEndTurn();
              }}
              className="h-9 px-3 flex items-center gap-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-slate-950 border border-amber-300/75 cursor-pointer whitespace-nowrap"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Kết thúc [E]</span>
            </button>
          )}
        </div>
      </div>

      {/* CENTER TRANSIENT BANNERS (Phase Transition, Action Menu, Combat Forecast, Level Up, Promotion) */}
      <div className="relative flex-1 flex items-center justify-center pointer-events-none px-4">
        {phaseBanner && (
          <div
            className={`px-12 py-3.5 border-y-2 shadow-2xl ${
              phaseBanner.includes('PHE TA')
                ? 'bg-sky-950/95 border-sky-400 text-sky-100'
                : 'bg-red-950/95 border-red-400 text-red-100'
            }`}
          >
            <div className="font-display text-2xl md:text-3xl font-bold tracking-[0.2em] text-center">
              {phaseBanner}
            </div>
          </div>
        )}

        {/* Contextual Tactical Action Menu */}
        {actionMenuOptions && actionMenuOptions.length > 0 && !forecastData && (
          <div
            role="menu"
            aria-label="Hành động đơn vị"
            className="pointer-events-auto absolute right-6 top-6 w-60 tactical-panel p-2 flex flex-col gap-1"
          >
            <div className="px-2 py-1 text-[11px] font-display tracking-wider text-amber-300 border-b border-amber-500/25">
              CHỌN HÀNH ĐỘNG
            </div>
            {actionMenuOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onActionMenuSelect(opt.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-left border transition-colors cursor-pointer ${
                  opt.accent === 'danger'
                    ? 'bg-red-950/85 hover:bg-red-900/95 text-red-100 border-red-500/60'
                    : opt.accent === 'skill'
                    ? 'bg-violet-950/85 hover:bg-violet-900/95 text-violet-100 border-violet-400/60'
                    : opt.accent === 'heal'
                    ? 'bg-emerald-950/85 hover:bg-emerald-900/95 text-emerald-100 border-emerald-500/60'
                    : opt.accent === 'gold'
                    ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 border-amber-300'
                    : 'bg-[#171e2f] hover:bg-[#222c44] text-slate-100 border-slate-700/70'
                }`}
              >
                <div className="min-w-0">
                  <div className="truncate">{opt.label}</div>
                  {opt.sublabel && (
                    <div className="text-[10px] font-normal opacity-80 truncate">{opt.sublabel}</div>
                  )}
                </div>
                <span className="font-mono-num text-[10px] opacity-75 shrink-0 ml-2">[{opt.shortcut}]</span>
              </button>
            ))}
          </div>
        )}

        {/* Classic Fire Emblem Combat Forecast Panel */}
        {forecastData && (
          <div
            role="dialog"
            aria-label="Dự báo giao tranh"
            className="pointer-events-auto absolute right-6 top-4 w-[336px] tactical-panel overflow-hidden"
          >
            <div className="px-4 py-2 bg-[#0c101b] border-b border-amber-500/30 flex items-center justify-between">
              <span className="font-display text-xs font-bold tracking-wider text-amber-200">
                {forecastData.forecast.activeSkillId
                  ? `TUYỆT KỸ: ${SKILLS[forecastData.forecast.activeSkillId]?.name.toUpperCase()}`
                  : 'DỰ BÁO GIAO TRANH'}
              </span>
              <span className="text-[11px] text-slate-400">Tam Giác Vũ Khí</span>
            </div>

            <div className="p-3.5 grid grid-cols-[1fr_auto_1fr] gap-2 items-center text-center font-mono-num">
              <div className="bg-sky-950/60 border border-sky-500/35 p-2">
                <div className="font-sans text-xs font-bold text-sky-100 truncate">
                  {forecastData.attacker.name}
                </div>
                <div className="font-sans text-[11px] text-sky-300 truncate">
                  {forecastData.attacker.weapon.name}
                  {forecastData.forecast.attackerAdvantage > 0 && (
                    <span className="text-emerald-400 font-bold ml-1">▲</span>
                  )}
                  {forecastData.forecast.attackerAdvantage < 0 && (
                    <span className="text-red-400 font-bold ml-1">▼</span>
                  )}
                </div>
              </div>

              <div className="text-xs font-display text-amber-300 font-bold">VS</div>

              <div className="bg-red-950/60 border border-red-500/35 p-2">
                <div className="font-sans text-xs font-bold text-red-100 truncate">
                  {forecastData.defender.name}
                </div>
                <div className="font-sans text-[11px] text-red-300 truncate">
                  {forecastData.defender.weapon.name}
                  {forecastData.forecast.defenderAdvantage > 0 && (
                    <span className="text-emerald-400 font-bold ml-1">▲</span>
                  )}
                  {forecastData.forecast.defenderAdvantage < 0 && (
                    <span className="text-red-400 font-bold ml-1">▼</span>
                  )}
                </div>
              </div>

              <div className="text-sm font-bold text-sky-200">{forecastData.attacker.hp}</div>
              <div className="text-[11px] text-slate-400">HP</div>
              <div className="text-sm font-bold text-red-200">{forecastData.defender.hp}</div>

              <div className="text-base font-bold text-amber-200">
                {forecastData.forecast.attackerDamage}
                {forecastData.forecast.attackerStrikeCount > 1 && (
                  <span className="text-xs text-emerald-300 ml-1">
                    ×{forecastData.forecast.attackerStrikeCount}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">Sát thương</div>
              <div className="text-base font-bold text-red-200">
                {forecastData.forecast.defenderCanCounter ? (
                  <>
                    {forecastData.forecast.defenderDamage}
                    {forecastData.forecast.defenderStrikeCount > 1 && (
                      <span className="text-xs text-amber-300 ml-1">
                        ×{forecastData.forecast.defenderStrikeCount}
                      </span>
                    )}
                  </>
                ) : (
                  '—'
                )}
              </div>

              <div className="text-sm text-slate-100">{forecastData.forecast.attackerHit}%</div>
              <div className="text-[11px] text-slate-400">Chính xác</div>
              <div className="text-sm text-slate-100">
                {forecastData.forecast.defenderCanCounter ? `${forecastData.forecast.defenderHit}%` : '—'}
              </div>

              <div className="text-sm text-amber-300">{forecastData.forecast.attackerCrit}%</div>
              <div className="text-[11px] text-slate-400">Chí mạng</div>
              <div className="text-sm text-amber-300">
                {forecastData.forecast.defenderCanCounter ? `${forecastData.forecast.defenderCrit}%` : '—'}
              </div>
            </div>

            {(forecastData.forecast.effectiveLabelAttacker ||
              forecastData.forecast.attackerNotes.length > 0 ||
              forecastData.forecast.defenderNotes.length > 0) && (
              <div className="px-3 py-1.5 text-[11px] bg-[#0f1626] border-t border-amber-500/25 flex flex-col gap-0.5 text-center">
                {forecastData.forecast.effectiveLabelAttacker && (
                  <div className="text-emerald-300 font-semibold">
                    {forecastData.forecast.effectiveLabelAttacker}
                  </div>
                )}
                {forecastData.forecast.attackerNotes.length > 0 && (
                  <div className="text-sky-200">{forecastData.forecast.attackerNotes.join(' · ')}</div>
                )}
                {forecastData.forecast.defenderNotes.length > 0 && (
                  <div className="text-red-300">{forecastData.forecast.defenderNotes.join(' · ')}</div>
                )}
              </div>
            )}

            <div className="p-2.5 flex items-center gap-2 border-t border-amber-500/25 bg-[#0c101b]">
              <button
                type="button"
                onClick={onConfirmAttack}
                className="flex-1 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white border border-red-300/60 cursor-pointer whitespace-nowrap"
              >
                {forecastData.forecast.activeSkillId ? 'Thi Triển Tuyệt Kỹ [Enter]' : 'Tấn Công [Enter]'}
              </button>
              <button
                type="button"
                onClick={onCancelForecast}
                className="px-3 py-2 text-xs font-medium bg-[#182032] hover:bg-[#232f48] text-slate-200 border border-slate-600/60 cursor-pointer whitespace-nowrap"
              >
                Hủy [Esc]
              </button>
            </div>
          </div>
        )}

        {/* Class Promotion Celebration Banner */}
        {promotionToast && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 tactical-panel px-6 py-3.5 border-amber-300 shadow-2xl">
            <div className="flex items-center justify-center gap-2 font-display text-base font-bold text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>
                TIẾN HÓA THÀNH CÔNG! {promotionToast.unitName}: {promotionToast.fromClassName} →{' '}
                {promotionToast.toClassName}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-1.5 text-xs font-mono-num text-emerald-300">
              {Object.entries(promotionToast.statBonuses).map(([k, v]) => (
                <span key={k}>
                  {k === 'maxHp' ? 'HP' : k.toUpperCase()} +{v}
                </span>
              ))}
            </div>
            <div className="text-[11px] text-sky-200 text-center mt-1">
              Mở khóa kỹ năng mới: <span className="font-bold">{SKILLS[promotionToast.unlockedSkill]?.name}</span>
            </div>
          </div>
        )}

        {/* Dynamic Weather Shift Notification Banner */}
        {weatherShiftToast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 tactical-panel px-4 py-2.5 border-sky-400/75 shadow-xl max-w-[360px]">
            <div className="flex items-center gap-2 text-xs font-display font-bold text-sky-200">
              <WeatherGlyph weather={weatherShiftToast} className="w-4 h-4 text-sky-300 shrink-0" />
              <span>THỜI TIẾT BIẾN ĐỔI: {WEATHER_DATA[weatherShiftToast]?.name}</span>
            </div>
            <div className="text-[11px] text-amber-200/95 mt-0.5">
              {WEATHER_DATA[weatherShiftToast]?.shortEffect}
            </div>
          </div>
        )}

        {/* Compact Floating Unit Scout Card during Pre-Battle Deployment */}
        {isDeployment && inspectedUnit && inspectedEffStats && (
          <div className="pointer-events-auto absolute top-3 right-4 tactical-panel-subtle px-3 py-2 w-[336px] shadow-xl">
            <div className="flex items-center gap-2.5">
              <img
                src={inspectedPortraitUrl}
                alt={inspectedUnit.name}
                referrerPolicy="no-referrer"
                className={`w-11 h-11 object-cover object-top border pixel-art shrink-0 ${
                  inspectedUnit.faction === 'PLAYER' ? 'border-sky-400/75' : 'border-red-400/75'
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-1.5">
                  <span className="font-display font-bold text-xs text-amber-100 truncate">
                    {inspectedUnit.name}
                  </span>
                  <span className="font-mono-num text-[11px] text-sky-200 shrink-0">
                    Lv.{inspectedUnit.level} · HP {inspectedUnit.hp}
                  </span>
                </div>
                <div className="text-[11px] text-amber-300/90 truncate">
                  {inspectedUnit.className} · {inspectedUnit.weapon.name} (Tầm{' '}
                  {inspectedUnit.weapon.minRange === inspectedUnit.weapon.maxRange
                    ? inspectedUnit.weapon.minRange
                    : `${inspectedUnit.weapon.minRange}-${inspectedUnit.weapon.maxRange}`}
                  )
                </div>
                <div className="text-[10px] font-mono-num text-slate-300 mt-0.5 whitespace-nowrap">
                  STR {inspectedEffStats.str} · MAG {inspectedEffStats.mag} · SPD {inspectedEffStats.spd} · DEF{' '}
                  {inspectedEffStats.def} · MOV {inspectedEffStats.mov}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rare Battle Victory Loot Drop Toast (0.05% - 0.1% Drop Rate, Auto-Convoy on Full Pack) */}
        {lootDropToast && (
          <div
            data-testid="battle-loot-drop-toast"
            className="absolute top-36 left-1/2 -translate-x-1/2 tactical-panel px-5 py-3 border-amber-300 shadow-2xl max-w-[460px]"
          >
            <div className="flex items-center justify-center gap-2 font-display text-sm font-bold text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>CHIẾN LỢI PHẨM HIẾM RƠI RA!</span>
            </div>
            <div
              className="text-sm font-bold text-center mt-1"
              style={{ color: lootDropToast.accentColor }}
            >
              {lootDropToast.name} ({lootDropToast.categoryLabel})
            </div>
            <div className="text-[11px] text-slate-200 text-center mt-1">
              {lootDropToast.sentToConvoy ? (
                <span>
                  Túi đồ của <strong>{lootDropToast.recipientName}</strong> đã đầy (
                  {MAX_UNIT_CARRY_SLOTS}/{MAX_UNIT_CARRY_SLOTS}) →{' '}
                  <strong className="text-sky-300">Đã tự động chuyển thẳng về Kho Quân Đoàn!</strong>
                </span>
              ) : (
                <span>
                  Đã bỏ vào túi đồ cá nhân của <strong>{lootDropToast.recipientName}</strong>!
                </span>
              )}
            </div>
          </div>
        )}

        {/* Title Unlocked Achievement Toast */}
        {titleUnlockedToast && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 tactical-panel px-5 py-3 border-amber-300 shadow-2xl max-w-[440px]">
            <div className="flex items-center justify-center gap-2 font-display text-sm font-bold text-amber-200">
              <Award className="w-4 h-4 text-amber-300 shrink-0" />
              <span>DANH HIỆU MỚI MỞ KHÓA: {titleUnlockedToast.name}</span>
            </div>
            <div className="text-[11px] text-slate-200 text-center mt-1">
              {titleUnlockedToast.description}
            </div>
            <div className="text-[10px] font-mono-num text-emerald-300 text-center mt-1">
              Mở Đội Hình [C] → tab Danh Hiệu để trang bị cho Tướng hoặc Thống Soái!
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM PERIMETER INSPECTORS (hidden during Deployment so DeploymentPrepBar owns the bottom dock) */}
      {!isDeployment ? (
        <div className="px-4 pb-2.5 flex items-end justify-between gap-4">
          {/* Bottom-Left: Rich Unit Inspector with Live Pixel Sprite / Portrait, Title Badge, SP & Skills */}
          <div className="pointer-events-auto tactical-panel-subtle px-3.5 py-2 min-w-[450px] max-w-[625px]">
          {inspectedUnit && inspectedEffStats ? (
            <div className="flex items-center gap-3.5">
              {/* Crisp 96x96 HD-2D / Painted RPG Bust Portrait */}
              <div
                className={`relative w-16 h-[68px] shrink-0 border overflow-hidden flex items-center justify-center ${
                  inspectedUnit.faction === 'PLAYER' ? 'border-sky-400/75' : 'border-red-400/75'
                } bg-[#0c101b]`}
              >
                <img
                  src={inspectedPortraitUrl}
                  alt={inspectedUnit.name}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover object-top pixel-art ${
                    inspectedUnit.faction === 'ENEMY' ? '-scale-x-100' : ''
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-display font-bold text-sm text-amber-100 truncate">
                      {inspectedUnit.name}
                    </span>
                    <span className="text-[11px] text-amber-300/90 truncate">
                      {inspectedUnit.className}
                      {inspectedUnit.tier === 4
                        ? ' ★IV'
                        : inspectedUnit.tier === 3
                        ? ' ★III'
                        : inspectedUnit.tier === 2
                        ? ' ★II'
                        : ''}{' '}
                      · Lv.{inspectedUnit.level}
                    </span>
                    {inspectedTitle && (
                      <span
                        title={`Danh hiệu cá nhân: ${inspectedTitle.description}`}
                        className={`hidden sm:inline-flex items-center gap-1 px-1.5 py-0.25 text-[10px] font-semibold border shrink-0 ${
                          TITLE_RARITY_META[inspectedTitle.rarity].badge
                        }`}
                      >
                        <Award className="w-2.5 h-2.5" />
                        {inspectedTitle.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 font-mono-num text-xs shrink-0">
                    <span className="font-bold text-sky-200">
                      HP {inspectedUnit.hp}/{inspectedEffStats.maxHp}
                    </span>
                    {inspectedUnit.faction === 'PLAYER' && (
                      <span className="text-violet-300">SP {inspectedUnit.sp}</span>
                    )}
                  </div>
                </div>

                {/* HP + SP micro bars */}
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="h-1.5 flex-1 bg-slate-900 overflow-hidden">
                    <div
                      className={inspectedUnit.faction === 'PLAYER' ? 'h-full bg-sky-400' : 'h-full bg-red-500'}
                      style={{
                        width: `${Math.min(100, (inspectedUnit.hp / Math.max(1, inspectedEffStats.maxHp)) * 100)}%`,
                      }}
                    />
                  </div>
                  {inspectedUnit.faction === 'PLAYER' && (
                    <div className="h-1.5 w-16 bg-slate-900 overflow-hidden">
                      <div
                        className="h-full bg-violet-400"
                        style={{ width: `${(inspectedUnit.sp / inspectedUnit.maxSp) * 100}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Weapon & Element & EXP row */}
                <div className="flex items-center justify-between gap-3 mt-1 text-[11px]">
                  <span className="text-amber-200/95 truncate">
                    {inspectedUnit.weapon.name} ({WEAPON_TYPE_LABEL[inspectedUnit.weapon.type]}
                    {inspectedUnit.weapon.element && inspectedUnit.weapon.element !== 'NONE'
                      ? ` · ${MAGIC_ELEMENT_LABEL[inspectedUnit.weapon.element]}`
                      : ''}
                    {' · Tầm '}
                    {inspectedUnit.weapon.minRange === inspectedUnit.weapon.maxRange
                      ? inspectedUnit.weapon.minRange
                      : `${inspectedUnit.weapon.minRange}-${inspectedUnit.weapon.maxRange}`}
                    )
                  </span>
                  {inspectedUnit.faction === 'PLAYER' && (
                    <span className="font-mono-num text-slate-400 shrink-0">
                      Túi{' '}
                      <strong className="text-sky-300">
                        {getUnitCarryCount(inspectedUnit)}/{MAX_UNIT_CARRY_SLOTS}
                      </strong>{' '}
                      · EXP {inspectedUnit.exp}/100
                    </span>
                  )}
                </div>

                {/* Effective Stats (with Title bonuses highlighted) + Skill Names */}
                <div className="flex items-center justify-between gap-2 mt-1 text-[11px] font-mono-num text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className={inspectedEffStats.str > inspectedUnit.stats.str ? 'text-emerald-300 font-semibold' : ''}>
                      STR {inspectedEffStats.str}
                    </span>
                    <span className={inspectedEffStats.mag > inspectedUnit.stats.mag ? 'text-emerald-300 font-semibold' : ''}>
                      MAG {inspectedEffStats.mag}
                    </span>
                    <span className={inspectedEffStats.spd > inspectedUnit.stats.spd ? 'text-emerald-300 font-semibold' : ''}>
                      SPD {inspectedEffStats.spd}
                    </span>
                    <span className={inspectedEffStats.def > inspectedUnit.stats.def ? 'text-emerald-300 font-semibold' : ''}>
                      DEF {inspectedEffStats.def}
                    </span>
                    <span className={inspectedEffStats.res > inspectedUnit.stats.res ? 'text-emerald-300 font-semibold' : ''}>
                      RES {inspectedEffStats.res}
                    </span>
                    <span className={inspectedEffStats.mov > inspectedUnit.stats.mov ? 'text-emerald-300 font-semibold' : ''}>
                      MOV {inspectedEffStats.mov}
                    </span>
                  </div>
                  {inspectedUnit.skills.length > 0 && (
                    <span className="font-sans text-[10px] text-violet-300 truncate max-w-[230px]">
                      {inspectedUnit.skills.map((sid) => SKILLS[sid]?.name).filter(Boolean).join(' · ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-2">
              Di chuột hoặc dùng WASD tới một đơn vị để xem chỉ số · Nhấn [C] mở Đội Hình, 30 Hệ Phái &amp; Danh Hiệu.
            </div>
          )}
        </div>

        {/* Bottom-Right: Dynamic Weather Card + Terrain Inspector */}
        <div className="pointer-events-auto flex flex-col gap-1.5 items-end">
          {/* Live Battlefield Weather Status Card */}
          <div
            data-testid="weather-hud-card"
            title={weatherInfo.description}
            className="tactical-panel-subtle px-3.5 py-1.5 min-w-[265px] max-w-[310px]"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0" style={{ color: weatherInfo.accentColor }}>
                <WeatherGlyph weather={activeWeather} className="w-3.5 h-3.5 shrink-0" />
                <span className="font-display font-bold text-xs truncate">
                  {weatherInfo.name}
                </span>
              </div>
              <span className="font-mono-num text-[10px] text-slate-400 shrink-0">
                Đổi sau {turnsUntilShift} lượt
              </span>
            </div>
            <div className="text-[11px] text-slate-200 mt-0.5 truncate">
              {weatherInfo.shortEffect}
            </div>
            {commanderTitle && (
              <div className="text-[10px] text-amber-300/90 mt-0.5 truncate flex items-center gap-1">
                <Award className="w-2.5 h-2.5 shrink-0" />
                <span>Thống Soái: {commanderTitle.name}</span>
              </div>
            )}
          </div>

          {/* Terrain Inspector */}
          <div className="tactical-panel-subtle px-3.5 py-1.5 min-w-[265px] max-w-[310px]">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-display font-bold text-xs text-amber-100">{terrainInfo.name}</span>
              <span className="font-mono-num text-[11px] text-slate-400">
                ({cursor.x + 1}, {cursor.y + 1})
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-[11px] font-mono-num text-slate-300">
              <span>DEF +{terrainInfo.defBonus}</span>
              <span>NÉ +{terrainInfo.avoBonus}%</span>
              {terrainInfo.healPercent > 0 && (
                <span className="text-emerald-300">HỒI +{terrainInfo.healPercent}%</span>
              )}
            </div>
            {terrainInfo.shopKind ? (
              <div className="text-[11px] text-amber-300 font-semibold mt-0.5">
                {terrainInfo.shopKind === 'IN_MAP_ARMORY'
                  ? '★ Đứng vào ô này để mở Tiệm Rèn Chiến Trường!'
                  : '★ Đứng vào ô này để mở Thương Nhân Bí Mật!'}
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 mt-0.5">
                Kiếm &gt; Rìu &gt; Thương &gt; Kiếm
              </div>
            )}
          </div>
        </div>
      </div>
      ) : (
        <div className="h-36 pointer-events-none" />
      )}
    </div>
  );
}
