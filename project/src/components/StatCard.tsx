import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  /** The main value to display */
  value: string | number;
  /** Label for the stat */
  label: string;
  /** Optional description */
  description?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Color variant for the value */
  variant?: 'default' | 'primary' | 'yellow' | 'red' | 'blue' | 'green';
  /** Additional className */
  className?: string;
  /** Trend indicator */
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
}

const variantColors = {
  default: 'text-foreground',
  primary: 'text-primary',
  yellow: 'text-yellow-500',
  red: 'text-red-500',
  blue: 'text-blue-500',
  green: 'text-green-500',
};

export function StatCard({
  value,
  label,
  description,
  icon,
  variant = 'default',
  className,
  trend,
}: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className={cn('text-3xl font-bold', variantColors[variant])}>
              {value}
            </div>
            <div className="text-sm font-medium mt-1">{label}</div>
            {description && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {description}
              </div>
            )}
            {trend && (
              <div
                className={cn(
                  'text-xs mt-2 inline-flex items-center gap-1',
                  trend.direction === 'up' && 'text-green-500',
                  trend.direction === 'down' && 'text-red-500',
                  trend.direction === 'neutral' && 'text-muted-foreground'
                )}
              >
                {trend.direction === 'up' && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
                {trend.direction === 'down' && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {trend.value}
              </div>
            )}
          </div>
          {icon && (
            <div className="text-muted-foreground" aria-hidden="true">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatGrid({ children, columns = 4, className }: StatGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 2 && 'grid-cols-1 sm:grid-cols-2',
        columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-2 md:grid-cols-4',
        className
      )}
    >
      {children}
    </div>
  );
}

export default StatCard;
