// 升级：支持 category_id 字段，兼容旧 category 字段
export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  const body = await request.json();
  const { title, url, category, category_id, description, icon, sort } = body;
  await env.DB.prepare(
    'INSERT INTO nav_links (title, url, category, category_id, description, icon, sort) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(title, url, category ?? null, category_id ?? null, description, icon, sort ?? null).run();
  return Response.json({ ok: true });
}
