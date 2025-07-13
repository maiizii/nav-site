export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;

  // 匹配 /api/nav-links/:id
  const idMatch = pathname.match(/^\/api\/nav-links\/(\d+)$/);
  const id = idMatch ? idMatch[1] : undefined;

  // GET 全部或搜索
  if (method === 'GET' && !id) {
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

  // 新增
  if (method === 'POST' && !id) {
    const body = await request.json();
    const { title, url: linkUrl, category, description, icon } = body;
    await env.DB.prepare(
      'INSERT INTO nav_links (title, url, category, description, icon) VALUES (?, ?, ?, ?, ?)'
    ).bind(title, linkUrl, category, description, icon).run();
    return Response.json({ ok: true });
  }

  // 编辑
  if (method === 'PUT' && id) {
    const body = await request.json();
    const { title, url: linkUrl, category, description, icon } = body;
    await env.DB.prepare(
      'UPDATE nav_links SET title=?, url=?, category=?, description=?, icon=? WHERE id=?'
    ).bind(title, linkUrl, category, description, icon, id).run();
    return Response.json({ ok: true });
  }

  // 删除
  if (method === 'DELETE' && id) {
    await env.DB.prepare('DELETE FROM nav_links WHERE id=?').bind(id).run();
    return Response.json({ ok: true });
  }

  // 兜底404
  return new Response('Not Found', { status: 404 });
}
