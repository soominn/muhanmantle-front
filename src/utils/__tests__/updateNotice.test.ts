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
  it("announces the update sentences in order", () => {
    expect([...UPDATE_NOTICE_LINES]).toEqual([
      "개인적으로 하려고 만든 게임인데 생각보다 많은 분들이 즐겨 주셔서 업데이트를 조금 했습니다.",
      "먼저 포기하면 그 번호의 정답을 알려줍니다. 그리고 Shouts에서 게임에서 사람들이 많이 외친 단어 순위를 볼 수 있습니다.",
      "유사도 계산 부분도 나중에 업데이트할 예정입니다. 언제인지는 아직 모릅니다.",
      "이제 더 잘 관리해 보겠습니다. 플레이 해주셔서 감사합니다.",
    ]);
  });

  it("glues the storage key to the exact wording", () => {
    const key = updateNoticeStorageKey();
    for (const line of UPDATE_NOTICE_LINES) {
      expect(key).toContain(line);
    }
  });

  it("shows this wording to someone who already closed the previous notice", () => {
    const previous = [
      "개인적으로 하려고 만든 게임인데 생각보다 많은 분들이 즐겨 주셔서 업데이트를 조금 했어요. 이제 더 잘 관리해 보겠습니다.",
      "먼저 포기하면 그 번호의 정답을 알려줘요. 그리고 Shouts에서 게임에서 사람들이 많이 외친 단어 순위를 볼 수 있어요.",
      "유사도 계산 부분도 나중에 업데이트할 예정이에요. 언제인지는 아직 모릅니다.",
      "플레이 해주셔서 감사합니다.",
    ] as const;
    markUpdateNoticeSeen(previous);
    expect(hasSeenUpdateNotice(previous)).toBe(true);
    expect(updateNoticeStorageKey()).not.toBe(updateNoticeStorageKey(previous));
    expect(hasSeenUpdateNotice()).toBe(false);
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
