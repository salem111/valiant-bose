import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  Heart,
  MessageCircle,
  Search,
  Sparkles,
  Radio,
  ExternalLink,
  Shield,
  Crown,
} from 'lucide-react';
import { listenToAllUsersPresence } from '../lib/firebase';
import { useI18n } from '../lib/i18n';
import { UserProfile } from '../types';
import {
  fetchUserRelationships,
  followUserUnified,
  unfollowUserUnified,
  FriendUserItem,
  RelationshipStatus,
} from '../lib/friendsService';
import { UserProfileCard } from './UserProfileCard';

interface FriendsViewProps {
  currentUser?: UserProfile;
  onOpenDirectChat?: (targetUser: any) => void;
  onOpenRoom?: (roomId: string) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  currentUser,
  onOpenDirectChat,
  onOpenRoom,
}) => {
  const { t, dir } = useI18n();
  const [activeTab, setActiveTab] = useState<'all' | 'friends' | 'following' | 'followers'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>({});
  const [relationships, setRelationships] = useState<{
    friends: FriendUserItem[];
    following: FriendUserItem[];
    followers: FriendUserItem[];
  }>({
    friends: [],
    following: [],
    followers: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserForCard, setSelectedUserForCard] = useState<string | null>(null);

  const activeUserId = currentUser?.id || 'user_salem';

  // 1. Subscribe to RTDB presence map
  useEffect(() => {
    const unsub = listenToAllUsersPresence((map) => {
      setPresenceMap(map);
    });
    return () => unsub();
  }, []);

  // 2. Load relationships from unified service (Firestore + RTDB)
  const loadRelationships = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUserRelationships(activeUserId);
      setRelationships(data);
    } catch (e) {
      console.warn('⚠️ Error loading relationships:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRelationships();

    // Listen to global relationship change events
    const handleRelChange = () => {
      loadRelationships();
    };
    window.addEventListener('app:relationship-changed', handleRelChange);
    return () => {
      window.removeEventListener('app:relationship-changed', handleRelChange);
    };
  }, [activeUserId]);

  // 3. Handle Follow / Unfollow directly from list
  const handleToggleFollow = async (userItem: FriendUserItem) => {
    const isCurrentlyFollowing = userItem.relationship === 'following' || userItem.relationship === 'friend';

    if (isCurrentlyFollowing) {
      await unfollowUserUnified(activeUserId, userItem.userId);
    } else {
      await followUserUnified(
        { id: activeUserId, name: currentUser?.name || 'سالم', avatar: currentUser?.avatar || '' },
        userItem
      );
    }
    await loadRelationships();
  };

  // 4. Filter lists based on activeTab and searchQuery
  const currentList = (() => {
    let list: FriendUserItem[] = [];
    if (activeTab === 'friends') list = relationships.friends;
    else if (activeTab === 'following') list = relationships.following;
    else if (activeTab === 'followers') list = relationships.followers;
    else {
      // 'all': merge unique
      const map = new Map<string, FriendUserItem>();
      [...relationships.friends, ...relationships.following, ...relationships.followers].forEach((u) => {
        if (!map.has(u.userId)) map.set(u.userId, u);
      });
      list = Array.from(map.values());
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((u) => u.name.toLowerCase().includes(q) || u.userId.toLowerCase().includes(q));
  })();

  return (
    <div id="saleem-friends-view" dir={dir} className="space-y-4 text-start font-sans pb-20 select-none">
      
      {/* 👑 Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 p-4 rounded-3xl border border-indigo-500/30 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-sm text-white flex items-center gap-1.5">
              <span>شبكة الأصدقاء والمتابعين</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h2>
            <p className="text-[10px] text-slate-400 font-bold">
              {relationships.friends.length} أصدقاء مقربون 🤝 • {relationships.following.length} متابَعون
            </p>
          </div>
        </div>

        {/* Global Add Friend / Search Hint */}
        <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-2xl text-xs font-bold text-indigo-300">
          <UserPlus className="w-4 h-4" />
          <span>تواصل مباشر</span>
        </div>
      </div>

      {/* 🔍 Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن صديق بالاسم أو الـ ID..."
          className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* 🗂️ Segmented Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'friends'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>الأصدقاء 🤝</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/30">
            {relationships.friends.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('following')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'following'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>أتابعهم</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/30">
            {relationships.following.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('followers')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'followers'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>المتابعون</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/30">
            {relationships.followers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>الكل</span>
        </button>
      </div>

      {/* 👥 Contact Cards Grid */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-xs font-bold">جاري تحميل قائمة الأصدقاء والمتابعين...</span>
        </div>
      ) : currentList.length === 0 ? (
        <div className="py-14 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 p-6 space-y-2">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500 text-2xl">
            {activeTab === 'friends' ? '🤝' : activeTab === 'following' ? '🔍' : '👥'}
          </div>
          <h4 className="text-xs font-black text-white">
            {activeTab === 'friends'
              ? 'لا يوجد أصدقاء مقربون حتى الآن'
              : activeTab === 'following'
              ? 'لم تقم بمتابعة أي شخص بعد'
              : 'لا يوجد متابعون حالياً'}
          </h4>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            {activeTab === 'friends'
              ? 'يصبح العضو صديقاً عندما يقوم كل منكما بمتابعة الآخر (متابعة متبادلة).'
              : 'تصفح الغرف الصوتية وتابع المستخدمين المفضلين لديك لبدء الصداقة والمحادثات.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentList.map((f) => {
            const isOnline = presenceMap[f.userId] ?? true;
            const isFriend = f.relationship === 'friend';
            const isFollowing = f.relationship === 'following' || isFriend;

            return (
              <div
                key={f.userId}
                className="bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-3.5 flex items-center justify-between transition-all shadow-md group"
              >
                {/* User Info & Avatar */}
                <div
                  onClick={() => setSelectedUserForCard(f.userId)}
                  className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                >
                  <div className="relative shrink-0">
                    <img
                      src={f.avatar}
                      alt={f.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/40 group-hover:ring-indigo-400 transition-all"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                        isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-xs text-white truncate max-w-[120px]">{f.name}</h4>
                      {isFriend && (
                        <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full">
                          صديق 🤝
                        </span>
                      )}
                      {f.relationship === 'follower' && (
                        <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-full">
                          يتابعك ⚡
                        </span>
                      )}
                    </div>

                    <p className={`text-[10px] font-bold flex items-center gap-1 mt-0.5 ${isOnline ? 'text-emerald-400' : 'text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                      <span>{isOnline ? 'متصل الآن' : 'آخر ظهور مؤخراً'}</span>
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Direct Chat Button */}
                  <button
                    onClick={() => {
                      if (onOpenDirectChat) {
                        onOpenDirectChat(f);
                      } else {
                        // Dispatch open chat event
                        window.dispatchEvent(
                          new CustomEvent('app:open-direct-chat', {
                            detail: {
                              userId: f.userId,
                              name: f.name,
                              avatar: f.avatar,
                            },
                          })
                        );
                      }
                    }}
                    className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors"
                    title="محادثة خاصة"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  {/* Follow / Unfollow Button */}
                  <button
                    onClick={() => handleToggleFollow(f)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer ${
                      isFriend
                        ? 'bg-slate-800 hover:bg-rose-900/40 text-emerald-400 border border-emerald-500/50'
                        : isFollowing
                        ? 'bg-slate-800 hover:bg-rose-900/40 text-cyan-400 border border-cyan-500/50'
                        : 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-sm'
                    }`}
                  >
                    {isFriend ? 'أصدقاء 🤝' : isFollowing ? 'متابَع ✓' : 'متابعة +'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🪪 Modal User Profile Card on Click */}
      {selectedUserForCard && (
        <UserProfileCard
          targetUserId={selectedUserForCard}
          currentUser={currentUser || { id: activeUserId, name: 'سالم', avatar: '', coins: 0, diamonds: 0, vipLevel: 1, userLevel: 1, country: 'SA', countryFlag: '🇸🇦', bio: '', role: 'user', isAgent: false }}
          onClose={() => setSelectedUserForCard(null)}
          onOpenDirectChat={(u) => {
            setSelectedUserForCard(null);
            if (onOpenDirectChat) onOpenDirectChat(u);
          }}
        />
      )}
    </div>
  );
};
