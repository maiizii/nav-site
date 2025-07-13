import { verifyAdmin } from '../utils/auth'

export async function onRequest(context: any) {
  const { request, env } = context;
  if (!(await verifyAdmin(request, env))) {
    return new Response(JSON.stringify({ success: false, message: '未登录' }), { status: 401 });
  }
  const body = await request.json();
  const { title, url, category, description } = body;
  await env.DB.prepare(
    'INSERT INTO nav_links (title, url, category, description) VALUES (?, ?, ?, ?)'
  ).bind(title, url, category, description).run();
  return new Response(JSON.stringify({ success: true, message: '添加成功' }));
}
