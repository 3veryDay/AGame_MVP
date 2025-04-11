// ✅ 추천곡 기반 자동 "다음 곡 재생" 기능 구현 예시 (아티스트 기반 추천 방식 - artistId 예외 처리 추가)
import React, { useEffect, useState } from "react";

const MusicLabRecommendations = ({ token, deviceId, artistId }) => {
  const [recommendedQueue, setRecommendedQueue] = useState([]);
  const [currentUri, setCurrentUri] = useState(null);

  // ✅ 현재 아티스트 기반으로 추천곡 받아오기
  const fetchRecommendedTracks = async () => {
    if (!artistId) {
      console.warn("❗ artistId가 정의되지 않았습니다. 추천을 건너뜁니다.");
      return;
    }

    try {
      // 1. 관련 아티스트 받아오기
      const relatedRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}/related-artists`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!relatedRes.ok) {
        const text = await relatedRes.text();
        console.error("❌ 관련 아티스트 API 실패:", relatedRes.status, text);
        return;
      }

      const relatedData = await relatedRes.json();
      const relatedArtists = relatedData.artists.slice(0, 3);

      // 2. 각 아티스트의 top track 받아오기
      const tracks = [];
      for (const artist of relatedArtists) {
        const topRes = await fetch(`https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=KR`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!topRes.ok) continue;
        const topData = await topRes.json();
        tracks.push(...topData.tracks.slice(0, 2));
      }

      setRecommendedQueue(tracks);
      console.log("🎧 추천곡 큐 업데이트:", tracks.map(t => t.name).join(", "));
    } catch (err) {
      console.error("추천곡 불러오기 실패:", err);
    }
  };

  // ✅ 다음 곡 재생
  const playNextTrack = async () => {
    if (recommendedQueue.length === 0) {
      console.warn("추천 큐가 비었습니다. 다시 가져올게요.");
      await fetchRecommendedTracks();
      return;
    }

    const nextTrack = recommendedQueue[0];
    const nextUri = `spotify:track:${nextTrack.id}`;
    setCurrentUri(nextUri);
    setRecommendedQueue((prev) => prev.slice(1));

    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [nextUri] }),
      });
      console.log("▶️ 다음 추천 곡 재생됨:", nextTrack.name);
    } catch (err) {
      console.error("🚨 재생 실패:", err);
    }
  };

  useEffect(() => {
    if (artistId) {
      fetchRecommendedTracks();
    }
  }, [artistId]);

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold">🔁 아티스트 기반 추천 곡</h2>
      {!artistId && (
        <p className="text-sm text-red-600">❗ artistId가 없어서 추천을 불러올 수 없습니다.</p>
      )}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={playNextTrack}
        disabled={!artistId}
      >
        ▶️ 다음 추천 곡 재생
      </button>
      {currentUri && (
        <p className="mt-2 text-sm text-gray-700">
          현재 재생 URI: {currentUri}
        </p>
      )}
    </div>
  );
};

export default MusicLabRecommendations;