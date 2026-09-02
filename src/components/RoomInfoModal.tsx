import React, { useState } from 'react';
import { VoiceRoom, UserProfile } from '../types';
import { RoomSettingsModal } from './RoomSettingsModal';
import { X, Edit3, ChevronDown, ChevronUp, Settings, ShieldCheck, Crown, Heart, Check } from 'lucide-react';


interface RoomInfoModalProps {
  room: VoiceRoom;
  user: UserProfile;
  onClose: () => void;
  onUpdateAnnouncement: (newAnnouncement: string) => void;
  onUpdateRoom?: (updatedRoom: Partial<VoiceRoom>) => void;
}

export const RoomInfoModal: React.FC<RoomInfoModalProps> = ({
  room,
  user,
  onClose,
  onUpdateAnnouncement,
  onUpdateRoom,
}) => {
  const isHost = Boolean(
    user.id === room.hostId ||
    (user.createdRoomId && room.id === user.createdRoomId) ||
    (room as any).ownerId === user.id ||
    (room as any).creatorId === user.id ||
    user.role === 'admin' ||
    user.role === 'owner'
  );

  const isMod = Boolean(
    isHost ||
    room.mods?.includes(user.id) ||
    (user.name && room.mods?.includes(user.name)) ||
    (room as any).moderators?.includes(user.id) ||
    (user.name && (room as any).moderators?.includes(user.name)) ||
    (room as any).admins?.includes(user.id) ||
    (user.name && (room as any).admins?.includes(user.name)) ||
    (room as any).managers?.includes(user.id)
  );

  const [showSettings, setShowSettings] = useState(false);
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [announcementText, setAnnouncementText] = useState(
    room.announcement ||
      '🖤 ٨ ٨ وكالة القلب الأسود ترحب بكم لتسجيل المضيفين ٨ ٨ 🖤\n✨ ٨ ٨ Black Heart Agency Welcomes You to Register Hosts ٨ ٨ ✨'
  );

  const handleSaveAnnouncement = () => {
    onUpdateAnnouncement(announcementText);
    setIsEditingAnnouncement(false);
  };

  // Calculate real dynamic staff list (Host + Real Room Moderators from room.mods)
  const realMods = room.mods || [];
  const staffList = [
    {
      id: room.hostId,
      name: room.hostName || 'صاحب الغرفة',
      avatar: room.coverImage || room.hostAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'صاحب الغرفة' as const,
      badgeColor: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black',
      frameClass: 'ring-2 ring-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
    },
    ...realMods.map((modId) => {
      const speakerOnSeat = (room.seats || []).find((s) => s.speakerUser?.id === modId)?.speakerUser;
      return {
        id: modId,
        name: speakerOnSeat?.name || (modId === user.id ? `${user.name} (أنت)` : `مشرف الغرفة #${modId.slice(-4)}`),
        avatar: speakerOnSeat?.avatar || (modId === user.id ? user.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'),
        role: 'مشرف' as const,
        badgeColor: 'bg-purple-600 text-white font-bold',
        frameClass: 'ring-1 ring-purple-400',
      };
    }),
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end justify-center font-sans dir-rtl animate-fadeIn">
      {/* Backdrop overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Bottom Sheet Dialog Container matching image reference */}
      <div className="relative z-10 w-full max-w-md bg-[#18181b] border-t border-slate-800 rounded-t-3xl p-4 shadow-2xl space-y-4 text-white max-h-[85vh] overflow-y-auto no-scrollbar">
        
        {/* Top Header: Close Button, Settings Gear & Room Title / Agency Info */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>

            {isMod && (
              <button
                onClick={() => setShowSettings(true)}
                className="p-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 transition-colors"
                title="إعدادات الغرفة المتقدمة"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Agency Name & ID Header with Photo */}
          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-amber-400 text-xs">🖤8️ 8️⃣e</span>
                <h3 className="font-black text-sm text-white tracking-wide">
                  {room.title || 'Black Heart'}
                </h3>
                <span className="text-amber-400 text-xs">🖤8️ 8️⃣e</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end text-[10px] text-slate-400 mt-0.5">
                <span className="font-mono">ID: {room.id.replace('room-', '') || '323003'}</span>
                <span className="bg-purple-900/80 text-purple-200 border border-purple-500/40 px-1.5 py-0.2 rounded-md font-bold">
                  Lv.{room.level || 5}
                </span>
              </div>
            </div>

            {/* Agency / Host Thumbnail & Cover */}
            <div
              onClick={() => {
                if (isMod) setShowSettings(true);
              }}
              className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-400/80 shadow-md shrink-0 bg-slate-900 cursor-pointer group"
              title={isMod ? 'انقر لتغيير غلاف الغرفة 🖼️' : 'غلاف الغرفة'}
            >
              <img
                src={room.coverImage || room.hostAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                alt={room.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              {isMod && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] text-amber-300 font-bold">تعديل 📸</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 1. Official Announcement Card (إعلان) */}
        <div className="bg-[#27272a] border border-slate-700/60 rounded-2xl p-3.5 space-y-2 text-right relative shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
              📢 إعلان
            </span>
            {isMod && (
              <button
                onClick={() => setIsEditingAnnouncement(!isEditingAnnouncement)}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditingAnnouncement ? 'إلغاء' : 'تعديل الإعلان'}</span>
              </button>
            )}
          </div>

          {isEditingAnnouncement ? (
            <div className="space-y-2 pt-1">
              <textarea
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                rows={3}
                className="w-full bg-[#18181b] border border-purple-500/50 rounded-xl p-2.5 text-xs text-amber-200 focus:outline-none focus:border-amber-400"
                placeholder="اكتب الإعلان الرسمي هنا..."
              />
              <button
                onClick={handleSaveAnnouncement}
                className="w-full py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" />
                <span>حفظ الإعلان جديد</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-300 font-medium leading-relaxed whitespace-pre-line text-center py-1">
              {announcementText}
            </div>
          )}
        </div>



        {/* 2. Room Level Bar (مستوى الغرفة) */}
        <div className="bg-[#27272a] border border-slate-700/60 rounded-2xl p-3 flex items-center justify-between text-xs shadow">
          <ChevronDown className="w-4 h-4 text-slate-400" />
          <div className="flex items-center gap-2">
            <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
              <div className="bg-gradient-to-r from-purple-500 to-amber-400 h-full w-[70%]" />
            </div>
            <span className="font-bold text-slate-200">
              مستوى الغرفة: {room.level || 5}
            </span>
          </div>
        </div>

        {/* 3. Members & Staff List (الأعضاء والمديرين) */}
        <div className="bg-[#27272a] border border-slate-700/60 rounded-2xl p-3 space-y-2.5 shadow">
          <div className="flex items-center justify-between text-xs">
            <ChevronDown className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-200">
              الأعضاء والمالك ({staffList.length})
            </span>
          </div>

          {/* Member Avatars Horizontal Scroll Row */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            {staffList.map((member) => (
              <div key={member.id} className="relative flex flex-col items-center shrink-0 group cursor-pointer">
                <div className={`relative w-12 h-12 rounded-full p-0.5 bg-slate-900 ${member.frameClass}`}>
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>

                <span className={`mt-1 text-[9px] px-2 py-0.2 rounded-full shadow-sm text-center line-clamp-1 max-w-[64px] ${member.badgeColor}`}>
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button at bottom */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
        >
          إغلاق اللوحة
        </button>
      </div>

      {showSettings && (
        <RoomSettingsModal
          room={room}
          user={user}
          onClose={() => setShowSettings(false)}
          onUpdateRoom={(updatedRoom) => {
            if (onUpdateRoom) {
              onUpdateRoom(updatedRoom);
            }
          }}
        />
      )}
    </div>
  );
};
