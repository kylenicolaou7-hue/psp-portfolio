// Background colour themes, after the PSP's original wave colours. Each one
// sets the gradient behind the waves, the five wave layers (back to front) and
// the soft glow in the centre. Colours are RGB so the background can blend
// smoothly from one theme to the next.

export type RGB = readonly [number, number, number];

export interface XMBTheme {
  id: string;
  label: string;
  gradient: readonly [RGB, RGB, RGB, RGB]; // top → bottom
  waves: readonly [RGB, RGB, RGB, RGB, RGB];
  glow: readonly [RGB, RGB];               // centre → edge
}

export const XMB_THEMES = [
  {
    id: 'orange',
    label: 'Orange',
    gradient: [[230, 92, 0], [217, 54, 0], [204, 0, 0], [138, 0, 0]],
    waves: [[255, 120, 30], [230, 90, 20], [210, 60, 10], [200, 40, 0], [180, 20, 0]],
    glow: [[255, 120, 30], [210, 60, 0]],
  },
  {
    id: 'blue',
    label: 'Blue',
    gradient: [[40, 120, 220], [20, 85, 190], [10, 50, 150], [5, 25, 90]],
    waves: [[120, 190, 255], [90, 160, 240], [60, 130, 220], [40, 100, 200], [20, 70, 170]],
    glow: [[140, 200, 255], [40, 110, 220]],
  },
  {
    id: 'pink',
    label: 'Pink',
    gradient: [[235, 110, 170], [215, 70, 140], [180, 40, 110], [110, 15, 65]],
    waves: [[255, 170, 210], [240, 130, 185], [220, 95, 160], [200, 70, 140], [170, 40, 110]],
    glow: [[255, 170, 210], [220, 80, 150]],
  },
  {
    id: 'green',
    label: 'Green',
    gradient: [[120, 190, 40], [70, 160, 30], [35, 120, 20], [15, 70, 10]],
    waves: [[190, 240, 110], [150, 215, 80], [110, 185, 55], [80, 155, 40], [50, 120, 25]],
    glow: [[200, 255, 120], [90, 170, 30]],
  },
  {
    id: 'purple',
    label: 'Purple',
    gradient: [[150, 80, 210], [115, 50, 180], [80, 25, 140], [40, 10, 80]],
    waves: [[205, 160, 255], [175, 125, 240], [145, 90, 215], [120, 65, 190], [90, 40, 160]],
    glow: [[210, 170, 255], [120, 60, 200]],
  },
] as const satisfies readonly XMBTheme[];

export type XMBThemeId = (typeof XMB_THEMES)[number]['id'];
export const DEFAULT_THEME: XMBThemeId = 'orange';

export function getTheme(id: string): XMBTheme {
  return XMB_THEMES.find(t => t.id === id) ?? XMB_THEMES[0];
}
