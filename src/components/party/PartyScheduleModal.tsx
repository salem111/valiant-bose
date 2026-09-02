import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, Trophy, Gift, X, Check, Flame, Crown, Users } from 'lucide-react';
import { VoiceRoom, UserProfile } from '../../types';

export interface RoomPartyEvent {
  id: string;
  roomId: string;
  roomTitle: string;
  hostName: string;
  hostAvatar: string;
  title: string;
  description: string;
  date: string;
  time: string;
  targetCoins: number;
  currentCoins: number;
  status: 'upcoming' | 'live' | 'finished';
  bannerImage: string;
  topContributors: {
    userId: string;
    name: string;
    avatar: string;
    amount: number;
    rank: number;
  }[];
}

interface PartyScheduleModalProps {
  room: VoiceRoom;
  currentUser: UserProfile;
  isHost: boolean;
  activeParty?: RoomPartyEvent | null;
  onSaveParty: (party: RoomPartyEvent) => void;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const PARTY_PRESET_BANNERS = [
  {
    id: 'birthday',
    title: '🎂 حفلة عيد ميلاد',
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&q=80',
    icon: '🎂',
  },
  {
    id: 'million_support',
    title: '👑 حفلة دعم المليون',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
    icon: '👑',
  },
  {
    id: 'royal_stars',
    title: '⭐ ليلة نجوم SALEEM',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80',
    icon: '⭐',
  },
  {
    id: 'carnival',
    title: '🎪 كرنفال التحديات والجوائز',
    url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80',
    icon: '🎪',
  },
];

export const PartyScheduleModal: React.FC<PartyScheduleModalProps> = ({
  room,
  currentUser,
  isHost,
  activeParty,
  onSaveParty,
  onClose,
  showToast,
}) => {
  const [tab, setTab] = useState<'create' | 'live_progress'>(activeParty?.status === 'live' ? 'live_progress' : 'create');
  const [title, setTitle] = useState<string>(activeParty?.title || '🎉 حفلة نجوم SALEEM الكبرى');
  const [description, setDescription] = useState<string>(
    activeParty?.description || 'أهلاً بالجميع في سهرة التحدي وتوزيع جوائز التوب 3 والكوينز! ✨'
  );
  const [partyDate, setPartyDate] = useState<string>(
    activeParty?.date || new Date().toISOString().split('T')[0]
  );
  const [partyTime, setPartyTime] = useState<string>(
    activeParty?.time || '21:00'
  );
  const [targetCoins, setTargetCoins] = useState<number>(activeParty?.targetCoins || 50000);
  const [selectedBanner, setSelectedBanner] = useState<string>(
    activeParty?.bannerImage || PARTY_PRESET_BANNERS[0].url
  );

  const handleCreateOrStartParty = () => {
    if (!title.trim()) {
      showToast('⚠️ يرجى كتابة عنوان للحفلة');
      return;
    }

    const newParty: RoomPartyEvent = {
      id: activeParty?.id || `party-${Date.now()}`,
      roomId: room.id,
      roomTitle: room.title,
      hostName: room.hostName || currentUser.name,
      hostAvatar: room.hostAvatar || currentUser.avatar,
      title: title.trim(),
      description: description.trim(),
      date: partyDate,
      time: partyTime,
      targetCoins,
      currentCoins: activeParty?.currentCoins || 0,
      status: 'live',
      bannerImage: selectedBanner,
      topContributors: activeParty?.topContributors || [
        {
          userId: 'user-top-1',
          name: 'الملك سلمان 👑',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          amount: 15400,
          rank: 1,
        },
        {
          userId: 'user-top-2',
          name: 'الزعيم فهد ⚡',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
          amount: 8200,
          rank: 2,
        },
        {
          userId: 'user-top-3',
          name: 'البرنسيسة لورا 🌸',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          amount: 5100,
          rank: 3,
        },
      ],
    };

    onSaveParty(newParty);
    showToast(`🎉 تم إطلاق الحفلة بنجاح! المكافأة: المركز الأول 3,000 كوينز والمركز الثاني والثالث 2,000 كوينز.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-sans select-none dir-rtl animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="w-full max-w-md bg-[#130b24] border-2 border-pink-500/60 rounded-3xl p-4 sm:p-5 shadow-[0_0_50px_rgba(236,72,153,0.4)] text-white relative z-10 text-right max-h-[92vh] overflow-y-auto no-scrollbar flex flex-col space-y-4">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-pink-900/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-400 flex items-center justify-center text-white shadow-lg border border-pink-300/40">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-sm text-pink-200">نظام فعاليات وحفلات الغرفة 🎉</h3>
              <p className="text-[10px] text-slate-400">تحديد موعد الحفلة وتحديات التوب 3 ومكافآت الكوينز</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1 rounded-2xl border border-purple-900/50">
          <button
            type="button"
            onClick={() => setTab('create')}
            className={`py-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'create'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>جدولة وإطلاق حفلة</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('live_progress')}
            className={`py-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'live_progress'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>تحدي التوب 3 المباشر 🏆</span>
          </button>
        </div>

        {/* TAB 1: CREATE / SCHEDULE PARTY */}
        {tab === 'create' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {/* Party Title */}
            <div>
              <label className="block text-[11px] font-black text-pink-300 mb-1">
                🏷️ عنوان أو اسم الحفلة:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: حفلة عيد ميلاد، سهرة المليون..."
                className="w-full bg-slate-950/90 border border-pink-500/40 rounded-2xl px-3.5 py-2.5 text-xs text-white font-bold focus:border-amber-400 outline-none"
              />
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-black text-pink-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>تاريخ الحفلة:</span>
                </label>
                <input
                  type="date"
                  value={partyDate}
                  onChange={(e) => setPartyDate(e.target.value)}
                  className="w-full bg-slate-950/90 border border-pink-500/40 rounded-2xl px-3 py-2 text-xs text-white font-mono focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-pink-300 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>ساعة وتوقيت الحفلة:</span>
                </label>
                <input
                  type="time"
                  value={partyTime}
                  onChange={(e) => setPartyTime(e.target.value)}
                  className="w-full bg-slate-950/90 border border-pink-500/40 rounded-2xl px-3 py-2 text-xs text-white font-mono focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            {/* Description / Announcement */}
            <div>
              <label className="block text-[11px] font-black text-pink-300 mb-1">
                📜 وصف وإعلان الحفلة:
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="اكتب تفاصيل الفعالية للجمهور والداعمين..."
                className="w-full bg-slate-950/90 border border-pink-500/40 rounded-2xl px-3.5 py-2 text-xs text-white focus:border-amber-400 outline-none leading-relaxed"
              />
            </div>

            {/* Banner Theme Selection */}
            <div>
              <label className="block text-[11px] font-black text-pink-300 mb-1.5">
                🖼️ اختر بوستر وشعار الحفلة:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PARTY_PRESET_BANNERS.map((banner) => (
                  <div
                    key={banner.id}
                    onClick={() => setSelectedBanner(banner.url)}
                    className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all aspect-video group ${
                      selectedBanner === banner.url
                        ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-[1.02]'
                        : 'border-slate-800 hover:border-pink-500/60 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={banner.url}
                      alt={banner.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex items-end p-2">
                      <span className="text-[10px] font-black text-white truncate drop-shadow">
                        {banner.title}
                      </span>
                    </div>
                    {selectedBanner === banner.url && (
                      <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[10px] shadow">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Target Goal & Rewards Card */}
            <div className="bg-gradient-to-r from-amber-950/60 via-purple-950/60 to-pink-950/60 border border-amber-500/40 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-amber-300 flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>تارجت الحفلة ومكافآت التوب 3:</span>
                </span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full text-[10px] font-black font-mono">
                  {targetCoins.toLocaleString()} كوينز
                </span>
              </div>
              
              <p className="text-[10px] text-slate-300 leading-relaxed">
                عند وصول مجموع هدايا الغرفة إلى {targetCoins.toLocaleString()} كوينز، يتم منح مكافآت فورية:
              </p>

              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] pt-1">
                <div className="bg-slate-900/90 border border-amber-400/50 rounded-xl p-1.5">
                  <span className="text-sm block">🥇</span>
                  <span className="font-bold text-amber-300 block">المركز الأول</span>
                  <span className="font-black text-xs text-white font-mono">3,000 🪙</span>
                </div>
                <div className="bg-slate-900/90 border border-slate-600 rounded-xl p-1.5">
                  <span className="text-sm block">🥈</span>
                  <span className="font-bold text-slate-300 block">المركز الثاني</span>
                  <span className="font-black text-xs text-white font-mono">2,000 🪙</span>
                </div>
                <div className="bg-slate-900/90 border border-amber-700/50 rounded-xl p-1.5">
                  <span className="text-sm block">🥉</span>
                  <span className="font-bold text-amber-500 block">المركز الثالث</span>
                  <span className="font-black text-xs text-white font-mono">1,000 🪙</span>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <button
              type="button"
              onClick={handleCreateOrStartParty}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:brightness-110 text-white font-black text-xs shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer border border-pink-400/50"
            >
              <Sparkles className="w-4 h-4" />
              <span>إطلاق وتفعيل الحفلة الآن 🎉</span>
            </button>
          </div>
        )}

        {/* TAB 2: LIVE PARTY PROGRESS & TOP 3 LEADERBOARD */}
        {tab === 'live_progress' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Live Goal Progress Bar */}
            <div className="bg-slate-950/90 border border-pink-500/40 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-pink-300">مجموع هدايا الحفلة الحالية:</span>
                <span className="font-mono font-black text-amber-300">
                  {(activeParty?.currentCoins || 28700).toLocaleString()} / {targetCoins.toLocaleString()} 🪙
                </span>
              </div>

              <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden border border-pink-900/60 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 rounded-full transition-all duration-500 animate-pulse"
                  style={{
                    width: `${Math.min(100, Math.round(((activeParty?.currentCoins || 28700) / targetCoins) * 100))}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>المتبقي للهدف: {Math.max(0, targetCoins - (activeParty?.currentCoins || 28700)).toLocaleString()} 🪙</span>
                <span className="text-amber-400 font-bold">
                  {Math.round(((activeParty?.currentCoins || 28700) / targetCoins) * 100)}% مكتمل
                </span>
              </div>
            </div>

            {/* Top 3 Live Leaderboard */}
            <div className="space-y-2">
              <h4 className="font-black text-xs text-amber-300 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>ترتيب كبار الداعمين في الحفلة (Top 3):</span>
              </h4>

              <div className="space-y-1.5">
                {(activeParty?.topContributors || [
                  {
                    userId: '1',
                    name: 'الملك سلمان 👑',
                    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                    amount: 15400,
                    rank: 1,
                  },
                  {
                    userId: '2',
                    name: 'الزعيم فهد ⚡',
                    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
                    amount: 8200,
                    rank: 2,
                  },
                  {
                    userId: '3',
                    name: 'البرنسيسة لورا 🌸',
                    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                    amount: 5100,
                    rank: 3,
                  },
                ]).map((contributor, idx) => (
                  <div
                    key={contributor.userId}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                      idx === 0
                        ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-slate-900/80 border-amber-400/80 shadow-md'
                        : idx === 1
                        ? 'bg-slate-900/80 border-slate-700'
                        : 'bg-slate-900/60 border-amber-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-black w-6 text-center">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                      </span>
                      <img
                        src={contributor.avatar}
                        alt={contributor.name}
                        className="w-9 h-9 rounded-full object-cover border border-amber-300/40 shadow"
                      />
                      <div className="text-right">
                        <p className="font-black text-xs text-white">{contributor.name}</p>
                        <p className="text-[9px] text-amber-300 font-bold">
                          المكافأة التقديرية: {idx === 0 ? '3,000 🪙' : idx === 1 ? '2,000 🪙' : '1,000 🪙'}
                        </p>
                      </div>
                    </div>

                    <div className="text-left">
                      <span className="font-mono font-black text-xs text-amber-400 block">
                        {contributor.amount.toLocaleString()} 💎
                      </span>
                      <span className="text-[9px] text-slate-400">نقاط دعم</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-800 transition-colors cursor-pointer"
            >
              إغلاق ومتابعة الحفلة
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
