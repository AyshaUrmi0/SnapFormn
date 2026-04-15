import { logger } from '../../lib/logger';

const IPAPI_TIMEOUT_MS = 3000;

function isLoopbackIp(ip: string): boolean {
  if (!ip) return true;
  if (ip === '::1') return true;
  if (ip === '127.0.0.1') return true;
  if (ip.startsWith('::ffff:127.')) return true;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  return false;
}

export async function detectCountryFromIp(ip: string | undefined): Promise<string | null> {
  if (!ip) return null;
  if (isLoopbackIp(ip)) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), IPAPI_TIMEOUT_MS);

  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Snapform/1.0' },
    });
    if (!res.ok) {
      logger.warn({ ip, status: res.status }, 'ipapi returned non-200 for geo lookup');
      return null;
    }
    const data = (await res.json()) as { country_name?: string; error?: boolean };
    if (data.error) return null;
    if (typeof data.country_name === 'string' && data.country_name.length > 0) {
      return data.country_name;
    }
    return null;
  } catch (err) {
    logger.warn({ err, ip }, 'Failed to detect country from IP');
    return null;
  } finally {
    clearTimeout(timer);
  }
}
