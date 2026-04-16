import { logger } from '../../lib/logger';
import { env } from '../../config/env';

const GOOGLE_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const VERIFY_TIMEOUT_MS = 5000;

// Google's v2 test secret — always verifies successfully, for local dev and
// preview deploys that don't have a real reCAPTCHA site set up yet.
// See https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.
const TEST_SECRET = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';

interface GoogleVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

/**
 * Verify a reCAPTCHA v2 token with Google. Returns true when the token is
 * valid, false on any failure (bad token, network error, timeout, misconfig).
 * Logs the failure reason so Render logs can diagnose abuse vs config issues.
 */
export async function verifyRecaptchaToken(
  token: string | undefined,
  remoteIp?: string,
): Promise<boolean> {
  if (!token || typeof token !== 'string' || token.length === 0) {
    logger.warn('recaptcha: verify called with empty token');
    return false;
  }

  const secret = env.RECAPTCHA_SECRET_KEY || TEST_SECRET;
  const usingTestKey = secret === TEST_SECRET;
  if (usingTestKey) {
    logger.info('recaptcha: using Google test secret (no RECAPTCHA_SECRET_KEY configured)');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

  const body = new URLSearchParams();
  body.set('secret', secret);
  body.set('response', token);
  if (remoteIp) body.set('remoteip', remoteIp);

  try {
    const res = await fetch(GOOGLE_VERIFY_URL, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: controller.signal,
    });
    if (!res.ok) {
      logger.warn({ status: res.status }, 'recaptcha: Google verify returned non-200');
      return false;
    }
    const data = (await res.json()) as GoogleVerifyResponse;
    if (!data.success) {
      logger.warn({ errors: data['error-codes'] }, 'recaptcha: Google verify rejected token');
      return false;
    }
    return true;
  } catch (err) {
    logger.warn({ err }, 'recaptcha: verify request failed');
    return false;
  } finally {
    clearTimeout(timer);
  }
}
