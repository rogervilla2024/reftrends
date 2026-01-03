'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

export interface RefereeRanking {
  id: number;
  name: string;
  slug: string;
  photo: string | null;
  matchesOfficiated: number;
  avgYellowCards: number;
  avgRedCards: number;
  totalYellowCards: number;
  totalRedCards: number;
  strictnessIndex: number;
}

type SortField = 'name' | 'matchesOfficiated' | 'totalYellowCards' | 'totalRedCards' | 'strictnessIndex';
type SortOrder = 'asc' | 'desc';

interface LeagueRefereeTableProps {
  referees: RefereeRanking[];
}

function getStrictnessLabel(index: number): { label: string; color: string } {
  if (index >= 8) return { label: 'Very Strict', color: 'text-red-500' };
  if (index >= 6) return { label: 'Strict', color: 'text-orange-500' };
  if (index >= 4) return { label: 'Average', color: 'text-yellow-500' };
  if (index >= 2) return { label: 'Lenient', color: 'text-green-500' };
  return { label: 'Very Lenient', color: 'text-emerald-500' };
}

export function LeagueRefereeTable({ referees }: LeagueRefereeTableProps) {
  const [sortField, setSortField] = useState<SortField>('matchesOfficiated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = useCallback((field: SortField) => {
    setSortField((currentField) => {
      if (currentField === field) {
        setSortOrder((currentOrder) => currentOrder === 'asc' ? 'desc' : 'asc');
        return currentField;
      }
      setSortOrder(field === 'name' ? 'asc' : 'desc');
      return field;
    });
  }, []);

  const filteredAndSortedReferees = useMemo(() => {
    let filtered = referees;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(r => r.name.toLowerCase().includes(query));
    }

    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

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
  }, [referees, sortField, sortOrder, searchQuery]);

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 hover:bg-secondary"
      onClick={() => handleSort(field)}
    >
      {children}
      <span className="ml-1 text-muted-foreground">
        {sortField === field ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
      </span>
    </Button>
  );

  if (referees.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No referee data available yet for this league.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
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
          type="search"
          placeholder="Search referees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredAndSortedReferees.length} of {referees.length} referees
        {searchQuery.trim() && <span> matching &quot;{searchQuery.trim()}&quot;</span>}
      </p>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>
              <SortButton field="name">Referee</SortButton>
            </TableHead>
            <TableHead className="text-center">
              <SortButton field="matchesOfficiated">Matches</SortButton>
            </TableHead>
            <TableHead className="text-center">
              <SortButton field="totalYellowCards">Yellow Cards</SortButton>
            </TableHead>
            <TableHead className="text-center">
              <SortButton field="totalRedCards">Red Cards</SortButton>
            </TableHead>
            <TableHead className="text-center">
              <SortButton field="strictnessIndex">Strictness</SortButton>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedReferees.map((referee, index) => {
            const strictness = getStrictnessLabel(referee.strictnessIndex);
            return (
              <TableRow key={referee.id}>
                <TableCell className="font-medium text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/referees/${referee.slug}`}
                    className="flex items-center gap-3 hover:text-primary transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {referee.photo ? (
                        <Image
                          src={referee.photo}
                          alt={referee.name}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-sm">
                          {referee.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">{referee.name}</span>
                  </Link>
                </TableCell>
                <TableCell className="text-center">
                  {referee.matchesOfficiated}
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-yellow-500">
                    {referee.totalYellowCards}
                  </span>
                  <span className="text-muted-foreground text-xs ml-1">
                    ({referee.avgYellowCards.toFixed(2)})
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-red-500">
                    {referee.totalRedCards}
                  </span>
                  <span className="text-muted-foreground text-xs ml-1">
                    ({referee.avgRedCards.toFixed(2)})
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={strictness.color}>
                    {referee.strictnessIndex.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground text-xs ml-1">
                    ({strictness.label})
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {filteredAndSortedReferees.length === 0 && searchQuery.trim() && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No referees found matching your search.</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => setSearchQuery('')}>
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
}

export default LeagueRefereeTable;
