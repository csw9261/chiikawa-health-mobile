// 게이미피케이션 상수 (2차 확정값).
// 경험치(XP)·포인트 적립 규칙과 레벨 곡선을 한 곳에서 관리 (밸런스 조정 용이).
// 경험치(레벨)와 포인트는 별개 시스템임: XP=지위(안 줄어듦), 포인트=환전 화폐(차감됨).

/** 경험치(XP) 적립 규칙 — 사용자에게도 그대로 안내함 */
export const XP_RULES = {
  /** 걸음당 XP (10보 = 1 XP) */
  perStep: 1 / 10,
  /** 하루 걸음 목표 달성 시 보너스 XP */
  perGoalDay: 100,
  /** 운동 1회 기록 시 XP */
  perWorkout: 300,
} as const;

/** 포인트 적립 규칙 (1 포인트 = 1원, 한 달 꾸준히 ≈ 2~3만 포인트 목표) */
export const POINT_RULES = {
  /** 걸음당 포인트 (20보 = 1 P) */
  perStep: 1 / 20,
  /** 하루 걸음 목표 달성 시 보너스 P */
  perGoalDay: 200,
  /** 운동 1회 기록 시 P */
  perWorkout: 500,
} as const;

/**
 * 레벨업에 필요한 XP 곡선.
 * 레벨 L → L+1 에 필요한 XP = base + (L-1) * stepUp (초반 빠르게, 후반 천천히).
 */
export const LEVEL_CURVE = {
  base: 2000,
  stepUp: 1000,
} as const;
