'use client';

import { useEffect, useRef } from 'react';
import { getSettings } from '@/hooks/useXMBSettings';
import type { RGB, XMBTheme } from '@/data/themes';
import { ACTIVE_ANCHOR_X, ACTIVE_ROW_CENTER_VH, ROW_TOP_VH } from './layout';

// ── Ripple tuning ───────────────────────────────────────────────────────────
// Each move sends an invisible ring out from the icon you landed on. Nothing is
// drawn for the ring itself: it bends the background waves as it passes, and
// refracts the whole background (gradient, glow, waves) like light through
// moving water. Bigger for opening an item.
export type XMBRippleKind = 'category' | 'item' | 'open';
const RIPPLES: Record<XMBRippleKind, {
  rings: number;   // number of rings
  gap: number;     // ms between rings
  ms: number;      // each ring's lifetime
  reach: number;   // travel distance, as a share of the screen diagonal
  bump: number;    // px the waves lift as a ring passes
  lens: number;    // px the whole background is refracted at the ring
  originVh: number;
}> = {
  category: { rings: 2, gap: 160, ms: 1500, reach: 0.6, bump: 18, lens: 9,  originVh: ROW_TOP_VH },
  item:     { rings: 1, gap: 0,   ms: 1100, reach: 0.4, bump: 10, lens: 6,  originVh: ACTIVE_ROW_CENTER_VH },
  open:     { rings: 2, gap: 200, ms: 1800, reach: 0.8, bump: 26, lens: 14, originVh: ACTIVE_ROW_CENTER_VH },
};
const MAX_RIPPLES = 4;      // older ripples drop off during rapid navigation
const RIPPLE_BAND = 70;     // px — width of the bend around each ring
const LENS_STRIPS = 9;      // thin rings per ripple used to build the refraction
const LENS_MAX_RINGS = 3;   // only the strongest rings refract — keeps rapid navigation smooth

export interface XMBRippleSignal { id: number; kind: XMBRippleKind }

// Switching theme blends every colour across to the new palette
const THEME_FADE_MS = 900;
type Palette = { gradient: RGB[]; waves: RGB[]; glow: RGB[] };
const toPalette = (t: XMBTheme): Palette => ({ gradient: [...t.gradient], waves: [...t.waves], glow: [...t.glow] });
const mixRGB = (a: RGB, b: RGB, p: number): RGB => [0, 1, 2].map(i => a[i] + (b[i] - a[i]) * p) as unknown as RGB;
const mixPalette = (a: Palette, b: Palette, p: number): Palette => ({
  gradient: a.gradient.map((c, i) => mixRGB(c, b.gradient[i], p)),
  waves: a.waves.map((c, i) => mixRGB(c, b.waves[i], p)),
  glow: a.glow.map((c, i) => mixRGB(c, b.glow[i], p)),
});
const rgba = ([r, g, b]: RGB, a: number) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;

interface XMBBackgroundProps {
  // Colour theme from THEME / settings
  theme: XMBTheme;
  // PIC1-style image that replaces the waves while an item is highlighted
  backgroundImage?: string;
  // Changes on each move or open — sends a ripple out from the active icon
  ripple?: XMBRippleSignal;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const easeOut = (p: number) => 1 - Math.pow(1 - p, 2);

export default function XMBBackground({ theme, backgroundImage, ripple }: XMBBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const ripplesRef = useRef<{ kind: XMBRippleKind; start: number }[]>([]);
  // Palette drawn last frame, and the blend towards the current theme
  const paletteRef = useRef<Palette | null>(null);
  const blendRef = useRef<{ from: Palette; to: Palette; start: number } | null>(null);

  useEffect(() => {
    const to = toPalette(theme);
    const from = paletteRef.current;
    if (!from || prefersReducedMotion()) {
      paletteRef.current = to;
      blendRef.current = null;
    } else {
      blendRef.current = { from, to, start: performance.now() };
    }
  }, [theme]);

  useEffect(() => {
    if (!ripple || prefersReducedMotion() || !getSettings().effects) return; // SETTINGS → Background Effects
    ripplesRef.current = [...ripplesRef.current, { kind: ripple.kind, start: performance.now() }].slice(-MAX_RIPPLES);
  }, [ripple]);

  // Stop drawing once the image has fully covered the waves — saves GPU
  useEffect(() => {
    if (!backgroundImage) return;
    const timer = setTimeout(() => { pausedRef.current = true; }, 1000);
    return () => {
      clearTimeout(timer);
      pausedRef.current = false;
    };
  }, [backgroundImage]);

  // Canvas animation
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

    const draw = (now: number) => {
      frameRef.current = requestAnimationFrame(draw);
      if (pausedRef.current) return;

      timeRef.current += 0.004;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // Live ripple rings this frame: centre, radius, strength
      ripplesRef.current = ripplesRef.current.filter(r => {
        const cfg = RIPPLES[r.kind];
        return now - r.start < cfg.ms + cfg.gap * (cfg.rings - 1);
      });
      const diag = Math.hypot(w, h);
      const rings: { cx: number; cy: number; r: number; fade: number; bump: number; lens: number }[] = [];
      for (const rp of ripplesRef.current) {
        const cfg = RIPPLES[rp.kind];
        const age = now - rp.start;
        for (let i = 0; i < cfg.rings; i++) {
          const p = (age - i * cfg.gap) / cfg.ms;
          if (p <= 0 || p >= 1) continue;
          rings.push({
            cx: ACTIVE_ANCHOR_X,
            cy: (cfg.originVh / 100) * h,
            r: easeOut(p) * diag * cfg.reach,
            fade: Math.pow(1 - p, 1.5) * (1 - i * 0.3),
            bump: cfg.bump,
            lens: cfg.lens,
          });
        }
      }
      // How far a point on a wave lifts as rings pass through it
      const bulge = (x: number, y: number) => {
        let dy = 0;
        for (const ring of rings) {
          const off = (Math.hypot(x - ring.cx, y - ring.cy) - ring.r) / RIPPLE_BAND;
          if (off > -3 && off < 3) dy -= ring.bump * ring.fade * Math.exp(-off * off);
        }
        return dy;
      };

      // Theme colours, mid-blend if the theme just changed
      const blend = blendRef.current;
      if (blend) {
        const p = Math.min(1, (now - blend.start) / THEME_FADE_MS);
        paletteRef.current = mixPalette(blend.from, blend.to, p * p * (3 - 2 * p));
        if (p >= 1) blendRef.current = null;
      }
      const palette = paletteRef.current!;

      const bg = ctx.createLinearGradient(0, 0, 0, h);
      [0, 0.4, 0.7, 1].forEach((stop, i) => bg.addColorStop(stop, rgba(palette.gradient[i], 1)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const waves = [
        { yBase: 0.3,  amp1: 60, freq1: 0.003,  speed1: 0.4,  phase1: 0.0, amp2: 25, freq2: 0.006, speed2: 0.25, phase2: 1.0, alpha: 0.18 },
        { yBase: 0.45, amp1: 70, freq1: 0.0035, speed1: 0.5,  phase1: 2.0, amp2: 30, freq2: 0.007, speed2: 0.3,  phase2: 0.5, alpha: 0.22 },
        { yBase: 0.55, amp1: 65, freq1: 0.004,  speed1: 0.45, phase1: 1.0, amp2: 28, freq2: 0.008, speed2: 0.28, phase2: 2.5, alpha: 0.25 },
        { yBase: 0.65, amp1: 55, freq1: 0.0045, speed1: 0.55, phase1: 3.0, amp2: 22, freq2: 0.009, speed2: 0.35, phase2: 1.5, alpha: 0.28 },
        { yBase: 0.78, amp1: 45, freq1: 0.005,  speed1: 0.6,  phase1: 0.5, amp2: 18, freq2: 0.01,  speed2: 0.4,  phase2: 2.0, alpha: 0.3 },
      ];

      waves.forEach((wave, i) => {
        const colour = palette.waves[i];
        const points: [number, number][] = [];
        for (let x = 0; x <= w; x += 3) {
          const y =
            h * wave.yBase +
            Math.sin(x * wave.freq1 + t * wave.speed1 + wave.phase1) * wave.amp1 +
            Math.sin(x * wave.freq2 + t * wave.speed2 + wave.phase2) * wave.amp2;
          points.push([x, rings.length ? y + bulge(x, y) : y]);
        }
        ctx.beginPath();
        ctx.moveTo(0, h);
        points.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = rgba(colour, wave.alpha);
        ctx.fill();

        ctx.beginPath();
        points.forEach(([x, y], i) => {
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = rgba(colour, 0.5);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Centre glow, tinted to the theme
      const centreGlow = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, w * 0.6);
      centreGlow.addColorStop(0,   rgba(palette.glow[0], 0.15));
      centreGlow.addColorStop(0.5, rgba(palette.glow[1], 0.05));
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

      const lensRings = rings
        .filter(r => r.fade > 0.05)
        .sort((a, b) => b.fade * b.lens - a.fade * a.lens)
        .slice(0, LENS_MAX_RINGS);
      if (lensRings.length) refract(lensRings, w, h);
    };

    // Water refraction: snapshot the finished frame, then redraw thin rings of it
    // scaled about the ripple's centre. The shift follows the slope of a ripple
    // (derivative of a Gaussian), so the band stretches on one side and squeezes
    // on the other, and fades to nothing at its edges — no visible seams or lines.
    const snapshot = document.createElement('canvas');
    const snap = snapshot.getContext('2d');
    const refract = (list: { cx: number; cy: number; r: number; fade: number; lens: number }[], w: number, h: number) => {
      if (!snap) return;
      if (snapshot.width !== w || snapshot.height !== h) {
        snapshot.width = w;
        snapshot.height = h;
      }
      snap.drawImage(canvas, 0, 0);

      const span = RIPPLE_BAND * 1.6; // strips cover ±1.6 bands around the ring
      const step = (span * 2) / LENS_STRIPS;
      for (const ring of list) {
        for (let k = 0; k < LENS_STRIPS; k++) {
          const inner = Math.max(1, ring.r - span + k * step);
          const outer = ring.r - span + (k + 1) * step;
          if (outer <= inner) continue;
          const mid = (inner + outer) / 2;
          const off = (mid - ring.r) / RIPPLE_BAND;
          const shift = ring.lens * ring.fade * -2 * off * Math.exp(-off * off);
          const scale = mid / Math.max(1, mid - shift);

          ctx.save();
          ctx.beginPath();
          ctx.arc(ring.cx, ring.cy, outer, 0, Math.PI * 2);
          ctx.arc(ring.cx, ring.cy, inner, 0, Math.PI * 2, true);
          ctx.clip();
          ctx.translate(ring.cx, ring.cy);
          ctx.scale(scale, scale);
          ctx.translate(-ring.cx, -ring.cy);
          ctx.drawImage(snapshot, 0, 0);
          ctx.restore();
        }
      }
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      {/* WAVE CANVAS — fades out 500ms after a background image is set */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          width: '100%',
          height: '100%',
          opacity: backgroundImage ? 0 : 1,
          transition: backgroundImage ? 'opacity 0.5s ease 0.5s' : 'opacity 0.5s ease',
        }}
      />

      {/* BACKGROUND IMAGE — only mounts while an item with a preview is highlighted */}
      {backgroundImage && (
        <div
          key={backgroundImage}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            animation: 'xmbFadeIn 0.5s ease 0.5s both',
          }}
        >
          <img
            src={backgroundImage}
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
