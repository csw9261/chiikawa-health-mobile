import { useCallback, useEffect, useState } from "react";
import type { WorkoutCategory } from "../config/health-config";
import { getManualWorkouts } from "../db/workout-store";
import { getHealthDataSource } from "../services/health-data-source-factory";

/** 화면 표시용 통합 운동 항목 (Health Connect + 수동 기록 공통 형태) */
export interface WorkoutItem {
  key: string;
  category: WorkoutCategory;
  startDate: string;
  durationSeconds: number;
  distanceMeters?: number;
  calories?: number;
  source?: string;
  /** 수동 기록 여부 (삭제 가능 표시용) */
  manual: boolean;
  /** 수동 기록일 때의 DB id (삭제용) */
  manualId?: number;
}

interface UseWorkoutsState {
  items: WorkoutItem[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * 기간 내 운동 목록을 Health Connect + 로컬 수동 기록에서 합쳐 로드.
 * 최신순 정렬. 실패해도 가능한 데이터는 보여주고 에러만 표시.
 */
export function useWorkouts(from: Date, to: Date): UseWorkoutsState {
  const [items, setItems] = useState<WorkoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fromKey = from.toISOString();
  const toKey = to.toISOString();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const fromDate = new Date(fromKey);
    const toDate = new Date(toKey);

    // 수동 기록은 항상 로드 (로컬이라 실패 거의 없음)
    let manualItems: WorkoutItem[] = [];
    try {
      const manual = await getManualWorkouts(fromDate, toDate);
      manualItems = manual.map((m) => ({
        key: `manual-${m.id}`,
        category: m.category,
        startDate: m.startDate,
        durationSeconds: m.durationSeconds,
        distanceMeters: m.distanceMeters,
        calories: m.calories,
        source: "직접 기록",
        manual: true,
        manualId: m.id,
      }));
    } catch (e) {
      console.error("[useWorkouts] 수동 기록 로드 실패:", e);
    }

    // Health Connect 기록은 실패할 수 있음 (권한 등) → 에러만 표시하고 수동 기록은 유지
    let hcItems: WorkoutItem[] = [];
    try {
      const source = getHealthDataSource();
      const workouts = await source.getWorkouts(fromDate, toDate);
      hcItems = workouts.map((w) => ({
        key: `hc-${w.id}`,
        category: w.category,
        startDate: w.startDate,
        durationSeconds: w.durationSeconds,
        distanceMeters: w.distanceMeters,
        calories: w.calories,
        source: w.source,
        manual: false,
      }));
    } catch (e) {
      setError("자동 운동 기록을 불러오지 못했어요.");
      console.error("[useWorkouts] HC 기록 로드 실패:", e);
    }

    // 합치고 최신순 정렬
    const merged = [...manualItems, ...hcItems].sort((a, b) =>
      b.startDate.localeCompare(a.startDate)
    );
    setItems(merged);
    setLoading(false);
  }, [fromKey, toKey]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, error, refresh: load };
}
