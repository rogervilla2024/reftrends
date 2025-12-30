import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { RefereeDataTable, RefereeTableData } from '@/components/RefereeDataTable';

const mockReferees: RefereeTableData[] = [
  {
    id: 1,
    name: 'Anthony Taylor',
    slug: 'anthony-taylor',
    nationality: 'England',
    matchesOfficiated: 50,
    avgYellowCards: 3.5,
    avgRedCards: 0.2,
    strictnessIndex: 6.5,
    leagueId: 39,
    leagueName: 'Premier League',
  },
  {
    id: 2,
    name: 'Felix Brych',
    slug: 'felix-brych',
    nationality: 'Germany',
    matchesOfficiated: 45,
    avgYellowCards: 2.8,
    avgRedCards: 0.1,
    strictnessIndex: 5.0,
    leagueId: 78,
    leagueName: 'Bundesliga',
  },
  {
    id: 3,
    name: 'Szymon Marciniak',
    slug: 'szymon-marciniak',
    nationality: 'Poland',
    matchesOfficiated: 60,
    avgYellowCards: 4.0,
    avgRedCards: 0.3,
    strictnessIndex: 8.0,
    leagueId: 39,
    leagueName: 'Premier League',
  },
];

const mockLeagues = [
  { id: 39, name: 'Premier League' },
  { id: 78, name: 'Bundesliga' },
];

describe('RefereeDataTable', () => {
  it('renders the table with all referees', () => {
    render(<RefereeDataTable referees={mockReferees} />);

    expect(screen.getByText('Anthony Taylor')).toBeInTheDocument();
    expect(screen.getByText('Felix Brych')).toBeInTheDocument();
    expect(screen.getByText('Szymon Marciniak')).toBeInTheDocument();
  });

  it('displays correct statistics for referees', () => {
    render(<RefereeDataTable referees={mockReferees} />);

    // Check matches count
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
  });

  it('shows the results count', () => {
    render(<RefereeDataTable referees={mockReferees} />);
    expect(screen.getByText(/Showing 1-3 of 3 referees/)).toBeInTheDocument();
  });

  it('filters referees by search query', () => {
    render(<RefereeDataTable referees={mockReferees} />);

    const searchInput = screen.getByPlaceholderText('Search by name or nationality...');
    fireEvent.change(searchInput, { target: { value: 'Taylor' } });

    expect(screen.getByText('Anthony Taylor')).toBeInTheDocument();
    expect(screen.queryByText('Felix Brych')).not.toBeInTheDocument();
    expect(screen.queryByText('Szymon Marciniak')).not.toBeInTheDocument();
  });

  it('filters referees by nationality', () => {
    render(<RefereeDataTable referees={mockReferees} />);

    const searchInput = screen.getByPlaceholderText('Search by name or nationality...');
    fireEvent.change(searchInput, { target: { value: 'Germany' } });

    expect(screen.queryByText('Anthony Taylor')).not.toBeInTheDocument();
    expect(screen.getByText('Felix Brych')).toBeInTheDocument();
    expect(screen.queryByText('Szymon Marciniak')).not.toBeInTheDocument();
  });

  it('shows no referees found when search has no results', () => {
    render(<RefereeDataTable referees={mockReferees} />);

    const searchInput = screen.getByPlaceholderText('Search by name or nationality...');
    fireEvent.change(searchInput, { target: { value: 'xyz123' } });

    expect(screen.getByText('No referees found')).toBeInTheDocument();
  });

  it('renders league filter buttons when leagues are provided', () => {
    render(<RefereeDataTable referees={mockReferees} leagues={mockLeagues} />);

    expect(screen.getByRole('button', { name: 'All Leagues' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Premier League' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bundesliga' })).toBeInTheDocument();
  });

  it('filters referees by league when clicked', () => {
    render(<RefereeDataTable referees={mockReferees} leagues={mockLeagues} />);

    fireEvent.click(screen.getByRole('button', { name: 'Bundesliga' }));

    expect(screen.queryByText('Anthony Taylor')).not.toBeInTheDocument();
    expect(screen.getByText('Felix Brych')).toBeInTheDocument();
    expect(screen.queryByText('Szymon Marciniak')).not.toBeInTheDocument();
  });

  it('sorts referees by name when header is clicked', () => {
    render(<RefereeDataTable referees={mockReferees} />);

    // Default sort is by name ascending, so Anthony Taylor should be first
    const nameButton = screen.getByRole('button', { name: /Name/ });

    // Click twice to sort descending
    fireEvent.click(nameButton);
    fireEvent.click(nameButton);

    const rows = screen.getAllByRole('row');
    // First row is header, so check data rows - after desc sort, Szymon should be first
    const firstDataRow = rows[1];
    expect(within(firstDataRow).getByText('Szymon Marciniak')).toBeInTheDocument();
  });

  it('has correct link hrefs for referee profiles', () => {
    render(<RefereeDataTable referees={mockReferees} />);

    expect(screen.getByRole('link', { name: 'Anthony Taylor' })).toHaveAttribute(
      'href',
      '/referees/anthony-taylor'
    );
    expect(screen.getByRole('link', { name: 'Felix Brych' })).toHaveAttribute(
      'href',
      '/referees/felix-brych'
    );
  });

  it('applies correct strictness color based on value', () => {
    render(<RefereeDataTable referees={mockReferees} />);

    // Based on getStrictnessColor: >= 7 is red, >= 5 is yellow, < 5 is green
    // 6.5 should be yellow, 5.0 should be yellow (>= 5), 8.0 should be red (>= 7)
    const strictness65 = screen.getByText('6.5');
    const strictness50 = screen.getByText('5.0');
    const strictness80 = screen.getByText('8.0');

    expect(strictness65).toHaveClass('text-yellow-500');
    expect(strictness50).toHaveClass('text-yellow-500'); // 5.0 >= 5, so yellow
    expect(strictness80).toHaveClass('text-red-500');
  });
});
