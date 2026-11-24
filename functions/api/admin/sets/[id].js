// PUT /api/admin/sets/<id>  { title?, date?, pbn? }  - rename, change date, or replace the file
// DELETE /api/admin/sets/<id>                        - remove a set
import { json, readIndex, writeIndex, checkMeta, checkPbn, readBody } from '../../../_lib/common.js';

export async function onRequestPut({ request, env, params }) {
  const body = await readBody(request);
  if (!body) return json({ error: 'That request was not understood.' }, 400);
  const list = await readIndex(env.BOARDS);
  const set = list.find(s => s.id === params.id);
  if (!set) return json({ error: 'That set no longer exists.' }, 404);

  const title = body.title === undefined ? set.title : body.title;
  const date = body.date === undefined ? set.date : body.date;
  const metaErr = checkMeta(title, date);
  if (metaErr) return json({ error: metaErr }, 400);
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
  const list = await readIndex(env.BOARDS);
  if (!list.some(s => s.id === params.id)) return json({ error: 'That set no longer exists.' }, 404);
  await writeIndex(env.BOARDS, list.filter(s => s.id !== params.id));
  await env.BOARDS.delete('pbn:' + params.id);
  return json({ ok: true });
}
