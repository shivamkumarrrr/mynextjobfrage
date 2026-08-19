import { computeScoring, evaluateKnockouts } from './scoring.js';

/**
 * Build the full webhook payload.
 * All scoring/knockout data lives here — entirely internal for the recruiter.
 * The candidate never sees any of it.
 */
export function buildPayload(config, { quizId, candidate, answers, meta } = {}) {
  const questions = config.questions || [];
  const answersById = {};
  for (const a of answers) answersById[a.questionId] = a;

  const orderedAnswers = questions
    .map((q) => answersById[q.id])
    .filter(Boolean)
    .map((a) => ({
      questionId: a.questionId,
      questionText: a.questionText,
      answer: a.answer,
      answerIndex: a.answerIndex,
      points: a.points,
      category: a.category,
      ...(typeof a.isCorrect === 'boolean' ? { isCorrect: a.isCorrect } : {}),
    }));

  const scoring = computeScoring(config, answersById);
  const knockoutFlags = evaluateKnockouts(config, answersById);
  scoring.hasKnockout = knockoutFlags.some((f) => f.triggered);

  return {
    quizId,
    quizVersion: config.quizVersion || '1.0',
    timestamp: new Date().toISOString(),
    candidate,
    scoring,
    knockoutFlags,
    answers: orderedAnswers,
    meta: meta || {},
  };
}

/**
 * POST the payload to the configured endpoint with exponential backoff retries.
 *
 * @param {string} url     Webhook URL
 * @param {object} payload Built payload
 * @param {object} options { retries = 3, onRetry }
 * @returns {Promise<{ok:true,status:number,attempts:number}>}
 */
export async function sendWebhook(url, payload, options = {}) {
  const { retries = 3, onRetry } = options;
  let lastErr = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      });
      if (res.ok) return { ok: true, status: res.status, attempts: attempt };
      lastErr = new Error('HTTP ' + res.status);
    } catch (err) {
      lastErr = err;
    }

    if (attempt < retries) {
      const delay = Math.min(4000, 1000 * Math.pow(2, attempt - 1)); // 1s, 2s, 4s…
      if (onRetry) onRetry(attempt, delay);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastErr || new Error('Webhook failed after ' + retries + ' attempts');
}
