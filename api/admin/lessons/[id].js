// PUT /api/admin/lessons/<id>  (multipart form, any of: title, number, date, season, file)  - edit, or replace the PDF
// DELETE /api/admin/lessons/<id>  - remove a lesson; infographics and board sets linked to it become unlinked
import { json, need, readIndex, writeIndex, checkTitle, checkDate, checkSeason, readPdf, readForm } from '../../../_lib/common.js';

export async function onRequestPut({ request, env, params }) {
  const miss = need(env, 'LESSONS'); if (miss) return miss;
  const form = await readForm(request);
  if (!form) return json({ error: 'That upload was not understood.' }, 400);
  const list = await readIndex(env.LESSONS);
  const lesson = list.find(l => l.id === params.id);
  if (!lesson) return json({ error: 'That lesson no longer exists.' }, 404);

  const text = (k, cur) => (form.has(k) ? String(form.get(k) || '').trim() : cur);
  const title = text('title', lesson.title), number = text('number', lesson.number);
  const date = text('date', lesson.date), season = text('season', lesson.season);
  const err = checkTitle(title) || checkDate(date, true) || (number.length > 10 ? 'The lesson number is too long.' : '') || (checkSeason(season) ? '' : 'The season should look like 2026/27.');
  if (err) return json({ error: err }, 400);

  const file = form.get('file');
  if (file && typeof file !== 'string' && file.size) {
    const pdf = await readPdf(file);
    if (pdf.error) return json({ error: pdf.error }, 400);
    await env.LESSONS.put('file:' + lesson.id, pdf.buf);
    lesson.size = pdf.size;
  }
  Object.assign(lesson, { title, number, date, season });
  await writeIndex(env.LESSONS, list);
  return json({ lesson });
}

export async function onRequestDelete({ env, params }) {
  const miss = need(env, 'LESSONS'); if (miss) return miss;
  const list = await readIndex(env.LESSONS);
  if (!list.some(l => l.id === params.id)) return json({ error: 'That lesson no longer exists.' }, 404);
  await writeIndex(env.LESSONS, list.filter(l => l.id !== params.id));
  await env.LESSONS.delete('file:' + params.id);
  for (const name of ['INFOGRAPHICS', 'BOARDS']) {
    if (!env[name]) continue;
    const items = await readIndex(env[name]);
    let changed = false;
    items.forEach(i => { if (i.lessonId === params.id) { i.lessonId = null; changed = true; } });
    if (changed) await writeIndex(env[name], items);
  }
  return json({ ok: true });
}
