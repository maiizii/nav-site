export async function onRequest(context) {
  const { env } = context;
  const sql = 'SELECT * FROM nav_links ORDER BY sort ASC, id DESC';
  const res = await env.DB.prepare(sql).all();
  return Response.json({ data: res.results });
}
