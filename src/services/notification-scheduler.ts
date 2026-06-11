// 데일리 운동 리마인더 알림 스케줄러 (@capacitor/local-notifications).
// 웹에서는 LocalNotifications가 동작하지 않으므로 네이티브에서만 실제 예약함.

import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

// 리마인더 알림 고정 id (재예약 시 같은 id로 덮어쓰기)
const REMINDER_ID = 1001;

// 알림 문구 후보 — 캐릭터 톤의 응원 메시지
const REMINDER_TITLE = "먼작귀 헬스";
const REMINDER_BODY = "오늘도 같이 움직여 볼까? 친구들이 기다리고 있어!";

/** 알림 권한 요청. 허용 여부 반환 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === "granted";
  } catch (e) {
    console.error("[notification] 권한 요청 실패:", e);
    return false;
  }
}

/**
 * 매일 지정 시각에 반복되는 리마인더 예약.
 * 기존 리마인더는 취소 후 다시 예약함.
 */
export async function scheduleDailyReminder(
  hour: number,
  minute: number
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await cancelDailyReminder();
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REMINDER_ID,
          title: REMINDER_TITLE,
          body: REMINDER_BODY,
          // 매일 같은 시/분에 반복
          schedule: { on: { hour, minute }, repeats: true },
        },
      ],
    });
  } catch (e) {
    console.error("[notification] 예약 실패:", e);
  }
}

/** 리마인더 취소 */
export async function cancelDailyReminder(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  } catch (e) {
    console.error("[notification] 취소 실패:", e);
  }
}
