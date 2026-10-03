import { describe, expect, it } from "vitest";
import { noticeParagraphs } from "../noticeBody";

describe("noticeParagraphs", () => {
  it("splits blank lines into paragraphs and single newlines into lines", () => {
    expect(noticeParagraphs("첫째 줄\n둘째 줄\n\n다음 문단")).toEqual([
      ["첫째 줄", "둘째 줄"],
      ["다음 문단"],
    ]);
  });

  it("leaves markdown marks as plain text", () => {
    expect(noticeParagraphs("# 제목\n**굵게**")).toEqual([["# 제목", "**굵게**"]]);
  });
});