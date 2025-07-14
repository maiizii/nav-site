export async function onRequestPost(context) {
  const { request, env } = context;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return new Response(JSON.stringify({ msg: '未登录' }), { status: 401 });
  }
  // JWT 验证
  const jwt = require('@tsndr/cloudflare-worker-jwt');
  const SECRET = env.JWT_SECRET || 'your_jwt_secret';
  let payload;
  try {
    payload = await jwt.verify(token, SECRET);
    if (!payload) throw new Error();
  } catch (e) {
    return new Response(JSON.stringify({ msg: '登录已过期，请重新登录' }), { status: 401 });
  }
  const { oldPassword, newPassword } = await request.json();
  // 查询管理员
  const stmt = env.DB.prepare("SELECT * FROM admin WHERE id = ?");
  const admin = await stmt.bind(payload.adminId).first();
  if (!admin) {
    return new Response(JSON.stringify({ msg: "未找到用户" }), { status: 401 });
  }
  // 校验原密码
  const bcrypt = require('bcryptjs');
  const match = await bcrypt.compare(oldPassword, admin.password_hash);
  if (!match) {
    return new Response(JSON.stringify({ msg: "原密码错误" }), { status: 400 });
  }
  // 更新新密码
  const newHash = await bcrypt.hash(newPassword, 10);
  await env.DB.prepare("UPDATE admin SET password_hash = ? WHERE id = ?").bind(newHash, admin.id).run();
  return new Response(JSON.stringify({ msg: "密码修改成功" }), { status: 200 });
}
