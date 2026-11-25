// POST /api/admin/infographics  (multipart form: file, title, lessonId?, season?)  - add an infographic PDF
import { json, need, readIndex, writeIndex, slugify, uniqueId, checkTitle, checkSeason, currentSeason, readPdf, readForm } from '../../_lib/common.js';

export async function onRequestPost({ request, env }) {
  const miss = need(env, 'INFOGRAPHICS'); if (miss) return miss;
  const form = await readForm(request);
  if (!form) return json({ error: 'That upload was not understood.' }, 400);
  const title = String(form.get('title') || '').trim();
  const lessonId = String(form.get('lessonId') || '') || null;
  const season = String(form.get('season') || '') || currentSeason();
  const err = checkTitle(title) || (checkSeason(season) ? '' : 'The season should look like 2026/27.');
  if (err) return json({ error: err }, 400);
  if (lessonId && env.LESSONS && !(await readIndex(env.LESSONS)).some(l => l.id === lessonId)) return json({ error: 'That lesson no longer exists.' }, 400);
  const pdf = await readPdf(form.get('file'));
  if (pdf.error) return json({ error: pdf.error }, 400);

  const list = await readIndex(env.INFOGRAPHICS);
  const id = uniqueId(list, slugify(title));
  const item = { id, season, title, lessonId, size: pdf.size };
  await env.INFOGRAPHICS.put('file:' + id, pdf.buf);
  list.push(item);
  await writeIndex(env.INFOGRAPHICS, list);
  return json({ infographic: item }, 201);
}
