import { useEffect, useLayoutEffect, useRef } from 'react';
import { Season, SeasonalWhiteNoiseEngine } from '../audio/seasonalWhiteNoise';

interface UseSeasonalAmbientNoiseOptions {
  season: Season;
  enabled: boolean;
  volume: number;
}

export function useSeasonalAmbientNoise({
  season,
  enabled,
  volume,
}: UseSeasonalAmbientNoiseOptions): void {
  const engineRef = useRef<SeasonalWhiteNoiseEngine | null>(null);
  const volumeRef = useRef(volume);
  const seasonRef = useRef(season);
  const enabledRef = useRef(enabled);

  volumeRef.current = volume;
  seasonRef.current = season;
  enabledRef.current = enabled;

  if (!engineRef.current) {
    engineRef.current = new SeasonalWhiteNoiseEngine();
  }

  useEffect(() => {
    const engine = engineRef.current!;
    return () => engine.dispose();
  }, []);

  // useLayoutEffect: rebuild audio in the same commit as season/activeTermId change.
  useLayoutEffect(() => {
    const engine = engineRef.current!;
    if (!enabled) {
      engine.stop();
      return;
    }
    engine.start(season, volumeRef.current);
  }, [enabled, season]);

  useEffect(() => {
    if (enabledRef.current) {
      engineRef.current?.setVolume(volume);
    }
  }, [volume]);

  useEffect(() => {
    const onVis = () => {
      const engine = engineRef.current;
      if (!engine) return;
      if (document.hidden) {
        engine.stop();
      } else if (enabledRef.current) {
        engine.start(seasonRef.current, volumeRef.current);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);
}
