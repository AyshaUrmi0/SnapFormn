'use client';

import { useEffect, useRef } from 'react';
import { env } from '@/lib/env';

// Google's v2 test site key. Always passes verification on Google's side
// AND always renders a working widget. Documented here:
// https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha
const TEST_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

// Load Google's reCAPTCHA script once, shared across all widget instances.
let scriptPromise: Promise<void> | null = null;
function loadGoogleScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    if ((window as unknown as { grecaptcha?: unknown }).grecaptcha) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
  return scriptPromise;
}

// Minimal typing for the grecaptcha API surface we use.
interface Grecaptcha {
  render: (
    container: HTMLElement,
    options: { sitekey: string; callback?: (token: string) => void; 'expired-callback'?: () => void },
  ) => number;
  reset: (widgetId?: number) => void;
  ready: (cb: () => void) => void;
}
function getGrecaptcha(): Grecaptcha | null {
  return (window as unknown as { grecaptcha?: Grecaptcha }).grecaptcha ?? null;
}

interface RecaptchaWidgetProps {
  onChange: (token: string | null) => void;
}

export function RecaptchaWidget({ onChange }: RecaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const siteKey = env.RECAPTCHA_SITE_KEY || TEST_SITE_KEY;

    loadGoogleScript().then(() => {
      if (cancelled) return;
      const grecaptcha = getGrecaptcha();
      if (!grecaptcha || !containerRef.current) return;

      grecaptcha.ready(() => {
        if (cancelled || !containerRef.current) return;
        // Guard against double-render in dev mode (React strict effects).
        if (widgetIdRef.current !== null) return;
        try {
          widgetIdRef.current = grecaptcha.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => onChange(token),
            'expired-callback': () => onChange(null),
          });
        } catch {
          // Render may throw if the container already has a widget (e.g. HMR).
        }
      });
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <div ref={containerRef} />
    </div>
  );
}
