export async function queryD1(env: any, sql: string, params: any[] = []) {
  return await env.DB.prepare(sql).bind(...params).all();
}