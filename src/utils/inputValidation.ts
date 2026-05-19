const INVALID_PATTERNS = [
  /^[A-Za-z]+$/,           // English only
  /^[ㄱ-ㅎ]+$/,           // consonants only
  /^[ㅏ-ㅣ]+$/,           // vowels only
  /^[0-9]+$/,              // numbers only
  /^[^A-Za-z0-9가-힣ㄱ-ㅎㅏ-ㅣ]+$/, // special characters only
];

export function isValidKoreanWord(word: string): boolean {
  if (!word) return false;
  return !INVALID_PATTERNS.some((pattern) => pattern.test(word));
}
