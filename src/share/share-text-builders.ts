// 공유 텍스트 요약 생성기 (순수 함수).
// 각 공유 버튼이 공유시트로 보낼 "내용"을 만든다. (이미지가 아닌 텍스트)

import type { ShareContent } from "../services/share-service";

const APP_TITLE = "먼작귀 헬스";

/** 홈 — 오늘 걸음 */
export function buildHomeShare(steps: number, goal: number): ShareContent {
  const pct = goal > 0 ? Math.min(100, Math.round((steps / goal) * 100)) : 0;
  return {
    title: APP_TITLE,
    text: `🐭 ${APP_TITLE}\n오늘 ${steps.toLocaleString()}걸음 걸었어요! (목표 ${goal.toLocaleString()} · ${pct}%)`,
  };
}

/** 운동 — 누적 운동 횟수 + 운동 연속 */
export function buildWorkoutShare(
  totalWorkouts: number,
  workoutStreakCurrent: number
): ShareContent {
  return {
    title: APP_TITLE,
    text: `💪 ${APP_TITLE}\n지금까지 운동 ${totalWorkouts}회! 운동 연속 ${workoutStreakCurrent}일째 🔥`,
  };
}

/** 도감 — 두 도감 모음 현황 */
export function buildCollectionShare(
  workout: { unlocked: number; total: number },
  steps: { unlocked: number; total: number }
): ShareContent {
  return {
    title: APP_TITLE,
    text: `📖 ${APP_TITLE} 도감\n🏃 운동 도감 ${workout.unlocked}/${workout.total} · 👣 걸음 도감 ${steps.unlocked}/${steps.total} 모았어요!`,
  };
}

/** 성취 — 레벨·업적·연속일·포인트 */
export function buildAchievementShare(params: {
  level: number;
  earnedAchievements: number;
  totalAchievements: number;
  stepStreakCurrent: number;
  totalSteps: number;
  pointBalance: number;
}): ShareContent {
  return {
    title: APP_TITLE,
    text:
      `🏆 ${APP_TITLE} 성취\n` +
      `Lv.${params.level} · 누적 ${params.totalSteps.toLocaleString()}걸음\n` +
      `업적 ${params.earnedAchievements}/${params.totalAchievements} · 걸음 연속 ${params.stepStreakCurrent}일\n` +
      `포인트 ${params.pointBalance.toLocaleString()}P`,
  };
}

/** 해금 축하 — 새로 달성한 캐릭터/업적 */
export function buildCelebrationShare(
  characterNames: string[],
  achievementNames: string[]
): ShareContent {
  const parts: string[] = [];
  if (characterNames.length > 0) {
    parts.push(`새 친구: ${characterNames.join(", ")}`);
  }
  if (achievementNames.length > 0) {
    parts.push(`새 업적: ${achievementNames.join(", ")}`);
  }
  return {
    title: APP_TITLE,
    text: `🎉 ${APP_TITLE}\n${parts.join("\n")}`,
  };
}
