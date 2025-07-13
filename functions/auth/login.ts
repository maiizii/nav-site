export async function onRequest({ request }) {
  const { username, password } = await request.json();
  // 简化逻辑，可改为实际数据库校验
  if (username === 'admin' && password === '123456') {
    return new Response(JSON.stringify({ success: true, message: '登录成功' }), {
      headers: { 'Content-Type': 'application/json' },
      // 设置简单的 cookie 标识登录
      status: 200
    });
  }
  return new Response(JSON.stringify({ success: false, message: '用户名或密码错误' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 401
  });
}
