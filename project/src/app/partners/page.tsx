import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partners | RefTrends',
  alternates: { canonical: '/partners' },
  description: 'Explore partnership opportunities with RefTrends and join our growing partner ecosystem.',
  openGraph: {
    title: 'Partners | RefTrends',
    description: 'Explore partnership opportunities with RefTrends.',
    type: 'website',
  },
};

const partnerCategories = [
  {
    id: 1,
    name: 'Sportsbooks & Betting Platforms',
    description: 'Integrate RefTrends data and tools into your betting platform',
    benefits: ['API access', 'White-label solutions', 'Co-marketing opportunities', 'Revenue sharing models'],
  },
  {
    id: 2,
    name: 'Data Providers',
    description: 'Collaborate to enhance referee statistics and football data',
    benefits: ['Data sharing agreements', 'Joint research', 'Product integration', 'Cross-promotion'],
  },
  {
    id: 3,
    name: 'Sports Technology Companies',
    description: 'Integrate with sports apps, platforms, and analytics tools',
    benefits: ['API partnerships', 'Feature integration', 'White-label options', 'Technical support'],
  },
  {
    id: 4,
    name: 'Media & Content Partners',
    description: 'Feature RefTrends insights in your content and publications',
    benefits: ['Content licensing', 'Data usage rights', 'Co-branded content', 'Exclusive insights'],
  },
  {
    id: 5,
    name: 'Educational Institutions',
    description: 'Use RefTrends for research, teaching, and academic projects',
    benefits: ['Educational licenses', 'Research access', 'Reduced pricing', 'Custom data extracts'],
  },
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <article className="prose prose-lg prose-slate max-w-none">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
            Partnerships
          </h1>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Build With Us
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              RefTrends is looking for strategic partners to help expand our platform and reach new audiences.
              Whether you&apos;re a sportsbook, data provider, technology company, or media organization,
              we have partnership opportunities to fit your needs.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6">
              Partner Categories
            </h2>
            <div className="space-y-6">
              {partnerCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white border border-gray-200 rounded-lg p-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-700 mb-4">
                    {category.description}
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900 mb-2 text-sm">Benefits:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {category.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="text-blue-600 font-bold">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Partnership Tiers
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Bronze Partner</h3>
                <p className="text-gray-700 mb-3">API access, monthly reporting, standard support</p>
              </div>
              <div className="bg-gray-200 border border-gray-300 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Silver Partner</h3>
                <p className="text-gray-700 mb-3">White-label options, quarterly reviews, priority support</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Gold Partner</h3>
                <p className="text-gray-700 mb-3">Custom solutions, dedicated account manager, revenue sharing</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Why Partner With RefTrends?
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold min-w-max">→</span>
                Access to comprehensive referee statistics and data
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold min-w-max">→</span>
                Growing audience of 100,000+ monthly visitors
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold min-w-max">→</span>
                Established platform with proven user engagement
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold min-w-max">→</span>
                Flexible partnership models tailored to your needs
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold min-w-max">→</span>
                Technical and marketing support from our team
              </li>
            </ul>
          </section>

          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Interested in Partnering?
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Let&apos;s discuss how we can work together to create value for both our users and organizations.
            </p>
            <a
              href="mailto:partners@reftrends.com"
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              Start a partnership conversation: partners@reftrends.com
            </a>
          </section>
        </article>
      </div>
    </div>
  );
}
