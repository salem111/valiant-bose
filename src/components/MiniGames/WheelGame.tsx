import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../../types';
import { getNativeAudioContext } from '../../lib/nativeAudio';
import {
  RotateCw,
  Zap,
  Volume2,
  VolumeX,
  Plus,
  HelpCircle,
  X,
  Trophy,
  Crown,
  Sparkles,
  ArrowLeft,
  Flame,
  Gift,
  Coins,
  History,
  CheckCircle2,
} from 'lucide-react';

interface WheelGameProps {
  user: UserProfile;
  onUpdateCoins: (delta: number) => void;
  onBack?: () => void;
}

interface WheelSlice {
  id: number;
  label: string;
  subLabel: string;
  multiplier: number;
  type: 'coins' | 'jackpot' | 'double';
  color: string;
  textColor: string;
  icon: string;
}

const WHEEL_SLICES: WheelSlice[] = [
  { id: 1, label: '100,000', subLabel: 'MEGA JACKPOT', multiplier: 50, type: 'jackpot', color: '#eab308', textColor: '#451a03', icon: '👑' }, // Gold Jackpot
  { id: 2, label: '500', subLabel: 'عملة', multiplier: 1, type: 'coins', color: '#3b82f6', textColor: '#ffffff', icon: '🪙' }, // Blue
  { id: 3, label: '5,000', subLabel: 'ذهبي', multiplier: 5, type: 'coins', color: '#a855f7', textColor: '#ffffff', icon: '💎' }, // Purple
  { id: 4, label: '1,000', subLabel: 'عملة', multiplier: 2, type: 'coins', color: '#06b6d4', textColor: '#ffffff', icon: '🪙' }, // Cyan
  { id: 5, label: '25,000', subLabel: 'ياقوت VIP', multiplier: 25, type: 'coins', color: '#ef4444', textColor: '#ffffff', icon: '🔥' }, // Red
  { id: 6, label: '2,500', subLabel: 'عملة', multiplier: 3, type: 'coins', color: '#10b981', textColor: '#ffffff', icon: '🪙' }, // Green
  { id: 7, label: '50,000', subLabel: 'سوبر ماسي', multiplier: 35, type: 'coins', color: '#ec4899', textColor: '#ffffff', icon: '⭐' }, // Pink
  { id: 8, label: 'ضعف الرهان', subLabel: '2X BONUS', multiplier: 2, type: 'double', color: '#f97316', textColor: '#ffffff', icon: '✨' }, // Orange
];

const BET_PRESETS = [50, 100, 250, 500, 1000, 2500, 5000];

export const WheelGame: React.FC<WheelGameProps> = ({ user, onUpdateCoins, onBack }) => {
  const [selectedBet, setSelectedBet] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningSlice, setWinningSlice] = useState<WheelSlice | null>(null);
  const [winCoins, setWinCoins] = useState<number>(0);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [activeLedIndex, setActiveLedIndex] = useState<number>(0);
  const [pointerWobble, setPointerWobble] = useState<boolean>(false);

  // Live recent winners feed
  const [recentWinners, setRecentWinners] = useState<Array<{ name: string; amount: number; time: string; slice: string }>>([
    { name: 'الشيخ خالد 👑', amount: 50000, time: 'منذ دقيقة', slice: '⭐ سوبر ماسي' },
    { name: 'أميرة الشوق ✨', amount: 25000, time: 'منذ 3 دقائق', slice: '🔥 ياقوت VIP' },
    { name: 'الكابتن علي 🃏', amount: 10000, time: 'منذ 6 دقائق', slice: '💎 ذهبي' },
  ]);

  // Spin History
  const [spinHistory, setSpinHistory] = useState<Array<{ id: string; bet: number; win: number; label: string; time: string }>>([]);

  // Running LED bulbs border effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLedIndex((prev) => (prev + 1) % 16);
    }, isSpinning ? 60 : 250);
    return () => clearInterval(interval);
  }, [isSpinning]);

  // Synthesized Arcade & Casino Audio
  const playSound = (type: 'tick' | 'spin_start' | 'win' | 'jackpot' | 'chip') => {
    if (soundMuted) return;
    try {
      const ctx = getNativeAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'tick') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.03);
      } else if (type === 'spin_start') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'win') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24);
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.36);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.55);
      } else if (type === 'jackpot') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      } else if (type === 'chip') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      }
    } catch (e) {}
  };

  // Trigger Authentic Wheel Spin
  const handleSpin = () => {
    if (isSpinning) return;
    if (user.coins < selectedBet) {
      alert('رصيد العملات غير كافٍ! يرجى شحن الرصيد أولاً.');
      return;
    }

    // Deduct bet coins
    onUpdateCoins(-selectedBet);
    setIsSpinning(true);
    setShowWinModal(false);
    setWinningSlice(null);
    playSound('spin_start');

    // Pick winning slice
    const sliceCount = WHEEL_SLICES.length;
    const sliceAngle = 360 / sliceCount; // 45 deg

    // Probabilities: higher chance for 1x, 2x, 3x, lower for jackpot
    const rand = Math.random();
    let chosenIdx = 1; // Default 500
    if (rand < 0.35) chosenIdx = 1; // 500
    else if (rand < 0.60) chosenIdx = 3; // 1,000
    else if (rand < 0.75) chosenIdx = 5; // 2,500
    else if (rand < 0.87) chosenIdx = 7; // 2x Bonus
    else if (rand < 0.94) chosenIdx = 2; // 5,000
    else if (rand < 0.98) chosenIdx = 4; // 25,000
    else if (rand < 0.995) chosenIdx = 6; // 50,000
    else chosenIdx = 0; // MEGA JACKPOT

    const selectedSlice = WHEEL_SLICES[chosenIdx];

    // Sector angle math: pointer is at top (0 deg / 360 deg)
    // Slice 0 is centered at angle (0 * 45 + 22.5) deg
    const targetSliceCenter = chosenIdx * sliceAngle + sliceAngle / 2;
    const targetDegrees = 360 - targetSliceCenter;
    const fullSpins = 360 * (6 + Math.floor(Math.random() * 3)); // 6-8 full rotations
    const totalRotation = rotation + fullSpins + (targetDegrees - (rotation % 360) + 360) % 360;

    setRotation(totalRotation);

    // Ticking audio while spinning
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      tickCount++;
      playSound('tick');
      setPointerWobble(true);
      setTimeout(() => setPointerWobble(false), 40);
      if (tickCount > 35) {
        clearInterval(tickInterval);
      }
    }, 110);

    // Spin completion
    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setWinningSlice(selectedSlice);

      const payout = selectedBet * selectedSlice.multiplier;
      setWinCoins(payout);
      onUpdateCoins(payout);
      setShowWinModal(true);

      if (selectedSlice.type === 'jackpot') {
        playSound('jackpot');
      } else {
        playSound('win');
      }

      // Add to spin history
      setSpinHistory((prev) => [
        {
          id: `spin-${Date.now()}`,
          bet: selectedBet,
          win: payout,
          label: selectedSlice.label,
          time: 'الآن',
        },
        ...prev,
      ]);

      // Add to live winners feed
      if (payout >= selectedBet * 5) {
        setRecentWinners((prev) => [
          {
            name: `${user.name} 🌟`,
            amount: payout,
            time: 'الآن',
            slice: `${selectedSlice.icon} ${selectedSlice.label}`,
          },
          ...prev.slice(0, 4),
        ]);
      }
    }, 4500);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-gradient-to-b from-[#180a2e] via-[#100520] to-[#080210] text-white rounded-3xl border-2 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden font-sans select-none flex flex-col dir-rtl relative">
      {/* 1. TOP HEADER */}
      <div className="bg-gradient-to-r from-purple-950/90 via-slate-900/90 to-amber-950/90 border-b border-amber-500/40 px-4 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-purple-900/40 hover:bg-purple-800 border border-amber-500/30 text-amber-300 cursor-pointer transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="font-black text-sm sm:text-base text-amber-300 flex items-center gap-1.5 drop-shadow">
              <span>🎡 عجلة الحظ الذهبية الملكية</span>
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">ROYAL FORTUNE WHEEL 👑</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* User Balance Chip */}
          <div className="bg-slate-950/80 border border-amber-500/50 px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5 shadow-inner">
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span>{user.coins.toLocaleString()}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundMuted(!soundMuted);
              playSound('chip');
            }}
            className="p-1.5 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 hover:text-white cursor-pointer"
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* History */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="p-1.5 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 hover:text-white cursor-pointer"
            title="سجل الجولات"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Help */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-1.5 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 hover:text-white cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. RECENT WINNERS TICKER MARQUEE */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-1.5 flex items-center justify-between text-xs text-amber-200 overflow-hidden">
        <div className="flex items-center gap-1.5 text-[11px] font-bold shrink-0">
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>أحدث الفائزين:</span>
        </div>
        <div className="marquee-content flex items-center gap-4 text-[10px] font-mono text-amber-300 truncate">
          {recentWinners.map((w, idx) => (
            <span key={idx} className="inline-flex items-center gap-1">
              <span className="text-white font-bold">{w.name}</span>
              <span className="text-emerald-400 font-bold">+{w.amount.toLocaleString()} 🪙</span>
              <span className="text-slate-400">({w.slice})</span>
            </span>
          ))}
        </div>
      </div>

      {/* 3. AUTHENTIC CIRCULAR WHEEL STAGE */}
      <div className="relative py-6 px-4 flex flex-col items-center justify-center overflow-hidden min-h-[360px]">
        {/* Background Radiant Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-purple-900/10 to-transparent pointer-events-none" />

        {/* Outer LED Light Bulbs Frame */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          {/* LED Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-amber-500 shadow-[0_0_35px_rgba(245,158,11,0.6)] bg-gradient-to-tr from-amber-950 via-slate-950 to-amber-900 p-2.5">
            {/* 16 LED Bulbs Around Perimeter */}
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i * 360) / 16;
              const isActive = i === activeLedIndex || (i + 8) % 16 === activeLedIndex;
              return (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 transition-colors duration-150"
                  style={{
                    top: `${50 - 46 * Math.cos((angle * Math.PI) / 180)}%`,
                    left: `${50 + 46 * Math.sin((angle * Math.PI) / 180)}%`,
                    backgroundColor: isActive ? '#fef08a' : '#78350f',
                    boxShadow: isActive ? '0 0 10px #facc15, 0 0 20px #eab308' : 'none',
                  }}
                />
              );
            })}

            {/* ROTATING WHEEL SVG / CANVAS */}
            <div
              className="w-full h-full rounded-full relative overflow-hidden transition-transform shadow-inner"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionDuration: isSpinning ? '4.5s' : '0s',
                transitionTimingFunction: 'cubic-bezier(0.12, 0.8, 0.15, 1)',
                background: 'conic-gradient(#eab308 0deg 45deg, #3b82f6 45deg 90deg, #a855f7 90deg 135deg, #06b6d4 135deg 180deg, #ef4444 180deg 225deg, #10b981 225deg 270deg, #ec4899 270deg 315deg, #f97316 315deg 360deg)',
              }}
            >
              {/* Slices Labels & Multipliers */}
              {WHEEL_SLICES.map((slice, idx) => {
                const angle = idx * 45 + 22.5;
                return (
                  <div
                    key={slice.id}
                    className="absolute inset-0 flex flex-col items-center justify-start pt-3 text-center"
                    style={{
                      transform: `rotate(${angle}deg)`,
                      transformOrigin: '50% 50%',
                    }}
                  >
                    <span className="text-base drop-shadow">{slice.icon}</span>
                    <span
                      className="font-black text-xs sm:text-sm font-mono tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                      style={{ color: slice.textColor }}
                    >
                      {slice.label}
                    </span>
                    <span className="text-[8px] font-black uppercase text-white/90 drop-shadow">
                      {slice.subLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TOP MECHANICAL POINTER (ARROW NEEDLE) */}
          <div
            className={`absolute -top-3 z-30 flex flex-col items-center transition-transform ${
              pointerWobble ? '-rotate-12 scale-110' : 'rotate-0'
            }`}
          >
            {/* 3D Pointer Arrow */}
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-amber-400 drop-shadow-[0_4px_10px_rgba(245,158,11,0.9)] filter" />
            <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-amber-300 -mt-2 shadow-md" />
          </div>

          {/* CENTER GOLDEN SPIN BUTTON */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 p-1 shadow-[0_0_25px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-80 group"
          >
            <div className="w-full h-full rounded-full bg-gradient-to-b from-[#381a03] to-[#1a0800] border-2 border-yellow-300 flex flex-col items-center justify-center p-1 group-hover:border-white">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 fill-amber-300 group-hover:animate-bounce" />
              <span className="font-black text-[11px] sm:text-xs text-amber-200 tracking-wider font-serif">
                {isSpinning ? '...' : 'إبدأ'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 4. BET CHIPS & CONTROLS */}
      <div className="p-4 bg-gradient-to-b from-[#140824] to-[#0a0214] border-t-2 border-amber-500/40 space-y-3">
        {/* Bet Chips Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-bold flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>اختر قيمة الرهان:</span>
            </span>
            <span className="text-amber-400 font-mono font-black">{selectedBet.toLocaleString()} 🪙</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {BET_PRESETS.map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setSelectedBet(chip);
                  playSound('chip');
                }}
                disabled={isSpinning}
                className={`py-2 rounded-xl font-mono font-black text-xs transition-all cursor-pointer border ${
                  selectedBet === chip
                    ? 'bg-gradient-to-t from-amber-600 to-yellow-400 text-slate-950 border-white shadow-lg scale-105'
                    : 'bg-slate-900/90 text-amber-300 border-amber-500/30 hover:bg-slate-800'
                }`}
              >
                {chip >= 1000 ? `${chip / 1000}K` : chip}
              </button>
            ))}
          </div>
        </div>

        {/* Big Action Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-base shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5 fill-slate-950" />
          <span>{isSpinning ? 'جاري تدوير عجلة الحظ...' : `تدوير العجلة الآن (${selectedBet.toLocaleString()} 🪙)`}</span>
        </button>
      </div>

      {/* 5. WIN CELEBRATION MODAL */}
      {showWinModal && winningSlice && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#2a0e4e] via-[#1a0732] to-[#0d021a] border-2 border-amber-400 rounded-3xl p-6 shadow-[0_0_60px_rgba(245,158,11,0.8)] text-center space-y-4 relative">
            {/* Close */}
            <button
              onClick={() => setShowWinModal(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Trophy & Icon */}
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 shadow-2xl flex items-center justify-center animate-bounce">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-4xl">
                {winningSlice.icon}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-amber-300">
                {winningSlice.type === 'jackpot' ? '🎉 جاك بوت أسطوري! 🎉' : 'مبروك الفوز! 🏆'}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                استقرت العجلة على: <span className="text-amber-400 font-bold">{winningSlice.label} ({winningSlice.subLabel})</span>
              </p>
            </div>

            <div className="bg-slate-950/80 border-2 border-amber-500/60 rounded-2xl p-3 shadow-inner">
              <span className="text-[11px] text-slate-400 block">الجائزة المستلمة</span>
              <span className="text-3xl font-black text-emerald-400 font-mono">+{winCoins.toLocaleString()} 🪙</span>
            </div>

            <button
              onClick={() => setShowWinModal(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm shadow-lg cursor-pointer"
            >
              استلام ومتابعة اللعب 🚀
            </button>
          </div>
        </div>
      )}

      {/* 6. RULES & HELP MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-2xl text-right space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-amber-300">قواعد عجلة الحظ الملكية 📜</h3>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>• اختر قيمة الرهان المناسبة من شرائح العملات بالأسفل.</p>
              <p>• اضغط زر "إبدأ" أو الزر الذهبي بوسط العجلة لتدويرها.</p>
              <p>• جائزة الـ MEGA JACKPOT تمنحك مضاعف 50X فوري لقيمة رهانك!</p>
              <p>• جميع الجوائز والأرباح تضاف فوراً لحسابك ورصيد محفظتك.</p>
            </div>
          </div>
        </div>
      )}

      {/* 7. HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-2xl text-right space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-amber-300">سجل جولاتك السابقة 📜</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {spinHistory.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-4">لا توجد جولات سابقة بعد</p>
              ) : (
                spinHistory.map((item) => (
                  <div key={item.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{item.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                    </div>
                    <div className="text-left font-mono">
                      <span className="text-emerald-400 font-bold block">+{item.win.toLocaleString()} 🪙</span>
                      <span className="text-[10px] text-slate-400">رهان: {item.bet}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
