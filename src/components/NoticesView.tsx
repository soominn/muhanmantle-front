import { useEffect, useState } from "react";
import { fetchFrontConfig } from "../api/config";
import { fetchNotices, noticesUrl } from "../api/notices";
import type { NoticeItem } from "../types/notice";
import { noticeParagraphs } from "../utils/noticeBody";

type NoticesStatus = "loading" | "ready" | "error";

function NoticeBody({ markdown }: { markdown: string }) {
  const paragraphs = noticeParagraphs(markdown);
  if (paragraphs.length === 0) return null;
  return (
    <>
      {paragraphs.map((lines, index) => (
        <p key={index}>
          {lines.map((line, lineIndex) => (
            <span key={lineIndex}>
              {lineIndex > 0 && <br />}
              {line}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}

export default function NoticesView({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<NoticesStatus>("loading");
  const [items, setItems] = useState<NoticeItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchFrontConfig()
      .then((config) => fetchNotices(noticesUrl(config.gameApiBase)))
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = items.find((item) => item.slug === selectedSlug) ?? null;

  function goBack() {
    if (selected) {
      setSelectedSlug(null);
      return;
    }
    onClose();
  }

  return (
    <section className="retro-alert" aria-label="공지">
      <div className="retro-alert-titlebar">NOTICES</div>
      <div className="retro-alert-body notice-body">
        {selected ? (
          <>
            <h2 className="notice-detail-heading">{selected.title}</h2>
            <NoticeBody markdown={selected.body} />
          </>
        ) : status === "loading" ? (
          <p className="notice-empty">불러오는 중…</p>
        ) : status === "error" ? (
          <p className="notice-empty">공지를 불러오지 못했습니다.</p>
        ) : items.length === 0 ? (
          <p className="notice-empty">공지가 없습니다.</p>
        ) : (
          <ul className="notice-list">
            {items.map((item) => (
              <li key={item.slug}>
                <button type="button" onClick={() => setSelectedSlug(item.slug)}>
                  <span className="notice-title">{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="btn-pixel btn-pixel-outline notice-back" onClick={goBack}>
          BACK
        </button>
      </div>
    </section>
  );
}
