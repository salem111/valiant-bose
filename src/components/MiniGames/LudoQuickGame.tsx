import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Trophy, Dices, RotateCcw, Shield, Coins, Sparkles } from 'lucide-react';

interface LudoQuickGameProps {
  user: UserProfile;
  onUpdateCoins: (delta: number) => void;
}

export const LudoQuickGame: React.FC<LudoQuickGameProps> = ({ user, onUpdateCoins }) => {
  const [betAmount, setBetAmount] = useState<number>(200);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [playerPos, setPlayerPos] = useState<number>(0); // 0 to 12
  const [botPos, setBotPos] = useState<number>(0); // 0 to 12
  const [currentTurn, setCurrentTurn] = useState<'PLAYER' | 'BOT'>('PLAYER');
  const [gameStatus, setGameStatus] = useState<'IDLE' | 'PLAYING' | 'WON' | 'LOST'>('IDLE');
  const [isRolling, setIsRolling] = useState(false);

  const BOARD_STEPS = 12;

  const handleStartLudo = () => {
    if (user.coins < betAmount) {
      alert('رصيدك غير كافٍ لدخول طاولة اللودو!');
      return;
    }
    onUpdateCoins(-betAmount);
    setPlayerPos(0);
    setBotPos(0);
    setDiceValue(null);
    setCurrentTurn('PLAYER');
    setGameStatus('PLAYING');
  };

  const handleRollDice = () => {
    if (gameStatus !== 'PLAYING' || currentTurn !== 'PLAYER' || isRolling) return;

    setIsRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      const rolled = Math.floor(Math.random() * 6) + 1;
      setDiceValue(rolled);
      count++;

      if (count > 8) {
        clearInterval(interval);
        setIsRolling(false);

        // Advance player
        const finalDice = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalDice);

        const newPlayerPos = Math.min(BOARD_STEPS, playerPos + finalDice);
        setPlayerPos(newPlayerPos);

        if (newPlayerPos >= BOARD_STEPS) {
          const winAmount = Math.floor(betAmount * 1.8); // 10% platform commission deducted
          onUpdateCoins(winAmount);
          setGameStatus('WON');
          return;
        }

        // Switch to Bot Turn
        setCurrentTurn('BOT');
        setTimeout(() => {
          handleBotTurn(newPlayerPos);
        }, 1200);
      }
    }, 80);
  };

  const handleBotTurn = (latestPlayerPos: number) => {
    const botRoll = Math.floor(Math.random() * 6) + 1;
    setDiceValue(botRoll);

    setBotPos((prev) => {
      const newBotPos = Math.min(BOARD_STEPS, prev + botRoll);
      if (newBotPos >= BOARD_STEPS) {
        setGameStatus('LOST');
      } else {
        setCurrentTurn('PLAYER');
      }
      return newBotPos;
    });
  };

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 text-white space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎲</span>
          <h3 className="font-black text-sm text-amber-300">لعبة لودو المصغرة (Ludo Quick 1v1)</h3>
        </div>
        <div className="text-[11px] text-slate-400">عمولة الطاولة: 10% 🏆</div>
      </div>

      {/* Ludo Board Track Representation */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
        {/* Status Bar */}
        <div className="flex items-center justify-between text-xs font-black">
          <span className="text-amber-400 flex items-center gap-1">
            <span>👤 {user.name}</span>
            <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full text-[10px]">
              خطوة {playerPos}/{BOARD_STEPS}
            </span>
          </span>

          <span className="text-indigo-400 flex items-center gap-1">
            <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full text-[10px]">
              خطوة {botPos}/{BOARD_STEPS}
            </span>
            <span>🤖 الخصم (المحترف)</span>
          </span>
        </div>

        {/* Player Path Track */}
        <div className="space-y-2">
          <div className="text-[10px] text-slate-400 font-bold">مسار اللاعب (الأصفر):</div>
          <div className="grid grid-cols-13 gap-1 bg-slate-900 p-2 rounded-xl border border-amber-500/30">
            {Array.from({ length: BOARD_STEPS + 1 }).map((_, i) => (
              <div
                key={i}
                className={`h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                  playerPos === i
                    ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_#f59e0b] scale-110'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {i === 0 ? '🏁' : i === BOARD_STEPS ? '🏆' : i}
              </div>
            ))}
          </div>

          <div className="text-[10px] text-slate-400 font-bold">مسار الخصم (الأزرق):</div>
          <div className="grid grid-cols-13 gap-1 bg-slate-900 p-2 rounded-xl border border-indigo-500/30">
            {Array.from({ length: BOARD_STEPS + 1 }).map((_, i) => (
              <div
                key={i}
                className={`h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                  botPos === i
                    ? 'bg-indigo-500 text-white shadow-[0_0_10px_#6366f1] scale-110'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {i === 0 ? '🏁' : i === BOARD_STEPS ? '🏆' : i}
              </div>
            ))}
          </div>
        </div>

        {/* Dice & Turn Announcer */}
        <div className="flex flex-col items-center justify-center py-2 space-y-2">
          {diceValue && (
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 rounded-2xl border-2 border-white flex items-center justify-center text-3xl font-black shadow-2xl animate-bounce">
              {diceValue}
            </div>
          )}

          {gameStatus === 'PLAYING' && (
            <div className="text-xs font-bold text-amber-300">
              {currentTurn === 'PLAYER' ? 'دورك الآن! اضغط لرمي النرد 🎲' : 'دور الخصم يرمي النرد... 🤖'}
            </div>
          )}

          {gameStatus === 'WON' && (
            <div className="text-sm font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500 px-4 py-2 rounded-2xl">
              🎉 مبروك! وصلت للهدف أولاً وربحت {Math.floor(betAmount * 1.8)} عملة!
            </div>
          )}

          {gameStatus === 'LOST' && (
            <div className="text-sm font-black text-rose-400 bg-rose-950/80 border border-rose-500 px-4 py-2 rounded-2xl">
              💥 سبَقك الخصم للهدف! حظاً أوفر الجولة القادمة
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3 items-center">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">رهان الطاولة</label>
          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {[200, 500, 1000, 5000].map((amt) => (
              <button
                key={amt}
                disabled={gameStatus === 'PLAYING'}
                onClick={() => setBetAmount(amt)}
                className={`flex-1 text-[10px] font-bold py-1 rounded-lg transition-colors ${
                  betAmount === amt ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>
        </div>

        {gameStatus === 'PLAYING' ? (
          <button
            onClick={handleRollDice}
            disabled={currentTurn !== 'PLAYER' || isRolling}
            className="py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-sm rounded-xl shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Dices className="w-5 h-5" />
            <span>رمي النرد 🎲</span>
          </button>
        ) : (
          <button
            onClick={handleStartLudo}
            className="py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm rounded-xl shadow-lg hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trophy className="w-5 h-5" />
            <span>بدء مباراة لودو (رهان {betAmount} 🪙)</span>
          </button>
        )}
      </div>
    </div>
  );
};
