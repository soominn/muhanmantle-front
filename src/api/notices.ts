import type { NoticeItem, NoticeListResponse } from "../types/notice";

export function noticesUrl(gameApiBase: string): string {
  const suffix = "/api/game";
  if (gameApiBase.endsWith(suffix)) {
    return `${gameApiBase.slice(0, -suffix.length)}/api/notices`;
  }
  return "/api/notices";
}

function asNotice(value: unknown): NoticeItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<NoticeItem>;
  if (typeof item.slug !== "string" || typeof item.title !== "string") return null;
  return {
    slug: item.slug,
    title: item.title,
    date: typeof item.date === "string" ? item.date : "",
    body: typeof item.body === "string" ? item.body : "",
  };
}

/** Newest first. Equal dates keep the response order. */
export function sortNoticesNewestFirst(items: NoticeItem[]): NoticeItem[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      if (a.item.date === b.item.date) return a.index - b.index;
      return a.item.date < b.item.date ? 1 : -1;
    })
    .map(({ item }) => item);
}

export async function fetchNotices(url: string): Promise<NoticeListResponse> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    credentials: "omit",
  });
  if (!response.ok) {
    throw new Error(`notices ${response.status}`);
  }
  const data = (await response.json()) as Partial<NoticeListResponse>;
  const items = Array.isArray(data.items)
    ? data.items.map(asNotice).filter((item): item is NoticeItem => item != null)
    : [];
  return { items: sortNoticesNewestFirst(items) };
}
