import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Methodology',
  description: 'Learn how RefTrends collects, processes, and presents referee statistics. Understand our key metrics, data sources, and statistical methodologies.',
  alternates: {
    canonical: '/methodology',
  },
};

const metrics = [
  {
    name: 'Cards Per Game (CPG)',
    description: 'Average number of cards (yellow + red) shown per match.',
    formula: 'Total Cards / Total Matches',
  },
  {
    name: 'Fouls Per Game (FPG)',
    description: 'Average number of fouls called per match.',
    formula: 'Total Fouls Called / Matches',
  },
  {
    name: 'Penalty Rate',
    description: 'Percentage of matches in which at least one penalty was awarded.',
    formula: '(Matches with Penalty / Total Matches) x 100',
  },
  {
    name: 'Home/Away Bias Index',
    description: 'Measures tendency to favor home or away teams in card distribution.',
    details: [
      'Score of 0 = perfectly neutral',
      'Positive = slight home team favor',
      'Negative = slight away team favor',
    ],
  },
  {
    name: 'Strictness Score',
    description: 'Proprietary metric (1-10 scale) combining:',
    details: [
      'Cards per game',
      'Fouls per game',
      'Red card frequency',
      'Second yellow frequency',
    ],
  },
  {
    name: 'Consistency Rating',
    description: 'Measures how predictable a referee\'s statistics are match-to-match.',
    details: ['Lower variance = higher consistency rating'],
  },
];

const confidenceLevels = [
  {
    level: 'High Confidence',
    criteria: '30+ matches',
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    level: 'Medium Confidence',
    criteria: '15-29 matches',
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    level: 'Low Confidence',
    criteria: '<15 matches',
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
              Methodology
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Understanding how we collect, process, and present referee statistics to ensure accuracy and reliability.
          </p>
        </div>

        {/* Data Sources Section */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                Data Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                RefTrends compiles referee statistics from multiple sources to ensure accuracy:
              </p>
              <ul className="space-y-3 ml-4">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Official league statistics</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Match reports from verified sources</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Historical archives</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Third-party data providers with proven track records</span>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                <p className="text-sm">
                  <span className="font-semibold">Quality Assurance:</span> All data is cross-referenced where possible to identify and correct discrepancies.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Key Metrics Section */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Key Metrics Explained</h2>
            <p className="text-muted-foreground">
              Understanding the statistics and calculations used throughout the platform.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {metrics.map((metric) => (
              <Card key={metric.name} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">{metric.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{metric.description}</p>

                  {metric.formula && (
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <p className="text-xs font-mono text-primary font-semibold">
                        {metric.formula}
                      </p>
                    </div>
                  )}

                  {metric.details && (
                    <ul className="space-y-2 text-sm">
                      {metric.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">−</span>
                          <span className="text-muted-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Sample Size Section */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Sample Size Considerations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                We display confidence indicators based on sample size. Statistics from small sample sizes should be interpreted with caution.
              </p>

              <div className="space-y-4">
                {confidenceLevels.map((level) => (
                  <div
                    key={level.level}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                  >
                    <Badge
                      variant="outline"
                      className={`${level.color} flex items-center gap-1.5 px-3 py-1.5 font-semibold`}
                    >
                      {level.icon}
                      {level.level}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">{level.criteria}</p>
                      <p className="text-xs text-muted-foreground">
                        {level.level === 'High Confidence' &&
                          'Statistically significant sample providing reliable insights.'}
                        {level.level === 'Medium Confidence' &&
                          'Moderate sample size, trends are emerging but not fully established.'}
                        {level.level === 'Low Confidence' &&
                          'Limited data available, statistics may not be representative.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Data Freshness Section */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Data Freshness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="text-lg font-bold text-primary mb-1">24 Hours</div>
                  <div className="text-sm text-muted-foreground">League statistics updated after match completion</div>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="text-lg font-bold text-primary mb-1">Real-time</div>
                  <div className="text-sm text-muted-foreground">Referee profile updates</div>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="text-lg font-bold text-primary mb-1">Weekly</div>
                  <div className="text-sm text-muted-foreground">Trend analysis recalculation</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Limitations Section */}
        <section>
          <Card className="border-muted-foreground/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Limitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">•</span>
                  <p className="text-muted-foreground">
                    We cannot account for match context beyond basic factors
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">•</span>
                  <p className="text-muted-foreground">
                    Referee behavior may change over time
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">•</span>
                  <p className="text-muted-foreground">
                    Statistics reflect outcomes, not necessarily referee quality
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">•</span>
                  <p className="text-muted-foreground">
                    VAR decisions are tracked separately where data is available
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-500">
                  <span className="font-bold">Important:</span> RefTrends provides statistical analysis for informational purposes. Always conduct your own research and gamble responsibly.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
