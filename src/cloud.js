// Wires the sync engine to the real Supabase client and localStorage, and
// exposes auth + status to React. When src/supabaseConfig.js is still blank,
// everything here is inert and the app behaves exactly as it did before.
import { useEffect, useState, useSyncExternalStore } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./supabaseConfig";
import { createSync } from "./sync";
import { prsForSync } from "./prs";
import { setWriteListener } from "./storage";

export const cloudConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

const lsStore = {
  get(k) { try { return localStorage.getItem("ironlog:" + k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem("ironlog:" + k, v); } catch (e) { /* full/blocked */ } },
  remove(k) { try { localStorage.removeItem("ironlog:" + k); } catch (e) { /* ignore */ } },
};

export const supabase = cloudConfigured
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;

export const sync = createSync({
  client: supabase,
  store: lsStore,
  decorate: (history) => {
    const prs = prsForSync(history);
    return new Map([...prs].map(([id, list]) => [id, { prs: list }]));
  },
  isOnline: () => (typeof navigator === "undefined" ? true : navigator.onLine !== false),
});

let auth = { ready: !cloudConfigured, user: null, recovery: false };
const authListeners = new Set();
const setAuth = (patch) => { auth = { ...auth, ...patch }; authListeners.forEach((fn) => fn()); };

async function onSession(session) {
  const u = session && session.user ? { id: session.user.id, email: session.user.email } : null;
  if (u) {
    if (!auth.user || auth.user.id !== u.id) {
      setAuth({ ready: true, user: u });
      const { switchedAccount } = await sync.start(u);
      // A different account's data was cleared from this device: reload so no old state lingers in memory.
      if (switchedAccount && typeof window !== "undefined") window.location.reload();
    } else setAuth({ ready: true });
  } else {
    sync.stop();
    setAuth({ ready: true, user: null });
  }
}

if (supabase) {
  setWriteListener((key) => sync.notifyLocalWrite(key));
  supabase.auth.onAuthStateChange((event, session) => {
    // Arriving from a password-reset email link: show the "set a new password" screen.
    if (event === "PASSWORD_RECOVERY") setAuth({ recovery: true });
    // Defer: Supabase forbids awaiting other client calls inside this callback.
    setTimeout(() => { onSession(session); }, 0);
  });
  supabase.auth.getSession().then(({ data }) => onSession(data.session));
  if (typeof window !== "undefined") {
    const kick = () => { if (auth.user) sync.syncNow(); };
    window.addEventListener("online", kick);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") kick(); else if (auth.user) sync.flush(); });
    window.addEventListener("pagehide", () => { if (auth.user) sync.flush(); });
  }
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + window.location.pathname } });
  if (error) throw error;
  return { needsConfirmation: !data.session };
}
export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}
export async function signOut() {
  await sync.flush().catch(() => {});
  await supabase.auth.signOut();
}
// Used on the screen a reset-email link lands on (a temporary recovery session is already active).
export async function setNewPassword(password) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  setAuth({ recovery: false });
}
export function dismissRecovery() { setAuth({ recovery: false }); }
// Permanently deletes the cloud account, then signs out locally. The workouts
// on this device stay; sync-meta is cleared so signing up again later uploads
// them into the new account instead of thinking they belong to the old one.
export async function deleteAccount() {
  const { error } = await supabase.rpc("delete_my_account");
  if (error) throw error;
  lsStore.remove("sync-meta");
  await supabase.auth.signOut({ scope: "local" }).catch(() => {});
  sync.stop();
  setAuth({ user: null });
}
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + window.location.pathname });
  if (error) throw error;
}

const subscribeAuth = (fn) => { authListeners.add(fn); return () => authListeners.delete(fn); };
const getAuth = () => auth;

// { ready, user, sync: { status, lastSyncAt, error } }
export function useCloud() {
  const a = useSyncExternalStore(subscribeAuth, getAuth);
  const [s, setS] = useState(sync.getState());
  useEffect(() => sync.subscribe(setS), []);
  return { configured: cloudConfigured, ready: a.ready, user: a.user, recovery: a.recovery, sync: s };
}
