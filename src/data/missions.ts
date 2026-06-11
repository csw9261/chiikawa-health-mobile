// 미션 풀 정의 (일일/주간/월간).
// 미션 추가 = 이 풀에 항목 추가 (엔진/회전 로직 수정 불필요 — OCP).
// 자동 선택은 일일의 경우 "걸음 1 + 운동 1 + 보너스 1" 버킷에서 1개씩 뽑고,
// 직접 선택(바꾸기)은 각 주기의 전체 풀에서 고를 수 있음.

import type { MissionDef, MissionScope } from "../game/mission-types";

// ── 일일: 걸음 버킷 ──
const DAILY_STEPS: MissionDef[] = [
  { id: "d-steps-2k", scope: "daily", emoji: "👣", name: "가볍게 2천 보", description: "오늘 2,000보 걷기", target: 2000, progress: (c) => c.daily.steps },
  { id: "d-steps-3k", scope: "daily", emoji: "👣", name: "3천 보 산책", description: "오늘 3,000보 걷기", target: 3000, progress: (c) => c.daily.steps },
  { id: "d-steps-4k", scope: "daily", emoji: "👟", name: "4천 보", description: "오늘 4,000보 걷기", target: 4000, progress: (c) => c.daily.steps },
  { id: "d-steps-5k", scope: "daily", emoji: "👟", name: "오늘 5천 보", description: "오늘 5,000보 걷기", target: 5000, progress: (c) => c.daily.steps },
  { id: "d-steps-6k", scope: "daily", emoji: "🥾", name: "6천 보", description: "오늘 6,000보 걷기", target: 6000, progress: (c) => c.daily.steps },
  { id: "d-steps-8k", scope: "daily", emoji: "🚀", name: "8천 보", description: "오늘 8,000보 걷기", target: 8000, progress: (c) => c.daily.steps },
  { id: "d-steps-10k", scope: "daily", emoji: "🔥", name: "만 보 도전", description: "오늘 10,000보 걷기", target: 10000, progress: (c) => c.daily.steps },
  { id: "d-steps-goal", scope: "daily", emoji: "🎯", name: "오늘 목표 달성", description: "오늘 걸음 목표 채우기", target: (c) => c.stepGoal, progress: (c) => c.daily.steps },
];

// ── 일일: 운동 버킷 ──
const DAILY_WORKOUT: MissionDef[] = [
  { id: "d-workout-1", scope: "daily", emoji: "💪", name: "오늘의 운동", description: "오늘 운동 1회 기록", target: 1, progress: (c) => c.daily.workoutCount },
  { id: "d-workout-2", scope: "daily", emoji: "🔁", name: "한 번 더!", description: "오늘 운동 2회 기록", target: 2, progress: (c) => c.daily.workoutCount },
  { id: "d-variety-2", scope: "daily", emoji: "🎨", name: "두 가지 운동", description: "오늘 서로 다른 종목 2개", target: 2, progress: (c) => c.daily.categoryCount },
  { id: "d-cat-walking", scope: "daily", emoji: "🚶", name: "걷기 한 판", description: "오늘 걷기 운동 1회", target: 1, progress: (c) => c.daily.workoutsByCategory.walking ?? 0 },
  { id: "d-cat-cycling", scope: "daily", emoji: "🚴", name: "사이클 타기", description: "오늘 사이클 1회", target: 1, progress: (c) => c.daily.workoutsByCategory.cycling ?? 0 },
  { id: "d-cat-running", scope: "daily", emoji: "🏃", name: "오늘은 러닝", description: "오늘 런닝 1회", target: 1, progress: (c) => c.daily.workoutsByCategory.running ?? 0 },
];

// ── 일일: 보너스 버킷 (시간대 + 추가 걸음 + 특정 종목) ──
const DAILY_BONUS: MissionDef[] = [
  { id: "d-morning", scope: "daily", emoji: "🌅", name: "아침 운동", description: "오전 6~10시 운동 1회", target: 1, progress: (c) => c.daily.morningWorkouts },
  { id: "d-night", scope: "daily", emoji: "🌙", name: "야간 운동", description: "저녁 7시 이후 운동 1회", target: 1, progress: (c) => c.daily.nightWorkouts },
  { id: "d-steps-12k", scope: "daily", emoji: "💥", name: "1.2만 보", description: "오늘 12,000보 걷기", target: 12000, progress: (c) => c.daily.steps },
  { id: "d-steps-15k", scope: "daily", emoji: "🏆", name: "1.5만 보", description: "오늘 15,000보 걷기", target: 15000, progress: (c) => c.daily.steps },
  { id: "d-cat-yoga", scope: "daily", emoji: "🧘", name: "스트레칭 타임", description: "오늘 요가/스트레칭 1회", target: 1, progress: (c) => c.daily.workoutsByCategory.yoga ?? 0 },
  { id: "d-cat-strength", scope: "daily", emoji: "🏋️", name: "근력 운동", description: "오늘 근력운동 1회", target: 1, progress: (c) => c.daily.workoutsByCategory.strength ?? 0 },
];

/** 일일 미션 버킷 — 자동 선택 시 각 버킷에서 1개씩 뽑아 총 3개 노출 */
export const DAILY_MISSION_BUCKETS: MissionDef[][] = [
  DAILY_STEPS,
  DAILY_WORKOUT,
  DAILY_BONUS,
];

/** 일일 전체 풀 (직접 선택 picker용) */
export const DAILY_MISSIONS: MissionDef[] = [
  ...DAILY_STEPS,
  ...DAILY_WORKOUT,
  ...DAILY_BONUS,
];

// ── 주간 미션 풀 ──
export const WEEKLY_MISSIONS: MissionDef[] = [
  { id: "w-goal-3", scope: "weekly", emoji: "🗓️", name: "주 3일 달성", description: "이번 주 3일 목표 달성", target: 3, progress: (c) => c.weekly.goalDays },
  { id: "w-goal-4", scope: "weekly", emoji: "🗓️", name: "꾸준한 한 주", description: "이번 주 4일 목표 달성", target: 4, progress: (c) => c.weekly.goalDays },
  { id: "w-goal-5", scope: "weekly", emoji: "🗓️", name: "주 5일 달성", description: "이번 주 5일 목표 달성", target: 5, progress: (c) => c.weekly.goalDays },
  { id: "w-goal-6", scope: "weekly", emoji: "🗓️", name: "거의 매일", description: "이번 주 6일 목표 달성", target: 6, progress: (c) => c.weekly.goalDays },
  { id: "w-goal-7", scope: "weekly", emoji: "💎", name: "완벽한 한 주", description: "이번 주 7일 전부 달성", target: 7, progress: (c) => c.weekly.goalDays },
  { id: "w-workout-2", scope: "weekly", emoji: "💪", name: "주 2회 운동", description: "이번 주 운동 2회", target: 2, progress: (c) => c.weekly.workoutCount },
  { id: "w-workout-3", scope: "weekly", emoji: "🏋️", name: "주 3회 운동", description: "이번 주 운동 3회", target: 3, progress: (c) => c.weekly.workoutCount },
  { id: "w-workout-4", scope: "weekly", emoji: "🏋️", name: "주 4회 운동", description: "이번 주 운동 4회", target: 4, progress: (c) => c.weekly.workoutCount },
  { id: "w-workout-5", scope: "weekly", emoji: "🦾", name: "주 5회 운동", description: "이번 주 운동 5회", target: 5, progress: (c) => c.weekly.workoutCount },
  { id: "w-variety-3", scope: "weekly", emoji: "🎨", name: "다채로운 한 주", description: "이번 주 서로 다른 종목 3개", target: 3, progress: (c) => c.weekly.categoryCount },
  { id: "w-steps-30k", scope: "weekly", emoji: "👣", name: "주간 3만 보", description: "이번 주 30,000보 걷기", target: 30000, progress: (c) => c.weekly.steps },
  { id: "w-steps-40k", scope: "weekly", emoji: "👟", name: "주간 4만 보", description: "이번 주 40,000보 걷기", target: 40000, progress: (c) => c.weekly.steps },
  { id: "w-steps-50k", scope: "weekly", emoji: "🥾", name: "주간 5만 보", description: "이번 주 50,000보 걷기", target: 50000, progress: (c) => c.weekly.steps },
  { id: "w-steps-70k", scope: "weekly", emoji: "🔥", name: "주간 7만 보", description: "이번 주 70,000보 걷기", target: 70000, progress: (c) => c.weekly.steps },
];

// ── 월간 미션 풀 ──
export const MONTHLY_MISSIONS: MissionDef[] = [
  { id: "m-goal-10", scope: "monthly", emoji: "📅", name: "이 달 10일 달성", description: "이번 달 10일 목표 달성", target: 10, progress: (c) => c.monthly.goalDays },
  { id: "m-goal-15", scope: "monthly", emoji: "📅", name: "이 달 15일 달성", description: "이번 달 15일 목표 달성", target: 15, progress: (c) => c.monthly.goalDays },
  { id: "m-goal-20", scope: "monthly", emoji: "🏆", name: "이 달의 성실왕", description: "이번 달 20일 목표 달성", target: 20, progress: (c) => c.monthly.goalDays },
  { id: "m-goal-25", scope: "monthly", emoji: "👑", name: "이 달 25일 달성", description: "이번 달 25일 목표 달성", target: 25, progress: (c) => c.monthly.goalDays },
  { id: "m-workout-8", scope: "monthly", emoji: "💪", name: "이 달 운동 8회", description: "이번 달 운동 8회", target: 8, progress: (c) => c.monthly.workoutCount },
  { id: "m-workout-12", scope: "monthly", emoji: "🏋️", name: "이 달의 운동러", description: "이번 달 운동 12회", target: 12, progress: (c) => c.monthly.workoutCount },
  { id: "m-workout-16", scope: "monthly", emoji: "🦾", name: "이 달 운동 16회", description: "이번 달 운동 16회", target: 16, progress: (c) => c.monthly.workoutCount },
  { id: "m-workout-20", scope: "monthly", emoji: "🔥", name: "이 달 운동 20회", description: "이번 달 운동 20회", target: 20, progress: (c) => c.monthly.workoutCount },
  { id: "m-variety-5", scope: "monthly", emoji: "🌈", name: "만능 운동러", description: "이번 달 서로 다른 종목 5개", target: 5, progress: (c) => c.monthly.categoryCount },
  { id: "m-steps-150k", scope: "monthly", emoji: "👣", name: "이 달 15만 보", description: "이번 달 150,000보 걷기", target: 150000, progress: (c) => c.monthly.steps },
  { id: "m-steps-200k", scope: "monthly", emoji: "🥾", name: "이 달의 걷기왕", description: "이번 달 200,000보 걷기", target: 200000, progress: (c) => c.monthly.steps },
  { id: "m-steps-300k", scope: "monthly", emoji: "👑", name: "이 달 30만 보", description: "이번 달 300,000보 걷기", target: 300000, progress: (c) => c.monthly.steps },
];

/** 주기별 전체 풀 (직접 선택 picker용) */
export const POOL_BY_SCOPE: Record<MissionScope, MissionDef[]> = {
  daily: DAILY_MISSIONS,
  weekly: WEEKLY_MISSIONS,
  monthly: MONTHLY_MISSIONS,
};

/** id → 미션 정의 (저장된 선택 id를 정의로 복원할 때 사용) */
export const MISSION_BY_ID: Record<string, MissionDef> = Object.fromEntries(
  [...DAILY_MISSIONS, ...WEEKLY_MISSIONS, ...MONTHLY_MISSIONS].map((m) => [
    m.id,
    m,
  ])
);
