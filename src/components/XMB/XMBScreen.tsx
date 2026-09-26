'use client';

import { useEffect, useState, useCallback } from 'react';
import { XMB_CATEGORIES } from '@/data/xmb';
import XMBBackground from './XMBBackground';
import XMBStatusBar from './XMBStatusBar';
import XMBCategoryBar from './XMBCategoryBar';
import XMBSubItems from './XMBSubItems';
import { useXMBSound } from '@/hooks/useXMBSound';

export default function XMBScreen() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeItem, setActiveItem] = useState(0);
  const { playClick } = useXMBSound();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        setActiveCategory(prev => {
          if (prev === 0) return prev;
          playClick();
          return prev - 1;
        });
        setActiveItem(0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        setActiveCategory(prev => {
          if (prev === XMB_CATEGORIES.length - 1) return prev;
          playClick();
          return prev + 1;
        });
        setActiveItem(0);
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        setActiveItem(prev => {
          if (prev === 0) return prev;
          playClick();
          return prev - 1;
        });
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        setActiveItem(prev => {
          const max = XMB_CATEGORIES[activeCategory].items.length - 1;
          if (max < 0 || prev >= max) return prev;
          playClick();
          return prev + 1;
        });
        break;
      case 'Enter':
        e.preventDefault();
        break;
    }
  }, [activeCategory, playClick]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const currentItems = XMB_CATEGORIES[activeCategory].items;
  const activeItemData = currentItems[activeItem];

  // Check if Ripple is currently the active sub item
  const isRippleActive =
    XMB_CATEGORIES[activeCategory].id === 'works' &&
    activeItemData?.label === 'Ripple';

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#050520',
    }}>

      {/* ANIMATED BACKGROUND */}
      <XMBBackground isRippleActive={isRippleActive} />

      {/* STATUS BAR */}
      <XMBStatusBar />

      {/* CATEGORY ICONS */}
      <XMBCategoryBar
        categories={XMB_CATEGORIES}
        activeIndex={activeCategory}
      />

      {/* SUB ITEMS */}
      <XMBSubItems
        items={currentItems}
        activeItem={activeItem}
        categoryIndex={activeCategory}
        totalCategories={XMB_CATEGORIES.length}
        isRippleActive={isRippleActive}
      />

      {/* BOTTOM NAV HINT */}
      <div style={{
        position: 'absolute',
        bottom: '1.2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: "'NewRodin', sans-serif",
        fontSize: '0.48rem',
        fontWeight: 300,
        letterSpacing: '0.18em',
        color: 'rgba(255,255,255,0.2)',
        whiteSpace: 'nowrap',
        zIndex: 10,
      }}>
        ◀ ▶ &nbsp; NAVIGATE &nbsp;&nbsp; ▲ ▼ &nbsp; SELECT
      </div>

{/* LCD PIXEL GRID OVERLAY */}
<div style={{
  position: 'absolute',
  inset: 0,
  zIndex: 20,
  pointerEvents: 'none',
  backgroundImage: `
    repeating-linear-gradient(
      0deg,
      rgba(0,0,0,0.12) 0px,
      rgba(0,0,0,0.12) 1px,
      transparent 1px,
      transparent 3px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(0,0,0,0.06) 0px,
      rgba(0,0,0,0.06) 1px,
      transparent 1px,
      transparent 3px
    )
  `,
  backgroundSize: '3px 3px',
}} />

    </div>
  );
}