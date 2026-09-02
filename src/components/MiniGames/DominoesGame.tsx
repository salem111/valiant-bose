import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Trophy, Coins, RotateCcw } from 'lucide-react';

interface DominoesGameProps {
  user: UserProfile;
  onUpdateCoins: (delta: number) => void;
}

export const DominoesGame: React.FC<DominoesGameProps> = ({ user, onUpdateCoins }) => {
  const [betAmount, setBetAmount] = useState<number>(300);
  const [playerHand, setPlayerHand] = useState<{ left: number; right: number }[]>([
    { left: 6, right: 6 },
    { left: 5, right: 4 },
    { left: 3, right: 3 },
    { left: 2, right: 1 },
  ]);
  const [boardTiles, setBoardTiles] = useState<{ left: number; right: number }[]>([
    { left: 6, right: 5 },
  ]);
  const [scorePlayer, setScorePlayer] = useState(0);
  const [scoreBot, setScoreBot] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);

  const handleStartDominoes = () => {
    if (user.coins < betAmount) {
      alert('رصيدك غير كافٍ للرهان!');
      return;
    }
    onUpdateCoins(-betAmount);
    setPlayerHand([
      { left: 6, right: 6 },
      { left: 5, right: 4 },
      { left: 3, right: 3 },
      { left: 2, right: 1 },
    ]);
    setBoardTiles([{ left: 6, right: 5 }]);
    setScorePlayer(0);
    setScoreBot(0);
    setGameEnded(false);
    setGameResult(null);
  };

  const handlePlayTile = (index: number) => {
    if (gameEnded) return;

    const playedTile = playerHand[index];
    const newHand = playerHand.filter((_, i) => i !== index);
    setPlayerHand(newHand);
    setBoardTiles((prev) => [...prev, playedTile]);

    // Update Player Score
    const addedScore = playedTile.left + playedTile.right;
    const newPlayerScore = scorePlayer + addedScore;
    setScorePlayer(newPlayerScore);

    if (newHand.length === 0) {
      const winCoins = Math.floor(betAmount * 1.85);
      onUpdateCoins(winCoins);
      setGameEnded(true);
      setGameResult(`🎉 مبروك! أنهيت أحجارك أولاً وربحت ${winCoins.toLocaleString()} عملة!`);
    } else {
      // Bot Play Simulation
      setTimeout(() => {
        const botTile = { left: Math.floor(Math.random() * 6), right: Math.floor(Math.random() * 6) };
        setBoardTiles((prev) => [botTile, ...prev]);
        setScoreBot((prev) => prev + botTile.left + botTile.right);
      }, 800);
    }
  };

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 text-white space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🀄</span>
          <h3 className="font-black text-sm text-amber-300">لعبة الدومينو الكلاسيكية (Dominoes 1v1)</h3>
        </div>
        <div className="text-[11px] text-slate-400">عمولة التطبيق: 10% 🏆</div>
      </div>

      {/* Dominoes Table Surface */}
      <div className="bg-emerald-950/80 border-2 border-emerald-600/40 p-4 rounded-2xl min-h-48 flex flex-col justify-between space-y-4 shadow-2xl relative">
        {/* Opponent Score Header */}
        <div className="flex justify-between items-center bg-black/40 px-3 py-1.5 rounded-xl text-xs font-bold">
          <span className="text-slate-300">🤖 الخصم المحترف</span>
          <span className="text-amber-400">نقاط الخصم: {scoreBot}</span>
        </div>

        {/* Board Tiles Layout */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
          {boardTiles.map((tile, i) => (
            <div
              key={i}
              className="w-12 h-16 bg-slate-100 text-slate-950 font-black rounded-xl border-2 border-slate-300 flex flex-col items-center justify-around shadow-md transform hover:scale-105 transition-transform"
            >
              <span>{tile.left}</span>
              <div className="w-8 h-0.5 bg-slate-950" />
              <span>{tile.right}</span>
            </div>
          ))}
        </div>

        {/* Player Score & Hand Tiles */}
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-black/40 px-3 py-1 rounded-xl text-xs font-bold">
            <span className="text-amber-300">👤 أحجارك (اضغط للعب):</span>
            <span className="text-amber-400">نقاطك: {scorePlayer}</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            {playerHand.map((tile, idx) => (
              <button
                key={idx}
                onClick={() => handlePlayTile(idx)}
                className="w-12 h-16 bg-gradient-to-b from-amber-100 to-amber-200 text-slate-950 font-black rounded-xl border-2 border-amber-400 flex flex-col items-center justify-around shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
              >
                <span>{tile.left}</span>
                <div className="w-8 h-0.5 bg-slate-950" />
                <span>{tile.right}</span>
              </button>
            ))}
          </div>
        </div>

        {gameResult && (
          <div className="text-center bg-slate-950/90 border border-amber-400 p-2.5 rounded-2xl font-black text-xs text-amber-300 animate-in zoom-in">
            {gameResult}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3 items-center">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">رهان المباراة</label>
          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {[300, 1000, 2500, 5000].map((amt) => (
              <button
                key={amt}
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

        <button
          onClick={handleStartDominoes}
          className="py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm rounded-xl shadow-lg hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Trophy className="w-4 h-4" />
          <span>بدء جولة دومينو (رهان {betAmount} 🪙)</span>
        </button>
      </div>
    </div>
  );
};
