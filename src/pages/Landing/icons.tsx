import type { ReactNode } from 'react';

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  'aria-hidden': true as const,
  className: 'h-7 w-7',
};

export const benefitIcons: Record<
  | 'coins'
  | 'target'
  | 'shield'
  | 'calendar'
  | 'rocket'
  | 'bike'
  | 'wifi'
  | 'graduation'
  | 'trending',
  ReactNode
> = {
  coins: (
    <svg {...base}>
      <circle cx="16" cy="8" r="6" />
      <path d="M13.744 17.736a6 6 0 1 1-7.48-7.48M15 6h1v4" strokeLinecap="round" />
      <path d="m6.134 14.768.866-.5 2 3.464" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  target: (
    <svg {...base}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  shield: (
    <svg {...base}>
      <path
        d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
        strokeLinejoin="round"
      />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  calendar: (
    <svg {...base}>
      <path d="M8 2v3m8-3v3" strokeLinecap="round" />
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path
        d="M3 9h18M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01"
        strokeLinecap="round"
      />
    </svg>
  ),
  rocket: (
    <svg {...base}>
      <path
        d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  bike: (
    <svg {...base}>
      <circle cx="18.5" cy="17.5" r="3.5" />
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="15" cy="5" r="1" />
      <path d="M12 17.5V14l-3-3 4-3 2 3h2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  wifi: (
    <svg {...base}>
      <path
        d="M12 20h.01M2 8.82a15 15 0 0 1 20 0M5 12.859a10 10 0 0 1 14 0m-10.5 3.57a5 5 0 0 1 7 0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  graduation: (
    <svg {...base}>
      <path
        d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0zM22 10v6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  trending: (
    <svg {...base}>
      <path d="M16 7h6v6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m22 7-8.5 8.5-5-5L2 17" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const pillIcon = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  'aria-hidden': true as const,
  className: 'h-5 w-5 shrink-0 text-muted',
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

const processIconBase = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  'aria-hidden': true as const,
  className: 'h-7 w-7',
};

export const processStepIcons: Record<'clipboard' | 'contact' | 'rocket', ReactNode> = {
  clipboard: (
    <svg {...processIconBase}>
      <rect x="5" y="3" width="14" height="18" rx="2" strokeLinejoin="round" />
      <path d="M9 3v4a2 2 0 0 0 4 0V3" strokeLinecap="round" />
      <path d="M9 11h6M9 15h4" strokeLinecap="round" />
    </svg>
  ),
  contact: (
    <svg {...processIconBase}>
      <circle cx="12" cy="8" r="4" strokeLinejoin="round" />
      <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  rocket: (
    <svg {...processIconBase}>
      <path
        d="M12 2c3 2 5 6 5 10 0 2-1 4-2 5l-3 3-3-3c-1-1-2-3-2-5 0-4 2-8 5-10z"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="1.6" />
      <path d="M9 17l-2 4M15 17l2 4" strokeLinecap="round" />
    </svg>
  ),
};
