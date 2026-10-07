'use client';

import { useCallback, useEffect, useState } from 'react';
import { useXMBSound } from '@/hooks/useXMBSound';

// Recreates the PSP power-on sequence: on black, the name fades in, a line of
// colour appears behind it, then the line spreads open into the XMB background.
// Followed by a controls screen; Enter starts the XMB.

const NAME = 'Kyle Nicolaou';
const SPLIT_AT = 2700;     // ms — name fades out and the line spreads open
const SPLIT_MS = 1400;
const INTRO_MS = SPLIT_AT + SPLIT_MS + 100;
const LEAVE_MS = 500;
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';

type Phase = 'intro' | 'controls' | 'leaving';

const CONTROLS: { keys: string[][]; action: string }[] = [
  { keys: [['W', 'A', 'S', 'D'], ['↑', '←', '↓', '→']], action: 'Navigate' },
  { keys: [['Enter']], action: 'Open' },
  { keys: [['Esc']], action: 'Back' },
];

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
  const intro = phase === 'intro';

  const start = useCallback(() => {
    playClick();
    setPhase('leaving');
  }, [playClick]);

  // Intro plays through to the controls screen
  useEffect(() => {
    if (phase !== 'intro') return;
    const timer = setTimeout(() => setPhase('controls'), INTRO_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  // Hand over to the XMB once the controls screen has faded
  useEffect(() => {
    if (phase !== 'leaving') return;
    const timer = setTimeout(onDone, LEAVE_MS);
    return () => clearTimeout(timer);
  }, [phase, onDone]);

  // Enter skips the intro, then starts the XMB
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      if (phase === 'intro') setPhase('controls');
      else if (phase === 'controls') start();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, start]);

  const panel = (edge: 'top' | 'bottom') => ({
    position: 'absolute' as const,
    left: 0,
    right: 0,
    [edge]: 0,
    height: '50%',
    background: '#000',
    // Once the intro is skipped or finished, the panels sit fully open
    transform: intro ? undefined : `translateY(${edge === 'top' ? '-100%' : '100%'})`,
    animation: intro
      ? `${edge === 'top' ? 'bootOpenUp' : 'bootOpenDown'} ${SPLIT_MS}ms ${EASE} ${SPLIT_AT}ms both`
      : undefined,
  });

  return (
    <div
      aria-label={`${NAME} — portfolio`}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        pointerEvents: phase === 'leaving' ? 'none' : 'auto',
      }}
    >
      {/* BLACK PANELS — part to reveal the XMB background */}
      <div style={panel('top')} />
      <div style={panel('bottom')} />

      {intro && (
        <>
          {/* LINE OF COLOUR — appears behind the name, then spreads open */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '2px',
            marginTop: '-1px',
            background: 'linear-gradient(to right, transparent, #D93600 20%, #ffb070 50%, #D93600 80%, transparent)',
            boxShadow: '0 0 18px 2px rgba(230,92,0,0.6)',
            animation: `xmbFadeIn 600ms ease 1500ms both, bootLineSpread ${SPLIT_MS}ms ${EASE} ${SPLIT_AT}ms forwards`,
          }} />

          {/* NAME */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: '4.5rem',
            fontFamily: "'NewRodin', sans-serif",
            fontSize: 'clamp(1.1rem, 2.4vw, 1.75rem)',
            letterSpacing: '0.06em',
            color: '#fff',
            animation: `xmbFadeIn 1000ms ease 300ms both, xmbFadeOut 700ms ease ${SPLIT_AT}ms forwards`,
          }}>
            {NAME}
          </div>
        </>
      )}

      {/* CONTROLS */}
      {!intro && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          background: 'rgba(0,0,0,0.35)',
          opacity: phase === 'leaving' ? 0 : 1,
          transition: `opacity ${LEAVE_MS}ms ease`,
          animation: 'xmbFadeIn 500ms ease both',
        }}>
          <div style={{
            width: 'min(420px, 100%)',
            padding: '2.25rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.75rem',
            background: 'rgba(10,10,16,0.8)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            color: '#fff',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontFamily: "'NewRodin', sans-serif",
                fontSize: '1.3rem',
                letterSpacing: '0.08em',
              }}>
                {NAME}
              </span>
              <span style={{
                fontFamily: "'NewRodin', sans-serif",
                fontSize: '0.7rem',
                letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.55)',
              }}>
                UX/UI · Interactive Designer
              </span>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.15)' }} />

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                    fontSize: '0.75rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.75)',
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
                marginTop: '0.25rem',
                padding: '0.65rem 1.4rem',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: '999px',
                color: '#fff',
                fontFamily: "'NewRodin', sans-serif",
                fontSize: '0.7rem',
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
  );
}
