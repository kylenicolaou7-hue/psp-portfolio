'use client';

export interface XMBInfo {
  heading: string;
  title: string;
  subtitle?: string;
  image?: string; // placeholder label until a real image is added
  body: string;
}

interface XMBInfoPanelProps {
  info?: XMBInfo;
  open: boolean;
  onClose: () => void;
}

// Slides in from the right like the PSP's Triangle options / Information panel
export default function XMBInfoPanel({ info, open, onClose }: XMBInfoPanelProps) {
  if (!info) return null;

  return (
    <>
      {/* DIM — click to close */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 14,
          background: 'rgba(0,0,0,0.35)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.35s ease',
        }}
      />

      {/* PANEL */}
      <aside
        role="dialog"
        aria-label={info.title}
        aria-hidden={!open}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(480px, 100%)',
          zIndex: 15,
          padding: '4rem 2.5rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '1.25rem',
          background: 'linear-gradient(to right, rgba(10,10,16,0.82), rgba(10,10,16,0.94))',
          borderLeft: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '-20px 0 40px rgba(0,0,0,0.35)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          color: 'rgba(255,255,255,0.85)',
        }}
      >
        <span style={{
          fontFamily: "'NewRodin', sans-serif",
          fontSize: '0.65rem',
          letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.45)',
        }}>
          {info.heading}
        </span>

        {info.image && (
          <div
            role="img"
            aria-label={`${info.image} (image placeholder)`}
            style={{
              width: '180px',
              aspectRatio: '1 / 1',
              background: '#2b2b30',
              borderRadius: '4px',
            }}
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <h2 style={{
            fontFamily: "'NewRodin', sans-serif",
            fontWeight: 400,
            fontSize: '1.6rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#fff',
          }}>
            {info.title}
          </h2>
          {info.subtitle && (
            <span style={{
              fontFamily: "'NewRodin', sans-serif",
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.5)',
            }}>
              {info.subtitle}
            </span>
          )}
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.15)' }} />

        <p style={{ fontSize: '1rem', lineHeight: 1.75 }}>{info.body}</p>
      </aside>
    </>
  );
}
