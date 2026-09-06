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

## Workout plans (multi-plan, since the Home screen was added)

The app is no longer built around one hardcoded plan, and no plan is framed
as "yours" or original to any one person — they're presented as equal,
generic options since anyone using the app picks from the same library.
[src/plans.js](src/plans.js) exports `PLAN_LIBRARY` — currently 6 splits,
each `{ id, name, description, days, defaultSchedule }`, picked from on the
Home screen (`Home` is a `screen` state in `App.jsx`, always shown first on
load, separate from the `view` state that toggles Log/History once inside a
plan): a 5-day PPL+Upper/Lower hybrid, Push/Pull/Legs (6-day), Upper/Lower
(4-day), Full Body (3-day), Bro Split (5-day: chest/back/shoulders/arms/legs,
one muscle group per day), and Arnold Split (6-day: chest+back and
shoulders+arms paired together rather than push/pull, run twice, plus a leg
day). All six draw from one shared catalog, `SLOT_LIBRARY` in `plans.js` — a
single exercise list **per slot name** (e.g. `"Chest — Upper"`,
`"Back — Thickness"`), covering the equipment variants a movement is
commonly done with (a fly on dumbbells, cable, and a pec-deck machine are
three separate list entries, not one). A day's `slots` is built with the
`slots("Chest — Upper", "Front Delts", ...)` helper, which just looks each
name up in `SLOT_LIBRARY` — **every plan that includes a given slot name
gets the exact same exercise list for it**, so adding an exercise to
`SLOT_LIBRARY["Chest — Upper"]` once makes it available in every plan that
has a Chest — Upper slot, with nothing to keep in sync across plans. This
replaced an earlier version of this file where each plan's days inlined
their own (sometimes deliberately different, for A/B variety) exercise
arrays per slot — that variety is gone now in favor of one comprehensive,
consistent list per slot everywhere. Only touch `MUSCLE_MAP`/`REP_RANGE_TYPE`
in `App.jsx` when adding a genuinely new exercise name to `SLOT_LIBRARY`;
reusing an existing name (even across slots, e.g. `"Bulgarian Split Squat"`
appearing in both `"Quads — Primary"` and `"Glutes"`) needs nothing extra.
A `"Rear Delts"` / `"Shoulders — Rear"` naming split that pre-dated this
consolidation was merged into one `"Rear Delts"` slot name.

- `days` has the same per-day shape as the original single plan: keyed by a
  unique day name, each `{ label, subtitle, tab, slots }`. The day *tabs* in
  the app show the assigned real weekday (see schedules below), not `tab` —
  `tab` is the clean, short name for that session shown in the schedule
  editor's dropdown and in History (e.g. "Chest & Back 1", "Legs 2"),
  decoupled from the day key so a plan can give a session a long/prefixed key
  for uniqueness (e.g. `"Arnold Legs 2"`, needed because `"Legs 2"` alone
  already exists in the PPL plan) without that prefix leaking into the UI.
  Day keys must stay unique **across the whole library**, not just within one
  plan — `ALL_DAYS_BY_KEY` (a merge of every plan's `days`, built with an
  explicit collision check that throws at import time rather than silently
  shadowing) relies on that to look up a day's
  label for history entries regardless of which plan was active when they
  were logged.
- `getPlan(id)` and `getScheduledDay(plan, schedule)` are also exported from
  `plans.js`. The latter resolves "today's" day key from a schedule (see
  below): today's real weekday if assigned, else the first assigned weekday
  going forward from Monday, else just the plan's first day.
- The selected plan id persists to `localStorage` key `ironlog:selected-plan-id`.
  Everything derived from the active plan (`workoutData`, `slotExerciseLibrary`,
  `bodyParts`, and the `getSlot`/`getExercise*` helpers) lives inside the
  `WorkoutTracker` component now, recomputed via `useMemo` when the plan
  changes, rather than as module-level constants.

### Day-of-week assignment (schedules)

Which real weekday maps to which of a plan's sessions is never assumed
silently — it's an explicit, editable `schedule`: `{ Monday: dayKey|null, ...,
Sunday: dayKey|null }`, `null` meaning rest. Each plan ships a
`defaultSchedule` (a sensible starting point, e.g. PPL's 6 days fill
Monday–Saturday in order) that's only ever used to pre-fill the editor, not
applied silently.

- The first time a plan is picked from Home, `screen` goes to `"schedule"`
  (`ScheduleScreen` in `App.jsx`) instead of straight into the app, pre-filled
  with `defaultSchedule`, so the user assigns/confirms real days before
  logging anything. Picking a plan that already has a saved schedule skips
  straight back into the app on the right day.
- The calendar icon in the app header (`openScheduleEditor`) re-opens the
  editor for the active plan anytime, pre-filled with its *current* schedule
  (not the default) — this is how assignments get changed later.
- Persists to `localStorage` key `ironlog:plan-schedules`, shape
  `{ [planId]: schedule }` — scoped per plan like `removedFromSlots`.
- The day-tab bar is driven by the schedule, not by `Object.keys(plan.days)`:
  it iterates real weekdays (`WEEKDAYS`, Monday→Sunday) that have a
  non-null assignment, showing the weekday abbreviation as the tab and the
  assigned day's `label` underneath it — a rest day (no assignment) gets no
  tab at all, the same convention the original plan always used for
  Thursday. The same plan-day can be assigned to more than one weekday (e.g.
  repeating a session); `day` state still stores the plan's day key, not the
  weekday, so history entries are unaffected by later schedule edits.
- `removedFromSlots` (see below) is scoped per-plan so removing an exercise
  from a slot in one plan doesn't affect a same-named slot in another plan.
  Picking a **new** plan from Home also resets the in-progress `draft`/
  `customDraft`/`addedDraft` state, so nothing bleeds across plans — the
  known cross-day collision below is still just a same-plan issue.
- History stays global across plans (a lifting log is more useful unified
  than split up), just labeled per-entry via `ALL_DAYS_BY_KEY`.

### Guided plan picker ("Help Me Choose")

`HomeScreen` (`App.jsx`) has its own internal `mode` state (`landing` →
`quizDays` → optionally `quizStyle` → `recommend`, or `landing` → `browse`)
separate from the app-level `screen` state — this is all still "Home", just
sub-navigation within it. Landing offers two entry points: "Help Me Choose"
(the quiz) or "Suggested Splits" (the plain list, same cards as before) —
that label reads oddly against what the button does (a plain browse list,
not curated suggestions); it's deliberate, requested wording, not an
oversight.

The quiz asks how many days a week (3/4/5/6), then — only at 5 or 6 days,
where more than one plan fits — a tiebreak style question (frequency vs.
one-muscle-per-session at 5 days; push/pull-separated vs. paired-muscles at 6
days). `recommendPlanId({ days, fiveDayStyle, sixDayStyle })` maps the
answers to a plan id; it's a plain hardcoded function, not data-driven, so a
new plan added to `PLAN_LIBRARY` won't automatically become reachable by the
quiz — add a branch for it there too if it should be recommendable. The
recommendation screen still shows a "See All Splits Instead" escape hatch to
the full list, and choosing the recommended plan goes through the exact same
`onChoosePlan` path (and first-time schedule assignment) as picking from the
browse list.

### Custom plan builder ("Build My Own Split")

The third Home landing option (`BuildPlanScreen` in `App.jsx`) lets a user
build a plan with no built-in template. It's a small step machine
(`name` → `days` → per-day sub-steps → back to `days` → save) entirely
local to that component; the parent only receives the finished result via
`onSave({ name, days })` when the user hits "Save & Finish".

- Adding a day has two top-level paths: **choose from existing** (pick any
  day, by its `tab` name, from any plan in `existingPlans` — grouped by
  originating plan in `ExistingDayPicker`) clones that day's `label`/`tab`/
  `subtitle`/`slots` verbatim; **name it myself** asks a follow-up — model
  the typed name after an existing day's slots (same picker, but only
  `slots` is cloned, the typed name replaces `label`/`tab`) or build from
  scratch.
- "Build from scratch" adds one slot at a time; the slot name and the
  exercise name each independently toggle (`ModeToggle`) between "Choose
  Existing" (a `<select>`) and "Type My Own" (free text). `GLOBAL_SLOT_LIBRARY`/
  `GLOBAL_SLOT_NAMES`/`GLOBAL_EXERCISE_LIST` (`plans.js`) back the dropdowns —
  `GLOBAL_SLOT_LIBRARY` is just `SLOT_LIBRARY` re-exported (see "Workout
  plans" above), so **built-in plans only**, not merged with any user's
  custom plans at runtime (reusing something a custom plan invented is a
  nice-to-have, not the point of this list).
  Picking an existing slot scopes the exercise dropdown to that slot's own
  exercise pool (falls back to every exercise in the app if the slot name
  doesn't match a known one); picking an existing exercise auto-fills its
  known `type`/`equip` and hides the manual type/equip selectors, since
  they're already known. An exercise chosen from the dropdown is a real
  `MUSCLE_MAP` entry, so it gets the full muscle-diagram treatment same as
  any built-in plan's exercise; one typed manually won't have a
  `MUSCLE_MAP`/`REP_RANGE_TYPE` entry, so it just won't show a muscle
  diagram or rep-range nudge — same graceful fallback custom-typed
  exercises already get elsewhere in the app, not a bug.
- On save, `App.jsx`'s `saveCustomPlan` assigns the plan a
  `custom-<timestamp>` id, and namespaces every day key as `<planId>::<i>`
  — this is what keeps custom-plan day keys collision-proof against the
  static library's collision-checked keys and against each other, without
  needing its own uniqueness check. A `defaultSchedule` is filled Monday
  onward in the order days were added (rest for the remainder of the week),
  same convention as the built-in plans, then it goes straight into the
  normal first-time schedule-assignment screen.
- Persists to `localStorage` key `ironlog:custom-plans` as an array of plan
  objects, same shape as a `PLAN_LIBRARY` entry. `WorkoutTracker` merges
  them in via `allPlans` (`[...PLAN_LIBRARY, ...customPlans]`) and
  `allDaysByKey` (`{...ALL_DAYS_BY_KEY, ...each custom plan's days}`) —
  everything downstream (Home's plan list, the quiz, schedule assignment,
  history labels) reads from these merged values, not the static-only
  exports from `plans.js`, so a custom plan behaves identically to a
  built-in one everywhere. `enterPlan(plan)` takes the plan **object**
  (not an id looked up from `allPlans`) specifically so a just-built custom
  plan can be entered immediately, before the `setCustomPlans` update that
  would make it findable via `allPlans` has actually landed.

## Data model

`WORKOUT_DATA` doesn't exist as a single global anymore — see "Workout
plans" above. What follows still describes the shape of one plan's `days`.

Each day has `slots` (muscle sub-regions, e.g. `"Chest — Upper"`,
`"Triceps — Lateral Head"`). Each slot has `exercises`, each tagged:

- `type`: `"reps"` or `"time"` (time = isometric holds, Saturday only)
- `equip`: `"Barbell" | "EZ-Bar" | "Dumbbell" | "Cable" | "Machine" | "Bodyweight"`
  — shown as a plain label next to the exercise picker (e.g. "Machine"), no
  longer drives a weight dropdown (see below)

Weight is a manual number input (`type="number"`), not a dropdown — actual
weights vary too much machine-to-machine and gym-to-gym to hand-roll a
range per equipment type. This used to be a generated per-equipment dropdown
(`weightOptionsFor`/`BARBELL_WEIGHTS`/etc. in `App.jsx`); that whole
subsystem was removed when weight became manual, so don't reintroduce it
without removing the manual input first. Reps are still a dropdown 1–20 for
`"reps"` type (this doesn't vary by gym, unlike weight) — timed exercises get
a free-text seconds input instead (holds run well past 20).

`MUSCLE_MAP`: keyed by exercise name (not by slot — names are reused across
days), gives `primary`/`secondary` muscle keys for the whole-body diagram,
and an optional `detail: { muscle, region }` for the 51 chest/tricep/bicep
exercises that target a specific head/region (chest upper/middle/lower,
tricep long/lateral/medial, bicep long/short/brachialis). This field is
regenerated mechanically from which slot an exercise lives in
(`SLOT_LIBRARY` in `plans.js` — e.g. everything in `"Chest — Upper"` gets
`{ muscle: "chest", region: "upper" }`), not hand-typed per exercise — if a
chest/tricep/bicep exercise moves to a different sub-region slot, or a new
one is added to one, its `detail` should be derived the same way, not
guessed.

An earlier version of this feature rendered `detail` as a separate small
zoomed diagram (`TricepZoom`/`BicepZoom`/`ChestZoom`/`MuscleDetail`, since
removed) drawn with hand-picked shapes. It's now folded directly into the
main whole-body diagram instead: `DETAIL_OVERLAYS` in `App.jsx` holds
**pre-computed sub-polygons** — the real chest/triceps/biceps shapes from
`react-body-highlighter`'s own coordinate data, geometrically clipped into
thirds (chest: horizontal bands upper/middle/lower; triceps: horizontal
bands long/lateral/medial, combining that muscle's two polygon pieces per
arm; biceps: vertical bands long/short/brachialis, mirrored so "outer" is
correct on both the left- and right-screen arm) — computed once (Python,
Sutherland–Hodgman half-plane clipping) and hardcoded as static point
strings, not clipped at runtime. `BodyFront`/`BodyBack` render the base
`<BodyModel>` as before, except a muscle with a matching `detail` gets
downgraded from "primary" to "secondary" in the base layer
(`statusForOverlay`) — the *specific* sub-region then overlays on top in
full primary color via `DetailOverlay`, an absolutely-positioned sibling
`<svg>` sharing the exact same `viewBox="0 0 100 200"` so the coordinates
line up pixel-for-pixel with the base model underneath. Biceps'
"brachialis" region is a simplification carried over from before this
change: brachialis is really a separate, mostly-hidden muscle beside the
biceps, not a third head of it — shown as the outer sliver of the biceps
shape as the closest visual approximation, not a literal anatomical claim.
Primary uses `--accent` (red); secondary uses `--muscle-secondary` (a warm
amber, `#E3A857`) — a deliberately different hue rather than a dimmed
version of the primary color, so the two read as distinct at a glance.

The whole-body diagram (`BodyFront`/`BodyBack` in `App.jsx`) renders via the
MIT-licensed [react-body-highlighter](https://github.com/giavinh79/react-body-highlighter)
package — real anatomically-traced SVG muscle polygons, not hand-drawn
shapes (an earlier version of this file used simple circles/ellipses/rects;
those are gone). `MUSCLE_KEY_TO_SLUGS` maps this app's internal muscle keys
to that package's muscle slugs; its granularity is coarser than this app's —
no separate lats-vs-mid-back (both map to its one `"upper-back"` region) and
no side/lateral-deltoid shape at all (`sideDelt` maps to *both*
`front-deltoids` and `back-deltoids` as the closest real approximation,
so a side-delt exercise lights up the delt on whichever view — anterior or
posterior — actually has a shape). `statusToBodyData` turns this app's
primary/secondary status object into the package's
`{ name, muscles, frequency }` data shape (`frequency: 2` for primary,
`1` for secondary, matched to `highlightedColors` index `frequency - 1`).

`REP_RANGE_TYPE`: keyed by exercise name, `"compound"` (6–10 reps) or
`"isolation"` (10–15 reps) — this is the hypertrophy rep-range convention the
whole plan was built around. Used to show a "bump the weight" nudge when the
last logged set for that exercise hit or exceeded the top of its range.

`slotExerciseLibrary` / `bodyParts`: derived (via `useMemo`) from the active
plan's `days` — the union of every exercise ever listed under a given slot
name, grouped by body part (the part before " — " in the slot name). Powers
the "add an exercise that's existing in the plan" guided flow (body part →
specific part → exercise), independent of which day you're viewing.

## Logging model (per day, in component state)

- `draft`: fixed-slot entries, keyed by slot name — `{ exercise, notes, attachment, sets }`
- `customDraft[day]`: manually-added exercises (free-typed name, manual
  weight/reps, no dropdowns, no attachment — equip isn't tracked for these
  so there's no way to know if a cable attachment picker even applies) —
  `{ id, exercise, notes, sets }`
- `addedDraft[day]`: exercises pulled from the plan library via the guided
  flow — structured like a normal slot (dropdowns, diagram, attachment
  picker, etc.) but not one of the day's default slots —
  `{ id, slotName, exercise, notes, attachment, sets }`
- Every `sets` entry is `{ weight, value, extra }` — `extra` is an optional
  attached superset/drop-set: `{ type: "superset"|"dropset", exercise, weight, value }`.
  `weight` is always a manual number entry; `value` (reps) is a 1–20 dropdown,
  same `REPS_OPTIONS` list the main sets use. `exercise` behaves differently
  per type: a drop set is, by definition, the same movement at a lighter
  weight, so its `exercise` is forced to match the parent set's exercise —
  shown as a locked/disabled display, not an editable field — and gets
  re-synced automatically whenever the drop-set toggle is clicked. A
  superset is a different exercise, so `exercise` is a free-typed field the
  user fills in themselves; switching from drop set back to superset clears
  it back to empty rather than leaving the parent's name sitting there as if
  typed. This toggle behavior is identical across all three drafting
  contexts (`draft`, `addedDraft`, `customDraft`).
- `notes` is **one shared field per exercise**, not per set — deliberate,
  the user wanted form-cue notes that apply across all sets of that exercise
- `attachment` is the same idea, cable-only: a dropdown (`CABLE_ATTACHMENTS`
  in `App.jsx` — Straight Bar, Rope, V-Bar, D-Handles, Lat Pulldown Bar,
  Seated Row Bar, Multi-Grip Camber Bar, Ankle Strap, Ab/Crunch Strap, etc.)
  shown only when the selected exercise's `equip === "Cable"`, one shared
  value per exercise like notes rather than per set (you don't swap
  attachments mid-set)
- On save, all three drafts get flattened into `sessionBlocks` and appended
  to history (`localStorage` key `ironlog:workout-history`, JSON array of
  `{ id, date, day, blocks }`); each `block` is
  `{ slot, exercise, type, notes, attachment, sets }` (`attachment` is `""`
  for non-cable/custom exercises, and History only renders it when present)

`removedFromSlots` (`localStorage` key `ironlog:workout-removed-exercises`):
lets the user permanently delete an exercise option from a slot's library
(persisted, not per-session). A slot is never allowed to reach zero options.
Shape is `{ [planId]: { [slotName]: [exerciseName, ...] } }`, nested by plan
since the same slot name can exist in more than one plan. Data saved before
multi-plan support existed was a flat `{ [slotName]: [...] }`; it's migrated
on load by treating it as belonging to the `original` plan id.

"Last time" lookup: scans history most-recent-first for the last block
matching an exercise name, and returns its **single best set** — highest
weight wins outright, reps/time only break a tie at equal weight (not the
highest-volume set, and not an average). Custom exercises get the same
lookup but scoped to only `slot === "Custom"` blocks, so it only fires when
the typed name matches something previously logged as custom too.

### History view (three levels of detail)

Each saved session is collapsed by default — just the day/date header, total
volume/hold time, delete, and a chevron — rather than every set dumped on
screen at once. Two independent bits of state drive it: `openHistoryId`
(which session, if any, is expanded past the header) and `fullHistoryId`
(which session, if any, is expanded to the deepest level). Collapsing the
header (toggling `openHistoryId` closed) also clears `fullHistoryId` for
that session so it doesn't reopen mid-detail next time.

1. Collapsed: header only.
2. Summary (click the header): the condensed one-line-per-exercise view —
   `fmtSetsList` joins all sets into one string (e.g. `60×8, 65×6 [DS: ...]`)
   — plus notes. This is what History always showed before this became
   collapsible.
3. Full detail ("Show Full Detail" button): every set on its own row,
   styled like the live logging input's `Set N` rows, with any attached
   superset/drop-set shown as its own line — the historical equivalent of
   what the Log tab looks like while entering data, not just a condensed
   recap. "Show Summary" goes back to level 2 (not level 1 — there's no
   reason to make the user re-expand the header).

The delete button and the chevron/header are separate click targets — the
delete button is a `role="button"` span with `stopPropagation` so tapping it
doesn't also toggle the card open/closed.

History renders sessions sorted by `date` descending (`[...history].reverse().sort((a, b) => b.date.localeCompare(a.date))`
— the `.reverse()` first means same-date sessions still show most-recently-
logged first, since `sort` is stable), not by raw array/insertion order.
This matters once backfilling exists (below): a backfilled older-dated
session is *appended* to the array on save, so insertion order alone would
put it at the top of the list even though it happened before everything
else.

### Adding a past workout (backfill)

A dashed "+ Add Past Workout" button sits above the History list
(`activePlan` required — there's no plan to pick a day from otherwise). It
opens `AddPastWorkoutSetup`: a native `<input type="date" max={todayISO()}>`
(a real calendar picker, not a custom widget) plus a list of the active
plan's day keys to log against, and a final "Doesn't Match My Split" option
for a session that isn't one of the plan's regular days.

State: `backfill` is `null | { date, dayKey }` (`dayKey` is `"__custom__"`
for the non-split option). `startBackfill(date, dayKey)` resets `draft` and
seeds `customDraft`/`addedDraft` for the session, then sets `day` to either
the real `dayKey` or the sentinel `BACKFILL_CUSTOM_KEY` (`"__backfill_custom__"`)
so a custom backfill can't collide with a same-key entry from a live day.
`isCustomBackfill` is just `backfill?.dayKey === "__custom__"`.

While `backfill` is set, the Log tab's weekday-tab row is replaced by a
"Logging Past Workout" banner (shows the picked date, plus a Cancel button
that discards the draft and returns to History), and if it's the custom
path the day's structured slots and "Added From Plan" section are hidden
entirely — only the free-typed "Add Exercise" (custom-exercise) flow is
available, same as `customDraft` elsewhere. Saving uses `backfill.date`
instead of `todayISO()` for the session's `date`, and `"Custom Workout"`
instead of the real day key for a custom backfill's `day` field, then
returns to History. This is the same `saveWorkout`/`discardSession` used for
a normal live session — backfill only changes what date/day get written and
where you land afterward, not the drafting mechanics themselves.

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
- Plan customization is currently limited to what the existing add/remove
  exercise flow already allowed (swap which exercises populate a slot).
  There's no UI yet to build a plan from scratch — choosing your own days,
  slots, and muscle groups — or to reorder/rename days within a plan. Scoped
  out of the initial Home/multi-plan pass deliberately, flagged to the user
  as a natural next iteration rather than silently left out.

## Preferences expressed during development (worth keeping in mind)

- Prefers being told the reasoning/tradeoffs behind a change, not just the
  change itself
- Wanted every design choice (colors, fonts, icons) to be deliberate and
  explained, not default/generic-looking
- Is not deeply technical — struggled with GitHub's mobile app lacking a
  Settings menu, and with a prior in-browser-Babel deploy approach that
  failed silently. Prefers being told exactly what to click/where, and
  appreciates visible error messages over silent failures.
