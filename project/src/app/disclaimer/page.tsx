import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer | RefTrends',
  alternates: { canonical: '/disclaimer' },
  description: 'Legal disclaimer and important information about using RefTrends referee statistics and data.',
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <article className="rounded-lg bg-white px-6 py-8 shadow-sm sm:px-12 sm:py-12">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Disclaimer
          </h1>
          <p className="mb-8 text-sm text-gray-600">Last updated: January 2025</p>

          <section className="mb-8">
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">
              General Information
            </h2>
            <p className="text-gray-700 leading-relaxed">
              The information provided on RefTrends.com ("the Website") is for general
              informational and educational purposes only. All content on this site is
              provided in good faith, however, we make no representation or warranty of
              any kind, express or implied, regarding the accuracy, adequacy, validity,
              reliability, availability, or completeness of any information on the Website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">
              Not Betting Advice
            </h2>
            <p className="mb-3 text-gray-700 leading-relaxed">
              RefTrends does not provide betting advice, tips, or recommendations. The
              statistics, trends, and analysis presented on this website are purely
              informational and should not be construed as encouragement to place bets
              or gamble.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Any decisions you make based on the information provided on this website
              are strictly at your own risk. Past performance of referees does not
              guarantee future results.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">
              No Guarantees
            </h2>
            <p className="mb-3 text-gray-700 leading-relaxed">We do not guarantee:</p>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li>The accuracy of referee statistics</li>
              <li>The outcome of any match or event</li>
              <li>Any financial gain from using our data</li>
              <li>That trends will continue in future matches</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">
              Gambling Responsibility
            </h2>
            <p className="mb-3 text-gray-700 leading-relaxed">
              If you choose to gamble, please do so responsibly. Gambling should be
              entertaining, not a way to make money. Never bet more than you can afford
              to lose.
            </p>
            <p className="mb-3 text-gray-700 leading-relaxed">
              If you or someone you know has a gambling problem, please contact:
            </p>
            <ul className="space-y-2 pl-6 text-gray-700">
              <li>
                <a
                  href="https://www.begambleaware.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  BeGambleAware: www.begambleaware.org
                </a>
              </li>
              <li>
                <a
                  href="https://www.gamcare.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  GamCare: www.gamcare.org.uk
                </a>
              </li>
              <li>
                <a
                  href="https://www.gamblersanonymous.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Gamblers Anonymous: www.gamblersanonymous.org
                </a>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">
              Age Restriction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              This website is intended for users aged 18 and over. By using this website,
              you confirm that you are at least 18 years old or the legal gambling age in
              your jurisdiction, whichever is higher.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">
              Third-Party Links
            </h2>
            <p className="text-gray-700 leading-relaxed">
              This website may contain links to third-party websites. We have no control
              over the content and practices of these sites and cannot accept responsibility
              for their respective privacy policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">
              Data Accuracy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              While we strive to provide accurate and up-to-date statistics, errors may
              occur. Referee statistics are compiled from publicly available sources and
              may not reflect official records. Always verify important information through
              official channels before making any decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">
              Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              In no event shall RefTrends, its owners, operators, or affiliates be liable
              for any indirect, incidental, special, consequential, or punitive damages
              arising out of or related to your use of this website.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about this disclaimer, please contact us at:{' '}
              <a
                href="mailto:legal@reftrends.com"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                legal@reftrends.com
              </a>
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
