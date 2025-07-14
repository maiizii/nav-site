export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  const body = await request.json();
  const { title, url, category, description, icon } = body;
  await env.DB.prepare(
    'INSERT INTO nav_links (title, url, category, description, icon) VALUES (?, ?, ?, ?, ?)'
  ).bind(title, url, category, description, icon).run();
  return Response.json({ ok: true });
}
