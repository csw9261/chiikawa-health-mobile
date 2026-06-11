// 미션 직접 선택(바꾸기) 저장 스토어.
// 기본은 자동 선택이지만, 사용자가 슬롯을 바꾸면 그 기간(오늘/이번주/이번달)의
// 선택 미션 id 목록을 통째로 저장함. 다음 기간이 되면 저장값이 없어 다시 자동 선택됨.
// 저장은 기존 kv 테이블 재사용 (별도 마이그레이션 불필요).

import { db } from "./app-database";
import type { MissionScope } from "../game/mission-types";

/** kv 키 구성 — 주기+기간키 단위로 선택 세트를 저장 */
function selectionKey(scope: MissionScope, periodKey: string): string {
  return `missionSel:${scope}:${periodKey}`;
}

/** 저장된 선택 미션 id 목록 반환 (없으면 null = 자동 선택) */
export async function getSelection(
  scope: MissionScope,
  periodKey: string
): Promise<string[] | null> {
  const record = await db.kv.get(selectionKey(scope, periodKey));
  return record ? record.value : null;
}

/** 선택 미션 id 목록을 통째로 저장 (슬롯 하나만 바꿔도 전체 세트를 저장) */
export async function setSelection(
  scope: MissionScope,
  periodKey: string,
  missionIds: string[]
): Promise<void> {
  await db.kv.put({ key: selectionKey(scope, periodKey), value: missionIds });
}
