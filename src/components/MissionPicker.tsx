import { motion } from "framer-motion";
import type { MissionDef } from "../game/mission-types";

interface MissionPickerProps {
  /** 고를 수 있는 미션 풀 (해당 주기 전체) */
  pool: MissionDef[];
  /** 지금 이 슬롯에 들어있는 미션 id (강조 표시) */
  currentId: string;
  /** 같은 주기의 다른 슬롯에 이미 선택된 id들 (중복 선택 방지로 비활성화) */
  takenIds: string[];
  /** 미션 선택 */
  onPick: (missionId: string) => void;
  /** 자동 선택으로 되돌리기 */
  onRevert: () => void;
  /** 닫기 */
  onClose: () => void;
}

/**
 * 미션 직접 선택 바텀시트.
 * 풀에서 원하는 미션을 골라 현재 슬롯을 교체하거나, 자동 선택으로 되돌릴 수 있음.
 */
export function MissionPicker({
  pool,
  currentId,
  takenIds,
  onPick,
  onRevert,
  onClose,
}: MissionPickerProps) {
  return (
    <div
      className="fixed inset-0 z-20 flex items-end justify-center bg-cocoa/30"
      onClick={onClose}
    >
      <motion.div
        className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-blob bg-surface p-5 pb-8"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-cocoa">미션 고르기</h2>
          <button
            onClick={onRevert}
            className="rounded-full bg-cream px-3 py-1.5 text-xs font-bold text-cocoa/60"
          >
            🎲 자동 선택으로
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {pool.map((m) => {
            const isCurrent = m.id === currentId;
            // 다른 슬롯이 이미 쓰는 미션은 중복 방지로 비활성화 (현재 슬롯 제외)
            const isTaken = !isCurrent && takenIds.includes(m.id);
            return (
              <button
                key={m.id}
                disabled={isTaken}
                onClick={() => onPick(m.id)}
                className={`flex items-center gap-3 rounded-2xl p-3 text-left transition ${
                  isCurrent
                    ? "bg-peach/20 ring-2 ring-peach"
                    : isTaken
                      ? "bg-cream opacity-40"
                      : "bg-cream"
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-cocoa">{m.name}</p>
                  <p className="text-xs text-cocoa/50">{m.description}</p>
                </div>
                {isCurrent && <span className="text-xs text-peach">선택됨</span>}
                {isTaken && (
                  <span className="text-[11px] text-cocoa/40">사용 중</span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
