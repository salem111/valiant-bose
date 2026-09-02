import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { Send, Timer, Coins, Trophy, Users, Dices } from 'lucide-react';

interface ColorDiceGameProps {
  user: UserProfile;
  onUpdateCoins: (delta: number) => void;
}

export const ColorDiceGame: React.FC<ColorDiceGameProps> = ({ user, onUpdateCoins }) => {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [selectedColor, setSelectedColor] = useState<'RED' | 'BLUE' | 'GREEN' | null>(null);
  const [countdown, setCountdown] = useState<number>(18);
  const [dice1, setDice1] = useState<number>(3);
  const [dice2, setDice2] = useState<number>(4);
  const [gameHistory, setGameHistory] = useState<('RED' | 'BLUE' | 'GREEN')[]>(['RED', 'BLUE', 'RED', 'GREEN', 'BLUE']);
  const [roundResult, setRoundResult] = useState<string | null>(null);
  const [groupMessages, setGroupMessages] = useState<{ sender: string; text: string }[]>([
    { sender: 'الشيخ خالد', text: 'أعتقد الجولة القادمة أحمر! 🔴' },
    { sender: 'الملكة أميرة', text: 'وضعت 1000 عملة على الأزرق 🔵' },
  ]);
  const [inputChat, setInputChat] = useState('');

  // 30 seconds game round lifecycle
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Resolve Round
          const d1 = Math.floor(Math.random() * 6) + 1;
          const d2 = Math.floor(Math.random() * 6) + 1;
          setDice1(d1);
          setDice2(d2);

          const sum = d1 + d2;
          let outcomeColor: 'RED' | 'BLUE' | 'GREEN';
          if (sum === 7 || d1 === d2) {
            outcomeColor = 'GREEN'; // 10x multiplier
          } else if (sum % 2 === 0) {
            outcomeColor = 'RED'; // 2x multiplier
          } else {
            outcomeColor = 'BLUE'; // 2x multiplier
          }

          setGameHistory((h) => [outcomeColor, ...h.slice(0, 7)]);

          if (selectedColor) {
            if (selectedColor === outcomeColor) {
              const multiplier = outcomeColor === 'GREEN' ? 10 : 2;
              const win = betAmount * multiplier;
              onUpdateCoins(win);
              setRoundResult(`🎉 مبروك! فزت بـ ${win.toLocaleString()} عملة (${multiplier}x) على اللون ${outcomeColor}`);
            } else {
              setRoundResult(`💥 خسرت الجولة! خرج اللون ${outcomeColor}`);
            }
          } else {
            setRoundResult(`انتهت الجولة باللون ${outcomeColor}`);
          }

          setSelectedColor(null);
          return 25; // Reset timer to 25s
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedColor, betAmount, onUpdateCoins]);

  const handlePlaceBet = (color: 'RED' | 'BLUE' | 'GREEN') => {
    if (user.coins < betAmount) {
      alert('رصيدك غير كافٍ للرهان!');
      return;
    }
    if (selectedColor) {
      alert('لقد وضعت رهاناً بالفعل في هذه الجولة!');
      return;
    }

    onUpdateCoins(-betAmount);
    setSelectedColor(color);
    setRoundResult(`تم تثبيت رهانك بمقدار ${betAmount} عملة على ${color === 'RED' ? 'الأحمر 🔴' : color === 'BLUE' ? 'الأزرق 🔵' : 'الأخضر 🟢'}`);
  };

  const handleSendGroupChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim()) return;
    setGroupMessages((prev) => [...prev, { sender: user.name, text: inputChat.trim() }]);
    setInputChat('');
  };

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 text-white space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Dices className="w-5 h-5 text-rose-400" />
          <h3 className="font-black text-sm text-amber-300">روليت الألوان والتخمين الجماعي 🎲</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-rose-950 border border-rose-500/40 px-3 py-1 rounded-full text-xs font-black text-rose-300">
          <Timer className="w-3.5 h-3.5 animate-spin" />
          <span>متبقي: {countdown} ثانية</span>
        </div>
      </div>

      {/* Live Dice Roll & History */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-center">
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="w-14 h-14 bg-rose-600 rounded-2xl border-2 border-white/40 flex items-center justify-center text-2xl font-black shadow-xl">
            {dice1}
          </div>
          <span className="text-xl font-black text-amber-400">+</span>
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl border-2 border-white/40 flex items-center justify-center text-2xl font-black shadow-xl">
            {dice2}
          </div>
          <span className="text-xl font-black text-amber-400">=</span>
          <div className="text-2xl font-black text-amber-300">{dice1 + dice2}</div>
        </div>

        {/* History Dots */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold">آخر الجولات:</span>
          {gameHistory.map((c, i) => (
            <span
              key={i}
              className={`w-4 h-4 rounded-full border border-white/20 ${
                c === 'RED' ? 'bg-rose-600' : c === 'BLUE' ? 'bg-indigo-600' : 'bg-emerald-500'
              }`}
            />
          ))}
        </div>

        {roundResult && <p className="text-xs font-bold text-amber-300 animate-in fade-in">{roundResult}</p>}
      </div>

      {/* Color Selection Betting Options */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handlePlaceBet('RED')}
          disabled={countdown <= 2}
          className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
            selectedColor === 'RED' ? 'bg-rose-600 border-white scale-105 shadow-xl' : 'bg-rose-950/60 border-rose-500/40 hover:bg-rose-900/80'
          }`}
        >
          <span className="text-xs font-black text-white">الأحمر (2x) 🔴</span>
          <span className="text-[10px] text-rose-200">الأرقام الزوجية</span>
        </button>

        <button
          onClick={() => handlePlaceBet('GREEN')}
          disabled={countdown <= 2}
          className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
            selectedColor === 'GREEN' ? 'bg-emerald-600 border-white scale-105 shadow-xl' : 'bg-emerald-950/60 border-emerald-500/40 hover:bg-emerald-900/80'
          }`}
        >
          <span className="text-xs font-black text-white">الأخضر (10x) 🟢</span>
          <span className="text-[10px] text-emerald-200">العدد 7 أو متطابق</span>
        </button>

        <button
          onClick={() => handlePlaceBet('BLUE')}
          disabled={countdown <= 2}
          className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
            selectedColor === 'BLUE' ? 'bg-indigo-600 border-white scale-105 shadow-xl' : 'bg-indigo-950/60 border-indigo-500/40 hover:bg-indigo-900/80'
          }`}
        >
          <span className="text-xs font-black text-white">الأزرق (2x) 🔵</span>
          <span className="text-[10px] text-indigo-200">الأرقام الفردية</span>
        </button>
      </div>

      {/* Bet Amount Selector & Group Chat */}
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-bold">مبلغ الرهان:</span>
          <div className="flex gap-1">
            {[100, 500, 2000, 5000].map((amt) => (
              <button
                key={amt}
                onClick={() => setBetAmount(amt)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors ${
                  betAmount === amt ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>
        </div>

        {/* Group Chat Bar */}
        <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>محادثة اللاعبين في الجولة (Live Chat):</span>
          </div>
          <div className="max-h-20 overflow-y-auto space-y-1 text-xs">
            {groupMessages.map((msg, idx) => (
              <div key={idx} className="text-right">
                <span className="font-bold text-amber-300">{msg.sender}: </span>
                <span className="text-slate-200">{msg.text}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendGroupChat} className="flex gap-1">
            <input
              type="text"
              value={inputChat}
              onChange={(e) => setInputChat(e.target.value)}
              placeholder="توقع الفائز مع اللاعبين..."
              className="flex-1 bg-slate-900 border border-slate-700 text-xs rounded-xl px-2.5 py-1 text-white focus:outline-none"
            />
            <button type="submit" className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
              إرسال
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
