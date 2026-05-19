import { describe, it, expect } from "vitest";
import { sortResults } from "../sorting";
import type { GuessResult } from "../../types/game";

function makeGuess(
  attemptNumber: number,
  similarity: number,
  rank: number | string = attemptNumber,
): GuessResult {
  return { attemptNumber, word: `word${attemptNumber}`, similarity, rank };
}

describe("sortResults", () => {
  it("returns empty array unchanged", () => {
    expect(sortResults([])).toEqual([]);
  });

  it("returns single item unchanged", () => {
    const g = makeGuess(1, 0.5);
    expect(sortResults([g])).toEqual([g]);
  });

  it("places most recent guess (highest attemptNumber) first", () => {
    const g1 = makeGuess(1, 0.9);
    const g2 = makeGuess(2, 0.4);
    const result = sortResults([g1, g2]);
    expect(result[0].attemptNumber).toBe(2);
  });

  it("sorts remaining guesses by cosine similarity descending", () => {
    const g1 = makeGuess(1, 0.3);
    const g2 = makeGuess(2, 0.7);
    const g3 = makeGuess(3, 0.5); // latest
    const result = sortResults([g1, g2, g3]);
    expect(result[0].attemptNumber).toBe(3); // latest on top
    expect(result[1].similarity).toBe(0.7); // highest cosine next
    expect(result[2].similarity).toBe(0.3); // lowest cosine last
  });

  it("does not mutate the input array", () => {
    const guesses = [makeGuess(1, 0.8), makeGuess(2, 0.6)];
    const original = [...guesses];
    sortResults(guesses);
    expect(guesses).toEqual(original);
  });

  it("handles tied similarity in non-latest items without crashing", () => {
    const g1 = makeGuess(1, 0.5);
    const g2 = makeGuess(2, 0.5);
    const g3 = makeGuess(3, 0.9); // latest
    const result = sortResults([g1, g2, g3]);
    expect(result[0].attemptNumber).toBe(3);
    expect(result.length).toBe(3);
  });
});
