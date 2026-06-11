// 미션 시스템 타입 정의.
// 미션은 "일정 기간(오늘/이번 주/이번 달) 안에 특정 수치를 채우면 보상"을 주는 단기 목표.
// 누적 업적(AchievementDef)과 달리 기간이 지나면 새 미션으로 회전함.

import type { WorkoutCategory } from "../config/health-config";

/** 미션 주기 */
export type MissionScope = "daily" | "weekly" | "monthly";

/**
 * 미션 진행도 판정에 쓰는 기간별 집계 컨텍스트.
 * 각 미션의 progress()가 이 컨텍스트를 받아 현재 수치를 계산함.
 */
export interface MissionContext {
  /** 하루 걸음 목표 (목표 달성 미션의 target으로 사용) */
  stepGoal: number;
  /** 오늘 집계 */
  daily: {
    steps: number; // 오늘 걸음
    workoutCount: number; // 오늘 운동 횟수
    goalMet: boolean; // 오늘 걸음 목표 달성 여부
    categoryCount: number; // 오늘 운동한 서로 다른 종목 수
    workoutsByCategory: Partial<Record<WorkoutCategory, number>>; // 오늘 종목별 운동 횟수
    morningWorkouts: number; // 오늘 아침 시간대 운동 횟수
    nightWorkouts: number; // 오늘 야간 시간대 운동 횟수
  };
  /** 이번 주(월~일) 집계 */
  weekly: {
    steps: number; // 주간 누적 걸음
    workoutCount: number; // 주간 누적 운동 횟수
    goalDays: number; // 주간 걸음 목표 달성 일수
    categoryCount: number; // 주간 경험한 서로 다른 종목 수
  };
  /** 이번 달 집계 */
  monthly: {
    steps: number; // 월간 누적 걸음
    workoutCount: number; // 월간 누적 운동 횟수
    goalDays: number; // 월간 걸음 목표 달성 일수
    categoryCount: number; // 월간 경험한 서로 다른 종목 수
  };
}

/** 미션 정의 (풀에 담겨 회전 선택됨) */
export interface MissionDef {
  /** 고유 id (보상 수령 키에 사용) */
  id: string;
  /** 주기 */
  scope: MissionScope;
  /** 표시용 이모지 */
  emoji: string;
  /** 미션 이름 */
  name: string;
  /** 조건 설명 */
  description: string;
  /** 달성 목표 수치. stepGoal처럼 동적이면 함수로 줄 수 있음 */
  target: number | ((ctx: MissionContext) => number);
  /** 컨텍스트에서 현재 진행 수치를 계산 */
  progress: (ctx: MissionContext) => number;
}

/** 계산된 미션 상태 (화면 표시용) */
export interface MissionState {
  def: MissionDef;
  /** 표시용 현재 수치 (target 초과분은 잘라 표시) */
  current: number;
  /** 실제 진행 수치 (클램프 전) */
  rawCurrent: number;
  /** 목표 수치 */
  target: number;
  /** 달성 여부 */
  complete: boolean;
  /** 이 미션 완료 시 받는 보상 포인트 */
  reward: number;
  /** 보상 수령 키 (기간+미션 조합) */
  claimKey: string;
}
