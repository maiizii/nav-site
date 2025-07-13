export async function onRequest(context: any) {
  const { env, request } = context;
  const body = await request.json();
  const { title, url, category, description } = body;
  await env.DB.prepare(
    'INSERT INTO nav_links (title, url, category, description) VALUES (?, ?, ?, ?)'
  ).bind(title, url, category, description).run();
  return new Response(JSON.stringify({ success: true }));
}