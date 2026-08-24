import { useMemo, useRef, useState } from 'react';
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
import type { Candidate, FileAttachment, LeadField, QuizConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

const SALUTATIONS = ['Herr', 'Frau', 'Keine Angabe'] as const;
const EMAIL_RE = /^\S+@\S+\.\S+$/;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_CERTIFICATE_FILES = 5;
const CV_ACCEPT = '.pdf,.doc,.docx';
const CERTIFICATES_ACCEPT = '.pdf,.doc,.docx,.jpg,.jpeg,.png';

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Reads a File into a base64 payload, stripping the `data:...;base64,` prefix. */
function readFileAsAttachment(file: File): Promise<FileAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.slice(result.indexOf(',') + 1);
      resolve({
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        data: base64,
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const uploadIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path d="M12 15V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const fileIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    className="h-4 w-4 shrink-0"
    aria-hidden="true"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
    <path d="M14 2v6h6" strokeLinejoin="round" />
  </svg>
);

interface FileUploadFieldProps {
  label: string;
  help?: string;
  accept: string;
  multiple?: boolean;
  files: FileAttachment[];
  error: string | null;
  onAdd: (files: FileList) => void;
  onRemove: (index: number) => void;
}

function FileUploadField({
  label,
  help,
  accept,
  multiple,
  files,
  error,
  onAdd,
  onRemove,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="animate-fadeSlideUp">
      <label className="mb-1.5 block text-[15px] font-semibold text-text">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length) onAdd(e.target.files);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center gap-2.5 rounded-brand-sm border border-dashed border-border bg-white px-3.5 py-3 text-[15px] font-medium text-muted transition-colors duration-150 hover:border-accent hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {uploadIcon}
        Datei auswählen
      </button>
      {help && <p className="mt-1.5 text-[13px] text-muted">{help}</p>}
      {error && <p className="mt-1.5 text-[13px] font-medium text-danger">{error}</p>}
      {files.length > 0 && (
        <ul className="mt-2.5 flex flex-col gap-1.5">
          {files.map((f, i) => (
            <li
              key={`${f.filename}-${i}`}
              className="flex items-center gap-2 rounded-brand-sm bg-surface px-3 py-2 text-[14px] text-text"
            >
              {fileIcon}
              <span className="min-w-0 flex-1 truncate">{f.filename}</span>
              <span className="shrink-0 text-muted">{formatFileSize(f.sizeBytes)}</span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label={`${f.filename} entfernen`}
                className="shrink-0 text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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
function buildSchema(fields: LeadField[], optInRequired: boolean) {
  const shape: Record<string, z.ZodTypeAny> = {
    salutation: z.string().optional(),
    whatsappOptIn: optInRequired
      ? z.boolean().refine((v) => v === true, { message: 'Bitte bestätige die Zustimmung' })
      : z.boolean().optional(),
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
  // Lead only renders on the passed path (rejection routes elsewhere), so the
  // match headline is shown here — as a compact banner, not its own screen.
  const matchHeadline = (config.scoring && config.scoring.matchScreen?.headline) || 'Volltreffer!';
  const fields = useMemo(() => lf.fields || [], [lf.fields]);
  const rows = useMemo(() => buildFieldRows(fields), [fields]);
  const schema = useMemo(
    () => buildSchema(fields, Boolean(lf.whatsappOptIn)),
    [fields, lf.whatsappOptIn]
  );

  const defaultValues = useMemo(() => {
    const values: Record<string, string | boolean> = {
      salutation: 'Keine Angabe',
      whatsappOptIn: false,
    };
    for (const f of fields) values[f.name] = f.type === 'checkbox' ? false : '';
    return values;
  }, [fields]);

  const form = useForm({ resolver: zodResolver(schema), defaultValues, mode: 'onSubmit' });

  const [cvFile, setCvFile] = useState<FileAttachment | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const [certFiles, setCertFiles] = useState<FileAttachment[]>([]);
  const [certError, setCertError] = useState<string | null>(null);

  const handleCvAdd = async (fileList: FileList) => {
    const file = fileList[0];
    if (file.size > MAX_FILE_BYTES) {
      setCvError('Datei ist zu groß (max. 8 MB).');
      return;
    }
    setCvError(null);
    setCvFile(await readFileAsAttachment(file));
  };

  const handleCertAdd = async (fileList: FileList) => {
    const incoming = Array.from(fileList);
    const tooBig = incoming.find((f) => f.size > MAX_FILE_BYTES);
    if (tooBig) {
      setCertError(`"${tooBig.name}" ist zu groß (max. 8 MB).`);
      return;
    }
    if (certFiles.length + incoming.length > MAX_CERTIFICATE_FILES) {
      setCertError(`Maximal ${MAX_CERTIFICATE_FILES} Dateien möglich.`);
      return;
    }
    setCertError(null);
    const attachments = await Promise.all(incoming.map(readFileAsAttachment));
    setCertFiles((prev) => [...prev, ...attachments]);
  };

  const cvRequired = lf.cvUpload !== false;

  const submit = (values: Record<string, unknown>) => {
    if (cvRequired && !cvFile) {
      setCvError('Bitte lade deinen Lebenslauf hoch.');
      return;
    }
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
      cv: cvFile,
      certificates: certFiles,
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
      <div className="mb-3 flex animate-fadeSlideUp items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-white">
          <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3 w-3">
            <path
              d="M3.5 8.5l3 3 6-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-accent-deep">
          {matchHeadline}
        </span>
      </div>
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

          {cvRequired && (
            <FileUploadField
              label="Lebenslauf *"
              help="PDF oder Word, max. 8 MB"
              accept={CV_ACCEPT}
              files={cvFile ? [cvFile] : []}
              error={cvError}
              onAdd={handleCvAdd}
              onRemove={() => setCvFile(null)}
            />
          )}

          {lf.certificatesUpload !== false && (
            <FileUploadField
              label="Zertifikate (optional)"
              help="PDF, Word oder Bilder, max. 8 MB pro Datei"
              accept={CERTIFICATES_ACCEPT}
              multiple
              files={certFiles}
              error={certError}
              onAdd={handleCertAdd}
              onRemove={(i) => setCertFiles((prev) => prev.filter((_, idx) => idx !== i))}
            />
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
