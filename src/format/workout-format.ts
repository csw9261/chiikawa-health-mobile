// 운동 데이터 표시용 포맷 함수 모음.

/** 초 → "1시간 5분" / "32분" 형태 */
export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`;
  }
  return `${minutes}분`;
}

/** 미터 → "5.20km" / "850m" 형태 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)}km`;
  }
  return `${Math.round(meters)}m`;
}

/** ISO 시각 → "오전 7:30" 형태 (로컬) */
export function formatClock(iso: string): string {
  const d = new Date(iso);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const period = hours < 12 ? "오전" : "오후";
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${period} ${h12}:${String(minutes).padStart(2, "0")}`;
}

/** ISO 시각 → "6/8" 형태 (월/일, 로컬) */
export function formatMonthDay(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 요일 한글 표기 (0=일 ~ 6=토) */
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * Date → "YYYY-MM-DD" 로컬 날짜 키.
 * 리스트 날짜별 그룹핑·달력 셀 매칭에 쓰는 공통 키 (시각 무시, 로컬 자정 기준).
 */
export function toDateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** ISO 시각 → "YYYY-MM-DD" 로컬 날짜 키 */
export function isoToDateKey(iso: string): string {
  return toDateKey(new Date(iso));
}

/** "YYYY-MM-DD" 날짜 키 → "6월 11일 (수)" 형태 리스트 헤더 */
export function formatDateHeader(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00`);
  const weekday = WEEKDAY_LABELS[d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${weekday})`;
}
