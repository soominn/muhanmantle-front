import type { GuessResult } from "../types/game";

/** Cosine in [-1, 1]; supports legacy API field similarityPct (×100). */
export function guessCosineSimilarity(g: GuessResult): number {
  if (typeof g.similarity === "number" && !Number.isNaN(g.similarity)) {
    return g.similarity;
  }
  if (typeof g.similarityPct === "number") {
    return g.similarityPct / 100;
  }
  return 0;
}

/**
 * Puts the most recent guess (highest attemptNumber) first,
 * then sorts the rest by cosine similarity descending.
 * Matches the 꼬맨틀-style UX where the latest attempt always appears on top.
 */
export function sortResults(results: GuessResult[]): GuessResult[] {
  if (results.length === 0) return results;

  const latest = results.reduce((max, r) => (r.attemptNumber > max.attemptNumber ? r : max));
  const rest = results.filter((r) => r !== latest);
  rest.sort((a, b) => guessCosineSimilarity(b) - guessCosineSimilarity(a));
  return [latest, ...rest];
}
