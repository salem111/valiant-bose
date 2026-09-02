import React, { useState } from 'react';
import { UserProfile, RedPacketItem, RedPacketWinner } from '../../types';
import { X, Sparkles, Flame, Users, Gift, Crown, Trophy, Coins, Send } from 'lucide-react';

interface RedPacketModalProps {
  user: UserProfile;
  activePacket: RedPacketItem | null;
  onClose: () => void;
  onDropPacket: (packet: RedPacketItem) => void;
  onClaimPacket: (packetId: string) => void;
  onOpenRecharge: () => void;
}

export const RedPacketModal: React.FC<RedPacketModalProps> = ({
  user,
  activePacket,
  onClose,
  onDropPacket,
  onClaimPacket,
  onOpenRecharge,
}) => {
  const [tab, setTab] = useState<'create' | 'view'>(activePacket ? 'view' : 'create');
  const [selectedCoins, setSelectedCoins] = useState<number>(1000);
  const [recipientsCount, setRecipientsCount] = useState<number>(10);
  const [blessingMessage, setBlessingMessage] = useState<string>('حظ سعيد وبركة للجميع! 🧧✨');
  const [hasClaimed, setHasClaimed] = useState<boolean>(false);
  const [claimedAmount, setClaimedAmount] = useState<number | null>(null);

  const canAfford = user.coins >= selectedCoins;

  const handleCreateDrop = () => {
    if (!canAfford) {
      alert('رصيدك من العملات الذهبية غير كافٍ لإسقاط هذا الظرف! يمكنك الشحن أولاً.');
      onOpenRecharge();
      return;
    }

    const newPacket: RedPacketItem = {
      id: `rp_${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      totalCoins: selectedCoins,
      totalRecipients: recipientsCount,
      remainingCoins: selectedCoins,
      remainingRecipients: recipientsCount,
      createdAt: Date.now(),
      durationSeconds: 60,
      status: 'active',
      blessingMessage: blessingMessage || 'حظ سعيد للجميع 🧧',
      winners: [],
    };

    onDropPacket(newPacket);
    setTab('view');
  };

  const handleClaim = () => {
    if (!activePacket || activePacket.status !== 'active' || hasClaimed) return;

    // Generate random lucky coin amount
    const avg = Math.floor(activePacket.totalCoins / activePacket.totalRecipients);
    const win = Math.max(10, Math.floor(avg * (0.5 + Math.random() * 1.2)));

    setClaimedAmount(win);
    setHasClaimed(true);
    onClaimPacket(activePacket.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200 dir-rtl font-sans select-none">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#2b0c13] via-[#1a070c] to-[#0d0407] border-2 border-red-500/80 rounded-3xl p-4 sm:p-5 space-y-4 shadow-[0_0_50px_rgba(239,68,68,0.4)] relative z-10 overflow-hidden text-right text-white">
        
        {/* Ambient Top Red Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-gradient-to-b from-red-600/30 to-transparent blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-red-900/50 pb-2.5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-0.5 shadow-lg flex items-center justify-center text-lg animate-bounce">
              🧧
            </div>
            <div>
              <h3 className="font-black text-sm text-amber-300">كنز الغرفة والظرف الأحمر</h3>
              <p className="text-[10px] text-red-200/80">إسقاط وتوزيع العملات على الحاضرين</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs Switcher */}
        <div className="flex items-center bg-[#15060a] p-1 rounded-2xl border border-red-900/40">
          <button
            onClick={() => setTab('create')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
              tab === 'create'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            إسقاط ظرف جديد 🎁
          </button>
          <button
            onClick={() => setTab('view')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
              tab === 'view'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            الظرف النشط بالغرفة 🧧
          </button>
        </div>

        {/* TAB 1: CREATE RED PACKET */}
        {tab === 'create' && (
          <div className="space-y-3.5">
            {/* Amount Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-200">اختر قيمة الظرف (عملات ذهبية 🪙):</label>
              <div className="grid grid-cols-3 gap-2">
                {[500, 1000, 2000, 5000, 10000, 25000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSelectedCoins(val)}
                    className={`py-2 px-1 rounded-2xl border font-black text-xs font-mono transition-all flex flex-col items-center gap-0.5 ${
                      selectedCoins === val
                        ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-950/60 scale-105'
                        : 'bg-[#1e0a10] border-red-900/50 text-slate-200 hover:border-red-500'
                    }`}
                  >
                    <span>{val.toLocaleString()} 🪙</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipients Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-200">عدد الأشخاص المحظوظين:</label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, 50].map((count) => (
                  <button
                    key={count}
                    onClick={() => setRecipientsCount(count)}
                    className={`py-1.5 rounded-xl border text-xs font-black transition-all ${
                      recipientsCount === count
                        ? 'bg-red-600 text-white border-red-400 shadow'
                        : 'bg-[#1e0a10] border-red-900/40 text-slate-300'
                    }`}
                  >
                    {count} أشخاص
                  </button>
                ))}
              </div>
            </div>

            {/* Blessing Message Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">رسالة الإهداء والبركة:</label>
              <input
                type="text"
                value={blessingMessage}
                onChange={(e) => setBlessingMessage(e.target.value)}
                placeholder="حظ سعيد للجميع 🧧"
                className="w-full bg-[#18080c] border border-red-900/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleCreateDrop}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white font-black text-sm shadow-xl shadow-red-950/80 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300/40"
            >
              <span>إسقاط الظرف الآن ({selectedCoins.toLocaleString()} 🪙)</span>
              <span>🔥</span>
            </button>
          </div>
        )}

        {/* TAB 2: ACTIVE PACKET VIEW / CLAIM */}
        {tab === 'view' && (
          <div className="space-y-3 text-center">
            {activePacket ? (
              <div className="space-y-3">
                <div className="relative w-24 h-24 mx-auto my-2">
                  <div className="absolute inset-0 bg-red-600 rounded-full blur-xl opacity-60 animate-pulse" />
                  <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-red-700 via-rose-600 to-amber-500 border-2 border-amber-300 flex items-center justify-center text-4xl shadow-2xl relative z-10 animate-bounce">
                    🧧
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-base text-amber-300">{activePacket.senderName}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">"{activePacket.blessingMessage}"</p>
                  <p className="text-sm font-black font-mono text-amber-400 mt-1">
                    {activePacket.totalCoins.toLocaleString()} عملة ذهبية 🪙 (موزعة على {activePacket.totalRecipients} أشخاص)
                  </p>
                </div>

                {/* Claim Button or Won Notice */}
                {claimedAmount ? (
                  <div className="bg-emerald-950/90 border border-emerald-400 rounded-2xl p-3 text-emerald-200 animate-in zoom-in font-bold text-sm">
                    🎉 مبروك! فزت بـ <span className="font-mono text-amber-300 font-black text-base">+{claimedAmount}</span> عملة ذهبية!
                  </div>
                ) : (
                  <button
                    onClick={handleClaim}
                    disabled={hasClaimed}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer border border-white/50 animate-pulse"
                  >
                    افتح الظرف والتقط حصتك الآن! 🧧✨
                  </button>
                )}
              </div>
            ) : (
              <div className="py-8 space-y-2 text-slate-400 text-xs">
                <p className="text-3xl">📭</p>
                <p>لا يوجد ظرف أحمر نشط في الغرفة حالياً.</p>
                <button
                  onClick={() => setTab('create')}
                  className="px-4 py-1.5 bg-red-600 text-white font-bold rounded-xl mt-2 cursor-pointer"
                >
                  كن أول من يسقط ظرفاً أحمر للغرفة 🧧
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
