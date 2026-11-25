// POST /api/admin/lessons  (multipart form: file, title, number?, date?, season?)  - add a lesson PDF
import { json, need, readIndex, writeIndex, slugify, uniqueId, checkTitle, checkDate, checkSeason, seasonOf, currentSeason, readPdf, readForm } from '../../_lib/common.js';

export async function onRequestPost({ request, env }) {
  const miss = need(env, 'LESSONS'); if (miss) return miss;
  const form = await readForm(request);
  if (!form) return json({ error: 'That upload was not understood.' }, 400);
  const title = String(form.get('title') || '').trim();
  const number = String(form.get('number') || '').trim();
  const date = String(form.get('date') || '');
  const season = String(form.get('season') || '') || seasonOf(date) || currentSeason();
  const err = checkTitle(title) || checkDate(date, true) || (number.length > 10 ? 'The lesson number is too long.' : '') || (checkSeason(season) ? '' : 'The season should look like 2026/27.');
  if (err) return json({ error: err }, 400);
  const pdf = await readPdf(form.get('file'));
  if (pdf.error) return json({ error: pdf.error }, 400);

  const list = await readIndex(env.LESSONS);
  const id = uniqueId(list, slugify((number ? 'lesson-' + number + '-' : '') + title));
  const lesson = { id, season, number, title, date, size: pdf.size };
  await env.LESSONS.put('file:' + id, pdf.buf);
  list.push(lesson);
  await writeIndex(env.LESSONS, list);
  return json({ lesson }, 201);
}
