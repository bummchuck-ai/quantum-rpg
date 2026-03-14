'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { t, getLanguage } from '@/lib/i18n';

interface IntroCrawlProps {
  onComplete: () => void;
}

// Starfield
const STARS = Array.from({ length: 50 }, (_, i) => ({
  x: ((i * 7919) % 100),
  y: ((i * 6271) % 100),
  size: (i % 3) + 1,
  opacity: 0.08 + (i % 7) * 0.04,
}));

const IntroCrawl: React.FC<IntroCrawlProps> = ({ onComplete }) => {
  const [crawlText, setCrawlText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [scrolling, setScrolling] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rafRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const { players, activePlayerIndex } = useCharacterStore();
  const player = players[activePlayerIndex];
  const lang = getLanguage();

  useEffect(() => {
    mountedRef.current = true;
    const abortController = new AbortController();

    const generateCrawl = async () => {
      if (!player) {
        onCompleteRef.current();
        return;
      }

      try {
        const prompt = lang === 'de'
          ? `Du bist ein Star Wars Erzähler. Schreibe ein kurzes, episches Opening-Crawl-Intro (3-4 kurze Absätze, max 120 Wörter) für diesen Charakter: Name: ${player.name}, Spezies: ${player.species?.name}, Karriere: ${player.career?.name}, Spezialisierung: ${player.specializations?.[0]?.name || 'unbekannt'}. Stil: Wie ein Star Wars Opening Crawl. Dramatisch, episch, in Großbuchstaben-freundlichem Deutsch. Antworte NUR mit dem Crawl-Text, kein JSON, keine Anführungszeichen.`
          : `You are a Star Wars narrator. Write a short, epic opening crawl intro (3-4 short paragraphs, max 120 words) for this character: Name: ${player.name}, Species: ${player.species?.name}, Career: ${player.career?.name}, Specialization: ${player.specializations?.[0]?.name || 'unknown'}. Style: Like a Star Wars opening crawl. Dramatic, epic. Respond ONLY with the crawl text, no JSON, no quotes.`;

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-secret': process.env.NEXT_PUBLIC_API_SECRET || '' },
          body: JSON.stringify({
            messages: [
              { role: 'user', content: prompt }
            ],
            rawText: true,
          }),
          signal: abortController.signal,
        });

        if (!mountedRef.current) return;
        if (!response.ok) throw new Error('API error');
        const data = await response.json();
        const text = data.rawText || data.narrative || data.response || data.content || t('crawlFallback');
        setCrawlText(text);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (!mountedRef.current) return;
        setCrawlText(t('crawlFallback'));
      }
      if (!mountedRef.current) return;
      setLoading(false);
      const scrollTimer = setTimeout(() => {
        if (mountedRef.current) setScrolling(true);
      }, 800);
      timerRef.current.push(scrollTimer);
    };

    generateCrawl();

    return () => {
      mountedRef.current = false;
      abortController.abort();
      timerRef.current.forEach(clearTimeout);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (!scrolling || !scrollRef.current) return;

    const el = scrollRef.current;
    const scrollDuration = 15000;
    const start = performance.now();
    const maxScroll = el.scrollHeight - el.clientHeight;

    const animate = (now: number) => {
      if (!mountedRef.current) return;
      const elapsed = now - start;
      const progress = Math.min(elapsed / scrollDuration, 1);
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      el.scrollTop = eased * maxScroll;

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = null;
        const endTimer = setTimeout(() => {
          if (!mountedRef.current) return;
          setFadeOut(true);
          const navTimer = setTimeout(() => {
            if (mountedRef.current) onCompleteRef.current();
          }, 1200);
          timerRef.current.push(navTimer);
        }, 2000);
        timerRef.current.push(endTimer);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [scrolling]);

  const handleSkip = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setFadeOut(true);
    const skipTimer = setTimeout(() => onCompleteRef.current(), 600);
    timerRef.current = [skipTimer];
  }, []);

  if (!player) return null;

  return (
    <div className={`fixed inset-0 bg-black z-[200] font-mono select-none transition-opacity duration-1000 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {/* Starfield */}
      {STARS.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
          }}
        />
      ))}

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <div className="text-[10px] text-amber-500 font-black uppercase tracking-[0.5em] animate-pulse">
            {t('crawlGenerating')}
          </div>
        </div>
      )}

      {/* Crawl container with perspective */}
      {!loading && (
        <div className="absolute inset-0 flex items-end justify-center overflow-hidden" style={{ perspective: '350px' }}>
          <div
            ref={scrollRef}
            className="w-full max-w-2xl px-8"
            style={{
              transform: 'rotateX(25deg)',
              transformOrigin: 'center bottom',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
              height: '80vh',
              overflowY: 'scroll',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {/* Spacer so text starts from bottom */}
            <div style={{ height: '80vh' }} />

            {/* Episode badge */}
            <div className="text-center mb-6">
              <div className="text-amber-500 text-[10px] tracking-[0.6em] font-black mb-2">EPISODE I</div>
              <h2 className="text-3xl sm:text-4xl font-black text-amber-500 italic tracking-tighter uppercase leading-tight mb-4">
                {player.name || 'A NEW HERO'}
              </h2>
              <div className="w-16 h-0.5 bg-amber-500/50 mx-auto" />
            </div>

            {/* Crawl text */}
            <div className="space-y-6 text-center">
              {crawlText.split('\n').filter(Boolean).map((paragraph, i) => (
                <p key={i} className="text-base sm:text-lg text-amber-300/90 leading-relaxed font-bold">
                  {paragraph.trim()}
                </p>
              ))}
            </div>

            {/* End spacer */}
            <div style={{ height: '100vh' }} />
          </div>
        </div>
      )}

      {/* Hide scrollbar via global style */}
      <style>{`
        div[style*="overflowY: scroll"]::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Skip button */}
      <div className="absolute bottom-8 right-8 z-30">
        <button
          onClick={handleSkip}
          className="text-zinc-600 hover:text-amber-400 text-[10px] uppercase tracking-widest transition-colors"
        >
          [ {t('crawlSkip')} ]
        </button>
      </div>
    </div>
  );
};

export default IntroCrawl;
