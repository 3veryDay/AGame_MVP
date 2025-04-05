import React, { useEffect, useState } from "react";

const IntervalSaveLoadModal = ({
  mode,
  onClose,
  onSave,
  onLoad,
  presetKey = "intervalPresets",
  expectedType = "2set", // or "3set"
}) => {
  const [name, setName] = useState("");
  const [savedList, setSavedList] = useState([]);

  const loadPresets = () => {
    const stored = JSON.parse(localStorage.getItem(presetKey) || "[]");
    setSavedList(stored);
  };

  useEffect(() => {
    loadPresets();
  }, [presetKey]);

  const handleSave = () => {
    if (!name) return alert("이름을 입력해주세요");
    onSave(name);
    onClose();
  };

  const handleLoad = (item) => {
    console.log("불러온 프리셋:", item);

    // 유효성 검사: 세트 수 확인
    if (expectedType === "2set" && item.playlists) {
      alert("⚠️ 이 프리셋은 3세트용입니다. 2세트 페이지에서는 사용할 수 없습니다.");
      return;
    }
    if (expectedType === "3set" && (!item.playlists || !Array.isArray(item.playlists))) {
      alert("⚠️ 이 프리셋은 2세트용입니다. 3세트 페이지에서는 사용할 수 없습니다.");
      return;
    }

    onLoad(item);
    onClose();
  };

  const handleDelete = (id) => {
    const updated = savedList.filter((item) => item.id !== id);
    localStorage.setItem(presetKey, JSON.stringify(updated));
    loadPresets();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>✖</button>

        {mode === "save" ? (
          <>
            <h3>💾 인터벌 저장</h3>
            <input
              className="modal-save-Interval-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="인터벌 이름"
            />
            <button onClick={handleSave}>저장</button>
          </>
        ) : (
          <>
            <h3>📂 저장된 인터벌 불러오기</h3>
            {savedList.length === 0 && <p>저장된 프리셋이 없습니다.</p>}
            {savedList.map((item) => (
              <div
                key={item.id}
                className="modal-playlist-item"
                onClick={() => handleLoad(item)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 10px",
                  cursor: "pointer",
                  borderBottom: "1px solid #ccc",
                }}
              >
                <span>{item.name}</span>
                <button
                  className="delete-preset-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // 클릭 이벤트 버블링 방지
                    handleDelete(item.id);
                  }}
                >
                  🗑
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default IntervalSaveLoadModal;
