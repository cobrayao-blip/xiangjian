import React, { useState } from 'react';
import { SolarTerm } from '../types';
import { Wind, Snowflake, Sun, Compass } from 'lucide-react';

interface ScentWheelMapProps {
  solarTerms: SolarTerm[];
  activeTermId: string;
  onSelectTerm: (termId: string) => void;
  isLight: boolean;
}

export const ScentWheelMap: React.FC<ScentWheelMapProps> = ({
  solarTerms,
  activeTermId,
  onSelectTerm,
  isLight
}) => {
  const [hoveredTermId, setHoveredTermId] = useState<string | null>(null);

  // Find active and hovered terms
  const currentTerm = solarTerms.find(t => t.id === activeTermId) || solarTerms[0];
  const displayedTerm = hoveredTermId
    ? (solarTerms.find(t => t.id === hoveredTermId) || currentTerm)
    : currentTerm;

  // Wheel configuration
  const cx = 200;
  const cy = 200;
  const rOut = 175;
  const rIn = 88;
  const anglePerSlice = 360 / 24; // 15 degrees per term

  // Helper to convert polar coordinates to x/y
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    // Offset by -90 to start facing straight up (North position)
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  // Generate path data for a donut arc slice
  const getArcPath = (startAngle: number, endAngle: number) => {
    const p1 = polarToCartesian(cx, cy, rOut, startAngle);
    const p2 = polarToCartesian(cx, cy, rOut, endAngle);
    const p3 = polarToCartesian(cx, cy, rIn, endAngle);
    const p4 = polarToCartesian(cx, cy, rIn, startAngle);

    // sweep-flag 1 for outer clockwise, 0 for inner counter-clockwise
    return `M ${p1.x} ${p1.y} A ${rOut} ${rOut} 0 0 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rIn} ${rIn} 0 0 0 ${p4.x} ${p4.y} Z`;
  };

  // Helper for seasonal icons and labels
  const getSeasonConfig = (season: string) => {
    switch (season) {
      case 'spring':
        return { label: '春意', colorText: 'text-emerald-600', icon: '🌸' };
      case 'summer':
        return { label: '夏薰', colorText: 'text-teal-500', icon: '🍃' };
      case 'autumn':
        return { label: '秋韵', colorText: 'text-amber-600', icon: '🍁' };
      case 'winter':
        return { label: '冬凝', colorText: 'text-slate-500', icon: '❄️' };
      default:
        return { label: '', colorText: 'text-stone-500', icon: '🧭' };
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full items-center">
      {/* SECTION 1: Dynamic Circular Scent Wheel */}
      <div className="w-full max-w-[340px] sm:max-w-[400px] aspect-square flex items-center justify-center relative select-none">
        
        {/* Ambient Ring Glow */}
        <div 
          className="absolute inset-[40px] rounded-full blur-2xl opacity-15 transition-all duration-1000 -z-10"
          style={{ backgroundColor: displayedTerm.color }}
        />

        <svg 
          viewBox="0 0 400 400" 
          className="w-full h-full drop-shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-transform duration-500 hover:rotate-1"
        >
          {/* 1. Concentric Guide Rings */}
          <circle 
            cx={cx} 
            cy={cy} 
            r={rOut + 10} 
            fill="none" 
            className={isLight ? 'stroke-amber-900/10' : 'stroke-stone-850/50'} 
            strokeWidth="1" 
            strokeDasharray="4 4"
          />
          <circle 
            cx={cx} 
            cy={cy} 
            r={rIn - 10} 
            fill="none" 
            className={isLight ? 'stroke-amber-900/10' : 'stroke-stone-850/50'} 
            strokeWidth="1.5"
          />

          {/* 2. Interactive Wedge Slices for 24 terms */}
          <g>
            {solarTerms.map((term, index) => {
              const startAngle = index * anglePerSlice;
              const endAngle = (index + 1) * anglePerSlice;
              const midAngle = startAngle + anglePerSlice / 2;
              
              // Highlight states
              const isActive = term.id === activeTermId;
              const isHovered = term.id === hoveredTermId;
              const pathData = getArcPath(startAngle, endAngle);

              // Precise text angle placement (offset so it readable vertically radiating outwards)
              const labelRadius = rIn + 34; // right general center space
              const labelPos = polarToCartesian(cx, cy, labelRadius, midAngle);

              // Colors based on theme context
              const wedgeFillColor = term.color;
              
              return (
                <g 
                  key={term.id}
                  className="cursor-pointer transition-all duration-300"
                  onMouseEnter={() => setHoveredTermId(term.id)}
                  onMouseLeave={() => setHoveredTermId(null)}
                  onClick={() => onSelectTerm(term.id)}
                >
                  {/* Arc Wedge Fill */}
                  <path
                    d={pathData}
                    fill={wedgeFillColor}
                    className="transition-all duration-300"
                    style={{
                      opacity: isActive ? 0.95 : isHovered ? 0.75 : isLight ? 0.28 : 0.15,
                      transform: isHovered || isActive ? 'scale(1.02)' : 'scale(1)',
                      transformOrigin: `${cx}px ${cy}px`,
                    }}
                    stroke={isActive ? '#d97706' : isLight ? '#eae0cc' : '#1d2024'}
                    strokeWidth={isActive ? 2 : 0.5}
                  />

                  {/* Radiating textual labels */}
                  <text
                    x={labelPos.x}
                    y={labelPos.y + 4}
                    transform={`rotate(${midAngle}, ${labelPos.x}, ${labelPos.y})`}
                    textAnchor="middle"
                    className="font-serif font-semibold text-[9.5px] transition-colors duration-300 pointer-events-none select-none tracking-tight"
                    fill={isActive 
                      ? (isLight ? '#2d2d1e' : '#ffffff') 
                      : isHovered 
                        ? '#d97706' 
                        : isLight ? '#5c5446' : '#9ca3af'
                    }
                    style={{
                      fontWeight: isActive ? 'bold' : 'normal',
                      fontSize: isActive ? '10.5px' : '9.5px'
                    }}
                  >
                    {term.name}
                  </text>
                </g>
              );
            })}
          </g>

          {/* 3. Central Scent Dial Hole - Interactive Display Core */}
          <g pointerEvents="none">
            {/* Background disc shadow insert */}
            <circle 
              cx={cx} 
              cy={cy} 
              r={rIn - 2} 
              className={isLight ? 'fill-[#fbfaf7]' : 'fill-[#0d0e12]'} 
              stroke={displayedTerm.color}
              strokeWidth="2"
            />
            
            {/* Small solar ring indicator */}
            <circle 
              cx={cx} 
              cy={cy} 
              r={rIn - 15} 
              fill="none" 
              className={isLight ? 'stroke-stone-200' : 'stroke-stone-900'} 
              strokeWidth="0.5"
            />

            {/* Central Term Calligraphy Typography */}
            <text
              cx={cx}
              x={cx}
              y={cy - 20}
              textAnchor="middle"
              className="font-serif font-black text-2xl tracking-widest"
              fill={isLight ? '#1f2937' : '#ecebe6'}
            >
              {displayedTerm.name}
            </text>

            {/* Traditional Season & English Label */}
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              className="font-sans text-[10px] tracking-wider uppercase opacity-65"
              fill={isLight ? '#4b5563' : '#9ca3af'}
            >
              {displayedTerm.englishName}
            </text>

            <text
              x={cx}
              y={cy + 16}
              textAnchor="middle"
              className="font-serif text-[11px] tracking-widest font-medium"
              fill={displayedTerm.textColor}
            >
              {getSeasonConfig(displayedTerm.season).icon} {displayedTerm.solarTermPeriod}
            </text>

            {/* Scent Title display line */}
            <text
              x={cx}
              y={cy + 38}
              textAnchor="middle"
              className="font-serif font-bold text-[10.5px] italic tracking-widest"
              fill={isLight ? '#b45309' : '#f59e0b'}
            >
              「{displayedTerm.incenseName}」
            </text>

            {/* Micro aesthetic compass lines */}
            <line x1={cx} y1={cy - rIn + 10} x2={cx} y2={cy - rIn + 5} className={isLight ? 'stroke-amber-950/20' : 'stroke-stone-800'} strokeWidth="1" />
            <line x1={cx} y1={cy + rIn - 10} x2={cx} y2={cy + rIn - 5} className={isLight ? 'stroke-amber-950/20' : 'stroke-stone-800'} strokeWidth="1" />
            <line x1={cx - rIn + 10} y1={cy} x2={cx - rIn + 5} y2={cy} className={isLight ? 'stroke-amber-950/20' : 'stroke-stone-800'} strokeWidth="1" />
            <line x1={cx + rIn - 10} y1={cy} x2={cx + rIn - 5} y2={cy} className={isLight ? 'stroke-amber-950/20' : 'stroke-stone-800'} strokeWidth="1" />
          </g>
        </svg>

        {/* Decorative Dial Outer Center Guide Label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[172px] h-[172px] rounded-full border border-stone-400/20 pointer-events-none" />
      </div>

      {/* SECTION 2: Dynamic Fragrance Scent Spec Card */}
      <div className="flex-1 w-full flex flex-col justify-between self-stretch bg-stone-900/5 dark:bg-stone-950/45 p-5 rounded-2xl border border-stone-200/50 dark:border-stone-900/80 transition-colors duration-1000 min-h-[300px]">
        
        {/* Selected Term metadata details */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded border ${
              displayedTerm.season === 'spring' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
              displayedTerm.season === 'summer' ? 'bg-teal-500/10 text-teal-500 border-teal-500/20' :
              displayedTerm.season === 'autumn' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
              'bg-slate-500/10 text-slate-500 border-slate-500/20'
            }`}>
              {getSeasonConfig(displayedTerm.season).icon} {getSeasonConfig(displayedTerm.season).label}节
            </span>
            <span className="text-[10.5px] text-stone-500 font-sans tracking-tight">气韵轨迹：全图盘第 {(solarTerms.findIndex(t => t.id === displayedTerm.id) + 1)} 候</span>
          </div>

          <h3 className={`font-serif text-base font-black flex items-center gap-1.5 ${isLight ? 'text-stone-850' : 'text-stone-100'}`}>
            <span>{displayedTerm.name} · {displayedTerm.incenseName}</span>
            <span className="inline-block w-3 h-3 rounded-full shadow-inner border border-stone-500/10" style={{ backgroundColor: displayedTerm.color }} />
          </h3>
          
          <p className="text-[11px] text-stone-500 dark:text-stone-400 font-sans mt-2 leading-relaxed">
            {displayedTerm.emotionalProfile.mood || '该节气心气内藏，香道辅疗有助于身心在岁时中达到绝佳和鸣状态。'}
          </p>

          {/* Scent Accord Visualization */}
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-stone-400 w-10 shrink-0 text-right">前调 Top:</span>
              <div className="flex-1 flex flex-wrap gap-1.5">
                {displayedTerm.scentProfile.topNotes.map((note, idx) => (
                  <span 
                    key={idx} 
                    className={`text-[10.5px] px-2 py-0.5 font-serif rounded-lg border transition-colors duration-1000 ${
                      isLight 
                        ? 'bg-amber-700/5 text-amber-950 border-amber-900/10' 
                        : 'bg-stone-900 text-amber-300 border-stone-800'
                    }`}
                  >
                    🌿 {note}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-stone-400 w-10 shrink-0 text-right">中调 Mid:</span>
              <div className="flex-1 flex flex-wrap gap-1.5">
                {displayedTerm.scentProfile.middleNotes.map((note, idx) => (
                  <span 
                    key={idx} 
                    className={`text-[10.5px] px-2 py-0.5 font-serif rounded-lg border transition-colors duration-1000 ${
                      isLight 
                        ? 'bg-amber-700/5 text-amber-950 border-amber-900/10' 
                        : 'bg-stone-900 text-amber-400 border-stone-800'
                    }`}
                  >
                    🌸 {note}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-stone-400 w-10 shrink-0 text-right">后调 Base:</span>
              <div className="flex-1 flex flex-wrap gap-1.5">
                {displayedTerm.scentProfile.baseNotes.map((note, idx) => (
                  <span 
                    key={idx} 
                    className={`text-[10.5px] px-2 py-0.5 font-serif rounded-lg border transition-colors duration-1000 ${
                      isLight 
                        ? 'bg-amber-700/5 text-amber-950 border-amber-900/10' 
                        : 'bg-stone-900 text-[#ebd4a0] border-stone-800'
                    }`}
                  >
                    🪵 {note}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tip Banner / Button to explore */}
        <div className="mt-5 border-t border-stone-200/50 dark:border-stone-900/80 pt-4 flex items-center justify-between">
          <p className="text-[10.5px] text-stone-500 leading-snug max-w-[200px]">
            {hoveredTermId ? '💡 释手或点击，即可锁定切换此节气的意境体验' : '💡 点击轮盘切片，即可锁定切换该节气的香熏和音乐主视觉'}
          </p>
          <button
            type="button"
            onClick={() => {
              onSelectTerm(displayedTerm.id);
            }}
            className="px-3.5 py-1.5 rounded-xl text-[11px] font-serif font-bold tracking-widest cursor-pointer hover:scale-[1.02] active:scale-95 transition-all bg-amber-700 text-white hover:bg-amber-800 flex items-center gap-1.5 shadow-sm"
          >
            <Compass size={11} />
            <span>进入意境</span>
          </button>
        </div>
      </div>
    </div>
  );
};
