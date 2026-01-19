#!/usr/bin/env npx tsx

/**
 * Weekly Penalty Data Sync Script
 *
 * Updates penalty data for matches that might have been missed.
 * Runs weekly to ensure penalty data is complete.
 *
 * Run with: npm run sync:penalties
 * Scheduled: Every Sunday at 04:00
 */

import prisma from '../lib/db';

const API_KEY = process.env.API_FOOTBALL_KEY || 'ea04c7309495164f85f3f5fdb5567896';
const BASE_URL = 'https://v3.football.api-sports.io';

interface FixtureEvent {
    time: { elapsed: number };
    team: { id: number };
    type: string;
    detail: string;
}

let requestCount = 0;

async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiRequest<T>(endpoint: string): Promise<T> {
    requestCount++;
    console.log(`📡 API Request #${requestCount}: ${endpoint}`);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { 'x-apisports-key': API_KEY },
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
}

async function syncPenaltyData(): Promise<void> {
    const startTime = Date.now();
    console.log('=== Weekly Penalty Sync ===');
    console.log(`📅 Date: ${new Date().toISOString()}\n`);

    // Get matches with stats but potentially missing penalty data (penalties = 0)
    // Focus on last 30 days to catch any missed penalties
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const matchesWithStats = await prisma.matchStats.findMany({
        where: {
            penalties: 0,
            match: {
                status: { in: ['FT', 'Match Finished'] },
                date: { gte: thirtyDaysAgo },
            },
        },
        include: {
            match: {
                include: {
                    homeTeam: true,
                    awayTeam: true,
                    league: true,
                },
            },
        },
    });

    console.log(`Found ${matchesWithStats.length} matches to check for penalties (last 30 days)\n`);

    let updated = 0;
    let withPenalties = 0;

    for (let i = 0; i < matchesWithStats.length; i++) {
        const matchStat = matchesWithStats[i];
        const match = matchStat.match;

        try {
            await sleep(200); // Fast mode - 75K daily API limit

            const events = await apiRequest<FixtureEvent[]>(
                `/fixtures/events?fixture=${match.apiId}`
            );

            let penalties = 0;
            let homePenalties = 0;
            let awayPenalties = 0;

            for (const event of events) {
                if (event.detail === 'Penalty' || event.detail === 'Missed Penalty') {
                    penalties++;
                    if (event.team.id === match.homeTeam.apiId) {
                        homePenalties++;
                    } else {
                        awayPenalties++;
                    }
                }
            }

            if (penalties > 0) {
                await prisma.matchStats.update({
                    where: { id: matchStat.id },
                    data: {
                        penalties,
                        homePenalties,
                        awayPenalties,
                    },
                });
                withPenalties++;
                console.log(
                    `  [${i + 1}/${matchesWithStats.length}] ${match.homeTeam.name} vs ${match.awayTeam.name}: ${penalties} penalties`
                );
            } else if ((i + 1) % 50 === 0) {
                console.log(`  [${i + 1}/${matchesWithStats.length}] Processed...`);
            }

            updated++;
        } catch (err) {
            console.error(`  Error updating match ${match.apiId}:`, err);
        }
    }

    // Update referee season stats with new penalty data
    console.log('\n📈 Updating referee season stats...');
    await updateRefereeStats();

    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n=== Summary ===`);
    console.log(`Matches processed: ${updated}`);
    console.log(`Matches with penalties found: ${withPenalties}`);
    console.log(`API Requests: ${requestCount}`);
    console.log(`Duration: ${duration}s`);
}

async function updateRefereeStats(): Promise<void> {
    const referees = await prisma.referee.findMany({
        include: {
            matches: {
                where: { status: { in: ['FT', 'Match Finished'] } },
                include: { stats: true, league: true },
            },
        },
    });

    for (const referee of referees) {
        const seasonLeagueStats = new Map<
            string,
            {
                season: number;
                leagueApiId: number;
                matches: typeof referee.matches;
            }
        >();

        for (const match of referee.matches) {
            const key = `${match.season}-${match.league.apiId}`;
            const existing = seasonLeagueStats.get(key) || {
                season: match.season,
                leagueApiId: match.league.apiId,
                matches: [],
            };
            existing.matches.push(match);
            seasonLeagueStats.set(key, existing);
        }

        for (const [, data] of seasonLeagueStats) {
            const matchesWithStats = data.matches.filter((m) => m.stats);
            if (matchesWithStats.length === 0) continue;

            const totalPenalties = matchesWithStats.reduce(
                (sum, m) => sum + (m.stats?.penalties || 0),
                0
            );
            const avgPenalties = totalPenalties / matchesWithStats.length;

            // Also recalculate strictness index with penalties
            const totalYellow = matchesWithStats.reduce(
                (sum, m) => sum + (m.stats?.yellowCards || 0),
                0
            );
            const totalRed = matchesWithStats.reduce(
                (sum, m) => sum + (m.stats?.redCards || 0),
                0
            );
            const avgYellow = totalYellow / matchesWithStats.length;
            const avgRed = totalRed / matchesWithStats.length;
            const strictnessIndex = avgYellow * 1.0 + avgRed * 3.0 + avgPenalties * 0.5;

            await prisma.refereeSeasonStats.updateMany({
                where: {
                    refereeId: referee.id,
                    season: data.season,
                    leagueApiId: data.leagueApiId,
                },
                data: {
                    totalPenalties,
                    avgPenalties,
                    strictnessIndex,
                },
            });
        }
    }

    console.log(`Updated stats for ${referees.length} referees`);
}

syncPenaltyData()
    .then(() => {
        console.log('\n🎉 Weekly penalty sync completed!');
        prisma.$disconnect();
    })
    .catch((err) => {
        console.error('❌ Error:', err);
        prisma.$disconnect();
        process.exit(1);
    });
