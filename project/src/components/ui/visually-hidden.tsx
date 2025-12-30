import { cn } from '@/lib/utils';

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  /** If true, the element is visible when focused (useful for skip links) */
  focusable?: boolean;
}

/**
 * VisuallyHidden component
 * Hides content visually while keeping it accessible to screen readers
 */
export function VisuallyHidden({
  children,
  focusable = false,
  className,
  ...props
}: VisuallyHiddenProps) {
  return (
    <span
      className={cn(
        focusable ? 'sr-only focus:not-sr-only' : 'sr-only',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default VisuallyHidden;
