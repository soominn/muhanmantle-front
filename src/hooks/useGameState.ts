import { useState, useEffect, useRef } from "react";
import { fetchFrontConfig } from "../api/config";
import {
  fetchGameSession,
  fetchShoutRanking,
  postGameGiveUp,
  postGameGuess,
  postGameReset,
} from "../api/gameSession";
import { isValidKoreanWord } from "../utils/inputValidation";
import { sortResults } from "../utils/sorting";
import type { GuessResult, RevealedAnswer, ShoutRankingItem } from "../types/game";

export type ShoutRankingStatus = "idle" | "loading" | "ready" | "error";

export interface GameState {
  answerId: number | null;
  guesses: GuessResult[];
  isCorrect: boolean;
  correctAttemptCount: number;
  inputValue: string;
  hasError: boolean;
  isDuplicate: boolean;
  isSessionReady: boolean;
  isGivingUp: boolean;
  revealedAnswer: RevealedAnswer | null;
  shoutRanking: ShoutRankingItem[];
  shoutRankingStatus: ShoutRankingStatus;
  loadShoutRanking: () => void;
  setInputValue: (v: string) => void;
  submitGuess: () => Promise<void>;
  giveUp: () => Promise<void>;
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
  const [isGivingUp, setIsGivingUp] = useState(false);
  const [revealedAnswer, setRevealedAnswer] = useState<RevealedAnswer | null>(null);
  const [shoutRanking, setShoutRanking] = useState<ShoutRankingItem[]>([]);
  const [shoutRankingStatus, setShoutRankingStatus] = useState<ShoutRankingStatus>("idle");

  const isSubmitting = useRef(false);
  const isGivingUpRef = useRef(false);
  const guessesRef = useRef<GuessResult[]>(guesses);
  const gameBaseRef = useRef(gameBase);
  const shoutWantedRef = useRef(false);
  const shoutStatusRef = useRef<ShoutRankingStatus>("idle");

  useEffect(() => {
    guessesRef.current = guesses;
  }, [guesses]);
  useEffect(() => {
    gameBaseRef.current = gameBase;
  }, [gameBase]);

  function applySession(data: {
    answer_id: number | null;
    guesses?: GuessResult[];
    is_correct: boolean;
    correct_attempt_count?: number;
  }) {
    setAnswerId(data.answer_id ?? null);
    const sorted = sortResults(data.guesses ?? []);
    setGuesses(sorted);
    guessesRef.current = sorted;
    setIsCorrect(data.is_correct);
    setCorrectAttemptCount(data.correct_attempt_count ?? 0);
  }

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
        applySession(session);
        setIsSessionReady(true);
      })
      .catch((err) => {
        if (!cancelled) console.error("초기화 실패:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loadShoutRanking = () => {
    shoutWantedRef.current = true;
    const base = gameBaseRef.current;
    if (!base) return;
    if (shoutStatusRef.current === "loading" || shoutStatusRef.current === "ready") return;

    shoutStatusRef.current = "loading";
    setShoutRankingStatus("loading");
    fetchShoutRanking(base)
      .then((data) => {
        const items = [...(data.items ?? [])].sort((a, b) => b.count - a.count);
        setShoutRanking(items);
        shoutStatusRef.current = "ready";
        setShoutRankingStatus("ready");
      })
      .catch((err) => {
        console.error("외침 순위 조회 실패:", err);
        setShoutRanking([]);
        shoutStatusRef.current = "error";
        setShoutRankingStatus("error");
      });
  };

  useEffect(() => {
    if (gameBase && shoutWantedRef.current) loadShoutRanking();
  }, [gameBase]);

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

      applySession(data);

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

  const giveUp = async (): Promise<void> => {
    const base = gameBaseRef.current;
    if (!base || !isSessionReady || isGivingUpRef.current) return;

    isGivingUpRef.current = true;
    setIsGivingUp(true);
    try {
      const data = await postGameGiveUp(base);
      applySession(data);
      const revealed = data.revealed_answer;
      if (
        revealed &&
        typeof revealed.number === "number" &&
        typeof revealed.word === "string"
      ) {
        setRevealedAnswer({ number: revealed.number, word: revealed.word });
      }
    } catch (err) {
      console.error("포기 실패:", err);
    } finally {
      isGivingUpRef.current = false;
      setIsGivingUp(false);
    }
  };

  const resetGame = async (): Promise<void> => {
    const base = gameBaseRef.current;
    if (!base || !isSessionReady) return;

    try {
      const data = await postGameReset(base);
      applySession(data);
      setRevealedAnswer(null);
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
    isGivingUp,
    revealedAnswer,
    shoutRanking,
    shoutRankingStatus,
    loadShoutRanking,
    setInputValue,
    submitGuess,
    giveUp,
    resetGame,
  };
}
