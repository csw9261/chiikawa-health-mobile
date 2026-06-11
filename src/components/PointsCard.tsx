import { usePoints } from "../hooks/use-points";

// 포인트 잔액 카드 (성취 탭). 적립/차감/잔액을 보여줌.

interface PointsCardProps {
  /** 누적 적립 포인트 (활동 + 업적) */
  earnedPoints: number;
}

export function PointsCard({ earnedPoints }: PointsCardProps) {
  const { earned, redeemed, balance } = usePoints(earnedPoints);

  return (
    <section className="blob-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-cocoa">내 포인트</h2>
        <span className="text-[10px] text-cocoa/40">1 P = 1원</span>
      </div>
      <p className="mt-2 text-3xl font-bold text-peach">
        {balance.toLocaleString()}
        <span className="ml-1 text-base font-medium text-cocoa/50">P</span>
      </p>
      <div className="mt-2 flex gap-4 text-[11px] text-cocoa/50">
        <span>적립 {earned.toLocaleString()}P</span>
        <span>환전 {redeemed.toLocaleString()}P</span>
      </div>
    </section>
  );
}
