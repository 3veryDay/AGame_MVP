import React, { useEffect, useRef, useState } from "react";
import "./styles/YouTubePlayerPage.css";

const YouTubePlayerPage = () => {
  const [intervals, setIntervals] = useState([]);
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [completedCounts, setCompletedCounts] = useState([]);
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    const savedIntervals = JSON.parse(localStorage.getItem("ytIntervals") || "[]");
    const savedVideos = JSON.parse(localStorage.getItem("ytSelections") || "[]");
    setIntervals(savedIntervals);
    setVideos(savedVideos);
    setCompletedCounts(new Array(savedIntervals.length).fill(0));
  }, []);

  useEffect(() => {
    if (intervals.length === 0 || videos.length === 0) return;
    loadYouTubeScript();
  }, [intervals, videos]);

  const loadYouTubeScript = () => {
    if (window.YT) {
      initializePlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      window.onYouTubeIframeAPIReady = initializePlayer;
      document.body.appendChild(tag);
    }
  };

  const initializePlayer = () => {
    const savedTime = parseFloat(localStorage.getItem(`ytTime${currentIndex}`) || "0");
    const currentVideo = videos[currentIndex];
    const currentInterval = intervals[currentIndex];
    const totalSeconds = currentInterval.minutes * 60 + currentInterval.seconds;
    setTimeLeft(totalSeconds);

    playerRef.current = new window.YT.Player(playerContainerRef.current, {
      height: "360",
      width: "640",
      videoId: currentVideo.videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        mute: 1,
      },
      events: {
        onReady: (event) => {
          event.target.seekTo(savedTime, true);
          event.target.playVideo();
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            startCountdown(totalSeconds);
          }
        },
      },
    });
  };

  const startCountdown = (duration) => {
    clearInterval(countdownRef.current);
    let remaining = duration;
    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
      setTotalElapsed((prev) => prev + 1);
      try {
        const currentTime = playerRef.current.getCurrentTime();
        localStorage.setItem(`ytTime${currentIndex}`, currentTime);
      } catch (e) {}
      remaining--;
      if (remaining <= 0) {
        clearInterval(countdownRef.current);
        const updatedCounts = [...completedCounts];
        updatedCounts[currentIndex] += 1;
        setCompletedCounts(updatedCounts);
        const nextIndex = (currentIndex + 1) % videos.length;
        setCurrentIndex(nextIndex);
      }
    }, 1000);
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      clearInterval(countdownRef.current);
    } else {
      playerRef.current.playVideo();
      startCountdown(timeLeft);
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.destroy();
    }
    if (intervals.length && videos.length) {
      initializePlayer();
    }
  }, [currentIndex]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  if (!videos[currentIndex]) return <p className="player-loading">로딩 중...</p>;

  const currentVideo = videos[currentIndex];

  return (
    <div className="player-container">
      <div className="video-frame-wrapper">
        <div id="player" ref={playerContainerRef}></div>
      </div>
      <div className="player-info">
        <h1 className="player-title">🎬 AGame - 유튜브 인터벌 플레이어</h1>
        <h2>🎵 {currentVideo.title}</h2>
        <p>⏱ 남은 시간: {formatTime(timeLeft)}</p>
        <p>패턴 {currentIndex + 1} / {intervals.length}</p>
        <p>⏳ 누적 시간: {formatTime(totalElapsed)}</p>
        <ul>
          {intervals.map((interval, idx) => (
            <li key={idx}>패턴 {idx + 1}: {completedCounts[idx]}회 실행</li>
          ))}
        </ul>
        <button className="player-toggle-btn" onClick={togglePlay}>
          {isPlaying ? "⏸ 일시정지" : "▶️ 다시 재생"}
        </button>
      </div>
    </div>
  );
};

export default YouTubePlayerPage;