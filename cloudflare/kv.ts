export async function kvGet(env: any, key: string) {
  return await env.KV.get(key);
}

export async function kvSet(env: any, key: string, value: string) {
  return await env.KV.put(key, value);
}