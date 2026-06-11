import { useState } from "react";
import {
  shareText,
  type ShareContent,
} from "../services/share-service";

// 공유 버튼. 클릭 시 build()로 텍스트 요약을 만들어 공유시트를 엶.
// 웹 등 공유 미지원 환경에선 클립보드 복사로 폴백하고 "복사됨" 안내.

interface ShareButtonProps {
  /** 공유할 내용을 클릭 시점에 생성 (최신 값 반영) */
  build: () => ShareContent;
  /** 버튼 라벨 (기본 "공유") */
  label?: string;
  /** 추가 클래스 */
  className?: string;
}

export function ShareButton({ build, label = "공유", className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const result = await shareText(build());
    if (result === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 rounded-full bg-sky/50 px-3 py-1.5 text-xs font-bold text-cocoa ${className}`}
    >
      📤 {copied ? "복사됨!" : label}
    </button>
  );
}
