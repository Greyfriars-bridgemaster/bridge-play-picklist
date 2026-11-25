// Sends one stored PDF. Used by /files/lessons/<id>.pdf and /files/infographics/<id>.pdf
import { readIndex, lessonLabel } from './common.js';

export function serveFile(binding, kind) {
  return async function onRequestGet({ env, params, request }) {
    const kv = env[binding];
    if (!kv) return new Response('Not set up', { status: 503 });
    const raw = String(params.name || '');
    const wantsPicture = /\.jpe?g$/i.test(raw);
    const id = raw.replace(/\.(pdf|jpe?g)$/i, '');
    const item = (await readIndex(kv)).find(s => s.id === id);
    if (!item) return new Response('Not found', { status: 404 });
    if (wantsPicture) {
      const pic = await kv.get('thumb:' + id, 'stream');
      if (!pic) return new Response('Not found', { status: 404 });
      return new Response(pic, { headers: { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=86400', 'x-content-type-options': 'nosniff' } });
    }
    const body = await kv.get('file:' + id, 'stream');
    if (!body) return new Response('Not found', { status: 404 });
    const nice = (kind === 'lessons' ? lessonLabel(item) : item.title).replace(/[\\/:*?"<>|]+/g, ' ').trim() + '.pdf';
    const ascii = nice.replace(/[^A-Za-z0-9 ._-]+/g, '_');
    const how = new URL(request.url).searchParams.get('download') === '1' ? 'attachment' : 'inline';
    return new Response(body, {
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': how + '; filename="' + ascii + '"; filename*=UTF-8\'\'' + encodeURIComponent(nice),
        'cache-control': 'public, max-age=60',
        'x-content-type-options': 'nosniff'
      }
    });
  };
}
