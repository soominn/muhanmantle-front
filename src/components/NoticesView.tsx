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

export default function NoticesView() {
  const [status, setStatus] = useState<NoticesStatus>("loading");
  const [items, setItems] = useState<NoticeItem[]>([]);
  const [openSlugs, setOpenSlugs] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchFrontConfig()
      .then((config) => fetchNotices(noticesUrl(config.gameApiBase)))
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setOpenSlugs(data.items[0] ? [data.items[0].slug] : []);
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

  function toggle(slug: string) {
    setOpenSlugs((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  }

  return (
    <section className="retro-alert" aria-label="공지">
      <div className="retro-alert-titlebar">NOTICES</div>
      <div className="retro-alert-body notice-body">
        {status === "loading" ? (
          <p className="notice-empty">불러오는 중…</p>
        ) : status === "error" ? (
          <p className="notice-empty">공지를 불러오지 못했습니다.</p>
        ) : items.length === 0 ? (
          <p className="notice-empty">공지가 없습니다.</p>
        ) : (
          <ul className="notice-list">
            {items.map((item) => {
              const open = openSlugs.includes(item.slug);
              return (
                <li key={item.slug}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => toggle(item.slug)}
                  >
                    <span className="notice-title">{item.title}</span>
                    <span className="notice-mark" aria-hidden="true">
                      {open ? "−" : "+"}
                    </span>
                  </button>
                  {open && (
                    <div className="notice-panel">
                      <NoticeBody markdown={item.body} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
