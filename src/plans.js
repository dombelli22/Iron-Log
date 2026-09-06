// ---------------------------------------------------------------------------
// Workout split library. Every plan here draws only from the shared
// exercise catalog in SLOT_LIBRARY below (which in turn only uses exercises
// tagged in MUSCLE_MAP / REP_RANGE_TYPE in src/App.jsx) — different splits
// are just different ways of grouping and scheduling the same slots, so
// every plan that includes a given slot name (e.g. "Chest — Upper") offers
// the exact same exercise choices for it. Adding an exercise to a slot here
// benefits every plan that uses that slot, with nothing to keep in sync.
//
// A plan is { id, name, description, days }. `days` is an object keyed by a
// unique day name (used as the day-tab key and, for the "original" plan,
// matched against the real weekday for auto-selecting "today"). Each day is
// { label, subtitle, tab, slots }, where `slots` has the exact shape used
// throughout the app: [{ name, exercises: [{ name, type, equip }] }].
// ---------------------------------------------------------------------------
const R = (name, equip) => ({ name, type: "reps", equip });
const T = (name, equip) => ({ name, type: "time", equip });

// ---------------------------------------------------------------------------
// The shared exercise catalog, one list per slot name, used by every plan
// below. Sourced from mainstream hypertrophy-training exercise guides,
// covering the equipment variants a given movement is commonly available in
// (e.g. a chest fly on dumbbells, cable, and a pec-deck machine are all
// listed separately) rather than just one canonical version. Every exercise
// name here must have a matching MUSCLE_MAP entry in App.jsx (and usually a
// REP_RANGE_TYPE entry) — that's what drives the muscle diagram and the
// "bump the weight" rep-range nudge.
// ---------------------------------------------------------------------------
const SLOT_LIBRARY = {
  "Chest — Upper": [
    R("Machine Incline Press", "Machine"),
    R("Incline DB Press", "Dumbbell"),
    R("Incline Barbell Press", "Barbell"),
    R("Incline DB Fly", "Dumbbell"),
    R("Incline Cable Fly", "Cable"),
    R("Incline Machine Fly", "Machine"),
    R("Decline Push-Up", "Bodyweight"),
  ],
  "Chest — Middle": [
    R("Flat Barbell Press", "Barbell"),
    R("Flat DB Press", "Dumbbell"),
    R("Machine Chest Press", "Machine"),
    R("Flat DB Fly", "Dumbbell"),
    R("Flat Cable Fly", "Cable"),
    R("Pec Deck Fly", "Machine"),
    R("Push-Up", "Bodyweight"),
  ],
  "Chest — Lower": [
    R("Decline Barbell Press", "Barbell"),
    R("Decline DB Press", "Dumbbell"),
    R("Machine Decline Press", "Machine"),
    R("Decline DB Fly", "Dumbbell"),
    R("Decline Cable Fly", "Cable"),
    R("Chest Dip", "Bodyweight"),
    R("Incline Push-Up", "Bodyweight"),
  ],
  "Back — Width": [
    R("Lat Pulldown", "Cable"),
    R("Wide-Grip Lat Pulldown", "Cable"),
    R("Close-Grip Lat Pulldown", "Cable"),
    R("Single-Arm Lat Pulldown", "Cable"),
    R("Pull-Up", "Bodyweight"),
    R("Chin-Up", "Bodyweight"),
    R("Neutral-Grip Pull-Up", "Bodyweight"),
  ],
  "Back — Thickness": [
    R("Barbell Row", "Barbell"),
    R("Pendlay Row", "Barbell"),
    R("DB Row", "Dumbbell"),
    R("Chest-Supported DB Row", "Dumbbell"),
    R("Seated Cable Row", "Cable"),
    R("Single-Arm Cable Row", "Cable"),
    R("Chest-Supported Barbell/T-Bar Row", "Barbell"),
    R("T-Bar Row", "Machine"),
    R("Machine Row", "Machine"),
    R("Inverted Row", "Bodyweight"),
  ],
  "Back — Lower Lat / Traps": [
    R("Barbell Deadlift", "Barbell"),
    R("Rack Pull", "Barbell"),
    R("DB Deadlift", "Dumbbell"),
    R("Straight-Arm Pulldown", "Cable"),
    R("Cable Pullover", "Cable"),
    R("DB Pullover", "Dumbbell"),
    R("Barbell Shrug", "Barbell"),
    R("DB Shrug", "Dumbbell"),
  ],
  "Biceps — Long Head": [
    R("Bayesian Curl", "Cable"),
    R("Incline DB Curl", "Dumbbell"),
    R("Standing Barbell Curl", "Barbell"),
    R("Cross-Body Cable Curl", "Cable"),
  ],
  "Biceps — Short Head": [
    R("Preacher Curl", "EZ-Bar"),
    R("Spider Curl", "Dumbbell"),
    R("Cable Preacher Curl", "Cable"),
    R("Concentration Curl", "Dumbbell"),
    R("Wide-Grip EZ-Bar Curl", "EZ-Bar"),
    R("Machine Preacher Curl", "Machine"),
  ],
  "Biceps — Brachialis": [
    R("DB Hammer Curl", "Dumbbell"),
    R("Cable Hammer Curl", "Cable"),
    R("Cross-Body Hammer Curl", "Dumbbell"),
    R("Reverse-Grip Barbell Curl", "Barbell"),
    R("Reverse-Grip EZ-Bar Curl", "EZ-Bar"),
  ],
  "Triceps — Long Head": [
    R("Overhead DB Extension", "Dumbbell"),
    R("Overhead Cable Extension", "Cable"),
    R("Overhead EZ-Bar Extension", "EZ-Bar"),
    R("Overhead Barbell Extension", "Barbell"),
  ],
  "Triceps — Lateral Head": [
    R("Single-Arm Cable Pushdown", "Cable"),
    R("Rope or Bar Pushdown", "Cable"),
    R("V-Bar Pushdown", "Cable"),
    R("Machine Triceps Extension", "Machine"),
    R("Bench Dip", "Bodyweight"),
  ],
  "Triceps — Medial Head": [
    R("Close-Grip Barbell Bench Press", "Barbell"),
    R("Close-Grip DB Bench Press", "Dumbbell"),
    R("Reverse-Grip Cable Pushdown", "Cable"),
    R("Diamond Push-Up", "Bodyweight"),
    R("Barbell or EZ-Bar Skull Crushers", "EZ-Bar"),
    R("DB Skull Crushers", "Dumbbell"),
  ],
  "Front Delts": [
    R("Cable Front Raise", "Cable"),
    R("DB Front Raise", "Dumbbell"),
    R("Barbell Front Raise", "Barbell"),
    R("Incline DB Front Raise", "Dumbbell"),
  ],
  "Rear Delts": [
    R("Reverse Pec Deck", "Machine"),
    R("Face Pull", "Cable"),
    R("DB Reverse Fly", "Dumbbell"),
    R("Cable Reverse Fly", "Cable"),
    R("Bent-Over DB Rear Delt Fly", "Dumbbell"),
    R("Incline DB Rear Delt Fly", "Dumbbell"),
  ],
  "Shoulders — Front/Mid": [
    R("Seated DB Overhead Press", "Dumbbell"),
    R("Seated Barbell Overhead Press", "Barbell"),
    R("Standing Barbell Overhead Press", "Barbell"),
    R("Cable Overhead Press", "Cable"),
    R("Machine Shoulder Press", "Machine"),
    R("Arnold Press", "Dumbbell"),
  ],
  "Shoulders — Side": [
    R("Cable Lateral Raise", "Cable"),
    R("DB Lateral Raise", "Dumbbell"),
    R("Machine Lateral Raise", "Machine"),
    R("Incline DB Lateral Raise", "Dumbbell"),
    R("Upright Row", "Barbell"),
  ],
  "Arms — Biceps": [
    R("Barbell or EZ-Bar Curl", "EZ-Bar"),
    R("DB Curl", "Dumbbell"),
    R("Cable Curl", "Cable"),
    R("Preacher Curl", "EZ-Bar"),
    R("DB Hammer Curl", "Dumbbell"),
    R("Incline DB Curl", "Dumbbell"),
    R("Concentration Curl", "Dumbbell"),
  ],
  "Arms — Triceps": [
    R("Barbell or EZ-Bar Skull Crushers", "EZ-Bar"),
    R("DB Skull Crushers", "Dumbbell"),
    R("Rope or Bar Pushdown", "Cable"),
    R("Overhead Cable Extension", "Cable"),
    R("Close-Grip Barbell Bench Press", "Barbell"),
    R("Bench Dip", "Bodyweight"),
  ],
  "Quads — Primary": [
    R("Back Squat", "Barbell"),
    R("Front Squat", "Barbell"),
    R("Goblet Squat", "Dumbbell"),
    R("Hack Squat", "Machine"),
    R("Bulgarian Split Squat", "Dumbbell"),
  ],
  "Quads — Secondary": [
    R("Leg Press", "Machine"),
    R("Goblet Squat", "Dumbbell"),
    R("Leg Extension Machine", "Machine"),
    R("Walking Lunges", "Dumbbell"),
    R("Sissy Squat", "Bodyweight"),
  ],
  Quads: [
    R("Leg Extension Machine", "Machine"),
    R("Sissy Squat", "Bodyweight"),
    T("Wall Sit", "Bodyweight"),
  ],
  Hamstrings: [
    R("Barbell RDL", "Barbell"),
    R("DB RDL", "Dumbbell"),
    R("Leg Curl Machine", "Machine"),
    R("Seated Leg Curl Machine", "Machine"),
    R("Lying Leg Curl Machine", "Machine"),
    R("Good Morning", "Barbell"),
    R("Nordic Ham Curl", "Bodyweight"),
    T("Single-Leg RDL Hold", "Bodyweight"),
  ],
  Glutes: [
    R("Bulgarian Split Squat", "Dumbbell"),
    R("Walking Lunges", "Dumbbell"),
    R("Hip Thrust", "Barbell"),
    R("Cable Kickback", "Cable"),
    R("Glute Bridge", "Bodyweight"),
    R("Cable Pull-Through", "Cable"),
  ],
  "Glute Medius / Abductors": [
    R("Hip Abductor Machine", "Machine"),
    R("Cable Hip Abduction", "Cable"),
    T("Side-Lying Hip Abduction Hold", "Bodyweight"),
  ],
  Adductors: [
    R("Hip Adductor Machine", "Machine"),
    R("Cable Hip Adduction", "Cable"),
    R("Sumo Squat", "Dumbbell"),
    T("Copenhagen Plank Hold", "Bodyweight"),
  ],
  Calves: [
    R("Standing Calf Raise", "Machine"),
    R("Seated Calf Raise", "Machine"),
    R("Leg Press Calf Raise", "Machine"),
    R("Barbell Calf Raise", "Barbell"),
    R("Single-Leg DB Calf Raise", "Dumbbell"),
    T("Calf Raise Hold", "Bodyweight"),
  ],
};

function slots(...names) {
  return names.map((name) => ({ name, exercises: SLOT_LIBRARY[name] }));
}

// ---------------------------------------------------------------------------
// Plan 1: a 5-day PPL + Upper/Lower hybrid — Push/Pull/Legs for the first
// three days, then an Upper/Lower pair that revisits everything with
// different angles/equipment.
// ---------------------------------------------------------------------------
const ORIGINAL_DAYS = {
  Push: {
    label: "Push",
    subtitle: "Chest, Triceps, Front Delts",
    tab: "Push",
    slots: slots("Chest — Upper", "Chest — Middle", "Chest — Lower", "Triceps — Long Head", "Triceps — Lateral Head", "Triceps — Medial Head", "Front Delts"),
  },
  Pull: {
    label: "Pull",
    subtitle: "Back, Biceps, Rear Delts",
    tab: "Pull",
    slots: slots("Back — Width", "Back — Thickness", "Back — Lower Lat / Traps", "Biceps — Long Head", "Biceps — Short Head", "Biceps — Brachialis", "Rear Delts"),
  },
  Legs: {
    label: "Legs",
    subtitle: "Compound Focus",
    tab: "Legs",
    slots: slots("Quads — Primary", "Quads — Secondary", "Hamstrings", "Glutes", "Calves"),
  },
  Upper: {
    label: "Upper",
    subtitle: "Chest, Back, Arms, Shoulders",
    tab: "Upper",
    slots: slots("Chest — Upper", "Chest — Middle", "Chest — Lower", "Back — Width", "Back — Thickness", "Shoulders — Front/Mid", "Shoulders — Side", "Rear Delts", "Arms — Biceps", "Arms — Triceps"),
  },
  Lower: {
    label: "Lower",
    subtitle: "Machine Isolation or Isometric Hold",
    tab: "Lower",
    slots: slots("Quads", "Hamstrings", "Glute Medius / Abductors", "Adductors", "Calves"),
  },
};

// ---------------------------------------------------------------------------
// Plan 2: Push/Pull/Legs run twice a week — the highest-frequency option.
// ---------------------------------------------------------------------------
const PPL_DAYS = {
  "Push 1": {
    label: "Push",
    subtitle: "Chest, Triceps, Front Delts",
    tab: "Push 1",
    slots: slots("Chest — Upper", "Chest — Middle", "Chest — Lower", "Triceps — Long Head", "Triceps — Lateral Head", "Triceps — Medial Head", "Front Delts"),
  },
  "Pull 1": {
    label: "Pull",
    subtitle: "Back, Biceps, Rear Delts",
    tab: "Pull 1",
    slots: slots("Back — Width", "Back — Thickness", "Back — Lower Lat / Traps", "Biceps — Long Head", "Biceps — Short Head", "Biceps — Brachialis", "Rear Delts"),
  },
  "Legs 1": {
    label: "Legs",
    subtitle: "Compound Focus",
    tab: "Legs 1",
    slots: slots("Quads — Primary", "Quads — Secondary", "Hamstrings", "Glutes", "Calves"),
  },
  "Push 2": {
    label: "Push",
    subtitle: "Chest, Triceps, Front Delts",
    tab: "Push 2",
    slots: slots("Chest — Upper", "Chest — Middle", "Chest — Lower", "Triceps — Long Head", "Triceps — Lateral Head", "Triceps — Medial Head", "Front Delts"),
  },
  "Pull 2": {
    label: "Pull",
    subtitle: "Back, Biceps, Rear Delts",
    tab: "Pull 2",
    slots: slots("Back — Width", "Back — Thickness", "Back — Lower Lat / Traps", "Biceps — Long Head", "Biceps — Short Head", "Biceps — Brachialis", "Rear Delts"),
  },
  "Legs 2": {
    label: "Legs",
    subtitle: "Machine Isolation or Isometric Hold",
    tab: "Legs 2",
    slots: slots("Quads", "Hamstrings", "Glute Medius / Abductors", "Adductors", "Calves"),
  },
};

// ---------------------------------------------------------------------------
// Plan 3: Upper/Lower, 4 days a week. Upper 1 / Lower 1 lean compound,
// Upper 2 / Lower 2 lean isolation — same slot pools as everywhere else,
// just a different pair of sessions per week.
// ---------------------------------------------------------------------------
const UPPER_LOWER_DAYS = {
  "Upper 1": {
    label: "Upper",
    subtitle: "Chest, Back, Shoulders, Arms",
    tab: "Upper 1",
    slots: slots("Chest — Upper", "Chest — Middle", "Chest — Lower", "Back — Width", "Back — Thickness", "Shoulders — Front/Mid", "Shoulders — Side", "Rear Delts", "Arms — Biceps", "Arms — Triceps"),
  },
  "Lower 1": {
    label: "Lower",
    subtitle: "Compound Focus",
    tab: "Lower 1",
    slots: slots("Quads — Primary", "Quads — Secondary", "Hamstrings", "Glutes", "Calves"),
  },
  "Upper 2": {
    label: "Upper",
    subtitle: "Back Lower Lat / Traps, Arms by Head, Front Delts",
    tab: "Upper 2",
    slots: slots("Chest — Middle", "Back — Lower Lat / Traps", "Triceps — Long Head", "Triceps — Lateral Head", "Triceps — Medial Head", "Biceps — Long Head", "Biceps — Short Head", "Biceps — Brachialis", "Front Delts"),
  },
  "Lower 2": {
    label: "Lower",
    subtitle: "Machine Isolation or Isometric Hold",
    tab: "Lower 2",
    slots: slots("Quads", "Hamstrings", "Glute Medius / Abductors", "Adductors", "Calves"),
  },
};

// ---------------------------------------------------------------------------
// Plan 4: Full Body, 3 days a week. Every major muscle group each session;
// which specific slot rotates across the three days so the week isn't just
// the same session three times.
// ---------------------------------------------------------------------------
const FULL_BODY_DAYS = {
  "Full Body A": {
    label: "Full Body",
    subtitle: "Chest, Back, Quads, Hamstrings, Arms, Calves",
    tab: "Day A",
    slots: slots("Chest — Middle", "Back — Thickness", "Quads — Primary", "Hamstrings", "Shoulders — Side", "Arms — Biceps", "Arms — Triceps", "Calves"),
  },
  "Full Body B": {
    label: "Full Body",
    subtitle: "Chest, Back, Quads, Glutes, Shoulders, Arms, Calves",
    tab: "Day B",
    slots: slots("Chest — Upper", "Back — Width", "Quads — Secondary", "Glutes", "Shoulders — Front/Mid", "Biceps — Brachialis", "Triceps — Lateral Head", "Calves"),
  },
  "Full Body C": {
    label: "Full Body",
    subtitle: "Chest, Back, Quads, Hamstrings, Rear Delts, Arms, Calves",
    tab: "Day C",
    slots: slots("Chest — Lower", "Back — Lower Lat / Traps", "Quads — Primary", "Hamstrings", "Rear Delts", "Biceps — Long Head", "Triceps — Medial Head", "Calves"),
  },
};

// ---------------------------------------------------------------------------
// Plan 5: the classic "Bro Split" — one muscle group per day. Since each
// muscle is only trained once a week, every slot for that muscle group shows
// up the same day rather than being split across sessions.
// ---------------------------------------------------------------------------
const BRO_SPLIT_DAYS = {
  "Chest Day": {
    label: "Chest",
    subtitle: "Upper, Middle, Lower",
    tab: "Chest",
    slots: slots("Chest — Upper", "Chest — Middle", "Chest — Lower"),
  },
  "Back Day": {
    label: "Back",
    subtitle: "Width, Thickness, Lower Lat / Traps",
    tab: "Back",
    slots: slots("Back — Width", "Back — Thickness", "Back — Lower Lat / Traps"),
  },
  "Shoulders Day": {
    label: "Shoulders",
    subtitle: "Front, Side, Rear",
    tab: "Shoulders",
    slots: slots("Shoulders — Front/Mid", "Front Delts", "Shoulders — Side", "Rear Delts"),
  },
  "Arms Day": {
    label: "Arms",
    subtitle: "Triceps (all heads), Biceps (all heads)",
    tab: "Arms",
    slots: slots("Triceps — Long Head", "Triceps — Lateral Head", "Triceps — Medial Head", "Biceps — Long Head", "Biceps — Short Head", "Biceps — Brachialis"),
  },
  "Legs Day": {
    label: "Legs",
    subtitle: "Quads, Hamstrings, Glutes, Calves",
    tab: "Legs",
    slots: slots("Quads — Primary", "Quads — Secondary", "Hamstrings", "Glutes", "Calves"),
  },
};

// ---------------------------------------------------------------------------
// Plan 6: the "Arnold Split" — 6 days, pairing agonist/antagonist muscles
// (chest+back together, shoulders+arms together) rather than push/pull
// separation, run twice a week with one rest day.
// ---------------------------------------------------------------------------
const ARNOLD_DAYS = {
  "Arnold Chest & Back 1": {
    label: "Chest & Back",
    subtitle: "Chest Upper/Middle, Back Width/Thickness",
    tab: "Chest & Back 1",
    slots: slots("Chest — Upper", "Chest — Middle", "Back — Width", "Back — Thickness"),
  },
  "Arnold Shoulders & Arms 1": {
    label: "Shoulders & Arms",
    subtitle: "Side Delts, Front Delts, Triceps, Biceps",
    tab: "Shoulders & Arms 1",
    slots: slots("Shoulders — Side", "Front Delts", "Triceps — Long Head", "Triceps — Lateral Head", "Biceps — Long Head", "Biceps — Short Head"),
  },
  "Arnold Legs 1": {
    label: "Legs",
    subtitle: "Compound Focus",
    tab: "Legs 1",
    slots: slots("Quads — Primary", "Hamstrings", "Glutes", "Calves"),
  },
  "Arnold Chest & Back 2": {
    label: "Chest & Back",
    subtitle: "Chest Lower, Back Lower Lat / Traps",
    tab: "Chest & Back 2",
    slots: slots("Chest — Lower", "Back — Lower Lat / Traps"),
  },
  "Arnold Shoulders & Arms 2": {
    label: "Shoulders & Arms",
    subtitle: "Front/Mid Delts, Rear Delts, Triceps, Biceps",
    tab: "Shoulders & Arms 2",
    slots: slots("Shoulders — Front/Mid", "Rear Delts", "Triceps — Medial Head", "Biceps — Brachialis"),
  },
  "Arnold Legs 2": {
    label: "Legs",
    subtitle: "Machine Isolation or Isometric Hold",
    tab: "Legs 2",
    slots: slots("Quads", "Hamstrings", "Glute Medius / Abductors", "Adductors", "Calves"),
  },
};

// Weekday names in calendar order — used both for the default schedules
// below and for rendering the day tabs/schedule editor in that order.
export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const PLAN_LIBRARY = [
  {
    id: "original",
    name: "PPL + Upper/Lower (5-Day)",
    description: "Push/Pull/Legs to start the week, then an Upper/Lower pair that revisits everything with different angles and equipment.",
    days: ORIGINAL_DAYS,
    defaultSchedule: { Monday: "Push", Tuesday: "Pull", Wednesday: "Legs", Thursday: null, Friday: "Upper", Saturday: "Lower", Sunday: null },
  },
  {
    id: "ppl-6day",
    name: "Push/Pull/Legs (6-Day)",
    description: "The classic PPL run twice a week. Highest weekly frequency per muscle group of these plans — one rest day.",
    days: PPL_DAYS,
    defaultSchedule: { Monday: "Push 1", Tuesday: "Pull 1", Wednesday: "Legs 1", Thursday: "Push 2", Friday: "Pull 2", Saturday: "Legs 2", Sunday: null },
  },
  {
    id: "upper-lower-4day",
    name: "Upper/Lower (4-Day)",
    description: "Four sessions a week alternating upper and lower body. A common middle ground between training frequency and recovery time.",
    days: UPPER_LOWER_DAYS,
    defaultSchedule: { Monday: "Upper 1", Tuesday: "Lower 1", Wednesday: null, Thursday: "Upper 2", Friday: "Lower 2", Saturday: null, Sunday: null },
  },
  {
    id: "full-body-3day",
    name: "Full Body (3-Day)",
    description: "Three sessions a week, every major muscle group each time. Efficient, and one of the most commonly recommended structures for natural lifters.",
    days: FULL_BODY_DAYS,
    defaultSchedule: { Monday: "Full Body A", Tuesday: null, Wednesday: "Full Body B", Thursday: null, Friday: "Full Body C", Saturday: null, Sunday: null },
  },
  {
    id: "bro-split-5day",
    name: "Bro Split (5-Day)",
    description: "One muscle group per day — chest, back, shoulders, arms, legs. Lowest weekly frequency per muscle, highest volume per session.",
    days: BRO_SPLIT_DAYS,
    defaultSchedule: { Monday: "Chest Day", Tuesday: "Back Day", Wednesday: "Shoulders Day", Thursday: "Arms Day", Friday: "Legs Day", Saturday: null, Sunday: null },
  },
  {
    id: "arnold-6day",
    name: "Arnold Split (6-Day)",
    description: "Chest+Back and Shoulders+Arms paired together (rather than push/pull) plus a leg day, run twice a week. Arms train fresh instead of pre-fatigued from pressing or pulling.",
    days: ARNOLD_DAYS,
    defaultSchedule: { Monday: "Arnold Chest & Back 1", Tuesday: "Arnold Shoulders & Arms 1", Wednesday: "Arnold Legs 1", Thursday: "Arnold Chest & Back 2", Friday: "Arnold Shoulders & Arms 2", Saturday: "Arnold Legs 2", Sunday: null },
  },
];

// Every day, from every plan, merged by key — used to look up a day's label
// for history entries regardless of which plan was active when it was saved.
// Day keys must be unique across the whole library for this to be safe; this
// throws early (at import time, so it fails loudly in dev) if a future plan
// accidentally reuses another plan's day key instead of quietly shadowing it.
export const ALL_DAYS_BY_KEY = {};
PLAN_LIBRARY.forEach((plan) => {
  Object.keys(plan.days).forEach((key) => {
    if (ALL_DAYS_BY_KEY[key]) {
      throw new Error(`Duplicate day key "${key}" in plan "${plan.id}" — day keys must be unique across the whole PLAN_LIBRARY.`);
    }
    ALL_DAYS_BY_KEY[key] = plan.days[key];
  });
});

export function getPlan(planId) {
  return PLAN_LIBRARY.find((p) => p.id === planId) || null;
}

// Resolves which of a plan's days is "today" per the given schedule: today's
// real weekday if one is assigned, else the first assigned weekday going
// forward from Monday, else just the plan's first day (schedule missing).
export function getScheduledDay(plan, schedule) {
  const keys = Object.keys(plan.days);
  const todayWeekday = new Date().toLocaleDateString("en-US", { weekday: "long" });
  if (schedule) {
    if (schedule[todayWeekday] && plan.days[schedule[todayWeekday]]) return schedule[todayWeekday];
    for (const w of WEEKDAYS) {
      if (schedule[w] && plan.days[schedule[w]]) return schedule[w];
    }
  }
  return keys[0];
}

// Re-exported for the custom plan builder's "choose existing slot/exercise"
// dropdowns — every plan already shares this exact object per slot name, so
// this is just that shared catalog, not a separate derived copy.
export const GLOBAL_SLOT_LIBRARY = SLOT_LIBRARY;
export const GLOBAL_SLOT_NAMES = Object.keys(GLOBAL_SLOT_LIBRARY).sort();
export const GLOBAL_EXERCISE_LIST = Object.values(GLOBAL_SLOT_LIBRARY)
  .flat()
  .filter((ex, i, arr) => arr.findIndex((e) => e.name === ex.name) === i)
  .sort((a, b) => a.name.localeCompare(b.name));
