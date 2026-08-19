import type { AnswerRecord, QuizConfig, QuizResult } from '@/lib/types';

export type Screen =
  'loading' | 'welcome' | 'question' | 'match' | 'rejection' | 'lead' | 'thank' | 'fatal';

export interface FatalInfo {
  /** Pre-authored copy from this module only — never user input. */
  message: string;
  hint?: 'dev-server';
  showBackLink?: boolean;
}

export interface QuizState {
  screen: Screen;
  config: QuizConfig | null;
  qIndex: number;
  answers: AnswerRecord[];
  /** The single evaluation of the completed quiz — routing and payload both read it. */
  result: QuizResult | null;
  fatal: FatalInfo | null;
}

export type QuizAction =
  | { type: 'config_loaded'; config: QuizConfig }
  | { type: 'fatal'; fatal: FatalInfo }
  | { type: 'start' }
  | { type: 'answered'; answers: AnswerRecord[] }
  | { type: 'completed'; answers: AnswerRecord[]; result: QuizResult }
  | { type: 'continue_to_lead' }
  | { type: 'submitted' };

export const initialState: QuizState = {
  screen: 'loading',
  config: null,
  qIndex: 0,
  answers: [],
  result: null,
  fatal: null,
};

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'config_loaded':
      return { ...state, config: action.config, screen: 'question', qIndex: 0 };
    case 'fatal':
      return { ...state, screen: 'fatal', fatal: action.fatal };
    case 'start':
      return { ...state, screen: 'question', qIndex: 0 };
    case 'answered':
      return { ...state, answers: action.answers, qIndex: state.qIndex + 1 };
    case 'completed':
      // Routing reads the stored evaluation; nothing recomputes scoring later.
      return {
        ...state,
        answers: action.answers,
        result: action.result,
        screen: action.result.passed ? 'match' : 'rejection',
      };
    case 'continue_to_lead':
      return { ...state, screen: 'lead' };
    case 'submitted':
      return { ...state, screen: 'thank' };
    default:
      return state;
  }
}

/** Replace an existing answer for the same question, else append. */
export function upsertAnswer(answers: AnswerRecord[], record: AnswerRecord): AnswerRecord[] {
  const index = answers.findIndex((a) => a.questionId === record.questionId);
  if (index < 0) return [...answers, record];
  const next = answers.slice();
  next[index] = record;
  return next;
}

/** 0 = quiz, 1 = contact details, 2 = done. Match/rejection stay in phase 0. */
export function currentPhase(screen: Screen): number {
  if (screen === 'thank') return 2;
  if (screen === 'lead') return 1;
  return 0;
}

export function progressPercent(state: QuizState): number {
  const total = state.config?.questions?.length ?? 0;
  if (currentPhase(state.screen) > 0) return 100;
  return total ? Math.min(Math.round((state.answers.length / total) * 100), 100) : 0;
}

export function progressText(state: QuizState): string {
  const total = state.config?.questions?.length ?? 0;
  if (currentPhase(state.screen) > 0) return 'Abgeschlossen';
  return `${Math.min(state.answers.length + 1, total)} von ${total} Fragen`;
}
