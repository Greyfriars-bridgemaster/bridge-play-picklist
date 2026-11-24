// GET /api/pbn/<id>  - the PBN text for one set (public)
export async function onRequestGet({ env, params }) {
  if (!env.BOARDS) return new Response('Not set up', { status: 503 });
  const text = await env.BOARDS.get('pbn:' + params.id);
  if (text === null) return new Response('Not found', { status: 404 });
  return new Response(text, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }
  });
}
