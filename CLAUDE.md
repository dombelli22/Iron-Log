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
- `public/sw.js` — minimal service worker; bump the `CACHE` constant when
  the precached shell files change so old caches get evicted. **Network-first**
  fetch strategy (try the network, fall back to the cache only when
  offline) — it started as cache-first/stale-while-revalidate, but that let
  an already-installed PWA serve a stale `index.html` (pointing at an old,
  Vite-content-hashed JS bundle from several deploys back) indefinitely
  while online, since stale-while-revalidate always prefers the cache for
  the *current* request and only refreshes the cache for next time. Given
  how often this app ships updates, correctness beats the instant-from-cache
  load feel; the cache now exists purely for offline fallback. A phone with
  an already-stuck stale install self-corrects within the browser's own
  (spec-mandated, ~24h max) service-worker update check, or immediately if
  the user clears that site's data and reinstalls.
- `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png`
  — see "App icon & iOS launch" further down; it's a real photo now, not an
  illustration
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
each `{ id, name, description, days, defaultSchedule }`, picked from within
the Split Builder screen (see below) — reached from Home (`Home` is a
`screen` state in `App.jsx`, always shown first on load, separate from the
`view` state that toggles Log/History once inside a plan): a 5-day
PPL+Upper/Lower hybrid, Push/Pull/Legs (6-day), Upper/Lower
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
consistent list per slot everywhere. Only touch `MUSCLE_MAP` in `App.jsx`
when adding a genuinely new exercise name to `SLOT_LIBRARY`; reusing an
existing name (even across slots, e.g. `"Bulgarian Split Squat"` appearing
in both `"Quads"` and `"Glutes"`) needs nothing extra. Quads used to be
three slots (`"Quads — Primary"`, `"Quads — Secondary"`, bare `"Quads"`)
split by compound-vs-isolation emphasis, not by any real distinct region
the way Chest/Back/Triceps/Biceps sub-slots are; that split lost its point
once rep ranges stopped being compound/isolation-typed per exercise, so
they're one `"Quads"` slot now (union of all three, de-duplicated). Every
plan's leg days reference it — including both leg days in plans with two,
which therefore offer the same quad pool rather than a heavy/light split.
No migration: old History entries keep showing the old slot labels as
saved, and any stale `lastUsedExercise`/`planDayOverrides` keys for the old
names are just unused.
A `"Rear Delts"` / `"Shoulders — Rear"` naming split that pre-dated this
consolidation was merged into one `"Rear Delts"` slot name.

Two new slots, `Abs` and `Obliques`, added core training to the database
for the first time (14 and 8 exercises respectively — cable crunches,
hanging leg raises, ab wheel rollouts, planks and their weighted/timed
variants for Abs; woodchoppers, Russian twists, landmine rotations, side
planks for Obliques) — sourced from current hypertrophy-training guidance,
not just recalled from training data, the same as the earlier
bodybuilder-quote research pass. Deliberately **not** added to any built-in
plan's default days — every plan's day composition already reflects
earlier, deliberate choices, and core work is easy to add yourself now via
either the guided add flow (one session) or the Plan Editor (permanently,
every week) rather than presumed. A handful of other well-established but
previously-missing exercises were added to existing slots at the same
time: `Meadows Row`/`Seal Row` (Back — Thickness), `JM Press`
(Triceps — Long Head), `Egyptian Lateral Raise` (Shoulders — Side).

A much larger, deliberately broad research pass followed (256 slot entries,
~240 new exercise names; catalog went from ~185 to ~412 unique exercises
across 31 slots). Sources: Wikipedia/Bodybuilding-Wizard/BarBend/Fitbod/
StrengthLog exercise lists (ExRx blocks automated fetches with a 403), and
manufacturer catalogs for the machine names — Hammer Strength/Life Fitness
(plate-loaded and selectorized), Atlantis Strength, and gym80/Pure Kraft
(Rogue, Technogym, Prime, Arsenal, and Cybex pages weren't fetchable).
Machine names are kept brand-neutral ("Iso-Lateral Incline Press",
"Pendulum Squat", "Belt Squat", "V-Squat", "Glute Kickback Machine",
"Standing Leg Curl", "Total Hip Machine") since the user's gym won't
match any one brand. Bodyweight coverage was called out explicitly: dips
(parallel bar, ring, weighted, assisted machine), pull-up variants
(weighted, archer, commando, L-sit, towel, muscle-up), push-up
progressions (archer, ring, deficit, pseudo planche, one-arm, push-up
plus), pistol/shrimp/skater squats, glute-ham raise, slider/stability-ball
leg curls, Nordic and reverse Nordic curls, dragon flag, L-sit, and more.
Four new slots were created for body parts that had no home:
`"Back — Lower Back"` (hyperextensions, reverse hyper, lumbar machine),
`"Shoulders — Rotator Cuff"`, `"Shoulders — Neck"` (needed a new `neck`
muscle key → the `"neck"` slug in `MUSCLE_KEY_TO_SLUGS`), and `"Forearms"`
(bucketed under Arms) — all mapped in `SLOT_TO_GENERIC_BODY_PART`.
Additions to chest/triceps/biceps slots carry the right `detail`
sub-region automatically (derived from the slot, per the rule above).
Judgment calls: `Tibialis Raise`/`Machine Tibia Dorsi-Flexion` have no
anatomical slug, so they light up calves as *secondary* only (closest
approximation, same spirit as `sideDelt`'s mapping); serratus work has
no slug either (Push-Up Plus is filed under Chest — Middle); kettlebell,
band, and medicine-ball movements were skipped since the equipment enum
has no matching value; Olympic/explosive lifts were skipped as out of
scope for a hypertrophy tracker. The exercise-taxonomy reorganization the
user flagged as a later piece of work is still separate from this.

Traps used to be an afterthought — `"Barbell Shrug"`/`"DB Shrug"` sat
bolted onto the deadlift/pullover slot (then named
`"Back — Lower Lat / Traps"`), and `"Upright Row"` in `"Shoulders — Side"`
was the only other trap-adjacent movement. That slot was renamed to
`"Back — Lower Lat"` (shrugs removed) and a dedicated `"Shoulders — Traps"`
slot added — deliberately named with the `"Shoulders — "` prefix rather
than a standalone `"Traps"` slot so it groups under the existing
"Shoulders" body-part bucket in the guided add-exercise flow (see
`bodyParts` below) rather than becoming its own top-level part. It carries
6 shrug variants (barbell, DB, trap bar, Smith machine, cable,
behind-the-back, snatch-grip), 3 upright rows (barbell — reused from
`"Shoulders — Side"`, cable, DB), a lower-trap-focused Y-Raise, and a
timed Farmer's Carry (grip/traps carry, logged as a hold like the other
`T()` exercises rather than reps). Every plan that used to reach traps via
the old combined slot now gets `"Shoulders — Traps"` added alongside
whatever day already carries some other shoulder work for that plan (Front
Delts, Rear Delts, etc.) — for Bro Split and Arnold specifically, that
meant moving it off the old Back/Chest&Back day onto the dedicated
Shoulders (Bro Split) or Shoulders & Arms (Arnold) day instead, not just
carrying it over under the old day, to keep it consistently a "shoulders"
muscle across every plan rather than a "back" one in some and "shoulders"
in others. Deliberately capped at once a week per plan for now (every
plan's default schedule assigns each of its own day keys to exactly one
weekday, so one day carrying the slot means once weekly) — the 6-day PPL
plan initially had it on both Pull 1 and Pull 2 (twice weekly, since that
plan repeats Pull), which was trimmed back to Pull 1 only to match every
other plan. Revisit this if traps ever warrant higher frequency than once
a week the way some other muscles get in the higher-frequency plans.

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
- "Assign Schedule" in the Split Builder hub (`openScheduleEditor`)
  re-opens the editor for the active plan anytime, pre-filled with its
  *current* schedule (not the default) — this is how assignments get
  changed later.
- Persists to `localStorage` key `ironlog:plan-schedules`, shape
  `{ [planId]: schedule }` — scoped per plan like `planDayOverrides` (below).
- The day-tab bar is driven by the schedule, not by `Object.keys(plan.days)`:
  it iterates real weekdays (`WEEKDAYS`, Monday→Sunday) that have a
  non-null assignment, showing the weekday abbreviation as the tab and the
  assigned day's `label` underneath it — a rest day (no assignment) gets no
  tab at all, the same convention the original plan always used for
  Thursday. The same plan-day can be assigned to more than one weekday (e.g.
  repeating a session); `day` state still stores the plan's day key, not the
  weekday, so history entries are unaffected by later schedule edits.
- Picking a **new** plan from Home resets the in-progress `draft`/
  `customDraft`/`addedDraft`/`hiddenSlots` state, so nothing bleeds across
  plans.
- History stays global across plans (a lifting log is more useful unified
  than split up), just labeled per-entry via `ALL_DAYS_BY_KEY`.

### Home and the Split Builder

`HomeScreen` (`App.jsx`) is deliberately minimal: a "Continue with X" card
(when a plan is active) and one "Manage Split" button. Everything about
choosing, building, or editing a split — the quiz, the browse list, the
from-scratch builder, permanent per-day editing, and schedule assignment —
used to be spread across Home itself plus two separate header icons; all of
it now lives in one dedicated `SplitBuilderScreen` (`screen === "splitBuilder"`),
reached only via that "Manage Split" button, with its own "‹ Back" returning
to Home. The app header inside a plan (`screen === "app"`) now carries just
the Home icon and the Log/History tabs — no calendar or pencil icon — since
schedule assignment and plan-day editing are reached through the Split
Builder hub instead. `openScheduleEditor`/`openPlanEditor` (`WorkoutTracker`)
are unchanged as functions, just called from the hub's buttons now; both
screens' "back" targets go to `"splitBuilder"` rather than `"home"`/`"app"`,
since that's uniformly where they're entered from now (including the
first-time schedule prompt right after picking a new plan, since picking a
plan now also happens from within the Split Builder).

The Split Builder hub (`SplitBuilderScreen`'s `mode === "landing"`) shows,
when a plan is active, that plan's own "Manage '{name}'" actions (Edit
Training Days, Assign Schedule) above the plan-switching tools below them;
with no active plan yet, only the switching tools show. It also hosts the
overarching rep-range setting (see "Data model" below) at the bottom,
since that's a global preference, not scoped to any one plan.

### Permanent per-day editing ("Plan Editor")

`PlanEditorScreen`, reached from the Split Builder hub's "Edit Training
Days" button — add or permanently remove a whole body-part slot from one
of the active plan's days, recurring every week until changed again here.
This is deliberately a *third*, separate mechanism alongside two things
it's easy to confuse it with:

- The guided "Existing within database" add flow (`addedDraft`) is a
  one-off addition for **today's session only** — gone again once that
  day's live draft resets for a new week (see "A live day's workout stays
  visible for the week" below).
- The Log tab's per-slot trash icon (`hiddenSlots`, "Data model" below) is
  the opposite of Plan Editor's remove: a **one-week-only skip** of one of
  the day's built-in slots, not a permanent plan edit.

Persists to `localStorage` key `ironlog:plan-day-overrides`, shape
`{ [planId]: { [dayKey]: { added: [{ id, name }, ...], removed: [slotName, ...], subtitle?: string } } }`.
(`added` entries used to be bare slot-name strings; both forms are still
read, so older saved data keeps working.) `workoutData` (`WorkoutTracker`)
is a `useMemo` that layers this on top of `activePlan.days` every render
via the module-level `buildEffectiveSlots`: `removed` names are filtered
out of the day's base `slots` and each `added` entry is appended (built
fresh from `GLOBAL_SLOT_LIBRARY`, so it always reflects the current, full
exercise list for that slot name); `subtitle`, if present, replaces the
day's own. Works identically for built-in `PLAN_LIBRARY` plans and
user-built custom plans — same override shape.

Two things the Plan Editor now supports that it originally didn't:

- **Custom subtitle per day.** A text field at the top of each expanded day
  (`setDaySubtitle`), persisted in that day's override record and used
  everywhere the day's subtitle shows (Log header, the editor's collapsed
  header). An empty subtitle is allowed — the Log header then shows just the
  day label.
- **The same body part more than once on a day.** Adding a body part is now
  always a new instance (`addPermanentSlot`), except that re-adding a *base*
  slot that had been removed simply restores it. To make that work, every
  effective slot carries `name` (library slot name — what History and the
  exercise catalog use), `key` (unique within the day: equals `name` for the
  first occurrence, `name#<id>` for Plan-Editor-added instances, `name#2`…
  for duplicate base names), `label` (shown to the user — "Chest — Upper",
  then "Chest — Upper (2)"), plus `source`/`addedId` so `removePermanentSlot`
  can tell a base slot (goes into `removed`) from an added instance (dropped
  from `added` by id). **All per-slot logging state is keyed by `slot.key`,
  not name**: `draft[day]`, `hiddenSlots`, `openSlot`, and
  `lastUsedExercise` — so two copies of Chest — Upper on one day hold
  independent exercises/sets and each remembers its own last-used exercise.
  Because the first occurrence's key equals its name, everything saved before
  this change (drafts, hidden slots, last-used) keeps working unchanged.
  `sessionBlocks` carries `slotKey` in memory only (for `countForSlot` and
  `lastUsedExercise`) and strips it before saving, so History still just
  records `slot: "Chest — Upper"` twice, each with its own exercise/sets.

### Guided plan picker ("Help Me Choose")

`SplitBuilderScreen` (`App.jsx`) has its own internal `mode` state
(`landing` → `quizDays` → optionally `quizStyle` → `recommend`, or
`landing` → `browse`) separate from the app-level `screen` state — this is
all still "the hub", just sub-navigation within it. Its "Switch Plan"
section offers two entry points: "Help Me Choose" (the quiz) or "Suggested
Splits" (the plain list, same cards as before) — that label reads oddly
against what the button does (a plain browse list, not curated
suggestions); it's deliberate, requested wording, not an oversight.

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

The third option in the Split Builder hub's "Switch Plan" section
(`BuildPlanScreen` in `App.jsx`) lets a user build a plan with no built-in
template. It's a small step machine (`name` → `days` → per-day sub-steps →
back to `days` → save) entirely local to that component; the parent only
receives the finished result via `onSave({ name, days })` when the user
hits "Save & Finish".

- Adding a day has two top-level paths: **choose from existing** (pick any
  day, by its `tab` name, from any plan in `existingPlans` — grouped by
  originating plan in `ExistingDayPicker`) clones that day's `label`/`tab`/
  `subtitle`/`slots` verbatim; **name it myself** asks a follow-up — model
  the typed name after an existing day's slots (same picker, but only
  `slots` is cloned, the typed name replaces `label`/`tab`) or build from
  scratch.
- "Build from scratch" adds **body parts, not exercises** — matching how a
  day is meant to be composed everywhere else in the app now (see
  `hiddenSlots`/`lastUsedExercise` under "Data model"): picking a slot name
  that already exists in `GLOBAL_SLOT_LIBRARY` (via `ModeToggle`'s "Choose
  Existing") adds it immediately with that slot's full exercise list —
  no exercise picker at all, since which specific exercise gets chosen live
  on the workout day. Only a genuinely new slot name (`ModeToggle`'s "Type
  My Own", nothing in the library to draw from yet) still asks for one seed
  exercise to start it off, via the same "Choose Existing"/"Type My Own"
  toggle as before for the exercise itself. `GLOBAL_SLOT_LIBRARY`/
  `GLOBAL_SLOT_NAMES`/`GLOBAL_EXERCISE_LIST` (`plans.js`) back the
  dropdowns — `GLOBAL_SLOT_LIBRARY` is just `SLOT_LIBRARY` re-exported (see
  "Workout plans" above), so **built-in plans only**, not merged with any
  user's custom plans at runtime (reusing something a custom plan invented
  is a nice-to-have, not the point of this list). `addScratchSlot`
  (`App.jsx`) is where this branches: known slot name → `GLOBAL_SLOT_LIBRARY[name]`
  wholesale; unknown → the single typed/picked exercise, same as before.
  This replaced the original behavior, where even picking a known slot name
  still locked the day to whichever one exercise you'd also picked at build
  time — a real gap, not a deliberate restriction: a from-scratch day's slot
  never got the same "any exercise in this slot's library" flexibility a
  built-in plan's slot always had, until this fix.
  An exercise chosen from a dropdown (either path) is a real `MUSCLE_MAP`
  entry, so it gets the full muscle-diagram treatment same as any built-in
  plan's exercise; one typed manually won't have a `MUSCLE_MAP` entry, so it
  just won't show a muscle diagram — same graceful fallback custom-typed
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
  everything downstream (the Split Builder's plan list, the quiz, schedule
  assignment, history labels) reads from these merged values, not the static-only
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
without removing the manual input first. Reps are a manual number input too
now, for the same reason — a fixed 1–20 dropdown (`REPS_OPTIONS`, since
removed) was arbitrary and didn't let anyone log a set outside that range;
timed exercises still get a free-text seconds input, unchanged. Every reps
field in the app uses the same plain `<input type="number">` now: fixed
slots, added-from-plan, custom exercises, superset/drop-set extras across
all three, and the History-entry editor's sets and extras.

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

`repRangeSetting` (`WorkoutTracker` state, `[min, max]`, default `[8, 12]`,
persisted to `localStorage` key `ironlog:rep-range`, editable from the Split
Builder hub): one overarching rep-range target, used everywhere the "bump
the weight" nudge shows — hit or exceed `max` on an exercise's last logged
set and it flags. This replaced `REP_RANGE_TYPE`, a per-exercise
`"compound"` (6–10)/`"isolation"` (10–15) classification hardcoded for every
catalog exercise — removed entirely, `[min, max]` are read directly at both
call sites instead of going through a lookup. The old scheme only ever
nudged exercises that had an explicit entry in that table (every catalog
exercise did, but a typed/custom one never could); the single overarching
range now applies uniformly to any reps-type exercise, catalog or custom.

`slotExerciseLibrary` / `bodyParts`: power the guided "Existing within
database" add-exercise flow (generic body part → specific slot →
exercise), and are just aliases for `GLOBAL_SLOT_LIBRARY` and
`GENERIC_BODY_PARTS` from `plans.js` — not derived from the active plan at
all, so the flow always offers every exercise in the whole shared catalog,
regardless of which plan or day you're viewing. This used to be scoped to
only whatever the active plan's own days happened to use (derived via
`useMemo` from `workoutData`), with body parts grouped by naively splitting
the slot name on " — " (so e.g. "Front Delts" and "Rear Delts", having no
dash, each became their own top-level part instead of grouping under
"Shoulders"). `GENERIC_BODY_PARTS` (`plans.js`) fixes both: an explicit
`SLOT_TO_GENERIC_BODY_PART` map buckets all slots into six broad parts
(Chest, Back, Shoulders, Arms, Legs, Core, in that fixed order) with a
prefix-based fallback for any slot the map doesn't yet cover, so a future
slot never silently disappears from the picker just because this map
wasn't updated for it. Core (`Abs`, `Obliques` — added along with the rest
of the exercises below) is the newest bucket and a useful example of that
fallback design: it only needed two lines added to
`SLOT_TO_GENERIC_BODY_PART`/`GENERIC_BODY_PART_ORDER`, nothing else, to
show up correctly in the picker.

## Logging model (per day, in component state)

- `draft`: fixed-slot entries, scoped per day and then by slot name —
  `{ [day]: { [slotName]: { exercise, notes, attachment, sets } } }`. This
  used to be a flat `{ [slotName]: ... }` with no day scoping at all, which
  was a real bug, not just a same-named-slot edge case: `sessionBlocks`
  read the *entire* `draft` object with no filter by the current day, so
  switching days mid-session without saving could carry a previous day's
  entries — even for slot names that don't exist on the new day — silently
  into whatever got saved next. Every reader/writer (`slotDraftOf`,
  `setExercise`, `setNotes`, `setAttachment`, `updateRow`/`addRow`/
  `removeRow`, `addExtra`/`updateExtra`/`removeExtra`, `sessionBlocks`, the
  `weekDrafts` hydration effect, `saveWorkout`, `discardSession`,
  `deleteSession`) now reads/writes `draft[day]`, never the bare object.
- `customDraft[day]`: manually-added exercises (free-typed name, manual
  weight/reps, no dropdowns, no attachment — equip isn't tracked for these
  so there's no way to know if a cable attachment picker even applies) —
  `{ id, exercise, notes, sets }`
- `addedDraft[day]`: exercises pulled from the plan library via the guided
  flow — structured like a normal slot (dropdowns, diagram, attachment
  picker, etc.) but not one of the day's default slots —
  `{ id, slotName, exercise, notes, attachment, sets }`. Renders **inline**
  in the Log tab, directly below the day's fixed slots (in the order
  added) — there used to be a separate "Added From Plan" section header
  segregating these from the rest of the day, which read as if they were
  an afterthought rather than just more of the session; removed in favor of
  one continuous list. Only genuinely manual/typed exercises (`customDraft`)
  still get their own "Custom" section at the bottom, since those aren't
  tied to any slot in the library at all.
- `hiddenSlots[day]`: fixed-slot names hidden from the current week's
  session for that day — `toggleSlotHidden` (Log tab's per-slot trash icon,
  moved to the slot's collapsed header rather than buried behind the
  exercise dropdown) adds/removes a slot name from this list. Not a plan
  edit: it rides along in the same `weekDrafts` record as `draft`/
  `customDraft`/`addedDraft` (see below) and resets to empty — the full
  plan showing again — whenever the week rolls over, same as everything
  else there. A small "Restore {slot}" chip appears for anything currently
  hidden, in case it was hidden by mistake. Ignored entirely while
  backfilling (`backfill` truthy): a past session's fixed slots always show
  in full, since "hidden this week" isn't a meaningful concept for a
  different, already-elapsed week, and an unfilled slot already doesn't get
  saved regardless. This replaced an earlier permanent, plan-scoped
  `removedFromSlots` mechanism that pruned one exercise *option* out of a
  slot's dropdown forever — surprising in practice, since the trash icon
  read as "get rid of this for today" but actually mutated the plan's
  library permanently. That capability is gone; a slot's whole line can now
  only be removed permanently via the Plan Editor (previous section) or
  skipped for the current week via `hiddenSlots` — nothing prunes one
  specific exercise choice out of a slot's dropdown anymore.
- `lastUsedExercise` (`WorkoutTracker` state, persisted to `localStorage`
  key `ironlog:last-used-exercise`): `{ [planId]: { [dayKey]: { [slotName]: exerciseName } } }`
  — whichever specific exercise was last logged for a given fixed slot on a
  given day, which is what a slot defaults to once its week resets, instead
  of always falling back to the slot's first library entry
  (`defaultExerciseFor`/`slotDraftOf`). This is what makes a body-part-only
  day (see "Custom plan builder" and "Permanent per-day editing" above)
  actually usable week to week: you pick a specific exercise once, and it
  keeps showing up as the default from then on, still changeable anytime
  via the same dropdown. Written in `saveWorkout`, live saves only — a
  backfilled (backdated) entry never overwrites the default for the day's
  most recent real occurrence — from every fixed-slot block in that
  session (`!custom && !addedFromPlan`); `addedDraft`/`customDraft` entries
  aren't tracked here since they're not tied to a recurring slot.
- Every `sets` entry is `{ weight, value, extra }` — `extra` is an optional
  attached superset/drop-set: `{ type: "superset"|"dropset", exercise, weight, value }`.
  `weight` and `value` (reps) are both manual number entries, same as the
  main sets. `exercise` behaves differently
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
  in `App.jsx` — Straight Bar, EZ-Curl Bar, Rope, V-Bar, D-Handles, Lat
  Pulldown Bar, Seated Row Bar, Multi-Grip Camber Bar, Mag Grip (Wide/Mid/
  Narrow), Straps, Ankle Strap, Ab/Crunch Strap) shown only when the
  selected exercise's `equip === "Cable"`, one shared value per exercise
  like notes rather than per set (you don't swap attachments mid-set)
- On save, all three drafts get flattened into `sessionBlocks` and appended
  to history (`localStorage` key `ironlog:workout-history`, JSON array of
  `{ id, date, day, blocks }`); each `block` is
  `{ slot, exercise, type, notes, attachment, sets }` (`attachment` is `""`
  for non-cable/custom exercises, and History only renders it when present).
  A session's total volume (both the live Log tab's running total and
  History's per-session header) sums each block's main sets *plus* any
  attached superset/drop-set weight×reps — History's total used to only sum
  the main sets, under-reporting volume for any session with an attached
  extra; both totals now use the same calculation.

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

### Editing a past History entry

Full detail also offers an "Edit" button (next to "Show Summary") that
turns that session's blocks into an editable form — exercise name as free
text, weight/rep (or seconds, for a timed block) inputs per set, notes,
attachment, add/remove a set, add/remove a whole exercise block, and
editing/removing an attached superset/drop-set. This operates directly on
`historyEditDraft`, a working copy of the session's raw `blocks` array —
deliberately **not** routed through the plan/slot machinery (`draft`,
`getSlot`, etc.), since a past session's exercises don't need to still
match any current slot's dropdown options (the plan may have changed
since, or the entry may not belong to any of the active plan's days at
all, e.g. a "Custom Workout" backfill). "Save Changes" re-runs the same
"only count a set once it has both fields filled" filter `saveWorkout`
uses (`cleanedHistoryEdit`, a `useMemo`) and overwrites that entry's
`blocks` in place — same `id`, so it doesn't create a duplicate or move in
the sort order. Save is disabled when that filter would leave zero blocks,
rather than silently no-op-ing.

The Edit button only appears for a session that **isn't** the day
currently linked to a live current-week draft (`liveLinkedHistoryIds`,
matched against `weekDrafts`) — that one is already editable right in the
Log tab, with saves updating this same entry (see "A live day's workout
stays visible for the week" below). Editing it a second way, through
History, would need to somehow reconcile back into `draft`/`customDraft`/
`addedDraft` shape to stay in sync, which isn't attempted; instead History
editing is scoped to exactly what it was asked for — genuinely past weeks
— and the current week keeps using its one existing editing path.

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

### Workout-complete quote

Saving any workout (live or backfilled) shows `CompletionQuoteModal`, a
full-screen overlay with a random pick from `COMPLETION_QUOTES` (50
entries) — real, attributed quotes, majority (34) from bodybuilders,
strongmen, and other health/strength figures, the rest (16) from war
generals, deliberately not generic gym-poster lines.

Bodybuilders/strongmen/other strength figures: Schwarzenegger (5), Jack
LaLanne (2), Charles Atlas, Steve Reeves, Eugen Sandow, Ronnie Coleman (3),
Lee Haney, Kai Greene, Frank Zane, Vince Gironda, Mike Mentzer, Jón Páll
Sigmarsson, Jay Cutler, CT Fletcher, John Grimek, Chris Bumstead (2), Dorian
Yates, Tom Platz, Kevin Levrone, David Goggins (3), Jocko Willink, Cameron
Hanes, Mark Bell, Elliott Hulse — spans historical (Sandow, Atlas) through
former Mr. Olympia-era competitors (Coleman, Haney, Cutler, Bumstead) and
other popular strength/health figures who aren't competitive bodybuilders
at all (Goggins — ultra-endurance/ex-Navy SEAL, Jocko Willink — ex-Navy
SEAL, Cameron Hanes — bowhunter/endurance athlete, Mark Bell — powerlifter,
Elliott Hulse — strongman/strength coach), per an explicit ask to widen the
pool beyond strict bodybuilding. The added entries came from a live web
search (not just recalled from training data) specifically to verify
wording/attribution rather than guess. War generals, US (Patton,
Eisenhower, MacArthur, Grant, Washington, Marshall, Powell, Schwarzkopf) and
non-US (Napoleon, Sun Tzu, Rommel, Hannibal, Alexander the Great, Julius
Caesar, Montgomery, Suvorov).

A few of the less-formal bodybuilder entries (Zane, Gironda, Mentzer,
Grimek) are commonly-cited summaries of each figure's well-documented
training philosophy rather than a single verbatim-sourced line — flagged
here rather than presented as equally ironclad as the rest; every other
entry (including all the newer web-sourced additions) is a specific,
consistently-attributed line. Dismissed by the Continue button or by
clicking the backdrop; state is just `completionQuote` (`null` when
hidden), set at the end of `saveWorkout` and cleared by the modal's
`onClose`.

### A live day's workout stays visible for the week

Saving a **live** (non-backfill) session no longer clears that day's draft —
`draft`/`customDraft[day]`/`addedDraft[day]` are left populated so the Log
tab keeps showing what you logged, editable, through the rest of that
calendar week (Monday-Sunday, via `weekKeyFor`/`mondayOf` in `App.jsx`).
Saving again while the same week is still current **updates that same
history entry** instead of appending a duplicate — the Save button itself
relabels to "Update Workout" once `hasCurrentWeekEntry` is true. Backfill
sessions are entirely exempt from all of this (checked via `!backfill`
throughout): they always create a new entry and always clear the draft
afterward, same as before this feature.

This is backed by a new persisted map, `weekDrafts` (`localStorage` key
`ironlog:week-drafts`), shape `{ [dayKey]: { weekKey, sessionId, draft,
customDraft, addedDraft } }` — `draft` here is pre-scoped to just that day's
own slot names (filtered out of the global, slot-name-keyed `draft` object
at save time) so this feature doesn't inherit the existing cross-day
slot-collision issue into persisted storage. On load, any entry whose
`weekKey` isn't the current week is pruned immediately. A `useEffect` keyed
on `day` (guarded by a `dayLiveWeekKeyRef` ref so it only acts once per day
per week) either hydrates the live draft from a matching `weekDrafts` entry
or, if none matches, clears that day's slots — the latter branch is what
resets a day back to blank once its week has actually ended, including for
a long-lived session that happens to stay open across the week boundary.

`discardSession` now reverts to the last-saved-this-week state (from
`weekDrafts`) rather than wiping to fully blank, when one exists — otherwise
discarding an edit to an already-completed day would erase the whole
day's logged workout, not just the unsaved change. `deleteSession` cleans up
the matching `weekDrafts` entry when the deleted history row is the one
currently linked to a day, and if that day is the one on screen, clears its
live draft too — so deleting "this week's" entry doesn't leave a populated
form that's silently no longer backed by any history record.

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
- Primary (accent-colored) buttons and plan/option cards carry a small
  `boxShadow` for depth — `PRIMARY_SHADOW` (`0 4px 14px rgba(214,41,59,0.35)`,
  a red glow) on solid-accent buttons, a plain `0 2px 8px rgba(0,0,0,0.28)`
  on `--surface`/`--accent-dim` cards and secondary buttons
  (`homeChoiceButtonStyle`). Buttons that go from disabled to active also
  toggle the shadow with the color (see `ScheduleScreen`'s Save & Continue or
  `BuildPlanScreen`'s Next/Save & Finish) so a disabled button doesn't glow.
- The Log tab's volume/hold-time numbers count up (`useCountUp`, `App.jsx`)
  from their previous value to the new one over 500ms (ease-out cubic) any
  time the underlying total changes, rather than snapping instantly — pairs
  with the existing `flash-pop` animation on the same stat row.

### App icon & iOS launch

`public/icon-192.png`, `icon-512.png`, and `apple-touch-icon.png` are a
real photo now, not an illustration — a cropped, high-contrast B&W shot of
a loaded barbell plate on a gym floor (Unsplash License, "Black barbell on
tile flooring" by Victor Freitas, `photo-1521805103424-d8f8430e8933`; same
free-for-any-use/no-attribution-required license as the page and quote
backgrounds). A first pass drew a flat vector barbell with Pillow (two red
circles and a bar) that read as too cartoonish; this replaced it entirely
after explicit feedback that it needed to look "more real... rugged...
serious" — a photographic weight reads that way in a way an icon-style
illustration doesn't. Processing (Pillow, one-off script, not checked into
the repo): square-crop centered on the near plate, +18% contrast / -8%
brightness for a grittier look, a radial vignette compositing the edges
down toward near-black so it reads as one cohesive dark icon rather than a
bright rectangle, and a very thin low-opacity red rim arc as the one tie-in
to the app's accent color (the photo itself stays monochrome — recoloring
it would have fought the "real photo" point of switching away from the
illustrated version).

`public/splash-{1290x2796,1179x2556,750x1334}.png` are plain `--bg` fields
with that icon centered at ~30% of the shorter dimension, edges feathered
into the background via a blurred rounded-rect mask (a straight paste read
as a harsh floating rectangle once the icon became a photo instead of a
glow-backed illustration) — wired via `apple-touch-startup-image` `media`
queries (exact `device-width` / `device-height` / `-webkit-device-pixel-ratio`
per size) in `index.html`, covering the current largest/standard/SE iPhone
screen sizes. This is a belt-and-suspenders fix — modern iOS (15+) already
builds a basic splash from the manifest's `background_color`/icons (both
already set correctly here), so these mainly guard against older iOS
versions or any gap in that auto-generation, at the cost of needing new
sizes added if a future iPhone screen size isn't covered by the three
above.

### Per-page background photos

Four real gym photos (`public/bg/{home,log,history,utility}.webp`) — sourced
from Unsplash (Unsplash License: free for any use, no attribution required;
each one individually confirmed to show a "Download free" button, since
Unsplash also surfaces paid Unsplash+ and iStock-affiliate results
interleaved into search that are NOT free and had to be explicitly avoided).
Downloaded locally at 1100px/q55 webp (~65-240KB each) rather than
hotlinked, so they work offline via the service worker and don't depend on
Unsplash staying up.

`PageBackground` (`App.jsx`) renders whichever one applies as a single
`position: fixed` layer covering the viewport: the photo at low opacity
(`0.18`, plus `grayscale(30%) contrast(1.05)` to keep it from fighting the
red accent color), with a second full-opacity gradient layer on top — a
faint red radial glow near the top plus a vignette that darkens going down
the page and resolves to solid `--bg` — so the photo is only ever really
visible near the top of a page and in the empty margins around content,
never behind or competing with actual text. Every real UI element still
sits on its own solid `--surface`/`--surface-2` card, so this is pure
atmosphere, not literal background content the user has to read around.

Which photo shows follows the **page family**, computed once in
`WorkoutTracker` as `bgImage` from `screen`/`view`: `"home"` for the Home
screen, `"log"`/`"history"` for the two Log-tab views, and `"utility"`
shared by Schedule/Build-Your-Own-Split/Add-Past-Workout — those three are
all secondary setup flows, not sessions users read for a while, so they
didn't each need their own distinct photo.

Stacking this correctly took an extra pass: a `position: fixed` layer with
a **negative** z-index turned out not to reliably paint behind plain
(non-positioned) sibling content in this app's actual DOM shape, contrary
to the naive reading of the CSS stacking spec — so instead the background
uses `z-index: 0` and the real page content is wrapped in one
`position: relative; z-index: 1` div, making the ordering unambiguous
rather than relying on negative-z-index behavior.

The four photos were swapped once for a "classic gym" look specifically
(worn iron, high-ceiling old-building gyms, dramatic B&W shots) — same
Unsplash-License sourcing/verification process, same file names, so nothing
else about `PageBackground` needed to change.

**Path bug, since fixed**: `BG_IMAGES` and `QUOTE_BG_IMAGES` (`App.jsx`)
originally used absolute paths (`/bg/home.webp`, `/quotes/gym-1.webp`).
These are plain runtime JS string constants read into `<img src>`/
`background-image: url()`, not `import`ed assets, so Vite's `base: "./"`
handling (see the note on `vite.config.js` above) never touches them — an
absolute path resolves against the domain root regardless. That's silently
correct on the Vite dev server (which serves at the root) but breaks on the
deployed GitHub Pages **project subpath** (`/Iron-Log/`), 404ing every
background and quote photo — invisible in all local testing, only caught by
inspecting real network requests against the live production URL. Fixed by
making all 8 paths relative (`bg/home.webp`, `quotes/gym-1.webp`, etc.) so
they resolve against the current document's URL instead. If any future
image/asset path is added as a plain string constant like this (rather than
through Vite's `import`/`public/`-relative-`<img>`-in-JSX handling), it
needs to stay relative for the same reason.

### Workout-complete quote photos

`CompletionQuoteModal` also shows a photo — one of four old-school
gym-equipment/gym-interior shots in `public/quotes/gym-{1..4}.webp` (same
Unsplash License sourcing as the page backgrounds), picked at random
alongside the quote itself (`QUOTE_BG_IMAGES`, `saveWorkout` in `App.jsx`
attaches the chosen path as `quote.img`). Unlike `PageBackground`, this is
shown at **full opacity** with only a bottom-anchored gradient fade (into
`--surface`) for text legibility — the request here was specifically that
this photo stand out, not sit quietly in the background, so it gets the
opposite treatment from the per-page ones on purpose.

This went through two iterations before landing here, worth remembering if
revisiting: the first version tried a specific real photo per quote
author — a real portrait for each of the 16 generals (sourced from
Wikipedia infoboxes, filtering to only `/wikipedia/commons/` URLs, since
`/wikipedia/en/` is Wikipedia's local fair-use-only space and not legally
reusable elsewhere) plus one of three generic era-matched stock photos
("vintage", "modern", "intense-training") for the 24 bodybuilder/
strength-figure authors, since a real photo of, say, Ronnie Coleman
training isn't available under any license that allows embedding it here.
That version worked but was dropped at the user's request in favor of this
simpler one — no people at all, just gym equipment/settings, picked
independently of which quote is showing. If photo-per-quote-author is ever
revisited, the general portraits in particular are legitimate and easy to
re-source (Wikipedia infobox → Commons URL, as above); the per-category
bodybuilder photos are a weaker fit since a stock photo of an anonymous
model still reads as "a stand-in for a real person" in a way a plain
equipment photo doesn't.

## Known issues / things not yet fixed

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
