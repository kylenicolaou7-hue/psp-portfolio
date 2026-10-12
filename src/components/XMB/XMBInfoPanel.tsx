'use client';

import { useEffect, useRef, useState } from 'react';
import type { XMBOption, XMBSection } from '@/data/xmb';
import { ACTIVE_ROW_CENTER_VH, EXPANDED_MARGIN_PX, ICON_SIZE_VH } from './layout';

export interface XMBInfo {
  title: string;
  subtitle?: string;
  image?: string;      // placeholder label until a real image is added
  body?: string;
  available?: boolean; // green status dot before the title
  timeZone?: string;   // shows a live local clock, e.g. 'Pacific/Auckland'
}

interface XMBInfoPanelProps {
  label: string;   // the opened item's name, shown on the row beside it
  icon?: string;
  info?: XMBInfo;
  // A list of choices instead of info — the selected one sits in the band
  options?: XMBOption[];
  // Or a list of sections — the selected one expands beneath the band
  sections?: XMBSection[];
  optionIndex?: number; // selected choice or section
  optionFlash?: string | null; // brief confirmation shown in place of the selected label
  onOption?: (index: number) => void;
  open: boolean;
  onClose: () => void;
}

const FONT = "'NewRodin', sans-serif";
const EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
// Width + tint live here so the strip never depends on globals.css loading;
// globals.css only overrides them on phones (full width, darker)
const STRIP_WIDTH = 'var(--xmb-strip-width, clamp(300px, 34vw, 480px))';
// A list of colour swatches (Theme) uses a narrow strip on every screen, as on the PSP
const SWATCH_STRIP_WIDTH = 'clamp(72px, 8vw, 110px)';
const ROW_Y = `${ACTIVE_ROW_CENTER_VH}vh`;
const BAND_HALF = '1.5rem';
const BAND_HEIGHT = `calc(${BAND_HALF} * 2)`;
const STATUS_BOTTOM = '10.5rem'; // choices are clipped below the status block

// Live local time for the given zone, e.g. "2:41 pm NZDT"
function LocalTime({ timeZone }: { timeZone: string }) {
  const [time, setTime] = useState('');
  useEffect(() => {
    const format = new Intl.DateTimeFormat('en-NZ', { timeZone, hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
    const tick = () => setTime(format.format(new Date()));
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 15000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [timeZone]);
  return <>{time && `Local time ${time}`}</>;
}

// Modelled on opening a PSP setting: the XMB slides left (handled by the bar and
// sub-items), a ◂ arrow and the item's name appear on its row with an underline
// running to a tinted strip that slides in from the right. The strip's
// highlighted band sits level with the row, content above and below it. For a
// list of choices the band stays put and the list slides through it, like the
// PSP's "Off / On" lists.
export default function XMBInfoPanel({
  label, icon, info, options, sections, optionIndex = 0, optionFlash, onOption, open, onClose,
}: XMBInfoPanelProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const [moreBelow, setMoreBelow] = useState(false);
  const textOnly = !!info && !options && !sections;

  // Longer text scrolls like a PSP text page: up/down (or W/S) and the wheel,
  // with a soft fade at the bottom while there's more to read
  useEffect(() => {
    const el = textRef.current;
    if (!open || !textOnly || !el) return;
    el.scrollTop = 0;
    const update = () => setMoreBelow(el.scrollTop + el.clientHeight < el.scrollHeight - 2);
    const resize = new ResizeObserver(update);
    resize.observe(el);
    el.addEventListener('scroll', update);
    const onKey = (e: KeyboardEvent) => {
      const dir = ['ArrowUp', 'w', 'W'].includes(e.key) ? -1 : ['ArrowDown', 's', 'S'].includes(e.key) ? 1 : 0;
      if (!dir) return;
      e.preventDefault();
      el.scrollBy({ top: dir * el.clientHeight * 0.5, behavior: 'smooth' });
    };
    window.addEventListener('keydown', onKey);
    return () => {
      resize.disconnect();
      el.removeEventListener('scroll', update);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, textOnly, info]);

  if (!info && !options && !sections) return null;
  // Info alone fills the band and below it; with a list, it becomes a status
  // block at the top of the strip and the list takes the band
  const hasList = !!(options || sections);
  const status = hasList ? info : undefined;
  const details = hasList ? undefined : info;
  const swatches = !!options?.length && options.every(o => o.swatch);
  const stripWidth = swatches ? SWATCH_STRIP_WIDTH : STRIP_WIDTH;

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
      <div className={swatches ? undefined : 'xmb-info-row'} style={{
        position: 'absolute',
        top: ROW_Y,
        left: `calc(${EXPANDED_MARGIN_PX}px + ${ICON_SIZE_VH}vh + 0.75rem)`,
        right: stripWidth,
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
      <aside className={swatches ? undefined : 'xmb-info-strip'} style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: stripWidth,
        background: 'rgba(0,0,0,0.14)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: `transform 0.35s ${EASE}`,
        pointerEvents: open ? 'auto' : 'none',
      }}>
        {/* STATUS — availability, location and local time, top of the strip */}
        {status && (
          <div style={{
            position: 'absolute',
            top: '3.25rem',
            left: '1.25rem',
            right: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            paddingBottom: '0.9rem',
            borderBottom: '1px solid rgba(255,255,255,0.18)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '1rem', letterSpacing: '0.03em' }}>
              {status.available && (
                <span aria-hidden style={{
                  width: '0.55rem',
                  height: '0.55rem',
                  borderRadius: '50%',
                  background: '#5dff8a',
                  boxShadow: '0 0 8px #5dff8a',
                }} />
              )}
              {status.title}
            </span>
            {status.subtitle && (
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.7)' }}>
                {status.subtitle}
              </span>
            )}
            {status.timeZone && (
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.7)' }}>
                <LocalTime timeZone={status.timeZone} />
              </span>
            )}
          </div>
        )}

        {/* ABOVE THE BAND — photo */}
        {details?.image && (
          <div style={{
            position: 'absolute',
            left: '1.25rem',
            bottom: `calc(100% - ${ROW_Y} + ${BAND_HALF} + 1rem)`,
          }}>
            <div
              role="img"
              aria-label={`${details.image} (image placeholder)`}
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
          height: BAND_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0 1.25rem',
          background: 'rgba(255,255,255,0.16)',
          borderBottom: '1px solid rgba(255,255,255,0.45)',
          fontSize: '1.05rem',
          letterSpacing: '0.03em',
        }}>
          {details?.available && (
            <span aria-hidden style={{
              width: '0.55rem',
              height: '0.55rem',
              borderRadius: '50%',
              background: '#5dff8a',
              boxShadow: '0 0 8px #5dff8a',
            }} />
          )}
          {details?.title}
        </div>

        {/* CHOICES — the list slides so the selected choice sits in the band; it's
            clipped (with a soft fade) so it never runs into the status block */}
        {options && (
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: status ? STATUS_BOTTOM : 0,
            bottom: '3.5rem',
            overflow: 'hidden',
            WebkitMaskImage: status ? 'linear-gradient(to bottom, transparent, #000 2.5rem)' : undefined,
            maskImage: status ? 'linear-gradient(to bottom, transparent, #000 2.5rem)' : undefined,
          }}>
          <div
            role="listbox"
            aria-label={label}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `calc(${ROW_Y} - ${status ? STATUS_BOTTOM : '0px'} - ${BAND_HALF} - ${optionIndex} * ${BAND_HEIGHT})`,
              transition: 'top 0.2s ease',
            }}
          >
            {options.map((option, i) => {
              const selected = i === optionIndex;
              // Choices fade with distance from the band, as on the PSP
              const distance = Math.abs(i - optionIndex);
              return (
                <button
                  key={option.label}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  aria-label={option.swatch ? option.label : undefined}
                  onClick={() => onOption?.(i)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '0.15rem',
                    width: '100%',
                    height: BAND_HEIGHT,
                    padding: '0 1.25rem',
                    alignItems: option.swatch ? 'center' : undefined,
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    // Swatches stay near full strength so the colours read true
                    opacity: selected ? 1 : option.swatch ? 0.85 : Math.max(0.2, 0.6 - (distance - 1) * 0.12),
                    fontFamily: FONT,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  {option.swatch ? (
                    <span aria-hidden style={{
                      width: '2.1rem',
                      height: '2.1rem',
                      borderRadius: '2px',
                      background: option.swatch,
                      boxShadow: selected
                        ? '0 0 0 1.5px rgba(255,255,255,0.95), 0 0 12px rgba(255,255,255,0.45)'
                        : 'inset 0 0 0 1px rgba(255,255,255,0.35)',
                      transform: selected ? 'scale(1.06)' : 'none',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }} />
                  ) : (
                    <span style={{ fontSize: '1.05rem', lineHeight: 1.2, letterSpacing: '0.03em' }}>
                      {selected && optionFlash ? optionFlash : option.label}
                    </span>
                  )}
                  {selected && option.detail && !optionFlash && (
                    <span style={{ fontSize: '0.68rem', lineHeight: 1.2, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)' }}>
                      {option.detail}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          </div>
        )}

        {/* SECTIONS — names slide through the band; the selected one opens beneath it */}
        {sections && (
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: status ? STATUS_BOTTOM : 0,
            bottom: '3.5rem',
            overflow: 'hidden',
          }}>
            <div
              role="tablist"
              aria-orientation="vertical"
              aria-label={label}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `calc(${ROW_Y} - ${status ? STATUS_BOTTOM : '0px'} - ${BAND_HALF} - ${optionIndex} * ${BAND_HEIGHT})`,
                transition: 'top 0.2s ease',
              }}
            >
              {sections.map((section, i) => {
                const selected = i === optionIndex;
                const distance = Math.abs(i - optionIndex);
                return (
                  <div key={section.label}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => onOption?.(i)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        height: BAND_HEIGHT,
                        padding: '0 1.25rem',
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        opacity: selected ? 1 : Math.max(0.25, 0.6 - (distance - 1) * 0.12),
                        fontFamily: FONT,
                        fontSize: '1.05rem',
                        letterSpacing: '0.03em',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease',
                      }}
                    >
                      {section.label}
                    </button>

                    {selected && (
                      <div
                        role="tabpanel"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.9rem',
                          padding: '0.9rem 1.25rem 1.4rem',
                          animation: 'xmbFadeIn 0.25s ease both',
                        }}
                      >
                        {section.fields && (
                          <dl style={{
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr',
                            columnGap: '1.1rem',
                            rowGap: '0.6rem',
                            alignItems: 'baseline',
                          }}>
                            {section.fields.map(field => (
                              <div key={field.label} style={{ display: 'contents' }}>
                                <dt style={{
                                  fontSize: '0.62rem',
                                  letterSpacing: '0.14em',
                                  textTransform: 'uppercase',
                                  color: 'rgba(255,255,255,0.6)',
                                }}>
                                  {field.label}
                                </dt>
                                <dd style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.95)' }}>{field.value}</dd>
                              </div>
                            ))}
                          </dl>
                        )}
                        {section.tags && (
                          <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', listStyle: 'none' }}>
                            {section.tags.map(tag => (
                              <li key={tag} style={{
                                padding: '0.3rem 0.65rem',
                                border: '1px solid rgba(255,255,255,0.35)',
                                borderRadius: '3px',
                                background: 'rgba(255,255,255,0.06)',
                                fontSize: '0.82rem',
                                letterSpacing: '0.03em',
                              }}>
                                {tag}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BELOW THE BAND — title and paragraph */}
        {details && <div ref={textRef} className="xmb-info-text" style={{
          position: 'absolute',
          left: '1.25rem',
          right: '1.25rem',
          top: `calc(${ROW_Y} + ${BAND_HALF} + 1rem)`,
          bottom: '3.5rem',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          overscrollBehavior: 'contain',
          pointerEvents: open ? 'auto' : 'none', // so the wheel scrolls it
          maskImage: moreBelow ? 'linear-gradient(to bottom, #000 calc(100% - 3rem), transparent)' : undefined,
          WebkitMaskImage: moreBelow ? 'linear-gradient(to bottom, #000 calc(100% - 3rem), transparent)' : undefined,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem',
        }}>
          {details.subtitle && (
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.7)' }}>
              {details.subtitle}
            </span>
          )}
          {details.body && (
            // Blank lines in the body start a new paragraph
            details.body.split('\n\n').map((paragraph, i) => (
              <p key={i} style={{ fontSize: '0.85rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.9)' }}>
                {paragraph}
              </p>
            ))
          )}
          {details.timeZone && (
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.7)' }}>
              <LocalTime timeZone={details.timeZone} />
            </span>
          )}
        </div>}

        {/* BACK */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            bottom: '1rem',
            // The narrow swatch strip stacks the key over its label, centred
            ...(swatches
              ? { left: '50%', transform: 'translateX(-50%)', flexDirection: 'column', gap: '0.3rem' }
              : { left: '1rem', gap: '0.5rem' }),
            display: 'inline-flex',
            alignItems: 'center',
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
