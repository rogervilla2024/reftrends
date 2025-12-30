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
