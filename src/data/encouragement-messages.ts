// 달성률에 따른 캐릭터 응원 메시지.
// 성취감을 주는 게 핵심이라 단계별로 따뜻한 톤의 문구를 제공함.
// Phase 3에서 캐릭터별 대사/상황별 분기로 확장 예정.

/** 캐릭터 감정 상태 — 표시할 이미지/모션 선택에 사용 */
export type CharacterMood = "sleepy" | "cheer" | "excited" | "celebrate";

interface Encouragement {
  mood: CharacterMood;
  message: string;
  emoji: string; // 캐릭터 이미지 도입 전 폴백
}

/** 전체 달성률(0~1+)에 맞는 응원 문구 반환 */
export function getEncouragement(overallProgress: number): Encouragement {
  if (overallProgress >= 1) {
    return {
      mood: "celebrate",
      message: "오늘 목표 완료! 정말 대단해!",
      emoji: "🎉",
    };
  }
  if (overallProgress >= 0.66) {
    return {
      mood: "excited",
      message: "거의 다 왔어! 조금만 더 힘내!",
      emoji: "✨",
    };
  }
  if (overallProgress >= 0.33) {
    return {
      mood: "cheer",
      message: "좋아좋아, 잘하고 있어!",
      emoji: "💪",
    };
  }
  if (overallProgress > 0) {
    return {
      mood: "cheer",
      message: "오늘도 같이 움직여 볼까?",
      emoji: "🐭",
    };
  }
  return {
    mood: "sleepy",
    message: "준비됐어? 가볍게 시작하자!",
    emoji: "🐭",
  };
}
