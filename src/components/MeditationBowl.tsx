import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Activity } from 'lucide-react';

interface MeditationBowlProps {
  isLight: boolean;
  isWhiteNoisePlaying: boolean;
  noiseVolume: number;
  noiseTypeLabel: string;
  onToggleWhiteNoise: () => void;
  onNoiseVolumeChange: (volume: number) => void;
}

export const MeditationBowl: React.FC<MeditationBowlProps> = ({
  isLight,
  isWhiteNoisePlaying,
  noiseVolume,
  noiseTypeLabel,
  onToggleWhiteNoise,
  onNoiseVolumeChange,
}) => {
  const [bowlStrikeStrength, setBowlStrikeStrength] = useState<number>(0);
  const [isStriking, setIsStriking] = useState<boolean>(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingSecRemaining, setBreathingSecRemaining] = useState<number>(4);
  const [breathingCyclesCompleted, setBreathingCyclesCompleted] = useState<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const strikeSingingBowl = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      setBowlStrikeStrength(1);
      setIsStriking(true);

      setTimeout(() => {
        setIsStriking(false);
      }, 2000);

      const transientSize = ctx.sampleRate * 0.08;
      const transientBuffer = ctx.createBuffer(1, transientSize, ctx.sampleRate);
      const transientData = transientBuffer.getChannelData(0);
      for (let i = 0; i < transientSize; i++) {
        transientData[i] = (Math.random() * 2 - 1) * (1.0 - i / transientSize);
      }
      const transientSource = ctx.createBufferSource();
      transientSource.buffer = transientBuffer;

      const transientFilter = ctx.createBiquadFilter();
      transientFilter.type = 'bandpass';
      transientFilter.frequency.setValueAtTime(260, now);
      transientFilter.Q.setValueAtTime(4.0, now);

      const transientGain = ctx.createGain();
      transientGain.gain.setValueAtTime(0.06, now);
      transientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      transientSource.connect(transientFilter);
      transientFilter.connect(transientGain);
      transientGain.connect(ctx.destination);
      transientSource.start(now);

      const reverbSend = ctx.createGain();
      reverbSend.gain.setValueAtTime(0.24, now);

      const delayTimes = [0.31, 0.43, 0.59];
      const feedbackAmounts = [0.44, 0.38, 0.32];
      const cutoffFreqs = [1200, 850, 600];

      delayTimes.forEach((delayTime, dIdx) => {
        const delayNode = ctx.createDelay(1.5);
        delayNode.delayTime.setValueAtTime(delayTime, now);

        const feedbackGain = ctx.createGain();
        feedbackGain.gain.setValueAtTime(feedbackAmounts[dIdx], now);
        feedbackGain.gain.exponentialRampToValueAtTime(0.001, now + 18);

        const filterNode = ctx.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(cutoffFreqs[dIdx], now);

        reverbSend.connect(delayNode);
        delayNode.connect(filterNode);
        filterNode.connect(feedbackGain);
        feedbackGain.connect(delayNode);
        delayNode.connect(ctx.destination);
      });

      const fundamentalFreq = 180;
      const harmonics = [1.0, 1.414, 2.005, 2.76, 3.52, 4.67, 5.92];
      const gains = [0.85, 0.38, 0.30, 0.16, 0.10, 0.05, 0.02];
      const decays = [20.0, 15.5, 12.0, 8.5, 5.8, 3.8, 2.2];
      const detunes = [0.35, 0.72, 1.15, 1.60, 2.10, 2.80, 3.60];

      harmonics.forEach((ratio, idx) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const mainGain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';

        const baseFreq = fundamentalFreq * ratio;
        const detunedFreq = baseFreq + detunes[idx];

        osc1.frequency.setValueAtTime(baseFreq * 1.002, now);
        osc1.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.8);
        osc2.frequency.setValueAtTime(detunedFreq * 1.002, now);
        osc2.frequency.exponentialRampToValueAtTime(detunedFreq, now + 0.8);

        mainGain.gain.setValueAtTime(gains[idx] * 0.15, now);
        mainGain.gain.exponentialRampToValueAtTime(0.000005, now + decays[idx]);

        osc1.connect(mainGain);
        osc2.connect(mainGain);
        mainGain.connect(ctx.destination);
        mainGain.connect(reverbSend);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + decays[idx] + 2);
        osc2.stop(now + decays[idx] + 2);
      });
    } catch (err) {
      console.warn('Singing bowl audio error:', err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setBreathingSecRemaining(prev => {
        if (prev <= 1) {
          if (breathingPhase === 'inhale') {
            setBreathingPhase('hold');
            return 4;
          } else if (breathingPhase === 'hold') {
            setBreathingPhase('exhale');
            return 4;
          } else {
            setBreathingPhase('inhale');
            setBreathingCyclesCompleted(c => c + 1);
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [breathingPhase]);

  useEffect(() => {
    if (bowlStrikeStrength > 0) {
      const sub = setInterval(() => {
        setBowlStrikeStrength(s => Math.max(0, s - 0.025));
      }, 50);
      return () => clearInterval(sub);
    }
  }, [bowlStrikeStrength]);

  const getBreathingLabel = () => {
    switch (breathingPhase) {
      case 'inhale':
        return { action: '吸气 (Inhale)', sub: '吸入草木节气精粹，神清气足', textCol: 'text-emerald-600', scaleClass: 'scale-125' };
      case 'hold':
        return { action: '守一 (Hold)', sub: '静止安息，温养经络元神', textCol: 'text-amber-600', scaleClass: 'scale-120 opacity-90' };
      case 'exhale':
        return { action: '吐纳 (Exhale)', sub: '带出杂念浊毒，拂平心中尘气', textCol: 'text-indigo-600', scaleClass: 'scale-90' };
    }
  };

  const breathingInfo = getBreathingLabel();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[460px]">
      <div className={`lg:col-span-7 rounded-2xl border p-5 flex flex-col justify-between items-center transition-colors duration-1000 ${
        isLight ? 'bg-white border-stone-200 shadow-sm' : 'bg-stone-900/35 border-stone-850'
      }`}>
        <div className="w-full border-b border-stone-100 dark:border-stone-850 pb-3 flex items-center justify-between">
          <div>
            <h4 className={`text-xs font-serif font-black ${isLight ? 'text-stone-850' : 'text-stone-200'}`}>
              🧘 岁时玄关 · 吐纳观音
            </h4>
            <span className="text-[10px] text-stone-400 font-sans block mt-0.5">
              伴随颂钵之音与自然白噪，调整时令呼吸，舒展微循环
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 px-2.5 py-1 rounded-full text-[10.5px]">
            <Activity size={11} className="text-emerald-500 animate-pulse" />
            <span className="font-serif text-[10px]">合计数: {breathingCyclesCompleted} 回</span>
          </div>
        </div>

        <div className="my-6 flex flex-col items-center w-full gap-6 py-2">
          <div className="relative flex items-center justify-center min-h-[188px] w-full">
            {bowlStrikeStrength > 0 && (
              <div
                className="absolute rounded-full border border-amber-600 pointer-events-none transition-all duration-300 -z-10 animate-ping"
                style={{
                  width: `${100 + bowlStrikeStrength * 160}px`,
                  height: `${100 + bowlStrikeStrength * 160}px`,
                  opacity: bowlStrikeStrength * 0.65,
                  transform: 'scale(1.2)',
                }}
              />
            )}

            <div
            className={`w-36 h-36 rounded-full flex flex-col items-center justify-center relative transition-all duration-[4000ms] ease-in-out border shadow-inner ${
              breathingPhase === 'inhale'
                ? 'bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/10'
                : breathingPhase === 'hold'
                  ? 'bg-amber-600/10 border-amber-500/30 shadow-amber-500/10'
                  : 'bg-indigo-600/10 border-indigo-500/30 shadow-indigo-500/10'
            } ${breathingInfo.scaleClass}`}
          >
            <span className="text-[10.5px] font-serif tracking-widest text-stone-400 font-medium tracking-tight uppercase">
              {breathingPhase === 'inhale' ? '吸气 In' : breathingPhase === 'hold' ? '屏息 Hold' : '呼气 Out'}
            </span>
            <span className="text-4xl font-serif font-black text-stone-800 dark:text-stone-100 my-1 font-mono transition-transform duration-1000">
              {breathingSecRemaining}
            </span>
            <span className="text-[9px] font-sans text-stone-400">秒</span>

            <div
              className={`absolute inset-[-4px] rounded-full border border-dashed animate-spin transition-all duration-1000 ${
                breathingPhase === 'inhale' ? 'border-emerald-600/20' : breathingPhase === 'hold' ? 'border-amber-500/25' : 'border-indigo-500/20'
              }`}
              style={{ animationDuration: '20s' }}
            />
          </div>
          </div>

          <div className="text-center px-2">
            <h5 className={`font-serif text-sm font-black ${breathingInfo.textCol} tracking-widest transition-colors duration-1000`}>
              {breathingInfo.action}
            </h5>
            <p className="text-[10.5px] text-stone-400 mt-1 leading-snug max-w-[240px] mx-auto">
              {breathingInfo.sub}
            </p>
          </div>
        </div>

        <div className="flex gap-2 pb-1">
          {['inhale', 'hold', 'exhale'].map((p) => (
            <span
              key={p}
              className={`w-2.5 h-2.5 rounded-full block transition-all duration-[1000ms] ${
                breathingPhase === p
                  ? (p === 'inhale' ? 'bg-emerald-500 scale-125 shadow-sm' : p === 'hold' ? 'bg-amber-500 scale-125 shadow-sm' : 'bg-indigo-600 scale-125 shadow-sm')
                  : 'bg-stone-200 dark:bg-stone-850 border border-stone-300 dark:border-stone-800'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className={`p-4 rounded-2xl border flex flex-col justify-between items-center text-center flex-1 transition-colors duration-1000 ${
          isLight ? 'bg-[#fcfaf4] border-[#e9dcbd]' : 'bg-stone-950/60 border-stone-850'
        }`}>
          <div>
            <span className="text-[10px] font-serif font-bold text-amber-800 uppercase tracking-widest block">
              🔔 磬灵 · 古法铜颂钵
            </span>
            <p className="text-[10.5px] text-stone-500 max-w-[200px] leading-relaxed mx-auto mt-1">
              由优质藏紫铜浇筑。点击击钵，可释放极长的清神波，消弭心中贪嗔痴。
            </p>
          </div>

          <div
            onClick={strikeSingingBowl}
            className="cursor-pointer select-none group relative my-2 flex items-center justify-center w-28 h-28 transform active:scale-95 transition-transform"
          >
            <div className="absolute inset-[-10px] bg-amber-600/5 rounded-full group-hover:scale-105 transition-all duration-700 blur" />

            <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-xl">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke={isStriking ? '#d97706' : '#854d0e'}
                className="transition-colors duration-200"
                strokeWidth="1.5"
              />
              <circle cx="50" cy="50" r="44" fill="url(#bronzeGradient)" />
              <circle cx="50" cy="50" r="28" fill="url(#innerBronzeGradient)" stroke="#451a03" strokeWidth="0.5" />
              <path d="M 50 35 A 15 15 0 1 1 50 65 A 15 15 0 1 1 50 35 Z M 50 42 A 8 8 0 1 0 50 58 A 8 8 0 1 0 50 42 Z" fill="#451a03" opacity="0.3" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1.5"
                className="transition-opacity duration-150"
                style={{ opacity: bowlStrikeStrength }}
              />
              <defs>
                <radialGradient id="bronzeGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ca8a04" />
                  <stop offset="40%" stopColor="#a16207" />
                  <stop offset="85%" stopColor="#713f12" />
                  <stop offset="100%" stopColor="#451a03" />
                </radialGradient>
                <radialGradient id="innerBronzeGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#451a03" />
                  <stop offset="50%" stopColor="#713f12" />
                  <stop offset="100%" stopColor="#ca8a04" />
                </radialGradient>
              </defs>
            </svg>

            <span className="absolute bottom-2 text-[10px] font-serif text-stone-200 bg-stone-900/80 px-2 py-0.5 rounded-full tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
              击 钵
            </span>
          </div>

          <button
            type="button"
            onClick={strikeSingingBowl}
            className="px-4 py-1.5 w-full rounded-xl text-[10.5px] font-serif font-bold tracking-widest cursor-pointer bg-stone-900 text-[#ca8a04] hover:bg-stone-950 flex items-center justify-center gap-1.5 shadow-sm border border-[#a16207]/30"
          >
            <span>🔔 声纳开灵 · 敲钟</span>
          </button>
        </div>

        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors duration-1000 ${
          isLight ? 'bg-white border-stone-200' : 'bg-stone-900/35 border-stone-850'
        }`}>
          <div>
            <span className="text-[10.5px] font-serif font-black text-stone-500 block mb-2">🌊 时时静聆物语 (White Noise Mixer)</span>

            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-850">
              <span className={`text-[11.5px] font-serif font-bold transition-all duration-300 ${isLight ? 'text-stone-800' : 'text-stone-300'}`}>
                {noiseTypeLabel}
              </span>

              <button
                type="button"
                onClick={onToggleWhiteNoise}
                className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                  isWhiteNoisePlaying
                    ? 'bg-amber-700 text-white'
                    : 'bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 hover:text-stone-900 text-stone-400'
                }`}
                title={isWhiteNoisePlaying ? '停止静听' : '开启白噪'}
              >
                {isWhiteNoisePlaying ? <Pause size={12} /> : <Play size={12} />}
              </button>
            </div>
          </div>

          <div className="mt-3.5 space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-stone-400">
              <div className="flex items-center gap-1.5">
                {noiseVolume === 0 ? <VolumeX size={11} /> : <Volume2 size={11} />}
                <span>白噪音量 (Volume)</span>
              </div>
              <span className="font-mono">{Math.round(noiseVolume * 100)}%</span>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={noiseVolume}
              disabled={!isWhiteNoisePlaying}
              onChange={(e) => onNoiseVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-amber-600 h-1 bg-stone-200 dark:bg-stone-800 rounded-lg cursor-ew-resize disabled:opacity-40"
            />
            {isWhiteNoisePlaying && (
              <p className="text-[9.5px] text-stone-400 leading-snug">
                切换顶部节气或季节筛选时，白噪音将随当前季节自动变换
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
