import React, { useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Maximize2, Lock, Key, X, Check } from 'lucide-react';
import { UserProfile, VoiceRoom, MainTab, TransactionRecord, GiftItem, WithdrawalRequest } from './types';
import { defaultUser } from './data/mockData';
import { saveUserToFirebase, updateUserLogoutStatusInFirebase, normalizeProvider, getUserFromFirebase, saveRoomToRealtimeDb, listenToRoomsFromRealtimeDb, listenToUserInRealtimeDb, setupGlobalPresence, signOutFromFirebase, listenToFirebaseAuth, incrementUserDiamondsInFirebase } from './lib/firebase';
import { recordAgencyGiftActivity } from './lib/agencyService';
import { initAndroidAudioUnlocker } from './lib/nativeAudio';
import { audioSyncEngine } from './lib/audioSyncEngine';
import { requestStartupPermissionsUnified } from './lib/permissions';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidGestureBar } from './components/AndroidGestureBar';
import { Header } from './components/Header';
import { Banner } from './components/Banner';
import { QuickCategories } from './components/QuickCategories';
import { RoomTabs } from './components/RoomTabs';
import { RoomCard } from './components/RoomCard';
import { VoiceRoomModal } from './components/VoiceRoomModal';
import { CreateRoomModal } from './components/CreateRoomModal';
import { LiveStreamModal } from './components/LiveStreamModal';
import { LiveStreamHub } from './components/LiveStreamHub';
import { LiveStreamData } from './lib/firebase';
import { MiniGamesModal } from './components/MiniGamesModal';
import { CoinStoreModal } from './components/CoinStoreModal';
import { WithdrawalModal } from './components/WithdrawalModal';
import { VipModal } from './components/VipModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { DirectChatsView } from './components/DirectChatsView';
import { FriendsView } from './components/FriendsView';
import { ProfileView } from './components/ProfileView';
import { SplashScreen } from './components/SplashScreen';
import { LoginScreen } from './components/LoginScreen';
import { BottomNav } from './components/BottomNav';
import { DailySpinModal } from './components/daily/DailySpinModal';
import { MiniFloatingRoomWidget } from './components/room/MiniFloatingRoomWidget';
import { MomentsFeedView } from './components/moments/MomentsFeedView';
import { SpecialIdStoreModal } from './components/store/SpecialIdStoreModal';
import { useI18n } from './lib/i18n';

export default function App() {
  const { t, dir } = useI18n();
  const [showSplash, setShowSplash] = useState(true);
  const [isPhoneFrameMode, setIsPhoneFrameMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && !Capacitor.isNativePlatform()) {
      return window.innerWidth > 1024;
    }
    return false;
  });

  // Enable native full-screen immersive edge-to-edge mode hiding system status bar
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      try {
        StatusBar.hide().catch(() => { });
        StatusBar.setOverlaysWebView({ overlay: true }).catch(() => { });
      } catch (err) {
        console.warn('StatusBar init error:', err);
      }
    }
  }, []);

  // Initialize User from localStorage
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('saleem_saved_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id) {
          return { ...defaultUser, ...parsed, isLoggedIn: true };
        }
      }
    } catch (e) {
      console.error('Error parsing saved user', e);
    }
    return defaultUser;
  });

  const [showLogin, setShowLogin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('saleem_saved_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.isLoggedIn !== false) {
          return false; // Stay logged in!
        }
      }
    } catch (e) {
      // fallback
    }
    return true;
  });

  // Verify server authentication status on load & subscribe to Firebase Auth changes
  useEffect(() => {
    let isMounted = true;

    // 0. Initialize universal audio unlocker and request camera/mic permissions
    audioSyncEngine.initAutoUnlock();
    initAndroidAudioUnlocker();
    requestStartupPermissionsUnified().catch((err) => {
      console.warn('⚠️ [StartupPermissions] Initial permission request note:', err);
    });

    // 1. Initial check from LocalStorage for instant non-blocking load
    try {
      const savedRaw = localStorage.getItem('saleem_saved_user');
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed && parsed.id && parsed.isLoggedIn !== false) {
          setShowLogin(false);
          setUser((prev) => ({ ...prev, ...parsed, isLoggedIn: true }));
        }
      }
    } catch (e) {
      console.error('Error reading saved user:', e);
    }

    // 2. Subscribe to Firebase Auth state for automatic seamless persistence across app restarts
    const unsubscribeAuth = listenToFirebaseAuth(async (fbUser) => {
      if (!isMounted) return;

      if (fbUser) {
        console.log(`🔐 [Firebase Auth Listener] Authenticated user detected: ${fbUser.uid} (${fbUser.email || 'no-email'})`);
        setShowLogin(false);

        try {
          const serverUser = await getUserFromFirebase(fbUser.uid);
          if (serverUser && isMounted) {
            const mergedUser: UserProfile = {
              ...defaultUser,
              ...serverUser,
              id: fbUser.uid,
              name: fbUser.displayName || serverUser.name || 'مستخدم سليم',
              avatar: fbUser.photoURL || serverUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              email: fbUser.email || serverUser.email || '',
              isLoggedIn: true,
            };
            setUser(mergedUser);
            localStorage.setItem('saleem_saved_user', JSON.stringify(mergedUser));
            return;
          }
        } catch (err) {
          console.error('Error fetching user profile from Firebase:', err);
        }
      } else {
        console.log('🔒 [Firebase Auth Listener] No active Firebase Auth session.');
        // Only show login screen if localStorage also does NOT have a saved logged-in session
        try {
          const savedRaw = localStorage.getItem('saleem_saved_user');
          if (savedRaw) {
            const parsed = JSON.parse(savedRaw);
            if (parsed && parsed.id && parsed.isLoggedIn !== false) {
              setShowLogin(false);
              setUser((prev) => ({ ...prev, ...parsed, isLoggedIn: true }));
              return;
            }
          }
        } catch (e) {
          console.warn('Error reading saved user in auth listener:', e);
        }

        setShowLogin(true);
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribeAuth === 'function') {
        unsubscribeAuth();
      }
    };
  }, []);

  // Helper function to sanitize & deduplicate room list (by unique room id)
  const sanitizeAndDeduplicateRooms = (roomList: VoiceRoom[]): VoiceRoom[] => {
    const seenIds = new Set<string>();
    const sanitized: VoiceRoom[] = [];

    for (const room of roomList) {
      if (!room || !room.id || !room.title) continue;

      if (seenIds.has(room.id)) {
        continue; // Skip duplicate room IDs
      }

      seenIds.add(room.id);

      // Never infer that a real user is a mock from an ID prefix.
      // Deduplicate the same speaker across seats while preserving the first valid seat.
      const seenSpeakerIds = new Set<string>();
      const cleanSeats = (room.seats || []).map((seat) => {
        const speakerId = seat.speakerUser?.id?.trim();
        if (!speakerId) return seat;
        if (seenSpeakerIds.has(speakerId)) return { ...seat, speakerUser: undefined };
        seenSpeakerIds.add(speakerId);
        return seat;
      });

      sanitized.push({
        ...room,
        seats: cleanSeats,
      });
    }

    return sanitized;
  };

  // Initialize Rooms from localStorage to persist created rooms across browser reloads
  const [rooms, setRooms] = useState<VoiceRoom[]>(() => {
    try {
      const saved = localStorage.getItem('saleem_saved_rooms');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sanitizeAndDeduplicateRooms(parsed);
        }
      }
    } catch (e) {
      console.error('Error parsing saved rooms', e);
    }
    return [];
  });

  // Real-time Rooms Sync across Web & Android from Firebase RTDB
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = listenToRoomsFromRealtimeDb((cloudRooms) => {
      if (!isMounted) return;
      if (Array.isArray(cloudRooms) && cloudRooms.length > 0) {
        setRooms((prev) => {
          const cloudMap = new Map(cloudRooms.map((r) => [r.id, r]));
          const combined = [...cloudRooms];
          prev.forEach((r) => {
            if (!cloudMap.has(r.id)) {
              combined.push(r);
            }
          });
          return sanitizeAndDeduplicateRooms(combined);
        });
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);

  // Auto-recover and ensure active user room is always present in rooms list
  useEffect(() => {
    if (user && user.id && user.hasActiveRoom && user.createdRoomId) {
      setRooms((prev) => {
        if (!prev.some((r) => r.id === user.createdRoomId || r.hostId === user.id)) {
          const userRoom: VoiceRoom = {
            id: user.createdRoomId!,
            title: user.roomName || `غرفة ${user.name}`,
            announcement: '',
            hostId: user.id,
            ownerId: user.id,
            hostName: user.name,
            hostAvatar: user.avatar,
            coverImage: user.roomCoverImage || user.avatar,
            category: 'غرف شائعة',
            tag: 'طرب',
            level: 1,
            rank: 1,
            backgroundUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
            listenersCount: 1,
            diamonds: 0,
            seats: Array.from({ length: 10 }, (_, i) => ({
              seatId: i + 1,
              isLocked: false,
              isMuted: false,
              speakerUser: i === 0 ? user : undefined,
              points: 0,
            })),
            messages: [],
            createdAt: Date.now(),
          };
          saveRoomToRealtimeDb(userRoom);
          return [userRoom, ...prev];
        }
        return prev;
      });
    }
  }, [user?.id, user?.hasActiveRoom, user?.createdRoomId, user?.roomName]);

  // Initialize Android Native Audio Unlocker
  useEffect(() => {
    initAndroidAudioUnlocker();
  }, []);

  // Sync state updates to localStorage & Firebase Firestore
  useEffect(() => {
    try {
      localStorage.setItem('saleem_saved_user', JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user to localStorage', e);
    }

    // Save user to Firebase Firestore whenever user changes (if user and user.id exist)
    if (user && user.id) {
      saveUserToFirebase(user);
    }
  }, [user]);

  // Update Firebase logout status when page is closed/refreshed
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && user.id) {
        updateUserLogoutStatusInFirebase(user);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  // Sync rooms with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('saleem_saved_rooms', JSON.stringify(rooms));
    } catch (e) {
      console.error('Error saving rooms', e);
    }
  }, [rooms]);

  // Real-time listener for user's diamonds, target, and coins from Firebase Realtime Database
  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = listenToUserInRealtimeDb(user.id, (rtdbUser) => {
      if (rtdbUser) {
        setUser((prev) => {
          let hasChange = false;
          const updated = { ...prev };
          if (rtdbUser.diamonds !== undefined && Number(rtdbUser.diamonds) !== prev.diamonds) {
            updated.diamonds = Number(rtdbUser.diamonds) || 0;
            hasChange = true;
          }
          if (rtdbUser.targetDiamonds !== undefined && Number(rtdbUser.targetDiamonds) !== prev.targetDiamonds) {
            updated.targetDiamonds = Number(rtdbUser.targetDiamonds) || 0;
            hasChange = true;
          }
          if (rtdbUser.coins !== undefined && Number(rtdbUser.coins) !== prev.coins) {
            updated.coins = Number(rtdbUser.coins) || 0;
            hasChange = true;
          }
          return hasChange ? updated : prev;
        });
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [user?.id]);

  // Sync rooms with Firebase Realtime Database
  useEffect(() => {
    const unsubscribe = listenToRoomsFromRealtimeDb((rtdbRooms) => {
      if (rtdbRooms && rtdbRooms.length > 0) {
        setRooms((prev) => {
          const rtdbMap = new Map(rtdbRooms.map((r) => [r.id, r]));
          let merged = prev.map((r) => rtdbMap.get(r.id) || r);
          rtdbRooms.forEach((r) => {
            if (!merged.some((existing) => existing.id === r.id)) {
              merged.unshift(r);
            }
          });

          // Force Saleem AI Room to be always at the very top for visibility
          const aiRoomId = 'convoai-e2c8cb82-1f0a-4af9-b64c-bd3b56ed468f';
          const aiRoom = merged.find(r => r.id === aiRoomId);
          if (aiRoom) {
            merged = [aiRoom, ...merged.filter(r => r.id !== aiRoomId)];
          }

          return sanitizeAndDeduplicateRooms(merged);
        });
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Global Presence Tracker (.info/connected)
  useEffect(() => {
    if (user && user.id && user.isLoggedIn) {
      console.log(`📡 Initializing Global Presence System for user ${user.id}...`);
      const cleanupPresence = setupGlobalPresence(user.id);
      return () => {
        cleanupPresence();
      };
    }
  }, [user?.id, user?.isLoggedIn]);

  // Navigation & Filter States
  const [mainTab, setMainTab] = useState<MainTab>('home');
  const [roomCategoryTab, setRoomCategoryTab] = useState<'غرف شائعة' | 'غرف جديدة' | 'متابعة' | 'غرف اللايف 🔴' | 'غرف الحفلات'>('غرف شائعة');
  const [regionFilter, setRegionFilter] = useState<'all' | 'arabic' | 'foreign'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [memberFilter, setMemberFilter] = useState<'all' | 'high' | 'medium' | 'quiet'>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [friendsFilter, setFriendsFilter] = useState<'all' | 'friends_only'>('all');
  const [selectedLiveStream, setSelectedLiveStream] = useState<LiveStreamData | null>(null);

  // Active Modals States
  const [activeVoiceRoom, setActiveVoiceRoom] = useState<VoiceRoom | null>(null);
  const [isRoomMinimized, setIsRoomMinimized] = useState<boolean>(false);
  const [voiceRoomInternalModalOpen, setVoiceRoomInternalModalOpen] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showLiveStreamModal, setShowLiveStreamModal] = useState(false);
  const [showGamesModal, setShowGamesModal] = useState(false);
  const [showCoinStoreModal, setShowCoinStoreModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showAdminPanelModal, setShowAdminPanelModal] = useState(false);
  const [showExclusiveShop, setShowExclusiveShop] = useState(false);
  const [showDailyTasks, setShowDailyTasks] = useState(false);
  const [showWeeklyCompetition, setShowWeeklyCompetition] = useState(false);
  const [showDailySpinModal, setShowDailySpinModal] = useState(false);
  const [showSpecialIdStoreModal, setShowSpecialIdStoreModal] = useState(false);

  // Room PIN Gatekeeper States
  const [pendingRoomForPin, setPendingRoomForPin] = useState<VoiceRoom | null>(null);
  const [pinInputValue, setPinInputValue] = useState('');
  const [pinErrorMsg, setPinErrorMsg] = useState<string | null>(null);

  // Universal Room Entry Handler with Password & Blacklist/Kick Gatekeeper
  const handleTryOpenRoom = (targetRoom: VoiceRoom) => {
    // 1. Check if user is the Room Owner / Host / SuperAdmin
    const isHost =
      targetRoom.hostId === user.id ||
      Boolean(user.createdRoomId && targetRoom.id === user.createdRoomId) ||
      Boolean((targetRoom as any).ownerId === user.id) ||
      Boolean((targetRoom as any).creatorId === user.id) ||
      user.role === 'admin' ||
      user.role === 'owner';

    // 2. Check if user is a Room Moderator / Admin / Manager
    const isMod =
      (Array.isArray(targetRoom.mods) && (targetRoom.mods.includes(user.id) || (user.name ? targetRoom.mods.includes(user.name) : false))) ||
      (targetRoom.mods && typeof targetRoom.mods === 'object' && ((targetRoom.mods as Record<string, boolean>)[user.id] === true || (user.name ? (targetRoom.mods as Record<string, boolean>)[user.name] === true : false))) ||
      Boolean((targetRoom as any).moderators?.includes?.(user.id)) ||
      Boolean((targetRoom as any).moderators?.includes?.(user.name)) ||
      Boolean((targetRoom as any).admins?.includes?.(user.id)) ||
      Boolean((targetRoom as any).admins?.includes?.(user.name)) ||
      Boolean((targetRoom as any).managers?.includes?.(user.id));

    // 3. Blacklist & 24h Kick Check (Bypassed for Host and Moderators)
    if (!isHost && !isMod) {
      // 1. Blacklist Check (Permanent Ban)
      const isBlacklisted =
        Boolean(targetRoom.blackList?.includes(user.id)) ||
        Boolean(targetRoom.blackList?.includes(user.name)) ||
        Boolean((targetRoom as any).blacklistedUsers?.includes(user.id));

      if (isBlacklisted) {
        setToastMessage('⛔ لا يمكنك دخول الغرفة! أنت موضوع في القائمة السوداء من قبل إدارة الغرفة.');
        setTimeout(() => setToastMessage(null), 4500);
        return;
      }

      // 2. 24-Hour Kick Check (Temporary Ban)
      const kickInfo = targetRoom.kickedUsers?.[user.id] || targetRoom.kickedUsers?.[user.name];
      if (kickInfo && kickInfo.expiresAt > Date.now()) {
        const remMs = kickInfo.expiresAt - Date.now();
        const remHours = Math.floor(remMs / (1000 * 60 * 60));
        const remMins = Math.ceil((remMs % (1000 * 60 * 60)) / (1000 * 60));
        setToastMessage(`🚫 تم طردك من هذه الغرفة! لا يمكنك الدخول إلا بعد انتهاء مدة الطرد (متبقي ${remHours} ساعة و ${remMins} دقيقة).`);
        setTimeout(() => setToastMessage(null), 5000);
        return;
      }
    }

    // 4. PIN Code / Password Protection Check:
    // Room Owner (صاحب الغرفة) and Room Moderators (المشرفين) enter IMMEDIATELY WITHOUT PASSWORD!
    // Regular members and guests are prompted for the room password.
    const isRoomLocked = Boolean(
      (targetRoom.isLockedWithPin || (targetRoom as any).isLocked || (targetRoom as any).isPrivate) &&
      (targetRoom.pinCode || (targetRoom as any).password)
    );

    if (isRoomLocked && !isHost && !isMod) {
      setPendingRoomForPin(targetRoom);
      setPinInputValue('');
      setPinErrorMsg(null);
    } else {
      setActiveVoiceRoom(targetRoom);
    }
  };

  // Android Hardware Back Button Listener
  useEffect(() => {
    const backButtonListener = CapacitorApp.addListener('backButton', () => {

      // 1️⃣ إذا كانت نافذة داخل الغرفة مفتوحة، أغلقها أولاً
      if (voiceRoomInternalModalOpen) {
        setVoiceRoomInternalModalOpen(false);
        return;
      }

      // 2️⃣ الهدايا/الألعاب
      if (showGamesModal) {
        setShowGamesModal(false);
        return;
      }

      // 3️⃣ متجر العملات
      if (showCoinStoreModal) {
        setShowCoinStoreModal(false);
        return;
      }

      // 4️⃣ السحب
      if (showWithdrawalModal) {
        setShowWithdrawalModal(false);
        return;
      }

      // 5️⃣ VIP
      if (showVipModal) {
        setShowVipModal(false);
        return;
      }

      // 6️⃣ لوحة المتصدرين
      if (showLeaderboardModal) {
        setShowLeaderboardModal(false);
        return;
      }

      // 7️⃣ لوحة الإدارة
      if (showAdminPanelModal) {
        setShowAdminPanelModal(false);
        return;
      }

      // 8️⃣ المتجر الخاص
      if (showExclusiveShop) {
        setShowExclusiveShop(false);
        return;
      }

      // 9️⃣ المهام اليومية
      if (showDailyTasks) {
        setShowDailyTasks(false);
        return;
      }

      // 🔟 المسابقة الأسبوعية
      if (showWeeklyCompetition) {
        setShowWeeklyCompetition(false);
        return;
      }

      // 1️⃣1️⃣ إنشاء غرفة
      if (showCreateRoomModal) {
        setShowCreateRoomModal(false);
        return;
      }

      // 1️⃣2️⃣ غرفة الصوت نفسها: تصغير الغرفة أولاً بدلاً من قطع الصوت
      if (activeVoiceRoom) {
        if (!isRoomMinimized) {
          setIsRoomMinimized(true);
          return;
        }
        setActiveVoiceRoom(null);
        setIsRoomMinimized(false);
        return;
      }

      // 1️⃣3️⃣ لا يوجد شيء مفتوح
      // اترك Android يتعامل مع Back بشكل طبيعي
      CapacitorApp.minimizeApp();
    });

    return () => {
      backButtonListener.then(listener => listener.remove());
    };
  }, [
    activeVoiceRoom,
    voiceRoomInternalModalOpen,
    showGamesModal,
    showCoinStoreModal,
    showWithdrawalModal,
    showVipModal,
    showLeaderboardModal,
    showAdminPanelModal,
    showExclusiveShop,
    showDailyTasks,
    showWeeklyCompetition,
    showCreateRoomModal,
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Coin & Diamond balance handlers
  const handleUpdateCoins = (delta: number) => {
    setUser((prev) => ({
      ...prev,
      coins: Math.max(0, prev.coins + delta),
    }));
  };

  const handleUpdateDiamonds = (delta: number) => {
    setUser((prev) => ({
      ...prev,
      diamonds: Math.max(0, prev.diamonds + delta),
    }));
  };

  const handleUpdateTargetRewardDiamonds = (delta: number) => {
    setUser((prev) => {
      const current = Number(prev.targetRewardDiamonds || 0);
      const next = Math.max(0, current + delta);
      return {
        ...prev,
        targetRewardDiamonds: next,
      };
    });
  };

  const handleSubmitWithdrawalRequest = (newReq: WithdrawalRequest) => {
    setWithdrawalRequests((prev) => [newReq, ...prev]);
    showToast(`تم تقديم طلب السحب رقم ${newReq.id} بنجاح!`);
  };

  const handleUpdateWithdrawalStatus = (
    requestId: string,
    newStatus: 'PROCESSING' | 'SUCCESS' | 'REJECTED',
    rejectionReason?: string
  ) => {
    setWithdrawalRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          if (newStatus === 'REJECTED' && req.status !== 'REJECTED') {
            handleUpdateDiamonds(req.diamondsAmount);
            showToast(`تم رفض الطلب ${req.id} وإعادة ${req.diamondsAmount.toLocaleString()} ألماسة لحسابك!`);
          } else if (newStatus === 'SUCCESS') {
            showToast(`تمت الموافقة على طلب السحب ${req.id} وتحويل المبلغ بنجاح! 🎉`);
          }
          return { ...req, status: newStatus, rejectionReason };
        }
        return req;
      })
    );
  };

  const handlePurchaseCoinsSuccess = (coinsAdded: number, tx: TransactionRecord) => {
    handleUpdateCoins(coinsAdded);
    setTransactions((prev) => [tx, ...prev]);
  };

  // One-time Room creation handler
  const handleCreateRoomSuccess = (newRoom: VoiceRoom) => {
    setRooms((prev) => [newRoom, ...prev]);
    saveRoomToRealtimeDb(newRoom);
    const updatedUser: UserProfile = {
      ...user,
      isAllowedToCreateRoom: false, // Enforce one-time room creation constraint
      hasActiveRoom: true, // (تحتوي على غرفة == صحيح)
      roomName: newRoom.title,
      createdRoomId: newRoom.id,
      levelStatus: 'ليفل 2', // Dynamically advance membership level
    };
    setUser(updatedUser);
    try {
      localStorage.setItem('saleem_saved_user', JSON.stringify(updatedUser));
    } catch (e) { }
    saveUserToFirebase(updatedUser);
    setRoomCategoryTab(newRoom.category as any);
    setShowCreateRoomModal(false);
    setActiveVoiceRoom(newRoom); // Transport user immediately inside their new room
    showToast(`🎉 مبروك! تم إنشاء غرفتك الصوتية بنجاح "${newRoom.title}"`);
  };

  // Logic for Agency / Create Room button click according to specifications
  const handleOpenAgencies = () => {
    let userRoom = rooms.find(
      (r) => r.hostId === user.id || (user.createdRoomId && r.id === user.createdRoomId)
    );

    if (!userRoom && user.hasActiveRoom && user.createdRoomId) {
      userRoom = {
        id: user.createdRoomId,
        title: user.roomName || `غرفة ${user.name}`,
        hostId: user.id,
        ownerId: user.id,
        hostName: user.name,
        hostAvatar: user.avatar,
        coverImage: user.roomCoverImage || user.avatar,
        category: 'غرف شائعة',
        backgroundUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
        listenersCount: 1,
        diamonds: 0,
        level: 1,
        seats: Array.from({ length: 10 }, (_, i) => ({
          seatId: i + 1,
          isLocked: false,
          isMuted: false,
          speakerUser: i === 0 ? user : undefined,
          points: 0,
        })),
        messages: [],
        createdAt: Date.now(),
      };
      setRooms((prev) => [userRoom!, ...prev]);
      saveRoomToRealtimeDb(userRoom);
    }

    if (!userRoom) {
      // (قيمة "تحتوي على غرفة" == خطأ أو فارغة): افتح صفحة إنشاء غرفة
      setShowCreateRoomModal(true);
    } else {
      // (قيمة "تحتوي على غرفة" == صحيح): اعرض تنبيه وحول المستخدم مباشرة لغرفته
      showToast('أهلاً بك! جاري تحويلك لغرفتك الصوتية... 🎙️');
      setActiveVoiceRoom(userRoom);
    }
  };

  // Immediate synchronous room updater for Home list and active room
  const handleUpdateRoomInList = (updatedRoom: VoiceRoom) => {
    setRooms((prev) => {
      const next = prev.map((r) => (r.id === updatedRoom.id ? { ...r, ...updatedRoom } : r));
      return sanitizeAndDeduplicateRooms(next);
    });
    if (activeVoiceRoom && activeVoiceRoom.id === updatedRoom.id) {
      setActiveVoiceRoom((prev) => (prev ? { ...prev, ...updatedRoom } : prev));
    }
  };

  // Admin permission toggle for one-time room creation
  const handleToggleUserRoomPermission = (userId: string, allowed: boolean) => {
    setUser((prev) => ({
      ...prev,
      isAllowedToCreateRoom: allowed,
    }));
  };

  const handleUpdateUser = (updatedProps: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedProps };
      try {
        localStorage.setItem('saleem_saved_user', JSON.stringify(updated));
        if (updatedProps.equippedFrame || updatedProps.equippedEntrance || updatedProps.equippedBadge || updatedProps.equippedBubble) {
          const currentEq = JSON.parse(localStorage.getItem('saleem_equipped_items') || '{}');
          if (updatedProps.equippedFrame !== undefined) currentEq.frame = updatedProps.equippedFrame;
          if (updatedProps.equippedEntrance !== undefined) currentEq.entrance = updatedProps.equippedEntrance;
          if (updatedProps.equippedBadge !== undefined) currentEq.title = updatedProps.equippedBadge;
          if (updatedProps.equippedBubble !== undefined) currentEq.bubble = updatedProps.equippedBubble;
          localStorage.setItem('saleem_equipped_items', JSON.stringify(currentEq));
        }
      } catch (e) {
        console.error('Error saving updated user to localStorage', e);
      }
      if (updated && updated.id) {
        saveUserToFirebase(updated);
      }
      return updated;
    });
  };

  const handleLoginSuccess = async (rawProvider: string, googleUserData?: Partial<UserProfile>) => {
    const normalized = normalizeProvider(rawProvider);
    const targetUserId = googleUserData?.id || `user-google-${Date.now()}`;

    // 1. Check if this account already created a room in RTDB/state
    const existingRoom = rooms.find((r) => r.hostId === targetUserId);

    // 2. Build user profile immediately for 0ms lag login
    const loggedInUser: UserProfile = {
      ...defaultUser,
      ...googleUserData,
      id: targetUserId,
      name: googleUserData?.name || 'مستخدم سليم',
      avatar: googleUserData?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      email: googleUserData?.email || '',
      provider: normalized.original || rawProvider,
      isLoggedIn: true,
      lastLogin: new Date().toISOString(),
      hasActiveRoom: !!existingRoom,
      isAllowedToCreateRoom: !existingRoom,
      createdRoomId: existingRoom?.id,
      roomName: existingRoom?.title,
    };

    // INSTANT UI TRANSITION (لا انتظار للشاشات)
    setUser(loggedInUser);
    setShowLogin(false);
    showToast(`تم تسجيل الدخول بنجاح عبر ${normalized.displayName}! 👑`);

    try {
      localStorage.setItem('saleem_saved_user', JSON.stringify(loggedInUser));
      localStorage.setItem('saleem_last_authenticated_user', JSON.stringify(loggedInUser));
    } catch (e) {
      console.error('Error saving user to localStorage:', e);
    }

    // 3. Asynchronously fetch existing Firestore user & save in background
    (async () => {
      try {
        const existingFirestoreUser = await getUserFromFirebase(targetUserId);
        if (existingFirestoreUser && (existingFirestoreUser.id !== undefined || existingFirestoreUser.coins !== undefined)) {
          const merged: UserProfile = {
            ...loggedInUser,
            coins: existingFirestoreUser.coins ?? loggedInUser.coins,
            diamonds: existingFirestoreUser.diamonds ?? loggedInUser.diamonds,
            wealthLevel: existingFirestoreUser.wealthLevel ?? loggedInUser.wealthLevel,
            wealthXp: existingFirestoreUser.wealthXp ?? loggedInUser.wealthXp,
            followersCount: existingFirestoreUser.followersCount ?? loggedInUser.followersCount,
            followingCount: existingFirestoreUser.followingCount ?? loggedInUser.followingCount,
            ...existingFirestoreUser,
            isLoggedIn: true,
          };
          setUser(merged);
          localStorage.setItem('saleem_saved_user', JSON.stringify(merged));
        }

        if (loggedInUser && loggedInUser.id) {
          await saveUserToFirebase(loggedInUser);
        }
      } catch (err) {
        console.warn('Background sync note:', err);
      }
    })();
  };

  const handleLogout = async () => {
    // CRITICAL CHECK: Always verify user and user.id exist before updating logout status in Firebase
    if (user && user.id) {
      await updateUserLogoutStatusInFirebase(user);
    } else {
      console.warn('⚠️ [App] user or user.id is missing during logout.');
    }

    await signOutFromFirebase();
    localStorage.removeItem('saleem_saved_user');
    setUser(defaultUser);
    setShowLogin(true);
    showToast('تم تسجيل الخروج بنجاح وتحديث الحالة في Firebase 👋');
  };

  const handleManualAddCoins = (amount: number) => {
    handleUpdateCoins(amount);
  };

  const handleSendGift = (gift: GiftItem, recipientName: string, recipientUserId?: string) => {
    if (user.coins < gift.priceCoins) {
      alert('رصيد العملات غير كافٍ لإرسال هذه الهدية! يمكنك الشحن عبر المتجر.');
      setShowCoinStoreModal(true);
      return;
    }
    // 1. Deduct coins from sender
    handleUpdateCoins(-gift.priceCoins);

    // 2. Add diamonds to recipient (or user themselves if gifting own room/self)
    const targetUserId = recipientUserId || user.id;
    const diamondsEarned = gift.priceCoins;

    if (targetUserId === user.id) {
      handleUpdateDiamonds(diamondsEarned);
    }

    // 3. Update Firebase RTDB & Agency Target touches in real-time
    incrementUserDiamondsInFirebase(targetUserId, diamondsEarned).catch(() => { });
    recordAgencyGiftActivity(targetUserId, diamondsEarned).catch(() => { });
  };

  // Filter rooms based on active category tab, search query, region & advanced filters
  const filteredRooms = rooms
    .filter((r) => {
      // 1. Category check (with 24h transition rule for new rooms)
      let matchesCategory = false;
      const isNewRoom = r.category === 'غرف جديدة' || (r.createdAt && (Date.now() - r.createdAt < 24 * 60 * 60 * 1000));

      if (roomCategoryTab === 'غرف جديدة') {
        matchesCategory = Boolean(isNewRoom);
      } else if (roomCategoryTab === 'غرف شائعة') {
        // Popular rooms show all active rooms, ranked by live support
        matchesCategory = true;
      } else if (roomCategoryTab === 'متابعة') {
        matchesCategory = Boolean(r.hasFriendsInside);
      } else if (roomCategoryTab === 'غرف الحفلات') {
        matchesCategory = Boolean(r.partyEvent || r.category === 'غرف الحفلات' || (r.tag && r.tag.includes('حفلة')));
      } else {
        matchesCategory = r.category === roomCategoryTab;
      }

      // 2. Region check (عربية vs أجنبية vs الكل)
      let matchesRegion = true;
      if (regionFilter === 'arabic') {
        matchesRegion = r.regionType === 'arabic' || r.language === 'العربية' || (!r.regionType && r.language !== 'English' && r.language !== 'التركية');
      } else if (regionFilter === 'foreign') {
        matchesRegion = r.regionType === 'foreign' || r.language === 'English' || r.language === 'التركية';
      }

      // 3. Search query check
      const matchesQuery =
        searchQuery.trim() === '' ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.country && r.country.toLowerCase().includes(searchQuery.toLowerCase()));

      // 4. Member count filter check
      let matchesMember = true;
      if (memberFilter === 'high') {
        matchesMember = r.listenersCount >= 50;
      } else if (memberFilter === 'medium') {
        matchesMember = r.listenersCount >= 15 && r.listenersCount < 50;
      } else if (memberFilter === 'quiet') {
        matchesMember = r.listenersCount < 15;
      }

      // 5. Language filter check
      let matchesLanguage = true;
      if (languageFilter !== 'all') {
        matchesLanguage = (r.language || 'العربية') === languageFilter;
      }

      // 6. Friends inside room check
      let matchesFriends = true;
      if (friendsFilter === 'friends_only') {
        matchesFriends = Boolean(r.hasFriendsInside);
      }

      return matchesCategory && matchesRegion && matchesQuery && matchesMember && matchesLanguage && matchesFriends;
    })
    .sort((a, b) => {
      // Sort by Support Score (Diamonds / Gifts + Listeners + Level) descending
      const scoreA = (a.diamonds || 0) + (a.listenersCount || 0) * 10 + (a.level || 1) * 50;
      const scoreB = (b.diamonds || 0) + (b.listenersCount || 0) * 10 + (b.level || 1) * 50;
      return scoreB - scoreA;
    });

  return (
    <div dir={dir} className={`min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col items-center justify-start ${isPhoneFrameMode && !Capacitor.isNativePlatform() ? 'py-0 sm:py-4' : 'py-0'}`}>
      {/* Top Floating View Mode Switcher for Desktop Browser viewports */}
      {!Capacitor.isNativePlatform() && (
        <div className="hidden lg:flex items-center gap-2 mb-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full shadow-lg text-xs z-40">
          <span className="text-slate-400 font-bold">{t('viewMode')}</span>
          <button
            onClick={() => setIsPhoneFrameMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${isPhoneFrameMode
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{t('phoneMode')}</span>
          </button>
          <button
            onClick={() => setIsPhoneFrameMode(false)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${!isPhoneFrameMode
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{t('fullMode')}</span>
          </button>
        </div>
      )}

      {/* Main Android / Universal App Container Shell */}
      <div
        className={`w-full transition-all duration-300 relative bg-slate-950 flex flex-col min-h-screen ${isPhoneFrameMode && !Capacitor.isNativePlatform()
            ? 'max-w-[440px] sm:min-h-[850px] sm:max-h-[92vh] sm:rounded-[44px] sm:border-[10px] sm:border-slate-800 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] sm:overflow-hidden'
            : 'max-w-full md:max-w-3xl lg:max-w-5xl mx-auto'
          }`}
      >
        {/* Android Native Status Bar (Only shown in desktop phone frame preview mode) */}
        {isPhoneFrameMode && !Capacitor.isNativePlatform() && <AndroidStatusBar />}

        {/* Top App Header */}
        <Header
          user={user}
          onOpenCoinStore={() => setShowCoinStoreModal(true)}
          onOpenAdminPanel={() => setShowAdminPanelModal(true)}
          onOpenVipModal={() => setShowVipModal(true)}
          onOpenProfile={() => setMainTab('profile')}
          onOpenWithdrawalModal={() => setShowWithdrawalModal(true)}
          onOpenDailySpin={() => setShowDailySpinModal(true)}
        />

        {/* Main Viewport Content Area */}
        <main className="flex-1 overflow-y-auto px-3 py-2 pb-24 scrollbar-none">
          <AnimatePresence mode="wait">
            {mainTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="space-y-3.5"
              >
                {/* Interactive Slogan Banner */}
                <Banner
                  onOpenGames={() => setShowGamesModal(true)}
                  onOpenStore={() => setShowCoinStoreModal(true)}
                  onOpenVip={() => setShowVipModal(true)}
                />

                {/* Quick Action Categories Bar */}
                <QuickCategories
                  user={user}
                  onOpenVip={() => setShowVipModal(true)}
                  onOpenLeaderboard={() => setShowLeaderboardModal(true)}
                  onOpenGifts={() => setShowCoinStoreModal(true)}
                  onOpenAgencies={handleOpenAgencies}
                  onOpenEvents={() => setShowGamesModal(true)}
                  onOpenGames={() => setShowGamesModal(true)}
                  onOpenMoments={() => setMainTab('moments')}
                  onOpenSpecialIdStore={() => setShowSpecialIdStoreModal(true)}
                />

                {/* Room Tabs & Search */}
                <RoomTabs
                  activeTab={roomCategoryTab}
                  onTabChange={setRoomCategoryTab}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  regionFilter={regionFilter}
                  onRegionFilterChange={setRegionFilter}
                  memberFilter={memberFilter}
                  onMemberFilterChange={setMemberFilter}
                  languageFilter={languageFilter}
                  onLanguageFilterChange={setLanguageFilter}
                  friendsFilter={friendsFilter}
                  onFriendsFilterChange={setFriendsFilter}
                  onResetFilters={() => {
                    setRegionFilter('all');
                    setMemberFilter('all');
                    setLanguageFilter('all');
                    setFriendsFilter('all');
                    setSearchQuery('');
                  }}
                />

                {/* Voice Rooms Grid OR Live Stream Hub */}
                {roomCategoryTab === 'غرف اللايف 🔴' ? (
                  <LiveStreamHub
                    user={user}
                    onOpenLiveStream={(selectedStream) => {
                      setSelectedLiveStream(selectedStream || null);
                      setShowLiveStreamModal(true);
                    }}
                    onOpenGames={() => setShowGamesModal(true)}
                  />
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
                      <span>{t('activeRoomsCount')} ({filteredRooms.length})</span>
                      <button
                        onClick={handleOpenAgencies}
                        className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-md transition-all active:scale-95 text-xs cursor-pointer"
                      >
                        {user.hasActiveRoom ? `🎙️ ${t('myRoom')}` : `➕ ${t('createRoom')}`}
                      </button>
                    </div>

                    {filteredRooms.length === 0 ? (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs space-y-2">
                        <p>{t('noRoomsFound')}</p>
                        <button
                          onClick={handleOpenAgencies}
                          className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl active:scale-95 transition-transform cursor-pointer"
                        >
                          {t('createFirstRoom')}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                        {filteredRooms.map((room) => (
                          <RoomCard
                            key={room.id}
                            room={room}
                            onOpenRoom={(r) => handleTryOpenRoom(r)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Other Main Navigation Views */}
            {mainTab === 'moments' && (
              <motion.div
                key="moments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <MomentsFeedView
                  user={user}
                  activeRoom={activeVoiceRoom}
                  onOpenRoom={(room) => handleTryOpenRoom(room)}
                />
              </motion.div>
            )}

            {mainTab === 'chats' && (
              <motion.div
                key="chats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <DirectChatsView
                  currentUser={user}
                  rooms={rooms}
                  onOpenRoom={(room) => handleTryOpenRoom(room)}
                  onBack={() => setMainTab('home')}
                />
              </motion.div>
            )}

            {mainTab === 'friends' && (
              <motion.div
                key="friends"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <FriendsView
                  currentUser={user}
                  onOpenDirectChat={(targetUser) => {
                    setMainTab('messages');
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('app:open-direct-chat', { detail: targetUser }));
                    }, 50);
                  }}
                  onOpenRoom={(roomId) => {
                    const found = rooms.find((r) => r.id === roomId);
                    if (found) handleTryOpenRoom(found);
                  }}
                />
              </motion.div>
            )}

            {mainTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <ProfileView
                  user={user}
                  onOpenCoinStore={() => setShowCoinStoreModal(true)}
                  onOpenVipModal={() => setShowVipModal(true)}
                  onOpenAdminPanel={() => setShowAdminPanelModal(true)}
                  onOpenWithdrawalModal={() => setShowWithdrawalModal(true)}
                  onUpdateUser={handleUpdateUser}
                  onBack={() => setMainTab('home')}
                  onLogout={handleLogout}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Sticky Android Bottom Navigation Bar */}
        <BottomNav
          activeTab={mainTab}
          onTabChange={setMainTab}
          hasActiveRoom={Boolean(
            (user.hasActiveRoom && user.createdRoomId) ||
            rooms.some((r) => r.hostId === user.id || (user.createdRoomId && r.id === user.createdRoomId))
          )}
          onCenterAction={handleOpenAgencies}
        />

        {/* Android Gesture Bar (Only shown in desktop phone frame preview mode) */}
        {isPhoneFrameMode && !Capacitor.isNativePlatform() && <AndroidGestureBar />}
      </div>

      {/* Live Stream Broadcast Modal (Agora RTC + WebRTC Camera) */}
      {showLiveStreamModal && (
        <LiveStreamModal
          user={user}
          initialStream={selectedLiveStream}
          onClose={() => {
            setShowLiveStreamModal(false);
            setSelectedLiveStream(null);
          }}
          onSendGift={handleSendGift}
          onOpenCoinStore={() => setShowCoinStoreModal(true)}
        />
      )}

      {/* Active Voice Room View Modal */}
      {activeVoiceRoom && (
        <div className={isRoomMinimized ? 'hidden' : 'block'}>
          <VoiceRoomModal
            room={activeVoiceRoom}
            user={user}
            onClose={() => {
              setActiveVoiceRoom(null);
              setIsRoomMinimized(false);
            }}
            onMinimize={() => setIsRoomMinimized(true)}
            onOpenGames={() => setShowGamesModal(true)}
            onSendGift={handleSendGift}
            onOpenCoinStore={() => setShowCoinStoreModal(true)}
            onOpenWithdrawalModal={() => setShowWithdrawalModal(true)}
            onUpdateUser={handleUpdateUser}
            onUpdateRoom={handleUpdateRoomInList}
          />
        </div>
      )}

      {/* Mini Floating Room Widget (نافذة الغرفة العائمة عند التصغير) */}
      {activeVoiceRoom && isRoomMinimized && (
        <MiniFloatingRoomWidget
          room={activeVoiceRoom}
          user={user}
          onRestore={() => setIsRoomMinimized(false)}
          onClose={() => {
            setActiveVoiceRoom(null);
            setIsRoomMinimized(false);
          }}
        />
      )}

      {/* Create Room Modal */}
      {showCreateRoomModal && (
        <CreateRoomModal
          user={user}
          onClose={() => setShowCreateRoomModal(false)}
          onCreateRoomSuccess={handleCreateRoomSuccess}
          onOpenAdminPanel={() => setShowAdminPanelModal(true)}
        />
      )}

      {/* Mini-Games Modal */}
      {showGamesModal && (
        <MiniGamesModal
          user={user}
          onClose={() => setShowGamesModal(false)}
          onUpdateCoins={handleUpdateCoins}
          onOpenCoinStore={() => setShowCoinStoreModal(true)}
          onOpenWithdrawalModal={() => setShowWithdrawalModal(true)}
        />
      )}

      {/* Coin Store Modal */}
      {showCoinStoreModal && (
        <CoinStoreModal
          user={user}
          onClose={() => setShowCoinStoreModal(false)}
          onPurchaseSuccess={handlePurchaseCoinsSuccess}
        />
      )}

      {/* Cash Withdrawal & Diamond Exchange Modal */}
      {showWithdrawalModal && (
        <WithdrawalModal
          user={user}
          withdrawalRequests={withdrawalRequests}
          onClose={() => setShowWithdrawalModal(false)}
          onUpdateDiamonds={handleUpdateDiamonds}
          onUpdateCoins={handleUpdateCoins}
          onUpdateTargetRewardDiamonds={handleUpdateTargetRewardDiamonds}
          onSubmitWithdrawalRequest={handleSubmitWithdrawalRequest}
        />
      )}

      {/* VIP Perks Modal */}
      {showVipModal && (
        <VipModal
          user={user}
          onClose={() => setShowVipModal(false)}
          onOpenCoinStore={() => {
            setShowVipModal(false);
            setShowCoinStoreModal(true);
          }}
        />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboardModal && (
        <LeaderboardModal onClose={() => setShowLeaderboardModal(false)} currentUser={user} />
      )}

      {/* Admin Panel Modal */}
      {showAdminPanelModal && (
        <AdminPanelModal
          user={user}
          transactions={transactions}
          withdrawalRequests={withdrawalRequests}
          onClose={() => setShowAdminPanelModal(false)}
          onToggleUserRoomPermission={handleToggleUserRoomPermission}
          onManualAddCoins={handleManualAddCoins}
          onUpdateWithdrawalStatus={handleUpdateWithdrawalStatus}
        />
      )}

      {/* Daily Free Lucky Spin Wheel Modal */}
      {showDailySpinModal && (
        <DailySpinModal
          user={user}
          onClose={() => setShowDailySpinModal(false)}
          onRewardWon={(reward) => {
            if (reward.type === 'coins') {
              setUser((prev) => ({ ...prev, coins: prev.coins + reward.amount }));
            } else if (reward.type === 'diamonds') {
              setUser((prev) => ({ ...prev, diamonds: prev.diamonds + reward.amount }));
            } else if (reward.type === 'xp') {
              setUser((prev) => ({ ...prev, wealthXp: (prev.wealthXp || 45200) + reward.amount }));
            }
          }}
        />
      )}

      {/* Special VIP ID Store Modal */}
      {showSpecialIdStoreModal && (
        <SpecialIdStoreModal
          user={user}
          onClose={() => setShowSpecialIdStoreModal(false)}
          onPurchaseId={(newId, cost) => {
            setUser((prev) => ({
              ...prev,
              id: newId,
              coins: Math.max(0, prev.coins - cost),
            }));
          }}
          onOpenCoinStore={() => {
            setShowSpecialIdStoreModal(false);
            setShowCoinStoreModal(true);
          }}
        />
      )}

      {/* Room Password / PIN Entry Gatekeeper Modal */}
      {pendingRoomForPin && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="w-full max-w-sm bg-[#150d24] border-2 border-amber-500/60 rounded-3xl p-5 space-y-4 text-right shadow-2xl text-white relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-500/20 text-amber-300 border border-amber-400/50 rounded-2xl shadow">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">غرفة محمية برمز سري 🔒</h3>
                  <p className="text-[10px] text-amber-300/80">يرجى إدخال رمز المرور للدخول</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingRoomForPin(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Room Brief Card */}
            <div className="flex items-center gap-3 p-3 bg-slate-900/90 border border-purple-500/30 rounded-2xl">
              <img
                src={pendingRoomForPin.coverImage || pendingRoomForPin.hostAvatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150'}
                alt={pendingRoomForPin.title}
                className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400/80 shrink-0 shadow"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-black text-xs text-amber-200 truncate">{pendingRoomForPin.title}</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">المالك: {pendingRoomForPin.hostName}</p>
              </div>
            </div>

            {/* Error Banner */}
            {pinErrorMsg && (
              <div className="p-2.5 bg-red-950/80 border border-red-500/60 rounded-xl text-xs text-red-200 flex items-center gap-2 animate-bounce">
                <span>⚠️</span>
                <span>{pinErrorMsg}</span>
              </div>
            )}

            {/* PIN Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-300 text-center">
                أدخل رمز المرور السري (PIN):
              </label>
              <input
                type="password"
                maxLength={8}
                value={pinInputValue}
                onChange={(e) => {
                  setPinInputValue(e.target.value);
                  if (pinErrorMsg) setPinErrorMsg(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const expectedPin = String(pendingRoomForPin.pinCode || (pendingRoomForPin as any).password || '').trim();
                    if (pinInputValue.trim() === expectedPin) {
                      setActiveVoiceRoom(pendingRoomForPin);
                      setPendingRoomForPin(null);
                    } else {
                      setPinErrorMsg('رمز المرور غير صحيح ❌ حاول مرة أخرى');
                    }
                  }
                }}
                placeholder="••••"
                className="w-full bg-slate-950 border border-amber-500/50 rounded-2xl py-3 text-center font-mono font-black text-xl text-amber-300 tracking-[0.5em] focus:outline-none focus:border-amber-400 shadow-inner"
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const expectedPin = String(pendingRoomForPin.pinCode || (pendingRoomForPin as any).password || '').trim();
                  if (pinInputValue.trim() === expectedPin) {
                    setActiveVoiceRoom(pendingRoomForPin);
                    setPendingRoomForPin(null);
                  } else {
                    setPinErrorMsg('رمز المرور غير صحيح ❌ حاول مرة أخرى');
                  }
                }}
                className="py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" />
                <span>دخول الغرفة 🔓</span>
              </button>

              <button
                type="button"
                onClick={() => setPendingRoomForPin(null)}
                className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SplashScreen overlay on app launch */}
      {showSplash && (
        <SplashScreen
          onStart={() => {
            setShowSplash(false);
            try {
              const savedRaw = localStorage.getItem('saleem_saved_user');
              if (savedRaw) {
                const parsed = JSON.parse(savedRaw);
                if (parsed && parsed.id && parsed.isLoggedIn !== false) {
                  setShowLogin(false);
                  return;
                }
              }
            } catch (e) { }

            if (user && user.id && user.isLoggedIn) {
              setShowLogin(false);
            } else {
              setShowLogin(true);
            }
          }}
        />
      )}

      {/* LoginScreen overlay */}
      {showLogin && (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}

      {/* Floating Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-[#1a0f2e]/95 border border-amber-500/60 text-amber-200 font-black text-xs px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="text-base">⚠️</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
