import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-lg w-full">
        <CardContent className="py-12 text-center">
          <div
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-5xl">🔍</span>
          </div>
          <h1 className="text-4xl font-bold mb-3 text-primary">404</h1>
          <h2 className="text-xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto">
                Go Home
              </Button>
            </Link>
            <Link href="/referees">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Browse Referees
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
