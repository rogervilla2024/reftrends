'use client';

import { useState, useMemo, useCallback, memo } from 'react';
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
  matchesOfficiated: number;
  avgYellowCards: number;
  avgRedCards: number;
  strictnessIndex: number;
  leagueId?: number;
  leagueName?: string;
}

export interface LeagueFilter {
  id: number;
  name: string;
}

type SortField = 'name' | 'nationality' | 'matchesOfficiated' | 'avgYellowCards' | 'avgRedCards' | 'strictnessIndex';
type SortOrder = 'asc' | 'desc';

interface RefereeDataTableProps {
  referees: RefereeTableData[];
  leagues?: LeagueFilter[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 15;

// Memoized row component to prevent unnecessary re-renders
interface RefereeRowProps {
  referee: RefereeTableData;
  getStrictnessColor: (index: number) => string;
}

const RefereeRow = memo(function RefereeRow({ referee, getStrictnessColor }: RefereeRowProps) {
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
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = useCallback((field: SortField) => {
    setSortField((currentField) => {
      if (currentField === field) {
        setSortOrder((currentOrder) => currentOrder === 'asc' ? 'desc' : 'asc');
        return currentField;
      }
      setSortOrder('asc');
      return field;
    });
  }, []);

  const filteredAndSortedReferees = useMemo(() => {
    let filtered = referees;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(query) ||
        (r.nationality && r.nationality.toLowerCase().includes(query))
      );
    }

    // Apply league filter
    if (selectedLeague !== null) {
      filtered = filtered.filter(r => r.leagueId === selectedLeague);
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === null) aVal = '';
      if (bVal === null) bVal = '';

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [referees, sortField, sortOrder, selectedLeague, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedReferees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedReferees = filteredAndSortedReferees.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleLeagueChange = useCallback((leagueId: number | null) => {
    setSelectedLeague(leagueId);
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedLeague(null);
    setCurrentPage(1);
  }, []);

  // Memoized sort button component
  const SortButton = useCallback(({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 px-2 hover:bg-secondary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
      onClick={() => handleSort(field)}
      aria-label={`Sort by ${field}`}
      aria-sort={sortField === field ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined}
    >
      {children}
      <span className="ml-1 text-muted-foreground" aria-hidden="true">
        {sortField === field ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
      </span>
    </Button>
  ), [handleSort, sortField, sortOrder]);

  const getStrictnessColor = useCallback((index: number) => {
    if (index >= 7) return 'text-red-500';
    if (index >= 5) return 'text-yellow-500';
    return 'text-green-500';
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonTable rows={10} cols={7} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
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
            type="text"
            placeholder="Search by name or nationality..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* League Filter */}
      {leagues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedLeague === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleLeagueChange(null)}
          >
            All Leagues
          </Button>
          {leagues.map((league) => (
            <Button
              key={league.id}
              variant={selectedLeague === league.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleLeagueChange(league.id)}
            >
              {league.name}
            </Button>
          ))}
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedReferees.length)} of {filteredAndSortedReferees.length} referees
        {filteredAndSortedReferees.length !== referees.length && ` (${referees.length} total)`}
        {searchQuery.trim() && <span> matching &quot;{searchQuery.trim()}&quot;</span>}
        {selectedLeague !== null && leagues.length > 0 && (
          <span> in {leagues.find(l => l.id === selectedLeague)?.name}</span>
        )}
      </p>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton field="name">Name</SortButton>
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <SortButton field="nationality">Nationality</SortButton>
              </TableHead>
              <TableHead className="text-right">
                <SortButton field="matchesOfficiated">Matches</SortButton>
              </TableHead>
              <TableHead className="text-right">
                <SortButton field="avgYellowCards">Avg Yellow</SortButton>
              </TableHead>
              <TableHead className="text-right hidden md:table-cell">
                <SortButton field="avgRedCards">Avg Red</SortButton>
              </TableHead>
              <TableHead className="text-right hidden lg:table-cell">
                <SortButton field="strictnessIndex">Strictness</SortButton>
              </TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedReferees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <NoRefereesFound onClear={clearFilters} />
                </TableCell>
              </TableRow>
            ) : (
              paginatedReferees.map((referee) => (
                <RefereeRow
                  key={referee.id}
                  referee={referee}
                  getStrictnessColor={getStrictnessColor}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
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
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RefereeDataTable;
