import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CTA_LABEL, QUIZ_LINK } from './content';

/**
 * Mobile-only bottom bar keeping the CTA reachable without scrolling back up.
 * It stays out of the way while the hero's own CTA is on screen, and retreats
 * again over the closing CTA so the two never stack on top of each other.
 */
export function StickyMobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('[data-hero-cta]');
    const final = document.querySelector('[data-final-cta]');
    if (!hero || !final) return;

    let heroVisible = true;
    let finalVisible = false;
    let scrolledIn = window.scrollY > window.innerHeight * 0.6;
    // The bar is a second chance at the CTA, not a greeting: it stays down until
    // the candidate has actually started reading.
    const sync = () => setVisible(scrolledIn && !heroVisible && !finalVisible);

    const onScroll = () => {
      scrolledIn = window.scrollY > window.innerHeight * 0.6;
      sync();
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === hero) heroVisible = entry.isIntersecting;
          if (entry.target === final) finalVisible = entry.isIntersecting;
        }
        sync();
      },
      { rootMargin: '0px 0px -20% 0px' }
    );
    observer.observe(hero);
    observer.observe(final);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      className={
        'fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-300 supports-[backdrop-filter]:bg-white/90 md:hidden ' +
        (visible ? 'translate-y-0' : 'translate-y-full')
      }
      aria-hidden={!visible}
    >
      <Button asChild size="block" className="rounded-full" tabIndex={visible ? undefined : -1}>
        <a href={QUIZ_LINK}>{CTA_LABEL}</a>
      </Button>
    </div>
  );
}
