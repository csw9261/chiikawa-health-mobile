import { useCallback, useEffect, useState } from "react";
import type { DailyMetrics } from "../services/health-data-source";
import { getHealthDataSource } from "../services/health-data-source-factory";

interface RangeState {
  data: DailyMetrics[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * 오늘 기준 최근 days일의 일일 지표를 로드 (통계/히트맵용).
 * 가장 과거 → 오늘 순으로 정렬된 배열 반환.
 */
export function useDailyMetricsRange(days: number): RangeState {
  const [data, setData] = useState<DailyMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - (days - 1)); // days일 포함되도록
      const source = getHealthDataSource();
      const result = await source.getDailyMetricsRange(from, to);
      setData(result);
    } catch (e) {
      setError("통계를 불러오지 못했어요.");
      setData([]);
      console.error("[useDailyMetricsRange] 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
