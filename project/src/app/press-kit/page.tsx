import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Press Kit | RefTrends',
  alternates: { canonical: '/press-kit' },
  description: 'Media resources, company information, and press materials for RefTrends.',
  openGraph: {
    title: 'Press Kit | RefTrends',
    description: 'Media resources, company information, and press materials.',
    type: 'website',
  },
};

export default function PressKitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <article className="prose prose-lg prose-slate max-w-none">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
            Press Kit
          </h1>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              About RefTrends
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              RefTrends is a leading platform for referee statistics and football analytics. We provide
              data-driven insights into referee performance across Europe&apos;s top football leagues,
              helping bettors, analysts, and football enthusiasts make more informed decisions.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6">
              Company Information
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Founded</h3>
                <p>2024</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Platform Reach</h3>
                <p>100,000+ monthly visitors across Europe and beyond</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Coverage</h3>
                <p>500+ referees and 50,000+ matches across 15+ European leagues</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Mission</h3>
                <p>Bringing transparency and data-driven insights to referee performance in football</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Key Features
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">→</span>
                Comprehensive referee profiles with detailed statistics
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">→</span>
                Advanced tools for comparing referees and analyzing match patterns
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">→</span>
                Real-time data on cards, penalties, and fouls across European leagues
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">→</span>
                Home bias analysis and strictness metrics
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">→</span>
                Team-specific referee performance insights
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6">
              Data & Statistics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600 mb-1">500+</div>
                <div className="text-gray-700">Active referees tracked</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600 mb-1">50,000+</div>
                <div className="text-gray-700">Matches analyzed</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-600 mb-1">15+</div>
                <div className="text-gray-700">European leagues covered</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-orange-600 mb-1">Daily</div>
                <div className="text-gray-700">Data updates</div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Media Assets
            </h2>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                The following media assets are available for editorial use:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• Company logo (various formats)</li>
                <li>• Product screenshots and platform images</li>
                <li>• Statistical graphics and data visualizations</li>
                <li>• Team photos and speaker headshots</li>
              </ul>
              <p className="text-gray-700 mt-6 mb-4">
                For media assets, please contact:
              </p>
              <a
                href="mailto:press@reftrends.com"
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                press@reftrends.com
              </a>
            </div>
          </section>

          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Press Inquiries
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              For press inquiries, interviews, or feature requests, please contact our press team:
            </p>
            <div className="space-y-3">
              <p>
                <span className="font-semibold text-gray-900">Email: </span>
                <a
                  href="mailto:press@reftrends.com"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  press@reftrends.com
                </a>
              </p>
              <p>
                <span className="font-semibold text-gray-900">Response Time: </span>
                <span className="text-gray-700">Within 24 hours during business days</span>
              </p>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
