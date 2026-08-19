import { describe, expect, test } from 'vitest';
import { computeScoring as legacyComputeScoring } from '../legacy/src/scoring.js';
import { computeScoring, evaluateKnockouts, evaluateQuiz } from '@/lib/scoring';
import type { AnswerRecord, QuizConfig } from '@/lib/types';
import { bestAnswers, loadQuiz, textInputCategory, worstAnswers } from './fixtures';

const config: QuizConfig = {
  quizVersion: '1.0',
  categories: {
    hardSkills: { label: 'Fachliche Kompetenz', weight: 0.4 },
    knowledgeTests: { label: 'Fachwissen', weight: 0.25 },
    domainExpertise: { label: 'Domänen-Expertise', weight: 0.2 },
    fitPreferences: { label: 'Passung & Präferenzen', weight: 0.15 },
  },
  tiers: [
    { id: 'top', label: 'Top-Kandidat', min: 85 },
    { id: 'strong', label: 'Starker Fit', min: 70 },
    { id: 'potential', label: 'Potential', min: 50 },
    { id: 'low', label: 'Nicht passend', min: 0 },
  ],
  knockoutFlags: [
    {
      id: 'deutsch_below_c1',
      description: 'Deutsch unter Verhandlungsniveau',
      rules: { questionId: 'q_deutsch', answerIndex: [0, 1] },
    },
    {
      id: 'zero_paid_experience',
      description: 'Keine Google/Meta Ads Erfahrung',
      rules: {
        type: 'AND',
        rules: [
          { questionId: 'q_google_ads', answerIndex: [0] },
          { questionId: 'q_meta_ads', answerIndex: [0] },
        ],
      },
    },
    {
      id: 'no_experience',
      description: 'Keine Berufserfahrung',
      rules: {
        type: 'OR',
        rules: [
          { questionId: 'q_google_ads', answerIndex: [0] },
          { questionId: 'q_meta_ads', answerIndex: [0] },
        ],
      },
    },
  ],
  questions: [
    { id: 'q_google_ads', category: 'hardSkills', type: 'single_select', question: '', answers: [] },
    { id: 'q_meta_ads', category: 'hardSkills', type: 'single_select', question: '', answers: [] },
    { id: 'q_deutsch', category: 'fitPreferences', type: 'single_select', question: '', answers: [] },
    { id: 'q_english', category: 'fitPreferences', type: 'single_select', question: '', answers: [] },
    {
      id: 'q_cpl_test',
      category: 'knowledgeTests',
      type: 'single_select',
      question: '',
      answers: [],
    },
    {
      id: 'q_roas_test',
      category: 'knowledgeTests',
      type: 'single_select',
      question: '',
      answers: [],
    },
    {
      id: 'q_funnels',
      category: 'domainExpertise',
      type: 'single_select',
      question: '',
      answers: [],
    },
    {
      id: 'q_ecommerce',
      category: 'domainExpertise',
      type: 'single_select',
      question: '',
      answers: [],
    },
  ],
};

const byId = (
  answers: { questionId: string; points: number | null; answerIndex: number | number[] | null }[]
) =>
  Object.fromEntries(
    answers.map((a) => [
      a.questionId,
      {
        questionId: a.questionId,
        questionText: '',
        answer: '',
        category: '',
        points: a.points,
        answerIndex: a.answerIndex,
      } as AnswerRecord,
    ])
  );

describe('computeScoring', () => {
  test('total is sum of category averages times weights', () => {
    const answers = byId([
      { questionId: 'q_google_ads', points: 85, answerIndex: 3 },
      { questionId: 'q_meta_ads', points: 60, answerIndex: 2 },
      { questionId: 'q_deutsch', points: 100, answerIndex: 3 },
      { questionId: 'q_english', points: 80, answerIndex: 2 },
      { questionId: 'q_cpl_test', points: 100, answerIndex: 3 },
      { questionId: 'q_roas_test', points: 100, answerIndex: 1 },
      { questionId: 'q_funnels', points: 100, answerIndex: 0 },
      { questionId: 'q_ecommerce', points: 40, answerIndex: 2 },
    ]);

    const s = computeScoring(config, answers);
    // hardSkills avg (85+60)/2=72.5, knowledge avg 100, domain avg 70, fit avg 90
    const expected = 72.5 * 0.4 + 100 * 0.25 + 70 * 0.2 + 90 * 0.15;
    expect(s.total).toBe(Math.round(expected * 10) / 10);
    expect(s.categories.hardSkills.score).toBe(72.5);
    expect(s.categories.knowledgeTests.score).toBe(100);
    expect(s.categories.hardSkills.weighted).toBe(29);
    expect(s.tier?.id).toBe('strong');
  });

  test('tier falls to lowest bucket when total is low', () => {
    const answers = byId([
      { questionId: 'q_google_ads', points: 0, answerIndex: 0 },
      { questionId: 'q_meta_ads', points: 0, answerIndex: 0 },
      { questionId: 'q_deutsch', points: 0, answerIndex: 0 },
      { questionId: 'q_english', points: 0, answerIndex: 0 },
      { questionId: 'q_cpl_test', points: 0, answerIndex: 0 },
      { questionId: 'q_roas_test', points: 0, answerIndex: 0 },
      { questionId: 'q_funnels', points: 0, answerIndex: 0 },
      { questionId: 'q_ecommerce', points: 0, answerIndex: 0 },
    ]);
    const s = computeScoring(config, answers);
    expect(s.total).toBe(0);
    expect(s.tier?.id).toBe('low');
  });

  test('unanswered questions score as zero without throwing', () => {
    const s = computeScoring(config, {});
    expect(s.total).toBe(0);
    expect(s.tier?.id).toBe('low');
  });
});

describe('knockout evaluation', () => {
  test('simple knockout triggers when index is in answerIndex list', () => {
    const flags = evaluateKnockouts(
      config,
      byId([{ questionId: 'q_deutsch', points: 0, answerIndex: 1 }])
    );
    expect(flags.find((f) => f.id === 'deutsch_below_c1')?.triggered).toBe(true);
  });

  test('simple knockout stays false for a good answer', () => {
    const flags = evaluateKnockouts(
      config,
      byId([{ questionId: 'q_deutsch', points: 100, answerIndex: 3 }])
    );
    expect(flags.find((f) => f.id === 'deutsch_below_c1')?.triggered).toBe(false);
  });

  test('AND knockout requires all sub-rules to match', () => {
    const onlyGoogle = evaluateKnockouts(
      config,
      byId([
        { questionId: 'q_google_ads', points: 0, answerIndex: 0 },
        { questionId: 'q_meta_ads', points: 40, answerIndex: 1 },
      ])
    );
    expect(onlyGoogle.find((f) => f.id === 'zero_paid_experience')?.triggered).toBe(false);

    const both = evaluateKnockouts(
      config,
      byId([
        { questionId: 'q_google_ads', points: 0, answerIndex: 0 },
        { questionId: 'q_meta_ads', points: 0, answerIndex: 0 },
      ])
    );
    expect(both.find((f) => f.id === 'zero_paid_experience')?.triggered).toBe(true);
  });

  test('OR knockout triggers when any sub-rule matches', () => {
    const one = evaluateKnockouts(
      config,
      byId([
        { questionId: 'q_google_ads', points: 0, answerIndex: 0 },
        { questionId: 'q_meta_ads', points: 60, answerIndex: 2 },
      ])
    );
    expect(one.find((f) => f.id === 'no_experience')?.triggered).toBe(true);

    const none = evaluateKnockouts(
      config,
      byId([
        { questionId: 'q_google_ads', points: 40, answerIndex: 1 },
        { questionId: 'q_meta_ads', points: 60, answerIndex: 2 },
      ])
    );
    expect(none.find((f) => f.id === 'no_experience')?.triggered).toBe(false);
  });
});

describe('unscored questions stay out of the category average', () => {
  const withText: QuizConfig = {
    ...config,
    categories: { fitPreferences: { label: 'Passung', weight: 1 } },
    questions: [
      {
        id: 'q_deutsch',
        category: 'fitPreferences',
        type: 'single_select',
        question: '',
        answers: [],
      },
      {
        id: 'q_location',
        category: 'fitPreferences',
        type: 'text_input',
        question: '',
        points: null,
      },
    ],
  };

  test('a free-text answer does not halve a scored category', () => {
    const answers = byId([
      { questionId: 'q_deutsch', points: 100, answerIndex: 3 },
      { questionId: 'q_location', points: null, answerIndex: null },
    ]);
    const s = computeScoring(withText, answers);
    // Pre-migration this averaged (100 + 0) / 2 = 50.
    expect(s.categories.fitPreferences.score).toBe(100);
    expect(s.total).toBe(100);
  });

  test('an unanswered free-text question is excluded too', () => {
    const answers = byId([{ questionId: 'q_deutsch', points: 100, answerIndex: 3 }]);
    expect(computeScoring(withText, answers).total).toBe(100);
  });

  test('an unanswered scored question still counts as zero', () => {
    const answers = byId([{ questionId: 'q_location', points: null, answerIndex: null }]);
    expect(computeScoring(withText, answers).total).toBe(0);
  });

  for (const quizId of ['ppc-performance-marketing', 'moebel-verkauf']) {
    test(`${quizId}: the free-text question no longer drags its own category down`, () => {
      const quiz = loadQuiz(quizId);
      const category = textInputCategory(quiz);
      const result = evaluateQuiz(quiz, bestAnswers(quiz));

      // Both shipped quizzes park `q_location` (points: null) inside a scored
      // category; answering every scored question there perfectly must read 100.
      expect(result.scoring.categories[category].score).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.rejectionReason).toBeNull();
    });

    test(`${quizId}: scores strictly higher than the pre-migration implementation`, () => {
      const quiz = loadQuiz(quizId);
      const category = textInputCategory(quiz);
      const answers = bestAnswers(quiz);
      const answersById = Object.fromEntries(answers.map((a) => [a.questionId, a]));

      const fixed = computeScoring(quiz, answersById);
      // Untyped JS module — describe only what this test reads off it.
      const legacy = legacyComputeScoring(quiz, answersById) as {
        total: number;
        categories: Record<string, { score: number }>;
      };

      expect(legacy.categories[category].score).toBeLessThan(100);
      expect(fixed.categories[category].score).toBe(100);
      expect(fixed.total).toBeGreaterThan(legacy.total);
      // Nothing else moved: the other categories are untouched by the fix.
      for (const id of Object.keys(fixed.categories)) {
        if (id === category) continue;
        expect(fixed.categories[id]).toEqual(legacy.categories[id]);
      }
    });
  }
});

describe('evaluateQuiz routing', () => {
  test('a worst-case run is rejected with a knockout reason', () => {
    const quiz = loadQuiz('ppc-performance-marketing');
    const result = evaluateQuiz(quiz, worstAnswers(quiz));
    expect(result.passed).toBe(false);
    expect(result.scoring.hasKnockout).toBe(true);
    expect(result.rejectionReason).toBe('knockout:deutsch_below_c1');
  });

  test('knockout reason wins over a low score', () => {
    const quiz = loadQuiz('moebel-verkauf');
    const result = evaluateQuiz(quiz, worstAnswers(quiz));
    expect(result.passed).toBe(false);
    expect(result.rejectionReason).toBe('knockout:samstag_impossible');
  });

  test('a clean run below the threshold is rejected on score alone', () => {
    const quiz = loadQuiz('moebel-verkauf');
    // Deliberately avoid the Saturday knockout (index 3 on q_samstag) while
    // answering everything else as weakly as possible.
    const answers = worstAnswers(quiz).map((answer) =>
      answer.questionId === 'q_samstag'
        ? { ...answer, answerIndex: 2, points: 30 }
        : answer
    );
    const result = evaluateQuiz(quiz, answers);
    expect(result.scoring.hasKnockout).toBe(false);
    expect(result.passed).toBe(false);
    expect(result.rejectionReason).toBe('score_below_threshold');
  });
});
