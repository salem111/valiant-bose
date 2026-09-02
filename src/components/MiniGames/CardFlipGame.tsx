import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Trophy, Coins, RotateCw } from 'lucide-react';

interface CardFlipGameProps {
  user: UserProfile;
  onUpdateCoins: (delta: number) => void;
}

export const CardFlipGame: React.FC<CardFlipGameProps> = ({ user, onUpdateCoins }) => {
  const [betAmount, setBetAmount] = useState<number>(200);
  const [selectedSide, setSelectedSide] = useState<'RED' | 'BLUE' | null>(null);
  const [redCard, setRedCard] = useState<{ rank: string; value: number } | null>(null);
  const [blueCard, setBlueCard] = useState<{ rank: string; value: number } | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const CARDS = [
    { rank: 'A', value: 14 },
    { rank: 'K', value: 13 },
    { rank: 'Q', value: 12 },
    { rank: 'J', value: 11 },
    { rank: '10', value: 10 },
    { rank: '9', value: 9 },
    { rank: '8', value: 8 },
  ];

  const handleFlipCards = (side: 'RED' | 'BLUE') => {
    if (user.coins < betAmount) {
      alert('رصيدك غير كافٍ للرهان!');
      return;
    }

    onUpdateCoins(-betAmount);
    setSelectedSide(side);
    setIsFlipping(true);
    setResultMsg(null);

    setTimeout(() => {
      const cRed = CARDS[Math.floor(Math.random() * CARDS.length)];
      const cBlue = CARDS[Math.floor(Math.random() * CARDS.length)];

      setRedCard(cRed);
      setBlueCard(cBlue);
      setIsFlipping(false);

      if (cRed.value === cBlue.value) {
        // Draw, refund
        onUpdateCoins(betAmount);
        setResultMsg('تعادل الكرتين! تم استرجاع الرهان 🤝');
      } else if (side === 'RED' && cRed.value > cBlue.value) {
        const win = Math.floor(betAmount * 1.95);
        onUpdateCoins(win);
        setResultMsg(`🎉 فاز الطرف الأحمر بكرت ${cRed.rank}! ربحت ${win.toLocaleString()} عملة!`);
      } else if (side === 'BLUE' && cBlue.value > cRed.value) {
        const win = Math.floor(betAmount * 1.95);
        onUpdateCoins(win);
        setResultMsg(`🎉 فاز الطرف الأزرق بكرت ${cBlue.rank}! ربحت ${win.toLocaleString()} عملة!`);
      } else {
        setResultMsg('💥 خسارة الرهان! الكرت المعاكس كان أقوى');
      }
    }, 1200);
  };

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 text-white space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🃏</span>
          <h3 className="font-black text-sm text-amber-300">كروت الحظ والأوراق (Card Flip Teen Patti)</h3>
        </div>
        <span className="text-[11px] text-amber-400 font-bold">مضاعف الفوز: 1.95x 💎</span>
      </div>

      {/* Cards Table Surface */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center justify-around relative">
        {/* Red Side */}
        <div className="flex flex-col items-center space-y-2">
          <span className="text-xs font-black text-rose-400">الطرف الأحمر 🔴</span>
          <div
            className={`w-24 h-36 bg-gradient-to-br from-rose-600 to-red-800 rounded-2xl border-4 border-rose-400 flex items-center justify-center text-3xl font-black shadow-2xl transition-transform ${
              isFlipping ? 'animate-spin' : ''
            }`}
          >
            {redCard ? redCard.rank : '❓'}
          </div>
        </div>

        <span className="text-xl font-black text-amber-400">VS</span>

        {/* Blue Side */}
        <div className="flex flex-col items-center space-y-2">
          <span className="text-xs font-black text-indigo-400">الطرف الأزرق 🔵</span>
          <div
            className={`w-24 h-36 bg-gradient-to-br from-indigo-600 to-blue-800 rounded-2xl border-4 border-indigo-400 flex items-center justify-center text-3xl font-black shadow-2xl transition-transform ${
              isFlipping ? 'animate-spin' : ''
            }`}
          >
            {blueCard ? blueCard.rank : '❓'}
          </div>
        </div>
      </div>

      {resultMsg && (
        <div className="text-center font-black text-xs text-amber-300 bg-slate-950 border border-slate-800 p-2.5 rounded-2xl animate-in zoom-in">
          {resultMsg}
        </div>
      )}

      {/* Bet Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-bold">مبلغ الرهان:</span>
          <div className="flex gap-1">
            {[200, 500, 1000, 5000].map((amt) => (
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

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleFlipCards('RED')}
            disabled={isFlipping}
            className="py-3.5 bg-gradient-to-r from-rose-600 to-red-500 text-white font-black text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            الرهان على الأحمر 🔴 ({betAmount} 🪙)
          </button>

          <button
            onClick={() => handleFlipCards('BLUE')}
            disabled={isFlipping}
            className="py-3.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-black text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            الرهان على الأزرق 🔵 ({betAmount} 🪙)
          </button>
        </div>
      </div>
    </div>
  );
};
