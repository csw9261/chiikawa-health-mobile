import { useCallback, useEffect, useState } from "react";
import type { PointRedemption } from "../db/app-database";
import { getTotalMissionPoints } from "../db/mission-claim-store";
import {
  addRedemption,
  getRedemptions,
  getTotalRedeemed,
} from "../db/point-redemption-store";

interface UsePointsState {
  /** 누적 적립 포인트 (활동 + 업적 + 미션) */
  earned: number;
  /** 누적 차감 포인트 */
  redeemed: number;
  /** 현재 잔액 (적립 − 차감, 음수 방지) */
  balance: number;
  /** 차감 내역 (최신순) */
  redemptions: PointRedemption[];
  loading: boolean;
  /** 환전 차감 실행 후 새로고침 */
  redeem: (amount: number, note?: string) => Promise<void>;
  refresh: () => void;
}

/**
 * 포인트 잔액 훅.
 * @param earnedPoints 진행도에서 계산된 활동+업적 적립 포인트.
 *   여기에 미션으로 적립된 포인트를 더해 최종 적립액(earned)을 산출함.
 */
export function usePoints(earnedPoints: number): UsePointsState {
  const [redeemed, setRedeemed] = useState(0);
  const [missionPoints, setMissionPoints] = useState(0);
  const [redemptions, setRedemptions] = useState<PointRedemption[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [total, list, mission] = await Promise.all([
        getTotalRedeemed(),
        getRedemptions(),
        getTotalMissionPoints(),
      ]);
      setRedeemed(total);
      setRedemptions(list);
      setMissionPoints(mission);
    } catch (e) {
      console.error("[usePoints] 포인트 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const redeem = useCallback(
    async (amount: number, note?: string) => {
      await addRedemption(amount, note);
      await load();
    },
    [load]
  );

  // 활동+업적 포인트 + 미션 적립 포인트
  const earned = earnedPoints + missionPoints;

  return {
    earned,
    redeemed,
    balance: Math.max(0, earned - redeemed),
    redemptions,
    loading,
    redeem,
    refresh: load,
  };
}
