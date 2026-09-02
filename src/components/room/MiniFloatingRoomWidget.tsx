import React from 'react';
import { VoiceRoom, UserProfile } from '../../types';
import { AvatarWithFrame } from '../AvatarWithFrame';
import { X, Maximize2, Mic, Volume2, Sparkles, Radio } from 'lucide-react';

interface MiniFloatingRoomWidgetProps {
  room: VoiceRoom;
  user: UserProfile;
  isMuted?: boolean;
  onRestore: () => void;
  onClose: () => void;
  onToggleMute?: () => void;
}

export const MiniFloatingRoomWidget: React.FC<MiniFloatingRoomWidgetProps> = ({
  room,
  user,
  isMuted = false,
  onRestore,
  onClose,
  onToggleMute,
}) => {
  return (
    <div className="fixed bottom-20 right-3 sm:right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 select-none">
      {/* Floating Glowing Capsule */}
      <div
        onClick={onRestore}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#160c2b]/95 via-[#1a123a]/95 to-[#0e0a1f]/95 border-2 border-amber-400/80 hover:border-amber-300 rounded-2xl p-2 sm:p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.85)] backdrop-blur-xl cursor-pointer transform hover:scale-[1.03] active:scale-95 transition-all text-right max-w-xs"
      >
        {/* Animated Golden Glowing Pulse Aura */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/30 via-purple-500/20 to-cyan-500/30 blur-md animate-pulse pointer-events-none" />

        {/* 1. Host Avatar with Active Frame + Audio Equalizer */}
        <div className="relative shrink-0 flex items-center justify-center">
          <AvatarWithFrame
            src={room.hostAvatar || user.avatar}
            frameId={user.equippedFrame || room.hostAvatar ? 'frame_01' : undefined}
            size="sm"
            isSpeaking={true}
            className="w-11 h-11"
          />
          {/* Live Streaming Audio Dot */}
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-slate-950 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </span>
        </div>

        {/* 2. Room Info & Live Equalizer Waves */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-[11px] font-black text-white truncate max-w-[120px]">
              {room.title || 'الغرفة الصوتية'}
            </span>
            <Radio className="w-3 h-3 text-rose-400 animate-pulse shrink-0" />
          </div>

          <div className="flex items-center gap-2 justify-end text-[10px] text-amber-300 font-bold mt-0.5">
            {/* Animated mini equalizer bars */}
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_100ms]" />
              <span className="w-0.5 h-3 bg-amber-400 rounded-full animate-[bounce_1s_infinite_300ms]" />
              <span className="w-0.5 h-1.5 bg-cyan-400 rounded-full animate-[bounce_1s_infinite_200ms]" />
              <span className="w-0.5 h-2.5 bg-purple-400 rounded-full animate-[bounce_1s_infinite_400ms]" />
            </div>
            <span className="text-purple-200/90 text-[9.5px]">صوت نشط 🎙️</span>
          </div>
        </div>

        {/* 3. Action Buttons: Maximize & Close (X) */}
        <div className="flex items-center gap-1 shrink-0 mr-1">
          {/* Expand Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRestore();
            }}
            className="p-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-700 text-purple-200 hover:text-white border border-purple-500/40 transition-colors cursor-pointer"
            title="تكبير والعودة للغرفة"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Close (X) Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 transition-colors cursor-pointer shadow"
            title="مغادرة وإغلاق الغرفة"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
