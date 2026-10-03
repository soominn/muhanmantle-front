/** Paragraphs split on blank lines. A single newline is a line break. No other markdown. */
export function noticeParagraphs(markdown: string): string[][] {
  const normalized = markdown.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) return [];
  return normalized.split(/\n{2,}/).map((block) => block.split("\n"));
}
