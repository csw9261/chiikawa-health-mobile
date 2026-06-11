// 앱 전역 IndexedDB 정의 (Dexie).
// 같은 DB 이름에 인스턴스가 둘이면 충돌하므로, DB는 이 파일에서 한 번만 정의하고
// 도메인별 스토어(workout-store, progress-store)가 여기서 import 해 사용함.

import Dexie, { type Table } from "dexie";
import type { WorkoutCategory } from "../config/health-config";

/** 수동으로 기록한 운동 세션 */
export interface ManualWorkout {
  id?: number;
  category: WorkoutCategory;
  startDate: string; // ISO 8601
  durationSeconds: number;
  distanceMeters?: number;
  calories?: number;
  note?: string;
  createdAt: string; // ISO 8601
}

/** 키-값 메타 레코드 (해금 알림을 본 목록 등 잡다한 상태 저장) */
export interface KvRecord {
  key: string;
  value: string[];
}

/**
 * 날짜별 활동 스냅샷 (영속 누적의 단위).
 * 확정된 과거 날짜는 한 번만 기록되어 누적/포인트가 보존됨.
 * Health Connect 조회 범위가 슬라이딩이어도 이 스냅샷은 유지됨.
 */
export interface DailySnapshot {
  /** 날짜 키 (YYYY-MM-DD, 로컬) — PK */
  date: string;
  /** 그날 걸음 수 */
  steps: number;
  /** 그날 걸음 목표 달성 여부 (기록 시점 목표 기준으로 고정) */
  goalMet: boolean;
  /** 그날 운동 세션 수 (자동 + 수동) */
  workoutCount: number;
  /** 그날 카테고리별 운동 세션 수 */
  workoutsByCategory: Partial<Record<WorkoutCategory, number>>;
}

/** 포인트 환전(차감) 내역 */
export interface PointRedemption {
  id?: number;
  /** 차감 포인트(원) */
  amount: number;
  /** 메모 (어떤 선물로 환전했는지 등) */
  note?: string;
  /** 차감 일시 (ISO 8601) */
  redeemedAt: string;
}

/**
 * 미션 보상 수령 기록 (일일/주간/월간 미션).
 * 같은 기간의 같은 미션을 두 번 적립하지 않도록, 기간+미션 조합 키로 1회만 기록함.
 */
export interface MissionClaim {
  /** 수령 키 — `${scope}:${periodKey}:${missionId}` (PK) */
  key: string;
  /** 미션 주기 (daily | weekly | monthly) */
  scope: string;
  /** 적립된 보상 포인트 */
  points: number;
  /** 수령 일시 (ISO 8601) */
  claimedAt: string;
}

class ChikawaHealthDB extends Dexie {
  manualWorkouts!: Table<ManualWorkout, number>;
  kv!: Table<KvRecord, string>;
  dailySnapshots!: Table<DailySnapshot, string>;
  pointRedemptions!: Table<PointRedemption, number>;
  missionClaims!: Table<MissionClaim, string>;

  constructor() {
    super("ChikawaHealthDB");
    // v1: 수동 운동 기록
    this.version(1).stores({
      manualWorkouts: "++id, startDate, category",
    });
    // v2: 키-값 메타 (해금 알림 추적 등)
    this.version(2).stores({
      manualWorkouts: "++id, startDate, category",
      kv: "key",
    });
    // v3: 날짜별 스냅샷(영속 누적) + 포인트 환전 내역 (2차)
    this.version(3).stores({
      manualWorkouts: "++id, startDate, category",
      kv: "key",
      dailySnapshots: "date",
      pointRedemptions: "++id, redeemedAt",
    });
    // v4: 미션 보상 수령 기록 (일일/주간/월간 미션)
    this.version(4).stores({
      manualWorkouts: "++id, startDate, category",
      kv: "key",
      dailySnapshots: "date",
      pointRedemptions: "++id, redeemedAt",
      missionClaims: "key, scope",
    });
  }
}

/** 앱 전역 DB 싱글턴 */
export const db = new ChikawaHealthDB();
