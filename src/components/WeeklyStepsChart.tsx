import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import { DEFAULT_DAILY_GOALS } from "../config/health-config";
import type { DailyMetrics } from "../services/health-data-source";

interface WeeklyStepsChartProps {
  /** 가장 과거 → 오늘 순의 일일 지표 (최근 7일 권장) */
  data: DailyMetrics[];
  /** 달성 판정 걸음 목표 (기본: 기본 목표값) */
  stepGoal?: number;
}

const COLOR_DONE = "#ffb1b1"; // 목표 달성 막대 (peach)
const COLOR_PARTIAL = "#ffe0e0"; // 미달성 막대 (연한 peach)

/** 날짜 키(YYYY-MM-DD)에서 요일 라벨 추출 */
function weekdayLabel(dateKey: string): string {
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const d = new Date(dateKey + "T00:00:00");
  return weekdays[d.getDay()];
}

/** 최근 7일 걸음 수 막대 그래프. 목표 달성일은 진한 색으로 강조 */
export function WeeklyStepsChart({
  data,
  stepGoal = DEFAULT_DAILY_GOALS.steps,
}: WeeklyStepsChartProps) {
  // 최근 7개만 사용
  const recent = data.slice(-7).map((d) => ({
    label: weekdayLabel(d.date),
    steps: d.steps,
    done: d.steps >= stepGoal,
  }));

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={recent} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#6b5b4f" }}
            axisLine={false}
            tickLine={false}
          />
          <Bar dataKey="steps" radius={[6, 6, 0, 0]}>
            {recent.map((entry, i) => (
              <Cell key={i} fill={entry.done ? COLOR_DONE : COLOR_PARTIAL} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
