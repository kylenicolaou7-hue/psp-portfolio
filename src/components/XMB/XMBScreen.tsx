'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { XMB_CATEGORIES, type XMBOption } from '@/data/xmb';
import XMBBackground, { type XMBRippleKind, type XMBRippleSignal } from './XMBBackground';
import XMBStatusBar from './XMBStatusBar';
import XMBCategoryBar from './XMBCategoryBar';
import XMBSubItems from './XMBSubItems';
import XMBInfoPanel from './XMBInfoPanel';
import XMBBoot from './XMBBoot';
import { useXMBSound } from '@/hooks/useXMBSound';
import { setSetting, useXMBSettings } from '@/hooks/useXMBSettings';

const LAUNCH_FADE_MS = 600;

// Wheel / trackpad → categories. A step fires once enough scroll has built up;
// after that, further scrolling is ignored until the gesture pauses or a repeat
// interval passes, so one flick doesn't race through every category.
const WHEEL_STEP = 40;        // px of accumulated scroll per step
const WHEEL_GAP_MS = 150;     // pause that ends a gesture
const WHEEL_REPEAT_MS = 350;  // min time between steps within one gesture

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
  // Background feedback: an invisible ripple that bends the waves on each move / open
  const [rippleSignal, setRippleSignal] = useState<XMBRippleSignal>();
  const rippleFrom = useCallback((kind: XMBRippleKind) => {
    setRippleSignal(prev => ({ id: (prev?.id ?? 0) + 1, kind }));
  }, []);
  const [panelOpen, setPanelOpen] = useState(false);
  // Choice list in the side panel (Email, LinkedIn, CV…)
  const [optionIndex, setOptionIndex] = useState(0);
  const [optionFlash, setOptionFlash] = useState<string | null>(null);
  // Boot sequence plays on a fresh visit, not when returning from a case study
  const settings = useXMBSettings();
  const [bootDone, setBootDone] = useState(!!initialProject);
  const finishBoot = useCallback(() => setBootDone(true), []);
  // SETTINGS → Skip Intro goes straight to the menu
  const booted = bootDone || settings.skipIntro;
  const { playClick } = useXMBSound();
  const router = useRouter();

  // Settings items show their current value (On / Off) as the sublabel
  const currentItems = XMB_CATEGORIES[activeCategory].items.map(item =>
    item.setting ? { ...item, sublabel: settings[item.setting] ? 'On' : 'Off' } : item,
  );
  const activeItemData = currentItems[activeItem];
  const activeSlug = activeItemData?.slug;
  const activeInfo = activeItemData?.info;
  const activeOptions = activeItemData?.options;
  const activeSections = activeItemData?.sections;
  // Choices and sections share the same up/down selection in the side panel
  const listLength = (activeOptions ?? activeSections)?.length ?? 0;

  const closePanel = useCallback(() => {
    playClick();
    setPanelOpen(false);
  }, [playClick]);

  const canNavigate = booted && !launching && !panelOpen;

  const moveCategory = useCallback((next: number) => {
    if (next < 0 || next >= XMB_CATEGORIES.length || next === activeCategory) return;
    playClick();
    rippleFrom('category');
    setActiveCategory(next);
    setActiveItem(0);
  }, [activeCategory, playClick, rippleFrom]);

  const moveItem = useCallback((next: number) => {
    if (next < 0 || next >= currentItems.length || next === activeItem) return;
    playClick();
    rippleFrom('item');
    setActiveItem(next);
  }, [activeItem, currentItems.length, playClick, rippleFrom]);

  // Enter / click on the selected item: launch its case study or open its info panel
  const openActive = useCallback(() => {
    if (!activeSlug && !activeInfo && !activeOptions && !activeSections) return;
    playClick();
    rippleFrom('open');
    if (activeSlug) {
      setLaunching(true);
    } else {
      // A setting opens with its current value in the band
      const current = activeItemData?.setting
        ? activeOptions?.findIndex(o => o.action.type === 'setting' && o.action.value === settings[activeItemData.setting!])
        : 0;
      setOptionIndex(Math.max(0, current ?? 0));
      setOptionFlash(null);
      setPanelOpen(true);
    }
  }, [activeSlug, activeInfo, activeOptions, activeSections, activeItemData, settings, playClick, rippleFrom]);

  const moveOption = useCallback((next: number) => {
    if (next < 0 || next >= listLength || next === optionIndex) return;
    playClick();
    rippleFrom('item');
    setOptionFlash(null);
    setOptionIndex(next);
  }, [listLength, optionIndex, playClick, rippleFrom]);

  // Run a choice: copy to the clipboard (with a confirmation in the band) or follow a link
  const runOption = useCallback((option: XMBOption) => {
    const { action } = option;
    if (action.type === 'setting') {
      // Apply first, so turning Sound on is confirmed with a tink (and off is silent),
      // then return to the menu like confirming a PSP setting
      setSetting(action.key, action.value);
      playClick();
      setPanelOpen(false);
      return;
    }
    playClick();
    rippleFrom('open');
    if (action.type === 'copy') {
      navigator.clipboard.writeText(action.value)
        .then(() => setOptionFlash(action.done))
        .catch(() => setOptionFlash('Copy failed'));
    } else if (action.download) {
      const a = document.createElement('a');
      a.href = action.href;
      a.download = '';
      a.click();
    } else if (action.newTab) {
      window.open(action.href, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = action.href; // mailto: hands over to the mail app
    }
  }, [playClick, rippleFrom]);

  // Clicking a choice or section selects it; clicking the selected choice runs it
  const clickOption = useCallback((index: number) => {
    if (index !== optionIndex) moveOption(index);
    else if (activeOptions) runOption(activeOptions[index]);
  }, [activeOptions, optionIndex, runOption, moveOption]);

  // Confirmation messages fade back to the choice's label
  useEffect(() => {
    if (!optionFlash) return;
    const timer = setTimeout(() => setOptionFlash(null), 1600);
    return () => clearTimeout(timer);
  }, [optionFlash]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!booted || launching) return;

    // While the side panel is open: Escape closes it; a choice list also takes
    // up/down to move and Enter to run the selected choice
    if (panelOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePanel();
      } else if (listLength) {
        if (['ArrowUp', 'w', 'W'].includes(e.key)) {
          e.preventDefault();
          moveOption(optionIndex - 1);
        } else if (['ArrowDown', 's', 'S'].includes(e.key)) {
          e.preventDefault();
          moveOption(optionIndex + 1);
        } else if (e.key === 'Enter' && activeOptions) {
          e.preventDefault();
          runOption(activeOptions[optionIndex]);
        }
      }
      return;
    }

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
        openActive();
        break;
    }
  }, [booted, launching, panelOpen, closePanel, activeOptions, listLength, optionIndex, moveOption, runOption, activeCategory, activeItem, moveCategory, moveItem, openActive]);

  // Mouse: clicking a category selects it; clicking an item selects it, and
  // clicking the already-selected item opens it (like pressing Enter)
  const clickCategory = useCallback((index: number) => {
    if (canNavigate) moveCategory(index);
  }, [canNavigate, moveCategory]);

  const clickItem = useCallback((index: number) => {
    if (!canNavigate) return;
    if (index === activeItem) openActive();
    else moveItem(index);
  }, [canNavigate, activeItem, openActive, moveItem]);

  // Wheel / trackpad scrolling moves along the categories
  const wheelRef = useRef({ acc: 0, lastEvent: 0, stepAt: 0 });
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      // Stop a sideways two-finger swipe from triggering browser back/forward
      if (horizontal) e.preventDefault();
      if (!canNavigate) return;

      const w = wheelRef.current;
      const now = performance.now();
      const gap = now - w.lastEvent;
      w.lastEvent = now;
      if (gap >= WHEEL_GAP_MS) w.acc = 0;
      if (now - w.stepAt < WHEEL_REPEAT_MS && gap < WHEEL_GAP_MS) return;

      const scale = e.deltaMode === 1 ? 16 : 1; // line-based wheels (Firefox)
      w.acc += (horizontal ? e.deltaX : e.deltaY) * scale;
      if (Math.abs(w.acc) >= WHEEL_STEP) {
        moveCategory(activeCategory + Math.sign(w.acc));
        w.acc = 0;
        w.stepAt = now;
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [canNavigate, activeCategory, moveCategory]);

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
      <XMBBackground
        backgroundImage={activeItemData?.preview?.background}
        ripple={rippleSignal}
      />

      {/* STATUS BAR */}
      <XMBStatusBar />

      {/* MENU — fades in once the boot sequence hands over */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        pointerEvents: 'none',
        opacity: booted ? 1 : 0,
        transition: 'opacity 0.35s ease',
      }}>
        {/* CATEGORY ICONS */}
        <XMBCategoryBar
          categories={XMB_CATEGORIES}
          activeIndex={activeCategory}
          expanded={panelOpen}
          onSelect={clickCategory}
        />

        {/* SUB ITEMS */}
        <XMBSubItems
          items={currentItems}
          activeItem={activeItem}
          expanded={panelOpen}
          onSelect={clickItem}
        />
      </div>

      {/* INFO PANEL */}
      <XMBInfoPanel
        label={activeItemData?.label ?? ''}
        icon={activeItemData?.icon}
        info={activeInfo}
        options={activeOptions}
        sections={activeSections}
        optionIndex={optionIndex}
        optionFlash={optionFlash}
        onOption={clickOption}
        open={panelOpen}
        onClose={closePanel}
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
        zIndex: 16,
        pointerEvents: 'none', // never clickable — don't block the info page's Back button
        opacity: booted && !panelOpen ? 1 : 0,
        transition: 'opacity 0.35s ease',
      }}>
        ◀ ▶ &nbsp; NAVIGATE &nbsp;&nbsp; ▲ ▼ &nbsp; SELECT
        {(activeSlug || activeInfo || activeOptions || activeSections) && <> &nbsp;&nbsp; ENTER &nbsp; OPEN</>}
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