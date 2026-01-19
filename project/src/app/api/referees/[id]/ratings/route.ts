import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

/**
 * Hash IP address for anonymous rating tracking.
 * Uses SHA-256 with a salt to prevent reverse lookups.
 */
function hashIP(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'referee-rating-salt-2024';
  return crypto.createHash('sha256').update(ip + salt).digest('hex');
}

/**
 * GET /api/referees/[id]/ratings
 * Retrieves rating summary for a referee.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const refereeId = parseInt(id, 10);

    if (isNaN(refereeId)) {
      return NextResponse.json(
        { error: 'Invalid referee ID' },
        { status: 400 }
      );
    }

    const ratings = await prisma.refereeRating.findMany({
      where: { refereeId },
      select: {
        rating: true,
        comment: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

    const distribution = {
      1: ratings.filter(r => r.rating === 1).length,
      2: ratings.filter(r => r.rating === 2).length,
      3: ratings.filter(r => r.rating === 3).length,
      4: ratings.filter(r => r.rating === 4).length,
      5: ratings.filter(r => r.rating === 5).length,
    };

    // Get recent comments (non-empty)
    const recentComments = ratings
      .filter(r => r.comment && r.comment.trim().length > 0)
      .slice(0, 10)
      .map(r => ({
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      }));

    // Check if current user has already rated
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'anonymous';
    const ipHash = hashIP(ip);

    const existingRating = await prisma.refereeRating.findUnique({
      where: {
        refereeId_ipHash: { refereeId, ipHash },
      },
      select: { rating: true },
    });

    return NextResponse.json({
      totalRatings,
      averageRating: Math.round(averageRating * 10) / 10,
      distribution,
      recentComments,
      userRating: existingRating?.rating || null,
    });
  } catch (error) {
    console.error('Error fetching referee ratings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/referees/[id]/ratings
 * Submit or update a rating for a referee.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const refereeId = parseInt(id, 10);

    if (isNaN(refereeId)) {
      return NextResponse.json(
        { error: 'Invalid referee ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { rating, comment } = body;

    // Validate rating
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate comment (optional, max 500 chars)
    const sanitizedComment = comment
      ? String(comment).trim().slice(0, 500)
      : null;

    // Get IP hash for anonymous identification
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'anonymous';
    const ipHash = hashIP(ip);

    // Check if referee exists
    const referee = await prisma.referee.findUnique({
      where: { id: refereeId },
    });

    if (!referee) {
      return NextResponse.json(
        { error: 'Referee not found' },
        { status: 404 }
      );
    }

    // Upsert rating (create or update)
    const savedRating = await prisma.refereeRating.upsert({
      where: {
        refereeId_ipHash: { refereeId, ipHash },
      },
      update: {
        rating,
        comment: sanitizedComment,
        updatedAt: new Date(),
      },
      create: {
        refereeId,
        rating,
        comment: sanitizedComment,
        ipHash,
      },
    });

    // Get updated stats
    const allRatings = await prisma.refereeRating.findMany({
      where: { refereeId },
      select: { rating: true },
    });

    const totalRatings = allRatings.length;
    const averageRating = totalRatings > 0
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

    return NextResponse.json({
      success: true,
      rating: savedRating.rating,
      totalRatings,
      averageRating: Math.round(averageRating * 10) / 10,
    });
  } catch (error) {
    console.error('Error saving referee rating:', error);
    return NextResponse.json(
      { error: 'Failed to save rating' },
      { status: 500 }
    );
  }
}
