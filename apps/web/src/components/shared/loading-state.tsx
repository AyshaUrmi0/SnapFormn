import { Spinner, BrandLoading } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  brand?: boolean;
}

export function LoadingState({
  message,
  className,
  size = 'md',
  brand = true,
}: LoadingStateProps) {
  if (brand) {
    return <BrandLoading className={className} message={message} />;
  }

  const spinnerSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12', className)}>
      <Spinner size={spinnerSize} variant="primary" />
      {message && <p className="text-sm font-medium text-muted-foreground">{message}</p>}
    </div>
  );
}
