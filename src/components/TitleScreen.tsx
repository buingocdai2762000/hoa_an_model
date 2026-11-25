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
          10 HỒI LIỀN MẠCH · 120 BẢN ĐỒ · 30 HỆ PHÁI TIẾN HÓA 3 BẬC · THỜI TIẾT &amp; 26 DANH HIỆU
        </div>

        <div className="flex flex-col gap-7 my-auto max-w-[600px]">
          {/* Bespoke inline SVG Crimson Seal Title Emblem */}
          <div className="flex flex-col gap-3">
            <svg
              viewBox="0 0 440 72"
              className="w-[340px] md:w-[440px] h-auto"
              role="img"
              aria-label="Huy hiệu Huyết Ấn Biên Niên Sử"
            >
              <defs>
                <linearGradient id="sealGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fde68a" />
                  <stop offset="55%" stopColor="#d4a345" />
                  <stop offset="100%" stopColor="#926625" />
                </linearGradient>
              </defs>
              {/* Shield Crest */}
              <path
                d="M32 6 L56 15 L52 46 L32 64 L12 46 L8 15 Z"
                fill="#1b1218"
                stroke="url(#sealGold)"
                strokeWidth="2.5"
              />
              <path
                d="M32 13 L48 20 L45 43 L32 56 L19 43 L16 20 Z"
                fill="#7f1d1d"
              />
              {/* Crossed Sword Silhouette */}
              <rect x="30" y="18" width="4" height="29" fill="#f8fafc" />
              <rect x="23" y="38" width="18" height="3.5" fill="url(#sealGold)" />
              <circle cx="32" cy="50" r="2.8" fill="url(#sealGold)" />
              {/* Ornamental Horizontal Rule */}
              <line x1="72" y1="36" x2="425" y2="36" stroke="url(#sealGold)" strokeWidth="1.5" opacity="0.65" />
              <polygon points="72,36 78,31 84,36 78,41" fill="url(#sealGold)" />
              <text
                x="94"
                y="26"
                fill="#e2c485"
                fontFamily="Playfair Display, Georgia, serif"
                fontSize="13"
                fontWeight="700"
                letterSpacing="3.5"
              >
                CHRONICLE OF AETHELIS
              </text>
              <text
                x="94"
                y="54"
                fill="#cbd5e1"
                fontFamily="Be Vietnam Pro, sans-serif"
                fontSize="11.5"
                letterSpacing="1.2"
              >
                CHIẾN THUẬT THEO LƯỢT · PIXEL HD-2D
              </text>
            </svg>

            <h1 className="font-display text-4xl md:text-5xl font-bold leading-[1.15] tracking-normal text-[#f7f0df] text-stroke-dark text-balance">
              Huyết Ấn Biên Niên Sử
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-[48ch]">
              Chỉ huy liên quân Valoria qua 120 bản đồ liên kết cốt truyện, 30 hệ phái tiến hóa 3 bậc uy nghiêm (Lv.5 / 15 / 30), hiệu ứng thời tiết biến đổi, hệ thống 26 danh hiệu và hơn 160 vũ khí &amp; bảo vật.
            </p>
          </div>

          {/* Primary Menu Actions (<= 3 actions) */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-1">
            {hasProgress ? (
              <>
                <button
                  type="button"
                  data-start="true"
                  onClick={onContinue}
                  className="px-6 py-3.5 text-sm font-semibold tracking-wide bg-amber-600 hover:bg-amber-500 text-slate-950 border border-amber-300/70 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
                >
                  Tiếp Tục · Bản Đồ {saveData?.currentMapId ?? 1}/120
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
                Bắt Đầu Chiến Dịch
              </button>
            )}

            <button
              type="button"
              data-testid="btn-open-camp"
              onClick={onOpenCamp}
              className="px-5 py-3.5 text-sm font-semibold tracking-wide bg-[#152422] hover:bg-[#1d3430] text-emerald-200 border border-emerald-500/60 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
            >
              Doanh Trại Liên Quân ({(saveData?.gold ?? 3000).toLocaleString('vi-VN')}G)
            </button>

            <button
              type="button"
              onClick={onOpenAtlas}
              className="px-5 py-3.5 text-sm font-medium tracking-wide bg-[#121722] hover:bg-[#1b2233] text-slate-200 border border-slate-600/70 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
            >
              Biên Niên Sử 120 Bản Đồ
            </button>
          </div>
        </div>

        {/* Flat borderless PC x86 control hint line in bottom safe margin */}
        <p className="text-xs text-slate-300/85 tracking-wide whitespace-nowrap">
          Chuột / WASD Di chuyển · Enter Chọn · D Doanh trại · T Trao đổi cạnh nhau · C Đội hình · B Quân nhu · E Kết lượt · P Tạm dừng
        </p>
      </div>
    </main>
  );
}
