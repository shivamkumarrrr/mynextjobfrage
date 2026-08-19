import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { buildAnswerRecord, buildTextAnswerRecord } from '@/lib/answers';
import type { AnswerRecord, Question as QuestionConfig, QuizConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

const AUTO_ADVANCE_MS = 280;

const optionCard =
  'flex w-full items-center gap-3.5 rounded-brand border border-border bg-card px-4 py-[15px] text-left text-base text-text transition-[border-color,background-color,transform] duration-150 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 hover:border-primary hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] data-[state=checked]:border-accent data-[state=checked]:bg-card-selected';

interface QuestionProps {
  config: QuizConfig;
  question: QuestionConfig;
  index: number;
  total: number;
  onAnswer: (record: AnswerRecord) => void;
}

export function Question({ config, question, index, total, onAnswer }: QuestionProps) {
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
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const kicker = isText
    ? 'Freitext'
    : isMulti
      ? 'Mehrfachauswahl'
      : `Frage ${index + 1} von ${total}`;

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
    <section className="animate-screenIn">
      <p className="mb-3.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">
        {kicker}
      </p>
      <h2
        className="mb-[22px] text-[clamp(1.3rem,3.5vw,1.5rem)] font-bold leading-snug text-primary"
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
            onClick={() =>
              onAnswer(buildTextAnswerRecord(question, text.trim()))
            }
          >
            {continueLabel}
          </Button>
        </div>
      ) : isMulti ? (
        <>
          <div className="flex flex-col gap-2.5">
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
          <div className="mt-[18px]">
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
        <RadioGroup value={single ?? ''} onValueChange={selectSingle} aria-label={question.question}>
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
                  'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 bg-white transition-all duration-150',
                  single === String(j) ? 'border-accent' : 'border-[#cbd2d8]'
                )}
              >
                <Check
                  className={cn(
                    'h-3 w-3 text-accent transition-transform duration-150',
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

      {question.hint && <p className="mt-3.5 text-sm text-muted">{question.hint}</p>}
    </section>
  );
}
