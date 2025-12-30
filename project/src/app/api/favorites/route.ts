import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const favorites = await prisma.favoriteReferee.findMany({
      where: { userId: session.user.id },
      include: {
        referee: {
          include: {
            seasonStats: {
              where: { season: 2025 },
              orderBy: { matchesOfficiated: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(favorites.map(f => ({
      id: f.id,
      refereeId: f.refereeId,
      referee: f.referee,
      createdAt: f.createdAt,
    })));
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { refereeId } = await request.json();

    if (!refereeId) {
      return NextResponse.json({ error: 'Referee ID is required' }, { status: 400 });
    }

    const favorite = await prisma.favoriteReferee.create({
      data: {
        userId: session.user.id,
        refereeId,
      },
    });

    return NextResponse.json(favorite);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Already in favorites' }, { status: 400 });
    }
    console.error('Error adding favorite:', error);
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const refereeId = searchParams.get('refereeId');

    if (!refereeId) {
      return NextResponse.json({ error: 'Referee ID is required' }, { status: 400 });
    }

    await prisma.favoriteReferee.delete({
      where: {
        userId_refereeId: {
          userId: session.user.id,
          refereeId: parseInt(refereeId),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}
