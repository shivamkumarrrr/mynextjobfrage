# CLAUDE.md

Guidance for Claude Code working in this repo.

## What this is

Standalone, config-driven recruiting quiz engine (vanilla JS, no framework, no build step). Built for PPC GmbH (Saarbrücken) to replace WordPress/Elementor/Thrive Quiz Builder. One JSON file per client quiz. Deployed on Vercel/Netlify. The quiz engine (`app.html`) supports iframe embedding (P0, for third-party CMS embeds — see `product.md`), but this repo's own landing page links out to it as a full page instead, matching the real my-next-job.de site's pattern (hero page → separate `/online-test/`-style page). See `README.md`, `product.md`, `design.md` for full detail — this file only covers what a coding agent needs.

## Architecture

```
index.html             # landing page (job ad) — the site root; CTAs link to app?q=... as a full page navigation
app.html                # quiz engine — loads src/quiz.js, reads ?q=<quizId>; reached via a direct link (or an iframe on a third-party site)
src/
  quiz.js             # state machine + renderer: Welcome → Questions → Lead form → Thank you
  scoring.js          # weighted category scoring + knockout rule evaluation
  webhook.js          # builds payload, POSTs with retry/backoff (1s/2s/4s)
  embed.js            # postMessage height sync for when app.html IS embedded via iframe elsewhere
styles/quiz.css        # design tokens as CSS custom props, overridden per-quiz via branding{}
quizzes/*.json          # one file per client; new client = new JSON, zero code changes
test/scoring.test.js    # node:test unit tests for scoring.js
```

`app.html` has no inline logic — everything is driven by `?q=<quizId>` fetching `quizzes/<quizId>.json` at runtime. There is intentionally **no quiz picker/directory page** — a candidate only ever sees one quiz, reached via one link from one job ad. Without `?q=`, `quiz.js` just shows a "Kein Test ausgewählt" fatal screen. `index.html` (the landing page) is what candidates actually land on; its CTA buttons navigate to `app.html`, they don't embed it.

## Rejection flow (already implemented — don't reintroduce a "lead form for everyone" path)

After the last question, `evaluateAndRoute()` in `quiz.js` computes scoring + knockouts. If `hasKnockout` or `total < scoring.rejectThreshold`, the candidate goes to `showRejectionScreen()` (no lead form, `candidate: null` in the webhook payload) instead of `showLead()`. Both paths fire the webhook — passed candidates with full `candidate` data, rejected ones with `candidate: null` and a `result.rejectionReason`. This is a lead-quality filter; keep it intact.

## Non-negotiables (do not break these)

- **Candidates never see scoring.** Screens are Welcome → Questions → Lead form → "Vielen Dank" only. All scoring/tier/knockout data goes into the webhook payload, never the UI.
- **No early exits / no auto-rejection in the UI.** Knockout rules are evaluated after the quiz completes and only ever surface as `knockoutFlags[]` in the webhook payload for a human recruiter to act on.
- **No cookies, no localStorage, no third-party scripts.** DSGVO-friendly by design — keep it that way.

## Known gotcha: `cleanUrls` + query strings

`vercel.json` sets `"cleanUrls": true`, and local dev (`npm run dev` → `npx serve`) honors the same setting from `vercel.json`. Requesting a path **with** the `.html` extension (e.g. `app.html?q=...`) gets 301/308-redirected to the extensionless path — and `serve` drops the query string on that redirect. Any internal link/iframe/fetch to a page that needs a query param must use the extensionless form (`app?q=...`), never `app.html?q=...`. This exact bug broke the quiz iframe in `index.html` (fixed by pointing it at `app?q=...`). Note `/index?q=...` also redirects and drops the query — `index`/`index.html` are special-cased as aliases of `/` by `serve`'s clean-url handling, so never route a query param through either of those either.

## Local dev

```bash
npm run dev     # http://localhost:3000 via npx serve
npm test        # node --test (scoring + knockout evaluator)
npm run format  # prettier --write .
```

Opening files via `file://` does not work — `quiz.js` fetches quiz JSON over HTTP and explicitly detects and rejects `file:` protocol.

## Conventions

- 2 spaces, single quotes, trailing commas — enforced by `.editorconfig` / `.prettierrc.json`.
- All user-visible strings in the quizzes are German (`lang="de"`).
- Branding is 100% data-driven (`branding{}` in quiz JSON → CSS custom props in `applyBranding()`); never hardcode a client's colors/logo into CSS or JS.
- CSP (`vercel.json` / `netlify.toml`) is `script-src 'self'` with no `unsafe-inline` — new inline `<script>` blocks in HTML will be blocked once deployed even though they run fine in local dev without those headers applied. Prefer external/module scripts for anything new.
