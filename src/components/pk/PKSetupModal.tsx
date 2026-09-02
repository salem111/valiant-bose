import React, { useState } from 'react';
import { Swords, Flame, Trophy, Clock, X, Users, Sparkles, Check, Globe, Key, Shuffle, Send, Radio } from 'lucide-react';
import { VoiceRoom, UserProfile, MicSeat, PKBattleState } from '../../types';

interface PKSetupModalProps {
  room: VoiceRoom;
  currentUser: UserProfile;
  onStartPK: (newPkState: PKBattleState) => void;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export type PKModeType = 'host_vs_host' | 'room_vs_room' | 'custom_room_id';

export const PKSetupModal: React.FC<PKSetupModalProps> = ({
  room,
  currentUser,
  onStartPK,
  onClose,
  showToast,
}) => {
  const [pkMode, setPkMode] = useState<PKModeType>('host_vs_host');
  const [duration, setDuration] = useState<number>(900); // 900s = 15m default
  const [targetRoomId, setTargetRoomId] = useState<string>('');
  const [isSearchingRandomRoom, setIsSearchingRandomRoom] = useState<boolean>(false);
  const [randomMatchedRoom, setRandomMatchedRoom] = useState<{
    id: string;
    title: string;
    hostName: string;
    hostAvatar: string;
  } | null>(null);

  // Selected Blue User for Host vs Host
  const [selectedBlueUser, setSelectedBlueUser] = useState<{
    id: string;
    name: string;
    avatar: string;
  } | null>(() => {
    const occupiedSeat = room.seats?.find(
      (s) => s.speakerUser && s.speakerUser.id !== room.hostId && s.speakerUser.id !== currentUser.id
    );
    if (occupiedSeat?.speakerUser) {
      return {
        id: occupiedSeat.speakerUser.id,
        name: occupiedSeat.speakerUser.name,
        avatar: occupiedSeat.speakerUser.avatar,
      };
    }
    return null;
  });

  const availableSpeakers = (room.seats || [])
    .filter((s) => s.speakerUser && s.speakerUser.id !== currentUser.id)
    .map((s) => s.speakerUser!);

  // Random Matchmaking Simulation
  const handleStartRandomMatchmaking = () => {
    setIsSearchingRandomRoom(true);
    setTimeout(() => {
      setIsSearchingRandomRoom(false);
      // Pick random room from existing active rooms if any
      const targetId = `room-${Math.floor(10000 + Math.random() * 90000)}`;
      setRandomMatchedRoom({
        id: targetId,
        title: `غرفة التحدي المباشر #${targetId.slice(-4)}`,
        hostName: 'المنافس المستضيف 🎙️',
        hostAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      });
      showToast(`🎯 تم العثور على غرفة منافسة نشطة!`);
    }, 1500);
  };

  const handleLaunchPK = () => {
    let blueTeamData: { id: string; name: string; avatar: string; score: number } | null = null;

    if (pkMode === 'host_vs_host') {
      if (!selectedBlueUser) {
        showToast('⚠️ يرجى اختيار متحدث منافس من مقاعد المايك أولاً، أو استخدام تحدي الغرف');
        return;
      }
      blueTeamData = {
        id: selectedBlueUser.id,
        name: selectedBlueUser.name,
        avatar: selectedBlueUser.avatar,
        score: 0,
      };
    } else if (pkMode === 'room_vs_room') {
      if (!randomMatchedRoom) {
        showToast('⚠️ يرجى النقر على (بحث عن غرفة منافسة) أولاً للمطابقة');
        return;
      }
      blueTeamData = {
        id: randomMatchedRoom.id,
        name: `${randomMatchedRoom.title} (${randomMatchedRoom.hostName})`,
        avatar: randomMatchedRoom.hostAvatar,
        score: 0,
      };
    } else if (pkMode === 'custom_room_id') {
      if (!targetRoomId.trim()) {
        showToast('⚠️ يرجى إدخال معرّف ID الغرفة المستهدفة');
        return;
      }
      blueTeamData = {
        id: targetRoomId.trim().startsWith('room-') ? targetRoomId.trim() : `room-${targetRoomId.trim()}`,
        name: `غرفة [ID: ${targetRoomId.trim()}]`,
        avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150',
        score: 0,
      };
    }

    if (!blueTeamData) return;

    const pkState: PKBattleState = {
      isActive: true,
      startTime: Date.now(),
      duration: duration,
      redTeam: {
        id: currentUser.id,
        name: room.title || currentUser.name,
        avatar: currentUser.avatar,
        score: 0,
        topDonors: [],
      },
      blueTeam: {
        ...blueTeamData,
        topDonors: [],
      },
    };

    onStartPK(pkState);
    if (pkMode === 'custom_room_id') {
      showToast(`📩 تم إرسال دعوة التحدي إلى الغرفة ID: ${targetRoomId} وبدء جولة الـ PK!`);
    } else if (pkMode === 'room_vs_room') {
      showToast(`⚔️ انطلقت جولة التحدي العشوائي بين الغرفتين! المدة: ${Math.round(duration / 60)} دقيقة.`);
    } else {
      showToast(`⚔️ انطلقت جولة الـ PK الحماسية بين المضيفين! المدة: ${Math.round(duration / 60)} دقيقة.`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-sans select-none dir-rtl animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="w-full max-w-md bg-[#140a26] border-2 border-purple-500/60 rounded-3xl p-4 sm:p-5 shadow-[0_0_50px_rgba(168,85,247,0.4)] text-white relative z-10 text-right space-y-3.5 max-h-[92vh] overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/50 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg border border-purple-300/40">
              <Swords className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-sm text-amber-300">نظام تحديات الـ PK المتقدم ⚔️</h3>
              <p className="text-[10px] text-slate-400">تحدي مضيفين، تحدي عشوائي بين الغرف، أو عبر معرّف ID</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 PK Modes Selector */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950/80 p-1 rounded-2xl border border-purple-900/50">
          {/* Mode 1: Host vs Host */}
          <button
            type="button"
            onClick={() => setPkMode('host_vs_host')}
            className={`py-2 px-1.5 rounded-xl font-black text-[11px] transition-all flex flex-col items-center gap-1 cursor-pointer ${
              pkMode === 'host_vs_host'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md scale-[1.02]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>تحدي مضيفين 🎙️</span>
          </button>

          {/* Mode 2: Random Room Match */}
          <button
            type="button"
            onClick={() => setPkMode('room_vs_room')}
            className={`py-2 px-1.5 rounded-xl font-black text-[11px] transition-all flex flex-col items-center gap-1 cursor-pointer ${
              pkMode === 'room_vs_room'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md scale-[1.02]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shuffle className="w-4 h-4" />
            <span>تحدي بين الغرف 🎲</span>
          </button>

          {/* Mode 3: Custom Room ID */}
          <button
            type="button"
            onClick={() => setPkMode('custom_room_id')}
            className={`py-2 px-1.5 rounded-xl font-black text-[11px] transition-all flex flex-col items-center gap-1 cursor-pointer ${
              pkMode === 'custom_room_id'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md scale-[1.02]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>غرفة خاصة (ID) 🔑</span>
          </button>
        </div>

        {/* MODE 1 BODY: HOST VS HOST */}
        {pkMode === 'host_vs_host' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* VS Matchup Showcase */}
            <div className="bg-slate-950/80 border border-purple-500/40 rounded-2xl p-3 flex items-center justify-between">
              {/* Red Side (Host) */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-13 h-13 rounded-2xl object-cover border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-rose-600 text-white font-black text-[8px] px-1.5 py-0.2 rounded-md">
                    🔴 RED
                  </span>
                </div>
                <span className="text-xs font-black text-white truncate max-w-[80px]">
                  {currentUser.name}
                </span>
              </div>

              {/* VS Flame */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-lg border border-amber-300 animate-pulse">
                  <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
                </div>
                <span className="text-[10px] font-black text-amber-300 tracking-widest mt-0.5">VS</span>
              </div>

              {/* Blue Side (Opponent Speaker) */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative">
                  {selectedBlueUser ? (
                    <img
                      src={selectedBlueUser.avatar}
                      alt={selectedBlueUser.name}
                      className="w-13 h-13 rounded-2xl object-cover border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]"
                    />
                  ) : (
                    <div className="w-13 h-13 rounded-2xl border-2 border-dashed border-cyan-500/60 bg-cyan-950/40 flex items-center justify-center text-cyan-400 text-xs font-black">
                      ؟
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 bg-cyan-600 text-white font-black text-[8px] px-1.5 py-0.2 rounded-md">
                    🔵 BLUE
                  </span>
                </div>
                <span className="text-xs font-black text-cyan-300 truncate max-w-[80px]">
                  {selectedBlueUser?.name || 'لم يُحدد'}
                </span>
              </div>
            </div>

            {/* Choose Opponent from Current Speakers */}
            {availableSpeakers.length > 0 ? (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-300">
                  👥 اختر المتحدث المنافس من المقاعد:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {availableSpeakers.map((speaker) => (
                    <button
                      key={speaker.id}
                      type="button"
                      onClick={() =>
                        setSelectedBlueUser({
                          id: speaker.id,
                          name: speaker.name,
                          avatar: speaker.avatar,
                        })
                      }
                      className={`p-1.5 rounded-xl border flex items-center gap-1.5 transition-all text-right cursor-pointer ${
                        selectedBlueUser?.id === speaker.id
                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-md'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <img
                        src={speaker.avatar}
                        alt={speaker.name}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                      <span className="text-[10px] font-bold truncate">{speaker.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 text-center text-[10px] text-slate-400">
                ⚠️ لا يوجد متحدثون آخرون جالسون على المقاعد حالياً في هذه الغرفة. اصعد بمتحدث على المايك أو اختر أحد أنماط التحدي الأخرى في الأعلى (تحدي بين الغرف 🎲 أو معرّف ID 🔑).
              </div>
            )}
          </div>
        )}

        {/* MODE 2 BODY: RANDOM ROOM MATCHMAKING */}
        {pkMode === 'room_vs_room' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-500/40 rounded-2xl p-3.5 text-center space-y-2.5">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center mx-auto text-purple-300">
                <Radio className={`w-6 h-6 ${isSearchingRandomRoom ? 'animate-spin text-amber-300' : ''}`} />
              </div>
              <div>
                <h4 className="font-black text-xs text-purple-200">مطابقة وتحدي عشوائي بين الغرف 🎲</h4>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  يقوم النظام بالبحث الفوري عن غرفة صوتية نشطة أخرى وبدء معركة نقاط الدعم بين الغرفتين!
                </p>
              </div>

              {randomMatchedRoom ? (
                <div className="bg-slate-900/90 border border-emerald-400/60 rounded-2xl p-2.5 flex items-center justify-between text-right animate-in zoom-in-95">
                  <div className="flex items-center gap-2">
                    <img
                      src={randomMatchedRoom.hostAvatar}
                      alt={randomMatchedRoom.hostName}
                      className="w-10 h-10 rounded-xl object-cover border border-emerald-400"
                    />
                    <div>
                      <p className="font-black text-xs text-white">{randomMatchedRoom.title}</p>
                      <p className="text-[10px] text-emerald-300">المضيف: {randomMatchedRoom.hostName}</p>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-400/40">
                    تمت المطابقة ✓
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleStartRandomMatchmaking}
                  disabled={isSearchingRandomRoom}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs rounded-xl shadow cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>{isSearchingRandomRoom ? 'جاري البحث عن غرفة منافسة...' : 'بحث عن غرفة منافسة عشوائية 🎲'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* MODE 3 BODY: CUSTOM ROOM ID INVITATION */}
        {pkMode === 'custom_room_id' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-3.5 space-y-2.5">
              <label className="block text-[11px] font-black text-amber-300">
                🔑 أدخل معرّف ID الغرفة المنافسة:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={targetRoomId}
                  onChange={(e) => setTargetRoomId(e.target.value)}
                  placeholder="مثال: 100523 أو room-884"
                  className="flex-1 bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-400 outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                سيتم إرسال دعوة تحدي فورية لمضيف الغرفة المحددة مع خيار القبول أو الرفض لبدء المعركة.
              </p>
            </div>
          </div>
        )}

        {/* DURATION SELECTION (15m, 30m, 60m + 3m, 5m) */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-slate-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>مدة التحدي والمواجهة:</span>
          </label>
          <div className="grid grid-cols-5 gap-1 text-center">
            {[
              { label: '3 د ⚡', secs: 180 },
              { label: '5 د 🔥', secs: 300 },
              { label: '15 دقيقة ⏱️', secs: 900 },
              { label: '30 دقيقة 🥊', secs: 1800 },
              { label: 'ساعة 👑', secs: 3600 },
            ].map((opt) => (
              <button
                key={opt.secs}
                type="button"
                onClick={() => setDuration(opt.secs)}
                className={`py-2 px-0.5 rounded-xl font-black text-[10px] border transition-all cursor-pointer ${
                  duration === opt.secs
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-300 shadow-md scale-[1.03]'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Launch Button */}
        <button
          type="button"
          onClick={handleLaunchPK}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer border border-purple-400/50"
        >
          <Swords className="w-4 h-4" />
          <span>إطلاق تحدي الـ PK الآن 🔥⚔️</span>
        </button>
      </div>
    </div>
  );
};
