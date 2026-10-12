import * as React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: 'xs' | 'sm' | 'default' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'muted' | 'brand';
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  default: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
  xl: 'h-10 w-10',
};

export function Spinner({
  size = 'default',
  variant = 'default',
  className,
  ...props
}: SpinnerProps) {
  const colorClass =
    variant === 'primary'
      ? 'text-primary'
      : variant === 'muted'
      ? 'text-muted-foreground'
      : variant === 'brand'
      ? 'text-primary'
      : 'text-current';

  return (
    <svg
      className={cn(
        'animate-spin shrink-0',
        sizeClasses[size],
        colorClass,
        className,
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-95"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function BrandLoading({
  className,
  message,
}: {
  className?: string;
  message?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3.5 py-8', className)}>
      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-amber-500 text-primary-foreground shadow-lg shadow-primary/25 ring-4 ring-primary/10">
        <Sparkles className="h-5 w-5 animate-pulse" />
        <span className="absolute -inset-1 rounded-2xl border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
      {message && (
        <p className="text-xs font-medium tracking-wide text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
