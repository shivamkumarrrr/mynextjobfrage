# Recruiting Quiz Engine – Design System

## 1. Design Principles

1. **Speed above all** – Every interaction must feel instant (auto‑advance, no full‑page reloads).
2. **Mobile‑native** – Thumb‑friendly, readable without zooming.
3. **Brand‑respectful** – Clients' logos and colours dominate; our UI is invisible.
4. **Transparent progress** – Candidates always know how far they are.
5. **No surprises** – Generic thank‑you screen; no score shock.

## 2. Design Tokens (CSS Variables)

Defaults live in `styles/quiz.css` `:root`. **All brandable values are injected at runtime from the quiz JSON** (`src/quiz.js` `applyBranding`); a client override wins over the default below.

```css
/* Brand — overridable via branding: { primary, accent } */
--primary: #1a3a4a; /* Main brand colour   */
--accent: #107a6a; /* Secondary brand      */
--primary-hover: computed (primary × 0.85) --accent-hover: computed (accent × 0.82)
  /* Neutral palette */ --bg: #f8f9fa; /* Page background       (branding.bg) */
--text: #1e1e1e; /* Default text          (branding.text) */
--muted: #4a6a7a;
--text-invert: #ffffff;
--border: #e5e7eb;
--card-bg: #ffffff;
--surface: #f6f7f8;
--track: #e7eaec;
--danger: #dc2626;

/* Interaction surfaces (derived from --accent) */
--card-selected-bg: color-mix(in srgb, var(--accent) 12%, #ffffff);
--card-selected-text: var(--primary);

/* Radius / type */
--radius: 12px; /* Buttons, cards      (branding.radius) */
--radius-sm: 7px; /* Inputs, small elements */
--font: 'Inter', sans-serif; /* (branding.font) */
```

Full mapping of `branding` config keys → tokens:

| Config key | Token                 | Example                    |
| ---------- | --------------------- | -------------------------- |
| `primary`  | `--primary` (+ hover) | `"#1a3a4a"`                |
| `accent`   | `--accent` (+ hover)  | `"#107a6a"`                |
| `bg`       | `--bg`                | `"#f8f9fa"`                |
| `text`     | `--text`              | `"#1e1e1e"`                |
| `radius`   | `--radius`            | `"12px"`                   |
| `font`     | `--font`              | `"'Inter', sans-serif"`    |
| `logoUrl`  | replaces the monogram | absolute URL to logo image |

If `logoUrl` is absent, a coloured monogram (company initials on `--primary`) is rendered instead.

## 3. Layout & Responsive Behaviour

Mobile-first, designed at **375px**, upgraded at two breakpoints:

| Breakpoint | Behaviour                                                                                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `< 768px`  | Single column. Sticky header (brand + badge), progress strip with job title, horizontal stepper on top of the content. Left steps sidebar and right job card hidden. |
| `>= 768px` | 3-column grid: `210px` steps sidebar · central content (max 640px) · `260px` sticky job card. Horizontal stepper and progress strip hidden.                          |
| `<= 520px` | Tighter gutters (14px); side-by-side form fields collapse to one column.                                                                                             |

Layout skeleton:

```
┌ shell ────────────────────────────────────────────┐
│ header (sticky): brand · topbar badge              │
│ mobile strip: job title · progress bar (mobile)    │
│ ┌ shell-layout ────────────────────────────────┐   │
│ │ steps sidebar │ content │ job card (sticky) │   │
│ └──────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────┘
```

The stepper is rendered twice (vertical + horizontal), toggled by breakpoint. Progress (`answered / N`) feeds both progress bars and the step states.

## 4. Components

### Brand / logo

- 34px mark (logo image or monogram), brand name in `--primary`, 600 weight, ellipsis-truncated.
- Welcome screen shows a larger 64px mark.

### Answer cards

- Single select: circular check, `aria-pressed` toggles, accent border/background when `.sel`. **Auto-advance 280ms after tap.**
- Multi select: square check, checkbox UX, `Weiter` button enables only when ≥1 option selected. An `exclusive` option (e.g. "Keinem") deselects all others; selecting a normal option deselects the exclusive one.
- Card height ≥ ~52px (comfortably above the 48px tap target).

### Buttons

- `.btn` pill-free rounded (`--radius`), `--primary` background, inverted text, 16px/600. Press feedback: `translateY(1px)`.
- Disabled state: 45% opacity, `not-allowed` cursor.

### Stepper

- Steps: number bubble (or accent check when `step-done`), vertical connector line on desktop.
- Active step: accent number bubble with soft accent ring; label in `--primary`.

### Progress bar

- 8px rounded track (`--track`) with accent fill, animated width transition (400ms ease-out).
- Semantics: `role="progressbar"` + `aria-valuenow` (see accessibility).

### Lead form

- Title + subtitle, then field rows. Fields marked `half` sit side-by-side in a 2-column grid (stack on tiny screens).
- Inputs: 1px `--border`, `--radius-sm`, focus ring = 3px 20% accent `color-mix`.
- Salutation as pill radio group (default "Keine Angabe"); WhatsApp opt-in as custom checkbox.
- Validation on submit: required + email format; inline `--danger` message per field, focus jumps to first invalid input.

### Thank you

- Animated draw-in checkmark (accent), headline in `--primary`, generic body text — **no score shown**.
- Optional share row: WhatsApp / LinkedIn / Facebook pill buttons, only for tags enabled in `thankYou.share`.

### Fatal (config load failure)

- Centered danger monogram + message; no brand chrome.

## 5. Motion & Animation

| Element           | Animation         | Spec                                                                                             |
| ----------------- | ----------------- | ------------------------------------------------------------------------------------------------ |
| Screen transition | `screenIn`        | 280ms fade + translateY(10px), ease both                                                         |
| Answer entrance   | `answerIn`        | 420ms fade + translateY(8px), `cubic-bezier(.22,.9,.32,1)`; staggered 55ms per answer, cap 440ms |
| Auto-advance      | —                 | 280ms highlight then next question                                                               |
| Progress fill     | width             | 400ms `cubic-bezier(.4,0,.2,1)`                                                                  |
| Checkmark         | draw              | circle 600ms + check 350ms (delayed 500ms)                                                       |
| Button press      | transform         | 100ms `translateY(1px)`                                                                          |
| Selection         | background/border | 150ms ease                                                                                       |

All transitions/animation durations target ≤450ms for perceived snappiness. **`prefers-reduced-motion: reduce` disables screen, answer, and checkmark animations** so content appears instantly.

## 6. Accessibility

- Focus management: the focused heading inside `#screen` receives focus after each screen change (`preventScroll`), with `aria-live="polite"` on the screen container announcing changes.
- Visible focus indicators: 2px accent outline + offset on cards, inputs, pills, checkboxes.
- Answers use `aria-pressed`; progress uses `role="progressbar"` with `aria-valuemin/valuemax/valuenow`; form errors set `aria-invalid` and are announced inline.
- Tap targets ≥48px (answer cards, buttons, share pills).
- Colour pairs respect WCAG AA contrast on the light surface (accent used for state, `--text` for body).
- Fully keyboard-operable: steps, answers, form fields, share links.

## 7. Theming Per Client

Branding is 100% data-driven — no CSS or JS changes for a new client: set `branding` + `job` keys in the quiz JSON. Tokens are applied in `applyBranding()` before the first screen renders, so the whole UI (chrome, progress, states, animations) adopts the client's identity instantly. Darkening of `--primary`/`--accent` produces hover shades automatically; a client can also override `bg`, `text`, `radius`, `font`.
