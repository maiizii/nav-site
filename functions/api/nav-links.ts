export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 搜索和标签筛选参数
  const search = url.searchParams.get('search')?.trim() || '';
  const tag = url.searchParams.get('tag')?.trim() || '';
  let sql = 'SELECT * FROM nav_links';
  let params = [];

  if (search) {
    sql += ' WHERE title LIKE ? OR description LIKE ? OR url LIKE ?';
    params = [`%${search}%`, `%${search}%`, `%${search}%`];
  } else if (tag) {
    // 如有 tags 字段，建议改为 tags LIKE ?
    sql += ' WHERE category = ?';
    params = [tag];
  }

  sql += ' ORDER BY category, created_at DESC';

  const res = await env.DB.prepare(sql).bind(...params).all();
  return Response.json(res.results);
}
