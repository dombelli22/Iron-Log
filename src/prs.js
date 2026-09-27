// For each saved session, which lifts beat the lifter's previous best *as of
// that day* — replayed oldest→newest, so a session keeps its PR badge even
// after you've since gone heavier. A first-ever log of an exercise isn't a PR
// (there was nothing to beat).
export function computeSessionPRs(history) {
  const ordered = history.map((s, i) => ({ s, i })).sort((a, b) => a.s.date.localeCompare(b.s.date) || a.i - b.i);
  const bests = {};
  const out = {};
  ordered.forEach(({ s }) => {
    const sessionBest = {};
    (s.blocks || []).forEach((b) => {
      if (b.type !== "reps") return;
      b.sets.forEach((st) => {
        if (!(st.weight > 0)) return;
        const cur = sessionBest[b.exercise];
        if (!cur || st.weight > cur.weight || (st.weight === cur.weight && st.value > cur.value)) sessionBest[b.exercise] = { exercise: b.exercise, weight: st.weight, value: st.value };
      });
    });
    const prs = [];
    Object.values(sessionBest).forEach((sb) => {
      const prev = bests[sb.exercise];
      if (prev && (sb.weight > prev.weight || (sb.weight === prev.weight && sb.value > prev.value))) prs.push(sb);
      if (!prev || sb.weight > prev.weight || (sb.weight === prev.weight && sb.value > prev.value)) bests[sb.exercise] = sb;
    });
    out[s.id] = prs;
  });
  return out;
}

// The few records worth showing on someone else's post, per workout id.
// Stored with each synced workout so other people's feeds can show badges
// without needing the poster's whole history.
export function prsForSync(history, max = 3) {
  const all = computeSessionPRs(history);
  const out = new Map();
  Object.entries(all).forEach(([id, prs]) => {
    out.set(id, prs.slice(0, max).map((p) => ({ exercise: p.exercise, weight: p.weight, value: p.value })));
  });
  return out;
}
