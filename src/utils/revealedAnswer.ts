/** Hangul syllable with a final consonant (받침). Non-syllables are treated as having none. */
function endsWithBatchim(word: string): boolean {
  const last = word.codePointAt(word.length - 1);
  if (last === undefined || last < 0xac00 || last > 0xd7a3) return false;
  return (last - 0xac00) % 28 !== 0;
}

export interface RevealedAnswerParts {
  before: string;
  word: string;
  after: string;
}

/** "{n}번 정답은 {word}였다/이었다." — n matches the on-screen answer number. */
export function revealedAnswerParts(number: number, word: string): RevealedAnswerParts {
  const ending = endsWithBatchim(word) ? "이었다" : "였다";
  return {
    before: `${Number(number).toLocaleString("ko-KR")}번 정답은 `,
    word,
    after: `${ending}.`,
  };
}

export function formatRevealedAnswer(number: number, word: string): string {
  const parts = revealedAnswerParts(number, word);
  return `${parts.before}${parts.word}${parts.after}`;
}
