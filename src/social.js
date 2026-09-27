// Social features: usernames, follows, feed. Thin wrappers over Supabase —
// every privacy rule (who can see whose workouts) is enforced by row-level
// security in supabase/social.sql, not here; this file just asks.
import { supabase } from "./cloud";

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const PROFILE_COLS = "id,username,display_name,bio,goal,photo,is_private,share_workouts";

function must(res, what) {
  if (res.error) {
    const e = new Error(res.error.message || what);
    e.code = res.error.code;
    throw e;
  }
  return res.data;
}

export const friendlySocialError = (e) => {
  const m = (e && e.message) || "";
  if (e && e.code === "23505") return "That username is taken.";
  if (/username/i.test(m) && /before following/i.test(m)) return "Pick a username first (Account & Sync → Social).";
  if (/failed to fetch|network/i.test(m)) return "Couldn't reach the server. Check your connection and try again.";
  return m || "Something went wrong.";
};

export async function getMyAccount(uid) {
  const res = await supabase.from("profiles").select("username,is_private,share_workouts,shared_since_date").eq("id", uid).maybeSingle();
  return must(res, "Loading account") || { username: null, is_private: true, share_workouts: false, shared_since_date: null };
}

// `today` is the local date (YYYY-MM-DD) — the day sharing was switched on,
// which is what the feed uses to tell "posted" workouts from older ones.
export async function saveMyAccount(uid, { username, isPrivate, shareWorkouts }, existing, today) {
  const row = { id: uid, username, is_private: isPrivate, share_workouts: shareWorkouts };
  row.shared_since_date = shareWorkouts ? (existing && existing.share_workouts && existing.shared_since_date) || today : null;
  must(await supabase.from("profiles").upsert(row, { onConflict: "id" }), "Saving");
}

export async function searchPeople(query, myId) {
  const term = query.trim().toLowerCase().replace(/[^a-z0-9_ ]/g, "");
  if (term.length < 2) return [];
  const blocked = await getBlockedIds(myId);
  let q = supabase.from("profiles").select(PROFILE_COLS)
    .or(`username.ilike.${term}%,display_name.ilike.%${term}%`)
    .not("username", "is", null).neq("id", myId);
  if (blocked.length) q = q.not("id", "in", `(${blocked.join(",")})`);
  return must(await q.limit(20), "Searching") || [];
}

export async function getPublicProfile(id) {
  return must(await supabase.from("profiles").select(PROFILE_COLS).eq("id", id).maybeSingle(), "Loading profile");
}

export async function getFollowCounts(id) {
  const rows = must(await supabase.rpc("follow_counts", { target: id }), "Loading counts") || [];
  return rows[0] ? { followers: Number(rows[0].followers), following: Number(rows[0].following) } : { followers: 0, following: 0 };
}

// null | "pending" | "accepted" — my follow of someone
export async function getFollowStatus(myId, otherId) {
  const rows = must(await supabase.from("follows").select("status").eq("follower_id", myId).eq("followee_id", otherId), "Loading") || [];
  return rows[0] ? rows[0].status : null;
}

export async function follow(myId, otherId) {
  const rows = must(await supabase.from("follows").insert({ follower_id: myId, followee_id: otherId }).select("status"), "Following") || [];
  return rows[0] ? rows[0].status : "pending";
}

export async function unfollow(myId, otherId) {
  must(await supabase.from("follows").delete().eq("follower_id", myId).eq("followee_id", otherId), "Unfollowing");
}

export async function getPendingRequests(myId) {
  const rows = must(await supabase.from("follows").select("follower_id,created_at").eq("followee_id", myId).eq("status", "pending").order("created_at", { ascending: false }), "Loading requests") || [];
  if (!rows.length) return [];
  const profiles = must(await supabase.from("profiles").select(PROFILE_COLS).in("id", rows.map((r) => r.follower_id)), "Loading requests") || [];
  const byId = new Map(profiles.map((p) => [p.id, p]));
  return rows.map((r) => byId.get(r.follower_id)).filter(Boolean);
}

export async function approveRequest(myId, followerId) {
  must(await supabase.from("follows").update({ status: "accepted" }).eq("followee_id", myId).eq("follower_id", followerId), "Approving");
}
export async function declineRequest(myId, followerId) {
  must(await supabase.from("follows").delete().eq("followee_id", myId).eq("follower_id", followerId), "Declining");
}

// One person's workouts, newest first (RLS decides whether I'm allowed).
export async function fetchUserWorkouts(userId, offset = 0, limit = 10) {
  const res = await supabase.from("workouts").select("id,date,day,blocks,prs", { count: "exact" })
    .eq("user_id", userId).is("deleted_at", null)
    .order("date", { ascending: false }).order("id", { ascending: false })
    .range(offset, offset + limit - 1);
  const rows = must(res, "Loading workouts") || [];
  return { rows, total: res.count == null ? rows.length : res.count };
}

// Home feed page. `cursor` is the last row of the previous page.
export async function fetchHomeFeed(cursor, limit = 15) {
  const args = { p_limit: limit };
  if (cursor) { args.p_before_date = cursor.date; args.p_before_key = `${cursor.user_id}|${cursor.id}`; }
  const rows = must(await supabase.rpc("home_feed", args), "Loading feed") || [];
  const ids = [...new Set(rows.map((r) => r.user_id))];
  let authors = {};
  if (ids.length) {
    const profiles = must(await supabase.from("profiles").select(PROFILE_COLS).in("id", ids), "Loading feed") || [];
    authors = Object.fromEntries(profiles.map((p) => [p.id, p]));
  }
  return { rows, authors, hasMore: rows.length === limit };
}

// ------------------------------------------------------------------ safety
export const REPORT_REASONS = [
  ["spam", "Spam or fake account"],
  ["harassment", "Harassment or bullying"],
  ["inappropriate", "Inappropriate content"],
  ["impersonation", "Pretending to be someone else"],
  ["other", "Something else"],
];

export async function getBlockedIds(myId) {
  const rows = must(await supabase.from("blocks").select("blocked_id").eq("blocker_id", myId), "Loading blocks") || [];
  return rows.map((r) => r.blocked_id);
}

export async function getBlockedProfiles(myId) {
  const ids = await getBlockedIds(myId);
  if (!ids.length) return [];
  return must(await supabase.from("profiles").select(PROFILE_COLS).in("id", ids), "Loading blocks") || [];
}

export async function blockUser(myId, otherId) {
  must(await supabase.from("blocks").insert({ blocker_id: myId, blocked_id: otherId }), "Blocking");
}

export async function unblockUser(myId, otherId) {
  must(await supabase.from("blocks").delete().eq("blocker_id", myId).eq("blocked_id", otherId), "Unblocking");
}

export async function reportUser(myId, targetUserId, workoutId, reason, details, commentId) {
  must(await supabase.from("reports").insert({
    reporter_id: myId, target_user_id: targetUserId, target_workout_id: workoutId || null,
    target_comment_id: commentId || null,
    reason, details: (details || "").slice(0, 500),
  }), "Reporting");
}

// --------------------------------------------------------- likes & comments
export const engagementKey = (owner, id) => `${owner}|${id}`;

// Counts + "did I like it" for a page of posts: Map-like object keyed by engagementKey.
export async function fetchEngagement(items) {
  if (!items.length) return {};
  const rows = must(await supabase.rpc("post_engagement", { p_keys: items.map(({ owner, id }) => ({ owner, id })) }), "Loading reactions") || [];
  const out = {};
  rows.forEach((r) => { out[engagementKey(r.workout_owner, r.workout_id)] = { likes: Number(r.like_count), comments: Number(r.comment_count), liked: !!r.liked_by_me }; });
  return out;
}

export async function likePost(myId, owner, id) {
  must(await supabase.from("likes").insert({ workout_owner: owner, workout_id: id, user_id: myId }), "Liking");
}
export async function unlikePost(myId, owner, id) {
  must(await supabase.from("likes").delete().eq("workout_owner", owner).eq("workout_id", id).eq("user_id", myId), "Unliking");
}

export async function fetchComments(owner, id) {
  const rows = must(await supabase.from("comments").select("id,author_id,body,created_at").eq("workout_owner", owner).eq("workout_id", id).order("created_at", { ascending: true }).limit(200), "Loading comments") || [];
  const ids = [...new Set(rows.map((r) => r.author_id))];
  let authors = {};
  if (ids.length) {
    const profiles = must(await supabase.from("profiles").select(PROFILE_COLS).in("id", ids), "Loading comments") || [];
    authors = Object.fromEntries(profiles.map((p) => [p.id, p]));
  }
  return { rows, authors };
}

export async function addComment(myId, owner, id, body) {
  const rows = must(await supabase.from("comments").insert({ workout_owner: owner, workout_id: id, author_id: myId, body: body.trim() }).select("id,author_id,body,created_at"), "Commenting") || [];
  return rows[0];
}
export async function deleteComment(commentId) {
  must(await supabase.from("comments").delete().eq("id", commentId), "Deleting comment");
}

// ------------------------------------------------------------ notifications
export async function fetchUnreadCount() {
  const res = await supabase.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null);
  must(res, "Loading notifications");
  return res.count || 0;
}

export async function fetchNotifications(myId, limit = 40) {
  const rows = must(await supabase.from("notifications").select("id,actor_id,type,workout_id,body,created_at,read_at").order("created_at", { ascending: false }).limit(limit), "Loading notifications") || [];
  const actorIds = [...new Set(rows.map((r) => r.actor_id))];
  const workoutIds = [...new Set(rows.filter((r) => r.workout_id).map((r) => r.workout_id))];
  const [actors, workouts] = await Promise.all([
    actorIds.length ? supabase.from("profiles").select(PROFILE_COLS).in("id", actorIds).then((r) => must(r, "Loading notifications") || []) : [],
    workoutIds.length ? supabase.from("workouts").select("id,date,day").eq("user_id", myId).in("id", workoutIds).then((r) => must(r, "Loading notifications") || []) : [],
  ]);
  return {
    rows,
    actors: Object.fromEntries(actors.map((p) => [p.id, p])),
    workouts: Object.fromEntries(workouts.map((w) => [w.id, w])),
  };
}

export async function markAllNotificationsRead() {
  must(await supabase.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null), "Marking read");
}
