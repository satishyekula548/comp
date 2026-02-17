import type { NextApiRequest, NextApiResponse } from 'next';
import { makeFleetUrl, getFleetToken } from '../../lib/fleetClient';

const OS_MAP: Record<string, string> = {
  macos: '/api/latest/fleet/installers/macos',
  windows: '/api/latest/fleet/installers/windows',
  linux: '/api/latest/fleet/installers/linux',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const osQuery = (req.query.os as string | undefined)?.toLowerCase();
    const ua = (req.headers['user-agent'] || '').toLowerCase();
    const detected = osQuery || (ua.includes('mac') ? 'macos' : ua.includes('win') ? 'windows' : 'linux');
    const fleetPath = OS_MAP[detected] || OS_MAP['linux'];
    const url = makeFleetUrl(fleetPath);
    const token = getFleetToken();

    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      method: 'GET',
    });
    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: txt || 'Fleet returned error' });
    }
    const payload = await r.json();
    return res.status(200).json({ os: detected, data: payload });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}

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