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
