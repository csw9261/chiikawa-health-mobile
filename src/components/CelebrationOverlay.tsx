import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import type {
  AchievementDef,
  CharacterDef,
} from "../game/player-progress-types";
import { CharacterDisplay } from "./CharacterDisplay";
import { ShareButton } from "./ShareButton";
import { buildCelebrationShare } from "../share/share-text-builders";

// 축하 연출의 한 단계.
// - character: 캐릭터 1마리 (하나씩 차례로 축하)
// - achievements: 새 업적 묶음 (수가 많을 수 있어 한 번에 요약)
export type CelebrationStep =
  | { kind: "character"; character: CharacterDef }
  | { kind: "achievements"; achievements: AchievementDef[] };

interface CelebrationOverlayProps {
  /** 현재 보여줄 단계 */
  step: CelebrationStep;
  /** 현재 단계 번호 (0-base) */
  index: number;
  /** 전체 단계 수 */
  total: number;
  /** 다음 단계로 (마지막이면 닫고 acknowledge) */
  onNext: () => void;
}

// confetti 발사 설정
const CONFETTI_PARTICLE_COUNT = 120;
const CONFETTI_SPREAD = 80;
const CONFETTI_COLORS = ["#ffb1b1", "#ffe08a", "#bfe3ff", "#c8f0d8"];

/**
 * 새 해금/달성 축하 연출 (한 단계씩).
 * 단계가 바뀔 때마다 confetti를 터뜨림. 여러 캐릭터가 해금되면 차례로 표시됨.
 */
export function CelebrationOverlay({
  step,
  index,
  total,
  onNext,
}: CelebrationOverlayProps) {
  // 단계가 바뀔 때마다 폭죽 (index 기준)
  useEffect(() => {
    confetti({
      particleCount: CONFETTI_PARTICLE_COUNT,
      spread: CONFETTI_SPREAD,
      origin: { x: 0.3, y: 0.5 },
      colors: CONFETTI_COLORS,
    });
    confetti({
      particleCount: CONFETTI_PARTICLE_COUNT,
      spread: CONFETTI_SPREAD,
      origin: { x: 0.7, y: 0.5 },
      colors: CONFETTI_COLORS,
    });
  }, [index]);

  const isLast = index >= total - 1;
  const nextLabel = isLast ? "좋아!" : "다음";

  // 공유 내용 (단계별)
  const buildShare =
    step.kind === "character"
      ? () => buildCelebrationShare([step.character.name], [])
      : () => buildCelebrationShare([], step.achievements.map((a) => a.name));

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-cocoa/40 p-6">
      <motion.div
        key={index}
        className="flex w-full max-w-xs flex-col items-center gap-4 rounded-blob bg-surface p-7 text-center"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 18, stiffness: 260 }}
      >
        <p className="text-sm font-bold text-peach">
          {step.kind === "character" ? "🎉 새로운 친구!" : "🎉 새로운 업적!"}
        </p>

        {step.kind === "character" ? (
          <>
            <motion.div
              animate={{ rotate: [0, -6, 6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <CharacterDisplay
                id={step.character.id}
                state="celebrate"
                fallbackEmoji={step.character.fallbackEmoji}
                sizePx={110}
              />
            </motion.div>
            <div>
              <p className="text-lg font-bold text-cocoa">
                {step.character.name}
              </p>
              <p className="text-xs text-cocoa/50">
                {step.character.unlockDescription} 달성!
              </p>
            </div>
          </>
        ) : (
          <>
            <motion.div
              className="text-6xl"
              animate={{ rotate: [0, -6, 6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              {step.achievements[0]?.emoji ?? "🏆"}
            </motion.div>
            <div>
              <p className="text-lg font-bold text-cocoa">
                {step.achievements[0]?.name ?? "업적 달성"}
              </p>
              <p className="text-xs text-cocoa/50">
                {step.achievements.length > 1
                  ? `업적 ${step.achievements.length}개 달성!`
                  : `${step.achievements[0]?.description ?? ""} · +${step.achievements[0]?.points ?? 0}P`}
              </p>
            </div>
            {step.achievements.length > 1 && (
              <div className="flex flex-wrap justify-center gap-2">
                {step.achievements.slice(0, 8).map((a) => (
                  <span
                    key={a.id}
                    className="rounded-full bg-cream px-3 py-1 text-xs text-cocoa"
                  >
                    {a.emoji} {a.name}
                  </span>
                ))}
                {step.achievements.length > 8 && (
                  <span className="px-2 py-1 text-xs text-cocoa/50">
                    +{step.achievements.length - 8}
                  </span>
                )}
              </div>
            )}
          </>
        )}

        {/* 여러 단계일 때 진행 표시 */}
        {total > 1 && (
          <p className="text-[11px] text-cocoa/40">
            {index + 1} / {total}
          </p>
        )}

        <div className="mt-1 flex w-full items-center gap-2">
          <ShareButton className="flex-1 justify-center py-3" build={buildShare} />
          <button
            onClick={onNext}
            className="flex-1 rounded-full bg-peach py-3 text-sm font-bold text-white"
          >
            {nextLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
