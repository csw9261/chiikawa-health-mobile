// 날짜별 활동 스냅샷 저장/동기화.
// Health Connect는 조회 범위가 슬라이딩이라 누적이 보존되지 않으므로,
// 확정된 과거 날짜를 로컬 스냅샷으로 한 번만 굳혀서(freeze) 누적/포인트가 유지되게 함.

import type { WorkoutCategory } from "../config/health-config";
import type { HealthDataSource } from "../services/health-data-source";
import { db, type DailySnapshot } from "./app-database";
import { getAllManualWorkouts } from "./workout-store";

// 첫 실행 시 과거 며칠치를 백필할지
const BACKFILL_DAYS = 365;
// 오늘 포함 최근 며칠은 매번 다시 갱신 (늦게 동기화되는 데이터 반영). 그 이전은 freeze
const RECENT_REFRESH_DAYS = 2;

/** Date → 로컬 날짜 키(YYYY-MM-DD) */
function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** 날짜에 days를 더한 새 Date 반환 (원본 불변) */
function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** 전체 스냅샷을 날짜 오름차순으로 반환 */
export async function getAllSnapshots(): Promise<DailySnapshot[]> {
  const rows = await db.dailySnapshots.toArray();
  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Health Connect + 수동 기록으로 스냅샷을 최신화.
 * - 첫 실행: 최근 BACKFILL_DAYS일 백필
 * - 이후: 마지막 스냅샷 이후 ~ 오늘, 그리고 최근 RECENT_REFRESH_DAYS일은 덮어씀
 * - 그보다 과거의 이미 있는 날짜는 건드리지 않음(freeze)
 * @returns 갱신 후 전체 스냅샷(오름차순)
 */
export async function syncSnapshots(
  source: HealthDataSource,
  stepGoal: number
): Promise<DailySnapshot[]> {
  const today = new Date();
  const existing = await getAllSnapshots();
  const existingDates = new Set(existing.map((s) => s.date));
  const lastKey = existing.length ? existing[existing.length - 1].date : null;

  // 가져올 시작 날짜 결정
  let startDate: Date;
  if (!lastKey) {
    startDate = addDays(today, -(BACKFILL_DAYS - 1));
  } else {
    const recentStart = addDays(today, -RECENT_REFRESH_DAYS);
    const afterLast = addDays(new Date(`${lastKey}T00:00:00`), 1);
    // gap(마지막 이후)과 최근 갱신 구간 둘 다 커버하도록 더 이른 쪽부터
    startDate = afterLast < recentStart ? afterLast : recentStart;
  }

  // 데이터 조회 (일일 지표 + 운동 세션 + 수동 기록)
  const daily = await source.getDailyMetricsRange(startDate, today);
  const hcWorkouts = await source.getWorkouts(startDate, today).catch(() => []);
  const manual = await getAllManualWorkouts();

  // 날짜별 운동 수/카테고리 집계 (자동 + 수동)
  const byDate = new Map<
    string,
    { count: number; cats: Partial<Record<WorkoutCategory, number>> }
  >();
  const addWorkout = (iso: string, cat: WorkoutCategory) => {
    const key = localDateKey(new Date(iso));
    const entry = byDate.get(key) ?? { count: 0, cats: {} };
    entry.count += 1;
    entry.cats[cat] = (entry.cats[cat] ?? 0) + 1;
    byDate.set(key, entry);
  };
  for (const w of hcWorkouts) addWorkout(w.startDate, w.category);
  for (const m of manual) addWorkout(m.startDate, m.category);

  // 최근 갱신 가능 구간 경계 (이 날짜 이상은 덮어쓰기 허용)
  const recentCutoff = localDateKey(addDays(today, -RECENT_REFRESH_DAYS));

  const toPut: DailySnapshot[] = [];
  for (const m of daily) {
    const isRecent = m.date >= recentCutoff; // YYYY-MM-DD 사전순 = 시간순
    // 과거 확정일이 이미 있으면 건너뜀 (freeze)
    if (!isRecent && existingDates.has(m.date)) continue;
    const wc = byDate.get(m.date) ?? { count: 0, cats: {} };
    toPut.push({
      date: m.date,
      steps: m.steps,
      goalMet: m.steps >= stepGoal,
      workoutCount: wc.count,
      workoutsByCategory: wc.cats,
    });
  }

  if (toPut.length > 0) {
    await db.dailySnapshots.bulkPut(toPut);
  }
  return getAllSnapshots();
}
