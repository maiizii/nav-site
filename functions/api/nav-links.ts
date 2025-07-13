export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method;

  // GET 全部
  if (method === 'GET') {
    const search = url.searchParams.get('search')?.trim() || '';
    const tag = url.searchParams.get('tag')?.trim() || '';
    let sql = 'SELECT * FROM nav_links';
    let params = [];
    if (search) {
      sql += ' WHERE title LIKE ? OR description LIKE ? OR url LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    } else if (tag) {
      sql += ' WHERE category = ?';
      params = [tag];
    }
    sql += ' ORDER BY category, created_at DESC';
    const res = await env.DB.prepare(sql).bind(...params).all();
    return Response.json(res.results);
  }

  // POST 新增一条
  if (method === 'POST') {
    const body = await request.json();
    const { title, url: linkUrl, category, description, icon } = body;
    await env.DB.prepare(
      'INSERT INTO nav_links (title, url, category, description, icon) VALUES (?, ?, ?, ?, ?)'
    ).bind(title, linkUrl, category, description, icon).run();
    return Response.json({ ok: true });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
