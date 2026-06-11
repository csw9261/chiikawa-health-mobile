// 업적 정의 모음 (2차 + 확장).
// 10개 카테고리, 약 85개. 쉬움 ~ 1년 이상 수준까지. 각 업적은 보상 XP/포인트를 가짐.
// 업적 추가 = 이 배열에 항목 추가 (OCP — 엔진 코드 수정 불필요).
// 판정은 applyAchievements에서 보너스 적용 전 progress로 수행 → 레벨/포인트 순환 의존 없음.

import type {
  AchievementCategory,
  AchievementDef,
} from "../game/player-progress-types";

/** 카테고리 표시 메타 (성취 화면 그룹 헤더용) */
export const ACHIEVEMENT_CATEGORY_META: Record<
  AchievementCategory,
  { label: string; emoji: string }
> = {
  steps: { label: "누적 걸음", emoji: "👣" },
  goalDays: { label: "목표 달성일", emoji: "🎯" },
  stepStreak: { label: "걸음 연속", emoji: "🔥" },
  workouts: { label: "누적 운동", emoji: "💪" },
  workoutStreak: { label: "운동 연속", emoji: "⚡" },
  variety: { label: "운동 종류", emoji: "🎨" },
  dayPeak: { label: "하루 최다 걸음", emoji: "🚀" },
  categoryMastery: { label: "종목 마스터리", emoji: "🎽" },
  level: { label: "레벨", emoji: "🌟" },
  points: { label: "포인트 적립", emoji: "💰" },
};

export const ACHIEVEMENTS: AchievementDef[] = [
  // ── 누적 걸음 ──
  { id: "steps-10k", category: "steps", name: "1만 걸음", description: "누적 1만 걸음", emoji: "👟", xp: 150, points: 200, isEarned: (p) => p.totalSteps >= 10000 },
  { id: "steps-50k", category: "steps", name: "5만 걸음", description: "누적 5만 걸음", emoji: "👟", xp: 300, points: 400, isEarned: (p) => p.totalSteps >= 50000 },
  { id: "steps-100k", category: "steps", name: "10만 걸음", description: "누적 10만 걸음", emoji: "🥾", xp: 500, points: 700, isEarned: (p) => p.totalSteps >= 100000 },
  { id: "steps-300k", category: "steps", name: "30만 걸음", description: "누적 30만 걸음", emoji: "🥾", xp: 1000, points: 1500, isEarned: (p) => p.totalSteps >= 300000 },
  { id: "steps-500k", category: "steps", name: "50만 걸음", description: "누적 50만 걸음", emoji: "🏅", xp: 1500, points: 2500, isEarned: (p) => p.totalSteps >= 500000 },
  { id: "steps-700k", category: "steps", name: "70만 걸음", description: "누적 70만 걸음", emoji: "🏅", xp: 2000, points: 3500, isEarned: (p) => p.totalSteps >= 700000 },
  { id: "steps-1m", category: "steps", name: "100만 걸음", description: "누적 100만 걸음", emoji: "🏆", xp: 3000, points: 5000, isEarned: (p) => p.totalSteps >= 1000000 },
  { id: "steps-1_5m", category: "steps", name: "150만 걸음", description: "누적 150만 걸음", emoji: "🏆", xp: 4000, points: 7000, isEarned: (p) => p.totalSteps >= 1500000 },
  { id: "steps-2m", category: "steps", name: "200만 걸음", description: "누적 200만 걸음", emoji: "👑", xp: 5000, points: 9000, isEarned: (p) => p.totalSteps >= 2000000 },
  { id: "steps-2_5m", category: "steps", name: "250만 걸음", description: "누적 250만 걸음", emoji: "👑", xp: 6000, points: 12000, isEarned: (p) => p.totalSteps >= 2500000 },
  { id: "steps-3m", category: "steps", name: "300만 걸음", description: "누적 300만 걸음", emoji: "💎", xp: 7500, points: 15000, isEarned: (p) => p.totalSteps >= 3000000 },

  // ── 하루 걸음 목표 달성 누적일 ──
  { id: "goal-1", category: "goalDays", name: "첫 목표 달성", description: "걸음 목표 1일 달성", emoji: "🎯", xp: 100, points: 150, isEarned: (p) => p.daysGoalMet >= 1 },
  { id: "goal-7", category: "goalDays", name: "일주일 달성", description: "걸음 목표 7일 달성", emoji: "🎯", xp: 300, points: 400, isEarned: (p) => p.daysGoalMet >= 7 },
  { id: "goal-14", category: "goalDays", name: "2주 달성", description: "걸음 목표 14일 달성", emoji: "🎯", xp: 500, points: 700, isEarned: (p) => p.daysGoalMet >= 14 },
  { id: "goal-30", category: "goalDays", name: "한 달 달성", description: "걸음 목표 30일 달성", emoji: "📅", xp: 800, points: 1200, isEarned: (p) => p.daysGoalMet >= 30 },
  { id: "goal-50", category: "goalDays", name: "오십일 달성", description: "걸음 목표 50일 달성", emoji: "📅", xp: 1200, points: 1800, isEarned: (p) => p.daysGoalMet >= 50 },
  { id: "goal-100", category: "goalDays", name: "백일 달성", description: "걸음 목표 100일 달성", emoji: "📅", xp: 2000, points: 3000, isEarned: (p) => p.daysGoalMet >= 100 },
  { id: "goal-150", category: "goalDays", name: "백오십일 달성", description: "걸음 목표 150일 달성", emoji: "🗓️", xp: 2800, points: 4500, isEarned: (p) => p.daysGoalMet >= 150 },
  { id: "goal-200", category: "goalDays", name: "이백일 달성", description: "걸음 목표 200일 달성", emoji: "🗓️", xp: 3500, points: 6000, isEarned: (p) => p.daysGoalMet >= 200 },
  { id: "goal-300", category: "goalDays", name: "삼백일 달성", description: "걸음 목표 300일 달성", emoji: "🗓️", xp: 5000, points: 9000, isEarned: (p) => p.daysGoalMet >= 300 },
  { id: "goal-365", category: "goalDays", name: "일 년 개근", description: "걸음 목표 365일 달성", emoji: "👑", xp: 7000, points: 13000, isEarned: (p) => p.daysGoalMet >= 365 },

  // ── 걸음 연속일 ──
  { id: "sstreak-3", category: "stepStreak", name: "사흘 연속", description: "걸음 목표 3일 연속", emoji: "🔥", xp: 200, points: 300, isEarned: (p) => p.stepStreak.longest >= 3 },
  { id: "sstreak-7", category: "stepStreak", name: "일주일 연속", description: "걸음 목표 7일 연속", emoji: "🔥", xp: 400, points: 600, isEarned: (p) => p.stepStreak.longest >= 7 },
  { id: "sstreak-14", category: "stepStreak", name: "2주 연속", description: "걸음 목표 14일 연속", emoji: "🔥", xp: 800, points: 1200, isEarned: (p) => p.stepStreak.longest >= 14 },
  { id: "sstreak-21", category: "stepStreak", name: "3주 연속", description: "걸음 목표 21일 연속", emoji: "🔥", xp: 1100, points: 1800, isEarned: (p) => p.stepStreak.longest >= 21 },
  { id: "sstreak-30", category: "stepStreak", name: "한 달 연속", description: "걸음 목표 30일 연속", emoji: "🌋", xp: 1500, points: 2500, isEarned: (p) => p.stepStreak.longest >= 30 },
  { id: "sstreak-50", category: "stepStreak", name: "오십일 연속", description: "걸음 목표 50일 연속", emoji: "🌋", xp: 2300, points: 3800, isEarned: (p) => p.stepStreak.longest >= 50 },
  { id: "sstreak-60", category: "stepStreak", name: "두 달 연속", description: "걸음 목표 60일 연속", emoji: "🌋", xp: 3000, points: 5000, isEarned: (p) => p.stepStreak.longest >= 60 },
  { id: "sstreak-100", category: "stepStreak", name: "백일 연속", description: "걸음 목표 100일 연속", emoji: "☄️", xp: 5000, points: 9000, isEarned: (p) => p.stepStreak.longest >= 100 },

  // ── 누적 운동 횟수 ──
  { id: "wo-1", category: "workouts", name: "첫 운동", description: "운동 1회 기록", emoji: "🌱", xp: 100, points: 150, isEarned: (p) => p.totalWorkouts >= 1 },
  { id: "wo-5", category: "workouts", name: "운동 5회", description: "운동 5회 기록", emoji: "💪", xp: 300, points: 400, isEarned: (p) => p.totalWorkouts >= 5 },
  { id: "wo-10", category: "workouts", name: "운동 10회", description: "운동 10회 기록", emoji: "💪", xp: 600, points: 800, isEarned: (p) => p.totalWorkouts >= 10 },
  { id: "wo-20", category: "workouts", name: "운동 20회", description: "운동 20회 기록", emoji: "💪", xp: 900, points: 1300, isEarned: (p) => p.totalWorkouts >= 20 },
  { id: "wo-30", category: "workouts", name: "운동 30회", description: "운동 30회 기록", emoji: "🏋️", xp: 1200, points: 2000, isEarned: (p) => p.totalWorkouts >= 30 },
  { id: "wo-50", category: "workouts", name: "운동 50회", description: "운동 50회 기록", emoji: "🏋️", xp: 2000, points: 3500, isEarned: (p) => p.totalWorkouts >= 50 },
  { id: "wo-100", category: "workouts", name: "운동 100회", description: "운동 100회 기록", emoji: "🦾", xp: 3500, points: 6000, isEarned: (p) => p.totalWorkouts >= 100 },
  { id: "wo-150", category: "workouts", name: "운동 150회", description: "운동 150회 기록", emoji: "🦾", xp: 5000, points: 9000, isEarned: (p) => p.totalWorkouts >= 150 },
  { id: "wo-200", category: "workouts", name: "운동 200회", description: "운동 200회 기록", emoji: "👑", xp: 6500, points: 12000, isEarned: (p) => p.totalWorkouts >= 200 },
  { id: "wo-300", category: "workouts", name: "운동 300회", description: "운동 300회 기록", emoji: "💎", xp: 9000, points: 16000, isEarned: (p) => p.totalWorkouts >= 300 },

  // ── 운동 연속일 ──
  { id: "wstreak-2", category: "workoutStreak", name: "이틀 연속 운동", description: "운동 2일 연속", emoji: "⚡", xp: 150, points: 200, isEarned: (p) => p.workoutStreak.longest >= 2 },
  { id: "wstreak-3", category: "workoutStreak", name: "사흘 연속 운동", description: "운동 3일 연속", emoji: "⚡", xp: 250, points: 350, isEarned: (p) => p.workoutStreak.longest >= 3 },
  { id: "wstreak-5", category: "workoutStreak", name: "닷새 연속 운동", description: "운동 5일 연속", emoji: "⚡", xp: 500, points: 700, isEarned: (p) => p.workoutStreak.longest >= 5 },
  { id: "wstreak-7", category: "workoutStreak", name: "일주일 연속 운동", description: "운동 7일 연속", emoji: "🌟", xp: 800, points: 1200, isEarned: (p) => p.workoutStreak.longest >= 7 },
  { id: "wstreak-14", category: "workoutStreak", name: "2주 연속 운동", description: "운동 14일 연속", emoji: "🌟", xp: 1500, points: 2500, isEarned: (p) => p.workoutStreak.longest >= 14 },
  { id: "wstreak-21", category: "workoutStreak", name: "3주 연속 운동", description: "운동 21일 연속", emoji: "🌟", xp: 2200, points: 3600, isEarned: (p) => p.workoutStreak.longest >= 21 },
  { id: "wstreak-30", category: "workoutStreak", name: "한 달 연속 운동", description: "운동 30일 연속", emoji: "💫", xp: 3000, points: 5000, isEarned: (p) => p.workoutStreak.longest >= 30 },
  { id: "wstreak-50", category: "workoutStreak", name: "오십일 연속 운동", description: "운동 50일 연속", emoji: "💫", xp: 4500, points: 7500, isEarned: (p) => p.workoutStreak.longest >= 50 },
  { id: "wstreak-100", category: "workoutStreak", name: "백일 연속 운동", description: "운동 100일 연속", emoji: "☄️", xp: 7000, points: 12000, isEarned: (p) => p.workoutStreak.longest >= 100 },

  // ── 운동 종류 경험 ──
  { id: "variety-3", category: "variety", name: "삼색 운동", description: "운동 3종류 경험", emoji: "🎨", xp: 400, points: 600, isEarned: (p) => p.workoutCategoryCount >= 3 },
  { id: "variety-4", category: "variety", name: "사색 운동", description: "운동 4종류 경험", emoji: "🎨", xp: 600, points: 900, isEarned: (p) => p.workoutCategoryCount >= 4 },
  { id: "variety-5", category: "variety", name: "오색 운동", description: "운동 5종류 경험", emoji: "🎨", xp: 800, points: 1200, isEarned: (p) => p.workoutCategoryCount >= 5 },
  { id: "variety-6", category: "variety", name: "육색 운동", description: "운동 6종류 경험", emoji: "🌈", xp: 1100, points: 1700, isEarned: (p) => p.workoutCategoryCount >= 6 },
  { id: "variety-7", category: "variety", name: "만능 운동러", description: "운동 7종류 경험", emoji: "🌈", xp: 1500, points: 2500, isEarned: (p) => p.workoutCategoryCount >= 7 },
  { id: "variety-8", category: "variety", name: "팔색조 운동왕", description: "운동 8종류 전부 경험", emoji: "🌟", xp: 2200, points: 3500, isEarned: (p) => p.workoutCategoryCount >= 8 },

  // ── 하루 최다 걸음 ──
  { id: "peak-10k", category: "dayPeak", name: "하루 1만 걸음", description: "하루에 1만 걸음", emoji: "🚀", xp: 200, points: 300, isEarned: (p) => p.maxDaySteps >= 10000 },
  { id: "peak-15k", category: "dayPeak", name: "하루 1.5만 걸음", description: "하루에 1.5만 걸음", emoji: "🚀", xp: 400, points: 600, isEarned: (p) => p.maxDaySteps >= 15000 },
  { id: "peak-20k", category: "dayPeak", name: "하루 2만 걸음", description: "하루에 2만 걸음", emoji: "🚀", xp: 800, points: 1200, isEarned: (p) => p.maxDaySteps >= 20000 },
  { id: "peak-25k", category: "dayPeak", name: "하루 2.5만 걸음", description: "하루에 2.5만 걸음", emoji: "💥", xp: 1200, points: 1800, isEarned: (p) => p.maxDaySteps >= 25000 },
  { id: "peak-30k", category: "dayPeak", name: "하루 3만 걸음", description: "하루에 3만 걸음", emoji: "💥", xp: 1800, points: 2800, isEarned: (p) => p.maxDaySteps >= 30000 },

  // ── 종목 마스터리 (종목별 누적 횟수) ──
  // 걷기
  { id: "cat-walk-10", category: "categoryMastery", name: "산책 입문", description: "걷기 10회", emoji: "🚶", xp: 300, points: 400, isEarned: (p) => (p.workoutsByCategory.walking ?? 0) >= 10 },
  { id: "cat-walk-30", category: "categoryMastery", name: "산책 숙련", description: "걷기 30회", emoji: "🚶", xp: 700, points: 900, isEarned: (p) => (p.workoutsByCategory.walking ?? 0) >= 30 },
  { id: "cat-walk-50", category: "categoryMastery", name: "산책 마스터", description: "걷기 50회", emoji: "🚶", xp: 1200, points: 1800, isEarned: (p) => (p.workoutsByCategory.walking ?? 0) >= 50 },
  // 런닝
  { id: "cat-run-10", category: "categoryMastery", name: "러너 입문", description: "런닝 10회", emoji: "🏃", xp: 300, points: 400, isEarned: (p) => (p.workoutsByCategory.running ?? 0) >= 10 },
  { id: "cat-run-30", category: "categoryMastery", name: "러너 숙련", description: "런닝 30회", emoji: "🏃", xp: 700, points: 900, isEarned: (p) => (p.workoutsByCategory.running ?? 0) >= 30 },
  { id: "cat-run-50", category: "categoryMastery", name: "러너 마스터", description: "런닝 50회", emoji: "🏃", xp: 1200, points: 1800, isEarned: (p) => (p.workoutsByCategory.running ?? 0) >= 50 },
  // 사이클
  { id: "cat-cycle-10", category: "categoryMastery", name: "사이클 입문", description: "사이클 10회", emoji: "🚴", xp: 300, points: 400, isEarned: (p) => (p.workoutsByCategory.cycling ?? 0) >= 10 },
  { id: "cat-cycle-30", category: "categoryMastery", name: "사이클 숙련", description: "사이클 30회", emoji: "🚴", xp: 700, points: 900, isEarned: (p) => (p.workoutsByCategory.cycling ?? 0) >= 30 },
  { id: "cat-cycle-50", category: "categoryMastery", name: "사이클 마스터", description: "사이클 50회", emoji: "🚴", xp: 1200, points: 1800, isEarned: (p) => (p.workoutsByCategory.cycling ?? 0) >= 50 },
  // 등산
  { id: "cat-hike-5", category: "categoryMastery", name: "등산가", description: "등산 5회", emoji: "🥾", xp: 250, points: 350, isEarned: (p) => (p.workoutsByCategory.hiking ?? 0) >= 5 },
  { id: "cat-hike-20", category: "categoryMastery", name: "산악왕", description: "등산 20회", emoji: "🥾", xp: 800, points: 1200, isEarned: (p) => (p.workoutsByCategory.hiking ?? 0) >= 20 },
  // 근력
  { id: "cat-str-5", category: "categoryMastery", name: "헬스 입문", description: "근력운동 5회", emoji: "💪", xp: 250, points: 350, isEarned: (p) => (p.workoutsByCategory.strength ?? 0) >= 5 },
  { id: "cat-str-20", category: "categoryMastery", name: "근력왕", description: "근력운동 20회", emoji: "💪", xp: 800, points: 1200, isEarned: (p) => (p.workoutsByCategory.strength ?? 0) >= 20 },
  // 요가/스트레칭
  { id: "cat-yoga-5", category: "categoryMastery", name: "요가 입문", description: "요가/스트레칭 5회", emoji: "🧘", xp: 250, points: 350, isEarned: (p) => (p.workoutsByCategory.yoga ?? 0) >= 5 },
  { id: "cat-yoga-20", category: "categoryMastery", name: "요가 마스터", description: "요가/스트레칭 20회", emoji: "🧘", xp: 800, points: 1200, isEarned: (p) => (p.workoutsByCategory.yoga ?? 0) >= 20 },
  // 줄넘기
  { id: "cat-rope-5", category: "categoryMastery", name: "줄넘기 입문", description: "줄넘기 5회", emoji: "🪢", xp: 250, points: 350, isEarned: (p) => (p.workoutsByCategory.jumpRope ?? 0) >= 5 },
  { id: "cat-rope-20", category: "categoryMastery", name: "줄넘기왕", description: "줄넘기 20회", emoji: "🪢", xp: 800, points: 1200, isEarned: (p) => (p.workoutsByCategory.jumpRope ?? 0) >= 20 },

  // ── 레벨 이정표 ──
  { id: "lv-5", category: "level", name: "레벨 5", description: "레벨 5 달성", emoji: "🌟", xp: 500, points: 700, isEarned: (p) => p.level >= 5 },
  { id: "lv-10", category: "level", name: "레벨 10", description: "레벨 10 달성", emoji: "⭐", xp: 1000, points: 1500, isEarned: (p) => p.level >= 10 },
  { id: "lv-15", category: "level", name: "레벨 15", description: "레벨 15 달성", emoji: "✨", xp: 1800, points: 2800, isEarned: (p) => p.level >= 15 },
  { id: "lv-20", category: "level", name: "레벨 20", description: "레벨 20 달성", emoji: "🎖️", xp: 2800, points: 4500, isEarned: (p) => p.level >= 20 },
  { id: "lv-25", category: "level", name: "레벨 25", description: "레벨 25 달성", emoji: "🏅", xp: 4000, points: 7000, isEarned: (p) => p.level >= 25 },
  { id: "lv-30", category: "level", name: "레벨 30", description: "레벨 30 달성", emoji: "👑", xp: 5500, points: 10000, isEarned: (p) => p.level >= 30 },

  // ── 포인트 적립 (활동 적립 기준) ──
  { id: "pts-10k", category: "points", name: "1만 포인트", description: "활동으로 1만 P 적립", emoji: "💰", xp: 400, points: 600, isEarned: (p) => p.activityPoints >= 10000 },
  { id: "pts-50k", category: "points", name: "5만 포인트", description: "활동으로 5만 P 적립", emoji: "💵", xp: 1000, points: 1500, isEarned: (p) => p.activityPoints >= 50000 },
  { id: "pts-100k", category: "points", name: "10만 포인트", description: "활동으로 10만 P 적립", emoji: "💴", xp: 2000, points: 3000, isEarned: (p) => p.activityPoints >= 100000 },
  { id: "pts-200k", category: "points", name: "20만 포인트", description: "활동으로 20만 P 적립", emoji: "🏦", xp: 3500, points: 6000, isEarned: (p) => p.activityPoints >= 200000 },
];
