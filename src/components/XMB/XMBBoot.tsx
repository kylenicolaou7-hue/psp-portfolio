'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useXMBSound } from '@/hooks/useXMBSound';

// Recreates the PSP power-on sequence on one black screen:
//   1. the name fades in between thin streak lines that gently ripple
//   2. the name stays; the controls fade in beneath it
//   3. Enter fades both out, then the black fades away to reveal the XMB

const NAME = 'Kyle Nicolaou';
const CONTROLS_AT = 2600;  // ms — controls fade in under the name
const CONTROLS_OUT_MS = 400;
const BLACK_OUT_MS = 1000;   // black fades away after the controls start fading
const BLACK_OUT_DELAY = 200;
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';

// Thin streak lines framing the name — a bright pair hugging the text with
// fainter echoes just outside. `gap` is px outside the band edge.
const STREAKS = [
  { edge: 'top', gap: 0, alpha: 0.75, amp: 1.2, phase: 0 },
  { edge: 'top', gap: 4, alpha: 0.25, amp: 2.2, phase: 1.7 },
  { edge: 'bottom', gap: 0, alpha: 0.75, amp: 1.2, phase: 3.1 },
  { edge: 'bottom', gap: 4, alpha: 0.25, amp: 2.2, phase: 4.6 },
] as const;
const PAD = 12; // canvas room above/below the band for the ripple

type Phase = 'intro' | 'ready' | 'opening';

const CONTROLS: { keys: string[][]; action: string }[] = [
  { keys: [['W', 'A', 'S', 'D'], ['↑', '←', '↓', '→'], ['Scroll']], action: 'Navigate' },
  { keys: [['Enter'], ['Click']], action: 'Open' },
  { keys: [['Esc']], action: 'Back' },
];

// Streak lines with a slight, slow wave running through them
function WaveLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let frame = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      // client* sizes ignore the CSS scale animation applied to the canvas
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const start = performance.now();
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;

      for (const line of STREAKS) {
        const base = line.edge === 'top' ? PAD - line.gap : h - PAD + line.gap;
        const fade = ctx.createLinearGradient(0, 0, w, 0);
        fade.addColorStop(0, 'rgba(255,255,255,0)');
        fade.addColorStop(0.12, `rgba(255,255,255,${line.alpha})`);
        fade.addColorStop(0.75, `rgba(255,255,255,${line.alpha})`);
        fade.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = fade;

        ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          const y = base
            + Math.sin(x * 0.006 + t * 1.1 + line.phase) * line.amp
            + Math.sin(x * 0.017 - t * 0.7 + line.phase * 2) * line.amp * 0.4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        left: '1%',
        right: '1%',
        top: `-${PAD}px`,
        bottom: `-${PAD}px`,
        width: '98%',
        height: `calc(100% + ${PAD * 2}px)`,
        animation: `bootStreakIn 900ms ${EASE} 900ms both`,
      }}
    />
  );
}

function Key({ label }: { label: string }) {
  return (
    <kbd style={{
      minWidth: '1.9rem',
      height: '1.9rem',
      padding: '0 0.5rem',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid rgba(255,255,255,0.35)',
      borderRadius: '5px',
      background: 'rgba(255,255,255,0.06)',
      fontFamily: "'NewRodin', sans-serif",
      fontSize: '0.7rem',
      letterSpacing: '0.05em',
      color: '#fff',
    }}>
      {label}
    </kbd>
  );
}

export default function XMBBoot({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const { playClick } = useXMBSound();

  const start = useCallback(() => {
    playClick();
    setPhase('opening');
  }, [playClick]);

  // Controls appear under the name
  useEffect(() => {
    if (phase !== 'intro') return;
    const timer = setTimeout(() => setPhase('ready'), CONTROLS_AT);
    return () => clearTimeout(timer);
  }, [phase]);

  // Hand over to the XMB once the black has fully faded
  useEffect(() => {
    if (phase !== 'opening') return;
    const timer = setTimeout(onDone, BLACK_OUT_DELAY + BLACK_OUT_MS);
    return () => clearTimeout(timer);
  }, [phase, onDone]);

  // Enter shows the controls straight away, then starts the XMB
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      if (phase === 'intro') setPhase('ready');
      else if (phase === 'ready') start();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, start]);

  return (
    <div
      aria-label={`${NAME} — portfolio`}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        background: '#000',
        opacity: phase === 'opening' ? 0 : 1,
        transition: `opacity ${BLACK_OUT_MS}ms ease ${BLACK_OUT_DELAY}ms`,
        pointerEvents: phase === 'opening' ? 'none' : 'auto',
      }}
    >
      {/* NAME + CONTROLS — fade out together on Enter, before the black parts */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: phase === 'opening' ? 0 : 1,
        transition: `opacity ${CONTROLS_OUT_MS}ms ease`,
      }}>
        {/* NAME BAND — the name between rippling streak lines */}
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          height: '1.5em',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'clamp(1.1rem, 2.4vw, 1.75rem)',
        }}>
          <WaveLines />

          <span style={{
            position: 'relative',
            fontFamily: "'NewRodin', sans-serif",
            letterSpacing: '-0.01em',
            color: '#fff',
            textShadow: '0 0 10px rgba(255,255,255,0.35)',
            animation: 'xmbFadeIn 1000ms ease 300ms both',
          }}>
            {NAME}
          </span>
        </div>

        {/* CONTROLS — beneath the name */}
        {phase !== 'intro' && (
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 'calc(50% + 3rem)',
            display: 'flex',
            justifyContent: 'center',
            padding: '0 1.5rem',
            animation: 'xmbFadeIn 800ms ease both',
          }}>
            <div style={{
              width: 'min(340px, 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem',
              color: '#fff',
            }}>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {CONTROLS.map(({ keys, action }) => (
                  <div key={action} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      {keys.map((group, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          {i > 0 && (
                            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', marginRight: '0.35rem' }}>or</span>
                          )}
                          {group.map(k => <Key key={k} label={k} />)}
                        </span>
                      ))}
                    </div>
                    <span style={{
                      fontFamily: "'NewRodin', sans-serif",
                      fontSize: '0.7rem',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.7)',
                    }}>
                      {action}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={start}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.6rem 1.3rem',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.35)',
                  borderRadius: '999px',
                  color: '#fff',
                  fontFamily: "'NewRodin', sans-serif",
                  fontSize: '0.65rem',
                  letterSpacing: '0.18em',
                  cursor: 'pointer',
                  animation: 'bootPulse 1.8s ease-in-out infinite',
                }}
              >
                PRESS ENTER TO START
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
