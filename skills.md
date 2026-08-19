# Recruiting Quiz Engine – Skills Matrix & Development Guide

## 1. Core Skills Required

| Skill                   | Level        | Why                                                        |
| ----------------------- | ------------ | ---------------------------------------------------------- |
| **JavaScript (ES6+)**   | Advanced     | Core engine, DOM manipulation, async, state management     |
| **CSS3 + Flexbox**      | Proficient   | Mobile‑first, CSS variables, animations, responsive design |
| **HTML5 / Semantics**   | Proficient   | Accessibility, form handling, iframe embedding             |
| **JSON**                | Basic        | Config authoring and validation                            |
| **Git**                 | Basic        | Version control for configs                                |
| **Webhook / REST APIs** | Basic        | Sending POST requests with retry logic                     |
| **Figma / Sketch**      | Nice‑to‑have | Creating component mockups for client approvals            |

## 2. Development Environment

- **IDE**: VS Code with Prettier, ESLint (optional)
- **Local server**: `npx serve` or Live Server extension
- **Testing**: Manual cross‑browser (Chrome, Firefox, Safari, mobile Chrome/Safari)
- **Deployment**: Vercel CLI or GitHub integration

## 3. Testing Strategy

| Test Type       | Coverage                                  | Tools                           |
| --------------- | ----------------------------------------- | ------------------------------- |
| **Unit tests**  | Scoring engine, knockout evaluator        | Node `node:test` via `npm test` |
| **Integration** | Webhook delivery (mocked)                 | Postman / curl                  |
| **End‑to‑end**  | Full quiz flow (desktop + mobile)         | Playwright / Cypress (optional) |
| **Manual QA**   | Branding, responsiveness, form validation | Browser DevTools                |

## 4. Deployment Checklist

- [ ] Webhook URL updated in each quiz JSON
- [ ] Logo URLs absolute and accessible
- [ ] `vercel.json` permits iframe embedding (`frame-ancestors *` in CSP; `X-Frame-Options` intentionally not sent)
- [ ] Quiz loads with `?q=ppc-performance-marketing` and `?q=moebel-verkauf`
- [ ] Iframe auto‑resize works on parent page
- [ ] `meta` tags set for social sharing (optional)
- [ ] `robots.txt` allows indexing (optional)
- [ ] Analytics (Plausible / custom) enabled (if desired)

## 5. Adding a New Client Quiz – Step‑by‑Step

1. **Copy** an existing JSON (e.g., `ppc-performance-marketing.json`)
2. **Edit** `id`, `client` (logo, colours), `questions`, `scoring`, `knockoutFlags`
3. **Replace** `webhook.url` with the client's CRM endpoint
4. **Update** `candidateMessage` (personalised thank‑you)
5. **Test** locally with `?q=your-new-id`
6. **Deploy** (push to Git → Vercel auto‑deploys)
7. **Embed** on the client's landing page using the iframe snippet.

## 6. Common Pitfalls & Solutions

| Pitfall                             | Solution                                                            |
| ----------------------------------- | ------------------------------------------------------------------- |
| Webhook not receiving data          | Check CORS, network tab; enable retry logic                         |
| Iframe height jumps                 | Ensure `postMessage` sent on every render; parent listens           |
| Multi‑select "Keinem" not exclusive | Use JavaScript to uncheck others on change                          |
| Brand colours not applying          | Verify CSS variable names match JSON keys                           |
| Auto‑advance feels too slow/fast    | Adjust `setTimeout` duration (280ms recommended)                    |
| Scores not calculating correctly    | Verify category weights sum to 1.0; normalise per‑category averages |

## 7. Future Skill Extensions

- **React / Vue**: If you later build an admin dashboard (but not for the quiz itself)
- **Node.js / Express**: If you need a proxy for webhook retry or data storage
- **SQL / Firebase**: If you want to store quiz results persistently
- **CI/CD**: Automate testing and deployment via GitHub Actions

## 8. Developer Onboarding

1. Clone repo
2. Run `npm install` then `npm test` (unit tests for scoring + knockouts)
3. Run `npx serve` in root
4. Open `http://localhost:3000/?q=ppc-performance-marketing`
5. Open DevTools → Console to see webhook payload (if no URL configured)
6. Read `README.md` and this `Skills.md`
