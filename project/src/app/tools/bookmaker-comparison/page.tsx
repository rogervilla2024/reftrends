import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const BookmakerComparison = dynamic(
  () => import('@/components/BookmakerComparison'),
  {
    loading: () => (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Loading bookmaker comparison...
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: 'Bookmaker Odds Comparison - RefTrends',
  description: 'Compare card market odds across major bookmakers. Find the best odds, lowest margins, and potential arbitrage opportunities.',
  openGraph: {
    title: 'Bookmaker Odds Comparison - RefTrends',
    description: 'Compare card market odds across bookmakers and find the best value.',
    url: 'https://reftrends.com/tools/bookmaker-comparison',
  },
  twitter: {
    title: 'Bookmaker Odds Comparison - RefTrends',
    description: 'Compare card market odds across bookmakers and find the best value.',
  },
  alternates: {
    canonical: 'https://reftrends.com/tools/bookmaker-comparison',
  },
};

export default function BookmakerComparisonPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bookmaker Odds Comparison</h1>
        <p className="text-muted-foreground mt-2">
          Compare card market odds across bookmakers to find the best value
        </p>
      </div>

      <BookmakerComparison />
    </div>
  );
}
