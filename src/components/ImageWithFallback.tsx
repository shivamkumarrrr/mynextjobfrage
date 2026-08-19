import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackLabel: string;
  fallbackClassName?: string;
}

/**
 * Image that swaps to a labelled placeholder when the file is missing.
 *
 * React's `onError` prop compiles to an attached event listener, not an inline
 * `onerror="…"` HTML attribute — so unlike the markup it replaces, this is
 * CSP-safe under `script-src 'self'` with no `unsafe-inline`.
 */
export function ImageWithFallback({
  fallbackLabel,
  fallbackClassName,
  className,
  ...props
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          'flex w-full items-center justify-center text-[13px] font-semibold uppercase tracking-wider text-white/20',
          fallbackClassName
        )}
      >
        {fallbackLabel}
      </div>
    );
  }

  return <img className={className} onError={() => setFailed(true)} {...props} />;
}
