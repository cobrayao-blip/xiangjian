import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Compass, Activity, ShieldAlert, Sparkles, Wind } from 'lucide-react';
import { SolarTerm } from '../types';

interface MeditationBowlProps {
  activeTerm: SolarTerm;
  isLight: boolean;
}

export const MeditationBowl: React.FC<MeditationBowlProps> = ({
  activeTerm,
  isLight
}) => {
  // Sound states
  const [isWhiteNoisePlaying, setIsWhiteNoisePlaying] = useState<boolean>(false);
  const [noiseVolume, setNoiseVolume] = useState<number>(0.3);
  const [bowlStrikeStrength, setBowlStrikeStrength] = useState<number>(0); // 0 to 1, triggers visual ripples
  const [isStriking, setIsStriking] = useState<boolean>(false);

  // Breathing Circle states
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingSecRemaining, setBreathingSecRemaining] = useState<number>(4);
  const [breathingCyclesCompleted, setBreathingCyclesCompleted] = useState<number>(0);

  // Web Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // White noise nodes
  const noiseSourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainNodeRef = useRef<GainNode | null>(null);
  const noiseFilterNodeRef = useRef<BiquadFilterNode | null>(null);
  const fireCrackNodeRef = useRef<any>(null); // Interval reference for fireplace pops

  // 1. Initialize AudioContext on first user click to satisfy browser security
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

  // 2. STRIKE MEDITATION BOWL SYNTH (Bronze Singing Bowl)
  const strikeSingingBowl = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      setBowlStrikeStrength(1);
      setIsStriking(true);

      // Decrescendo/fade out the ripple animation
      setTimeout(() => {
        setIsStriking(false);
      }, 2000);

      // 1. Cozy Mallet Strike Transient (wood/felt hammer strike simulation)
      const transientSize = ctx.sampleRate * 0.08; // 80ms mallet tap buffer
      const transientBuffer = ctx.createBuffer(1, transientSize, ctx.sampleRate);
      const transientData = transientBuffer.getChannelData(0);
      for (let i = 0; i < transientSize; i++) {
        // White noise with a sharp linear decay envelope
        transientData[i] = (Math.random() * 2 - 1) * (1.0 - i / transientSize);
      }
      const transientSource = ctx.createBufferSource();
      transientSource.buffer = transientBuffer;
      
      const transientFilter = ctx.createBiquadFilter();
      transientFilter.type = 'bandpass';
      transientFilter.frequency.setValueAtTime(260, now); // Wooden felt mallet resonance frequency
      transientFilter.Q.setValueAtTime(4.0, now);

      const transientGain = ctx.createGain();
      transientGain.gain.setValueAtTime(0.06, now); // Soft tactile thump
      transientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      transientSource.connect(transientFilter);
      transientFilter.connect(transientGain);
      transientGain.connect(ctx.destination);
      transientSource.start(now);

      // 2. Multi-Tap Feedback Echo Chamber (Parallel Schroeder Delay Network for spatial temple resonance)
      const reverbSend = ctx.createGain();
      reverbSend.gain.setValueAtTime(0.24, now); // Send 24% of dry signal to the resonance chamber

      const delayTimes = [0.31, 0.43, 0.59];
      const feedbackAmounts = [0.44, 0.38, 0.32];
      const cutoffFreqs = [1200, 850, 600];

      delayTimes.forEach((delayTime, dIdx) => {
        const delayNode = ctx.createDelay(1.5);
        delayNode.delayTime.setValueAtTime(delayTime, now);

        const feedbackGain = ctx.createGain();
        feedbackGain.gain.setValueAtTime(feedbackAmounts[dIdx], now);
        // Exponentially decay reverb feedback so it dies out at the same pace as the bowl
        feedbackGain.gain.exponentialRampToValueAtTime(0.001, now + 18);

        const filterNode = ctx.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(cutoffFreqs[dIdx], now);

        reverbSend.connect(delayNode);
        delayNode.connect(filterNode);
        filterNode.connect(feedbackGain);
        feedbackGain.connect(delayNode); // loopback

        delayNode.connect(ctx.destination);
      });

      // 3. Bronze Bowl Multi-mode harmonics with Physical Acoustic Interference
      const fundamentalFreq = 180; // Deep, warming, comforting base frequency
      
      // Inharmonic partial ratios typical of heavy hand-hammered singing bronze bowls
      const harmonics = [1.0, 1.414, 2.005, 2.76, 3.52, 4.67, 5.92]; 
      const gains =     [0.85, 0.38,  0.30,  0.16, 0.10, 0.05, 0.02];
      // Frequency-dependent decays: higher modes dissipate much faster due to metal damping
      const decays =    [20.0, 15.5,  12.0,  8.5,  5.8,  3.8,  2.2];
      // Beating rates (frequency detuning offset in Hz to generate authentic shimmering wah-wah hums)
      const detunes =   [0.35, 0.72,  1.15,  1.60, 2.10, 2.80, 3.60];

      harmonics.forEach((ratio, idx) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const mainGain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';

        const baseFreq = fundamentalFreq * ratio;
        const detunedFreq = baseFreq + detunes[idx];

        // Elastic pitch sag: initial strike compression makes metal vibrate slightly higher,
        // sliding down beautifully into precise frequency within the first 800ms
        osc1.frequency.setValueAtTime(baseFreq * 1.002, now);
        osc1.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.8);

        osc2.frequency.setValueAtTime(detunedFreq * 1.002, now);
        osc2.frequency.exponentialRampToValueAtTime(detunedFreq, now + 0.8);

        // Precise envelope: instant strike attack, custom exponential dissipation
        mainGain.gain.setValueAtTime(gains[idx] * 0.15, now);
        mainGain.gain.exponentialRampToValueAtTime(0.000005, now + decays[idx]);

        // Route dual oscillators through the decay envelope
        osc1.connect(mainGain);
        osc2.connect(mainGain);

        // Send dry voice to final output & wet voice to the echo chamber
        mainGain.connect(ctx.destination);
        mainGain.connect(reverbSend);

        osc1.start(now);
        osc2.start(now);

        // High precision node disposal safely after audibility threshold to eliminate memory leaks
        osc1.stop(now + decays[idx] + 2);
        osc2.stop(now + decays[idx] + 2);
      });
    } catch (err) {
      console.warn("Singing bowl audio error:", err);
    }
  };

  // 3. SYNTHESIZE SEASONAL BACKGROUND WHITE NOISE
  const startWhiteNoise = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Ensure standard buffer size
      const bufferSize = 3 * ctx.sampleRate; // 3 seconds loop
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pinkish soothing noise calculation (1/f spectral density)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11; // normalise scale
        b6 = white * 0.115926;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      // Filter settings matching the season for natural textures!
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';

      // Set frequency based on the active season
      let freqValue = 350; // default low rumble
      let qValue = 1.2;

      // Custom seasonal wind/weather mapping
      if (activeTerm.season === 'spring') {
        // "春雨" low washing rain filter
        freqValue = 680;
        qValue = 0.8;
      } else if (activeTerm.season === 'summer') {
        // "夏风" wider high frequency sweep leaves rustling
        freqValue = 820;
        qValue = 0.5;
      } else if (activeTerm.season === 'autumn') {
        // "秋林" whistling dry cold breath
        freqValue = 480;
        qValue = 1.5;
      } else {
        // "冬雪" deep muffling low draft fire low rumbling
        freqValue = 260;
        qValue = 1.0;
      }

      filter.frequency.setValueAtTime(freqValue, now);
      filter.Q.setValueAtTime(qValue, now);

      // Low frequency oscillator (LFO) to swell winds dynamically
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.12, now); // ultra slow wave swell (8 seconds per cycle)
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(freqValue * 0.28, now); // modulate frequency up to 28%

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(noiseVolume * 0.15, now);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start(now);
      lfo.start(now);

      // Store node pointers
      noiseSourceNodeRef.current = source;
      noiseGainNodeRef.current = gain;
      noiseFilterNodeRef.current = filter;

      // 4. Special fireplace crackle effect for Winter
      if (activeTerm.season === 'winter') {
        runWinterFireplaceCrackles(ctx, gain);
      } else if (activeTerm.season === 'spring') {
        runSpringRainDroplets(ctx, gain);
      }

      setIsWhiteNoisePlaying(true);
    } catch (err) {
      console.warn("White noise loading error:", err);
    }
  };

  // Fireplace pop generator: Schedules periodic randomized popping impulses
  const runWinterFireplaceCrackles = (ctx: AudioContext, outputGainNode: GainNode) => {
    const triggerPop = () => {
      if (!isWhiteNoisePlaying) return;
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const popGain = ctx.createGain();

      osc.type = 'triangle';
      // sudden high pitch descending pop
      osc.frequency.setValueAtTime(600 + Math.random() * 800, now);
      osc.frequency.exponentialRampToValueAtTime(10, now + 0.05);

      popGain.gain.setValueAtTime(0.02 + Math.random() * 0.03, now);
      popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(popGain);
      popGain.connect(outputGainNode);
      osc.start(now);
      osc.stop(now + 0.05);
    };

    // Periodically schedule random pops
    const intervalId = setInterval(() => {
      if (Math.random() > 0.45) {
        triggerPop();
      }
    }, 400);

    fireCrackNodeRef.current = intervalId;
  };

  // Spring rainwater droplet generator: Schedules light high clicks
  const runSpringRainDroplets = (ctx: AudioContext, outputGainNode: GainNode) => {
    const triggerDrop = () => {
      if (!isWhiteNoisePlaying) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const dropGain = ctx.createGain();

      osc.type = 'sine';
      // high rain ticking frequency
      osc.frequency.setValueAtTime(1200 + Math.random() * 600, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.02);

      dropGain.gain.setValueAtTime(0.01 + Math.random() * 0.015, now);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

      osc.connect(dropGain);
      dropGain.connect(outputGainNode);
      osc.start(now);
      osc.stop(now + 0.03);
    };

    const intervalId = setInterval(() => {
      if (Math.random() > 0.25) {
        triggerDrop();
      }
    }, 280);

    fireCrackNodeRef.current = intervalId;
  };

  const stopWhiteNoise = () => {
    // Clear crackle timers
    if (fireCrackNodeRef.current) {
      clearInterval(fireCrackNodeRef.current);
      fireCrackNodeRef.current = null;
    }

    try {
      if (noiseSourceNodeRef.current) {
        noiseSourceNodeRef.current.stop();
        noiseSourceNodeRef.current.disconnect();
        noiseSourceNodeRef.current = null;
      }
      setIsWhiteNoisePlaying(false);
    } catch (e) {
      console.warn("Audio stop clash:", e);
    }
  };

  useEffect(() => {
    // Sync live volume values
    if (noiseGainNodeRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      noiseGainNodeRef.current.gain.linearRampToValueAtTime(noiseVolume * 0.15, now + 0.1);
    }
  }, [noiseVolume]);

  // Handle unmount cleanups
  useEffect(() => {
    return () => {
      if (fireCrackNodeRef.current) clearInterval(fireCrackNodeRef.current);
      if (noiseSourceNodeRef.current) {
        try {
          noiseSourceNodeRef.current.stop();
        } catch(e){}
      }
    };
  }, []);

  // 4. BREATHING TIMER LOGIC: Traditional 4-4-4 breathing loop
  useEffect(() => {
    const timer = setInterval(() => {
      setBreathingSecRemaining(prev => {
        if (prev <= 1) {
          // Wrap/Cycle transition
          if (breathingPhase === 'inhale') {
            setBreathingPhase('hold');
            return 4; // hold for 4s
          } else if (breathingPhase === 'hold') {
            setBreathingPhase('exhale');
            return 4; // exhale for 4s
          } else {
            setBreathingPhase('inhale');
            setBreathingCyclesCompleted(c => c + 1);
            return 4; // inhale for 4s
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [breathingPhase]);

  // Audio decay on ripples
  useEffect(() => {
    if (bowlStrikeStrength > 0) {
      const sub = setInterval(() => {
        setBowlStrikeStrength(s => Math.max(0, s - 0.025));
      }, 50);
      return () => clearInterval(sub);
    }
  }, [bowlStrikeStrength]);

  // Custom text based on phase
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

  // White noise title
  const getNoiseTypeName = () => {
    switch (activeTerm.season) {
      case 'spring': return '🌸 春雨润物 (Spring Rain Chime)';
      case 'summer': return '🍃 绿竹随风 (Summer Bamboo Wind)';
      case 'autumn': return '🍁 空山秋晚 (Autumn Leaves Swell)';
      case 'winter': return '❄️ 木炭红炉 (Winter Hearth Crackle)';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[460px]">
      
      {/* COLUMN A: Dynamic Breathing & Singing Bowl Interaction (7 cols) */}
      <div className={`lg:col-span-7 rounded-2xl border p-5 flex flex-col justify-between items-center transition-colors duration-1000 ${
        isLight ? 'bg-white border-stone-200 shadow-sm' : 'bg-stone-900/35 border-stone-850'
      }`}>
        
        {/* Card Header information */}
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

        {/* Dynamic Breathing Bubble Ring Area */}
        <div className="my-6 flex flex-col items-center justify-center relative w-full h-[220px]">
          
          {/* Active Radiating Bowl Shockwave Circles (Ripples) */}
          {bowlStrikeStrength > 0 && (
            <div 
              className="absolute rounded-full border border-amber-600 pointer-events-none transition-all duration-300 -z-10 animate-ping"
              style={{
                width: `${100 + bowlStrikeStrength * 160}px`,
                height: `${100 + bowlStrikeStrength * 160}px`,
                opacity: bowlStrikeStrength * 0.65,
                transform: 'scale(1.2)'
              }}
            />
          )}

          {/* Breathing Visual Core - Scales smoothly via scale class */}
          <div 
            className={`w-36 h-36 rounded-full flex flex-col items-center justify-center relative transition-all duration-[4000ms] ease-in-out border shadow-inner ${
              breathingPhase === 'inhale' 
                ? 'bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/10' 
                : breathingPhase === 'hold'
                  ? 'bg-amber-600/10 border-amber-500/30 shadow-amber-500/10'
                  : 'bg-indigo-600/10 border-indigo-500/30 shadow-indigo-500/10'
            } ${breathingInfo.scaleClass}`}
          >
            {/* Countdown string */}
            <span className="text-[10.5px] font-serif tracking-widest text-stone-400 font-medium tracking-tight uppercase">
              {breathingPhase === 'inhale' ? '吸气 In' : breathingPhase === 'hold' ? '屏息 Hold' : '呼气 Out'}
            </span>
            <span className="text-4xl font-serif font-black text-stone-800 dark:text-stone-100 my-1 font-mono transition-transform duration-1000">
              {breathingSecRemaining}
            </span>
            <span className="text-[9px] font-sans text-stone-400">秒</span>

            {/* Glowing outer aura ring */}
            <div 
              className={`absolute inset-[-4px] rounded-full border border-dashed animate-spin transition-all duration-1000 ${
                breathingPhase === 'inhale' ? 'border-emerald-600/20' : breathingPhase === 'hold' ? 'border-amber-500/25' : 'border-indigo-500/20'
              }`}
              style={{ animationDuration: '20s' }}
            />
          </div>

          {/* Visual text descriptor underneath */}
          <div className="absolute bottom-[-10px] text-center">
            <h5 className={`font-serif text-sm font-black ${breathingInfo.textCol} tracking-widest transition-colors duration-1000`}>
              {breathingInfo.action}
            </h5>
            <p className="text-[10.5px] text-stone-400 mt-0.5 leading-snug">
              {breathingInfo.sub}
            </p>
          </div>
        </div>

        {/* Breathing Phase Progress Dots */}
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

      {/* COLUMN B: Bronze Singing Bowl Striker & Natural Audio Engine (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        
        {/* Interactive Physical Bronze Singing Bowl Card */}
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

          {/* Interactive Visual Bowl Graphics */}
          <div 
            onClick={strikeSingingBowl}
            className="cursor-pointer select-none group relative my-2 flex items-center justify-center w-28 h-28 transform active:scale-95 transition-transform"
          >
            {/* Radiating outer aura rings on hover */}
            <div className="absolute inset-[-10px] bg-amber-600/5 rounded-full group-hover:scale-105 transition-all duration-700 blur" />
            
            {/* CSS Bronze Bowl Gradient Representation */}
            <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-xl">
              {/* Outer circle rim */}
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
              {/* Inner ring */}
              <circle cx="50" cy="50" r="28" fill="url(#innerBronzeGradient)" stroke="#451a03" strokeWidth="0.5" />
              {/* Center auspicious pattern */}
              <path d="M 50 35 A 15 15 0 1 1 50 65 A 15 15 0 1 1 50 35 Z M 50 42 A 8 8 0 1 0 50 58 A 8 8 0 1 0 50 42 Z" fill="#451a03" opacity="0.3" />
              
              {/* Hot copper spot indicator when striking */}
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

        {/* Ambient Natural White Noise Control Module */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors duration-1000 ${
          isLight ? 'bg-white border-stone-200' : 'bg-stone-900/35 border-stone-850'
        }`}>
          <div>
            <span className="text-[10.5px] font-serif font-black text-stone-500 block mb-2">🌊 时时静聆物语 (White Noise Mixer)</span>
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-850">
              <span className={`text-[11.5px] font-serif font-bold ${isLight ? 'text-stone-800' : 'text-stone-300'}`}>
                {getNoiseTypeName()}
              </span>

              <button
                type="button"
                onClick={isWhiteNoisePlaying ? stopWhiteNoise : startWhiteNoise}
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

          {/* Volume Control bar */}
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
              onChange={(e) => setNoiseVolume(parseFloat(e.target.value))}
              className="w-full accent-amber-600 h-1 bg-stone-200 dark:bg-stone-800 rounded-lg cursor-ew-resize disabled:opacity-40"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
