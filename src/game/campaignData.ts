import { ALL_200_HISTORICAL_BATTLES } from './historicalBattles';
import type {
  ActDefinition,
  CampaignEra,
  CampaignMapMeta,
  DialogueLine,
  MapObjective,
  UnitClassId,
} from './types';

export const TOTAL_CAMPAIGN_MAPS = 200;
export const WW1_LAST_MAP_ID = 100;
export const WW2_FIRST_MAP_ID = 101;

// Exact 16-Act distribution: 8 WWI Acts (100 battles) + 8 WWII Acts (100 battles) = 200 battles
export const ACT_CHAPTER_COUNTS: number[] = [
  12, 12, 13, 13, 12, 13, 12, 13, // WWI Acts I–VIII = 100
  12, 12, 13, 13, 12, 13, 12, 13, // WWII Acts IX–XVI = 100
];

export function getEraLabel(era: CampaignEra): string {
  return era === 'WW1'
    ? 'Phần I · Thế Chiến Thứ Nhất (1914–1918 · 100 Trận)'
    : 'Phần II · Thế Chiến Thứ Hai (1937–1945 · 100 Trận)';
}

export function getEraShortLabel(era: CampaignEra): string {
  return era === 'WW1' ? 'Thế Chiến I (1914–1918)' : 'Thế Chiến II (1937–1945)';
}

export const CAMPAIGN_ACTS: ActDefinition[] = [
  // ============================================================================
  // PHẦN I: ĐẠI CHIẾN THẾ GIỚI THỨ NHẤT (1914–1918) — 8 HỒI = 100 TRẬN LỊCH SỬ
  // ============================================================================
  {
    actNumber: 1,
    roman: 'I',
    era: 'WW1',
    historicalYear: '8/1914',
    title: 'Khởi Chiến 1914 — Liège Đến Tannenberg',
    regionName: 'Biên Giới Bỉ – Pháp, Serbia & Đông Phổ (1914)',
    biome: 'VALORIA_PLAINS',
    weather: 'LEAVES',
    synopsis:
      'Tháng 8/1914, tiếng đại bác 420mm mở màn tại pháo đài Liège kéo cả châu Âu vào đại chiến. Từ chiến tuyến Mulhouse, Lorraine, Mons đến cuộc hợp vây Tannenberg, các quân đoàn cơ động và bộ binh xung kích đối đầu trực diện.',
    antagonist: 'Paul von Hindenburg & Ludendorff',
    recruitedHeroId: 'drake',
  },
  {
    actNumber: 2,
    roman: 'II',
    era: 'WW1',
    historicalYear: '9–11/1914',
    title: 'Phép Màu Sông Marne & Cuộc Đua Ra Biển',
    regionName: 'Sông Marne, Thanh Đảo, Vistula & Ypres (1914)',
    biome: 'ELDWOOD_FOREST',
    weather: 'RAIN',
    synopsis:
      'Từ cuộc vây hãm Thanh Đảo đến Phép màu Sông Marne và trận tử thủ Yser – Ypres lần thứ nhất, chiến tranh cơ động khép lại để nhường chỗ cho hệ thống chiến hào kéo dài từ Biển Bắc đến biên giới Thụy Sĩ.',
    antagonist: 'Erich von Falkenhayn',
    recruitedHeroId: 'zephyr',
  },
  {
    actNumber: 3,
    roman: 'III',
    era: 'WW1',
    historicalYear: '11/1914–4/1915',
    title: 'Đại Dương Dậy Sóng & Eo Biển Dardanelles',
    regionName: 'Nam Đại Tây Dương, Biển Bắc, Suez & Gallipoli (1914–1915)',
    biome: 'BLACKMIST_HARBOR',
    weather: 'STORM',
    synopsis:
      'Các hải đội thiết giáp hạm và tuần dương hạm chạm trán từ Coronel, Quần đảo Falkland, Dogger Bank đến eo biển Dardanelles, mở màn cuộc đổ bộ lịch sử Anzac Cove trên bán đảo Gallipoli.',
    antagonist: 'Đô Đốc Von Spee & Mustafa Kemal',
    recruitedHeroId: 'mira',
  },
  {
    actNumber: 4,
    roman: 'IV',
    era: 'WW1',
    historicalYear: '5/1915–2/1916',
    title: 'Đột Phá Gorlice, Alps & Lưỡng Hà',
    regionName: 'Gallipoli, Carpathian, Isonzo, Tigris & Erzurum (1915–1916)',
    biome: 'HOWLING_CANYON',
    weather: 'EMBERS',
    synopsis:
      'Bão pháo Gorlice–Tarnów, cuộc leo núi Chunuk Bair, tuyến phòng thủ đá vôi Isonzo, chiến dịch sông Tigris tại Ctesiphon – Kut và đột kích mùa đông Erzurum đẩy quy mô Thế Chiến I ra toàn cầu.',
    antagonist: 'Thống Chế August von Mackensen',
    recruitedHeroId: 'borin',
  },
  {
    actNumber: 5,
    roman: 'V',
    era: 'WW1',
    historicalYear: '2–9/1916',
    title: 'Biển Lửa Verdun, Jutland & Xe Tăng Somme',
    regionName: 'Verdun, Biển Bắc Jutland, Galicia & Sông Somme (1916)',
    biome: 'MAGMA_FORTRESS',
    weather: 'EMBERS',
    synopsis:
      'Năm 1916 khắc nghiệt nhất Thế Chiến I: 300 ngày đêm cối xay thịt Verdun, Đại hải chiến Dreadnought Jutland, Cuộc tiến công Brusilov và cột mốc lịch sử xe tăng Mark I lần đầu xuất trận tại Somme – Flers-Courcelette!',
    antagonist: 'Đô Đốc Reinhard Scheer & Falkenhayn',
    recruitedHeroId: 'valen',
  },
  {
    actNumber: 6,
    roman: 'VI',
    era: 'WW1',
    historicalYear: '1917',
    title: 'Cơn Bão Thép 1917 — Vimy Đến Passchendaele',
    regionName: 'Sinai–Baghdad, Vimy Ridge, Messines & Flanders (1917)',
    biome: 'DARKSEAL_SWAMP',
    weather: 'RAIN',
    synopsis:
      'Từ sa mạc Sinai, Baghdad đến đường hầm phấn Arras, sống núi Vimy, 19 quả mìn khổng lồ Messines và biển bùn Passchendaele — chiến thuật pháo binh hiện đại, xe tăng và không quân bước vào giai đoạn trưởng thành.',
    antagonist: 'Erich Ludendorff & Falkenhausen',
    recruitedHeroId: 'falkor',
  },
  {
    actNumber: 7,
    roman: 'VII',
    era: 'WW1',
    historicalYear: '10/1917–8/1918',
    title: 'Cambrai, Caporetto & Bước Ngoặt 1918',
    regionName: 'Alps, Palestine, Cambrai, Belleau Wood & Amiens (1917–1918)',
    biome: 'FROSTPEAK_TUNDRA',
    weather: 'MIST',
    synopsis:
      '476 xe tăng Mark IV đột kích Cambrai, bão xung kích mùa xuân Michael, rừng Belleau và đòn phản công hiệp đồng tăng – máy bay tại Marne lần II & Amiens xoay chuyển vĩnh viễn cục diện đại chiến!',
    antagonist: 'Erich Ludendorff & Max von Boehn',
    recruitedHeroId: 'brutus',
  },
  {
    actNumber: 8,
    roman: 'VIII',
    era: 'WW1',
    historicalYear: '8–11/1918',
    title: 'Tổng Tiến Công Bách Nhật & Đình Chiến 11/11',
    regionName: 'Hindenburg Line, Megiddo, Argonne & Sambre (1918)',
    biome: 'AETHELGARD_CITY',
    weather: 'SUNLIGHT',
    synopsis:
      'Từ Saint-Mihiel, Megiddo, Meuse–Argonne, Kênh Saint-Quentin đến Vittorio Veneto và trận Sambre lần thứ hai — đại quân Hiệp Ước đập tan Phòng tuyến Hindenburg, buộc ký Hiệp ước Đình chiến 11/11/1918!',
    antagonist: 'Thống Chế Paul von Hindenburg',
    recruitedHeroId: 'morgath',
  },

  // ============================================================================
  // PHẦN II: ĐẠI CHIẾN THẾ GIỚI THỨ HAI (1937–1945) — 8 HỒI = 100 TRẬN LỊCH SỬ
  // ============================================================================
  {
    actNumber: 9,
    roman: 'IX',
    era: 'WW2',
    historicalYear: '1937–1940',
    title: 'Khói Lửa Á–Âu & Chiến Tranh Chớp Nhoáng',
    regionName: 'Thượng Hải, Ba Lan, Phần Lan, Na Uy & Dunkirk (1937–1940)',
    biome: 'AETHELGARD_CITY',
    weather: 'STORM',
    synopsis:
      'Ngọn lửa Thế Chiến II lan rộng từ Thượng Hải, Nam Kinh, Vũ Hán tới Westerplatte, Cuộc chiến Đại Tây Dương, rừng tuyết Suomussalmi, vịnh Narvik, trận đấu tăng Hannut và cuộc di tản lịch sử Dunkirk!',
    antagonist: 'Heinz Guderian & Karl Dönitz',
    recruitedHeroId: 'sylvara',
  },
  {
    actNumber: 10,
    roman: 'X',
    era: 'WW2',
    historicalYear: '1940–1941',
    title: 'Bầu Trời Anh Quốc, Bắc Phi & Barbarossa',
    regionName: 'Eo Biển Manche, Địa Trung Hải, Tobruk & Smolensk (1940–1941)',
    biome: 'SOLARA_DESERT',
    weather: 'SAND',
    synopsis:
      'Phi đội Spitfire giữ vững bầu trời nước Anh, không lực hải quân đột kích Taranto – Matapan, lính dù Crete, cuộc tử thủ Tobruk và bão thiết giáp Barbarossa từ Minsk, Kyiv đến Smolensk với loạt đạn Katyusha đầu tiên!',
    antagonist: 'Erwin Rommel & Fedor von Bock',
    recruitedHeroId: 'kaelith',
  },
  {
    actNumber: 11,
    roman: 'XI',
    era: 'WW2',
    historicalYear: '1941–5/1942',
    title: 'Mùa Đông Moscow, Trân Châu Cảng & Biển San Hô',
    regionName: 'Leningrad, Moscow, Sevastopol & Thái Bình Dương (1941–1942)',
    biome: 'FROSTPEAK_TUNDRA',
    weather: 'SNOW',
    synopsis:
      'Mùa đông băng giá trước cửa ngõ Leningrad và Moscow, đại pháo 800mm ở Sevastopol cùng cơn sóng thần Thái Bình Dương: Trân Châu Cảng, Đảo Wake, Singapore, Biển Java và trận hải chiến tàu sân bay đầu tiên ở Biển San Hô!',
    antagonist: 'Isoroku Yamamoto & Erich von Manstein',
    recruitedHeroId: 'kenji',
  },
  {
    actNumber: 12,
    roman: 'XII',
    era: 'WW2',
    historicalYear: '6–10/1942',
    title: 'Bước Ngoặt Thế Kỷ — Midway, El Alamein & Stalingrad',
    regionName: 'Đảo Midway, Sông Volga, Guadalcanal & Ai Cập (1942)',
    biome: 'BLACKMIST_HARBOR',
    weather: 'SPARKS',
    synopsis:
      'Ba trận quyết chiến định đoạt cả Thế Chiến II: chiến thắng tàu sân bay Midway, cuộc huyết chiến đô thị vĩ đại Stalingrad, rừng đảo Guadalcanal và cơn bão 1.000 xe tăng tại El Alamein lần thứ hai!',
    antagonist: 'Friedrich Paulus & Chūichi Nagumo',
    recruitedHeroId: 'seraphina',
  },
  {
    actNumber: 13,
    roman: 'XIII',
    era: 'WW2',
    historicalYear: '11/1942–1943',
    title: 'Vòng Cung Lửa Kursk, Sông Dnieper & Địa Trung Hải',
    regionName: 'Bắc Phi, Kursk, Sicily, Sông Dnieper & Tarawa (1943)',
    biome: 'HOWLING_CANYON',
    weather: 'EMBERS',
    synopsis:
      'Chiến dịch Torch giải phóng Bắc Phi, đại chiến xe tăng lớn nhất lịch sử Kursk, cuộc đổ bộ Sicily – Salerno, vượt sông Dnieper giải phóng Kyiv và xe lội nước LVT công phá rạn san hô Tarawa!',
    antagonist: 'Thống Chế Erich von Manstein',
    recruitedHeroId: 'darius',
  },
  {
    actNumber: 14,
    roman: 'XIV',
    era: 'WW2',
    historicalYear: '1–7/1944',
    title: 'Mùa Hè Định Mệnh 1944 — D-Day & Bagration',
    regionName: 'Monte Cassino, Imphal, Normandy, Biển Philippines & Belarus (1944)',
    biome: 'BLACKMIST_HARBOR',
    weather: 'RAIN',
    synopsis:
      'Bức tường Đại Tây Dương sụp đổ trong Ngày D Normandy, 15 tàu sân bay làm chủ Biển Philippines, Chiến dịch Bagration xóa sổ Cụm Tập đoàn quân Trung tâm và siêu tăng IS-2 chạm trán Tiger II tại Lviv–Sandomierz!',
    antagonist: 'Walter Model & Gerd von Rundstedt',
    recruitedHeroId: 'kage',
  },
  {
    actNumber: 15,
    roman: 'XV',
    era: 'WW2',
    historicalYear: '7–12/1944',
    title: 'Falaise, Vịnh Leyte & Mùa Đông Ardennes',
    regionName: 'Pháp, Hà Lan, Vịnh Leyte, Budapest & Bastogne (1944)',
    biome: 'SOLARA_DESERT',
    weather: 'STORM',
    synopsis:
      'Chiến dịch Cobra, Túi Falaise, cuộc nhảy dù khổng lồ Market Garden, trận hải chiến lớn nhất lịch sử nhân loại tại Vịnh Leyte và màn tử thủ tuyết trắng Bastogne giữa Chiến dịch Ardennes!',
    antagonist: 'Takeo Kurita & Walter Model',
    recruitedHeroId: 'astraea',
  },
  {
    actNumber: 16,
    roman: 'XVI',
    era: 'WW2',
    historicalYear: '1945',
    title: 'Tổng Công Kích 1945 — Berlin & Chiến Dịch Mãn Châu',
    regionName: 'Vistula–Oder, Iwo Jima, Remagen, Okinawa, Berlin & Mãn Châu (1945)',
    biome: 'CRIMSON_SANCTUM',
    weather: 'SPARKS',
    synopsis:
      'Mùa xuân và mùa hè 1945: cát đen Iwo Jima, cầu sắt Remagen vượt sông Rhine, đảo lửa Okinawa, bão pháo Seelow – Reichstag tại Berlin, giải phóng Praha và Chiến dịch Mãn Châu mang lại hòa bình cho toàn nhân loại!',
    antagonist: 'Helmuth Weidling & Otozō Yamada',
  },
];

// Spread all 22 mid/late-campaign allied commanders across WWI (Maps 1–100) & WWII (Maps 101–200)
const RECRUIT_SCHEDULE_BY_MAP: Record<number, string[]> = {
  13: ['zephyr'],     // Act II (Tsingtao / Marne 1914): Trinh Sát Tiền Tiêu
  19: ['nadia'],      // Act II (Aisne 1914): Súng Trường Chống Tăng
  25: ['mira'],       // Act III (Coronel / Gallipoli 1914–1915): Máy Bay Tiêm Kích
  31: ['malrik'],     // Act III (Dogger Bank 1915): Tàu Ngầm Đại Dương
  38: ['borin'],      // Act IV (Cape Helles / Gorlice 1915): Xe Tăng Hạng Nặng
  45: ['tormund'],    // Act IV (Loos 1915): Đại Liên & Súng Phun Lửa
  51: ['aurelia'],    // Act V (Trebizond / Jutland 1916): Máy Bay Vận Tải & Trực Thăng Săn Ngầm
  55: ['valen'],      // Act V (Jutland 1916): Tàu Đổ Bộ & Tàu Sân Bay
  63: ['falkor'],     // Act VI (1917): Thiết Giáp Đổ Bộ Đường Không & Phòng Không
  68: ['celeste'],    // Act VI (Vimy Ridge 1917): Thiết Giáp Chở Quân & Quân Y Cơ Giới
  76: ['cassian'],    // Act VII (Caporetto 1917): Tên Lửa Phòng Không & Trinh Sát Pháo
  79: ['brutus'],     // Act VII (Cambrai 1917): Công Binh Bộc Phá
  88: ['morgath'],    // Act VIII (Hundred Days 1918): Pháo Đường Sắt & Tên Lửa Đạn Đạo
  93: ['orion'],      // Act VIII (Meuse-Argonne 1918): Tên Lửa Dẫn Đường & Phản Lực
  101: ['sylvara'],   // Act IX (WWII Opening — Shanghai 1937 / 1939): Lính Dù Không Vận
  109: ['kain'],      // Act IX (Narvik / Dunkirk 1940): Biệt Kích Tiểu Liên & Phóng Lựu
  115: ['kaelith'],   // Act X (Sidi Barrani 1940): Thiết Giáp Trinh Sát & Săn Tăng
  129: ['kenji'],     // Act XI (Pearl Harbor / Pacific 1941): Thủy Quân Lục Chiến Đổ Bộ
  141: ['seraphina'], // Act XII (Stalingrad 1942): Công Binh Đại Tu Chiến Xa
  157: ['darius'],    // Act XIII (Kursk 1943): Pháo Tự Hành Diệt Tăng
  169: ['kage'],      // Act XIV (Normandy D-Day 1944): Đặc Nhiệm Đêm SAS
  184: ['astraea'],   // Act XV (Leyte Gulf 1944): Radar & Tên Lửa Chiến Lược Liên Hợp
};

function getDimensionsForScale(
  scale: 'MEDIUM' | 'LARGE' | 'COLOSSAL',
  mapId: number,
  actNumber: number
): [number, number, number] {
  if (scale === 'MEDIUM') {
    const w = mapId % 2 === 0 ? 20 : 18;
    const h = mapId % 2 === 0 ? 14 : 12;
    return [w, h, Math.min(9, 6 + Math.floor(actNumber / 5))];
  }
  if (scale === 'LARGE') {
    const w = mapId % 3 === 0 ? 28 : mapId % 2 === 0 ? 26 : 24;
    const h = mapId % 3 === 0 ? 18 : 16;
    return [w, h, Math.min(11, 8 + Math.floor(actNumber / 6))];
  }
  // COLOSSAL historical climaxes
  const w = mapId % 2 === 0 ? 36 : 32;
  const h = mapId % 2 === 0 ? 22 : 20;
  return [w, h, Math.min(12, 10 + (actNumber >= 9 ? 2 : 1))];
}

function getDialogueForMap(
  mapId: number,
  act: ActDefinition,
  chapterInAct: number,
  chaptersInThisAct: number,
  title: string,
  dateStr: string,
  alliedCmdr: string,
  axisCmdr: string,
  forceSummary: string,
  previousMapLink: string,
  nextMapHook: string,
  bossClass: UnitClassId
): { intro: DialogueLine[]; outro: DialogueLine[] } {
  // Map 1: Trận Liège (5–16/8/1914)
  if (mapId === 1) {
    return {
      intro: [
        {
          speaker: 'Chỉ Huy Kaelen',
          role: `Bộ Chỉ Huy Tiền Phương (${dateStr})`,
          portraitKey: 'kaelen',
          speakerClassId: 'LORD',
          speakerFaction: 'PLAYER',
          side: 'left',
          text: `Ngày ${dateStr} — Tiếng đại bác tại ${title} chính thức mở màn Thế Chiến Thứ Nhất! Đồng đội tướng ${alliedCmdr} đang giữ 12 pháo đài bê tông bên bờ sông Meuse.`,
        },
        {
          speaker: 'Quân Y Trưởng Elara',
          role: 'Bác Sĩ Quân Y Chiến Tuyến',
          portraitKey: 'elara',
          speakerClassId: 'CLERIC',
          speakerFaction: 'PLAYER',
          side: 'left',
          text: `Tình báo xác nhận: ${forceSummary}. Toàn đội đã mang sẵn cơ số đạn dược, túi cứu thương IFAK và bộ sửa giáp trong 6 ô hành trang cá nhân!`,
        },
        {
          speaker: axisCmdr,
          role: `Chỉ Huy Đối Phương · ${title}`,
          portraitKey: 'malakor',
          speakerClassId: bossClass,
          speakerFaction: 'ENEMY',
          side: 'right',
          text: 'Các pháo đài bê tông kia không thể trụ nổi trước dàn siêu cối công thành 420mm của chúng ta! Toàn quân nổ súng san phẳng Liège!',
        },
      ],
      outro: [
        {
          speaker: 'Tham Mưu Pháo Binh Soren',
          role: 'Sĩ Quan Chỉ Huy Hỏa Lực',
          portraitKey: 'soren',
          speakerClassId: 'MAGE',
          speakerFaction: 'PLAYER',
          side: 'left',
          text: `Đòn công phá của ${axisCmdr} đã bị làm chậm đáng kể! ${nextMapHook}`,
        },
        {
          speaker: 'Chỉ Huy Kaelen',
          role: 'Chỉ Huy Tiểu Đoàn Tiền Phương',
          portraitKey: 'kaelen',
          speakerClassId: 'LORD',
          speakerFaction: 'PLAYER',
          side: 'left',
          text: 'Trở về Căn Cứ Chỉ Huy tiếp nhận tiếp vận từ Kho Quân Đoàn và sẵn sàng hành quân qua trọn vẹn 100 trận Thế Chiến I và 100 trận Thế Chiến II!',
        },
      ],
    };
  }

  // Map 100: Trận Sambre lần thứ hai (4/11/1918) — Grand WWI Finale!
  if (mapId === WW1_LAST_MAP_ID) {
    return {
      intro: [
        {
          speaker: 'Đại Tướng Kaelen',
          role: `Tư Lệnh Liên Quân Hiệp Ước (${dateStr})`,
          portraitKey: 'kaelen',
          speakerClassId: 'SOVEREIGN',
          speakerFaction: 'PLAYER',
          side: 'left',
          text: `Trận thứ 100 — ${title} (${dateStr})! Phối hợp cùng ${alliedCmdr}, vượt kênh Sambre–Oise và rừng Mormal hôm nay sẽ khép lại hoàn toàn bốn năm khói lửa Thế Chiến Thứ Nhất!`,
        },
        {
          speaker: axisCmdr,
          role: 'Bộ Tư Lệnh Tối Cao Đế Quốc (1918)',
          portraitKey: 'malakor',
          speakerClassId: bossClass,
          speakerFaction: 'ENEMY',
          side: 'right',
          text: 'Phòng tuyến cuối cùng bên bờ kênh Sambre sẽ đứng vững đến viên đạn cuối cùng. Đừng hòng vượt sông!',
        },
      ],
      outro: [
        {
          speaker: 'Quân Y Trưởng Elara',
          role: 'Chủ Nhiệm Quân Y Liên Minh',
          portraitKey: 'elara',
          speakerClassId: 'SAINT',
          speakerFaction: 'PLAYER',
          side: 'left',
          text: '11 giờ trưa ngày 11/11/1918 — Hiệp ước Đình chiến chính thức có hiệu lực! Trọn vẹn 100 trận đánh lịch sử của Phần I: Thế Chiến Thứ Nhất đã hoàn tất!',
        },
        {
          speaker: 'Tham Mưu Trưởng Soren',
          role: 'Bộ Tham Mưu Chiến Lược',
          portraitKey: 'soren',
          speakerClassId: 'ARCHSAGE',
          speakerFaction: 'PLAYER',
          side: 'left',
          text: `Nhưng bóng mây chiến tranh đang tụ lại ở cả Viễn Đông lẫn châu Âu… Chuẩn bị chuyển sang PHẦN II: THẾ CHIẾN THỨ HAI (Trận 101/200 — Trận Thượng Hải)!`,
        },
      ],
    };
  }

  // Map 101: Trận Thượng Hải (13/8–26/11/1937) — Grand WWII Opening!
  if (mapId === WW2_FIRST_MAP_ID) {
    return {
      intro: [
        {
          speaker: 'Nguyên Soái Kaelen',
          role: `Tổng Tư Lệnh Đồng Minh (${dateStr})`,
          portraitKey: 'kaelen',
          speakerClassId: 'SOVEREIGN',
          speakerFaction: 'PLAYER',
          side: 'left',
          text: `PHẦN II: THẾ CHIẾN THỨ HAI chính thức khai màn tại ${title} (${dateStr})! Cùng ${alliedCmdr}, chúng ta đối mặt tác chiến đô thị tổng lực kết hợp thiết giáp, không quân và hạm đội ven sông.`,
        },
        {
          speaker: 'Tham Mưu Trưởng Soren',
          role: 'Bộ Tham Mưu Tác Chiến Liên Hợp',
          portraitKey: 'soren',
          speakerClassId: 'ARCHSAGE',
          speakerFaction: 'PLAYER',
          side: 'left',
          text: `Đặc điểm chiến trường: ${forceSummary}. Hãy hiệp đồng Bộ binh, Xe tăng, Pháo phản lực, Không quân và Tàu chiến!`,
        },
        {
          speaker: axisCmdr,
          role: `Tư Lệnh Mặt Trận · ${title}`,
          portraitKey: 'malakor',
          speakerClassId: bossClass,
          speakerFaction: 'ENEMY',
          side: 'right',
          text: 'Hải pháo ngoài cửa sông Dương Tử đã khóa tọa độ! Các đơn vị đổ bộ và phi đội ném bom — tiến công toàn tuyến!',
        },
      ],
      outro: [
        {
          speaker: 'Nguyên Soái Kaelen',
          role: 'Tổng Tư Lệnh Liên Minh Đồng Minh',
          portraitKey: 'kaelen',
          speakerClassId: 'SOVEREIGN',
          speakerFaction: 'PLAYER',
          side: 'left',
          text: `Đã hoàn tất mặt trận mở màn ${title}! Hành trình 100 trận đánh lịch sử của Thế Chiến II từ Á sang Âu và Thái Bình Dương chính thức bắt đầu!`,
        },
        {
          speaker: 'Tham Mưu Trưởng Soren',
          role: 'Bộ Tham Mưu Tác Chiến Liên Hợp',
          portraitKey: 'soren',
          speakerClassId: 'ARCHSAGE',
          speakerFaction: 'PLAYER',
          side: 'right',
          text: 'Các sư đoàn thiết giáp, phi đội oanh tạc và hạm đội ven biển đã sẵn sàng cho chuỗi chiến dịch toàn cầu mới!',
        },
      ],
    };
  }

  // Map 200: Chiến dịch Tiến công Chiến lược Mãn Châu (9/8–2/9/1945) — Grand Finale!
  if (mapId === TOTAL_CAMPAIGN_MAPS) {
    return {
      intro: [
        {
          speaker: 'Đại Nguyên Soái Kaelen',
          role: `Tổng Tư Lệnh Tối Cao Đồng Minh (${dateStr})`,
          portraitKey: 'kaelen',
          speakerClassId: 'EMPEROR_LORD',
          speakerFaction: 'PLAYER',
          side: 'left',
          text: `Trận thứ 200/200 — ${title} (${dateStr})! Cùng ${alliedCmdr}, từ pháo đài Liège 1914 qua Berlin tới thảo nguyên Mãn Châu 1945 — toàn bộ Lục – Thiết – Pháo – Không – Hải hội tụ cho trận đánh quyết định cuối cùng!`,
        },
        {
          speaker: axisCmdr,
          role: 'Tổng Tư Lệnh Đạo Quân Quan Đông (1945)',
          portraitKey: 'malakor',
          speakerClassId: 'DARK_GENERAL',
          speakerFaction: 'ENEMY',
          side: 'right',
          text: 'Dãy Đại Hưng An và hệ thống pháo đài biên giới sẽ chặn đứng mọi binh đoàn xe tăng của các ngươi!',
        },
      ],
      outro: [
        {
          speaker: 'Đại Nguyên Soái Kaelen',
          role: 'Tổng Tư Lệnh Tối Cao Đồng Minh',
          portraitKey: 'kaelen',
          speakerClassId: 'EMPEROR_LORD',
          speakerFaction: 'PLAYER',
          side: 'left',
          text: 'Ngày 2/9/1945 — Chiến dịch Mãn Châu toàn thắng, Thế Chiến Thứ Hai chính thức chấm dứt! Trọn vẹn 200 trận đánh lịch sử của nhân loại đã khép lại trong bình minh hòa bình!',
        },
        {
          speaker: 'Chủ Nhiệm Quân Y Elara',
          role: 'Anh Hùng Nhân Đạo Liên Minh',
          portraitKey: 'elara',
          speakerClassId: 'SERAPH_PROPHET',
          speakerFaction: 'PLAYER',
          side: 'left',
          text: 'Tên tuổi 30 vị sĩ quan hiệp đồng binh chủng từ Liège 1914 đến Mãn Châu 1945 sẽ mãi khắc ghi trong trang sử Hỏa Ấn Đại Chiến!',
        },
      ],
    };
  }

  if (chapterInAct === 1 || chapterInAct === chaptersInThisAct) {
    return {
      intro: [
        {
          speaker: 'Tham Mưu Soren',
          role: `Hồ Sơ Chiến Dịch · ${dateStr}`,
          portraitKey: 'soren',
          speakerClassId: act.era === 'WW2' ? 'ARCHSAGE' : 'MAGE',
          speakerFaction: 'PLAYER',
          side: 'left',
          text: `${previousMapLink} Chiến trường hôm nay: ${title} (${dateStr}) cùng chỉ huy đồng minh ${alliedCmdr}. ${forceSummary}.`,
        },
        {
          speaker: axisCmdr,
          role: `Chỉ Huy Đối Phương · ${title}`,
          portraitKey: 'malakor',
          speakerClassId: bossClass,
          speakerFaction: 'ENEMY',
          side: 'right',
          text: `Toàn bộ trận địa tại ${title} đã được bố phòng theo đúng địa hình! Hãy xem lực lượng của các ngươi chống đỡ ra sao!`,
        },
        {
          speaker: 'Chỉ Huy Kaelen',
          role: act.era === 'WW2' ? 'Tổng Tư Lệnh Chiến Trường' : 'Chỉ Huy Quân Đoàn',
          portraitKey: 'kaelen',
          speakerClassId: act.era === 'WW2' ? 'SOVEREIGN' : 'LORD',
          speakerFaction: 'PLAYER',
          side: 'left',
          text: 'Lợi dụng địa hình thực tế, triển khai đội hình hiệp đồng binh chủng và giữ vững cự ly yểm trợ — toàn quân xuất kích!',
        },
      ],
      outro: [
        {
          speaker: 'Chỉ Huy Kaelen',
          role: 'Tư Lệnh Chiến Trường',
          portraitKey: 'kaelen',
          speakerClassId: act.era === 'WW2' ? 'SOVEREIGN' : 'GREAT_LORD',
          speakerFaction: 'PLAYER',
          side: 'left',
          text: `Đã đánh bại lực lượng của ${axisCmdr} tại ${title}! ${nextMapHook}`,
        },
        {
          speaker: 'Tham Mưu Soren',
          role: `Báo Cáo Hậu Cần · ${dateStr}`,
          portraitKey: 'soren',
          speakerClassId: act.era === 'WW2' ? 'ARCHSAGE' : 'SAGE',
          speakerFaction: 'PLAYER',
          side: 'right',
          text: 'Các phân đội đã củng cố chiến hào, thu hồi khí tài về Kho Quân Đoàn và sẵn sàng hành quân tới mặt trận kế tiếp!',
        },
      ],
    };
  }

  return {
    intro: [
      {
        speaker: 'Tham Mưu Soren',
        role: `Điện Báo Mặt Trận (${dateStr})`,
        portraitKey: 'soren',
        speakerClassId: act.era === 'WW2' ? 'SAGE' : 'MAGE',
        speakerFaction: 'PLAYER',
        side: 'left',
        text: `Trận ${mapId}/200 — ${title} (${dateStr}) · Chỉ huy đồng minh: ${alliedCmdr}. ${forceSummary}.`,
      },
      {
        speaker: axisCmdr,
        role: `Tư Lệnh Đối Phương (${dateStr})`,
        portraitKey: 'malakor',
        speakerClassId: bossClass,
        speakerFaction: 'ENEMY',
        side: 'right',
        text: 'Các đơn vị vào vị trí chiến đấu! Khóa chặt hỏa lực yểm trợ và bảo vệ sở chỉ huy bằng mọi giá!',
      },
    ],
    outro: [
      {
        speaker: 'Chỉ Huy Kaelen',
        role: 'Tư Lệnh Chiến Trường',
        portraitKey: 'kaelen',
        speakerClassId: act.era === 'WW2' ? 'GREAT_LORD' : 'LORD',
        speakerFaction: 'PLAYER',
        side: 'left',
        text: `Thắng lợi tại ${title}! ${nextMapHook}`,
      },
      {
        speaker: 'Tham Mưu Soren',
        role: `Tổng Kết Mặt Trận (${dateStr})`,
        portraitKey: 'soren',
        speakerClassId: act.era === 'WW2' ? 'SAGE' : 'MAGE',
        speakerFaction: 'PLAYER',
        side: 'right',
        text: 'Đạn dược, nhiên liệu và quân y đã được bổ sung đầy đủ. Mệnh lệnh tiếp theo đã được truyền xuống toàn sư đoàn!',
      },
    ],
  };
}

function objectiveSummary(objective: MapObjective, bossName: string): string {
  switch (objective) {
    case 'SEIZE':
      return `Đánh chiếm Sở Chỉ Huy địch do ${bossName} trấn giữ.`;
    case 'DEFEAT_BOSS':
      return `Hạ gục chỉ huy đối phương ${bossName} để đánh sập toàn tuyến.`;
    case 'SURVIVE':
      return `Tử thủ giữ vững trận địa trước các đợt công kích của ${bossName}.`;
    case 'ROUT':
    default:
      return `Tiêu diệt toàn bộ cụm lực lượng đối phương trên chiến trường.`;
  }
}

function buildAll200Maps(): CampaignMapMeta[] {
  const rawMaps: Array<
    Omit<CampaignMapMeta, 'previousMapLink' | 'nextMapHook' | 'introDialogue' | 'outroDialogue'> & {
      actRef: ActDefinition;
      chaptersInThisAct: number;
      dateStr: string;
      alliedCmdr: string;
      axisCmdr: string;
      forceSummaryText: string;
    }
  > = [];

  let cursor = 0;

  for (let actIdx = 0; actIdx < CAMPAIGN_ACTS.length; actIdx++) {
    const act = CAMPAIGN_ACTS[actIdx];
    const chaptersInThisAct = ACT_CHAPTER_COUNTS[actIdx];

    for (let ch = 1; ch <= chaptersInThisAct; ch++) {
      const spec = ALL_200_HISTORICAL_BATTLES[cursor];
      const mapId = cursor + 1;
      cursor += 1;

      const chapterCode = `${act.roman}-${ch}`;
      const [mapWidth, mapHeight, maxDeploySlots] = getDimensionsForScale(
        spec.scale,
        mapId,
        act.actNumber
      );

      // Smooth recommended level progression across 200 battles (Lv.1 -> Lv.56)
      const recommendedLevel = Math.max(1, Math.min(56, 1 + Math.floor((mapId - 1) * 0.28)));
      const recruitedHeroIds = RECRUIT_SCHEDULE_BY_MAP[mapId];

      const bossName = spec.axisCmdr;
      const bossTitle = `Tư Lệnh Địch · ${spec.dateStr}`;
      const storyArcBeat = `${spec.forceSummary}. Mục tiêu: ${objectiveSummary(spec.objective, bossName)}`;

      rawMaps.push({
        id: mapId,
        actNumber: act.actNumber,
        chapterInAct: ch,
        chapterCode,
        era: act.era,
        historicalYear: spec.yearStr,
        historicalDate: spec.dateStr,
        alliedCommander: spec.alliedCmdr,
        axisCommander: spec.axisCmdr,
        forceSummary: spec.forceSummary,
        theaterProfile: spec.theater,
        title: spec.title,
        subtitle: `${act.era === 'WW1' ? 'Thế Chiến I' : 'Thế Chiến II'} · ${spec.dateStr} · Hồi ${act.roman}: ${act.title}`,
        storyArcBeat,
        biome: spec.biome,
        weather: spec.weather,
        layout: spec.layout,
        mapWidth,
        mapHeight,
        maxDeploySlots,
        recruitedHeroIds,
        objective: spec.objective,
        surviveTurns:
          spec.objective === 'SURVIVE'
            ? 6 + Math.min(4, Math.floor(act.actNumber / 4))
            : undefined,
        recommendedLevel,
        bossName,
        bossTitle,
        bossClass: spec.bossClass,
        bossWeaponId: spec.bossWeaponId,
        actRef: act,
        chaptersInThisAct,
        dateStr: spec.dateStr,
        alliedCmdr: spec.alliedCmdr,
        axisCmdr: spec.axisCmdr,
        forceSummaryText: spec.forceSummary,
      });
    }
  }

  return rawMaps.map((cur, idx) => {
    const prev = idx > 0 ? rawMaps[idx - 1] : null;
    const next = idx < rawMaps.length - 1 ? rawMaps[idx + 1] : null;

    const previousMapLink = !prev
      ? 'Mùa thu tháng 8/1914, tiếng đại bác công phá pháo đài Liège mở màn Thế Chiến Thứ Nhất.'
      : cur.id === WW2_FIRST_MAP_ID
      ? 'Sau Hiệp ước Đình chiến 11/11/1918 khép lại 100 trận Thế Chiến I, Thế Chiến Thứ Hai bùng nổ từ Á sang Âu mở đầu bằng Trận Thượng Hải!'
      : prev.actNumber !== cur.actNumber
      ? `Khép lại Hồi ${prev.actRef.roman} sau ${prev.title} (${prev.actRef.title}), chiến cuộc lịch sử chuyển sang Hồi ${cur.actRef.roman}: ${cur.actRef.title}.`
      : `Tiếp nối diễn biến lịch sử sau ${prev.title} (${prev.dateStr}), chiến trường chuyển sang ${cur.title}.`;

    const nextMapHook = !next
      ? 'Hoàn tất trọn vẹn 200 trận đánh lịch sử qua cả Thế Chiến I (100 trận) và Thế Chiến II (100 trận)!'
      : cur.id === WW1_LAST_MAP_ID
      ? `Hiệp ước Đình chiến 11/11/1918 khép lại Phần I (100 trận Thế Chiến I) — sẵn sàng bước vào Phần II (100 trận Thế Chiến II) bắt đầu từ ${next.title}!`
      : next.actNumber !== cur.actNumber
      ? `Hoàn tất Hồi ${cur.actRef.roman}, mở màn Hồi ${next.actRef.roman}: ${next.actRef.title} với ${next.title} (${next.dateStr})!`
      : `Trận tiếp theo (${next.id}/200): ${next.title} (${next.dateStr}) — đối đầu ${next.axisCmdr}.`;

    const { intro, outro } = getDialogueForMap(
      cur.id,
      cur.actRef,
      cur.chapterInAct,
      cur.chaptersInThisAct,
      cur.title,
      cur.dateStr,
      cur.alliedCmdr,
      cur.axisCmdr,
      cur.forceSummaryText,
      previousMapLink,
      nextMapHook,
      cur.bossClass
    );

    const {
      actRef: _u1,
      chaptersInThisAct: _u2,
      dateStr: _u3,
      alliedCmdr: _u4,
      axisCmdr: _u5,
      forceSummaryText: _u6,
      ...rest
    } = cur;
    void _u1;
    void _u2;
    void _u3;
    void _u4;
    void _u5;
    void _u6;

    return {
      ...rest,
      previousMapLink,
      nextMapHook,
      introDialogue: intro,
      outroDialogue: outro,
    };
  });
}

export const CAMPAIGN_MAPS: CampaignMapMeta[] = buildAll200Maps();

export function getCampaignMapById(mapId: number): CampaignMapMeta {
  const clamped = Math.max(1, Math.min(CAMPAIGN_MAPS.length, mapId));
  return CAMPAIGN_MAPS[clamped - 1];
}

export function getActByNumber(actNumber: number): ActDefinition {
  const clamped = Math.max(1, Math.min(CAMPAIGN_ACTS.length, actNumber));
  return CAMPAIGN_ACTS[clamped - 1];
}

export function getMapScaleLabel(
  width: number,
  height: number
): 'Cỡ Vừa' | 'Cỡ Lớn' | 'Đại Chiến Trường' {
  const area = width * height;
  if (area >= 600) return 'Đại Chiến Trường';
  if (area >= 380) return 'Cỡ Lớn';
  return 'Cỡ Vừa';
}

export function getObjectiveLabel(meta: Pick<CampaignMapMeta, 'objective' | 'surviveTurns'>): string {
  switch (meta.objective) {
    case 'ROUT':
      return 'Tiêu diệt toàn bộ địch';
    case 'DEFEAT_BOSS':
      return 'Hạ chỉ huy đối phương';
    case 'SEIZE':
      return 'Chiếm Sở Chỉ Huy địch';
    case 'SURVIVE':
      return `Phòng thủ ${meta.surviveTurns ?? 8} lượt`;
    default:
      return 'Chiến thắng mặt trận';
  }
}

