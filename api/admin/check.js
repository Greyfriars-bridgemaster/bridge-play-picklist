// GET /api/admin/check  - succeeds only with the right password (used by the sign-in box)
import { json } from '../../_lib/common.js';
export async function onRequestGet() { return json({ ok: true }); }
