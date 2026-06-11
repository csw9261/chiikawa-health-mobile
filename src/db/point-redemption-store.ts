// 포인트 환전(차감) 내역 저장소.
// 포인트 잔액 = 누적 적립 − 누적 차감. 차감 내역은 영속 보관.

import { db, type PointRedemption } from "./app-database";

/** 환전 차감 추가. 차감 일시를 자동 기록 */
export async function addRedemption(
  amount: number,
  note?: string
): Promise<number> {
  return db.pointRedemptions.add({
    amount,
    note,
    redeemedAt: new Date().toISOString(),
  });
}

/** 전체 차감 내역 (최신순) */
export async function getRedemptions(): Promise<PointRedemption[]> {
  const rows = await db.pointRedemptions.toArray();
  return rows.sort((a, b) => b.redeemedAt.localeCompare(a.redeemedAt));
}

/** 누적 차감 합계 */
export async function getTotalRedeemed(): Promise<number> {
  const rows = await db.pointRedemptions.toArray();
  return rows.reduce((acc, r) => acc + r.amount, 0);
}
