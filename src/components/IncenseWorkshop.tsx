import React, { useState, useEffect } from 'react';
import { Wind, RotateCcw, Flame, Sparkles, AlertCircle, Bookmark } from 'lucide-react';
import { SolarTerm } from '../types';

interface ScentIngredient {
  name: string;
  enName: string;
  category: 'woody' | 'floral' | 'cooling' | 'spicy' | 'medicinal';
  desc: string;
  color: string;
  // Factor weights for the live spider radar/bar score
  profile: {
    woody: number;
    floral: number;
    cooling: number;
    spicy: number;
    medicinal: number;
  };
}

const INGREDIENTS: ScentIngredient[] = [
  {
    name: '沈香 (Agarwood)',
    enName: 'Agarwood',
    category: 'woody',
    desc: '海南黄熟，气韵深沉，蜜糯温凉，擅于归入丹田，养气定神之极品。',
    color: '#3e2723',
    profile: { woody: 10, floral: 1, cooling: 2, spicy: 0, medicinal: 4 }
  },
  {
    name: '檀香 (Sandalwood)',
    enName: 'Sandalwood',
    category: 'woody',
    desc: '老山白檀，奶甜温润，醇厚高洁，香气横溢，可除一切面容垢秽。',
    color: '#8d6e63',
    profile: { woody: 9, floral: 2, cooling: 1, spicy: 1, medicinal: 0 }
  },
  {
    name: '龙脑香 (Borneol)',
    enName: 'Borneol',
    category: 'cooling',
    desc: '梅片天然结晶，辛凉清烈，直透泥丸，辟邪涤秽，令人神识一清。',
    color: '#e0f2f1',
    profile: { woody: 0, floral: 0, cooling: 10, spicy: 3, medicinal: 5 }
  },
  {
    name: '降真香 (Lakawood)',
    enName: 'Lakawood',
    category: 'medicinal',
    desc: '鸡骨香，紫藤木心，香气辛甜温雅，燃之招鹤，清血行气，疗愈身心。',
    color: '#5d4037',
    profile: { woody: 6, floral: 0, cooling: 0, spicy: 6, medicinal: 9 }
  },
  {
    name: '桂花 (Osmanthus)',
    enName: 'Osmanthus',
    category: 'floral',
    desc: '九秋金桂，清雅香甜，十里飘飘，极具秋分暖阳之慰。',
    color: '#ffb300',
    profile: { woody: 1, floral: 10, cooling: 0, spicy: 2, medicinal: 1 }
  },
  {
    name: '茉莉 (Jasmine)',
    enName: 'Jasmine',
    category: 'floral',
    desc: '伏天双瓣，冰肌玉骨，甜美清扬，拂暑消忧，消释内心暗涌。',
    color: '#f5f5f5',
    profile: { woody: 0, floral: 10, cooling: 3, spicy: 0, medicinal: 0 }
  },
  {
    name: '绿茶 (Green Tea)',
    enName: 'Green Tea',
    category: 'cooling',
    desc: '清明新绿，茶香幽微，沁人心脾，荡涤杂念与闷湿。',
    color: '#a5d6a7',
    profile: { woody: 2, floral: 3, cooling: 6, spicy: 0, medicinal: 2 }
  },
  {
    name: '松针 (Pine Needle)',
    enName: 'Pine Needle',
    category: 'woody',
    desc: '深冬松针，清冷凛冽，松脂芬芳，百折不挠之劲，提神振心。',
    color: '#2e7d32',
    profile: { woody: 8, floral: 0, cooling: 5, spicy: 1, medicinal: 2 }
  },
  {
    name: '丁香 (Clove)',
    enName: 'Clove',
    category: 'spicy',
    desc: '公丁香，气雄悍烈，温中降逆，香气带甜，调和万香之骨。',
    color: '#795548',
    profile: { woody: 3, floral: 1, cooling: 0, spicy: 10, medicinal: 6 }
  }
];

interface IncenseWorkshopProps {
  activeTerm: SolarTerm;
  isLight: boolean;
  onTriggerBrewing?: (color: string) => void;
}

export const IncenseWorkshop: React.FC<IncenseWorkshopProps> = ({
  activeTerm,
  isLight,
  onTriggerBrewing
}) => {
  // Proportions in percentage (0 to 100)
  const [mix, setMix] = useState<{ [key: string]: number }>({
    '沈香 (Agarwood)': 50,
    '檀香 (Sandalwood)': 30,
    '龙脑香 (Borneol)': 20
  });

  const [activePresetApplied, setActivePresetApplied] = useState<boolean>(false);
  const [brewingStage, setBrewingStage] = useState<'idle' | 'grinding' | 'combining' | 'testing' | 'finished'>('idle');
  const [progress, setProgress] = useState(0);

  // Audio synthesis feedback
  const playSoundEffect = (type: 'grind' | 'gong' | 'finish') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      if (type === 'gong') {
        // High quality bronze bell synthesis
        const f0 = 220; // low soothing fundamental
        const overtones = [1.0, 1.5, 2.13, 2.72, 3.48, 4.2];
        const ampGains = [0.8, 0.4, 0.3, 0.2, 0.1, 0.05];

        overtones.forEach((ratio, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f0 * ratio, now);
          
          // slow decay
          gain.gain.setValueAtTime(ampGains[idx] * 0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 4);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(now);
          osc.stop(now + 4);
        });
      } else if (type === 'grind') {
        // Soft repetitive rustling sand/grinding sound
        const bufferSize = ctx.sampleRate * 1.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, now);
        filter.Q.setValueAtTime(10, now);

        // LFO sweep frequencies
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.8, now); // 0.8 Hz grind motion
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(200, now);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(0.05, now + 0.2);
        gainNode.gain.linearRampToValueAtTime(0.05, now + 1.2);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        source.start(now);
        lfo.start(now);
        source.stop(now + 1.5);
        lfo.stop(now + 1.5);
      } else if (type === 'finish') {
        // High bell twinkle sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.3);
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
      }
    } catch (e) {
      console.warn("Sound blocked", e);
    }
  };

  // Quick Preset application based on what the Active Term is!
  const applyActiveTermPreset = () => {
    // Collect ingredients based on activeTerm notes or fallback
    const top = activeTerm.scentProfile.topNotes[0];
    const mid = activeTerm.scentProfile.middleNotes[0];
    const base = activeTerm.scentProfile.baseNotes[0];

    // Find closest matches
    const presetMix: { [key: string]: number } = {};
    
    // Map active term top/mid/base to what we have in workshop
    // We match substrings, e.g. "桃" in "桃花", "绿茶" in "绿茶", "沈香" in "沉香" (be forgiving with typos)
    const normalizedName = (n: string) => n.replace('沈', '沉');
    
    const matchedTop = INGREDIENTS.find(i => normalizedName(i.name).includes(top) || top?.includes(i.name.slice(0,2))) || INGREDIENTS[6]; // Green tea
    const matchedMid = INGREDIENTS.find(i => normalizedName(i.name).includes(mid) || mid?.includes(i.name.slice(0,2))) || INGREDIENTS[4]; // Osmanthus
    const matchedBase = INGREDIENTS.find(i => normalizedName(i.name).includes(base) || base?.includes(i.name.slice(0,2))) || INGREDIENTS[0]; // Agarwood

    presetMix[matchedBase.name] = 50;
    presetMix[matchedMid.name] = 30;
    presetMix[matchedTop.name] = 20;

    setMix(presetMix);
    setActivePresetApplied(true);
    playSoundEffect('finish');
  };

  // Adjust portion of a specific ingredient, and auto-normalize others smoothly
  const handleSliderChange = (targetIngName: string, newValue: number) => {
    setMix(prev => {
      const keys = Object.keys(prev);
      
      // If it's a new ingredient we added with 0, add it
      if (!keys.includes(targetIngName)) {
        const next = { ...prev, [targetIngName]: newValue };
        // Normalize
        return normalizeMix(next, targetIngName);
      }

      const next = { ...prev, [targetIngName]: newValue };
      return normalizeMix(next, targetIngName);
    });
    setActivePresetApplied(false);
  };

  // Normalize proportions so that the total sum stays strictly at 100%
  const normalizeMix = (currentMix: { [key: string]: number }, lockedKey: string) => {
    const keys = Object.keys(currentMix);
    const lockedValue = currentMix[lockedKey];
    
    // Remaining portion to distribute
    const remainingToDistribute = 100 - lockedValue;
    
    // Sum of other ingredients
    const otherKeys = keys.filter(k => k !== lockedKey);
    const sumOthers = otherKeys.reduce((acc, k) => acc + currentMix[k], 0);

    const result: { [key: string]: number } = {};
    result[lockedKey] = lockedValue;

    if (sumOthers === 0) {
      // Divide equally
      otherKeys.forEach(k => {
        result[k] = Math.round((remainingToDistribute / otherKeys.length) * 10) / 10;
      });
    } else {
      otherKeys.forEach(k => {
        const share = currentMix[k] / sumOthers;
        result[k] = Math.round(remainingToDistribute * share * 10) / 10;
      });
    }

    // Double check totals and adjust rounding error in locked ingredient
    let sum = Object.values(result).reduce((a, b) => a + b, 0);
    if (sum !== 100) {
      const error = 100 - sum;
      // Adjust the other highest ingredient
      const highestOther = otherKeys.length > 0 
        ? otherKeys.reduce((a, b) => result[a] > result[b] ? a : b)
        : null;
      if (highestOther) {
        result[highestOther] = Math.round((result[highestOther] + error) * 10) / 10;
      } else {
        result[lockedKey] = Math.max(0, Math.min(100, result[lockedKey] + error));
      }
    }

    // Strip out zero weight ingredients to keep it tidy, keeping at least 2 ingredients
    const cleansedResult: { [key: string]: number } = {};
    Object.keys(result).forEach(k => {
      if (result[k] > 0 || k === lockedKey || Object.keys(cleansedResult).length < 2) {
        cleansedResult[k] = result[k];
      }
    });

    return cleansedResult;
  };

  // Remove an ingredient
  const handleRemove = (name: string) => {
    setMix(prev => {
      const keys = Object.keys(prev);
      if (keys.length <= 2) return prev; // Keep at least 2
      const next = { ...prev };
      delete next[name];
      
      // Normalize remaining keys to 100%
      const newSum = (Object.values(next) as number[]).reduce((a, b) => a + b, 0);
      const result: { [key: string]: number } = {};
      Object.keys(next).forEach(k => {
        result[k] = Math.round(((next[k] as number) / newSum) * 100 * 10) / 10;
      });
      return result;
    });
    setActivePresetApplied(false);
  };

  // Add a new ingredient to mix
  const handleAddIngredient = (ing: ScentIngredient) => {
    if (Object.keys(mix).includes(ing.name)) return;
    setMix(prev => {
      const next = { ...prev, [ing.name]: 10 };
      return normalizeMix(next, ing.name);
    });
    setActivePresetApplied(false);
    playSoundEffect('finish');
  };

  // Computed Olfactory scores (Radar metrics equivalent)
  const calculateOlfactoryProfile = () => {
    let woody = 0;
    let floral = 0;
    let cooling = 0;
    let spicy = 0;
    let medicinal = 0;

    Object.entries(mix).forEach(([name, wt]) => {
      const ing = INGREDIENTS.find(i => i.name === name);
      if (ing) {
        const rel = (wt as number) / 100;
        woody += ing.profile.woody * rel;
        floral += ing.profile.floral * rel;
        cooling += ing.profile.cooling * rel;
        spicy += ing.profile.spicy * rel;
        medicinal += ing.profile.medicinal * rel;
      }
    });

    return {
      woody: Math.round(woody * 10) / 10,
      floral: Math.round(floral * 10) / 10,
      cooling: Math.round(cooling * 10) / 10,
      spicy: Math.round(spicy * 10) / 10,
      medicinal: Math.round(medicinal * 10) / 10
    };
  };

  const scores = calculateOlfactoryProfile();

  // Get poetic scent blend name based on highest attributes
  const getOlfactoryBlendName = () => {
    const highest = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);
    const presetName = `${activeTerm.name}·`;
    switch (highest[0]) {
      case 'woody':
        return presetName + '「静卧青松」古香方';
      case 'floral':
        return presetName + '「十里玉容」幽花调';
      case 'cooling':
        return presetName + '「雪晴折梅」冰魄香';
      case 'spicy':
        return presetName + '「赤焰温灸」暖骨香';
      case 'medicinal':
        return presetName + '「天一辟毒」愈木屑';
      default:
        return presetName + '时令专属香';
    }
  };

  // Brewing Timeline
  useEffect(() => {
    let timer: any;
    if (brewingStage === 'grinding') {
      playSoundEffect('grind');
      timer = setInterval(() => {
        setProgress(p => Math.min(33, p + 2));
      }, 100);
    } else if (brewingStage === 'combining') {
      timer = setInterval(() => {
        setProgress(p => Math.min(66, p + 2));
      }, 100);
    } else if (brewingStage === 'testing') {
      timer = setInterval(() => {
        setProgress(p => Math.min(100, p + 2.5));
      }, 100);
    }
    return () => clearInterval(timer);
  }, [brewingStage]);

  // Handle stage transitions and callbacks safely outside the state updater loop
  useEffect(() => {
    if (brewingStage === 'grinding' && progress >= 33) {
      setBrewingStage('combining');
    } else if (brewingStage === 'combining' && progress >= 66) {
      setBrewingStage('testing');
    } else if (brewingStage === 'testing' && progress >= 100) {
      setBrewingStage('finished');
      playSoundEffect('finish');
      if (onTriggerBrewing) {
        const highestWtIng = Object.entries(mix).reduce((a, b) => a[1] > b[1] ? a : b);
        const ing = INGREDIENTS.find(i => i.name === highestWtIng[0]);
        onTriggerBrewing(ing?.color || '#ebcca0');
      }
    }
  }, [progress, brewingStage, mix, onTriggerBrewing]);

  const handleStartBrewing = () => {
    playSoundEffect('gong');
    setProgress(0);
    setBrewingStage('grinding');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[460px] relative items-stretch">
      
      {/* COLUMN 1: Custom Blending Panel (Sliders) */}
      <div className="flex-1 space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`text-xs font-serif font-black ${isLight ? 'text-stone-850' : 'text-stone-200'}`}>
              🏺 芳名与香草分量配比 (配制总量 100%)
            </h4>

            <button
              type="button"
              onClick={applyActiveTermPreset}
              className={`px-2.5 py-1 text-[10px] font-serif rounded-lg border cursor-pointer hover:scale-[1.01] transition-all flex items-center gap-1 ${
                activePresetApplied 
                  ? 'bg-amber-700 text-white border-amber-800' 
                  : 'bg-amber-900/10 text-amber-700 hover:bg-amber-900/15 border-amber-600/20'
              }`}
            >
              <Sparkles size={10} />
              <span>应时推荐:「{activeTerm.incenseName}」配比</span>
            </button>
          </div>

          {/* Active Mix Items with Sliders */}
          <div className="space-y-3">
            {Object.entries(mix).map(([name, weight]) => {
              const ing = INGREDIENTS.find(i => i.name === name);
              if (!ing) return null;
              
              return (
                <div 
                  key={name}
                  className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-colors duration-1000 ${
                    isLight ? 'bg-white border-stone-200' : 'bg-stone-900/40 border-stone-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full block border border-stone-500/10" style={{ backgroundColor: ing.color }} />
                      <span className={`text-[11.5px] font-serif font-bold ${isLight ? 'text-stone-850' : 'text-stone-100'}`}>
                        {ing.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11.5px] font-mono font-bold text-amber-600">{weight}%</span>
                      {Object.keys(mix).length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemove(name)}
                          className="text-[10px] text-stone-400 hover:text-red-500 cursor-pointer p-0.5"
                          title="去药香"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-stone-500 dark:text-stone-400 font-sans leading-snug">
                    {ing.desc}
                  </p>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={weight}
                    onChange={(e) => handleSliderChange(name, parseFloat(e.target.value))}
                    className="w-full accent-amber-600 h-1 bg-stone-200 dark:bg-stone-800 rounded-lg cursor-ew-resize mt-1"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Add More Ingredients Cabinet */}
        <div className={`mt-4 p-3 rounded-xl border ${isLight ? 'bg-[#ebdcb9]/20 border-[#dfcaa4]' : 'bg-stone-950/20 border-stone-900'}`}>
          <span className="text-[10.5px] font-serif font-bold text-stone-500 block mb-2">📦 药格香架（可添加其他奇木名草）</span>
          <div className="flex flex-wrap gap-1.5">
            {INGREDIENTS.filter(i => !Object.keys(mix).includes(i.name)).map(ing => (
              <button
                key={ing.name}
                type="button"
                onClick={() => handleAddIngredient(ing)}
                className={`text-[10.5px] px-2.5 py-1 rounded-full border cursor-pointer hover:border-amber-600/40 transition-colors ${
                  isLight 
                    ? 'bg-white hover:bg-stone-100 text-stone-600 border-stone-200' 
                    : 'bg-stone-900 hover:bg-stone-800 text-stone-400 border-stone-800'
                }`}
              >
                ＋ {ing.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* COLUMN 2: Olfactory Profile & Blending Ceremony Animation */}
      <div className="w-full lg:w-[320px] flex flex-col justify-between self-stretch bg-stone-900/5 dark:bg-stone-950/40 p-4 rounded-2xl border border-stone-200/50 dark:border-stone-900/80 transition-colors duration-1000">
        
        {/* Olfactory radar/score summary */}
        <div>
          <span className="text-[10.5px] font-serif font-bold text-stone-500 block mb-3">🎐 合成风气五度评估</span>
          <div className="space-y-2.5">
            {[
              { label: '🪵 古法木香 (Woody)', score: scores.woody, color: 'bg-orange-700/85' },
              { label: '🌸 清芬花气 (Floral)', score: scores.floral, color: 'bg-rose-600/85' },
              { label: '❄️ 冰雪清凉 (Cooling)', score: scores.cooling, color: 'bg-teal-500/85' },
              { label: '🌶️ 辛温行散 (Spicy)', score: scores.spicy, color: 'bg-amber-600/85' },
              { label: '🌿 养本中药 (Medicinal)', score: scores.medicinal, color: 'bg-emerald-600/85' }
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-[10px] text-stone-400 font-sans">
                  <span>{item.label}</span>
                  <span className="font-mono">{item.score} / 10</span>
                </div>
                <div className="h-1.5 w-full bg-stone-200/50 dark:bg-stone-900/60 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.score * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ceremony Animation Core */}
        <div className="border-t border-stone-200/60 dark:border-stone-900/80 mt-4 pt-4 flex-1 flex flex-col justify-center">
          {brewingStage === 'idle' && (
            <div className="text-center p-4">
              <div className="w-16 h-16 rounded-full border border-dashed border-amber-600/40 mx-auto flex items-center justify-center mb-3 group animate-pulse">
                <Flame className="text-amber-700 group-hover:scale-110 transition-transform cursor-pointer" size={28} />
              </div>
              <p className="text-[11px] font-serif text-stone-500 leading-relaxed max-w-[200px] mx-auto">
                气味已定。击钵燃烛，将名香送入风流雅合炉。
              </p>
              <button
                type="button"
                onClick={handleStartBrewing}
                className="mt-4 px-5 py-2 w-full rounded-xl text-[11.5px] font-serif font-black tracking-widest cursor-pointer hover:scale-[1.02] active:scale-95 transition-all bg-amber-800 text-white hover:bg-amber-900 flex items-center justify-center gap-1.5 shadow-md"
              >
                <Flame size={12} />
                <span>敲磬开炉 · 调香仪式</span>
              </button>
            </div>
          )}

          {/* Grinding /Combining / Testing visual progress bar */}
          {(brewingStage === 'grinding' || brewingStage === 'combining' || brewingStage === 'testing') && (
            <div className="p-4 flex flex-col justify-center items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-600"></span>
              </span>
              
              <div className="text-center">
                <h5 className="font-serif text-xs font-bold text-amber-700 animate-pulse">
                  {brewingStage === 'grinding' ? '🥣 研磨粉屑：将名贵药草徐徐调磨...' :
                   brewingStage === 'combining' ? '🏺 依序合香：药尘在炉火中细细揉合...' :
                   '💨 纳烟试香：引香篆自通天之眼升华...'}
                </h5>
                <span className="text-[10px] text-stone-400 block font-mono mt-1">{Math.round(progress)}% 完成</span>
              </div>

              <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden mt-1 max-w-[220px]">
                <div 
                  className="h-full bg-amber-700 transition-all duration-100 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Scent Result Card representation */}
          {brewingStage === 'finished' && (
            <div className="animate-fade-in text-center p-3">
              <div 
                className={`border border-[#dfcca0] p-4 rounded-xl shadow-xl space-y-2 relative overflow-hidden transition-all duration-1000 ${
                  isLight ? 'bg-[#fdfcf9]' : 'bg-stone-900/95'
                }`}
                style={{ borderTop: `4px solid ${Object.values(mix).length > 0 ? INGREDIENTS.find(i=>i.name === Object.keys(mix)[0])?.color : '#b45309'}` }}
              >
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-20">
                  <Bookmark size={16} />
                </div>

                <div className="text-[9.5px] uppercase font-mono tracking-widest text-[#9d5c1e] text-center border-b border-stone-200/50 pb-1">
                  廿四香笺 · 专属法造
                </div>

                <h4 className="font-serif font-black text-sm text-stone-800 dark:text-stone-100 tracking-wider">
                  {getOlfactoryBlendName()}
                </h4>

                <div className="flex items-center justify-center gap-1 py-1">
                  {Object.entries(mix).slice(0, 3).map(([k, v]) => (
                    <span key={k} className="text-[8px] bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 px-1.5 py-0.5 rounded text-stone-500">
                      {k.split(' ')[0]} {Math.round(v as number)}%
                    </span>
                  ))}
                </div>

                <p className="text-[10px] text-stone-500 italic font-sans py-1 leading-normal text-center">
                  “纳天地五行归结，烟气似春水破冰，能使六根寂静，定心安神。”
                </p>

                <div className="flex items-center justify-between text-[9px] text-[#9d5c1e] font-serif border-t border-stone-200/50 pt-1.5">
                  <span>时序 affinity: {activeTerm.name}</span>
                  <span className="font-mono">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setBrewingStage('grinding')}
                  className="flex-1 py-1 px-2.5 rounded-lg border text-[10.5px] text-stone-500 hover:text-stone-800 border-stone-300 dark:border-stone-800 bg-stone-900/5 hover:bg-stone-900/10 cursor-pointer transition-colors font-serif flex items-center justify-center gap-1"
                >
                  <RotateCcw size={10} />
                  <span>重调香</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBrewingStage('idle')}
                  className="flex-1 py-1 px-2.5 rounded-lg border text-[10.5px] text-[#9d5c1e] hover:text-amber-950 border-[#eadbad] bg-[#f9f5e3]/60 hover:bg-[#efeac7] cursor-pointer transition-colors font-serif flex items-center justify-center gap-1"
                >
                  <Wind size={10} />
                  <span>收纳香牌</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
