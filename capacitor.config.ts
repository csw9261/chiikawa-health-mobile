import type { CapacitorConfig } from "@capacitor/cli";

// Capacitor 설정
// - appId: 안드로이드 패키지명. 개인용이라 임의 도메인 사용
// - webDir: Vite 빌드 산출물 폴더. cap sync가 이 폴더를 네이티브로 복사함
const config: CapacitorConfig = {
  appId: "com.chikawa.health",
  appName: "먼작귀 헬스",
  webDir: "dist",
  android: {
    // 디버그 빌드에서 http(dev 서버) 허용 — 라이브 리로드 개발용
    allowMixedContent: true,
  },
};

export default config;
