import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | RefTrends',
  alternates: { canonical: '/blog' },
  description: 'Read the latest insights about referee statistics, football analytics, and betting strategies on the RefTrends blog.',
  openGraph: {
    title: 'Blog | RefTrends',
    description: 'Read the latest insights about referee statistics, football analytics, and betting strategies.',
    type: 'website',
  },
};

const blogPosts = [
  {
    id: 1,
    title: 'Understanding Referee Strictness Indices',
    excerpt: 'Learn how we calculate and interpret the strictness index for each referee.',
    date: 'January 3, 2026',
    category: 'Analysis',
  },
  {
    id: 2,
    title: 'Home Bias in Football: The Data Behind the Advantage',
    excerpt: 'Explore how our home bias score metric helps identify referee tendencies favoring home teams.',
    date: 'December 28, 2025',
    category: 'Insights',
  },
  {
    id: 3,
    title: 'Getting Started with RefTrends: A Beginner\'s Guide',
    excerpt: 'A comprehensive guide to using RefTrends tools and understanding referee statistics.',
    date: 'December 20, 2025',
    category: 'Guide',
  },
  {
    id: 4,
    title: 'Premier League Referee Comparison: Season Review',
    excerpt: 'Analysis of the top Premier League referees and their 2025/26 season performance.',
    date: 'December 15, 2025',
    category: 'Review',
  },
  {
    id: 5,
    title: 'The Role of VAR in Referee Performance Metrics',
    excerpt: 'How we account for VAR interventions in our referee statistics and analysis.',
    date: 'December 8, 2025',
    category: 'Analysis',
  },
  {
    id: 6,
    title: 'Yellow Card Trends Across European Leagues',
    excerpt: 'Comparative analysis of card-giving patterns across Premier League, La Liga, Serie A, and more.',
    date: 'December 1, 2025',
    category: 'Trends',
  },
];

const categories = ['All', 'Analysis', 'Insights', 'Guide', 'Review', 'Trends'];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            RefTrends Blog
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            Insights, analysis, and stories about referee performance in European football.
          </p>
        </div>

        <section className="mb-12">
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  cat === 'All'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                    <span className="text-sm text-gray-500">{post.date}</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 hover:text-blue-600">
                  {post.title}
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  {post.excerpt}
                </p>
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  Read More →
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
            Stay Updated
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Subscribe to our newsletter to get the latest RefTrends insights delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
