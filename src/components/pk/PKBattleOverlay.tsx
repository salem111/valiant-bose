import React, { useState, useEffect } from 'react';
import { PKBattleState, UserProfile } from '../../types';
import { Swords, Flame, Trophy, Clock, X, Gift, Sparkles, AlertCircle, TrendingUp } from 'lucide-react';

interface PKBattleOverlayProps {
  pkState: PKBattleState;
  currentUser: UserProfile;
  isHost: boolean;
  onSendPKGift: (team: 'red' | 'blue', amount: number) => void;
  onEndPK: () => void;
  onOpenGiftSelector: () => void;
}

export const PKBattleOverlay: React.FC<PKBattleOverlayProps> = ({
  pkState,
  currentUser,
  isHost,
  onSendPKGift,
  onEndPK,
  onOpenGiftSelector,
}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [battlePhase, setBattlePhase] = useState<'battling' | 'punishment' | 'finished'>('battling');
  const [punishmentChallenge, setPunishmentChallenge] = useState<string>('غناء مقطع بدون موسيقى 🎤');

  const punishments = [
    'غناء مقطع بدون موسيقى 🎤',
    'تقليد صوت شخصية كرتونية 🐱',
    'الترحيب بـ 10 أعضاء بالاسم فوراً 👑',
    'إلقاء بيت شعر فوري 📜',
    'كتم المايك لمدة 30 ثانية 🔇',
  ];

  // Global Timer Logic based on startTime from server
  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const startTime = pkState.startTime || now;
      const durationMs = pkState.duration * 1000;
      const elapsed = now - startTime;
      const remaining = Math.max(0, Math.floor((durationMs - elapsed) / 1000));

      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (battlePhase === 'battling') {
          setBattlePhase('punishment');
          // Deterministic punishment based on startTime
          const punishmentIdx = Math.floor((startTime % 1000) % punishments.length);
          setPunishmentChallenge(punishments[punishmentIdx]);
        }
      } else {
        setBattlePhase('battling');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [pkState.startTime, pkState.duration]);

  const redScore = pkState.redTeam.score || 0;
  const blueScore = pkState.blueTeam.score || 0;
  const totalScore = Math.max(1, redScore + blueScore);
  const redPercentage = Math.min(90, Math.max(10, Math.round((redScore / totalScore) * 100)));
  const bluePercentage = 100 - redPercentage;

  const isRedLeading = redScore > blueScore;
  const isDraw = redScore === blueScore;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const renderMVP = (team: 'red' | 'blue') => {
    const donors = team === 'red' ? pkState.redTeam.topDonors : pkState.blueTeam.topDonors;
    if (!donors || donors.length === 0) return null;

    return (
      <div className={`flex items-center gap-1 ${team === 'red' ? 'justify-start' : 'justify-end'}`}>
        {donors.map((donor, idx) => (
          <div key={idx} className="relative group">
            <div className={`w-6 h-6 rounded-full border border-white/40 overflow-hidden shadow-sm hover:scale-110 transition-transform cursor-help ${idx === 0 ? 'ring-2 ring-amber-400' : ''}`}>
              <img src={donor.avatar} alt={donor.name} className="w-full h-full object-cover" />
            </div>
            {idx === 0 && (
              <div className="absolute -top-1.5 -right-1.5 bg-amber-500 rounded-full p-0.5 shadow-md">
                <Trophy className="w-2 h-2 text-white fill-white" />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-md mx-auto z-30 my-1 font-sans text-white select-none animate-in fade-in zoom-in-95 duration-200">
      {/* 🌟 MAIN PK BATTLE CARD */}
      <div className="relative bg-slate-950/85 backdrop-blur-xl border border-purple-500/40 rounded-3xl p-3 shadow-[0_0_25px_rgba(168,85,247,0.35)] overflow-hidden">
        
        {/* Lead Indicator Glow */}
        <div className={`absolute top-0 bottom-0 w-32 blur-[60px] opacity-30 pointer-events-none transition-all duration-700 ${isRedLeading ? 'left-0 bg-rose-500' : isDraw ? 'hidden' : 'right-0 bg-cyan-500'}`} />

        {/* Top Header Row: PK Badge & Timer */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {isRedLeading && <TrendingUp className="w-3 h-3 text-rose-500 animate-pulse" />}
            <span className="text-[11px] font-black text-rose-400 truncate max-w-[100px]">
              {pkState.redTeam.name}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 bg-gradient-to-r from-rose-600 via-amber-500 to-indigo-600 px-3 py-0.5 rounded-full shadow-lg border border-amber-300/40">
              <Swords className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
              <span className="font-mono font-black text-xs text-white tracking-wider">
                {battlePhase === 'punishment' ? '⚡ وقت الحكم' : '⚔️ PK'}
              </span>
              <span className={`font-mono font-black text-xs bg-slate-950/60 px-1.5 py-0.2 rounded-md ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-amber-200'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 justify-end min-w-0">
            <span className="text-[11px] font-black text-cyan-400 truncate max-w-[100px]">
              {pkState.blueTeam.name}
            </span>
            {!isRedLeading && !isDraw && <TrendingUp className="w-3 h-3 text-cyan-400 animate-pulse" />}
            {isHost && (
              <button
                onClick={onEndPK}
                className="p-1 rounded-full bg-slate-800/80 hover:bg-red-600/80 text-slate-300 hover:text-white transition-colors mr-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 🥊 MVPs ROW */}
        <div className="flex items-center justify-between px-2 mb-2">
          {renderMVP('red')}
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Top Donors</span>
          {renderMVP('blue')}
        </div>

        {/* 🥊 CONTESTANTS AVATARS & LIVE SCORE */}
        <div className="flex items-center justify-between px-2 my-1.5">
          {/* Red Team Host */}
          <div className="flex items-center gap-2">
            <div className={`relative ${isRedLeading ? 'scale-110' : 'scale-95 opacity-80'} transition-transform duration-500`}>
              <div className={`w-12 h-12 rounded-2xl overflow-hidden border-2 shadow-[0_0_15px_rgba(244,63,94,0.4)] ${isRedLeading ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-slate-700'}`}>
                <img src={pkState.redTeam.avatar} alt={pkState.redTeam.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white text-[8px] font-black px-1 rounded border border-rose-400">RED</div>
            </div>
            <div className="text-right">
              <span className="font-mono font-black text-lg text-rose-400 block leading-tight">
                {redScore.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="relative flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-lg border-2 border-amber-400 animate-pulse">
              <Flame className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            {battlePhase === 'punishment' && <Trophy className={`w-4 h-4 mt-1 ${isRedLeading ? 'text-rose-500' : 'text-cyan-400'} animate-bounce`} />}
          </div>

          {/* Blue Team Host */}
          <div className="flex items-center gap-2 flex-row-reverse">
            <div className={`relative ${!isRedLeading && !isDraw ? 'scale-110' : 'scale-95 opacity-80'} transition-transform duration-500`}>
              <div className={`w-12 h-12 rounded-2xl overflow-hidden border-2 shadow-[0_0_15px_rgba(34,211,238,0.4)] ${!isRedLeading && !isDraw ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-slate-700'}`}>
                <img src={pkState.blueTeam.avatar} alt={pkState.blueTeam.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -left-1 bg-cyan-600 text-white text-[8px] font-black px-1 rounded border border-cyan-300">BLUE</div>
            </div>
            <div className="text-left">
              <span className="font-mono font-black text-lg text-cyan-400 block leading-tight">
                {blueScore.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 📊 DYNAMIC PK PROGRESS BAR */}
        <div className="my-2 px-1">
          <div className="relative h-6 rounded-full overflow-hidden bg-slate-900 border border-slate-700/80 shadow-inner flex items-center">
            <div
              style={{ width: `${redPercentage}%` }}
              className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-500 ease-out flex items-center justify-start pl-2 text-[10px] font-black text-white shadow-lg relative overflow-hidden"
            >
              {redPercentage >= 20 && <span>{redPercentage}%</span>}
              {isRedLeading && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
            </div>

            <div className={`w-1.5 h-full bg-amber-300 z-10 shadow-[0_0_8px_rgba(252,211,77,1)] transition-transform duration-500 ${isDraw ? '' : isRedLeading ? 'translate-x-1' : '-translate-x-1'}`} />

            <div
              style={{ width: `${bluePercentage}%` }}
              className="h-full bg-gradient-to-l from-cyan-500 to-indigo-500 transition-all duration-500 ease-out flex items-center justify-end pr-2 text-[10px] font-black text-white shadow-lg relative overflow-hidden"
            >
              {bluePercentage >= 20 && <span>{bluePercentage}%</span>}
              {!isRedLeading && !isDraw && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
            </div>
          </div>
        </div>

        {/* 🎁 PUNISHMENT MESSAGE */}
        {battlePhase === 'punishment' && (
          <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-2 mb-2 text-center animate-pulse">
            <p className="text-[10px] font-black text-amber-300">
              ⚡ وقت الحكم: <span className="text-white">{punishmentChallenge}</span>
            </p>
          </div>
        )}

        {/* 🎁 QUICK SUPPORT ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onSendPKGift('red', 100)}
            className="py-2 px-2 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black text-[11px] shadow-md flex flex-col items-center justify-center active:scale-95 transition-all"
          >
            <div className="flex items-center gap-1">
              <Gift className="w-3.5 h-3.5 text-rose-200" />
              <span>دعم الأحمر</span>
            </div>
            <span className="text-[8px] opacity-80">+100 ⭐</span>
          </button>

          <button
            onClick={() => onSendPKGift('blue', 100)}
            className="py-2 px-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-[11px] shadow-md flex flex-col items-center justify-center active:scale-95 transition-all"
          >
            <div className="flex items-center gap-1">
              <Gift className="w-3.5 h-3.5 text-cyan-200" />
              <span>دعم الأزرق</span>
            </div>
            <span className="text-[8px] opacity-80">+100 ⭐</span>
          </button>
        </div>
      </div>
    </div>
  );
};
