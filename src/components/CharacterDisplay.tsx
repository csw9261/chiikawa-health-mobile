import type { CharacterState } from "../game/player-progress-types";

// 캐릭터 이미지 에셋 슬롯 시스템.
// src/assets/characters/<id>/<state>.(png|webp|svg) 가 있으면 그 이미지를,
// 없으면 fallbackEmoji를 렌더함 → 이미지 없이도 동작하고, 나중에 끼우기만 하면 자동 연결.

// 빌드 시 캐릭터 이미지들을 한 번에 수집 (eager). 경로 → URL 맵.
const ASSET_MODULES = import.meta.glob<{ default: string }>(
  "../assets/characters/*/*.{png,webp,svg,jpg,jpeg}",
  { eager: true }
);

/** 캐릭터 id + 상태에 해당하는 이미지 URL을 찾음 (없으면 null) */
function resolveImage(id: string, state: CharacterState): string | null {
  // 같은 id 폴더에서 우선순위: 요청 상태 → idle → 아무거나
  const entries = Object.entries(ASSET_MODULES).filter(([path]) =>
    path.includes(`/characters/${id}/`)
  );
  if (entries.length === 0) return null;

  const findByState = (s: string) =>
    entries.find(([path]) => path.includes(`/${s}.`));

  const match =
    findByState(state) ?? findByState("idle") ?? entries[0];
  return match ? match[1].default : null;
}

interface CharacterDisplayProps {
  /** 캐릭터 id (에셋 폴더명) */
  id: string;
  /** 표시 상태 */
  state?: CharacterState;
  /** 이미지 없을 때 표시할 이모지 */
  fallbackEmoji: string;
  /** 잠금 상태면 실루엣(어둡게) 처리 */
  locked?: boolean;
  /** 크기 클래스 (이모지 폰트 크기 / 이미지 px) */
  sizePx?: number;
  /** 추가 클래스 */
  className?: string;
}

/** 캐릭터를 이미지(있으면) 또는 이모지(폴백)로 표시 */
export function CharacterDisplay({
  id,
  state = "idle",
  fallbackEmoji,
  locked = false,
  sizePx = 64,
  className = "",
}: CharacterDisplayProps) {
  const imageUrl = resolveImage(id, state);
  // 잠금 시 어둡게 + 흐릿하게
  const lockStyle = locked ? "opacity-30 grayscale" : "";

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={id}
        width={sizePx}
        height={sizePx}
        className={`object-contain ${lockStyle} ${className}`}
        style={{ width: sizePx, height: sizePx }}
      />
    );
  }

  // 이모지 폴백 — sizePx를 폰트 크기로 환산
  return (
    <span
      className={`inline-flex items-center justify-center ${lockStyle} ${className}`}
      style={{ fontSize: sizePx * 0.8, lineHeight: 1, width: sizePx, height: sizePx }}
      aria-label={id}
    >
      {locked ? "❔" : fallbackEmoji}
    </span>
  );
}
