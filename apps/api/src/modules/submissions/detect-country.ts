import geoip from 'fast-geoip';
import { logger } from '../../lib/logger';

const REGION_DISPLAY = new Intl.DisplayNames(['en'], { type: 'region' });

function isLoopbackIp(ip: string): boolean {
  if (!ip) return true;
  if (ip === '::1') return true;
  if (ip === '127.0.0.1') return true;
  if (ip.startsWith('::ffff:127.')) return true;
  return false;
}

function normalizeIp(ip: string): string {
  // IPv4-mapped IPv6 addresses arrive as "::ffff:1.2.3.4"; strip the prefix
  // so the IPv4 database lookup succeeds.
  if (ip.startsWith('::ffff:')) return ip.slice('::ffff:'.length);
  return ip;
}

export async function detectCountryFromIp(ip: string | undefined): Promise<string | null> {
  if (!ip) {
    logger.info('detectCountryFromIp called with no IP');
    return null;
  }
  const normalized = normalizeIp(ip);
  if (isLoopbackIp(normalized)) {
    logger.info({ ip: normalized }, 'detectCountryFromIp skipping loopback IP');
    return null;
  }

  try {
    const geo = await geoip.lookup(normalized);
    if (!geo?.country) {
      logger.warn({ ip: normalized }, 'fast-geoip returned no country for IP');
      return null;
    }
    try {
      const name = REGION_DISPLAY.of(geo.country);
      if (name) {
        logger.info({ ip: normalized, code: geo.country, name }, 'detectCountryFromIp resolved');
        return name;
      }
    } catch {
      // Intl.DisplayNames may throw for unknown region codes; fall through.
    }
    // Fall back to the raw country code if we can't translate it.
    logger.info({ ip: normalized, code: geo.country }, 'detectCountryFromIp resolved (code only)');
    return geo.country;
  } catch (err) {
    logger.warn({ err, ip: normalized }, 'Failed to detect country from IP');
    return null;
  }
}
