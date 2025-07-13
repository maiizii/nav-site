import { hashPassword } from './utils/password';

export async function onRequest(context: any) {
  const { env } = context;
  const exist = await env.DB.prepare('SELECT id FROM admin WHERE username = ?').bind('admin').first();
  if (exist) {
    return new Response(JSON.stringify({ success: false, message: '管理员已存在' }), { status: 400 });
  }

  const passwordHash = await hashPassword('admin123');
  await env.DB.prepare(
    'INSERT INTO admin (username, password_hash) VALUES (?, ?)'
  ).bind('admin', passwordHash).run();

  return new Response(JSON.stringify({ success: true, message: '初始化成功，默认账号：admin/admin123' }));
}
