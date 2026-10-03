import { describe, expect, it } from "vitest";
import { formatRevealedAnswer, revealedAnswerParts } from "../revealedAnswer";

describe("formatRevealedAnswer", () => {
  it("uses 였다 when the word has no batchim", () => {
    expect(formatRevealedAnswer(4, "사과")).toBe("4번 정답은 사과였다.");
  });

  it("uses 이었다 when the word has a batchim", () => {
    expect(formatRevealedAnswer(12847, "달력")).toBe("12,847번 정답은 달력이었다.");
  });

  it("keeps 였다 for non-Hangul characters", () => {
    expect(formatRevealedAnswer(1, "apple")).toBe("1번 정답은 apple였다.");
    expect(formatRevealedAnswer(2, "A1")).toBe("2번 정답은 A1였다.");
  });

  it("looks at the last character only", () => {
    expect(formatRevealedAnswer(3, "각사")).toBe("3번 정답은 각사였다.");
    expect(formatRevealedAnswer(5, "사각")).toBe("5번 정답은 사각이었다.");
  });

  it("keeps the full sentence when the answer word is split out", () => {
    const parts = revealedAnswerParts(12847, "달력");
    expect(parts.word).toBe("달력");
    expect(`${parts.before}${parts.word}${parts.after}`).toBe("12,847번 정답은 달력이었다.");
  });
});
