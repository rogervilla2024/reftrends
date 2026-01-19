import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers | RefTrends',
  alternates: { canonical: '/careers' },
  description: 'Join the RefTrends team. We\'re hiring talented professionals in data, engineering, and analytics.',
  openGraph: {
    title: 'Careers | RefTrends',
    description: 'Join the RefTrends team. We\'re hiring talented professionals in data, engineering, and analytics.',
    type: 'website',
  },
};

const positions = [
  {
    id: 1,
    title: 'Data Engineer',
    department: 'Engineering',
    level: 'Mid-level',
    description: 'Help us build scalable data pipelines for processing football match statistics from multiple sources.',
  },
  {
    id: 2,
    title: 'Backend Developer',
    department: 'Engineering',
    level: 'Senior',
    description: 'Design and maintain robust APIs and backend systems for our platform serving thousands of users.',
  },
  {
    id: 3,
    title: 'Data Analyst',
    department: 'Analytics',
    level: 'Junior',
    description: 'Analyze referee patterns and performance data to create meaningful insights for our users.',
  },
  {
    id: 4,
    title: 'Frontend Developer',
    department: 'Product',
    level: 'Mid-level',
    description: 'Build beautiful, responsive interfaces that help users understand complex football analytics.',
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <article className="prose prose-lg prose-slate max-w-none">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
            Careers at RefTrends
          </h1>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Join Our Team
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              RefTrends is a growing company dedicated to bringing data-driven insights to football analysis.
              We&apos;re looking for talented individuals who are passionate about football, data, and building
              great products.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6">
              Open Positions
            </h2>
            {positions.length > 0 ? (
              <div className="space-y-4">
                {positions.map((position) => (
                  <div
                    key={position.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {position.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {position.department}
                        </span>
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          {position.level}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      {position.description}
                    </p>
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Learn More & Apply →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-600 text-lg">
                  No open positions at the moment. Check back soon!
                </p>
              </div>
            )}
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Why Work at RefTrends?
            </h2>
            <ul className="space-y-4 text-gray-700">
              <li>
                <strong className="font-semibold text-gray-900">Impact:</strong>
                {' '}Build tools that help thousands of users make better decisions.
              </li>
              <li>
                <strong className="font-semibold text-gray-900">Growth:</strong>
                {' '}Work with cutting-edge technologies and grow your skills with a talented team.
              </li>
              <li>
                <strong className="font-semibold text-gray-900">Passion:</strong>
                {' '}Join a team that loves football and data in equal measure.
              </li>
              <li>
                <strong className="font-semibold text-gray-900">Flexibility:</strong>
                {' '}Remote-friendly culture with focus on results and well-being.
              </li>
            </ul>
          </section>

          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Don&apos;t See Your Role?
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              We&apos;re always interested in hearing from talented professionals, even if we don&apos;t have
              a specific opening that matches your profile right now.
            </p>
            <a
              href="mailto:careers@reftrends.com"
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              Send us your resume: careers@reftrends.com
            </a>
          </section>
        </article>
      </div>
    </div>
  );
}
