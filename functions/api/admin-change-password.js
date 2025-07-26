export async function onRequestPost(context) {
  const { request, env } = context;
  // 输出JWT_SECRET到日志
  console.log('[admin-change-password] env.JWT_SECRET =', env.JWT_SECRET);
  if (!env.JWT_SECRET) {
    return new Response(JSON.stringify({ msg: '服务器端JWT_SECRET未配置' }), { status: 500 });
  }
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
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    if (!headerB64 || !payloadB64 || !signatureB64) return null;
    
    // 添加 base64url 填充处理
    const addPadding = (str) => {
      while (str.length % 4) {
        str += '=';
      }
      return str;
    };
    
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
    
    // 使用带填充的 base64url 解码
    const signaturePadded = addPadding(signatureB64);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      Uint8Array.from(atob(signaturePadded), c => c.charCodeAt(0)),
      new TextEncoder().encode(headerB64 + "." + payloadB64)
    );
    
    if (!valid) return null;
    
    // 使用带填充的 base64url 解码载荷
    const payloadPadded = addPadding(payloadB64);
    const payload = JSON.parse(atob(payloadPadded));
    
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (error) {
    console.error('JWT 验证错误:', error);
    return null;
  }
}
