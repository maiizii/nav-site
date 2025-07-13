export async function onRequest(context) {
  // 检查 context.env 是否有 DB
  if (!context.env || !context.env.DB) {
    return new Response("D1 not bound", { status: 500 });
  }

  // 执行一个简单的 SQL 查询
  const { results } = await context.env.DB.prepare("SELECT 1 as test").first();
  return new Response("D1 ok, result: " + JSON.stringify(results));
}
