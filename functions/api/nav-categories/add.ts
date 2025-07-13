export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  const body = await request.json();
  const { name } = body;
  const sql = 'INSERT INTO nav_categories (name, sort) VALUES (?, ?)';
  await env.DB.prepare(sql).bind(name, 9999).run(); // 默认在最后
  return Response.json({ ok: true });
}
