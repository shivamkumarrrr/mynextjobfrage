import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cn } from '@/lib/utils';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      'group overflow-hidden rounded-brand border border-border bg-card transition-[border-color,box-shadow] duration-200 hover:border-accent',
      'data-[state=open]:border-accent data-[state=open]:shadow-[0_2px_10px_color-mix(in_srgb,var(--accent)_18%,transparent)]',
      className
    )}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex w-full items-center justify-between gap-4 px-5 py-[18px] text-left text-[15px] font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent',
        className
      )}
      {...props}
    >
      {children}
      {/* Plus → minus: the vertical bar rotates away when the item opens. */}
      <span
        aria-hidden="true"
        className="relative h-7 w-7 shrink-0 rounded-full bg-bg transition-colors duration-200 group-data-[state=open]:bg-accent"
      >
        <span className="absolute left-2 top-[13px] h-0.5 w-3 rounded-sm bg-muted transition-colors duration-200 group-data-[state=open]:bg-white" />
        <span className="absolute left-[13px] top-2 h-3 w-0.5 rounded-sm bg-muted transition-[transform,background-color] [transition-duration:250ms] group-data-[state=open]:rotate-90 group-data-[state=open]:bg-white" />
      </span>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('px-5 pb-5 text-[15px] leading-[1.7] text-text', className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
