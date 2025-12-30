/**
 * API-Football Connection Test Script
 * Run with: npx tsx src/scripts/test-api.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local from project root
config({ path: resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.API_FOOTBALL_KEY || '';
const BASE_URL = 'https://v3.football.api-sports.io';

async function testAPIConnection() {
  console.log('🧪 Testing API-Football Connection...\n');

  if (!API_KEY) {
    console.error('❌ API_FOOTBALL_KEY not found in environment variables');
    console.log('   Make sure .env.local contains API_FOOTBALL_KEY=your_key');
    process.exit(1);
  }

  console.log('✅ API Key found:', API_KEY.substring(0, 8) + '...');

  try {
    // Test 1: Check API Status
    console.log('\n📡 Test 1: Checking API status...');
    const statusResponse = await fetch(`${BASE_URL}/status`, {
      headers: { 'x-apisports-key': API_KEY },
    });

    if (!statusResponse.ok) {
      throw new Error(`Status check failed: ${statusResponse.status}`);
    }

    const statusData = await statusResponse.json();
    console.log('   ✅ API Status: OK');
    console.log('   Account:', statusData.response?.account?.firstname || 'N/A');
    console.log('   Requests today:', statusData.response?.requests?.current || 0);
    console.log('   Requests limit:', statusData.response?.requests?.limit_day || 'N/A');

    // Test 2: Fetch a single fixture to verify data access
    console.log('\n📡 Test 2: Fetching Premier League fixtures...');
    const fixturesResponse = await fetch(
      `${BASE_URL}/fixtures?league=39&season=2024&last=1`,
      {
        headers: { 'x-apisports-key': API_KEY },
      }
    );

    if (!fixturesResponse.ok) {
      throw new Error(`Fixtures fetch failed: ${fixturesResponse.status}`);
    }

    const fixturesData = await fixturesResponse.json();
    const fixtures = fixturesData.response || [];

    if (fixtures.length > 0) {
      const fixture = fixtures[0];
      console.log('   ✅ Fixtures endpoint: OK');
      console.log('   Sample fixture:');
      console.log(`      Match: ${fixture.teams?.home?.name} vs ${fixture.teams?.away?.name}`);
      console.log(`      Date: ${fixture.fixture?.date}`);
      console.log(`      Referee: ${fixture.fixture?.referee || 'Not assigned'}`);
    } else {
      console.log('   ⚠️ No fixtures returned (might be off-season)');
    }

    // Test 3: Fetch leagues
    console.log('\n📡 Test 3: Fetching supported leagues...');
    const leaguesResponse = await fetch(
      `${BASE_URL}/leagues?id=39`,
      {
        headers: { 'x-apisports-key': API_KEY },
      }
    );

    if (!leaguesResponse.ok) {
      throw new Error(`Leagues fetch failed: ${leaguesResponse.status}`);
    }

    const leaguesData = await leaguesResponse.json();
    const leagues = leaguesData.response || [];

    if (leagues.length > 0) {
      console.log('   ✅ Leagues endpoint: OK');
      console.log(`   Premier League seasons available: ${leagues[0].seasons?.length || 0}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 All API tests passed successfully!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ API Test Failed:', error);
    process.exit(1);
  }
}

testAPIConnection();
