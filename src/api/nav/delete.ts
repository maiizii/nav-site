export async function onRequest(context: any) {
  const { env, request } = context;
  const { id } = await request.json();
  await env.DB.prepare(
    'DELETE FROM nav_links WHERE id = ?'
  ).bind(id).run();
  return new Response(JSON.stringify({ success: true }));
}