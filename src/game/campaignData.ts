import type {
  ActDefinition,
  CampaignMapMeta,
  DialogueLine,
  LayoutTemplate,
  MapObjective,
  UnitClassId,
} from './types';

export const CAMPAIGN_ACTS: ActDefinition[] = [
  {
    actNumber: 1,
    roman: 'I',
    title: 'Ngọn Lửa Biên Giới Valoria',
    regionName: 'Thảo Nguyên Valoria',
    biome: 'VALORIA_PLAINS',
    weather: 'LEAVES',
    synopsis:
      'Đêm trăng máu xé toạc hòa ước trăm năm khi đại quân Đế Chế Thiết Huyết bất ngờ tràn qua biên ải Valoria. Hoàng tử Kaelen cùng kỵ sĩ trưởng Lyra tập hợp đội cận vệ bảo vệ dân lành và chặn đứng mũi giáo xâm lăng.',
    antagonist: 'Tướng Tiên Phong Garen',
    recruitedHeroId: 'kaelen',
  },
  {
    actNumber: 2,
    roman: 'II',
    title: 'Bóng Tối Rừng Sương Mù',
    regionName: 'Rừng Sương Mù Eldwood',
    biome: 'ELDWOOD_FOREST',
    weather: 'MIST',
    synopsis:
      'Theo dấu cổ tự để lại sau trận cổng biên giới, quân sư Soren dẫn toán tiền trạm đi sâu vào rừng già Eldwood và rơi vào ổ phục kích quanh Mộc Ấn cổ đại. Kaelen lập tức xuyên sương mù tiếp ứng đồng đội.',
    antagonist: 'Thủ Lĩnh Phục Kích Vex',
    recruitedHeroId: 'soren',
  },
  {
    actNumber: 3,
    roman: 'III',
    title: 'Đèo Gió Hú Phương Tây',
    regionName: 'Hẻm Núi Gió Hú',
    biome: 'HOWLING_CANYON',
    weather: 'LEAVES',
    synopsis:
      'Quân đoàn Thiết Huyết phong tỏa dãy Hẻm Núi Gió Hú nhằm bóp nghẹt tuyến lương thảo miền Tây. Kỵ sĩ thiên mã Mira, tu sĩ Cassian cùng kiếm sĩ phương Đông Kenji hội quân mở ra thế trận không-bộ hợp kích.',
    antagonist: 'Xạ Thủ Đế Quốc Corvus',
    recruitedHeroId: 'mira',
  },
  {
    actNumber: 4,
    roman: 'IV',
    title: 'Mặt Trời Đỏ Trên Cát Vàng',
    regionName: 'Sa Mạc Hoàng Kim Solara',
    biome: 'SOLARA_DESERT',
    weather: 'SAND',
    synopsis:
      'Giữa biển cát cháy Solara nơi Thái Dương Ấn ngủ yên, Tổng đốc Zarek cưỡng bức các bộ tộc du mục khai quật đền cổ. Trọng giáp Borin, cung kỵ Kaelith và vu sư Orion sát cánh cùng Valoria lật đổ ách thống trị.',
    antagonist: 'Tổng Đốc Cát Đỏ Zarek',
    recruitedHeroId: 'borin',
  },
  {
    actNumber: 5,
    roman: 'V',
    title: 'Cơn Bão Cảng Sương Đen',
    regionName: 'Cảng Biển Sương Đen',
    biome: 'BLACKMIST_HARBOR',
    weather: 'RAIN',
    synopsis:
      'Hạm đội bọc thép của Đô Đốc Drax áp sát vịnh Sương Đen để vận chuyển cổ vật Huyết Ấn về cố đô. Giữa mưa giông sấm chớp, kiếm khách Kain và hắc kỵ Malrik gia nhập cuộc đột kích đốt cháy kỳ hạm địch.',
    antagonist: 'Đô Đốc Thiết Hạm Drax',
    recruitedHeroId: 'kain',
  },
  {
    actNumber: 6,
    roman: 'VI',
    title: 'Lời Nguyền Đầm Lầy Hắc Ấn',
    regionName: 'Đầm Lầy Hắc Ám',
    biome: 'DARKSEAL_SWAMP',
    weather: 'MIST',
    synopsis:
      'Chân tướng phơi bày: Nguyên soái Malakor đã bắt tay Giáo phái Hắc Ấn nhằm phá vỡ Ngũ Đại Phong Ấn, đánh thức Huyết Long Vực Thẳm từng thiêu rụi lục địa Aethelis ngàn năm trước.',
    antagonist: 'Đại Tư Tế Morvath',
    recruitedHeroId: 'seraphina',
  },
  {
    actNumber: 7,
    roman: 'VII',
    title: 'Hành Quân Xuyên Bão Tuyết',
    regionName: 'Tuyết Nguyên Phương Bắc',
    biome: 'FROSTPEAK_TUNDRA',
    weather: 'SNOW',
    synopsis:
      'Chỉ có ngọn lửa Vĩnh Đông tại Lò Rèn Cổ phương Bắc mới đủ sức thức tỉnh Thánh Kiếm Valoria. Đoàn quân vượt bão tuyết trắng xóa, liên kết chiến binh Tormund và ảnh nhẫn Kage đập tan vòng vây băng kỵ.',
    antagonist: 'Băng Kỵ Tướng Sorenth',
    recruitedHeroId: 'kage',
  },
  {
    actNumber: 8,
    roman: 'VIII',
    title: 'Cổng Lửa Pháo Đài Nham Thạch',
    regionName: 'Pháo Đài Nham Thạch',
    biome: 'MAGMA_FORTRESS',
    weather: 'EMBERS',
    synopsis:
      'Trước ngưỡng cửa cố đô là Pháo Đài Nham Thạch sừng sững trên miệng núi lửa do Tứ Đại Hộ Pháp trấn giữ. Thánh kỵ sĩ Valen và thời không sư Astraea xuất hiện trợ lực trong cuộc công thành khốc liệt nhất.',
    antagonist: 'Thiết Giáp Vương Ignis',
    recruitedHeroId: 'astraea',
  },
  {
    actNumber: 9,
    roman: 'IX',
    title: 'Giải Phóng Cố Đô Aethelgard',
    regionName: 'Cố Đô Aethelgard',
    biome: 'AETHELGARD_CITY',
    weather: 'STORM',
    synopsis:
      'Đại quân giải phóng tiến qua Cổng Nam Aethelgard giữa tiếng chuông khởi nghĩa vang dội. Từng đại lộ, nhịp cầu hoàng gia và đại sảnh vương miện thấm đẫm mồ hôi xương máu trước cuộc đối đầu trực diện với Malakor.',
    antagonist: 'Nguyên Soái Malakor',
  },
  {
    actNumber: 10,
    roman: 'X',
    title: 'Hoàng Hôn Của Huyết Ấn',
    regionName: 'Thánh Điện Huyết Ấn',
    biome: 'CRIMSON_SANCTUM',
    weather: 'SPARKS',
    synopsis:
      'Trên Thánh Điện lơ lửng giữa tầng mây tím, Malakor dung hợp mảnh ấn cuối cùng với tàn hồn Huyết Long. Kaelen giương cao Thánh Kiếm Valoria dẫn dắt 30 anh hùng viết nên chương kết bất tử cho lục địa Aethelis.',
    antagonist: 'Huyết Đế Malakor Thức Tỉnh',
  },
];

interface ActChapterTemplate {
  titles: string[];
  layouts: LayoutTemplate[];
  bossNames: string[];
  bossClasses: UnitClassId[];
  storyBeats: string[];
}

const ACT_CHAPTER_BLUEPRINTS: Record<number, ActChapterTemplate> = {
  1: {
    titles: [
      'Cổng Biên Giới Valoria',
      'Thôn Làng Bốc Cháy',
      'Cầu Đá Sông Bạc',
      'Đồn Gác Phía Đông',
      'Đồi Cỏ Gió Nam',
      'Cuộc Vây Hãm Trạm Tiếp Tế',
      'Ranh Giới Cánh Đồng Lúa',
      'Con Đường Kỵ Binh',
      'Thành Lũy Gỗ Cũ',
      'Ngã Ba Huyết Chiến',
      'Tiền Đồn Của Garen',
      'Quyết Chiến Cổng Valoria',
    ],
    layouts: [
      'border_gate',
      'forest_ambush',
      'river_crossing',
      'border_gate',
      'twin_bridges',
      'forest_ambush',
      'river_crossing',
      'canyon_pass',
      'border_gate',
      'twin_bridges',
      'lava_fortress',
      'sanctum_throne',
    ],
    bossNames: [
      'Đội Trưởng Marcus',
      'Kỵ Binh Đen Rold',
      'Vệ Binh Cầu Vane',
      'Chỉ Huy Doren',
      'Thống Lĩnh Kaelus',
      'Kẻ Cướp Lương Brakk',
      'Hộ Vệ Thép Orin',
      'Kỵ Tướng Vance',
      'Đồn Trưởng Halvar',
      'Phó Tướng Syrus',
      'Thiết Vệ Dorn',
      'Tướng Tiên Phong Garen',
    ],
    bossClasses: [
      'FIGHTER',
      'CAVALIER',
      'KNIGHT',
      'ARCHER',
      'FIGHTER',
      'MYRMIDON',
      'KNIGHT',
      'CAVALIER',
      'FIGHTER',
      'MAGE',
      'KNIGHT',
      'DARK_GENERAL',
    ],
    storyBeats: [
      'Quân Thiết Huyết tràn qua biên giới Valoria lúc bình minh. Kaelen dẫn đội hộ vệ chặn đứng mũi đột kích đầu tiên.',
      'Khói lửa bốc lên từ ngôi làng biên ải. Đội quân phải mở đường giải cứu dân thường trước khi kỵ binh địch khép vòng vây.',
      'Cây cầu đá bắc qua Sông Bạc là huyết mạch duy nhất dẫn về hậu phương. Quân địch đã lập chốt chặn đầu cầu.',
      'Từ nhật ký của lính trinh sát, Kaelen phát hiện địch đang tập trung cung thủ tại đồn gác phía Đông.',
      'Vượt qua đồi cỏ gió Nam, quân Valoria bắt đầu phản công và cắt đứt liên lạc giữa các toán quân xâm lược.',
      'Trạm tiếp tế lương thực của ta bị bao vây. Lyra đề xuất đánh bọc sườn để giải tỏa áp lực ngay lập tức.',
      'Một bức mật thư thu được nhắc tới tên quân sư Soren đang bị truy đuổi gần rừng Eldwood.',
      'Kỵ binh Thiết Huyết tràn xuống đại lộ hòng nghiền nát đội hình bộ binh. Địa hình rừng và pháo đài sẽ quyết định thắng bại.',
      'Địch rút về cố thủ trong thành lũy gỗ cũ. Đây là cơ hội để Kaelen tiêu diệt sở chỉ huy tiền phương của chúng.',
      'Ngã ba đường huyết mạch nối liền Valoria với vùng rừng sâu đã trở thành chiến trường ác liệt nhất từ đầu chiến dịch.',
      'Chỉ còn một tiền đồn trước khi chạm trán Tướng Tiên Phong Garen. Quân sĩ Valoria đã sẵn sàng cho trận quyết đấu.',
      'Garen đích thân xuất trận tại cổng Valoria. Hạ gục hắn sẽ mở thông con đường tiến vào Rừng Sương Mù tìm Soren.',
    ],
  },
  2: {
    titles: [
      'Bìa Rừng Sương Mù',
      'Lối Mòn Cổ Thụ',
      'Suối Ngầm Eldwood',
      'Cạm Bẫy Trong Sương',
      'Tháp Canh Học Giả',
      'Cuộc Giải Cứu Soren',
      'Hành Lang Rễ Cây',
      'Đền Thờ Rêu Phong',
      'Hồ Tĩnh Lặng',
      'Vòng Vây Ám Sát',
      'Trại Rừng Hắc Ưng',
      'Huyết Chiến Giữa Đại Ngàn',
    ],
    layouts: [
      'forest_ambush',
      'forest_ambush',
      'river_crossing',
      'forest_ambush',
      'border_gate',
      'twin_bridges',
      'canyon_pass',
      'swamp_ruins',
      'river_crossing',
      'forest_ambush',
      'border_gate',
      'sanctum_throne',
    ],
    bossNames: [
      'Trinh Sát Kael',
      'Sát Thủ Sương Nira',
      'Pháp Sư Rừng Sol',
      'Thợ Săn Đen Tor',
      'Cai Ngục Tháp Vren',
      'Đội Trưởng Truy Sát Jex',
      'Kiếm Ảnh Sylas',
      'Hắc Tư Tế Mael',
      'Kỵ Sĩ Rừng Drogo',
      'Ảnh Sát Zeph',
      'Phó Thủ Lĩnh Kor',
      'Thủ Lĩnh Phục Kích Vex',
    ],
    bossClasses: [
      'ARCHER',
      'ASSASSIN',
      'MAGE',
      'SNIPER',
      'GENERAL',
      'PALADIN',
      'SWORDMASTER',
      'NECROMANCER',
      'PALADIN',
      'ASSASSIN',
      'BERSERKER',
      'DARK_GENERAL',
    ],
    storyBeats: [
      'Màn sương dày đặc phủ kín Eldwood. Dấu vết chiến đấu cho thấy Soren vừa đi qua đây không lâu.',
      'Cung thủ Đế Chế ẩn mình sau những tán cổ thụ. Tận dụng địa hình rừng giúp tăng mạnh khả năng né tránh.',
      'Dòng suối ngầm chia cắt khu rừng làm hai nửa. Cần chiếm các nhịp cầu trước khi quân địch kéo viện binh tới.',
      'Một toán phục kích bất ngờ tập kích hai bên sườn. Kaelen giữ vững trận tuyến giữa màn sương mù.',
      'Tháp canh học giả hiện ra phía trước — nơi cất giữ bản đồ cổ về Năm Mảnh Huyết Ấn.',
      'Soren bị bao vây bên ngoài tháp canh! Sau trận chiến này, vị quân sư tài ba chính thức đồng hành cùng Kaelen.',
      'Soren giải mã mật thư: Malakor đang thu thập các mảnh phong ấn cổ đại trên khắp lục địa Aethelis.',
      'Ngôi đền rêu phong giữa rừng là nơi mảnh phong ấn đầu tiên từng được canh giữ, nay đã bị quân địch chiếm đóng.',
      'Bên bờ Hồ Tĩnh Lặng, phép thuật hắc ám bắt đầu xuất hiện trong hàng ngũ quân Thiết Huyết.',
      'Thủ lĩnh Vex tung ra đội ám sát tinh nhuệ nhất để tiêu diệt Soren trước khi đoàn quân thoát khỏi rừng.',
      'Phá hủy trại Hắc Ưng sẽ cắt đứt toàn bộ mạng lưới do thám của Thiết Huyết ở miền Trung.',
      'Đối đầu trực diện với Vex giữa đại ngàn. Chiến thắng mở ra lối tiến lên Hẻm Núi Gió Hú phía Tây.',
    ],
  },
  3: {
    titles: [
      'Chân Núi Gió Hú',
      'Con Đường Vách Đá',
      'Tổ Đại Bàng Đỏ',
      'Cầu Treo Hẻm Sâu',
      'Đôi Cánh Thiên Mã',
      'Đồn Cung Thủ Cao Điểm',
      'Thung Lũng Vang Vọng',
      'Đèo Sương Gió',
      'Pháo Đài Đá Xám',
      'Hẻm Núi Bão Táp',
      'Cổng Trời Phía Tây',
      'Bầu Trời Tự Do',
    ],
    layouts: [
      'canyon_pass',
      'canyon_pass',
      'border_gate',
      'twin_bridges',
      'canyon_pass',
      'border_gate',
      'river_crossing',
      'canyon_pass',
      'lava_fortress',
      'twin_bridges',
      'canyon_pass',
      'sanctum_throne',
    ],
    bossNames: [
      'Lính Gác Đèo Rook',
      'Xạ Thủ Đá Fen',
      'Ưng Nhãn Tarek',
      'Thiết Chùy Grog',
      'Kẻ Săn Thiên Mã Lor',
      'Đội Trưởng Nỏ Vexor',
      'Phong Sư Cyra',
      'Kiếm Núi Bael',
      'Trấn Thủ Thạch Thành Oren',
      'Kỵ Sĩ Hẻm Núi Dain',
      'Phó Tướng Cổng Trời Rax',
      'Xạ Thủ Đế Quốc Corvus',
    ],
    bossClasses: [
      'BERSERKER',
      'SNIPER',
      'GRIFFIN_LORD',
      'GENERAL',
      'SNIPER',
      'SNIPER',
      'SAGE',
      'RONIN_MASTER',
      'GENERAL',
      'WYVERN_LORD',
      'DARK_GENERAL',
      'MARKSMAN',
    ],
    storyBeats: [
      'Những vách đá dựng đứng của Hẻm Núi Gió Hú hạn chế kỵ binh, buộc Kaelen phải tính toán từng bước di chuyển.',
      'Quân địch lợi dụng điểm cao để bắn tỉa. Đội hình cần phối hợp chặt chẽ giữa khiên chắn và pháp thuật tầm xa.',
      'Tổ Đại Bàng Đỏ là trạm liên lạc bằng chim ưng của Đế Chế. Chiếm lấy nó sẽ làm mù mắt đối phương.',
      'Hai cây cầu treo nối liền vách đá tạo thành điểm nghẽn tử thần. Giữ vững cầu là chìa khóa chiến thắng.',
      'Nữ kỵ sĩ thiên mã Mira phá vòng vây từ trên không và gia nhập liên quân, mang lại khả năng vượt núi sông.',
      'Với sự hỗ trợ của Mira, đội quân đánh thẳng vào đồn cung thủ — nhưng phải cẩn trọng vì Cung khắc chế Thiên Mã!',
      'Thung lũng vang vọng tiếng tù và báo động. Viện binh Thiết Huyết đang kéo đến từ phía Sa Mạc Solara.',
      'Cơn gió lớn thổi qua đèo mang theo cát bụi từ phương Nam. Hành trình tới Solara đã ở ngay trước mắt.',
      'Pháo đài Đá Xám chặn kín cửa ngõ hẻm núi. Phá vỡ cổng thành sẽ bẻ gãy toàn bộ phòng tuyến phía Tây.',
      'Corvus điều động cả pháp sư và trọng giáp để bịt chặt hai đầu hẻm núi.',
      'Cổng Trời hiện ra trong ráng chiều. Trận chiến này quyết định quyền kiểm soát toàn bộ tuyến núi.',
      'Hạ gục Xạ Thủ Đế Quốc Corvus! Từ đỉnh đèo, dải cát vàng bất tận của Sa Mạc Solara trải dài phía dưới.',
    ],
  },
  4: {
    titles: [
      'Rìa Cát Hoàng Kim',
      'Ốc Đảo Bị Chiếm',
      'Tàn Tích Mặt Trời',
      'Đoàn Thương Nhân Bị Vây',
      'Bức Tường Thép Borin',
      'Cồn Cát Huyết Chiến',
      'Hầm Ngầm Đền Cát',
      'Kho Lương Thiết Đế',
      'Bão Cát Phía Nam',
      'Thành Cổ Solara',
      'Đấu Trường Mặt Trời',
      'Sụp Đổ Của Tổng Đốc',
    ],
    layouts: [
      'desert_oasis',
      'desert_oasis',
      'swamp_ruins',
      'desert_oasis',
      'border_gate',
      'desert_oasis',
      'capital_streets',
      'lava_fortress',
      'desert_oasis',
      'border_gate',
      'twin_bridges',
      'sanctum_throne',
    ],
    bossNames: [
      'Kẻ Cướp Cát Salim',
      'Vệ Sĩ Ốc Đảo Malik',
      'Hỏa Pháp Sư Azra',
      'Kỵ Cát Jafar',
      'Đội Trưởng Bao Vây Korr',
      'Đao Phủ Sa Mạc Vorn',
      'Hộ Thần Cổ Đền Raek',
      'Quản Kho Thiết Huyết Dren',
      'Lốc Cát Tariq',
      'Thủ Thành Solara Balth',
      'Đấu Sĩ Vương Giả Krag',
      'Tổng Đốc Cát Đỏ Zarek',
    ],
    bossClasses: [
      'SWORDMASTER',
      'BERSERKER',
      'SAGE',
      'NOMAD_TROOPER',
      'GENERAL',
      'WAR_MONK',
      'NECROMANCER',
      'GENERAL',
      'ASSASSIN',
      'MARSHAL',
      'REAVER',
      'DARK_GENERAL',
    ],
    storyBeats: [
      'Cát nóng làm chậm bước tiến của bộ binh và kỵ binh. Thiên mã và pháp sư trở thành mũi nhọn cơ động nhất.',
      'Ốc đảo nước ngọt duy nhất trong vùng bị quân Thiết Huyết kiểm soát để ép các bộ tộc du mục khuất phục.',
      'Soren phát hiện bia đá khắc lịch sử Huyết Ấn bên trong Tàn Tích Mặt Trời.',
      'Đoàn thương nhân của bộ tộc Solara kêu cứu. Giải cứu họ sẽ mang lại đồng minh quý giá.',
      'Trọng giáp Borin một mình giữ cửa thành bảo vệ dân làng. Kaelen kịp thời tiếp ứng và chiêu mộ vị anh hùng này.',
      'Trên những cồn cát chói nắng, liên quân Valoria – Solara lần đầu sát cánh chiến đấu.',
      'Dưới hầm ngầm đền cát, mật thám của Malakor đang vận chuyển cổ vật về cảng biển.',
      'Thiêu rụi kho lương Thiết Đế khiến quân xâm lược rơi vào cảnh thiếu thốn tiếp tế nghiêm trọng.',
      'Bão cát nổi lên che khuất tầm nhìn. Đối phương lợi dụng thời cơ để tung đòn tập kích bất ngờ.',
      'Thành cổ Solara bừng lên ngọn cờ khởi nghĩa khi quân giải phóng áp sát tường thành.',
      'Tổng đốc Zarek thách đấu tại Đấu Trường Mặt Trời để kéo dài thời gian cho hạm đội cập bến.',
      'Zarek gục ngã! Toàn bộ sa mạc Solara được giải phóng, mở đường tiến ra Cảng Biển Sương Đen.',
    ],
  },
  5: {
    titles: [
      'Đường Bờ Biển Mưa Giông',
      'Ngọn Hải Đăng Tắt Lửa',
      'Bến Tàu Phía Bắc',
      'Đêm Kiếm Ảnh Sương Đen',
      'Cầu Cảng Đẫm Mưa',
      'Kho Vũ Khí Hải Quân',
      'Xưởng Đóng Chiến Hạm',
      'Trận Chiến Trên Đê Chắn Sóng',
      'Khu Phố Cảng Cổ',
      'Pháo Đài Cửa Biển',
      'Chiến Hạm Kỳ Hạm',
      'Cơn Bão Cuốn Trôi Thiết Hạm',
    ],
    layouts: [
      'harbor_docks',
      'border_gate',
      'harbor_docks',
      'capital_streets',
      'twin_bridges',
      'harbor_docks',
      'harbor_docks',
      'river_crossing',
      'capital_streets',
      'lava_fortress',
      'twin_bridges',
      'sanctum_throne',
    ],
    bossNames: [
      'Lính Thủy Đánh Bộ Vek',
      'Thủ Ngọn Hải Đăng Cor',
      'Thuyền Trưởng Hắc Long',
      'Sát Thủ Cảng Biển Ryn',
      'Pháo Thủ Bến Tàu Gorn',
      'Chỉ Huy Kho Đạn Merek',
      'Kỹ Sư Thiết Hạm Vael',
      'Hải Tướng Sóng Đen Korr',
      'Đội Tuần Tra Đêm Sira',
      'Trấn Hải Tướng Thule',
      'Phó Đô Đốc Varis',
      'Đô Đốc Thiết Hạm Drax',
    ],
    bossClasses: [
      'CORSAIR',
      'SAGE',
      'WYVERN_LORD',
      'ASSASSIN',
      'SNIPER',
      'GENERAL',
      'MORTAL_SAVANT',
      'DREAD_CAPTAIN',
      'MASTER_NINJA',
      'MARSHAL',
      'SILVER_KNIGHT',
      'DARK_GENERAL',
    ],
    storyBeats: [
      'Mưa lớn trút xuống bờ biển Sương Đen. Những chiến hạm thép của Đế Chế đang tiến vào vịnh.',
      'Thắp sáng lại ngọn hải đăng sẽ dẫn đường cho đội tàu tiếp tế đồng minh và làm rối loạn đội hình địch.',
      'Các cầu gỗ hẹp trên bến tàu tạo nên thế trận cận chiến khốc liệt nơi mỗi ô địa hình đều mang tính sống còn.',
      'Kiếm khách lãng du Kain bất ngờ ra tay chém gục toán ám sát, rồi gia nhập Kaelen để trả thù Đế Chế.',
      'Chiếm giữ hai cầu cảng chính sẽ cô lập hoàn toàn quân đổ bộ khỏi hạm đội ngoài khơi.',
      'Kho vũ khí hải quân chứa đầy giáo bạc và trường cung — chiếm lấy nó để trang bị cho toàn quân.',
      'Phá hủy xưởng đóng tàu ngăn chặn Thiết Huyết xây dựng thêm chiến hạm bọc thép.',
      'Trên đê chắn sóng trơn trượt giữa mưa bão, đội cận vệ của Drax dàn hàng ngang chặn đường.',
      'Người dân khu phố cảng mở cổng bí mật giúp Kaelen luồn sâu vào hậu phương địch.',
      'Pháo đài cửa biển là chốt chặn cuối cùng bảo vệ kỳ hạm của Đô Đốc Drax.',
      'Liên quân tràn lên boong kỳ hạm trong ánh chớp rạch ngang bầu trời đêm.',
      'Đô Đốc Drax bại trận! Hạm đội Thiết Huyết tan rã, nhưng tin dữ ập đến: Giáo phái Hắc Ấn đã mở phong ấn tại Đầm Lầy.',
    ],
  },
  6: {
    titles: [
      'Cửa Ngõ Đầm Lầy Độc',
      'Làng Ma Sương Xám',
      'Cầu Gỗ Mục Nát',
      'Tế Đàn Hắc Ám',
      'Hầm Mộ Cổ Vương',
      'Sông Nước Đen',
      'Khu Rừng Chết',
      'Tháp Chuông Nguyền Rủa',
      'Trại Giáo Phái Hắc Ấn',
      'Vòng Tròn Triệu Hồi',
      'Cổng Vào Thâm Uyên',
      'Sự Sụp Đổ Của Đại Tư Tế',
    ],
    layouts: [
      'swamp_ruins',
      'swamp_ruins',
      'twin_bridges',
      'swamp_ruins',
      'capital_streets',
      'river_crossing',
      'forest_ambush',
      'border_gate',
      'swamp_ruins',
      'lava_fortress',
      'swamp_ruins',
      'sanctum_throne',
    ],
    bossNames: [
      'Tu Sĩ Bóng Tối Nul',
      'Kẻ Gọi Hồn Vess',
      'Hộ Vệ Đầm Lầy Grul',
      'Hắc Pháp Sư Xylar',
      'Kỵ Sĩ Mộ Cổ Drek',
      'Phù Thủy Nước Đen Nyx',
      'Cung Thủ Xương Vane',
      'Kẻ Gõ Chuông Mal',
      'Giáo Chủ Chi Nhánh Orv',
      'Hắc Tướng Nghi Lễ Kaelor',
      'Thủ Môn Thâm Uyên Zeth',
      'Đại Tư Tế Morvath',
    ],
    bossClasses: [
      'NECROMANCER',
      'SPIRIT_CALLER',
      'MARSHAL',
      'DARK_DRUID',
      'DOOM_RIDER',
      'ARCHSAGE',
      'MARKSMAN',
      'DEATH_KNIGHT',
      'DARK_DRUID',
      'DARK_GENERAL',
      'MARSHAL',
      'ABYSSAL_ARCHON',
    ],
    storyBeats: [
      'Không khí đặc quánh ma lực bao trùm Đầm Lầy Hắc Ám. Soren cảm nhận sức mạnh cổ xưa đang thức giấc.',
      'Ngôi làng bỏ hoang trở thành nơi tập kết của các hắc pháp sư. Kháng phép (RES) đóng vai trò then chốt.',
      'Những nhịp cầu mục nát là lối đi an toàn duy nhất vượt qua vùng nước sâu.',
      'Phá hủy tế đàn phụ sẽ làm suy yếu kết giới bảo vệ trung tâm đầm lầy.',
      'Trong hầm mộ cổ vương, Kaelen tìm thấy ghi chép về thanh Thánh Kiếm Valoria và nguồn gốc Huyết Long.',
      'Dòng sông nước đen ngăn cách hai bờ. Mira và đội cung thủ phối hợp dọn sạch bờ bên kia.',
      'Khu rừng chết lặng không một tiếng chim, đầy rẫy cạm bẫy phục kích của giáo phái.',
      'Tiếng chuông nguyền rủa vang lên triệu tập quân tiếp viện. Phải nhanh chóng đánh chiếm tháp chuông!',
      'Trại chính của Giáo phái Hắc Ấn hiện ra sau màn sương tím. Liên quân tổng tấn công.',
      'Vòng tròn triệu hồi đã sáng rực một nửa — chỉ còn một trận nữa trước khi đối đầu Morvath.',
      'Thủ môn Thâm Uyên đứng chắn trước điện thờ ngầm với đội thiết giáp tinh nhuệ.',
      'Morvath ngã xuống, nhưng trước lúc hấp hối hắn tiết lộ Malakor đã mang mảnh ấn cuối cùng về phương Bắc!',
    ],
  },
  7: {
    titles: [
      'Biên Giới Tuyết Trắng',
      'Rừng Thông Băng Giá',
      'Hồ Đóng Băng',
      'Thành Trì Bị Phong Tỏa',
      'Đèo Bão Tuyết',
      'Lò Rèn Cổ Phương Bắc',
      'Cầu Băng Vĩnh Cửu',
      'Trại Băng Kỵ Binh',
      'Đỉnh Gió Rét',
      'Tường Thành Bạch Tuyết',
      'Đêm Trắng Bắc Cực',
      'Băng Tan Dưới Ánh Thánh Kiếm',
    ],
    layouts: [
      'snow_ridge',
      'forest_ambush',
      'river_crossing',
      'border_gate',
      'canyon_pass',
      'capital_streets',
      'twin_bridges',
      'snow_ridge',
      'canyon_pass',
      'lava_fortress',
      'snow_ridge',
      'sanctum_throne',
    ],
    bossNames: [
      'Lính Băng Giá Ulf',
      'Săn Tuyết Freya',
      'Băng Pháp Sư Glacius',
      'Chỉ Huy Phong Tỏa Fenrir',
      'Kỵ Sĩ Tuyết Bjor',
      'Kẻ Cướp Lò Rèn Skar',
      'Vệ Băng Cầu Eirik',
      'Đội Trưởng Băng Kỵ Torv',
      'Xạ Thủ Bão Tuyết Astrid',
      'Trấn Bắc Tướng Hald',
      'Băng Ma Sư Vaelis',
      'Băng Kỵ Tướng Sorenth',
    ],
    bossClasses: [
      'REAVER',
      'MARKSMAN',
      'ARCHSAGE',
      'MARSHAL',
      'SILVER_KNIGHT',
      'REAVER',
      'HOLY_BASTION',
      'DRAGONLORD',
      'MARKSMAN',
      'DARK_GENERAL',
      'ARCHSAGE',
      'DEATH_KNIGHT',
    ],
    storyBeats: [
      'Tuyết rơi dày đặc khi liên quân tiến vào phương Bắc. Mỗi bước chân đều nặng trĩu nhưng ý chí không hề lay chuyển.',
      'Giữa rừng thông phủ băng, quân Thiết Huyết mai phục đoàn tiếp tế của các thành trì nổi dậy.',
      'Mặt hồ băng rộng mở tạo thành chiến trường kỵ binh rực lửa giữa mùa đông lạnh giá.',
      'Giải vây cho thành trì phương Bắc đang cầm cự suốt ba tháng dưới vòng vây Thiết Huyết.',
      'Con đèo bão tuyết là lối đi duy nhất dẫn tới Lò Rèn Cổ — nơi có thể tôi luyện lại Thánh Kiếm Valoria.',
      'Giành lại Lò Rèn Cổ! Thánh Kiếm Valoria bừng sáng ánh lam, thức tỉnh toàn bộ uy lực hoàng gia.',
      'Hai nhịp cầu băng bắc qua vực thẳm bị Trọng Giáp địch trấn giữ.',
      'Băng Kỵ Binh nổi danh tốc độ cao tràn xuống từ sườn núi. Đội hình thương và cung cần phối hợp chặt.',
      'Trên Đỉnh Gió Rét, tầm nhìn thu gọn lại nhưng ánh đuốc của kẻ địch đã phơi bày vị trí.',
      'Tường thành Bạch Tuyết là chốt phòng thủ kiên cố nhất miền Bắc của Đế Chế.',
      'Dưới ánh cực quang rực rỡ, quân Valoria và chiến binh phương Bắc mở chiến dịch đêm trắng.',
      'Băng Kỵ Tướng Sorenth bị đánh bại! Con đường tiến thẳng vào Pháo Đài Nham Thạch của Đế Chế đã mở toang.',
    ],
  },
  8: {
    titles: [
      'Vành Đai Tro Tàn',
      'Cầu Đá Trên Dòng Nham',
      'Lò Đúc Vũ Khí Thiết Đế',
      'Tháp Canh Núi Lửa',
      'Đường Hầm Hỏa Ngục',
      'Pháo Đài Ngoại Vi',
      'Đấu Trường Hỏa Thiết',
      'Tuyến Phòng Thủ Tứ Đại Hộ Pháp',
      'Cổng Dung Nham',
      'Sảnh Lò Rèn Đế Quốc',
      'Hành Lang Ngọn Lửa',
      'Khải Hoàn Tại Thành Nham Thạch',
    ],
    layouts: [
      'lava_fortress',
      'twin_bridges',
      'lava_fortress',
      'canyon_pass',
      'capital_streets',
      'border_gate',
      'lava_fortress',
      'lava_fortress',
      'twin_bridges',
      'capital_streets',
      'lava_fortress',
      'sanctum_throne',
    ],
    bossNames: [
      'Lính Hỏa Giáp Pyros',
      'Kẻ Gác Cầu Nham Vulk',
      'Thợ Rèn Chiến Tranh Krag',
      'Hỏa Cung Thủ Cinder',
      'Thiết Hầm Tướng Magnar',
      'Đội Trưởng Ngoại Vi Torak',
      'Hộ Pháp Thứ Nhất Bracus',
      'Hộ Pháp Thứ Hai Seraph',
      'Hộ Pháp Thứ Ba Valen',
      'Hộ Pháp Thứ Tư Noctis',
      'Tổng Chỉ Huy Lửa Đỏ Drak',
      'Thiết Giáp Vương Ignis',
    ],
    bossClasses: [
      'MARSHAL',
      'REAVER',
      'DARK_GENERAL',
      'MARKSMAN',
      'HOLY_BASTION',
      'DRAGONLORD',
      'TITAN_CITADEL',
      'ARCHSAGE',
      'TRUEBLADE',
      'DEATH_KNIGHT',
      'DARK_GENERAL',
      'DARK_GENERAL',
    ],
    storyBeats: [
      'Những dòng dung nham đỏ rực chia cắt chiến trường thành các hành lang hẹp đầy hiểm nguy.',
      'Cầu đá bắc qua sông nham thạch là thử thách lòng dũng cảm của toàn bộ đội tiên phong.',
      'Phá hủy lò đúc vũ khí sẽ cắt đứt nguồn cung cấp giáp thép cho quân đoàn bảo vệ cố đô.',
      'Tháp canh trên đỉnh núi lửa kiểm soát mọi động tĩnh quanh vùng. Cần chiếm lĩnh ngay.',
      'Tiến qua đường hầm dưới lòng núi để tránh hỏa lực pháo đài từ trên cao.',
      'Bức tường ngoại vi rung chuyển trước sức công phá của liên quân Valoria.',
      'Hộ Pháp Thứ Nhất xuất trận với bộ giáp nặng tưởng như bất khả xâm phạm — phép thuật của Soren sẽ là khắc tinh.',
      'Hộ Pháp Thứ Hai tung bão lửa từ hậu tuyến. Cần sử dụng Thiên Mã và Kiếm Khách áp sát.',
      'Cổng Dung Nham khép chặt sau lưng, buộc liên quân phải chiến thắng để mở đường sống.',
      'Trong sảnh lò rèn khổng lồ, Tứ Đại Hộ Pháp dồn toàn bộ lực lượng tinh nhuệ cuối cùng.',
      'Ngọn lửa rực sáng hai bên hành lang dẫn thẳng tới điện chỉ huy của Thiết Giáp Vương Ignis.',
      'Ignis gục ngã! Pháo Đài Nham Thạch thất thủ, để lộ tường thành Cố Đô Aethelgard ngay phía chân trời.',
    ],
  },
  9: {
    titles: [
      'Cổng Nam Aethelgard',
      'Đại Lộ Thương Nhân',
      'Quảng Trường Chuông Lớn',
      'Khu Phố Cổ Ngọn Đuốc',
      'Cầu Hoàng Gia',
      'Học Viện Ma Đạo Cũ',
      'Doanh Trại Cận Vệ Đỏ',
      'Bức Tường Nội Thành',
      'Hoa Viên Hoàng Cung',
      'Đại Sảnh Vương Miện',
      'Ngai Vàng Đẫm Máu',
      'Cuộc Đấu Định Mệnh Với Malakor',
    ],
    layouts: [
      'border_gate',
      'capital_streets',
      'capital_streets',
      'capital_streets',
      'twin_bridges',
      'capital_streets',
      'border_gate',
      'lava_fortress',
      'forest_ambush',
      'capital_streets',
      'sanctum_throne',
      'sanctum_throne',
    ],
    bossNames: [
      'Thủ Cổng Nam Rald',
      'Đội Tuần Phố Kaelen-Bại',
      'Tướng Quảng Trường Vexen',
      'Chỉ Huy Phố Cổ Darion',
      'Kỵ Sĩ Cầu Vàng Valerius',
      'Phản Đồ Ma Đạo Orlov',
      'Đội Trưởng Cận Vệ Đỏ Kar',
      'Thiết Thành Tướng Maelor',
      'Ám Sát Hoàng Viên Lyss',
      'Đại Tướng Cấm Vệ Theron',
      'Huyết Hộ Pháp Vaelor',
      'Nguyên Soái Malakor',
    ],
    bossClasses: [
      'MARSHAL',
      'SILVER_KNIGHT',
      'DARK_GENERAL',
      'SHADOW_KAGE',
      'ASTRAL_CAVALIER',
      'ASTRAL_ORACLE',
      'DARK_GENERAL',
      'TITAN_CITADEL',
      'PHANTOM_REAPER',
      'SPEAR_EMPEROR',
      'ABYSS_SOVEREIGN',
      'DARK_GENERAL',
    ],
    storyBeats: [
      'Cố đô Aethelgard hiện ra trong ánh hoàng hôn. Lá cờ xanh lam của Valoria một lần nữa tung bay trước Cổng Nam.',
      'Chiến đấu trên từng con phố lát đá khi người dân kinh thành mở cửa tiếp ứng cho nghĩa quân.',
      'Quảng trường Chuông Lớn vang lên hồi chuông giải phóng — nhưng viện binh Đế Chế lập tức phản kích.',
      'Khu phố cổ chật hẹp tạo điều kiện cho các đòn đánh úp. Hãy bảo vệ pháp sư và mục sư ở tuyến sau.',
      'Cầu Hoàng Gia bắc qua hào nước bao quanh hoàng cung. Giành lấy cầu là đặt chân vào trái tim kinh đô.',
      'Soren trở lại Học Viện Ma Đạo cũ — nơi từng đào tạo anh — nay bị kẻ phản đồ chiếm giữ.',
      'Doanh trại Cận Vệ Đỏ là nơi tập hợp những chiến binh trung thành nhất của Malakor.',
      'Đột phá bức tường nội thành bằng sức mạnh tổng hợp của toàn bộ liên quân.',
      'Trong hoa viên hoàng cung, Kaelen nhớ lại lời thề năm xưa trước ngày kinh đô thất thủ.',
      'Đại sảnh Vương Miện chứng kiến trận thư hùng đỉnh cao với đội cấm vệ tinh nhuệ nhất.',
      'Chỉ còn một cánh cửa nữa là tới ngai vàng Aethelgard.',
      'Malakor bị đánh bại ngay tại ngai vàng, nhưng hắn kích hoạt cánh cổng dịch chuyển lên Thánh Điện Huyết Ấn cho canh bạc cuối cùng!',
    ],
  },
  10: {
    titles: [
      'Bậc Thang Thiên Giới',
      'Hành Lang Ánh Sao',
      'Cổng Phong Ấn Thứ Nhất',
      'Sảnh Ký Ức Cổ Đại',
      'Cầu Ánh Sáng',
      'Cổng Phong Ấn Thứ Hai',
      'Điện Thờ Năm Ngôi Sao',
      'Vòng Xoáy Huyết Lực',
      'Cổng Phong Ấn Cuối Cùng',
      'Bệ Thờ Huyết Long',
      'Ngọn Lửa Tận Thế',
      'Bình Minh Của Aethelis',
    ],
    layouts: [
      'canyon_pass',
      'capital_streets',
      'border_gate',
      'sanctum_throne',
      'twin_bridges',
      'lava_fortress',
      'sanctum_throne',
      'lava_fortress',
      'border_gate',
      'sanctum_throne',
      'lava_fortress',
      'sanctum_throne',
    ],
    bossNames: [
      'Thiên Vệ Sa Ngã Ael',
      'Tinh Sư Hắc Ám Solis',
      'Kẻ Giữ Ấn I — Vorn',
      'Bóng Ma Cổ Vương',
      'Kỵ Sĩ Ánh Sáng Đen',
      'Kẻ Giữ Ấn II — Nyra',
      'Thánh Pháp Sư Đọa Lạc',
      'Huyết Tướng Cuồng Nộ',
      'Kẻ Giữ Ấn III — Kronos',
      'Hóa Thân Huyết Long',
      'Cận Vệ Tận Thế Malak',
      'Huyết Đế Malakor Thức Tỉnh',
    ],
    bossClasses: [
      'CELESTIAL_VALKYRIE',
      'ASTRAL_ORACLE',
      'TITAN_CITADEL',
      'SWORD_SAINT',
      'ABYSS_SOVEREIGN',
      'ABYSSAL_ARCHON',
      'ETERNAL_CHRONOS',
      'WAR_GOD',
      'DIVINE_WARDEN',
      'SKY_SOVEREIGN',
      'DARK_GENERAL',
      'DARK_GENERAL',
    ],
    storyBeats: [
      'Liên quân bước qua cánh cổng dịch chuyển lên Thánh Điện lơ lửng giữa tầng mây.',
      'Ánh sao và tia sét huyết sắc đan xen dọc hành lang cẩm thạch cổ xưa.',
      'Phá hủy Cổng Phong Ấn Thứ Nhất để làm chậm quá trình thức tỉnh của Huyết Long.',
      'Những ký ức về cuộc đại chiến nghìn năm trước hiện về trong Sảnh Cổ Đại.',
      'Cầu Ánh Sáng nối liền hai tháp thánh điện — không có đường lui, chỉ có tiến lên phía trước.',
      'Cổng Phong Ấn Thứ Hai được bảo vệ bởi pháp thuật cao cấp nhất của giáo phái.',
      'Năm ngôi sao cổ đại cộng hưởng với Thánh Kiếm Valoria, tiếp thêm sức mạnh cho Kaelen.',
      'Cơn bão huyết lực càn quét trung tâm thánh điện. Toàn quân siết chặt đội ngũ tiến lên.',
      'Cổng Phong Ấn Cuối Cùng vỡ vụn! Bệ thờ Huyết Long hiện ra rực đỏ trước mắt.',
      'Hóa thân Huyết Long gầm vang rung chuyển trời đất — đây là bài kiểm tra tối thượng của chiến thuật.',
      'Đội cận vệ cuối cùng xả thân bảo vệ nghi lễ của Malakor. Hãy dọn đường cho trận chung kết!',
      'Trận quyết chiến cuối cùng của 120 chiến dịch! Đánh bại Huyết Đế Malakor để phong ấn Huyết Long vĩnh viễn và mang lại bình minh hòa bình cho toàn lục địa Aethelis!',
    ],
  },
};

function pickObjective(chapterInAct: number): { objective: MapObjective; surviveTurns?: number } {
  if (chapterInAct === 12) return { objective: 'DEFEAT_BOSS' };
  if (chapterInAct === 4 || chapterInAct === 9) return { objective: 'SEIZE' };
  if (chapterInAct === 6) return { objective: 'SURVIVE', surviveTurns: 6 };
  if (chapterInAct === 8 || chapterInAct === 11) return { objective: 'DEFEAT_BOSS' };
  return { objective: 'ROUT' };
}

/**
 * Selects a class-legal 1–2 (or 1–3) range weapon for every Chapter Boss so stationary Throne
 * bosses can counter-attack both melee vanguard units AND ranged mages/archers!
 */
function pickBossWeapon(bossClass: UnitClassId, actNumber: number): string {
  const tier = actNumber >= 9 ? 4 : actNumber >= 6 ? 3 : actNumber >= 3 ? 2 : 1;
  switch (bossClass) {
    case 'DARK_GENERAL':
    case 'WAR_GOD':
    case 'REAVER':
    case 'BERSERKER':
    case 'FIGHTER':
    case 'WAR_MONK':
    case 'CORSAIR':
    case 'DREAD_CAPTAIN':
      if (tier >= 4) return 'urvan_eclipse';
      if (tier === 3) return 'crimson_halberd';
      if (tier === 2) return 'short_axe';
      return 'hand_axe';

    case 'MAGE':
    case 'SAGE':
    case 'ARCHSAGE':
    case 'ASTRAL_ORACLE':
    case 'NECROMANCER':
    case 'DARK_DRUID':
    case 'ABYSSAL_ARCHON':
    case 'SPIRIT_CALLER':
    case 'ETERNAL_CHRONOS':
      if (tier >= 4) return 'apocalypse_mythic';
      if (tier === 3) return 'ruin_eclipse';
      if (tier === 2) return 'nosferatu';
      return 'fire_tome';

    case 'ARCHER':
    case 'SNIPER':
    case 'MARKSMAN':
    case 'NOMAD_TROOPER':
      if (tier >= 4) return 'double_bow';
      if (tier === 3) return 'storm_ballista';
      if (tier === 2) return 'armor_crossbow';
      return 'short_bow';

    case 'MYRMIDON':
    case 'SWORDMASTER':
    case 'TRUEBLADE':
    case 'SWORD_SAINT':
    case 'ASSASSIN':
    case 'PHANTOM_REAPER':
    case 'RONIN_MASTER':
    case 'MORTAL_SAVANT':
    case 'MASTER_NINJA':
    case 'SHADOW_KAGE':
      if (tier >= 4) return 'alondite_edge';
      if (tier === 3) return 'runesword';
      if (tier === 2) return 'levin_sword';
      return 'wind_edge';

    case 'CAVALIER':
    case 'PALADIN':
    case 'SILVER_KNIGHT':
    case 'ASTRAL_CAVALIER':
    case 'KNIGHT':
    case 'GENERAL':
    case 'MARSHAL':
    case 'TITAN_CITADEL':
    case 'SPEAR_EMPEROR':
    case 'HOLY_BASTION':
    case 'DIVINE_WARDEN':
    case 'PEGASUS':
    case 'CELESTIAL_VALKYRIE':
    case 'GRIFFIN_LORD':
    case 'WYVERN_LORD':
    case 'DRAGONLORD':
    case 'SKY_SOVEREIGN':
    case 'DOOM_RIDER':
    case 'DEATH_KNIGHT':
    case 'ABYSS_SOVEREIGN':
    default:
      if (tier >= 4) return 'gradivus_imperial';
      if (tier === 3) return 'dragon_spear';
      if (tier === 2) return 'short_spear';
      return 'javelin';
  }
}

export function getMapScaleLabel(mapWidth: number, mapHeight: number): 'Cỡ Vừa' | 'Cỡ Lớn' | 'Đại Chiến Trường' {
  const area = mapWidth * mapHeight;
  if (area >= 480) return 'Đại Chiến Trường';
  if (area >= 325) return 'Cỡ Lớn';
  return 'Cỡ Vừa';
}

/**
 * Dynamic, non-uniform battlefield dimensions across all 120 maps:
 * Mixes Medium (Cỡ Vừa: 18×12, 20×12, 18×14, 22×12),
 * Large (Cỡ Lớn: 24×14, 22×16, 26×15, 28×15, 24×18, 26×17),
 * and Very Large / Colossal (Đại Chiến Trường: 30×18, 32×18, 28×20, 34×20, 36×22)
 * with varied aspect ratios (wide valleys, tall north-south sieges, square arenas, grand citadels)
 * so consecutive chapters never share a repetitive box shape.
 */
function computeMapDimensions(
  actNumber: number,
  chapterInAct: number,
  layout: LayoutTemplate
): { mapWidth: number; mapHeight: number; maxDeploySlots: number } {
  // 12-chapter cadence within each Act (varied silhouette & scale rhythm):
  // Ch 1: Medium opening clash | Ch 2: Wide skirmish | Ch 3: Long bridge/pass | Ch 4: Tall uphill Seize
  // Ch 5: Compact ambush | Ch 6: Large Mid-Act Holdout/Siege | Ch 7: Wide flanking | Ch 8: Large fortress
  // Ch 9: Tall citadel Seize | Ch 10: Colossal Warfront | Ch 11: Inner Sanctum | Ch 12: Colossal Act Finale
  const actGrowthW = Math.floor((actNumber - 1) * 0.75) * 2; // 0 .. +12 cols across 10 Acts
  const actGrowthH = Math.floor((actNumber - 1) * 0.55); // 0 .. +4 rows across 10 Acts

  let baseW = 20;
  let baseH = 13;

  switch (chapterInAct) {
    case 1:
      baseW = 18 + Math.min(4, Math.floor(actNumber / 3) * 2);
      baseH = 12 + Math.min(2, Math.floor(actNumber / 4));
      break;
    case 2:
      baseW = 22 + Math.min(6, Math.floor(actNumber / 2) * 2);
      baseH = 13 + Math.min(3, Math.floor(actNumber / 3));
      break;
    case 3:
      // Long tactical bridge / canyon corridor
      baseW = 26 + Math.min(6, Math.floor(actNumber / 2) * 2);
      baseH = 12 + Math.min(3, Math.floor(actNumber / 3));
      break;
    case 4:
      // Tall uphill / north-south assault
      baseW = 20 + Math.min(6, Math.floor(actNumber / 2) * 2);
      baseH = 16 + Math.min(4, Math.floor(actNumber / 3));
      break;
    case 5:
      // Tighter ambush / ruins skirmish (keeps Medium maps alive even in mid acts!)
      baseW = 18 + Math.min(4, Math.floor(actNumber / 4) * 2);
      baseH = 13 + Math.min(2, Math.floor(actNumber / 5));
      break;
    case 6:
      // Mid-Act Major Survival / Encirclement Arena (Large -> Very Large)
      baseW = 24 + Math.min(8, Math.floor(actNumber * 0.8));
      baseH = 16 + Math.min(4, Math.floor(actNumber * 0.45));
      break;
    case 7:
      baseW = 24 + Math.min(6, Math.floor(actNumber / 2) * 2);
      baseH = 14 + Math.min(3, Math.floor(actNumber / 3));
      break;
    case 8:
      baseW = 26 + Math.min(6, Math.floor(actNumber * 0.6));
      baseH = 16 + Math.min(4, Math.floor(actNumber * 0.4));
      break;
    case 9:
      // Deep multi-district Seize
      baseW = 24 + Math.min(8, actGrowthW);
      baseH = 18 + Math.min(4, actGrowthH);
      break;
    case 10:
      // Colossal Grand Warfront
      baseW = 28 + Math.min(8, Math.floor(actNumber * 0.8));
      baseH = 18 + Math.min(4, Math.floor(actNumber * 0.4));
      break;
    case 11:
      baseW = 26 + Math.min(8, Math.floor(actNumber * 0.7));
      baseH = 17 + Math.min(4, Math.floor(actNumber * 0.4));
      break;
    case 12:
    default:
      // Colossal Act Finale (30×18 in Act I up to 36×22 in Act X!)
      baseW = 30 + Math.min(6, Math.floor((actNumber - 1) * 0.7));
      baseH = 18 + Math.min(4, Math.floor((actNumber - 1) * 0.45));
      break;
  }

  // Layout-specific proportion nuance
  if (layout === 'canyon_pass' || layout === 'twin_bridges') {
    baseW += 2;
  } else if (layout === 'capital_streets' || layout === 'lava_fortress') {
    baseH += 1;
  }

  const mapWidth = Math.max(18, Math.min(36, Math.round(baseW)));
  const mapHeight = Math.max(12, Math.min(22, Math.round(baseH)));
  const area = mapWidth * mapHeight;

  // Deployment slots scale with BOTH Act roster size and actual battlefield scale (6 .. 12 heroes)
  let maxDeploySlots = 6;
  if (actNumber === 1) {
    maxDeploySlots = area >= 480 ? 8 : area >= 300 ? 7 : 6;
  } else if (actNumber === 2) {
    maxDeploySlots = area >= 480 ? 9 : area >= 320 ? 8 : 7;
  } else if (actNumber <= 4) {
    maxDeploySlots = area >= 520 ? 10 : area >= 340 ? 9 : 8;
  } else if (actNumber <= 7) {
    maxDeploySlots = area >= 560 ? 11 : area >= 360 ? 10 : 9;
  } else {
    maxDeploySlots = area >= 580 ? 12 : area >= 400 ? 11 : 10;
  }

  return { mapWidth, mapHeight, maxDeploySlots };
}

/**
 * Smooth campaign level progression aligned with 3-stage promotions:
 * Map 1 -> Lv.1 | Map 12 -> Lv.5 (Bậc II) | Map 48 -> Lv.15 (Bậc III) | Map 98 -> Lv.30 (Bậc IV) | Map 120 -> Lv.36
 */
function computeRecommendedLevel(mapId: number): number {
  if (mapId <= 12) {
    return Math.max(1, Math.round(1 + ((mapId - 1) * 4) / 11));
  }
  if (mapId <= 48) {
    return Math.round(5 + ((mapId - 12) * 10) / 36);
  }
  if (mapId <= 98) {
    return Math.round(15 + ((mapId - 48) * 15) / 50);
  }
  return Math.round(30 + ((mapId - 98) * 6) / 22);
}

interface HeroVoiceProfile {
  id: string;
  speaker: string;
  role: string;
  classId: UnitClassId;
  accent: string;
}

const ALLY_VOICES: Record<string, HeroVoiceProfile> = {
  kaelen: { id: 'kaelen', speaker: 'Kaelen', role: 'Hoàng Tử Valoria', classId: 'LORD', accent: '#3b82f6' },
  lyra: { id: 'lyra', speaker: 'Lyra', role: 'Đội Trưởng Kỵ Sĩ', classId: 'CAVALIER', accent: '#14b8a6' },
  soren: { id: 'soren', speaker: 'Soren', role: 'Quân Sư Ma Đạo', classId: 'MAGE', accent: '#10b981' },
  rowan: { id: 'rowan', speaker: 'Rowan', role: 'Xạ Thủ Rừng Già', classId: 'ARCHER', accent: '#84cc16' },
  elara: { id: 'elara', speaker: 'Elara', role: 'Nữ Tu Thánh Quang', classId: 'CLERIC', accent: '#f59e0b' },
  veyra: { id: 'veyra', speaker: 'Veyra', role: 'Long Kỵ Sĩ Lục Lâm', classId: 'WYVERN_RIDER', accent: '#059669' },
  sylvara: { id: 'sylvara', speaker: 'Sylvara', role: 'Nữ Ma Kiếm Sĩ', classId: 'SPELLBLADE', accent: '#ec4899' },
  garrick: { id: 'garrick', speaker: 'Garrick', role: 'Đội Trưởng Đánh Thuê', classId: 'MERCENARY', accent: '#dc2626' },
  zephyr: { id: 'zephyr', speaker: 'Zephyr', role: 'Thích Khách Bóng Đêm', classId: 'THIEF', accent: '#818cf8' },
  nadia: { id: 'nadia', speaker: 'Nadia', role: 'Nữ Thương Binh Tiên Phong', classId: 'SOLDIER', accent: '#0284c7' },
  celeste: { id: 'celeste', speaker: 'Celeste', role: 'Nữ Kỵ Y Sư Hoàng Gia', classId: 'TROUBADOUR', accent: '#f472b6' },
  drake: { id: 'drake', speaker: 'Drake', role: 'Thuyền Trưởng Hải Tặc', classId: 'PIRATE', accent: '#0d9488' },
  mira: { id: 'mira', speaker: 'Mira', role: 'Kỵ Sĩ Thiên Mã', classId: 'PEGASUS', accent: '#38bdf8' },
  cassian: { id: 'cassian', speaker: 'Cassian', role: 'Tu Sĩ Quang Minh', classId: 'MONK', accent: '#eab308' },
  aurelia: { id: 'aurelia', speaker: 'Aurelia', role: 'Kỵ Sĩ Sư Ưng Hoàng Kim', classId: 'GRIFFIN_RIDER', accent: '#f59e0b' },
  kenji: { id: 'kenji', speaker: 'Kenji', role: 'Võ Sĩ Đạo Phương Đông', classId: 'SAMURAI', accent: '#e11d48' },
  borin: { id: 'borin', speaker: 'Borin', role: 'Bức Tường Thép', classId: 'KNIGHT', accent: '#94a3b8' },
  kaelith: { id: 'kaelith', speaker: 'Kaelith', role: 'Du Mục Thảo Nguyên', classId: 'NOMAD', accent: '#16a34a' },
  orion: { id: 'orion', speaker: 'Orion', role: 'Vu Sư Cổ Ngữ', classId: 'SHAMAN', accent: '#7c3aed' },
  brutus: { id: 'brutus', speaker: 'Brutus', role: 'Quyền Đấu Sĩ Bất Khuất', classId: 'BRAWLER', accent: '#ea580c' },
  kain: { id: 'kain', speaker: 'Kain', role: 'Kiếm Khách Lãng Du', classId: 'MYRMIDON', accent: '#f43f5e' },
  falkor: { id: 'falkor', speaker: 'Falkor', role: 'Khinh Kỵ Trinh Sát', classId: 'OUTRIDER', accent: '#06b6d4' },
  malrik: { id: 'malrik', speaker: 'Malrik', role: 'Hắc Kỵ Sĩ Lãng Du', classId: 'DARK_KNIGHT', accent: '#9333ea' },
  morgath: { id: 'morgath', speaker: 'Morgath', role: 'Hắc Pháp Sư Ẩn Sĩ', classId: 'DARK_MAGE', accent: '#a855f7' },
  seraphina: { id: 'seraphina', speaker: 'Seraphina', role: 'Chiến Mục Sư Thánh Phủ', classId: 'WAR_CLERIC', accent: '#d97706' },
  darius: { id: 'darius', speaker: 'Darius', role: 'Long Thương Đồ Long', classId: 'DRAGOON', accent: '#0ea5e9' },
  tormund: { id: 'tormund', speaker: 'Tormund', role: 'Chiến Binh Cuồng Rìu', classId: 'FIGHTER', accent: '#ea580c' },
  kage: { id: 'kage', speaker: 'Kage', role: 'Ảnh Nhẫn U Minh', classId: 'NINJA', accent: '#4f46e5' },
  valen: { id: 'valen', speaker: 'Valen', role: 'Thánh Điện Kỵ Sĩ', classId: 'TEMPLAR', accent: '#eab308' },
  astraea: { id: 'astraea', speaker: 'Astraea', role: 'Thời Không Sư Tinh Tú', classId: 'CHRONOMANCER', accent: '#22d3ee' },
};

function makeAllyLine(heroKey: string, text: string): DialogueLine {
  const v = ALLY_VOICES[heroKey] ?? ALLY_VOICES.kaelen;
  return {
    speaker: v.speaker,
    role: v.role,
    portraitKey: v.id,
    side: 'left',
    text,
    speakerClassId: v.classId,
    speakerAccent: v.accent,
    speakerFaction: 'PLAYER',
  };
}

function makeBossLine(
  bossName: string,
  bossRole: string,
  bossClass: UnitClassId,
  mapId: number,
  text: string
): DialogueLine {
  const isMalakor = bossName.includes('Malakor');
  return {
    speaker: bossName,
    role: bossRole,
    portraitKey: isMalakor ? 'malakor' : `boss_${mapId}`,
    side: 'right',
    text,
    speakerClassId: bossClass,
    speakerAccent: isMalakor ? '#dc2626' : '#ef4444',
    speakerFaction: 'ENEMY',
  };
}

/**
 * Dedicated Hero Recruitment / Spotlight chapters across the 120-map chronicle so all 30 heroes
 * receive memorable narrative introductions!
 */
const CHAPTER_RECRUITMENTS: Record<number, { heroIds: string[]; introLine: DialogueLine }> = {
  2: {
    heroIds: ['rowan', 'elara'],
    introLine: makeAllyLine(
      'elara',
      'Thưa Điện hạ! Tôi và xạ thủ Rowan đang đưa người già trẻ nhỏ rút qua rặng cây phía Tây. Xin hãy để tiếng cung và trượng thánh của chúng tôi sát cánh giữ lửa cho dân làng!'
    ),
  },
  3: {
    heroIds: ['veyra', 'garrick'],
    introLine: makeAllyLine(
      'veyra',
      'Đội đánh thuê của Garrick giữ mặt cầu, còn chiến long của ta sẽ quét sạch kỵ binh bên sườn! Valoria trả công sòng phẳng hay không chưa biết, nhưng lũ Thiết Huyết đốt quê hương ta thì phải trả nợ máu!'
    ),
  },
  5: {
    heroIds: ['sylvara'],
    introLine: makeAllyLine(
      'sylvara',
      'Cổ ngữ khắc trên khiên lính Thiết Huyết không phải phù hiệu quân sự thông thường — đó là ấn ký Mộc Ấn cổ đại! Lưỡi ma kiếm của thần sẽ cùng Điện hạ chém toạc màn bí mật này.'
    ),
  },
  13: {
    heroIds: ['nadia', 'celeste'],
    introLine: makeAllyLine(
      'nadia',
      'Đội tuần biên rừng Eldwood của thần và nữ kỵ y sư Celeste vẫn còn nguyên nhuệ khí! Quân sư Soren đã giao mật tín trước khi rút về Tháp Học Giả — để chúng thần dẫn đường xuyên sương!'
    ),
  },
  15: {
    heroIds: ['drake'],
    introLine: makeAllyLine(
      'drake',
      'Ha! Tưởng chỉ có biển khơi mới lắm cá mập, ai ngờ suối ngầm Eldwood cũng đầy lũ chó săn Thiết Huyết! Cho lão thuyền trưởng Drake này góp một tay bổ đôi thuyền giặc nào!'
    ),
  },
  16: {
    heroIds: ['zephyr'],
    introLine: makeAllyLine(
      'zephyr',
      'Đừng giương thương về phía bóng cây, người anh em — ta vừa cắt đứt dây bẫy tên độc cho các ngươi đấy. Muốn cứu vị quân sư áo xanh kia nguyên vẹn thì đi theo bước chân của Zephyr.'
    ),
  },
  18: {
    heroIds: ['soren'],
    introLine: makeAllyLine(
      'soren',
      'Kaelen! Cuối cùng viện binh cũng tới! Trong tháp canh này có bản dập nguyên vẹn về Ngũ Đại Huyết Ấn — Malakor không xâm lược vì đất đai, hắn muốn đánh thức Huyết Long Vực Thẳm!'
    ),
  },
  25: {
    heroIds: ['cassian'],
    introLine: makeAllyLine(
      'cassian',
      'Ánh sáng tu viện trên đỉnh Gió Hú đã bị quân Đế Chế dập tắt, nhưng Quang Minh Pháp trong tim bần tăng vẫn rực cháy. Xin nguyện dùng thánh thư dẫn lối đoàn quân qua hẻm núi!'
    ),
  },
  27: {
    heroIds: ['aurelia'],
    introLine: makeAllyLine(
      'aurelia',
      'Từ đỉnh Tổ Đại Bàng, đôi cánh Sư Ưng Hoàng Kim đã thấy rõ lá cờ rồng lam của Điện hạ! Hãy để Aurelia chiếm lĩnh bầu trời, bổ nhào vào sườn pháo binh địch!'
    ),
  },
  29: {
    heroIds: ['mira'],
    introLine: makeAllyLine(
      'mira',
      'Kỵ đoàn Thiên Mã phương Tây xin nghe lệnh Hoàng tử Kaelen! Gió ngược hẻm sâu không cản nổi cánh trắng — chỉ cần dè chừng các ổ nỏ trên vách đá là chúng ta làm chủ chiến trường!'
    ),
  },
  32: {
    heroIds: ['kenji'],
    introLine: makeAllyLine(
      'kenji',
      'Thanh Yêu Đao phương Đông của tại hạ đã đi vạn dặm tìm kẻ xứng tầm so kiếm. Thấy quân Valoria lấy ít địch nhiều giữ trọn đại nghĩa, Kenji này xin mượn đầu tướng giặc tế cờ!'
    ),
  },
  37: {
    heroIds: ['kaelith'],
    introLine: makeAllyLine(
      'kaelith',
      'Cát nóng Solara nuốt chửng kẻ ngoại bang, nhưng lại nâng bước chiến mã bộ tộc Gió Đỏ! Kaelen xứ Valoria, hãy để cung kỵ Kaelith chỉ cho ngài mạch nước ngầm và tử huyệt quân Zarek!'
    ),
  },
  39: {
    heroIds: ['orion'],
    introLine: makeAllyLine(
      'orion',
      'Bia đá Mặt Trời đang rỉ máu dưới gót giày lũ trộm mộ Thiết Huyết... Ta là Orion, kẻ giữ cổ ngữ sa mạc. Bóng tối của rừng và cát sẽ nuốt chửng kẻ nào dám phạm vào Thái Dương Ấn!'
    ),
  },
  41: {
    heroIds: ['borin'],
    introLine: makeAllyLine(
      'borin',
      'Lùi lại sau khiên của lão, lũ trẻ làng ốc đảo! Hửm — viện binh Valoria tới rồi sao?! Tốt lắm! Chừng nào Borin còn đứng vững trên cổng thành này, đừng một mũi giáo nào hòng lọt qua!'
    ),
  },
  47: {
    heroIds: ['brutus'],
    introLine: makeAllyLine(
      'brutus',
      'Zarek xích ta dưới hầm đấu trường suốt ba mùa nắng cháy để mua vui! Giờ xiềng xích đã đứt — đôi nắm đấm và chiến búa của Brutus sẽ nghiền vụn từng tấm thiết giáp của hắn!'
    ),
  },
  50: {
    heroIds: ['falkor'],
    introLine: makeAllyLine(
      'falkor',
      'Ngọn hải đăng Sương Đen vừa tắt là tín hiệu hạm đội ngầm áp sát! Khinh kỵ trinh sát Falkor báo cáo: cả ba luồng cầu cảng đều nằm trong tầm tên của tôi, xuất kích ngay thôi!'
    ),
  },
  52: {
    heroIds: ['kain'],
    introLine: makeAllyLine(
      'kain',
      'Mưa đêm rửa sạch vết máu trên lưỡi kiếm rất nhanh... Đô đốc Drax từng nhấn chìm cả hạm đội quê hương ta. Cho Kain đi mũi tiên phong, đêm nay Sương Đen sẽ đổi chủ!'
    ),
  },
  56: {
    heroIds: ['malrik'],
    introLine: makeAllyLine(
      'malrik',
      'Ta từng khoác áo Hắc Kỵ của Đế Chế cho tới ngày tận mắt thấy Malakor hiến tế cả một tiểu đoàn cho giáo phái Hắc Ấn. Kaelen — nếu ngươi không ngại ma lực bóng tối, thương của Malrik thuộc về ngươi.'
    ),
  },
  62: {
    heroIds: ['morgath'],
    introLine: makeAllyLine(
      'morgath',
      'Đầm lầy này không bị nguyền rủa ngẫu nhiên đâu, Soren trẻ tuổi ạ. Ta đã ẩn cư ba mươi năm canh chừng U Uyên Ấn — hãy để lão già Morgath dùng chính hắc thuật quật ngược lũ tà giáo Morvath!'
    ),
  },
  64: {
    heroIds: ['seraphina'],
    introLine: makeAllyLine(
      'seraphina',
      'Lời cầu nguyện hiền hòa không cứu nổi người sống giữa đầm lầy tử khí! Nhân danh Thánh Phủ Quang Minh, Seraphina sẽ vừa chữa lành vết thương cho nghĩa quân, vừa bổ nát tế đàn tà ác!'
    ),
  },
  69: {
    heroIds: ['darius'],
    introLine: makeAllyLine(
      'darius',
      'Mũi Long Thương gia truyền của dòng họ Darius rèn ra chỉ vì một sứ mệnh: xuyên thủng vảy rồng vực thẳm! Nghe tin Huyết Long cựa mình, ta không thể ngồi yên thêm một khắc!'
    ),
  },
  74: {
    heroIds: ['tormund'],
    introLine: makeAllyLine(
      'tormund',
      'Hahaha! Tuyết ngập ngang lưng mà quân phương Nam vẫn hành quân thần tốc thế này ư?! Rìu của Tormund nóng lên rồi — đi theo ta phá toang trại băng kỵ của Sorenth!'
    ),
  },
  78: {
    heroIds: ['kage'],
    introLine: makeAllyLine(
      'kage',
      'Ngọn lửa Lò Rèn Cổ đã sẵn sàng, Hoàng tử. Tộc Ảnh Nhẫn phương Bắc đã âm thầm bảo vệ báu vật này suốt trăm năm — từ khắc này, bóng của Kage là lưỡi kiếm thứ hai của ngài.'
    ),
  },
  86: {
    heroIds: ['valen'],
    introLine: makeAllyLine(
      'valen',
      'Thánh Điện Hiệp Sĩ Đoàn tưởng đã tuyệt diệt ngày cố đô thất thủ, nhưng Valen vẫn giữ trọn lời thề hộ quốc! Giữa biển lửa dung nham này, khiên vàng của thần sẽ mở đường máu cho Điện hạ!'
    ),
  },
  90: {
    heroIds: ['astraea'],
    introLine: makeAllyLine(
      'astraea',
      'Vòng quay tinh tú đã hội tụ đúng thời khắc định mệnh... Ta là Astraea, kẻ canh giữ dòng chảy Thời Không. Nếu Ngũ Ấn sụp đổ tại Nham Thạch, tương lai Aethelis sẽ hóa tro tàn — hãy tiến lên!'
    ),
  },
};

const ACT_LORE_THEMES: Record<
  number,
  {
    sealLore: string;
    tacticalFlavor: string[];
    bossTaunts: string[];
    victoryReflections: string[];
  }
> = {
  1: {
    sealLore: 'Mật lệnh thu được trên mình lính tiên phong đều đóng dấu Huyết Ấn năm cánh cổ xưa.',
    tacticalFlavor: [
      'Khói đen cuộn lên dọc đường biên giới, từng trang trại Valoria đang trông cậy vào hàng khiên của chúng ta.',
      'Địa hình đồng cỏ xen lẫn lũy đá rất thuận lợi để kỵ binh Lyra và thương binh khóa chặt hai cánh.',
      'Đội hình địch bố trí cả xạ thủ lẫn thiết giáp giữ chốt — hãy giữ vững cự ly trước khi tung đòn dứt điểm.',
      'Dân tị nạn vừa kịp qua cầu an toàn, giờ là lúc quân Valoria quay mũi giáo giáng trả kẻ xâm lăng!',
    ],
    bossTaunts: [
      'Hoàng tử mất thành mà vẫn còn mơ mộng giữ đất ư? Dưới gót sắt Thiết Huyết, cỏ cây Valoria cũng phải cúi đầu!',
      'Nguyên soái Malakor đã ban lệnh: không chừa một đồn lũy nào trên thảo nguyên này! Xông lên lấy đầu Kaelen!',
      'Chỉ với nhúm tàn binh biên ải mà dám đối đầu quân đoàn chinh phạt? Hôm nay nơi đây sẽ thành mồ chôn vương tộc!',
    ],
    victoryReflections: [
      'Người dân biên ải reo hò tiếp thêm lương thảo cho nghĩa quân, nhưng khói lửa phía chân trời vẫn chưa dứt.',
      'Thêm một cứ điểm biên thùy được thu hồi; tinh thần binh sĩ Valoria đang dâng cao từng giờ.',
    ],
  },
  2: {
    sealLore: 'Dưới tầng rễ đại ngàn Eldwood, luồng ma lực xanh lục của Mộc Ấn đang rung lên bất ổn.',
    tacticalFlavor: [
      'Sương mù dày đặc làm giảm tầm nhìn cung thủ, nhưng những tán cổ thụ lại che chở tuyệt vời cho bộ binh.',
      'Những bia đá phủ rêu quanh đây khắc đầy cổ tự thời Khởi Nguyên — quân Thiết Huyết đang ráo riết đào bới chúng.',
      'Kẻ địch gài nhiều toán thích khách ẩn mình sau vòm lá; đừng để pháp sư và y sư đi lẻ ở tuyến sau.',
      'Mỗi bước tiến sâu vào Eldwood đều đưa chúng ta gần hơn tới chân tướng âm mưu của Giáo phái Hắc Ấn.',
    ],
    bossTaunts: [
      'Bước vào rừng sương mà không biết mình đã lọt lưới tử thần sao? Từng gốc cây ở đây đều ngắm thẳng vào tim các ngươi!',
      'Mộc Ấn cổ đại sớm muộn cũng thuộc về Đại Đế Quốc! Kẻ biết quá nhiều như lũ ngươi tuyệt đối không được sống sót rời rừng!',
      'Màn sương Eldwood sẽ nuốt trọn tiếng kêu cứu của Valoria — hạ sát toàn bộ không chừa một mống!',
    ],
    victoryReflections: [
      'Ánh nắng le lói xuyên qua tán rừng già sau trận kịch chiến, hé lộ con đường cổ dẫn về rặng núi phía Tây.',
      'Những mảnh ghi chép thu hồi từ trại giặc giúp Soren ghép nối dần bản đồ năm phong ấn trên lục địa.',
    ],
  },
  3: {
    sealLore: 'Đỉnh Gió Hú là trạm trung chuyển huyết mạch nối liền miền rừng Eldwood với đại sa mạc phương Nam.',
    tacticalFlavor: [
      'Gió lốc quật mạnh qua khe núi hẹp; kỵ sĩ bay có thể vòng qua vách đá nhưng phải tránh xa tầm nỏ bắn tỉa!',
      'Địch chiếm giữ cao điểm hiểm yếu và khóa chặt các nhịp cầu treo — chia quân hai mũi bọc sườn sẽ phá vỡ thế bế tắc.',
      'Tiếng tù và vang vọng vách núi báo hiệu các đội tinh nhuệ của Corvus đang co cụm quanh pháo đài đá.',
      'Giành được đỉnh đèo này, toàn bộ tuyến tiếp vận miền Tây của Đế Chế sẽ đứt gãy hoàn toàn.',
    ],
    bossTaunts: [
      'Trên Hẻm Núi Gió Hú này, một mũi tên từ điểm cao đáng giá bằng mười vạn đại quân! Thử bước qua cầu xem!',
      'Đôi cánh Thiên Mã của các ngươi chỉ là bia tập bắn cho cung đoàn Đế Quốc mà thôi!',
      'Corvus đại nhân đã khóa chặt mọi ngả đèo — vách đá lạnh lẽo này sẽ chôn vùi hy vọng phản công của Valoria!',
    ],
    victoryReflections: [
      'Ngọn gió vùng cao thổi tung cờ hiệu rồng lam trên đỉnh đèo, mở toang tầm mắt xuống dải cát vàng Solara.',
      'Đường lương thảo miền Tây đã thông suốt; các bộ tộc tự do bắt đầu gửi chiến binh tới hội quân.',
    ],
  },
  4: {
    sealLore: 'Dưới lòng kim tự tháp cát Solara, Thái Dương Ấn đang rực nóng bởi nghi thức cưỡng đoạt ma lực.',
    tacticalFlavor: [
      'Biển cát lún cản bước ngựa chiến nặng nề, trong khi pháp sư và không kỵ lại lướt đi thanh thoát như gió lốc.',
      'Nắng gắt và bão cát bào mòn thể lực đôi bên — chiếm giữ các ốc đảo và pháo đài cổ là chìa khóa xoay chuyển cục diện.',
      'Các chiến binh du mục Solara đã nổi dậy hưởng ứng cờ nghĩa, khiến hậu phương quân Zarek rối loạn.',
      'Ánh vàng từ tàn tích cổ đại phản chiếu lên gươm giáo; trận đánh này sẽ định đoạt tự do cho toàn cõi phương Nam.',
    ],
    bossTaunts: [
      'Nắng lửa Solara sẽ thiêu khô máu thịt lũ phương Bắc trước khi các ngươi kịp chạm vào cổng thành của Tổng đốc Zarek!',
      'Thái Dương Ấn là chìa khóa mở ra kỷ nguyên bất tử của Nguyên soái Malakor — lũ sâu kiến đừng hòng ngăn cản!',
      'Chôn sống bọn chúng dưới bão cát đỏ! Không kẻ nào được phép chạm tới kho báu cổ đền!',
    ],
    victoryReflections: [
      'Tiếng trống khải hoàn của các bộ tộc Solara vang vọng khắp ốc đảo dưới bầu trời sao sa mạc trong vắt.',
      'Liên minh phương Nam vững chắc giúp quân đoàn Valoria đủ tiềm lực tiến thẳng ra vùng biển Sương Đen.',
    ],
  },
  5: {
    sealLore: 'Toàn bộ cổ vật cướp bóc từ bốn phương đang được Hạm đội Thiết Huyết tập kết tại Cảng Sương Đen.',
    tacticalFlavor: [
      'Mưa bão tầm tã trên cầu cảng làm dây cung chùng xuống, nhưng lại khiến Lôi pháp bùng nổ sức sát thương kinh hoàng!',
      'Những lối ván tàu và đê đá chia chiến trường thành nhiều luồng giao tranh sát ván không có chỗ cho sự do dự.',
      'Ánh đèn hải đăng quét qua mặt vịnh đen ngòm, soi rõ từng chiến hạm bọc sắt đang neo đậu.',
      'Đánh sập hệ thống cầu cảng ngay trong đêm mưa này sẽ bẻ gãy hoàn toàn gọng kìm đường biển của Đế Chế.',
    ],
    bossTaunts: [
      'Đại bác và thiết hạm của Đô đốc Drax đã khóa chặt cửa vịnh! Lũ bộ binh các ngươi định bơi qua sóng dữ chắc?!',
      'Cơn bão biển đêm nay sẽ nhấn chìm lá cờ Valoria xuống đáy vịnh Sương Đen mãi mãi!',
      'Giữ chặt boong tàu và kho quân giới! Đừng để Kaelen cướp đi dù chỉ một mảnh cổ vật Huyết Ấn!',
    ],
    victoryReflections: [
      'Lửa cháy rực mặt biển khi hạm đội xâm lược tan tác, nhưng dòng thủy triều đen từ phương Bắc lại mang tới điềm dữ mới.',
      'Thu giữ kho quân giới hải quân giúp đại quân trang bị đầy đủ trước khi bước vào vùng Đầm Lầy Hắc Ấn.',
    ],
  },
  6: {
    sealLore: 'U Uyên Ấn dưới đáy đầm lầy đã rạn nứt — nhịp tim trầm đục của Huyết Long vang vọng dưới lòng đất.',
    tacticalFlavor: [
      'Sương độc tím ngắt bao phủ mặt đầm; các tu sĩ Quang Minh và mục sư là điểm tựa sống còn trước tà thuật Hắc Ấn.',
      'Giáo phái của Morvath dựng tế đàn khắp các phế tích cổ vương, hút sinh lực đất đai để nuôi dưỡng ma trận.',
      'Những cây cầu gỗ bắc ngang vùng nước đen cực kỳ hiểm trở — hãy dùng đơn vị kháng phép cao mở đường!',
      'Không còn là cuộc chiến giành biên giới nữa: mỗi tế đàn bị phá hủy hôm nay là cứu lấy hàng vạn sinh linh khỏi thảm họa diệt thế.',
    ],
    bossTaunts: [
      'Nghe thấy không, hoàng tử bé nhỏ? Huyết Long vĩ đại đang cựa mình dưới bùn đen và khát khao máu hoàng tộc của ngươi!',
      'Ánh sáng yếu ớt của Valoria làm sao soi thấu màn đêm vĩnh hằng của Giáo phái Hắc Ấn?!',
      'Hãy trở thành vật tế cho Đại Tư Tế Morvath hoàn thành nghi lễ khai mở Thâm Uyên!',
    ],
    victoryReflections: [
      'Tà khí tan dần quanh các phế tích cổ, để lộ di huấn của vị vua lập quốc về ngọn lửa rèn lại Thánh Kiếm phương Bắc.',
      'Dù U Uyên Ấn bị tổn hại, ý chí kiên cường của toàn quân đã ngăn thảm họa bùng phát ngay tại đầm lầy.',
    ],
  },
  7: {
    sealLore: 'Tại đỉnh Vĩnh Đông phương Bắc, Lò Rèn Tinh Tú năm xưa vẫn chờ người kế thừa huyết thống Valoria.',
    tacticalFlavor: [
      'Gió tuyết gào thét phủ trắng mặt thành; phép Băng được cộng hưởng mạnh mẽ giữa cơn bão tuyết khắc nghiệt.',
      'Các quân đoàn Băng Kỵ của Sorenth nổi danh với những đợt xung kích thần tốc trên mặt hồ đóng băng.',
      'Ánh lửa từ các pháo đài đá không chỉ hồi phục sinh lực mà còn giữ vững trận địa trước sức ép dồn dập của địch.',
      'Thanh Thánh Kiếm Valoria trong tay Kaelen ngân vang từng hồi trong trẻo khi tiến gần Lò Rèn Cổ.',
    ],
    bossTaunts: [
      'Mùa đông phương Bắc không dung thứ kẻ yếu! Tuyết trắng sẽ đóng băng xác quân Valoria thành tượng đá vĩnh cửu!',
      'Băng Kỵ Tướng Sorenth đã thề lấy mạng Kaelen trước khi ngươi kịp bước tới Lò Rèn Cổ!',
      'Dù có rèn lại Thánh Kiếm, các ngươi cũng chẳng bao giờ xuyên thủng được bức tường băng của Đế Chế!',
    ],
    victoryReflections: [
      'Ánh cực quang xanh biếc phản chiếu trên lưỡi Thánh Kiếm thức tỉnh, xua tan cái lạnh cắt da của miền cực Bắc.',
      'Các thành bang phương Bắc đồng loạt phất cờ hội quân, hướng mũi giáo thẳng về Pháo Đài Nham Thạch!',
    ],
  },
  8: {
    sealLore: 'Miệng núi lửa Nham Thạch là lò luyện chiến tranh khổng lồ bảo vệ yết hầu dẫn về cố đô Aethelgard.',
    tacticalFlavor: [
      'Dòng dung nham sôi sục chia cắt mặt đất thành những dải cầu đá rực lửa; chỉ các chiến binh tinh nhuệ nhất mới trụ vững.',
      'Mưa tro tàn tiếp sức mạnh dữ dội cho Hỏa thuật và đòn đánh cận chiến — thế trận tấn công chủ động sẽ chiếm ưu thế!',
      'Tứ Đại Hộ Pháp của Thiết Giáp Vương Ignis đều khoác trọng giáp tinh luyện kèm vũ khí tầm xa cực kỳ lợi hại.',
      'Vượt qua bức tường lửa này, quê hương Aethelgard thân yêu sẽ hiện ra ngay trước mắt đoàn quân viễn chinh.',
    ],
    bossTaunts: [
      'Chào mừng tới Hỏa Ngục Nham Thạch! Mọi thanh gươm phàm tục chạm vào cổng thành này đều tan chảy thành tro bụi!',
      'Tứ Đại Hộ Pháp và Thiết Giáp Vương Ignis bất khả chiến bại! Bước thêm một bước là vùi thây dưới dòng nham thạch!',
      'Cố đô Aethelgard đã thuộc về Nguyên soái Malakor — lũ phản tặc các ngươi đừng mơ đặt chân qua miệng núi lửa!',
    ],
    victoryReflections: [
      'Bức tường thép tưởng chừng bất diệt của Đế Chế đã sụp đổ trong tiếng gầm vang của núi lửa Nham Thạch.',
      'Từ cổng thành đổ nát nhìn về phương Đông, những ngọn tháp trắng của Cố Đô Aethelgard đã hiện lên giữa ráng chiều.',
    ],
  },
  9: {
    sealLore: 'Ngay dưới ngai vàng Aethelgard, Thiên Tinh Ấn đang bị Malakor rút cạn linh lực để mở cổng lên Thánh Điện.',
    tacticalFlavor: [
      'Từng đại lộ lát đá hoa cương và dãy tường thành quen thuộc nay trở thành chiến trường giải phóng đầy xúc động.',
      'Người dân kinh đô âm thầm thắp đuốc trên ban công báo hiệu vị trí phục binh Cấm Vệ Đỏ cho nghĩa quân.',
      'Quân địch cố thủ trong từng khu phố và sảnh điện với đội hình hỗn hợp bậc cao — hãy phối hợp chặt chẽ cả 12 chiến tướng!',
      'Tiếng chuông giải phóng từ Quảng Trường Lớn đang gọi tên Kaelen và những người con trung nghĩa của Valoria.',
    ],
    bossTaunts: [
      'Aethelgard nay mang quốc hiệu Thiết Huyết! Kẻ nào dám giương lại lá cờ rồng cũ đều phải chịu án tru di!',
      'Cấm vệ quân thề tử chiến tới giọt máu cuối cùng để Nguyên soái Malakor hoàn tất đại lễ đăng thiên!',
      'Ngai vàng năm xưa của cha ngươi giờ đã nhuốm sắc đỏ Huyết Ấn rồi, Kaelen — quá muộn để cứu vãn!',
    ],
    victoryReflections: [
      'Cờ xanh Valoria tung bay trở lại trên các tháp canh Aethelgard trong nước mắt đoàn tụ của muôn dân.',
      'Dẫu kinh thành đã sạch bóng giặc, cột sáng huyết sắc vọt thẳng lên tầng mây báo hiệu trận chiến cuối cùng trên Thánh Điện.',
    ],
  },
  10: {
    sealLore: 'Thánh Điện Thiên Giới rung chuyển dữ dội khi Năm Mảnh Huyết Ấn va chạm với Thánh Kiếm Valoria.',
    tacticalFlavor: [
      'Dòng bão ma lực cổ xưa tràn ngập hành lang cẩm thạch, đẩy uy lực phép thuật và đòn chí mạng lên cực hạn!',
      'Đối diện chúng ta không còn là binh lính phàm trần mà là những Hóa Thân Thần Thoại canh giữ nghi lễ Huyết Long.',
      'Suốt hơn trăm trận chiến sinh tử từ cổng biên giới tới tầng mây này, sợi dây gắn kết của toàn quân chính là vũ khí mạnh nhất.',
      'Không lùi dù nửa bước — vận mệnh ngàn năm tiếp theo của lục địa Aethelis nằm trọn trong tay chúng ta!',
    ],
    bossTaunts: [
      'Phàm nhân nhỏ bé dám bước lên Thánh Điện của chư thần?! Ánh hào quang Huyết Ấn sẽ xóa sổ linh hồn các ngươi!',
      'Khi Huyết Long tái sinh, cả lục địa già cỗi này sẽ được thanh tẩy trong biển lửa vĩnh hằng của Hoàng Đế Malakor!',
      'Chứng kiến đi, Kaelen — sức mạnh tuyệt đối vượt trên mọi vương quyền và lời thề thế gian!',
    ],
    victoryReflections: [
      'Từng xiềng xích hắc ám trên bầu trời Thánh Điện tan biến, trả lại sắc xanh thanh khiết cho vòm sao Aethelis.',
      'Ánh sáng của Thánh Kiếm Valoria ngày càng rực rỡ khi đoàn quân tiến sát bệ thờ tối hậu.',
    ],
  },
};

function pickAdvisorKey(actNumber: number, chapterInAct: number, mapId: number): string {
  // Respect story continuity: Soren scouts ahead after Act I Ch 12 and is rescued in Act II Ch 6 (Map 18)!
  if (actNumber === 2 && chapterInAct < 6) {
    const earlyAct2Pool = ['sylvara', 'lyra', 'elara', 'nadia'];
    return earlyAct2Pool[mapId % earlyAct2Pool.length];
  }
  const poolByAct: Record<number, string[]> = {
    1: ['soren', 'lyra', 'elara', 'garrick', 'sylvara'],
    2: ['soren', 'zephyr', 'sylvara', 'celeste'],
    3: ['soren', 'mira', 'aurelia', 'cassian', 'kenji'],
    4: ['soren', 'borin', 'kaelith', 'orion', 'brutus'],
    5: ['soren', 'kain', 'falkor', 'malrik', 'drake'],
    6: ['soren', 'morgath', 'seraphina', 'darius'],
    7: ['soren', 'tormund', 'kage', 'lyra'],
    8: ['soren', 'valen', 'astraea', 'veyra'],
    9: ['soren', 'lyra', 'valen', 'astraea'],
    10: ['soren', 'astraea', 'lyra', 'sylvara'],
  };
  const pool = poolByAct[actNumber] ?? ['soren', 'lyra'];
  return pool[(chapterInAct + mapId) % pool.length];
}

function buildIntroDialogue(
  mapId: number,
  act: ActDefinition,
  chapterInAct: number,
  title: string,
  bossName: string,
  bossRole: string,
  bossClass: UnitClassId,
  storyBeat: string,
  prevMapInfo: { title: string; bossName: string; actRoman: string; regionName: string } | null,
  nextMapTitle: string | null
): DialogueLine[] {
  // Hand-crafted opening & climactic milestone scenes
  if (mapId === 1) {
    return [
      makeAllyLine(
        'lyra',
        'Thưa Điện hạ Kaelen! Khói đen đã bốc lên khắp đồn tiền tiêu — quân tiên phong Đế Chế Thiết Huyết vừa xé bỏ hòa ước trăm năm, phá toang hàng rào Cổng Biên Giới ngay lúc rạng đông!'
      ),
      makeAllyLine(
        'soren',
        'Lạ thật... Trên cờ hiệu của Đội Trưởng Marcus không chỉ có huy hiệu Thiết Huyết mà còn thêu ấn ký năm cánh cổ đại. Chúng hành quân gấp gáp như đang truy lùng thứ gì đó sâu trong lãnh thổ Valoria.'
      ),
      makeAllyLine(
        'kaelen',
        'Phía sau lưng chúng ta là hàng ngàn dân lành đang kịp sơ tán về các thôn trang nội địa. Toàn quân vào vị trí bố trí đội hình — bằng mọi giá phải bẻ gãy mũi xung kích của Marcus ngay tại cổng đá này!'
      ),
      makeBossLine(
        bossName,
        bossRole,
        bossClass,
        mapId,
        'Ồ, đích thân Hoàng tử Kaelen ra giữ cổng cơ đấy! Đáng tiếc thay, trước đại quân của Nguyên soái Malakor, thanh kiếm non nớt ấy chẳng cứu nổi Valoria đâu. Toàn quân — tràn lên san phẳng chúng!'
      ),
    ];
  }

  if (mapId === 12) {
    return [
      makeAllyLine(
        'lyra',
        'Cổng thành lớn Valoria đã ở ngay trước mặt! Tướng Tiên Phong Garen đích thân dàn trọng giáp khóa chặt đại lộ, quyết ngăn chúng ta khép lại mặt trận biên thùy.'
      ),
      makeAllyLine(
        'soren',
        'Điện hạ, thần vừa giải mã xong mật lệnh thu được ở tiền đồn: Malakor đã cử một cánh quân ngầm tiến vào Rừng Sương Mù Eldwood để tìm Mộc Ấn! Ngay khi trận này kết thúc, thần xin dẫn toán trinh sát đi trước mở đường.'
      ),
      makeAllyLine(
        'kaelen',
        'Được, nhưng trước hết hãy cùng nhau quét sạch quân đoàn Garen khỏi đất mẹ Valoria! Hỡi các chiến binh, hôm nay chúng ta giành lại bầu trời bình yên cho thảo nguyên!'
      ),
      makeBossLine(
        bossName,
        bossRole,
        bossClass,
        mapId,
        'Khá khen cho đám tàn binh dám đuổi theo tới tận đại bản doanh của Garen này! Hãy nếm thử uy lực Hắc Ám Đại Tướng của Đế Chế Thiết Huyết!'
      ),
    ];
  }

  if (mapId === 72) {
    return [
      makeAllyLine(
        'morgath',
        'Nhìn vòng xoáy huyết khí sau lưng Morvath kìa! Lão điên ấy đang dùng sinh mạng của chính giáo đồ Hắc Ấn để nạy tung tầng phong ấn U Uyên!'
      ),
      makeAllyLine(
        'kaelen',
        'Morvath! Ngươi nhân danh thần thánh mà lại biến cả vùng đất này thành địa ngục xương khô — hôm nay lưỡi kiếm của ta sẽ chấm dứt tà lễ của ngươi!'
      ),
      makeBossLine(
        bossName,
        bossRole,
        bossClass,
        mapId,
        'Hahaha! Ngu muội! Khi năm mảnh Huyết Ấn quy tụ trong tay Nguyên soái Malakor, Huyết Long sẽ tái sinh từ tro tàn! Hãy quỳ xuống đón nhận bóng tối vĩnh cửu đi!'
      ),
      makeAllyLine(
        'soren',
        'Toàn quân cẩn trọng! Morvath sở hữu cấm thư tầm xa hút sinh lực cực mạnh — hãy bố trí các chiến tướng kháng phép cao áp sát dứt điểm trong một lượt hợp kích!'
      ),
    ];
  }

  if (mapId === 108) {
    return [
      makeAllyLine(
        'kaelen',
        'Malakor! Cuối cùng chúng ta cũng đứng đối diện nhau dưới mái vòm Đại Sảnh Aethelgard — nơi ngươi từng phản bội lời thề đồng minh và nhấn chìm cả lục địa trong biển máu!'
      ),
      makeBossLine(
        bossName,
        bossRole,
        bossClass,
        mapId,
        'Kaelen... Ánh mắt ngươi giống hệt phụ vương ngươi ngày thành vỡ. Nhưng ngươi vẫn chưa hiểu đâu: hòa bình dựa trên lòng người chỉ là cát bụi — chỉ có sức mạnh tuyệt đối của Huyết Long mới thống nhất Aethelis mãi mãi!'
      ),
      makeAllyLine(
        'lyra',
        'Ngụy biện! Tham vọng điên cuồng của ngươi đã cướp đi biết bao mái nhà từ Valoria tới Solara! Hôm nay Cố Đô sẽ đòi lại công lý!'
      ),
      makeAllyLine(
        'astraea',
        'Điện hạ coi chừng! Thiên Tinh Ấn dưới ngai vàng đang cộng hưởng dữ dội — phải đánh gục Malakor trước khi hắn hoàn tất cổng dịch chuyển lên Thánh Điện!'
      ),
    ];
  }

  if (mapId === 120) {
    return [
      makeAllyLine(
        'astraea',
        'Bầu trời Thánh Điện đang rách toạc... Năm mảnh Huyết Ấn đã hợp nhất trên lồng ngực Malakor, biến hắn thành vật chủ của Huyết Long Vực Thẳm!'
      ),
      makeBossLine(
        bossName,
        bossRole,
        bossClass,
        mapId,
        'Hãy chiêm ngưỡng hình hài của thần linh đi, Kaelen! Suốt 119 trận đánh ngươi vùng vẫy chống lại định mệnh, chỉ để chứng kiến khoảnh khắc ta thiêu rụi thế giới cũ và khai sinh Đế Chế Vĩnh Hằng!'
      ),
      makeAllyLine(
        'soren',
        'Không có vị thần nào được dựng nên từ máu và nước mắt của muôn dân cả, Malakor! Sức mạnh của chúng ta là ý chí của tất cả những vùng đất đã đứng lên suốt hành trình này!'
      ),
      makeAllyLine(
        'kaelen',
        'Hỡi những người bạn đồng sinh cộng tử của ta! Phía sau lưng chúng ta là toàn cõi Aethelis đang ngước nhìn bình minh. Giương cao Thánh Kiếm Valoria — tiến vào trận quyết chiến cuối cùng!'
      ),
    ];
  }

  const lines: DialogueLine[] = [];
  const theme = ACT_LORE_THEMES[act.actNumber] ?? ACT_LORE_THEMES[1];
  const recruit = CHAPTER_RECRUITMENTS[mapId];

  // Line 1: Natural narrative scene-setting & causal story flow
  if (chapterInAct === 1 && prevMapInfo) {
    lines.push(
      makeAllyLine(
        'kaelen',
        `Chiến thắng trước ${prevMapInfo.bossName} đã khép lại mặt trận ${prevMapInfo.regionName}, đưa đại quân chúng ta đặt chân tới ${act.regionName}. ${storyBeat}`
      )
    );
  } else {
    const leadKey = chapterInAct % 3 === 0 ? 'lyra' : 'kaelen';
    const bridgeClause = prevMapInfo
      ? `Sau khi phá tan chốt chặn của ${prevMapInfo.bossName} ở ${prevMapInfo.title}, toàn quân đã áp sát ${title}. `
      : '';
    lines.push(makeAllyLine(leadKey, `${bridgeClause}${storyBeat}`));
  }

  // Line 2: Dedicated Hero Recruitment cutscene OR Tactical/Lore counsel from a varied party member
  if (recruit) {
    lines.push(recruit.introLine);
  } else {
    const advisorKey = pickAdvisorKey(act.actNumber, chapterInAct, mapId);
    const flavor = theme.tacticalFlavor[(chapterInAct - 1) % theme.tacticalFlavor.length];
    const extraLore = chapterInAct === 6 || chapterInAct === 11 ? ` ${theme.sealLore}` : '';
    lines.push(makeAllyLine(advisorKey, `${flavor}${extraLore}`));
  }

  // Line 3: If recruitment happened, add a warm welcome / tactical response from Kaelen or Soren/Lyra
  if (recruit) {
    const responder = act.actNumber === 2 && chapterInAct === 6 ? 'kaelen' : chapterInAct % 2 === 0 ? 'kaelen' : 'lyra';
    lines.push(
      makeAllyLine(
        responder,
        act.actNumber === 2 && chapterInAct === 6
          ? 'Mừng huynh bình an trở lại hàng ngũ, Soren! Có trí tuệ của huynh dẫn dắt, âm mưu Huyết Ấn của Malakor nhất định sẽ bị phơi bày!'
          : `Có thêm sức mạnh tinh nhuệ sát cánh tại ${title}, thế trận của chúng ta như hổ mọc thêm cánh. Hãy phối hợp đội hình thật chặt trước khi xuất kích!`
      )
    );
  } else if (chapterInAct === 12) {
    lines.push(
      makeAllyLine(
        'kaelen',
        `Đây là trận quyết chiến định đoạt toàn bộ chiến dịch ${act.regionName}! Đánh sập sở chỉ huy của ${bossName}, ngọn cờ tự do sẽ dẫn chúng ta tiến sang vùng đất tiếp theo!`
      )
    );
  }

  // Final Line: Antagonist Boss confrontation
  const tauntTemplate = theme.bossTaunts[(mapId + chapterInAct) % theme.bossTaunts.length];
  const bossText =
    chapterInAct === 12
      ? `Dám vượt qua mười một phòng tuyến để tới trước mặt ${bossName} này ư? Đừng mơ bước khỏi ${title} — chính tay ta sẽ dâng thủ cấp Kaelen lên Nguyên soái Malakor!`
      : nextMapTitle
      ? `${tauntTemplate} Chừng nào ${bossName} còn trấn giữ ${title}, đừng hòng kẻ nào đặt chân tới ${nextMapTitle}!`
      : tauntTemplate;

  lines.push(makeBossLine(bossName, bossRole, bossClass, mapId, bossText));
  return lines;
}

function buildOutroDialogue(
  mapId: number,
  act: ActDefinition,
  chapterInAct: number,
  currentTitle: string,
  bossName: string,
  nextTitle: string | null,
  nextStoryBeat: string | null
): DialogueLine[] {
  if (mapId === 120) {
    return [
      makeAllyLine(
        'kaelen',
        'Thánh Kiếm Valoria đã xuyên thủng lõi Huyết Ấn! Bóng hình Huyết Long tan thành muôn vàn hạt sáng trả lại sinh khí cho đất trời Aethelis...'
      ),
      makeAllyLine(
        'lyra',
        'Nhìn xuống dưới tầng mây kìa, Điện hạ! Từ thảo nguyên Valoria, rừng già Eldwood, cát vàng Solara cho tới tháp trắng Aethelgard — ánh bình minh hòa bình đang rạng rỡ khắp muôn nơi!'
      ),
      makeAllyLine(
        'soren',
        'Hành trình xuyên suốt 10 Đại Hồi và 120 chiến trường khốc liệt đã khép lại, nhưng khúc tráng ca về Hoàng tử Kaelen và 30 anh hùng Huyết Ấn sẽ còn vang vọng mãi muôn đời sau.'
      ),
    ];
  }

  if (mapId === 12) {
    return [
      makeAllyLine(
        'kaelen',
        'Garen đã gục ngã — lá cờ xâm lược trên Cổng Valoria chính thức bị hạ xuống! Biên ải quê hương tạm thời vững vàng rồi!'
      ),
      makeAllyLine(
        'soren',
        'Thần xin lên đường dẫn toán trinh sát vào Rừng Sương Mù Eldwood ngay trong đêm để lần theo dấu vết Mộc Ấn. Hẹn hội ngộ Điện hạ tại Tháp Canh Học Giả!'
      ),
      makeAllyLine(
        'lyra',
        'Bảo trọng nhé Soren! Đại quân sẽ chỉnh đốn quân trang rồi lập tức tiến vào Bìa Rừng Sương Mù tiếp ứng huynh ngay!'
      ),
    ];
  }

  if (mapId === 108) {
    return [
      makeAllyLine(
        'lyra',
        'Cố đô Aethelgard đã được giải phóng rồi, Điện hạ! Tiếng chuông khải hoàn đang ngân vang khắp chín quận kinh thành!'
      ),
      makeAllyLine(
        'astraea',
        'Khoan đã — nhìn cột sét đỏ rực trên đỉnh hoàng cung kìa! Malakor đã dùng mảnh Thiên Tinh Ấn cuối cùng mở cổng dịch chuyển lên Thánh Điện Thiên Giới!'
      ),
      makeAllyLine(
        'kaelen',
        'Nếu không đuổi theo phong ấn Huyết Long ngay trên Thánh Điện, bình yên vừa giành lại hôm nay sẽ hóa thành tro bụi. Chỉnh đốn toàn bộ tinh binh — chúng ta tiến thẳng lên Bậc Thang Thiên Giới!'
      ),
    ];
  }

  const theme = ACT_LORE_THEMES[act.actNumber] ?? ACT_LORE_THEMES[1];
  const reflection = theme.victoryReflections[chapterInAct % theme.victoryReflections.length];
  const nextAct = chapterInAct === 12 ? CAMPAIGN_ACTS[act.actNumber] : null;
  const advisorKey = pickAdvisorKey(act.actNumber, chapterInAct + 1, mapId);

  return [
    makeAllyLine(
      'kaelen',
      nextAct
        ? `Phòng tuyến cuối cùng của ${bossName} tại ${currentTitle} đã sụp đổ — toàn cõi ${act.regionName} sạch bóng quân thù! Ngày mai toàn quân nhổ trại tiến sang ${nextAct.regionName}, mở màn chiến dịch "${nextAct.title}"!`
        : `Quân đoàn của ${bossName} tại ${currentTitle} đã tan rã hoàn toàn! ${reflection}`
    ),
    makeAllyLine(
      advisorKey,
      nextStoryBeat
        ? `Trinh sát tiền phương vừa gửi tin về mục tiêu kế tiếp — ${nextTitle ?? 'trận địa phía trước'}: ${nextStoryBeat}`
        : 'Các mũi quân đã thu gom chiến lợi phẩm và hồi phục đội ngũ, sẵn sàng cho lệnh xuất kích tiếp theo!'
    ),
  ];
}

export const CAMPAIGN_MAPS: CampaignMapMeta[] = (() => {
  const maps: CampaignMapMeta[] = [];
  for (let actIdx = 0; actIdx < CAMPAIGN_ACTS.length; actIdx++) {
    const act = CAMPAIGN_ACTS[actIdx];
    const blueprint = ACT_CHAPTER_BLUEPRINTS[act.actNumber];
    for (let ch = 1; ch <= 12; ch++) {
      const id = actIdx * 12 + ch;
      const title = blueprint.titles[ch - 1];
      const layout = blueprint.layouts[ch - 1];
      const bossName = blueprint.bossNames[ch - 1];
      const bossClass = blueprint.bossClasses[ch - 1];
      const storyBeat = blueprint.storyBeats[ch - 1];
      const { objective, surviveTurns } = pickObjective(ch);
      const recommendedLevel = computeRecommendedLevel(id);
      const { mapWidth, mapHeight, maxDeploySlots } = computeMapDimensions(act.actNumber, ch, layout);
      const recruitedHeroIds = CHAPTER_RECRUITMENTS[id]?.heroIds;

      let prevInfo: { title: string; bossName: string; actRoman: string; regionName: string } | null = null;
      if (ch > 1) {
        prevInfo = {
          title: blueprint.titles[ch - 2],
          bossName: blueprint.bossNames[ch - 2],
          actRoman: act.roman,
          regionName: act.regionName,
        };
      } else if (actIdx > 0) {
        const prevAct = CAMPAIGN_ACTS[actIdx - 1];
        const prevBp = ACT_CHAPTER_BLUEPRINTS[prevAct.actNumber];
        prevInfo = {
          title: prevBp.titles[11],
          bossName: prevBp.bossNames[11],
          actRoman: prevAct.roman,
          regionName: prevAct.regionName,
        };
      }

      let nextTitle: string | null = null;
      let nextStoryBeat: string | null = null;
      let nextActRoman = act.roman;
      let nextChapterInAct = ch + 1;
      if (ch < 12) {
        nextTitle = blueprint.titles[ch];
        nextStoryBeat = blueprint.storyBeats[ch];
      } else if (actIdx < CAMPAIGN_ACTS.length - 1) {
        const nextAct = CAMPAIGN_ACTS[actIdx + 1];
        const nextBp = ACT_CHAPTER_BLUEPRINTS[nextAct.actNumber];
        nextTitle = nextBp.titles[0];
        nextStoryBeat = nextBp.storyBeats[0];
        nextActRoman = nextAct.roman;
        nextChapterInAct = 1;
      }

      const previousMapLink = prevInfo
        ? `Tiếp nối ${prevInfo.actRoman}-${ch > 1 ? ch - 1 : 12} ("${prevInfo.title}"): Hạ gục ${prevInfo.bossName}, đại quân mở thông mũi tiến công mới.`
        : 'Đêm rạng đông lịch sử: Đế Chế Thiết Huyết xé hòa ước trăm năm, bất ngờ tràn qua biên ải Valoria.';

      const nextMapHook = nextTitle
        ? `Hướng tới ${nextActRoman}-${nextChapterInAct} ("${nextTitle}"): ${nextStoryBeat ?? 'Tiến sâu phá vỡ phòng tuyến địch.'}`
        : 'Khúc khải hoàn vĩnh cửu: Phong ấn Huyết Long Vực Thẳm, mở ra bình minh hòa bình cho toàn lục địa Aethelis.';

      const actWeatherPool: Record<number, CampaignMapMeta['weather'][]> = {
        1: ['LEAVES', 'SUNLIGHT', 'RAIN', 'STORM'],
        2: ['MIST', 'RAIN', 'LEAVES', 'STORM'],
        3: ['LEAVES', 'STORM', 'SUNLIGHT', 'RAIN'],
        4: ['SAND', 'SUNLIGHT', 'EMBERS', 'SAND'],
        5: ['RAIN', 'STORM', 'MIST', 'STORM'],
        6: ['MIST', 'SPARKS', 'RAIN', 'STORM'],
        7: ['SNOW', 'STORM', 'MIST', 'SNOW'],
        8: ['EMBERS', 'SPARKS', 'STORM', 'EMBERS'],
        9: ['STORM', 'RAIN', 'SPARKS', 'SUNLIGHT'],
        10: ['SPARKS', 'STORM', 'EMBERS', 'SPARKS'],
      };
      const chapterWeather =
        actWeatherPool[act.actNumber]?.[(ch - 1) % 4] ?? act.weather;

      const bossTitle =
        id === 120
          ? 'Huyết Đế Thức Tỉnh'
          : ch === 12
          ? `Thống Soái Hồi ${act.roman}`
          : ch === 6 || ch >= 10
          ? `Đại Tướng ${act.regionName}`
          : `Chỉ Huy ${act.regionName}`;

      maps.push({
        id,
        actNumber: act.actNumber,
        chapterInAct: ch,
        chapterCode: `${act.roman}-${ch}`,
        title,
        subtitle: `Hồi ${act.roman} · ${act.regionName}`,
        storyArcBeat: storyBeat,
        previousMapLink,
        nextMapHook,
        biome: act.biome,
        weather: chapterWeather,
        layout,
        mapWidth,
        mapHeight,
        maxDeploySlots,
        recruitedHeroIds,
        objective,
        surviveTurns,
        recommendedLevel,
        bossName,
        bossTitle,
        bossClass,
        bossWeaponId: pickBossWeapon(bossClass, act.actNumber),
        introDialogue: buildIntroDialogue(
          id,
          act,
          ch,
          title,
          bossName,
          bossTitle,
          bossClass,
          storyBeat,
          prevInfo,
          nextTitle
        ),
        outroDialogue: buildOutroDialogue(id, act, ch, title, bossName, nextTitle, nextStoryBeat),
      });
    }
  }
  return maps;
})();

export function getCampaignMapById(mapId: number): CampaignMapMeta {
  const clamped = Math.max(1, Math.min(CAMPAIGN_MAPS.length, Math.floor(mapId)));
  return CAMPAIGN_MAPS[clamped - 1];
}

export function getActByNumber(actNumber: number): ActDefinition {
  const clamped = Math.max(1, Math.min(CAMPAIGN_ACTS.length, Math.floor(actNumber)));
  return CAMPAIGN_ACTS[clamped - 1];
}

export function getObjectiveLabel(meta: CampaignMapMeta): string {
  switch (meta.objective) {
    case 'ROUT':
      return 'Tiêu diệt toàn bộ quân địch';
    case 'DEFEAT_BOSS':
      return `Hạ gục ${meta.bossName}`;
    case 'SEIZE':
      return 'Đưa Kaelen chiếm Cứ Điểm Vương Ấn';
    case 'SURVIVE':
      return `Phòng thủ sinh tồn ${meta.surviveTurns ?? 6} lượt`;
  }
}
