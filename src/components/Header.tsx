export default function Header({ onOpenNotices }: { onOpenNotices: () => void }) {
  return (
    <header className="site-header flex items-center justify-center">
      <a href="/" className="site-logo" aria-label="무한맨틀 홈">
        <span className="site-logo-badge">GAME</span>
        <h1 className="site-logo-title">
          <span>무한</span>맨틀
        </h1>
      </a>
      <button type="button" className="notices-entry" onClick={onOpenNotices}>
        NOTICES
      </button>
    </header>
  );
}
