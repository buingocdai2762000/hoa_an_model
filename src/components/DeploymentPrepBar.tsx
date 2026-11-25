import { Package, Play, Shield, Swords, Users } from 'lucide-react';
import { getMapScaleLabel } from '../game/campaignData';
import { PORTRAIT_ASSETS } from '../game/data';
import { computeUnitCombatPower, getUnitCarryCount, MAX_UNIT_CARRY_SLOTS } from '../game/engine';
import { getUnitPortraitDataUrl } from '../game/pixelSprites';
import type { CampaignMapMeta, FormationPresetId, Unit } from '../game/types';

interface DeploymentPrepBarProps {
  meta: CampaignMapMeta;
  unlockedAllies: Unit[];
  deployedAllies: Unit[];
  enemies: Unit[];
  commanderTitleId: string;
  activeFormation: FormationPresetId;
  swapSourceUnit: Unit | null;
  onToggleHeroDeploy: (templateId: string) => void;
  onSelectFormation: (preset: FormationPresetId) => void;
  onOpenRoster: () => void;
  onReturnToCamp: () => void;
  onConfirmDeployment: () => void;
}

const FORMATION_PRESETS: Array<{
  id: FormationPresetId;
  label: string;
  shortcut: string;
  hint: string;
}> = [
  {
    id: 'BALANCED',
    label: 'Cân Bằng',
    shortcut: '1',
    hint: 'Trục trung tâm vững chắc, Pháp sư & Tu sĩ đứng sau',
  },
  {
    id: 'PHALANX',
    label: 'Lá Chắn',
    shortcut: '2',
    hint: 'Thiết giáp & cận chiến dàn hàng ngang che chắn tiền tuyến',
  },
  {
    id: 'SPEARHEAD',
    label: 'Mũi Nhọn',
    shortcut: '3',
    hint: 'Kỵ binh & chủ tướng dồn mũi xung kích thẳng hướng Vương Ấn',
  },
  {
    id: 'PINCER',
    label: 'Hai Cánh',
    shortcut: '4',
    hint: 'Chia quân cơ động bọc sườn Bắc – Nam giành Pháo Đài',
  },
];

export function DeploymentPrepBar({
  meta,
  unlockedAllies,
  deployedAllies,
  enemies,
  commanderTitleId,
  activeFormation,
  swapSourceUnit,
  onToggleHeroDeploy,
  onSelectFormation,
  onOpenRoster,
  onReturnToCamp,
  onConfirmDeployment,
}: DeploymentPrepBarProps) {
  const deployedTemplateSet = new Set(deployedAllies.map((u) => u.templateId));

  const allyPower = deployedAllies.reduce(
    (sum, u) => sum + computeUnitCombatPower(u, commanderTitleId),
    0
  );
  const enemyPower = enemies.reduce((sum, e) => sum + computeUnitCombatPower(e, null), 0);
  const totalPower = Math.max(1, allyPower + enemyPower);
  const allySharePct = Math.max(15, Math.min(85, Math.round((allyPower / totalPower) * 100)));

  const powerStatus =
    allyPower >= enemyPower * 1.05
      ? { label: 'Ưu Thế', tone: 'text-emerald-300' }
      : allyPower >= enemyPower * 0.82
      ? { label: 'Cân Sức', tone: 'text-amber-300' }
      : { label: 'Áp Đảo Địch', tone: 'text-rose-300' };

  return (
    <section
      aria-label="Bảng bố trí quân đoàn trước trận"
      data-testid="deployment-prep-bar"
      className="fixed bottom-0 inset-x-0 z-30 pointer-events-auto bg-[#0b101b]/96 border-t-2 border-amber-500/55 shadow-2xl px-4 py-2.5"
    >
      <div className="max-w-[1440px] mx-auto flex flex-col gap-2">
        {/* Row 1: Deployment Header, Swap Hint & Force Balance Meter */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-display font-bold text-sm text-amber-200 tracking-wide whitespace-nowrap">
              Bố Trí Xuất Trận
            </span>
            <span className="text-xs text-slate-400 font-mono-num whitespace-nowrap">
              {getMapScaleLabel(meta.mapWidth, meta.mapHeight)} ({meta.mapWidth}×{meta.mapHeight}) · Quân số{' '}
              <strong className="text-sky-300">
                {deployedAllies.length}/{meta.maxDeploySlots}
              </strong>{' '}
              (Mở khóa {unlockedAllies.length}/30 anh hùng)
            </span>
            <span className="hidden xl:inline text-xs text-amber-300/90 truncate">
              ·{' '}
              {swapSourceUnit
                ? `Đang chọn ${swapSourceUnit.name} (${swapSourceUnit.x + 1},${swapSourceUnit.y + 1}) — nhấp ô xanh khác để đổi chỗ`
                : 'Nhấp 2 ô xanh trên bản đồ để đổi vị trí đứng'}
            </span>
          </div>

          {/* Force Balance Meter (Tương Quan Chiến Lực) */}
          <div className="flex items-center gap-2.5 shrink-0 font-mono-num text-xs">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-sky-200 font-semibold">Ta {allyPower.toLocaleString('vi-VN')}</span>
            </div>
            <div
              title="Tương quan chiến lực tổng hợp giữa đội hình xuất trận và quân đoàn địch"
              className="w-28 h-2 bg-red-950 border border-slate-700 overflow-hidden flex"
            >
              <div className="h-full bg-sky-400" style={{ width: `${allySharePct}%` }} />
              <div className="h-full bg-red-500 flex-1" />
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Swords className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-300 font-semibold">Địch {enemyPower.toLocaleString('vi-VN')}</span>
            </div>
            <span className={`font-sans font-semibold whitespace-nowrap ${powerStatus.tone}`}>
              · {powerStatus.label}
            </span>
          </div>
        </div>

        {/* Row 2: Formation Presets + Scrollable Hero Squad Selector + Launch Turn 1 CTA */}
        <div className="flex items-center justify-between gap-3">
          {/* 4 One-Click Formation Presets */}
          <div className="flex items-center gap-1 bg-[#111827] p-1 border border-slate-700/80 shrink-0">
            {FORMATION_PRESETS.map((preset) => {
              const active = activeFormation === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.hint}
                  onClick={() => onSelectFormation(preset.id)}
                  className={`px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-amber-200 hover:bg-[#1c263b]'
                  }`}
                >
                  {preset.label} [{preset.shortcut}]
                </button>
              );
            })}
          </div>

          {/* Unlocked Hero Squad Selector Strip */}
          <div
            aria-label="Danh sách anh hùng xuất trận"
            className="flex-1 flex items-center gap-1 overflow-x-auto py-0.5 min-w-0"
          >
            {unlockedAllies.map((hero) => {
              const isDeployed = deployedTemplateSet.has(hero.templateId);
              const isLockedLord = Boolean(hero.isLord);
              const atCap = !isDeployed && deployedAllies.length >= meta.maxDeploySlots;
              const portraitUrl =
                (hero.portraitKey && PORTRAIT_ASSETS[hero.portraitKey]) ||
                PORTRAIT_ASSETS[hero.templateId] ||
                getUnitPortraitDataUrl(hero);

              return (
                <button
                  key={hero.templateId}
                  type="button"
                  disabled={isLockedLord || atCap}
                  onClick={() => onToggleHeroDeploy(hero.templateId)}
                  title={
                    isLockedLord
                      ? `${hero.name} (${hero.className} Lv.${hero.level}) — Chủ Tướng bắt buộc xuất trận`
                      : isDeployed
                      ? `Nhấp để rút ${hero.name} (${hero.className} Lv.${hero.level}) về dự bị`
                      : atCap
                      ? `Đã đủ tối đa ${meta.maxDeploySlots} tướng — hãy rút 1 tướng trước`
                      : `Nhấp để đưa ${hero.name} (${hero.className} Lv.${hero.level}) vào đội hình xuất trận`
                  }
                  className={`flex items-center gap-1 px-1.5 py-1 border text-left transition-colors shrink-0 whitespace-nowrap ${
                    isDeployed
                      ? 'bg-sky-950/90 border-sky-400 text-sky-100 cursor-pointer'
                      : atCap
                      ? 'bg-[#101522] border-slate-800 text-slate-500 opacity-55 cursor-not-allowed'
                      : 'bg-[#131b2c] hover:bg-[#1c2840] border-slate-700 text-slate-300 cursor-pointer'
                  }`}
                >
                  <img
                    src={portraitUrl}
                    alt={hero.name}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 object-cover object-top border border-slate-700 pixel-art shrink-0"
                  />
                  <span className="text-[11px] font-semibold">{hero.name}</span>
                  <span className="text-[10px] font-mono-num text-amber-300/90">
                    Lv.{hero.level} · {getUnitCarryCount(hero)}/{MAX_UNIT_CARRY_SLOTS}
                  </span>
                  {isLockedLord && <span className="text-[10px] text-amber-300">★</span>}
                </button>
              );
            })}
          </div>

          {/* Right: Prep Modals & Primary Launch Battle CTA */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onOpenRoster}
              title="Quân Đoàn & Hành Trang Cá Nhân [C] (Kho Quân Đoàn khóa trong trận)"
              aria-label="Mở Đội Hình và Hành Trang [C]"
              className="h-9 px-2.5 flex items-center gap-1.5 text-xs font-semibold bg-[#182236] hover:bg-[#22304d] text-amber-200 border border-amber-400/50 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Users className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden lg:inline">Đội Hình [C]</span>
            </button>
            <button
              type="button"
              data-testid="deployment-btn-return-camp"
              onClick={onReturnToCamp}
              title="Rút về Doanh Trại Liên Quân để mở Kho Quân Đoàn & Chợ Quân Nhu"
              aria-label="Rút về Doanh Trại và Kho Quân Đoàn"
              className="h-9 px-2.5 flex items-center gap-1.5 text-xs font-semibold bg-[#152438] hover:bg-[#1e3350] text-sky-200 border border-sky-400/50 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Package className="w-3.5 h-3.5 text-sky-300" />
              <span className="hidden xl:inline">Về Doanh Trại / Kho</span>
            </button>
            <button
              type="button"
              data-testid="confirm-deployment-btn"
              onClick={onConfirmDeployment}
              className="h-9 px-4 flex items-center gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-200 shadow-md cursor-pointer whitespace-nowrap shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Xuất Trận [Space]</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
