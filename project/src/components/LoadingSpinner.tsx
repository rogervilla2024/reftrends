import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Optional label for screen readers */
  label?: string;
  /** Additional className */
  className?: string;
  /** Whether to center the spinner */
  centered?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
};

export function LoadingSpinner({
  size = 'md',
  label = 'Loading...',
  className,
  centered = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      role="status"
      aria-label={label}
      className={cn(
        'inline-block rounded-full border-solid border-primary border-t-transparent animate-spin',
        sizeClasses[size],
        className
      )}
    >
      <span className="sr-only">{label}</span>
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center py-12">
        {spinner}
      </div>
    );
  }

  return spinner;
}

interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  isLoading: boolean;
  /** Optional label for screen readers */
  label?: string;
  /** Children to render behind the overlay */
  children: React.ReactNode;
}

export function LoadingOverlay({ isLoading, label = 'Loading...', children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10"
          aria-busy="true"
        >
          <LoadingSpinner size="lg" label={label} />
        </div>
      )}
    </div>
  );
}

interface LoadingPageProps {
  /** Message to display */
  message?: string;
}

export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" label={message} />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
