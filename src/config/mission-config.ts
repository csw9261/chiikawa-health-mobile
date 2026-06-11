// 미션 시스템 상수 (일일/주간/월간 미션).
// 회전 개수·보상 규모·시간대 미션 판정 구간을 한 곳에서 관리 (밸런스 조정 용이).
// (CLAUDE.md 규칙: 리터럴 하드코딩 금지, 상수는 config에 모음)

import type { MissionScope } from "../game/mission-types";

/** 각 주기별로 하루/한 주/한 달에 노출할 미션 개수 */
export const MISSION_COUNTS = {
  daily: 3, // 일일 미션 (걸음 1 + 운동 1 + 보너스 1 구성)
  weekly: 2, // 주간 미션
  monthly: 1, // 월간 미션
} as const;

/** 미션 보상 포인트 (1 P = 1원) */
export const MISSION_REWARDS = {
  daily: 50, // 일일 미션 1개 완료
  dailyAllClear: 100, // 일일 미션 3개 전부 완료 시 추가 보너스
  weekly: 300, // 주간 미션 1개 완료
  monthly: 1000, // 월간 미션 1개 완료
} as const;

/** 주기별 미션 1개 완료 보상 포인트를 반환 */
export function rewardForScope(scope: MissionScope): number {
  return MISSION_REWARDS[scope];
}

/** 아침 운동 미션 판정 시간대 (시작 시각 기준, 24시간제) — 오전 6시 이상 ~ 10시 미만 */
export const MORNING_HOURS = { startInclusive: 6, endExclusive: 10 } as const;

/** 야간 운동 미션 판정 시작 시각 (이 시각 이상이면 야간) — 저녁 7시 이후 */
export const NIGHT_HOUR_START = 19;
