# Recruiting Quiz Engine

Standalone, config-driven recruiting quiz engine for social recruiting funnels. Built for **PPC GmbH (Saarbrücken)** to replace WordPress + Elementor + Thrive Quiz Builder.

Vanilla JS / no framework. Each client = one JSON file in `/quizzes/`. Deployable on Vercel/Netlify and embeddable via iframe on any website.

---

## Non-negotiables implemented

- **No scoring shown to candidates.** Candidates only ever see: Welcome → Questions → Lead form → "Vielen Dank". All scoring/tier/knockout data goes into the **internal webhook payload**.
- **No early exits.** Every candidate completes the full quiz + form. Knockout-relevant answers are flagged internally as `knockoutFlags[]` for the recruiter to decide.
- **Config-driven.** `GET /app?q=<quiz-id>` loads `quizzes/<quiz-id>.json`. New client = new JSON, zero code changes.
- **Mobile-first** (375px), **DSGVO-friendly**: no cookies, no third-party scripts, no localStorage. Self-hosted, EU-hostable.

---

## Project structure

```
mynextjobfrage/
├── index.html              # landing page (job ad) — root URL, CTAs link out to app.html as a full page
├── app.html                # quiz engine — loads a quiz via ?q=<quiz-id>; reached via a direct link (or iframe on a third-party site)
├── src/
│   ├── quiz.js             # renderer + state machine (Welcome→Questions→Lead→Thanks)
│   ├── scoring.js          # weighted category scoring + knockout evaluation
│   ├── webhook.js          # payload builder + POST with retry/backoff
│   └── embed.js            # postMessage height sync for iframes
├── styles/quiz.css         # design system — brand colors via CSS custom props
├── quizzes/
│   ├── ppc-performance-marketing.json
│   └── moebel-verkauf.json
├── test/
│   └── scoring.test.js     # unit tests: scoring engine + knockout evaluator
├── vercel.json             # iframe embedding + CSP headers
├── netlify.toml            # same for Netlify
├── .editorconfig
├── .prettierrc.json
├── .gitignore
├── package.json
└── README.md
```

## Local development

```bash
npm run dev          # starts http://localhost:3000 (npx serve)

# or without npx:
python3 -m http.server 3000
```

Open:

- `http://localhost:3000/` — the landing page (job ad); its CTA buttons link to `/app?q=...`
- `http://localhost:3000/app?q=ppc-performance-marketing` — the quiz engine directly
- `http://localhost:3000/app?q=moebel-verkauf`

> There is no quiz picker/directory page by design — candidates only ever land on one quiz via one link. Without `?q=`, `/app` shows "Kein Test ausgewählt."

> Note: opening `app.html` directly from disk (`file://`) does **not** work — the engine fetches quiz configs over HTTP. Run `npm run dev`.

No webhook configured → the engine logs the full payload to the **browser console** (dev mode).

## Quality checks

```bash
npm test            # unit tests — scoring engine + knockout evaluator
npm run format      # prettier --write .        (fix formatting)
npm run format:check # prettier --check .       (CI-safe)
```

Style conventions (2 spaces, single quotes, trailing commas) are pinned in `.editorconfig` + `.prettierrc.json` so any editor and the CLI agree.

## Deploy to Vercel

```bash
vercel --prod
```

`vercel.json` already ships the headers you need for iframe embedding:

- `Content-Security-Policy: ... frame-ancestors *` (allows any site to embed)
- `Access-Control-Allow-Origin: *` (lets your parent page read responses if needed)

> Note: `X-Frame-Options` is intentionally **not** sent — an invalid value like `ALLOWALL` can make some parsers block the frame. CSP `frame-ancestors *` alone is the correct way to allow embedding.

### Wire up the webhook

Set `"webhook": { "url": "https://your-endpoint.example/leads" }` in the quiz JSON. The endpoint should accept `POST application/json` and may live on the client's server or in your agency stack. Payload shape → see below.

## Embed on any website

```html
<iframe src="https://quiz.my-next-job.de/app?q=ppc-performance-marketing"
  style="width:100%;border:none;min-height:600px"
  id="mnj-quiz"
  title="Bewerbungs-test"></iframe>

<script>
window.addEventListener('message', (e) => {
  if (e.data?.type === 'quiz-resize')
    document.getElementById('mnj-quiz').style.height = e.data.height + 'px';
});
</script>
```

The quiz auto-resizes on every screen change and window resize.

## Quiz flow

```
WELCOME → QUESTIONS (1..n sequential, one per screen) → LEAD_FORM → THANK_YOU
                                                              │
                                                   [webhook POST fires]
```

- **Single select:** tap answer → highlighted in accent color → auto-advance after ~280 ms.
- **Multi select:** checkboxes → „Weiter" button. An `"exclusive": true` answer (e.g. „Keinem") deselects all others when picked.
- **No back button**, no visible knockout, no score/tier display anywhere in the UI.
- Progress bar shows real % of questions answered (also in the sticky right sidebar on desktop).

## Webhook payload (recruiter-side only)

```json
{
  "quizId": "ppc-performance-marketing",
  "quizVersion": "1.0",
  "timestamp": "2026-08-17T11:30:00Z",
  "candidate": {
    "salutation": "Herr",
    "firstName": "Max",
    "lastName": "Mustermann",
    "name": "Max Mustermann",
    "email": "max@example.com",
    "phone": "+49 170 1234567",
    "startDate": "2026-09-01",
    "message": "Hallo, ...",
    "whatsappOptIn": false
  },
  "scoring": {
    "total": 78.4,
    "tier": { "id": "strong", "label": "Starker Fit", "min": 70 },
    "categories": {
      "hardSkills":    { "score": 85, "weight": 0.40, "weighted": 34.0, "label": "Fachliche Kompetenz" },
      "knowledgeTests":{ "score": 100, "weight": 0.25, "weighted": 25.0, "label": "Fachwissen" }
    },
    "hasKnockout": false
  },
  "knockoutFlags": [
    { "id": "deutsch_below_c1",    "description": "Deutsch unter Verhandlungsniveau", "triggered": false },
    { "id": "zero_paid_experience","description": "Keine Google/Meta Ads Erfahrung", "triggered": false }
  ],
  "answers": [
    {
      "questionId": "q_google_ads",
      "questionText": "Wie viele Jahre Erfahrung hast du mit Google Ads?",
      "answer": "4–6 Jahre",
      "answerIndex": 3,
      "points": 85,
      "category": "hardSkills"
    },
    {
      "questionId": "q_cpl_test",
      "questionText": "CPL bei 2.000 € Budget, 50 Leads ...",
      "answer": "40 €",
      "answerIndex": 3,
      "points": 100,
      "category": "knowledgeTests",
      "isCorrect": true
    }
  ],
  "meta": {
    "device": "mobile",
    "completionTimeSeconds": 187,
    "referrer": "https://my-next-job.de/...",
    "userAgent": "Mozilla/5.0 ..."
  }
}
```

`sendWebhook` retries the POST with exponential backoff (1 s → 2 s → 4 s, 3 attempts). The candidate's thank-you screen is shown immediately — the webhook never blocks their UX.

## Scoring model

- Each question belongs to a **category**; each answer carries **0–100 points**.
- **Category score** = average over the category's answered questions.
- **Total** = Σ(category_avg × category_weight).
- **Tier** = first tier where `total >= tier.min` (tiers sorted descending by `min`).
- **Multi-select** = sum of selected answers, capped at `maxPoints`. An `exclusive` answer contributes only its own points.

## Knockout rules

```json
// simple — triggered if the selected index (or any index) is in the list
{ "rules": { "questionId": "q_deutsch", "answerIndex": [0, 1] } }

// AND — all sub-rules must match
{ "rules": { "type": "AND", "rules": [
    { "questionId": "q_google_ads", "answerIndex": [0] },
    { "questionId": "q_meta_ads",   "answerIndex": [0] }
] } }

// OR — any sub-rule must match
{ "rules": { "type": "OR", "rules": [ ... ] } }
```

Knockouts are evaluated **after** completion and only appear as `knockoutFlags[]` in the webhook. The system never auto-rejects and never shows anything to the candidate.

## Add a new client quiz

1. Copy `quizzes/ppc-performance-marketing.json` → `quizzes/<your-client>.json`.
2. Edit these keys:
   - `quizId`, `quizVersion`
   - `branding.primary` / `branding.accent` (hex), optional `branding.logoUrl`
   - `branding` may also override the design tokens `bg`, `text`, `radius`, `font` (see `design.md`)
   - `job.title`, `job.company`
   - `welcome.*`, `leadForm.*`, `thankYou.*`
3. Set `categories` (label + weight), `tiers` (descending `min`, first row's `min` must be ≤ lowest possible total, last row's `min` must be 0). **Weights should sum to 1.0.**
4. Add `questions[]` — every question needs `id`, `category`, `type` (`single_select` | `multi_select`), `question`, `answers[]`. Optional: `maxPoints` (multi), `exclusive` on an answer, `correctAnswer` (index) to emit `isCorrect`.
5. Set `knockoutFlags[]`, `webhook.url` (or leave `""` to log to console).
6. Commit → deploy → point the ad funnel to your landing page (or, for a bare quiz with no landing page, straight to `https://<your-domain>/app?q=<your-client>`).

No JS changes required for a new client.

## Notes & conventions

- **Form:** fields are data-driven via `leadForm.fields[]`. `half: true` fields sit side-by-side (stack on mobile). `required: true` + `type` (text/email/tel/date/textarea) controls validation. `errorMessage` overrides the default.
- **Content Security Policy** in `vercel.json` allows `connect-src 'self' https:` so webhooks can POST to any https endpoint while still blocking third-party script/tracking.
- **Privacy:** no cookies, no analytics, no third-party requests. Referrer (the parent ad page) is relayed in `meta.referrer` — make sure your funnel links run through your own domain so it's meaningful.
- `?q=` is **required** on `/app`; without it, `/app` shows "Kein Test ausgewählt" instead of a quiz. The root URL (`/`) is the landing page, not the quiz engine.