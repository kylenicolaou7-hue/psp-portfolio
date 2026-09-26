'use client';

import { useEffect, useState } from 'react';

interface Category {
  id: string;
  label: string;
  icon: string;
}

interface XMBCategoryBarProps {
  categories: Category[];
  activeIndex: number;
  isRippleActive: boolean;
}

export default function XMBCategoryBar({
  categories,
  activeIndex,
  isRippleActive,
}: XMBCategoryBarProps) {
  const ICON_SIZE_VH = 14;   // vh units — scales with height
  const ICON_SPACING_VH = 22;
  const ACTIVE_ANCHOR_X = 250;
  const barShift = ACTIVE_ANCHOR_X - (activeIndex * (ICON_SPACING_VH * 16) + (ICON_SIZE_VH * 16) / 2);

  const [showPreview, setShowPreview] = useState(false);
  const [iconPx, setIconPx] = useState(144);
  const [spacingPx, setSpacingPx] = useState(220);

  // Convert vh to px on mount and resize
  useEffect(() => {
    const update = () => {
      const vh = window.innerHeight / 100;
      setIconPx(Math.round(ICON_SIZE_VH * vh));
      setSpacingPx(Math.round(ICON_SPACING_VH * vh));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const barShiftPx = ACTIVE_ANCHOR_X - (activeIndex * spacingPx + iconPx / 2);

  useEffect(() => {
    if (isRippleActive) {
      const timer = setTimeout(() => setShowPreview(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowPreview(false);
    }
  }, [isRippleActive]);

  return (
    <>
      {/* HORIZONTAL RULE */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: 0,
        right: 0,
        height: '1px',
        background: 'rgba(255,255,255,0.12)',
        zIndex: 3,
      }} />

      {/* ICON ROW */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: 0,
        transform: `translateX(${barShiftPx}px) translateY(-50%)`,
        transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: `${spacingPx - iconPx}px`,
        willChange: 'transform',
      }}>
        {categories.map((cat, idx) => {
          const offset = idx - activeIndex;
          const absOffset = Math.abs(offset);
          const isActive = offset === 0;
          const opacity = isActive ? 1 : Math.max(0.25, 1 - absOffset * 0.25);
          const showVideoPreview = isActive && isRippleActive && cat.id === 'works';

          return (
            <div
              key={cat.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.6rem',
                opacity,
                transition: 'opacity 0.25s ease',
                position: 'relative',
                flexShrink: 0,
                width: `${iconPx}px`,
              }}
            >
              {/* GLOW */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: `${iconPx * 2}px`,
                  height: `${iconPx * 2}px`,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
                  pointerEvents: 'none',
                  zIndex: -1,
                }} />
              )}

              {/* ICON SLOT */}
              <div style={{
                width: `${iconPx}px`,
                height: `${iconPx}px`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>

                {/* DISC ICON — fades out when preview shows */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: showVideoPreview && showPreview ? 0 : 1,
                  transition: 'opacity 0.5s ease',
                  pointerEvents: 'none',
                  filter: isActive
                    ? 'drop-shadow(0 0 20px rgba(255,255,255,0.7)) brightness(1.1)'
                    : 'brightness(1)',
                }}>
                  <img
                    src={cat.icon}
                    alt={cat.label}
                    style={{
                      width: `${iconPx}px`,
                      height: `${iconPx}px`,
                      objectFit: 'contain',
                    }}
                  />
                </div>

                {/* VIDEO PREVIEW — fades in over disc */}
                {isRippleActive && cat.id === 'works' && isActive && (
                  <div style={{
                    position: 'absolute',
                    width: `${iconPx * 1.25}px`,
                    height: `${iconPx * 0.78}px`,
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.35)',
                    boxShadow: '0 0 20px rgba(255,255,255,0.15)',
                    opacity: showPreview ? 1 : 0,
                    transition: 'opacity 0.5s ease',
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

              {/* REFLECTION */}
              {isActive && !showVideoPreview && (
                <div style={{
                  position: 'absolute',
                  top: `${iconPx}px`,
                  left: 0,
                  pointerEvents: 'none',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.15), transparent)',
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.15), transparent)',
                }}>
                  <img
                    src={cat.icon}
                    alt=""
                    style={{
                      width: `${iconPx}px`,
                      height: `${iconPx}px`,
                      objectFit: 'contain',
                      transform: 'scaleY(-1)',
                      opacity: 0.15,
                    }}
                  />
                </div>
              )}

              {/* LABEL */}
              <span style={{
                fontFamily: "'NewRodin', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 400,
                letterSpacing: '0.2em',
                color: isActive ? 'rgba(255,255,255,0.9)' : 'transparent',
                transition: 'color 0.25s ease',
                whiteSpace: 'nowrap',
                marginTop: '-1rem',
              }}>
                {cat.label}
              </span>

            </div>
          );
        })}
      </div>
    </>
  );
}