// 수동 운동 기록 스토어.
// Health Connect는 읽기 전용이라, 와이프가 직접 기록한 운동(실내사이클 등)은 여기에 저장함.
// DB 인스턴스는 app-database에서 공유받음.

import { db, type ManualWorkout } from "./app-database";

export type { ManualWorkout };

/** 수동 운동 기록 추가. 생성 시각을 자동 기록함 */
export async function addManualWorkout(
  workout: Omit<ManualWorkout, "id" | "createdAt">
): Promise<number> {
  return db.manualWorkouts.add({
    ...workout,
    createdAt: new Date().toISOString(),
  });
}

/** 기간 내 수동 운동 기록 조회 (최신순) */
export async function getManualWorkouts(
  from: Date,
  to: Date
): Promise<ManualWorkout[]> {
  const fromIso = from.toISOString();
  const toIso = to.toISOString();
  const rows = await db.manualWorkouts
    .where("startDate")
    .between(fromIso, toIso, true, true)
    .toArray();
  // 최신순 정렬
  return rows.sort((a, b) => b.startDate.localeCompare(a.startDate));
}

/** 전체 수동 운동 기록 조회 (누적 통계/진행도 계산용) */
export async function getAllManualWorkouts(): Promise<ManualWorkout[]> {
  return db.manualWorkouts.toArray();
}

/** 수동 운동 기록 삭제 */
export async function deleteManualWorkout(id: number): Promise<void> {
  await db.manualWorkouts.delete(id);
}
