import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input, Textarea } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Candidate, LeadField, QuizConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

const SALUTATIONS = ['Herr', 'Frau', 'Keine Angabe'] as const;
const EMAIL_RE = /^\S+@\S+\.\S+$/;

/**
 * Group adjacent `half` fields into two-column rows.
 * A trailing, unpaired half field becomes its own full-width row instead of
 * rendering at half width next to an empty gap (which is what the pre-migration
 * markup did).
 */
export function buildFieldRows(fields: LeadField[]): LeadField[][] {
  const rows: LeadField[][] = [];
  let pair: LeadField[] = [];

  for (const field of fields) {
    if (field.half) {
      pair.push(field);
      if (pair.length === 2) {
        rows.push(pair);
        pair = [];
      }
      continue;
    }
    if (pair.length) {
      rows.push(pair);
      pair = [];
    }
    rows.push([field]);
  }
  if (pair.length) rows.push(pair);

  return rows;
}

/** Zod schema derived from the client's JSON field list. */
function buildSchema(fields: LeadField[]) {
  const shape: Record<string, z.ZodTypeAny> = {
    salutation: z.string().optional(),
    whatsappOptIn: z.boolean().optional(),
  };

  for (const field of fields) {
    const message = field.errorMessage || 'Bitte ausfüllen';

    if (field.type === 'checkbox') {
      // A checkbox is only filled in when it is actually checked. The old code
      // tested `input.value.trim().length > 0`, and an unchecked checkbox still
      // reports value "on" — so required checkboxes were never enforced.
      shape[field.name] = field.required
        ? z.boolean().refine((v) => v === true, { message })
        : z.boolean().optional();
      continue;
    }

    if (!field.required) {
      shape[field.name] = z.string().optional();
      continue;
    }

    let rule = z.string().trim().min(1, { message });
    if (field.type === 'email') rule = rule.regex(EMAIL_RE, { message });
    shape[field.name] = rule;
  }

  return z.object(shape);
}

interface LeadProps {
  config: QuizConfig;
  onSubmit: (candidate: Candidate) => void;
}

export function Lead({ config, onSubmit }: LeadProps) {
  const lf = config.leadForm || {};
  const fields = useMemo(() => lf.fields || [], [lf.fields]);
  const rows = useMemo(() => buildFieldRows(fields), [fields]);
  const schema = useMemo(() => buildSchema(fields), [fields]);

  const defaultValues = useMemo(() => {
    const values: Record<string, string | boolean> = {
      salutation: 'Keine Angabe',
      whatsappOptIn: false,
    };
    for (const f of fields) values[f.name] = f.type === 'checkbox' ? false : '';
    return values;
  }, [fields]);

  const form = useForm({ resolver: zodResolver(schema), defaultValues, mode: 'onSubmit' });

  const submit = (values: Record<string, unknown>) => {
    const str = (name: string) => String(values[name] ?? '').trim();
    const candidate: Candidate = {
      salutation: lf.salutation ? String(values.salutation || 'Keine Angabe') : '',
      firstName: str('firstName'),
      lastName: str('lastName'),
      name: [str('firstName'), str('lastName')].filter(Boolean).join(' '),
      email: str('email'),
      phone: str('phone'),
      startDate: str('startDate'),
      message: str('message'),
      whatsappOptIn: values.whatsappOptIn === true,
    };
    onSubmit(candidate);
  };

  const optInLabel =
    lf.whatsappOptIn === true
      ? 'Benachrichtigungen über WhatsApp erhalten (optional)'
      : String(lf.whatsappOptIn || '');

  // Stagger by the field's position in the client's own field list, so the
  // delay is stable across re-renders.
  const delayFor = (field: LeadField) =>
    `${Math.min(Math.max(fields.indexOf(field), 0) * 50, 300)}ms`;

  const renderField = (field: LeadField) => (
    <FormField
      key={field.name}
      control={form.control}
      name={field.name}
      render={({ field: rhf }) => (
        <FormItem className="animate-fadeSlideUp" style={{ animationDelay: delayFor(field) }}>
          <FormLabel>
            {field.label}
            {field.required ? ' *' : ''}
          </FormLabel>
          <FormControl>
            {field.type === 'textarea' ? (
              <Textarea
                rows={4}
                placeholder={field.placeholder || ''}
                {...rhf}
                value={String(rhf.value ?? '')}
              />
            ) : field.type === 'checkbox' ? (
              <Checkbox
                checked={rhf.value === true}
                onCheckedChange={(v) => rhf.onChange(v === true)}
              />
            ) : (
              <Input
                type={field.type || 'text'}
                placeholder={field.placeholder || ''}
                autoComplete="off"
                {...rhf}
                value={String(rhf.value ?? '')}
              />
            )}
          </FormControl>
          {field.help && <FormDescription>{field.help}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <section>
      <h2 className="mb-1.5 text-[1.45rem] font-bold text-primary" tabIndex={-1} data-focus>
        {lf.heading || 'Deine Kontaktdaten'}
      </h2>
      <p className="mb-6 text-muted">
        {lf.subtitle || 'Bitte fülle alle Pflichtfelder aus, damit wir dich erreichen können.'}
      </p>

      <Form {...form}>
        <form className="flex flex-col gap-[18px]" noValidate onSubmit={form.handleSubmit(submit)}>
          {lf.salutation && (
            <FormField
              control={form.control}
              name="salutation"
              render={({ field: rhf }) => (
                <FormItem className="animate-fadeSlideUp">
                  <FormLabel>{lf.salutationLabel || 'Anrede'}</FormLabel>
                  <RadioGroup
                    className="flex flex-wrap gap-2.5"
                    value={String(rhf.value ?? 'Keine Angabe')}
                    onValueChange={rhf.onChange}
                  >
                    {SALUTATIONS.map((s) => (
                      <RadioGroupItem
                        key={s}
                        value={s}
                        className={cn(
                          'whitespace-nowrap rounded-full border border-border bg-white px-[18px] py-2.5 text-[15px] font-medium text-text transition-all duration-150',
                          'hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                          'data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-white'
                        )}
                      >
                        {s}
                      </RadioGroupItem>
                    ))}
                  </RadioGroup>
                </FormItem>
              )}
            />
          )}

          {rows.map((row, i) =>
            row.length === 2 ? (
              <div key={`row-${i}`} className="grid grid-cols-1 gap-3.5 min-[521px]:grid-cols-2">
                {row.map(renderField)}
              </div>
            ) : (
              renderField(row[0])
            )
          )}

          {lf.whatsappOptIn && (
            <FormField
              control={form.control}
              name="whatsappOptIn"
              render={({ field: rhf }) => (
                <FormItem className="animate-fadeSlideUp" style={{ animationDelay: '300ms' }}>
                  <label className="flex cursor-pointer items-center gap-2.5 text-[15px] font-medium text-text">
                    <Checkbox
                      checked={rhf.value === true}
                      onCheckedChange={(v) => rhf.onChange(v === true)}
                    />
                    <span>{optInLabel}</span>
                  </label>
                </FormItem>
              )}
            />
          )}

          <Button
            type="submit"
            size="block"
            className="mt-1.5 animate-fadeSlideUp py-4 text-[16.5px]"
            style={{ animationDelay: '350ms' }}
          >
            {lf.submitLabel || 'Bewerbung absenden ›'}
          </Button>
          <p
            className="animate-fadeSlideUp text-center text-[12.5px] text-muted"
            style={{ animationDelay: '400ms' }}
          >
            {lf.privacyNote ||
              'Deine Daten werden ausschließlich zur Bearbeitung deiner Bewerbung verwendet und gemäß DSGVO behandelt.'}
          </p>
        </form>
      </Form>
    </section>
  );
}
