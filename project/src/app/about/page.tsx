import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | RefTrends',
  alternates: { canonical: '/about' },
  description: 'RefTrends brings transparency and data-driven insights to referee performance in football. Track referee statistics, trends, and match insights across major European leagues.',
  openGraph: {
    title: 'About Us | RefTrends',
    description: 'Learn about our mission to bring transparency and data-driven insights to referee performance in football.',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <article className="prose prose-lg prose-slate max-w-none">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
            About RefTrends
          </h1>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Our Mission
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              RefTrends exists to bring transparency and data-driven insights to referee
              performance in football. We believe that understanding referee tendencies is
              an underutilized edge in football analysis.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              What We Do
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              We track, analyze, and visualize referee statistics across major European
              leagues, providing:
            </p>
            <ul className="space-y-4 text-gray-700">
              <li>
                <strong className="font-semibold text-gray-900">Comprehensive Profiles:</strong>
                {' '}Detailed statistics for every referee including cards issued, fouls called,
                penalties awarded, and VAR interventions.
              </li>
              <li>
                <strong className="font-semibold text-gray-900">Trend Analysis:</strong>
                {' '}Real-time tracking of referee behavior patterns and tendencies.
              </li>
              <li>
                <strong className="font-semibold text-gray-900">Match Context:</strong>
                {' '}Know who&apos;s officiating before kickoff and understand what to expect
                based on historical data.
              </li>
              <li>
                <strong className="font-semibold text-gray-900">Comparative Tools:</strong>
                {' '}Compare referees side-by-side to understand differences in officiating styles.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Our Data
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              We compile statistics from multiple reliable sources and cross-reference for
              accuracy. Our database covers:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600 mb-1">15+</div>
                <div className="text-sm text-gray-600">European leagues</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600 mb-1">500+</div>
                <div className="text-sm text-gray-600">Active referees</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-600 mb-1">50,000+</div>
                <div className="text-sm text-gray-600">Matches analyzed</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-orange-600 mb-1">10+</div>
                <div className="text-sm text-gray-600">Years of historical data</div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              The Team
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              RefTrends was founded by football enthusiasts and data analysts who saw a gap
              in the market for quality referee intelligence. We&apos;re passionate about
              combining football knowledge with data science.
            </p>
          </section>

          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Have questions, suggestions, or partnership inquiries?
            </p>
            <ul className="space-y-3">
              <li className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-semibold text-gray-900 min-w-[140px] mb-1 sm:mb-0">
                  General:
                </span>
                <a
                  href="mailto:hello@reftrends.com"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  hello@reftrends.com
                </a>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-semibold text-gray-900 min-w-[140px] mb-1 sm:mb-0">
                  Press:
                </span>
                <a
                  href="mailto:press@reftrends.com"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  press@reftrends.com
                </a>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-semibold text-gray-900 min-w-[140px] mb-1 sm:mb-0">
                  Partnerships:
                </span>
                <a
                  href="mailto:partners@reftrends.com"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  partners@reftrends.com
                </a>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-semibold text-gray-900 min-w-[140px] mb-1 sm:mb-0">
                  Data/API:
                </span>
                <a
                  href="mailto:api@reftrends.com"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  api@reftrends.com
                </a>
              </li>
            </ul>
          </section>
        </article>
      </div>
    </div>
  );
}
