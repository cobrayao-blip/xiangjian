import { getSharedAudioContext } from './sharedAudioContext';

export type BreathingPhase = 'inhale' | 'hold' | 'exhale';

export const PHASE_DURATION_SEC = 4;

function createBreathNoiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const bufferSize = seconds * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.997 * b0 + white * 0.04;
    b1 = 0.985 * b1 + white * 0.08;
    b2 = 0.95 * b2 + white * 0.12;
    data[i] = (b0 + b1 + b2) * 0.35;
  }
  return buffer;
}

/** 深铜磬钟：在闭守阶段起点鸣响 */
function strikeCopperTempleChime(
  ctx: AudioContext,
  destination: AudioNode,
  now: number,
  volume: number,
): void {
  const transientSize = Math.floor(ctx.sampleRate * 0.06);
  const transientBuffer = ctx.createBuffer(1, transientSize, ctx.sampleRate);
  const transientData = transientBuffer.getChannelData(0);
  for (let i = 0; i < transientSize; i++) {
    transientData[i] = (Math.random() * 2 - 1) * (1 - i / transientSize);
  }
  const transientSource = ctx.createBufferSource();
  transientSource.buffer = transientBuffer;

  const transientFilter = ctx.createBiquadFilter();
  transientFilter.type = 'bandpass';
  transientFilter.frequency.setValueAtTime(220, now);
  transientFilter.Q.setValueAtTime(5, now);

  const transientGain = ctx.createGain();
  transientGain.gain.setValueAtTime(volume * 0.14, now);
  transientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

  transientSource.connect(transientFilter);
  transientFilter.connect(transientGain);
  transientGain.connect(destination);
  transientSource.start(now);
  transientSource.stop(now + 0.08);

  const fundamental = 136;
  const harmonics = [1, 1.414, 2.01, 2.76, 3.48];
  const gains = [1, 0.42, 0.28, 0.14, 0.07];
  const decays = [14, 11, 8, 5.5, 3.5];

  harmonics.forEach((ratio, idx) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const bowlGain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    const freq = fundamental * ratio;
    osc1.frequency.setValueAtTime(freq * 1.003, now);
    osc1.frequency.exponentialRampToValueAtTime(freq, now + 0.6);
    osc2.frequency.setValueAtTime(freq * 1.008, now);
    osc2.frequency.exponentialRampToValueAtTime(freq * 1.002, now + 0.6);

    bowlGain.gain.setValueAtTime(gains[idx] * volume * 0.11, now);
    bowlGain.gain.exponentialRampToValueAtTime(0.000005, now + decays[idx]);

    osc1.connect(bowlGain);
    osc2.connect(bowlGain);
    bowlGain.connect(destination);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + decays[idx] + 0.5);
    osc2.stop(now + decays[idx] + 0.5);
  });
}

export class BreathingAudioEngine {
  private masterGain: GainNode | null = null;
  private stoppableNodes: Array<OscillatorNode | AudioBufferSourceNode> = [];
  private connectedNodes: AudioNode[] = [];
  private playing = false;
  private volume = 0.5;
  private currentPhase: BreathingPhase | null = null;

  isPlaying(): boolean {
    return this.playing;
  }

  getCurrentPhase(): BreathingPhase | null {
    return this.currentPhase;
  }

  start(phase: BreathingPhase, volume = 0.5): void {
    this.volume = volume;
    this.playing = true;
    this.teardownPhase();
    this.playPhase(phase);
  }

  syncPhase(phase: BreathingPhase): void {
    if (!this.playing) return;
    if (phase === this.currentPhase) return;
    this.teardownPhase();
    this.playPhase(phase);
  }

  stop(): void {
    this.playing = false;
    this.teardownPhase();
    this.currentPhase = null;
  }

  setVolume(volume: number): void {
    this.volume = volume;
    const ctx = getSharedAudioContext();
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.06);
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
  }

  private getMasterGain(ctx: AudioContext): GainNode {
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(ctx.destination);
    }
    return this.masterGain;
  }

  private track(node: AudioNode): void {
    this.connectedNodes.push(node);
    if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
      this.stoppableNodes.push(node);
    }
  }

  private teardownPhase(): void {
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
  }

  private playPhase(phase: BreathingPhase): void {
    this.currentPhase = phase;
    const ctx = getSharedAudioContext();
    const now = ctx.currentTime;
    const dur = PHASE_DURATION_SEC;
    const master = this.getMasterGain(ctx);

    switch (phase) {
      case 'inhale':
        this.buildInhalePhase(ctx, master, now, dur);
        break;
      case 'hold':
        this.buildHoldPhase(ctx, master, now, dur);
        break;
      case 'exhale':
        this.buildExhalePhase(ctx, master, now, dur);
        break;
    }
  }

  /** 吸纳 0–4s：上扬声学波，模拟山风清气入肺 */
  private buildInhalePhase(
    ctx: AudioContext,
    master: GainNode,
    now: number,
    dur: number,
  ): void {
    const noiseBuffer = createBreathNoiseBuffer(ctx, 2);
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    this.track(source);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(160, now);
    filter.frequency.exponentialRampToValueAtTime(920, now + dur * 0.92);
    filter.Q.setValueAtTime(0.55, now);
    filter.Q.linearRampToValueAtTime(1.15, now + dur);
    this.track(filter);

    const airGain = ctx.createGain();
    airGain.gain.setValueAtTime(0.0001, now);
    airGain.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.55);
    airGain.gain.linearRampToValueAtTime(this.volume * 0.24, now + dur * 0.78);
    airGain.gain.linearRampToValueAtTime(0.0001, now + dur);
    this.track(airGain);

    source.connect(filter);
    filter.connect(airGain);
    airGain.connect(master);
    source.start(now);
    source.stop(now + dur + 0.05);

    const tone = ctx.createOscillator();
    tone.type = 'sine';
    tone.frequency.setValueAtTime(196, now);
    tone.frequency.exponentialRampToValueAtTime(698, now + dur);
    this.track(tone);

    const toneGain = ctx.createGain();
    toneGain.gain.setValueAtTime(0.0001, now);
    toneGain.gain.linearRampToValueAtTime(this.volume * 0.055, now + dur * 0.45);
    toneGain.gain.linearRampToValueAtTime(this.volume * 0.04, now + dur * 0.85);
    toneGain.gain.linearRampToValueAtTime(0.0001, now + dur);
    this.track(toneGain);

    tone.connect(toneGain);
    toneGain.connect(master);
    tone.start(now);
    tone.stop(now + dur + 0.05);
  }

  /** 闭守 4–8s：磬钟一击 + 温稳嗡鸣 */
  private buildHoldPhase(
    ctx: AudioContext,
    master: GainNode,
    now: number,
    dur: number,
  ): void {
    strikeCopperTempleChime(ctx, master, now, this.volume);

    [136.1, 136.55, 204.15].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      this.track(osc);

      const humGain = ctx.createGain();
      const peak = this.volume * (idx === 0 ? 0.09 : idx === 1 ? 0.05 : 0.025);
      humGain.gain.setValueAtTime(0.0001, now + 0.12);
      humGain.gain.linearRampToValueAtTime(peak, now + 0.95);
      humGain.gain.setValueAtTime(peak, now + dur - 0.35);
      humGain.gain.linearRampToValueAtTime(0.0001, now + dur);
      this.track(humGain);

      if (idx === 0) {
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.18, now);
        this.track(lfo);

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(1.2, now);
        this.track(lfoGain);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(now);
        lfo.stop(now + dur + 0.05);
      }

      osc.connect(humGain);
      humGain.connect(master);
      osc.start(now + 0.08);
      osc.stop(now + dur + 0.05);
    });
  }

  /** 呼吐 8–12s：音高缓降，模拟温气呼出渐归静寂 */
  private buildExhalePhase(
    ctx: AudioContext,
    master: GainNode,
    now: number,
    dur: number,
  ): void {
    const noiseBuffer = createBreathNoiseBuffer(ctx, 2);
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    this.track(source);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(780, now);
    filter.frequency.exponentialRampToValueAtTime(140, now + dur);
    filter.Q.setValueAtTime(0.4, now);
    this.track(filter);

    const airGain = ctx.createGain();
    airGain.gain.setValueAtTime(this.volume * 0.16, now);
    airGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    this.track(airGain);

    source.connect(filter);
    filter.connect(airGain);
    airGain.connect(master);
    source.start(now);
    source.stop(now + dur + 0.05);

    const tone = ctx.createOscillator();
    tone.type = 'triangle';
    tone.frequency.setValueAtTime(520, now);
    tone.frequency.exponentialRampToValueAtTime(110, now + dur * 0.95);
    this.track(tone);

    const toneGain = ctx.createGain();
    toneGain.gain.setValueAtTime(this.volume * 0.07, now);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    this.track(toneGain);

    tone.connect(toneGain);
    toneGain.connect(master);
    tone.start(now);
    tone.stop(now + dur + 0.05);

    const warmth = ctx.createOscillator();
    warmth.type = 'sine';
    warmth.frequency.setValueAtTime(280, now);
    warmth.frequency.exponentialRampToValueAtTime(90, now + dur);
    this.track(warmth);

    const warmthGain = ctx.createGain();
    warmthGain.gain.setValueAtTime(this.volume * 0.04, now);
    warmthGain.gain.exponentialRampToValueAtTime(0.0001, now + dur * 0.88);
    this.track(warmthGain);

    warmth.connect(warmthGain);
    warmthGain.connect(master);
    warmth.start(now);
    warmth.stop(now + dur + 0.05);
  }
}

let sharedEngine: BreathingAudioEngine | null = null;

export function getBreathingAudioEngine(): BreathingAudioEngine {
  if (!sharedEngine) {
    sharedEngine = new BreathingAudioEngine();
  }
  return sharedEngine;
}
