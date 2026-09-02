import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Gamepad2, Users, Trophy, Sparkles } from 'lucide-react';

interface CardGameTarneebProps {
  user: UserProfile;
  onUpdateCoins: (delta: number) => void;
}

export const CardGameTarneeb: React.FC<CardGameTarneebProps> = ({ user, onUpdateCoins }) => {
  const [selectedGame, setSelectedGame] = useState<'tarneeb' | 'chess'>('tarneeb');
  const [inGame, setInGame] = useState<boolean>(false);
  const [scoreTeamA, setScoreTeamA] = useState<number>(0);
  const [scoreTeamB, setScoreTeamB] = useState<number>(0);

  const PLAYERS = [
    { name: user.name, role: 'أنت (شريك 1)', avatar: user.avatar, card: '🂡 A♠' },
    { name: 'الكابتن علي', role: 'منافس (فريق 2)', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', card: '🂮 K♥' },
    { name: 'المايسترو', role: 'شريكك (فريق 1)', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', card: '🃁 A♦' },
    { name: 'أميرة الشوق', role: 'منافس (فريق 2)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', card: '🃎 K♣' },
  ];

  const handlePlayTrick = () => {
    const isWin = Math.random() > 0.3;
    if (isWin) {
      setScoreTeamA((prev) => prev + 1);
      if (scoreTeamA + 1 >= 13) {
        alert('🎉 فاز فريقك في جولة الطرنيب وربحت 1,000 عملة!');
        onUpdateCoins(1000);
        setInGame(false);
      }
    } else {
      setScoreTeamB((prev) => prev + 1);
    }
  };

  return (
    <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 text-white space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-emerald-400" />
          <h3 className="font-black text-sm text-emerald-300">ألعاب الشدة والشطرنج (Card & Chess) ♠️♟️</h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setSelectedGame('tarneeb')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              selectedGame === 'tarneeb' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            الطرنيب (4 لاعبين)
          </button>
          <button
            onClick={() => setSelectedGame('chess')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              selectedGame === 'chess' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            الشطرنج 1v1
          </button>
        </div>
      </div>

      {/* Tarneeb Table */}
      {selectedGame === 'tarneeb' ? (
        <div className="relative h-52 bg-gradient-to-b from-emerald-900 via-teal-950 to-slate-950 rounded-2xl border-2 border-emerald-500/40 p-3 flex flex-col justify-between shadow-2xl">
          {/* Top Player */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 bg-slate-950/80 px-2 py-1 rounded-full border border-emerald-500/30 text-xs">
              <img src={PLAYERS[2].avatar} alt="" className="w-5 h-5 rounded-full" />
              <span className="font-bold text-amber-300">{PLAYERS[2].name}</span>
            </div>
          </div>

          {/* Middle Row (Left & Right Players + Center Cards Field) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-slate-950/80 px-2 py-1 rounded-full border border-slate-700 text-xs">
              <img src={PLAYERS[1].avatar} alt="" className="w-5 h-5 rounded-full" />
              <span className="font-bold text-slate-200">{PLAYERS[1].name}</span>
            </div>

            {/* Played Cards Arena */}
            <div className="flex items-center gap-2 bg-emerald-950/90 p-3 rounded-xl border border-amber-400/30 shadow-inner">
              {PLAYERS.map((p, idx) => (
                <div key={idx} className="bg-white text-slate-950 px-2 py-1 rounded shadow font-black text-sm">
                  {p.card}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-slate-950/80 px-2 py-1 rounded-full border border-slate-700 text-xs">
              <img src={PLAYERS[3].avatar} alt="" className="w-5 h-5 rounded-full" />
              <span className="font-bold text-slate-200">{PLAYERS[3].name}</span>
            </div>
          </div>

          {/* Bottom Player (User) */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 bg-amber-500 text-slate-950 px-3 py-1 rounded-full font-bold text-xs shadow-md">
              <img src={user.avatar} alt="" className="w-5 h-5 rounded-full ring-1 ring-slate-950" />
              <span>{user.name} (أنت)</span>
            </div>
          </div>
        </div>
      ) : (
        /* Chess Board Preview */
        <div className="h-52 bg-slate-950 rounded-2xl border border-slate-800 p-2 flex flex-col items-center justify-center">
          <p className="text-xs text-amber-300 font-bold mb-2">طاولة الشطرنج الكلاسيكية 1v1</p>
          <div className="grid grid-cols-4 gap-1">
            {['♟️', '♞', '♝', '♛', '♚', '♝', '♞', '♟️'].map((piece, i) => (
              <div key={i} className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center text-xl">
                {piece}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Play Trick Button */}
      <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
        <div>
          <span className="text-slate-400">نتيجة فريقك:</span>
          <span className="font-bold text-amber-300 font-mono ml-2">{scoreTeamA} / 13</span>
        </div>
        <button
          onClick={handlePlayTrick}
          className="py-2 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow hover:brightness-110 active:scale-95"
        >
          رمي الكرت التنافسي ♠️
        </button>
      </div>
    </div>
  );
};
