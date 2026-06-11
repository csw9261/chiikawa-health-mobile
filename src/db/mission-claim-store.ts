// 미션 보상 수령 스토어.
// 같은 기간의 같은 미션을 두 번 적립하지 않도록 수령 키로 1회만 기록하고,
// 누적 미션 포인트(잔액 계산에 합산)를 제공함.

import { db, type MissionClaim } from "./app-database";

/** 이미 보상을 받은 미션 수령 키 집합 */
export async function getClaimedKeys(): Promise<Set<string>> {
  const rows = await db.missionClaims.toArray();
  return new Set(rows.map((r) => r.key));
}

/** 미션으로 적립된 총 포인트 (포인트 잔액 계산에 합산) */
export async function getTotalMissionPoints(): Promise<number> {
  const rows = await db.missionClaims.toArray();
  return rows.reduce((acc, r) => acc + r.points, 0);
}

/**
 * 미션 보상 적립. 같은 키가 이미 있으면 무시(중복 적립 방지).
 * @returns 실제로 새로 적립됐으면 true
 */
export async function claimMission(
  key: string,
  scope: string,
  points: number
): Promise<boolean> {
  const exists = await db.missionClaims.get(key);
  if (exists) return false; // 이미 수령함 — 중복 적립 방지
  const claim: MissionClaim = {
    key,
    scope,
    points,
    claimedAt: new Date().toISOString(),
  };
  await db.missionClaims.add(claim);
  return true;
}
