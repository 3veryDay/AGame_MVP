// Interval.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import IntervalSaveLoadModal from "../components/IntervalSaveLoadModal";
import PlaylistSearchModal from "../components/PlaylistSearchModal";
import PlaylistSelect_noplay from "../components/PlaylistSelect_noplay";
import './styles/Interval.css';

const Interval = () => {
  const location = useLocation();
  const token = location.state?.token;
  const deviceId = location.state?.deviceId || window.spotifyDeviceId;

  const [playlist1, setPlaylist1] = useState(null);
  const [playlist2, setPlaylist2] = useState(null);
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [time1, setTime1] = useState(30);
  const [time2, setTime2] = useState(30);
  const [shuffle1, setShuffle1] = useState(false);
  const [shuffle2, setShuffle2] = useState(false);
  const [shufflePlayed1, setShufflePlayed1] = useState(false);
  const [shufflePlayed2, setShufflePlayed2] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [playingIndex, setPlayingIndex] = useState(0);
  const timeoutRef = useRef(null);
  const positionStore = useRef({});
  const [showSearchModalFor, setShowSearchModalFor] = useState(null);
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(null);

  useEffect(() => {
    const state = location.state;
    if (state?.playlist1 && state?.playlist2) {
      setPlaylist1(state.playlist1.uri);
      setName1(state.playlist1.name);
      setPlaylist2(state.playlist2.uri);
      setName2(state.playlist2.name);
      if (state.time1) setTime1(state.time1);
      if (state.time2) setTime2(state.time2);
    }
  }, []);

  useEffect(() => {
    if (!token || deviceId) return;
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Music Lab Web Player',
        getOAuthToken: cb => cb(token),
        volume: 0.5,
      });
      player.addListener('ready', ({ device_id }) => {
        console.log("🎧 SDK Ready! Device ID:", device_id);
        window.spotifyDeviceId = device_id;
      });
      player.connect();
    };
  }, [token, deviceId]);

  const saveCurrentPosition = async () => {
    try {
      const res = await fetch("https://api.spotify.com/v1/me/player", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 204) return;
      const data = await res.json();
      const contextUri = data.context?.uri;
      const trackUri = data.item?.uri;
      const position = data.progress_ms;
      if (contextUri && trackUri && position != null) {
        positionStore.current[contextUri] = { trackUri, position };
      }
    } catch (err) {
      console.error("현재 재생 위치 저장 실패:", err);
    }
  };

  const playPlaylist = async (playlist, shouldShuffle, hasShuffled, markShuffled) => {
     try {
    // ✅ 무조건 context 반복 (플레이리스트 전체 반복)
    await fetch(
      `https://api.spotify.com/v1/me/player/repeat?state=context&device_id=${deviceId}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
      if (shouldShuffle && !hasShuffled) {
        await fetch(
          `https://api.spotify.com/v1/me/player/shuffle?state=true&device_id=${deviceId}`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        markShuffled(true);
      }
  
      const resumeKey = playlist.uri || playlist.name; // 둘 중 하나는 있음
      const resumeData = positionStore.current[resumeKey];
      const offsetUri = resumeData?.trackUri || null;
      const resumeMs = resumeData?.position || 0;
  
      const body = playlist.uriList
        ? {
            uris: playlist.uriList,
            offset: offsetUri ? { uri: offsetUri } : undefined,
            position_ms: resumeMs,
          }
        : {
            context_uri: playlist.uri,
            offset: offsetUri ? { uri: offsetUri } : undefined,
            position_ms: resumeMs,
          };
  
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      console.error("재생 실패:", err);
    }
  };
  

  const playLoop = async (index) => {
    const uri = index === 0 ? playlist1 : playlist2;
    const duration = index === 0 ? time1 : time2;
    const shuffle = index === 0 ? shuffle1 : shuffle2;
    const shuffled = index === 0 ? shufflePlayed1 : shufflePlayed2;
    const setShuffled = index === 0 ? setShufflePlayed1 : setShufflePlayed2;
    if (!uri) return;
    await playPlaylist(uri, shuffle, shuffled, setShuffled);
    setPlayingIndex(index);
    timeoutRef.current = setTimeout(async () => {
      await saveCurrentPosition();
      playLoop(index === 0 ? 1 : 0);
    }, duration * 1000);
  };

  const startAlternating = () => {
    if (!playlist1 || !playlist2 || !time1 || !time2) {
      alert("두 플레이리스트와 시간을 모두 입력해주세요");
      return;
    }
    setShufflePlayed1(false);
    setShufflePlayed2(false);
    setIsRunning(true);
    playLoop(0);
  };

  const stopAlternating = () => {
    clearTimeout(timeoutRef.current);
    setIsRunning(false);
  };

  const handleSavePreset = (name) => {
    const newPreset = {
      id: Date.now(),
      name,
      playlist1: { uri: playlist1, name: name1, image: image1 },
      playlist2: { uri: playlist2, name: name2, image: image2 },
      time1,
      time2,
      shuffle1,
      shuffle2,
    };
    const existing = JSON.parse(localStorage.getItem("intervalPresets") || "[]");
    const updated = [...existing, newPreset];
    localStorage.setItem("intervalPresets", JSON.stringify(updated));
    alert(`"${name}" 저장 완료!`);
  };

  const handleLoadPreset = (item) => {
    console.log("👉 불러온 item 구조:", item);
    if (!item.playlist1 || !item.playlist2) {
      alert("❌ 이 프리셋은 2세트용이 아닙니다.");
      return;
    }
    setPlaylist1(item.playlist1.uri);
    setName1(item.playlist1.name);
    setImage1(item.playlist1.image);
    setPlaylist2(item.playlist2.uri);
    setName2(item.playlist2.name);
    setImage2(item.playlist2.image);
    setTime1(item.time1);
    setTime2(item.time2);
    setShuffle1(item.shuffle1);
    setShuffle2(item.shuffle2);
  };

  return (
    <div className="music-lab-container">
      <h1 className="music-lab-title">⏱️ IntervalLab - 자동 전환 모드</h1>
      <div className="music-lab-playlists-row">
        {[1, 2].map((n) => (
          <div key={n} className="music-lab-block">
            <h3 className="playlist-block-title">🎵 Playlist {n}</h3>
            <div className="playlist-time-input">
              <label>재생 시간</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="number"
                  min="0"
                  value={Math.floor((n === 1 ? time1 : time2) / 60)}
                  onChange={(e) => {
                    const minutes = Number(e.target.value);
                    const seconds = (n === 1 ? time1 : time2) % 60;
                    n === 1 ? setTime1(minutes * 60 + seconds) : setTime2(minutes * 60 + seconds);
                  }}
                />
                <span>분</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={(n === 1 ? time1 : time2) % 60}
                  onChange={(e) => {
                    const seconds = Number(e.target.value);
                    const minutes = Math.floor((n === 1 ? time1 : time2) / 60);
                    n === 1 ? setTime1(minutes * 60 + seconds) : setTime2(minutes * 60 + seconds);
                  }}
                />
                <span>초</span>
              </div>
            </div>
            <div className="playlist-shuffle-toggle">
              <input
                type="checkbox"
                id={`shuffle${n}`}
                checked={n === 1 ? shuffle1 : shuffle2}
                onChange={(e) => n === 1 ? setShuffle1(e.target.checked) : setShuffle2(e.target.checked)}
              />
              <label htmlFor={`shuffle${n}`}>셔플 재생</label>
            </div>
            <div className="playlist-cover-wrapper">
              {(n === 1 ? image1 : image2) ? (
                <img
                  src={n === 1 ? image1 : image2}
                  alt={`playlist${n} cover`}
                  className="playlist-cover"
                />
              ) : (
                <div className="playlist-cover placeholder">
                  <span className="placeholder-text">앨범 없음</span>
                </div>
              )}
            </div>
            {(n === 1 ? name1 : name2) && (
              <p className="playlist-selected-name">Playlist: {n === 1 ? name1 : name2}</p>
            )}
            <button className="search-playlist-button" onClick={() => setShowSearchModalFor(`playlist${n}`)}>
              🔍 다른 플레이리스트 검색
            </button>
            <PlaylistSelect_noplay
              token={token}
              onSelect={(uri, name, image) => {
                if (n === 1) {
                  setPlaylist1(uri); setName1(name); setImage1(image);
                } else {
                  setPlaylist2(uri); setName2(name); setImage2(image);
                }
              }}
            />
          </div>
        ))}
      </div>
      <div className="music-lab-controls">
        {!isRunning ? (
          <button className="music-lab-button start" onClick={startAlternating}>▶️ 전환 시작</button>
        ) : (
          <button className="music-lab-button stop" onClick={stopAlternating}>⏹️ 중단</button>
        )}
      </div>
      {isRunning && (
        <p className="music-lab-status">
          🔁 현재 재생 중: Playlist {playingIndex + 1} ({playingIndex === 0 ? time1 : time2}초)
        </p>
      )}
      <div className="interval-save-buttons">
        <button className="modal-save-btn" onClick={() => setShowSaveLoadModal("save")}>💾 저장</button>
        <button className="modal-save-btn" onClick={() => setShowSaveLoadModal("load")}>📂 불러오기</button>
      </div>
      {showSearchModalFor && (
        <PlaylistSearchModal
          token={token}
          onSelect={(uri, name, image) => {
            if (showSearchModalFor === 'playlist1') {
              setPlaylist1(uri); setName1(name); setImage1(image);
            } else {
              setPlaylist2(uri); setName2(name); setImage2(image);
            }
            setShowSearchModalFor(null);
          }}
          onClose={() => setShowSearchModalFor(null)}
        />
      )}
      {showSaveLoadModal && (
        <IntervalSaveLoadModal
          mode={showSaveLoadModal}
          onClose={() => setShowSaveLoadModal(null)}
          onSave={handleSavePreset}
          onLoad={handleLoadPreset}
          presetKey="intervalPresets"
          expectedType="2set"
        />
      )}
    </div>
  );
};

export default Interval;
