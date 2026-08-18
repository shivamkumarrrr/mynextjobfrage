# Recruiting Quiz Engine – Product Plan

## 1. Product Vision
**A white‑label, embeddable assessment platform for recruiting agencies.**  
Replace rigid, slow WordPress plug‑ins with a lightweight, config‑driven quiz engine that delivers real candidate insights – without ever showing the candidate their score.

## 2. User Personas

| Persona | Needs | Pain Points |
|---------|-------|-------------|
| **Recruiter** (Client) | Instant lead qualification, score breakdowns, knockout flags | Manual screening of unqualified leads, slow response times |
| **Candidate** (Job Seeker) | Fast, mobile‑friendly quiz with clear questions | Clunky forms, immediate rejection, no feedback |
| **Agency Admin** (You) | One‑click deployment for new clients, minimal maintenance | WordPress updates, plugin conflicts, hosting costs |

## 3. Core Features (MVP)

| Feature | Priority | Description |
|---------|----------|-------------|
| **JSON‑driven quiz config** | P0 | Each quiz = one JSON file; no code changes for new clients |
| **Weighted scoring engine** | P0 | 4 categories with configurable weights; per‑answer 0‑100 points |
| **Knockout flag evaluator** | P0 | Post‑quiz evaluation of rules (AND/OR); flags sent only to webhook |
| **Lead capture form** | P0 | Always shown; fields: name, email, phone (required) + optional extras |
| **Webhook delivery** | P0 | Full payload (scores, flags, answers) sent to client CRM |
| **iframe embed** | P0 | Auto‑resize via postMessage; works on any CMS |
| **Single‑select auto‑advance** | P1 | 280ms highlight → next question; feels snappy |
| **Multi‑select with "Keinem" exclusivity** | P1 | Checkbox UX with auto‑deselect logic |
| **Branding via CSS variables** | P1 | Logo + primary/accent colours loaded from config |
| **Mobile‑first responsive** | P0 | Designed for 375px; tap targets ≥48px |
| **Thank‑you with social sharing** | P1 | WhatsApp, LinkedIn, Facebook buttons (opt‑in) |

## 4. Future Enhancements (Post‑MVP)

| Feature | Rationale |
|---------|-----------|
| **Admin dashboard** | Visual config editor + analytics (drop‑off, avg scores per question) |
| **A/B testing** | Test different question orders or thresholds |
| **PDF candidate report** | Recruiter downloads a formatted scorecard |
| **Multi‑language** | Switch JSON and UI strings via ?lang= parameter |
| **CAPTCHA** | Prevent bots (only if needed) |
| **File upload** | Candidate attaches CV after quiz |

## 5. Success Metrics

- **Completion rate** ≥ 80% (vs. Thrive's ~65%)
- **Time to deploy new client** ≤ 15 minutes (vs. 2+ hours with WP)
- **Lead‑to‑contact** conversion from quiz > 40%
- **Webhook success rate** ≥ 99.5% (with retry logic)

## 6. Release Roadmap

| Milestone | Date | Deliverables |
|-----------|------|--------------|
| Alpha | Week 1 | Core engine + 2 sample quizzes; webhook logging to console |
| Beta | Week 2 | Full webhook integration, iframe embed, styling polish |
| Production | Week 3 | First client live (PPC); monitor metrics |
| V1.1 | Month 2 | Multi‑select improvements + analytics dashboard |
| V2.0 | Quarter 2 | Admin panel + A/B testing |
