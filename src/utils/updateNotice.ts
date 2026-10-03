export const UPDATE_NOTICE_LINES = [
  "개인적으로 하려고 만든 게임인데 생각보다 많은 분들이 즐겨 주셔서 업데이트를 조금 했어요. 이제 더 잘 관리해 보겠습니다.",
  "먼저 포기하면 그 번호의 정답을 알려줘요. 그리고 Shouts에서 게임에서 사람들이 많이 외친 단어 순위를 볼 수 있어요.",
  "유사도 계산 부분도 나중에 업데이트할 예정이에요. 언제인지는 아직 모릅니다.",
  "플레이 해주셔서 감사합니다.",
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
