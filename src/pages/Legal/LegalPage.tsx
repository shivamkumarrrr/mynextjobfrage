import { company } from '../Landing/content';

/**
 * Blocks shorter than this with no closing punctuation read as section
 * headings in the source text (e.g. "IONOS", "2. Hosting") rather than
 * prose, so they get heading styling instead of paragraph styling.
 */
function isHeading(block: string): boolean {
  return block.length < 70 && !/[.!?]$/.test(block) && !block.includes('\n');
}

/** "1. Hosting" / "2. Datenerfassung..." — top-level numbered sections get a bigger, ruled treatment than the plain sub-headings in between (e.g. "IONOS"). */
function isMainSection(block: string): boolean {
  return /^\d+\.\s/.test(block);
}

interface LegalPageProps {
  blocks: string[];
}

export function LegalPage({ blocks }: LegalPageProps) {
  const [title, ...rest] = blocks;

  return (
    <div className="min-h-screen bg-[color-mix(in_srgb,var(--accent)_4%,white)]">
      <header className="border-b border-border bg-white px-5 py-5 md:px-10">
        <a href="/" className="inline-flex items-center">
          <img src={company.logo} alt={company.name} className="h-8 w-auto" />
        </a>
      </header>

      <main className="mx-auto max-w-[720px] px-5 py-12 md:px-10 md:py-16">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent no-underline transition-colors hover:text-accent-hover"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5">
            <path
              d="M15 5l-7 7 7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Zurück zur Startseite
        </a>

        <div className="mt-6 rounded-brand border border-border bg-white px-6 py-9 shadow-[0_2px_20px_rgba(0,0,0,0.04)] md:px-12 md:py-12">
          <h1 className="font-display text-2xl font-bold tracking-[-0.03em] text-primary md:text-3xl">
            {title}
          </h1>
          <span className="mt-3 block h-1 w-12 rounded-full bg-accent" aria-hidden="true" />

          <div className="mt-8 flex flex-col gap-4">
            {rest.map((block, i) =>
              isHeading(block) ? (
                isMainSection(block) ? (
                  <h2
                    key={i}
                    className="mt-6 border-t border-border pt-6 text-lg font-bold tracking-[-0.01em] text-primary first:mt-0 first:border-t-0 first:pt-0"
                  >
                    {block}
                  </h2>
                ) : (
                  <h3 key={i} className="mt-1 text-[15px] font-bold text-accent-deep">
                    {block}
                  </h3>
                )
              ) : (
                <p key={i} className="text-[15px] leading-relaxed whitespace-pre-line text-text">
                  {block}
                </p>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
