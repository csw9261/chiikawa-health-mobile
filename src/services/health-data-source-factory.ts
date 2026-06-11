// HealthDataSource 팩토리.
// 실행 플랫폼(네이티브 앱 vs 웹 브라우저)에 따라 적절한 구현체를 주입함.
// 상위 코드는 이 함수만 호출하고 구체 구현을 알 필요가 없음 (DIP).

import { Capacitor } from "@capacitor/core";
import { CapacitorHealthDataSource } from "./capacitor-health-data-source";
import type { HealthDataSource } from "./health-data-source";
import { MockHealthDataSource } from "./mock-health-data-source";

// 싱글턴 — 앱 전체에서 동일 인스턴스 재사용
let instance: HealthDataSource | null = null;

/**
 * 현재 플랫폼에 맞는 HealthDataSource를 반환.
 * - 네이티브(Android/iOS): Health Connect/HealthKit 래퍼
 * - 웹 브라우저: 목 데이터 소스
 */
export function getHealthDataSource(): HealthDataSource {
  if (instance) return instance;
  instance = Capacitor.isNativePlatform()
    ? new CapacitorHealthDataSource()
    : new MockHealthDataSource();
  return instance;
}
