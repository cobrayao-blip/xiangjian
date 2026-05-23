import React, { useRef, useState, useCallback, useEffect } from 'react';
import { SolarTerm } from '../types';
import { Compass } from 'lucide-react';

interface ScentWheelMapProps {
  solarTerms: SolarTerm[];
  activeTermId: string;
  onSelectTerm: (termId: string) => void;
  onEnterAmbience: (termId: string) => void;
  isLight: boolean;
}

const CX = 200;
const CY = 200;
const R_OUT = 175;
const R_IN = 88;
const ANGLE_PER_SLICE = 360 / 24;

export const ScentWheelMap: React.FC<ScentWheelMapProps> = ({
  solarTerms,
  activeTermId,
  onSelectTerm,
  onEnterAmbience,
  isLight,
}) => {
  const [hoveredTermId, setHoveredTermId] = useState<string | null>(null);
  const [isTouchingWheel, setIsTouchingWheel] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const touchActiveRef = useRef(false);
  const touchPreviewIdRef = useRef<string | null>(null);
  const onSelectTermRef = useRef(onSelectTerm);
  onSelectTermRef.current = onSelectTerm;

  const currentTerm = solarTerms.find((t) => t.id === activeTermId) || solarTerms[0];
  const displayedTerm = hoveredTermId
    ? solarTerms.find((t) => t.id === hoveredTermId) || currentTerm
    : currentTerm;

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const getArcPath = (startAngle: number, endAngle: number) => {
    const p1 = polarToCartesian(CX, CY, R_OUT, startAngle);
    const p2 = polarToCartesian(CX, CY, R_OUT, endAngle);
    const p3 = polarToCartesian(CX, CY, R_IN, endAngle);
    const p4 = polarToCartesian(CX, CY, R_IN, startAngle);
    return `M ${p1.x} ${p1.y} A ${R_OUT} ${R_OUT} 0 0 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${R_IN} ${R_IN} 0 0 0 ${p4.x} ${p4.y} Z`;
  };

  /** 将屏幕坐标映射到罗盘扇区（与 SVG 切片角度一致） */
  const hitTestTermId = useCallback(
    (clientX: number, clientY: number): string | null => {
      const svg = svgRef.current;
      if (!svg) return null;

      const rect = svg.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;

      const x = ((clientX - rect.left) / rect.width) * 400;
      const y = ((clientY - rect.top) / rect.height) * 400;
      const dx = x - CX;
      const dy = y - CY;
      const dist = Math.hypot(dx, dy);

      if (dist < R_IN || dist > R_OUT) return null;

      let angleFromTop = (Math.atan2(dx, -dy) * 180) / Math.PI;
      if (angleFromTop < 0) angleFromTop += 360;

      const index =
        Math.floor(angleFromTop / ANGLE_PER_SLICE) % solarTerms.length;
      return solarTerms[index]?.id ?? null;
    },
    [solarTerms]
  );

  const applyTouchPreview = useCallback(
    (clientX: number, clientY: number) => {
      const id = hitTestTermId(clientX, clientY);
      if (id) {
        touchPreviewIdRef.current = id;
        setHoveredTermId(id);
      }
      return id;
    },
    [hitTestTermId]
  );

  const finishTouchInteraction = useCallback((shouldSelect: boolean) => {
    if (!touchActiveRef.current) return;

    const picked = touchPreviewIdRef.current;
    if (shouldSelect && picked) {
      onSelectTermRef.current(picked);
    }

    touchActiveRef.current = false;
    touchPreviewIdRef.current = null;
    setIsTouchingWheel(false);
    setHoveredTermId(null);
  }, []);

  const beginTouchInteraction = useCallback(
    (clientX: number, clientY: number) => {
      touchActiveRef.current = true;
      setIsTouchingWheel(true);
      applyTouchPreview(clientX, clientY);
    },
    [applyTouchPreview]
  );

  /** iOS / 安卓：非 passive 的 touch 监听，避免被页面滚动抢走 */
  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      const t = e.touches[0];
      beginTouchInteraction(t.clientX, t.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchActiveRef.current || e.touches.length !== 1) return;
      e.preventDefault();
      applyTouchPreview(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onTouchEnd = () => finishTouchInteraction(true);
    const onTouchCancel = () => finishTouchInteraction(false);

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: false });
    el.addEventListener('touchcancel', onTouchCancel, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [applyTouchPreview, beginTouchInteraction, finishTouchInteraction]);

  const handleWheelPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    beginTouchInteraction(e.clientX, e.clientY);
  };

  const handleWheelPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return;
    if (!touchActiveRef.current) return;
    e.preventDefault();
    applyTouchPreview(e.clientX, e.clientY);
  };

  const handleWheelPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return;
    finishTouchInteraction(true);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleWheelPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return;
    finishTouchInteraction(false);
  };

  const getSeasonConfig = (season: string) => {
    switch (season) {
      case 'spring':
        return { label: '春意', icon: '🌸' };
      case 'summer':
        return { label: '夏薰', icon: '🍃' };
      case 'autumn':
        return { label: '秋韵', icon: '🍁' };
      case 'winter':
        return { label: '冬凝', icon: '❄️' };
      default:
        return { label: '', icon: '🧭' };
    }
  };

  const tipText = isTouchingWheel
    ? '💡 手指划过罗盘预览香韵，松手即可选定节气'
    : hoveredTermId
      ? '💡 松手或点击，锁定此节气的意境体验'
      : '💡 手机：在罗盘上滑动预览 · 电脑：悬停或点击切片';

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full items-center">
      <div
        ref={wheelRef}
        className="w-full max-w-[340px] sm:max-w-[400px] aspect-square flex flex-col items-center justify-center relative select-none touch-none"
        style={{ touchAction: 'none' }}
        onPointerDown={handleWheelPointerDown}
        onPointerMove={handleWheelPointerMove}
        onPointerUp={handleWheelPointerUp}
        onPointerCancel={handleWheelPointerCancel}
      >
        <div
          className="absolute inset-[40px] rounded-full blur-2xl opacity-15 transition-all duration-1000 -z-10"
          style={{ backgroundColor: displayedTerm.color }}
        />

        <svg
          ref={svgRef}
          viewBox="0 0 400 400"
          className={`w-full h-full drop-shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-transform duration-500 ${
            isTouchingWheel ? 'scale-[1.02]' : 'hover:rotate-1'
          }`}
          style={{ touchAction: 'none' }}
        >
          <circle
            cx={CX}
            cy={CY}
            r={R_OUT + 10}
            fill="none"
            className={isLight ? 'stroke-amber-900/10' : 'stroke-stone-850/50'}
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <circle
            cx={CX}
            cy={CY}
            r={R_IN - 10}
            fill="none"
            className={isLight ? 'stroke-amber-900/10' : 'stroke-stone-850/50'}
            strokeWidth="1.5"
          />

          <g>
            {solarTerms.map((term, index) => {
              const startAngle = index * ANGLE_PER_SLICE;
              const endAngle = (index + 1) * ANGLE_PER_SLICE;
              const midAngle = startAngle + ANGLE_PER_SLICE / 2;
              const isActive = term.id === activeTermId;
              const isHovered = term.id === hoveredTermId;
              const pathData = getArcPath(startAngle, endAngle);
              const labelPos = polarToCartesian(CX, CY, R_IN + 34, midAngle);

              return (
                <g
                  key={term.id}
                  className="cursor-pointer transition-all duration-300"
                  onMouseEnter={() => {
                    if (!touchActiveRef.current) setHoveredTermId(term.id);
                  }}
                  onMouseLeave={() => {
                    if (!touchActiveRef.current) setHoveredTermId(null);
                  }}
                  onClick={() => {
                    if (touchActiveRef.current) return;
                    onSelectTerm(term.id);
                  }}
                >
                  <path
                    d={pathData}
                    fill={term.color}
                    className="transition-all duration-300"
                    style={{
                      opacity: isActive
                        ? 0.95
                        : isHovered
                          ? 0.75
                          : isLight
                            ? 0.28
                            : 0.15,
                      transform:
                        isHovered || isActive ? 'scale(1.02)' : 'scale(1)',
                      transformOrigin: `${CX}px ${CY}px`,
                    }}
                    stroke={isActive ? '#d97706' : isLight ? '#eae0cc' : '#1d2024'}
                    strokeWidth={isActive ? 2 : 0.5}
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y + 4}
                    transform={`rotate(${midAngle}, ${labelPos.x}, ${labelPos.y})`}
                    textAnchor="middle"
                    className="font-serif font-semibold text-[9.5px] transition-colors duration-300 pointer-events-none select-none tracking-tight"
                    fill={
                      isActive
                        ? isLight
                          ? '#2d2d1e'
                          : '#ffffff'
                        : isHovered
                          ? '#d97706'
                          : isLight
                            ? '#5c5446'
                            : '#9ca3af'
                    }
                    style={{
                      fontWeight: isActive ? 'bold' : 'normal',
                      fontSize: isActive ? '10.5px' : '9.5px',
                    }}
                  >
                    {term.name}
                  </text>
                </g>
              );
            })}
          </g>

          <g pointerEvents="none">
            <circle
              cx={CX}
              cy={CY}
              r={R_IN - 2}
              className={isLight ? 'fill-[#fbfaf7]' : 'fill-[#0d0e12]'}
              stroke={displayedTerm.color}
              strokeWidth="2"
            />
            <circle
              cx={CX}
              cy={CY}
              r={R_IN - 15}
              fill="none"
              className={isLight ? 'stroke-stone-200' : 'stroke-stone-900'}
              strokeWidth="0.5"
            />
            <text
              x={CX}
              y={CY - 20}
              textAnchor="middle"
              className="font-serif font-black text-2xl tracking-widest"
              fill={isLight ? '#1f2937' : '#ecebe6'}
            >
              {displayedTerm.name}
            </text>
            <text
              x={CX}
              y={CY}
              textAnchor="middle"
              className="font-sans text-[10px] tracking-wider uppercase opacity-65"
              fill={isLight ? '#4b5563' : '#9ca3af'}
            >
              {displayedTerm.englishName}
            </text>
            <text
              x={CX}
              y={CY + 16}
              textAnchor="middle"
              className="font-serif text-[11px] tracking-widest font-medium"
              fill={displayedTerm.textColor}
            >
              {getSeasonConfig(displayedTerm.season).icon}{' '}
              {displayedTerm.solarTermPeriod}
            </text>
            <text
              x={CX}
              y={CY + 38}
              textAnchor="middle"
              className="font-serif font-bold text-[10.5px] italic tracking-widest"
              fill={isLight ? '#b45309' : '#f59e0b'}
            >
              「{displayedTerm.incenseName}」
            </text>
            <line
              x1={CX}
              y1={CY - R_IN + 10}
              x2={CX}
              y2={CY - R_IN + 5}
              className={isLight ? 'stroke-amber-950/20' : 'stroke-stone-800'}
              strokeWidth="1"
            />
            <line
              x1={CX}
              y1={CY + R_IN - 10}
              x2={CX}
              y2={CY + R_IN - 5}
              className={isLight ? 'stroke-amber-950/20' : 'stroke-stone-800'}
              strokeWidth="1"
            />
            <line
              x1={CX - R_IN + 10}
              y1={CY}
              x2={CX - R_IN + 5}
              y2={CY}
              className={isLight ? 'stroke-amber-950/20' : 'stroke-stone-800'}
              strokeWidth="1"
            />
            <line
              x1={CX + R_IN - 10}
              y1={CY}
              x2={CX + R_IN - 5}
              y2={CY}
              className={isLight ? 'stroke-amber-950/20' : 'stroke-stone-800'}
              strokeWidth="1"
            />
          </g>
        </svg>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[172px] h-[172px] rounded-full border border-stone-400/20 pointer-events-none" />

        <p className="mt-2 text-[10px] text-amber-800/80 dark:text-amber-200/80 font-serif text-center pointer-events-none md:hidden">
          {isTouchingWheel
            ? '正在预览…松手选定节气'
            : '手指按住彩色环带滑动 · 松手选定'}
        </p>
      </div>

      <div className="flex-1 w-full flex flex-col justify-between self-stretch bg-stone-900/5 dark:bg-stone-950/45 p-5 rounded-2xl border border-stone-200/50 dark:border-stone-900/80 transition-colors duration-1000 min-h-[300px]">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded border ${
                displayedTerm.season === 'spring'
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : displayedTerm.season === 'summer'
                    ? 'bg-teal-500/10 text-teal-500 border-teal-500/20'
                    : displayedTerm.season === 'autumn'
                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
              }`}
            >
              {getSeasonConfig(displayedTerm.season).icon}{' '}
              {getSeasonConfig(displayedTerm.season).label}节
            </span>
            <span className="text-[10.5px] text-stone-500 font-sans tracking-tight">
              气韵轨迹：全图盘第{' '}
              {solarTerms.findIndex((t) => t.id === displayedTerm.id) + 1} 候
            </span>
          </div>

          <h3
            className={`font-serif text-base font-black flex items-center gap-1.5 ${isLight ? 'text-stone-850' : 'text-stone-100'}`}
          >
            <span>
              {displayedTerm.name} · {displayedTerm.incenseName}
            </span>
            <span
              className="inline-block w-3 h-3 rounded-full shadow-inner border border-stone-500/10"
              style={{ backgroundColor: displayedTerm.color }}
            />
          </h3>

          <p className="text-[11px] text-stone-500 dark:text-stone-400 font-sans mt-2 leading-relaxed">
            {displayedTerm.emotionalProfile.mood ||
              '该节气心气内藏，香道辅疗有助于身心在岁时中达到绝佳和鸣状态。'}
          </p>

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-stone-400 w-10 shrink-0 text-right">
                前调 Top:
              </span>
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
              <span className="text-[10px] font-mono text-stone-400 w-10 shrink-0 text-right">
                中调 Mid:
              </span>
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
              <span className="text-[10px] font-mono text-stone-400 w-10 shrink-0 text-right">
                后调 Base:
              </span>
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

        <div className="mt-5 border-t border-stone-200/50 dark:border-stone-900/80 pt-4 flex items-center justify-between gap-3">
          <p className="text-[10.5px] text-stone-500 leading-snug flex-1">{tipText}</p>
          <button
            type="button"
            onClick={() => {
              setHoveredTermId(null);
              onEnterAmbience(displayedTerm.id);
            }}
            className="shrink-0 px-3.5 py-1.5 rounded-xl text-[11px] font-serif font-bold tracking-widest cursor-pointer hover:scale-[1.02] active:scale-95 transition-all bg-amber-700 text-white hover:bg-amber-800 flex items-center gap-1.5 shadow-sm"
          >
            <Compass size={11} />
            <span>进入意境</span>
          </button>
        </div>
      </div>
    </div>
  );
};
