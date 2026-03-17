'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import HolocronOrb from '@/components/ui/HolocronOrb';

// ============================================================
// QUANTUM RPG — 6W INFO SLIDES (Instagram Stories)
// 9:16 Format (1080x1920) — Static slides with navigation
// ============================================================

export const viewport = {
  width: 1080,
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

interface SlideData {
  tag: string;
  accent: string;
  title: string;
  body: string;
  visual: 'cover' | 'icon' | 'starfield' | 'species-cover' | 'species-overview' | 'orb';
}

const SLIDES: SlideData[] = [
  {
    tag: 'WAS',
    accent: 'SYSTEM_BRIEFING',
    title: 'THE QUANTUM UNIVERSE',
    body: 'Ein Star Wars Pen & Paper RPG mit KI Game Master. Erstelle deinen Charakter, würfle dein Schicksal, erlebe epische Abenteuer — alles auf deinem Smartphone.',
    visual: 'cover',
  },
  {
    tag: 'WER',
    accent: 'CREDITS_FILE',
    title: 'DEVELOPED BY',
    body: 'Ein Fan-Projekt von Felix / bummchuck-ai. Powered by Claude API (Anthropic). Regelwerk basierend auf FFG Star Wars RPG.',
    visual: 'icon',
  },
  {
    tag: 'WANN',
    accent: 'CHRONO_SYNC',
    title: 'TIMELINE: 181 ABY',
    body: 'Django Fett regiert als Mandalore. Darth Plagueis II. erobert Sektor um Sektor. Die Kaiserin ist tot, Bastion gefallen. Jetzt schreibst du deine Geschichte.',
    visual: 'starfield',
  },
  {
    tag: 'WO',
    accent: 'DEPLOY_STATUS',
    title: 'ACCESS POINT',
    body: 'Mobile-first Progressive Web App. Kein Download nötig — öffne die URL und spiele sofort. Auf jedem Smartphone und Desktop.',
    visual: 'species-cover',
  },
  {
    tag: 'WARUM',
    accent: 'UNIQUE_FACTOR',
    title: 'MISSION STATEMENT',
    body: '92 Spezies. 20 Karrieren. Hunderte Talente. Jede Geschichte ist einzigartig — die KI reagiert auf jede deiner Entscheidungen. Kein Durchgang ist wie der andere.',
    visual: 'species-overview',
  },
  {
    tag: 'WIE',
    accent: 'SYSTEM_ARCHITECTURE',
    title: 'TECH STACK',
    body: 'Claude API als KI Game Master. FFG Genesys Würfelsystem. Voice-to-Text & Text-to-Speech. Next.js Progressive Web App. Deine Daten bleiben lokal bei dir.',
    visual: 'orb',
  },
];

const VISUAL_MAP: Record<SlideData['visual'], string | null> = {
  cover: '/quantum-rpg-cover.jpg',
  icon: '/icons/icon-512.png',
  starfield: null,
  'species-cover': '/species-cover.jpg',
  'species-overview': '/species-overview.jpg',
  orb: null,
};

// --- Starfield for WANN slide ---
function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = 2;
    canvas.width = 800 * dpr;
    canvas.height = 500 * dpr;
    ctx.scale(dpr, dpr);

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 500,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.3 + 0.05,
      twinkle: Math.random() * Math.PI * 2,
      color: Math.random() > 0.7 ? '#06b6d4' : '#f59e0b',
    }));

    let time = 0;
    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, 800, 500);
      for (const s of stars) {
        const tw = 0.3 + 0.7 * Math.abs(Math.sin(time * s.speed * 3 + s.twinkle));
        ctx.globalAlpha = tw * 0.8;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(render);
    };
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 800, height: 500, borderRadius: 16, opacity: 0.9 }}
    />
  );
}

// --- Visual component ---
function SlideVisual({ visual }: { visual: SlideData['visual'] }) {
  const src = VISUAL_MAP[visual];

  if (visual === 'starfield') {
    return <StarfieldBackground />;
  }

  if (visual === 'orb') {
    return <HolocronOrb size={400} opacity={0.9} />;
  }

  if (visual === 'icon') {
    return (
      <div style={{
        width: 280,
        height: 280,
        borderRadius: 60,
        overflow: 'hidden',
        border: '3px solid rgba(245, 158, 11, 0.4)',
        boxShadow: '0 0 80px rgba(245, 158, 11, 0.2)',
      }}>
        <img src={src!} alt="Quantum RPG" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }

  if (src) {
    return (
      <div style={{
        width: 800,
        height: 500,
        borderRadius: 16,
        overflow: 'hidden',
        border: '2px solid rgba(245, 158, 11, 0.3)',
        boxShadow: '0 0 60px rgba(245, 158, 11, 0.15)',
        position: 'relative',
      }}>
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.7) contrast(1.1)' }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.4) 100%)',
        }} />
      </div>
    );
  }

  return null;
}

export default function SlidesPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= SLIDES.length || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setTransitioning(false);
    }, 200);
  }, [transitioning]);

  const handleTap = useCallback((e: React.MouseEvent) => {
    const x = e.clientX;
    const width = window.innerWidth;
    if (x < width * 0.3) {
      goTo(currentSlide - 1);
    } else {
      goTo(currentSlide + 1);
    }
  }, [currentSlide, goTo]);

  const slide = SLIDES[currentSlide];

  return (
    <div
      onClick={handleTap}
      style={{
        width: 1080,
        height: 1920,
        overflow: 'hidden',
        background: '#000',
        fontFamily: "'Rajdhani', 'Share Tech Mono', sans-serif",
        position: 'relative',
        margin: '0 auto',
        userSelect: 'none',
        cursor: 'pointer',
      }}
    >
      {/* Scanlines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        pointerEvents: 'none',
        background: 'repeating-linear-gradient(to bottom, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 6px)',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 49,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)',
      }} />

      {/* Content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          opacity: transitioning ? 0 : 1,
          transition: 'opacity 0.2s ease-out',
        }}
      >
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, padding: '40px 60px 0' }}>
          {SLIDES.map((_, i) => (
            <div
              key={i}
              style={{
                height: 4,
                flex: 1,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                background: i <= currentSlide ? '#f59e0b' : 'rgba(255,255,255,0.15)',
                boxShadow: i <= currentSlide ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Accent label */}
        <div style={{
          padding: '50px 80px 0',
          fontSize: 14,
          color: 'rgba(245, 158, 11, 0.5)',
          fontWeight: 900,
          letterSpacing: 8,
          textTransform: 'uppercase',
          fontFamily: "'Share Tech Mono', monospace",
        }}>
          {slide.accent} // 0{currentSlide + 1}
        </div>

        {/* 6W Tag */}
        <div style={{
          padding: '30px 80px 0',
          fontSize: 120,
          fontWeight: 900,
          color: '#06b6d4',
          textShadow: '0 0 60px rgba(6, 182, 212, 0.4)',
          letterSpacing: 8,
          lineHeight: 1,
          fontFamily: "'Rajdhani', sans-serif",
        }}>
          {slide.tag}
        </div>

        {/* Title */}
        <div style={{
          padding: '10px 80px 0',
          fontSize: 36,
          fontWeight: 900,
          color: '#f59e0b',
          letterSpacing: 6,
          textTransform: 'uppercase',
          fontFamily: "'Rajdhani', sans-serif",
        }}>
          {slide.title}
        </div>

        {/* Divider */}
        <div style={{
          margin: '30px 80px',
          height: 2,
          background: 'linear-gradient(to right, #f59e0b, transparent)',
          opacity: 0.4,
        }} />

        {/* Visual */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 80px',
          minHeight: 500,
        }}>
          <SlideVisual visual={slide.visual} />
        </div>

        {/* Body text */}
        <div style={{
          padding: '40px 80px 0',
          fontSize: 32,
          color: 'rgba(161, 161, 170, 0.9)',
          fontStyle: 'italic',
          lineHeight: 1.6,
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 500,
        }}>
          {slide.body}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bottom bar */}
        <div style={{
          height: 3,
          background: 'linear-gradient(to right, transparent, rgba(245, 158, 11, 0.3), transparent)',
        }} />
        <div style={{
          padding: '24px 80px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          color: 'rgba(113, 113, 122, 0.6)',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: 6,
          fontFamily: "'Share Tech Mono', monospace",
        }}>
          <span>QUANTUM_RPG</span>
          <span style={{ animation: 'pulse 2s ease-in-out infinite', opacity: 0.5 }}>
            ◄ TAP TO NAVIGATE ►
          </span>
        </div>

        {/* Corner accents */}
        <div style={{
          position: 'absolute',
          top: 30,
          left: 50,
          width: 20,
          height: 20,
          borderTop: '2px solid rgba(245, 158, 11, 0.3)',
          borderLeft: '2px solid rgba(245, 158, 11, 0.3)',
        }} />
        <div style={{
          position: 'absolute',
          top: 30,
          right: 50,
          width: 20,
          height: 20,
          borderTop: '2px solid rgba(245, 158, 11, 0.3)',
          borderRight: '2px solid rgba(245, 158, 11, 0.3)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: 70,
          left: 50,
          width: 20,
          height: 20,
          borderBottom: '2px solid rgba(245, 158, 11, 0.3)',
          borderLeft: '2px solid rgba(245, 158, 11, 0.3)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: 70,
          right: 50,
          width: 20,
          height: 20,
          borderBottom: '2px solid rgba(245, 158, 11, 0.3)',
          borderRight: '2px solid rgba(245, 158, 11, 0.3)',
        }} />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
