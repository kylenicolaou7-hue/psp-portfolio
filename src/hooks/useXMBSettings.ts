import { useSyncExternalStore } from 'react';
import { DEFAULT_THEME, XMB_THEMES, type XMBThemeId } from '@/data/themes';

// Visitor preferences from the SETTINGS category, remembered in this browser.
// Shared at module level so non-React code (sounds, background) can read them.

// On / Off settings
export type XMBSettingKey = 'sound' | 'effects' | 'skipIntro';
export type XMBSettings = Record<XMBSettingKey, boolean> & { theme: XMBThemeId };

const DEFAULTS: XMBSettings = { sound: true, effects: true, skipIntro: false, theme: DEFAULT_THEME };
const STORAGE_KEY = 'xmb-settings';

let current: XMBSettings = DEFAULTS;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) current = { ...DEFAULTS, ...JSON.parse(saved) };
    // A theme that no longer exists falls back to the default
    if (!XMB_THEMES.some(t => t.id === current.theme)) current = { ...current, theme: DEFAULT_THEME };
  } catch {
    // Storage blocked (private mode etc.) — defaults still work for this visit
  }
}

export function getSettings(): XMBSettings {
  load();
  return current;
}

export function setSetting<K extends keyof XMBSettings>(key: K, value: XMBSettings[K]) {
  load();
  current = { ...current, [key]: value };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Not persisted, but still applies for this visit
  }
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Server render (and hydration) uses the defaults; saved values apply right after
export function useXMBSettings(): XMBSettings {
  return useSyncExternalStore(subscribe, getSettings, () => DEFAULTS);
}
