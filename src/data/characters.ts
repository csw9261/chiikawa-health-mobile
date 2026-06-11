// 캐릭터 정의 모음 (2차 — 도감 2분할).
// 각 캐릭터 id = 이미지 폴더명(src/assets/characters/<id>/). 이미지 없으면 fallbackEmoji.
//
// 도감 2종 (에셋 중복 없음):
//  - workout 도감: 누적 운동 횟수로 해금. 기존 13개 + 확장분 = 50칸.
//  - steps 도감: 누적 걸음으로 해금. 50칸 (이미지는 새로 준비 — 그전엔 이모지 폴백).
// 캐릭터(이미지) 추가 = 해당 배열에 항목 추가 + 같은 id 폴더에 idle 이미지.

import type { CharacterDef } from "../game/player-progress-types";

// 각 도감 칸 수 (지속 추가 예정, 현재 목표치)
const DECK_SIZE = 50;

/**
 * 운동 도감 — 사용자가 이름/이미지를 직접 넣은 기존 13개.
 * 이 id/폴더는 절대 바꾸지 말 것 (이미지가 연결돼 있음).
 */
const WORKOUT_BASE: CharacterDef[] = [
  { id: "chiikawa", name: "치이카와", deck: "workout", unlockDescription: "기본 단짝 친구", fallbackEmoji: "🐭", isUnlocked: () => true },
  { id: "hachiware", name: "하치와레", deck: "workout", unlockDescription: "운동 1회 달성 시", fallbackEmoji: "🐱", isUnlocked: (p) => p.totalWorkouts >= 1 },
  { id: "usagi", name: "우사기", deck: "workout", unlockDescription: "운동 3회 달성 시", fallbackEmoji: "🐰", isUnlocked: (p) => p.totalWorkouts >= 3 },
  { id: "shisa", name: "시사", deck: "workout", unlockDescription: "운동 5회 달성 시", fallbackEmoji: "🦁", isUnlocked: (p) => p.totalWorkouts >= 5 },
  { id: "chiikawa-cozy", name: "이불 치이카와", deck: "workout", unlockDescription: "운동 7회 달성 시", fallbackEmoji: "🐭", isUnlocked: (p) => p.totalWorkouts >= 7 },
  { id: "hachiware-smile", name: "웃는 하치와레", deck: "workout", unlockDescription: "운동 9회 달성 시", fallbackEmoji: "🐱", isUnlocked: (p) => p.totalWorkouts >= 9 },
  { id: "chiikawa-smile", name: "방긋 치이카와", deck: "workout", unlockDescription: "운동 11회 달성 시", fallbackEmoji: "🐭", isUnlocked: (p) => p.totalWorkouts >= 11 },
  { id: "chiikawa-laugh", name: "신난 치이카와", deck: "workout", unlockDescription: "운동 13회 달성 시", fallbackEmoji: "🐭", isUnlocked: (p) => p.totalWorkouts >= 13 },
  { id: "chiikawa-gaze", name: "미소 치이카와", deck: "workout", unlockDescription: "운동 15회 달성 시", fallbackEmoji: "🐭", isUnlocked: (p) => p.totalWorkouts >= 15 },
  { id: "chiikawa-cheer", name: "만세 치이카와", deck: "workout", unlockDescription: "운동 17회 달성 시", fallbackEmoji: "🐭", isUnlocked: (p) => p.totalWorkouts >= 17 },
  { id: "chiikawa-dressup", name: "꾸민 치이카와", deck: "workout", unlockDescription: "운동 19회 달성 시", fallbackEmoji: "🐭", isUnlocked: (p) => p.totalWorkouts >= 19 },
  { id: "chiikawa-panic", name: "당황 치이카와", deck: "workout", unlockDescription: "운동 21회 달성 시", fallbackEmoji: "🐭", isUnlocked: (p) => p.totalWorkouts >= 21 },
  { id: "chiikawa-worry", name: "울먹 치이카와", deck: "workout", unlockDescription: "운동 23회 달성 시", fallbackEmoji: "🐭", isUnlocked: (p) => p.totalWorkouts >= 23 },
];

/** 운동 도감 확장 슬롯의 해금 운동 횟수 (기존 23회 이후 +4씩) */
function workoutThreshold(slotIndex: number): number {
  // slotIndex는 0-base 전체 인덱스. 13번째(인덱스 12)가 23회.
  return 23 + (slotIndex - 12) * 4;
}

/** 걸음 도감 슬롯의 해금 누적 걸음 (n번째, 1-base) — 2차 곡선: 1200*n^2 (100 단위 반올림) */
function stepThreshold(n: number): number {
  return Math.round((1200 * n * n) / 100) * 100;
}

/** 운동 도감 50칸 (기존 13 + 생성 37) */
function buildWorkoutDeck(): CharacterDef[] {
  const deck = [...WORKOUT_BASE];
  for (let i = WORKOUT_BASE.length; i < DECK_SIZE; i++) {
    const threshold = workoutThreshold(i);
    deck.push({
      id: `wo-${i + 1}`,
      name: `운동친구 ${i + 1}`,
      deck: "workout",
      unlockDescription: `운동 ${threshold}회 달성 시`,
      fallbackEmoji: "🐾",
      isUnlocked: (p) => p.totalWorkouts >= threshold,
    });
  }
  return deck;
}

/** 걸음 도감 50칸 (전부 생성, 이미지는 추후) */
function buildStepsDeck(): CharacterDef[] {
  const deck: CharacterDef[] = [];
  for (let n = 1; n <= DECK_SIZE; n++) {
    const threshold = stepThreshold(n);
    deck.push({
      id: `step-${String(n).padStart(2, "0")}`,
      name: `걸음친구 ${n}`,
      deck: "steps",
      unlockDescription: `누적 ${threshold.toLocaleString()} 걸음 달성 시`,
      fallbackEmoji: "👣",
      isUnlocked: (p) => p.totalSteps >= threshold,
    });
  }
  return deck;
}

export const WORKOUT_DECK: CharacterDef[] = buildWorkoutDeck();
export const STEPS_DECK: CharacterDef[] = buildStepsDeck();
export const CHARACTERS: CharacterDef[] = [...WORKOUT_DECK, ...STEPS_DECK];

/** id로 캐릭터 정의 찾기 */
export function findCharacter(id: string): CharacterDef | undefined {
  return CHARACTERS.find((c) => c.id === id);
}

/** 해금 시 표시할 "달성 완료" 문구 ("운동 3회 달성 시" → "운동 3회 달성 완료") */
export function achievedLabel(def: CharacterDef): string {
  if (def.unlockDescription.endsWith("달성 시")) {
    return def.unlockDescription.replace(/달성 시$/, "달성 완료");
  }
  return def.unlockDescription; // 예: "기본 단짝 친구"
}
