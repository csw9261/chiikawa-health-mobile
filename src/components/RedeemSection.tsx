import { useState } from "react";
import { useProgressContext } from "../contexts/progress-context";
import { useSettings } from "../contexts/settings-context";
import { usePoints } from "../hooks/use-points";

// 포인트 환전(차감) + 비밀번호 변경 섹션 (설정 탭).
// 차감은 비밀번호로 보호 (남편만). 비밀번호는 기존 확인 후 변경 가능.

/** ISO → "6/11 오후 3:20" 간단 표기 */
function formatRedeemedAt(iso: string): string {
  const d = new Date(iso);
  const period = d.getHours() < 12 ? "오전" : "오후";
  const h12 = d.getHours() % 12 === 0 ? 12 : d.getHours() % 12;
  return `${d.getMonth() + 1}/${d.getDate()} ${period} ${h12}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function RedeemSection() {
  const { progress } = useProgressContext();
  const { settings, update } = useSettings();
  const earned = progress
    ? progress.activityPoints + progress.achievementPoints
    : 0;
  const { balance, redemptions, redeem } = usePoints(earned);

  // 차감 폼 상태
  const [pin, setPin] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  // 비밀번호 변경 폼 상태
  const [showPinChange, setShowPinChange] = useState(false);
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinMsg, setPinMsg] = useState<string | null>(null);

  const handleRedeem = async () => {
    setMsg(null);
    // 비밀번호 검증
    if (pin !== settings.redeemPin) {
      setMsg("비밀번호가 맞지 않아요.");
      return;
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setMsg("차감할 포인트를 입력해 주세요.");
      return;
    }
    if (amt > balance) {
      setMsg("잔액보다 많이 차감할 수 없어요.");
      return;
    }
    await redeem(Math.round(amt), note.trim() || undefined);
    setPin("");
    setAmount("");
    setNote("");
    setMsg("환전 차감 완료!");
    setTimeout(() => setMsg(null), 2000);
  };

  const handlePinChange = async () => {
    setPinMsg(null);
    if (oldPin !== settings.redeemPin) {
      setPinMsg("기존 비밀번호가 맞지 않아요.");
      return;
    }
    if (!/^\d{4,8}$/.test(newPin)) {
      setPinMsg("새 비밀번호는 숫자 4~8자리로 해주세요.");
      return;
    }
    await update({ redeemPin: newPin });
    setOldPin("");
    setNewPin("");
    setShowPinChange(false);
    setPinMsg(null);
  };

  return (
    <section className="blob-card flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-cocoa">포인트 환전 (차감)</h2>
        <span className="text-xs text-cocoa/50">잔액 {balance.toLocaleString()}P</span>
      </div>
      <p className="text-[11px] text-cocoa/40">
        선물로 환전해 줄 때 비밀번호를 넣고 차감하세요.
      </p>

      {/* 차감 폼 */}
      <input
        type="password"
        inputMode="numeric"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="비밀번호"
        className="rounded-xl bg-cream px-3 py-2 text-sm text-cocoa"
      />
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="차감 포인트"
          className="w-1/2 rounded-xl bg-cream px-3 py-2 text-sm text-cocoa"
        />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="메모(선물 등)"
          className="w-1/2 rounded-xl bg-cream px-3 py-2 text-sm text-cocoa"
        />
      </div>
      <button
        onClick={handleRedeem}
        className="rounded-full bg-peach py-2.5 text-sm font-bold text-white"
      >
        차감하기
      </button>
      {msg && <p className="text-center text-xs text-cocoa/60">{msg}</p>}

      {/* 비밀번호 변경 */}
      <button
        onClick={() => setShowPinChange((v) => !v)}
        className="text-left text-[11px] text-cocoa/50 underline"
      >
        비밀번호 변경
      </button>
      {showPinChange && (
        <div className="flex flex-col gap-2 rounded-2xl bg-cream p-3">
          <input
            type="password"
            inputMode="numeric"
            value={oldPin}
            onChange={(e) => setOldPin(e.target.value)}
            placeholder="기존 비밀번호"
            className="rounded-xl bg-surface px-3 py-2 text-sm text-cocoa"
          />
          <input
            type="password"
            inputMode="numeric"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="새 비밀번호 (숫자 4~8자리)"
            className="rounded-xl bg-surface px-3 py-2 text-sm text-cocoa"
          />
          <button
            onClick={handlePinChange}
            className="rounded-full bg-sky/60 py-2 text-sm font-bold text-cocoa"
          >
            변경
          </button>
          {pinMsg && <p className="text-center text-xs text-cocoa/60">{pinMsg}</p>}
        </div>
      )}

      {/* 최근 차감 내역 */}
      {redemptions.length > 0 && (
        <div className="mt-1">
          <p className="mb-1 text-[11px] font-bold text-cocoa/60">차감 내역</p>
          <ul className="flex flex-col gap-1">
            {redemptions.slice(0, 5).map((r) => (
              <li
                key={r.id}
                className="flex justify-between text-[11px] text-cocoa/50"
              >
                <span>
                  {formatRedeemedAt(r.redeemedAt)}
                  {r.note ? ` · ${r.note}` : ""}
                </span>
                <span>-{r.amount.toLocaleString()}P</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
