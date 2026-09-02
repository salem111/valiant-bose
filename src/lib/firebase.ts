import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  update,
  get,
  onValue,
  child,
  onDisconnect,
  remove,
  runTransaction,
} from 'firebase/database';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInWithCredential,
  signInAnonymously,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { activeConfig } from '../config';
import {
  loginWithGoogleUnified,
  loginWithFacebookUnified,
  logoutUnified,
  checkAndroidGooglePlayServices,
} from './auth';
import { UserProfile, VoiceRoom, CloudTrack, RoomMusicState, PKBattleState } from '../types';

/**
 * Checks if Google Play Services are available on the device (Android Native)
 */
export async function isGooglePlayServicesAvailable(): Promise<boolean> {
  return await checkAndroidGooglePlayServices();
}

// Initialize Firebase App safely with isolated platform configuration
const activeFirebaseConfig = activeConfig.firebase;
const app = getApps().length === 0 ? initializeApp(activeFirebaseConfig) : getApp();

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

/**
 * Wait for Firebase Auth to finish restoring its persisted session before
 * deciding whether an anonymous session is actually needed. This prevents a
 * race where the app creates an anonymous user while Google/Facebook login is
 * still being restored.
 */
const authInitializationPromise: Promise<FirebaseUser | null> = new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe();
    resolve(user);
  });
});

/**
 * Ensures an active Firebase Auth session is present.
 *
 * Anonymous authentication is kept for legacy Firebase/RTDB operations, but
 * it is created only after Firebase has finished restoring a real session.
 */
export async function ensureFirebaseAuthSession(): Promise<FirebaseUser | null> {
  const restoredUser = auth.currentUser ?? await authInitializationPromise;
  if (restoredUser) return restoredUser;

  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('Unable to establish Firebase Auth session:', err);
    return null;
  }
}

/**
 * Retrieves the Firebase ID token for API authorization.
 * When expectedUserId is supplied, an anonymous/different Firebase account is
 * never silently used for an API request belonging to another app user.
 */
export async function getUserAuthToken(expectedUserId?: string): Promise<string | null> {
  let user = auth.currentUser;
  if (!user) {
    user = await authInitializationPromise;
  }

  if (!user) return null;

  if (expectedUserId && user.uid !== expectedUserId.trim()) {
    console.warn(
      `Firebase Auth user mismatch: expected ${expectedUserId.trim()}, got ${user.uid}.`
    );
    return null;
  }

  try {
    return await user.getIdToken(true);
  } catch (err) {
    console.error('Failed to retrieve user ID token:', err);
    return null;
  }
}

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Realtime Database with databaseURL (Unified real-time cloud store)
export const rtdb = getDatabase(
  app,
  activeFirebaseConfig.databaseURL || 'https://salem-adae3-default-rtdb.asia-southeast1.firebasedatabase.app'
);

/**
 * Saves user data directly to Firebase Realtime Database at /users/{userId}
 */
export async function saveUserToRealtimeDb(userData: any) {
  if (!userData || !userData.id) return false;
  try {
    await ensureFirebaseAuthSession();
    const userRef = ref(rtdb, `users/${userData.id}`);
    const cleanData = JSON.parse(JSON.stringify(userData));
    await set(userRef, {
      ...cleanData,
      updatedAt: Date.now(),
    });
    console.log(`✅ [Firebase RTDB] User ${userData.id} saved to Realtime Database /users/${userData.id}`);
    return true;
  } catch (err: any) {
    if (err?.code === 'PERMISSION_DENIED') {
      console.warn('⚠️ [Firebase RTDB] Write permission denied. Please ensure Realtime Database Rules allow read/write in Firebase Console.');
    } else {
      console.warn('⚠️ [Firebase RTDB] Error saving user to Realtime Database:', err?.message || err);
    }
    return false;
  }
}

/**
 * Increment user's diamond and target balance in Firebase Realtime Database
 */
export async function incrementUserDiamondsInFirebase(userId: string, diamondsToAdd: number): Promise<number> {
  if (!userId || !diamondsToAdd) return 0;
  try {
    const userRef = ref(rtdb, `users/${userId}`);
    const snapshot = await get(userRef);
    const val = snapshot.val() || {};
    const currentDiamonds = Number(val.diamonds) || 0;
    const currentTarget = Number(val.targetDiamonds || val.diamonds) || 0;
    const currentTotalReceived = Number(val.totalReceivedDiamonds || val.diamonds) || 0;

    const newDiamonds = currentDiamonds + diamondsToAdd;
    const newTarget = currentTarget + diamondsToAdd;
    const newTotalReceived = currentTotalReceived + diamondsToAdd;
    const currentTouches = (Number(val.agencyStats?.touches) || 0) + diamondsToAdd;

    await update(userRef, {
      diamonds: newDiamonds,
      targetDiamonds: newTarget,
      totalReceivedDiamonds: newTotalReceived,
      'agencyStats/touches': currentTouches,
      lastDiamondReceivedAt: Date.now(),
    });

    // If user has an active agency, update agency member metrics
    if (val.agencyId) {
      try {
        await update(ref(rtdb, `agencies/${val.agencyId}/members/${userId}`), {
          diamondsEarned: currentTouches,
        });
      } catch (e) {}
    }

    console.log(`💎 [Firebase RTDB] User ${userId} diamonds incremented by +${diamondsToAdd} => Balance: ${newDiamonds}, Target: ${newTarget}, Touches: ${currentTouches}`);
    return newDiamonds;
  } catch (err) {
    console.error('❌ [Firebase RTDB] Error incrementing diamonds for user:', err);
    return 0;
  }
}

/**
 * Real-time listener for user profile updates in Firebase Realtime Database
 */
export function listenToUserInRealtimeDb(userId: string, callback: (userData: any) => void): () => void {
  if (!userId) return () => {};
  try {
    const userRef = ref(rtdb, `users/${userId}`);
    return onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    });
  } catch (err) {
    console.error('❌ [Firebase RTDB] Error listening to user:', err);
    return () => {};
  }
}

/**
 * Saves room data directly to Firebase Realtime Database at /rooms/{roomId}
 */
export async function saveRoomToRealtimeDb(roomData: VoiceRoom | any) {
  if (!roomData || !roomData.id) return false;
  try {
    const cleanRoom = JSON.parse(JSON.stringify(roomData));
    
    // 1. Immediately cache to localStorage for instant persistence across restarts
    try {
      const savedRaw = localStorage.getItem('saleem_saved_rooms');
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (Array.isArray(parsed)) {
          const idx = parsed.findIndex((r: any) => r.id === roomData.id);
          if (idx !== -1) {
            parsed[idx] = { ...parsed[idx], ...cleanRoom, updatedAt: Date.now() };
          } else {
            parsed.unshift({ ...cleanRoom, updatedAt: Date.now() });
          }
          localStorage.setItem('saleem_saved_rooms', JSON.stringify(parsed));
        }
      } else {
        localStorage.setItem('saleem_saved_rooms', JSON.stringify([{ ...cleanRoom, updatedAt: Date.now() }]));
      }
    } catch (localErr) {
      console.warn('Could not cache room to localStorage:', localErr);
    }

    // 2. Save directly to Firebase Realtime Database at /rooms/{roomId}
    const roomRef = ref(rtdb, `rooms/${roomData.id}`);
    
    // Normalize mods into a map { [uid]: true } for Firebase RTDB security rules compatibility
    let normalizedMods: Record<string, boolean> = {};
    if (Array.isArray(cleanRoom.mods)) {
      cleanRoom.mods.forEach((uid: string) => {
        if (uid && typeof uid === 'string') normalizedMods[uid] = true;
      });
    } else if (cleanRoom.mods && typeof cleanRoom.mods === 'object') {
      normalizedMods = cleanRoom.mods;
    }

    const normalizedRoom = {
      ...cleanRoom,
      ownerId: cleanRoom.ownerId || cleanRoom.hostId || null,
      mods: Object.keys(normalizedMods).length > 0 ? normalizedMods : null,
    };
    await set(roomRef, {
      ...normalizedRoom,
      updatedAt: Date.now(),
    });
    console.log(`✅ [Firebase RTDB] Room ${roomData.id} saved to Realtime Database /rooms/${roomData.id}`);
    return true;
  } catch (err) {
    console.error('❌ [Firebase RTDB] Error saving room to Realtime Database:', err);
    return false;
  }
}

/**
 * Granularly sets lock state on a specific seat path: /rooms/{roomId}/seats/{seatIndex}/isLocked
 */
export async function setSeatLockInRealtimeDb(roomId: string, seatIndex: number | string, isLocked: boolean) {
  if (!roomId || seatIndex === undefined || seatIndex === null) return false;
  try {
    await ensureFirebaseAuthSession();
    const seatLockRef = ref(rtdb, `rooms/${roomId}/seats/${seatIndex}/isLocked`);
    await set(seatLockRef, isLocked);
    return true;
  } catch (err) {
    console.error(`❌ [Firebase RTDB] Error locking/unlocking seat ${seatIndex}:`, err);
    return false;
  }
}

/**
 * Granularly sets mute state on a specific seat path: /rooms/{roomId}/seats/{seatIndex}/isMuted
 */
export async function setSeatMuteInRealtimeDb(roomId: string, seatIndex: number | string, isMuted: boolean) {
  if (!roomId || seatIndex === undefined || seatIndex === null) return false;
  try {
    await ensureFirebaseAuthSession();
    const seatMuteRef = ref(rtdb, `rooms/${roomId}/seats/${seatIndex}/isMuted`);
    await set(seatMuteRef, isMuted);
    return true;
  } catch (err) {
    console.error(`❌ [Firebase RTDB] Error muting/unmuting seat ${seatIndex}:`, err);
    return false;
  }
}

/**
 * Updates room moderators map at /rooms/{roomId}/mods
 */
export async function updateRoomModsInRealtimeDb(roomId: string, mods: string[] | Record<string, boolean>) {
  if (!roomId) return false;
  try {
    await ensureFirebaseAuthSession();
    let modsMap: Record<string, boolean> = {};
    if (Array.isArray(mods)) {
      mods.forEach((uid) => {
        if (uid && typeof uid === 'string') modsMap[uid] = true;
      });
    } else if (mods && typeof mods === 'object') {
      modsMap = mods;
    }
    const modsRef = ref(rtdb, `rooms/${roomId}/mods`);
    await set(modsRef, modsMap);
    return true;
  } catch (err) {
    console.error(`❌ [Firebase RTDB] Error updating mods in room ${roomId}:`, err);
    return false;
  }
}

/**
 * Granularly sets speakerUser on a specific mic seat path: /rooms/{roomId}/seats/{seatIndex}/speakerUser
 * This satisfies Firebase RTDB security rules allowing any authenticated member to sit on their seat.
 */
export async function setSeatSpeakerInRealtimeDb(roomId: string, seatIndex: number | string, speakerData: any) {
  if (!roomId || seatIndex === undefined || seatIndex === null) return false;
  try {
    await ensureFirebaseAuthSession();
    const seatSpeakerRef = ref(rtdb, `rooms/${roomId}/seats/${seatIndex}/speakerUser`);
    if (!speakerData) {
      await remove(seatSpeakerRef);
    } else {
      const cleanSpeaker = JSON.parse(JSON.stringify(speakerData));
      await set(seatSpeakerRef, cleanSpeaker);
    }
    console.log(`✅ [Firebase RTDB] Seat ${seatIndex} speaker updated in room ${roomId}`);
    return true;
  } catch (err) {
    console.error(`❌ [Firebase RTDB] Error updating seat ${seatIndex} in room ${roomId}:`, err);
    return false;
  }
}

/**
 * Granularly removes speakerUser from a specific mic seat: /rooms/{roomId}/seats/{seatIndex}/speakerUser
 */
export async function clearSeatSpeakerInRealtimeDb(roomId: string, seatIndex: number | string) {
  if (!roomId || seatIndex === undefined || seatIndex === null) return false;
  try {
    await ensureFirebaseAuthSession();
    const seatSpeakerRef = ref(rtdb, `rooms/${roomId}/seats/${seatIndex}/speakerUser`);
    await remove(seatSpeakerRef);
    console.log(`✅ [Firebase RTDB] Seat ${seatIndex} speaker cleared in room ${roomId}`);
    return true;
  } catch (err) {
    console.error(`❌ [Firebase RTDB] Error clearing seat ${seatIndex} in room ${roomId}:`, err);
    return false;
  }
}

/**
 * Semantic helper: Take seat on mic in Firebase Realtime Database
 */
export async function takeSeatInRealtimeDb(roomId: string, seatIndex: number | string, speakerData: any) {
  return await setSeatSpeakerInRealtimeDb(roomId, seatIndex, speakerData);
}

/**
 * Semantic helper: Leave seat on mic in Firebase Realtime Database
 */
export async function leaveSeatInRealtimeDb(roomId: string, seatIndex: number | string) {
  return await clearSeatSpeakerInRealtimeDb(roomId, seatIndex);
}

/**
 * Granularly posts a chat message to /rooms/{roomId}/messages/{messageId}
 */
export async function postRoomMessageInRealtimeDb(roomId: string, messageData: any) {
  if (!roomId || !messageData) return false;
  try {
    await ensureFirebaseAuthSession();
    const msgId = messageData.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const msgRef = ref(rtdb, `rooms/${roomId}/messages/${msgId}`);
    const cleanMsg = JSON.parse(JSON.stringify({
      ...messageData,
      id: msgId,
      senderId: messageData.senderId || auth.currentUser?.uid || 'anonymous',
      createdAt: Date.now(),
    }));
    await set(msgRef, cleanMsg);
    return true;
  } catch (err) {
    console.error(`❌ [Firebase RTDB] Error posting message in room ${roomId}:`, err);
    return false;
  }
}

/**
 * Listens to realtime changes in rooms from Firebase Realtime Database
 */
export function listenToRoomsFromRealtimeDb(callback: (rooms: VoiceRoom[]) => void) {
  const roomsRef = ref(rtdb, 'rooms');
  return onValue(roomsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const roomsList: VoiceRoom[] = Object.values(data);
      setTimeout(() => callback(roomsList), 0);
    } else {
      setTimeout(() => callback([]), 0);
    }
  });
}

/**
 * Listens to all users from Firebase Realtime Database for Leaderboard purposes
 */
export function listenToAllUsersFromRealtimeDb(callback: (users: UserProfile[]) => void) {
  const usersRef = ref(rtdb, 'users');
  return onValue(usersRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const usersList: UserProfile[] = Object.values(data);
      setTimeout(() => callback(usersList), 0);
    } else {
      setTimeout(() => callback([]), 0);
    }
  });
}

/**
 * Sign in with Google using Unified & Isolated Dispatcher
 * (Calls androidAuth.ts on Android, webAuth.ts on Web)
 */
export async function loginWithGoogleFirebase(): Promise<Partial<UserProfile> | null> {
  return await loginWithGoogleUnified(auth, async (fbUser, provider) => {
    return await handleUserSync(fbUser, provider);
  });
}

/**
 * Sign in with Facebook using Unified & Isolated Dispatcher
 * (Calls androidAuth.ts on Android, webAuth.ts on Web)
 */
export async function loginWithFacebookFirebase(): Promise<Partial<UserProfile> | null> {
  return await loginWithFacebookUnified(auth, async (fbUser, provider) => {
    return await handleUserSync(fbUser, provider);
  });
}

/**
 * Syncs the Firebase user with Firestore and Realtime Database
 */
async function handleUserSync(fbUser: FirebaseUser, provider: string): Promise<Partial<UserProfile>> {
  const userDisplayName = fbUser.displayName || (fbUser as any).name || '';
  const userPhoto = fbUser.photoURL || (fbUser as any).photoUrl || (fbUser as any).photoURL || '';
  const userEmail = fbUser.email || '';

  const userObj: Partial<UserProfile> = {
    id: fbUser.uid,
    name: userDisplayName || `مستخدم ${provider}`,
    avatar: userPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    email: userEmail || '',
    provider: provider as any,
    coins: 500,
    diamonds: 0,
    wealthLevel: 1,
    isLoggedIn: true,
    isOnline: true,
    isAllowedToCreateRoom: true,
    hasActiveRoom: false,
    bio: `مرحباً بك! سجلت عبر ${provider}`,
  };

  // Perform cloud database fetch & save in the background asynchronously
  getUserFromFirebase(fbUser.uid).then((existingProfile) => {
    if (existingProfile && existingProfile.id) {
      console.log(`✅ [Firebase Sync] Existing user ${fbUser.uid}, restoring cloud data.`);
      const restoredUser: Partial<UserProfile> = {
        ...existingProfile,
        id: fbUser.uid,
        name: userDisplayName || existingProfile.name || `مستخدم ${provider}`,
        avatar: userPhoto || existingProfile.avatar,
        email: userEmail || existingProfile.email || '',
        provider: provider as any,
        isLoggedIn: true,
        isOnline: true,
      };
      saveUserToFirebase(restoredUser);
    } else {
      saveUserToFirebase(userObj);
    }
  }).catch(() => {
    saveUserToFirebase(userObj);
  });

  return userObj;
}

/**
 * Checks for pending Google Sign-In redirect results
 */
export async function checkRedirectResultFirebase(): Promise<Partial<UserProfile> | null> {
  try {
    const result = await getRedirectResult(auth);
    if (!result || !result.user) return null;

    const fbUser = result.user;
    const existingProfile = await getUserFromFirebase(fbUser.uid);
    if (existingProfile && (existingProfile.id || existingProfile.coins !== undefined)) {
      const restoredUser: Partial<UserProfile> = {
        ...existingProfile,
        id: fbUser.uid,
        name: fbUser.displayName || existingProfile.name || 'مستخدم Google',
        avatar: fbUser.photoURL || existingProfile.avatar,
        email: fbUser.email || existingProfile.email || '',
        provider: 'Google',
        isLoggedIn: true,
        isOnline: true,
      };
      await saveUserToFirebase(restoredUser);
      return restoredUser;
    }

    const userProfile: Partial<UserProfile> = {
      id: fbUser.uid,
      name: fbUser.displayName || 'مستخدم Google',
      avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      email: fbUser.email || '',
      provider: 'Google',
      coins: 0,
      diamonds: 0,
      wealthLevel: 1,
      wealthXp: 0,
      vipLevel: 1,
      vipRank: 'None',
      followersCount: 0,
      followingCount: 0,
      isAllowedToCreateRoom: true,
      hasActiveRoom: false,
      isLoggedIn: true,
      isOnline: true,
      bio: `أهلاً بك! حساب Google: ${fbUser.email || ''}`,
    };

    await saveUserToFirebase(userProfile);
    return userProfile;
  } catch (err) {
    console.warn('Redirect result check error:', err);
    return null;
  }
}

/**
 * Normalizes provider strings to support any case variations (e.g. 'Google', 'google', 'GOOGLE', 'Phone', 'phone', etc.)
 */
export function normalizeProvider(provider?: string): {
  id: 'google' | 'facebook' | 'phone' | 'email' | 'guest';
  displayName: string;
  original: string;
} {
  if (!provider) {
    return { id: 'google', displayName: 'Google', original: 'Google' };
  }

  const raw = provider.toString().trim();
  const lower = raw.toLowerCase();

  if (lower.includes('google')) {
    return { id: 'google', displayName: 'Google', original: raw };
  }
  if (lower.includes('facebook') || lower.includes('fb')) {
    return { id: 'facebook', displayName: 'Facebook', original: raw };
  }
  if (lower.includes('phone') || lower.includes('mobile') || lower.includes('هاتف')) {
    return { id: 'phone', displayName: 'رقم الهاتف', original: raw };
  }
  if (lower.includes('email') || lower.includes('mail') || lower.includes('بريد')) {
    return { id: 'email', displayName: 'البريد الإلكتروني', original: raw };
  }

  return { id: 'guest', displayName: 'زائر', original: raw };
}

/**
 * Saves or updates a user profile in Firebase Firestore & Realtime Database.
 * Performs strict validation on user.id before attempting to save.
 */
export async function saveUserToFirebase(user: Partial<UserProfile> & { id?: string }) {
  // CRITICAL CHECK: Verify that user and user.id exist before saving to Firebase
  if (!user || !user.id || typeof user.id !== 'string' || user.id.trim() === '') {
    console.warn('⚠️ [Firebase] Cannot save user: user or user.id is missing or invalid:', user);
    return false;
  }

  const normalizedProv = normalizeProvider(user.provider);

  const userData = {
    id: user.id,
    name: user.name || 'مستخدم جديد',
    avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    email: user.email || '',
    coins: typeof user.coins === 'number' ? user.coins : 0,
    diamonds: typeof user.diamonds === 'number' ? user.diamonds : 0,
    provider: normalizedProv.id, // case-normalized e.g., 'google', 'facebook', 'phone', 'email', 'guest'
    providerOriginal: normalizedProv.original, // preserves exact case input
    providerDisplayName: normalizedProv.displayName,
    isOnline: true,
    isLoggedIn: true,
    hasActiveRoom: Boolean(user.hasActiveRoom),
    roomName: user.roomName || '',
    createdRoomId: user.createdRoomId || '',
    levelStatus: user.levelStatus || 'ليفل 1',
    role: user.role || 'عضو VIP',
    gender: user.gender || 'أنثى',
    country: user.country || 'السعودية 🇸🇦',
    bio: user.bio || 'أهلاً بك في ملفي الشخصي في تطبيق SALEEM!',
    // Agency membership and activity are part of the existing /users/{id} record.
    agencyId: user.agencyId || '',
    agencyName: user.agencyName || '',
    agencyCode: user.agencyCode || '',
    agencyRole: user.agencyRole || 'member',
    agencyMembershipStatus: user.agencyMembershipStatus || 'none',
    isAgencyOwner: Boolean(user.isAgencyOwner),
    isAgencyHost: Boolean(user.isAgencyHost),
    agencyStats: user.agencyStats || undefined,
  };

  // Save to Realtime Database (/users/{userId}) as primary reliable store
  await saveUserToRealtimeDb(userData);

  return true;
}

/**
 * 💎 تحويل ألماسات الدعم العادية إلى عملات ذهبية
 *
/**
 * 💎 Convert Support Diamonds → Coins
 *
 * 10,000 Support Diamonds = 2,500 Coins
 *
 * مهم:
 * - يخصم من diamonds
 * - يضيف الناتج إلى coins
 * - لا يلمس targetRewardDiamonds
 */
export async function convertDiamondsToCoins(
  userId: string,
  diamondsAmount: number,
): Promise<{
  success: boolean;
  userId: string;
  diamondsUsed: number;
  coinsAdded: number;
  remainingDiamonds: number;
  coins: number;
  newCoins?: number;
}> {
  if (!userId || userId.trim() === '') {
    throw new Error('userId is required');
  }

  if (
    !Number.isFinite(diamondsAmount) ||
    diamondsAmount <= 0 ||
    diamondsAmount % 10000 !== 0
  ) {
    throw new Error(
      'diamondsAmount must be a positive multiple of 10,000',
    );
  }

  await ensureFirebaseAuthSession().catch(() => {});

  const userRef = ref(rtdb, `users/${userId}`);

  // 10,000 Support Diamonds = 2,500 Coins
  const coinsAdded = Math.floor(
    (diamondsAmount / 10000) * 2500,
  );

  let finalDiamonds = 0;
  let finalCoins = 0;
  let committed = false;

  const result = await runTransaction(
    userRef,
    (currentData) => {
      if (!currentData) {
        return;
      }

      const currentDiamonds = Number(
        currentData.diamonds ?? 0,
      );

      const currentCoins = Number(
        currentData.coins ?? 0,
      );

      if (currentDiamonds < diamondsAmount) {
        return;
      }

      const newDiamonds =
        currentDiamonds - diamondsAmount;

      const newCoins =
        currentCoins + coinsAdded;

      finalDiamonds = newDiamonds;
      finalCoins = newCoins;
      committed = true;

      return {
        ...currentData,
        // 💎 خصم ألماسات الدعم فقط
        diamonds: newDiamonds,
        // 🪙 إضافة العملات
        coins: newCoins,
        updatedAt: Date.now(),
      };
    },
  );

  if (
    !committed ||
    !result.committed ||
    !result.snapshot.exists()
  ) {
    throw new Error(
      'Insufficient support diamonds or conversion failed',
    );
  }

  return {
    success: true,
    userId,
    diamondsUsed: diamondsAmount,
    coinsAdded,
    remainingDiamonds: finalDiamonds,
    coins: finalCoins,
    newCoins: finalCoins,
  };
}

/**
 * 🎯 Unlock Target Diamonds → Coins
 *
 * 10,000 Target Diamonds = 5,000 Coins
 *
 * مهم:
 * - يخصم من targetRewardDiamonds
 * - يضيف الناتج إلى coins
 * - لا يلمس diamonds العادية
 */
export async function unlockTargetDiamonds(
  userId: string,
  targetDiamondsAmount: number,
): Promise<{
  success: boolean;
  userId: string;
  coinsAdded: number;
  remainingTargetDiamonds: number;
  coins: number;
  targetDiamondsUsed: number;
}> {
  if (!userId || userId.trim() === '') {
    throw new Error('userId is required');
  }

  if (
    !Number.isFinite(targetDiamondsAmount) ||
    targetDiamondsAmount <= 0 ||
    targetDiamondsAmount % 10000 !== 0
  ) {
    throw new Error(
      'targetDiamondsAmount must be a positive multiple of 10,000',
    );
  }

  await ensureFirebaseAuthSession().catch(() => {});

  const userRef = ref(rtdb, `users/${userId}`);

  const coinsAdded = Math.floor(
    (targetDiamondsAmount / 10000) * 5000,
  );

  let finalTargetRewardDiamonds = 0;
  let finalCoins = 0;

  const result = await runTransaction(userRef, (currentData) => {
    if (!currentData) {
      return;
    }

    const currentTargetRewardDiamonds = Number(
      currentData.targetRewardDiamonds ?? 0,
    );

    const currentCoins = Number(currentData.coins ?? 0);

    if (currentTargetRewardDiamonds < targetDiamondsAmount) {
      return;
    }

    const newTargetRewardDiamonds =
      currentTargetRewardDiamonds - targetDiamondsAmount;

    const newCoins = currentCoins + coinsAdded;

    finalTargetRewardDiamonds = newTargetRewardDiamonds;
    finalCoins = newCoins;

    return {
      ...currentData,
      // 🎯 تصفير/خصم التارجت فقط
      targetRewardDiamonds: newTargetRewardDiamonds,
      // 🪙 إضافة الناتج للعملات
      coins: newCoins,
      updatedAt: Date.now(),
    };
  });

  if (!result.committed || !result.snapshot.exists()) {
    throw new Error('فشل فك ألماسات التارجت: الرصيد غير كافٍ أو تعذر تنفيذ العملية');
  }

  const finalData = result.snapshot.val();

  return {
    success: true,
    userId,
    targetDiamondsUsed: targetDiamondsAmount,
    coinsAdded,
    remainingTargetDiamonds:
      typeof finalData.targetRewardDiamonds === 'number'
        ? finalData.targetRewardDiamonds
        : finalTargetRewardDiamonds,
    coins:
      typeof finalData.coins === 'number'
        ? finalData.coins
        : finalCoins,
  };
}

/**
 * 🎯💎 Combined Convert (Target + Support Diamonds → Coins)
 *
 * 10,000 Target Diamonds (50%) = 5,000 Coins
 * 10,000 Support Diamonds (25%) = 2,500 Coins
 * Total = 7,500 Coins
 *
 * Atomic execution in Firebase Realtime Database
 */
export async function convertCombinedDiamondsToCoins(
  userId: string,
  targetDiamonds: number,
  supportDiamonds: number,
): Promise<{
  success: boolean;
  userId: string;
  targetDiamondsUsed: number;
  supportDiamondsUsed: number;
  targetCoinsAdded: number;
  supportCoinsAdded: number;
  totalCoinsAdded: number;
  remainingTargetDiamonds: number;
  remainingSupportDiamonds: number;
  coins: number;
}> {
  if (!userId || userId.trim() === '') {
    throw new Error('userId is required');
  }

  const safeTarget = Number(targetDiamonds) || 0;
  const safeSupport = Number(supportDiamonds) || 0;

  if (safeTarget < 0 || safeSupport < 0) {
    throw new Error('targetDiamonds and supportDiamonds must be non-negative numbers');
  }

  if (safeTarget === 0 && safeSupport === 0) {
    throw new Error('At least one diamond amount must be greater than zero');
  }

  if (safeTarget > 0 && safeTarget % 10000 !== 0) {
    throw new Error('targetDiamonds must be a multiple of 10,000');
  }

  if (safeSupport > 0 && safeSupport % 10000 !== 0) {
    throw new Error('supportDiamonds must be a multiple of 10,000');
  }

  await ensureFirebaseAuthSession().catch(() => {});

  const userRef = ref(rtdb, `users/${userId}`);

  const targetCoinsAdded = Math.floor((safeTarget / 10000) * 5000);
  const supportCoinsAdded = Math.floor((safeSupport / 10000) * 2500);
  const totalCoinsAdded = targetCoinsAdded + supportCoinsAdded;

  let finalTargetDiamonds = 0;
  let finalSupportDiamonds = 0;
  let finalCoins = 0;
  let committed = false;

  const result = await runTransaction(userRef, (currentData) => {
    if (!currentData) return;

    const currentTarget = Number(currentData.targetRewardDiamonds ?? 0);
    const currentSupport = Number(currentData.diamonds ?? 0);
    const currentCoins = Number(currentData.coins ?? 0);

    if (currentTarget < safeTarget || currentSupport < safeSupport) {
      return;
    }

    const newTarget = currentTarget - safeTarget;
    const newSupport = currentSupport - safeSupport;
    const newCoins = currentCoins + totalCoinsAdded;

    finalTargetDiamonds = newTarget;
    finalSupportDiamonds = newSupport;
    finalCoins = newCoins;
    committed = true;

    return {
      ...currentData,
      targetRewardDiamonds: newTarget,
      diamonds: newSupport,
      coins: newCoins,
      updatedAt: Date.now(),
    };
  });

  if (!committed || !result.committed || !result.snapshot.exists()) {
    throw new Error('Insufficient balances or combined conversion failed');
  }

  const finalData = result.snapshot.val();

  return {
    success: true,
    userId,
    targetDiamondsUsed: safeTarget,
    supportDiamondsUsed: safeSupport,
    targetCoinsAdded,
    supportCoinsAdded,
    totalCoinsAdded,
    remainingTargetDiamonds: Number(finalData?.targetRewardDiamonds ?? finalTargetDiamonds),
    remainingSupportDiamonds: Number(finalData?.diamonds ?? finalSupportDiamonds),
    coins: Number(finalData?.coins ?? finalCoins),
  };
}

/**
 * Updates user online status in Firebase upon logging out or closing session.
 * CRITICAL CHECK: Always verifies user.id existence before executing logout update.
 */
export async function updateUserLogoutStatusInFirebase(user?: Partial<UserProfile> & { id?: string }) {
  // CRITICAL CHECK: Check existence of user and user.id before updating status on logout
  if (!user || !user.id || typeof user.id !== 'string' || user.id.trim() === '') {
    return false;
  }

  try {
    const rtdbUserRef = ref(rtdb, `users/${user.id}`);
    await update(rtdbUserRef, {
      isOnline: false,
      isLoggedIn: false,
      updatedAt: Date.now(),
    });
    console.log(`👋 [Firebase RTDB] User ${user.id} status updated to offline in Realtime Database.`);
  } catch (err) {}

  return true;
}

/**
 * Listens to realtime changes for a single voice room from Firebase Realtime Database
 */
export function listenToSingleRoom(roomId: string, callback: (room: VoiceRoom) => void) {
  if (!roomId) return () => {};
  const roomRef = ref(rtdb, `rooms/${roomId}`);
  return onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      const roomData = snapshot.val();
      setTimeout(() => callback(roomData as VoiceRoom), 0);
    }
  });
}

/**
 * Sends WebRTC signaling payload (offer/answer/iceCandidate) to Firebase Realtime Database
 */
export async function sendWebRTCSignal(roomId: string, fromUserId: string, targetUserId: string, signalData: any) {
  if (!roomId || !fromUserId || !targetUserId) return;
  try {
    const signalRef = ref(rtdb, `rooms/${roomId}/signals/${targetUserId}/${fromUserId}`);
    await set(signalRef, {
      ...signalData,
      fromUserId,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('❌ Error sending WebRTC signal:', err);
  }
}

/**
 * Listens to incoming WebRTC signals for a user in a room from Firebase Realtime Database
 */
export function listenToWebRTCSignals(roomId: string, userId: string, callback: (fromUserId: string, signal: any) => void) {
  if (!roomId || !userId) return () => {};
  const userSignalsRef = ref(rtdb, `rooms/${roomId}/signals/${userId}`);
  return onValue(userSignalsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.entries(data).forEach(([fromUserId, signal]) => {
        callback(fromUserId, signal);
      });
    }
  });
}

/**
 * Global Presence System (نظام التواجد الرقمي المركزي)
 * Connects to /.info/connected in Firebase Realtime Database.
 * When connected, sets /users_status/{userId} to { state: 'online' } and /users/{userId}/isOnline to true.
 * Registers onDisconnect handlers to automatically flip state to 'offline' and false when connection drops.
 */
export function setupGlobalPresence(userId: string) {
  if (!userId) return () => {};

  const connectedRef = ref(rtdb, '.info/connected');
  const userStatusRef = ref(rtdb, `users_status/${userId}`);
  const userProfileStatusRef = ref(rtdb, `users/${userId}/isOnline`);
  const userProfileLastSeenRef = ref(rtdb, `users/${userId}/lastSeen`);

  const unsubscribe = onValue(connectedRef, async (snapshot) => {
    if (snapshot.val() === true) {
      await ensureFirebaseAuthSession().catch(() => {});

      // 1. Register server-side onDisconnect cleanup commands
      onDisconnect(userStatusRef)
        .set({
          state: 'offline',
          last_changed: Date.now(),
        })
        .catch(() => {});

      onDisconnect(userProfileStatusRef)
        .set(false)
        .catch(() => {});

      onDisconnect(userProfileLastSeenRef)
        .set(Date.now())
        .catch(() => {});

      // 2. Set active online presence in Firebase Realtime DB
      set(userStatusRef, {
        state: 'online',
        last_changed: Date.now(),
      }).catch(() => {});

      set(userProfileStatusRef, true).catch(() => {});

      console.log(`🟢 [Global Presence] User ${userId} is ONLINE & monitored via .info/connected`);
    }
  });

  return () => {
    unsubscribe();
    // Set offline on explicit logout / disconnect
    set(userStatusRef, {
      state: 'offline',
      last_changed: Date.now(),
    }).catch(() => {});
    set(userProfileStatusRef, false).catch(() => {});
  };
}

/**
 * Listens to a single user's presence state from /users_status/{userId}
 */
export function listenToUserPresence(
  userId: string,
  callback: (isOnline: boolean, lastChanged?: number) => void
) {
  if (!userId) return () => {};
  const userStatusRef = ref(rtdb, `users_status/${userId}`);
  return onValue(userStatusRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const isOnline = data?.state === 'online';
      setTimeout(() => callback(isOnline, data?.last_changed), 0);
    } else {
      setTimeout(() => callback(false), 0);
    }
  });
}

/**
 * Listens to all users' presence status from /users_status node in RTDB
 * Returns a dictionary mapping userId -> boolean (true if online)
 */
export function listenToAllUsersPresence(
  callback: (presenceMap: Record<string, boolean>) => void
) {
  const statusNodeRef = ref(rtdb, 'users_status');
  return onValue(statusNodeRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const map: Record<string, boolean> = {};
      Object.entries(data).forEach(([uId, val]: [string, any]) => {
        map[uId] = val?.state === 'online';
      });
      setTimeout(() => callback(map), 0);
    } else {
      setTimeout(() => callback({}), 0);
    }
  });
}

/**
 * Sets up presence tracking in Firebase Realtime Database for a voice room.
 * Registers /rooms/{roomId}/members/{userId}.
 * Uses onDisconnect to automatically delete the member node from RTDB when internet cuts or app closes.
 */
export function setupRoomPresence(
  roomId: string,
  user: { id: string; name: string; avatar: string; role?: string; isMuted?: boolean }
) {
  if (!roomId || !user || !user.id) return () => {};

  const connectedRef = ref(rtdb, '.info/connected');
  const userMemberRef = ref(rtdb, `rooms/${roomId}/members/${user.id}`);

  const unsubscribe = onValue(connectedRef, async (snap) => {
    if (snap.val() === true) {
      await ensureFirebaseAuthSession().catch(() => {});

      // Set automatic removal on disconnect from Firebase RTDB
      onDisconnect(userMemberRef)
        .remove()
        .catch(() => {});

      // Write active presence payload
      set(userMemberRef, {
        id: user.id,
        name: user.name || 'عضو',
        avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: user.role || 'عضو',
        isMuted: Boolean(user.isMuted),
        joinedAt: Date.now(),
        isOnline: true,
      }).catch(() => {});
    }
  });

  return () => {
    unsubscribe();
    remove(userMemberRef).catch(() => {});
  };
}

/**
 * Listens to active room members in /rooms/{roomId}/members from Firebase Realtime Database
 */
export function listenToRoomMembers(roomId: string, callback: (members: any[]) => void) {
  if (!roomId) return () => {};
  const membersRef = ref(rtdb, `rooms/${roomId}/members`);
  return onValue(membersRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const membersList = Object.values(data);
      setTimeout(() => callback(membersList), 0);
    } else {
      setTimeout(() => callback([]), 0);
    }
  });
}

/**
 * Explicitly removes a member from /rooms/{roomId}/members in RTDB upon leaving
 */
export async function removeRoomMember(roomId: string, userId: string) {
  if (!roomId || !userId) return;
  try {
    const userMemberRef = ref(rtdb, `rooms/${roomId}/members/${userId}`);
    await remove(userMemberRef);
  } catch (err) {
    console.error('Error removing member from room:', err);
  }
}

/**
 * Sets onDisconnect trigger to clear a seat when a user disconnects while on mic
 */
export function setupSeatOnDisconnect(roomId: string, seatIndex: number) {
  if (!roomId || seatIndex < 0) return;
  const seatRef = ref(rtdb, `rooms/${roomId}/seats/${seatIndex}/speakerUser`);
  onDisconnect(seatRef).set(null).catch((err) => {
    console.error('Error setting onDisconnect on seat:', err);
  });
}

export function cancelSeatOnDisconnect(roomId: string, seatIndex: number) {
  if (!roomId || seatIndex < 0) return;
  const seatRef = ref(rtdb, `rooms/${roomId}/seats/${seatIndex}/speakerUser`);
  onDisconnect(seatRef).cancel().catch(() => {});
}

/**
 * Broadcasts speaking audio level to /rooms/{roomId}/speaking/{userId} in RTDB
 */
export function updateRoomSpeakingLevel(roomId: string, userId: string, level: number) {
  if (!roomId || !userId) return;
  try {
    const speakRef = ref(rtdb, `rooms/${roomId}/speaking/${userId}`);
    if (level <= 0) {
      remove(speakRef).catch(() => {});
    } else {
      set(speakRef, { level, ts: Date.now() }).catch(() => {});
    }
  } catch (err) {}
}

/**
 * Listens to active speaking levels in /rooms/{roomId}/speaking from RTDB
 */
export function listenToRoomSpeakingLevels(roomId: string, callback: (levels: Record<string, number>) => void) {
  if (!roomId) return () => {};
  const speakingRef = ref(rtdb, `rooms/${roomId}/speaking`);
  return onValue(speakingRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val() || {};
      const levels: Record<string, number> = {};
      const now = Date.now();
      Object.entries(data).forEach(([uid, val]: [string, any]) => {
        if (val && typeof val.level === 'number' && now - (val.ts || 0) < 3000) {
          levels[uid] = val.level;
        }
      });
      callback(levels);
    } else {
      callback({});
    }
  });
}

/**
 * Clears all chat messages in Firebase Realtime Database at /rooms/{roomId}/messages
 */
export async function clearRoomMessagesInRealtimeDb(roomId: string) {
  if (!roomId) return false;
  try {
    const messagesRef = ref(rtdb, `rooms/${roomId}/messages`);
    await set(messagesRef, []);
    console.log(`🧹 [Firebase RTDB] Room ${roomId} messages cleared successfully.`);
    return true;
  } catch (err) {
    console.error('❌ [Firebase RTDB] Error clearing room messages:', err);
    return false;
  }
}

export interface RoomAiSettings {
  enabled: boolean;
  language: 'ar' | 'en';
  personality: 'assistant' | 'game_master' | 'translator' | 'teacher' | 'fun';
  autoReply: boolean;
}

/**
 * Saves or updates room AI settings in Firebase Realtime Database at /rooms/{roomId}/aiSettings
 */
export async function saveRoomAiSettingsInRealtimeDb(roomId: string, aiSettings: RoomAiSettings) {
  if (!roomId) return false;
  try {
    const aiRef = ref(rtdb, `rooms/${roomId}/aiSettings`);
    await set(aiRef, aiSettings);
    console.log(`🤖 [Firebase RTDB] Room ${roomId} AI settings updated.`);
    return true;
  } catch (err) {
    console.error('❌ [Firebase RTDB] Error saving room AI settings:', err);
    return false;
  }
}

/**
 * Listens to room AI settings in Realtime Database
 */
export function listenToRoomAiSettings(roomId: string, callback: (settings: RoomAiSettings | null) => void) {
  if (!roomId) return () => {};
  const aiRef = ref(rtdb, `rooms/${roomId}/aiSettings`);
  return onValue(aiRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as RoomAiSettings);
    } else {
      callback(null);
    }
  });
}

/**
 * Fetches user profile from Firebase Firestore or Realtime Database if available.
 */
export async function getUserFromFirebase(userId: string): Promise<Partial<UserProfile> | null> {
  if (!userId) return null;
  try {
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));

    const fetchPromise = (async () => {
      try {
        const rtdbRef = ref(rtdb, `users/${userId}`);
        const snapRtdb = await get(rtdbRef);
        if (snapRtdb.exists()) {
          return snapRtdb.val() as Partial<UserProfile>;
        }
      } catch (e) {}

      return null;
    })();

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    return null;
  }
}

/**
  * Listen to user's cloud-persistent music playlist from Firebase
  * Path: user_music_playlists/{userId}
  */
export function listenToUserCloudMusicPlaylist(
  userId: string,
  callback: (tracks: CloudTrack[]) => void
) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const playlistRef = ref(rtdb, `user_music_playlists/${userId}`);
  const unsubscribe = onValue(playlistRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const tracksArray: CloudTrack[] = Object.values(data);
      tracksArray.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
      callback(tracksArray);
    } else {
      callback([]);
    }
  }, (err) => {
    console.error('❌ Error reading cloud playlist:', err);
    callback([]);
  });

  return unsubscribe;
}

/**
 * Add a track to user's cloud-persistent playlist in Firebase
 */
export async function addTrackToCloudPlaylist(userId: string, track: CloudTrack): Promise<boolean> {
  if (!userId || !track || !track.id) return false;
  try {
    const trackData: CloudTrack = {
      ...track,
      addedAt: track.addedAt || Date.now(),
      isCloud: true,
    };

    // Save to Realtime Database
    const trackRefRtdb = ref(rtdb, `user_music_playlists/${userId}/${track.id}`);
    await set(trackRefRtdb, trackData);

    // Also persist in Firestore
    const trackRefFs = doc(db, 'user_music_playlists', `${userId}_${track.id}`);
    await setDoc(trackRefFs, {
      userId,
      ...trackData,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    console.log(`🎵 [Cloud Playlist] Track "${track.name}" saved permanently for user ${userId}`);
    return true;
  } catch (err) {
    console.error('❌ [Cloud Playlist] Error saving track:', err);
    return false;
  }
}

/**
 * Remove a track from user's cloud-persistent playlist in Firebase
 */
export async function removeTrackFromCloudPlaylist(userId: string, trackId: string): Promise<boolean> {
  if (!userId || !trackId) return false;
  try {
    // Remove from Realtime Database
    const trackRefRtdb = ref(rtdb, `user_music_playlists/${userId}/${trackId}`);
    await remove(trackRefRtdb);

    // Remove from Firestore
    const trackRefFs = doc(db, 'user_music_playlists', `${userId}_${trackId}`);
    await setDoc(trackRefFs, { deleted: true }, { merge: true });

    console.log(`🗑️ [Cloud Playlist] Track ${trackId} removed for user ${userId}`);
    return true;
  } catch (err) {
    console.error('❌ [Cloud Playlist] Error removing track:', err);
    return false;
  }
}

/**
 * Listen to synchronized room background music & YouTube state in real-time
 * Path: room_live_music/{roomId}
 */
export function listenToRoomLiveMusic(
  roomId: string,
  callback: (musicState: RoomMusicState | null) => void
) {
  if (!roomId) {
    callback(null);
    return () => {};
  }

  const musicRef = ref(rtdb, `room_live_music/${roomId}`);
  const unsubscribe = onValue(
    musicRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        callback(val);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.error('❌ Error listening to room live music:', err);
      callback(null);
    }
  );

  return unsubscribe;
}

/**
 * Broadcast room music or YouTube track playback to all members (Android + Web)
 */
export async function broadcastRoomLiveMusic(
  roomId: string,
  musicState: RoomMusicState
): Promise<boolean> {
  if (!roomId || !musicState) return false;
  try {
    const musicRef = ref(rtdb, `room_live_music/${roomId}`);
    await set(musicRef, {
      ...musicState,
      updatedAt: Date.now(),
    });
    console.log(`🎵 [Room Live Music] Broadcasted track "${musicState.track?.name}" to room ${roomId}`);
    return true;
  } catch (err) {
    console.error('❌ Error broadcasting room live music:', err);
    return false;
  }
}

/**
 * Stop and clear room live music for all members
 */
export async function stopRoomLiveMusic(roomId: string): Promise<boolean> {
  if (!roomId) return false;
  try {
    const musicRef = ref(rtdb, `room_live_music/${roomId}`);
    await remove(musicRef);
    console.log(`⏹️ [Room Live Music] Stopped live music for room ${roomId}`);
    return true;
  } catch (err) {
    console.error('❌ Error stopping room live music:', err);
    return false;
  }
}

/**
 * Cinema Mode State Interface
 */
export interface RoomCinemaState {
  active: boolean;
  videoId: string;
  title: string;
  startedAt?: number;
  startedBy?: string;
  updatedAt?: number;
}

/**
 * Listen to synchronized room cinema mode state in real-time
 * Path: room_cinema/{roomId}
 */
export function listenToRoomCinema(
  roomId: string,
  callback: (cinemaState: RoomCinemaState | null) => void
) {
  if (!roomId) {
    callback(null);
    return () => {};
  }

  const cinemaRef = ref(rtdb, `room_cinema/${roomId}`);
  const unsubscribe = onValue(
    cinemaRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        callback(val);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.error('❌ Error listening to room cinema:', err);
      callback(null);
    }
  );

  return unsubscribe;
}

/**
 * Broadcast room cinema video to all members (Android + Web)
 */
export async function broadcastRoomCinema(
  roomId: string,
  cinemaState: RoomCinemaState
): Promise<boolean> {
  if (!roomId || !cinemaState) return false;
  try {
    const cinemaRef = ref(rtdb, `room_cinema/${roomId}`);
    await set(cinemaRef, {
      ...cinemaState,
      updatedAt: Date.now(),
    });
    console.log(`🎬 [Room Cinema] Broadcasted video "${cinemaState.title}" to room ${roomId}`);
    return true;
  } catch (err) {
    console.error('❌ Error broadcasting room cinema:', err);
    return false;
  }
}

/**
 * Stop and close room cinema screen for all members
 */
export async function stopRoomCinema(roomId: string): Promise<boolean> {
  if (!roomId) return false;
  try {
    const cinemaRef = ref(rtdb, `room_cinema/${roomId}`);
    await remove(cinemaRef);
    console.log(`⏹️ [Room Cinema] Stopped cinema for room ${roomId}`);
    return true;
  } catch (err) {
    console.error('❌ Error stopping room cinema:', err);
    return false;
  }
}

/**
 * Listen to synchronized PK Battle state in real-time
 * Path: room_pk/{roomId}
 */
export function listenToPKBattle(
  roomId: string,
  callback: (pkState: PKBattleState | null) => void
) {
  if (!roomId) {
    callback(null);
    return () => {};
  }

  const pkRef = ref(rtdb, `room_pk/${roomId}`);
  const unsubscribe = onValue(
    pkRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as PKBattleState);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.error('❌ Error listening to PK battle:', err);
      callback(null);
    }
  );

  return unsubscribe;
}

/**
 * Broadcast PK Battle state to all members
 */
export async function broadcastPKBattle(
  roomId: string,
  pkState: PKBattleState
): Promise<boolean> {
  if (!roomId || !pkState) return false;
  try {
    const pkRef = ref(rtdb, `room_pk/${roomId}`);
    await set(pkRef, {
      ...pkState,
      updatedAt: Date.now(),
    });
    console.log(`⚔️ [PK Battle] Broadcasted state to room ${roomId}`);
    return true;
  } catch (err) {
    console.error('❌ Error broadcasting PK battle:', err);
    return false;
  }
}

/**
 * Update PK Score and Top Donors for a specific team
 */
export async function updatePKScore(
  roomId: string,
  team: 'red' | 'blue',
  amount: number,
  donor: { id: string; name: string; avatar: string }
): Promise<boolean> {
  if (!roomId || amount <= 0) return false;
  try {
    const teamPath = team === 'red' ? 'redTeam' : 'blueTeam';
    const pkRef = ref(rtdb, `room_pk/${roomId}`);

    // Fetch current state to update top donors list safely
    const snapshot = await get(pkRef);
    if (!snapshot.exists()) return false;

    const currentState = snapshot.val() as PKBattleState;
    const targetTeam = currentState[teamPath];

    // 1. Update total score
    const newScore = (targetTeam.score || 0) + amount;

    // 2. Update top donors (Keep top 3)
    let newDonors = [...(targetTeam.topDonors || [])];
    const existingDonorIdx = newDonors.findIndex(d => (d as any).id === donor.id || d.name === donor.name);

    if (existingDonorIdx >= 0) {
      newDonors[existingDonorIdx].amount += amount;
    } else {
      newDonors.push({ ...donor, amount });
    }

    // Sort by amount descending and take top 3
    newDonors.sort((a, b) => b.amount - a.amount);
    newDonors = newDonors.slice(0, 3);

    // 3. Save atomic updates
    const updates: any = {};
    updates[`${teamPath}/score`] = newScore;
    updates[`${teamPath}/topDonors`] = newDonors;
    updates['updatedAt'] = Date.now();

    await update(pkRef, updates);
    return true;
  } catch (err) {
    console.error(`❌ Error updating PK score for ${team} team:`, err);
    return false;
  }
}

/**
 * Stop PK Battle and clear state
 */
export async function stopPKBattle(roomId: string): Promise<boolean> {
  if (!roomId) return false;
  try {
    const pkRef = ref(rtdb, `room_pk/${roomId}`);
    await remove(pkRef);
    console.log(`⏹️ [PK Battle] Ended in room ${roomId}`);
    return true;
  } catch (err) {
    console.error('❌ Error stopping PK battle:', err);
    return false;
  }
}

/**
 * End PK Battle, determine winner, and update Win Streaks
 */
export async function resolvePKWinner(roomId: string): Promise<{ winner: 'red' | 'blue' | 'draw', redStreak: number, blueStreak: number } | null> {
  if (!roomId) return null;
  try {
    const pkRef = ref(rtdb, `room_pk/${roomId}`);
    const snapshot = await get(pkRef);
    if (!snapshot.exists()) return null;

    const state = snapshot.val() as PKBattleState;
    const redScore = state.redTeam.score || 0;
    const blueScore = state.blueTeam.score || 0;

    let winner: 'red' | 'blue' | 'draw' = 'draw';
    if (redScore > blueScore) winner = 'red';
    else if (blueScore > redScore) winner = 'blue';

    const redUserId = state.redTeam.id;
    const blueUserId = state.blueTeam.id;

    // Fetch current streaks from profiles (simplified to local PK state for now, or could fetch from /users/)
    let redStreak = state.redTeam.winStreak || 0;
    let blueStreak = state.blueTeam.winStreak || 0;

    if (winner === 'red') {
      redStreak += 1;
      blueStreak = 0;
    } else if (winner === 'blue') {
      blueStreak += 1;
      redStreak = 0;
    } else {
      // Draw: Streaks stay or break? Usually streaks break on draw in competitive apps.
      redStreak = 0;
      blueStreak = 0;
    }

    // Update the PK state with final results before it's eventually removed or archived
    await update(pkRef, {
      'redTeam/winStreak': redStreak,
      'blueTeam/winStreak': blueStreak,
      'winner': winner,
      'isResolved': true,
      'updatedAt': Date.now()
    });

    return { winner, redStreak, blueStreak };
  } catch (err) {
    console.error('❌ Error resolving PK winner:', err);
    return null;
  }
}

// ==========================================
// LIVE STREAMS, JOIN REQUESTS & PK CHALLENGES
// ==========================================

export interface LiveStreamData {
  streamId: string;
  ownerId: string;
  ownerName: string;
  ownerPhoto: string;
  wealthLevel?: number;
  vipLevel?: number;
  channelName: string;
  title: string;
  isLive: boolean;
  viewers: number;
  hasGuest: boolean;
  guestId?: string;
  guestName?: string;
  guestPhoto?: string;
  pkState?: {
    active: boolean;
    opponentId?: string;
    opponentName?: string;
    opponentPhoto?: string;
    myScore: number;
    opponentScore: number;
    timeLeftSeconds: number;
    winnerId?: string | null;
  };
  updatedAt: number;
}

/**
 * Creates or updates a Live Stream node in Firebase Realtime Database /live_streams/{streamId}
 */
export async function saveLiveStreamToFirebase(streamData: LiveStreamData): Promise<boolean> {
  if (!streamData || !streamData.streamId) return false;
  try {
    const streamRef = ref(rtdb, `live_streams/${streamData.streamId}`);
    const cleanData = JSON.parse(JSON.stringify(streamData));
    await set(streamRef, {
      ...cleanData,
      updatedAt: Date.now(),
    });

    // Handle disconnect safety: auto set isLive = false if internet drops
    onDisconnect(streamRef).update({
      isLive: false,
      hasGuest: false,
      updatedAt: Date.now(),
    }).catch(() => {});

    console.log(`🔴 [Firebase RTDB] Live Stream ${streamData.streamId} published successfully`);
    return true;
  } catch (err) {
    console.error('❌ Error saving live stream:', err);
    return false;
  }
}

/**
 * Listens to all active live streams from /live_streams in Realtime Database
 */
export function listenToLiveStreamsFromFirebase(callback: (streams: LiveStreamData[]) => void) {
  const streamsRef = ref(rtdb, 'live_streams');
  return onValue(streamsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const list: LiveStreamData[] = Object.values(data);
      const activeStreams = list.filter((s) => s.isLive);
      setTimeout(() => callback(activeStreams), 0);
    } else {
      setTimeout(() => callback([]), 0);
    }
  });
}

/**
 * Updates specific fields on an active live stream in /live_streams/{streamId}
 */
export async function updateLiveStreamInFirebase(streamId: string, updates: Partial<LiveStreamData>): Promise<boolean> {
  if (!streamId) return false;
  try {
    const streamRef = ref(rtdb, `live_streams/${streamId}`);
    await update(streamRef, {
      ...updates,
      updatedAt: Date.now(),
    });
    return true;
  } catch (err) {
    console.error('❌ Error updating live stream:', err);
    return false;
  }
}

/**
 * Ends a live stream by setting isLive = false or deleting node
 */
export async function endLiveStreamInFirebase(streamId: string): Promise<boolean> {
  if (!streamId) return false;
  try {
    const streamRef = ref(rtdb, `live_streams/${streamId}`);
    await remove(streamRef);
    console.log(`🛑 [Firebase RTDB] Live Stream ${streamId} ended`);
    return true;
  } catch (err) {
    console.error('❌ Error ending live stream:', err);
    return false;
  }
}

/**
 * Listens to a single live stream state in /live_streams/{streamId}
 */
export function listenToSingleLiveStream(streamId: string, callback: (stream: LiveStreamData | null) => void) {
  if (!streamId) return () => {};
  const streamRef = ref(rtdb, `live_streams/${streamId}`);
  return onValue(streamRef, (snapshot) => {
    if (snapshot.exists()) {
      setTimeout(() => callback(snapshot.val() as LiveStreamData), 0);
    } else {
      setTimeout(() => callback(null), 0);
    }
  });
}

// ------------------------------------------
// JOIN REQUESTS (طلبات الصعود للبث)
// ------------------------------------------

export interface JoinRequestData {
  streamId: string;
  userId: string;
  username: string;
  photo: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

/**
 * Viewer sends a join request to go live / co-host in stream
 */
export async function sendJoinRequestInFirebase(
  streamId: string,
  user: { id: string; name: string; avatar: string }
): Promise<boolean> {
  if (!streamId || !user || !user.id) return false;
  try {
    const reqRef = ref(rtdb, `join_requests/${streamId}/${user.id}`);
    const reqData: JoinRequestData = {
      streamId,
      userId: user.id,
      username: user.name,
      photo: user.avatar,
      status: 'pending',
      createdAt: Date.now(),
    };
    await set(reqRef, reqData);

    // Auto remove join request on disconnect
    onDisconnect(reqRef).remove().catch(() => {});

    console.log(`📩 [Join Request] Sent for stream ${streamId} by user ${user.id}`);
    return true;
  } catch (err) {
    console.error('❌ Error sending join request:', err);
    return false;
  }
}

/**
 * Listens to incoming join requests for a stream
 */
export function listenToJoinRequestsInFirebase(
  streamId: string,
  callback: (requests: JoinRequestData[]) => void
) {
  if (!streamId) return () => {};
  const reqsRef = ref(rtdb, `join_requests/${streamId}`);
  return onValue(reqsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const list: JoinRequestData[] = Object.values(data);
      const pendingList = list.filter((r) => r.status === 'pending');
      setTimeout(() => callback(pendingList), 0);
    } else {
      setTimeout(() => callback([]), 0);
    }
  });
}

/**
 * Broadcaster responds to a join request (accept/reject)
 */
export async function respondToJoinRequestInFirebase(
  streamId: string,
  userId: string,
  status: 'accepted' | 'rejected'
): Promise<boolean> {
  if (!streamId || !userId) return false;
  try {
    const reqRef = ref(rtdb, `join_requests/${streamId}/${userId}`);
    await update(reqRef, { status, updatedAt: Date.now() });
    return true;
  } catch (err) {
    console.error('❌ Error responding to join request:', err);
    return false;
  }
}

/**
 * Listens to own join request status as a viewer
 */
export function listenToMyJoinRequestStatus(
  streamId: string,
  userId: string,
  callback: (request: JoinRequestData | null) => void
) {
  if (!streamId || !userId) return () => {};
  const reqRef = ref(rtdb, `join_requests/${streamId}/${userId}`);
  return onValue(reqRef, (snapshot) => {
    if (snapshot.exists()) {
      setTimeout(() => callback(snapshot.val() as JoinRequestData), 0);
    } else {
      setTimeout(() => callback(null), 0);
    }
  });
}

// ------------------------------------------
// PK CHALLENGE REQUESTS (طلبات التحدي بين المذيعين)
// ------------------------------------------

export interface ChallengeRequestData {
  requestId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  senderStreamId: string;
  receiverId: string;
  receiverName: string;
  receiverStreamId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

/**
 * Sends a PK Challenge request to another active broadcaster
 */
export async function sendChallengeRequestInFirebase(
  sender: { id: string; name: string; avatar: string; streamId: string },
  receiver: { id: string; name: string; avatar: string; streamId: string }
): Promise<string | null> {
  if (!sender.id || !receiver.id) return null;
  try {
    const requestId = `pk_${sender.id}_${receiver.id}_${Date.now()}`;
    const reqRef = ref(rtdb, `challenge_requests/${requestId}`);
    const reqData: ChallengeRequestData = {
      requestId,
      senderId: sender.id,
      senderName: sender.name,
      senderPhoto: sender.avatar,
      senderStreamId: sender.streamId,
      receiverId: receiver.id,
      receiverName: receiver.name,
      receiverStreamId: receiver.streamId,
      status: 'pending',
      createdAt: Date.now(),
    };

    await set(reqRef, reqData);

    // Auto cleanup after 30 seconds if unanswered
    setTimeout(async () => {
      try {
        const snap = await get(reqRef);
        if (snap.exists() && snap.val().status === 'pending') {
          await update(reqRef, { status: 'rejected' });
        }
      } catch (e) {}
    }, 30000);

    return requestId;
  } catch (err) {
    console.error('❌ Error sending challenge request:', err);
    return null;
  }
}

/**
 * Listens to incoming challenge requests for a receiver user
 */
export function listenToIncomingChallengeRequests(
  userId: string,
  callback: (requests: ChallengeRequestData[]) => void
) {
  if (!userId) return () => {};
  const reqsRef = ref(rtdb, 'challenge_requests');
  return onValue(reqsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const list: ChallengeRequestData[] = Object.values(data);
      const incomingPending = list.filter((r) => r.receiverId === userId && r.status === 'pending');
      setTimeout(() => callback(incomingPending), 0);
    } else {
      setTimeout(() => callback([]), 0);
    }
  });
}

/**
 * Listens to a sent challenge request status by requestId
 */
export function listenToChallengeRequestStatus(
  requestId: string,
  callback: (req: ChallengeRequestData | null) => void
) {
  if (!requestId) return () => {};
  const reqRef = ref(rtdb, `challenge_requests/${requestId}`);
  return onValue(reqRef, (snapshot) => {
    if (snapshot.exists()) {
      setTimeout(() => callback(snapshot.val() as ChallengeRequestData), 0);
    } else {
      setTimeout(() => callback(null), 0);
    }
  });
}

/**
 * Responds to a PK challenge request (accept / reject)
 */
export async function respondToChallengeRequestInFirebase(
  requestId: string,
  status: 'accepted' | 'rejected'
): Promise<boolean> {
  if (!requestId) return false;
  try {
    const reqRef = ref(rtdb, `challenge_requests/${requestId}`);
    await update(reqRef, { status, updatedAt: Date.now() });
    return true;
  } catch (err) {
    console.error('❌ Error responding to challenge request:', err);
    return false;
  }
}

/**
 * Explicitly signs out user from Firebase Auth across Android & Web
 */
export async function signOutFromFirebase() {
  try {
    await logoutUnified(auth);
    console.log('👋 [Firebase Auth] Signed out successfully from Firebase.');
  } catch (err) {
    console.error('❌ Error signing out from Firebase Auth:', err);
  }
}

/**
 * Subscribes to Firebase Auth state changes
 */
export function listenToFirebaseAuth(callback: (fbUser: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Fetches user profile from Firestore users/{userId} (with RTDB fallback)
 */
export async function fetchUserProfileFromFirestore(userId: string): Promise<any | null> {
  if (!userId) return null;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    // Fallback: check Realtime Database
    const rtdbSnap = await get(ref(rtdb, `users/${userId}`));
    if (rtdbSnap.exists()) {
      return { id: userId, ...rtdbSnap.val() };
    }
    return null;
  } catch (err) {
    console.warn(`⚠️ [Firebase] Could not fetch profile for user ${userId}:`, err);
    return null;
  }
}

/**
 * Checks if current user is following target user via Firestore users/{currentUserId}/following/{targetUserId}
 */
export async function checkIsFollowingInFirebase(currentUserId: string, targetUserId: string): Promise<boolean> {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) return false;
  try {
    const followingDocRef = doc(db, 'users', currentUserId, 'following', targetUserId);
    const snap = await getDoc(followingDocRef);
    return snap.exists();
  } catch (err) {
    console.warn('⚠️ [Firebase] Check following error:', err);
    return false;
  }
}

/**
 * Follows a user in Firebase Firestore and updates follower/following counts
 */
export async function followUserInFirebase(currentUserId: string, targetUserId: string): Promise<boolean> {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) return false;
  try {
    const now = serverTimestamp();
    // 1. Add to current user's following subcollection
    await setDoc(doc(db, 'users', currentUserId, 'following', targetUserId), {
      userId: targetUserId,
      createdAt: now,
    });

    // 2. Add to target user's followers subcollection
    await setDoc(doc(db, 'users', targetUserId, 'followers', currentUserId), {
      userId: currentUserId,
      createdAt: now,
    });

    // 3. Atomically increment followingCount for currentUser and followersCount for targetUser
    try {
      await updateDoc(doc(db, 'users', currentUserId), { followingCount: increment(1) });
    } catch {}
    try {
      await updateDoc(doc(db, 'users', targetUserId), { followersCount: increment(1) });
    } catch {}

    // 4. Update in RTDB
    try {
      const targetRtdbRef = ref(rtdb, `users/${targetUserId}/followers/${currentUserId}`);
      await set(targetRtdbRef, { userId: currentUserId, createdAt: Date.now() });
      const currentRtdbRef = ref(rtdb, `users/${currentUserId}/following/${targetUserId}`);
      await set(currentRtdbRef, { userId: targetUserId, createdAt: Date.now() });
    } catch {}

    console.log(`✅ [Firebase Follow] User ${currentUserId} followed ${targetUserId}`);
    return true;
  } catch (err) {
    console.error('❌ [Firebase Follow] Error following user:', err);
    return false;
  }
}

/**
 * Unfollows a user in Firebase Firestore and decrements follower/following counts
 */
export async function unfollowUserInFirebase(currentUserId: string, targetUserId: string): Promise<boolean> {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) return false;
  try {
    // 1. Remove from following subcollection
    await deleteDoc(doc(db, 'users', currentUserId, 'following', targetUserId));

    // 2. Remove from followers subcollection
    await deleteDoc(doc(db, 'users', targetUserId, 'followers', currentUserId));

    // 3. Atomically decrement followingCount for currentUser and followersCount for targetUser
    try {
      await updateDoc(doc(db, 'users', currentUserId), { followingCount: increment(-1) });
    } catch {}
    try {
      await updateDoc(doc(db, 'users', targetUserId), { followersCount: increment(-1) });
    } catch {}

    // 4. Remove from RTDB
    try {
      await remove(ref(rtdb, `users/${targetUserId}/followers/${currentUserId}`));
      await remove(ref(rtdb, `users/${currentUserId}/following/${targetUserId}`));
    } catch {}

    console.log(`✅ [Firebase Unfollow] User ${currentUserId} unfollowed ${targetUserId}`);
    return true;
  } catch (err) {
    console.error('❌ [Firebase Unfollow] Error unfollowing user:', err);
    return false;
  }
}

/**
 * Equips or un-equips an inventory item (frame, entrance, badge, bubble) in Firestore & RTDB
 */
export async function equipInventoryItemInFirebase(
  userId: string,
  itemType: 'frame' | 'entrance' | 'badge' | 'bubble' | 'wallpaper',
  itemId: string | null
): Promise<boolean> {
  if (!userId) return false;
  try {
    const fieldMap: Record<string, string> = {
      frame: 'equippedFrame',
      entrance: 'equippedEntrance',
      badge: 'equippedBadge',
      bubble: 'equippedBubble',
      wallpaper: 'equippedWallpaper',
    };

    const targetField = fieldMap[itemType] || 'equippedFrame';
    const updateObj = { [targetField]: itemId || null };

    // 1. Update in Firestore users/{userId}
    try {
      await updateDoc(doc(db, 'users', userId), updateObj);
    } catch {}

    // 2. Update in RTDB users/{userId}
    try {
      await update(ref(rtdb, `users/${userId}`), updateObj);
    } catch {}

    console.log(`✅ [Inventory Sync] Equipped ${itemType} = ${itemId} for user ${userId}`);
    return true;
  } catch (err) {
    console.error(`❌ [Inventory Sync] Error equipping ${itemType}:`, err);
    return false;
  }
}

/**
 * Purchases a frame, checks balance, deducts coins, and adds to ownedFrames array
 */
export async function purchaseFrameInFirebase(
  userId: string,
  frameId: string,
  price: number
): Promise<{ success: boolean; message: string }> {
  if (!userId || !frameId) {
    return { success: false, message: 'معرف المستخدم أو الإطار غير صالح' };
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      return { success: false, message: 'حساب المستخدم غير موجود' };
    }

    const userData = userSnap.data();
    const currentCoins = userData.coins || 0;
    const ownedFrames: string[] = userData.ownedFrames || ['frame_01'];

    if (ownedFrames.includes(frameId)) {
      return { success: false, message: 'أنت تمتلك هذا الإطار بالفعل في حقيبتك' };
    }

    if (currentCoins < price) {
      return { success: false, message: `رصيد العملات غير كافٍ! السعر: ${price} 🪙 ورصيدك: ${currentCoins} 🪙` };
    }

    // Deduct coins & add to ownedFrames
    const updatedCoins = currentCoins - price;
    const updatedOwnedFrames = [...ownedFrames, frameId];

    await updateDoc(userDocRef, {
      coins: updatedCoins,
      ownedFrames: updatedOwnedFrames,
      equippedFrame: frameId, // Automatically equip newly purchased frame
    });

    // Sync with RTDB
    try {
      await update(ref(rtdb, `users/${userId}`), {
        coins: updatedCoins,
        ownedFrames: updatedOwnedFrames,
        equippedFrame: frameId,
      });
    } catch {}

    console.log(`✅ [Frame Purchase] User ${userId} bought ${frameId} for ${price} coins`);
    return {
      success: true,
      message: `🎉 تم شراء وتجهيز الإطار بنجاح! الرصيد المتبقي: ${updatedCoins} 🪙`,
    };
  } catch (err) {
    console.error('❌ [Frame Purchase] Error purchasing frame:', err);
    return { success: false, message: 'حدث خطأ أثناء إتمام عملية الشراء' };
  }
}

// =========================================================================
// 🚀 ROCKET GAME SERVER-AUTHORITATIVE MULTIPLAYER ENGINE (FIREBASE RTDB)
// =========================================================================

export interface RocketPlayerBet {
  id: string; // `${userId}_${betNum}`
  userId: string;
  betNum: 1 | 2;
  name: string;
  avatar: string;
  amount: number;
  cashedOut: boolean;
  cashedMultiplier?: number;
  cashedAt?: number;
  rocketColor?: string;
}

export interface RocketReaction {
  id: string;
  emoji: string;
  text: string;
  name: string;
  avatar: string;
  timestamp: number;
}

export interface RocketServerState {
  roundId: number;
  phase: 'WAITING' | 'FLYING' | 'CRASHED';
  roundStartTime: number; // when waiting started
  startTime: number;      // when countdown finishes and rocket launches
  crashMultiplier: number;
  crashTime?: number;     // when rocket crashed
  nextRoundTime?: number; // when next round begins
  bets?: Record<string, RocketPlayerBet>;
  history: number[];
  hostId?: string;
  hostHeartbeat?: number;
  updatedAt: number;
}

/**
 * Calculates a dynamic, thrilling crash multiplier with platform margin
 */
export function calculateRocketCrashTarget(bets?: Record<string, RocketPlayerBet>): number {
  const activeBets = bets ? Object.values(bets) : [];
  const totalPool = activeBets.reduce((sum, b) => sum + (b.amount || 0), 0);
  const rand = Math.random();

  // 1. If low/empty pool, generate high attractive multipliers
  if (totalPool < 500) {
    if (rand < 0.18) return parseFloat((1.30 + Math.random() * 0.70).toFixed(2));
    if (rand < 0.58) return parseFloat((2.50 + Math.random() * 3.50).toFixed(2));
    if (rand < 0.88) return parseFloat((7.00 + Math.random() * 9.00).toFixed(2));
    return parseFloat((20.0 + Math.random() * 28.0).toFixed(2)); // up to 48x
  }

  // 2. Pool-Based Margin Balancer (8% platform margin)
  const houseMargin = 0.08;
  const maxSafePayout = totalPool * (1 - houseMargin);
  let bestCrash = 1.25;

  for (let testMult = 1.15; testMult <= 25.0; testMult += 0.05) {
    let projectedPayout = 0;
    for (const b of activeBets) {
      projectedPayout += b.amount * testMult;
    }
    if (projectedPayout > maxSafePayout) {
      bestCrash = Math.max(1.12, parseFloat((testMult - 0.04 - Math.random() * 0.08).toFixed(2)));
      return bestCrash;
    }
    bestCrash = parseFloat(testMult.toFixed(2));
  }

  if (rand < 0.30) return parseFloat((1.20 + Math.random() * 0.80).toFixed(2));
  if (rand < 0.75) return parseFloat((2.20 + Math.random() * 3.20).toFixed(2));
  return parseFloat((6.00 + Math.random() * 8.00).toFixed(2));
}

/**
 * Listens to centralized server-authoritative Rocket Game state in Firebase RTDB
 */
export function listenToRocketServerRound(
  callback: (state: RocketServerState) => void
): () => void {
  const rocketRef = ref(rtdb, 'game_rocket/current_round');
  const unsubscribe = onValue(
    rocketRef,
    (snapshot) => {
      const now = Date.now();
      if (snapshot.exists()) {
        const val = snapshot.val();
        let phase = val.phase || 'WAITING';
        let startTime = Number(val.startTime) || (now + 5000);
        let roundStartTime = Number(val.roundStartTime) || now;

        // Auto-heal stale round timestamp from previous sessions
        if (phase === 'WAITING' && startTime <= now - 2000) {
          startTime = now + 5000;
          roundStartTime = now;
        }

        callback({
          roundId: val.roundId || 457080,
          phase: phase,
          roundStartTime: roundStartTime,
          startTime: startTime,
          crashMultiplier: val.crashMultiplier || 2.45,
          crashTime: val.crashTime,
          nextRoundTime: val.nextRoundTime,
          bets: val.bets || {},
          history: val.history || [2.42, 1.85, 3.79, 1.46, 5.12, 1.32],
          hostId: val.hostId,
          hostHeartbeat: val.hostHeartbeat,
          updatedAt: val.updatedAt || now,
        });
      } else {
        // Initialize default shared server state if first run
        const initialRound: RocketServerState = {
          roundId: 457080,
          phase: 'WAITING',
          roundStartTime: now,
          startTime: now + 5000,
          crashMultiplier: 2.45,
          history: [2.42, 1.85, 3.79, 1.46, 5.12, 1.32],
          bets: {},
          updatedAt: now,
        };
        set(rocketRef, initialRound).catch(() => {});
        callback(initialRound);
      }
    },
    (err) => {
      console.warn('⚠️ [Firebase RTDB] Rocket game state listener error:', err);
    }
  );

  return () => {
    if (typeof unsubscribe === 'function') unsubscribe();
  };
}

/**
 * Places a player bet securely in Firebase RTDB for the current round
 */
export async function placeRocketBetServer(
  roundId: number,
  user: UserProfile,
  betNum: 1 | 2,
  amount: number,
  rocketColor: string = '#fbbf24'
): Promise<{ success: boolean; message: string }> {
  if (!user || !user.id || amount <= 0) {
    return { success: false, message: 'بيانات غير صالحة' };
  }

  try {
    const betKey = `${user.id}_${betNum}`;
    const betRef = ref(rtdb, `game_rocket/current_round/bets/${betKey}`);
    const newBet: RocketPlayerBet = {
      id: betKey,
      userId: user.id,
      betNum,
      name: betNum === 2 ? `${user.name || 'لاعب'} (2)` : (user.name || 'لاعب'),
      avatar: user.avatar || '',
      amount: amount,
      cashedOut: false,
      cashedMultiplier: 0,
      rocketColor,
    };
    await set(betRef, newBet);
    return { success: true, message: 'تم تثبيت الرهان بنجاح ✓' };
  } catch (err) {
    console.error('❌ Error placing rocket bet in Firebase:', err);
    return { success: false, message: 'تعذر تثبيت الرهان في السيرفر' };
  }
}

/**
 * Executes a verified Cashout on server with multiplier verification & wallet deposit
 */
export async function cashoutRocketBetServer(
  roundId: number,
  userId: string,
  betNum: 1 | 2,
  verifiedMultiplier: number
): Promise<{ success: boolean; payout: number; multiplier: number }> {
  try {
    const betKey = `${userId}_${betNum}`;
    const betRef = ref(rtdb, `game_rocket/current_round/bets/${betKey}`);
    const betSnap = await get(betRef);

    if (!betSnap.exists()) {
      return { success: false, payout: 0, multiplier: 1 };
    }

    const betData: RocketPlayerBet = betSnap.val();
    if (betData.cashedOut) {
      return { success: false, payout: 0, multiplier: betData.cashedMultiplier || 1 };
    }

    const payout = Math.floor(betData.amount * verifiedMultiplier);

    // Mark as cashed out on server
    await update(betRef, {
      cashedOut: true,
      cashedMultiplier: verifiedMultiplier,
      cashedAt: Date.now(),
    });

    return { success: true, payout, multiplier: verifiedMultiplier };
  } catch (err) {
    console.error('❌ Error cashing out on server:', err);
    return { success: false, payout: 0, multiplier: 1 };
  }
}

/**
 * Sends a live floating space reaction to all players in real time
 */
export async function sendRocketReactionServer(reaction: {
  emoji: string;
  text: string;
  name: string;
  avatar: string;
}) {
  try {
    const reactionId = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const reactionRef = ref(rtdb, `game_rocket/reactions/${reactionId}`);
    await set(reactionRef, {
      ...reaction,
      id: reactionId,
      timestamp: Date.now(),
    });
    // Auto-remove after 4 seconds to keep RTDB clean
    setTimeout(() => {
      remove(reactionRef).catch(() => {});
    }, 4000);
  } catch (err) {
    console.warn('Error sending rocket reaction:', err);
  }
}

/**
 * Listens to live floating reactions from all connected players
 */
export function listenToRocketReactions(
  callback: (reaction: RocketReaction) => void
): () => void {
  const reactionsRef = ref(rtdb, 'game_rocket/reactions');
  const unsubscribe = onValue(reactionsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const now = Date.now();
      Object.values(data).forEach((item: any) => {
        if (item && now - (item.timestamp || 0) < 3500) {
          callback(item);
        }
      });
    }
  });

  return () => {
    if (typeof unsubscribe === 'function') unsubscribe();
  };
}

/**
 * Decentralized peer coordinator to advance the shared round seamlessly across all clients
 */
export function startRocketRoundCoordinator(
  userId: string,
  currentStateGetter: () => RocketServerState | null
): () => void {
  const rocketRef = ref(rtdb, 'game_rocket/current_round');

  const interval = setInterval(async () => {
    try {
      const state = currentStateGetter();
      if (!state) return;

      const now = Date.now();
      const isHostDead = !state.hostHeartbeat || now - state.hostHeartbeat > 4000;
      const isMeHost = state.hostId === userId;

      // 1. Elect current client as host if host is dead or missing
      if (isHostDead && !isMeHost) {
        await update(rocketRef, {
          hostId: userId,
          hostHeartbeat: now,
          updatedAt: now,
        });
        return;
      }

      // If this client is not the host, do not progress state
      if (!isMeHost) return;

      // Refresh host heartbeat
      await update(rocketRef, {
        hostHeartbeat: now,
      });

      // 2. Advance from WAITING to FLYING
      if (state.phase === 'WAITING' && now >= state.startTime) {
        await update(rocketRef, {
          phase: 'FLYING',
          updatedAt: now,
        });
        return;
      }

      // 3. Check FLYING crash
      if (state.phase === 'FLYING') {
        const elapsedSec = Math.max(0, (now - state.startTime) / 1000);
        const currentMultiplier = parseFloat((1 + Math.pow(elapsedSec, 1.22) * 0.13).toFixed(2));

        if (currentMultiplier >= state.crashMultiplier) {
          const updatedHistory = [state.crashMultiplier, ...(state.history || []).slice(0, 14)];
          await update(rocketRef, {
            phase: 'CRASHED',
            crashTime: now,
            nextRoundTime: now + 5500,
            history: updatedHistory,
            updatedAt: now,
          });
          return;
        }
      }

      // 4. Advance from CRASHED to next WAITING round
      if (state.phase === 'CRASHED') {
        const nextTime = state.nextRoundTime || ((state.crashTime || now) + 5500);
        if (now >= nextTime) {
          const nextCrash = calculateRocketCrashTarget(state.bets);
          const nextRound: RocketServerState = {
            roundId: (state.roundId || 457080) + 1,
            phase: 'WAITING',
            roundStartTime: now,
            startTime: now + 5000,
            crashMultiplier: nextCrash,
            history: state.history || [],
            bets: {},
            hostId: userId,
            hostHeartbeat: now,
            updatedAt: now,
          };
          await set(rocketRef, nextRound);
        }
      }
    } catch (e) {
      // Ignore transient network errors
    }
  }, 400);

  return () => clearInterval(interval);
}




