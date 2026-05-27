import React, { useState } from "react";
import type { GuessResult } from "../types/game";
import { guessCosineSimilarity } from "../utils/sorting";

interface TableProps {
  guesses: GuessResult[];
}

const VISIBLE_ROWS = 5;

/** Map cosine [-1, 1] → bar width 0–100%. */
function cosineToBarWidth(cos: number): string {
  const pct = ((cos + 1) / 2) * 100;
  return `${Math.max(0, Math.min(100, pct))}%`;
}

/** 코사인 ×100 (예: 0.1162 → 11.62). */
function formatSimilarityDisplay(cos: number): string {
  return (cos * 100).toFixed(2);
}

function rankBadgeClass(rank: number | string): string {
  if (rank === "정답!") return "pixel-badge-green rainbow-animation";
  if (typeof rank === "number" && rank <= 10) return "pixel-badge-green";
  if (typeof rank === "number" && rank <= 100) return "pixel-badge-gray";
  return "pixel-badge-none";
}

export default function Table({ guesses }: TableProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleRows = showAll ? guesses : guesses.slice(0, VISIBLE_ROWS);

  return (
    <div className="pixel-table-wrap">
      <div className="table-responsive">
        <table className="pixel-table w-full">
          <colgroup>
            <col className="col-num" />
            <col className="col-word" />
            <col className="col-sim" />
            <col className="col-rank" />
          </colgroup>
          <thead>
            <tr>
              <th>#</th>
              <th>단어</th>
              <th>유사도</th>
              <th>순위</th>
            </tr>
          </thead>
          <tbody>
            {guesses.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[#666666]">
                  제출한 단어가 없습니다.
                </td>
              </tr>
            ) : (
              visibleRows.map((guess, index) => {
                const cos = guessCosineSimilarity(guess);
                return (
                <tr key={`${guess.attemptNumber}-${index}`}>
                  <td>
                    <span className="rank-num">{guess.attemptNumber}</span>
                  </td>
                  <td className="word-cell">{guess.word}</td>
                  <td>
                    <div className="sim-progress-wrap">
                      <div className="sim-bar">
                        <div
                          className="sim-bar-fill"
                          style={{ width: cosineToBarWidth(cos) }}
                        />
                      </div>
                      <span className="sim-pct" title="코사인 유사도 ×100">
                        {formatSimilarityDisplay(cos)}
                      </span>
                    </div>
                  </td>
                  <td className="rank-cell">
                    <span className={`pixel-badge ${rankBadgeClass(guess.rank)}`}>
                      {guess.rank}
                    </span>
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
      {guesses.length > VISIBLE_ROWS && (
        <div className="toggle-wrap">
          <button
            className="btn-pixel btn-pixel-outline"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? "접기" : "더보기"}
          </button>
        </div>
      )}
    </div>
  );
}
