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

/* Adds the stable download address to each item. */
export const withUrl = (kind, list) => list.map(i => ({ ...i, fileUrl: '/files/' + kind + '/' + i.id + '.pdf' }));
