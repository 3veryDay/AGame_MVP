import React, { useEffect } from 'react';
import './styles/Login.css';
const Login = () => {
  useEffect(() => {
    const checkPremiumAndRedirect = async () => {
      try {
        const tokenRes = await fetch(`${process.env.REACT_APP_API_BASE}/api/spotify/token`, {
          credentials: "include",
        });
        const { accessToken } = await tokenRes.json();
  
        const profileRes = await fetch(`${process.env.REACT_APP_API_BASE}/api/spotify/profile`, {
          credentials: "include",
        });
        const profile = await profileRes.json();
  
        if (profile.product === "premium") {
          window.location.href = "/menu"; // ✅ 프리미엄이면 바로 이동
        } else {
          alert("Premium 계정이 아닙니다!");
          window.location.href = "/";
        }
      } catch (err) {
        console.error("사용자 확인 실패:", err);
        window.location.href = "/";
      }
    };
  
    // URL에 code가 있을 때만 실행 (로그인 콜백 시점)
    const url = new URL(window.location.href);
    if (url.searchParams.get("code")) {
      checkPremiumAndRedirect();
    }
  }, []);

  
  const handleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_BASE}/api/spotify/login`;
  };

  return (
    <div className="spotify-container">
  <h1 className="spotify-title">🎵 Spotify 계정 연결</h1>
  <button className="spotify-button" onClick={handleLogin}>
    Login with Spotify
  </button>
</div>
  );
};

export default Login;
