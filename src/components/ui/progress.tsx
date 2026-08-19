import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Adds the animated shine while progress is in flight. */
  active?: boolean;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, active, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    value={value ?? 0}
    className={cn('relative h-2 w-full overflow-hidden rounded-full bg-track', className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        'h-full w-full origin-left rounded-full bg-accent transition-transform [transition-duration:400ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]',
        active && 'progress-active',
        indicatorClassName
      )}
      style={{ transform: `scaleX(${Math.min(Math.max(value ?? 0, 0), 100) / 100})` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
