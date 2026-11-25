import type { CampaignMapMeta, GameSettings } from '../game/types';

interface PauseModalProps {
  meta: CampaignMapMeta;
  settings: GameSettings;
  onResume: () => void;
  onRestartMap: () => void;
  onUpdateSettings: (patch: Partial<GameSettings>) => void;
  onReturnTitle: () => void;
}

export function PauseModal({
  meta,
  settings,
  onResume,
  onRestartMap,
  onUpdateSettings,
  onReturnTitle,
}: PauseModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tạm dừng trò chơi"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
    >
      <div className="w-full max-w-md tactical-panel p-6">
        <div className="text-xs font-mono-num text-amber-400">
          {meta.subtitle} · Bản đồ {meta.id}/120
        </div>
        <h2 className="font-display text-2xl font-bold text-amber-100 mt-0.5">Tạm Dừng</h2>
        <p className="text-xs text-slate-400 mt-1">{meta.title}</p>

        {/* PC Tactical Settings */}
        <div className="mt-5 space-y-2.5 border-y border-amber-500/25 py-4 text-sm">
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="text-slate-200">Hoạt ảnh giao tranh pixel</span>
            <input
              type="checkbox"
              checked={settings.combatAnimations}
              onChange={(e) => onUpdateSettings({ combatAnimations: e.target.checked })}
              className="w-4 h-4 accent-amber-500"
            />
          </label>
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="text-slate-200">Tốc độ chiến đấu nhanh (×1.8)</span>
            <input
              type="checkbox"
              checked={settings.fastMode}
              onChange={(e) => onUpdateSettings({ fastMode: e.target.checked })}
              className="w-4 h-4 accent-amber-500"
            />
          </label>
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="text-slate-200">Tắt âm thanh</span>
            <input
              type="checkbox"
              checked={settings.muted}
              onChange={(e) => onUpdateSettings({ muted: e.target.checked })}
              className="w-4 h-4 accent-amber-500"
            />
          </label>
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="text-slate-200">Chế độ Thường (Hồi sinh đồng minh sau trận)</span>
            <input
              type="checkbox"
              checked={settings.casualMode}
              onChange={(e) => onUpdateSettings({ casualMode: e.target.checked })}
              className="w-4 h-4 accent-amber-500"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-2.5 text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-slate-950 border border-amber-300/75 cursor-pointer"
          >
            Tiếp Tục Trận Đánh [Esc]
          </button>
          <button
            type="button"
            onClick={onRestartMap}
            className="w-full py-2.5 text-sm font-medium bg-[#182032] hover:bg-[#222d47] text-amber-100 border border-amber-500/35 cursor-pointer"
          >
            Chơi Lại Bản Đồ Này
          </button>
          <button
            type="button"
            onClick={onReturnTitle}
            className="w-full py-2.5 text-sm font-medium bg-[#121622] hover:bg-[#1a2033] text-slate-300 border border-slate-700 cursor-pointer"
          >
            Về Màn Hình Chính
          </button>
        </div>
      </div>
    </div>
  );
}

interface OutcomeModalProps {
  outcome: 'VICTORY' | 'DEFEAT';
  reason: string;
  meta: CampaignMapMeta;
  turnsTaken: number;
  enemiesDefeated: number;
  alliesRemaining: number;
  totalAllies: number;
  clearedMapsCount: number;
  goldEarned?: number;
  rewardNotes?: string[];
  onNextMap: () => void;
  onRetryMap: () => void;
  onOpenCampConvoy?: () => void;
  onOpenCampShop?: () => void;
  onOpenAtlas: () => void;
  onReturnTitle: () => void;
}

export function OutcomeModal({
  outcome,
  reason,
  meta,
  turnsTaken,
  enemiesDefeated,
  alliesRemaining,
  totalAllies,
  clearedMapsCount,
  goldEarned = 0,
  rewardNotes = [],
  onNextMap,
  onRetryMap,
  onOpenCampConvoy,
  onOpenCampShop,
  onOpenAtlas,
  onReturnTitle,
}: OutcomeModalProps) {
  const isVictory = outcome === 'VICTORY';
  const isFinalMap = meta.id >= 120;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isVictory ? 'Chiến thắng bản đồ' : 'Thất bại'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <div className="w-full max-w-xl tactical-panel p-6 md:p-7">
        <div
          className={`text-xs font-mono-num tracking-wider ${
            isVictory ? 'text-amber-400' : 'text-red-400'
          }`}
        >
          {meta.chapterCode} · {meta.subtitle} · Bản đồ {meta.id}/120
        </div>
        <h2
          className={`font-display text-3xl font-bold mt-1 ${
            isVictory ? 'text-amber-100' : 'text-red-200'
          }`}
        >
          {isVictory
            ? isFinalMap
              ? 'Đại Khải Hoàn Aethelis'
              : 'Chiến Thắng'
            : 'Chiến Trận Thất Bại'}
        </h2>
        <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">{reason}</p>

        {isVictory && (
          <div className="mt-3 px-3.5 py-2 bg-[#0d1424] border border-amber-500/30 text-xs text-slate-300">
            <span className="text-sky-300 font-semibold">Mạch truyện kế tiếp: </span>
            {meta.nextMapHook}
          </div>
        )}

        {/* Mastery / Progress Metrics */}
        <div className="grid grid-cols-3 gap-3 mt-4 font-mono-num">
          <div className="bg-[#0e1320] border border-slate-700/70 p-3 text-center">
            <div className="text-[11px] text-slate-400">Số Lượt</div>
            <div className="text-xl font-bold text-amber-200 mt-0.5">{turnsTaken}</div>
          </div>
          <div className="bg-[#0e1320] border border-slate-700/70 p-3 text-center">
            <div className="text-[11px] text-slate-400">Quân Địch Hạ</div>
            <div className="text-xl font-bold text-sky-200 mt-0.5">{enemiesDefeated}</div>
          </div>
          <div className="bg-[#0e1320] border border-slate-700/70 p-3 text-center">
            <div className="text-[11px] text-slate-400">
              {isVictory ? 'Tiến Độ' : 'Đồng Minh'}
            </div>
            <div className="text-xl font-bold text-emerald-300 mt-0.5">
              {isVictory ? `${clearedMapsCount}/120` : `${alliesRemaining}/${totalAllies}`}
            </div>
          </div>
        </div>

        {/* Victory Loot & Gold */}
        {isVictory && (goldEarned > 0 || rewardNotes.length > 0) && (
          <div className="mt-3 p-3 bg-amber-950/35 border border-amber-400/40 text-xs flex flex-wrap items-center gap-x-4 gap-y-1 font-mono-num">
            {goldEarned > 0 && (
              <span className="text-amber-300 font-bold">
                + {goldEarned.toLocaleString('vi-VN')} Vàng chiến lợi phẩm
              </span>
            )}
            {rewardNotes.map((note, idx) => (
              <span key={idx} className="text-emerald-300 font-semibold">
                ✦ {note}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-2.5">
          {isVictory && !isFinalMap ? (
            <button
              type="button"
              data-start="true"
              onClick={onNextMap}
              className="flex-1 py-3 px-4 text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-slate-950 border border-amber-300/80 cursor-pointer whitespace-nowrap"
            >
              Bản Đồ Tiếp Theo ({meta.id + 1}/120)
            </button>
          ) : (
            <button
              type="button"
              data-start="true"
              onClick={onRetryMap}
              className="flex-1 py-3 px-4 text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-slate-950 border border-amber-300/80 cursor-pointer whitespace-nowrap"
            >
              {isVictory ? 'Chơi Lại Bản Đồ Cuối' : 'Thử Lại Bản Đồ'}
            </button>
          )}

          {onOpenCampConvoy && (
            <button
              type="button"
              data-testid="btn-postbattle-convoy"
              onClick={onOpenCampConvoy}
              className="py-3 px-4 text-sm font-semibold bg-sky-800/90 hover:bg-sky-700 text-sky-100 border border-sky-400/65 cursor-pointer whitespace-nowrap"
            >
              Kho Quân Đoàn &amp; Doanh Trại
            </button>
          )}

          {isVictory && onOpenCampShop && (
            <button
              type="button"
              onClick={onOpenCampShop}
              className="py-3 px-4 text-sm font-semibold bg-emerald-800/85 hover:bg-emerald-700 text-emerald-100 border border-emerald-400/60 cursor-pointer whitespace-nowrap"
            >
              Ghé Quân Nhu Doanh Trại
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAtlas}
            className="py-3 px-4 text-sm font-medium bg-[#182032] hover:bg-[#232f48] text-amber-100 border border-amber-500/40 cursor-pointer whitespace-nowrap"
          >
            120 Bản Đồ
          </button>

          <button
            type="button"
            onClick={onReturnTitle}
            className="py-3 px-4 text-sm font-medium bg-[#121622] hover:bg-[#1a2033] text-slate-300 border border-slate-700 cursor-pointer whitespace-nowrap"
          >
            Màn Chính
          </button>
        </div>
      </div>
    </div>
  );
}
