import React, { useState } from "react";
import {
  UPDATE_NOTICE_LINES,
  hasSeenUpdateNotice,
  markUpdateNoticeSeen,
} from "../utils/updateNotice";

export default function UpdateNotice() {
  const [open, setOpen] = useState(() => !hasSeenUpdateNotice());

  if (!open) return null;

  function dismiss() {
    markUpdateNoticeSeen();
    setOpen(false);
  }

  return (
    <aside className="update-notice" role="status" aria-label="업데이트 안내">
      <ul className="update-notice-list">
        {UPDATE_NOTICE_LINES.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <button type="button" className="btn-pixel btn-pixel-outline update-notice-close" onClick={dismiss}>
        닫기
      </button>
    </aside>
  );
}
