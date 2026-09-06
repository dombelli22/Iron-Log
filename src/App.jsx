import React, { useState, useEffect, useMemo, useRef } from "react";
import { Dumbbell, Plus, Trash2, ChevronDown, Save, X, Loader2, History as HistoryIcon, RotateCcw, Timer, TrendingUp, Layers, Home as HomeIcon, Calendar as CalendarIcon } from "lucide-react";
import { storage } from "./storage";
import { PLAN_LIBRARY, ALL_DAYS_BY_KEY, WEEKDAYS, getScheduledDay, GLOBAL_SLOT_LIBRARY, GLOBAL_SLOT_NAMES, GLOBAL_EXERCISE_LIST } from "./plans";
import BodyModel from "react-body-highlighter";

const todayISO = () => new Date().toISOString().slice(0, 10);

const fmtDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

const emptyRow = () => ({ weight: "", value: "", extra: null });
const emptyExtra = () => ({ type: "superset", exercise: "", weight: "", value: "" });

// Dropdown option generator (reps only — weight is manual entry since it
// varies by machine/gym).
function range(start, end, step) {
  const out = [];
  for (let w = start; w <= end + 1e-9; w += step) out.push(Math.round(w * 100) / 100);
  return out;
}
const REPS_OPTIONS = range(1, 20, 1);

// A completed workout's week runs Monday-Sunday; this key (that Monday's
// date) is what decides whether a day's logged data should still be
// showing in the Log tab or whether a new week has started and it should
// reset. Plain date-string math, no ISO week-number edge cases.
function mondayOf(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  const dow = d.getDay(); // 0 Sun .. 6 Sat
  d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
  return d.toISOString().slice(0, 10);
}
const weekKeyFor = (dateStr) => mondayOf(dateStr);

// Shown after a workout is saved. Real, attributed quotes only, majority
// from bodybuilders/strongmen/other health-and-strength figures (historical
// through current, on the app's own "building your body" theme, informal
// is fine) with the rest from war generals (US and otherwise) — nothing
// generic-gym-poster.
const COMPLETION_QUOTES = [
  // Bodybuilders, strongmen & other health/strength figures
  { quote: "The mind is the limit. As long as the mind can envision the fact that you can do something, you can do it, as long as you really believe 100 percent.", author: "Arnold Schwarzenegger" },
  { quote: "For me, life is continuously being hungry. The meaning of life is not simply to exist, to survive, but to move ahead, to go up, to achieve, to conquer.", author: "Arnold Schwarzenegger" },
  { quote: "Strength does not come from winning. Your struggles develop your strengths.", author: "Arnold Schwarzenegger" },
  { quote: "Everybody pities the weak; jealousy you have to earn.", author: "Arnold Schwarzenegger" },
  { quote: "You can't climb the ladder of success with your hands in your pockets.", author: "Arnold Schwarzenegger" },
  { quote: "Exercise is king. Nutrition is queen. Put them together and you've got a kingdom.", author: "Jack LaLanne" },
  { quote: "Your waistline is your lifeline.", author: "Jack LaLanne" },
  { quote: "Nobody ever drowned in his own sweat.", author: "Charles Atlas" },
  { quote: "You have to want it. If you don't want it, you're not going to get anywhere.", author: "Steve Reeves" },
  { quote: "The muscles grow while you rest, not while you exercise.", author: "Eugen Sandow" },
  { quote: "Everybody wants to be a bodybuilder, but don't nobody want to lift this heavy-ass weight.", author: "Ronnie Coleman" },
  { quote: "Ain't nothing to it but to do it.", author: "Ronnie Coleman" },
  { quote: "Light weight, baby! Yeah buddy!", author: "Ronnie Coleman" },
  { quote: "Stimulate the muscle, don't annihilate it.", author: "Lee Haney" },
  { quote: "On the other side of pain is success.", author: "Kai Greene" },
  { quote: "Symmetry, proportion, and muscularity — that's what bodybuilding is about.", author: "Frank Zane" },
  { quote: "Bodybuilding is like any other sport — to excel, you must dedicate yourself completely.", author: "Vince Gironda" },
  { quote: "Bodybuilding is, above all else, a form of self-improvement.", author: "Mike Mentzer" },
  { quote: "There's no reason to be the strongest man in the graveyard.", author: "Jón Páll Sigmarsson" },
  { quote: "Nobody grows in the off-season — they just get fat and call it the off-season.", author: "Jay Cutler" },
  { quote: "It's a great day to be great!", author: "CT Fletcher" },
  { quote: "We don't fight against any opponent — we fight to make ourselves better than we were the day before.", author: "John Grimek" },
  { quote: "Winning doesn't happen on show day. It happens in early mornings, painful workouts, long cardio sessions, and hungry nights.", author: "Chris Bumstead" },
  { quote: "Bodybuilding is art, and my body is the canvas.", author: "Chris Bumstead" },
  { quote: "The mind always fails first, not the body.", author: "Dorian Yates" },
  { quote: "When you're uncomfortable is when you grow.", author: "Tom Platz" },
  { quote: "Intensity builds immensity.", author: "Kevin Levrone" },
  { quote: "Don't stop when you're tired. Stop when you're done.", author: "David Goggins" },
  { quote: "The most important conversations you'll ever have are the ones you'll have with yourself.", author: "David Goggins" },
  { quote: "You are in danger of living a life so comfortable and soft that you will die without ever realizing your true potential.", author: "David Goggins" },
  { quote: "Don't count on motivation. Count on discipline.", author: "Jocko Willink" },
  { quote: "Nobody cares. Work harder.", author: "Cameron Hanes" },
  { quote: "Strength is never a weakness.", author: "Mark Bell" },
  { quote: "Train like an athlete, eat like a bodybuilder.", author: "Elliott Hulse" },
  // War generals
  { quote: "Accept the challenges so that you can feel the exhilaration of victory.", author: "Gen. George S. Patton" },
  { quote: "In preparing for battle I have always found that plans are useless, but planning is indispensable.", author: "Gen. Dwight D. Eisenhower" },
  { quote: "Age wrinkles the body. Quitting wrinkles the soul.", author: "Gen. Douglas MacArthur" },
  { quote: "The art of war is simple enough. Find out where your enemy is. Get at him as soon as you can. Strike him as hard as you can, and keep moving on.", author: "Gen. Ulysses S. Grant" },
  { quote: "Discipline is the soul of an army.", author: "Gen. George Washington" },
  { quote: "It is fatal to enter any war without the will to win it.", author: "Gen. George C. Marshall" },
  { quote: "A dream doesn't become reality through magic; it takes sweat, determination and hard work.", author: "Gen. Colin Powell" },
  { quote: "The truth of the matter is that you always know the right thing to do. The hard part is doing it.", author: "Gen. Norman Schwarzkopf" },
  { quote: "Morale is the greatest single factor in successful war.", author: "Field Marshal Bernard Montgomery" },
  { quote: "Train hard, fight easy.", author: "Generalissimo Alexander Suvorov" },
  { quote: "Victory belongs to the most persevering.", author: "Napoleon Bonaparte" },
  { quote: "Victorious warriors win first and then go to war, while defeated warriors go to war first and then seek to win.", author: "Sun Tzu" },
  { quote: "Do not fight a battle if you don't gain anything by winning.", author: "Field Marshal Erwin Rommel" },
  { quote: "We will either find a way, or make one.", author: "Hannibal Barca" },
  { quote: "There is nothing impossible to him who will try.", author: "Alexander the Great" },
  { quote: "Experience is the teacher of all things.", author: "Julius Caesar" },
];

// ---------------------------------------------------------------------------
// Muscle map — every exercise tagged with the muscles it engages: primary
// (main mover) and secondary (assists). Keyed by exercise name, so it
// applies regardless of which day/slot references it.
// ---------------------------------------------------------------------------
const MUSCLE_MAP = {
  "Machine Incline Press": { primary: ["chest"], secondary: ["frontDelt", "triceps"], detail: { muscle: "chest", region: "upper" } },
  "Incline DB Press": { primary: ["chest"], secondary: ["frontDelt", "triceps"], detail: { muscle: "chest", region: "upper" } },
  "Incline Barbell Press": { primary: ["chest"], secondary: ["frontDelt", "triceps"], detail: { muscle: "chest", region: "upper" } },
  "Incline DB Fly": { primary: ["chest"], secondary: ["frontDelt"], detail: { muscle: "chest", region: "upper" } },
  "Incline Cable Fly": { primary: ["chest"], secondary: ["frontDelt"], detail: { muscle: "chest", region: "upper" } },
  "Incline Machine Fly": { primary: ["chest"], secondary: ["frontDelt"], detail: { muscle: "chest", region: "upper" } },
  "Decline Push-Up": { primary: ["chest"], secondary: ["frontDelt", "triceps"], detail: { muscle: "chest", region: "upper" } },
  "Flat Barbell Press": { primary: ["chest"], secondary: ["frontDelt", "triceps"], detail: { muscle: "chest", region: "middle" } },
  "Flat DB Press": { primary: ["chest"], secondary: ["frontDelt", "triceps"], detail: { muscle: "chest", region: "middle" } },
  "Flat DB Fly": { primary: ["chest"], secondary: ["frontDelt"], detail: { muscle: "chest", region: "middle" } },
  "Flat Cable Fly": { primary: ["chest"], secondary: ["frontDelt"], detail: { muscle: "chest", region: "middle" } },
  "Pec Deck Fly": { primary: ["chest"], secondary: ["frontDelt"], detail: { muscle: "chest", region: "middle" } },
  "Push-Up": { primary: ["chest"], secondary: ["frontDelt", "triceps"], detail: { muscle: "chest", region: "middle" } },
  "Decline DB Fly": { primary: ["chest"], secondary: ["frontDelt"], detail: { muscle: "chest", region: "lower" } },
  "Decline Cable Fly": { primary: ["chest"], secondary: ["frontDelt"], detail: { muscle: "chest", region: "lower" } },
  "Decline DB Press": { primary: ["chest"], secondary: ["triceps", "frontDelt"], detail: { muscle: "chest", region: "lower" } },
  "Decline Barbell Press": { primary: ["chest"], secondary: ["triceps", "frontDelt"], detail: { muscle: "chest", region: "lower" } },
  "Machine Chest Press": { primary: ["chest"], secondary: ["frontDelt", "triceps"], detail: { muscle: "chest", region: "middle" } },
  "Machine Decline Press": { primary: ["chest"], secondary: ["triceps", "frontDelt"], detail: { muscle: "chest", region: "lower" } },
  "Chest Dip": { primary: ["chest"], secondary: ["triceps", "frontDelt"], detail: { muscle: "chest", region: "lower" } },
  "Incline Push-Up": { primary: ["chest"], secondary: ["frontDelt", "triceps"], detail: { muscle: "chest", region: "lower" } },
  "Overhead DB Extension": { primary: ["triceps"], secondary: [], detail: { muscle: "triceps", region: "long" } },
  "Overhead Cable Extension": { primary: ["triceps"], secondary: [], detail: { muscle: "triceps", region: "long" } },
  "Overhead EZ-Bar Extension": { primary: ["triceps"], secondary: [], detail: { muscle: "triceps", region: "long" } },
  "Overhead Barbell Extension": { primary: ["triceps"], secondary: [], detail: { muscle: "triceps", region: "long" } },
  "Single-Arm Cable Pushdown": { primary: ["triceps"], secondary: [], detail: { muscle: "triceps", region: "lateral" } },
  "Rope or Bar Pushdown": { primary: ["triceps"], secondary: [], detail: { muscle: "triceps", region: "lateral" } },
  "V-Bar Pushdown": { primary: ["triceps"], secondary: [], detail: { muscle: "triceps", region: "lateral" } },
  "Machine Triceps Extension": { primary: ["triceps"], secondary: [], detail: { muscle: "triceps", region: "lateral" } },
  "Bench Dip": { primary: ["triceps"], secondary: ["chest", "frontDelt"], detail: { muscle: "triceps", region: "lateral" } },
  "Close-Grip Barbell Bench Press": { primary: ["triceps"], secondary: ["chest", "frontDelt"], detail: { muscle: "triceps", region: "medial" } },
  "Close-Grip DB Bench Press": { primary: ["triceps"], secondary: ["chest", "frontDelt"], detail: { muscle: "triceps", region: "medial" } },
  "Reverse-Grip Cable Pushdown": { primary: ["triceps"], secondary: [], detail: { muscle: "triceps", region: "medial" } },
  "Diamond Push-Up": { primary: ["triceps"], secondary: ["chest", "frontDelt"], detail: { muscle: "triceps", region: "medial" } },
  "DB Skull Crushers": { primary: ["triceps"], secondary: [], detail: { muscle: "triceps", region: "medial" } },
  "Barbell or EZ-Bar Skull Crushers": { primary: ["triceps"], secondary: [], detail: { muscle: "triceps", region: "medial" } },
  "Cable Front Raise": { primary: ["frontDelt"], secondary: [] },
  "DB Front Raise": { primary: ["frontDelt"], secondary: [] },
  "Barbell Front Raise": { primary: ["frontDelt"], secondary: [] },
  "Incline DB Front Raise": { primary: ["frontDelt"], secondary: [] },

  "Lat Pulldown": { primary: ["lats"], secondary: ["biceps", "midBack"] },
  "Wide-Grip Lat Pulldown": { primary: ["lats"], secondary: ["biceps", "midBack"] },
  "Close-Grip Lat Pulldown": { primary: ["lats"], secondary: ["biceps", "midBack"] },
  "Single-Arm Lat Pulldown": { primary: ["lats"], secondary: ["biceps"] },
  "Pull-Up": { primary: ["lats"], secondary: ["biceps", "midBack"] },
  "Chin-Up": { primary: ["lats"], secondary: ["biceps", "midBack"] },
  "Neutral-Grip Pull-Up": { primary: ["lats"], secondary: ["biceps", "midBack"] },

  "Barbell Row": { primary: ["midBack"], secondary: ["lats", "biceps", "rearDelt"] },
  "Pendlay Row": { primary: ["midBack"], secondary: ["lats", "biceps", "rearDelt"] },
  "DB Row": { primary: ["midBack"], secondary: ["lats", "biceps"] },
  "Seated Cable Row": { primary: ["midBack"], secondary: ["lats", "biceps"] },
  "Single-Arm Cable Row": { primary: ["midBack"], secondary: ["lats", "biceps"] },
  "Chest-Supported DB Row": { primary: ["midBack"], secondary: ["lats", "biceps", "rearDelt"] },
  "Chest-Supported Barbell/T-Bar Row": { primary: ["midBack"], secondary: ["lats", "biceps", "rearDelt"] },
  "T-Bar Row": { primary: ["midBack"], secondary: ["lats", "biceps", "rearDelt"] },
  "Machine Row": { primary: ["midBack"], secondary: ["lats", "biceps"] },
  "Inverted Row": { primary: ["midBack"], secondary: ["lats", "biceps", "rearDelt"] },

  "Barbell Deadlift": { primary: ["lowerBack"], secondary: ["hamstrings", "glutes", "traps", "lats"] },
  "Rack Pull": { primary: ["lowerBack"], secondary: ["hamstrings", "glutes", "traps", "lats"] },
  "DB Deadlift": { primary: ["lowerBack"], secondary: ["hamstrings", "glutes", "traps"] },
  "Straight-Arm Pulldown": { primary: ["lats"], secondary: [] },
  "Cable Pullover": { primary: ["lats"], secondary: ["chest", "triceps"] },
  "DB Pullover": { primary: ["lats"], secondary: ["chest", "triceps"] },
  "Barbell Shrug": { primary: ["traps"], secondary: [] },
  "DB Shrug": { primary: ["traps"], secondary: [] },

  "Bayesian Curl": { primary: ["biceps"], secondary: [], detail: { muscle: "biceps", region: "long" } },
  "Incline DB Curl": { primary: ["biceps"], secondary: [], detail: { muscle: "biceps", region: "long" } },
  "Standing Barbell Curl": { primary: ["biceps"], secondary: ["forearm"], detail: { muscle: "biceps", region: "long" } },
  "Cross-Body Cable Curl": { primary: ["biceps"], secondary: [], detail: { muscle: "biceps", region: "long" } },
  "Preacher Curl": { primary: ["biceps"], secondary: [], detail: { muscle: "biceps", region: "short" } },
  "Spider Curl": { primary: ["biceps"], secondary: [], detail: { muscle: "biceps", region: "short" } },
  "Cable Preacher Curl": { primary: ["biceps"], secondary: [], detail: { muscle: "biceps", region: "short" } },
  "Concentration Curl": { primary: ["biceps"], secondary: [], detail: { muscle: "biceps", region: "short" } },
  "Wide-Grip EZ-Bar Curl": { primary: ["biceps"], secondary: [], detail: { muscle: "biceps", region: "short" } },
  "Machine Preacher Curl": { primary: ["biceps"], secondary: [], detail: { muscle: "biceps", region: "short" } },
  "DB Hammer Curl": { primary: ["biceps"], secondary: ["forearm"], detail: { muscle: "biceps", region: "brachialis" } },
  "Cable Hammer Curl": { primary: ["biceps"], secondary: ["forearm"], detail: { muscle: "biceps", region: "brachialis" } },
  "Cross-Body Hammer Curl": { primary: ["biceps"], secondary: ["forearm"], detail: { muscle: "biceps", region: "brachialis" } },
  "Reverse-Grip Barbell Curl": { primary: ["biceps"], secondary: ["forearm"], detail: { muscle: "biceps", region: "brachialis" } },
  "Reverse-Grip EZ-Bar Curl": { primary: ["biceps"], secondary: ["forearm"], detail: { muscle: "biceps", region: "brachialis" } },
  "Barbell or EZ-Bar Curl": { primary: ["biceps"], secondary: [] },
  "DB Curl": { primary: ["biceps"], secondary: [] },
  "Cable Curl": { primary: ["biceps"], secondary: [] },

  "Reverse Pec Deck": { primary: ["rearDelt"], secondary: [] },
  "Face Pull": { primary: ["rearDelt"], secondary: ["traps", "midBack"] },
  "DB Reverse Fly": { primary: ["rearDelt"], secondary: [] },
  "Cable Reverse Fly": { primary: ["rearDelt"], secondary: [] },
  "Bent-Over DB Rear Delt Fly": { primary: ["rearDelt"], secondary: [] },
  "Incline DB Rear Delt Fly": { primary: ["rearDelt"], secondary: [] },

  "Seated DB Overhead Press": { primary: ["frontDelt", "sideDelt"], secondary: ["triceps"] },
  "Seated Barbell Overhead Press": { primary: ["frontDelt", "sideDelt"], secondary: ["triceps"] },
  "Standing Barbell Overhead Press": { primary: ["frontDelt", "sideDelt"], secondary: ["triceps"] },
  "Cable Overhead Press": { primary: ["frontDelt", "sideDelt"], secondary: ["triceps"] },
  "Machine Shoulder Press": { primary: ["frontDelt", "sideDelt"], secondary: ["triceps"] },
  "Arnold Press": { primary: ["frontDelt", "sideDelt"], secondary: ["triceps"] },

  "Cable Lateral Raise": { primary: ["sideDelt"], secondary: [] },
  "DB Lateral Raise": { primary: ["sideDelt"], secondary: [] },
  "Machine Lateral Raise": { primary: ["sideDelt"], secondary: [] },
  "Incline DB Lateral Raise": { primary: ["sideDelt"], secondary: [] },
  "Upright Row": { primary: ["sideDelt"], secondary: ["traps", "biceps"] },

  "Back Squat": { primary: ["quads"], secondary: ["glutes", "hamstrings", "lowerBack"] },
  "Front Squat": { primary: ["quads"], secondary: ["glutes", "lowerBack"] },
  "Goblet Squat": { primary: ["quads"], secondary: ["glutes"] },
  "Hack Squat": { primary: ["quads"], secondary: ["glutes"] },
  "Sissy Squat": { primary: ["quads"], secondary: [] },
  "Leg Press": { primary: ["quads"], secondary: ["glutes", "hamstrings"] },
  "Barbell RDL": { primary: ["hamstrings"], secondary: ["glutes", "lowerBack"] },
  "DB RDL": { primary: ["hamstrings"], secondary: ["glutes", "lowerBack"] },
  "Good Morning": { primary: ["hamstrings"], secondary: ["glutes", "lowerBack"] },
  "Nordic Ham Curl": { primary: ["hamstrings"], secondary: [] },
  "Seated Leg Curl Machine": { primary: ["hamstrings"], secondary: [] },
  "Lying Leg Curl Machine": { primary: ["hamstrings"], secondary: [] },
  "Bulgarian Split Squat": { primary: ["quads"], secondary: ["glutes", "hamstrings"] },
  "Walking Lunges": { primary: ["quads"], secondary: ["glutes", "hamstrings"] },
  "Hip Thrust": { primary: ["glutes"], secondary: ["hamstrings"] },
  "Cable Kickback": { primary: ["glutes"], secondary: [] },
  "Glute Bridge": { primary: ["glutes"], secondary: ["hamstrings"] },
  "Cable Pull-Through": { primary: ["glutes"], secondary: ["hamstrings", "lowerBack"] },
  "Cable Hip Abduction": { primary: ["abductors"], secondary: [] },
  "Cable Hip Adduction": { primary: ["adductors"], secondary: [] },
  "Sumo Squat": { primary: ["adductors"], secondary: ["quads", "glutes"] },
  "Standing Calf Raise": { primary: ["calves"], secondary: [] },
  "Single-Leg DB Calf Raise": { primary: ["calves"], secondary: [] },
  "Barbell Calf Raise": { primary: ["calves"], secondary: [] },
  "Seated Calf Raise": { primary: ["calves"], secondary: [] },
  "Leg Press Calf Raise": { primary: ["calves"], secondary: [] },
  "Leg Extension Machine": { primary: ["quads"], secondary: [] },
  "Leg Curl Machine": { primary: ["hamstrings"], secondary: [] },
  "Hip Abductor Machine": { primary: ["abductors"], secondary: [] },
  "Hip Adductor Machine": { primary: ["adductors"], secondary: [] },
  "Wall Sit": { primary: ["quads"], secondary: [] },
  "Single-Leg RDL Hold": { primary: ["hamstrings"], secondary: ["glutes"] },
  "Side-Lying Hip Abduction Hold": { primary: ["abductors"], secondary: [] },
  "Copenhagen Plank Hold": { primary: ["adductors"], secondary: ["abs"] },
  "Calf Raise Hold": { primary: ["calves"], secondary: [] },
};

// ---------------------------------------------------------------------------
// Hypertrophy rep-range targets, from the original split: compound/press
// movements target 6–10 reps, isolation/fly movements target 10–15. Used to
// flag when your last session already hit (or passed) the top of range.
// ---------------------------------------------------------------------------
const RANGE_BY_TYPE = { compound: [6, 10], isolation: [10, 15] };
const REP_RANGE_TYPE = {
  "Machine Incline Press": "compound", "Incline DB Press": "compound", "Incline Barbell Press": "compound",
  "Incline DB Fly": "isolation", "Incline Cable Fly": "isolation", "Incline Machine Fly": "isolation", "Decline Push-Up": "compound",
  "Flat Barbell Press": "compound", "Flat DB Press": "compound", "Flat DB Fly": "isolation", "Flat Cable Fly": "isolation",
  "Pec Deck Fly": "isolation", "Push-Up": "compound",
  "Decline DB Fly": "isolation", "Decline Cable Fly": "isolation", "Decline DB Press": "compound", "Decline Barbell Press": "compound",
  "Machine Chest Press": "compound", "Machine Decline Press": "compound", "Chest Dip": "compound", "Incline Push-Up": "compound",
  "Overhead DB Extension": "isolation", "Overhead Cable Extension": "isolation", "Overhead EZ-Bar Extension": "isolation", "Overhead Barbell Extension": "isolation",
  "Single-Arm Cable Pushdown": "isolation", "Rope or Bar Pushdown": "isolation", "V-Bar Pushdown": "isolation",
  "Machine Triceps Extension": "isolation", "Bench Dip": "isolation",
  "Close-Grip Barbell Bench Press": "compound", "Close-Grip DB Bench Press": "compound",
  "Reverse-Grip Cable Pushdown": "isolation", "Diamond Push-Up": "compound",
  "DB Skull Crushers": "isolation", "Barbell or EZ-Bar Skull Crushers": "isolation",
  "Cable Front Raise": "isolation", "DB Front Raise": "isolation", "Barbell Front Raise": "isolation", "Incline DB Front Raise": "isolation",
  "Lat Pulldown": "compound", "Wide-Grip Lat Pulldown": "compound", "Close-Grip Lat Pulldown": "compound",
  "Single-Arm Lat Pulldown": "compound", "Pull-Up": "compound", "Chin-Up": "compound", "Neutral-Grip Pull-Up": "compound",
  "Barbell Row": "compound", "Pendlay Row": "compound", "DB Row": "compound", "Seated Cable Row": "compound", "Single-Arm Cable Row": "compound",
  "Chest-Supported DB Row": "compound", "Chest-Supported Barbell/T-Bar Row": "compound",
  "T-Bar Row": "compound", "Machine Row": "compound", "Inverted Row": "compound",
  "Barbell Deadlift": "compound", "Rack Pull": "compound", "DB Deadlift": "compound", "Straight-Arm Pulldown": "isolation",
  "Cable Pullover": "isolation", "DB Pullover": "isolation", "Barbell Shrug": "isolation", "DB Shrug": "isolation",
  "Bayesian Curl": "isolation", "Incline DB Curl": "isolation", "Standing Barbell Curl": "isolation", "Cross-Body Cable Curl": "isolation",
  "Preacher Curl": "isolation", "Spider Curl": "isolation", "Concentration Curl": "isolation", "Wide-Grip EZ-Bar Curl": "isolation", "Machine Preacher Curl": "isolation",
  "Cable Preacher Curl": "isolation", "DB Hammer Curl": "isolation", "Cable Hammer Curl": "isolation", "Cross-Body Hammer Curl": "isolation",
  "Reverse-Grip Barbell Curl": "isolation", "Reverse-Grip EZ-Bar Curl": "isolation",
  "Barbell or EZ-Bar Curl": "isolation", "DB Curl": "isolation", "Cable Curl": "isolation",
  "Reverse Pec Deck": "isolation", "Face Pull": "isolation", "DB Reverse Fly": "isolation", "Cable Reverse Fly": "isolation",
  "Bent-Over DB Rear Delt Fly": "isolation", "Incline DB Rear Delt Fly": "isolation",
  "Seated DB Overhead Press": "compound", "Seated Barbell Overhead Press": "compound", "Standing Barbell Overhead Press": "compound",
  "Cable Overhead Press": "compound", "Machine Shoulder Press": "compound", "Arnold Press": "compound",
  "Cable Lateral Raise": "isolation", "DB Lateral Raise": "isolation", "Machine Lateral Raise": "isolation",
  "Incline DB Lateral Raise": "isolation", "Upright Row": "isolation",
  "Back Squat": "compound", "Front Squat": "compound", "Goblet Squat": "compound", "Hack Squat": "compound", "Sissy Squat": "isolation", "Leg Press": "compound",
  "Barbell RDL": "compound", "DB RDL": "compound", "Good Morning": "compound", "Nordic Ham Curl": "isolation",
  "Seated Leg Curl Machine": "isolation", "Lying Leg Curl Machine": "isolation",
  "Bulgarian Split Squat": "compound", "Walking Lunges": "compound",
  "Hip Thrust": "compound", "Cable Kickback": "isolation", "Glute Bridge": "isolation", "Cable Pull-Through": "compound",
  "Cable Hip Abduction": "isolation", "Cable Hip Adduction": "isolation", "Sumo Squat": "compound",
  "Standing Calf Raise": "isolation", "Single-Leg DB Calf Raise": "isolation", "Barbell Calf Raise": "isolation",
  "Seated Calf Raise": "isolation", "Leg Press Calf Raise": "isolation",
  "Leg Extension Machine": "isolation", "Leg Curl Machine": "isolation", "Hip Abductor Machine": "isolation", "Hip Adductor Machine": "isolation",
};
function getRepRange(exerciseName) {
  const t = REP_RANGE_TYPE[exerciseName];
  return t ? RANGE_BY_TYPE[t] : null;
}

function getMuscleStatus(exerciseName) {
  const map = MUSCLE_MAP[exerciseName];
  const status = {};
  if (!map) return status;
  (map.secondary || []).forEach((m) => { status[m] = "secondary"; });
  (map.primary || []).forEach((m) => { status[m] = "primary"; }); // primary wins any overlap
  return status;
}

// Real anatomical body diagrams, via the MIT-licensed react-body-highlighter
// package (SVG muscle polygons traced from actual anatomy, not hand-drawn
// approximations). Its muscle set is coarser than the one this app tracks
// internally (no separate lats-vs-mid-back, no lateral/side-delt region), so
// this map picks the closest real region for each internal key; sideDelt
// intentionally maps to both delt regions since neither view has a true
// lateral-deltoid shape on its own.
const MUSCLE_KEY_TO_SLUGS = {
  chest: ["chest"],
  frontDelt: ["front-deltoids"],
  sideDelt: ["front-deltoids", "back-deltoids"],
  rearDelt: ["back-deltoids"],
  triceps: ["triceps"],
  biceps: ["biceps"],
  forearm: ["forearm"],
  lats: ["upper-back"],
  midBack: ["upper-back"],
  traps: ["trapezius"],
  lowerBack: ["lower-back"],
  abs: ["abs"],
  obliques: ["obliques"],
  quads: ["quadriceps"],
  hamstrings: ["hamstring"],
  glutes: ["gluteal"],
  calves: ["calves"],
  abductors: ["abductors"],
  adductors: ["adductor"],
};

function statusToBodyData(status) {
  const primary = [];
  const secondary = [];
  Object.entries(status).forEach(([key, level]) => {
    const slugs = MUSCLE_KEY_TO_SLUGS[key] || [];
    (level === "primary" ? primary : secondary).push(...slugs);
  });
  const data = [];
  if (primary.length > 0) data.push({ name: "primary", muscles: primary, frequency: 2 });
  if (secondary.length > 0) data.push({ name: "secondary", muscles: secondary, frequency: 1 });
  return data;
}

const BODY_MODEL_COLORS = ["var(--muscle-secondary)", "var(--accent)"]; // index = frequency - 1

// Sub-region overlays for muscles where a specific head/region is the real
// target (chest upper/middle/lower, tricep long/lateral/medial, bicep
// long/short/brachialis). react-body-highlighter only has one whole-muscle
// polygon per muscle, so these are pre-computed sub-polygons — literally the
// real chest/triceps/biceps shapes above, geometrically clipped into thirds
// (chest, triceps) or lateral/medial bands (biceps) — not separately-sourced
// shapes. Drawn as an absolutely-positioned overlay, same viewBox, directly
// on top of the base model, in the full primary accent color, while the
// whole muscle underneath renders in the dimmer secondary color — so "upper
// chest" reads as "this specific third is the real target; the rest of the
// chest is just along for the ride," not "the whole chest equally."
// Biceps' "brachialis" region is a simplification carried over from the
// rest of this app: brachialis is really a separate, mostly-hidden muscle
// next to the biceps, not a third head of it — this shows it as the
// outer sliver of the biceps shape as the closest visual approximation,
// not a literal anatomical claim.
const DETAIL_OVERLAYS = {
  chest: { view: "anterior", regions: {
    upper: ["51.84 41.63 51.51 47.07 70.20 47.07 62.04 41.63", "29.80 46.53 29.94 47.35 47.92 47.35 47.76 42.04 37.55 42.04"],
    middle: ["51.51 47.07 51.18 52.52 68.80 52.52 70.61 47.35 70.20 47.07", "29.94 47.35 30.91 52.65 48.09 52.65 47.92 47.35"],
    lower: ["51.18 52.52 51.02 55.10 57.96 57.96 67.76 55.51 68.80 52.52", "30.91 52.65 31.43 55.51 40.82 57.96 48.16 55.10 48.09 52.65"],
  } },
  triceps: { view: "posterior", regions: {
    long: ["26.81 49.79 17.87 55.74 16.91 60.43 23.85 60.43 26.81 55.74", "25.56 60.43 26.81 58.30 26.81 60.43", "73.62 50.21 82.13 55.74 83.25 60.85 76.50 60.85 73.19 55.74", "72.77 60.85 72.77 58.30 74.47 60.85"],
    lateral: ["16.91 60.43 14.73 71.06 19.64 71.06 21.70 63.83 23.85 60.43", "25.56 60.43 26.81 60.43 26.81 68.51 25.37 71.06 20.97 71.06 22.55 65.53", "83.25 60.85 85.58 71.49 80.33 71.49 77.87 62.98 76.50 60.85", "72.77 60.85 74.47 60.85 77.02 64.68 78.84 71.49 74.30 71.49 72.77 68.94"],
    medial: ["14.73 71.06 14.47 72.34 16.60 81.70 19.64 71.06", "25.37 71.06 22.98 75.32 19.15 77.45 20.97 71.06", "85.58 71.49 85.96 73.19 83.40 82.13 80.33 71.49", "78.84 71.49 80.43 77.45 76.60 75.32 74.30 71.49"],
  } },
  biceps: { view: "anterior", regions: {
    long: ["19.43 59.18 19.43 69.84 22.86 66.12 24.08 63.67 24.08 52.65 20.41 55.92", "75.27 52.59 75.27 64.14 76.33 66.12 80.07 70.16 80.07 59.79 78.78 55.51"],
    short: ["24.08 63.67 28.98 53.88 27.76 49.39 24.08 52.65", "75.27 52.59 71.43 49.39 70.20 54.69 75.27 64.14"],
    brachialis: ["19.43 59.18 16.73 68.16 17.96 71.43 19.43 69.84", "80.07 70.16 81.63 71.84 82.86 68.98 80.07 59.79"],
  } },
};

// If this exercise's detail region belongs to a muscle that's otherwise
// rendering as "primary," show the whole muscle as "secondary" instead —
// the overlay polygon covers showing the specific real target in full color.
function statusForOverlay(status, detail) {
  if (!detail || status[detail.muscle] !== "primary") return status;
  return { ...status, [detail.muscle]: "secondary" };
}

function DetailOverlay({ detail, view }) {
  const entry = detail && DETAIL_OVERLAYS[detail.muscle];
  if (!entry || entry.view !== view) return null;
  const polys = entry.regions[detail.region];
  if (!polys || polys.length === 0) return null;
  return (
    <svg viewBox="0 0 100 200" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      {polys.map((pts, i) => <polygon key={i} points={pts} fill="var(--accent)" />)}
    </svg>
  );
}

function BodyFront({ status, detail }) {
  return (
    <div aria-label="Front muscles worked" style={{ position: "relative", width: 52, height: 104 }}>
      <BodyModel type="anterior" data={statusToBodyData(statusForOverlay(status, detail))} bodyColor="var(--border)" highlightedColors={BODY_MODEL_COLORS} style={{ width: "100%", height: "100%" }} />
      <DetailOverlay detail={detail} view="anterior" />
    </div>
  );
}
function BodyBack({ status, detail }) {
  return (
    <div aria-label="Back muscles worked" style={{ position: "relative", width: 52, height: 104 }}>
      <BodyModel type="posterior" data={statusToBodyData(statusForOverlay(status, detail))} bodyColor="var(--border)" highlightedColors={BODY_MODEL_COLORS} style={{ width: "100%", height: "100%" }} />
      <DetailOverlay detail={detail} view="posterior" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Home — the app's landing screen. Lets you jump back into whichever plan
// you last picked, or browse/switch to a different workout split. Deeper
// customization (which exercises populate a slot) happens once you're in a
// plan, via the existing add/remove-exercise flow.
// ---------------------------------------------------------------------------
// Maps the two quiz answers (days available, and a tiebreak style question
// only asked at 5 or 6 days where more than one plan fits) to a plan id.
function recommendPlanId({ days, fiveDayStyle, sixDayStyle }) {
  if (days === 3) return "full-body-3day";
  if (days === 4) return "upper-lower-4day";
  if (days === 5) return fiveDayStyle === "focused" ? "bro-split-5day" : "original";
  if (days === 6) return sixDayStyle === "paired" ? "arnold-6day" : "ppl-6day";
  return "original";
}

const homeChoiceButtonStyle = {
  width: "100%", textAlign: "left", padding: "14px", borderRadius: 12, cursor: "pointer",
  background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)",
};

function HomeScreen({ plans, activePlanId, onChoosePlan, onContinue, onStartBuild }) {
  const activePlan = plans.find((p) => p.id === activePlanId);
  // landing -> quizDays -> [quizStyle] -> recommend, or landing -> browse
  const [mode, setMode] = useState("landing");
  const [answers, setAnswers] = useState({ days: null, fiveDayStyle: null, sixDayStyle: null });

  function startQuiz() {
    setAnswers({ days: null, fiveDayStyle: null, sixDayStyle: null });
    setMode("quizDays");
  }
  function pickDays(days) {
    setAnswers((prev) => ({ ...prev, days }));
    setMode(days === 5 || days === 6 ? "quizStyle" : "recommend");
  }
  function pickStyle(value) {
    setAnswers((prev) => ({ ...prev, [prev.days === 5 ? "fiveDayStyle" : "sixDayStyle"]: value }));
    setMode("recommend");
  }

  const header = (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 4 }}>
      <Dumbbell size={22} color="var(--accent)" />
      <span className="brand" style={{ fontSize: 30, lineHeight: 1 }}>IRON LOG</span>
    </div>
  );

  function BackButton({ onClick }) {
    return (
      <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 16, color: "var(--text-muted)", fontSize: 12 }}>
        ‹ Back
      </button>
    );
  }

  if (mode === "quizDays" || mode === "quizStyle") {
    const is5 = answers.days === 5;
    return (
      <div style={{ padding: "calc(24px + env(safe-area-inset-top)) 16px calc(60px + env(safe-area-inset-bottom))", maxWidth: 520, margin: "0 auto" }}>
        {header}
        <div style={{ height: 24 }} />
        <BackButton onClick={() => setMode(mode === "quizStyle" ? "quizDays" : "landing")} />
        {mode === "quizDays" ? (
          <>
            <div className="display" style={{ fontSize: 18, marginBottom: 4 }}>How Many Days a Week?</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 20 }}>
              Be realistic about your schedule — fewer, consistent sessions beat an ambitious plan you can't stick to.
              You can always change this later.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[3, 4, 5, 6].map((n) => (
                <button key={n} onClick={() => pickDays(n)} style={homeChoiceButtonStyle}>
                  <div className="display" style={{ fontSize: 14 }}>{n} days a week</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="display" style={{ fontSize: 18, marginBottom: 4 }}>What Matters More to You?</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 20 }}>
              At {answers.days} days a week, more than one split works well — this just breaks the tie.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {is5 ? (
                <>
                  <button onClick={() => pickStyle("frequency")} style={homeChoiceButtonStyle}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>Hit every muscle more than once a week</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>Higher frequency, more balanced week to week</div>
                  </button>
                  <button onClick={() => pickStyle("focused")} style={homeChoiceButtonStyle}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>One focused muscle group per session</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>Classic bodybuilder style, highest volume per session</div>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => pickStyle("pushpull")} style={homeChoiceButtonStyle}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>Keep pushing and pulling movements separate</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>The classic Push/Pull/Legs structure</div>
                  </button>
                  <button onClick={() => pickStyle("paired")} style={homeChoiceButtonStyle}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>Pair opposing muscles together each session</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>E.g. chest with back, so arms train fresh</div>
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  if (mode === "recommend") {
    const recommendedPlan = plans.find((p) => p.id === recommendPlanId(answers));
    const sessionCount = recommendedPlan ? Object.keys(recommendedPlan.days).length : 0;
    return (
      <div style={{ padding: "calc(24px + env(safe-area-inset-top)) 16px calc(60px + env(safe-area-inset-bottom))", maxWidth: 520, margin: "0 auto" }}>
        {header}
        <div style={{ height: 24 }} />
        <BackButton onClick={() => setMode(answers.days === 5 || answers.days === 6 ? "quizStyle" : "quizDays")} />
        <div className="display" style={{ fontSize: 18, marginBottom: 4 }}>Recommended for You</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 20 }}>
          Based on what you told us, this is the best fit — but every split is listed below too if you'd rather look around.
        </div>
        {recommendedPlan && (
          <div style={{ padding: "16px", borderRadius: 12, background: "var(--accent-dim)", border: "1px solid var(--accent)", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
              <div className="display" style={{ fontSize: 16 }}>{recommendedPlan.name}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{sessionCount}x/week</div>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 14 }}>{recommendedPlan.description}</div>
            <button onClick={() => onChoosePlan(recommendedPlan.id)} style={{ width: "100%", padding: "11px", borderRadius: 8, fontSize: 13.5, fontWeight: 700, cursor: "pointer", border: "none", background: "var(--accent)", color: "var(--on-accent)" }}>
              Use This Plan
            </button>
          </div>
        )}
        <button onClick={() => setMode("browse")} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "8px", color: "var(--text-muted)", fontSize: 12.5, textDecoration: "underline" }}>
          See All Splits Instead
        </button>
      </div>
    );
  }

  if (mode === "browse") {
    return (
      <div style={{ padding: "calc(24px + env(safe-area-inset-top)) 16px calc(60px + env(safe-area-inset-bottom))", maxWidth: 520, margin: "0 auto" }}>
        {header}
        <div style={{ height: 24 }} />
        <BackButton onClick={() => setMode("landing")} />
        <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 10 }}>
          {activePlan ? "Switch Plan" : "All Splits"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {plans.map((plan) => {
            const isActive = plan.id === activePlanId;
            const sessionCount = Object.keys(plan.days).length;
            return (
              <div
                key={plan.id}
                style={{ padding: "14px", borderRadius: 12, background: "var(--surface)", border: isActive ? "1px solid var(--accent)" : "1px solid var(--border)" }}
              >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                  <div className="display" style={{ fontSize: 14 }}>{plan.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{sessionCount}x/week</div>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 12 }}>{plan.description}</div>
                <button
                  onClick={() => onChoosePlan(plan.id)}
                  style={{ width: "100%", padding: "9px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", border: isActive ? "1px solid var(--border)" : "none", background: isActive ? "transparent" : "var(--accent)", color: isActive ? "var(--text-muted)" : "var(--on-accent)" }}
                >
                  {isActive ? "Restart This Plan" : "Use This Plan"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // mode === "landing"
  return (
    <div style={{ padding: "calc(24px + env(safe-area-inset-top)) 16px calc(60px + env(safe-area-inset-bottom))", maxWidth: 520, margin: "0 auto" }}>
      {header}
      <div className="display" style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", letterSpacing: "0.08em", marginBottom: 28 }}>
        Choose Your Workout Split
      </div>

      {activePlan && (
        <button
          onClick={onContinue}
          style={{ width: "100%", textAlign: "left", padding: "16px", borderRadius: 12, background: "var(--accent-dim)", border: "1px solid var(--accent)", cursor: "pointer", marginBottom: 24, color: "var(--text)" }}
        >
          <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Continue</div>
          <div className="display" style={{ fontSize: 16 }}>{activePlan.name}</div>
        </button>
      )}

      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 10 }}>
        {activePlan ? "Switch Plan" : "Get Started"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={startQuiz} style={{ width: "100%", textAlign: "left", padding: "16px", borderRadius: 12, background: "var(--accent)", border: "none", cursor: "pointer" }}>
          <div className="display" style={{ fontSize: 15, color: "var(--on-accent)" }}>Help Me Choose</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 3 }}>Answer a couple quick questions about your schedule and goals</div>
        </button>
        <button onClick={() => setMode("browse")} style={{ width: "100%", textAlign: "left", padding: "16px", borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text)" }}>
          <div className="display" style={{ fontSize: 15 }}>Suggested Splits</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>See every option and pick one yourself</div>
        </button>
        <button onClick={onStartBuild} style={{ width: "100%", textAlign: "left", padding: "16px", borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text)" }}>
          <div className="display" style={{ fontSize: 15 }}>Build My Own Split</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>Build a custom split day by day</div>
        </button>
      </div>

      <div style={{ fontSize: 11.5, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5, marginTop: 24 }}>
        Once you're in a plan, you can add or remove specific exercises in each slot to make it your own.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Assign a plan's sessions to real days of the week. Shown the first time a
// plan is picked (pre-filled with a sensible default), and re-visitable any
// time from the calendar icon in the header — nothing about which days you
// train is assumed without a way to see and change it.
// ---------------------------------------------------------------------------
function ScheduleScreen({ plan, schedule, onSave, onBack }) {
  const [draft, setDraft] = useState(schedule);
  const dayKeys = Object.keys(plan.days);

  function setDayFor(weekday, value) {
    setDraft((prev) => ({ ...prev, [weekday]: value || null }));
  }

  const assignedCount = WEEKDAYS.filter((w) => draft[w]).length;

  return (
    <div style={{ padding: "calc(24px + env(safe-area-inset-top)) 16px calc(60px + env(safe-area-inset-bottom))", maxWidth: 520, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 16, color: "var(--text-muted)", fontSize: 12 }}>
        ‹ Back to Plans
      </button>
      <div className="display" style={{ fontSize: 18, marginBottom: 4 }}>Assign Your Schedule</div>
      <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 20 }}>
        {plan.name} has {dayKeys.length} session{dayKeys.length > 1 ? "s" : ""}. Pick which day of the week each one falls
        on — leave a day as Rest if you're not training that day. You can change this anytime from the calendar icon.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {WEEKDAYS.map((w) => (
          <div key={w} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="display" style={{ fontSize: 13 }}>{w}</div>
            <select
              value={draft[w] || ""}
              onChange={(e) => setDayFor(w, e.target.value)}
              style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, minWidth: 160 }}
            >
              <option value="">Rest Day</option>
              {dayKeys.map((key) => (
                <option key={key} value={key}>{plan.days[key].tab}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <button
        onClick={() => onSave(draft)}
        disabled={assignedCount === 0}
        style={{ width: "100%", marginTop: 20, padding: "13px", borderRadius: 10, background: assignedCount === 0 ? "var(--surface-2)" : "var(--accent)", border: "none", cursor: assignedCount === 0 ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 700, color: assignedCount === 0 ? "var(--text-muted)" : "var(--on-accent)" }}
      >
        Save & Continue
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Entry point for backfilling a past workout from the History tab: pick a
// date (native date input — gives a real calendar picker), then which of the
// active plan's days it was, or "Doesn't Match My Split" for a workout
// logged with no structured slots at all (see BACKFILL_CUSTOM_KEY).
// ---------------------------------------------------------------------------
function AddPastWorkoutSetup({ plan, onStart, onBack }) {
  const [date, setDate] = useState(todayISO());
  const dayKeys = Object.keys(plan.days);

  return (
    <div style={{ padding: "calc(24px + env(safe-area-inset-top)) 16px calc(60px + env(safe-area-inset-bottom))", maxWidth: 520, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 16, color: "var(--text-muted)", fontSize: 12 }}>
        ‹ Back to History
      </button>
      <div className="display" style={{ fontSize: 18, marginBottom: 4 }}>Add a Past Workout</div>
      <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 20 }}>
        Pick the date, then which day of your split it was — or log it separately if it doesn't match anything in {plan.name}.
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: 6 }}>Date</div>
      <input
        type="date"
        value={date}
        max={todayISO()}
        onChange={(e) => setDate(e.target.value)}
        style={{ width: "100%", padding: "11px 12px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14, marginBottom: 20, colorScheme: "dark" }}
      />

      <div style={{ fontSize: 10.5, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: 8 }}>Which Workout?</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {dayKeys.map((key) => (
          <button key={key} onClick={() => onStart(date, key)} style={homeChoiceButtonStyle}>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{plan.days[key].tab}</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{plan.days[key].label}</div>
          </button>
        ))}
        <button onClick={() => onStart(date, "__custom__")} style={{ ...homeChoiceButtonStyle, border: "1px dashed var(--border)" }}>
          <div style={{ fontWeight: 700, fontSize: 13.5 }}>Doesn't Match My Split</div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>Log it separately — type in whatever you did</div>
        </button>
      </div>
    </div>
  );
}

// Shown right after a workout is saved (live or backfilled).
function CompletionQuoteModal({ quote, onClose }) {
  if (!quote) return null;
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420, width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 24px", textAlign: "center" }}>
        <div className="display" style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 18 }}>Workout Complete</div>
        <div style={{ fontSize: 17, lineHeight: 1.55, color: "var(--text)", fontStyle: "italic", marginBottom: 14 }}>
          &ldquo;{quote.quote}&rdquo;
        </div>
        <div className="display" style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 22 }}>— {quote.author}</div>
        <button
          onClick={onClose}
          style={{ width: "100%", padding: "12px", borderRadius: 10, background: "var(--accent)", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "var(--on-accent)" }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

const EQUIP_CHOICES = ["Barbell", "EZ-Bar", "Dumbbell", "Cable", "Machine", "Bodyweight"];

// Sentinel `day` value used only while backfilling a past workout that
// doesn't match any of the plan's own days ("Custom Workout" path) — keeps
// its draft/customDraft/addedDraft state fully isolated from any real day
// key so it can never collide with a live in-progress session.
const BACKFILL_CUSTOM_KEY = "__backfill_custom__";

// Cable-only: which attachment is on the machine. Shared one field per
// exercise (like notes), not per set — you don't swap attachments mid-set.
const CABLE_ATTACHMENTS = [
  "Straight Bar",
  "EZ-Curl Bar",
  "Rope",
  "V-Bar",
  "Single D-Handle",
  "Double D-Handle",
  "Lat Pulldown Bar (Wide)",
  "Seated Row Bar",
  "Multi-Grip Camber Bar",
  "Ankle Strap",
  "Ab/Crunch Strap",
];

// Small "existing" vs "manual" pill switch, used to let the from-scratch
// slot builder pick a slot/exercise from the app's existing library or type
// a brand new one, per field, independently.
function ModeToggle({ mode, onChange, existingLabel, manualLabel }) {
  return (
    <div style={{ display: "flex", gap: 4, background: "var(--surface)", padding: 3, borderRadius: 8, border: "1px solid var(--border)", marginBottom: 8 }}>
      <button onClick={() => onChange("existing")} style={{ flex: 1, padding: "6px 8px", borderRadius: 6, fontSize: 11.5, fontWeight: 600, border: "none", cursor: "pointer", background: mode === "existing" ? "var(--accent)" : "transparent", color: mode === "existing" ? "var(--on-accent)" : "var(--text-muted)" }}>
        {existingLabel}
      </button>
      <button onClick={() => onChange("manual")} style={{ flex: 1, padding: "6px 8px", borderRadius: 6, fontSize: 11.5, fontWeight: 600, border: "none", cursor: "pointer", background: mode === "manual" ? "var(--accent)" : "transparent", color: mode === "manual" ? "var(--on-accent)" : "var(--text-muted)" }}>
        {manualLabel}
      </button>
    </div>
  );
}

// A day-picker grouped by originating plan, reused for both "choose an
// existing day verbatim" and "model my custom day after this one" — the
// only difference is what the caller does with the (plan, dayKey) it gets.
function ExistingDayPicker({ existingPlans, onPick }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {existingPlans.map((plan) => (
        <div key={plan.id}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 8 }}>{plan.name}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Object.keys(plan.days).map((dayKey) => (
              <button key={dayKey} onClick={() => onPick(plan, dayKey)} style={homeChoiceButtonStyle}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{plan.days[dayKey].tab}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Build a fully custom split from the ground up. Each day either clones an
// existing day verbatim (name and slots both), or gets a typed-in name that
// either models an existing day's slots or starts completely empty and gets
// slots hand-entered one at a time (manual exercise names — no dropdown
// library lookup, since a from-scratch day isn't assumed to reuse anything).
// ---------------------------------------------------------------------------
function BuildPlanScreen({ existingPlans, onSave, onCancel }) {
  const [step, setStep] = useState("name");
  const [planName, setPlanName] = useState("");
  const [days, setDays] = useState([]);

  const [customLabel, setCustomLabel] = useState("");
  const [scratchSlots, setScratchSlots] = useState([]);
  const [slotEntryMode, setSlotEntryMode] = useState("existing"); // "existing" | "manual"
  const [exerciseEntryMode, setExerciseEntryMode] = useState("existing"); // "existing" | "manual"
  const [slotNameDraft, setSlotNameDraft] = useState("");
  const [exerciseNameDraft, setExerciseNameDraft] = useState("");
  const [exerciseTypeDraft, setExerciseTypeDraft] = useState("reps");
  const [exerciseEquipDraft, setExerciseEquipDraft] = useState("Machine");

  function resetDayFlow() {
    setCustomLabel("");
    setScratchSlots([]);
    setSlotEntryMode("existing");
    setExerciseEntryMode("existing");
    setSlotNameDraft("");
    setExerciseNameDraft("");
    setExerciseTypeDraft("reps");
    setExerciseEquipDraft("Machine");
  }

  // Exercises offered in the "choose existing exercise" dropdown: scoped to
  // the chosen slot's own exercise pool if the slot name matches a known
  // one, otherwise every exercise in the app.
  const exerciseChoicesForSlot = GLOBAL_SLOT_LIBRARY[slotNameDraft] || GLOBAL_EXERCISE_LIST;

  function pickExistingExercise(name) {
    const found = exerciseChoicesForSlot.find((e) => e.name === name);
    setExerciseNameDraft(name);
    if (found) {
      setExerciseTypeDraft(found.type);
      setExerciseEquipDraft(found.equip);
    }
  }

  function pickExistingSlot(name) {
    setSlotNameDraft(name);
    setExerciseNameDraft(""); // that exercise pick may not apply to the new slot
  }

  function addDay(dayObj) {
    setDays((prev) => [...prev, dayObj]);
    resetDayFlow();
    setStep("days");
  }

  function pickExistingVerbatim(plan, dayKey) {
    const d = plan.days[dayKey];
    addDay({ label: d.label, tab: d.tab, subtitle: d.subtitle, slots: d.slots });
  }

  function pickModelAfter(plan, dayKey) {
    const d = plan.days[dayKey];
    addDay({ label: customLabel, tab: customLabel, subtitle: d.subtitle, slots: d.slots });
  }

  function addScratchSlot() {
    if (!slotNameDraft.trim() || !exerciseNameDraft.trim()) return;
    setScratchSlots((prev) => [...prev, { name: slotNameDraft.trim(), exercises: [{ name: exerciseNameDraft.trim(), type: exerciseTypeDraft, equip: exerciseEquipDraft }] }]);
    setSlotNameDraft("");
    setExerciseNameDraft("");
  }

  function finishScratchDay() {
    if (scratchSlots.length === 0) return;
    addDay({ label: customLabel, tab: customLabel, subtitle: `${scratchSlots.length} slot${scratchSlots.length > 1 ? "s" : ""}`, slots: scratchSlots });
  }

  const header = (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 4 }}>
      <Dumbbell size={22} color="var(--accent)" />
      <span className="brand" style={{ fontSize: 30, lineHeight: 1 }}>IRON LOG</span>
    </div>
  );

  function BackButton({ onClick }) {
    return (
      <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 16, color: "var(--text-muted)", fontSize: 12 }}>
        ‹ Back
      </button>
    );
  }

  const shell = (backTo, content) => (
    <div style={{ padding: "calc(24px + env(safe-area-inset-top)) 16px calc(60px + env(safe-area-inset-bottom))", maxWidth: 520, margin: "0 auto" }}>
      {header}
      <div style={{ height: 24 }} />
      <BackButton onClick={backTo} />
      {content}
    </div>
  );

  if (step === "name") {
    return shell(onCancel, (
      <>
        <div className="display" style={{ fontSize: 18, marginBottom: 4 }}>Name Your Split</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 16 }}>
          What do you want to call it? You'll add the individual training days next.
        </div>
        <input
          type="text" autoFocus
          placeholder="e.g. My Push Focus Split"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          style={{ width: "100%", padding: "11px 12px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14, marginBottom: 16 }}
        />
        <button
          onClick={() => setStep("days")}
          disabled={!planName.trim()}
          style={{ width: "100%", padding: "13px", borderRadius: 10, background: !planName.trim() ? "var(--surface-2)" : "var(--accent)", border: "none", cursor: !planName.trim() ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 700, color: !planName.trim() ? "var(--text-muted)" : "var(--on-accent)" }}
        >
          Next: Add Days
        </button>
      </>
    ));
  }

  if (step === "days") {
    return shell(onCancel, (
      <>
        <div className="display" style={{ fontSize: 18, marginBottom: 4 }}>{planName}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 16 }}>
          Add each training day in this split. Order doesn't matter — you'll assign real days of the week after saving.
        </div>
        {days.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {days.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{d.tab}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.slots.length} slot{d.slots.length > 1 ? "s" : ""}</div>
                </div>
                <button onClick={() => setDays((prev) => prev.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <Trash2 size={14} color="var(--text-muted)" />
                </button>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => setStep("dayNameChoice")} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px", borderRadius: 12, background: "transparent", border: "1px dashed var(--accent)", cursor: "pointer", color: "var(--accent)", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
          <Plus size={16} /> Add a Day
        </button>
        <button
          onClick={() => onSave({ name: planName, days })}
          disabled={days.length === 0}
          style={{ width: "100%", padding: "13px", borderRadius: 10, background: days.length === 0 ? "var(--surface-2)" : "var(--accent)", border: "none", cursor: days.length === 0 ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 700, color: days.length === 0 ? "var(--text-muted)" : "var(--on-accent)" }}
        >
          Save & Finish
        </button>
      </>
    ));
  }

  if (step === "dayNameChoice") {
    return shell(() => setStep("days"), (
      <>
        <div className="display" style={{ fontSize: 18, marginBottom: 4 }}>How Do You Want to Name This Day?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => setStep("dayExisting")} style={homeChoiceButtonStyle}>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>Choose From Existing Days</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>Pick a day like "Push" or "Chest" — its exercises come with it</div>
          </button>
          <button onClick={() => setStep("dayCustomName")} style={homeChoiceButtonStyle}>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>Name It Myself</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>Type your own name for this day</div>
          </button>
        </div>
      </>
    ));
  }

  if (step === "dayExisting") {
    return shell(() => setStep("dayNameChoice"), (
      <>
        <div className="display" style={{ fontSize: 18, marginBottom: 4 }}>Choose a Day</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 16 }}>
          Its exercises will carry over exactly as they are in that split.
        </div>
        <ExistingDayPicker existingPlans={existingPlans} onPick={pickExistingVerbatim} />
      </>
    ));
  }

  if (step === "dayCustomName") {
    return shell(() => setStep("dayNameChoice"), (
      <>
        <div className="display" style={{ fontSize: 18, marginBottom: 4 }}>Name This Day</div>
        <input
          type="text" autoFocus
          placeholder="e.g. Chest & Triceps"
          value={customLabel}
          onChange={(e) => setCustomLabel(e.target.value)}
          style={{ width: "100%", padding: "11px 12px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14, marginBottom: 16 }}
        />
        <button
          onClick={() => setStep("dayModelChoice")}
          disabled={!customLabel.trim()}
          style={{ width: "100%", padding: "13px", borderRadius: 10, background: !customLabel.trim() ? "var(--surface-2)" : "var(--accent)", border: "none", cursor: !customLabel.trim() ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 700, color: !customLabel.trim() ? "var(--text-muted)" : "var(--on-accent)" }}
        >
          Next
        </button>
      </>
    ));
  }

  if (step === "dayModelChoice") {
    return shell(() => setStep("dayCustomName"), (
      <>
        <div className="display" style={{ fontSize: 18, marginBottom: 4 }}>Model "{customLabel}" After an Existing Day?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => setStep("dayModelPick")} style={homeChoiceButtonStyle}>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>Yes, Pick One</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>Copy its exercises in, keeping your name for the day</div>
          </button>
          <button onClick={() => setStep("dayScratch")} style={homeChoiceButtonStyle}>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>No, Build From Scratch</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>Type in your own exercises for this day</div>
          </button>
        </div>
      </>
    ));
  }

  if (step === "dayModelPick") {
    return shell(() => setStep("dayModelChoice"), (
      <>
        <div className="display" style={{ fontSize: 18, marginBottom: 4 }}>Model After Which Day?</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 16 }}>
          "{customLabel}" will use this day's exercises.
        </div>
        <ExistingDayPicker existingPlans={existingPlans} onPick={pickModelAfter} />
      </>
    ));
  }

  if (step === "dayScratch") {
    return shell(() => setStep("dayModelChoice"), (
      <>
        <div className="display" style={{ fontSize: 18, marginBottom: 4 }}>Build "{customLabel}" From Scratch</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 16 }}>
          Add each exercise slot one at a time — a slot name (like "Chest — Upper" or just "Chest") and an exercise for it.
        </div>
        {scratchSlots.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
            {scratchSlots.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12.5 }}>
                  <span style={{ color: "var(--text-muted)" }}>{s.name}:</span> {s.exercises[0].name}
                </div>
                <button onClick={() => setScratchSlots((prev) => prev.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <X size={13} color="var(--text-muted)" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div style={{ padding: "12px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)", marginBottom: 16 }}>
          <div style={{ fontSize: 10.5, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: 6 }}>Slot</div>
          <ModeToggle mode={slotEntryMode} onChange={(m) => { setSlotEntryMode(m); setSlotNameDraft(""); }} existingLabel="Choose Existing" manualLabel="Type My Own" />
          {slotEntryMode === "existing" ? (
            <select value={slotNameDraft} onChange={(e) => pickExistingSlot(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: slotNameDraft ? "var(--text)" : "var(--text-muted)", fontSize: 13, marginBottom: 12 }}>
              <option value="">Select a slot…</option>
              {GLOBAL_SLOT_NAMES.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Slot name (e.g. Chest — Upper)"
              value={slotNameDraft}
              onChange={(e) => setSlotNameDraft(e.target.value)}
              style={{ width: "100%", padding: "9px 10px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, marginBottom: 12 }}
            />
          )}

          <div style={{ fontSize: 10.5, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: 6 }}>Exercise</div>
          <ModeToggle mode={exerciseEntryMode} onChange={(m) => { setExerciseEntryMode(m); setExerciseNameDraft(""); }} existingLabel="Choose Existing" manualLabel="Type My Own" />
          {exerciseEntryMode === "existing" ? (
            <select value={exerciseNameDraft} onChange={(e) => pickExistingExercise(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: exerciseNameDraft ? "var(--text)" : "var(--text-muted)", fontSize: 13, marginBottom: 8 }}>
              <option value="">Select an exercise…</option>
              {exerciseChoicesForSlot.map((ex) => <option key={ex.name} value={ex.name}>{ex.name}</option>)}
            </select>
          ) : (
            <>
              <input
                type="text"
                placeholder="Exercise name"
                value={exerciseNameDraft}
                onChange={(e) => setExerciseNameDraft(e.target.value)}
                style={{ width: "100%", padding: "9px 10px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, marginBottom: 8 }}
              />
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <select value={exerciseTypeDraft} onChange={(e) => setExerciseTypeDraft(e.target.value)} style={{ flex: 1, padding: "9px 8px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5 }}>
                  <option value="reps">Reps</option>
                  <option value="time">Timed</option>
                </select>
                <select value={exerciseEquipDraft} onChange={(e) => setExerciseEquipDraft(e.target.value)} style={{ flex: 1, padding: "9px 8px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5 }}>
                  {EQUIP_CHOICES.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
                </select>
              </div>
            </>
          )}

          <button
            onClick={addScratchSlot}
            disabled={!slotNameDraft.trim() || !exerciseNameDraft.trim()}
            style={{ width: "100%", padding: "9px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: (!slotNameDraft.trim() || !exerciseNameDraft.trim()) ? "not-allowed" : "pointer", border: "1px solid var(--border)", background: "transparent", color: "var(--text)" }}
          >
            Add This Slot
          </button>
        </div>
        <button
          onClick={finishScratchDay}
          disabled={scratchSlots.length === 0}
          style={{ width: "100%", padding: "13px", borderRadius: 10, background: scratchSlots.length === 0 ? "var(--surface-2)" : "var(--accent)", border: "none", cursor: scratchSlots.length === 0 ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 700, color: scratchSlots.length === 0 ? "var(--text-muted)" : "var(--on-accent)" }}
        >
          Done — Add This Day
        </button>
      </>
    ));
  }

  return null;
}

export default function WorkoutTracker() {
  // Always land on Home first; it decides whether to jump back into a
  // previously-chosen plan or ask you to pick one.
  const [screen, setScreen] = useState("home");
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [planLoaded, setPlanLoaded] = useState(false);
  const [schedules, setSchedules] = useState({}); // { [planId]: { Monday: dayKey|null, ..., Sunday: dayKey|null } }
  const [schedulesLoaded, setSchedulesLoaded] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState(null); // schedule being edited on the Assign Schedule screen

  const [view, setView] = useState("log");
  const [day, setDay] = useState(null);
  const [openSlot, setOpenSlot] = useState(null);
  const [openHistoryId, setOpenHistoryId] = useState(null); // history session id expanded to the summary view
  const [fullHistoryId, setFullHistoryId] = useState(null); // history session id expanded further, to the full per-set view
  const [backfill, setBackfill] = useState(null); // null | { date: "YYYY-MM-DD", dayKey: string | "__custom__" } — set while logging a past workout
  const [draft, setDraft] = useState({}); // { [slotName]: { exercise, notes, sets: [{weight, value}] } }
  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [storageError, setStorageError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [customDraft, setCustomDraft] = useState({}); // { [day]: [{ id, exercise, notes, sets }] }
  const [openCustomId, setOpenCustomId] = useState(null);
  const [removedFromSlots, setRemovedFromSlots] = useState({}); // { [planId]: { [slotName]: [exerciseName, ...] } }
  const [removedLoaded, setRemovedLoaded] = useState(false);
  const [addedDraft, setAddedDraft] = useState({}); // { [day]: [{ id, slotName, exercise, notes, sets }] }
  const [openAddedId, setOpenAddedId] = useState(null);
  const [addFlow, setAddFlow] = useState(null); // null | { step, bodyPart, slotName }
  const [customPlans, setCustomPlans] = useState([]); // user-built plans, same shape as PLAN_LIBRARY entries
  const [customPlansLoaded, setCustomPlansLoaded] = useState(false);
  // A live (non-backfilled) day's completed workout, kept for reference/editing
  // in the Log tab through the rest of that calendar week: { [dayKey]: { weekKey,
  // sessionId, draft, customDraft, addedDraft } }. Re-saving while weekKey still
  // matches updates that same history entry instead of creating a duplicate.
  const [weekDrafts, setWeekDrafts] = useState({});
  const [weekDraftsLoaded, setWeekDraftsLoaded] = useState(false);
  const dayLiveWeekKeyRef = useRef({}); // [dayKey]: the weekKey currently reflected in live draft state
  const [completionQuote, setCompletionQuote] = useState(null); // { quote, author } | null — shown after a save

  useEffect(() => {
    let cancelled = false;
    async function loadPlan() {
      try {
        const res = await storage.get("selected-plan-id", false);
        // Not validated against a plan list here — customPlans may not have
        // loaded yet, and an id for a since-deleted custom plan just means
        // activePlan resolves to undefined downstream, which is handled.
        if (!cancelled && res && res.value) setSelectedPlanId(res.value);
      } catch (e) {
        // no plan chosen yet
      } finally {
        if (!cancelled) setPlanLoaded(true);
      }
    }
    loadPlan();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadCustomPlans() {
      try {
        const res = await storage.get("custom-plans", false);
        if (!cancelled && res && res.value) setCustomPlans(JSON.parse(res.value));
      } catch (e) {
        // no custom plans built yet
      } finally {
        if (!cancelled) setCustomPlansLoaded(true);
      }
    }
    loadCustomPlans();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadSchedules() {
      try {
        const res = await storage.get("plan-schedules", false);
        if (!cancelled && res && res.value) setSchedules(JSON.parse(res.value));
      } catch (e) {
        // no schedules assigned yet
      } finally {
        if (!cancelled) setSchedulesLoaded(true);
      }
    }
    loadSchedules();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadRemoved() {
      try {
        const res = await storage.get("workout-removed-exercises", false);
        if (!cancelled && res && res.value) {
          const parsed = JSON.parse(res.value);
          // Migrate the old flat { slotName: [...] } shape (from before plans
          // existed) by treating it as belonging to the original plan.
          const isOldFlatShape = Object.values(parsed).some((v) => Array.isArray(v));
          setRemovedFromSlots(isOldFlatShape ? { original: parsed } : parsed);
        }
      } catch (e) {
        // none removed yet
      } finally {
        if (!cancelled) setRemovedLoaded(true);
      }
    }
    loadRemoved();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await storage.get("workout-history", false);
        if (!cancelled && res && res.value) setHistory(JSON.parse(res.value));
      } catch (e) {
        // no history saved yet
      } finally {
        if (!cancelled) setHistoryLoaded(true);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await storage.get("week-drafts", false);
        if (!cancelled && res && res.value) {
          const parsed = JSON.parse(res.value);
          const currentWeekKey = weekKeyFor(todayISO());
          const pruned = Object.fromEntries(Object.entries(parsed).filter(([, v]) => v.weekKey === currentWeekKey));
          setWeekDrafts(pruned);
          if (Object.keys(pruned).length !== Object.keys(parsed).length) {
            storage.set("week-drafts", JSON.stringify(pruned), false).catch(() => {});
          }
        }
      } catch (e) {
        // nothing logged yet this week
      } finally {
        if (!cancelled) setWeekDraftsLoaded(true);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const allPlans = useMemo(() => [...PLAN_LIBRARY, ...customPlans], [customPlans]);
  const allDaysByKey = useMemo(() => {
    const merged = { ...ALL_DAYS_BY_KEY };
    customPlans.forEach((p) => Object.assign(merged, p.days));
    return merged;
  }, [customPlans]);
  const activePlan = allPlans.find((p) => p.id === selectedPlanId) || null;
  const workoutData = activePlan ? activePlan.days : null;
  const activeSchedule = (selectedPlanId && schedules[selectedPlanId]) || null;

  // Which weekdays currently have a workout assigned, in calendar order —
  // drives the day tabs. Unassigned ("rest") weekdays don't get a tab, same
  // as how the original plan never showed a Thursday tab.
  const scheduledWeekdays = useMemo(
    () => (activeSchedule ? WEEKDAYS.filter((w) => activeSchedule[w] && workoutData?.[activeSchedule[w]]) : []),
    [activeSchedule, workoutData]
  );

  // Whole-plan exercise library — every slot name mapped to the union of
  // every exercise ever listed under it, across all days of the active
  // plan. Powers "add an existing exercise" independent of which day
  // you're viewing. Body parts group slot names by their prefix
  // (e.g. "Chest — Upper" -> "Chest"). Recomputed whenever the plan changes.
  const slotExerciseLibrary = useMemo(() => {
    const lib = {};
    if (!workoutData) return lib;
    Object.values(workoutData).forEach((dayObj) => {
      dayObj.slots.forEach((slot) => {
        if (!lib[slot.name]) lib[slot.name] = [];
        slot.exercises.forEach((ex) => {
          if (!lib[slot.name].some((e) => e.name === ex.name)) lib[slot.name].push(ex);
        });
      });
    });
    return lib;
  }, [workoutData]);

  const bodyParts = useMemo(() => {
    const parts = {};
    Object.keys(slotExerciseLibrary).forEach((slotName) => {
      const part = slotName.includes(" — ") ? slotName.split(" — ")[0] : slotName;
      if (!parts[part]) parts[part] = [];
      if (!parts[part].includes(slotName)) parts[part].push(slotName);
    });
    return parts;
  }, [slotExerciseLibrary]);

  function getSlot(d, slotName) {
    return workoutData[d].slots.find((s) => s.name === slotName);
  }
  function getExercise(d, slotName, exerciseName) {
    const slot = getSlot(d, slotName);
    return slot?.exercises.find((e) => e.name === exerciseName);
  }
  function getExerciseType(d, slotName, exerciseName) {
    return getExercise(d, slotName, exerciseName)?.type || "reps";
  }
  function getExerciseEquip(d, slotName, exerciseName) {
    return getExercise(d, slotName, exerciseName)?.equip || "Dumbbell";
  }
  function getExerciseFromLibrary(slotName, exerciseName) {
    return (slotExerciseLibrary[slotName] || []).find((e) => e.name === exerciseName);
  }

  // Takes the plan object directly (rather than looking it up by id) so a
  // just-built custom plan can be entered immediately, before the
  // customPlans state update that would make it findable via allPlans has
  // actually landed.
  function enterPlan(plan) {
    setSelectedPlanId(plan.id);
    storage.set("selected-plan-id", plan.id, false).catch(() => {});
    setOpenSlot(null);
    setDraft({});
    setCustomDraft({});
    setOpenCustomId(null);
    setAddedDraft({});
    setOpenAddedId(null);
    setAddFlow(null);
    setView("log");

    const existingSchedule = schedules[plan.id];
    if (existingSchedule) {
      // Already assigned before (this plan was used previously) — no need
      // to ask again, just jump back in on the right day.
      setDay(getScheduledDay(plan, existingSchedule));
      setScreen("app");
    } else {
      // First time on this plan — let the user assign it to real days of
      // the week (pre-filled with a sensible default) instead of assuming.
      setScheduleDraft(plan.defaultSchedule);
      setScreen("schedule");
    }
  }

  function choosePlan(planId) {
    const plan = allPlans.find((p) => p.id === planId);
    if (plan) enterPlan(plan);
  }

  function startBuildPlan() {
    setScreen("buildPlan");
  }

  function saveCustomPlan({ name, days }) {
    const id = `custom-${Date.now()}`;
    const daysObj = {};
    days.forEach((d, i) => {
      daysObj[`${id}::${i}`] = { label: d.label, tab: d.tab, subtitle: d.subtitle, slots: d.slots };
    });
    const dayKeys = Object.keys(daysObj);
    const defaultSchedule = {};
    WEEKDAYS.forEach((w, i) => { defaultSchedule[w] = dayKeys[i] || null; });
    const newPlan = {
      id, name,
      description: `A custom ${dayKeys.length}-day split you built.`,
      days: daysObj,
      defaultSchedule,
    };
    const updated = [...customPlans, newPlan];
    setCustomPlans(updated);
    storage.set("custom-plans", JSON.stringify(updated), false).catch(() => {});
    enterPlan(newPlan);
  }

  function continueWithCurrentPlan() {
    if (!activePlan) return;
    if (day == null || !activePlan.days[day]) setDay(getScheduledDay(activePlan, activeSchedule));
    setScreen("app");
  }

  function openScheduleEditor() {
    if (!activePlan) return;
    setScheduleDraft(activeSchedule || activePlan.defaultSchedule);
    setScreen("schedule");
  }

  function saveSchedule(newSchedule) {
    if (!activePlan) return;
    const updated = { ...schedules, [selectedPlanId]: newSchedule };
    setSchedules(updated);
    storage.set("plan-schedules", JSON.stringify(updated), false).catch(() => {});
    setDay(getScheduledDay(activePlan, newSchedule));
    setOpenSlot(null);
    setScreen("app");
  }

  function goToHome() {
    setScreen("home");
  }

  const isCustomBackfill = backfill?.dayKey === "__custom__";

  // Starts logging a past workout: either one of the active plan's own days
  // (dayKey is a real key from workoutData) or a session that doesn't match
  // the plan at all ("__custom__" — routed to BACKFILL_CUSTOM_KEY so its
  // draft state can never collide with a real day's, live or otherwise).
  function startBackfill(date, dayKey) {
    const isCustom = dayKey === "__custom__";
    const effectiveDay = isCustom ? BACKFILL_CUSTOM_KEY : dayKey;
    setOpenSlot(null);
    setOpenCustomId(null);
    setOpenAddedId(null);
    setAddFlow(null);
    setDraft({});
    setCustomDraft((prev) => ({ ...prev, [effectiveDay]: [] }));
    setAddedDraft((prev) => ({ ...prev, [effectiveDay]: [] }));
    setDay(effectiveDay);
    setBackfill({ date, dayKey });
    setView("log");
    setScreen("app");
  }

  // Leaves backfill mode without saving — used by both the header's Cancel
  // and the sticky bar's discard button while backfilling.
  function cancelBackfill() {
    setBackfill(null);
    setDraft({});
    setOpenCustomId(null);
    setOpenAddedId(null);
    setAddFlow(null);
    setDay(activePlan ? getScheduledDay(activePlan, activeSchedule) : null);
    setView("history");
  }

  const dayData = workoutData && day ? workoutData[day] : null;

  // Keeps a completed live day's draft showing (for reference/editing) through
  // the rest of that calendar week, and makes sure a long-lived session that
  // crosses into a new week doesn't keep showing last week's data. Runs once
  // per day per week — after that, in-memory edits are left alone.
  useEffect(() => {
    if (!weekDraftsLoaded || !dayData || !day || backfill || day === BACKFILL_CUSTOM_KEY) return;
    const currentWeekKey = weekKeyFor(todayISO());
    if (dayLiveWeekKeyRef.current[day] === currentWeekKey) return;
    const saved = weekDrafts[day];
    if (saved && saved.weekKey === currentWeekKey) {
      setDraft((prev) => ({ ...prev, ...saved.draft }));
      setCustomDraft((prev) => ({ ...prev, [day]: saved.customDraft || [] }));
      setAddedDraft((prev) => ({ ...prev, [day]: saved.addedDraft || [] }));
    } else {
      const daySlotNames = dayData.slots.map((s) => s.name);
      setDraft((prev) => {
        const next = { ...prev };
        daySlotNames.forEach((name) => { delete next[name]; });
        return next;
      });
      setCustomDraft((prev) => ({ ...prev, [day]: [] }));
      setAddedDraft((prev) => ({ ...prev, [day]: [] }));
    }
    dayLiveWeekKeyRef.current[day] = currentWeekKey;
  }, [day, dayData, weekDraftsLoaded, weekDrafts, backfill]);

  // Filters out exercises the user has removed from a slot's library, but
  // never returns an empty list (a slot always needs at least one option).
  function availableExercises(slotName, exercises) {
    const removed = (removedFromSlots[selectedPlanId] || {})[slotName] || [];
    const filtered = exercises.filter((ex) => !removed.includes(ex.name));
    return filtered.length > 0 ? filtered : exercises;
  }

  // Permanently removes one exercise from a slot's option list (persisted,
  // scoped to the active plan). onReset lets the caller pick what to do if
  // the removed exercise was the one currently selected in whichever card
  // called this.
  async function removeExerciseFromLibrary(slotName, exerciseName, allExercises, onReset) {
    const planRemoved = { ...(removedFromSlots[selectedPlanId] || {}), [slotName]: [...((removedFromSlots[selectedPlanId] || {})[slotName] || []), exerciseName] };
    const updated = { ...removedFromSlots, [selectedPlanId]: planRemoved };
    setRemovedFromSlots(updated);
    try {
      await storage.set("workout-removed-exercises", JSON.stringify(updated), false);
    } catch (e) {
      // best-effort; UI already reflects the removal for this session
    }
    const remaining = allExercises.filter((ex) => !planRemoved[slotName].includes(ex.name));
    if (remaining.length > 0 && onReset) onReset(remaining[0].name);
  }

  function slotDraftOf(slotName) {
    const avail = availableExercises(slotName, getSlot(day, slotName).exercises);
    return draft[slotName] || { exercise: avail[0].name, notes: "", attachment: "", sets: [emptyRow()] };
  }

  function setExercise(slotName, exerciseName) {
    setDraft((prev) => {
      const existing = prev[slotName] || { notes: "", attachment: "", sets: [emptyRow()] };
      return { ...prev, [slotName]: { ...existing, exercise: exerciseName } };
    });
  }

  function setNotes(slotName, notes) {
    setDraft((prev) => {
      const existing = prev[slotName] || slotDraftOf(slotName);
      return { ...prev, [slotName]: { ...existing, notes } };
    });
  }

  function setAttachment(slotName, attachment) {
    setDraft((prev) => {
      const existing = prev[slotName] || slotDraftOf(slotName);
      return { ...prev, [slotName]: { ...existing, attachment } };
    });
  }

  function updateRow(slotName, index, field, value) {
    setDraft((prev) => {
      const existing = prev[slotName] || slotDraftOf(slotName);
      const sets = existing.sets.map((s, i) => (i === index ? { ...s, [field]: value } : s));
      return { ...prev, [slotName]: { ...existing, sets } };
    });
  }

  function addRow(slotName) {
    setDraft((prev) => {
      const existing = prev[slotName] || slotDraftOf(slotName);
      return { ...prev, [slotName]: { ...existing, sets: [...existing.sets, emptyRow()] } };
    });
  }

  function removeRow(slotName, index) {
    setDraft((prev) => {
      const existing = prev[slotName];
      if (!existing) return prev;
      const sets = existing.sets.filter((_, i) => i !== index);
      return { ...prev, [slotName]: { ...existing, sets: sets.length ? sets : [emptyRow()] } };
    });
  }

  // Optional superset/drop-set attached to one specific set. Always
  // manually entered — separate exercise, weight, and reps.
  function addExtra(slotName, index) {
    setDraft((prev) => {
      const existing = prev[slotName] || slotDraftOf(slotName);
      const sets = existing.sets.map((s, i) => (i === index ? { ...s, extra: emptyExtra() } : s));
      return { ...prev, [slotName]: { ...existing, sets } };
    });
  }
  function updateExtra(slotName, index, field, value) {
    setDraft((prev) => {
      const existing = prev[slotName] || slotDraftOf(slotName);
      const sets = existing.sets.map((s, i) => (i === index ? { ...s, extra: { ...s.extra, [field]: value } } : s));
      return { ...prev, [slotName]: { ...existing, sets } };
    });
  }
  function removeExtra(slotName, index) {
    setDraft((prev) => {
      const existing = prev[slotName];
      if (!existing) return prev;
      const sets = existing.sets.map((s, i) => (i === index ? { ...s, extra: null } : s));
      return { ...prev, [slotName]: { ...existing, sets } };
    });
  }

  // Manual/custom exercises — free-typed name, plain weight+rep inputs, not
  // tied to any predefined muscle slot. Scoped per day like everything else.
  const customList = customDraft[day] || [];

  function addCustomExercise() {
    const id = `custom-${Date.now()}`;
    setCustomDraft((prev) => ({ ...prev, [day]: [...(prev[day] || []), { id, exercise: "", notes: "", sets: [emptyRow()] }] }));
    setOpenCustomId(id);
  }

  function updateCustomField(id, field, value) {
    setCustomDraft((prev) => ({ ...prev, [day]: (prev[day] || []).map((e) => (e.id === id ? { ...e, [field]: value } : e)) }));
  }

  function updateCustomRow(id, index, field, value) {
    setCustomDraft((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((e) => (e.id === id ? { ...e, sets: e.sets.map((s, i) => (i === index ? { ...s, [field]: value } : s)) } : e)),
    }));
  }

  function addCustomRow(id) {
    setCustomDraft((prev) => ({ ...prev, [day]: (prev[day] || []).map((e) => (e.id === id ? { ...e, sets: [...e.sets, emptyRow()] } : e)) }));
  }

  function removeCustomRow(id, index) {
    setCustomDraft((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((e) => {
        if (e.id !== id) return e;
        const sets = e.sets.filter((_, i) => i !== index);
        return { ...e, sets: sets.length ? sets : [emptyRow()] };
      }),
    }));
  }

  function addCustomExtra(id, index) {
    setCustomDraft((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((e) => (e.id === id ? { ...e, sets: e.sets.map((s, i) => (i === index ? { ...s, extra: emptyExtra() } : s)) } : e)),
    }));
  }
  function updateCustomExtra(id, index, field, value) {
    setCustomDraft((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((e) => (e.id === id ? { ...e, sets: e.sets.map((s, i) => (i === index ? { ...s, extra: { ...s.extra, [field]: value } } : s)) } : e)),
    }));
  }
  function removeCustomExtra(id, index) {
    setCustomDraft((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((e) => (e.id === id ? { ...e, sets: e.sets.map((s, i) => (i === index ? { ...s, extra: null } : s)) } : e)),
    }));
  }

  function removeCustomExercise(id) {
    setCustomDraft((prev) => ({ ...prev, [day]: (prev[day] || []).filter((e) => e.id !== id) }));
    if (openCustomId === id) setOpenCustomId(null);
  }

  const customSuggestions = useMemo(() => {
    const set = new Set();
    history.forEach((s) => (s.blocks || []).forEach((b) => { if (b.slot === "Custom" && b.exercise) set.add(b.exercise); }));
    return Array.from(set).sort();
  }, [history]);

  // "Added from plan" exercises — pulled from the whole-plan library via the
  // guided flow, but structured just like a normal slot (weight/rep
  // dropdowns, muscle diagram, last-time, rep-range hint). Scoped per day.
  const addedList = addedDraft[day] || [];

  function addAddedExercise(slotName, exerciseName) {
    const id = `added-${Date.now()}`;
    setAddedDraft((prev) => ({ ...prev, [day]: [...(prev[day] || []), { id, slotName, exercise: exerciseName, notes: "", attachment: "", sets: [emptyRow()] }] }));
    setOpenAddedId(id);
  }
  function setAddedExercise(id, exerciseName) {
    setAddedDraft((prev) => ({ ...prev, [day]: (prev[day] || []).map((e) => (e.id === id ? { ...e, exercise: exerciseName } : e)) }));
  }
  function updateAddedField(id, field, value) {
    setAddedDraft((prev) => ({ ...prev, [day]: (prev[day] || []).map((e) => (e.id === id ? { ...e, [field]: value } : e)) }));
  }
  function updateAddedRow(id, index, field, value) {
    setAddedDraft((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((e) => (e.id === id ? { ...e, sets: e.sets.map((s, i) => (i === index ? { ...s, [field]: value } : s)) } : e)),
    }));
  }
  function addAddedRow(id) {
    setAddedDraft((prev) => ({ ...prev, [day]: (prev[day] || []).map((e) => (e.id === id ? { ...e, sets: [...e.sets, emptyRow()] } : e)) }));
  }
  function removeAddedRow(id, index) {
    setAddedDraft((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((e) => {
        if (e.id !== id) return e;
        const sets = e.sets.filter((_, i) => i !== index);
        return { ...e, sets: sets.length ? sets : [emptyRow()] };
      }),
    }));
  }
  function addAddedExtra(id, index) {
    setAddedDraft((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((e) => (e.id === id ? { ...e, sets: e.sets.map((s, i) => (i === index ? { ...s, extra: emptyExtra() } : s)) } : e)),
    }));
  }
  function updateAddedExtra(id, index, field, value) {
    setAddedDraft((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((e) => (e.id === id ? { ...e, sets: e.sets.map((s, i) => (i === index ? { ...s, extra: { ...s.extra, [field]: value } } : s)) } : e)),
    }));
  }
  function removeAddedExtra(id, index) {
    setAddedDraft((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((e) => (e.id === id ? { ...e, sets: e.sets.map((s, i) => (i === index ? { ...s, extra: null } : s)) } : e)),
    }));
  }
  function removeAddedExercise(id) {
    setAddedDraft((prev) => ({ ...prev, [day]: (prev[day] || []).filter((e) => e.id !== id) }));
    if (openAddedId === id) setOpenAddedId(null);
  }

  // Guided "add an exercise" flow: choose existing-vs-new, then (for
  // existing) body part -> specific part -> exercise, pulled from the
  // whole-plan library. Single-option parts are skipped automatically.
  function startAddFlow() { setAddFlow({ step: "choose" }); }
  function cancelAddFlow() { setAddFlow(null); }
  function addFlowBack() {
    setAddFlow((prev) => {
      if (!prev) return null;
      if (prev.step === "body") return { step: "choose" };
      if (prev.step === "part") return { step: "body" };
      if (prev.step === "exercise") return bodyParts[prev.bodyPart].length > 1 ? { step: "part", bodyPart: prev.bodyPart } : { step: "body" };
      return null;
    });
  }
  function chooseNew() { addCustomExercise(); setAddFlow(null); }
  function chooseExisting() { setAddFlow({ step: "body" }); }
  function chooseBodyPart(part) {
    const parts = bodyParts[part];
    if (parts.length === 1) setAddFlow({ step: "exercise", bodyPart: part, slotName: parts[0] });
    else setAddFlow({ step: "part", bodyPart: part });
  }
  function chooseSlotName(slotName) { setAddFlow((prev) => ({ ...prev, step: "exercise", slotName })); }
  function chooseLibraryExercise(slotName, exerciseName) {
    addAddedExercise(slotName, exerciseName);
    setAddFlow(null);
  }

  // Optional superset/drop-set only counts once it has a name, weight, and reps.
  function extractExtra(row) {
    const ex = row.extra;
    if (ex && ex.exercise && ex.exercise.trim() !== "" && ex.weight !== "" && ex.weight != null && ex.value !== "" && ex.value != null) {
      return { type: ex.type || "superset", exercise: ex.exercise.trim(), weight: Number(ex.weight), value: Number(ex.value) };
    }
    return undefined;
  }

  // Group current draft into save-ready blocks: one block per slot, holding
  // the exercise, its shared note, and every filled set. Manually-added
  // custom exercises are merged in under slot "Custom".
  const sessionBlocks = useMemo(() => {
    const out = [];
    Object.entries(draft).forEach(([slotName, slotDraft]) => {
      if (!slotDraft) return;
      const type = getExerciseType(day, slotName, slotDraft.exercise);
      const filledSets = slotDraft.sets
        .filter((s) => (type === "time" ? s.value !== "" && s.value != null : s.weight !== "" && s.weight != null && s.value !== "" && s.value != null))
        .map((s) => {
          const base = { weight: s.weight === "" || s.weight == null ? 0 : Number(s.weight), value: Number(s.value) };
          const extra = extractExtra(s);
          return extra ? { ...base, extra } : base;
        });
      if (filledSets.length > 0) {
        out.push({ slot: slotName, exercise: slotDraft.exercise, type, notes: slotDraft.notes || "", attachment: slotDraft.attachment || "", sets: filledSets });
      }
    });
    (customDraft[day] || []).forEach((entry) => {
      const name = (entry.exercise || "").trim();
      if (!name) return;
      const filledSets = entry.sets
        .filter((s) => s.weight !== "" && s.weight != null && s.value !== "" && s.value != null)
        .map((s) => {
          const base = { weight: Number(s.weight), value: Number(s.value) };
          const extra = extractExtra(s);
          return extra ? { ...base, extra } : base;
        });
      if (filledSets.length > 0) {
        out.push({ slot: "Custom", exercise: name, type: "reps", notes: entry.notes || "", sets: filledSets, custom: true });
      }
    });
    (addedDraft[day] || []).forEach((entry) => {
      const exObj = getExerciseFromLibrary(entry.slotName, entry.exercise);
      const type = exObj?.type || "reps";
      const filledSets = entry.sets
        .filter((s) => (type === "time" ? s.value !== "" && s.value != null : s.weight !== "" && s.weight != null && s.value !== "" && s.value != null))
        .map((s) => {
          const base = { weight: s.weight === "" || s.weight == null ? 0 : Number(s.weight), value: Number(s.value) };
          const extra = extractExtra(s);
          return extra ? { ...base, extra } : base;
        });
      if (filledSets.length > 0) {
        out.push({ slot: entry.slotName, exercise: entry.exercise, type, notes: entry.notes || "", attachment: entry.attachment || "", sets: filledSets, addedFromPlan: true });
      }
    });
    return out;
  }, [draft, day, customDraft, addedDraft]);

  const sessionVolume = useMemo(
    () =>
      sessionBlocks.reduce((sum, b) => {
        const mainVol = b.type === "reps" ? b.sets.reduce((s, st) => s + st.weight * st.value, 0) : 0;
        const extraVol = b.sets.reduce((s, st) => s + (st.extra ? st.extra.weight * st.extra.value : 0), 0);
        return sum + mainVol + extraVol;
      }, 0),
    [sessionBlocks]
  );
  const sessionHoldTime = useMemo(
    () => sessionBlocks.filter((b) => b.type === "time").reduce((sum, b) => sum + b.sets.reduce((s, st) => s + st.value, 0), 0),
    [sessionBlocks]
  );
  const totalSets = sessionBlocks.reduce((sum, b) => sum + b.sets.length, 0);

  function countForSlot(slotName) {
    return sessionBlocks.find((b) => b.slot === slotName)?.sets.length || 0;
  }

  // Live (non-backfill) session for the current week already showing in the
  // Log tab, if any — used to decide whether Save should update that entry
  // instead of creating a duplicate, and what Discard should revert to.
  const currentWeekEntry = !backfill && day ? weekDrafts[day] : null;
  const hasCurrentWeekEntry = !!(currentWeekEntry && currentWeekEntry.weekKey === weekKeyFor(todayISO()));

  function discardSession() {
    if (backfill) {
      cancelBackfill();
      return;
    }
    const restoreToSaved = hasCurrentWeekEntry;
    setDraft((prev) => {
      const next = { ...prev };
      (dayData?.slots || []).forEach((s) => { delete next[s.name]; });
      return restoreToSaved ? { ...next, ...currentWeekEntry.draft } : next;
    });
    setCustomDraft((prev) => ({ ...prev, [day]: restoreToSaved ? (currentWeekEntry.customDraft || []) : [] }));
    setOpenCustomId(null);
    setAddedDraft((prev) => ({ ...prev, [day]: restoreToSaved ? (currentWeekEntry.addedDraft || []) : [] }));
    setOpenAddedId(null);
    setAddFlow(null);
  }

  async function saveWorkout() {
    if (sessionBlocks.length === 0) return;
    setSaving(true);
    setStorageError(null);
    const sessionDate = backfill ? backfill.date : todayISO();
    const sessionDay = backfill ? (isCustomBackfill ? "Custom Workout" : backfill.dayKey) : day;
    const isUpdatingThisWeek = hasCurrentWeekEntry && history.some((h) => h.id === currentWeekEntry.sessionId);
    const sessionId = isUpdatingThisWeek ? currentWeekEntry.sessionId : `${Date.now()}`;
    const session = { id: sessionId, date: sessionDate, day: sessionDay, blocks: sessionBlocks };
    try {
      const updated = isUpdatingThisWeek ? history.map((h) => (h.id === sessionId ? session : h)) : [...history, session];
      const res = await storage.set("workout-history", JSON.stringify(updated), false);
      if (res) {
        setHistory(updated);
        if (backfill) {
          setDraft({});
          setCustomDraft((prev) => ({ ...prev, [day]: [] }));
          setOpenCustomId(null);
          setAddedDraft((prev) => ({ ...prev, [day]: [] }));
          setOpenAddedId(null);
          setBackfill(null);
          setDay(activePlan ? getScheduledDay(activePlan, activeSchedule) : null);
          setView("history");
        } else {
          // Keep the draft showing for the rest of the week — record what was
          // saved so it survives a reload, and so re-saving later this week
          // updates this entry instead of duplicating it.
          const daySlotNames = new Set((dayData?.slots || []).map((s) => s.name));
          const scopedDraft = Object.fromEntries(Object.entries(draft).filter(([k]) => daySlotNames.has(k)));
          const updatedWeekDrafts = {
            ...weekDrafts,
            [day]: { weekKey: weekKeyFor(sessionDate), sessionId, draft: scopedDraft, customDraft: customList, addedDraft: addedList },
          };
          setWeekDrafts(updatedWeekDrafts);
          storage.set("week-drafts", JSON.stringify(updatedWeekDrafts), false).catch(() => {});
          dayLiveWeekKeyRef.current[day] = weekKeyFor(sessionDate);
        }
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1800);
        setCompletionQuote(COMPLETION_QUOTES[Math.floor(Math.random() * COMPLETION_QUOTES.length)]);
      } else {
        setStorageError("Couldn't save — try again.");
      }
    } catch (e) {
      setStorageError("Couldn't save — try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSession(id) {
    const updated = history.filter((s) => s.id !== id);
    try {
      const res = await storage.set("workout-history", JSON.stringify(updated), false);
      if (res) {
        setHistory(updated);
        const linkedDayKey = Object.keys(weekDrafts).find((k) => weekDrafts[k].sessionId === id);
        if (linkedDayKey) {
          const updatedWeekDrafts = { ...weekDrafts };
          delete updatedWeekDrafts[linkedDayKey];
          setWeekDrafts(updatedWeekDrafts);
          storage.set("week-drafts", JSON.stringify(updatedWeekDrafts), false).catch(() => {});
          if (linkedDayKey === day) {
            const linkedSlotNames = (workoutData?.[linkedDayKey]?.slots || []).map((s) => s.name);
            setDraft((prev) => {
              const next = { ...prev };
              linkedSlotNames.forEach((name) => { delete next[name]; });
              return next;
            });
            setCustomDraft((prev) => ({ ...prev, [linkedDayKey]: [] }));
            setAddedDraft((prev) => ({ ...prev, [linkedDayKey]: [] }));
            delete dayLiveWeekKeyRef.current[linkedDayKey];
          }
        }
      }
    } catch (e) {
      setStorageError("Couldn't delete — try again.");
    }
  }

  function fmtSetsList(block) {
    return block.sets
      .map((s) => {
        const mainStr = block.type === "time" ? (s.weight > 0 ? `+${s.weight}×${s.value}s` : `${s.value}s`) : `${s.weight}×${s.value}`;
        if (s.extra) {
          const tag = s.extra.type === "superset" ? "SS" : "DS";
          return `${mainStr} [${tag}: ${s.extra.exercise} ${s.extra.weight}×${s.extra.value}]`;
        }
        return mainStr;
      })
      .join(", ");
  }

  // Best set = highest weight wins; among equal weights, highest reps/time wins.
  function findBestSet(sets) {
    if (!sets || sets.length === 0) return null;
    return sets.reduce((best, s) => {
      if (!best) return s;
      if (s.weight > best.weight) return s;
      if (s.weight === best.weight && s.value > best.value) return s;
      return best;
    }, null);
  }

  // Scans saved history (most recent first) for the last time this exact
  // exercise was logged, and returns its single best set.
  function getPreviousBest(exerciseName) {
    for (let i = history.length - 1; i >= 0; i--) {
      const blocks = history[i].blocks || [];
      const block = blocks.find((b) => b.exercise === exerciseName);
      if (block) {
        const best = findBestSet(block.sets);
        if (best) return { date: history[i].date, weight: best.weight, value: best.value, type: block.type };
      }
    }
    return null;
  }

  // Same as getPreviousBest, but scoped to only "Custom" blocks — so this
  // only fires when the typed name matches something you've actually
  // logged as a custom exercise before (i.e. it's in the suggestion list).
  function getPreviousBestCustom(exerciseName) {
    for (let i = history.length - 1; i >= 0; i--) {
      const blocks = history[i].blocks || [];
      const block = blocks.find((b) => b.slot === "Custom" && b.exercise === exerciseName);
      if (block) {
        const best = findBestSet(block.sets);
        if (best) return { date: history[i].date, weight: best.weight, value: best.value, type: block.type };
      }
    }
    return null;
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", color: "var(--text)", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Metal+Mania&family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
        :root {
          --bg: #101113;
          --surface: #1A1B20;
          --surface-2: #222329;
          --border: #2D2E35;
          --text: #EEEAE5;
          --text-muted: #8C8F97;
          --accent: #D6293B;
          --accent-dim: rgba(214,41,59,0.18);
          --on-accent: #FFFFFF;
          --success: #6FCF97;
          --danger: #FF5C5C;
          --time: #9FB0C0;
          --time-dim: rgba(159,176,192,0.16);
          --muscle-secondary: #E3A857;
        }
        .brand { font-family: 'Metal Mania', cursive; letter-spacing: 0.02em; }
        .display { font-family: 'Oswald', sans-serif; font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase; }
        .tabular { font-variant-numeric: tabular-nums; }
        select:focus, input:focus, textarea:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
        textarea { font-family: inherit; resize: none; }
        .flash-pop { animation: pop 0.4s ease; }
        @keyframes pop { 0% { transform: scale(1); } 40% { transform: scale(1.06); } 100% { transform: scale(1); } }
      `}</style>

      {screen === "home" && (
        <HomeScreen plans={allPlans} activePlanId={selectedPlanId} onChoosePlan={choosePlan} onContinue={continueWithCurrentPlan} onStartBuild={startBuildPlan} />
      )}

      {screen === "buildPlan" && (
        <BuildPlanScreen existingPlans={allPlans} onSave={saveCustomPlan} onCancel={goToHome} />
      )}

      {screen === "schedule" && activePlan && scheduleDraft && (
        <ScheduleScreen plan={activePlan} schedule={scheduleDraft} onSave={saveSchedule} onBack={goToHome} />
      )}

      {screen === "addPastWorkout" && activePlan && (
        <AddPastWorkoutSetup plan={activePlan} onStart={startBackfill} onBack={() => setScreen("app")} />
      )}

      {screen === "app" && (
      <>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "var(--bg)", borderBottom: "1px solid var(--border)", paddingTop: "env(safe-area-inset-top)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Dumbbell size={20} color="var(--accent)" />
            <span className="brand" style={{ fontSize: 26, lineHeight: 1 }}>IRON LOG</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={goToHome} title="Change plan" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}>
              <HomeIcon size={15} color="var(--text-muted)" />
            </button>
            <button onClick={openScheduleEditor} title="Assign days of the week" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}>
              <CalendarIcon size={15} color="var(--text-muted)" />
            </button>
            <div style={{ display: "flex", gap: 4, background: "var(--surface)", padding: 3, borderRadius: 10, border: "1px solid var(--border)" }}>
              <button onClick={() => setView("log")} style={{ padding: "6px 12px", borderRadius: 7, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", background: view === "log" ? "var(--accent)" : "transparent", color: view === "log" ? "var(--on-accent)" : "var(--text-muted)" }}>
                Log
              </button>
              <button onClick={() => setView("history")} style={{ padding: "6px 12px", borderRadius: 7, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, background: view === "history" ? "var(--accent)" : "transparent", color: view === "history" ? "var(--on-accent)" : "var(--text-muted)" }}>
                <HistoryIcon size={13} /> History
              </button>
            </div>
          </div>
        </div>

        {view === "log" && (
          <>
            {backfill ? (
              <div style={{ padding: "0 16px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 14px", borderRadius: 10, background: "var(--accent-dim)", border: "1px solid var(--accent)" }}>
                  <div>
                    <div className="display" style={{ fontSize: 11, color: "var(--accent)" }}>Logging Past Workout</div>
                    <div style={{ fontSize: 12.5, color: "var(--text)", marginTop: 2 }}>{fmtDate(backfill.date)}</div>
                  </div>
                  <button onClick={cancelBackfill} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 6, padding: "0 16px 12px", overflowX: "auto" }}>
                {scheduledWeekdays.map((w) => {
                  const assignedDay = activeSchedule[w];
                  const isActive = assignedDay === day;
                  return (
                    <button key={w} onClick={() => { setDay(assignedDay); setOpenSlot(null); }} style={{ flex: "0 0 auto", padding: "8px 14px", borderRadius: 10, cursor: "pointer", border: isActive ? "1px solid var(--accent)" : "1px solid var(--border)", background: isActive ? "var(--accent-dim)" : "var(--surface)", color: isActive ? "var(--text)" : "var(--text-muted)" }}>
                      <div className="display" style={{ fontSize: 13 }}>{w.slice(0, 3)}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{workoutData[assignedDay].label}</div>
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 16px 12px" }}>
              <div className="display" style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.08em" }}>
                {isCustomBackfill ? "Custom Workout" : `${dayData.label} · ${dayData.subtitle}`}
              </div>
              <div key={`${sessionVolume}-${sessionHoldTime}`} className={sessionBlocks.length > 0 ? "flash-pop" : ""} style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                {sessionHoldTime > 0 && (
                  <span style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span className="display tabular" style={{ fontSize: 16, color: "var(--time)" }}>{sessionHoldTime}</span>
                    <span style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase" }}>s hold</span>
                  </span>
                )}
                <span style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                  <span className="display tabular" style={{ fontSize: 22, color: "var(--accent)" }}>{sessionVolume.toLocaleString()}</span>
                  <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>lb vol</span>
                </span>
              </div>
            </div>

            {!backfill && hasCurrentWeekEntry && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 16px 12px", fontSize: 11, color: "var(--text-muted)" }}>
                <TrendingUp size={11} color="var(--accent)" />
                Logged this week — edits will update your saved entry
              </div>
            )}
          </>
        )}
      </div>

      {/* Body */}
      {view === "log" ? (
        <div style={{ padding: "10px 16px 120px" }}>
          {!isCustomBackfill && dayData.slots.map((slot) => {
            const isOpen = openSlot === slot.name;
            const sd = slotDraftOf(slot.name);
            const availableEx = availableExercises(slot.name, slot.exercises);
            const type = getExerciseType(day, slot.name, sd.exercise);
            const equip = getExerciseEquip(day, slot.name, sd.exercise);
            const count = countForSlot(slot.name);
            const prevBest = getPreviousBest(sd.exercise);
            const repRange = getRepRange(sd.exercise);
            const shouldBumpWeight = prevBest && prevBest.type === "reps" && repRange && prevBest.value >= repRange[1];
            return (
              <div key={slot.name} style={{ marginBottom: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                <button onClick={() => setOpenSlot(isOpen ? null : slot.name)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 14px", background: "transparent", border: "none", cursor: "pointer", color: "var(--text)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{slot.name}</span>
                    {count > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 700, background: type === "time" ? "var(--time-dim)" : "var(--accent-dim)", color: type === "time" ? "var(--time)" : "var(--accent)", borderRadius: 999, padding: "1px 8px" }}>
                        {count} set{count > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <ChevronDown size={16} color="var(--text-muted)" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                </button>

                {isOpen && (
                  <div style={{ padding: "0 14px 14px" }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                      <select value={sd.exercise} onChange={(e) => setExercise(slot.name, e.target.value)} style={{ flex: 1, minWidth: 0, padding: "9px 10px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13 }}>
                        {availableEx.map((ex) => (
                          <option key={ex.name} value={ex.name}>{ex.name}{ex.type === "time" ? " (timed)" : ""}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeExerciseFromLibrary(slot.name, sd.exercise, slot.exercises, (name) => setExercise(slot.name, name))}
                        disabled={availableEx.length <= 1}
                        title="Remove this exercise from the plan"
                        style={{ flexShrink: 0, width: 38, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", cursor: availableEx.length <= 1 ? "default" : "pointer", opacity: availableEx.length <= 1 ? 0.3 : 1 }}
                      >
                        <Trash2 size={14} color="var(--text-muted)" />
                      </button>
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginBottom: 8 }}>{equip}</div>

                    {equip === "Cable" && (
                      <select
                        value={sd.attachment || ""}
                        onChange={(e) => setAttachment(slot.name, e.target.value)}
                        style={{ width: "100%", padding: "8px 10px", marginBottom: 10, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: sd.attachment ? "var(--text)" : "var(--text-muted)", fontSize: 12.5 }}
                      >
                        <option value="">Attachment (optional)</option>
                        {CABLE_ATTACHMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                    )}

                    {(() => {
                      const muscleStatus = getMuscleStatus(sd.exercise);
                      const detail = MUSCLE_MAP[sd.exercise]?.detail;
                      return Object.keys(muscleStatus).length > 0 ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, padding: "8px 10px", background: "var(--surface-2)", borderRadius: 8 }}>
                          <BodyFront status={muscleStatus} detail={detail} />
                          <BodyBack status={muscleStatus} detail={detail} />
                          <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 10, color: "var(--text-muted)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--accent)", display: "inline-block", flexShrink: 0 }} /> Primary
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--muscle-secondary)", display: "inline-block", flexShrink: 0 }} /> Secondary
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {prevBest && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11.5, color: "var(--text-muted)", marginBottom: 10, padding: "7px 9px", background: "var(--surface-2)", borderRadius: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <HistoryIcon size={11} style={{ flexShrink: 0 }} />
                          <span>
                            Last: <span className="tabular" style={{ color: "var(--text)", fontWeight: 600 }}>
                              {prevBest.type === "time"
                                ? (prevBest.weight > 0 ? `+${prevBest.weight} lb × ${prevBest.value}s` : `${prevBest.value}s`)
                                : `${prevBest.weight} lb × ${prevBest.value}`}
                            </span> · {fmtDate(prevBest.date)}
                          </span>
                        </div>
                        {shouldBumpWeight && (
                          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--accent)", fontWeight: 600, paddingLeft: 17 }}>
                            <TrendingUp size={11} style={{ flexShrink: 0 }} />
                            <span>Hit top of the {repRange[0]}–{repRange[1]} range — bump the weight this time</span>
                          </div>
                        )}
                      </div>
                    )}

                    <textarea
                      rows={2}
                      placeholder="Notes for this exercise (form cues, adjustments...)"
                      value={sd.notes || ""}
                      onChange={(e) => setNotes(slot.name, e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", marginBottom: 10, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5, lineHeight: 1.4 }}
                    />

                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {sd.sets.map((row, i) => (
                        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <span className="tabular" style={{ fontSize: 11, color: "var(--text-muted)", width: 34, flexShrink: 0 }}>Set {i + 1}</span>
                            <input
                              type="number" inputMode="decimal"
                              placeholder={type === "time" ? "Wt (opt)" : "Weight"}
                              value={row.weight}
                              onChange={(e) => updateRow(slot.name, i, "weight", e.target.value)}
                              style={{ flex: 1, minWidth: 0, padding: "9px 6px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13 }}
                            />

                            {type === "time" ? (
                              <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                                <input
                                  type="number" inputMode="numeric"
                                  placeholder="Sec"
                                  value={row.value}
                                  onChange={(e) => updateRow(slot.name, i, "value", e.target.value)}
                                  style={{ width: "100%", padding: "9px 8px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13 }}
                                />
                                <Timer size={12} color="var(--time)" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                              </div>
                            ) : (
                              <select
                                value={row.value}
                                onChange={(e) => updateRow(slot.name, i, "value", e.target.value)}
                                style={{ flex: 1, minWidth: 0, padding: "9px 6px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: row.value === "" ? "var(--text-muted)" : "var(--text)", fontSize: 13 }}
                              >
                                <option value="">Reps</option>
                                {REPS_OPTIONS.map((r) => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            )}

                            <button onClick={() => removeRow(slot.name, i)} disabled={sd.sets.length === 1} style={{ background: "none", border: "none", cursor: sd.sets.length === 1 ? "default" : "pointer", padding: 4, opacity: sd.sets.length === 1 ? 0.25 : 1, flexShrink: 0 }}>
                              <X size={14} color="var(--text-muted)" />
                            </button>
                          </div>

                          {row.extra ? (
                            <div style={{ marginLeft: 41, padding: "8px 9px", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", gap: 4 }}>
                                  <button onClick={() => { updateExtra(slot.name, i, "type", "superset"); if (row.extra.type === "dropset") updateExtra(slot.name, i, "exercise", ""); }} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer", border: row.extra.type === "superset" ? "1px solid var(--accent)" : "1px solid var(--border)", background: row.extra.type === "superset" ? "var(--accent-dim)" : "transparent", color: row.extra.type === "superset" ? "var(--accent)" : "var(--text-muted)" }}>Superset</button>
                                  <button onClick={() => { updateExtra(slot.name, i, "type", "dropset"); updateExtra(slot.name, i, "exercise", sd.exercise); }} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer", border: row.extra.type === "dropset" ? "1px solid var(--accent)" : "1px solid var(--border)", background: row.extra.type === "dropset" ? "var(--accent-dim)" : "transparent", color: row.extra.type === "dropset" ? "var(--accent)" : "var(--text-muted)" }}>Drop Set</button>
                                </div>
                                <button onClick={() => removeExtra(slot.name, i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 3 }}>
                                  <X size={12} color="var(--text-muted)" />
                                </button>
                              </div>
                              {row.extra.type === "dropset" ? (
                                <div style={{ width: "100%", padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 12.5 }}>
                                  {sd.exercise || "Exercise name"}
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  placeholder="Exercise name"
                                  value={row.extra.exercise}
                                  onChange={(e) => updateExtra(slot.name, i, "exercise", e.target.value)}
                                  style={{ width: "100%", padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5 }}
                                />
                              )}
                              <div style={{ display: "flex", gap: 6 }}>
                                <input
                                  type="number" inputMode="decimal"
                                  placeholder="Weight"
                                  value={row.extra.weight}
                                  onChange={(e) => updateExtra(slot.name, i, "weight", e.target.value)}
                                  style={{ flex: 1, minWidth: 0, padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5 }}
                                />
                                <select
                                  value={row.extra.value}
                                  onChange={(e) => updateExtra(slot.name, i, "value", e.target.value)}
                                  style={{ flex: 1, minWidth: 0, padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: row.extra.value === "" ? "var(--text-muted)" : "var(--text)", fontSize: 12.5 }}
                                >
                                  <option value="">Reps</option>
                                  {REPS_OPTIONS.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => addExtra(slot.name, i)} style={{ marginLeft: 41, alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 11 }}>
                              <Layers size={11} /> Superset / drop set
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button onClick={() => addRow(slot.name)} style={{ marginTop: 9, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", borderRadius: 8, background: "var(--surface-2)", border: "1px dashed var(--border)", cursor: "pointer", color: "var(--text-muted)", fontSize: 12.5, fontWeight: 600 }}>
                      <Plus size={14} /> Add Set
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Exercises added from the plan's existing library */}
          {!isCustomBackfill && addedList.length > 0 && (
            <div className="display" style={{ fontSize: 11, color: "var(--text-muted)", margin: "14px 0 8px" }}>Added From Plan</div>
          )}

          {!isCustomBackfill && addedList.map((entry) => {
            const isOpen = openAddedId === entry.id;
            const libraryEx = availableExercises(entry.slotName, slotExerciseLibrary[entry.slotName] || []);
            const exObj = getExerciseFromLibrary(entry.slotName, entry.exercise);
            const type = exObj?.type || "reps";
            const equip = exObj?.equip || "Dumbbell";
            const filledCount = entry.sets.filter((s) => (type === "time" ? s.value !== "" : s.weight !== "" && s.value !== "")).length;
            const prevBest = getPreviousBest(entry.exercise);
            const repRange = getRepRange(entry.exercise);
            const shouldBumpWeight = prevBest && prevBest.type === "reps" && repRange && prevBest.value >= repRange[1];
            const muscleStatus = getMuscleStatus(entry.exercise);
            const detail = MUSCLE_MAP[entry.exercise]?.detail;
            return (
              <div key={entry.id} style={{ marginBottom: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px 6px 14px" }}>
                  <button onClick={() => setOpenAddedId(isOpen ? null : entry.id)} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: "7px 0", display: "flex", flexDirection: "column", gap: 1, color: "var(--text)" }}>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{entry.slotName}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.exercise}</span>
                      {filledCount > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 700, background: "var(--accent-dim)", color: "var(--accent)", borderRadius: 999, padding: "1px 8px", flexShrink: 0 }}>
                          {filledCount} set{filledCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                    <button onClick={() => removeAddedExercise(entry.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}>
                      <Trash2 size={14} color="var(--text-muted)" />
                    </button>
                    <button onClick={() => setOpenAddedId(isOpen ? null : entry.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}>
                      <ChevronDown size={16} color="var(--text-muted)" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ padding: "0 14px 14px" }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                      <select value={entry.exercise} onChange={(e) => setAddedExercise(entry.id, e.target.value)} style={{ flex: 1, minWidth: 0, padding: "9px 10px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13 }}>
                        {libraryEx.map((ex) => (
                          <option key={ex.name} value={ex.name}>{ex.name}{ex.type === "time" ? " (timed)" : ""}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeExerciseFromLibrary(entry.slotName, entry.exercise, slotExerciseLibrary[entry.slotName], (name) => setAddedExercise(entry.id, name))}
                        disabled={libraryEx.length <= 1}
                        title="Remove this exercise from the plan"
                        style={{ flexShrink: 0, width: 38, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", cursor: libraryEx.length <= 1 ? "default" : "pointer", opacity: libraryEx.length <= 1 ? 0.3 : 1 }}
                      >
                        <Trash2 size={14} color="var(--text-muted)" />
                      </button>
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginBottom: 8 }}>{equip}</div>

                    {equip === "Cable" && (
                      <select
                        value={entry.attachment || ""}
                        onChange={(e) => updateAddedField(entry.id, "attachment", e.target.value)}
                        style={{ width: "100%", padding: "8px 10px", marginBottom: 10, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: entry.attachment ? "var(--text)" : "var(--text-muted)", fontSize: 12.5 }}
                      >
                        <option value="">Attachment (optional)</option>
                        {CABLE_ATTACHMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                    )}

                    {Object.keys(muscleStatus).length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, padding: "8px 10px", background: "var(--surface-2)", borderRadius: 8 }}>
                        <BodyFront status={muscleStatus} detail={detail} />
                        <BodyBack status={muscleStatus} detail={detail} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 10, color: "var(--text-muted)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--accent)", display: "inline-block", flexShrink: 0 }} /> Primary
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--muscle-secondary)", display: "inline-block", flexShrink: 0 }} /> Secondary
                          </div>
                        </div>
                      </div>
                    )}

                    {prevBest && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11.5, color: "var(--text-muted)", marginBottom: 10, padding: "7px 9px", background: "var(--surface-2)", borderRadius: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <HistoryIcon size={11} style={{ flexShrink: 0 }} />
                          <span>
                            Last: <span className="tabular" style={{ color: "var(--text)", fontWeight: 600 }}>
                              {prevBest.type === "time"
                                ? (prevBest.weight > 0 ? `+${prevBest.weight} lb × ${prevBest.value}s` : `${prevBest.value}s`)
                                : `${prevBest.weight} lb × ${prevBest.value}`}
                            </span> · {fmtDate(prevBest.date)}
                          </span>
                        </div>
                        {shouldBumpWeight && (
                          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--accent)", fontWeight: 600, paddingLeft: 17 }}>
                            <TrendingUp size={11} style={{ flexShrink: 0 }} />
                            <span>Hit top of the {repRange[0]}–{repRange[1]} range — bump the weight this time</span>
                          </div>
                        )}
                      </div>
                    )}

                    <textarea
                      rows={2}
                      placeholder="Notes for this exercise (form cues, adjustments...)"
                      value={entry.notes || ""}
                      onChange={(e) => updateAddedField(entry.id, "notes", e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", marginBottom: 10, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5, lineHeight: 1.4 }}
                    />

                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {entry.sets.map((row, i) => (
                        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <span className="tabular" style={{ fontSize: 11, color: "var(--text-muted)", width: 34, flexShrink: 0 }}>Set {i + 1}</span>
                            <input
                              type="number" inputMode="decimal"
                              placeholder={type === "time" ? "Wt (opt)" : "Weight"}
                              value={row.weight}
                              onChange={(e) => updateAddedRow(entry.id, i, "weight", e.target.value)}
                              style={{ flex: 1, minWidth: 0, padding: "9px 6px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13 }}
                            />

                            {type === "time" ? (
                              <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                                <input
                                  type="number" inputMode="numeric"
                                  placeholder="Sec"
                                  value={row.value}
                                  onChange={(e) => updateAddedRow(entry.id, i, "value", e.target.value)}
                                  style={{ width: "100%", padding: "9px 8px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13 }}
                                />
                                <Timer size={12} color="var(--time)" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                              </div>
                            ) : (
                              <select
                                value={row.value}
                                onChange={(e) => updateAddedRow(entry.id, i, "value", e.target.value)}
                                style={{ flex: 1, minWidth: 0, padding: "9px 6px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: row.value === "" ? "var(--text-muted)" : "var(--text)", fontSize: 13 }}
                              >
                                <option value="">Reps</option>
                                {REPS_OPTIONS.map((r) => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            )}

                            <button onClick={() => removeAddedRow(entry.id, i)} disabled={entry.sets.length === 1} style={{ background: "none", border: "none", cursor: entry.sets.length === 1 ? "default" : "pointer", padding: 4, opacity: entry.sets.length === 1 ? 0.25 : 1, flexShrink: 0 }}>
                              <X size={14} color="var(--text-muted)" />
                            </button>
                          </div>

                          {row.extra ? (
                            <div style={{ marginLeft: 41, padding: "8px 9px", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", gap: 4 }}>
                                  <button onClick={() => { updateAddedExtra(entry.id, i, "type", "superset"); if (row.extra.type === "dropset") updateAddedExtra(entry.id, i, "exercise", ""); }} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer", border: row.extra.type === "superset" ? "1px solid var(--accent)" : "1px solid var(--border)", background: row.extra.type === "superset" ? "var(--accent-dim)" : "transparent", color: row.extra.type === "superset" ? "var(--accent)" : "var(--text-muted)" }}>Superset</button>
                                  <button onClick={() => { updateAddedExtra(entry.id, i, "type", "dropset"); updateAddedExtra(entry.id, i, "exercise", entry.exercise); }} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer", border: row.extra.type === "dropset" ? "1px solid var(--accent)" : "1px solid var(--border)", background: row.extra.type === "dropset" ? "var(--accent-dim)" : "transparent", color: row.extra.type === "dropset" ? "var(--accent)" : "var(--text-muted)" }}>Drop Set</button>
                                </div>
                                <button onClick={() => removeAddedExtra(entry.id, i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 3 }}>
                                  <X size={12} color="var(--text-muted)" />
                                </button>
                              </div>
                              {row.extra.type === "dropset" ? (
                                <div style={{ width: "100%", padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 12.5 }}>
                                  {entry.exercise || "Exercise name"}
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  placeholder="Exercise name"
                                  value={row.extra.exercise}
                                  onChange={(e) => updateAddedExtra(entry.id, i, "exercise", e.target.value)}
                                  style={{ width: "100%", padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5 }}
                                />
                              )}
                              <div style={{ display: "flex", gap: 6 }}>
                                <input
                                  type="number" inputMode="decimal"
                                  placeholder="Weight"
                                  value={row.extra.weight}
                                  onChange={(e) => updateAddedExtra(entry.id, i, "weight", e.target.value)}
                                  style={{ flex: 1, minWidth: 0, padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5 }}
                                />
                                <select
                                  value={row.extra.value}
                                  onChange={(e) => updateAddedExtra(entry.id, i, "value", e.target.value)}
                                  style={{ flex: 1, minWidth: 0, padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: row.extra.value === "" ? "var(--text-muted)" : "var(--text)", fontSize: 12.5 }}
                                >
                                  <option value="">Reps</option>
                                  {REPS_OPTIONS.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => addAddedExtra(entry.id, i)} style={{ marginLeft: 41, alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 11 }}>
                              <Layers size={11} /> Superset / drop set
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button onClick={() => addAddedRow(entry.id)} style={{ marginTop: 9, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", borderRadius: 8, background: "var(--surface-2)", border: "1px dashed var(--border)", cursor: "pointer", color: "var(--text-muted)", fontSize: 12.5, fontWeight: 600 }}>
                      <Plus size={14} /> Add Set
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Custom / manually-added exercises */}
          <datalist id="custom-exercise-suggestions">
            {customSuggestions.map((name) => <option key={name} value={name} />)}
          </datalist>

          {customList.length > 0 && (
            <div className="display" style={{ fontSize: 11, color: "var(--text-muted)", margin: "14px 0 8px" }}>Custom</div>
          )}

          {customList.map((entry) => {
            const isOpen = openCustomId === entry.id;
            const filledCount = entry.sets.filter((s) => s.weight !== "" && s.value !== "").length;
            return (
              <div key={entry.id} style={{ marginBottom: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px 6px 14px" }}>
                  <button onClick={() => setOpenCustomId(isOpen ? null : entry.id)} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: "7px 0", display: "flex", alignItems: "center", gap: 8, color: "var(--text)" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.exercise || "New Exercise"}</span>
                    {filledCount > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 700, background: "var(--accent-dim)", color: "var(--accent)", borderRadius: 999, padding: "1px 8px", flexShrink: 0 }}>
                        {filledCount} set{filledCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                    <button onClick={() => removeCustomExercise(entry.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}>
                      <Trash2 size={14} color="var(--text-muted)" />
                    </button>
                    <button onClick={() => setOpenCustomId(isOpen ? null : entry.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}>
                      <ChevronDown size={16} color="var(--text-muted)" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ padding: "0 14px 14px" }}>
                    <input
                      type="text"
                      list="custom-exercise-suggestions"
                      placeholder="Exercise name"
                      value={entry.exercise}
                      onChange={(e) => updateCustomField(entry.id, "exercise", e.target.value)}
                      style={{ width: "100%", padding: "9px 10px", marginBottom: 4, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13 }}
                    />

                    {(() => {
                      const prevCustom = entry.exercise ? getPreviousBestCustom(entry.exercise.trim()) : null;
                      return prevCustom ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--text-muted)", margin: "6px 0 10px", padding: "7px 9px", background: "var(--surface-2)", borderRadius: 6 }}>
                          <HistoryIcon size={11} style={{ flexShrink: 0 }} />
                          <span>
                            Last: <span className="tabular" style={{ color: "var(--text)", fontWeight: 600 }}>{prevCustom.weight} lb × {prevCustom.value}</span> · {fmtDate(prevCustom.date)}
                          </span>
                        </div>
                      ) : (
                        <div style={{ marginBottom: 10 }} />
                      );
                    })()}

                    <textarea
                      rows={2}
                      placeholder="Notes for this exercise (form cues, adjustments...)"
                      value={entry.notes || ""}
                      onChange={(e) => updateCustomField(entry.id, "notes", e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", marginBottom: 10, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5, lineHeight: 1.4 }}
                    />

                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {entry.sets.map((row, i) => (
                        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <span className="tabular" style={{ fontSize: 11, color: "var(--text-muted)", width: 34, flexShrink: 0 }}>Set {i + 1}</span>
                            <input
                              type="number" inputMode="decimal"
                              placeholder="Weight"
                              value={row.weight}
                              onChange={(e) => updateCustomRow(entry.id, i, "weight", e.target.value)}
                              style={{ flex: 1, minWidth: 0, padding: "9px 8px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13 }}
                            />
                            <input
                              type="number" inputMode="numeric"
                              placeholder="Reps"
                              value={row.value}
                              onChange={(e) => updateCustomRow(entry.id, i, "value", e.target.value)}
                              style={{ flex: 1, minWidth: 0, padding: "9px 8px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13 }}
                            />
                            <button onClick={() => removeCustomRow(entry.id, i)} disabled={entry.sets.length === 1} style={{ background: "none", border: "none", cursor: entry.sets.length === 1 ? "default" : "pointer", padding: 4, opacity: entry.sets.length === 1 ? 0.25 : 1, flexShrink: 0 }}>
                              <X size={14} color="var(--text-muted)" />
                            </button>
                          </div>

                          {row.extra ? (
                            <div style={{ marginLeft: 41, padding: "8px 9px", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", gap: 4 }}>
                                  <button onClick={() => { updateCustomExtra(entry.id, i, "type", "superset"); if (row.extra.type === "dropset") updateCustomExtra(entry.id, i, "exercise", ""); }} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer", border: row.extra.type === "superset" ? "1px solid var(--accent)" : "1px solid var(--border)", background: row.extra.type === "superset" ? "var(--accent-dim)" : "transparent", color: row.extra.type === "superset" ? "var(--accent)" : "var(--text-muted)" }}>Superset</button>
                                  <button onClick={() => { updateCustomExtra(entry.id, i, "type", "dropset"); updateCustomExtra(entry.id, i, "exercise", entry.exercise); }} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer", border: row.extra.type === "dropset" ? "1px solid var(--accent)" : "1px solid var(--border)", background: row.extra.type === "dropset" ? "var(--accent-dim)" : "transparent", color: row.extra.type === "dropset" ? "var(--accent)" : "var(--text-muted)" }}>Drop Set</button>
                                </div>
                                <button onClick={() => removeCustomExtra(entry.id, i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 3 }}>
                                  <X size={12} color="var(--text-muted)" />
                                </button>
                              </div>
                              {row.extra.type === "dropset" ? (
                                <div style={{ width: "100%", padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 12.5 }}>
                                  {entry.exercise || "Exercise name"}
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  placeholder="Exercise name"
                                  value={row.extra.exercise}
                                  onChange={(e) => updateCustomExtra(entry.id, i, "exercise", e.target.value)}
                                  style={{ width: "100%", padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5 }}
                                />
                              )}
                              <div style={{ display: "flex", gap: 6 }}>
                                <input
                                  type="number" inputMode="decimal"
                                  placeholder="Weight"
                                  value={row.extra.weight}
                                  onChange={(e) => updateCustomExtra(entry.id, i, "weight", e.target.value)}
                                  style={{ flex: 1, minWidth: 0, padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5 }}
                                />
                                <select
                                  value={row.extra.value}
                                  onChange={(e) => updateCustomExtra(entry.id, i, "value", e.target.value)}
                                  style={{ flex: 1, minWidth: 0, padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: row.extra.value === "" ? "var(--text-muted)" : "var(--text)", fontSize: 12.5 }}
                                >
                                  <option value="">Reps</option>
                                  {REPS_OPTIONS.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => addCustomExtra(entry.id, i)} style={{ marginLeft: 41, alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 11 }}>
                              <Layers size={11} /> Superset / drop set
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button onClick={() => addCustomRow(entry.id)} style={{ marginTop: 9, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", borderRadius: 8, background: "var(--surface-2)", border: "1px dashed var(--border)", cursor: "pointer", color: "var(--text-muted)", fontSize: 12.5, fontWeight: 600 }}>
                      <Plus size={14} /> Add Set
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {addFlow ? (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {addFlow.step !== "choose" && (
                    <button onClick={addFlowBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--text-muted)", fontSize: 12 }}>‹ Back</button>
                  )}
                  <span className="display" style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {addFlow.step === "choose" && "Add an exercise"}
                    {addFlow.step === "body" && "Which body part?"}
                    {addFlow.step === "part" && `Which part of ${addFlow.bodyPart}?`}
                    {addFlow.step === "exercise" && "Pick an exercise"}
                  </span>
                </div>
                <button onClick={cancelAddFlow} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                  <X size={16} color="var(--text-muted)" />
                </button>
              </div>

              {addFlow.step === "choose" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button onClick={chooseExisting} style={{ width: "100%", textAlign: "left", padding: "12px 14px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text)" }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>Existing in the Plan</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>Pull a lift already defined elsewhere in your split — gets weight/rep dropdowns, muscle diagram, and history.</div>
                  </button>
                  <button onClick={chooseNew} style={{ width: "100%", textAlign: "left", padding: "12px 14px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text)" }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>New Exercise</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>Not in the plan — type the name and enter weight/reps manually.</div>
                  </button>
                </div>
              )}

              {addFlow.step === "body" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {Object.keys(bodyParts).map((part) => (
                    <button key={part} onClick={() => chooseBodyPart(part)} style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text)", fontSize: 13, fontWeight: 600 }}>
                      {part}
                    </button>
                  ))}
                </div>
              )}

              {addFlow.step === "part" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {bodyParts[addFlow.bodyPart].map((slotName) => (
                    <button key={slotName} onClick={() => chooseSlotName(slotName)} style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text)", fontSize: 13, fontWeight: 600 }}>
                      {slotName}
                    </button>
                  ))}
                </div>
              )}

              {addFlow.step === "exercise" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {availableExercises(addFlow.slotName, slotExerciseLibrary[addFlow.slotName] || []).map((ex) => (
                    <button key={ex.name} onClick={() => chooseLibraryExercise(addFlow.slotName, ex.name)} style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text)", fontSize: 13, fontWeight: 600 }}>
                      {ex.name}{ex.type === "time" ? " (timed)" : ""}
                      <span style={{ fontWeight: 400, color: "var(--text-muted)", fontSize: 11 }}> · {ex.equip}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button onClick={isCustomBackfill ? addCustomExercise : startAddFlow} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px", borderRadius: 12, background: "transparent", border: "1px dashed var(--accent)", cursor: "pointer", color: "var(--accent)", fontSize: 13, fontWeight: 700 }}>
              <Plus size={16} /> Add Exercise
            </button>
          )}
        </div>
      ) : (
        <div style={{ padding: "10px 16px 40px" }}>
          {activePlan && (
            <button
              onClick={() => setScreen("addPastWorkout")}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px", borderRadius: 10, background: "transparent", border: "1px dashed var(--accent)", cursor: "pointer", color: "var(--accent)", fontSize: 13, fontWeight: 700, marginBottom: 14 }}
            >
              <Plus size={15} /> Add Past Workout
            </button>
          )}
          {!historyLoaded ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 13, padding: "20px 0" }}>
              <Loader2 size={16} /> Loading history…
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
              <HistoryIcon size={26} style={{ marginBottom: 10, opacity: 0.5 }} />
              <div style={{ fontSize: 14 }}>No workouts logged yet.</div>
              <div style={{ fontSize: 12.5, marginTop: 4 }}>Finish a session and hit Save Workout to start your log.</div>
            </div>
          ) : (
            [...history]
              .reverse()
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((s) => {
              const blocks = s.blocks || [];
              const vol = blocks.filter((b) => b.type === "reps").reduce((sum, b) => sum + b.sets.reduce((s2, st) => s2 + st.weight * st.value, 0), 0);
              const hold = blocks.filter((b) => b.type === "time").reduce((sum, b) => sum + b.sets.reduce((s2, st) => s2 + st.value, 0), 0);
              const isOpen = openHistoryId === s.id;
              const isFull = fullHistoryId === s.id;
              return (
                <div key={s.id} style={{ marginBottom: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                  <button
                    onClick={() => { setOpenHistoryId(isOpen ? null : s.id); if (isOpen) setFullHistoryId(null); }}
                    style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
                  >
                    <div>
                      <div className="display" style={{ fontSize: 14 }}>
                        {allDaysByKey[s.day]?.tab || s.day}
                        {allDaysByKey[s.day] && allDaysByKey[s.day].label !== allDaysByKey[s.day].tab && ` · ${allDaysByKey[s.day].label}`}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{fmtDate(s.date)}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {hold > 0 && <span className="tabular" style={{ fontSize: 12, color: "var(--time)" }}>{hold}s</span>}
                      {vol > 0 && <span className="tabular" style={{ fontSize: 13, color: "var(--accent)", fontWeight: 700 }}>{vol.toLocaleString()} lb</span>}
                      <span
                        role="button"
                        onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                        style={{ display: "flex", cursor: "pointer" }}
                      >
                        <Trash2 size={14} color="var(--text-muted)" />
                      </span>
                      <ChevronDown size={16} color="var(--text-muted)" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ padding: "0 14px 14px" }}>
                      {!isFull ? (
                        <>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                            {blocks.map((b, i) => (
                              <div key={i}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                                  <span style={{ color: "var(--text-muted)" }}>{b.slot}: <span style={{ color: "var(--text)" }}>{b.exercise}</span></span>
                                  <span className="tabular" style={{ color: b.type === "time" ? "var(--time)" : "var(--text-muted)" }}>{fmtSetsList(b)}</span>
                                </div>
                                {b.attachment && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Attachment: {b.attachment}</div>}
                                {b.notes && <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontStyle: "italic", marginTop: 2 }}>{b.notes}</div>}
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => setFullHistoryId(s.id)}
                            style={{ width: "100%", padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)" }}
                          >
                            Show Full Detail
                          </button>
                        </>
                      ) : (
                        <>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
                            {blocks.map((b, i) => (
                              <div key={i} style={{ background: "var(--surface-2)", borderRadius: 10, padding: "10px 12px" }}>
                                <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{b.slot}</div>
                                <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: b.attachment || b.notes ? 4 : 8 }}>{b.exercise}</div>
                                {b.attachment && <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Attachment: {b.attachment}</div>}
                                {b.notes && <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontStyle: "italic", marginBottom: 8 }}>{b.notes}</div>}
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                  {b.sets.map((st, si) => (
                                    <div key={si} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5 }}>
                                        <span className="tabular" style={{ color: "var(--text-muted)", width: 34, flexShrink: 0 }}>Set {si + 1}</span>
                                        <span className="tabular" style={{ color: b.type === "time" ? "var(--time)" : "var(--text)", fontWeight: 600 }}>
                                          {b.type === "time"
                                            ? (st.weight > 0 ? `+${st.weight} lb · ${st.value}s` : `${st.value}s`)
                                            : `${st.weight} lb × ${st.value}`}
                                        </span>
                                      </div>
                                      {st.extra && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-muted)", paddingLeft: 41 }}>
                                          <Layers size={10} style={{ flexShrink: 0 }} />
                                          {st.extra.type === "superset" ? "Superset" : "Drop set"}: {st.extra.exercise} — <span className="tabular">{st.extra.weight} lb × {st.extra.value}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => setFullHistoryId(null)}
                            style={{ width: "100%", padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)" }}
                          >
                            Show Summary
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Sticky save bar */}
      {view === "log" && sessionBlocks.length > 0 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 16px", paddingBottom: "calc(12px + env(safe-area-inset-bottom))", background: "linear-gradient(to top, var(--bg) 70%, transparent)" }}>
          {storageError && <div style={{ fontSize: 12, color: "var(--danger)", marginBottom: 6, textAlign: "center" }}>{storageError}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={discardSession} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}>
              <RotateCcw size={16} color="var(--text-muted)" />
            </button>
            <button onClick={saveWorkout} disabled={saving} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 10, background: savedFlash ? "var(--success)" : "var(--accent)", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "var(--on-accent)" }}>
              {saving ? <Loader2 size={16} /> : <Save size={16} />}
              {savedFlash
                ? "Saved"
                : saving
                ? "Saving…"
                : `${backfill ? "Save Past Workout" : hasCurrentWeekEntry ? "Update Workout" : "Save Workout"} (${totalSets} set${totalSets > 1 ? "s" : ""})`}
            </button>
          </div>
        </div>
      )}
      </>
      )}

      <CompletionQuoteModal quote={completionQuote} onClose={() => setCompletionQuote(null)} />
    </div>
  );
}
