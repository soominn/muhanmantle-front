import { afterEach, describe, expect, it, vi } from "vitest";
import { persistGameSessionId, postGameGiveUp } from "../gameSession";

const SESSION_ID = "11111111-1111-4111-8111-111111111111";

afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

describe("game session contract", () => {
  it("posts give-up with the existing session header", async () => {
    persistGameSessionId(SESSION_ID);
    const payload = {
      session_id: SESSION_ID,
      answer_id: 4,
      total_count: 10,
      guesses: [],
      is_correct: false,
      correct_attempt_count: 0,
      revealed_answer: { number: 4, word: "사과" },
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    const data = await postGameGiveUp("http://example.test/api/game");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.test/api/game/session/give-up",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: expect.objectContaining({
          "X-Game-Session": SESSION_ID,
        }),
      }),
    );
    expect(data.revealed_answer).toEqual({ number: 4, word: "사과" });
  });
});
