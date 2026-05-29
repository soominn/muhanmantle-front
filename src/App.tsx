import React from "react";
import type { KeyboardEvent } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Table from "./components/Table";
import { useGameState } from "./hooks/useGameState";

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
    setInputValue,
    submitGuess,
    resetGame,
  } = useGameState();

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
      void resetGame();
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4">
      <Header />
      <div className="flex flex-col items-center text-center">
        <main className="main-width px-0 md:px-3">
          <div className="retro-alert" role="alert">
            <div className="retro-alert-titlebar">INFO</div>
            <div className="retro-alert-body">
              무한맨틀은{" "}
              <a
                href="https://semantle-ko.newsjel.ly/"
                target="_blank"
                rel="noopener noreferrer"
              >
                꼬맨틀
              </a>
              의 무한 버전입니다. 단어를 입력해 정답을 맞춰보세요.
            </div>
          </div>

          <p className="game-heading">
            {!isSessionReady ? (
              <>세션을 불러오는 중…</>
            ) : answerId == null ? (
              <>등록된 정답 단어가 없습니다.</>
            ) : (
              <>
                <span className="num-highlight">{Number(answerId).toLocaleString()}</span>
                &nbsp;번째 정답 단어를 맞춰보세요&nbsp;🚀
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
              disabled={!isSessionReady || answerId == null || isCorrect}
            />
            <button
              className="btn-pixel btn-pixel-primary"
              type="button"
              onClick={() => void submitGuess()}
              disabled={!isSessionReady || answerId == null || isCorrect}
            >
              맞추기
            </button>
          </div>

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

          <button className="btn-pixel btn-pixel-outline mt-3" onClick={handleGiveUp}>
            포기하기
          </button>
        </main>
      </div>
      <Footer />
    </div>
  );
}
