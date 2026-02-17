import type { NextApiRequest, NextApiResponse } from 'next';

const OS_MAP: Record<string, string> = {
  macos: '/api/latest/fleet/installers/macos',
  windows: '/api/latest/fleet/installers/windows',
  linux: '/api/latest/fleet/installers/linux',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const FLEET_URL = process.env.FLEET_URL;
  const FLEET_TOKEN = process.env.FLEET_TOKEN;
  if (!FLEET_URL || !FLEET_TOKEN) {
    return res.status(500).json({ error: 'Fleet not configured on server' });
  }

  const osQuery = (req.query.os as string | undefined)?.toLowerCase();
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  const detected = osQuery || (ua.includes('mac') ? 'macos' : ua.includes('win') ? 'windows' : 'linux');

  const fleetPath = OS_MAP[detected] || OS_MAP['linux'];
  const url = new URL(fleetPath, FLEET_URL).toString();

  try {
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${FLEET_TOKEN}`, Accept: 'application/json' },
    });
    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: text || 'Fleet returned error' });
    }
    const payload = await r.json();
    // payload likely contains installer info or download_url — return to frontend
    return res.status(200).json({ os: detected, data: payload });
  } catch (err: any) {
    return res.status(500).json({ error: String(err) });
  }
}