// 게이미피케이션 진행 상태 영속화.
// "이미 해금/달성 알림을 본" 업적/캐릭터 id를 저장해, 새로 달성한 것에만 축하 연출을 띄우기 위함.

import { db } from "./app-database";

/** kv 테이블에서 사용하는 키 */
const KEY_SEEN_ACHIEVEMENTS = "seenAchievements";
const KEY_SEEN_CHARACTERS = "seenCharacters";
const KEY_BASELINED = "celebrationBaselined";

/** 지정 키의 본 적 있는 id 집합을 반환 (없으면 빈 집합) */
async function getSeen(key: string): Promise<Set<string>> {
  const record = await db.kv.get(key);
  return new Set(record?.value ?? []);
}

/** 지정 키에 id들을 합쳐 저장 */
async function addSeen(key: string, ids: string[]): Promise<void> {
  const current = await getSeen(key);
  for (const id of ids) current.add(id);
  await db.kv.put({ key, value: [...current] });
}

/** 이미 본(축하 완료) 업적 id 집합 */
export function getSeenAchievements(): Promise<Set<string>> {
  return getSeen(KEY_SEEN_ACHIEVEMENTS);
}

/** 업적 id들을 본 것으로 표시 */
export function markAchievementsSeen(ids: string[]): Promise<void> {
  return addSeen(KEY_SEEN_ACHIEVEMENTS, ids);
}

/** 이미 본(축하 완료) 캐릭터 id 집합 */
export function getSeenCharacters(): Promise<Set<string>> {
  return getSeen(KEY_SEEN_CHARACTERS);
}

/** 캐릭터 id들을 본 것으로 표시 */
export function markCharactersSeen(ids: string[]): Promise<void> {
  return addSeen(KEY_SEEN_CHARACTERS, ids);
}

/**
 * 축하 기준선이 설정됐는지 여부.
 * 첫 실행(또는 기능 업데이트 직후)에 이미 달성한 항목들을 한꺼번에 축하하지 않도록,
 * 기준선을 한 번 잡고 그 이후의 신규 달성만 축하하기 위함.
 */
export async function isCelebrationBaselined(): Promise<boolean> {
  const record = await db.kv.get(KEY_BASELINED);
  return !!record && record.value.length > 0;
}

/** 축하 기준선 설정됨으로 표시 */
export async function setCelebrationBaselined(): Promise<void> {
  await db.kv.put({ key: KEY_BASELINED, value: ["1"] });
}
