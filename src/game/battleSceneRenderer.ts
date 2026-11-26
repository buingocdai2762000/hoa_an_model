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

    // High-impact Modern Combined-Arms VFX: Muzzle Flash, Tracers, Artillery/Missile Barrages & Explosions
    if (snap.activeStrike && snap.strikePhase === 'IMPACT') {
      const striker = snap.activeStrike.actor === 'ATTACKER' ? snap.attacker : snap.defender;
      const fromLeft = striker.faction === 'PLAYER';
      const muzzleX = fromLeft ? leftX + 68 : rightX - 68;
      const targetX = fromLeft ? rightX : leftX;
      const targetY = groundY - 72;
      const prog = Math.min(1, snap.phaseProgress);

      // Crisp Muzzle Flash at Striker Barrel
      if (prog < 0.45) {
        ctx.save();
        ctx.fillStyle = 'rgba(251, 146, 60, 0.72)';
        ctx.beginPath();
        ctx.arc(muzzleX, targetY - 6, 22 * (1 - prog), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef9c3';
        ctx.beginPath();
        ctx.arc(muzzleX, targetY - 6, 11 * (1 - prog), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (striker.weapon.isMagic) {
        // Heavy Artillery Shell / Rocket MLRS / Ballistic Missile Strike & Fireball Explosion!
        ctx.save();
        const r = 26 + prog * 68;
        // Smoke & fire trail arcing from upper sky onto target
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.45)';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(muzzleX, targetY - 24);
        ctx.quadraticCurveTo((muzzleX + targetX) / 2, h * 0.08, targetX, targetY);
        ctx.stroke();

        // Outer shockwave ring
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.75)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(targetX, targetY, r, 0, Math.PI * 2);
        ctx.stroke();

        // Multi-layered ordnance fireball blast
        ctx.fillStyle = 'rgba(185, 28, 28, 0.55)';
        ctx.beginPath();
        ctx.arc(targetX, targetY, r * 0.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(249, 115, 22, 0.78)';
        ctx.beginPath();
        ctx.arc(targetX, targetY - 6, r * 0.58, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef9c3';
        ctx.beginPath();
        ctx.arc(targetX, targetY - 8, r * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (striker.weapon.type === 'BOW') {
        // High-Velocity Sniper Round / Anti-Air Flak Tracer Streak
        const travel = Math.min(1, prog * 2.4);
        const ax = fromLeft
          ? muzzleX + (targetX - muzzleX) * travel
          : muzzleX - (muzzleX - targetX) * travel;
        ctx.save();
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(muzzleX, targetY - 4);
        ctx.lineTo(ax, targetY - 4);
        ctx.stroke();
        ctx.fillStyle = '#f97316';
        ctx.fillRect(ax - 18, targetY - 7, 36, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ax - 14, targetY - 5, 28, 2);
        ctx.restore();
      } else {
        // Rifle/SMG Tracer Burst OR Tank/Naval Cannon Shell Impact!
        ctx.save();
        const isArt = Boolean(snap.activeStrike.skillTriggered);
        for (let b = 0; b < 3; b++) {
          const t = Math.min(1, prog * 2.1 - b * 0.14);
          if (t <= 0) continue;
          const bx = fromLeft
            ? muzzleX + (targetX - muzzleX) * t
            : muzzleX - (muzzleX - targetX) * t;
          const by = targetY - 12 + b * 11;
          ctx.fillStyle = snap.activeStrike.crit || isArt ? '#f97316' : '#facc15';
          ctx.fillRect(bx - 16, by - 2, 32, 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx - 10, by - 1, 20, 2);
        }
        // Impact sparks & blast ring on defender
        ctx.strokeStyle = snap.activeStrike.crit || isArt ? '#fbbf24' : '#fb923c';
        ctx.lineWidth = snap.activeStrike.crit || isArt ? 8 : 5;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 20 + prog * 42, 0, Math.PI * 2);
        ctx.stroke();
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
    // Native 192x192 Ultra-HD military fighter rendered at ~1:1 pixel fidelity for razor-sharp Fire Emblem duels!
    const sprite = getUnitSpriteCanvas({ ...unit, acted: false }, frame, hitFlash, animState);
    const pxScale = 1.12;
    const drawW = Math.round(sprite.width * pxScale);
    const drawH = Math.round(sprite.height * pxScale);
    const bootOffset = Math.round(drawH * (12 / 192));

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.translate(cx, groundY);
    if (!isDead) {
      ctx.fillStyle = 'rgba(6, 9, 18, 0.52)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 44, 8, 0, 0, Math.PI * 2);
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
