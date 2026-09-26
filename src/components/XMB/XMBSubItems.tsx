'use client';

import { useEffect, useState } from 'react';

interface SubItem {
  label: string;
  sublabel?: string;
  link?: string;
  group?: string;
  icon?: string;
}

interface XMBSubItemsProps {
  items: SubItem[];
  activeItem: number;
  categoryIndex: number;
  totalCategories: number;
  isRippleActive: boolean;
}

export default function XMBSubItems({
  items,
  activeItem,
  categoryIndex,
  totalCategories,
  isRippleActive,
}: XMBSubItemsProps) {
  // All vh based — scales with screen height
  const ICON_SIZE_VH = 14;
  const ITEM_STEP_VH = 18;
  const ACTIVE_ANCHOR_X = 250;
  const ICON_BOTTOM_VH = 40;  // % from top — matches category bar
  const GAP_VH = 10;

  const [iconPx, setIconPx] = useState(144);
  const [itemStepPx, setItemStepPx] = useState(180);
  const [activePx, setActivePx] = useState(405);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const update = () => {
      const vh = window.innerHeight / 100;
      setIconPx(Math.round(ICON_SIZE_VH * vh));
      setItemStepPx(Math.round(ITEM_STEP_VH * vh));
      setActivePx(Math.round((ICON_BOTTOM_VH / 100) * window.innerHeight + GAP_VH * vh));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const containerLeft = ACTIVE_ANCHOR_X - iconPx / 2;

  useEffect(() => {
    if (isRippleActive) {
      const timer = setTimeout(() => setShowPreview(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowPreview(false);
    }
  }, [isRippleActive]);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: `${containerLeft}px`,
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
            style={{
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
              pointerEvents: isActive ? 'all' : 'none',
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

              {/* DISC ICON */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isActive && showPreview && isRippleActive ? 0 : 1,
                transition: 'opacity 0.5s ease',
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

              {/* VIDEO — only mounts after 500ms */}
              {showPreview && isRippleActive && isActive && (
                <div style={{
                  position: 'absolute',
                  left: `-${containerLeft}px`,
                  width: `${containerLeft + iconPx}px`,
                  height: `${iconPx}px`,
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 0 16px rgba(255,255,255,0.15)',
                  animation: 'previewFadeIn 0.5s ease forwards',
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
                    <source src="/videos/webmripple.webm" type="video/webm" />
                    <source src="/videos/finaloutcome.mp4" type="video/mp4" />
                  </video>
                </div>
              )}

            </div>

            {/* TEXT */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '0.2rem',
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

      <style>{`
        @keyframes previewFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}