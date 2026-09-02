import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  Play,
  Pause,
  Plus,
  Radio,
  Sparkles,
  Send,
  MoreHorizontal,
  X,
  Flame,
  Crown,
  Tag,
  CheckCircle2,
  Music,
} from 'lucide-react';
import { UserProfile, VoiceRoom } from '../../types';
import { useI18n } from '../../lib/i18n';
import { CreateMomentModal, MomentItem } from './CreateMomentModal';

interface MomentsFeedViewProps {
  user: UserProfile;
  activeRoom?: VoiceRoom | null;
  onOpenRoom?: (room: VoiceRoom) => void;
}

export const MomentsFeedView: React.FC<MomentsFeedViewProps> = ({
  user,
  activeRoom,
  onOpenRoom,
}) => {
  const { t, dir } = useI18n();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeAudioPlaying, setActiveAudioPlaying] = useState<string | null>(null);
  const [selectedMomentForComments, setSelectedMomentForComments] = useState<MomentItem | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [commentsMap, setCommentsMap] = useState<Record<string, { id: string; user: string; avatar: string; text: string; time: string }[]>>({
    'm1': [
      { id: 'c1', user: 'أميرة الشوق 💎', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', text: 'صوتك وإبداعك دائماً مميز! استمر 👏❤️', time: 'منذ 10 دقائق' },
      { id: 'c2', user: 'الكابتن علي ⚡', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', text: 'منورين الروم يا غوالي 🔥', time: 'منذ 5 دقائق' },
    ],
  });

  const [moments, setMoments] = useState<MomentItem[]>([
    {
      id: 'm1',
      userId: 'user_khaled',
      userName: 'الشيخ خالد 👑',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      vipLevel: 10,
      userLevel: 65,
      timeAgo: 'منذ 15 دقيقة',
      text: 'مساء الخير على عائلة SALEEM الملكية! اليوم عندنا سهرة طرب وجوائز في الروم الصوتي، الكل معزوم وبانتظاركم 🎤✨',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
      audioUrl: 'clip1',
      audioDuration: '0:18',
      likesCount: 142,
      commentsCount: 28,
      isLiked: false,
      activeRoomId: 'room-1',
      activeRoomTitle: 'ملتقى كبار VIP 👑',
      tags: ['#طرب_وصوت', '#يوميات'],
    },
    {
      id: 'm2',
      userId: 'user_ameera',
      userName: 'أميرة الشوق 💎',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      vipLevel: 8,
      userLevel: 42,
      timeAgo: 'منذ 40 دقيقة',
      text: 'شكراً لكل الداعمين في جولة الـ PK الحماسية اليوم! فوز أسطوري بجدارة بفضلكم جميعاً 💖🔥',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
      likesCount: 89,
      commentsCount: 14,
      isLiked: true,
      activeRoomId: 'room-2',
      activeRoomTitle: 'أجواء رايقة وضحك 🌸',
      tags: ['#تحديات_PK'],
    },
    {
      id: 'm3',
      userId: 'user_sultan',
      userName: 'سلطان القوافي 🎙️',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      vipLevel: 5,
      userLevel: 30,
      timeAgo: 'منذ ساعتين',
      text: 'قصيدة جديدة أهديها لكم بصوتي.. اسمعوا المقطع وأعطوني رأيكم 🎵✨',
      audioUrl: 'clip2',
      audioDuration: '0:35',
      likesCount: 215,
      commentsCount: 45,
      isLiked: false,
      tags: ['#شعر_وقصيد', '#طرب_وصوت'],
    },
  ]);

  // Stories Carousel Data
  const STORIES = [
    { id: 's0', name: 'قصتي', avatar: user.avatar, isUser: true, hasStory: false },
    { id: 's1', name: 'الشيخ خالد', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', isLive: true, roomTitle: 'ملتقى كبار VIP' },
    { id: 's2', name: 'أميرة الشوق', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', isLive: true, roomTitle: 'أجواء رايقة' },
    { id: 's3', name: 'سلطان القوافي', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', isLive: false },
    { id: 's4', name: 'الكابتن علي', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', isLive: true, roomTitle: 'طاولة الرهان 🃏' },
  ];

  const handleToggleLike = (momentId: string) => {
    setMoments((prev) =>
      prev.map((m) => {
        if (m.id === momentId) {
          const nextLiked = !m.isLiked;
          return {
            ...m,
            isLiked: nextLiked,
            likesCount: nextLiked ? m.likesCount + 1 : m.likesCount - 1,
          };
        }
        return m;
      })
    );
  };

  const feedAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const handleToggleAudio = (momentId: string) => {
    const targetMoment = moments.find((m) => m.id === momentId);

    if (activeAudioPlaying === momentId) {
      if (feedAudioRef.current) {
        feedAudioRef.current.pause();
        feedAudioRef.current = null;
      }
      setActiveAudioPlaying(null);
      return;
    }

    if (feedAudioRef.current) {
      feedAudioRef.current.pause();
      feedAudioRef.current = null;
    }

    setActiveAudioPlaying(momentId);

    if (targetMoment?.audioUrl && (targetMoment.audioUrl.startsWith('data:audio') || targetMoment.audioUrl.startsWith('blob:') || targetMoment.audioUrl.startsWith('http'))) {
      try {
        const audio = new Audio(targetMoment.audioUrl);
        feedAudioRef.current = audio;
        audio.onended = () => {
          setActiveAudioPlaying(null);
          feedAudioRef.current = null;
        };
        audio.onerror = () => {
          setActiveAudioPlaying(null);
          feedAudioRef.current = null;
        };
        audio.play().catch(() => {
          setActiveAudioPlaying(null);
        });
      } catch (e) {
        setActiveAudioPlaying(null);
      }
    } else {
      // Play a short synth chime simulation for preview notes
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1);
      } catch (e) {}

      setTimeout(() => {
        setActiveAudioPlaying((curr) => (curr === momentId ? null : curr));
      }, 3000);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMomentForComments || !commentInput.trim()) return;

    const newComment = {
      id: `c-${Date.now()}`,
      user: user.name,
      avatar: user.avatar,
      text: commentInput.trim(),
      time: 'الآن',
    };

    setCommentsMap((prev) => ({
      ...prev,
      [selectedMomentForComments.id]: [
        ...(prev[selectedMomentForComments.id] || []),
        newComment,
      ],
    }));

    setMoments((prev) =>
      prev.map((m) =>
        m.id === selectedMomentForComments.id
          ? { ...m, commentsCount: m.commentsCount + 1 }
          : m
      )
    );

    setCommentInput('');
  };

  const handleShare = (moment: MomentItem) => {
    navigator.clipboard?.writeText?.(`لحظة من ${moment.userName} على تطبيق SALEEM: ${moment.text}`);
    alert('تم نسخ رابط اللحظة بنجاح! 📋');
  };

  const handlePublishNewMoment = (newMoment: MomentItem) => {
    setMoments((prev) => [newMoment, ...prev]);
  };

  return (
    <div dir={dir} className="space-y-4 text-start font-sans select-none pb-8 animate-in fade-in duration-200">
      
      {/* 1. TOP STORIES BAR */}
      <div className="bg-slate-900/90 border border-purple-500/30 rounded-3xl p-3.5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between pb-2 px-1 text-xs">
          <span className="font-black text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>قصص الأصدقاء والمذيعين</span>
          </span>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-[11px] text-purple-300 font-bold hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>نشر قصة</span>
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          {STORIES.map((s) => (
            <div
              key={s.id}
              onClick={() => {
                if (s.isUser) {
                  setShowCreateModal(true);
                } else if (s.isLive && onOpenRoom) {
                  onOpenRoom({
                    id: s.id,
                    title: s.roomTitle || `غرفة ${s.name}`,
                    hostName: s.name,
                    hostAvatar: s.avatar,
                    listenersCount: 45,
                    category: 'شائع 🔥',
                    diamonds: 1200,
                    seats: [],
                  } as any);
                }
              }}
              className="flex flex-col items-center gap-1 cursor-pointer shrink-0 group"
            >
              <div className="relative">
                <div
                  className={`w-14 h-14 rounded-full p-0.5 transition-transform group-hover:scale-105 ${
                    s.isLive
                      ? 'bg-gradient-to-tr from-rose-500 via-amber-400 to-purple-600 shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse'
                      : s.isUser
                      ? 'border-2 border-dashed border-purple-400/80 bg-slate-950 p-1'
                      : 'bg-gradient-to-tr from-purple-500 to-indigo-600'
                  }`}
                >
                  <img
                    src={s.avatar}
                    alt={s.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>

                {s.isUser && (
                  <div className="absolute bottom-0 right-0 w-4.5 h-4.5 rounded-full bg-amber-500 text-slate-950 border border-slate-900 flex items-center justify-center font-black text-xs shadow">
                    <Plus className="w-3 h-3" />
                  </div>
                )}

                {s.isLive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full shadow border border-white/40">
                    LIVE
                  </span>
                )}
              </div>

              <span className="text-[10px] font-bold text-slate-300 max-w-[55px] truncate text-center mt-0.5">
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. CREATE MOMENT QUICK PROMPT BAR */}
      <div
        onClick={() => setShowCreateModal(true)}
        className="bg-gradient-to-r from-[#170f2e] to-[#0c081a] border border-purple-500/40 hover:border-amber-400/60 p-3 rounded-2xl flex items-center justify-between shadow-lg cursor-pointer transition-all active:scale-98"
      >
        <div className="flex items-center gap-2.5">
          <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400" />
          <span className="text-xs text-slate-400 font-medium">ما الذي يدور في ذهنك اليوم؟ شارك لحظتك...</span>
        </div>
        <button className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" />
          <span>نشر</span>
        </button>
      </div>

      {/* 3. MOMENTS POSTS FEED */}
      <div className="space-y-4">
        {moments.map((m) => {
          const isAudioPlaying = activeAudioPlaying === m.id;
          return (
            <div
              key={m.id}
              className="bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-950 border border-slate-800 hover:border-purple-500/40 rounded-3xl p-4 shadow-xl space-y-3.5 transition-all"
            >
              {/* Post Author Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img src={m.userAvatar} alt={m.userName} className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-400" />
                    {m.vipLevel && (
                      <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[8px] font-black px-1 rounded-full border border-slate-950">
                        V{m.vipLevel}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-xs text-white">{m.userName}</h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block">{m.timeAgo}</span>
                  </div>
                </div>

                {/* Tags if any */}
                <div className="flex items-center gap-1">
                  {m.tags?.map((t) => (
                    <span key={t} className="text-[10px] bg-purple-950/80 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded-lg font-bold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Post Text */}
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-medium px-1">
                {m.text}
              </p>

              {/* Voice Clip Attachment Player */}
              {m.audioUrl && (
                <div className="bg-gradient-to-r from-purple-950/90 via-indigo-950/80 to-slate-900 p-3 rounded-2xl border border-purple-500/40 flex items-center justify-between gap-3 shadow-md">
                  <button
                    onClick={() => handleToggleAudio(m.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-slate-950 font-black shadow-lg transition-transform active:scale-90 cursor-pointer ${
                      isAudioPlaying ? 'bg-amber-400 scale-105' : 'bg-gradient-to-tr from-amber-400 to-yellow-500'
                    }`}
                  >
                    {isAudioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
                  </button>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-purple-300">
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3 h-3 text-amber-400" />
                        <span>تسجيل صوتي</span>
                      </span>
                      <span className="font-mono text-amber-300">{m.audioDuration || '0:15'}</span>
                    </div>

                    {/* Animated sound wave bars */}
                    <div className="flex items-center gap-1 h-3">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            height: isAudioPlaying ? `${Math.floor(Math.sin(i + Date.now()) * 6 + 6)}px` : '4px',
                          }}
                          className={`flex-1 rounded-full transition-all duration-150 ${
                            isAudioPlaying ? 'bg-amber-400' : 'bg-purple-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Image Attachment */}
              {m.image && (
                <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-72 shadow-lg">
                  <img src={m.image} alt="Moment Media" className="w-full h-full object-cover hover:scale-101 transition-transform duration-300" />
                </div>
              )}

              {/* Active Voice Room Card Trigger */}
              {m.activeRoomId && (
                <div
                  onClick={() => {
                    if (onOpenRoom) {
                      onOpenRoom({
                        id: m.activeRoomId!,
                        title: m.activeRoomTitle || 'غرفة المذيع',
                        hostName: m.userName,
                        hostAvatar: m.userAvatar,
                        listenersCount: 88,
                        category: 'شائع 🔥',
                        diamonds: 500,
                        seats: [],
                      } as any);
                    }
                  }}
                  className="bg-gradient-to-r from-rose-950/70 via-purple-950/70 to-slate-950 border border-rose-500/40 hover:border-rose-400 p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-98 shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-300">
                      <Radio className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-white block">متواجد الآن بالبث المباشر</span>
                      <span className="text-[10px] text-amber-300">"{m.activeRoomTitle}"</span>
                    </div>
                  </div>

                  <button className="px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-[10px] rounded-xl shadow">
                    انضمام للروم 🎙️
                  </button>
                </div>
              )}

              {/* Post Interaction Bar (Likes, Comments, Share) */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 px-1 text-xs">
                {/* Like Button */}
                <button
                  onClick={() => handleToggleLike(m.id)}
                  className={`flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                    m.isLiked ? 'text-rose-500 scale-105' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${m.isLiked ? 'fill-rose-500' : ''}`} />
                  <span className="font-mono text-xs">{m.likesCount}</span>
                </button>

                {/* Comment Button */}
                <button
                  onClick={() => setSelectedMomentForComments(m)}
                  className="flex items-center gap-1.5 font-bold text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-mono text-xs">{m.commentsCount}</span>
                  <span className="text-[10px]">تعليق</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={() => handleShare(m)}
                  className="flex items-center gap-1.5 font-bold text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-[10px]">مشاركة</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* 4. COMMENTS THREAD DIALOG */}
      {selectedMomentForComments && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans select-none animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-gradient-to-b from-[#140f26] to-[#0a0714] border-t-2 sm:border-2 border-purple-500/50 rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl space-y-3 max-h-[85vh] flex flex-col">
            
            {/* Comments Header */}
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-2.5">
              <button
                onClick={() => setSelectedMomentForComments(null)}
                className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-black text-sm text-amber-300">التعليقات ({selectedMomentForComments.commentsCount})</h3>
              <div className="w-6" />
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-72">
              {(commentsMap[selectedMomentForComments.id] || []).length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  لا توجد تعليقات بعد. كن أول من يعلق! ✨
                </div>
              ) : (
                (commentsMap[selectedMomentForComments.id] || []).map((c) => (
                  <div key={c.id} className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-start gap-2.5">
                    <img src={c.avatar} alt={c.user} className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-400 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-amber-300">{c.user}</span>
                        <span className="text-[9px] text-slate-500">{c.time}</span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Write Comment Box */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2 border-t border-purple-900/40">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="اكتب تعليقاً لطيفاً..."
                className="flex-1 bg-[#120d24] border border-purple-500/40 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition-transform active:scale-90 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}

      {/* 5. CREATE MOMENT MODAL */}
      {showCreateModal && (
        <CreateMomentModal
          user={user}
          activeRoom={activeRoom}
          onClose={() => setShowCreateModal(false)}
          onPublish={handlePublishNewMoment}
        />
      )}

    </div>
  );
};
