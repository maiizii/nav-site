export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'GET') {
    // 查询所有导航链接
    const res = await env.DB.prepare('SELECT * FROM nav_links ORDER BY created_at DESC').all();
    return Response.json(res.results);
  }

  return Response.json({ error: '不支持的请求方法' }, { status: 405 });
}
