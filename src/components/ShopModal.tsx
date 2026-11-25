import React, { useMemo, useState } from 'react';
import { Coins, Gem, Package, Shield, ShoppingBag, Sparkles, Swords, X } from 'lucide-react';
import {
  ARMOR_SLOT_META,
  ARMOR_TEMPLATES,
  GEMS,
  getItemSellPrice,
  getShopStock,
  getWeaponSellPrice,
  ITEMS,
  MAGIC_ELEMENT_LABEL,
  WEAPONS,
} from '../game/data';
import type {
  ArmorSlot,
  ArmorTemplate,
  BiomeId,
  EquipmentInstance,
  GameItem,
  ShopKind,
  Weapon,
  WeaponType,
} from '../game/types';

interface ShopModalProps {
  kind: ShopKind;
  mapId: number;
  biome: BiomeId;
  gold: number;
  convoyWeaponIds: string[];
  equipmentBag?: EquipmentInstance[];
  itemBag: Record<string, number>;
  onBuyWeapon: (weapon: Weapon) => void;
  onBuyArmor?: (armor: ArmorTemplate) => void;
  onBuyItem: (item: GameItem) => void;
  onSellWeapon: (weaponId: string) => void;
  onSellItem: (itemId: string) => void;
  onClose: () => void;
}

const WEAPON_TYPE_LABEL: Record<WeaponType, string> = {
  SWORD: 'Kiếm',
  LANCE: 'Thương',
  AXE: 'Rìu',
  BOW: 'Cung',
  TOME: 'Pháp',
  STAFF: 'Trượng',
};

const TIER_ROMAN = ['', 'I', 'II', 'III', 'IV'] as const;

export const ShopModal: React.FC<ShopModalProps> = ({
  kind,
  mapId,
  biome,
  gold,
  convoyWeaponIds,
  equipmentBag = [],
  itemBag,
  onBuyWeapon,
  onBuyArmor,
  onBuyItem,
  onSellWeapon,
  onSellItem,
  onClose,
}) => {
  const [tab, setTab] = useState<'WEAPONS' | 'ARMOR' | 'ITEMS' | 'SELL'>(
    kind === 'IN_MAP_VENDOR' ? 'ITEMS' : 'WEAPONS'
  );
  const [typeFilter, setTypeFilter] = useState<'ALL' | WeaponType>('ALL');
  const [armorFilter, setArmorFilter] = useState<'ALL' | ArmorSlot>('ALL');
  const [feedback, setFeedback] = useState<string | null>(null);

  const stock = useMemo(() => getShopStock(kind, mapId, biome), [kind, mapId, biome]);

  const weaponsForSale = useMemo(() => {
    const list = stock.weaponIds.map((id) => WEAPONS[id]).filter((w): w is Weapon => Boolean(w));
    if (typeFilter === 'ALL') return list;
    return list.filter((w) => w.type === typeFilter);
  }, [stock.weaponIds, typeFilter]);

  const armorsForSale = useMemo(() => {
    const list = (stock.armorIds ?? [])
      .map((id) => ARMOR_TEMPLATES[id])
      .filter((a): a is ArmorTemplate => Boolean(a));
    if (armorFilter === 'ALL') return list;
    return list.filter((a) => a.slot === armorFilter);
  }, [stock.armorIds, armorFilter]);

  const itemsForSale = useMemo(
    () => stock.itemIds.map((id) => ITEMS[id]).filter((it): it is GameItem => Boolean(it)),
    [stock.itemIds]
  );

  const ownedWeaponsGrouped = useMemo(() => {
    const counts = new Map<string, number>();
    for (const id of convoyWeaponIds) {
      if (WEAPONS[id]) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([id, count]) => ({
      weapon: WEAPONS[id],
      count,
    }));
  }, [convoyWeaponIds]);

  const ownedItemsList = useMemo(() => {
    return Object.entries(itemBag)
      .filter(([id, qty]) => qty > 0 && Boolean(ITEMS[id]))
      .map(([id, qty]) => ({ item: ITEMS[id], qty }))
      .sort((a, b) => (b.item.category === 'TREASURE' ? 1 : 0) - (a.item.category === 'TREASURE' ? 1 : 0));
  }, [itemBag]);

  const notify = (msg: string) => {
    setFeedback(msg);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl h-[86vh] max-h-[760px] bg-[#0d111a] border-2 border-[#d4a345] shadow-[0_24px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#121826] border-b border-[#d4a345]/45 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] font-bold border"
                style={{
                  color: stock.accentColor,
                  borderColor: `${stock.accentColor}88`,
                  backgroundColor: `${stock.accentColor}1c`,
                }}
              >
                {stock.badgeText}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#fef3c7] tracking-wide flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" style={{ color: stock.accentColor }} />
                {stock.title}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{stock.subtitle}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-1.5 bg-[#1b1508] border border-amber-400/60 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-mono font-bold text-amber-200">
                {gold.toLocaleString('vi-VN')} G
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-[#1a2234] hover:bg-slate-700 border border-slate-600 text-slate-200 transition-colors"
              title="Đóng cửa hàng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Exclusivity Banner */}
        <div
          className="px-5 py-2 border-b border-slate-800 text-xs flex items-center justify-between gap-4"
          style={{ backgroundColor: `${stock.accentColor}12`, color: '#e2e8f0' }}
        >
          <span className="leading-snug">{stock.exclusivityNote}</span>
          {feedback && (
            <span className="shrink-0 px-2.5 py-0.5 bg-emerald-950/90 border border-emerald-400/60 text-emerald-200 font-semibold">
              {feedback}
            </span>
          )}
        </div>

        {/* Tab Bar */}
        <div className="px-5 pt-3 pb-2 bg-[#0f1420] border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setTab('WEAPONS')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-colors cursor-pointer ${
                tab === 'WEAPONS'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                  : 'bg-[#151c2c] border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              Vũ Khí ({stock.weaponIds.length})
            </button>
            <button
              data-testid="shop-tab-armor"
              onClick={() => setTab('ARMOR')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-colors cursor-pointer ${
                tab === 'ARMOR'
                  ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                  : 'bg-[#151c2c] border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Giáp 5 Ô ({stock.armorIds?.length ?? 0})
            </button>
            <button
              onClick={() => setTab('ITEMS')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-colors cursor-pointer ${
                tab === 'ITEMS'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                  : 'bg-[#151c2c] border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              <Gem className="w-3.5 h-3.5" />
              Ngọc, Lò Rèn & Vật Phẩm ({stock.itemIds.length})
            </button>
            <button
              onClick={() => setTab('SELL')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-colors cursor-pointer ${
                tab === 'SELL'
                  ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                  : 'bg-[#151c2c] border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Bán Đồ
            </button>
          </div>

          {tab === 'WEAPONS' && (
            <div className="flex items-center gap-1 flex-wrap">
              {(['ALL', 'SWORD', 'LANCE', 'AXE', 'BOW', 'TOME', 'STAFF'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2 py-1 text-[11px] font-semibold border transition-colors cursor-pointer ${
                    typeFilter === t
                      ? 'bg-sky-500/25 border-sky-400 text-sky-200'
                      : 'bg-[#141a28] border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t === 'ALL' ? 'Tất cả' : WEAPON_TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          )}

          {tab === 'ARMOR' && (
            <div className="flex items-center gap-1 flex-wrap">
              {(['ALL', 'HELMET', 'ARMOR', 'GAUNTLETS', 'GREAVES', 'BOOTS'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setArmorFilter(s)}
                  className={`px-2 py-1 text-[11px] font-semibold border transition-colors cursor-pointer ${
                    armorFilter === s
                      ? 'bg-sky-500/25 border-sky-400 text-sky-200'
                      : 'bg-[#141a28] border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s === 'ALL' ? 'Tất cả 5 ô' : ARMOR_SLOT_META[s].shortLabel}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#0a0e16]">
          {tab === 'WEAPONS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {weaponsForSale.map((weapon) => {
                const canAfford = gold >= weapon.price;
                const ownedQty = convoyWeaponIds.filter((id) => id === weapon.id).length;
                return (
                  <div
                    key={weapon.id}
                    className="p-3 bg-[#121826] border border-slate-700/90 hover:border-amber-400/60 transition-colors flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-[#fef3c7]">{weapon.name}</span>
                            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 border border-slate-600 text-amber-300">
                              Bậc {TIER_ROMAN[weapon.tier]}
                            </span>
                            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-sky-300">
                              {WEAPON_TYPE_LABEL[weapon.type]}
                              {weapon.element && weapon.element !== 'NONE'
                                ? ` · ${MAGIC_ELEMENT_LABEL[weapon.element]}`
                                : ''}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                            {weapon.description}
                          </p>
                        </div>
                        {ownedQty > 0 && (
                          <span className="text-[10px] font-mono text-emerald-300 shrink-0">
                            Kho: ×{ownedQty}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-mono text-slate-300">
                        {weapon.type === 'STAFF' ? (
                          <span className="text-emerald-300">Hồi +{weapon.healPower ?? 12} HP</span>
                        ) : (
                          <>
                            <span>UY: <strong className="text-amber-300">{weapon.might}</strong></span>
                            <span>CX: <strong className="text-sky-300">{weapon.hit}%</strong></span>
                            <span>CM: <strong className="text-rose-300">{weapon.crit}%</strong></span>
                          </>
                        )}
                        <span>
                          Tầm: <strong className="text-slate-100">{weapon.minRange}-{weapon.maxRange}</strong>
                        </span>
                        {weapon.brave && <span className="text-amber-300 font-bold">★ Song Kích</span>}
                        {weapon.drainRatio && (
                          <span className="text-purple-300">Hút {Math.round(weapon.drainRatio * 100)}% HP</span>
                        )}
                        {weapon.ignoreDefenseRatio && (
                          <span className="text-cyan-300">
                            Xuyên {Math.round(weapon.ignoreDefenseRatio * 100)}% Giáp
                          </span>
                        )}
                        {weapon.effectiveVsArmor && <span className="text-orange-300">×2 Giáp</span>}
                        {weapon.effectiveVsCavalry && <span className="text-orange-300">×2 Kỵ</span>}
                        {weapon.effectiveVsFlying && <span className="text-lime-300">×2 Bay</span>}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {weapon.price.toLocaleString('vi-VN')} G
                      </span>
                      <button
                        disabled={!canAfford}
                        onClick={() => {
                          onBuyWeapon(weapon);
                          notify(`Đã mua ${weapon.name} vào Kho Quân Nhu!`);
                        }}
                        className={`px-3 py-1 text-xs font-bold border transition-colors ${
                          canAfford
                            ? 'bg-amber-600/90 hover:bg-amber-500 border-amber-300 text-slate-950'
                            : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Mua Vào Kho' : 'Thiếu Vàng'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'ARMOR' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {armorsForSale.map((armor) => {
                const canAfford = gold >= armor.price;
                const ownedCount = equipmentBag.filter((e) => e.templateId === armor.id).length;
                const slotMeta = ARMOR_SLOT_META[armor.slot];
                const statSummary = Object.entries(armor.baseStats)
                  .filter(([, v]) => Boolean(v))
                  .map(([k, v]) => `${k === 'maxHp' ? 'HP' : k.toUpperCase()} +${v}`);
                if (armor.baseHit) statSummary.push(`CX +${armor.baseHit}%`);
                if (armor.baseCrit) statSummary.push(`CM +${armor.baseCrit}%`);
                if (armor.baseAvoid) statSummary.push(`NÉ +${armor.baseAvoid}%`);

                return (
                  <div
                    key={armor.id}
                    className="p-3 bg-[#121826] border border-slate-700/90 hover:border-sky-400/60 transition-colors flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="w-2.5 h-2.5 inline-block shrink-0"
                            style={{ backgroundColor: slotMeta.accent }}
                          />
                          <span className="text-sm font-bold text-[#fef3c7]">{armor.name}</span>
                          <span className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 border border-slate-600 text-slate-200">
                            {slotMeta.shortLabel} · Bậc {TIER_ROMAN[armor.tier]}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-sky-300 shrink-0">
                          Đang có: ×{ownedCount}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-snug">{armor.description}</p>
                      <div className="mt-1.5 text-[11px] font-mono text-emerald-300 flex flex-wrap gap-x-2.5 gap-y-0.5">
                        {statSummary.map((s) => (
                          <span key={s}>{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {armor.price.toLocaleString('vi-VN')} G
                      </span>
                      <button
                        disabled={!canAfford || !onBuyArmor}
                        onClick={() => {
                          if (!onBuyArmor) return;
                          onBuyArmor(armor);
                          notify(`Đã mua ${armor.name} vào Kho Trang Bị!`);
                        }}
                        className={`px-3 py-1 text-xs font-bold border transition-colors cursor-pointer ${
                          canAfford
                            ? 'bg-sky-500/90 hover:bg-sky-400 border-sky-200 text-slate-950'
                            : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Mua Trang Bị' : 'Thiếu Vàng'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'ITEMS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {itemsForSale.map((item) => {
                const canAfford = gold >= item.price;
                const ownedQty = itemBag[item.id] ?? 0;
                const gemDef = GEMS[item.id];
                const catLabel =
                  item.category === 'FORGE_MAT'
                    ? 'Nguyên Liệu Lò Rèn'
                    : item.category === 'GEM'
                    ? `Bảo Ngọc · ${gemDef?.shortBonus ?? ''}`
                    : item.category === 'STAT_BOOST'
                    ? 'Tăng Chỉ Số Vĩnh Viễn'
                    : item.category === 'SEAL'
                    ? 'Ấn Tiến Hóa'
                    : item.category === 'EXP_MANUAL'
                    ? 'Binh Thư EXP'
                    : 'Dược Phẩm';
                return (
                  <div
                    key={item.id}
                    className="p-3 bg-[#121826] border border-slate-700/90 hover:border-emerald-400/60 transition-colors flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="w-2.5 h-2.5 inline-block shrink-0"
                            style={{ backgroundColor: item.accentColor }}
                          />
                          <span className="text-sm font-bold text-[#fef3c7]">{item.name}</span>
                          <span className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 border border-slate-600 text-slate-200">
                            {catLabel}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-300 shrink-0">
                          Đang có: ×{ownedQty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1.5 leading-snug">{item.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {item.price.toLocaleString('vi-VN')} G
                      </span>
                      <button
                        disabled={!canAfford}
                        onClick={() => {
                          onBuyItem(item);
                          notify(`Đã mua ${item.name} vào Túi Quân Nhu!`);
                        }}
                        className={`px-3 py-1 text-xs font-bold border transition-colors ${
                          canAfford
                            ? 'bg-emerald-600/90 hover:bg-emerald-500 border-emerald-300 text-slate-950'
                            : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Mua Vật Phẩm' : 'Thiếu Vàng'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'SELL' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2.5 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Kho Báu & Vật Phẩm Trong Túi ({ownedItemsList.length})
                </h3>
                {ownedItemsList.length === 0 ? (
                  <p className="text-xs text-slate-500">Không có vật phẩm nào trong túi.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {ownedItemsList.map(({ item, qty }) => {
                      const sellPrice = getItemSellPrice(item);
                      return (
                        <div
                          key={item.id}
                          className="p-2.5 bg-[#121826] border border-slate-700 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-100 truncate">
                              {item.name} <span className="text-emerald-300 font-mono">×{qty}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">{item.description}</div>
                          </div>
                          <button
                            onClick={() => {
                              onSellItem(item.id);
                              notify(`Đã bán ${item.name} thu +${sellPrice.toLocaleString('vi-VN')} G!`);
                            }}
                            className="shrink-0 px-2.5 py-1 text-xs font-mono font-bold bg-amber-900/60 hover:bg-amber-700 border border-amber-500/60 text-amber-200"
                          >
                            Bán +{sellPrice.toLocaleString('vi-VN')} G
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300 mb-2.5 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  Vũ Khí & Pháp Điển Trong Kho ({ownedWeaponsGrouped.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {ownedWeaponsGrouped.map(({ weapon, count }) => {
                    const sellPrice = getWeaponSellPrice(weapon);
                    return (
                      <div
                        key={weapon.id}
                        className="p-2.5 bg-[#121826] border border-slate-700 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-100 truncate">
                            {weapon.name} <span className="text-sky-300 font-mono">×{count}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {WEAPON_TYPE_LABEL[weapon.type]} · Bậc {TIER_ROMAN[weapon.tier]} · UY {weapon.might}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            onSellWeapon(weapon.id);
                            notify(`Đã bán ${weapon.name} thu +${sellPrice.toLocaleString('vi-VN')} G!`);
                          }}
                          className="shrink-0 px-2.5 py-1 text-xs font-mono font-bold bg-rose-950/70 hover:bg-rose-800 border border-rose-500/60 text-rose-200"
                        >
                          Bán +{sellPrice.toLocaleString('vi-VN')} G
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
