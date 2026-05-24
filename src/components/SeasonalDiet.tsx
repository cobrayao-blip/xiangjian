import React from 'react';
import { ChefHat, Heart, AlertCircle } from 'lucide-react';
import { SolarTerm } from '../types';
import { solarTerms } from '../solarTermsData';

interface DietDetails {
  principle: string; // 养生原则
  herbs: {
    name: string;
    property: string; // 药性 (e.g. 辛温、甘凉)
    function: string; // 传统功效
    usageTip: string;  // 实用建议
    icon: string;
  }[];
  recipe: {
    name: string; // 药膳品名
    benefit: string; // 功效
    ingredients: string[]; // 药膳食材
    preparation: string[]; // 煎熬制备步骤
    historyQuote?: string; // 四时历史出处 or 古籍
  };
}

// Full 24 Solar Terms Medicinal Diet Data Provider
const getDietDetailsByTermId = (termId: string, season: string): DietDetails => {
  // Let's implement specific customized data for typical terms, and fallbacks by season.
  const springFallback: DietDetails = {
    principle: '春三月，此谓发陈。天地俱生，万物以荣。养生当以“舒肝理气，升发元阳，少酸多甘”为基本宗旨。',
    herbs: [
      { name: '柴胡', property: '微寒 / 苦辛', function: '疏散退热，疏肝解郁，升阳举陷。春行木令，宜舒展肝气。', usageTip: '常用作春茶底，舒畅情绪、化解抑郁。', icon: '🌿' },
      { name: '黄芪', property: '微温 / 甘', function: '补气固表，托毒排脓，利尿生肌。春季防风邪入侵，黄芪能固表防感。', usageTip: '春分前后泡茶，强健阳气屏障。', icon: '🪵' },
      { name: '枸杞叶', property: '凉 / 甘苦', function: '补虚益精，清热明目。春生鲜叶，助清肝火。', usageTip: '适合清晨凉拌或煲汤，明目通气。', icon: '🍃' }
    ],
    recipe: {
      name: '春风和熙 · 玫瑰佛手舒肝茶 & 淮山枸杞骨汤',
      benefit: '健脾开胃，舒肝散瘀。用于春季肝气郁结引起的精神倦怠、食欲不振。',
      ingredients: ['玫瑰花 5 朵', '佛手柑片 3g', '太子参 6g', '鲜淮山 150g', '枸杞子 10g', '猪脊骨 300g'],
      preparation: [
        '玫瑰、佛手和太子参先用温水过洗，置于茶壶中作为随身饮润肝。',
        '猪脊骨沸水汆烫，剔去浮沫，沥干备用。',
        '鲜淮山去皮切段，与生姜片、猪骨一同放入砂锅，加足量清水大火烧开。',
        '后转文火慢炖 1.5 小时，最后 10 分钟撒入枸杞并加入少量食盐，即可享用。'
      ],
      historyQuote: '《饮膳正要》：“春气温，温治以凉，宜食麦、大枣、豉，禁吃辛辣、醇酒之属。”'
    }
  };

  const summerFallback: DietDetails = {
    principle: '夏三月，此谓蕃秀。天地气交，万物华实。夏日炎炎，养生重在“清心涤暑，健脾祛湿，清补消防”。',
    herbs: [
      { name: '荷叶', property: '平 / 甘涩', function: '清热解暑，升发清阳，凉血止血。善清夏季暑湿、除烦解渴。', usageTip: '煮粥、包饭俱佳，能开胃。', icon: '🟢' },
      { name: '麦冬', property: '微寒 / 甘微苦', function: '养阴生津，润肺清心。盛夏汗多耗气伤阴，麦冬可生津。', usageTip: '与五味子泡水（生脉饮），防夏季中暑汗脱。', icon: '🌾' },
      { name: '茯苓', property: '平 / 甘淡', function: '利水渗湿，健脾宁心。祛除夏秋交替时的脾胃黏滞。', usageTip: '磨粉熬粥，利尿健脾最明显。', icon: '🥯' }
    ],
    recipe: {
      name: '清解消暑 · 麦冬冬瓜薏米煲鸭汤',
      benefit: '利尿祛湿，养阴清热。适合长夏暑湿难耐、口干舌燥、身体重滞者。',
      ingredients: ['鲜冬瓜 200g（带皮）', '麦冬 10g', '生薏米 20g', '茯苓 12g', '本地水鸭 400g', '陈皮 1瓣'],
      preparation: [
        '冬瓜外皮洗净，切大块保留冬瓜皮（冬瓜皮祛湿力量特强）。',
        '薏米、麦冬、茯苓提前浸泡 30 分钟。鸭肉斩件汆水，去沫。',
        '炖锅中注水烧沸，放入水鸭、陈皮、生姜以及药材，大火煲滚。',
        '改文火煲炖 1.5 小时，加入冬瓜块继续滚煲 30 分钟。',
        '调盐少量即可。此汤清甜，消暑涤热，滋五脏阴。'
      ],
      historyQuote: '《千金要方》：“夏七十二日，省苦增辛，以养肺气。勿食冷水及大热之物，以防脾伤。”'
    }
  };

  const autumnFallback: DietDetails = {
    principle: '秋三月，此谓容平。天气以急，地气以明。秋风凉燥，防燥护肺为第一要务，“少辛增酸，潜藏生津”。',
    herbs: [
      { name: '百合', property: '微寒 / 甘', function: '养阴润肺，清心安神。秋燥袭人，百合温润肺金，抚平焦躁。', usageTip: '煮糖水、炒鲜芹百合均可，能安神助眠。', icon: '🧅' },
      { name: '玉竹', property: '微寒 / 甘', function: '养阴润燥，生津止渴。滋润皮肤干燥，对干咳极佳。', usageTip: '与沙参一同煲汤，称为“沙参玉竹经典清润汤”。', icon: '🪵' },
      { name: '川贝母', property: '微寒 / 苦甘', function: '清热润肺，化痰止咳。应对秋季燥咳、咽炎、喉干。', usageTip: '研磨入炖雪梨中心，文火蒸之，乃疗咳上药。', icon: '⚪' }
    ],
    recipe: {
      name: '秋金清燥 · 润肺玉竹百合雪梨羹',
      benefit: '极致滋阴。清扫咽干细咳、秋燥导致的皮肤起屑、胃火气逆。',
      ingredients: ['砀山梨 1个', '兰州鲜百合 30g', '玉竹 10g', '银耳 1朵', '川贝粉 2g', '冰糖 适量'],
      preparation: [
        '银耳温水泡发 1 小时，撕碎，洗净沙尘，备用。',
        '雪梨洗净削皮，掏空心部，置于大碗中。',
        '将川贝粉装入梨心深处，周围码放玉竹和雪梨皮以出味。',
        '碗内加入泡好的银耳和清水，入蒸锅大火蒸一小时，至银耳出胶细腻。',
        '最后加入洗净的鲜客百合与极少冰糖，继续蒸 10 分钟，即可食用。'
      ],
      historyQuote: '《慎斋遗书》：“秋防燥气伤肺，宜常服梨汁、百合膏，少吃煎炸辛辣。肝受秋邪，当潜阳养肝。”'
    }
  };

  const winterFallback: DietDetails = {
    principle: '冬三月，此谓闭藏。水冰地坼，无扰乎阳。冬时收藏，当以“去寒就温，避风纳藏，兼调肾气”为主旨。',
    herbs: [
      { name: '人参 (党参)', property: '微温 / 甘苦', function: '大补元气，复脉固脱，补脾益肺。冬日严寒，能激荡生命本源阳气。', usageTip: '体寒虚弱者冬至前后慢参汤，能积蓄未来一年的力量。', icon: '🥕' },
      { name: '当归', property: '温 / 甘辛', function: '补血活血，调经止痛，润肠通便。冬时血寒凝滞，当归能温通血脉。', usageTip: '配生姜羊肉汤（医圣张仲景名方），可去身体顽寒。', icon: '🪵' },
      { name: '肉桂(桂枝)', property: '大热 / 辛甘', function: '补火助阳，散寒止痛，温通经脉。手脚冰凉之温阳良药。', usageTip: '取少量调入热可可、红酒或肉汤中，促进血液循环。', icon: '🪵' }
    ],
    recipe: {
      name: '冬至御寒 · 当归生姜北芪羊肉汤（金匮要略复刻）',
      benefit: '温中补血。极效祛除四肢厥冷、冬日腰膝酸软、脾胃虚寒引起的腹部冷痛。',
      ingredients: ['优质羊肉 300g', '金贵当归 12g', '北黄芪 15g', '优质老生姜 30g（切厚片）', '大枣 5枚'],
      preparation: [
        '精选小肥羊肉，洗净切块，冷水下锅加入料酒、姜片汆水，彻底洗清血污。',
        '当归、黄芪两药用温水冲净，生姜拍裂待用。',
        '炖盅内注入高汤或温水，放入羊脊骨与药材，大火煮滚后盖上。',
        '移入砂锅中，小火长时间慢火隔水炖煮 2 至 2.5 小时。',
        '至肉质极度酥烂、汤汁呈淡金乳色。趁热饮用，全身骨骼发热。'
      ],
      historyQuote: '《金匮要略》：“寒疝腹中痛及胁痛里急者，当归生姜羊肉汤主之。”'
    }
  };

  // Give highly localized variations for key terms
  if (termId === 'lichun' || termId === 'yushui' || termId === 'jingzhe' || termId === 'chunfen') {
    return {
      ...springFallback,
      principle: `「${solarTerms.find(t=>t.id===termId)?.name || '开春'}」养生：春木东起，肝气易亢，故忌酸涩，当吃轻辛甜之物以调和。`,
      recipe: {
        ...springFallback.recipe,
        name: `【${solarTerms.find(t=>t.id===termId)?.name}御膳】玫瑰佛手理气茶（舒通春郁）`
      }
    };
  }

  if (termId === 'lixia' || termId === 'xiaoman' || termId === 'mangzhong' || termId === 'xiazhi') {
    return {
      ...summerFallback,
      principle: `「${solarTerms.find(t=>t.id===termId)?.name || '盛夏'}」养生：暑邪当道，心火偏旺，汗液外流。食膳宜苦中略甜，防暑护津，补泻得当。`,
      recipe: {
        ...summerFallback.recipe,
        name: `【${solarTerms.find(t=>t.id===termId)?.name}御膳】麦冬百合生脉淡粥 & 茯苓莲子汤`
      }
    };
  }

  if (termId === 'liqiu' || termId === 'chushu' || termId === 'bailu' || termId === 'qiufen') {
    return {
      ...autumnFallback,
      principle: `「${solarTerms.find(t=>t.id===termId)?.name || '秋分'}」养生：燥为秋令。肺脏娇弱，喜润恶燥。宜多食银耳雪梨百合，清心平肝，安闲自得。`,
      recipe: {
        ...autumnFallback.recipe,
        name: `【${solarTerms.find(t=>t.id===termId)?.name}御膳】雪梨川贝百合胶汤（温透极润）`
      }
    };
  }

  if (termId === 'lidong' || termId === 'xiaoxue' || termId === 'daxue' || termId === 'dongzhi') {
    return {
      ...winterFallback,
      principle: `「${solarTerms.find(t=>t.id===termId)?.name || '冬至'}」养生：北风呼啸，万物凋零，人体阳气深藏于肾。当以重温大补、驱寒补肾为主，严寒伤骨，注意御温。`,
      recipe: {
        ...winterFallback.recipe,
        name: `【${solarTerms.find(t=>t.id===termId)?.name}御膳】生姜当归黄芪羊骨大补汤（御寒第一方）`
      }
    };
  }

  // Season-based general fallbacks if unspecified
  if (season === 'spring') return springFallback;
  if (season === 'summer') return summerFallback;
  if (season === 'autumn') return autumnFallback;
  return winterFallback;
};

interface SeasonalDietProps {
  activeTerm: SolarTerm;
  isLight: boolean;
}

export const SeasonalDiet: React.FC<SeasonalDietProps> = ({
  activeTerm,
  isLight
}) => {
  const data = getDietDetailsByTermId(activeTerm.id, activeTerm.season);

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: Banner with general Principle of the Season */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors duration-1000 ${
        isLight 
          ? 'bg-[#fcfaf4] border-[#ebdcc1] text-[#7d512a]' 
          : 'bg-stone-900/60 border-stone-850 text-amber-500'
      }`}>
        <Heart className="w-5 h-5 shrink-0 animate-pulse mt-0.5" />
        <div className="space-y-1">
          <span className="text-[11.5px] font-serif font-bold uppercase tracking-wider block">
            ⌛ 岁时养生训诫 ({activeTerm.name}节气气运)
          </span>
          <p className="text-[11px] font-sans leading-relaxed opacity-90">
            {data.principle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* COLUMN A: Core Herbal Botanicals (3 columns on lg) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <h4 className={`text-xs font-serif font-black ${isLight ? 'text-stone-850' : 'text-stone-100'}`}>
            🌱 四时本草 · 应时药籍
          </h4>

          <div className="space-y-3.5 flex-1 flex flex-col justify-between">
            {data.herbs.map((herb) => (
              <div 
                key={herb.name}
                className={`p-3.5 rounded-xl border flex gap-3 transition-colors duration-1000 ${
                  isLight 
                    ? 'bg-white border-stone-200 shadow-sm' 
                    : 'bg-stone-900/35 border-stone-850'
                }`}
              >
                <div className="text-2xl pt-1">{herb.icon}</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[12px] font-serif font-bold ${isLight ? 'text-stone-800' : 'text-stone-200'}`}>
                      {herb.name}
                    </span>
                    <span className="text-[9px] font-mono text-stone-400 px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800">
                      药性: {herb.property}
                    </span>
                  </div>
                  <p className="text-[10.5px] font-sans text-stone-500 dark:text-stone-400 leading-snug">
                    <strong className="font-serif font-medium text-amber-900 dark:text-amber-400">功效：</strong>
                    {herb.function}
                  </p>
                  <p className="text-[10px] italic font-sans text-stone-400">
                    💡 使用：{herb.usageTip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN B: Traditional Chinese Diet Recipe Formulation Card (7 columns on lg) */}
        <div className="md:col-span-12 lg:col-span-7 flex flex-col gap-4">
          <h4 className={`text-xs font-serif font-black ${isLight ? 'text-stone-850' : 'text-stone-100'}`}>
            🥘 芳膳秘谱 · 砂锅温火煎
          </h4>

          <div className={`flex-1 p-5 rounded-2xl border flex flex-col justify-between transition-colors duration-1000 ${
            isLight 
              ? 'bg-[#faf8f2] border-[#ebdca2] text-stone-800 shadow-md' 
              : 'bg-stone-950/80 border-stone-850 text-stone-200'
          }`}>
            
            {/* Header detail */}
            <div className="border-b border-stone-200/50 dark:border-stone-900 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-amber-700" />
                <span className={`text-xs font-serif font-bold italic text-amber-700`}>
                  {data.recipe.name}
                </span>
              </div>
              <span className="text-[9px] font-mono text-stone-400 block tracking-widest uppercase">
                御膳房监制
              </span>
            </div>

            {/* Benefit statement */}
            <div className="my-3 text-[11px] font-sans text-stone-500 bg-stone-900/5 dark:bg-stone-900/30 p-2.5 rounded-lg border border-stone-200/30 dark:border-stone-800">
              <span className="font-semibold block font-serif text-[10.5px] text-amber-900 dark:text-amber-400 mb-0.5">🌸 养生古方：</span>
              {data.recipe.benefit}
            </div>

            {/* Ingredients block */}
            <div className="mb-3">
              <span className="text-[11px] font-serif font-bold text-stone-500 block mb-1.5">📋 食药配伍：</span>
              <div className="flex flex-wrap gap-1.5">
                {data.recipe.ingredients.map((ing, index) => (
                  <span 
                    key={index} 
                    className="text-[10px] font-serif bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-2 py-1 rounded-lg shadow-sm font-medium"
                  >
                    🍲 {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* Preparation Steps */}
            <div>
              <span className="text-[11px] font-serif font-bold text-stone-500 block mb-1.5">🏺 慢火煎制方法：</span>
              <ul className="space-y-1.5 text-[10.5px] font-sans text-stone-500 dark:text-stone-400">
                {data.recipe.preparation.map((step, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="font-mono text-amber-600 font-bold shrink-0">{idx + 1}.</span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Foot Quote from classics */}
            {data.recipe.historyQuote && (
              <div className="border-t border-stone-200/40 dark:border-stone-900/60 mt-4 pt-3 text-right">
                <span className="text-[9.5px] font-serif text-[#9d5c1e] italic opacity-85">
                  {data.recipe.historyQuote}
                </span>
              </div>
            )}
            
          </div>
        </div>

      </div>

      {/* Advisory disclaimer in fine text */}
      <div className="flex items-center gap-1.5 text-[9.5px] text-stone-400 font-sans border-t border-stone-200/20 dark:border-stone-900 pt-3">
        <AlertCircle size={10} className="shrink-0 text-amber-600" />
        <span>提示：岁时药膳调理侧重于节气扶正，孕妇及体质极特殊者请遵医嘱进行药食调配。拂琴安神，慢火温吞调理为佳。</span>
      </div>
    </div>
  );
};
