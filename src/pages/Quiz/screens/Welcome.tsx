import { ImageWithFallback } from '@/components/ImageWithFallback';
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
    <section className="mx-auto max-w-[520px] pt-3 text-center">
      {branding.heroImage && (
        <div className="mx-auto mb-5 max-w-[420px] animate-fadeSlideUp overflow-hidden rounded-brand">
          <ImageWithFallback
            src={branding.heroImage}
            alt=""
            fallbackLabel={job.company || 'Foto'}
            loading="lazy"
            className="block aspect-video w-full object-cover"
            fallbackClassName="aspect-video"
          />
        </div>
      )}
      {branding.logoUrl && (
        <img
          className="mx-auto mb-[18px] block max-h-12 w-auto animate-fadeSlideUp"
          style={{ animationDelay: '80ms' }}
          src={branding.logoUrl}
          alt={job.company || ''}
        />
      )}
      <p
        className="mb-2 animate-fadeSlideUp text-[13px] font-bold uppercase tracking-[0.08em] text-accent-deep"
        style={{ animationDelay: '160ms' }}
      >
        {config.topbarLabel || 'Online-Test'}
      </p>
      <h1
        className="mb-1.5 animate-fadeSlideUp text-[clamp(1.5rem,4.5vw,2.05rem)] font-bold leading-tight text-primary"
        style={{ animationDelay: '220ms' }}
        tabIndex={-1}
        data-focus
      >
        {job.title || ''}
      </h1>
      <p
        className="mb-4 animate-fadeSlideUp font-semibold text-text"
        style={{ animationDelay: '280ms' }}
      >
        {job.company || ''}
      </p>
      <p
        className="mx-auto mb-[18px] max-w-[480px] animate-fadeSlideUp text-[1.05rem] text-muted"
        style={{ animationDelay: '340ms' }}
      >
        {welcome.intro || ''}
      </p>
      <p
        className="mb-[26px] animate-fadeSlideUp text-sm text-muted"
        style={{ animationDelay: '400ms' }}
      >
        {welcome.metaText || 'Dauer: ca. 5 Minuten'}
      </p>
      <Button
        type="button"
        size="lg"
        className="min-w-[220px] animate-fadeSlideUp"
        style={{ animationDelay: '460ms' }}
        onClick={onStart}
      >
        {welcome.startButton || 'Online-Test starten'}
      </Button>
    </section>
  );
}
