import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Betting Tools',
  description: 'Professional referee-based betting analysis tools. Match analyzer with card predictions, referee comparison charts, and statistical insights for smarter betting.',
  openGraph: {
    title: 'Betting Tools - RefTrends',
    description: 'Professional referee-based betting analysis tools for card predictions and statistical insights.',
    url: 'https://reftrends.com/tools',
  },
  twitter: {
    title: 'Betting Tools - RefTrends',
    description: 'Professional referee-based betting analysis tools for card predictions and statistical insights.',
  },
  alternates: {
    canonical: 'https://reftrends.com/tools',
  },
};

const tools = [
  {
    id: 'betting-tips',
    name: 'Betting Tips',
    description: 'Data-driven betting insights based on referee tendencies and team discipline patterns.',
    icon: '🎯',
    features: ['AI Predictions', 'Confidence Scores', '+EV Finder', 'Daily Updates'],
    status: 'available',
    isNew: true,
  },
  {
    id: 'sure-cards',
    name: 'Sure Cards Finder',
    description: 'Find high-probability card betting opportunities. Analyze referee-team combinations.',
    icon: '🔥',
    features: ['Win Rate %', 'O/U Rates', 'Combo Analysis', 'Filters'],
    status: 'available',
    isNew: true,
  },
  {
    id: 'match-analyzer',
    name: 'Match Analyzer',
    description: 'Analyze upcoming matches with referee impact predictions, card probabilities, and team head-to-head stats.',
    icon: '📊',
    features: ['Referee Impact Analysis', 'Card Predictions', 'Over/Under Probabilities', 'Team H2H'],
    status: 'available',
  },
  {
    id: 'referee-comparison',
    name: 'Referee Comparison',
    description: 'Compare two or more referees side-by-side with statistical charts and export functionality.',
    icon: '⚖️',
    features: ['Side-by-side Stats', 'Visual Charts', 'Export Data'],
    status: 'available',
  },
  {
    id: 'card-calculator',
    name: 'Card Calculator',
    description: 'Calculate expected cards for any fixture based on historical referee and team data.',
    icon: '🃏',
    features: ['Expected Yellow Cards', 'Expected Red Cards', 'Over/Under Probabilities'],
    status: 'available',
  },
  {
    id: 'team-referee-history',
    name: 'Team vs Referee History',
    description: 'Analyze how teams perform with specific referees - cards, wins, and match history.',
    icon: '🏟️',
    features: ['Team-Referee Stats', 'Win/Loss Record', 'Recent Matches'],
    status: 'available',
  },
  {
    id: 'value-finder',
    name: 'Value Finder',
    description: 'Find value bets by comparing our predictions with bookmaker odds for card markets.',
    icon: '💰',
    features: ['Odds Comparison', 'EV Calculator', '+Value Alerts'],
    status: 'available',
  },
  {
    id: 'betting-history',
    name: 'Betting History',
    description: 'Track your bets, win rate, ROI, and performance over time. Export and analyze your betting patterns.',
    icon: '📊',
    features: ['Win Rate', 'ROI Tracker', 'Streak Analysis', 'Export/Import'],
    status: 'available',
    isNew: true,
  },
  {
    id: 'bookmaker-comparison',
    name: 'Bookmaker Comparison',
    description: 'Compare card market odds across major bookmakers. Find best odds, lowest margins, and arbitrage opportunities.',
    icon: '🏦',
    features: ['Odds Compare', 'Margin Analysis', 'Best Value', 'Arbitrage Finder'],
    status: 'available',
    isNew: true,
  },
  {
    id: 'odds-movement',
    name: 'Odds Movement',
    description: 'Track card market odds movement over time. Spot steam moves, analyze trends, and understand market sentiment.',
    icon: '📈',
    features: ['Line Charts', 'Steam Alerts', 'Trend Analysis', 'Volatility'],
    status: 'available',
    isNew: true,
  },
  {
    id: 'home-away-bias',
    name: 'Home/Away Bias',
    description: 'Analyze referee tendencies for home vs away team cards. Discover which referees favor home or away teams.',
    icon: '🏠',
    features: ['Bias Score', 'Home vs Away Stats', 'Visual Comparison'],
    status: 'available',
  },
  {
    id: 'team-card-stats',
    name: 'Team Card Stats',
    description: 'Analyze team disciplinary records and their history with specific referees.',
    icon: '📋',
    features: ['Team Rankings', 'Referee Breakdown', 'Toughest/Easiest Refs'],
    status: 'available',
  },
  {
    id: 'league-comparison',
    name: 'League Comparison',
    description: 'Compare referee strictness across Europe\'s top 5 leagues with detailed statistics.',
    icon: '🌍',
    features: ['5 League Analysis', 'Strictness Rankings', 'Top Referees'],
    status: 'available',
  },
  {
    id: 'seasonal-trends',
    name: 'Seasonal Trends',
    description: 'Analyze how referee behavior changes throughout the season with trend analysis.',
    icon: '📈',
    features: ['Monthly Trends', 'Behavior Changes', 'Season Insights'],
    status: 'available',
  },
  {
    id: 'penalty-stats',
    name: 'Penalty Statistics',
    description: 'Deep dive into penalty patterns by referee. Find who awards the most penalties.',
    icon: '⚽',
    features: ['Penalty Rate', 'Home/Away Bias', 'League Comparison'],
    status: 'available',
  },
  {
    id: 'derby-analyzer',
    name: 'Derby Analyzer',
    description: 'Analyze referee behavior in high-stakes derby and rivalry matches.',
    icon: '🔥',
    features: ['Derby Stats', 'Card Comparison', 'Famous Derbies'],
    status: 'available',
  },
  {
    id: 'referee-fatigue',
    name: 'Referee Fatigue',
    description: 'How rest time between matches affects referee card decisions.',
    icon: '😴',
    features: ['Fatigue Impact', 'Rest Analysis', 'Performance Trends'],
    status: 'available',
  },
  {
    id: 'foul-analysis',
    name: 'Foul Analysis',
    description: 'Detailed foul statistics and leniency patterns. Find which referees allow more physical play.',
    icon: '🦵',
    features: ['Foul Stats', 'Leniency Score', 'Fouls per Card'],
    status: 'available',
  },
  {
    id: 'head-to-head',
    name: 'Head-to-Head',
    description: 'Detailed referee vs team comparison. See how specific teams perform with different referees.',
    icon: '🤝',
    features: ['Team vs Referee', 'Card Comparison', 'Win Rate Analysis'],
    status: 'available',
  },
  {
    id: 'time-analysis',
    name: 'Time Analysis',
    description: 'Analyze when cards are shown during matches - first half, second half, injury time.',
    icon: '⏱️',
    features: ['Card Timing', 'Half Analysis', 'Minute Patterns'],
    status: 'available',
  },
  {
    id: 'historical-seasons',
    name: 'Historical Seasons',
    description: 'Compare referee performance across multiple seasons.',
    icon: '📅',
    features: ['Season Comparison', 'Trend Analysis', 'Historical Data'],
    status: 'available',
  },
];

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Betting Tools</h1>
        <p className="text-muted-foreground mt-2">
          Professional tools for referee-based betting analysis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <Card
            key={tool.id}
            className={`relative overflow-hidden ${
              tool.status === 'available'
                ? 'hover:border-primary transition-all cursor-pointer'
                : 'opacity-60'
            }`}
          >
            {tool.status === 'coming-soon' && (
              <div className="absolute top-4 right-4 bg-muted px-2 py-1 rounded text-xs font-medium">
                Coming Soon
              </div>
            )}
            {'isNew' in tool && tool.isNew && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                NEW
              </div>
            )}
            {tool.status === 'available' ? (
              <Link href={`/tools/${tool.id}`} className="block">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{tool.icon}</div>
                    <div>
                      <CardTitle className="text-xl">{tool.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {tool.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tool.features.map((feature) => (
                      <span
                        key={feature}
                        className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Link>
            ) : (
              <>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{tool.icon}</div>
                    <div>
                      <CardTitle className="text-xl">{tool.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {tool.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tool.features.map((feature) => (
                      <span
                        key={feature}
                        className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>

      {/* How It Works Section */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">How Our Analysis Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="font-bold mb-2">Historical Data</h3>
              <p className="text-sm text-muted-foreground">
                We analyze thousands of matches across 5 major leagues to build
                comprehensive referee profiles.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl mb-4">🧮</div>
              <h3 className="font-bold mb-2">Statistical Models</h3>
              <p className="text-sm text-muted-foreground">
                Our algorithms calculate expected cards based on referee tendencies,
                team discipline, and match context.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="font-bold mb-2">Actionable Insights</h3>
              <p className="text-sm text-muted-foreground">
                Get clear predictions with confidence levels to inform your
                betting decisions on card markets.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mt-12">
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Disclaimer:</strong> Our tools provide statistical analysis for
              informational purposes only. Past performance does not guarantee future
              results. Always gamble responsibly and within your means.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
