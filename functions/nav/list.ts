export async function onRequest() {
  // 这里直接返回静态数据，实际可用数据库
  const navData = [
    { name: "示例链接", url: "https://example.com" }
  ];
  return new Response(JSON.stringify(navData), {
    headers: { 'Content-Type': 'application/json' }
  });
}
