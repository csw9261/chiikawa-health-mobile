// HealthDataSource의 네이티브 구현체.
// @capgo/capacitor-health 플러그인(= Android Health Connect / iOS HealthKit)을 감싸고,
// 플러그인 타입을 우리 도메인 타입으로 변환함. provider 세부사항은 이 파일 안에만 존재.

import { Health } from "@capgo/capacitor-health";
import type {
  AggregationType,
  HealthDataType,
  WorkoutType,
} from "@capgo/capacitor-health";
import type { WorkoutCategory } from "../config/health-config";
import { REQUESTED_READ_TYPES } from "../config/health-config";
import type {
  DailyMetrics,
  HealthDataSource,
  WorkoutSession,
} from "./health-data-source";

/** 필수 권한 — 이 셋이 모두 허용돼야 핵심 기능(활동 링)이 동작함 */
const REQUIRED_TYPES: HealthDataType[] = ["steps", "distance", "totalCalories"];

/**
 * 플러그인의 세부 운동 타입(WorkoutType)을 우리 도메인 카테고리로 매핑.
 * 매핑되지 않은 타입은 'other'로 폴백 (OCP: 새 타입 추가돼도 깨지지 않음).
 */
function mapWorkoutType(type: WorkoutType): WorkoutCategory {
  switch (type) {
    case "walking":
    case "wheelchairWalkPace":
      return "walking";
    case "running":
    case "runningTreadmill":
    case "wheelchairRunPace":
      return "running";
    case "cycling":
    case "bikingStationary": // 실내 사이클
    case "handCycling":
      return "cycling";
    case "hiking":
      return "hiking";
    case "strengthTraining":
    case "traditionalStrengthTraining":
    case "functionalStrengthTraining":
    case "weightlifting":
      return "strength";
    case "yoga":
    case "pilates":
    case "stretching":
    case "flexibility":
      return "yoga";
    case "jumpRope":
      return "jumpRope";
    default:
      return "other";
  }
}

/** Date를 로컬 기준 날짜 키(YYYY-MM-DD)로 변환 */
function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** 지정 날짜의 로컬 기준 하루 범위(자정~다음날 자정) ISO 문자열을 반환 */
function dayBounds(date: Date): { start: string; end: string; dateKey: string } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString(), dateKey: localDateKey(start) };
}

export class CapacitorHealthDataSource implements HealthDataSource {
  async isAvailable(): Promise<boolean> {
    try {
      const result = await Health.isAvailable();
      return result.available;
    } catch {
      // 사용 가능 여부 확인 실패 시 안전하게 false 반환 (앱이 죽지 않게)
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    const status = await Health.requestAuthorization({
      read: REQUESTED_READ_TYPES,
    });
    // 필수 타입이 모두 readAuthorized에 포함됐는지 확인
    return REQUIRED_TYPES.every((t) => status.readAuthorized.includes(t));
  }

  async getDailyMetrics(date: Date): Promise<DailyMetrics> {
    const { start, end, dateKey } = dayBounds(date);

    // 세 지표를 병렬로 일(day) 버킷 합계 집계 (칼로리는 하루 총 소모 칼로리)
    const [steps, distance, calories] = await Promise.all([
      this.sumForDay("steps", start, end),
      this.sumForDay("distance", start, end),
      this.sumForDay("totalCalories", start, end),
    ]);

    return {
      date: dateKey,
      steps,
      distanceMeters: distance,
      calories: calories,
    };
  }

  async getDailyMetricsRange(from: Date, to: Date): Promise<DailyMetrics[]> {
    // 범위 시작 자정 ~ 종료 다음날 자정
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1);
    const startIso = start.toISOString();
    const endIso = end.toISOString();

    // 세 지표를 각각 day 버킷으로 집계 → dateKey 기준 맵 구성 (칼로리는 하루 총 소모 칼로리)
    const [stepsMap, distMap, calMap] = await Promise.all([
      this.dayBucketMap("steps", startIso, endIso),
      this.dayBucketMap("distance", startIso, endIso),
      this.dayBucketMap("totalCalories", startIso, endIso),
    ]);

    // 범위 내 모든 날짜를 순회하며 0값 포함 채움
    const result: DailyMetrics[] = [];
    const cursor = new Date(start);
    while (cursor < end) {
      const key = localDateKey(cursor);
      result.push({
        date: key,
        steps: stepsMap.get(key) ?? 0,
        distanceMeters: distMap.get(key) ?? 0,
        calories: calMap.get(key) ?? 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return result;
  }

  /** 지정 지표를 day 버킷 sum으로 집계해 dateKey→값 맵으로 반환 */
  private async dayBucketMap(
    dataType: HealthDataType,
    startIso: string,
    endIso: string
  ): Promise<Map<string, number>> {
    const result = await Health.queryAggregated({
      dataType,
      startDate: startIso,
      endDate: endIso,
      bucket: "day",
      aggregation: "sum",
    });
    const map = new Map<string, number>();
    for (const s of result.samples) {
      const key = localDateKey(new Date(s.startDate));
      map.set(key, (map.get(key) ?? 0) + s.value);
    }
    return map;
  }

  /** 단일 지표를 하루 'sum' 집계로 조회. 결과 없으면 0 반환 */
  private async sumForDay(
    dataType: HealthDataType,
    start: string,
    end: string
  ): Promise<number> {
    const aggregation: AggregationType = "sum";
    const result = await Health.queryAggregated({
      dataType,
      startDate: start,
      endDate: end,
      bucket: "day",
      aggregation,
    });
    // 하루 범위라 버킷은 보통 0~1개. 전부 합산해 방어적으로 처리
    return result.samples.reduce((acc, s) => acc + s.value, 0);
  }

  async getWorkouts(from: Date, to: Date): Promise<WorkoutSession[]> {
    const result = await Health.queryWorkouts({
      startDate: from.toISOString(),
      endDate: to.toISOString(),
      ascending: false, // 최신순
    });

    return result.workouts.map((w) => ({
      // platformId가 있으면 그걸, 없으면 시작시각+타입으로 안정적 id 생성
      id: w.platformId ?? `${w.startDate}-${w.workoutType}`,
      category: mapWorkoutType(w.workoutType),
      startDate: w.startDate,
      endDate: w.endDate,
      durationSeconds: w.duration,
      distanceMeters: w.totalDistance,
      calories: w.totalEnergyBurned,
      source: w.sourceName,
    }));
  }

  async openSettings(): Promise<void> {
    try {
      await Health.openHealthConnectSettings();
    } catch {
      // 설정 화면을 못 열어도 앱 흐름은 계속 (사용자에게 별도 안내 가능)
    }
  }
}
