import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite 설정
// - base를 상대경로("./")로 둬야 Capacitor 웹뷰(file:// 또는 capacitor://)에서 에셋 경로가 깨지지 않음
// - server.host=true로 두면 실기기에서 dev 서버 라이브 리로드 접속 가능
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    host: true,
    port: 5173,
  },
});
