#!/bin/bash

# ============================================
# AUTONOMOUS REFEREE STATS - SETUP SCRIPT
# ============================================

set -e

echo "🚀 Starting Autonomous Referee Stats Setup..."
echo "============================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BASE_DIR"

# ============================================
# 1. Create Directory Structure
# ============================================
echo -e "${YELLOW}📁 Creating directory structure...${NC}"

mkdir -p data/memory
mkdir -p data/logs
mkdir -p data/screenshots
mkdir -p project
mkdir -p skills/nextjs
mkdir -p skills/api-football
mkdir -p skills/database
mkdir -p dashboard

echo -e "${GREEN}✓ Directories created${NC}"

# ============================================
# 2. Initialize SQLite Databases
# ============================================
echo -e "${YELLOW}🗄️ Initializing SQLite databases...${NC}"

# Short-term memory database
sqlite3 data/memory/short_term.db << 'EOF'
CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    type TEXT CHECK(type IN ('action', 'observation', 'thought', 'goal', 'error')),
    content TEXT NOT NULL,
    session_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_memories_timestamp ON memories(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);

-- Trigger to keep only last 50 entries
CREATE TRIGGER IF NOT EXISTS cleanup_old_memories
AFTER INSERT ON memories
BEGIN
    DELETE FROM memories WHERE id NOT IN (
        SELECT id FROM memories ORDER BY timestamp DESC LIMIT 50
    );
END;
EOF

echo -e "${GREEN}✓ Short-term memory database created${NC}"

# Long-term memory database
sqlite3 data/memory/long_term.db << 'EOF'
CREATE TABLE IF NOT EXISTS learnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    type TEXT CHECK(type IN ('fact', 'skill', 'preference', 'lesson', 'discovery', 'error')),
    content TEXT NOT NULL,
    tags TEXT DEFAULT '[]',
    importance INTEGER DEFAULT 5 CHECK(importance >= 1 AND importance <= 10),
    times_recalled INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_learnings_type ON learnings(type);
CREATE INDEX IF NOT EXISTS idx_learnings_importance ON learnings(importance DESC);

-- Full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS learnings_fts USING fts5(content, tags);

-- Trigger to sync FTS
CREATE TRIGGER IF NOT EXISTS sync_learnings_fts
AFTER INSERT ON learnings
BEGIN
    INSERT INTO learnings_fts(rowid, content, tags) VALUES (NEW.id, NEW.content, NEW.tags);
END;
EOF

echo -e "${GREEN}✓ Long-term memory database created${NC}"

# Session tracking database
sqlite3 data/memory/sessions.db << 'EOF'
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    started_at TEXT DEFAULT (datetime('now')),
    ended_at TEXT,
    tasks_completed INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    status TEXT DEFAULT 'running'
);

CREATE TABLE IF NOT EXISTS task_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    task_name TEXT,
    status TEXT CHECK(status IN ('started', 'completed', 'failed')),
    timestamp TEXT DEFAULT (datetime('now')),
    duration_seconds INTEGER,
    notes TEXT
);
EOF

echo -e "${GREEN}✓ Session tracking database created${NC}"

# ============================================
# 3. Create Skills
# ============================================
echo -e "${YELLOW}📚 Creating skill files...${NC}"

# Next.js Skill
cat > skills/nextjs/SKILL.md << 'EOF'
# Next.js 14 Development Skill

## Quick Commands
```bash
# Create new project
npx create-next-app@latest project --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

# Install shadcn/ui
npx shadcn@latest init

# Add component
npx shadcn@latest add button card table

# Development
npm run dev

# Build
npm run build
```

## App Router Structure
```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Home page (/)
├── loading.tsx         # Loading UI
├── error.tsx           # Error UI
├── [slug]/page.tsx     # Dynamic route
└── api/route.ts        # API route
```

## Common Patterns

### Server Component (Default)
```tsx
// app/referees/page.tsx
import { getReferees } from '@/lib/data';

export default async function RefereesPage() {
  const referees = await getReferees();
  return <RefereeList referees={referees} />;
}
```

### Client Component
```tsx
'use client';
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### API Route
```tsx
// app/api/referees/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await fetch('...');
  return NextResponse.json(data);
}
```
EOF

# API-Football Skill
cat > skills/api-football/SKILL.md << 'EOF'
# API-Football Integration Skill

## Configuration
```typescript
const API_KEY = 'ea04c7309495164f85f3f5fdb5567896';
const BASE_URL = 'https://v3.football.api-sports.io';
const RATE_LIMIT = 30; // requests per minute
```

## Key Endpoints

### Get Fixtures with Referee
```typescript
GET /fixtures?league={id}&season={year}
// Response includes referee in fixture object
```

### Get Fixture Events (Cards, Goals)
```typescript
GET /fixtures/events?fixture={id}
// Returns: goals, cards, substitutions
```

### Get Fixture Statistics
```typescript
GET /fixtures/statistics?fixture={id}
// Returns: shots, fouls, corners, etc.
```

## League IDs
```typescript
const LEAGUES = {
  PREMIER_LEAGUE: 39,
  LA_LIGA: 140,
  SERIE_A: 135,
  BUNDESLIGA: 78,
  LIGUE_1: 61,
  CHAMPIONS_LEAGUE: 2,
};
```

## Rate Limiting Implementation
```typescript
class RateLimiter {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;
  
  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          resolve(await fn());
        } catch (e) {
          reject(e);
        }
      });
      this.process();
    });
  }
  
  private async process() {
    if (this.processing) return;
    this.processing = true;
    
    while (this.queue.length > 0) {
      const fn = this.queue.shift()!;
      await fn();
      await new Promise(r => setTimeout(r, 2000)); // 30/min = 2s between
    }
    
    this.processing = false;
  }
}
```
EOF

# Database Skill
cat > skills/database/SKILL.md << 'EOF'
# Database Management Skill

## Prisma Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // Use "postgresql" for production
  url      = env("DATABASE_URL")
}

model Referee {
  id            Int       @id @default(autoincrement())
  apiFootballId Int       @unique
  name          String
  slug          String    @unique
  country       String?
  photoUrl      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  matches       Match[]
  seasonStats   RefereeSeason[]
}

model League {
  id            Int       @id @default(autoincrement())
  apiFootballId Int       @unique
  name          String
  country       String
  logo          String?
  matches       Match[]
}

model Match {
  id            Int       @id @default(autoincrement())
  apiFootballId Int       @unique
  leagueId      Int
  refereeId     Int?
  homeTeam      String
  awayTeam      String
  homeScore     Int?
  awayScore     Int?
  matchDate     DateTime
  season        String
  stats         MatchStats?
  
  league        League    @relation(fields: [leagueId], references: [id])
  referee       Referee?  @relation(fields: [refereeId], references: [id])
}

model MatchStats {
  id              Int     @id @default(autoincrement())
  matchId         Int     @unique
  homeYellow      Int     @default(0)
  awayYellow      Int     @default(0)
  homeRed         Int     @default(0)
  awayRed         Int     @default(0)
  homeFouls       Int?
  awayFouls       Int?
  penaltiesAwarded Int    @default(0)
  
  match           Match   @relation(fields: [matchId], references: [id])
}

model RefereeSeason {
  id              Int     @id @default(autoincrement())
  refereeId       Int
  leagueId        Int
  season          String
  matchesOfficiated Int   @default(0)
  totalYellow     Int     @default(0)
  totalRed        Int     @default(0)
  totalPenalties  Int     @default(0)
  avgCardsPerMatch Float?
  avgGoalsPerMatch Float?
  strictnessIndex Float?
  homeBiasScore   Float?
  
  referee         Referee @relation(fields: [refereeId], references: [id])
  
  @@unique([refereeId, leagueId, season])
}
```

## Commands
```bash
# Generate client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Push schema (no migration)
npx prisma db push

# View data
npx prisma studio
```
EOF

echo -e "${GREEN}✓ Skills created${NC}"

# ============================================
# 4. Create Dashboard
# ============================================
echo -e "${YELLOW}🖥️ Creating dashboard...${NC}"

cat > dashboard/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Autonomous Claude - Referee Stats Builder</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        navy: '#0f172a',
                        slate: '#1e293b',
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-navy text-white min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <header class="mb-8">
            <h1 class="text-4xl font-bold text-blue-400">🤖 Autonomous Claude</h1>
            <p class="text-gray-400 mt-2">Building RefStats.com - 24/7 Autonomous Development</p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <!-- Status Card -->
            <div class="bg-slate rounded-lg p-6">
                <h2 class="text-lg font-semibold mb-4">System Status</h2>
                <div id="status" class="flex items-center gap-2">
                    <span class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Running</span>
                </div>
                <p class="text-gray-400 text-sm mt-2" id="uptime">Uptime: Loading...</p>
            </div>

            <!-- Tasks Card -->
            <div class="bg-slate rounded-lg p-6">
                <h2 class="text-lg font-semibold mb-4">Tasks Progress</h2>
                <div class="text-3xl font-bold text-blue-400" id="tasks">0/58</div>
                <div class="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div class="bg-blue-500 h-2 rounded-full" id="progress" style="width: 0%"></div>
                </div>
            </div>

            <!-- Memory Card -->
            <div class="bg-slate rounded-lg p-6">
                <h2 class="text-lg font-semibold mb-4">Memory Usage</h2>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="text-gray-400">Short-term:</span>
                        <span class="font-mono" id="shortterm">0</span>
                    </div>
                    <div>
                        <span class="text-gray-400">Long-term:</span>
                        <span class="font-mono" id="longterm">0</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Actions -->
        <div class="bg-slate rounded-lg p-6 mb-8">
            <h2 class="text-lg font-semibold mb-4">Recent Actions</h2>
            <div id="actions" class="space-y-2 font-mono text-sm">
                <p class="text-gray-500">Loading...</p>
            </div>
        </div>

        <!-- Live Terminal (if ttyd is running) -->
        <div class="bg-slate rounded-lg p-6">
            <h2 class="text-lg font-semibold mb-4">Live Terminal</h2>
            <iframe id="terminal" src="http://localhost:7681" class="w-full h-96 rounded bg-black"></iframe>
        </div>
    </div>

    <script>
        // Auto-refresh every 5 seconds
        async function refresh() {
            try {
                // In real implementation, fetch from API
                // For now, just show placeholder
            } catch (e) {
                console.error('Refresh failed:', e);
            }
        }

        setInterval(refresh, 5000);
        refresh();
    </script>
</body>
</html>
EOF

echo -e "${GREEN}✓ Dashboard created${NC}"

# ============================================
# 5. Check Dependencies
# ============================================
echo -e "${YELLOW}🔍 Checking dependencies...${NC}"

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓ $1 is installed${NC}"
        return 0
    else
        echo -e "${RED}✗ $1 is NOT installed${NC}"
        return 1
    fi
}

check_command "node"
check_command "npm"
check_command "sqlite3"
check_command "tmux"
check_command "claude"

# ============================================
# 6. Make Scripts Executable
# ============================================
echo -e "${YELLOW}🔧 Making scripts executable...${NC}"

chmod +x watcher.sh 2>/dev/null || true
chmod +x worker.sh 2>/dev/null || true
chmod +x start.sh 2>/dev/null || true
chmod +x stop.sh 2>/dev/null || true

echo -e "${GREEN}✓ Scripts ready${NC}"

# ============================================
# Done
# ============================================
echo ""
echo "============================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Review MASTER_PROMPT.md"
echo "  2. Review TASKS.md"
echo "  3. Run: ./start.sh"
echo ""
echo "Or manually start Claude:"
echo "  cd project"
echo "  claude --dangerously-skip-permissions"
echo ""
