import { DEFAULT_DAILY_GOALS } from "../config/health-config";
import type { DailyMetrics } from "../services/health-data-source";

interface CalendarHeatmapProps {
  /** 가장 과거 → 오늘 순의 일일 지표 */
  data: DailyMetrics[];
  /** 달성률 계산 걸음 목표 (기본: 기본 목표값) */
  stepGoal?: number;
}

/**
 * 걸음 달성률(0~1+)에 따른 셀 색상.
 * 달성률이 높을수록 진한 peach. 0이면 빈 칸 색.
 */
function cellColor(progress: number): string {
  if (progress <= 0) return "#f3e9e9"; // 데이터 없음/0
  if (progress < 0.33) return "#ffe0e0";
  if (progress < 0.66) return "#ffc9c9";
  if (progress < 1) return "#ffaeae";
  return "#ff8f8f"; // 목표 달성
}

/** GitHub 잔디 스타일 캘린더 히트맵. 걸음 목표 달성 정도를 색으로 표현 */
export function CalendarHeatmap({
  data,
  stepGoal = DEFAULT_DAILY_GOALS.steps,
}: CalendarHeatmapProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {data.map((d) => {
        const progress = d.steps / stepGoal;
        const day = new Date(d.date + "T00:00:00").getDate();
        return (
          <div
            key={d.date}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[9px] text-cocoa/40"
            style={{ backgroundColor: cellColor(progress) }}
            title={`${d.date} · ${d.steps.toLocaleString()}걸음`}
          >
            {day}
          </div>
        );
      })}
    </div>
  );
}
