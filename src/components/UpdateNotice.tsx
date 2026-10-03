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
    <aside className="retro-alert" role="status" aria-label="업데이트 안내">
      <div className="retro-alert-titlebar">
        UPDATE
        <button type="button" className="update-notice-close" onClick={dismiss} aria-label="닫기">
          X
        </button>
      </div>
      <div className="retro-alert-body update-notice-body">
        {UPDATE_NOTICE_LINES.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </aside>
  );
}
