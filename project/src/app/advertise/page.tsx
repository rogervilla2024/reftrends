import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Advertise with RefTrends | RefTrends',
  alternates: { canonical: '/advertise' },
  description: 'Reach thousands of football enthusiasts and bettors. Explore advertising opportunities with RefTrends.',
  openGraph: {
    title: 'Advertise with RefTrends',
    description: 'Reach thousands of football enthusiasts and bettors with RefTrends advertising.',
    type: 'website',
  },
};

const adFormats = [
  {
    id: 1,
    name: 'Banner Ads',
    description: 'Prominent display advertising across our platform',
    placements: ['Homepage', 'Referee Pages', 'Tools Pages'],
    cpm: 'Custom pricing',
  },
  {
    id: 2,
    name: 'Sponsored Content',
    description: 'Native advertising integrated into our blog and resources',
    placements: ['Blog Posts', 'Guides', 'Analysis'],
    cpm: 'Starting at $2,000',
  },
  {
    id: 3,
    name: 'API & Data Partnerships',
    description: 'Co-marketing opportunities for data and service providers',
    placements: ['API Directory', 'Partnerships Page'],
    cpm: 'Custom',
  },
  {
    id: 4,
    name: 'Email Sponsorships',
    description: 'Reach our newsletter subscribers directly',
    placements: ['Weekly Newsletter'],
    cpm: 'Contact for rates',
  },
];

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <article className="prose prose-lg prose-slate max-w-none">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
            Advertise with RefTrends
          </h1>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Reach Our Audience
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              RefTrends attracts thousands of football enthusiasts, serious bettors, and analytics professionals
              every month. Whether you&apos;re a sportsbook, betting app, data provider, or football service,
              we offer targeted advertising solutions to reach your ideal customers.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Our Audience
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">100K+</div>
                <div className="text-sm text-gray-600">Monthly Visitors</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">50K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600 mb-1">15K+</div>
                <div className="text-sm text-gray-600">Newsletter Subscribers</div>
              </div>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li><strong className="font-semibold">Demographics:</strong> 85% male, ages 18-55, UK/EU focused</li>
              <li><strong className="font-semibold">Interests:</strong> Football betting, analytics, sports technology</li>
              <li><strong className="font-semibold">Engagement:</strong> High-intent users actively seeking betting insights</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6">
              Advertising Formats
            </h2>
            <div className="space-y-4">
              {adFormats.map((format) => (
                <div
                  key={format.id}
                  className="bg-white border border-gray-200 rounded-lg p-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {format.name}
                  </h3>
                  <p className="text-gray-700 mb-4">
                    {format.description}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-900">Placements: </span>
                      <span className="text-gray-600">{format.placements.join(', ')}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Pricing: </span>
                      <span className="text-gray-600">{format.cpm}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Ready to Advertise?
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Get in touch with our advertising team to discuss custom packages and partnerships.
            </p>
            <a
              href="mailto:advertising@reftrends.com"
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              advertising@reftrends.com
            </a>
          </section>
        </article>
      </div>
    </div>
  );
}
