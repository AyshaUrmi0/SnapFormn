'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Self-contained "I'm not a robot" checkbox styled to resemble Google's
// reCAPTCHA v2 widget. No Google integration — ticking it flips local
// state and emits a marker token. The form renderer requires the token
// before allowing submission. This is UX-only, not actual bot protection.
const CONFIRMED_TOKEN = 'user-confirmed';

interface RecaptchaWidgetProps {
  onChange: (token: string | null) => void;
}

export function RecaptchaWidget({ onChange }: RecaptchaWidgetProps) {
  const [checked, setChecked] = useState(false);

  function handleToggle() {
    if (checked) return;
    setChecked(true);
    onChange(CONFIRMED_TOKEN);
  }

  return (
    <div className="h-[78px] w-full max-w-[304px] rounded border border-input bg-background flex items-center px-3 gap-3 shadow-sm">
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={checked}
        aria-label="I'm not a robot"
        className={cn(
          'h-7 w-7 shrink-0 rounded border-2 flex items-center justify-center transition-colors',
          checked
            ? 'border-green-500 bg-green-500 text-white'
            : 'border-input bg-background hover:border-muted-foreground cursor-pointer',
        )}
      >
        {checked && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>
      <span className="text-sm text-foreground select-none">I&apos;m not a robot</span>
      <div className="ml-auto flex flex-col items-end text-[9px] leading-tight text-muted-foreground select-none">
        <span className="font-semibold text-muted-foreground/80">Snapform</span>
        <span>anti-bot</span>
      </div>
    </div>
  );
}
