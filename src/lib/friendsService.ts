import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  getDocs,
  serverTimestamp,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { ref, set, remove, get } from 'firebase/database';
import { db, rtdb, ensureFirebaseAuthSession } from './firebase';

export type RelationshipStatus = 'none' | 'following' | 'follower' | 'friend';

export interface FriendUserItem {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  vipLevel?: number;
  userLevel?: number;
  country?: string;
  countryFlag?: string;
  bio?: string;
  status?: string;
  activeRoomId?: string;
  activeRoomTitle?: string;
  relationship: RelationshipStatus;
  followedAt?: number;
}

const LOCAL_FOLLOWING_KEY = 'saleem_user_following_list';
const LOCAL_FOLLOWERS_KEY = 'saleem_user_followers_list';

/**
 * Checks the exact relationship status between current user and target user:
 * - 'friend': Both follow each other (Mutual)
 * - 'following': Current user follows target user
 * - 'follower': Target user follows current user
 * - 'none': Neither follows the other
 */
export async function getRelationshipStatus(
  currentUserId: string,
  targetUserId: string
): Promise<RelationshipStatus> {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
    return 'none';
  }

  try {
    // 1. Check if currentUser follows targetUser
    let iFollowTarget = false;
    try {
      const followSnap = await getDoc(doc(db, 'users', currentUserId, 'following', targetUserId));
      iFollowTarget = followSnap.exists();
    } catch {
      // Fallback check from RTDB
      const rtdbSnap = await get(ref(rtdb, `users/${currentUserId}/following/${targetUserId}`));
      iFollowTarget = rtdbSnap.exists();
    }

    // 2. Check if targetUser follows currentUser
    let targetFollowsMe = false;
    try {
      const followerSnap = await getDoc(doc(db, 'users', targetUserId, 'following', currentUserId));
      targetFollowsMe = followerSnap.exists();
    } catch {
      // Fallback check from RTDB
      const rtdbSnap = await get(ref(rtdb, `users/${targetUserId}/following/${currentUserId}`));
      targetFollowsMe = rtdbSnap.exists();
    }

    // 3. Fallback to localStorage cache if network offline
    if (!iFollowTarget) {
      try {
        const stored = localStorage.getItem(LOCAL_FOLLOWING_KEY);
        if (stored) {
          const list: FriendUserItem[] = JSON.parse(stored);
          iFollowTarget = list.some((u) => u.userId === targetUserId || u.id === targetUserId);
        }
      } catch {}
    }

    if (iFollowTarget && targetFollowsMe) return 'friend';
    if (iFollowTarget) return 'following';
    if (targetFollowsMe) return 'follower';
    return 'none';
  } catch (e) {
    console.warn('⚠️ [friendsService] Error checking relationship status:', e);
    return 'none';
  }
}

/**
 * Unified follow action:
 * - Records follow in Firestore & RTDB
 * - Recalculates relationship status
 * - Emits global event for instant UI synchronization across Profile, Friends, and Direct Messages
 */
export async function followUserUnified(
  currentUser: { id: string; name: string; avatar: string },
  targetUser: { id: string; name: string; avatar: string; [key: string]: any }
): Promise<{ success: boolean; newStatus: RelationshipStatus }> {
  if (!currentUser?.id || !targetUser?.id || currentUser.id === targetUser.id) {
    return { success: false, newStatus: 'none' };
  }

  try {
    await ensureFirebaseAuthSession().catch(() => {});
    const now = Date.now();

    // 1. Save in Firestore: currentUser -> following -> targetUser
    try {
      await setDoc(doc(db, 'users', currentUser.id, 'following', targetUser.id), {
        userId: targetUser.id,
        name: targetUser.name || 'مستخدم',
        avatar: targetUser.avatar || '',
        createdAt: serverTimestamp(),
      });

      // TargetUser -> followers -> currentUser
      await setDoc(doc(db, 'users', targetUser.id, 'followers', currentUser.id), {
        userId: currentUser.id,
        name: currentUser.name || 'مستخدم',
        avatar: currentUser.avatar || '',
        createdAt: serverTimestamp(),
      });

      // Update counters
      await updateDoc(doc(db, 'users', currentUser.id), { followingCount: increment(1) }).catch(() => {});
      await updateDoc(doc(db, 'users', targetUser.id), { followersCount: increment(1) }).catch(() => {});
    } catch (e) {}

    // 2. Save in RTDB
    try {
      await set(ref(rtdb, `users/${currentUser.id}/following/${targetUser.id}`), {
        userId: targetUser.id,
        name: targetUser.name || 'مستخدم',
        avatar: targetUser.avatar || '',
        createdAt: now,
      });

      await set(ref(rtdb, `users/${targetUser.id}/followers/${currentUser.id}`), {
        userId: currentUser.id,
        name: currentUser.name || 'مستخدم',
        avatar: currentUser.avatar || '',
        createdAt: now,
      });
    } catch (e) {}

    // 3. Update localStorage Cache for immediate responsiveness
    const friendItem: FriendUserItem = {
      id: targetUser.id,
      userId: targetUser.id,
      name: targetUser.name,
      avatar: targetUser.avatar,
      vipLevel: targetUser.vipLevel || 0,
      userLevel: targetUser.userLevel || 1,
      country: targetUser.country || 'SA',
      countryFlag: targetUser.countryFlag || '🇸🇦',
      bio: targetUser.bio || '',
      status: targetUser.status || 'متصل الآن',
      relationship: 'following',
      followedAt: now,
    };

    try {
      const storedFollowing = localStorage.getItem(LOCAL_FOLLOWING_KEY);
      const list: FriendUserItem[] = storedFollowing ? JSON.parse(storedFollowing) : [];
      if (!list.some((u) => u.userId === targetUser.id)) {
        list.unshift(friendItem);
        localStorage.setItem(LOCAL_FOLLOWING_KEY, JSON.stringify(list));
      }

      // Also update legacy key for backward compatibility
      const oldFriends = localStorage.getItem('followed_friends_list');
      const oldList = oldFriends ? JSON.parse(oldFriends) : [];
      if (!oldList.some((u: any) => u.userId === targetUser.id)) {
        oldList.unshift(friendItem);
        localStorage.setItem('followed_friends_list', JSON.stringify(oldList));
      }
    } catch (e) {}

    // 4. Determine final status (friend or following)
    const finalStatus = await getRelationshipStatus(currentUser.id, targetUser.id);
    friendItem.relationship = finalStatus;

    // 5. Broadcast global event for Profile, FriendsView, and DirectMessages
    window.dispatchEvent(
      new CustomEvent('app:relationship-changed', {
        detail: {
          targetUserId: targetUser.id,
          targetUser: friendItem,
          status: finalStatus,
          action: 'follow',
        },
      })
    );

    return { success: true, newStatus: finalStatus };
  } catch (err) {
    console.error('❌ [friendsService] Error in followUserUnified:', err);
    return { success: false, newStatus: 'none' };
  }
}

/**
 * Unified unfollow action:
 * - Removes follow from Firestore & RTDB
 * - Recalculates relationship status
 * - Emits global event for instant UI synchronization across Profile, Friends, and Direct Messages
 */
export async function unfollowUserUnified(
  currentUserId: string,
  targetUserId: string
): Promise<{ success: boolean; newStatus: RelationshipStatus }> {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
    return { success: false, newStatus: 'none' };
  }

  try {
    await ensureFirebaseAuthSession().catch(() => {});

    // 1. Delete from Firestore
    try {
      await deleteDoc(doc(db, 'users', currentUserId, 'following', targetUserId));
      await deleteDoc(doc(db, 'users', targetUserId, 'followers', currentUserId));
      await updateDoc(doc(db, 'users', currentUserId), { followingCount: increment(-1) }).catch(() => {});
      await updateDoc(doc(db, 'users', targetUserId), { followersCount: increment(-1) }).catch(() => {});
    } catch (e) {}

    // 2. Delete from RTDB
    try {
      await remove(ref(rtdb, `users/${currentUserId}/following/${targetUserId}`));
      await remove(ref(rtdb, `users/${targetUserId}/followers/${currentUserId}`));
    } catch (e) {}

    // 3. Update localStorage Cache
    try {
      const stored = localStorage.getItem(LOCAL_FOLLOWING_KEY);
      if (stored) {
        const list: FriendUserItem[] = JSON.parse(stored).filter((u) => u.userId !== targetUserId && u.id !== targetUserId);
        localStorage.setItem(LOCAL_FOLLOWING_KEY, JSON.stringify(list));
      }
      const oldFriends = localStorage.getItem('followed_friends_list');
      if (oldFriends) {
        const list = JSON.parse(oldFriends).filter((u: any) => u.userId !== targetUserId);
        localStorage.setItem('followed_friends_list', JSON.stringify(list));
      }
    } catch (e) {}

    // 4. Determine final status (none or follower)
    const finalStatus = await getRelationshipStatus(currentUserId, targetUserId);

    // 5. Broadcast global event
    window.dispatchEvent(
      new CustomEvent('app:relationship-changed', {
        detail: {
          targetUserId,
          status: finalStatus,
          action: 'unfollow',
        },
      })
    );

    return { success: true, newStatus: finalStatus };
  } catch (err) {
    console.error('❌ [friendsService] Error in unfollowUserUnified:', err);
    return { success: false, newStatus: 'none' };
  }
}

/**
 * Fetches the user's unified following, followers, and mutual friends lists
 */
export async function fetchUserRelationships(currentUserId: string): Promise<{
  friends: FriendUserItem[];
  following: FriendUserItem[];
  followers: FriendUserItem[];
}> {
  if (!currentUserId) {
    return { friends: [], following: [], followers: [] };
  }

  try {
    const followingMap = new Map<string, FriendUserItem>();
    const followersMap = new Map<string, FriendUserItem>();

    // 1. Fetch Following from Firestore / RTDB / LocalCache
    try {
      const followingSnap = await getDocs(collection(db, 'users', currentUserId, 'following'));
      followingSnap.forEach((d) => {
        const data = d.data();
        followingMap.set(d.id, {
          id: d.id,
          userId: d.id,
          name: data.name || 'مستخدم',
          avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          relationship: 'following',
          followedAt: data.createdAt?.toMillis?.() || Date.now(),
        });
      });
    } catch {}

    // RTDB Following check
    if (followingMap.size === 0) {
      try {
        const rtdbSnap = await get(ref(rtdb, `users/${currentUserId}/following`));
        if (rtdbSnap.exists()) {
          Object.entries(rtdbSnap.val()).forEach(([uId, val]: [string, any]) => {
            followingMap.set(uId, {
              id: uId,
              userId: uId,
              name: val.name || 'مستخدم',
              avatar: val.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              relationship: 'following',
              followedAt: val.createdAt || Date.now(),
            });
          });
        }
      } catch {}
    }

    // Local Storage Following Fallback
    try {
      const stored = localStorage.getItem(LOCAL_FOLLOWING_KEY) || localStorage.getItem('followed_friends_list');
      if (stored) {
        const list: FriendUserItem[] = JSON.parse(stored);
        list.forEach((u) => {
          if (!followingMap.has(u.userId || u.id)) {
            followingMap.set(u.userId || u.id, {
              ...u,
              id: u.userId || u.id,
              userId: u.userId || u.id,
              relationship: 'following',
            });
          }
        });
      }
    } catch {}

    // 2. Fetch Followers from Firestore / RTDB
    try {
      const followersSnap = await getDocs(collection(db, 'users', currentUserId, 'followers'));
      followersSnap.forEach((d) => {
        const data = d.data();
        followersMap.set(d.id, {
          id: d.id,
          userId: d.id,
          name: data.name || 'مستخدم',
          avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          relationship: 'follower',
        });
      });
    } catch {}

    if (followersMap.size === 0) {
      try {
        const rtdbSnap = await get(ref(rtdb, `users/${currentUserId}/followers`));
        if (rtdbSnap.exists()) {
          Object.entries(rtdbSnap.val()).forEach(([uId, val]: [string, any]) => {
            followersMap.set(uId, {
              id: uId,
              userId: uId,
              name: val.name || 'مستخدم',
              avatar: val.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              relationship: 'follower',
            });
          });
        }
      } catch {}
    }

    // 3. Compute Mutual Friends
    const friends: FriendUserItem[] = [];
    const following: FriendUserItem[] = [];
    const followers: FriendUserItem[] = [];

    followingMap.forEach((user, uId) => {
      if (followersMap.has(uId)) {
        const mutualItem: FriendUserItem = { ...user, relationship: 'friend' };
        friends.push(mutualItem);
        following.push(mutualItem);
      } else {
        following.push(user);
      }
    });

    followersMap.forEach((user, uId) => {
      if (followingMap.has(uId)) {
        followers.push({ ...user, relationship: 'friend' });
      } else {
        followers.push(user);
      }
    });

    return { friends, following, followers };
  } catch (err) {
    console.error('❌ [friendsService] Error fetching user relationships:', err);
    return { friends: [], following: [], followers: [] };
  }
}
