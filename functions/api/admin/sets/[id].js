// PUT /api/admin/sets/<id>  { title?, date?, season?, lessonId?, pbn? }  - edit, or replace the file
// DELETE /api/admin/sets/<id>                                            - remove a set
import { json, need, readIndex, writeIndex, checkMeta, checkPbn, checkSeason, readBody } from '../../../_lib/common.js';

export async function onRequestPut({ request, env, params }) {
  const miss = need(env, 'BOARDS'); if (miss) return miss;
  const body = await readBody(request);
  if (!body) return json({ error: 'That request was not understood.' }, 400);
  const list = await readIndex(env.BOARDS);
  const set = list.find(s => s.id === params.id);
  if (!set) return json({ error: 'That set no longer exists.' }, 404);

  const title = body.title === undefined ? set.title : body.title;
  const date = body.date === undefined ? set.date : body.date;
  const metaErr = checkMeta(title, date);
  if (metaErr) return json({ error: metaErr }, 400);
  if (body.season !== undefined) {
    if (!checkSeason(body.season)) return json({ error: 'The season should look like 2026/27.' }, 400);
    set.season = body.season;
  }
  if (body.lessonId !== undefined) {
    const lessonId = body.lessonId || null;
    if (lessonId && env.LESSONS && !(await readIndex(env.LESSONS)).some(l => l.id === lessonId)) return json({ error: 'That lesson no longer exists.' }, 400);
    set.lessonId = lessonId;
  }
  if (body.pbn !== undefined) {
    const p = checkPbn(body.pbn);
    if (p.error) return json({ error: p.error }, 400);
    await env.BOARDS.put('pbn:' + set.id, body.pbn);
    set.boards = p.boards;
  }
  set.title = title.trim(); set.date = date;
  await writeIndex(env.BOARDS, list);
  return json({ set });
}

export async function onRequestDelete({ env, params }) {
  const miss = need(env, 'BOARDS'); if (miss) return miss;
  const list = await readIndex(env.BOARDS);
  if (!list.some(s => s.id === params.id)) return json({ error: 'That set no longer exists.' }, 404);
  await writeIndex(env.BOARDS, list.filter(s => s.id !== params.id));
  await env.BOARDS.delete('pbn:' + params.id);
  return json({ ok: true });
}
