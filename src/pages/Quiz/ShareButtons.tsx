import type { QuizConfig } from '@/lib/types';

const PATHS = {
  whatsapp:
    'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.3-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.6.7 2 .8 2.1.1.2.1.3 0 .5-.1.2-.2.3-.3.5-.1.2-.3.3-.1.5.1.3.6 1 1.3 1.6.9.8 1.6 1 1.9 1.1.2.1.4.1.5-.1.1-.1.5-.6.7-.8.2-.2.3-.2.5-.1.2.1 1.4.6 1.6.7.2.1.4.2.5.3.1.3.1 1-.2 1.6z',
  linkedin:
    'M4.98 3.5a2 2 0 1 1-.02 4 2 2 0 0 1 .02-4zM3 9h4v12H3V9zm7 0h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21h-4V9z',
  facebook:
    'M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.6V4.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V11H7.5v3H10v8h3.5z',
} as const;

interface ShareButtonsProps {
  config: QuizConfig;
  target: string;
  text: string;
}

/** WhatsApp / LinkedIn / Facebook share links — plain hrefs, no tracking SDKs. */
export function ShareButtons({ config, target, text }: ShareButtonsProps) {
  const share = (config.thankYou && config.thankYou.share) || {};
  const enc = encodeURIComponent;

  const buttons = [
    share.whatsapp && {
      key: 'whatsapp' as const,
      label: 'WhatsApp',
      href: `https://wa.me/?text=${enc(text + ' ' + target)}`,
      className: 'bg-[#25d366]',
    },
    share.linkedin && {
      key: 'linkedin' as const,
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(target)}`,
      className: 'bg-[#0a66c2]',
    },
    share.facebook && {
      key: 'facebook' as const,
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(target)}`,
      className: 'bg-[#1877f2]',
    },
  ].filter(Boolean) as { key: keyof typeof PATHS; label: string; href: string; className: string }[];

  if (!buttons.length) return null;

  return (
    <div className="mt-7 flex flex-wrap justify-center gap-3">
      {buttons.map((b) => (
        <a
          key={b.key}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white no-underline transition-[opacity,transform] duration-150 hover:-translate-y-px hover:opacity-90 ${b.className}`}
          href={b.href}
          target="_blank"
          rel="noopener"
          aria-label={`Auf ${b.label} teilen`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]">
            <path d={PATHS[b.key]} fill="currentColor" />
          </svg>
          <span>{b.label}</span>
        </a>
      ))}
    </div>
  );
}
