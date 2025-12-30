import Link from 'next/link';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import TodaysReferees from '@/components/TodaysReferees';
import FeaturedRefereesCarousel from '@/components/FeaturedRefereesCarousel';

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'RefStats',
  description: 'Comprehensive referee statistics and betting analytics for Europe\'s top 5 football leagues.',
  url: 'https://refstats.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://refstats.com/referees?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'RefStats',
    logo: {
      '@type': 'ImageObject',
      url: 'https://refstats.com/logo.png',
    },
  },
};

const leagues = [
  { id: 39, name: 'Premier League', country: 'England' },
  { id: 140, name: 'La Liga', country: 'Spain' },
  { id: 135, name: 'Serie A', country: 'Italy' },
  { id: 78, name: 'Bundesliga', country: 'Germany' },
  { id: 61, name: 'Ligue 1', country: 'France' },
];

const quickStats = [
  { label: 'Referees', value: '500+', description: 'Tracked referees' },
  { label: 'Matches', value: '10,000+', description: 'Analyzed matches' },
  { label: 'Leagues', value: '5', description: 'Major European leagues' },
  { label: 'Accuracy', value: '94%', description: 'Prediction accuracy' },
];

export default function Home() {
  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="text-primary">RefStats</span>
          <br />
          <span className="text-muted-foreground text-2xl md:text-3xl">
            Referee Statistics for Smart Bettors
          </span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-lg">
          Gain an edge with comprehensive referee analytics. Track cards, penalties,
          and tendencies across Europe&apos;s top 5 leagues.
        </p>

        {/* Search Bar */}
        <form
          action="/referees"
          method="get"
          className="max-w-xl mx-auto mb-12"
          role="search"
          aria-label="Search referees"
        >
          <div className="flex gap-2">
            <label htmlFor="home-search" className="sr-only">
              Search referee by name
            </label>
            <Input
              id="home-search"
              name="search"
              type="search"
              placeholder="Search referee by name..."
              className="flex-1"
              autoComplete="off"
            />
            <Button type="submit">Search</Button>
          </div>
        </form>
      </section>

      {/* Quick Stats */}
      <section className="container mx-auto px-4 py-8" aria-labelledby="quick-stats-heading">
        <h2 id="quick-stats-heading" className="sr-only">Platform Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary" aria-label={`${stat.value} ${stat.label}`}>
                  {stat.value}
                </div>
                <div className="text-sm font-medium">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Today's Referee Assignments */}
      <section className="container mx-auto px-4 py-8" aria-label="Today's referee assignments">
        <TodaysReferees />
      </section>

      {/* Featured Referees Carousel */}
      <section className="container mx-auto px-4 py-8" aria-label="Featured referees">
        <FeaturedRefereesCarousel />
      </section>

      {/* Leagues Section */}
      <section className="container mx-auto px-4 py-12" aria-labelledby="leagues-heading">
        <h2 id="leagues-heading" className="text-2xl font-bold mb-6 text-center">Browse by League</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {leagues.map((league) => (
            <Link key={league.id} href={`/leagues/${league.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer h-full focus-within:ring-2 focus-within:ring-ring">
                <CardHeader className="text-center p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">{league.name}</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">{league.country}</p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Explore our comprehensive referee database and start making more informed betting decisions today.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/referees">
                <Button size="lg">Browse Referees</Button>
              </Link>
              <Link href="/tools">
                <Button size="lg" variant="outline">Betting Tools</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      </div>
    </>
  );
}
