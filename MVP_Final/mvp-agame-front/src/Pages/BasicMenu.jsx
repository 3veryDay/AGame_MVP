import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import AIRecommendSection from '../components/AIRecommendSection';
import './styles/BasicMenu.css';

const BasicMenu = () => {
  const [token, setToken] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [user, setUser] =useState(null);
  const [isPremium, setIsPremium] = useState(false);


  const [searchType, setSearchType] = useState("track");
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);

  const navigate = useNavigate();


  

  // 1. access_token 받아오기
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/spotify/token`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        console.log("받은 token : ",data );
        setToken(data.accessToken)});
  }, []);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/spotify/profile`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        console.log("👤 사용자 정보 (백엔드 프록시 경유):", data);
        setUser(data);
        setIsPremium(data.product === "premium");
      })
      .catch(err => {
        console.error("😵 사용자 정보 불러오기 실패:", err);
      });
  }, []);
  

  // 3. SDK 초기화(premium 계정인 경우에만)
  useEffect(() => {
    if (!token || !isPremium) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'React Interval Player',
        getOAuthToken: cb => cb(token),
        volume: 0.5,
      });

      player.addListener('ready', ({ device_id }) => {
        console.log('Device ready:', device_id);
        setDeviceId(device_id);
      });

      player.connect();
    };
  }, [token, isPremium]);


  const getAvailableDevicesAndPlay = async (trackUri) => {
    try {
      const res = await fetch("https://api.spotify.com/v1/me/player/devices", {
        headers: {
          Authorization: `Bearer ${token}` , // 여기에 accessToken 변수 넣어줘
        },
      });
  
      const data = await res.json();
      console.log("🎧 Available Devices: ", data.devices);
  
      if (data.devices.length === 0) {
        alert("⚠️ 활성화된 Spotify 디바이스가 없어요! 앱을 열어두세요.");
        return;
      }
  
      const activeDevice = data.devices.find(d => d.is_active) || data.devices[0];
      const deviceId = activeDevice.id;
      
      // 재생 함수 호출
    playTrack(deviceId, trackUri);

  } catch (err) {
    console.error("🚨 디바이스 가져오기 실패: ", err);
  }
};
  // 4. 음악 재생
  const playTrack = (deviceId, trackUri) => {

    fetch(`${process.env.REACT_APP_API_BASE}/spotify/music/play`, {
      method: "PUT",
      credentials : "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device_id : deviceId,
        track_uri : trackUri,
      }),
    })
    .then(res => res.json())
    .then(data => {
      console.log("🎶 재생 성공 : ", data);

    })
    .catch(err => {
      console.log("🚨 재생 실패 : ", err)
    });
  };
  
// 검색
const handleSearch = () => {
  fetch(`${process.env.REACT_APP_API_BASE}/spotify/music/search?type=${searchType}&q=${encodeURIComponent(keyword)}`, {
    credentials : "include",
  })
  .then(res => res.json())
  .then(data => {
    console.log("검색 결과 : ", data);
    if (searchType == "track") setResults(data?.tracks?.items ?? []);
    else if (searchType == "album") setResults(data?.albums?.items ?? []);
    else if (searchType == "artist") setResults(data?.artists?.items ?? []);
  })
  .catch(err => console.error("검색 식패 : ", err))
}

const fetchTopTracks = () => {
  fetch(`${process.env.REACT_APP_API_BASE}/api/spotify/music/top-tracks`, {
    credentials: "include",
  })
    .then(res => res.json())
    .then(data => {
      console.log("🔥 내 인기 곡:", data);
      setResults(data?.items ?? []);
    })
    .catch(err => console.error("인기 곡 불러오기 실패:", err));
};

const fetchGlobalChart = () => {
  fetch("${process.env.REACT_APP_API_BASE}/spotify/music/global-chart", {
    credentials: "include",
  })
    .then(res => res.json())
    .then(data => {
      if (data?.error) {
        console.error("🔥 Spotify 에러 응답:", data.error);
        alert(`Spotify 오류: ${data.error.message} (code: ${data.error.status})`);
        return;
      }
    
      const items = Array.isArray(data?.items) ? data.items.map(i => i.track) : [];
      setResults(items);
    })
    
    .catch(err => console.error("글로벌 차트 실패:", err));
};
//제목, 키워드로 음악 찾기 
  const findTrack = () => {
    if (!deviceId || !token ) return;

    fetch( ``, {
      method : "PUT",
      credentials : "include",
      headers : {
        Authorization : `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body : JSON.stringify({
        uris:["spotify:track: ..."],
      }),
    });
  };

  //앨범명, 아티스트 명으로 앨범 찾기
  const findAlbum = () => {
    if (!deviceId || !token) return;

    fetch(``, {
      method : "GET",
      credentials : "include",
      headers : {
        Authorization : `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  };

  const findPopularTracks = () => {
    if (!deviceId || !token) return;

    fetch('', {
      method : "GET",
      credentials : "include",
      headerse : {
        Authorization : `Bearer ${token}`,
        "Content-Type":"application/json",
      },
    });
  };

  return (
    <div className="music-container">
  <h1 className="music-header">🎵 Music Lab Menu</h1>

  {!user && <p>로그인 정보를 불러오는 중...</p>}

  {user && !isPremium && (
    <p style={{ color: 'red' }}>🚫 Premium 계정이 아닙니다. 음악을 틀 수 없습니다!</p>
  )}

  {user && isPremium && (
    <>
<p className="user-greeting">
      안녕하세요, <strong>{user.display_name}</strong>님!  
      어떤 음악 루틴을 시작해볼까요?
    </p>
    <div className="music-controls">
        <button className="music-button" onClick={() => navigate("/Interval", { state: { token, deviceId } })}>
          ▶️ 2세트 인터벌 만들기
        </button>
        <button className="music-button" onClick={() => navigate("/Interval3", { state: { token, deviceId } })}>
          ➕ 3세트 인터벌 만들기
        </button>
      </div>
      <div className="ai-recommendations">
  <AIRecommendSection token={token} deviceId={deviceId} />
</div>


      {/* <div className="music-input-group">
        <input
          className="music-input"
          type="text"
          placeholder="검색어 입력"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select
          className="music-select"
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="track">곡</option>
          <option value="album">앨범</option>
          <option value="artist">아티스트</option>
        </select>
        <button className="music-button" onClick={handleSearch}>검색</button>
      </div>

      <ul className="music-results">
  {results.map((track) => (
    <li key={track.id}>
      {track.name} - {track.artists?.map(a => a.name).join(", ")}
    </li>
  ))}
</ul> */}
    </>
  )}
</div>

  );
  
};

export default BasicMenu;