import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Coins,
  Crown,
  Flame,
  Footprints,
  Gem,
  Hammer,
  Layers,
  Lock,
  Merge,
  Shield,
  Sparkles,
  Swords,
  TrendingUp,
} from 'lucide-react';
import {
  canUnitTakeEquippedArmorFromOwner,
  getUnitCarriedItemCounts,
  isUnitCarryFull,
  MAX_UNIT_CARRY_SLOTS,
} from '../game/engine';
import {
  ARMOR_SLOT_META,
  ARMOR_SLOTS,
  ARMOR_TEMPLATES,
  computeArmorInstanceBonuses,
  computeWeaponForgeBonuses,
  createDefaultWeaponForge,
  EQUIPMENT_RARITY_META,
  GEM_LIST,
  GEMS,
  getFusionCost,
  getLevelUpEquipmentCost,
  getMaxSocketsForRarity,
  getNextRarity,
  getTemperCost,
  MAX_EQUIPMENT_LEVEL,
  MAX_TEMPER_LEVEL,
} from '../game/data';
import type {
  ArmorSlot,
  EquipmentInstance,
  Unit,
  UnitStats,
  WeaponForgeState,
} from '../game/types';

type SelectedSlot = 'WEAPON' | ArmorSlot;
type ForgeSubTab = 'TEMPER' | 'LEVEL' | 'GEMS' | 'FUSE';

interface EquipmentForgePanelProps {
  unit: Unit;
  allies: Unit[];
  deployedUnits?: Unit[];
  isFreeLogistics?: boolean;
  isOutOfBattle?: boolean;
  gold: number;
  itemBag: Record<string, number>;
  equipmentBag: EquipmentInstance[];
  weaponForges: Record<string, WeaponForgeState>;
  convoyWeaponIds: string[];
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
  onOpenShop?: () => void;
}

const STAT_LABELS: Array<{ key: keyof UnitStats; label: string }> = [
  { key: 'maxHp', label: 'HP' },
  { key: 'str', label: 'STR' },
  { key: 'mag', label: 'MAG' },
  { key: 'skl', label: 'SKL' },
  { key: 'spd', label: 'SPD' },
  { key: 'lck', label: 'LCK' },
  { key: 'def', label: 'DEF' },
  { key: 'res', label: 'RES' },
  { key: 'mov', label: 'MOV' },
];

function formatStatBadges(stats: UnitStats, hit = 0, crit = 0, avoid = 0): string[] {
  const parts: string[] = [];
  for (const { key, label } of STAT_LABELS) {
    if (stats[key] > 0) parts.push(`${label} +${stats[key]}`);
  }
  if (hit > 0) parts.push(`CX +${hit}%`);
  if (crit > 0) parts.push(`CM +${crit}%`);
  if (avoid > 0) parts.push(`NÉ +${avoid}%`);
  return parts;
}

function SlotIcon({ slot, className }: { slot: SelectedSlot; className?: string }) {
  switch (slot) {
    case 'WEAPON':
      return <Swords className={className} />;
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

export function EquipmentForgePanel({
  unit,
  allies,
  deployedUnits,
  isFreeLogistics = true,
  isOutOfBattle,
  gold,
  itemBag,
  equipmentBag,
  weaponForges,
  convoyWeaponIds,
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
  onOpenShop,
}: EquipmentForgePanelProps) {
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot>('HELMET');
  const [forgeTab, setForgeTab] = useState<ForgeSubTab>('TEMPER');
  const [selectedMaterialUid, setSelectedMaterialUid] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const resolvedOutOfBattle = isOutOfBattle ?? isFreeLogistics;
  const accessibleItemBag = useMemo(
    () => (resolvedOutOfBattle ? itemBag : getUnitCarriedItemCounts(unit)),
    [resolvedOutOfBattle, itemBag, unit]
  );

  const temperStones = accessibleItemBag.temper_stone ?? 0;
  const starIngots = accessibleItemBag.star_ingot ?? 0;
  const fusionCrystals = accessibleItemBag.fusion_crystal ?? 0;

  const ownedGems = useMemo(() => {
    return GEM_LIST.map((gem) => ({ gem, count: accessibleItemBag[gem.id] ?? 0 })).filter(
      (entry) => entry.count > 0
    );
  }, [accessibleItemBag]);

  const totalOwnedGems = useMemo(
    () => ownedGems.reduce((sum, g) => sum + g.count, 0),
    [ownedGems]
  );

  // Map each equipped or carried armor UID -> owner hero
  const ownerByUid = useMemo(() => {
    const map = new Map<string, Unit>();
    for (const hero of allies) {
      if (hero.equipment) {
        for (const s of ARMOR_SLOTS) {
          const piece = hero.equipment[s];
          if (piece) map.set(piece.uid, hero);
        }
      }
      for (const uid of hero.carriedArmorUids ?? []) {
        if (!map.has(uid)) map.set(uid, hero);
      }
    }
    return map;
  }, [allies]);

  // Active target item (either equipped armor in selectedSlot, or active Weapon)
  const activeArmor: EquipmentInstance | null =
    selectedSlot !== 'WEAPON' ? unit.equipment?.[selectedSlot] ?? null : null;
  const activeArmorTpl = activeArmor ? ARMOR_TEMPLATES[activeArmor.templateId] : null;
  const activeWeaponForge: WeaponForgeState = useMemo(
    () => weaponForges[unit.weapon.id] ?? unit.weaponForge ?? createDefaultWeaponForge(unit.weapon),
    [weaponForges, unit.weapon, unit.weaponForge]
  );

  // Bag items matching selected Armor slot
  const slotBagItems = useMemo(() => {
    if (selectedSlot === 'WEAPON') return [];
    return equipmentBag
      .filter((eq) => eq.slot === selectedSlot)
      .sort((a, b) => {
        const aOwned = unit.equipment?.[selectedSlot]?.uid === a.uid ? 1 : 0;
        const bOwned = unit.equipment?.[selectedSlot]?.uid === b.uid ? 1 : 0;
        if (aOwned !== bOwned) return bOwned - aOwned;
        return b.level - a.level || b.temperLevel - a.temperLevel;
      });
  }, [equipmentBag, selectedSlot, unit.equipment]);

  // Eligible fusion material candidates for activeArmor
  const fusionCandidates = useMemo(() => {
    if (!activeArmor) return [];
    const personalCarriedSet = new Set(unit.carriedArmorUids ?? []);
    return equipmentBag.filter((eq) => {
      if (eq.uid === activeArmor.uid || eq.slot !== activeArmor.slot || eq.rarity !== activeArmor.rarity) {
        return false;
      }
      if (!resolvedOutOfBattle) {
        return personalCarriedSet.has(eq.uid);
      }
      const holder = ownerByUid.get(eq.uid);
      return !holder || personalCarriedSet.has(eq.uid);
    });
  }, [activeArmor, equipmentBag, ownerByUid, resolvedOutOfBattle, unit.carriedArmorUids]);

  const resolvedMaterialUid =
    selectedMaterialUid && fusionCandidates.some((c) => c.uid === selectedMaterialUid)
      ? selectedMaterialUid
      : fusionCandidates[0]?.uid ?? null;

  const isWeaponSelected = selectedSlot === 'WEAPON';
  const targetRarity = isWeaponSelected
    ? activeWeaponForge.rarity
    : activeArmor?.rarity ?? 'COMMON';
  const targetLevel = isWeaponSelected ? activeWeaponForge.level : activeArmor?.level ?? 1;
  const targetTemper = isWeaponSelected
    ? activeWeaponForge.temperLevel
    : activeArmor?.temperLevel ?? 0;
  const targetGems = isWeaponSelected ? activeWeaponForge.gems : activeArmor?.gems ?? [];
  const maxSockets = getMaxSocketsForRarity(targetRarity);
  const nextRarity = getNextRarity(targetRarity);

  const temperCost = getTemperCost(targetTemper);
  const levelCost = getLevelUpEquipmentCost(targetLevel);
  const fusionCost = getFusionCost(targetRarity);

  const weaponCopyCount = useMemo(
    () =>
      resolvedOutOfBattle ? convoyWeaponIds.filter((id) => id === unit.weapon.id).length : 0,
    [resolvedOutOfBattle, convoyWeaponIds, unit.weapon.id]
  );
  const weaponFuseCrystalsNeeded =
    weaponCopyCount > 0 ? fusionCost.crystals : fusionCost.crystals + 2;

  const activeArmorStats = useMemo(
    () => (activeArmor ? computeArmorInstanceBonuses(activeArmor) : null),
    [activeArmor]
  );
  const nextTemperArmorStats = useMemo(() => {
    if (!activeArmor || activeArmor.temperLevel >= MAX_TEMPER_LEVEL) return null;
    return computeArmorInstanceBonuses({
      ...activeArmor,
      temperLevel: activeArmor.temperLevel + 1,
    });
  }, [activeArmor]);
  const nextLevelArmorStats = useMemo(() => {
    if (!activeArmor || activeArmor.level >= MAX_EQUIPMENT_LEVEL) return null;
    return computeArmorInstanceBonuses({
      ...activeArmor,
      level: activeArmor.level + 1,
    });
  }, [activeArmor]);
  const nextFuseArmorStats = useMemo(() => {
    if (!activeArmor || !nextRarity) return null;
    return computeArmorInstanceBonuses({
      ...activeArmor,
      rarity: nextRarity,
      level: Math.min(MAX_EQUIPMENT_LEVEL, activeArmor.level + 1),
    });
  }, [activeArmor, nextRarity]);

  const activeWeaponBonuses = useMemo(
    () => computeWeaponForgeBonuses(unit.weapon, activeWeaponForge),
    [unit.weapon, activeWeaponForge]
  );

  const flashNotice = (msg: string) => {
    setFeedback(msg);
  };

  return (
    <div data-testid="equipment-forge-panel" className="flex flex-col gap-3">
      {/* Forging Materials Stock Bar */}
      <div className="px-3 py-2 bg-[#101626] border border-amber-500/35 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono-num text-[11px] uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
            <Hammer className="w-3.5 h-3.5" />
            Kho Lò Rèn:
          </span>
          <span className="font-mono-num text-amber-200">
            Đá Tôi Luyện: <strong className="text-amber-300">{temperStones}</strong>
          </span>
          <span className="font-mono-num text-sky-200">
            Tinh Thiết: <strong className="text-sky-300">{starIngots}</strong>
          </span>
          <span className="font-mono-num text-purple-200">
            Tinh Thể Hợp Nhất: <strong className="text-purple-300">{fusionCrystals}</strong>
          </span>
          <span className="font-mono-num text-emerald-200">
            Bảo Ngọc: <strong className="text-emerald-300">{totalOwnedGems}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {feedback && (
            <span className="px-2 py-0.5 bg-emerald-950/90 border border-emerald-400/60 text-emerald-200 text-[11px] font-semibold">
              {feedback}
            </span>
          )}
          {onOpenShop && (
            <button
              type="button"
              onClick={onOpenShop}
              className="px-2.5 py-1 text-[11px] font-semibold bg-amber-950/70 hover:bg-amber-900/70 border border-amber-400/60 text-amber-200 cursor-pointer"
            >
              Mua Giáp & Ngọc
            </button>
          )}
        </div>
      </div>

      {/* 6-Slot Hero Equipment Strip: Vũ Khí + Mũ + Áo Giáp + Giáp Tay + Giáp Chân + Giày */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {(['WEAPON', ...ARMOR_SLOTS] as SelectedSlot[]).map((slot) => {
          const isSelected = selectedSlot === slot;
          if (slot === 'WEAPON') {
            const rarityMeta = EQUIPMENT_RARITY_META[activeWeaponForge.rarity];
            const wfSockets = getMaxSocketsForRarity(activeWeaponForge.rarity);
            return (
              <button
                key="WEAPON"
                type="button"
                data-testid="equip-slot-weapon"
                onClick={() => {
                  setSelectedSlot('WEAPON');
                  setFeedback(null);
                }}
                className={`p-2 text-left border transition-colors cursor-pointer flex flex-col justify-between gap-1 ${
                  isSelected
                    ? 'bg-[#202a42] border-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.28)]'
                    : 'bg-[#141b2b] border-slate-700/80 hover:border-amber-400/60'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-mono-num uppercase tracking-wider text-amber-300 flex items-center gap-1 font-bold">
                    <SlotIcon slot="WEAPON" className="w-3 h-3" />
                    Vũ Khí
                  </span>
                  {activeWeaponForge.temperLevel > 0 && (
                    <span className="text-[10px] font-mono-num font-bold text-amber-200 bg-amber-950/90 px-1 border border-amber-400/60">
                      +{activeWeaponForge.temperLevel}
                    </span>
                  )}
                </div>
                <div
                  className="text-xs font-bold truncate"
                  style={{ color: rarityMeta.color }}
                >
                  {unit.weapon.name}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono-num text-slate-400">
                  <span>Lv.{activeWeaponForge.level}</span>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: wfSockets }).map((_, i) => {
                      const gid = activeWeaponForge.gems[i];
                      const g = gid ? GEMS[gid] : null;
                      return (
                        <span
                          key={i}
                          className="w-2 h-2 inline-block border border-slate-500"
                          style={{ backgroundColor: g ? g.color : 'transparent' }}
                        />
                      );
                    })}
                  </span>
                </div>
              </button>
            );
          }

          const eq = unit.equipment?.[slot] ?? null;
          const tpl = eq ? ARMOR_TEMPLATES[eq.templateId] : null;
          const slotMeta = ARMOR_SLOT_META[slot];
          const rarityMeta = eq ? EQUIPMENT_RARITY_META[eq.rarity] : null;
          const sockets = eq ? getMaxSocketsForRarity(eq.rarity) : 0;

          return (
            <button
              key={slot}
              type="button"
              data-testid={`equip-slot-${slot.toLowerCase()}`}
              onClick={() => {
                setSelectedSlot(slot);
                setFeedback(null);
              }}
              className={`p-2 text-left border transition-colors cursor-pointer flex flex-col justify-between gap-1 ${
                isSelected
                  ? 'bg-[#202a42] border-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.28)]'
                  : 'bg-[#141b2b] border-slate-700/80 hover:border-amber-400/60'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className="text-[10px] font-mono-num uppercase tracking-wider flex items-center gap-1 font-bold"
                  style={{ color: slotMeta.accent }}
                >
                  <SlotIcon slot={slot} className="w-3 h-3" />
                  {slotMeta.shortLabel}
                </span>
                {eq && eq.temperLevel > 0 && (
                  <span className="text-[10px] font-mono-num font-bold text-amber-200 bg-amber-950/90 px-1 border border-amber-400/60">
                    +{eq.temperLevel}
                  </span>
                )}
              </div>
              {eq && tpl && rarityMeta ? (
                <>
                  <div
                    className="text-xs font-bold truncate"
                    style={{ color: rarityMeta.color }}
                  >
                    {tpl.name}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono-num text-slate-400">
                    <span>Lv.{eq.level}</span>
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: sockets }).map((_, i) => {
                        const gid = eq.gems[i];
                        const g = gid ? GEMS[gid] : null;
                        return (
                          <span
                            key={i}
                            className="w-2 h-2 inline-block border border-slate-500"
                            style={{ backgroundColor: g ? g.color : 'transparent' }}
                          />
                        );
                      })}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs text-slate-500 italic">Chưa trang bị</div>
                  <div className="text-[10px] text-slate-500">Chọn để mặc</div>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Split: Left = Lò Rèn Thần Binh (4 Mechanics) | Right = Armory Selector for Active Slot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* LEFT (7 cols): Blacksmith Forge Workstation */}
        <div className="lg:col-span-7 bg-[#121828] border border-amber-500/35 flex flex-col overflow-hidden">
          {/* Active Target Summary Banner */}
          <div className="px-3.5 py-2.5 bg-[#0d121f] border-b border-slate-700/75 flex items-center justify-between gap-3">
            {isWeaponSelected ? (
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="px-1.5 py-0.5 text-[10px] font-mono-num font-bold uppercase border"
                    style={{
                      color: EQUIPMENT_RARITY_META[activeWeaponForge.rarity].color,
                      borderColor: `${EQUIPMENT_RARITY_META[activeWeaponForge.rarity].color}88`,
                    }}
                  >
                    {EQUIPMENT_RARITY_META[activeWeaponForge.rarity].label}
                  </span>
                  <span className="font-display font-bold text-sm text-amber-100 truncate">
                    {unit.weapon.name}
                    {activeWeaponForge.temperLevel > 0 && (
                      <span className="ml-1.5 text-amber-300 font-mono-num">
                        +{activeWeaponForge.temperLevel}
                      </span>
                    )}
                  </span>
                  <span className="text-xs font-mono-num text-sky-300">
                    Lv.{activeWeaponForge.level}/{MAX_EQUIPMENT_LEVEL}
                  </span>
                </div>
                <div className="text-[11px] font-mono-num text-emerald-300 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                  <span>
                    Uy lực: {unit.weapon.might}
                    {activeWeaponBonuses.might > 0 && (
                      <strong className="text-amber-300"> (+{activeWeaponBonuses.might})</strong>
                    )}
                  </span>
                  <span>
                    CX: {unit.weapon.hit}%
                    {activeWeaponBonuses.hit > 0 && (
                      <strong className="text-amber-300"> (+{activeWeaponBonuses.hit}%)</strong>
                    )}
                  </span>
                  <span>
                    CM: {unit.weapon.crit}%
                    {activeWeaponBonuses.crit > 0 && (
                      <strong className="text-amber-300"> (+{activeWeaponBonuses.crit}%)</strong>
                    )}
                  </span>
                </div>
              </div>
            ) : activeArmor && activeArmorTpl && activeArmorStats ? (
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="px-1.5 py-0.5 text-[10px] font-mono-num font-bold uppercase border"
                    style={{
                      color: EQUIPMENT_RARITY_META[activeArmor.rarity].color,
                      borderColor: `${EQUIPMENT_RARITY_META[activeArmor.rarity].color}88`,
                    }}
                  >
                    {EQUIPMENT_RARITY_META[activeArmor.rarity].label}
                  </span>
                  <span className="font-display font-bold text-sm text-amber-100 truncate">
                    {activeArmorTpl.name}
                    {activeArmor.temperLevel > 0 && (
                      <span className="ml-1.5 text-amber-300 font-mono-num">
                        +{activeArmor.temperLevel}
                      </span>
                    )}
                  </span>
                  <span className="text-xs font-mono-num text-sky-300">
                    Lv.{activeArmor.level}/{MAX_EQUIPMENT_LEVEL}
                  </span>
                </div>
                <div className="text-[11px] font-mono-num text-emerald-300 mt-1 flex flex-wrap gap-x-2.5 gap-y-0.5">
                  {formatStatBadges(
                    activeArmorStats.stats,
                    activeArmorStats.hit,
                    activeArmorStats.crit,
                    activeArmorStats.avoid
                  ).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                Ô <strong className="text-amber-200">{ARMOR_SLOT_META[selectedSlot as ArmorSlot].label}</strong> đang trống. Hãy chọn một trang bị ở danh sách bên phải để mặc và rèn!
              </div>
            )}

            {!isWeaponSelected && activeArmor && (
              <button
                type="button"
                disabled={!resolvedOutOfBattle && isUnitCarryFull(unit)}
                title={
                  !resolvedOutOfBattle && isUnitCarryFull(unit)
                    ? `Túi đồ cá nhân của ${unit.name} đã đầy (${MAX_UNIT_CARRY_SLOTS}/${MAX_UNIT_CARRY_SLOTS}) — không thể tháo giáp cất vào túi giữa trận`
                    : resolvedOutOfBattle
                    ? 'Tháo trang bị cất vào Kho Quân Đoàn'
                    : 'Tháo trang bị cất vào túi đồ cá nhân'
                }
                onClick={() => {
                  onUnequipArmor(unit.id, activeArmor.slot);
                  flashNotice(`Đã tháo ${activeArmorTpl?.name ?? 'trang bị'}`);
                }}
                className="shrink-0 px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-600 text-slate-200 cursor-pointer whitespace-nowrap"
              >
                {!resolvedOutOfBattle && isUnitCarryFull(unit) ? 'Túi đầy (6/6)' : 'Tháo'}
              </button>
            )}
          </div>

          {/* 4 Forge Mode Tabs */}
          <div className="grid grid-cols-4 border-b border-slate-700/75 bg-[#0f1422]">
            {(
              [
                { id: 'TEMPER', label: 'Tôi Luyện', icon: Flame, activeCls: 'border-amber-400 text-amber-200 bg-amber-950/40' },
                { id: 'LEVEL', label: 'Lên Cấp', icon: TrendingUp, activeCls: 'border-sky-400 text-sky-200 bg-sky-950/40' },
                { id: 'GEMS', label: 'Khảm Ngọc', icon: Gem, activeCls: 'border-emerald-400 text-emerald-200 bg-emerald-950/40' },
                { id: 'FUSE', label: 'Hợp Nhất', icon: Merge, activeCls: 'border-purple-400 text-purple-200 bg-purple-950/40' },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isAct = forgeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  data-testid={`forge-tab-${tab.id.toLowerCase()}`}
                  onClick={() => setForgeTab(tab.id)}
                  className={`py-2 px-1 text-[11px] font-bold flex items-center justify-center gap-1 border-b-2 transition-colors cursor-pointer ${
                    isAct
                      ? tab.activeCls
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Forge Action Body */}
          <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
            {!isWeaponSelected && !activeArmor ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Trang bị một món <strong>{ARMOR_SLOT_META[selectedSlot as ArmorSlot].label}</strong> từ kho bên phải để mở khóa Tôi Luyện, Lên Cấp, Khảm Bảo Ngọc và Hợp Nhất.
              </div>
            ) : forgeTab === 'TEMPER' ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Bậc Tôi Luyện hiện tại</span>
                  <span className="font-mono-num text-amber-300 font-bold text-sm">
                    +{targetTemper} <span className="text-slate-500">/ +{MAX_TEMPER_LEVEL}</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-900 border border-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all"
                    style={{ width: `${(targetTemper / MAX_TEMPER_LEVEL) * 100}%` }}
                  />
                </div>

                {targetTemper >= MAX_TEMPER_LEVEL ? (
                  <div className="p-3 bg-amber-950/40 border border-amber-400/50 text-xs text-amber-200 text-center font-semibold">
                    ✦ Trang bị đã đạt Tôi Luyện Cực Đại (+{MAX_TEMPER_LEVEL})!
                  </div>
                ) : (
                  <>
                    <div className="p-2.5 bg-[#0c111d] border border-slate-700/70 text-xs">
                      <div className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold mb-1">
                        Hiệu quả khi Tôi Luyện lên +{targetTemper + 1}:
                      </div>
                      {isWeaponSelected ? (
                        <div className="font-mono-num text-emerald-300 flex flex-wrap gap-3">
                          <span>Uy lực +1</span>
                          <span>Chính xác +2%</span>
                          {(targetTemper + 1) % 2 === 0 && <span>Chí mạng +2%</span>}
                        </div>
                      ) : nextTemperArmorStats ? (
                        <div className="font-mono-num text-emerald-300 flex flex-wrap gap-2.5">
                          {formatStatBadges(
                            nextTemperArmorStats.stats,
                            nextTemperArmorStats.hit,
                            nextTemperArmorStats.crit,
                            nextTemperArmorStats.avoid
                          ).map((t) => (
                            <span key={t}>{t}</span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="text-xs font-mono-num flex items-center gap-3">
                        <span
                          className={
                            temperStones >= temperCost.stones ? 'text-amber-200' : 'text-rose-400'
                          }
                        >
                          Đá Tôi Luyện: {temperStones}/{temperCost.stones}
                        </span>
                        <span
                          className={gold >= temperCost.gold ? 'text-amber-300' : 'text-rose-400'}
                        >
                          <Coins className="w-3.5 h-3.5 inline mr-1" />
                          {temperCost.gold} G
                        </span>
                      </div>
                      <button
                        type="button"
                        data-testid="btn-temper-action"
                        disabled={gold < temperCost.gold || temperStones < temperCost.stones}
                        onClick={() => {
                          if (isWeaponSelected) {
                            onTemperWeapon(unit.weapon.id);
                            flashNotice(`Tôi luyện ${unit.weapon.name} lên +${targetTemper + 1}!`);
                          } else if (activeArmor) {
                            onTemperArmor(activeArmor.uid);
                            flashNotice(
                              `Tôi luyện ${activeArmorTpl?.name ?? 'Giáp'} lên +${targetTemper + 1}!`
                            );
                          }
                        }}
                        className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 border border-amber-200 cursor-pointer flex items-center gap-1.5"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        Tôi Luyện +{targetTemper + 1}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : forgeTab === 'LEVEL' ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Cấp Độ Trang Bị</span>
                  <span className="font-mono-num text-sky-300 font-bold text-sm">
                    Lv.{targetLevel} <span className="text-slate-500">/ Lv.{MAX_EQUIPMENT_LEVEL}</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-900 border border-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-cyan-300 transition-all"
                    style={{ width: `${(targetLevel / MAX_EQUIPMENT_LEVEL) * 100}%` }}
                  />
                </div>

                {targetLevel >= MAX_EQUIPMENT_LEVEL ? (
                  <div className="p-3 bg-sky-950/40 border border-sky-400/50 text-xs text-sky-200 text-center font-semibold">
                    ✦ Trang bị đã đạt Cấp Độ Tối Đa (Lv.{MAX_EQUIPMENT_LEVEL})!
                  </div>
                ) : (
                  <>
                    <div className="p-2.5 bg-[#0c111d] border border-slate-700/70 text-xs">
                      <div className="text-[11px] uppercase tracking-wider text-sky-300 font-semibold mb-1">
                        Chỉ số khi Lên Cấp Lv.{targetLevel + 1}:
                      </div>
                      {isWeaponSelected ? (
                        <div className="font-mono-num text-emerald-300">
                          Mỗi 3 cấp +1 Uy Lực · Mỗi 2 cấp +1% CX · Mỗi 4 cấp +2% CM
                        </div>
                      ) : nextLevelArmorStats ? (
                        <div className="font-mono-num text-emerald-300 flex flex-wrap gap-2.5">
                          {formatStatBadges(
                            nextLevelArmorStats.stats,
                            nextLevelArmorStats.hit,
                            nextLevelArmorStats.crit,
                            nextLevelArmorStats.avoid
                          ).map((t) => (
                            <span key={t}>{t}</span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="text-xs font-mono-num flex items-center gap-3">
                        <span
                          className={
                            starIngots >= levelCost.ingots ? 'text-sky-200' : 'text-rose-400'
                          }
                        >
                          Tinh Thiết: {starIngots}/{levelCost.ingots}
                        </span>
                        <span
                          className={gold >= levelCost.gold ? 'text-amber-300' : 'text-rose-400'}
                        >
                          <Coins className="w-3.5 h-3.5 inline mr-1" />
                          {levelCost.gold} G
                        </span>
                      </div>
                      <button
                        type="button"
                        data-testid="btn-levelup-equip-action"
                        disabled={gold < levelCost.gold || starIngots < levelCost.ingots}
                        onClick={() => {
                          if (isWeaponSelected) {
                            onLevelUpWeapon(unit.weapon.id);
                            flashNotice(`Nâng cấp ${unit.weapon.name} lên Lv.${targetLevel + 1}!`);
                          } else if (activeArmor) {
                            onLevelUpArmor(activeArmor.uid);
                            flashNotice(
                              `Nâng cấp ${activeArmorTpl?.name ?? 'Giáp'} lên Lv.${targetLevel + 1}!`
                            );
                          }
                        }}
                        className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 disabled:opacity-40 text-slate-950 border border-sky-200 cursor-pointer flex items-center gap-1.5"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        Lên Cấp Lv.{targetLevel + 1}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : forgeTab === 'GEMS' ? (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">
                    Lỗ Khảm Bảo Ngọc ({targetGems.length}/{maxSockets})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Hợp Nhất phẩm chất cao hơn để mở tới 3 lỗ khảm
                  </span>
                </div>

                {/* Socket Slots Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {Array.from({ length: maxSockets }).map((_, idx) => {
                    const gid = targetGems[idx];
                    const gem = gid ? GEMS[gid] : null;
                    return (
                      <div
                        key={idx}
                        className="p-2 bg-[#0c111d] border border-slate-700/80 flex items-center justify-between gap-2"
                      >
                        {gem ? (
                          <>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-2.5 h-2.5 shrink-0 rotate-45 inline-block border border-white/60"
                                  style={{ backgroundColor: gem.color }}
                                />
                                <span className="text-[11px] font-bold text-amber-100 truncate">
                                  {gem.name}
                                </span>
                              </div>
                              <div className="text-[10px] font-mono-num text-emerald-300 mt-0.5">
                                {gem.shortBonus}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (isWeaponSelected) {
                                  onUnsocketWeaponGem(unit.weapon.id, idx);
                                } else if (activeArmor) {
                                  onUnsocketArmorGem(activeArmor.uid, idx);
                                }
                                flashNotice(`Đã gỡ ${gem.name} về kho`);
                              }}
                              className="shrink-0 px-1.5 py-0.5 text-[10px] bg-slate-800 hover:bg-rose-900/70 border border-slate-600 text-slate-200 cursor-pointer"
                            >
                              Gỡ
                            </button>
                          </>
                        ) : (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 border border-dashed border-slate-600 rotate-45 inline-block" />
                            <span>Lỗ trống #{idx + 1}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Owned Gems Picker */}
                <div className="border-t border-slate-800 pt-2">
                  <div className="text-[11px] font-semibold text-emerald-300 mb-1.5">
                    Chọn Bảo Ngọc trong kho để khảm:
                  </div>
                  {ownedGems.length === 0 ? (
                    <div className="text-xs text-slate-400">
                      Kho Bảo Ngọc trống. Hãy ghé Cửa Hàng Quân Nhu hoặc Thương Nhân Bí Mật để mua thêm!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[170px] overflow-y-auto chronicle-scroll pr-1">
                      {ownedGems.map(({ gem, count }) => {
                        const isFull = targetGems.length >= maxSockets;
                        return (
                          <div
                            key={gem.id}
                            className="p-2 bg-[#141c2e] border border-slate-700/75 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-2.5 h-2.5 shrink-0 rotate-45 inline-block border border-white/60"
                                  style={{ backgroundColor: gem.color }}
                                />
                                <span className="text-xs font-bold text-slate-100 truncate">
                                  {gem.name}
                                </span>
                                <span className="text-[10px] font-mono-num text-amber-300">
                                  ×{count}
                                </span>
                              </div>
                              <div className="text-[10px] font-mono-num text-emerald-300">
                                {gem.shortBonus}
                              </div>
                            </div>
                            <button
                              type="button"
                              data-testid={`btn-socket-${gem.id}`}
                              disabled={isFull}
                              onClick={() => {
                                if (isWeaponSelected) {
                                  onSocketWeaponGem(unit.weapon.id, gem.id);
                                } else if (activeArmor) {
                                  onSocketArmorGem(activeArmor.uid, gem.id);
                                }
                                flashNotice(`Đã khảm ${gem.name}!`);
                              }}
                              className="shrink-0 px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white border border-emerald-300/60 cursor-pointer"
                            >
                              Khảm
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* FUSE TAB: Hợp Nhất Trang Bị */
              <div className="flex flex-col gap-3">
                {!nextRarity ? (
                  <div className="p-3 bg-rose-950/40 border border-rose-400/50 text-xs text-rose-200 text-center font-semibold">
                    ✦ Trang bị đã đạt phẩm chất tối thượng: Thần Thoại (3 lỗ khảm)!
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-3 p-2.5 bg-[#0c111d] border border-purple-500/40 text-xs">
                      <span
                        className="px-2 py-0.5 font-bold border"
                        style={{
                          color: EQUIPMENT_RARITY_META[targetRarity].color,
                          borderColor: `${EQUIPMENT_RARITY_META[targetRarity].color}88`,
                        }}
                      >
                        {EQUIPMENT_RARITY_META[targetRarity].label} ({maxSockets} lỗ)
                      </span>
                      <ArrowRight className="w-4 h-4 text-purple-300" />
                      <span
                        className="px-2 py-0.5 font-bold border"
                        style={{
                          color: EQUIPMENT_RARITY_META[nextRarity].color,
                          borderColor: `${EQUIPMENT_RARITY_META[nextRarity].color}aa`,
                        }}
                      >
                        {EQUIPMENT_RARITY_META[nextRarity].label} ({getMaxSocketsForRarity(nextRarity)} lỗ)
                      </span>
                    </div>

                    {isWeaponSelected ? (
                      <div className="p-2.5 bg-[#141b2c] border border-slate-700/75 text-xs text-slate-200 flex flex-col gap-1">
                        <div>
                          Hợp nhất vũ khí tăng ngay <strong className="text-amber-300">+3 Uy Lực, +4% CX, +4% CM, +1 Cấp</strong>!
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {weaponCopyCount > 0
                            ? `Đang có ${weaponCopyCount} bản sao dự trữ trong Kho Vũ Khí (dùng 1 bản sao + ${fusionCost.crystals} Tinh Thể).`
                            : `Không có bản sao vũ khí trong kho — có thể dùng thuần ma tinh (${weaponFuseCrystalsNeeded} Tinh Thể Hợp Nhất).`}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <div className="text-[11px] font-semibold text-purple-200">
                          Chọn 1 {ARMOR_SLOT_META[selectedSlot as ArmorSlot].label} chưa trang bị cùng phẩm chất ({EQUIPMENT_RARITY_META[targetRarity].label}) làm phôi hợp nhất:
                        </div>
                        {fusionCandidates.length === 0 ? (
                          <div className="p-2.5 bg-slate-900/80 border border-slate-700 text-xs text-slate-400">
                            Chưa có phôi {ARMOR_SLOT_META[selectedSlot as ArmorSlot].shortLabel} phẩm chất{' '}
                            <strong>{EQUIPMENT_RARITY_META[targetRarity].label}</strong> dự trữ trong kho. Hãy mua thêm ở Cửa Hàng hoặc tháo bớt từ anh hùng khác!
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[115px] overflow-y-auto chronicle-scroll pr-1">
                            {fusionCandidates.map((cand) => {
                              const ctpl = ARMOR_TEMPLATES[cand.templateId];
                              const selected = resolvedMaterialUid === cand.uid;
                              return (
                                <button
                                  key={cand.uid}
                                  type="button"
                                  onClick={() => setSelectedMaterialUid(cand.uid)}
                                  className={`p-2 text-left border text-xs cursor-pointer flex items-center justify-between ${
                                    selected
                                      ? 'bg-purple-950/60 border-purple-400 text-purple-100'
                                      : 'bg-[#141b2b] border-slate-700 text-slate-300 hover:border-purple-400/50'
                                  }`}
                                >
                                  <span className="font-semibold truncate">
                                    {ctpl?.name ?? cand.templateId}
                                    {cand.temperLevel > 0 ? ` +${cand.temperLevel}` : ''}
                                  </span>
                                  <span className="text-[10px] font-mono-num text-slate-400 shrink-0 ml-2">
                                    Lv.{cand.level}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {nextFuseArmorStats && (
                          <div className="text-[11px] font-mono-num text-emerald-300">
                            Sau hợp nhất:{' '}
                            {formatStatBadges(
                              nextFuseArmorStats.stats,
                              nextFuseArmorStats.hit,
                              nextFuseArmorStats.crit,
                              nextFuseArmorStats.avoid
                            ).join(' · ')}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="text-xs font-mono-num flex items-center gap-3">
                        <span
                          className={
                            fusionCrystals >=
                            (isWeaponSelected ? weaponFuseCrystalsNeeded : fusionCost.crystals)
                              ? 'text-purple-200'
                              : 'text-rose-400'
                          }
                        >
                          Tinh Thể: {fusionCrystals}/
                          {isWeaponSelected ? weaponFuseCrystalsNeeded : fusionCost.crystals}
                        </span>
                        <span
                          className={gold >= fusionCost.gold ? 'text-amber-300' : 'text-rose-400'}
                        >
                          <Coins className="w-3.5 h-3.5 inline mr-1" />
                          {fusionCost.gold} G
                        </span>
                      </div>

                      <button
                        type="button"
                        data-testid="btn-fuse-action"
                        disabled={
                          gold < fusionCost.gold ||
                          fusionCrystals <
                            (isWeaponSelected ? weaponFuseCrystalsNeeded : fusionCost.crystals) ||
                          (!isWeaponSelected && !resolvedMaterialUid)
                        }
                        onClick={() => {
                          if (isWeaponSelected) {
                            onFuseWeapon(unit.weapon.id);
                            flashNotice(
                              `Hợp nhất ${unit.weapon.name} lên phẩm chất ${EQUIPMENT_RARITY_META[nextRarity].label}!`
                            );
                          } else if (activeArmor && resolvedMaterialUid) {
                            onFuseArmor(activeArmor.uid, resolvedMaterialUid);
                            setSelectedMaterialUid(null);
                            flashNotice(
                              `Hợp nhất ${activeArmorTpl?.name ?? 'Trang bị'} lên phẩm chất ${EQUIPMENT_RARITY_META[nextRarity].label}!`
                            );
                          }
                        }}
                        className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-400 hover:to-fuchsia-400 disabled:opacity-40 text-white border border-purple-200 cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Hợp Nhất → {EQUIPMENT_RARITY_META[nextRarity].label}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT (5 cols): Inventory Drawer for the Selected Equipment Slot */}
        <div className="lg:col-span-5 bg-[#121828] border border-slate-700/80 flex flex-col overflow-hidden">
          <div className="px-3 py-2 bg-[#0d121f] border-b border-slate-700/75 flex items-center justify-between">
            <span className="text-xs font-display font-bold text-amber-200 flex items-center gap-1.5">
              <SlotIcon slot={selectedSlot} className="w-3.5 h-3.5" />
              {isWeaponSelected
                ? 'Thông Tin Vũ Khí Đang Rèn'
                : `Kho ${ARMOR_SLOT_META[selectedSlot].label} (${slotBagItems.length})`}
            </span>
          </div>

          <div className="p-2.5 flex flex-col gap-2 max-h-[300px] overflow-y-auto chronicle-scroll">
            {!resolvedOutOfBattle && !isWeaponSelected && (
              <div className="px-2.5 py-1.5 bg-[#0e1525] border border-rose-500/40 text-[11px] text-amber-200/95">
                <strong>Kho Quân Đoàn khóa trong trận (kể cả Chủ Tướng):</strong> Chỉ mặc được giáp
                có sẵn trong túi đồ cá nhân hoặc lấy từ đồng minh{' '}
                {isFreeLogistics ? 'trong đội hình chuẩn bị' : 'đứng sát cạnh (1 ô)'}.
              </div>
            )}

            {isWeaponSelected ? (
              <div className="p-3 bg-[#151d30] border border-amber-500/35 flex flex-col gap-2 text-xs">
                <div className="font-display font-bold text-sm text-amber-100">
                  {unit.weapon.name}
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {unit.weapon.description ??
                    'Vũ khí đang trang bị có thể Tôi Luyện (+10), Lên Cấp (Lv.20), Khảm Bảo Ngọc và Hợp Nhất lên phẩm chất Thần Thoại ngay tại Lò Rèn bên trái.'}
                </p>
                <div className="text-[11px] text-amber-200/90 border-t border-slate-700/70 pt-2">
                  Mọi nâng cấp trên <strong>{unit.weapon.name}</strong> được lưu vĩnh viễn và cộng trực tiếp vào Uy Lực, Chính Xác, Chí Mạng trong mọi trận chiến!
                </div>
              </div>
            ) : slotBagItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Chưa có {ARMOR_SLOT_META[selectedSlot].label} nào trong kho. Hãy ghé Cửa Hàng để mua thêm!
              </div>
            ) : (
              slotBagItems.map((eq) => {
                const tpl = ARMOR_TEMPLATES[eq.templateId];
                if (!tpl) return null;
                const rarityMeta = EQUIPMENT_RARITY_META[eq.rarity];
                const statsRes = computeArmorInstanceBonuses(eq);
                const isEquippedByCurrent = unit.equipment?.[selectedSlot]?.uid === eq.uid;
                const isCarriedByCurrent = Boolean(unit.carriedArmorUids?.includes(eq.uid));
                const rawOwner = ownerByUid.get(eq.uid);
                const otherOwner = rawOwner && rawOwner.id !== unit.id ? rawOwner : undefined;
                const takeCheck = isCarriedByCurrent
                  ? { allowed: true }
                  : otherOwner
                  ? canUnitTakeEquippedArmorFromOwner(
                      unit,
                      otherOwner,
                      deployedUnits ?? allies,
                      isFreeLogistics,
                      eq.uid
                    )
                  : canUnitTakeEquippedArmorFromOwner(
                      unit,
                      undefined,
                      deployedUnits ?? allies,
                      resolvedOutOfBattle,
                      eq.uid
                    );

                return (
                  <div
                    key={eq.uid}
                    className={`p-2.5 border flex flex-col gap-1.5 ${
                      isEquippedByCurrent
                        ? 'bg-[#1c263d] border-amber-400/80'
                        : !takeCheck.allowed
                        ? 'bg-[#111624] border-slate-800 opacity-80'
                        : 'bg-[#151c2d] border-slate-700/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex items-center gap-1.5">
                        <span
                          className="text-xs font-bold truncate"
                          style={{ color: rarityMeta.color }}
                        >
                          {tpl.name}
                        </span>
                        {eq.temperLevel > 0 && (
                          <span className="text-[10px] font-mono-num font-bold text-amber-300">
                            +{eq.temperLevel}
                          </span>
                        )}
                        <span className="text-[10px] font-mono-num text-sky-300">
                          Lv.{eq.level}
                        </span>
                      </div>

                      {isEquippedByCurrent ? (
                        <span className="shrink-0 text-[10px] font-bold text-amber-300 flex items-center gap-0.5 whitespace-nowrap">
                          <Check className="w-3 h-3" /> Đang mặc
                        </span>
                      ) : !takeCheck.allowed ? (
                        <span
                          data-testid={`locked-armor-${eq.uid}`}
                          title={takeCheck.reason}
                          className="shrink-0 px-2 py-0.5 text-[10px] font-semibold bg-slate-900 text-rose-300 border border-rose-500/40 flex items-center gap-1 whitespace-nowrap"
                        >
                          <Lock className="w-2.5 h-2.5 shrink-0" />
                          <span>
                            {otherOwner
                              ? takeCheck.distance
                                ? `${otherOwner.name} (cách ${takeCheck.distance} ô)`
                                : `${otherOwner.name} (hậu phương)`
                              : 'Kho Quân Đoàn (Khóa)'}
                          </span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onEquipArmor(unit.id, eq.uid);
                            flashNotice(`Đã trang bị ${tpl.name} cho ${unit.name}!`);
                          }}
                          className="shrink-0 px-2 py-0.5 text-[11px] font-semibold bg-amber-600 hover:bg-amber-500 text-white border border-amber-300/60 cursor-pointer whitespace-nowrap"
                        >
                          {isCarriedByCurrent
                            ? 'Mặc từ túi'
                            : otherOwner
                            ? isFreeLogistics
                              ? `Lấy từ ${otherOwner.name}`
                              : `Lấy từ ${otherOwner.name} (1 ô)`
                            : 'Trang bị từ Kho'}
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono-num">
                      <span className="text-emerald-300">
                        {formatStatBadges(
                          statsRes.stats,
                          statsRes.hit,
                          statsRes.crit,
                          statsRes.avoid
                        ).join(' · ')}
                      </span>
                      <span className="text-slate-400">
                        {rarityMeta.label} · {eq.gems.length}/{getMaxSocketsForRarity(eq.rarity)} ngọc
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
