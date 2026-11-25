import { BATTLE_STAGE_ASSETS } from './data';
import { getUnitSpriteCanvas, type SpriteAnimFrame, type SpriteAnimState } from './pixelSprites';
import type { BiomeId, CombatStrike, Unit } from './types';

interface Spark {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

const SPARK_POOL = 42;

export interface BattleAnimationSnapshot {
  attacker: Unit;
  defender: Unit;
  biome: BiomeId;
  activeStrike: CombatStrike | null;
  strikePhase: 'IDLE' | 'WINDUP' | 'IMPACT' | 'RECOVER';
  phaseProgress: number;
  attackerHp: number;
  defenderHp: number;
  hitFlashTarget: 'ATTACKER' | 'DEFENDER' | null;
  trauma: number;
  bannerText: string | null;
}

const stageImageCache: Partial<Record<'plains' | 'citadel', HTMLImageElement>> = {};

function getStageImage(kind: 'plains' | 'citadel'): HTMLImageElement | null {
  if (typeof window === 'undefined') return null;
  if (!stageImageCache[kind]) {
    const img = new Image();
    img.src = BATTLE_STAGE_ASSETS[kind];
    stageImageCache[kind] = img;
  }
  const img = stageImageCache[kind]!;
  return img.complete && img.naturalWidth > 0 ? img : null;
}

function getBiomeStageKind(biome: BiomeId): 'plains' | 'citadel' {
  if (
    biome === 'MAGMA_FORTRESS' ||
    biome === 'AETHELGARD_CITY' ||
    biome === 'CRIMSON_SANCTUM' ||
    biome === 'BLACKMIST_HARBOR' ||
    biome === 'DARKSEAL_SWAMP'
  ) {
    return 'citadel';
  }
  return 'plains';
}

function getBiomeTint(biome: BiomeId): string {
  switch (biome) {
    case 'ELDWOOD_FOREST':
      return 'rgba(16, 65, 58, 0.24)';
    case 'SOLARA_DESERT':
      return 'rgba(195, 115, 25, 0.22)';
    case 'FROSTPEAK_TUNDRA':
      return 'rgba(80, 155, 225, 0.26)';
    case 'MAGMA_FORTRESS':
      return 'rgba(190, 45, 18, 0.24)';
    case 'DARKSEAL_SWAMP':
      return 'rgba(90, 35, 140, 0.26)';
    case 'CRIMSON_SANCTUM':
      return 'rgba(165, 25, 70, 0.22)';
    default:
      return 'rgba(0, 0, 0, 0.06)';
  }
}

export class BattleSceneRenderer {
  private sparks: Spark[] = [];

  constructor() {
    for (let i = 0; i < SPARK_POOL; i++) {
      this.sparks.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0.4,
        color: '#fde047',
        size: 4,
      });
    }
    // Preload both bespoke 32-bit pixel battle stages eagerly
    getStageImage('plains');
    getStageImage('citadel');
  }

  public emitBurst(cx: number, cy: number, color: string, count: number) {
    let spawned = 0;
    for (let i = 0; i < this.sparks.length && spawned < count; i++) {
      const s = this.sparks[i];
      if (!s.active) {
        const angle = (Math.PI * 2 * spawned) / count + (Math.random() - 0.5) * 0.5;
        const speed = 100 + Math.random() * 210;
        s.active = true;
        s.x = cx;
        s.y = cy;
        s.vx = Math.cos(angle) * speed;
        s.vy = Math.sin(angle) * speed - 48;
        s.life = 0;
        s.maxLife = 0.28 + Math.random() * 0.26;
        s.color = color;
        s.size = 4 + Math.floor(Math.random() * 4);
        spawned++;
      }
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    snap: BattleAnimationSnapshot,
    dt: number,
    timeSec: number
  ) {
    ctx.imageSmoothingEnabled = false;
    ctx.save();

    // Decaying trauma camera shake on heavy hits & crits
    if (snap.trauma > 0.01) {
      const shake = snap.trauma * snap.trauma * 15;
      const sx = (Math.random() * 2 - 1) * shake;
      const sy = (Math.random() * 2 - 1) * shake;
      ctx.translate(sx, sy);
    }

    // 1. Bespoke 32-Bit HD-2D Pixel Art Stage Backdrop (with clean procedural fallback)
    const stageKind = getBiomeStageKind(snap.biome);
    const stageImg = getStageImage(stageKind);
    if (stageImg) {
      ctx.drawImage(stageImg, 0, 0, w, h);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#162540');
      grad.addColorStop(0.65, '#2b4569');
      grad.addColorStop(0.65, '#3b6637');
      grad.addColorStop(1, '#264526');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // Subtle biome atmosphere tint & ground depth shadow strip
    ctx.fillStyle = getBiomeTint(snap.biome);
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(6, 9, 16, 0.26)';
    ctx.fillRect(0, h * 0.78, w, h * 0.22);

    const leftX = w * 0.29;
    const rightX = w * 0.71;
    const groundY = h * 0.84;

    // Sculpted Fire Emblem-style elliptical duel platforms beneath combatants
    this.drawDuelPlatform(ctx, leftX, groundY, 'PLAYER', stageKind);
    this.drawDuelPlatform(ctx, rightX, groundY, 'ENEMY', stageKind);

    // Lunge, squash-and-stretch, and knockback motion curves
    let leftOffset = 0;
    let rightOffset = 0;
    let leftScaleX = 1;
    let rightScaleX = 1;
    let leftHop = 0;
    let rightHop = 0;

    if (snap.activeStrike) {
      const isLeftAttacking =
        (snap.activeStrike.actor === 'ATTACKER' && snap.attacker.faction === 'PLAYER') ||
        (snap.activeStrike.actor === 'DEFENDER' && snap.defender.faction === 'PLAYER');

      const strikerUnit =
        snap.activeStrike.actor === 'ATTACKER' ? snap.attacker : snap.defender;
      const isRanged = strikerUnit.weapon.maxRange >= 2;

      if (snap.strikePhase === 'WINDUP') {
        const pull = snap.phaseProgress * 26;
        if (isLeftAttacking) {
          leftOffset = -pull;
          leftScaleX = 0.92;
        } else {
          rightOffset = pull;
          rightScaleX = 0.92;
        }
      } else if (snap.strikePhase === 'IMPACT') {
        const lunge = isRanged ? 32 : 165;
        const recoil = snap.activeStrike.hit ? 28 * (1 - snap.phaseProgress) : -18;
        const arcHop = isRanged ? 0 : -Math.sin(snap.phaseProgress * Math.PI) * 18;
        if (isLeftAttacking) {
          leftOffset = lunge;
          leftHop = arcHop;
          rightOffset = recoil;
          leftScaleX = 1.15;
        } else {
          rightOffset = -lunge;
          rightHop = arcHop;
          leftOffset = -recoil;
          rightScaleX = 1.15;
        }
      } else if (snap.strikePhase === 'RECOVER') {
        const back = (1 - snap.phaseProgress) * (isRanged ? 24 : 110);
        if (isLeftAttacking) leftOffset = back;
        else rightOffset = -back;
      }
    }

    const leftUnit = snap.attacker.faction === 'PLAYER' ? snap.attacker : snap.defender;
    const rightUnit = snap.attacker.faction === 'PLAYER' ? snap.defender : snap.attacker;
    const leftDead = (leftUnit.id === snap.attacker.id ? snap.attackerHp : snap.defenderHp) <= 0;
    const rightDead = (rightUnit.id === snap.attacker.id ? snap.attackerHp : snap.defenderHp) <= 0;

    const leftFlash =
      (snap.hitFlashTarget === 'ATTACKER' && leftUnit.id === snap.attacker.id) ||
      (snap.hitFlashTarget === 'DEFENDER' && leftUnit.id === snap.defender.id);
    const rightFlash =
      (snap.hitFlashTarget === 'ATTACKER' && rightUnit.id === snap.attacker.id) ||
      (snap.hitFlashTarget === 'DEFENDER' && rightUnit.id === snap.defender.id);

    const idleCycle: SpriteAnimFrame = (Math.floor(timeSec * 4.5) % 4) as SpriteAnimFrame;
    const isLeftStriking =
      Boolean(snap.activeStrike) &&
      ((snap.activeStrike!.actor === 'ATTACKER' && snap.attacker.faction === 'PLAYER') ||
        (snap.activeStrike!.actor === 'DEFENDER' && snap.defender.faction === 'PLAYER'));
    const isRightStriking = Boolean(snap.activeStrike) && !isLeftStriking;

    const leftAnimState: SpriteAnimState = isLeftStriking
      ? snap.strikePhase === 'IMPACT'
        ? 'walk'
        : 'selected'
      : 'idle';
    const rightAnimState: SpriteAnimState = isRightStriking
      ? snap.strikePhase === 'IMPACT'
        ? 'walk'
        : 'selected'
      : 'idle';
    const leftFrame: SpriteAnimFrame =
      isLeftStriking && snap.strikePhase === 'IMPACT' ? 0 : idleCycle;
    const rightFrame: SpriteAnimFrame =
      isRightStriking && snap.strikePhase === 'IMPACT' ? 0 : idleCycle;

    this.drawBattleFighter(
      ctx,
      leftUnit,
      leftX + leftOffset,
      groundY + leftHop,
      1,
      leftScaleX,
      leftFlash,
      leftDead,
      leftFrame,
      leftAnimState
    );
    this.drawBattleFighter(
      ctx,
      rightUnit,
      rightX + rightOffset,
      groundY + rightHop,
      -1,
      rightScaleX,
      rightFlash,
      rightDead,
      rightFrame,
      rightAnimState
    );

    // High-impact Pixel Weapon Slash / Elemental Magic VFX / Combat Art Aura
    if (snap.activeStrike && snap.strikePhase === 'IMPACT') {
      const striker = snap.activeStrike.actor === 'ATTACKER' ? snap.attacker : snap.defender;
      const fromLeft = striker.faction === 'PLAYER';
      const targetX = fromLeft ? rightX : leftX;
      const targetY = groundY - 72;
      const el = striker.weapon.element ?? 'NONE';

      if (striker.weapon.isMagic) {
        ctx.save();
        const r = 24 + snap.phaseProgress * 58;
        if (el === 'FIRE') {
          // Blazing Fire Pillar!
          ctx.fillStyle = 'rgba(234, 88, 12, 0.42)';
          ctx.fillRect(targetX - 38, groundY - 190, 76, 190);
          ctx.fillStyle = 'rgba(251, 191, 36, 0.65)';
          ctx.fillRect(targetX - 20, groundY - 170, 40, 170);
          ctx.fillStyle = '#fef9c3';
          ctx.fillRect(targetX - 8, groundY - 150, 16, 145);
        } else if (el === 'THUNDER') {
          // Jagged Sky Lightning Bolt!
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.moveTo(targetX - 18, 0);
          ctx.lineTo(targetX + 16, h * 0.28);
          ctx.lineTo(targetX - 14, h * 0.5);
          ctx.lineTo(targetX + 6, groundY - 12);
          ctx.stroke();
          ctx.strokeStyle = '#fef9c3';
          ctx.lineWidth = 4;
          ctx.stroke();
        } else if (el === 'WIND') {
          // Emerald Cyclone Crescent Arcs!
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 7;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(targetX, targetY - 25 + i * 26, r * (0.65 + i * 0.12), 0.2, Math.PI * 1.15);
            ctx.stroke();
          }
        } else if (el === 'ICE') {
          // Crystalline Frost Shards
          ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.beginPath();
          ctx.moveTo(targetX, targetY - 68);
          ctx.lineTo(targetX + 42, targetY);
          ctx.lineTo(targetX, targetY + 62);
          ctx.lineTo(targetX - 42, targetY);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#f0f9ff';
          ctx.lineWidth = 4;
          ctx.stroke();
        } else if (el === 'DARK') {
          // Dark Void Gravity Vortex
          ctx.fillStyle = 'rgba(88, 28, 135, 0.55)';
          ctx.beginPath();
          ctx.arc(targetX, targetY, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#e879f9';
          ctx.lineWidth = 5;
          ctx.stroke();
          ctx.fillStyle = '#090412';
          ctx.beginPath();
          ctx.arc(targetX, targetY, r * 0.42, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Radiant Holy Light Beam
          ctx.fillStyle = 'rgba(253, 224, 71, 0.35)';
          ctx.fillRect(targetX - 44, 0, 88, groundY);
          ctx.fillStyle = 'rgba(255, 251, 235, 0.72)';
          ctx.fillRect(targetX - 18, 0, 36, groundY);
        }
        ctx.restore();
      } else if (striker.weapon.type === 'BOW') {
        const ax = fromLeft
          ? leftX + (rightX - leftX) * Math.min(1, snap.phaseProgress * 2.2)
          : rightX - (rightX - leftX) * Math.min(1, snap.phaseProgress * 2.2);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(ax - 24, targetY - 5, 48, 10);
        ctx.fillStyle = snap.activeStrike.skillTriggered ? '#fbbf24' : '#fef08a';
        ctx.fillRect(ax - 22, targetY - 2, 44, 4);
      } else {
        ctx.save();
        const isArt = Boolean(snap.activeStrike.skillTriggered);
        ctx.strokeStyle = snap.activeStrike.crit || isArt ? '#fbbf24' : '#ffffff';
        ctx.lineWidth = snap.activeStrike.crit || isArt ? 12 : 7;
        ctx.beginPath();
        ctx.arc(
          targetX - (fromLeft ? 16 : -16),
          targetY,
          isArt ? 70 : 58,
          fromLeft ? -Math.PI * 0.5 : Math.PI * 0.5,
          fromLeft ? Math.PI * 0.44 : Math.PI * 1.5
        );
        ctx.stroke();
        if (isArt) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(
            targetX - (fromLeft ? 6 : -6),
            targetY,
            52,
            fromLeft ? -Math.PI * 0.42 : Math.PI * 0.58,
            fromLeft ? Math.PI * 0.38 : Math.PI * 1.42
          );
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // Pooled pixel sparks
    for (let i = 0; i < this.sparks.length; i++) {
      const s = this.sparks[i];
      if (!s.active) continue;
      s.life += dt;
      if (s.life >= s.maxLife) {
        s.active = false;
        continue;
      }
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 340 * dt;
      ctx.fillStyle = s.color;
      ctx.globalAlpha = 1 - s.life / s.maxLife;
      ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
      ctx.globalAlpha = 1;
    }

    // Center impact callout (TUYỆT KỸ / CHÍ MẠNG! / TRƯỢT! / -12)
    if (snap.bannerText) {
      ctx.save();
      ctx.font = '800 28px "Playfair Display", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.94)';
      ctx.strokeText(snap.bannerText, w / 2, h * 0.13);
      ctx.fillStyle = snap.bannerText.includes('CHÍ MẠNG')
        ? '#fbbf24'
        : snap.bannerText.includes('TRƯỢT')
        ? '#cbd5e1'
        : snap.bannerText.includes('✦')
        ? '#38bdf8'
        : '#ffffff';
      ctx.fillText(snap.bannerText, w / 2, h * 0.13);
      ctx.restore();
    }

    ctx.restore();
  }

  private drawDuelPlatform(
    ctx: CanvasRenderingContext2D,
    cx: number,
    groundY: number,
    faction: 'PLAYER' | 'ENEMY',
    stageKind: 'plains' | 'citadel'
  ) {
    ctx.save();
    // Soft ambient ground shadow beneath platform
    ctx.fillStyle = 'rgba(4, 7, 15, 0.55)';
    ctx.beginPath();
    ctx.ellipse(cx, groundY + 6, 78, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    // Beveled stone/turf platform rim
    ctx.fillStyle = stageKind === 'citadel' ? '#1e2538' : '#243a2b';
    ctx.beginPath();
    ctx.ellipse(cx, groundY + 2, 72, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Platform top surface
    ctx.fillStyle = stageKind === 'citadel' ? '#2e3852' : '#35583c';
    ctx.beginPath();
    ctx.ellipse(cx, groundY - 1, 68, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle faction crest ring
    ctx.strokeStyle =
      faction === 'PLAYER' ? 'rgba(56, 189, 248, 0.55)' : 'rgba(248, 113, 113, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, groundY - 1, 63, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private drawBattleFighter(
    ctx: CanvasRenderingContext2D,
    unit: Unit,
    cx: number,
    groundY: number,
    facing: 1 | -1,
    scaleX: number,
    hitFlash: boolean,
    isDead: boolean,
    frame: SpriteAnimFrame,
    animState: SpriteAnimState
  ) {
    // Crisp 64x72 HD-2D fighter scaled cleanly at 2.85x (~182x205 px) for heroic Fire Emblem duel presence!
    const sprite = getUnitSpriteCanvas({ ...unit, acted: false }, frame, hitFlash, animState);
    const pxScale = 2.85;
    const drawW = Math.round(sprite.width * pxScale);
    const drawH = Math.round(sprite.height * pxScale);
    const bootOffset = Math.round(7 * pxScale);

    ctx.save();
    ctx.translate(cx, groundY);
    if (!isDead) {
      ctx.fillStyle = 'rgba(6, 9, 18, 0.52)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 36, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.globalAlpha = 0.28;
      ctx.translate(0, 14);
    }
    ctx.scale(facing * scaleX, 1);
    ctx.drawImage(sprite, -Math.round(drawW / 2), -drawH + bootOffset, drawW, drawH);
    ctx.restore();
  }
}
