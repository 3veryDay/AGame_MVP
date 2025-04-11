// Interval3.jsx
import React, { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import IntervalSaveLoadModal from "../components/IntervalSaveLoadModal";
import PlaylistSearchModal from "../components/PlaylistSearchModal";
import PlaylistSelect_noplay from "../components/PlaylistSelect_noplay";
import "./styles/Interval.css";

const Interval3 = () => {
  const location = useLocation();
  const token = location.state?.token;
  const deviceId = location.state?.deviceId || window.spotifyDeviceId;

  const [playlists, setPlaylists] = useState([
    { uri: null, name: "", image: "", time: 30, shuffle: false, shuffled: false },
    { uri: null, name: "", image: "", time: 30, shuffle: false, shuffled: false },
    { uri: null, name: "", image: "", time: 30, shuffle: false, shuffled: false },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [playingIndex, setPlayingIndex] = useState(0);
  const timeoutRef = useRef(null);
  const positionStore = useRef({});
  const [showSearchModalFor, setShowSearchModalFor] = useState(null);
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(null);

  const setPlaylistData = (index, key, value) => {
    setPlaylists(prev => {
      const updated = [...prev];
      updated[index][key] = value;
      return updated;
    });
  };

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

  const playPlaylist = async (p, index) => {
    try {
      if (p.shuffle && !p.shuffled) {
        await fetch(
          `https://api.spotify.com/v1/me/player/shuffle?state=true&device_id=${deviceId}`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPlaylistData(index, "shuffled", true);
      }

      const resumeData = positionStore.current[p.uri];
      const offsetUri = resumeData?.trackUri || null;
      const resumeMs = resumeData?.position || 0;

      const body = {
        context_uri: p.uri,
        position_ms: resumeMs,
      };
      if (offsetUri) {
        body.offset = { uri: offsetUri };
      }

      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
    } catch (err) {
      console.error("재생 실패:", err);
    }
  };

  const playLoop = async (index) => {
    const current = playlists[index];
    if (!current.uri) return;

    await playPlaylist(current, index);
    setPlayingIndex(index);

    timeoutRef.current = setTimeout(async () => {
      await saveCurrentPosition();
      playLoop((index + 1) % 3);
    }, current.time * 1000);
  };

  const startAlternating = () => {
    if (playlists.some(p => !p.uri || !p.time)) {
      alert("세 개의 플레이리스트와 시간을 모두 입력해주세요");
      return;
    }
    setPlaylists(prev => prev.map(p => ({ ...p, shuffled: false })));
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
      playlists,
    };
    const existing = JSON.parse(localStorage.getItem("intervalPresets3") || "[]");
    const updated = [...existing, newPreset];
    localStorage.setItem("intervalPresets3", JSON.stringify(updated));
    alert(`"${name}" 저장 완료!`);
  };

  const handleLoadPreset = (item) => {
    if (!item.playlists || !Array.isArray(item.playlists)) {
      alert("🚫 이 프리셋은 3세트용이 아닙니다.");
      return;
    }
    setPlaylists(item.playlists);
  };

  return (
    <div className="music-lab-container">
      <h1 className="music-lab-title">⏱️ IntervalLab - 3 Set 모드</h1>

      <div className="music-lab-playlists-row">
        {playlists.map((p, index) => (
          <div className="music-lab-block" key={index}>
            <h3 className="playlist-block-title">🎵 Playlist {index + 1}</h3>

            <div className="playlist-time-input">
              <label>재생 시간</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="number"
                  min="0"
                  value={Math.floor(p.time / 60)}
                  onChange={(e) => {
                    const minutes = Number(e.target.value);
                    const seconds = p.time % 60;
                    setPlaylistData(index, "time", minutes * 60 + seconds);
                  }}
                />
                <span>분</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={p.time % 60}
                  onChange={(e) => {
                    const seconds = Number(e.target.value);
                    const minutes = Math.floor(p.time / 60);
                    setPlaylistData(index, "time", minutes * 60 + seconds);
                  }}
                />
                <span>초</span>
              </div>
            </div>

            <div className="playlist-shuffle-toggle">
              <input
                type="checkbox"
                checked={p.shuffle}
                onChange={(e) => setPlaylistData(index, "shuffle", e.target.checked)}
              />
              <label>셔플 재생</label>
            </div>

            <div className="playlist-cover-wrapper">
              {p.image ? (
                <img src={p.image} alt={`playlist${index + 1} cover`} className="playlist-cover" />
              ) : (
                <div className="playlist-cover placeholder">
                  <span className="placeholder-text">앨범 없음</span>
                </div>
              )}
            </div>

            {p.name && <p className="playlist-selected-name">Playlist: {p.name}</p>}

            <button
              className="search-playlist-button"
              onClick={() => setShowSearchModalFor(index)}
            >
              🔍 다른 플레이리스트 검색
            </button>

            <PlaylistSelect_noplay
              token={token}
              onSelect={(uri, name, image) => {
                setPlaylistData(index, "uri", uri);
                setPlaylistData(index, "name", name);
                setPlaylistData(index, "image", image);
              }}
            />
          </div>
        ))}
      </div>

      <div className="music-lab-controls">
        {!isRunning ? (
          <button className="music-lab-button start" onClick={startAlternating}>
            ▶️ 전환 시작
          </button>
        ) : (
          <button className="music-lab-button stop" onClick={stopAlternating}>
            ⏹️ 중단
          </button>
        )}
      </div>

      {isRunning && (
        <p className="music-lab-status">
          🔁 현재 재생 중: Playlist {playingIndex + 1} ({playlists[playingIndex].time}초)
        </p>
      )}

      <div className="interval-save-buttons">
        <button className="modal-save-btn" onClick={() => setShowSaveLoadModal("save")}>💾 저장</button>
        <button className="modal-save-btn" onClick={() => setShowSaveLoadModal("load")}>📂 불러오기</button>
      </div>

      {showSearchModalFor !== null && (
        <PlaylistSearchModal
          token={token}
          onSelect={(uri, name, image) => {
            setPlaylistData(showSearchModalFor, "uri", uri);
            setPlaylistData(showSearchModalFor, "name", name);
            setPlaylistData(showSearchModalFor, "image", image);
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
          presetKey="intervalPresets3"
          expectedType="3set"
        />
      )}
    </div>
  );
};

export default Interval3;