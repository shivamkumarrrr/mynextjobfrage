import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold',
  {
    variants: {
      variant: {
        outline: 'border border-border px-3 py-1.5 text-[13px] text-muted',
        soft: 'bg-bg px-3.5 py-2 text-[13.5px] font-medium text-text',
      },
    },
    defaultVariants: { variant: 'outline' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
