type AppScreen = "game" | "notices";

export default function Header({
  screen,
  onNavigate,
}: {
  screen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}) {
  return (
    <header className="site-header">
      <a href="/" className="site-logo" aria-label="무한맨틀 홈">
        <span className="site-logo-badge">GAME</span>
        <h1 className="site-logo-title">
          <span>무한</span>맨틀
        </h1>
      </a>
      <nav className="site-menu" aria-label="메뉴">
        <button
          type="button"
          className={screen === "game" ? "is-active" : undefined}
          aria-current={screen === "game" ? "page" : undefined}
          onClick={() => onNavigate("game")}
        >
          게임
        </button>
        <button
          type="button"
          className={screen === "notices" ? "is-active" : undefined}
          aria-current={screen === "notices" ? "page" : undefined}
          onClick={() => onNavigate("notices")}
        >
          공지
        </button>
      </nav>
    </header>
  );
}
