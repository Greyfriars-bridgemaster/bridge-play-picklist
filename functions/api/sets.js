// GET /api/sets  - the pick list of board sets (public): [{ id, title, date, boards, season, lessonId }]
import { json, need, readIndex, seasonOf } from '../_lib/common.js';

export async function onRequestGet({ env }) {
  const miss = need(env, 'BOARDS'); if (miss) return miss;
  const sets = (await readIndex(env.BOARDS)).map(s => ({ ...s, season: s.season || seasonOf(s.date), lessonId: s.lessonId || null }));
  return json({ sets });
}
