'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FeaturedReferee {
  id: number;
  name: string;
  slug: string;
  nationality: string | null;
  photo: string | null;
  stats: {
    matchesOfficiated: number;
    avgYellowCards: number;
    avgRedCards: number;
    strictnessIndex: number;
    league: string;
  } | null;
}

interface FeaturedRefereesCarouselProps {
  initialReferees?: FeaturedReferee[];
}

export function FeaturedRefereesCarousel({ initialReferees = [] }: FeaturedRefereesCarouselProps) {
  const [referees, setReferees] = useState<FeaturedReferee[]>(initialReferees);
  const [loading, setLoading] = useState(initialReferees.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialReferees.length > 0) return;

    async function fetchFeaturedReferees() {
      try {
        const response = await fetch('/api/referees/featured');
        if (!response.ok) throw new Error('Failed to fetch featured referees');
        const data = await response.json();
        setReferees(data.referees || []);
      } catch (err) {
        setError('Unable to load featured referees');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedReferees();
  }, [initialReferees]);

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.scrollWidth / referees.length * index;
    carouselRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    setCurrentIndex(index);
  };

  const scrollPrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : referees.length - 1;
    scrollToIndex(newIndex);
  };

  const scrollNext = () => {
    const newIndex = currentIndex < referees.length - 1 ? currentIndex + 1 : 0;
    scrollToIndex(newIndex);
  };

  const getStrictnessLabel = (index: number): { label: string; color: string } => {
    if (index >= 7) return { label: 'Very Strict', color: 'text-red-500' };
    if (index >= 5) return { label: 'Strict', color: 'text-orange-500' };
    if (index >= 3) return { label: 'Moderate', color: 'text-yellow-500' };
    return { label: 'Lenient', color: 'text-green-500' };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading featured referees...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (referees.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            No featured referees available yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Featured Referees</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            aria-label="Previous referee"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            aria-label="Next referee"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>

      <div
        ref={carouselRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {referees.map((referee) => {
          const strictness = referee.stats
            ? getStrictnessLabel(referee.stats.strictnessIndex)
            : null;

          return (
            <Link
              key={referee.id}
              href={`/referees/${referee.slug}`}
              className="flex-shrink-0 snap-start w-[280px]"
            >
              <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  {/* Referee Avatar */}
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-3 overflow-hidden relative">
                      {referee.photo ? (
                        <Image
                          src={referee.photo}
                          alt={referee.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <svg
                          className="w-10 h-10 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg text-center">{referee.name}</h3>
                    {referee.nationality && (
                      <p className="text-sm text-muted-foreground">{referee.nationality}</p>
                    )}
                  </div>

                  {/* Stats */}
                  {referee.stats && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">League</span>
                        <span className="font-medium">{referee.stats.league}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Matches</span>
                        <span className="font-medium">{referee.stats.matchesOfficiated}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Avg Yellow</span>
                        <span className="font-medium text-yellow-500">
                          {referee.stats.avgYellowCards.toFixed(2)}/match
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Avg Red</span>
                        <span className="font-medium text-red-500">
                          {referee.stats.avgRedCards.toFixed(2)}/match
                        </span>
                      </div>
                      {strictness && (
                        <div className="flex justify-between items-center text-sm pt-2 border-t">
                          <span className="text-muted-foreground">Style</span>
                          <span className={`font-semibold ${strictness.color}`}>
                            {strictness.label}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {!referee.stats && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      No statistics available yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Dots Indicator */}
      {referees.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {referees.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FeaturedRefereesCarousel;
