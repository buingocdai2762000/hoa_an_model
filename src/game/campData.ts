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
    greeting: 'Căn cứ chỉ huy đêm nay vừa nhận điện báo mặt trận mới. Hãy kiểm tra kỹ đạn dược và túi cứu thương cho từng tiểu đội trước giờ G.',
    campaignThought: 'Từ chiến hào lầy lội sông Marne năm 1914 tới những mặt trận cơ giới Thế Chiến II, tinh thần hiệp đồng binh chủng luôn là chìa khóa chiến thắng.',
    tacticalNote: 'Nhớ nhé: Kho Quân Đoàn chỉ mở khi ở Căn Cứ hoặc ngoài trận đánh. Khi đã xung trận, mỗi người chỉ mang tối đa 6 món dự phòng trong ba-lô và phải đứng sát cạnh 1 ô mới trao đổi quân nhu được!',
    comradePledge: 'Chừng nào đài chỉ huy tiền phương còn phát sóng, ta sẽ không bỏ lại bất kỳ người lính nào.',
    sparringShout: 'Tốt lắm! Triển khai bài diễn tập xạ kích thực chiến ngay!',
  },
  lyra: {
    greeting: 'Động cơ xe thiết giáp đã bảo dưỡng xong và nạp đầy nhiên liệu diesel. Mũi nhọn cơ giới sẵn sàng xuất kích bất cứ lúc nào!',
    campaignThought: 'Trên thảo nguyên rộng hay qua cầu thép chiến lược, tốc độ hành tiến của xe tăng luôn định đoạt thế bao vây đầu trận.',
    tacticalNote: 'Xe tăng thường thọc sâu tách xa đội hình chính — hãy chuẩn bị sẵn Đạn Xuyên Giáp dự phòng và Túi Cứu Thương trong 6 ô hành trang cá nhân trước khi ra trận.',
    comradePledge: 'Xích thép của Lữ đoàn Thiết giáp sẽ luôn mở đường máu cho cờ hiệu Liên Minh!',
    sparringShout: 'Giữ vững cự ly nhé, pháo 75mm diễn tập bắn đạn tập đây!',
  },
  soren: {
    greeting: 'Tôi vừa hiệu chỉnh lại bản đồ tọa độ pháo binh và dự báo khí tượng dưới hầm tác chiến. Ngài muốn duyệt phương án hỏa lực không?',
    campaignThought: 'Mưa bùn, sương mù Biển Bắc hay bão cát Bắc Phi đều làm thay đổi tầm ngắm quang học — người chỉ huy giỏi luôn biến thời tiết thành vũ khí.',
    tacticalNote: 'Khẩu đội pháo của tôi nên mang theo cả đạn nổ phá lẫn đạn chiếu sáng để linh hoạt ứng phó khi thời tiết đổi pha mỗi 3 lượt.',
    comradePledge: 'Chiến thắng không thuộc về bên nhiều nòng pháo hơn, mà thuộc về bên tính chuẩn từng tọa độ.',
    sparringShout: 'Quan sát vệt khói chỉ thị mục tiêu và cơ động tránh vùng nổ đi!',
  },
  rowan: {
    greeting: 'Kính ngắm quang học đã căn chỉnh lại độ lệch gió, nòng pháo phòng không cũng vừa tra dầu mới trước giờ hành quân.',
    campaignThought: 'Dù là tiêm kích cánh kép hay cường kích bổ nhào Stuka, hễ lọt vào lưới lửa phòng không của chúng tôi là không có đường về.',
    tacticalNote: 'Bắn tỉa và phòng không cần một xe tăng hoặc bộ binh đứng chắn trước 1 ô — vừa che chắn vừa kịp chuyền tay nhau đạn dược khi cần.',
    comradePledge: 'Mỗi viên đạn rời nòng là một lời thề giữ sạch bầu trời cho đồng đội.',
    sparringShout: 'Đừng lộ đầu khỏi chiến hào, đường ngắm của tôi khóa chặt rồi đấy!',
  },
  elara: {
    greeting: 'Lều phẫu thuật dã chiến đã vô trùng toàn bộ dụng cụ và bổ sung huyết tương. Thương binh trận trước đều đã hồi phục tốt.',
    campaignThought: 'Giữa tiếng đại bác gầm vang suốt hai cuộc Thế Chiến, giữ lại sự sống cho từng người lính là chiến công thầm lặng nhưng quý giá nhất.',
    tacticalNote: 'Trong trận đánh Kho Quân Đoàn sẽ khóa hoàn toàn, chỉ hai đồng đội đứng sát cạnh 1 ô mới đưa Túi Cứu Thương cho nhau được thôi nhé.',
    comradePledge: 'Cờ Chữ Thập Đỏ tiền phương sẽ luôn sát cánh bảo vệ toàn quân đoàn.',
    sparringShout: 'Tôi cũng đang rèn luyện kỹ năng vượt chiến hào dưới làn đạn đây!',
  },
  veyra: {
    greeting: 'Phi đội vừa bay tuần tiễu một vòng quanh căn cứ. Cánh quạt, giá treo bom và bình dưỡng khí đều đạt trạng thái hoàn hảo!',
    campaignThought: 'Nhìn từ độ cao ba ngàn mét mới thấy hết sự khốc liệt của chiến hào, đại dương và những mũi thọc sâu thiết giáp bên dưới.',
    tacticalNote: 'Máy bay hoạt động độc lập vượt sông núi rất xa bộ binh, nên hãy kiểm tra kỹ 5 ô trang bị mặc trên người và 6 ô ba-lô trước khi cất cánh.',
    comradePledge: 'Đôi cánh Không đoàn Liên Minh nguyện quét sạch mọi pháo đài cản bước đại quân!',
    sparringShout: 'Chú ý hướng mặt trời — pha bổ nhào cắt bom diễn tập bắt đầu!',
  },
  drake: {
    greeting: 'Nồi hơi chiến hạm đã đốt đủ áp suất, tháp hải pháo chính và ống phóng ngư lôi đều sẵn sàng nhả đạn!',
    campaignThought: 'Từ eo biển Gallipoli, sương mù Jutland tới đảo Midway và vịnh Leyte, ai làm chủ đường biển người đó nắm mạch máu chiến tranh.',
    tacticalNote: 'Chiến hạm làm chủ hoàn toàn mặt nước và bờ biển đổ bộ, đồng thời có thể dùng hải pháo tầm xa chi viện trực tiếp cho bộ binh trên bờ.',
    comradePledge: 'Chừng nào chiến kỳ còn tung bay trên cột buồm, hạm đội này quyết không lùi một hải lý!',
    sparringShout: 'Bám chắc lan can boong tàu — loạt hải pháo mạn phải khai hỏa!',
  },
  garrick: {
    greeting: 'Lưỡi lê đã tra vào đầu súng trường, lựu đạn chày cài đầy thắt lưng. Tiểu đội xung kích chỉ chờ tiếng còi của ngài!',
    campaignThought: 'Pháo binh dọn đường, xe tăng mở đột phá khẩu, nhưng người cuối cùng cắm cờ lên Sở Chỉ Huy địch luôn là người lính bộ binh.',
    tacticalNote: 'Tận dụng Lô Cốt Bao Cát và Rừng Ngụy Trang giúp bộ binh tăng mạnh phòng thủ và né tránh trước đạn đại liên.',
    comradePledge: 'Tiểu đội xung kích này sẽ đi đầu trong mọi trận đánh khó khăn nhất!',
    sparringShout: 'Tập trung cao độ — bài diễn tập cận chiến chiến hào bắt đầu!',
  },
};

const MOVE_TYPE_FALLBACK_LORE: Record<MoveType, HeroCampDialogue> = {
  FOOT: {
    greeting: 'Quân trang, súng đạn và lựu đạn đã kiểm tra đầy đủ tại căn cứ. Sẵn sàng nhận lệnh hành quân bất cứ lúc nào!',
    campaignThought: 'Hành trình xuyên suốt 200 trận đánh của hai cuộc Thế Chiến tuy khốc liệt nhưng ý chí toàn quân đang vững như thép.',
    tacticalNote: 'Trên chiến trường hãy giữ cự ly đội hình hợp lý để các tổ chiến đấu đứng cạnh nhau 1 ô kịp trao đổi đạn và túi cứu thương.',
    comradePledge: 'Vì ngày hòa bình của toàn nhân loại, chúng tôi quyết giữ vững từng tấc chiến hào!',
    sparringShout: 'Hay lắm, cùng bước vào thao trường diễn tập thực chiến nào!',
  },
  MOUNTED: {
    greeting: 'Đoàn xe cơ giới và thiết giáp hạng trung đã nổ máy kiểm tra hộp số tại bãi tập. Chỉ chờ lệnh xuất kích của Tư Lệnh!',
    campaignThought: 'Những bản đồ chiến dịch rộng lớn từ 26 đến 36 ô là sân khấu lý tưởng cho các mũi vu hồi cơ giới thần tốc.',
    tacticalNote: 'Đừng quên nạp đủ đạn xuyên giáp và vật tư vào 6 ô hành trang cá nhân trước khi mở mũi đột kích đường dài.',
    comradePledge: 'Bánh xích và động cơ cơ giới Liên Minh sẽ nghiền nát mọi phòng tuyến Trục Sắt!',
    sparringShout: 'Tăng tốc tối đa — diễn tập cơ động bắn hành tiến bắt đầu!',
  },
  FLYING: {
    greeting: 'Đường băng dã chiến hôm nay trời quang mây tạnh, rất lý tưởng để các phi đội tiêm kích và cường kích bay biên đội.',
    campaignThought: 'Bay qua những mặt trận rộng lớn mới cảm nhận rõ sức mạnh hiệp đồng giữa Lục – Thiết – Pháo – Không – Hải.',
    tacticalNote: 'Phi đội bay xa dễ gặp lưới lửa phòng không Bofors/Flak — hãy gia cố 5 món trang bị kỹ thuật tại Xưởng Quân Giới trước trận.',
    comradePledge: 'Bầu trời tự do sẽ mãi thuộc về đôi cánh Không Quân Liên Minh!',
    sparringShout: 'Kéo cần lái lên cao — pha không chiến quần vòng bắt đầu!',
  },
  ARMORED: {
    greeting: 'Toàn bộ 5 hạng mục giáp tháp pháo, khung gầm và khóa nòng đã được Xưởng Quân Giới kiểm định đạt chuẩn xuất xưởng!',
    campaignThought: 'Mỗi vết lõm đạn trên tấm giáp nghiêng phía trước là một lần che chắn an toàn cho bộ binh tiến lên phía sau.',
    tacticalNote: 'Hãy ưu tiên lắp Vỏ Giáp Thép và Khung Gầm có DEF/RES cao cho các xe tăng hạng nặng giữ chốt chặn cầu và hẻm núi.',
    comradePledge: 'Dù pháo hạng nặng địch dội xuống như mưa, bức tường xe tăng này quyết không dịch chuyển!',
    sparringShout: 'Quay tháp pháo 12 giờ — diễn tập đấu tăng trực diện nào!',
  },
  NAVAL: {
    greeting: 'Tại quân cảng căn cứ, các Khu trục hạm, Thiết giáp hạm và Tàu ngầm đã nạp đầy ngư lôi cùng đạn hải pháo!',
    campaignThought: 'Sức mạnh hải pháo tầm xa và ngư lôi tàu ngầm sẽ khóa chặt mọi eo biển, yểm trợ đắc lực cho các cuộc đổ bộ lịch sử.',
    tacticalNote: 'Đơn vị Hải Quân di chuyển cực nhanh trên Vùng Biển, Kênh Sông, Cầu Thép và Bãi Cát — hãy điều động hạm đội làm chủ sườn nước!',
    comradePledge: 'Bảy đại dương sẽ vang danh hạm đội bách chiến bách thắng của chúng ta!',
    sparringShout: 'Toàn hạm đội chuyển đội hình hàng dọc — khai hỏa diễn tập!',
  },
};

export function getHeroCampDialogue(unit: Unit): HeroCampDialogue {
  return (
    HERO_SPECIFIC_CAMP_LORE[unit.templateId] ??
    MOVE_TYPE_FALLBACK_LORE[unit.moveType] ??
    MOVE_TYPE_FALLBACK_LORE.FOOT
  );
}
