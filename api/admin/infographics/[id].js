// PUT /api/admin/infographics/<id>  (multipart form, any of: title, lessonId, season, file, thumb)  - edit, replace the PDF, or set its picture
// DELETE /api/admin/infographics/<id>  - remove an infographic
import { json, need, readIndex, writeIndex, checkTitle, checkSeason, readPdf, readThumb, readForm } from '../../../_lib/common.js';

export async function onRequestPut({ request, env, params }) {
  const miss = need(env, 'INFOGRAPHICS'); if (miss) return miss;
  const form = await readForm(request);
  if (!form) return json({ error: 'That upload was not understood.' }, 400);
  const list = await readIndex(env.INFOGRAPHICS);
  const item = list.find(i => i.id === params.id);
  if (!item) return json({ error: 'That infographic no longer exists.' }, 404);

  const title = form.has('title') ? String(form.get('title') || '').trim() : item.title;
  const season = form.has('season') ? String(form.get('season') || '').trim() : item.season;
  const lessonId = form.has('lessonId') ? (String(form.get('lessonId') || '') || null) : item.lessonId;
  const err = checkTitle(title) || (checkSeason(season) ? '' : 'The season should look like 2026/27.');
  if (err) return json({ error: err }, 400);
  if (lessonId && env.LESSONS && !(await readIndex(env.LESSONS)).some(l => l.id === lessonId)) return json({ error: 'That lesson no longer exists.' }, 400);

  const pic = await readThumb(form.get('thumb'));
  const file = form.get('file');
  if (file && typeof file !== 'string' && file.size) {
    const pdf = await readPdf(file);
    if (pdf.error) return json({ error: pdf.error }, 400);
    await env.INFOGRAPHICS.put('file:' + item.id, pdf.buf);
    item.size = pdf.size;
    if (!(pic && !pic.error)) { delete item.thumb; await env.INFOGRAPHICS.delete('thumb:' + item.id); }   // the old picture no longer matches
  }
  if (pic && !pic.error) { await env.INFOGRAPHICS.put('thumb:' + item.id, pic.buf); item.thumb = Date.now(); }
  Object.assign(item, { title, season, lessonId });
  await writeIndex(env.INFOGRAPHICS, list);
  return json({ infographic: item });
}

export async function onRequestDelete({ env, params }) {
  const miss = need(env, 'INFOGRAPHICS'); if (miss) return miss;
  const list = await readIndex(env.INFOGRAPHICS);
  if (!list.some(i => i.id === params.id)) return json({ error: 'That infographic no longer exists.' }, 404);
  await writeIndex(env.INFOGRAPHICS, list.filter(i => i.id !== params.id));
  await env.INFOGRAPHICS.delete('file:' + params.id);
  await env.INFOGRAPHICS.delete('thumb:' + params.id);
  return json({ ok: true });
}
