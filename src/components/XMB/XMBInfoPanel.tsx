'use client';

import { ACTIVE_ROW_CENTER_VH, EXPANDED_MARGIN_PX, ICON_SIZE_VH } from './layout';

export interface XMBInfo {
  title: string;
  subtitle?: string;
  image?: string; // placeholder label until a real image is added
  body: string;
}

interface XMBInfoPanelProps {
  label: string;   // the opened item's name, shown on the row beside it
  icon?: string;
  info?: XMBInfo;
  open: boolean;
  onClose: () => void;
}

const FONT = "'NewRodin', sans-serif";
const EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
// Width + tint live here so the strip never depends on globals.css loading;
// globals.css only overrides them on phones (full width, darker)
const STRIP_WIDTH = 'var(--xmb-strip-width, clamp(300px, 34vw, 480px))';
const ROW_Y = `${ACTIVE_ROW_CENTER_VH}vh`;
const BAND_HALF = '1.5rem';

// Modelled on opening a PSP setting: the XMB slides left (handled by the bar and
// sub-items), a ◂ arrow and the item's name appear on its row with an underline
// running to a tinted strip that slides in from the right. The strip's
// highlighted band sits level with the row, content above and below it.
export default function XMBInfoPanel({ label, icon, info, open, onClose }: XMBInfoPanelProps) {
  if (!info) return null;

  return (
    <div
      role="dialog"
      aria-label={label}
      aria-hidden={!open}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 15,
        pointerEvents: 'none',
        color: '#fff',
        fontFamily: FONT,
      }}
    >
      {/* ROW — ◂ arrow, icon and name, underlined up to the strip */}
      <div className="xmb-info-row" style={{
        position: 'absolute',
        top: ROW_Y,
        left: `calc(${EXPANDED_MARGIN_PX}px + ${ICON_SIZE_VH}vh + 0.75rem)`,
        right: STRIP_WIDTH,
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.1rem',
        opacity: open ? 1 : 0,
        transition: open ? 'opacity 0.3s ease 0.15s' : 'opacity 0.15s ease',
      }}>
        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.85)' }}>◀</span>
        {icon && (
          <img
            src={icon}
            alt=""
            style={{
              width: `${ICON_SIZE_VH * 0.45}vh`,
              height: `${ICON_SIZE_VH * 0.45}vh`,
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))',
            }}
          />
        )}
        <span style={{
          flex: 1,
          paddingBottom: '0.35rem',
          borderBottom: '1px solid rgba(255,255,255,0.75)',
          fontSize: '1.8vh',
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
      </div>

      {/* STRIP — tinted panel from the right */}
      <aside className="xmb-info-strip" style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: STRIP_WIDTH,
        background: 'rgba(0,0,0,0.14)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: `transform 0.35s ${EASE}`,
        pointerEvents: open ? 'auto' : 'none',
      }}>
        {/* ABOVE THE BAND — photo */}
        {info.image && (
          <div style={{
            position: 'absolute',
            left: '1.25rem',
            bottom: `calc(100% - ${ROW_Y} + ${BAND_HALF} + 1rem)`,
          }}>
            <div
              role="img"
              aria-label={`${info.image} (image placeholder)`}
              style={{
                width: '6.5rem',
                aspectRatio: '1 / 1',
                background: 'rgba(255,255,255,0.18)',
                borderRadius: '3px',
              }}
            />
          </div>
        )}

        {/* HIGHLIGHT BAND — level with the opened item's row */}
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `calc(${ROW_Y} - ${BAND_HALF})`,
          height: `calc(${BAND_HALF} * 2)`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.25rem',
          background: 'rgba(255,255,255,0.16)',
          borderBottom: '1px solid rgba(255,255,255,0.45)',
          fontSize: '1.05rem',
          letterSpacing: '0.03em',
        }}>
          {info.title}
        </div>

        {/* BELOW THE BAND — title and paragraph */}
        <div style={{
          position: 'absolute',
          left: '1.25rem',
          right: '1.25rem',
          top: `calc(${ROW_Y} + ${BAND_HALF} + 1rem)`,
          bottom: '3.5rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem',
        }}>
          {info.subtitle && (
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.7)' }}>
              {info.subtitle}
            </span>
          )}
          <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.9)' }}>
            {info.body}
          </p>
        </div>

        {/* BACK */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            left: '1rem',
            bottom: '1rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.85)',
            fontFamily: FONT,
            fontSize: '0.7rem',
            letterSpacing: '0.06em',
            cursor: 'pointer',
          }}
        >
          <span style={{
            padding: '0.1rem 0.35rem',
            border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: '3px',
            fontSize: '0.6rem',
          }}>
            Esc
          </span>
          Back
        </button>
      </aside>
    </div>
  );
}
