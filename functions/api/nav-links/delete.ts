export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  const body = await request.json();
  const { id } = body;
  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }
  await env.DB.prepare('DELETE FROM nav_links WHERE id=?').bind(id).run();
  return Response.json({ ok: true });
}
