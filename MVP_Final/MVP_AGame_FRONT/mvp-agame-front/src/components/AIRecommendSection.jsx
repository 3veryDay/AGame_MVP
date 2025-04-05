import React from "react";
import { useNavigate } from "react-router-dom";
import AI_MODES from "../constants/AI_MODES.jsx";

const AIRecommendSection = ({ token, deviceId }) => {
  const navigate = useNavigate();

  return (
    <div className="ai-recommendations">
      <h2 className="music-subtitle">🧠 AI 추천 모드</h2>
      <div className="ai-button-group">
        {Object.entries(AI_MODES).map(([key, mode]) => {
          const [p1, p2] = mode.playlists;
          return (
            <button
              key={key}
              className="music-button"
              onClick={() =>
                navigate("/Interval", {
                  state: {
                    token,
                    deviceId,
                    playlist1: p1,
                    playlist2: p2,
                    time1: p1.time,
                    time2: p2.time,
                  },
                })
              }
            >
              {mode.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AIRecommendSection;
