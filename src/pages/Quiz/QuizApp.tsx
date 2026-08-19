import { useCallback, useEffect, useReducer, useRef } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { applyBranding, applyMeta } from '@/lib/branding';
import { initEmbed } from '@/lib/embed';
import { evaluateQuiz } from '@/lib/scoring';
import type { AnswerRecord, Candidate, PayloadMeta, QuizConfig, QuizResult } from '@/lib/types';
import { buildPayload, deliverPayload } from '@/lib/webhook';
import { Shell } from './Shell';
import {
  currentPhase,
  initialState,
  progressPercent,
  progressText,
  quizReducer,
  upsertAnswer,
} from './machine';
import { Fatal } from './screens/Fatal';
import { Lead } from './screens/Lead';
import { Match } from './screens/Match';
import { Question } from './screens/Question';
import { Rejection } from './screens/Rejection';
import { ThankYou } from './screens/ThankYou';
import { Welcome } from './screens/Welcome';

// The quiz only ever moves forward (no back button, see machine.ts), so a
// single left-slide direction reads as progress rather than needing to track
// which way the user came from.
const slideVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

function detectDevice(): string {
  const ua = navigator.userAgent || '';
  return /Mobi|Android|iPhone|iPad|Windows Phone/i.test(ua) ? 'mobile' : 'desktop';
}

export function QuizApp() {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const quizIdRef = useRef<string | null>(null);
  // Set when the config lands, so `completionTimeSeconds` measures the quiz,
  // not the fetch. Reading the clock during render would not be pure.
  const startTimeRef = useRef<number>(0);
  const deliveredRef = useRef(false);
  const bootedRef = useRef(false);

  // Boot: read ?q, fetch the client's config, apply its branding.
  // Guarded so StrictMode's dev double-invoke cannot fetch twice or attach a
  // second embed MutationObserver.
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    const quizId = new URLSearchParams(window.location.search).get('q');

    if (!quizId) {
      dispatch({
        type: 'fatal',
        fatal: {
          message: 'Kein Test ausgewählt. Bitte öffne den Link aus der Stellenanzeige.',
          showBackLink: false,
        },
      });
      return;
    }
    quizIdRef.current = quizId;

    if (window.location.protocol === 'file:') {
      dispatch({
        type: 'fatal',
        fatal: {
          message: 'Der Test funktioniert nicht, wenn die Datei lokal geöffnet wird.',
          hint: 'dev-server',
        },
      });
      return;
    }

    // Relative path on purpose: it resolves to /quizzes/… under both the
    // clean URL (/app) and the extensioned one, and survives sub-path hosting.
    (async () => {
      try {
        const res = await fetch(`quizzes/${encodeURIComponent(quizId)}.json`, {
          cache: 'no-cache',
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const config: QuizConfig = await res.json();
        startTimeRef.current = Date.now();
        applyBranding(config);
        applyMeta(config);
        dispatch({ type: 'config_loaded', config });
      } catch (err) {
        console.error('[quiz] failed to load config', err);
        dispatch({
          type: 'fatal',
          fatal: {
            message: 'Der Test konnte nicht geladen werden. Bitte versuche es später erneut.',
          },
        });
      }
    })();

    initEmbed();
  }, []);

  // Each screen starts at the top with focus on its heading.
  useEffect(() => {
    if (state.screen === 'loading') return;
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const target = document.querySelector<HTMLElement>('[data-focus]');
    target?.focus({ preventScroll: true });
  }, [state.screen, state.qIndex]);

  const buildMeta = useCallback(
    (): PayloadMeta => ({
      device: detectDevice(),
      completionTimeSeconds: Math.round((Date.now() - startTimeRef.current) / 1000),
      referrer: document.referrer || '',
      userAgent: navigator.userAgent || '',
    }),
    []
  );

  const send = useCallback(
    (
      config: QuizConfig,
      result: QuizResult,
      answers: AnswerRecord[],
      candidate: Candidate | null
    ) => {
      const payload = buildPayload(config, {
        quizId: quizIdRef.current,
        candidate,
        answers,
        meta: buildMeta(),
        result,
      });
      deliverPayload(config.webhook && config.webhook.url, payload);
    },
    [buildMeta]
  );

  const handleAnswer = useCallback(
    (record: AnswerRecord) => {
      const config = state.config;
      if (!config) return;
      const answers = upsertAnswer(state.answers, record);
      const total = config.questions?.length ?? 0;

      if (state.qIndex < total - 1) {
        dispatch({ type: 'answered', answers });
        return;
      }

      // Last question: evaluate exactly once. Routing below and the webhook
      // payload both consume this same object.
      const result = evaluateQuiz(config, answers);
      dispatch({ type: 'completed', answers, result });

      if (!result.passed && !deliveredRef.current) {
        deliveredRef.current = true;
        send(config, result, answers, null);
      }
    },
    [state.config, state.answers, state.qIndex, send]
  );

  const handleLeadSubmit = useCallback(
    (candidate: Candidate) => {
      const { config, result, answers } = state;
      if (!config || !result) return;
      if (!deliveredRef.current) {
        deliveredRef.current = true;
        send(config, result, answers, candidate);
      }
      dispatch({ type: 'submitted' });
    },
    [state, send]
  );

  if (state.screen === 'fatal' && state.fatal) return <Fatal info={state.fatal} />;
  if (!state.config) return null;

  const config = state.config;
  const questions = config.questions || [];
  const question = questions[state.qIndex];
  const screenKey = state.screen === 'question' ? `question-${state.qIndex}` : state.screen;

  return (
    <Shell
      config={config}
      phase={currentPhase(state.screen)}
      percent={progressPercent(state)}
      progressText={progressText(state)}
    >
      <MotionConfig reducedMotion="user">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={screenKey}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.22, 0.9, 0.32, 1] }}
          >
            {state.screen === 'welcome' && (
              <Welcome config={config} onStart={() => dispatch({ type: 'start' })} />
            )}
            {state.screen === 'question' && question && (
              <Question
                config={config}
                question={question}
                index={state.qIndex}
                total={questions.length}
                onAnswer={handleAnswer}
              />
            )}
            {state.screen === 'match' && (
              <Match config={config} onContinue={() => dispatch({ type: 'continue_to_lead' })} />
            )}
            {state.screen === 'rejection' && <Rejection config={config} />}
            {state.screen === 'lead' && <Lead config={config} onSubmit={handleLeadSubmit} />}
            {state.screen === 'thank' && <ThankYou config={config} />}
          </motion.div>
        </AnimatePresence>
      </MotionConfig>
    </Shell>
  );
}
