import { useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  Coins,
  Crown,
  Hammer,
  Lock,
  Package,
  RefreshCw,
  Shield,
  ShoppingBag,
  Sparkles,
  Swords,
  X,
} from 'lucide-react';
import { ConvoyPanel } from './ConvoyPanel';
import { EquipmentForgePanel } from './EquipmentForgePanel';
import {
  CLASS_LINEAGES,
  CLASS_META,
  getUnitTitleBonuses,
  ITEMS,
  MAGIC_ELEMENT_LABEL,
  PORTRAIT_ASSETS,
  SKILLS,
  TITLE_LIST,
  TITLE_RARITY_META,
  TITLES,
  WEAPON_TYPE_LABEL,
  WEAPONS,
} from '../game/data';
import {
  canPromoteUnit,
  canUnitAccessConvoy,
  canUnitEquipWeapon,
  findAvailableSealForUnit,
  getAdjacentTradePartners,
  getEffectiveUnitStats,
  getPromotionChain,
  getUnitCarriedItemCounts,
  getUnitCarryCount,
  MAX_UNIT_CARRY_SLOTS,
} from '../game/engine';
import { getUnitPortraitDataUrl, getUnitSpriteDataUrl } from '../game/pixelSprites';
import type {
  ArmorSlot,
  EquipmentInstance,
  GameItem,
  MoveType,
  TitleDef,
  Unit,
  UnitClassId,
  Weapon,
  WeaponForgeState,
} from '../game/types';

export type RosterModalTab =
  | 'FORGE'
  | 'WEAPONS'
  | 'ITEMS'
  | 'CONVOY'
  | 'SKILLS'
  | 'PROMOTE'
  | 'TITLES'
  | 'CODEX';

interface RosterArmoryModalProps {
  units: Unit[];
  deployedUnits?: Unit[];
  isFreeLogistics?: boolean;
  isOutOfBattle?: boolean;
  gold: number;
  itemBag: Record<string, number>;
  convoyWeaponIds: string[];
  equipmentBag: EquipmentInstance[];
  weaponForges: Record<string, WeaponForgeState>;
  unlockedTitleIds: string[];
  commanderTitleId: string;
  initialSelectedUnitId?: string | null;
  initialTab?: RosterModalTab;
  onEquipWeapon: (unitId: string, weaponId: string) => void;
  onEquipArmor: (unitId: string, uid: string) => void;
  onUnequipArmor: (unitId: string, slot: ArmorSlot) => void;
  onTemperArmor: (uid: string) => void;
  onLevelUpArmor: (uid: string) => void;
  onSocketArmorGem: (uid: string, gemId: string) => void;
  onUnsocketArmorGem: (uid: string, socketIndex: number) => void;
  onFuseArmor: (baseUid: string, materialUid: string) => void;
  onTemperWeapon: (weaponId: string) => void;
  onLevelUpWeapon: (weaponId: string) => void;
  onSocketWeaponGem: (weaponId: string, gemId: string) => void;
  onUnsocketWeaponGem: (weaponId: string, socketIndex: number) => void;
  onFuseWeapon: (weaponId: string) => void;
  onUseItem: (unitId: string, itemId: string) => void;
  onPromoteUnit: (unitId: string) => void;
  onEquipHeroTitle: (unitId: string, titleId: string) => void;
  onEquipCommanderTitle: (titleId: string) => void;
  onReclassUnit?: (unitId: string, targetTier1ClassId: UnitClassId) => void;
  onOpenTradeWithPartner?: (unitId: string, partnerId: string) => void;
  onStoreWeaponToConvoy?: (unitId: string, weaponId: string) => { ok: boolean; message?: string };
  onWithdrawConvoyWeapon?: (
    unitId: string,
    weaponId: string,
    equipNow?: boolean
  ) => { ok: boolean; message?: string };
  onStorePotionToConvoy?: (unitId: string) => { ok: boolean; message?: string };
  onWithdrawPotionFromConvoy?: (unitId: string) => { ok: boolean; message?: string };
  onStorePersonalItemToConvoy?: (
    unitId: string,
    itemIndex: number
  ) => { ok: boolean; message?: string };
  onWithdrawItemFromConvoy?: (unitId: string, itemId: string) => { ok: boolean; message?: string };
  onStoreCarriedArmorToConvoy?: (
    unitId: string,
    armorUid: string
  ) => { ok: boolean; message?: string };
  onWithdrawArmorToPack?: (unitId: string, armorUid: string) => { ok: boolean; message?: string };
  onOpenShop?: () => void;
  onClose: () => void;
}

const TIER_ROMAN = ['', 'I', 'II', 'III', 'IV'] as const;

const TIER_VISUAL_CAPTION = [
  '',
  'Trang bị chuẩn Thế Chiến I',
  'Nâng cấp khí tài & giáp cơ giới',
  'Phiên bản Tinh Nhuệ Thế Chiến II',
  'Khí tài Chiến Lược Đỉnh Cao',
] as const;

const MOVE_TYPE_LABELS: Record<'ALL' | MoveType, string> = {
  ALL: 'Tất cả (30)',
  FOOT: 'Bộ Binh / Pháo',
  MOUNTED: 'Cơ Giới / Xe Tăng',
  FLYING: 'Không Quân / Trực Thăng',
  ARMORED: 'Tăng Hạng Nặng',
  NAVAL: 'Hải Quân / Hạm Đội',
};

const TITLE_CATEGORY_LABELS: Record<'ALL' | TitleDef['category'], string> = {
  ALL: 'Tất cả',
  STARTER: 'Khởi đầu',
  COMBAT: 'Chiến đấu',
  CAMPAIGN: 'Chiến dịch',
  EVOLUTION: 'Tiến hóa',
  WEALTH: 'Thương hội',
  WEATHER: 'Thời tiết',
};

function getCodexPreviewWeapon(weaponType: Weapon['type']): Weapon {
  switch (weaponType) {
    case 'SWORD':
      return WEAPONS.steel_sword ?? WEAPONS.iron_sword;
    case 'LANCE':
      return WEAPONS.steel_lance ?? WEAPONS.iron_lance;
    case 'AXE':
      return WEAPONS.killer_axe ?? WEAPONS.iron_axe;
    case 'BOW':
      return WEAPONS.hunting_bow;
    case 'TOME':
      return WEAPONS.thunder_tome ?? WEAPONS.fire_tome;
    case 'STAFF':
      return WEAPONS.mend_staff ?? WEAPONS.heal_staff;
    default:
      return WEAPONS.iron_sword;
  }
}

export function RosterArmoryModal({
  units,
  deployedUnits,
  isFreeLogistics = true,
  isOutOfBattle,
  gold,
  itemBag,
  convoyWeaponIds,
  equipmentBag,
  weaponForges,
  unlockedTitleIds,
  commanderTitleId,
  initialSelectedUnitId,
  initialTab = 'FORGE',
  onEquipWeapon,
  onEquipArmor,
  onUnequipArmor,
  onTemperArmor,
  onLevelUpArmor,
  onSocketArmorGem,
  onUnsocketArmorGem,
  onFuseArmor,
  onTemperWeapon,
  onLevelUpWeapon,
  onSocketWeaponGem,
  onUnsocketWeaponGem,
  onFuseWeapon,
  onUseItem,
  onPromoteUnit,
  onEquipHeroTitle,
  onEquipCommanderTitle,
  onReclassUnit,
  onOpenTradeWithPartner,
  onStoreWeaponToConvoy,
  onWithdrawConvoyWeapon,
  onStorePotionToConvoy,
  onWithdrawPotionFromConvoy,
  onStorePersonalItemToConvoy,
  onWithdrawItemFromConvoy,
  onStoreCarriedArmorToConvoy,
  onWithdrawArmorToPack,
  onOpenShop,
  onClose,
}: RosterArmoryModalProps) {
  const resolvedOutOfBattle = isOutOfBattle ?? isFreeLogistics;
  const allies = useMemo(() => units.filter((u) => u.faction === 'PLAYER' && u.hp > 0), [units]);
  const [selectedId, setSelectedId] = useState<string>(() => {
    if (initialSelectedUnitId && allies.some((u) => u.id === initialSelectedUnitId)) {
      return initialSelectedUnitId;
    }
    return allies[0]?.id ?? '';
  });
  const [activeTab, setActiveTab] = useState<RosterModalTab>(initialTab);
  const [itemNotice, setItemNotice] = useState<string | null>(null);
  const [codexMoveFilter, setCodexMoveFilter] = useState<'ALL' | MoveType>('ALL');
  const [codexSearch, setCodexSearch] = useState('');
  const [titleCategoryFilter, setTitleCategoryFilter] = useState<'ALL' | TitleDef['category']>('ALL');

  const unlockedTitleSet = useMemo(() => new Set(unlockedTitleIds), [unlockedTitleIds]);

  const unit = allies.find((u) => u.id === selectedId) ?? allies[0] ?? null;
  const activeFieldAllies = deployedUnits ?? allies;
  const hasConvoyAccess = useMemo(
    () => (unit ? canUnitAccessConvoy(unit, activeFieldAllies, resolvedOutOfBattle) : false),
    [unit, activeFieldAllies, resolvedOutOfBattle]
  );
  const adjacentPartners = useMemo(
    () => (unit && !isFreeLogistics ? getAdjacentTradePartners(unit, activeFieldAllies) : []),
    [unit, isFreeLogistics, activeFieldAllies]
  );

  const accessibleItemBag = useMemo<Record<string, number>>(() => {
    if (resolvedOutOfBattle) return itemBag;
    return unit ? getUnitCarriedItemCounts(unit) : {};
  }, [resolvedOutOfBattle, itemBag, unit]);

  const classMeta = unit ? CLASS_META[unit.classId] : null;
  const promo = classMeta?.promotion ?? null;
  const promoTargetMeta = promo ? CLASS_META[promo.toClass] : null;
  const isPromoReady = unit ? canPromoteUnit(unit, accessibleItemBag) : false;
  const availableSeal = unit ? findAvailableSealForUnit(unit, accessibleItemBag) : null;

  const promotionChain = useMemo(() => {
    if (!unit) return [];
    const ids = getPromotionChain(unit.classId);
    return ids.map((cid, idx) => {
      const meta = CLASS_META[cid];
      const prevPromo = idx > 0 ? CLASS_META[ids[idx - 1]]?.promotion : undefined;
      return {
        classId: cid,
        meta,
        tier: meta.tier,
        minLevel: prevPromo?.minLevel ?? null,
        sealItemId: prevPromo?.sealItemId ?? null,
      };
    });
  }, [unit]);

  const equippableWeapons = useMemo<Weapon[]>(() => {
    if (!unit) return [];
    const seen = new Set<string>();
    const list: Weapon[] = [];
    for (const w of unit.inventory) {
      if (!seen.has(w.id) && canUnitEquipWeapon(unit, w)) {
        seen.add(w.id);
        list.push(w);
      }
    }
    if (hasConvoyAccess) {
      for (const wid of convoyWeaponIds) {
        const w = WEAPONS[wid];
        if (w && !seen.has(w.id) && canUnitEquipWeapon(unit, w)) {
          seen.add(w.id);
          list.push(w);
        }
      }
    }
    return list.sort((a, b) => (b.tier ?? 1) - (a.tier ?? 1) || b.might - a.might);
  }, [unit, convoyWeaponIds, hasConvoyAccess]);

  const usableBagItems = useMemo<Array<{ item: GameItem; count: number }>>(() => {
    const entries: Array<{ item: GameItem; count: number }> = [];
    const sourceCounts: Record<string, number> = { ...accessibleItemBag };
    if (!resolvedOutOfBattle && unit && unit.potions > 0) {
      sourceCounts.vulnerary = (sourceCounts.vulnerary ?? 0) + unit.potions;
    }
    for (const [id, count] of Object.entries(sourceCounts)) {
      if (count <= 0) continue;
      const item = ITEMS[id];
      if (!item) continue;
      if (
        item.category === 'POTION' ||
        item.category === 'STAT_BOOST' ||
        item.category === 'EXP_MANUAL'
      ) {
        entries.push({ item, count });
      }
    }
    const order = { STAT_BOOST: 0, EXP_MANUAL: 1, POTION: 2 };
    return entries.sort(
      (a, b) =>
        (order[a.item.category as keyof typeof order] ?? 9) -
          (order[b.item.category as keyof typeof order] ?? 9) ||
        b.item.price - a.item.price
    );
  }, [accessibleItemBag, resolvedOutOfBattle, unit]);

  const currentSpriteUrl = unit ? getUnitSpriteDataUrl(unit, 0) : '';
  const currentPortraitUrl = unit
    ? (unit.portraitKey && PORTRAIT_ASSETS[unit.portraitKey]) ||
      PORTRAIT_ASSETS[unit.templateId] ||
      getUnitPortraitDataUrl(unit)
    : '';
  const unitTitleBonus = useMemo(
    () => (unit ? getUnitTitleBonuses(unit, commanderTitleId) : null),
    [unit, commanderTitleId]
  );
  const unitEffStats = useMemo(
    () => (unit ? getEffectiveUnitStats(unit, commanderTitleId) : null),
    [unit, commanderTitleId]
  );
  const unitPersonalTitle = unit?.equippedTitleId ? TITLES[unit.equippedTitleId] : null;
  const commanderTitle = commanderTitleId ? TITLES[commanderTitleId] : null;

  const filteredLineages = useMemo(() => {
    const q = codexSearch.trim().toLowerCase();
    return CLASS_LINEAGES.filter((lin) => {
      if (codexMoveFilter !== 'ALL' && lin.moveType !== codexMoveFilter) return false;
      if (!q) return true;
      return lin.tiers.some((t) => t.name.toLowerCase().includes(q));
    });
  }, [codexMoveFilter, codexSearch]);

  const filteredTitles = useMemo(() => {
    return TITLE_LIST.filter(
      (t) => titleCategoryFilter === 'ALL' || t.category === titleCategoryFilter
    );
  }, [titleCategoryFilter]);

  const masterSeals = accessibleItemBag.master_seal ?? 0;
  const royalCrests = accessibleItemBag.royal_crest ?? 0;
  const mythicCrowns = accessibleItemBag.mythic_crown ?? 0;
  const omniSeals = accessibleItemBag.omni_seal ?? 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quân Đoàn, 30 Hệ Phái, Danh Hiệu và Tiến Hóa 3 Cấp"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <div className="w-full max-w-[1180px] max-h-[91vh] tactical-panel flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#0c101b] border-b border-amber-500/35">
          <div className="flex items-center gap-2.5 min-w-0">
            <Crown className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold text-amber-100 leading-tight truncate">
                QUÂN ĐOÀN · 30 HỆ PHÁI · DANH HIỆU &amp; TIẾN HÓA 3 CẤP
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                {resolvedOutOfBattle
                  ? `Ngoài trận: Kho Quân Đoàn đang mở · Túi tối đa ${MAX_UNIT_CARRY_SLOTS} món/tướng (không kể Mũ, Giáp, Giày & Vũ khí đang đeo)`
                  : `Trong trận: Kho Quân Đoàn niêm phong · Túi tối đa ${MAX_UNIT_CARRY_SLOTS} món/tướng (không kể Mũ, Giáp, Giày & Vũ khí đang đeo)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-2.5 py-1 bg-[#141c2e] border border-amber-400/45 text-[11px] font-mono-num text-amber-200 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">{gold.toLocaleString('vi-VN')} G</span>
            </div>

            {resolvedOutOfBattle ? (
              <div className="px-2.5 py-1 bg-amber-950/60 border border-amber-400/40 text-[11px] font-mono-num text-amber-100 flex items-center gap-2.5">
                <span title="Ấn Tiến Hóa Bậc II (Lv.5)">Ấn II: <b className="text-amber-300">{masterSeals}</b></span>
                <span title="Vương Ấn Bậc III (Lv.15)">Vương III: <b className="text-sky-300">{royalCrests}</b></span>
                <span title="Thần Miện Bậc IV (Lv.30)">Thần IV: <b className="text-fuchsia-300">{mythicCrowns}</b></span>
                {omniSeals > 0 && (
                  <span title="Thánh Ấn Toàn Năng">Toàn Ấn: <b className="text-emerald-300">{omniSeals}</b></span>
                )}
              </div>
            ) : (
              <div className="px-2.5 py-1 bg-rose-950/50 border border-rose-400/45 text-[11px] font-mono-num text-rose-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-300" />
                <span>Kho Quân Đoàn: Khóa Trong Trận</span>
              </div>
            )}

            {resolvedOutOfBattle && onOpenShop && (
              <button
                type="button"
                onClick={onOpenShop}
                className="px-2.5 py-1 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-slate-950 border border-amber-300/75 cursor-pointer flex items-center gap-1 whitespace-nowrap"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Quân Nhu</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng Quân Đoàn"
              className="w-8 h-8 flex items-center justify-center bg-[#182032] hover:bg-[#24304a] text-slate-200 border border-slate-600/60 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Split */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[255px_1fr] overflow-hidden">
          {/* Left: Active Party Roster */}
          <div className="border-r border-amber-500/25 bg-[#0e1320] overflow-y-auto p-2.5 flex flex-col gap-1.5 chronicle-scroll">
            {allies.map((hero) => {
              const selected = hero.id === unit?.id;
              const heroBag = resolvedOutOfBattle ? itemBag : getUnitCarriedItemCounts(hero);
              const ready = canPromoteUnit(hero, heroBag);
              const carryCount = getUnitCarryCount(hero);
              const thumb = getUnitSpriteDataUrl(hero, 0);
              return (
                <button
                  key={hero.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(hero.id);
                    setItemNotice(null);
                  }}
                  className={`w-full flex items-center gap-2.5 p-2 text-left border transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[#1c2842] border-amber-400/80 text-amber-50'
                      : 'bg-[#131928] hover:bg-[#192238] border-slate-700/60 text-slate-200'
                  }`}
                >
                  <div className="w-14 h-14 shrink-0 bg-[#0b0f19] border border-slate-700/70 flex items-center justify-center overflow-hidden">
                    <img
                      src={thumb}
                      alt={hero.name}
                      className="w-[52px] h-[52px] object-contain pixel-art"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-display font-bold text-sm truncate">{hero.name}</span>
                      <span className="font-mono-num text-[11px] text-amber-300">Lv.{hero.level}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                      <span className="truncate">{hero.className}</span>
                      {hero.tier >= 2 && (
                        <span
                          className={`font-bold shrink-0 ${
                            hero.tier === 4
                              ? 'text-fuchsia-300'
                              : hero.tier === 3
                              ? 'text-sky-300'
                              : 'text-amber-300'
                          }`}
                        >
                          ★{TIER_ROMAN[hero.tier]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono-num mt-0.5">
                      <span className="text-sky-300">
                        HP {hero.hp}/{getEffectiveUnitStats(hero, commanderTitleId).maxHp}
                      </span>
                      <span
                        className={
                          carryCount >= MAX_UNIT_CARRY_SLOTS ? 'text-rose-300 font-bold' : 'text-slate-400'
                        }
                      >
                        Túi {carryCount}/{MAX_UNIT_CARRY_SLOTS}
                        {ready ? ' · ★' : ''}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Selected Hero Showcase + 4 Tabs */}
          {unit && classMeta && (
            <div className="flex flex-col min-h-0 overflow-hidden bg-[#111726]">
              {/* Top Hero Profile Strip: RPG Bust Portrait + 64x72 Full-Body HD-2D Pedestal */}
              <div className="p-4 border-b border-amber-500/25 bg-[#0d121f] flex flex-wrap items-center gap-3.5">
                <div className="w-28 h-28 shrink-0 bg-[#080c15] border-2 border-amber-500/50 overflow-hidden relative shadow-[0_6px_16px_rgba(0,0,0,0.6)]">
                  <img
                    src={currentPortraitUrl}
                    alt={`Chân dung ${unit.name}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top pixel-art"
                  />
                </div>
                <div className="w-28 h-28 shrink-0 bg-[radial-gradient(circle_at_50%_72%,#1e2d4a_0%,#080c15_75%)] border-2 border-sky-400/45 flex items-center justify-center relative">
                  <img
                    src={currentSpriteUrl}
                    alt={unit.name}
                    className="w-24 h-24 object-contain pixel-art drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)]"
                  />
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-[#0c101b]/95 border border-amber-400/50 text-[10px] font-mono-num text-amber-200">
                    Bậc {TIER_ROMAN[unit.tier]}
                  </div>
                </div>

                <div className="flex-1 min-w-[240px]">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-xl font-bold text-amber-100">
                        {unit.name}
                      </span>
                      <span className="text-xs text-amber-300/95 font-semibold">
                        {unit.className}
                      </span>
                      {unitPersonalTitle && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border ${
                            TITLE_RARITY_META[unitPersonalTitle.rarity].badge
                          }`}
                        >
                          <Award className="w-3 h-3" />
                          {unitPersonalTitle.name}
                        </span>
                      )}
                    </div>
                    <div className="font-mono-num text-xs text-slate-300 flex items-center gap-3">
                      <span className="font-bold text-amber-200">Lv.{unit.level}</span>
                      <span className="text-sky-300">EXP {unit.exp}/100</span>
                      <span className="text-violet-300">SP {unit.sp}/{unit.maxSp}</span>
                      <span
                        className={
                          getUnitCarryCount(unit) >= MAX_UNIT_CARRY_SLOTS
                            ? 'text-rose-300 font-bold'
                            : 'text-emerald-300 font-bold'
                        }
                      >
                        Túi {getUnitCarryCount(unit)}/{MAX_UNIT_CARRY_SLOTS}
                      </span>
                    </div>
                  </div>

                  <div className="mt-1.5 text-xs text-slate-300 flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-400">Thông thạo:</span>
                    {classMeta.allowedWeaponTypes.map((wt) => (
                      <span
                        key={wt}
                        className="px-2 py-0.5 bg-[#192338] border border-slate-600/60 text-amber-200 text-[11px]"
                      >
                        {WEAPON_TYPE_LABEL[wt]}
                      </span>
                    ))}
                    <span className="text-slate-400 ml-2">Đang cầm:</span>
                    <span className="text-sky-200 font-semibold">{unit.weapon.name}</span>
                  </div>

                  {/* Full 9-Stat Matrix with Title Bonuses */}
                  <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 mt-2.5 font-mono-num text-center">
                    {(
                      [
                        [
                          'HP',
                          `${unit.hp}/${unitEffStats?.maxHp ?? unit.stats.maxHp}`,
                          (unitEffStats?.maxHp ?? unit.stats.maxHp) - unit.stats.maxHp,
                        ],
                        [
                          'STR',
                          unitEffStats?.str ?? unit.stats.str,
                          (unitEffStats?.str ?? unit.stats.str) - unit.stats.str,
                        ],
                        [
                          'MAG',
                          unitEffStats?.mag ?? unit.stats.mag,
                          (unitEffStats?.mag ?? unit.stats.mag) - unit.stats.mag,
                        ],
                        [
                          'SKL',
                          unitEffStats?.skl ?? unit.stats.skl,
                          (unitEffStats?.skl ?? unit.stats.skl) - unit.stats.skl,
                        ],
                        [
                          'SPD',
                          unitEffStats?.spd ?? unit.stats.spd,
                          (unitEffStats?.spd ?? unit.stats.spd) - unit.stats.spd,
                        ],
                        [
                          'LCK',
                          unitEffStats?.lck ?? unit.stats.lck,
                          (unitEffStats?.lck ?? unit.stats.lck) - unit.stats.lck,
                        ],
                        [
                          'DEF',
                          unitEffStats?.def ?? unit.stats.def,
                          (unitEffStats?.def ?? unit.stats.def) - unit.stats.def,
                        ],
                        [
                          'RES',
                          unitEffStats?.res ?? unit.stats.res,
                          (unitEffStats?.res ?? unit.stats.res) - unit.stats.res,
                        ],
                        [
                          'MOV',
                          unitEffStats?.mov ?? unit.stats.mov,
                          (unitEffStats?.mov ?? unit.stats.mov) - unit.stats.mov,
                        ],
                      ] as Array<[string, string | number, number]>
                    ).map(([label, val, bonus]) => (
                      <div
                        key={label}
                        className="bg-[#141c2e] border border-slate-700/70 py-1 px-1"
                      >
                        <div className="text-[10px] text-slate-400">{label}</div>
                        <div className={`text-xs font-bold ${bonus > 0 ? 'text-emerald-300' : 'text-slate-100'}`}>
                          {val}
                          {bonus > 0 && label !== 'HP' && (
                            <span className="text-[9px] text-emerald-400 ml-0.5">(+{bonus})</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center overflow-x-auto border-b border-amber-500/25 bg-[#0c101b] px-3 gap-0.5">
                <button
                  type="button"
                  data-testid="roster-tab-forge"
                  onClick={() => setActiveTab('FORGE')}
                  className={`px-2.5 py-2 text-[11px] font-semibold flex items-center gap-1 border-b-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'FORGE'
                      ? 'border-amber-400 text-amber-200 bg-[#151d30]'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Hammer className="w-3.5 h-3.5 text-amber-300" />
                  <span>Giáp &amp; Lò Rèn</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('WEAPONS')}
                  className={`px-2.5 py-2 text-[11px] font-semibold flex items-center gap-1 border-b-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'WEAPONS'
                      ? 'border-amber-400 text-amber-200 bg-[#151d30]'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Vũ Khí ({equippableWeapons.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('ITEMS')}
                  className={`px-2.5 py-2 text-[11px] font-semibold flex items-center gap-1 border-b-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'ITEMS'
                      ? 'border-amber-400 text-amber-200 bg-[#151d30]'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Package className="w-3.5 h-3.5 text-emerald-300" />
                  <span>
                    {resolvedOutOfBattle
                      ? `Vật Phẩm (${usableBagItems.length})`
                      : `Túi Cá Nhân (${usableBagItems.length})`}
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="roster-tab-convoy"
                  onClick={() => setActiveTab('CONVOY')}
                  className={`px-2.5 py-2 text-[11px] font-semibold flex items-center gap-1 border-b-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'CONVOY'
                      ? 'border-amber-400 text-amber-200 bg-[#151d30]'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {resolvedOutOfBattle ? (
                    <Package className="w-3.5 h-3.5 text-amber-300" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-rose-300" />
                  )}
                  <span>Kho Quân Đoàn</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('SKILLS')}
                  className={`px-2.5 py-2 text-[11px] font-semibold flex items-center gap-1 border-b-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'SKILLS'
                      ? 'border-amber-400 text-amber-200 bg-[#151d30]'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Kỹ Năng ({unit.skills.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('PROMOTE')}
                  className={`px-2.5 py-2 text-[11px] font-semibold flex items-center gap-1 border-b-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'PROMOTE'
                      ? 'border-amber-400 text-amber-200 bg-[#151d30]'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tiến Hóa {isPromoReady ? '✦' : ''}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('TITLES')}
                  className={`px-2.5 py-2 text-[11px] font-semibold flex items-center gap-1 border-b-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'TITLES'
                      ? 'border-amber-400 text-amber-200 bg-[#151d30]'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Danh Hiệu ({unlockedTitleIds.length}/{TITLE_LIST.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('CODEX')}
                  className={`px-2.5 py-2 text-[11px] font-semibold flex items-center gap-1 border-b-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'CODEX'
                      ? 'border-amber-400 text-amber-200 bg-[#151d30]'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-sky-300" />
                  <span>30 Hệ Phái</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4 chronicle-scroll">
                {!resolvedOutOfBattle && activeTab !== 'CONVOY' && (
                  <div className="mb-3 px-3 py-2 bg-[#160f1e] border border-rose-500/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-amber-100 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                      <span>
                        <strong className="text-rose-200">Kho Quân Đoàn niêm phong trong trận (kể cả Chủ Tướng):</strong>{' '}
                        Mỗi tướng chỉ dùng đồ mang theo ({getUnitCarryCount(unit)}/{MAX_UNIT_CARRY_SLOTS} món) và trao đổi với đồng minh đứng sát cạnh (1 ô). Đồ rơi khi đầy túi sẽ tự gửi vào Kho!
                      </span>
                    </span>

                    {adjacentPartners.length > 0 && onOpenTradeWithPartner && (
                      <button
                        type="button"
                        onClick={() => onOpenTradeWithPartner(unit.id, adjacentPartners[0].id)}
                        className="px-2.5 py-1 text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-300/70 cursor-pointer flex items-center gap-1 whitespace-nowrap"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        <span>
                          Trao Đổi Với {adjacentPartners.map((p) => p.name).join(', ')} (1 ô)
                        </span>
                      </button>
                    )}
                  </div>
                )}

                {activeTab === 'CONVOY' && (
                  <ConvoyPanel
                    units={allies}
                    allKnownAllies={allies}
                    selectedUnitId={unit.id}
                    onSelectUnit={(id) => setSelectedId(id)}
                    isOutOfBattle={resolvedOutOfBattle}
                    convoyWeaponIds={convoyWeaponIds}
                    equipmentBag={equipmentBag}
                    itemBag={itemBag}
                    commanderTitleId={commanderTitleId}
                    onStoreWeapon={onStoreWeaponToConvoy ?? (() => ({ ok: false }))}
                    onWithdrawWeapon={onWithdrawConvoyWeapon ?? (() => ({ ok: false }))}
                    onStorePotion={onStorePotionToConvoy ?? (() => ({ ok: false }))}
                    onWithdrawPotion={onWithdrawPotionFromConvoy ?? (() => ({ ok: false }))}
                    onStorePersonalItem={onStorePersonalItemToConvoy ?? (() => ({ ok: false }))}
                    onWithdrawItem={onWithdrawItemFromConvoy ?? (() => ({ ok: false }))}
                    onStoreCarriedArmor={onStoreCarriedArmorToConvoy ?? (() => ({ ok: false }))}
                    onWithdrawArmorToPack={onWithdrawArmorToPack ?? (() => ({ ok: false }))}
                    onEquipConvoyArmor={onEquipArmor}
                    onUnequipWornArmorToConvoy={onUnequipArmor}
                  />
                )}

                {activeTab === 'FORGE' && (
                  <EquipmentForgePanel
                    unit={unit}
                    allies={allies}
                    deployedUnits={activeFieldAllies}
                    isFreeLogistics={isFreeLogistics}
                    isOutOfBattle={resolvedOutOfBattle}
                    gold={gold}
                    itemBag={itemBag}
                    equipmentBag={equipmentBag}
                    weaponForges={weaponForges}
                    convoyWeaponIds={convoyWeaponIds}
                    onEquipArmor={onEquipArmor}
                    onUnequipArmor={onUnequipArmor}
                    onTemperArmor={onTemperArmor}
                    onLevelUpArmor={onLevelUpArmor}
                    onSocketArmorGem={onSocketArmorGem}
                    onUnsocketArmorGem={onUnsocketArmorGem}
                    onFuseArmor={onFuseArmor}
                    onTemperWeapon={onTemperWeapon}
                    onLevelUpWeapon={onLevelUpWeapon}
                    onSocketWeaponGem={onSocketWeaponGem}
                    onUnsocketWeaponGem={onUnsocketWeaponGem}
                    onFuseWeapon={onFuseWeapon}
                    onOpenShop={resolvedOutOfBattle ? onOpenShop : undefined}
                  />
                )}

                {activeTab === 'WEAPONS' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {equippableWeapons.map((w) => {
                      const isEquipped = unit.weapon.id === w.id;
                      const rangeText =
                        w.minRange === w.maxRange ? `${w.minRange}` : `${w.minRange}-${w.maxRange}`;
                      return (
                        <div
                          key={w.id}
                          className={`p-3 border flex flex-col justify-between gap-2 ${
                            isEquipped
                              ? 'bg-[#1a2742] border-amber-400/80'
                              : 'bg-[#141b2b] border-slate-700/70 hover:border-slate-500'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-display font-bold text-sm text-amber-100">
                                {w.name}
                              </span>
                              <span className="text-[11px] font-mono-num text-amber-300 shrink-0">
                                Bậc {TIER_ROMAN[w.tier ?? 1]} · {WEAPON_TYPE_LABEL[w.type]}
                                {w.element && w.element !== 'NONE'
                                  ? ` · ${MAGIC_ELEMENT_LABEL[w.element]}`
                                  : ''}
                              </span>
                            </div>
                            {w.description && (
                              <p className="text-[11px] text-slate-300 mt-1">{w.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-mono-num text-slate-300">
                              {w.type === 'STAFF' ? (
                                <span className="text-emerald-300">Hồi +{w.healPower ?? 12}</span>
                              ) : (
                                <>
                                  <span>Uy lực {w.might}</span>
                                  <span>CX {w.hit}%</span>
                                  <span>CM {w.crit}%</span>
                                </>
                              )}
                              <span>Tầm {rangeText}</span>
                              {w.brave && <span className="text-amber-300 font-bold">×2 Đòn</span>}
                              {w.drainRatio && <span className="text-fuchsia-300">Hút HP</span>}
                              {w.ignoreDefenseRatio && <span className="text-sky-300">Xuyên Giáp</span>}
                            </div>
                          </div>

                          <div className="flex justify-end">
                            {isEquipped ? (
                              <span className="px-3 py-1 text-[11px] font-bold bg-amber-500/20 text-amber-200 border border-amber-400/50">
                                Đang trang bị
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onEquipWeapon(unit.id, w.id)}
                                className="px-3 py-1 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white border border-sky-300/60 cursor-pointer"
                              >
                                Trang bị ngay
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'ITEMS' && (
                  <div className="flex flex-col gap-3">
                    {itemNotice && (
                      <div className="px-3 py-2 text-xs bg-emerald-950/70 border border-emerald-400/50 text-emerald-200">
                        {itemNotice}
                      </div>
                    )}

                    {usableBagItems.length === 0 ? (
                      <div className="p-6 text-center bg-[#141b2b] border border-slate-700/70 text-xs text-slate-300">
                        {resolvedOutOfBattle ? (
                          <>
                            Kho Quân Đoàn hiện chưa có thuốc hồi phục, dược tăng chỉ số hay sách kinh nghiệm.
                            Hãy ghé <b>Quân Nhu Doanh Trại</b> để mua thêm hoặc rút vào túi của tướng trước khi xuất trận!
                          </>
                        ) : (
                          <>
                            Túi đồ cá nhân của <b>{unit.name}</b> hiện không mang theo vật phẩm tiêu hao nào.
                            Khi hết trận, hãy vào <b>Doanh Trại → Kho Quân Đoàn</b> để trang bị vào túi cá nhân!
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {usableBagItems.map(({ item, count }) => {
                          const canHeal =
                            item.category !== 'POTION' ||
                            unit.hp < (unitEffStats?.maxHp ?? unit.stats.maxHp) ||
                            (item.restoreSp ?? 0) > 0;
                          const badge =
                            item.category === 'STAT_BOOST'
                              ? 'Tăng Chỉ Số Vĩnh Viễn'
                              : item.category === 'EXP_MANUAL'
                              ? 'Bí Kíp EXP'
                              : 'Hồi Phục';
                          return (
                            <div
                              key={item.id}
                              className="p-3 bg-[#141b2b] border border-slate-700/75 flex flex-col justify-between gap-2"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-display font-bold text-sm text-amber-100">
                                    {item.name}
                                  </span>
                                  <span className="font-mono-num text-xs font-bold text-emerald-300">
                                    ×{count}
                                  </span>
                                </div>
                                <div className="text-[10px] uppercase tracking-wider text-amber-300/90 mt-0.5">
                                  {badge}
                                </div>
                                <p className="text-xs text-slate-300 mt-1">{item.description}</p>
                              </div>

                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  disabled={!canHeal}
                                  onClick={() => {
                                    onUseItem(unit.id, item.id);
                                    setItemNotice(`Đã dùng ${item.name} cho ${unit.name}!`);
                                  }}
                                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white border border-emerald-300/60 cursor-pointer whitespace-nowrap"
                                >
                                  Dùng cho {unit.name}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'SKILLS' && (
                  <div className="flex flex-col gap-2.5">
                    {unit.skills.map((sid) => {
                      const s = SKILLS[sid];
                      if (!s) return null;
                      return (
                        <div
                          key={sid}
                          className="p-3.5 bg-[#141b2b] border border-slate-700/75 flex items-start justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 inline-block shrink-0"
                                style={{ backgroundColor: s.accentColor }}
                              />
                              <span className="font-display font-bold text-sm text-amber-100">
                                {s.name}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 border ${
                                  s.kind === 'ACTIVE'
                                    ? 'bg-amber-950/80 text-amber-200 border-amber-500/50'
                                    : 'bg-sky-950/80 text-sky-200 border-sky-500/50'
                                }`}
                              >
                                {s.kind === 'ACTIVE' ? `TUYỆT KỸ · ${s.spCost ?? 35} SP` : 'NỘI TẠI'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1.5">{s.detailDesc}</p>
                          </div>
                        </div>
                      );
                    })}

                    {promo && (
                      <div className="p-3.5 bg-[#101726] border border-dashed border-amber-500/40 text-xs text-slate-300">
                        <span className="text-amber-300 font-semibold">
                          Mở khóa ở Bậc {TIER_ROMAN[(unit.tier + 1) as 2 | 3 | 4]} (Lv.{promo.minLevel}):{' '}
                        </span>
                        <span className="font-bold text-amber-100">
                          {SKILLS[promo.unlockSkill]?.name}
                        </span>{' '}
                        — {SKILLS[promo.unlockSkill]?.shortDesc}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'PROMOTE' && (
                  <div className="flex flex-col gap-2.5">
                    {/* Complete 4-Tier Visual Evolution Tree (Bậc I -> Lv.5 -> Lv.15 -> Lv.30) */}
                    <div className="p-3 bg-[#0c1120] border border-amber-500/35">
                      <div className="text-[11px] font-mono-num uppercase tracking-wider text-amber-300 mb-2">
                        Lộ Trình Thăng Hạng 3 Cấp: Bậc I → Bậc II (Lv.5) → Bậc III (Lv.15) → Bậc IV Tối Tân (Lv.30)
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 items-stretch">
                        {promotionChain.map((node, idx) => {
                          const isCurrent = node.classId === unit.classId;
                          const isReached = node.tier < unit.tier;
                          const isNext = promo?.toClass === node.classId;
                          const previewUrl = getUnitSpriteDataUrl(
                            {
                              ...unit,
                              classId: node.classId,
                              className: node.meta.name,
                              tier: node.tier,
                              promoted: node.tier >= 2,
                            },
                            0
                          );
                          return (
                            <div
                              key={node.classId}
                              className={`p-2 border flex flex-col items-center text-center relative ${
                                isCurrent
                                  ? 'bg-[#1a2844] border-sky-400'
                                  : isNext
                                  ? 'bg-[#1f1b33] border-amber-400'
                                  : isReached
                                  ? 'bg-[#121a28] border-emerald-500/40 opacity-80'
                                  : 'bg-[#0e1320] border-slate-700/70'
                              }`}
                            >
                              <div className="w-full flex items-center justify-between text-[10px] font-mono-num mb-1">
                                <span
                                  className={
                                    node.tier === 4
                                      ? 'text-fuchsia-300 font-bold'
                                      : node.tier === 3
                                      ? 'text-sky-300 font-bold'
                                      : node.tier === 2
                                      ? 'text-amber-300 font-bold'
                                      : 'text-slate-400'
                                  }
                                >
                                  Bậc {TIER_ROMAN[node.tier]}
                                </span>
                                <span className="text-slate-400">
                                  {node.minLevel ? `Lv.${node.minLevel}+` : 'Khởi đầu'}
                                </span>
                              </div>

                              <div
                                className={`w-28 h-28 flex items-center justify-center my-1 border-2 ${
                                  node.tier === 4
                                    ? 'bg-gradient-to-b from-amber-950/60 via-[#150f24] to-[#080c15] border-amber-400/80 shadow-[0_0_16px_rgba(251,191,36,0.28)]'
                                    : node.tier === 3
                                    ? 'bg-gradient-to-b from-sky-950/50 to-[#080c15] border-sky-400/70'
                                    : node.tier === 2
                                    ? 'bg-gradient-to-b from-amber-950/30 to-[#080c15] border-amber-500/45'
                                    : 'bg-[#080c15] border-slate-700/70'
                                }`}
                              >
                                <img
                                  src={previewUrl}
                                  alt={node.meta.name}
                                  className="w-24 h-24 object-contain pixel-art"
                                />
                              </div>

                              <div className="font-display text-xs font-bold text-amber-100 leading-tight mt-0.5">
                                {node.meta.name}
                              </div>
                              <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                {TIER_VISUAL_CAPTION[node.tier]}
                              </div>

                              <div className="text-[10px] mt-1 font-mono-num">
                                {isCurrent ? (
                                  <span className="text-sky-300 font-bold">● Hiện tại</span>
                                ) : isNext ? (
                                  <span className="text-amber-300 font-bold">✦ Mốc kế tiếp</span>
                                ) : isReached ? (
                                  <span className="text-emerald-400">✓ Đã vượt qua</span>
                                ) : (
                                  <span className="text-slate-500">
                                    {node.sealItemId ? ITEMS[node.sealItemId]?.name : 'Khóa'}
                                  </span>
                                )}
                              </div>

                              {idx < promotionChain.length - 1 && (
                                <ArrowRight className="hidden lg:block w-3.5 h-3.5 text-amber-400/70 absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 bg-[#0c1120]" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Next Stage Action Panel */}
                    {unit.tier >= 4 || !promo || !promoTargetMeta ? (
                      <div className="p-4 bg-[#141c2e] border border-fuchsia-400/50 text-center">
                        <Crown className="w-7 h-7 text-fuchsia-300 mx-auto mb-1.5" />
                        <div className="font-display text-base font-bold text-amber-100">
                          {unit.name} đã đạt đỉnh cao Khí Tài Tối Tân Bậc IV ({unit.className})!
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          Sĩ quan đã hoàn tất cả 3 cấp hiện đại hóa (Lv.5 · Lv.15 · Lv.30), mở khóa trọn bộ tác chiến và khí tài chiến lược.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#141c2e] border border-amber-500/35 flex flex-col gap-2">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <div className="font-display text-sm font-bold text-amber-200">
                            Tiến Hóa Kế Tiếp: {unit.className} → {promoTargetMeta.name} (Bậc{' '}
                            {TIER_ROMAN[(unit.tier + 1) as 2 | 3 | 4]})
                          </div>
                          <div className="font-mono-num text-xs text-amber-300">
                            Yêu cầu: Lv.{promo.minLevel}+ · {ITEMS[promo.sealItemId]?.name}
                          </div>
                        </div>

                        <p className="text-xs text-slate-200 leading-snug">{promo.description}</p>

                        {/* Stat Bonuses */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 font-mono-num">
                          {Object.entries(promo.statBonuses).map(([statKey, bonus]) => (
                            <div
                              key={statKey}
                              className="px-2 py-1 bg-[#0e1524] border border-emerald-500/35 flex items-center justify-between text-xs"
                            >
                              <span className="text-slate-300 uppercase">
                                {statKey === 'maxHp' ? 'HP' : statKey}
                              </span>
                              <span className="font-bold text-emerald-300">+{bonus}</span>
                            </div>
                          ))}
                        </div>

                        <div className="text-xs flex flex-wrap items-center gap-x-5 gap-y-1 text-slate-300">
                          <div>
                            <span className="text-amber-300 font-semibold">Kỹ năng mở khóa: </span>
                            <b className="text-amber-100">{SKILLS[promo.unlockSkill]?.name}</b> (
                            {SKILLS[promo.unlockSkill]?.shortDesc})
                          </div>
                          <div>
                            <span className="text-sky-300 font-semibold">Vũ khí: </span>
                            {promo.allowedWeaponTypes.map((wt) => WEAPON_TYPE_LABEL[wt]).join(', ')}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-700/70">
                          <div className="text-xs text-slate-300">
                            {unit.level < promo.minLevel ? (
                              <span>
                                Cần đạt tối thiểu <b>Cấp {promo.minLevel}</b> (hiện tại Lv.{unit.level}). Có thể dùng <b>Bí Kíp EXP</b> ở tab Vật Phẩm!
                              </span>
                            ) : !availableSeal ? (
                              <span>
                                Cần 1 <b>{ITEMS[promo.sealItemId]?.name}</b> (hoặc Thánh Ấn Toàn Năng — bán tại Quân Nhu / Thương Nhân Bí Mật).
                              </span>
                            ) : (
                              <span className="text-emerald-300 font-semibold">
                                Sẵn sàng tiến hóa! (Tiêu hao 1 {ITEMS[availableSeal]?.name})
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            disabled={!isPromoReady}
                            onClick={() => onPromoteUnit(unit.id)}
                            className="px-5 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 border border-amber-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Tiến Hóa thành {promoTargetMeta.name}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 5: HERO & COMMANDER TITLE SYSTEM (26 TITLES) */}
                {activeTab === 'TITLES' && (
                  <div className="flex flex-col gap-3.5">
                    {/* Commander Army Aura Banner */}
                    <div className="p-3.5 bg-[#0c1120] border border-amber-400/45 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-mono-num uppercase tracking-wider text-amber-300">
                          Danh Hiệu Thống Soái Đang Kích Hoạt (Hào Quang +50% Chỉ Số Cho Toàn Quân)
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Award className="w-4 h-4 text-amber-300" />
                          <span className="font-display text-base font-bold text-amber-100">
                            {commanderTitle?.name ?? 'Chưa trang bị'}
                          </span>
                          {commanderTitle && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 border font-semibold ${
                                TITLE_RARITY_META[commanderTitle.rarity].badge
                              }`}
                            >
                              {TITLE_RARITY_META[commanderTitle.rarity].label}
                            </span>
                          )}
                        </div>
                        {commanderTitle && (
                          <p className="text-xs text-slate-300 mt-0.5">{commanderTitle.description}</p>
                        )}
                      </div>
                      <div className="text-right font-mono-num text-xs text-slate-300">
                        <div>
                          Đã mở khóa:{' '}
                          <b className="text-amber-300">
                            {unlockedTitleIds.length}/{TITLE_LIST.length}
                          </b>
                        </div>
                        <div className="text-[11px] text-sky-300 mt-0.5">
                          Cá nhân ({unit.name}): <b>{unitPersonalTitle?.name ?? 'Chưa chọn'}</b>
                        </div>
                      </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(Object.keys(TITLE_CATEGORY_LABELS) as Array<'ALL' | TitleDef['category']>).map(
                        (cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setTitleCategoryFilter(cat)}
                            className={`px-2.5 py-1 text-[11px] font-semibold border cursor-pointer ${
                              titleCategoryFilter === cat
                                ? 'bg-amber-600 text-slate-950 border-amber-300'
                                : 'bg-[#141b2b] text-slate-300 border-slate-700 hover:border-slate-500'
                            }`}
                          >
                            {TITLE_CATEGORY_LABELS[cat]}
                          </button>
                        )
                      )}
                    </div>

                    {/* All Titles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {filteredTitles.map((t) => {
                        const unlocked = unlockedTitleSet.has(t.id);
                        const isPersonalEquipped = unit.equippedTitleId === t.id;
                        const isCommanderEquipped = commanderTitleId === t.id;
                        const rMeta = TITLE_RARITY_META[t.rarity];

                        const statChips = Object.entries(t.statBonuses)
                          .filter(([, v]) => (v ?? 0) > 0)
                          .map(([k, v]) => `${k === 'maxHp' ? 'HP' : k.toUpperCase()} +${v}`);
                        if (t.combatBonuses?.hit) statChips.push(`CX +${t.combatBonuses.hit}%`);
                        if (t.combatBonuses?.crit) statChips.push(`CM +${t.combatBonuses.crit}%`);
                        if (t.combatBonuses?.avoid) statChips.push(`NÉ +${t.combatBonuses.avoid}%`);
                        if (t.combatBonuses?.goldBonusPercent) {
                          statChips.push(`Vàng +${t.combatBonuses.goldBonusPercent}%`);
                        }

                        return (
                          <div
                            key={t.id}
                            className={`p-3 border flex flex-col justify-between gap-2 ${
                              unlocked
                                ? `${rMeta.bg} ${rMeta.border}`
                                : 'bg-[#0d121d] border-slate-800 opacity-70'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {unlocked ? (
                                    <Award
                                      className="w-4 h-4 shrink-0"
                                      style={{ color: t.accentColor }}
                                    />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                  )}
                                  <span className={`font-display font-bold text-sm truncate ${rMeta.text}`}>
                                    {t.name}
                                  </span>
                                </div>
                                <span
                                  className={`text-[10px] font-semibold px-1.5 py-0.5 border shrink-0 ${rMeta.badge}`}
                                >
                                  {rMeta.label}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                                {t.description}
                              </p>

                              <div className="flex flex-wrap gap-1.5 mt-2 font-mono-num text-[10px]">
                                {statChips.map((chip) => (
                                  <span
                                    key={chip}
                                    className="px-1.5 py-0.5 bg-[#0b101b]/90 border border-slate-700/70 text-emerald-300"
                                  >
                                    {chip}
                                  </span>
                                ))}
                              </div>

                              {!unlocked && (
                                <div className="text-[10px] text-amber-300/85 mt-1.5">
                                  Điều kiện mở khóa: {t.unlockConditionText}
                                </div>
                              )}
                            </div>

                            {unlocked && (
                              <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1.5 border-t border-slate-700/40">
                                <button
                                  type="button"
                                  disabled={isPersonalEquipped}
                                  onClick={() => onEquipHeroTitle(unit.id, t.id)}
                                  className={`px-2.5 py-1 text-[11px] font-semibold border cursor-pointer flex items-center gap-1 ${
                                    isPersonalEquipped
                                      ? 'bg-sky-900/60 text-sky-200 border-sky-400/60 cursor-default'
                                      : 'bg-sky-600 hover:bg-sky-500 text-white border-sky-300/60'
                                  }`}
                                >
                                  {isPersonalEquipped && <Check className="w-3 h-3" />}
                                  <span>
                                    {isPersonalEquipped
                                      ? `Đang đeo (${unit.name})`
                                      : `Đeo cho ${unit.name}`}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isCommanderEquipped}
                                  onClick={() => onEquipCommanderTitle(t.id)}
                                  className={`px-2.5 py-1 text-[11px] font-semibold border cursor-pointer flex items-center gap-1 ${
                                    isCommanderEquipped
                                      ? 'bg-amber-900/60 text-amber-200 border-amber-400/60 cursor-default'
                                      : 'bg-amber-600 hover:bg-amber-500 text-slate-950 border-amber-300/70'
                                  }`}
                                >
                                  {isCommanderEquipped && <Check className="w-3 h-3" />}
                                  <span>
                                    {isCommanderEquipped ? 'Đang là Thống Soái' : 'Đặt Thống Soái'}
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 6: 30 PLAYABLE CLASS LINEAGES VISUAL CODEX (ALL 120 TIER SPRITES + RECLASS) */}
                {activeTab === 'CODEX' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0c1120] p-2.5 border border-amber-500/30">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(Object.keys(MOVE_TYPE_LABELS) as Array<'ALL' | MoveType>).map((mt) => (
                          <button
                            key={mt}
                            type="button"
                            onClick={() => setCodexMoveFilter(mt)}
                            className={`px-2.5 py-1 text-[11px] font-semibold border cursor-pointer ${
                              codexMoveFilter === mt
                                ? 'bg-amber-600 text-slate-950 border-amber-300'
                                : 'bg-[#141b2b] text-slate-300 border-slate-700 hover:border-slate-500'
                            }`}
                          >
                            {MOVE_TYPE_LABELS[mt]}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={codexSearch}
                        onChange={(e) => setCodexSearch(e.target.value)}
                        placeholder="Tìm hệ phái hoặc tên lớp..."
                        className="px-2.5 py-1 text-xs bg-[#141b2b] border border-slate-600/80 text-slate-100 placeholder:text-slate-500 w-52 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="text-[11px] text-slate-300">
                      Hiển thị <b className="text-amber-300">{filteredLineages.length}/30</b> binh chủng (120 cấp khí tài 4 bậc từ Thế Chiến I đến Chiến Tranh Hiện Đại).{' '}
                      {!unit.isLord && onReclassUnit ? (
                        <span className="text-sky-300">
                          Có thể nhấn <b>Chuyển Hệ</b> để đổi {unit.name} sang binh chủng phù hợp địa hình!
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          (Chọn sĩ quan khác ngoài Chỉ Huy Trưởng {unit.name} để dùng tính năng Chuyển Hệ)
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {filteredLineages.map((lin, linIdx) => {
                        const t1 = lin.tiers[0];
                        const isUnitInLineage = lin.tiers.some((t) => t.id === unit.classId);
                        const domainLockedMidBattle =
                          !resolvedOutOfBattle &&
                          ((unit.moveType === 'NAVAL' && lin.moveType !== 'NAVAL') ||
                            (unit.moveType !== 'NAVAL' && lin.moveType === 'NAVAL'));
                        return (
                          <div
                            key={t1.id}
                            className={`p-3 border ${
                              isUnitInLineage
                                ? 'bg-[#152038] border-sky-400/70'
                                : 'bg-[#0e1422] border-slate-700/70'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono-num text-[11px] text-amber-400 font-bold">
                                  #{String(linIdx + 1).padStart(2, '0')}
                                </span>
                                <span className="font-display text-sm font-bold text-amber-100">
                                  Hệ {t1.name}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 bg-[#192338] border border-slate-600/60 text-slate-300">
                                  {MOVE_TYPE_LABELS[lin.moveType]}
                                </span>
                                <span className="text-[11px] text-slate-400 hidden sm:inline">
                                  · {t1.role}
                                </span>
                              </div>

                              {onReclassUnit && !unit.isLord && t1.id !== 'LORD' && (
                                <button
                                  type="button"
                                  disabled={isUnitInLineage || domainLockedMidBattle}
                                  onClick={() => onReclassUnit(unit.id, t1.id)}
                                  className={`px-2.5 py-1 text-[11px] font-semibold border flex items-center gap-1 ${
                                    isUnitInLineage
                                      ? 'bg-sky-900/50 text-sky-300 border-sky-400/50 cursor-default'
                                      : domainLockedMidBattle
                                      ? 'bg-slate-800/70 text-slate-400 border-slate-600/50 cursor-not-allowed'
                                      : 'bg-amber-600 hover:bg-amber-500 text-slate-950 border-amber-300 cursor-pointer'
                                  }`}
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  <span>
                                    {isUnitInLineage
                                      ? 'Hệ hiện tại'
                                      : domainLockedMidBattle
                                      ? 'Đổi Hải ↔ Lục ở Doanh Trại'
                                      : `Chuyển ${unit.name} sang hệ này`}
                                  </span>
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {lin.tiers.map((tierDef, tIdx) => {
                                const tierNum = (tIdx + 1) as 1 | 2 | 3 | 4;
                                const meta = CLASS_META[tierDef.id];
                                const previewWeapon = getCodexPreviewWeapon(
                                  meta.allowedWeaponTypes[0] ?? 'SWORD'
                                );
                                const spriteUrl = getUnitSpriteDataUrl(
                                  {
                                    ...unit,
                                    id: `codex_${tierDef.id}`,
                                    templateId: `codex_${tierDef.id}`,
                                    classId: tierDef.id,
                                    className: meta.name,
                                    moveType: meta.moveType,
                                    weapon: previewWeapon,
                                    tier: tierNum,
                                    promoted: tierNum >= 2,
                                    accentColor: meta.accent,
                                  },
                                  0
                                );
                                return (
                                  <div
                                    key={tierDef.id}
                                    className={`p-2 border flex flex-col items-center text-center ${
                                      tierNum === 4
                                        ? 'bg-gradient-to-b from-amber-950/45 to-[#0b0f1b] border-amber-400/65'
                                        : tierNum === 3
                                        ? 'bg-[#121c30] border-sky-500/45'
                                        : tierNum === 2
                                        ? 'bg-[#121826] border-amber-600/35'
                                        : 'bg-[#0b101b] border-slate-700/60'
                                    }`}
                                  >
                                    <div className="w-full flex items-center justify-between text-[10px] font-mono-num">
                                      <span
                                        className={
                                          tierNum === 4
                                            ? 'text-fuchsia-300 font-bold'
                                            : tierNum === 3
                                            ? 'text-sky-300 font-bold'
                                            : tierNum === 2
                                            ? 'text-amber-300 font-bold'
                                            : 'text-slate-400'
                                        }
                                      >
                                        Bậc {TIER_ROMAN[tierNum]}
                                      </span>
                                      <span className="text-slate-500">
                                        {tierNum === 1
                                          ? 'Lv.1'
                                          : tierNum === 2
                                          ? 'Lv.5'
                                          : tierNum === 3
                                          ? 'Lv.15'
                                          : 'Lv.30'}
                                      </span>
                                    </div>
                                    <img
                                      src={spriteUrl}
                                      alt={meta.name}
                                      className="w-28 h-28 object-contain my-1"
                                    />
                                    <div className="font-display text-[11px] font-bold text-amber-100 leading-tight">
                                      {meta.name}
                                    </div>
                                    <div className="text-[9px] text-slate-400 mt-0.5 truncate w-full">
                                      {meta.allowedWeaponTypes.map((w) => WEAPON_TYPE_LABEL[w]).join(' · ')}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
