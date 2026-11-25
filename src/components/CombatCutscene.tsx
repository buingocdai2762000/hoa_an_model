import { useEffect, useRef, useState } from 'react';
import {
  pickBattleQuote,
  type BattleQuoteResult,
  type HpBand,
} from '../game/battleQuotes';
import { BattleSceneRenderer, type BattleAnimationSnapshot } from '../game/battleSceneRenderer';
import { PORTRAIT_ASSETS, SKILLS, WEAPON_TYPE_LABEL } from '../game/data';
import { getEffectiveUnitStats } from '../game/engine';
import { getUnitPortraitDataUrl } from '../game/pixelSprites';
import { soundEngine } from '../game/sound';
import type { BiomeId, CombatResolution, Unit } from '../game/types';

interface ActiveCutsceneBubble extends BattleQuoteResult {
  seq: number;
  speaking: boolean;
}

interface CombatCutsceneProps {
  attacker: Unit;
  defender: Unit;
  biome: BiomeId;
  resolution: CombatResolution;
  fastMode: boolean;
  onFinish: () => void;
}

function getBubbleToneClasses(
  faction: 'PLAYER' | 'ENEMY',
  hpBand: HpBand,
  isCrit: boolean,
  speaking: boolean
): { frame: string; badge: string; tailFill: string; tailBorder: string } {
  const dimClass = speaking ? 'opacity-100' : 'opacity-80';
  if (isCrit) {
    return {
      frame: `bg-[#16120c]/95 border-amber-300 text-amber-50 shadow-[0_0_18px_rgba(251,191,36,0.45),0_6px_16px_rgba(0,0,0,0.75)] ${dimClass}`,
      badge: 'text-amber-300',
      tailFill: '#16120c',
      tailBorder: '#fcd34d',
    };
  }
  if (hpBand === 'LOW') {
    return {
      frame: `bg-[#1a0c12]/95 border-red-400 text-rose-50 combat-bubble-low-pulse ${dimClass}`,
      badge: 'text-red-300',
      tailFill: '#1a0c12',
      tailBorder: '#f87171',
    };
  }
  if (hpBand === 'MID') {
    return {
      frame: `bg-[#141420]/95 border-amber-400/90 text-amber-50 shadow-[0_6px_16px_rgba(0,0,0,0.72)] ${dimClass}`,
      badge: 'text-amber-300',
      tailFill: '#141420',
      tailBorder: '#fbbf24',
    };
  }
  if (faction === 'PLAYER') {
    return {
      frame: `bg-[#0d1526]/95 border-sky-400/90 text-slate-50 shadow-[0_6px_16px_rgba(0,0,0,0.72)] ${dimClass}`,
      badge: 'text-sky-300',
      tailFill: '#0d1526',
      tailBorder: '#38bdf8',
    };
  }
  return {
    frame: `bg-[#1c0f16]/95 border-rose-400/85 text-rose-50 shadow-[0_6px_16px_rgba(0,0,0,0.72)] ${dimClass}`,
    badge: 'text-rose-300',
    tailFill: '#1c0f16',
    tailBorder: '#fb7185',
  };
}

function CombatBubbleOverlay({
  side,
  bubble,
}: {
  side: 'PLAYER' | 'ENEMY';
  bubble: ActiveCutsceneBubble | null;
}) {
  if (!bubble) return null;
  const tone = getBubbleToneClasses(side, bubble.hpBand, bubble.isCrit, bubble.speaking);
  const hpTag =
    bubble.hpBand === 'LOW'
      ? `HP ${bubble.hpPercent}% · NGUY KỊCH`
      : bubble.hpBand === 'MID'
      ? `HP ${bubble.hpPercent}%`
      : `${bubble.archetypeLabel}`;

  return (
    <div
      key={bubble.seq}
      data-testid={side === 'PLAYER' ? 'combat-bubble-player' : 'combat-bubble-enemy'}
      data-hp-band={bubble.hpBand}
      data-archetype={bubble.archetype}
      className={`pointer-events-none absolute top-[52px] z-10 w-max max-w-[224px] combat-bubble-pop ${
        side === 'PLAYER' ? 'left-[29%]' : 'left-[71%]'
      }`}
    >
      <div
        className={`relative rounded-sm border px-2.5 py-1.5 transition-opacity duration-200 ${tone.frame}`}
      >
        <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wider leading-none mb-1">
          <span className={tone.badge}>
            {bubble.isCrit ? '✦ CHÍ MẠNG · ' : ''}
            {hpTag}
          </span>
          <span className="font-mono-num text-[10px] text-slate-400">{bubble.hpPercent}%</span>
        </div>
        <p className="text-xs font-medium leading-snug tracking-tight whitespace-normal">
          “{bubble.text}”
        </p>

        {/* Crisp downward speech tail pointing directly at the unit's head */}
        <svg
          width="14"
          height="8"
          viewBox="0 0 14 8"
          aria-hidden="true"
          className="absolute -bottom-[8px] left-1/2 -translate-x-1/2"
        >
          <path d="M1 0 L7 7 L13 0 Z" fill={tone.tailFill} />
          <path d="M1 0 L7 7 L13 0" fill="none" stroke={tone.tailBorder} strokeWidth="1.25" />
        </svg>
      </div>
    </div>
  );
}

export function CombatCutscene({
  attacker,
  defender,
  biome,
  resolution,
  fastMode,
  onFinish,
}: CombatCutsceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<BattleSceneRenderer>(new BattleSceneRenderer());
  const finishedRef = useRef(false);

  const playerUnit = attacker.faction === 'PLAYER' ? attacker : defender;
  const enemyUnit = attacker.faction === 'PLAYER' ? defender : attacker;
  const playerPortraitSrc =
    (playerUnit.portraitKey && PORTRAIT_ASSETS[playerUnit.portraitKey]) ||
    PORTRAIT_ASSETS[playerUnit.templateId] ||
    getUnitPortraitDataUrl(playerUnit);
  const enemyPortraitSrc =
    (enemyUnit.portraitKey && PORTRAIT_ASSETS[enemyUnit.portraitKey]) ||
    PORTRAIT_ASSETS[enemyUnit.templateId] ||
    getUnitPortraitDataUrl(enemyUnit);
  const playerMaxHp = Math.max(playerUnit.hp, getEffectiveUnitStats(playerUnit).maxHp);
  const enemyMaxHp = Math.max(enemyUnit.hp, getEffectiveUnitStats(enemyUnit).maxHp);

  const startPlayerHp =
    attacker.faction === 'PLAYER' ? resolution.attackerStartHp : resolution.defenderStartHp;
  const startEnemyHp =
    attacker.faction === 'PLAYER' ? resolution.defenderStartHp : resolution.attackerStartHp;

  const [displayPlayerHp, setDisplayPlayerHp] = useState(startPlayerHp);
  const [displayEnemyHp, setDisplayEnemyHp] = useState(startEnemyHp);
  const [ghostPlayerHp, setGhostPlayerHp] = useState(startPlayerHp);
  const [ghostEnemyHp, setGhostEnemyHp] = useState(startEnemyHp);
  const [playerBubble, setPlayerBubble] = useState<ActiveCutsceneBubble | null>(null);
  const [enemyBubble, setEnemyBubble] = useState<ActiveCutsceneBubble | null>(null);

  const finishOnce = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const speedMul = fastMode ? 1.75 : 1;
    const windupDur = 0.34 / speedMul;
    const hitstopDur = 0.065;
    const impactDur = 0.38 / speedMul;
    const recoverDur = 0.26 / speedMul;
    const endHoldDur = 0.72 / speedMul;

    let strikeIdx = 0;
    let phase: 'WINDUP' | 'IMPACT' | 'RECOVER' | 'END' = 'WINDUP';
    let phaseTime = 0;
    let hitstopTimer = 0;
    let impactTriggered = false;
    let windupQuotedIdx = -1;
    let bubbleSeq = 0;
    let lastPlayerQuote: string | null = null;
    let lastEnemyQuote: string | null = null;

    let curAtkHp = resolution.attackerStartHp;
    let curDefHp = resolution.defenderStartHp;
    let trauma = 0;
    let bannerText: string | null = null;
    let hitFlashTarget: 'ATTACKER' | 'DEFENDER' | null = null;
    let flashTimer = 0;

    const triggerSpeakerBubble = (
      unit: Unit,
      liveHp: number,
      maxHp: number,
      isCrit: boolean
    ) => {
      const isPlayer = unit.faction === 'PLAYER';
      const quote = pickBattleQuote(unit, liveHp, maxHp, {
        isCrit,
        avoidText: isPlayer ? lastPlayerQuote : lastEnemyQuote,
      });
      bubbleSeq += 1;
      const nextBubble: ActiveCutsceneBubble = { ...quote, seq: bubbleSeq, speaking: true };
      if (isPlayer) {
        lastPlayerQuote = quote.text;
        setPlayerBubble(nextBubble);
        setEnemyBubble((prev) => (prev ? { ...prev, speaking: false } : null));
      } else {
        lastEnemyQuote = quote.text;
        setEnemyBubble(nextBubble);
        setPlayerBubble((prev) => (prev ? { ...prev, speaking: false } : null));
      }
    };

    let rafId = 0;
    let lastNow = performance.now();
    let lastRender = 0;

    const step = (now: number) => {
      rafId = requestAnimationFrame(step);
      if (now - lastRender < 28) return;
      lastRender = now;

      const rawDt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;
      const timeSec = now / 1000;

      if (hitstopTimer > 0) {
        hitstopTimer = Math.max(0, hitstopTimer - rawDt);
      } else {
        phaseTime += rawDt;
      }

      if (flashTimer > 0) {
        flashTimer = Math.max(0, flashTimer - rawDt);
        if (flashTimer <= 0) hitFlashTarget = null;
      }
      trauma = Math.max(0, trauma - rawDt * 2.4);

      const strike = resolution.strikes[strikeIdx] ?? null;
      let phaseProgress = 0;

      if (phase === 'WINDUP') {
        phaseProgress = Math.min(1, phaseTime / windupDur);
        if (strike && windupQuotedIdx !== strikeIdx) {
          windupQuotedIdx = strikeIdx;
          const strikerUnit = strike.actor === 'ATTACKER' ? attacker : defender;
          const strikerLiveHp = strike.actor === 'ATTACKER' ? curAtkHp : curDefHp;
          const strikerMaxHp = strikerUnit.faction === 'PLAYER' ? playerMaxHp : enemyMaxHp;
          triggerSpeakerBubble(strikerUnit, strikerLiveHp, strikerMaxHp, Boolean(strike.crit));
        }
        if (strike?.skillTriggered && SKILLS[strike.skillTriggered]) {
          bannerText = `✦ ${SKILLS[strike.skillTriggered].name.toUpperCase()} ✦`;
        }
        if (phaseTime >= windupDur) {
          phase = 'IMPACT';
          phaseTime = 0;
          impactTriggered = false;
        }
      } else if (phase === 'IMPACT') {
        phaseProgress = Math.min(1, phaseTime / impactDur);
        if (!impactTriggered && strike) {
          impactTriggered = true;
          const strikerUnit = strike.actor === 'ATTACKER' ? attacker : defender;
          const targetUnit = strike.actor === 'ATTACKER' ? defender : attacker;
          const targetIsLeft =
            (strike.actor === 'ATTACKER' && defender.faction === 'PLAYER') ||
            (strike.actor === 'DEFENDER' && attacker.faction === 'PLAYER');
          const burstX = targetIsLeft ? canvas.width * 0.28 : canvas.width * 0.72;
          const burstY = canvas.height * 0.62;

          if (strike.hit) {
            if (strikerUnit.weapon.isMagic) soundEngine.magic();
            else soundEngine.slash(strike.crit || Boolean(strike.skillTriggered));

            hitstopTimer = strike.crit || strike.skillTriggered ? hitstopDur * 1.45 : hitstopDur;
            trauma = strike.crit || strike.skillTriggered ? 0.95 : 0.55;
            flashTimer = 0.08;
            hitFlashTarget = strike.actor === 'ATTACKER' ? 'DEFENDER' : 'ATTACKER';

            const skillPrefix =
              strike.skillTriggered && SKILLS[strike.skillTriggered]
                ? `✦ ${SKILLS[strike.skillTriggered].name}: `
                : '';
            const healSuffix = strike.healedAmount ? ` (+${strike.healedAmount} HP)` : '';
            bannerText = strike.crit
              ? `${skillPrefix}CHÍ MẠNG! -${strike.damage}${healSuffix}`
              : `${skillPrefix}-${strike.damage}${healSuffix}`;

            rendererRef.current.emitBurst(
              burstX,
              burstY,
              strike.crit || strike.skillTriggered
                ? '#fbbf24'
                : strikerUnit.weapon.isMagic
                ? '#c084fc'
                : '#f8fafc',
              strike.crit || strike.skillTriggered ? 28 : 14
            );

            if (strike.actor === 'ATTACKER') {
              curDefHp = strike.targetHpAfter;
              curAtkHp = strike.actorHpAfter;
            } else {
              curAtkHp = strike.targetHpAfter;
              curDefHp = strike.actorHpAfter;
            }

            const nextPlayerHp = attacker.faction === 'PLAYER' ? curAtkHp : curDefHp;
            const nextEnemyHp = attacker.faction === 'PLAYER' ? curDefHp : curAtkHp;
            setDisplayPlayerHp(nextPlayerHp);
            setDisplayEnemyHp(nextEnemyHp);
            window.setTimeout(() => {
              setGhostPlayerHp(nextPlayerHp);
              setGhostEnemyHp(nextEnemyHp);
            }, 220);

            // If target survives and has no upcoming strike to voice a counter, show a reactive quote based on their new HP%
            const targetWillStrikeLater = resolution.strikes
              .slice(strikeIdx + 1)
              .some((s) => (s.actor === 'ATTACKER' ? attacker.id : defender.id) === targetUnit.id);
            if (strike.targetHpAfter > 0 && !targetWillStrikeLater) {
              const targetMaxHp = targetUnit.faction === 'PLAYER' ? playerMaxHp : enemyMaxHp;
              triggerSpeakerBubble(targetUnit, strike.targetHpAfter, targetMaxHp, false);
            }
          } else {
            soundEngine.miss();
            bannerText = 'TRƯỢT!';
          }
        }
        if (phaseTime >= impactDur) {
          phase = 'RECOVER';
          phaseTime = 0;
        }
      } else if (phase === 'RECOVER') {
        phaseProgress = Math.min(1, phaseTime / recoverDur);
        if (phaseTime >= recoverDur) {
          bannerText = null;
          strikeIdx += 1;
          if (strikeIdx < resolution.strikes.length) {
            phase = 'WINDUP';
            phaseTime = 0;
          } else {
            phase = 'END';
            phaseTime = 0;
          }
        }
      } else if (phase === 'END') {
        phaseProgress = Math.min(1, phaseTime / endHoldDur);
        if (phaseTime >= endHoldDur) {
          cancelAnimationFrame(rafId);
          finishOnce();
          return;
        }
      }

      const snap: BattleAnimationSnapshot = {
        attacker,
        defender,
        biome,
        activeStrike: strike,
        strikePhase: phase === 'END' ? 'IDLE' : phase,
        phaseProgress,
        attackerHp: curAtkHp,
        defenderHp: curDefHp,
        hitFlashTarget,
        trauma,
        bannerText,
      };

      rendererRef.current.render(ctx, canvas.width, canvas.height, snap, rawDt, timeSec);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [attacker, defender, biome, resolution, fastMode, playerMaxHp, enemyMaxHp]);

  const playerForecast =
    attacker.faction === 'PLAYER'
      ? {
          dmg: resolution.forecast.attackerDamage,
          hit: resolution.forecast.attackerHit,
          crit: resolution.forecast.attackerCrit,
        }
      : {
          dmg: resolution.forecast.defenderCanCounter ? resolution.forecast.defenderDamage : null,
          hit: resolution.forecast.defenderCanCounter ? resolution.forecast.defenderHit : null,
          crit: resolution.forecast.defenderCanCounter ? resolution.forecast.defenderCrit : null,
        };

  const enemyForecast =
    attacker.faction === 'ENEMY'
      ? {
          dmg: resolution.forecast.attackerDamage,
          hit: resolution.forecast.attackerHit,
          crit: resolution.forecast.attackerCrit,
        }
      : {
          dmg: resolution.forecast.defenderCanCounter ? resolution.forecast.defenderDamage : null,
          hit: resolution.forecast.defenderCanCounter ? resolution.forecast.defenderHit : null,
          crit: resolution.forecast.defenderCanCounter ? resolution.forecast.defenderCrit : null,
        };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hoạt ảnh giao tranh"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4"
    >
      <div className="w-full max-w-[760px] tactical-panel overflow-hidden">
        {/* Top strip */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#0c101a] border-b border-amber-500/30">
          <span className="text-xs font-display tracking-wider text-amber-200">
            GIAO TRANH TRỰC TIẾP
          </span>
          <button
            type="button"
            onClick={finishOnce}
            className="text-xs text-slate-300 hover:text-amber-200 cursor-pointer whitespace-nowrap"
          >
            Bỏ qua hoạt ảnh
          </button>
        </div>

        {/* Pixel Battle Canvas + Unit Combat Dialogue Bubbles */}
        <div className="relative w-full bg-[#0e1320]">
          <CombatBubbleOverlay side="PLAYER" bubble={playerBubble} />
          <CombatBubbleOverlay side="ENEMY" bubble={enemyBubble} />
          <canvas
            ref={canvasRef}
            width={760}
            height={330}
            className="w-full h-auto block pixel-art bg-[#0e1320]"
          />
        </div>

        {/* Classic Split Fire Emblem Battle Plate with Framed Character Portraits */}
        <div className="grid grid-cols-2 border-t border-amber-500/35 bg-[#0f1421]">
          {/* Left: Player Unit */}
          <div className="p-3.5 border-r border-amber-500/25 bg-gradient-to-r from-blue-950/65 to-transparent flex items-center gap-3">
            <div className="w-14 h-14 shrink-0 border border-sky-400/75 bg-[#090e1a] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.65)]">
              <img
                src={playerPortraitSrc}
                alt={playerUnit.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover pixel-art"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-display font-bold text-base text-blue-100 truncate">
                    {playerUnit.name}
                  </div>
                  <div className="text-xs text-blue-300/85 truncate">
                    {playerUnit.weapon.name} · {WEAPON_TYPE_LABEL[playerUnit.weapon.type]}
                  </div>
                </div>
                <div className="font-mono-num text-xl font-bold text-blue-200 shrink-0">
                  {displayPlayerHp}
                  <span className="text-xs text-slate-400">/{playerMaxHp}</span>
                </div>
              </div>

              {/* HP bar with delayed damage ghost */}
              <div className="relative h-3 bg-slate-900 border border-blue-400/40 mt-2 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-amber-400/80 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (ghostPlayerHp / Math.max(1, playerMaxHp)) * 100)}%`,
                  }}
                />
                <div
                  className="absolute inset-y-0 left-0 bg-sky-400 transition-all duration-150"
                  style={{
                    width: `${Math.min(100, (displayPlayerHp / Math.max(1, playerMaxHp)) * 100)}%`,
                  }}
                />
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs font-mono-num text-slate-300">
                <span>ST {playerForecast.dmg ?? '—'}</span>
                <span>CX {playerForecast.hit !== null ? `${playerForecast.hit}%` : '—'}</span>
                <span>CM {playerForecast.crit !== null ? `${playerForecast.crit}%` : '—'}</span>
              </div>
            </div>
          </div>

          {/* Right: Enemy Unit */}
          <div className="p-3.5 bg-gradient-to-l from-red-950/65 to-transparent flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <div className="font-mono-num text-xl font-bold text-red-200 shrink-0">
                  {displayEnemyHp}
                  <span className="text-xs text-slate-400">/{enemyMaxHp}</span>
                </div>
                <div className="text-right min-w-0">
                  <div className="font-display font-bold text-base text-red-100 truncate">
                    {enemyUnit.name}
                  </div>
                  <div className="text-xs text-red-300/85 truncate">
                    {enemyUnit.weapon.name} · {WEAPON_TYPE_LABEL[enemyUnit.weapon.type]}
                  </div>
                </div>
              </div>

              <div className="relative h-3 bg-slate-900 border border-red-400/40 mt-2 overflow-hidden">
                <div
                  className="absolute inset-y-0 right-0 bg-amber-400/80 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (ghostEnemyHp / Math.max(1, enemyMaxHp)) * 100)}%`,
                  }}
                />
                <div
                  className="absolute inset-y-0 right-0 bg-red-500 transition-all duration-150"
                  style={{
                    width: `${Math.min(100, (displayEnemyHp / Math.max(1, enemyMaxHp)) * 100)}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-4 mt-2 text-xs font-mono-num text-slate-300">
                <span>ST {enemyForecast.dmg ?? '—'}</span>
                <span>CX {enemyForecast.hit !== null ? `${enemyForecast.hit}%` : '—'}</span>
                <span>CM {enemyForecast.crit !== null ? `${enemyForecast.crit}%` : '—'}</span>
              </div>
            </div>

            <div className="w-14 h-14 shrink-0 border border-red-400/75 bg-[#160a10] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.65)]">
              <img
                src={enemyPortraitSrc}
                alt={enemyUnit.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover pixel-art -scale-x-100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
