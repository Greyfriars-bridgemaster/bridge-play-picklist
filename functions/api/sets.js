// GET /api/sets  - the pick list (public): [{ id, title, date, boards }]
import { json, readIndex } from '../_lib/common.js';

export async function onRequestGet({ env }) {
  if (!env.BOARDS) return json({ error: 'Not set up' }, 503);
  return json({ sets: await readIndex(env.BOARDS) });
}
