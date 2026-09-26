'use client';

import { useEffect, useRef, useState } from 'react';

interface XMBBackgroundProps {
  isRippleActive: boolean;
}

export default function XMBBackground({ isRippleActive }: XMBBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [showOverlay, setShowOverlay] = useState(false);

  // 500ms delay then fade in
  useEffect(() => {
    if (isRippleActive) {
      const timer = setTimeout(() => setShowOverlay(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowOverlay(false);
    }
  }, [isRippleActive]);

  // Canvas animation — pause when ripple is active
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      // Stop drawing when ripple image is showing — saves GPU
      if (isRippleActive) return;

      timeRef.current += 0.004;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // Preset 15 — #E65C00 #D93600 #CC0000 — orange to red fire
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0,   '#E65C00');
      bg.addColorStop(0.4, '#D93600');
      bg.addColorStop(0.7, '#CC0000');
      bg.addColorStop(1,   '#8a0000');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const waves = [
        { yBase: 0.3,  amp1: 60, freq1: 0.003,  speed1: 0.4,  phase1: 0.0, amp2: 25, freq2: 0.006, speed2: 0.25, phase2: 1.0, colour: 'rgba(255,120,30,0.18)'  },
        { yBase: 0.45, amp1: 70, freq1: 0.0035, speed1: 0.5,  phase1: 2.0, amp2: 30, freq2: 0.007, speed2: 0.3,  phase2: 0.5, colour: 'rgba(230,90,20,0.22)'   },
        { yBase: 0.55, amp1: 65, freq1: 0.004,  speed1: 0.45, phase1: 1.0, amp2: 28, freq2: 0.008, speed2: 0.28, phase2: 2.5, colour: 'rgba(210,60,10,0.25)'   },
        { yBase: 0.65, amp1: 55, freq1: 0.0045, speed1: 0.55, phase1: 3.0, amp2: 22, freq2: 0.009, speed2: 0.35, phase2: 1.5, colour: 'rgba(200,40,0,0.28)'    },
        { yBase: 0.78, amp1: 45, freq1: 0.005,  speed1: 0.6,  phase1: 0.5, amp2: 18, freq2: 0.01,  speed2: 0.4,  phase2: 2.0, colour: 'rgba(180,20,0,0.3)'     },
      ];

      waves.forEach((wave) => {
        const points: [number, number][] = [];
        for (let x = 0; x <= w; x += 3) {
          const y =
            h * wave.yBase +
            Math.sin(x * wave.freq1 + t * wave.speed1 + wave.phase1) * wave.amp1 +
            Math.sin(x * wave.freq2 + t * wave.speed2 + wave.phase2) * wave.amp2;
          points.push([x, y]);
        }
        ctx.beginPath();
        ctx.moveTo(0, h);
        points.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = wave.colour;
        ctx.fill();

        ctx.beginPath();
        points.forEach(([x, y], i) => {
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = wave.colour.replace(/[\d.]+\)$/, '0.5)');
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Centre glow — orange tinted
      const centreGlow = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, w * 0.6);
      centreGlow.addColorStop(0,   'rgba(255,120,30,0.15)');
      centreGlow.addColorStop(0.5, 'rgba(210,60,0,0.05)');
      centreGlow.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = centreGlow;
      ctx.fillRect(0, 0, w, h);

      const topDark = ctx.createLinearGradient(0, 0, 0, h * 0.3);
      topDark.addColorStop(0, 'rgba(0,0,0,0.4)');
      topDark.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = topDark;
      ctx.fillRect(0, 0, w, h);

      const bottomDark = ctx.createLinearGradient(0, h * 0.75, 0, h);
      bottomDark.addColorStop(0, 'rgba(0,0,0,0)');
      bottomDark.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = bottomDark;
      ctx.fillRect(0, 0, w, h);

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isRippleActive]);

  return (
    <>
      {/* WAVE CANVAS */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          width: '100%',
          height: '100%',
          opacity: showOverlay ? 0 : 1,
          transition: 'opacity 0.5s ease',
        }}
      />

      {/* RIPPLE BACKGROUND IMAGE — only mounts when ripple is active */}
      {isRippleActive && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          opacity: showOverlay ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}>
          <img
            src="/images/ripple.png"
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              filter: 'brightness(0.45) saturate(0.8)',
            }}
          />
        </div>
      )}
    </>
  );
}