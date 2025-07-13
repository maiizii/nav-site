export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  const body = await request.json();
  const { id, name } = body;
  const sql = 'UPDATE nav_categories SET name=? WHERE id=?';
  await env.DB.prepare(sql).bind(name, id).run();
  return Response.json({ ok: true });
}
