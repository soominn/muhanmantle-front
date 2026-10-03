import { afterEach, describe, expect, it } from "vitest";
import {
  UPDATE_NOTICE_LINES,
  hasSeenUpdateNotice,
  markUpdateNoticeSeen,
  updateNoticeStorageKey,
} from "../updateNotice";

afterEach(() => {
  localStorage.clear();
});

describe("updateNotice", () => {
  it("announces only the two update sentences", () => {
    expect([...UPDATE_NOTICE_LINES]).toEqual([
      "포기하면 그 번호의 정답을 알려줘요.",
      "이 퍼즐에서 많이 외친 단어 순위를 볼 수 있어요.",
    ]);
  });

  it("glues the storage key to the exact wording", () => {
    const key = updateNoticeStorageKey();
    expect(key).toContain("포기하면 그 번호의 정답을 알려줘요.");
    expect(key).toContain("이 퍼즐에서 많이 외친 단어 순위를 볼 수 있어요.");
  });

  it("hides the notice after it is closed, and shows again when the copy changes", () => {
    expect(hasSeenUpdateNotice()).toBe(false);

    markUpdateNoticeSeen();
    expect(hasSeenUpdateNotice()).toBe(true);
    expect(localStorage.getItem(updateNoticeStorageKey())).toBe("1");

    const next = ["다음 업데이트 문구입니다."] as const;
    expect(hasSeenUpdateNotice(next)).toBe(false);
    expect(updateNoticeStorageKey(next)).not.toBe(updateNoticeStorageKey());
  });
});
