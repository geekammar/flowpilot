# FlowPilot — Design System

> Product design philosophy and rules. Implemented tokens live in
> `src/app/globals.css`; primitives in `src/components/ui` and
> `src/components/shared`. Last updated: Prompt 02.

## Design Philosophy

### Language & Direction

- **Arabic-first**: all UI copy is Arabic; the product reads naturally in
  Arabic, not translated-English.
- **RTL-first**: `dir="rtl"` is the default document direction. Every
  component must work mirrored. Use logical CSS properties only
  (`ms/me`, `ps/pe`, `start/end`) — never physical `left/right` margins.
- Numbers use tabular figures where alignment matters (stat values, tables).

### Responsive Strategy

- **Mobile-first**: base styles target phones (most owner usage).
- Breakpoints: mobile (< 768px), tablet/desktop (`md:` 768px+).
- Desktop: fixed **right sidebar** (inline-start in RTL) + sticky header.
- Mobile: sticky top bar + **bottom navigation** with safe-area padding.

## Design Inspiration

| Product | What we take                                                    |
| ------- | --------------------------------------------------------------- |
| Linear  | Deep-neutral dark theme discipline, calm motion, keyboard focus |
| Stripe  | Typography hierarchy, restrained color, trust cues              |
| Attio   | Clean data tables, quiet chrome                                 |
| Notion  | Friendly emptiness, generous whitespace                         |

## Visual Principles

1. **Clean** — one primary action per view; content over chrome.
2. **Premium** — soft low-elevation shadows, refined indigo brand color,
   consistent 4px spacing rhythm.
3. **Calm** — subtle transitions (120–280ms, expo ease-out); no bounce,
   no parallax, no confetti.
4. **Trustworthy** — high contrast where it matters, honest empty states,
   clear status language.

## Explicitly Avoid

- ❌ Neon colors / saturated gradients
- ❌ "Futuristic AI" gimmicks (glow, robots, sparkles everywhere)
- ❌ Cluttered dashboards with vanity widgets
- ❌ Decorative animations that delay interaction
- ❌ English-first copy with Arabic as an afterthought

## Typography

- **Primary:** IBM Plex Sans Arabic (400/500/600/700) — Arabic + Latin.
- **Mono:** Geist Mono — code/tabular contexts only.
- Scale: Tailwind defaults; page titles `text-xl sm:text-2xl font-semibold`,
  section titles `text-base font-semibold`, body `text-sm`.
- Headings track tight (`tracking-tight`); body line-height relaxed for Arabic.

## Spacing

4px base rhythm. Component paddings: cards `p-5`, list rows `py-2.5 px-3`,
page gutters `px-4 sm:px-6`. Section vertical gap `space-y-6/8`.

## Layout Philosophy

- Content column max-width `max-w-6xl`, centered.
- Page anatomy: `PageHeader → stats grid (optional) → sections`.
- Tables scroll horizontally on small screens; identity columns stay visible.
- Empty states are actionable (icon + title + description + next step button).

## Color Tokens

Semantic tokens only (never raw hex in components):
`background/foreground/card/popover`, `primary/secondary/muted/accent`,
`destructive`, status colors `success/warning/error/info` (+ foregrounds),
sidebar family, chart palette 1–5. Dark theme = `.dark` class overrides.

## Status System

Canonical statuses live in `src/lib/status.ts`; render via `StatusBadge`.
Tones map to token colors: success/warning/error/info/neutral. Domain statuses
(`pending, confirmed, cancelled, no-show, need-human, ai-active, booked,
incomplete`) each have a fixed tone + icon + Arabic label.

## Accessibility Principles

1. **Keyboard navigation** — all interactive elements reachable and operable;
   row-clickable tables support Enter/Space.
2. **Focus states** — global `:focus-visible` ring (`ring-3 ring-ring/50`);
   never remove outlines without replacement.
3. **ARIA labels** — icon-only buttons must have `aria-label`; nav landmarks
   labeled; active nav items set `aria-current="page"`.
4. **Contrast** — body text ≥ 4.5:1, large text ≥ 3:1 against its background
   in both themes; status colors chosen to pass on white/dark surfaces.
5. **Skip link** — root layout provides "تجاوز إلى المحتوى الرئيسي".
6. Screen-reader-only text (`.sr-only`) for decorative structure.

## Review Checklist (before shipping any screen)

- [ ] All copy in Arabic; RTL layout intact (no physical left/right)
- [ ] Works at 360px width; bottom nav doesn't cover content
- [ ] Keyboard-only pass completed; focus visible
- [ ] Empty + loading + error states designed, not just the happy path
- [ ] No neon/gradients/gimmicks introduced
