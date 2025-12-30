import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Icon to display (should be an SVG element or component) */
  icon?: ReactNode;
  /** Primary action button */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Additional className */
  className?: string;
  /** Whether to wrap in a Card component */
  withCard?: boolean;
}

// Default icons for common empty states
const defaultIcons = {
  search: (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  data: (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  users: (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  calendar: (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  error: (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  success: (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  className,
  withCard = true,
}: EmptyStateProps) {
  const content = (
    <div className={cn("py-12 text-center", className)}>
      {icon && (
        <div
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="flex gap-4 justify-center flex-wrap">
          {action && (
            action.href ? (
              <Link href={action.href}>
                <Button>{action.label}</Button>
              </Link>
            ) : (
              <Button onClick={action.onClick}>{action.label}</Button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Link href={secondaryAction.href}>
                <Button variant="outline">{secondaryAction.label}</Button>
              </Link>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );

  if (withCard) {
    return (
      <Card>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  return content;
}

// Preset empty states for common use cases
export function NoResultsFound({
  searchQuery,
  onClear,
}: {
  searchQuery?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      icon={defaultIcons.search}
      title="No results found"
      description={
        searchQuery
          ? `We couldn't find any results for "${searchQuery}". Try adjusting your search or filters.`
          : "We couldn't find any results matching your criteria."
      }
      action={onClear ? { label: "Clear filters", onClick: onClear } : undefined}
    />
  );
}

export function NoDataAvailable({
  entity = "data",
  actionHref,
  actionLabel,
}: {
  entity?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <EmptyState
      icon={defaultIcons.data}
      title={`No ${entity} available`}
      description={`There is no ${entity} to display at the moment. Check back later or add some ${entity}.`}
      action={actionHref && actionLabel ? { label: actionLabel, href: actionHref } : undefined}
    />
  );
}

export function NoMatchesScheduled() {
  return (
    <EmptyState
      icon={defaultIcons.calendar}
      title="No matches scheduled"
      description="There are no matches scheduled in the top 5 leagues today. Check back tomorrow for new fixtures."
      action={{ label: "Browse Referees", href: "/referees" }}
    />
  );
}

export function NoRefereesFound({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon={defaultIcons.users}
      title="No referees found"
      description="We couldn't find any referees matching your criteria. Try adjusting your search or filters."
      action={onClear ? { label: "Clear filters", onClick: onClear } : undefined}
      secondaryAction={{ label: "Browse all referees", href: "/referees" }}
    />
  );
}

export { defaultIcons as EmptyStateIcons };
export default EmptyState;
