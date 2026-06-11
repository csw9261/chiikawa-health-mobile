// 앱 설정 영속화 (Capacitor Preferences).
// Preferences는 네이티브에선 기기 저장소, 웹에선 localStorage를 사용하므로 양쪽 모두 동작.

import { Preferences } from "@capacitor/preferences";
import { DEFAULT_SETTINGS, type AppSettings } from "../config/app-settings";

const SETTINGS_KEY = "app-settings";

/** 저장된 설정 로드. 없거나 깨졌으면 기본값 반환 (안전 처리) */
export async function loadSettings(): Promise<AppSettings> {
  try {
    const { value } = await Preferences.get({ key: SETTINGS_KEY });
    if (!value) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(value) as Partial<AppSettings>;
    // 기본값과 병합 — 일부 필드만 저장돼 있어도 누락 없이 채움
    return {
      goals: { ...DEFAULT_SETTINGS.goals, ...parsed.goals },
      mainCharacterId: parsed.mainCharacterId ?? DEFAULT_SETTINGS.mainCharacterId,
      reminder: { ...DEFAULT_SETTINGS.reminder, ...parsed.reminder },
      redeemPin: parsed.redeemPin ?? DEFAULT_SETTINGS.redeemPin,
    };
  } catch (e) {
    console.error("[settings-store] 설정 로드 실패, 기본값 사용:", e);
    return DEFAULT_SETTINGS;
  }
}

/** 설정 저장 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  await Preferences.set({
    key: SETTINGS_KEY,
    value: JSON.stringify(settings),
  });
}
