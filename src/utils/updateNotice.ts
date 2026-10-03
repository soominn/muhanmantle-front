export const UPDATE_NOTICE_LINES = [
  "포기하면 그 번호의 정답을 알려줘요.",
  "이 퍼즐에서 많이 외친 단어 순위를 볼 수 있어요.",
] as const;

/** Storage key stays glued to the copy, so a wording change shows the notice again. */
export function updateNoticeStorageKey(
  lines: readonly string[] = UPDATE_NOTICE_LINES,
): string {
  return `muhanmantle.updateNotice:${lines.join("\n")}`;
}

export function hasSeenUpdateNotice(
  lines: readonly string[] = UPDATE_NOTICE_LINES,
): boolean {
  try {
    return localStorage.getItem(updateNoticeStorageKey(lines)) === "1";
  } catch {
    return false;
  }
}

export function markUpdateNoticeSeen(
  lines: readonly string[] = UPDATE_NOTICE_LINES,
): void {
  try {
    localStorage.setItem(updateNoticeStorageKey(lines), "1");
  } catch {
    /* private mode / quota */
  }
}
