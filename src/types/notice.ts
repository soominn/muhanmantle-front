/** GET /api/notices — public list, newest first. body is markdown text. */
export interface NoticeItem {
  slug: string;
  title: string;
  date: string;
  body: string;
}

export interface NoticeListResponse {
  items: NoticeItem[];
}
