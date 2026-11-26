import { BookOpen } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getObjectiveLabel } from '../game/campaignData';
import { CLASS_META, HERO_TEMPLATES, PORTRAIT_ASSETS, WEAPONS } from '../game/data';
import { getUnitPortraitDataUrl } from '../game/pixelSprites';
import type { CampaignMapMeta, DialogueLine, Unit } from '../game/types';

interface StoryDialogueProps {
  meta: CampaignMapMeta;
  mode: 'INTRO' | 'OUTRO';
  lines: DialogueLine[];
  onComplete: () => void;
}

function resolveSpeakerPortraitUrl(line: DialogueLine, meta: CampaignMapMeta): string {
  const staticAsset = PORTRAIT_ASSETS[line.portraitKey];
  if (staticAsset) return staticAsset;

  const heroTpl = HERO_TEMPLATES.find(
    (h) => h.templateId === line.portraitKey || h.name === line.speaker
  );
  const classId =
    line.speakerClassId ??
    heroTpl?.classId ??
    (line.side === 'right' ? meta.bossClass : 'LORD');
  const classInfo = CLASS_META[classId] ?? CLASS_META.LORD;
  const faction = line.speakerFaction ?? (line.side === 'right' ? 'ENEMY' : 'PLAYER');
  const accentColor =
    line.speakerAccent ?? heroTpl?.accentColor ?? (faction === 'ENEMY' ? '#ef4444' : classInfo.accent);
  const defaultWeapon =
    (heroTpl?.weaponId && WEAPONS[heroTpl.weaponId]) ||
    WEAPONS[meta.bossWeaponId] ||
    WEAPONS.iron_sword;

  const portraitUnit: Unit = {
    id: `dlg_${line.portraitKey}_${classId}`,
    templateId: heroTpl?.templateId ?? line.portraitKey,
    name: line.speaker,
    classId,
    className: classInfo.name,
    faction,
    moveType: classInfo.moveType,
    tier: classInfo.tier,
    level: meta.recommendedLevel,
    exp: 0,
    x: 0,
    y: 0,
    hp: 30,
    sp: 100,
    maxSp: 100,
    stats: { maxHp: 30, str: 10, mag: 10, skl: 10, spd: 10, lck: 8, def: 8, res: 8, mov: 5 },
    growths: { hp: 50, str: 40, mag: 30, skl: 40, spd: 40, lck: 35, def: 30, res: 30 },
    weapon: defaultWeapon,
    inventory: [defaultWeapon],
    skills: [],
    potions: 0,
    acted: false,
    aiPolicy: 'CHASER',
    isLord: heroTpl?.isLord,
    isBoss: faction === 'ENEMY',
    promoted: classInfo.tier >= 2,
    accentColor,
  };

  return getUnitPortraitDataUrl(portraitUnit);
}

export function StoryDialogue({ meta, mode, lines, onComplete }: StoryDialogueProps) {
  const [lineIdx, setLineIdx] = useState(0);
  const [visibleChars, setVisibleChars] = useState(0);
  const [logOpen, setLogOpen] = useState(false);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  const currentLine = lines[lineIdx] ?? lines[0];
  const isTyping = currentLine ? visibleChars < currentLine.text.length : false;

  useEffect(() => {
    setLineIdx(0);
    setVisibleChars(0);
    setLogOpen(false);
  }, [lines]);

  useEffect(() => {
    if (!currentLine) return;
    if (visibleChars >= currentLine.text.length) return;
    const timer = window.setTimeout(() => {
      setVisibleChars((c) => Math.min(currentLine.text.length, c + 3));
    }, 16);
    return () => window.clearTimeout(timer);
  }, [visibleChars, currentLine]);

  const handleAdvance = () => {
    if (logOpen) {
      setLogOpen(false);
      return;
    }
    if (!currentLine) {
      onComplete();
      return;
    }
    if (isTyping) {
      setVisibleChars(currentLine.text.length);
      return;
    }
    if (lineIdx + 1 < lines.length) {
      setLineIdx((i) => i + 1);
      setVisibleChars(0);
    } else {
      onComplete();
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setLogOpen((v) => !v);
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAdvance();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (logOpen) setLogOpen(false);
        else onComplete();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const portraitUrl = useMemo(
    () => (currentLine ? resolveSpeakerPortraitUrl(currentLine, meta) : ''),
    [currentLine, meta]
  );

  const recruitedNames = useMemo(() => {
    if (!meta.recruitedHeroIds || meta.recruitedHeroIds.length === 0) return null;
    return meta.recruitedHeroIds
      .map((id) => HERO_TEMPLATES.find((h) => h.templateId === id)?.name)
      .filter(Boolean)
      .join(', ');
  }, [meta.recruitedHeroIds]);

  if (!currentLine) return null;

  const isEnemySpeaker =
    currentLine.speakerFaction === 'ENEMY' || currentLine.side === 'right';
  const showFallback = !portraitUrl || imgError[currentLine.portraitKey];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Hội thoại ${meta.title}`}
      className="fixed inset-0 z-30 flex flex-col justify-between p-5 md:p-8 bg-[#060911]/85"
    >
      {/* Top Chapter Header + Battle Scale Briefing + Story Continuity */}
      <div className="max-w-5xl w-full mx-auto flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono-num text-amber-400 tracking-wide">
              {meta.chapterCode} · {meta.historicalDate} · Trận {meta.id}/200 ·{' '}
              {mode === 'INTRO' ? 'Mệnh Lệnh Tác Chiến' : 'Báo Cáo Chiến Thắng'}
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-amber-50 mt-0.5">
              {meta.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setLogOpen((v) => !v)}
              className="px-3.5 py-2 text-xs font-semibold text-amber-200 bg-[#141b2c] hover:bg-[#1e2942] border border-amber-500/35 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Nhật ký [{lines.length}]</span>
            </button>

            <button
              type="button"
              onClick={onComplete}
              className="px-4 py-2 text-xs font-semibold text-slate-200 bg-[#1a2030] hover:bg-[#252e45] border border-amber-500/40 cursor-pointer whitespace-nowrap shrink-0"
            >
              {mode === 'INTRO' ? 'Vào Bố Trí Quân [Esc]' : 'Bỏ qua hội thoại [Esc]'}
            </button>
          </div>
        </div>

        {/* Tactical Battle Scale & Historical Briefing Strip */}
        <div className="px-4 py-2.5 bg-[#0c1220]/95 border border-amber-500/30 flex flex-col gap-1.5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 text-slate-300 font-mono-num">
            <div>
              <span className="text-amber-300 font-semibold">Chiến trường:</span>{' '}
              <span>{meta.mapWidth}×{meta.mapHeight} ô</span>
              <span className="mx-2 text-slate-600">·</span>
              <span>Tối đa {meta.maxDeploySlots} đơn vị</span>
              <span className="mx-2 text-slate-600">·</span>
              <span>Lv.{meta.recommendedLevel}</span>
              <span className="mx-2 text-slate-600">·</span>
              <span className="text-sky-300">{getObjectiveLabel(meta)}</span>
              {meta.forceSummary && (
                <>
                  <span className="mx-2 text-slate-600">·</span>
                  <span className="text-amber-200/90 font-sans">{meta.forceSummary}</span>
                </>
              )}
            </div>
            {recruitedNames && mode === 'INTRO' && (
              <div className="text-emerald-300 font-sans">
                Tăng viện mới: <span className="font-semibold">{recruitedNames}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1.5 border-t border-slate-800/90 text-[11px]">
            <div className="text-slate-300">
              <span className="text-amber-300 font-semibold">Tiền đề chiến cuộc: </span>
              <span>{meta.previousMapLink}</span>
            </div>
            <div className="text-slate-300">
              <span className="text-sky-300 font-semibold">Hướng tiến quân: </span>
              <span>{meta.nextMapHook}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Optional Full Scene Transcript Drawer */}
      {logOpen && (
        <div className="max-w-5xl w-full mx-auto my-3 flex-1 overflow-y-auto tactical-panel p-5 chronicle-scroll">
          <div className="flex items-center justify-between border-b border-amber-500/25 pb-2 mb-3">
            <h3 className="font-display text-base font-bold text-amber-200">
              Nhật Ký Hội Thoại · {meta.chapterCode} {meta.title}
            </h3>
            <span className="text-xs text-slate-400">Nhấn [L] hoặc [Esc] để đóng</span>
          </div>
          <div className="flex flex-col gap-3">
            {lines.map((ln, idx) => (
              <div
                key={`${ln.speaker}-${idx}`}
                className={`p-3 border ${
                  idx === lineIdx
                    ? 'bg-amber-950/30 border-amber-400/50'
                    : 'bg-[#0e1424] border-slate-800'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2 text-xs mb-1">
                  <div>
                    <span
                      className={`font-display font-bold ${
                        ln.side === 'right' ? 'text-red-300' : 'text-amber-200'
                      }`}
                    >
                      {ln.speaker}
                    </span>
                    <span className="text-slate-400 ml-2">{ln.role}</span>
                  </div>
                  <span className="font-mono-num text-slate-500">
                    {idx + 1}/{lines.length}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">{ln.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Visual-Novel Portrait & Dialogue Box */}
      <div className="max-w-5xl w-full mx-auto mt-auto">
        <div
          className={`flex items-end gap-5 ${
            currentLine.side === 'right' ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          {/* Character HD-2D Portrait Frame */}
          <div
            className={`w-28 h-28 md:w-36 md:h-36 shrink-0 border-2 bg-[#101624] overflow-hidden shadow-2xl ${
              isEnemySpeaker ? 'border-red-500/75' : 'border-amber-400/75'
            }`}
          >
            {showFallback ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#111827] p-2 text-center">
                <span className="font-display text-2xl font-bold text-amber-300">
                  {currentLine.speaker.slice(0, 1)}
                </span>
                <span className="text-[11px] text-slate-300 mt-1">{currentLine.speaker}</span>
              </div>
            ) : (
              <img
                src={portraitUrl}
                alt={`Chân dung ${currentLine.speaker}`}
                referrerPolicy="no-referrer"
                onError={() =>
                  setImgError((prev) => ({ ...prev, [currentLine.portraitKey]: true }))
                }
                className="w-full h-full object-cover pixel-art"
              />
            )}
          </div>

          {/* Dialogue Box */}
          <div className="flex-1 tactical-panel p-5 md:p-6">
            <div className="flex items-baseline justify-between gap-4 border-b border-amber-500/25 pb-2 mb-3">
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span
                  className={`font-display text-lg md:text-xl font-bold ${
                    isEnemySpeaker ? 'text-red-300' : 'text-amber-200'
                  }`}
                >
                  {currentLine.speaker}
                </span>
                <span className="text-xs text-slate-400">{currentLine.role}</span>
              </div>
              <span className="text-xs font-mono-num text-slate-400 shrink-0">
                Thoại {lineIdx + 1} / {lines.length}
              </span>
            </div>

            <p className="text-sm md:text-base text-slate-100 leading-relaxed min-h-[3.75rem]">
              {currentLine.text.slice(0, visibleChars)}
            </p>

            <div className="flex items-center justify-between gap-3 mt-4">
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Phím tắt: [Space/Enter] Tiếp tục · [L] Nhật ký · [Esc] Bỏ qua
              </span>
              <button
                type="button"
                onClick={handleAdvance}
                className="px-5 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-300/80 cursor-pointer whitespace-nowrap shrink-0 ml-auto"
              >
                {lineIdx + 1 < lines.length
                  ? isTyping
                    ? 'Hiện đầy đủ [Space]'
                    : 'Tiếp theo [Enter]'
                  : mode === 'INTRO'
                  ? 'Bố Trí Quân Đội [Enter]'
                  : 'Hoàn Tất Chương [Enter]'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
