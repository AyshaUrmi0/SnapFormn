'use client';

import { useEffect, useState } from 'react';
import { env } from './env';

let cachedCountry: string | null = null;
let inFlight: Promise<string | null> | null = null;

// Calls our own backend (which uses the offline fast-geoip DB + the real
// client IP via X-Forwarded-For). This is more reliable than hitting
// ipapi.co from the browser — no CORS issues, no rate limits, no ad
// blockers, same underlying detection path the public form uses.
export function detectCountry(): Promise<string | null> {
  if (cachedCountry) return Promise.resolve(cachedCountry);
  if (inFlight) return inFlight;
  inFlight = fetch(`${env.API_URL}/geo/country`, { credentials: 'include' })
    .then((res) => (res.ok ? res.json() : null))
    .then((payload: { data?: { country?: string | null } } | null) => {
      const name =
        typeof payload?.data?.country === 'string' && payload.data.country.length > 0
          ? payload.data.country
          : null;
      if (name) cachedCountry = name;
      return name;
    })
    .catch(() => null)
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

export function useDetectedCountry(): string | null {
  const [country, setCountry] = useState<string | null>(cachedCountry);
  useEffect(() => {
    if (cachedCountry) {
      setCountry(cachedCountry);
      return;
    }
    let cancelled = false;
    detectCountry().then((name) => {
      if (!cancelled) setCountry(name);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return country;
}
