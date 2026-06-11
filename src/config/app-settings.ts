// 앱 설정 타입과 기본값.
// 목표값, 메인 캐릭터, 알림 시간 등 사용자가 바꿀 수 있는 설정을 정의함.

import { DEFAULT_DAILY_GOALS } from "./health-config";

/** 하루 목표 (걸음 중심) */
export interface DailyGoals {
  steps: number;
}

/** 데일리 리마인더 알림 설정 */
export interface ReminderSettings {
  /** 알림 사용 여부 */
  enabled: boolean;
  /** 알림 시각 (24시간제 시) */
  hour: number;
  /** 알림 시각 (분) */
  minute: number;
}

/** 앱 전체 설정 */
export interface AppSettings {
  goals: DailyGoals;
  /** 홈에서 응원하는 메인 캐릭터 id */
  mainCharacterId: string;
  reminder: ReminderSettings;
  /** 포인트 환전(차감) 비밀번호 — 남편만 차감하도록 보호하는 소프트 잠금 */
  redeemPin: string;
}

/** 포인트 환전 비밀번호 기본값 */
export const DEFAULT_REDEEM_PIN = "940506";

/** 기본 설정값 */
export const DEFAULT_SETTINGS: AppSettings = {
  goals: { ...DEFAULT_DAILY_GOALS },
  mainCharacterId: "chiikawa",
  // 기본 알림: 저녁 7시, 비활성 (사용자가 켜면 동작)
  reminder: { enabled: false, hour: 19, minute: 0 },
  redeemPin: DEFAULT_REDEEM_PIN,
};
