import { motion } from "framer-motion";
import { ActivityRing } from "../components/ActivityRing";
import { CharacterDisplay } from "../components/CharacterDisplay";
import { ShareButton } from "../components/ShareButton";
import { buildHomeShare } from "../share/share-text-builders";
import { useSettings } from "../contexts/settings-context";
import { findCharacter } from "../data/characters";
import {
  getEncouragement,
  type CharacterMood,
} from "../data/encouragement-messages";
import type { CharacterState } from "../game/player-progress-types";
import { useDailyMetrics } from "../hooks/use-daily-metrics";

// 링 색상 (Tailwind 테마 색의 실제 HEX — SVG stroke에 직접 사용)
const RING_COLORS = {
  steps: "#ffb1b1", // peach 계열
  distance: "#7ec8ff", // sky 계열
  calories: "#ffcf5c", // sunny 계열
} as const;

/** 캐릭터 기분 → 표시 상태(에셋) 매핑 */
function moodToState(mood: CharacterMood): CharacterState {
  if (mood === "celebrate") return "celebrate";
  if (mood === "sleepy") return "idle";
  return "happy"; // cheer, excited
}

/** 오늘 날짜를 "6월 8일 (일)" 형식으로 포맷 */
function formatToday(date: Date): string {
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekdays[date.getDay()]})`;
}

export function HomeScreen() {
  const today = new Date();
  const { metrics, loading, error, refresh } = useDailyMetrics(today);
  const { settings } = useSettings();
  const { goals, mainCharacterId } = settings;

  // 지표가 없으면 0으로 간주 (로딩/에러 시 안전 기본값)
  const steps = metrics?.steps ?? 0;

  // 걸음 목표 대비 달성률 (걸음이 핵심 지표 — 캐릭터 기분도 이걸로 판단)
  const stepsProgress = steps / goals.steps;

  const encouragement = getEncouragement(stepsProgress);
  // 메인 캐릭터 (없으면 기본 치카와)
  const character = findCharacter(mainCharacterId) ?? findCharacter("chiikawa")!;

  return (
    <div className="flex flex-col gap-5 px-5 pb-24 pt-6">
      {/* 상단 인사 + 날짜 + 공유 */}
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs text-cocoa/50">{formatToday(today)}</p>
          <h1 className="text-xl font-bold text-cocoa">오늘의 운동</h1>
        </div>
        <ShareButton build={() => buildHomeShare(steps, goals.steps)} />
      </header>

      {/* 캐릭터 + 응원 말풍선 */}
      <section className="blob-card flex items-center gap-4 p-5">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <CharacterDisplay
            id={character.id}
            state={moodToState(encouragement.mood)}
            fallbackEmoji={character.fallbackEmoji}
            sizePx={72}
          />
        </motion.div>
        <div className="relative flex-1 rounded-2xl bg-cream px-4 py-3">
          {/* 말풍선 꼬리 */}
          <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 bg-cream" />
          <p className="relative text-sm font-medium leading-snug text-cocoa">
            {encouragement.message}
          </p>
        </div>
      </section>

      {/* 오늘 걸음 (핵심 지표) */}
      <section className="blob-card p-6">
        {error ? (
          // 에러 시 안내 + 다시 시도 버튼 (조용히 실패하지 않음)
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-sm text-cocoa/70">{error}</p>
            <button
              onClick={refresh}
              className="rounded-full bg-peach px-5 py-2 text-sm font-bold text-white"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className={`flex flex-col items-center gap-3 ${loading ? "opacity-50" : ""}`}>
            <ActivityRing
              progress={stepsProgress}
              size={180}
              strokeWidth={16}
              color={RING_COLORS.steps}
              emoji="👣"
              label="걸음"
              valueText={steps.toLocaleString()}
            />
            <p className="text-xs text-cocoa/50">
              목표 {goals.steps.toLocaleString()}걸음 중{" "}
              {Math.min(100, Math.round(stepsProgress * 100))}%
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
