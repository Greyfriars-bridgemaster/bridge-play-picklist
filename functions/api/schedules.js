// GET /api/schedules  - every course schedule (public), oldest first.
// { today, defaultId, schedules: [{ id, title, season, first, last, count, rows: [{ n, date, module, description, teacher }] }] }
// defaultId is the schedule to show first: the earliest one whose last lesson has not passed (UK date).
import { json, need, readIndex, pickDefault, londonToday } from '../_lib/common.js';

export async function onRequestGet({ env }) {
  const miss = need(env, 'SCHEDULES'); if (miss) return miss;
  const index = await readIndex(env.SCHEDULES);
  const schedules = [];
  for (const s of index) {
    const text = await env.SCHEDULES.get('sched:' + s.id);
    let rows = [];
    try { rows = JSON.parse(text) || []; } catch (e) { rows = []; }
    schedules.push({ ...s, rows });
  }
  schedules.sort((a, b) => (a.first < b.first ? -1 : a.first > b.first ? 1 : 0));
  const today = londonToday();
  return json({ today, defaultId: pickDefault(schedules, today), schedules });
}
