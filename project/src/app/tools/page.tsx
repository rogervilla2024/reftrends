import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Betting Tools',
  description: 'Professional referee-based betting analysis tools. Match analyzer with card predictions, referee comparison charts, and statistical insights for smarter betting.',
  openGraph: {
    title: 'Betting Tools - RefStats',
    description: 'Professional referee-based betting analysis tools for card predictions and statistical insights.',
    url: 'https://refstats.com/tools',
  },
  twitter: {
    title: 'Betting Tools - RefStats',
    description: 'Professional referee-based betting analysis tools for card predictions and statistical insights.',
  },
  alternates: {
    canonical: 'https://refstats.com/tools',
  },
};

const tools = [
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
    features: ['Expected Yellow Cards', 'Expected Red Cards', 'Confidence Intervals'],
    status: 'coming-soon',
  },
  {
    id: 'value-finder',
    name: 'Value Finder',
    description: 'Find value bets by comparing our predictions with bookmaker odds for card markets.',
    icon: '💰',
    features: ['Odds Comparison', 'Value Alerts', 'ROI Tracking'],
    status: 'coming-soon',
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
