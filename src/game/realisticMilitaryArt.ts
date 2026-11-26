import type { CharacterPalette, SpriteAnimFrame, SpriteAnimState } from './pixelSprites';
import type { Unit, UnitClassId, UnitDomain, UnitTier, WeaponType } from './types';

const W = 192;
const H = 192;

// ============================================================================
// DOMAIN & SPECIALIST CLASSIFIERS
// ============================================================================

function isFighterPlane(c: UnitClassId): boolean {
  return c === 'PEGASUS' || c === 'FALCON_KNIGHT' || c === 'SERAPH_KNIGHT' || c === 'CELESTIAL_VALKYRIE';
}
function isBomberPlane(c: UnitClassId): boolean {
  return c === 'WYVERN_RIDER' || c === 'WYVERN_LORD' || c === 'DRAGONLORD' || c === 'SKY_SOVEREIGN';
}
function isHeliTransport(c: UnitClassId): boolean {
  return c === 'GRIFFIN_RIDER' || c === 'GRIFFIN_LORD' || c === 'SUN_GRIFFIN' || c === 'SOLAR_APEX_KNIGHT';
}
function isMediumTank(c: UnitClassId): boolean {
  return c === 'CAVALIER' || c === 'PALADIN' || c === 'SILVER_KNIGHT' || c === 'ASTRAL_CAVALIER';
}
function isHeavyTank(c: UnitClassId): boolean {
  return c === 'KNIGHT' || c === 'GENERAL' || c === 'MARSHAL' || c === 'TITAN_CITADEL' || c === 'DARK_GENERAL';
}
function isTankDestroyer(c: UnitClassId): boolean {
  return c === 'DRAGOON' || c === 'WYRM_SLAYER' || c === 'DRAGON_KNIGHT' || c === 'ETERNAL_DRAGOON';
}
function isReconCar(c: UnitClassId): boolean {
  return c === 'NOMAD' || c === 'NOMAD_TROOPER' || c === 'BOW_KNIGHT' || c === 'TEMPEST_KHAN';
}
function isApcIfv(c: UnitClassId): boolean {
  return c === 'TROUBADOUR' || c === 'VALKYRIE' || c === 'SERAPH_RIDER' || c === 'CELESTIAL_EMPRESS';
}
function isSpaaArmor(c: UnitClassId): boolean {
  return c === 'OUTRIDER' || c === 'RANGER_KNIGHT' || c === 'HORIZON_LANCER' || c === 'STORM_STRIDER';
}
function isHowitzer(c: UnitClassId): boolean {
  return c === 'MAGE' || c === 'SAGE' || c === 'ARCHSAGE' || c === 'ASTRAL_ORACLE';
}
function isSiegeMissile(c: UnitClassId): boolean {
  return c === 'DARK_MAGE' || c === 'NECROMANCER' || c === 'DARK_DRUID' || c === 'ABYSSAL_ARCHON';
}
function isThermoRocket(c: UnitClassId): boolean {
  return c === 'SHAMAN' || c === 'SPIRIT_CALLER' || c === 'ELDER_ORACLE' || c === 'PRIMORDIAL_AVATAR';
}
function isSurfaceWarship(c: UnitClassId): boolean {
  return c === 'PIRATE' || c === 'CORSAIR' || c === 'DREAD_CAPTAIN' || c === 'OCEAN_LEVIATHAN';
}
function isSubmarine(c: UnitClassId): boolean {
  return c === 'DARK_KNIGHT' || c === 'DOOM_RIDER' || c === 'DEATH_KNIGHT' || c === 'ABYSS_SOVEREIGN';
}
function isCarrierLanding(c: UnitClassId): boolean {
  return c === 'TEMPLAR' || c === 'AEGIS_GUARD' || c === 'HOLY_BASTION' || c === 'DIVINE_WARDEN';
}
function isCommander(c: UnitClassId): boolean {
  return c === 'LORD' || c === 'GREAT_LORD' || c === 'SOVEREIGN' || c === 'EMPEROR_LORD';
}
function isMedic(c: UnitClassId): boolean {
  return (
    c === 'CLERIC' || c === 'BISHOP' || c === 'SAINT' || c === 'SERAPH_PROPHET' ||
    c === 'WAR_CLERIC' || c === 'BATTLE_PRIEST' || c === 'CRUSADER_BISHOP' || c === 'WRATHFUL_SERAPH'
  );
}
function isRadarSignal(c: UnitClassId): boolean {
  return (
    c === 'CHRONOMANCER' || c === 'ASTROLOGER' || c === 'TIME_WEAVER' || c === 'ETERNAL_CHRONOS' ||
    c === 'MONK' || c === 'EXORCIST' || c === 'INQUISITOR' || c === 'SOLAR_HIEROPHANT'
  );
}
function isSniper(c: UnitClassId): boolean {
  return c === 'ARCHER' || c === 'SNIPER' || c === 'MARKSMAN' || c === 'STARFALL_ARCHER';
}
function isHeavyMg(c: UnitClassId): boolean {
  return c === 'FIGHTER' || c === 'BERSERKER' || c === 'REAVER' || c === 'WAR_GOD';
}
function isAntiTankInf(c: UnitClassId): boolean {
  return c === 'SOLDIER' || c === 'HALBERDIER' || c === 'SENTINEL' || c === 'SPEAR_EMPEROR';
}
function isSmgAssault(c: UnitClassId): boolean {
  return c === 'MYRMIDON' || c === 'SWORDMASTER' || c === 'TRUEBLADE' || c === 'SWORD_SAINT';
}
function isGrenadierSapper(c: UnitClassId): boolean {
  return (
    c === 'BRAWLER' || c === 'WAR_MONK' || c === 'IRON_FIST_MASTER' || c === 'TITAN_DEMIGOD' ||
    c === 'SPELLBLADE' || c === 'MORTAL_SAVANT' || c === 'RUNE_BLADE' || c === 'AETHER_SOVEREIGN'
  );
}
function isStealthCommando(c: UnitClassId): boolean {
  return (
    c === 'THIEF' || c === 'ASSASSIN' || c === 'WHISPER' || c === 'PHANTOM_REAPER' ||
    c === 'NINJA' || c === 'MASTER_NINJA' || c === 'SHADOW_KAGE' || c === 'PHANTOM_SHOGUN'
  );
}

function resolveDomain(c: UnitClassId): UnitDomain {
  if (isFighterPlane(c) || isBomberPlane(c) || isHeliTransport(c)) return 'AIRCRAFT';
  if (isSurfaceWarship(c) || isSubmarine(c) || isCarrierLanding(c)) return 'NAVAL';
  if (isMediumTank(c) || isHeavyTank(c) || isTankDestroyer(c) || isReconCar(c) || isApcIfv(c) || isSpaaArmor(c)) {
    return 'ARMOR';
  }
  if (isHowitzer(c) || isSiegeMissile(c) || isThermoRocket(c)) return 'ARTILLERY';
  return 'INFANTRY';
}

function isFemaleUnit(templateId: string, classId: UnitClassId): boolean {
  const tid = templateId.toLowerCase();
  if (
    tid === 'lyra' || tid === 'elara' || tid === 'veyra' || tid === 'mira' ||
    tid === 'celeste' || tid === 'sylvara' || tid === 'aurelia' || tid === 'astraea' ||
    tid === 'seraphina' || tid === 'freya' || tid === 'nyx' || tid === 'isolde'
  ) {
    return true;
  }
  return isMedic(classId) || isApcIfv(classId);
}

// ============================================================================
// SHADING, METALLIC GRADIENTS, CAMOUFLAGE & NATIONAL INSIGNIA HELPERS
// ============================================================================

function vGrad(
  ctx: CanvasRenderingContext2D,
  y0: number,
  y1: number,
  light: string,
  mid: string,
  dark: string
): CanvasGradient {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, light);
  g.addColorStop(0.45, mid);
  g.addColorStop(1, dark);
  return g;
}

function cylGrad(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r: number,
  light: string,
  mid: string,
  dark: string
): CanvasGradient {
  const len = Math.max(1, Math.hypot(x1 - x0, y1 - y0));
  let nx = -(y1 - y0) / len;
  let ny = (x1 - x0) / len;
  if (nx * -0.5 + ny * -0.85 < 0) {
    nx = -nx;
    ny = -ny;
  }
  const mx = (x0 + x1) * 0.5;
  const my = (y0 + y1) * 0.5;
  const g = ctx.createLinearGradient(mx + nx * r, my + ny * r, mx - nx * r, my - ny * r);
  g.addColorStop(0, mid);
  g.addColorStop(0.28, light);
  g.addColorStop(0.7, mid);
  g.addColorStop(1, dark);
  return g;
}

function drawShadedRod(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r0: number,
  r1: number,
  light: string,
  mid: string,
  dark: string,
  outline = '#10151a',
  lineW = 1.4
) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0 + nx * r0, y0 + ny * r0);
  ctx.lineTo(x1 + nx * r1, y1 + ny * r1);
  ctx.arc(x1, y1, r1, Math.atan2(ny, nx), Math.atan2(-ny, -nx));
  ctx.lineTo(x0 - nx * r0, y0 - ny * r0);
  ctx.arc(x0, y0, r0, Math.atan2(-ny, -nx), Math.atan2(ny, nx));
  ctx.closePath();
  ctx.fillStyle = cylGrad(ctx, x0, y0, x1, y1, Math.max(r0, r1), light, mid, dark);
  ctx.fill();
  if (lineW > 0) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = lineW;
    ctx.stroke();
  }
  ctx.restore();
}

function polyPath(ctx: CanvasRenderingContext2D, pts: ReadonlyArray<readonly [number, number]>) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.closePath();
}

function fillStrokePoly(
  ctx: CanvasRenderingContext2D,
  pts: ReadonlyArray<readonly [number, number]>,
  fill: string | CanvasGradient,
  stroke = '#10151a',
  lineW = 1.6
) {
  polyPath(ctx, pts);
  ctx.fillStyle = fill;
  ctx.fill();
  if (lineW > 0) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineW;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function drawGroundInsignia(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  isAxis: boolean,
  circled = false
) {
  ctx.save();
  if (isAxis) {
    // Authentic Wehrmacht White-Flanked Black Balkenkreuz
    const s = r * 1.15;
    const arm = Math.max(1.8, r * 0.38);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(cx - s, cy - arm, s * 2, arm * 2);
    ctx.fillRect(cx - arm, cy - s, arm * 2, s * 2);
    ctx.fillStyle = '#0f172a';
    const inArm = arm * 0.56;
    ctx.fillRect(cx - s * 0.9, cy - inArm, s * 1.8, inArm * 2);
    ctx.fillRect(cx - inArm, cy - s * 0.9, inArm * 2, s * 1.8);
  } else {
    // Authentic Allied White 5-Point Star (with optional WWII recognition ring)
    if (circled) {
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.32, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const ang = -Math.PI / 2 + (i * Math.PI) / 5;
      const rad = i % 2 === 0 ? r : r * 0.42;
      const px = cx + Math.cos(ang) * rad;
      const py = cy + Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }
  ctx.restore();
}

function drawAirRoundel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rot: number,
  isAxis: boolean
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  if (isAxis) {
    const s = rx;
    const arm = Math.max(1.8, rx * 0.36);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-s, -arm, s * 2, arm * 2);
    ctx.fillRect(-arm, -s * (ry / rx), arm * 2, s * 2 * (ry / rx));
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-s * 0.88, -arm * 0.55, s * 1.76, arm * 1.1);
    ctx.fillRect(-arm * 0.55, -s * 0.88 * (ry / rx), arm * 1.1, s * 1.76 * (ry / rx));
  } else {
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1e3a8a';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 0.68, ry * 0.68, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 0.36, ry * 0.36, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
  }
  ctx.restore();
}

function drawDetailedWheel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  hubCol: string,
  rotAngle = 0,
  spokedWood = false
) {
  ctx.save();
  ctx.translate(cx, cy);
  if (spokedWood) {
    // Authentic WWI Iron-Rimmed Wooden Artillery / Armored Car Spoked Wheel!
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.arc(0, 0, Math.max(2, r - 4.2), 0, Math.PI * 2, true);
    ctx.fillStyle = '#27272a';
    ctx.fill();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r - 1.6, 0, Math.PI * 2);
    ctx.arc(0, 0, Math.max(2, r - 4.2), 0, Math.PI * 2, true);
    ctx.fillStyle = '#854d0e';
    ctx.fill();

    for (let i = 0; i < 10; i++) {
      const a = rotAngle + (i * Math.PI) / 5;
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * (r - 3.5), Math.sin(a) * (r - 3.5));
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#71717a';
    ctx.fill();
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Heavy Off-Road Pneumatic Rubber Tire with Tread Notches & Bolted Steel Rim
  const tireG = ctx.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.2, 0, 0, r);
  tireG.addColorStop(0, '#3f3f46');
  tireG.addColorStop(0.72, '#18181b');
  tireG.addColorStop(1, '#09090b');
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = tireG;
  ctx.fill();
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Tire tread lugs around circumference
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 12; i++) {
    const a = rotAngle + (i * Math.PI) / 6;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (r - 2.5), Math.sin(a) * (r - 2.5));
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.stroke();
  }

  // Steel wheel rim + hubcap + lug bolts
  const rimR = r * 0.56;
  ctx.beginPath();
  ctx.arc(0, 0, rimR, 0, Math.PI * 2);
  ctx.fillStyle = hubCol;
  ctx.fill();
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = '#d4d4d8';
  for (let b = 0; b < 6; b++) {
    const a = rotAngle + (b * Math.PI) / 3;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * (rimR * 0.62), Math.sin(a) * (rimR * 0.62), 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0, 0, rimR * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = '#27272a';
  ctx.fill();
  ctx.restore();
}

function drawRealisticTrackSystem(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  wheelCount: number,
  pal: CharacterPalette,
  rotShift: number,
  hasSideSkirt: boolean,
  interleaved = false
) {
  ctx.save();
  const rSprocket = h * 0.34;
  const rRoad = h * 0.37;
  const leftCx = x + rSprocket + 2;
  const rightCx = x + w - rSprocket - 2;
  const topCy = y + rSprocket + 2;
  const botY = y + h - 1.5;

  // Outer Caterpillar Steel/Rubber Track Belt Loop
  const trackPts: [number, number][] = [
    [x + 2, topCy],
    [x + 8, y + 1],
    [x + w - 8, y + 1],
    [x + w - 2, topCy],
    [x + w - 12, botY],
    [x + 12, botY],
  ];
  fillStrokePoly(ctx, trackPts, '#1c1d21', '#09090b', 2);

  // Dark inner suspension shadow recess
  polyPath(ctx, [
    [x + 6, topCy + 1],
    [x + 12, y + 4.5],
    [x + w - 12, y + 4.5],
    [x + w - 6, topCy + 1],
    [x + w - 15, botY - 3.5],
    [x + 15, botY - 3.5],
  ]);
  ctx.fillStyle = '#0d1014';
  ctx.fill();

  // Individual steel track link chevrons along top & bottom runs
  ctx.strokeStyle = '#52525b';
  ctx.lineWidth = 1.4;
  for (let tx = x + 14 + rotShift * 3; tx <= x + w - 16; tx += 6) {
    ctx.beginPath();
    ctx.moveTo(tx, botY - 2.5);
    ctx.lineTo(tx + 2.5, botY + 0.5);
    ctx.stroke();
  }

  // Raised Front Drive Sprocket (with teeth) & Rear Idler Wheel
  for (const sx of [leftCx, rightCx]) {
    ctx.beginPath();
    ctx.arc(sx, topCy + 1, rSprocket, 0, Math.PI * 2);
    ctx.fillStyle = pal.mountDark;
    ctx.fill();
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(sx, topCy + 1, rSprocket * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = pal.mountLight;
    ctx.fill();
  }

  // Return rollers along upper track run
  for (let k = 1; k <= 3; k++) {
    const rx = x + (w * k) / 4;
    ctx.beginPath();
    ctx.arc(rx, y + 7, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#3f3f46';
    ctx.fill();
  }

  // Rubber-Rimmed Roadwheels (with optional German Tiger/Panther interleaved overlap!)
  const startWx = x + 19;
  const spanW = Math.max(20, w - 38);
  const count = interleaved ? wheelCount + 2 : wheelCount;
  for (let i = 0; i < count; i++) {
    const wx = startWx + (spanW * i) / Math.max(1, count - 1);
    const wy = botY - rRoad - (interleaved && i % 2 === 1 ? 1.5 : 0.5);
    // Rubber rim
    ctx.beginPath();
    ctx.arc(wx, wy, rRoad, 0, Math.PI * 2);
    ctx.fillStyle = '#18181b';
    ctx.fill();
    // Dished steel roadwheel disc
    ctx.beginPath();
    ctx.arc(wx, wy, rRoad * 0.68, 0, Math.PI * 2);
    ctx.fillStyle = interleaved && i % 2 === 1 ? pal.mountDark : pal.mountMid;
    ctx.fill();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.1;
    ctx.stroke();
    // Grease hubcap
    ctx.beginPath();
    ctx.arc(wx, wy, rRoad * 0.24, 0, Math.PI * 2);
    ctx.fillStyle = pal.mountLight;
    ctx.fill();
  }

  // Armored Side Skirts (Chobham / Schürzen) or Steel Track Fender
  if (hasSideSkirt) {
    const skirtH = h * 0.46;
    const g = vGrad(ctx, y, y + skirtH, pal.armorLight, pal.armorMid, pal.armorDark);
    const skirtPts: [number, number][] = [
      [x + 1, y + skirtH * 0.75],
      [x + 6, y],
      [x + w - 5, y],
      [x + w, y + skirtH * 0.7],
      [x + w - 6, y + skirtH],
      [x + 6, y + skirtH],
    ];
    fillStrokePoly(ctx, skirtPts, g, '#10151a', 1.5);
    // Segmented armored skirt panel seams & bolt heads
    const segs = 5;
    for (let s = 1; s < segs; s++) {
      const sx = x + 6 + ((w - 12) * s) / segs;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sx, y + 1);
      ctx.lineTo(sx, y + skirtH - 1);
      ctx.stroke();
    }
  } else {
    // Crisp bent-steel mudguard fender above tracks
    ctx.strokeStyle = pal.mountLight;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 5);
    ctx.lineTo(x + 8, y + 1);
    ctx.lineTo(x + w - 8, y + 1);
    ctx.lineTo(x + w - 2, y + 6);
    ctx.stroke();
  }
  ctx.restore();
}

// ============================================================================
// 1. REALISTIC INFANTRY & SPECIALISTS (10 DISTINCT POSTURES & AUTHENTIC WEAPONS)
// ============================================================================

function drawBoot(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, dir = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  const pts: [number, number][] = [
    [-8, -12],
    [4, -12],
    [9, -6],
    [len - 4, -5],
    [len - 1, -1.5],
    [len - 2, 0.5],
    [-8, 0.5],
  ];
  fillStrokePoly(ctx, pts, vGrad(ctx, -12, 0.5, '#5c534a', '#2e2925', '#0c0a09'), '#09090b', 1.5);
  // Boot lace lines & lugged sole
  ctx.strokeStyle = '#78716c';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(3, -10);
  ctx.lineTo(7, -8.5);
  ctx.moveTo(4, -7.5);
  ctx.lineTo(8, -6);
  ctx.stroke();
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-7, -0.5);
  ctx.lineTo(len - 2, -0.5);
  ctx.stroke();
  ctx.restore();
}

function drawInfantryCanvas(
  ctx: CanvasRenderingContext2D,
  unit: Unit,
  pal: CharacterPalette,
  tier: UnitTier,
  frame: SpriteAnimFrame,
  animState: SpriteAnimState
) {
  const classId = unit.classId;
  const wType: WeaponType = unit.weapon?.type ?? 'SWORD';
  const isBoss = Boolean(unit.isBoss);
  const isAxis = unit.faction === 'ENEMY';
  const female = isFemaleUnit(unit.templateId, classId);

  const bob = animState === 'walk' ? (frame % 2 === 1 ? -3 : 0.8) : frame === 1 || frame === 2 ? -1.2 : 0;
  const stride = animState === 'walk' ? (frame === 1 ? 10 : frame === 3 ? -10 : 0) : 0;
  const groundY = 180;

  // Determine specialist combat posture!
  const kneeling = (isSniper(classId) || (isAntiTankInf(classId) && tier <= 3)) && animState !== 'walk';
  const crouching = (isStealthCommando(classId) || isHeavyMg(classId)) && animState !== 'walk';
  const officer = isCommander(classId) || isBoss;
  const medic = isMedic(classId);

  const cx = kneeling ? 84 : 82;
  const crouchDrop = kneeling ? 25 : crouching ? 11 : 4;
  const pelvisY = 122 + crouchDrop + bob;
  const shoulderY = 74 + crouchDrop * 0.78 + bob;
  const leanX = kneeling ? 7 : crouching ? 6 : officer ? 3 : 4;
  const headX = cx + leanX;
  const headY = shoulderY - 19;

  // 0. TIER 4 MODERN TACTICAL RECON QUADCOPTER / LOITERING DRONE OVERHEAD!
  if (tier >= 4) {
    const dx = 32;
    const dy = 44 + (frame % 2 === 0 ? -2.2 : 2.2);
    ctx.save();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(dx - 20, dy - 2);
    ctx.lineTo(dx + 20, dy - 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(186, 230, 253, 0.58)';
    ctx.beginPath();
    ctx.ellipse(dx - 20, dy - 5, frame % 2 === 0 ? 12 : 8.5, 2.4, 0, 0, Math.PI * 2);
    ctx.ellipse(dx + 20, dy - 5, frame % 2 === 0 ? 12 : 8.5, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    roundRectPath(ctx, dx - 10, dy - 6, 20, 8.5, 3);
    ctx.fillStyle = vGrad(ctx, dy - 6, dy + 2.5, '#94a3b8', '#475569', '#1e293b');
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(dx + 3, dy + 3.5, 3.4, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    ctx.restore();
  }

  // 1. SNIPER GHILLIE CLOAK / OFFICER GREATCOAT TAIL HEM
  if ((isSniper(classId) && tier >= 2) || (officer && tier >= 2)) {
    const cloakPts: [number, number][] = [
      [cx - 17, shoulderY + 4],
      [cx + 10, shoulderY + 4],
      [cx - 12, pelvisY + (kneeling ? 22 : 36)],
      [cx - 34, pelvisY + (kneeling ? 19 : 31)],
    ];
    fillStrokePoly(
      ctx,
      cloakPts,
      isSniper(classId)
        ? vGrad(ctx, shoulderY, pelvisY + 30, '#5a6e43', '#3b4a2b', '#1f2916')
        : vGrad(ctx, shoulderY, pelvisY + 36, pal.armorMid, pal.armorDark, '#0f1410'),
      '#10151a',
      1.5
    );
  }

  // 2. FIELD RUCKSACK, RADIO MANPACK, GAS-MASK CANISTER & RADAR TRIPOD
  if (isRadarSignal(classId) && tier >= 3) {
    const rx = cx - 35;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(rx, 145);
    ctx.lineTo(rx - 11, groundY);
    ctx.moveTo(rx, 145);
    ctx.lineTo(rx + 11, groundY);
    ctx.moveTo(rx, 145);
    ctx.lineTo(rx, 124);
    ctx.stroke();
    ctx.save();
    ctx.translate(rx + 2, 118);
    ctx.rotate(-0.35);
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 15, 0, 0, Math.PI * 2);
    ctx.fillStyle = vGrad(ctx, -15, 15, '#f1f5f9', '#94a3b8', '#475569');
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  const packW = 17 + (tier >= 2 ? 4 : 0);
  const packH = 30 + (tier >= 2 ? 5 : 0);
  const packX = cx - 28;
  const packY = shoulderY + 3;
  roundRectPath(ctx, packX, packY, packW, packH, 3.5);
  ctx.fillStyle = vGrad(ctx, packY, packY + packH, '#9c8866', '#66573e', '#2e271b');
  ctx.fill();
  ctx.strokeStyle = '#10151a';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Pack flap & straps
  ctx.strokeStyle = '#292218';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(packX + 2, packY + 9);
  ctx.lineTo(packX + packW - 2, packY + 9);
  ctx.stroke();
  // Rolled bedroll / shelter-half or steel gas-mask canister strapped to pack
  if (tier <= 2) {
    roundRectPath(ctx, packX - 2, packY - 6, packW + 3, 7, 3.5);
    ctx.fillStyle = '#85775c';
    ctx.fill();
    ctx.stroke();
  }
  // Whip radio antenna on Signal / Officer / Tier 3-4 squads
  if (isRadarSignal(classId) || (officer && tier >= 2) || tier >= 3) {
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(packX + 5, packY);
    ctx.quadraticCurveTo(packX - 3, packY - 24, packX - 7, packY - 44);
    ctx.stroke();
  }

  // 3. WIDE ATHLETIC COMBAT STANCE: SCULPTED MILITARY TROUSERS, PUTTEES/KNEE PADS & HEAVY BOOTS
  if (kneeling) {
    // Rear leg planted firmly on knee + Front leg braced at 90 degrees!
    drawShadedRod(ctx, cx - 8, pelvisY + 3, cx - 18, groundY - 6, 10.2, 8.4, pal.armorMid, pal.armorDark, '#141a12');
    drawShadedRod(ctx, cx - 18, groundY - 6, cx - 38, groundY - 5, 7.6, 6.4, pal.armorMid, pal.armorDark, '#141a12');
    drawBoot(ctx, cx - 38, groundY, 16, -1);

    // Front braced kneeling leg
    drawShadedRod(ctx, cx + 6, pelvisY + 2, cx + 27, pelvisY + 9, 10.6, 8.8, pal.armorLight, pal.armorMid, pal.armorDark);
    drawShadedRod(ctx, cx + 27, pelvisY + 9, cx + 29, groundY - 8, 8.2, 6.6, pal.armorLight, pal.armorMid, pal.armorDark);
    if (tier >= 3) {
      roundRectPath(ctx, cx + 23, pelvisY + 4, 9.5, 10.5, 3);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    drawBoot(ctx, cx + 29, groundY, 19, 1);
  } else {
    const stanceSpread = crouching ? 25 : officer ? 20 : 22;
    const rearFootX = cx - stanceSpread - stride;
    const frontFootX = cx + stanceSpread + 2 + stride;
    const rearKneeX = (cx - 9 + rearFootX) * 0.5 + 5;
    const rearKneeY = (pelvisY + groundY - 10) * 0.51;
    const frontKneeX = (cx + 9 + frontFootX) * 0.5 + 7;
    const frontKneeY = (pelvisY + groundY - 10) * 0.49;

    // Far (rear) combat thigh + calf + boot
    drawShadedRod(ctx, cx - 8, pelvisY + 2, rearKneeX, rearKneeY, 10.2, 8.4, pal.armorMid, pal.armorDark, '#121810');
    drawShadedRod(
      ctx,
      rearKneeX,
      rearKneeY,
      rearFootX,
      groundY - 9,
      7.8,
      6.2,
      tier === 1 ? '#7d6f52' : tier === 2 ? '#8f8163' : pal.armorMid,
      tier <= 2 ? '#544a35' : pal.armorDark,
      '#18181b'
    );
    drawBoot(ctx, rearFootX, groundY, 18, 1);

    // Near (front) combat thigh + calf + knee pad/puttees + boot
    drawShadedRod(ctx, cx + 8, pelvisY + 2, frontKneeX, frontKneeY, 10.8, 8.8, pal.armorLight, pal.armorMid, pal.armorDark);
    drawShadedRod(
      ctx,
      frontKneeX,
      frontKneeY,
      frontFootX,
      groundY - 9,
      8.2,
      6.6,
      tier === 1 ? '#998a68' : tier === 2 ? '#ab9b79' : pal.armorLight,
      tier <= 2 ? '#695c43' : pal.armorMid,
      '#1f241c'
    );
    if (tier === 1) {
      // Authentic WWI spiral puttee wrap lines
      ctx.strokeStyle = 'rgba(30, 26, 18, 0.6)';
      ctx.lineWidth = 1.25;
      for (let py = frontKneeY + 4; py < groundY - 12; py += 4.5) {
        ctx.beginPath();
        ctx.moveTo(frontKneeX - 6, py);
        ctx.lineTo(frontFootX + 5, py + 1.5);
        ctx.stroke();
      }
    } else if (tier >= 3) {
      // Tactical molded ballistic knee pad
      roundRectPath(ctx, frontKneeX - 5, frontKneeY - 5, 11, 10.5, 3);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    drawBoot(ctx, frontFootX, groundY, 19, 1);
  }

  // 4. HEROIC BROAD-SHOULDERED FIELD TUNIC / GREATCOAT, WEBBING, POUCHES & PLATE CARRIER
  const torsoW = female ? 17.5 : 20.5;
  const skirtFlare = officer ? 23 : 19.5;
  const tunicPts: [number, number][] = [
    [cx - torsoW + 1, shoulderY],
    [cx + torsoW + 1, shoulderY],
    [cx + torsoW - 2, pelvisY - 7],
    [cx + skirtFlare, pelvisY + (officer ? 17 : 10)],
    [cx - skirtFlare + 2, pelvisY + (officer ? 17 : 10)],
    [cx - torsoW + 2, pelvisY - 7],
  ];
  fillStrokePoly(
    ctx,
    tunicPts,
    vGrad(ctx, shoulderY, pelvisY + 14, pal.armorLight, pal.armorMid, pal.armorDark),
    '#10151a',
    1.6
  );

  // Subtle vertical uniform button placket & breast pockets
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx + 4, shoulderY + 3);
  ctx.lineTo(cx + 4, pelvisY + 6);
  ctx.stroke();

  // Multi-tone WWII / Crye Multicam Woodland Camouflage patches on T3-T4 or Snipers/Commandos
  if (tier >= 3 || isStealthCommando(classId) || (isSniper(classId) && tier >= 2)) {
    ctx.save();
    polyPath(ctx, tunicPts);
    ctx.clip();
    ctx.fillStyle = isAxis ? 'rgba(68, 64, 60, 0.48)' : 'rgba(38, 52, 26, 0.48)';
    ctx.beginPath();
    ctx.ellipse(cx - 7, shoulderY + 15, 10, 5.5, 0.35, 0, Math.PI * 2);
    ctx.ellipse(cx + 9, shoulderY + 29, 11, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Webbing Y-Straps, Leather Cartridge Belt, Canteen & Ammo Pouches (T1-T2) vs MOLLE Plate Carrier (T3-T4)
  if (tier >= 3) {
    roundRectPath(ctx, cx - 14, shoulderY + 6, 30, 29, 3.5);
    ctx.fillStyle = vGrad(ctx, shoulderY + 6, shoulderY + 35, '#737863', '#434839', '#1f241b');
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // 3 STANAG magazine pouches across chest + PTT radio handset
    for (let m = 0; m < 3; m++) {
      roundRectPath(ctx, cx - 11 + m * 8.5, shoulderY + 20, 7, 12, 1.5);
      ctx.fillStyle = '#4b5340';
      ctx.fill();
      ctx.stroke();
    }
    // Tactical duty belt
    roundRectPath(ctx, cx - 18, pelvisY - 7, 36, 6, 1.5);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.stroke();
  } else {
    // Classic WWI/WWII Y-straps + officer Sam Browne diagonal strap + cartridge pouches + brass buckle
    ctx.strokeStyle = isAxis ? '#292524' : '#857452';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(cx - 11, shoulderY + 1);
    ctx.lineTo(cx - 5, pelvisY - 5);
    ctx.moveTo(cx + 11, shoulderY + 1);
    ctx.lineTo(cx + 6, pelvisY - 5);
    ctx.stroke();

    if (officer) {
      ctx.strokeStyle = '#5c2d0c';
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(cx - 14, shoulderY + 2);
      ctx.lineTo(cx + 14, pelvisY - 5);
      ctx.stroke();
    }

    roundRectPath(ctx, cx - 18, pelvisY - 8, 36, 6.5, 1.5);
    ctx.fillStyle = '#3b2818';
    ctx.fill();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = pal.goldLight;
    ctx.fillRect(cx + 2, pelvisY - 7.5, 5.5, 5.5);

    // Front leather cartridge pouches
    roundRectPath(ctx, cx - 15, pelvisY - 9, 9.5, 8.5, 1.5);
    roundRectPath(ctx, cx + 8, pelvisY - 9, 9.5, 8.5, 1.5);
    ctx.fillStyle = '#4f3520';
    ctx.fill();
    ctx.stroke();
  }

  // Prominent Combat Medic Red Cross Satchel on Hip
  if (medic) {
    roundRectPath(ctx, cx - 18, pelvisY - 4, 20, 17, 3);
    ctx.fillStyle = '#f5f5f4';
    ctx.fill();
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(cx - 10, pelvisY, 4, 9);
    ctx.fillRect(cx - 12.5, pelvisY + 2.5, 9, 4);
  }

  // 5. SCULPTED HUMAN HEAD, NATURAL SHADED FACE & ERA-AUTHENTIC MILITARY HELMET / CAP
  drawShadedRod(ctx, cx + 2, shoulderY + 2, headX, headY + 9, 6, 5.4, pal.skinLight, pal.skinMid, pal.skinShade, '#2b1b12', 1.1);

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(headX, headY, 11.5, 13, 0, 0, Math.PI * 2);
  const faceG = ctx.createRadialGradient(headX + 4, headY - 2.5, 2.5, headX, headY, 13.5);
  faceG.addColorStop(0, pal.skinLight);
  faceG.addColorStop(0.62, pal.skinMid);
  faceG.addColorStop(1, pal.skinShade);
  ctx.fillStyle = faceG;
  ctx.fill();
  ctx.strokeStyle = '#26170f';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  if (isStealthCommando(classId) && tier >= 3) {
    ctx.beginPath();
    ctx.ellipse(headX, headY + 2.5, 11.2, 10.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
  }

  // Crisp determined eyes, brow & nose shadow
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(headX + 2, headY - 3, 3.8, 2.3);
  ctx.fillRect(headX + 7.2, headY - 3, 3.1, 2.3);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(headX + 3.2, headY - 3, 2, 2.3);
  ctx.fillRect(headX + 8, headY - 3, 1.8, 2.3);
  ctx.strokeStyle = pal.hairDark;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(headX + 1.2, headY - 5);
  ctx.lineTo(headX + 10.4, headY - 4.7);
  ctx.stroke();
  ctx.restore();

  // Authentic Branch & Era Headgear!
  if (officer && tier <= 3) {
    // Officer Peaked Visor Cap (Crusher Cap) with Gold Wreath Badge & Glossy Visor
    fillStrokePoly(
      ctx,
      [
        [headX - 15, headY - 8],
        [headX - 11, headY - 19],
        [headX + 12, headY - 19],
        [headX + 17, headY - 9],
        [headX + 12, headY - 6],
        [headX - 12, headY - 6],
      ],
      vGrad(ctx, headY - 19, headY - 6, pal.armorLight, pal.armorMid, pal.armorDark),
      '#10151a',
      1.4
    );
    fillStrokePoly(
      ctx,
      [
        [headX + 2, headY - 7],
        [headX + 18, headY - 4.5],
        [headX + 13, headY - 2],
        [headX + 1, headY - 4.5],
      ],
      '#09090b',
      '#09090b',
      1.1
    );
    ctx.beginPath();
    ctx.arc(headX + 6, headY - 12, 2.7, 0, Math.PI * 2);
    ctx.fillStyle = pal.goldLight;
    ctx.fill();
  } else if (isStealthCommando(classId) && tier <= 2) {
    // SAS / Commando Slanted Maroon/Green Beret with Cap Badge
    ctx.beginPath();
    ctx.ellipse(headX - 1, headY - 11, 14, 7.2, -0.18, 0, Math.PI * 2);
    ctx.fillStyle = isAxis ? '#374151' : '#881337';
    ctx.fill();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = pal.goldLight;
    ctx.fillRect(headX + 5, headY - 13, 2.6, 3.6);
  } else if (tier === 1 && !isAxis) {
    // Authentic WWI British/US M1917 Brodie Wide-Brimmed Steel Dish Helmet!
    ctx.beginPath();
    ctx.ellipse(headX, headY - 10.5, 13.5, 7.8, 0, Math.PI, 0);
    ctx.fillStyle = vGrad(ctx, headY - 19, headY - 8, pal.armorLight, pal.armorMid, pal.armorDark);
    ctx.fill();
    ctx.strokeStyle = '#10151a';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(headX, headY - 8.8, 19.5, 3.8, -0.05, 0, Math.PI * 2);
    ctx.fillStyle = pal.armorMid;
    ctx.fill();
    ctx.stroke();
  } else if (tier <= 2 && isAxis) {
    // Authentic German M1916 / M40 Stahlhelm with Flared Neck Skirt!
    fillStrokePoly(
      ctx,
      [
        [headX - 15, headY - 4.5],
        [headX - 14, headY - 14],
        [headX - 5, headY - 18],
        [headX + 7, headY - 18],
        [headX + 13.5, headY - 11],
        [headX + 16, headY - 7],
        [headX + 5, headY - 7],
        [headX - 4, headY - 3.5],
      ],
      vGrad(ctx, headY - 18, headY - 3.5, pal.armorLight, pal.armorMid, pal.armorDark),
      '#10151a',
      1.4
    );
  } else {
    // WWII M1 Steel Pot -> PASGT Kevlar -> Ops-Core High-Cut FAST Helmet!
    ctx.beginPath();
    ctx.arc(headX - 0.5, headY - 6.5, 13.6, Math.PI * 0.96, Math.PI * 2.04);
    ctx.closePath();
    ctx.fillStyle = vGrad(ctx, headY - 21, headY - 5, pal.armorLight, pal.armorMid, pal.armorDark);
    ctx.fill();
    ctx.strokeStyle = '#10151a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (medic) {
      ctx.beginPath();
      ctx.arc(headX + 3.5, headY - 12, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(headX + 2.3, headY - 15.5, 2.4, 7);
      ctx.fillRect(headX, headY - 13.2, 7, 2.4);
    } else if (tier === 2) {
      roundRectPath(ctx, headX + 1, headY - 13, 11, 5, 1.8);
      ctx.fillStyle = '#7dd3fc';
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    } else if (tier >= 4) {
      // Quad-Tube GPNVG-18 Panoramic Night-Vision Goggles & ComTac Headset!
      ctx.beginPath();
      ctx.ellipse(headX - 4, headY - 1.5, 3.8, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      drawShadedRod(ctx, headX + 8.5, headY - 11, headX + 19, headY - 8.5, 3, 3, '#475569', '#1e293b', '#09090b', '#09090b', 1.1);
      ctx.beginPath();
      ctx.arc(headX + 20, headY - 8.5, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = '#4ade80';
      ctx.fill();
    }
  }

  // Chinstrap
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(headX - 5, headY - 5);
  ctx.lineTo(headX + 2.5, headY + 11);
  ctx.stroke();

  // 6. AUTHENTIC HISTORICAL & MODERN FIREARMS + MUSCULAR TWO-HANDED ARTICULATED ARMS!
  const shX = cx - 9;
  const shY = shoulderY + 7;

  // Far support arm reaching firmly onto weapon handguard
  drawShadedRod(ctx, cx + 10, shY, cx + 31, shY + 10, 6.2, 5.0, pal.armorMid, pal.armorDark, '#141a12');

  if (officer && wType === 'SWORD' && tier <= 2) {
    // Officer holding Colt M1911 / Mauser C96 / Webley Revolver raised forward + Field Binoculars on chest!
    drawShadedRod(ctx, cx + 27, shY + 6, cx + 52, shY + 1, 2.9, 2.2, '#cbd5e1', '#475569', '#0f172a');
    fillStrokePoly(
      ctx,
      [
        [cx + 25, shY + 5],
        [cx + 31, shY + 5],
        [cx + 29, shY + 15],
        [cx + 24, shY + 15],
      ],
      '#451a03',
      '#09090b',
      1.2
    );
    roundRectPath(ctx, cx - 2, shY + 10, 12, 9, 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (isAntiTankInf(classId) && tier >= 2) {
    // Shoulder-Fired Anti-Tank Launcher: Bazooka/Panzerschreck (T2) -> RPG-7 (T3) -> Javelin (T4)!
    const tubeStart = cx - 34 - (tier >= 4 ? 7 : 0);
    const tubeEnd = cx + 56 + (tier - 2) * 9;
    const tubeR = tier >= 4 ? 6.5 : 5.0;
    drawShadedRod(ctx, tubeStart, shY - 3, tubeEnd, shY - 8, tubeR, tubeR, '#849669', '#4d5d3b', '#232b1a');
    if (tier === 2) {
      fillStrokePoly(ctx, [[cx + 24, shY - 19], [cx + 30, shY - 19], [cx + 30, shY + 4], [cx + 24, shY + 4]], '#576646', '#0f172a', 1.3);
    } else if (tier === 3) {
      fillStrokePoly(
        ctx,
        [
          [tubeEnd, shY - 9],
          [tubeEnd + 12, shY - 14],
          [tubeEnd + 26, shY - 8.5],
          [tubeEnd + 12, shY - 3],
        ],
        '#65774a',
        '#0f172a',
        1.4
      );
    } else {
      roundRectPath(ctx, cx + 14, shY - 2, 19, 14, 3);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 29, shY + 5, 3.8, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
    }
  } else if (isHeavyMg(classId)) {
    // Belt-Fed Heavy Machine Gun: Lewis/Maxim (T1) -> MG42 (T2) -> M60/PKM (T3) -> 6-Barrel M134 Minigun (T4)!
    const gunY = shY + 13;
    const bEnd = cx + 62 + (tier - 1) * 9;
    roundRectPath(ctx, cx + 5, gunY - 5, 29, 11, 2.5);
    ctx.fillStyle = vGrad(ctx, gunY - 5, gunY + 6, '#94a3b8', '#475569', '#1e293b');
    ctx.fill();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    if (tier >= 4) {
      for (let b = -3.5; b <= 3.5; b += 3.5) {
        drawShadedRod(ctx, cx + 33, gunY + b, bEnd, gunY + b - 1, 1.8, 1.8, '#e2e8f0', '#64748b', '#0f172a', '#09090b', 0.8);
      }
      ctx.fillStyle = '#334155';
      ctx.fillRect(bEnd - 14, gunY - 6, 4.5, 12);
      ctx.fillRect(bEnd - 5, gunY - 6, 3.5, 12);
    } else {
      const jacketR = tier === 1 ? 5.0 : 3.4;
      drawShadedRod(ctx, cx + 32, gunY, bEnd, gunY - 2, jacketR, tier === 1 ? 4.4 : 2.6, '#cbd5e1', '#475569', '#0f172a');
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(bEnd - 12, gunY);
      ctx.lineTo(bEnd - 18, gunY + 16);
      ctx.moveTo(bEnd - 12, gunY);
      ctx.lineTo(bEnd - 6, gunY + 16);
      ctx.stroke();
    }
    roundRectPath(ctx, cx + 13, gunY + 6, 13, 13, 2);
    ctx.fillStyle = '#3f4f32';
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.setLineDash([2.4, 1.6]);
    ctx.beginPath();
    ctx.moveTo(cx + 20, gunY + 2);
    ctx.quadraticCurveTo(cx + 27, gunY + 11, cx + 19, gunY + 16);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    // Authentic Rifle / Scoped Sniper / SMG / Tactical Carbine!
    const isLongSniper = isSniper(classId) || (isAntiTankInf(classId) && tier === 1);
    const isCompactSmg = isSmgAssault(classId) || isStealthCommando(classId) || medic;
    const stockCol = tier <= 2 || (tier === 3 && !isCompactSmg && isAxis) ? ['#b87e46', '#7c4a1e', '#3d200a'] : ['#475569', '#1e293b', '#09090b'];

    const buttX = cx + 1;
    const buttY = shY + 11;
    const recX = cx + 19;
    const recY = shY + 7;
    const muzX = cx + (isLongSniper ? 70 + (tier - 1) * 9 : isCompactSmg ? 48 + (tier - 1) * 6 : 58 + (tier - 1) * 7);
    const muzY = shY + (isLongSniper ? 1 : 3.5);

    fillStrokePoly(
      ctx,
      [
        [buttX, buttY - 2.5],
        [recX, recY - 2.5],
        [recX, recY + 3.8],
        [buttX + 1, buttY + 6.5],
      ],
      vGrad(ctx, buttY - 2.5, buttY + 6.5, stockCol[0], stockCol[1], stockCol[2]),
      '#09090b',
      1.3
    );

    drawShadedRod(ctx, recX - 1, recY, recX + 19, recY - 1, 3.5, 3.0, stockCol[0], stockCol[1], stockCol[2]);
    drawShadedRod(ctx, recX + 17, recY - 1, muzX, muzY, 2.2, 1.8, '#e2e8f0', '#64748b', '#1e293b', '#09090b', 1.1);

    if (tier === 1 && !isLongSniper && !isCompactSmg && !medic) {
      fillStrokePoly(
        ctx,
        [
          [muzX - 2, muzY + 1],
          [muzX + 17, muzY],
          [muzX - 2, muzY + 3.8],
        ],
        '#f1f5f9',
        '#334155',
        1
      );
    }

    if (tier >= 2 && !isLongSniper) {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4.4;
      ctx.beginPath();
      ctx.moveTo(recX + 8, recY + 2.5);
      ctx.quadraticCurveTo(recX + 11, recY + 11, recX + 15, recY + 15);
      ctx.stroke();
    }

    if (isLongSniper) {
      drawShadedRod(ctx, recX + 1, recY - 6, recX + 24, recY - 7, 2.8, 3.2, '#94a3b8', '#334155', '#0f172a', '#09090b', 1.1);
      ctx.beginPath();
      ctx.arc(recX + 24.5, recY - 7, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      if (tier >= 2) {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(muzX - 16, muzY + 1);
        ctx.lineTo(muzX - 21, muzY + 17);
        ctx.moveTo(muzX - 16, muzY + 1);
        ctx.lineTo(muzX - 10, muzY + 17);
        ctx.stroke();
      }
    } else if (tier >= 3 || isStealthCommando(classId)) {
      roundRectPath(ctx, recX + 3, recY - 7, 8.5, 4.8, 1.2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      if (isStealthCommando(classId) || tier >= 4) {
        drawShadedRod(ctx, muzX - 2, muzY, muzX + 13, muzY - 0.5, 2.9, 2.9, '#64748b', '#334155', '#0f172a', '#09090b', 1.1);
      }
    }
  }

  // Near Articulated Right Arm (Broad Sleeved Upper Arm + Medic Brassard + Forearm + Gloved Hand on Grip)
  const elbowX = shX + 3;
  const elbowY = shY + 14;
  const handX = cx + 19;
  const handY = shY + (isAntiTankInf(classId) && tier >= 2 ? -2 : 10);
  drawShadedRod(ctx, shX, shY, elbowX, elbowY, 6.8, 5.8, pal.armorLight, pal.armorMid, pal.armorDark);
  if (medic) {
    roundRectPath(ctx, shX - 5.5, shY + 2, 11.5, 7.5, 1.2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(shX - 1.2, shY + 3.2, 2.4, 5.2);
    ctx.fillRect(shX - 2.6, shY + 4.5, 5.2, 2.4);
  }
  drawShadedRod(ctx, elbowX, elbowY, handX, handY, 5.5, 4.6, pal.armorLight, pal.armorMid, pal.armorDark);
  ctx.beginPath();
  ctx.arc(handX + 1.5, handY, 4.0, 0, Math.PI * 2);
  ctx.fillStyle = tier >= 3 ? '#1e293b' : pal.skinMid;
  ctx.fill();
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

// ============================================================================
// 2. BLUEPRINT-ACCURATE TANKS & ARMORED VEHICLES (3/4 TOP-DECK + SIDE PROFILE)
// ============================================================================

function drawArmorCanvas(
  ctx: CanvasRenderingContext2D,
  unit: Unit,
  pal: CharacterPalette,
  tier: UnitTier,
  frame: SpriteAnimFrame,
  animState: SpriteAnimState
) {
  const classId = unit.classId;
  const isBoss = Boolean(unit.isBoss);
  const isAxis = unit.faction === 'ENEMY' || isBoss;
  const rumble = animState === 'walk' ? (frame % 2 === 1 ? -1.5 : 0.5) : 0;
  const rotShift = animState === 'walk' ? frame % 2 : 0;
  const tStep = tier - 1;
  const groundY = 180;

  // SUBTYPE A: WHEELED ARMORED RECON CARS (Rolls-Royce WWI -> Puma/Greyhound -> LAV-25 -> 8x8 Stryker MGS)
  if (isReconCar(classId)) {
    const hullW = 108 + tStep * 18;
    const hullX = Math.round(86 - hullW * 0.5);
    const wheelR = tier >= 3 ? 13.5 : 15;
    const bodyBot = groundY - wheelR * 0.85 + rumble;
    const bodyTop = bodyBot - (tier === 1 ? 24 : 22);

    // 3/4 Top Armor Roof Plane
    fillStrokePoly(
      ctx,
      [
        [hullX + 12, bodyTop + 3],
        [hullX + 20, bodyTop - 4],
        [hullX + hullW - 24, bodyTop - 4],
        [hullX + hullW - 14, bodyTop + 2],
      ],
      pal.mountLight,
      '#10151a',
      1.3
    );

    // Boat-shaped sloped AFV hull
    const hullPts: [number, number][] =
      tier === 1
        ? [
            [hullX + 4, bodyBot],
            [hullX + 2, bodyTop + 6],
            [hullX + 58, bodyTop + 2],
            [hullX + 62, bodyTop + 9],
            [hullX + hullW - 4, bodyTop + 10],
            [hullX + hullW, bodyBot],
          ]
        : [
            [hullX + 6, bodyBot],
            [hullX, bodyTop + 11],
            [hullX + 14, bodyTop + 2],
            [hullX + hullW - 22, bodyTop + 1],
            [hullX + hullW, bodyTop + 12],
            [hullX + hullW - 8, bodyBot],
          ];
    fillStrokePoly(ctx, hullPts, vGrad(ctx, bodyTop, bodyBot, pal.mountLight, pal.mountMid, pal.mountDark), '#10151a', 1.6);

    // Camo patches on T2-T4
    if (tier >= 2) {
      ctx.save();
      polyPath(ctx, hullPts);
      ctx.clip();
      ctx.fillStyle = isAxis ? 'rgba(120, 92, 48, 0.38)' : 'rgba(34, 48, 24, 0.4)';
      ctx.beginPath();
      ctx.ellipse(hullX + hullW * 0.35, bodyTop + 10, 18, 8, 0.25, 0, Math.PI * 2);
      ctx.ellipse(hullX + hullW * 0.72, bodyTop + 14, 16, 7, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawGroundInsignia(ctx, hullX + hullW * 0.42, bodyTop + 12, 4.8, isAxis, tier === 2 && !isAxis);
    // Driver periscope + warm headlight beam
    roundRectPath(ctx, hullX + hullW - 28, bodyTop + 3, 10, 5, 1);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hullX + hullW - 5, bodyTop + 12, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.fill();

    // Recon Turret + Autocannon / 105mm MGS Overhead Gun Pod
    const turW = 34 + tStep * 8;
    const turX = hullX + hullW * 0.28;
    const turY = bodyTop - 16;
    fillStrokePoly(
      ctx,
      [
        [turX, bodyTop - 1],
        [turX + 6, turY],
        [turX + turW - 8, turY],
        [turX + turW + 3, bodyTop - 4],
      ],
      vGrad(ctx, turY, bodyTop, pal.mountLight, pal.mountMid, pal.mountDark),
      '#10151a',
      1.5
    );
    const bEnd = Math.min(184, turX + turW + 24 + tStep * 10);
    drawShadedRod(ctx, turX + turW - 2, turY + 8, bEnd, turY + 6, tier >= 4 ? 3.8 : 2.6, tier >= 4 ? 3.2 : 2.1, '#e2e8f0', '#64748b', '#1e293b');

    // Wheel-well shadow arches + 4x4 -> 6x6 -> 8x8 Tactical Wheels
    const wCount = tier === 1 ? 2 : tier === 2 ? 3 : 4;
    for (let i = 0; i < wCount; i++) {
      const wx = hullX + 20 + ((hullW - 40) * i) / Math.max(1, wCount - 1);
      ctx.beginPath();
      ctx.arc(wx, groundY - wheelR, wheelR + 2.5, Math.PI, 0);
      ctx.fillStyle = '#09090b';
      ctx.fill();
      drawDetailedWheel(ctx, wx, groundY - wheelR, wheelR, pal.mountMid, rotShift * 0.4, tier === 1);
    }
    return;
  }

  // SUBTYPE B: HALF-TRACK (T1) -> M113 APC (T2) -> M2A3 BRADLEY IFV (T3) -> PUMA / BUSK HEAVY IFV (T4)
  if (isApcIfv(classId)) {
    const hullW = 114 + tStep * 17;
    const hullX = Math.round(85 - hullW * 0.5);
    const trackY = 152 + rumble;
    const hullTop = 122 + rumble;

    if (tier === 1) {
      // Authentic WWII M3 / Sd.Kfz. 251 Armored Half-Track (Front Steered Tire + Rear Caterpillar Bogie!)
      fillStrokePoly(
        ctx,
        [
          [hullX + 2, trackY + 2],
          [hullX, hullTop + 2],
          [hullX + 68, hullTop],
          [hullX + 76, hullTop + 10],
          [hullX + hullW - 2, hullTop + 13],
          [hullX + hullW, trackY + 2],
        ],
        vGrad(ctx, hullTop, trackY, pal.mountLight, pal.mountMid, pal.mountDark),
        '#10151a',
        1.6
      );
      drawGroundInsignia(ctx, hullX + 36, hullTop + 14, 5, isAxis, !isAxis);
      // Pintle .50 cal / MG42 with armored gun shield
      drawShadedRod(ctx, hullX + 58, hullTop - 8, hullX + 92, hullTop - 9, 2.2, 1.8, '#cbd5e1', '#475569', '#0f172a');
      fillStrokePoly(ctx, [[hullX + 64, hullTop - 13], [hullX + 69, hullTop - 13], [hullX + 67, hullTop], [hullX + 63, hullTop]], pal.mountLight, '#0f172a', 1.1);

      drawRealisticTrackSystem(ctx, hullX + 2, trackY, hullW * 0.58, 28, 3, pal, rotShift, false);
      drawDetailedWheel(ctx, hullX + hullW - 18, groundY - 14, 14, pal.mountMid, rotShift * 0.4, false);
      return;
    }

    // Tier 2..4 Tracked APC / IFV (M113 -> M2A3 Bradley -> Puma IFV)
    fillStrokePoly(
      ctx,
      [
        [hullX + 8, hullTop],
        [hullX + 16, hullTop - 5],
        [hullX + hullW - 26, hullTop - 5],
        [hullX + hullW - 16, hullTop],
      ],
      pal.mountLight,
      '#10151a',
      1.2
    );
    fillStrokePoly(
      ctx,
      [
        [hullX + 4, trackY + 2],
        [hullX, hullTop + 6],
        [hullX + 10, hullTop],
        [hullX + hullW - 24, hullTop],
        [hullX + hullW, hullTop + 14],
        [hullX + hullW - 8, trackY + 2],
      ],
      vGrad(ctx, hullTop, trackY, pal.mountLight, pal.mountMid, pal.mountDark),
      '#10151a',
      1.6
    );
    drawGroundInsignia(ctx, hullX + 28, hullTop + 14, 4.8, isAxis);
    // Infantry vision blocks
    for (let vx = hullX + 44; vx < hullX + hullW - 32; vx += 16) {
      roundRectPath(ctx, vx, hullTop + 5, 9, 4.5, 1);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
    }
    // IFV Turret + 25mm/30mm Bushmaster Chain Gun + Twin TOW ATGM Pod!
    const turW = 38 + tStep * 8;
    const turX = hullX + hullW * 0.34;
    const turY = hullTop - 18;
    fillStrokePoly(
      ctx,
      [
        [turX, hullTop - 1],
        [turX + 6, turY],
        [turX + turW - 8, turY],
        [turX + turW + 4, hullTop - 3],
      ],
      vGrad(ctx, turY, hullTop, pal.mountLight, pal.mountMid, pal.mountDark),
      '#10151a',
      1.5
    );
    drawShadedRod(ctx, turX + turW, turY + 9, Math.min(184, turX + turW + 26 + tStep * 8), turY + 7, 2.8, 2.2, '#e2e8f0', '#64748b', '#1e293b');
    if (tier >= 3) {
      roundRectPath(ctx, turX + 5, turY - 8, 22, 8, 1.5);
      ctx.fillStyle = pal.armorDark;
      ctx.fill();
      ctx.strokeStyle = '#09090b';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(turX + 26, turY - 4, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
    }
    drawRealisticTrackSystem(ctx, hullX, trackY, hullW, 28, 4 + tStep, pal, rotShift, tier >= 3);
    return;
  }

  // SUBTYPE C: SELF-PROPELLED ANTI-AIRCRAFT (Flak Truck -> Wirbelwind -> Gepard Twin-35mm -> Pantsir/Tunguska)
  if (isSpaaArmor(classId)) {
    const hullW = 114 + tStep * 17;
    const hullX = Math.round(84 - hullW * 0.5);
    const trackY = 151 + rumble;
    const hullTop = 124 + rumble;

    fillStrokePoly(
      ctx,
      [
        [hullX + 4, trackY + 2],
        [hullX, hullTop + 8],
        [hullX + 10, hullTop],
        [hullX + hullW - 22, hullTop],
        [hullX + hullW, hullTop + 13],
        [hullX + hullW - 6, trackY + 2],
      ],
      vGrad(ctx, hullTop, trackY, pal.mountLight, pal.mountMid, pal.mountDark),
      '#10151a',
      1.6
    );
    const turW = 42 + tStep * 8;
    const turX = hullX + 24;
    const turY = hullTop - 24;
    fillStrokePoly(
      ctx,
      [
        [turX, hullTop],
        [turX + 6, turY],
        [turX + turW - 8, turY],
        [turX + turW + 4, turY + 14],
        [turX + turW, hullTop],
      ],
      vGrad(ctx, turY, hullTop, pal.mountLight, pal.mountMid, pal.mountDark),
      '#10151a',
      1.5
    );
    drawGroundInsignia(ctx, turX + 18, turY + 13, 4.5, isAxis);

    // Skyward-elevated Twin Oerlikon / 2A38M Autocannons + SAM Canisters + Search/Track Radars!
    const gEndX = Math.min(182, turX + turW + 30 + tStep * 8);
    const gEndY = 66 - tStep * 4 + rumble;
    drawShadedRod(ctx, turX + turW - 4, turY + 9, gEndX, gEndY, 2.8, 2.1, '#e2e8f0', '#64748b', '#1e293b');
    if (tier >= 2) {
      drawShadedRod(ctx, turX + turW - 1, turY + 15, gEndX + 3, gEndY + 7, 2.8, 2.1, '#cbd5e1', '#475569', '#0f172a');
    }
    if (tier >= 3) {
      // Rear search radar dish + Front spherical tracking radome (Gepard / Tunguska signature!)
      ctx.save();
      ctx.translate(turX + 6, turY - 10);
      ctx.rotate(-0.25);
      ctx.beginPath();
      ctx.ellipse(0, 0, 5, 12, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#cbd5e1';
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(turX + turW - 4, turY + 8, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.stroke();
    }
    if (tier >= 4) {
      // Quad surface-to-air missile canisters
      drawShadedRod(ctx, turX + 14, turY + 6, turX + 44, turY - 6, 4.5, 4.5, '#94a3b8', '#475569', '#1e293b');
    }
    drawRealisticTrackSystem(ctx, hullX, trackY, hullW, 29, 5 + Math.min(2, tStep), pal, rotShift, tier >= 3);
    return;
  }

  // SUBTYPE D: SLOPED CASEMATE TANK DESTROYERS (StuG III -> Jagdpanther / SU-100 -> Modern Composite TD)
  if (isTankDestroyer(classId)) {
    const tdW = 114 + tStep * 18;
    const tdX = Math.round(80 - tdW * 0.5);
    const trackY = 150 + rumble;
    const deckY = 126 + rumble;
    const caseTop = 98 - tStep * 2 + rumble;

    // 3/4 Casemate Roof Plane
    fillStrokePoly(
      ctx,
      [
        [tdX + 36, caseTop],
        [tdX + 44, caseTop - 5],
        [tdX + tdW - 34, caseTop - 5],
        [tdX + tdW - 28, caseTop],
      ],
      pal.mountLight,
      '#10151a',
      1.2
    );

    // Sleek continuous 55-degree sloped Jagdpanther / SU-100 casemate hull
    const casePts: [number, number][] = [
      [tdX + 4, trackY + 2],
      [tdX, deckY + 6],
      [tdX + 10, deckY],
      [tdX + 30, deckY],
      [tdX + 40, caseTop],
      [tdX + tdW - 30, caseTop],
      [tdX + tdW, deckY + 14],
      [tdX + tdW - 8, trackY + 2],
    ];
    fillStrokePoly(ctx, casePts, vGrad(ctx, caseTop, trackY, pal.mountLight, pal.mountMid, pal.mountDark), '#10151a', 1.6);

    // Ambush camouflage blotches
    if (tier >= 2) {
      ctx.save();
      polyPath(ctx, casePts);
      ctx.clip();
      ctx.fillStyle = isAxis ? 'rgba(133, 94, 46, 0.42)' : 'rgba(38, 52, 26, 0.42)';
      ctx.beginPath();
      ctx.ellipse(tdX + 56, caseTop + 16, 16, 8, 0.3, 0, Math.PI * 2);
      ctx.ellipse(tdX + tdW - 36, caseTop + 18, 14, 7, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawGroundInsignia(ctx, tdX + 56, caseTop + 14, 4.8, isAxis);
    // Cast Saukopf ("Boar's Head") Collar Mantlet + Long 88mm Pak 43 / 125mm Anti-Tank Cannon!
    const mx = tdX + tdW - 22;
    const my = caseTop + 13;
    ctx.beginPath();
    ctx.ellipse(mx, my, 10, 7.5, 0.1, 0, Math.PI * 2);
    ctx.fillStyle = vGrad(ctx, my - 8, my + 8, pal.mountLight, pal.mountMid, pal.mountDark);
    ctx.fill();
    ctx.strokeStyle = '#10151a';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    const bEnd = Math.min(186, tdX + tdW + 34 + tStep * 8);
    drawShadedRod(ctx, mx + 6, my, bEnd, my - 3, tier >= 3 ? 4.4 : 3.6, tier >= 3 ? 3.4 : 2.8, '#e2e8f0', '#64748b', '#1e293b');
    // Double-baffle muzzle brake
    roundRectPath(ctx, bEnd - 9, my - 7.5, 10, 9, 1.5);
    ctx.fillStyle = '#64748b';
    ctx.fill();
    ctx.stroke();

    drawRealisticTrackSystem(ctx, tdX, trackY, tdW, 30, 5 + Math.min(2, tStep), pal, rotShift, tier >= 2, isAxis && tier === 2);
    return;
  }

  // SUBTYPE E & F: MAIN BATTLE TANKS (FT-17 / Mk.V -> Sherman / Tiger I -> M60/T-72 ERA -> M1A2 Abrams / Leopard 2A7!)
  const heavy = isHeavyTank(classId) || isBoss;

  // Special Historical Icon: WWI Tier 1 Heavy Tank = British Mark V Rhomboid Tank!
  if (tier === 1 && heavy) {
    const rw = 122;
    const rx = 34;
    const topY = 114 + rumble;
    const botY = groundY;
    // Roof commander observation cab + wooden unditching beam + exhaust muffler
    fillStrokePoly(
      ctx,
      [
        [rx + 46, topY + 4],
        [rx + 50, topY - 8],
        [rx + 78, topY - 8],
        [rx + 82, topY + 2],
      ],
      vGrad(ctx, topY - 8, topY + 4, pal.mountLight, pal.mountMid, pal.mountDark),
      '#10151a',
      1.4
    );
    roundRectPath(ctx, rx + 24, topY - 3, 20, 6, 1.5);
    ctx.fillStyle = '#78350f';
    ctx.fill();
    ctx.stroke();

    // Iconic Wrap-Around Diamond Rhomboid Caterpillar Track Frame!
    const rhomboidPts: [number, number][] = [
      [rx, topY + 26],
      [rx + 18, topY + 6],
      [rx + rw - 24, topY],
      [rx + rw, topY + 20],
      [rx + rw - 18, botY],
      [rx + 14, botY],
    ];
    fillStrokePoly(ctx, rhomboidPts, '#27272a', '#09090b', 2);

    // Track cleats around top & bottom runs
    ctx.fillStyle = '#52525b';
    for (let tx = rx + 20; tx < rx + rw - 24; tx += 9) {
      ctx.fillRect(tx + (rotShift % 6), topY + 2, 4, 3);
      ctx.fillRect(tx - (rotShift % 6), botY - 4, 4, 3);
    }

    // Inner riveted armored rhomboid hull plate
    const innerPts: [number, number][] = [
      [rx + 7, topY + 26],
      [rx + 22, topY + 12],
      [rx + rw - 26, topY + 7],
      [rx + rw - 8, topY + 22],
      [rx + rw - 22, botY - 6],
      [rx + 18, botY - 6],
    ];
    fillStrokePoly(ctx, innerPts, vGrad(ctx, topY + 7, botY - 6, pal.mountLight, pal.mountMid, pal.mountDark), '#10151a', 1.5);

    // British Red-White-Red Tank Corps recognition stripes (or Balkenkreuz for Axis A7V/Beutepanzer)
    if (!isAxis) {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(rx + rw - 26, topY + 13, 4, 14);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(rx + rw - 22, topY + 13, 4, 14);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(rx + rw - 18, topY + 13, 4, 14);
    } else {
      drawGroundInsignia(ctx, rx + 34, topY + 28, 5.5, true);
    }

    // Side armored sponson + 6-pounder Hotchkiss cannon + Hotchkiss MG port!
    roundRectPath(ctx, rx + 50, topY + 18, 32, 24, 3);
    ctx.fillStyle = vGrad(ctx, topY + 18, topY + 42, pal.mountLight, pal.mountMid, pal.mountDark);
    ctx.fill();
    ctx.stroke();
    roundRectPath(ctx, rx + 58, topY + 9, 10, 4, 1);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    drawShadedRod(ctx, rx + 78, topY + 28, rx + 116, topY + 26, 3.8, 2.9, '#e2e8f0', '#64748b', '#1e293b');
    drawShadedRod(ctx, rx + 76, topY + 35, rx + 96, topY + 35, 2.0, 1.6, '#cbd5e1', '#475569', '#0f172a');
    return;
  }

  const effHullW = 108 + tStep * 18 + (heavy ? 6 : 0);
  const effHullX = Math.max(6, Math.round(79 - effHullW * 0.5));
  const trackY = 150 + rumble;
  const hullTop = (tier === 1 ? 120 : tier === 2 && !isAxis ? 120 : 124) + rumble;

  // 3/4 Sloped Engine Deck & Glacis Roof Plane (gives authentic 3D tank depth!)
  fillStrokePoly(
    ctx,
    [
      [effHullX + 10, hullTop + 1],
      [effHullX + 18, hullTop - 5],
      [effHullX + effHullW - 26, hullTop - 4],
      [effHullX + effHullW - 18, hullTop + 2],
    ],
    pal.mountLight,
    '#10151a',
    1.2
  );

  // Sculpted Tank Hull Side & Sloped Upper Glacis
  const hullPts: [number, number][] = [
    [effHullX + 5, trackY + 2],
    [effHullX, hullTop + 9],
    [effHullX + 10, hullTop],
    [effHullX + effHullW - 24, hullTop + 1],
    [effHullX + effHullW, hullTop + 13],
    [effHullX + effHullW - 10, trackY + 2],
  ];
  fillStrokePoly(ctx, hullPts, vGrad(ctx, hullTop, trackY, pal.mountLight, pal.mountMid, pal.mountDark), '#10151a', 1.6);

  // Multi-tone historical camo (WWII Ambush / NATO 3-color Woodland)
  if (tier >= 2) {
    ctx.save();
    polyPath(ctx, hullPts);
    ctx.clip();
    ctx.fillStyle = isAxis ? 'rgba(138, 102, 52, 0.4)' : 'rgba(34, 48, 24, 0.42)';
    ctx.beginPath();
    ctx.ellipse(effHullX + effHullW * 0.28, hullTop + 12, 18, 8, 0.2, 0, Math.PI * 2);
    ctx.ellipse(effHullX + effHullW * 0.72, hullTop + 14, 16, 7, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // WWI Renault FT-17 Trench-Crossing Tail Skid!
  if (tier === 1) {
    fillStrokePoly(
      ctx,
      [
        [effHullX - 10, trackY],
        [effHullX + 3, hullTop + 8],
        [effHullX + 6, trackY],
      ],
      '#3f3f46',
      '#09090b',
      1.3
    );
  }

  // Rear external cylindrical fuel drums (T2-T3) + Engine deck radiator grille + Tow cable
  if (tier === 2 || tier === 3) {
    drawShadedRod(ctx, effHullX - 2, hullTop + 5, effHullX + 8, hullTop + 5, 4.5, 4.5, '#94a3b8', '#475569', '#1e293b');
  }
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(effHullX + 16, hullTop + 12);
  ctx.quadraticCurveTo(effHullX + effHullW * 0.45, hullTop + 19, effHullX + effHullW - 26, hullTop + 12);
  ctx.stroke();

  // Turret Ring Ambient Occlusion Shadow
  const turW = 42 + tStep * 14 + (heavy ? 6 : 0);
  const turX = effHullX + Math.round((effHullW - turW) * 0.45);
  const turY = (tier === 1 ? 95 : tier === 2 ? 96 : 99) - (heavy ? 2 : 0) + rumble;
  ctx.fillStyle = 'rgba(9, 13, 20, 0.48)';
  ctx.beginPath();
  ctx.ellipse(turX + turW * 0.48, hullTop, turW * 0.52, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Era-Authentic Turret Blueprint!
  if (tier >= 3) {
    // Tier 3 (M60/T-72 with ERA bricks) -> Tier 4 (M1A2 Abrams / Leopard 2A7 Angular Wedge Chobham Turret!)
    // 3/4 Turret Roof Plane
    fillStrokePoly(
      ctx,
      [
        [turX - 6, turY + 2],
        [turX + 4, turY - 5],
        [turX + turW - 8, turY - 5],
        [turX + turW + 10, turY + 8],
      ],
      pal.mountLight,
      '#10151a',
      1.2
    );

    const wedgePts: [number, number][] = [
      [turX - 10, turY + 13],
      [turX - 6, turY + 1],
      [turX + turW - 10, turY],
      [turX + turW + 15, turY + 12],
      [turX + turW, hullTop + 1],
      [turX + 2, hullTop + 1],
    ];
    fillStrokePoly(ctx, wedgePts, vGrad(ctx, turY, hullTop + 1, pal.mountLight, pal.mountMid, pal.mountDark), '#10151a', 1.6);

    // Bustle stowage basket + Smoke grenade discharger cluster
    roundRectPath(ctx, turX - 18, turY + 2, 11, 11, 1.5);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.stroke();

    if (tier === 3) {
      // Kontakt-1 ERA Reactive Armor Bricks along turret cheek!
      for (let b = 0; b < 3; b++) {
        roundRectPath(ctx, turX + turW - 16 + b * 7, turY + 5 + b * 1.5, 6, 8, 1);
        ctx.fillStyle = pal.armorLight;
        ctx.fill();
        ctx.stroke();
      }
    } else {
      // Trophy APS Radar Panel + 3-tube Smoke Dischargers on Abrams/Leopard 2A7!
      roundRectPath(ctx, turX + 12, turY + 5, 14, 7, 1.5);
      ctx.fillStyle = '#cbd5e1';
      ctx.fill();
      ctx.stroke();
      for (let s = 0; s < 3; s++) {
        drawShadedRod(ctx, turX + turW - 10 + s * 3.5, turY + 9, turX + turW - 4 + s * 3.5, turY + 4, 1.3, 1.3, '#e2e8f0', '#64748b', '#1e293b', '#09090b', 0.7);
      }
    }
    drawGroundInsignia(ctx, turX + turW * 0.45, turY + 12, 4.5, isAxis);
  } else if (tier === 2) {
    // WWII Cast Rounded M4 Sherman Turret (Allied) vs Slab-Sided Panzer VI Tiger I Turret with Drum Mantlet (Axis)!
    if (!isAxis && !heavy) {
      ctx.beginPath();
      ctx.moveTo(turX, hullTop);
      ctx.quadraticCurveTo(turX - 2, turY, turX + 18, turY);
      ctx.lineTo(turX + turW - 8, turY);
      ctx.quadraticCurveTo(turX + turW + 4, turY + 4, turX + turW, hullTop);
      ctx.closePath();
      ctx.fillStyle = vGrad(ctx, turY, hullTop, pal.mountLight, pal.mountMid, pal.mountDark);
      ctx.fill();
      ctx.strokeStyle = '#10151a';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    } else {
      fillStrokePoly(
        ctx,
        [
          [turX, hullTop],
          [turX + 3, turY + 2],
          [turX + turW - 4, turY + 1],
          [turX + turW + 2, hullTop],
        ],
        vGrad(ctx, turY, hullTop, pal.mountLight, pal.mountMid, pal.mountDark),
        '#10151a',
        1.6
      );
    }
    // Rounded cast gun mantlet
    roundRectPath(ctx, turX + turW - 4, turY + 5, 10, 15, 3.5);
    ctx.fillStyle = pal.mountLight;
    ctx.fill();
    ctx.stroke();
    drawGroundInsignia(ctx, turX + turW * 0.42, turY + 13, 4.8, isAxis, !isAxis);
  } else {
    // WWI Renault FT-17 Octagonal Riveted Turret with Dome Cupola!
    fillStrokePoly(
      ctx,
      [
        [turX + 2, hullTop],
        [turX + 6, turY + 2],
        [turX + turW - 6, turY + 2],
        [turX + turW - 2, hullTop],
      ],
      vGrad(ctx, turY, hullTop, pal.mountLight, pal.mountMid, pal.mountDark),
      '#10151a',
      1.5
    );
    ctx.beginPath();
    ctx.arc(turX + turW * 0.48, turY + 2, 8, Math.PI, 0);
    ctx.fillStyle = pal.mountLight;
    ctx.fill();
    ctx.stroke();
  }

  // Commander Cupola, CITV Thermal Viewer & Pintle .50 Cal M2HB Machine Gun (T2 Sherman & T4 Abrams!)
  roundRectPath(ctx, turX + 8, turY - 8, 15, 6, 1.5);
  ctx.fillStyle = pal.mountDark;
  ctx.fill();
  ctx.stroke();
  if ((tier === 2 && !isAxis) || tier >= 4) {
    drawShadedRod(ctx, turX + 16, turY - 12, turX + 46, turY - 13, 1.8, 1.4, '#cbd5e1', '#475569', '#0f172a');
    if (tier >= 4) {
      // Independent CITV commander thermal sight
      roundRectPath(ctx, turX + 28, turY - 13, 10, 9, 2);
      ctx.fillStyle = '#64748b';
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(turX + 34, turY - 11, 3, 5);
    }
  }

  // Main Tank Cannon (37mm -> 76mm/88mm -> 105mm -> 120mm L/55 in Thermal Sleeve with Bore Evacuator!)
  const bStart = turX + turW + (tier >= 3 ? 10 : 4);
  const bEnd = Math.min(186, tier === 1 ? bStart + 18 : bStart + 32 + tStep * 11);
  const gunY = turY + 12;
  const r0 = heavy || tier >= 3 ? 4.4 : 3.3;
  const r1 = heavy || tier >= 3 ? 3.5 : 2.6;
  drawShadedRod(ctx, bStart - 3, gunY, bEnd, gunY - 2, r0, r1, '#e2e8f0', tier >= 4 ? pal.mountMid : '#64748b', '#1e293b');
  if (tier >= 3) {
    // Mid-barrel cylindrical Bore Evacuator (Fume Extractor)!
    const midBx = (bStart + bEnd) * 0.46;
    drawShadedRod(ctx, midBx - 8, gunY - 0.8, midBx + 8, gunY - 1.1, r0 + 1.8, r0 + 1.8, pal.mountLight, pal.mountMid, pal.mountDark);
  }
  if (heavy || tier === 2) {
    roundRectPath(ctx, bEnd - 9, gunY - 6, 10, 8.5, 1.5);
    ctx.fillStyle = '#64748b';
    ctx.fill();
    ctx.stroke();
  }

  drawRealisticTrackSystem(
    ctx,
    Math.max(5, effHullX - 2),
    trackY,
    Math.min(178, effHullW + 4),
    30,
    4 + Math.min(3, tStep),
    pal,
    rotShift,
    tier >= 3 || (heavy && tier >= 2),
    isAxis && tier === 2
  );
}

// ============================================================================
// 3. BLUEPRINT-ACCURATE ARTILLERY, ROCKET BATTERIES & BALLISTIC TELS
// ============================================================================

function drawArtilleryCanvas(
  ctx: CanvasRenderingContext2D,
  unit: Unit,
  pal: CharacterPalette,
  tier: UnitTier,
  frame: SpriteAnimFrame,
  animState: SpriteAnimState
) {
  const classId = unit.classId;
  const isAxis = unit.faction === 'ENEMY';
  const rumble = animState === 'walk' ? (frame % 2 === 1 ? -1.5 : 0.5) : 0;
  const rotShift = animState === 'walk' ? frame % 2 : 0;
  const tStep = tier - 1;
  const groundY = 180;

  // TIER 3 & TIER 4: SELF-PROPELLED HOWITZER (Paladin/PzH2000), MLRS / TOS-1A & 8x8 ISKANDER/SCUD TEL!
  if (tier >= 3) {
    const chasW = tier >= 4 ? 168 : 150;
    const chasX = Math.round(92 - chasW * 0.5);

    if (isSiegeMissile(classId)) {
      // Heavy 8x8 MAZ-543 Scud-B (T3) -> MZKT-7930 Iskander-M Ballistic Missile TEL Truck (T4)!
      const wheelR = 13.5;
      const bedY = groundY - wheelR * 1.45 + rumble;

      // Elevated Tactical Ballistic Missile(s) on Hydraulic Erector Cradle!
      drawShadedRod(ctx, chasX + 18, bedY + 2, 166, tier >= 4 ? 26 : 36, tier >= 4 ? 9.5 : 8, tier >= 4 ? 7.5 : 6.5, '#f8fafc', '#cbd5e1', '#475569');
      // Red/Orange Warhead Nose Cone!
      fillStrokePoly(
        ctx,
        [
          [162, (tier >= 4 ? 26 : 36) - 8],
          [184, (tier >= 4 ? 16 : 26)],
          [167, (tier >= 4 ? 26 : 36) + 7],
        ],
        '#dc2626',
        '#0f172a',
        1.4
      );
      // Hydraulic lifting piston
      drawShadedRod(ctx, chasX + 68, bedY + 2, 114, 78, 3.2, 2.4, '#e2e8f0', '#94a3b8', '#334155');

      // Multi-axle armored truck chassis + Forward angled armored 8x8 crew cab
      roundRectPath(ctx, chasX, bedY, chasW - 42, 16, 2);
      ctx.fillStyle = vGrad(ctx, bedY, bedY + 16, pal.mountLight, pal.mountMid, pal.mountDark);
      ctx.fill();
      ctx.strokeStyle = '#10151a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const cabX = chasX + chasW - 46;
      const cabTop = bedY - 26;
      fillStrokePoly(
        ctx,
        [
          [cabX, bedY + 15],
          [cabX, cabTop],
          [cabX + 32, cabTop],
          [cabX + 46, cabTop + 16],
          [cabX + 46, bedY + 15],
        ],
        vGrad(ctx, cabTop, bedY + 15, pal.mountLight, pal.mountMid, pal.mountDark),
        '#10151a',
        1.6
      );
      fillStrokePoly(
        ctx,
        [
          [cabX + 22, cabTop + 4],
          [cabX + 32, cabTop + 4],
          [cabX + 41, cabTop + 15],
          [cabX + 22, cabTop + 15],
        ],
        '#38bdf8',
        '#0f172a',
        1.2
      );
      drawGroundInsignia(ctx, cabX + 11, cabTop + 16, 4.5, isAxis);

      for (let i = 0; i < 4; i++) {
        const wx = chasX + 18 + ((chasW - 36) * i) / 3;
        drawDetailedWheel(ctx, wx, groundY - wheelR, wheelR, pal.mountMid, rotShift * 0.4);
      }
      return;
    }

    const trackY = 150 + rumble;
    const hullTop = 124 + rumble;
    fillStrokePoly(
      ctx,
      [
        [chasX + 4, trackY + 2],
        [chasX, hullTop + 8],
        [chasX + 10, hullTop],
        [chasX + chasW - 22, hullTop],
        [chasX + chasW, hullTop + 14],
        [chasX + chasW - 8, trackY + 2],
      ],
      vGrad(ctx, hullTop, trackY, pal.mountLight, pal.mountMid, pal.mountDark),
      '#10151a',
      1.6
    );

    if (isThermoRocket(classId) || (tier >= 4 && !isHowitzer(classId))) {
      // TOS-1A Solntsepyok / M270 MLRS Armored Multi-Cell Thermobaric Rocket Box!
      ctx.save();
      ctx.translate(chasX + 64, hullTop - 22);
      ctx.rotate(-0.34);
      roundRectPath(ctx, -44, -18, 92, 32, 3);
      ctx.fillStyle = vGrad(ctx, -18, 14, pal.mountLight, pal.mountMid, pal.mountDark);
      ctx.fill();
      ctx.strokeStyle = '#10151a';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      // Rocket warhead grid at front face
      roundRectPath(ctx, 36, -15, 11, 26, 1.5);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      for (let ry = -11; ry <= 8; ry += 6) {
        ctx.beginPath();
        ctx.arc(42, ry, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#f97316';
        ctx.fill();
      }
      drawGroundInsignia(ctx, -10, -2, 5, isAxis);
      ctx.restore();
    } else {
      // M109A6 Paladin / PzH 2000 Self-Propelled 155mm Howitzer!
      const turTop = 90 + rumble;
      fillStrokePoly(
        ctx,
        [
          [chasX + 6, hullTop],
          [chasX + 12, turTop],
          [chasX + 78, turTop],
          [chasX + 92, turTop + 16],
          [chasX + 88, hullTop],
        ],
        vGrad(ctx, turTop, hullTop, pal.mountLight, pal.mountMid, pal.mountDark),
        '#10151a',
        1.6
      );
      drawGroundInsignia(ctx, chasX + 42, turTop + 17, 5, isAxis);
      // Long 155mm L/52 Howitzer Barrel + Bore Evacuator + Double-Baffle Muzzle Brake
      drawShadedRod(ctx, chasX + 86, turTop + 14, 182, 42 + rumble, 5, 3.8, '#e2e8f0', '#64748b', '#1e293b');
      drawShadedRod(ctx, 126, 74 + rumble, 144, 63 + rumble, 6.8, 6.8, pal.mountLight, pal.mountMid, pal.mountDark);
      roundRectPath(ctx, 174, 36 + rumble, 11, 10, 1.5);
      ctx.fillStyle = '#64748b';
      ctx.fill();
      ctx.stroke();
    }

    drawRealisticTrackSystem(ctx, chasX, trackY, chasW, 30, 6, pal, rotShift, tier >= 4);
    return;
  }

  // TIER 1 (WWI 75mm Field Gun) -> TIER 2 (WWII 155mm Howitzer / 15cm Nebelwerfer 41 Rocket Mortar + Crewman!)
  const trailStart = tier === 1 ? 28 : 16;
  const wheelR = tier === 1 ? 21 : 22;

  // Tier 2 Stacked Sandbag Parapet & Gleaming Brass 155mm Shell Casings!
  if (tier === 2) {
    for (let sx = 122; sx <= 150; sx += 14) {
      roundRectPath(ctx, sx, groundY - 9, 15, 8, 3.5);
      ctx.fillStyle = '#a8946e';
      ctx.fill();
      ctx.strokeStyle = '#3f3522';
      ctx.lineWidth = 1.1;
      ctx.stroke();
      roundRectPath(ctx, sx + 4, groundY - 16, 14, 7.5, 3.5);
      ctx.fillStyle = '#bfab82';
      ctx.fill();
      ctx.stroke();
    }
    for (let s = 0; s < 3; s++) {
      drawShadedRod(ctx, 18 + s * 6, groundY - 14, 18 + s * 6, groundY - 1, 2.2, 2.2, '#fef08a', '#d97706', '#78350f', '#451a03', 0.8);
    }
  }

  // Split-Trail Steel Box Beam + Recoil Spade
  fillStrokePoly(
    ctx,
    [
      [trailStart, groundY - 2],
      [trailStart + 6, groundY - 9],
      [104, 142 + rumble],
      [106, 151 + rumble],
      [trailStart + 12, groundY],
    ],
    vGrad(ctx, 142, groundY, pal.mountLight, pal.mountMid, pal.mountDark),
    '#10151a',
    1.5
  );

  // Realistic Kneeling Artillery Gunner Crewman Pulling Lanyard behind Breech!
  const gx = tier === 1 ? 56 : 46;
  const gy = 114 + rumble;
  drawShadedRod(ctx, gx - 4, gy + 28, gx - 16, groundY - 4, 5.8, 4.5, pal.armorLight, pal.armorMid, pal.armorDark);
  drawShadedRod(ctx, gx + 4, gy + 26, gx + 16, groundY - 6, 6, 4.8, pal.armorLight, pal.armorMid, pal.armorDark);
  drawBoot(ctx, gx + 16, groundY, 12, 1);
  fillStrokePoly(
    ctx,
    [
      [gx - 9, gy + 2],
      [gx + 8, gy],
      [gx + 10, gy + 28],
      [gx - 8, gy + 30],
    ],
    vGrad(ctx, gy, gy + 30, pal.armorLight, pal.armorMid, pal.armorDark),
    '#10151a',
    1.4
  );
  ctx.beginPath();
  ctx.arc(gx + 1, gy - 8, 7.5, 0, Math.PI * 2);
  ctx.fillStyle = pal.skinMid;
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(gx, gy - 12, 11, 5, -0.05, Math.PI, 0);
  ctx.fillStyle = pal.armorMid;
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(gx, gy - 11, 13, 2.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = pal.armorDark;
  ctx.fill();
  drawShadedRod(ctx, gx + 5, gy + 8, 82, 124 + rumble, 4, 3.2, pal.armorLight, pal.armorMid, pal.armorDark);

  // Ordnance Barrel OR WWII 6-Tube 15cm Nebelwerfer Rocket Cluster!
  if (isThermoRocket(classId) && tier === 2) {
    drawShadedRod(ctx, 84, 124 + rumble, 152, 62 + rumble, 12, 12, '#cbd5e1', '#64748b', '#1e293b');
    ctx.beginPath();
    ctx.ellipse(152, 62 + rumble, 9, 11, 0.6, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    for (let c = 0; c < 6; c++) {
      const a = (c * Math.PI) / 3;
      ctx.beginPath();
      ctx.arc(152 + Math.cos(a) * 5, 62 + rumble + Math.sin(a) * 5, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316';
      ctx.fill();
    }
  } else {
    const bEnd = tier === 1 ? 156 : 176;
    const bTopY = tier === 1 ? 74 : 54;
    // Sliding wedge breech + brass recoil cylinder + tapered ordnance barrel
    roundRectPath(ctx, 76, 116 + rumble, 15, 13, 2);
    ctx.fillStyle = '#64748b';
    ctx.fill();
    ctx.stroke();
    drawShadedRod(ctx, 86, 127 + rumble, 124, 102 + rumble, 4.2, 3.6, pal.goldLight, pal.mountMid, pal.mountDark);
    drawShadedRod(ctx, 84, 120 + rumble, bEnd, bTopY + rumble, tier === 1 ? 4.8 : 6.2, tier === 1 ? 3.5 : 4.6, '#e2e8f0', '#64748b', '#1e293b');
    if (tier === 2) {
      roundRectPath(ctx, bEnd - 9, bTopY - 6 + rumble, 11, 11, 1.5);
      ctx.fillStyle = '#64748b';
      ctx.fill();
      ctx.stroke();
    }
  }

  // Riveted Sloped Armored Gun Shield
  fillStrokePoly(
    ctx,
    [
      [108, 146 + rumble],
      [90, 96 - tStep * 4 + rumble],
      [98, 94 - tStep * 4 + rumble],
      [116, 144 + rumble],
    ],
    vGrad(ctx, 94, 146, pal.mountLight, pal.mountMid, pal.mountDark),
    '#10151a',
    1.5
  );

  // Authentic WWI Spoked Wood/Iron Wheel (T1) -> WWII Pneumatic Artillery Carriage Wheel (T2)
  drawDetailedWheel(ctx, 103, groundY - wheelR, wheelR, pal.mountMid, rotShift * 0.35, tier === 1);
}

// ============================================================================
// 4. BLUEPRINT-ACCURATE 3/4 ISOMETRIC AIRCRAFT & ATTACK HELICOPTERS
// ============================================================================

function drawPropBlurDisc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rot: number,
  spinnerCol: string,
  frame: SpriteAnimFrame
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  // Translucent high-speed propeller motion blur disc
  const g = ctx.createRadialGradient(0, 0, 1, 0, 0, ry);
  g.addColorStop(0, 'rgba(226, 232, 240, 0.55)');
  g.addColorStop(0.75, 'rgba(148, 163, 184, 0.25)');
  g.addColorStop(1, 'rgba(148, 163, 184, 0.05)');
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.38)';
  ctx.lineWidth = 0.9;
  ctx.stroke();

  // Animated propeller blade streak
  const bladeA = (frame * Math.PI) / 4;
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.72)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(Math.cos(bladeA) * rx * 0.85, Math.sin(bladeA) * ry * 0.92);
  ctx.lineTo(-Math.cos(bladeA) * rx * 0.85, -Math.sin(bladeA) * ry * 0.92);
  ctx.stroke();

  // Aerodynamic nose spinner cone
  ctx.beginPath();
  ctx.ellipse(1.5, 0, 4.5, 3.8, 0, 0, Math.PI * 2);
  ctx.fillStyle = spinnerCol;
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawAfterburnerPlume(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, r: number) {
  ctx.save();
  const g = ctx.createLinearGradient(x, y, x - len, y - len * 0.14);
  g.addColorStop(0, '#fef08a');
  g.addColorStop(0.35, '#f97316');
  g.addColorStop(0.75, 'rgba(239, 68, 68, 0.55)');
  g.addColorStop(1, 'rgba(239, 68, 68, 0)');
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x - len * 0.6, y - r * 0.6, x - len, y - len * 0.14);
  ctx.quadraticCurveTo(x - len * 0.6, y + r * 0.5, x, y + r);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();

  // Mach shock diamonds inside plume!
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  for (let d = 1; d <= 2; d++) {
    ctx.beginPath();
    ctx.ellipse(x - d * (len * 0.26), y - d * 0.8, 2.5, 1.3, 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawAircraftCanvas(
  ctx: CanvasRenderingContext2D,
  unit: Unit,
  pal: CharacterPalette,
  tier: UnitTier,
  frame: SpriteAnimFrame,
  animState: SpriteAnimState
) {
  const classId = unit.classId;
  const isAxis = unit.faction === 'ENEMY';
  const hover = Math.sin((frame / 4) * Math.PI * 2) * 3.5 + (animState === 'selected' ? -3.5 : 0);
  const cy = 96 + hover;
  const tStep = tier - 1;

  // LINEAGE C (T3-T4): Mi-24V HIND GUNSHIP (T3) -> AH-64D APACHE LONGBOW ATTACK HELICOPTER (T4)!
  if (isHeliTransport(classId) && tier >= 3) {
    const isApache = tier >= 4;
    const tailX = isApache ? 14 : 24;
    const noseX = isApache ? 166 : 156;

    // 1. Far Stub Wing
    fillStrokePoly(
      ctx,
      [
        [98, cy - 5],
        [118, cy - 3],
        [124, cy - (isApache ? 22 : 17)],
        [106, cy - (isApache ? 23 : 18)],
      ],
      pal.mountDark,
      '#10151a',
      1.3
    );

    // 2. Tapered Tail Boom + Swept Vertical Tail Fin + Translucent 4-Blade X-Tail Rotor!
    fillStrokePoly(
      ctx,
      [
        [tailX, cy - 8],
        [82, cy - 10],
        [84, cy + 7],
        [tailX + 4, cy + 1],
      ],
      vGrad(ctx, cy - 10, cy + 7, pal.mountLight, pal.mountMid, pal.mountDark),
      '#10151a',
      1.5
    );
    fillStrokePoly(
      ctx,
      [
        [tailX - 2, cy - (isApache ? 36 : 30)],
        [tailX + 9, cy - (isApache ? 36 : 30)],
        [tailX + 19, cy - 6],
        [tailX + 2, cy + 1],
      ],
      vGrad(ctx, cy - 36, cy + 1, pal.mountLight, pal.mountMid, pal.mountDark),
      '#10151a',
      1.5
    );
    // Tailwheel
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(tailX + 12, cy + 1);
    ctx.lineTo(tailX + 8, cy + 13);
    ctx.stroke();
    drawDetailedWheel(ctx, tailX + 8, cy + 14, 3.5, '#64748b');

    // Translucent spinning tail rotor disc
    ctx.fillStyle = 'rgba(203, 213, 225, 0.35)';
    ctx.beginPath();
    ctx.arc(tailX + 5, cy - 21, 10.5, 0, Math.PI * 2);
    ctx.fill();
    const trA = (frame * Math.PI) / 4;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tailX + 5 - Math.cos(trA) * 9.5, cy - 21 - Math.sin(trA) * 9.5);
    ctx.lineTo(tailX + 5 + Math.cos(trA) * 9.5, cy - 21 + Math.sin(trA) * 9.5);
    ctx.moveTo(tailX + 5 + Math.sin(trA) * 9.5, cy - 21 - Math.cos(trA) * 9.5);
    ctx.lineTo(tailX + 5 - Math.sin(trA) * 9.5, cy - 21 + Math.cos(trA) * 9.5);
    ctx.stroke();

    // 3. Sculpted Gunship Fuselage + Twin T700 Turboshaft Nacelles + IR-Suppressed Exhaust
    const fusePts: [number, number][] = [
      [76, cy - 12],
      [118, cy - 16],
      [noseX - 8, cy - 2],
      [noseX, cy + 7],
      [noseX - 10, cy + 15],
      [82, cy + 15],
      [74, cy + 7],
    ];
    fillStrokePoly(ctx, fusePts, vGrad(ctx, cy - 16, cy + 15, pal.mountLight, pal.mountMid, pal.mountDark), '#10151a', 1.6);
    drawShadedRod(ctx, 86, cy - 14, 120, cy - 13, 7.5, 7, pal.mountLight, pal.mountMid, pal.mountDark);
    ctx.beginPath();
    ctx.ellipse(121, cy - 13, 3.2, 5.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // 4. Tandem Cockpit: Mi-24 Double-Bubble (T3) vs AH-64D Stepped Flat-Pane Armored Canopy (T4)!
    if (!isApache) {
      ctx.fillStyle = vGrad(ctx, cy - 18, cy + 2, '#bae6fd', '#0284c7', '#0c4a6e');
      ctx.beginPath();
      ctx.ellipse(120, cy - 11, 11, 6, 0.1, 0, Math.PI * 2);
      ctx.ellipse(138, cy - 5, 11, 6, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    } else {
      const glassPts: [number, number][] = [
        [108, cy - 13],
        [124, cy - 21],
        [141, cy - 13],
        [155, cy - 3],
        [151, cy + 2],
        [108, cy + 1],
      ];
      fillStrokePoly(ctx, glassPts, vGrad(ctx, cy - 21, cy + 2, '#bae6fd', '#0284c7', '#0f172a'), '#0f172a', 1.6);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(124, cy - 21);
      ctx.lineTo(126, cy + 1);
      ctx.moveTo(140, cy - 13);
      ctx.lineTo(141, cy + 2);
      ctx.stroke();
    }

    // 5. Nose TADS/PNVS Sensor Turret + Under-Chin 30mm M230 Chain Gun + Taildragger Landing Gear
    ctx.beginPath();
    ctx.ellipse(noseX + 2, cy + 5, isApache ? 6.5 : 5, isApache ? 5.5 : 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(noseX + 4, cy + 5, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    drawShadedRod(ctx, 134, cy + 17, noseX + (isApache ? 6 : 0), cy + 19, 2.2, 1.8, '#cbd5e1', '#475569', '#0f172a');
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(118, cy + 14);
    ctx.lineTo(126, cy + 28);
    ctx.stroke();
    drawDetailedWheel(ctx, 127, cy + 29, 5.2, '#64748b');

    // 6. Near Stub Wing + 19-Tube Hydra-70 Rocket Pod + Quad AGM-114 Hellfire ATGMs
    fillStrokePoly(
      ctx,
      [
        [94, cy + 5],
        [118, cy + 5],
        [106, cy + (isApache ? 25 : 19)],
        [84, cy + (isApache ? 23 : 18)],
      ],
      vGrad(ctx, cy + 5, cy + 25, pal.mountLight, pal.mountMid, pal.mountDark),
      '#10151a',
      1.4
    );
    drawShadedRod(ctx, 86, cy + 21, 114, cy + 22, 4.8, 4.8, '#cbd5e1', '#64748b', '#1e293b');
    if (isApache) {
      for (let m = 0; m < 2; m++) {
        const my = cy + 28 + m * 4.5;
        drawShadedRod(ctx, 84, my, 118, my + 1, 1.9, 1.9, '#ffffff', '#cbd5e1', '#334155');
        ctx.beginPath();
        ctx.arc(119, my + 1, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
      }
    }

    // 7. Tilted 3D Perspective Translucent Main Rotor Disc + 4 Swept Composite Blades + AN/APG-78 Longbow Radome!
    const mastX = 110;
    const rotorY = cy - 31;
    drawShadedRod(ctx, mastX, cy - 15, mastX, rotorY, 4.2, 3.8, '#cbd5e1', '#64748b', '#1e293b');
    const spanRx = isApache ? 76 : 64;
    const discG = ctx.createRadialGradient(mastX, rotorY, 6, mastX, rotorY, spanRx);
    discG.addColorStop(0, 'rgba(148, 163, 184, 0.32)');
    discG.addColorStop(0.85, 'rgba(203, 213, 225, 0.18)');
    discG.addColorStop(1, 'rgba(226, 232, 240, 0.35)');
    ctx.beginPath();
    ctx.ellipse(mastX, rotorY, spanRx, 7.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = discG;
    ctx.fill();

    // 4 crisp composite rotor blades
    const rOff = frame % 2 === 0 ? 0.32 : 0.78;
    for (let b = 0; b < 4; b++) {
      const a = rOff + (b * Math.PI) / 2;
      ctx.strokeStyle = b % 2 === 0 ? '#1e293b' : '#cbd5e1';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(mastX, rotorY);
      ctx.lineTo(mastX + Math.cos(a) * spanRx, rotorY + Math.sin(a) * 7.2);
      ctx.stroke();
    }

    if (isApache) {
      // AN/APG-78 Longbow Millimeter-Wave Fire-Control Radar Cheese-Wheel Dome!
      ctx.beginPath();
      ctx.ellipse(mastX, rotorY - 8, 13, 5.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = vGrad(ctx, rotorY - 14, rotorY - 2, '#f8fafc', '#cbd5e1', '#475569');
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    return;
  }

  // LINEAGE A (FIGHTERS) & LINEAGE B (BOMBERS / C-47 TRANSPORT): 3/4 Isometric Banking Blueprint Aircraft!
  const isBomber = isBomberPlane(classId) || isHeliTransport(classId);
  const tailX = (isBomber ? 44 : 46) - tStep * 11;
  const noseX = (isBomber ? 144 : 142) + tStep * 12;
  const tailY = cy - 11;
  const noseY = cy + 9;
  const midX = (tailX + noseX) * 0.52;
  const midY = (tailY + noseY) * 0.52;
  const wingSpan = (isBomber ? 40 : 34) + tStep * 10;

  // 1. Far Starboard Wing (sweeping BACKWARD up-left in authentic > aerodynamic perspective!)
  const farTipX = midX - (tier >= 3 ? 22 + tStep * 4 : 6);
  const farTipY = midY - wingSpan;
  const farWingPts: [number, number][] = [
    [midX - 12 - tStep * 4, midY - 4],
    [midX + 20 + tStep * 5, midY],
    [farTipX + 14, farTipY + 3],
    [farTipX - 2, farTipY],
  ];
  fillStrokePoly(ctx, farWingPts, vGrad(ctx, farTipY, midY, pal.mountMid, pal.mountDark, '#141c24'), '#10151a', 1.4);
  drawAirRoundel(ctx, (midX + farTipX) * 0.5 + 4, (midY + farTipY) * 0.52, 5.5, 4, -0.3, isAxis);

  if (isBomber && tier === 2) {
    // Far Radial Engine Nacelles + Translucent Spinning Propellers (B-17G / C-47 / He-111)!
    const engCount = isBomberPlane(classId) ? 2 : 1;
    for (let e = 0; e < engCount; e++) {
      const t = 0.38 + e * 0.3;
      const ex = midX + (farTipX - midX) * t + 8;
      const ey = midY + (farTipY - midY) * t + 1;
      drawShadedRod(ctx, ex - 8, ey - 1, ex + 8, ey + 2, 4.8, 4.4, pal.mountLight, pal.mountMid, pal.mountDark);
      drawPropBlurDisc(ctx, ex + 10, ey + 2.5, 3.5, 11, -0.15, '#dc2626', frame);
    }
  } else if (!isBomber && tier >= 3) {
    // Far wingtip AIM-9X Sidewinder missile
    drawShadedRod(ctx, farTipX - 5, farTipY - 1, farTipX + 16, farTipY + 3, 1.7, 1.7, '#ffffff', '#cbd5e1', '#475569');
  }

  // 2. Horizontal Tailplane + Vertical Stabilizer(s) (Twin Canted Tails on Tier 4 F-22A Raptor!)
  fillStrokePoly(
    ctx,
    [
      [tailX, tailY + 3],
      [tailX + 17, tailY + 7],
      [tailX + 3, tailY + 19 + tStep * 3],
      [tailX - 6, tailY + 15 + tStep * 3],
    ],
    pal.mountMid,
    '#10151a',
    1.3
  );
  if (!isBomber && tier >= 4) {
    // Far + Near Canted Stealth Tails on F-22A Raptor!
    fillStrokePoly(ctx, [[tailX + 7, tailY - 2], [tailX + 26, tailY + 2], [tailX + 18, tailY - 33], [tailX + 5, tailY - 31]], pal.mountDark, '#10151a', 1.3);
    fillStrokePoly(
      ctx,
      [[tailX, tailY + 1], [tailX + 21, tailY + 5], [tailX + 9, tailY - 36], [tailX - 4, tailY - 32]],
      vGrad(ctx, tailY - 36, tailY + 5, pal.mountLight, pal.mountMid, pal.mountDark),
      '#10151a',
      1.4
    );
  } else {
    fillStrokePoly(
      ctx,
      [[tailX + 1, tailY], [tailX + 22 + tStep * 2, tailY + 4], [tailX + 8, tailY - 28 - tStep * 4], [tailX - 2, tailY - 25 - tStep * 4]],
      vGrad(ctx, tailY - 34, tailY + 4, pal.mountLight, pal.mountMid, pal.mountDark),
      '#10151a',
      1.4
    );
    // Tail rudder flash
    ctx.fillStyle = pal.capeMid;
    ctx.fillRect(tailX + 1, tailY - 21 - tStep * 3, 4.5, 10);
  }

  // 3. Supersonic Jet Exhaust Nozzles & Translucent Mach Shock-Diamond Afterburner (T3-T4)!
  if ((tier >= 3 && !isBomber) || (tier >= 4 && isBomber)) {
    drawAfterburnerPlume(ctx, tailX + 2, tailY + 2, tier >= 4 ? 22 : 16, tier >= 4 ? 5.5 : 4);
    drawShadedRod(ctx, tailX, tailY + 1, tailX + 9, tailY + 3, tier >= 4 ? 5.8 : 4.6, tier >= 4 ? 6.2 : 5, '#64748b', '#334155', '#09090b');
  }

  // 4. Sculpted Aerodynamic Fuselage with Disruptive Camo / Invasion Stripes & Fuselage Roundel!
  const fR = (isBomber ? 9 : 7.5) + tStep * 1.4;
  drawShadedRod(ctx, tailX + 5, tailY + 1, noseX - 8, noseY - 1, fR * 0.6, fR, pal.mountLight, pal.mountMid, pal.mountDark, '#10151a', 1.6);

  if (tier === 2 && !isAxis) {
    // Iconic D-Day Normandy Black & White Fuselage Invasion Stripes!
    ctx.save();
    ctx.translate(tailX + 28, tailY + 5);
    ctx.rotate(0.18);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, -fR * 0.72, 9, fR * 1.44);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(3, -fR * 0.72, 3, fR * 1.44);
    ctx.restore();
  }

  // 5. Era-Authentic Nose, Engine Cowling, Canopy & Propeller!
  if (tier === 1) {
    // WWI Biplane Rotary Engine Cowling + Goggled Pilot + White Silk Scarf + Laminated Prop!
    ctx.beginPath();
    ctx.ellipse(midX - 2, midY - 4, 5.5, 3, 0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#1c1917';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(midX - 1, midY - 7, 3.8, 0, Math.PI * 2);
    ctx.fillStyle = '#5c3a21';
    ctx.fill();
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(midX - 4, midY - 6);
    ctx.quadraticCurveTo(midX - 10, midY - 9, midX - 14, midY - 7);
    ctx.stroke();
    // Spoked WWI undercarriage wheels on V-struts!
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(midX + 6, midY + 5);
    ctx.lineTo(midX + 10, midY + 16);
    ctx.lineTo(midX + 18, midY + 6);
    ctx.stroke();
    drawDetailedWheel(ctx, midX + 10, midY + 17, 4.5, '#cbd5e1');

    drawShadedRod(ctx, noseX - 10, noseY - 2, noseX, noseY, 7, 6.5, '#e2e8f0', '#94a3b8', '#334155');
    drawPropBlurDisc(ctx, noseX + 2, noseY + 0.5, 4, 18, -0.15, '#78350f', frame);
  } else if (tier === 2) {
    if (isBomber) {
      // Glazed Plexiglas B-17 / He-111 Bombardier Nose + Stepped Flight Deck + Dorsal Gun Turret!
      ctx.beginPath();
      ctx.ellipse(noseX - 2, noseY - 1, 9, 6.8, 0.15, 0, Math.PI * 2);
      ctx.fillStyle = vGrad(ctx, noseY - 8, noseY + 6, '#e0f2fe', '#38bdf8', '#0369a1');
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      fillStrokePoly(ctx, [[noseX - 24, noseY - 10], [noseX - 12, noseY - 10], [noseX - 7, noseY - 4], [noseX - 22, noseY - 4]], '#38bdf8', '#0f172a', 1.2);
      if (isBomberPlane(classId)) {
        // Dorsal twin-.50 cal Plexiglas gun turret
        ctx.beginPath();
        ctx.arc(midX - 6, midY - fR + 1, 5, Math.PI, 0);
        ctx.fillStyle = '#7dd3fc';
        ctx.fill();
        ctx.stroke();
      }
    } else {
      // Supermarine Spitfire Mk IX: Merlin V12 Exhaust Stubs, Teardrop Bubble Canopy & Red Spinner!
      ctx.beginPath();
      ctx.ellipse(midX + 2, midY - 5.5, 11.5, 5, 0.15, 0, Math.PI * 2);
      ctx.fillStyle = vGrad(ctx, midY - 11, midY, '#e0f2fe', '#38bdf8', '#0369a1');
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      for (let ex = noseX - 26; ex <= noseX - 12; ex += 4.5) {
        ctx.fillStyle = '#44403c';
        ctx.fillRect(ex, noseY - 2, 3, 2);
      }
      drawPropBlurDisc(ctx, noseX + 3, noseY, 4.2, 20, -0.15, isAxis ? '#facc15' : '#dc2626', frame);
    }
  } else {
    // Tier 3 (F-16 / B-52) -> Tier 4 (F-22A Raptor Gold Stealth Canopy & Chined Diamond Radome!)
    const isStealthFighter = !isBomber && tier >= 4;
    fillStrokePoly(
      ctx,
      [
        [noseX - 16, noseY - 7.5],
        [noseX + 11, noseY + 2],
        [noseX - 16, noseY + 6.5],
      ],
      isStealthFighter ? '#475569' : '#1e293b',
      '#0f172a',
      1.4
    );
    ctx.beginPath();
    ctx.ellipse(midX + 10, midY - 5.5, 15, 5.8, 0.15, 0, Math.PI * 2);
    ctx.fillStyle = isStealthFighter
      ? vGrad(ctx, midY - 12, midY, '#fef9c3', '#eab308', '#854d0e')
      : vGrad(ctx, midY - 12, midY, '#e0f2fe', '#38bdf8', '#0369a1');
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.3;
    ctx.stroke();
  }

  // 6. Near Port Wing (sweeping BACKWARD down-left in authentic > planform!) + Camo, Engines & Missiles
  const nearTipX = midX - (tier >= 3 ? 28 + tStep * 5 : 14);
  const nearTipY = midY + wingSpan + 4;
  const nearWingPts: [number, number][] = [
    [midX - 16 - tStep * 5, midY + 2],
    [midX + 22 + tStep * 5, midY + 6],
    [nearTipX + 15, nearTipY],
    [nearTipX - 1, nearTipY - 4],
  ];
  fillStrokePoly(ctx, nearWingPts, vGrad(ctx, midY + 2, nearTipY, pal.mountLight, pal.mountMid, pal.mountDark), '#10151a', 1.5);

  if (tier === 2 && !isAxis) {
    // RAF / USAAF Disruptive Camo + Yellow Wing Leading Edge + D-Day Invasion Stripes!
    ctx.save();
    polyPath(ctx, nearWingPts);
    ctx.clip();
    ctx.fillStyle = 'rgba(45, 74, 43, 0.48)';
    ctx.beginPath();
    ctx.ellipse(midX - 4, midY + 18, 16, 8, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(midX + 4, midY + 4);
    ctx.lineTo(midX - 12, midY + 24);
    ctx.stroke();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.restore();
  }

  drawAirRoundel(ctx, (midX + nearTipX) * 0.48 + 2, (midY + nearTipY) * 0.54, 6, 4.6, 0.3, isAxis);

  if (tier === 1) {
    // Authentic WWI Staggered Upper Biplane Wing + Wooden Interplane Struts & Steel Rigging Wires!
    fillStrokePoly(
      ctx,
      [
        [midX - 12, midY - 16],
        [midX + 20, midY - 11],
        [nearTipX + 20, nearTipY - 16],
        [nearTipX + 4, nearTipY - 20],
      ],
      vGrad(ctx, midY - 20, nearTipY - 16, pal.mountLight, pal.mountMid, pal.mountDark),
      '#10151a',
      1.4
    );
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(nearTipX + 12, nearTipY - 18);
    ctx.lineTo(nearTipX + 10, nearTipY - 3);
    ctx.moveTo(midX + 6, midY - 13);
    ctx.lineTo(midX + 4, midY + 3);
    ctx.stroke();
  } else if (isBomber && tier === 2) {
    // Near B-17G / C-47 / He-111 Radial Engines + Translucent Spinning Props!
    const engCount = isBomberPlane(classId) ? 2 : 1;
    for (let e = 0; e < engCount; e++) {
      const t = 0.36 + e * 0.3;
      const nx = midX + (nearTipX - midX) * t + 7;
      const ny = midY + (nearTipY - midY) * t + 2;
      drawShadedRod(ctx, nx - 9, ny - 2, nx + 9, ny + 2, 5.5, 5, pal.mountLight, pal.mountMid, pal.mountDark);
      drawPropBlurDisc(ctx, nx + 11, ny + 3, 4, 13, -0.15, '#dc2626', frame);
    }
  } else if (tier >= 3) {
    // Wingtip & Underwing AIM-9X / AIM-120D / ALCM Cruise Missiles!
    drawShadedRod(ctx, nearTipX - 4, nearTipY - 4, nearTipX + 21, nearTipY + 1, 2, 2, '#ffffff', '#e2e8f0', '#475569');
    ctx.beginPath();
    ctx.arc(nearTipX + 22, nearTipY + 1, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    if (tier >= 4 || isBomber) {
      const px = (midX + nearTipX) * 0.56;
      const py = (midY + nearTipY) * 0.56 + 4;
      drawShadedRod(ctx, px - 10, py - 2, px + 15, py + 3, 2.5, 2.3, '#ffffff', '#cbd5e1', '#334155');
    }
  }
}

// ============================================================================
// 5. TRUE 3/4 ISOMETRIC DECK + HULL WARSHIPS, SUBMARINES & SUPERCARRIERS
// ============================================================================

function draw3dGunTurret(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  bLen: number,
  dir: 1 | -1,
  barrels: 1 | 2 | 3,
  pal: CharacterPalette,
  stealth = false
) {
  ctx.save();
  // Armored turret house + top roof highlight
  const pts: [number, number][] = stealth
    ? [
        [x, y + h],
        [x + 3.5, y],
        [x + w - 3, y],
        [x + w, y + h],
      ]
    : [
        [x, y + h],
        [x + 2, y + 1.5],
        [x + w - 3, y],
        [x + w, y + 3],
        [x + w, y + h],
      ];
  fillStrokePoly(ctx, pts, vGrad(ctx, y, y + h, pal.mountLight, pal.mountMid, pal.mountDark), '#10151a', 1.3);

  const rootX = dir === 1 ? x + w - 1 : x + 1;
  if (!stealth) {
    // White canvas blast bags at gun barrel roots (classic Cruiser/Battleship signature!)
    ctx.beginPath();
    ctx.ellipse(rootX, y + h * 0.45, 3, 2.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f1f5f9';
    ctx.fill();
  }

  for (let b = 0; b < barrels; b++) {
    const offY = (b - (barrels - 1) * 0.5) * 2.2;
    drawShadedRod(
      ctx,
      rootX,
      y + h * 0.42 + offY,
      rootX + dir * bLen,
      y - 2 + offY,
      barrels === 3 ? 1.5 : 1.7,
      1.2,
      '#f8fafc',
      '#94a3b8',
      '#1e293b',
      '#0f172a',
      0.8
    );
  }
  ctx.restore();
}

function drawNavalCanvas(
  ctx: CanvasRenderingContext2D,
  unit: Unit,
  pal: CharacterPalette,
  tier: UnitTier,
  frame: SpriteAnimFrame
) {
  const classId = unit.classId;
  const bob = frame === 1 || frame === 2 ? -1.8 : 0;
  const wakeShift = frame % 2 === 0 ? 0 : 4;
  const tStep = tier - 1;

  const hullSpan = 128 + tStep * 16 + (tier === 4 ? 2 : 0); // 128 -> 144 -> 160 -> 178
  const hullLeft = Math.round(96 - hullSpan * 0.5);
  const hullRight = hullLeft + hullSpan;
  const waterY = 166;

  // Translucent Ocean Trough Shadow & Kelvin Wake Base
  const seaG = ctx.createRadialGradient(96, waterY + 3, 12, 96, waterY + 3, hullSpan * 0.55);
  seaG.addColorStop(0, 'rgba(3, 105, 161, 0.72)');
  seaG.addColorStop(0.75, 'rgba(14, 165, 233, 0.35)');
  seaG.addColorStop(1, 'rgba(14, 165, 233, 0)');
  ctx.beginPath();
  ctx.ellipse(96, waterY + 3, hullSpan * 0.56, 8, 0, 0, Math.PI * 2);
  ctx.fillStyle = seaG;
  ctx.fill();

  // LINEAGE B: SUBMARINES — Coastal U-Boat -> WWII Type VIIC U-Boat -> Virginia SSN -> Ohio/Typhoon SSBN!
  if (isSubmarine(classId)) {
    const hullH = 11 + tStep * 1.8;
    // Lower hydrodynamic pressure hull + red anti-fouling keel line
    drawShadedRod(
      ctx,
      hullLeft + 8,
      waterY - 4 + bob,
      hullRight - 8,
      waterY - 4 + bob,
      hullH * 0.78,
      hullH * 0.85,
      pal.mountLight,
      tier >= 3 ? '#27303b' : pal.mountMid,
      '#0f172a',
      '#090d14',
      1.6
    );
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(hullLeft + 12, waterY + 1 + bob);
    ctx.lineTo(hullRight - 12, waterY + 1 + bob);
    ctx.stroke();

    // 3/4 Top Slotted Casing Deck / Ballistic Missile Turtleback!
    const deckTopY = waterY - 14 - (tier >= 4 ? 6 : 0) + bob;
    fillStrokePoly(
      ctx,
      [
        [hullLeft + 14, waterY - 9 + bob],
        [hullLeft + 26, deckTopY],
        [hullRight - 18, deckTopY - 1],
        [hullRight - 4, waterY - 7 + bob],
        [hullRight - 14, waterY - 4 + bob],
        [hullLeft + 18, waterY - 4 + bob],
      ],
      tier >= 3 ? '#334155' : pal.mountLight,
      '#0f172a',
      1.2
    );

    if (tier <= 2) {
      // WWII Type VIIC U-Boat free-flooding slots, Conning Tower, 88mm Deck Gun & Jumping Wires!
      ctx.fillStyle = '#0f172a';
      for (let sx = hullLeft + 26; sx < hullRight - 22; sx += 9) {
        ctx.fillRect(sx, waterY - 8 + bob, 4.5, 1.8);
      }
      const twX = 88;
      const twW = tier === 1 ? 22 : 28;
      const twH = tier === 1 ? 16 : 20;
      const twY = deckTopY - twH + 2;
      fillStrokePoly(
        ctx,
        [
          [twX, deckTopY + 2],
          [twX + 3, twY + 2],
          [twX + twW - 4, twY],
          [twX + twW, deckTopY + 2],
        ],
        vGrad(ctx, twY, deckTopY + 2, pal.mountLight, pal.mountMid, pal.mountDark),
        '#0f172a',
        1.4
      );
      // Dual periscopes & jumping wire
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(twX + 9, twY);
      ctx.lineTo(twX + 9, twY - 15);
      ctx.moveTo(twX + 15, twY);
      ctx.lineTo(twX + 15, twY - 10);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hullLeft + 14, waterY - 9 + bob);
      ctx.lineTo(twX + 3, twY + 2);
      ctx.moveTo(twX + twW - 4, twY + 1);
      ctx.lineTo(hullRight - 6, waterY - 8 + bob);
      ctx.stroke();
      if (tier === 2) {
        draw3dGunTurret(ctx, twX + twW + 6, deckTopY - 6, 10, 7, 15, 1, 1, pal);
      }
    } else {
      // Modern Virginia SSN (T3) -> Ohio / Typhoon Strategic SSBN with SLBM Silo Hatches & Open Trident Tube (T4)!
      const sailX = tier >= 4 ? 118 : 102;
      const sailW = tier >= 4 ? 25 : 23;
      const sailH = tier >= 4 ? 24 : 22;
      const sailY = deckTopY - sailH + 3;

      // Anechoic rubber acoustic hull panels + Bow spherical sonar dome highlight + Torpedo shutter doors
      ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
      for (let ax = hullLeft + 24; ax < hullRight - 24; ax += 14) {
        ctx.fillRect(ax, waterY - 6 + bob, 9, 3);
      }
      ctx.beginPath();
      ctx.ellipse(hullRight - 9, waterY - 4 + bob, 8, 4.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.28)';
      ctx.fill();
      roundRectPath(ctx, hullRight - 28, waterY - 6 + bob, 7, 3, 1);
      ctx.fillStyle = '#090d14';
      ctx.fill();

      if (tier === 3) {
        // Virginia Payload Module (VPM) Tomahawk cruise-missile rotary hatches forward of sail
        for (let v = 0; v < 2; v++) {
          ctx.beginPath();
          ctx.ellipse(sailX + sailW + 9 + v * 11, deckTopY + 2, 4, 2, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#475569';
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }

      if (tier >= 4) {
        for (let s = 0; s < 5; s++) {
          const hx = hullLeft + 32 + s * 15;
          roundRectPath(ctx, hx, deckTopY + 1, 10, 5, 1);
          ctx.fillStyle = '#475569';
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
        // One open SLBM silo hatch revealing a Trident D5 ballistic missile nosecone!
        ctx.beginPath();
        ctx.ellipse(hullLeft + 67, deckTopY - 2, 3.5, 6, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#f8fafc';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(hullLeft + 67, deckTopY - 6, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = '#f97316';
        ctx.fill();
      }

      // Filleted Nuclear Sail + Fairwater Diving Planes + Dual Photonics/ESM Masts + Pump-Jet Stern Fin
      fillStrokePoly(
        ctx,
        [
          [sailX - 3, deckTopY + 3],
          [sailX + 2, sailY + 2],
          [sailX + sailW - 3, sailY],
          [sailX + sailW, deckTopY + 3],
        ],
        vGrad(ctx, sailY, deckTopY + 3, '#64748b', '#334155', '#0f172a'),
        '#090d14',
        1.5
      );
      roundRectPath(ctx, sailX + 7, sailY + 9, 13, 4, 1.5);
      ctx.fillStyle = '#94a3b8';
      ctx.fill();
      ctx.stroke();
      drawShadedRod(ctx, sailX + 8, sailY, sailX + 8, sailY - 16, 1.8, 1.5, '#f8fafc', '#94a3b8', '#334155');
      drawShadedRod(ctx, sailX + 14, sailY, sailX + 14, sailY - 11, 1.5, 1.2, '#cbd5e1', '#64748b', '#1e293b');
      fillStrokePoly(ctx, [[hullLeft + 5, waterY - 8 + bob], [hullLeft + 18, waterY - 9 + bob], [hullLeft + 9, waterY - 24 + bob], [hullLeft + 3, waterY - 22 + bob]], '#1e293b', '#090d14', 1.3);
    }

    // Translucent White Foaming Bow Wave & Wake!
    ctx.strokeStyle = 'rgba(240, 249, 255, 0.9)';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(hullRight - 24, waterY + 2);
    ctx.quadraticCurveTo(hullRight - 6, waterY - 1, hullRight + 5, waterY + 3);
    ctx.moveTo(hullLeft + 6 + wakeShift, waterY + 3);
    ctx.lineTo(hullLeft + 46 + wakeShift, waterY + 3);
    ctx.stroke();
    return;
  }

  // LINEAGE C: AMPHIBIOUS LST (T1) -> WWII CARRIER (T2) -> FORRESTAL/NIMITZ (T3) -> GERALD R. FORD SUPERCARRIER (T4)!
  if (isCarrierLanding(classId)) {
    if (tier === 1) {
      // WWII LST Tank Landing Ship with 3/4 Open Vehicle Well-Deck, Embarked Sherman & Lowered Bow Ramp!
      const deckY = 144 + bob;
      fillStrokePoly(
        ctx,
        [
          [hullLeft + 4, waterY + bob],
          [hullLeft, deckY + 2],
          [hullRight - 6, deckY],
          [hullRight, waterY - 3 + bob],
          [hullRight - 6, waterY + bob],
        ],
        vGrad(ctx, deckY, waterY, pal.mountLight, pal.mountMid, pal.mountDark),
        '#10151a',
        1.5
      );
      drawGroundInsignia(ctx, hullRight - 24, deckY + 8, 4.5, unit.faction === 'ENEMY');
      // Open recessed well-deck + Miniature Olive Sherman Tank Inside!
      fillStrokePoly(ctx, [[hullLeft + 36, deckY], [hullLeft + 42, deckY - 6], [hullRight - 14, deckY - 6], [hullRight - 8, deckY]], '#1e293b', '#0f172a', 1.2);
      roundRectPath(ctx, hullLeft + 52, deckY - 12, 30, 9, 2);
      ctx.fillStyle = '#55693c';
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(hullLeft + 67, deckY - 14, 8, 4.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#738a52';
      ctx.fill();
      ctx.stroke();
      drawShadedRod(ctx, hullLeft + 74, deckY - 14, hullLeft + 90, deckY - 15, 1.6, 1.3, '#e2e8f0', '#64748b', '#1e293b');
      // Stern pilot house + Bridge windows + Radar mast + Bow landing ramp
      fillStrokePoly(ctx, [[hullLeft + 6, deckY + 1], [hullLeft + 8, deckY - 20], [hullLeft + 32, deckY - 20], [hullLeft + 35, deckY + 1]], pal.mountMid, '#10151a', 1.4);
      roundRectPath(ctx, hullLeft + 12, deckY - 16, 16, 4.5, 1);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      drawShadedRod(ctx, hullLeft + 18, deckY - 20, hullLeft + 18, deckY - 32, 1.5, 1.2, '#cbd5e1', '#64748b', '#1e293b');
      fillStrokePoly(ctx, [[hullRight - 7, deckY - 7], [hullRight - 2, deckY - 9], [hullRight + 6, waterY + bob], [hullRight, waterY + 2 + bob]], '#94a3b8', '#1e293b', 1.3);
      return;
    }

    // Tier 2..4 Aircraft Carriers in 3/4 Elevated Perspective (Flared Hangar Hull + Wide Angled Flight Deck + Parked Air Wing!)
    const deckBackY = (tier >= 4 ? 118 : 122) + bob;
    const deckFrontY = deckBackY + (tier >= 4 ? 13 : 11);

    // Flared Hangar Hull Side + Open Elevator Bays + Red Boot-Topping
    fillStrokePoly(
      ctx,
      [
        [hullLeft + 12, waterY + bob],
        [hullLeft + 2, deckFrontY],
        [hullRight - 2, deckFrontY - 2],
        [hullRight - 14, waterY + bob],
      ],
      vGrad(ctx, deckFrontY, waterY, pal.mountLight, pal.mountMid, pal.mountDark),
      '#10151a',
      1.6
    );
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(hullLeft + 12, waterY - 1.5 + bob);
    ctx.lineTo(hullRight - 14, waterY - 1.5 + bob);
    ctx.stroke();
    for (let hx = hullLeft + 34; hx <= hullRight - 46; hx += 28) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(hx, deckFrontY + 4, 15, 6);
    }

    // Wide 3/4 Isometric Angled Flight Deck Surface!
    const deckPts: [number, number][] = [
      [hullLeft - 2, deckFrontY],
      [hullLeft + 10, deckBackY],
      [hullRight - 4, deckBackY - 2],
      [hullRight + 4, deckFrontY - 2],
    ];
    fillStrokePoly(ctx, deckPts, tier === 2 ? '#5c4d3c' : '#334155', '#0f172a', 1.5);

    // Angled Landing Strip Centerline, Arrestor Wires & Yellow EMALS Catapult Lines!
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(hullLeft + 8, deckFrontY - 3);
    ctx.lineTo(hullRight - 6, deckBackY + 3);
    ctx.stroke();
    ctx.setLineDash([]);
    if (tier >= 3) {
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(hullLeft + 54, deckFrontY - 2);
      ctx.lineTo(hullRight - 4, deckFrontY - 4);
      ctx.stroke();
    }

    // Starboard Carrier Island Tower + Phased-Array / 3D Radar Mast
    const islX = tier >= 4 ? hullLeft + 24 : hullLeft + 34;
    const islW = 22 + tStep * 4;
    const islH = 24 + tStep * 4;
    const islY = deckBackY - islH + 3;
    fillStrokePoly(
      ctx,
      [
        [islX, deckBackY + 3],
        [islX + 3, islY],
        [islX + islW - 3, islY],
        [islX + islW, deckBackY + 3],
      ],
      vGrad(ctx, islY, deckBackY + 3, pal.mountLight, pal.mountMid, pal.mountDark),
      '#10151a',
      1.4
    );
    roundRectPath(ctx, islX + 4, islY + 5, islW - 8, 4.5, 1);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(islX + islW * 0.5, islY);
    ctx.lineTo(islX + islW * 0.5, islY - 15);
    ctx.stroke();

    // Miniature Carrier Air Wing Parked on Flight Deck (F4U Corsairs -> F-14 Tomcats -> F-35C + E-2D Hawkeye!)
    const planes = tier;
    for (let i = 0; i < planes; i++) {
      const px = hullRight - 26 - i * 24;
      const py = deckBackY + 4;
      if (px > islX + islW + 4) {
        if (tier >= 4 && i === planes - 1) {
          // E-2D Hawkeye AWACS with crisp white circular radar rotodome!
          drawShadedRod(ctx, px, py, px + 14, py, 2.5, 2.2, '#f8fafc', '#94a3b8', '#334155');
          ctx.beginPath();
          ctx.ellipse(px + 6, py - 5, 7.5, 2.5, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 0.9;
          ctx.stroke();
        } else {
          fillStrokePoly(
            ctx,
            [
              [px, py],
              [px + 15, py + 1],
              [px + 4, py - 5],
              [px - 1, py - 4],
            ],
            tier === 2 ? '#1e3a8a' : '#94a3b8',
            '#0f172a',
            1
          );
        }
      }
    }

    ctx.strokeStyle = 'rgba(240, 249, 255, 0.9)';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(hullRight - 22, waterY + 2);
    ctx.quadraticCurveTo(hullRight - 4, waterY - 1, hullRight + 5, waterY + 3);
    ctx.moveTo(hullLeft + 6 + wakeShift, waterY + 3);
    ctx.lineTo(hullLeft + 52 + wakeShift, waterY + 3);
    ctx.stroke();
    return;
  }

  // LINEAGE A: SURFACE WARSHIPS IN 3/4 ELEVATED PERSPECTIVE (Visible Teak/Non-Skid Deck + Sleek Clipper Hull!)
  // Clemson WWI Destroyer (T1) -> Heavy Cruiser (T2) -> USS Iowa / Bismarck Battleship (T3) -> Arleigh Burke Aegis Cruiser (T4)!
  const qDeckY = 147 + bob;
  const fDeckY = 136 + bob;
  const breakX = hullLeft + hullSpan * 0.44;

  // 1. 3/4 Top Warship Deck Planform (Warm Teak Wood Deck on T2-T3 Cruiser/Battleship, Dark Non-Skid Steel on T1/T4!)
  const deckBackOffset = 7;
  const deckPts: [number, number][] = [
    [hullLeft + 3, qDeckY],
    [hullLeft + 10, qDeckY - deckBackOffset],
    [breakX + 6, qDeckY - deckBackOffset],
    [breakX + 16, fDeckY - deckBackOffset + 1],
    [hullRight, fDeckY - 4],
    [breakX + 12, fDeckY + 2],
    [breakX, qDeckY],
  ];
  fillStrokePoly(ctx, deckPts, tier === 2 || tier === 3 ? '#9a7b56' : '#475569', '#10151a', 1.2);

  // 2. Sleek Shaded Hydrodynamic Hull Side + Measure 22 Lower Navy Band + Red Boot-Topping + Anchor Hawsepipe
  const hullSidePts: [number, number][] = [
    [hullLeft + 8, waterY + bob],
    [hullLeft + 2, qDeckY],
    [breakX, qDeckY],
    [breakX + 12, fDeckY + 2],
    [hullRight, fDeckY - 4],
    [hullRight - 12, waterY + bob],
  ];
  fillStrokePoly(
    ctx,
    hullSidePts,
    vGrad(ctx, fDeckY - 4, waterY, pal.mountLight, pal.mountMid, '#1e293b'),
    '#10151a',
    1.6
  );
  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(hullLeft + 8, waterY - 1.5 + bob);
  ctx.lineTo(hullRight - 12, waterY - 1.5 + bob);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(hullRight - 14, fDeckY + 4, 1.8, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  if (tier >= 4) {
    // TIER 4 MODERN ARLEIGH BURKE / TICONDEROGA AEGIS GUIDED-MISSILE CRUISER!
    // Aft Helicopter Hangar + Slanted Harpoon Canisters + White Phalanx CIWS Dome
    fillStrokePoly(
      ctx,
      [
        [hullLeft + 22, qDeckY - 2],
        [hullLeft + 26, qDeckY - 18],
        [hullLeft + 56, qDeckY - 18],
        [hullLeft + 60, qDeckY - 2],
      ],
      vGrad(ctx, qDeckY - 18, qDeckY - 2, pal.mountLight, pal.mountMid, pal.mountDark),
      '#10151a',
      1.4
    );
    drawShadedRod(ctx, hullLeft + 62, qDeckY - 5, hullLeft + 76, qDeckY - 16, 3.2, 3.2, '#cbd5e1', '#64748b', '#1e293b');
    ctx.beginPath();
    ctx.ellipse(hullLeft + 47, qDeckY - 23, 3.2, 4.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.stroke();

    // Sloped Faceted Stealth Superstructure + Octagonal Blue SPY-6 Phased-Array Radar Panels + Enclosed Mast!
    const supX = breakX + 6;
    const supW = 40;
    const supTop = fDeckY - 34;
    fillStrokePoly(
      ctx,
      [
        [supX - 3, fDeckY],
        [supX + 4, supTop],
        [supX + supW - 5, supTop],
        [supX + supW + 3, fDeckY - 1],
      ],
      vGrad(ctx, supTop, fDeckY, pal.mountLight, pal.mountMid, pal.mountDark),
      '#10151a',
      1.5
    );
    roundRectPath(ctx, supX + 8, supTop + 5, supW - 15, 4.5, 1);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    // Octagonal SPY-1D / SPY-6 Radar Panels
    fillStrokePoly(
      ctx,
      [
        [supX + 11, supTop + 14],
        [supX + 19, supTop + 14],
        [supX + 22, supTop + 19],
        [supX + 19, supTop + 25],
        [supX + 11, supTop + 25],
        [supX + 8, supTop + 19],
      ],
      '#0284c7',
      '#0f172a',
      1
    );
    fillStrokePoly(
      ctx,
      [
        [supX + 27, supTop + 15],
        [supX + 33, supTop + 15],
        [supX + 35, supTop + 19],
        [supX + 33, supTop + 24],
        [supX + 27, supTop + 24],
        [supX + 25, supTop + 19],
      ],
      '#38bdf8',
      '#0f172a',
      1
    );
    // Enclosed Composite Mast + SATCOM Dome + Fore White Mk-41 VLS Grid + Faceted 127mm Stealth Gun!
    fillStrokePoly(ctx, [[supX + 14, supTop], [supX + 17, supTop - 24], [supX + 22, supTop - 24], [supX + 25, supTop]], pal.mountLight, '#10151a', 1.2);
    ctx.beginPath();
    ctx.arc(supX + 8, supTop - 3, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.stroke();

    roundRectPath(ctx, supX + supW + 4, fDeckY - 6, 15, 5, 1);
    ctx.fillStyle = '#f1f5f9';
    ctx.fill();
    ctx.stroke();
    draw3dGunTurret(ctx, supX + supW + 21, fDeckY - 11, 13, 8, 17, 1, 1, pal, true);
  } else {
    // TIER 1 (Clemson WWI Destroyer) -> TIER 2 (Baltimore Cruiser) -> TIER 3 (USS Iowa / Bismarck Fast Battleship)!
    const supX = breakX - 6;
    const supW = 22 + tStep * 6;
    const supH = 19 + tStep * 8;
    const supTop = fDeckY - supH;

    // Raked Naval Smokestack Funnels with Black Soot Caps!
    const funCount = tier <= 2 ? 2 : 1;
    for (let f = 0; f < funCount; f++) {
      const fx = supX - 13 - f * 13;
      const fw = tier === 3 ? 12 : 8.5;
      const fh = 17 + tStep * 3;
      fillStrokePoly(
        ctx,
        [
          [fx, qDeckY - 3],
          [fx - 4, qDeckY - 3 - fh],
          [fx - 4 + fw, qDeckY - 3 - fh],
          [fx + fw, qDeckY - 3],
        ],
        vGrad(ctx, qDeckY - 3 - fh, qDeckY - 3, '#cbd5e1', '#64748b', '#334155'),
        '#10151a',
        1.3
      );
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(fx - 4, qDeckY - 3 - fh, fw, 3.5);
    }

    // Armored Conning / Pagoda Tower + Stereo Optical Rangefinder + Tripod Radar Mast
    fillStrokePoly(
      ctx,
      [
        [supX, fDeckY - 1],
        [supX + 3, supTop + 6],
        [supX + supW - 2, supTop + 6],
        [supX + supW + 2, fDeckY - 1],
      ],
      vGrad(ctx, supTop + 6, fDeckY, pal.mountLight, pal.mountMid, pal.mountDark),
      '#10151a',
      1.4
    );
    roundRectPath(ctx, supX + 4, supTop, supW - 7, 8, 1.5);
    ctx.fillStyle = pal.mountLight;
    ctx.fill();
    ctx.stroke();
    if (tier >= 2) {
      // Optical stereo rangefinder arms
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(supX + 1, supTop - 3);
      ctx.lineTo(supX + supW - 1, supTop - 3);
      ctx.stroke();
    }
    const mastX = supX + supW * 0.45;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(mastX, supTop);
    ctx.lineTo(mastX - 2, supTop - 19 - tStep * 3);
    ctx.moveTo(mastX - 7, supTop - 12 - tStep * 2);
    ctx.lineTo(mastX + 7, supTop - 12 - tStep * 2);
    ctx.stroke();

    // Main Naval Gun Batteries (Single 4" -> Superfiring Twin 8" -> Massive Superfiring Triple 16" Battleship Guns!)
    if (tier === 1) {
      drawShadedRod(ctx, hullLeft + 28, qDeckY - 5, hullLeft + 44, qDeckY - 6, 3, 3, '#cbd5e1', '#64748b', '#1e293b'); // midships torpedo tubes
      draw3dGunTurret(ctx, supX + supW + 8, fDeckY - 9, 11, 7, 13, 1, 1, pal);
      draw3dGunTurret(ctx, hullLeft + 10, qDeckY - 9, 11, 7, 12, -1, 1, pal);
    } else if (tier === 2) {
      ctx.fillStyle = pal.mountDark;
      ctx.fillRect(supX + supW + 3, fDeckY - 9, 10, 8);
      draw3dGunTurret(ctx, supX + supW + 2, fDeckY - 16, 13, 7.5, 16, 1, 2, pal);
      draw3dGunTurret(ctx, supX + supW + 18, fDeckY - 10, 14, 8, 17, 1, 2, pal);
      draw3dGunTurret(ctx, hullLeft + 14, qDeckY - 10, 14, 8, 16, -1, 2, pal);
    } else {
      // Secondary 5-inch dual-purpose turret + Superfiring 3-gun 16-inch Turrets A, B & Aft X!
      draw3dGunTurret(ctx, supX - 27, qDeckY - 11, 11, 7, 10, -1, 2, pal);
      ctx.fillStyle = pal.mountDark;
      ctx.fillRect(supX + supW + 4, fDeckY - 10, 12, 9);
      draw3dGunTurret(ctx, supX + supW + 2, fDeckY - 18, 16, 8.5, 20, 1, 3, pal);
      draw3dGunTurret(ctx, supX + supW + 20, fDeckY - 11, 18, 9.5, 22, 1, 3, pal);
      draw3dGunTurret(ctx, hullLeft + 14, qDeckY - 11, 18, 9.5, 20, -1, 3, pal);
    }
  }

  // Translucent Foaming White Bow Spray & Kelvin Wake
  ctx.strokeStyle = 'rgba(240, 249, 255, 0.92)';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(hullRight - 22, waterY + 2);
  ctx.quadraticCurveTo(hullRight - 5, waterY - 2, hullRight + 5, waterY + 3);
  ctx.moveTo(hullLeft + 5 + wakeShift, waterY + 3);
  ctx.lineTo(hullLeft + 50 + wakeShift, waterY + 3);
  ctx.stroke();
}

// ============================================================================
// MASTER 192x192 BROWSER SPRITE & PORTRAIT ENTRY POINTS
// ============================================================================

export function drawRealisticUnitCanvas(
  ctx: CanvasRenderingContext2D,
  unit: Unit,
  pal: CharacterPalette,
  frame: SpriteAnimFrame = 0,
  animState: SpriteAnimState = 'idle'
) {
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  const tier: UnitTier = unit.tier ?? (unit.promoted ? 2 : 1);
  const domain = resolveDomain(unit.classId);

  if (domain === 'AIRCRAFT') {
    drawAircraftCanvas(ctx, unit, pal, tier, frame, animState);
  } else if (domain === 'NAVAL') {
    drawNavalCanvas(ctx, unit, pal, tier, frame);
  } else if (domain === 'ARMOR') {
    drawArmorCanvas(ctx, unit, pal, tier, frame, animState);
  } else if (domain === 'ARTILLERY') {
    drawArtilleryCanvas(ctx, unit, pal, tier, frame, animState);
  } else {
    drawInfantryCanvas(ctx, unit, pal, tier, frame, animState);
  }
  ctx.restore();
}

export function drawRealisticPortraitCanvas(
  ctx: CanvasRenderingContext2D,
  unit: Unit,
  pal: CharacterPalette
) {
  ctx.save();
  const tier: UnitTier = unit.tier ?? (unit.promoted ? 2 : 1);
  const domain = resolveDomain(unit.classId);
  const female = isFemaleUnit(unit.templateId, unit.classId);
  const cx = 96;

  // 1. Studio Portrait Radial Vignette Backdrop
  const bgG = ctx.createRadialGradient(cx, 84, 14, cx, 96, 118);
  if (unit.faction === 'PLAYER') {
    bgG.addColorStop(0, '#244564');
    bgG.addColorStop(0.62, '#13273b');
    bgG.addColorStop(1, '#09121d');
  } else {
    bgG.addColorStop(0, '#571c25');
    bgG.addColorStop(0.62, '#2d0e14');
    bgG.addColorStop(1, '#140609');
  }
  ctx.fillStyle = bgG;
  ctx.fillRect(0, 0, W, H);

  // 2. Back Hair (for female specialists/officers)
  if (female) {
    ctx.beginPath();
    ctx.ellipse(cx - 3, 96, 43, 47, 0, 0, Math.PI * 2);
    ctx.fillStyle = vGrad(ctx, 50, 148, pal.hairLight, pal.hairMid, pal.hairDark);
    ctx.fill();
    ctx.strokeStyle = '#10151a';
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }

  // 3. Tailored Military Service Tunic, Notched Lapels, Shirt, Tie, Sam Browne Strap & Ribbons
  const bustPts: [number, number][] = [
    [cx - 84, 192],
    [cx - 68, 146],
    [cx - 26, 130],
    [cx + 26, 130],
    [cx + 68, 146],
    [cx + 84, 192],
  ];
  const tunicG = ctx.createLinearGradient(cx - 72, 130, cx + 72, 192);
  tunicG.addColorStop(0, pal.armorDark);
  tunicG.addColorStop(0.45, pal.armorMid);
  tunicG.addColorStop(0.85, pal.armorLight);
  tunicG.addColorStop(1, pal.armorMid);
  fillStrokePoly(ctx, bustPts, tunicG, '#10151a', 1.8);

  // Crisp Dress Shirt + Service Tie + Notched Lapels
  fillStrokePoly(ctx, [[cx - 16, 128], [cx + 16, 128], [cx, 170]], '#f1f5f9', '#1e293b', 1);
  fillStrokePoly(ctx, [[cx - 4.5, 136], [cx + 4.5, 136], [cx + 6.5, 174], [cx, 182], [cx - 6.5, 174]], '#1e293b', '#09090b', 1.2);
  fillStrokePoly(ctx, [[cx - 29, 130], [cx - 15, 130], [cx, 178], [cx - 23, 156]], pal.armorDark, '#10151a', 1.4);
  fillStrokePoly(ctx, [[cx + 29, 130], [cx + 15, 130], [cx, 178], [cx + 23, 156]], pal.armorLight, '#10151a', 1.4);

  // Shoulder Epaulettes + Gold Rank Stars + Leather Cross-Strap + Campaign Ribbon Bar
  fillStrokePoly(ctx, [[cx - 68, 146], [cx - 31, 133], [cx - 27, 141], [cx - 63, 155]], pal.armorLight, '#10151a', 1.3);
  fillStrokePoly(ctx, [[cx + 68, 146], [cx + 31, 133], [cx + 27, 141], [cx + 63, 155]], pal.armorLight, '#10151a', 1.3);
  for (let s = 0; s < tier; s++) {
    drawGroundInsignia(ctx, cx - 58 + s * 7.5, 147 - s * 2.2, 2.8, false);
    drawGroundInsignia(ctx, cx + 58 - s * 7.5, 147 - s * 2.2, 2.8, false);
  }
  drawShadedRod(ctx, cx + 36, 136, cx - 10, 191, 3.4, 3.4, '#92400e', '#5c2d0c', '#291305', '#0f172a', 1.1);

  roundRectPath(ctx, cx + 20, 162, 28, 7.5, 1.2);
  ctx.fillStyle = '#dc2626';
  ctx.fill();
  ctx.fillStyle = '#eab308';
  ctx.fillRect(cx + 29, 162.8, 9, 6);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(cx + 39, 162.8, 8, 6);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.1;
  ctx.stroke();

  // 4. Sculpted Neck & Anatomically Proportioned 3/4 Human Face with Painterly Studio Skin Shading
  fillStrokePoly(
    ctx,
    [[cx - 14.5, 108], [cx + 14.5, 108], [cx + 16.5, 135], [cx - 16.5, 135]],
    vGrad(ctx, 108, 135, pal.skinShade, pal.skinMid, pal.skinShade),
    'rgba(45, 26, 18, 0.72)',
    1.2
  );
  // Subtle sternocleidomastoid shadow + warm under-chin occlusion shadow
  ctx.fillStyle = 'rgba(32, 16, 10, 0.34)';
  ctx.beginPath();
  ctx.ellipse(cx + 1, 114.5, 13.5, 5.5, 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Ear with inner helix shadow
  ctx.beginPath();
  ctx.ellipse(cx - 34.5, 82, 5.2, 10, -0.08, 0, Math.PI * 2);
  ctx.fillStyle = pal.skinShade;
  ctx.fill();
  ctx.strokeStyle = 'rgba(45, 26, 18, 0.7)';
  ctx.lineWidth = 1.1;
  ctx.stroke();

  // Smooth Bezier Cranium, Cheekbones & Chiseled Jawline
  const jawW = female ? 25 : 29;
  ctx.beginPath();
  ctx.moveTo(cx - 33.5, 72);
  ctx.bezierCurveTo(cx - 34.5, 40, cx + 34.5, 40, cx + 33.5, 72);
  ctx.bezierCurveTo(cx + 33.5, 88, cx + jawW + 2, 98, cx + jawW - 3, 103);
  ctx.quadraticCurveTo(cx + 12, 115, cx + 2, 115);
  ctx.quadraticCurveTo(cx - 10, 115, cx - jawW, 102);
  ctx.bezierCurveTo(cx - 32.5, 94, cx - 33.5, 84, cx - 33.5, 72);
  ctx.closePath();
  const skinG = ctx.createRadialGradient(cx + 9, 68, 7, cx - 3, 84, 48);
  skinG.addColorStop(0, pal.skinLight);
  skinG.addColorStop(0.56, pal.skinMid);
  skinG.addColorStop(1, pal.skinShade);
  ctx.fillStyle = skinG;
  ctx.fill();
  ctx.strokeStyle = 'rgba(42, 24, 16, 0.72)';
  ctx.lineWidth = 1.25;
  ctx.stroke();

  // Painterly cheekbone & far-jaw directional lighting planes
  ctx.save();
  ctx.fillStyle = 'rgba(255, 240, 224, 0.16)';
  ctx.beginPath();
  ctx.ellipse(cx + 15, 84, 9, 5.5, -0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(38, 18, 12, 0.14)';
  ctx.beginPath();
  ctx.ellipse(cx - 21, 90, 8.5, 11, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Realistic Proportioned Human Almond Eyes, Irises, Eyelashes & Eyebrows
  const drawHumanEye = (ex: number, ey: number, rx: number, dir: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ex - rx, ey + 0.5);
    ctx.quadraticCurveTo(ex, ey - 4.2, ex + rx, ey + 0.5);
    ctx.quadraticCurveTo(ex, ey + 3.8, ex - rx, ey + 0.5);
    ctx.closePath();
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.clip();

    const irisG = ctx.createRadialGradient(ex + dir * 0.5, ey + 1, 0.5, ex + dir * 0.5, ey, 3.6);
    irisG.addColorStop(0, '#bae6fd');
    irisG.addColorStop(0.55, pal.eyeColor);
    irisG.addColorStop(1, '#0f172a');
    ctx.beginPath();
    ctx.arc(ex + dir * 0.6, ey, 3.4, 0, Math.PI * 2);
    ctx.fillStyle = irisG;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ex + dir * 0.6, ey, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#09090b';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ex - 0.8, ey - 1.2, 0.95, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    // Upper eyelid lash line & sculpted eyebrow
    ctx.strokeStyle = '#10151a';
    ctx.lineWidth = female ? 2 : 1.8;
    ctx.beginPath();
    ctx.moveTo(ex - rx - 0.5, ey + 0.5);
    ctx.quadraticCurveTo(ex, ey - 4.4, ex + rx + 0.5, ey + 0.5);
    ctx.stroke();

    ctx.strokeStyle = pal.hairDark;
    ctx.lineWidth = female ? 2.2 : 3;
    ctx.beginPath();
    ctx.moveTo(ex - rx - 1, ey - 6 + dir * 0.6);
    ctx.quadraticCurveTo(ex, ey - 8.2, ex + rx + 1.5, ey - 5.5 - dir * 0.6);
    ctx.stroke();
  };

  drawHumanEye(cx - 14.5, 78, 6.5, 1);
  drawHumanEye(cx + 15.5, 78, 7, 1);

  // Realistic 3D Nose Bridge, Tip & Nostrils
  ctx.fillStyle = 'rgba(120, 72, 48, 0.24)';
  ctx.beginPath();
  ctx.moveTo(cx + 1, 75);
  ctx.lineTo(cx - 3, 92);
  ctx.lineTo(cx + 3, 93.5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = pal.skinLight;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + 3, 76);
  ctx.lineTo(cx + 5, 91);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(45, 24, 16, 0.68)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cx - 2, 92.5);
  ctx.quadraticCurveTo(cx + 3, 94.5, cx + 7.5, 92.5);
  ctx.stroke();

  // Natural Upper & Lower Lips
  ctx.fillStyle = female ? 'rgba(168, 62, 62, 0.55)' : 'rgba(132, 74, 62, 0.48)';
  ctx.beginPath();
  ctx.moveTo(cx - 7.5, 101.5);
  ctx.quadraticCurveTo(cx + 2, 98.5, cx + 10.5, 101.5);
  ctx.quadraticCurveTo(cx + 2, 105.5, cx - 7.5, 101.5);
  ctx.fill();
  ctx.strokeStyle = 'rgba(38, 20, 14, 0.72)';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(cx - 7, 101.6);
  ctx.quadraticCurveTo(cx + 2, 102.4, cx + 10, 101.5);
  ctx.stroke();

  // Hairline & Temple Sideburns
  ctx.fillStyle = pal.hairDark;
  ctx.beginPath();
  ctx.moveTo(cx - 34, 56);
  ctx.lineTo(cx - 28, 56);
  ctx.lineTo(cx - 32, 76);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 28, 56);
  ctx.lineTo(cx + 34, 56);
  ctx.lineTo(cx + 32, 74);
  ctx.closePath();
  ctx.fill();

  // 5. Authentic Branch Headgear!
  if (domain === 'NAVAL' || isCommander(unit.classId) || Boolean(unit.isBoss)) {
    const isWhiteCap = domain === 'NAVAL';
    const crownTop = isWhiteCap ? '#ffffff' : pal.armorLight;
    const crownMid = isWhiteCap ? '#e2e8f0' : pal.armorMid;
    const crownDark = isWhiteCap ? '#94a3b8' : pal.armorDark;
    fillStrokePoly(
      ctx,
      [
        [cx - 48, 39],
        [cx - 38, 20],
        [cx + 38, 20],
        [cx + 50, 37],
        [cx + 38, 46],
        [cx - 38, 46],
      ],
      vGrad(ctx, 20, 46, crownTop, crownMid, crownDark),
      '#10151a',
      1.6
    );
    roundRectPath(ctx, cx - 38, 44, 76, 10, 1.5);
    ctx.fillStyle = isWhiteCap ? '#0f172a' : pal.capeDark;
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = pal.goldLight;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx - 36, 50);
    ctx.lineTo(cx + 36, 50);
    ctx.stroke();
    fillStrokePoly(ctx, [[cx - 36, 54], [cx + 38, 54], [cx + 30, 62], [cx - 28, 62]], '#09090b', '#09090b', 1.2);
    ctx.beginPath();
    ctx.arc(cx + 2, 36, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = pal.goldLight;
    ctx.fill();
    ctx.stroke();
  } else if (domain === 'AIRCRAFT') {
    ctx.beginPath();
    ctx.arc(cx, 54, 41, Math.PI * 0.96, Math.PI * 2.04);
    ctx.closePath();
    ctx.fillStyle = tier >= 3 ? vGrad(ctx, 14, 56, '#f8fafc', '#cbd5e1', '#64748b') : vGrad(ctx, 14, 56, '#92400e', '#5c2d0c', '#291305');
    ctx.fill();
    ctx.strokeStyle = '#10151a';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    roundRectPath(ctx, cx - 29, 39, 26, 13, 3);
    ctx.fillStyle = vGrad(ctx, 39, 52, '#bae6fd', '#0284c7', '#0f172a');
    ctx.fill();
    ctx.stroke();
    roundRectPath(ctx, cx + 5, 39, 26, 13, 3);
    ctx.fillStyle = vGrad(ctx, 39, 52, '#bae6fd', '#0284c7', '#0f172a');
    ctx.fill();
    ctx.stroke();
  } else if (domain === 'ARMOR') {
    // CVC Ribbed Tanker Helmet + Dust Goggles & Comms Earcups
    ctx.beginPath();
    ctx.arc(cx, 54, 41, Math.PI * 0.96, Math.PI * 2.04);
    ctx.closePath();
    ctx.fillStyle = vGrad(ctx, 14, 56, '#52525b', '#27272a', '#09090b');
    ctx.fill();
    ctx.stroke();
    roundRectPath(ctx, cx - 28, 41, 25, 12, 2.5);
    ctx.fillStyle = '#fef08a';
    ctx.fill();
    ctx.stroke();
    roundRectPath(ctx, cx + 5, 41, 25, 12, 2.5);
    ctx.fillStyle = '#fef08a';
    ctx.fill();
    ctx.stroke();
  } else {
    // Combat Infantry / Medic Steel & Kevlar Helmet with Rim & Chinstrap
    ctx.beginPath();
    ctx.arc(cx, 55, 43, Math.PI * 0.96, Math.PI * 2.04);
    ctx.closePath();
    ctx.fillStyle = vGrad(ctx, 14, 56, pal.armorLight, pal.armorMid, pal.armorDark);
    ctx.fill();
    ctx.strokeStyle = '#10151a';
    ctx.lineWidth = 1.7;
    ctx.stroke();
    if (isMedic(unit.classId)) {
      ctx.beginPath();
      ctx.arc(cx + 2, 37, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - 0.5, 30, 5, 14);
      ctx.fillRect(cx - 5, 34.5, 14, 5);
    } else if (tier >= 3) {
      roundRectPath(ctx, cx - 6, 33, 14, 12, 2);
      ctx.fillStyle = '#64748b';
      ctx.fill();
      ctx.stroke();
    }
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 33, 55);
    ctx.lineTo(cx - 26, 102);
    ctx.stroke();
  }

  ctx.restore();
}
