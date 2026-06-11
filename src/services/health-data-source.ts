// 헬스 데이터 소스 추상화 (DIP).
// 상위 코드(화면, 게임 엔진)는 이 인터페이스에만 의존하고,
// Health Connect 같은 구현 세부사항은 팩토리가 주입함.
// 덕분에 브라우저에서는 목 구현으로, 실기기에서는 네이티브 구현으로 교체 가능.

import type { WorkoutCategory } from "../config/health-config";

/** 하루 단위 집계 지표 */
export interface DailyMetrics {
  /** 날짜 (YYYY-MM-DD, 로컬 기준) */
  date: string;
  /** 걸음 수 */
  steps: number;
  /** 이동 거리(m) */
  distanceMeters: number;
  /** 하루 총 소모 칼로리(kcal) — 기초대사 + 활동 */
  calories: number;
}

/** 개별 운동 세션 (Health Connect ExerciseSession / HealthKit Workout 추상화) */
export interface WorkoutSession {
  /** 고유 식별자 (네이티브 platformId 우선, 없으면 시작시각 기반 생성) */
  id: string;
  /** 운동 카테고리 (provider 운동 타입을 우리 도메인으로 매핑한 값) */
  category: WorkoutCategory;
  /** 시작 시각 (ISO 8601) */
  startDate: string;
  /** 종료 시각 (ISO 8601) */
  endDate: string;
  /** 운동 시간(초) */
  durationSeconds: number;
  /** 이동 거리(m) - 데이터 있을 때만 */
  distanceMeters?: number;
  /** 소모 칼로리(kcal) - 데이터 있을 때만 */
  calories?: number;
  /** 데이터 출처명 (예: Samsung Health) */
  source?: string;
}

/** 헬스 데이터 소스 인터페이스. 구현체는 이 계약을 완전히 만족해야 함 (LSP) */
export interface HealthDataSource {
  /** 현재 플랫폼에서 헬스 데이터 SDK 사용 가능 여부 */
  isAvailable(): Promise<boolean>;
  /**
   * 읽기 권한 요청. 사용자에게 권한 다이얼로그를 띄움.
   * @returns 필수 권한(걸음/거리/칼로리)이 모두 허용됐는지 여부
   */
  requestPermissions(): Promise<boolean>;
  /** 지정한 날짜의 하루 집계 지표 조회 */
  getDailyMetrics(date: Date): Promise<DailyMetrics>;
  /**
   * 기간 내 날짜별 하루 지표 목록 조회 (통계/스트릭용).
   * from(포함)부터 to(포함)까지 하루 단위. 데이터 없는 날도 0값으로 채워 반환.
   */
  getDailyMetricsRange(from: Date, to: Date): Promise<DailyMetrics[]>;
  /** 기간 내 운동 세션 목록 조회 (최신순) */
  getWorkouts(from: Date, to: Date): Promise<WorkoutSession[]>;
  /** Health Connect 설정 화면 열기 (권한 관리/설치 유도). 미지원 플랫폼에선 no-op */
  openSettings(): Promise<void>;
}
