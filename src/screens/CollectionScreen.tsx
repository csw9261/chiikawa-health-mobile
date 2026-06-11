import { useState } from "react";
import { CharacterDisplay } from "../components/CharacterDisplay";
import { ShareButton } from "../components/ShareButton";
import { useProgressContext } from "../contexts/progress-context";
import { achievedLabel } from "../data/characters";
import type { CharacterDeck } from "../game/player-progress-types";
import { buildCollectionShare } from "../share/share-text-builders";

export function CollectionScreen() {
  const { characters, loading } = useProgressContext();
  const [deck, setDeck] = useState<CharacterDeck>("workout");

  // 현재 선택된 도감만 필터
  const items = characters.filter((c) => c.def.deck === deck);
  const unlockedCount = items.filter((c) => c.unlocked).length;

  // 공유용 두 도감 모음 현황
  const countDeck = (d: CharacterDeck) => {
    const list = characters.filter((c) => c.def.deck === d);
    return { unlocked: list.filter((c) => c.unlocked).length, total: list.length };
  };

  return (
    <div className="flex flex-col gap-4 px-5 pb-24 pt-6">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs text-cocoa/50">
            {unlockedCount} / {items.length} 모음
          </p>
          <h1 className="text-xl font-bold text-cocoa">캐릭터 도감</h1>
        </div>
        <ShareButton
          build={() =>
            buildCollectionShare(countDeck("workout"), countDeck("steps"))
          }
        />
      </header>

      {/* 도감 토글 (운동 / 걸음) */}
      <div className="flex rounded-full bg-cream p-1">
        {(
          [
            { key: "workout", label: "🏃 운동 도감" },
            { key: "steps", label: "👣 걸음 도감" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setDeck(t.key)}
            className={`flex-1 rounded-full py-2 text-sm font-bold transition ${
              deck === t.key ? "bg-peach text-white" : "text-cocoa/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-cocoa/40">불러오는 중...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map(({ def, unlocked }) => (
            <div
              key={def.id}
              className="blob-card flex flex-col items-center gap-2 p-4"
            >
              {unlocked ? (
                <CharacterDisplay
                  id={def.id}
                  state="happy"
                  fallbackEmoji={def.fallbackEmoji}
                  sizePx={72}
                />
              ) : (
                // 잠금 캐릭터: 실루엣 노출 없이 빈 "?" 자리로만 표시
                <div
                  className="flex items-center justify-center rounded-full bg-cream text-2xl font-bold text-cocoa/25"
                  style={{ width: 72, height: 72 }}
                  aria-label="잠긴 캐릭터"
                >
                  ?
                </div>
              )}
              <p className="text-sm font-bold text-cocoa">
                {unlocked ? def.name : "???"}
              </p>
              <p className="text-center text-[11px] text-cocoa/50">
                {unlocked ? achievedLabel(def) : def.unlockDescription}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
