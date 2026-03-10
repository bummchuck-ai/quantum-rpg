// ============================================================
// QUANTUM RPG — Synthetic Sound Engine (Web Audio API)
// ============================================================
// All sounds generated programmatically. No external files needed.
// Sci-fi / cyberpunk aesthetic matching Obsidian HUD v4.0
// ============================================================

let audioCtx: AudioContext | null = null;

// ============================================================
// VOLUME & SETTINGS SYSTEM
// ============================================================
const SETTINGS_KEY = 'quantum-rpg-settings';
let masterVolume = 0.8;
let sfxMuted = false;
let ambientMuted = false;
let settingsLoaded = false;

function loadSettings() {
  if (settingsLoaded || typeof window === 'undefined') return;
  settingsLoaded = true;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      masterVolume = s.masterVolume ?? 0.8;
      sfxMuted = s.sfxMuted ?? false;
      ambientMuted = s.ambientMuted ?? false;
    }
  } catch { /* use defaults */ }
}

function saveSettings() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      masterVolume,
      sfxMuted,
      ambientMuted,
    }));
  } catch { /* storage full */ }
}

function getCtx(): AudioContext {
  loadSettings();
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
  gain.gain.value = sfxMuted ? 0 : volume * masterVolume;
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

// ============================================================
// GAMEPLAY SOUND EFFECTS
// ============================================================

/** Combat start — dramatic tension drums (3 low hits with increasing intensity) */
export function playCombatStart() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  [0, 0.25, 0.45].forEach((delay, i) => {
    // Low drum hit (noise burst through low-pass filter)
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let j = 0; j < bufferSize; j++) {
      data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.15));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 60 + i * 30;
    filter.Q.value = 8;

    const gain = createGain(ctx, 0.05 + i * 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.15);
    noise.connect(filter);
    filter.connect(gain);
    noise.start(t + delay);
    noise.stop(t + delay + 0.15);

    // Sub-bass thud underneath
    const osc = ctx.createOscillator();
    const g2 = createGain(ctx, 0.04 + i * 0.02);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(50 + i * 15, t + delay);
    osc.frequency.exponentialRampToValueAtTime(30, t + delay + 0.12);
    g2.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.15);
    osc.connect(g2);
    osc.start(t + delay);
    osc.stop(t + delay + 0.15);
  });
}

/** Combat victory — triumphant ascending major chord arpeggio */
export function playCombatVictory() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  // C major ascending: C5, E5, G5, C6
  const notes = [523, 659, 784, 1047];

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = createGain(ctx, 0.06);
    osc.type = 'sine';
    osc.frequency.value = freq;
    const start = t + i * 0.15;
    gain.gain.setValueAtTime(0.06, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
    osc.connect(gain);
    osc.start(start);
    osc.stop(start + 0.35);

    // Subtle overtone for richness
    const osc2 = ctx.createOscillator();
    const g2 = createGain(ctx, 0.02);
    osc2.type = 'triangle';
    osc2.frequency.value = freq * 2;
    g2.gain.setValueAtTime(0.02, start);
    g2.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
    osc2.connect(g2);
    osc2.start(start);
    osc2.stop(start + 0.25);
  });
}

/** Combat defeat — somber descending minor tones */
export function playCombatDefeat() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  // Descending minor: C5, Ab4, F4, Db4
  const notes = [523, 415, 349, 277];

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = createGain(ctx, 0.04);
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    const start = t + i * 0.2;
    gain.gain.setValueAtTime(0.04, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
    osc.connect(gain);
    osc.start(start);
    osc.stop(start + 0.35);
  });
}

/** Critical hit — sharp metallic impact */
export function playCriticalHit() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  // White noise burst (impact)
  const bufferSize = ctx.sampleRate * 0.05;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const g1 = createGain(ctx, 0.08);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  noise.connect(g1);
  noise.start(t);
  noise.stop(t + 0.06);

  // High metallic ping descending
  const osc = ctx.createOscillator();
  const g2 = createGain(ctx, 0.06);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(2200, t + 0.02);
  osc.frequency.exponentialRampToValueAtTime(600, t + 0.2);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  osc.connect(g2);
  osc.start(t + 0.02);
  osc.stop(t + 0.25);
}

/** Destiny flip — mystical Force chime with vibrato */
export function playDestinyFlip() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  // Main tone with vibrato
  const osc = ctx.createOscillator();
  const gain = createGain(ctx, 0.05);
  osc.type = 'sine';
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.05, t);
  gain.gain.linearRampToValueAtTime(0.06, t + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
  osc.connect(gain);

  // LFO for vibrato
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 6;
  lfoGain.gain.value = 15;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  lfo.start(t);
  lfo.stop(t + 0.7);
  osc.start(t);
  osc.stop(t + 0.7);

  // Ethereal overtone
  const osc2 = ctx.createOscillator();
  const g2 = createGain(ctx, 0.025);
  osc2.type = 'sine';
  osc2.frequency.value = 1320;
  g2.gain.setValueAtTime(0.025, t + 0.05);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  osc2.connect(g2);
  osc2.start(t + 0.05);
  osc2.stop(t + 0.5);
}

/** NPC encounter — short mystery motif (two-note stinger) */
export function playNPCMeet() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  // E4 → Bb4 (mystery interval: tritone)
  const notes = [330, 466];

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = createGain(ctx, 0.05);
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const start = t + i * 0.12;
    gain.gain.setValueAtTime(0.05, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
    osc.connect(gain);
    osc.start(start);
    osc.stop(start + 0.18);
  });
}

/** Force power use — ethereal sweep with overtone */
export function playForceUse() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  // Low sweep 100→400Hz
  const osc = ctx.createOscillator();
  const gain = createGain(ctx, 0.0);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(100, t);
  osc.frequency.exponentialRampToValueAtTime(400, t + 0.4);
  gain.gain.linearRampToValueAtTime(0.05, t + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  osc.connect(gain);
  osc.start(t);
  osc.stop(t + 0.5);

  // High overtone shimmer
  const osc2 = ctx.createOscillator();
  const g2 = createGain(ctx, 0.0);
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(800, t + 0.1);
  osc2.frequency.exponentialRampToValueAtTime(1200, t + 0.4);
  g2.gain.linearRampToValueAtTime(0.03, t + 0.2);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  osc2.connect(g2);
  osc2.start(t + 0.1);
  osc2.stop(t + 0.5);
}

/** Scene change — atmospheric transition whoosh (extended) */
export function playSceneChange() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  // White noise whoosh (longer than playNavigate)
  const bufferSize = ctx.sampleRate * 0.3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(200, t);
  filter.frequency.exponentialRampToValueAtTime(4000, t + 0.2);
  filter.frequency.exponentialRampToValueAtTime(300, t + 0.3);
  filter.Q.value = 1.5;

  const gain = createGain(ctx, 0.04);
  noise.connect(filter);
  filter.connect(gain);
  noise.start(t);
  noise.stop(t + 0.3);

  // Subtle tone sweep underneath
  const osc = ctx.createOscillator();
  const g2 = createGain(ctx, 0.025);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(900, t + 0.15);
  osc.frequency.exponentialRampToValueAtTime(400, t + 0.3);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  osc.connect(g2);
  osc.start(t);
  osc.stop(t + 0.3);
}

// ============================================================
// AMBIENT MUSIC SYSTEM
// ============================================================

let ambientOscillators: OscillatorNode[] = [];
let ambientGains: GainNode[] = [];
let ambientInterval: ReturnType<typeof setInterval> | null = null;
let currentAmbientType: string | null = null;

/** Stop all ambient music with fade-out */
export function stopAmbient() {
  const ctx = audioCtx;
  if (!ctx) return;
  const t = ctx.currentTime;

  // Fade out all gains
  for (const g of ambientGains) {
    try {
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0, t + 0.5);
    } catch { /* already disconnected */ }
  }

  // Stop oscillators after fade
  setTimeout(() => {
    for (const osc of ambientOscillators) {
      try { osc.stop(); osc.disconnect(); } catch { /* already stopped */ }
    }
    for (const g of ambientGains) {
      try { g.disconnect(); } catch { /* already disconnected */ }
    }
    ambientOscillators = [];
    ambientGains = [];
  }, 600);

  if (ambientInterval) {
    clearInterval(ambientInterval);
    ambientInterval = null;
  }
  currentAmbientType = null;
}

/** Get current ambient type */
export function getAmbientType(): string | null {
  return currentAmbientType;
}

/** Ambient: deep space drone — peaceful, floating */
export function playAmbientSpace() {
  if (currentAmbientType === 'space') return;
  if (ambientMuted) return;
  stopAmbient();
  const ctx = getCtx();
  const t = ctx.currentTime;
  currentAmbientType = 'space';

  // Deep bass drone
  const osc1 = ctx.createOscillator();
  const g1 = createGain(ctx, 0);
  osc1.type = 'sine';
  osc1.frequency.value = 55;
  g1.gain.linearRampToValueAtTime(0.02, t + 2);
  osc1.connect(g1);
  osc1.start(t);

  // Ethereal pad that slowly modulates
  const osc2 = ctx.createOscillator();
  const g2 = createGain(ctx, 0);
  osc2.type = 'sine';
  osc2.frequency.value = 220;
  g2.gain.linearRampToValueAtTime(0.012, t + 3);
  osc2.connect(g2);

  // Slow LFO on pad frequency
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.1;
  lfoGain.gain.value = 20;
  lfo.connect(lfoGain);
  lfoGain.connect(osc2.frequency);
  lfo.start(t);
  osc2.start(t);

  ambientOscillators = [osc1, osc2, lfo];
  ambientGains = [g1, g2, lfoGain];
}

/** Ambient: danger tension — pulsing low drone */
export function playAmbientDanger() {
  if (currentAmbientType === 'danger') return;
  if (ambientMuted) return;
  stopAmbient();
  const ctx = getCtx();
  const t = ctx.currentTime;
  currentAmbientType = 'danger';

  // Pulsing low drone
  const osc1 = ctx.createOscillator();
  const g1 = createGain(ctx, 0);
  osc1.type = 'sawtooth';
  osc1.frequency.value = 40;
  g1.gain.linearRampToValueAtTime(0.015, t + 1);
  osc1.connect(g1);

  // Pulse LFO on gain (creates tension pulse)
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.5; // Slow pulse
  lfoGain.gain.value = 0.01;
  lfo.connect(lfoGain);
  lfoGain.connect(g1.gain);
  lfo.start(t);
  osc1.start(t);

  // High dissonant whine
  const osc2 = ctx.createOscillator();
  const g2 = createGain(ctx, 0);
  osc2.type = 'sine';
  osc2.frequency.value = 466; // Bb4 — slightly unsettling
  g2.gain.linearRampToValueAtTime(0.008, t + 2);
  osc2.connect(g2);
  osc2.start(t);

  ambientOscillators = [osc1, osc2, lfo];
  ambientGains = [g1, g2, lfoGain];
}

/** Ambient: cantina — upbeat repeating pattern */
export function playAmbientCantina() {
  if (currentAmbientType === 'cantina') return;
  if (ambientMuted) return;
  stopAmbient();
  const ctx = getCtx();
  currentAmbientType = 'cantina';

  // Simple repeating note pattern
  const notes = [392, 440, 523, 440, 392, 349, 392, 349]; // G4-A4-C5-A4-G4-F4-G4-F4
  let noteIndex = 0;

  function playNote() {
    if (currentAmbientType !== 'cantina') return;
    const c = getCtx();
    const t = c.currentTime;
    const freq = notes[noteIndex % notes.length];

    const osc = c.createOscillator();
    const gain = createGain(c, 0.025);
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.025, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + 0.18);

    noteIndex++;
  }

  playNote();
  ambientInterval = setInterval(playNote, 220);
  ambientOscillators = [];
  ambientGains = [];
}

// ============================================================
// VOLUME CONTROL API (used by SystemPanel)
// ============================================================

/** Set master volume (0.0 – 1.0) and persist */
export function setMasterVolume(v: number) {
  masterVolume = Math.max(0, Math.min(1, v));
  saveSettings();
}

/** Mute/unmute SFX and persist */
export function setSFXMuted(m: boolean) {
  sfxMuted = m;
  saveSettings();
}

/** Mute/unmute ambient and persist. Stops ambient if muting. */
export function setAmbientMuted(m: boolean) {
  ambientMuted = m;
  if (m) stopAmbient();
  saveSettings();
}

/** Get current settings snapshot */
export function getSettings(): { masterVolume: number; sfxMuted: boolean; ambientMuted: boolean } {
  loadSettings();
  return { masterVolume, sfxMuted, ambientMuted };
}
