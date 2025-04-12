import React, { useState } from "react";

interface TableProps {
    resultArr: (string | number)[][];
}

export default function Table({ resultArr }: TableProps) {
    const [showMore, setShowMore] = useState(false);

    const toggleRows = () => {
        setShowMore(!showMore);
    };

    return (
        <div className="table-responsive mx-auto">
            <table className="table table-hover table-bordered text-center rounded-3 shadow-sm">
                <thead>
                    <tr>
                        <th style={{ width: "10%" }}>#</th>
                        <th style={{ width: "50%" }}>단어</th>
                        <th style={{ width: "20%" }}>유사도</th>
                        <th style={{ width: "20%" }}>순위</th>
                    </tr>
                </thead>
                <tbody>
                    {resultArr.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center text-secondary">
                                제출한 단어가 없습니다.
                            </td>
                        </tr>
                    ) : (
                        resultArr.map((row, index) =>
                            (showMore || index < 5) && (
                                <tr key={`${row[0]}-${index}`} className={index === 0 ? "table-secondary" : ""}>
                                    <td>{row[0]}</td>
                                    <td>{row[1]}</td>
                                    <td>{row[2]}</td>
                                    <td>
                                        <span className={`badge ${
                                            row[3] === '정답!'
                                                ? "rainbow-animation"
                                                : Number(row[3]) >= 1 && Number(row[3]) <= 10
                                                    ? "bg-success"
                                                    : Number(row[3]) >= 11 && Number(row[3]) <= 100
                                                        ? "bg-success opacity-50"
                                                        : "bg-light text-secondary"
                                        }`}>
                                            {row[3]}
                                        </span>
                                    </td>
                                </tr>
                            )
                        )
                    )}
                </tbody>
            </table>
            {resultArr.length > 5 && (
                <button className="btn btn-outline-success mt-2 mb-2" onClick={toggleRows}>
                    {showMore ? "접기" : "더보기"}
                </button>
            )}
        </div>
    );
}
