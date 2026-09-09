# CLAUDE.md

Guidance for Claude Code working in this repo.

## What this is

Config-driven recruiting quiz engine: React 18 + TypeScript + Tailwind + shadcn/ui, bundled by Vite as a
multi-page app. Built for PPC GmbH (Saarbrücken) to replace WordPress/Elementor/Thrive Quiz Builder. One
JSON file per client quiz — a new client is a new JSON in `quizzes/`, not a code change. Deployed on Vercel
(`netlify.toml` is an optional alternative). The quiz page supports iframe embedding (P0, for third-party CMS
embeds — see `product.md`), but this repo's own landing page links out to it as a full page navigation,
matching the real my-next-job.de pattern (job ad → separate online-test page). See `README.md`, `product.md`,
`design.md` for detail; this file covers only what a coding agent needs.

`legacy/` holds the pre-migration vanilla-JS version (`legacy/src/quiz.js` & co.). It is dead reference
material — never edit it, never import from it.

## Architecture

```
index.html              # landing page (job ad) — site root; mounts src/entries/landing.tsx
app.html                # quiz engine — mounts src/entries/quiz.tsx, reads ?q=<quizId>
impressum.html          # legal pages, same pattern
datenschutz.html
src/
  entries/*.tsx         # one thin mount per HTML page
  pages/Landing/        # job-ad sections; all copy lives in content.ts
  pages/Quiz/
    QuizApp.tsx         # boot (?q → fetch config → applyBranding), screen routing, webhook delivery
    machine.ts          # reducer + Screen union: loading → question → (rejection | lead) → thank
    Shell.tsx           # header, steps sidebar, job card, progress
    screens/*.tsx       # Question, Rejection, Lead, ThankYou, Fatal
  pages/Legal/
  lib/
    scoring.ts          # weighted category scoring + knockout rule evaluation
    webhook.ts          # builds the payload, POSTs with retry/backoff
    branding.ts         # applyBranding(): quiz JSON branding{} → CSS custom props on :root
    embed.ts            # postMessage height sync for when app.html IS embedded elsewhere
    answers.ts, types.ts, utils.ts
  components/ui/        # shadcn/ui primitives
  styles/tokens.css     # design tokens; landing.css / quiz.css import and extend them
api/send-email.ts       # Vercel serverless SMTP2GO relay — the webhook target (/api/send-email)
quizzes/*.json          # one file per client
assets/                 # logos + photos, served verbatim (not bundled)
test/*.test.ts          # vitest: scoring, lead form, webhook payload parity + delivery
```

`@/` is an alias for `src/` (see `vite.config.ts` and `tsconfig.json`).

`quizzes/` and `assets/` deliberately stay at the repo root instead of `public/` — the `rootStaticDirs`
plugin in `vite.config.ts` serves them in dev and copies them into `dist/` on build. Bundles go to
`dist/static/` so they never collide with `assets/`.

Everything on the quiz page is driven by `?q=<quizId>` fetching `quizzes/<quizId>.json` at runtime. There is
intentionally **no quiz picker/directory page** — a candidate only ever sees one quiz, reached via one link
from one job ad. Without `?q=`, `QuizApp` shows a "Kein Test ausgewählt" fatal screen.

## Screen flow (don't reintroduce a "lead form for everyone" path)

`quizReducer` in `src/pages/Quiz/machine.ts` is the only place screens change:

- `config_loaded` → `question` at `qIndex: 0`. There is **no welcome/intro screen**: the job ad already sold
  the test, so the link drops the candidate straight onto the first question. Don't add one back.
- `answered` advances `qIndex`; the quiz only moves forward, there is no back button
- `completed` → `lead` when `result.passed`, else `rejection`

Routing reads the single `QuizResult` computed once when the quiz completes (`evaluateQuiz`); nothing
recomputes scoring later. Rejected candidates get no lead form and produce `candidate: null` plus a
`result.rejectionReason` in the webhook payload. Both paths fire the webhook. This is a lead-quality filter;
keep it intact.

## Non-negotiables (do not break these)

- **Candidates never see scoring.** Screens are Questions → Lead form → "Vielen Dank" (or the rejection
  screen). All scoring/tier/knockout data goes into the webhook payload, never the UI.
- **No early exits / no auto-rejection mid-quiz.** Knockout rules are evaluated after the last question and
  only ever surface as `knockoutFlags[]` in the payload for a human recruiter to act on.
- **No cookies, no localStorage, no third-party scripts.** DSGVO-friendly by design — keep it that way.
- **The webhook payload is an external contract.** A CRM/automation already consumes it: key names, nesting
  and ordering must not change. `test/webhook-payload-parity.test.ts` guards this.

## Known gotcha: clean URLs + query strings

The hosts serve `/app` and 301 `/app.html` → `/app`, and that redirect **drops the query string** — which is
how the quiz link broke once before. Every internal link, iframe or fetch that carries a query param must use
the extensionless form (`app?q=…`), never `app.html?q=…`. `vite.config.ts` reproduces this in dev and preview
via the `cleanUrls(['app', 'impressum', 'datenschutz'])` plugin, so dev behaves like production. Note `/index`
is an alias of `/` on the hosts, so never route a query param through it either.

`appType: 'mpa'` is set on purpose: it stops unknown paths from falling back to `index.html`, which would
silently serve the job ad in place of the quiz.

## Local dev

```bash
npm run dev      # vite on http://localhost:3000
npm run build    # tsc --noEmit && vite build → dist/
npm run preview  # vite preview on :4173 (same clean-URL behaviour)
npm test         # vitest run
npm run lint     # eslint
npm run format   # prettier --write .
```

Serve over HTTP — `file://` does not work, the quiz fetches its JSON at runtime.

`api/send-email.ts` needs `SMTP2GO_API_KEY` / `SMTP2GO_SENDER` / `SMTP2GO_RECIPIENT` (see `.env.example`); it
runs on Vercel, not under `vite dev`.

Verifying UI changes: drive a real browser (Chrome DevTools MCP, or a short puppeteer script — puppeteer is a
devDependency) rather than trusting the markup. Landing sections reveal on scroll via framer-motion
`whileInView`, so a naive full-page screenshot captures them still hidden; scroll through first.

## Conventions

- 2 spaces, single quotes, trailing commas — enforced by `.editorconfig` / `.prettierrc.json`. Run
  `npm run format` before finishing.
- All user-visible strings are German (`lang="de"`). Landing copy belongs in
  `src/pages/Landing/content.ts`, quiz copy in the quiz JSON — not inline in components.
- Branding is 100% data-driven: `branding{}` in the quiz JSON → CSS custom props via `applyBranding()`, and
  every Tailwind brand color resolves through those props. Never hardcode a client's colors or logo into CSS,
  Tailwind config or components. When adding a token, write it in `applyBranding()` too, or it silently keeps
  the default while the rest of the page rebrands.
- Slash-opacity utilities (`bg-primary/20`) do **not** work on the brand tokens — a hex in a custom property
  has no alpha channel. Use `color-mix(...)` in an arbitrary value instead.
- CSP (`vercel.json` / `netlify.toml`) is `script-src 'self'` with no `unsafe-inline` — inline `<script>`
  blocks run fine in local dev and are blocked in production. Keep scripts external/module.
