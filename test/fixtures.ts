import { readFileSync } from 'node:fs';
import path from 'node:path';
import { buildAnswerRecord, buildTextAnswerRecord } from '@/lib/answers';
import type { AnswerRecord, Candidate, PayloadMeta, Question, QuizConfig } from '@/lib/types';

/** Load a real shipped client config — the tests run against production data. */
export function loadQuiz(id: string): QuizConfig {
  const file = path.resolve(process.cwd(), 'quizzes', `${id}.json`);
  return JSON.parse(readFileSync(file, 'utf8')) as QuizConfig;
}

/**
 * Walk every question in a config and answer it, choosing each question's
 * selection via `pick`. Free-text questions get `text`.
 */
export function answerAll(
  config: QuizConfig,
  pick: (question: Question) => number[],
  text = 'Saarbrücken'
): AnswerRecord[] {
  return (config.questions || []).map((question) => {
    if (question.type === 'text_input') return buildTextAnswerRecord(question, text);
    return buildAnswerRecord(question, pick(question));
  });
}

/**
 * The strongest possible run: the highest-scoring option everywhere, and every
 * non-exclusive option on multi-selects.
 */
export function bestAnswers(config: QuizConfig): AnswerRecord[] {
  return answerAll(config, (question) => {
    const options = question.answers || [];
    if (question.type === 'multi_select') {
      return options.map((_, i) => i).filter((i) => !options[i].exclusive);
    }
    let best = 0;
    options.forEach((option, i) => {
      if ((option.points ?? 0) > (options[best].points ?? 0)) best = i;
    });
    return [best];
  });
}

/** Weakest possible run — trips knockouts and the reject threshold. */
export function worstAnswers(config: QuizConfig): AnswerRecord[] {
  return answerAll(config, (question) => {
    const options = question.answers || [];
    let worst = 0;
    options.forEach((option, i) => {
      if ((option.points ?? 0) < (options[worst].points ?? 0)) worst = i;
    });
    return [worst];
  });
}

/** The category a config's free-text question belongs to (both quizzes have one). */
export function textInputCategory(config: QuizConfig): string {
  const question = (config.questions || []).find((q) => q.type === 'text_input');
  if (!question) throw new Error('fixture expects a text_input question');
  return question.category;
}

export const testCandidate: Candidate = {
  salutation: 'Frau',
  firstName: 'Erika',
  lastName: 'Mustermann',
  name: 'Erika Mustermann',
  email: 'erika@beispiel.de',
  phone: '+49 123 456 7890',
  startDate: '2026-09-01',
  message: 'Ich freue mich auf ein Gespräch.',
  whatsappOptIn: true,
};

export const testMeta: PayloadMeta = {
  device: 'desktop',
  completionTimeSeconds: 142,
  referrer: 'https://example.test/stellenanzeige',
  userAgent: 'vitest',
};
