export interface GuessResult {
  attemptNumber: number;
  word: string;
  /** L2-normalized cosine similarity in [-1, 1] (FastText / ST). */
  similarity: number;
  /** @deprecated Old sessions only (was cosine×100, often truncated with int). */
  similarityPct?: number;
}

export interface SimilarityApiResponse {
  id: number;
  input_word: string;
  similarity_percentage: number;
  rank: number | string;
}

export interface TotalCountResponse {
  total_count: number;
}

/** GET /api/game/session, POST …/reset, POST …/guess (without duplicate flag). */
export interface GameSessionResponse {
  session_id: string;
  answer_id: number | null;
  total_count: number;
  guesses: GuessResult[];
  is_correct: boolean;
  correct_attempt_count: number;
}

export interface GameGuessResponse extends GameSessionResponse {
  duplicate: boolean;
}
