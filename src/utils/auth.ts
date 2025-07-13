const AUTH_COOKIE_NAME = 'admin_token';

export function getAdminIdFromRequest(request: Request) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  try {
    const decoded = Buffer.from(match[1], 'base64').toString();
    const [adminId] = decoded.split(':');
    return parseInt(adminId, 10) || null;
  } catch {
    return null;
  }
}

export async function verifyAdmin(request: Request, env: any) {
  const adminId = getAdminIdFromRequest(request);
  if (!adminId) return false;
  const admin = await env.DB.prepare('SELECT id FROM admin WHERE id = ?').bind(adminId).first();
  return !!admin;
}
