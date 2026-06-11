import { useCallback, useEffect, useState } from "react";
import { DEFAULT_DAILY_GOALS } from "../config/health-config";
import { MISSION_REWARDS } from "../config/mission-config";
import { MISSION_BY_ID } from "../data/missions";
import { syncSnapshots } from "../db/daily-snapshot-store";
import {
  claimMission,
  getClaimedKeys,
  getTotalMissionPoints,
} from "../db/mission-claim-store";
import { getSelection, setSelection } from "../db/mission-selection-store";
import { getManualWorkouts } from "../db/workout-store";
import {
  buildMissionContext,
  computeMissionState,
  periodKeys,
  selectMissions,
} from "../game/mission-engine";
import type {
  MissionDef,
  MissionScope,
  MissionState,
} from "../game/mission-types";
import { getHealthDataSource } from "../services/health-data-source-factory";

/** 일일 미션 올클리어(3개 전부 완료) 상태 */
interface AllClearState {
  /** 일일 미션이 전부 완료됐는지 */
  complete: boolean;
  /** 올클리어 보너스 포인트 */
  reward: number;
}

interface UseMissionsState {
  daily: MissionState[];
  weekly: MissionState[];
  monthly: MissionState[];
  allClear: AllClearState;
  /** 미션으로 누적 적립된 총 포인트 */
  missionPoints: number;
  loading: boolean;
  refresh: () => void;
  /** 특정 주기의 슬롯을 다른 미션으로 교체 (직접 선택) */
  chooseMission: (
    scope: MissionScope,
    slotIndex: number,
    missionId: string
  ) => Promise<void>;
  /** 특정 슬롯을 자동 선택으로 되돌림 */
  revertSlot: (scope: MissionScope, slotIndex: number) => Promise<void>;
}

/** 오늘 0시 기준 Date */
function startOfToday(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * 저장된 선택(오버라이드)이 있으면 그걸로, 없으면 자동 선택으로 미션 세트를 확정.
 * 저장값이 풀 변경 등으로 깨지면(길이 불일치/미존재 id) 자동 선택으로 안전 복귀.
 */
async function resolveScope(
  scope: MissionScope,
  autoDefs: MissionDef[],
  periodKey: string
): Promise<MissionDef[]> {
  const stored = await getSelection(scope, periodKey);
  if (!stored) return autoDefs;
  const defs = stored.map((id) => MISSION_BY_ID[id]).filter(Boolean);
  return defs.length === autoDefs.length ? defs : autoDefs;
}

/**
 * 일일/주간/월간 미션 상태를 계산하고, 완료된 미션의 보상을 자동 적립하는 훅.
 * - 기본은 자동 선택, 사용자가 바꾼 슬롯은 저장된 선택을 우선 사용
 * - 같은 기간 같은 미션은 1회만 적립(claimKey로 중복 방지)
 * - 일일 3개 전부 완료 시 올클리어 보너스 적립
 */
export function useMissions(
  stepGoal: number = DEFAULT_DAILY_GOALS.steps
): UseMissionsState {
  const [daily, setDaily] = useState<MissionState[]>([]);
  const [weekly, setWeekly] = useState<MissionState[]>([]);
  const [monthly, setMonthly] = useState<MissionState[]>([]);
  const [allClear, setAllClear] = useState<AllClearState>({
    complete: false,
    reward: MISSION_REWARDS.dailyAllClear,
  });
  const [missionPoints, setMissionPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const source = getHealthDataSource();
      const now = new Date();
      const keys = periodKeys(now);

      // 스냅샷 최신화 (오늘 포함) + 오늘 운동 시작시각(시간대 미션용)
      const snapshots = await syncSnapshots(source, stepGoal);
      const todayStart = startOfToday(now);
      const hc = await source.getWorkouts(todayStart, now).catch(() => []);
      const manual = await getManualWorkouts(todayStart, now);
      const todayWorkoutISOs = [
        ...hc.map((w) => w.startDate),
        ...manual.map((m) => m.startDate),
      ];

      const ctx = buildMissionContext(
        snapshots,
        todayWorkoutISOs,
        stepGoal,
        now
      );

      // 자동 선택 → 저장된 직접 선택이 있으면 덮어쓰기
      const auto = selectMissions(keys);
      const [dailyDefs, weeklyDefs, monthlyDefs] = await Promise.all([
        resolveScope("daily", auto.daily, keys.daily),
        resolveScope("weekly", auto.weekly, keys.weekly),
        resolveScope("monthly", auto.monthly, keys.monthly),
      ]);

      const dailyStates = dailyDefs.map((d) =>
        computeMissionState(d, ctx, keys)
      );
      const weeklyStates = weeklyDefs.map((d) =>
        computeMissionState(d, ctx, keys)
      );
      const monthlyStates = monthlyDefs.map((d) =>
        computeMissionState(d, ctx, keys)
      );

      // 완료된 미션 자동 적립 (이미 받은 건 건너뜀)
      const claimed = await getClaimedKeys();
      const all = [...dailyStates, ...weeklyStates, ...monthlyStates];
      for (const m of all) {
        if (m.complete && !claimed.has(m.claimKey)) {
          await claimMission(m.claimKey, m.def.scope, m.reward);
        }
      }

      // 일일 올클리어 보너스 (3개 전부 완료 시 1회)
      const dailyAllDone =
        dailyStates.length > 0 && dailyStates.every((m) => m.complete);
      if (dailyAllDone) {
        const allClearKey = `daily:${keys.daily}:__allclear__`;
        if (!claimed.has(allClearKey)) {
          await claimMission(
            allClearKey,
            "daily",
            MISSION_REWARDS.dailyAllClear
          );
        }
      }

      const total = await getTotalMissionPoints();

      setDaily(dailyStates);
      setWeekly(weeklyStates);
      setMonthly(monthlyStates);
      setAllClear({
        complete: dailyAllDone,
        reward: MISSION_REWARDS.dailyAllClear,
      });
      setMissionPoints(total);
    } catch (e) {
      // 실패해도 빈 미션 목록으로 안전하게 표시 (초기 상태 유지)
      console.error("[useMissions] 미션 계산 실패:", e);
    } finally {
      setLoading(false);
    }
  }, [stepGoal]);

  useEffect(() => {
    load();
  }, [load]);

  // 현재 기간의 선택 세트(id 배열)를 구해 한 슬롯만 교체 후 저장
  const applySlot = useCallback(
    async (scope: MissionScope, slotIndex: number, missionId: string) => {
      const keys = periodKeys(new Date());
      const autoIds = selectMissions(keys)[scope].map((d) => d.id);
      const stored = await getSelection(scope, keys[scope]);
      // 저장값이 슬롯 수와 맞을 때만 사용, 아니면 자동 기준에서 시작
      const ids =
        stored && stored.length === autoIds.length ? [...stored] : [...autoIds];
      ids[slotIndex] = missionId;
      await setSelection(scope, keys[scope], ids);
      await load();
    },
    [load]
  );

  const chooseMission = useCallback(
    (scope: MissionScope, slotIndex: number, missionId: string) =>
      applySlot(scope, slotIndex, missionId),
    [applySlot]
  );

  const revertSlot = useCallback(
    (scope: MissionScope, slotIndex: number) => {
      // 자동 선택의 해당 슬롯 미션 id로 되돌림
      const keys = periodKeys(new Date());
      const autoId = selectMissions(keys)[scope][slotIndex]?.id;
      if (!autoId) return Promise.resolve();
      return applySlot(scope, slotIndex, autoId);
    },
    [applySlot]
  );

  return {
    daily,
    weekly,
    monthly,
    allClear,
    missionPoints,
    loading,
    refresh: load,
    chooseMission,
    revertSlot,
  };
}
