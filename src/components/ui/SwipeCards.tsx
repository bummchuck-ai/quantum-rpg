'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { playNavigate } from '@/lib/sounds';

interface SwipeCardsProps {
  children: React.ReactNode;
  gridClassName?: string;
}

const SwipeCards: React.FC<SwipeCardsProps> = ({ children, gridClassName = 'md:grid-cols-2 lg:grid-cols-3' }) => {
  const items = React.Children.toArray(children);
  const [index, setIndex] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0 });
  const dirRef = useRef<'h' | 'v' | null>(null);

  // Clamp index when items change (e.g. search filter)
  useEffect(() => {
    if (index >= items.length && items.length > 0) {
      setIndex(items.length - 1);
    }
  }, [items.length, index]);

  // Reset to first card when children array identity changes significantly
  const prevLenRef = useRef(items.length);
  useEffect(() => {
    if (items.length !== prevLenRef.current) {
      setIndex(0);
      prevLenRef.current = items.length;
    }
  }, [items.length]);

  const goTo = useCallback((i: number) => {
    const clamped = Math.max(0, Math.min(items.length - 1, i));
    if (clamped !== index) {
      playNavigate();
    }
    setIndex(clamped);
  }, [items.length, index]);

  const onTouchStart = (e: React.TouchEvent) => {
    startRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    dirRef.current = null;
    setDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - startRef.current.x;
    const dy = e.touches[0].clientY - startRef.current.y;

    // Determine swipe direction on first significant movement
    if (dirRef.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      dirRef.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
    }

    if (dirRef.current !== 'h') return;

    // Rubber band effect at edges
    let offset = dx;
    if ((index === 0 && dx > 0) || (index >= items.length - 1 && dx < 0)) {
      offset = dx * 0.2;
    }
    setOffsetX(offset);
  };

  const onTouchEnd = () => {
    setDragging(false);
    if (dirRef.current === 'h') {
      if (offsetX < -50 && index < items.length - 1) goTo(index + 1);
      else if (offsetX > 50 && index > 0) goTo(index - 1);
    }
    setOffsetX(0);
    dirRef.current = null;
  };

  if (items.length === 0) return null;

  return (
    <>
      {/* ═══ MOBILE: Swipe Carousel ═══ */}
      <div className="md:hidden pb-32">

        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-4 px-1">
          <button
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            className={`w-10 h-10 border rounded-lg flex items-center justify-center font-black text-sm transition-all ${
              index === 0
                ? 'border-zinc-900 text-zinc-800 cursor-not-allowed'
                : 'border-zinc-700 text-zinc-400 active:scale-90 active:border-amber-500 active:text-amber-500'
            }`}
          >
            &larr;
          </button>

          <div className="text-[11px] font-mono tracking-widest select-none">
            <span className="text-amber-500 font-black">{String(index + 1).padStart(2, '0')}</span>
            <span className="text-zinc-700 mx-1.5">/</span>
            <span className="text-zinc-500">{String(items.length).padStart(2, '0')}</span>
          </div>

          <button
            onClick={() => goTo(index + 1)}
            disabled={index >= items.length - 1}
            className={`w-10 h-10 border rounded-lg flex items-center justify-center font-black text-sm transition-all ${
              index >= items.length - 1
                ? 'border-zinc-900 text-zinc-800 cursor-not-allowed'
                : 'border-zinc-700 text-zinc-400 active:scale-90 active:border-amber-500 active:text-amber-500'
            }`}
          >
            &rarr;
          </button>
        </div>

        {/* Swipeable Card Area */}
        <div
          className="overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            style={{
              transform: `translateX(${offsetX}px)`,
              transition: dragging ? 'none' : 'transform 300ms ease-out',
            }}
          >
            {items[index]}
          </div>
        </div>

        {/* Mini Progress Bar */}
        <div className="mt-4 mx-1">
          <div className="h-[2px] bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500/60 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${((index + 1) / items.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ═══ DESKTOP: Grid Layout ═══ */}
      <div className={`hidden md:grid ${gridClassName} gap-4 pb-32`}>
        {items}
      </div>
    </>
  );
};

export default SwipeCards;
