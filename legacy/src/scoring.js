const round1 = (n) => Math.round(n * 10) / 10;

/**
 * Weighted category scoring.
 * Each question belongs to one category. Each answered question carries
 * 0-100 points (already computed by the renderer at answer time).
 *
 *   Score per category = average of all question scores in that category
 *   Total              = Σ (category_avg × category_weight)
 *   Tier               = first matching tier where total >= tier.min
 *
 * @param {object}  config       Quiz JSON config
 * @param {object}  answersById  { questionId: {questionId, answerIndex, points, ...} }
 * @returns {{total:number, tier:object, categories:object, hasKnockout:boolean}}
 */
export function computeScoring(config, answersById) {
  const categories = config.categories || {};
  const perCategory = {};

  for (const catId of Object.keys(categories)) {
    const questions = config.questions.filter((q) => q.category === catId);
    const scores = questions.map((q) => (answersById[q.id] ? answersById[q.id].points : 0));
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

  const categoryView = {};
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
 * automatically and never see these flags.
 *
 * Supported rule shapes:
 *   simple: { questionId, answerIndex: number | number[] }
 *   AND:    { type: 'AND', rules: [...] }   all must match
 *   OR:     { type: 'OR',  rules: [...] }   any must match
 *
 * @returns {Array<{id:string, description:string, triggered:boolean}>}
 */
export function evaluateKnockouts(config, answersById) {
  return (config.knockoutFlags || []).map((flag) => ({
    id: flag.id,
    description: flag.description,
    triggered: evaluateRule(flag.rules || {}, answersById),
  }));
}

function evaluateRule(rule, answersById) {
  if (!rule) return false;

  if (rule.type === 'AND') {
    return (rule.rules || []).every((r) => evaluateRule(r, answersById));
  }
  if (rule.type === 'OR') {
    return (rule.rules || []).some((r) => evaluateRule(r, answersById));
  }

  const answer = answersById[rule.questionId];
  if (!answer) return false;
  const indices = Array.isArray(rule.answerIndex) ? rule.answerIndex : [rule.answerIndex];
  const chosen = Array.isArray(answer.answerIndex) ? answer.answerIndex : [answer.answerIndex];
  return indices.some((i) => chosen.includes(i));
}
