'use client';

import { useState, useMemo, memo } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SkeletonTable } from '@/components/ui/skeleton';
import { NoRefereesFound } from '@/components/EmptyState';
import { cn } from '@/lib/utils';

export interface RefereeTableData {
  id: number;
  name: string;
  slug: string;
  nationality: string | null;
  photo: string | null;
  matchesOfficiated: number;
  avgYellowCards: number;
  avgRedCards: number;
  avgPenalties: number;
  strictnessIndex: number;
  leagueId?: number;
  leagueName?: string;
}

export interface LeagueFilter {
  id: number;
  name: string;
}

type SortField = 'name' | 'nationality' | 'matchesOfficiated' | 'avgYellowCards' | 'avgRedCards' | 'avgPenalties' | 'strictnessIndex';
type SortOrder = 'asc' | 'desc';

interface RefereeDataTableProps {
  referees: RefereeTableData[];
  leagues?: LeagueFilter[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 15;

interface RefereeRowProps {
  referee: RefereeTableData;
}

const RefereeRow = memo(function RefereeRow({ referee }: RefereeRowProps) {
  const getStrictnessColor = (index: number): string => {
    if (index >= 7) return 'text-red-500';
    if (index >= 5) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <TableRow className="hover:bg-secondary/50">
      <TableCell className="font-medium">
        <Link
          href={`/referees/${referee.slug}`}
          className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {referee.name}
        </Link>
      </TableCell>
      <TableCell className="text-muted-foreground hidden sm:table-cell">
        {referee.nationality || '-'}
      </TableCell>
      <TableCell className="text-right">{referee.matchesOfficiated}</TableCell>
      <TableCell className="text-right">
        <span className="text-yellow-500">{referee.avgYellowCards.toFixed(2)}</span>
      </TableCell>
      <TableCell className="text-right hidden md:table-cell">
        <span className="text-red-500">{referee.avgRedCards.toFixed(2)}</span>
      </TableCell>
      <TableCell className="text-right hidden md:table-cell">
        <span className="text-blue-500">{referee.avgPenalties.toFixed(2)}</span>
      </TableCell>
      <TableCell className="text-right hidden lg:table-cell">
        <span className={getStrictnessColor(referee.strictnessIndex)}>
          {referee.strictnessIndex.toFixed(1)}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <Link href={`/referees/${referee.slug}`}>
          <Button
            variant="outline"
            size="sm"
            className="min-w-[60px]"
            aria-label={`View ${referee.name}'s profile`}
          >
            View
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
});

export function RefereeDataTable({ referees, leagues = [], isLoading = false }: RefereeDataTableProps) {
  // State
  const [sortField, setSortField] = useState<SortField>('matchesOfficiated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [minMatches, setMinMatches] = useState<string>('');
  const [minYellow, setMinYellow] = useState<string>('');
  const [maxYellow, setMaxYellow] = useState<string>('');

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      const numericFields: SortField[] = ['matchesOfficiated', 'avgYellowCards', 'avgRedCards', 'strictnessIndex'];
      setSortOrder(numericFields.includes(field) ? 'desc' : 'asc');
    }
  };

  // Filter and sort referees
  const processedReferees = useMemo(() => {
    let result = [...referees];

    // Text search filter
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(r =>
        r.name.toLowerCase().includes(query) ||
        (r.nationality && r.nationality.toLowerCase().includes(query))
      );
    }

    // League filter
    if (selectedLeague !== null) {
      result = result.filter(r => r.leagueId === selectedLeague);
    }

    // Numeric filters
    const minMatchesNum = parseInt(minMatches, 10);
    if (!isNaN(minMatchesNum) && minMatchesNum > 0) {
      result = result.filter(r => r.matchesOfficiated >= minMatchesNum);
    }

    const minYellowNum = parseFloat(minYellow);
    if (!isNaN(minYellowNum) && minYellowNum > 0) {
      result = result.filter(r => r.avgYellowCards >= minYellowNum);
    }

    const maxYellowNum = parseFloat(maxYellow);
    if (!isNaN(maxYellowNum) && maxYellowNum > 0) {
      result = result.filter(r => r.avgYellowCards <= maxYellowNum);
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === null || aVal === undefined) return sortOrder === 'asc' ? -1 : 1;
      if (bVal === null || bVal === undefined) return sortOrder === 'asc' ? 1 : -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const cmp = aVal.localeCompare(bVal, 'tr');
        return sortOrder === 'asc' ? cmp : -cmp;
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return result;
  }, [referees, searchQuery, selectedLeague, minMatches, minYellow, maxYellow, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(processedReferees.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, processedReferees.length);
  const paginatedReferees = processedReferees.slice(startIndex, endIndex);

  // Reset page when filters change
  const resetPage = () => setCurrentPage(1);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLeague(null);
    setMinMatches('');
    setMinYellow('');
    setMaxYellow('');
    setCurrentPage(1);
  };

  // Check if any filter is active
  const hasActiveFilters = searchQuery.trim() !== '' ||
    selectedLeague !== null ||
    minMatches !== '' ||
    minYellow !== '' ||
    maxYellow !== '';

  // Loading state
  if (isLoading) {
    return <SkeletonTable rows={10} cols={7} />;
  }

  // Sort indicator
  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ^' : ' v';
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Input
            type="search"
            placeholder="Search by name or nationality..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              resetPage();
            }}
            className="pl-10"
            aria-label="Search referees"
          />
        </div>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Numeric Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="minMatches" className="text-sm text-muted-foreground whitespace-nowrap">
            Min Matches:
          </label>
          <Input
            id="minMatches"
            type="number"
            min="0"
            placeholder="0"
            value={minMatches}
            onChange={(e) => {
              setMinMatches(e.target.value);
              resetPage();
            }}
            className="w-20"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="minYellow" className="text-sm text-muted-foreground whitespace-nowrap">
            Avg Yellow:
          </label>
          <Input
            id="minYellow"
            type="number"
            min="0"
            step="0.1"
            placeholder="Min"
            value={minYellow}
            onChange={(e) => {
              setMinYellow(e.target.value);
              resetPage();
            }}
            className="w-20"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            id="maxYellow"
            type="number"
            min="0"
            step="0.1"
            placeholder="Max"
            value={maxYellow}
            onChange={(e) => {
              setMaxYellow(e.target.value);
              resetPage();
            }}
            className="w-20"
          />
        </div>
      </div>

      {/* League Filter */}
      {leagues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedLeague === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedLeague(null);
              resetPage();
            }}
          >
            All Leagues
          </Button>
          {leagues.map((league) => (
            <Button
              key={league.id}
              variant={selectedLeague === league.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedLeague(league.id);
                resetPage();
              }}
            >
              {league.name}
            </Button>
          ))}
        </div>
      )}

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {processedReferees.length === 0 ? (
            'No referees found'
          ) : (
            <>
              Showing {startIndex + 1}-{endIndex} of {processedReferees.length} referees
              {processedReferees.length !== referees.length && (
                <span className="text-xs ml-1">({referees.length} total)</span>
              )}
            </>
          )}
        </p>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  type="button"
                  onClick={() => handleSort('name')}
                  className={cn(
                    "flex items-center gap-1 hover:text-foreground transition-colors",
                    sortField === 'name' && "text-foreground font-semibold"
                  )}
                >
                  Name{getSortIndicator('name')}
                </button>
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <button
                  type="button"
                  onClick={() => handleSort('nationality')}
                  className={cn(
                    "flex items-center gap-1 hover:text-foreground transition-colors",
                    sortField === 'nationality' && "text-foreground font-semibold"
                  )}
                >
                  Nationality{getSortIndicator('nationality')}
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  type="button"
                  onClick={() => handleSort('matchesOfficiated')}
                  className={cn(
                    "flex items-center gap-1 ml-auto hover:text-foreground transition-colors",
                    sortField === 'matchesOfficiated' && "text-foreground font-semibold"
                  )}
                >
                  Matches{getSortIndicator('matchesOfficiated')}
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  type="button"
                  onClick={() => handleSort('avgYellowCards')}
                  className={cn(
                    "flex items-center gap-1 ml-auto hover:text-foreground transition-colors",
                    sortField === 'avgYellowCards' && "text-foreground font-semibold"
                  )}
                >
                  Avg Yellow{getSortIndicator('avgYellowCards')}
                </button>
              </TableHead>
              <TableHead className="text-right hidden md:table-cell">
                <button
                  type="button"
                  onClick={() => handleSort('avgRedCards')}
                  className={cn(
                    "flex items-center gap-1 ml-auto hover:text-foreground transition-colors",
                    sortField === 'avgRedCards' && "text-foreground font-semibold"
                  )}
                >
                  Avg Red{getSortIndicator('avgRedCards')}
                </button>
              </TableHead>
              <TableHead className="text-right hidden md:table-cell">
                <button
                  type="button"
                  onClick={() => handleSort('avgPenalties')}
                  className={cn(
                    "flex items-center gap-1 ml-auto hover:text-foreground transition-colors",
                    sortField === 'avgPenalties' && "text-foreground font-semibold"
                  )}
                >
                  Penalties{getSortIndicator('avgPenalties')}
                </button>
              </TableHead>
              <TableHead className="text-right hidden lg:table-cell">
                <button
                  type="button"
                  onClick={() => handleSort('strictnessIndex')}
                  className={cn(
                    "flex items-center gap-1 ml-auto hover:text-foreground transition-colors",
                    sortField === 'strictnessIndex' && "text-foreground font-semibold"
                  )}
                >
                  Strictness{getSortIndicator('strictnessIndex')}
                </button>
              </TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedReferees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="p-0">
                  <NoRefereesFound onClear={clearFilters} />
                </TableCell>
              </TableRow>
            ) : (
              paginatedReferees.map((referee) => (
                <RefereeRow key={referee.id} referee={referee} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-between" aria-label="Pagination">
          <p className="text-sm text-muted-foreground">
            Page {safeCurrentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
            >
              Prev
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (safeCurrentPage <= 3) {
                  pageNum = i + 1;
                } else if (safeCurrentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = safeCurrentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={safeCurrentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}

export default RefereeDataTable;
