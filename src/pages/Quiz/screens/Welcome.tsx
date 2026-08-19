import { Button } from '@/components/ui/button';
import type { QuizConfig } from '@/lib/types';

interface WelcomeProps {
  config: QuizConfig;
  onStart: () => void;
}

export function Welcome({ config, onStart }: WelcomeProps) {
  const job = config.job || {};
  const branding = config.branding || {};
  const welcome = config.welcome || {};

  return (
    <section className="mx-auto max-w-[520px] animate-screenIn pt-3 text-center">
      {branding.logoUrl && (
        <img
          className="mx-auto mb-[18px] block max-h-12 w-auto animate-fadeSlideUp"
          src={branding.logoUrl}
          alt={job.company || ''}
        />
      )}
      <p
        className="mb-2 animate-fadeSlideUp text-[13px] font-bold uppercase tracking-[0.08em] text-accent"
        style={{ animationDelay: '140ms' }}
      >
        {config.topbarLabel || 'Online-Test'}
      </p>
      <h1
        className="mb-1.5 animate-fadeSlideUp text-[clamp(1.5rem,4.5vw,2.05rem)] font-bold leading-tight text-primary"
        style={{ animationDelay: '200ms' }}
        tabIndex={-1}
        data-focus
      >
        {job.title || ''}
      </h1>
      <p
        className="mb-4 animate-fadeSlideUp font-semibold text-text"
        style={{ animationDelay: '260ms' }}
      >
        {job.company || ''}
      </p>
      <p
        className="mx-auto mb-[18px] max-w-[480px] animate-fadeSlideUp text-[1.05rem] text-muted"
        style={{ animationDelay: '320ms' }}
      >
        {welcome.intro || ''}
      </p>
      <p
        className="mb-[26px] animate-fadeSlideUp text-sm text-muted"
        style={{ animationDelay: '380ms' }}
      >
        {welcome.metaText || 'Dauer: ca. 5 Minuten'}
      </p>
      <Button
        type="button"
        size="lg"
        className="min-w-[220px] animate-fadeSlideUp"
        style={{ animationDelay: '440ms' }}
        onClick={onStart}
      >
        {welcome.startButton || 'Online-Test starten'}
      </Button>
    </section>
  );
}
