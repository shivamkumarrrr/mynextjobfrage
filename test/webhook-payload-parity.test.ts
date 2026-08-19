import { describe, expect, test } from 'vitest';
import { buildPayload as legacyBuildPayload } from '../legacy/src/webhook.js';
import { evaluateQuiz } from '@/lib/scoring';
import type { AnswerRecord, Candidate, QuizConfig } from '@/lib/types';
import { buildPayload } from '@/lib/webhook';
import { bestAnswers, loadQuiz, testCandidate, testMeta, worstAnswers } from './fixtures';

/**
 * The webhook JSON is an external integration contract — a CRM/automation
 * already consumes it. These tests pin the ported `buildPayload()` against the
 * pre-migration implementation kept in `legacy/src/webhook.js`: identical keys,
 * identical nesting, identical field names, identical key ORDER.
 *
 * Values are deliberately not compared wholesale — the scoring bugfix changes
 * numbers (see the explicit assertions at the bottom), never the shape.
 */

/** Reduce a value to its structure: keys + order preserved, leaves as type names. */
function shapeOf(value: unknown): unknown {
  if (value === null) return 'null';
  if (Array.isArray(value)) return value.map(shapeOf);
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      out[key] = shapeOf((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return typeof value;
}

/** JSON.stringify keeps insertion order, so this compares names AND ordering. */
const signature = (value: unknown) => JSON.stringify(shapeOf(value));

/** Exactly how the pre-migration quiz.js assembled a payload. */
function legacyPayload(
  config: QuizConfig,
  quizId: string,
  candidate: Candidate | null,
  answers: AnswerRecord[],
  passed: boolean,
  rejectionReason: string | null
) {
  // The legacy module is untyped JS; its return is shaped by JSDoc only.
  const payload = legacyBuildPayload(config, {
    quizId,
    candidate,
    answers,
    meta: testMeta,
  }) as Record<string, unknown> & { scoring: { total: number }; answers: AnswerRecord[] };
  payload.result = { passed, rejected: !passed, rejectionReason };
  return payload;
}

describe.each(['ppc-performance-marketing', 'moebel-verkauf'])('%s payload parity', (quizId) => {
  const config = loadQuiz(quizId);

  test('accepted candidate: identical payload shape', () => {
    const answers = bestAnswers(config);
    const result = evaluateQuiz(config, answers);
    expect(result.passed).toBe(true);

    const ported = buildPayload(config, {
      quizId,
      candidate: testCandidate,
      answers,
      meta: testMeta,
      result,
    });
    const legacy = legacyPayload(config, quizId, testCandidate, answers, true, null);

    expect(signature(ported)).toBe(signature(legacy));
  });

  test('rejected candidate: identical payload shape, candidate null', () => {
    const answers = worstAnswers(config);
    const result = evaluateQuiz(config, answers);
    expect(result.passed).toBe(false);

    const ported = buildPayload(config, {
      quizId,
      candidate: null,
      answers,
      meta: testMeta,
      result,
    });
    const legacy = legacyPayload(
      config,
      quizId,
      null,
      answers,
      false,
      result.rejectionReason
    );

    expect(signature(ported)).toBe(signature(legacy));
    expect(ported.candidate).toBeNull();
    expect(ported.result).toEqual({
      passed: false,
      rejected: true,
      rejectionReason: result.rejectionReason,
    });
  });

  test('top-level keys keep their exact names and order', () => {
    const answers = bestAnswers(config);
    const ported = buildPayload(config, {
      quizId,
      candidate: testCandidate,
      answers,
      meta: testMeta,
      result: evaluateQuiz(config, answers),
    });

    expect(Object.keys(ported)).toEqual([
      'quizId',
      'quizVersion',
      'timestamp',
      'candidate',
      'scoring',
      'knockoutFlags',
      'answers',
      'meta',
      'result',
    ]);
  });

  test('answers[] are ordered by the config, with legacy field names', () => {
    const answers = bestAnswers(config);
    const ported = buildPayload(config, {
      quizId,
      candidate: testCandidate,
      answers,
      meta: testMeta,
      result: evaluateQuiz(config, answers),
    });
    const legacy = legacyPayload(config, quizId, testCandidate, answers, true, null);

    // The answers array carries no scoring aggregation, so it must match by value too.
    expect(ported.answers).toEqual(legacy.answers);
    expect(ported.answers.map((a) => a.questionId)).toEqual(
      (config.questions || []).map((q) => q.id)
    );
  });

  test('knockoutFlags keep {id, description, triggered}', () => {
    const answers = worstAnswers(config);
    const ported = buildPayload(config, {
      quizId,
      candidate: null,
      answers,
      meta: testMeta,
      result: evaluateQuiz(config, answers),
    });
    for (const flag of ported.knockoutFlags) {
      expect(Object.keys(flag)).toEqual(['id', 'description', 'triggered']);
    }
  });
});

describe('the one intentional value difference', () => {
  test('scoring.total is higher than legacy because free-text no longer scores 0', () => {
    const config = loadQuiz('ppc-performance-marketing');
    const answers = bestAnswers(config);
    const result = evaluateQuiz(config, answers);
    const legacy = legacyPayload(config, 'ppc-performance-marketing', null, answers, true, null);

    // The pre-migration bug: q_location (points: null) sat in fitPreferences'
    // denominator and pulled every run down. Same answers, higher total now.
    expect(result.scoring.total).toBeGreaterThan(legacy.scoring.total);
    expect(Object.keys(result.scoring)).toEqual(Object.keys(legacy.scoring));
  });
});
