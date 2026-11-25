// POST /api/admin/schedules  { title, rows }  - add a course schedule
import { json, need, readIndex, writeIndex, slugify, uniqueId, checkTitle, checkRows, seasonOf, readBody } from '../../_lib/common.js';

export async function onRequestPost({ request, env }) {
  const miss = need(env, 'SCHEDULES'); if (miss) return miss;
  const body = await readBody(request);
  if (!body) return json({ error: 'That request was not understood.' }, 400);
  const err = checkTitle(body.title);
  if (err) return json({ error: err.replace('it a title', 'the course a name') }, 400);
  const r = checkRows(body.rows);
  if (r.error) return json({ error: r.error }, 400);

  const list = await readIndex(env.SCHEDULES);
  const id = uniqueId(list, slugify(body.title));
  const item = { id, title: body.title.trim(), season: seasonOf(r.first), first: r.first, last: r.last, count: r.count };
  await env.SCHEDULES.put('sched:' + id, JSON.stringify(r.rows));
  list.push(item);
  await writeIndex(env.SCHEDULES, list);
  return json({ schedule: item }, 201);
}
