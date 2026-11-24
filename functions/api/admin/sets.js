// POST /api/admin/sets  { title, date, pbn }  - add a set of boards
import { json, readIndex, writeIndex, slugify, checkMeta, checkPbn, readBody } from '../../_lib/common.js';

export async function onRequestPost({ request, env }) {
  const body = await readBody(request);
  if (!body) return json({ error: 'That request was not understood.' }, 400);
  const metaErr = checkMeta(body.title, body.date);
  if (metaErr) return json({ error: metaErr }, 400);
  const p = checkPbn(body.pbn);
  if (p.error) return json({ error: p.error }, 400);

  const list = await readIndex(env.BOARDS);
  const base = slugify(body.title);
  let id = base, n = 2;
  while (list.some(s => s.id === id)) id = base + '-' + n++;

  const set = { id, title: body.title.trim(), date: body.date, boards: p.boards };
  await env.BOARDS.put('pbn:' + id, body.pbn);
  list.push(set);
  await writeIndex(env.BOARDS, list);
  return json({ set }, 201);
}
