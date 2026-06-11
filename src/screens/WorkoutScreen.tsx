import { useMemo, useState } from "react";
import { WORKOUT_CATEGORY_META } from "../config/health-config";
import { deleteManualWorkout } from "../db/workout-store";
import {
  formatClock,
  formatDateHeader,
  formatDistance,
  formatDuration,
  isoToDateKey,
} from "../format/workout-format";
import { useWorkouts, type WorkoutItem } from "../hooks/use-workouts";
import { ManualWorkoutForm } from "../components/ManualWorkoutForm";
import { WorkoutCalendar } from "../components/WorkoutCalendar";
import { ShareButton } from "../components/ShareButton";
import { useProgressContext } from "../contexts/progress-context";
import { buildWorkoutShare } from "../share/share-text-builders";

// 한 번에 불러올 과거 기록 범위 (년).
// 리스트의 연도 선택·달력의 월 이동이 모두 이 범위 안에서 동작함.
const LOAD_LOOKBACK_YEARS = 5;

// 운동 탭 내부 서브탭
type WorkoutTab = "list" | "calendar";

/** 운동 카드 한 장 */
function WorkoutCard({
  item,
  onDelete,
}: {
  item: WorkoutItem;
  onDelete: (id: number) => void;
}) {
  const meta = WORKOUT_CATEGORY_META[item.category];
  return (
    <div className="blob-card flex items-center gap-3 p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream text-2xl">
        {meta.emoji}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-cocoa">{meta.label}</span>
          {item.manual && (
            <span className="rounded-full bg-sky/40 px-2 py-0.5 text-[10px] text-cocoa/60">
              직접 기록
            </span>
          )}
        </div>
        <p className="text-xs text-cocoa/50">
          {formatClock(item.startDate)} · {formatDuration(item.durationSeconds)}
        </p>
        <div className="mt-1 flex gap-3 text-xs text-cocoa/70">
          {item.distanceMeters !== undefined && (
            <span>📍 {formatDistance(item.distanceMeters)}</span>
          )}
          {item.calories !== undefined && <span>🔥 {item.calories}kcal</span>}
        </div>
      </div>
      {/* 수동 기록만 삭제 가능 (HC 데이터는 읽기 전용) */}
      {item.manual && item.manualId !== undefined && (
        <button
          onClick={() => onDelete(item.manualId!)}
          className="text-cocoa/30 hover:text-red-400"
          aria-label="기록 삭제"
        >
          ✕
        </button>
      )}
    </div>
  );
}

/** 날짜별로 묶인 운동 그룹 (리스트 탭에서 헤더 + 카드 묶음 렌더용) */
interface DateGroup {
  dateKey: string;
  items: WorkoutItem[];
}

/**
 * 운동 목록을 날짜 키별로 묶음. items는 이미 최신순이라 그룹 순서/내부 순서 모두 최신순 유지.
 */
function groupByDate(items: WorkoutItem[]): DateGroup[] {
  const groups: DateGroup[] = [];
  const indexByKey = new Map<string, number>();
  for (const item of items) {
    const dateKey = isoToDateKey(item.startDate);
    const existing = indexByKey.get(dateKey);
    if (existing === undefined) {
      indexByKey.set(dateKey, groups.length);
      groups.push({ dateKey, items: [item] });
    } else {
      groups[existing].items.push(item);
    }
  }
  return groups;
}

export function WorkoutScreen() {
  // 최근 LOAD_LOOKBACK_YEARS년 범위 (한 번만 계산)
  const { from, to } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - LOAD_LOOKBACK_YEARS);
    start.setHours(0, 0, 0, 0);
    return { from: start, to: end };
  }, []);

  const { items, loading, error, refresh } = useWorkouts(from, to);
  // progress.refresh를 같이 호출해야 운동 기록 직후 해금/축하·포인트가 즉시 반영됨
  const { progress, refresh: refreshProgress } = useProgressContext();

  const [subTab, setSubTab] = useState<WorkoutTab>("list");
  // 리스트 탭에서 보여줄 연도 (기본: 올해)
  const [selectedYear, setSelectedYear] = useState<number>(() =>
    new Date().getFullYear()
  );
  // 달력에서 선택된 날짜 키 (없으면 미선택)
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  // 입력 폼 표시 + 폼에 미리 채울 날짜 (달력에서 특정 날 기록 시)
  const [formState, setFormState] = useState<{
    open: boolean;
    date?: Date;
  }>({ open: false });

  // 운동 목록 + 진행도(해금/포인트) 동시 새로고침
  const refreshAll = () => {
    refresh();
    refreshProgress();
  };

  const handleDelete = async (id: number) => {
    await deleteManualWorkout(id);
    refreshAll();
  };

  // 리스트 탭: 연도 선택 → 그 해 기록만 날짜별 그룹.
  // 선택 칩에는 데이터에 존재하는 연도 + 올해를 항상 포함해 내림차순으로 노출.
  const availableYears = useMemo(() => {
    const years = new Set<number>(
      items.map((i) => new Date(i.startDate).getFullYear())
    );
    years.add(new Date().getFullYear());
    return [...years].sort((a, b) => b - a);
  }, [items]);
  const yearItems = useMemo(
    () =>
      items.filter(
        (i) => new Date(i.startDate).getFullYear() === selectedYear
      ),
    [items, selectedYear]
  );
  const dateGroups = useMemo(() => groupByDate(yearItems), [yearItems]);

  // 달력 탭: 운동한 날짜 키 집합 + 선택된 날 기록
  const workoutDateKeys = useMemo(
    () => new Set(items.map((i) => isoToDateKey(i.startDate))),
    [items]
  );
  const selectedDayItems = useMemo(
    () =>
      selectedKey
        ? items.filter((i) => isoToDateKey(i.startDate) === selectedKey)
        : [],
    [items, selectedKey]
  );

  return (
    <div className="flex flex-col gap-4 px-5 pb-24 pt-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-cocoa">운동 기록</h1>
        <div className="flex items-center gap-2">
          {progress && (
            <ShareButton
              build={() =>
                buildWorkoutShare(
                  progress.totalWorkouts,
                  progress.workoutStreak.current
                )
              }
            />
          )}
          <button
            onClick={() => setFormState({ open: true })}
            className="rounded-full bg-peach px-4 py-2 text-sm font-bold text-white shadow-soft"
          >
            + 기록
          </button>
        </div>
      </header>

      {/* 서브탭: 리스트 / 달력 */}
      <div className="flex gap-1 rounded-full bg-cream p-1">
        {(
          [
            { key: "list", label: "📋 리스트" },
            { key: "calendar", label: "📅 달력" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            className={`flex-1 rounded-full py-2 text-sm font-bold transition ${
              subTab === t.key
                ? "bg-surface text-cocoa shadow-soft"
                : "text-cocoa/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-cocoa/50">{error}</p>}

      {loading ? (
        <p className="py-10 text-center text-sm text-cocoa/40">불러오는 중...</p>
      ) : subTab === "list" ? (
        // ── 리스트 탭: 연도 선택 + 그 해 날짜별 그룹 ──
        <div className="flex flex-col gap-4">
          {/* 연도 선택 칩 */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {availableYears.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  y === selectedYear
                    ? "bg-peach text-white"
                    : "bg-cream text-cocoa/50"
                }`}
              >
                {y}년
              </button>
            ))}
          </div>

          {yearItems.length === 0 ? (
            items.length === 0 ? (
              // 전체 기록 없음 - 캐릭터가 운동을 권유
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <div className="text-5xl opacity-60">🐭</div>
                <p className="text-sm text-cocoa/60">아직 기록이 없어요.</p>
                <p className="text-xs text-cocoa/40">
                  운동하면 자동으로 채워지고, 직접 기록도 추가할 수 있어요!
                </p>
              </div>
            ) : (
              // 다른 해엔 기록이 있지만 선택한 해만 비어있음
              <p className="py-16 text-center text-sm text-cocoa/40">
                {selectedYear}년에는 운동 기록이 없어요.
              </p>
            )
          ) : (
            dateGroups.map((group) => (
              <div key={group.dateKey} className="flex flex-col gap-2">
                <p className="px-1 text-xs font-bold text-cocoa/50">
                  {formatDateHeader(group.dateKey)}
                </p>
                {group.items.map((item) => (
                  <WorkoutCard
                    key={item.key}
                    item={item}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      ) : (
        // ── 달력 탭: 월 달력 + 선택한 날 기록 ──
        <div className="flex flex-col gap-4">
          <WorkoutCalendar
            workoutDateKeys={workoutDateKeys}
            selectedKey={selectedKey}
            onSelect={setSelectedKey}
          />

          {selectedKey ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-bold text-cocoa/50">
                  {formatDateHeader(selectedKey)}
                </p>
                <button
                  onClick={() =>
                    setFormState({
                      open: true,
                      // 선택한 날짜 키를 로컬 자정 기준 Date로 변환해 폼에 전달
                      date: new Date(`${selectedKey}T00:00:00`),
                    })
                  }
                  className="rounded-full bg-peach px-3 py-1.5 text-xs font-bold text-white"
                >
                  + 이 날에 기록
                </button>
              </div>
              {selectedDayItems.length === 0 ? (
                <p className="py-6 text-center text-xs text-cocoa/40">
                  이 날은 운동 기록이 없어요.
                </p>
              ) : (
                selectedDayItems.map((item) => (
                  <WorkoutCard
                    key={item.key}
                    item={item}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-cocoa/40">
              날짜를 선택하면 그 날의 운동을 볼 수 있어요.
            </p>
          )}
        </div>
      )}

      {formState.open && (
        <ManualWorkoutForm
          initialDate={formState.date}
          onClose={() => setFormState({ open: false })}
          onAdded={refreshAll}
        />
      )}
    </div>
  );
}
