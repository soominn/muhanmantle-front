import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";
import Table from "./components/Table.tsx";

export default function App() {
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [answer, setAnswer] = useState<number | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [answerCount, setAnswerCount] = useState<number>(0);
    const [isError, setIsError] = useState(false);
    const [resultArr, setResultArr] = useState<(string | number)[][]>(() => { // 사용자가 입력했던 단어들
        const storedResults = localStorage.getItem("resultArr");
        return storedResults ? JSON.parse(storedResults) : [];
    });
    const [isCorrect, setIsCorrect] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const isFetched = useRef(false);
    const [apiUrl, setApiUrl] = useState<string>("");

    useEffect(() => {
        if (isFetched.current) return;
        isFetched.current = true;
    
        getConfig().then((url) => {
            setApiUrl(url);
            fetchTotalCount(url);
        });
    }, []);
    

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
                selectRandomAnswer(data.total_count, false);
            }
        } catch (error) {
            console.error("API 호출 실패:", error);
        }
    };

    const selectRandomAnswer = (max: number, isReset) => {
        if (max <= 0) return;

        setIsCorrect(false);
        setAnswerCount(0);

        const prevAnwser = localStorage.getItem("answer");
        const prevAnswers = JSON.parse(localStorage.getItem("answerArr") || "[]");

        if (prevAnwser && !isReset) {
            setAnswer(Number(prevAnwser));
            return;
        }

        let randomAnswer;
        let attempts = 0;

        do {
            randomAnswer = Math.floor(Math.random() * max) + 1;
            attempts++;

            if (attempts > max) {
                console.warn("모든 값이 선택됨! 배열 초기화");
                localStorage.removeItem("answerArr");
                break;
            }
        } while (prevAnswers.includes(randomAnswer));

        const updatedAnswerArr = [...prevAnswers, randomAnswer];

        setAnswer(randomAnswer);
        localStorage.setItem("answer", String(randomAnswer));
        localStorage.setItem("answerArr", JSON.stringify(updatedAnswerArr));
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const isProcessing = useRef(false);

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
    
            if (data.error) {
                setIsError(true);
                setInputValue("");
                console.error("API 에러:", data.error);
                return;
            }
    
            setIsError(false);
    
            if (data.similarity_percentage === 100) {
                setIsCorrect(true);
                setAnswerCount(resultArr.length);
            }
    
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

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleButtonClick();
        }
    };

    const updateResults = (newResult: (string | number)[]) => {
        setResultArr((prev) => {
            if (prev.some((arr) => arr[1] === newResult[1])) {
                setIsSubmitted(true);
                return prev;
            }
    
            setIsSubmitted(false);
    
            const updatedArr = [...prev, newResult];
            localStorage.setItem("resultArr", JSON.stringify(updatedArr));
            return sortByThirdElement(updatedArr);
        });
    };
    

    const sortByThirdElement = (arr: (string | number)[][]) => {
        if (arr.length === 0) return arr;

        const highestFirstElementArr = arr.reduce((maxArr, currentArr) =>
            currentArr[0] > maxArr[0] ? currentArr : maxArr
        );

        const filteredArr = arr.filter((el) => el !== highestFirstElementArr);
        filteredArr.sort((a, b) => (b[2] as number) - (a[2] as number));

        return [highestFirstElementArr, ...filteredArr];
    };

    const resetGame = () => {
        if (totalCount !== null) {
            selectRandomAnswer(totalCount, true);
        }
        setResultArr([]);
        localStorage.removeItem("resultArr");
        setIsCorrect(false);
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
                        <span className="text-success">{Number(answer).toLocaleString()}</span> 번째 정답 단어를 맞춰보세요 🚀
                    </h3>

                    <div className="d-flex justify-content-center mb-4">
                        <input
                            className={`form-control me-2 w-50 ${(isError || isSubmitted) ? "is-invalid" : ""}`}
                            placeholder={isError ? "없는 단어입니다." : isSubmitted ? "이미 제출한 단어입니다." : "단어를 입력하세요."}
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
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

async function getConfig() {
    const response = await fetch("/config.json");
    const config = await response.json();
    return config.API_URL;
}