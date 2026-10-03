import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchNotices, noticesUrl } from "../notices";
import { persistGameSessionId } from "../gameSession";

const SESSION_ID = "11111111-1111-4111-8111-111111111111";

afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

describe("notices", () => {
  it("points at /api/notices beside the game API", () => {
    expect(noticesUrl("/api/game")).toBe("/api/notices");
    expect(noticesUrl("http://example.test/api/game")).toBe("http://example.test/api/notices");
  });

  it("loads notices without a session cookie or header, newest first", async () => {
    persistGameSessionId(SESSION_ID);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          { slug: "older", title: "이전", date: "2026-09-01", body: "이전 글" },
          { slug: "update", title: "업데이트", date: "2026-10-03", body: "본문" },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const data = await fetchNotices("http://example.test/api/notices");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.test/api/notices",
      expect.objectContaining({
        credentials: "omit",
        headers: { Accept: "application/json" },
      }),
    );
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.stringify(init.headers)).not.toContain("X-Game-Session");
    expect(data.items.map((item) => item.slug)).toEqual(["update", "older"]);
  });
});
