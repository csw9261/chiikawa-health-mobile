import { useState } from "react";
import { useSettings } from "../contexts/settings-context";
import { useMissions } from "../hooks/use-missions";
import { POOL_BY_SCOPE } from "../data/missions";
import { MissionPicker } from "../components/MissionPicker";
import type { MissionScope, MissionState } from "../game/mission-types";

/** picker 대상 슬롯 (어느 주기의 몇 번째 슬롯을 바꾸는지) */
interface PickerTarget {
  scope: MissionScope;
  slotIndex: number;
}

/** 진행도 바 + 보상 + 완료 표시 + 바꾸기 버튼을 가진 미션 카드 한 장 */
function MissionCard({
  mission,
  onChange,
}: {
  mission: MissionState;
  onChange: () => void;
}) {
  const { def, current, target, complete, reward } = mission;
  // 진행률 (0~100%) — 0 나눗셈 방지
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <div className="blob-card flex items-center gap-3 p-4">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
          complete ? "bg-mint/50" : "bg-cream"
        }`}
      >
        {complete ? "✅" : def.emoji}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-cocoa">{def.name}</span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              complete ? "bg-mint/60 text-cocoa" : "bg-cream text-cocoa/50"
            }`}
          >
            +{reward.toLocaleString()}P
          </span>
        </div>
        <p className="text-xs text-cocoa/50">{def.description}</p>
        {/* 진행도 바 */}
        <div className="mt-2 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream">
            <div
              className="h-full rounded-full bg-peach transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="shrink-0 text-[11px] font-bold text-cocoa/40">
            {current.toLocaleString()}/{target.toLocaleString()}
          </span>
        </div>
      </div>
      {/* 바꾸기 — 풀에서 다른 미션으로 직접 교체. 완료한 미션은 잠금(바꿔도 의미 없음) */}
      <button
        onClick={onChange}
        disabled={complete}
        className="shrink-0 self-start rounded-full bg-cream px-2 py-1 text-[11px] font-bold text-cocoa/50 disabled:opacity-30"
        aria-label="미션 바꾸기"
      >
        바꾸기
      </button>
    </div>
  );
}

/** 미션 섹션 (제목 + 카드 묶음) */
function MissionSection({
  title,
  emoji,
  hint,
  scope,
  missions,
  onChangeSlot,
}: {
  title: string;
  emoji: string;
  hint: string;
  scope: MissionScope;
  missions: MissionState[];
  onChangeSlot: (scope: MissionScope, slotIndex: number) => void;
}) {
  if (missions.length === 0) return null;
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-sm font-bold text-cocoa">
          {emoji} {title}
        </h2>
        <span className="text-[11px] text-cocoa/40">{hint}</span>
      </div>
      {missions.map((m, i) => (
        <MissionCard
          key={m.def.id}
          mission={m}
          onChange={() => onChangeSlot(scope, i)}
        />
      ))}
    </section>
  );
}

export function MissionScreen() {
  const { settings } = useSettings();
  const {
    daily,
    weekly,
    monthly,
    allClear,
    loading,
    chooseMission,
    revertSlot,
  } = useMissions(settings.goals.steps);

  // 현재 picker 대상 (없으면 닫힘)
  const [picker, setPicker] = useState<PickerTarget | null>(null);

  const dailyDone = daily.filter((m) => m.complete).length;

  // 주기별 현재 미션 상태 배열 매핑 (picker가 현재/사용중 id를 계산할 때 사용)
  const statesByScope: Record<MissionScope, MissionState[]> = {
    daily,
    weekly,
    monthly,
  };

  const openPicker = (scope: MissionScope, slotIndex: number) =>
    setPicker({ scope, slotIndex });

  return (
    <div className="flex flex-col gap-5 px-5 pb-24 pt-6">
      <header>
        <h1 className="text-xl font-bold text-cocoa">미션</h1>
        <p className="text-xs text-cocoa/50">
          매일·매주·매달 새로 도전하고 포인트를 모아요 · 마음에 안 들면 바꿔도 돼요
        </p>
      </header>

      {loading ? (
        <p className="py-10 text-center text-sm text-cocoa/40">불러오는 중...</p>
      ) : (
        <>
          {/* 일일 올클리어 배너 */}
          {daily.length > 0 && (
            <div
              className={`rounded-blob p-4 text-center ${
                allClear.complete ? "bg-mint/40" : "bg-surface"
              }`}
            >
              {allClear.complete ? (
                <p className="text-sm font-bold text-cocoa">
                  🎉 오늘 미션 완료! 보너스 +
                  {allClear.reward.toLocaleString()}P
                </p>
              ) : (
                <p className="text-sm text-cocoa/60">
                  오늘 미션{" "}
                  <span className="font-bold text-peach">{dailyDone}</span>
                  /{daily.length} 완료 · 전부 깨면 보너스 +
                  {allClear.reward.toLocaleString()}P
                </p>
              )}
            </div>
          )}

          <MissionSection
            title="일일 미션"
            emoji="📋"
            hint="매일 자정 갱신"
            scope="daily"
            missions={daily}
            onChangeSlot={openPicker}
          />
          <MissionSection
            title="주간 미션"
            emoji="🗓️"
            hint="매주 월요일 갱신"
            scope="weekly"
            missions={weekly}
            onChangeSlot={openPicker}
          />
          <MissionSection
            title="월간 미션"
            emoji="📅"
            hint="매월 1일 갱신"
            scope="monthly"
            missions={monthly}
            onChangeSlot={openPicker}
          />
        </>
      )}

      {/* 미션 직접 선택 바텀시트 */}
      {picker && (
        <MissionPicker
          pool={POOL_BY_SCOPE[picker.scope]}
          currentId={statesByScope[picker.scope][picker.slotIndex]?.def.id ?? ""}
          takenIds={statesByScope[picker.scope].map((m) => m.def.id)}
          onPick={async (missionId) => {
            await chooseMission(picker.scope, picker.slotIndex, missionId);
            setPicker(null);
          }}
          onRevert={async () => {
            await revertSlot(picker.scope, picker.slotIndex);
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}
