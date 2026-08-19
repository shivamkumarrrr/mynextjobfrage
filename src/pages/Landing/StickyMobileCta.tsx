import { Button } from '@/components/ui/button';
import { QUIZ_LINK, finalCta } from './content';

/** Mobile-only bottom bar keeping the CTA reachable without scrolling back up. */
export function StickyMobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-white/80 md:hidden">
      <Button asChild size="block" className="gap-1.5">
        <a href={QUIZ_LINK}>{finalCta.label}</a>
      </Button>
    </div>
  );
}
