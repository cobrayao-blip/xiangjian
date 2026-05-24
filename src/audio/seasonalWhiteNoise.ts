export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

interface SeasonNoiseProfile {
  label: string;
  freqValue: number;
  qValue: number;
  lfoRate: number;
  lfoDepthRatio: number;
  effect: 'rain' | 'breeze' | 'leaves' | 'hearth';
}

export const SEASON_NOISE_PROFILES: Record<Season, SeasonNoiseProfile> = {
  spring: {
    label: '🌸 春雨润物 (Spring Rain Chime)',
    freqValue: 720,
    qValue: 0.65,
    lfoRate: 0.09,
    lfoDepthRatio: 0.22,
    effect: 'rain',
  },
  summer: {
    label: '🍃 绿竹随风 (Summer Bamboo Wind)',
    freqValue: 880,
    qValue: 0.42,
    lfoRate: 0.28,
    lfoDepthRatio: 0.35,
    effect: 'breeze',
  },
  autumn: {
    label: '🍁 空山秋晚 (Autumn Leaves Swell)',
    freqValue: 520,
    qValue: 1.35,
    lfoRate: 0.11,
    lfoDepthRatio: 0.24,
    effect: 'leaves',
  },
  winter: {
    label: '❄️ 木炭红炉 (Winter Hearth Crackle)',
    freqValue: 240,
    qValue: 0.95,
    lfoRate: 0.06,
    lfoDepthRatio: 0.18,
    effect: 'hearth',
  },
};

export function getSeasonNoiseLabel(season: Season): string {
  return SEASON_NOISE_PROFILES[season].label;
}

function createPinkNoiseBuffer(ctx: AudioContext, seconds = 3): AudioBuffer {
  const bufferSize = seconds * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

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
    data[i] *= 0.11;
    b6 = white * 0.115926;
  }

  return buffer;
}

export class SeasonalWhiteNoiseEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private mainGain: GainNode | null = null;
  private seasonInterval: ReturnType<typeof setInterval> | null = null;
  private stoppableNodes: Array<AudioBufferSourceNode | OscillatorNode> = [];
  private connectedNodes: AudioNode[] = [];
  private playing = false;
  private volume = 0.3;
  private activeSeason: Season | null = null;
  private generation = 0;

  isPlaying(): boolean {
    return this.playing;
  }

  getActiveSeason(): Season | null {
    return this.activeSeason;
  }

  start(season: Season, volume: number): void {
    this.teardownGraph();
    this.volume = volume;
    this.activeSeason = season;
    const currentGeneration = this.generation;
    this.buildGraph(season, currentGeneration);
    this.playing = true;
  }

  stop(): void {
    this.teardownGraph();
    this.playing = false;
    this.activeSeason = null;
  }

  setVolume(volume: number): void {
    this.volume = volume;
    if (this.mainGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.mainGain.gain.cancelScheduledValues(now);
      this.mainGain.gain.linearRampToValueAtTime(volume * 0.15, now + 0.08);
    }
  }

  dispose(): void {
    this.stop();
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {
        // ignore
      }
      this.masterGain = null;
    }
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }

  private getCtx(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private trackNode(node: AudioNode): void {
    this.connectedNodes.push(node);
    if (node instanceof AudioBufferSourceNode || node instanceof OscillatorNode) {
      this.stoppableNodes.push(node);
    }
  }

  private connectToMaster(node: AudioNode): void {
    if (!this.masterGain) return;
    node.connect(this.masterGain);
  }

  private teardownGraph(): void {
    this.generation += 1;

    if (this.seasonInterval) {
      clearInterval(this.seasonInterval);
      this.seasonInterval = null;
    }

    for (const node of this.stoppableNodes) {
      try {
        node.stop();
      } catch {
        // ignore
      }
    }

    for (const node of this.connectedNodes) {
      try {
        node.disconnect();
      } catch {
        // ignore
      }
    }

    this.stoppableNodes = [];
    this.connectedNodes = [];
    this.mainGain = null;
  }

  private buildGraph(season: Season, generation: number): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    const profile = SEASON_NOISE_PROFILES[season];
    const buffer = createPinkNoiseBuffer(ctx);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    this.trackNode(source);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(profile.freqValue, now);
    filter.Q.setValueAtTime(profile.qValue, now);
    this.trackNode(filter);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(profile.lfoRate, now);
    this.trackNode(lfo);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(profile.freqValue * profile.lfoDepthRatio, now);
    this.trackNode(lfoGain);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.15, now);
    this.trackNode(gain);
    this.mainGain = gain;

    if (season === 'spring') {
      const rainBodyFilter = ctx.createBiquadFilter();
      rainBodyFilter.type = 'lowpass';
      rainBodyFilter.frequency.setValueAtTime(1100, now);
      rainBodyFilter.Q.setValueAtTime(0.5, now);
      this.trackNode(rainBodyFilter);

      const rainBodyGain = ctx.createGain();
      rainBodyGain.gain.setValueAtTime(this.volume * 0.06, now);
      this.trackNode(rainBodyGain);

      source.connect(rainBodyFilter);
      rainBodyFilter.connect(rainBodyGain);
      this.connectToMaster(rainBodyGain);
    }

    if (season === 'winter') {
      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.setValueAtTime(180, now);
      this.trackNode(rumbleFilter);

      const rumbleGain = ctx.createGain();
      rumbleGain.gain.setValueAtTime(this.volume * 0.05, now);
      this.trackNode(rumbleGain);

      source.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      this.connectToMaster(rumbleGain);
    }

    source.connect(filter);
    filter.connect(gain);
    this.connectToMaster(gain);

    source.start(now);
    lfo.start(now);

    this.scheduleSeasonEffect(ctx, season, gain, generation);
  }

  private scheduleSeasonEffect(
    ctx: AudioContext,
    season: Season,
    outputGainNode: GainNode,
    generation: number,
  ): void {
    const profile = SEASON_NOISE_PROFILES[season];

    const isActive = () => this.playing && this.generation === generation;

    const triggerRainDrop = () => {
      if (!isActive()) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const dropGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400 + Math.random() * 800, t);
      osc.frequency.exponentialRampToValueAtTime(520, t + 0.025);
      dropGain.gain.setValueAtTime(0.012 + Math.random() * 0.018, t);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
      osc.connect(dropGain);
      dropGain.connect(outputGainNode);
      osc.start(t);
      osc.stop(t + 0.04);
    };

    const triggerRainWash = () => {
      if (!isActive()) return;
      const t = ctx.currentTime;
      const washSize = Math.floor(ctx.sampleRate * 0.12);
      const washBuffer = ctx.createBuffer(1, washSize, ctx.sampleRate);
      const washData = washBuffer.getChannelData(0);
      for (let i = 0; i < washSize; i++) {
        washData[i] = (Math.random() * 2 - 1) * (1 - i / washSize);
      }
      const washSource = ctx.createBufferSource();
      washSource.buffer = washBuffer;
      const washFilter = ctx.createBiquadFilter();
      washFilter.type = 'bandpass';
      washFilter.frequency.setValueAtTime(900 + Math.random() * 400, t);
      washFilter.Q.setValueAtTime(0.7, t);
      const washGain = ctx.createGain();
      washGain.gain.setValueAtTime(0.018 + Math.random() * 0.012, t);
      washGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      washSource.connect(washFilter);
      washFilter.connect(washGain);
      washGain.connect(outputGainNode);
      washSource.start(t);
      washSource.stop(t + 0.12);
    };

    const triggerBreezeGust = () => {
      if (!isActive()) return;
      const t = ctx.currentTime;
      const gustSize = Math.floor(ctx.sampleRate * 0.35);
      const gustBuffer = ctx.createBuffer(1, gustSize, ctx.sampleRate);
      const gustData = gustBuffer.getChannelData(0);
      for (let i = 0; i < gustSize; i++) {
        const env = Math.sin((i / gustSize) * Math.PI);
        gustData[i] = (Math.random() * 2 - 1) * env;
      }
      const gustSource = ctx.createBufferSource();
      gustSource.buffer = gustBuffer;
      const gustFilter = ctx.createBiquadFilter();
      gustFilter.type = 'bandpass';
      gustFilter.frequency.setValueAtTime(700 + Math.random() * 500, t);
      gustFilter.Q.setValueAtTime(0.55, t);
      const gustGain = ctx.createGain();
      gustGain.gain.setValueAtTime(0.025 + Math.random() * 0.02, t);
      gustGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      gustSource.connect(gustFilter);
      gustFilter.connect(gustGain);
      gustGain.connect(outputGainNode);
      gustSource.start(t);
      gustSource.stop(t + 0.35);
    };

    const triggerLeafRustle = () => {
      if (!isActive()) return;
      const t = ctx.currentTime;
      const rustleSize = Math.floor(ctx.sampleRate * 0.18);
      const rustleBuffer = ctx.createBuffer(1, rustleSize, ctx.sampleRate);
      const rustleData = rustleBuffer.getChannelData(0);
      for (let i = 0; i < rustleSize; i++) {
        rustleData[i] = (Math.random() * 2 - 1) * (1 - i / rustleSize);
      }
      const rustleSource = ctx.createBufferSource();
      rustleSource.buffer = rustleBuffer;
      const rustleFilter = ctx.createBiquadFilter();
      rustleFilter.type = 'bandpass';
      rustleFilter.frequency.setValueAtTime(380 + Math.random() * 280, t);
      rustleFilter.Q.setValueAtTime(1.8, t);
      const rustleGain = ctx.createGain();
      rustleGain.gain.setValueAtTime(0.02 + Math.random() * 0.015, t);
      rustleGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      rustleSource.connect(rustleFilter);
      rustleFilter.connect(rustleGain);
      rustleGain.connect(outputGainNode);
      rustleSource.start(t);
      rustleSource.stop(t + 0.18);
    };

    const triggerHearthPop = () => {
      if (!isActive()) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const popGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500 + Math.random() * 900, t);
      osc.frequency.exponentialRampToValueAtTime(10, t + 0.05);
      popGain.gain.setValueAtTime(0.02 + Math.random() * 0.03, t);
      popGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      osc.connect(popGain);
      popGain.connect(outputGainNode);
      osc.start(t);
      osc.stop(t + 0.05);
    };

    const effectConfig = {
      rain: { intervalMs: 220, chance: 0.55, fn: () => (Math.random() > 0.35 ? triggerRainDrop() : triggerRainWash()) },
      breeze: { intervalMs: 520, chance: 0.5, fn: triggerBreezeGust },
      leaves: { intervalMs: 680, chance: 0.42, fn: triggerLeafRustle },
      hearth: { intervalMs: 420, chance: 0.48, fn: triggerHearthPop },
    }[profile.effect];

    this.seasonInterval = setInterval(() => {
      if (!isActive()) return;
      if (Math.random() > effectConfig.chance) {
        effectConfig.fn();
      }
    }, effectConfig.intervalMs);
  }
}
