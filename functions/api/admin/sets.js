// POST /api/admin/sets  { title, date, pbn, season?, lessonId? }  - add a set of boards
import { json, need, readIndex, writeIndex, slugify, uniqueId, checkMeta, checkPbn, checkSeason, seasonOf, readBody } from '../../_lib/common.js';

export async function onRequestPost({ request, env }) {
  const miss = need(env, 'BOARDS'); if (miss) return miss;
  const body = await readBody(request);
  if (!body) return json({ error: 'That request was not understood.' }, 400);
  const metaErr = checkMeta(body.title, body.date);
  if (metaErr) return json({ error: metaErr }, 400);
  const p = checkPbn(body.pbn);
  if (p.error) return json({ error: p.error }, 400);
  const season = body.season || seasonOf(body.date);
  if (!checkSeason(season)) return json({ error: 'The season should look like 2026/27.' }, 400);
  const lessonId = body.lessonId || null;
  if (lessonId && env.LESSONS && !(await readIndex(env.LESSONS)).some(l => l.id === lessonId)) return json({ error: 'That lesson no longer exists.' }, 400);

  const list = await readIndex(env.BOARDS);
  const id = uniqueId(list, slugify(body.title));
  const set = { id, title: body.title.trim(), date: body.date, boards: p.boards, season, lessonId };
  await env.BOARDS.put('pbn:' + id, body.pbn);
  list.push(set);
  await writeIndex(env.BOARDS, list);
  return json({ set }, 201);
}
