import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  MapPin, 
  Compass, 
  Heart, 
  BookOpen, 
  Coffee, 
  ShoppingBag, 
  Volume2, 
  VolumeX,
  RefreshCw, 
  ChevronRight, 
  Clock, 
  Wind,
  HelpCircle,
  TrendingUp,
  Bookmark,
  MessageSquare,
  MessageSquareOff
} from 'lucide-react';
import { solarTerms } from './solarTermsData';
import { SolarTerm, ChatMessage, CreativeProduct } from './types';
import { ScentWheelMap } from './components/ScentWheelMap';
import { IncenseWorkshop } from './components/IncenseWorkshop';
import { SeasonalDiet } from './components/SeasonalDiet';
import { MeditationBowl } from './components/MeditationBowl';

// Helper to convert hexadecimal traditional custom colors into safe translucent RGBA strings
function hexToRgba(hexStr: string, alpha: number): string {
  try {
    const cleanHex = hexStr.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch (e) {
    return `rgba(220, 220, 225, ${alpha})`;
  }
}

export default function App() {
  // May 22 is Xiaoman (小满), let's pre-select it
  const [activeTermId, setActiveTermId] = useState<string>('xiaoman');
  const [activeTerm, setActiveTerm] = useState<SolarTerm>(solarTerms.find(t => t.id === 'xiaoman') || solarTerms[0]);
  const [isBrewing, setIsBrewing] = useState<boolean>(false);
  const [customSmokeColor, setCustomSmokeColor] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [chatInput, setChatInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      sender: 'agent',
      text: '折花相赠，见香如面。朋友，我是《廿四香笺》的香灵“芳华”。此间窗明几净，炉温尚存。不知您今日身心安好？若有半点疲惫与烦闷，尽可跟芳华语笑寒温，我将以四时的草木芬菲与温润诗词，为您拂去凡尘烦忧。',
      timestamp: new Date()
    }
  ]);
  const [isChatPending, setIsChatPending] = useState<boolean>(false);
  const [isChatExpanded, setIsChatExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'scent' | 'poem' | 'products' | 'chart' | 'workshop' | 'diet' | 'meditation'>('scent');
  const [searchTermQuery, setSearchTermQuery] = useState<string>('');
  const [termFilterSeason, setTermFilterSeason] = useState<'all' | 'spring' | 'summer' | 'autumn' | 'winter'>('all');
  
  // Poetic user-selectable presentation styles - representing four distinct seasonal pages
  const [layoutTheme, setLayoutTheme] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('summer');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const biquadFilterRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Auto scroll to chat end
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatPending]);

  // Update selected term object when ID changes
  useEffect(() => {
    const term = solarTerms.find(t => t.id === activeTermId);
    if (term) {
      setActiveTerm(term);
      setCustomSmokeColor(null); // Reset custom blended scent color
      // Automatically shift visual page theme to the selected term season
      setLayoutTheme(term.season as 'spring' | 'summer' | 'autumn' | 'winter');
      // Trigger a light pleasant aroma brewing change
      setIsBrewing(true);
      const timer = setTimeout(() => setIsBrewing(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [activeTermId]);

  // Incense smoke rendering logic (HTML5 Canvas responsive)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: { x: number; y: number; vx: number; vy: number; alpha: number; size: number; age: number; maxAge: number }[] = [];

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // We spawn smoke emitters in the center bottom
      const emitterX = canvas.width / 2;
      const emitterY = canvas.height - 30;

      // Draw the virtual burner base
      ctx.beginPath();
      ctx.arc(emitterX, emitterY + 5, 18, 0, Math.PI, true);
      ctx.fillStyle = '#4a3728';
      ctx.fill();

      // Golden burner glow
      ctx.beginPath();
      ctx.arc(emitterX, emitterY, 3, 0, Math.PI * 2);
      ctx.fillStyle = isBrewing ? '#ff9d42' : '#8c7665';
      ctx.shadowBlur = isBrewing ? 15 : 0;
      ctx.shadowColor = '#ff6c00';
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Emit new particles
      const spawnRate = isBrewing ? 3 : 1; 
      for (let i = 0; i < spawnRate; i++) {
        if (Math.random() < 0.6) {
          particles.push({
            x: emitterX + (Math.random() - 0.5) * 6,
            y: emitterY - 2,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -(Math.random() * 0.8 + 0.4),
            alpha: 0.85,
            size: Math.random() * 4 + 2,
            age: 0,
            maxAge: Math.random() * 80 + 100
          });
        }
      }

      // Update and draw existing particles
      particles = particles.filter(p => {
        p.age++;
        p.x += p.vx + Math.sin(p.age * 0.04) * 0.4; // wind drift
        p.y += p.vy;
        p.alpha = 1 - (p.age / p.maxAge);
        p.size += 0.08; // disperse

        if (p.age >= p.maxAge || p.x < 0 || p.x > canvas.width) return false;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        // Scent term traditional color for smoke hue!
        ctx.fillStyle = hexToRgba(customSmokeColor || activeTerm.color || '#ebd2a0', p.alpha * 0.28);
        ctx.fill();

        // Highlight center core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.20})`;
        ctx.fill();

        return true;
      });

      animationId = requestAnimationFrame(updateAndDraw);
    };

    updateAndDraw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      resizeObserver.disconnect();
    };
  }, [isBrewing, activeTerm, isChatExpanded]);

  // Audio Synthesis (Aesthetic low white-noise wind & gentle frequency resonant "incense rise")
  const toggleMute = () => {
    if (!isMuted) {
      // stop
      if (noiseSourceRef.current) {
        try { noiseSourceRef.current.stop(); } catch(e){}
        noiseSourceRef.current = null;
      }
      setIsMuted(true);
    } else {
      // start synthesis
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        // Generate pinkish/white noise for breeze
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Pink-like filter
          output[i] = (lastOut * 0.98 + white * 0.02);
          lastOut = output[i];
          output[i] *= 3.5; // Gain compensation
        }

        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);
        filter.Q.setValueAtTime(1.5, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime);

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        source.start();
        
        noiseSourceRef.current = source;
        biquadFilterRef.current = filter;
        gainNodeRef.current = gainNode;
        audioContextRef.current = ctx;
        setIsMuted(false);
      } catch (err) {
        console.warn("Audio Context init blocked:", err);
      }
    }
  };

  // Keep track of active oscillators to stop potential audio stacking
  const brewOscillatorsRef = useRef<OscillatorNode[]>([]);

  const playBrewSound = () => {
    // 1. Clean up old active oscillators to resolve sound superposition overlap
    brewOscillatorsRef.current.forEach(osc => {
      try { osc.stop(); } catch(e){}
    });
    brewOscillatorsRef.current = [];

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = audioContextRef.current || new AudioContextClass();
      if (!audioContextRef.current) {
        audioContextRef.current = ctx;
      }

      // Resume context if browser suspended it (security precaution)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // 2. Play a serene ancient copper chime/temple bowl sound to match the incense aesthetic
      // Tuned pentatonic frequencies (warm G-major-like harmonic series)
      const rootFreq = 261.63; // C4 Middle C, warm and tranquil
      const partials = [1.0, 1.5, 2.0, 2.5, 3.0];
      const gains = [0.12, 0.06, 0.04, 0.02, 0.01];

      partials.forEach((ratio, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(rootFreq * ratio, now);

        // Smooth decaying volume envelope to emulate acoustic resonance
        oscGain.gain.setValueAtTime(gains[idx] * 0.45, now);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5); // 4.5 seconds decay

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);

        osc.start(now);
        brewOscillatorsRef.current.push(osc);
      });

      // 3. Crackling Sparkle (high-pass match friction sound) to make candle lighting feel tangible
      const bufferSize = ctx.sampleRate * 0.12; // 120ms snap
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(3200, now);
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.01, now);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseSource.start(now);

    } catch (e) {
      console.warn("Unable to play custom brew chime:", e);
    }
  };

  // Modulate wind filtering live when brewing incense for immersion
  useEffect(() => {
    if (!isMuted && biquadFilterRef.current && audioContextRef.current && gainNodeRef.current) {
      const now = audioContextRef.current.currentTime;
      if (isBrewing) {
        // High filter frequency for rising heat/smoke (subtle & elegant frequency adjustment)
        biquadFilterRef.current.frequency.exponentialRampToValueAtTime(750, now + 2.5);
        gainNodeRef.current.gain.linearRampToValueAtTime(0.045, now + 2.5);
      } else {
        biquadFilterRef.current.frequency.exponentialRampToValueAtTime(350, now + 2);
        gainNodeRef.current.gain.linearRampToValueAtTime(0.03, now + 2);
      }
    }
  }, [isBrewing, isMuted]);

  // Clean audio on unmount
  useEffect(() => {
    return () => {
      if (noiseSourceRef.current) {
        try { noiseSourceRef.current.stop(); } catch(e){}
      }
      brewOscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch(e){}
      });
    };
  }, []);

  // Send message to Qwen (DashScope) server API
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatPending) return;

    setIsChatExpanded(true); // Auto expand chat if collapsed when messaging
    const userMsgText = chatInput;
    const userMsgId = `msg-user-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: userMsgText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setIsChatPending(true);

    try {
      // Package conversation brief logs to maintain context
      const chatHistory = messages.slice(-8).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch(`${import.meta.env.BASE_URL}api/qwen/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgText,
          history: chatHistory,
          currentTermId: activeTermId
        })
      });

      if (!res.ok) {
        throw new Error('API request failed');
      }

      const data = await res.json();
      
      const agentMsgId = `msg-agent-${Date.now()}`;
      const agentMsg: ChatMessage = {
        id: agentMsgId,
        sender: 'agent',
        text: data.text || '小笺微湿，风动尘封。香灵刚才有一刹那思绪游离，还望朋友不吝海涵。',
        timestamp: new Date(),
        suggestedTermId: data.suggestedTermId || undefined
      };

      setMessages(prev => [...prev, agentMsg]);

      // If AI recommends a different solar term, automatically offer a highlight transition or handle it
      if (data.suggestedTermId && data.suggestedTermId !== activeTermId) {
        const potentialTerm = solarTerms.find(t => t.id === data.suggestedTermId);
        if (potentialTerm) {
          // Highlight transition after a short delay
          setTimeout(() => {
            setActiveTermId(potentialTerm.id);
          }, 1500);
        }
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `msg-err-${Date.now()}`,
        sender: 'agent',
        text: '【琴弦忽凝，暂难听香】远方的山岚笼罩了一层迷雾。此时，不妨且抚长烟，深吸一束静木之香。',
        timestamp: new Date()
      }]);
    } finally {
      setIsChatPending(false);
    }
  };

  // Pre-configured preset queries to click
  const presets = [
    { label: "疲劳安神", request: "今天项目劳累了一整天，感觉心神不定，好累啊..." },
    { label: "内心郁结", request: "生活好繁杂，感觉焦虑闷气，有推荐的清心静香和诗词吗？" },
    { label: "冬夜温暖", request: "天冷的时候感觉有些孤独，想在窗边温酒围炉，聊聊古典浪漫" }
  ];

  const handleApplyPreset = (text: string) => {
    setChatInput(text);
  };

  // Filter solar terms list based on search/season
  const filteredTerms = solarTerms.filter(t => {
    const matchesSearch = t.name.includes(searchTermQuery) || t.englishName.toLowerCase().includes(searchTermQuery.toLowerCase()) || t.incenseName.includes(searchTermQuery);
    const matchesSeason = termFilterSeason === 'all' || t.season === termFilterSeason;
    return matchesSearch && matchesSeason;
  });

  const termColor = activeTerm.color || '#ebd2a0';
  const termTextColor = activeTerm.textColor || '#ebd2a0';

  // Compute theme styles based on active term traditional color and user layout theme
  const getThemeStyles = () => {
    if (layoutTheme === 'spring') {
      // 🌸 SPRING THEME: Fresh bright pale green & soft blossoms backdrop (Bright, delicate, lush)
      return {
        bodyBg: 'bg-[#fafdfa] text-stone-800 selection:bg-emerald-100 selection:text-emerald-950',
        headerBg: 'bg-[#fafdfa]/95 border-emerald-900/10 text-stone-800 shadow-sm',
        headerText: 'text-emerald-950 font-bold font-serif',
        headerSubtitle: 'text-emerald-700/80',
        cardBg: 'bg-[#fafdfa]/90 border-[#cce7cd] backdrop-blur-md text-stone-800 shadow-[0_4px_24px_rgba(34,197,94,0.02)]',
        cardBorder: 'border-[#cce7cd]',
        inputBg: 'bg-white border-[#b7dfb9] text-[#1b3d21] placeholder-stone-405 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500',
        presetBtn: 'bg-[#ecf7ed] border-emerald-200 hover:border-emerald-500 hover:bg-emerald-100/70 text-emerald-800',
        chatBubbleAgent: 'bg-[#edf9ec]/95 border-[#cfead1] text-[#204a25]',
        chatBubbleUser: 'bg-[#fbf4e8]/90 border-[#ebd8bc] text-[#714f24]',
        activeTermButton: 'bg-white border-emerald-600 text-emerald-800 shadow-sm font-semibold',
        inactiveTermButton: 'bg-white/50 border-emerald-900/10 text-stone-500 hover:text-emerald-850 hover:border-emerald-300',
        glowStyle: { boxShadow: `0 10px 30px -4px ${hexToRgba(termColor, 0.22)}` },
        textColorAccent: 'text-emerald-800',
        borderColorAccent: 'border-emerald-200',
        bulletTag: 'bg-emerald-50/60 border-emerald-100 text-[#1b4322]',
        systemBanner: 'bg-[#edf7eb] border-[#daecd7] text-[#183d1e]',
        tabBg: 'bg-emerald-100/40 border-emerald-250/50',
        tabItemActiveBg: 'bg-white text-emerald-900 shadow-sm',
        tabItemInactiveText: 'text-emerald-750/70 hover:text-emerald-800',
        tabContentBg: 'bg-[#f9fdfa]/90',
        contentCardBg: 'bg-[#edf9ec]/60 border-[#cfead1]',
        contentCardBorder: 'border-[#cfead1]',
        textColorMain: 'text-stone-800',
        textColorSecondary: 'text-stone-650',
        poemCardBg: 'bg-[#f4fbf3] border-[#cfead1]',
        poemCardBorder: 'border-[#cfead1]',
        poemScrollLineColor: 'bg-[#b7dfb9]/50',
        poemTextColor: 'text-[#1e3f24]',
        borderDivider: 'border-[#daecd7]',
        isLight: true
      };
    } else if (layoutTheme === 'summer') {
      // 🍃 SUMMER THEME: Cooling immersive dark forest & indigo thunderstorms (Refreshing dark mode)
      return {
        bodyBg: 'bg-[#061112] text-teal-100 selection:bg-teal-850 selection:text-white',
        headerBg: 'bg-stone-950/80 border-teal-900/40 text-teal-200',
        headerText: 'text-teal-100',
        headerSubtitle: 'text-teal-400/60',
        cardBg: 'bg-[#101b1c]/80 backdrop-blur-md border-[#1a3739]/80 text-[#cfd9dc]',
        cardBorder: 'border-[#1a3739]/80',
        inputBg: 'bg-[#081012] border-[#183133] text-teal-200 placeholder-teal-800 focus:border-teal-400',
        presetBtn: 'bg-teal-950/40 border-teal-900/60 text-teal-400 hover:text-teal-200 hover:border-teal-450',
        chatBubbleAgent: 'bg-[#0c1f21] border-[#1b3e40] text-teal-100',
        chatBubbleUser: 'bg-[#2a1d0f]/80 border-[#543b1e]/30 text-[#e9cca0]',
        activeTermButton: 'bg-[#122426] border-teal-500 text-teal-300',
        inactiveTermButton: 'bg-[#0b1315]/80 border-teal-950/85 text-teal-600/80 hover:text-teal-400 hover:border-teal-900',
        glowStyle: { boxShadow: `0 10px 32px -6px ${hexToRgba(termColor, 0.25)}` },
        textColorAccent: 'text-teal-400',
        borderColorAccent: 'border-teal-900/50',
        bulletTag: 'bg-[#122426] border-teal-950 text-teal-400',
        systemBanner: 'bg-[#0b1c1d] border-[#132c2e] text-teal-450 font-serif',
        tabBg: 'bg-stone-950/40 border-teal-950',
        tabItemActiveBg: 'bg-[#122426] text-teal-300 shadow-sm border border-teal-900/35',
        tabItemInactiveText: 'text-[#2e7478] hover:text-teal-400',
        tabContentBg: 'bg-stone-950/20',
        contentCardBg: 'bg-[#132325]/70 border-[#203a3d]',
        contentCardBorder: 'border-[#203a3d]',
        textColorMain: 'text-[#cfd9dc]',
        textColorSecondary: 'text-[#87acb0]',
        poemCardBg: 'bg-[#112123] border-[#1d383b]',
        poemCardBorder: 'border-[#1d383b]',
        poemScrollLineColor: 'bg-[#1b4347]',
        poemTextColor: 'text-teal-250',
        borderDivider: 'border-teal-950/65',
        isLight: false
      };
    } else if (layoutTheme === 'autumn') {
      // 🍁 AUTUMN THEME: Cozy warmth golden terracotta-amber (Warm bright bookish parchment)
      return {
        bodyBg: 'bg-[#faf5eb] text-stone-850 selection:bg-amber-100 selection:text-[#321703]',
        headerBg: 'bg-[#faf6ee]/95 border-[#dfd2be] text-stone-800 shadow-sm',
        headerText: 'text-amber-950 font-serif font-bold',
        headerSubtitle: 'text-[#8c5932]',
        cardBg: 'bg-[#fcfaf5]/95 border-[#e6d8c0] text-stone-800 shadow-[0_4px_24px_rgba(113,87,55,0.03)]',
        cardBorder: 'border-[#e6d8c0]',
        inputBg: 'bg-white border-[#ebdcc1] text-stone-850 placeholder-stone-400 focus:border-amber-700',
        presetBtn: 'bg-[#f5ead6] border-[#dfcea9] hover:bg-[#ebdcc1] text-amber-900',
        chatBubbleAgent: 'bg-[#f4e6ce]/95 border-[#e7d2af] text-stone-900',
        chatBubbleUser: 'bg-[#faf1e1]/90 border-[#f1e0be] text-amber-950',
        activeTermButton: 'bg-white border-amber-600 text-[#8a521e] shadow-sm font-semibold',
        inactiveTermButton: 'bg-[#f8f2e7]/80 border-[#ebd2a8]/40 text-stone-500 hover:text-[#8a521e] hover:border-amber-600/40',
        glowStyle: { boxShadow: `0 8px 30px -4px ${hexToRgba(termColor, 0.28)}` },
        textColorAccent: 'text-[#9e5c1e]',
        borderColorAccent: 'border-[#dfcca0]',
        bulletTag: 'bg-[#f5e9d2] border-[#e6d3af] text-amber-950',
        systemBanner: 'bg-[#ebdcb9]/40 border-[#dfcaa4] text-[#7d512a]',
        tabBg: 'bg-[#efe3cc]/50 border-[#dfcaa1]/80',
        tabItemActiveBg: 'bg-white text-amber-900 shadow-sm border border-amber-900/10',
        tabItemInactiveText: 'text-[#7d512a]/70 hover:text-amber-900',
        tabContentBg: 'bg-[#fcfbf7]/90',
        contentCardBg: 'bg-[#f5ead5]/70 border-[#e7d2af]',
        contentCardBorder: 'border-[#e7d2af]',
        textColorMain: 'text-stone-850',
        textColorSecondary: 'text-[#704e31]',
        poemCardBg: 'bg-[#f5ead6] border-[#dfca9f]',
        poemCardBorder: 'border-[#dfca9f]',
        poemScrollLineColor: 'bg-[#dfca9f]/60',
        poemTextColor: 'text-amber-950',
        borderDivider: 'border-[#ebdcc1]',
        isLight: true
      };
    } else {
      // ❄️ WINTER THEME: Sublime minimalist slate-blue & frosted silver landscape (Crisp elegant calm)
      return {
        bodyBg: 'bg-[#edf2f6] text-slate-800 selection:bg-[#f6e5e8] selection:text-slate-900',
        headerBg: 'bg-white/95 border-slate-200 text-slate-850 shadow-sm',
        headerText: 'text-slate-950 font-bold font-serif',
        headerSubtitle: 'text-slate-500',
        cardBg: 'bg-white/90 border-[#cfdbe5] backdrop-blur-md text-slate-800 shadow-[0_4px_24px_rgba(148,163,184,0.03)]',
        cardBorder: 'border-[#cfdbe5]',
        inputBg: 'bg-slate-50/50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#a13b48]',
        presetBtn: 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-[#a13b48]',
        chatBubbleAgent: 'bg-[#f0f4f8]/95 border-slate-200 text-slate-900',
        chatBubbleUser: 'bg-[#fbebee]/90 border-[#f3d4d8] text-[#912d3b]',
        activeTermButton: 'bg-white border-[#a13b48] text-[#a13b48] shadow-sm font-semibold',
        inactiveTermButton: 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-350',
        glowStyle: { boxShadow: `0 8px 28px -4px ${hexToRgba(termColor, 0.18)}` },
        textColorAccent: 'text-[#a13b48]',
        borderColorAccent: 'border-slate-250',
        bulletTag: 'bg-slate-100/50 border-slate-200 text-slate-650',
        systemBanner: 'bg-slate-100/90 border-slate-200 text-slate-600',
        tabBg: 'bg-slate-100/80 border-slate-200',
        tabItemActiveBg: 'bg-white text-slate-900 shadow-sm border border-slate-200',
        tabItemInactiveText: 'text-slate-500 hover:text-slate-850',
        tabContentBg: 'bg-white/95',
        contentCardBg: 'bg-[#f1f6fa]/85 border-[#d2dfeb]',
        contentCardBorder: 'border-[#d2dfeb]',
        textColorMain: 'text-slate-850',
        textColorSecondary: 'text-slate-600',
        poemCardBg: 'bg-[#f8fafc] border-slate-250',
        poemCardBorder: 'border-slate-250',
        poemScrollLineColor: 'bg-slate-300/50',
        poemTextColor: 'text-slate-900',
        borderDivider: 'border-slate-200',
        isLight: true
      };
    }
  };

  const styles = getThemeStyles();

  return (
    <div className={`min-h-screen ${styles.bodyBg} flex flex-col font-sans relative overflow-hidden transition-colors duration-1000`}>
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


      </header>

      {/* Split screen canvas structure */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 min-h-0">
        
        {/* LEFT COLUMN: 24 Solar terms list and detail (Bento Grid) - 7 columns */}
        <section className={`${isChatExpanded ? 'lg:col-span-7' : 'lg:col-span-12'} flex flex-col gap-6 min-h-0 transition-all duration-500`}>
          
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

              {/* Sound and Brew controllers side-by-side */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto text-[#ecdcae]">
                {/* 听风 (Sound toggle controller) */}
                <button 
                  type="button"
                  onClick={toggleMute}
                  className={`px-4 py-2 rounded-xl text-xs font-serif font-semibold tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    isMuted 
                      ? 'bg-stone-900/40 border-stone-800/60 text-stone-450 hover:text-stone-300 hover:bg-stone-900/60' 
                      : 'bg-[#0f241a]/60 border-emerald-800 text-emerald-400 shadow-sm shadow-emerald-950/20'
                  }`}
                  title="点击启闭传统自然山峦低吟背景乐（合成白噪声）"
                >
                  {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} className="animate-pulse" />}
                  <span>{isMuted ? '听风' : '听风中'}</span>
                </button>

                {/* 试香 (Brew trigger) */}
                <button
                  type="button"
                  onClick={() => {
                    setIsBrewing(true);
                    playBrewSound();
                    // Auto off after 8s
                    const timer = setTimeout(() => setIsBrewing(false), 8000);
                    return () => clearTimeout(timer);
                  }}
                  className={`px-5 py-2 rounded-xl text-xs font-serif font-semibold tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer bg-gradient-to-r ${
                    isBrewing 
                      ? 'from-amber-600 to-amber-700 text-stone-950 shadow-md scale-95 shadow-amber-900/20'
                      : 'from-amber-900/30 to-amber-800/20 text-[#ecdcae] border border-amber-800/30 hover:border-amber-700/50 hover:from-amber-900/40'
                  }`}
                >
                  <Wind size={14} className={isBrewing ? 'animate-spin' : ''} />
                  <span>{isBrewing ? '试香中...' : '试香'}</span>
                </button>
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
                    <div className="absolute top-3 left-3 text-[10px] font-mono text-stone-550 uppercase tracking-widest z-10 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shadow-sm" />
                      氤氲炉烟模拟
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

                    <div className="text-center font-serif text-[11px] text-stone-500 border-t border-stone-200/20 dark:border-stone-900 pt-2 bg-gradient-to-t from-stone-950/20">
                      配有声学气流防尘器 · 支持背景风吟
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
                          <img 
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
                    activeTerm={activeTerm}
                    isLight={styles.isLight}
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

        {/* RIGHT COLUMN: Chat module (The Intelligent Agent Sanctuary) - 5 columns */}
        <section className={`${isChatExpanded ? 'flex lg:col-span-5' : 'hidden'} ${styles.cardBg} rounded-2xl border ${styles.cardBorder} flex-col overflow-hidden shadow-md h-[550px] lg:h-auto min-h-0 transition-colors duration-1000`}>
          
          {/* Agent status banner */}
          <div className={`p-4 border-b ${styles.cardBorder} bg-stone-950/20 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center border shadow-inner transition-colors duration-1000"
                  style={{
                    backgroundColor: termColor,
                    borderColor: hexToRgba(termColor, 0.3)
                  }}
                >
                  <span className="font-serif text-sm text-stone-900 font-bold">芳</span>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-stone-300 dark:border-[#16171c]" />
              </div>
              <div>
                <h3 className={`text-xs font-serif font-bold ${styles.textColorMain}`}>芳华香灵 · 客斋</h3>
                <span className="text-[10px] text-stone-500 block transition-colors duration-1000">四时心愈顾问 · 在线研读</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setMessages([
                    {
                      id: `m-reset-${Date.now()}`,
                      sender: 'agent',
                      text: '画卷重开，香屑拂净。芳华在此，朋友可有任何心结郁闷？今天也想跟芳华探讨哪一个节气的香调配伍呢？',
                      timestamp: new Date()
                    }
                  ]);
                }}
                className={`text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 font-sans text-xs flex items-center gap-1 bg-stone-900/10 px-2.5 py-1 rounded-lg border ${styles.cardBorder} cursor-pointer transition-colors duration-1000`}
                title="重置香灵对话，拂平香屑"
              >
                <RefreshCw size={11} />
                <span>拂尘重新</span>
              </button>

              <button
                type="button"
                onClick={() => setIsChatExpanded(false)}
                className={`text-stone-500 hover:text-stone-850 dark:hover:text-stone-300 font-sans text-xs flex items-center justify-center bg-stone-900/10 p-1.5 rounded-lg border ${styles.cardBorder} cursor-pointer transition-colors duration-1000`}
                title="收起/关闭此对话模块"
              >
                <MessageSquareOff size={11} />
              </button>
            </div>
          </div>

          {/* Interactive instruction presets block */}
          <div className={`px-4 py-2 border-b ${styles.cardBorder} ${styles.systemBanner} shadow-inner transition-colors duration-1000`}>
            <span className="text-[10px] font-serif block opacity-78">您可以用这些心境短语敲门：</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5 pb-1">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p.request)}
                  className={`px-2 py-0.5 rounded-full text-[10px] cursor-pointer transition-all duration-1000 ${
                    styles.isLight
                      ? 'bg-white hover:bg-stone-100 border-[#dfd9cb] text-stone-600 hover:text-stone-900'
                      : 'bg-stone-900 border-stone-800/80 hover:border-teal-900 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className={`flex-1 p-4 overflow-y-auto space-y-4 relative transition-colors duration-1000 ${styles.isLight ? 'bg-[#fcfaf4]/50 font-sans' : 'bg-stone-950/20 font-sans'}`}>
            
            {messages.map((msg) => {
              const isAgent = msg.sender === 'agent';
              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 max-w-[85%] ${isAgent ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  {/* Avatar wrapper */}
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center font-serif text-xs select-none ${
                    isAgent 
                      ? 'bg-gradient-to-br from-amber-950 to-amber-750 text-stone-100 border border-amber-650/30' 
                      : 'bg-stone-300 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-400/30 dark:border-stone-700'
                  }`}>
                    {isAgent ? '芳' : '客'}
                  </div>

                  {/* Message body */}
                  <div className="space-y-2">
                    <div className={`px-3 py-2.5 rounded-2xl text-xs leading-relaxed font-sans border shadow-sm ${
                      isAgent 
                        ? styles.chatBubbleAgent 
                        : styles.chatBubbleUser
                    }`}>
                      {/* Markdown rendering logic natively inside simple block */}
                      <div className="space-y-1.5 whitespace-pre-wrap text-justify">
                        {msg.text.split('\n').map((line, lidx) => {
                          if (line.startsWith('>')) {
                            // Render blockquote with poetic color
                            return (
                              <blockquote key={lidx} className="border-l-2 border-[#b8a688] pl-2.5 py-0.5 italic my-1.5 text-stone-500 dark:text-stone-400 text-[11px] font-serif bg-stone-900/10">
                                {line.replace(/^>\s*/, '')}
                              </blockquote>
                            );
                          }
                          // Handle bold elements inside strings
                          if (line.includes('**')) {
                            const parsed = line.split('**');
                            return (
                              <p key={lidx}>
                                {parsed.map((chunk, cidx) => cidx % 2 === 1 ? <strong key={cidx} className="text-amber-700 dark:text-[#ebd1a0] font-bold">{chunk}</strong> : chunk)}
                              </p>
                            );
                          }
                          return <p key={lidx}>{line}</p>;
                        })}
                      </div>

                      {/* Recommend trigger inside Agent response */}
                      {msg.suggestedTermId && msg.suggestedTermId !== activeTermId && (
                        <div className={`mt-3.5 pt-2.5 border-t flex flex-col gap-2 ${styles.isLight ? 'border-amber-900/10' : 'border-stone-850/30'}`}>
                          <span className="text-[10px] text-stone-500 font-sans italic">
                            香灵感知您的心情更契合 ── <strong>{solarTerms.find(t => t.id === msg.suggestedTermId)?.name}</strong> 节气的呼吸：
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (msg.suggestedTermId) {
                                setActiveTermId(msg.suggestedTermId);
                              }
                            }}
                            className="bg-amber-900/15 hover:bg-amber-900/25 border border-amber-800/20 text-amber-900 dark:text-[#ecebe6] px-3 py-1.5 rounded-lg text-[10px] cursor-pointer font-serif flex items-center justify-between transition-colors w-full"
                          >
                            <span>瞬息投奔「{solarTerms.find(t => t.id === msg.suggestedTermId)?.name}」香气意境</span>
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI typing state */}
            {isChatPending && (
              <div className="flex gap-3 max-w-[80%] mr-auto items-center animate-pulse">
                <div className="w-7 h-7 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center font-serif text-xs text-stone-400">
                  芳
                </div>
                <div className={`px-3 py-2 rounded-2xl border text-[11px] font-serif ${styles.chatBubbleAgent}`}>
                  香灵正在抚琴研香，请宽坐片刻...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Form input */}
          <form 
            onSubmit={handleSendMessage}
            className={`p-3 border-t flex gap-2 items-center transition-colors duration-1000 ${
              styles.isLight ? 'bg-[#f4efe4] border-[#e2dcd0]' : 'bg-stone-950 border-stone-800'
            }`}
          >
            <input
              type="text"
              placeholder={isChatPending ? "琴声清润，请待其答复..." : "与香灵诉说心愿、烦郁或考问诗香..."}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isChatPending}
              className={`flex-1 ${styles.inputBg} border rounded-xl py-2 px-3 text-xs focus:outline-none disabled:opacity-50 transition-colors duration-1000`}
            />
            <button
              type="submit"
              disabled={isChatPending || !chatInput.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-900 to-amber-800 hover:from-amber-800 hover:to-amber-700 text-stone-200 hover:text-white disabled:opacity-30 disabled:from-stone-900 disabled:to-stone-900 transition-all cursor-pointer flex items-center justify-center border border-amber-850/15"
              title="发送致意"
            >
              <Send size={14} />
            </button>
          </form>

        </section>

      </main>

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

      {/* Elegant Floating Chat Toggle with traditional style pulsing ornament */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5 group">
        {!isChatExpanded && (
          <div 
            style={{ 
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              background: 'rgba(20, 18, 14, 0.95)',
              borderColor: hexToRgba(activeTerm.color || '#937b51', 0.4)
            }}
            className="border text-[#ecdcae] text-[11px] font-serif px-3.5 py-2 rounded-xl tracking-widest whitespace-nowrap shadow-2xl mr-1 flex items-center gap-1.5 cursor-pointer hover:bg-stone-900 transition-colors pointer-events-auto"
            onClick={() => setIsChatExpanded(true)}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: activeTerm.color }} />
            与香灵“芳华”倾谈
          </div>
        )}
        
        <button
          type="button"
          onClick={() => setIsChatExpanded(!isChatExpanded)}
          style={{ 
            boxShadow: `0 8px 24px rgba(0, 0, 0, 0.5), 0 0 12px ${hexToRgba(activeTerm.color || '#d1a876', 0.35)}`,
            borderColor: hexToRgba(activeTerm.color || '#d1a876', 0.5)
          }}
          className={`relative w-12 h-12 rounded-full border flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-110 active:scale-95 ${
            isChatExpanded 
              ? 'bg-amber-950/70 text-amber-550 border-amber-800/40 hover:bg-amber-950/90' 
              : 'bg-[#151310] hover:bg-[#1a1814] text-[#ebd2a0]'
          }`}
          title="点击开启/关闭右侧芳华智能对话模块"
        >
          {/* Subtle slow ping ripple when chat is closed */}
          {!isChatExpanded && (
            <span className="absolute inset-0 rounded-full animate-ping opacity-30 pointer-events-none" style={{ border: `1px solid ${activeTerm.color || '#d1a876'}` }} />
          )}
          
          {isChatExpanded ? (
            <MessageSquareOff size={18} className="relative z-10 transition-transform" />
          ) : (
            <MessageSquare size={18} className="relative z-10" />
          )}
          
          {!isChatExpanded && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-600 rounded-full border border-[#151310]" />
          )}
        </button>
      </div>
    </div>
  );
}
