// PUT /api/admin/lessons/<id>  (multipart form, any of: title, number, date, season, file, note, links)  - edit, replace the PDF, or set the note and links
//   note:  plain text shown to students under the lesson (up to 1000 characters; empty removes it)
//   links: JSON list of { label, url } (up to 10; an empty list removes them; addresses must start http:// or https://)
// DELETE /api/admin/lessons/<id>  - remove a lesson; infographics and board sets linked to it become unlinked
import { json, need, readIndex, writeIndex, checkTitle, checkDate, checkSeason, readPdf, readForm } from '../../../_lib/common.js';

const NOTE_LIMIT = 1000, LINK_LIMIT = 10, LABEL_LIMIT = 100, URL_LIMIT = 500;

/* Returns { note } or { error }. Line breaks are kept; nothing else is interpreted. */
function readNote(raw) {
  const note = String(raw || '').replace(/\r\n?/g, '\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (note.length > NOTE_LIMIT) return { error: 'The note is too long (' + NOTE_LIMIT + ' characters at most).' };
  return { note };
}

/* Returns { links } or { error }. Rows with neither text nor address are dropped. */
function readLinks(raw) {
  let rows;
  try { rows = JSON.parse(String(raw || '[]')); } catch (e) { return { error: 'The links were not understood.' }; }
  if (!Array.isArray(rows)) return { error: 'The links were not understood.' };
  const links = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] || {};
    const label = String(r.label || '').replace(/\s+/g, ' ').trim();
    const url = String(r.url || '').trim();
    if (!label && !url) continue;
    const n = 'Link ' + (i + 1) + ': ';
    if (!url) return { error: n + 'please give the web address.' };
    if (url.length > URL_LIMIT) return { error: n + 'the web address is too long.' };
    if (label.length > LABEL_LIMIT) return { error: n + 'the text is too long (' + LABEL_LIMIT + ' characters at most).' };
    let u = null;
    try { u = new URL(url); } catch (e) { u = null; }
    if (!u || (u.protocol !== 'https:' && u.protocol !== 'http:') || !/^https?:\/\//i.test(url)) return { error: n + 'the web address should start with https://' };
    links.push({ label, url });
  }
  if (links.length > LINK_LIMIT) return { error: 'A lesson can have ' + LINK_LIMIT + ' links at most.' };
  return { links };
}

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

  const n = form.has('note') ? readNote(form.get('note')) : null;
  if (n && n.error) return json({ error: n.error }, 400);
  const k = form.has('links') ? readLinks(form.get('links')) : null;
  if (k && k.error) return json({ error: k.error }, 400);

  const file = form.get('file');
  if (file && typeof file !== 'string' && file.size) {
    const pdf = await readPdf(file);
    if (pdf.error) return json({ error: pdf.error }, 400);
    await env.LESSONS.put('file:' + lesson.id, pdf.buf);
    lesson.size = pdf.size;
  }
  Object.assign(lesson, { title, number, date, season });
  if (n) { if (n.note) lesson.note = n.note; else delete lesson.note; }
  if (k) { if (k.links.length) lesson.links = k.links; else delete lesson.links; }
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
