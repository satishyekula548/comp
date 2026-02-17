export function getFleetBaseUrl(): string {
  const raw = (process.env.FLEET_URL || process.env.FLEET_SERVER_URL || '').trim();
  if (!raw) throw new Error('FLEET_URL (or FLEET_SERVER_URL) is not set');
  if (!/^https?:\/\//i.test(raw)) throw new Error('FLEET_URL must include protocol (http:// or https://)');
  try {
    const u = new URL(raw);
    return u.toString().replace(/\/$/, '');
  } catch (err) {
    throw new Error(`FLEET_URL is invalid: ${raw}`);
  }
}

export function getFleetToken(): string {
  const token = (process.env.FLEET_TOKEN || process.env.FLEET_API_KEY || '').trim();
  if (!token) throw new Error('FLEET_TOKEN (or FLEET_API_KEY) is not set');
  return token;
}

export function makeFleetUrl(path: string): string {
  const base = getFleetBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  return new URL(p, base).toString();
}