import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { getNativeAudioContext } from '../../lib/nativeAudio';
import {
  Trophy,
  Volume2,
  VolumeX,
  HelpCircle,
  X,
  Plus,
  History,
  RotateCw,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface Slots777GameProps {
  user: UserProfile;
  onUpdateCoins: (delta: number) => void;
  onBack?: () => void;
}

// Slot Symbols Definitions
type SymbolType = 'DIAMOND' | 'SEVEN' | 'BELL' | 'CHERRY' | 'CROWN';

interface SymbolDef {
  id: SymbolType;
  label: string;
  icon: string;
  color: string;
  payout: number;
}

const SLOT_SYMBOLS: SymbolDef[] = [
  { id: 'SEVEN', label: '777', icon: '7️⃣', color: 'text-rose-500', payout: 50 },
  { id: 'DIAMOND', label: 'ماس', icon: '💎', color: 'text-cyan-400', payout: 20 },
  { id: 'BELL', label: 'جرس', icon: '🔔', color: 'text-amber-400', payout: 10 },
  { id: 'CROWN', label: 'تاج', icon: '👑', color: 'text-yellow-300', payout: 5 },
  { id: 'CHERRY', label: 'كرز', icon: '🍒', color: 'text-red-500', payout: 2 },
];

export const Slots777Game: React.FC<Slots777GameProps> = ({ user, onUpdateCoins, onBack }) => {
  // Game state
  const [betGear, setBetGear] = useState<number>(20);
  const [todaysWin, setTodaysWin] = useState<number>(24);
  const [currentWin, setCurrentWin] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showPaytableModal, setShowPaytableModal] = useState<boolean>(false);

  // 3 Reels (each reel has 3 visible symbols top, middle, bottom)
  const [reels, setReels] = useState<SymbolType[][]>([
    ['DIAMOND', 'DIAMOND', 'DIAMOND'],
    ['SEVEN', 'SEVEN', 'SEVEN'],
    ['BELL', 'BELL', 'BELL'],
  ]);

  // Online Players list (Shows logged-in user + active live players)
  const onlinePlayers = [
    {
      id: user.id || 'user',
      name: user.name ? `${user.name.slice(0, 5)}...` : 'ALEX...',
      avatar: user.avatar || '🐱',
      isCurrentUser: true,
    },
    {
      id: 'p1',
      name: '🤵 ...',
      avatar: '👑',
      isCurrentUser: false,
    },
    {
      id: 'p2',
      name: 'نبض...',
      avatar: '💖',
      isCurrentUser: false,
    },
  ];

  // Web Audio Synthesizer for Android & Web FX
  const playSound = (type: 'spin' | 'win' | 'jackpot' | 'click') => {
    if (soundMuted) return;
    try {
      const ctx = getNativeAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'spin') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'win') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'jackpot') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {
      // Audio fallback
    }
  };

  // Handle Spin Logic
  const handleSpin = () => {
    if (isSpinning) return;
    if (user.coins < betGear) {
      alert('رصيدك غير كافٍ للرهان!');
      setIsAutoSpin(false);
      return;
    }

    onUpdateCoins(-betGear);
    setIsSpinning(true);
    setCurrentWin(0);
    playSound('spin');

    // Simulate Reel Rolling Animation
    let ticks = 0;
    const interval = setInterval(() => {
      setReels([
        Array.from({ length: 3 }, () => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].id),
        Array.from({ length: 3 }, () => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].id),
        Array.from({ length: 3 }, () => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].id),
      ]);
      ticks++;

      if (ticks > 12) {
        clearInterval(interval);

        // Final Outcome calculation
        const rand = Math.random();
        let finalReels: SymbolType[][];

        if (rand < 0.1) {
          // Triple 777 Jackpot
          finalReels = [
            ['DIAMOND', 'SEVEN', 'BELL'],
            ['SEVEN', 'SEVEN', 'SEVEN'],
            ['BELL', 'SEVEN', 'DIAMOND'],
          ];
        } else if (rand < 0.35) {
          // Matching Triple Row
          const sym = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].id;
          finalReels = [
            ['DIAMOND', sym, 'BELL'],
            ['SEVEN', sym, 'CROWN'],
            ['CHERRY', sym, 'DIAMOND'],
          ];
        } else {
          // Random symbols
          finalReels = [
            ['DIAMOND', 'SEVEN', 'BELL'],
            ['DIAMOND', 'SEVEN', 'BELL'],
            ['DIAMOND', 'SEVEN', 'BELL'],
          ];
        }

        setReels(finalReels);
        setIsSpinning(false);

        // Calculate Win on middle row
        const mid1 = finalReels[0][1];
        const mid2 = finalReels[1][1];
        const mid3 = finalReels[2][1];

        let winMult = 0;
        if (mid1 === mid2 && mid2 === mid3) {
          const symDef = SLOT_SYMBOLS.find((s) => s.id === mid1);
          winMult = symDef ? symDef.payout : 10;
        } else if (mid1 === 'SEVEN' || mid2 === 'SEVEN' || mid3 === 'SEVEN') {
          winMult = 2;
        }

        if (winMult > 0) {
          const win = betGear * winMult;
          setCurrentWin(win);
          setTodaysWin((prev) => prev + win);
          onUpdateCoins(win);
          playSound(winMult >= 20 ? 'jackpot' : 'win');
        }
      }
    }, 80);
  };

  // Auto Spin loop
  useEffect(() => {
    let timer: any;
    if (isAutoSpin && !isSpinning) {
      timer = setTimeout(() => {
        handleSpin();
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isAutoSpin, isSpinning]);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-950 text-white rounded-3xl border-2 border-amber-600/60 shadow-2xl overflow-hidden font-sans select-none flex flex-col dir-rtl relative">
      {/* 1. TOP CURTAIN BACKDROP & 3D GOLD TITLE "Super 777" */}
      <div className="relative bg-gradient-to-b from-[#0f2d25] via-[#0b221c] to-[#081814] pt-3 pb-2 px-3 border-b-2 border-amber-500/60 shadow-lg">
        {/* Top Control Bar: Balance (6 +) | History (L) | Mute | Help ? | Close X */}
        <div className="flex items-center justify-between text-xs mb-2 z-20 relative">
          {/* Balance Capsule */}
          <div className="bg-emerald-950/90 border border-emerald-400/50 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono font-black text-amber-300 text-xs shadow-inner">
            <span>{user.coins}</span>
            <button className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs cursor-pointer hover:bg-emerald-400">
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Utility Buttons */}
          <div className="flex items-center gap-1.5">
            {/* History L */}
            <button
              onClick={() => {
                setShowPaytableModal(true);
                playSound('click');
              }}
              className="w-7 h-7 rounded-full bg-slate-900/80 border border-amber-500/40 text-amber-300 flex items-center justify-center text-xs font-black hover:text-white cursor-pointer"
            >
              L
            </button>

            {/* Mute button */}
            <button
              onClick={() => {
                setSoundMuted(!soundMuted);
                playSound('click');
              }}
              className="w-7 h-7 rounded-full bg-slate-900/80 border border-amber-500/40 text-amber-300 flex items-center justify-center hover:text-white cursor-pointer"
            >
              {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Help ? */}
            <button
              onClick={() => {
                setShowRulesModal(true);
                playSound('click');
              }}
              className="w-7 h-7 rounded-full bg-slate-900/80 border border-amber-500/40 text-amber-300 flex items-center justify-center text-xs font-black hover:text-white cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            {/* Close X */}
            <button
              onClick={onBack}
              className="w-7 h-7 rounded-full bg-slate-900/80 border border-rose-500/50 text-rose-300 flex items-center justify-center text-xs font-black hover:bg-rose-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3D Gold Ribbon "Super 777" Logo Header */}
        <div className="text-center relative my-1 z-10">
          <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 p-[2px] rounded-2xl shadow-xl">
            <div className="bg-gradient-to-b from-amber-950 via-slate-950 to-amber-950 px-6 py-1 rounded-2xl flex items-center gap-2 border border-yellow-300/60">
              <span className="font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 tracking-wider font-serif drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Super
              </span>
              <span className="font-black text-2xl sm:text-3xl text-rose-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] italic tracking-tight">
                777
              </span>
            </div>
          </div>
        </div>

        {/* 2. ONLINE PLAYERS / RANKING ROW */}
        <div className="mt-2 bg-emerald-950/60 backdrop-blur-sm border border-emerald-500/40 rounded-2xl p-1.5 flex items-center justify-around z-10 relative shadow-inner">
          {/* Ranking Trophy Badge */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 shadow">
              <Trophy className="w-4 h-4 text-yellow-400" />
            </div>
            <span className="text-[9px] font-black text-amber-300 uppercase mt-0.5">ranking</span>
          </div>

          {/* Logged in Players Avatar Circles */}
          {onlinePlayers.map((player) => (
            <div key={player.id} className="flex flex-col items-center group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-md relative">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden text-base">
                  {player.avatar}
                </div>
                {player.isCurrentUser && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border border-slate-900 flex items-center justify-center text-[8px] font-black text-slate-950">
                    ✓
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-200 truncate max-w-[60px] mt-0.5">
                {player.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. MAIN SLOT CABINET (DEEP GREEN FELT & GOLD STUDDED BORDERS) */}
      <div className="relative bg-gradient-to-b from-[#0b3328] via-[#092920] to-[#051a14] p-3 border-b-2 border-amber-500/50">
        {/* Outer Gold Frame with Star Studs */}
        <div className="relative bg-amber-950/80 rounded-3xl border-4 border-amber-500/80 p-2 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
          {/* Side Payline Arrows (< 5 and 5 >) */}
          <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 border border-amber-200 text-slate-950 font-black text-[10px] px-1.5 py-1 rounded-r-lg shadow-lg z-20 flex items-center gap-0.5">
            <span>&lt;</span>
            <span>5</span>
          </div>

          <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 bg-gradient-to-l from-amber-500 to-yellow-400 border border-amber-200 text-slate-950 font-black text-[10px] px-1.5 py-1 rounded-l-lg shadow-lg z-20 flex items-center gap-0.5">
            <span>5</span>
            <span>&gt;</span>
          </div>

          {/* 3 REELS CABINET (White/Gold Curved Drum Reels) */}
          <div className="grid grid-cols-3 gap-2 bg-[#04120e] p-2 rounded-2xl border-2 border-emerald-500/60 shadow-inner overflow-hidden">
            {[0, 1, 2].map((reelIdx) => (
              <div
                key={reelIdx}
                className="bg-gradient-to-b from-amber-100 via-amber-50 to-amber-200 rounded-xl border-2 border-amber-300 p-1 flex flex-col gap-2 items-center justify-around min-h-[180px] shadow-lg relative"
              >
                {/* 3 Visible Rows per Reel */}
                {reels[reelIdx].map((symId, rowIdx) => {
                  const symDef = SLOT_SYMBOLS.find((s) => s.id === symId) || SLOT_SYMBOLS[0];
                  return (
                    <div
                      key={rowIdx}
                      className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center p-1 border shadow-inner transition-transform ${
                        rowIdx === 1 ? 'scale-105 border-amber-400 bg-white' : 'border-amber-200 bg-amber-50/80'
                      }`}
                    >
                      <span className="text-3xl sm:text-4xl drop-shadow">{symDef.icon}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 4. DIGITAL COUNTERS HUD (BET GEAR | TODAY'S WIN | WIN) */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {/* BET GEAR */}
          <div className="bg-slate-950/90 border border-emerald-500/40 p-1.5 rounded-xl flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-400 uppercase">BET GEAR</span>
            <div className="bg-black/90 px-2 py-0.5 rounded border border-emerald-500/30 font-mono text-emerald-400 font-black text-sm tracking-widest mt-0.5 w-full">
              {String(betGear).padStart(7, '0')}
            </div>
          </div>

          {/* TODAY'S WIN */}
          <div className="bg-slate-950/90 border border-emerald-500/40 p-1.5 rounded-xl flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-400 uppercase">TODAY`S WIN</span>
            <div className="bg-black/90 px-2 py-0.5 rounded border border-amber-500/30 font-mono text-amber-300 font-black text-sm tracking-wider mt-0.5 w-full">
              {todaysWin}
            </div>
          </div>

          {/* WIN */}
          <div className="bg-slate-950/90 border border-emerald-500/40 p-1.5 rounded-xl flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-400 uppercase">WIN</span>
            <div className="bg-black/90 px-2 py-0.5 rounded border border-amber-500/30 font-mono text-amber-400 font-black text-sm tracking-wider mt-0.5 w-full">
              {currentWin}
            </div>
          </div>
        </div>
      </div>

      {/* 5. TACTILE 3D BUTTONS CONTROL PANEL (BET - | BET + | AUTO | SPIN) */}
      <div className="bg-gradient-to-b from-[#07211b] via-[#051813] to-[#020b09] p-3 border-t border-amber-500/40">
        <div className="grid grid-cols-4 gap-2">
          {/* BET - Button */}
          <button
            type="button"
            disabled={isSpinning}
            onClick={() => {
              setBetGear((b) => Math.max(5, b - 5));
              playSound('click');
            }}
            className="py-3.5 px-1 bg-gradient-to-b from-cyan-400 via-cyan-500 to-cyan-700 hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs rounded-2xl shadow-[0_4px_0_#0e7490] border border-cyan-200 cursor-pointer disabled:opacity-50 flex flex-col items-center justify-center font-mono"
          >
            <span>BET</span>
            <span className="text-sm font-black">-</span>
          </button>

          {/* BET + Button */}
          <button
            type="button"
            disabled={isSpinning}
            onClick={() => {
              setBetGear((b) => b + 5);
              playSound('click');
            }}
            className="py-3.5 px-1 bg-gradient-to-b from-cyan-400 via-cyan-500 to-cyan-700 hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs rounded-2xl shadow-[0_4px_0_#0e7490] border border-cyan-200 cursor-pointer disabled:opacity-50 flex flex-col items-center justify-center font-mono"
          >
            <span>BET</span>
            <span className="text-sm font-black">+</span>
          </button>

          {/* AUTO Button */}
          <button
            type="button"
            onClick={() => {
              setIsAutoSpin(!isAutoSpin);
              playSound('click');
            }}
            className={`py-3.5 px-1 font-black text-xs rounded-2xl shadow-[0_4px_0_#0e7490] border transition-all cursor-pointer flex flex-col items-center justify-center font-mono ${
              isAutoSpin
                ? 'bg-amber-400 text-slate-950 border-yellow-200 shadow-[0_4px_0_#b45309]'
                : 'bg-gradient-to-b from-cyan-400 via-cyan-500 to-cyan-700 text-slate-950 border-cyan-200'
            }`}
          >
            <span>AUTO</span>
          </button>

          {/* SPIN Button (Glossy 3D Gold Button) */}
          <button
            type="button"
            disabled={isSpinning}
            onClick={handleSpin}
            className={`py-3.5 px-1 bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-600 hover:brightness-110 active:scale-95 text-slate-950 font-black text-sm rounded-2xl shadow-[0_4px_0_#b45309] border-2 border-yellow-100 cursor-pointer disabled:opacity-50 flex flex-col items-center justify-center font-mono tracking-wider ${
              isSpinning ? 'animate-pulse' : ''
            }`}
          >
            <span>SPIN</span>
          </button>
        </div>
      </div>

      {/* GAME RULES MODAL */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans dir-rtl">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-4 space-y-3 text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-black text-sm text-amber-300">قواعد لعبة Super 777 🎰</h3>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>1. حدد قيمة الرهان عبر أزرار (BET + / BET -).</p>
              <p>2. اضغط على زر SPIN لبدء دوران البكرات الثلاث.</p>
              <p>3. التطابق الثلاثي للرموز في الصف الأوسط يمنحك أرباحاً هائلة مضاعفة!</p>
              <p>4. الحصول على ثلاثة رموز 7️⃣7️⃣7️⃣ يمنح الجاك بوت الكبير (50x).</p>
            </div>
          </div>
        </div>
      )}

      {/* PAYTABLE MODAL */}
      {showPaytableModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans dir-rtl">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-4 space-y-3 text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-black text-sm text-amber-300">جدول الأرباح (Super 777) 💎</h3>
              <button
                onClick={() => setShowPaytableModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              {SLOT_SYMBOLS.map((sym) => (
                <div key={sym.id} className="flex items-center justify-between bg-slate-950 p-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{sym.icon}</span>
                    <span className="font-bold text-white">{sym.label}</span>
                  </div>
                  <span className="font-mono font-black text-amber-400 text-xs">x{sym.payout}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
