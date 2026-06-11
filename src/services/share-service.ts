// 공유 서비스 (@capacitor/share 래퍼).
// 네이티브: OS 공유시트(카톡·메시지 등). 웹/미지원 환경: 클립보드 복사로 폴백.

import { Share } from "@capacitor/share";

/** 공유할 내용 */
export interface ShareContent {
  title: string;
  text: string;
}

/**
 * 텍스트 요약을 공유시트로 보냄.
 * 사용자가 취소하면 조용히 무시. 공유 불가 환경이면 클립보드 복사로 폴백.
 * @returns 'shared' | 'copied' | 'cancelled'
 */
export async function shareText(
  content: ShareContent
): Promise<"shared" | "copied" | "cancelled"> {
  try {
    await Share.share({
      title: content.title,
      text: content.text,
      dialogTitle: "공유하기",
    });
    return "shared";
  } catch (e) {
    // 사용자가 공유 취소한 경우
    const msg = String((e as Error)?.message ?? e);
    if (/cancel/i.test(msg)) return "cancelled";

    // 공유 미지원(웹 등) → 클립보드 복사 폴백
    try {
      await navigator.clipboard.writeText(content.text);
      return "copied";
    } catch {
      console.error("[share] 공유/복사 모두 실패:", e);
      return "cancelled";
    }
  }
}
