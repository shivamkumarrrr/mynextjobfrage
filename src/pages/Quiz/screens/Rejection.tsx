import type { QuizConfig } from '@/lib/types';
import { ShareButtons } from '../ShareButtons';

interface RejectionProps {
  config: QuizConfig;
}

/**
 * Lead-quality filter endpoint: no lead form, `candidate: null` in the webhook.
 * Still nothing about the score is shown — only the categorical outcome.
 */
export function Rejection({ config }: RejectionProps) {
  const rejectCfg = (config.scoring && config.scoring.rejectScreen) || {};
  const headline = rejectCfg.headline || 'Leider passt es aktuell nicht.';
  const body =
    rejectCfg.body ||
    'Danke, dass du dir die Zeit genommen hast. Dein Profil passt leider nicht zu den aktuellen Anforderungen dieser Stelle.';
  const showShare = rejectCfg.showShare !== false;

  const shareTarget = (config.thankYou && config.thankYou.shareUrl) || window.location.href;
  const shareText =
    (config.thankYou && config.thankYou.shareText) ||
    `Schau dir diese Stelle an: ${config.job && config.job.title} bei ${config.job && config.job.company}`;

  return (
    <section className="animate-screenIn pt-4 text-center">
      <div className="mx-auto mb-5 h-[84px] w-[84px]">
        <svg viewBox="0 0 52 52" aria-hidden="true" className="block h-full w-full">
          <circle className="rejection-circle" cx="26" cy="26" r="24" fill="none" />
          <path className="rejection-x" fill="none" d="M18 18l16 16M34 18l-16 16" />
        </svg>
      </div>
      <h1 className="mb-2.5 text-[1.6rem] font-bold text-primary" tabIndex={-1} data-focus>
        {headline}
      </h1>
      <p className="mx-auto max-w-[460px] text-[1.05rem] text-muted">{body}</p>
      {showShare && <ShareButtons config={config} target={shareTarget} text={shareText} />}
    </section>
  );
}
