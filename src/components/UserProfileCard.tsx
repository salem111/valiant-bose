import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  UserCheck,
  UserPlus,
  MessageCircle,
  Gift,
  Copy,
  Check,
  Shield,
  ShieldAlert,
  MicOff,
  Mic,
  ArrowDownCircle,
  Ban,
  Sparkles,
  Award,
  Crown,
  Star,
  Briefcase,
  Video,
} from 'lucide-react';
import { UserProfile } from '../types';
import { AvatarWithFrame } from './AvatarWithFrame';
import {
  fetchUserProfileFromFirestore,
  checkIsFollowingInFirebase,
  followUserInFirebase,
  unfollowUserInFirebase,
  rtdb,
} from '../lib/firebase';
import { ref, get } from 'firebase/database';

export interface UserProfileCardProps {
  targetUserId: string;
  initialUserData?: {
    id: string;
    name: string;
    avatar: string;
    diamonds?: number;
    equippedFrame?: string;
    vipLevel?: number;
    wealthLevel?: number;
    age?: number;
    bio?: string;
    country?: string;
    gender?: string;
    role?: string;
    seatId?: number | null;
    cpPartnerName?: string;
    cpPartnerAvatar?: string;
    cpLevel?: number;
  } | null;
  currentUser: UserProfile;
  isHost?: boolean;
  isMod?: boolean;
  onClose: () => void;
  onOpenDirectChat?: (targetUser: any) => void;
  onOpenGiftSelector?: (targetUser: any) => void;
  onToggleMuteSeat?: (seatId: number) => void;
  onLowerFromSeat?: (seatId: number) => void;
  onKickUser?: (userId: string) => void;
  onBlacklistUser?: (userId: string) => void;
  onToggleModerator?: (userId: string) => void;
  onMentionInChat?: (userName: string) => void;
  isSeatMuted?: boolean;
  showToast?: (msg: string) => void;
}

import {
  getRelationshipStatus,
  followUserUnified,
  unfollowUserUnified,
  RelationshipStatus,
} from '../lib/friendsService';

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  targetUserId,
  initialUserData,
  currentUser,
  isHost = false,
  isMod = false,
  onClose,
  onOpenDirectChat,
  onOpenGiftSelector,
  onToggleMuteSeat,
  onLowerFromSeat,
  onKickUser,
  onBlacklistUser,
  onToggleModerator,
  onMentionInChat,
  isSeatMuted = false,
  showToast = (msg: string) => console.log(msg),
}) => {
  const [profile, setProfile] = useState<any>(initialUserData || {
    id: targetUserId,
    name: 'مستخدم SALEEM',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    equippedFrame: '',
    vipLevel: 1,
    wealthLevel: 1,
    followersCount: 0,
    followingCount: 0,
    friendsCount: 0,
    receivedGifts: '0',
    sentGifts: '0',
    bio: '',
    country: 'الأردن 🇯🇴',
    gender: 'ذكر',
    age: 20,
    title: '',
    entranceEffect: '',
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [relationship, setRelationship] = useState<RelationshipStatus>('none');
  const [isFollowLoading, setIsFollowLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [followersCount, setFollowersCount] = useState<number>(profile.followersCount || 0);
  const [showModMenu, setShowModMenu] = useState<boolean>(Boolean((isHost || isMod) && currentUser.id !== targetUserId));

  const isSelf = currentUser.id === targetUserId;
  const isFollowing = relationship === 'following' || relationship === 'friend';

  // 1. Fetch live user data and relationship status from Firestore & RTDB
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        // Fetch profile
        const liveData = await fetchUserProfileFromFirestore(targetUserId);
        if (isMounted && liveData) {
          setProfile((prev: any) => ({
            ...prev,
            ...liveData,
            diamonds: liveData.diamonds !== undefined ? liveData.diamonds : prev.diamonds,
            name: liveData.name || liveData.username || prev.name,
            avatar: liveData.avatar || liveData.photoURL || prev.avatar,
            followersCount: liveData.followersCount ?? prev.followersCount,
            followingCount: liveData.followingCount ?? prev.followingCount,
          }));
          if (liveData.followersCount !== undefined) {
            setFollowersCount(liveData.followersCount);
          }
        }

        // Also fetch live diamonds from RTDB
        try {
          const userRef = ref(rtdb, `users/${targetUserId}`);
          const userSnap = await get(userRef);
          if (userSnap.exists() && isMounted) {
            const val = userSnap.val();
            const liveDiamonds = Number(val.diamonds) || 0;
            setProfile((prev: any) => ({
              ...prev,
              diamonds: liveDiamonds,
            }));
          }
        } catch (e) {}

        // Check unified relationship status (Single source of truth)
        if (!isSelf && currentUser?.id) {
          const rel = await getRelationshipStatus(currentUser.id, targetUserId);
          if (isMounted) {
            setRelationship(rel);
          }
        }
      } catch (err) {
        console.warn('⚠️ Error loading user card data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    // Listen to real-time relationship change events
    const handleRelChange = (e: any) => {
      if (e.detail?.targetUserId === targetUserId && isMounted) {
        setRelationship(e.detail.status);
      }
    };
    window.addEventListener('app:relationship-changed', handleRelChange);

    return () => {
      isMounted = false;
      window.removeEventListener('app:relationship-changed', handleRelChange);
    };
  }, [targetUserId, currentUser.id, isSelf]);

  // 2. Toggle Follow / Unfollow using unified service
  const handleToggleFollow = async () => {
    if (isSelf || isFollowLoading) return;
    setIsFollowLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        const res = await unfollowUserUnified(currentUser.id, targetUserId);
        if (res.success) {
          setRelationship(res.newStatus);
          setFollowersCount((prev) => Math.max(0, prev - 1));
          showToast(`تم إلغاء متابعة ${profile.name}`);
        }
      } else {
        // Follow
        const res = await followUserUnified(
          { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar },
          {
            id: targetUserId,
            name: profile.name,
            avatar: profile.avatar,
            vipLevel: profile.vipLevel,
            userLevel: profile.userLevel,
            country: profile.country,
            bio: profile.bio,
          }
        );
        if (res.success) {
          setRelationship(res.newStatus);
          setFollowersCount((prev) => prev + 1);
          if (res.newStatus === 'friend') {
            showToast(`🤝 أصبحتما أصدقاء الآن مع ${profile.name}!`);
          } else {
            showToast(`❤️ بدأت بمتابعة ${profile.name}!`);
          }
        }
      }
    } catch (err) {
      showToast('❌ تعذر تحديث حالة المتابعة، يرجى المحاولة لاحقاً');
    } finally {
      setIsFollowLoading(false);
    }
  };

  // 3. Copy User ID
  const handleCopyId = () => {
    const idToCopy = profile.id || targetUserId;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(idToCopy);
    }
    setCopiedId(true);
    showToast('📋 تم نسخ المعرّف ID إلى الحافظة');
    setTimeout(() => setCopiedId(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in zoom-in duration-200">
      {/* Card Container */}
      <div
        className="w-full max-w-sm bg-[#150d24] border-2 border-purple-500/60 rounded-3xl p-4 shadow-[0_0_50px_rgba(168,85,247,0.35)] text-white relative overflow-hidden text-right flex flex-col max-h-[92vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header Bar: Options & Close */}
        <div className="flex items-center justify-between pb-2 border-b border-purple-500/20 z-10">
          {/* Close Button on Left */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>

          {/* User ID Pill with Copy */}
          <button
            type="button"
            onClick={handleCopyId}
            className="flex items-center gap-1.5 bg-purple-950/80 border border-purple-500/40 px-2.5 py-1 rounded-full text-[10px] font-mono text-purple-200 hover:bg-purple-900/80 transition-all cursor-pointer shadow-sm active:scale-95"
            title="انقر لنسخ المعرّف"
          >
            <span>ID: {String(profile.id || targetUserId).slice(0, 10)}</span>
            {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-purple-300" />}
          </button>

          {/* Mod Menu Toggle (Only for Host/Mod viewing other users) */}
          {(isHost || isMod) && !isSelf ? (
            <button
              type="button"
              onClick={() => setShowModMenu(!showModMenu)}
              className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                showModMenu
                  ? 'bg-amber-500 text-slate-950 border-amber-300'
                  : 'bg-slate-900/90 border-slate-700 text-amber-300 hover:bg-slate-800'
              }`}
              title="إدارة العضو"
            >
              <Shield className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>

        {/* 2. ZONE 1: Main User Info (Avatar, Name, Badges, Bio) */}
        <div className="flex flex-col items-center text-center pt-3 pb-2 space-y-2 relative z-10">
          {/* Avatar with Frame */}
          <div className="relative">
            <AvatarWithFrame
              src={profile.avatar}
              frameId={profile.equippedFrame || undefined}
              size="2xl"
            />
            {profile.seatId ? (
              <span className="absolute -bottom-1 -right-1 z-20 bg-slate-950 text-amber-300 border border-amber-400 text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                مقعد #{profile.seatId}
              </span>
            ) : (
              <span className="absolute -bottom-1 -right-1 z-20 bg-slate-950 text-slate-300 border border-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                مستمع 🎧
              </span>
            )}
          </div>

          {/* Name & Role Badges */}
          <div>
            <h3 className="font-black text-base text-white flex items-center justify-center gap-1.5 drop-shadow">
              <span>{profile.name}</span>
              {isHost && profile.id === currentUser.id && (
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
              )}
            </h3>

            {/* Badges Row (VIP, Level, Country, Gender) */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap mt-1.5">
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow border border-purple-300/40 flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                <span>Lv.{profile.level || 15}</span>
              </span>

              <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full shadow border border-amber-300 flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5 fill-slate-950 text-slate-950" />
                <span>VIP {profile.vipLevel || 3}</span>
              </span>

              {/* Live Streaming Badge */}
              {profile.isLive && (
                <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow border border-red-300 flex items-center gap-1 animate-pulse">
                  <Video className="w-2.5 h-2.5" />
                  <span>بث مباشر الآن 🔴</span>
                </span>
              )}

              {/* Dynamic Agency Affiliation Badge */}
              {(profile.isAgencyOwner || profile.agencyRole === 'owner') ? (
                <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[9px] font-black px-2.5 py-0.5 rounded-full shadow border border-amber-300 flex items-center gap-1">
                  <Briefcase className="w-2.5 h-2.5 text-slate-950" />
                  <span>صاحب وكالة: {profile.agencyName || 'وكالتي'} 👑</span>
                </span>
              ) : profile.agencyName ? (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9px] font-black px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                  <Briefcase className="w-2.5 h-2.5 text-amber-400" />
                  <span>وكالة: {profile.agencyName}</span>
                </span>
              ) : null}

              {/* CP Partner Badge */}
              {profile.cpPartnerName && (
                <span className="bg-gradient-to-r from-pink-600 to-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow border border-pink-300 flex items-center gap-1">
                  <span>💍 CP: {profile.cpPartnerName}</span>
                </span>
              )}

              <span className="bg-slate-900/90 text-slate-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-700">
                {profile.country || 'الأردن 🇯🇴'}
              </span>

              <span className="bg-slate-900/90 text-slate-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-700">
                {profile.gender === 'أنثى' ? '♀ أنثى' : '♂ ذكر'}
              </span>
            </div>
          </div>

          {/* Bio Text */}
          <div className="w-full bg-slate-950/60 border border-purple-500/20 rounded-2xl px-3 py-2 text-[10px] text-slate-300 leading-relaxed text-center">
            <p className="line-clamp-2">{profile.bio || 'أهلاً بكم في ملفي الشخصي على تطبيق SALEEM! ✨'}</p>
          </div>
        </div>

        {/* 3. Action Buttons (Follow, Message, Send Gift, @Mention) */}
        {!isSelf && (
          <div className="grid grid-cols-4 gap-1.5 py-1 relative z-10">
            {/* Follow Button */}
            <button
              type="button"
              onClick={handleToggleFollow}
              disabled={isFollowLoading}
              className={`py-2 px-1 rounded-2xl font-black text-[11px] transition-all flex items-center justify-center gap-1 shadow-lg cursor-pointer active:scale-95 ${
                relationship === 'friend'
                  ? 'bg-slate-800 hover:bg-rose-900/40 text-emerald-400 border border-emerald-500/60'
                  : relationship === 'following'
                  ? 'bg-slate-800 hover:bg-rose-900/40 text-cyan-400 border border-cyan-500/50'
                  : relationship === 'follower'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:brightness-110 text-white border border-amber-400 shadow-amber-950/50'
                  : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:brightness-110 text-white border border-pink-400/40 shadow-rose-950/50'
              }`}
            >
              {relationship === 'friend' ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>أصدقاء 🤝</span>
                </>
              ) : relationship === 'following' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span>متابع ✓</span>
                </>
              ) : relationship === 'follower' ? (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>رد المتابعة</span>
                </>
              ) : (
                <>
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>متابعة</span>
                </>
              )}
            </button>

            {/* Direct Message Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenDirectChat) {
                  onOpenDirectChat(profile);
                } else {
                  showToast(`💬 فتح محادثة خاصة مع ${profile.name}`);
                }
              }}
              className="py-2 px-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:brightness-110 text-white rounded-2xl font-black text-[11px] transition-all flex items-center justify-center gap-1 shadow-lg border border-cyan-400/40 active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>رسالة</span>
            </button>

            {/* Gift Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenGiftSelector) {
                  onOpenGiftSelector(profile);
                } else {
                  showToast(`🎁 إرسال هدية إلى ${profile.name}`);
                }
              }}
              className="py-2 px-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 rounded-2xl font-black text-[11px] transition-all flex items-center justify-center gap-1 shadow-lg border border-amber-300 active:scale-95 cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>هدية</span>
            </button>

            {/* @Mention Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onMentionInChat) {
                  onMentionInChat(profile.name);
                } else {
                  showToast(`📣 تمت الإشارة إلى @${profile.name}`);
                }
              }}
              className="py-2 px-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white rounded-2xl font-black text-[11px] transition-all flex items-center justify-center gap-1 shadow-lg border border-purple-400/40 active:scale-95 cursor-pointer"
            >
              <span className="font-mono font-black text-xs">@</span>
              <span>مناداة</span>
            </button>
          </div>
        )}

        {/* 4. ZONE 2: Diamonds & Gift Statistics (Received / Sent / Live Diamonds Balance) */}
        <div className="grid grid-cols-3 gap-1.5 my-2 relative z-10">
          <div className="bg-gradient-to-b from-cyan-950/90 to-slate-950/90 border border-cyan-500/50 rounded-2xl p-2 flex flex-col items-center justify-center text-center shadow-lg shadow-cyan-950/30">
            <span className="text-[9px] font-bold text-cyan-300">رصيد الألماس 💎</span>
            <span className="text-xs font-black text-cyan-200 font-mono mt-0.5">
              {(profile.diamonds || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-purple-500/30 rounded-2xl p-2 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] font-bold text-slate-400">الهدايا المستلمة</span>
            <span className="text-xs font-black text-amber-300 font-mono mt-0.5">
              {profile.receivedGifts || ((profile.diamonds || 0) > 0 ? (profile.diamonds || 0).toLocaleString() : '83.4K')}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-purple-500/30 rounded-2xl p-2 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] font-bold text-slate-400">الهدايا المرسلة</span>
            <span className="text-xs font-black text-rose-300 font-mono mt-0.5">{profile.sentGifts || '12.5K'}</span>
          </div>
        </div>

        {/* 5. ZONE 3: Relations Numbers (Followers, Following, Friends) */}
        <div className="bg-slate-950/90 border border-purple-500/30 rounded-2xl p-2.5 grid grid-cols-3 divide-x divide-x-reverse divide-purple-900/40 text-center my-1 relative z-10">
          <div>
            <span className="text-xs font-black text-amber-300 font-mono block">{followersCount}</span>
            <span className="text-[9px] font-bold text-slate-400">المتابعون</span>
          </div>
          <div>
            <span className="text-xs font-black text-cyan-300 font-mono block">{profile.followingCount || 98}</span>
            <span className="text-[9px] font-bold text-slate-400">يتابع</span>
          </div>
          <div>
            <span className="text-xs font-black text-purple-300 font-mono block">{profile.friendsCount || 15}</span>
            <span className="text-[9px] font-bold text-slate-400">الأصدقاء</span>
          </div>
        </div>

        {/* 6. ZONE 4: Collectibles from Backpack (Frame, Entrance, Badges, Titles) */}
        <div className="mt-2 space-y-1.5 relative z-10">
          <h4 className="text-[10px] font-black text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>مقتنيات الحقيبة المجهزة</span>
          </h4>

          <div className="grid grid-cols-4 gap-1.5">
            {/* 1. Frame */}
            <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-1.5 flex flex-col items-center text-center gap-1">
              <span className="text-sm">🖼️</span>
              <span className="text-[8px] font-bold text-slate-300 truncate w-full">الإمبراطور</span>
            </div>

            {/* 2. Entrance Vehicle */}
            <div className="bg-slate-950/80 border border-pink-500/30 rounded-xl p-1.5 flex flex-col items-center text-center gap-1">
              <span className="text-sm">🌸</span>
              <span className="text-[8px] font-bold text-slate-300 truncate w-full">دخولية الورد</span>
            </div>

            {/* 3. Badge */}
            <div className="bg-slate-950/80 border border-purple-500/30 rounded-xl p-1.5 flex flex-col items-center text-center gap-1">
              <span className="text-sm">👑</span>
              <span className="text-[8px] font-bold text-slate-300 truncate w-full">تاج VIP</span>
            </div>

            {/* 4. Title */}
            <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-1.5 flex flex-col items-center text-center gap-1">
              <span className="text-sm">⭐</span>
              <span className="text-[8px] font-bold text-slate-300 truncate w-full">نجم الغرفة</span>
            </div>
          </div>
        </div>

        {/* 7. MODERATION ACTIONS ACCORDION (For Host & Mods Only) */}
        {showModMenu && (isHost || isMod) && !isSelf && (
          <div className="mt-3 pt-2 border-t border-amber-500/40 bg-[#1e0f2f] rounded-2xl p-2.5 space-y-1.5 animate-in slide-in-from-top duration-200">
            <h5 className="text-[10px] font-black text-amber-300 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>إجراءات الإشراف والإدارة</span>
            </h5>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {/* Mute Seat / Unmute */}
              {profile.seatId && (
                <button
                  type="button"
                  onClick={() => {
                    if (onToggleMuteSeat) onToggleMuteSeat(profile.seatId);
                    showToast(isSeatMuted ? `🔊 تم إلغاء كتم مايك ${profile.name}` : `🔇 تم كتم مايك ${profile.name}`);
                  }}
                  className="bg-purple-950/90 border border-purple-500/50 hover:bg-purple-900 text-purple-200 rounded-xl p-2 flex items-center justify-center gap-1 text-[10px] font-bold transition-all"
                >
                  {isSeatMuted ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-red-400" />}
                  <span>{isSeatMuted ? 'إلغاء الكتم' : 'كتم المايك'}</span>
                </button>
              )}

              {/* Lower from Seat */}
              {profile.seatId && (
                <button
                  type="button"
                  onClick={() => {
                    if (onLowerFromSeat) onLowerFromSeat(profile.seatId);
                    showToast(`⬇️ تم إنزال ${profile.name} إلى مقاعد الجمهور`);
                    onClose();
                  }}
                  className="bg-amber-950/90 border border-amber-500/50 hover:bg-amber-900 text-amber-200 rounded-xl p-2 flex items-center justify-center gap-1 text-[10px] font-bold transition-all"
                >
                  <ArrowDownCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>إنزال للجمهور</span>
                </button>
              )}

              {/* Toggle Moderator Role (Host Only) */}
              {isHost && (
                <button
                  type="button"
                  onClick={() => {
                    if (onToggleModerator) onToggleModerator(profile.id);
                    showToast(`🛡️ تم تعديل رتبة إشراف ${profile.name}`);
                  }}
                  className="bg-indigo-950/90 border border-indigo-500/50 hover:bg-indigo-900 text-indigo-200 rounded-xl p-2 flex items-center justify-center gap-1 text-[10px] font-bold transition-all"
                >
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>تعيين مشرف</span>
                </button>
              )}

              {/* Kick from Room */}
              <button
                type="button"
                onClick={() => {
                  if (onKickUser) onKickUser(profile.id);
                  showToast(`🚫 تم طرد ${profile.name} من الغرفة`);
                  onClose();
                }}
                className="bg-orange-950/90 border border-orange-500/50 hover:bg-orange-900 text-orange-200 rounded-xl p-2 flex items-center justify-center gap-1 text-[10px] font-bold transition-all"
              >
                <Ban className="w-3.5 h-3.5 text-orange-400" />
                <span>طرد مؤقت</span>
              </button>

              {/* Blacklist / Ban User from Room permanently */}
              {(isHost || isMod) && (
                <button
                  type="button"
                  onClick={() => {
                    if (onBlacklistUser) {
                      onBlacklistUser(profile.id);
                    } else if (onKickUser) {
                      onKickUser(profile.id);
                    }
                    showToast(`⛔ تمت إضافة ${profile.name} إلى القائمة السوداء`);
                    onClose();
                  }}
                  className="col-span-2 bg-red-950/90 border border-red-500/50 hover:bg-red-900 text-red-200 rounded-xl p-2 flex items-center justify-center gap-1 text-[10px] font-bold transition-all"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>حظر وإضافة إلى القائمة السوداء ⛔</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
