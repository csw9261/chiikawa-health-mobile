/** @type {import('tailwindcss').Config} */
// 먼작귀(치이카와)풍 파스텔 톤 디자인 토큰을 테마에 정의.
// 둥근 모서리·부드러운 그림자·말풍선 느낌을 전역에서 재사용하기 위함.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 배경/표면 계열 - 크림+연핑크 파스텔
        cream: "#fff5f7",
        surface: "#ffffff",
        // 포인트 컬러 - 치이카와 특유의 연한 노랑/핑크/하늘
        sunny: "#ffe08a", // 성취/하이라이트
        peach: "#ffc2c2", // 메인 포인트
        sky: "#bfe3ff", // 보조 포인트
        mint: "#c8f0d8", // 성공/달성
        cocoa: "#6b5b4f", // 본문 텍스트(딱딱한 검정 대신 부드러운 갈색)
      },
      borderRadius: {
        blob: "1.75rem", // 말랑한 카드 모서리
      },
      boxShadow: {
        soft: "0 8px 24px -8px rgba(180, 140, 140, 0.35)", // 부드러운 그림자
      },
      fontFamily: {
        // 둥근 고딕 우선. 폰에 없으면 시스템 폰트로 폴백
        rounded: ['"Cafe24 Ssurround"', '"Apple SD Gothic Neo"', "system-ui", "sans-serif"],
      },
      keyframes: {
        // 캐릭터 둥실 떠오르는 idle 모션
        bobbing: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        // 달성 시 통통 튀는 모션
        pop: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "70%": { transform: "scale(1.12)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        bobbing: "bobbing 2.4s ease-in-out infinite",
        pop: "pop 0.5s ease-out",
      },
    },
  },
  plugins: [],
};
