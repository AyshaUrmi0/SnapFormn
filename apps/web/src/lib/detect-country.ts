'use client';

import { useEffect, useState } from 'react';

let cachedCountry: string | null = null;
let inFlight: Promise<string | null> | null = null;

export function detectCountry(): Promise<string | null> {
  if (cachedCountry) return Promise.resolve(cachedCountry);
  if (inFlight) return inFlight;
  inFlight = fetch('https://ipapi.co/json/')
    .then((res) => (res.ok ? res.json() : null))
    .then((data: { country_name?: string } | null) => {
      const name = typeof data?.country_name === 'string' ? data.country_name : null;
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
