// 헬스 데이터 관련 상수 모음.
// 목표값, 요청 권한 종류, 운동 종류 매핑을 한 곳에서 관리함.
// (CLAUDE.md 규칙: 리터럴 하드코딩 금지, 상수는 config에 모음)

import type { HealthDataType } from "@capgo/capacitor-health";

/** 우리 앱이 다루는 운동 카테고리 (provider 중립적인 도메인 타입) */
export type WorkoutCategory =
  | "walking" // 걷기
  | "running" // 런닝
  | "cycling" // 사이클 (실내/실외 포함)
  | "hiking" // 등산
  | "strength" // 근력운동
  | "yoga" // 요가/스트레칭
  | "jumpRope" // 줄넘기
  | "other"; // 기타

/** 카테고리별 한글 라벨과 표시용 이모지 (캐릭터 이미지 도입 전 폴백 겸 보조 아이콘) */
export const WORKOUT_CATEGORY_META: Record<
  WorkoutCategory,
  { label: string; emoji: string }
> = {
  walking: { label: "걷기", emoji: "🚶" },
  running: { label: "런닝", emoji: "🏃" },
  cycling: { label: "사이클", emoji: "🚴" },
  hiking: { label: "등산", emoji: "🥾" },
  strength: { label: "근력운동", emoji: "💪" },
  yoga: { label: "요가/스트레칭", emoji: "🧘" },
  jumpRope: { label: "줄넘기", emoji: "🪢" },
  other: { label: "기타", emoji: "✨" },
};

/** 하루 목표 기본값. 사용자가 설정에서 덮어쓰기 전까지 사용 (Phase 2에서 Preferences 연동) */
export const DEFAULT_DAILY_GOALS = {
  steps: 8000, // 걸음 (앱의 핵심 지표 — 삼성헬스가 상시 기록하는 유일한 값)
} as const;

/**
 * Health Connect에 요청할 읽기 권한 데이터 타입.
 * 와이프 운동(걷기/런닝/실내사이클) 추적에 필요한 항목만 최소 요청 (개인정보 최소수집).
 */
export const REQUESTED_READ_TYPES: HealthDataType[] = [
  "steps",
  "distance",
  "totalCalories", // 하루 총 소모 칼로리 (삼성헬스가 상시 기록하는 종류)
  "workouts",
  "heartRate",
];
