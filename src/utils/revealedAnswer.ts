/** "{n}번 정답은 {word}였다." — n matches the on-screen answer number. */
export function formatRevealedAnswer(number: number, word: string): string {
  return `${Number(number).toLocaleString("ko-KR")}번 정답은 ${word}였다.`;
}
