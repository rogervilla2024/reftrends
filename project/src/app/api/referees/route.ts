import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const referees = await prisma.referee.findMany({
      include: {
        seasonStats: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(referees);
  } catch (error) {
    console.error('Error fetching referees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referees' },
      { status: 500 }
    );
  }
}
