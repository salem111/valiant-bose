import React from 'react';
import { VoiceRoom } from '../types';
import { Users, Mic, Lock, Volume2, Sparkles, Shield, Flame, Circle, Video, Radio, Swords } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface RoomCardProps {
  room: VoiceRoom;
  onOpenRoom: (room: VoiceRoom) => void;
}

export type UserConnectionStatus = 'online' | 'busy' | 'idle';

interface StatusIndicatorProps {
  status: UserConnectionStatus;
  showText?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, showText = true }) => {
  const statusConfig = {
    online: {
      dotBg: 'bg-emerald-500',
      pingColor: 'bg-emerald-400',
      label: 'Online',
      badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    },
    busy: {
      dotBg: 'bg-rose-500',
      pingColor: 'bg-rose-400',
      label: 'Busy',
      badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
    },
    idle: {
      dotBg: 'bg-amber-400',
      pingColor: 'bg-amber-300',
      label: 'Idle',
      badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border backdrop-blur-md ${statusConfig.badgeBg}`}
      title={`Status: ${statusConfig.label}`}
    >
      <span className="relative flex h-2 w-2">
        {status === 'online' && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusConfig.pingColor} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig.dotBg}`} />
      </span>
      {showText && <span>{statusConfig.label}</span>}
    </span>
  );
};

export const RoomCard: React.FC<RoomCardProps> = ({ room, onOpenRoom }) => {
  const { t } = useI18n();

  // Find active speakers in seats
  const activeSpeakers = room.seats.filter((s) => s.speakerUser);
  const speakingNow = activeSpeakers.some((s) => s.speakerUser?.isSpeaking);

  // Host status logic
  const hostStatus: UserConnectionStatus = speakingNow
    ? 'busy'
    : room.rank % 3 === 0
    ? 'idle'
    : 'online';

  // Support Score / Diamonds
  const supportDiamonds = (room as any).diamonds || ((room.rank <= 3 ? 150000 : 25000) * (room.level || 1));

  // Determine if PK or Party is active on this room
  const isPKLive = Boolean(room.pkState?.isActive || room.category === 'مواجهة' || room.rank === 1);
  const isPartyLive = Boolean(room.partyEvent?.status === 'live' || room.category === 'غرف الحفلات' || (room.tag && room.tag.includes('حفلة')));

  return (
    <div
      onClick={() => onOpenRoom(room)}
      className="group relative bg-[#130b2b]/85 hover:bg-[#1c113d] border border-purple-500/15 hover:border-amber-400/70 rounded-2xl overflow-hidden shadow-xl hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between select-none backdrop-blur-md"
    >
      {/* 1. TOP SQUARE COVER PHOTO */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
        <img
          src={room.coverImage || room.backgroundUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'}
          alt={room.title}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-black/40" />

        {/* Top Overlay Badges */}
        <div className="absolute top-1.5 right-1.5 left-1.5 flex items-center justify-between text-[10px] pointer-events-none">
          {/* Top Left: Rank / PK / Party / LIVE */}
          <div className="flex items-center gap-1">
            <span className={`font-black px-1.5 py-0.5 rounded-lg text-[9px] shadow-md flex items-center gap-0.5 ${
              room.rank === 1
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black'
                : room.rank === 2
                ? 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950'
                : room.rank === 3
                ? 'bg-gradient-to-r from-amber-700 to-amber-900 text-amber-200'
                : 'bg-slate-900/80 text-amber-300 border border-amber-500/30'
            }`}>
              #{room.rank || 1}
            </span>

            {/* PK Badge if Live */}
            {isPKLive && (
              <span className="bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 text-white font-black px-1.5 py-0.5 rounded-lg text-[8.5px] shadow-lg flex items-center gap-0.5 border border-purple-300/40 animate-pulse">
                <Swords className="w-2.5 h-2.5" />
                <span>PK</span>
              </span>
            )}

            {/* Party Badge if Live */}
            {isPartyLive && !isPKLive && (
              <span className="bg-gradient-to-r from-pink-600 to-amber-500 text-white font-black px-1.5 py-0.5 rounded-lg text-[8.5px] shadow-lg flex items-center gap-0.5 border border-pink-300/40 animate-pulse">
                <Sparkles className="w-2.5 h-2.5" />
                <span>PARTY</span>
              </span>
            )}

            {(room.hasLiveStream || room.rank <= 2) && !isPKLive && !isPartyLive && (
              <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-black px-1.5 py-0.5 rounded-lg text-[8.5px] shadow-lg flex items-center gap-0.5 animate-pulse border border-red-300/40">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>LIVE</span>
              </span>
            )}
          </div>

          {/* Top Right: Country Flag & Language & Lock Status */}
          <div className="flex items-center gap-1">
            {room.isLockedWithPin && (
              <span className="bg-amber-950/90 backdrop-blur-md text-amber-300 font-bold px-1.5 py-0.5 rounded-lg text-[8.5px] border border-amber-400/50 flex items-center gap-0.5 shadow">
                <Lock className="w-2.5 h-2.5 text-amber-400" />
                <span>خاصة</span>
              </span>
            )}
            {room.language && (
              <span className="bg-slate-950/80 backdrop-blur-md text-amber-200 font-bold px-1.5 py-0.5 rounded-lg text-[8.5px] border border-amber-500/30 flex items-center gap-0.5">
                {room.language === 'English' ? '🇬🇧' : room.language === 'التركية' ? '🇹🇷' : room.language === 'الفرنسية' ? '🇫🇷' : '🇸🇦'}
              </span>
            )}
            <span className="bg-slate-950/80 backdrop-blur-md text-cyan-300 font-bold px-1.5 py-0.5 rounded-lg text-[8.5px] border border-cyan-500/30 flex items-center gap-0.5">
              <Users className="w-2.5 h-2.5 text-cyan-400" />
              <span>{room.listenersCount}</span>
            </span>
          </div>
        </div>

        {/* Bottom Overlay: Host Avatar + Live Mic Pulse */}
        <div className="absolute bottom-1.5 right-1.5 left-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="relative shrink-0">
              <img
                src={room.hostAvatar}
                alt={room.hostName}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-amber-400 shadow-md bg-slate-950"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-950 ${
                  hostStatus === 'online'
                    ? 'bg-emerald-500'
                    : hostStatus === 'busy'
                    ? 'bg-rose-500'
                    : 'bg-amber-400'
                }`}
              />
              {speakingNow && (
                <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-200 truncate max-w-[80px] drop-shadow">
              {room.hostName}
            </span>
          </div>

          {/* Active Speaking Mics Tag */}
          <span className="bg-slate-950/80 backdrop-blur-md text-amber-300 text-[8.5px] font-bold px-1.5 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-0.5">
            <Mic className="w-2.5 h-2.5 text-amber-400" />
            <span>{activeSpeakers.length} MIC</span>
          </span>
        </div>
      </div>

      {/* 2. BOTTOM DETAILS */}
      <div className="p-2.5 space-y-1 text-start">
        {/* Room Title */}
        <h3 className="font-black text-xs text-white group-hover:text-amber-300 transition-colors truncate">
          {room.title}
        </h3>

        {/* Support Points / Diamonds Ranking Bar */}
        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-1 text-amber-300 font-bold">
            <Flame className="w-3 h-3 text-amber-400" />
            <span className="font-mono">{supportDiamonds.toLocaleString()} 💎</span>
          </div>
          <span className="text-[9px] text-slate-400 font-bold bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">
            Lvl {room.level || 1}
          </span>
        </div>
      </div>
    </div>
  );
};
