import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | RefTrends',
  alternates: { canonical: '/contact' },
  description: 'Get in touch with RefTrends. Contact us for questions, feedback, or partnership opportunities.',
  openGraph: {
    title: 'Contact Us | RefTrends',
    description: 'Get in touch with RefTrends for questions, feedback, or partnership opportunities.',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <article className="prose prose-lg prose-slate max-w-none">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
            Contact Us
          </h1>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Have questions, suggestions, or partnership inquiries? We&apos;d love to hear from you.
              Choose the contact option that best fits your needs.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6">
              Contact Methods
            </h2>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">General Inquiries</h3>
                <p className="text-gray-700 mb-4">Questions about RefTrends, features, or how to use our platform.</p>
                <a
                  href="mailto:hello@reftrends.com"
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  hello@reftrends.com
                </a>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Press & Media</h3>
                <p className="text-gray-700 mb-4">Media inquiries, press releases, or media kit requests.</p>
                <a
                  href="mailto:press@reftrends.com"
                  className="text-green-600 hover:text-green-800 hover:underline font-medium"
                >
                  press@reftrends.com
                </a>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Partnerships & Advertising</h3>
                <p className="text-gray-700 mb-4">Partnership opportunities, advertising inquiries, or collaboration proposals.</p>
                <a
                  href="mailto:partners@reftrends.com"
                  className="text-purple-600 hover:text-purple-800 hover:underline font-medium"
                >
                  partners@reftrends.com
                </a>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Data & API</h3>
                <p className="text-gray-700 mb-4">Questions about data access, API integration, or custom data requests.</p>
                <a
                  href="mailto:api@reftrends.com"
                  className="text-orange-600 hover:text-orange-800 hover:underline font-medium"
                >
                  api@reftrends.com
                </a>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Support & Feedback</h3>
                <p className="text-gray-700 mb-4">Technical support, bug reports, or feature suggestions.</p>
                <a
                  href="mailto:support@reftrends.com"
                  className="text-red-600 hover:text-red-800 hover:underline font-medium"
                >
                  support@reftrends.com
                </a>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Response Times
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              We aim to respond to all inquiries within 48 hours during business days. For urgent matters, please indicate priority in your subject line.
            </p>
            <p className="text-gray-700">
              Thank you for your interest in RefTrends!
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
