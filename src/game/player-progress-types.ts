// 게이미피케이션 진행도 관련 타입 정의.
// 운동 데이터를 누적/요약한 PlayerProgress를 중심으로 배지/캐릭터 해금을 판정함.

import type { WorkoutCategory } from "../config/health-config";

/** 연속일(스트릭) — 현재/최장 */
export interface Streak {
  /** 현재 연속일 (오늘 미달성이면 어제까지로 유예) */
  current: number;
  /** 역대 최장 연속일 */
  longest: number;
}

/** 레벨 진행 상황 (안내 UI용) */
export interface LevelInfo {
  /** 현재 레벨 */
  level: number;
  /** 현재 레벨 시작점 이후 쌓은 XP */
  xpIntoLevel: number;
  /** 현재 레벨 → 다음 레벨에 필요한 XP */
  xpForNextLevel: number;
}

/** 누적 운동 진행도 요약 (업적/캐릭터 해금·레벨·포인트 판정의 입력) */
export interface PlayerProgress {
  /** 누적 걸음 수 */
  totalSteps: number;
  /** 단일 하루 최다 걸음 (업적용) */
  maxDaySteps: number;
  /** 누적 운동 세션 수 (자동 + 수동) */
  totalWorkouts: number;
  /** 카테고리별 운동 세션 수 */
  workoutsByCategory: Partial<Record<WorkoutCategory, number>>;
  /** 경험한 운동 종류 수 */
  workoutCategoryCount: number;
  /** 걸음 목표를 달성한 총 일수 */
  daysGoalMet: number;
  /** 걸음 연속일 — 하루 걸음 목표 달성 연속 */
  stepStreak: Streak;
  /** 운동 연속일 — 하루 1회 이상 운동 기록 연속 */
  workoutStreak: Streak;
  /** 누적 경험치 (활동 + 달성한 업적 보너스 합산) */
  totalXP: number;
  /** 레벨 정보 */
  levelInfo: LevelInfo;
  /** 활동으로 적립된 누적 포인트 (걸음·목표·운동) */
  activityPoints: number;
  /** 달성한 업적 보너스 포인트 합 */
  achievementPoints: number;

  // --- 하위 호환 별칭 (기존 화면/배지가 사용) ---
  /** = stepStreak.current (하위 호환) */
  currentStreak: number;
  /** = stepStreak.longest (하위 호환) */
  longestStreak: number;
  /** = levelInfo.level (하위 호환) */
  level: number;
}

/** 업적 카테고리 */
export type AchievementCategory =
  | "steps" // 누적 걸음
  | "goalDays" // 하루 걸음 목표 달성 누적일
  | "stepStreak" // 걸음 연속일
  | "workouts" // 누적 운동 횟수
  | "workoutStreak" // 운동 연속일
  | "variety" // 운동 종류 경험
  | "dayPeak" // 하루 최다 걸음
  | "categoryMastery" // 종목별 누적 횟수 마스터리
  | "level" // 레벨 이정표
  | "points"; // 누적 포인트 적립

/** 업적 정의 */
export interface AchievementDef {
  /** 고유 id */
  id: string;
  /** 카테고리 */
  category: AchievementCategory;
  /** 업적 이름 */
  name: string;
  /** 조건 설명 */
  description: string;
  /** 표시용 이모지 */
  emoji: string;
  /** 달성 보상 경험치 */
  xp: number;
  /** 달성 보상 포인트 */
  points: number;
  /** 진행도가 이 조건을 만족하면 달성 */
  isEarned: (p: PlayerProgress) => boolean;
}

/** 캐릭터 감정 상태 — 표시할 에셋 선택에 사용 */
export type CharacterState = "idle" | "happy" | "celebrate";

/** 도감 종류 — 운동 횟수 도감 / 걸음수 도감 */
export type CharacterDeck = "workout" | "steps";

/** 캐릭터 정의 (이미지 에셋은 슬롯에 끼움) */
export interface CharacterDef {
  /** 고유 id (에셋 폴더명과 일치) */
  id: string;
  /** 캐릭터 이름 */
  name: string;
  /** 소속 도감 (에셋 중복 없음) */
  deck: CharacterDeck;
  /** 해금 조건 설명 */
  unlockDescription: string;
  /** 이미지 도입 전 폴백 이모지 */
  fallbackEmoji: string;
  /** 진행도가 이 조건을 만족하면 해금. 기본 캐릭터는 항상 true */
  isUnlocked: (p: PlayerProgress) => boolean;
}
