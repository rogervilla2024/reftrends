/**
 * Calculate the current football season based on date
 * Football seasons typically run from August to May
 * So if we're in Jan-July, we're in the previous year's season
 * If we're in Aug-Dec, we're in the current year's season
 */
export function getCurrentSeason(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12

  // If before August, we're still in the season that started last year
  // So the "season year" is the current year (e.g., 2025/26 season = 2026)
  if (month < 8) {
    return year;
  }

  // If August or later, we're in a new season
  // The season year is next year (e.g., 2025/26 season = 2026)
  return year + 1;
}

/**
 * Format season for display (e.g., 2026 -> "2025/26")
 */
export function formatSeason(seasonYear: number): string {
  return `${seasonYear - 1}/${seasonYear.toString().slice(2)}`;
}

/**
 * Get season for API requests (API uses the starting year)
 * e.g., for 2025/26 season, API expects 2025
 */
export function getSeasonForApi(seasonYear?: number): number {
  const season = seasonYear ?? getCurrentSeason();
  return season - 1;
}

/**
 * Check if a season is the current season
 */
export function isCurrentSeason(seasonYear: number): boolean {
  return seasonYear === getCurrentSeason();
}
