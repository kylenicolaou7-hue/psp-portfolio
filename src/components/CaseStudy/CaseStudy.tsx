'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MediaSlot, Project } from '@/data/projects';
import XMBStatusBar from '@/components/XMB/XMBStatusBar';
import { useXMBSound } from '@/hooks/useXMBSound';
import { useXMBSettings } from '@/hooks/useXMBSettings';
import { getTheme } from '@/data/themes';

const FADE_MS = 600;
const HEADING_FONT = "'NewRodin', sans-serif";
const BODY_FONT = "'M PLUS Rounded 1c', sans-serif";
const ACCENT = 'rgba(255,140,60,0.9)';

// Grey stand-in until real images and videos are added
function Placeholder({ media }: { media: MediaSlot }) {
  return (
    <div
      role="img"
      aria-label={`${media.label} (${media.kind} placeholder)`}
      style={{
        width: '100%',
        aspectRatio: '16 / 9',
        background: '#2b2b30',
        borderRadius: '4px',
      }}
    />
  );
}

export default function CaseStudy({ project }: { project: Project }) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState(false);
  const { playClick } = useXMBSound();
  // Top glow picks up the colour of the chosen theme
  const [r, g, b] = getTheme(useXMBSettings().theme).gradient[0];

  const backHref = `/?project=${project.slug}`;

  const goBack = useCallback(() => {
    if (leaving) return;
    playClick();
    setLeaving(true);
  }, [leaving, playClick]);

  // Focus the scroll area so arrow keys / space scroll the case study
  useEffect(() => {
    scrollRef.current?.focus();
    router.prefetch(backHref);
  }, [router, backHref]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goBack]);

  // Fade to black, then return to the XMB on this project
  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(() => router.push(backHref), FADE_MS);
    return () => clearTimeout(timer);
  }, [leaving, router, backHref]);

  return (
    <div
      ref={scrollRef}
      tabIndex={-1}
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        outline: 'none',
        background: `radial-gradient(ellipse at top, rgba(${r},${g},${b},0.12), transparent 60%), #0b0b10`,
        color: 'rgba(255,255,255,0.85)',
        fontFamily: BODY_FONT,
      }}
    >
      {/* TOP BAR */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3rem',
        background: 'linear-gradient(to bottom, #0b0b10, rgba(11,11,16,0))',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <XMBStatusBar />
      </div>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '5rem 1.5rem 7rem' }}>

        {/* HEADER */}
        <header style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <span style={{
            fontFamily: HEADING_FONT,
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
          }}>
            {project.tags}
          </span>
          <h1 style={{
            fontFamily: HEADING_FONT,
            fontWeight: 400,
            fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
            lineHeight: 1.1,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#fff',
          }}>
            {project.title}
          </h1>
          <Placeholder media={project.hero} />
          <p style={{ fontSize: '1.05rem', lineHeight: 1.75, maxWidth: '68ch' }}>
            {project.overview}
          </p>

          {/* INFORMATION */}
          <dl style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1.25rem',
            padding: '1.5rem 0',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
          }}>
            {project.meta.map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <dt style={{
                  fontFamily: HEADING_FONT,
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.45)',
                }}>
                  {label}
                </dt>
                <dd style={{ fontSize: '0.95rem' }}>{value}</dd>
              </div>
            ))}
          </dl>
        </header>

        {/* SECTIONS */}
        {project.sections.map(section => (
          <section
            key={section.number}
            style={{ marginTop: '6rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <span style={{ fontFamily: HEADING_FONT, fontSize: '0.8rem', letterSpacing: '0.2em', color: ACCENT }}>
                {section.number}
              </span>
              <h2 style={{
                fontFamily: HEADING_FONT,
                fontWeight: 400,
                fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)',
                color: '#fff',
              }}>
                {section.title}
              </h2>
              {section.intro && (
                <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', maxWidth: '68ch' }}>
                  {section.intro}
                </p>
              )}
            </div>

            {section.body && (
              <p style={{ fontSize: '1rem', lineHeight: 1.75, maxWidth: '68ch' }}>{section.body}</p>
            )}

            {section.blocks && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem 2.5rem',
            }}>
              {section.blocks.map(block => (
                <div key={block.title} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h3 style={{
                    fontFamily: HEADING_FONT,
                    fontWeight: 400,
                    fontSize: '0.75rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.55)',
                  }}>
                    {block.title}
                  </h3>
                  <p style={{ fontSize: '0.98rem', lineHeight: 1.75 }}>{block.body}</p>
                </div>
              ))}
            </div>
            )}

            {section.media && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: section.media.length > 1 ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr',
                gap: '1rem',
              }}>
                {section.media.map(media => (
                  <Placeholder key={media.label} media={media} />
                ))}
              </div>
            )}
          </section>
        ))}
      </main>

      {/* BACK — Escape, or click */}
      <button
        type="button"
        onClick={goBack}
        style={{
          position: 'fixed',
          bottom: '1.2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          padding: '0.5rem 1rem',
          background: 'rgba(11,11,16,0.75)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '999px',
          color: 'rgba(255,255,255,0.7)',
          fontFamily: HEADING_FONT,
          fontSize: '0.65rem',
          letterSpacing: '0.18em',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        ESC &nbsp; BACK
      </button>

      {/* ENTER FADE — from black, as if the game just booted */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 30,
        background: '#000',
        pointerEvents: 'none',
        animation: `xmbFadeOut ${FADE_MS}ms ease both`,
      }} />

      {/* LEAVE FADE */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 31,
        background: '#000',
        pointerEvents: 'none',
        opacity: leaving ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease`,
      }} />
    </div>
  );
}
