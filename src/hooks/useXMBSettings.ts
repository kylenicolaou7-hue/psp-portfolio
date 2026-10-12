import { useSyncExternalStore } from 'react';

// Visitor preferences from the SETTINGS category, remembered in this browser.
// Shared at module level so non-React code (sounds, background) can read them.

export type XMBSettingKey = 'sound' | 'effects' | 'skipIntro';
export type XMBSettings = Record<XMBSettingKey, boolean>;

const DEFAULTS: XMBSettings = { sound: true, effects: true, skipIntro: false };
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
  } catch {
    // Storage blocked (private mode etc.) — defaults still work for this visit
  }
}

export function getSettings(): XMBSettings {
  load();
  return current;
}

export function setSetting(key: XMBSettingKey, value: boolean) {
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
