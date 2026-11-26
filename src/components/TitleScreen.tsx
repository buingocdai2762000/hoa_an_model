import { useEffect, useRef } from 'react';
import { TITLE_BG_ASSET } from '../game/data';
import type { CampaignSaveData } from '../game/types';

interface TitleScreenProps {
  saveData: CampaignSaveData | null;
  onStartNew: () => void;
  onContinue: () => void;
  onOpenCamp: () => void;
  onOpenAtlas: () => void;
}

export function TitleScreen({
  saveData,
  onStartNew,
  onContinue,
  onOpenCamp,
  onOpenAtlas,
}: TitleScreenProps) {
  const emberCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hasProgress = Boolean(saveData && (saveData.highestReachedMap > 1 || saveData.clearedMaps.length > 0));

  useEffect(() => {
    const canvas = emberCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    const embers = Array.from({ length: 34 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vy: 0.02 + Math.random() * 0.04,
      vx: (Math.random() - 0.5) * 0.015,
      size: 2 + Math.floor(Math.random() * 2),
      alpha: 0.25 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const e of embers) {
        e.y -= e.vy * dt;
        e.x += (e.vx + Math.sin(t + e.phase) * 0.008) * dt;
        if (e.y < -0.02) {
          e.y = 1.02;
          e.x = Math.random();
        }
        if (e.x < 0) e.x += 1;
        if (e.x > 1) e.x -= 1;

        ctx.fillStyle = e.phase > Math.PI ? '#fbbf24' : '#f97316';
        ctx.globalAlpha = e.alpha * (0.65 + 0.35 * Math.sin(t * 3 + e.phase));
        ctx.fillRect(Math.round(e.x * canvas.width), Math.round(e.y * canvas.height), e.size, e.size);
      }
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <main className="relative w-full h-full overflow-hidden bg-[#0a0d16]">
      {/* Illustrated Key-Art Backdrop */}
      <img
        src={TITLE_BG_ASSET}
        alt="Pháo đài Valoria lúc hoàng hôn"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-right pixel-art"
      />

      {/* Measured contrast scrim over left negative space so typography is razor sharp */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(8, 11, 19, 0.94) 0%, rgba(10, 14, 24, 0.78) 38%, rgba(10, 14, 24, 0.22) 68%, rgba(8, 11, 19, 0.45) 100%)',
        }}
      />

      {/* Subtle floating pixel embers */}
      <canvas
        ref={emberCanvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Left-third Title Lockup & Menu Actions */}
      <div className="relative z-10 h-full flex flex-col justify-between px-10 py-10 md:px-16 md:py-12">
        <div className="text-xs tracking-[0.22em] text-amber-300/85 font-mono-num">
          2 ĐẠI CHIẾN LIỀN MẠCH · 200 TRẬN LỊCH SỬ (100 WWI + 100 WWII) · 5 QUÂN CHỦNG HIỆN ĐẠI
        </div>

        <div className="flex flex-col gap-7 my-auto max-w-[640px]">
          {/* Bespoke inline SVG Military Command Emblem */}
          <div className="flex flex-col gap-3">
            <svg
              viewBox="0 0 460 72"
              className="w-[340px] md:w-[460px] h-auto"
              role="img"
              aria-label="Huy hiệu Hỏa Ấn Đại Chiến: Thế Chiến I và II"
            >
              <defs>
                <linearGradient id="sealGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fde68a" />
                  <stop offset="55%" stopColor="#d4a345" />
                  <stop offset="100%" stopColor="#926625" />
                </linearGradient>
              </defs>
              {/* Octagonal Command Shield */}
              <polygon
                points="32,6 56,16 56,48 32,64 8,48 8,16"
                fill="#141a24"
                stroke="url(#sealGold)"
                strokeWidth="2.5"
              />
              <polygon
                points="32,12 49,20 49,44 32,57 15,44 15,20"
                fill="#7f1d1d"
              />
              {/* Five-Point Marshal Star */}
              <polygon
                points="32,17 36,28 48,28 38,35 42,46 32,39 22,46 26,35 16,28 28,28"
                fill="url(#sealGold)"
              />
              {/* Horizontal Tactical Divider */}
              <line x1="72" y1="36" x2="448" y2="36" stroke="url(#sealGold)" strokeWidth="1.5" opacity="0.65" />
              <polygon points="72,36 78,31 84,36 78,41" fill="url(#sealGold)" />
              <text
                x="94"
                y="26"
                fill="#e2c485"
                fontFamily="Playfair Display, Georgia, serif"
                fontSize="13"
                fontWeight="700"
                letterSpacing="3.2"
              >
                WORLD WAR I &amp; II · 1914 — 1945
              </text>
              <text
                x="94"
                y="54"
                fill="#cbd5e1"
                fontFamily="Be Vietnam Pro, sans-serif"
                fontSize="11.5"
                letterSpacing="1.2"
              >
                CHIẾN THUẬT HỎA ẤN HIỆN ĐẠI · PIXEL HD-2D
              </text>
            </svg>

            <h1 className="font-display text-4xl md:text-5xl font-bold leading-[1.15] tracking-normal text-[#f7f0df] text-stroke-dark text-balance">
              Hỏa Ấn Đại Chiến: Thế Chiến I &amp; II
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-[54ch]">
              Chỉ huy hợp đồng binh chủng từ chiến hào 1914 đến đại chiến 1945 qua 200 trận đánh lịch sử: bộ binh súng ống, xe tăng &amp; thiết giáp, pháo binh &amp; tên lửa, không quân máy bay &amp; trực thăng cùng hạm đội tàu chiến, tàu ngầm và tàu sân bay.
            </p>
          </div>

          {/* Primary Menu Actions */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-1">
            {hasProgress ? (
              <>
                <button
                  type="button"
                  data-start="true"
                  onClick={onContinue}
                  className="px-6 py-3.5 text-sm font-semibold tracking-wide bg-amber-600 hover:bg-amber-500 text-slate-950 border border-amber-300/70 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
                >
                  Tiếp Tục · Trận {saveData?.currentMapId ?? 1}/200
                </button>
                <button
                  type="button"
                  onClick={onStartNew}
                  className="px-5 py-3.5 text-sm font-semibold tracking-wide bg-[#161c2a] hover:bg-[#1f283b] text-amber-100 border border-amber-500/45 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
                >
                  Chiến Dịch Mới
                </button>
              </>
            ) : (
              <button
                type="button"
                data-start="true"
                onClick={onStartNew}
                className="px-7 py-3.5 text-sm font-semibold tracking-wide bg-amber-600 hover:bg-amber-500 text-slate-950 border border-amber-300/80 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
              >
                Bắt Đầu Chiến Dịch (1914)
              </button>
            )}

            <button
              type="button"
              data-testid="btn-open-camp"
              onClick={onOpenCamp}
              className="px-5 py-3.5 text-sm font-semibold tracking-wide bg-[#152422] hover:bg-[#1d3430] text-emerald-200 border border-emerald-500/60 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
            >
              Căn Cứ Chỉ Huy ({(saveData?.gold ?? 3000).toLocaleString('vi-VN')}G)
            </button>

            <button
              type="button"
              onClick={onOpenAtlas}
              className="px-5 py-3.5 text-sm font-medium tracking-wide bg-[#121722] hover:bg-[#1b2233] text-slate-200 border border-slate-600/70 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
            >
              Bản Đồ 200 Trận Lịch Sử
            </button>
          </div>
        </div>

        {/* Flat borderless PC x86 control hint line in bottom safe margin */}
        <p className="text-xs text-slate-300/85 tracking-wide whitespace-nowrap">
          Chuột / WASD Di chuyển · Enter Chọn · D Căn cứ &amp; Kho · T Trao đổi kề cận · C Binh chủng · B Quân nhu · E Kết lượt · P Tạm dừng
        </p>
      </div>
    </main>
  );
}
