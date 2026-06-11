import { useCallback, useEffect, useState } from "react";
import { getHealthDataSource } from "../services/health-data-source-factory";
import type { DailyMetrics } from "../services/health-data-source";

/** 훅 상태: 로딩/에러/데이터/권한 거부 여부 */
interface DailyMetricsState {
  metrics: DailyMetrics | null;
  loading: boolean;
  /** 권한 거부 등으로 데이터를 못 읽은 경우 안내 메시지 (없으면 정상) */
  error: string | null;
  /** 다시 시도/새로고침 */
  refresh: () => void;
}

/**
 * 지정 날짜(기본 오늘)의 하루 지표를 로드하는 훅.
 * 마운트 시 가용성 확인 → 권한 요청 → 지표 조회 순으로 진행.
 * 실패 시 안전하게 0값 + 에러 메시지로 처리 (CLAUDE.md 에러처리 규칙).
 */
export function useDailyMetrics(date: Date = new Date()): DailyMetricsState {
  const [metrics, setMetrics] = useState<DailyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // date를 의존성으로 안정화 (Date 객체 동일성 문제 방지)
  const dateKey = date.toDateString();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const source = getHealthDataSource();
    try {
      const available = await source.isAvailable();
      if (!available) {
        setError("Health Connect를 사용할 수 없어요. 설치/설정을 확인해 주세요.");
        setMetrics(null);
        return;
      }
      const granted = await source.requestPermissions();
      if (!granted) {
        setError("건강 데이터 접근 권한이 필요해요.");
        setMetrics(null);
        return;
      }
      const result = await source.getDailyMetrics(new Date(dateKey));
      setMetrics(result);
    } catch (e) {
      // 예기치 못한 오류 — 사용자에게 알리고 데이터는 비움
      setError("운동 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      setMetrics(null);
      console.error("[useDailyMetrics] 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  }, [dateKey]);

  useEffect(() => {
    load();
  }, [load]);

  return { metrics, loading, error, refresh: load };
}
