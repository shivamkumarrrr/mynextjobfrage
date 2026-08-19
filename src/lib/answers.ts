import type { AnswerRecord, Question } from './types';

/**
 * Turn a selection into the recorded answer.
 * This record IS the webhook payload's `answers[]` element, so its fields are
 * part of the external contract.
 */
export function buildAnswerRecord(question: Question, selectedIndices: number[]): AnswerRecord {
  const options = question.answers || [];
  const selected = options.filter((_, j) => selectedIndices.includes(j));
  let points: number;

  if (question.type === 'multi_select') {
    // An exclusive option ("Keinem") replaces the sum outright; otherwise the
    // summed points are capped at the question's maxPoints.
    const exclusive = options.find((a, j) => selectedIndices.includes(j) && a.exclusive);
    if (exclusive) points = exclusive.points || 0;
    else
      points = Math.min(
        selected.reduce((sum, a) => sum + (a.points || 0), 0),
        question.maxPoints ?? 100
      );
  } else {
    points = selected[0]?.points || 0;
  }

  const record: AnswerRecord = {
    questionId: question.id,
    questionText: question.question,
    answer:
      question.type === 'multi_select'
        ? selected.map((a) => a.text).join(', ')
        : selected[0]?.text || '',
    answerIndex: question.type === 'multi_select' ? selectedIndices : selectedIndices[0],
    points,
    category: question.category,
  };

  if (typeof question.correctAnswer === 'number' && question.type === 'single_select') {
    record.isCorrect = selectedIndices[0] === question.correctAnswer;
  }

  return record;
}

/** Free-text answers are unscored: `points: null`, `answerIndex: null`. */
export function buildTextAnswerRecord(question: Question, text: string): AnswerRecord {
  return {
    questionId: question.id,
    questionText: question.question,
    answer: text,
    answerIndex: null,
    points: null,
    category: question.category,
  };
}
