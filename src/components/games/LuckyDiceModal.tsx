import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { X, Dices, Sparkles, TrendingUp, Award, Coins } from 'lucide-react';

interface LuckyDiceModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateCoins: (deltaCoins: number) => void;
}

export const LuckyDiceModal: React.FC<LuckyDiceModalProps> = ({
  user,
  onClose,
  onUpdateCoins,
}) => {
  const [selectedBetType, setSelectedBetType] = useState<'low' | 'seven' | 'high'>('high');
  const [betAmount, setBetAmount] = useState<number>(100);
  const [dice1, setDice1] = useState<number>(3);
  const [dice2, setDice2] = useState<number>(4);
  const [isRolling, setIsRolling] = useState(false);
  const [lastResultMsg, setLastResultMsg] = useState<string | null>(null);
  const [isWin, setIsWin] = useState<boolean | null>(null);

  const diceIcons = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  const handleRollDice = () => {
    if (isRolling) return;
    if (user.coins < betAmount) {
      setLastResultMsg('⚠️ رصيدك لا يكفي لتغطية مبلغ الرهان!');
      setIsWin(false);
      return;
    }

    onUpdateCoins(-betAmount);
    setIsRolling(true);
    setLastResultMsg(null);
    setIsWin(null);

    // Dice roll rolling animation cycles
    let counter = 0;
    const interval = setInterval(() => {
      setDice1(Math.floor(Math.random() * 6) + 1);
      setDice2(Math.floor(Math.random() * 6) + 1);
      counter++;
      if (counter >= 12) {
        clearInterval(interval);
        
        // Final Roll
        const finalD1 = Math.floor(Math.random() * 6) + 1;
        const finalD2 = Math.floor(Math.random() * 6) + 1;
        const sum = finalD1 + finalD2;
        setDice1(finalD1);
        setDice2(finalD2);
        setIsRolling(false);

        // Evaluate outcome
        let won = false;
        let winMultiplier = 0;

        if (selectedBetType === 'low' && sum >= 2 && sum <= 6) {
          won = true;
          winMultiplier = 2;
        } else if (selectedBetType === 'high' && sum >= 8 && sum <= 12) {
          won = true;
          winMultiplier = 2;
        } else if (selectedBetType === 'seven' && sum === 7) {
          won = true;
          winMultiplier = 4;
        }

        if (won) {
          const reward = betAmount * winMultiplier;
          onUpdateCoins(reward);
          setIsWin(true);
          setLastResultMsg(`🎉 مبروك! المجموع (${sum}) - ربحت ${reward.toLocaleString()} كوينز!`);
        } else {
          setIsWin(false);
          setLastResultMsg(`حظ أوفر! المجموع كان (${sum})`);
        }
      }
    }, 120);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans text-white animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#1c1335] via-[#100a22] to-[#0a0517] border-2 border-purple-500/80 rounded-3xl p-5 text-center shadow-[0_0_40px_rgba(168,85,247,0.3)] space-y-4 overflow-hidden">
        
        {/* Glow ambient */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-purple-900/50 pb-2.5">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            <Dices className="w-5 h-5 text-purple-400 animate-pulse" />
            <h3 className="font-black text-sm text-purple-300">لعبة النرد الذهبي 🎲</h3>
          </div>

          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-300">
            <span>🪙 {user.coins.toLocaleString()}</span>
          </div>
        </div>

        {/* 🎲 3D DICE DISPLAY CONTAINER */}
        <div className="py-3 flex items-center justify-center gap-6">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 border-2 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)] flex items-center justify-center text-5xl text-slate-950 font-black select-none ${isRolling ? 'animate-spin' : 'hover:scale-105 transition-transform'}`}>
            {diceIcons[dice1 - 1]}
          </div>

          <span className="text-xl font-black text-amber-300">+</span>

          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-400 border-2 border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.6)] flex items-center justify-center text-5xl text-white font-black select-none ${isRolling ? 'animate-spin' : 'hover:scale-105 transition-transform'}`}>
            {diceIcons[dice2 - 1]}
          </div>
        </div>

        <div className="text-xs font-bold text-slate-300">
          المجموع الحالي: <span className="font-mono text-amber-300 text-sm font-black">{dice1 + dice2}</span>
        </div>

        {/* RESULT WINNER / LOSS NOTICE */}
        {lastResultMsg && (
          <div className={`p-2.5 rounded-xl border text-xs font-black animate-in zoom-in-95 duration-150 ${isWin ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300' : 'bg-red-950/80 border-red-500/60 text-red-300'}`}>
            {lastResultMsg}
          </div>
        )}

        {/* 🎯 BET SELECTION OPTIONS */}
        <div className="grid grid-cols-3 gap-2 text-xs font-black">
          <button
            onClick={() => setSelectedBetType('low')}
            className={`py-2 px-1 rounded-xl border transition-all ${selectedBetType === 'low' ? 'bg-cyan-600/40 border-cyan-400 text-cyan-200 shadow-md scale-102' : 'bg-slate-900/60 border-slate-700/60 text-slate-400'}`}
          >
            <div>صغير (2-6)</div>
            <div className="text-[10px] text-cyan-400 font-normal">ربح 2x</div>
          </button>

          <button
            onClick={() => setSelectedBetType('seven')}
            className={`py-2 px-1 rounded-xl border transition-all ${selectedBetType === 'seven' ? 'bg-amber-600/40 border-amber-400 text-amber-200 shadow-md scale-102' : 'bg-slate-900/60 border-slate-700/60 text-slate-400'}`}
          >
            <div>رقم (7) 🔥</div>
            <div className="text-[10px] text-amber-400 font-normal">ربح 4x</div>
          </button>

          <button
            onClick={() => setSelectedBetType('high')}
            className={`py-2 px-1 rounded-xl border transition-all ${selectedBetType === 'high' ? 'bg-rose-600/40 border-rose-400 text-rose-200 shadow-md scale-102' : 'bg-slate-900/60 border-slate-700/60 text-slate-400'}`}
          >
            <div>كبير (8-12)</div>
            <div className="text-[10px] text-rose-400 font-normal">ربح 2x</div>
          </button>
        </div>

        {/* 💰 BET AMOUNT SELECTOR */}
        <div className="flex items-center justify-between gap-1.5 pt-1">
          {[50, 100, 250, 500, 1000].map((amt) => (
            <button
              key={amt}
              onClick={() => setBetAmount(amt)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black border transition-all ${betAmount === amt ? 'bg-amber-500 text-slate-950 border-amber-300 font-black' : 'bg-slate-900/70 border-slate-800 text-slate-400'}`}
            >
              {amt}
            </button>
          ))}
        </div>

        {/* 🚀 ROLL ACTION BUTTON */}
        <button
          onClick={handleRollDice}
          disabled={isRolling}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 hover:brightness-110 text-white font-black text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50"
        >
          {isRolling ? 'جاري رمي النرد... 🎲' : `رمي النرد الآن (${betAmount.toLocaleString()} 🪙)`}
        </button>
      </div>
    </div>
  );
};
