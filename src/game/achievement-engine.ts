// 게이미피케이션 핵심 계산 로직 (순수 함수).
// 입력 = 날짜별 스냅샷 배열 → 출력 = PlayerProgress. 부수효과 없어 단위 테스트로 검증 가능.

import type { WorkoutCategory } from "../config/health-config";
import {
  LEVEL_CURVE,
  POINT_RULES,
  XP_RULES,
} from "../config/gamification-config";
import type { DailySnapshot } from "../db/app-database";
import type {
  AchievementDef,
  LevelInfo,
  PlayerProgress,
  Streak,
} from "./player-progress-types";

/**
 * 연속일(스트릭) 계산. flags는 과거→오늘 순의 "그날 조건 달성 여부".
 * 현재 스트릭: 마지막 날부터 역순으로 연속 true 카운트.
 * 유예: 오늘(마지막)이 아직 false면 어제까지의 연속을 현재로 간주(중간에 끊긴 것처럼 안 보이게).
 */
export function computeStreak(flags: boolean[]): Streak {
  if (flags.length === 0) return { current: 0, longest: 0 };

  let longest = 0;
  let run = 0;
  for (const f of flags) {
    if (f) {
      run += 1;
      if (run > longest) longest = run;
    } else {
      run = 0;
    }
  }

  let current = 0;
  for (let i = flags.length - 1; i >= 0; i--) {
    if (flags[i]) current += 1;
    else break;
  }
  // 오늘 미달성 유예: 어제까지의 연속을 현재로
  if (current === 0 && !flags[flags.length - 1] && flags.length >= 2) {
    for (let i = flags.length - 2; i >= 0; i--) {
      if (flags[i]) current += 1;
      else break;
    }
  }

  return { current, longest };
}

/** 누적 XP → 레벨 정보. 레벨 L→L+1 필요 XP = base + (L-1)*stepUp */
export function computeLevelInfo(totalXP: number): LevelInfo {
  const needFor = (level: number) =>
    LEVEL_CURVE.base + (level - 1) * LEVEL_CURVE.stepUp;

  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXP));
  // 다음 레벨 비용을 감당할 수 있는 동안 레벨업 (비용이 점증해 루프는 유한)
  while (remaining >= needFor(level)) {
    remaining -= needFor(level);
    level += 1;
  }
  return { level, xpIntoLevel: remaining, xpForNextLevel: needFor(level) };
}

/** 하루 스냅샷의 활동 XP */
function dayXP(s: DailySnapshot): number {
  return (
    Math.floor(s.steps * XP_RULES.perStep) +
    (s.goalMet ? XP_RULES.perGoalDay : 0) +
    s.workoutCount * XP_RULES.perWorkout
  );
}

/** 하루 스냅샷의 활동 포인트 */
function dayPoints(s: DailySnapshot): number {
  return (
    Math.floor(s.steps * POINT_RULES.perStep) +
    (s.goalMet ? POINT_RULES.perGoalDay : 0) +
    s.workoutCount * POINT_RULES.perWorkout
  );
}

/**
 * 날짜별 스냅샷 → 누적 진행도.
 * 스냅샷은 과거→오늘 순으로 정렬돼 있어야 함(연속일 계산에 필요).
 */
export function computeProgressFromSnapshots(
  snapshots: DailySnapshot[]
): PlayerProgress {
  const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));

  let totalSteps = 0;
  let maxDaySteps = 0;
  let totalWorkouts = 0;
  let daysGoalMet = 0;
  let totalXP = 0;
  let activityPoints = 0;
  const workoutsByCategory: Partial<Record<WorkoutCategory, number>> = {};

  for (const s of sorted) {
    totalSteps += s.steps;
    if (s.steps > maxDaySteps) maxDaySteps = s.steps;
    totalWorkouts += s.workoutCount;
    if (s.goalMet) daysGoalMet += 1;
    totalXP += dayXP(s);
    activityPoints += dayPoints(s);
    for (const [cat, n] of Object.entries(s.workoutsByCategory)) {
      const key = cat as WorkoutCategory;
      workoutsByCategory[key] = (workoutsByCategory[key] ?? 0) + (n ?? 0);
    }
  }

  const stepStreak = computeStreak(sorted.map((s) => s.goalMet));
  const workoutStreak = computeStreak(sorted.map((s) => s.workoutCount > 0));
  const levelInfo = computeLevelInfo(totalXP);

  return {
    totalSteps,
    maxDaySteps,
    totalWorkouts,
    workoutsByCategory,
    workoutCategoryCount: Object.values(workoutsByCategory).filter(
      (n) => (n ?? 0) > 0
    ).length,
    daysGoalMet,
    stepStreak,
    workoutStreak,
    totalXP,
    levelInfo,
    activityPoints,
    achievementPoints: 0, // 업적 보상은 applyAchievements에서 합산
    // 하위 호환 별칭
    currentStreak: stepStreak.current,
    longestStreak: stepStreak.longest,
    level: levelInfo.level,
  };
}

/**
 * 업적 달성 보상(XP·포인트)을 진행도에 반영.
 * 업적 XP를 더해 레벨을 재계산하고, 업적 포인트를 합산함.
 * 업적 판정은 활동 지표(걸음·운동·연속일 등) 기반이라 레벨과 순환 의존 없음.
 * @returns 보상 반영된 progress + 달성한 업적 id 집합
 */
export function applyAchievements(
  progress: PlayerProgress,
  achievements: AchievementDef[]
): { progress: PlayerProgress; earnedIds: Set<string> } {
  const earnedIds = new Set<string>();
  let bonusXP = 0;
  let bonusPoints = 0;
  for (const a of achievements) {
    if (a.isEarned(progress)) {
      earnedIds.add(a.id);
      bonusXP += a.xp;
      bonusPoints += a.points;
    }
  }
  const totalXP = progress.totalXP + bonusXP;
  const levelInfo = computeLevelInfo(totalXP);
  return {
    progress: {
      ...progress,
      totalXP,
      levelInfo,
      level: levelInfo.level,
      achievementPoints: bonusPoints,
    },
    earnedIds,
  };
}
