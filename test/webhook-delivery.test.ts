import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { evaluateQuiz } from '@/lib/scoring';
import type { WebhookPayload } from '@/lib/types';
import { buildPayload, deliverPayload, sendWebhook } from '@/lib/webhook';
import { bestAnswers, loadQuiz, testCandidate, testMeta } from './fixtures';

function samplePayload(): WebhookPayload {
  const config = loadQuiz('ppc-performance-marketing');
  const answers = bestAnswers(config);
  return buildPayload(config, {
    quizId: 'ppc-performance-marketing',
    candidate: testCandidate,
    answers,
    meta: testMeta,
    result: evaluateQuiz(config, answers),
  });
}

describe('sendWebhook retry/backoff', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test('retries:3 means three backed-off retries after the first attempt (1s, 2s, 4s)', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'));
    vi.stubGlobal('fetch', fetchMock);
    const delays: number[] = [];

    const promise = sendWebhook('https://hook.test/x', samplePayload(), {
      retries: 3,
      onRetry: (_attempt, delay) => delays.push(delay),
    }).catch((err: Error) => err);

    await vi.runAllTimersAsync();
    const outcome = await promise;

    // Pre-migration this ran 3 attempts and waited only twice (1s, 2s).
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(delays).toEqual([1000, 2000, 4000]);
    expect(outcome).toBeInstanceOf(Error);
  });

  test('stops as soon as a request succeeds and reports the attempt count', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('flaky'))
      .mockResolvedValueOnce({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);

    const promise = sendWebhook('https://hook.test/x', samplePayload(), { retries: 3 });
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toEqual({ ok: true, status: 200, attempts: 2 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('a non-ok HTTP response is retried too', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    vi.stubGlobal('fetch', fetchMock);

    const promise = sendWebhook('https://hook.test/x', samplePayload(), { retries: 1 }).catch(
      (err: Error) => err
    );
    await vi.runAllTimersAsync();

    expect(await promise).toBeInstanceOf(Error);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('deliverPayload never leaks scoring to the candidate', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  test('logs nothing at all in a production build with no webhook URL', () => {
    vi.stubEnv('DEV', false);
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    // The exact misconfiguration that used to dump tier/score/knockouts into
    // the candidate's own browser console.
    deliverPayload('', samplePayload());
    deliverPayload(undefined, samplePayload());

    expect(info).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  test('a configured webhook posts the payload without logging it', async () => {
    vi.stubEnv('DEV', false);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});

    deliverPayload('https://hook.test/x', samplePayload());
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body).scoring.total).toBeGreaterThan(0);
    expect(info).not.toHaveBeenCalled();
  });
});
