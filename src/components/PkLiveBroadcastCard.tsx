import React, { useState, useEffect } from 'react';
import {
  Users,
  Heart,
  X,
  Share2,
  Gift,
  Plus,
  Send,
  Headphones,
  Crown,
  Sparkles,
  Flame,
  Volume2,
  Smile,
  Compass,
  Trophy,
  Swords
} from 'lucide-react';
import { UserProfile, GiftItem } from '../types';

interface PkLiveBroadcastCardProps {
  user: UserProfile;
  isFullScreen?: boolean;
  onClose?: () => void;
  onOpenCoinStore?: () => void;
  onSendGiftToUser?: (gift: GiftItem, recipientName: string) => void;
}

interface PKComment {
  id: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  isGift?: boolean;
  giftIcon?: string;
  giftCount?: number;
  userRank?: number;
}

export const PkLiveBroadcastCard: React.FC<PkLiveBroadcastCardProps> = ({
  user,
  isFullScreen = false,
  onClose,
  onOpenCoinStore,
  onSendGiftToUser,
}) => {
  // PK Challenge Scores
  const [redPoints, setRedPoints] = useState(12500);
  const [bluePoints, setBluePoints] = useState(9800);
  const [redWins, setRedWins] = useState(2);
  const [blueWins, setBlueWins] = useState(0);

  // Timer: 04:35 countdown
  const [timeLeft, setTimeLeft] = useState(275); // 4 minutes 35 seconds
  const [streakTimer, setStreakTimer] = useState(2); // 2s streak timer

  // Gifts & Likes
  const [likesCount, setLikesCount] = useState(15600);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<'red' | 'blue'>('red');
  const [inputMessage, setInputMessage] = useState('');
  const [showGiftBox, setShowGiftBox] = useState(true);

  // Gift animation spark
  const [lastGiftAnim, setLastGiftAnim] = useState<{ side: 'red' | 'blue'; name: string; icon: string } | null>(null);

  // Comments feed
  const [comments, setComments] = useState<PKComment[]>([
    {
      id: '1',
      senderName: 'يزن 👑',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      text: 'أرسل وردة',
      isGift: true,
      giftIcon: '🌹',
      giftCount: 10,
    },
    {
      id: '2',
      senderName: 'أحمد',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      text: 'أرسل أسد',
      isGift: true,
      giftIcon: '🦁',
      giftCount: 1,
    },
    {
      id: '3',
      senderName: 'Sara ❤️',
      senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
      text: 'يا بخت منورين اليوم PK',
    },
    {
      id: '4',
      senderName: 'محمد',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      text: 'انضم للبث المباشر 💫',
      userRank: 24,
    },
  ]);

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate score line percentage
  const totalPoints = redPoints + bluePoints;
  const redPercentage = totalPoints === 0 ? 50 : Math.min(85, Math.max(15, Math.round((redPoints / totalPoints) * 100)));
  const bluePercentage = 100 - redPercentage;

  // Send gift handler
  const handleSendGift = (giftName: string, icon: string, coins: number) => {
    if (user.coins < coins) {
      if (onOpenCoinStore) onOpenCoinStore();
      return;
    }

    // Deduct/Add points to selected side
    if (selectedTeam === 'red') {
      setRedPoints((prev) => prev + coins * 10);
    } else {
      setBluePoints((prev) => prev + coins * 10);
    }

    setLastGiftAnim({ side: selectedTeam, name: giftName, icon });
    setTimeout(() => setLastGiftAnim(null), 1500);

    // Add to comment log
    setComments((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        senderName: user.name,
        senderAvatar: user.avatar,
        text: `أرسل ${giftName}`,
        isGift: true,
        giftIcon: icon,
        giftCount: 1,
      },
    ]);

    if (onSendGiftToUser) {
      onSendGiftToUser(
        { id: giftName, name: giftName, icon, priceCoins: coins, rarity: 'rare' },
        selectedTeam === 'red' ? 'Lara' : 'ميار'
      );
    }
  };

  // Add Comment
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    setComments((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        senderName: user.name,
        senderAvatar: user.avatar,
        text: inputMessage.trim(),
      },
    ]);
    setInputMessage('');
  };

  return (
    <div
      className={`relative w-full bg-slate-950 text-white font-sans dir-rtl select-none overflow-hidden ${
        isFullScreen ? 'fixed inset-0 z-50 h-full flex flex-col justify-between' : 'rounded-3xl border border-rose-500/30 shadow-2xl my-2'
      }`}
    >
      {/* BACKGROUND PARTICLES & ATMOSPHERE */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-rose-950/40 to-transparent blur-2xl" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-950/40 to-transparent blur-2xl" />
      </div>

      {/* 1. TOP BROADCASTER HEADER BAR */}
      <div className="relative z-10 p-2.5 sm:p-3 bg-slate-950/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between gap-1.5 flex-wrap">
        {/* Left Profile Pill (Lara) */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-rose-500/30 px-2.5 py-1 rounded-full shadow-lg">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
              alt="Lara"
              className="w-8 h-8 rounded-full object-cover border-2 border-pink-500"
            />
            <span className="absolute -bottom-1 -right-1 bg-pink-600 text-[8px] font-bold px-1 rounded-full border border-slate-950">
              🔴
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">Lara</span>
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all active:scale-95 ${
                  isFollowing
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950'
                }`}
              >
                {isFollowing ? 'تمت المتابعة' : 'متابعة'}
              </button>
            </div>
            <span className="text-[10px] text-pink-300/90 block">23.5K إعجاب</span>
          </div>
        </div>

        {/* Center Hourly Rank Badge */}
        <div className="hidden sm:flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-300">
          <Flame className="w-3 h-3 text-amber-400 animate-bounce" />
          <span>أفضل 10 في الساعة</span>
        </div>

        {/* Right Supporters + Viewers + Close */}
        <div className="flex items-center gap-2">
          {/* Top 3 Supporters Avatars */}
          <div className="flex items-center -space-x-1.5 space-x-reverse">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                alt="12K"
                className="w-6 h-6 rounded-full border-2 border-amber-400 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[7px] font-black px-1 rounded-full">
                12K
              </span>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
                alt="8.7K"
                className="w-6 h-6 rounded-full border-2 border-slate-300 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 bg-slate-300 text-slate-950 text-[7px] font-black px-1 rounded-full">
                8.7K
              </span>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                alt="6.3K"
                className="w-6 h-6 rounded-full border-2 border-amber-700 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 bg-amber-700 text-white text-[7px] font-black px-1 rounded-full">
                6.3K
              </span>
            </div>
          </div>

          {/* Viewers Counter */}
          <div className="flex items-center gap-1 bg-black/60 border border-white/10 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-200">
            <Users className="w-3 h-3 text-rose-400" />
            <span>12.3K</span>
          </div>

          {/* Explore Link */}
          <div className="hidden md:flex items-center gap-1 text-[10px] text-pink-300 bg-pink-950/40 border border-pink-500/30 px-2 py-0.5 rounded-full">
            <Compass className="w-3 h-3 text-pink-400" />
            <span>استكشف 🪐</span>
          </div>

          {/* Close button if full screen */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 bg-black/60 hover:bg-rose-600 rounded-full text-white border border-white/20 transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. TOP PK SCORE HEADER BAR (Red vs Blue) */}
      <div className="relative z-10 w-full bg-slate-950 flex items-center justify-between px-3 py-1.5 border-b border-rose-500/20 font-black">
        {/* Red Team Score (Lara) */}
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-black text-rose-400 tracking-wider">
            {redPoints.toLocaleString()}
          </span>
          <span className="bg-rose-600/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase border border-rose-400 shadow">
            WIN × {redWins}
          </span>
        </div>

        {/* PK Badge & Countdown Timer */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-rose-950 via-slate-900 to-blue-950 px-3 py-1 rounded-full border border-amber-500/50 shadow-lg">
          <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-[10px] px-1.5 py-0.2 rounded font-mono italic">
            PK
          </span>
          <span className="text-xs font-mono font-bold text-amber-300 tracking-wider">
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Blue Team Score (Opponent) */}
        <div className="flex items-center gap-2">
          <span className="bg-blue-600/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase border border-blue-400 shadow">
            WIN × {blueWins}
          </span>
          <span className="text-sm sm:text-base font-black text-blue-400 tracking-wider">
            {bluePoints.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 3. SPLIT-SCREEN CHALLENGE VIDEO STAGE (Two Participants) */}
      <div className="relative z-10 w-full flex-1 min-h-[280px] sm:min-h-[360px] bg-slate-950 grid grid-cols-2 divide-x divide-x-reverse divide-rose-500/40 overflow-hidden">
        {/* LEFT PARTICIPANT (Red Side - Lara with Headset) */}
        <div className="relative w-full h-full bg-slate-900 overflow-hidden flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
            alt="Lara"
            className="w-full h-full object-cover filter brightness-105 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

          {/* Headphones Indicator Badge */}
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur border border-rose-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 text-[9px] text-rose-300 font-bold shadow">
            <Headphones className="w-3 h-3 text-pink-400 animate-pulse" />
            <span>سماعات أذن متصلة 🎧</span>
          </div>

          {/* Bottom Overlay: Gifts Count & Top 3 Contributors */}
          <div className="absolute bottom-2 inset-x-2 flex items-center justify-between text-white">
            <div className="bg-pink-600/90 backdrop-blur border border-pink-400 px-2 py-0.5 rounded-full text-xs font-black flex items-center gap-1 shadow-lg">
              <span>🎁</span>
              <span>× 68</span>
            </div>

            {/* Top 3 Contributor Badges */}
            <div className="flex items-center -space-x-1.5 space-x-reverse">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80"
                  alt="3"
                  className="w-6 h-6 rounded-full border border-pink-400 object-cover"
                />
                <span className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-slate-950">
                  3
                </span>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80"
                  alt="2"
                  className="w-6 h-6 rounded-full border border-pink-400 object-cover"
                />
                <span className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-slate-950">
                  2
                </span>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80"
                  alt="1"
                  className="w-6 h-6 rounded-full border border-pink-400 object-cover"
                />
                <span className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-slate-950">
                  1
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PARTICIPANT (Blue Side - Mayar with White Headphones) */}
        <div className="relative w-full h-full bg-slate-900 overflow-hidden flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80"
            alt="Mayar"
            className="w-full h-full object-cover filter brightness-105 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

          {/* Headphones Indicator Badge */}
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur border border-blue-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 text-[9px] text-blue-300 font-bold shadow">
            <Headphones className="w-3 h-3 text-blue-400 animate-pulse" />
            <span>سماعات أذن متصلة 🎧</span>
          </div>

          {/* Bottom Overlay: Gifts Count & Top 3 Contributors */}
          <div className="absolute bottom-2 inset-x-2 flex items-center justify-between text-white">
            {/* Top 3 Contributor Badges */}
            <div className="flex items-center -space-x-1.5 space-x-reverse">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80"
                  alt="1"
                  className="w-6 h-6 rounded-full border border-cyan-400 object-cover"
                />
                <span className="absolute -bottom-1 -right-1 bg-cyan-500 text-slate-950 text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-slate-950">
                  1
                </span>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80"
                  alt="2"
                  className="w-6 h-6 rounded-full border border-cyan-400 object-cover"
                />
                <span className="absolute -bottom-1 -right-1 bg-cyan-500 text-slate-950 text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-slate-950">
                  2
                </span>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80"
                  alt="3"
                  className="w-6 h-6 rounded-full border border-cyan-400 object-cover"
                />
                <span className="absolute -bottom-1 -right-1 bg-cyan-500 text-slate-950 text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-slate-950">
                  3
                </span>
              </div>
            </div>

            <div className="bg-blue-600/90 backdrop-blur border border-blue-400 px-2 py-0.5 rounded-full text-xs font-black flex items-center gap-1 shadow-lg">
              <span>🎁</span>
              <span>× 56</span>
            </div>
          </div>
        </div>

        {/* Dynamic Gift Animation Flash Overlay */}
        {lastGiftAnim && (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center animate-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 border-2 border-amber-300 text-white px-6 py-2 rounded-full font-black text-sm shadow-[0_0_30px_rgba(245,158,11,0.9)] flex items-center gap-2 animate-bounce">
              <span className="text-3xl">{lastGiftAnim.icon}</span>
              <span>تم إرسال {lastGiftAnim.name} إلى الفريق! 🔥</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. POLL / QUESTION PROMPT BAR */}
      <div className="relative z-10 w-full bg-slate-950 py-1 flex items-center justify-center">
        <div className="bg-slate-900/90 border border-slate-700/80 px-4 py-1 rounded-full text-[11px] font-bold text-slate-200 shadow">
          من سيفوز بهذه الجولة؟
        </div>
      </div>

      {/* 5. DYNAMIC RED & BLUE SCORE PROGRESS LINE BAR */}
      <div className="relative z-10 w-full px-3 py-1.5 bg-slate-950 flex items-center gap-2">
        {/* Pink Heart Icon */}
        <div className="relative flex-shrink-0 animate-pulse">
          <span className="text-xl filter drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">💖</span>
        </div>

        {/* Progress Bar Container */}
        <div className="relative flex-1 h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 flex items-center shadow-inner">
          {/* Red Progress Line (Left) */}
          <div
            className="h-full bg-gradient-to-r from-rose-600 via-pink-500 to-rose-400 rounded-r-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(244,63,94,0.8)]"
            style={{ width: `${redPercentage}%` }}
          />
          {/* Blue Progress Line (Right) */}
          <div
            className="h-full bg-gradient-to-l from-blue-600 via-indigo-500 to-cyan-400 rounded-l-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(59,130,246,0.8)]"
            style={{ width: `${bluePercentage}%` }}
          />

          {/* Center Timer Indicator Badge over Bar */}
          <div className="absolute left-1/2 -translate-x-1/2 bg-slate-950/90 border border-amber-400/80 px-2 py-0.2 rounded-full text-[9px] font-mono font-black text-amber-300 shadow">
            {streakTimer}s
          </div>
        </div>

        {/* Blue Heart Icon */}
        <div className="relative flex-shrink-0 animate-pulse">
          <span className="text-xl filter drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">💙</span>
        </div>
      </div>

      {/* 6. BOTTOM PANELS: COMMENTS & GIFTS SELECTOR */}
      <div className="relative z-10 w-full p-2.5 bg-slate-950/95 border-t border-slate-900 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end">
        {/* LEFT SIDE: Event Log & Comments Feed (7 cols) */}
        <div className="md:col-span-7 flex flex-col justify-end space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
          {comments.slice(-4).map((c) => (
            <div key={c.id} className="flex items-center gap-1.5 text-xs text-right">
              {c.senderAvatar && (
                <img src={c.senderAvatar} alt={c.senderName} className="w-5 h-5 rounded-full object-cover border border-slate-700" />
              )}
              <span className="font-bold text-pink-300">{c.senderName}:</span>
              <span className={`text-slate-200 ${c.isGift ? 'font-black text-amber-300 flex items-center gap-1' : ''}`}>
                {c.text}
                {c.isGift && <span className="text-base">{c.giftIcon} × {c.giftCount}</span>}
              </span>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE: Interactive Gifts Panel (5 cols) */}
        <div className="md:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-2 text-right">
          <div className="flex items-center justify-between mb-1 text-[11px]">
            <span className="font-black text-amber-300">الهدايا المتاحة</span>
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-full border border-amber-500/30 text-[9px]">
              <span>داعِم:</span>
              <button
                onClick={() => setSelectedTeam(selectedTeam === 'red' ? 'blue' : 'red')}
                className={`font-black px-1.5 py-0.2 rounded transition-all ${
                  selectedTeam === 'red' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
                }`}
              >
                {selectedTeam === 'red' ? 'Lara (الأحمر) ❤️' : 'Mayar (الأزرق) 💙'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {/* Rose */}
            <button
              onClick={() => handleSendGift('وردة', '🌹', 1)}
              className="bg-slate-950 hover:bg-rose-950/60 border border-rose-500/30 hover:border-rose-500 rounded-xl p-1.5 flex flex-col items-center transition-all active:scale-95 group cursor-pointer"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">🌹</span>
              <span className="text-[10px] font-bold text-slate-200">وردة</span>
              <span className="text-[9px] text-amber-400 font-mono">🟡 1</span>
            </button>

            {/* Lion */}
            <button
              onClick={() => handleSendGift('أسد', '🦁', 299)}
              className="bg-slate-950 hover:bg-amber-950/60 border border-amber-500/30 hover:border-amber-500 rounded-xl p-1.5 flex flex-col items-center transition-all active:scale-95 group cursor-pointer"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">🦁</span>
              <span className="text-[10px] font-bold text-slate-200">أسد</span>
              <span className="text-[9px] text-amber-400 font-mono">🟡 299</span>
            </button>

            {/* Castle */}
            <button
              onClick={() => handleSendGift('قلعة', '🏰', 499)}
              className="bg-slate-950 hover:bg-purple-950/60 border border-purple-500/30 hover:border-purple-500 rounded-xl p-1.5 flex flex-col items-center transition-all active:scale-95 group cursor-pointer"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">🏰</span>
              <span className="text-[10px] font-bold text-slate-200">قلعة</span>
              <span className="text-[9px] text-amber-400 font-mono">🟡 499</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7. BOTTOM TOOLBAR & ACTION CONTROLS */}
      <div className="relative z-10 p-2.5 bg-slate-950 border-t border-slate-900 flex items-center justify-between gap-2">
        {/* Comment Input */}
        <form onSubmit={handleSendMessage} className="flex-1 flex items-center bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="اكتب رسالة..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none text-right"
          />
          <button type="button" className="text-slate-400 hover:text-white transition-colors p-1">
            <Smile className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Action Icons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="flex flex-col items-center p-1.5 hover:bg-slate-900 rounded-xl text-slate-300 transition-colors"
            title="مشاركة"
          >
            <Share2 className="w-4 h-4 text-slate-300" />
            <span className="text-[8px] font-bold">مشاركة</span>
          </button>

          <button
            type="button"
            className="flex flex-col items-center p-1.5 hover:bg-slate-900 rounded-xl text-slate-300 transition-colors"
            title="ضيف"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-[8px] font-bold">ضيف</span>
          </button>

          <button
            type="button"
            onClick={() => handleSendGift('وردة', '🌹', 1)}
            className="flex flex-col items-center p-1.5 hover:bg-rose-950 rounded-xl text-pink-400 transition-colors"
            title="هدية"
          >
            <Gift className="w-4 h-4 text-pink-500" />
            <span className="text-[8px] font-bold">هدية</span>
          </button>

          <button
            type="button"
            onClick={() => setLikesCount((prev) => prev + 1)}
            className="flex items-center gap-1 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 px-2.5 py-1.5 rounded-full text-rose-400 transition-all active:scale-95"
          >
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
            <span className="text-xs font-black text-rose-200">{likesCount >= 1000 ? `${(likesCount / 1000).toFixed(1)}K` : likesCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
