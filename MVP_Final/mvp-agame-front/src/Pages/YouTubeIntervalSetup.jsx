import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/YouTubeIntervalSetup.css";

const YouTubeIntervalSetup = () => {
  const navigate = useNavigate();
  const [patternCount, setPatternCount] = useState(2);
  const [patterns, setPatterns] = useState([
    { minutes: 0, seconds: 0 },
    { minutes: 0, seconds: 0 },
    { minutes: 0, seconds: 0 },
  ]);

  const handleTimeChange = (index, field, value) => {
    const updated = [...patterns];
    updated[index][field] = Number(value);
    setPatterns(updated);
  };

  const handleSubmit = () => {
    const selected = patterns.slice(0, patternCount);
    localStorage.setItem("ytIntervals", JSON.stringify(selected));
    navigate("/youtubeSearch");
  };

  return (
    <div className="interval-container">
      <h1 className="interval-title">⏱ 유튜브 인터벌 패턴 설정</h1>

      <div className="pattern-count">
        <label>패턴 개수 선택 (추천 2~3개): </label>
        <select
          value={patternCount}
          onChange={(e) => setPatternCount(Number(e.target.value))}
        >
          <option value={2}>2개</option>
          <option value={3}>3개</option>
        </select>
      </div>

      {patterns.slice(0, patternCount).map((pattern, idx) => (
        <div className="pattern-row" key={idx}>
          <h3>패턴 {idx + 1}</h3>
          <input
            type="number"
            min="0"
            placeholder="분"
            value={pattern.minutes}
            onChange={(e) => handleTimeChange(idx, "minutes", e.target.value)}
          />
          <span>분</span>
          <input
            type="number"
            min="0"
            max="59"
            placeholder="초"
            value={pattern.seconds}
            onChange={(e) => handleTimeChange(idx, "seconds", e.target.value)}
          />
          <span>초</span>
        </div>
      ))}

      <button className="next-btn" onClick={handleSubmit}>
        다음으로 →
      </button>
    </div>
  );
};

export default YouTubeIntervalSetup;
