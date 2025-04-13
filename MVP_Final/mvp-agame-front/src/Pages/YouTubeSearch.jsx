import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/YouTubeSearch.css";

const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

const YouTubeSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [intervals, setIntervals] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("ytIntervals") || "[]");
    setIntervals(saved);
    setSelectedVideos(new Array(saved.length).fill(null));
  }, []);

  const searchVideos = async (isLoadMore = false) => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await axios.get("/api/youtube/search", {
        params: {
          q: query,
          pageToken: isLoadMore ? nextPageToken : undefined,
        },
      });
  
      const searchItems = res.data.search.items;
      const details = res.data.details.items;
  
      // 🎯 여기서 searchItems와 duration 정보 매칭해서 필요한 데이터 가공
  
      setVideos((prev) => [...prev, ...searchItems]);
      setNextPageToken(res.data.search.nextPageToken);
  
    } catch (err) {
      console.error("YouTube API 에러:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (isoDuration) => {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "알 수 없음";
    const [, h, m, s] = match.map((v) => parseInt(v || 0));
    const totalSeconds = h * 3600 + m * 60 + s;
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const selectVideoForInterval = (intervalIndex, video) => {
    const updated = [...selectedVideos];
    updated[intervalIndex] = video;
    setSelectedVideos(updated);
    localStorage.setItem("ytSelections", JSON.stringify(updated));
  };

  const goToPlayer = () => {
    const allSelected = selectedVideos.every((v) => v !== null);
    if (!allSelected) {
      alert("모든 패턴에 대해 영상을 선택해주세요.");
      return;
    }
    navigate("/youtubePlayer");
  };

  return (
    <div className="yt-search-container">
      <h1 className="yt-title">📺 YouTube 영상 선택 (패턴별)</h1>

      <div className="yt-search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색어 입력"
        />
        <button onClick={() => searchVideos()}>검색</button>
      </div>

      <div className="yt-interval-selector">
        {intervals.map((interval, idx) => (
          <div key={idx} className="yt-interval-box">
            <h3>⏱ 패턴 {idx + 1} - {interval.minutes}분 {interval.seconds}초</h3>
            {selectedVideos[idx] ? (
              <div className="yt-selected-video">
                <img src={selectedVideos[idx].thumbnail} alt="썸네일" />
                <p>{selectedVideos[idx].title}</p>
              </div>
            ) : (
              <p className="yt-placeholder">아래에서 영상 선택하세요</p>
            )}
          </div>
        ))}

      <div className="yt-video-grid">
        {videos.map((video) => (
          <div key={video.videoId} className="yt-video-card">
            <img src={video.thumbnail} alt={video.title} />
            <div className="yt-info">
              <h4>{video.title}</h4>
              <p>{video.channel}</p>
              <p className="yt-duration">⏱ {formatDuration(video.duration)}</p>
            </div>
            <div className="yt-select-buttons">
              {intervals.map((_, idx) => (
                <button key={idx} onClick={() => selectVideoForInterval(idx, video)}>
                  패턴 {idx + 1} 선택
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {nextPageToken && (
        <div className="yt-load-more">
          <button onClick={() => searchVideos(true)}>더 보기</button>
        </div>
      )}

      {loading && <p className="yt-loading">로딩 중...</p>}
    </div>
    <div className="yt-floating-button">
          <button onClick={goToPlayer}>▶️ 인터벌 시작하기</button>
        </div>
      </div>

  );
};

export default YouTubeSearch;