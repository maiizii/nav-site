import { verifyAdmin } from '../utils/auth';

export async function onRequest(context: any) {
  const { request, env } = context;
  if (!(await verifyAdmin(request, env))) {
    return new Response(JSON.stringify({ success: false, message: '未登录' }), { status: 401 });
  }
  const body = await request.json();
  const { id } = body;
  await env.DB.prepare('DELETE FROM nav_links WHERE id = ?').bind(id).run();
  return new Response(JSON.stringify({ success: true, message: '删除成功' }));
}
