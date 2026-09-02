import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { X, Sparkles, Trophy, Award, Gift, Volume2, Coins, Play } from 'lucide-react';

interface LuckyWheelModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateCoins: (deltaCoins: number) => void;
  onUpdateDiamonds: (deltaDiamonds: number) => void;
}

interface WheelSector {
  id: number;
  label: string;
  type: 'coins' | 'diamonds' | 'frame' | 'try_again';
  amount: number;
  color: string;
  icon: string;
}

export const LuckyWheelModal: React.FC<LuckyWheelModalProps> = ({
  user,
  onClose,
  onUpdateCoins,
  onUpdateDiamonds,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [rewardWon, setRewardWon] = useState<WheelSector | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const SPIN_COST = 50;

  const sectors: WheelSector[] = [
    { id: 1, label: '+100 كوينز', type: 'coins', amount: 100, color: '#f59e0b', icon: '🪙' },
    { id: 2, label: '+10 ماسات', type: 'diamonds', amount: 10, color: '#06b6d4', icon: '💎' },
    { id: 3, label: '+500 كوينز', type: 'coins', amount: 500, color: '#8b5cf6', icon: '💰' },
    { id: 4, label: 'حظ أوفر', type: 'try_again', amount: 0, color: '#475569', icon: '🍀' },
    { id: 5, label: '+50 ماسة', type: 'diamonds', amount: 50, color: '#ec4899', icon: '💎' },
    { id: 6, label: '+1,000 كوينز', type: 'coins', amount: 1000, color: '#eab308', icon: '👑' },
    { id: 7, label: 'إطار VIP نيون', type: 'frame', amount: 1, color: '#10b981', icon: '✨' },
    { id: 8, label: 'جاكبوت +5,000', type: 'coins', amount: 5000, color: '#ef4444', icon: '🔥' },
  ];

  const handleSpin = () => {
    if (isSpinning) return;
    if (user.coins < SPIN_COST) {
      setErrorMsg(`⚠️ رصيدك لا يكفي! تكلفة التدوير ${SPIN_COST} كوينز.`);
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    // Deduct cost
    onUpdateCoins(-SPIN_COST);
    setIsSpinning(true);
    setRewardWon(null);

    // Pick random winner sector
    const winningIndex = Math.floor(Math.random() * sectors.length);
    const sectorAngle = 360 / sectors.length;
    // 5 full rotations (1800 deg) + target sector offset
    const randomOffset = Math.random() * (sectorAngle - 10) + 5;
    const finalDegree = rotationDegree + 1800 + (360 - (winningIndex * sectorAngle + randomOffset));

    setRotationDegree(finalDegree);

    setTimeout(() => {
      setIsSpinning(false);
      const chosen = sectors[winningIndex];
      setRewardWon(chosen);

      if (chosen.type === 'coins' && chosen.amount > 0) {
        onUpdateCoins(chosen.amount);
      } else if (chosen.type === 'diamonds' && chosen.amount > 0) {
        onUpdateDiamonds(chosen.amount);
      }
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans text-white animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#18122B] via-[#0f0a1c] to-[#080511] border-2 border-amber-400/80 rounded-3xl p-5 text-center shadow-[0_0_40px_rgba(245,158,11,0.3)] space-y-4 overflow-hidden">
        
        {/* Glow ambient */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-purple-900/50 pb-2.5">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <h3 className="font-black text-sm text-amber-300">عجلة الحظ الملكية 🎡</h3>
          </div>

          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-300">
            <span>🪙 {user.coins.toLocaleString()}</span>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-950/80 border border-red-500/60 rounded-xl p-2 text-xs text-red-200 animate-bounce">
            {errorMsg}
          </div>
        )}

        {/* 🎡 THE ROTATING WHEEL CANVAS CONTAINER */}
        <div className="relative w-64 h-64 mx-auto my-2 flex items-center justify-center">
          {/* Wheel Pointer Triangle at Top */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 filter drop-shadow-[0_2px_6px_rgba(245,158,11,0.8)]" />

          {/* Outer Golden Ring with Pulsing Lights */}
          <div className="absolute inset-0 rounded-full border-4 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center p-1 bg-slate-950">
            
            {/* Spinning Wheel */}
            <div
              style={{
                transform: `rotate(${rotationDegree}deg)`,
                transition: isSpinning ? 'transform 4.5s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none',
              }}
              className="w-full h-full rounded-full relative overflow-hidden shadow-inner border-2 border-purple-500/50"
            >
              {sectors.map((s, idx) => {
                const angle = (360 / sectors.length) * idx;
                return (
                  <div
                    key={s.id}
                    style={{
                      transform: `rotate(${angle}deg)`,
                      transformOrigin: '50% 50%',
                    }}
                    className="absolute inset-0 flex justify-center pt-2"
                  >
                    <div className="flex flex-col items-center select-none">
                      <span className="text-base">{s.icon}</span>
                      <span className="text-[9px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] line-clamp-1">
                        {s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Spin Button Hub */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="absolute z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 border-2 border-white shadow-[0_0_15px_rgba(245,158,11,0.8)] flex flex-col items-center justify-center text-slate-950 font-black text-xs active:scale-90 transition-transform disabled:opacity-80 cursor-pointer"
          >
            {isSpinning ? (
              <span className="text-[10px] animate-pulse">يدور...</span>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span className="text-[10px] font-black">تدوير</span>
              </>
            )}
          </button>
        </div>

        {/* REWARD WINNER BANNER */}
        {rewardWon && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950 via-amber-950/60 to-purple-950 border border-amber-400/60 shadow-lg text-center animate-in zoom-in-95 duration-200">
            <span className="text-2xl block mb-1">{rewardWon.icon}</span>
            <p className="text-xs font-black text-amber-300">
              {rewardWon.type === 'try_again' ? 'حظ أوفر في المرة القادمة!' : `🎉 مبروك! فزت بـ ${rewardWon.label}`}
            </p>
          </div>
        )}

        {/* Spin Cost Notice & Action */}
        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <span className="text-slate-400">تكلفة التدوير الواحد:</span>
          <span className="font-mono font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
            🪙 50 كوينز
          </span>
        </div>

        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50"
        >
          {isSpinning ? 'جاري التدوير... 🎲' : 'تدوير العجلة الآن (50 🪙)'}
        </button>
      </div>
    </div>
  );
};
