'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { XMB_CATEGORIES } from '@/data/xmb';
import XMBBackground from './XMBBackground';
import XMBStatusBar from './XMBStatusBar';
import XMBCategoryBar from './XMBCategoryBar';
import XMBSubItems from './XMBSubItems';
import XMBInfoPanel from './XMBInfoPanel';
import XMBBoot from './XMBBoot';
import { useXMBSound } from '@/hooks/useXMBSound';

const LAUNCH_FADE_MS = 600;

// Locate a project in the menu so returning from a case study lands back on it
function findProject(slug?: string) {
  if (slug) {
    for (let c = 0; c < XMB_CATEGORIES.length; c++) {
      const i = XMB_CATEGORIES[c].items.findIndex(item => item.slug === slug);
      if (i >= 0) return { category: c, item: i };
    }
  }
  return { category: 0, item: 0 };
}

interface XMBScreenProps {
  // Slug of the project the user just backed out of
  initialProject?: string;
}

export default function XMBScreen({ initialProject }: XMBScreenProps) {
  const [activeCategory, setActiveCategory] = useState(() => findProject(initialProject).category);
  const [activeItem, setActiveItem] = useState(() => findProject(initialProject).item);
  const [launching, setLaunching] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  // Boot sequence plays on a fresh visit, not when returning from a case study
  const [booted, setBooted] = useState(!!initialProject);
  const finishBoot = useCallback(() => setBooted(true), []);
  const { playClick } = useXMBSound();
  const router = useRouter();

  const currentItems = XMB_CATEGORIES[activeCategory].items;
  const activeItemData = currentItems[activeItem];
  const activeSlug = activeItemData?.slug;
  const activeInfo = activeItemData?.info;

  const closeInfo = useCallback(() => {
    playClick();
    setInfoOpen(false);
  }, [playClick]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!booted || launching) return;

    // While the info panel is open, only Escape (close) is handled
    if (infoOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeInfo();
      }
      return;
    }

    const moveCategory = (next: number) => {
      if (next < 0 || next >= XMB_CATEGORIES.length) return;
      playClick();
      setActiveCategory(next);
      setActiveItem(0);
    };
    const moveItem = (next: number) => {
      if (next < 0 || next >= currentItems.length) return;
      playClick();
      setActiveItem(next);
    };

    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        moveCategory(activeCategory - 1);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        moveCategory(activeCategory + 1);
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        moveItem(activeItem - 1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        moveItem(activeItem + 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSlug) {
          playClick();
          setLaunching(true);
        } else if (activeInfo) {
          playClick();
          setInfoOpen(true);
        }
        break;
    }
  }, [booted, launching, infoOpen, closeInfo, activeCategory, activeItem, currentItems.length, activeSlug, activeInfo, playClick]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Drop ?project= once restored, so a reload boots fresh instead of skipping the intro
  useEffect(() => {
    if (initialProject) window.history.replaceState(null, '', '/');
  }, [initialProject]);

  // Warm the case study route while its item is highlighted
  useEffect(() => {
    if (activeSlug) router.prefetch(`/projects/${activeSlug}`);
  }, [activeSlug, router]);

  // Fade to black, then boot into the case study
  useEffect(() => {
    if (!launching || !activeSlug) return;
    const timer = setTimeout(() => router.push(`/projects/${activeSlug}`), LAUNCH_FADE_MS);
    return () => clearTimeout(timer);
  }, [launching, activeSlug, router]);

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#050520',
    }}>

      {/* ANIMATED BACKGROUND */}
      <XMBBackground backgroundImage={activeItemData?.preview?.background} />

      {/* STATUS BAR */}
      <XMBStatusBar />

      {/* MENU — fades in once the boot sequence hands over */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        pointerEvents: 'none',
        opacity: booted ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}>
        {/* CATEGORY ICONS */}
        <XMBCategoryBar
          categories={XMB_CATEGORIES}
          activeIndex={activeCategory}
        />

        {/* SUB ITEMS */}
        <XMBSubItems
          items={currentItems}
          activeItem={activeItem}
        />
      </div>

      {/* INFO PANEL */}
      <XMBInfoPanel info={activeInfo} open={infoOpen} onClose={closeInfo} />

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
        zIndex: 16,
        opacity: booted ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}>
        {infoOpen ? (
          <>ESC &nbsp; BACK</>
        ) : (
          <>
            ◀ ▶ &nbsp; NAVIGATE &nbsp;&nbsp; ▲ ▼ &nbsp; SELECT
            {(activeSlug || activeInfo) && <> &nbsp;&nbsp; ENTER &nbsp; OPEN</>}
          </>
        )}
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

      {/* BOOT SEQUENCE */}
      {!booted && <XMBBoot onDone={finishBoot} />}

      {/* RETURN FADE — fades in from black when coming back from a case study */}
      {initialProject && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 30,
          background: '#000',
          pointerEvents: 'none',
          animation: `xmbFadeOut ${LAUNCH_FADE_MS}ms ease both`,
        }} />
      )}

      {/* LAUNCH FADE — fades to black when a project is opened */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 31,
        background: '#000',
        pointerEvents: 'none',
        opacity: launching ? 1 : 0,
        transition: `opacity ${LAUNCH_FADE_MS}ms ease`,
      }} />

    </div>
  );
}