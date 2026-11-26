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
  | 'NAVAL'
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
  ROYAL_LORD: 'Chỉ Huy',
  CAVALIER: 'Cơ Giới',
  ARMORED: 'Thiết Giáp',
  ARCHER: 'Bắn Tỉa / PK',
  MAGE: 'Pháo Binh',
  CLERIC: 'Quân Y',
  DUELIST: 'Xung Kích',
  BERSERKER: 'Hỏa Lực Nặng',
  FLIER: 'Không Quân',
  ASSASSIN: 'Đặc Nhiệm',
  DARK_MAGE: 'Trọng Pháo',
  NAVAL: 'Hải Quân',
  ENEMY_BOSS: 'Tư Lệnh Địch',
  ENEMY_SOLDIER: 'Quân Trục',
};

export function computeHpPercent(hp: number, maxHp: number): number {
  const safeMax = Math.max(1, maxHp);
  const clamped = Math.max(0, Math.min(safeMax, hp));
  return Math.round((clamped / safeMax) * 100);
}

export function getHpBand(hp: number, maxHp: number): HpBand {
  const safeMax = Math.max(1, maxHp);
  const ratio = Math.max(0, Math.min(1, hp / safeMax));
  if (ratio >= 0.65) return 'HIGH';
  if (ratio >= 0.3) return 'MID';
  return 'LOW';
}

export function resolveBattleVoiceArchetype(
  unit: Pick<Unit, 'classId' | 'faction' | 'isBoss' | 'isLord' | 'moveType' | 'weapon'>
): BattleVoiceArchetype {
  if (unit.faction === 'ENEMY') {
    return unit.isBoss ? 'ENEMY_BOSS' : 'ENEMY_SOLDIER';
  }

  const meta = CLASS_META[unit.classId];
  const key = `${unit.classId} ${meta?.name ?? ''}`.toUpperCase();

  // 1. Naval Warships & Submarines
  if (unit.moveType === 'NAVAL' || meta?.moveType === 'NAVAL' || meta?.domain === 'NAVAL') {
    return 'NAVAL';
  }

  // 2. Field Commanders (LORD lineage)
  if (/\b(LORD|GREAT_LORD|SOVEREIGN|EMPEROR_LORD)\b/.test(unit.classId)) {
    return 'ROYAL_LORD';
  }

  // 3. Heavy Siege & Railway Artillery
  if (/\b(DARK_MAGE|NECROMANCER|DARK_DRUID|ABYSSAL_ARCHON)\b/.test(unit.classId)) {
    return 'DARK_MAGE';
  }

  // 4. Recon / SOE / OSS / SAS Commandos
  if (/\b(THIEF|ASSASSIN|WHISPER|PHANTOM_REAPER|NINJA|MASTER_NINJA|SHADOW_KAGE|PHANTOM_SHOGUN)\b/.test(unit.classId)) {
    return 'ASSASSIN';
  }

  // 5. Field Medics & Repair Engineers
  if (
    unit.weapon?.type === 'STAFF' ||
    /\b(CLERIC|BISHOP|SAINT|SERAPH_PROPHET|WAR_CLERIC|BATTLE_PRIEST|CRUSADER_BISHOP|WRATHFUL_SERAPH)\b/.test(unit.classId)
  ) {
    return 'CLERIC';
  }

  // 6. Military Aircraft (Fighters, Dive Bombers, Seaplanes, B-17)
  if (unit.moveType === 'FLYING' || meta?.moveType === 'FLYING' || meta?.domain === 'AIRCRAFT') {
    return 'FLIER';
  }

  // 7. Snipers & Anti-Air Flak Batteries
  if (unit.weapon?.type === 'BOW' || /\b(ARCHER|SNIPER|MARKSMAN|STARFALL_ARCHER)\b/.test(unit.classId)) {
    return 'ARCHER';
  }

  // 8. Field Artillery, Katyusha Rockets & Radar Fire-Control
  if (
    unit.weapon?.type === 'TOME' ||
    meta?.domain === 'ARTILLERY' ||
    /\b(MAGE|SAGE|ARCHSAGE|ASTRAL_ORACLE|MONK|EXORCIST|INQUISITOR|SOLAR_HIEROPHANT|SHAMAN|SPIRIT_CALLER|ELDER_ORACLE|PRIMORDIAL_AVATAR|CHRONOMANCER|ASTROLOGER|TIME_WEAVER|ETERNAL_CHRONOS)\b/.test(
      unit.classId
    )
  ) {
    return 'MAGE';
  }

  // 9. Heavy Breakthrough Tanks & Tank Destroyers
  if (unit.moveType === 'ARMORED' || meta?.moveType === 'ARMORED') {
    return 'ARMORED';
  }

  // 10. Medium Tanks, Half-Tracks & Motorized Hellcats
  if (unit.moveType === 'MOUNTED' || meta?.moveType === 'MOUNTED') {
    return 'CAVALIER';
  }

  // 11. Heavy Machine Gunners, Flamethrowers & Demolition Sappers
  if (
    unit.weapon?.type === 'AXE' ||
    /\b(FIGHTER|BERSERKER|REAVER|WAR_GOD|BRAWLER|WAR_MONK|IRON_FIST_MASTER|TITAN_DEMIGOD)\b/.test(key)
  ) {
    return 'BERSERKER';
  }

  // 12. Assault Infantry, SMG Commandos, Marines & Anti-Tank Infantry
  if (
    unit.weapon?.type === 'SWORD' ||
    /\b(MYRMIDON|SWORDMASTER|TRUEBLADE|SWORD_SAINT|MERCENARY|HERO|VANGUARD|LEGEND_CHAMPION|SOLDIER|HALBERDIER|SENTINEL|SPEAR_EMPEROR|SAMURAI|RONIN_MASTER|SHOGUN_BLADE|HEAVEN_KENSEI|SPELLBLADE|MORTAL_SAVANT|RUNE_BLADE|AETHER_SOVEREIGN)\b/.test(
      unit.classId
    )
  ) {
    return 'DUELIST';
  }

  return 'DUELIST';
}

type QuoteTable = Record<BattleVoiceArchetype, Record<HpBand, readonly string[]>>;

export const BATTLE_QUOTE_POOLS: QuoteTable = {
  ROYAL_LORD: {
    HIGH: [
      'Toàn tiểu đoàn nghe lệnh — xung phong!',
      'Đã khóa mục tiêu tiền phương, khai hỏa!',
      'Phòng tuyến Liên Minh quyết không lùi bước!',
      'Hiệp đồng hỏa lực — mở đột phá khẩu!',
      'Vì tự do và hòa bình, tiến lên!',
    ],
    MID: [
      'Trúng mảnh đạn sượt thôi — giữ vững chiến hào!',
      'Đài chỉ huy vẫn hoạt động, tiếp tục bắn!',
      'Địch phản kích rát đấy, yểm trợ lẫn nhau!',
      'Không bỏ vị trí! Đẩy lùi bọn chúng!',
      'Nạp đạn nhanh — phản công ngay lập tức!',
    ],
    LOW: [
      'Còn viên đạn cuối cùng cũng quyết giữ chốt!',
      'Không kẻ địch nào bước qua được công sự này!',
      'Tập trung toàn bộ hỏa lực vào phát bắn này!',
      'Dù kiệt sức vẫn đứng vững nơi tuyến đầu!',
      'Vì đồng đội phía sau — bóp cò!',
    ],
  },

  CAVALIER: {
    HIGH: [
      'Động cơ tối đa! Thiết giáp xung kích!',
      'Tháp pháo đã ngắm chuẩn — bắn hành tiến!',
      'Xích thép Sherman mở đường cho bộ binh!',
      'Tốc độ cơ giới này địch không kịp xoay nòng đâu!',
      'Bọc sườn đội hình địch — khai hỏa!',
    ],
    MID: [
      'Đạn sượt vỏ tháp pháo rồi, vẫn cơ động tốt!',
      'Nạp đạn xuyên giáp! Trả đòn ngay!',
      'Hộp số vẫn chạy êm — tiến sát kết liễu!',
      'Giữ đội hình mũi nhọn thiết giáp!',
      'Đừng để pháo chống tăng địch khóa mục tiêu!',
    ],
    LOW: [
      'Khói bốc khoang máy rồi… bắn viên quyết định!',
      'Xích đứt một bên thì biến thành lô cốt thép!',
      'Đưa viên đạn xuyên giáp cuối cùng vào buồng pháo!',
      'Chiến xa Liên Minh không bao giờ đầu hàng!',
      'Nổ tung mục tiêu trước khi động cơ tắt!',
    ],
  },

  ARMORED: {
    HIGH: [
      'Giáp nghiêng thép đúc — bắn vào chỉ nảy đạn thôi!',
      'Siêu tăng hạng nặng tiến lên nghiền nát lô cốt!',
      'Khóa tầm pháo chính — một phát xuyên tâm!',
      'Bức tường thiết giáp bất khả xâm phạm!',
      'Sức nặng của thép sẽ đè bẹp phòng tuyến địch!',
    ],
    MID: [
      'Chấn động mạnh đấy, nhưng giáp trước chưa thủng!',
      'Xoay tháp pháo 12 giờ — đáp lễ bằng đạn nặng!',
      'Giữ chặt chốt chặn cầu, không lùi nửa mét!',
      'Chỉ tróc sơn ngoài thôi, khai hỏa!',
      'Pháo tự hành đã nạp xong — bắn!',
    ],
    LOW: [
      'Khoang lái đầy khói… nhưng pháo chính vẫn nổ được!',
      'Chặn đứng chúng ngay tại đây bằng mọi giá!',
      'Viên đạn liều phóng tối đa — xuyên thủng chúng đi!',
      'Pháo đài thép này quyết không gục ngã!',
      'Đứng vững như bàn thạch giữa biển lửa!',
    ],
  },

  ARCHER: {
    HIGH: [
      'Tâm kính ngắm đã khớp mục tiêu. Bóp cò!',
      'Đã tính đủ tốc độ gió — một viên hạ gục!',
      'Lưới lửa phòng không khóa chặt bầu trời!',
      'Đừng hòng lọt qua tầm ngắm quang học này!',
      'Mục tiêu nằm gọn trong thước ngắm — bắn!',
    ],
    MID: [
      'Nín thở… giữ ổn định báng súng!',
      'Thay vị trí bắn tỉa và phản kích ngay!',
      'Nòng phòng không đang nóng đỏ — tiếp đạn nhanh!',
      'Nhắm thẳng khe quan sát của chúng mà bắn!',
      'Thử né viên đạn xuyên giáp tầm xa này xem!',
    ],
    LOW: [
      'Kính ngắm nứt rồi… bắn bằng thước ngắm cơ khí!',
      'Viên đạn sinh tử cuối cùng trong hộp tiếp đạn!',
      'Không được phép trượt — kết thúc mục tiêu!',
      'Còn giữ cò súng là bầu trời này còn vững!',
      'Một phát quyết định từ đống đổ nát!',
    ],
  },

  MAGE: {
    HIGH: [
      'Tọa độ pháo binh đã khớp — toàn khẩu đội cấp tập!',
      'Nâng góc tầm… dội bão lửa xuống trận địa địch!',
      'Dàn Katyusha đã lên bệ phóng — khai hỏa!',
      'Đạn nổ phá mảnh rơi trúng đỉnh công sự rồi!',
      'Hiệu chỉnh thước tầm hoàn tất — phóng!',
    ],
    MID: [
      'Địch đang phản pháo! Giữ vững trận địa pháo!',
      'Nạp liều phóng tăng cường — bắn trùm mục tiêu!',
      'Khói lửa mù mịt nhưng tọa độ radar vẫn rõ!',
      'Chuyển sang chế độ bắn gấp không khoan nhượng!',
      'Tiếp đạn nhanh lên, đừng để ngắt nhịp pháo kích!',
    ],
    LOW: [
      'Khẩu đội tổn thất nặng… dồn hết đạn vào loạt cuối!',
      'Hạ nòng bắn thẳng trực diện luôn — khai hỏa!',
      'Loạt pháo quyết tử thiêu rụi đội hình địch!',
      'Còn một quả đạn trên giá phóng cũng phải bắn!',
      'Toàn bộ hỏa lực dự trữ — dội xuống ngay!',
    ],
  },

  CLERIC: {
    HIGH: [
      'Trạm quân y tiền phương luôn sẵn sàng tiếp ứng!',
      'Giữ vững vị trí, băng gạc và huyết tương đã tới!',
      'Chiếu sáng chiến trường — yểm trợ đồng đội!',
      'Không một thương binh nào bị bỏ lại phía sau!',
      'Vừa cứu thương vừa giữ vững tuyến hậu cần!',
    ],
    MID: [
      'Đạn pháo rơi sát lều quân y rồi, bình tĩnh nào!',
      'Dù bị thương tôi vẫn sơ cứu được cho mọi người!',
      'Tổ công binh cứu hộ đang giữ chặt phòng tuyến!',
      'Bắn pháo hiệu chế áp để bảo vệ thương binh!',
      'Cố lên anh em, tiếp viện y tế ngay sau lưng!',
    ],
    LOW: [
      'Túi cứu thương đẫm bụi khói… vẫn còn chiến đấu được!',
      'Bảo vệ lều thương binh tới hơi thở cuối cùng!',
      'Tôi quyết không lùi khỏi vị trí cứu hộ này!',
      'Dốc toàn lực cho đòn yểm trợ sinh tử!',
      'Niềm tin chiến thắng sẽ giữ chúng ta đứng vững!',
    ],
  },

  DUELIST: {
    HIGH: [
      'Tiểu liên đã lên đạn — tràn qua chiến hào!',
      'Lựu đạn mở đường, xung kích cận chiến!',
      'Tốc độ càn quét này địch không kịp lên quy lát!',
      'Loạt đạn điểm xạ gọn ghẽ, dứt điểm mục tiêu!',
      'Lính xung kích tiền phương — áp sát!',
    ],
    MID: [
      'Khá lắm! Thay băng đạn trống và quét tiếp!',
      'Khói thuốc súng càng đặc, nhịp tiến càng nhanh!',
      'Phát hiện hỏa điểm địch — vòng sang sườn tiêu diệt!',
      'Vượt kẽm gai, nổ súng ngay trong tầm gần!',
      'Cuộc đấu súng cận chiến giờ mới thật sự nóng lên!',
    ],
    LOW: [
      'Hết băng đạn phụ rồi… tra lưỡi lê quyết chiến!',
      'Giữa đống gạch vụn này chỉ một bên bước ra thôi!',
      'Loạt đạn cuối cùng ở cự ly không thể trượt!',
      'Chiến sĩ xung kích thà gục chứ không lùi một tấc!',
      'Lao lên dứt điểm ngay bây giờ!',
    ],
  },

  BERSERKER: {
    HIGH: [
      'Đại liên hạng nặng khai hỏa — quét sạch bọn chúng!',
      'Mở van bình áp suất… súng phun lửa thiêu rụi lô cốt!',
      'Ống nổ công binh đã đặt — nổ tung công sự đi!',
      'Hỏa lực áp chế cực đại, không tên nào ngóc đầu nổi!',
      'Biển lửa tiền phương mở toang đường tiến quân!',
    ],
    MID: [
      'Nòng súng đỏ rực rồi — thay nòng phụ bắn tiếp!',
      'Mảnh văng chẳng ăn nhằm gì với giáp yếm công binh!',
      'Dồn thêm áp lực lửa vào thẳng khe bắn boong-ke!',
      'Càng đánh rát, hỏa lực hạng nặng càng áp đảo!',
      'Giữ chặt chân súng đại liên — quét ngang đội hình địch!',
    ],
    LOW: [
      'Bình nhiên liệu sắp cạn… xả trọn luồng lửa cuối!',
      'Ôm khối bộc phá lao thẳng vào mục tiêu!',
      'Muốn chiếm chốt này? Bước qua lưới lửa của ta đã!',
      'Dây đạn cuối cùng — bắn không ngừng nghỉ!',
      'Cho nổ tung toàn bộ cụm phòng ngự của chúng!',
    ],
  },

  FLIER: {
    HIGH: [
      'Phi đội từ độ cao ba ngàn mét — bổ nhào cắt bom!',
      'Bầu trời mặt trận thuộc quyền kiểm soát của chúng ta!',
      'Tiếng còi bổ nhào vang lên rồi — ngắm chuẩn nóc tăng!',
      'Khóa đuôi mục tiêu bằng loạt đại liên cánh!',
      'Thả bom trúng hồng tâm rồi kéo cần lái vọt lên!',
    ],
    MID: [
      'Đạn cao xạ nổ quanh cánh, lượn vòng tránh flak ngay!',
      'Động cơ vẫn gầm vang — quay lại oanh tạc đợt hai!',
      'Vỏ nhôm thủng vài lỗ chẳng làm rơi nổi cánh chim này!',
      'Hạ độ cao lướt sát ngọn cây, phóng rocket!',
      'Không kích quyết định vào thẳng sườn địch!',
    ],
    LOW: [
      'Động cơ bốc khói đen rồi… vẫn đủ lực cắt quả bom cuối!',
      'Bổ nhào xuyên qua lưới lửa phòng không — tất tay!',
      'Chưa thả hết cơ số bom thì chưa quay về sân bay!',
      'Giữ chặt cần lái cho pha công kích sinh tử!',
      'Từ tầng mây giông, giáng đòn sấm sét cuối cùng!',
    ],
  },

  ASSASSIN: {
    HIGH: [
      'Đã cắt đứt đường dây điện thoại địch — nổ súng giảm thanh.',
      'Đột nhập sau lưng chiến tuyến không một tiếng động.',
      'Kho đạn địch lộ diện rồi… kích nổ hẹn giờ!',
      'Đặc nhiệm đêm SAS: đánh nhanh, rút gọn.',
      'Mục tiêu chỉ huy đã lọt vào tầm bắn cận chiến.',
    ],
    MID: [
      'Pháo sáng địch vừa bắn lên? Lẩn vào bóng đổ nát ngay!',
      'Đổi góc tiếp cận, hạ gục hỏa điểm canh gác!',
      'Phản xạ nhanh đấy… nhưng mìn nam châm đã gài xong!',
      ' Mật lệnh đã rõ — tiêu diệt gọn cụm vô tuyến này!',
      'Một loạt Sten giảm thanh xuyên màn sương là đủ!',
    ],
    LOW: [
      'Bị bao vây giữa hậu phương địch… mở đường máu thôi!',
      'Rút chốt lựu đạn khói và tung đòn chí tử!',
      'Cược tất cả vào phát bắn xuyên khoang chỉ huy!',
      'Ai Dám Thì Thắng — bóp cò không do dự!',
      'Bóng ma đặc nhiệm không dễ bị bắt sống đâu!',
    ],
  },

  DARK_MAGE: {
    HIGH: [
      'Đại pháo đường sắt đã khóa góc bắn — chấn động mặt đất!',
      'Đạn công thành hạng nặng xuyên thủng 3 mét bê tông!',
      'Nghe tiếng rít xé gió của đạn pháo 210mm chưa?!',
      'Không một boong-ke ngầm nào chịu nổi loạt pháo này!',
      'Khai hỏa siêu trọng pháo — san phẳng cứ điểm!',
    ],
    MID: [
      ' Áp suất khóa nòng vẫn ổn định — nạp viên đạn tiếp theo!',
      'Dội lửa chồng lên hố pháo cũ cho sập hẳn hầm ngầm!',
      'Sóng xung kích đang nghiền nát ý chí phòng ngự địch!',
      'Quay bệ pháo đường sắt sang mục tiêu kế tiếp!',
      'Đạn nổ chậm xuyên sâu — bùng nổ đi!',
    ],
    LOW: [
      'Toa pháo hư hại nặng… kích hỏa viên đạn siêu trọng cuối!',
      'Dù trận địa chìm trong khói lửa, đại bác vẫn gầm vang!',
      'Cơn địa chấn pháo binh cuối cùng — tan tành đi!',
      'Đặt ngòi nổ tức thì, bắn thẳng không cần hiệu chỉnh!',
      'Sức công phá tối thượng kéo sập cả pháo đài địch!',
    ],
  },

  NAVAL: {
    HIGH: [
      'Toàn bộ tháp hải pháo quay mạn — khai hỏa đồng loạt!',
      'Ống phóng ngư lôi số 1 và số 2 — phóng!',
      'Sóng Biển Bắc nâng bước Thiết giáp hạm Liên Minh!',
      'Đạn xuyên giáp 380mm đang lao thẳng tới đài chỉ huy địch!',
      'Sonar đã khóa mục tiêu mặt nước — tấn công!',
    ],
    MID: [
      'Nước tràn khoang mũi đã được bơm chặn — bắn trả ngay!',
      'Cơ động cắt ngang chữ T trước mũi hạm đội địch!',
      'Kính tiềm vọng lên cao… phóng loạt ngư lôi phản công!',
      'Lưới phòng không trên boong tàu vẫn giữ vững đội hình!',
      'Hải pháo chính nạp đạn xong — nã thẳng vào sườn chúng!',
    ],
    LOW: [
      'Boong tàu cháy rực nhưng tháp pháo số 1 vẫn còn đạn!',
      'Chiến hạm thà chìm trong vinh quang chứ không hạ cờ!',
      'Mở hết tốc lực lao thẳng phóng quả ngư lôi cuối cùng!',
      'Đài chỉ huy ngập khói… khai hỏa loạt đạn quyết tử!',
      'Đại dương sẽ khắc tên cú bắn chí mạng này!',
    ],
  },

  ENEMY_BOSS: {
    HIGH: [
      'Đội quân Liên Minh kia định cản bước gọng kìm thép của ta sao?!',
      'Toàn cụm phòng tuyến nghe lệnh — nghiền nát chúng!',
      'Cứ điểm này đã biến thành pháo đài bất khả xâm phạm!',
      'Để ta cho các ngươi nếm mùi hỏa lực chủ lực của Đế Chế!',
      'Tọa độ đã khóa chặt — không một tên nào thoát khỏi đây!',
    ],
    MID: [
      'Hừ… mũi đột kích của các ngươi khá táo bạo đấy!',
      'Đưa lực lượng thiết giáp dự bị lên phản kích ngay lập tức!',
      'Vài loạt đạn pháo đó chưa làm lung lay nổi sở chỉ huy của ta!',
      'Ta sẽ đích thân bẻ gãy đợt tiến công này!',
      'Bắn cấp tập không ngừng! Giữ chặt tuyến phòng thủ!',
    ],
    LOW: [
      'Không thể nào… phòng tuyến thép của ta đang sụp đổ sao?!',
      'Điện báo về Tổng hành dinh! Ta quyết tử thủ tới viên đạn cuối!',
      'Dù boong-ke này sập xuống, ta cũng kéo các ngươi chôn cùng!',
      'Khai hỏa toàn bộ kho đạn dự trữ — hủy diệt tất cả!',
      'Ta là Thống Chế mặt trận… không bao giờ đầu hàng!',
    ],
  },

  ENEMY_SOLDIER: {
    HIGH: [
      'Giữ chặt chiến hào! Khai hỏa súng máy chặn đứng chúng!',
      'Mệnh lệnh từ Sở chỉ huy — không lùi một bước!',
      'Đã thấy quân Liên Minh trong tầm bắn — nổ súng!',
      'Các ngươi không vượt qua nổi bãi mìn và lô cốt này đâu!',
      'Nạp đạn pháo nhanh — khóa chặt đường tiến của địch!',
    ],
    MID: [
      'Hỏa lực đối phương mạnh quá… gọi chi viện ngay!',
      'Bám trụ công sự bao cát! Bắn trả liên tục!',
      'Vết thương nhẹ thôi, vẫn giữ được cò súng!',
      'Không được rút lui! Chặn mũi thiết giáp của chúng lại!',
      'Ném lựu đạn phản kích ngay bây giờ!',
    ],
    LOW: [
      'Công sự vỡ toang rồi… bắn hết băng đạn cuối cùng!',
      'Tuyến sau đâu rồi?! Ta vẫn sẽ chống trả tới cùng!',
      'Một loạt đạn liều chết trước khi ngã xuống!',
      'Khói lửa che kín mắt rồi… cứ nhắm phía trước mà bắn!',
      'Quyết kéo theo ít nhất một mục tiêu của chúng!',
    ],
  },
};

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
