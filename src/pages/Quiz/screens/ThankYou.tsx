import type { QuizConfig } from '@/lib/types';
import { ShareButtons } from '../ShareButtons';

interface ThankYouProps {
  config: QuizConfig;
}

export function ThankYou({ config }: ThankYouProps) {
  const t = config.thankYou || {};
  const branding = config.branding || {};

  const shareTarget = t.shareUrl || window.location.href;
  const shareText =
    t.shareText ||
    `Ich habe mich als ${config.job && config.job.title} bei ${config.job && config.job.company} beworben!`;

  return (
    <section className="rounded-[18px] border border-border bg-white p-7 text-center shadow-[0_10px_30px_-24px_rgba(0,0,0,0.45)] md:p-9">
      {branding.thankYouImage && (
        <img
          className="mb-6 block aspect-[16/7] w-full rounded-[14px] object-cover md:aspect-[16/6]"
          src={branding.thankYouImage}
          alt={(config.job && config.job.company) || ''}
          loading="lazy"
        />
      )}
      <svg viewBox="0 0 52 52" aria-hidden="true" className="mx-auto mb-5 block h-[84px] w-[84px]">
        <circle className="checkmark-circle" cx="26" cy="26" r="24" fill="none" />
        <path className="checkmark-check" fill="none" d="M14 27l8 8 16-16" />
      </svg>
      <h1
        className="mb-2.5 font-display text-[1.6rem] font-bold tracking-[-0.02em] text-primary"
        tabIndex={-1}
        data-focus
      >
        {t.headline || 'Vielen Dank!'}
      </h1>
      <p className="mx-auto max-w-[46ch] text-[1.02rem] leading-relaxed text-text/75">
        {t.body || 'Wir haben deine Angaben erhalten und melden uns bei dir.'}
      </p>
      <ShareButtons config={config} target={shareTarget} text={shareText} />
      {t.footerNote && <p className="mt-[22px] text-[13px] text-muted">{t.footerNote}</p>}
    </section>
  );
}
