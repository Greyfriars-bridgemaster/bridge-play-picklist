// Shared helpers for the API. (Not a route: it has no onRequest handlers.)

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

/* A store (KV namespace) that has not been attached to the project yet. */
export function need(env, name) {
  return env[name] ? null : json({ error: 'Not set up: ' + name }, 503);
}

/* Each store keeps a small list of its items under the key "index". */
export async function readIndex(kv) {
  const text = await kv.get('index');
  if (!text) return [];
  try { const a = JSON.parse(text); return Array.isArray(a) ? a : []; } catch (e) { return []; }
}
export function writeIndex(kv, list) { return kv.put('index', JSON.stringify(list)); }

export function slugify(s) {
  return String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'item';
}
export function uniqueId(list, base) {
  let id = base, n = 2;
  while (list.some(s => s.id === id)) id = base + '-' + n++;
  return id;
}

/* ---- seasons: the club year runs September to August, written 2026/27 ---- */
export function seasonOf(iso) {
  const m = /^(\d{4})-(\d{2})/.exec(iso || '');
  if (!m) return '';
  const start = +m[2] >= 9 ? +m[1] : +m[1] - 1;
  return start + '/' + String((start + 1) % 100).padStart(2, '0');
}
export function currentSeason() {
  return seasonOf(new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' }));
}
export function checkSeason(s) {
  const m = /^(\d{4})\/(\d{2})$/.exec(s || '');
  return !!m && (+m[1] + 1) % 100 === +m[2];
}

/* Title: 1-100 characters. Date: a real calendar date written YYYY-MM-DD. Returns an error message or ''. */
export function checkTitle(title) {
  if (typeof title !== 'string' || !title.trim()) return 'Please give it a title.';
  if (title.trim().length > 100) return 'The title is too long (100 characters at most).';
  return '';
}
export function checkDate(date, optional) {
  if (optional && !date) return '';
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Please give the date.';
  const d = new Date(date + 'T00:00:00Z');
  if (isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== date) return 'That date does not exist.';
  return '';
}
export function checkMeta(title, date) { return checkTitle(title) || checkDate(date, false); }
export function checkSeasonMsg(season) { return checkSeason(season) ? '' : 'The season should look like 2026/27.'; }

/* A PBN file must hold at least one [Deal "..."] line and be of sensible size. */
export function checkPbn(text) {
  if (typeof text !== 'string') return { error: 'No file was received.' };
  if (text.length > 500000) return { error: 'That file is too large for a set of boards.' };
  const boards = (text.match(/^\s*\[Deal\s+"/gm) || []).length;
  if (!boards) return { error: 'No boards were found in that file. A PBN file needs a [Deal "N:..."] line for each board.' };
  return { boards };
}

/* An uploaded PDF: at most 20 MB (a KV value can be 25 MB), and it must start like a PDF. */
export const PDF_LIMIT = 20 * 1024 * 1024;
export async function readPdf(file) {
  if (!file || typeof file === 'string' || !file.size) return { error: 'Please choose a PDF file.' };
  if (file.size > PDF_LIMIT) return { error: 'That file is too large (20 MB at most).' };
  const buf = await file.arrayBuffer();
  if (new TextDecoder().decode(new Uint8Array(buf, 0, 5)) !== '%PDF-') return { error: 'That does not look like a PDF file.' };
  return { buf, size: buf.byteLength };
}

export async function readBody(request) {
  try { return await request.json(); } catch (e) { return null; }
}
export async function readForm(request) {
  try { return await request.formData(); } catch (e) { return null; }
}

export const lessonLabel = (l) => (l.number ? 'Lesson ' + l.number + ' – ' : '') + l.title;

/* Adds the stable download address to each item, and the address of its picture when it has one. */
export const withUrl = (kind, list) => list.map(i => ({
  ...i,
  fileUrl: '/files/' + kind + '/' + i.id + '.pdf',
  ...(i.thumb ? { thumbUrl: '/files/' + kind + '/' + i.id + '.jpg?v=' + i.thumb } : {})
}));

/* A picture of the first page, made by the admin page: a JPEG of at most 400 KB.
   Returns null if none was sent, { error } if it is not usable, or { buf }. */
export const THUMB_LIMIT = 400 * 1024;
export async function readThumb(file) {
  if (!file || typeof file === 'string' || !file.size) return null;
  if (file.size > THUMB_LIMIT) return { error: 'That picture is too large.' };
  const buf = await file.arrayBuffer();
  const b = new Uint8Array(buf, 0, 3);
  if (!(b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF)) return { error: 'That picture is not a JPEG.' };
  return { buf };
}

/* ---- course schedules: a list of lessons with dates, modules and teachers (first names only) ---- */
const clip = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);

/* Returns { rows, first, last, count } or { error }. A row with no lesson number is a note (e.g. "Christmas break"). */
export function checkRows(rows) {
  if (!Array.isArray(rows) || !rows.length) return { error: 'The schedule has no rows.' };
  if (rows.length > 80) return { error: 'That is too many rows (80 at most).' };
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] || {};
    const row = { n: clip(r.n, 6), date: clip(r.date, 10), module: clip(r.module, 100), description: clip(r.description, 120), teacher: clip(r.teacher, 60) };
    const where = 'Row ' + (i + 1) + ': ';
    if (row.date && checkDate(row.date, false)) return { error: where + 'the date is not valid.' };
    if (!row.module) return { error: where + 'please give the module (or the note text).' };
    if (row.n && !row.date) return { error: where + 'a lesson needs a date.' };
    out.push(row);
  }
  const dated = out.filter(r => r.n && r.date).map(r => r.date).sort();
  if (!dated.length) return { error: 'The schedule needs at least one numbered lesson with a date.' };
  return { rows: out, first: dated[0], last: dated[dated.length - 1], count: dated.length };
}

/* The course to show first: the earliest one whose last lesson has not yet passed, otherwise the most recent. */
export function pickDefault(list, today) {
  const byStart = list.slice().sort((a, b) => (a.first < b.first ? -1 : a.first > b.first ? 1 : 0));
  return (byStart.find(s => s.last >= today) || byStart[byStart.length - 1] || {}).id || null;
}
export const londonToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
