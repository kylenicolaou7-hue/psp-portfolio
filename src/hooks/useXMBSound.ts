import { useCallback, useEffect } from 'react';

const SOUND_URL = '/sounds/Cursor.mp3';
const VOLUME = 0.6;

// Web Audio instead of <audio>: the click is decoded once up front and each
// press starts a fresh buffer source, so playback is near-instant and rapid
// presses overlap rather than cutting each other off. Shared at module level
// so the XMB and case study pages reuse the same decoded sound.
let ctx: AudioContext | null = null;
let gain: GainNode | null = null;
let buffer: AudioBuffer | null = null;
let loading: Promise<void> | null = null;
let startOffset = 0;

function getContext() {
  if (!ctx) {
    ctx = new AudioContext({ latencyHint: 'interactive' });
    gain = ctx.createGain();
    gain.gain.value = VOLUME;
    gain.connect(ctx.destination);
  }
  return ctx;
}

// Skip any leading silence (e.g. MP3 encoder padding) so the click lands on the keypress
function findStart(audio: AudioBuffer) {
  const data = audio.getChannelData(0);
  let peak = 0;
  for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
  const threshold = peak * 0.02;
  for (let i = 0; i < data.length; i++) {
    if (Math.abs(data[i]) > threshold) return i / audio.sampleRate;
  }
  return 0;
}

function loadSound() {
  if (!loading) {
    loading = fetch(SOUND_URL)
      .then(res => res.arrayBuffer())
      .then(data => getContext().decodeAudioData(data))
      .then(decoded => {
        buffer = decoded;
        startOffset = findStart(decoded);
      })
      .catch(() => {
        loading = null; // allow a retry on next mount
      });
  }
  return loading;
}

export function useXMBSound() {
  // Fetch + decode as soon as the page mounts, before the first keypress
  useEffect(() => {
    loadSound();
  }, []);

  const playClick = useCallback(() => {
    const context = getContext();
    // Browsers start audio suspended until a user gesture — the keypress is one
    if (context.state === 'suspended') context.resume().catch(() => {});
    if (!buffer || !gain) return;

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);
    source.start(0, startOffset);
  }, []);

  return { playClick };
}
