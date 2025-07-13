import { verifyAdmin, getAdminIdFromRequest } from '../utils/auth';

export async function onRequest(context: any) {
  const { request, env } = context;
  if (!(await verifyAdmin(request, env))) {
    return new Response(JSON.stringify({ success: false, message: '未登录' }), { status: 401 });
  }
  const adminId = getAdminIdFromRequest(request);
  const admin = await env.DB.prepare('SELECT id, username, created_at FROM admin WHERE id = ?').bind(adminId).first();
  if (!admin) {
    return new Response(JSON.stringify({ success: false, message: '管理员不存在' }), { status: 404 });
  }
  return new Response(JSON.stringify({ success: true, data: admin }));
}
