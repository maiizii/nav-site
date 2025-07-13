import { comparePassword } from '../utils/password';
const AUTH_COOKIE_NAME = 'admin_token';

// 浏览器兼容的 base64 编码
function toBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

export async function onRequest(context: any) {
  const { request, env } = context;
  const body = await request.json();
  const { username, password } = body;

  const admin = await env.DB.prepare('SELECT id, password_hash FROM admin WHERE username = ?').bind(username).first();
  if (!admin) {
    return new Response(JSON.stringify({ success: false, message: '用户名或密码错误' }), { status: 401 });
  }

  const valid = await comparePassword(password, admin.password_hash);
  if (!valid) {
    return new Response(JSON.stringify({ success: false, message: '用户名或密码错误' }), { status: 401 });
  }

  const token = toBase64(`${admin.id}:${Date.now()}`);
  const resp = new Response(JSON.stringify({ success: true, message: '登录成功' }));

  resp.headers.append('Set-Cookie', `${AUTH_COOKIE_NAME}=${token}; Path=/; HttpOnly; Max-Age=604800; SameSite=Strict`);
  return resp;
}
