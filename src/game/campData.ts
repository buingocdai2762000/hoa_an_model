import type { MoveType, Unit } from './types';

export const CAMP_SPARRING_COST_GOLD = 100;
export const CAMP_SPARRING_EXP_GAIN = 50;

export interface HeroCampDialogue {
  greeting: string;
  campaignThought: string;
  tacticalNote: string;
  comradePledge: string;
  sparringShout: string;
}

const HERO_SPECIFIC_CAMP_LORE: Record<string, HeroCampDialogue> = {
  kaelen: {
    greeting: 'Doanh trại đêm nay yên ắng hiếm có. Hãy kiểm tra lại từng thanh kiếm và bình thuốc trước khi nhổ trại.',
    campaignThought: 'Mỗi bản đồ chúng ta đi qua đều in dấu những người dân Valoria đang chờ ngày giải phóng khỏi Huyết Ấn.',
    tacticalNote: 'Kho Quân Đoàn luôn đi cùng ta trên chiến trường. Đồng minh đứng sát cạnh ta có thể rút vũ khí dự trữ bất cứ lúc nào!',
    comradePledge: 'Chừng nào thanh kiếm Hoàng Gia còn trong tay, ta sẽ không bỏ lại bất kỳ người đồng đội nào.',
    sparringShout: 'Tốt lắm! Đỡ thử đường kiếm toàn lực này xem!',
  },
  lyra: {
    greeting: 'Chiến mã đã được cho ăn no và đóng lại móng sắt. Đội kỵ binh sẵn sàng xung kích ngay khi ngài hạ lệnh.',
    campaignThought: 'Trên đồng bằng rộng hay cầu hẹp, tốc độ cơ động của kỵ binh luôn quyết định quyền chủ động đầu trận.',
    tacticalNote: 'Kỵ binh tiến nhanh nên rất dễ tách xa hậu tuyến — hãy nhớ mang sẵn Lao Phóng và Bình Thuốc bên mình trước khi xuất kích.',
    comradePledge: 'Ngọn thương tiên phong của tôi mãi mãi mở đường cho cờ hiệu Valoria!',
    sparringShout: 'Giữ vững thế thủ nhé, mũi thương này không nể nang đâu!',
  },
  soren: {
    greeting: 'Tôi vừa vẽ lại sơ đồ địa hình của chiến trường sắp tới bên ánh đèn dầu. Ngài muốn đối chiếu đội hình không?',
    campaignThought: 'Thời tiết biến đổi mỗi vài lượt không phải ngẫu nhiên — ma lực Huyết Ấn đang khuấy động khí quyển lục địa.',
    tacticalNote: 'Pháp sư như tôi có thể mang theo nhiều sách phép nguyên tố khác nhau để đón đầu mưa bão hoặc nắng gắt.',
    comradePledge: 'Chiến thắng không thuộc về kẻ đông quân hơn, mà thuộc về bên tính trước ba nước cờ.',
    sparringShout: 'Quan sát quỹ đạo ma hỏa này và tìm khe hở né tránh đi!',
  },
  rowan: {
    greeting: 'Gió đêm nay đổi hướng liên tục, rất hợp để chỉnh lại độ căng dây cung trước giờ xuất trận.',
    campaignThought: 'Từ tán rừng già Eldwood tới đỉnh tuyết Frostpeak, chỉ cần giữ được tầm bắn cao là bọn Không Kỵ địch không dám bén mảng.',
    tacticalNote: 'Cung thủ cần một đồng minh giáp dày đứng chắn phía trước 1 ô — vừa che chắn vừa dễ trao đổi tên và thuốc hồi phục.',
    comradePledge: 'Mỗi mũi tên rời cung đều mang theo lời thề bảo vệ hậu phương.',
    sparringShout: 'Đừng đứng yên một chỗ, tôi ngắm chuẩn lắm đấy!',
  },
  elira: {
    greeting: 'Lều quân y đã chuẩn bị đầy đủ thảo dược và trượng thánh. Mọi vết thương từ trận trước đều đã bình phục.',
    campaignThought: 'Nhìn các chiến sĩ bình an trở về lửa trại là niềm an ủi lớn nhất giữa cuộc chiến dài đằng đẵng này.',
    tacticalNote: 'Trong trận đánh, chỉ những người đứng sát cạnh nhau mới chuyển bình thuốc cho nhau được — hãy phân bổ thuốc đều cho tiền tuyến nhé.',
    comradePledge: 'Ánh sáng thánh điện sẽ luôn dịu dàng che chở cho toàn quân đoàn.',
    sparringShout: 'Tôi cũng đang luyện khả năng phản ứng và giữ vị trí giữa vòng vây đây!',
  },
  brom: {
    greeting: 'Ha ha! Bộ giáp tấm này vừa được rèn gia cố thêm ở lò rèn doanh trại, nặng thêm mấy cân mà mặc vẫn vừa khít!',
    campaignThought: 'Kẻ thù càng đông càng tốt, cứ để tôi đứng ngay hẻm núi hay đầu cầu là đố tên nào lọt qua được!',
    tacticalNote: 'Nếu nhặt được Mũ Sắt hay Áo Giáp tốt, hãy trao đổi cho tuyến đầu ở ngay doanh trại để giữ vững bức tường thép.',
    comradePledge: 'Tấm khiên của Brom này còn đứng vững thì hậu tuyến cứ yên tâm xuất chiêu!',
    sparringShout: 'Lao vào đi! Cứ chém thẳng vào khiên của tôi để rèn lực cổ tay!',
  },
  veyra: {
    greeting: 'Hắc Long của ta vừa lượn một vòng trinh sát quanh doanh trại. Phía chân trời đang tích tụ mây giông đấy.',
    campaignThought: 'Bay lượn trên vách núi và sông sâu giúp Không Kỵ đánh úp sườn địch, nhưng phải hết sức dè chừng cung thủ của chúng.',
    tacticalNote: 'Tôi thường bay tách đội hình để bọc sườn, nên hãy trang bị sẵn Giáp và Thuốc Hồi Phục trong hành trang cá nhân trước trận.',
    comradePledge: 'Đôi cánh chiến long này nguyện càn quét mọi pháo đài cản bước ngài!',
    sparringShout: 'Đón lấy cú bổ rìu từ trên không này!',
  },
  garrick: {
    greeting: 'Lưỡi kiếm đã mài sắc bén bên đống lửa trại. Chỉ cần một đòn chí mạng chuẩn xác là đủ xoay chuyển cục diện.',
    campaignThought: 'Những tay kiếm thực thụ không khoe khoang nhiều lời — kết quả trên chiến trường mới là câu trả lời.',
    tacticalNote: 'Kiếm sĩ tốc độ cao tận dụng địa hình Rừng rất tốt để né đòn và phản kích hai lần liên tiếp.',
    comradePledge: 'Lưỡi kiếm này đã chọn đi theo chính nghĩa của ngài tới tận cùng.',
    sparringShout: 'Nhìn kỹ bước chân rút kiếm đây — nhanh hơn chớp mắt đấy!',
  },
};

const MOVE_TYPE_FALLBACK_LORE: Record<MoveType, HeroCampDialogue> = {
  FOOT: {
    greeting: 'Trang bị đã chỉnh tề tại doanh trại. Bất cứ khi nào ngài cần, tôi sẵn sàng bước vào đội hình chính.',
    campaignThought: 'Chặng đường xuyên qua mười vùng đất tuy gian nan nhưng tinh thần toàn quân đang lên rất cao.',
    tacticalNote: 'Khi hành quân trên chiến trường, hãy giữ cự ly đội hình để đồng đội đứng sát nhau còn hỗ trợ và trao đổi quân nhu kịp thời.',
    comradePledge: 'Vì hòa bình của lục địa Aethelis, tôi nguyện dốc hết sức mình!',
    sparringShout: 'Hay lắm, cùng so tài vài hiệp trên sân tập nào!',
  },
  MOUNTED: {
    greeting: 'Ngựa chiến đã đóng yên cương sẵn sàng nơi bãi tập. Chỉ chờ hiệu lệnh xung phong của Thống Soái!',
    campaignThought: 'Những bản đồ đại chiến trường rộng lớn là nơi kỵ binh phát huy tối đa sức mạnh cơ động và gọng kìm.',
    tacticalNote: 'Đừng quên kiểm tra vũ khí khắc chế và bình thuốc mang theo người trước khi kỵ binh mở mũi đột kích xa.',
    comradePledge: 'Vó ngựa liên quân sẽ không dừng lại trước khi phá tan Huyết Ấn!',
    sparringShout: 'Tiến lên nào, thử đỡ đòn xung kích trên lưng ngựa của tôi!',
  },
  FLYING: {
    greeting: 'Gió trên bầu trời doanh trại hôm nay rất thuận lợi cho đội Không Kỵ tập dượt đội hình.',
    campaignThought: 'Nhìn từ bầu trời cao mới thấy rõ quy mô hùng vĩ của từng mặt trận mà chúng ta đã vượt qua.',
    tacticalNote: 'Đơn vị bay dễ hoạt động độc lập xa Chủ Tướng Kaelen, vì vậy hãy chuẩn bị sẵn 2-3 vũ khí ngay trong túi đồ cá nhân.',
    comradePledge: 'Bầu trời tự do của Valoria sẽ do đôi cánh chúng tôi canh giữ!',
    sparringShout: 'Cẩn thận phía trên đầu — đòn tập kích từ không trung tới đây!',
  },
  ARMORED: {
    greeting: 'Giáp trụ 5 món đều đã được lau chùi sáng bóng bên lò rèn doanh trại. Phòng tuyến thép luôn sẵn sàng!',
    campaignThought: 'Mỗi vết xước trên áo giáp đều là minh chứng cho một lần che chở đồng đội an toàn.',
    tacticalNote: 'Hãy ưu tiên mặc Mũ, Áo Giáp và Giáp Chân có chỉ số DEF/RES cao cho hàng tiền vệ trước khi vào trận.',
    comradePledge: 'Dù mưa tên bão lửa cũng không thể xuyên thủng hàng rào trọng giáp này!',
    sparringShout: 'Tấn công hết sức đi, để xem ai lùi bước trước!',
  },
};

export function getHeroCampDialogue(unit: Unit): HeroCampDialogue {
  return (
    HERO_SPECIFIC_CAMP_LORE[unit.templateId] ??
    MOVE_TYPE_FALLBACK_LORE[unit.moveType] ??
    MOVE_TYPE_FALLBACK_LORE.FOOT
  );
}
