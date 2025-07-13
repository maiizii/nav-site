import { verifyAdmin } from '../../utils/auth';

export async function onRequest(context: any) {
  const { request, env } = context;
  if (!(await verifyAdmin(request, env))) {
    return new Response(JSON.stringify({ success: false, message: '未登录' }), { status: 401 });
  }
  const body = await request.json();
  const { id, title, url, category, description } = body;
  await env.DB.prepare(
    'UPDATE nav_links SET title = ?, url = ?, category = ?, description = ? WHERE id = ?'
  ).bind(title, url, category, description, id).run();
  return new Response(JSON.stringify({ success: true, message: '修改成功' }));
}
