import type { ReactNode } from 'react';
import type { BenefitIcon } from './content';

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  'aria-hidden': true as const,
  className: 'h-[22px] w-[22px]',
};

/** Line icons, inlined so the page makes no third-party requests. */
export const benefitIcons: Record<BenefitIcon, ReactNode> = {
  document: (
    <svg {...base}>
      <path d="M6 3h9l3 3v15H6z" strokeLinejoin="round" />
      <path d="M9 9h6M9 13h6M9 17h3" strokeLinecap="round" />
    </svg>
  ),
  screen: (
    <svg {...base}>
      <rect x="3" y="7" width="18" height="10" rx="2" />
      <circle cx="12" cy="12" r="2.4" />
    </svg>
  ),
  shield: (
    <svg {...base}>
      <path d="M12 4l9 4-9 4-9-4 9-4z" strokeLinejoin="round" />
      <path d="M7 11v4c0 1.5 2.5 3 5 3s5-1.5 5-3v-4" strokeLinecap="round" />
    </svg>
  ),
  lightbulb: (
    <svg {...base}>
      <path d="M9 18h6M10 21h4" strokeLinecap="round" />
      <path
        d="M12 3a6 6 0 0 0-3.5 10.9c.6.45 1 1.15 1 1.9V17h5v-1.2c0-.75.4-1.45 1-1.9A6 6 0 0 0 12 3z"
        strokeLinejoin="round"
      />
    </svg>
  ),
  laptop: (
    <svg {...base}>
      <rect x="4" y="5" width="16" height="10" rx="1.5" />
      <path d="M2 19h20l-2-3H4z" strokeLinejoin="round" />
    </svg>
  ),
  bike: (
    <svg {...base}>
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <path d="M4 9h16M12 9v11M8 9a2 2 0 1 1 4-1 2 2 0 1 1 4 1" strokeLinecap="round" />
    </svg>
  ),
  chart: (
    <svg {...base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17l5-5 4 3 7-8" />
      <path d="M15 6h5v5" />
    </svg>
  ),
  mountain: (
    <svg {...base}>
      <path d="M3 19l6-10 4 6 3-4 5 8z" strokeLinejoin="round" />
    </svg>
  ),
  rocket: (
    <svg {...base}>
      <path
        d="M12 2c3 2 5 6 5 10 0 2-1 4-2 5l-3 3-3-3c-1-1-2-3-2-5 0-4 2-8 5-10z"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="1.6" />
      <path d="M9 17l-2 4M15 17l2 4" strokeLinecap="round" />
    </svg>
  ),
};

const pillIcon = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  'aria-hidden': true as const,
  className: 'h-4 w-4 shrink-0 text-muted',
};

export const LocationIcon = () => (
  <svg {...pillIcon}>
    <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z" strokeLinejoin="round" />
    <circle cx="12" cy="9.5" r="2.3" />
  </svg>
);

export const HomeIcon = () => (
  <svg {...pillIcon}>
    <path d="M4 11l8-7 8 7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 10v9h12v-9" strokeLinejoin="round" />
  </svg>
);
