'use client';

import React, { useEffect, useRef } from 'react';

interface HolocronOrbProps {
  size?: number;
  opacity?: number;
  className?: string;
}

const DOT_COUNT = 120;
const PULSE_SPEED = 0.8;

interface Dot {
  theta: number;  // latitude
  phi: number;    // longitude
  size: number;
}

function createDots(): Dot[] {
  const dots: Dot[] = [];
  // Fibonacci sphere distribution for even spacing
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < DOT_COUNT; i++) {
    const theta = Math.acos(1 - 2 * (i + 0.5) / DOT_COUNT);
    const phi = goldenAngle * i;
    dots.push({ theta, phi, size: 1.5 + Math.random() * 1.5 });
  }
  return dots;
}

const HolocronOrb: React.FC<HolocronOrbProps> = ({ size = 200, opacity = 1, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const dotsRef = useRef<Dot[]>(createDots());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const dots = dotsRef.current;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.35;
    let time = 0;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, size, size);

      const rotY = time * 0.4; // rotation speed
      const pulsePhase = time * PULSE_SPEED;

      // Sort dots by z-depth for proper layering
      const projected = dots.map((dot, i) => {
        // Rotate around Y axis
        const x3d = Math.sin(dot.theta) * Math.cos(dot.phi + rotY);
        const y3d = Math.cos(dot.theta);
        const z3d = Math.sin(dot.theta) * Math.sin(dot.phi + rotY);

        // Slight tilt
        const tiltAngle = 0.3;
        const y3dTilted = y3d * Math.cos(tiltAngle) - z3d * Math.sin(tiltAngle);
        const z3dTilted = y3d * Math.sin(tiltAngle) + z3d * Math.cos(tiltAngle);

        // Project to 2D
        const perspective = 1 + z3dTilted * 0.3;
        const px = cx + x3d * radius * perspective;
        const py = cy + y3dTilted * radius * perspective;

        // Pulse wave: travels from top to bottom
        const pulseWave = Math.sin(dot.theta * 3 - pulsePhase * Math.PI * 2);
        const isPulsed = pulseWave > 0.6;

        return { px, py, z: z3dTilted, size: dot.size * perspective, isPulsed, i };
      });

      // Sort by z (back to front)
      projected.sort((a, b) => a.z - b.z);

      for (const p of projected) {
        const depthAlpha = 0.15 + (p.z + 1) * 0.425; // 0.15 (back) to 1.0 (front)

        if (p.isPulsed) {
          // Cyan pulse
          ctx.fillStyle = `rgba(6, 182, 212, ${depthAlpha * 0.9})`;
          ctx.shadowColor = 'rgba(6, 182, 212, 0.6)';
          ctx.shadowBlur = 8;
        } else {
          // Amber dot
          ctx.fillStyle = `rgba(245, 158, 11, ${depthAlpha * 0.7})`;
          ctx.shadowColor = 'rgba(245, 158, 11, 0.3)';
          ctx.shadowBlur = 4;
        }

        ctx.beginPath();
        ctx.arc(p.px, p.py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Reset shadow
      ctx.shadowBlur = 0;

      // Inner glow
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.8);
      gradient.addColorStop(0, 'rgba(245, 158, 11, 0.06)');
      gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.03)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.8, 0, Math.PI * 2);
      ctx.fill();

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: size,
        height: size,
        opacity,
      }}
    />
  );
};

export default HolocronOrb;
