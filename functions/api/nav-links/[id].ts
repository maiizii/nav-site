export async function onRequest(context) {
  const { request, env, params } = context;
  const method = request.method;
  const id = params.id;

  if (!id) return new Response('ID required', { status: 400 });

  if (method === 'GET') {
    const res = await env.DB.prepare('SELECT * FROM nav_links WHERE id=?').bind(id).first();
    return Response.json(res || {});
  }

  if (method === 'PUT') {
    const body = await request.json();
    const { title, url: linkUrl, category, description, icon } = body;
    await env.DB.prepare(
      'UPDATE nav_links SET title=?, url=?, category=?, description=?, icon=? WHERE id=?'
    ).bind(title, linkUrl, category, description, icon, id).run();
    return Response.json({ ok: true });
  }

  if (method === 'DELETE') {
    await env.DB.prepare('DELETE FROM nav_links WHERE id=?').bind(id).run();
    return Response.json({ ok: true });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
