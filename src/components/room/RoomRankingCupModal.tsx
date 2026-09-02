import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Flame, Users, X, Sparkles, Star, ChevronLeft } from 'lucide-react';
import { VoiceRoom, UserProfile } from '../../types';
import { listenToRoomsFromRealtimeDb } from '../../lib/firebase';

interface RankedRoomItem {
  id: string;
  title: string;
  coverUrl: string;
  hostName: string;
  hostAvatar: string;
  charmPoints: number;
  listenersCount: number;
  rank: number;
  countryFlag?: string;
}

interface RoomRankingCupModalProps {
  currentRoom: VoiceRoom;
  onClose: () => void;
  onSwitchRoom?: (room: any) => void;
  showToast: (msg: string) => void;
}

export const RoomRankingCupModal: React.FC<RoomRankingCupModalProps> = ({
  currentRoom,
  onClose,
  onSwitchRoom,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [rooms, setRooms] = useState<VoiceRoom[]>([]);

  useEffect(() => {
    // Listen to all rooms to rank them by diamonds
    const unsubscribe = listenToRoomsFromRealtimeDb((fetchedRooms) => {
      setRooms(fetchedRooms);
    });

    return () => {
      // In a real implementation we would unsubscribe here if supported
    };
  }, []);

  // Ranked rooms dataset (Ordered by Charm Points/Diamonds from highest to lowest)
  const rankedRooms: RankedRoomItem[] = rooms
    .sort((a, b) => (b.diamonds || 0) - (a.diamonds || 0))
    .map((room, idx) => ({
      id: room.id,
      title: room.title,
      coverUrl: room.hostAvatar,
      hostName: room.hostName,
      hostAvatar: room.hostAvatar,
      charmPoints: room.diamonds || 0,
      listenersCount: room.listenersCount || 0,
      rank: idx + 1
    }));

  const top1 = rankedRooms[0];
  const top2 = rankedRooms[1];
  const top3 = rankedRooms[2];
  const otherRooms = rankedRooms.slice(3);

  return (
    <div className="fixed inset-0 z-[60] bg-[#030108] flex flex-col font-sans overflow-hidden animate-scaleUp dir-rtl">
      {/* Background with God Rays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030108]/60 to-[#030108]" />

      {/* Header */}
      <div className="relative z-10 px-4 pt-safe pb-4 flex justify-between items-center text-white mt-4">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full backdrop-blur-md border border-white/20">
          <ChevronLeft className="w-5 h-5 rotate-180" />
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span>كأس وترتيب الغرف 🏆</span>
        </h1>
        <div className="w-9 h-9" /> {/* Spacer */}
      </div>

      {/* Primary Tabs */}
      <div className="relative z-10 px-4 flex justify-around items-center mb-4 gap-4">
        {['daily', 'weekly'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`relative flex flex-col items-center justify-center transition-all duration-300 w-[130px] ${
              activeTab === tab ? 'scale-105 opacity-100 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'scale-95 opacity-60 grayscale-[40%]'
            }`}
          >
            <img src="/tab_banner.png" className="w-full h-auto z-0 pointer-events-none drop-shadow-md" />
            <span className={`absolute inset-0 flex items-center justify-center pb-1 z-10 font-extrabold text-[14px] ${
              activeTab === tab ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-white/70'
            }`}>
              {tab === 'daily' ? 'يومي 🔥' : 'أسبوعي ⭐'}
            </span>
          </button>
        ))}
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar pb-6 pt-12">
        {/* Top 3 Podium */}
        <div className="flex justify-center items-end gap-4 px-2 mb-8 mt-4">
          
          {/* Rank 2 (Silver) */}
          <div className="flex flex-col items-center relative w-[28%] z-10">
            {top2 ? (
              <>
                <div onClick={() => onSwitchRoom && onSwitchRoom(top2)} className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-2 cursor-pointer group">
                   <div className="absolute inset-[-28px] sm:inset-[-34px] z-0 pointer-events-none flex items-center justify-center ">
                     <img src="/luxury_frame.png" className="w-full h-full object-contain transition-transform group-hover:scale-105 opacity-80" alt="frame" />
                   </div>
                   <div className="w-full h-full rounded-full overflow-hidden bg-black/40 border-2 border-slate-300 relative z-10 transition-transform group-hover:scale-105 shadow-[0_0_15px_rgba(203,213,225,0.4)]">
                     <img src={top2.coverUrl} className="w-full h-full object-cover p-1" />
                   </div>
                </div>
                <div className="relative w-full flex flex-col justify-center items-center z-10">
                  <img src="/luxury_banner_11.png" className="w-full h-auto drop-shadow-lg z-0" />
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center w-full px-2 pt-1">
                    <span className="block text-[11px] sm:text-[13px] font-black text-white/90 mb-0.5 leading-none">TOP 2</span>
                    <div className="text-[14px] sm:text-[16px] font-extrabold text-white truncate w-full text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight mb-0.5">{top2.title}</div>
                    <span className="text-[12px] sm:text-[14px] font-extrabold text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none flex items-center justify-center gap-0.5"><Flame className="w-3 h-3 text-amber-400 fill-amber-400"/> {(top2.charmPoints / 1000).toFixed(1)}k</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-full border-2 border-dashed border-slate-500 shadow-lg mb-2 opacity-50">
                   <span className="text-xl">🥈</span>
                </div>
                <div className="relative w-full flex flex-col justify-center items-center z-10 opacity-50 grayscale">
                  <img src="/luxury_banner_11.png" className="w-full h-auto drop-shadow-lg z-0" />
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center w-full px-2 pt-1">
                    <span className="block text-[11px] sm:text-[13px] font-black text-white/90 mb-0.5 leading-none">TOP 2</span>
                    <div className="text-[14px] sm:text-[16px] font-extrabold text-white truncate w-full text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight mb-0.5">ــــ</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Rank 1 (Gold) */}
          <div className="flex flex-col items-center relative w-[36%] z-20 -mb-4">
            {top1 ? (
              <>
                <div onClick={() => onSwitchRoom && onSwitchRoom(top1)} className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 mb-2 cursor-pointer group">
                   <div className="absolute inset-[-44px] sm:inset-[-50px] z-0 pointer-events-none flex items-center justify-center ">
                     <img src="/luxury_frame.png" className="w-full h-full object-contain transition-transform group-hover:scale-105" alt="frame" />
                   </div>
                   <div className="w-full h-full rounded-full overflow-hidden bg-black/40 border-2 border-amber-400 relative z-10 transition-transform group-hover:scale-105 shadow-[0_0_25px_rgba(251,191,36,0.6)]">
                     <img src={top1.coverUrl} className="w-full h-full object-cover p-1" />
                   </div>
                </div>
                <div className="relative w-full flex flex-col justify-center items-center z-10">
                  <img src="/luxury_banner_11.png" className="w-full h-auto drop-shadow-lg z-0" />
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center w-full px-2 pt-1">
                    <span className="block text-[12px] sm:text-[14px] font-black text-white/90 mb-0.5 leading-none">TOP 1</span>
                    <div className="text-[16px] sm:text-[18px] font-extrabold text-white truncate w-full text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight mb-0.5">{top1.title}</div>
                    <span className="text-[14px] sm:text-[16px] font-extrabold text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none flex items-center justify-center gap-0.5"><Flame className="w-3 h-3 text-amber-400 fill-amber-400"/> {(top1.charmPoints / 1000).toFixed(1)}k</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 bg-white/5 rounded-full border-2 border-dashed border-amber-500 shadow-lg mb-2 opacity-50">
                   <Crown className="w-6 h-6 text-amber-400 opacity-50" />
                </div>
                <div className="relative w-full flex flex-col justify-center items-center z-10 opacity-50 grayscale">
                  <img src="/luxury_banner_11.png" className="w-full h-auto drop-shadow-lg z-0" />
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center w-full px-2 pt-1">
                    <span className="block text-[12px] sm:text-[14px] font-black text-white/90 mb-0.5 leading-none">TOP 1</span>
                    <div className="text-[16px] sm:text-[18px] font-extrabold text-white truncate w-full text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight mb-0.5">ــــ</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="flex flex-col items-center relative w-[28%] z-10">
            {top3 ? (
              <>
                <div onClick={() => onSwitchRoom && onSwitchRoom(top3)} className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-2 cursor-pointer group">
                   <div className="absolute inset-[-28px] sm:inset-[-34px] z-0 pointer-events-none flex items-center justify-center ">
                     <img src="/luxury_frame.png" className="w-full h-full object-contain transition-transform group-hover:scale-105 opacity-80" alt="frame" />
                   </div>
                   <div className="w-full h-full rounded-full overflow-hidden bg-black/40 border-2 border-orange-600 relative z-10 transition-transform group-hover:scale-105 shadow-[0_0_15px_rgba(234,88,12,0.4)]">
                     <img src={top3.coverUrl} className="w-full h-full object-cover p-1" />
                   </div>
                </div>
                <div className="relative w-full flex flex-col justify-center items-center z-10">
                  <img src="/luxury_banner_11.png" className="w-full h-auto drop-shadow-lg z-0" />
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center w-full px-2 pt-1">
                    <span className="block text-[11px] sm:text-[13px] font-black text-white/90 mb-0.5 leading-none">TOP 3</span>
                    <div className="text-[14px] sm:text-[16px] font-extrabold text-white truncate w-full text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight mb-0.5">{top3.title}</div>
                    <span className="text-[12px] sm:text-[14px] font-extrabold text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none flex items-center justify-center gap-0.5"><Flame className="w-3 h-3 text-amber-400 fill-amber-400"/> {(top3.charmPoints / 1000).toFixed(1)}k</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-full border-2 border-dashed border-orange-600/50 shadow-lg mb-2 opacity-50">
                   <span className="text-xl">🥉</span>
                </div>
                <div className="relative w-full flex flex-col justify-center items-center z-10 opacity-50 grayscale">
                  <img src="/luxury_banner_11.png" className="w-full h-auto drop-shadow-lg z-0" />
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center w-full px-2 pt-1">
                    <span className="block text-[11px] sm:text-[13px] font-black text-white/90 mb-0.5 leading-none">TOP 3</span>
                    <div className="text-[14px] sm:text-[16px] font-extrabold text-white truncate w-full text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight mb-0.5">ــــ</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* List Ranks 4+ */}
        <div className="px-4 space-y-3 relative z-10">
          {rankedRooms.length === 0 && !top1 && !top2 && !top3 ? (
             <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                <Trophy className="w-12 h-12 text-amber-500 mb-2" />
                <h4 className="text-sm text-amber-200 font-bold">لا يوجد ترتيب غرف بعد</h4>
             </div>
          ) : (
            otherRooms.map((r) => (
              <div key={r.id} className="card-luxury-glass p-3 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-bold text-sm w-4 text-white/60">{r.rank}</span>
                  <img src={r.coverUrl} className="w-10 h-10 rounded-full border border-white/20 shrink-0" />
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{r.title}</div>
                    <div className="text-[10px] text-white/60 flex items-center gap-1">المضيف: {r.hostName} <Users className="w-3 h-3 ml-1"/>{r.listenersCount}</div>
                  </div>
                </div>
                <span className="text-amber-300 font-bold text-xs flex items-center gap-1 shrink-0"><Flame className="w-3 h-3 text-amber-400 fill-amber-400"/> {(r.charmPoints / 1000).toFixed(1)}k</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
