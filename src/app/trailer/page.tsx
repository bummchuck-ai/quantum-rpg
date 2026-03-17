'use client';

import React, { useEffect, useRef, useCallback } from 'react';

// ============================================================
// QUANTUM RPG — CINEMATIC TRAILER (React Port)
// 9:16 Format (1080x1920) — 25s animated sequence
// ============================================================

export const viewport = {
  width: 1080,
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const DURATION = 25;
const DOT_COUNT = 160;
const PULSE_SPEED = 0.8;
const STAR_COUNT = 300;

// --- Easing functions ---
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}
function easeOut(t: number) {
  return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
}
function easeIn(t: number) {
  return Math.pow(Math.max(0, Math.min(1, t)), 3);
}
function easeInOut(t: number) {
  t = Math.max(0, Math.min(1, t));
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// --- Dot type for Holocron Orb ---
interface Dot {
  theta: number;
  phi: number;
  size: number;
}

// --- Star type ---
interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  twinkle: number;
  color: string;
}

// --- Create orb dots (Fibonacci sphere) ---
function createDots(): Dot[] {
  const dots: Dot[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < DOT_COUNT; i++) {
    dots.push({
      theta: Math.acos(1 - 2 * (i + 0.5) / DOT_COUNT),
      phi: goldenAngle * i,
      size: 1.5 + Math.random() * 2,
    });
  }
  return dots;
}

// --- Create star field ---
function createStars(): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * 1080,
      y: Math.random() * 1920,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.3 + 0.05,
      twinkle: Math.random() * Math.PI * 2,
      color: Math.random() > 0.7 ? '#06b6d4' : '#f59e0b',
    });
  }
  return stars;
}

// --- Portrait data ---
const SPECIES_PORTRAITS = [
  { src: '/species/chiss.jpg', name: 'CHISS', stats: 'INT +3 • TAKTIK +2', xOffset: -350 },
  { src: '/species/twi-lek.jpg', name: "TWI'LEK", stats: 'CHA +3 • LIST +2', xOffset: 0 },
  { src: '/species/togruta.jpg', name: 'TOGRUTA', stats: 'AGI +3 • SINNE +2', xOffset: 350 },
];

const FLASH_PORTRAITS = ['/species/zabrak.jpg', '/species/wookie.jpg', '/species/chiss.jpg'];

const STAT_DATA = [
  { target: 184, label: 'Waffen' },
  { target: 18, label: 'Machtkräfte' },
  { target: 71, label: 'Spezialisierungen' },
];

export default function TrailerPage() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const orbCanvasRef = useRef<HTMLCanvasElement>(null);
  const starsCanvasRef = useRef<HTMLCanvasElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const portraitRefs = useRef<(HTMLDivElement | null)[]>([]);
  const flashPortraitRefs = useRef<(HTMLDivElement | null)[]>([]);
  const statLineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const statNumRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const heroPortraitRef = useRef<HTMLDivElement>(null);
  const heroLine1Ref = useRef<HTMLDivElement>(null);
  const heroLine2Ref = useRef<HTMLDivElement>(null);
  const mLineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleQuantumRef = useRef<HTMLDivElement>(null);
  const titleChroniclesRef = useRef<HTMLDivElement>(null);
  const glitchSubRef = useRef<HTMLDivElement>(null);
  const glitchContainerRef = useRef<HTMLDivElement>(null);
  const finalTitleRef = useRef<HTMLDivElement>(null);
  const finalRpgRef = useRef<HTMLDivElement>(null);
  const finalUrlRef = useRef<HTMLDivElement>(null);

  const dotsRef = useRef<Dot[]>(createDots());
  const starsRef = useRef<Star[]>(createStars());
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const audioStartedRef = useRef(false);
  const lastFlashRef = useRef(0);

  // Orb state
  const orbState = useRef({ x: 540, y: 960, size: 500, opacity: 0 });
  const starsOpacityRef = useRef(0);

  const setLayerOpacity = useCallback((index: number, opacity: number) => {
    const el = layerRefs.current[index];
    if (el) el.style.opacity = String(opacity);
  }, []);

  const triggerFlash = useCallback((duration: number) => {
    const now = performance.now();
    if (now - lastFlashRef.current < 200) return;
    lastFlashRef.current = now;
    const el = flashRef.current;
    if (!el) return;
    el.style.opacity = '0.8';
    el.style.transition = `opacity ${duration}s ease-out`;
    requestAnimationFrame(() => {
      el.style.opacity = '0';
    });
  }, []);

  const drawOrb = useCallback((time: number) => {
    const canvas = orbCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y, size, opacity } = orbState.current;
    const dpr = 2;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    canvas.style.left = (x - size / 2) + 'px';
    canvas.style.top = (y - size / 2) + 'px';
    canvas.style.opacity = String(opacity);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2, cy = size / 2, radius = size * 0.35;
    const rotY = time * 0.5;
    const pulsePhase = time * PULSE_SPEED;

    const projected = dotsRef.current.map(dot => {
      const x3d = Math.sin(dot.theta) * Math.cos(dot.phi + rotY);
      const y3d = Math.cos(dot.theta);
      const z3d = Math.sin(dot.theta) * Math.sin(dot.phi + rotY);
      const tilt = 0.3;
      const y3dt = y3d * Math.cos(tilt) - z3d * Math.sin(tilt);
      const z3dt = y3d * Math.sin(tilt) + z3d * Math.cos(tilt);
      const persp = 1 + z3dt * 0.3;
      const pulseWave = Math.sin(dot.theta * 3 - pulsePhase * Math.PI * 2);
      return {
        px: cx + x3d * radius * persp,
        py: cy + y3dt * radius * persp,
        z: z3dt,
        size: dot.size * persp,
        isPulsed: pulseWave > 0.6,
      };
    });

    projected.sort((a, b) => a.z - b.z);

    for (const p of projected) {
      const da = 0.15 + (p.z + 1) * 0.425;
      if (p.isPulsed) {
        ctx.fillStyle = `rgba(6, 182, 212, ${da * 0.9})`;
        ctx.shadowColor = 'rgba(6, 182, 212, 0.7)';
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = `rgba(245, 158, 11, ${da * 0.7})`;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
        ctx.shadowBlur = 6;
      }
      ctx.beginPath();
      ctx.arc(p.px, p.py, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.8);
    grad.addColorStop(0, 'rgba(245, 158, 11, 0.08)');
    grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.04)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const drawStars = useCallback((time: number) => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 1080, 1920);
    const opacity = starsOpacityRef.current;
    for (const s of starsRef.current) {
      const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(time * s.speed * 3 + s.twinkle));
      ctx.globalAlpha = opacity * twinkle;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, []);

  const animateCounter = useCallback((index: number, target: number, duration: number, startTime: number, currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(1, elapsed / duration);
    const value = Math.floor(target * easeOut(progress));
    const el = statNumRefs.current[index];
    if (el) el.textContent = String(value);
  }, []);

  useEffect(() => {
    const starsCanvas = starsCanvasRef.current;
    if (starsCanvas) {
      starsCanvas.width = 1080 * 2;
      starsCanvas.height = 1920 * 2;
      const ctx = starsCanvas.getContext('2d');
      if (ctx) ctx.scale(2, 2);
    }

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const t = (timestamp - startTimeRef.current) / 1000;

      if (t > DURATION + 2) return;

      // Start audio
      if (!audioStartedRef.current && t > 0.1) {
        const audio = audioRef.current;
        if (audio) {
          audio.volume = 0.8;
          audio.play().catch(() => {});
        }
        audioStartedRef.current = true;
      }

      // Fade overlay
      const fade = fadeRef.current;
      if (fade) {
        if (t < 1) {
          fade.style.opacity = String(lerp(1, 0, t / 1));
        } else if (t > 24) {
          fade.style.opacity = String(lerp(0, 1, (t - 24) / 1));
        } else {
          fade.style.opacity = '0';
        }
      }

      // === SCENE 1: 0-3s — Credit + Orb ===
      if (t < 3) {
        const fadeIn = easeOut(t / 1.5);
        orbState.current = { x: 540, y: 880, size: 500, opacity: fadeIn };
        starsOpacityRef.current = fadeIn * 0.3;
        setLayerOpacity(0, t > 2.2 ? 1 - easeIn((t - 2.2) / 0.8) : fadeIn);
      }
      // === SCENE 2: 3-6s — Title ===
      else if (t < 6) {
        const st = t - 3;
        const prog = easeInOut(st / 1.2);
        orbState.current = {
          x: 540,
          y: lerp(880, 320, prog),
          size: lerp(500, 200, prog),
          opacity: 1,
        };
        starsOpacityRef.current = lerp(0.3, 0.8, prog);
        const titleFade = easeOut(st / 1);
        setLayerOpacity(1, st > 2.2 ? 1 - easeIn((st - 2.2) / 0.8) : titleFade);
        if (titleQuantumRef.current) {
          titleQuantumRef.current.style.transform = `translateY(${lerp(40, 0, easeOut(st / 1))}px)`;
        }
        if (titleChroniclesRef.current) {
          titleChroniclesRef.current.style.opacity = String(easeOut((st - 0.4) / 0.8));
        }
      }
      // === SCENE 3: 6-9s — Species ===
      else if (t < 9) {
        const st = t - 6;
        orbState.current = { x: 540, y: 200, size: 150, opacity: 0.3 };
        starsOpacityRef.current = 0.5;
        setLayerOpacity(2, st > 2.2 ? 1 - easeIn((st - 2.2) / 0.8) : 1);

        for (let i = 0; i < 3; i++) {
          const p = portraitRefs.current[i];
          if (p) {
            const delay = i * 0.25;
            const prog = easeOut((st - delay) / 0.6);
            const startX = i === 0 ? -300 : i === 2 ? 300 : 0;
            p.style.transform = `translateX(${lerp(startX, 0, prog)}px)`;
            p.style.opacity = String(prog);
          }
        }
        if (st > 0.05 && st < 0.15) triggerFlash(0.3);
      }
      // === SCENE 4: 9-12s — AI GM Glitch ===
      else if (t < 12) {
        const st = t - 9;
        orbState.current = { ...orbState.current, opacity: 0.2 };
        starsOpacityRef.current = 0.3;
        setLayerOpacity(3, st > 2.2 ? 1 - easeIn((st - 2.2) / 0.8) : easeOut(st / 0.5));

        if (glitchContainerRef.current) {
          if (st > 0.3 && st < 1.8) {
            glitchContainerRef.current.classList.add('glitch-active');
          } else {
            glitchContainerRef.current.classList.remove('glitch-active');
          }
        }
        if (glitchSubRef.current) {
          glitchSubRef.current.style.opacity = String(easeOut((st - 1) / 0.8));
        }
        if (st > 0.05 && st < 0.12) triggerFlash(0.2);
      }
      // === SCENE 5: 12-15s — Stats ===
      else if (t < 15) {
        const st = t - 12;
        orbState.current = { ...orbState.current, opacity: 0.15 };
        starsOpacityRef.current = 0.4;
        setLayerOpacity(4, st > 2.2 ? 1 - easeIn((st - 2.2) / 0.8) : easeOut(st / 0.4));

        const delays = [0, 0.5, 1.0];
        for (let i = 0; i < 3; i++) {
          const el = statLineRefs.current[i];
          if (el) {
            const prog = easeOut((st - delays[i]) / 0.6);
            el.style.opacity = String(prog);
            el.style.transform = `translateY(${lerp(30, 0, prog)}px)`;
          }
          animateCounter(i, STAT_DATA[i].target, 1.2, delays[i], st);
        }
      }
      // === SCENE 6: 15-18s — Hero ===
      else if (t < 18) {
        const st = t - 15;
        orbState.current = { ...orbState.current, opacity: 0 };
        starsOpacityRef.current = 0.2;
        setLayerOpacity(5, st > 2.2 ? 1 - easeIn((st - 2.2) / 0.8) : 1);

        if (heroPortraitRef.current) {
          heroPortraitRef.current.style.opacity = String(easeOut(st / 1));
        }
        if (heroLine1Ref.current) {
          heroLine1Ref.current.style.opacity = String(easeOut((st - 0.5) / 0.6));
          heroLine1Ref.current.style.transform = `translateY(${lerp(20, 0, easeOut((st - 0.5) / 0.6))}px)`;
        }
        if (heroLine2Ref.current) {
          heroLine2Ref.current.style.opacity = String(easeOut((st - 1.2) / 0.6));
          heroLine2Ref.current.style.transform = `translateY(${lerp(20, 0, easeOut((st - 1.2) / 0.6))}px)`;
        }
        if (st > 0.05 && st < 0.12) triggerFlash(0.3);
      }
      // === SCENE 7: 18-22s — Manifesto ===
      else if (t < 22) {
        const st = t - 18;
        orbState.current = { ...orbState.current, opacity: 0 };
        starsOpacityRef.current = 0.3;
        setLayerOpacity(6, st > 3.2 ? 1 - easeIn((st - 3.2) / 0.8) : 1);

        // Flash portraits
        const flashTimes = [0.0, 0.8, 1.6];
        const flashDur = 0.6;
        for (let i = 0; i < 3; i++) {
          const fp = flashPortraitRefs.current[i];
          if (fp) {
            const ft = st - flashTimes[i];
            fp.style.opacity = (ft > 0 && ft < flashDur) ? String((1 - ft / flashDur) * 0.5) : '0';
          }
        }
        flashTimes.forEach(ft => {
          if (st > ft && st < ft + 0.08) triggerFlash(0.2);
        });

        // Text stagger
        const mDelays = [0.3, 1.1, 1.9];
        for (let i = 0; i < 3; i++) {
          const el = mLineRefs.current[i];
          if (el) {
            const prog = easeOut((st - mDelays[i]) / 0.5);
            el.style.opacity = String(prog);
            el.style.transform = `translateY(${lerp(25, 0, prog)}px)`;
          }
        }
      }
      // === SCENE 8: 22-25s — Finale ===
      else if (t <= DURATION + 1) {
        const st = t - 22;
        starsOpacityRef.current = lerp(0.3, 1, easeOut(st / 1.5));
        const prog = easeOut(st / 1.5);
        let oSize = lerp(0, 350, prog);
        let oOpacity = lerp(0, 0.6, prog);
        if (st > 1.5) {
          const pulse = 1 + Math.sin(st * 4) * 0.05;
          oSize *= pulse;
          oOpacity = 0.6 + Math.sin(st * 3) * 0.15;
        }
        orbState.current = { x: 540, y: 700, size: oSize, opacity: oOpacity };
        setLayerOpacity(7, easeOut(st / 1));

        if (finalTitleRef.current) {
          finalTitleRef.current.style.transform = `scale(${lerp(0.8, 1, easeOut(st / 1))})`;
          finalTitleRef.current.style.opacity = String(easeOut(st / 0.8));
        }
        if (finalRpgRef.current) {
          finalRpgRef.current.style.opacity = String(easeOut((st - 0.3) / 0.8));
        }
        if (finalUrlRef.current) {
          finalUrlRef.current.style.opacity = String(easeOut((st - 0.8) / 0.8));
        }
        if (st > 0.05 && st < 0.15) triggerFlash(0.4);
      }

      drawOrb(t);
      drawStars(t);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [setLayerOpacity, triggerFlash, drawOrb, drawStars, animateCounter]);

  // Click to start audio
  const handleClick = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.paused) audio.play().catch(() => {});
  }, []);

  return (
    <div
      onClick={handleClick}
      style={{
        width: 1080,
        height: 1920,
        overflow: 'hidden',
        background: '#000',
        fontFamily: "'Rajdhani', 'Share Tech Mono', sans-serif",
        color: '#f59e0b',
        position: 'relative',
        margin: '0 auto',
        userSelect: 'none',
      }}
      ref={sceneRef}
    >
      {/* Stars canvas */}
      <canvas
        ref={starsCanvasRef}
        style={{ position: 'absolute', inset: 0, width: 1080, height: 1920, zIndex: 0 }}
      />

      {/* Orb canvas */}
      <canvas
        ref={orbCanvasRef}
        style={{ position: 'absolute', zIndex: 2 }}
      />

      {/* Scanlines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 100,
          pointerEvents: 'none',
          background: 'repeating-linear-gradient(to bottom, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 6px)',
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 99,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* SCENE 1: Credit */}
      <div ref={el => { layerRefs.current[0] = el; }} className="trailer-layer">
        <div className="trailer-credit">Ein Fan-Projekt von</div>
        <div className="trailer-credit" style={{ marginTop: 15, color: '#f59e0b', fontWeight: 700, letterSpacing: 10 }}>
          Felix Kolbow
        </div>
      </div>

      {/* SCENE 2: Title */}
      <div ref={el => { layerRefs.current[1] = el; }} className="trailer-layer">
        <div ref={titleQuantumRef} className="trailer-title-quantum">QUANTUM</div>
        <div ref={titleChroniclesRef} className="trailer-title-chronicles" style={{ opacity: 0 }}>
          CHRONICLES
        </div>
      </div>

      {/* SCENE 3: Species */}
      <div ref={el => { layerRefs.current[2] = el; }} className="trailer-layer">
        {SPECIES_PORTRAITS.map((p, i) => (
          <div
            key={i}
            ref={el => { portraitRefs.current[i] = el; }}
            style={{
              position: 'absolute',
              width: 280,
              height: 400,
              left: 540 + p.xOffset - 140,
              top: 500,
              opacity: 0,
              overflow: 'hidden',
              border: '2px solid rgba(245, 158, 11, 0.4)',
              boxShadow: '0 0 40px rgba(245, 158, 11, 0.2), inset 0 0 40px rgba(0,0,0,0.5)',
              borderRadius: 8,
            }}
          >
            <img src={p.src} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.6) contrast(1.2)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }} />
            <div style={{ position: 'absolute', bottom: 15, left: 15, fontSize: 16, color: '#06b6d4', letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700 }}>
              {p.name}<br />
              <span style={{ fontSize: 13, color: '#f59e0b' }}>{p.stats}</span>
            </div>
          </div>
        ))}
        <div style={{ position: 'absolute', bottom: 220, width: '100%', textAlign: 'center' }}>
          <div className="trailer-species-count">92</div>
          <div className="trailer-species-label">Spielbare Spezies</div>
        </div>
      </div>

      {/* SCENE 4: AI GM */}
      <div ref={el => { layerRefs.current[3] = el; }} className="trailer-layer">
        <div ref={glitchContainerRef}>
          <div
            className="trailer-glitch-text"
            data-text="DEIN KI GAME MASTER"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0 40px' }}
          >
            DEIN KI<br />GAME MASTER
          </div>
        </div>
        <div ref={glitchSubRef} className="trailer-glitch-sub" style={{ opacity: 0 }}>
          Jede Entscheidung formt<br />deine Geschichte
        </div>
      </div>

      {/* SCENE 5: Stats */}
      <div ref={el => { layerRefs.current[4] = el; }} className="trailer-layer">
        {STAT_DATA.map((stat, i) => (
          <div
            key={i}
            ref={el => { statLineRefs.current[i] = el; }}
            style={{ textAlign: 'center', margin: '20px 0', opacity: 0 }}
          >
            <div className="trailer-stat-num">
              <span ref={el => { statNumRefs.current[i] = el; }}>0</span>
            </div>
            <div className="trailer-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* SCENE 6: Hero */}
      <div ref={el => { layerRefs.current[5] = el; }} className="trailer-layer">
        <div ref={heroPortraitRef} style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: 0 }}>
          <img src="/species/mensch-mandalore.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.3) contrast(1.3) brightness(0.4)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.15) 0%, transparent 70%)' }} />
        </div>
        <div style={{ zIndex: 3, position: 'relative', textAlign: 'center' }}>
          <div ref={heroLine1Ref} className="trailer-hero-amber" style={{ opacity: 0 }}>DEIN SMARTPHONE.</div>
          <div ref={heroLine2Ref} className="trailer-hero-cyan" style={{ opacity: 0, marginTop: 30 }}>DEIN ABENTEUER.</div>
        </div>
      </div>

      {/* SCENE 7: Manifesto */}
      <div ref={el => { layerRefs.current[6] = el; }} className="trailer-layer">
        {FLASH_PORTRAITS.map((src, i) => (
          <div
            key={i}
            ref={el => { flashPortraitRefs.current[i] = el; }}
            style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: 0 }}
          >
            <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.3) contrast(1.3) brightness(0.4)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.15) 0%, transparent 70%)' }} />
          </div>
        ))}
        <div style={{ padding: '0 60px', zIndex: 3, position: 'relative', textAlign: 'center' }}>
          <div ref={el => { mLineRefs.current[0] = el; }} className="trailer-manifesto" style={{ opacity: 0 }}>KEIN TISCH.</div>
          <div ref={el => { mLineRefs.current[1] = el; }} className="trailer-manifesto" style={{ opacity: 0, marginTop: 20 }}>KEINE WÜRFEL.</div>
          <div ref={el => { mLineRefs.current[2] = el; }} className="trailer-manifesto-cyan" style={{ opacity: 0, marginTop: 30 }}>
            NUR DU UND<br />DIE GALAXIS.
          </div>
        </div>
      </div>

      {/* SCENE 8: Final */}
      <div ref={el => { layerRefs.current[7] = el; }} className="trailer-layer">
        <div ref={finalTitleRef} className="trailer-final-title">QUANTUM</div>
        <div ref={finalRpgRef} className="trailer-final-rpg" style={{ opacity: 0 }}>RPG</div>
        <div ref={finalUrlRef} className="trailer-final-url" style={{ opacity: 0 }}>quantum-rpg.vercel.app</div>
      </div>

      {/* Flash & Fade overlays */}
      <div ref={flashRef} style={{ position: 'absolute', inset: 0, zIndex: 150, background: '#fff', opacity: 0, pointerEvents: 'none' }} />
      <div ref={fadeRef} style={{ position: 'absolute', inset: 0, zIndex: 200, background: '#000', pointerEvents: 'none' }} />

      {/* Audio */}
      <audio ref={audioRef} preload="auto">
        <source src="/audio/soundtrack.mp3" type="audio/mpeg" />
      </audio>

      <style>{`
        .trailer-layer {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 5;
          opacity: 0;
          pointer-events: none;
        }
        .trailer-credit {
          font-size: 24px;
          letter-spacing: 6px;
          text-transform: uppercase;
          color: rgba(245, 158, 11, 0.6);
          text-align: center;
          font-family: 'Share Tech Mono', monospace;
        }
        .trailer-title-quantum {
          font-size: 120px;
          font-weight: 900;
          letter-spacing: 20px;
          text-transform: uppercase;
          color: #f59e0b;
          text-shadow: 0 0 60px rgba(245, 158, 11, 0.5), 0 0 120px rgba(245, 158, 11, 0.2);
          text-align: center;
          line-height: 1;
          font-family: 'Rajdhani', sans-serif;
        }
        .trailer-title-chronicles {
          font-size: 48px;
          font-weight: 400;
          letter-spacing: 30px;
          text-transform: uppercase;
          color: #06b6d4;
          text-shadow: 0 0 40px rgba(6, 182, 212, 0.4);
          text-align: center;
          margin-top: 10px;
          font-family: 'Share Tech Mono', monospace;
        }
        .trailer-species-count {
          font-size: 72px;
          font-weight: 900;
          color: #f59e0b;
          text-shadow: 0 0 40px rgba(245, 158, 11, 0.5);
          text-align: center;
          letter-spacing: 4px;
        }
        .trailer-species-label {
          font-size: 32px;
          color: #06b6d4;
          letter-spacing: 12px;
          text-transform: uppercase;
          margin-top: 15px;
          font-family: 'Share Tech Mono', monospace;
        }
        .trailer-glitch-text {
          font-size: 64px;
          font-weight: 900;
          color: #06b6d4;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 6px;
          text-shadow: 0 0 40px rgba(6, 182, 212, 0.5);
          position: relative;
          font-family: 'Rajdhani', sans-serif;
        }
        .trailer-glitch-text::before,
        .trailer-glitch-text::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .glitch-active .trailer-glitch-text::before {
          color: #f59e0b;
          animation: trailer-glitch1 0.15s infinite;
          clip-path: polygon(0 0, 100% 0, 100% 40%, 0 40%);
        }
        .glitch-active .trailer-glitch-text::after {
          color: #ef4444;
          animation: trailer-glitch2 0.15s infinite;
          clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
        }
        @keyframes trailer-glitch1 {
          0% { transform: translate(0); }
          20% { transform: translate(-5px, 3px); }
          40% { transform: translate(5px, -3px); }
          60% { transform: translate(-3px, -2px); }
          80% { transform: translate(4px, 2px); }
          100% { transform: translate(0); }
        }
        @keyframes trailer-glitch2 {
          0% { transform: translate(0); }
          20% { transform: translate(4px, -2px); }
          40% { transform: translate(-4px, 3px); }
          60% { transform: translate(3px, 2px); }
          80% { transform: translate(-5px, -3px); }
          100% { transform: translate(0); }
        }
        .trailer-glitch-sub {
          font-size: 28px;
          color: rgba(245, 158, 11, 0.7);
          margin-top: 30px;
          letter-spacing: 3px;
          text-align: center;
          font-weight: 400;
          font-family: 'Share Tech Mono', monospace;
        }
        .trailer-stat-num {
          color: #06b6d4;
          font-size: 64px;
          font-weight: 700;
          text-shadow: 0 0 30px rgba(6, 182, 212, 0.5);
          font-family: 'Rajdhani', sans-serif;
        }
        .trailer-stat-label {
          color: rgba(245, 158, 11, 0.8);
          font-size: 28px;
          letter-spacing: 6px;
          text-transform: uppercase;
          font-family: 'Share Tech Mono', monospace;
        }
        .trailer-hero-amber {
          font-size: 56px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 4px;
          line-height: 1.4;
          color: #f59e0b;
          text-shadow: 0 0 40px rgba(245, 158, 11, 0.4);
          font-family: 'Rajdhani', sans-serif;
        }
        .trailer-hero-cyan {
          font-size: 56px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 4px;
          line-height: 1.4;
          color: #06b6d4;
          text-shadow: 0 0 40px rgba(6, 182, 212, 0.4);
          font-family: 'Rajdhani', sans-serif;
        }
        .trailer-manifesto {
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #f59e0b;
          text-shadow: 0 0 30px rgba(245, 158, 11, 0.3);
          font-family: 'Rajdhani', sans-serif;
        }
        .trailer-manifesto-cyan {
          font-size: 42px;
          font-weight: 700;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #06b6d4;
          text-shadow: 0 0 40px rgba(6, 182, 212, 0.4);
          font-family: 'Rajdhani', sans-serif;
        }
        .trailer-final-title {
          font-size: 140px;
          font-weight: 900;
          letter-spacing: 16px;
          color: #f59e0b;
          text-shadow: 0 0 80px rgba(245, 158, 11, 0.6), 0 0 160px rgba(245, 158, 11, 0.3);
          text-align: center;
          line-height: 1;
          font-family: 'Rajdhani', sans-serif;
        }
        .trailer-final-rpg {
          font-size: 100px;
          font-weight: 900;
          letter-spacing: 40px;
          color: #06b6d4;
          text-shadow: 0 0 60px rgba(6, 182, 212, 0.5), 0 0 120px rgba(6, 182, 212, 0.2);
          text-align: center;
          font-family: 'Rajdhani', sans-serif;
        }
        .trailer-final-url {
          font-size: 28px;
          color: rgba(245, 158, 11, 0.6);
          letter-spacing: 8px;
          margin-top: 40px;
          text-align: center;
          font-family: 'Share Tech Mono', monospace;
        }
      `}</style>
    </div>
  );
}
