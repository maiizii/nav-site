export async function onRequestPost(context) {
  const { request, env } = context;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return new Response(JSON.stringify({ msg: '未登录' }), { status: 401 });

  let payload;
  try {
    payload = await verifyJWT(token, env.JWT_SECRET);
    if (!payload || !payload.adminId) throw new Error();
  } catch (e) {
    return new Response(JSON.stringify({ msg: '登录已过期，请重新登录' }), { status: 401 });
  }

  const { oldPassword, newPassword } = await request.json();
  const stmt = env.DB.prepare("SELECT * FROM admin WHERE id = ?");
  const admin = await stmt.bind(payload.adminId).first();
  if (!admin) return new Response(JSON.stringify({ msg: "未找到用户" }), { status: 401 });

  // 校验原密码
  const enc = new TextEncoder();
  const oldBuf = enc.encode(oldPassword);
  const oldHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", oldBuf))).map(b => b.toString(16).padStart(2, '0')).join('');
  if (oldHash !== admin.password_hash) {
    return new Response(JSON.stringify({ msg: "原密码错误" }), { status: 400 });
  }

  // 新密码hash
  const newBuf = enc.encode(newPassword);
  const newHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", newBuf))).map(b => b.toString(16).padStart(2, '0')).join('');
  await env.DB.prepare("UPDATE admin SET password_hash = ? WHERE id = ?").bind(newHash, admin.id).run();

  return new Response(JSON.stringify({ msg: "密码修改成功" }), { status: 200 });
}

// 简单 JWT 验证函数
async function verifyJWT(token, secret) {
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0)),
    new TextEncoder().encode(headerB64 + "." + payloadB64)
  );
  if (!valid) return null;
  const payload = JSON.parse(atob(payloadB64));
  if (payload.exp && payload.exp < Math.floor(Date.now()/1000)) return null;
  return payload;
}
