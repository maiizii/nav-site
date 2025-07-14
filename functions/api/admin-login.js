export async function onRequestPost(context) {
  const { request, env } = context;
  const { username, password } = await request.json();
  // 查询管理员
  const stmt = env.DB.prepare("SELECT * FROM admin WHERE username = ?");
  const admin = await stmt.bind(username).first();
  if (!admin) {
    return new Response(JSON.stringify({ msg: "用户名或密码错误" }), { status: 401 });
  }
  // bcrypt 校验密码
  const bcrypt = require('bcryptjs');
  const match = await bcrypt.compare(password, admin.password_hash);
  if (!match) {
    return new Response(JSON.stringify({ msg: "用户名或密码错误" }), { status: 401 });
  }
  // JWT
  const jwt = require('@tsndr/cloudflare-worker-jwt');
  const SECRET = env.JWT_SECRET || 'your_jwt_secret';
  const payload = { adminId: admin.id, username };
  const token = await jwt.sign(payload, SECRET, { exp: Math.floor(Date.now()/1000) + 7200 });
  return new Response(JSON.stringify({ token }), { status: 200 });
}
