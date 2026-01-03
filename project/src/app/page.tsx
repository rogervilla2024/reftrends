import Link from 'next/link';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import FeaturedRefereesCarousel from '@/components/FeaturedRefereesCarousel';
import TopRefereesStats from '@/components/TopRefereesStats';

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
  { id: 39, name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: 'from-purple-500/20 to-purple-600/10' },
  { id: 140, name: 'La Liga', country: 'Spain', flag: '🇪🇸', color: 'from-red-500/20 to-yellow-500/10' },
  { id: 135, name: 'Serie A', country: 'Italy', flag: '🇮🇹', color: 'from-green-500/20 to-red-500/10' },
  { id: 78, name: 'Bundesliga', country: 'Germany', flag: '🇩🇪', color: 'from-black/20 to-red-500/10' },
  { id: 61, name: 'Ligue 1', country: 'France', flag: '🇫🇷', color: 'from-blue-500/20 to-red-500/10' },
];

const quickStats = [
  { label: 'Referees', value: '500+', description: 'Tracked referees', icon: '👨‍⚖️' },
  { label: 'Matches', value: '10,000+', description: 'Analyzed matches', icon: '⚽' },
  { label: 'Leagues', value: '5', description: 'Major European leagues', icon: '🏆' },
  { label: 'Accuracy', value: '94%', description: 'Prediction accuracy', icon: '🎯' },
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
      {/* Hero Section with gradient background */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-20 md:py-28 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-primary">Live Data from 5 Leagues</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-primary via-green-400 to-primary bg-clip-text text-transparent">
              RefStats
            </span>
            <br />
            <span className="text-foreground/80 text-2xl md:text-3xl lg:text-4xl font-medium mt-4 block">
              Referee Statistics for Smart Bettors
            </span>
          </h1>

          <p className="text-muted-foreground max-w-2xl mx-auto mb-10 text-lg md:text-xl leading-relaxed">
            Gain an edge with comprehensive referee analytics. Track cards, penalties,
            and tendencies across Europe&apos;s top 5 leagues.
          </p>

          {/* Search Bar */}
          <form
            action="/referees"
            method="get"
            className="max-w-2xl mx-auto mb-8"
            role="search"
            aria-label="Search referees"
          >
            <div className="flex gap-2 p-2 bg-card/50 backdrop-blur-sm border rounded-xl shadow-lg">
              <label htmlFor="home-search" className="sr-only">
                Search referee by name
              </label>
              <div className="relative flex-1">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <Input
                  id="home-search"
                  name="search"
                  type="search"
                  placeholder="Search referee by name..."
                  className="pl-12 h-12 border-0 bg-transparent text-base"
                  autoComplete="off"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8">
                Search
              </Button>
            </div>
          </form>

          {/* Quick action links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>Popular:</span>
            <Link href="/referees/anthony-taylor" className="hover:text-primary transition-colors">
              Anthony Taylor
            </Link>
            <span>•</span>
            <Link href="/referees/michael-oliver" className="hover:text-primary transition-colors">
              Michael Oliver
            </Link>
            <span>•</span>
            <Link href="/leagues/39" className="hover:text-primary transition-colors">
              Premier League
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="container mx-auto px-4 py-12" aria-labelledby="quick-stats-heading">
        <h2 id="quick-stats-heading" className="sr-only">Platform Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {quickStats.map((stat) => (
            <Card key={stat.label} className="group hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform" role="img" aria-hidden="true">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1" aria-label={`${stat.value} ${stat.label}`}>
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-foreground">{stat.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Referees Carousel */}
      <section className="container mx-auto px-4 py-8" aria-label="Featured referees">
        <FeaturedRefereesCarousel />
      </section>

      {/* Top Referees Stats */}
      <section className="container mx-auto px-4 py-12" aria-label="Top referee statistics">
        <TopRefereesStats />
      </section>

      {/* Leagues Section */}
      <section className="container mx-auto px-4 py-16" aria-labelledby="leagues-heading">
        <div className="text-center mb-10">
          <h2 id="leagues-heading" className="text-3xl md:text-4xl font-bold mb-3">Browse by League</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore referee statistics from Europe&apos;s most competitive football leagues
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
          {leagues.map((league) => (
            <Link key={league.id} href={`/leagues/${league.id}`}>
              <Card className={`group hover:border-primary transition-all cursor-pointer h-full focus-within:ring-2 focus-within:ring-ring hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br ${league.color}`}>
                <CardHeader className="text-center p-6">
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform" role="img" aria-label={`${league.country} flag`}>
                    {league.flag}
                  </div>
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
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-primary/20">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <CardContent className="py-16 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-primary/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-sm font-medium text-primary">Start for Free</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-lg">
              Explore our comprehensive referee database and start making more informed betting decisions today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/referees">
                <Button size="lg" className="w-full sm:w-auto px-8 h-12 text-base">
                  Browse Referees
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link href="/tools">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12 text-base">
                  Betting Tools
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      </div>
    </>
  );
}
