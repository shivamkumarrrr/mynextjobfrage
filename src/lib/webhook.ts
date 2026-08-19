import type {
  AnswerRecord,
  Candidate,
  PayloadMeta,
  QuizConfig,
  QuizResult,
  WebhookPayload,
} from './types';

export interface BuildPayloadInput {
  quizId: string | null;
  candidate: Candidate | null;
  answers: AnswerRecord[];
  meta?: PayloadMeta;
  /** Already-computed evaluation — scoring is never recomputed here. */
  result: QuizResult;
}

/**
 * Build the full webhook payload.
 *
 * All scoring/knockout data lives here — entirely internal for the recruiter,
 * the candidate never sees any of it.
 *
 * The emitted JSON is an external integration contract (a CRM/automation already
 * consumes it): key names, nesting and ordering must not change. Unlike the
 * pre-migration version this no longer recomputes scoring; it serialises the
 * single evaluation made when the quiz completed.
 */
export function buildPayload(config: QuizConfig, input: BuildPayloadInput): WebhookPayload {
  const { quizId, candidate, answers, meta, result } = input;
  const questions = config.questions || [];

  const answersById: Record<string, AnswerRecord> = {};
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

  return {
    quizId,
    quizVersion: config.quizVersion || '1.0',
    timestamp: new Date().toISOString(),
    candidate,
    scoring: result.scoring,
    knockoutFlags: result.knockoutFlags,
    answers: orderedAnswers,
    meta: meta || {},
    result: {
      passed: result.passed,
      rejected: !result.passed,
      rejectionReason: result.rejectionReason,
    },
  };
}

export interface SendWebhookOptions {
  /** Number of *retries after the first attempt* (default 3 → 1s, 2s, 4s). */
  retries?: number;
  onRetry?: (attempt: number, delay: number) => void;
}

export interface SendWebhookResult {
  ok: true;
  status: number;
  attempts: number;
}

/**
 * POST the payload to the configured endpoint with exponential backoff.
 *
 * `retries` counts retries, not total attempts: `retries: 3` performs the first
 * attempt plus three backed-off retries (1s, 2s, 4s). The previous
 * implementation treated it as a total attempt count and therefore only ever
 * waited twice (1s, 2s), contradicting its own documentation.
 */
export async function sendWebhook(
  url: string,
  payload: WebhookPayload,
  options: SendWebhookOptions = {}
): Promise<SendWebhookResult> {
  const { retries = 3, onRetry } = options;
  const totalAttempts = retries + 1;
  let lastErr: unknown = null;

  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
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

    if (attempt < totalAttempts) {
      const delay = Math.min(4000, 1000 * Math.pow(2, attempt - 1)); // 1s, 2s, 4s…
      if (onRetry) onRetry(attempt, delay);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastErr instanceof Error
    ? lastErr
    : new Error('Webhook failed after ' + totalAttempts + ' attempts');
}

/**
 * Fire-and-forget delivery.
 *
 * Nothing about the payload is ever logged in a production build. The old code
 * dumped the entire scoring/tier/knockout payload to the candidate's own console
 * whenever the webhook URL was empty — which is indistinguishable from a
 * misconfigured production deploy, and breaks the product's "candidates never
 * see scoring" rule. The gate is `import.meta.env.DEV`, nothing else.
 */
export function deliverPayload(url: string | undefined, payload: WebhookPayload): void {
  if (url) {
    sendWebhook(url, payload, { retries: 3 })
      .then((r) => {
        if (import.meta.env.DEV) console.info('[quiz] webhook delivered', r.status);
      })
      // The error itself carries no candidate or scoring data, so it stays
      // loggable in production — only payload dumps are dev-gated.
      .catch((err) => console.error('[quiz] webhook delivery failed', err));
    return;
  }

  if (import.meta.env.DEV) {
    console.info('[quiz] no webhook configured (dev only) — payload:', payload);
  }
}
