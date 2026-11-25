import { useEffect, useMemo, useRef } from 'react';
import { ArrowUp, Crown, Sparkles } from 'lucide-react';
import { PORTRAIT_ASSETS } from '../game/data';
import { createLevelUpBurst, stepLevelUpBurst } from '../game/levelUpParticles';
import { getUnitPortraitDataUrl, getUnitSpriteDataUrl } from '../game/pixelSprites';
import type { LevelUpGain, StatGrowths, Unit } from '../game/types';

interface LevelUpToastProps {
  levelUp: LevelUpGain;
  unit?: Unit | null;
}

const STAT_DISPLAY_ORDER: Array<keyof StatGrowths> = [
  'hp',
  'str',
  'mag',
  'skl',
  'spd',
  'lck',
  'def',
  'res',
];

const STAT_LABEL: Record<keyof StatGrowths, string> = {
  hp: 'HP',
  str: 'STR',
  mag: 'MAG',
  skl: 'SKL',
  spd: 'SPD',
  lck: 'LCK',
  def: 'DEF',
  res: 'RES',
};

const TIER_ROMAN: Record<number, string> = {
  1: 'BẬC I',
  2: 'BẬC II',
  3: 'BẬC III',
  4: 'BẬC IV',
};

const CANVAS_W = 760;
const CANVAS_H = 280;

export function LevelUpToast({ levelUp, unit }: LevelUpToastProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const orderedGains = useMemo(() => {
    const entries: Array<{ key: keyof StatGrowths; label: string; value: number }> = [];
    for (const key of STAT_DISPLAY_ORDER) {
      const value = levelUp.gains[key];
      if (value && value > 0) {
        entries.push({ key, label: STAT_LABEL[key], value });
      }
    }
    return entries;
  }, [levelUp.gains]);

  const totalStatPoints = useMemo(
    () => orderedGains.reduce((sum, item) => sum + item.value, 0),
    [orderedGains]
  );

  const spriteUrl = useMemo(() => (unit ? getUnitSpriteDataUrl(unit, 0) : ''), [unit]);
  const portraitUrl = useMemo(() => {
    if (!unit) return '';
    if (unit.portraitKey && PORTRAIT_ASSETS[unit.portraitKey]) {
      return PORTRAIT_ASSETS[unit.portraitKey];
    }
    if (unit.templateId && PORTRAIT_ASSETS[unit.templateId]) {
      return PORTRAIT_ASSETS[unit.templateId];
    }
    return getUnitPortraitDataUrl(unit);
  }, [unit]);

  // Crisp pixel-art canvas particle burst + golden shockwave ring
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let burst = createLevelUpBurst(CANVAS_W, CANVAS_H, orderedGains.length);

    const drawBurst = () => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.imageSmoothingEnabled = false;

      // Expanding crisp pixel-stepped golden shockwave ring
      if (burst.ringAlpha > 0.02) {
        ctx.save();
        ctx.globalAlpha = burst.ringAlpha;
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(
          Math.round(burst.originX),
          Math.round(burst.originY),
          Math.round(burst.ringRadius),
          Math.round(burst.ringRadius * 0.4),
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();

        ctx.globalAlpha = burst.ringAlpha * 0.5;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(
          Math.round(burst.originX),
          Math.round(burst.originY),
          Math.round(burst.ringRadius * 0.84),
          Math.round(burst.ringRadius * 0.34),
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.restore();
      }

      // Draw crisp pixel particles (stars, diamonds, sparks, rising motes)
      for (const p of burst.particles) {
        if (p.age < 0) continue;
        const lifeRatio = Math.max(0, 1 - p.age / p.lifetime);
        const twinkle = 0.65 + 0.35 * Math.sin(burst.elapsed * 14 + p.twinklePhase);
        const alpha = Math.min(1, lifeRatio * 1.35) * twinkle;
        if (alpha <= 0.02) continue;

        const px = Math.round(p.x);
        const py = Math.round(p.y);
        const s = Math.max(2, Math.round(p.size));

        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;

        if (p.kind === 'STAR') {
          // 4-point crisp pixel star cross
          ctx.fillRect(px - s, py - 1, s * 2 + 1, 2);
          ctx.fillRect(px - 1, py - s, 2, s * 2 + 1);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px - 1, py - 1, 2, 2);
        } else if (p.kind === 'DIAMOND') {
          ctx.fillRect(px - 1, py - s, 2, s * 2);
          ctx.fillRect(px - s, py - 1, s * 2, 2);
        } else {
          ctx.fillRect(px, py, s, s);
        }
      }

      ctx.globalAlpha = 1;
    };

    if (reducedMotion) {
      // Render a single calm celebratory starlight frame for reduced-motion users
      burst = stepLevelUpBurst(burst, 0.14);
      drawBurst();
      return;
    }

    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      burst = stepLevelUpBurst(burst, dt);
      drawBurst();

      if (burst.particles.length > 0 || burst.ringAlpha > 0.02) {
        rafId = requestAnimationFrame(tick);
      }
    };

    drawBurst();
    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [levelUp.unitId, levelUp.newLevel, orderedGains.length]);

  const isBigRoll = totalStatPoints >= 4;
  const tierLabel = unit?.tier ? TIER_ROMAN[unit.tier] ?? `BẬC ${unit.tier}` : 'ANH HÙNG';

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="level-up-toast"
      className="fixed top-14 left-1/2 -translate-x-1/2 z-[70] pointer-events-none flex items-center justify-center"
    >
      {/* Overlaid pixel-art particle celebration canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none pixel-art"
        style={{ width: CANVAS_W, height: CANVAS_H }}
      />

      {/* Unified RPG Celebration Layout: Gilded Portrait Frame + Level-Up Banner */}
      <div className="relative flex items-center gap-3">
        {/* Ornate Gilded RPG Character Portrait Frame */}
        <div
          data-testid="level-up-portrait"
          className="lvlup-portrait-enter relative shrink-0 p-[3px] bg-gradient-to-br from-[#fef9c3] via-[#eab308] via-45% to-[#78350f] shadow-[0_0_26px_rgba(251,191,36,0.55),0_14px_30px_rgba(0,0,0,0.82)]"
        >
          {/* Top-center royal crest gem */}
          <span
            aria-hidden="true"
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 w-3 h-3 rotate-45 bg-gradient-to-br from-[#fef9c3] via-[#f59e0b] to-[#92400e] border border-[#fffbeb] shadow-[0_0_10px_rgba(254,240,138,0.9)]"
          />

          {/* Outer gilded L-corner filigree brackets */}
          <span
            aria-hidden="true"
            className="absolute -top-[2px] -left-[2px] z-20 w-3.5 h-3.5 border-t-2 border-l-2 border-[#fffbeb]"
          />
          <span
            aria-hidden="true"
            className="absolute -top-[2px] -right-[2px] z-20 w-3.5 h-3.5 border-t-2 border-r-2 border-[#fffbeb]"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-[2px] -left-[2px] z-20 w-3.5 h-3.5 border-b-2 border-l-2 border-[#fde68a]"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-[2px] -right-[2px] z-20 w-3.5 h-3.5 border-b-2 border-r-2 border-[#fde68a]"
          />

          {/* Dark antique-bronze inner bevel */}
          <div className="p-[2px] bg-gradient-to-b from-[#451a03] via-[#1c1008] to-[#78350f]">
            {/* Fine interior gold trim + portrait recess */}
            <div className="relative w-[104px] h-[120px] overflow-hidden border border-[#fde68a]/85 bg-[radial-gradient(circle_at_50%_28%,#273554_0%,#111829_62%,#080c16_100%)] flex items-center justify-center">
              {/* Synchronized diagonal gold sheen across portrait */}
              <div aria-hidden="true" className="lvlup-sheen-sweep z-10" />

              {portraitUrl ? (
                <img
                  src={portraitUrl}
                  alt={`Chân dung ${levelUp.unitName}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top pixel-art"
                />
              ) : spriteUrl ? (
                <img
                  src={spriteUrl}
                  alt={`Chân dung ${levelUp.unitName}`}
                  className="w-20 h-24 object-contain pixel-art drop-shadow-[0_6px_12px_rgba(0,0,0,0.9)] -mt-2"
                />
              ) : (
                <Crown className="w-10 h-10 text-amber-300" />
              )}

              {/* Subtle bottom velvet vignette for nameplate legibility */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#090d17] via-[#090d17]/75 to-transparent"
              />

              {/* Gilded bottom tier plaque */}
              <div className="absolute inset-x-0 bottom-0 z-10 px-1.5 py-0.5 border-t border-amber-400/65 bg-gradient-to-r from-[#2e1a05]/95 via-[#452406]/95 to-[#2e1a05]/95 text-center">
                <span className="font-mono-num text-[9px] font-bold tracking-[0.18em] text-amber-200 uppercase">
                  {tierLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Heraldic Level-Up Card */}
        <div className="relative lvlup-border-glow min-w-[380px] max-w-[490px] overflow-hidden border-2 border-amber-300 bg-gradient-to-b from-[#1c253b]/98 via-[#121829]/98 to-[#0a0f1c]/98">
          {/* Diagonal golden metallic sheen sweep */}
          <div aria-hidden="true" className="lvlup-sheen-sweep" />

          {/* Crisp Pixel Corner Rivets */}
          <span aria-hidden="true" className="absolute top-1 left-1 w-1.5 h-1.5 bg-amber-200/90" />
          <span aria-hidden="true" className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-200/90" />
          <span aria-hidden="true" className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-amber-200/90" />
          <span aria-hidden="true" className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-amber-200/90" />

          {/* Decorative Top Gold Trim */}
          <div
            aria-hidden="true"
            className="h-1 w-full bg-gradient-to-r from-amber-500/30 via-amber-200 to-amber-500/30"
          />

          <div className="relative px-4 py-3 flex flex-col gap-2.5">
            {/* Header Row: Mini Sprite/Crest + Name + Animated Level Badge */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {portraitUrl && spriteUrl ? (
                  <div className="w-11 h-12 shrink-0 bg-[#090d17] border border-amber-400/70 flex items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                    <img
                      src={spriteUrl}
                      alt={levelUp.unitName}
                      className="w-10 h-11 object-contain pixel-art"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 shrink-0 bg-gradient-to-b from-amber-900/70 to-amber-950/90 border border-amber-400/75 flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.28)]">
                    <Crown className="w-5 h-5 text-amber-300" />
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono-num uppercase tracking-[0.22em] text-amber-300">
                    <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                    <span>{isBigRoll ? 'THĂNG CẤP ĐẠI CÁT!' : 'THĂNG CẤP!'}</span>
                  </div>
                  <div className="font-display text-base font-bold text-amber-50 truncate text-stroke-dark">
                    {levelUp.unitName}
                    {unit?.className && (
                      <span className="ml-2 font-sans text-xs font-medium text-slate-300">
                        · {unit.className}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pop-in Level Badge */}
              <div className="lvlup-level-pop shrink-0 px-3 py-1.5 bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 border border-amber-100 shadow-[0_0_14px_rgba(251,191,36,0.55)] text-center">
                <div className="text-[9px] font-mono-num font-bold uppercase tracking-wider leading-none opacity-85">
                  CẤP ĐỘ
                </div>
                <div className="font-mono-num text-lg font-extrabold leading-tight">
                  Lv.{levelUp.newLevel}
                </div>
              </div>
            </div>

            {/* Staggered Fire Emblem Stat-Gain Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 border-t border-amber-500/25">
              {orderedGains.map((stat, idx) => (
                <div
                  key={stat.key}
                  style={{ animationDelay: `${110 + idx * 75}ms` }}
                  className="lvlup-stat-pop px-2.5 py-1 bg-emerald-950/80 border border-emerald-400/65 flex items-center gap-1 font-mono-num shadow-[0_0_10px_rgba(52,211,153,0.22)]"
                >
                  <ArrowUp className="w-3 h-3 text-emerald-300 lvlup-arrow-bounce shrink-0" />
                  <span className="text-[11px] text-slate-200 font-semibold">{stat.label}</span>
                  <span className="text-xs font-extrabold text-emerald-300">+{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Promotion Ready Milestone Banner */}
            {levelUp.readyToPromote && (
              <div className="lvlup-promo-pulse px-3 py-1.5 bg-amber-950/85 border border-amber-400/75 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-amber-200">
                <Crown className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Đủ cấp Tiến Hóa Chuyển Chức! Mở Đội Hình [C] để thăng bậc.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
