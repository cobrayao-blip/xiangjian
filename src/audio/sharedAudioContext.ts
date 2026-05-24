let sharedCtx: AudioContext | null = null;

export function getSharedAudioContext(): AudioContext {
  const AudioContextClass =
    window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!sharedCtx) {
    sharedCtx = new AudioContextClass();
  }
  if (sharedCtx.state === 'suspended') {
    void sharedCtx.resume();
  }
  return sharedCtx;
}
