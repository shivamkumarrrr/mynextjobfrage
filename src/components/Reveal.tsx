import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * Fade-and-rise once the block scrolls into view.
 * Reduced-motion users get the content immediately; the CSS also neutralises
 * the animation, so nothing depends on JS to stay readable.
 */
export function Reveal({ children, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Reduced motion is decided once, before the first paint — no observer, no
  // state churn, content visible immediately.
  const [shown, setShown] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // Re-running once `shown` flips just tears the observer down early.
  }, [shown]);

  return (
    <div ref={ref} className={cn('reveal', shown && 'reveal-in', className)}>
      {children}
    </div>
  );
}
