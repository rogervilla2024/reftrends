-- CreateTable
CREATE TABLE "referees" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "apiId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "nationality" TEXT,
    "photo" TEXT,
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "leagues" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "apiId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "logo" TEXT,
    "season" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "teams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "apiId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "leagueId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "teams_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "leagues" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "matches" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "apiId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "venue" TEXT,
    "status" TEXT NOT NULL,
    "homeGoals" INTEGER,
    "awayGoals" INTEGER,
    "leagueId" INTEGER NOT NULL,
    "homeTeamId" INTEGER NOT NULL,
    "awayTeamId" INTEGER NOT NULL,
    "refereeId" INTEGER,
    "season" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "matches_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "leagues" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "matches_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "matches_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "matches_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "referees" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "match_stats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchId" INTEGER NOT NULL,
    "yellowCards" INTEGER NOT NULL DEFAULT 0,
    "redCards" INTEGER NOT NULL DEFAULT 0,
    "homeYellowCards" INTEGER NOT NULL DEFAULT 0,
    "awayYellowCards" INTEGER NOT NULL DEFAULT 0,
    "homeRedCards" INTEGER NOT NULL DEFAULT 0,
    "awayRedCards" INTEGER NOT NULL DEFAULT 0,
    "fouls" INTEGER NOT NULL DEFAULT 0,
    "homeFouls" INTEGER NOT NULL DEFAULT 0,
    "awayFouls" INTEGER NOT NULL DEFAULT 0,
    "penalties" INTEGER NOT NULL DEFAULT 0,
    "homePenalties" INTEGER NOT NULL DEFAULT 0,
    "awayPenalties" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "match_stats_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "referee_season_stats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "refereeId" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "leagueApiId" INTEGER NOT NULL,
    "matchesOfficiated" INTEGER NOT NULL DEFAULT 0,
    "totalYellowCards" INTEGER NOT NULL DEFAULT 0,
    "totalRedCards" INTEGER NOT NULL DEFAULT 0,
    "avgYellowCards" REAL NOT NULL DEFAULT 0,
    "avgRedCards" REAL NOT NULL DEFAULT 0,
    "totalPenalties" INTEGER NOT NULL DEFAULT 0,
    "avgPenalties" REAL NOT NULL DEFAULT 0,
    "totalFouls" INTEGER NOT NULL DEFAULT 0,
    "avgFouls" REAL NOT NULL DEFAULT 0,
    "strictnessIndex" REAL NOT NULL DEFAULT 0,
    "homeBiasScore" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "referee_season_stats_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "referees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "referees_apiId_key" ON "referees"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "referees_slug_key" ON "referees"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "leagues_apiId_key" ON "leagues"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "teams_apiId_key" ON "teams"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "matches_apiId_key" ON "matches"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "match_stats_matchId_key" ON "match_stats"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "referee_season_stats_refereeId_season_leagueApiId_key" ON "referee_season_stats"("refereeId", "season", "leagueApiId");
