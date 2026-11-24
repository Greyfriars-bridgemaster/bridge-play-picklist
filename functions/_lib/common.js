// Shared helpers for the board-set API. (Not a route: it has no onRequest handlers.)

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

export async function readIndex(kv) {
  const text = await kv.get('index');
  if (!text) return [];
  try { const a = JSON.parse(text); return Array.isArray(a) ? a : []; } catch (e) { return []; }
}

export function writeIndex(kv, list) { return kv.put('index', JSON.stringify(list)); }

export function slugify(s) {
  return String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'set';
}

/* Title: 1-100 characters. Date: a real calendar date written YYYY-MM-DD. */
export function checkMeta(title, date) {
  if (typeof title !== 'string' || !title.trim()) return 'Please give the set a title.';
  if (title.trim().length > 100) return 'The title is too long (100 characters at most).';
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Please give the lesson date.';
  const d = new Date(date + 'T00:00:00Z');
  if (isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== date) return 'That date does not exist.';
  return '';
}

/* A PBN file must hold at least one [Deal "..."] line and be of sensible size. */
export function checkPbn(text) {
  if (typeof text !== 'string') return { error: 'No file was received.' };
  if (text.length > 500000) return { error: 'That file is too large for a set of boards.' };
  const boards = (text.match(/^\s*\[Deal\s+"/gm) || []).length;
  if (!boards) return { error: 'No boards were found in that file. A PBN file needs a [Deal "N:..."] line for each board.' };
  return { boards };
}

export async function readBody(request) {
  try { return await request.json(); } catch (e) { return null; }
}
