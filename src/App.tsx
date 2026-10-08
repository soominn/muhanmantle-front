import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Table from "./components/Table";
import NoticesView from "./components/NoticesView";
import { useGameState } from "./hooks/useGameState";
import type { ShoutRankingItem } from "./types/game";
import type { ShoutRankingStatus } from "./hooks/useGameState";
import { revealedAnswerParts } from "./utils/revealedAnswer";

const SHOUT_RANKING_NOTE =
  "모든 퍼즐에서 사람들이 제출한 단어를 센 순위입니다. 같은 사람이 같은 단어를 여러 번 쳐도 한 번만 셉니다.";

const GIVE_UP_SCROLL_MARGIN_PX = 20;

function scrollGiveUpSectionIntoView(section: HTMLElement) {
  const header = document.querySelector(".site-header");
  if (header instanceof HTMLElement) {
    const position = getComputedStyle(header).position;
    if (position === "sticky" || position === "fixed") {
      const offset = header.getBoundingClientRect().height + GIVE_UP_SCROLL_MARGIN_PX;
      section.style.scrollMarginTop = `${offset}px`;
    }
  }
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  section.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
}

function ShoutRanking({
  items,
  status,
  onOpen,
}: {
  items: ShoutRankingItem[];
  status: ShoutRankingStatus;
  onOpen: () => void;
}) {
  const [open, setOpen] = useState(false);
  const showList = open && status === "ready" && items.length > 0;

  function toggle() {
    if (!open) onOpen();
    setOpen((current) => !current);
  }

  return (
    <section className="retro-alert mt-6" aria-label="외친 단어">
      <button
        type="button"
        className="retro-alert-titlebar shout-toggle"
        aria-expanded={open}
        aria-controls="shout-ranking-panel"
        onClick={toggle}
      >
        SHOUTS
        <span className="shout-toggle-mark" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div id="shout-ranking-panel" className="retro-alert-body shout-ranking">
          <p className="shout-note">{SHOUT_RANKING_NOTE}</p>
          {showList ? (
            <ol className="shout-list">
              {items.map((item, index) => (
                <li key={`${item.word}-${index}`}>
                  <span className="shout-pos">{index + 1}</span>
                  <span className="shout-word">{item.word}</span>
                  <span className="shout-count">{Number(item.count).toLocaleString("ko-KR")}</span>
                </li>
              ))}
            </ol>
          ) : status === "error" ? (
            <p className="shout-empty">순위를 불러오지 못했습니다.</p>
          ) : status === "ready" ? (
            <p className="shout-empty">아직 외친 단어가 없습니다.</p>
          ) : (
            <p className="shout-empty">불러오는 중…</p>
          )}
        </div>
      )}
    </section>
  );
}

export default function App() {
  const {
    answerId,
    guesses,
    isCorrect,
    correctAttemptCount,
    inputValue,
    hasError,
    isDuplicate,
    isSessionReady,
    isGivingUp,
    revealedAnswer,
    shoutRanking,
    shoutRankingStatus,
    loadShoutRanking,
    setInputValue,
    submitGuess,
    giveUp,
    resetGame,
  } = useGameState();
  const [screen, setScreen] = useState<"game" | "notices">("game");
  const giveUpSectionRef = useRef<HTMLDivElement>(null);
  // Set only when the user confirms 포기하기, so a restored reveal does not scroll.
  const giveUpScrollArmed = useRef(false);

  useEffect(() => {
    if (!giveUpScrollArmed.current || isGivingUp) return;
    const section = giveUpSectionRef.current;
    if (!section) {
      giveUpScrollArmed.current = false;
      return;
    }
    giveUpScrollArmed.current = false;
    scrollGiveUpSectionIntoView(section);
  }, [revealedAnswer, isGivingUp]);

  const placeholder = hasError
    ? "사용할 수 없는 단어입니다."
    : isDuplicate
      ? "이미 제출한 단어입니다."
      : "단어를 입력하세요.";

  function handleKeyUp(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      submitGuess();
    }
  }

  function handleGiveUp() {
    if (window.confirm("포기하시겠습니까?")) {
      giveUpScrollArmed.current = true;
      void giveUp();
    }
  }

  const answerRevealed =
    revealedAnswer != null && revealedAnswer.number === answerId;
  const revealedParts = revealedAnswer
    ? revealedAnswerParts(revealedAnswer.number, revealedAnswer.word)
    : null;
  const inputLocked =
    !isSessionReady || answerId == null || isCorrect || answerRevealed;

  return (
    <div className="mx-auto max-w-6xl px-4">
      <Header screen={screen} onNavigate={setScreen} />
      <div className="flex w-full min-w-0 flex-col items-center text-center">
        <main className="main-width min-w-0 px-0 md:px-3">
          {screen === "notices" ? (
            <NoticesView />
          ) : (
          <>
          <div className="retro-alert" role="alert">
            <div className="retro-alert-titlebar">INFO</div>
            <div className="retro-alert-body info-copy">
              무한맨틀은{" "}
              <a
                href="https://semantle-ko.newsjel.ly/"
                target="_blank"
                rel="noopener noreferrer"
              >
                꼬맨틀
              </a>
              의 무한 버전입니다.{" "}
              <span className="phone-break" />
              단어를 입력해 정답을 맞춰보세요.
            </div>
          </div>

          <p className="game-heading">
            {!isSessionReady ? (
              <>세션을 불러오는 중…</>
            ) : answerId == null ? (
              <>등록된 정답 단어가 없습니다.</>
            ) : (
              <>
                <span className="num-highlight">{Number(answerId).toLocaleString("ko-KR")}</span>
                &nbsp;번째 정답 단어를{" "}
                <span className="phone-break" />
                <span className="keep-word">맞춰보세요</span>&nbsp;🚀
              </>
            )}
          </p>

          <div className="pixel-form">
            <input
              className="pixel-input"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyUp={handleKeyUp}
              disabled={inputLocked}
            />
            <button
              className="btn-pixel btn-pixel-primary"
              type="button"
              onClick={() => void submitGuess()}
              disabled={inputLocked}
            >
              맞추기
            </button>
          </div>

          {revealedAnswer && (
            <div
              ref={giveUpSectionRef}
              className="retro-alert alert-width give-up-result mx-auto mb-4"
              role="status"
            >
              <div className="retro-alert-titlebar">GIVE UP</div>
              <div className="retro-alert-body">
                <p className="revealed-answer">
                  {revealedParts?.before}<span className="revealed-answer-word">{revealedParts?.word}</span>
                </p>
                {answerRevealed && (
                  <button
                    type="button"
                    className="btn-pixel btn-pixel-outline retro-success-next"
                    onClick={() => void resetGame()}
                  >
                    다음 문제
                  </button>
                )}
              </div>
            </div>
          )}

          {isCorrect && (
            <div className="retro-success alert-width mx-auto mb-4">
              <div className="retro-success-titlebar">CORRECT!</div>
              <div className="retro-success-body">
                <h4 className="retro-success-heading">정답입니다 🚀</h4>
                <p className="text-left">
                  <strong>{Number(correctAttemptCount).toLocaleString()}</strong>{" "}
                  번째 도전에서 정답을 맞추셨습니다!
                </p>
                <hr />
                <button
                  type="button"
                  className="btn-pixel btn-pixel-success retro-success-next"
                  onClick={() => void resetGame()}
                >
                  다음 문제
                </button>
              </div>
            </div>
          )}

          <Table guesses={guesses} />

          <ShoutRanking
            items={shoutRanking}
            status={shoutRankingStatus}
            onOpen={loadShoutRanking}
          />

          <button
            type="button"
            className="btn-pixel btn-pixel-outline mt-3"
            onClick={handleGiveUp}
            disabled={!isSessionReady || answerId == null || isGivingUp || answerRevealed}
          >
            포기하기
          </button>
          </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
