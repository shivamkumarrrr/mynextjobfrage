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
    <section className="pt-4 text-center">
      {branding.thankYouImage && (
        <img
          className="mb-5 block aspect-[16/7] w-full rounded-lg object-cover md:aspect-[16/6]"
          src={branding.thankYouImage}
          alt={(config.job && config.job.company) || ''}
          loading="lazy"
        />
      )}
      <svg viewBox="0 0 52 52" aria-hidden="true" className="mx-auto mb-5 block h-[84px] w-[84px]">
        <circle className="checkmark-circle" cx="26" cy="26" r="24" fill="none" />
        <path className="checkmark-check" fill="none" d="M14 27l8 8 16-16" />
      </svg>
      <h1 className="mb-2.5 text-[1.6rem] font-bold text-primary" tabIndex={-1} data-focus>
        {t.headline || 'Vielen Dank!'}
      </h1>
      <p className="mx-auto max-w-[460px] text-[1.05rem] text-muted">
        {t.body || 'Wir haben deine Angaben erhalten und melden uns bei dir.'}
      </p>
      <ShareButtons config={config} target={shareTarget} text={shareText} />
      {t.footerNote && <p className="mt-[22px] text-[13px] text-muted">{t.footerNote}</p>}
    </section>
  );
}
