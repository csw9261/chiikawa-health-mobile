// 하단 탭 네비게이션.
// 6개 화면(홈/운동/미션/도감/성취/설정) 전환. 현재 탭은 포인트 색으로 강조.

export type TabKey =
  | "home"
  | "workout"
  | "mission"
  | "collection"
  | "achievement"
  | "settings";

interface TabDef {
  key: TabKey;
  label: string;
  emoji: string;
}

const TABS: TabDef[] = [
  { key: "home", label: "홈", emoji: "🏠" },
  { key: "workout", label: "운동", emoji: "🏃" },
  { key: "mission", label: "미션", emoji: "📋" },
  { key: "collection", label: "도감", emoji: "📖" },
  { key: "achievement", label: "성취", emoji: "🏆" },
  { key: "settings", label: "설정", emoji: "⚙️" },
];

interface BottomNavProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-peach/20 bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex flex-1 flex-col items-center gap-0.5 py-1"
            aria-current={isActive ? "page" : undefined}
          >
            <span className={`text-xl ${isActive ? "scale-110" : "opacity-50"}`}>
              {tab.emoji}
            </span>
            <span
              className={`text-[10px] font-bold ${isActive ? "text-peach" : "text-cocoa/40"}`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
