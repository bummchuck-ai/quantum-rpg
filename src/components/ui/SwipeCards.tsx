'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { playNavigate, playClick } from '@/lib/sounds';

type ViewMode = 'swipe' | 'grid';

interface SwipeCardsProps {
  children: React.ReactNode;
  gridClassName?: string;
  defaultView?: ViewMode;
  onActiveIndexChange?: (index: number) => void;
  onViewModeChange?: (mode: ViewMode) => void;
}

const SPRING = 'cubic-bezier(0.32, 0.72, 0, 1)';
const TRANSITION_MS = 420;
const SWIPE_THRESHOLD = 50;
const RUBBER_DAMPING = 0.15;
const PEEK_TRANSLATE = 85; // % offset for peek cards
const PEEK_SCALE = 0.88;
const PEEK_ROTATE = 5; // deg rotateY for peek cards
const DRAG_ROTATE_FACTOR = -3; // deg per drag fraction for active card
const DRAG_TRANSLATE_FACTOR = 12; // % translate for active card during drag

const SwipeCards: React.FC<SwipeCardsProps> = ({
  children,
  gridClassName = 'md:grid-cols-2 lg:grid-cols-3',
  defaultView = 'swipe',
  onActiveIndexChange,
  onViewModeChange,
}) => {
  const items = React.Children.toArray(children);
  const [index, setIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startRef = useRef({ x: 0, y: 0 });
  const dirRef = useRef<'h' | 'v' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Notify parent of active index changes
  useEffect(() => {
    onActiveIndexChange?.(index);
  }, [index, onActiveIndexChange]);

  // Notify parent of view mode changes
  useEffect(() => {
    onViewModeChange?.(viewMode);
  }, [viewMode, onViewModeChange]);

  const goTo = useCallback((i: number) => {
    const clamped = Math.max(0, Math.min(items.length - 1, i));
    if (clamped !== index) {
      playNavigate();
    }
    setIndex(clamped);
  }, [items.length, index]);

  const toggleView = useCallback(() => {
    playClick();
    setViewMode(prev => prev === 'swipe' ? 'grid' : 'swipe');
  }, []);

  // Container width for drag fraction calculation
  const getContainerWidth = useCallback(() => {
    return containerRef.current?.offsetWidth || 360;
  }, []);

  // Drag fraction: -1 (full left) to +1 (full right)
  const dragFraction = useMemo(() => {
    if (!isDragging || dragX === 0) return 0;
    return Math.max(-1, Math.min(1, dragX / getContainerWidth()));
  }, [isDragging, dragX, getContainerWidth]);

  // ── Pointer events (touch + mouse) ──
  // Store pointerId so we can capture it lazily in onPointerMove
  const pointerIdRef = useRef<number | null>(null);
  const capturedRef = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (viewMode !== 'swipe') return;
    startRef.current = { x: e.clientX, y: e.clientY };
    dirRef.current = null;
    pointerIdRef.current = e.pointerId;
    capturedRef.current = false;
    setIsDragging(true);
    // Do NOT capture pointer here — it would block button clicks.
    // Capture is deferred to onPointerMove once horizontal swipe is confirmed.
  }, [viewMode]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || viewMode !== 'swipe') return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    // Lock direction on first significant movement
    if (dirRef.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      dirRef.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
      // Capture pointer only when horizontal swipe is confirmed
      if (dirRef.current === 'h' && !capturedRef.current && pointerIdRef.current !== null) {
        try { containerRef.current?.setPointerCapture(pointerIdRef.current); } catch { /* ignore */ }
        capturedRef.current = true;
      }
    }

    if (dirRef.current !== 'h') return;

    // Prevent scroll while swiping horizontally
    e.preventDefault();

    // Rubber band at edges
    let offset = dx;
    if ((index === 0 && dx > 0) || (index >= items.length - 1 && dx < 0)) {
      offset = dx * RUBBER_DAMPING;
    }
    setDragX(offset);
  }, [isDragging, viewMode, index, items.length]);

  const onPointerUp = useCallback((e?: React.PointerEvent) => {
    if (!isDragging) return;
    // Release pointer capture only if we actually captured it
    if (e && containerRef.current && capturedRef.current) {
      try { containerRef.current.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    }
    capturedRef.current = false;
    pointerIdRef.current = null;
    setIsDragging(false);
    if (dirRef.current === 'h') {
      if (dragX < -SWIPE_THRESHOLD && index < items.length - 1) goTo(index + 1);
      else if (dragX > SWIPE_THRESHOLD && index > 0) goTo(index - 1);
    }
    setDragX(0);
    dirRef.current = null;
  }, [isDragging, dragX, index, items.length, goTo]);

  // ── Card transform styles ──
  const getCardStyle = useCallback((cardIndex: number): React.CSSProperties => {
    const diff = cardIndex - index;
    const isActive = diff === 0;
    const isPrev = diff === -1;
    const isNext = diff === 1;
    const isVisible = Math.abs(diff) <= 1;

    if (!isVisible) {
      return { display: 'none' };
    }

    const baseTrans = `${TRANSITION_MS}ms ${SPRING}`;
    const transition = isDragging ? 'none' : `transform ${baseTrans}, opacity ${baseTrans}`;

    if (isActive) {
      const tx = isDragging ? `translateX(${dragFraction * DRAG_TRANSLATE_FACTOR}%)` : 'translateX(0)';
      const ry = isDragging ? `rotateY(${dragFraction * DRAG_ROTATE_FACTOR}deg)` : 'rotateY(0deg)';
      return {
        position: 'relative',
        zIndex: 10,
        transform: `${tx} ${ry} scale(1)`,
        opacity: 1,
        transition,
        pointerEvents: 'auto' as const,
      };
    }

    // Peek cards
    const direction = isPrev ? -1 : 1;
    const basePeek = direction * PEEK_TRANSLATE;

    // During drag, peek cards respond to drag
    let peekOffset = basePeek;
    let peekOpacity = 0.35;
    let peekScale = PEEK_SCALE;

    if (isDragging) {
      // When dragging towards a peek card, it slides closer and becomes more visible
      const dragDir = dragFraction > 0 ? -1 : 1; // drag right = moving to prev (-1), drag left = moving to next (+1)
      if (dragDir === direction) {
        // Dragging towards this peek card
        const approach = Math.abs(dragFraction);
        peekOffset = basePeek * (1 - approach * 0.4);
        peekOpacity = 0.35 + approach * 0.45;
        peekScale = PEEK_SCALE + approach * (1 - PEEK_SCALE) * 0.6;
      }
    }

    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 5,
      transform: `translateX(${peekOffset}%) scale(${peekScale}) rotateY(${-direction * PEEK_ROTATE}deg)`,
      opacity: peekOpacity,
      transition,
      pointerEvents: 'none' as const,
      maxHeight: '320px',
      overflow: 'hidden',
      maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
      filter: 'blur(1px)',
    };
  }, [index, isDragging, dragFraction]);

  if (items.length === 0) return null;

  // ═══ SWIPE VIEW ═══
  if (viewMode === 'swipe') {
    return (
      <div className="pb-32 max-w-lg mx-auto">
        {/* View Toggle + Nav */}
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
            ←
          </button>

          <div className="flex items-center gap-3">
            <div className="text-[11px] font-mono tracking-widest select-none">
              <span className="text-amber-500 font-black">{String(index + 1).padStart(2, '0')}</span>
              <span className="text-zinc-700 mx-1.5">/</span>
              <span className="text-zinc-500">{String(items.length).padStart(2, '0')}</span>
            </div>
            <button
              onClick={toggleView}
              className="border border-zinc-800 hover:border-zinc-600 rounded-lg px-2.5 py-1.5 text-[9px] text-zinc-500 hover:text-zinc-300 font-black uppercase tracking-widest transition-all"
              title="Switch to grid view"
            >
              ≡ GRID
            </button>
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
            →
          </button>
        </div>

        {/* Swipeable 3D Card Area */}
        <div
          ref={containerRef}
          className="relative overflow-visible"
          style={{ perspective: '1200px', touchAction: 'pan-y' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* Render prev, active, next */}
          {items.map((item, i) => {
            const diff = Math.abs(i - index);
            if (diff > 1) return null;
            // Use child's key (stable across filter changes) instead of array index
            const stableKey = React.isValidElement(item) ? (item.key || i) : i;
            return (
              <div
                key={stableKey}
                style={getCardStyle(i)}
                className="will-change-transform"
              >
                {item}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-4 mx-1">
          <div className="h-[2px] bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500/60 rounded-full"
              style={{
                width: `${((index + 1) / items.length) * 100}%`,
                transition: `width ${TRANSITION_MS}ms ${SPRING}`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ═══ GRID VIEW ═══
  return (
    <div className="pb-32 max-w-2xl mx-auto px-1">
      {/* View Toggle */}
      <div className="flex justify-end mb-3 px-1">
        <button
          onClick={toggleView}
          className="border border-zinc-800 hover:border-zinc-600 rounded-lg px-2.5 py-1.5 text-[9px] text-zinc-500 hover:text-zinc-300 font-black uppercase tracking-widest transition-all"
          title="Switch to swipe view"
        >
          ◇ SWIPE
        </button>
      </div>
      <div className={`grid grid-cols-2 ${gridClassName} gap-2`}>
        {items}
      </div>
    </div>
  );
};

export default SwipeCards;
