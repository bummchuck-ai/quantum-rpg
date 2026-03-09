// ============================================================
// QUANTUM RPG — Synthetic Sound Engine (Web Audio API)
// ============================================================
// All sounds generated programmatically. No external files needed.
// Sci-fi / cyberpunk aesthetic matching Obsidian HUD v4.0
// ============================================================

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// --- Utility ---
function createGain(ctx: AudioContext, volume: number): GainNode {
  const gain = ctx.createGain();
  gain.gain.value = volume;
  gain.connect(ctx.destination);
  return gain;
}

// ============================================================
// SOUND LIBRARY
// ============================================================

/** Soft UI click — short blip */
export function playClick() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = createGain(ctx, 0.08);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.connect(gain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.08);
}

/** Confirmation / purchase — ascending double tone */
export function playConfirm() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  // Tone 1
  const osc1 = ctx.createOscillator();
  const g1 = createGain(ctx, 0.07);
  osc1.type = 'sine';
  osc1.frequency.value = 600;
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  osc1.connect(g1);
  osc1.start(t);
  osc1.stop(t + 0.15);

  // Tone 2 (higher, slight delay)
  const osc2 = ctx.createOscillator();
  const g2 = createGain(ctx, 0.07);
  osc2.type = 'sine';
  osc2.frequency.value = 900;
  g2.gain.setValueAtTime(0.07, t + 0.08);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  osc2.connect(g2);
  osc2.start(t + 0.08);
  osc2.stop(t + 0.25);
}

/** Error / denied — low buzz */
export function playError() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = createGain(ctx, 0.06);
  osc.type = 'sawtooth';
  osc.frequency.value = 150;
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc.connect(gain);
  osc.start(t);
  osc.stop(t + 0.2);
}

/** Navigation / page transition — whoosh sweep */
export function playNavigate() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  // White noise burst (whoosh)
  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // Bandpass filter for sweeping sound
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(300, t);
  filter.frequency.exponentialRampToValueAtTime(3000, t + 0.12);
  filter.Q.value = 2;

  const gain = createGain(ctx, 0.05);
  noise.connect(filter);
  filter.connect(gain);
  noise.start(t);
  noise.stop(t + 0.15);

  // Subtle tone underneath
  const osc = ctx.createOscillator();
  const g2 = createGain(ctx, 0.03);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, t);
  osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.connect(g2);
  osc.start(t);
  osc.stop(t + 0.12);
}

/** XP spend / skill purchase — digital chirp */
export function playXPSpend() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = createGain(ctx, 0.06);
  osc.type = 'square';
  osc.frequency.setValueAtTime(1400, t);
  osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.connect(gain);
  osc.start(t);
  osc.stop(t + 0.12);
}

/** Credits change — coin/register sound */
export function playCredits() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  [0, 0.06, 0.12].forEach((delay, i) => {
    const osc = ctx.createOscillator();
    const gain = createGain(ctx, 0.04 - i * 0.01);
    osc.type = 'sine';
    osc.frequency.value = 2000 + i * 400;
    gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.06);
    osc.connect(gain);
    osc.start(t + delay);
    osc.stop(t + delay + 0.06);
  });
}

/** Refund / sell — descending tone */
export function playRefund() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = createGain(ctx, 0.06);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(900, t);
  osc.frequency.exponentialRampToValueAtTime(400, t + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  osc.connect(gain);
  osc.start(t);
  osc.stop(t + 0.18);
}

/** Dice roll — rapid random tones (rattle) */
export function playDiceRoll() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  for (let i = 0; i < 8; i++) {
    const osc = ctx.createOscillator();
    const gain = createGain(ctx, 0.03);
    osc.type = 'square';
    osc.frequency.value = 800 + Math.random() * 1200;
    const start = t + i * 0.04;
    gain.gain.setValueAtTime(0.03, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.03);
    osc.connect(gain);
    osc.start(start);
    osc.stop(start + 0.03);
  }
}

/** Quest received — epic ascending fanfare */
export function playQuestReceived() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  const notes = [440, 554, 659, 880];

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = createGain(ctx, 0.05);
    osc.type = 'sine';
    osc.frequency.value = freq;
    const start = t + i * 0.12;
    gain.gain.setValueAtTime(0.05, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
    osc.connect(gain);
    osc.start(start);
    osc.stop(start + 0.2);
  });
}

/** Crawl intro — deep cinematic drone */
export function playCrawlDrone() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  // Deep bass drone
  const osc1 = ctx.createOscillator();
  const g1 = createGain(ctx, 0.0);
  osc1.type = 'sawtooth';
  osc1.frequency.value = 55;
  g1.gain.linearRampToValueAtTime(0.04, t + 2);
  g1.gain.linearRampToValueAtTime(0.02, t + 8);
  g1.gain.linearRampToValueAtTime(0, t + 12);
  osc1.connect(g1);
  osc1.start(t);
  osc1.stop(t + 12);

  // Ethereal pad
  const osc2 = ctx.createOscillator();
  const g2 = createGain(ctx, 0.0);
  osc2.type = 'sine';
  osc2.frequency.value = 220;
  osc2.frequency.linearRampToValueAtTime(330, t + 10);
  g2.gain.linearRampToValueAtTime(0.02, t + 3);
  g2.gain.linearRampToValueAtTime(0, t + 12);
  osc2.connect(g2);
  osc2.start(t);
  osc2.stop(t + 12);
}

/** Hover / focus — very subtle tick */
export function playHover() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = createGain(ctx, 0.02);
  osc.type = 'sine';
  osc.frequency.value = 2000;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
  osc.connect(gain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.03);
}

/** Deploy / game start — power-up sequence */
export function playDeploy() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  // Rising power-up sweep
  const osc = ctx.createOscillator();
  const gain = createGain(ctx, 0.0);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(100, t);
  osc.frequency.exponentialRampToValueAtTime(2000, t + 0.8);
  gain.gain.linearRampToValueAtTime(0.06, t + 0.4);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
  osc.connect(gain);
  osc.start(t);
  osc.stop(t + 1.0);

  // Confirmation chime at the end
  setTimeout(() => {
    const ctx2 = getCtx();
    const t2 = ctx2.currentTime;
    [880, 1108, 1320].forEach((freq, i) => {
      const o = ctx2.createOscillator();
      const g = createGain(ctx2, 0.05);
      o.type = 'sine';
      o.frequency.value = freq;
      const s = t2 + i * 0.08;
      g.gain.setValueAtTime(0.05, s);
      g.gain.exponentialRampToValueAtTime(0.001, s + 0.3);
      o.connect(g);
      o.start(s);
      o.stop(s + 0.3);
    });
  }, 800);
}
