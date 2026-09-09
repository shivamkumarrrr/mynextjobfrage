import { Button } from '@/components/ui/button';
import { CTA_LABEL, QUIZ_LINK, company } from './content';

/**
 * Slim sticky header, like the live job ad: the brand stays put while the page
 * scrolls, and the desktop CTA is always one click away (mobile has the bottom
 * bar instead, so the button would only crowd a 390px header).
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white/90 px-5 backdrop-blur supports-[backdrop-filter]:bg-white/75 md:px-10">
      <div className="mx-auto flex max-w-shell items-center justify-between gap-4 py-3">
        <a href="#top" className="flex items-center gap-3 no-underline">
          <img src={company.logo} alt={company.name} className="h-7 w-auto md:h-8" />
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-text/55 sm:block">
            {company.tagline}
          </span>
        </a>
        <Button asChild size="pill" className="hidden text-sm md:inline-flex">
          <a href={QUIZ_LINK}>{CTA_LABEL}</a>
        </Button>
      </div>
    </header>
  );
}
