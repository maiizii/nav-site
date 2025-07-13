import { verifyAdmin, getAdminIdFromRequest } from '../utils/auth';
import { hash, compare } from 'bcryptjs';

export async function onRequest(context: any) {
  const { request, env } = context;
  if (!(await verifyAdmin(request, env))) {
    return new Response(JSON.stringify({ success: false, message: '未登录' }), { status: 401 });
  }
  const adminId = getAdminIdFromRequest(request);
  const body = await request.json();
  const { oldPassword, newPassword } = body;

  const admin = await env.DB.prepare('SELECT password_hash FROM admin WHERE id = ?').bind(adminId).first();
  if (!admin) return new Response(JSON.stringify({ success: false, message: '管理员不存在' }), { status: 404 });

  const valid = await compare(oldPassword, admin.password_hash);
  if (!valid) return new Response(JSON.stringify({ success: false, message: '当前密码错误' }), { status: 400 });

  if (!newPassword || newPassword.length < 6) {
    return new Response(JSON.stringify({ success: false, message: '新密码长度不能少于6个字符' }), { status: 400 });
  }

  const passwordHash = await hash(newPassword, 10);
  await env.DB.prepare('UPDATE admin SET password_hash = ? WHERE id = ?').bind(passwordHash, adminId).run();
  return new Response(JSON.stringify({ success: true, message: '密码修改成功' }));
}
