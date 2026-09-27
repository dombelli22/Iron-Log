// ---------------------------------------------------------------------------
// Cloud sync engine. Local-first: the app keeps reading/writing localStorage
// exactly as before, and once someone is signed in this copies changes to and
// from Supabase in the background. Everything is injected (Supabase client,
// key/value store, timers) so it can be tested with fakes and no network.
//
// What syncs, and where it lives in the cloud:
//   workout-history  -> `workouts`  one row per workout (so other people can
//                       read individual workouts later), soft-deleted via
//                       `deleted_at` so a delete on one device reaches the rest
//   profile          -> `profiles`  one row per user
//   everything else  -> `user_data` key/value (plans, schedules, settings...)
//
// How it knows what changed: after every successful sync it remembers a hash
// of each item and the server timestamp it was written at (`sync-meta`). An
// item whose current hash differs from the remembered one is "dirty" (changed
// locally since the last sync) and gets pushed; a cloud row newer than the
// remembered timestamp is "changed remotely". No dirty flags to keep in sync.
// ---------------------------------------------------------------------------

export const HISTORY_KEY = "workout-history";
export const PROFILE_KEY = "profile";
export const KV_KEYS = [
  "selected-plan-id",
  "plan-schedules",
  "custom-plans",
  "plan-day-overrides",
  "last-used-exercise",
  "rep-range",
  "week-drafts",
];
export const SYNCED_KEYS = [HISTORY_KEY, PROFILE_KEY, ...KV_KEYS];
const META_KEY = "sync-meta";
const PAGE = 1000; // PostgREST returns at most 1000 rows per request
const PUSH_BATCH = 100;

// Two independent 32-bit hashes + length — cheap, and a false "unchanged" is
// astronomically unlikely.
function hashStr(s) {
  let a = 5381;
  let b = 52711;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    a = ((a << 5) + a + c) | 0;
    b = (Math.imul(b, 33) ^ c) | 0;
  }
  return `${a}:${b}:${s.length}`;
}

const parse = (raw, fallback) => {
  try { return raw == null ? fallback : JSON.parse(raw); } catch (e) { return fallback; }
};

// Fixed key order so the same workout always hashes the same.
const canonWorkout = (w) => JSON.stringify({ id: String(w.id), date: w.date, day: w.day, blocks: w.blocks || [] });
const canonProfile = (p) => JSON.stringify({ displayName: p.displayName || "", bio: p.bio || "", goal: p.goal || "", photo: p.photo || "", createdAt: p.createdAt || "" });

const isPlainObject = (v) => v && typeof v === "object" && !Array.isArray(v);
const isIdArray = (v) => Array.isArray(v) && v.every((x) => isPlainObject(x) && x.id != null);

// Combine two versions of the same setting without discarding either side's
// entries where that's meaningful: objects merge key by key, arrays of
// id-bearing items (custom plans) merge by id, anything else `over` wins.
// `over` takes priority on any overlap.
function mergeValues(baseRaw, overRaw) {
  const base = parse(baseRaw, undefined);
  const over = parse(overRaw, undefined);
  if (isPlainObject(base) && isPlainObject(over)) return JSON.stringify({ ...base, ...over });
  if (isIdArray(base) && isIdArray(over)) {
    const byId = new Map(base.map((x) => [String(x.id), x]));
    over.forEach((x) => byId.set(String(x.id), x));
    return JSON.stringify([...byId.values()]);
  }
  return overRaw;
}

// `decorate(history)` (optional) returns Map(workoutId -> extra columns, e.g. { prs })
// stored alongside each workout for other people's screens. DECORATE_REV bumps
// when what it adds changes, forcing one re-upload of everything.
const DECORATE_REV = 1;

export function createSync({ client, store, decorate = null, isOnline = () => true, debounceMs = 1500, setTimer = setTimeout, clearTimer = clearTimeout }) {
  let user = null;
  let running = null; // the in-flight run, so runs never overlap
  let rerun = false;
  let timer = null;
  const listeners = new Set();
  const appliedListeners = new Set();
  let state = { status: "signedOut", lastSyncAt: null, error: null };

  const setState = (patch) => {
    state = { ...state, ...patch };
    listeners.forEach((fn) => fn(state));
  };

  const loadMeta = () => parse(store.get(META_KEY), null) || { userId: null, lastSyncAt: null, hist: {}, kv: {}, profile: null };
  const saveMeta = (m) => store.set(META_KEY, JSON.stringify(m));

  function unwrap(res, what) {
    if (res.error) throw new Error(`${what}: ${res.error.message || res.error}`);
    return res.data;
  }

  async function fetchAllWorkouts(uid) {
    const rows = [];
    for (let from = 0; ; from += PAGE) {
      const res = await client.from("workouts").select("id,date,day,blocks,updated_at,deleted_at").eq("user_id", uid).order("id", { ascending: true }).range(from, from + PAGE - 1);
      const page = unwrap(res, "Loading workouts") || [];
      rows.push(...page);
      if (page.length < PAGE) break;
    }
    return rows;
  }

  // ------------------------------------------------------------------ pull
  async function pullMerge() {
    const uid = user.id;
    const meta = loadMeta();
    const [workouts, kvRows, profileRow] = await Promise.all([
      fetchAllWorkouts(uid),
      client.from("user_data").select("key,value,updated_at").eq("user_id", uid).then((r) => unwrap(r, "Loading settings") || []),
      client.from("profiles").select("display_name,bio,goal,photo,created_on,updated_at").eq("id", uid).maybeSingle().then((r) => unwrap(r, "Loading profile")),
    ]);
    let changed = false;

    // ---- workouts
    const local = parse(store.get(HISTORY_KEY), []);
    const localById = new Map(local.map((w) => [String(w.id), w]));
    const next = [...local];
    const removeIds = new Set();
    workouts.forEach((c) => {
      const id = String(c.id);
      const l = localById.get(id);
      const snap = meta.hist[id];
      const cloudMs = Date.parse(c.updated_at);
      const cloudWorkout = { id, date: c.date, day: c.day, blocks: c.blocks || [] };
      if (c.deleted_at) {
        const dirty = l && (!snap || snap.h !== hashStr(canonWorkout(l)));
        if (l && !dirty) { removeIds.add(id); delete meta.hist[id]; changed = true; }
        return; // a locally edited copy survives a remote delete, and gets re-pushed
      }
      if (!l) {
        next.push(cloudWorkout);
        meta.hist[id] = { h: hashStr(canonWorkout(cloudWorkout)), at: cloudMs };
        changed = true;
        return;
      }
      const localHash = hashStr(canonWorkout(l));
      if (!snap && localHash === hashStr(canonWorkout(cloudWorkout))) { meta.hist[id] = { h: localHash, at: cloudMs }; return; }
      const localDirty = !snap || snap.h !== localHash;
      const cloudChanged = !snap || cloudMs > snap.at;
      if (!localDirty && cloudChanged) {
        const i = next.findIndex((w) => String(w.id) === id);
        next[i] = cloudWorkout;
        meta.hist[id] = { h: hashStr(canonWorkout(cloudWorkout)), at: cloudMs };
        changed = true;
      }
      // localDirty: keep the local copy; pushDirty sends it.
    });
    if (removeIds.size || next.length !== local.length || changed) {
      store.set(HISTORY_KEY, JSON.stringify(next.filter((w) => !removeIds.has(String(w.id)))));
    }

    // ---- settings (key/value)
    const cloudKv = new Map(kvRows.map((r) => [r.key, r]));
    KV_KEYS.forEach((key) => {
      const c = cloudKv.get(key);
      const l = store.get(key);
      const snap = meta.kv[key];
      if (!c) return; // nothing in the cloud yet: pushDirty uploads the local value
      const cloudMs = Date.parse(c.updated_at);
      if (l == null) { store.set(key, c.value); meta.kv[key] = { h: hashStr(c.value), at: cloudMs }; changed = true; return; }
      const localHash = hashStr(l);
      if (!snap) {
        if (localHash === hashStr(c.value)) { meta.kv[key] = { h: localHash, at: cloudMs }; return; }
        // Both sides already had this setting before ever syncing: combine them, cloud (the account's data) winning ties.
        const merged = mergeValues(l, c.value);
        store.set(key, merged);
        meta.kv[key] = { h: hashStr(c.value), at: cloudMs }; // remembered as the cloud's state, so the merged result counts as a local change and is pushed
        changed = true;
        return;
      }
      const localDirty = snap.h !== localHash;
      const cloudChanged = cloudMs > snap.at;
      if (!localDirty && cloudChanged) { store.set(key, c.value); meta.kv[key] = { h: hashStr(c.value), at: cloudMs }; changed = true; }
      else if (localDirty && cloudChanged) {
        // Changed on both sides since the last sync: combine, this device's edits winning ties.
        store.set(key, mergeValues(c.value, l));
        meta.kv[key] = { h: hashStr(c.value), at: cloudMs };
        changed = true;
      }
    });

    // ---- profile
    if (profileRow && profileRow.display_name) {
      const cloudProfile = { displayName: profileRow.display_name || "", bio: profileRow.bio || "", goal: profileRow.goal || "", photo: profileRow.photo || "", createdAt: profileRow.created_on || "" };
      const cloudHash = hashStr(canonProfile(cloudProfile));
      const cloudMs = Date.parse(profileRow.updated_at);
      const rawLocal = store.get(PROFILE_KEY);
      const l = parse(rawLocal, null);
      const snap = meta.profile;
      if (!l) { store.set(PROFILE_KEY, JSON.stringify(cloudProfile)); meta.profile = { h: cloudHash, at: cloudMs }; changed = true; }
      else {
        const localHash = hashStr(canonProfile(l));
        const localDirty = !snap || snap.h !== localHash;
        const cloudChanged = !snap || cloudMs > snap.at;
        if (localHash === cloudHash) meta.profile = { h: cloudHash, at: cloudMs };
        else if (!snap || (!localDirty && cloudChanged)) { store.set(PROFILE_KEY, JSON.stringify(cloudProfile)); meta.profile = { h: cloudHash, at: cloudMs }; changed = true; }
        // else this device edited it: keep local, pushDirty sends it
      }
    }

    saveMeta(meta);
    if (changed) appliedListeners.forEach((fn) => fn());
  }

  // ------------------------------------------------------------------ push
  async function pushDirty() {
    const uid = user.id;
    const meta = loadMeta();

    // ---- workouts
    const local = parse(store.get(HISTORY_KEY), []);
    const localIds = new Set(local.map((w) => String(w.id)));
    const extras = decorate ? decorate(local) : null;
    const forceAll = !!decorate && meta.decorateRev !== DECORATE_REV;
    const dirty = local.filter((w) => {
      const s = meta.hist[String(w.id)];
      return forceAll || !s || s.h !== hashStr(canonWorkout(w));
    });
    for (let i = 0; i < dirty.length; i += PUSH_BATCH) {
      const batch = dirty.slice(i, i + PUSH_BATCH);
      const rows = batch.map((w) => {
        const row = { user_id: uid, id: String(w.id), date: w.date, day: w.day, blocks: w.blocks || [], deleted_at: null };
        if (extras) Object.assign(row, extras.get(String(w.id)) || { prs: [] });
        return row;
      });
      const res = await client.from("workouts").upsert(rows, { onConflict: "user_id,id" }).select("id,updated_at");
      const saved = unwrap(res, "Saving workouts") || [];
      const at = new Map(saved.map((r) => [String(r.id), Date.parse(r.updated_at)]));
      batch.forEach((w) => { meta.hist[String(w.id)] = { h: hashStr(canonWorkout(w)), at: at.get(String(w.id)) || Date.now() }; });
      saveMeta(meta);
    }
    if (forceAll) { meta.decorateRev = DECORATE_REV; saveMeta(meta); }
    const gone = Object.keys(meta.hist).filter((id) => !localIds.has(id));
    for (let i = 0; i < gone.length; i += PUSH_BATCH) {
      const ids = gone.slice(i, i + PUSH_BATCH);
      const res = await client.from("workouts").update({ deleted_at: new Date().toISOString() }).eq("user_id", uid).in("id", ids);
      unwrap(res, "Deleting workouts");
      ids.forEach((id) => delete meta.hist[id]);
      saveMeta(meta);
    }

    // ---- settings
    for (const key of KV_KEYS) {
      const l = store.get(key);
      if (l == null) continue;
      const h = hashStr(l);
      if (meta.kv[key] && meta.kv[key].h === h) continue;
      const res = await client.from("user_data").upsert({ user_id: uid, key, value: l }, { onConflict: "user_id,key" }).select("updated_at");
      const saved = unwrap(res, `Saving ${key}`) || [];
      meta.kv[key] = { h, at: saved[0] ? Date.parse(saved[0].updated_at) : Date.now() };
      saveMeta(meta);
    }

    // ---- profile
    const p = parse(store.get(PROFILE_KEY), null);
    if (p && p.displayName) {
      const h = hashStr(canonProfile(p));
      if (!meta.profile || meta.profile.h !== h) {
        const row = { id: uid, display_name: p.displayName, bio: p.bio || "", goal: p.goal || "", photo: p.photo || "" };
        if (p.createdAt) row.created_on = p.createdAt;
        const res = await client.from("profiles").upsert(row, { onConflict: "id" }).select("updated_at");
        const saved = unwrap(res, "Saving profile") || [];
        meta.profile = { h, at: saved[0] ? Date.parse(saved[0].updated_at) : Date.now() };
        saveMeta(meta);
      }
    }
  }

  // ------------------------------------------------------------------ runs
  async function execute(withPull) {
    if (!user) return;
    if (!isOnline()) { setState({ status: "offline" }); return; }
    setState({ status: "syncing", error: null });
    try {
      if (withPull) await pullMerge();
      await pushDirty();
      const meta = loadMeta();
      meta.lastSyncAt = Date.now();
      saveMeta(meta);
      setState({ status: "idle", lastSyncAt: meta.lastSyncAt, error: null });
    } catch (e) {
      setState({ status: "error", error: (e && e.message) || String(e) });
    }
  }

  // Serialized: a request made mid-run queues exactly one follow-up run.
  function run(withPull) {
    if (running) { rerun = rerun || withPull; return running; }
    running = execute(withPull).finally(async () => {
      running = null;
      if (rerun && user) { rerun = false; await run(true); }
    });
    return running;
  }

  return {
    getState: () => state,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    onRemoteApplied(fn) { appliedListeners.add(fn); return () => appliedListeners.delete(fn); },

    // Called with the signed-in user (session restore or fresh sign-in).
    // Returns { switchedAccount } — true if a different account had been
    // synced on this device, so its local copy was cleared first rather than
    // being uploaded into the new account.
    async start(nextUser) {
      const meta = loadMeta();
      let switchedAccount = false;
      if (meta.userId && meta.userId !== nextUser.id) {
        SYNCED_KEYS.forEach((k) => store.remove(k));
        store.remove(META_KEY);
        switchedAccount = true;
        appliedListeners.forEach((fn) => fn());
      }
      const fresh = switchedAccount ? { userId: null, lastSyncAt: null, hist: {}, kv: {}, profile: null } : meta;
      fresh.userId = nextUser.id;
      saveMeta(fresh);
      user = nextUser;
      await run(true);
      return { switchedAccount };
    },

    // Signed out: stop syncing but keep local data and sync-meta (so signing
    // back in as the same account resumes cleanly).
    stop() {
      user = null;
      if (timer) { clearTimer(timer); timer = null; }
      setState({ status: "signedOut", error: null });
    },

    syncNow: () => run(true),
    flush: () => run(false),

    // Storage hook: a synced key was just written locally.
    notifyLocalWrite(key) {
      if (!user || !SYNCED_KEYS.includes(key)) return;
      if (timer) clearTimer(timer);
      timer = setTimer(() => { timer = null; run(false); }, debounceMs);
    },
  };
}
