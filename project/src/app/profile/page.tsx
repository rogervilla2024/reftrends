'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
          <div className="h-8 bg-gray-700 rounded w-48"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
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
              Please sign in to view your profile.
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

  const isPremium = session?.user?.role === 'premium';
  const isAdmin = session?.user?.role === 'admin';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Profile</h1>

        <div className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-2xl font-bold text-black">
                  {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {session?.user?.name || 'No name set'}
                  </h3>
                  <p className="text-gray-400">{session?.user?.email}</p>
                  {isPremium && (
                    <span className="inline-block mt-1 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">
                      Premium Member
                    </span>
                  )}
                  {isAdmin && (
                    <span className="inline-block mt-1 ml-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/favorites" className="block">
                <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700">
                  Favorite Referees
                </Button>
              </Link>
              <Link href="/alerts" className="block">
                <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700">
                  Alert Settings
                </Button>
              </Link>
              {!isPremium && (
                <Link href="/pricing" className="block">
                  <Button className="w-full justify-start bg-yellow-500 hover:bg-yellow-600 text-black">
                    Upgrade to Premium
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              {isPremium ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-400">Premium Active</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    You have access to all premium features.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-gray-400">Free Plan</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Upgrade to Premium to unlock advanced features.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
