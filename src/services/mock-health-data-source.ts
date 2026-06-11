// HealthDataSource의 브라우저(웹) 목 구현체.
// 네이티브 헬스 SDK가 없는 환경에서 UI를 개발/프리뷰하기 위한 가짜 데이터 제공.
// 날짜를 시드로 사용해 같은 날엔 항상 같은 값이 나오도록 함 (프리뷰 안정성).

import type { WorkoutCategory } from "../config/health-config";
import type {
  DailyMetrics,
  HealthDataSource,
  WorkoutSession,
} from "./health-data-source";

/** 날짜 문자열을 정수 시드로 변환 (간단한 해시) */
function seedFromDate(date: Date): number {
  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % 1_000_000;
  }
  return hash;
}

/** 시드 기반 의사난수 [0,1) — Math.random 대신 결정적 값 생성 */
function seededRandom(seed: number): number {
  // 선형 합동 생성기 한 스텝
  const next = (seed * 1103515245 + 12345) % 2147483648;
  return next / 2147483648;
}

export class MockHealthDataSource implements HealthDataSource {
  async isAvailable(): Promise<boolean> {
    return true;
  }

  async requestPermissions(): Promise<boolean> {
    // 목 환경에선 항상 허용된 것으로 처리
    return true;
  }

  async getDailyMetrics(date: Date): Promise<DailyMetrics> {
    const seed = seedFromDate(date);
    const r = seededRandom(seed);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    // 4000~11000 걸음 범위로 그럴듯하게 생성
    const steps = Math.round(4000 + r * 7000);
    // 걸음당 평균 0.7m로 거리 추정
    const distanceMeters = Math.round(steps * 0.7);
    // 하루 총 소모 칼로리 모사: 기초대사(약 1400) + 걸음 기반 활동분
    const calories = 1400 + Math.round((steps / 1000) * 40);

    return { date: dateKey, steps, distanceMeters, calories };
  }

  async getDailyMetricsRange(from: Date, to: Date): Promise<DailyMetrics[]> {
    const result: DailyMetrics[] = [];
    const cursor = new Date(from);
    cursor.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(0, 0, 0, 0);
    // from~to 포함 범위를 하루씩 순회하며 날짜 기반 결정적 값 생성
    while (cursor <= end) {
      result.push(await this.getDailyMetrics(new Date(cursor)));
      cursor.setDate(cursor.getDate() + 1);
    }
    return result;
  }

  async getWorkouts(from: Date, _to: Date): Promise<WorkoutSession[]> {
    // 오늘 기준 가짜 운동 세션 2개 반환
    const base = new Date(from);
    const make = (
      category: WorkoutCategory,
      offsetHours: number,
      durationMin: number,
      distanceMeters: number | undefined,
      calories: number
    ): WorkoutSession => {
      const start = new Date(base);
      start.setHours(7 + offsetHours, 0, 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + durationMin);
      return {
        id: `mock-${category}-${start.toISOString()}`,
        category,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        durationSeconds: durationMin * 60,
        distanceMeters,
        calories,
        source: "Mock (브라우저)",
      };
    };

    return [
      make("running", 1, 32, 5200, 280),
      make("cycling", 10, 45, undefined, 320), // 실내 사이클 (거리 없음)
    ];
  }

  async openSettings(): Promise<void> {
    // 웹에서는 할 일 없음
  }
}
