import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Trophy, Flag, Play } from 'lucide-react';

interface VirtualRacingGameProps {
  user: UserProfile;
  onUpdateCoins: (delta: number) => void;
}

export const VirtualRacingGame: React.FC<VirtualRacingGameProps> = ({ user, onUpdateCoins }) => {
  const [betAmount, setBetAmount] = useState<number>(250);
  const [selectedRacer, setSelectedRacer] = useState<number | null>(null);
  const [racerProgress, setRacerProgress] = useState<number[]>([0, 0, 0, 0]);
  const [isRacing, setIsRacing] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);

  const RACERS = [
    { id: 0, name: 'الصاروخ الذهبي 🏎️', color: 'from-amber-400 to-yellow-500' },
    { id: 1, name: 'الفهد الأحمر 🚗', color: 'from-rose-500 to-red-600' },
    { id: 2, name: 'البرق الأزرق 🚙', color: 'from-indigo-500 to-blue-600' },
    { id: 3, name: 'الساموراي الأخضر 🏁', color: 'from-emerald-500 to-teal-600' },
  ];

  const handleStartRace = () => {
    if (selectedRacer === null) {
      alert('يرجى اختيار المتسابق أولاً!');
      return;
    }
    if (user.coins < betAmount) {
      alert('رصيدك غير كافٍ للرهان!');
      return;
    }

    onUpdateCoins(-betAmount);
    setIsRacing(true);
    setRacerProgress([0, 0, 0, 0]);
    setWinnerIndex(null);

    const interval = setInterval(() => {
      setRacerProgress((prev) => {
        const next = prev.map((val) => Math.min(100, val + Math.floor(Math.random() * 12) + 3));
        const winner = next.findIndex((val) => val >= 100);

        if (winner !== -1) {
          clearInterval(interval);
          setIsRacing(false);
          setWinnerIndex(winner);

          if (winner === selectedRacer) {
            const winCoins = Math.floor(betAmount * 3.5);
            onUpdateCoins(winCoins);
          }
        }
        return next;
      });
    }, 200);
  };

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 text-white space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-amber-400" />
          <h3 className="font-black text-sm text-amber-300">السباقات الافتراضية (Virtual Racing)</h3>
        </div>
        <span className="text-[11px] text-amber-400 font-bold">معامل الفوز: 3.5x 🏆</span>
      </div>

      {/* Race Track Canvas */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
        {RACERS.map((racer) => (
          <div key={racer.id} className="space-y-1">
            <div className="flex justify-between items-center text-[11px] font-bold">
              <span className={selectedRacer === racer.id ? 'text-amber-300 font-black' : 'text-slate-300'}>
                {racer.name} {selectedRacer === racer.id ? '⭐ (اختيارك)' : ''}
              </span>
              <span className="font-mono text-slate-400">{racerProgress[racer.id]}%</span>
            </div>

            <div className="h-6 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 relative">
              <div
                style={{ width: `${racerProgress[racer.id]}%` }}
                className={`h-full bg-gradient-to-r ${racer.color} transition-all duration-200 rounded-r-xl flex items-center justify-end px-2 text-xs font-black shadow-lg`}
              >
                🏎️
              </div>
            </div>
          </div>
        ))}
      </div>

      {winnerIndex !== null && (
        <div className="text-center font-black text-xs p-3 rounded-2xl bg-slate-950 border border-amber-400 text-amber-300 animate-in zoom-in">
          {winnerIndex === selectedRacer
            ? `🎉 مبروك! فاز ${RACERS[winnerIndex].name} بالسباق وربحت ${Math.floor(betAmount * 3.5).toLocaleString()} عملة!`
            : `💥 فاز ${RACERS[winnerIndex].name} بالسباق! حظاً أوفر في الجولة القادمة`}
        </div>
      )}

      {/* Racer Selection & Bet Options */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RACERS.map((r) => (
            <button
              key={r.id}
              disabled={isRacing}
              onClick={() => setSelectedRacer(r.id)}
              className={`p-2 rounded-xl border text-[11px] font-black transition-all cursor-pointer ${
                selectedRacer === r.id
                  ? 'bg-amber-500 border-white text-slate-950 shadow-lg scale-105'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-bold">مبلغ الرهان:</span>
          <div className="flex gap-1">
            {[250, 500, 1000, 5000].map((amt) => (
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

        <button
          onClick={handleStartRace}
          disabled={isRacing || selectedRacer === null}
          className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>{isRacing ? 'جاري السباق المباشر...' : `انطلاق السباق (رهان ${betAmount} 🪙)`}</span>
        </button>
      </div>
    </div>
  );
};
