import { useRef, useState } from 'react';
import { CAMPAIGN_ACTS, CAMPAIGN_MAPS, getMapScaleLabel, getObjectiveLabel } from '../game/campaignData';
import { exportSaveToJson, parseImportedSave } from '../game/storage';
import type { CampaignSaveData } from '../game/types';

interface CampaignAtlasModalProps {
  saveData: CampaignSaveData;
  currentMapId: number;
  onSelectMap: (mapId: number) => void;
  onImportSave: (imported: CampaignSaveData) => void;
  onClose: () => void;
}

export function CampaignAtlasModal({
  saveData,
  currentMapId,
  onSelectMap,
  onImportSave,
  onClose,
}: CampaignAtlasModalProps) {
  const initialAct = Math.ceil(currentMapId / 12);
  const [selectedAct, setSelectedAct] = useState(initialAct);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const act = CAMPAIGN_ACTS[selectedAct - 1];
  const actMaps = CAMPAIGN_MAPS.filter((m) => m.actNumber === selectedAct);

  const handleExport = () => {
    const json = exportSaveToJson(saveData);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `huyet-an-save-map-${saveData.highestReachedMap}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setImportFeedback('Đã xuất tệp lưu tiến độ (.json) cho PC.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseImportedSave(String(reader.result ?? ''));
      if (parsed) {
        onImportSave(parsed);
        setImportFeedback(`Đã nhập tệp lưu thành công (Mở khóa tới Bản đồ ${parsed.highestReachedMap}/120).`);
      } else {
        setImportFeedback('Tệp lưu không hợp lệ. Vui lòng chọn tệp JSON do trò chơi xuất ra.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Biên Niên Sử 120 Bản Đồ"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 md:p-6"
    >
      <div className="w-full max-w-5xl max-h-[88vh] tactical-panel flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-amber-500/30 bg-[#0d111b]">
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-amber-100">
              Biên Niên Sử 120 Bản Đồ
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono-num">
              Tiến độ chiến dịch: Đã mở khóa {saveData.highestReachedMap}/120 · Đã chinh phục {saveData.clearedMaps.length}/120 bản đồ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="px-3 py-1.5 text-xs font-medium text-amber-100 bg-[#182032] hover:bg-[#232f48] border border-amber-500/35 cursor-pointer whitespace-nowrap"
            >
              Xuất Save PC (.json)
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#182032] hover:bg-[#232f48] border border-slate-600/60 cursor-pointer whitespace-nowrap"
            >
              Nhập Save
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Chọn tệp lưu JSON"
            />
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 cursor-pointer whitespace-nowrap"
            >
              Đóng [Esc]
            </button>
          </div>
        </div>

        {importFeedback && (
          <div className="px-6 py-2 text-xs text-amber-200 bg-amber-950/50 border-b border-amber-500/25">
            {importFeedback}
          </div>
        )}

        {/* 10 Act Tabs */}
        <div className="flex items-center gap-1 px-4 py-2.5 overflow-x-auto border-b border-slate-800 bg-[#111624] chronicle-scroll">
          {CAMPAIGN_ACTS.map((item) => {
            const firstMapId = (item.actNumber - 1) * 12 + 1;
            const isUnlocked = saveData.highestReachedMap >= firstMapId;
            const isActive = selectedAct === item.actNumber;
            return (
              <button
                key={item.actNumber}
                type="button"
                onClick={() => setSelectedAct(item.actNumber)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
                  isActive
                    ? 'bg-amber-600 text-slate-950 border-amber-300'
                    : isUnlocked
                    ? 'bg-[#181f30] text-amber-100 border-amber-500/30 hover:bg-[#222c44]'
                    : 'bg-[#111520] text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
              >
                Hồi {item.roman}
              </button>
            );
          })}
        </div>

        {/* Act Story Summary */}
        <div className="px-6 py-3.5 border-b border-slate-800/80 bg-[#121827]">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-bold text-amber-200">
              Hồi {act.roman}: {act.title}
            </h3>
            <span className="text-xs text-slate-400">
              Vùng đất: {act.regionName} · Trùm chính: {act.antagonist}
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-300 mt-1 leading-relaxed">{act.synopsis}</p>
        </div>

        {/* 12 Maps Grid for Active Act */}
        <div className="flex-1 overflow-y-auto p-5 chronicle-scroll">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {actMaps.map((m) => {
              const isLocked = m.id > saveData.highestReachedMap;
              const isCleared = saveData.clearedMaps.includes(m.id);
              const isCurrent = m.id === currentMapId;

              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={isLocked}
                  onClick={() => onSelectMap(m.id)}
                  className={`text-left p-3.5 border transition-colors ${
                    isLocked
                      ? 'bg-[#0d111a] border-slate-800/80 text-slate-500 cursor-not-allowed opacity-70'
                      : isCurrent
                      ? 'bg-amber-950/35 border-amber-400 text-amber-50 cursor-pointer'
                      : 'bg-[#141a29] border-slate-700/70 hover:border-amber-400/65 hover:bg-[#1a2236] text-slate-100 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs font-mono-num">
                    <span className={isLocked ? 'text-slate-500' : 'text-amber-400 font-semibold'}>
                      {m.chapterCode} · Bản đồ {m.id}/120
                    </span>
                    <span
                      className={
                        isCleared
                          ? 'text-emerald-400'
                          : isLocked
                          ? 'text-slate-600'
                          : 'text-sky-300'
                      }
                    >
                      {isCleared ? 'Đã hoàn thành' : isLocked ? 'Chưa mở khóa' : 'Sẵn sàng'}
                    </span>
                  </div>

                  <div className="font-semibold text-sm mt-1 truncate">{m.title}</div>
                  <div className="text-[11px] text-amber-200/85 mt-0.5 truncate">
                    {m.storyArcBeat} · {getObjectiveLabel(m)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-snug">
                    <span className="text-sky-300/90">Liên kết:</span> {m.previousMapLink}
                  </div>
                  <div className="text-[11px] font-mono-num text-slate-400 mt-1.5">
                    {getMapScaleLabel(m.mapWidth, m.mapHeight)} ({m.mapWidth}×{m.mapHeight}) · Tối đa {m.maxDeploySlots} tướng · Cấp {m.recommendedLevel} · {m.bossName}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
