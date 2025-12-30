import { NextResponse } from 'next/server';
import { getTodaysFixtures, extractTodaysAssignments } from '@/lib/api-football';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const response = await getTodaysFixtures();
    const assignments = extractTodaysAssignments(response.response || []);

    return NextResponse.json({
      assignments,
      count: assignments.length,
      date: new Date().toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error fetching today\'s fixtures:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch today\'s fixtures',
        assignments: [],
        count: 0,
        date: new Date().toISOString().split('T')[0],
      },
      { status: 500 }
    );
  }
}
