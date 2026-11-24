// Everything under /api/admin needs the maintenance password, sent as "Authorization: Bearer <password>".
import { json } from '../../_lib/common.js';

async function sameText(a, b) {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(a)), crypto.subtle.digest('SHA-256', enc.encode(b))]);
  const x = new Uint8Array(ha), y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export async function onRequest({ request, env, next }) {
  if (!env.BOARDS || !env.ADMIN_PASSWORD) return json({ error: 'Not set up' }, 503);
  const given = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!given || !(await sameText(given, String(env.ADMIN_PASSWORD)))) return json({ error: 'Wrong password' }, 401);
  return next();
}
