import { CLASS_META } from './data';
import type { Unit } from './types';

export type HpBand = 'HIGH' | 'MID' | 'LOW';

export type BattleVoiceArchetype =
  | 'ROYAL_LORD'
  | 'CAVALIER'
  | 'ARMORED'
  | 'ARCHER'
  | 'MAGE'
  | 'CLERIC'
  | 'DUELIST'
  | 'BERSERKER'
  | 'FLIER'
  | 'ASSASSIN'
  | 'DARK_MAGE'
  | 'ENEMY_BOSS'
  | 'ENEMY_SOLDIER';

export interface BattleQuoteResult {
  text: string;
  hpBand: HpBand;
  hpPercent: number;
  archetype: BattleVoiceArchetype;
  archetypeLabel: string;
  isCrit: boolean;
}

export interface CombatSpeechBubble {
  id: string;
  unitId: string;
  x: number;
  y: number;
  text: string;
  faction: 'PLAYER' | 'ENEMY';
  hpBand: HpBand;
  hpPercent: number;
  isCrit?: boolean;
  age: number;
  duration: number;
}

export interface PickBattleQuoteOptions {
  isCrit?: boolean;
  avoidText?: string | null;
  rng?: () => number;
}

export const ARCHETYPE_LABELS: Record<BattleVoiceArchetype, string> = {
  ROYAL_LORD: 'Quân Chủ',
  CAVALIER: 'Kỵ Sĩ',
  ARMORED: 'Trọng Giáp',
  ARCHER: 'Cung Thủ',
  MAGE: 'Pháp Sư',
  CLERIC: 'Thánh Chức',
  DUELIST: 'Kiếm Khách',
  BERSERKER: 'Cuồng Chiến',
  FLIER: 'Không Kỵ',
  ASSASSIN: 'Ám Sát',
  DARK_MAGE: 'Hắc Thuật',
  ENEMY_BOSS: 'Thủ Lĩnh',
  ENEMY_SOLDIER: 'Chiến Binh',
};

/**
 * Computes normalized HP percentage (0..100) from current and max HP.
 */
export function computeHpPercent(hp: number, maxHp: number): number {
  const safeMax = Math.max(1, maxHp);
  const clamped = Math.max(0, Math.min(safeMax, hp));
  return Math.round((clamped / safeMax) * 100);
}

/**
 * Classifies unit HP ratio into 3 distinct emotional combat bands:
 * - HIGH: >= 65% HP (confident, composed, commanding)
 * - MID:  30%..64% HP (focused, gritty, battle-hardened)
 * - LOW:  < 30% HP (desperate, defiant last-stand resolve)
 */
export function getHpBand(hp: number, maxHp: number): HpBand {
  const safeMax = Math.max(1, maxHp);
  const ratio = Math.max(0, Math.min(1, hp / safeMax));
  if (ratio >= 0.65) return 'HIGH';
  if (ratio >= 0.3) return 'MID';
  return 'LOW';
}

/**
 * Maps any of the 121 classes across all 30 lineages (plus enemy bosses & soldiers)
 * to a distinct Combat Voice Archetype using class metadata, lineage id, moveType, and weapon.
 */
export function resolveBattleVoiceArchetype(
  unit: Pick<Unit, 'classId' | 'faction' | 'isBoss' | 'isLord' | 'moveType' | 'weapon'>
): BattleVoiceArchetype {
  if (unit.faction === 'ENEMY' && unit.isBoss) {
    return 'ENEMY_BOSS';
  }

  const meta = CLASS_META[unit.classId];
  const key = `${unit.classId} ${meta?.name ?? ''}`.toUpperCase();

  // 1. Royal / Sovereign Lord classes (respects reclassing if a Lord changes into Mage/Wyvern/etc.)
  if (
    /\b(LORD|GREAT_LORD|SOVEREIGN|EMPEROR_LORD|PRINCE|MONARCH|CROWN|VALORIA)\b/.test(key) &&
    !/(WYVERN|DRAGON|DARK|SHADOW|WAR)/.test(key)
  ) {
    return 'ROYAL_LORD';
  }

  // 2. Dark / Occult / Necromancer casters
  if (/(DARK|NECRO|WARLOCK|LICH|OCCULT|VOID|ABYSS|HEX|BLOOD|CURSE|DOOM|SHADOW_MAGE)/.test(key)) {
    return 'DARK_MAGE';
  }

  // 3. Assassins / Rogues / Ninjas
  if (/(THIEF|ASSASSIN|NINJA|ROGUE|SHINOBI|PHANTOM|TRICKSTER|SHADOW|NIGHTBLADE|NIGHTSTALKER|SPY|WHISPER)/.test(key)) {
    return 'ASSASSIN';
  }

  // 4. Clerics / Healers / Priests / Saints
  if (
    unit.weapon?.type === 'STAFF' ||
    /(CLERIC|PRIEST|BISHOP|SAINT|ORACLE|MONK|SHRINE|TEMPLAR|DIVINER|SERAPH|HEALER|INQUISITOR)/.test(key)
  ) {
    return 'CLERIC';
  }

  // 5. Flying riders (Wyvern / Pegasus / Gryphon / Sky)
  if (
    unit.moveType === 'FLYING' ||
    meta?.moveType === 'FLYING' ||
    /(WYVERN|PEGASUS|FALCON|GRYPHON|SKY|KINSHI|DRAGONLORD|DRAKE|WING)/.test(key)
  ) {
    return 'FLIER';
  }

  // 6. Archers / Snipers / Marksmen
  if (
    unit.weapon?.type === 'BOW' ||
    /(ARCHER|SNIPER|BOW|HUNTER|RANGER|DEADEYE|MARKSMAN|BALLISTA)/.test(key)
  ) {
    return 'ARCHER';
  }

  // 7. Arcane / Elemental Mages & Sages
  if (
    unit.weapon?.type === 'TOME' ||
    /(MAGE|SAGE|WIZARD|ARCHMAGE|ARCAN|ELEMENT|CHRONO|ASTRAL|RUNE|PYRO|CRYO|STORM_CALLER|MYSTIC|SPELL)/.test(key)
  ) {
    return 'MAGE';
  }

  // 8. Heavy Armored Knights / Generals / Bastions
  if (
    unit.moveType === 'ARMORED' ||
    meta?.moveType === 'ARMORED' ||
    /(ARMOR|KNIGHT|GENERAL|BASTION|AEGIS|SENTINEL|GUARDIAN|PHALANX|FORTRESS|TITAN|WARDEN)/.test(key)
  ) {
    return 'ARMORED';
  }

  // 9. Mounted Cavaliers / Paladins / Lancers
  if (
    unit.moveType === 'MOUNTED' ||
    meta?.moveType === 'MOUNTED' ||
    /(CAVALIER|PALADIN|VALKYRIE|DRAGOON|CHARGER|JOUSTER|HORSE|NOMAD|TROUBADOUR)/.test(key)
  ) {
    return 'CAVALIER';
  }

  // 10. Axe Fighters / Berserkers / Warriors / Brigands
  if (
    unit.weapon?.type === 'AXE' ||
    /(FIGHTER|WARRIOR|BERSERKER|BRIGAND|BARBARIAN|VIKING|GLADIATOR|RAIDER|BREAKER|JUGGERNAUT|BRAWLER|PIRATE|CORSAIR)/.test(
      key
    )
  ) {
    return 'BERSERKER';
  }

  // 11. Sword Duelists / Myrmidons / Mercenaries / Samurai
  if (
    unit.weapon?.type === 'SWORD' ||
    /(MYRMIDON|SWORD|BLADE|SAMURAI|RONIN|KENSEI|MERCENARY|HERO|DUELIST|FENCER|VANGUARD|SPEARMASTER|HALBERDIER)/.test(
      key
    )
  ) {
    return 'DUELIST';
  }

  // 12. Fallback for generic soldiers (spearmen / foot guards)
  if (unit.faction === 'ENEMY') {
    return 'ENEMY_SOLDIER';
  }
  return 'CAVALIER';
}

type QuoteTable = Record<BattleVoiceArchetype, Record<HpBand, readonly string[]>>;

export const BATTLE_QUOTE_POOLS: QuoteTable = {
  ROYAL_LORD: {
    HIGH: [
      'Nhân danh Valoria, tiến lên!',
      'Kiếm của ta định đoạt trận này!',
      'Đừng hòng vượt qua tuyến phòng thủ!',
      'Ánh sáng vương ấn sẽ dẫn lối!',
      'Hãy chứng kiến uy nghi của ta!',
    ],
    MID: [
      'Vết thương này chẳng là gì cả!',
      'Giữ vững đội hình, ta chưa gục!',
      'Ngươi khá lắm… nhưng chưa đủ!',
      'Ta sẽ mở đường cho đồng đội!',
      'Ý chí vương tộc không thể lay chuyển!',
    ],
    LOW: [
      'Ta không thể ngã xuống ở đây!',
      'Dù cạn sức, ta vẫn sẽ chiến đấu!',
      'Một đòn cuối vì danh dự Valoria!',
      'Chưa kết thúc đâu… đỡ lấy đi!',
      'Lưỡi kiếm này sẽ không bao giờ gãy!',
    ],
  },

  CAVALIER: {
    HIGH: [
      'Xung phong! Đạp nát đội hình địch!',
      'Ngọn thương kỵ sĩ không hề chệch hướng!',
      'Tiến lên nào, chiến mã của ta!',
      'Kỵ binh Valoria mở đường máu!',
      'Tốc độ này ngươi không kịp đỡ đâu!',
    ],
    MID: [
      'Còn thở là còn xung kích!',
      'Đỡ lấy cú đâm phá giáp này!',
      'Chiến mã chưa chùn bước, ta cũng vậy!',
      'Chuyển thế! Phản công ngay lập tức!',
      'Đừng coi thường kỵ sĩ tiền tuyến!',
    ],
    LOW: [
      'Một cú đột kích cuối cùng!',
      'Giáp vỡ thì sao? Ta vẫn lao tới!',
      'Vì đồng đội phía sau, tiến lên!',
      'Đòn này đổi cả mạng cũng đáng!',
      'Kỵ sĩ không bao giờ quay lưng!',
    ],
  },

  ARMORED: {
    HIGH: [
      'Tường thép bất khả xâm phạm!',
      'Đánh tới đi, giáp ta không hề hấn!',
      'Bước qua xác ta trước đã!',
      'Sức nặng của thép sẽ nghiền nát ngươi!',
      'Vững như bàn thạch giữa chiến trường!',
    ],
    MID: [
      'Khá đau đấy… nhưng vẫn trụ vững!',
      'Khiên này chưa nứt đâu, nhào vô!',
      'Giữ chặt tuyến đầu, không lùi một bước!',
      'Lực đánh đó chỉ làm ta nóng máy thôi!',
      'Đến lượt ta đáp lễ rồi!',
    ],
    LOW: [
      'Giáp nát, nhưng ý chí vẫn là thép!',
      'Ta đứng đây, không kẻ nào qua được!',
      'Một hơi thở cuối… giữ vững chiến tuyến!',
      'Nghiền nát ngươi trước khi ta gục!',
      'Pháo đài này sẽ không sụp đổ!',
    ],
  },

  ARCHER: {
    HIGH: [
      'Đã khóa mục tiêu. Bắn!',
      'Mũi tên này không bao giờ trượt!',
      'Tầm ngắm hoàn hảo… tiễn ngươi lên đường!',
      'Nghe tiếng gió rít không? Quá muộn rồi!',
      'Một phát xuyên tâm, gọn ghẽ!',
    ],
    MID: [
      'Hít sâu… giữ vững dây cung!',
      'Đừng hòng áp sát tầm bắn của ta!',
      'Còn tên trong ống là ngươi còn nguy!',
      'Nhắm chuẩn điểm yếu mà bắn!',
      'Thử né mũi tên này xem nào!',
    ],
    LOW: [
      'Tay run rồi… nhưng mắt vẫn sắc!',
      'Mũi tên sinh tử! Trúng đi!',
      'Không được trượt… tất cả vào phát này!',
      'Còn một mũi tên cuối cho ngươi!',
      'Đừng mơ hạ gục xạ thủ dễ thế!',
    ],
  },

  MAGE: {
    HIGH: [
      'Nguyên tố cổ xưa, nghe lệnh ta!',
      'Ma lực hội tụ… tan thành tro bụi đi!',
      'Kiến thức là lưỡi kiếm sắc nhất!',
      'Chiêm ngưỡng sức mạnh pháp thuật thực thụ!',
      'Chú ngữ hoàn tất — khai hỏa!',
    ],
    MID: [
      'Không được mất tập trung… niệm chú!',
      'Ma lực vẫn còn dồi dào lắm!',
      'Ngươi ép ta phải dùng cấm thuật rồi!',
      'Phá vỡ phòng ngự bằng dòng chảy ma năng!',
      'Đừng để áp lực làm rối loạn pháp trận!',
    ],
    LOW: [
      'Dốc cạn toàn bộ ma lực vào đòn này!',
      'Dù kiệt sức… phép thuật sẽ thiêu rụi ngươi!',
      'Ngọn lửa cuối cùng, bùng cháy đi!',
      'Ta chưa thể ngã… giải phóng toàn lực!',
      'Hồn lực cộng hưởng — bùng nổ!',
    ],
  },

  CLERIC: {
    HIGH: [
      'Ánh sáng thánh thiện sẽ thanh tẩy ngươi!',
      'Nguyện thần linh ban phước cho trận chiến!',
      'Bóng tối không thể tồn tại trước ta!',
      'Bằng đức tin, ta sẽ bảo vệ tất cả!',
      'Thánh quang dẫn đường cho chính nghĩa!',
    ],
    MID: [
      'Xin ánh sáng tiếp thêm kiên định!',
      'Dù bị thương, ta vẫn che chở đồng đội!',
      'Lòng tin này chẳng thể bị khuất phục!',
      'Thánh lực, hãy trừng phạt kẻ tà ác!',
      'Ta phải trụ vững để cứu lấy mọi người!',
    ],
    LOW: [
      'Xin ban cho con sức mạnh lần cuối…',
      'Ánh sáng nhỏ nhoi cũng xua tan màn đêm!',
      'Ta sẽ không bỏ rơi đồng đội đâu!',
      'Lời cầu nguyện cuối cùng… ứng nghiệm đi!',
      'Đức tin sẽ giữ ta đứng vững!',
    ],
  },

  DUELIST: {
    HIGH: [
      'Chớp mắt là ngươi thua rồi!',
      'Xem đường kiếm của ta có nhanh không!',
      'Tư thế ngươi sơ hở quá nhiều!',
      'Một nhát dứt điểm, không thừa động tác!',
      'Kiếm ý đã thành — tiếp chiêu đi!',
    ],
    MID: [
      'Khá lắm! Đáng để ta rút hết kiếm kỹ!',
      'Máu đổ càng khiến lưỡi kiếm sắc hơn!',
      'Thấy kẽ hở rồi — chém!',
      'Nhanh hơn nữa… cắt đứt đòn của ngươi!',
      'Cuộc đấu kiếm này bắt đầu thú vị rồi đấy!',
    ],
    LOW: [
      'Tuyệt kiếm sinh tử! Tất cả vào nhát này!',
      'Cận kề cái chết mới thấy rõ đường kiếm!',
      'Một nhát kết liễu… không còn đường lui!',
      'Kiếm khách thà gãy chứ không khuất phục!',
      'Đừng chớp mắt — đây là chiêu cuối!',
    ],
  },

  BERSERKER: {
    HIGH: [
      'Hahaha! Đỡ nổi nhát rìu này không?!',
      'Nghiền nát hết bọn chúng đi!',
      'Nhào hết vào đây! Ta chấp tất!',
      'Một bổ chẻ đôi cả khiên lẫn giáp!',
      'Chiến trường này thuộc về ta!',
    ],
    MID: [
      'Đau đấy! Càng đánh ta càng hăng!',
      'Máu nóng sôi lên rồi — chịu chết đi!',
      'Chỉ gãi ngứa thôi! Xem sức ta đây!',
      'Rìu này chưa thấm máu đủ đâu!',
      'Gầm lên và đập tan phòng tuyến!',
    ],
    LOW: [
      'Chưa chết thì ta vẫn còn bổ được!',
      'Cơn cuồng nộ cuối cùng — tan xác đi!',
      'Ngươi muốn mạng ta? Lại đây mà lấy!',
      'Đánh đổi hết! Nếm mùi điên cuồng này!',
      'Gào thét đi! Ta sẽ kéo ngươi theo!',
    ],
  },

  FLIER: {
    HIGH: [
      'Từ bầu trời cao, lao xuống kết liễu!',
      'Đôi cánh này làm chủ cả chiến trường!',
      'Ngước lên trời mà cầu nguyện đi!',
      'Cơn lốc trên không — không lối thoát!',
      'Bay cao và giáng đòn như thiên lôi!',
    ],
    MID: [
      'Gió ngược chẳng cản nổi đôi cánh ta!',
      'Lượn vòng và đánh thẳng vào sườn địch!',
      'Chưa rơi đâu! Còn bay là còn chiến!',
      'Giữ thăng bằng… lao xuống lần nữa!',
      'Không kích quyết định — tiến công!',
    ],
    LOW: [
      'Cánh rách rồi… nhưng cú bổ này vẫn chí mạng!',
      'Lao xuống lần cuối cùng từ đỉnh trời!',
      'Bầu trời sẽ chứng giám đòn quyết tử này!',
      'Không hạ cánh cho đến khi ngươi gục!',
      'Bay xuyên bão tố — tất tay!',
    ],
  },

  ASSASSIN: {
    HIGH: [
      'Trong bóng tối… ngươi đã mất mạng rồi.',
      'Không tiếng động, không dấu vết.',
      'Điểm yếu lộ rõ quá… kết thúc thôi.',
      'Lưỡi dao lướt qua nhanh hơn hơi thở.',
      'Đừng quay lại — đã quá muộn.',
    ],
    MID: [
      'Bị phát hiện rồi à? Cũng chẳng sao!',
      'Lẩn vào bóng đêm và tung đòn chí tử!',
      'Ngươi phản xạ nhanh đấy… thử lần nữa xem!',
      'Mục tiêu cứng đầu thật — dứt điểm thôi!',
      'Một vết cắt hiểm hóc là đủ!',
    ],
    LOW: [
      'Đường cùng rồi… lưỡi dao cuối cùng!',
      'Hoặc ngươi ngã, hoặc bóng tối nuốt lấy ta!',
      'Cược tất cả vào nhát đâm xuyên tim!',
      'Ám ảnh cuối cùng trước khi tan biến!',
      'Đừng coi thường kẻ bị dồn vào góc tối!',
    ],
  },

  DARK_MAGE: {
    HIGH: [
      'Bóng đêm cổ đại, nuốt chửng chúng đi!',
      'Lời nguyền đã khắc — ngươi hết đường chạy!',
      'Hư không đang gọi tên ngươi đấy…',
      'Cảm nhận nỗi kinh hoàng của hắc thuật!',
      'Màn đêm trùm xuống — tuyệt vọng đi!',
    ],
    MID: [
      'Nỗi đau chỉ nuôi dưỡng hắc lực mạnh hơn!',
      'Máu đổi cấm chú… hãy nếm trải đi!',
      'Sức mạnh vực thẳm đang trào dâng!',
      'Ngươi dám chống lại bóng tối sao?',
      'Hắc ấn khai mở — gục ngã đi!',
    ],
    LOW: [
      'Hiến tế sinh lực… triệu hồi vực sâu!',
      'Dù tan xương, lời nguyền vẫn kéo ngươi xuống!',
      'Bóng tối vĩnh hằng — bùng nổ cùng ta!',
      'Cấm thuật tuyệt diệt! Không ai thoát được!',
      'Hư không… hãy nuốt trọn kẻ này!',
    ],
  },

  ENEMY_BOSS: {
    HIGH: [
      'Lũ sâu kiến dám thách thức ta sao?!',
      'Quỳ xuống trước sức mạnh tuyệt đối!',
      'Nơi đây sẽ là mồ chôn của các ngươi!',
      'Để ta tự tay nghiền nát đội quân này!',
      'Thật nực cười! Hãy nếm mùi tuyệt vọng!',
    ],
    MID: [
      'Hừ… ngươi làm ta đổ máu được rồi đấy!',
      'Khá lắm, nhưng trò chơi kết thúc tại đây!',
      'Đừng tưởng vài vết xước là thắng được ta!',
      'Ta sẽ cho ngươi thấy thực lực thật sự!',
      'Lũ ngoan cố! Chết hết đi cho khuất mắt!',
    ],
    LOW: [
      'Không thể nào… ta không thể bại ở đây!',
      'Grrr! Kẻ nào dám đẩy ta đến bước này?!',
      'Dù gục ngã, ta cũng kéo ngươi xuống địa ngục!',
      'Toàn lực hủy diệt — biến mất đi!',
      'Ta là bất bại… cút khỏi tầm mắt ta!',
    ],
  },

  ENEMY_SOLDIER: {
    HIGH: [
      'Giữ vững hàng ngũ! Hạ gục chúng!',
      'Lệnh đã ban — không tha một tên nào!',
      'Xông lên! Đừng để chúng tiến thêm!',
      'Ngươi sẽ không qua được ải này đâu!',
      'Nếm thử vũ khí của quân đoàn ta!',
    ],
    MID: [
      'Khốn kiếp… bọn chúng mạnh hơn ta tưởng!',
      'Cầm cự lên! Đánh trả ngay!',
      'Vết thương này chưa hạ được ta đâu!',
      'Không được lùi! Quyết chiến tới cùng!',
      'Đỡ lấy đòn phản công này!',
    ],
    LOW: [
      'Chết tiệt… ta sắp không trụ nổi rồi!',
      'Không thể bỏ mạng dễ dàng thế được!',
      'Một đòn liều mạng cuối cùng!',
      'Tiếp viện đâu?! Ta vẫn sẽ chống cự!',
      'Dù gục ngã cũng phải kéo ngươi bị thương!',
    ],
  },
};

/**
 * Selects a randomized battle quote tailored to the unit's class archetype and live HP percentage.
 * Supports deterministic RNG injection for unit testing and anti-repeat filtering across strikes.
 */
export function pickBattleQuote(
  unit: Pick<Unit, 'classId' | 'faction' | 'isBoss' | 'isLord' | 'moveType' | 'weapon'>,
  currentHp: number,
  maxHp: number,
  options: PickBattleQuoteOptions = {}
): BattleQuoteResult {
  const { isCrit = false, avoidText = null, rng = Math.random } = options;
  const archetype = resolveBattleVoiceArchetype(unit);
  const hpBand = getHpBand(currentHp, maxHp);
  const hpPercent = computeHpPercent(currentHp, maxHp);
  const pool = BATTLE_QUOTE_POOLS[archetype][hpBand];

  const candidates =
    avoidText && pool.length > 1 ? pool.filter((q) => q !== avoidText) : pool;

  const rawRand = rng();
  const safeRand = Number.isFinite(rawRand) ? Math.abs(rawRand % 1) : 0;
  const idx = Math.min(candidates.length - 1, Math.floor(safeRand * candidates.length));

  return {
    text: candidates[idx],
    hpBand,
    hpPercent,
    archetype,
    archetypeLabel: ARCHETYPE_LABELS[archetype],
    isCrit,
  };
}
