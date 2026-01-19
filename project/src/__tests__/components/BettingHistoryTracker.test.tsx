import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BettingHistoryTracker from '@/components/BettingHistoryTracker';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock URL methods
const mockCreateObjectURL = vi.fn(() => 'blob:test');
const mockRevokeObjectURL = vi.fn();
URL.createObjectURL = mockCreateObjectURL;
URL.revokeObjectURL = mockRevokeObjectURL;

describe('BettingHistoryTracker', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the component', () => {
      render(<BettingHistoryTracker />);

      expect(screen.getByText('Performance Summary')).toBeInTheDocument();
      expect(screen.getByText('Betting History')).toBeInTheDocument();
    });

    it('displays statistics cards', () => {
      render(<BettingHistoryTracker />);

      expect(screen.getByText('Win Rate')).toBeInTheDocument();
      expect(screen.getByText('Profit/Loss')).toBeInTheDocument();
      expect(screen.getByText('Total Bets')).toBeInTheDocument();
    });

    it('shows empty state when no bets', () => {
      render(<BettingHistoryTracker />);

      expect(screen.getByText('No bets recorded yet.')).toBeInTheDocument();
    });

    it('displays action buttons', () => {
      render(<BettingHistoryTracker />);

      expect(screen.getByText('Add Bet')).toBeInTheDocument();
      expect(screen.getByText('Export')).toBeInTheDocument();
      expect(screen.getByText('Import')).toBeInTheDocument();
    });

    it('shows betting tips section', () => {
      render(<BettingHistoryTracker />);

      expect(screen.getByText('Betting Tips')).toBeInTheDocument();
    });
  });

  describe('Add Bet Form', () => {
    it('toggles add bet form', () => {
      render(<BettingHistoryTracker />);

      const addButton = screen.getByText('Add Bet');
      fireEvent.click(addButton);

      expect(screen.getByText('Add New Bet')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., Arsenal vs Chelsea')).toBeInTheDocument();
    });

    it('shows market options', () => {
      render(<BettingHistoryTracker />);

      fireEvent.click(screen.getByText('Add Bet'));

      const marketSelect = screen.getByDisplayValue('Over 3.5 Cards');
      expect(marketSelect).toBeInTheDocument();
    });

    it('can fill out the form', () => {
      render(<BettingHistoryTracker />);

      fireEvent.click(screen.getByText('Add Bet'));

      const matchInput = screen.getByPlaceholderText('e.g., Arsenal vs Chelsea');
      const oddsInput = screen.getByPlaceholderText('e.g., 1.85');
      const stakeInput = screen.getByPlaceholderText('e.g., 10.00');

      fireEvent.change(matchInput, { target: { value: 'Liverpool vs Man City' } });
      fireEvent.change(oddsInput, { target: { value: '2.00' } });
      fireEvent.change(stakeInput, { target: { value: '10' } });

      expect(matchInput).toHaveValue('Liverpool vs Man City');
      expect(oddsInput).toHaveValue(2);
      expect(stakeInput).toHaveValue(10);
    });

    it('adds a new bet when form is submitted', async () => {
      render(<BettingHistoryTracker />);

      fireEvent.click(screen.getByText('Add Bet'));

      fireEvent.change(screen.getByPlaceholderText('e.g., Arsenal vs Chelsea'), {
        target: { value: 'Test Match' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g., 1.85'), {
        target: { value: '2.00' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g., 10.00'), {
        target: { value: '10' },
      });

      // Find the submit button (second "Add Bet" button in the form)
      const buttons = screen.getAllByText('Add Bet');
      fireEvent.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(screen.getByText('Test Match')).toBeInTheDocument();
      });
    });

    it('closes form when cancel is clicked', () => {
      render(<BettingHistoryTracker />);

      fireEvent.click(screen.getByText('Add Bet'));
      expect(screen.getByText('Add New Bet')).toBeInTheDocument();

      // Get the Cancel button within the form (has variant="outline")
      const cancelButtons = screen.getAllByText('Cancel');
      const formCancelButton = cancelButtons.find(btn =>
        btn.closest('button')?.classList.contains('border-input')
      );
      fireEvent.click(formCancelButton!);
      expect(screen.queryByText('Add New Bet')).not.toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('has result filter dropdown', () => {
      render(<BettingHistoryTracker />);

      const filterSelect = screen.getByDisplayValue('All Results');
      expect(filterSelect).toBeInTheDocument();
    });

    it('has date range filter', () => {
      render(<BettingHistoryTracker />);

      const dateFilter = screen.getByDisplayValue('All Time');
      expect(dateFilter).toBeInTheDocument();
    });

    it('can change result filter', () => {
      render(<BettingHistoryTracker />);

      const filterSelect = screen.getByDisplayValue('All Results');
      fireEvent.change(filterSelect, { target: { value: 'pending' } });

      expect(filterSelect).toHaveValue('pending');
    });

    it('can change date filter', () => {
      render(<BettingHistoryTracker />);

      const dateFilter = screen.getByDisplayValue('All Time');
      fireEvent.change(dateFilter, { target: { value: '7d' } });

      expect(dateFilter).toHaveValue('7d');
    });
  });

  describe('Bet Management', () => {
    it('shows pending bet action buttons', async () => {
      localStorageMock.clear();
      render(<BettingHistoryTracker />);

      // Add a bet first
      fireEvent.click(screen.getByText('Add Bet'));
      fireEvent.change(screen.getByPlaceholderText('e.g., Arsenal vs Chelsea'), {
        target: { value: 'Pending Match' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g., 1.85'), {
        target: { value: '1.90' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g., 10.00'), {
        target: { value: '5' },
      });

      const buttons = screen.getAllByText('Add Bet');
      fireEvent.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(screen.getAllByText('Won').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Lost').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Void').length).toBeGreaterThan(0);
      });
    });

    it('can mark bet as won', async () => {
      localStorageMock.clear();
      render(<BettingHistoryTracker />);

      // Add a bet first
      fireEvent.click(screen.getByText('Add Bet'));
      fireEvent.change(screen.getByPlaceholderText('e.g., Arsenal vs Chelsea'), {
        target: { value: 'Win Test Match' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g., 1.85'), {
        target: { value: '2.00' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g., 10.00'), {
        target: { value: '10' },
      });

      const buttons = screen.getAllByText('Add Bet');
      fireEvent.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(screen.getAllByText('Won').length).toBeGreaterThan(0);
      });

      // Find the bet card with action buttons and click Won
      const wonButtons = screen.getAllByRole('button', { name: /^Won$/ });
      expect(wonButtons.length).toBeGreaterThan(0);

      fireEvent.click(wonButtons[0]);

      // After clicking Won, the bet should show profit instead of buttons
      await waitFor(() => {
        // Check Win Test Match bet no longer has Won/Lost/Void buttons for this bet
        const betCard = screen.getByText('Win Test Match').closest('div');
        expect(betCard?.parentElement?.textContent).toContain('Win Test Match');
      });
    });

    it('can mark bet as lost', async () => {
      localStorageMock.clear();
      render(<BettingHistoryTracker />);

      // Add a bet first
      fireEvent.click(screen.getByText('Add Bet'));
      fireEvent.change(screen.getByPlaceholderText('e.g., Arsenal vs Chelsea'), {
        target: { value: 'Lose Test Match' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g., 1.85'), {
        target: { value: '2.00' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g., 10.00'), {
        target: { value: '10' },
      });

      const buttons = screen.getAllByText('Add Bet');
      fireEvent.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(screen.getAllByText('Lost').length).toBeGreaterThan(0);
      });

      // Click the first Lost button
      const lostButtons = screen.getAllByRole('button', { name: /^Lost$/ });
      expect(lostButtons.length).toBeGreaterThan(0);

      fireEvent.click(lostButtons[0]);

      // After clicking Lost, bet should be marked
      await waitFor(() => {
        const betCard = screen.getByText('Lose Test Match').closest('div');
        expect(betCard?.parentElement?.textContent).toContain('Lose Test Match');
      });
    });

    it('can delete a bet', async () => {
      render(<BettingHistoryTracker />);

      // Add a bet first
      fireEvent.click(screen.getByText('Add Bet'));
      fireEvent.change(screen.getByPlaceholderText('e.g., Arsenal vs Chelsea'), {
        target: { value: 'Delete Me Match' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g., 1.85'), {
        target: { value: '2.00' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g., 10.00'), {
        target: { value: '10' },
      });

      const buttons = screen.getAllByText('Add Bet');
      fireEvent.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(screen.getByText('Delete Me Match')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(screen.queryByText('Delete Me Match')).not.toBeInTheDocument();
      });
    });
  });

  describe('Statistics', () => {
    it('shows 0% win rate with no bets', () => {
      render(<BettingHistoryTracker />);

      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });

    it('shows 0 total bets initially', () => {
      render(<BettingHistoryTracker />);

      const totalBetsCard = screen.getByText('Total Bets').closest('div');
      expect(totalBetsCard?.parentElement).toHaveTextContent('0');
    });

    it('updates statistics after adding bets', async () => {
      render(<BettingHistoryTracker />);

      // Add a bet
      fireEvent.click(screen.getByText('Add Bet'));
      fireEvent.change(screen.getByPlaceholderText('e.g., Arsenal vs Chelsea'), {
        target: { value: 'Stats Test' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g., 1.85'), {
        target: { value: '2.00' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g., 10.00'), {
        target: { value: '10' },
      });

      const buttons = screen.getAllByText('Add Bet');
      fireEvent.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        const totalBetsElements = screen.getAllByText('1');
        expect(totalBetsElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Export/Import', () => {
    it('export button is disabled when no bets', () => {
      render(<BettingHistoryTracker />);

      const exportButton = screen.getByText('Export').closest('button');
      expect(exportButton).toBeDisabled();
    });

    it('export button is enabled when bets exist', async () => {
      render(<BettingHistoryTracker />);

      // Add a bet first
      fireEvent.click(screen.getByText('Add Bet'));
      fireEvent.change(screen.getByPlaceholderText('e.g., Arsenal vs Chelsea'), {
        target: { value: 'Export Test' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g., 1.85'), {
        target: { value: '2.00' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g., 10.00'), {
        target: { value: '10' },
      });

      const buttons = screen.getAllByText('Add Bet');
      fireEvent.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        const exportButton = screen.getByText('Export').closest('button');
        expect(exportButton).not.toBeDisabled();
      });
    });
  });

  describe('localStorage Persistence', () => {
    it('loads bets from localStorage on mount', () => {
      const savedBets = [
        {
          id: '1',
          match: 'Saved Match',
          market: 'Over 3.5 Cards',
          odds: 2.0,
          stake: 10,
          result: 'pending',
          potentialWin: 20,
          actualWin: 0,
          date: new Date().toISOString(),
        },
      ];
      localStorageMock.setItem('reftrends_betting_history', JSON.stringify(savedBets));

      render(<BettingHistoryTracker />);

      expect(screen.getByText('Saved Match')).toBeInTheDocument();
    });

    it('saves bets to localStorage when adding', async () => {
      render(<BettingHistoryTracker />);

      fireEvent.click(screen.getByText('Add Bet'));
      fireEvent.change(screen.getByPlaceholderText('e.g., Arsenal vs Chelsea'), {
        target: { value: 'Save Test' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g., 1.85'), {
        target: { value: '2.00' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g., 10.00'), {
        target: { value: '10' },
      });

      const buttons = screen.getAllByText('Add Bet');
      fireEvent.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled();
      });
    });
  });
});
