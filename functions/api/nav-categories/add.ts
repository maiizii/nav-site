// 需要修改：支持 parent_id 字段
export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  const body = await request.json();
  const { name, parent_id } = body;
  const sql = 'INSERT INTO nav_categories (name, parent_id, sort) VALUES (?, ?, ?)';
  await env.DB.prepare(sql).bind(name, parent_id ?? null, 9999).run(); // 默认在最后
  return Response.json({ ok: true });
}
