import type { FatalInfo } from '../machine';

/**
 * Terminal error screen. Copy is authored here, never interpolated from user
 * input, so there is no HTML-injection surface (the old version rendered a
 * string through innerHTML to get a link into the dev-server hint).
 */
export function Fatal({ info }: { info: FatalInfo }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto max-w-[520px] px-5 py-20 text-center">
        <div className="mx-auto mb-[18px] flex h-14 w-14 items-center justify-center rounded-2xl bg-danger text-xl font-bold text-white">
          !
        </div>
        <div className="mx-auto max-w-[460px] text-[1.05rem] text-muted">
          {info.message}
          {info.hint === 'dev-server' && (
            <>
              <br />
              Bitte starte im Projektordner{' '}
              <code className="rounded-md border border-border bg-surface px-1.5 py-px text-[0.9em]">
                npm run dev
              </code>{' '}
              und öffne anschließend{' '}
              <a className="font-semibold text-primary no-underline" href="http://localhost:3000/">
                http://localhost:3000/
              </a>
              .
            </>
          )}
        </div>
        {info.showBackLink !== false && (
          <p className="mt-[26px] text-sm">
            <a className="text-muted no-underline hover:text-text" href="./">
              ← Zurück zur Stellenanzeige
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
