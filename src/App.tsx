import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";
import Table from "./components/Table.tsx";

export default function App() {
    // 상태 변수들 선언
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [answer, setAnswer] = useState<number | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [answerCount, setAnswerCount] = useState<number>(() => {
        const stored = localStorage.getItem("answerCount");
        return (stored) ? Number(stored) : 0;
    });
    const [isError, setIsError] = useState(false);
    const [resultArr, setResultArr] = useState<(string | number)[][]>(() => {
        const storedResults = localStorage.getItem("resultArr");
        return storedResults ? JSON.parse(storedResults) : [];
    });
    const [isCorrect, setIsCorrect] = useState<boolean>(() => {
        const stored = localStorage.getItem("isCorrect");
        return stored === "true";
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    // API 호출 여부를 추적하기 위한 ref
    const isFetched = useRef(false);
    const [apiUrl, setApiUrl] = useState<string>("");

    // 컴포넌트가 마운트될 때 API 설정 및 전체 단어 수를 불러옴
    useEffect(() => {
        const shouldForceReload = !window.location.search.includes('v=');
        if (shouldForceReload) {
            const newUrl = window.location.pathname + window.location.search + (window.location.search ? '&' : '?') + 'v=' + Date.now();
            window.location.replace(newUrl);
        }

        if (isFetched.current) return;
        isFetched.current = true;
    
        getConfig().then((url) => {
            setApiUrl(url);
            fetchTotalCount(url);
        });
    }, []);

    // API를 통해 전체 단어 개수를 가져오는 함수
    const fetchTotalCount = async (url) => {
        try {
            const response = await fetch(`${url}/total/`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            const data = await response.json();
            if (data?.total_count) {
                setTotalCount(data.total_count);
                // 전체 단어 수를 바탕으로 랜덤 정답 선택
                selectRandomAnswer(data.total_count, false);
            }
        } catch (error) {
            console.error("API 호출 실패:", error);
        }
    };

    // 랜덤 정답을 선택하는 함수 (이전에 선택된 단어를 고려)
    const selectRandomAnswer = (max: number, isReset) => {
        if (max <= 0) return;

        const prevAnwser = localStorage.getItem("answer");
        const prevAnswers = JSON.parse(localStorage.getItem("answerArr") || "[]");

        if (prevAnwser && !isReset) {
            // 기존에 저장된 정답이 있으면 그대로 사용
            setAnswer(Number(prevAnwser));
            return;
        }

        let randomAnswer;
        let attempts = 0;

        do {
            randomAnswer = Math.floor(Math.random() * max) + 1;
            attempts++;

            if (attempts > max) {
                // 모든 숫자가 이미 선택됐으면 배열 초기화
                console.warn("모든 값이 선택되어 배열을 초기화합니다.");
                localStorage.removeItem("answerArr");
                break;
            }
        } while (prevAnswers.includes(randomAnswer));

        const updatedAnswerArr = [...prevAnswers, randomAnswer];

        setAnswer(randomAnswer);
        localStorage.setItem("answer", String(randomAnswer));
        localStorage.setItem("answerArr", JSON.stringify(updatedAnswerArr));
    };

    // 입력값 변경 이벤트 핸들러
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    // API 호출 중복 방지를 위한 ref
    const isProcessing = useRef(false);

    // 버튼 클릭 시 API 호출 및 결과 처리
    const handleButtonClick = async () => {
        if (isProcessing.current) return;
        isProcessing.current = true;


    
        const trimmedInput = inputValue.trim();
        const trimmedAnswer = answer ? String(answer).trim() : "";

        if (!trimmedInput || !trimmedAnswer) {
            console.error("오류: answer 또는 input 값이 유효하지 않습니다.", { answer, inputValue });
            isProcessing.current = false;
            return;
        }

        // 정규식 검사
        const isOnlyEnglish = /^[A-Za-z]+$/.test(trimmedInput);
        const isSingleKoreanChar = /^[가-힣]$/.test(trimmedInput);
        const isOnlyConsonant = /^[ㄱ-ㅎ]+$/.test(trimmedInput);
        const isOnlyVowel = /^[ㅏ-ㅣ]+$/.test(trimmedInput);
        const isOnlyNumber = /^[0-9]+$/.test(trimmedInput);
        const isOnlySpecialChar = /^[^A-Za-z0-9가-힣ㄱ-ㅎㅏ-ㅣ]+$/.test(trimmedInput);

        if (isOnlyEnglish || isSingleKoreanChar || isOnlyConsonant || isOnlyVowel || isOnlyNumber || isOnlySpecialChar) {
            setIsError(true);
            setInputValue("");
            isProcessing.current = false;
            return;
        }
    
        try {
            const response = await fetch(
                `${apiUrl}/${encodeURIComponent(trimmedAnswer)}/${encodeURIComponent(trimmedInput)}/`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                }
            );
    
            if (!response.ok) {
                throw new Error(`서버 응답 오류: ${response.status}`);
            }
    
            const data = await response.json();
    
            // API에서 오류가 발생하면 처리
            if (data.error) {
                setIsError(true);
                setInputValue("");
                console.error("API 에러:", data.error);
                return;
            }
    
            setIsError(false);
    
            // 정답과의 유사도가 100%이면 정답 처리
            if (data.similarity_percentage === 100) {
                const nowAnswerCount = resultArr.length + 1;

                setIsCorrect(true);
                setAnswerCount(nowAnswerCount);
                localStorage.setItem("isCorrect", "true");
                localStorage.setItem("answerCount", nowAnswerCount.toString());
            }
    
            // 결과 배열에 추가할 새로운 결과 생성
            const newResult: (string | number)[] = [
                resultArr.length + 1,
                data.input_word,
                data.similarity_percentage,
                data.rank,
            ];
    
            updateResults(newResult);
            setInputValue("");
            setAnswerCount(prevCount => prevCount + 1);
        } catch (error) {
            setIsError(true);
            setInputValue("");
            console.error("API 호출 실패:", error);
        } finally {
            isProcessing.current = false;
        }
    };

    // 엔터 키 입력 시 버튼 클릭과 동일한 동작 수행
    const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleButtonClick();
        }
    };

    // 결과 배열 업데이트: 중복 제출 검사 및 정렬 수행
    const updateResults = (newResult: (string | number)[]) => {
        setResultArr((prev) => {
            if (prev.some((arr) => arr[1] === newResult[1])) {
                // 이미 제출한 단어가 있으면 제출 처리 상태 변경
                setIsSubmitted(true);
                return prev;
            }
    
            setIsSubmitted(false);
    
            const updatedArr = [...prev, newResult];
            const sortedArr = sortByThirdElement(updatedArr);
            // localStorage에 결과 배열 저장
            localStorage.setItem("resultArr", JSON.stringify(sortedArr));
            return sortedArr;
        });
    };

    // 결과 배열을 세 번째 요소(유사도)에 따라 정렬하는 함수
    const sortByThirdElement = (arr: (string | number)[][]) => {
        if (arr.length === 0) return arr;

        // 첫번째 요소(번호)가 가장 큰 배열 선택
        const highestFirstElementArr = arr.reduce((maxArr, currentArr) =>
            currentArr[0] > maxArr[0] ? currentArr : maxArr
        );

        const filteredArr = arr.filter((el) => el !== highestFirstElementArr);
        filteredArr.sort((a, b) => (b[2] as number) - (a[2] as number));

        return [highestFirstElementArr, ...filteredArr];
    };

    // 게임을 리셋하는 함수
    const resetGame = () => {
        if (totalCount !== null) {
            selectRandomAnswer(totalCount, true);
        }
        setResultArr([]);
        localStorage.removeItem("resultArr");
        setIsCorrect(false);
        localStorage.setItem("isCorrect", "false");
        setAnswerCount(0);
        localStorage.removeItem("answerCount");
    };

    return (
        <div className="container">
            <Header />
            <div className="d-flex flex-column align-items-center text-center">
                <main className="px-3 w-full md:w-3/4 lg:w-1/2 main-width">
                    <div className="alert alert-success" role="alert">
                        무한맨틀은 <a className="alert-link" href="https://semantle-ko.newsjel.ly/" target="_blank" rel="noopener noreferrer">꼬맨틀</a> 의 무한 버전입니다.
                    </div>

                    <h3 className="py-3">
                        <span className="text-success">{Number(answer).toLocaleString()}</span> 번째 단어를 맞춰보세요 🚀
                    </h3>

                    <div className="d-flex justify-content-center mb-4">
                        <input
                            className={`form-control me-2 w-50 ${(isError || isSubmitted) ? "is-invalid" : ""}`}
                            placeholder={isError ? "사용할 수 없는 단어입니다." : isSubmitted ? "이미 제출한 단어입니다." : "단어를 입력하세요."}
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyUp={handleKeyUp}
                            disabled={isCorrect}
                        />
                        <button className="btn btn-outline-success" type="button" onClick={handleButtonClick} disabled={isCorrect}>
                            맞추기
                        </button>
                    </div>

                    {isCorrect && (
                        <div className="alert alert-success mx-auto text-center mb-4 w-full md:w-3/4 lg:w-1/2 alert-width">
                            <h4 className="text-start alert-heading font-bold">정답입니다 🚀</h4>
                            <p className="text-start">
                                <span className="font-bold">{Number(answerCount).toLocaleString()}</span> 번째 도전에서 정답을 맞추셨습니다!
                            </p>
                            <hr />
                            <button className="btn btn-success" onClick={resetGame}>
                                다음 문제
                            </button>
                        </div>
                    )}

                    {/* 결과를 보여주는 테이블 컴포넌트 */}
                    <Table resultArr={resultArr} />

                    <button className="btn btn-outline-danger" onClick={() => {
                        if (window.confirm("포기하시겠습니까?")) {
                            resetGame();
                        }
                    }}>포기하기</button>
                </main>
            </div>
            <Footer />
        </div>
    );
}

// config.json 파일에서 API_URL 가져오기 위한 함수
async function getConfig() {
    const response = await fetch("/config.json");
    const config = await response.json();
    return config.API_URL;
}
