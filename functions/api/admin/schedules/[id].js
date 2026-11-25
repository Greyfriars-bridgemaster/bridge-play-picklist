// PUT /api/admin/schedules/<id>  { title?, rows? }  - rename, or replace the whole schedule
// DELETE /api/admin/schedules/<id>                  - remove a schedule
import { json, need, readIndex, writeIndex, checkTitle, checkRows, seasonOf, readBody } from '../../../_lib/common.js';

export async function onRequestPut({ request, env, params }) {
  const miss = need(env, 'SCHEDULES'); if (miss) return miss;
  const body = await readBody(request);
  if (!body) return json({ error: 'That request was not understood.' }, 400);
  const list = await readIndex(env.SCHEDULES);
  const item = list.find(s => s.id === params.id);
  if (!item) return json({ error: 'That schedule no longer exists.' }, 404);

  if (body.title !== undefined) {
    const err = checkTitle(body.title);
    if (err) return json({ error: err.replace('it a title', 'the course a name') }, 400);
    item.title = body.title.trim();
  }
  if (body.rows !== undefined) {
    const r = checkRows(body.rows);
    if (r.error) return json({ error: r.error }, 400);
    await env.SCHEDULES.put('sched:' + item.id, JSON.stringify(r.rows));
    Object.assign(item, { season: seasonOf(r.first), first: r.first, last: r.last, count: r.count });
  }
  await writeIndex(env.SCHEDULES, list);
  return json({ schedule: item });
}

export async function onRequestDelete({ env, params }) {
  const miss = need(env, 'SCHEDULES'); if (miss) return miss;
  const list = await readIndex(env.SCHEDULES);
  if (!list.some(s => s.id === params.id)) return json({ error: 'That schedule no longer exists.' }, 404);
  await writeIndex(env.SCHEDULES, list.filter(s => s.id !== params.id));
  await env.SCHEDULES.delete('sched:' + params.id);
  return json({ ok: true });
}
