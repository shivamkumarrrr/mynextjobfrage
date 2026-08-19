import * as React from 'react';
import { cn } from '@/lib/utils';

const inputClasses =
  'w-full rounded-brand-sm border border-border bg-white px-3.5 py-3 text-base text-text transition-[border-color,box-shadow] duration-150 placeholder:text-muted/70 focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_20%,transparent)] aria-[invalid=true]:border-danger aria-[invalid=true]:focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--danger)_18%,transparent)]';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input type={type} ref={ref} className={cn(inputClasses, className)} {...props} />
  )
);
Input.displayName = 'Input';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(inputClasses, className)} {...props} />
));
Textarea.displayName = 'Textarea';

export { Input, Textarea, inputClasses };
