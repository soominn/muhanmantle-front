import { describe, it, expect } from "vitest";
import { isValidKoreanWord } from "../inputValidation";

describe("isValidKoreanWord", () => {
  it("accepts a valid Korean multi-syllable word", () => {
    expect(isValidKoreanWord("사과")).toBe(true);
    expect(isValidKoreanWord("행복")).toBe(true);
    expect(isValidKoreanWord("컴퓨터")).toBe(true);
  });

  it("rejects empty string", () => {
    expect(isValidKoreanWord("")).toBe(false);
  });

  it("accepts single Korean syllable", () => {
    expect(isValidKoreanWord("가")).toBe(true);
    expect(isValidKoreanWord("물")).toBe(true);
  });

  it("rejects consonants only", () => {
    expect(isValidKoreanWord("ㄱ")).toBe(false);
    expect(isValidKoreanWord("ㅂㅅ")).toBe(false);
  });

  it("rejects vowels only", () => {
    expect(isValidKoreanWord("ㅏ")).toBe(false);
    expect(isValidKoreanWord("ㅣㅏ")).toBe(false);
  });

  it("rejects English only", () => {
    expect(isValidKoreanWord("apple")).toBe(false);
    expect(isValidKoreanWord("A")).toBe(false);
  });

  it("rejects numbers only", () => {
    expect(isValidKoreanWord("123")).toBe(false);
    expect(isValidKoreanWord("0")).toBe(false);
  });

  it("rejects special characters only", () => {
    expect(isValidKoreanWord("!@#")).toBe(false);
    expect(isValidKoreanWord("...")).toBe(false);
  });

  it("accepts whitespace-trimmed word (caller must trim)", () => {
    // Validation operates on the raw string; caller is responsible for trimming
    expect(isValidKoreanWord("사과")).toBe(true);
  });
});
