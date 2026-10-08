'use client';

import { useEffect, useState } from 'react';
import type { XMBItem } from '@/data/xmb';
import { ACTIVE_ANCHOR_X, ICON_SIZE_VH, ITEM_GAP_VH, ROW_TOP_VH, expandedShift } from './layout';

interface XMBSubItemsProps {
  items: XMBItem[];
  activeItem: number;
  // An item is open: slide left with the category bar and hide the labels
  expanded?: boolean;
  onSelect?: (index: number) => void;
}

// Preview box proportions — PSP ICON1 was 310×180
const PREVIEW_WIDTH = 1.6;
const PREVIEW_HEIGHT = 0.93;

export default function XMBSubItems({
  items,
  activeItem,
  expanded = false,
  onSelect,
}: XMBSubItemsProps) {
  // All vh based — scales with screen height
  const ITEM_STEP_VH = 18;

  const [iconPx, setIconPx] = useState(144);
  const [itemStepPx, setItemStepPx] = useState(180);
  const [activePx, setActivePx] = useState(405);

  useEffect(() => {
    const update = () => {
      const vh = window.innerHeight / 100;
      setIconPx(Math.round(ICON_SIZE_VH * vh));
      setItemStepPx(Math.round(ITEM_STEP_VH * vh));
      setActivePx(Math.round((ROW_TOP_VH / 100) * window.innerHeight + ITEM_GAP_VH * vh));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const containerLeft = ACTIVE_ANCHOR_X - iconPx / 2;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: `${containerLeft}px`,
      transform: expanded ? `translateX(${-expandedShift(iconPx)}px)` : undefined,
      transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      width: '600px',
      height: '100vh',
      zIndex: 5,
      overflow: 'visible',
      pointerEvents: 'none',
    }}>
      {items.map((item, idx) => {
        const offset = idx - activeItem;
        const absOffset = Math.abs(offset);
        const isActive = offset === 0;
        const showPreview = isActive && !!item.preview;

        const opacity = isActive
          ? 1
          : offset < 0
            ? Math.max(0, 1 - absOffset * 0.55)
            : Math.max(0, 1 - absOffset * 0.4);

        const scale = isActive ? 1 : 0.88;
        const baseTop = activePx + idx * itemStepPx;
        const translateY = -activeItem * itemStepPx;

        return (
          <div
            key={idx}
            onClick={() => onSelect?.(idx)}
            style={{
              cursor: 'pointer',
              position: 'absolute',
              top: `${baseTop}px`,
              left: 0,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '1rem',
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
              transformOrigin: 'left top',
              transition: 'transform 0.25s ease, opacity 0.25s ease',
              width: '600px',
              // Clickable unless faded out completely
              pointerEvents: opacity > 0 ? 'auto' : 'none',
            }}
          >
            {/* ICON SLOT */}
            <div style={{
              width: `${iconPx}px`,
              height: `${iconPx}px`,
              flexShrink: 0,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>

              {/* ICON — gives way to the preview after 500ms */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: showPreview ? 0 : 1,
                transition: showPreview ? 'opacity 0.5s ease 0.5s' : 'opacity 0.25s ease',
                filter: isActive
                  ? 'brightness(1.1) drop-shadow(0 0 16px rgba(255,255,255,0.6))'
                  : 'brightness(0.4)',
              }}>
                <img
                  src={item.icon || '/icons/disc.png'}
                  alt=""
                  style={{
                    width: `${iconPx}px`,
                    height: `${iconPx}px`,
                    objectFit: 'contain',
                  }}
                />
              </div>

              {/* PREVIEW VIDEO — plays in the icon slot, like a PSP game's ICON1 */}
              {showPreview && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  width: `${Math.round(iconPx * PREVIEW_WIDTH)}px`,
                  height: `${Math.round(iconPx * PREVIEW_HEIGHT)}px`,
                  transform: 'translateY(-50%)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 0 16px rgba(255,255,255,0.15)',
                  animation: 'xmbFadeIn 0.5s ease 0.5s both',
                }}>
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center 40%',
                    }}
                  >
                    {item.preview!.video.map((src) => (
                      <source key={src} src={src} type={src.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
                    ))}
                  </video>
                </div>
              )}

            </div>

            {/* TEXT — hidden while an item is open; its name moves to the panel row */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '0.2rem',
              opacity: expanded ? 0 : 1,
              transition: 'opacity 0.2s ease',
            }}>
              {isActive && item.group && (
                <span style={{
                  fontFamily: "'NewRodin', sans-serif",
                  fontSize: '0.75vh',
                  fontWeight: 300,
                  letterSpacing: '0.2em',
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  {item.group}
                </span>
              )}

              <div style={{ position: 'relative', display: 'inline-block' }}>
                <span style={{
                  fontFamily: "'NewRodin', sans-serif",
                  fontSize: isActive ? '1.8vh' : '1.4vh',
                  fontWeight: 400,
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.25s ease',
                  display: 'block',
                }}>
                  {item.label}
                </span>

                {isActive && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-3px',
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'rgba(255,255,255,0.7)',
                  }} />
                )}
              </div>

              {isActive && item.sublabel && (
                <span style={{
                  fontFamily: "'NewRodin', sans-serif",
                  fontSize: '1vh',
                  fontWeight: 300,
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}>
                  {item.sublabel}
                </span>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}