import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Gem, Bomb, Shield, RefreshCw } from 'lucide-react';

interface MinesGameProps {
  user: UserProfile;
  onUpdateCoins: (delta: number) => void;
}

export const MinesGame: React.FC<MinesGameProps> = ({ user, onUpdateCoins }) => {
  const GRID_SIZE = 16; // 4x4 grid
  const [betAmount, setBetAmount] = useState<number>(200);
  const [minesCount, setMinesCount] = useState<number>(3);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [mineLocations, setMineLocations] = useState<number[]>([]);
  const [revealedTiles, setRevealedTiles] = useState<number[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [hitBomb, setHitBomb] = useState<boolean>(false);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);

  const startGame = () => {
    if (user.coins < betAmount) {
      alert('رصيدك غير كافٍ للرهان!');
      return;
    }
    onUpdateCoins(-betAmount);

    // Randomly place mines
    const indices = Array.from({ length: GRID_SIZE }, (_, i) => i);
    const shuffled = indices.sort(() => 0.5 - Math.random());
    const mines = shuffled.slice(0, minesCount);

    setMineLocations(mines);
    setRevealedTiles([]);
    setGameStarted(true);
    setIsGameOver(false);
    setHitBomb(false);
    setCurrentMultiplier(1.0);
  };

  const revealTile = (index: number) => {
    if (!gameStarted || isGameOver || revealedTiles.includes(index)) return;

    if (mineLocations.includes(index)) {
      // Hit a bomb!
      setHitBomb(true);
      setIsGameOver(true);
      setRevealedTiles(Array.from({ length: GRID_SIZE }, (_, i) => i)); // Reveal all
    } else {
      // Safe Gem!
      const newRevealed = [...revealedTiles, index];
      setRevealedTiles(newRevealed);

      // Increase multiplier
      const safeCount = newRevealed.length;
      const nextMult = parseFloat((1 + safeCount * 0.4).toFixed(2));
      setCurrentMultiplier(nextMult);
    }
  };

  const cashout = () => {
    if (!gameStarted || isGameOver || revealedTiles.length === 0) return;
    const winAmount = Math.floor(betAmount * currentMultiplier);
    onUpdateCoins(winAmount);
    setIsGameOver(true);
    setGameStarted(false);
    alert(`🎉 تهانينا! انسحبت بمكسب ${winAmount.toLocaleString()} عملة (${currentMultiplier}x)`);
  };

  return (
    <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 text-white space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Gem className="w-5 h-5 text-cyan-400" />
          <h3 className="font-black text-sm text-cyan-300">منجم الألماس (Mines Game) 💎</h3>
        </div>
        <span className="text-xs text-slate-400">افتَح الألماس وتجنّب القنابل!</span>
      </div>

      {/* Grid 4x4 */}
      <div className="grid grid-cols-4 gap-2.5 max-w-xs mx-auto my-2">
        {Array.from({ length: GRID_SIZE }).map((_, idx) => {
          const isRevealed = revealedTiles.includes(idx);
          const isMine = mineLocations.includes(idx);

          return (
            <button
              key={idx}
              disabled={!gameStarted || isGameOver || isRevealed}
              onClick={() => revealTile(idx)}
              className={`h-16 rounded-xl font-black text-2xl flex items-center justify-center transition-all shadow-md ${
                isRevealed
                  ? isMine
                    ? 'bg-red-600 border-2 border-red-400 animate-bounce'
                    : 'bg-emerald-600 border-2 border-emerald-400'
                  : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-95'
              }`}
            >
              {isRevealed ? (
                isMine ? (
                  <Bomb className="w-8 h-8 text-white" />
                ) : (
                  <Gem className="w-8 h-8 text-cyan-200" />
                )
              ) : (
                <span className="text-xs font-mono text-slate-500">{idx + 1}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
        <div>
          <span className="text-slate-400 block">المضاعف الحالي:</span>
          <span className="font-bold text-cyan-300 font-mono text-sm">{currentMultiplier}x</span>
        </div>
        <div>
          <span className="text-slate-400 block">المكسب المتوقع:</span>
          <span className="font-bold text-emerald-400 font-mono text-sm">
            {Math.floor(betAmount * currentMultiplier)} 🪙
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        {gameStarted && !isGameOver ? (
          <button
            onClick={cashout}
            disabled={revealedTiles.length === 0}
            className="col-span-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95"
          >
            سحب الأرباح الآن ({Math.floor(betAmount * currentMultiplier)} 🪙)
          </button>
        ) : (
          <button
            onClick={startGame}
            className="col-span-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95"
          >
            بدء جولة المنجم (رهان {betAmount} 🪙)
          </button>
        )}
      </div>
    </div>
  );
};
