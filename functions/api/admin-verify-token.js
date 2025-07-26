export async function onRequestPost(context) {
  const { request, env } = context;
  // 输出JWT_SECRET到日志
  console.log('[admin-verify-token] env.JWT_SECRET =', env.JWT_SECRET);
  if (!env.JWT_SECRET) {
    return new Response(JSON.stringify({ msg: '服务器端JWT_SECRET未配置' }), { status: 500 });
  }
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  console.log('[admin-verify-token] token =', token);
  if (!token) return new Response(JSON.stringify({ msg: '未登录' }), { status: 401 });

  let payload;
  try {
    payload = await verifyJWT(token, env.JWT_SECRET);
    console.log('[admin-verify-token] payload =', payload);
    if (!payload || !payload.adminId) throw new Error();
  } catch (e) {
    return new Response(JSON.stringify({ msg: '登录已过期，请重新登录' }), { status: 401 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

// 直接复用你已写的 verifyJWT 方法
async function verifyJWT(token, secret) {
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  if (!headerB64 || !payloadB64 || !signatureB64) return null;
  
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  
  // 修复base64url解码
  const fixedSignature = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - fixedSignature.length % 4) % 4);
  const signature = fixedSignature + padding;
  
  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      Uint8Array.from(atob(signature), c => c.charCodeAt(0)),
      new TextEncoder().encode(headerB64 + "." + payloadB64)
    );
    if (!valid) return null;
    
    // 修复base64url解码
    const fixedPayload = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const payloadPadding = '='.repeat((4 - fixedPayload.length % 4) % 4);
    const payloadDecoded = fixedPayload + payloadPadding;
    
    const payload = JSON.parse(atob(payloadDecoded));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (e) {
    console.error('[verifyJWT] 解码错误:', e);
    return null;
  }
}
