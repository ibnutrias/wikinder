# Wikinder design system

The single source of truth for colour, type, spacing, shape and motion. If a
value is not in this document, it does not belong in a component. All tokens
live in `app/globals.css` as daisyUI theme variables or Tailwind theme entries.

Direction: **an encyclopaedia you can touch, fast and quiet.** Strong
typography, one decisive accent, flat surfaces, very little decoration, every
element earning its place.

---

## 1. Typography

| Role | Family | Weights | Notes |
| --- | --- | --- | --- |
| UI, headings, buttons, labels | **Schibsted Grotesk** | 400 / 500 / 600 / 700 | Loaded with `next/font/google`, self-hosted, subsets `latin` + `latin-ext`, `display: swap`. |
| Long-form reading (Reader, card summaries) | **Newsreader** | variable, optical size axis on | Same loading strategy. |

No italics, no display serif, no Inter/Geist/Roboto/Poppins/Arial/system-ui as
the primary UI face.

### Type scale

Only these steps exist. Utilities are defined in `globals.css`.

| Token | Utility | Size | Line height | Use |
| --- | --- | --- | --- | --- |
| 12 | `t-12` | 12px | 1.4 | Meta, counts, tab labels, helper text. |
| 14 | `t-14` | 14px | 1.45 | Interface default: buttons, rows, dense copy. |
| 16 | `t-16` | 16px | 1.55 | Body copy of the app, form text. |
| 18 | `t-18` | 18px | 1.55 | Card summaries (Newsreader), sheet titles. |
| 22 | `t-22` | 22px | 1.3 | Section headings, empty-state titles. |
| 28 | `t-28` | `clamp(24px, 19px + 1.3vw, 28px)` | 1.2 | Card titles, page section lead. |
| 36 | `t-36` | `clamp(28px, 19.8px + 2.2vw, 36px)` | 1.1 | Page titles, session summary. |

Rules:

- Interface text is never smaller than 14px; reading text is never smaller than 16px.
- Headings use `text-wrap: balance`; paragraphs use `text-wrap: pretty`.
- No justified text, no negative extreme tracking (headings use −0.012em…−0.02em).
- Uppercase is limited to short tokens (≤ 3 words). No long all-caps lines.

Reading size is user-controlled in five steps: 16 / 18 / 22 / 28 / 36 px,
applied through `--reader-size`. Reading line height is 1.5 / 1.65 / 1.8.

---

## 2. Colour

Four themes, one accent each. Status colours (success/error/warning) are only
used for real status, never decoration.

### `terang` (default)

| Token | Value | Role |
| --- | --- | --- |
| `--color-base-100` | `#F5F6F8` | Page |
| `--color-base-200` | `#FFFFFF` | Raised surface |
| `--color-base-300` | `#E9ECF1` | Muted surface |
| `--color-base-content` | `#14161A` | Text |
| `--muted` | `#4A505C` | Secondary text |
| `--color-primary` | `#2536D8` | Accent / actions |
| `--color-primary-content` | `#FFFFFF` | Text on accent |
| `--hairline` | `#D7DBE3` | Dividers |

### `gelap`

| Token | Value |
| --- | --- |
| `--color-base-100` | `#0F1115` |
| `--color-base-200` | `#171A20` |
| `--color-base-300` | `#21252E` |
| `--color-base-content` | `#E8EAEE` |
| `--muted` | `#A7ADB9` |
| `--color-primary` | `#9AA6FF` (text on it `#0B1030`) |
| `--hairline` | `#2A2F38` |

No glow, no neon, no coloured halos.

### `sepia` (reading theme)

| Token | Value |
| --- | --- |
| `--color-base-100` | `#F1E6CF` |
| `--color-base-200` | `#F8F0DE` |
| `--color-base-300` | `#E4D5B4` |
| `--color-base-content` | `#3A2E1F` |
| `--muted` | `#6A5740` |
| `--color-primary` | `#7A2E1B` |

### `kontras`

Pure black on white with a deep navy accent (`#0A2540`), borders raised to 2px.
Black on white measures 21:1.

### Measured contrast

`node scripts/check-contrast.mjs` audits 15 real text/background pairs per
theme (60 total) straight from `globals.css`. **All 60 pass WCAG AA.** Lowest
margins:

| Theme | Lowest pair | Ratio | Minimum |
| --- | --- | --- | --- |
| terang | success text on page | 4.83 | 4.5 |
| terang | secondary text on page | 7.49 | 4.5 |
| gelap | secondary text on raised | 7.74 | 4.5 |
| sepia | secondary text on page | 5.56 | 4.5 |
| kontras | success text on page | 9.11 | 4.5 |

Re-run the script after any palette change and update this table.

---

## 3. Shape

Three radius steps only:

| Token | Value | Use |
| --- | --- | --- |
| `--radius-selector` | 6px | Small controls, chips, segmented segments |
| `--radius-field` | 10px | Buttons, inputs, collection cards |
| `--radius-box` | 16px | Deck cards, sheets, page panels |

No `rounded-3xl`, no pill-shaped containers for content, no circles except the
switch knob and the cover monogram's optical centre.

## 4. Depth

One rule, applied everywhere:

- **Static surfaces** (collection cards, settings rows, panels): `border: 1px solid var(--hairline)`, **no shadow**.
- **Floating layers** (deck card, sheet, toast, menu): **shadow only**, no hairline border (`--shadow-float`, `--shadow-sheet`).

Never both on the same element. No nested cards: separate content with spacing,
typography and rules.

## 5. Spacing

Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64.

Spacing must vary meaningfully. Related elements sit close (4–8px); groups are
separated by 24–32px; page sections by 48–64px. A heading is always closer to
its own content than to the block above it.

## 6. Motion

| Token | Value |
| --- | --- |
| `--duration-fast` | 120ms |
| `--duration-base` | 200ms |
| `--duration-slow` | 320ms |
| `--ease-out-strong` | `cubic-bezier(.22,1,.36,1)` |

- No bounce or overshoot on dialogs, sheets, or toasts.
- Spring is used only for the deck card's drag release (`stiffness 420, damping 36`).
- No repeating decorative animation (pulse dots, marquees, blinking cursors).
- Content is visible by default and never waits for an animation.
- `prefers-reduced-motion` and the in-app "Kurangi" setting both disable
  transitions and smooth scrolling.

## 7. Icons

Sizes 16 / 20 / 24 only, `strokeWidth={1.5}`. No emoji as icons. Icon-only
controls require `aria-label` (`IconButton` enforces this at the type level).

## 8. Components

Primitives in `components/ui/`: `Button`, `IconButton`, `Sheet`, `Menu`,
`Segmented`, `SwitchRow`, `ListRow`, `Toast` (global viewport), `EmptyState`,
`ErrorState`, `Skeleton`, `PageHeader`.

Every control defines default, hover, focus-visible, active, disabled and (where
it can wait on work) loading states. Minimum target is 44×44px; primary deck
actions are 56–64px and sit in the thumb zone.

## 9. Forbidden patterns

- Purple-blue gradients, radial spotlights, glassmorphism (`backdrop-blur`), noise textures.
- Cards inside cards; thick accent stripes on card edges; icon-in-coloured-box above a heading.
- Decorative pill badges or small labels above headings; shelf numbers ("No. 0042").
- Centred long paragraphs; justified text.
- Emoji as icons; positive letter-spacing on body copy.
- Shadows and borders on the same element.
- Values outside this document in component code.

## 10. Intentional decisions

| Decision | Why |
| --- | --- |
| `sepia` uses a cream background while other themes are neutral grey | It is an explicit reading theme; cream is the point. |
| Cover monogram is 4–7rem (`cover-monogram`) | It is display art, not interface text, so it sits outside the type scale. |
| Language chip sits on the card image | It labels content language, distinct from the app's browsing language in the header. |
| Deck card has a shadow and no border | It is a draggable floating layer. |
| `kontras` uses 2px borders | Thicker lines are part of the high-contrast contract. |
| `join` is excluded from daisyUI | daisyUI 5.7 emits an `@scope` rule that Turbopack's parser rejects; segmented controls are hand-rolled with the same tokens. |
