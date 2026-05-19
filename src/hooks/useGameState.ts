import { useState, useEffect, useRef } from "react";
import { fetchFrontConfig } from "../api/config";
import {
  fetchGameSession,
  postGameGuess,
  postGameReset,
} from "../api/gameSession";
import { isValidKoreanWord } from "../utils/inputValidation";
import { sortResults } from "../utils/sorting";
import type { GuessResult } from "../types/game";

export interface GameState {
  answerId: number | null;
  guesses: GuessResult[];
  isCorrect: boolean;
  correctAttemptCount: number;
  inputValue: string;
  hasError: boolean;
  isDuplicate: boolean;
  isSessionReady: boolean;
  setInputValue: (v: string) => void;
  submitGuess: () => Promise<void>;
  resetGame: () => Promise<void>;
}

export function useGameState(): GameState {
  const [answerId, setAnswerId] = useState<number | null>(null);
  const [gameBase, setGameBase] = useState("");
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAttemptCount, setCorrectAttemptCount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);

  const isSubmitting = useRef(false);
  const guessesRef = useRef<GuessResult[]>(guesses);
  const gameBaseRef = useRef(gameBase);

  useEffect(() => {
    guessesRef.current = guesses;
  }, [guesses]);
  useEffect(() => {
    gameBaseRef.current = gameBase;
  }, [gameBase]);

  useEffect(() => {
    let cancelled = false;

    fetchFrontConfig()
      .then((cfg) => {
        const base = cfg.gameApiBase;
        if (cancelled) return;
        setGameBase(base);
        gameBaseRef.current = base;
        return fetchGameSession(base);
      })
      .then((session) => {
        if (cancelled || !session) return;
        setAnswerId(session.answer_id ?? null);
        const sorted = sortResults(session.guesses ?? []);
        setGuesses(sorted);
        guessesRef.current = sorted;
        setIsCorrect(session.is_correct);
        setCorrectAttemptCount(session.correct_attempt_count ?? 0);
        setIsSessionReady(true);
      })
      .catch((err) => {
        if (!cancelled) console.error("초기화 실패:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const submitGuess = async (): Promise<void> => {
    const base = gameBaseRef.current;
    if (isSubmitting.current || !base || !isSessionReady) return;

    const word = inputValue.trim();
    if (!word) return;

    if (!isValidKoreanWord(word)) {
      setHasError(true);
      setInputValue("");
      return;
    }

    isSubmitting.current = true;
    try {
      const data = await postGameGuess(base, word);
      setHasError(false);

      const sorted = sortResults(data.guesses ?? []);
      setGuesses(sorted);
      guessesRef.current = sorted;
      setAnswerId(data.answer_id ?? null);
      setIsCorrect(data.is_correct);
      setCorrectAttemptCount(data.correct_attempt_count ?? 0);

      if (data.duplicate) {
        setIsDuplicate(true);
        setInputValue("");
        return;
      }
      setIsDuplicate(false);

      setInputValue("");
    } catch (err) {
      setHasError(true);
      setInputValue("");
      console.error("제출 실패:", err);
    } finally {
      isSubmitting.current = false;
    }
  };

  const resetGame = async (): Promise<void> => {
    const base = gameBaseRef.current;
    if (!base || !isSessionReady) return;

    try {
      const data = await postGameReset(base);
      setAnswerId(data.answer_id ?? null);
      const emptySorted = sortResults(data.guesses ?? []);
      setGuesses(emptySorted);
      guessesRef.current = emptySorted;
      setIsCorrect(data.is_correct);
      setCorrectAttemptCount(data.correct_attempt_count ?? 0);
      setHasError(false);
      setIsDuplicate(false);
    } catch (err) {
      console.error("리셋 실패:", err);
    }
  };

  return {
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
  };
}
