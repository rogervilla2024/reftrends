import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const OddsMovementChart = dynamic(
  () => import('@/components/OddsMovementChart'),
  {
    loading: () => (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Loading odds movement chart...
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: 'Odds Movement Chart - RefTrends',
  description: 'Track card market odds movement over time. Spot steam moves, analyze trends, and understand market sentiment.',
  openGraph: {
    title: 'Odds Movement Chart - RefTrends',
    description: 'Track card market odds movement and spot significant market changes.',
    url: 'https://reftrends.com/tools/odds-movement',
  },
  twitter: {
    title: 'Odds Movement Chart - RefTrends',
    description: 'Track card market odds movement and spot significant market changes.',
  },
  alternates: {
    canonical: 'https://reftrends.com/tools/odds-movement',
  },
};

export default function OddsMovementPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Odds Movement Chart</h1>
        <p className="text-muted-foreground mt-2">
          Track how card market odds change over time and spot significant movements
        </p>
      </div>

      <OddsMovementChart />
    </div>
  );
}
