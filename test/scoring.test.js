import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeScoring, evaluateKnockouts } from '../src/scoring.js';

const config = {
  quizVersion: '1.0',
  categories: {
    hardSkills: { label: 'Fachliche Kompetenz', weight: 0.40 },
    knowledgeTests: { label: 'Fachwissen', weight: 0.25 },
    domainExpertise: { label: 'Domänen-Expertise', weight: 0.20 },
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
    { id: 'q_google_ads', category: 'hardSkills', type: 'single_select', answers: [] },
    { id: 'q_meta_ads', category: 'hardSkills', type: 'single_select', answers: [] },
    { id: 'q_deutsch', category: 'fitPreferences', type: 'single_select', answers: [] },
    { id: 'q_english', category: 'fitPreferences', type: 'single_select', answers: [] },
    { id: 'q_cpl_test', category: 'knowledgeTests', type: 'single_select', answers: [] },
    { id: 'q_roas_test', category: 'knowledgeTests', type: 'single_select', answers: [] },
    { id: 'q_funnels', category: 'domainExpertise', type: 'single_select', answers: [] },
    { id: 'q_ecommerce', category: 'domainExpertise', type: 'single_select', answers: [] },
  ],
};

const byId = (answers) =>
  Object.fromEntries(answers.map((a) => [a.questionId, { questionId: a.questionId, points: a.points, answerIndex: a.answerIndex }]));

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
  assert.equal(s.total, Math.round(expected * 10) / 10);
  assert.equal(s.categories.hardSkills.score, 72.5);
  assert.equal(s.categories.knowledgeTests.score, 100);
  assert.equal(s.categories.hardSkills.weighted, 29);
  assert.equal(s.tier.id, 'strong');
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
  assert.equal(s.total, 0);
  assert.equal(s.tier.id, 'low');
});

test('unanswered questions score as zero without throwing', () => {
  const s = computeScoring(config, {});
  assert.equal(s.total, 0);
  assert.equal(s.tier.id, 'low');
});

test('simple knockout triggers when index is in answerIndex list', () => {
  const flags = evaluateKnockouts(config, byId([
    { questionId: 'q_deutsch', points: 0, answerIndex: 1 },
  ]));
  const deutsch = flags.find((f) => f.id === 'deutsch_below_c1');
  assert.equal(deutsch.triggered, true);
});

test('simple knockout stays false for a good answer', () => {
  const flags = evaluateKnockouts(config, byId([
    { questionId: 'q_deutsch', points: 100, answerIndex: 3 },
  ]));
  assert.equal(flags.find((f) => f.id === 'deutsch_below_c1').triggered, false);
});

test('AND knockout requires all sub-rules to match', () => {
  const onlyGoogle = evaluateKnockouts(config, byId([
    { questionId: 'q_google_ads', points: 0, answerIndex: 0 },
    { questionId: 'q_meta_ads', points: 40, answerIndex: 1 },
  ]));
  assert.equal(onlyGoogle.find((f) => f.id === 'zero_paid_experience').triggered, false);

  const both = evaluateKnockouts(config, byId([
    { questionId: 'q_google_ads', points: 0, answerIndex: 0 },
    { questionId: 'q_meta_ads', points: 0, answerIndex: 0 },
  ]));
  assert.equal(both.find((f) => f.id === 'zero_paid_experience').triggered, true);
});

test('OR knockout triggers when any sub-rule matches', () => {
  const one = evaluateKnockouts(config, byId([
    { questionId: 'q_google_ads', points: 0, answerIndex: 0 },
    { questionId: 'q_meta_ads', points: 60, answerIndex: 2 },
  ]));
  assert.equal(one.find((f) => f.id === 'no_experience').triggered, true);

  const none = evaluateKnockouts(config, byId([
    { questionId: 'q_google_ads', points: 40, answerIndex: 1 },
    { questionId: 'q_meta_ads', points: 60, answerIndex: 2 },
  ]));
  assert.equal(none.find((f) => f.id === 'no_experience').triggered, false);
});
