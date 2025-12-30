'use client';

import { cn } from '@/lib/utils';

interface SkipLinkProps {
  /** The ID of the element to skip to (without #) */
  targetId?: string;
  /** Custom label text */
  label?: string;
  /** Additional className */
  className?: string;
}

/**
 * SkipLink component for keyboard accessibility
 * Allows users to skip navigation and jump directly to main content
 */
export function SkipLink({
  targetId = 'main-content',
  label = 'Skip to main content',
  className,
}: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        // Visually hidden until focused
        'sr-only focus:not-sr-only',
        // Position and styling when visible
        'focus:fixed focus:top-4 focus:left-4 focus:z-[100]',
        'focus:block focus:px-4 focus:py-2',
        'focus:bg-primary focus:text-primary-foreground',
        'focus:rounded-md focus:shadow-lg',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        // Animation
        'transition-all duration-200',
        className
      )}
    >
      {label}
    </a>
  );
}

export default SkipLink;
