'use client';

import { useEffect, useState } from 'react';
import { ACTIVE_ANCHOR_X, ICON_SIZE_VH, expandedShift } from './layout';

interface Category {
  id: string;
  label: string;
  icon: string;
}

interface XMBCategoryBarProps {
  categories: Category[];
  activeIndex: number;
  // An item is open: slide left and hide the other categories
  expanded?: boolean;
  onSelect?: (index: number) => void;
}

export default function XMBCategoryBar({
  categories,
  activeIndex,
  expanded = false,
  onSelect,
}: XMBCategoryBarProps) {
  const ICON_SPACING_VH = 22;

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

  const barShiftPx = ACTIVE_ANCHOR_X - (activeIndex * spacingPx + iconPx / 2)
    - (expanded ? expandedShift(iconPx) : 0);

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
          const opacity = isActive ? 1 : expanded ? 0 : Math.max(0.25, 1 - absOffset * 0.25);

          return (
            <div
              key={cat.id}
              onClick={() => onSelect?.(idx)}
              style={{
                cursor: 'pointer',
                pointerEvents: 'auto',
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

                {/* ICON */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
              </div>

              {/* REFLECTION */}
              {isActive && (
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