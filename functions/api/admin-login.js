export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    // 输出JWT_SECRET到日志
    console.log('[admin-login] env.JWT_SECRET =', env.JWT_SECRET);
    if (!env.JWT_SECRET) {
      return new Response(JSON.stringify({ msg: '服务器端JWT_SECRET未配置' }), { status: 500 });
    }

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

    // 日志输出
    console.log("输入密码:", password);
    console.log("计算hash:", hashHex);
    console.log("数据库hash:", admin.password_hash);

    if (hashHex !== admin.password_hash) {
      return new Response(JSON.stringify({ msg: "用户名或密码错误" }), { status: 401 });
    }

    // JWT base64url编码
    function base64url(str) {
      return btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = base64url(JSON.stringify({ adminId: admin.id, username, exp: Math.floor(Date.now() / 1000) + 7200 }));
    const signature = await signJWT(header, payload, env.JWT_SECRET);
    const token = [header, payload, signature].join('.');

    return new Response(JSON.stringify({ token }), { status: 200 });
  } catch (err) {
    // 错误输出到日志
    console.log("[admin-login] 后台报错:", err);
    return new Response(
      JSON.stringify({ msg: "服务器异常", detail: err.message }),
      { status: 500 }
    );
  }
}

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
  // base64url 编码
  const b64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
