import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_SETTINGS,
  type AppSettings,
  type DailyGoals,
  type ReminderSettings,
} from "../config/app-settings";
import { loadSettings, saveSettings } from "../db/settings-store";
import {
  cancelDailyReminder,
  requestNotificationPermission,
  scheduleDailyReminder,
} from "../services/notification-scheduler";

/** 부분 업데이트 패치 — 중첩 객체(goals/reminder)도 부분만 보낼 수 있음 */
interface SettingsPatch {
  goals?: Partial<DailyGoals>;
  mainCharacterId?: string;
  reminder?: Partial<ReminderSettings>;
  redeemPin?: string;
}

interface SettingsValue {
  settings: AppSettings;
  /** 설정 로딩 완료 여부 */
  ready: boolean;
  /** 설정 부분 업데이트 (저장 + 알림 재예약 포함) */
  update: (patch: SettingsPatch) => Promise<void>;
}

const SettingsContext = createContext<SettingsValue | null>(null);

/** 앱 설정 프로바이더 — 로드/저장/알림 예약을 일괄 관리 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  // 최초 로드 + 알림이 켜져 있으면 재예약 (앱 재설치/재시작 후에도 알림 유지)
  useEffect(() => {
    loadSettings().then(async (loaded) => {
      setSettings(loaded);
      setReady(true);
      if (loaded.reminder.enabled) {
        const granted = await requestNotificationPermission();
        if (granted) {
          await scheduleDailyReminder(
            loaded.reminder.hour,
            loaded.reminder.minute
          );
        }
      }
    });
  }, []);

  const update = useCallback(
    async (patch: SettingsPatch) => {
      const next: AppSettings = {
        ...settings,
        mainCharacterId: patch.mainCharacterId ?? settings.mainCharacterId,
        redeemPin: patch.redeemPin ?? settings.redeemPin,
        // 중첩 객체는 얕은 병합으로 보존
        goals: { ...settings.goals, ...patch.goals },
        reminder: { ...settings.reminder, ...patch.reminder },
      };
      setSettings(next);
      await saveSettings(next);

      // 알림 설정이 바뀌었으면 재예약/취소
      if (patch.reminder) {
        if (next.reminder.enabled) {
          const granted = await requestNotificationPermission();
          if (granted) {
            await scheduleDailyReminder(
              next.reminder.hour,
              next.reminder.minute
            );
          }
        } else {
          await cancelDailyReminder();
        }
      }
    },
    [settings]
  );

  return (
    <SettingsContext.Provider value={{ settings, ready, update }}>
      {children}
    </SettingsContext.Provider>
  );
}

/** 설정 컨텍스트 사용 훅 */
export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings는 SettingsProvider 안에서만 사용 가능");
  }
  return ctx;
}
