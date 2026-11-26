import { useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  Award,
  Check,
  Coins,
  Crown,
  Flame,
  Hammer,
  MessageSquare,
  Package,
  Play,
  Shield,
  ShoppingBag,
  Swords,
  Users,
  X,
} from 'lucide-react';
import { ConvoyPanel } from './ConvoyPanel';
import { TradeWorkbench } from './TradeModal';
import {
  CAMP_SPARRING_COST_GOLD,
  CAMP_SPARRING_EXP_GAIN,
  getHeroCampDialogue,
} from '../game/campData';
import { getCampaignMapById } from '../game/campaignData';
import {
  ARMOR_SLOT_META,
  ARMOR_SLOTS,
  ARMOR_TEMPLATES,
  EQUIPMENT_RARITY_META,
  PORTRAIT_ASSETS,
  SKILLS,
  TITLE_RARITY_META,
  TITLES,
  WEAPON_TYPE_LABEL,
} from '../game/data';
import {
  canPromoteUnit,
  getEffectiveUnitStats,
  getUnitCarryCount,
  MAX_UNIT_CARRY_SLOTS,
} from '../game/engine';
import { getUnitPortraitDataUrl, getUnitSpriteDataUrl } from '../game/pixelSprites';
import type {
  ArmorSlot,
  CampaignSaveData,
  FormationPresetId,
  Unit,
} from '../game/types';
import type { RosterModalTab } from './RosterArmoryModal';

export type CampStationTab = 'BARRACKS' | 'TRADE' | 'CONVOY';
type DialogueTopic = 'greeting' | 'campaignThought' | 'tacticalNote' | 'comradePledge';

const CAMP_FORMATION_PRESETS: Array<{
  id: FormationPresetId;
  name: string;
  shortHint: string;
}> = [
  { id: 'BALANCED', name: 'Cân Bằng', shortHint: 'Trung tâm vững chắc, Phép đứng sau' },
  { id: 'PHALANX', name: 'Lá Chắn', shortHint: 'Thiết giáp dàn hàng ngang che chắn' },
  { id: 'SPEARHEAD', name: 'Mũi Nhọn', shortHint: 'Kỵ binh & chủ tướng xung kích thẳng' },
  { id: 'PINCER', name: 'Hai Cánh', shortHint: 'Chia hai cánh bọc sườn cơ động' },
];

interface CampHubModalProps {
  saveData: CampaignSaveData;
  campUnits: Unit[];
  commanderTitleId: string;
  initialTab?: CampStationTab;
  onTradeWeapon: (
    fromUnitId: string,
    toUnitId: string,
    fromWeaponIndex: number,
    swapToWeaponIndex?: number
  ) => { ok: boolean; message?: string };
  onEquipPersonalWeapon: (unitId: string, weaponId: string) => void;
  onTradeArmorSlot: (
    unitAId: string,
    unitBId: string,
    slot: ArmorSlot
  ) => { ok: boolean; message?: string };
  onTradePotion: (
    fromUnitId: string,
    toUnitId: string
  ) => { ok: boolean; message?: string };
  onTradePersonalItem: (
    fromUnitId: string,
    toUnitId: string,
    itemIndex: number
  ) => { ok: boolean; message?: string };
  onTradeCarriedArmor: (
    fromUnitId: string,
    toUnitId: string,
    armorUid: string
  ) => { ok: boolean; message?: string };
  onStoreWeaponToConvoy: (
    unitId: string,
    weaponId: string
  ) => { ok: boolean; message?: string };
  onWithdrawConvoyWeapon: (
    unitId: string,
    weaponId: string,
    equipNow?: boolean
  ) => { ok: boolean; message?: string };
  onStorePotionToConvoy: (unitId: string) => { ok: boolean; message?: string };
  onWithdrawPotionFromConvoy: (unitId: string) => { ok: boolean; message?: string };
  onStorePersonalItemToConvoy: (
    unitId: string,
    itemIndex: number
  ) => { ok: boolean; message?: string };
  onWithdrawItemFromConvoy: (
    unitId: string,
    itemId: string
  ) => { ok: boolean; message?: string };
  onStoreCarriedArmorToConvoy: (
    unitId: string,
    armorUid: string
  ) => { ok: boolean; message?: string };
  onWithdrawArmorToPack: (
    unitId: string,
    armorUid: string
  ) => { ok: boolean; message?: string };
  onEquipConvoyArmor: (unitId: string, armorUid: string) => void;
  onUnequipWornArmorToConvoy: (unitId: string, slot: ArmorSlot) => void;
  onSparTrainUnit: (unitId: string) => { ok: boolean; message: string };
  onTogglePreferredSquadHero: (templateId: string, maxSlots: number) => void;
  onSelectPreferredFormation: (preset: FormationPresetId) => void;
  onOpenRosterModal: (unitId?: string, tab?: RosterModalTab) => void;
  onOpenCampShop: () => void;
  onDeployCurrentMap: () => void;
  onClose: () => void;
}

const TOPIC_LABELS: Array<{ id: DialogueTopic; label: string }> = [
  { id: 'greeting', label: 'Chào Hỏi Lửa Trại' },
  { id: 'campaignThought', label: 'Tâm Sự Chiến Dịch' },
  { id: 'tacticalNote', label: 'Kinh Nghiệm Tác Chiến' },
  { id: 'comradePledge', label: 'Lời Thề Đồng Minh' },
];

export function CampHubModal({
  saveData,
  campUnits,
  commanderTitleId,
  initialTab = 'BARRACKS',
  onTradeWeapon,
  onEquipPersonalWeapon,
  onTradeArmorSlot,
  onTradePotion,
  onTradePersonalItem,
  onTradeCarriedArmor,
  onStoreWeaponToConvoy,
  onWithdrawConvoyWeapon,
  onStorePotionToConvoy,
  onWithdrawPotionFromConvoy,
  onStorePersonalItemToConvoy,
  onWithdrawItemFromConvoy,
  onStoreCarriedArmorToConvoy,
  onWithdrawArmorToPack,
  onEquipConvoyArmor,
  onUnequipWornArmorToConvoy,
  onSparTrainUnit,
  onTogglePreferredSquadHero,
  onSelectPreferredFormation,
  onOpenRosterModal,
  onOpenCampShop,
  onDeployCurrentMap,
  onClose,
}: CampHubModalProps) {
  const [station, setStation] = useState<CampStationTab>(initialTab);
  const [selectedHeroId, setSelectedHeroId] = useState<string>(() => campUnits[0]?.id ?? '');
  const [tradeLeftId, setTradeLeftId] = useState<string>(() => campUnits[0]?.id ?? '');
  const [tradeRightId, setTradeRightId] = useState<string>(
    () => campUnits[1]?.id ?? campUnits[0]?.id ?? ''
  );
  const [activeTopic, setActiveTopic] = useState<DialogueTopic>('greeting');
  const [campFeedback, setCampFeedback] = useState<string | null>(null);

  const nextMapId = Math.max(1, Math.min(200, saveData.currentMapId || saveData.highestReachedMap || 1));
  const nextMapMeta = useMemo(() => getCampaignMapById(nextMapId), [nextMapId]);
  const maxSparLevel = nextMapMeta.recommendedLevel + 2;

  const selectedHero =
    campUnits.find((u) => u.id === selectedHeroId) ?? campUnits[0] ?? null;

  const resolvedLeftUnit =
    campUnits.find((u) => u.id === tradeLeftId) ?? campUnits[0] ?? null;
  const resolvedRightUnit =
    campUnits.find((u) => u.id === tradeRightId && u.id !== resolvedLeftUnit?.id) ??
    campUnits.find((u) => u.id !== resolvedLeftUnit?.id) ??
    campUnits[0] ??
    null;

  const preferredSet = useMemo(() => {
    if (saveData.preferredSquadIds && saveData.preferredSquadIds.length > 0) {
      return new Set(['kaelen', ...saveData.preferredSquadIds]);
    }
    return new Set(
      campUnits.slice(0, nextMapMeta.maxDeploySlots).map((u) => u.templateId)
    );
  }, [saveData.preferredSquadIds, campUnits, nextMapMeta.maxDeploySlots]);

  const activeFormation: FormationPresetId = saveData.preferredFormation ?? 'BALANCED';

  const heroDialogue = useMemo(
    () => (selectedHero ? getHeroCampDialogue(selectedHero) : null),
    [selectedHero]
  );
  const heroEffStats = useMemo(
    () => (selectedHero ? getEffectiveUnitStats(selectedHero, commanderTitleId) : null),
    [selectedHero, commanderTitleId]
  );
  const heroTitle =
    selectedHero?.equippedTitleId ? TITLES[selectedHero.equippedTitleId] : null;

  const convoyTotalCount = useMemo(() => {
    const itemSum = Object.values(saveData.itemBag ?? {}).reduce((a, b) => a + b, 0);
    return (saveData.convoyWeaponIds?.length ?? 0) + itemSum;
  }, [saveData.convoyWeaponIds, saveData.itemBag]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Căn Cứ Chỉ Huy Hợp Đồng Binh Chủng"
      className="fixed inset-0 z-40 flex flex-col bg-[#080c15] text-slate-100 overflow-hidden"
    >
      {/* Top Camp Header Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-[#0d1322] border-b border-amber-500/40">
        <div className="flex items-center gap-3 min-w-0">
          <Flame className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold text-amber-100 leading-tight truncate">
              CĂN CỨ CHỈ HUY &amp; DOANH TRẠI QUÂN ĐOÀN
            </h2>
            <p className="text-xs text-slate-400 truncate">
              {nextMapMeta.era === 'WW1' ? 'Thế Chiến I' : 'Thế Chiến II'} · Hồi {nextMapMeta.actNumber} · Đã biên chế {campUnits.length}/30 Đơn Vị · Mặt trận kế tiếp: {nextMapMeta.title} ({nextMapMeta.historicalDate}, Lv.
              {nextMapMeta.recommendedLevel})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 bg-[#151e32] border border-amber-400/45 text-xs font-mono-num text-amber-200 flex items-center gap-1.5 whitespace-nowrap">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">{(saveData.gold ?? 0).toLocaleString('vi-VN')} G</span>
          </div>

          <button
            type="button"
            data-testid="camp-btn-open-forge"
            onClick={() => onOpenRosterModal(selectedHero?.id, 'FORGE')}
            className="px-3 py-1.5 text-xs font-semibold bg-[#182238] hover:bg-[#22304e] text-amber-200 border border-amber-400/50 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <Hammer className="w-3.5 h-3.5 text-amber-300" />
            <span>Xưởng Quân Giới &amp; Thăng Cấp</span>
          </button>

          <button
            type="button"
            data-testid="camp-btn-open-shop"
            onClick={onOpenCampShop}
            className="px-3 py-1.5 text-xs font-semibold bg-[#152624] hover:bg-[#1e3733] text-emerald-200 border border-emerald-400/50 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-300" />
            <span>Chợ Quân Nhu</span>
          </button>

          <button
            type="button"
            data-testid="camp-btn-deploy"
            onClick={onDeployCurrentMap}
            className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Xuất Chinh Bản Đồ {nextMapId}</span>
          </button>

          <button
            type="button"
            data-testid="camp-btn-close"
            onClick={onClose}
            aria-label="Rời Doanh Trại về màn hình chính"
            className="px-3 py-1.5 text-xs font-medium bg-[#161d2e] hover:bg-[#222c44] text-slate-200 border border-slate-600/70 cursor-pointer flex items-center gap-1 whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5" />
            <span>Màn Hình Chính</span>
          </button>
        </div>
      </div>

      {/* Camp Mode Switcher Sub-Bar (3 Distinct Sections: Quảng Trường, Trao Đổi Giữa Nhân Vật, Kho Quân Đoàn Riêng) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2 bg-[#0b101d] border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="camp-tab-barracks"
            onClick={() => {
              setStation('BARRACKS');
              setCampFeedback(null);
            }}
            className={`px-3.5 py-1.5 text-xs font-bold border cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              station === 'BARRACKS'
                ? 'bg-amber-600 text-slate-950 border-amber-300'
                : 'bg-[#141c2e] text-slate-300 border-slate-700 hover:text-amber-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Quảng Trường, Đối Thoại &amp; Đấu Tập ({campUnits.length})</span>
          </button>

          <button
            type="button"
            data-testid="camp-tab-trade"
            onClick={() => {
              if (selectedHero && selectedHero.id !== tradeRightId) {
                setTradeLeftId(selectedHero.id);
              }
              setStation('TRADE');
              setCampFeedback(null);
            }}
            className={`px-3.5 py-1.5 text-xs font-bold border cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              station === 'TRADE'
                ? 'bg-emerald-600 text-white border-emerald-300'
                : 'bg-[#141c2e] text-slate-300 border-slate-700 hover:text-emerald-200'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Trao Đổi Đồ Đạc Giữa Các Nhân Vật</span>
          </button>

          <button
            type="button"
            data-testid="camp-tab-convoy"
            onClick={() => {
              setStation('CONVOY');
              setCampFeedback(null);
            }}
            className={`px-3.5 py-1.5 text-xs font-bold border cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              station === 'CONVOY'
                ? 'bg-sky-600 text-white border-sky-300'
                : 'bg-[#141c2e] text-slate-300 border-slate-700 hover:text-sky-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Kho Quân Đoàn ({convoyTotalCount})</span>
          </button>
        </div>

        {campFeedback && (
          <span className="text-xs font-semibold text-emerald-200 bg-emerald-950/80 border border-emerald-400/50 px-3 py-1">
            {campFeedback}
          </span>
        )}
      </div>

      {/* Camp Main Content */}
      {station === 'CONVOY' ? (
        <div className="flex-1 overflow-y-auto p-5 chronicle-scroll bg-[#0a0f1c]">
          <div className="max-w-[1240px] mx-auto">
            <ConvoyPanel
              units={campUnits}
              allKnownAllies={campUnits}
              selectedUnitId={selectedHero?.id}
              onSelectUnit={(id) => setSelectedHeroId(id)}
              isOutOfBattle={true}
              convoyWeaponIds={saveData.convoyWeaponIds}
              equipmentBag={saveData.equipmentBag ?? []}
              itemBag={saveData.itemBag ?? {}}
              commanderTitleId={commanderTitleId}
              onStoreWeapon={onStoreWeaponToConvoy}
              onWithdrawWeapon={onWithdrawConvoyWeapon}
              onStorePotion={onStorePotionToConvoy}
              onWithdrawPotion={onWithdrawPotionFromConvoy}
              onStorePersonalItem={onStorePersonalItemToConvoy}
              onWithdrawItem={onWithdrawItemFromConvoy}
              onStoreCarriedArmor={onStoreCarriedArmorToConvoy}
              onWithdrawArmorToPack={onWithdrawArmorToPack}
              onEquipConvoyArmor={onEquipConvoyArmor}
              onUnequipWornArmorToConvoy={onUnequipWornArmorToConvoy}
            />
          </div>
        </div>
      ) : station === 'TRADE' && resolvedLeftUnit && resolvedRightUnit ? (
        <div className="flex-1 overflow-y-auto p-5 chronicle-scroll bg-[#0a0f1c]">
          <div className="max-w-[1220px] mx-auto">
            <TradeWorkbench
              leftUnit={resolvedLeftUnit}
              rightUnit={resolvedRightUnit}
              availableLeftUnits={campUnits}
              availableRightUnits={campUnits}
              onSelectLeftUnit={(id) => {
                setTradeLeftId(id);
                if (id === tradeRightId) {
                  const alt = campUnits.find((u) => u.id !== id);
                  if (alt) setTradeRightId(alt.id);
                }
              }}
              onSelectRightUnit={(id) => {
                setTradeRightId(id);
                if (id === tradeLeftId) {
                  const alt = campUnits.find((u) => u.id !== id);
                  if (alt) setTradeLeftId(alt.id);
                }
              }}
              isFreeLogistics={true}
              equipmentBag={saveData.equipmentBag ?? []}
              commanderTitleId={commanderTitleId}
              onTradeWeapon={onTradeWeapon}
              onEquipPersonalWeapon={onEquipPersonalWeapon}
              onTradeArmorSlot={onTradeArmorSlot}
              onTradePotion={onTradePotion}
              onTradePersonalItem={onTradePersonalItem}
              onTradeCarriedArmor={onTradeCarriedArmor}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[290px_1fr] overflow-hidden">
          {/* Left: Unlocked Camp Heroes List */}
          <div className="border-r border-slate-800 bg-[#0c111e] overflow-y-auto p-3 flex flex-col gap-1.5 chronicle-scroll">
            <div className="flex items-center justify-between text-[11px] font-mono-num text-slate-400 pb-1">
              <span>ĐỘI HÌNH ƯU TIÊN XUẤT TRẬN</span>
              <span className="text-amber-300 font-bold">
                {preferredSet.size}/{nextMapMeta.maxDeploySlots}
              </span>
            </div>

            {campUnits.map((hero) => {
              const isSelected = hero.id === selectedHero?.id;
              const inSquad = preferredSet.has(hero.templateId);
              const promoReady = canPromoteUnit(hero, saveData.itemBag);
              const spriteUrl = getUnitSpriteDataUrl(hero, 0);
              const carry = getUnitCarryCount(hero);

              return (
                <button
                  key={hero.id}
                  type="button"
                  onClick={() => {
                    setSelectedHeroId(hero.id);
                    setCampFeedback(null);
                  }}
                  className={`w-full flex items-center gap-2.5 p-2 text-left border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#1b2742] border-amber-400/85 text-amber-50'
                      : 'bg-[#12192b] hover:bg-[#182238] border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="w-11 h-12 shrink-0 bg-[#090d16] border border-slate-700/70 flex items-center justify-center overflow-hidden">
                    <img
                      src={spriteUrl}
                      alt={hero.name}
                      className="w-10 h-11 object-contain pixel-art"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-display font-bold text-sm truncate">{hero.name}</span>
                      <span className="font-mono-num text-[11px] text-amber-300 shrink-0">
                        Lv.{hero.level}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {hero.className} · {hero.weapon.name}
                    </div>
                    <div className="flex items-center justify-between text-[10px] mt-0.5 font-mono-num">
                      <span className={inSquad ? 'text-emerald-300 font-semibold' : 'text-slate-500'}>
                        {hero.isLord ? '★ Chủ Tướng' : inSquad ? '✓ Xuất trận' : 'Dự bị'}
                      </span>
                      <span className="text-sky-300">
                        Túi {carry}/{MAX_UNIT_CARRY_SLOTS}
                        {promoReady ? ' · ★' : ''}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Selected Hero Camp Pavilion */}
          {selectedHero && heroEffStats && heroDialogue && (
            <div className="overflow-y-auto p-5 chronicle-scroll bg-[#0e1424]">
              <div className="max-w-[960px] mx-auto flex flex-col gap-4">
                {/* Hero Showcase Card */}
                <div className="p-4 bg-[#121a2d] border border-amber-500/35 flex flex-wrap items-center gap-4">
                  <div className="w-24 h-28 shrink-0 bg-[#080c15] border-2 border-amber-500/55 overflow-hidden">
                    <img
                      src={
                        (selectedHero.portraitKey && PORTRAIT_ASSETS[selectedHero.portraitKey]) ||
                        PORTRAIT_ASSETS[selectedHero.templateId] ||
                        getUnitPortraitDataUrl(selectedHero)
                      }
                      alt={selectedHero.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top pixel-art"
                    />
                  </div>

                  <div className="w-24 h-28 shrink-0 bg-[radial-gradient(circle_at_50%_72%,#1e2d4a_0%,#080c15_75%)] border border-sky-400/45 flex items-center justify-center">
                    <img
                      src={getUnitSpriteDataUrl(selectedHero, 0)}
                      alt={selectedHero.name}
                      className="w-20 h-24 object-contain pixel-art"
                    />
                  </div>

                  <div className="flex-1 min-w-[260px]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-2xl font-bold text-amber-100">
                          {selectedHero.name}
                        </h3>
                        <span className="text-xs text-amber-300 font-semibold">
                          {selectedHero.title ? `${selectedHero.title} · ` : ''}
                          {selectedHero.className}
                        </span>
                        {heroTitle && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border ${
                              TITLE_RARITY_META[heroTitle.rarity].badge
                            }`}
                          >
                            <Award className="w-3 h-3" />
                            {heroTitle.name}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {selectedHero.isLord ? (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-amber-950/70 text-amber-200 border border-amber-400/50 flex items-center gap-1 whitespace-nowrap">
                            <Crown className="w-3.5 h-3.5" /> Chủ Tướng Bắt Buộc
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              onTogglePreferredSquadHero(
                                selectedHero.templateId,
                                nextMapMeta.maxDeploySlots
                              )
                            }
                            className={`px-3 py-1 text-xs font-semibold border cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                              preferredSet.has(selectedHero.templateId)
                                ? 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-300'
                                : 'bg-[#192338] hover:bg-[#23314e] text-slate-200 border-slate-600'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>
                              {preferredSet.has(selectedHero.templateId)
                                ? 'Đang Trong Đội Hình Xuất Trận'
                                : 'Đưa Vào Đội Hình Xuất Trận'}
                            </span>
                          </button>
                        )}

                        {campUnits.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setTradeLeftId(selectedHero.id);
                              const partner = campUnits.find((u) => u.id !== selectedHero.id);
                              if (partner) setTradeRightId(partner.id);
                              setStation('TRADE');
                            }}
                            className="px-3 py-1 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-300/60 cursor-pointer flex items-center gap-1 whitespace-nowrap"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                            <span>Trao Đổi Đồ</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setStation('CONVOY')}
                          className="px-3 py-1 text-xs font-semibold bg-sky-700 hover:bg-sky-600 text-white border border-sky-300/60 cursor-pointer flex items-center gap-1 whitespace-nowrap"
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>Kho Quân Đoàn</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono-num text-slate-300">
                      <span className="text-amber-200 font-bold">Lv.{selectedHero.level}</span>
                      <span className="text-sky-300">EXP {selectedHero.exp}/100</span>
                      <span className="text-emerald-300">
                        Túi đồ: {getUnitCarryCount(selectedHero)}/{MAX_UNIT_CARRY_SLOTS} (Thuốc:{' '}
                        {selectedHero.potions})
                      </span>
                      <span>
                        Vũ khí chính: <strong className="text-amber-100">{selectedHero.weapon.name}</strong> (
                        {WEAPON_TYPE_LABEL[selectedHero.weapon.type]})
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 mt-3 font-mono-num text-center">
                      {(
                        [
                          ['HP', heroEffStats.maxHp],
                          ['STR', heroEffStats.str],
                          ['MAG', heroEffStats.mag],
                          ['SKL', heroEffStats.skl],
                          ['SPD', heroEffStats.spd],
                          ['LCK', heroEffStats.lck],
                          ['DEF', heroEffStats.def],
                          ['RES', heroEffStats.res],
                          ['MOV', heroEffStats.mov],
                        ] as Array<[string, number]>
                      ).map(([lbl, val]) => (
                        <div key={lbl} className="bg-[#0c1220] border border-slate-700/75 py-1">
                          <div className="text-[10px] text-slate-400">{lbl}</div>
                          <div className="text-xs font-bold text-slate-100">{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Camp Interaction Row: Campfire Conversation + Sparring Yard */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Left 7 cols: Interactive Campfire Conversation */}
                  <div className="lg:col-span-7 bg-[#121a2d] border border-slate-700/80 p-4 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-display font-bold text-sm text-amber-200 flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-amber-300" />
                          <span>Trò Chuyện Bên Lửa Trại Cùng {selectedHero.name}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {TOPIC_LABELS.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setActiveTopic(t.id)}
                            className={`px-2.5 py-1 text-xs font-medium border cursor-pointer whitespace-nowrap ${
                              activeTopic === t.id
                                ? 'bg-amber-600 text-slate-950 border-amber-200 font-semibold'
                                : 'bg-[#0d1322] text-slate-300 border-slate-700 hover:border-amber-400/50'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      <div className="p-3.5 bg-[#0b101d] border border-amber-500/25 text-sm text-slate-200 leading-relaxed">
                        “{heroDialogue[activeTopic]}”
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1 border-t border-slate-800">
                      <span>Kỹ năng sở hữu:</span>
                      {selectedHero.skills.map((sid) => (
                        <span key={sid} className="text-violet-300 font-medium">
                          {SKILLS[sid]?.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right 5 cols: Sparring Drill & Quick Upgrades */}
                  <div className="lg:col-span-5 bg-[#121a2d] border border-slate-700/80 p-4 flex flex-col justify-between gap-3">
                    <div>
                      <div className="font-display font-bold text-sm text-amber-200 flex items-center gap-1.5 mb-1.5">
                        <Swords className="w-4 h-4 text-sky-300" />
                        <span>Sân Đấu Tập Huấn Luyện</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Cho phép tướng dự bị hoặc cấp thấp đấu tập cùng đồng đội tại doanh trại để nhận{' '}
                        <strong className="text-sky-300">+{CAMP_SPARRING_EXP_GAIN} EXP</strong> mỗi hiệp
                        (tối đa tới Lv.{maxSparLevel} theo tiến độ hiện tại).
                      </p>

                      <div className="mt-3 p-2.5 bg-[#0b101d] border border-slate-700/75 text-xs flex items-center justify-between font-mono-num">
                        <span>
                          Cấp hiện tại: <strong className="text-amber-200">Lv.{selectedHero.level}</strong>{' '}
                          ({selectedHero.exp}/100 EXP)
                        </span>
                        <span className="text-amber-300 font-bold">
                          Chi phí: {CAMP_SPARRING_COST_GOLD}G
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        data-testid="camp-btn-spar"
                        disabled={
                          selectedHero.level >= maxSparLevel ||
                          (saveData.gold ?? 0) < CAMP_SPARRING_COST_GOLD
                        }
                        onClick={() => {
                          const res = onSparTrainUnit(selectedHero.id);
                          setCampFeedback(res.message);
                        }}
                        className="w-full py-2 px-3 text-xs font-bold bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white border border-sky-300/70 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>
                          {selectedHero.level >= maxSparLevel
                            ? `Đã Đạt Trần Huấn Luyện Doanh Trại (Lv.${maxSparLevel})`
                            : `Đấu Tập Với Đồng Đội (-${CAMP_SPARRING_COST_GOLD}G · +${CAMP_SPARRING_EXP_GAIN} EXP)`}
                        </span>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenRosterModal(selectedHero.id, 'FORGE')}
                          className="py-1.5 px-2.5 text-xs font-semibold bg-[#182238] hover:bg-[#22304e] text-amber-200 border border-amber-400/45 cursor-pointer whitespace-nowrap"
                        >
                          Rèn Giáp &amp; Vũ Khí
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenRosterModal(selectedHero.id, 'PROMOTE')}
                          className="py-1.5 px-2.5 text-xs font-semibold bg-[#182238] hover:bg-[#22304e] text-sky-200 border border-sky-400/45 cursor-pointer whitespace-nowrap"
                        >
                          Tiến Hóa &amp; Đổi Phái
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Equipped Gear Summary + Default Battle Formation Selector */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-7 bg-[#121a2d] border border-slate-700/80 p-3.5">
                    <div className="text-xs font-display font-bold text-amber-200 mb-2 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-300" />
                      <span>
                        Túi Đồ Cá Nhân ({getUnitCarryCount(selectedHero)}/{MAX_UNIT_CARRY_SLOTS} món,
                        không kể trang bị đang đeo) &amp; 5 Ô Giáp Của {selectedHero.name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mb-2">
                      Đang cầm: <span className="text-sky-300 font-semibold">{selectedHero.weapon.name}</span>{' '}
                      (0 ô túi) · Vũ khí dự phòng trong túi (
                      {Math.max(0, selectedHero.inventory.length - 1)}):{' '}
                      <span className="text-amber-200 font-semibold">
                        {selectedHero.inventory
                          .filter((w, i) => !(w.id === selectedHero.weapon.id && selectedHero.inventory.findIndex((c) => c.id === selectedHero.weapon.id) === i))
                          .map((w) => w.name)
                          .join(' · ') || 'Không có'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      {ARMOR_SLOTS.map((slot) => {
                        const eq = selectedHero.equipment?.[slot];
                        const tpl = eq ? ARMOR_TEMPLATES[eq.templateId] : null;
                        return (
                          <div
                            key={slot}
                            className="p-2 bg-[#0b101d] border border-slate-800 text-[11px]"
                          >
                            <div className="text-slate-400">{ARMOR_SLOT_META[slot].shortLabel}</div>
                            {eq && tpl ? (
                              <div
                                className="font-bold truncate mt-0.5"
                                style={{ color: EQUIPMENT_RARITY_META[eq.rarity].color }}
                              >
                                {tpl.name}
                                {eq.temperLevel > 0 ? ` +${eq.temperLevel}` : ''}
                              </div>
                            ) : (
                              <div className="text-slate-500 italic mt-0.5">Chưa mặc</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-[#121a2d] border border-slate-700/80 p-3.5 flex flex-col justify-between gap-2">
                    <div className="text-xs font-display font-bold text-amber-200">
                      Thế Trận Mặc Định Khi Xuất Chinh
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {CAMP_FORMATION_PRESETS.map((preset) => {
                        const active = activeFormation === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => onSelectPreferredFormation(preset.id)}
                            className={`p-2 text-left border text-xs cursor-pointer ${
                              active
                                ? 'bg-amber-950/70 border-amber-400 text-amber-100'
                                : 'bg-[#0b101d] border-slate-800 text-slate-300 hover:border-slate-600'
                            }`}
                          >
                            <div className="font-bold truncate">{preset.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {preset.shortHint}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
