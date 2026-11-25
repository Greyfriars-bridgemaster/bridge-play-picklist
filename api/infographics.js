// GET /api/infographics[?lesson=<lesson id>][&season=2026/27]  - the infographics (public)
import { json, need, readIndex, withUrl } from '../_lib/common.js';

export async function onRequestGet({ env, request }) {
  const miss = need(env, 'INFOGRAPHICS'); if (miss) return miss;
  const q = new URL(request.url).searchParams;
  let list = await readIndex(env.INFOGRAPHICS);
  if (q.get('lesson')) list = list.filter(i => i.lessonId === q.get('lesson'));
  if (q.get('season')) list = list.filter(i => i.season === q.get('season'));
  return json({ infographics: withUrl('infographics', list) });
}
