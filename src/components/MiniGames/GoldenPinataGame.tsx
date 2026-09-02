import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Sparkles, Trophy, RefreshCw } from 'lucide-react';

interface GoldenPinataGameProps {
  user: UserProfile;
  onUpdateCoins: (delta: number) => void;
}

export const GoldenPinataGame: React.FC<GoldenPinataGameProps> = ({ user, onUpdateCoins }) => {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [pinatas, setPinatas] = useState<{ id: number; smashed: boolean; multiplier: number }[]>([
    { id: 1, smashed: false, multiplier: 1.5 },
    { id: 2, smashed: false, multiplier: 2.0 },
    { id: 3, smashed: false, multiplier: 0.5 },
    { id: 4, smashed: false, multiplier: 3.0 },
    { id: 5, smashed: false, multiplier: 1.2 },
    { id: 6, smashed: false, multiplier: 5.0 },
  ]);
  const [isHitting, setIsHitting] = useState<boolean>(false);
  const [lastWinMsg, setLastWinMsg] = useState<string | null>(null);

  const handleHitPinata = (pinataId: number) => {
    if (user.coins < betAmount) {
      alert('رصيدك من العملات غير كافٍ!');
      return;
    }

    setIsHitting(true);
    setLastWinMsg(null);

    // Deduct bet
    onUpdateCoins(-betAmount);

    setTimeout(() => {
      // Random multipliers pool: 0.5x, 1.2x, 2.0x, 3.5x, 8.0x
      const multipliers = [0.5, 1.2, 2.0, 3.5, 8.0, 1.5, 2.5];
      const randomMult = multipliers[Math.floor(Math.random() * multipliers.length)];
      const winPayout = Math.floor(betAmount * randomMult);

      onUpdateCoins(winPayout);

      setPinatas((prev) =>
        prev.map((p) => (p.id === pinataId ? { ...p, smashed: true, multiplier: randomMult } : p))
      );

      setIsHitting(false);
      setLastWinMsg(`🎉 كسرت البينايا وتحصلت على مفاجأة بـ ${winPayout.toLocaleString()} عملة (${randomMult}x)!`);
    }, 800);
  };

  const handleResetPinatas = () => {
    setPinatas((prev) => prev.map((p) => ({ ...p, smashed: false })));
    setLastWinMsg(null);
  };

  return (
    <div className="bg-slate-950 p-4 sm:p-5 rounded-3xl border-2 border-amber-500/40 text-white space-y-4 shadow-2xl relative overflow-hidden dir-rtl text-right font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg">
            🪅
          </div>
          <div>
            <h3 className="font-black text-base text-amber-300">البينايا الذهبية (Golden Pinata) ✨</h3>
            <p className="text-[11px] text-slate-400">اختر البينايا واضربها لتحصد الجوائز المخبأة حتى 8x!</p>
          </div>
        </div>

        <button
          onClick={handleResetPinatas}
          className="bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 border border-amber-500/30 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>تجديد البينايات</span>
        </button>
      </div>

      {lastWinMsg && (
        <div className="bg-amber-950/80 border border-amber-500 text-amber-200 p-3 rounded-2xl text-xs font-black text-center animate-in zoom-in-95">
          {lastWinMsg}
        </div>
      )}

      {/* Pinatas Grid */}
      <div className="grid grid-cols-3 gap-3 p-2 bg-slate-900 rounded-2xl border border-slate-800">
        {pinatas.map((p) => (
          <button
            key={p.id}
            onClick={() => handleHitPinata(p.id)}
            disabled={isHitting || p.smashed}
            className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer relative ${
              p.smashed
                ? 'bg-slate-950 border-amber-500/30 opacity-80'
                : 'bg-gradient-to-b from-amber-950/60 to-slate-950 border-amber-500 hover:scale-105 shadow-xl'
            }`}
          >
            <span className="text-4xl mb-1">{p.smashed ? '💥' : '🪅'}</span>
            <span className="font-black text-xs text-amber-300">
              {p.smashed ? `${p.multiplier}x 🪙` : 'انقر للكسر'}
            </span>
          </button>
        ))}
      </div>

      {/* Bet Controls */}
      <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-bold">
        <span className="text-slate-300">قيمة الضرب للبينايا:</span>
        <div className="flex items-center gap-1.5">
          {[50, 100, 200, 500].map((amt) => (
            <button
              key={amt}
              onClick={() => setBetAmount(amt)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold cursor-pointer ${
                betAmount === amt ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-950 text-slate-300'
              }`}
            >
              {amt} 🪙
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
