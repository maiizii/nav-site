export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  const list = await request.json(); // [{id, sort}, ...]
  for (const item of list) {
    await env.DB.prepare('UPDATE nav_categories SET sort=? WHERE id=?').bind(item.sort, item.id).run();
  }
  return Response.json({ ok: true });
}
