import React, { useState, useEffect } from 'react';
import { UserProfile, DailySpinReward } from '../../types';
import { X, Sparkles, Gift, Flame, Trophy, Coins, Clock, CheckCircle } from 'lucide-react';

interface DailySpinModalProps {
  user: UserProfile;
  onClose: () => void;
  onRewardWon: (reward: DailySpinReward) => void;
}

const SPIN_REWARDS: DailySpinReward[] = [
  { id: 'r1', type: 'coins', amount: 100, label: '100 عملة 🪙', icon: '🪙', color: '#854d0e' },
  { id: 'r2', type: 'xp', amount: 500, label: '500 XP ثراء ⭐', icon: '⭐', color: '#1e3a8a' },
  { id: 'r3', type: 'coins', amount: 500, label: '500 عملة 🪙', icon: '🪙', color: '#14532d' },
  { id: 'r4', type: 'frame', amount: 1, label: 'إطار VIP تجريبي 👑', icon: '👑', color: '#581c87' },
  { id: 'r5', type: 'coins', amount: 1500, label: '1,500 عملة 🪙', icon: '🪙', color: '#7c2d12' },
  { id: 'r6', type: 'diamonds', amount: 200, label: '200 ماسة 💎', icon: '💎', color: '#0e7490' },
  { id: 'r7', type: 'coins', amount: 5000, label: '5,000 عملة كبرى 🪙', icon: '🔥', color: '#be123c' },
  { id: 'r8', type: 'coins', amount: 10000, label: '10,000 JACKPOT 🎰', icon: '🎰', color: '#ca8a04' },
];

export const DailySpinModal: React.FC<DailySpinModalProps> = ({ user, onClose, onRewardWon }) => {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);
  const [wonReward, setWonReward] = useState<DailySpinReward | null>(null);
  const [canSpinToday, setCanSpinToday] = useState<boolean>(true);
  const [timeUntilNextSpin, setTimeUntilNextSpin] = useState<string>('');

  useEffect(() => {
    const lastSpinStr = localStorage.getItem('last_daily_spin_timestamp');
    if (lastSpinStr) {
      const lastSpin = parseInt(lastSpinStr, 10);
      const now = Date.now();
      const elapsedMs = now - lastSpin;
      const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours

      if (elapsedMs < cooldownMs) {
        setCanSpinToday(false);
        const remainingMs = cooldownMs - elapsedMs;
        const hrs = Math.floor(remainingMs / (60 * 60 * 1000));
        const mins = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
        setTimeUntilNextSpin(`${hrs} ساعة و ${mins} دقيقة`);
      }
    }
  }, []);

  const handleSpin = () => {
    if (isSpinning || !canSpinToday) return;

    setIsSpinning(true);
    setWonReward(null);

    // Pick random reward index
    const pickedIndex = Math.floor(Math.random() * SPIN_REWARDS.length);
    const sliceAngle = 360 / SPIN_REWARDS.length;
    // Calculate final degrees (e.g. 5 full rotations + slice target)
    const extraRotations = 5 * 360;
    const targetDegree = extraRotations + (SPIN_REWARDS.length - pickedIndex) * sliceAngle - sliceAngle / 2;

    setRotationDegrees(targetDegree);

    setTimeout(() => {
      setIsSpinning(false);
      const chosen = SPIN_REWARDS[pickedIndex];
      setWonReward(chosen);
      setCanSpinToday(false);
      localStorage.setItem('last_daily_spin_timestamp', Date.now().toString());
      onRewardWon(chosen);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200 dir-rtl font-sans select-none">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#211740] via-[#140e29] to-[#0a0717] border-2 border-amber-400/80 rounded-3xl p-4 sm:p-5 space-y-4 shadow-[0_0_60px_rgba(245,158,11,0.35)] relative z-10 overflow-hidden text-right text-white">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-gradient-to-b from-amber-500/25 to-transparent blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/50 pb-2.5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-600 p-0.5 shadow-lg flex items-center justify-center text-lg animate-bounce">
              🎡
            </div>
            <div>
              <h3 className="font-black text-sm text-amber-300">عجلة الحظ اليومية المجانية</h3>
              <p className="text-[10px] text-slate-300">لفة مجانية مضمونة كل 24 ساعة!</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 🎡 SPIN WHEEL CONTAINER */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto my-2 flex items-center justify-center">
          
          {/* Wheel Pointer at Top */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 animate-pulse" />
          </div>

          {/* Outer Glowing Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.5)] pointer-events-none" />

          {/* Rotating Canvas / Wheel */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-500 overflow-hidden relative shadow-2xl transition-transform ease-out"
            style={{
              transform: `rotate(${rotationDegrees}deg)`,
              transitionDuration: isSpinning ? '4s' : '0s',
              transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.25, 1)',
              background: 'radial-gradient(circle, #2a1b4e 0%, #120924 100%)',
            }}
          >
            {SPIN_REWARDS.map((rew, index) => {
              const angle = (360 / SPIN_REWARDS.length) * index;
              return (
                <div
                  key={rew.id}
                  className="absolute top-0 left-1/2 w-28 h-32 -ml-14 origin-bottom flex flex-col items-center pt-2.5 text-center"
                  style={{
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <span className="text-xl filter drop-shadow">{rew.icon}</span>
                  <span className="text-[9px] font-black text-amber-200 font-mono mt-0.5 line-clamp-1">
                    {rew.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Center Spin Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning || !canSpinToday}
            className={`absolute z-20 w-16 h-16 rounded-full font-black text-xs shadow-2xl flex flex-col items-center justify-center border-2 border-amber-300 transition-all cursor-pointer ${
              canSpinToday
                ? 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-slate-950 hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(245,158,11,0.8)]'
                : 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed opacity-80'
            }`}
          >
            <span className="text-sm">🎡</span>
            <span>{isSpinning ? '...' : canSpinToday ? 'تدوير' : 'انتظر'}</span>
          </button>
        </div>

        {/* Won Notice Celebration */}
        {wonReward && (
          <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 rounded-2xl p-3 text-center animate-in zoom-in font-black text-sm shadow-xl">
            🎉 مبروك! فزت بـ {wonReward.label} وتمت إضافتها فوراً إلى حسابك!
          </div>
        )}

        {/* Cooldown Status or Spin Action */}
        {!canSpinToday && !wonReward && (
          <div className="bg-[#18102d] border border-purple-500/40 rounded-2xl p-3 text-center space-y-1 text-xs">
            <p className="text-amber-300 font-bold flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>اللفة القادمة متاحة بعد:</span>
            </p>
            <p className="font-mono text-cyan-300 text-sm font-black">{timeUntilNextSpin || '24 ساعة'}</p>
          </div>
        )}

      </div>
    </div>
  );
};
