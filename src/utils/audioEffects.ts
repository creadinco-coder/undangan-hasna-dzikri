/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * High-end Web Audio API Synthesizer for Wedding Interactive Sound Effects.
 * Generates delicate crystal bell chimes, ambient harmonic overtones, and
 * celebratory wedding fanfares without needing external audio asset downloads.
 */

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!sharedAudioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        sharedAudioCtx = new AudioCtxClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Plays a crystalline chime bell at a given harmonic frequency.
 */
function playBellNote(ctx: AudioContext, frequency: number, duration = 1.2, volume = 0.15) {
  try {
    const now = ctx.currentTime;

    // Fundamental oscillator (pure warm sine tone)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Overtone oscillator for metallic crystal bell resonance
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);

    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(frequency * 2.76, now); // Bell harmonic ratio

    // Envelope for fundamental: fast attack, natural exponential decay
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Envelope for overtone: quick decay
    overtoneGain.gain.setValueAtTime(0.001, now);
    overtoneGain.gain.linearRampToValueAtTime(volume * 0.35, now + 0.015);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.6);

    osc.connect(gain);
    overtone.connect(overtoneGain);

    gain.connect(ctx.destination);
    overtoneGain.connect(ctx.destination);

    osc.start(now);
    overtone.start(now);

    osc.stop(now + duration);
    overtone.stop(now + duration);
  } catch {
    // Ignore audio error if unsupported
  }
}

/**
 * Ethereal crystalline chimes corresponding to each waypoint on the path.
 * Scales up melodically (Pentatonic Major: E5, G#5, B5, C#6, E6).
 */
const WAYPOINT_FREQUENCIES = [
  659.25, // E5  (Belokan 1: Mempelai)
  830.61, // G#5 (Belokan 2: Save the Date)
  987.77, // B5  (Belokan 3: Akad Nikah)
  1108.73, // C#6 (Belokan 4: Resepsi)
  1318.51, // E6  (Belokan 5: Doa & Restu)
];

export function playWaypointChime(waypointIndex: number) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const freq = WAYPOINT_FREQUENCIES[waypointIndex % WAYPOINT_FREQUENCIES.length] || 659.25;
  playBellNote(ctx, freq, 1.4, 0.2);

  // Subtle mobile haptic feedback
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(18);
    } catch {
      // Haptics optional
    }
  }
}

/**
 * Gentle friction/movement chime while dragging slider node along path.
 */
let lastDragSoundTime = 0;
export function playDragTickSound() {
  const nowMs = Date.now();
  if (nowMs - lastDragSoundTime < 180) return; // Throttle to prevent acoustic clutter
  lastDragSoundTime = nowMs;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440 + Math.random() * 60, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.02, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch {
    // Ignore
  }
}

/**
 * Triumphant golden celestial chord when finishing the entire path.
 */
export function playCelebrationFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const arpeggio = [659.25, 830.61, 987.77, 1318.51, 1661.22]; // E Major chime arpeggio
  arpeggio.forEach((freq, idx) => {
    setTimeout(() => {
      playBellNote(ctx, freq, 2.2, 0.22);
    }, idx * 110);
  });

  // Haptic celebration pattern
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([30, 40, 50, 40, 80]);
    } catch {
      // ignore
    }
  }
}
