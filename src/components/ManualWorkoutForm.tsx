import { useState } from "react";
import { motion } from "framer-motion";
import {
  WORKOUT_CATEGORY_META,
  type WorkoutCategory,
} from "../config/health-config";
import { addManualWorkout } from "../db/workout-store";

interface ManualWorkoutFormProps {
  /** 폼 닫기 */
  onClose: () => void;
  /** 저장 완료 후 콜백 (목록 새로고침용) */
  onAdded: () => void;
  /**
   * 시작 시간 입력의 기본 날짜 (달력 탭에서 특정 날짜를 탭해 기록할 때 전달).
   * 미지정이면 현재 시각을 기본값으로 사용함.
   */
  initialDate?: Date;
}

/**
 * datetime-local input 기본값으로 쓸 로컬 시각 문자열 (YYYY-MM-DDTHH:mm).
 * base가 주어지면 그 날짜를 쓰되 시:분은 현재 시각으로 채움 (과거 날짜에 기록 시 자연스러운 시각).
 */
function localInputValue(base?: Date): string {
  const now = new Date();
  const d = base
    ? new Date(
        base.getFullYear(),
        base.getMonth(),
        base.getDate(),
        now.getHours(),
        now.getMinutes()
      )
    : now;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 선택 가능한 카테고리 (수동 기록에서 자주 쓰는 순서)
const CATEGORIES: WorkoutCategory[] = [
  "cycling",
  "walking",
  "running",
  "yoga",
  "strength",
  "jumpRope",
  "hiking",
  "other",
];

/**
 * 수동 운동 기록 입력 폼.
 * Health Connect에 안 잡히는 운동(실내사이클 등)을 직접 기록하는 용도.
 */
export function ManualWorkoutForm({
  onClose,
  onAdded,
  initialDate,
}: ManualWorkoutFormProps) {
  const [category, setCategory] = useState<WorkoutCategory>("cycling");
  const [startLocal, setStartLocal] = useState(localInputValue(initialDate));
  const [durationMin, setDurationMin] = useState("30");
  const [distanceKm, setDistanceKm] = useState("");
  const [calories, setCalories] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // 입력값 검증 — 운동 시간은 필수, 양수여야 함
    const minutes = Number(durationMin);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      setError("운동 시간을 분 단위로 입력해 주세요.");
      return;
    }
    const start = new Date(startLocal);
    if (Number.isNaN(start.getTime())) {
      setError("시작 시간이 올바르지 않아요.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // 선택 입력값은 숫자일 때만 반영
      const km = Number(distanceKm);
      const cal = Number(calories);
      await addManualWorkout({
        category,
        startDate: start.toISOString(),
        durationSeconds: Math.round(minutes * 60),
        distanceMeters: distanceKm && Number.isFinite(km) ? Math.round(km * 1000) : undefined,
        calories: calories && Number.isFinite(cal) ? Math.round(cal) : undefined,
      });
      onAdded();
      onClose();
    } catch (e) {
      setError("저장에 실패했어요. 다시 시도해 주세요.");
      console.error("[ManualWorkoutForm] 저장 실패:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    // 반투명 배경 오버레이
    <div
      className="fixed inset-0 z-20 flex items-end justify-center bg-cocoa/30 p-0"
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-t-blob bg-surface p-5 pb-8"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold text-cocoa">운동 기록하기</h2>

        {/* 카테고리 선택 */}
        <div className="mb-4 grid grid-cols-4 gap-2">
          {CATEGORIES.map((c) => {
            const meta = WORKOUT_CATEGORY_META[c];
            const active = c === category;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`flex flex-col items-center gap-1 rounded-2xl py-2 text-xs font-medium transition ${
                  active
                    ? "bg-peach text-white"
                    : "bg-cream text-cocoa/60"
                }`}
              >
                <span className="text-xl">{meta.emoji}</span>
                {meta.label}
              </button>
            );
          })}
        </div>

        {/* 입력 필드 */}
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs text-cocoa/60">
            시작 시간
            <input
              type="datetime-local"
              value={startLocal}
              onChange={(e) => setStartLocal(e.target.value)}
              className="rounded-xl bg-cream px-3 py-2 text-sm text-cocoa"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-cocoa/60">
            운동 시간 (분)
            <input
              type="number"
              inputMode="numeric"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              className="rounded-xl bg-cream px-3 py-2 text-sm text-cocoa"
            />
          </label>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-xs text-cocoa/60">
              거리 (km, 선택)
              <input
                type="number"
                inputMode="decimal"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                placeholder="-"
                className="rounded-xl bg-cream px-3 py-2 text-sm text-cocoa"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-xs text-cocoa/60">
              칼로리 (선택)
              <input
                type="number"
                inputMode="numeric"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="-"
                className="rounded-xl bg-cream px-3 py-2 text-sm text-cocoa"
              />
            </label>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

        {/* 액션 버튼 */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full bg-cream py-3 text-sm font-bold text-cocoa/60"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-full bg-peach py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
