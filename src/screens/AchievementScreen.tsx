import { CalendarHeatmap } from "../components/CalendarHeatmap";
import { LevelStreakCard } from "../components/LevelStreakCard";
import { PointsCard } from "../components/PointsCard";
import { ShareButton } from "../components/ShareButton";
import { WeeklyStepsChart } from "../components/WeeklyStepsChart";
import { ACHIEVEMENT_CATEGORY_META } from "../data/achievements";
import type { AchievementCategory } from "../game/player-progress-types";
import { useProgressContext } from "../contexts/progress-context";
import { useSettings } from "../contexts/settings-context";
import { useDailyMetricsRange } from "../hooks/use-daily-metrics-range";
import { usePoints } from "../hooks/use-points";
import { buildAchievementShare } from "../share/share-text-builders";

// 히트맵에 표시할 기간 (약 5주)
const HEATMAP_DAYS = 35;

// 업적 카테고리 표시 순서
const CATEGORY_ORDER: AchievementCategory[] = [
  "level",
  "steps",
  "goalDays",
  "stepStreak",
  "workouts",
  "workoutStreak",
  "variety",
  "categoryMastery",
  "dayPeak",
  "points",
];

export function AchievementScreen() {
  const { data, loading: statsLoading, error } = useDailyMetricsRange(HEATMAP_DAYS);
  const { progress, achievements } = useProgressContext();
  const { settings } = useSettings();
  const stepGoal = settings.goals.steps;

  // 포인트 잔액 (공유용)
  const earnedPoints = progress
    ? progress.activityPoints + progress.achievementPoints
    : 0;
  const { balance: pointBalance } = usePoints(earnedPoints);

  // 이번 주(최근 7일) 걸음 통계
  const last7 = data.slice(-7);
  const weekSteps = last7.reduce((acc, d) => acc + d.steps, 0);
  const avgSteps = last7.length > 0 ? Math.round(weekSteps / last7.length) : 0;
  const weekGoalDays = last7.filter((d) => d.steps >= stepGoal).length;

  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <div className="flex flex-col gap-4 px-5 pb-24 pt-6">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs text-cocoa/50">레벨 · 업적 · 통계</p>
          <h1 className="text-xl font-bold text-cocoa">성취</h1>
        </div>
        {progress && (
          <ShareButton
            build={() =>
              buildAchievementShare({
                level: progress.level,
                earnedAchievements: earnedCount,
                totalAchievements: achievements.length,
                stepStreakCurrent: progress.stepStreak.current,
                totalSteps: progress.totalSteps,
                pointBalance,
              })
            }
          />
        )}
      </header>

      {/* 레벨 + 연속일 카드 (상세 안내) */}
      {progress && <LevelStreakCard progress={progress} />}

      {/* 포인트 잔액 */}
      {progress && (
        <PointsCard
          earnedPoints={progress.activityPoints + progress.achievementPoints}
        />
      )}

      {/* 업적 (카테고리별) */}
      <section className="blob-card p-5">
        <h2 className="mb-3 text-sm font-bold text-cocoa">
          업적 ({earnedCount}/{achievements.length})
        </h2>
        <div className="flex flex-col gap-4">
          {CATEGORY_ORDER.map((cat) => {
            const items = achievements.filter((a) => a.def.category === cat);
            if (items.length === 0) return null;
            const meta = ACHIEVEMENT_CATEGORY_META[cat];
            const got = items.filter((a) => a.earned).length;
            return (
              <div key={cat}>
                <p className="mb-2 text-xs font-bold text-cocoa/60">
                  {meta.emoji} {meta.label} ({got}/{items.length})
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {items.map(({ def, earned }) => (
                    <div
                      key={def.id}
                      className={`flex flex-col items-center gap-1 ${earned ? "" : "opacity-30 grayscale"}`}
                      title={`${def.description} · +${def.points}P`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream text-2xl">
                        {earned ? def.emoji : "🔒"}
                      </div>
                      <p className="text-center text-[9px] leading-tight text-cocoa/60">
                        {def.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {error && <p className="text-xs text-cocoa/50">{error}</p>}
      {statsLoading ? (
        <p className="py-6 text-center text-sm text-cocoa/40">통계 불러오는 중...</p>
      ) : (
        <>
          {/* 이번 주 걸음 요약 */}
          <section className="blob-card grid grid-cols-3 gap-2 p-5 text-center">
            <div>
              <p className="text-lg font-bold text-peach">
                {weekSteps.toLocaleString()}
              </p>
              <p className="text-[11px] text-cocoa/50">주간 걸음</p>
            </div>
            <div>
              <p className="text-lg font-bold text-sky">
                {avgSteps.toLocaleString()}
              </p>
              <p className="text-[11px] text-cocoa/50">일평균 걸음</p>
            </div>
            <div>
              <p className="text-lg font-bold text-sunny">{weekGoalDays}일</p>
              <p className="text-[11px] text-cocoa/50">목표 달성</p>
            </div>
          </section>

          {/* 주간 걸음 막대 그래프 */}
          <section className="blob-card p-5">
            <h2 className="mb-2 text-sm font-bold text-cocoa">최근 7일 걸음</h2>
            <WeeklyStepsChart data={data} stepGoal={stepGoal} />
          </section>

          {/* 캘린더 히트맵 */}
          <section className="blob-card p-5">
            <h2 className="mb-3 text-sm font-bold text-cocoa">
              최근 {HEATMAP_DAYS}일 활동
            </h2>
            <CalendarHeatmap data={data} stepGoal={stepGoal} />
          </section>
        </>
      )}
    </div>
  );
}
