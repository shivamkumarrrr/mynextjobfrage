import { company } from '../Landing/content';

/**
 * Blocks shorter than this with no closing punctuation read as section
 * headings in the source text (e.g. "IONOS", "2. Hosting") rather than
 * prose, so they get heading styling instead of paragraph styling.
 */
function isHeading(block: string): boolean {
  return block.length < 70 && !/[.!?]$/.test(block) && !block.includes('\n');
}

interface LegalPageProps {
  blocks: string[];
}

export function LegalPage({ blocks }: LegalPageProps) {
  const [title, ...rest] = blocks;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-border px-5 py-5 md:px-10">
        <a href="/" className="inline-flex items-center">
          <img src={company.logo} alt={company.name} className="h-8 w-auto" />
        </a>
      </header>

      <main className="mx-auto max-w-[720px] px-5 py-12 md:px-10 md:py-16">
        <h1 className="font-display text-2xl font-bold tracking-[-0.03em] text-primary md:text-3xl">
          {title}
        </h1>
        <div className="mt-8 flex flex-col gap-4">
          {rest.map((block, i) =>
            isHeading(block) ? (
              <h2
                key={i}
                className="mt-2 text-lg font-bold text-primary"
              >
                {block}
              </h2>
            ) : (
              <p key={i} className="text-[15px] leading-relaxed whitespace-pre-line text-text">
                {block}
              </p>
            )
          )}
        </div>
      </main>
    </div>
  );
}
