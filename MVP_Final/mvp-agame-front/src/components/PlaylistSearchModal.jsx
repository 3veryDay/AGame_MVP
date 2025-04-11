// components/PlaylistSearchModal.jsx
import React, { useState } from 'react';

const PlaylistSearchModal = ({ token, onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const search = async () => {
    if (!query) return;
    const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setResults(data.playlists.items);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="close-btn">✖</button>
        <h3>🔍 플레이리스트 검색</h3>
        <div className="modal-search-row">
  <input
    className="modal-playlist-search-input"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="검색어 입력"
  />
  <button onClick={search}>검색</button>
</div>
        <div>
        {results
  .filter((pl) => pl && pl.name) // null 거르기
  .map((pl) => {
    const imageUrl = pl.images?.[0]?.url || 'https://via.placeholder.com/60';
    return (
      <div
        key={pl.id}
        className="modal-playlist-item"
        onClick={() => {
          onSelect(pl.uri, pl.name, imageUrl);
          onClose();
        }}
      >
        <img src={imageUrl} alt="playlist cover" width={60} />
        <span>{pl.name}</span>
      </div>
    );
  })}

        </div>
      </div>
    </div>
  );
};

export default PlaylistSearchModal;
