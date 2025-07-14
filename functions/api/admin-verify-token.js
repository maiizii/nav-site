export async function onRequestPost(context) {
  const { request, env } = context;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return new Response(JSON.stringify({ msg: '未登录' }), { status: 401 });

  let payload;
  try {
    payload = await verifyJWT(token, env.JWT_SECRET); // 用你已有的 verifyJWT
    if (!payload || !payload.adminId) throw new Error();
  } catch (e) {
    return new Response(JSON.stringify({ msg: '登录已过期，请重新登录' }), { status: 401 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

// 可以直接复用你 admin-change-password.js 里的 verifyJWT
