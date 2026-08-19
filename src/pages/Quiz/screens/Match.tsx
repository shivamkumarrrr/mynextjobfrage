import { Button } from '@/components/ui/button';
import type { QuizConfig } from '@/lib/types';

interface MatchProps {
  config: QuizConfig;
  onContinue: () => void;
}

/**
 * Positive counterpart to the rejection screen — shown to candidates who cleared
 * knockouts + threshold, before the lead form. Categorical only ("Volltreffer"),
 * never a number or percentage: candidates never see scoring.
 */
export function Match({ config, onContinue }: MatchProps) {
  const matchCfg = (config.scoring && config.scoring.matchScreen) || {};
  const headline = matchCfg.headline || 'Volltreffer!';
  const body =
    matchCfg.body ||
    'Dein Profil passt richtig gut zu dieser Stelle. Nur noch ein Schritt: Hinterlasse deine Kontaktdaten, damit wir uns bei dir melden können.';

  return (
    <section className="animate-screenIn pt-4 text-center">
      <div className="mx-auto mb-5 h-[84px] w-[84px]">
        <svg viewBox="0 0 52 52" aria-hidden="true" className="block h-full w-full">
          <circle className="match-ring match-ring-outer" cx="26" cy="26" r="24" fill="none" />
          <circle className="match-ring match-ring-mid" cx="26" cy="26" r="16" fill="none" />
          <circle className="match-ring-bull" cx="26" cy="26" r="7" />
        </svg>
      </div>
      <h1 className="mb-2.5 text-[1.6rem] font-bold text-primary" tabIndex={-1} data-focus>
        {headline}
      </h1>
      <p className="mx-auto max-w-[460px] text-[1.05rem] text-muted">{body}</p>
      <Button type="button" className="mt-6 min-w-[200px]" onClick={onContinue}>
        {config.continueLabel || 'Weiter'}
      </Button>
    </section>
  );
}
