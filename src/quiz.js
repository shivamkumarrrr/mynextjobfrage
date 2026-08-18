import { buildPayload, sendWebhook } from './webhook.js';
import { computeScoring, evaluateKnockouts } from './scoring.js';
import { initEmbed } from './embed.js';

const AUTO_ADVANCE_MS = 280;

const state = {
  quizId: null,
  config: null,
  screen: 'loading',
  qIndex: 0,
  answers: [], // ordered answer records (same shape as webhook answers[])
  startTime: null,
  payload: null,
  advanceToken: 0,
};

const $ = (sel, root = document) => root.querySelector(sel);

const esc = (v) =>
  String(v == null ? '' : v).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );

const initials = (name = '') => {
  const words = name.split(/\s+/).filter(Boolean);
  const acronym = words.find((w) => w.length >= 2 && w.length <= 4 && w === w.toUpperCase());
  if (acronym) return acronym;
  return (
    words
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'MNJ'
  );
};

const darken = (hex, f = 0.82) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return '#123a45';
  const n = parseInt(m[1], 16);
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

function detectDevice() {
  const ua = navigator.userAgent || '';
  return /Mobi|Android|iPhone|iPad|Windows Phone/i.test(ua) ? 'mobile' : 'desktop';
}

function buildShareButtons(target, text, config) {
  const share = (config.thankYou && config.thankYou.share) || {};
  const enc = encodeURIComponent;
  const buttons = [];

  if (share.whatsapp) {
    buttons.push(
      `<a class="share-btn share-wa" target="_blank" rel="noopener" href="https://wa.me/?text=${enc(text + ' ' + target)}" aria-label="Auf WhatsApp teilen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.3-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.6.7 2 .8 2.1.1.2.1.3 0 .5-.1.2-.2.3-.3.5-.1.2-.3.3-.1.5.1.3.6 1 1.3 1.6.9.8 1.6 1 1.9 1.1.2.1.4.1.5-.1.1-.1.5-.6.7-.8.2-.2.3-.2.5-.1.2.1 1.4.6 1.6.7.2.1.4.2.5.3.1.3.1 1-.2 1.6z" fill="currentColor"/></svg><span>WhatsApp</span></a>`
    );
  }
  if (share.linkedin) {
    buttons.push(
      `<a class="share-btn share-li" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${enc(target)}" aria-label="Auf LinkedIn teilen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2 2 0 1 1-.02 4 2 2 0 0 1 .02-4zM3 9h4v12H3V9zm7 0h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21h-4V9z" fill="currentColor"/></svg><span>LinkedIn</span></a>`
    );
  }
  if (share.facebook) {
    buttons.push(
      `<a class="share-btn share-fb" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${enc(target)}" aria-label="Auf Facebook teilen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.6V4.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V11H7.5v3H10v8h3.5z" fill="currentColor"/></svg><span>Facebook</span></a>`
    );
  }

  return buttons.length ? `<div class="share-row">${buttons.join('')}</div>` : '';
}

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */

async function init() {
  const params = new URLSearchParams(window.location.search);
  const quizId = params.get('q');

  if (!quizId) {
    document.body.innerHTML = `
      <div class="shell">
        <div class="fatal">
          <div class="thank-body">Kein Test ausgewählt. Bitte öffne den Link aus der Stellenanzeige.</div>
        </div>
      </div>`;
    return;
  }

  state.quizId = quizId;

  if (window.location.protocol === 'file:') {
    console.warn('[quiz] file:// detected — configs cannot be fetched without an HTTP server');
    renderFatal(
      'Der Test funktioniert nicht, wenn die Datei lokal geöffnet wird.<br>' +
        'Bitte starte im Projektordner <code>npm run dev</code> und öffne anschließend ' +
        '<a href="http://localhost:3000/">http://localhost:3000/</a>.',
      true
    );
    return;
  }

  let config;
  try {
    const res = await fetch(`quizzes/${encodeURIComponent(quizId)}.json`, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    config = await res.json();
  } catch (err) {
    console.error('[quiz] failed to load config', err);
    renderFatal('Der Test konnte nicht geladen werden. Bitte versuche es später erneut.', true);
    return;
  }

  state.config = config;
  state.startTime = Date.now();

  buildShell(config);
  applyBranding(config);
  applyMeta(config);
  initEmbed();
  showWelcome();
}

/**
 * Keep the browser chrome (tab title, preview, mobile status bar) in sync
 * with the loaded quiz — never a stale generic page.
 */
function applyMeta(config) {
  const job = config.job || {};
  const title = `Online-Test: ${job.title || 'Bewerbung'}`;
  const intro = (config.welcome && config.welcome.intro) || '';

  document.title = title;

  const set = (sel, attr, val) => {
    const el = document.querySelector(sel);
    if (el && val) el.setAttribute(attr, val);
  };
  set('meta[name="description"]', 'content', intro);
  set('meta[property="og:title"]', 'content', title);
  set('meta[property="og:description"]', 'content', intro);
  set('meta[name="theme-color"]', 'content', (config.branding || {}).primary);
}

function buildShell(config) {
  const job = config.job || {};
  const branding = config.branding || {};
  const steps = config.steps || [
    { id: 'test', label: 'Online-Test' },
    { id: 'contact', label: 'Kontaktdaten' },
  ];

  const logo = branding.logoUrl
    ? `<img class="logo-img" src="${esc(branding.logoUrl)}" alt="${esc(job.company || '')}">`
    : `<span class="logo-mark">${esc(initials(job.company))}</span>`;

  const screen = $('body');
  screen.innerHTML = `
    <div class="shell">
      <header class="shell-header">
        <div class="shell-header-inner">
          <div class="brand">${logo}<span class="brand-name">${esc(job.company || 'Online-Test')}</span></div>
          <span class="topbar-badge">${esc(config.topbarLabel || steps[0]?.label || 'Online-Test')}</span>
        </div>
      </header>

      <div class="shell-layout">
        <aside class="steps-sidebar" aria-label="Schritte">
          <ol class="steps" data-steps></ol>
        </aside>

        <main class="content">
          <ol class="steps-horizontal" data-steps-horizontal aria-label="Schritte"></ol>
          <div class="mobile-progress">
            <div class="progress-track"><div class="progress-fill" data-progress-fill-mobile></div></div>
          </div>
          <div id="screen" aria-live="polite"></div>
        </main>

        <aside class="job-side">
          <div class="job-card">
            <div class="job-title">${esc(job.title || '')}</div>
            <div class="job-company"><span class="job-company-logo" aria-hidden="true">${logo}</span>${esc(job.company || '')}</div>
            <div id="job-progress-block">
              <div class="job-progress-label">${esc(config.progressLabel || 'Dein Fortschritt')}</div>
              <div class="progress-track"><div class="progress-fill" data-progress-fill></div></div>
              <div class="job-progress-meta"><span data-progress-text></span><span class="progress-pct" data-progress-pct>0%</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>`;

  // Single delegated listener for answer/multi-next clicks — attached once.
  // (Per-render listeners on #screen would accumulate, since #screen persists
  // across innerHTML swaps and old listeners would fire on later questions.)
  $('#screen').addEventListener('click', onScreenClick);

  renderSteps();
  updateProgress();
}

function applyBranding(config) {
  const b = config.branding || {};
  const root = document.documentElement;
  if (b.primary) root.style.setProperty('--primary', b.primary);
  if (b.accent) root.style.setProperty('--accent', b.accent);
  if (b.primary) root.style.setProperty('--primary-hover', darken(b.primary, 0.85));
  if (b.accent) root.style.setProperty('--accent-hover', darken(b.accent, 0.82));
  if (b.bg) root.style.setProperty('--bg', b.bg);
  if (b.text) root.style.setProperty('--text', b.text);
  if (b.radius) root.style.setProperty('--radius', b.radius);
  if (b.font) root.style.setProperty('--font', b.font);
}

/* ------------------------------------------------------------------ */
/* Shared chrome: steps + progress                                     */
/* ------------------------------------------------------------------ */

function currentPhase() {
  if (state.screen === 'thank') return 2;
  if (state.screen === 'lead') return 1;
  return 0;
}

function renderSteps() {
  const steps = state.config.steps || [];
  const phase = currentPhase();

  const item = (s, i) => {
    let cls = 'step';
    if (i < phase) cls += ' step-done';
    else if (i === phase) cls += ' step-active';
    const decor =
      i < phase
        ? `<svg class="step-check" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        : `<span class="step-num">${i + 1}</span>`;
    return `<li class="${cls}">${decor}<span class="step-label">${esc(s.label)}</span></li>`;
  };

  const vertical = $('[data-steps]');
  const horizontal = $('[data-steps-horizontal]');
  if (vertical) vertical.innerHTML = steps.map(item).join('');
  if (horizontal) horizontal.innerHTML = steps.map(item).join('');
}

function updateProgress() {
  const n = state.config.questions ? state.config.questions.length : 0;
  const answered = state.answers.length;
  let pct = 0;
  if (currentPhase() <= 0) pct = n ? Math.round((answered / n) * 100) : 0;
  else pct = 100;

  document.querySelectorAll('[data-progress-fill], [data-progress-fill-mobile]').forEach((el) => {
    el.style.transform = `scaleX(${Math.min(pct, 100) / 100})`;
    el.classList.toggle('progress-active', pct > 0 && pct < 100);
    el.setAttribute('role', 'progressbar');
    el.setAttribute('aria-valuemin', '0');
    el.setAttribute('aria-valuemax', '100');
    el.setAttribute('aria-valuenow', String(Math.min(pct, 100)));
    el.setAttribute(
      'aria-label',
      (state.config.progressLabel || 'Fortschritt') + ' ' + Math.min(pct, 100) + '%'
    );
  });
  document.querySelectorAll('[data-progress-pct]').forEach((el) => {
    el.textContent = Math.min(pct, 100) + '%';
  });
  const txt = $('[data-progress-text]');
  if (txt)
    txt.textContent =
      currentPhase() <= 0 ? `${Math.min(answered + 1, n)} von ${n} Fragen` : 'Abgeschlossen';
}

function focusScreen() {
  const s = $('#screen');
  if (s) s.tabIndex = -1;
  try {
    const target = $('#screen').querySelector('h1, h2, [data-focus]') || $('#screen');
    target.focus({ preventScroll: true });
  } catch (_) {
    /* noop */
  }
}

/** Reset internal scroll so each new screen starts at the top. */
function scrollTop() {
  try {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  } catch (_) {
    /* noop */
  }
}

/* ------------------------------------------------------------------ */
/* Answer recording                                                    */
/* ------------------------------------------------------------------ */

function recordAnswer(question, selectedIndices) {
  const selected = question.answers.filter((_, j) => selectedIndices.includes(j));
  let points;

  if (question.type === 'multi_select') {
    const excl = question.answers.find((a, j) => selectedIndices.includes(j) && a.exclusive);
    if (excl) points = excl.points || 0;
    else
      points = Math.min(
        selected.reduce((s, a) => s + (a.points || 0), 0),
        question.maxPoints ?? 100
      );
  } else {
    points = selected[0]?.points || 0;
  }

  const entry = {
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
    entry.isCorrect = selectedIndices[0] === question.correctAnswer;
  }

  const existing = state.answers.findIndex((a) => a.questionId === question.id);
  if (existing >= 0) state.answers[existing] = entry;
  else state.answers.push(entry);
}

function next() {
  const total = state.config.questions.length;
  if (state.qIndex < total - 1) {
    state.qIndex++;
    showQuestion();
  } else {
    evaluateAndRoute();
  }
}

/* ------------------------------------------------------------------ */
/* Screens                                                             */
/* ------------------------------------------------------------------ */

function showWelcome() {
  state.screen = 'welcome';
  const c = state.config;
  const job = c.job || {};
  const b = c.branding || {};
  const welcome = c.welcome || {};

  const logo = b.logoUrl
    ? `<img class="welcome-logo" src="${esc(b.logoUrl)}" alt="${esc(job.company || '')}">`
    : '';

  $('#screen').innerHTML = `
    <section class="screen anim-in welcome">
      ${logo}
      <p class="welcome-eyebrow">${esc(c.topbarLabel || 'Online-Test')}</p>
      <h1 class="welcome-title">${esc(job.title || '')}</h1>
      <p class="welcome-company">${esc(job.company || '')}</p>
      <p class="welcome-intro">${esc(welcome.intro || '')}</p>
      <p class="welcome-meta">${esc(welcome.metaText || 'Dauer: ca. 5 Minuten')}</p>
      <button type="button" class="btn btn-primary btn-start" data-start>${esc(welcome.startButton || 'Online-Test starten')}</button>
    </section>`;

  $('[data-start]', $('#screen'))?.addEventListener('click', () => {
    state.qIndex = 0;
    showQuestion();
  });

  renderSteps();
  updateProgress();
  focusScreen();
}

function showQuestion() {
  state.screen = 'question';
  ++state.advanceToken;
  scrollTop();
  const config = state.config;
  const q = config.questions[state.qIndex];
  const total = config.questions.length;
  const multi = q.type === 'multi_select';
  const textInput = q.type === 'text_input';

  const answersHtml = textInput
    ? ''
    : q.answers
        .map(
          (a, j) => `
      <button type="button" class="answer" data-answer data-idx="${j}" aria-pressed="false" style="animation-delay:${Math.min(j * 55, 440)}ms">
        <span class="answer-check" aria-hidden="true"></span>
        <span class="answer-text">${esc(a.text)}</span>
      </button>`
        )
        .join('');

  const textInputHtml = textInput
    ? `
    <div class="text-input-group">
      <input type="text" class="text-answer" data-text-answer placeholder="${esc(q.placeholder || '')}" autofocus>
      <button type="button" class="btn btn-primary btn-text-next" data-text-next disabled>${esc(config.continueLabel || 'Weiter')}</button>
    </div>`
    : '';

  $('#screen').innerHTML = `
    <section class="screen anim-in question">
      <p class="screen-kicker">${esc(textInput ? 'Freitext' : multi ? 'Mehrfachauswahl' : 'Frage ' + (state.qIndex + 1) + ' von ' + total)}</p>
      <h2 class="question-title">${esc(q.question)}</h2>
      ${
        textInput
          ? textInputHtml
          : `
      <div class="answers ${multi ? 'multi' : 'single'}">
        ${answersHtml}
      </div>`
      }
      ${
        multi
          ? `
        <div class="multi-footer">
          <button type="button" class="btn btn-primary btn-multi-next" data-multi-next disabled>${esc(config.continueLabel || 'Weiter')}</button>
        </div>`
          : ''
      }
      ${q.hint ? `<p class="question-hint">${esc(q.hint)}</p>` : ''}
    </section>`;

  renderSteps();
  updateProgress();
  focusScreen();
  if (textInput) setupTextInput();
}

function onScreenClick(e) {
  const q = state.config.questions[state.qIndex];
  if (!q || state.screen !== 'question') return;

  const nextBtn = e.target.closest('[data-multi-next]');
  if (nextBtn) {
    if (nextBtn.disabled) return;
    const screen = $('#screen');
    const chosen = [...screen.querySelectorAll('.answer.sel')].map((b) => Number(b.dataset.idx));
    if (!chosen.length) return;
    recordAnswer(
      q,
      chosen.sort((a, b2) => a - b2)
    );
    next();
    return;
  }

  const textNextBtn = e.target.closest('[data-text-next]');
  if (textNextBtn) {
    if (textNextBtn.disabled) return;
    const input = $('[data-text-answer]', $('#screen'));
    if (!input || !input.value.trim()) return;
    recordTextAnswer(q, input.value.trim());
    next();
    return;
  }

  const el = e.target.closest('[data-answer]');
  if (!el) return;
  const idx = Number(el.dataset.idx);

  if (q.type === 'multi_select') {
    toggleMultiAnswer(el, idx);
    return;
  }

  const screen = $('#screen');
  screen.querySelectorAll('[data-answer]').forEach((b) => {
    b.classList.remove('sel');
    b.setAttribute('aria-pressed', 'false');
  });
  el.classList.add('sel');
  el.setAttribute('aria-pressed', 'true');

  const token = ++state.advanceToken;
  setTimeout(() => {
    if (token !== state.advanceToken) return;
    recordAnswer(q, [idx]);
    next();
  }, AUTO_ADVANCE_MS);
}

function toggleMultiAnswer(el, idx) {
  const q = state.config.questions[state.qIndex];
  const opt = q.answers[idx];
  const isSel = el.classList.contains('sel');

  // Exclusive option (e.g. "Keinem") deselects everything else.
  if (opt.exclusive) {
    if (isSel) {
      el.classList.remove('sel');
    } else {
      [...el.parentElement.querySelectorAll('.answer')].forEach((b) => {
        b.classList.remove('sel');
        b.setAttribute('aria-pressed', 'false');
      });
      el.classList.add('sel');
      el.setAttribute('aria-pressed', 'true');
    }
  } else {
    // Toggling a normal option deselects the exclusive one.
    const excl = [...el.parentElement.querySelectorAll('.answer')].find((b) => {
      const o = q.answers[Number(b.dataset.idx)];
      return o && o.exclusive;
    });
    if (excl) excl.classList.remove('sel'); // aria-pressed below recalcs

    if (isSel) el.classList.remove('sel');
    else el.classList.add('sel');
    el.parentElement.querySelectorAll('[data-answer]').forEach((b) => {
      b.setAttribute('aria-pressed', b.classList.contains('sel') ? 'true' : 'false');
    });
  }

  el.setAttribute('aria-pressed', el.classList.contains('sel') ? 'true' : 'false');
  const any = [...el.parentElement.querySelectorAll('.answer.sel')].length > 0;
  const btnNext = $('[data-multi-next]', $('#screen'));
  if (btnNext) btnNext.disabled = !any;
}

function recordTextAnswer(question, text) {
  const entry = {
    questionId: question.id,
    questionText: question.question,
    answer: text,
    answerIndex: null,
    points: null,
    category: question.category,
  };

  const existing = state.answers.findIndex((a) => a.questionId === question.id);
  if (existing >= 0) state.answers[existing] = entry;
  else state.answers.push(entry);
}

function setupTextInput() {
  const input = $('[data-text-answer]', $('#screen'));
  const btnNext = $('[data-text-next]', $('#screen'));
  if (!input || !btnNext) return;

  input.addEventListener('input', () => {
    btnNext.disabled = !input.value.trim();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      e.preventDefault();
      btnNext.click();
    }
  });

  input.focus();
}

/* ------------------------------------------------------------------ */
/* Scoring + rejection routing                                         */
/* ------------------------------------------------------------------ */

function evaluateAndRoute() {
  const config = state.config;
  const answersById = {};
  for (const a of state.answers) answersById[a.questionId] = a;

  const scoring = computeScoring(config, answersById);
  const knockouts = evaluateKnockouts(config, answersById);
  scoring.hasKnockout = knockouts.some((k) => k.triggered);

  const rejectThreshold = (config.scoring && config.scoring.rejectThreshold) || 0;
  const hasKnockout = scoring.hasKnockout;
  const belowThreshold = scoring.total < rejectThreshold;

  if (hasKnockout || belowThreshold) {
    let reason = 'score_below_threshold';
    if (hasKnockout) {
      const triggered = knockouts.find((k) => k.triggered);
      reason = 'knockout:' + (triggered ? triggered.id : 'unknown');
    }
    finalizeRejection(scoring, knockouts, reason);
  } else {
    showMatchScreen(state.config);
  }
}

/**
 * Positive counterpart to the rejection screen — shown to candidates who
 * cleared knockouts + threshold, before the lead form. Categorical only
 * ("Volltreffer"), never a number/percentage: no-score-shock still applies.
 */
function showMatchScreen(config) {
  state.screen = 'match';
  ++state.advanceToken;
  scrollTop();

  const matchCfg = (config.scoring && config.scoring.matchScreen) || {};
  const headline = matchCfg.headline || 'Volltreffer!';
  const body =
    matchCfg.body ||
    'Dein Profil passt richtig gut zu dieser Stelle. Nur noch ein Schritt: Hinterlasse deine Kontaktdaten, damit wir uns bei dir melden können.';

  $('#screen').innerHTML = `
    <section class="screen anim-in match">
      <div class="match-icon">
        <svg viewBox="0 0 52 52" aria-hidden="true">
          <circle class="match-ring match-ring-outer" cx="26" cy="26" r="24" fill="none"/>
          <circle class="match-ring match-ring-mid" cx="26" cy="26" r="16" fill="none"/>
          <circle class="match-ring-bull" cx="26" cy="26" r="7"/>
        </svg>
      </div>
      <h1 class="match-title" data-focus>${esc(headline)}</h1>
      <p class="match-body">${esc(body)}</p>
      <button type="button" class="btn btn-primary btn-match-continue" data-match-continue>${esc(config.continueLabel || 'Weiter')}</button>
    </section>`;

  $('[data-match-continue]', $('#screen'))?.addEventListener('click', () => {
    showLead();
  });

  renderSteps();
  updateProgress();
  focusScreen();
}

function finalizeRejection(scoring, knockouts, rejectionReason) {
  const config = state.config;

  const meta = {
    device: detectDevice(),
    completionTimeSeconds: Math.round((Date.now() - state.startTime) / 1000),
    referrer: document.referrer || '',
    userAgent: navigator.userAgent || '',
  };

  const payload = buildPayload(config, {
    quizId: state.quizId,
    candidate: null,
    answers: state.answers,
    meta,
  });
  payload.result = { passed: false, rejected: true, rejectionReason };
  state.payload = payload;

  const url = config.webhook && config.webhook.url;
  if (url) {
    sendWebhook(url, payload, { retries: 3 })
      .then((r) => console.info('[quiz] webhook delivered (rejected)', r.status))
      .catch((err) => console.error('[quiz] webhook failed — rejection data lost', err));
  } else {
    console.info('[quiz] no webhook configured (dev mode) — rejection payload:', payload);
  }

  showRejectionScreen(config);
}

function showRejectionScreen(config) {
  state.screen = 'rejection';
  ++state.advanceToken;
  scrollTop();

  const rejectCfg = (config.scoring && config.scoring.rejectScreen) || {};
  const headline = rejectCfg.headline || 'Leider passt es aktuell nicht.';
  const body =
    rejectCfg.body ||
    'Danke, dass du dir die Zeit genommen hast. Dein Profil passt leider nicht zu den aktuellen Anforderungen dieser Stelle.';
  const showShare = rejectCfg.showShare !== false;

  const shareTarget = (config.thankYou && config.thankYou.shareUrl) || window.location.href;
  const shareText =
    (config.thankYou && config.thankYou.shareText) ||
    `Schau dir diese Stelle an: ${config.job && config.job.title} bei ${config.job && config.job.company}`;

  const shareButtons = showShare ? buildShareButtons(shareTarget, shareText, config) : '';

  $('#screen').innerHTML = `
    <section class="screen anim-in rejection">
      <div class="rejection-icon">
        <svg viewBox="0 0 52 52" aria-hidden="true">
          <circle class="rejection-circle" cx="26" cy="26" r="24" fill="none"/>
          <path class="rejection-x" fill="none" d="M18 18l16 16M34 18l-16 16"/>
        </svg>
      </div>
      <h1 class="rejection-title" data-focus>${esc(headline)}</h1>
      <p class="rejection-body">${esc(body)}</p>
      ${shareButtons}
    </section>`;

  renderSteps();
  updateProgress();
  focusScreen();
}

function showLead() {
  state.screen = 'lead';
  ++state.advanceToken; // cancel any stray auto-advance timer
  scrollTop();
  const config = state.config;
  const lf = config.leadForm || {};
  const fields = lf.fields || [];

  const fieldHtml = (f) => {
    const half = f.half ? ' field-half' : '';
    const help = f.help ? `<span class="field-help">${esc(f.help)}</span>` : '';
    if (f.type === 'textarea') {
      return `
        <div class="field${half}" data-field="${esc(f.name)}">
          <label for="f-${esc(f.name)}">${esc(f.label)}${f.required ? ' *' : ''}</label>
          <textarea id="f-${esc(f.name)}" name="${esc(f.name)}" rows="4" placeholder="${esc(f.placeholder || '')}"></textarea>
          <span class="field-error" data-error></span>
        </div>`;
    }
    return `
      <div class="field${half}" data-field="${esc(f.name)}">
        <label for="f-${esc(f.name)}">${esc(f.label)}${f.required ? ' *' : ''}</label>
        <input id="f-${esc(f.name)}" name="${esc(f.name)}" type="${esc(f.type || 'text')}"
          placeholder="${esc(f.placeholder || '')}" autocomplete="off">
        ${help}
        <span class="field-error" data-error></span>
      </div>`;
  };

  const salutation = lf.salutation
    ? `
    <fieldset class="salutation">
      <legend>${esc(lf.salutationLabel || 'Anrede')}</legend>
      <div class="salutation-row">
        ${['Herr', 'Frau', 'Keine Angabe']
          .map(
            (s, i) => `
          <label class="radio-pill hs">
            <input type="radio" name="salutation" value="${esc(s)}" ${i === 2 ? 'checked' : ''}>
            <span class="radio-pill-label">${esc(s)}</span>
          </label>`
          )
          .join('')}
      </div>
    </fieldset>`
    : '';

  const whatsappOptIn = lf.whatsappOptIn
    ? `
    <div class="field opt-in">
      <label class="checkbox-line">
        <input type="checkbox" name="whatsappOptIn" value="1" id="f-whatsapp">
        <span class="checkbox-box" aria-hidden="true"></span>
        <span class="checkbox-text">${esc(lf.whatsappOptIn === true ? 'Benachrichtigungen über WhatsApp erhalten (optional)' : lf.whatsappOptIn)}</span>
      </label>
    </div>`
    : '';

  const rows = buildFieldRows(fields, fieldHtml);

  $('#screen').innerHTML = `
    <section class="screen anim-in lead">
      <h2 class="lead-title">${esc(lf.heading || 'Deine Kontaktdaten')}</h2>
      <p class="lead-subtitle">${esc(lf.subtitle || 'Bitte fülle alle Pflichtfelder aus, damit wir dich erreichen können.')}</p>
      <form class="lead-form" novalidate>
        ${salutation}
        ${rows}
        ${whatsappOptIn}
        <button type="submit" class="btn btn-primary btn-submit">${esc(lf.submitLabel || 'Bewerbung absenden ›')}</button>
        <p class="privacy-note">${esc(lf.privacyNote || 'Deine Daten werden ausschließlich zur Bearbeitung deiner Bewerbung verwendet und gemäß DSGVO behandelt.')}</p>
      </form>
    </section>`;

  const form = $('.lead-form', $('#screen'));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    onSubmitLead(form, fields);
  });

  renderSteps();
  updateProgress();
  focusScreen();
}

function buildFieldRows(fields, fieldHtml) {
  let out = '';
  let row = [];
  const flush = () => {
    if (row.length) {
      out += `<div class="field-row">${row.map(fieldHtml).join('')}</div>`;
      row = [];
    }
  };

  for (const f of fields) {
    if (f.half && row.length < 2) {
      row.push(f);
      if (row.length === 2) flush();
    } else {
      flush();
      out += fieldHtml(f);
    }
  }
  flush();
  return out;
}

function onSubmitLead(form, fields) {
  const required = fields.filter((f) => f.required);
  let firstInvalid = null;

  required.forEach((f) => {
    const field = form.querySelector(`[data-field="${f.name}"]`);
    const input = form.elements[f.name];
    const val = (input.value || '').trim();
    let ok = val.length > 0;
    if (ok && f.type === 'email') ok = /^\S+@\S+\.\S+$/.test(val);
    setFieldError(field, ok ? '' : f.errorMessage || 'Bitte ausfüllen');
    if (!ok && !firstInvalid) firstInvalid = input;
  });

  if (firstInvalid) {
    firstInvalid.focus({ preventScroll: false });
    return;
  }

  const val = (name) => ((form.elements[name] && form.elements[name].value) || '').trim();
  const salutation = form.elements.salutation
    ? form.querySelector('input[name="salutation"]:checked')?.value || 'Keine Angabe'
    : '';

  const candidate = {
    salutation,
    firstName: val('firstName'),
    lastName: val('lastName'),
    name: [val('firstName'), val('lastName')].filter(Boolean).join(' '),
    email: val('email'),
    phone: val('phone'),
    startDate: val('startDate'),
    message: val('message'),
    whatsappOptIn: !!(form.elements.whatsappOptIn && form.elements.whatsappOptIn.checked),
  };

  finalize(candidate);
}

function setFieldError(field, msg) {
  if (!field) return;
  field.classList.toggle('invalid', !!msg);
  const err = field.querySelector('[data-error]');
  if (err) err.textContent = msg;
  const input = field.querySelector('input, textarea');
  if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
}

/* ------------------------------------------------------------------ */
/* Submit -> webhook -> thank you                                      */
/* ------------------------------------------------------------------ */

function finalize(candidate) {
  const config = state.config;

  const meta = {
    device: detectDevice(),
    completionTimeSeconds: Math.round((Date.now() - state.startTime) / 1000),
    referrer: document.referrer || '',
    userAgent: navigator.userAgent || '',
  };

  state.payload = buildPayload(config, {
    quizId: state.quizId,
    candidate,
    answers: state.answers,
    meta,
  });
  state.payload.result = { passed: true, rejected: false, rejectionReason: null };

  const url = config.webhook && config.webhook.url;
  if (url) {
    sendWebhook(url, state.payload, { retries: 3 })
      .then((r) => console.info('[quiz] webhook delivered', r.status))
      .catch((err) => console.error('[quiz] webhook failed — lead still stored on-device', err));
  } else {
    console.info('[quiz] no webhook configured (dev mode) — payload:', state.payload);
  }

  showThankYou();
}

function showThankYou() {
  state.screen = 'thank';
  const config = state.config;
  const t = config.thankYou || {};
  const b = config.branding || {};

  const thankImg = b.thankYouImage
    ? `<img class="thank-hero" src="${esc(b.thankYouImage)}" alt="${esc((config.job && config.job.company) || '')}" loading="lazy">`
    : '';

  const shareTarget = t.shareUrl || window.location.href;
  const shareText =
    t.shareText ||
    `Ich habe mich als ${config.job && config.job.title} bei ${config.job && config.job.company} beworben!`;

  const shareButtons = buildShareButtons(shareTarget, shareText, config);

  const check = `
    <svg class="checkmark" viewBox="0 0 52 52" aria-hidden="true">
      <circle class="checkmark-circle" cx="26" cy="26" r="24" fill="none"/>
      <path class="checkmark-check" fill="none" d="M14 27l8 8 16-16"/>
    </svg>`;

  $('#screen').innerHTML = `
    <section class="screen anim-in thank">
      ${thankImg}
      ${check}
      <h1 class="thank-title" data-focus>${esc(t.headline || 'Vielen Dank!')}</h1>
      <p class="thank-body">${esc(t.body || 'Wir haben deine Angaben erhalten und melden uns bei dir.')}</p>
      ${shareButtons}
      ${t.footerNote ? `<p class="thank-footer">${esc(t.footerNote)}</p>` : ''}
    </section>`;

  renderSteps();
  updateProgress();
  focusScreen();
}

function renderFatal(msg, allowHtml = false) {
  document.body.innerHTML = `
    <div class="shell">
      <div class="fatal">
        <div class="logo-mark logo-mark-lg">!</div>
        <div class="thank-body">${allowHtml ? msg : esc(msg)}</div>
        <p class="fatal-back"><a href="./">← Zurück zur Stellenanzeige</a></p>
      </div>
    </div>`;
}

init();
