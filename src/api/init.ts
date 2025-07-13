import { hash } from 'bcryptjs';

export async function onRequest(context) {
  const { env } = context;

  // 检查是否已存在管理员
  const exist = await env.DB.prepare('SELECT id FROM admin WHERE username = ?').bind('admin').first();
  if (exist) {
    return new Response(JSON.stringify({ success: false, message: '管理员已存在' }), { status: 400 });
  }

  // 创建默认管理员
  const passwordHash = await hash('admin123', 10);
  await env.DB.prepare(
    'INSERT INTO admin (username, password_hash) VALUES (?, ?)'
  ).bind('admin', passwordHash).run();

  return new Response(JSON.stringify({ success: true, message: '初始化成功，默认账号：admin/admin123' }));
}