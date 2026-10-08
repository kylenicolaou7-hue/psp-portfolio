import type { XMBInfo } from '@/components/XMB/XMBInfoPanel';

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
  preview?: { video: string[]; background: string };
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
    items: [
      {
        label: 'Dark Mode',
        sublabel: 'Default Theme',
        group: 'THEME',
        icon: '/icons/display.png',
      },
      {
        label: 'Light Mode',
        sublabel: 'Minimal Theme',
        group: 'THEME',
        icon: '/icons/display.png',
      },
      {
        label: 'Custom',
        sublabel: 'Build Your Own',
        group: 'THEME',
        icon: '/icons/display.png',
      },
    ],
  },
   
  {
  id: 'settings',
  label: 'SETTINGS',
  icon: '/icons/settings.png',
  items: [],
  },

  {
    id: 'system',
    label: 'SYSTEM',
    icon: '/icons/camera.png',
    items: [
      {
        label: 'Education',
        sublabel: 'Media Design School · Bachelor of Media Design',
        group: 'INFO',
        icon: '/icons/memory.png',
      },
      {
        label: 'Technicals',
        sublabel: 'Skills · Tools · Stack',
        group: 'INFO',
        icon: '/icons/memory.png',
      },
      {
        label: 'Platforms',
        sublabel: 'Where I Work',
        group: 'INFO',
        icon: '/icons/memory.png',
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
          body: "Hello, I'm Kyle — a 22 year old interactive designer focused on creating eye-capturing visual and user focused design in the interactive space.",
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
        label: 'Email',
        sublabel: 'kylenicolaou7@gmail.com',
        group: 'CONTACT',
        icon: '/icons/web.png',
      },
      {
        label: 'LinkedIn',
        sublabel: 'kyle-nicolaou',
        group: 'CONTACT',
        icon: '/icons/web.png',
      },
      {
        label: 'Download CV',
        sublabel: 'PDF · 2025',
        group: 'CONTACT',
        icon: '/icons/web.png',
      },
    ],
  },

  
];