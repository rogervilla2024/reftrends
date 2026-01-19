import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for RefTrends - referee statistics and betting analytics platform.',
  alternates: {
    canonical: '/terms-of-service',
  },
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <div className="space-y-8">
            {/* Agreement to Terms */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing RefTrends.com ("the Website"), you agree to be bound by these Terms of Service.
                If you disagree with any part of these terms, you may not access the Website.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Website and its original content, features, and functionality are owned by RefTrends
                and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">You agree to:</p>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                <li>Use the Website only for lawful purposes</li>
                <li>Not reproduce, distribute, or exploit content without permission</li>
                <li>Not attempt to gain unauthorized access to any part of the Website</li>
                <li>Not use automated systems to access the Website without permission</li>
                <li>Provide accurate information when required</li>
              </ul>
            </section>

            {/* Disclaimer of Warranties */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                The Website is provided "as is" and "as available" without warranties of any kind.
                We do not warrant that:
              </p>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                <li>The Website will be uninterrupted or error-free</li>
                <li>Results obtained will be accurate or reliable</li>
                <li>Any errors will be corrected</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                RefTrends shall not be liable for any indirect, incidental, special, consequential,
                or punitive damages resulting from:
              </p>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                <li>Your use or inability to use the Website</li>
                <li>Any unauthorized access to our servers</li>
                <li>Any interruption of transmission</li>
                <li>Any errors or omissions in content</li>
              </ul>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by the laws of the United Kingdom, without regard to
                its conflict of law provisions.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. Continued use of the Website
                after changes constitutes acceptance of new Terms.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend access to our Website immediately, without prior notice,
                for any reason whatsoever.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-muted/30 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Questions about these Terms:{' '}
                <a
                  href="mailto:legal@reftrends.com"
                  className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
                >
                  legal@reftrends.com
                </a>
              </p>
            </section>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded"
          >
            <svg
              className="mr-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
