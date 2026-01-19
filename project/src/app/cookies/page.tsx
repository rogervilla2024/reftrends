import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | RefTrends',
  alternates: { canonical: '/cookies' },
  description: 'RefTrends cookie policy. Learn about how we use cookies and how to manage your cookie preferences.',
  openGraph: {
    title: 'Cookie Policy | RefTrends',
    description: 'Learn about how RefTrends uses cookies.',
    type: 'website',
  },
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <article className="prose prose-lg prose-slate max-w-none">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
            Cookie Policy
          </h1>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Overview
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              RefTrends uses cookies and similar tracking technologies on our website. This Cookie Policy
              explains what cookies are, how we use them, and how you can manage your cookie preferences.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              What Are Cookies?
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Cookies are small text files stored on your device (computer, tablet, or mobile phone) when you
              visit a website. They help websites recognize returning users, remember preferences, and improve user experience.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6">
              Types of Cookies We Use
            </h2>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Essential Cookies</h3>
                <p className="text-gray-700 mb-3">
                  These cookies are necessary for the website to function properly. They enable core functionality
                  such as security, user authentication, and navigation.
                </p>
                <p className="text-sm text-gray-600">Examples: session tokens, CSRF protection, security preferences</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Performance Cookies</h3>
                <p className="text-gray-700 mb-3">
                  These cookies help us understand how visitors interact with the website. They collect data
                  about page load times, bounce rates, and error messages to improve performance.
                </p>
                <p className="text-sm text-gray-600">Examples: analytics tracking, page performance metrics</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Preference Cookies</h3>
                <p className="text-gray-700 mb-3">
                  These cookies remember your preferences and choices to provide a personalized experience.
                  This includes language settings, theme preferences, and saved filters.
                </p>
                <p className="text-sm text-gray-600">Examples: language preference, theme selection, saved searches</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Marketing Cookies</h3>
                <p className="text-gray-700 mb-3">
                  These cookies track your activity across websites to deliver targeted advertisements and
                  measure the effectiveness of marketing campaigns.
                </p>
                <p className="text-sm text-gray-600">Examples: advertising identifiers, campaign tracking, conversion pixels</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Third-Party Cookies
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              RefTrends works with trusted third-party service providers that may set their own cookies on our website.
              These include:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li>
                <strong>Analytics Providers:</strong> Google Analytics, Mixpanel, and similar services track
                user behavior to help us improve the platform
              </li>
              <li>
                <strong>Marketing Partners:</strong> Third-party advertising networks that help us deliver
                relevant content and advertisements
              </li>
              <li>
                <strong>CDN & Infrastructure:</strong> Content delivery networks and hosting providers that
                serve our website content
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              How to Manage Cookies
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              You have the right to accept or reject cookies. You can manage cookie preferences in several ways:
            </p>
            <div className="space-y-4 text-gray-700">
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Browser Controls</h3>
                <p className="mb-2">
                  Most browsers allow you to refuse cookies or alert you when a cookie is being set. Check your
                  browser settings to learn how to manage cookies. Note that disabling cookies may affect website functionality.
                </p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Cookie Preferences</h3>
                <p className="mb-2">
                  We provide a cookie preferences banner when you first visit RefTrends. You can update your
                  preferences at any time through your account settings or by using the preference center.
                </p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Opt-Out Services</h3>
                <p className="mb-2">
                  You can opt out of marketing cookies through industry opt-out tools like the Digital Advertising Alliance
                  or Your Online Choices.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Changes to This Policy
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              RefTrends may update this Cookie Policy from time to time to reflect changes in our practices,
              technology, and legal requirements. We will notify you of significant changes by updating the date
              on this page or sending you a notification.
            </p>
          </section>

          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              Questions?
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              If you have questions about our use of cookies or this Cookie Policy, please contact us at:
            </p>
            <a
              href="mailto:privacy@reftrends.com"
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              privacy@reftrends.com
            </a>
            <p className="text-gray-700 mt-6">
              <strong>Last Updated:</strong> January 2026
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
