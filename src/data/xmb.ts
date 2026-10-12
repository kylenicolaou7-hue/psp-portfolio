import type { XMBInfo } from '@/components/XMB/XMBInfoPanel';
import type { XMBSettingKey } from '@/hooks/useXMBSettings';
import { XMB_THEMES, type XMBThemeId } from './themes';

export interface XMBItem {
  label: string;
  sublabel?: string;
  group?: string;
  icon?: string;
  link?: string;
  // Enter opens /projects/[slug]
  slug?: string;
  // Enter opens the side information panel
  info?: XMBInfo;
  // Enter opens the side panel as a PSP-style list of choices (with `info`
  // too, the info shows as a status block above the list)
  options?: XMBOption[];
  // Enter opens the side panel as a list of sections; the selected one expands
  // beneath the band to show its details
  sections?: XMBSection[];
  preview?: { video: string[]; background: string };
  // A SETTINGS item: its sublabel shows the current value (On / Off)
  setting?: XMBSettingKey;
}

// What a choice in the side panel does
export type XMBAction =
  | { type: 'copy'; value: string; done: string }               // copy to clipboard, then confirm
  | { type: 'link'; href: string; newTab?: boolean; download?: boolean }
  | { type: 'setting'; key: XMBSettingKey; value: boolean }            // change a SETTINGS value
  | { type: 'theme'; value: XMBThemeId };                              // change the background colour

export interface XMBOption {
  label: string;
  detail?: string; // second line shown while the choice is selected
  swatch?: string; // CSS background — shows the choice as a colour swatch instead of text
  action: XMBAction;
}

export interface XMBSection {
  label: string;
  fields?: { label: string; value: string }[]; // label / value rows, like PSP System Information
  tags?: string[];                             // short items shown as tags
}

export interface XMBCategory {
  id: string;
  label: string;
  icon: string;
  items: XMBItem[];
}

export const XMB_CATEGORIES: XMBCategory[] = [
  {
    id: 'theme',
    label: 'THEME',
    icon: '/icons/theme.png',
    // As on the PSP: one Theme item opening a narrow strip of colour swatches.
    // The background previews each colour as it passes through the band.
    items: [
      {
        label: 'Theme',
        group: 'THEME',
        icon: '/icons/display.png',
        options: XMB_THEMES.map(theme => ({
          label: theme.label,
          swatch: `linear-gradient(to bottom, ${theme.gradient.map(c => `rgb(${c.join(',')})`).join(', ')})`,
          action: { type: 'theme', value: theme.id },
        })),
      },
    ],
  },

  {
    id: 'settings',
    label: 'SETTINGS',
    icon: '/icons/settings.png',
    // Off / On lists, as on the PSP's settings screens
    items: [
      {
        label: 'Sound',
        group: 'SETTINGS',
        icon: '/icons/tools.png',
        setting: 'sound',
        options: [
          { label: 'Off', detail: 'Navigate in silence', action: { type: 'setting', key: 'sound', value: false } },
          { label: 'On', detail: 'A soft tink as you move', action: { type: 'setting', key: 'sound', value: true } },
        ],
      },
      {
        label: 'Background Effects',
        group: 'SETTINGS',
        icon: '/icons/tools.png',
        setting: 'effects',
        options: [
          { label: 'Off', detail: 'A calm, still background', action: { type: 'setting', key: 'effects', value: false } },
          { label: 'On', detail: 'Ripples move through the waves', action: { type: 'setting', key: 'effects', value: true } },
        ],
      },
      {
        label: 'Skip Intro',
        group: 'SETTINGS',
        icon: '/icons/tools.png',
        setting: 'skipIntro',
        options: [
          { label: 'Off', detail: 'Play the start-up animation', action: { type: 'setting', key: 'skipIntro', value: false } },
          { label: 'On', detail: 'Go straight to the menu next time', action: { type: 'setting', key: 'skipIntro', value: true } },
        ],
      },
    ],
  },

  {
    id: 'system',
    label: 'SYSTEM',
    icon: '/icons/camera.png',
    items: [
      {
        label: 'Education & Skills',
        sublabel: 'Media Design School · Technical · Platforms',
        group: 'INFO',
        icon: '/icons/memory.png',
        sections: [
          {
            label: 'Education',
            fields: [
              { label: 'Institution', value: 'Media Design School' },
              { label: 'Qualification', value: 'Bachelor of Media Design' },
              { label: 'Major', value: 'Interactive UX/UI' },
              { label: 'Location', value: 'Auckland, New Zealand' },
            ],
          },
          { label: 'Technical', tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'Three.js', 'AI Tools'] },
          { label: 'Platforms', tags: ['Figma', 'TouchDesigner', 'Illustrator', 'Photoshop', 'Blender', 'Wix'] },
        ],
      },
    ],
  },
  {
    id: 'about',
    label: 'ABOUT',
    icon: '/icons/house.png',
    items: [
      {
        label: 'About Me',
        sublabel: 'UX/UI · Interactive Designer',
        group: 'ABOUT',
        icon: '/icons/memory.png',
        // Opens the side information panel instead of a case study
        info: {
          title: 'Kyle Nicolaou',
          subtitle: 'UX/UI · Interactive Designer',
          image: 'Kyle Nicolaou',
          body: "Hello, I'm Kyle — a 22 year old interactive designer focused on creating eye-capturing visual and user focused design in the interactive space. I'm a highly creative person who loves bringing ideas to life, using design and UX/UI principles to turn them into experiences that feel intuitive and engaging. I'm especially drawn to 3D experiences on the web and across the interactive space, and I care about carrying a high-end finish through every step of the process.",
        },
      },
      {
        label: 'My Story',
        sublabel: 'Background · Journey',
        group: 'ABOUT',
        icon: '/icons/memory.png',
      },
    ],
  },
  {
    id: 'movie',
    label: 'MOVIE',
    icon: '/icons/movie.png',
    items: [
      {
        label: 'Showreel',
        sublabel: 'Motion · 2025',
        group: 'MEDIA',
        icon: '/icons/memory.png',
      },
      {
        label: 'Process Videos',
        sublabel: 'Behind the Scenes',
        group: 'MEDIA',
        icon: '/icons/memory.png',
      },
    ],
  },
  {
    id: 'works',
    label: 'WORKS',
    icon: '/icons/controller.png',
    items: [
      {
        label: 'Sharing',
        sublabel: '',
        group: 'WORKS',
        icon: '/icons/sharing.png',
      },
      {
        label: 'Ripple',
        sublabel: 'Live Adobe Brief · 2025',
        slug: 'ripple',
        group: 'UNIVERSITY',
        icon: '/icons/disc.png',
        // Shown on highlight, like a PSP game's ICON1 (video) + PIC1 (background)
        preview: {
          video: ['/videos/webmripple.webm', '/videos/finaloutcome.mp4'],
          background: '/images/ripple.png',
        },
      },
      {
        label: 'OutThere Seltzers',
        sublabel: 'Branding · 2025',
        slug: 'outthere',
        group: 'UNIVERSITY',
        icon: '/icons/disc.png',
      },
      {
        label: 'ACBE',
        sublabel: 'Brand Website · 2025',
        link: 'https://www.acbe.co.nz',
        group: 'INDUSTRY',
        icon: '/icons/memory.png',
      },
      {
        label: 'Anchored Steel',
        sublabel: 'Redesign · 2025',
        link: 'https://www.anchoredsteel.co.nz',
        group: 'INDUSTRY',
        icon: '/icons/memory.png',
      },
      {
        label: 'Vartec Industrial',
        sublabel: 'Redesign · 2026',
        link: 'https://www.vartecindustrial.co.nz',
        group: 'INDUSTRY',
        icon: '/icons/memory.png',
      },
    ],
  },
  {
    id: 'network',
    label: 'NETWORK',
    icon: '/icons/network.png',
    items: [
      {
        label: 'Get in Touch',
        sublabel: 'Open to work · Auckland, NZ',
        group: 'CONTACT',
        icon: '/icons/web.png',
        info: {
          title: 'Open to work',
          subtitle: 'Auckland, New Zealand',
          available: true,
          timeZone: 'Pacific/Auckland',
        },
        options: [
          { label: 'Email Me', detail: 'kylenicolaou7@gmail.com', action: { type: 'link', href: 'mailto:kylenicolaou7@gmail.com' } },
          { label: 'Copy Email Address', detail: 'kylenicolaou7@gmail.com', action: { type: 'copy', value: 'kylenicolaou7@gmail.com', done: 'Email copied ✓' } },
          { label: 'LinkedIn Profile', detail: 'linkedin.com/in/kyle-nicolaou · new tab', action: { type: 'link', href: 'https://www.linkedin.com/in/kyle-nicolaou-30440232b/', newTab: true } },
          { label: 'Copy LinkedIn Link', detail: 'linkedin.com/in/kyle-nicolaou', action: { type: 'copy', value: 'https://www.linkedin.com/in/kyle-nicolaou-30440232b/', done: 'Link copied ✓' } },
          { label: 'Download CV', detail: 'PDF · 2025', action: { type: 'link', href: '/files/kyle-nicolaou-cv.pdf', download: true } },
          { label: 'View CV', detail: 'Opens in a new tab', action: { type: 'link', href: '/files/kyle-nicolaou-cv.pdf', newTab: true } },
        ],
      },
    ],
  },

  
];