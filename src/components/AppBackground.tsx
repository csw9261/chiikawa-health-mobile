// 앱 배경 레이어.
// 앱을 실행할 때마다 무작위 배경 이미지 1장을 화면 전체에 깔고,
// 그 위에 가독성용 크림색 반투명 막을 덮어 텍스트/카드가 잘 보이게 함.
// 배경 이미지가 하나도 없으면 렌더하지 않아 기존 크림 배경(body bg-cream)이 그대로 유지됨.

// 빌드 시 배경 이미지들을 한 번에 수집 (eager). 경로 → URL.
const BG_MODULES = import.meta.glob<{ default: string }>(
  "../assets/backgrounds/*.webp",
  { eager: true }
);
const BG_URLS = Object.values(BG_MODULES).map((m) => m.default);

// 모듈 로드 시 1회만 평가됨 = 앱 실행마다 한 번 무작위 선택.
// 탭 전환·리렌더에도 같은 배경이 유지됨 (매 렌더 바뀌지 않게).
const RANDOM_BG: string | null =
  BG_URLS.length > 0
    ? BG_URLS[Math.floor(Math.random() * BG_URLS.length)]
    : null;

// 가독성 막 불투명도 (0~1). 어두운 배경에서도 텍스트가 읽히도록 크림색을 약 60% 덮음.
// 배경을 더 선명히 보이게 하려면 낮추고, 가독성을 더 높이려면 올림.
const SCRIM_OPACITY = 0.6;
// 크림색 (tailwind.config.js의 cream #fff5f7과 동일)
const CREAM_RGB = "255, 245, 247";

/** 화면 전체에 무작위 배경 + 가독성 막을 까는 고정 레이어 (앱 콘텐츠 뒤에 위치) */
export function AppBackground() {
  if (!RANDOM_BG) return null;
  return (
    <>
      {/* 배경 이미지 (가장 뒤) */}
      <div
        aria-hidden
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${RANDOM_BG})` }}
      />
      {/* 가독성용 크림색 막 (배경 위, 콘텐츠 아래) */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{ backgroundColor: `rgba(${CREAM_RGB}, ${SCRIM_OPACITY})` }}
      />
    </>
  );
}
