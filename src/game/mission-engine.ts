// 미션 엔진: 기간 키 계산, 결정적 미션 선택, 진행도 집계/판정.
// "결정적 선택" = 같은 날짜/주/월이면 항상 같은 미션이 뽑힘 (하루 동안 바뀌지 않게).

import type { DailySnapshot } from "../db/app-database";
import {
  MISSION_COUNTS,
  MORNING_HOURS,
  NIGHT_HOUR_START,
  rewardForScope,
} from "../config/mission-config";
import {
  DAILY_MISSION_BUCKETS,
  MONTHLY_MISSIONS,
  WEEKLY_MISSIONS,
} from "../data/missions";
import type {
  MissionContext,
  MissionDef,
  MissionScope,
  MissionState,
} from "./mission-types";

/** Date → 로컬 날짜 키 (YYYY-MM-DD) */
function dateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** 이번 주 시작(월요일) Date 반환 */
function weekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // getDay: 0=일 ~ 6=토. 월요일 기준 오프셋(월=0)
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return d;
}

/** 기간 키 묶음 (회전 시드 + 보상 수령 키 구성에 사용) */
export interface PeriodKeys {
  daily: string; // YYYY-MM-DD
  weekly: string; // 그 주 월요일의 YYYY-MM-DD
  monthly: string; // YYYY-MM
}

/** 기준 시각으로 일/주/월 기간 키를 계산 */
export function periodKeys(now: Date): PeriodKeys {
  const monthly = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return { daily: dateKey(now), weekly: dateKey(weekStart(now)), monthly };
}

/** 문자열 → 32bit 해시 (FNV-1a). 시드 생성용 */
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 시드 기반 의사난수 생성기 (mulberry32) — 결정적 셔플용 */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 시드로 풀을 셔플해 앞에서 count개를 뽑음 (결정적) */
function pickDeterministic<T>(pool: T[], count: number, seed: string): T[] {
  const rng = mulberry32(hashString(seed));
  const arr = [...pool];
  // Fisher-Yates (시드 기반)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(count, arr.length));
}

/**
 * 기준 시각에 노출할 미션을 결정적으로 선택.
 * - 일일: 각 버킷(걸음/운동/보너스)에서 1개씩 → 3개
 * - 주간/월간: 풀에서 설정된 개수만큼
 */
export function selectMissions(keys: PeriodKeys): {
  daily: MissionDef[];
  weekly: MissionDef[];
  monthly: MissionDef[];
} {
  // 버킷마다 시드를 다르게 줘 한 버킷에서 1개씩 안정적으로 선택
  const daily = DAILY_MISSION_BUCKETS.map(
    (bucket, i) => pickDeterministic(bucket, 1, `${keys.daily}:b${i}`)[0]
  );
  const weekly = pickDeterministic(
    WEEKLY_MISSIONS,
    MISSION_COUNTS.weekly,
    keys.weekly
  );
  const monthly = pickDeterministic(
    MONTHLY_MISSIONS,
    MISSION_COUNTS.monthly,
    keys.monthly
  );
  return { daily, weekly, monthly };
}

/** 시각 문자열 배열에서 시간대(아침/야간) 운동 수를 셈 */
function countByHour(workoutISOs: string[]): {
  morning: number;
  night: number;
} {
  let morning = 0;
  let night = 0;
  for (const iso of workoutISOs) {
    const h = new Date(iso).getHours();
    if (h >= MORNING_HOURS.startInclusive && h < MORNING_HOURS.endExclusive) {
      morning += 1;
    }
    if (h >= NIGHT_HOUR_START) {
      night += 1;
    }
  }
  return { morning, night };
}

/**
 * 스냅샷 + 오늘 운동 시작시각으로 미션 컨텍스트를 구성.
 * @param snapshots 전체 일별 스냅샷 (오름차순)
 * @param todayWorkoutISOs 오늘 운동 세션 시작 시각(ISO) 목록 — 시간대 미션 판정용
 * @param stepGoal 하루 걸음 목표
 * @param now 기준 시각
 */
export function buildMissionContext(
  snapshots: DailySnapshot[],
  todayWorkoutISOs: string[],
  stepGoal: number,
  now: Date
): MissionContext {
  const keys = periodKeys(now);
  const today = snapshots.find((s) => s.date === keys.daily);
  const weekStartKey = keys.weekly;
  const todayKey = keys.daily;

  // 이번 주(월요일 ~ 오늘): 사전순 비교로 범위 필터
  const week = snapshots.filter(
    (s) => s.date >= weekStartKey && s.date <= todayKey
  );
  // 이번 달: YYYY-MM 접두 일치
  const month = snapshots.filter((s) => s.date.startsWith(keys.monthly));

  const sum = (arr: DailySnapshot[], pick: (s: DailySnapshot) => number) =>
    arr.reduce((acc, s) => acc + pick(s), 0);
  const countGoal = (arr: DailySnapshot[]) =>
    arr.filter((s) => s.goalMet).length;
  // 기간 내 경험한 서로 다른 종목 수 (카테고리별 합산 후 0 초과 종목 개수)
  const distinctCategories = (arr: DailySnapshot[]) => {
    const seen = new Set<string>();
    for (const s of arr) {
      for (const [cat, n] of Object.entries(s.workoutsByCategory)) {
        if ((n ?? 0) > 0) seen.add(cat);
      }
    }
    return seen.size;
  };

  const { morning, night } = countByHour(todayWorkoutISOs);
  const todayCats = today
    ? Object.values(today.workoutsByCategory).filter((n) => (n ?? 0) > 0).length
    : 0;

  return {
    stepGoal,
    daily: {
      steps: today?.steps ?? 0,
      workoutCount: today?.workoutCount ?? 0,
      goalMet: today?.goalMet ?? false,
      categoryCount: todayCats,
      workoutsByCategory: today?.workoutsByCategory ?? {},
      morningWorkouts: morning,
      nightWorkouts: night,
    },
    weekly: {
      steps: sum(week, (s) => s.steps),
      workoutCount: sum(week, (s) => s.workoutCount),
      goalDays: countGoal(week),
      categoryCount: distinctCategories(week),
    },
    monthly: {
      steps: sum(month, (s) => s.steps),
      workoutCount: sum(month, (s) => s.workoutCount),
      goalDays: countGoal(month),
      categoryCount: distinctCategories(month),
    },
  };
}

/** target이 함수면 컨텍스트로 평가해 수치로 변환 */
function resolveTarget(def: MissionDef, ctx: MissionContext): number {
  return typeof def.target === "function" ? def.target(ctx) : def.target;
}

/** 미션 정의 + 컨텍스트 + 기간키 → 표시용 상태(진행도/달성/보상키) */
export function computeMissionState(
  def: MissionDef,
  ctx: MissionContext,
  keys: PeriodKeys
): MissionState {
  const target = resolveTarget(def, ctx);
  const rawCurrent = def.progress(ctx);
  const current = Math.min(rawCurrent, target);
  const periodKey = keys[def.scope as MissionScope];
  return {
    def,
    current,
    rawCurrent,
    target,
    complete: rawCurrent >= target,
    reward: rewardForScope(def.scope),
    // 보상 수령 키: 같은 기간의 같은 미션은 1회만 적립
    claimKey: `${def.scope}:${periodKey}:${def.id}`,
  };
}
