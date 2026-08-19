import type { Branding, QuizConfig } from './types';

/** Darken a #rrggbb color by a factor, used for the hover shades. */
export function darken(hex: string | undefined, factor = 0.82): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!match) return '#123a45';
  const n = parseInt(match[1], 16);
  const r = Math.round(((n >> 16) & 255) * factor);
  const g = Math.round(((n >> 8) & 255) * factor);
  const b = Math.round((n & 255) * factor);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * The runtime branding bridge: writes the fetched quiz's colors onto `:root` as
 * CSS custom properties. Tailwind's theme resolves `bg-primary` & co. through
 * those same properties, so a new client is still a new JSON file and zero code.
 */
export function applyBranding(config: QuizConfig): void {
  const b: Branding = config.branding || {};
  const root = document.documentElement;
  if (b.primary) root.style.setProperty('--primary', b.primary);
  if (b.accent) root.style.setProperty('--accent', b.accent);
  if (b.primary) root.style.setProperty('--primary-hover', darken(b.primary, 0.85));
  if (b.accent) root.style.setProperty('--accent-hover', darken(b.accent, 0.82));
  if (b.bg) root.style.setProperty('--bg', b.bg);
  if (b.text) root.style.setProperty('--text', b.text);
  if (b.radius) root.style.setProperty('--radius', b.radius);
  if (b.font) root.style.setProperty('--font', b.font);
}

/**
 * Keep the browser chrome (tab title, link preview, mobile status bar) in sync
 * with the loaded quiz — never a stale generic page.
 */
export function applyMeta(config: QuizConfig): void {
  const job = config.job || {};
  const title = `Online-Test: ${job.title || 'Bewerbung'}`;
  const intro = (config.welcome && config.welcome.intro) || '';

  document.title = title;

  const set = (selector: string, attr: string, value?: string) => {
    const el = document.querySelector(selector);
    if (el && value) el.setAttribute(attr, value);
  };
  set('meta[name="description"]', 'content', intro);
  set('meta[property="og:title"]', 'content', title);
  set('meta[property="og:description"]', 'content', intro);
  set('meta[name="theme-color"]', 'content', (config.branding || {}).primary);
}

/** Fallback wordmark when a client ships no logo file. */
export function initials(name = ''): string {
  const words = name.split(/\s+/).filter(Boolean);
  const acronym = words.find((w) => w.length >= 2 && w.length <= 4 && w === w.toUpperCase());
  if (acronym) return acronym;
  return (
    words
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'MNJ'
  );
}
