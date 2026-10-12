import { useCallback } from 'react';
import { getSettings } from './useXMBSettings';

// Original XMB-style cursor sound, synthesised live with the Web Audio API — no
// audio files, so nothing is borrowed from the PSP. Each press builds a fresh
// sound, so playback is instant and rapid presses overlap rather than cut off.
// The context is shared at module level across the XMB and case study pages.

const VOLUME = 0.6;

// "Tink": a short, bright, glassy ping. Partials use small-bell ratios (inharmonic),
// and the higher ones die away faster, which is what makes it ring like glass.
const TINK_FREQ = 1900; // Hz — main pitch
const TINK_PARTIALS = [
  { ratio: 1, level: 0.3, decay: 0.11 },
  { ratio: 2.76, level: 0.09, decay: 0.05 },
  { ratio: 5.4, level: 0.035, decay: 0.025 },
];

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let reverb: GainNode | null = null;   // send into a short, airy room
let noise: AudioBuffer | null = null; // for the click's tiny transient

function getContext() {
  if (!ctx) {
    ctx = new AudioContext({ latencyHint: 'interactive' });

    master = ctx.createGain();
    master.gain.value = VOLUME;
    master.connect(ctx.destination);

    // Generated impulse response: stereo noise with an exponential tail
    const length = Math.round(ctx.sampleRate * 0.6); // small, bright room
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
    }
    const convolver = ctx.createConvolver();
    convolver.buffer = impulse;
    reverb = ctx.createGain();
    reverb.gain.value = 0.5;
    reverb.connect(convolver);
    convolver.connect(master);

    noise = ctx.createBuffer(1, Math.round(ctx.sampleRate * 0.02), ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  // Browsers start audio suspended until a user gesture — the keypress is one
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

// One oscillator with an attack/decay envelope, routed dry + to the reverb
function voice(
  context: AudioContext,
  { type, freq, start, attack, decay, level, wet }: {
    type: OscillatorType; freq: number; start: number; attack: number; decay: number; level: number; wet: number;
  },
) {
  const osc = context.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;

  const env = context.createGain();
  env.gain.setValueAtTime(0, start);
  env.gain.linearRampToValueAtTime(level, start + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);

  osc.connect(env);
  env.connect(master!);
  if (wet > 0) {
    const send = context.createGain();
    send.gain.value = wet;
    env.connect(send);
    send.connect(reverb!);
  }
  osc.start(start);
  osc.stop(start + attack + decay + 0.05);
  return osc;
}

// Cursor "tink": bell-like partials plus a faint transient for the strike
function tink() {
  if (!getSettings().sound) return; // SETTINGS → Sound: Off
  const context = getContext();
  const t = context.currentTime;

  for (const p of TINK_PARTIALS) {
    voice(context, {
      type: 'sine',
      freq: TINK_FREQ * p.ratio,
      start: t,
      attack: 0.0015,
      decay: p.decay,
      level: p.level,
      wet: 0.12,
    });
  }

  const strike = context.createBufferSource();
  strike.buffer = noise;
  const band = context.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 6000;
  band.Q.value = 1.5;
  const env = context.createGain();
  env.gain.setValueAtTime(0.06, t);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 0.006);
  strike.connect(band);
  band.connect(env);
  env.connect(master!);
  strike.start(t);
}

export function useXMBSound() {
  const playClick = useCallback(() => tink(), []);
  return { playClick };
}
