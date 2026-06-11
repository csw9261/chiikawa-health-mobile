import { useCallback, useEffect, useState } from "react";
import { DEFAULT_DAILY_GOALS } from "../config/health-config";
import { ACHIEVEMENTS } from "../data/achievements";
import { CHARACTERS } from "../data/characters";
import { syncSnapshots } from "../db/daily-snapshot-store";
import {
  getSeenAchievements,
  getSeenCharacters,
  isCelebrationBaselined,
  markAchievementsSeen,
  markCharactersSeen,
  setCelebrationBaselined,
} from "../db/progress-store";
import {
  applyAchievements,
  computeProgressFromSnapshots,
} from "../game/achievement-engine";
import type {
  AchievementDef,
  CharacterDef,
  PlayerProgress,
} from "../game/player-progress-types";
import { getHealthDataSource } from "../services/health-data-source-factory";

/** 업적 + 달성 여부 */
export interface AchievementStatus {
  def: AchievementDef;
  earned: boolean;
}

/** 캐릭터 + 해금 여부 */
export interface CharacterStatus {
  def: CharacterDef;
  unlocked: boolean;
}

interface UseProgressState {
  progress: PlayerProgress | null;
  achievements: AchievementStatus[];
  characters: CharacterStatus[];
  /** 이번 로드에서 새로 해금된 캐릭터 (축하 연출 대상) */
  newCharacters: CharacterDef[];
  /** 이번 로드에서 새로 달성한 업적 */
  newAchievements: AchievementDef[];
  loading: boolean;
  /** 새 해금/달성 연출을 본 것으로 처리 (다시 안 뜨게) */
  acknowledge: () => Promise<void>;
  refresh: () => void;
}

/**
 * 스냅샷 기반 누적 진행도 + 업적/캐릭터 달성 상태를 계산하는 훅.
 * 이전에 본 적 없는 신규 달성을 감지해 축하 연출에 쓰도록 분리 반환함.
 */
export function useProgress(
  stepGoal: number = DEFAULT_DAILY_GOALS.steps
): UseProgressState {
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const [achievements, setAchievements] = useState<AchievementStatus[]>([]);
  const [characters, setCharacters] = useState<CharacterStatus[]>([]);
  const [newCharacters, setNewCharacters] = useState<CharacterDef[]>([]);
  const [newAchievements, setNewAchievements] = useState<AchievementDef[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const source = getHealthDataSource();
      // 스냅샷 최신화 → 활동 진행도 → 업적 보상 반영
      const snapshots = await syncSnapshots(source, stepGoal);
      const base = computeProgressFromSnapshots(snapshots);
      const { progress: p, earnedIds } = applyAchievements(base, ACHIEVEMENTS);
      setProgress(p);

      const achievementStatuses = ACHIEVEMENTS.map((def) => ({
        def,
        earned: earnedIds.has(def.id),
      }));
      const charStatuses = CHARACTERS.map((def) => ({
        def,
        unlocked: def.isUnlocked(p),
      }));
      setAchievements(achievementStatuses);
      setCharacters(charStatuses);

      const earnedAch = achievementStatuses.filter((a) => a.earned);
      const unlockedChars = charStatuses.filter((c) => c.unlocked);

      // 첫 실행/업데이트 직후: 이미 달성한 것들은 기준선으로 조용히 처리 (스팸 방지).
      // 이후 로드부터 신규 달성만 축하.
      if (!(await isCelebrationBaselined())) {
        await Promise.all([
          markAchievementsSeen(earnedAch.map((a) => a.def.id)),
          markCharactersSeen(unlockedChars.map((c) => c.def.id)),
          setCelebrationBaselined(),
        ]);
        setNewAchievements([]);
        setNewCharacters([]);
        return;
      }

      // 신규 달성 감지 (이미 본 것 제외)
      const [seenAch, seenChars] = await Promise.all([
        getSeenAchievements(),
        getSeenCharacters(),
      ]);
      setNewAchievements(
        earnedAch.filter((a) => !seenAch.has(a.def.id)).map((a) => a.def)
      );
      setNewCharacters(
        unlockedChars.filter((c) => !seenChars.has(c.def.id)).map((c) => c.def)
      );
    } catch (e) {
      console.error("[useProgress] 진행도 계산 실패:", e);
    } finally {
      setLoading(false);
    }
  }, [stepGoal]);

  useEffect(() => {
    load();
  }, [load]);

  /** 신규 달성을 본 것으로 저장하고 목록 비움 */
  const acknowledge = useCallback(async () => {
    await Promise.all([
      markAchievementsSeen(newAchievements.map((a) => a.id)),
      markCharactersSeen(newCharacters.map((c) => c.id)),
    ]);
    setNewAchievements([]);
    setNewCharacters([]);
  }, [newAchievements, newCharacters]);

  return {
    progress,
    achievements,
    characters,
    newCharacters,
    newAchievements,
    loading,
    acknowledge,
    refresh: load,
  };
}
