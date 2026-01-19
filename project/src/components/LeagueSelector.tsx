'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

const leagues = [
  { id: 39, name: 'Premier League', shortName: 'EPL', country: 'England', flag: 'gb' },
  { id: 140, name: 'La Liga', shortName: 'LaLiga', country: 'Spain', flag: 'es' },
  { id: 135, name: 'Serie A', shortName: 'Serie A', country: 'Italy', flag: 'it' },
  { id: 78, name: 'Bundesliga', shortName: 'BuLi', country: 'Germany', flag: 'de' },
  { id: 61, name: 'Ligue 1', shortName: 'Ligue 1', country: 'France', flag: 'fr' },
];

interface LeagueSelectorProps {
  selectedLeagueId?: number;
  className?: string;
  variant?: 'pills' | 'tabs';
}

/**
 * Compact league selector component for quick navigation between leagues.
 *
 * Args:
 *     selectedLeagueId: Currently selected league ID for highlighting
 *     className: Additional CSS classes
 *     variant: Visual style - 'pills' for rounded buttons, 'tabs' for tab-style
 *
 * Returns:
 *     A horizontal list of league selector buttons
 */
export default function LeagueSelector({
  selectedLeagueId,
  className,
  variant = 'pills',
}: LeagueSelectorProps) {
  return (
    <nav
      className={cn('flex items-center gap-2 overflow-x-auto scrollbar-hide', className)}
      aria-label="League selection"
    >
      <Link
        href="/leagues"
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap',
          variant === 'pills'
            ? 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
            : 'border-b-2 border-transparent hover:border-muted-foreground/30',
          !selectedLeagueId && 'bg-primary/10 text-primary border-primary/20'
        )}
      >
        All Leagues
      </Link>
      {leagues.map((league) => {
        const isSelected = selectedLeagueId === league.id;
        return (
          <Link
            key={league.id}
            href={`/leagues/${league.id}`}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap',
              variant === 'pills'
                ? isSelected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                : isSelected
                  ? 'border-b-2 border-primary text-primary'
                  : 'border-b-2 border-transparent hover:border-muted-foreground/30'
            )}
            aria-current={isSelected ? 'page' : undefined}
          >
            <img
              src={`https://flagcdn.com/16x12/${league.flag}.png`}
              alt={league.name}
              className="w-4 h-3 object-cover rounded-sm"
              loading="lazy"
            />
            <span className="hidden sm:inline">{league.name}</span>
            <span className="sm:hidden">{league.shortName}</span>
          </Link>
        );
      })}
    </nav>
  );
}
