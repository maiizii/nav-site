export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  const body = await request.json();
  const { id, title, url, category, description, icon, sort } = body;
  // 允许前端提交上述字段
  await env.DB.prepare(
    'UPDATE nav_links SET title=?, url=?, category=?, description=?, icon=?, sort=? WHERE id=?'
  ).bind(title, url, category, description, icon, sort ?? 0, id).run();
  return Response.json({ ok: true });
}
