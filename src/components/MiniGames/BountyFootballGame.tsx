import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Trophy, RefreshCw, Sparkles, Shield, Flame, CheckCircle2 } from 'lucide-react';

interface BountyFootballGameProps {
  user: UserProfile;
  onUpdateCoins: (delta: number) => void;
}

export const BountyFootballGame: React.FC<BountyFootballGameProps> = ({ user, onUpdateCoins }) => {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [selectedCorner, setSelectedCorner] = useState<'tl' | 'tr' | 'bl' | 'br' | 'center' | null>(null);
  const [isShooting, setIsShooting] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    multiplier: number;
    payout: number;
    msg: string;
  } | null>(null);

  const CORNERS = [
    { id: 'tl', label: 'الزاوية اليسرى العليا ⚽', multiplier: 2.5 },
    { id: 'tr', label: 'الزاوية اليمنى العليا ⚽', multiplier: 2.5 },
    { id: 'center', label: 'منتصف المرمى ⚽', multiplier: 1.8 },
    { id: 'bl', label: 'الزاوية اليسرى السفلى ⚽', multiplier: 2.0 },
    { id: 'br', label: 'الزاوية اليمنى السفلى ⚽', multiplier: 2.0 },
  ];

  const handleShootGoal = () => {
    if (!selectedCorner) {
      alert('اختر زاوية التسديد أولاً!');
      return;
    }
    if (user.coins < betAmount) {
      alert('رصيدك من العملات غير كافٍ للرهان!');
      return;
    }

    setIsShooting(true);
    setLastResult(null);

    // Deduct bet
    onUpdateCoins(-betAmount);

    setTimeout(() => {
      // 65% Win chance for Penalty Shootout
      const isGoal = Math.random() < 0.65;
      const cornerObj = CORNERS.find((c) => c.id === selectedCorner);
      const mult = cornerObj?.multiplier || 2.0;

      if (isGoal) {
        const winPayout = Math.floor(betAmount * mult);
        onUpdateCoins(winPayout);
        setLastResult({
          success: true,
          multiplier: mult,
          payout: winPayout,
          msg: `🎉 هدف خيالي!! دخلت الكرة الشباك بنجاح وكسبت ${winPayout.toLocaleString()} عملة (${mult}x)!`,
        });
      } else {
        setLastResult({
          success: false,
          multiplier: 0,
          payout: 0,
          msg: '❌ تصدى حارس المرمى للكرة! حاول مرة أخرى.',
        });
      }

      setIsShooting(false);
    }, 1200);
  };

  return (
    <div className="bg-slate-950 p-4 sm:p-5 rounded-3xl border-2 border-emerald-500/40 text-white space-y-4 shadow-2xl relative overflow-hidden dir-rtl text-right">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg">
            ⚽
          </div>
          <div>
            <h3 className="font-black text-base text-emerald-300">باونتي فوتبول (Bounty Football) 🔥</h3>
            <p className="text-[11px] text-slate-400">سدد ركلة الجزاء على المرمى وضاعف رهاناتك حتى 2.5x</p>
          </div>
        </div>

        <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-black text-xs px-3 py-1 rounded-full">
          مواجهة الحارس 🥅
        </span>
      </div>

      {/* Goal Post Interactive Visualizer */}
      <div className="relative bg-gradient-to-b from-sky-900 via-emerald-950 to-emerald-900 h-48 sm:h-56 rounded-2xl border-4 border-slate-200 shadow-inner flex flex-col justify-between p-3 overflow-hidden">
        {/* Net background grid */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

        {/* Goalkeeper Animated Center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`text-5xl transition-all duration-500 ${isShooting ? 'animate-bounce scale-125' : ''}`}>
            🧤🏃
          </div>
        </div>

        {/* Goal Corners Targets */}
        <div className="relative z-10 grid grid-cols-3 gap-2 h-full">
          {CORNERS.map((corner) => (
            <button
              key={corner.id}
              onClick={() => setSelectedCorner(corner.id as any)}
              className={`rounded-xl border-2 p-2 flex flex-col items-center justify-center font-black text-xs transition-all cursor-pointer ${
                selectedCorner === corner.id
                  ? 'bg-amber-500 text-slate-950 border-white shadow-xl scale-105'
                  : 'bg-slate-950/60 text-white border-white/20 hover:border-amber-400 hover:bg-slate-900/80'
              }`}
            >
              <span>{corner.label}</span>
              <span className="font-mono text-[10px] text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded-md mt-1">
                {corner.multiplier}x
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Result Alert */}
      {lastResult && (
        <div
          className={`p-3 rounded-2xl border text-xs font-black text-center animate-in zoom-in-95 ${
            lastResult.success
              ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
              : 'bg-rose-950 text-rose-300 border-rose-500'
          }`}
        >
          {lastResult.msg}
        </div>
      )}

      {/* Bet Amount Controls */}
      <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-300">اختر قيمة رهان ركلة الجزاء (🪙):</span>
          <span className="text-amber-400 font-mono">{betAmount.toLocaleString()} عملة</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[50, 100, 250, 500, 1000].map((amt) => (
            <button
              key={amt}
              onClick={() => setBetAmount(amt)}
              className={`py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                betAmount === amt ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-300 border border-slate-800'
              }`}
            >
              {amt} 🪙
            </button>
          ))}
        </div>

        <button
          onClick={handleShootGoal}
          disabled={isShooting || !selectedCorner}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-black text-sm rounded-xl shadow-xl hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>{isShooting ? 'جاري تسديد الكرة نحو الشباك...' : 'تسديد ركلة الجزاء ⚽⚡'}</span>
        </button>
      </div>
    </div>
  );
};
