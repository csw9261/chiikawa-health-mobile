import { useEffect, useMemo, useState } from "react";
import { AppBackground } from "./components/AppBackground";
import { BottomNav, type TabKey } from "./components/BottomNav";
import {
  CelebrationOverlay,
  type CelebrationStep,
} from "./components/CelebrationOverlay";
import { ProgressProvider, useProgressContext } from "./contexts/progress-context";
import { SettingsProvider } from "./contexts/settings-context";
import { AchievementScreen } from "./screens/AchievementScreen";
import { CollectionScreen } from "./screens/CollectionScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { MissionScreen } from "./screens/MissionScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { WorkoutScreen } from "./screens/WorkoutScreen";

/** 탭 전환 + 화면 렌더 + 신규 해금 축하 연출 */
function AppShell() {
  const [tab, setTab] = useState<TabKey>("home");
  const { newCharacters, newAchievements, acknowledge } = useProgressContext();

  // 축하 단계 큐: 캐릭터는 하나씩, 업적은 마지막에 한 번 묶어서
  const steps = useMemo<CelebrationStep[]>(() => {
    const list: CelebrationStep[] = newCharacters.map((character) => ({
      kind: "character",
      character,
    }));
    if (newAchievements.length > 0) {
      list.push({ kind: "achievements", achievements: newAchievements });
    }
    return list;
  }, [newCharacters, newAchievements]);

  // 현재 보여줄 단계 인덱스 (큐가 바뀌면 처음부터)
  const [celebIndex, setCelebIndex] = useState(0);
  useEffect(() => {
    setCelebIndex(0);
  }, [steps]);

  const currentStep = steps[celebIndex];

  // 다음 단계로. 마지막이면 모두 본 것으로 처리하고 닫음
  const handleNext = async () => {
    if (celebIndex < steps.length - 1) {
      setCelebIndex((i) => i + 1);
    } else {
      await acknowledge();
      setCelebIndex(0);
    }
  };

  return (
    <div className="mx-auto min-h-full max-w-md">
      <AppBackground />

      {tab === "home" && <HomeScreen />}
      {tab === "workout" && <WorkoutScreen />}
      {tab === "mission" && <MissionScreen />}
      {tab === "collection" && <CollectionScreen />}
      {tab === "achievement" && <AchievementScreen />}
      {tab === "settings" && <SettingsScreen />}

      <BottomNav active={tab} onChange={setTab} />

      {currentStep && (
        <CelebrationOverlay
          step={currentStep}
          index={celebIndex}
          total={steps.length}
          onNext={handleNext}
        />
      )}
    </div>
  );
}

// 앱 루트. 설정 → 진행도 순으로 컨텍스트를 감쌈 (진행도가 설정된 목표를 사용).
export default function App() {
  return (
    <SettingsProvider>
      <ProgressProvider>
        <AppShell />
      </ProgressProvider>
    </SettingsProvider>
  );
}
