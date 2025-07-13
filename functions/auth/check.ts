export async function onRequest({ request }) {
  // 这里可检查 Cookie 或 Session，演示直接返回已登录
  // 实际部署时可用 KV 或 D1 检查登录状态
  // 假设只要访问就视为登录，可自行完善
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
