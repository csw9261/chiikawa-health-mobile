import { motion } from "framer-motion";

// 활동 링 (원형 진행률) 컴포넌트.
// 걸음/거리/칼로리 등 목표 대비 달성률을 SVG 원호로 표시. 화면 곳곳에서 재사용.

interface ActivityRingProps {
  /** 달성률 0~1 (1 초과 시 1로 클램프되지만 색은 달성 상태로) */
  progress: number;
  /** 링 지름(px) */
  size?: number;
  /** 링 두께(px) */
  strokeWidth?: number;
  /** 진행 호 색상 (Tailwind 색이 아닌 실제 색상값) */
  color: string;
  /** 가운데 표시할 이모지/아이콘 */
  emoji: string;
  /** 라벨 (예: 걸음) */
  label: string;
  /** 값 텍스트 (예: 6,200) */
  valueText: string;
}

const TRACK_COLOR = "#f1e6e6"; // 미달성 트랙 색 (연한 회분홍)

export function ActivityRing({
  progress,
  size = 120,
  strokeWidth = 12,
  color,
  emoji,
  label,
  valueText,
}: ActivityRingProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // 진행 호 길이 = 둘레 * 달성률. dashoffset으로 미달성분을 비움
  const dashOffset = circumference * (1 - clamped);
  const isComplete = progress >= 1;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* 배경 트랙 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={TRACK_COLOR}
            strokeWidth={strokeWidth}
          />
          {/* 진행 호 - 채워지는 애니메이션 */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        {/* 가운데 이모지 - 달성 시 통통 튀는 모션 */}
        <div
          className={`absolute inset-0 flex items-center justify-center text-3xl ${isComplete ? "animate-pop" : ""}`}
        >
          {emoji}
        </div>
      </div>
      <span className="text-sm font-bold text-cocoa">{valueText}</span>
      <span className="text-xs text-cocoa/50">{label}</span>
    </div>
  );
}
