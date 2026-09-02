import React, { useState } from 'react';
import { UserProfile, AvatarFrame, EntranceVehicle, ChatBubble } from '../../types';
import { X, Sparkles, Crown, Car, MessageSquare, Check, ShoppingBag, ShieldCheck, Flame, Eye } from 'lucide-react';
import { AvatarWithFrame } from '../AvatarWithFrame';
import { getStoreAvatarFrames } from '../../utils/framesRegistry';
import { LuxuryEntranceOverlay, EntranceData } from '../room/LuxuryEntranceOverlay';

interface CosmeticsStoreModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateCoins: (deltaCoins: number) => void;
  onEquipFrame?: (frameId: string) => void;
  onEquipVehicle?: (vehicleId: string) => void;
}

export const CosmeticsStoreModal: React.FC<CosmeticsStoreModalProps> = ({
  user,
  onClose,
  onUpdateCoins,
  onEquipFrame,
  onEquipVehicle,
}) => {
  const [activeTab, setActiveTab] = useState<'frames' | 'vehicles' | 'bubbles'>('frames');
  const [equippedFrameId, setEquippedFrameId] = useState<string>('frame_01');
  const [equippedVehicleId, setEquippedVehicleId] = useState<string>('ent_lambo');
  const [previewEntrance, setPreviewEntrance] = useState<EntranceData | null>(null);
  const [unlockedItems, setUnlockedItems] = useState<string[]>([
    'frame_01',
    'frame_gold_crown',
    'ent_lambo',
    'ent_royal_jet',
    'car_ferrari',
    'bubble_gold',
  ]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const dynamicStoreFrames = getStoreAvatarFrames();
  const staticFrames: AvatarFrame[] = [
    {
      id: 'frame_gold_crown',
      name: 'تاج الملوك الذهبي 👑',
      icon: '👑',
      priceCoins: 500,
      rarity: 'epic',
      frameClass: 'ring-4 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.8)]',
      glowColor: '#fbbf24',
    },
    {
      id: 'frame_neon_cyber',
      name: 'سايبر نيون المستقبل ⚡',
      icon: '⚡',
      priceCoins: 1200,
      rarity: 'legendary',
      frameClass: 'ring-4 ring-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.9)] animate-pulse',
      glowColor: '#22d3ee',
    },
    {
      id: 'frame_dragon_fire',
      name: 'تنين اللهب الحارق 🔥',
      icon: '🐉',
      priceCoins: 2500,
      rarity: 'mythic',
      frameClass: 'ring-4 ring-rose-500 shadow-[0_0_25px_rgba(244,63,94,1)]',
      glowColor: '#f43f5e',
    },
    {
      id: 'frame_frost_diamond',
      name: 'الجليد الألماسي 💎',
      icon: '💎',
      priceCoins: 1800,
      rarity: 'legendary',
      frameClass: 'ring-4 ring-blue-300 shadow-[0_0_20px_rgba(147,197,253,0.9)]',
      glowColor: '#93c5fd',
    },
  ];

  const frames: AvatarFrame[] = [...dynamicStoreFrames, ...staticFrames];

  const vehicles: EntranceVehicle[] = [
    {
      id: 'ent_royal_jet',
      name: 'طائرة VIP النفاثة الملكية ✈️',
      icon: '✈️',
      priceCoins: 4500,
      rarity: 'mythic',
      bannerGradient: 'from-cyan-400 via-blue-600 to-indigo-700',
    },
    {
      id: 'ent_lambo',
      name: 'لامبورغيني الملكية الذهبية 🏎️',
      icon: '🏎️',
      priceCoins: 4000,
      rarity: 'mythic',
      bannerGradient: 'from-amber-500 via-yellow-400 to-amber-600',
    },
    {
      id: 'car_ferrari',
      name: 'فيراري SF90 نيون 🏎️',
      icon: '🏎️',
      priceCoins: 1500,
      rarity: 'epic',
      bannerGradient: 'from-rose-600 to-amber-500',
    },
    {
      id: 'ent_dragon',
      name: 'التنين الذهبي الأسطوري 🐉',
      icon: '🐉',
      priceCoins: 6000,
      rarity: 'mythic',
      bannerGradient: 'from-amber-500 via-yellow-300 to-rose-600',
    },
    {
      id: 'ent_helicopter',
      name: 'طائرة الهليكوبتر الرئاسية 🚁',
      icon: '🚁',
      priceCoins: 3200,
      rarity: 'legendary',
      bannerGradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    },
    {
      id: 'ent_rolls_royce',
      name: 'رولز رويس فانتوم الملكية 🚗',
      icon: '🚗',
      priceCoins: 5000,
      rarity: 'mythic',
      bannerGradient: 'from-slate-200 via-amber-300 to-yellow-500',
    },
    {
      id: 'ent_space_ufo',
      name: 'مركبة الفضاء السايبر المستقبلية 🛸',
      icon: '🛸',
      priceCoins: 5500,
      rarity: 'mythic',
      bannerGradient: 'from-fuchsia-500 via-purple-600 to-cyan-400',
    },
    {
      id: 'ent_carpet',
      name: 'بساط الريح السحري الملكي 🧞',
      icon: '🧞',
      priceCoins: 2800,
      rarity: 'epic',
      bannerGradient: 'from-purple-600 to-pink-500',
    },
    {
      id: 'ent_phoenix',
      name: 'طائر الفينيق الذهبي المتوهج 🦅',
      icon: '🦅',
      priceCoins: 4800,
      rarity: 'legendary',
      bannerGradient: 'from-amber-400 via-rose-500 to-purple-600',
    },
  ];

  const bubbles: ChatBubble[] = [
    {
      id: 'bubble_gold',
      name: 'الذهب الإمبراطوري ✨',
      bgGradient: 'from-amber-950/90 to-yellow-900/80',
      borderColor: 'border-amber-400',
      textColor: 'text-amber-200',
      priceCoins: 400,
    },
    {
      id: 'bubble_cyber',
      name: 'نيون أرجواني 🌌',
      bgGradient: 'from-purple-950/90 to-indigo-950/80',
      borderColor: 'border-purple-400',
      textColor: 'text-purple-200',
      priceCoins: 800,
    },
  ];

  const handleBuyOrEquipItem = (itemId: string, price: number, type: 'frame' | 'vehicle' | 'bubble') => {
    const isOwned = unlockedItems.includes(itemId);

    if (isOwned) {
      if (type === 'frame') {
        setEquippedFrameId(itemId);
        onEquipFrame?.(itemId);
        showToast('✨ تم تفعيل الإطار بنجاح!');
      } else if (type === 'vehicle') {
        setEquippedVehicleId(itemId);
        onEquipVehicle?.(itemId);
        showToast('🚀 تم تفعيل مركبة الدخول بنجاح!');
      }
      return;
    }

    if (user.coins < price) {
      showToast('⚠️ رصيد الكوينز غير كافٍ للشراء!');
      return;
    }

    onUpdateCoins(-price);
    setUnlockedItems((prev) => [...prev, itemId]);
    
    if (type === 'frame') {
      setEquippedFrameId(itemId);
      onEquipFrame?.(itemId);
    } else if (type === 'vehicle') {
      setEquippedVehicleId(itemId);
      onEquipVehicle?.(itemId);
    }

    showToast('🎉 تم شراء وتفعيل المظهر بنجاح!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans text-white animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#19152b] via-[#0e0c1a] to-[#07060d] border-2 border-amber-400/70 rounded-3xl p-5 text-center shadow-[0_0_40px_rgba(245,158,11,0.3)] space-y-4 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-purple-900/50 pb-2.5">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h3 className="font-black text-sm text-amber-300">متجر المظاهر الفاخرة VIP 🏰</h3>
          </div>

          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-300">
            <span>🪙 {user.coins.toLocaleString()}</span>
          </div>
        </div>

        {toastMsg && (
          <div className="bg-amber-500/90 text-slate-950 font-black text-xs py-1.5 px-3 rounded-xl shadow-lg animate-bounce">
            {toastMsg}
          </div>
        )}

        {/* 🎭 LIVE AVATAR PREVIEW CARD */}
        <div className="p-3 bg-slate-900/90 rounded-2xl border border-purple-500/40 flex items-center justify-between px-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold block">معاينة المظهر المباشر:</span>
            <span className="text-xs font-black text-white">{user.name}</span>
            <span className="text-[10px] text-amber-400 font-bold block">⭐ ليفل {user.vipLevel || 5}</span>
          </div>

          {/* User Avatar with equipped Frame */}
          <div className="relative">
            <AvatarWithFrame
              avatarUrl={user.avatar}
              frameUrl={frames.find((f) => f.id === equippedFrameId)?.imageUrl || "/assets/frames/frame_01.png"}
              customSizeClass="w-16 h-16"
              avatarScalePercent={70}
            />
            <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow z-20">
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
            </span>
          </div>
        </div>

        {/* Category Tab Switcher */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs font-black">
          <button
            onClick={() => setActiveTab('frames')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${activeTab === 'frames' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'}`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>الإطارات</span>
          </button>

          <button
            onClick={() => setActiveTab('vehicles')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${activeTab === 'vehicles' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'}`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>سيارات الدخول</span>
          </button>

          <button
            onClick={() => setActiveTab('bubbles')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${activeTab === 'bubbles' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>الفقاعات</span>
          </button>
        </div>

        {/* 🛍️ PRODUCT LIST CONTAINER */}
        <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
          {/* FRAMES */}
          {activeTab === 'frames' &&
            frames.map((frame) => {
              const isOwned = unlockedItems.includes(frame.id);
              const isEquipped = equippedFrameId === frame.id;

              return (
                <div
                  key={frame.id}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-400/60 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                      <img src={user.avatar} alt="preview" className="w-9 h-9 rounded-full object-cover" />
                      {frame.imageUrl ? (
                        <img
                          src={frame.imageUrl}
                          alt={frame.name}
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"
                        />
                      ) : (
                        <div className={`absolute inset-0 rounded-full ${frame.frameClass}`} />
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-white block">{frame.name}</span>
                      <span className="text-[10px] text-amber-400 font-bold">
                        {isOwned ? 'مملوك لديك ✅' : `🪙 ${frame.priceCoins.toLocaleString()} كوينز`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBuyOrEquipItem(frame.id, frame.priceCoins, 'frame')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-black transition-all ${isEquipped ? 'bg-emerald-600 text-white' : isOwned ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black'}`}
                  >
                    {isEquipped ? 'مُفعّل ⭐' : isOwned ? 'تفعيل' : 'شراء'}
                  </button>
                </div>
              );
            })}

          {/* VEHICLES */}
          {activeTab === 'vehicles' &&
            vehicles.map((vh) => {
              const isOwned = unlockedItems.includes(vh.id);
              const isEquipped = equippedVehicleId === vh.id;

              return (
                <div
                  key={vh.id}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-400/60 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${vh.bannerGradient} flex items-center justify-center text-xl shadow-lg border border-white/20`}>
                      {vh.icon}
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-white block">{vh.name}</span>
                      <span className="text-[10px] text-amber-400 font-bold">
                        {isOwned ? 'مملوك لديك ✅' : `🪙 ${vh.priceCoins.toLocaleString()} كوينز`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setPreviewEntrance({
                          id: `prev_${Date.now()}`,
                          userId: user.id,
                          userName: user.name,
                          userAvatar: user.avatar,
                          userFrame: frames.find((f) => f.id === equippedFrameId)?.id || user.equippedFrame,
                          vipLevel: user.vipLevel || 5,
                          entranceId: vh.id,
                          entranceName: vh.name,
                          entranceIcon: vh.icon,
                        });
                      }}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 cursor-pointer"
                      title="معاينة حية للدخولية"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleBuyOrEquipItem(vh.id, vh.priceCoins, 'vehicle')}
                      className={`py-1.5 px-3 rounded-xl text-xs font-black transition-all ${isEquipped ? 'bg-emerald-600 text-white' : isOwned ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black'}`}
                    >
                      {isEquipped ? 'مُفعّل ⭐' : isOwned ? 'تفعيل' : 'شراء'}
                    </button>
                  </div>
                </div>
              );
            })}

          {/* BUBBLES */}
          {activeTab === 'bubbles' &&
            bubbles.map((b) => {
              const isOwned = unlockedItems.includes(b.id);
              return (
                <div
                  key={b.id}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-400/60 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-xl bg-gradient-to-r ${b.bgGradient} border ${b.borderColor} ${b.textColor} text-xs font-bold`}>
                      مرحباً بالجميع! ✨
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-white block">{b.name}</span>
                      <span className="text-[10px] text-amber-400 font-bold">
                        {isOwned ? 'مملوك لديك ✅' : `🪙 ${b.priceCoins.toLocaleString()} كوينز`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBuyOrEquipItem(b.id, b.priceCoins, 'bubble')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-black transition-all ${isOwned ? 'bg-emerald-600 text-white' : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black'}`}
                  >
                    {isOwned ? 'مُفعّل ⭐' : 'شراء'}
                  </button>
                </div>
              );
            })}
        </div>

        {/* 🚀 LIVE LUXURY ENTRANCE OVERLAY PREVIEW */}
        <LuxuryEntranceOverlay
          entrance={previewEntrance}
          onComplete={() => setPreviewEntrance(null)}
        />
      </div>
    </div>
  );
};
