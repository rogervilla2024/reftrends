import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | RefTrends',
  description: 'Privacy Policy for RefTrends - Learn how we collect, use, and protect your personal information.',
  alternates: {
    canonical: '/privacy-policy',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Privacy Policy | RefTrends',
    description: 'Privacy Policy for RefTrends - Learn how we collect, use, and protect your personal information.',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-12">
          {/* Header */}
          <header className="mb-8 border-b border-gray-200 pb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-600">
              Last updated: January 2025
            </p>
          </header>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              RefTrends (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website reftrends.com.
            </p>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Information We Collect
              </h2>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Automatically Collected Information
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>IP address (anonymized)</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Referring website</li>
                  <li>Pages visited and time spent</li>
                  <li>Date and time of visits</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Information You Provide
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Email address (if subscribing to newsletter)</li>
                  <li>Contact form submissions</li>
                  <li>User preferences and settings</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Cookies and Tracking
                </h3>
                <p className="text-gray-700 mb-2">
                  We use cookies and similar tracking technologies to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Remember your preferences</li>
                  <li>Analyze website traffic</li>
                  <li>Improve user experience</li>
                </ul>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>To provide customer support</li>
                <li>To gather analysis to improve our website</li>
                <li>To monitor usage of our website</li>
                <li>To detect and prevent technical issues</li>
                <li>To send newsletters (with your consent)</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Data Sharing
              </h2>
              <p className="text-gray-700 mb-2">
                We do not sell your personal information. We may share data with:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Analytics providers (Google Analytics)</li>
                <li>Email service providers (for newsletters)</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </section>

            {/* Your Rights (GDPR) */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Your Rights (GDPR)
              </h2>
              <p className="text-gray-700 mb-2">
                If you are in the European Economic Area, you have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing</li>
                <li>Data portability</li>
                <li>Withdraw consent</li>
              </ul>
              <p className="text-gray-700">
                To exercise these rights, contact:{' '}
                <a
                  href="mailto:privacy@reftrends.com"
                  className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  privacy@reftrends.com
                </a>
              </p>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Data Retention
              </h2>
              <p className="text-gray-700">
                We retain your data only as long as necessary for the purposes outlined in this policy, unless a longer retention period is required by law.
              </p>
            </section>

            {/* Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Security
              </h2>
              <p className="text-gray-700">
                We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Children&apos;s Privacy
              </h2>
              <p className="text-gray-700">
                Our website is not intended for children under 18. We do not knowingly collect personal information from children under 18.
              </p>
            </section>

            {/* Changes to This Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Changes to This Policy
              </h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            {/* Contact Us */}
            <section className="mb-0">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Contact Us
              </h2>
              <p className="text-gray-700 mb-2">
                For questions about this Privacy Policy:
              </p>
              <ul className="list-none space-y-2 text-gray-700">
                <li>
                  Email:{' '}
                  <a
                    href="mailto:privacy@reftrends.com"
                    className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  >
                    privacy@reftrends.com
                  </a>
                </li>
                <li>
                  Website:{' '}
                  <a
                    href="/contact"
                    className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  >
                    reftrends.com/contact
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
