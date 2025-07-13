import { compare } from 'bcryptjs';
const AUTH_COOKIE_NAME = 'admin_token';

export async function onRequest(context: any) {
  const { request, env } = context;
  const body = await request.json();
  const { username, password } = body;

  const admin = await env.DB.prepare('SELECT id, password_hash FROM admin WHERE username = ?').bind(username).first();
  if (!admin) {
    return new Response(JSON.stringify({ success: false, message: '用户名或密码错误' }), { status: 401 });
  }

  const valid = await compare(password, admin.password_hash);
  if (!valid) {
    return new Response(JSON.stringify({ success: false, message: '用户名或密码错误' }), { status: 401 });
  }

  const token = Buffer.from(`${admin.id}:${Date.now()}`).toString('base64');
  const resp = new Response(JSON.stringify({ success: true, message: '登录成功' }));

  resp.headers.append('Set-Cookie', `${AUTH_COOKIE_NAME}=${token}; Path=/; HttpOnly; Max-Age=604800; SameSite=Strict`);
  return resp;
}
