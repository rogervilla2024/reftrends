import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Glossary | RefTrends',
  alternates: { canonical: '/glossary' },
  description: 'Understand key terms and metrics used on RefTrends. Learn about referee statistics and football analytics terminology.',
  openGraph: {
    title: 'Glossary | RefTrends',
    description: 'Understand key terms and metrics used on RefTrends.',
    type: 'website',
  },
};

const glossaryTerms = [
  {
    term: 'Strictness Index',
    definition: 'A numerical score (0-10) that measures how strict a referee is in enforcing rules. Higher scores indicate more cards and fouls called per match.',
  },
  {
    term: 'Home Bias Score',
    definition: 'A metric showing the tendency of a referee to favor the home team. Positive scores indicate bias toward home teams in cards issued or penalties awarded.',
  },
  {
    term: 'Yellow Card Average',
    definition: 'The average number of yellow cards issued per match by a referee across a season or league.',
  },
  {
    term: 'Red Card Average',
    definition: 'The average number of red cards issued per match by a referee across a season or league.',
  },
  {
    term: 'Fouls Per Match',
    definition: 'The average number of fouls called per match by a referee, indicating the granularity of enforcement.',
  },
  {
    term: 'Penalty Average',
    definition: 'The average number of penalties awarded per match by a referee across competitions.',
  },
  {
    term: 'VAR Intervention',
    definition: 'An instance where the Video Assistant Referee system overturned or confirmed a referee\'s decision.',
  },
  {
    term: 'Season Statistics',
    definition: 'Aggregated performance data for a referee across a single season in a specific league.',
  },
  {
    term: 'League Coverage',
    definition: 'The major football competitions tracked on RefTrends, including Premier League, La Liga, Serie A, Bundesliga, and others.',
  },
  {
    term: 'Match Officiator',
    definition: 'The referee assigned to officiate a specific football match.',
  },
  {
    term: 'Team-Specific Stats',
    definition: 'Performance metrics showing how a referee treats a particular team, including cards and fouls issued in matches involving that team.',
  },
  {
    term: 'Career Totals',
    definition: 'Cumulative statistics for a referee across all seasons and leagues in their career as tracked by RefTrends.',
  },
];

export default function GlossaryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <article className="prose prose-lg prose-slate max-w-none">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
            Glossary
          </h1>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Key Terms & Definitions
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              This glossary explains the key metrics and terminology used on RefTrends. Whether you&apos;re
              new to referee analytics or an experienced user, you&apos;ll find definitions of important concepts here.
            </p>

            <div className="space-y-6">
              {glossaryTerms.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-lg p-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {item.term}
                  </h3>
                  <p className="text-gray-700">
                    {item.definition}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              How to Interpret Metrics
            </h2>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Strictness Index Scale</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>0-2:</strong> Very Lenient - Issues few cards and calls few fouls</li>
                  <li><strong>2-4:</strong> Lenient - Below average card and foul rates</li>
                  <li><strong>4-6:</strong> Average - Typical strictness for referees</li>
                  <li><strong>6-8:</strong> Strict - Above average cards and fouls</li>
                  <li><strong>8-10:</strong> Very Strict - Issues many cards and calls many fouls</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Home Bias Score Interpretation</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>-1.0 to -0.5:</strong> Strong away team bias</li>
                  <li><strong>-0.5 to 0.5:</strong> Neutral (little to no bias)</li>
                  <li><strong>0.5 to 1.0:</strong> Strong home team bias</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Need More Help?
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              If you have questions about specific metrics or need clarification on any terms, our FAQ page
              has additional information, or feel free to contact our support team.
            </p>
            <a
              href="/faq"
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              View FAQ →
            </a>
          </section>
        </article>
      </div>
    </div>
  );
}
