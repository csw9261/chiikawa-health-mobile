import { createContext, useContext, type ReactNode } from "react";
import { useProgress } from "../hooks/use-progress";
import { useSettings } from "./settings-context";

// 진행도(배지/캐릭터/스트릭)를 앱 전역에서 한 번만 계산해 공유하기 위한 컨텍스트.
// 여러 화면이 각자 useProgress를 호출하면 중복 계산 + 신규 해금 처리가 꼬이므로 한 곳에서 관리.

type ProgressValue = ReturnType<typeof useProgress>;

const ProgressContext = createContext<ProgressValue | null>(null);

/** 진행도 컨텍스트 프로바이더 — 앱 루트에서 한 번 감쌈. 설정된 걸음 목표를 사용 */
export function ProgressProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const value = useProgress(settings.goals.steps);
  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

/** 진행도 컨텍스트 사용 훅. 프로바이더 밖에서 쓰면 에러 */
export function useProgressContext(): ProgressValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgressContext는 ProgressProvider 안에서만 사용 가능");
  }
  return ctx;
}
