// 아직 구현되지 않은 화면용 플레이스홀더.
// 이후 Phase에서 각각 실제 화면으로 교체됨.

interface PlaceholderScreenProps {
  title: string;
  emoji: string;
  note: string;
}

export function PlaceholderScreen({ title, emoji, note }: PlaceholderScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 pb-24 pt-24 text-center">
      <div className="text-5xl opacity-60">{emoji}</div>
      <h1 className="text-lg font-bold text-cocoa">{title}</h1>
      <p className="text-xs text-cocoa/40">{note}</p>
    </div>
  );
}
