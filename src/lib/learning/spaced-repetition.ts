// ============================================
// SM-2 Spaced Repetition Algorithm
// Same algorithm used by Anki
// ============================================

import type { RepetitionUpdate } from '@/types';

/**
 * SM-2 Algorithm
 * 
 * quality: 0-5 rating of how well the user recalled the answer
 *   0 - Complete blackout
 *   1 - Incorrect, but upon seeing the answer, remembered
 *   2 - Incorrect, but the answer seemed easy to recall
 *   3 - Correct with serious difficulty
 *   4 - Correct after hesitation
 *   5 - Perfect recall
 * 
 * Returns updated repetition parameters
 */
export function calculateNextReview(
  quality: number,
  currentInterval: number,
  currentEaseFactor: number,
  currentRepetitionLevel: number
): RepetitionUpdate {
  // Clamp quality to 0-5
  const q = Math.max(0, Math.min(5, Math.round(quality)));

  let newInterval: number;
  let newEaseFactor: number;
  let newRepetitionLevel: number;

  if (q < 3) {
    // Failed — reset to beginning
    newRepetitionLevel = 0;
    newInterval = 1;
    newEaseFactor = Math.max(1.3, currentEaseFactor - 0.2);
  } else {
    // Passed — advance
    newRepetitionLevel = currentRepetitionLevel + 1;

    if (newRepetitionLevel === 1) {
      newInterval = 1;
    } else if (newRepetitionLevel === 2) {
      newInterval = 3;
    } else {
      newInterval = Math.round(currentInterval * currentEaseFactor);
    }

    // Update ease factor: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
    newEaseFactor = currentEaseFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    newEaseFactor = Math.max(1.3, newEaseFactor);
  }

  // Cap interval at 180 days
  newInterval = Math.min(newInterval, 180);

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    nextReviewDate,
    interval: newInterval,
    easeFactor: Number(newEaseFactor.toFixed(2)),
    repetitionLevel: newRepetitionLevel,
  };
}

/**
 * Convert a 0-100 score to SM-2 quality (0-5)
 */
export function scoreToQuality(score: number): number {
  if (score >= 95) return 5;
  if (score >= 80) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  if (score >= 20) return 1;
  return 0;
}

/**
 * Get all tasks due for review today
 */
export function isDueForReview(nextReviewDate: Date | null): boolean {
  if (!nextReviewDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reviewDate = new Date(nextReviewDate);
  reviewDate.setHours(0, 0, 0, 0);
  return reviewDate <= today;
}
