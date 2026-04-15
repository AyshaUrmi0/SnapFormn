import { logger } from '../../lib/logger';

const IPAPI_TIMEOUT_MS = 5000;

// Only the narrow loopback range — not private ranges, since a real client
// behind NAT could legitimately come through as 10.x if trust proxy isn't
// peeling enough hops. Better to try ipapi and let it return an error than
// to reject preemptively.
function isLoopbackIp(ip: string): boolean {
  if (!ip) return true;
  if (ip === '::1') return true;
  if (ip === '127.0.0.1') return true;
  if (ip.startsWith('::ffff:127.')) return true;
  return false;
}

export async function detectCountryFromIp(ip: string | undefined): Promise<string | null> {
  if (!ip) {
    logger.info('detectCountryFromIp called with no IP');
    return null;
  }
  if (isLoopbackIp(ip)) {
    logger.info({ ip }, 'detectCountryFromIp skipping loopback IP');
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), IPAPI_TIMEOUT_MS);

  try {
    const url = `https://ipapi.co/${encodeURIComponent(ip)}/json/`;
    logger.info({ ip, url }, 'detectCountryFromIp calling ipapi');
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Snapform/1.0' },
    });
    if (!res.ok) {
      logger.warn({ ip, status: res.status }, 'ipapi returned non-200 for geo lookup');
      return null;
    }
    const data = (await res.json()) as { country_name?: string; error?: boolean; reason?: string };
    if (data.error) {
      logger.warn({ ip, reason: data.reason }, 'ipapi reported an error for geo lookup');
      return null;
    }
    if (typeof data.country_name === 'string' && data.country_name.length > 0) {
      logger.info({ ip, country: data.country_name }, 'detectCountryFromIp resolved');
      return data.country_name;
    }
    logger.warn({ ip, data }, 'ipapi returned no country_name');
    return null;
  } catch (err) {
    logger.warn({ err, ip }, 'Failed to detect country from IP');
    return null;
  } finally {
    clearTimeout(timer);
  }
}
