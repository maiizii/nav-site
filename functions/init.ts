export async function onRequest(context) {
  // 创建表
  await context.env.DB.prepare('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)').run();
  // 插入一行
  await context.env.DB.prepare('INSERT INTO test (name) VALUES (?)').bind('hello').run();
  // 查询
  const row = await context.env.DB.prepare('SELECT * FROM test ORDER BY id DESC LIMIT 1').first();
  return new Response(JSON.stringify(row));
}
