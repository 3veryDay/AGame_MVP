import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './styles/Dashboard.css';
const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [token, setToken] = useState(null); // ✅ 토큰 상태 추가
  const [isLoading, setIsLoading] = useState(true);
  const [isPremiumError, setIsPremiumError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("code")) {
      window.history.replaceState({}, "", "/dashboard");
    }

    const fetchUserInfo = async () => {
      try {
        const tokenRes = await fetch("http://localhost:8080/spotify/token", {
          method: "GET",
          credentials: "include",
        });
        const tokenData = await tokenRes.json();

        if (!tokenRes.ok || !tokenData.accessToken) {
          throw new Error("No access token found.");
        }

        setToken(tokenData.accessToken); // ✅ 여기서 저장

        const res = await fetch("http://localhost:8080/spotify/me", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 403) {
            setIsPremiumError(true);
          } else {
            throw new Error(data.error || "Unknown error");
          }
          return;
        }

        setUserInfo(data);
      } catch (err) {
        console.error("사용자 정보 가져오기 실패:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/spotify/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/spotify_login");
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
  };

  const goToMenu = () => {
    navigate("/menu");
  };

  const goToInterval = () => {
    if (!token) {
      console.warn("토큰이 아직 준비되지 않았습니다.");
      return;
    }
    navigate("/Interval", {
      state: {
        token: token,
      }
    });
  };

  const premiumSignupUrl = "https://www.spotify.com/premium/";

  return (
    <div className="dashboard-container">
    <div className="dashboard-content">
      <h1 className="dashboard-title">🎶 대시보드</h1>
  
      {isLoading ? (
        <p className="dashboard-loading">불러오는 중...</p>
      ) : userInfo && !isPremiumError ? (
        <>
          <p className="dashboard-welcome">환영합니다! 🎧</p>
          <button onClick={goToMenu} className="dashboard-music-button">
            MENU
          </button>
        </>
      ) : isPremiumError ? (
        <div className="dashboard-error-box">
          <p>⚠️ 이 기능을 사용하려면 Spotify Premium 계정이 필요합니다.</p>
          <a href={premiumSignupUrl} target="_blank" rel="noopener noreferrer" className="dashboard-link">
            여기서 가입하기 →
          </a>
        </div>
      ) : (
        <p className="dashboard-error">유저 정보를 불러올 수 없습니다.</p>
      )}
    </div>
  
    <button onClick={handleLogout} className="dashboard-logout-button">로그아웃</button>
  </div>
  );
};

export default Dashboard;
