import { SolarTerm, CreativeProduct } from './types';

// Standardized list of cultural products to share across terms
const baseProducts: CreativeProduct[] = [
  {
    id: 'p-incense-box',
    name: '【廿四香笺】断弦古香 · 节气定制线香礼盒',
    description: '甄选天然芽庄沉香、海南沉香及名贵香草，手工古法炮制。配有手工烧制汝窑香托一件。香气醇厚温润，烟形袅袅，静心凝神。',
    price: 168,
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600',
    category: 'incense'
  },
  {
    id: 'p-burner-bronze',
    name: '【廿四香笺】宣德遗韵 · 复古纯铜篆香炉',
    description: '纯铜重器，精工细作。复刻宣德炉经典器形，炉身沉稳，器宇轩昂。适用于盘香、线香及空熏篆香。',
    price: 299,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600',
    category: 'burner'
  },
  {
    id: 'p-sachet-silk',
    name: '【廿四香笺】千丝结 · 丝绸刺绣随身香囊',
    description: '选用优质真丝织锦缎面，双面手工苏绣。内填古方避瘟祛湿、凝神辟邪草料，香气持久，四季安康。',
    price: 58,
    imageUrl: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=600',
    category: 'ornament'
  },
  {
    id: 'p-stationery-set',
    name: '【廿四香笺】煮雨听香 · 节气手工流沙笺信纸',
    description: '手工抄造宣纸，洒金流水纹理。淡淡松烟香气融入纸屑，提笔修书，见字如面。配特制樟木收纳盒。',
    price: 88,
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=600',
    category: 'stationery'
  }
];

export const solarTerms: SolarTerm[] = [
  {
    id: 'lichun',
    name: '立春',
    englishName: 'Beginning of Spring',
    solarTermPeriod: '2月3日 - 2月5日',
    season: 'spring',
    color: '#E0EFDA',
    textColor: '#2E4F24',
    bgGradient: 'from-[#E0EFDA] to-[#C9DFCE]',
    incenseName: '江南春晓意',
    scentProfile: {
      topNotes: ['新叶', '雨后春泥', '佛手柑'],
      middleNotes: ['桃花', '白玉兰', '绿茶'],
      baseNotes: ['檀香', '龙脑香']
    },
    poem: {
      title: '立春',
      author: '杜甫',
      dynasty: '唐',
      content: [
        '春日春盘细生菜，忽忆两京梅花发。',
        '盘出高门行白玉，菜传纤手送青丝。',
        '两极今日客惆怅，双鬓今年老寂衰。',
        '独在天涯逢此节，不堪歌舞共徘徊。'
      ],
      translation: '在立春这一天吃着春盘里的生菜，忽然想起长安与洛阳盛开的梅花。白玉盘中端送出珍馐，纤纤玉指传递着青丝菜。在天涯羁旅度过这个节日，双鬓已经衰白寂静，独自凭栏，不忍看人间歌舞，只得徒自彷徨。',
      appreciation: '此诗描写了诗人客居巴蜀时的立春景象，将对昔日京华繁华温存的回忆与今日颠沛流离的心境对照，在春光融融的底色上，晕染出深沉的家国之思与岁月之叹，恰似微苦而回甘的木质春叶之香。'
    },
    emotionalProfile: {
      mood: '带着对新一轮岁月的希冀，伴有一丝感时伤逝的柔弱。',
      interactionTip: '与您探寻寒冬褪去、暖春将至的生机，以清雅的草木香轻抚惆怅。',
      comfortWords: '万物皆有其序，正如冬去必春来。那些深埋地下的种子如今正在泥土中积蓄力量。愿你深吸一口初春的草木香，将过去一年的风霜悄然卸下。'
    },
    creativeProducts: [
      {
        ...baseProducts[0],
        name: '【廿四香笺】立春 · 「江南春晓」草木线香',
        description: '还原立春时节细雨初霁、万木破土的蓬勃香气。精选崖州沉香配以春茶新叶磨制。'
      },
      baseProducts[2],
      baseProducts[3]
    ]
  },
  {
    id: 'yushui',
    name: '雨水',
    englishName: 'Rain Water',
    solarTermPeriod: '2月18日 - 2月20日',
    season: 'spring',
    color: '#D7EDE2',
    textColor: '#2D4C3E',
    bgGradient: 'from-[#D7EDE2] to-[#BFE3D4]',
    incenseName: '听雨阁香',
    scentProfile: {
      topNotes: ['雨露', '青苔', '甜橙'],
      middleNotes: ['水仙', '铃兰', '雨前龙井'],
      baseNotes: ['降真香', '乳香']
    },
    poem: {
      title: '春夜喜雨',
      author: '杜甫',
      dynasty: '唐',
      content: [
        '好雨知时节，当春乃发生。',
        '随风潜入夜，润物细无声。',
        '野径云俱黑，江船火独明。',
        '晓看红湿处，花重锦官城。'
      ],
      translation: '好雨似乎知道时令季节，正当春天植物萌发之时便悄然降临。细雨伴随着和煦的春风在夜里悄悄飘洒，默默地滋润着万物。田野小径的天空一片黑云，唯有江边渔船的一盏灯火独自明亮。清晨红雨湿润之处，锦竹城里开满了沉甸甸的鲜花。',
      appreciation: '这是一首脍炙人口描绘雨水细腻之美的神作。诗人用一个“潜”字写出了雨的和煦体贴，正如老友间的关切，润物无声。与之呼应的“听雨阁香”温润潮湿，正是抚平焦虑、静心舒张的良药。'
    },
    emotionalProfile: {
      mood: '期待被温柔呵护、静听内心成长、释怀喧嚣的静谧心境。',
      interactionTip: '陪您一起静静聆听窗外细雨，用温热的熟普与沉水香烟，舒缓疲惫。',
      comfortWords: '生活也需要细水长流的滋润。不要着急赶路，今天允许自己像一枚嫩芽，在微雨中静静享受被滋润的松弛吧。'
    },
    creativeProducts: [
      {
        ...baseProducts[3],
        name: '【廿四香笺】雨水 · 「随风潜夜」手工描金流沙笺',
        description: '将春雨般细腻的流金融入纸浆，触手生温，温澜潮润，带有淡淡雨前茶香。'
      },
      baseProducts[0]
    ]
  },
  {
    id: 'jingzhe',
    name: '惊蛰',
    englishName: 'Awakening of Insects',
    solarTermPeriod: '3月5日 - 3月6日',
    season: 'spring',
    color: '#EAF7D3',
    textColor: '#42581A',
    bgGradient: 'from-[#EAF7D3] to-[#CFEAB4]',
    incenseName: '春雷唤醒香',
    scentProfile: {
      topNotes: ['生姜', '尤加利', '柠檬草'],
      middleNotes: ['桃花', '梨花', '樟脑'],
      baseNotes: ['桧木', '琥珀']
    },
    poem: {
      title: '观田家',
      author: '韦应物',
      dynasty: '唐',
      content: [
        '微雨众卉新，一雷惊蛰始。',
        '田家几日闲，耕种从此起。',
        '丁壮俱在野，场圃亦就理。',
        '归来景入八，妇姑等献饷。'
      ],
      translation: '细雨滋润之下，草木焕然一新；一声春雷掠过，惊蛰节气正式开始。农家哪里还有闲暇的日子？繁忙的春耕从此拉开了序幕。壮丁都去田野耕作，场院菜圃也整理得有条不紊。伴着夕阳归来，妇姑早已备好香热的饭菜。',
      appreciation: '惊蛰是阳气升发、万物苏醒的关键时间点。雷霆划破沉寂，带有草木振奋的新生力量。诗中朴素勤劳的农家景象，搭配辛辣、清新又带有一丝樟桧坚韧的香气，能瞬间唤醒疲惫的感官，激发斗志。'
    },
    emotionalProfile: {
      mood: '内心深处有力量急需升腾，企盼突破现状，打破浑浑噩噩。',
      interactionTip: '以辛辣、坚韧、明快之香驱散慵懒春困，助您重燃工作与创作心火。',
      comfortWords: '听到了吗？那一声雷响是自然在呼唤你：该破土而出了。那些深沉的长冬伏笔，都将在这个斑斓的春天，绽放出最耀眼的存在。'
    },
    creativeProducts: [
      baseProducts[1],
      {
        ...baseProducts[2],
        name: '【廿四香笺】惊蛰 · 醒神「雷震」药师香囊',
        description: '采用龙脑、冰片、薄荷与生姜、苍术混合磨制。提神醒脑，辟邪防虫，驱散春困之良品。'
      }
    ]
  },
  {
    id: 'chunfen',
    name: '春分',
    englishName: 'Spring Equinox',
    solarTermPeriod: '3月20日 - 3月22日',
    season: 'spring',
    color: '#DCEFE6',
    textColor: '#1E3E2F',
    bgGradient: 'from-[#DCEFE6] to-[#BEE3D2]',
    incenseName: '半冷半暖春分笺',
    scentProfile: {
      topNotes: ['桃花', '苦橘', '粉红胡椒'],
      middleNotes: ['依兰', '白栀子', '茉莉花'],
      baseNotes: ['雪松', '冷香草']
    },
    poem: {
      title: '春分',
      author: '徐铉',
      dynasty: '唐',
      content: [
        '仲春初四日，春色正中分。',
        '绿野徘徊月，晴天断续云。',
        '白云穿古寺，绿草没孤坟。',
        '惆怅乡关路，茫茫不可闻。'
      ],
      translation: '仲春二月里，一年的春色正好平分。碧野上月影徘徊游移，万里晴空飘浮着断续的浮云。流白之云穿过巍巍古寺，葱茏绿草淹没了山野孤冢。举头望向家乡的来路，唯有烟雨茫茫不可闻。',
      appreciation: '春分者，日夜均，寒暑平。这是一个充满哲学平衡之美的黄金时刻。冷与热，昼与夜，明与暗恰在此处握手言和。该香气兼具了橙花的暖意与雪松折骨的苍冷，象征这种理性的平衡美学。'
    },
    emotionalProfile: {
      mood: '寻找生活、职场与人生的中庸平衡，渴望安详与安顿。',
      interactionTip: '与您共话茶艺，探讨“平衡之道”，提供一个冷暖交织的恬静温存。',
      comfortWords: '得失各半，是人生的常态。不必因一时的偏轨而焦虑。在春分这一天平衡自己的呼吸，接受自己所有的不完美，冷暖自知，便可淡定从容。'
    },
    creativeProducts: [
      baseProducts[0],
      baseProducts[3]
    ]
  },
  {
    id: 'qingming',
    name: '清明',
    englishName: 'Pure Brightness',
    solarTermPeriod: '4月4日 - 4月6日',
    season: 'spring',
    color: '#E3F2FD',
    textColor: '#1E3A8A',
    bgGradient: 'from-[#E3F2FD] to-[#CBDCF7]',
    incenseName: '雨后晴天青',
    scentProfile: {
      topNotes: ['天竺葵', '湿润泥土', '露水'],
      middleNotes: ['菊花', '杏花', '焚香香熏'],
      baseNotes: ['古朴沉香', '香根草']
    },
    poem: {
      title: '清明',
      author: '杜牧',
      dynasty: '唐',
      content: [
        '清明时节雨纷纷，路上行人欲断魂。',
        '借问酒家何处有，牧童遥指杏花村。'
      ],
      translation: '清明节时细雨落得纷纷扬扬，路上的旅人更是心情凄迷、悲伤得如同丢了魂魄。试问哪里可以找到喝酒解愁的小酒店呢？牧童在牛背上遥遥指向远方那开满杏花的美丽村庄。',
      appreciation: '清明，既是追思逝者、敬畏生命的哀伤时节，又是踏青寻春、向死而生的明媚起点。雨中夹杂着杏花芳甜与湿冷泥土的草木凄婉，与厚重的古寺燃香交融，指引旅人去追寻灵魂深处的纯粹与新生。'
    },
    emotionalProfile: {
      mood: '思念逝去之人，夹杂淡淡忧伤，渴望灵魂的净化与澄明。',
      interactionTip: '伴您共同品味清茶，于无声的白雨香道中，洗涤心尘，安放寂静思念。',
      comfortWords: '思念是一根长线，连接着岁月的两端。离别不会让爱消失，那些留在风里的叮咛，正化作清明时节的春雨，悄悄洗去你心头的尘埃，护送你珍重向前。'
    },
    creativeProducts: [
      {
        ...baseProducts[0],
        name: '【廿四香笺】清明 · 「雨后晴天青」手工沉香',
        description: '选用高级老芽庄沉香，融入杏花春雨后的青葱绿意，点燃时宛如置身清净古意山门。'
      },
      baseProducts[1]
    ]
  },
  {
    id: 'guyu',
    name: '谷雨',
    englishName: 'Grain Rain',
    solarTermPeriod: '4月19日 - 4月21日',
    season: 'spring',
    color: '#E8F5E9',
    textColor: '#1B5E20',
    bgGradient: 'from-[#E8F5E9] to-[#C8E6C9]',
    incenseName: '暮春煮茶香',
    scentProfile: {
      topNotes: ['谷雨茶叶', '佛手柑', '薄荷'],
      middleNotes: ['白牡丹', '紫藤', '竹叶'],
      baseNotes: ['柏木', '檀香']
    },
    poem: {
      title: '谢中书候送古茶',
      author: '齐己',
      dynasty: '唐',
      content: [
        '生茶珍重献芳丛，谷雨新火采撷功。',
        '点试雪花春欲尽，煮煎云脚晓未终。',
        '竹窗梦醒听疏雨，石鼎香腾泛绿风。'
      ],
      translation: '生茶是何等珍贵由芳草丛中奉纳而来，这是在谷雨时节，点燃新火所收获的采茶功德。点点春茶在春天将尽时泛起雪花般汤花，在清晨静静地煮起云雾翻腾的茶汤。在竹窗前从梦中醒来，静听疏落的雨声，石鼎中茶香升腾，仿佛在石室里泛起一阵绿色的春风。',
      appreciation: '谷雨是春季的最后一个节气。此时暮春将尽，初夏欲立。谷雨时节采摘的春茶是一年中的极品，名为“谷雨茶”。清越的茶香伴着松透的纸笺与微雨，在青砖瓦舍中翻滚，让人心旷神怡，也是迎接新一季度的最好送别仪式。'
    },
    emotionalProfile: {
      mood: '在春季末尾心生依依不舍，期待为新里程做好充沛准备。',
      interactionTip: '为您沏一壶翠绿的谷雨新茶，燃一炷带有浓郁茶香的竹柏木香，回味江南秀气。',
      comfortWords: '莫叹春归去，繁花落尽，结出的是沉甸甸的果实。感谢这春天的温柔厚赐，它将作为你最饱满的养分，伴你大步跨入生机盎然的夏日长焦之中。'
    },
    creativeProducts: [
      baseProducts[3],
      baseProducts[0]
    ]
  },
  {
    id: 'lixia',
    name: '立夏',
    englishName: 'Beginning of Summer',
    solarTermPeriod: '5月5日 - 5月7日',
    season: 'summer',
    color: '#FFF8E1',
    textColor: '#F57F17',
    bgGradient: 'from-[#FFF8E1] to-[#FFE082]',
    incenseName: '首夏清和香',
    scentProfile: {
      topNotes: ['苦橙叶', '绿薄荷', '晚香玉'],
      middleNotes: ['栀子花', '忍冬', '茉莉'],
      baseNotes: ['降真木', '麝香草']
    },
    poem: {
      title: '立夏',
      author: '陆游',
      dynasty: '宋',
      content: [
        '重九时节正清和，立夏天气已晴明。',
        '庭院昼静无人迹，时有娇莺恰恰啼。'
      ],
      translation: '节气正逢清明与和煦交织，立夏晴朗的天空已经一片明净。深深庭院在白昼静悄悄的毫无行踪，偶尔有娇媚的黄莺在绿树浓阴中发出恰恰好听的啼鸣。',
      appreciation: '首夏犹清和，芳草亦未歇。立夏并非夏日炎炎的酷夏，而是夏之初，还保留着暮春的温存在晴空里。该香气以清烈降火的苦橙叶与薄荷拉开序幕，随后是大朵栀子花、忍冬的初绽。温润中带着勃勃生命力的欣欣向荣。'
    },
    emotionalProfile: {
      mood: '热烈而浪漫、渴望奔跑、内心有些许烦躁需要清淡之香平顺。',
      interactionTip: '与您共赴明朗的初夏，用具有安抚、降温功效的栀子凉炉消除内火。',
      comfortWords: '风已经变暖，日光在树叶上跳舞。把冬春的小情绪晒一晒吧，在这新开场的夏天里，坦坦荡荡地去爱，大声地去笑，展现最饱满炽热的本色。'
    },
    creativeProducts: [
      baseProducts[2],
      {
        ...baseProducts[1],
        name: '【廿四香笺】立夏 · 经典白瓷流烟荷叶炉',
        description: '选用江西景德镇特指纯白瓷，还原荷叶初展曼妙曲线。点燃塔香时流烟如泉，雅致灵动。'
      }
    ]
  },
  {
    id: 'xiaoman',
    name: '小满',
    englishName: 'Lesser Fullness',
    solarTermPeriod: '5月20日 - 5月22日',
    season: 'summer',
    color: '#FFF3E0',
    textColor: '#E65100',
    bgGradient: 'from-[#FFF3E0] to-[#FFCC80]',
    incenseName: '金谷丰登麦浪香',
    scentProfile: {
      topNotes: ['青麦穗', '燕麦', '牛奶'],
      middleNotes: ['大麦茶', '干草', '杏仁'],
      baseNotes: ['檀香', '香草']
    },
    poem: {
      title: '五月中旬小满',
      author: '欧阳修',
      dynasty: '宋',
      content: [
        '麦穗初齐稚子娇，桑蚕吐丝岁丰饶。',
        '南风吹动黄金浪，陇上人家庆满朝。'
      ],
      translation: '麦穗在风中刚刚长齐，孩子天真娇憨，桑蚕正在作茧吐丝令人期待一年的丰饶。南风轻拂大地点燃起金黄色的麦浪，陇上人家一大早就开始准备庆祝丰收的到来。',
      appreciation: '二十四节气里，有“小满”而无“大满”，反映了东方哲学中“水满则溢，月盈则亏”的中庸大智慧。小满时节，麦穗将满未满，蚕吐丝饱满，一切都刚刚好，处于希望的巅峰状态。香气设计极其独特，以温暖饱满的谷麦与轻柔乳香为主，传达心满满足的踏实治愈。'
    },
    emotionalProfile: {
      mood: '追求幸福感，享受当下劳动的快乐与沉淀，知足常乐。',
      interactionTip: '与您一起体味“刚刚好”的人生哲学，用松软的烘焙麦芽暖香温润相待。',
      comfortWords: '未满，才是人生最奢侈的留白。它意味着你已经拥有了绝大成熟，却依然保有无限可期、可以努力的空间。无需过于追求极致，当下的丰盈已是最美风景。'
    },
    creativeProducts: [
      baseProducts[0],
      baseProducts[3]
    ]
  },
  {
    id: 'mangzhong',
    name: '芒种',
    englishName: 'Grain in Ear',
    solarTermPeriod: '6月5日 - 6月7日',
    season: 'summer',
    color: '#FFF8E1',
    textColor: '#795548',
    bgGradient: 'from-[#FFF8E1] to-[#FFE082]',
    incenseName: '青梅煮酒香',
    scentProfile: {
      topNotes: ['青梅', '黄酒', '绿苹果'],
      middleNotes: ['荷花', '水仙', '桂花酒酿'],
      baseNotes: ['橡木', '沉香']
    },
    poem: {
      title: '芒种后积雨',
      author: '陆游',
      dynasty: '宋',
      content: [
        '芒种初过雨未消，农夫插秧立波涛。',
        '梅子青青水渐满，夜来闲对一香膏。'
      ],
      translation: '芒种刚刚过去，连绵阴雨意犹未尽，农夫们正站在没过脚踝的泥水中插秧劳作。酸甜的梅子正青，池塘里的春水渐渐蓄满。夜里归来，闲适地对着一炉燃着的香膏发呆。',
      appreciation: '芒种是一个极富生命仪式的节气：一手收割，一手播种，承前启后。梅雨交织着梅子酸甜和微醺酒香，最适合在这繁忙的雨季里舒缓神经。配以“青梅煮酒香”，驱散梅雨季湿冷与暑气，增添诗意雅趣。'
    },
    emotionalProfile: {
      mood: '忙绿、充实，但偶尔会感到焦躁疲倦，需要一次小酌般的深夜释怀。',
      interactionTip: '为您呈上一抹清甜酸涩的梅酒异香，共话“收获与耕耘”的心灵疗愈。',
      comfortWords: '生活就是一边收获，一边播种。你流下的每一滴汗水、写过的每一篇草稿，都是在自己的时区里播种希望。点燃青梅沉香，今晚，只谈闲散与惬意。'
    },
    creativeProducts: [
      {
        ...baseProducts[0],
        name: '【廿四香笺】芒种 · 「青梅煮酒」果香塔香',
        description: '选用成熟梅子原汁发酵提取物融入古香。果味酸脆，酒香微醺，伴有安逸的沉香后调。'
      },
      baseProducts[2]
    ]
  },
  {
    id: 'xiazhi',
    name: '夏至',
    englishName: 'Summer Solstice',
    solarTermPeriod: '6月21日 - 6月22日',
    season: 'summer',
    color: '#FFE0B2',
    textColor: '#E65100',
    bgGradient: 'from-[#FFE0B2] to-[#FFB74D]',
    incenseName: '烈日避暑荷露香',
    scentProfile: {
      topNotes: ['西瓜', '冰片', '薄荷叶'],
      middleNotes: ['白莲花', '绿竹叶', '露水'],
      baseNotes: ['老山檀香', '香根草']
    },
    poem: {
      title: '夏至避暑北池',
      author: '韦应物',
      dynasty: '唐',
      content: [
        '昼晷已云极，宵漏自此长。',
        '未及得登涉，独此避炎光。',
        '荷风送香气，竹露滴清响。'
      ],
      translation: '白天的阳光已经强烈到了极点，漫长的黑夜从今天开始也会逐渐变长。还没来得及去登高远涉，独自在这一湾北池深处躲避炎热的烈日光芒。荷塘里的清风吹送着大朵荷花的香气，翠竹上的露珠在池水上溅落出清脆的响声。',
      appreciation: '夏至是白昼最长的一天。虽是“阳极”之时，却也代表着“阴气”在白昼尽头悄然滋生。在酷热沉闷中，唯有一池清荷、一滴竹露，配以千年降心安神的“老山檀香”加冰片，能破除漫天暑气，带来一剂至纯灵魂的清凉秘方。'
    },
    emotionalProfile: {
      mood: '情感饱满、渴望安宁、寻求酷热喧喧中的一方冰室避护。',
      interactionTip: '与您共临湖畔荷亭，在清风穿堂中轻摇折扇，为您奉上荷露檀香。',
      comfortWords: '夏至已至，繁茂到了极点。在这最长的一天里，愿你的心境如老山老树般安详宁静，静下来，听听心里那一阵穿堂而过的松林清风。'
    },
    creativeProducts: [
      baseProducts[1],
      {
        ...baseProducts[2],
        name: '【廿四香笺】夏至 · 真丝刺绣「风送荷香」折扇',
        description: '苏工雕花竹质扇骨，真丝高质手工绣面。扇动间附随淡淡檀香与荷叶青气，儒雅不凡。'
      }
    ]
  },
  {
    id: 'xiaoshu',
    name: '小暑',
    englishName: 'Lesser Heat',
    solarTermPeriod: '7月6日 - 7月8日',
    season: 'summer',
    color: '#FFCDD2',
    textColor: '#C62828',
    bgGradient: 'from-[#FFCDD2] to-[#EF9A9A]',
    incenseName: '松林清风避暑笺',
    scentProfile: {
      topNotes: ['葡萄柚', '桉树叶', '冷杉'],
      middleNotes: ['迷迭香', '松针', '茉莉'],
      baseNotes: ['广藿香', '红红杉']
    },
    poem: {
      title: '小暑避暑',
      author: '白居易',
      dynasty: '唐',
      content: [
        '何以销烦暑，端居一院中。',
        '眼前无长物，窗下有清风。',
        '热散由心静，凉生自室空。'
      ],
      translation: '用什么来平息消除内心沉重烦躁的盛夏暑热呢？端正地端坐在这深深的小庭院中央。眼睛前面没有什么复杂缭绕的多余之物，竹窗底下刚好有一阵阵山野清风。只要心里清静了，身体的燥热自然会随风散去；只要居室维持空荡通透，凉意也会自然而然生起。',
      appreciation: '小暑是盛夏酷暑大幕拉开的序曲。古人讲“心静自然凉”，正是白居易在这首诗中所传达的旷达人生的智慧。选用极清凉、苍劲的森林松针与桉叶入香，不娇不媚，助人在心浮气躁的夏日时光里回归内心的空灵与坚定。'
    },
    emotionalProfile: {
      mood: '心浮气躁、难以集中注意力，渴望摒除杂乱、安守内心秩序。',
      interactionTip: '用清心寡欲之苍松冷杉冷熏香，伴您进入“物我两忘”沉浸式工作或冥想。',
      comfortWords: '世界越是喧嚣，你越是要守住内心的安静。把无关的心事像行李一样放下吧，“热散由心静，凉生自室空”，愿这一抹茶香带你沉淀回最坚实的自己。'
    },
    creativeProducts: [
      baseProducts[0],
      baseProducts[3]
    ]
  },
  {
    id: 'dashu',
    name: '大暑',
    englishName: 'Greater Heat',
    solarTermPeriod: '7月22日 - 7月24日',
    season: 'summer',
    color: '#FFB2B2',
    textColor: '#880E4F',
    bgGradient: 'from-[#FFB2B2] to-[#FF8080]',
    incenseName: '伏天百草避瘟香',
    scentProfile: {
      topNotes: ['艾叶', '佩兰', '迷迭香'],
      middleNotes: ['薰衣草', '公丁香', '茉莉茶'],
      baseNotes: ['降真木', '香根草']
    },
    poem: {
      title: '大暑',
      author: '曾几',
      dynasty: '宋',
      content: [
        '赤日几时过，清风无处寻。',
        '经书消暑易，茗饮坐窗深。'
      ],
      translation: '如火的红日几时才能够过去？凉爽的清风四处寻找都了无音影。幸而有饱读经书可以让烦躁的暑热容易消散，在竹窗下喝一杯温度刚好的热茶坐得更为幽深。',
      appreciation: '大暑是一年中气温最高、阳气鼎盛之极。民间不仅要饮茯茶、吃仙草，还要艾熏、佩戴中药香囊防病祛湿。本品巧妙复刻古方“避瘟草药香”，将艾叶、公丁香、佩兰的辛香同降真香和鸣，开窍提神，驱散炎暑，犹如在最闷的热浪中打开了一扇清新的草药古窗。'
    },
    emotionalProfile: {
      mood: '极度疲惫、胸闷气短、情绪需要被清风细细梳理与包容。',
      interactionTip: '给您斟一盏辛凉醒神的艾草茯饼茶，燃起避瘟百草香，除湿避疫。',
      comfortWords: '大暑过后，便是立秋。最难熬的热浪预示着清凉的转折已挂在地平线。撑住这最后的一场夏日烈火，跨过去，便是满目金黄的丰盛秋天在等待迎接你。'
    },
    creativeProducts: [
      baseProducts[2],
      baseProducts[1]
    ]
  },
  {
    id: 'liqiu',
    name: '立秋',
    englishName: 'Beginning of Autumn',
    solarTermPeriod: '8月7日 - 8月9日',
    season: 'autumn',
    color: '#FFF3E0',
    textColor: '#4E342E',
    bgGradient: 'from-[#FFF3E0] to-[#FFE0B2]',
    incenseName: '梧桐落叶知秋声',
    scentProfile: {
      topNotes: ['红橘皮', '金桂', '晚秋风'],
      middleNotes: ['苦叶', '烟草叶', '红茶香'],
      baseNotes: ['岩兰草', '雪松']
    },
    poem: {
      title: '立秋',
      author: '刘言史',
      dynasty: '唐',
      content: [
        '兹晨戒流火，商飙早已惊。',
        '云天收夏色，木叶动秋声。'
      ],
      translation: '从今天早晨开始，夏日流火的热气便开始告诫消退，金秋的山野之风已经悄然惊醒。天上的云层渐渐收敛起盛夏的炽热之色，漫山的树叶在风中摇曳抖动，发出迷人的深秋声响。',
      appreciation: '立秋是秋天的第一个节气。一叶落而知天下秋。夏色未尽，秋声已动。空气中多了一股桂花初露的香气，混合着干爽的落叶与红茶的暖甜。“梧桐落叶香”选用老红茶沉水香与桂花精油融合调制。沉静典雅，饱含岁月丰庆后的收敛与淡定。'
    },
    emotionalProfile: {
      mood: '成熟自省、心境由动转静、有些感伤时光流逝却又向往收获。',
      interactionTip: '为您沏一盏甘甜的金桂花茶，点燃沉稳而带有些许干叶质感的岩兰草香。',
      comfortWords: '一叶知秋，万物沉淀。褪去夏日的燥热，我们的内心终于迎来了理智的降温。允许过去的都过去，珍惜那些正在你掌心里悄悄凝结的金色成果。'
    },
    creativeProducts: [
      baseProducts[0],
      baseProducts[2]
    ]
  },
  {
    id: 'chushu',
    name: '处暑',
    englishName: 'End of Heat',
    solarTermPeriod: '8月22日 - 8月24日',
    season: 'autumn',
    color: '#F1F1E6',
    textColor: '#3E2723',
    bgGradient: 'from-[#F1F1E6] to-[#D7D7C8]',
    incenseName: '暑退凉初袭',
    scentProfile: {
      topNotes: ['薄荷草', '绿叶', '苦橙'],
      middleNotes: ['菊花', '桂花', '乌龙茶'],
      baseNotes: ['龙脑香', '檀香']
    },
    poem: {
      title: '秋日喜雨',
      author: '柳宗元',
      dynasty: '唐',
      content: [
        '处暑消炎热，清飙起暮天。',
        '高云收雨脚，皓月吐澄川。'
      ],
      translation: '处暑这天终于平息消除了烈日炎热，清凉的晚风在暮色苍茫的天空悄然燃起。高空中的乌云已经收起了落雨的雨脚，明净皎洁的皓月倒映在澄澈的江水川流里。',
      appreciation: '处暑，即“出暑”，意味着炎热离开，盛夏自此隐退。天高云淡，明月澄江。香香的设计巧妙地在草木苦橙的清爽中带入暗暗浮动的野菊与桂树芬美，尾调则是经典冰片与香根，宁静舒泰。'
    },
    emotionalProfile: {
      mood: '神清气爽、向往重回专注工作思考、洗尽铅华的安详满足。',
      interactionTip: '陪您在落日余晖中端坐，点燃一盒“出暑香”，静享明月高悬的松弛。',
      comfortWords: '最闷热的考验已经结束。你可以放心地松开紧绷的弦了，用处暑的清凉晚风，给自己的拼搏放个假，祝你新的一阶段，如澄川江水，明净而长。'
    },
    creativeProducts: [
      baseProducts[3],
      baseProducts[0]
    ]
  },
  {
    id: 'bailu',
    name: '白露',
    englishName: 'White Dew',
    solarTermPeriod: '9月7日 - 9月9日',
    season: 'autumn',
    color: '#FAFAFA',
    textColor: '#37474F',
    bgGradient: 'from-[#FAFAFA] to-[#CFD8DC]',
    incenseName: '露凝秋水玉簟香',
    scentProfile: {
      topNotes: ['冰凉矿物', '芦苇叶', '白葡萄'],
      middleNotes: ['露水荷叶', '栀子', '白胡椒'],
      baseNotes: ['羊脂白沉香', '雪松']
    },
    poem: {
      title: '秦风·蒹葭',
      author: '无名氏',
      dynasty: '先秦',
      content: [
        '蒹葭苍苍，白露为霜。',
        '所谓伊人，在水一方。'
      ],
      translation: '河边的芦苇茂密葱茏，晶莹的白露凝结成了寒霜。我所日夜思念追寻的那个完美之人，正伫立在浩瀚江水的另一方。',
      appreciation: '白露是二十四节气中极具诗情画意的一个。露凝而白，晶莹剔透，最是那草叶清晨冷冽而温柔的天然水气。相传此时要采大叶野菊煎汤入香，本品完美糅合露水、芦苇叶与雪松，后味辅极其珍稀的“羊脂沉香”，超凡脱俗，最是契合对伊人的朦胧诗心。'
    },
    emotionalProfile: {
      mood: '带有浪漫的宿命感与求而不得的思念迷离，品味纯享。',
      interactionTip: '为您在秋水无垠中递上一杯温热白茶，以极其纯澈的露水香气致敬心灵至爱。',
      comfortWords: '“在水一方”的美丽不仅在于相拥，更在于这种朦胧而纯粹的向往。愿这一抹纯澈的白露香，守护你心中那份无瑕的一方圣地，安睡好梦。'
    },
    creativeProducts: [
      {
        ...baseProducts[0],
        name: '【廿四香笺】白露 · 「为霜」极简白瓷线香器',
        description: '白练素雅器型，采用官窑白釉多次烧制，宛如清晨凝霜之白露。晶澄温润，去浮去燥。'
      },
      baseProducts[2]
    ]
  },
  {
    id: 'qiufen',
    name: '秋分',
    englishName: 'Autumn Equinox',
    solarTermPeriod: '9月22日 - 9月24日',
    season: 'autumn',
    color: '#FFF3E0',
    textColor: '#5D4037',
    bgGradient: 'from-[#FFF3E0] to-[#FFE0B2]',
    incenseName: '一炉老桂平分秋',
    scentProfile: {
      topNotes: ['金桂花', '甜橙皮', '杏子'],
      middleNotes: ['大红袍茶', '金丝小枣', '百合'],
      baseNotes: ['老山檀香', '安息香']
    },
    poem: {
      title: '秋分夜',
      author: '金居',
      dynasty: '唐',
      content: [
        '漏迟惊漏夜，风清觉露凉。',
        '秋色今朝半，庭槐一叶落。',
        '独步闲庭宇，老桂送天香。'
      ],
      translation: '漏壶渐慢惊觉夜已生深，山风拂面清澈倍感露水微凉。一年的秋色在今朝正好平分，庭院梧桐一叶飘落。独自闲游在深幽的石板庭院里，苍老的老桂盛放，送来沁人心脾的芬芳天香。',
      appreciation: '秋分平分秋色，日夜对分。不同于春分的娇俏，秋分充满了老熟与沉饱：风中是馥郁而不俗的澄黄老桂、红茶的熟醇与山木的悠长。该香气精选金桂花，并以醇厚的安息香与檀香为底，一朝燃起，满室生香，正是大成之美所在。'
    },
    emotionalProfile: {
      mood: '富足安逸、心情平和圆融，喜爱中式经典与温存。',
      interactionTip: '以最经典的“秋桂老檀香”搭配乌龙热茶，与您一起感受秋景均分的大成惬意。',
      comfortWords: '白昼与黑夜在此平分，生活在此处达到了最笃定与安静的平衡。不要急着向前张望，就在这一树桂花香里，好好奖赏自己过去的一路风尘吧。'
    },
    creativeProducts: [
      baseProducts[0],
      baseProducts[1]
    ]
  },
  {
    id: 'hanlu',
    name: '寒露',
    englishName: 'Cold Dew',
    solarTermPeriod: '10月8日 - 10月9日',
    season: 'autumn',
    color: '#ECEFF1',
    textColor: '#37474F',
    bgGradient: 'from-[#ECEFF1] to-[#CFD8DC]',
    incenseName: '枫林红叶煨火香',
    scentProfile: {
      topNotes: ['山楂', '杜松子', '烈酒'],
      middleNotes: ['红枫叶', '菊花酒', '肉肉香'],
      baseNotes: ['龙涎香', '冷泥煤']
    },
    poem: {
      title: '池上',
      author: '白居易',
      dynasty: '唐',
      content: [
        '袅袅凉风动，凄凄寒露零。',
        '兰衰花始少，蓬折叶犹青。',
        '鸿雁来忧急，江草暮秋青。'
      ],
      translation: '袅袅的凉风在树梢摇摆开来，凄凄寒露已经在草丛中点点凝聚。兰草渐渐衰萎花朵也开始稀少，荷株折骨但莲叶依然是一片青翠。大雁成群北来带来凄迷之色，江边的秋草在夜色暮秋里格外青翠。',
      appreciation: '寒露时节，露水几乎冷如冰凝。不同于先前的温凉，此时一缕晚风中自带一分寒意。然而寒凉之下，枫林染红，菊花烈开。该香气有着略带烟熏的杜松、红枫与泥煤碳火之香，给人冷热交融、温暖壁炉般的浓烈慰藉。'
    },
    emotionalProfile: {
      mood: '有些清冷孤独，期待得到实质拥抱与深沉温度的呵护。',
      interactionTip: '与您围炉而坐，点上一炉温暖舒坦的红泥炭火香，为您驱走夜里第一丝寒冰。',
      comfortWords: '露水虽凉，但你的心不能冷。愿你在这漫漫冷夜里，记得为自己加一件温暖的衣裳。点一炉香，暖一壶老酒，所有的寒意都无法阻挡你心中的晴朗。'
    },
    creativeProducts: [
      baseProducts[1],
      baseProducts[3]
    ]
  },
  {
    id: 'shuangjiang',
    name: '霜降',
    englishName: 'Frost\'s Descent',
    solarTermPeriod: '10月23日 - 10月24日',
    season: 'autumn',
    color: '#EFEBE9',
    textColor: '#4E342E',
    bgGradient: 'from-[#EFEBE9] to-[#D7CCC8]',
    incenseName: '霜叶红胜二月花',
    scentProfile: {
      topNotes: ['干柿饼', '红苹果', '胡椒'],
      middleNotes: ['番红花', '丁香花蕾', '深秋干草'],
      baseNotes: ['苏合香', '橡苔']
    },
    poem: {
      title: '山行',
      author: '杜牧',
      dynasty: '唐',
      content: [
        '远上寒山石径斜，白云生处有人家。',
        '停车坐爱枫林晚，霜叶红于二月花。'
      ],
      translation: '沿着秋天弯曲的石板山路向着高山走去，那白云飘浮翻滚的深山处居然居住着农人家。忍不住停下马车坐观欣赏这夕阳晚霞下的寒枫晚树，那饱经寒风白霜洗礼的枫叶，居然比二月里娇艳的海棠花还要火红！',
      appreciation: '霜降是秋季的最后一个节气。霜在夜里从天空降下，万木枯萎。然而，正是经历过白霜的剧烈洗礼，枫林才会燃红出一年中最震撼、最不屈。这款“霜叶香”巧妙融入柿饼的暖甜、深秋干草之香，以及名贵的苏合草香，苍茫厚重，象征生命最华丽的谢幕与积淀。'
    },
    emotionalProfile: {
      mood: '有一种阅尽千帆、不畏艰险的从容大气，喜爱厚重、悠长古意的意境。',
      interactionTip: '用温暖丰厚的“苏合红枫老香”伴在左右，提供大叔般的饱满安全感。',
      comfortWords: '霜降并非衰亡，而是生命的再一次华丽提炼。那些曾在春天里盛开、在夏日里流汗的果实，终于在金色的白霜中结成最坚硬甜美的外壳。愿你不畏严霜，依然如枫叶般，在夕阳里烧红一片天。'
    },
    creativeProducts: [
      baseProducts[0],
      baseProducts[2]
    ]
  },
  {
    id: 'lidong',
    name: '立冬',
    englishName: 'Beginning of Winter',
    solarTermPeriod: '11月7日 - 11月8日',
    season: 'winter',
    color: '#ECEFF1',
    textColor: '#263238',
    bgGradient: 'from-[#ECEFF1] to-[#B0BEC5]',
    incenseName: '玄冬静伏闭藏香',
    scentProfile: {
      topNotes: ['冰水', '松脂', '生姜'],
      middleNotes: ['百里香', '雪岭冷杉', '大提琴乌木'],
      baseNotes: ['高级乳香', '安息香']
    },
    poem: {
      title: '立冬',
      author: '李白',
      dynasty: '唐',
      content: [
        '冻笔新诗懒写，寒炉美酒时温。',
        '醉看风落客衣，孤舟独吊江村。'
      ],
      translation: '墨水在笔尖冻住，新诗也懒得去提笔写，在寒冷的小火炉上时刻温着一壶美酒。略带醉意闲看冷风卷落路人的客衣，远望一叶孤零零的扁舟独自系在荒凉的江村。',
      appreciation: '立冬，冬之始，万物避收藏。天地重归肃穆。李白的这首古诗写出了一种绝佳的“冬日懒意与内敛”：笔尖虽冻，心却在温热的美酒里放松放空。该香气以香脂、桧冷杉结合厚重的顶级乳香和暖意姜。纯净而不冷，给人寒夜红泥火炉的至臻关怀。'
    },
    emotionalProfile: {
      mood: '疲倦、想冬眠、渴望宅在安稳空间、躲避复杂社交。',
      interactionTip: '为您点起一盏融融红香，伴您进入“安宁避冬模式”，在悠扬萧乐里疗愈。',
      comfortWords: '“大雪将至，不如温酒”。允许自己合理地“懒惰”与收敛。冬日的沉睡不是荒废，而是在用最安静的方式守护你的根基。暖一壶酒，让心闲下来，晚安。'
    },
    creativeProducts: [
      baseProducts[1],
      baseProducts[3]
    ]
  },
  {
    id: 'xiaoxue',
    name: '小雪',
    englishName: 'Lesser Snow',
    solarTermPeriod: '11月22日 - 11月23日',
    season: 'winter',
    color: '#ECEFF1',
    textColor: '#455A64',
    bgGradient: 'from-[#ECEFF1] to-[#CFD8DC]',
    incenseName: '素阁飞雪凝冷香',
    scentProfile: {
      topNotes: ['干松针', '冰片', '柠檬'],
      middleNotes: ['蜡梅', '白色鸢尾', '檀木'],
      baseNotes: ['白麝香', '西藏沉香']
    },
    poem: {
      title: '小雪',
      author: '戴叔伦',
      dynasty: '唐',
      content: [
        '花雪随风不厌看，更多还折野梅酸。',
        '江南霜冷蓬飞早，不省冬至腊月寒。'
      ],
      translation: '零星如小花般的雪屑伴着清风飘落，让人总是看不够，更欣喜有路边野梅带来清新的香气。南国白霜早落蓬草随风摇曳，让人几乎察觉不到冬日深夜已经如此寒凉。',
      appreciation: '小雪阶段，寒未极，雪未大。天地间有种半透半澈的素白。梅花初含花苞，伴着干枯温厚的松针与冰片散发的丝丝凉气，在空气中凝结成极为空灵的“冰霜素阁香”。让人心思敏锐清澈，不畏尘俗。'
    },
    emotionalProfile: {
      mood: '追求极致的干净、简单、空灵。对复杂、油腻的事物感到些许抵触。',
      interactionTip: '用这道不染一丝尘俗、微冷微香的蜡梅白松香，帮您清洗头脑，理清头绪。',
      comfortWords: '初雪落下，世界正在悄然把那些斑驳杂乱的痕迹盖去。愿你也能像初雪后的大地一样，回归最纯真的留白。不必向任何人证明什么，你本自具足，干净而美。'
    },
    creativeProducts: [
      {
        ...baseProducts[0],
        name: '【廿四香笺】小雪 · 「蜡梅初绽」纯手工线香',
        description: '采集早冬腊月含苞腊梅花蕾，加西藏老沉香手工古法盘制，带有极其雅致寒风冷香。'
      },
      baseProducts[2]
    ]
  },
  {
    id: 'daxue',
    name: '大雪',
    englishName: 'Greater Snow',
    solarTermPeriod: '12月6日 - 12月8日',
    season: 'winter',
    color: '#F5F5F5',
    textColor: '#37474F',
    bgGradient: 'from-[#F5F5F5] to-[#E0E0E0]',
    incenseName: '炉边红炭煨寒雪',
    scentProfile: {
      topNotes: ['冰凉粉金', '黑加仑', '朗姆酒'],
      middleNotes: ['松柏枝叶', '红梅花', '琥珀'],
      baseNotes: ['安息香', '香根草']
    },
    poem: {
      title: '问刘十九',
      author: '白居易',
      dynasty: '唐',
      content: [
        '绿蚁新醅酒，红泥小火炉。',
        '晚来天欲雪，能饮一杯无？'
      ],
      translation: '新酿就的米酒泛着嫩绿如小蚂蚁般的汤沫，泥封红泥塑的小火炉正烧得通红旺盛。天色已暗，眼看一场大雪就要漫天铺下，不知朋友能否赏光，来我这里共饮一杯？',
      appreciation: '大雪落万山，万籁俱寂。然而，正是这冰冷的白雪，激发出炉火最热烈、最浪漫的温度。白居易只用十几个字，便勾勒出中国传统文化里最温暖体贴的人情温热。与之契合的香气富含香树脂、琥珀与朗姆烈酒，一经焚烧，满心暖流，治愈人世孤独。'
    },
    emotionalProfile: {
      mood: '追求温暖的人际陪伴、喜爱冬日温暖火光，有些许冬夜不眠的感时光阴。',
      interactionTip: '为您点起虚拟的“红泥炉火”，为您沏上最香的老红茶，伴起深夜对酌。',
      comfortWords: '晚来天欲雪，能饮一杯无？即使窗外大雪纷飞、世事漫天寒冷，在这间温暖的香室里，总有一炉通红的火炭、两三盏老酒与一抹心安的香气，永远为你点着，等你归来。'
    },
    creativeProducts: [
      baseProducts[1],
      baseProducts[3]
    ]
  },
  {
    id: 'dongzhi',
    name: '冬至',
    englishName: 'Winter Solstice',
    solarTermPeriod: '12月21日 - 12月23日',
    season: 'winter',
    color: '#ECEFF1',
    textColor: '#1A237E',
    bgGradient: 'from-[#ECEFF1] to-[#C5CAE9]',
    incenseName: '阴极阳生降真玄',
    scentProfile: {
      topNotes: ['冷冰晶', '甜椒', '绿蔻'],
      middleNotes: ['降真草药', '干无花果', '古典乌木'],
      baseNotes: ['印度檀香', '岩蔷薇']
    },
    poem: {
      title: '冬至',
      author: '杜甫',
      dynasty: '唐',
      content: [
        '年年至日长为客，忽忽衰颜分外惊。',
        '极阴天宇夜最长，阳气初萌律回归。'
      ],
      translation: '每年冬至这天我都流落在他乡客居，恍然间惊见铜镜里自己斑落衰老的面颜。在极致阴冷的沉黑世界中度过这最漫长的一夜，然而一声轻响里，新一轮的阳气已经在暗夜尽头悄然回归。',
      appreciation: '冬至是白昼最短、黑夜最长的极限一天。古人坚信“冬至一阳生”：在最黑暗、最极阴的关键一刻，温暖的新阳气已经悄然诞生。这是极大地具有周易辨证美学的神圣时刻。选用悠远、带有些许草药微苦回甘的“降真香”，融合檀香，驱邪固本，温养元气。'
    },
    emotionalProfile: {
      mood: '自强不息、处于低谷却饱含静静坚信与力量渴望，寻求光明启示。',
      interactionTip: '与您共度这最漫长的冬至黑夜，点亮“阳芽古篆香”，迎迓新阳的诞生。',
      comfortWords: '夜已经长到了极限，这预示着：从明天开始，白昼将一寸一寸地变长。挺住最漫长的暗夜，因为这正是你生命中温暖新生的伟大开端。'
    },
    creativeProducts: [
      baseProducts[0],
      {
        ...baseProducts[1],
        name: '【廿四香笺】冬至 · 重型铸铁避风黑风炉',
        description: '选用高级铸铁复古烧制，坚固重器。具有绝佳的避风结构，在漫漫冬夜里稳定香屑火苗。'
      }
    ]
  },
  {
    id: 'xiaohan',
    name: '小寒',
    englishName: 'Lesser Cold',
    solarTermPeriod: '1月5日 - 1月7日',
    season: 'winter',
    color: '#E0F2F1',
    textColor: '#004D40',
    bgGradient: 'from-[#E0F2F1] to-[#80CBC4]',
    incenseName: '林下踏雪梅影疏',
    scentProfile: {
      topNotes: ['干松枝', '冷薄荷', '冰泉水'],
      middleNotes: ['红腊梅花', '黑胡椒', '枯树皮'],
      baseNotes: ['琥珀木', '雪域龙涎']
    },
    poem: {
      title: '早春',
      author: '白居易',
      dynasty: '唐',
      content: [
        '雪暗江村冻未消，腊梅一树独妖娆。',
        '前村深雪里，昨夜一枝开。'
      ],
      translation: '漫天阴云江边村寨依然被厚冰冻结，一树红蜡梅居然独自开得妖娆如烈火。皑皑百里深雪里，昨夜有孤傲的一枝梅花，已经朝着风霜傲然盛开。',
      appreciation: '小寒恰逢三九时节，是全国最寒冷的重度时刻。然而腊梅吐秀，梅风一过，带来万家寻春的希望之火。冷薄荷、龙涎与黑胡椒的轻微刺激，让松柏与傲寒腊梅的清冷更显冷艳。最适合给深夜拼搏的书桌带来一股神清气爽。'
    },
    emotionalProfile: {
      mood: '孤芳自赏、清冷坚韧，不屑于平庸，渴望高品质与自律的升华。',
      interactionTip: '伴您静站红泥窗外，用清气缭绕的傲骨梅香，安顿寒冷的书台。',
      comfortWords: '昨夜一枝开，那是你正在向寒冬递出一封不妥协的战书。愿你如雪中傲寒的腊梅，不需要万花依偎，也能独自在最冷的日子里，活出惊绝众人的璀璨本色。'
    },
    creativeProducts: [
      baseProducts[2],
      baseProducts[3]
    ]
  },
  {
    id: 'dahan',
    name: '大寒',
    englishName: 'Greater Cold',
    solarTermPeriod: '1月20日 - 1月21日',
    season: 'winter',
    color: '#B2DFDB',
    textColor: '#00695C',
    bgGradient: 'from-[#B2DFDB] to-[#4DB6AC]',
    incenseName: '冻极守一待春信',
    scentProfile: {
      topNotes: ['肉桂皮', '乳豆', '柠檬草'],
      middleNotes: ['红大金梅', '松果', '肉豆蔻'],
      baseNotes: ['喜马拉雅雪松', '檀木']
    },
    poem: {
      title: '大寒寄怀',
      author: '陆游',
      dynasty: '宋',
      content: [
        '大寒雪未消，冻合太古源。',
        '松风吹骨疼，一室独自开。',
        '昨夜忽一春，梅枝报春信。'
      ],
      translation: '大寒时节连天积雪依然未消，幽深的泉源太古结冰合拢。呼啸而过的松林之风吹得人骨头微疼，然而在这暖黄的书房里放飞一室的香云。忽听昨夜里传来一声梅落，那低垂的梅枝，分明是在向人间报送开春的新信。',
      appreciation: '大寒是整个二十四节气的最后一环。大寒岁底，冬去春回。大寒过后，又是新一年的立春。在这一元复始、万象更新的关键门槛上，香气注入暖暖温润的肉桂、雪松与老香草。坚守住最后的冻极，便能听到迎面拂来的春风新哨。'
    },
    emotionalProfile: {
      mood: '期待归家团圆、渴望给过去一年做完美结案与对美好未来的强烈展望。',
      interactionTip: '与您一起书写岁末的吉庆香笺，用肉桂暖融融的老松香，静候下个立春。',
      comfortWords: '冬越深，春越近。一年的风霜雨雪你都成功挺过来了。在整个周期的最后一站，点燃这一炉“待春香”，静静数三个十，看，春天正在对你张开热烈的双臂。'
    },
    creativeProducts: [
      {
        ...baseProducts[0],
        name: '【廿四香笺】大寒 · 「一阳复始」岁寒暖冬香',
        description: '选用极其浓厚的肉桂、肉豆蔻配以神树雪松精粉。温阳驱寒，岁末迎春之顶级名作。'
      },
      baseProducts[3]
    ]
  }
];
