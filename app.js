var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
const { useState, useEffect, useMemo } = React;
const storage = {
  async get(key) {
    try {
      const v = localStorage.getItem("ironlog:" + key);
      return v != null ? { key, value: v } : null;
    } catch (e) {
      return null;
    }
  },
  async set(key, value) {
    try {
      localStorage.setItem("ironlog:" + key, value);
      return { key, value };
    } catch (e) {
      return null;
    }
  }
};
function Icon({ size = 16, color = "currentColor", style, children }) {
  return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", style }, children);
}
const Dumbbell = (p) => /* @__PURE__ */ React.createElement(Icon, __spreadValues({}, p), /* @__PURE__ */ React.createElement("rect", { x: "2", y: "8", width: "3", height: "8", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "19", y: "8", width: "3", height: "8", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "6", y: "6", width: "2.5", height: "12", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "15.5", y: "6", width: "2.5", height: "12", rx: "1" }), /* @__PURE__ */ React.createElement("line", { x1: "8.5", y1: "12", x2: "15.5", y2: "12" }));
const Plus = (p) => /* @__PURE__ */ React.createElement(Icon, __spreadValues({}, p), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "5", x2: "12", y2: "19" }), /* @__PURE__ */ React.createElement("line", { x1: "5", y1: "12", x2: "19", y2: "12" }));
const Trash2 = (p) => /* @__PURE__ */ React.createElement(Icon, __spreadValues({}, p), /* @__PURE__ */ React.createElement("polyline", { points: "3,6 5,6 21,6" }), /* @__PURE__ */ React.createElement("path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }), /* @__PURE__ */ React.createElement("path", { d: "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" }), /* @__PURE__ */ React.createElement("line", { x1: "10", y1: "11", x2: "10", y2: "17" }), /* @__PURE__ */ React.createElement("line", { x1: "14", y1: "11", x2: "14", y2: "17" }));
const ChevronDown = (p) => /* @__PURE__ */ React.createElement(Icon, __spreadValues({}, p), /* @__PURE__ */ React.createElement("polyline", { points: "6,9 12,15 18,9" }));
const Save = (p) => /* @__PURE__ */ React.createElement(Icon, __spreadValues({}, p), /* @__PURE__ */ React.createElement("path", { d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" }), /* @__PURE__ */ React.createElement("polyline", { points: "17,21 17,13 7,13 7,21" }), /* @__PURE__ */ React.createElement("polyline", { points: "7,3 7,8 15,8" }));
const X = (p) => /* @__PURE__ */ React.createElement(Icon, __spreadValues({}, p), /* @__PURE__ */ React.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), /* @__PURE__ */ React.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" }));
const Loader2 = (p) => /* @__PURE__ */ React.createElement(Icon, __spreadProps(__spreadValues({}, p), { style: __spreadProps(__spreadValues({}, p.style || {}), { animation: "spin 1s linear infinite" }) }), /* @__PURE__ */ React.createElement("path", { d: "M21 12a9 9 0 1 1-9-9" }));
const HistoryIcon = (p) => /* @__PURE__ */ React.createElement(Icon, __spreadValues({}, p), /* @__PURE__ */ React.createElement("path", { d: "M3 3v5h5" }), /* @__PURE__ */ React.createElement("path", { d: "M3.05 13a9 9 0 1 0 2.13-8.36L3 8" }), /* @__PURE__ */ React.createElement("polyline", { points: "12,7 12,12 15,14" }));
const RotateCcw = (p) => /* @__PURE__ */ React.createElement(Icon, __spreadValues({}, p), /* @__PURE__ */ React.createElement("path", { d: "M3 12a9 9 0 1 0 3-6.7L3 8" }), /* @__PURE__ */ React.createElement("polyline", { points: "3,3 3,8 8,8" }));
const Timer = (p) => /* @__PURE__ */ React.createElement(Icon, __spreadValues({}, p), /* @__PURE__ */ React.createElement("line", { x1: "10", y1: "2", x2: "14", y2: "2" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "14", x2: "12", y2: "9" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "14", r: "8" }));
const TrendingUp = (p) => /* @__PURE__ */ React.createElement(Icon, __spreadValues({}, p), /* @__PURE__ */ React.createElement("polyline", { points: "3,17 9,11 13,15 21,7" }), /* @__PURE__ */ React.createElement("polyline", { points: "14,7 21,7 21,14" }));
const Layers = (p) => /* @__PURE__ */ React.createElement(Icon, __spreadValues({}, p), /* @__PURE__ */ React.createElement("polygon", { points: "12,2 2,7 12,12 22,7" }), /* @__PURE__ */ React.createElement("polyline", { points: "2,17 12,22 22,17" }), /* @__PURE__ */ React.createElement("polyline", { points: "2,12 12,17 22,12" }));
const R = (name, equip) => ({ name, type: "reps", equip });
const T = (name, equip) => ({ name, type: "time", equip });
const WORKOUT_DATA = {
  Monday: {
    label: "Push",
    subtitle: "Chest, Triceps, Front Delts",
    slots: [
      { name: "Chest \u2014 Upper", exercises: [R("Machine Incline Press", "Machine"), R("Incline DB Press", "Dumbbell"), R("Incline Barbell Press", "Barbell"), R("Incline DB Fly", "Dumbbell"), R("Incline Cable Fly", "Cable")] },
      { name: "Chest \u2014 Middle", exercises: [R("Flat Barbell Press", "Barbell"), R("Flat DB Press", "Dumbbell"), R("Flat DB Fly", "Dumbbell"), R("Flat Cable Fly", "Cable")] },
      { name: "Chest \u2014 Lower", exercises: [R("Decline DB Fly", "Dumbbell"), R("Decline Cable Fly", "Cable"), R("Decline DB Press", "Dumbbell"), R("Decline Barbell Press", "Barbell")] },
      { name: "Triceps \u2014 Long Head", exercises: [R("Overhead DB Extension", "Dumbbell"), R("Overhead Cable Extension", "Cable")] },
      { name: "Triceps \u2014 Lateral Head", exercises: [R("Single-Arm Cable Pushdown", "Cable"), R("Rope or Bar Pushdown", "Cable")] },
      { name: "Triceps \u2014 Medial Head", exercises: [R("Close-Grip Barbell Bench Press", "Barbell"), R("Close-Grip DB Bench Press", "Dumbbell")] },
      { name: "Front Delts", exercises: [R("Cable Front Raise", "Cable"), R("DB Front Raise", "Dumbbell")] }
    ]
  },
  Tuesday: {
    label: "Pull",
    subtitle: "Back, Biceps, Rear Delts",
    slots: [
      { name: "Back \u2014 Width", exercises: [R("Lat Pulldown", "Cable"), R("Single-Arm Lat Pulldown", "Cable"), R("Pull-Up", "Bodyweight")] },
      { name: "Back \u2014 Thickness", exercises: [R("Barbell Row", "Barbell"), R("DB Row", "Dumbbell"), R("Seated Cable Row", "Cable"), R("Single-Arm Cable Row", "Cable")] },
      { name: "Back \u2014 Lower Lat / Traps", exercises: [R("Barbell Deadlift", "Barbell"), R("DB Deadlift", "Dumbbell"), R("Straight-Arm Pulldown", "Cable")] },
      { name: "Biceps \u2014 Long Head", exercises: [R("Bayesian Curl", "Cable"), R("Incline DB Curl", "Dumbbell")] },
      { name: "Biceps \u2014 Short Head", exercises: [R("Preacher Curl", "EZ-Bar"), R("Spider Curl", "Dumbbell"), R("Cable Preacher Curl", "Cable")] },
      { name: "Biceps \u2014 Brachialis", exercises: [R("DB Hammer Curl", "Dumbbell"), R("Cable Hammer Curl", "Cable"), R("Cross-Body Hammer Curl", "Dumbbell")] },
      { name: "Rear Delts", exercises: [R("Reverse Pec Deck", "Machine"), R("Face Pull", "Cable"), R("DB Reverse Fly", "Dumbbell"), R("Cable Reverse Fly", "Cable")] }
    ]
  },
  Wednesday: {
    label: "Legs",
    subtitle: "Compound Focus",
    slots: [
      { name: "Quads \u2014 Primary", exercises: [R("Back Squat", "Barbell"), R("Front Squat", "Barbell"), R("Goblet Squat", "Dumbbell")] },
      { name: "Quads \u2014 Secondary", exercises: [R("Leg Press", "Machine"), R("Goblet Squat", "Dumbbell")] },
      { name: "Hamstrings", exercises: [R("Barbell RDL", "Barbell"), R("DB RDL", "Dumbbell")] },
      { name: "Glutes", exercises: [R("Bulgarian Split Squat", "Dumbbell"), R("Walking Lunges", "Dumbbell")] },
      { name: "Calves", exercises: [R("Standing Calf Raise", "Machine"), R("Single-Leg Calf Raise", "Dumbbell")] }
    ]
  },
  Friday: {
    label: "Upper",
    subtitle: "Chest, Back, Arms, Shoulders",
    slots: [
      { name: "Chest \u2014 Upper", exercises: [R("Incline DB Press", "Dumbbell"), R("Incline Barbell Press", "Barbell"), R("Incline DB Fly", "Dumbbell"), R("Incline Cable Fly", "Cable")] },
      { name: "Chest \u2014 Middle", exercises: [R("Flat DB Fly", "Dumbbell"), R("Flat Cable Fly", "Cable"), R("Machine Chest Press", "Machine")] },
      { name: "Chest \u2014 Lower", exercises: [R("Machine Decline Press", "Machine"), R("Decline DB Press", "Dumbbell"), R("Decline Cable Fly", "Cable")] },
      { name: "Back \u2014 Width", exercises: [R("Neutral-Grip Pull-Up", "Bodyweight"), R("Lat Pulldown", "Cable"), R("Single-Arm Lat Pulldown", "Cable")] },
      { name: "Back \u2014 Thickness", exercises: [R("Chest-Supported DB Row", "Dumbbell"), R("Chest-Supported Barbell/T-Bar Row", "Barbell")] },
      { name: "Shoulders \u2014 Front/Mid", exercises: [R("Seated DB Overhead Press", "Dumbbell"), R("Seated Barbell Overhead Press", "Barbell"), R("Cable Overhead Press", "Cable")] },
      { name: "Shoulders \u2014 Side", exercises: [R("Cable Lateral Raise", "Cable"), R("DB Lateral Raise", "Dumbbell")] },
      { name: "Shoulders \u2014 Rear", exercises: [R("Bent-Over DB Rear Delt Fly", "Dumbbell"), R("Cable Rear Delt Fly", "Cable")] },
      { name: "Arms \u2014 Biceps", exercises: [R("Barbell or EZ-Bar Curl", "EZ-Bar"), R("DB Curl", "Dumbbell"), R("Cable Curl", "Cable")] },
      { name: "Arms \u2014 Triceps", exercises: [R("Barbell or EZ-Bar Skull Crushers", "EZ-Bar"), R("DB Skull Crushers", "Dumbbell")] }
    ]
  },
  Saturday: {
    label: "Lower",
    subtitle: "Machine Isolation or Isometric Hold",
    slots: [
      { name: "Quads", exercises: [R("Leg Extension Machine", "Machine"), T("Wall Sit", "Bodyweight")] },
      { name: "Hamstrings", exercises: [R("Leg Curl Machine", "Machine"), T("Single-Leg RDL Hold", "Bodyweight")] },
      { name: "Glute Medius / Abductors", exercises: [R("Hip Abductor Machine", "Machine"), T("Side-Lying Hip Abduction Hold", "Bodyweight")] },
      { name: "Adductors", exercises: [R("Hip Adductor Machine", "Machine"), T("Copenhagen Plank Hold", "Bodyweight")] },
      { name: "Calves", exercises: [R("Barbell Calf Raise", "Barbell"), R("Single-Leg DB Calf Raise", "Dumbbell"), T("Calf Raise Hold", "Bodyweight")] }
    ]
  }
};
const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"];
const todayName = () => {
  const n = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "long" });
  return DAY_ORDER.includes(n) ? n : "Monday";
};
const todayISO = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
const fmtDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};
function getSlot(day, slotName) {
  return WORKOUT_DATA[day].slots.find((s) => s.name === slotName);
}
function getExercise(day, slotName, exerciseName) {
  const slot = getSlot(day, slotName);
  return slot == null ? void 0 : slot.exercises.find((e) => e.name === exerciseName);
}
function getExerciseType(day, slotName, exerciseName) {
  var _a;
  return ((_a = getExercise(day, slotName, exerciseName)) == null ? void 0 : _a.type) || "reps";
}
function getExerciseEquip(day, slotName, exerciseName) {
  var _a;
  return ((_a = getExercise(day, slotName, exerciseName)) == null ? void 0 : _a.equip) || "Dumbbell";
}
const SLOT_EXERCISE_LIBRARY = {};
Object.values(WORKOUT_DATA).forEach((dayObj) => {
  dayObj.slots.forEach((slot) => {
    if (!SLOT_EXERCISE_LIBRARY[slot.name]) SLOT_EXERCISE_LIBRARY[slot.name] = [];
    slot.exercises.forEach((ex) => {
      if (!SLOT_EXERCISE_LIBRARY[slot.name].some((e) => e.name === ex.name)) SLOT_EXERCISE_LIBRARY[slot.name].push(ex);
    });
  });
});
const BODY_PARTS = {};
Object.keys(SLOT_EXERCISE_LIBRARY).forEach((slotName) => {
  const part = slotName.includes(" \u2014 ") ? slotName.split(" \u2014 ")[0] : slotName;
  if (!BODY_PARTS[part]) BODY_PARTS[part] = [];
  if (!BODY_PARTS[part].includes(slotName)) BODY_PARTS[part].push(slotName);
});
function getExerciseFromLibrary(slotName, exerciseName) {
  return (SLOT_EXERCISE_LIBRARY[slotName] || []).find((e) => e.name === exerciseName);
}
const emptyRow = () => ({ weight: "", value: "", extra: null });
const emptyExtra = () => ({ type: "superset", exercise: "", weight: "", value: "" });
function range(start, end, step) {
  const out = [];
  for (let w = start; w <= end + 1e-9; w += step) out.push(Math.round(w * 100) / 100);
  return out;
}
const BARBELL_WEIGHTS = range(45, 495, 5);
const EZBAR_WEIGHTS = range(20, 150, 5);
const DUMBBELL_WEIGHTS = range(5, 150, 5);
const STACK_WEIGHTS = range(2.5, 250, 2.5);
const BODYWEIGHT_ADDED = [0, ...range(5, 100, 5)];
const REPS_OPTIONS = range(1, 20, 1);
const FIVE_LB_EQUIP = /* @__PURE__ */ new Set(["Barbell", "EZ-Bar", "Dumbbell", "Bodyweight"]);
function weightOptionsFor(equip) {
  switch (equip) {
    case "Barbell":
      return BARBELL_WEIGHTS;
    case "EZ-Bar":
      return EZBAR_WEIGHTS;
    case "Dumbbell":
      return DUMBBELL_WEIGHTS;
    case "Cable":
      return STACK_WEIGHTS;
    case "Machine":
      return STACK_WEIGHTS;
    case "Bodyweight":
      return BODYWEIGHT_ADDED;
    default:
      return DUMBBELL_WEIGHTS;
  }
}
const MUSCLE_MAP = {
  "Machine Incline Press": { primary: ["chest"], secondary: ["frontDelt", "triceps"], detail: { muscle: "chest", region: "upper" } },
  "Incline DB Press": { primary: ["chest"], secondary: ["frontDelt", "triceps"], detail: { muscle: "chest", region: "upper" } },
  "Incline Barbell Press": { primary: ["chest"], secondary: ["frontDelt", "triceps"], detail: { muscle: "chest", region: "upper" } },
  "Incline DB Fly": { primary: ["chest"], secondary: ["frontDelt"], detail: { muscle: "chest", region: "upper" } },
  "Incline Cable Fly": { primary: ["chest"], secondary: ["frontDelt"], detail: { muscle: "chest", region: "upper" } },
  "Flat Barbell Press": { primary: ["chest"], secondary: ["frontDelt", "triceps"], detail: { muscle: "chest", region: "middle" } },
  "Flat DB Press": { primary: ["chest"], secondary: ["frontDelt", "triceps"], detail: { muscle: "chest", region: "middle" } },
  "Flat DB Fly": { primary: ["chest"], secondary: ["frontDelt"], detail: { muscle: "chest", region: "middle" } },
  "Flat Cable Fly": { primary: ["chest"], secondary: ["frontDelt"], detail: { muscle: "chest", region: "middle" } },
  "Decline DB Fly": { primary: ["chest"], secondary: ["frontDelt"], detail: { muscle: "chest", region: "lower" } },
  "Decline Cable Fly": { primary: ["chest"], secondary: ["frontDelt"], detail: { muscle: "chest", region: "lower" } },
  "Decline DB Press": { primary: ["chest"], secondary: ["triceps", "frontDelt"], detail: { muscle: "chest", region: "lower" } },
  "Decline Barbell Press": { primary: ["chest"], secondary: ["triceps", "frontDelt"], detail: { muscle: "chest", region: "lower" } },
  "Machine Chest Press": { primary: ["chest"], secondary: ["frontDelt", "triceps"], detail: { muscle: "chest", region: "middle" } },
  "Machine Decline Press": { primary: ["chest"], secondary: ["triceps", "frontDelt"], detail: { muscle: "chest", region: "lower" } },
  "Overhead DB Extension": { primary: ["triceps"], secondary: [], detail: { muscle: "triceps", region: "long" } },
  "Overhead Cable Extension": { primary: ["triceps"], secondary: [], detail: { muscle: "triceps", region: "long" } },
  "Single-Arm Cable Pushdown": { primary: ["triceps"], secondary: [], detail: { muscle: "triceps", region: "lateral" } },
  "Rope or Bar Pushdown": { primary: ["triceps"], secondary: [], detail: { muscle: "triceps", region: "lateral" } },
  "Close-Grip Barbell Bench Press": { primary: ["triceps"], secondary: ["chest", "frontDelt"], detail: { muscle: "triceps", region: "medial" } },
  "Close-Grip DB Bench Press": { primary: ["triceps"], secondary: ["chest", "frontDelt"], detail: { muscle: "triceps", region: "medial" } },
  "DB Skull Crushers": { primary: ["triceps"], secondary: [], detail: { muscle: "triceps", region: "long" } },
  "Barbell or EZ-Bar Skull Crushers": { primary: ["triceps"], secondary: [], detail: { muscle: "triceps", region: "long" } },
  "Cable Front Raise": { primary: ["frontDelt"], secondary: [] },
  "DB Front Raise": { primary: ["frontDelt"], secondary: [] },
  "Lat Pulldown": { primary: ["lats"], secondary: ["biceps", "midBack"] },
  "Single-Arm Lat Pulldown": { primary: ["lats"], secondary: ["biceps"] },
  "Pull-Up": { primary: ["lats"], secondary: ["biceps", "midBack"] },
  "Neutral-Grip Pull-Up": { primary: ["lats"], secondary: ["biceps", "midBack"] },
  "Barbell Row": { primary: ["midBack"], secondary: ["lats", "biceps", "rearDelt"] },
  "DB Row": { primary: ["midBack"], secondary: ["lats", "biceps"] },
  "Seated Cable Row": { primary: ["midBack"], secondary: ["lats", "biceps"] },
  "Single-Arm Cable Row": { primary: ["midBack"], secondary: ["lats", "biceps"] },
  "Chest-Supported DB Row": { primary: ["midBack"], secondary: ["lats", "biceps", "rearDelt"] },
  "Chest-Supported Barbell/T-Bar Row": { primary: ["midBack"], secondary: ["lats", "biceps", "rearDelt"] },
  "Barbell Deadlift": { primary: ["lowerBack"], secondary: ["hamstrings", "glutes", "traps", "lats"] },
  "DB Deadlift": { primary: ["lowerBack"], secondary: ["hamstrings", "glutes", "traps"] },
  "Straight-Arm Pulldown": { primary: ["lats"], secondary: [] },
  "Bayesian Curl": { primary: ["biceps"], secondary: [], detail: { muscle: "biceps", region: "long" } },
  "Incline DB Curl": { primary: ["biceps"], secondary: [], detail: { muscle: "biceps", region: "long" } },
  "Preacher Curl": { primary: ["biceps"], secondary: [], detail: { muscle: "biceps", region: "short" } },
  "Spider Curl": { primary: ["biceps"], secondary: [], detail: { muscle: "biceps", region: "short" } },
  "Cable Preacher Curl": { primary: ["biceps"], secondary: [], detail: { muscle: "biceps", region: "short" } },
  "DB Hammer Curl": { primary: ["biceps"], secondary: ["forearm"], detail: { muscle: "biceps", region: "brachialis" } },
  "Cable Hammer Curl": { primary: ["biceps"], secondary: ["forearm"], detail: { muscle: "biceps", region: "brachialis" } },
  "Cross-Body Hammer Curl": { primary: ["biceps"], secondary: ["forearm"], detail: { muscle: "biceps", region: "brachialis" } },
  "Barbell or EZ-Bar Curl": { primary: ["biceps"], secondary: [] },
  "DB Curl": { primary: ["biceps"], secondary: [] },
  "Cable Curl": { primary: ["biceps"], secondary: [] },
  "Reverse Pec Deck": { primary: ["rearDelt"], secondary: [] },
  "Face Pull": { primary: ["rearDelt"], secondary: ["traps", "midBack"] },
  "DB Reverse Fly": { primary: ["rearDelt"], secondary: [] },
  "Cable Reverse Fly": { primary: ["rearDelt"], secondary: [] },
  "Bent-Over DB Rear Delt Fly": { primary: ["rearDelt"], secondary: [] },
  "Seated DB Overhead Press": { primary: ["frontDelt", "sideDelt"], secondary: ["triceps"] },
  "Seated Barbell Overhead Press": { primary: ["frontDelt", "sideDelt"], secondary: ["triceps"] },
  "Cable Overhead Press": { primary: ["frontDelt", "sideDelt"], secondary: ["triceps"] },
  "Cable Lateral Raise": { primary: ["sideDelt"], secondary: [] },
  "DB Lateral Raise": { primary: ["sideDelt"], secondary: [] },
  "Back Squat": { primary: ["quads"], secondary: ["glutes", "hamstrings", "lowerBack"] },
  "Front Squat": { primary: ["quads"], secondary: ["glutes", "lowerBack"] },
  "Goblet Squat": { primary: ["quads"], secondary: ["glutes"] },
  "Leg Press": { primary: ["quads"], secondary: ["glutes", "hamstrings"] },
  "Barbell RDL": { primary: ["hamstrings"], secondary: ["glutes", "lowerBack"] },
  "DB RDL": { primary: ["hamstrings"], secondary: ["glutes", "lowerBack"] },
  "Bulgarian Split Squat": { primary: ["quads"], secondary: ["glutes", "hamstrings"] },
  "Walking Lunges": { primary: ["quads"], secondary: ["glutes", "hamstrings"] },
  "Standing Calf Raise": { primary: ["calves"], secondary: [] },
  "Single-Leg Calf Raise": { primary: ["calves"], secondary: [] },
  "Single-Leg DB Calf Raise": { primary: ["calves"], secondary: [] },
  "Barbell Calf Raise": { primary: ["calves"], secondary: [] },
  "Leg Extension Machine": { primary: ["quads"], secondary: [] },
  "Leg Curl Machine": { primary: ["hamstrings"], secondary: [] },
  "Hip Abductor Machine": { primary: ["abductors"], secondary: [] },
  "Hip Adductor Machine": { primary: ["adductors"], secondary: [] },
  "Wall Sit": { primary: ["quads"], secondary: [] },
  "Single-Leg RDL Hold": { primary: ["hamstrings"], secondary: ["glutes"] },
  "Side-Lying Hip Abduction Hold": { primary: ["abductors"], secondary: [] },
  "Copenhagen Plank Hold": { primary: ["adductors"], secondary: ["abs"] },
  "Calf Raise Hold": { primary: ["calves"], secondary: [] }
};
const RANGE_BY_TYPE = { compound: [6, 10], isolation: [10, 15] };
const REP_RANGE_TYPE = {
  "Machine Incline Press": "compound",
  "Incline DB Press": "compound",
  "Incline Barbell Press": "compound",
  "Incline DB Fly": "isolation",
  "Incline Cable Fly": "isolation",
  "Flat Barbell Press": "compound",
  "Flat DB Press": "compound",
  "Flat DB Fly": "isolation",
  "Flat Cable Fly": "isolation",
  "Decline DB Fly": "isolation",
  "Decline Cable Fly": "isolation",
  "Decline DB Press": "compound",
  "Decline Barbell Press": "compound",
  "Machine Chest Press": "compound",
  "Machine Decline Press": "compound",
  "Overhead DB Extension": "isolation",
  "Overhead Cable Extension": "isolation",
  "Single-Arm Cable Pushdown": "isolation",
  "Rope or Bar Pushdown": "isolation",
  "Close-Grip Barbell Bench Press": "compound",
  "Close-Grip DB Bench Press": "compound",
  "DB Skull Crushers": "isolation",
  "Barbell or EZ-Bar Skull Crushers": "isolation",
  "Cable Front Raise": "isolation",
  "DB Front Raise": "isolation",
  "Lat Pulldown": "compound",
  "Single-Arm Lat Pulldown": "compound",
  "Pull-Up": "compound",
  "Neutral-Grip Pull-Up": "compound",
  "Barbell Row": "compound",
  "DB Row": "compound",
  "Seated Cable Row": "compound",
  "Single-Arm Cable Row": "compound",
  "Chest-Supported DB Row": "compound",
  "Chest-Supported Barbell/T-Bar Row": "compound",
  "Barbell Deadlift": "compound",
  "DB Deadlift": "compound",
  "Straight-Arm Pulldown": "isolation",
  "Bayesian Curl": "isolation",
  "Incline DB Curl": "isolation",
  "Preacher Curl": "isolation",
  "Spider Curl": "isolation",
  "Cable Preacher Curl": "isolation",
  "DB Hammer Curl": "isolation",
  "Cable Hammer Curl": "isolation",
  "Cross-Body Hammer Curl": "isolation",
  "Barbell or EZ-Bar Curl": "isolation",
  "DB Curl": "isolation",
  "Cable Curl": "isolation",
  "Reverse Pec Deck": "isolation",
  "Face Pull": "isolation",
  "DB Reverse Fly": "isolation",
  "Cable Reverse Fly": "isolation",
  "Bent-Over DB Rear Delt Fly": "isolation",
  "Seated DB Overhead Press": "compound",
  "Seated Barbell Overhead Press": "compound",
  "Cable Overhead Press": "compound",
  "Cable Lateral Raise": "isolation",
  "DB Lateral Raise": "isolation",
  "Back Squat": "compound",
  "Front Squat": "compound",
  "Goblet Squat": "compound",
  "Leg Press": "compound",
  "Barbell RDL": "compound",
  "DB RDL": "compound",
  "Bulgarian Split Squat": "compound",
  "Walking Lunges": "compound",
  "Standing Calf Raise": "isolation",
  "Single-Leg Calf Raise": "isolation",
  "Single-Leg DB Calf Raise": "isolation",
  "Barbell Calf Raise": "isolation",
  "Leg Extension Machine": "isolation",
  "Leg Curl Machine": "isolation",
  "Hip Abductor Machine": "isolation",
  "Hip Adductor Machine": "isolation"
};
function getRepRange(exerciseName) {
  const t = REP_RANGE_TYPE[exerciseName];
  return t ? RANGE_BY_TYPE[t] : null;
}
function getMuscleStatus(exerciseName) {
  const map = MUSCLE_MAP[exerciseName];
  const status = {};
  if (!map) return status;
  (map.secondary || []).forEach((m) => {
    status[m] = "secondary";
  });
  (map.primary || []).forEach((m) => {
    status[m] = "primary";
  });
  return status;
}
function regionFill(status) {
  if (status === "primary") return "var(--accent)";
  if (status === "secondary") return "rgba(214,41,59,0.45)";
  return "var(--border)";
}
function BodyFront({ status }) {
  const f = (key) => regionFill(status[key]);
  const base = { fill: "var(--surface-2)", stroke: "var(--border)", strokeWidth: 1 };
  return /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 100 220", width: "52", height: "114", "aria-label": "Front muscles worked" }, /* @__PURE__ */ React.createElement("circle", __spreadValues({ cx: "50", cy: "14", r: "11" }, base)), /* @__PURE__ */ React.createElement("path", __spreadValues({ d: "M35 30 L65 30 L72 95 L28 95 Z" }, base)), /* @__PURE__ */ React.createElement("path", __spreadValues({ d: "M28 95 L38 100 L34 210 L26 210 L24 105 Z" }, base)), /* @__PURE__ */ React.createElement("path", __spreadValues({ d: "M72 95 L62 100 L66 210 L74 210 L76 105 Z" }, base)), /* @__PURE__ */ React.createElement("path", __spreadValues({ d: "M35 32 L20 38 L18 100 L28 100 L32 45 Z" }, base)), /* @__PURE__ */ React.createElement("path", __spreadValues({ d: "M65 32 L80 38 L82 100 L72 100 L68 45 Z" }, base)), /* @__PURE__ */ React.createElement("ellipse", { cx: "39", cy: "48", rx: "10", ry: "8", fill: f("chest") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "61", cy: "48", rx: "10", ry: "8", fill: f("chest") }), /* @__PURE__ */ React.createElement("circle", { cx: "26", cy: "40", r: "6", fill: f("frontDelt") }), /* @__PURE__ */ React.createElement("circle", { cx: "74", cy: "40", r: "6", fill: f("frontDelt") }), /* @__PURE__ */ React.createElement("circle", { cx: "21", cy: "35", r: "4", fill: f("sideDelt") }), /* @__PURE__ */ React.createElement("circle", { cx: "79", cy: "35", r: "4", fill: f("sideDelt") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "22", cy: "65", rx: "5", ry: "11", fill: f("biceps") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "78", cy: "65", rx: "5", ry: "11", fill: f("biceps") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "20", cy: "90", rx: "4", ry: "10", fill: f("forearm") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "80", cy: "90", rx: "4", ry: "10", fill: f("forearm") }), /* @__PURE__ */ React.createElement("rect", { x: "41", y: "62", width: "18", height: "26", rx: "4", fill: f("abs") }), /* @__PURE__ */ React.createElement("rect", { x: "33", y: "65", width: "6", height: "20", rx: "2", fill: f("obliques") }), /* @__PURE__ */ React.createElement("rect", { x: "61", y: "65", width: "6", height: "20", rx: "2", fill: f("obliques") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "42", cy: "140", rx: "9", ry: "26", fill: f("quads") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "58", cy: "140", rx: "9", ry: "26", fill: f("quads") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "50", cy: "138", rx: "4", ry: "20", fill: f("adductors") }));
}
function BodyBack({ status }) {
  const f = (key) => regionFill(status[key]);
  const base = { fill: "var(--surface-2)", stroke: "var(--border)", strokeWidth: 1 };
  return /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 100 220", width: "52", height: "114", "aria-label": "Back muscles worked" }, /* @__PURE__ */ React.createElement("circle", __spreadValues({ cx: "50", cy: "14", r: "11" }, base)), /* @__PURE__ */ React.createElement("path", __spreadValues({ d: "M35 30 L65 30 L72 95 L28 95 Z" }, base)), /* @__PURE__ */ React.createElement("path", __spreadValues({ d: "M28 95 L38 100 L34 210 L26 210 L24 105 Z" }, base)), /* @__PURE__ */ React.createElement("path", __spreadValues({ d: "M72 95 L62 100 L66 210 L74 210 L76 105 Z" }, base)), /* @__PURE__ */ React.createElement("path", __spreadValues({ d: "M35 32 L20 38 L18 100 L28 100 L32 45 Z" }, base)), /* @__PURE__ */ React.createElement("path", __spreadValues({ d: "M65 32 L80 38 L82 100 L72 100 L68 45 Z" }, base)), /* @__PURE__ */ React.createElement("path", { d: "M42 26 L58 26 L68 44 L32 44 Z", fill: f("traps") }), /* @__PURE__ */ React.createElement("circle", { cx: "26", cy: "40", r: "6", fill: f("rearDelt") }), /* @__PURE__ */ React.createElement("circle", { cx: "74", cy: "40", r: "6", fill: f("rearDelt") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "22", cy: "65", rx: "5", ry: "11", fill: f("triceps") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "78", cy: "65", rx: "5", ry: "11", fill: f("triceps") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "33", cy: "62", rx: "8", ry: "15", fill: f("lats") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "67", cy: "62", rx: "8", ry: "15", fill: f("lats") }), /* @__PURE__ */ React.createElement("rect", { x: "43", y: "55", width: "14", height: "20", rx: "4", fill: f("midBack") }), /* @__PURE__ */ React.createElement("rect", { x: "42", y: "80", width: "16", height: "14", rx: "3", fill: f("lowerBack") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "41", cy: "108", rx: "10", ry: "9", fill: f("glutes") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "59", cy: "108", rx: "10", ry: "9", fill: f("glutes") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "31", cy: "110", rx: "4", ry: "9", fill: f("abductors") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "69", cy: "110", rx: "4", ry: "9", fill: f("abductors") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "42", cy: "145", rx: "8", ry: "20", fill: f("hamstrings") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "58", cy: "145", rx: "8", ry: "20", fill: f("hamstrings") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "42", cy: "185", rx: "6", ry: "17", fill: f("calves") }), /* @__PURE__ */ React.createElement("ellipse", { cx: "58", cy: "185", rx: "6", ry: "17", fill: f("calves") }));
}
const REGION_LABELS = { long: "Long Head", lateral: "Lateral Head", medial: "Medial Head", short: "Short Head", brachialis: "Brachialis", upper: "Upper", middle: "Middle", lower: "Lower" };
function TricepZoom({ region }) {
  const c = (r) => r === region ? "var(--accent)" : "var(--border)";
  return /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 100 150", width: "46", height: "69", "aria-label": "Tricep head detail" }, /* @__PURE__ */ React.createElement("path", { d: "M28 8 L72 8 L78 100 L60 140 L40 140 L22 100 Z", fill: "var(--surface)", stroke: "var(--border)", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("path", { d: "M33 14 L58 12 L60 118 L36 122 Z", fill: c("long") }), /* @__PURE__ */ React.createElement("path", { d: "M58 12 L68 18 L70 95 L60 105 Z", fill: c("lateral") }), /* @__PURE__ */ React.createElement("path", { d: "M48 100 L64 98 L60 132 L46 128 Z", fill: c("medial") }));
}
function BicepZoom({ region }) {
  const c = (r) => r === region ? "var(--accent)" : "var(--border)";
  return /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 100 150", width: "46", height: "69", "aria-label": "Bicep head detail" }, /* @__PURE__ */ React.createElement("path", { d: "M28 8 L72 8 L78 100 L60 140 L40 140 L22 100 Z", fill: "var(--surface)", stroke: "var(--border)", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("path", { d: "M30 16 L52 13 L50 115 L32 108 Z", fill: c("short") }), /* @__PURE__ */ React.createElement("path", { d: "M52 13 L70 18 L66 108 L50 115 Z", fill: c("long") }), /* @__PURE__ */ React.createElement("path", { d: "M66 85 L78 90 L72 128 L62 122 Z", fill: c("brachialis") }));
}
function ChestZoom({ region }) {
  const c = (r) => r === region ? "var(--accent)" : "var(--border)";
  return /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 120 90", width: "62", height: "47", "aria-label": "Chest region detail" }, /* @__PURE__ */ React.createElement("path", { d: "M60 8 L15 12 L18 34 L60 32 Z", fill: c("upper") }), /* @__PURE__ */ React.createElement("path", { d: "M60 32 L18 34 L20 58 L60 58 Z", fill: c("middle") }), /* @__PURE__ */ React.createElement("path", { d: "M60 58 L20 58 L26 78 L60 78 Z", fill: c("lower") }), /* @__PURE__ */ React.createElement("path", { d: "M60 8 L105 12 L102 34 L60 32 Z", fill: c("upper") }), /* @__PURE__ */ React.createElement("path", { d: "M60 32 L102 34 L100 58 L60 58 Z", fill: c("middle") }), /* @__PURE__ */ React.createElement("path", { d: "M60 58 L100 58 L94 78 L60 78 Z", fill: c("lower") }));
}
function MuscleDetail({ detail }) {
  if (!detail) return null;
  const ZoomComp = detail.muscle === "triceps" ? TricepZoom : detail.muscle === "biceps" ? BicepZoom : detail.muscle === "chest" ? ChestZoom : null;
  if (!ZoomComp) return null;
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "8px 10px", background: "var(--surface-2)", borderRadius: 8 } }, /* @__PURE__ */ React.createElement(ZoomComp, { region: detail.region }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, color: "var(--text)", textTransform: "capitalize" } }, detail.muscle, " \u2014 ", REGION_LABELS[detail.region]), /* @__PURE__ */ React.createElement("div", null, "Zoomed detail of the specific head/region this exercise targets")));
}
function WorkoutTracker() {
  const [view, setView] = useState("log");
  const [day, setDay] = useState(todayName());
  const [openSlot, setOpenSlot] = useState(null);
  const [draft, setDraft] = useState({});
  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [storageError, setStorageError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [customDraft, setCustomDraft] = useState({});
  const [openCustomId, setOpenCustomId] = useState(null);
  const [removedFromSlots, setRemovedFromSlots] = useState({});
  const [removedLoaded, setRemovedLoaded] = useState(false);
  const [addedDraft, setAddedDraft] = useState({});
  const [openAddedId, setOpenAddedId] = useState(null);
  const [addFlow, setAddFlow] = useState(null);
  useEffect(() => {
    let cancelled = false;
    async function loadRemoved() {
      try {
        const res = await storage.get("workout-removed-exercises", false);
        if (!cancelled && res && res.value) setRemovedFromSlots(JSON.parse(res.value));
      } catch (e) {
      } finally {
        if (!cancelled) setRemovedLoaded(true);
      }
    }
    loadRemoved();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await storage.get("workout-history", false);
        if (!cancelled && res && res.value) setHistory(JSON.parse(res.value));
      } catch (e) {
      } finally {
        if (!cancelled) setHistoryLoaded(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);
  const dayData = WORKOUT_DATA[day];
  function availableExercises(slotName, exercises) {
    const removed = removedFromSlots[slotName] || [];
    const filtered = exercises.filter((ex) => !removed.includes(ex.name));
    return filtered.length > 0 ? filtered : exercises;
  }
  async function removeExerciseFromLibrary(slotName, exerciseName, allExercises, onReset) {
    const updated = __spreadProps(__spreadValues({}, removedFromSlots), { [slotName]: [...removedFromSlots[slotName] || [], exerciseName] });
    setRemovedFromSlots(updated);
    try {
      await storage.set("workout-removed-exercises", JSON.stringify(updated), false);
    } catch (e) {
    }
    const remaining = allExercises.filter((ex) => !(updated[slotName] || []).includes(ex.name));
    if (remaining.length > 0 && onReset) onReset(remaining[0].name);
  }
  function slotDraftOf(slotName) {
    const avail = availableExercises(slotName, getSlot(day, slotName).exercises);
    return draft[slotName] || { exercise: avail[0].name, notes: "", sets: [emptyRow()] };
  }
  function setExercise(slotName, exerciseName) {
    setDraft((prev) => {
      const existing = prev[slotName] || { notes: "", sets: [emptyRow()] };
      return __spreadProps(__spreadValues({}, prev), { [slotName]: __spreadProps(__spreadValues({}, existing), { exercise: exerciseName }) });
    });
  }
  function setNotes(slotName, notes) {
    setDraft((prev) => {
      const existing = prev[slotName] || slotDraftOf(slotName);
      return __spreadProps(__spreadValues({}, prev), { [slotName]: __spreadProps(__spreadValues({}, existing), { notes }) });
    });
  }
  function updateRow(slotName, index, field, value) {
    setDraft((prev) => {
      const existing = prev[slotName] || slotDraftOf(slotName);
      const sets = existing.sets.map((s, i) => i === index ? __spreadProps(__spreadValues({}, s), { [field]: value }) : s);
      return __spreadProps(__spreadValues({}, prev), { [slotName]: __spreadProps(__spreadValues({}, existing), { sets }) });
    });
  }
  function addRow(slotName) {
    setDraft((prev) => {
      const existing = prev[slotName] || slotDraftOf(slotName);
      return __spreadProps(__spreadValues({}, prev), { [slotName]: __spreadProps(__spreadValues({}, existing), { sets: [...existing.sets, emptyRow()] }) });
    });
  }
  function removeRow(slotName, index) {
    setDraft((prev) => {
      const existing = prev[slotName];
      if (!existing) return prev;
      const sets = existing.sets.filter((_, i) => i !== index);
      return __spreadProps(__spreadValues({}, prev), { [slotName]: __spreadProps(__spreadValues({}, existing), { sets: sets.length ? sets : [emptyRow()] }) });
    });
  }
  function addExtra(slotName, index) {
    setDraft((prev) => {
      const existing = prev[slotName] || slotDraftOf(slotName);
      const sets = existing.sets.map((s, i) => i === index ? __spreadProps(__spreadValues({}, s), { extra: emptyExtra() }) : s);
      return __spreadProps(__spreadValues({}, prev), { [slotName]: __spreadProps(__spreadValues({}, existing), { sets }) });
    });
  }
  function updateExtra(slotName, index, field, value) {
    setDraft((prev) => {
      const existing = prev[slotName] || slotDraftOf(slotName);
      const sets = existing.sets.map((s, i) => i === index ? __spreadProps(__spreadValues({}, s), { extra: __spreadProps(__spreadValues({}, s.extra), { [field]: value }) }) : s);
      return __spreadProps(__spreadValues({}, prev), { [slotName]: __spreadProps(__spreadValues({}, existing), { sets }) });
    });
  }
  function removeExtra(slotName, index) {
    setDraft((prev) => {
      const existing = prev[slotName];
      if (!existing) return prev;
      const sets = existing.sets.map((s, i) => i === index ? __spreadProps(__spreadValues({}, s), { extra: null }) : s);
      return __spreadProps(__spreadValues({}, prev), { [slotName]: __spreadProps(__spreadValues({}, existing), { sets }) });
    });
  }
  const customList = customDraft[day] || [];
  function addCustomExercise() {
    const id = `custom-${Date.now()}`;
    setCustomDraft((prev) => __spreadProps(__spreadValues({}, prev), { [day]: [...prev[day] || [], { id, exercise: "", notes: "", sets: [emptyRow()] }] }));
    setOpenCustomId(id);
  }
  function updateCustomField(id, field, value) {
    setCustomDraft((prev) => __spreadProps(__spreadValues({}, prev), { [day]: (prev[day] || []).map((e) => e.id === id ? __spreadProps(__spreadValues({}, e), { [field]: value }) : e) }));
  }
  function updateCustomRow(id, index, field, value) {
    setCustomDraft((prev) => __spreadProps(__spreadValues({}, prev), {
      [day]: (prev[day] || []).map((e) => e.id === id ? __spreadProps(__spreadValues({}, e), { sets: e.sets.map((s, i) => i === index ? __spreadProps(__spreadValues({}, s), { [field]: value }) : s) }) : e)
    }));
  }
  function addCustomRow(id) {
    setCustomDraft((prev) => __spreadProps(__spreadValues({}, prev), { [day]: (prev[day] || []).map((e) => e.id === id ? __spreadProps(__spreadValues({}, e), { sets: [...e.sets, emptyRow()] }) : e) }));
  }
  function removeCustomRow(id, index) {
    setCustomDraft((prev) => __spreadProps(__spreadValues({}, prev), {
      [day]: (prev[day] || []).map((e) => {
        if (e.id !== id) return e;
        const sets = e.sets.filter((_, i) => i !== index);
        return __spreadProps(__spreadValues({}, e), { sets: sets.length ? sets : [emptyRow()] });
      })
    }));
  }
  function addCustomExtra(id, index) {
    setCustomDraft((prev) => __spreadProps(__spreadValues({}, prev), {
      [day]: (prev[day] || []).map((e) => e.id === id ? __spreadProps(__spreadValues({}, e), { sets: e.sets.map((s, i) => i === index ? __spreadProps(__spreadValues({}, s), { extra: emptyExtra() }) : s) }) : e)
    }));
  }
  function updateCustomExtra(id, index, field, value) {
    setCustomDraft((prev) => __spreadProps(__spreadValues({}, prev), {
      [day]: (prev[day] || []).map((e) => e.id === id ? __spreadProps(__spreadValues({}, e), { sets: e.sets.map((s, i) => i === index ? __spreadProps(__spreadValues({}, s), { extra: __spreadProps(__spreadValues({}, s.extra), { [field]: value }) }) : s) }) : e)
    }));
  }
  function removeCustomExtra(id, index) {
    setCustomDraft((prev) => __spreadProps(__spreadValues({}, prev), {
      [day]: (prev[day] || []).map((e) => e.id === id ? __spreadProps(__spreadValues({}, e), { sets: e.sets.map((s, i) => i === index ? __spreadProps(__spreadValues({}, s), { extra: null }) : s) }) : e)
    }));
  }
  function removeCustomExercise(id) {
    setCustomDraft((prev) => __spreadProps(__spreadValues({}, prev), { [day]: (prev[day] || []).filter((e) => e.id !== id) }));
    if (openCustomId === id) setOpenCustomId(null);
  }
  const customSuggestions = useMemo(() => {
    const set = /* @__PURE__ */ new Set();
    history.forEach((s) => (s.blocks || []).forEach((b) => {
      if (b.slot === "Custom" && b.exercise) set.add(b.exercise);
    }));
    return Array.from(set).sort();
  }, [history]);
  const addedList = addedDraft[day] || [];
  function addAddedExercise(slotName, exerciseName) {
    const id = `added-${Date.now()}`;
    setAddedDraft((prev) => __spreadProps(__spreadValues({}, prev), { [day]: [...prev[day] || [], { id, slotName, exercise: exerciseName, notes: "", sets: [emptyRow()] }] }));
    setOpenAddedId(id);
  }
  function setAddedExercise(id, exerciseName) {
    setAddedDraft((prev) => __spreadProps(__spreadValues({}, prev), { [day]: (prev[day] || []).map((e) => e.id === id ? __spreadProps(__spreadValues({}, e), { exercise: exerciseName }) : e) }));
  }
  function updateAddedField(id, field, value) {
    setAddedDraft((prev) => __spreadProps(__spreadValues({}, prev), { [day]: (prev[day] || []).map((e) => e.id === id ? __spreadProps(__spreadValues({}, e), { [field]: value }) : e) }));
  }
  function updateAddedRow(id, index, field, value) {
    setAddedDraft((prev) => __spreadProps(__spreadValues({}, prev), {
      [day]: (prev[day] || []).map((e) => e.id === id ? __spreadProps(__spreadValues({}, e), { sets: e.sets.map((s, i) => i === index ? __spreadProps(__spreadValues({}, s), { [field]: value }) : s) }) : e)
    }));
  }
  function addAddedRow(id) {
    setAddedDraft((prev) => __spreadProps(__spreadValues({}, prev), { [day]: (prev[day] || []).map((e) => e.id === id ? __spreadProps(__spreadValues({}, e), { sets: [...e.sets, emptyRow()] }) : e) }));
  }
  function removeAddedRow(id, index) {
    setAddedDraft((prev) => __spreadProps(__spreadValues({}, prev), {
      [day]: (prev[day] || []).map((e) => {
        if (e.id !== id) return e;
        const sets = e.sets.filter((_, i) => i !== index);
        return __spreadProps(__spreadValues({}, e), { sets: sets.length ? sets : [emptyRow()] });
      })
    }));
  }
  function addAddedExtra(id, index) {
    setAddedDraft((prev) => __spreadProps(__spreadValues({}, prev), {
      [day]: (prev[day] || []).map((e) => e.id === id ? __spreadProps(__spreadValues({}, e), { sets: e.sets.map((s, i) => i === index ? __spreadProps(__spreadValues({}, s), { extra: emptyExtra() }) : s) }) : e)
    }));
  }
  function updateAddedExtra(id, index, field, value) {
    setAddedDraft((prev) => __spreadProps(__spreadValues({}, prev), {
      [day]: (prev[day] || []).map((e) => e.id === id ? __spreadProps(__spreadValues({}, e), { sets: e.sets.map((s, i) => i === index ? __spreadProps(__spreadValues({}, s), { extra: __spreadProps(__spreadValues({}, s.extra), { [field]: value }) }) : s) }) : e)
    }));
  }
  function removeAddedExtra(id, index) {
    setAddedDraft((prev) => __spreadProps(__spreadValues({}, prev), {
      [day]: (prev[day] || []).map((e) => e.id === id ? __spreadProps(__spreadValues({}, e), { sets: e.sets.map((s, i) => i === index ? __spreadProps(__spreadValues({}, s), { extra: null }) : s) }) : e)
    }));
  }
  function removeAddedExercise(id) {
    setAddedDraft((prev) => __spreadProps(__spreadValues({}, prev), { [day]: (prev[day] || []).filter((e) => e.id !== id) }));
    if (openAddedId === id) setOpenAddedId(null);
  }
  function startAddFlow() {
    setAddFlow({ step: "choose" });
  }
  function cancelAddFlow() {
    setAddFlow(null);
  }
  function addFlowBack() {
    setAddFlow((prev) => {
      if (!prev) return null;
      if (prev.step === "body") return { step: "choose" };
      if (prev.step === "part") return { step: "body" };
      if (prev.step === "exercise") return BODY_PARTS[prev.bodyPart].length > 1 ? { step: "part", bodyPart: prev.bodyPart } : { step: "body" };
      return null;
    });
  }
  function chooseNew() {
    addCustomExercise();
    setAddFlow(null);
  }
  function chooseExisting() {
    setAddFlow({ step: "body" });
  }
  function chooseBodyPart(part) {
    const parts = BODY_PARTS[part];
    if (parts.length === 1) setAddFlow({ step: "exercise", bodyPart: part, slotName: parts[0] });
    else setAddFlow({ step: "part", bodyPart: part });
  }
  function chooseSlotName(slotName) {
    setAddFlow((prev) => __spreadProps(__spreadValues({}, prev), { step: "exercise", slotName }));
  }
  function chooseLibraryExercise(slotName, exerciseName) {
    addAddedExercise(slotName, exerciseName);
    setAddFlow(null);
  }
  function extractExtra(row) {
    const ex = row.extra;
    if (ex && ex.exercise && ex.exercise.trim() !== "" && ex.weight !== "" && ex.weight != null && ex.value !== "" && ex.value != null) {
      return { type: ex.type || "superset", exercise: ex.exercise.trim(), weight: Number(ex.weight), value: Number(ex.value) };
    }
    return void 0;
  }
  const sessionBlocks = useMemo(() => {
    const out = [];
    Object.entries(draft).forEach(([slotName, slotDraft]) => {
      if (!slotDraft) return;
      const type = getExerciseType(day, slotName, slotDraft.exercise);
      const filledSets = slotDraft.sets.filter((s) => type === "time" ? s.value !== "" && s.value != null : s.weight !== "" && s.weight != null && s.value !== "" && s.value != null).map((s) => {
        const base = { weight: s.weight === "" || s.weight == null ? 0 : Number(s.weight), value: Number(s.value) };
        const extra = extractExtra(s);
        return extra ? __spreadProps(__spreadValues({}, base), { extra }) : base;
      });
      if (filledSets.length > 0) {
        out.push({ slot: slotName, exercise: slotDraft.exercise, type, notes: slotDraft.notes || "", sets: filledSets });
      }
    });
    (customDraft[day] || []).forEach((entry) => {
      const name = (entry.exercise || "").trim();
      if (!name) return;
      const filledSets = entry.sets.filter((s) => s.weight !== "" && s.weight != null && s.value !== "" && s.value != null).map((s) => {
        const base = { weight: Number(s.weight), value: Number(s.value) };
        const extra = extractExtra(s);
        return extra ? __spreadProps(__spreadValues({}, base), { extra }) : base;
      });
      if (filledSets.length > 0) {
        out.push({ slot: "Custom", exercise: name, type: "reps", notes: entry.notes || "", sets: filledSets, custom: true });
      }
    });
    (addedDraft[day] || []).forEach((entry) => {
      const exObj = getExerciseFromLibrary(entry.slotName, entry.exercise);
      const type = (exObj == null ? void 0 : exObj.type) || "reps";
      const filledSets = entry.sets.filter((s) => type === "time" ? s.value !== "" && s.value != null : s.weight !== "" && s.weight != null && s.value !== "" && s.value != null).map((s) => {
        const base = { weight: s.weight === "" || s.weight == null ? 0 : Number(s.weight), value: Number(s.value) };
        const extra = extractExtra(s);
        return extra ? __spreadProps(__spreadValues({}, base), { extra }) : base;
      });
      if (filledSets.length > 0) {
        out.push({ slot: entry.slotName, exercise: entry.exercise, type, notes: entry.notes || "", sets: filledSets, addedFromPlan: true });
      }
    });
    return out;
  }, [draft, day, customDraft, addedDraft]);
  const sessionVolume = useMemo(
    () => sessionBlocks.reduce((sum, b) => {
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
    var _a;
    return ((_a = sessionBlocks.find((b) => b.slot === slotName)) == null ? void 0 : _a.sets.length) || 0;
  }
  function discardSession() {
    setDraft({});
    setCustomDraft((prev) => __spreadProps(__spreadValues({}, prev), { [day]: [] }));
    setOpenCustomId(null);
    setAddedDraft((prev) => __spreadProps(__spreadValues({}, prev), { [day]: [] }));
    setOpenAddedId(null);
    setAddFlow(null);
  }
  async function saveWorkout() {
    if (sessionBlocks.length === 0) return;
    setSaving(true);
    setStorageError(null);
    const session = { id: `${Date.now()}`, date: todayISO(), day, blocks: sessionBlocks };
    try {
      const updated = [...history, session];
      const res = await storage.set("workout-history", JSON.stringify(updated), false);
      if (res) {
        setHistory(updated);
        setDraft({});
        setCustomDraft((prev) => __spreadProps(__spreadValues({}, prev), { [day]: [] }));
        setOpenCustomId(null);
        setAddedDraft((prev) => __spreadProps(__spreadValues({}, prev), { [day]: [] }));
        setOpenAddedId(null);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1800);
      } else {
        setStorageError("Couldn't save \u2014 try again.");
      }
    } catch (e) {
      setStorageError("Couldn't save \u2014 try again.");
    } finally {
      setSaving(false);
    }
  }
  async function deleteSession(id) {
    const updated = history.filter((s) => s.id !== id);
    try {
      const res = await storage.set("workout-history", JSON.stringify(updated), false);
      if (res) setHistory(updated);
    } catch (e) {
      setStorageError("Couldn't delete \u2014 try again.");
    }
  }
  function fmtSetsList(block) {
    return block.sets.map((s) => {
      const mainStr = block.type === "time" ? s.weight > 0 ? `+${s.weight}\xD7${s.value}s` : `${s.value}s` : `${s.weight}\xD7${s.value}`;
      if (s.extra) {
        const tag = s.extra.type === "superset" ? "SS" : "DS";
        return `${mainStr} [${tag}: ${s.extra.exercise} ${s.extra.weight}\xD7${s.extra.value}]`;
      }
      return mainStr;
    }).join(", ");
  }
  function findBestSet(sets) {
    if (!sets || sets.length === 0) return null;
    return sets.reduce((best, s) => {
      if (!best) return s;
      if (s.weight > best.weight) return s;
      if (s.weight === best.weight && s.value > best.value) return s;
      return best;
    }, null);
  }
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
  return /* @__PURE__ */ React.createElement("div", { style: { background: "var(--bg)", minHeight: "100%", color: "var(--text)", fontFamily: "'Inter', sans-serif" } }, /* @__PURE__ */ React.createElement("style", null, `
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
        }
        .brand { font-family: 'Metal Mania', cursive; letter-spacing: 0.02em; }
        .display { font-family: 'Oswald', sans-serif; font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase; }
        .tabular { font-variant-numeric: tabular-nums; }
        select:focus, input:focus, textarea:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
        textarea { font-family: inherit; resize: none; }
        .flash-pop { animation: pop 0.4s ease; }
        @keyframes pop { 0% { transform: scale(1); } 40% { transform: scale(1.06); } 100% { transform: scale(1); } }
      `), /* @__PURE__ */ React.createElement("div", { style: { position: "sticky", top: 0, zIndex: 20, background: "var(--bg)", borderBottom: "1px solid var(--border)", paddingTop: "env(safe-area-inset-top)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement(Dumbbell, { size: 20, color: "var(--accent)" }), /* @__PURE__ */ React.createElement("span", { className: "brand", style: { fontSize: 26, lineHeight: 1 } }, "IRON LOG")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, background: "var(--surface)", padding: 3, borderRadius: 10, border: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setView("log"), style: { padding: "6px 12px", borderRadius: 7, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", background: view === "log" ? "var(--accent)" : "transparent", color: view === "log" ? "var(--on-accent)" : "var(--text-muted)" } }, "Log"), /* @__PURE__ */ React.createElement("button", { onClick: () => setView("history"), style: { padding: "6px 12px", borderRadius: 7, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, background: view === "history" ? "var(--accent)" : "transparent", color: view === "history" ? "var(--on-accent)" : "var(--text-muted)" } }, /* @__PURE__ */ React.createElement(HistoryIcon, { size: 13 }), " History"))), view === "log" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, padding: "0 16px 12px", overflowX: "auto" } }, DAY_ORDER.map((d) => /* @__PURE__ */ React.createElement("button", { key: d, onClick: () => {
    setDay(d);
    setOpenSlot(null);
  }, style: { flex: "0 0 auto", padding: "8px 14px", borderRadius: 10, cursor: "pointer", border: d === day ? "1px solid var(--accent)" : "1px solid var(--border)", background: d === day ? "var(--accent-dim)" : "var(--surface)", color: d === day ? "var(--text)" : "var(--text-muted)" } }, /* @__PURE__ */ React.createElement("div", { className: "display", style: { fontSize: 13 } }, d.slice(0, 3)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "var(--text-muted)" } }, WORKOUT_DATA[d].label)))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 16px 12px" } }, /* @__PURE__ */ React.createElement("div", { className: "display", style: { fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.08em" } }, dayData.label, " \xB7 ", dayData.subtitle), /* @__PURE__ */ React.createElement("div", { key: `${sessionVolume}-${sessionHoldTime}`, className: sessionBlocks.length > 0 ? "flash-pop" : "", style: { display: "flex", alignItems: "baseline", gap: 10 } }, sessionHoldTime > 0 && /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "baseline", gap: 4 } }, /* @__PURE__ */ React.createElement("span", { className: "display tabular", style: { fontSize: 16, color: "var(--time)" } }, sessionHoldTime), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase" } }, "s hold")), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "baseline", gap: 5 } }, /* @__PURE__ */ React.createElement("span", { className: "display tabular", style: { fontSize: 22, color: "var(--accent)" } }, sessionVolume.toLocaleString()), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" } }, "lb vol")))))), view === "log" ? /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 16px 120px" } }, dayData.slots.map((slot) => {
    const isOpen = openSlot === slot.name;
    const sd = slotDraftOf(slot.name);
    const availableEx = availableExercises(slot.name, slot.exercises);
    const type = getExerciseType(day, slot.name, sd.exercise);
    const equip = getExerciseEquip(day, slot.name, sd.exercise);
    const weightOptions = weightOptionsFor(equip);
    const count = countForSlot(slot.name);
    const prevBest = getPreviousBest(sd.exercise);
    const repRange = getRepRange(sd.exercise);
    const shouldBumpWeight = prevBest && prevBest.type === "reps" && repRange && prevBest.value >= repRange[1];
    return /* @__PURE__ */ React.createElement("div", { key: slot.name, style: { marginBottom: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setOpenSlot(isOpen ? null : slot.name), style: { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 14px", background: "transparent", border: "none", cursor: "pointer", color: "var(--text)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 600 } }, slot.name), count > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, background: type === "time" ? "var(--time-dim)" : "var(--accent-dim)", color: type === "time" ? "var(--time)" : "var(--accent)", borderRadius: 999, padding: "1px 8px" } }, count, " set", count > 1 ? "s" : "")), /* @__PURE__ */ React.createElement(ChevronDown, { size: 16, color: "var(--text-muted)", style: { transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" } })), isOpen && /* @__PURE__ */ React.createElement("div", { style: { padding: "0 14px 14px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 4 } }, /* @__PURE__ */ React.createElement("select", { value: sd.exercise, onChange: (e) => setExercise(slot.name, e.target.value), style: { flex: 1, minWidth: 0, padding: "9px 10px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13 } }, availableEx.map((ex) => /* @__PURE__ */ React.createElement("option", { key: ex.name, value: ex.name }, ex.name, ex.type === "time" ? " (timed)" : ""))), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => removeExerciseFromLibrary(slot.name, sd.exercise, slot.exercises, (name) => setExercise(slot.name, name)),
        disabled: availableEx.length <= 1,
        title: "Remove this exercise from the plan",
        style: { flexShrink: 0, width: 38, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", cursor: availableEx.length <= 1 ? "default" : "pointer", opacity: availableEx.length <= 1 ? 0.3 : 1 }
      },
      /* @__PURE__ */ React.createElement(Trash2, { size: 14, color: "var(--text-muted)" })
    )), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: "var(--text-muted)", marginBottom: 8 } }, equip, " \xB7 weights in ", FIVE_LB_EQUIP.has(equip) ? "5 lb" : "2.5 lb", " steps"), (() => {
      var _a;
      const muscleStatus = getMuscleStatus(sd.exercise);
      const detail = (_a = MUSCLE_MAP[sd.exercise]) == null ? void 0 : _a.detail;
      return Object.keys(muscleStatus).length > 0 ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 10, padding: "8px 10px", background: "var(--surface-2)", borderRadius: 8 } }, /* @__PURE__ */ React.createElement(BodyFront, { status: muscleStatus }), /* @__PURE__ */ React.createElement(BodyBack, { status: muscleStatus }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 5, fontSize: 10, color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, borderRadius: 99, background: "var(--accent)", display: "inline-block", flexShrink: 0 } }), " Primary"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, borderRadius: 99, background: "rgba(214,41,59,0.45)", display: "inline-block", flexShrink: 0 } }), " Secondary"))), /* @__PURE__ */ React.createElement(MuscleDetail, { detail })) : null;
    })(), prevBest && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, fontSize: 11.5, color: "var(--text-muted)", marginBottom: 10, padding: "7px 9px", background: "var(--surface-2)", borderRadius: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(HistoryIcon, { size: 11, style: { flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", null, "Last: ", /* @__PURE__ */ React.createElement("span", { className: "tabular", style: { color: "var(--text)", fontWeight: 600 } }, prevBest.type === "time" ? prevBest.weight > 0 ? `+${prevBest.weight} lb \xD7 ${prevBest.value}s` : `${prevBest.value}s` : `${prevBest.weight} lb \xD7 ${prevBest.value}`), " \xB7 ", fmtDate(prevBest.date))), shouldBumpWeight && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 5, color: "var(--accent)", fontWeight: 600, paddingLeft: 17 } }, /* @__PURE__ */ React.createElement(TrendingUp, { size: 11, style: { flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", null, "Hit top of the ", repRange[0], "\u2013", repRange[1], " range \u2014 bump the weight this time"))), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        rows: 2,
        placeholder: "Notes for this exercise (form cues, adjustments...)",
        value: sd.notes || "",
        onChange: (e) => setNotes(slot.name, e.target.value),
        style: { width: "100%", padding: "8px 10px", marginBottom: 10, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5, lineHeight: 1.4 }
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 7 } }, sd.sets.map((row, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", flexDirection: "column", gap: 5 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 7 } }, /* @__PURE__ */ React.createElement("span", { className: "tabular", style: { fontSize: 11, color: "var(--text-muted)", width: 34, flexShrink: 0 } }, "Set ", i + 1), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: row.weight,
        onChange: (e) => updateRow(slot.name, i, "weight", e.target.value),
        style: { flex: 1, minWidth: 0, padding: "9px 6px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: row.weight === "" ? "var(--text-muted)" : "var(--text)", fontSize: 13 }
      },
      /* @__PURE__ */ React.createElement("option", { value: "" }, type === "time" ? "Wt (opt)" : "Weight"),
      weightOptions.map((w) => /* @__PURE__ */ React.createElement("option", { key: w, value: w }, w, " lb"))
    ), type === "time" ? /* @__PURE__ */ React.createElement("div", { style: { position: "relative", flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        inputMode: "numeric",
        placeholder: "Sec",
        value: row.value,
        onChange: (e) => updateRow(slot.name, i, "value", e.target.value),
        style: { width: "100%", padding: "9px 8px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13 }
      }
    ), /* @__PURE__ */ React.createElement(Timer, { size: 12, color: "var(--time)", style: { position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" } })) : /* @__PURE__ */ React.createElement(
      "select",
      {
        value: row.value,
        onChange: (e) => updateRow(slot.name, i, "value", e.target.value),
        style: { flex: 1, minWidth: 0, padding: "9px 6px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: row.value === "" ? "var(--text-muted)" : "var(--text)", fontSize: 13 }
      },
      /* @__PURE__ */ React.createElement("option", { value: "" }, "Reps"),
      REPS_OPTIONS.map((r) => /* @__PURE__ */ React.createElement("option", { key: r, value: r }, r))
    ), /* @__PURE__ */ React.createElement("button", { onClick: () => removeRow(slot.name, i), disabled: sd.sets.length === 1, style: { background: "none", border: "none", cursor: sd.sets.length === 1 ? "default" : "pointer", padding: 4, opacity: sd.sets.length === 1 ? 0.25 : 1, flexShrink: 0 } }, /* @__PURE__ */ React.createElement(X, { size: 14, color: "var(--text-muted)" }))), row.extra ? /* @__PURE__ */ React.createElement("div", { style: { marginLeft: 41, padding: "8px 9px", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: 8, display: "flex", flexDirection: "column", gap: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => updateExtra(slot.name, i, "type", "superset"), style: { padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer", border: row.extra.type === "superset" ? "1px solid var(--accent)" : "1px solid var(--border)", background: row.extra.type === "superset" ? "var(--accent-dim)" : "transparent", color: row.extra.type === "superset" ? "var(--accent)" : "var(--text-muted)" } }, "Superset"), /* @__PURE__ */ React.createElement("button", { onClick: () => updateExtra(slot.name, i, "type", "dropset"), style: { padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer", border: row.extra.type === "dropset" ? "1px solid var(--accent)" : "1px solid var(--border)", background: row.extra.type === "dropset" ? "var(--accent-dim)" : "transparent", color: row.extra.type === "dropset" ? "var(--accent)" : "var(--text-muted)" } }, "Drop Set")), /* @__PURE__ */ React.createElement("button", { onClick: () => removeExtra(slot.name, i), style: { background: "none", border: "none", cursor: "pointer", padding: 3 } }, /* @__PURE__ */ React.createElement(X, { size: 12, color: "var(--text-muted)" }))), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: "Exercise name",
        value: row.extra.exercise,
        onChange: (e) => updateExtra(slot.name, i, "exercise", e.target.value),
        style: { width: "100%", padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5 }
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        inputMode: "decimal",
        placeholder: "Weight",
        value: row.extra.weight,
        onChange: (e) => updateExtra(slot.name, i, "weight", e.target.value),
        style: { flex: 1, minWidth: 0, padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5 }
      }
    ), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        inputMode: "numeric",
        placeholder: "Reps",
        value: row.extra.value,
        onChange: (e) => updateExtra(slot.name, i, "value", e.target.value),
        style: { flex: 1, minWidth: 0, padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5 }
      }
    ))) : /* @__PURE__ */ React.createElement("button", { onClick: () => addExtra(slot.name, i), style: { marginLeft: 41, alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 11 } }, /* @__PURE__ */ React.createElement(Layers, { size: 11 }), " Superset / drop set")))), /* @__PURE__ */ React.createElement("button", { onClick: () => addRow(slot.name), style: { marginTop: 9, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", borderRadius: 8, background: "var(--surface-2)", border: "1px dashed var(--border)", cursor: "pointer", color: "var(--text-muted)", fontSize: 12.5, fontWeight: 600 } }, /* @__PURE__ */ React.createElement(Plus, { size: 14 }), " Add Set")));
  }), addedList.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "display", style: { fontSize: 11, color: "var(--text-muted)", margin: "14px 0 8px" } }, "Added From Plan"), addedList.map((entry) => {
    var _a;
    const isOpen = openAddedId === entry.id;
    const libraryEx = availableExercises(entry.slotName, SLOT_EXERCISE_LIBRARY[entry.slotName] || []);
    const exObj = getExerciseFromLibrary(entry.slotName, entry.exercise);
    const type = (exObj == null ? void 0 : exObj.type) || "reps";
    const equip = (exObj == null ? void 0 : exObj.equip) || "Dumbbell";
    const weightOptions = weightOptionsFor(equip);
    const filledCount = entry.sets.filter((s) => type === "time" ? s.value !== "" : s.weight !== "" && s.value !== "").length;
    const prevBest = getPreviousBest(entry.exercise);
    const repRange = getRepRange(entry.exercise);
    const shouldBumpWeight = prevBest && prevBest.type === "reps" && repRange && prevBest.value >= repRange[1];
    const muscleStatus = getMuscleStatus(entry.exercise);
    const detail = (_a = MUSCLE_MAP[entry.exercise]) == null ? void 0 : _a.detail;
    return /* @__PURE__ */ React.createElement("div", { key: entry.id, style: { marginBottom: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px 6px 14px" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setOpenAddedId(isOpen ? null : entry.id), style: { flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: "7px 0", display: "flex", flexDirection: "column", gap: 1, color: "var(--text)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: "var(--text-muted)" } }, entry.slotName), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, entry.exercise), filledCount > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, background: "var(--accent-dim)", color: "var(--accent)", borderRadius: 999, padding: "1px 8px", flexShrink: 0 } }, filledCount, " set", filledCount > 1 ? "s" : ""))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 2, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => removeAddedExercise(entry.id), style: { background: "none", border: "none", cursor: "pointer", padding: 8 } }, /* @__PURE__ */ React.createElement(Trash2, { size: 14, color: "var(--text-muted)" })), /* @__PURE__ */ React.createElement("button", { onClick: () => setOpenAddedId(isOpen ? null : entry.id), style: { background: "none", border: "none", cursor: "pointer", padding: 8 } }, /* @__PURE__ */ React.createElement(ChevronDown, { size: 16, color: "var(--text-muted)", style: { transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" } })))), isOpen && /* @__PURE__ */ React.createElement("div", { style: { padding: "0 14px 14px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 4 } }, /* @__PURE__ */ React.createElement("select", { value: entry.exercise, onChange: (e) => setAddedExercise(entry.id, e.target.value), style: { flex: 1, minWidth: 0, padding: "9px 10px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13 } }, libraryEx.map((ex) => /* @__PURE__ */ React.createElement("option", { key: ex.name, value: ex.name }, ex.name, ex.type === "time" ? " (timed)" : ""))), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => removeExerciseFromLibrary(entry.slotName, entry.exercise, SLOT_EXERCISE_LIBRARY[entry.slotName], (name) => setAddedExercise(entry.id, name)),
        disabled: libraryEx.length <= 1,
        title: "Remove this exercise from the plan",
        style: { flexShrink: 0, width: 38, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", cursor: libraryEx.length <= 1 ? "default" : "pointer", opacity: libraryEx.length <= 1 ? 0.3 : 1 }
      },
      /* @__PURE__ */ React.createElement(Trash2, { size: 14, color: "var(--text-muted)" })
    )), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: "var(--text-muted)", marginBottom: 8 } }, equip, " \xB7 weights in ", FIVE_LB_EQUIP.has(equip) ? "5 lb" : "2.5 lb", " steps"), Object.keys(muscleStatus).length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 10, padding: "8px 10px", background: "var(--surface-2)", borderRadius: 8 } }, /* @__PURE__ */ React.createElement(BodyFront, { status: muscleStatus }), /* @__PURE__ */ React.createElement(BodyBack, { status: muscleStatus }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 5, fontSize: 10, color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, borderRadius: 99, background: "var(--accent)", display: "inline-block", flexShrink: 0 } }), " Primary"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, borderRadius: 99, background: "rgba(214,41,59,0.45)", display: "inline-block", flexShrink: 0 } }), " Secondary"))), /* @__PURE__ */ React.createElement(MuscleDetail, { detail })), prevBest && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, fontSize: 11.5, color: "var(--text-muted)", marginBottom: 10, padding: "7px 9px", background: "var(--surface-2)", borderRadius: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(HistoryIcon, { size: 11, style: { flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", null, "Last: ", /* @__PURE__ */ React.createElement("span", { className: "tabular", style: { color: "var(--text)", fontWeight: 600 } }, prevBest.type === "time" ? prevBest.weight > 0 ? `+${prevBest.weight} lb \xD7 ${prevBest.value}s` : `${prevBest.value}s` : `${prevBest.weight} lb \xD7 ${prevBest.value}`), " \xB7 ", fmtDate(prevBest.date))), shouldBumpWeight && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 5, color: "var(--accent)", fontWeight: 600, paddingLeft: 17 } }, /* @__PURE__ */ React.createElement(TrendingUp, { size: 11, style: { flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", null, "Hit top of the ", repRange[0], "\u2013", repRange[1], " range \u2014 bump the weight this time"))), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        rows: 2,
        placeholder: "Notes for this exercise (form cues, adjustments...)",
        value: entry.notes || "",
        onChange: (e) => updateAddedField(entry.id, "notes", e.target.value),
        style: { width: "100%", padding: "8px 10px", marginBottom: 10, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5, lineHeight: 1.4 }
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 7 } }, entry.sets.map((row, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", flexDirection: "column", gap: 5 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 7 } }, /* @__PURE__ */ React.createElement("span", { className: "tabular", style: { fontSize: 11, color: "var(--text-muted)", width: 34, flexShrink: 0 } }, "Set ", i + 1), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: row.weight,
        onChange: (e) => updateAddedRow(entry.id, i, "weight", e.target.value),
        style: { flex: 1, minWidth: 0, padding: "9px 6px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: row.weight === "" ? "var(--text-muted)" : "var(--text)", fontSize: 13 }
      },
      /* @__PURE__ */ React.createElement("option", { value: "" }, type === "time" ? "Wt (opt)" : "Weight"),
      weightOptions.map((w) => /* @__PURE__ */ React.createElement("option", { key: w, value: w }, w, " lb"))
    ), type === "time" ? /* @__PURE__ */ React.createElement("div", { style: { position: "relative", flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        inputMode: "numeric",
        placeholder: "Sec",
        value: row.value,
        onChange: (e) => updateAddedRow(entry.id, i, "value", e.target.value),
        style: { width: "100%", padding: "9px 8px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13 }
      }
    ), /* @__PURE__ */ React.createElement(Timer, { size: 12, color: "var(--time)", style: { position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" } })) : /* @__PURE__ */ React.createElement(
      "select",
      {
        value: row.value,
        onChange: (e) => updateAddedRow(entry.id, i, "value", e.target.value),
        style: { flex: 1, minWidth: 0, padding: "9px 6px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: row.value === "" ? "var(--text-muted)" : "var(--text)", fontSize: 13 }
      },
      /* @__PURE__ */ React.createElement("option", { value: "" }, "Reps"),
      REPS_OPTIONS.map((r) => /* @__PURE__ */ React.createElement("option", { key: r, value: r }, r))
    ), /* @__PURE__ */ React.createElement("button", { onClick: () => removeAddedRow(entry.id, i), disabled: entry.sets.length === 1, style: { background: "none", border: "none", cursor: entry.sets.length === 1 ? "default" : "pointer", padding: 4, opacity: entry.sets.length === 1 ? 0.25 : 1, flexShrink: 0 } }, /* @__PURE__ */ React.createElement(X, { size: 14, color: "var(--text-muted)" }))), row.extra ? /* @__PURE__ */ React.createElement("div", { style: { marginLeft: 41, padding: "8px 9px", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: 8, display: "flex", flexDirection: "column", gap: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => updateAddedExtra(entry.id, i, "type", "superset"), style: { padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer", border: row.extra.type === "superset" ? "1px solid var(--accent)" : "1px solid var(--border)", background: row.extra.type === "superset" ? "var(--accent-dim)" : "transparent", color: row.extra.type === "superset" ? "var(--accent)" : "var(--text-muted)" } }, "Superset"), /* @__PURE__ */ React.createElement("button", { onClick: () => updateAddedExtra(entry.id, i, "type", "dropset"), style: { padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer", border: row.extra.type === "dropset" ? "1px solid var(--accent)" : "1px solid var(--border)", background: row.extra.type === "dropset" ? "var(--accent-dim)" : "transparent", color: row.extra.type === "dropset" ? "var(--accent)" : "var(--text-muted)" } }, "Drop Set")), /* @__PURE__ */ React.createElement("button", { onClick: () => removeAddedExtra(entry.id, i), style: { background: "none", border: "none", cursor: "pointer", padding: 3 } }, /* @__PURE__ */ React.createElement(X, { size: 12, color: "var(--text-muted)" }))), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: "Exercise name",
        value: row.extra.exercise,
        onChange: (e) => updateAddedExtra(entry.id, i, "exercise", e.target.value),
        style: { width: "100%", padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5 }
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        inputMode: "decimal",
        placeholder: "Weight",
        value: row.extra.weight,
        onChange: (e) => updateAddedExtra(entry.id, i, "weight", e.target.value),
        style: { flex: 1, minWidth: 0, padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5 }
      }
    ), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        inputMode: "numeric",
        placeholder: "Reps",
        value: row.extra.value,
        onChange: (e) => updateAddedExtra(entry.id, i, "value", e.target.value),
        style: { flex: 1, minWidth: 0, padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5 }
      }
    ))) : /* @__PURE__ */ React.createElement("button", { onClick: () => addAddedExtra(entry.id, i), style: { marginLeft: 41, alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 11 } }, /* @__PURE__ */ React.createElement(Layers, { size: 11 }), " Superset / drop set")))), /* @__PURE__ */ React.createElement("button", { onClick: () => addAddedRow(entry.id), style: { marginTop: 9, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", borderRadius: 8, background: "var(--surface-2)", border: "1px dashed var(--border)", cursor: "pointer", color: "var(--text-muted)", fontSize: 12.5, fontWeight: 600 } }, /* @__PURE__ */ React.createElement(Plus, { size: 14 }), " Add Set")));
  }), /* @__PURE__ */ React.createElement("datalist", { id: "custom-exercise-suggestions" }, customSuggestions.map((name) => /* @__PURE__ */ React.createElement("option", { key: name, value: name }))), customList.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "display", style: { fontSize: 11, color: "var(--text-muted)", margin: "14px 0 8px" } }, "Custom"), customList.map((entry) => {
    const isOpen = openCustomId === entry.id;
    const filledCount = entry.sets.filter((s) => s.weight !== "" && s.value !== "").length;
    return /* @__PURE__ */ React.createElement("div", { key: entry.id, style: { marginBottom: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px 6px 14px" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setOpenCustomId(isOpen ? null : entry.id), style: { flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: "7px 0", display: "flex", alignItems: "center", gap: 8, color: "var(--text)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, entry.exercise || "New Exercise"), filledCount > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, background: "var(--accent-dim)", color: "var(--accent)", borderRadius: 999, padding: "1px 8px", flexShrink: 0 } }, filledCount, " set", filledCount > 1 ? "s" : "")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 2, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => removeCustomExercise(entry.id), style: { background: "none", border: "none", cursor: "pointer", padding: 8 } }, /* @__PURE__ */ React.createElement(Trash2, { size: 14, color: "var(--text-muted)" })), /* @__PURE__ */ React.createElement("button", { onClick: () => setOpenCustomId(isOpen ? null : entry.id), style: { background: "none", border: "none", cursor: "pointer", padding: 8 } }, /* @__PURE__ */ React.createElement(ChevronDown, { size: 16, color: "var(--text-muted)", style: { transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" } })))), isOpen && /* @__PURE__ */ React.createElement("div", { style: { padding: "0 14px 14px" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        list: "custom-exercise-suggestions",
        placeholder: "Exercise name",
        value: entry.exercise,
        onChange: (e) => updateCustomField(entry.id, "exercise", e.target.value),
        style: { width: "100%", padding: "9px 10px", marginBottom: 4, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13 }
      }
    ), (() => {
      const prevCustom = entry.exercise ? getPreviousBestCustom(entry.exercise.trim()) : null;
      return prevCustom ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--text-muted)", margin: "6px 0 10px", padding: "7px 9px", background: "var(--surface-2)", borderRadius: 6 } }, /* @__PURE__ */ React.createElement(HistoryIcon, { size: 11, style: { flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", null, "Last: ", /* @__PURE__ */ React.createElement("span", { className: "tabular", style: { color: "var(--text)", fontWeight: 600 } }, prevCustom.weight, " lb \xD7 ", prevCustom.value), " \xB7 ", fmtDate(prevCustom.date))) : /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 10 } });
    })(), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        rows: 2,
        placeholder: "Notes for this exercise (form cues, adjustments...)",
        value: entry.notes || "",
        onChange: (e) => updateCustomField(entry.id, "notes", e.target.value),
        style: { width: "100%", padding: "8px 10px", marginBottom: 10, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5, lineHeight: 1.4 }
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 7 } }, entry.sets.map((row, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", flexDirection: "column", gap: 5 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 7 } }, /* @__PURE__ */ React.createElement("span", { className: "tabular", style: { fontSize: 11, color: "var(--text-muted)", width: 34, flexShrink: 0 } }, "Set ", i + 1), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        inputMode: "decimal",
        placeholder: "Weight",
        value: row.weight,
        onChange: (e) => updateCustomRow(entry.id, i, "weight", e.target.value),
        style: { flex: 1, minWidth: 0, padding: "9px 8px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13 }
      }
    ), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        inputMode: "numeric",
        placeholder: "Reps",
        value: row.value,
        onChange: (e) => updateCustomRow(entry.id, i, "value", e.target.value),
        style: { flex: 1, minWidth: 0, padding: "9px 8px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13 }
      }
    ), /* @__PURE__ */ React.createElement("button", { onClick: () => removeCustomRow(entry.id, i), disabled: entry.sets.length === 1, style: { background: "none", border: "none", cursor: entry.sets.length === 1 ? "default" : "pointer", padding: 4, opacity: entry.sets.length === 1 ? 0.25 : 1, flexShrink: 0 } }, /* @__PURE__ */ React.createElement(X, { size: 14, color: "var(--text-muted)" }))), row.extra ? /* @__PURE__ */ React.createElement("div", { style: { marginLeft: 41, padding: "8px 9px", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: 8, display: "flex", flexDirection: "column", gap: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => updateCustomExtra(entry.id, i, "type", "superset"), style: { padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer", border: row.extra.type === "superset" ? "1px solid var(--accent)" : "1px solid var(--border)", background: row.extra.type === "superset" ? "var(--accent-dim)" : "transparent", color: row.extra.type === "superset" ? "var(--accent)" : "var(--text-muted)" } }, "Superset"), /* @__PURE__ */ React.createElement("button", { onClick: () => updateCustomExtra(entry.id, i, "type", "dropset"), style: { padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer", border: row.extra.type === "dropset" ? "1px solid var(--accent)" : "1px solid var(--border)", background: row.extra.type === "dropset" ? "var(--accent-dim)" : "transparent", color: row.extra.type === "dropset" ? "var(--accent)" : "var(--text-muted)" } }, "Drop Set")), /* @__PURE__ */ React.createElement("button", { onClick: () => removeCustomExtra(entry.id, i), style: { background: "none", border: "none", cursor: "pointer", padding: 3 } }, /* @__PURE__ */ React.createElement(X, { size: 12, color: "var(--text-muted)" }))), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: "Exercise name",
        value: row.extra.exercise,
        onChange: (e) => updateCustomExtra(entry.id, i, "exercise", e.target.value),
        style: { width: "100%", padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5 }
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        inputMode: "decimal",
        placeholder: "Weight",
        value: row.extra.weight,
        onChange: (e) => updateCustomExtra(entry.id, i, "weight", e.target.value),
        style: { flex: 1, minWidth: 0, padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5 }
      }
    ), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        inputMode: "numeric",
        placeholder: "Reps",
        value: row.extra.value,
        onChange: (e) => updateCustomExtra(entry.id, i, "value", e.target.value),
        style: { flex: 1, minWidth: 0, padding: "7px 9px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5 }
      }
    ))) : /* @__PURE__ */ React.createElement("button", { onClick: () => addCustomExtra(entry.id, i), style: { marginLeft: 41, alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 11 } }, /* @__PURE__ */ React.createElement(Layers, { size: 11 }), " Superset / drop set")))), /* @__PURE__ */ React.createElement("button", { onClick: () => addCustomRow(entry.id), style: { marginTop: 9, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", borderRadius: 8, background: "var(--surface-2)", border: "1px dashed var(--border)", cursor: "pointer", color: "var(--text-muted)", fontSize: 12.5, fontWeight: 600 } }, /* @__PURE__ */ React.createElement(Plus, { size: 14 }), " Add Set")));
  }), addFlow ? /* @__PURE__ */ React.createElement("div", { style: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, addFlow.step !== "choose" && /* @__PURE__ */ React.createElement("button", { onClick: addFlowBack, style: { background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--text-muted)", fontSize: 12 } }, "\u2039 Back"), /* @__PURE__ */ React.createElement("span", { className: "display", style: { fontSize: 12, color: "var(--text-muted)" } }, addFlow.step === "choose" && "Add an exercise", addFlow.step === "body" && "Which body part?", addFlow.step === "part" && `Which part of ${addFlow.bodyPart}?`, addFlow.step === "exercise" && "Pick an exercise")), /* @__PURE__ */ React.createElement("button", { onClick: cancelAddFlow, style: { background: "none", border: "none", cursor: "pointer", padding: 2 } }, /* @__PURE__ */ React.createElement(X, { size: 16, color: "var(--text-muted)" }))), addFlow.step === "choose" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: chooseExisting, style: { width: "100%", textAlign: "left", padding: "12px 14px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, fontSize: 13.5 } }, "Existing in the Plan"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 } }, "Pull a lift already defined elsewhere in your split \u2014 gets weight/rep dropdowns, muscle diagram, and history.")), /* @__PURE__ */ React.createElement("button", { onClick: chooseNew, style: { width: "100%", textAlign: "left", padding: "12px 14px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, fontSize: 13.5 } }, "New Exercise"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 } }, "Not in the plan \u2014 type the name and enter weight/reps manually."))), addFlow.step === "body" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, Object.keys(BODY_PARTS).map((part) => /* @__PURE__ */ React.createElement("button", { key: part, onClick: () => chooseBodyPart(part), style: { width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text)", fontSize: 13, fontWeight: 600 } }, part))), addFlow.step === "part" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, BODY_PARTS[addFlow.bodyPart].map((slotName) => /* @__PURE__ */ React.createElement("button", { key: slotName, onClick: () => chooseSlotName(slotName), style: { width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text)", fontSize: 13, fontWeight: 600 } }, slotName))), addFlow.step === "exercise" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, availableExercises(addFlow.slotName, SLOT_EXERCISE_LIBRARY[addFlow.slotName] || []).map((ex) => /* @__PURE__ */ React.createElement("button", { key: ex.name, onClick: () => chooseLibraryExercise(addFlow.slotName, ex.name), style: { width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text)", fontSize: 13, fontWeight: 600 } }, ex.name, ex.type === "time" ? " (timed)" : "", /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 400, color: "var(--text-muted)", fontSize: 11 } }, " \xB7 ", ex.equip))))) : /* @__PURE__ */ React.createElement("button", { onClick: startAddFlow, style: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px", borderRadius: 12, background: "transparent", border: "1px dashed var(--accent)", cursor: "pointer", color: "var(--accent)", fontSize: 13, fontWeight: 700 } }, /* @__PURE__ */ React.createElement(Plus, { size: 16 }), " Add Exercise")) : /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 16px 40px" } }, !historyLoaded ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 13, padding: "20px 0" } }, /* @__PURE__ */ React.createElement(Loader2, { size: 16 }), " Loading history\u2026") : history.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement(HistoryIcon, { size: 26, style: { marginBottom: 10, opacity: 0.5 } }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14 } }, "No workouts logged yet."), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, marginTop: 4 } }, "Finish a session and hit Save Workout to start your log.")) : [...history].reverse().map((s) => {
    var _a;
    const blocks = s.blocks || [];
    const vol = blocks.filter((b) => b.type === "reps").reduce((sum, b) => sum + b.sets.reduce((s2, st) => s2 + st.weight * st.value, 0), 0);
    const hold = blocks.filter((b) => b.type === "time").reduce((sum, b) => sum + b.sets.reduce((s2, st) => s2 + st.value, 0), 0);
    return /* @__PURE__ */ React.createElement("div", { key: s.id, style: { marginBottom: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "display", style: { fontSize: 14 } }, s.day, " \xB7 ", (_a = WORKOUT_DATA[s.day]) == null ? void 0 : _a.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-muted)" } }, fmtDate(s.date))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, hold > 0 && /* @__PURE__ */ React.createElement("span", { className: "tabular", style: { fontSize: 12, color: "var(--time)" } }, hold, "s"), vol > 0 && /* @__PURE__ */ React.createElement("span", { className: "tabular", style: { fontSize: 13, color: "var(--accent)", fontWeight: 700 } }, vol.toLocaleString(), " lb"), /* @__PURE__ */ React.createElement("button", { onClick: () => deleteSession(s.id), style: { background: "none", border: "none", cursor: "pointer" } }, /* @__PURE__ */ React.createElement(Trash2, { size: 14, color: "var(--text-muted)" })))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, blocks.map((b, i) => /* @__PURE__ */ React.createElement("div", { key: i }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12.5 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-muted)" } }, b.slot, ": ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text)" } }, b.exercise)), /* @__PURE__ */ React.createElement("span", { className: "tabular", style: { color: b.type === "time" ? "var(--time)" : "var(--text-muted)" } }, fmtSetsList(b))), b.notes && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-muted)", fontStyle: "italic", marginTop: 2 } }, b.notes)))));
  })), view === "log" && sessionBlocks.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 16px", paddingBottom: "calc(12px + env(safe-area-inset-bottom))", background: "linear-gradient(to top, var(--bg) 70%, transparent)" } }, storageError && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--danger)", marginBottom: 6, textAlign: "center" } }, storageError), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: discardSession, style: { display: "flex", alignItems: "center", justifyContent: "center", width: 44, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" } }, /* @__PURE__ */ React.createElement(RotateCcw, { size: 16, color: "var(--text-muted)" })), /* @__PURE__ */ React.createElement("button", { onClick: saveWorkout, disabled: saving, style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 10, background: savedFlash ? "var(--success)" : "var(--accent)", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "var(--on-accent)" } }, saving ? /* @__PURE__ */ React.createElement(Loader2, { size: 16 }) : /* @__PURE__ */ React.createElement(Save, { size: 16 }), savedFlash ? "Saved" : saving ? "Saving\u2026" : `Save Workout (${totalSets} set${totalSets > 1 ? "s" : ""})`))));
}
try {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(/* @__PURE__ */ React.createElement(WorkoutTracker, null));
  document.getElementById("root").setAttribute("data-mounted", "true");
} catch (e) {
  showDiag("App crashed while starting", e && e.message ? e.message : String(e));
}
