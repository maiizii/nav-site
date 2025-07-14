export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();
  const { username, password } = body;

  // 查询数据库
  const stmt = env.DB.prepare("SELECT * FROM admin WHERE username = ?");
  const admin = await stmt.bind(username).first();
  if (!admin) {
    return new Response(JSON.stringify({ msg: "用户名或密码错误" }), { status: 401 });
  }

  // 计算 SHA-256
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const hashBuf = await crypto.subtle.digest("SHA-256", data);
  const hashHex = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

  if (hashHex !== admin.password_hash) {
    return new Response(JSON.stringify({ msg: "用户名或密码错误" }), { status: 401 });
  }

  // 生成 JWT（简单实现，无库依赖）
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ adminId: admin.id, username, exp: Math.floor(Date.now()/1000) + 7200 }));
  const signature = await signJWT(header, payload, env.JWT_SECRET);
  const token = [header, payload, signature].join('.');

  return new Response(JSON.stringify({ token }), { status: 200 });
}

// 简单 HMAC-SHA256 JWT签名
async function signJWT(header, payload, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(header + "." + payload)
  );
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}
