# New client checklist

Repo is a GitHub template. New client = new repo from template, own Vercel project, own domain. Landing gets its own optimized design each time (not shared/config-switched) — quiz questions are config-driven already.

## 1. Create repo

GitHub → this repo → "Use this template" → "Create a new repository" → name it `mynextjobfrage-<client>` (or client's own naming).

## 2. Swap quiz

- Copy `quizzes/ppc-performance-marketing.json` → `quizzes/<client-id>.json`.
- Edit: `branding{}` (colors, logo), `questions[]`, `scoring{}` (weights, knockouts, `rejectThreshold`), `lead{}` fields, `webhook.url`.
- See `README.md` / `product.md` for full JSON schema.

## 3. Swap landing copy + assets

- `src/pages/Landing/content.ts` — edit `company`, `hero`, `jobInfo`, `benefits`, `jobDetails`, `team`, `finalCta`, `processHeading`, `processSteps`. This file is the single source of client text — nothing else references it.
- `QUIZ_LINK` in the same file → `'app?q=<client-id>'` (extensionless — see `cleanUrls` gotcha in `CLAUDE.md`).
- `assets/` — replace logo + photos, same filenames or update paths in `content.ts`.

## 4. Redesign landing for this client

Sections (`Hero.tsx`, `Benefits.tsx`, `ProcessSteps.tsx`, `Team.tsx`, `FinalCta.tsx`) are code, not config — that's intentional so each client's landing can be visually optimized rather than reskinned. Adjust colors/layout/icons per client here.

## 5. Deploy

- Push repo to GitHub (already done if created from template + cloned).
- https://vercel.com/new → import the new repo → deploy. `vercel.json` (build/output/CSP/cleanUrls) carries over as-is.
- Point client's domain at the new Vercel project.

## 6. Verify before going live

- `npm test` — scoring/knockout unit tests pass.
- Full run-through in browser: Q1 → last question → lead form (or rejection screen) → webhook fires with real payload.
- Webhook URL in `quizzes/<client-id>.json` points at the client's real inbox/integration, not a test endpoint.
