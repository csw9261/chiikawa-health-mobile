import { XP_RULES } from "../config/gamification-config";
import type { PlayerProgress } from "../game/player-progress-types";

// 레벨 안내 + 연속일(걸음/운동) 분리 표시 카드.
// "무엇을 하면 XP가 얼마 오르는지", "다음 레벨까지 얼마 남았는지",
// "어떤 연속인지"를 사용자가 바로 이해하도록 명시함.

interface LevelStreakCardProps {
  progress: PlayerProgress;
}

export function LevelStreakCard({ progress }: LevelStreakCardProps) {
  const { levelInfo, stepStreak, workoutStreak } = progress;
  // 현재 레벨 진행률 (0~1)
  const ratio =
    levelInfo.xpForNextLevel > 0
      ? Math.min(1, levelInfo.xpIntoLevel / levelInfo.xpForNextLevel)
      : 0;
  const remain = Math.max(0, levelInfo.xpForNextLevel - levelInfo.xpIntoLevel);

  // 걸음당 XP를 "N보 = 1XP"로 표시 (perStep=0.1 → 10보)
  const stepsPerXp = Math.round(1 / XP_RULES.perStep);

  return (
    <section className="blob-card flex flex-col gap-4 p-5">
      {/* 레벨 + 진행 바 */}
      <div>
        <div className="mb-1 flex items-end justify-between">
          <span className="text-2xl font-bold text-peach">
            Lv.{levelInfo.level}
          </span>
          <span className="text-[11px] text-cocoa/50">
            다음 레벨까지 {remain.toLocaleString()} XP
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-cream">
          <div
            className="h-full rounded-full bg-peach transition-all"
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
        <p className="mt-1 text-right text-[10px] text-cocoa/40">
          {levelInfo.xpIntoLevel.toLocaleString()} /{" "}
          {levelInfo.xpForNextLevel.toLocaleString()} XP
        </p>
      </div>

      {/* 경험치 획득 규칙 안내 */}
      <div className="rounded-2xl bg-cream px-4 py-3">
        <p className="mb-1 text-xs font-bold text-cocoa/70">경험치 얻는 법</p>
        <ul className="space-y-0.5 text-[11px] text-cocoa/60">
          <li>걸음 {stepsPerXp}보 = {1} XP</li>
          <li>하루 걸음 목표 달성 = +{XP_RULES.perGoalDay} XP</li>
          <li>운동 1회 기록 = +{XP_RULES.perWorkout} XP</li>
          <li>업적 달성 = 업적별 보너스 XP</li>
        </ul>
      </div>

      {/* 연속일 분리 (걸음 / 운동) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-cream px-3 py-3 text-center">
          <p className="text-lg font-bold text-sunny">
            🔥 {stepStreak.current}일
          </p>
          <p className="text-[11px] font-medium text-cocoa/70">걸음 연속</p>
          <p className="mt-0.5 text-[10px] text-cocoa/40">
            하루 걸음 목표 달성 연속 (최장 {stepStreak.longest}일)
          </p>
        </div>
        <div className="rounded-2xl bg-cream px-3 py-3 text-center">
          <p className="text-lg font-bold text-mint">
            ⚡ {workoutStreak.current}일
          </p>
          <p className="text-[11px] font-medium text-cocoa/70">운동 연속</p>
          <p className="mt-0.5 text-[10px] text-cocoa/40">
            하루 1회 이상 운동 연속 (최장 {workoutStreak.longest}일)
          </p>
        </div>
      </div>
    </section>
  );
}
