import type {
  AnswerRecord,
  KnockoutFlagResult,
  KnockoutRule,
  QuizConfig,
  QuizResult,
  Scoring,
} from './types';

export type AnswersById = Record<string, AnswerRecord>;

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Weighted category scoring.
 * Each question belongs to one category. Each answered question carries
 * 0-100 points (already computed by the renderer at answer time).
 *
 *   Score per category = average of all *scored* question scores in that category
 *   Total              = Σ (category_avg × category_weight)
 *   Tier               = first matching tier where total >= tier.min
 *
 * Unscored questions (`text_input`, or any question whose recorded points are
 * null) are excluded from both numerator and denominator. The pre-migration
 * implementation left them in the denominator, so a free-text question sitting
 * inside a scored category silently dragged that category's average down —
 * both shipped quizzes have exactly that (`q_location`).
 * An unanswered *scored* question still counts as 0, unchanged.
 */
export function computeScoring(config: QuizConfig, answersById: AnswersById): Scoring {
  const categories = config.categories || {};
  const questions = config.questions || [];
  const perCategory: Record<string, number> = {};

  for (const catId of Object.keys(categories)) {
    const scores = questions
      .filter((q) => q.category === catId)
      .map((q) => {
        const answer = answersById[q.id];
        if (answer) return answer.points;
        // Never answered: unscored question types stay out of the average,
        // a scored one counts as zero.
        return q.type === 'text_input' || q.points === null ? null : 0;
      })
      .filter((points): points is number => typeof points === 'number');

    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    perCategory[catId] = round1(avg);
  }

  let total = 0;
  for (const catId of Object.keys(categories)) {
    total += perCategory[catId] * categories[catId].weight;
  }
  total = round1(total);

  const tiers = (config.tiers || []).slice().sort((a, b) => b.min - a.min);
  let tier = tiers.find((t) => total >= t.min);
  if (!tier && tiers.length) tier = tiers[tiers.length - 1];

  const categoryView: Scoring['categories'] = {};
  for (const catId of Object.keys(categories)) {
    const c = categories[catId];
    categoryView[catId] = {
      score: perCategory[catId],
      weight: c.weight,
      weighted: round1(perCategory[catId] * c.weight),
      label: c.label,
    };
  }

  return {
    total,
    tier: tier ? { id: tier.id, label: tier.label, min: tier.min } : null,
    categories: categoryView,
    hasKnockout: false,
  };
}

/**
 * Knockout rules are evaluated AFTER the quiz is complete and only surface
 * as internal flags in the webhook payload. Candidates are never rejected
 * mid-quiz and never see these flags.
 *
 * Supported rule shapes:
 *   simple: { questionId, answerIndex: number | number[] }
 *   AND:    { type: 'AND', rules: [...] }   all must match
 *   OR:     { type: 'OR',  rules: [...] }   any must match
 */
export function evaluateKnockouts(
  config: QuizConfig,
  answersById: AnswersById
): KnockoutFlagResult[] {
  return (config.knockoutFlags || []).map((flag) => ({
    id: flag.id,
    description: flag.description,
    triggered: evaluateRule(flag.rules || {}, answersById),
  }));
}

function evaluateRule(rule: KnockoutRule | null | undefined, answersById: AnswersById): boolean {
  if (!rule) return false;

  if (rule.type === 'AND') {
    return (rule.rules || []).every((r) => evaluateRule(r, answersById));
  }
  if (rule.type === 'OR') {
    return (rule.rules || []).some((r) => evaluateRule(r, answersById));
  }

  const answer = rule.questionId ? answersById[rule.questionId] : undefined;
  if (!answer) return false;
  const indices = Array.isArray(rule.answerIndex) ? rule.answerIndex : [rule.answerIndex];
  const chosen = Array.isArray(answer.answerIndex) ? answer.answerIndex : [answer.answerIndex];
  return indices.some((i) => chosen.includes(i as number));
}

/**
 * The one and only place scoring + knockouts + the routing decision are derived.
 * Called once when the last question is answered; the stored result is what
 * both the screen router and the webhook payload read afterwards.
 */
export function evaluateQuiz(config: QuizConfig, answers: AnswerRecord[]): QuizResult {
  const answersById: AnswersById = {};
  for (const a of answers) answersById[a.questionId] = a;

  const scoring = computeScoring(config, answersById);
  const knockoutFlags = evaluateKnockouts(config, answersById);
  scoring.hasKnockout = knockoutFlags.some((f) => f.triggered);

  const rejectThreshold = (config.scoring && config.scoring.rejectThreshold) || 0;
  const belowThreshold = scoring.total < rejectThreshold;

  let rejectionReason: string | null = null;
  if (scoring.hasKnockout) {
    const triggered = knockoutFlags.find((f) => f.triggered);
    rejectionReason = 'knockout:' + (triggered ? triggered.id : 'unknown');
  } else if (belowThreshold) {
    rejectionReason = 'score_below_threshold';
  }

  return {
    scoring,
    knockoutFlags,
    passed: rejectionReason === null,
    rejectionReason,
  };
}
