export async function onRequest(context: any) {
  const { env } = context;
  const result = await env.DB.prepare(
    'SELECT * FROM nav_links ORDER BY category, created_at DESC'
  ).all();
  return new Response(JSON.stringify({ success: true, data: result.results }), { headers: { 'Content-Type': 'application/json' } });
}
