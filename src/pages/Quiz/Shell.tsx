import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { initials } from '@/lib/branding';
import type { QuizConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LogoProps {
  config: QuizConfig;
  className?: string;
}

function Logo({ config, className }: LogoProps) {
  const job = config.job || {};
  const logoUrl = (config.branding || {}).logoUrl;
  if (logoUrl) {
    return (
      <img
        className={cn('h-[34px] w-[34px] rounded-lg object-contain', className)}
        src={logoUrl}
        alt={job.company || ''}
      />
    );
  }
  return (
    <span
      className={cn(
        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-bold tracking-wide text-white',
        className
      )}
    >
      {initials(job.company)}
    </span>
  );
}

interface StepsProps {
  config: QuizConfig;
  phase: number;
  className?: string;
}

function Steps({ config, phase, className }: StepsProps) {
  const steps = config.steps || [];
  return (
    <ol className={cn('relative m-0 list-none p-0', className)} aria-label="Schritte">
      {steps.map((step, i) => {
        const done = i < phase;
        const active = i === phase;
        return (
          <li
            key={step.id}
            className={cn(
              'relative ml-4 flex items-center gap-3 py-3 text-[15px]',
              done && 'text-text',
              active && 'font-bold text-primary',
              !done && !active && 'text-muted'
            )}
          >
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute -left-4 top-9 h-[calc(100%-12px)] w-0.5',
                  done ? 'bg-accent' : 'bg-track'
                )}
              />
            )}
            {done ? (
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent p-[5px] text-white">
                <svg viewBox="0 0 16 16" aria-hidden="true" className="h-full w-full">
                  <path
                    d="M3.5 8.5l3 3 6-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            ) : (
              <span
                className={cn(
                  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white text-xs font-bold',
                  active
                    ? 'border-accent text-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_18%,transparent)]'
                    : 'border-border text-muted'
                )}
              >
                {i + 1}
              </span>
            )}
            <span className={cn(done && 'font-semibold')}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

interface ShellProps {
  config: QuizConfig;
  phase: number;
  percent: number;
  progressText: string;
  children: ReactNode;
}

export function Shell({ config, phase, percent, progressText, children }: ShellProps) {
  const job = config.job || {};
  const steps = config.steps || [];
  const inFlight = percent > 0 && percent < 100;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-white">
        <div className="mx-auto flex w-full max-w-shell items-center justify-between px-5 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Logo config={config} />
            <span className="truncate text-[15px] font-semibold text-primary">
              {job.company || 'Online-Test'}
            </span>
          </div>
          <Badge>{config.topbarLabel || steps[0]?.label || 'Online-Test'}</Badge>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-shell flex-1 grid-cols-1 gap-7 px-3.5 pb-12 pt-6 sm:px-5 md:grid-cols-[210px_minmax(0,1fr)_310px] md:gap-10 md:pb-16 md:pt-7">
        <aside className="hidden md:block">
          <Steps config={config} phase={phase} />
        </aside>

        <main className="relative mx-auto w-full min-w-0 max-w-content md:max-w-[740px]">
          <div className="mb-5 w-full md:hidden">
            <Progress
              value={percent}
              active={inFlight}
              className="h-1 rounded-sm bg-border"
              indicatorClassName="rounded-sm"
              aria-label={`${config.progressLabel || 'Fortschritt'} ${percent}%`}
            />
          </div>
          {children}
        </main>

        <aside className="hidden md:block">
          <div className="sticky top-[calc(var(--header-h)+12px)] rounded-[14px] border border-border bg-surface p-6">
            <div className="mb-2.5 text-[18px] font-bold leading-tight text-primary">
              {job.title || ''}
            </div>
            <div className="mb-[18px] flex items-center gap-2 text-[15px] font-medium text-muted">
              <span className="inline-flex h-[28px] w-[28px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-card">
                <Logo config={config} className="h-full w-full rounded-none" />
              </span>
              {job.company || ''}
            </div>
            <div className="mb-3 text-[14px] font-semibold uppercase tracking-wider text-muted">
              {config.progressLabel || 'Dein Fortschritt'}
            </div>
            <Progress
              value={percent}
              active={inFlight}
              aria-label={`${config.progressLabel || 'Fortschritt'} ${percent}%`}
            />
            <div className="mt-2.5 flex justify-between text-[14px] font-semibold text-muted">
              <span>{progressText}</span>
              <span className="text-primary">{percent}%</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
