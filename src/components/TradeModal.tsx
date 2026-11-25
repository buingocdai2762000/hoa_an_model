import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Check,
  Crown,
  Flame,
  FlaskConical,
  Footprints,
  Layers,
  Lock,
  Package,
  Shield,
  Swords,
  X,
} from 'lucide-react';
import {
  ARMOR_SLOT_META,
  ARMOR_SLOTS,
  ARMOR_TEMPLATES,
  computeArmorInstanceBonuses,
  EQUIPMENT_RARITY_META,
  GEMS,
  ITEMS,
  PORTRAIT_ASSETS,
  WEAPON_TYPE_LABEL,
} from '../game/data';
import {
  canUnitEquipWeapon,
  getEffectiveUnitStats,
  getUnitCarryCount,
  isUnitCarryFull,
  manhattan,
  MAX_UNIT_CARRY_SLOTS,
} from '../game/engine';
import { getUnitPortraitDataUrl, getUnitSpriteDataUrl } from '../game/pixelSprites';
import type { ArmorSlot, EquipmentInstance, Unit } from '../game/types';

export interface TradeWorkbenchProps {
  leftUnit: Unit;
  rightUnit: Unit;
  availableLeftUnits?: Unit[];
  availableRightUnits: Unit[];
  onSelectLeftUnit?: (unitId: string) => void;
  onSelectRightUnit: (unitId: string) => void;
  isFreeLogistics: boolean;
  equipmentBag: EquipmentInstance[];
  commanderTitleId: string;
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
  onTradePersonalItem?: (
    fromUnitId: string,
    toUnitId: string,
    itemIndex: number
  ) => { ok: boolean; message?: string };
  onTradeCarriedArmor?: (
    fromUnitId: string,
    toUnitId: string,
    armorUid: string
  ) => { ok: boolean; message?: string };
}

function ArmorSlotGlyph({ slot, className }: { slot: ArmorSlot; className?: string }) {
  switch (slot) {
    case 'HELMET':
      return <Crown className={className} />;
    case 'ARMOR':
      return <Shield className={className} />;
    case 'GAUNTLETS':
      return <Flame className={className} />;
    case 'GREAVES':
      return <Layers className={className} />;
    case 'BOOTS':
      return <Footprints className={className} />;
  }
}

export function TradeWorkbench({
  leftUnit,
  rightUnit,
  availableLeftUnits,
  availableRightUnits,
  onSelectLeftUnit,
  onSelectRightUnit,
  isFreeLogistics,
  equipmentBag,
  commanderTitleId,
  onTradeWeapon,
  onEquipPersonalWeapon,
  onTradeArmorSlot,
  onTradePotion,
  onTradePersonalItem,
  onTradeCarriedArmor,
}: TradeWorkbenchProps) {
  const [swapPick, setSwapPick] = useState<{ side: 'LEFT' | 'RIGHT'; index: number } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const leftStats = useMemo(
    () => getEffectiveUnitStats(leftUnit, commanderTitleId),
    [leftUnit, commanderTitleId]
  );
  const rightStats = useMemo(
    () => getEffectiveUnitStats(rightUnit, commanderTitleId),
    [rightUnit, commanderTitleId]
  );

  const leftCarry = getUnitCarryCount(leftUnit);
  const rightCarry = getUnitCarryCount(rightUnit);
  const leftFull = isUnitCarryFull(leftUnit);
  const rightFull = isUnitCarryFull(rightUnit);

  const distanceBetween = manhattan(leftUnit, rightUnit);
  const canTradeNow = isFreeLogistics || distanceBetween === 1;

  const canUnitGiveWeapon = (source: Unit, target: Unit, idx: number): boolean => {
    if (!canTradeNow) return false;
    const w = source.inventory[idx];
    if (!w) return false;
    if (isUnitCarryFull(target)) return false;
    if (target.inventory.some((tw) => tw.id === w.id)) return false;
    const remaining = source.inventory.filter((_, i) => i !== idx);
    return remaining.some((rw) => canUnitEquipWeapon(source, rw));
  };

  const renderHeroHeader = (
    unit: Unit,
    effStats: ReturnType<typeof getEffectiveUnitStats>,
    side: 'LEFT' | 'RIGHT'
  ) => {
    const portraitUrl =
      (unit.portraitKey && PORTRAIT_ASSETS[unit.portraitKey]) ||
      PORTRAIT_ASSETS[unit.templateId] ||
      getUnitPortraitDataUrl(unit);
    const spriteUrl = getUnitSpriteDataUrl(unit, 0);
    const carry = getUnitCarryCount(unit);
    const full = isUnitCarryFull(unit);

    return (
      <div className="p-3 bg-[#0d121f] border border-amber-500/30 flex items-center gap-3">
        <div className="w-14 h-16 shrink-0 bg-[#080c15] border border-amber-400/50 overflow-hidden">
          <img
            src={portraitUrl}
            alt={unit.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top pixel-art"
          />
        </div>
        <div className="w-12 h-16 shrink-0 bg-[#10182b] border border-sky-400/35 flex items-center justify-center">
          <img src={spriteUrl} alt={unit.name} className="w-11 h-14 object-contain pixel-art" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            {side === 'LEFT' && availableLeftUnits && onSelectLeftUnit ? (
              <select
                aria-label="Chọn nhân vật bên trái để trao đổi"
                value={unit.id}
                onChange={(e) => {
                  setSwapPick(null);
                  onSelectLeftUnit(e.target.value);
                }}
                className="bg-[#161f33] border border-amber-400/60 text-amber-100 font-display font-bold text-sm px-2 py-1 cursor-pointer max-w-[190px]"
              >
                {availableLeftUnits.map((cand) => (
                  <option
                    key={cand.id}
                    value={cand.id}
                    disabled={cand.id === rightUnit.id}
                  >
                    {cand.name} · Lv.{cand.level} ({cand.className})
                  </option>
                ))}
              </select>
            ) : side === 'RIGHT' && availableRightUnits.length > 1 ? (
              <select
                aria-label="Chọn đồng minh bên phải để trao đổi"
                value={unit.id}
                onChange={(e) => {
                  setSwapPick(null);
                  onSelectRightUnit(e.target.value);
                }}
                className="bg-[#161f33] border border-emerald-400/60 text-emerald-100 font-display font-bold text-sm px-2 py-1 cursor-pointer max-w-[210px]"
              >
                {availableRightUnits.map((cand) => (
                  <option
                    key={cand.id}
                    value={cand.id}
                    disabled={cand.id === leftUnit.id}
                  >
                    {cand.name} · Lv.{cand.level} ({cand.className})
                  </option>
                ))}
              </select>
            ) : (
              <span className="font-display font-bold text-base text-amber-100 truncate">
                {unit.name}
              </span>
            )}
            <span className="font-mono-num text-xs text-amber-300 shrink-0">
              Lv.{unit.level} · {unit.className}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-mono-num text-slate-300">
            <span className="text-sky-300">
              HP {unit.hp}/{effStats.maxHp}
            </span>
            <span>STR {effStats.str}</span>
            <span>MAG {effStats.mag}</span>
            <span>SPD {effStats.spd}</span>
            <span>DEF {effStats.def}</span>
            <span>RES {effStats.res}</span>
          </div>

          <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-slate-400">
            <span className="truncate">
              Đang cầm: <strong className="text-amber-200">{unit.weapon.name}</strong>{' '}
              <span className="text-[10px] text-slate-500">(0 ô túi)</span>
            </span>
            <span
              title="6 ô túi cá nhân không tính Mũ, Giáp, Giáp tay, Giáp chân, Giày & Vũ khí đang đeo"
              className={`font-mono-num font-bold shrink-0 px-1.5 py-0.5 border ${
                full
                  ? 'bg-rose-950/90 text-rose-200 border-rose-400/60'
                  : 'bg-[#141d30] text-sky-200 border-sky-400/40'
              }`}
            >
              Túi đồ: {carry}/{MAX_UNIT_CARRY_SLOTS} {full ? '(ĐẦY)' : ''}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderWeaponColumn = (unit: Unit, partner: Unit, side: 'LEFT' | 'RIGHT') => {
    const otherSide = side === 'LEFT' ? 'RIGHT' : 'LEFT';
    const waitingPartnerSwap = swapPick && swapPick.side === otherSide;
    const partnerFull = isUnitCarryFull(partner);

    return (
      <div className="bg-[#121828] border border-slate-700/80 p-2.5 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs border-b border-slate-700/70 pb-1.5">
          <span className="font-display font-bold text-amber-200 flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-amber-300" />
            <span>Vũ Khí Của {unit.name}</span>
          </span>
          <span className="font-mono-num text-[11px] text-slate-400">
            1 cầm + {Math.max(0, unit.inventory.length - 1)} dự phòng · Túi {getUnitCarryCount(unit)}/
            {MAX_UNIT_CARRY_SLOTS}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {unit.inventory.map((w, idx) => {
            const isEquipped = unit.weapon.id === w.id;
            const canSelfEquip = canUnitEquipWeapon(unit, w);
            const canPartnerEquip = canUnitEquipWeapon(partner, w);
            const canGive = canUnitGiveWeapon(unit, partner, idx);
            const isSelectedSwap = swapPick?.side === side && swapPick.index === idx;

            return (
              <div
                key={`${w.id}-${idx}`}
                className={`p-2 border flex flex-col gap-1.5 ${
                  isSelectedSwap
                    ? 'bg-amber-950/60 border-amber-300'
                    : isEquipped
                    ? 'bg-[#1a2540] border-sky-400/70'
                    : 'bg-[#151c2e] border-slate-700/75'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex items-center gap-1.5">
                    <span className="text-xs font-bold text-amber-100 truncate">{w.name}</span>
                    <span className="text-[10px] font-mono-num text-slate-400 shrink-0">
                      {WEAPON_TYPE_LABEL[w.type]} · UL {w.might}
                    </span>
                  </div>
                  {isEquipped ? (
                    <span className="text-[10px] font-semibold text-sky-200 shrink-0 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Đang cầm
                    </span>
                  ) : canSelfEquip ? (
                    <button
                      type="button"
                      onClick={() => {
                        onEquipPersonalWeapon(unit.id, w.id);
                        setNotice(`${unit.name} đã chuyển sang cầm ${w.name}.`);
                      }}
                      className="px-2 py-0.5 text-[10px] font-semibold bg-sky-900/80 hover:bg-sky-800 text-sky-100 border border-sky-400/50 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Cầm chính
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 shrink-0">Giữ hộ</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
                  <span className={canPartnerEquip ? 'text-emerald-300' : 'text-slate-400'}>
                    {canPartnerEquip
                      ? `${partner.name} dùng được`
                      : `${partner.name} chỉ giữ hộ (${WEAPON_TYPE_LABEL[w.type]})`}
                  </span>

                  <div className="flex items-center gap-1">
                    {waitingPartnerSwap ? (
                      <button
                        type="button"
                        disabled={!canTradeNow}
                        onClick={() => {
                          const fromUnit = swapPick.side === 'LEFT' ? leftUnit : rightUnit;
                          const toUnit = swapPick.side === 'LEFT' ? rightUnit : leftUnit;
                          const res = onTradeWeapon(fromUnit.id, toUnit.id, swapPick.index, idx);
                          setSwapPick(null);
                          setNotice(
                            res.message ??
                              (res.ok
                                ? 'Đã hoán đổi vũ khí thành công!'
                                : 'Không thể đổi: Mỗi người phải còn ít nhất 1 vũ khí sử dụng được và không trùng loại.')
                          );
                        }}
                        className="px-2 py-0.5 text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-200 cursor-pointer whitespace-nowrap"
                      >
                        ⇄ Đổi Với Món Này
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={!canGive}
                          title={
                            partnerFull
                              ? `Túi của ${partner.name} đã đầy (${MAX_UNIT_CARRY_SLOTS}/${MAX_UNIT_CARRY_SLOTS}) — hãy dùng ⇄ Hoán đổi 1-đổi-1`
                              : !canGive
                              ? 'Cần còn ít nhất 1 vũ khí sử dụng được và không trùng loại'
                              : `Chuyển ${w.name} sang ${partner.name}`
                          }
                          onClick={() => {
                            const res = onTradeWeapon(unit.id, partner.id, idx);
                            setSwapPick(null);
                            if (res.message) setNotice(res.message);
                          }}
                          className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-700 hover:bg-emerald-600 disabled:opacity-35 text-white border border-emerald-300/60 cursor-pointer flex items-center gap-1 whitespace-nowrap"
                        >
                          {side === 'LEFT' ? (
                            <>
                              <span>{partnerFull ? 'Túi đầy' : `Trao sang ${partner.name}`}</span>
                              <ArrowRight className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              <ArrowLeft className="w-3 h-3" />
                              <span>{partnerFull ? 'Túi đầy' : `Trao sang ${partner.name}`}</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={!canTradeNow}
                          onClick={() =>
                            setSwapPick(isSelectedSwap ? null : { side, index: idx })
                          }
                          className={`px-2 py-0.5 text-[11px] font-semibold border cursor-pointer whitespace-nowrap ${
                            isSelectedSwap
                              ? 'bg-amber-500 text-slate-950 border-amber-200'
                              : 'bg-[#1c263b] hover:bg-[#263450] text-amber-200 border-amber-400/45'
                          }`}
                        >
                          {isSelectedSwap ? 'Hủy chọn' : '⇄ Hoán đổi'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPersonalItemsColumn = (unit: Unit, partner: Unit, side: 'LEFT' | 'RIGHT') => {
    const carriedItems = unit.carriedItems ?? [];
    const carriedArmors = unit.carriedArmorUids ?? [];
    const partnerFull = isUnitCarryFull(partner);
    if (carriedItems.length === 0 && carriedArmors.length === 0) {
      return (
        <div className="bg-[#121828] border border-slate-700/80 p-2.5 text-xs text-slate-400">
          <div className="font-display font-bold text-amber-200 mb-1 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-emerald-300" />
            <span>Vật Phẩm &amp; Giáp Dự Phòng Trong Túi {unit.name}</span>
          </div>
          <div className="text-[11px] text-slate-500 italic">Không có vật phẩm lẻ trong túi.</div>
        </div>
      );
    }

    return (
      <div className="bg-[#121828] border border-slate-700/80 p-2.5 flex flex-col gap-1.5">
        <div className="font-display font-bold text-xs text-amber-200 border-b border-slate-700/70 pb-1 flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-emerald-300" />
          <span>Vật Phẩm &amp; Giáp Dự Phòng Trong Túi {unit.name}</span>
        </div>

        {carriedItems.map((itemId, idx) => {
          const item = ITEMS[itemId];
          const gem = GEMS[itemId];
          const label = item?.name ?? gem?.name ?? itemId;
          return (
            <div
              key={`${itemId}-${idx}`}
              className="p-2 bg-[#151c2e] border border-slate-700/75 flex items-center justify-between gap-2 text-xs"
            >
              <span className="font-bold text-amber-100 truncate">{label}</span>
              {onTradePersonalItem && (
                <button
                  type="button"
                  disabled={!canTradeNow || partnerFull}
                  onClick={() => {
                    const res = onTradePersonalItem(unit.id, partner.id, idx);
                    if (res.message) setNotice(res.message);
                  }}
                  className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-700 hover:bg-emerald-600 disabled:opacity-35 text-white border border-emerald-300/60 cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  {side === 'LEFT' ? (
                    <>
                      <span>{partnerFull ? 'Túi đầy (6/6)' : `Đưa cho ${partner.name}`}</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <ArrowLeft className="w-3 h-3" />
                      <span>{partnerFull ? 'Túi đầy (6/6)' : `Đưa cho ${partner.name}`}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}

        {carriedArmors.map((uid) => {
          const eq = equipmentBag.find((e) => e.uid === uid);
          const tpl = eq ? ARMOR_TEMPLATES[eq.templateId] : null;
          if (!eq || !tpl) return null;
          return (
            <div
              key={uid}
              className="p-2 bg-[#151c2e] border border-sky-500/35 flex items-center justify-between gap-2 text-xs"
            >
              <span
                className="font-bold truncate"
                style={{ color: EQUIPMENT_RARITY_META[eq.rarity].color }}
              >
                {tpl.name} (Lv.{eq.level})
              </span>
              {onTradeCarriedArmor && (
                <button
                  type="button"
                  disabled={!canTradeNow || partnerFull}
                  onClick={() => {
                    const res = onTradeCarriedArmor(unit.id, partner.id, uid);
                    if (res.message) setNotice(res.message);
                  }}
                  className="px-2 py-0.5 text-[11px] font-semibold bg-sky-700 hover:bg-sky-600 disabled:opacity-35 text-white border border-sky-300/60 cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  {side === 'LEFT' ? (
                    <>
                      <span>{partnerFull ? 'Túi đầy (6/6)' : `Đưa cho ${partner.name}`}</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <ArrowLeft className="w-3 h-3" />
                      <span>{partnerFull ? 'Túi đầy (6/6)' : `Đưa cho ${partner.name}`}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div data-testid="trade-workbench" className="flex flex-col gap-3">
      {/* Status / Distance & Pure 2-Unit Rule Banner (No Convoy mixed in!) */}
      <div className="px-3.5 py-2 bg-[#101728] border border-amber-500/35 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-200">
          <ArrowLeftRight className="w-4 h-4 text-amber-300 shrink-0" />
          {isFreeLogistics ? (
            <span>
              <strong className="text-emerald-300">Trao Đổi Giữa Hai Nhân Vật:</strong> Trao đổi
              trực tiếp đồ cá nhân (tối đa {MAX_UNIT_CARRY_SLOTS} món/túi, không tính Mũ, Giáp, Giày
              &amp; Vũ khí đang đeo). Muốn gửi/rút đồ dự trữ chung, hãy sang mục{' '}
              <strong className="text-amber-200">Kho Quân Đoàn</strong>.
            </span>
          ) : canTradeNow ? (
            <span>
              <strong className="text-emerald-300">Đứng sát cạnh nhau (Khoảng cách 1 ô):</strong>{' '}
              {leftUnit.name} và {rightUnit.name} trao đổi đồ mang trên người (Kho Quân Đoàn đang khóa
              trong trận).
            </span>
          ) : (
            <span className="text-rose-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              Cách nhau {distanceBetween} ô — Phải đứng sát cạnh nhau (1 ô) mới trao đổi được!
            </span>
          )}
        </div>

        {notice && (
          <span className="font-semibold text-amber-200 bg-amber-950/80 border border-amber-400/50 px-2.5 py-0.5">
            {notice}
          </span>
        )}
      </div>

      {/* Adjacent Partner Quick Switcher in Active Battle when >= 2 allies stand adjacent */}
      {!isFreeLogistics && availableRightUnits.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">Đồng minh đứng sát cạnh {leftUnit.name}:</span>
          {availableRightUnits.map((ally) => {
            const active = ally.id === rightUnit.id;
            return (
              <button
                key={ally.id}
                type="button"
                onClick={() => {
                  setSwapPick(null);
                  onSelectRightUnit(ally.id);
                }}
                className={`px-3 py-1 font-semibold border cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-emerald-700 text-white border-emerald-300'
                    : 'bg-[#141c2e] text-slate-300 border-slate-700 hover:border-emerald-400/60'
                }`}
              >
                {ally.name} (Lv.{ally.level} · Túi {getUnitCarryCount(ally)}/{MAX_UNIT_CARRY_SLOTS})
              </button>
            );
          })}
        </div>
      )}

      {/* Side-by-Side Hero Headers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {renderHeroHeader(leftUnit, leftStats, 'LEFT')}
        {renderHeroHeader(rightUnit, rightStats, 'RIGHT')}
      </div>

      {/* Personal Potions Exchange Bar */}
      <div className="p-2.5 bg-[#111829] border border-emerald-500/35 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <FlaskConical className="w-4 h-4 text-emerald-300 shrink-0" />
          <span className="text-slate-200 font-semibold">{leftUnit.name}:</span>
          <span className="font-mono-num font-bold text-emerald-300">
            {leftUnit.potions} Bình Thuốc
          </span>
          <span className="text-[11px] font-mono-num text-slate-400">
            (Túi {leftCarry}/{MAX_UNIT_CARRY_SLOTS})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="btn-give-potion-right"
            disabled={!canTradeNow || leftUnit.potions <= 0 || rightFull}
            onClick={() => {
              const res = onTradePotion(leftUnit.id, rightUnit.id);
              if (res.message) setNotice(res.message);
            }}
            className="px-3 py-1 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 disabled:opacity-35 text-white border border-emerald-300/60 cursor-pointer flex items-center gap-1 whitespace-nowrap"
          >
            <span>
              {rightFull
                ? `Túi ${rightUnit.name} đầy (${MAX_UNIT_CARRY_SLOTS}/${MAX_UNIT_CARRY_SLOTS})`
                : `Đưa 1 Bình cho ${rightUnit.name}`}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            data-testid="btn-give-potion-left"
            disabled={!canTradeNow || rightUnit.potions <= 0 || leftFull}
            onClick={() => {
              const res = onTradePotion(rightUnit.id, leftUnit.id);
              if (res.message) setNotice(res.message);
            }}
            className="px-3 py-1 text-xs font-semibold bg-sky-700 hover:bg-sky-600 disabled:opacity-35 text-white border border-sky-300/60 cursor-pointer flex items-center gap-1 whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              {leftFull
                ? `Túi ${leftUnit.name} đầy (${MAX_UNIT_CARRY_SLOTS}/${MAX_UNIT_CARRY_SLOTS})`
                : `Đưa 1 Bình cho ${leftUnit.name}`}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <FlaskConical className="w-4 h-4 text-emerald-300 shrink-0" />
          <span className="text-slate-200 font-semibold">{rightUnit.name}:</span>
          <span className="font-mono-num font-bold text-emerald-300">
            {rightUnit.potions} Bình Thuốc
          </span>
          <span className="text-[11px] font-mono-num text-slate-400">
            (Túi {rightCarry}/{MAX_UNIT_CARRY_SLOTS})
          </span>
        </div>
      </div>

      {/* Weapons Side-by-Side Exchange */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {renderWeaponColumn(leftUnit, rightUnit, 'LEFT')}
        {renderWeaponColumn(rightUnit, leftUnit, 'RIGHT')}
      </div>

      {/* Carried Personal Items & Spare Armor Side-by-Side Exchange */}
      {((leftUnit.carriedItems?.length ?? 0) > 0 ||
        (rightUnit.carriedItems?.length ?? 0) > 0 ||
        (leftUnit.carriedArmorUids?.length ?? 0) > 0 ||
        (rightUnit.carriedArmorUids?.length ?? 0) > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {renderPersonalItemsColumn(leftUnit, rightUnit, 'LEFT')}
          {renderPersonalItemsColumn(rightUnit, leftUnit, 'RIGHT')}
        </div>
      )}

      {/* 5-Slot Worn Armor Side-by-Side Exchange */}
      <div className="bg-[#121828] border border-slate-700/80 p-2.5 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs border-b border-slate-700/70 pb-1.5">
          <span className="font-display font-bold text-amber-200 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-300" />
            <span>Hoán Đổi 5 Ô Giáp Đang Mặc (Mũ · Áo Giáp · Giáp Tay · Giáp Chân · Giày)</span>
          </span>
          <span className="text-[11px] text-slate-400">
            Giáp mặc trên người không tốn ô túi đồ cá nhân
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {ARMOR_SLOTS.map((slot) => {
            const meta = ARMOR_SLOT_META[slot];
            const eqLeft = leftUnit.equipment?.[slot];
            const eqRight = rightUnit.equipment?.[slot];
            const tplLeft = eqLeft ? ARMOR_TEMPLATES[eqLeft.templateId] : null;
            const tplRight = eqRight ? ARMOR_TEMPLATES[eqRight.templateId] : null;
            const statsLeft = eqLeft ? computeArmorInstanceBonuses(eqLeft) : null;
            const statsRight = eqRight ? computeArmorInstanceBonuses(eqRight) : null;
            const canSwapSlot = canTradeNow && Boolean(eqLeft || eqRight);

            return (
              <div
                key={slot}
                className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-2 p-2 bg-[#0e1422] border border-slate-800"
              >
                {/* Left Hero Armor Slot */}
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span style={{ color: meta.accent }} className="shrink-0">
                      <ArmorSlotGlyph slot={slot} className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0">{meta.shortLabel}:</span>
                    {eqLeft && tplLeft ? (
                      <span
                        className="text-xs font-bold truncate"
                        style={{ color: EQUIPMENT_RARITY_META[eqLeft.rarity].color }}
                      >
                        {tplLeft.name}
                        {eqLeft.temperLevel > 0 ? ` +${eqLeft.temperLevel}` : ''} (Lv.{eqLeft.level})
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Trống</span>
                    )}
                  </div>
                  {statsLeft && (
                    <span className="text-[10px] font-mono-num text-emerald-300 shrink-0">
                      {statsLeft.stats.def > 0 ? `DEF+${statsLeft.stats.def} ` : ''}
                      {statsLeft.stats.res > 0 ? `RES+${statsLeft.stats.res} ` : ''}
                      {statsLeft.stats.spd > 0 ? `SPD+${statsLeft.stats.spd}` : ''}
                    </span>
                  )}
                </div>

                {/* Center Trade Action */}
                <button
                  type="button"
                  data-testid={`btn-trade-armor-${slot.toLowerCase()}`}
                  disabled={!canSwapSlot}
                  onClick={() => {
                    const res = onTradeArmorSlot(leftUnit.id, rightUnit.id, slot);
                    if (res.message) setNotice(res.message);
                  }}
                  className="px-3 py-1 text-[11px] font-bold bg-[#1b253b] hover:bg-amber-600 hover:text-slate-950 disabled:opacity-30 text-amber-200 border border-amber-400/50 cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>
                    {eqLeft && eqRight
                      ? 'Đổi Giáp'
                      : eqLeft
                      ? `Đưa sang ${rightUnit.name}`
                      : eqRight
                      ? `Đưa sang ${leftUnit.name}`
                      : 'Cả hai trống'}
                  </span>
                </button>

                {/* Right Hero Armor Slot */}
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span style={{ color: meta.accent }} className="shrink-0">
                      <ArmorSlotGlyph slot={slot} className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0">{meta.shortLabel}:</span>
                    {eqRight && tplRight ? (
                      <span
                        className="text-xs font-bold truncate"
                        style={{ color: EQUIPMENT_RARITY_META[eqRight.rarity].color }}
                      >
                        {tplRight.name}
                        {eqRight.temperLevel > 0 ? ` +${eqRight.temperLevel}` : ''} (Lv.{eqRight.level})
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Trống</span>
                    )}
                  </div>
                  {statsRight && (
                    <span className="text-[10px] font-mono-num text-emerald-300 shrink-0">
                      {statsRight.stats.def > 0 ? `DEF+${statsRight.stats.def} ` : ''}
                      {statsRight.stats.res > 0 ? `RES+${statsRight.stats.res} ` : ''}
                      {statsRight.stats.spd > 0 ? `SPD+${statsRight.stats.spd}` : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface TradeModalProps extends TradeWorkbenchProps {
  onClose: () => void;
}

export function TradeModal({ onClose, ...workbenchProps }: TradeModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Trao đổi trang bị và vật phẩm giữa đồng minh đứng cạnh"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <div className="w-full max-w-[1080px] max-h-[91vh] tactical-panel flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#0c101b] border-b border-amber-500/35">
          <div className="flex items-center gap-2.5 min-w-0">
            <ArrowLeftRight className="w-5 h-5 text-emerald-300 shrink-0" />
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold text-amber-100 leading-tight truncate">
                TRAO ĐỔI QUÂN TRANG TRỰC TIẾP ({workbenchProps.leftUnit.name} ⇄{' '}
                {workbenchProps.rightUnit.name})
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                {workbenchProps.isFreeLogistics
                  ? `Doanh trại: Trao đổi đồ cá nhân giữa các anh hùng (Tối đa ${MAX_UNIT_CARRY_SLOTS} món/túi)`
                  : `Chiến trường: Đứng sát cạnh 1 ô để trao đổi đồ cá nhân (Tối đa ${MAX_UNIT_CARRY_SLOTS} món/túi · Kho Quân Đoàn khóa trong trận)`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ trao đổi"
            className="px-3 py-1.5 text-xs font-semibold bg-[#182032] hover:bg-[#24304a] text-slate-100 border border-slate-600/60 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Hoàn Tất [Esc]</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 chronicle-scroll bg-[#0e1422]">
          <TradeWorkbench {...workbenchProps} />
        </div>
      </div>
    </div>
  );
}
