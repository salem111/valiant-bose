import React, { useState, useEffect } from 'react';
import {
  Video,
  Radio,
  Users,
  Plus,
  Crown,
  Sparkles,
  Swords,
  Coins,
  ShieldCheck,
  Flame,
  Play
} from 'lucide-react';
import { UserProfile } from '../types';
import { PkLiveBroadcastCard } from './PkLiveBroadcastCard';
import {
  LiveStreamData,
  listenToLiveStreamsFromFirebase,
  saveLiveStreamToFirebase
} from '../lib/firebase';
import { useI18n } from '../lib/i18n';

interface LiveStreamHubProps {
  user: UserProfile;
  onOpenLiveStream: (selectedStream?: LiveStreamData) => void;
  onOpenGames?: () => void;
}

export const LiveStreamHub: React.FC<LiveStreamHubProps> = ({
  user,
  onOpenLiveStream,
  onOpenGames
}) => {
  const { t, dir } = useI18n();
  const [liveStreams, setLiveStreams] = useState<LiveStreamData[]>([]);

  useEffect(() => {
    // Listen strictly to REAL live streams created by active users in Firebase
    const unsubscribe = listenToLiveStreamsFromFirebase((fbStreams) => {
      if (fbStreams) {
        // Filter only active live broadcasts
        setLiveStreams(fbStreams.filter((s) => s.isLive));
      } else {
        setLiveStreams([]);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  return (
    <div dir={dir} className="space-y-3.5 animate-fadeIn text-start">
      {/* Top Banner Header for Live Hub */}
      <div className="bg-gradient-to-r from-rose-950/80 via-purple-950/80 to-slate-900 border border-rose-500/30 p-3.5 rounded-2xl flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-950/80 text-white animate-pulse">
              <Radio className="w-5 h-5" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-ping" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <span>غرف البث المباشر (LIVE)</span>
              <span className="text-[10px] bg-rose-500 text-white px-2 py-0.2 rounded-full font-bold">
                {liveStreams.length} نشطة
              </span>
            </h3>
            <p className="text-[11px] text-slate-300 font-medium mt-0.5">
              شاهد البثوث المباشرة الحقيقية وشارك في تحديات PK مع المذيعين
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onOpenGames && (
            <button
              type="button"
              onClick={onOpenGames}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <span>🎮 الألعاب</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenLiveStream()}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-black text-xs shadow-lg shadow-rose-950/60 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border border-rose-400/40"
          >
            <Plus className="w-4 h-4" />
            <span>ابدأ بثك المباشر 🎥</span>
          </button>
        </div>
      </div>

      {/* Real Live Streams Grid OR Zero-Fake Clean Empty State */}
      {liveStreams.length === 0 ? (
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto text-3xl shadow-lg animate-pulse">
            📡
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-white">لا توجد بثوث مباشرة نشطة حالياً</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              كن أول من يفتح بثاً مباشراً حقيقياً الآن، استقبل المشاهدين والهدايا، وتحدى أصدقاءك في جولات PK الحماسية! 🔥
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenLiveStream()}
            className="px-6 py-3 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs rounded-2xl shadow-xl shadow-rose-950/80 hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            <span>ابدأ أول بث مباشر الآن 🎥</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
          {liveStreams.map((stream) => (
            <div
              key={stream.streamId}
              onClick={() => onOpenLiveStream(stream)}
              className="group relative bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 hover:border-rose-500/60 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-rose-950/40 transition-all duration-300 active:scale-[0.98] flex flex-col justify-between"
            >
              {/* Background Thumbnail Image with Gradient Overlay */}
              <div className="relative aspect-square w-full overflow-hidden bg-slate-950">
                <img
                  src={stream.ownerPhoto}
                  alt={stream.ownerName}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/50" />

                {/* TOP BADGES: Live Indicator & Viewers */}
                <div className="absolute top-2 inset-x-2 flex items-center justify-between z-10 pointer-events-none">
                  {/* Glowing Red Live Indicator Badge */}
                  <div className="flex items-center gap-1 bg-gradient-to-r from-red-600 to-rose-600 px-2 py-0.5 rounded-full shadow-lg border border-red-300/40 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span className="text-[9px] font-black text-white">LIVE</span>
                  </div>

                  {/* Viewer Counter */}
                  <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md border border-rose-500/50 px-2 py-0.5 rounded-full text-[9px] font-black text-rose-200 shadow">
                    <Users className="w-2.5 h-2.5 text-rose-400" />
                    <span>{stream.viewers || 0}</span>
                  </div>
                </div>

                {/* Has Guest / PK Co-Host Badge */}
                {stream.hasGuest && (
                  <div className="absolute bottom-2 right-2 z-10 bg-gradient-to-r from-indigo-900/90 to-purple-900/90 backdrop-blur border border-cyan-400/60 px-2 py-0.5 rounded-full text-[8.5px] font-extrabold text-cyan-300 flex items-center gap-1 shadow">
                    <Swords className="w-2.5 h-2.5 text-cyan-400" />
                    <span>تحدي PK</span>
                  </div>
                )}
              </div>

              {/* CARD BOTTOM INFO */}
              <div className="p-2.5 space-y-1.5 text-right">
                <div className="flex items-center gap-2">
                  <div className="relative shrink-0">
                    <img
                      src={stream.ownerPhoto}
                      alt={stream.ownerName}
                      className="w-7 h-7 rounded-full border-2 border-rose-500 object-cover shadow"
                    />
                    <Crown className="absolute -top-1 -right-1 w-3.5 h-3.5 text-amber-400 fill-amber-400 drop-shadow" />
                  </div>

                  <div className="overflow-hidden flex-1">
                    <h4 className="text-xs font-black text-white truncate">
                      {stream.ownerName}
                    </h4>
                  </div>
                </div>

                {/* Stream Title */}
                <p className="text-[10px] font-medium text-slate-300 line-clamp-1 leading-snug">
                  {stream.title}
                </p>

                {/* Enter Button */}
                <button
                  type="button"
                  className="w-full py-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-[10px] rounded-lg shadow transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                >
                  <span>دخول البث المباشر</span>
                  <Play className="w-2.5 h-2.5 fill-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
