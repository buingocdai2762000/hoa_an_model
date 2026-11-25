import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crown,
  Flame,
  FlaskConical,
  Footprints,
  Gem,
  Layers,
  Lock,
  Package,
  Shield,
  Sparkles,
  Swords,
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
  WEAPONS,
} from '../game/data';
import {
  canUnitEquipWeapon,
  getEffectiveUnitStats,
  getSpareWeaponCount,
  getUnitCarryCount,
  isUnitCarryFull,
  MAX_UNIT_CARRY_SLOTS,
} from '../game/engine';
import { getUnitPortraitDataUrl, getUnitSpriteDataUrl } from '../game/pixelSprites';
import type {
  ArmorSlot,
  EquipmentInstance,
  GameItem,
  GemDef,
  Unit,
  Weapon,
} from '../game/types';

type ConvoyCategoryTab = 'WEAPONS' | 'ARMOR' | 'ITEMS';

export interface ConvoyPanelProps {
  units: Unit[];
  allKnownAllies?: Unit[];
  selectedUnitId?: string;
  onSelectUnit?: (unitId: string) => void;
  isOutOfBattle: boolean;
  convoyWeaponIds: string[];
  equipmentBag: EquipmentInstance[];
  itemBag: Record<string, number>;
  commanderTitleId: string;
  onStoreWeapon: (unitId: string, weaponId: string) => { ok: boolean; message?: string };
  onWithdrawWeapon: (
    unitId: string,
    weaponId: string,
    equipNow?: boolean
  ) => { ok: boolean; message?: string };
  onStorePotion: (unitId: string) => { ok: boolean; message?: string };
  onWithdrawPotion: (unitId: string) => { ok: boolean; message?: string };
  onStorePersonalItem: (
    unitId: string,
    itemIndex: number
  ) => { ok: boolean; message?: string };
  onWithdrawItem: (unitId: string, itemId: string) => { ok: boolean; message?: string };
  onStoreCarriedArmor: (
    unitId: string,
    armorUid: string
  ) => { ok: boolean; message?: string };
  onWithdrawArmorToPack: (
    unitId: string,
    armorUid: string
  ) => { ok: boolean; message?: string };
  onEquipConvoyArmor: (unitId: string, armorUid: string) => void;
  onUnequipWornArmorToConvoy: (unitId: string, slot: ArmorSlot) => void;
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

export function ConvoyPanel({
  units,
  allKnownAllies,
  selectedUnitId,
  onSelectUnit,
  isOutOfBattle,
  convoyWeaponIds,
  equipmentBag,
  itemBag,
  commanderTitleId,
  onStoreWeapon,
  onWithdrawWeapon,
  onStorePotion,
  onWithdrawPotion,
  onStorePersonalItem,
  onWithdrawItem,
  onStoreCarriedArmor,
  onWithdrawArmorToPack,
  onEquipConvoyArmor,
  onUnequipWornArmorToConvoy,
}: ConvoyPanelProps) {
  const playerUnits = useMemo(
    () => units.filter((u) => u.faction === 'PLAYER' && u.hp > 0),
    [units]
  );
  const [internalUnitId, setInternalUnitId] = useState<string>(() => playerUnits[0]?.id ?? '');
  const [categoryTab, setCategoryTab] = useState<ConvoyCategoryTab>('WEAPONS');
  const [notice, setNotice] = useState<string | null>(null);

  const activeUnitId = selectedUnitId ?? internalUnitId;
  const hero =
    playerUnits.find((u) => u.id === activeUnitId) ?? playerUnits[0] ?? null;

  const ownershipPool = allKnownAllies ?? playerUnits;

  // Armor pieces stored in Kho Quân Đoàn = neither worn on any hero's body nor carried in any hero's personal pack
  const convoyArmorList = useMemo(() => {
    const heldUids = new Set<string>();
    for (const u of ownershipPool) {
      for (const s of ARMOR_SLOTS) {
        const eq = u.equipment?.[s];
        if (eq) heldUids.add(eq.uid);
      }
      for (const uid of u.carriedArmorUids ?? []) {
        heldUids.add(uid);
      }
    }
    return equipmentBag
      .filter((eq) => !heldUids.has(eq.uid))
      .sort((a, b) => b.level - a.level || b.temperLevel - a.temperLevel);
  }, [equipmentBag, ownershipPool]);

  const groupedConvoyWeapons = useMemo(() => {
    const counts = new Map<string, { weapon: Weapon; count: number }>();
    for (const wid of convoyWeaponIds) {
      const w = WEAPONS[wid];
      if (!w) continue;
      const cur = counts.get(wid);
      if (cur) cur.count += 1;
      else counts.set(wid, { weapon: w, count: 1 });
    }
    return Array.from(counts.values()).sort(
      (a, b) => (b.weapon.tier ?? 1) - (a.weapon.tier ?? 1) || b.weapon.might - a.weapon.might
    );
  }, [convoyWeaponIds]);

  const convoyItemsAndGems = useMemo(() => {
    const entries: Array<
      | { kind: 'ITEM'; item: GameItem; count: number }
      | { kind: 'GEM'; gem: GemDef; count: number }
    > = [];
    for (const [id, count] of Object.entries(itemBag)) {
      if (count <= 0) continue;
      if (ITEMS[id]) {
        entries.push({ kind: 'ITEM', item: ITEMS[id], count });
      } else if (GEMS[id]) {
        entries.push({ kind: 'GEM', gem: GEMS[id], count });
      }
    }
    return entries;
  }, [itemBag]);

  const totalConvoyItemCount = useMemo(
    () => convoyItemsAndGems.reduce((sum, e) => sum + e.count, 0),
    [convoyItemsAndGems]
  );

  // IN-BATTLE STRICT SEAL VIEW: Nobody — not even Lord Kaelen — can interact with Kho Quân Đoàn during battle!
  if (!isOutOfBattle) {
    return (
      <div
        data-testid="convoy-locked-battle-banner"
        className="p-5 bg-[#0e1424] border-2 border-rose-500/45 flex flex-col gap-4"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 shrink-0 bg-rose-950/85 border border-rose-400/60 flex items-center justify-center">
            <Lock className="w-5 h-5 text-rose-300" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-rose-200 tracking-wide">
              KHO QUÂN ĐOÀN ĐANG NIÊM PHONG TRONG CHIẾN TRẬN
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed mt-1">
              Theo quân luật hành quân: Khi đã bước vào bản đồ chiến đấu,{' '}
              <strong className="text-amber-200">
                không bất kỳ ai — kể cả Chủ Tướng Kaelen — được rút hoặc gửi đồ với Kho Quân Đoàn
              </strong>
              . Chỉ khi kết thúc trận đánh (hoặc rút về Doanh Trại Liên Quân ở hậu phương), toàn quân
              mới mở Kho Quân Đoàn để cất giữ và phân phối trang bị.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono-num">
          <div className="p-3 bg-[#131b2e] border border-slate-700/80">
            <div className="text-[11px] text-slate-400">Vũ Khí Dự Trữ Tại Kho</div>
            <div className="text-base font-bold text-amber-200 mt-0.5">
              {convoyWeaponIds.length} món
            </div>
          </div>
          <div className="p-3 bg-[#131b2e] border border-slate-700/80">
            <div className="text-[11px] text-slate-400">Giáp Bảo Hộ Dự Trữ Tại Kho</div>
            <div className="text-base font-bold text-sky-200 mt-0.5">
              {convoyArmorList.length} món
            </div>
          </div>
          <div className="p-3 bg-[#131b2e] border border-slate-700/80">
            <div className="text-[11px] text-slate-400">Vật Phẩm · Ấn · Ngọc Tại Kho</div>
            <div className="text-base font-bold text-emerald-300 mt-0.5">
              {totalConvoyItemCount} món
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#11192b] border border-amber-500/35 text-xs text-slate-300 flex flex-col gap-1">
          <div className="font-semibold text-amber-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Quy Tắc Túi Đồ Cá Nhân &amp; Chiến Lợi Phẩm Rơi Ra Trong Trận:</span>
          </div>
          <p className="leading-relaxed">
            • Mỗi nhân vật mang tối đa{' '}
            <strong className="text-sky-300">{MAX_UNIT_CARRY_SLOTS} món đồ trong túi cá nhân</strong>{' '}
            — <strong className="text-emerald-300">KHÔNG tính các trang bị đang đeo trên người</strong>{' '}
            (Vũ khí đang cầm + Mũ, Áo giáp, Giáp tay, Giáp chân, Giày đang mặc đều tính 0 ô túi).
          </p>
          <p className="leading-relaxed">
            • Khi đánh bại quân địch trong trận có xác suất{' '}
            <strong className="text-amber-300">0.05% – 0.1%</strong> rơi ra{' '}
            <strong className="text-emerald-300">1 món đồ bất kỳ</strong>. Nếu túi nhân vật đã đầy (
            {MAX_UNIT_CARRY_SLOTS}/{MAX_UNIT_CARRY_SLOTS}), chiến lợi phẩm mới nhận được sẽ{' '}
            <strong className="text-amber-200">tự động chuyển thẳng về Kho Quân Đoàn</strong>!
          </p>
        </div>
      </div>
    );
  }

  if (!hero) {
    return (
      <div className="p-6 bg-[#111726] border border-slate-700 text-xs text-slate-400 text-center">
        Chưa có anh hùng nào để giao nhận với Kho Quân Đoàn.
      </div>
    );
  }

  const carryCount = getUnitCarryCount(hero);
  const carryFull = isUnitCarryFull(hero);
  const effStats = getEffectiveUnitStats(hero, commanderTitleId);
  const portraitUrl =
    (hero.portraitKey && PORTRAIT_ASSETS[hero.portraitKey]) ||
    PORTRAIT_ASSETS[hero.templateId] ||
    getUnitPortraitDataUrl(hero);
  const spriteUrl = getUnitSpriteDataUrl(hero, 0);

  const handleSelectHero = (id: string) => {
    setInternalUnitId(id);
    setNotice(null);
    onSelectUnit?.(id);
  };

  return (
    <div data-testid="convoy-panel" className="flex flex-col gap-3.5">
      {/* Top Status Strip */}
      <div className="px-3.5 py-2.5 bg-[#10182b] border border-amber-500/40 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-200">
          <Package className="w-4 h-4 text-amber-300 shrink-0" />
          <span>
            <strong className="text-emerald-300">Kho Quân Đoàn Hậu Phương (Ngoài Trận):</strong> Toàn
            quân tự do gửi cất và rút trang bị. Túi đồ cá nhân tối đa{' '}
            <strong className="text-amber-200">{MAX_UNIT_CARRY_SLOTS} món</strong>{' '}
            <span className="text-sky-200">
              (không kể Mũ, Giáp, Giáp tay, Giáp chân, Giày &amp; Vũ khí đang đeo trên người)
            </span>
            .
          </span>
        </div>

        {notice && (
          <span className="font-semibold text-amber-200 bg-amber-950/85 border border-amber-400/55 px-2.5 py-0.5">
            {notice}
          </span>
        )}
      </div>

      {/* Main 2-Column Storehouse Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT (5 cols): Selected Hero Personal Pack (X/6) + Worn Armor */}
        <div className="lg:col-span-5 bg-[#111829] border border-amber-500/35 p-3.5 flex flex-col gap-3">
          {/* Hero Switcher & Header */}
          <div className="flex items-center gap-3 pb-2.5 border-b border-slate-800">
            <div className="w-14 h-16 shrink-0 bg-[#080c15] border border-amber-400/55 overflow-hidden">
              <img
                src={portraitUrl}
                alt={hero.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top pixel-art"
              />
            </div>
            <div className="w-12 h-16 shrink-0 bg-[#0d1424] border border-sky-400/35 flex items-center justify-center">
              <img src={spriteUrl} alt={hero.name} className="w-11 h-14 object-contain pixel-art" />
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="convoy-hero-select" className="text-[10px] text-slate-400 block mb-0.5">
                Nhân vật giao nhận với Kho:
              </label>
              <select
                id="convoy-hero-select"
                aria-label="Chọn nhân vật giao nhận với Kho Quân Đoàn"
                value={hero.id}
                onChange={(e) => handleSelectHero(e.target.value)}
                className="w-full bg-[#172138] border border-amber-400/60 text-amber-100 font-display font-bold text-sm px-2 py-1 cursor-pointer"
              >
                {playerUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} · Lv.{u.level} ({u.className}) — Túi {getUnitCarryCount(u)}/
                    {MAX_UNIT_CARRY_SLOTS}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[11px] font-mono-num text-slate-300 flex items-center gap-2.5">
                <span>HP {hero.hp}/{effStats.maxHp}</span>
                <span>STR {effStats.str}</span>
                <span>MAG {effStats.mag}</span>
                <span>DEF {effStats.def}</span>
              </div>
            </div>
          </div>

          {/* Personal Pack Capacity Meter (X / 6 — excludes worn gear!) */}
          <div className="p-2.5 bg-[#0b101d] border border-slate-700/80">
            <div className="flex items-center justify-between text-xs font-mono-num">
              <span className="font-sans font-bold text-amber-200">
                Túi Đồ Cá Nhân Của {hero.name}
              </span>
              <span
                data-testid="convoy-hero-carry-count"
                className={`font-bold px-2 py-0.5 border ${
                  carryFull
                    ? 'bg-rose-950/90 text-rose-200 border-rose-400/60'
                    : 'bg-emerald-950/75 text-emerald-200 border-emerald-400/50'
                }`}
              >
                {carryCount}/{MAX_UNIT_CARRY_SLOTS} món {carryFull ? '(ĐẦY TÚI)' : ''}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Không kể Vũ khí đang cầm &amp; Mũ, Giáp, Giáp tay, Giáp chân, Giày đang đeo (0 ô túi)
            </div>
            <div className="grid grid-cols-6 gap-1 mt-2">
              {Array.from({ length: MAX_UNIT_CARRY_SLOTS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 border ${
                    i < carryCount
                      ? carryFull
                        ? 'bg-amber-400 border-amber-200'
                        : 'bg-sky-400 border-sky-200'
                      : 'bg-[#131b2c] border-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 1. Equipped Main Weapon + Spare Weapons in Bag */}
          <div className="flex flex-col gap-1.5">
            <div className="text-[11px] font-display font-bold text-amber-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  Vũ Khí: 1 Đang Cầm + {getSpareWeaponCount(hero)} Dự Phòng Trong Túi
                </span>
              </span>
              <span className="text-[10px] font-normal text-slate-400">Đang cầm = 0 ô túi</span>
            </div>

            {hero.inventory.map((w, idx) => {
              const isEquipped =
                hero.weapon.id === w.id &&
                hero.inventory.findIndex((cand) => cand.id === hero.weapon.id) === idx;
              const canStore = hero.inventory
                .filter((_, i) => i !== idx)
                .some((rw) => canUnitEquipWeapon(hero, rw));

              return (
                <div
                  key={`${w.id}-${idx}`}
                  className={`p-2 border flex items-center justify-between gap-2 text-xs ${
                    isEquipped
                      ? 'bg-[#16233d] border-sky-400/55'
                      : 'bg-[#151e32] border-slate-700/80'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-bold text-amber-100 truncate flex items-center gap-1.5">
                      <span className="truncate">{w.name}</span>
                      {isEquipped ? (
                        <span className="text-[10px] px-1.5 py-0.5 bg-sky-950/90 border border-sky-400/50 text-sky-200 font-semibold shrink-0">
                          Đang cầm · 0 ô túi
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 font-mono-num shrink-0">
                          Dự phòng · 1 ô túi
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono-num text-slate-400 mt-0.5">
                      {WEAPON_TYPE_LABEL[w.type]} · UL {w.might} · CX {w.hit}%
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!canStore}
                    title={
                      !canStore
                        ? 'Phải giữ lại ít nhất 1 vũ khí sử dụng được trên người'
                        : `Cất ${w.name} vào Kho Quân Đoàn`
                    }
                    onClick={() => {
                      const res = onStoreWeapon(hero.id, w.id);
                      if (res.message) setNotice(res.message);
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-[#1e2942] hover:bg-amber-600 hover:text-slate-950 disabled:opacity-35 text-amber-200 border border-amber-400/45 cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
                  >
                    <span>Cất Kho</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* 2. Carried Potions + Personal Items / Gems + Carried Spare Armor */}
          <div className="flex flex-col gap-1.5">
            <div className="text-[11px] font-display font-bold text-emerald-200 flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-emerald-300" />
              <span>
                Thuốc, Vật Phẩm &amp; Giáp Dự Phòng Trong Túi (
                {hero.potions +
                  (hero.carriedItems?.length ?? 0) +
                  (hero.carriedArmorUids?.length ?? 0)}
                )
              </span>
            </div>

            {hero.potions > 0 && (
              <div className="p-2 bg-[#132028] border border-emerald-500/35 flex items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-bold text-emerald-200">
                    Bình Thuốc Cá Nhân ×{hero.potions}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Dùng trực tiếp bằng lệnh Thuốc trong trận (+15 HP)
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="convoy-btn-store-potion"
                  onClick={() => {
                    const res = onStorePotion(hero.id);
                    if (res.message) setNotice(res.message);
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-[#1c2d38] hover:bg-emerald-600 text-emerald-100 border border-emerald-400/50 cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <span>Cất 1 Bình</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {(hero.carriedItems ?? []).map((itemId, idx) => {
              const item = ITEMS[itemId];
              const gem = GEMS[itemId];
              const label = item?.name ?? gem?.name ?? itemId;
              const desc = item?.description ?? gem?.description ?? '';
              return (
                <div
                  key={`${itemId}-${idx}`}
                  className="p-2 bg-[#151e32] border border-slate-700/80 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-amber-100 truncate">{label}</div>
                    <div className="text-[10px] text-slate-400 truncate">{desc}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const res = onStorePersonalItem(hero.id, idx);
                      if (res.message) setNotice(res.message);
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-[#1e2942] hover:bg-amber-600 hover:text-slate-950 text-amber-200 border border-amber-400/45 cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
                  >
                    <span>Cất Kho</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {(hero.carriedArmorUids ?? []).map((uid) => {
              const eq = equipmentBag.find((e) => e.uid === uid);
              const tpl = eq ? ARMOR_TEMPLATES[eq.templateId] : null;
              if (!eq || !tpl) return null;
              return (
                <div
                  key={uid}
                  className="p-2 bg-[#151e32] border border-sky-500/35 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div
                      className="font-bold truncate"
                      style={{ color: EQUIPMENT_RARITY_META[eq.rarity].color }}
                    >
                      {tpl.name} (Giáp trong túi · Lv.{eq.level})
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {ARMOR_SLOT_META[eq.slot].label} · Đang cất trong túi (1 ô túi)
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onEquipConvoyArmor(hero.id, uid);
                        setNotice(`${hero.name} đã mặc ${tpl.name} lên người (giải phóng 1 ô túi)!`);
                      }}
                      className="px-2 py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-200 cursor-pointer whitespace-nowrap"
                    >
                      Mặc Ngay
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const res = onStoreCarriedArmor(hero.id, uid);
                        if (res.message) setNotice(res.message);
                      }}
                      className="px-2 py-1 text-[11px] font-semibold bg-[#1e2942] hover:bg-amber-600 hover:text-slate-950 text-amber-200 border border-amber-400/45 cursor-pointer flex items-center gap-1 whitespace-nowrap"
                    >
                      <span>Cất Kho</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {hero.potions === 0 &&
              (hero.carriedItems?.length ?? 0) === 0 &&
              (hero.carriedArmorUids?.length ?? 0) === 0 && (
                <div className="text-[11px] text-slate-500 italic py-1">
                  Chưa mang bình thuốc, vật phẩm hay giáp dự phòng nào trong túi.
                </div>
              )}
          </div>

          {/* 3. Worn 5-Slot Armor (Mũ, Giáp, Giáp tay, Giáp chân, Giày — 0 bag slots!) */}
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
            <div className="text-[11px] font-display font-bold text-sky-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sky-300" />
                <span>Trang Bị Đang Đeo (Mũ · Giáp · Tay · Chân · Giày)</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-300">0 ô túi đồ</span>
            </div>

            {ARMOR_SLOTS.map((slot) => {
              const eq = hero.equipment?.[slot];
              const tpl = eq ? ARMOR_TEMPLATES[eq.templateId] : null;
              return (
                <div
                  key={slot}
                  className="px-2.5 py-1.5 bg-[#0d1322] border border-slate-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span style={{ color: ARMOR_SLOT_META[slot].accent }}>
                      <ArmorSlotGlyph slot={slot} className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {ARMOR_SLOT_META[slot].shortLabel}:
                    </span>
                    {eq && tpl ? (
                      <span
                        className="font-bold truncate"
                        style={{ color: EQUIPMENT_RARITY_META[eq.rarity].color }}
                      >
                        {tpl.name}
                        {eq.temperLevel > 0 ? ` +${eq.temperLevel}` : ''} (Lv.{eq.level})
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Trống</span>
                    )}
                  </div>
                  {eq && tpl && (
                    <button
                      type="button"
                      onClick={() => {
                        onUnequipWornArmorToConvoy(hero.id, slot);
                        setNotice(`Đã tháo ${tpl.name} cất vào Kho Quân Đoàn.`);
                      }}
                      className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Tháo cất Kho
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT (7 cols): Kho Quân Đoàn Master Storehouse */}
        <div className="lg:col-span-7 bg-[#111829] border border-amber-500/35 flex flex-col overflow-hidden">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 bg-[#0c111e] border-b border-slate-800 overflow-x-auto">
            <button
              type="button"
              data-testid="convoy-subtab-weapons"
              onClick={() => setCategoryTab('WEAPONS')}
              className={`px-3 py-1.5 text-xs font-bold border cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                categoryTab === 'WEAPONS'
                  ? 'bg-amber-600 text-slate-950 border-amber-300'
                  : 'bg-[#151e32] text-slate-300 border-slate-700 hover:text-amber-200'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Kho Vũ Khí ({convoyWeaponIds.length})</span>
            </button>

            <button
              type="button"
              data-testid="convoy-subtab-armor"
              onClick={() => setCategoryTab('ARMOR')}
              className={`px-3 py-1.5 text-xs font-bold border cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                categoryTab === 'ARMOR'
                  ? 'bg-sky-600 text-white border-sky-300'
                  : 'bg-[#151e32] text-slate-300 border-slate-700 hover:text-sky-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Kho Giáp Bảo Hộ ({convoyArmorList.length})</span>
            </button>

            <button
              type="button"
              data-testid="convoy-subtab-items"
              onClick={() => setCategoryTab('ITEMS')}
              className={`px-3 py-1.5 text-xs font-bold border cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                categoryTab === 'ITEMS'
                  ? 'bg-emerald-600 text-white border-emerald-300'
                  : 'bg-[#151e32] text-slate-300 border-slate-700 hover:text-emerald-200'
              }`}
            >
              <Gem className="w-3.5 h-3.5" />
              <span>Kho Vật Phẩm · Ấn · Ngọc ({totalConvoyItemCount})</span>
            </button>
          </div>

          <div className="p-3.5 flex flex-col gap-2 max-h-[560px] overflow-y-auto chronicle-scroll">
            {categoryTab === 'WEAPONS' && (
              <>
                {groupedConvoyWeapons.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-[#0d1322] border border-slate-800">
                    Kho Vũ Khí Quân Đoàn hiện đang trống. Các vũ khí mua thêm hoặc nhặt được khi đầy
                    túi sẽ tập kết tại đây!
                  </div>
                ) : (
                  groupedConvoyWeapons.map(({ weapon, count }) => {
                    const canEquip = canUnitEquipWeapon(hero, weapon);
                    const duplicate = hero.inventory.some((w) => w.id === weapon.id);
                    const disabled = carryFull || duplicate;

                    return (
                      <div
                        key={weapon.id}
                        className="p-2.5 bg-[#151e32] border border-slate-700/85 flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-sm text-amber-100">
                              {weapon.name}
                            </span>
                            <span className="font-mono-num text-xs font-bold text-amber-300">
                              ×{count}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 border ${
                                canEquip
                                  ? 'bg-emerald-950/75 text-emerald-300 border-emerald-500/40'
                                  : 'bg-slate-900 text-slate-400 border-slate-700'
                              }`}
                            >
                              {canEquip ? `${hero.name} dùng được` : 'Chỉ mang hộ'}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono-num text-slate-300 mt-0.5">
                            {WEAPON_TYPE_LABEL[weapon.type]} · Uy lực {weapon.might} · CX{' '}
                            {weapon.hit}% · CM {weapon.crit}%
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              const res = onWithdrawWeapon(hero.id, weapon.id, false);
                              if (res.message) setNotice(res.message);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold bg-sky-700 hover:bg-sky-600 disabled:opacity-35 text-white border border-sky-300/60 cursor-pointer flex items-center gap-1 whitespace-nowrap"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>
                              {carryFull
                                ? 'Túi Đầy (6/6)'
                                : duplicate
                                ? 'Đã có trong túi'
                                : `Rút vào túi ${hero.name}`}
                            </span>
                          </button>

                          {canEquip && !duplicate && (
                            <button
                              type="button"
                              title={
                                carryFull
                                  ? `Đổi cầm ${weapon.name} ngay (vũ khí đang cầm ${hero.weapon.name} sẽ trả về Kho Quân Đoàn, giữ nguyên 6/6 túi)`
                                  : `Rút ${weapon.name} và trang bị cầm ngay trên tay`
                              }
                              onClick={() => {
                                const res = onWithdrawWeapon(hero.id, weapon.id, true);
                                if (res.message) setNotice(res.message);
                              }}
                              className="px-2.5 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-200 cursor-pointer flex items-center gap-1 whitespace-nowrap"
                            >
                              <Check className="w-3 h-3" />
                              <span>{carryFull ? 'Đổi Cầm Ngay' : 'Rút & Cầm Ngay'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {categoryTab === 'ARMOR' && (
              <>
                {convoyArmorList.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-[#0d1322] border border-slate-800">
                    Kho Giáp Bảo Hộ hiện không có món nào rảnh rỗi (tất cả đang được mặc hoặc mang
                    theo).
                  </div>
                ) : (
                  convoyArmorList.map((eq) => {
                    const tpl = ARMOR_TEMPLATES[eq.templateId];
                    if (!tpl) return null;
                    const bonuses = computeArmorInstanceBonuses(eq);
                    return (
                      <div
                        key={eq.uid}
                        className="p-2.5 bg-[#151e32] border border-slate-700/85 flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-display font-bold text-sm"
                              style={{ color: EQUIPMENT_RARITY_META[eq.rarity].color }}
                            >
                              {tpl.name}
                              {eq.temperLevel > 0 ? ` +${eq.temperLevel}` : ''} (Lv.{eq.level})
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-[#0d1322] border border-slate-700 text-slate-300">
                              {ARMOR_SLOT_META[eq.slot].label} ·{' '}
                              {EQUIPMENT_RARITY_META[eq.rarity].label}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono-num text-emerald-300 mt-0.5">
                            {bonuses.stats.maxHp > 0 ? `HP+${bonuses.stats.maxHp} ` : ''}
                            {bonuses.stats.def > 0 ? `DEF+${bonuses.stats.def} ` : ''}
                            {bonuses.stats.res > 0 ? `RES+${bonuses.stats.res} ` : ''}
                            {bonuses.stats.spd > 0 ? `SPD+${bonuses.stats.spd} ` : ''}
                            {bonuses.stats.str > 0 ? `STR+${bonuses.stats.str} ` : ''}
                            {bonuses.stats.mag > 0 ? `MAG+${bonuses.stats.mag}` : ''}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={carryFull}
                            onClick={() => {
                              const res = onWithdrawArmorToPack(hero.id, eq.uid);
                              if (res.message) setNotice(res.message);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold bg-sky-700 hover:bg-sky-600 disabled:opacity-35 text-white border border-sky-300/60 cursor-pointer flex items-center gap-1 whitespace-nowrap"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>{carryFull ? 'Túi Đầy (6/6)' : 'Bỏ vào túi'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onEquipConvoyArmor(hero.id, eq.uid);
                              setNotice(`${hero.name} đã mặc ${tpl.name} từ Kho Quân Đoàn!`);
                            }}
                            className="px-2.5 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-200 cursor-pointer flex items-center gap-1 whitespace-nowrap"
                          >
                            <Check className="w-3 h-3" />
                            <span>Mặc Ngay</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {categoryTab === 'ITEMS' && (
              <>
                {convoyItemsAndGems.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-[#0d1322] border border-slate-800">
                    Kho Vật Phẩm &amp; Bảo Ngọc hiện đang trống.
                  </div>
                ) : (
                  convoyItemsAndGems.map((entry) => {
                    const id = entry.kind === 'ITEM' ? entry.item.id : entry.gem.id;
                    const name = entry.kind === 'ITEM' ? entry.item.name : entry.gem.name;
                    const desc =
                      entry.kind === 'ITEM' ? entry.item.description : entry.gem.description;
                    const color =
                      entry.kind === 'ITEM' ? entry.item.accentColor : entry.gem.color;
                    const isPotion = id === 'vulnerary';

                    return (
                      <div
                        key={id}
                        className="p-2.5 bg-[#151e32] border border-slate-700/85 flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 inline-block shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span className="font-display font-bold text-sm text-amber-100">
                              {name}
                            </span>
                            <span className="font-mono-num text-xs font-bold text-emerald-300">
                              ×{entry.count}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300 mt-0.5">{desc}</div>
                        </div>

                        <button
                          type="button"
                          data-testid={`convoy-btn-withdraw-${id}`}
                          disabled={carryFull}
                          onClick={() => {
                            const res = isPotion
                              ? onWithdrawPotion(hero.id)
                              : onWithdrawItem(hero.id, id);
                            if (res.message) setNotice(res.message);
                          }}
                          className="px-3 py-1 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 disabled:opacity-35 text-white border border-emerald-300/60 cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          <span>
                            {carryFull ? 'Túi Đầy (6/6)' : `Rút sang túi ${hero.name}`}
                          </span>
                        </button>
                      </div>
                    );
                  })
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
