'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FavoriteReferee {
  id: number;
  refereeId: number;
  referee: {
    id: number;
    name: string;
    slug: string;
    nationality: string | null;
    seasonStats: {
      matchesOfficiated: number;
      avgYellowCards: number;
      avgRedCards: number;
      strictnessIndex: number;
    }[];
  };
  createdAt: string;
}

export default function FavoritesPage() {
  const { status } = useSession();
  const [favorites, setFavorites] = useState<FavoriteReferee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchFavorites();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites');
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (refereeId: number) => {
    try {
      const res = await fetch(`/api/favorites?refereeId=${refereeId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setFavorites(favorites.filter(f => f.refereeId !== refereeId));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-48"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto bg-gray-800 border-gray-700">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Sign in Required</h2>
            <p className="text-gray-400 mb-4">
              Please sign in to view your favorite referees.
            </p>
            <Link href="/auth/signin">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Favorite Referees</h1>
      
      {favorites.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-400 mb-4">
              You haven&apos;t added any referees to your favorites yet.
            </p>
            <Link href="/referees">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                Browse Referees
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map(favorite => {
            const stats = favorite.referee.seasonStats[0];
            return (
              <Card key={favorite.id} className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <Link href={`/referees/${favorite.referee.slug}`}>
                    <CardTitle className="text-white hover:text-yellow-500 cursor-pointer">
                      {favorite.referee.name}
                    </CardTitle>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFavorite(favorite.refereeId)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    Remove
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-3">
                    {favorite.referee.nationality || 'Unknown nationality'}
                  </p>
                  {stats ? (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Matches:</span>
                        <span className="text-white ml-1">{stats.matchesOfficiated}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Avg Yellow:</span>
                        <span className="text-yellow-500 ml-1">{stats.avgYellowCards.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Avg Red:</span>
                        <span className="text-red-500 ml-1">{stats.avgRedCards.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Strictness:</span>
                        <span className="text-white ml-1">{stats.strictnessIndex.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No stats available</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
