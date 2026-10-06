// Música de circo de acróbatas, original, sintetizada al vuelo (sin archivos de audio).
// Marcha rápida en 2/4 con escalas cromáticas, bajo "um-pa" y caja, estilo recreativa de los 80-90.
import { getPrefs } from './local';

const H = -1; // mantener la nota anterior
const R = 0; // silencio

// Melodía: 16 compases de 4 corcheas (números MIDI)
const MELODY: number[] = [
  67, 68, 69, 72, 76, H, 75, 76, 79, H, 76, 72, 74, H, H, R,
  65, 66, 67, 71, 74, H, 73, 74, 77, H, 74, 71, 72, H, H, R,
  76, 75, 76, 75, 76, 79, 76, 72, 74, 73, 74, 73, 74, 77, 74, 71,
  72, 76, 79, 84, 83, 81, 79, 77, 76, 79, 74, 77, 72, H, 67, H,
];
// Acorde de cada compás (raíz MIDI de la octava grave)
const CHORDS: [number, number[]][] = [
  [48, [64, 67]], [48, [64, 67]], [48, [64, 67]], [43, [62, 65]],
  [43, [62, 65]], [43, [62, 65]], [43, [62, 65]], [48, [64, 67]],
  [48, [64, 67]], [48, [64, 67]], [43, [62, 65]], [43, [62, 65]],
  [48, [64, 67]], [41, [65, 69]], [43, [62, 65]], [48, [64, 67]],
];

const BPM = 168;
const STEP = 60 / BPM / 2; // corchea

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let timer: number | null = null;
let nextTime = 0;
let step = 0;
let playing = false;
let mood: 'fiesta' | 'calma' = 'fiesta';
let noise: AudioBuffer | null = null;

const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function audio(): AudioContext | null {
  try {
    ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!master) {
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      noise = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return ctx;
  } catch {
    return null;
  }
}

function note(freq: number, t: number, dur: number, type: OscillatorType, vol: number) {
  const a = ctx!;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master!);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function snare(t: number, vol: number) {
  const a = ctx!;
  const s = a.createBufferSource();
  s.buffer = noise;
  const f = a.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = 1800;
  const g = a.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  s.connect(f).connect(g).connect(master!);
  s.start(t);
  s.stop(t + 0.1);
}

function schedule(i: number, t: number) {
  const bar = Math.floor(i / 4) % CHORDS.length;
  const beat = i % 4;
  const [root, chord] = CHORDS[bar];
  // bajo um-pa: raíz, acorde, quinta, acorde
  if (beat === 0) note(hz(root), t, STEP * 0.9, 'triangle', 0.32);
  if (beat === 2) note(hz(root + 7), t, STEP * 0.9, 'triangle', 0.26);
  if (beat === 1 || beat === 3) chord.forEach((c) => note(hz(c - 12), t, STEP * 0.5, 'square', 0.035));
  if (beat === 1 || beat === 3) snare(t, 0.07);
  // melodía, alargando las notas mantenidas
  const m = MELODY[i % MELODY.length];
  if (m > 0) {
    let len = 1;
    while (MELODY[(i + len) % MELODY.length] === H && len < 4) len++;
    note(hz(m), t, STEP * len * 0.92, 'square', 0.07);
    note(hz(m + 12), t, STEP * len * 0.6, 'triangle', 0.025);
  }
}

function tickLoop() {
  if (!ctx || !playing) return;
  while (nextTime < ctx.currentTime + 0.25) {
    schedule(step, nextTime);
    step++;
    nextTime += STEP;
  }
}

function targetVolume() {
  return mood === 'calma' ? 0.12 : 0.32;
}

export function musicEnabled() {
  return getPrefs().music !== false;
}

/** Arranca la música (debe llamarse tras un toque del usuario) */
export function startMusic() {
  if (playing || !musicEnabled()) return;
  const a = audio();
  if (!a || !master) return;
  if (a.state === 'suspended') a.resume();
  playing = true;
  nextTime = a.currentTime + 0.05;
  master.gain.cancelScheduledValues(a.currentTime);
  master.gain.setValueAtTime(master.gain.value, a.currentTime);
  master.gain.linearRampToValueAtTime(targetVolume(), a.currentTime + 0.8);
  timer = window.setInterval(tickLoop, 60);
  tickLoop();
}

export function stopMusic() {
  if (!playing || !ctx || !master) return;
  playing = false;
  if (timer) clearInterval(timer);
  timer = null;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
}

/** Más bajita mientras se piensa la mentira o se vota */
export function setMusicMood(m: 'fiesta' | 'calma') {
  mood = m;
  if (playing && ctx && master) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(targetVolume(), ctx.currentTime + 0.6);
  }
}

export function isMusicPlaying() {
  return playing;
}
