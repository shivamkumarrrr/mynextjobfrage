import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { buildAnswerRecord, buildTextAnswerRecord } from '@/lib/answers';
import type { AnswerRecord, Question as QuestionConfig, QuizConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

const AUTO_ADVANCE_MS = 280;

const optionCard =
  'group flex w-full items-center gap-4 rounded-[14px] border border-border bg-card px-4 py-4 text-left text-[15.5px] text-text shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-[border-color,background-color,box-shadow,transform] duration-150 hover:-translate-y-px hover:border-accent hover:shadow-[0_8px_20px_-12px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:translate-y-0 data-[state=checked]:border-accent data-[state=checked]:bg-card-selected data-[state=checked]:shadow-[0_8px_20px_-14px_rgba(0,0,0,0.4)]';

interface QuestionProps {
  config: QuizConfig;
  question: QuestionConfig;
  /** "Frage 5 von 16" — the same string the shell shows, so the two never drift. */
  positionLabel: string;
  onAnswer: (record: AnswerRecord) => void;
}

export function Question({ config, question, positionLabel, onAnswer }: QuestionProps) {
  const isMulti = question.type === 'multi_select';
  const isText = question.type === 'text_input';
  const options = question.answers || [];

  const [single, setSingle] = useState<string | null>(null);
  const [multi, setMulti] = useState<number[]>([]);
  const [text, setText] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Any pending auto-advance dies with the question it belongs to; the parent
  // remounts this component per question (keyed by id), so a stale timer can
  // never fire into the next one.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const selectSingle = (value: string) => {
    setSingle(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(
      () => onAnswer(buildAnswerRecord(question, [Number(value)])),
      AUTO_ADVANCE_MS
    );
  };

  const toggleMulti = (idx: number, checked: boolean) => {
    const option = options[idx];
    setMulti((prev) => {
      if (!checked) return prev.filter((i) => i !== idx);
      // An exclusive option ("Keinem") clears everything else, and picking any
      // normal option clears the exclusive one.
      if (option.exclusive) return [idx];
      return [...prev.filter((i) => !options[i]?.exclusive), idx].sort((a, b) => a - b);
    });
  };

  const continueLabel = config.continueLabel || 'Weiter';

  return (
    <section>
      {question.image && (
        <div className="mb-6 overflow-hidden rounded-[18px] bg-surface shadow-[0_10px_30px_-24px_rgba(0,0,0,0.45)]">
          <ImageWithFallback
            src={question.image}
            alt=""
            fallbackLabel="Bild"
            loading="lazy"
            className="block aspect-video w-full object-cover"
            fallbackClassName="aspect-video"
          />
        </div>
      )}
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-deep">
        {positionLabel}
      </p>
      <h2
        className="mb-6 font-display text-[clamp(1.35rem,3.5vw,1.7rem)] font-bold leading-[1.2] tracking-[-0.02em] text-primary"
        tabIndex={-1}
        data-focus
      >
        {question.question}
      </h2>

      {isText ? (
        <div className="flex flex-col gap-3.5">
          <Input
            autoFocus
            value={text}
            placeholder={question.placeholder || ''}
            className="rounded-brand px-4 py-3.5"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && text.trim()) {
                e.preventDefault();
                onAnswer(buildTextAnswerRecord(question, text.trim()));
              }
            }}
          />
          <Button
            type="button"
            size="block"
            disabled={!text.trim()}
            onClick={() => onAnswer(buildTextAnswerRecord(question, text.trim()))}
          >
            {continueLabel}
          </Button>
        </div>
      ) : isMulti ? (
        <>
          <div className="flex flex-col gap-3">
            {options.map((option, j) => {
              const checked = multi.includes(j);
              return (
                <label
                  key={option.text}
                  data-state={checked ? 'checked' : 'unchecked'}
                  className={cn(optionCard, 'animate-answerIn cursor-pointer')}
                  style={{ animationDelay: `${Math.min(j * 55, 440)}ms` }}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) => toggleMulti(j, value === true)}
                  />
                  <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{option.text}</span>
                </label>
              );
            })}
          </div>
          <div className="mt-5">
            <Button
              type="button"
              disabled={multi.length === 0}
              onClick={() => onAnswer(buildAnswerRecord(question, multi))}
            >
              {continueLabel}
            </Button>
          </div>
        </>
      ) : (
        <RadioGroup
          value={single ?? ''}
          onValueChange={selectSingle}
          aria-label={question.question}
        >
          {options.map((option, j) => (
            <RadioGroupItem
              key={option.text}
              value={String(j)}
              className={cn(optionCard, 'animate-answerIn')}
              style={{ animationDelay: `${Math.min(j * 55, 440)}ms` }}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full border-2 bg-white transition-all duration-150',
                  single === String(j)
                    ? 'border-accent bg-accent'
                    : 'border-[#cbd2d8] group-hover:border-accent'
                )}
              >
                <Check
                  className={cn(
                    'h-3.5 w-3.5 text-white transition-transform duration-150',
                    single === String(j) ? 'scale-100' : 'scale-0'
                  )}
                  strokeWidth={3.5}
                />
              </span>
              <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{option.text}</span>
            </RadioGroupItem>
          ))}
        </RadioGroup>
      )}

      {question.hint && <p className="mt-4 text-sm text-muted">{question.hint}</p>}
    </section>
  );
}
