import { useState } from "react";
import { CharacterDisplay } from "../components/CharacterDisplay";
import { RedeemSection } from "../components/RedeemSection";
import { useProgressContext } from "../contexts/progress-context";
import { useSettings } from "../contexts/settings-context";
import { getHealthDataSource } from "../services/health-data-source-factory";

export function SettingsScreen() {
  const { settings, update } = useSettings();
  const { characters } = useProgressContext();

  // 걸음 목표 입력 로컬 상태
  const [steps, setSteps] = useState(String(settings.goals.steps));
  const [savedMsg, setSavedMsg] = useState(false);

  // 해금된 캐릭터만 메인으로 선택 가능
  const unlocked = characters.filter((c) => c.unlocked);

  const saveGoals = async () => {
    const s = Number(steps);
    // 입력값 검증 — 양수만 허용, 아니면 기존값 유지
    await update({
      goals: {
        steps: Number.isFinite(s) && s > 0 ? Math.round(s) : settings.goals.steps,
      },
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 1500);
  };

  const reconnectHealth = async () => {
    const source = getHealthDataSource();
    await source.requestPermissions();
    await source.openSettings();
  };

  return (
    <div className="flex flex-col gap-4 px-5 pb-24 pt-6">
      <header>
        <p className="text-xs text-cocoa/50">설정</p>
        <h1 className="text-xl font-bold text-cocoa">설정</h1>
      </header>

      {/* 목표 설정 */}
      <section className="blob-card flex flex-col gap-3 p-5">
        <h2 className="text-sm font-bold text-cocoa">하루 목표</h2>
        <label className="flex items-center justify-between text-sm text-cocoa/70">
          걸음
          <input
            type="number"
            inputMode="numeric"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            className="w-28 rounded-xl bg-cream px-3 py-2 text-right text-cocoa"
          />
        </label>
        <button
          onClick={saveGoals}
          className="mt-1 rounded-full bg-peach py-2.5 text-sm font-bold text-white"
        >
          {savedMsg ? "저장됐어요!" : "목표 저장"}
        </button>
      </section>

      {/* 메인 캐릭터 선택 */}
      <section className="blob-card flex flex-col gap-3 p-5">
        <h2 className="text-sm font-bold text-cocoa">메인 캐릭터</h2>
        <div className="grid grid-cols-4 gap-2">
          {unlocked.map(({ def }) => {
            const active = def.id === settings.mainCharacterId;
            return (
              <button
                key={def.id}
                onClick={() => update({ mainCharacterId: def.id })}
                className={`flex flex-col items-center gap-1 rounded-2xl p-2 ${
                  active ? "bg-peach/20 ring-2 ring-peach" : "bg-cream"
                }`}
              >
                <CharacterDisplay
                  id={def.id}
                  state="idle"
                  fallbackEmoji={def.fallbackEmoji}
                  sizePx={40}
                />
                <span className="text-[10px] text-cocoa/60">{def.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 알림 설정 */}
      <section className="blob-card flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-cocoa">데일리 알림</h2>
          {/* 토글 */}
          <button
            onClick={() =>
              update({ reminder: { enabled: !settings.reminder.enabled } })
            }
            className={`h-6 w-11 rounded-full p-0.5 transition ${
              settings.reminder.enabled ? "bg-peach" : "bg-cream"
            }`}
            aria-pressed={settings.reminder.enabled}
          >
            <span
              className={`block h-5 w-5 rounded-full bg-white transition ${
                settings.reminder.enabled ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>
        {settings.reminder.enabled && (
          <label className="flex items-center justify-between text-sm text-cocoa/70">
            알림 시간
            <input
              type="time"
              value={`${String(settings.reminder.hour).padStart(2, "0")}:${String(settings.reminder.minute).padStart(2, "0")}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":").map(Number);
                update({ reminder: { hour: h, minute: m } });
              }}
              className="rounded-xl bg-cream px-3 py-2 text-cocoa"
            />
          </label>
        )}
        <p className="text-[11px] text-cocoa/40">
          알림은 앱이 설치된 실기기에서만 동작해요.
        </p>
      </section>

      {/* 포인트 환전 (차감) */}
      <RedeemSection />

      {/* Health Connect 연동 */}
      <section className="blob-card flex flex-col gap-3 p-5">
        <h2 className="text-sm font-bold text-cocoa">Health Connect</h2>
        <p className="text-[11px] text-cocoa/50">
          걸음·거리·칼로리·운동 데이터를 Health Connect에서 읽어와요.
        </p>
        <button
          onClick={reconnectHealth}
          className="rounded-full bg-sky/60 py-2.5 text-sm font-bold text-cocoa"
        >
          권한 다시 연결 / 설정 열기
        </button>
      </section>
    </div>
  );
}
