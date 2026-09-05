# Iron Log — Project Context for Claude Code

A personal hypertrophy workout tracker. Single-page React app, no backend, deployed
as a static site on GitHub Pages, installed on the user's phone as a home-screen PWA.

## How this project is built

This is a real Vite + React project — `npm run dev` / `npm run build` just
work, no manual compilation step. (It didn't start this way: it was originally
built inside a chat environment with no project persistence, so the JSX was
hand-compiled with a one-off `esbuild` CLI call and the output committed
directly as `app.js`. That workaround is gone; this section describes the
current setup.)

- The **source of truth** is [src/App.jsx](src/App.jsx) — a single component
  file, JSX with hooks, imported by [src/main.jsx](src/main.jsx) which mounts
  it. This is the file all edits should happen in.
- [src/storage.js](src/storage.js) is a small `localStorage`-backed shim
  (`storage.get`/`storage.set`, imported by `App.jsx`) standing in for the
  Claude Artifact storage API the component was originally written against.
- Icons come from the real `lucide-react` npm package (imported directly in
  `App.jsx`) now that there's a bundler — no more hand-drawn stand-ins.
- `npm install` once, then `npm run dev` for a local server or `npm run build`
  to produce `dist/`.

## Deployed files (GitHub Pages, repo `dombelli22/Iron-Log`)

Deployment is automated: [.github/workflows/deploy.yml](.github/workflows/deploy.yml)
builds with Vite and publishes `dist/` to GitHub Pages on every push to
`main` (via `actions/deploy-pages`). There is nothing to hand-copy or
regenerate — pushing to `main` is the whole deploy step. This needs the
repo's Settings → Pages → Source set to **"GitHub Actions"** once (not
"Deploy from a branch") for the workflow to be allowed to publish.

- [index.html](index.html) — Vite entry point; loads `/src/main.jsx` as a
  module. Has inline error-reporting JS that replaces the page with a visible
  error message on failure (added because a prior in-browser-Babel approach
  failed silently with a blank screen — see "Known issues" below). This inline
  script and its `.diag` styling are deliberately kept inline (not in the
  bundled CSS/JS) so they still render if the app bundle itself fails to load.
- `public/manifest.json` — PWA manifest (name, icons, `display: standalone`)
- `public/sw.js` — minimal offline-caching service worker; bump the `CACHE`
  constant when the precached shell files change so old caches get evicted
- `public/icon-192.png`, `public/icon-512.png` — app icon (dark background,
  red dumbbell), generated with Pillow, not a design tool — fine as a
  placeholder, could be improved
- Everything under `public/` is copied as-is into `dist/` by Vite; nothing
  under `src/` is served directly — it's bundled.

iOS-specific: `index.html` includes `apple-touch-icon`,
`apple-mobile-web-app-capable`, and `viewport-fit=cover` + `env(safe-area-inset-top/bottom)`
padding on the sticky header/footer — iOS standalone PWAs render under the
notch/status bar by default and need this explicitly.

## Data model

`WORKOUT_DATA`: an object keyed by day name (`Monday`, `Tuesday`, `Wednesday`,
`Friday`, `Saturday` — no `Thursday`, it's a rest day and isn't in the log UI).
Each day has `slots` (muscle sub-regions, e.g. `"Chest — Upper"`,
`"Triceps — Lateral Head"`). Each slot has `exercises`, each tagged:

- `type`: `"reps"` or `"time"` (time = isometric holds, Saturday only)
- `equip`: `"Barbell" | "EZ-Bar" | "Dumbbell" | "Cable" | "Machine" | "Bodyweight"`
  — drives which weight dropdown list is shown

Weight dropdown ranges by equipment (all generated, not hand-typed lists):
- Barbell: 45–495 lb by 5 (45 lb bar + 2.5 lb plates/side)
- EZ-Bar: 20–150 lb by 5 (lighter bar)
- Dumbbell: 5–150 lb by 5
- Cable / Machine: 2.5–250 lb by 2.5 (stack machines vary in increment)
- Bodyweight: blank (bodyweight) or +5–100 lb by 5 (added weight)

Reps: dropdown 1–20 for `"reps"` type. Timed exercises get a free-text
seconds input instead (holds run well past 20).

`MUSCLE_MAP`: keyed by exercise name (not by slot — names are reused across
days), gives `primary`/`secondary` muscle keys for the whole-body diagram, and
an optional `detail: { muscle, region }` for exercises that target a specific
head/region (tricep long/lateral/medial, bicep long/short/brachialis, chest
upper/middle/lower) — these get an extra zoomed diagram.

`REP_RANGE_TYPE`: keyed by exercise name, `"compound"` (6–10 reps) or
`"isolation"` (10–15 reps) — this is the hypertrophy rep-range convention the
whole plan was built around. Used to show a "bump the weight" nudge when the
last logged set for that exercise hit or exceeded the top of its range.

`SLOT_EXERCISE_LIBRARY` / `BODY_PARTS`: derived once from `WORKOUT_DATA` — the
union of every exercise ever listed under a given slot name, grouped by body
part (the part before " — " in the slot name). Powers the "add an exercise
that's existing in the plan" guided flow (body part → specific part →
exercise), independent of which day you're viewing.

## Logging model (per day, in component state)

- `draft`: fixed-slot entries, keyed by slot name — `{ exercise, notes, sets }`
- `customDraft[day]`: manually-added exercises (free-typed name, manual
  weight/reps, no dropdowns) — `{ id, exercise, notes, sets }`
- `addedDraft[day]`: exercises pulled from the plan library via the guided
  flow — structured like a normal slot (dropdowns, diagram, etc.) but not
  one of the day's default slots — `{ id, slotName, exercise, notes, sets }`
- Every `sets` entry is `{ weight, value, extra }` — `extra` is an optional
  attached superset/drop-set: `{ type: "superset"|"dropset", exercise, weight, value }`,
  always manually entered regardless of whether the parent set is
  structured or custom
- `notes` is **one shared field per exercise**, not per set — deliberate,
  the user wanted form-cue notes that apply across all sets of that exercise
- On save, all three drafts get flattened into `sessionBlocks` and appended
  to history (`localStorage` key `ironlog:workout-history`, JSON array of
  `{ id, date, day, blocks }`); each `block` is `{ slot, exercise, type, notes, sets }`

`removedFromSlots` (`localStorage` key `ironlog:workout-removed-exercises`):
lets the user permanently delete an exercise option from a slot's library
(persisted, not per-session). A slot is never allowed to reach zero options.

"Last time" lookup: scans history most-recent-first for the last block
matching an exercise name, and returns its **single best set** — highest
weight wins outright, reps/time only break a tie at equal weight (not the
highest-volume set, and not an average). Custom exercises get the same
lookup but scoped to only `slot === "Custom"` blocks, so it only fires when
the typed name matches something previously logged as custom too.

## Visual design conventions

- Dark theme: `--bg:#101113`, `--surface:#1A1B20`, `--surface-2:#222329`,
  `--border:#2D2E35`, `--text:#EEEAE5`, `--text-muted:#8C8F97`
- Accent (primary color, used sparingly — buttons, active states, volume
  counter): `--accent:#D6293B` (red)
- Secondary accent for timed/isometric exercises only: `--time:#9FB0C0` (steel
  gray-blue) — kept visually distinct from the red accent
- Fonts: **Metal Mania** for the "IRON LOG" wordmark only (one bold moment,
  used nowhere else), **Oswald** for headers/stat numbers/day tabs, **Inter**
  for everything else (exercise names, inputs, body text) — Inter was chosen
  specifically for legibility of numbers being read quickly mid-workout

## Known issues / things not yet fixed

- **Cross-day slot collision**: `draft` is keyed by slot name only, not by
  `day + slot name`. Slot names repeat across days (e.g. `"Chest — Upper"` on
  both Monday and Friday), so in-progress (unsaved) entries for a shared slot
  name can bleed between days if you switch days mid-session without saving.
  Not yet fixed — lower priority since normal usage is one day per session.
- No automated tests exist.
- `Preacher Curl` is on the standard barbell range, not EZ-Bar, even though
  it's commonly done with an EZ bar in practice — only exercises with
  "EZ-Bar" literally in the name got the EZ-Bar weight range. Intentional
  simplification, flagged to the user, never revisited.

## Preferences expressed during development (worth keeping in mind)

- Prefers being told the reasoning/tradeoffs behind a change, not just the
  change itself
- Wanted every design choice (colors, fonts, icons) to be deliberate and
  explained, not default/generic-looking
- Is not deeply technical — struggled with GitHub's mobile app lacking a
  Settings menu, and with a prior in-browser-Babel deploy approach that
  failed silently. Prefers being told exactly what to click/where, and
  appreciates visible error messages over silent failures.
