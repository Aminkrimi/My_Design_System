// Tiny inline icons for stories only; not part of the public API.
import type { SVGProps } from 'react';

const base: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const PlusIcon = () => (
  <svg {...base}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

/** Points toward the inline-end: flipped in RTL so "next" keeps pointing forward. */
export const ArrowIcon = () => (
  <svg {...base} style={{ transform: 'scaleX(var(--mds-dir-flip, 1))' }}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const TrashIcon = () => (
  <svg {...base}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </svg>
);

export const SearchIcon = () => (
  <svg {...base}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const MailIcon = () => (
  <svg {...base}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);
