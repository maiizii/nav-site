// 需要修改：支持 parent_id 字段
export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  const body = await request.json();
  const { id, name, parent_id } = body;
  const sql = 'UPDATE nav_categories SET name=?, parent_id=? WHERE id=?';
  await env.DB.prepare(sql).bind(name, parent_id ?? null, id).run();
  return Response.json({ ok: true });
}
