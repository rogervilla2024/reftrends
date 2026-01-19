/**
 * Card Prediction Engine
 * Uses Poisson distribution and weighted historical data for predictions
 */

interface RefereeStats {
  avgYellowCards: number;
  avgRedCards: number;
  matchesOfficiated: number;
  strictnessIndex: number;
  recentForm?: number[]; // Last 5 matches yellow cards
}

interface TeamStats {
  avgYellowReceived: number;
  avgRedReceived: number;
  avgFoulsCommitted: number;
  matchesPlayed: number;
}

interface PredictionResult {
  expectedYellowCards: number;
  expectedRedCards: number;
  expectedTotalCards: number;
  over25Probability: number;
  over35Probability: number;
  over45Probability: number;
  under25Probability: number;
  under35Probability: number;
  confidence: 'high' | 'medium' | 'low';
  confidenceScore: number;
}

interface FormAnalysis {
  trend: 'improving' | 'stable' | 'declining';
  trendScore: number; // -1 to 1
  avgLast5: number;
  avgSeason: number;
  volatility: number;
  formRating: number; // 1-10
}

interface CompatibilityScore {
  score: number; // 0-100
  rating: 'excellent' | 'good' | 'neutral' | 'poor' | 'very_poor';
  cardTendency: 'fewer' | 'normal' | 'more';
  historicalMatches: number;
  avgCardsInHistory: number;
}

/**
 * Poisson probability mass function
 */
function poissonPMF(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

/**
 * Factorial with memoization
 */
const factorialCache: Record<number, number> = { 0: 1, 1: 1 };
function factorial(n: number): number {
  if (n < 0) return 1;
  if (factorialCache[n]) return factorialCache[n];
  factorialCache[n] = n * factorial(n - 1);
  return factorialCache[n];
}

/**
 * Calculate cumulative Poisson probability P(X >= k)
 */
function poissonCumulativeGTE(k: number, lambda: number): number {
  let sum = 0;
  for (let i = 0; i < k; i++) {
    sum += poissonPMF(i, lambda);
  }
  return 1 - sum;
}

/**
 * Calculate expected cards using weighted factors
 */
export function calculateExpectedCards(
  refereeStats: RefereeStats,
  homeTeamStats?: TeamStats,
  awayTeamStats?: TeamStats,
  leagueAvgYellow: number = 4.0
): PredictionResult {
  // Weights for different factors
  const REFEREE_WEIGHT = 0.45;
  const TEAM_WEIGHT = 0.35;
  const LEAGUE_WEIGHT = 0.20;

  // Base expected from referee
  let expectedYellow = refereeStats.avgYellowCards;
  let expectedRed = refereeStats.avgRedCards;

  // Adjust for team stats if available
  if (homeTeamStats && awayTeamStats) {
    const teamAvgYellow = (homeTeamStats.avgYellowReceived + awayTeamStats.avgYellowReceived);
    const teamAvgRed = (homeTeamStats.avgRedReceived + awayTeamStats.avgRedReceived);

    expectedYellow = (
      refereeStats.avgYellowCards * REFEREE_WEIGHT +
      teamAvgYellow * TEAM_WEIGHT +
      leagueAvgYellow * LEAGUE_WEIGHT
    );

    expectedRed = (
      refereeStats.avgRedCards * REFEREE_WEIGHT +
      teamAvgRed * TEAM_WEIGHT +
      0.15 * LEAGUE_WEIGHT // League avg red is typically ~0.15
    );
  }

  // Apply referee form adjustment if available
  if (refereeStats.recentForm && refereeStats.recentForm.length >= 3) {
    const recentAvg = refereeStats.recentForm.reduce((a, b) => a + b, 0) / refereeStats.recentForm.length;
    const formAdjustment = (recentAvg - refereeStats.avgYellowCards) * 0.15;
    expectedYellow += formAdjustment;
  }

  // Ensure non-negative
  expectedYellow = Math.max(0, expectedYellow);
  expectedRed = Math.max(0, expectedRed);
  const expectedTotal = expectedYellow + expectedRed;

  // Calculate probabilities using Poisson distribution
  const over25Probability = poissonCumulativeGTE(3, expectedTotal) * 100;
  const over35Probability = poissonCumulativeGTE(4, expectedTotal) * 100;
  const over45Probability = poissonCumulativeGTE(5, expectedTotal) * 100;

  // Calculate confidence based on sample size
  let confidenceScore = 0;
  if (refereeStats.matchesOfficiated >= 20) confidenceScore += 40;
  else if (refereeStats.matchesOfficiated >= 10) confidenceScore += 25;
  else if (refereeStats.matchesOfficiated >= 5) confidenceScore += 15;

  if (homeTeamStats && awayTeamStats) {
    if (homeTeamStats.matchesPlayed >= 10 && awayTeamStats.matchesPlayed >= 10) {
      confidenceScore += 35;
    } else if (homeTeamStats.matchesPlayed >= 5 && awayTeamStats.matchesPlayed >= 5) {
      confidenceScore += 20;
    }
  } else {
    confidenceScore += 10; // Base confidence without team data
  }

  // Add confidence for referee form data
  if (refereeStats.recentForm && refereeStats.recentForm.length >= 5) {
    confidenceScore += 25;
  }

  const confidence: 'high' | 'medium' | 'low' =
    confidenceScore >= 70 ? 'high' :
    confidenceScore >= 40 ? 'medium' : 'low';

  return {
    expectedYellowCards: Math.round(expectedYellow * 100) / 100,
    expectedRedCards: Math.round(expectedRed * 100) / 100,
    expectedTotalCards: Math.round(expectedTotal * 100) / 100,
    over25Probability: Math.round(over25Probability * 10) / 10,
    over35Probability: Math.round(over35Probability * 10) / 10,
    over45Probability: Math.round(over45Probability * 10) / 10,
    under25Probability: Math.round((100 - over25Probability) * 10) / 10,
    under35Probability: Math.round((100 - over35Probability) * 10) / 10,
    confidence,
    confidenceScore: Math.min(100, confidenceScore),
  };
}

/**
 * Analyze referee form based on recent matches
 */
export function analyzeRefereeForm(
  recentCards: number[],
  seasonAvg: number
): FormAnalysis {
  if (recentCards.length === 0) {
    return {
      trend: 'stable',
      trendScore: 0,
      avgLast5: seasonAvg,
      avgSeason: seasonAvg,
      volatility: 0,
      formRating: 5,
    };
  }

  const avgLast5 = recentCards.reduce((a, b) => a + b, 0) / recentCards.length;

  // Calculate trend using linear regression slope
  let trendScore = 0;
  if (recentCards.length >= 3) {
    const n = recentCards.length;
    const xMean = (n - 1) / 2;
    const yMean = avgLast5;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (recentCards[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    trendScore = Math.max(-1, Math.min(1, slope / 2)); // Normalize to -1 to 1
  }

  // Calculate volatility (standard deviation)
  const variance = recentCards.reduce((sum, val) => sum + Math.pow(val - avgLast5, 2), 0) / recentCards.length;
  const volatility = Math.sqrt(variance);

  // Determine trend direction
  let trend: 'improving' | 'stable' | 'declining';
  if (trendScore > 0.15) {
    trend = 'declining'; // More cards = stricter = declining form for bettors
  } else if (trendScore < -0.15) {
    trend = 'improving'; // Fewer cards = improving
  } else {
    trend = 'stable';
  }

  // Calculate form rating (1-10)
  // Higher rating = more predictable/consistent
  const consistencyScore = Math.max(0, 10 - volatility * 2);
  const formRating = Math.round(Math.max(1, Math.min(10, consistencyScore)));

  return {
    trend,
    trendScore: Math.round(trendScore * 100) / 100,
    avgLast5: Math.round(avgLast5 * 100) / 100,
    avgSeason: seasonAvg,
    volatility: Math.round(volatility * 100) / 100,
    formRating,
  };
}

/**
 * Calculate referee-team compatibility score
 */
export function calculateCompatibilityScore(
  historicalMatches: {
    yellowCards: number;
    redCards: number;
    fouls: number;
    result: 'win' | 'draw' | 'loss';
  }[],
  refereeSeasonAvgYellow: number,
  teamSeasonAvgYellow: number
): CompatibilityScore {
  if (historicalMatches.length === 0) {
    return {
      score: 50,
      rating: 'neutral',
      cardTendency: 'normal',
      historicalMatches: 0,
      avgCardsInHistory: 0,
    };
  }

  const totalCards = historicalMatches.reduce((sum, m) => sum + m.yellowCards + m.redCards, 0);
  const avgCardsInHistory = totalCards / historicalMatches.length;

  // Expected cards based on both referee and team averages
  const expectedCards = (refereeSeasonAvgYellow + teamSeasonAvgYellow) / 2;

  // Calculate deviation from expected
  const deviation = avgCardsInHistory - expectedCards;
  const deviationPercent = expectedCards > 0 ? (deviation / expectedCards) * 100 : 0;

  // Calculate win rate with this referee
  const wins = historicalMatches.filter(m => m.result === 'win').length;
  const winRate = (wins / historicalMatches.length) * 100;

  // Calculate compatibility score (0-100)
  // Higher score = team performs better with this referee
  let score = 50; // Base score

  // Adjust for card deviation (fewer cards = better for team)
  score -= deviationPercent * 0.3;

  // Adjust for win rate
  score += (winRate - 33.33) * 0.4; // 33.33% is expected random win rate

  // Add bonus for sample size confidence
  if (historicalMatches.length >= 5) score += 5;
  if (historicalMatches.length >= 10) score += 5;

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine rating
  let rating: 'excellent' | 'good' | 'neutral' | 'poor' | 'very_poor';
  if (score >= 70) rating = 'excellent';
  else if (score >= 55) rating = 'good';
  else if (score >= 45) rating = 'neutral';
  else if (score >= 30) rating = 'poor';
  else rating = 'very_poor';

  // Determine card tendency
  let cardTendency: 'fewer' | 'normal' | 'more';
  if (deviationPercent <= -15) cardTendency = 'fewer';
  else if (deviationPercent >= 15) cardTendency = 'more';
  else cardTendency = 'normal';

  return {
    score: Math.round(score),
    rating,
    cardTendency,
    historicalMatches: historicalMatches.length,
    avgCardsInHistory: Math.round(avgCardsInHistory * 100) / 100,
  };
}

/**
 * Generate betting recommendation based on prediction
 */
export function generateBettingRecommendation(
  prediction: PredictionResult
): {
  primaryPick: string;
  primaryOddsRange: string;
  confidence: string;
  reasoning: string;
  alternativePicks: string[];
} {
  const { over25Probability, over35Probability, over45Probability, expectedTotalCards, confidence } = prediction;

  let primaryPick = '';
  let primaryOddsRange = '';
  let reasoning = '';
  const alternativePicks: string[] = [];

  // Determine best pick based on probabilities
  if (over45Probability >= 60) {
    primaryPick = 'Over 4.5 Cards';
    primaryOddsRange = '2.00 - 2.50';
    reasoning = `Strong ${over45Probability.toFixed(0)}% probability for 5+ cards. Referee shows ${expectedTotalCards.toFixed(1)} cards on average.`;
    alternativePicks.push('Over 3.5 Cards (safer)');
  } else if (over35Probability >= 65) {
    primaryPick = 'Over 3.5 Cards';
    primaryOddsRange = '1.70 - 2.00';
    reasoning = `Good ${over35Probability.toFixed(0)}% probability for 4+ cards based on historical data.`;
    if (over45Probability >= 40) alternativePicks.push('Over 4.5 Cards (value)');
    alternativePicks.push('Over 2.5 Cards (safer)');
  } else if (over25Probability >= 70) {
    primaryPick = 'Over 2.5 Cards';
    primaryOddsRange = '1.40 - 1.60';
    reasoning = `High ${over25Probability.toFixed(0)}% probability for 3+ cards. Conservative but reliable.`;
  } else if (prediction.under35Probability >= 60) {
    primaryPick = 'Under 3.5 Cards';
    primaryOddsRange = '1.80 - 2.20';
    reasoning = `${prediction.under35Probability.toFixed(0)}% probability for under 4 cards. Lenient referee expected.`;
    alternativePicks.push('Under 4.5 Cards (safer)');
  } else {
    primaryPick = 'Skip - No Clear Edge';
    primaryOddsRange = 'N/A';
    reasoning = 'Probabilities are too close to call. Wait for better opportunity.';
  }

  return {
    primaryPick,
    primaryOddsRange,
    confidence: confidence === 'high' ? 'High Confidence' : confidence === 'medium' ? 'Medium Confidence' : 'Low Confidence',
    reasoning,
    alternativePicks,
  };
}
