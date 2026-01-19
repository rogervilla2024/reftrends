import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const BettingHistoryTracker = dynamic(
  () => import('@/components/BettingHistoryTracker'),
  {
    loading: () => (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Loading betting history tracker...
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: 'Betting History Tracker - RefTrends',
  description: 'Track your betting history, win rate, ROI, and performance statistics. Analyze your betting patterns and improve your strategy.',
  openGraph: {
    title: 'Betting History Tracker - RefTrends',
    description: 'Track your betting history with detailed statistics and performance analysis.',
    url: 'https://reftrends.com/tools/betting-history',
  },
  twitter: {
    title: 'Betting History Tracker - RefTrends',
    description: 'Track your betting history with detailed statistics and performance analysis.',
  },
  alternates: {
    canonical: 'https://reftrends.com/tools/betting-history',
  },
};

export default function BettingHistoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Betting History Tracker</h1>
        <p className="text-muted-foreground mt-2">
          Track your bets, analyze your performance, and improve your strategy
        </p>
      </div>

      <BettingHistoryTracker />
    </div>
  );
}
