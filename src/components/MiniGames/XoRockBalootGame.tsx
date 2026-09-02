import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Gamepad2, Trophy, Sparkles, RefreshCw, Zap } from 'lucide-react';

interface XoRockBalootGameProps {
  user: UserProfile;
  onUpdateCoins: (delta: number) => void;
}

export const XoRockBalootGame: React.FC<XoRockBalootGameProps> = ({ user, onUpdateCoins }) => {
  const [activeTab, setActiveTab] = useState<'xo' | 'rps' | 'baloot' | 'uno'>('xo');

  // --- XO GAME STATE ---
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [xoTurn, setXoTurn] = useState<'X' | 'O'>('X');
  const [xoWinner, setXoWinner] = useState<string | null>(null);
  const [xoBet, setXoBet] = useState<number>(200);

  const checkWinner = (b: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, bIdx, c] = lines[i];
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
        return b[a];
      }
    }
    if (b.every((cell) => cell !== null)) return 'DRAW';
    return null;
  };

  const handleXoClick = (index: number) => {
    if (board[index] || xoWinner) return;
    if (user.coins < xoBet) {
      alert('رصيدك لا يكفي للرهان!');
      return;
    }

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const win = checkWinner(newBoard);
    if (win) {
      finishXo(win);
      return;
    }

    setXoTurn('O');
    // Bot move
    setTimeout(() => {
      const emptyIndices = newBoard.map((val, idx) => (val === null ? idx : null)).filter((val) => val !== null) as number[];
      if (emptyIndices.length > 0) {
        const botChoice = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        newBoard[botChoice] = 'O';
        setBoard([...newBoard]);
        const botWin = checkWinner(newBoard);
        if (botWin) {
          finishXo(botWin);
        } else {
          setXoTurn('X');
        }
      }
    }, 400);
  };

  const finishXo = (result: string) => {
    setXoWinner(result);
    if (result === 'X') {
      onUpdateCoins(xoBet * 2);
    } else if (result === 'O') {
      onUpdateCoins(-xoBet);
    }
  };

  const resetXo = () => {
    setBoard(Array(9).fill(null));
    setXoTurn('X');
    setXoWinner(null);
  };

  // --- RPS GAME STATE ---
  const [rpsChoice, setRpsChoice] = useState<string | null>(null);
  const [rpsBotChoice, setRpsBotChoice] = useState<string | null>(null);
  const [rpsResult, setRpsResult] = useState<string | null>(null);
  const [rpsBet, setRpsBet] = useState<number>(300);

  const handleRpsPlay = (playerSelection: 'rock' | 'paper' | 'scissors') => {
    if (user.coins < rpsBet) {
      alert('رصيدك غير كافٍ للرهان!');
      return;
    }

    const options = ['rock', 'paper', 'scissors'];
    const botSelection = options[Math.floor(Math.random() * 3)];
    setRpsChoice(playerSelection);
    setRpsBotChoice(botSelection);

    let res = '';
    if (playerSelection === botSelection) {
      res = 'تعادل! 🤝';
    } else if (
      (playerSelection === 'rock' && botSelection === 'scissors') ||
      (playerSelection === 'paper' && botSelection === 'rock') ||
      (playerSelection === 'scissors' && botSelection === 'paper')
    ) {
      res = 'فوز رائع! 🎉';
      onUpdateCoins(rpsBet * 2);
    } else {
      res = 'خسارة! 💔';
      onUpdateCoins(-rpsBet);
    }
    setRpsResult(res);
  };

  // --- BALOOT & UNO QUICK GAME ---
  const [cardScore, setCardScore] = useState<number>(0);
  const [cardMsg, setCardMsg] = useState<string>('اضغط لسحب بطاقة البلوت الأقوى وسحق الخصم!');

  const playBalootRound = () => {
    if (user.coins < 500) {
      alert('رصيدك لا يكفي!');
      return;
    }
    const myVal = Math.floor(Math.random() * 100) + 1;
    const botVal = Math.floor(Math.random() * 100) + 1;
    if (myVal > botVal) {
      setCardMsg(`🎉 فزت بأكلة البلوت! نقاطك: ${myVal} ضد نقاط الخصم: ${botVal}`);
      onUpdateCoins(1000);
      setCardScore((prev) => prev + 1);
    } else {
      setCardMsg(`💔 خسرت الأكلة! نقاط الخصم: ${botVal} ضد نقاطك: ${myVal}`);
      onUpdateCoins(-500);
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-4 text-white space-y-4 font-sans dir-rtl">
      {/* Header tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-amber-400" />
          <h3 className="font-black text-sm text-amber-300">ألعاب التحدي والسلسلة 🎮</h3>
        </div>
        <div className="flex gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('xo')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'xo' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            XO ❌⭕
          </button>
          <button
            onClick={() => setActiveTab('rps')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'rps' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            حجر ورقة مقص ✂️
          </button>

          <button
            onClick={() => setActiveTab('baloot')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'baloot' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            بلوت 🃏
          </button>
        </div>
      </div>

      {/* XO TAB */}
      {activeTab === 'xo' && (
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-xs">
            <span className="text-amber-300 font-bold">الرهان: {xoBet} 🪙</span>
            <div className="flex gap-1">
              {[100, 200, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setXoBet(amt)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                    xoBet === amt ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
            {board.map((cell, idx) => (
              <button
                key={idx}
                onClick={() => handleXoClick(idx)}
                className={`w-20 h-20 rounded-2xl text-3xl font-black flex items-center justify-center border-2 transition-all cursor-pointer ${
                  cell === 'X'
                    ? 'bg-rose-950/80 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : cell === 'O'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-950 border-slate-800 hover:border-amber-500'
                }`}
              >
                {cell === 'X' ? '❌' : cell === 'O' ? '⭕' : ''}
              </button>
            ))}
          </div>

          {xoWinner && (
            <div className="space-y-2 bg-slate-950 p-3 rounded-2xl border border-amber-500/40 animate-in zoom-in-95">
              <h4 className="font-black text-sm text-amber-300">
                {xoWinner === 'X' ? '🎉 فزت في التحدي وربحت الدبل!' : xoWinner === 'O' ? '💔 خسرت الماتش!' : '🤝 تعادل عادل!'}
              </h4>
              <button
                onClick={resetXo}
                className="px-4 py-1.5 bg-amber-500 text-slate-950 font-black rounded-xl text-xs hover:bg-amber-400 flex items-center gap-1 mx-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>لعب جولة جديدة</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* RPS TAB */}
      {activeTab === 'rps' && (
        <div className="space-y-4 text-center">
          <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-xs flex justify-between items-center">
            <span className="text-amber-300 font-bold">الرهان: {rpsBet} 🪙</span>
            <div className="flex gap-1">
              {[200, 500, 1000].map((b) => (
                <button
                  key={b}
                  onClick={() => setRpsBet(b)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                    rpsBet === b ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleRpsPlay('rock')}
              className="p-4 bg-slate-950 border-2 border-slate-800 hover:border-amber-500 rounded-2xl text-4xl hover:scale-110 transition-all cursor-pointer shadow-lg"
            >
              🪨
              <span className="block text-[10px] text-slate-400 mt-1 font-bold">حجر</span>
            </button>
            <button
              onClick={() => handleRpsPlay('paper')}
              className="p-4 bg-slate-950 border-2 border-slate-800 hover:border-amber-500 rounded-2xl text-4xl hover:scale-110 transition-all cursor-pointer shadow-lg"
            >
              📄
              <span className="block text-[10px] text-slate-400 mt-1 font-bold">ورقة</span>
            </button>
            <button
              onClick={() => handleRpsPlay('scissors')}
              className="p-4 bg-slate-950 border-2 border-slate-800 hover:border-amber-500 rounded-2xl text-4xl hover:scale-110 transition-all cursor-pointer shadow-lg"
            >
              ✂️
              <span className="block text-[10px] text-slate-400 mt-1 font-bold">مقص</span>
            </button>
          </div>

          {rpsResult && (
            <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/40 space-y-1">
              <p className="text-xs text-slate-300">
                اختيارك: {rpsChoice === 'rock' ? '🪨' : rpsChoice === 'paper' ? '📄' : '✂️'} | اختيار المنافس: {rpsBotChoice === 'rock' ? '🪨' : rpsBotChoice === 'paper' ? '📄' : '✂️'}
              </p>
              <h4 className="font-black text-sm text-amber-300">{rpsResult}</h4>
            </div>
          )}
        </div>
      )}

      {/* BALOOT TAB */}
      {activeTab === 'baloot' && (
        <div className="space-y-4 text-center">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex justify-center gap-6">
              <div className="text-center">
                <span className="block text-3xl">🃏</span>
                <span className="text-xs font-bold text-amber-300">بطاقاتك</span>
              </div>
              <span className="text-2xl text-slate-600 font-black self-center">VS</span>
              <div className="text-center">
                <span className="block text-3xl">🎴</span>
                <span className="text-xs font-bold text-rose-300">بطاقات الخصم</span>
              </div>
            </div>

            <p className="text-xs text-amber-200 font-bold bg-slate-900 p-2 rounded-xl border border-amber-500/20">
              {cardMsg}
            </p>

            <button
              onClick={playBalootRound}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer"
            >
              سحب أكلة البلوت (500 🪙)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
