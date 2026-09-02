import React, { useState, useEffect } from 'react';
import {
  X,
  Gift,
  Coins,
  Sparkles,
  Flame,
  Crown,
  Timer,
  CheckCircle2,
  Users,
  Award,
} from 'lucide-react';
import { UserProfile, VoiceRoom } from '../../types';
import { useI18n } from '../../lib/i18n';

interface LuckyRoomChestModalProps {
  user: UserProfile;
  room: VoiceRoom;
  onClose: () => void;
  onDropChest?: (amount: number, message: string) => void;
  onClaimCoins?: (amount: number) => void;
}

export const LuckyRoomChestModal: React.FC<LuckyRoomChestModalProps> = ({
  user,
  room,
  onClose,
  onDropChest,
  onClaimCoins,
}) => {
  const { t, dir } = useI18n();
  const [activeTab, setActiveTab] = useState<'drop' | 'live'>('drop');
  const [selectedChestAmount, setSelectedChestAmount] = useState(1000);
  const [wishesMessage, setWishesMessage] = useState('كفو يا نشامى الروم.. هدايا حظ للجميع! 🎁🔥');
  
  // Live Active Chest State
  const [hasActiveChest, setHasActiveChest] = useState(true);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isClaimed, setIsClaimed] = useState(false);
  const [wonAmount, setWonAmount] = useState<number | null>(null);

  const CHEST_TIERS = [
    { amount: 500, label: 'صندوق البرونز', color: 'from-amber-700 to-amber-900', icon: '📦', minVip: 1 },
    { amount: 1000, label: 'صندوق الفضة', color: 'from-slate-500 to-slate-700', icon: '🎁', minVip: 2 },
    { amount: 5000, label: 'صندوق الذهب الملكي', color: 'from-amber-500 to-yellow-600', icon: '👑', minVip: 3 },
    { amount: 10000, label: 'صندوق التنين الأسطوري', color: 'from-rose-600 to-purple-800', icon: '🐉', minVip: 5 },
  ];

  // Timer simulation
  useEffect(() => {
    if (timeLeft > 0 && !isClaimed) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isClaimed]);

  const handleClaim = () => {
    if (isClaimed) return;
    const randomWin = Math.floor(Math.random() * 80) + 20;
    setWonAmount(randomWin);
    setIsClaimed(true);

    // Audio chime
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6 + idx * 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + 0.7 + idx * 0.1);
      });
    } catch (e) {}

    if (onClaimCoins) {
      onClaimCoins(randomWin);
    }
  };

  const handleDropNewChest = () => {
    if (user.coins < selectedChestAmount) {
      alert(t('insufficientBalance'));
      return;
    }

    if (onDropChest) {
      onDropChest(selectedChestAmount, wishesMessage);
    }

    setHasActiveChest(true);
    setTimeLeft(60);
    setIsClaimed(false);
    setWonAmount(null);
    setActiveTab('live');
    alert(`🎉 تم إطلاق ${selectedChestAmount} كوينز كصندوق حظ جماعي في الغرفة!`);
  };

  return (
    <div dir={dir} className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-sans select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#21170d] via-[#140e06] to-[#080502] border-2 border-amber-500/70 rounded-3xl p-5 text-start shadow-[0_0_40px_rgba(245,158,11,0.4)] space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-amber-900/50 pb-2.5">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
            <h3 className="font-black text-sm text-amber-300">{t('luckyChest')}</h3>
          </div>

          <div className="w-6" />
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1 rounded-2xl border border-amber-900/40">
          <button
            onClick={() => setActiveTab('drop')}
            className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'drop' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>رمي صندوق كنز 🎁</span>
          </button>

          <button
            onClick={() => setActiveTab('live')}
            className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'live' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>الصندوق النشط 🔥</span>
          </button>
        </div>

        {/* 1. DROP CHEST TAB */}
        {activeTab === 'drop' && (
          <div className="space-y-3.5">
            <div className="text-[11px] text-amber-200 font-bold">
              اختر قيمة صندوق الكنز ليتم توزيعه على كل الحضور في الروم:
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {CHEST_TIERS.map((tier) => {
                const isSelected = selectedChestAmount === tier.amount;
                return (
                  <button
                    key={tier.amount}
                    onClick={() => setSelectedChestAmount(tier.amount)}
                    className={`p-3 rounded-2xl bg-gradient-to-br ${tier.color} text-white font-black border text-start space-y-1 transition-all cursor-pointer ${
                      isSelected ? 'border-amber-300 ring-2 ring-amber-400 scale-102 shadow-xl' : 'border-white/10 hover:brightness-110 opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{tier.icon}</span>
                      <span className="text-[10px] bg-black/60 px-2 py-0.5 rounded-full font-mono text-amber-300">
                        {tier.amount} كوينز
                      </span>
                    </div>
                    <span className="text-xs font-black block">{tier.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Message */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">رسالة الإهداء في الروم:</label>
              <input
                type="text"
                value={wishesMessage}
                onChange={(e) => setWishesMessage(e.target.value)}
                className="w-full bg-[#170e04] border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* User Coin Balance */}
            <div className="bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-slate-400">رصيدك الحالي:</span>
              <span className="font-black text-amber-300 font-mono flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{user.coins.toLocaleString()}</span>
              </span>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleDropNewChest}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-amber-950/80 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              <span>إطلاق الصندوق في الغرفة الآن 🚀</span>
            </button>
          </div>
        )}

        {/* 2. LIVE ACTIVE CHEST TAB */}
        {activeTab === 'live' && (
          <div className="space-y-4 text-center py-2">
            <div className="relative mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-600 p-1 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-bounce">
              <span className="text-5xl">🎁</span>
              <span className="absolute -top-2 -right-2 text-xl animate-spin">✨</span>
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-sm text-amber-300">صندوق الكنز الملكي مفتوح!</h4>
              <p className="text-[11px] text-slate-300">{wishesMessage}</p>
            </div>

            {/* Countdown / Status */}
            <div className="bg-black/60 border border-amber-500/40 p-3 rounded-2xl inline-flex items-center gap-2 text-xs font-mono text-amber-400">
              <Timer className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>{timeLeft > 0 ? `ينتهي بعد: 00:${timeLeft < 10 ? '0' : ''}${timeLeft}` : 'انتهى الوقت!'}</span>
            </div>

            {/* Win display or claim button */}
            {isClaimed ? (
              <div className="bg-emerald-950/80 border-2 border-emerald-500/60 p-3.5 rounded-2xl space-y-1 animate-in zoom-in">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-black text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>مبروك! لقد حصلت على:</span>
                </div>
                <span className="text-2xl font-black text-amber-300 font-mono">+{wonAmount} كوينز 🪙</span>
              </div>
            ) : (
              <button
                onClick={handleClaim}
                disabled={timeLeft <= 0}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 hover:brightness-110 text-slate-950 font-black text-sm rounded-2xl shadow-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>التقط الكوينز الآن 💰</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
