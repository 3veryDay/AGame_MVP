import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/PlatformSelect.css";

const PlatformSelect = () => {
  const navigate = useNavigate();

  const goToSpotify = () => {
    navigate("/spotifyLogin");
  };

  const goToYouTube = () => {
    navigate("/youtubeIntervalSetup");
  };

  return (
    <div className="platform-container">
      <h1 className="platform-title">🎵 AGame - 플랫폼 선택</h1>

      <div className="platform-button-group">
        <button onClick={goToSpotify} className="platform-btn spotify-btn">
          🎧 스포티파이로 시작하기
        </button>

        <button onClick={goToYouTube} className="platform-btn youtube-btn">
          📺 유튜브로 시작하기
        </button>
      </div>
    </div>
  );
};

export default PlatformSelect;