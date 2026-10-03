import { describe, expect, it } from "vitest";
import { formatRevealedAnswer } from "../revealedAnswer";

describe("formatRevealedAnswer", () => {
  it("uses the on-screen answer number and the revealed word", () => {
    expect(formatRevealedAnswer(4, "사과")).toBe("4번 정답은 사과였다.");
    expect(formatRevealedAnswer(12847, "달력")).toBe("12,847번 정답은 달력였다.");
  });
});
