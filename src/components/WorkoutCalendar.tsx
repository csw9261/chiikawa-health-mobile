import { useMemo, useState } from "react";
import { toDateKey } from "../format/workout-format";

interface WorkoutCalendarProps {
  /** 운동 기록이 있는 날짜 키("YYYY-MM-DD") 집합 — 작은 점 표시용 */
  workoutDateKeys: Set<string>;
  /** 현재 선택된 날짜 키 (없으면 null) */
  selectedKey: string | null;
  /** 날짜 셀 탭 시 호출 */
  onSelect: (key: string) => void;
}

// 요일 헤더 (일요일 시작)
const WEEKDAY_HEADERS = ["일", "월", "화", "수", "목", "금", "토"];

/** 달력에 그릴 한 칸. day가 null이면 이전/다음 달 자리(빈 칸) */
interface CalendarCell {
  day: number | null;
  key: string | null;
}

/**
 * 지정 연/월의 달력 셀 배열을 생성.
 * 1일의 요일만큼 앞을 빈 칸으로 채워 주차 정렬을 맞춤.
 */
function buildMonthCells(year: number, month: number): CalendarCell[] {
  // month는 0-base. 해당 월 1일의 요일(0=일)과 말일 일수 계산
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: CalendarCell[] = [];
  // 1일 앞쪽 빈 칸
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ day: null, key: null });
  }
  // 실제 날짜
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, key: toDateKey(new Date(year, month, day)) });
  }
  return cells;
}

/**
 * 월 단위 운동 달력.
 * 운동한 날 아래에 작은 점을 찍고, 날짜를 탭하면 onSelect로 알림.
 * 월 이동은 컴포넌트 내부 상태로 관리.
 */
export function WorkoutCalendar({
  workoutDateKeys,
  selectedKey,
  onSelect,
}: WorkoutCalendarProps) {
  // 처음에는 이번 달을 보여줌
  const [view, setView] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const cells = useMemo(
    () => buildMonthCells(view.year, view.month),
    [view.year, view.month]
  );

  // 이전/다음 달로 이동 (월 경계 넘어가면 연도 보정)
  const moveMonth = (delta: number) => {
    setView((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  return (
    <div className="blob-card p-4">
      {/* 월 이동 헤더 */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => moveMonth(-1)}
          className="h-8 w-8 rounded-full bg-cream text-cocoa/60"
          aria-label="이전 달"
        >
          ‹
        </button>
        <span className="text-sm font-bold text-cocoa">
          {view.year}년 {view.month + 1}월
        </span>
        <button
          onClick={() => moveMonth(1)}
          className="h-8 w-8 rounded-full bg-cream text-cocoa/60"
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="mb-1 grid grid-cols-7 text-center text-[11px] text-cocoa/40">
        {WEEKDAY_HEADERS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((cell, i) => {
          // 빈 칸은 클릭 불가
          if (cell.day === null || cell.key === null) {
            return <div key={`empty-${i}`} />;
          }
          const hasWorkout = workoutDateKeys.has(cell.key);
          const isSelected = cell.key === selectedKey;
          const isToday = cell.key === todayKey;
          return (
            <button
              key={cell.key}
              onClick={() => onSelect(cell.key!)}
              className="flex flex-col items-center justify-center py-1.5"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition ${
                  isSelected
                    ? "bg-peach font-bold text-white"
                    : isToday
                      ? "bg-cream font-bold text-cocoa"
                      : "text-cocoa/70"
                }`}
              >
                {cell.day}
              </span>
              {/* 운동한 날 작은 점 (선택된 날은 흰 점으로 대비) */}
              <span
                className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                  hasWorkout
                    ? isSelected
                      ? "bg-white"
                      : "bg-peach"
                    : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
