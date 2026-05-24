import { useCallback, useEffect, useRef, useState } from 'react';
import { getSharedAudioContext } from '../audio/sharedAudioContext';

export function useAmbientWind(isBrewing: boolean) {
  const [isMuted, setIsMuted] = useState(true);
  const isMutedRef = useRef(true);
  const biquadFilterRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const brewOscillatorsRef = useRef<OscillatorNode[]>([]);

  const stopWind = useCallback(() => {
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
      } catch {
        // ignore
      }
      noiseSourceRef.current = null;
    }
    isMutedRef.current = true;
    setIsMuted(true);
  }, []);

  const toggleMute = useCallback(() => {
    if (!isMutedRef.current) {
      stopWind();
      return;
    }

    try {
      const ctx = getSharedAudioContext();
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = lastOut * 0.98 + white * 0.02;
        lastOut = output[i];
        output[i] *= 3.5;
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
      isMutedRef.current = false;
      setIsMuted(false);
    } catch (err) {
      console.warn('Audio Context init blocked:', err);
    }
  }, [stopWind]);

  const playBrewSound = useCallback(() => {
    brewOscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // ignore
      }
    });
    brewOscillatorsRef.current = [];

    try {
      const ctx = getSharedAudioContext();
      const now = ctx.currentTime;
      const rootFreq = 261.63;
      const partials = [1.0, 1.5, 2.0, 2.5, 3.0];
      const gains = [0.12, 0.06, 0.04, 0.02, 0.01];

      partials.forEach((ratio, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(rootFreq * ratio, now);
        oscGain.gain.setValueAtTime(gains[idx]! * 0.45, now);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(now);
        brewOscillatorsRef.current.push(osc);
      });

      const bufferSize = ctx.sampleRate * 0.12;
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
      console.warn('Unable to play custom brew chime:', e);
    }
  }, []);

  useEffect(() => {
    if (isMutedRef.current || !biquadFilterRef.current || !gainNodeRef.current) return;
    const ctx = getSharedAudioContext();
    const now = ctx.currentTime;
    if (isBrewing) {
      biquadFilterRef.current.frequency.exponentialRampToValueAtTime(750, now + 2.5);
      gainNodeRef.current.gain.linearRampToValueAtTime(0.045, now + 2.5);
    } else {
      biquadFilterRef.current.frequency.exponentialRampToValueAtTime(350, now + 2);
      gainNodeRef.current.gain.linearRampToValueAtTime(0.03, now + 2);
    }
  }, [isBrewing]);

  useEffect(() => {
    return () => {
      stopWind();
      brewOscillatorsRef.current.forEach((osc) => {
        try {
          osc.stop();
        } catch {
          // ignore
        }
      });
    };
  }, [stopWind]);

  return { toggleMute, playBrewSound, isMuted };
}
