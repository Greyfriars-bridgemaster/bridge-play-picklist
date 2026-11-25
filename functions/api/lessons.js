// GET /api/lessons[?season=2026/27]  - the lessons (public)
import { json, need, readIndex, withUrl } from '../_lib/common.js';

export async function onRequestGet({ env, request }) {
  const miss = need(env, 'LESSONS'); if (miss) return miss;
  const season = new URL(request.url).searchParams.get('season');
  let list = await readIndex(env.LESSONS);
  if (season) list = list.filter(l => l.season === season);
  return json({ lessons: withUrl('lessons', list) });
}
