import type { GameGuessResponse, GameSessionResponse } from "../types/game";

const SESSION_STORAGE_KEY = "muhanmantle_mm_session";

export function persistGameSessionId(id: string | undefined | null): void {
  if (!id || typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, id);
  } catch {
    /* quota / private mode */
  }
}

function sessionRequestHeaders(
  extra: Record<string, string> = {},
): Record<string, string> {
  const h: Record<string, string> = { Accept: "application/json", ...extra };
  if (typeof sessionStorage === "undefined") return h;
  try {
    const sid = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sid) h["X-Game-Session"] = sid;
  } catch {
    /* ignore */
  }
  return h;
}

async function parseJsonError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (body && typeof body.error === "string") return body.error;
    if (body && typeof body.detail === "string") return body.detail;
  } catch {
    /* ignore */
  }
  return `서버 응답 오류: ${response.status}`;
}

export async function fetchGameSession(base: string): Promise<GameSessionResponse> {
  const response = await fetch(`${base}/session`, {
    headers: sessionRequestHeaders(),
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(await parseJsonError(response));
  }
  const data = (await response.json()) as GameSessionResponse;
  persistGameSessionId(data.session_id);
  return data;
}

export async function postGameGuess(
  base: string,
  word: string,
): Promise<GameGuessResponse> {
  const response = await fetch(`${base}/session/guess`, {
    method: "POST",
    headers: sessionRequestHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify({ word }),
  });
  const data = (await response.json()) as GameGuessResponse & {
    detail?: string;
    error?: string;
  };
  if (!response.ok) {
    const msg =
      typeof data.error === "string"
        ? data.error
        : typeof data.detail === "string"
          ? data.detail
          : `서버 응답 오류: ${response.status}`;
    throw new Error(msg);
  }
  persistGameSessionId(data.session_id);
  return data;
}

export async function postGameReset(base: string): Promise<GameSessionResponse> {
  const response = await fetch(`${base}/session/reset`, {
    method: "POST",
    headers: sessionRequestHeaders(),
    credentials: "include",
  });
  const data = (await response.json().catch(() => ({}))) as GameSessionResponse & {
    error?: string;
    detail?: string;
  };
  if (!response.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : typeof data.detail === "string"
          ? data.detail
          : `서버 응답 오류: ${response.status}`,
    );
  }
  persistGameSessionId(data.session_id);
  return data;
}
