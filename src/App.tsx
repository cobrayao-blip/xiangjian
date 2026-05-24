import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Compass,
  BookOpen,
  Volume2,
  VolumeX,
  Wind,
  MessageSquare,
} from 'lucide-react';
import { solarTerms } from './solarTermsData';
import { ScentWheelMap } from './components/ScentWheelMap';
import { IncenseWorkshop } from './components/IncenseWorkshop';
import { SeasonalDiet } from './components/SeasonalDiet';
import { MeditationBowl } from './components/MeditationBowl';
import { ChatDrawer, CHAT_DRAWER_WIDTH_PX } from './components/ChatDrawer';
import { ProductImage } from './components/ProductImage';
import { useSeasonalAmbientNoise } from './hooks/useSeasonalAmbientNoise';
import { useIncenseSmokeCanvas } from './hooks/useIncenseSmokeCanvas';
import { useAmbientWind } from './hooks/useAmbientWind';
import { useChat } from './hooks/useChat';
import { getSeasonNoiseLabel } from './audio/seasonalWhiteNoise';
import { getThemeStyles, type LayoutTheme } from './theme/seasonThemes';
import { hexToRgba } from './utils/color';
import { getSolarTermIdForDate } from './utils/solarTermDate';

const defaultTermId = getSolarTermIdForDate();

export default function App() {
  const [activeTermId, setActiveTermId] = useState<string>(defaultTermId);
  const activeTerm = useMemo(
    () => solarTerms.find((t) => t.id === activeTermId) ?? solarTerms[0],
    [activeTermId],
  );
  const [isBrewing, setIsBrewing] = useState<boolean>(false);
  const [customSmokeColor, setCustomSmokeColor] = useState<string | null>(null);
  const [meditationNoisePlaying, setMeditationNoisePlaying] = useState<boolean>(false);
  const [meditationNoiseVolume, setMeditationNoiseVolume] = useState<number>(0.3);
  const [activeTab, setActiveTab] = useState<
    'scent' | 'poem' | 'products' | 'chart' | 'workshop' | 'diet' | 'meditation'
  >('scent');
  const [searchTermQuery, setSearchTermQuery] = useState<string>('');
  const [termFilterSeason, setTermFilterSeason] = useState<
    'all' | 'spring' | 'summer' | 'autumn' | 'winter'
  >('all');
  const [layoutTheme, setLayoutTheme] = useState<LayoutTheme>(
    () => (solarTerms.find((t) => t.id === defaultTermId) ?? solarTerms[0]).season,
  );
  const [pageVisible, setPageVisible] = useState(() =>
    typeof document !== 'undefined' ? !document.hidden : true,
  );

  const chat = useChat(activeTermId, setActiveTermId);
  const { toggleMute, playBrewSound, isMuted } = useAmbientWind(isBrewing);

  useEffect(() => {
    const onVis = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    setCustomSmokeColor(null);
    setLayoutTheme(activeTerm.season);
    setIsBrewing(true);
    const timer = setTimeout(() => setIsBrewing(false), 8000);
    return () => clearTimeout(timer);
  }, [activeTermId, activeTerm.season]);

  const smokeEnabled = activeTab === 'scent' && pageVisible;
  const canvasRef = useIncenseSmokeCanvas({
    enabled: smokeEnabled,
    isBrewing,
    smokeColor: customSmokeColor || activeTerm.color || '#ebd2a0',
  });

  const ambientNoiseSeason = activeTerm.season;

  useSeasonalAmbientNoise({
    season: ambientNoiseSeason,
    enabled: meditationNoisePlaying,
    volume: meditationNoiseVolume,
  });

  // Filter solar terms list based on search/season
  const filteredTerms = solarTerms.filter(t => {
    const matchesSearch = t.name.includes(searchTermQuery) || t.englishName.toLowerCase().includes(searchTermQuery.toLowerCase()) || t.incenseName.includes(searchTermQuery);
    const matchesSeason = termFilterSeason === 'all' || t.season === termFilterSeason;
    return matchesSearch && matchesSeason;
  });

  const termColor = activeTerm.color || '#ebd2a0';
  const styles = useMemo(
    () => getThemeStyles(layoutTheme, termColor),
    [layoutTheme, termColor],
  );

  return (
    <div
      style={{ '--drawer-w': `${CHAT_DRAWER_WIDTH_PX}px` } as React.CSSProperties}
      className={`min-h-screen ${styles.bodyBg} flex flex-col font-sans relative overflow-hidden transition-[padding,colors] duration-300 ease-out ${
        chat.isChatExpanded ? 'lg:[padding-right:var(--drawer-w)]' : ''
      }`}
    >
      {/* Decorative Seasonal Atmosphere Fog - changing color dynamically with the active solar term */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${hexToRgba(termColor, 0.18)} 0, transparent 75%)`
        }}
      />
      
      {/* Color Accent line that matches the selected term's traditional hue */}
      <div 
        className="absolute top-0 left-0 w-full h-1 transition-all duration-1000 z-20"
        style={{
          background: `linear-gradient(to right, ${hexToRgba(termColor, 0.2)}, ${termColor}, ${hexToRgba(termColor, 0.2)})`
        }}
      />

      {/* Main Header with responsive dynamic background */}
      <header className={`border-b ${styles.cardBorder} ${styles.headerBg} backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 z-10 transition-colors duration-1000`}>
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center border shadow-inner transition-all duration-1000"
            style={{
              backgroundColor: termColor,
              borderColor: hexToRgba(termColor, 0.3)
            }}
          >
            <span className="font-serif font-bold text-lg text-stone-900 tracking-widest leading-none">笺</span>
          </div>
          <div>
            <h1 className={`font-serif text-xl font-bold tracking-widest ${styles.headerText} flex items-center gap-2`}>
              廿四香笺
              <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-amber-900/10 text-amber-700/80 font-normal tracking-wider border border-amber-600/10">东方雅致智能体</span>
            </h1>
            <p className={`text-xs ${styles.headerSubtitle} mt-0.5`}>融合中国传统二十四节气与香道美学 · 智能心愈物语</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => chat.setIsChatExpanded(true)}
          className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border ${styles.cardBorder} ${styles.presetBtn} text-xs font-serif cursor-pointer transition-colors`}
          aria-label="打开芳华香灵对话"
        >
          <MessageSquare size={16} />
          <span className="hidden sm:inline">与香灵倾谈</span>
        </button>
      </header>

      {/* Split screen canvas structure */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 min-h-0">
        
        {/* LEFT COLUMN: 24 Solar terms list and detail (Bento Grid) - 7 columns */}
        <section className="lg:col-span-12 flex flex-col gap-6 min-h-0">
          
          {/* Horizontal Scroller for the 24 terms */}
          <div className={`${styles.cardBg} rounded-3xl border ${styles.cardBorder} p-3.5 md:p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col gap-3 transition-colors duration-1000`}>
            {/* Inline Title, Search and Season Filter Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/40 dark:border-stone-850/40">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 flex-1">
                <div className="flex items-center gap-1.5 shrink-0">
                  <Compass size={14} className="text-amber-600 animate-spin-slow" />
                  <h2 className="text-xs font-serif font-bold tracking-widest text-[#937b51]">二十四气 · 四时岁首</h2>
                </div>
                <div className="relative flex-1 max-w-[200px] w-full">
                  <input
                    type="text"
                    placeholder="搜索节气、香调、本草..."
                    value={searchTermQuery}
                    onChange={(e) => setSearchTermQuery(e.target.value)}
                    className={`w-full bg-transparent border-b ${
                      styles.isLight 
                        ? 'border-amber-900/15 text-stone-800 focus:border-amber-700/80' 
                        : 'border-stone-800 text-stone-200 focus:border-amber-650'
                    } py-0.5 px-1 text-[11px] focus:outline-none transition-colors duration-300 font-sans`}
                  />
                </div>
              </div>
              
              {/* Compact Poetic Tab list of seasons */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
                {(['all', 'spring', 'summer', 'autumn', 'winter'] as const).map((season, sIdx) => {
                  const labels = { 
                    all: '🧭 全部', 
                    spring: '🌸 芳春', 
                    summer: '🍃 盛夏', 
                    autumn: '🍁 金秋', 
                    winter: '❄️ 隆冬' 
                  };
                  const isSeasonActive = termFilterSeason === season;
                  return (
                    <React.Fragment key={season}>
                      {sIdx > 0 && <span className="text-[10px] text-stone-300 dark:text-stone-800 select-none">·</span>}
                      <button
                        type="button"
                        onClick={() => {
                          setTermFilterSeason(season);
                          if (season !== 'all') {
                            setLayoutTheme(season);
                            const firstTermOfSeason = solarTerms.find(t => t.season === season);
                            if (firstTermOfSeason) {
                              setActiveTermId(firstTermOfSeason.id);
                            }
                          }
                        }}
                        className={`text-[11px] font-serif tracking-widest cursor-pointer transition-colors px-1 py-0.5 whitespace-nowrap ${
                          isSeasonActive 
                            ? (styles.isLight ? 'text-amber-800 font-bold underline decoration-amber-600/40 underline-offset-4' : 'text-amber-400 font-medium underline decoration-amber-600/40 underline-offset-4')
                            : 'text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300'
                        }`}
                      >
                        {labels[season].substring(2)}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* List container without ugly scrollbar */}
            <div 
              className="flex gap-2 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredTerms.length === 0 ? (
                <div className="text-xs text-stone-550 py-4 w-full text-center font-sans">对应搜索没有查到香笺节气</div>
              ) : (
                filteredTerms.map(term => {
                  const isActive = term.id === activeTermId;
                  const termIndex = solarTerms.findIndex(t => t.id === term.id) + 1;
                  const formattedIndex = termIndex < 10 ? `0${termIndex}` : `${termIndex}`;
                  
                  // Extract season hover border color
                  const seasonColorClass = 
                    term.season === 'spring' ? 'hover:border-emerald-700/60 hover:bg-emerald-500/5' : 
                    term.season === 'summer' ? 'hover:border-teal-600/60 hover:bg-teal-500/5' : 
                    term.season === 'autumn' ? 'hover:border-amber-650/60 hover:bg-amber-500/5' : 
                    'hover:border-blue-500/60 hover:bg-blue-500/5';

                  return (
                    <button
                      key={term.id}
                      type="button"
                      onClick={() => setActiveTermId(term.id)}
                      className={`flex-shrink-0 cursor-pointer text-center px-1.5 py-2 rounded-xl border transition-all flex flex-col justify-between items-center w-14 h-[72px] ${
                        isActive 
                          ? `${styles.activeTermButton} ring-1 ring-amber-500/10 scale-102` 
                          : `${styles.inactiveTermButton} ${seasonColorClass}`
                      }`}
                    >
                      <span className="font-mono text-[9px] tracking-tighter opacity-75">{formattedIndex}</span>
                      <span className="font-serif text-xs font-bold tracking-widest leading-none my-1">{term.name}</span>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: term.color }} />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Detailed Term Showcase Bento Block */}
          <div className={`${styles.cardBg} rounded-2xl border ${styles.cardBorder} flex-1 flex flex-col overflow-hidden shadow-md transition-colors duration-1000`}>
            
            {/* Visual Header displaying current Solar Term atmosphere */}
            <div className="p-6 relative overflow-hidden border-b border-stone-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-stone-950 to-[#1c1d24]">
              {/* Seasonal glowing orb */}
              <div 
                className="absolute right-0 top-0 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-1000"
                style={{ backgroundColor: activeTerm.color }} 
              />

              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex flex-col justify-center items-center font-serif font-bold text-lg text-stone-900 shadow-md transition-all duration-700"
                  style={{ backgroundColor: activeTerm.color }}
                >
                  <span>{activeTerm.name[0]}</span>
                  <span className="text-xs -mt-1">{activeTerm.name[1]}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#ecebe6] font-serif font-bold text-xl tracking-wider">{activeTerm.name}</span>
                    <span className="text-xs text-stone-500 font-serif">{activeTerm.englishName}</span>
                  </div>
                  <div className="text-xs text-stone-400 mt-1 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-[10px] uppercase font-semibold">
                      {activeTerm.season === 'spring' ? '🌱 暮春·春风' : 
                       activeTerm.season === 'summer' ? '☀️ 仲夏·夏炽' : 
                       activeTerm.season === 'autumn' ? '🍁 晚秋·秋凉' : 
                       '❄️ 隆冬·藏意'}
                    </span>
                    <span>{activeTerm.solarTermPeriod}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Showcase Section with tabs */}
            <div className={`border-b ${styles.cardBorder} flex overflow-x-auto whitespace-nowrap scrollbar-hide ${styles.tabBg} text-xs font-serif font-medium transition-colors duration-1000`}>
              <button
                type="button"
                onClick={() => setActiveTab('scent')}
                className={`px-4 py-3 text-center border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === 'scent' 
                    ? `border-amber-700 ${styles.textColorMain} ${styles.tabItemActiveBg}` 
                    : `border-transparent ${styles.tabItemInactiveText}`
                }`}
              >
                四时香道
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('chart')}
                className={`px-4 py-3 text-center border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === 'chart' 
                    ? `border-amber-700 ${styles.textColorMain} ${styles.tabItemActiveBg}` 
                    : `border-transparent ${styles.tabItemInactiveText}`
                }`}
              >
                香笺图谱
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('workshop')}
                className={`px-4 py-3 text-center border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === 'workshop' 
                    ? `border-amber-700 ${styles.textColorMain} ${styles.tabItemActiveBg}` 
                    : `border-transparent ${styles.tabItemInactiveText}`
                }`}
              >
                调香工坊
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('meditation')}
                className={`px-4 py-3 text-center border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === 'meditation' 
                    ? `border-amber-700 ${styles.textColorMain} ${styles.tabItemActiveBg}` 
                    : `border-transparent ${styles.tabItemInactiveText}`
                }`}
              >
                呼吸颂钵
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('diet')}
                className={`px-4 py-3 text-center border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === 'diet' 
                    ? `border-amber-700 ${styles.textColorMain} ${styles.tabItemActiveBg}` 
                    : `border-transparent ${styles.tabItemInactiveText}`
                }`}
              >
                药膳本草
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('poem')}
                className={`px-4 py-3 text-center border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === 'poem' 
                    ? `border-amber-700 ${styles.textColorMain} ${styles.tabItemActiveBg}` 
                    : `border-transparent ${styles.tabItemInactiveText}`
                }`}
              >
                诗词品鉴
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`px-4 py-3 text-center border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === 'products' 
                    ? `border-amber-700 ${styles.textColorMain} ${styles.tabItemActiveBg}` 
                    : `border-transparent ${styles.tabItemInactiveText}`
                }`}
              >
                文创雅玩
              </button>
            </div>

            {/* Tab content area */}
            <div className={`flex-1 p-6 overflow-y-auto transition-colors duration-1000 ${styles.tabContentBg}`}>
              
              {/* TAB 1: Scent architecture (With rising virtual smoke simulation) */}
              {activeTab === 'scent' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
                  
                  {/* Left sub-column: 香名 / notes */}
                  <div className="md:col-span-7 flex flex-col justify-between gap-5">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-[#b8a688] font-serif tracking-widest">
                        <span>古法香合</span>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeTerm.color }} />
                        <span>气之呼吸</span>
                      </div>
                      <h3 className={`text-lg font-serif font-bold mt-1.5 tracking-wider ${styles.textColorMain}`}>
                        {activeTerm.incenseName}
                      </h3>
                      <p className={`text-xs mt-2 leading-relaxed font-sans ${styles.textColorSecondary}`}>
                        本笺专为【{activeTerm.name}】精细配伍调制，契合该时节《黄帝内经》之生息避让学，融合冷暖变化，可调息安和。
                      </p>
                    </div>

                    {/* Scent notes chain */}
                    <div className="space-y-3 font-sans">
                      <div className={`p-3 rounded-xl border transition-colors duration-1000 ${styles.contentCardBg}`}>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-stone-500 font-serif">前调 · 启凡</span>
                          <span className="text-[10px] text-stone-400 uppercase font-mono">Top Notes</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {activeTerm.scentProfile.topNotes.map(n => (
                            <span 
                              key={n} 
                              className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                                styles.isLight 
                                  ? 'bg-white border-[#dfd9cb] text-stone-800' 
                                  : 'bg-stone-950 border-stone-800 text-stone-300'
                              }`}
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className={`p-3 rounded-xl border transition-colors duration-1000 ${styles.contentCardBg}`}>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-stone-500 font-serif">中调 · 氤氲</span>
                          <span className="text-[10px] text-stone-400 uppercase font-mono">Middle Notes</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {activeTerm.scentProfile.middleNotes.map(n => (
                            <span 
                              key={n} 
                              className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                                styles.isLight 
                                  ? 'bg-[#8a5b28]/10 border-amber-600/20 text-[#8a521e]' 
                                  : 'bg-stone-950 border-stone-800 text-[#ebcca6]'
                              }`}
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className={`p-3 rounded-xl border transition-colors duration-1000 ${styles.contentCardBg}`}>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-stone-500 font-serif">后调 · 藏真</span>
                          <span className="text-[10px] text-stone-400 uppercase font-mono">Base Notes</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {activeTerm.scentProfile.baseNotes.map(n => (
                            <span 
                              key={n} 
                              className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                                styles.isLight 
                                  ? 'bg-amber-800/10 border-amber-700/20 text-[#8c6239]' 
                                  : 'bg-stone-950 border-stone-800 text-[#cc9c66]'
                              }`}
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={`p-3 rounded-xl border transition-colors ${styles.isLight ? 'bg-amber-100/20 border-amber-500/10' : 'bg-stone-900/40 border-stone-800/50'} mt-1`}>
                      <span className="text-xs text-amber-750 font-serif font-bold block">【芳华暖言】</span>
                      <p className={`text-xs mt-1 leading-relaxed font-sans italic ${styles.textColorSecondary}`}>
                        “{activeTerm.emotionalProfile.comfortWords}”
                      </p>
                    </div>
                  </div>

                  {/* Right sub-column: Canvas live incense rise burner illustration - ALWAYS dark for high contrast smoke rendering */}
                  <div className="md:col-span-5 rounded-2xl border overflow-hidden flex flex-col justify-between p-4 h-[300px] sm:h-auto select-none relative transition-colors duration-1000 bg-[#0b0c10] border-stone-850 shadow-[inset_0_2px_12px_rgba(0,0,0,0.8)]">
                    <div className="absolute top-3 left-3 text-[10px] font-serif font-semibold text-[#cfd9dc] uppercase tracking-widest z-10 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400/90 shadow-sm shadow-teal-900/40" />
                      氤氲炉烟
                    </div>

                    {/* Canvas simulation */}
                    <div className="flex-1 w-full relative">
                      <canvas ref={canvasRef} className="w-full h-full block absolute inset-0" />
                      
                      {isBrewing && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center bg-stone-900/75 border border-amber-800/10 backdrop-blur-sm p-2 rounded-lg py-1.5 animate-pulse max-w-[130px] z-10 shadow-lg">
                          <span className="text-[10px] text-[#ebd2a0] font-serif tracking-widest block">炉烟袅绕</span>
                          <span className="text-[9px] text-stone-400 block mt-0.5">静态分子香熏中</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2.5 pt-3 border-t border-stone-800/60 bg-gradient-to-t from-stone-950/30 shrink-0">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className={`px-4 py-2 rounded-xl text-xs font-serif font-semibold tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                          isMuted
                            ? 'bg-stone-900/50 border-stone-700/60 text-[#87acb0] hover:text-[#cfd9dc] hover:bg-stone-900/70'
                            : 'bg-[#0f241a]/70 border-teal-800/80 text-teal-300 shadow-sm shadow-teal-950/30'
                        }`}
                        title="点击启闭背景风吟（合成白噪声）"
                      >
                        {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} className="animate-pulse" />}
                        <span>{isMuted ? '听风' : '听风中'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsBrewing(true);
                          playBrewSound();
                          setTimeout(() => setIsBrewing(false), 8000);
                        }}
                        className={`px-5 py-2 rounded-xl text-xs font-serif font-semibold tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer bg-gradient-to-r ${
                          isBrewing
                            ? 'from-amber-600 to-amber-700 text-stone-950 shadow-md scale-95 shadow-amber-900/20'
                            : 'from-amber-900/35 to-amber-800/25 text-[#ecdcae] border border-amber-800/35 hover:border-amber-700/50 hover:from-amber-900/45'
                        }`}
                      >
                        <Wind size={14} className={isBrewing ? 'animate-spin' : ''} />
                        <span>{isBrewing ? '试香中...' : '试香'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Classical poetry appreciation */}
              {activeTab === 'poem' && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    
                    {/* The poem card inside visual scroll background */}
                    <div className={`w-full md:w-5/12 border px-5 py-7 rounded-xl flex flex-col items-center justify-center relative min-h-[220px] shadow-sm transition-colors duration-1000 ${styles.poemCardBg} ${styles.poemCardBorder}`}>
                      {/* Paper roll style decor */}
                      <div className={`absolute top-0 bottom-0 left-2 w-0.5 ${styles.poemScrollLineColor}`} />
                      <div className={`absolute top-0 bottom-0 right-2 w-0.5 ${styles.poemScrollLineColor}`} />

                      <div className="text-center">
                        <span className="text-[10px] text-stone-500 tracking-wider">《 {activeTerm.poem.dynasty} · {activeTerm.poem.author} 》</span>
                        <h3 className={`font-serif text-lg font-bold mt-1 tracking-widest ${styles.textColorMain}`}>{activeTerm.poem.title}</h3>
                      </div>

                      {/* Poetry lines - styled elegantly */}
                      <div className={`mt-5 space-y-2 text-center text-sm md:text-base font-serif tracking-widest leading-relaxed font-semibold ${styles.poemTextColor}`}>
                        {activeTerm.poem.content.map((line, idx) => (
                          <p key={idx} className="hover:text-amber-700 transition-colors cursor-pointer">
                            {line}
                          </p>
                        ))}
                      </div>

                      <div className={`w-6 h-0.5 mt-6 ${styles.isLight ? 'bg-stone-300' : 'bg-stone-800'}`} />
                    </div>

                    {/* Deep translation and appreciation text */}
                    <div className="flex-1 space-y-4">
                      <div className={`p-4 rounded-xl border transition-colors duration-1000 ${styles.contentCardBg}`}>
                        <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-[#ebd1a0] font-serif font-bold">
                          <BookOpen size={13} />
                          <span>译文释意</span>
                        </div>
                        <p className={`text-xs mt-2 leading-relaxed font-sans text-justify ${styles.textColorSecondary}`}>
                          {activeTerm.poem.translation}
                        </p>
                      </div>

                      <div className={`p-4 rounded-xl border transition-colors duration-1000 ${styles.contentCardBg}`}>
                        <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-[#ebd1a0] font-serif font-bold">
                          <Sparkles size={13} />
                          <span>诗篇鉴赏与香气和鸣</span>
                        </div>
                        <p className={`text-xs mt-2 leading-relaxed font-sans text-justify ${styles.textColorSecondary}`}>
                          {activeTerm.poem.appreciation}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`text-[11px] font-sans text-center p-2.5 rounded-lg border transition-colors duration-1000 ${styles.systemBanner}`}>
                    💡 您可以在右侧对话中输入古诗佳句，香灵可为您剖析其中更精密的节气心学。
                  </div>
                </div>
              )}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className={`flex items-center justify-between pb-2 border-b ${styles.cardBorder}`}>
                    <span className={`text-xs font-serif ${styles.textColorSecondary}`}>岁时特供 · 墨香文创周边</span>
                    <span className="text-[10px] text-stone-500">结缘本节气，可获国风藏签</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {activeTerm.creativeProducts.map(prod => (
                      <div 
                        key={prod.id} 
                        className={`rounded-xl overflow-hidden border flex flex-col justify-between group transition-all duration-1000 ${
                          styles.isLight
                            ? 'bg-[#f4efe4]/50 border-[#e5ded0] hover:border-amber-600'
                            : 'bg-stone-900 border-stone-800 hover:border-amber-700/50'
                        }`}
                      >
                        <div className={`relative h-28 w-full overflow-hidden ${styles.isLight ? 'bg-[#ebdcb9]/25' : 'bg-stone-950'}`}>
                          <ProductImage
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                          />
                          <span className={`absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded font-mono tracking-widest border ${
                            styles.isLight
                              ? 'bg-white/90 text-[#8a521e] border-amber-900/15'
                              : 'bg-stone-950/80 text-teal-300 border-teal-500/20'
                          }`}>
                            {prod.category === 'incense' ? '沉浸古香' :
                             prod.category === 'burner' ? '焚香器物' :
                             prod.category === 'stationery' ? '古法信笺' : '雅玩随身'}
                          </span>
                        </div>

                        <div className="p-3.5 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className={`text-xs font-serif font-bold transition-colors line-clamp-1 ${
                              styles.isLight ? 'text-stone-900 group-hover:text-amber-850' : 'text-stone-200 group-hover:text-amber-500'
                            }`}>
                              {prod.name}
                            </h4>
                            <p className="text-[11px] text-stone-500 mt-1.5 line-clamp-2 leading-relaxed font-sans">
                              {prod.description}
                            </p>
                          </div>

                          <div className={`flex items-center justify-between mt-3.5 pt-2.5 border-t ${styles.isLight ? 'border-[#e5ded0]/70' : 'border-stone-850/50'}`}>
                            <span className={`text-xs font-serif font-semibold ${styles.isLight ? 'text-amber-900' : 'text-[#ecdcae]'}`}>
                              ￥{prod.price}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                alert(`已将「${prod.name}」结缘放入香案！(此为创意文创周边场景交互演示)`);
                              }}
                              className={`px-2.5 py-1 rounded text-[10px] cursor-pointer transition-all ${
                                styles.isLight
                                  ? 'bg-amber-800/10 hover:bg-amber-850 hover:text-white text-amber-900 border border-amber-800/20'
                                  : 'bg-stone-950 border border-stone-800 hover:border-[#1b4322] text-stone-400 hover:text-[#ecebe6]'
                              }`}
                            >
                              结缘配香
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'chart' && (
                <div className="space-y-4">
                  <div className={`flex items-center justify-between pb-2 border-b ${styles.cardBorder}`}>
                    <span className={`text-xs font-serif ${styles.textColorSecondary}`}>廿四香笺气味图谱 · 岁时香道罗盘</span>
                    <span className="text-[10px] text-stone-500">点击节气可唤醒特定时令的香道韵律与主调颜色</span>
                  </div>
                  
                  <ScentWheelMap 
                    solarTerms={solarTerms}
                    activeTermId={activeTermId}
                    onSelectTerm={(termId) => {
                      setActiveTermId(termId);
                    }}
                    onEnterAmbience={(termId) => {
                      setActiveTab('scent');
                      if (termId !== activeTermId) {
                        setActiveTermId(termId);
                      } else {
                        setCustomSmokeColor(null);
                        setIsBrewing(true);
                        playBrewSound();
                        setTimeout(() => setIsBrewing(false), 8000);
                      }
                    }}
                    isLight={styles.isLight}
                  />
                </div>
              )}

              {activeTab === 'workshop' && (
                <div className="space-y-4">
                  <div className={`flex items-center justify-between pb-2 border-b ${styles.cardBorder}`}>
                    <span className={`text-xs font-serif ${styles.textColorSecondary}`}>岁时制香工坊 · 调香古法仪轨</span>
                    <span className="text-[10px] text-stone-500 font-sans">挑选岁时奇药名草，定制专属时令法帖</span>
                  </div>

                  <IncenseWorkshop 
                    activeTerm={activeTerm}
                    isLight={styles.isLight}
                    onTriggerBrewing={(color) => {
                      setCustomSmokeColor(color);
                      setIsBrewing(true);
                      playBrewSound();
                    }}
                  />
                </div>
              )}

              {activeTab === 'meditation' && (
                <div className="space-y-4">
                  <div className={`flex items-center justify-between pb-2 border-b ${styles.cardBorder}`}>
                    <span className={`text-xs font-serif ${styles.textColorSecondary}`}>时节呼吸白噪音 · 磬鸣颂钵冥想</span>
                    <span className="text-[10px] text-stone-500 font-sans">气守丹田，聆听清音，涤荡凡尘，调和五脏</span>
                  </div>

                  <MeditationBowl 
                    isLight={styles.isLight}
                    isWhiteNoisePlaying={meditationNoisePlaying}
                    noiseVolume={meditationNoiseVolume}
                    noiseTypeLabel={getSeasonNoiseLabel(ambientNoiseSeason)}
                    onToggleWhiteNoise={() => setMeditationNoisePlaying(prev => !prev)}
                    onNoiseVolumeChange={setMeditationNoiseVolume}
                  />
                </div>
              )}

              {activeTab === 'diet' && (
                <div className="space-y-4">
                  <div className={`flex items-center justify-between pb-2 border-b ${styles.cardBorder}`}>
                    <span className={`text-xs font-serif ${styles.textColorSecondary}`}>岁时药膳调养 · 本草御膳名册</span>
                    <span className="text-[10px] text-stone-500 font-sans">春生夏长，秋收冬藏，不偏不倚，调理营卫</span>
                  </div>

                  <SeasonalDiet 
                    activeTerm={activeTerm}
                    isLight={styles.isLight}
                  />
                </div>
              )}

            </div>
          </div>
        </section>
      </main>

      <ChatDrawer
        isExpanded={chat.isChatExpanded}
        onClose={() => chat.setIsChatExpanded(false)}
        styles={styles}
        termColor={termColor}
        activeTermId={activeTermId}
        llmStatus={chat.llmStatus}
        messages={chat.messages}
        chatInput={chat.chatInput}
        onChatInputChange={chat.setChatInput}
        isChatPending={chat.isChatPending}
        onSubmit={chat.handleSendMessage}
        onReset={chat.resetMessages}
        onSelectSuggestedTerm={setActiveTermId}
        chatEndRef={chat.chatEndRef}
        chatInputRef={chat.chatInputRef}
      />

      {/* Elegant Footer with credit and version references */}
      <footer className={`border-t ${styles.cardBorder} ${styles.headerBg} py-3.5 px-6 text-center text-[10px] text-stone-500 font-sans z-10 transition-colors duration-1000`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p>© 2026 《廿四香笺》. 芳华草木心香交互智能体（基于千问LLM大模型）</p>
          <div className="flex gap-4">
            <span className="hover:text-stone-750 dark:hover:text-stone-400 cursor-help transition-colors flex items-center gap-1">
              <Compass size={11} /> 节气香道学
            </span>
            <span>·</span>
            <span className="hover:text-stone-750 dark:hover:text-stone-400 cursor-help transition-colors flex items-center gap-1">
              <BookOpen size={11} /> 唐诗宋词谱
            </span>
            <span>·</span>
            <span className="hover:text-stone-750 dark:hover:text-stone-400 cursor-help transition-colors flex items-center gap-1">
              <Sparkles size={11} /> 情绪智能处方
            </span>
          </div>
        </div>
      </footer>

      {/* 右侧缘打开抽屉（手机 / 桌面统一，非底部弹出） */}
      {!chat.isChatExpanded && (
        <button
          type="button"
          onClick={() => chat.setIsChatExpanded(true)}
          style={{
            boxShadow: `0 4px 20px rgba(0,0,0,0.35), 0 0 10px ${hexToRgba(activeTerm.color || '#d1a876', 0.25)}`,
            borderColor: hexToRgba(activeTerm.color || '#d1a876', 0.45),
          }}
          className="fixed right-0 top-1/2 z-50 -translate-y-1/2 flex flex-col items-center gap-1 rounded-l-xl border border-r-0 bg-[#151310]/95 px-2 py-3 text-[#ebd2a0] cursor-pointer hover:bg-[#1a1814] transition-colors max-sm:py-2.5"
          aria-label="打开芳华香灵对话抽屉"
        >
          <MessageSquare size={18} />
          <span
            className="text-[10px] font-serif tracking-widest [writing-mode:vertical-rl]"
            style={{ color: activeTerm.color || '#ebd2a0' }}
          >
            芳华
          </span>
        </button>
      )}
    </div>
  );
}
