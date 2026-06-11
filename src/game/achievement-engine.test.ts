import { describe, expect, it } from "vitest";
import {
  computeLevelInfo,
  computeProgressFromSnapshots,
  computeStreak,
} from "./achievement-engine";
import type { DailySnapshot } from "../db/app-database";
import type { WorkoutCategory } from "../config/health-config";

// 테스트용 스냅샷 생성 헬퍼
function snap(
  date: string,
  steps: number,
  goalMet: boolean,
  workoutCount = 0,
  cats: Partial<Record<WorkoutCategory, number>> = {}
): DailySnapshot {
  return { date, steps, goalMet, workoutCount, workoutsByCategory: cats };
}

describe("computeStreak", () => {
  it("빈 배열이면 0/0", () => {
    expect(computeStreak([])).toEqual({ current: 0, longest: 0 });
  });

  it("모두 달성하면 현재=최장=길이", () => {
    expect(computeStreak([true, true, true])).toEqual({ current: 3, longest: 3 });
  });

  it("중간에 끊기면 최장은 가장 긴 연속, 현재는 마지막 연속", () => {
    // t,t,f,t → 최장 2, 현재 1
    expect(computeStreak([true, true, false, true])).toEqual({
      current: 1,
      longest: 2,
    });
  });

  it("오늘(마지막) 미달성이면 어제까지의 연속을 현재로 유예", () => {
    // t,t,f → 현재 2
    expect(computeStreak([true, true, false]).current).toBe(2);
  });
});

describe("computeLevelInfo", () => {
  it("0 XP면 레벨 1, 다음 레벨 필요 2000", () => {
    expect(computeLevelInfo(0)).toEqual({
      level: 1,
      xpIntoLevel: 0,
      xpForNextLevel: 2000,
    });
  });

  it("2000 XP면 레벨 2 (다음 3000 필요)", () => {
    expect(computeLevelInfo(2000)).toEqual({
      level: 2,
      xpIntoLevel: 0,
      xpForNextLevel: 3000,
    });
  });

  it("5000 XP면 레벨 3 (2000+3000 소모)", () => {
    expect(computeLevelInfo(5000).level).toBe(3);
  });
});

describe("computeProgressFromSnapshots", () => {
  const snaps = [
    snap("2026-01-01", 9000, true, 1, { cycling: 1 }),
    snap("2026-01-02", 5000, false, 0, {}),
    snap("2026-01-03", 10000, true, 2, { running: 1, walking: 1 }),
  ];
  const p = computeProgressFromSnapshots(snaps);

  it("누적 지표", () => {
    expect(p.totalSteps).toBe(24000);
    expect(p.maxDaySteps).toBe(10000);
    expect(p.totalWorkouts).toBe(3);
    expect(p.daysGoalMet).toBe(2);
    expect(p.workoutsByCategory.cycling).toBe(1);
    expect(p.workoutCategoryCount).toBe(3);
  });

  it("XP 합 (900+100+300)+(500)+(1000+100+600) = 3500", () => {
    expect(p.totalXP).toBe(3500);
  });

  it("포인트 합 (450+200+500)+(250)+(500+200+1000) = 3100", () => {
    expect(p.activityPoints).toBe(3100);
  });

  it("걸음 연속일 (t,f,t → 현재1·최장1), 레벨 별칭", () => {
    expect(p.stepStreak).toEqual({ current: 1, longest: 1 });
    expect(p.workoutStreak).toEqual({ current: 1, longest: 1 });
    expect(p.level).toBe(p.levelInfo.level);
    expect(p.longestStreak).toBe(p.stepStreak.longest);
  });
});
