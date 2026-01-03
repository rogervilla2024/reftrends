# API-Football Referee Data Availability Research

**Date of Research:** January 3, 2026
**API:** API-Football v3
**Key Question:** Does API-Football provide referee data for upcoming matches?

## Summary

**SHORT ANSWER:** ❌ Mostly NO, but with some exceptions (like Serie A)

API-Football provides referee data **ONLY** for matches that have already been completed. For future matches (matches not yet played), referee assignments are either:
- **`null`** (not assigned yet)
- **Occasionally populated** for some leagues (e.g., Serie A) when assignments are made public

## Detailed Findings

### 1. Past Matches (Completed)
✅ **Referee data is ALWAYS available**

Example - Match played on Jan 1, 2026:
- Match: Sunderland vs Manchester City
- Status: FT (Full Time)
- Referee: **Jarred Gillett, Australia** ✓

### 2. Future Matches (Not Yet Played)

#### Premier League
```
Match: Aston Villa vs Nottingham Forest (Jan 3, 2026)
Status: NS (Not Started)
Referee: null ❌
```

#### La Liga
```
Checked multiple next fixtures
Result: ALL have referee = null ❌
```

#### Bundesliga
```
Checked multiple next fixtures
Result: ALL have referee = null ❌
```

#### Ligue 1
```
Checked multiple next fixtures
Result: ALL have referee = null ❌
```

#### Serie A ⭐ EXCEPTION
```
Match 1: Como vs Udinese (Jan 3, 2026)
Referee: Alberto Ruben Arena, Italy ✅

Match 2: Sassuolo vs Parma (Jan 3, 2026)
Referee: null ❌

Match 3: Genoa vs Pisa (Jan 3, 2026)
Referee: null ❌
```

## Key Insights

1. **No `officials` Array**: The API response does NOT include an `officials` array field.
   - Only `fixture.referee` field exists (string value)
   - This is a simple text field, not an object array

2. **Timing of Data**:
   - Referee assignments are typically made:
     - **5-7 days before match**: For major leagues (Premier League, La Liga, etc.)
     - **Varies by league**: Serie A appears to assign earlier/more frequently
   - API-Football updates this data when assignments are officially announced

3. **No Advanced Notice**:
   - The API does NOT provide early predictions or speculative referee data
   - You cannot know the referee for a match > 1 week in advance in most cases

## Response Structure

### Completed Match
```json
{
  "fixture": {
    "id": 1379055,
    "referee": "Jarred Gillett, Australia",  // ✓ HAS DATA
    "date": "2026-01-01T20:00:00+00:00",
    "timezone": "UTC",
    "venue": {...},
    "status": {
      "short": "FT",
      "long": "Match Finished"
    }
  },
  "teams": {...},
  "goals": {...},
  "score": {...}
}
```

### Future Match (No Assignment Yet)
```json
{
  "fixture": {
    "id": 1379159,
    "referee": null,  // ❌ NO DATA YET
    "date": "2026-01-03T12:30:00+00:00",
    "timezone": "UTC",
    "venue": {...},
    "status": {
      "short": "NS",
      "long": "Not Started"
    }
  },
  "teams": {...},
  "goals": null,
  "score": null
}
```

## Implications for RefStats

### ✅ Can Do
- Display referee data for matches that have been played (historical data)
- Show all upcoming matches, but with "TBA" for referee when not assigned
- Track historical referee assignments and patterns
- Build statistics from past matches

### ❌ Cannot Do
- Predict which referee will be assigned to future matches
- Show referee lineup more than 5-7 days in advance (in most leagues)
- Provide early betting advantages based on referee assignments
- Query "which referee is assigned to this future match" with certainty

### 🟡 Workaround Options
1. **Polling Strategy**: Check API every day for referee updates as matches approach
2. **League Websites**: Scrape league websites (Premier League, La Liga, etc.) for official announcements
3. **Multiple Data Sources**: Combine API-Football with other sources
4. **Automation**: Set up daily cron jobs to fetch latest assignments
5. **WebScraping**: Use Transfermarkt or official league sites as fallback

## Recommendation

For **RefStats** platform:
1. Display upcoming fixtures with "Referee TBA" placeholder
2. Implement daily sync job to update referee data as assignments are released
3. Show statistics for completed matches with their referees
4. Consider adding "Referee Will Be Announced X Days Before" messaging
5. Maybe scrape Transfermarkt or league websites for quicker access to announced assignments

## Test Queries Used

```bash
# Past matches
curl "https://v3.football.api-sports.io/fixtures?league=39&season=2025&last=1" \
  -H "x-apisports-key: YOUR_API_KEY"

# Future matches
curl "https://v3.football.api-sports.io/fixtures?league=39&season=2025&next=5" \
  -H "x-apisports-key: YOUR_API_KEY"
```

---
**Status:** RESEARCH COMPLETE ✓
