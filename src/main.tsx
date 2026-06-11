import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 앱 진입점. #root에 React 트리를 마운트함.
const rootElement = document.getElementById("root");
if (!rootElement) {
  // 안전 처리: 루트 엘리먼트가 없으면 명확히 알림 (조용히 실패 방지)
  throw new Error("#root 엘리먼트를 찾을 수 없음. index.html을 확인하세요.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
