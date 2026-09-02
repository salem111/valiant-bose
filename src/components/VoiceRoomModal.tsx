import React, { useState, useEffect, useRef, useMemo } from 'react';
import { VoiceRoom, UserProfile, GiftItem, MicSeat, RoomMessage, CloudTrack, ActiveGiftAnimation, LuckyRewardResult, RedPacketItem, PKBattleState } from '../types';
import { SeatGridSettingsModal, SeatLayoutSelection } from './SeatGridSettingsModal';
import { AvatarWithFrame } from './AvatarWithFrame';
import { UserProfileCard } from './UserProfileCard';
import { MOCK_GIFTS } from '../data/mockData';
import { RoomInfoModal } from './RoomInfoModal';
import { RoomSettingsModal } from './RoomSettingsModal';
import { GiftSelectorModal, calculateLuckyReward } from './GiftSelectorModal';
import { Gift3DAnimationOverlay } from './Gift3DAnimationOverlay';
import { HostTargetModal } from './agency/HostTargetModal';
import { RedPacketModal } from './redpacket/RedPacketModal';
import { PKBattleOverlay } from './pk/PKBattleOverlay';
import { PKSetupModal } from './pk/PKSetupModal';
import { PartyScheduleModal, RoomPartyEvent } from './party/PartyScheduleModal';
import { RoomTopSupportersModal } from './room/RoomTopSupportersModal';
import { RoomRankingCupModal } from './room/RoomRankingCupModal';
import { LuxuryEntranceOverlay, EntranceData, ENTRANCE_CONFIGS } from './room/LuxuryEntranceOverlay';
import { VoiceFxModal } from './audio/VoiceFxModal';

import { LuckyRoomChestModal } from './room/LuckyRoomChestModal';
import { useI18n } from '../lib/i18n';
import {
  listenToSingleRoom,
  saveRoomToRealtimeDb,
  setSeatSpeakerInRealtimeDb,
  clearSeatSpeakerInRealtimeDb,
  setSeatLockInRealtimeDb,
  setSeatMuteInRealtimeDb,
  updateRoomModsInRealtimeDb,
  postRoomMessageInRealtimeDb,
  saveUserToFirebase,
  setupRoomPresence,
  listenToRoomMembers,
  removeRoomMember,
  setupSeatOnDisconnect,
  cancelSeatOnDisconnect,
  clearRoomMessagesInRealtimeDb,
  updateRoomSpeakingLevel,
  listenToRoomSpeakingLevels,
  listenToUserCloudMusicPlaylist,
  addTrackToCloudPlaylist,
  removeTrackFromCloudPlaylist,
  listenToRoomLiveMusic,
  broadcastRoomLiveMusic,
  stopRoomLiveMusic,
  listenToRoomCinema,
  broadcastRoomCinema,
  stopRoomCinema,
  listenToPKBattle,
  broadcastPKBattle,
  updatePKScore,
  stopPKBattle,
} from '../lib/firebase';
import { recordAgencyGiftActivity, startAgencyLiveSession, stopAgencyLiveSession } from '../lib/agencyService';
import { agoraVoiceManager, getAgoraNumericUid } from '../lib/agoraVoiceManager';
import { audioSyncEngine } from '../lib/audioSyncEngine';
import {
  ChevronLeft,
  Power,
  Users,
  Flame,
  Crown,
  Trophy,
  Plus,
  Gift,
  Gamepad2,
  Grid,
  LayoutGrid,
  Music,
  Music2,
  MessageSquare,
  Hand,
  Volume2,
  Mic,
  MicOff,
  Send,
  Smile,
  Minimize2,
  Maximize2,
  X,
  Lock,
  Unlock,
  UserX,
  UserMinus,
  UserPlus,
  Check,
  Heart,
  Sparkles,
  VolumeX,
  Share2,
  Megaphone,
  ZapOff,
  Repeat,
  SkipBack,
  SkipForward,
  Palette,
  Image as ImageIcon,
  Calendar,
  Award,
  Copy,
  CheckCircle2,
  Shield,
  Video,
  VideoOff,
  Camera,
  RotateCcw,
  Cloud,
  Play,
  Pause,
  Trash2,
  FolderPlus,
  CloudLightning,
  ShieldAlert,
  Inbox,
  MoreHorizontal,
  Settings,
  ShieldOff,
  Bot,
  Cpu,
  Globe,
  Youtube,
  Tv,
  Link2,
  ExternalLink,
  Headphones,
  Square,
  Radio,
} from 'lucide-react';

const royalStageBannerAsset = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80';
const CINEMA_THEATER_BACKGROUND = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80';

export const ROOM_BACKGROUND_THEMES = [
  {
    id: 'bg-royal-stage-concept',
    title: '🎭 مسرح المسرح الملكي الحصري',
    desc: 'منصة صوتية ملكية فاخرة بأضواء بنفسجية وذهبية نيون',
    url: royalStageBannerAsset,
    tag: 'مفهوم المفهوم الملكي 🌟',
  },
  {
    id: 'bg-royal-gold',
    title: '🏰 القصر الملكي الذهبي',
    desc: 'أعمدة رخام فاخرة وإضاءات ملكية دافئة',
    url: 'https://images.unsplash.com/photo-1541971875076-8f970d573be6?w=1200&q=80',
    tag: 'ملكي فاخر 👑',
  },
  {
    id: 'bg-golden-nebula',
    title: '🌌 السديم الذهبي الملكي',
    desc: 'مجرة ذهبية ساحرة تعكس بريق النجوم',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&q=80',
    tag: 'ذهبي ساحر ✨',
  },
  {
    id: 'bg-royal-rose-gold',
    title: '🌹 سحر الورد والمخمل الملكي',
    desc: 'خلفية فاخرة بنقوش الورد والسحب المخملية مع أطواق الذهب والماس الملكية',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80',
    tag: 'ملكي فاخر 👑',
  },
  {
    id: 'bg-black-velvet',
    title: '🖤 المخمل الأسود الذهبي',
    desc: 'رخام أسطوري أسود مع عروق الذهب 24K',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
    tag: 'أسود أسطوري 🖤',
  },
  {
    id: 'bg-ruby-gold',
    title: '👑 عرش الياقوت والذهب',
    desc: 'سجاد ياقوتي وقصر سلطاني ملكي',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&q=80',
    tag: 'عرش السلطان 👑',
  },
  {
    id: 'bg-emerald-palace',
    title: '💎 عالم الزمرد والماس',
    desc: 'زمرد ملكي فاخر وأضواء بلورية',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80',
    tag: 'زمرد وذهب 💎',
  },
  {
    id: 'bg-sunset-glow',
    title: '🌅 الشفق الذهبي الملكي',
    desc: 'أفق غروب ذهبي وتأثيرات ضوئية دافئة',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    tag: 'غروب الذهب 🌅',
  },
  {
    id: 'bg-cyber-gold',
    title: '⚡ السايبر الذهبي الفاخر',
    desc: 'نيون أصفر ذهبي وشبكة تفاعلية راقية',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80',
    tag: 'سايبر ملكي ⚡',
  },
  {
    id: 'bg-persian-silk',
    title: '🌺 الحرير الفارسي المذهب',
    desc: 'نقوش وزخارف حريرية شرقية فاخرة',
    url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=1200&q=80',
    tag: 'حرير وذهب 🌺',
  },
  {
    id: 'bg-crystal-galaxy',
    title: '🔮 مجرة الكريستال الذهبية',
    desc: 'سحب بلورية عائمة في فضاء ملكي',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80',
    tag: 'كريستال ذهبي 🔮',
  },
  {
    id: 'bg-roman-forum',
    title: '🏛️ القصر الروماني المذهب',
    desc: 'أعمدة وأقواس أثرية ببريق الذهب',
    url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80',
    tag: 'قصر روماني 🏛️',
  },
];

interface VoiceRoomModalProps {
  room: VoiceRoom;
  user: UserProfile;
  onClose: () => void;
  onMinimize?: () => void;
  onOpenGames: () => void;
  onSendGift: (gift: GiftItem, recipientName: string) => void;
  onUpdateRoomAnnouncement?: (roomId: string, newAnnouncement: string) => void;
  onUpdateRoom?: (updatedRoom: VoiceRoom) => void;
  onOpenCoinStore?: () => void;
  onOpenWithdrawalModal?: () => void;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
}

export const VoiceRoomModal: React.FC<VoiceRoomModalProps> = ({
  room,
  user,
  onClose,
  onMinimize,
  onOpenGames,
  onSendGift,
  onUpdateRoomAnnouncement,
  onUpdateRoom,
  onOpenCoinStore,
  onOpenWithdrawalModal,
  onUpdateUser,
}) => {
  const { t, dir } = useI18n();
  const [currentUser, setCurrentUser] = useState<UserProfile>(user);
  const [activeFloatingGift, setActiveFloatingGift] = useState<{
    gift: GiftItem;
    sender: string;
    amount: number;
  } | null>(null);
  const [active3DAnimation, setActive3DAnimation] = useState<ActiveGiftAnimation | null>(null);
  const [activeEntranceAnimation, setActiveEntranceAnimation] = useState<EntranceData | null>(null);

  // Floating Circular Fast Repeat / Multi-Send Combo Button State
  const [floatingCombo, setFloatingCombo] = useState<{
    gift: GiftItem;
    recipientName: string;
    amount: number;
    comboStreak: number;
    expiresAt: number;
  } | null>(null);
  const [comboProgress, setComboProgress] = useState(100);

  // Countdown timer for floating combo circle (5-second window)
  useEffect(() => {
    if (!floatingCombo) return;

    const interval = setInterval(() => {
      const remainingMs = floatingCombo.expiresAt - Date.now();
      if (remainingMs <= 0) {
        setFloatingCombo(null);
        setComboProgress(0);
      } else {
        setComboProgress((remainingMs / 5000) * 100);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [floatingCombo]);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // Trigger luxury room entrance animation when entering room
  useEffect(() => {
    const entranceId = currentUser.equippedEntrance || 'ent_royal_jet';
    const entranceCfg = ENTRANCE_CONFIGS[entranceId] || ENTRANCE_CONFIGS.ent_royal_jet;

    const timer = setTimeout(() => {
      setActiveEntranceAnimation({
        id: `entry_${Date.now()}_${currentUser.id}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        userFrame: currentUser.equippedFrame,
        vipLevel: currentUser.vipLevel || 5,
        entranceId: entranceId,
        entranceName: entranceCfg.name,
        entranceIcon: entranceCfg.icon,
      });
    }, 700);

    return () => clearTimeout(timer);
  }, [room.id]);

  const [currentRoom, setCurrentRoom] = useState<VoiceRoom>(() => {
    // Ensure room has 20 seats
    const existingSeats = room.seats || [];
    const seats20: MicSeat[] = Array.from({ length: 20 }, (_, index) => {
      const seatNum = index + 1;
      const existing = existingSeats.find((s) => s.seatId === seatNum);
      if (existing) {
        return {
          ...existing,
          points: existing.points ?? 0,
        };
      }
      return {
        seatId: seatNum,
        isLocked: false,
        isMuted: false,
        points: 0,
      };
    });

    return {
      ...room,
      backgroundUrl: room?.backgroundUrl || ROOM_BACKGROUND_THEMES[0].url,
      seats: seats20,
      messages: Array.isArray(room?.messages) ? room.messages : [],
    };
  });

  const [userOnSeat, setUserOnSeat] = useState<number | null>(() => {
    const userSeat = currentRoom.seats.find((s) => s.speakerUser?.id === user.id);
    return userSeat ? userSeat.seatId : null;
  });

  // Determine if current user is the Room Host / Owner
  const isHost = Boolean(
    currentUser.id === currentRoom.hostId ||
    (currentUser.createdRoomId && currentRoom.id === currentUser.createdRoomId) ||
    (currentRoom as any).ownerId === currentUser.id ||
    (currentRoom as any).creatorId === currentUser.id ||
    currentUser.role === 'admin' ||
    currentUser.role === 'owner'
  );

  // Determine if current user is a Room Moderator or Host
  const isMod = Boolean(
    isHost ||
    (Array.isArray(currentRoom.mods) && currentRoom.mods.includes(currentUser.id)) ||
    (currentRoom.mods && typeof currentRoom.mods === 'object' && (currentRoom.mods as Record<string, boolean>)[currentUser.id] === true) ||
    (currentUser.name && Array.isArray(currentRoom.mods) && currentRoom.mods.includes(currentUser.name)) ||
    (currentRoom as any).moderators?.includes?.(currentUser.id) ||
    (currentRoom as any).admins?.includes?.(currentUser.id) ||
    (currentRoom as any).managers?.includes?.(currentUser.id)
  );

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isRoomAudioMuted, setIsRoomAudioMuted] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showGiftSelector, setShowGiftSelector] = useState(false);
  const [selectedSeatForAction, setSelectedSeatForAction] = useState<MicSeat | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showChatBox, setShowChatBox] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showRoomInfoModal, setShowRoomInfoModal] = useState(false);
  const [showSeatSettingsModal, setShowSeatSettingsModal] = useState(false);
  const [showRoomSettingsModal, setShowRoomSettingsModal] = useState(false);
  const [showFullRoomSettings, setShowFullRoomSettings] = useState(false);
  const [showModeratorsListModal, setShowModeratorsListModal] = useState(false);
  const [showQuickToolbar, setShowQuickToolbar] = useState(false);
  const [isPKActive, setIsPKActive] = useState(false);
  const [pkTimeLeft, setPkTimeLeft] = useState(180);
  const [isPartyMode, setIsPartyMode] = useState(false);
  const [showTaskCenter, setShowTaskCenter] = useState(false);
  const [showLuckyBag, setShowLuckyBag] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [isRoomMinimized, setIsRoomMinimized] = useState(false);
  const [showBackgroundsModal, setShowBackgroundsModal] = useState(false);
  const [musicCurrentTime, setMusicCurrentTime] = useState<number>(0);
  const [musicDuration, setMusicDuration] = useState<number>(0);
  const [isMusicLooping, setIsMusicLooping] = useState<boolean>(true);
  const [isAnimationsDisabled, setIsAnimationsDisabled] = useState(false);
  const [isScreenClean, setIsScreenClean] = useState(false);
  const [toolbarToast, setToolbarToast] = useState<string | null>(null);
  const [liveSpeakingLevels, setLiveSpeakingLevels] = useState<Record<string, number>>({});

  // Cinema & YouTube Theater Watch Party States
  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(false);
  const [showCinemaModal, setShowCinemaModal] = useState<boolean>(false);
  const [cinemaVideoId, setCinemaVideoId] = useState<string>('jfKfPfyJRdk');
  const [cinemaVideoTitle, setCinemaVideoTitle] = useState<string>('مقطع سينما الغرفة المميز 🎬🍿');
  const [cinemaInputUrl, setCinemaInputUrl] = useState<string>('');

  const extractYoutubeVideoId = (url: string): string => {
    if (!url) return '';
    const cleanUrl = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) return cleanUrl;
    const match = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
  };

  // Timed Lucky Bag (حقيبة الهدايا الجماعية الموقوتة) Setup & Active Floating State
  const [luckyBagSetupPrice, setLuckyBagSetupPrice] = useState<number>(1000);
  const [luckyBagSetupWinners, setLuckyBagSetupWinners] = useState<number>(20);
  const [luckyBagSetupDuration, setLuckyBagSetupDuration] = useState<number>(120); // Default 120s (2 min)

  // Host Target & Red Packet Modals
  const [showHostTargetModal, setShowHostTargetModal] = useState<boolean>(false);
  const [showRedPacketModal, setShowRedPacketModal] = useState<boolean>(false);

  // PK Battle & Party Schedule States
  const [showPKSetupModal, setShowPKSetupModal] = useState<boolean>(false);
  const [showPartyScheduleModal, setShowPartyScheduleModal] = useState<boolean>(false);
  const [showRoomTopSupportersModal, setShowRoomTopSupportersModal] = useState<boolean>(false);
  const [showRoomRankingCupModal, setShowRoomRankingCupModal] = useState<boolean>(false);
  const [activePartyEvent, setActivePartyEvent] = useState<RoomPartyEvent | null>(currentRoom.partyEvent as any || null);
  const [pkBattleState, setPkBattleState] = useState<PKBattleState | null>(() => {
    return currentRoom.pkState || null;
  });
  const [activeRedPacket, setActiveRedPacket] = useState<RedPacketItem | null>(null);
  const [showVoiceFxModal, setShowVoiceFxModal] = useState<boolean>(false);

  const [showLuckyRoomChestModal, setShowLuckyRoomChestModal] = useState<boolean>(false);
  const [currentVoiceEffect, setCurrentVoiceEffect] = useState<string>('normal');

  // Dynamic Room Top Supporters computed from real room gifts
  const roomSupporters = useMemo(() => {
    if (Array.isArray(currentRoom.topSupporters) && currentRoom.topSupporters.length > 0) {
      return [...currentRoom.topSupporters].sort((a, b) => (b.coins || 0) - (a.coins || 0));
    }
    const map = new Map<string, any>();
    (currentRoom.messages || []).forEach((msg) => {
      if (msg.isGiftNotice && msg.senderName && msg.giftInfo) {
        const key = msg.senderName;
        const giftCoins = (msg.giftInfo.amount || 1) * 100;
        const existing = map.get(key) || {
          id: `sup-${key}`,
          name: msg.senderName,
          avatar: msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          coins: 0,
          vipLevel: msg.senderVip || 1,
          userLevel: 1,
        };
        existing.coins += giftCoins;
        map.set(key, existing);
      }
    });
    return Array.from(map.values()).sort((a, b) => (b.coins || 0) - (a.coins || 0));
  }, [currentRoom.topSupporters, currentRoom.messages]);

  const totalRoomCharm = useMemo(() => {
    return roomSupporters.reduce((acc, curr) => acc + (curr.coins || 0), 0);
  }, [roomSupporters]);

  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  // Real Weekly Room Diamonds (Starts at 0, accumulates real gifts, auto-resets every 7 days)
  const weeklyDiamonds = useMemo(() => {
    const weekStart = currentRoom.diamondsWeekStart || 0;
    if (weekStart > 0 && Date.now() - weekStart > ONE_WEEK_MS) {
      return 0;
    }
    return currentRoom.diamonds || 0;
  }, [currentRoom.diamonds, currentRoom.diamondsWeekStart]);

  const [activeTimedBag, setActiveTimedBag] = useState<{
    id: string;
    dropperName: string;
    dropperAvatar: string;
    totalCoins: number;
    maxWinners: number;
    durationSeconds: number;
    timeLeft: number;
    claimedUserIds: string[];
    status: 'active' | 'expired';
  } | null>(null);

  const [bagWinnersResult, setBagWinnersResult] = useState<{
    winners: { id: string; name: string; avatar: string; coinsWon: number }[];
    totalCoins: number;
    dropperName: string;
    userWonAmount: number;
  } | null>(null);

  // Helper to format seconds into MM:SS (e.g., 00:18)
  const formatTimeMMSS = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Trigger results & random coin distribution when timer reaches 00:00
  const triggerBagResults = (bag: {
    id: string;
    dropperName: string;
    totalCoins: number;
    maxWinners: number;
    claimedUserIds: string[];
  }) => {
    const participantsSet = new Set<string>(bag.claimedUserIds);
    if (currentUser?.id) {
      participantsSet.add(currentUser.id);
    }

    const mockRoomMembers = [
      { id: 'u_101', name: 'أميرة الشرق ⭐', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
      { id: 'u_102', name: 'خالد العنزي 👑', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
      { id: 'u_103', name: 'نورة المطيري 🌸', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
      { id: 'u_104', name: 'فهد القحطاني ⚡', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
      { id: 'u_105', name: 'جاسم الدوسري 💎', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
      { id: currentUser.id || 'me', name: currentUser.name || 'سالم (أنت)', avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }
    ];

    mockRoomMembers.forEach((m) => {
      if (participantsSet.size < bag.maxWinners) {
        participantsSet.add(m.id);
      }
    });

    const finalParticipantIds = Array.from(participantsSet).slice(0, bag.maxWinners);
    const count = finalParticipantIds.length;

    let remainingCoins = bag.totalCoins;
    const winnersList: { id: string; name: string; avatar: string; coinsWon: number }[] = [];
    let myWonAmount = 0;

    finalParticipantIds.forEach((pId, idx) => {
      let coinsWon = 0;
      if (idx === count - 1) {
        coinsWon = Math.max(10, remainingCoins);
      } else {
        const maxShare = Math.floor((remainingCoins / (count - idx)) * 1.8);
        coinsWon = Math.max(10, Math.floor(Math.random() * maxShare) + 15);
        remainingCoins -= coinsWon;
      }

      const matchedMember = mockRoomMembers.find((m) => m.id === pId) || {
        id: pId,
        name: pId === currentUser.id ? `${currentUser.name} (أنت)` : `عضو محظوظ #${pId.slice(-4)}`,
        avatar: pId === currentUser.id ? currentUser.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      };

      if (pId === currentUser.id) {
        myWonAmount = coinsWon;
      }

      winnersList.push({
        id: matchedMember.id,
        name: matchedMember.name,
        avatar: matchedMember.avatar,
        coinsWon
      });
    });

    winnersList.sort((a, b) => b.coinsWon - a.coinsWon);

    if (myWonAmount > 0 && onUpdateUser) {
      onUpdateUser({ coins: currentUser.coins + myWonAmount });
    }

    setBagWinnersResult({
      winners: winnersList,
      totalCoins: bag.totalCoins,
      dropperName: bag.dropperName,
      userWonAmount: myWonAmount
    });

    const systemNoticeMsg: RoomMessage = {
      id: `msg_bag_${Date.now()}`,
      senderName: 'حقيبة الهدايا 🎁',
      senderAvatar: '',
      text: `🎉 انتهى العد التنازلي وتم فتح حقيبة الهدايا الموقوتة (${bag.totalCoins.toLocaleString()} 🪙)! مبروك لـ ${winnersList.length} فائز بـ ${bag.dropperName}.`,
      isSystemNotice: true,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };
    setCurrentRoom((prev) => ({
      ...prev,
      messages: [...prev.messages, systemNoticeMsg]
    }));
  };

  // Live Timer Countdown Hook for Timed Lucky Bag
  useEffect(() => {
    if (!activeTimedBag || activeTimedBag.status !== 'active') return;

    const timer = setInterval(() => {
      setActiveTimedBag((prev) => {
        if (!prev || prev.status !== 'active') return prev;

        if (prev.timeLeft <= 1) {
          triggerBagResults(prev);
          return { ...prev, timeLeft: 0, status: 'expired' };
        }

        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTimedBag?.status, activeTimedBag?.timeLeft]);

  // Real-Time Ejection: If current user is blacklisted or kicked by host/mod while inside the room
  useEffect(() => {
    if (user.id === currentRoom.hostId) {
      return;
    }

    const isBlacklisted =
      Boolean(currentRoom.blackList?.includes(user.id)) ||
      Boolean(currentRoom.blacklistedUsers?.includes(user.id));

    const isKicked = Boolean(
      currentRoom.kickedUsers?.[user.id] &&
      currentRoom.kickedUsers[user.id].expiresAt > Date.now()
    );

    if (isBlacklisted) {
      alert('⛔ لا يمكنك البقاء في الغرفة! لقد تم وضعك في القائمة السوداء وتطبيق الحظر الدائم من قبل إدارة الغرفة.');
      onClose();
    } else if (isKicked) {
      const remMs = (currentRoom.kickedUsers?.[user.id]?.expiresAt || 0) - Date.now();
      const remHours = Math.floor(remMs / (1000 * 60 * 60));
      const remMins = Math.ceil((remMs % (1000 * 60 * 60)) / (1000 * 60));
      alert(`🚫 تم طردك من هذه الغرفة لمدة 24 ساعة من قبل الإدارة! (متبقي ${remHours} ساعة و ${remMins} دقيقة).`);
      onClose();
    }
  }, [currentRoom.blackList, currentRoom.blacklistedUsers, currentRoom.kickedUsers, user.id, onClose]);

  const handleDropTimedLuckyBag = () => {
    if (currentUser.coins < luckyBagSetupPrice) {
      showToast(`⚠️ رصيدك الحالي (${currentUser.coins.toLocaleString()} 🪙) لا يكفي لخصم (${luckyBagSetupPrice.toLocaleString()} 🪙). يرجى الشحن أولاً!`);
      return;
    }

    if (onUpdateUser) {
      onUpdateUser({ coins: currentUser.coins - luckyBagSetupPrice });
    }

    const newBag = {
      id: `bag_${Date.now()}`,
      dropperName: currentUser.name || 'سالم',
      dropperAvatar: currentUser.avatar || '',
      totalCoins: luckyBagSetupPrice,
      maxWinners: luckyBagSetupWinners,
      durationSeconds: luckyBagSetupDuration,
      timeLeft: luckyBagSetupDuration,
      claimedUserIds: [currentUser.id],
      status: 'active' as const
    };

    setActiveTimedBag(newBag);
    setShowLuckyBag(false);

    showToast(`🎉 تم إسقاط حقيبة الهدايا الموقوتة (${luckyBagSetupPrice.toLocaleString()} 🪙) لـ ${formatTimeMMSS(luckyBagSetupDuration)}!`);

    const noticeMsg: RoomMessage = {
      id: `msg_bag_start_${Date.now()}`,
      senderName: 'حقيبة الهدايا 🎁',
      senderAvatar: '',
      text: `🎁 أطلق ${currentUser.name} حقيبة هدايا موقوتة بقيمة ${luckyBagSetupPrice.toLocaleString()} عملة! اضغط على [فَـتْـح] في الغرفة للربح قبل انتهاء المؤقت التنازلي!`,
      isSystemNotice: true,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };
    setCurrentRoom((prev) => ({
      ...prev,
      messages: [...prev.messages, noticeMsg]
    }));
  };

  // User Profile Card Modal & Authorization State
  const [selectedUserProfileCard, setSelectedUserProfileCard] = useState<{
    user: {
      id: string;
      name: string;
      avatar: string;
      gender?: string;
      age?: number;
      wealthLevel?: number;
      vipLevel?: number;
      bio?: string;
      role?: string;
    };
    seatId: number | null;
  } | null>(null);
  const [showProfileOptionsMenu, setShowProfileOptionsMenu] = useState(false);

  // Helper to extract clean YouTube Video ID from any URL format
  const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.trim().match(regExp);
    return match && match[1] ? match[1] : null;
  };

  // Cloud Persistent Music & YouTube state (قائمة التشغيل السحابية ومقاطع اليوتيوب)
  const [cloudPlaylist, setCloudPlaylist] = useState<CloudTrack[]>([]);
  const [activeTrack, setActiveTrack] = useState<CloudTrack | null>(null);
  const [youtubeMode, setYoutubeMode] = useState<'video' | 'audio_only'>('video'); // 'video' = عرض الشاشة والفيديو, 'audio_only' = صوت فقط بالخلفية
  const [musicVolume, setMusicVolume] = useState<number>(85);
  const [liveMusicPlayedBy, setLiveMusicPlayedBy] = useState<string | null>(null);
  const [musicTab, setMusicTab] = useState<'cloud' | 'youtube' | 'featured'>('cloud');
  const [youtubeUrlInput, setYoutubeUrlInput] = useState('');
  const [youtubeTitleInput, setYoutubeTitleInput] = useState('');
  const [showYoutubeFloatingPlayer, setShowYoutubeFloatingPlayer] = useState(false);
  const [isYoutubePipMinimized, setIsYoutubePipMinimized] = useState(false); // false = شاشة مسرحية عريضة فوق المقاعد (Theater Mode), true = تصغير كشاشة عائمة PiP
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicFileInputRef = useRef<HTMLInputElement | null>(null);

  // Featured YouTube Tracks ready with 1-click play & save (أغاني الحماس وسهرات الروم)
  const FEATURED_YOUTUBE_TRACKS: CloudTrack[] = [
    {
      id: 'yt_curated_sherine_tebaan',
      name: 'شيرين - تباعاً تباعاً 🔥',
      dur: '04:12',
      icon: '🔥',
      url: 'https://www.youtube.com/watch?v=-0RUAQAMUac',
      youtubeId: '-0RUAQAMUac',
      thumbnail: 'https://img.youtube.com/vi/-0RUAQAMUac/hqdefault.jpg',
      isYouTube: true,
      isCloud: true,
    },
    {
      id: 'yt_curated_tamally_habba',
      name: 'تملي معاك vs حبه جنة 🔥 (عمرو دياب × شيرين - XVD Remix)',
      dur: '03:45',
      icon: '⚡',
      url: 'https://www.youtube.com/watch?v=4vI0lf_SSIU',
      youtubeId: '4vI0lf_SSIU',
      thumbnail: 'https://img.youtube.com/vi/4vI0lf_SSIU/hqdefault.jpg',
      isYouTube: true,
      isCloud: true,
    },
    {
      id: 'yt_curated_khedny_maak',
      name: 'خذني معك ريمكس 🚗⚡ (XVD Bass Boosted Car Remix)',
      dur: '03:30',
      icon: '🏎️',
      url: 'https://www.youtube.com/watch?v=fb25pVHPBlA',
      youtubeId: 'fb25pVHPBlA',
      thumbnail: 'https://img.youtube.com/vi/fb25pVHPBlA/hqdefault.jpg',
      isYouTube: true,
      isCloud: true,
    },
    {
      id: 'yt_curated_ya_ghaly',
      name: 'يا غالي Ya Ghaly 🌟🔥 (فرقة جيتارا - ريمكس 2026)',
      dur: '03:50',
      icon: '🌟',
      url: 'https://www.youtube.com/watch?v=_2uiUaUeRpQ',
      youtubeId: '_2uiUaUeRpQ',
      thumbnail: 'https://img.youtube.com/vi/_2uiUaUeRpQ/hqdefault.jpg',
      isYouTube: true,
      isCloud: true,
    },
    {
      id: 'yt_curated_shaimaa_heidi',
      name: 'شيماء الراسي - هيدي هيدي 💃🔥 (Exclusive 2026)',
      dur: '03:15',
      icon: '💃',
      url: 'https://www.youtube.com/watch?v=fw2hfXilD0U',
      youtubeId: 'fw2hfXilD0U',
      thumbnail: 'https://img.youtube.com/vi/fw2hfXilD0U/hqdefault.jpg',
      isYouTube: true,
      isCloud: true,
    },
    {
      id: 'yt_curated_dj_umut_midnight',
      name: 'Dj Umut Çevik - Midnight 🌌⚡ (Club Remix Car Music)',
      dur: '03:20',
      icon: '🌌',
      url: 'https://www.youtube.com/watch?v=mt_jtesCO5k',
      youtubeId: 'mt_jtesCO5k',
      thumbnail: 'https://img.youtube.com/vi/mt_jtesCO5k/hqdefault.jpg',
      isYouTube: true,
      isCloud: true,
    },
    {
      id: 'yt_curated_akcent_my_name',
      name: 'Akcent - That\'s My Name ⚡👑 (Ömer Said Remix)',
      dur: '03:40',
      icon: '👑',
      url: 'https://www.youtube.com/watch?v=tNgj8jKKY1o',
      youtubeId: 'tNgj8jKKY1o',
      thumbnail: 'https://img.youtube.com/vi/tNgj8jKKY1o/hqdefault.jpg',
      isYouTube: true,
      isCloud: true,
    },
  ];

  // Subscribe to Cloud Music Playlist from Firebase for currentUser
  useEffect(() => {
    if (!currentUser?.id) return;
    const unsubscribe = listenToUserCloudMusicPlaylist(currentUser.id, (tracks) => {
      setCloudPlaylist(tracks);
    });
    return () => unsubscribe();
  }, [currentUser?.id]);

  // Synchronize Live Room Music in Realtime across Web & Android (عزل كامل ومزامنة فائقة الدقة)
  useEffect(() => {
    if (!currentRoom?.id) return;

    const unsubscribe = listenToRoomLiveMusic(currentRoom.id, (remoteMusic) => {
      if (remoteMusic && remoteMusic.isPlaying && remoteMusic.track) {
        setActiveTrack(remoteMusic.track);
        setIsMusicPlaying(true);
        setLiveMusicPlayedBy(remoteMusic.playedBy || null);
        const mode = remoteMusic.youtubeMode || remoteMusic.track.youtubeMode || 'video';
        setYoutubeMode(mode);

        if (remoteMusic.track.isYouTube || remoteMusic.track.youtubeId) {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          if (mode === 'audio_only') {
            setShowYoutubeFloatingPlayer(false);
          } else {
            setShowYoutubeFloatingPlayer(true);
            setIsYoutubePipMinimized(false);
          }
        } else {
          setShowYoutubeFloatingPlayer(false);
          // Direct cloud audio is transported by Agora from remoteMusic.playedBy.
          // Do not play a second local HTMLAudio copy on every device.
        }
      } else if (!remoteMusic || !remoteMusic.isPlaying) {
        setIsMusicPlaying(false);
        setLiveMusicPlayedBy(null);
        if (audioRef.current) {
          audioRef.current.pause();
        }
        if (!remoteMusic) {
          setShowYoutubeFloatingPlayer(false);
          setActiveTrack(null);
        }
      }
    });

    return () => {
      unsubscribe();
      // عزل الصوت عند مغادرة الغرفة أو الانتقال لغرفة أخرى
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentRoom?.id, musicVolume]);

  // Featured system music tracks
  const FEATURED_MUSIC_TRACKS: CloudTrack[] = [
    {
      id: 'feat_sherine_tebaan',
      name: 'شيرين - تباعاً تباعاً 🔥',
      dur: '04:12',
      icon: '🔥',
      url: 'https://www.youtube.com/watch?v=-0RUAQAMUac',
      youtubeId: '-0RUAQAMUac',
      thumbnail: 'https://img.youtube.com/vi/-0RUAQAMUac/hqdefault.jpg',
      isYouTube: true,
      isCloud: true,
    },
    {
      id: 'feat_tamally_habba',
      name: 'تملي معاك vs حبه جنة 🔥 (عمرو دياب × شيرين - XVD Remix)',
      dur: '03:45',
      icon: '⚡',
      url: 'https://www.youtube.com/watch?v=4vI0lf_SSIU',
      youtubeId: '4vI0lf_SSIU',
      thumbnail: 'https://img.youtube.com/vi/4vI0lf_SSIU/hqdefault.jpg',
      isYouTube: true,
      isCloud: true,
    },
    {
      id: 'feat_khedny_maak',
      name: 'خذني معك ريمكس 🚗⚡ (XVD Bass Boosted Car Remix)',
      dur: '03:30',
      icon: '🏎️',
      url: 'https://www.youtube.com/watch?v=fb25pVHPBlA',
      youtubeId: 'fb25pVHPBlA',
      thumbnail: 'https://img.youtube.com/vi/fb25pVHPBlA/hqdefault.jpg',
      isYouTube: true,
      isCloud: true,
    },
    {
      id: 'feat_ya_ghaly',
      name: 'يا غالي Ya Ghaly 🌟🔥 (فرقة جيتارا - ريمكس 2026)',
      dur: '03:50',
      icon: '🌟',
      url: 'https://www.youtube.com/watch?v=_2uiUaUeRpQ',
      youtubeId: '_2uiUaUeRpQ',
      thumbnail: 'https://img.youtube.com/vi/_2uiUaUeRpQ/hqdefault.jpg',
      isYouTube: true,
      isCloud: true,
    },
    {
      id: 'feat_shaimaa_heidi',
      name: 'شيماء الراسي - هيدي هيدي 💃🔥 (Exclusive 2026)',
      dur: '03:15',
      icon: '💃',
      url: 'https://www.youtube.com/watch?v=fw2hfXilD0U',
      youtubeId: 'fw2hfXilD0U',
      thumbnail: 'https://img.youtube.com/vi/fw2hfXilD0U/hqdefault.jpg',
      isYouTube: true,
      isCloud: true,
    },
    {
      id: 'feat_dj_umut_midnight',
      name: 'Dj Umut Çevik - Midnight 🌌⚡ (Club Remix Car Music)',
      dur: '03:20',
      icon: '🌌',
      url: 'https://www.youtube.com/watch?v=mt_jtesCO5k',
      youtubeId: 'mt_jtesCO5k',
      thumbnail: 'https://img.youtube.com/vi/mt_jtesCO5k/hqdefault.jpg',
      isYouTube: true,
      isCloud: true,
    },
    {
      id: 'feat_akcent_my_name',
      name: 'Akcent - That\'s My Name ⚡👑 (Ömer Said Remix)',
      dur: '03:40',
      icon: '👑',
      url: 'https://www.youtube.com/watch?v=tNgj8jKKY1o',
      youtubeId: 'tNgj8jKKY1o',
      thumbnail: 'https://img.youtube.com/vi/tNgj8jKKY1o/hqdefault.jpg',
      isYouTube: true,
      isCloud: true,
    },
    {
      id: 'feat_1',
      name: 'تقاسيم عود شرقي هادئ',
      dur: '03:45',
      icon: '🪕',
      url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=arabic-oriental-lute-112445.mp3'
    },
    {
      id: 'feat_2',
      name: 'ريمكس نغمات سهرة وطرب',
      dur: '04:20',
      icon: '🎧',
      url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a22a3b.mp3?filename=oriental-beat-party-20412.mp3'
    },
    {
      id: 'feat_3',
      name: 'موسيقى روقان واسترخاء لوفي',
      dur: '05:10',
      icon: '☕',
      url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-study-112191.mp3'
    },
    {
      id: 'feat_4',
      name: 'عزف قانون وطرب أصيل',
      dur: '04:00',
      icon: '🎵',
      url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_99392e2764.mp3?filename=arabic-qanun-relaxing-123456.mp3'
    },
    {
      id: 'feat_5',
      name: 'صوت المطر والأجواء الدافئة',
      dur: '06:00',
      icon: '🌧️',
      url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_88448f8fb4.mp3?filename=soft-rain-ambient-11115.mp3'
    }
  ];

  const handleAddTrackToCloud = async (track: CloudTrack) => {
    if (!currentUser?.id) {
      showToast('⚠️ يجب تسجيل الدخول للحفظ في السحاب');
      return;
    }
    const success = await addTrackToCloudPlaylist(currentUser.id, track);
    if (success) {
      showToast(`☁️ تم تثبيت "${track.name}" في قائمتك السحابية!`);
    }
  };

  const handleAddYouTubeTrackToCloud = async (mode: 'video' | 'audio_only' = 'video') => {
    const videoId = extractYouTubeVideoId(youtubeUrlInput);
    if (!videoId) {
      showToast('⚠️ يرجى إدخال رابط يوتيوب صحيح (YouTube URL)');
      return;
    }

    const title = youtubeTitleInput.trim() || `أغنية يوتيوب (${videoId})`;
    const newTrack: CloudTrack = {
      id: `yt_${videoId}_${Date.now()}`,
      name: title,
      dur: mode === 'audio_only' ? 'يوتيوب (صوت فقط) 🎧' : 'يوتيوب 📺',
      icon: mode === 'audio_only' ? '🎧' : '▶️',
      url: `https://www.youtube.com/watch?v=${videoId}`,
      youtubeId: videoId,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      isYouTube: true,
      isCloud: true,
      youtubeMode: mode,
      addedAt: Date.now(),
    };

    if (currentUser?.id) {
      await addTrackToCloudPlaylist(currentUser.id, newTrack);
    }

    handlePlayMusicTrack(newTrack, mode);
    setYoutubeUrlInput('');
    setYoutubeTitleInput('');
    showToast(`📺 تم حفظ "${title}" في قائمتك السحابية وتشغيلها ${mode === 'audio_only' ? 'كصوت فقط 🎧' : 'كفيديو 🎬'} في الغرفة!`);
  };

  const handleRemoveTrackFromCloud = async (trackId: string, trackName: string) => {
    if (!currentUser?.id) return;
    const success = await removeTrackFromCloudPlaylist(currentUser.id, trackId);
    if (success) {
      if (activeTrack?.id === trackId) {
        setIsMusicPlaying(false);
        setActiveTrack(null);
        setShowYoutubeFloatingPlayer(false);
        if (audioRef.current) audioRef.current.pause();
        if (currentRoom?.id) stopRoomLiveMusic(currentRoom.id);
      }
      showToast(`🗑️ تم حذف "${trackName}" من السحاب`);
    }
  };

  const handlePlayMusicTrack = (track: CloudTrack, mode: 'video' | 'audio_only' = 'video') => {
    const trackWithMode: CloudTrack = { ...track, youtubeMode: mode };
    setActiveTrack(trackWithMode);
    setIsMusicPlaying(true);
    setYoutubeMode(mode);
    if (mode === 'video') {
      setIsYoutubePipMinimized(false);
    }

    // Broadcast track play to everyone in this room only (Android & Web)
    if (currentRoom?.id) {
      broadcastRoomLiveMusic(currentRoom.id, {
        track: trackWithMode,
        isPlaying: true,
        playedBy: currentUser?.id || 'guest',
        playedByName: currentUser?.name || 'مستخدم',
        startedAt: Date.now(),
        volume: musicVolume,
        isLooping: isMusicLooping,
        youtubeMode: mode,
      });
    }

    if (track.isYouTube || track.youtubeId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (mode === 'audio_only') {
        setShowYoutubeFloatingPlayer(false);
        showToast(`🎧 جاري تشغيل صوت YouTube "${track.name}" كخلفية صوتية في الغرفة!`);
      } else {
        setShowYoutubeFloatingPlayer(true);
        showToast(`🎬 جاري عرض فيديو YouTube "${track.name}" على شاشة الغرفة!`);
      }
      return;
    }

    setShowYoutubeFloatingPlayer(false);
    if (audioRef.current) {
      audioSyncEngine.syncHtml5Audio(audioRef.current, track, Date.now(), musicVolume);
    }
    showToast(`🎵 جاري تشغيل "${track.name}" خلفية للغرفة ومزامنتها!`);
  };

  const handleToggleMusicPlayback = () => {
    if (!activeTrack) {
      if (cloudPlaylist.length > 0) {
        handlePlayMusicTrack(cloudPlaylist[0]);
      } else {
        handlePlayMusicTrack(FEATURED_MUSIC_TRACKS[0]);
      }
      return;
    }

    const nextPlaying = !isMusicPlaying;
    setIsMusicPlaying(nextPlaying);

    if (currentRoom?.id && activeTrack) {
      broadcastRoomLiveMusic(currentRoom.id, {
        track: activeTrack,
        isPlaying: nextPlaying,
        playedBy: currentUser?.id || 'guest',
        playedByName: currentUser?.name || 'مستخدم',
        startedAt: Date.now(),
      });
    }

    if (!nextPlaying) {
      if (audioRef.current) audioRef.current.pause();
    } else {
      if (!activeTrack.isYouTube && audioRef.current) {
        audioRef.current.play().catch(() => { });
      }
    }
  };

  const handleStopMusicPlayback = () => {
    setIsMusicPlaying(false);
    setActiveTrack(null);
    setShowYoutubeFloatingPlayer(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (currentRoom?.id) {
      stopRoomLiveMusic(currentRoom.id);
    }
    showToast('⏹️ تم إيقاف الموسيقى ومزامنة الإيقاف في الغرفة');
  };

  const handleMusicVolumeChange = (newVol: number) => {
    setMusicVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol / 100;
    }
  };

  const formatAudioTime = (sec: number) => {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleMusicSeek = (newTime: number) => {
    setMusicCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSeekForward = (seconds: number = 10) => {
    if (audioRef.current) {
      const next = Math.min(musicDuration, audioRef.current.currentTime + seconds);
      audioRef.current.currentTime = next;
      setMusicCurrentTime(next);
    }
  };

  const handleSeekBackward = (seconds: number = 10) => {
    if (audioRef.current) {
      const prev = Math.max(0, audioRef.current.currentTime - seconds);
      audioRef.current.currentTime = prev;
      setMusicCurrentTime(prev);
    }
  };

  const handlePlayNextTrack = () => {
    const playlistToUse = cloudPlaylist.length > 0 ? cloudPlaylist : FEATURED_MUSIC_TRACKS;
    if (playlistToUse.length === 0) return;
    const currentIndex = playlistToUse.findIndex((t) => t.id === activeTrack?.id);
    const nextIndex = (currentIndex + 1) % playlistToUse.length;
    handlePlayMusicTrack(playlistToUse[nextIndex]);
  };

  const handlePlayPrevTrack = () => {
    const playlistToUse = cloudPlaylist.length > 0 ? cloudPlaylist : FEATURED_MUSIC_TRACKS;
    if (playlistToUse.length === 0) return;
    const currentIndex = playlistToUse.findIndex((t) => t.id === activeTrack?.id);
    const prevIndex = (currentIndex - 1 + playlistToUse.length) % playlistToUse.length;
    handlePlayMusicTrack(playlistToUse[prevIndex]);
  };

  const handleCustomAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const fileNameClean = file.name.replace(/\.[^/.]+$/, '');

    const customTrack: CloudTrack = {
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: fileNameClean,
      dur: '03:30',
      icon: '📁',
      url: fileUrl,
      addedAt: Date.now(),
      isCloud: true,
    };

    if (currentUser?.id) {
      await addTrackToCloudPlaylist(currentUser.id, customTrack);
    }
    handlePlayMusicTrack(customTrack);
    showToast(`📁 تم رفع وقراءة "${fileNameClean}" وتثبيتها بالسحاب!`);
  };

  // Audio element setup and event listeners for real-time progress and duration
  useEffect(() => {
    if (!audioRef.current && typeof Audio !== 'undefined') {
      const audio = new Audio();
      audio.loop = isMusicLooping;
      audio.volume = musicVolume / 100;
      audio.ontimeupdate = () => {
        setMusicCurrentTime(audio.currentTime || 0);
      };
      audio.onloadedmetadata = () => {
        setMusicDuration(audio.duration || 0);
      };
      audio.onended = () => {
        if (!isMusicLooping) {
          handlePlayNextTrack();
        }
      };
      audioRef.current = audio;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isMusicLooping;
    }
  }, [isMusicLooping]);

  // Seat Administration & Mic Ascension Modes (نظام أذونات المقاعد)
  const [isMicModeLocked, setIsMicModeLocked] = useState<boolean>(false); // false = Free Mode (مفتوح), true = Request Mode (بالطلب)
  const [pendingMicRequests, setPendingMicRequests] = useState<Array<{
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    requestedSeatId?: number;
    timestamp: string;
  }>>([]);

  const [pendingSeatInvite, setPendingSeatInvite] = useState<{
    targetUserId: string;
    targetUserName: string;
    targetUserAvatar: string;
    inviterName: string;
    seatId: number;
  } | null>(null);

  const [showAudiencePicker, setShowAudiencePicker] = useState<boolean>(false);
  const [targetSeatForInvite, setTargetSeatForInvite] = useState<number | null>(null);
  const [showMicRequestsModal, setShowMicRequestsModal] = useState<boolean>(false);

  // Video Broadcast State (بث الفيديو)
  const [isVideoBroadcasting, setIsVideoBroadcasting] = useState(false);
  const [showVideoBroadcastModal, setShowVideoBroadcastModal] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [videoFilter, setVideoFilter] = useState<'beauty' | 'neon' | 'natural' | 'vintage'>('beauty');
  const [isCameraMuted, setIsCameraMuted] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isVideoBroadcasting && !isCameraMuted) {
      navigator.mediaDevices?.getUserMedia?.({
        video: { facingMode: isFrontCamera ? 'user' : 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      }).then((mediaStream) => {
        stream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }).catch(() => {
        // Handled gracefully with stylized live video canvas fallback
      });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideoBroadcasting, isFrontCamera, isCameraMuted]);

  const showToast = (msg: string) => {
    setToolbarToast(msg);
    setTimeout(() => setToolbarToast(null), 3500);
  };

  // Synchronize room cover photo, title, announcement & theme to Firebase RTDB and Home screen
  const handleUpdateRoomData = (updatedFields: Partial<VoiceRoom>) => {
    const updatedRoom: VoiceRoom = {
      ...currentRoom,
      ...updatedFields,
      coverImage: updatedFields.coverImage || currentRoom.coverImage || updatedFields.backgroundUrl || currentRoom.backgroundUrl,
      hostAvatar: updatedFields.hostAvatar || updatedFields.coverImage || currentRoom.hostAvatar,
    };
    setCurrentRoom(updatedRoom);
    saveRoomToRealtimeDb(updatedRoom);

    // Immediately trigger parent onUpdateRoom to update home screen list synchronously
    if (onUpdateRoom) {
      onUpdateRoom(updatedRoom);
    }

    // If current user is host/owner of this room, update user profile and permanent cache
    if (user.id === currentRoom.hostId || (user.createdRoomId && user.createdRoomId === currentRoom.id)) {
      const updatedUser: UserProfile = {
        ...currentUser,
        avatar: updatedFields.coverImage || currentUser.avatar,
        roomName: updatedFields.title || currentUser.roomName,
        roomCoverImage: updatedFields.coverImage || currentUser.roomCoverImage,
      };
      setCurrentUser(updatedUser);
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }
      try {
        localStorage.setItem('saleem_saved_user', JSON.stringify(updatedUser));
      } catch (e) {}
      saveUserToFirebase(updatedUser);
    }

    showToast('✅ تم حفظ وتحديث غلاف وبيانات الغرفة بنجاح في السيرفر والقائمة الرئيسية!');
  };

  // Real-time PK Battle Synchronizer
  useEffect(() => {
    if (!currentRoom.id) return;
    const unsubscribe = listenToPKBattle(currentRoom.id, (state) => {
      if (state && state.isActive) {
        setPkBattleState(state);
        setIsPKActive(true);
      } else {
        setPkBattleState(null);
        setIsPKActive(false);
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [currentRoom.id]);

  const handleRichGiftSend = (gift: GiftItem, recipientName: string, amount: number, luckyReward?: LuckyRewardResult) => {
    const unitPrice = gift.priceCoins || gift.priceDiamonds || 10;
    const totalVal = unitPrice * amount;

    const isRose = gift.id.includes('rose') || gift.name.includes('ورد');
    let giftActionText = isRose
      ? `ألقى ${currentUser.name} وردة 🌹 إلى ${recipientName}`
      : `أرسل ${currentUser.name} ${gift.name} ${gift.icon || '🎁'} إلى ${recipientName}`;

    if (luckyReward && luckyReward.multiplier > 0) {
      giftActionText += ` 🔥 [ربح مردود حظ x${luckyReward.multiplier} (+${luckyReward.wonCoins.toLocaleString()} 🪙)]`;
    }

    const giftMsg: RoomMessage = {
      id: `gmsg-${Date.now()}`,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: giftActionText,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      isGiftNotice: true,
      giftInfo: {
        giftName: gift.name,
        giftIcon: gift.icon,
        amount,
      },
    };

    // Update PK Score if active
    if (isPKActive && pkBattleState && currentRoom.id) {
      // Determine which team the recipient belongs to
      // Simple logic: if recipient is Host, it's Red Team. If blue team id is matched, it's Blue Team.
      // Better logic: recipients on seats are usually RED team, but if it's room-vs-room it depends.
      const isRedTeam = recipientName === currentRoom.hostName || currentRoom.seats.some(s => s.speakerUser?.name === recipientName);

      updatePKScore(currentRoom.id, isRedTeam ? 'red' : 'blue', totalVal, {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar
      });
    }

    setCurrentRoom((prev) => {
      const isAllRecipients = recipientName.includes('جميع') || recipientName.includes('All') || recipientName.includes('الكل');
      let diamondsForCurrentUser = 0;
      const recipientUserIdsToUpdate: { userId: string; amount: number }[] = [];

      const updatedSeats = prev.seats.map((s) => {
        if (!s.speakerUser) return s;

        const isTargeted = isAllRecipients || 
          s.speakerUser.name === recipientName || 
          recipientName.includes(s.speakerUser.name) || 
          recipientName.includes(`المقعد #${s.seatId}`) ||
          recipientName.includes(`#${s.seatId}`);

        if (isTargeted) {
          const giftPoints = totalVal; // EXACT FULL GIFT VALUE (e.g. 5,000 / 4,000 / 10,000)
          const currentSpeakerDiamonds = Number((s.speakerUser as any).diamonds) || 0;
          const newSpeakerDiamonds = currentSpeakerDiamonds + giftPoints;

          if (s.speakerUser.id === currentUser.id || s.speakerUser.name === currentUser.name) {
            diamondsForCurrentUser += giftPoints;
          }

          recipientUserIdsToUpdate.push({
            userId: s.speakerUser.id,
            amount: giftPoints,
          });

          return {
            ...s,
            points: (s.points || 0) + giftPoints,
            speakerUser: {
              ...s.speakerUser,
              diamonds: newSpeakerDiamonds,
            },
          };
        }

        return s;
      });

      // Also check if Host was directly targeted
      const isHostTargeted = !isAllRecipients && (recipientName === prev.hostName || recipientName.includes(prev.hostName));
      if (isHostTargeted && !recipientUserIdsToUpdate.some(r => r.userId === prev.hostId)) {
        recipientUserIdsToUpdate.push({
          userId: prev.hostId,
          amount: totalVal,
        });
        if (currentUser.id === prev.hostId || currentUser.name === prev.hostName) {
          diamondsForCurrentUser += totalVal;
        }
      }

      // Direct check if currentUser is the targeted recipient
      if (!isAllRecipients && (recipientName === currentUser.name || recipientName.includes(currentUser.name)) && diamondsForCurrentUser === 0) {
        diamondsForCurrentUser += totalVal;
      }

      // Increment diamonds in Firebase RTDB for all recipients
      recipientUserIdsToUpdate.forEach(({ userId, amount: amt }) => {
        // The recipient's agency progress is recorded from this real gift event.
        recordAgencyGiftActivity(userId, amt, prev.id);
      });

      // Update currentUser balance in state & localStorage & Firebase if currentUser received diamonds
      if (diamondsForCurrentUser > 0) {
        const updatedDiamonds = (currentUser.diamonds || 0) + diamondsForCurrentUser;
        const updatedUser: UserProfile = {
          ...currentUser,
          diamonds: updatedDiamonds,
        };
        setCurrentUser(updatedUser);
        if (onUpdateUser) {
          onUpdateUser(updatedUser);
        }
        try {
          localStorage.setItem('saleem_saved_user', JSON.stringify(updatedUser));
        } catch (e) {}
        saveUserToFirebase(updatedUser);
      }

      // Dynamically add/accumulate coins for sender in topSupporters
      const existingSupporters: any[] = Array.isArray(prev.topSupporters) ? [...prev.topSupporters] : [];
      const senderIdx = existingSupporters.findIndex((s) => s.id === currentUser.id || s.name === currentUser.name);
      if (senderIdx >= 0) {
        existingSupporters[senderIdx] = {
          ...existingSupporters[senderIdx],
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          coins: (existingSupporters[senderIdx].coins || 0) + totalVal,
          vipLevel: currentUser.vipLevel || 1,
          lastSupportedAt: Date.now(),
        };
      } else {
        existingSupporters.push({
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          coins: totalVal,
          vipLevel: currentUser.vipLevel || 1,
          lastSupportedAt: Date.now(),
        });
      }
      existingSupporters.sort((a, b) => (b.coins || 0) - (a.coins || 0));

      const now = Date.now();
      const weekStart = prev.diamondsWeekStart || now;
      const isWeekExpired = now - weekStart > ONE_WEEK_MS;
      const baseDiamonds = isWeekExpired ? 0 : (prev.diamonds || 0);
      const newDiamonds = baseDiamonds + totalVal;
      const newWeekStart = isWeekExpired ? now : weekStart;

      const updatedRoom = {
        ...prev,
        topSupporters: existingSupporters,
        diamonds: newDiamonds,
        diamondsWeekStart: newWeekStart,
        messages: [...prev.messages, giftMsg],
        seats: updatedSeats,
      };

      // Broadcast message to all users in room
      void postRoomMessageInRealtimeDb(currentRoom.id, giftMsg);

      if (isHost || currentRoom.hostId === user.id || currentRoom.ownerId === user.id) {
        saveRoomToRealtimeDb(updatedRoom);
      }
      return updatedRoom;
    });

    // Trigger Clean 3D Stage Overlay with Mics in Middle & Rose Animation
    setActive3DAnimation({
      id: `anim_${Date.now()}_${Math.random()}`,
      senderName: currentUser.name || user.name || 'سالم',
      senderAvatar: currentUser.avatar || user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      recipientName: recipientName || currentRoom.hostName,
      gift,
      amount,
      timestamp: Date.now(),
      luckyReward,
    });

    // Trigger Floating Multi-Send / Repeat Combo Circle
    setFloatingCombo((prev) => {
      const isSame = prev && prev.gift.id === gift.id && prev.recipientName === recipientName;
      const nextStreak = isSame ? prev.comboStreak + 1 : 1;
      return {
        gift,
        recipientName: recipientName || currentRoom.hostName,
        amount: 1,
        comboStreak: nextStreak,
        expiresAt: Date.now() + 5000,
      };
    });

    onSendGift(gift, recipientName);
  };

  // Handle Quick Combo Streak Multi-Send Tap (إرسال سريع ومستمر بضغطة زر)
  const handleQuickComboSend = () => {
    if (!floatingCombo) return;
    const { gift, recipientName } = floatingCombo;
    const unitCost = gift.priceCoins || gift.priceDiamonds || 10;
    if (currentUser.coins < unitCost) {
      showToast(`⚠️ رصيدك (${currentUser.coins.toLocaleString()} 🪙) لا يكفي لإرسال ${gift.name}!`);
      return;
    }

    // 1. Deduct coins & add wealth XP
    const newCoins = currentUser.coins - unitCost;
    const addedXp = unitCost;
    const newXp = (currentUser.wealthXp || 45200) + addedXp;
    const newLevel = Math.floor(newXp / 2000) + 1;
    const updatedBalance = { coins: newCoins, wealthXp: newXp, wealthLevel: newLevel };
    setCurrentUser((prev) => ({ ...prev, ...updatedBalance }));
    if (onUpdateUser) onUpdateUser(updatedBalance);

    // 2. Calculate Lucky Gift if applicable
    let luckyReward: LuckyRewardResult | undefined = undefined;
    if (gift.category === 'lucky') {
      luckyReward = calculateLuckyReward(unitCost);
      if (luckyReward.wonCoins > 0) {
        const withReward = newCoins + luckyReward.wonCoins;
        setCurrentUser((prev) => ({ ...prev, coins: withReward }));
        if (onUpdateUser) onUpdateUser({ coins: withReward });
      }
    }

    // 3. Send gift directly
    handleRichGiftSend(gift, recipientName, 1, luckyReward);
  };

  // PK countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPKActive && pkTimeLeft > 0) {
      timer = setInterval(() => {
        setPkTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (pkTimeLeft === 0) {
      setIsPKActive(false);
      setPkTimeLeft(180);
    }
    return () => clearInterval(timer);
  }, [isPKActive, pkTimeLeft]);

  const handleSaveSeatLayout = (layout: SeatLayoutSelection) => {
    setCurrentRoom((prev) => {
      const currentSeats = prev.seats || [];
      const newSeats: MicSeat[] = Array.from({ length: layout.count }, (_, index) => {
        const seatNum = index + 1;
        const existing = currentSeats.find((s) => s.seatId === seatNum);
        if (existing) {
          return {
            ...existing,
            isHostSeat: layout.type === 'boss' && seatNum === 1 ? true : existing.isHostSeat,
          };
        }
        return {
          seatId: seatNum,
          isHostSeat: layout.type === 'boss' && seatNum === 1,
          isLocked: false,
          isMuted: false,
          points: 0,
        };
      });

      return {
        ...prev,
        seats: newSeats,
        seatLayout: layout,
      };
    });

    setShowSeatSettingsModal(false);
  };

  // Treasure chest timer state
  const [boxTimer, setBoxTimer] = useState(25);
  const [isBoxClaimable, setIsBoxClaimable] = useState(false);

  // Known Room Users Directory for Moderators List
  const KNOWN_ROOM_USERS: Record<string, { name: string; avatar: string; level: number; tag: string }> = {
    u_101: {
      name: 'أميرة الشرق ⭐',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      level: 45,
      tag: 'مشرف ماسي 🛡️'
    },
    u_102: {
      name: 'خالد العنزي 👑',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      level: 52,
      tag: 'مشرف ذهبي 🛡️'
    },
    u_103: {
      name: 'نورة المطيري 🌸',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      level: 38,
      tag: 'مشرف فضي 🛡️'
    },
    u_104: {
      name: 'فهد القحطاني ⚡',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      level: 60,
      tag: 'نائب المشرف 🛡️'
    }
  };

  // Check if current user is Host or Moderator
  const safeMods = Array.isArray(currentRoom.mods) ? currentRoom.mods : [];
  const canManageRoomLayout =
    isHost || (user && user.id ? (safeMods.includes(user.id) && (currentRoom.managerPermissions?.canManageLayout ?? true)) : false);

  // Treasure box countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setBoxTimer((prev) => {
        if (prev <= 1) {
          setIsBoxClaimable(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Realtime Database connected members state
  const [realtimeMembers, setRealtimeMembers] = useState<any[]>([]);

  // Firebase Realtime Database Presence & Members Listener (Disconnect Safety System)
  useEffect(() => {
    if (!currentRoom.id || !user.id) return;

    const userRole = user.id === currentRoom.hostId ? 'مقدم' : user.vipRank && user.vipRank !== 'None' ? 'VIP' : 'عضو';

    // 1. Setup Firebase RTDB presence with automatic onDisconnect removal
    const cleanupPresence = setupRoomPresence(currentRoom.id, {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      role: userRole,
      isMuted: isMicMuted,
    });

    // 2. Listen to active connected members in /rooms/{roomId}/members
    const unsubscribeMembers = listenToRoomMembers(currentRoom.id, (members) => {
      setRealtimeMembers(members);
    });

    return () => {
      cleanupPresence();
      if (typeof unsubscribeMembers === 'function') unsubscribeMembers();
    };
  }, [currentRoom.id, user.id, user.name, user.avatar, isMicMuted]);

  // 🎙️ Agora RTC Voice Channel Lifecycle (Auto-Join Channel & Subscribe to Remote Audio)
  useEffect(() => {
    if (!currentRoom.id || !user.id) return;

    const channelName = currentRoom.agoraChannel || currentRoom.id;
    const isHostOrSeated = user.id === currentRoom.hostId || userOnSeat !== null;
    const localNumericUid = getAgoraNumericUid(user.id);

    void agoraVoiceManager.joinVoiceRoom({
      channelName,
      token: currentRoom.agoraToken || null,
      userId: user.id,
      isHostOrSeated,
      isMuted: isMicMuted,
      onRemoteUserSpeaking: (agoraUid, level) => {
        const isSpeaking = level > 5;
        const targetAgoraUid = Number(agoraUid);
        const isLocal = targetAgoraUid === 0 || targetAgoraUid === localNumericUid;

        // Instant 60fps real-time speaking level update for audio soundwaves
        setLiveSpeakingLevels((prev) => {
          const next = { ...prev, [String(targetAgoraUid)]: level };
          if (isLocal) {
            next[user.id] = level;
            next['0'] = level;
            next[String(localNumericUid)] = level;
          }
          return next;
        });

        // Broadcast local speaking level to Firebase RTDB for instant cross-device soundwave sync
        if (isLocal && isHostOrSeated && !isMicMuted) {
          updateRoomSpeakingLevel(currentRoom.id, user.id, level);
        }

        setCurrentRoom((prev) => {
          let hasChanges = false;
          const updatedSeats = (prev.seats || []).map((seat) => {
            if (!seat.speakerUser) return seat;

            const isSeatLocal = isLocal && seat.speakerUser.id === user.id;
            const isSeatRemote = !isLocal && (
              getAgoraNumericUid(seat.speakerUser.id) === targetAgoraUid ||
              seat.speakerUser.agoraUid === targetAgoraUid
            );

            if (isSeatLocal || isSeatRemote) {
              if (seat.speakerUser.isSpeaking !== isSpeaking || seat.speakerUser.audioLevel !== level) {
                hasChanges = true;
                return {
                  ...seat,
                  speakerUser: {
                    ...seat.speakerUser,
                    isSpeaking,
                    audioLevel: level,
                  },
                };
              }
            }
            return seat;
          });

          return hasChanges ? { ...prev, seats: updatedSeats } : prev;
        });
      },
      onToastNotice: (msg) => {
        showToast(msg);
      },
    }).then((joined) => {
      if (joined && isHostOrSeated) void startAgencyLiveSession(user.id, currentRoom.id);
    });

    return () => {
      agoraVoiceManager.leaveVoiceRoom();
      updateRoomSpeakingLevel(currentRoom.id, user.id, 0);
      if (isHostOrSeated) void stopAgencyLiveSession(user.id);
    };
  }, [currentRoom.id, currentRoom.agoraChannel, currentRoom.agoraToken, user.id]);

  // 🔊 Real-time Speaking Levels Cloud Sync Listener
  useEffect(() => {
    if (!currentRoom.id) return;
    const unsubscribe = listenToRoomSpeakingLevels(currentRoom.id, (cloudSpeakingLevels) => {
      setLiveSpeakingLevels((prev) => {
        let hasNew = false;
        const next = { ...prev };
        Object.entries(cloudSpeakingLevels).forEach(([speakerUid, lvl]) => {
          if (speakerUid !== user.id && next[speakerUid] !== lvl) {
            next[speakerUid] = lvl;
            const numeric = getAgoraNumericUid(speakerUid);
            next[String(numeric)] = lvl;
            hasNew = true;
          }
        });
        return hasNew ? next : prev;
      });
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      updateRoomSpeakingLevel(currentRoom.id, user.id, 0);
    };
  }, [currentRoom.id, user.id]);

  // 🎙️ Agora RTC Mic State Sync (Publish when host/seated & unmuted, Unpublish when audience/muted)
  useEffect(() => {
    const isHostOrSeated = user.id === currentRoom.hostId || userOnSeat !== null;
    if (isHostOrSeated) {
      if (isMicMuted) {
        agoraVoiceManager.setMuted(true);
        updateRoomSpeakingLevel(currentRoom.id, user.id, 0);
      } else {
        agoraVoiceManager.publishMicrophone();
      }
    } else {
      agoraVoiceManager.unpublishMicrophone();
      updateRoomSpeakingLevel(currentRoom.id, user.id, 0);
    }
  }, [userOnSeat, isMicMuted, user.id, currentRoom.hostId, currentRoom.id]);

  // 🎬 Real-time Room Cinema Synchronizer across Web & Android
  useEffect(() => {
    if (!currentRoom.id) return;
    const unsubscribe = listenToRoomCinema(currentRoom.id, (cinemaState) => {
      if (cinemaState && cinemaState.active && cinemaState.videoId) {
        setIsCinemaMode(true);
        setCinemaVideoId(cinemaState.videoId);
        setCinemaVideoTitle(cinemaState.title || 'مقطع سينما الغرفة المميز 🎬🍿');
      } else if (cinemaState === null || (cinemaState && !cinemaState.active)) {
        setIsCinemaMode(false);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [currentRoom.id]);

  // 🎵 Agora RTC Cloud Music Playback Sync
  // Only the user who pressed Play publishes the track to Agora. Other members
  // must NOT publish the same music again; they only subscribe to the publisher.
  // YouTube tracks are synchronized through the room's YouTube player and are
  // intentionally not passed to HTMLAudio/Agora as if they were direct audio URLs.
  useEffect(() => {
    const shouldPublishLocalMusic =
      Boolean(isMusicPlaying && activeTrack?.url) &&
      Boolean(activeTrack && !activeTrack.isYouTube && !activeTrack.youtubeId) &&
      Boolean(currentRoom.id);

    const isLocalPublisher = liveMusicPlayedBy === user.id;

    if (shouldPublishLocalMusic && isLocalPublisher && activeTrack?.url) {
      void agoraVoiceManager.playCloudMusic(activeTrack.url, musicVolume);
    } else if (!shouldPublishLocalMusic || !isLocalPublisher) {
      void agoraVoiceManager.stopCloudMusic();
    }

    return () => {
      if (!shouldPublishLocalMusic || !isLocalPublisher) void agoraVoiceManager.stopCloudMusic();
    };
  }, [isMusicPlaying, activeTrack?.url, activeTrack?.isYouTube, activeTrack?.youtubeId, currentRoom.id, liveMusicPlayedBy, musicVolume, user.id]);

  // Seat Disconnect Protection (Automatically clears seat if internet cuts while on mic)
  useEffect(() => {
    if (userOnSeat !== null && currentRoom.id) {
      const seatIndex = userOnSeat - 1;
      setupSeatOnDisconnect(currentRoom.id, seatIndex);
      return () => {
        cancelSeatOnDisconnect(currentRoom.id, seatIndex);
      };
    }
  }, [userOnSeat, currentRoom.id]);

  // Graceful Room Exit Handler
  const handleExitRoom = async () => {
    if (userOnSeat !== null) {
      leaveSeat();
    }
    await agoraVoiceManager.leaveVoiceRoom();
    await stopAgencyLiveSession(user.id);
    await removeRoomMember(currentRoom.id, user.id);
    onClose();
  };

  // Realtime Database room state listener
  const lastRtdbDataRef = useRef<string>('');

  useEffect(() => {
    if (!currentRoom.id) return;

    const unsubscribe = listenToSingleRoom(currentRoom.id, (rtdbRoom) => {
      if (rtdbRoom && rtdbRoom.id === currentRoom.id) {
        const serverMessages = Array.isArray(rtdbRoom.messages) ? rtdbRoom.messages : [];
        const serialized = JSON.stringify({
          title: rtdbRoom.title || '',
          announcement: rtdbRoom.announcement || '',
          seats: rtdbRoom.seats || [],
          topSupporters: rtdbRoom.topSupporters || [],
          diamonds: rtdbRoom.diamonds ?? 0,
          messagesLength: serverMessages.length,
          listenersCount: rtdbRoom.listenersCount ?? 1,
        });

        if (serialized !== lastRtdbDataRef.current) {
          lastRtdbDataRef.current = serialized;
          setCurrentRoom((prev) => ({
            ...prev,
            ...rtdbRoom,
            title: rtdbRoom.title || prev.title,
            announcement: rtdbRoom.announcement !== undefined ? rtdbRoom.announcement : prev.announcement,
            listenersCount: rtdbRoom.listenersCount || prev.listenersCount,
            seats: rtdbRoom.seats && rtdbRoom.seats.length > 0 ? rtdbRoom.seats : prev.seats,
            topSupporters: rtdbRoom.topSupporters || prev.topSupporters,
            diamonds: rtdbRoom.diamonds !== undefined ? rtdbRoom.diamonds : prev.diamonds,
            diamondsWeekStart: rtdbRoom.diamondsWeekStart !== undefined ? rtdbRoom.diamondsWeekStart : prev.diamondsWeekStart,
            messages: serverMessages.length > 0 ? serverMessages : prev.messages,
          }));
        }
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [currentRoom.id]);

  // Ref to track speaking state to prevent 60fps re-renders
  const isSpeakingRef = useRef<boolean>(false);

  // Smart Seat Reservation & Reconnection Restoration Guard (Owner Override + Host Disconnect Guard)
  useEffect(() => {
    if (!currentRoom.id || !user.id || !currentRoom.seats || currentRoom.seats.length === 0) return;

    const userSeat = currentRoom.seats.find((s) => s.speakerUser?.id === user.id);

    if (userSeat) {
      if (userOnSeat !== userSeat.seatId) {
        setUserOnSeat(userSeat.seatId);
        localStorage.setItem(`last_seat_${currentRoom.id}_${user.id}`, String(userSeat.seatId));
      }
    } else if (userOnSeat !== null) {
      setUserOnSeat(null);
    }
  }, [currentRoom.id, user.id, currentRoom.seats]);

  // Auto-scroll chat box controller
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentRoom.messages?.length, showChatBox]);

  // AgoraVoiceManager is the single authoritative audio transport for this room.

  // Handle seat join / click (النظام الإداري لصعود المقاعد)
  const handleSeatClick = (seat: MicSeat) => {
    if (seat.isLocked) {
      showToast('🔒 هذا المقعد مقفل بواسطة المضيف');
      return;
    }

    if (seat.speakerUser) {
      // Seat is occupied -> Open user profile card modal for all users
      setSelectedUserProfileCard({
        user: seat.speakerUser,
        seatId: seat.seatId,
      });
      setShowProfileOptionsMenu(false);
      return;
    }

    // Host or Mod clicking empty seat -> open seat control sheet (قفل / دعوة)
    if (isMod && userOnSeat !== null) {
      setSelectedSeatForAction(seat);
      return;
    }

    // Seat is empty -> check if mic mode is locked (Request Mode) vs Free Mode
    if (isMicModeLocked && !isMod) {
      // Request Mode: Send ascension request to Host
      if (!pendingMicRequests.some((r) => r.userId === user.id)) {
        setPendingMicRequests((prev) => [
          ...prev,
          {
            id: `req-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            requestedSeatId: seat.seatId,
            timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
      setIsHandRaised(true);
      showToast('✋ تم إرسال طلب الصعود، يرجى انتظار الموافقة');

      const updatedRoom = {
        ...currentRoom,
        messages: [
          ...currentRoom.messages,
          {
            id: Date.now().toString(),
            senderName: 'نظام إدارة المقاعد 🎙️',
            senderAvatar: '',
            text: `أرسل ${user.name} طلباً للصعود على المقعد #${seat.seatId}`,
            timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            isSystemNotice: true,
          },
        ],
      };
      setCurrentRoom(updatedRoom);
      saveRoomToRealtimeDb(updatedRoom);
      return;
    }

    // Free Mode -> Sit on mic seat directly
    const targetSeatIndex = currentRoom.seats.findIndex((s) => s.seatId === seat.seatId);
    const resolvedSeatIndex = targetSeatIndex !== -1 ? targetSeatIndex : seat.seatId - 1;

    // Clear previous seat if user was already on another seat in this room
    if (userOnSeat !== null && userOnSeat !== seat.seatId) {
      const prevSeatIndex = currentRoom.seats.findIndex((s) => s.seatId === userOnSeat);
      const resolvedPrevIdx = prevSeatIndex !== -1 ? prevSeatIndex : userOnSeat - 1;
      void clearSeatSpeakerInRealtimeDb(currentRoom.id, resolvedPrevIdx);
    }

    const speakerObj = {
      id: user.id,
      agoraUid: getAgoraNumericUid(user.id),
      name: user.name,
      avatar: user.avatar,
      equippedFrame: user.equippedFrame || undefined,
      isSpeaking: false,
      audioLevel: 0,
      vipLevel: user.vipLevel,
      role: isHost ? 'مقدم' : 'عضو',
    };

    const updatedSeats = currentRoom.seats.map((s) =>
      s.seatId === seat.seatId
        ? {
          ...s,
          speakerUser: speakerObj,
        }
        : s.speakerUser?.id === user.id
          ? { ...s, speakerUser: undefined }
          : s
    );

    const seatNoticeMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: 'نظام إدارة المقاعد 🎙️',
      senderAvatar: '',
      text: `صعد ${user.name} إلى المقعد رقم #${seat.seatId}`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      isSystemNotice: true,
    };

    const updatedRoom = {
      ...currentRoom,
      seats: updatedSeats,
      messages: [
        ...currentRoom.messages,
        seatNoticeMessage,
      ],
    };

    setCurrentRoom(updatedRoom);
    setUserOnSeat(seat.seatId);
    localStorage.setItem(`last_seat_${currentRoom.id}_${user.id}`, String(seat.seatId));

    // Granularly write to the specific seat path (allowed by RTDB rules for non-host members)
    void setSeatSpeakerInRealtimeDb(currentRoom.id, resolvedSeatIndex, speakerObj);
    void postRoomMessageInRealtimeDb(currentRoom.id, seatNoticeMessage);

    // If current user is host/owner, save full room metadata as well
    if (isHost || currentRoom.hostId === user.id || currentRoom.ownerId === user.id) {
      saveRoomToRealtimeDb(updatedRoom);
    }
    setIsHandRaised(false);
  };

  const leaveSeat = () => {
    if (userOnSeat === null) return;
    const currentSeatId = userOnSeat;
    const targetSeatIndex = currentRoom.seats.findIndex((s) => s.seatId === currentSeatId);
    const resolvedSeatIndex = targetSeatIndex !== -1 ? targetSeatIndex : currentSeatId - 1;

    const updatedSeats = currentRoom.seats.map((s) =>
      s.seatId === currentSeatId ? { ...s, speakerUser: undefined } : s
    );
    const updatedRoom = {
      ...currentRoom,
      seats: updatedSeats,
    };
    setCurrentRoom(updatedRoom);
    setUserOnSeat(null);
    localStorage.removeItem(`last_seat_${currentRoom.id}_${user.id}`);

    // Granularly clear seat in RTDB
    void clearSeatSpeakerInRealtimeDb(currentRoom.id, resolvedSeatIndex);

    if (isHost || currentRoom.hostId === user.id || currentRoom.ownerId === user.id) {
      saveRoomToRealtimeDb(updatedRoom);
    }
  };

  const handleToggleMuteSeat = (seatId: number) => {
    const targetSeat = currentRoom.seats.find((s) => s.seatId === seatId);
    const newMutedState = !targetSeat?.isMuted;
    const targetSeatIdx = currentRoom.seats.findIndex((s) => s.seatId === seatId);
    const resolvedSeatIdx = targetSeatIdx !== -1 ? targetSeatIdx : seatId - 1;

    setCurrentRoom((prev) => ({
      ...prev,
      seats: prev.seats.map((s) =>
        s.seatId === seatId ? { ...s, isMuted: newMutedState } : s
      ),
    }));

    // Broadcast granularly to Firebase RTDB (authorized for both Host and Moderators)
    void setSeatMuteInRealtimeDb(currentRoom.id, resolvedSeatIdx, newMutedState);

    showToast(newMutedState ? '🔇 تم كتم صوت المقعد إجبارياً' : '🎙️ تم فتح المايك');
    setSelectedSeatForAction(null);
  };

  const handleToggleLockSeat = (seatId: number) => {
    const targetSeat = currentRoom.seats.find((s) => s.seatId === seatId);
    const newLockedState = !targetSeat?.isLocked;
    const targetSeatIdx = currentRoom.seats.findIndex((s) => s.seatId === seatId);
    const resolvedSeatIdx = targetSeatIdx !== -1 ? targetSeatIdx : seatId - 1;

    setCurrentRoom((prev) => ({
      ...prev,
      seats: prev.seats.map((s) =>
        s.seatId === seatId ? { ...s, isLocked: newLockedState } : s
      ),
    }));

    // Broadcast granularly to Firebase RTDB (authorized for both Host and Moderators)
    void setSeatLockInRealtimeDb(currentRoom.id, resolvedSeatIdx, newLockedState);

    showToast(newLockedState ? '🔒 تم تسكير وقفل المقعد إدارياً' : '🔓 تم فتح المقعد للجميع');
    setSelectedSeatForAction(null);
  };

  const handleKickSeatUser = (seatId: number) => {
    const targetSeat = currentRoom.seats.find((s) => s.seatId === seatId);
    const userName = targetSeat?.speakerUser?.name || 'المستخدم';

    const updatedSeats = currentRoom.seats.map((s) =>
      s.seatId === seatId ? { ...s, speakerUser: undefined } : s
    );

    const updatedRoom = {
      ...currentRoom,
      seats: updatedSeats,
      messages: [
        ...currentRoom.messages,
        {
          id: Date.now().toString(),
          senderName: 'نظام الإدارة 🎙️',
          senderAvatar: '',
          text: `تم إنزال ${userName} من المقعد إلى قسم المستمعين`,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          isSystemNotice: true,
        },
      ],
    };

    const targetSeatIdx = currentRoom.seats.findIndex((s) => s.seatId === seatId);
    const resolvedSeatIdx = targetSeatIdx !== -1 ? targetSeatIdx : seatId - 1;
    void clearSeatSpeakerInRealtimeDb(currentRoom.id, resolvedSeatIdx);

    setCurrentRoom(updatedRoom);
    saveRoomToRealtimeDb(updatedRoom);

    if (userOnSeat === seatId) {
      setUserOnSeat(null);
      localStorage.removeItem(`last_seat_${currentRoom.id}_${user.id}`);
    }
    setSelectedSeatForAction(null);
    showToast(`🔽 تم إنزال ${userName} للمستمعين`);
  };

  // Ban / Kick Out User completely from room
  const handleBanUserFromRoom = (seatId: number) => {
    const targetSeat = currentRoom.seats.find((s) => s.seatId === seatId);
    const userName = targetSeat?.speakerUser?.name || 'المستخدم';

    const targetSeatIdx = currentRoom.seats.findIndex((s) => s.seatId === seatId);
    const resolvedSeatIdx = targetSeatIdx !== -1 ? targetSeatIdx : seatId - 1;
    void clearSeatSpeakerInRealtimeDb(currentRoom.id, resolvedSeatIdx);

    setCurrentRoom((prev) => ({
      ...prev,
      seats: prev.seats.map((s) => (s.seatId === seatId ? { ...s, speakerUser: undefined } : s)),
      listenersCount: Math.max(1, (prev.listenersCount || 10) - 1),
      messages: [
        ...prev.messages,
        {
          id: Date.now().toString(),
          senderName: 'نظام الأمان 🛡️',
          senderAvatar: '',
          text: `تم طرد ${userName} نهائياً من الغرفة الصوتية من قبل المالك`,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          isSystemNotice: true,
        },
      ],
    }));

    if (userOnSeat === seatId) setUserOnSeat(null);
    setSelectedSeatForAction(null);
    showToast(`🚫 تم طرد ${userName} من الغرفة نهائياً`);
  };

  // 1. Promote / Demote Moderator (EXCLUSIVE TO ROOM OWNER / HOST ONLY)
  const handleToggleModeratorRole = (targetUserId: string, targetUserName: string) => {
    if (!isHost) {
      showToast('⚠️ هذه الصلاحية حصرية لمالك الغرفة فقط 👑');
      return;
    }

    const currentMods = safeMods;
    const isAlreadyMod = currentMods.includes(targetUserId);

    let updatedMods: string[];
    let noticeText: string;

    if (isAlreadyMod) {
      updatedMods = currentMods.filter((id) => id !== targetUserId);
      noticeText = `تم سحب رتبة الإشراف من ${targetUserName} 🛡️`;
      showToast(`🛡️ تم سحب الإشراف من ${targetUserName} وإلغاء كافة صلاحياته فوراً`);
    } else {
      updatedMods = [...currentMods, targetUserId];
      noticeText = `تم تعيين ${targetUserName} مشرفاً للغرفة الصوتية 🛡️`;
      showToast(`🛡️ تم تعيين ${targetUserName} مشرفاً بنجاح`);
    }

    const updatedRoom = {
      ...currentRoom,
      mods: updatedMods,
      messages: [
        ...currentRoom.messages,
        {
          id: Date.now().toString(),
          senderName: 'نظام إدارة الغرفة 👑',
          senderAvatar: '',
          text: noticeText,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          isSystemNotice: true,
        },
      ],
    };

    setCurrentRoom(updatedRoom);
    saveRoomToRealtimeDb(updatedRoom);
    setShowProfileOptionsMenu(false);
    setSelectedUserProfileCard(null);
  };

  // 2. Mute / Unmute Chat Messages for User
  const handleToggleMuteUserChat = (targetUserId: string, targetUserName: string) => {
    if (!isHost && !isMod) {
      showToast('⚠️ ليس لديك صلاحية حظر رسائل الشات');
      return;
    }

    const currentMuted = Array.isArray(currentRoom.mutedChatUsers) ? currentRoom.mutedChatUsers : [];
    const isMuted = currentMuted.includes(targetUserId);

    let updatedMuted: string[];
    let noticeText: string;

    if (isMuted) {
      updatedMuted = currentMuted.filter((id) => id !== targetUserId);
      noticeText = `تم إلغاء حظر كتابة الرسائل عن ${targetUserName}`;
      showToast(`💬 تم السماح لـ ${targetUserName} بالكتابة مجدداً`);
    } else {
      updatedMuted = [...currentMuted, targetUserId];
      noticeText = `تم حظر ${targetUserName} من كتابة الرسائل في الشات إدارياً`;
      showToast(`🤐 تم كتم كتابة الشات لـ ${targetUserName}`);
    }

    const updatedRoom = {
      ...currentRoom,
      mutedChatUsers: updatedMuted,
      messages: [
        ...currentRoom.messages,
        {
          id: Date.now().toString(),
          senderName: 'نظام الحماية 🛡️',
          senderAvatar: '',
          text: noticeText,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          isSystemNotice: true,
        },
      ],
    };

    setCurrentRoom(updatedRoom);
    saveRoomToRealtimeDb(updatedRoom);
    setShowProfileOptionsMenu(false);
    setSelectedUserProfileCard(null);
  };

  // 3. Kick User Direct from Room (24h)
  const handleKickUserFromRoomDirect = (targetUserId: string, targetUserName: string, seatId: number | null) => {
    if (!isHost && !isMod) {
      showToast('⚠️ ليس لديك صلاحية طرد المستخدمين');
      return;
    }
    if (targetUserId === currentRoom.hostId) {
      showToast('⚠️ لا يمكن طرد مالك الغرفة!');
      return;
    }

    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const updatedKicked = {
      ...(currentRoom.kickedUsers || {}),
      [targetUserId]: {
        kickedAt: Date.now(),
        expiresAt,
        kickedBy: user.name,
      },
    };

    const updatedSeats = currentRoom.seats.map((s) =>
      s.speakerUser?.id === targetUserId ? { ...s, speakerUser: undefined } : s
    );

    const updatedRoom = {
      ...currentRoom,
      seats: updatedSeats,
      kickedUsers: updatedKicked,
      listenersCount: Math.max(1, (currentRoom.listenersCount || 1) - 1),
      messages: [
        ...currentRoom.messages,
        {
          id: Date.now().toString(),
          senderName: 'نظام الأمان 🛡️',
          senderAvatar: '',
          text: `تم طرد ${targetUserName} من الغرفة لمدة 24 ساعة من قبل الإدارة`,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          isSystemNotice: true,
        },
      ],
    };

    setCurrentRoom(updatedRoom);
    saveRoomToRealtimeDb(updatedRoom);
    removeRoomMember(currentRoom.id, targetUserId);

    if (userOnSeat !== null && seatId === userOnSeat) {
      setUserOnSeat(null);
    }

    setShowProfileOptionsMenu(false);
    setSelectedUserProfileCard(null);
    showToast(`⛔ تم طرد ${targetUserName} من الغرفة لمدة 24 ساعة`);
  };

  // 4. Blacklist User Direct (Permanent Ban)
  const handleBlacklistUserDirect = (targetUserId: string, targetUserName: string, seatId: number | null) => {
    if (!isHost && !isMod) {
      showToast('⚠️ ليس لديك صلاحية الحظر النهائي');
      return;
    }
    if (targetUserId === currentRoom.hostId) {
      showToast('⚠️ لا يمكن حظر مالك الغرفة!');
      return;
    }

    const currentBlacklist = Array.isArray(currentRoom.blackList)
      ? currentRoom.blackList
      : Array.isArray(currentRoom.blacklistedUsers)
      ? currentRoom.blacklistedUsers
      : [];
    const updatedBlacklist = currentBlacklist.includes(targetUserId)
      ? currentBlacklist
      : [...currentBlacklist, targetUserId];

    const updatedSeats = currentRoom.seats.map((s) =>
      s.speakerUser?.id === targetUserId ? { ...s, speakerUser: undefined } : s
    );

    const updatedRoom = {
      ...currentRoom,
      seats: updatedSeats,
      blackList: updatedBlacklist,
      blacklistedUsers: updatedBlacklist,
      listenersCount: Math.max(1, (currentRoom.listenersCount || 1) - 1),
      messages: [
        ...currentRoom.messages,
        {
          id: Date.now().toString(),
          senderName: 'نظام الأمان 🛡️',
          senderAvatar: '',
          text: `تم وضع ${targetUserName} في القائمة السوداء وتطبيق الحظر الدائم`,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          isSystemNotice: true,
        },
      ],
    };

    setCurrentRoom(updatedRoom);
    saveRoomToRealtimeDb(updatedRoom);
    removeRoomMember(currentRoom.id, targetUserId);

    if (userOnSeat !== null && seatId === userOnSeat) {
      setUserOnSeat(null);
    }

    setShowProfileOptionsMenu(false);
    setSelectedUserProfileCard(null);
    showToast(`🚫 تم حظر ${targetUserName} وإضافته للقائمة السوداء`);
  };

  // Send Seat Invitation to Audience Member
  const handleSendSeatInvite = (targetUser: { id: string; name: string; avatar: string }, seatId: number) => {
    setPendingSeatInvite({
      targetUserId: targetUser.id,
      targetUserName: targetUser.name,
      targetUserAvatar: targetUser.avatar,
      inviterName: user.name,
      seatId,
    });

    setShowAudiencePicker(false);
    setSelectedSeatForAction(null);
    showToast(`✉️ تم إرسال دعوة صعود للمقعد #${seatId} إلى ${targetUser.name}!`);
  };

  // Accept Seat Invite
  const handleAcceptInvite = () => {
    if (!pendingSeatInvite) return;

    const { targetUserId, targetUserName, targetUserAvatar, seatId } = pendingSeatInvite;

    let actualSeatId = seatId;
    if (actualSeatId === 1 && targetUserId !== currentRoom.hostId) {
      const emptySeat = currentRoom.seats.find((s) => s.seatId > 1 && !s.speakerUser && !s.isLocked);
      if (!emptySeat) {
        showToast('عذراً، المقعد رقم 1 محجوز لمالك الغرفة فقط ولا يوجد مقعد آخر فارغ 👑');
        setPendingSeatInvite(null);
        return;
      }
      actualSeatId = emptySeat.seatId;
    }

    const updatedSeats = currentRoom.seats.map((s) =>
      s.seatId === actualSeatId
        ? {
          ...s,
          speakerUser: {
            id: targetUserId,
            agoraUid: getAgoraNumericUid(targetUserId),
            name: targetUserName,
            avatar: targetUserAvatar,
            isSpeaking: false,
            audioLevel: 0,
            vipLevel: 3,
            role: 'عضو',
          },
        }
        : s
    );

    const updatedRoom = {
      ...currentRoom,
      seats: updatedSeats,
      messages: [
        ...currentRoom.messages,
        {
          id: Date.now().toString(),
          senderName: 'نظام الدعوات 🎙️',
          senderAvatar: '',
          text: `انضم ${targetUserName} إلى المقعد #${actualSeatId} بناءً على دعوة المالك`,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          isSystemNotice: true,
        },
      ],
    };

    setCurrentRoom(updatedRoom);
    if (targetUserId === user.id) {
      setUserOnSeat(actualSeatId);
      localStorage.setItem(`last_seat_${currentRoom.id}_${user.id}`, String(actualSeatId));
    }
    saveRoomToRealtimeDb(updatedRoom);

    showToast(`🎉 أهلاً بك على المقعد رقم #${actualSeatId}`);
    setPendingSeatInvite(null);
  };

  // Reject Seat Invite Scenario
  const handleRejectInvite = () => {
    if (!pendingSeatInvite) return;

    const { targetUserName } = pendingSeatInvite;

    // Server WebSockets / Event: Emit dynamic system rejection notice in chat
    const updatedRoom = {
      ...currentRoom,
      messages: [
        ...currentRoom.messages,
        {
          id: Date.now().toString(),
          senderName: 'نظام SALEEM ⚙️',
          senderAvatar: '',
          text: `رسالة النظام: تم رفض الصعود من قبل ${targetUserName}`,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          isSystemNotice: true,
        },
      ],
    };

    setCurrentRoom(updatedRoom);
    saveRoomToRealtimeDb(updatedRoom);

    showToast(`⚠️ رفض ${targetUserName} دعوة الصعود للمقعد`);
    setPendingSeatInvite(null);
  };

  // Approve Pending Mic Request
  const handleApproveMicRequest = (reqId: string) => {
    const req = pendingMicRequests.find((r) => r.id === reqId);
    if (!req) return;

    let targetSeatId = req.requestedSeatId;
    if (!targetSeatId || (targetSeatId === 1 && req.userId !== currentRoom.hostId)) {
      const emptySeat = currentRoom.seats.find((s) => s.seatId > 1 && !s.speakerUser && !s.isLocked);
      targetSeatId = emptySeat ? emptySeat.seatId : undefined;
    }

    if (!targetSeatId) {
      showToast('❌ لا توجد مقاعد فارغة متاحة حالياً');
      return;
    }

    const updatedSeats = currentRoom.seats.map((s) =>
      s.seatId === targetSeatId
        ? {
          ...s,
          speakerUser: {
            id: req.userId,
            agoraUid: getAgoraNumericUid(req.userId),
            name: req.userName,
            avatar: req.userAvatar,
            isSpeaking: false,
            audioLevel: 0,
            vipLevel: 3,
            role: 'عضو',
          },
        }
        : s
    );

    const updatedRoom = {
      ...currentRoom,
      seats: updatedSeats,
      messages: [
        ...currentRoom.messages,
        {
          id: Date.now().toString(),
          senderName: 'نظام الإدارة 🎙️',
          senderAvatar: '',
          text: `تمت الموافقة على صعود ${req.userName} إلى المقعد #${targetSeatId}`,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          isSystemNotice: true,
        },
      ],
    };

    setCurrentRoom(updatedRoom);
    saveRoomToRealtimeDb(updatedRoom);

    setPendingMicRequests((prev) => prev.filter((r) => r.id !== reqId));
    showToast(`✅ تمت الموافقة على صعود ${req.userName} للمقعد #${targetSeatId}`);
  };

  // Reject Pending Mic Request
  const handleRejectMicRequest = (reqId: string) => {
    const req = pendingMicRequests.find((r) => r.id === reqId);
    if (!req) return;

    setPendingMicRequests((prev) => prev.filter((r) => r.id !== reqId));

    setCurrentRoom((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: Date.now().toString(),
          senderName: 'نظام الإدارة 🎙️',
          senderAvatar: '',
          text: `رسالة النظام: تم رفض طلب صعود المايك من قبل المالك`,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          isSystemNotice: true,
        },
      ],
    }));

    showToast(`❌ تم رفض طلب صعود ${req.userName}`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const trimmed = chatMessage.trim();

    const newMsg = {
      id: Date.now().toString(),
      senderName: user.name,
      senderAvatar: user.avatar,
      senderVip: user.vipLevel,
      text: trimmed,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedRoom = {
      ...currentRoom,
      messages: [...currentRoom.messages, newMsg],
    };

    setCurrentRoom(updatedRoom);
    saveRoomToRealtimeDb(updatedRoom);
    setChatMessage('');
  };

  const handleGiftClick = (gift: GiftItem) => {
    handleRichGiftSend(gift, currentRoom.hostName, 1);
  };

  const handleClaimTreasureBox = () => {
    if (!isBoxClaimable) return;
    alert('🎉 مبروك! حصلت على 500 عملة ذهبية و10 جواهر من صندوق الكنز!');
    setBoxTimer(60);
    setIsBoxClaimable(false);
  };

  // Build audience list for bottom bar: STRICT FILTERING to exclude any users seated on mic seats
  const seatedUserIds = new Set(
    currentRoom.seats
      .filter((s) => s.speakerUser && s.speakerUser.id)
      .map((s) => s.speakerUser!.id)
  );

  // Use Realtime Database connected presence list
  const baseMembers = realtimeMembers.length > 0 ? realtimeMembers : [];

  // Deduplicate by ID and filter out any user currently sitting on any seat
  const uniqueAudienceMap = new Map<string, any>();
  baseMembers.forEach((m) => {
    if (m && m.id && !uniqueAudienceMap.has(m.id)) {
      uniqueAudienceMap.set(m.id, m);
    }
  });

  const audienceList = Array.from(uniqueAudienceMap.values()).filter(
    (member) => !seatedUserIds.has(member.id)
  );

  if (isRoomMinimized) {
    return (
      <div dir={dir} className="fixed bottom-24 right-4 z-[9999] animate-in fade-in zoom-in-95 duration-200">
        <div className="relative group flex items-center gap-2.5 bg-slate-950/95 border-2 border-amber-400/90 rounded-2xl p-2.5 shadow-[0_0_35px_rgba(245,158,11,0.5)] backdrop-blur-xl">

          {/* Avatar with animated gold ring */}
          <div
            onClick={() => setIsRoomMinimized(false)}
            className="relative cursor-pointer shrink-0"
          >
            <img
              src={currentRoom.avatar || currentRoom.hostAvatar}
              alt={currentRoom.title}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400 shadow-md group-hover:scale-105 transition-transform"
            />

            {/* Equalizer animation when active */}
            {(isMusicPlaying || userOnSeat !== null) && (
              <div className="absolute -top-1 -left-1 flex items-end gap-0.5 bg-slate-900/90 px-1 py-0.5 rounded-full border border-amber-400/50">
                <span className="w-1 h-3 bg-amber-400 rounded-full animate-pulse" />
                <span className="w-1 h-4 bg-amber-300 rounded-full animate-bounce" />
                <span className="w-1 h-2 bg-amber-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>

          {/* Room Title & Listeners */}
          <div
            onClick={() => setIsRoomMinimized(false)}
            className="flex flex-col text-right cursor-pointer min-w-[100px] max-w-[140px]"
          >
            <div className="flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
              <h4 className="text-xs font-black text-amber-200 truncate">{currentRoom.title}</h4>
            </div>
            <span className="text-[10px] text-slate-300 font-mono flex items-center gap-1">
              <Users className="w-2.5 h-2.5 text-purple-300" />
              <span>{currentRoom.listenersCount || 1} متواجد</span>
            </span>
          </div>

          {/* Controls Bar on Bubble */}
          <div className="flex items-center gap-1 border-r border-amber-500/30 pr-2 mr-1">
            {/* Quick Mic Toggle if Seated */}
            {userOnSeat !== null && (
              <button
                type="button"
                onClick={() => {
                  setIsMicMuted(!isMicMuted);
                  handleToggleMuteSeat(userOnSeat);
                }}
                className={`p-1.5 rounded-xl border transition-all active:scale-90 ${isMicMuted
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-emerald-500/20 border-emerald-400 text-emerald-300 animate-pulse'
                  }`}
                title={isMicMuted ? 'إلغاء كتم المايك' : 'كتم المايك'}
              >
                {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Maximize Room View Button */}
            <button
              type="button"
              onClick={() => setIsRoomMinimized(false)}
              className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/50 transition-all active:scale-90"
              title="تكبير الغرفة الصوتية 🗖"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Close Room Button */}
            <button
              type="button"
              onClick={handleExitRoom}
              className="p-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-500/40 transition-all active:scale-90"
              title="خروج نهائي من الغرفة ❌"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div dir={dir} className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between font-sans overflow-hidden select-none h-full w-full">
      {/* Dynamic Royal Stage Background / Luxury Cinema Hall */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          key={isCinemaMode ? CINEMA_THEATER_BACKGROUND : (currentRoom.backgroundUrl || ROOM_BACKGROUND_THEMES[0].url)}
          src={isCinemaMode ? CINEMA_THEATER_BACKGROUND : (currentRoom.backgroundUrl || ROOM_BACKGROUND_THEMES[0].url)}
          alt="Stage BG"
          className={`w-full h-full object-cover transition-all duration-700 ease-in-out scale-100 ${isCinemaMode ? 'opacity-90 filter brightness-90 contrast-105' : 'opacity-80'
            }`}
        />
        <div className={`absolute inset-0 ${isCinemaMode
            ? 'bg-gradient-to-b from-black/85 via-black/40 to-black/95'
            : 'bg-gradient-to-b from-slate-950/60 via-slate-950/30 to-slate-950/80'
          }`} />

        {/* Animated Stage Spotlights Effect */}
        <div className="absolute inset-0 animate-gold-dust pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-gradient-to-b from-amber-500/10 via-purple-500/10 to-transparent blur-3xl animate-pulse" />
      </div>

      {/* 1. LUXURIOUS ROOM HEADER TOP BAR */}
      <div className="shrink-0 relative z-20 w-full px-3 sm:px-6 pt-2 pb-1.5 flex flex-col gap-1.5 text-xs border-b border-purple-900/40 bg-slate-950/70 backdrop-blur-md">
        {/* Top Main Row */}
        <div className="flex items-center justify-between gap-1.5">
          
          {/* Left Section: Back Button + Room Avatar + Title & ID + Quick Follow */}
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              onClick={() => setIsRoomMinimized(true)}
              className="p-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 transition-transform active:scale-90 shrink-0"
              title="تصغير الغرفة كأيقونة عائمة 🗗"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Room Cover Avatar */}
            <div
              onClick={() => setShowRoomInfoModal(true)}
              className="relative w-9 h-9 rounded-xl p-0.5 bg-gradient-to-tr from-amber-400 to-purple-600 shrink-0 shadow cursor-pointer group"
              title="معلومات الغرفة"
            >
              <img
                src={currentRoom.coverImage || currentRoom.hostAvatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150'}
                alt={currentRoom.title}
                className="w-full h-full rounded-[10px] object-cover"
              />
              <span className="absolute -bottom-1 -right-1 text-[8px] bg-slate-950/90 text-amber-300 rounded-full px-1 border border-amber-400/40">
                🎙️
              </span>
            </div>

            {/* Title, ID & Follow */}
            <div className="min-w-0 text-right">
              <div
                onClick={() => setShowRoomInfoModal(true)}
                className="flex items-center gap-1 cursor-pointer group"
              >
                <h2 className="font-black text-xs text-amber-200 truncate group-hover:text-amber-300">
                  {currentRoom.title}
                </h2>
                <Crown className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
              </div>
              
              <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
                <span>ID: {currentRoom.id.replace('room-', '') || '100562'}</span>
                {!isHost && !isFollowing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsFollowing(true);
                      showToast(`⭐ تم متابعة غرفة ${currentRoom.title}`);
                    }}
                    className="bg-purple-600/80 hover:bg-purple-500 text-white font-bold px-1.5 py-0.2 rounded-full text-[8.5px] cursor-pointer transition-all active:scale-95"
                  >
                    + متابعة
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Section: TOP 3 SUPPORTER AVATARS + ROOM CUP + ROOM CHARM + CONTROLS */}
          <div className="flex items-center gap-1 shrink-0">
            
            {/* 🏆 ROOM RANKING CUP (كأس الروم وترتيب الغرف) */}
            <button
              type="button"
              onClick={() => setShowRoomRankingCupModal(true)}
              className="flex items-center gap-0.5 bg-gradient-to-r from-amber-500/20 via-purple-900/40 to-amber-500/20 border border-amber-400/50 hover:border-amber-300 text-amber-300 px-2 py-1 rounded-full font-black text-[10px] shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all"
              title="كأس الروم وترتيب الغرف اليومي 🏆"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              <span className="font-mono">#3</span>
            </button>

            {/* 👑 TOP 3 SUPPORTERS SLOTS (الداعمين الثلاثة التوب) - 100% Dynamic Real Supporters */}
            <div
              onClick={() => setShowRoomTopSupportersModal(true)}
              className="flex items-center -space-x-1.5 space-x-reverse bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 px-1.5 py-0.5 rounded-full shadow-md cursor-pointer group transition-all hover:scale-105"
              title="عرض قائمة كبار داعمي الغرفة"
            >
              {/* Slot 1: Gold 🥇 */}
              {roomSupporters[0] ? (
                <div className="relative">
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px] drop-shadow">👑</span>
                  <img
                    src={roomSupporters[0].avatar}
                    alt={roomSupporters[0].name}
                    className="w-6 h-6 rounded-full object-cover border-1.5 border-amber-400 shadow-sm"
                  />
                </div>
              ) : (
                <div className="relative w-6 h-6 rounded-full border border-dashed border-amber-400/60 bg-amber-950/40 flex items-center justify-center text-[9px] text-amber-300">
                  <span>👑</span>
                </div>
              )}

              {/* Slot 2: Silver 🥈 */}
              {roomSupporters[1] ? (
                <div className="relative">
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px] drop-shadow">🥈</span>
                  <img
                    src={roomSupporters[1].avatar}
                    alt={roomSupporters[1].name}
                    className="w-5.5 h-5.5 rounded-full object-cover border-1.5 border-slate-300 shadow-sm"
                  />
                </div>
              ) : (
                <div className="relative w-5.5 h-5.5 rounded-full border border-dashed border-slate-500/60 bg-slate-900/60 flex items-center justify-center text-[8px] text-slate-400">
                  <span>🥈</span>
                </div>
              )}

              {/* Slot 3: Bronze 🥉 */}
              {roomSupporters[2] ? (
                <div className="relative">
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px] drop-shadow">🥉</span>
                  <img
                    src={roomSupporters[2].avatar}
                    alt={roomSupporters[2].name}
                    className="w-5 h-5 rounded-full object-cover border-1.5 border-amber-600 shadow-sm"
                  />
                </div>
              ) : (
                <div className="relative w-5 h-5 rounded-full border border-dashed border-amber-800/60 bg-slate-900/60 flex items-center justify-center text-[8px] text-amber-600">
                  <span>🥉</span>
                </div>
              )}
            </div>

            {/* Audience Count */}
            <div
              onClick={() => setShowRoomInfoModal(true)}
              className="flex items-center gap-1 bg-slate-900/80 border border-purple-500/30 px-2 py-1 rounded-full text-[10px] font-bold text-slate-200 shadow cursor-pointer hover:bg-slate-800"
              title="عدد الحضور في الغرفة"
            >
              <Users className="w-3 h-3 text-purple-300" />
              <span className="font-mono">{currentRoom.listenersCount || 1}</span>
            </div>

            {/* Settings (Exclusive for Room Owner & Moderators ONLY) */}
            {isMod && (
              <button
                type="button"
                onClick={() => setShowRoomSettingsModal(true)}
                className="p-1 rounded-full bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-amber-300 shadow cursor-pointer transition-transform active:scale-90"
                title="إعدادات الغرفة"
              >
                <Settings className="w-3.5 h-3.5 text-amber-300" />
              </button>
            )}

            {/* Minimize / Floating Bubble Button */}
            <button
              type="button"
              onClick={() => {
                if (onMinimize) {
                  onMinimize();
                } else {
                  handleExitRoom();
                }
              }}
              className="p-1 rounded-full bg-slate-900/80 hover:bg-purple-600/80 text-purple-200 hover:text-white border border-purple-500/40 transition-colors cursor-pointer"
              title="تصغير الغرفة للأسفل"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>

            {/* Power / Exit Button */}
            <button
              type="button"
              onClick={handleExitRoom}
              className="p-1 rounded-full bg-slate-900/80 hover:bg-red-600/80 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="مغادرة الغرفة"
            >
              <Power className="w-3.5 h-3.5 text-slate-200 hover:text-red-300" />
            </button>
          </div>
        </div>

        {/* Sub Header Row: Room Charm Points + Host Target + Live Diamonds */}
        <div className="flex items-center justify-between text-[10px] pt-0.5">
          {/* ✨ TOTAL ROOM CHARM POINTS (سحر وهدايا الغرفة الإجمالية) */}
          <div
            onClick={() => setShowRoomTopSupportersModal(true)}
            className="flex items-center gap-1 bg-gradient-to-r from-amber-950/80 via-purple-950/80 to-amber-900/80 border border-amber-400/50 text-amber-300 px-2 py-0.5 rounded-full font-bold shadow-sm cursor-pointer hover:scale-105 transition-all"
            title="سحر الغرفة وإجمالي الهدايا المرسلة"
          >
            <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
            <span>سحر الغرفة:</span>
            <span className="font-mono text-amber-200 font-black">
              {totalRoomCharm >= 1000 ? `${(totalRoomCharm / 1000).toFixed(1)}K` : totalRoomCharm.toLocaleString()} 🪙
            </span>
          </div>

          {/* 🌟 WEEKLY ROOM DIAMONDS COUNTER (ألماسات الغرفة الأسبوعية الحقيقية) */}
          <div
            onClick={() => {
              const weekStart = currentRoom.diamondsWeekStart || Date.now();
              const elapsed = Date.now() - weekStart;
              const daysRemaining = Math.max(1, Math.ceil((7 * 24 * 60 * 60 * 1000 - elapsed) / (24 * 60 * 60 * 1000)));
              showToast(`💎 ألماسات الغرفة الأسبوعية: ${weeklyDiamonds.toLocaleString()} ماسة (متبقي ${daysRemaining} أيام لتصفير الأسبوع)`);
            }}
            className="flex items-center gap-1 bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-purple-950/90 border border-cyan-400/50 px-2 py-0.5 rounded-full font-black text-[9.5px] text-cyan-200 shadow-md cursor-pointer hover:scale-105 transition-all"
            title="ألماسات الغرفة الأسبوعية الحقيقية"
          >
            <span className="text-amber-300">🌟</span>
            <span className="font-mono text-cyan-300 font-bold">
              {weeklyDiamonds >= 1000 ? `${(weeklyDiamonds / 1000).toFixed(1)}K` : weeklyDiamonds.toLocaleString()}
            </span>
            <span>💎</span>
          </div>

          {/* 🎯 HOST TARGET */}
          <div
            onClick={() => setShowHostTargetModal(true)}
            className="flex items-center gap-1 bg-gradient-to-r from-rose-950/80 via-purple-950/80 to-indigo-950/80 border border-rose-400/50 px-2 py-0.5 rounded-full font-black text-[9.5px] text-rose-200 shadow-md cursor-pointer hover:scale-105 transition-all"
            title="تارجت وساعات المضيف اليومية 🎯"
          >
            <span>🎯</span>
            <span>تارجت المضيف</span>
          </div>
        </div>
      </div>

      {/* Floating Mini Music Player Bar in Room */}
      {isMusicPlaying && activeTrack && !showMusicModal && (
        <div className="shrink-0 relative z-20 w-full max-w-2xl lg:max-w-3xl mx-auto px-3 py-1 bg-slate-950/90 border-b border-amber-500/40 flex items-center justify-between gap-2 text-xs shadow-md backdrop-blur">
          <div
            onClick={() => setShowMusicModal(true)}
            className="flex items-center gap-2 min-w-0 cursor-pointer flex-1"
          >
            <Music className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
            <span className="text-[10px] font-bold text-amber-200 truncate">🎵 {activeTrack.name}</span>
            <span className="text-[9px] text-amber-400 font-mono">
              ({formatAudioTime(musicCurrentTime)} / {formatAudioTime(musicDuration)})
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleToggleMusicPlayback}
              className="p-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/40 transition-colors cursor-pointer"
            >
              {isMusicPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMusicPlaying(false);
                if (audioRef.current) audioRef.current.pause();
              }}
              className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Toast Banner Notifications */}
      {toolbarToast && (
        <div className="relative z-30 mx-4 my-1 bg-gradient-to-r from-amber-500/90 via-purple-600/90 to-pink-600/90 border border-amber-300 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <span>{toolbarToast}</span>
          <button onClick={() => setToolbarToast(null)} className="text-amber-200 hover:text-white mr-1 font-mono">✕</button>
        </div>
      )}

      {/* PK Challenge Active Banner */}
      {/* PK Battle Overlay */}
      {isPKActive && pkBattleState && (
        <PKBattleOverlay
          pkState={pkBattleState}
          currentUser={currentUser}
          isHost={isHost}
          onSendPKGift={(team, amt) => {
            // Use MOCK_GIFTS[0] for quick support button points
            const gift = MOCK_GIFTS[0];
            const recipientName = team === 'red' ? currentRoom.hostName : pkBattleState.blueTeam.name;
            handleRichGiftSend(gift, recipientName, Math.round(amt / 100));
          }}
          onEndPK={() => {
            if (currentRoom.id) {
              stopPKBattle(currentRoom.id);
            }
            setIsPKActive(false);
            setPkBattleState(null);
            showToast('تم إنهاء تحدي الـ PK بنجاح 🏆');
          }}
          onOpenGiftSelector={() => setShowGiftSelector(true)}
        />
      )}

      {/* Live Party Active Glowing Banner */}
      {activePartyEvent && activePartyEvent.status === 'live' && (
        <div
          onClick={() => setShowPartyScheduleModal(true)}
          className="relative z-20 mx-3 my-1 bg-gradient-to-r from-pink-950/90 via-purple-950/90 to-amber-950/90 border-2 border-pink-500/70 rounded-2xl p-2.5 flex items-center justify-between text-white shadow-xl animate-in fade-in duration-300 cursor-pointer group hover:scale-[1.01] transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 flex items-center justify-center text-xl shadow-md border border-pink-300/40 animate-bounce">
              🎉
            </div>
            <div className="text-right">
              <div className="text-xs font-black text-pink-200 flex items-center gap-1">
                <span>{activePartyEvent.title}</span>
                <span className="text-[9px] bg-pink-500/20 text-pink-300 border border-pink-400/40 px-1.5 py-0.2 rounded-full font-bold">
                  حفلة نشطة 🔴
                </span>
              </div>
              <div className="text-[10px] text-amber-300 font-mono">
                الهدف: {activePartyEvent.currentCoins.toLocaleString()} / {activePartyEvent.targetCoins.toLocaleString()} 🪙
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-1 rounded-xl shadow group-hover:bg-amber-300 transition-colors">
              عرض الترتيب 🏆
            </span>
          </div>
        </div>
      )}

      {/* Clean Screen Restoration Button */}
      {isScreenClean && (
        <div className="relative z-30 flex justify-center my-1">
          <button
            onClick={() => {
              setIsScreenClean(false);
              showToast('تم إرجاع عناصر الواجهة الكاملة');
            }}
            className="bg-amber-500/90 hover:bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5 border border-amber-300 animate-pulse"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>إلغاء تصفية الشاشة (إظهار العناصر)</span>
          </button>
        </div>
      )}

      {/* Active Live Video Stream Stage Frame (شاشة بث الفيديو المباشر) */}
      {isVideoBroadcasting && (
        <div className="relative z-20 mx-3 my-1.5 bg-slate-950 border-2 border-rose-500/80 rounded-2xl overflow-hidden shadow-2xl shadow-rose-950/60 animate-in fade-in zoom-in duration-300">
          <div className="relative w-full h-44 sm:h-52 bg-slate-900 flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform ${isFrontCamera ? 'scale-x-[-1]' : ''} ${videoFilter === 'beauty' ? 'brightness-110 contrast-105 saturate-110' :
                  videoFilter === 'neon' ? 'hue-rotate-90 brightness-125' :
                    videoFilter === 'vintage' ? 'sepia contrast-120' : ''
                } ${isCameraMuted ? 'hidden' : 'block'}`}
            />

            {/* Muted Camera / Placeholder Overlay */}
            {isCameraMuted && (
              <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center space-y-2 p-4 text-center">
                <div className="w-14 h-14 rounded-full bg-rose-950/60 border border-rose-500/50 flex items-center justify-center shadow-lg">
                  <VideoOff className="w-7 h-7 text-rose-400" />
                </div>
                <p className="text-xs font-bold text-rose-200">الكاميرا متوقفة مؤقتاً</p>
                <p className="text-[10px] text-slate-400">بث الفيديو المباشر يعمل - تم كتم الصورة</p>
              </div>
            )}

            {/* Live Video Top Control Bar */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
              <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-rose-500/50">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                <span className="text-[10px] font-black text-rose-300 uppercase tracking-wider">🔴 LIVE 🎥 1080p</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsCameraMuted(!isCameraMuted)}
                  className="p-1.5 bg-black/70 hover:bg-black rounded-full border border-white/20 text-white text-xs transition-colors"
                  title={isCameraMuted ? 'تشغيل الكاميرا' : 'كتم الكاميرا'}
                >
                  {isCameraMuted ? <VideoOff className="w-3.5 h-3.5 text-rose-400" /> : <Video className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFrontCamera(!isFrontCamera)}
                  className="p-1.5 bg-black/70 hover:bg-black rounded-full border border-white/20 text-white text-xs transition-colors"
                  title="تبديل الكاميرا (الأمامية / الخلفية)"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsVideoBroadcasting(false);
                    showToast('تم إيقاف بث الفيديو المباشر');
                  }}
                  className="p-1.5 bg-rose-600/90 hover:bg-rose-600 rounded-full text-white text-xs transition-colors shadow"
                  title="إغلاق الفيديو"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Streamer Info Tag */}
            <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-2.5 py-1.5 rounded-b-xl">
              <div className="flex items-center gap-2">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-7 h-7 rounded-full border border-rose-400 object-cover" />
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-1">
                    <span>{currentUser.name}</span>
                    <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-black tracking-wide">بث فيديو</span>
                  </div>
                  <div className="text-[9px] text-rose-200">مباشر الآن عبر الكاميرا الحية 📹</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2.1 Active YouTube Video Cinema Player (Full / Minimized Picture-in-Picture Floating Mode) */}
      {showYoutubeFloatingPlayer && activeTrack?.youtubeId && youtubeMode === 'video' && (
        <>
          {/* Expanded Stage Cinema Mode (شاشة المسرح فوق المقاعد) */}
          {!isYoutubePipMinimized && (
            <div className="relative z-20 w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto my-1 bg-slate-950/95 border-2 border-amber-500/80 rounded-2xl overflow-hidden shadow-2xl shadow-amber-950/60 animate-in fade-in zoom-in duration-300 shrink-0">
              {/* Header Control Bar */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-amber-500/30 text-white">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white shrink-0 shadow">
                    <Youtube className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-amber-200 truncate">{activeTrack.name}</p>
                    <span className="text-[9px] text-slate-400">مشاهدة مباشرة مشتركة للجميع 🎬</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      handlePlayMusicTrack(activeTrack, 'audio_only');
                      showToast('🎧 تم التحويل لتشغيل الصوت فقط كخلفية بالغرفة');
                    }}
                    className="flex items-center gap-1 bg-purple-900/40 hover:bg-purple-900/70 text-purple-200 border border-purple-500/30 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
                    title="تحويل لصوت فقط (إخفاء شاشة الفيديو)"
                  >
                    <Headphones className="w-3 h-3 text-purple-300" />
                    <span>صوت فقط</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsYoutubePipMinimized(true);
                      showToast('🗗 تم تصغير الفيديو كشاشة عائمة في زاوية الغرفة');
                    }}
                    className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
                    title="تصغير كشاشة عائمة (Picture-in-Picture)"
                  >
                    <Minimize2 className="w-3 h-3" />
                    <span>تصغير</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMusicModal(true)}
                    className="p-1 rounded-lg bg-purple-900/40 hover:bg-purple-900/70 text-purple-300 border border-purple-500/30 transition-colors cursor-pointer"
                    title="قائمة الموسيقى والفيديوهات"
                  >
                    <Music className="w-3.5 h-3.5" />
                  </button>

                  {isHost && (
                    <button
                      type="button"
                      onClick={() => handleStopMusicPlayback()}
                      className="p-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                      title="إغلاق الفيديو للجميع"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* YouTube IFrame Embed */}
              <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                <iframe
                  src={audioSyncEngine.buildSyncedYouTubeUrl(activeTrack.youtubeId, activeTrack.addedAt, 'video')}
                  title={activeTrack.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

          {/* Minimized Floating Picture-in-Picture (PiP) Window (شاشة عائمة مصغرة) */}
          {isYoutubePipMinimized && (
            <div className="absolute top-20 start-4 z-40 w-56 sm:w-64 max-w-[calc(100vw-32px)] bg-slate-950/95 border-2 border-amber-400/90 rounded-2xl overflow-hidden shadow-2xl shadow-black/90 backdrop-blur-md animate-in fade-in zoom-in duration-200">
              {/* Mini Header Bar */}
              <div className="flex items-center justify-between px-2 py-1 bg-black/80 border-b border-amber-500/30 text-white">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                  <Youtube className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="text-[10px] font-black text-amber-300 truncate max-w-[100px]">
                    {activeTrack.name}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      handlePlayMusicTrack(activeTrack, 'audio_only');
                      showToast('🎧 تم التحويل لصوت فقط');
                    }}
                    className="p-1 rounded-md bg-purple-900/40 hover:bg-purple-900/70 text-purple-300 transition-colors cursor-pointer"
                    title="تحويل لصوت فقط (إخفاء الفيديو)"
                  >
                    <Headphones className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsYoutubePipMinimized(false);
                      showToast('🗖 تم تكبير الفيديو للشاشة الرئيسية');
                    }}
                    className="p-1 rounded-md bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 transition-colors cursor-pointer"
                    title="تكبير الفيديو"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMusicModal(true)}
                    className="p-1 rounded-md bg-purple-900/40 hover:bg-purple-900/80 text-purple-300 transition-colors cursor-pointer"
                    title="قائمة الموسيقى"
                  >
                    <Music className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleStopMusicPlayback();
                    }}
                    className="p-1 rounded-md bg-rose-600/80 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                    title="إغلاق الفيديو"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* YouTube Minimized Embedded Player */}
              <div className="relative w-full aspect-video bg-black">
                <iframe
                  src={audioSyncEngine.buildSyncedYouTubeUrl(activeTrack.youtubeId, activeTrack.addedAt, 'video')}
                  title={activeTrack.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0 pointer-events-auto"
                />
              </div>

              {/* Mini Control Footer */}
              <div className="px-2 py-0.5 bg-gradient-to-r from-amber-950/80 to-purple-950/80 flex items-center justify-between text-[9px] text-amber-200">
                <span className="font-bold truncate max-w-[120px]">🎵 يعمل للغرفة</span>
                <button
                  type="button"
                  onClick={() => setIsYoutubePipMinimized(false)}
                  className="text-amber-300 font-bold hover:underline cursor-pointer"
                >
                  تكبير 🗖
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 2.2 YouTube Audio-Only Mode: Active Background Player + Luxury Room Floating Pill */}
      {isMusicPlaying && activeTrack?.youtubeId && youtubeMode === 'audio_only' && (
        <>
          {/* Active Background YouTube IFrame for Audio Playback (Unthrottled in Android WebView & Web) */}
          <div className="absolute top-0 left-0 w-6 h-6 opacity-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
            <iframe
              src={audioSyncEngine.buildSyncedYouTubeUrl(activeTrack.youtubeId, activeTrack.addedAt, 'audio_only')}
              title="YouTube Audio Only"
              allow="autoplay; encrypted-media; fullscreen"
              className="w-6 h-6 border-0"
            />
          </div>

          {/* Floating Luxury Room Audio Pill */}
          <div className="relative z-20 mx-3 my-1.5 bg-slate-950/90 border border-purple-500/50 rounded-2xl px-3 py-2 flex items-center justify-between shadow-xl shadow-purple-950/50 backdrop-blur-md animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-400 flex items-center justify-center text-purple-300 shrink-0">
                <Headphones className="w-4 h-4 animate-bounce" />
              </div>
              <div className="min-w-0 text-right">
                <p className="text-xs font-bold text-amber-200 truncate">{activeTrack.name}</p>
                <div className="flex items-center gap-1 text-[9px] text-purple-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span>صوت يوتيوب بالخلفية فقط (مشترك في الغرفة) 🎧</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  handlePlayMusicTrack(activeTrack, 'video');
                  showToast('🎬 تم فتح شاشة الفيديو في الغرفة');
                }}
                className="flex items-center gap-1 bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 px-2 py-1 rounded-xl text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
                title="عرض شاشة الفيديو"
              >
                <Youtube className="w-3.5 h-3.5 text-red-400" />
                <span>عرض الفيديو</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMusicModal(true)}
                className="p-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/80 text-purple-300 border border-purple-500/30 transition-colors cursor-pointer"
                title="قائمة الموسيقى"
              >
                <Music className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleStopMusicPlayback}
                className="p-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                title="إيقاف الموسيقى"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* 2. DYNAMIC SPEAKERS MIC GRID (10, 12, 14, 15, 20, 25, 30 Seats Layout OR Cinema Mode) */}
      <div
        className={`flex-1 min-h-0 relative z-10 w-full px-2 sm:px-6 md:px-12 py-1 flex flex-col justify-start overflow-y-auto no-scrollbar my-auto transition-all duration-300 ${
          showYoutubeFloatingPlayer && activeTrack?.youtubeId && youtubeMode === 'video' && !isYoutubePipMinimized
            ? 'scale-[0.88] sm:scale-95 origin-top -mt-1'
            : ''
        }`}
      >

        {/* Host/Mod Quick Layout Action Bar (Hidden in Cinema Mode) */}
        {canManageRoomLayout && !isCinemaMode && (
          <div className="flex items-center justify-between px-2 mb-1 text-[11px] shrink-0">
            <button
              onClick={() => setShowSeatSettingsModal(true)}
              className="flex items-center gap-1.5 bg-purple-900/60 hover:bg-purple-800/80 border border-purple-500/40 text-purple-200 px-2.5 py-1 rounded-full font-bold shadow transition-all active:scale-95"
            >
              <Grid className="w-3.5 h-3.5 text-amber-400" />
              <span>تخصيص الهيكلية ({currentRoom.seatLayout?.type === 'boss' ? 'مايك البوس' : 'مايك أساسي'} - {currentRoom.seats.length} مقعد)</span>
            </button>
            <span className="text-[10px] text-slate-400 font-medium">قالب شبكة المقاعد</span>
          </div>
        )}

        {/* CINEMA MODE: BIG CINEMA SCREEN & 10 CINEMA SEATS */}
        {isCinemaMode ? (
          <div className="w-full flex flex-col my-auto py-1 space-y-2 animate-in fade-in zoom-in-95 duration-300">
            {/* 1. The Big Cinema Screen (شاشة السينما الكبرى 🎬) */}
            <div className="relative w-full bg-black/90 border-2 border-amber-500/70 rounded-3xl overflow-hidden shadow-[0_0_35px_rgba(245,158,11,0.4)] backdrop-blur-md">
              {/* Cinema Screen Header Bar */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-red-950/90 via-slate-950 to-amber-950/90 border-b border-amber-500/40 text-white">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                  <Tv className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-black text-amber-200 truncate max-w-[170px]">
                    {cinemaVideoTitle}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowCinemaModal(true)}
                    className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow"
                    title="اختيار فيلم / تغيير المقطع 🔍"
                  >
                    <Youtube className="w-3 h-3 text-red-500" />
                    <span>تغيير الفيديو 🎬</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCinemaMode(false);
                      if (currentRoom?.id) {
                        stopRoomCinema(currentRoom.id);
                      }
                      showToast('تم إنهاء وضع السينما والعودة للوضع العادي');
                    }}
                    className="p-1 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer"
                    title="إغلاق شاشة السينما"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Cinema Screen Video Player Frame */}
              <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${cinemaVideoId}?autoplay=1&enablejsapi=1`}
                  title={cinemaVideoTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0 pointer-events-auto"
                />
              </div>

              {/* Cinema Theater Ambient Glow Bar */}
              <div className="px-3 py-1 bg-gradient-to-r from-red-950/80 via-purple-950/80 to-amber-950/80 flex items-center justify-between text-[9px] text-amber-300 font-bold border-t border-amber-500/20">
                <span className="flex items-center gap-1">
                  <span>🍿 شاشة السينما التفاعلية - مشاهدة جماعية مباشرة</span>
                </span>
                <span className="text-purple-300 font-mono">10 مقاعد محجوزة للسينما 🎟️</span>
              </div>
            </div>

            {/* 2. 10 Cinema Theater Seats Layout (صفين من 5 مقاعد سينما) */}
            <div className="w-full space-y-1.5 pt-1">
              <div className="flex items-center justify-between px-2 text-[10px] text-amber-300 font-bold">
                <span>🍿 مقاعد السينما المباشرة (10 مقاعد)</span>
                <span className="text-purple-300 text-[9px]">انقر على المقعد للمشاركة والتحدث 🎙️</span>
              </div>

              {/* 10 Seats arranged in 2 rows of 5 */}
              <div className="grid grid-cols-5 gap-y-2 gap-x-1.5 p-2 bg-black/40 border border-amber-500/30 rounded-2xl backdrop-blur-sm">
                {currentRoom.seats.slice(0, 10).map((seat) => {
                  const speaker = seat.speakerUser;
                  const speakerAgoraUid = speaker ? getAgoraNumericUid(speaker.id) : 0;
                  const speakerLiveLevel = speaker
                    ? Math.max(
                      liveSpeakingLevels[speaker.id] || 0,
                      liveSpeakingLevels[String(speakerAgoraUid)] || 0,
                      speaker.id === user.id ? (liveSpeakingLevels['0'] || liveSpeakingLevels[user.id] || 0) : 0,
                      speaker.audioLevel || 0
                    )
                    : 0;
                  const isSpeakerActive = speakerLiveLevel > 5 && !seat.isMuted;

                  return (
                    <div
                      key={seat.seatId}
                      onClick={() => handleSeatClick(seat)}
                      className="flex flex-col items-center group cursor-pointer relative"
                    >
                      <span className="text-[8.5px] font-bold text-amber-300/90 mb-0.5">
                        #{seat.seatId}
                      </span>

                      <div className="relative flex items-center justify-center">
                        {speaker ? (
                          <div className={`relative flex items-center justify-center rounded-full ${isSpeakerActive ? 'gold-ripple-effect' : ''}`}>
                            <AvatarWithFrame
                              src={speaker.avatar}
                              frameId={speaker.equippedFrame || (speaker.id === user.id ? user.equippedFrame : undefined)}
                              size="lg"
                              isSpeaking={isSpeakerActive}
                              audioLevel={isSpeakerActive ? speakerLiveLevel : 0}
                            />

                            {seat.isMuted && (
                              <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-0.5 border border-white z-20">
                                <MicOff className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all flex items-center justify-center vip-seat-glass ${
                            seat.isLocked
                              ? 'text-purple-400'
                              : 'text-amber-300 hover:scale-105'
                          }`}>
                            {seat.isLocked ? (
                              <Lock className="w-4 h-4 text-purple-400" />
                            ) : (
                              <span className="text-base">🍿</span>
                            )}
                          </div>
                        )}
                      </div>

                      <span className="text-[9px] font-black text-white truncate max-w-[55px] mt-0.5 text-center">
                        {speaker ? speaker.name : `مقعد ${seat.seatId}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Dynamic Grid Layout */
          (() => {
            const totalSeats = currentRoom.seats.length;
            const is30Seats = totalSeats >= 21;
            const is20Seats = totalSeats >= 16 && totalSeats < 21;
            const is15Seats = totalSeats >= 11 && totalSeats < 16;

            let gridColsClass = 'grid-cols-5';
            if (totalSeats === 12 || totalSeats === 14) {
              gridColsClass = 'grid-cols-4';
            } else if (is30Seats) {
              gridColsClass = 'grid-cols-6';
            }

            let seatCircleSizeClass = 'w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14';
            let bossSeatSizeClass = 'w-14 h-14 md:w-16 md:h-16';
            let seatTextClass = 'text-[9px] md:text-[11px]';
            let gapClass = 'gap-y-2 gap-x-1.5 md:gap-y-3 md:gap-x-3';

            if (is30Seats) {
              seatCircleSizeClass = 'w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11';
              bossSeatSizeClass = 'w-11 h-11 md:w-13 md:h-13';
              seatTextClass = 'text-[8px] md:text-[9.5px]';
              gapClass = 'gap-y-1 gap-x-1 md:gap-y-2 md:gap-x-2';
            } else if (is20Seats) {
              seatCircleSizeClass = 'w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12';
              bossSeatSizeClass = 'w-12 h-12 md:w-14 md:h-14';
              seatTextClass = 'text-[8.5px] md:text-[10px]';
              gapClass = 'gap-y-1.5 gap-x-1 md:gap-y-2 md:gap-x-2';
            } else if (is15Seats) {
              seatCircleSizeClass = 'w-10 h-10 sm:w-11 sm:h-11 md:w-13 md:h-13';
              bossSeatSizeClass = 'w-13 h-13 md:w-15 md:h-15';
              seatTextClass = 'text-[9px] md:text-[10.5px]';
              gapClass = 'gap-y-1.5 gap-x-1.5 md:gap-y-2.5 md:gap-x-2.5';
            }

            return (
              <div className="w-full flex flex-col my-auto py-1 space-y-1.5">

                <div className={`grid ${gridColsClass} ${gapClass}`}>
                  {currentRoom.seats.map((seat) => {
                    const speaker = seat.speakerUser;
                    const isBossMic = (currentRoom.seatLayout?.type === 'boss' || seat.isHostSeat) && seat.seatId === 1;
                    const speakerAgoraUid = speaker ? getAgoraNumericUid(speaker.id) : 0;
                    const speakerLiveLevel = speaker
                      ? Math.max(
                        liveSpeakingLevels[speaker.id] || 0,
                        liveSpeakingLevels[String(speakerAgoraUid)] || 0,
                        speaker.id === user.id ? (liveSpeakingLevels['0'] || liveSpeakingLevels[user.id] || 0) : 0,
                        speaker.audioLevel || 0
                      )
                      : 0;
                    const isSpeakerActive = speakerLiveLevel > 5 && !seat.isMuted;

                    return (
                      <div
                        key={seat.seatId}
                        onClick={() => handleSeatClick(seat)}
                        className={`flex flex-col items-center group cursor-pointer relative ${isBossMic ? 'col-span-full py-0.5' : ''
                          }`}
                      >
                        {/* Ordered Number / Boss Badge above Mic Circle */}
                        {isBossMic ? (
                          <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-400/60 px-2 py-0.5 rounded-full text-[9px] font-black text-amber-300 mb-0.5 shadow">
                            <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>مايك البوس #1</span>
                          </div>
                        ) : (
                          <span className={`${seatTextClass} font-bold text-slate-300/80 mb-0.5`}>
                            {seat.seatId}
                          </span>
                        )}

                        {/* Mic Seat Circle Container */}
                        <div className="relative">
                          {/* Dynamic Real-Time Speaking Soundwave Ripples (ذبذبات الصوت حول المستخدم المتحدث) */}
                          {speaker && isSpeakerActive && (
                            <>
                              {/* 1. Outer Pulse Ring */}
                              <div
                                className="absolute -inset-2.5 rounded-full border-2 border-emerald-400/60 animate-ping pointer-events-none"
                                style={{ animationDuration: '1.1s' }}
                              />
                              {/* 2. Middle Dynamic Expanding Glow */}
                              <div
                                className="absolute -inset-1.5 rounded-full bg-emerald-400/25 border border-emerald-400/80 transition-all duration-75 ease-out pointer-events-none"
                                style={{
                                  transform: `scale(${1 + (speakerLiveLevel / 100) * 0.35})`,
                                  opacity: 0.4 + (speakerLiveLevel / 100) * 0.6,
                                  boxShadow: `0 0 ${Math.max(10, Math.round(speakerLiveLevel / 2))}px rgba(52, 211, 153, 0.8)`,
                                }}
                              />
                              {/* 3. Inner Emerald Ring */}
                              <div className="absolute -inset-0.5 rounded-full ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.9)] pointer-events-none" />
                            </>
                          )}

                          {speaker ? (
                            <div className="relative flex items-center justify-center">
                              <AvatarWithFrame
                                src={speaker.avatar}
                                frameId={speaker.equippedFrame || (speaker.id === user.id ? user.equippedFrame : undefined)}
                                size={isBossMic ? 'xl' : 'lg'}
                                isSpeaking={isSpeakerActive}
                                audioLevel={isSpeakerActive ? speakerLiveLevel : 0}
                              />

                              {/* Mic Muted Badge */}
                              {seat.isMuted && (
                                <div className="absolute inset-0 bg-slate-950/70 rounded-full flex items-center justify-center z-20">
                                  <MicOff className="w-3.5 h-3.5 text-red-400" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div
                              className={`rounded-full flex items-center justify-center relative overflow-hidden transition-all shadow-md ${isBossMic ? bossSeatSizeClass : seatCircleSizeClass
                                } ${seat.isLocked
                                  ? 'border-2 border-slate-800 bg-slate-950/80'
                                  : 'border-2 border-dashed border-purple-500/50 hover:border-amber-400 bg-purple-950/30'
                                }`}
                            >
                              {seat.isLocked ? (
                                <Lock className="w-3.5 h-3.5 text-slate-600" />
                              ) : isBossMic ? (
                                <Crown className="w-5 h-5 text-amber-400 fill-amber-400/30 group-hover:scale-110 transition-transform" />
                              ) : (
                                <Plus className="w-4 h-4 text-purple-300 group-hover:scale-110 transition-transform" />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Seat Name or Points Badge Below Circle */}
                        <div className="mt-0.5 flex flex-col items-center max-w-[50px]">
                          {speaker ? (
                            <span className={`${seatTextClass} font-bold text-amber-200 truncate w-full text-center drop-shadow`}>
                              {speaker.name}
                            </span>
                          ) : (
                            <span className={`${seatTextClass} text-slate-400 text-[8px]`}>
                              {isBossMic ? 'المالك' : `مقعد ${seat.seatId}`}
                            </span>
                          )}
                          <div className="flex items-center gap-0.5 text-[8px] font-bold text-purple-300/90">
                            <span>{seat.points || 0}</span>
                            <span className="text-purple-400">⭐</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })())}
      </div>

      {/* 3. AUDIENCE / SEAT BAR (شريط قائمة الحضور والأعضاء) */}
      <div className="shrink-0 relative z-10 w-full max-w-2xl lg:max-w-3xl mx-auto px-3 py-1 bg-slate-950/90 border-t border-b border-purple-900/40 flex items-center gap-2.5 overflow-x-auto no-scrollbar">
        {/* Members Count Badge */}
        <div className="flex flex-col items-center justify-center shrink-0 pr-1 text-slate-400">
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[9px] font-bold text-slate-300">الأعضاء</span>
          <span className="text-[8px] font-mono text-amber-300">({audienceList.length})</span>
        </div>

        {/* Member Avatars with Role Badges */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {audienceList.map((member) => (
            <div
              key={member.id}
              onClick={() => {
                setSelectedUserProfileCard({
                  user: member,
                  seatId: null,
                });
                setShowProfileOptionsMenu(false);
              }}
              className="relative flex flex-col items-center shrink-0 group cursor-pointer active:scale-95 transition-transform"
            >
              <div className="relative w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-purple-500 via-amber-400 to-indigo-500 shadow shrink-0">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full rounded-full object-cover"
                />
                {member.isMuted && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-slate-900 rounded-full border border-slate-700 flex items-center justify-center">
                    <MicOff className="w-2 h-2 text-red-400" />
                  </span>
                )}
              </div>

              {/* Role Badge under photo */}
              <span
                className={`mt-0.5 text-[8px] font-black px-1.5 py-0.2 rounded-full border shadow-sm ${member.role === 'مقدم'
                    ? 'bg-amber-500 text-slate-950 border-amber-300'
                    : member.role === 'مدير'
                      ? 'bg-purple-600 text-white border-purple-400'
                      : member.role === 'VIP'
                        ? 'bg-amber-600 text-amber-100 border-amber-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
              >
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. LIVE CHAT & GIFTS FLOATING DISPLAY */}
      <div className="shrink-0 relative z-10 w-full px-3 sm:px-6 py-1 flex items-end justify-between gap-2 min-h-[100px] max-h-[150px]">
        {/* Left Floating Live Events Chat Log */}
        {showChatBox && (
          <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[130px] pr-1 text-xs no-scrollbar">
            {/* Custom or Default Welcome Banner */}
            <div className="bg-slate-900/85 backdrop-blur border border-purple-500/30 text-amber-200 px-3 py-1.5 rounded-xl text-[10px] flex items-center gap-2 shadow">
              <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
              <span className="line-clamp-2">
                {currentRoom.welcomeMessage
                  ? `📢 ${currentRoom.welcomeMessage}`
                  : `✨ مرحباً بك في غرفة ${currentRoom.title}`}
              </span>
            </div>

            {/* Simulated Live Room Messages */}
            {(currentRoom.messages || []).map((msg) => (
              <div
                key={msg.id}
                className={`p-1.5 rounded-xl transition-all max-w-[85%] backdrop-blur text-[10px] ${msg.isSystemNotice
                    ? 'bg-purple-950/70 border border-purple-500/30 text-purple-200'
                    : msg.isGiftNotice
                      ? 'bg-gradient-to-r from-amber-900/80 to-purple-900/80 border border-amber-400/50 text-amber-200 font-bold shadow-md'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-200'
                  }`}
              >
                {!msg.isSystemNotice && (
                  <div
                    onClick={() => {
                      const seatedSeat = currentRoom.seats.find((s) => s.speakerUser?.name === msg.senderName);
                      setSelectedUserProfileCard({
                        user: {
                          id: msg.senderId || `usr_${msg.senderName}`,
                          name: msg.senderName,
                          avatar: msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                        },
                        seatId: seatedSeat ? seatedSeat.seatId : null,
                      });
                      setShowProfileOptionsMenu(false);
                    }}
                    className="flex items-center gap-1.5 mb-0.5 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {msg.senderAvatar && (
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="w-3.5 h-3.5 rounded-full object-cover"
                      />
                    )}
                    <span className="font-bold text-amber-300 text-[9px]">{msg.senderName}</span>
                  </div>
                )}
                <p className="leading-snug">{msg.text}</p>
              </div>
            ))}
            {/* Scroll Controller Anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Right Floating Treasure Box / Reward Chest Card */}
        <div className="shrink-0 flex flex-col items-center">
          <div className="relative w-18 h-20 rounded-2xl bg-gradient-to-b from-purple-900/90 via-slate-900/90 to-purple-950/90 border border-purple-500/50 p-1.5 flex flex-col items-center justify-between shadow-[0_0_20px_rgba(168,85,247,0.3)] backdrop-blur-md">
            {/* Glowing Chest Graphic */}
            <div className="relative my-auto">
              <div className="absolute -inset-2 rounded-full bg-amber-500/30 blur-md animate-pulse" />
              <div className="text-2xl filter drop-shadow-[0_4px_8px_rgba(245,158,11,0.6)]">
                🎁
              </div>
            </div>

            {/* Timer & Open Button */}
            <div className="w-full flex flex-col items-center gap-0.5">
              <span className="text-[9px] font-mono font-bold text-amber-300">
                00:{boxTimer < 10 ? `0${boxTimer}` : boxTimer}
              </span>
              <button
                onClick={handleClaimTreasureBox}
                className={`w-full py-0.5 rounded-lg text-[9px] font-black transition-all shadow ${isBoxClaimable
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 animate-bounce'
                    : 'bg-purple-600/80 text-white hover:bg-purple-500'
                  }`}
              >
                {isBoxClaimable ? 'احصل الآن!' : 'فتح'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. TOOLBAR POPUP DIALOG (شريط الأدوات) - Restricted to Owner & Admins */}
      {isMod && showQuickToolbar && (
        <>
          {/* Subtle transparent overlay to close when clicking outside without hiding seats background */}
          <div
            className="fixed inset-0 z-40 bg-black/15 backdrop-blur-[1px]"
            onClick={() => setShowQuickToolbar(false)}
          />

          {/* Compact Bottom Toolbar Sheet */}
          <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none p-0 sm:p-3 animate-in slide-in-from-bottom duration-200">
            <div
              className="w-full max-w-lg bg-[#120a22]/95 backdrop-blur-xl border-t-2 border-amber-500/60 rounded-t-3xl sm:rounded-3xl p-3 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] space-y-2 relative overflow-hidden text-right pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Gold Subtle Radial Glow */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-500/15 blur-2xl pointer-events-none" />

              {/* Header */}
              <div className="relative flex items-center justify-between pb-1 border-b border-purple-500/20">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400 text-xs">❖</span>
                  <h3 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
                    شريط الأدوات
                  </h3>
                  <span className="text-amber-400 text-xs">❖</span>
                </div>

                {/* Security Role Badge Header */}
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 rounded-full px-2.5 py-0.5 text-[9px] font-bold text-amber-300">
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span>{isHost ? 'صاحب الغرفة 👑' : 'مشرف 🛡️'}</span>
                </div>

                {/* Close Button on Left */}
                <button
                  onClick={() => setShowQuickToolbar(false)}
                  className="w-7 h-7 rounded-full bg-[#1b162d] border border-amber-500/30 text-amber-200 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer"
                  title="إغلاق"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {!isMod ? (
                <div className="text-center py-4 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 flex items-center justify-center mx-auto text-xl shadow-lg">
                    🔒
                  </div>
                  <h4 className="text-xs font-black text-red-300">وصول محمي - إدارة الغرفة</h4>
                  <p className="text-[10px] text-slate-300 px-2 leading-relaxed">
                    شريط الأدوات حصر لأصحاب الغرفة والمشرفين فقط.
                  </p>
                  <button
                    onClick={() => setShowQuickToolbar(false)}
                    className="mt-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] px-4 py-1.5 rounded-xl border border-slate-700 active:scale-95 transition-transform"
                  >
                    فهمت ذلك
                  </button>
                </div>
              ) : (
                <>
                  {/* Row 1: 5 Main Feature Buttons (مواجهة, حفلة, مركز المهام, حقيبة الحظ, إدارة المشرفين) */}
                  <div className="grid grid-cols-5 gap-1.5 py-0.5">
                    {/* 1. مواجهة (PK) */}
                    <button
                      onClick={() => {
                        setShowQuickToolbar(false);
                        if (isPKActive && pkBattleState) {
                          showToast('⚔️ جولة الـ PK نشطة حالياً في أعلى الغرفة!');
                        } else if (isHost) {
                          setShowPKSetupModal(true);
                        } else {
                          showToast('⚠️ تحدي PK متاح لصاحب الغرفة فقط.');
                        }
                      }}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                      <div className="relative w-11 h-11 rounded-full p-[2px] bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-400 shadow-md shadow-purple-900/50 group-hover:scale-105 active:scale-95 transition-all">
                        <div className="w-full h-full rounded-full bg-[#18122c] flex items-center justify-center overflow-hidden border border-purple-300/40">
                          <span className="text-xs font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 drop-shadow">
                            PK
                          </span>
                        </div>
                        {isPKActive && (
                          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                        مواجهة PK
                      </span>
                    </button>

                    {/* 2. حفلة */}
                    <button
                      onClick={() => {
                        setShowQuickToolbar(false);
                        setShowPartyScheduleModal(true);
                      }}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                      <div className="relative w-11 h-11 rounded-full p-[2px] bg-gradient-to-br from-purple-500 via-pink-500 to-amber-400 shadow-md shadow-pink-900/50 group-hover:scale-105 active:scale-95 transition-all">
                        <div className="w-full h-full rounded-full bg-[#1e1333] flex items-center justify-center border border-pink-300/40">
                          <Sparkles className="w-4 h-4 text-pink-300 animate-pulse" />
                        </div>
                        {activePartyEvent && activePartyEvent.status === 'live' && (
                          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-slate-900" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                        حفلة 🎉
                      </span>
                    </button>

                    {/* 3. مركز المهام */}
                    <button
                      onClick={() => {
                        setShowTaskCenter(true);
                        setShowQuickToolbar(false);
                      }}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-md shadow-amber-900/50 group-hover:scale-105 active:scale-95 transition-all">
                        <div className="w-full h-full rounded-full bg-[#251b0f] flex items-center justify-center border border-amber-400/40">
                          <Calendar className="w-4.5 h-4.5 text-amber-300" />
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                        المهام
                      </span>
                    </button>

                    {/* 4. حقيبة الحظ */}
                    <button
                      onClick={() => {
                        setShowLuckyBag(true);
                        setShowQuickToolbar(false);
                      }}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-br from-rose-500 via-purple-600 to-amber-400 shadow-md shadow-rose-900/50 group-hover:scale-105 active:scale-95 transition-all">
                        <div className="w-full h-full rounded-full bg-[#230f1e] flex items-center justify-center border border-rose-400/40">
                          <Gift className="w-4.5 h-4.5 text-rose-300 animate-bounce" />
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                        حقيبة الحظ
                      </span>
                    </button>

                    {/* 5. إدارة المشرفين */}
                    <button
                      onClick={() => {
                        setShowModeratorsListModal(true);
                        setShowQuickToolbar(false);
                      }}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-br from-indigo-500 via-purple-600 to-amber-400 shadow-md shadow-purple-900/50 group-hover:scale-105 active:scale-95 transition-all">
                        <div className="w-full h-full rounded-full bg-[#170e2b] flex items-center justify-center border border-purple-400/40">
                          <Shield className="w-4.5 h-4.5 text-amber-300" />
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                        المشرفين
                      </span>
                    </button>
                  </div>

                  {/* Golden Diamond Divider Line */}
                  <div className="relative flex items-center justify-center my-1">
                    <div className="w-full border-t border-[#292240]" />
                    <span className="absolute bg-[#120a22] px-2 text-amber-400 text-[9px]">❖</span>
                  </div>

                  {/* Row 2: Secondary Control Buttons */}
                  <div className="grid grid-cols-5 gap-1 pt-0.5">
                    {/* 1. وضع المقاعد */}
                    <button
                      onClick={() => {
                        setIsMicModeLocked(!isMicModeLocked);
                        showToast(
                          !isMicModeLocked
                            ? '🔒 تم تحويل نظام صعود المقاعد إلى: وضع الطلب والموافقة'
                            : '🔓 تم فتح نظام صعود المقاعد للجميع فوراً'
                        );
                      }}
                      className={`flex flex-col items-center gap-1 group cursor-pointer ${isMicModeLocked ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                    >
                      <div className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${isMicModeLocked
                          ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                          : 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                        }`}>
                        {isMicModeLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </div>
                      <span className="text-[9px] font-bold text-center leading-tight">
                        {isMicModeLocked ? 'بالطلب' : 'مفتوحة'}
                      </span>
                    </button>

                    {/* 2. مشاركة واستدعاء المتابعين */}
                    <button
                      onClick={() => {
                        setShowQuickToolbar(false);
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(`https://saleem.live/room/${currentRoom.id}`);
                        }
                        window.dispatchEvent(
                          new CustomEvent('app:room-invitation-broadcast', {
                            detail: {
                              roomId: currentRoom.id,
                              roomTitle: currentRoom.title,
                              hostName: currentRoom.hostName,
                              hostAvatar: currentRoom.hostAvatar,
                            },
                          })
                        );
                        showToast(`📢 تم إرسال إشعار دعوة واستدعاء لجميع المتابعين والأصدقاء! 🎉`);
                      }}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#1a162b] border border-amber-500/20 flex items-center justify-center group-hover:border-amber-400 group-hover:bg-[#251f3b] transition-all text-amber-300">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-300 group-hover:text-white">
                        استدعاء 📢
                      </span>
                    </button>

                    {/* 3. صوت الإغلاق */}
                    <button
                      onClick={() => {
                        setIsRoomAudioMuted(!isRoomAudioMuted);
                        showToast(isRoomAudioMuted ? 'تم تشغيل صوت الغرفة 🔊' : 'تم كتم الصوت العام للغرفة 🔇');
                      }}
                      className={`flex flex-col items-center gap-1 group cursor-pointer ${isRoomAudioMuted ? 'text-red-400' : 'text-slate-300'
                        }`}
                    >
                      <div className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${isRoomAudioMuted
                          ? 'bg-red-950/60 border-red-500 text-red-400'
                          : 'bg-[#1a162b] border-amber-500/20 group-hover:border-amber-400 text-amber-300'
                        }`}>
                        <VolumeX className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold text-center leading-tight">
                        كتم الصوت
                      </span>
                    </button>

                    {/* 4. رسومية الإغلاق */}
                    <button
                      onClick={() => {
                        setIsAnimationsDisabled(!isAnimationsDisabled);
                        showToast(isAnimationsDisabled ? 'تم تفعيل رسوميات ومؤثرات البث 💥' : 'تم إيقاف الرسوميات الثقيلة ⚡');
                      }}
                      className={`flex flex-col items-center gap-1 group cursor-pointer ${isAnimationsDisabled ? 'text-amber-400' : 'text-slate-300'
                        }`}
                    >
                      <div className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${isAnimationsDisabled
                          ? 'bg-amber-950/60 border-amber-500 text-amber-400'
                          : 'bg-[#1a162b] border-amber-500/20 group-hover:border-amber-400 text-amber-300'
                        }`}>
                        <ZapOff className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold text-center leading-tight">
                        الرسوم
                      </span>
                    </button>

                    {/* 5. موسيقى */}
                    <button
                      onClick={() => {
                        setShowMusicModal(true);
                        setShowQuickToolbar(false);
                      }}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                      <div className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${isMusicPlaying
                          ? 'bg-purple-900/60 border-purple-400 text-purple-300'
                          : 'bg-[#1a162b] border-amber-500/20 group-hover:border-amber-400 text-amber-300'
                        }`}>
                        <Music className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-300 group-hover:text-white">
                        موسيقى
                      </span>
                    </button>



                    {/* 7. صندوق الكنز الجماعي */}
                    <button
                      onClick={() => {
                        setShowLuckyRoomChestModal(true);
                        setShowQuickToolbar(false);
                      }}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-300 group-hover:border-amber-400 transition-all shadow">
                        <Gift className="w-4 h-4 text-amber-400" />
                      </div>
                      <span className="text-[9px] font-bold text-amber-300 group-hover:text-white">
                        صندوق كنز 🎁
                      </span>
                    </button>

                    {/* 8. لوحة المؤثرات SFX */}
                    <button
                      onClick={() => {
                        setShowVoiceFxModal(true);
                        setShowQuickToolbar(false);
                      }}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-300 group-hover:border-purple-400 transition-all shadow">
                        <Radio className="w-4 h-4 text-purple-300" />
                      </div>
                      <span className="text-[9px] font-bold text-purple-300 group-hover:text-white">
                        مؤثرات SFX 🎙️
                      </span>
                    </button>
                  </div>

                  {/* Row 3: Bottom Extra Actions (تصفية الشاشة, استدعاء الجمهور, مسح الرسائل, بث فيديو) */}
                  <div className="flex items-center justify-around pt-1.5 border-t border-[#292240]/60">
                    {/* تصفية الشاشة */}
                    <button
                      onClick={() => {
                        setIsScreenClean(!isScreenClean);
                        setShowQuickToolbar(false);
                        showToast(isScreenClean ? 'تم إرجاع عناصر القائمة' : 'تم تصفية الشاشة بنقاء 🖼️');
                      }}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                      <div className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${isScreenClean
                          ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                          : 'bg-[#1a162b] border-amber-500/20 group-hover:border-amber-400 text-amber-300'
                        }`}>
                        <Maximize2 className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-300 group-hover:text-white">
                        تصفية
                      </span>
                    </button>

                    {/* استدعاء الجمهور */}
                    <button
                      onClick={() => {
                        showToast('📣 تم إرسال نداء استدعاء عاجل لجميع المتابعين!');
                        setShowQuickToolbar(false);
                      }}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#1a162b] border border-amber-500/20 flex items-center justify-center group-hover:border-amber-400 group-hover:bg-[#251f3b] transition-all text-amber-300">
                        <Megaphone className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-300 group-hover:text-white text-center leading-tight">
                        استدعاء
                      </span>
                    </button>

                    {/* مسح الرسائل (للمالك فقط) */}
                    {isHost && (
                      <button
                        onClick={async () => {
                          setShowQuickToolbar(false);
                          const success = await clearRoomMessagesInRealtimeDb(currentRoom.id);
                          if (success) {
                            const updated = { ...currentRoom, messages: [] };
                            setCurrentRoom(updated);
                            saveRoomToRealtimeDb(updated);
                            showToast('🧹 تم مسح جميع رسائل الدردشة بالغرفة بنجاح وتصفير الشات للجميع!');
                          } else {
                            showToast('❌ حدث خطأ أثناء مسح الرسائل، يرجى المحاولة لاحقاً');
                          }
                        }}
                        className="flex flex-col items-center gap-1 group cursor-pointer"
                        title="مسح كافة رسائل الدردشة بالغرفة وتصفير الشات فوراً للجميع"
                      >
                        <div className="w-9 h-9 rounded-full bg-red-950/70 border border-red-500/60 hover:border-red-400 flex items-center justify-center text-red-400 group-hover:bg-red-900/90 group-hover:text-red-100 transition-all shadow-md active:scale-90">
                          <Trash2 className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold text-red-300 group-hover:text-red-100">
                          مسح الشات
                        </span>
                      </button>
                    )}

                    {/* سينما الغرفة واليوتيوب */}
                    <button
                      onClick={() => {
                        setShowQuickToolbar(false);
                        if (isCinemaMode) {
                          setShowCinemaModal(true);
                        } else {
                          setIsCinemaMode(true);
                          setShowCinemaModal(true);
                          showToast('🍿 تم تفعيل وضع سينما الغرفة و10 مقاعد للمشاهدين!');
                        }
                      }}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                      <div className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${isCinemaMode
                          ? 'bg-gradient-to-r from-red-600 to-amber-500 border-amber-400 text-white animate-pulse shadow-md shadow-red-950'
                          : 'bg-[#1a162b] border-amber-500/30 group-hover:border-amber-400 text-amber-300'
                        }`}>
                        <Camera className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-300 group-hover:text-white">
                        {isCinemaMode ? 'إعداد السينما' : 'سينما الغرفة'}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* 6. BOTTOM CONTROL BAR (شريط أدوات التحكم السفلي) */}
      <div className="shrink-0 relative z-20 w-full vip-toolbar-glass px-3 sm:px-6 py-2 pb-safe">
        <div className="flex items-center justify-between gap-1.5">

          {/* Gift Box Button */}
          <button
            onClick={() => setShowGiftSelector(!showGiftSelector)}
            className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-400 text-white flex items-center justify-center shadow-lg shadow-purple-900/40 border border-pink-400/30 hover:scale-105 active:scale-95 transition-all"
            title="إرسال هدية"
          >
            <Gift className="w-4 h-4 text-white" />
          </button>

          {/* Mini-Games Button */}
          <button
            onClick={onOpenGames}
            className="w-8 h-8 shrink-0 rounded-full bg-[#202836] border border-slate-700/60 text-purple-300 flex items-center justify-center hover:bg-slate-700/80 transition-all active:scale-95"
            title="الألعاب والفعاليات"
          >
            <Gamepad2 className="w-4 h-4" />
          </button>

          {/* Red Packet Button (كنز الغرفة والظرف الأحمر) */}
          <button
            onClick={() => setShowRedPacketModal(true)}
            className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 border border-amber-400/50 text-white flex items-center justify-center shadow hover:scale-105 transition-all active:scale-95 text-sm"
            title="إسقاط ظرف أحمر للغرفة 🧧"
          >
            <span>🧧</span>
          </button>

          {/* Cinema / YouTube Video Broadcast Button (زر وضع السينما واليوتيوب) */}
          <button
            onClick={() => {
              if (isCinemaMode) {
                setShowCinemaModal(true);
              } else {
                setIsCinemaMode(true);
                setShowCinemaModal(true);
                showToast('🍿 تم تفعيل وضع سينما الغرفة و10 مقاعد للمشاهدين!');
              }
            }}
            className={`w-9 h-9 shrink-0 rounded-full border flex items-center justify-center transition-all active:scale-95 relative shadow-md cursor-pointer ${isCinemaMode
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 border-amber-400 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                : 'bg-gradient-to-r from-rose-600 to-red-600 border-rose-400/40 text-white hover:scale-105'
              }`}
            title="زر وضع السينما ومقاطع اليوتيوب 🎬🍿"
          >
            <Camera className="w-4.5 h-4.5 text-white" />
            {isCinemaMode && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-slate-900 animate-ping" />
            )}
          </button>

          {/* Messages / Chat Toggle Button with Badge 21 */}
          <button
            onClick={() => setShowChatBox(!showChatBox)}
            className="w-8 h-8 shrink-0 rounded-full bg-[#202836] border border-slate-700/60 text-slate-200 flex items-center justify-center hover:bg-slate-700/80 transition-all active:scale-95 relative"
            title="الدردشة والرسائل"
          >
            <MessageSquare className="w-4 h-4 text-slate-200" />
            <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow border border-purple-400/40">
              21
            </span>
          </button>

          {/* Queue / Mic Requests Button for Host & Mod */}
          {isMod ? (
            <button
              onClick={() => setShowMicRequestsModal(true)}
              className="w-8 h-8 shrink-0 rounded-full bg-[#202836] border border-amber-500/50 text-amber-300 flex items-center justify-center hover:bg-slate-700/80 transition-all active:scale-95 relative"
              title="طلبات صعود المايك والانتظار"
            >
              <Inbox className="w-4 h-4 text-amber-300" />
              {pendingMicRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow border border-red-400 animate-pulse">
                  {pendingMicRequests.length}
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => setShowRoomInfoModal(true)}
              className="w-8 h-8 shrink-0 rounded-full bg-[#202836] border border-slate-700/60 text-slate-200 flex items-center justify-center hover:bg-slate-700/80 transition-all active:scale-95"
              title="الأعضاء وقائمة المايك"
            >
              <Users className="w-4 h-4 text-slate-200" />
            </button>
          )}

          {/* Request Mic / Hand Raise / Mic Toggle Button */}
          {(() => {
            const myCurrentSeat = userOnSeat !== null ? currentRoom.seats.find((s) => s.seatId === userOnSeat) : null;
            const myAgoraUid = getAgoraNumericUid(user.id);
            const myAudioLevel = Math.max(
              liveSpeakingLevels[user.id] || 0,
              liveSpeakingLevels['0'] || 0,
              liveSpeakingLevels[String(myAgoraUid)] || 0,
              myCurrentSeat?.speakerUser?.audioLevel || 0
            );

            return (
              <button
                onClick={() => {
                  if (userOnSeat !== null) {
                    const nextMuted = !isMicMuted;
                    setIsMicMuted(nextMuted);
                    agoraVoiceManager.setMuted(nextMuted);
                    const updatedSeats = currentRoom.seats.map((s) =>
                      s.seatId === userOnSeat ? { ...s, isMuted: nextMuted } : s
                    );
                    const updatedRoom = { ...currentRoom, seats: updatedSeats };
                    setCurrentRoom(updatedRoom);
                    saveRoomToRealtimeDb(updatedRoom);
                    showToast(nextMuted ? '🔇 تم كتم الميكروفون' : '🎙️ تم تشغيل الميكروفون والتحدث!');
                  } else {
                    const emptySeat = currentRoom.seats.find((s) => !s.speakerUser && !s.isLocked);
                    if (emptySeat) {
                      handleSeatClick(emptySeat);
                    } else {
                      showToast('⚠️ جميع المقاعد مشغولة أو مقفلة حالياً');
                    }
                  }
                }}
                className={`w-8 h-8 shrink-0 rounded-full border flex items-center justify-center transition-all active:scale-95 relative ${userOnSeat !== null
                    ? isMicMuted
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-emerald-500/20 border-emerald-400 text-emerald-300 animate-pulse'
                    : isHandRaised
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-[#202836] border-slate-700/60 text-slate-200 hover:bg-slate-700/80'
                  }`}
                title={
                  userOnSeat !== null
                    ? isMicMuted
                      ? 'المايك مكتوم - انقر لإلغاء الكتم'
                      : `المايك يعمل (مستوى الصوت: ${myAudioLevel}%) - انقر للكتم`
                    : isHandRaised
                      ? 'تم طلب المايك ✋'
                      : 'صعود المايك / طلب الكلمة'
                }
              >
                {/* Live Agora Volume Percentage Badge */}
                {userOnSeat !== null && !isMicMuted && myAudioLevel > 0 && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-400 text-slate-950 font-black text-[7px] px-1 rounded-full shadow border border-emerald-200 animate-bounce pointer-events-none">
                    {myAudioLevel}%
                  </span>
                )}
                {userOnSeat !== null ? (
                  isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            );
          })()}

          {/* Chat Input Field (Wide pill on right containing the 4-square grid icon) */}
          <form onSubmit={handleSendMessage} className="flex-1 min-w-[120px] flex items-center bg-[#202836] border border-slate-700/60 rounded-full px-2.5 py-1.5 focus-within:border-purple-500 transition-colors gap-2">
            {/* 4-Square Options Grid Icon (Visible only to Room Owner & Admins) */}
            {isMod && (
              <button
                type="button"
                onClick={() => setShowQuickToolbar(!showQuickToolbar)}
                className={`p-1 rounded flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95 ${showQuickToolbar ? 'text-amber-400 bg-amber-500/20' : 'hover:bg-slate-700/50'
                  }`}
                title="شريط الأدوات والخيارات (الإدارة)"
              >
                <div className="grid grid-cols-2 gap-[2px] w-4 h-4 p-[1px] border border-current rounded-[3px]">
                  <div className="bg-current rounded-[1px]" />
                  <div className="bg-current rounded-[1px]" />
                  <div className="bg-current rounded-[1px]" />
                  <div className="bg-current rounded-[1px]" />
                </div>
              </button>
            )}

            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="اكتب رسالة في شات الغرفة..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none text-right px-1"
            />
          </form>

        </div>
      </div>

      {/* 3D Animated Gift Overlay (مؤثرات الهدايا والورود الفاخرة والفيديوهات العريضة) */}
      <Gift3DAnimationOverlay
        animation={active3DAnimation}
        onComplete={() => setActive3DAnimation(null)}
      />

      {/* FLOATING TIMED LUCKY BAG WIDGET (طافية بالعد التنازلي كالصورة المرفقة - تظهر فقط بعد الإسقاط) */}
      {activeTimedBag && activeTimedBag.status === 'active' && (
        <div className="absolute left-4 bottom-24 sm:bottom-28 z-40 animate-in zoom-in duration-300">
          <div className="bg-[#180d28]/95 border-2 border-purple-500/80 rounded-2xl p-2 flex flex-col items-center justify-center gap-1 shadow-[0_0_25px_rgba(168,85,247,0.5)] backdrop-blur-md w-[85px] sm:w-[95px] text-center transition-all hover:scale-105 group">

            {/* Gift Picture with glowing aura */}
            <div className="relative flex items-center justify-center my-0.5">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-rose-500 rounded-full blur-md opacity-60 animate-pulse" />
              <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-xl flex items-center justify-center text-xl shadow-inner relative z-10 border border-amber-300/50 animate-bounce">
                🎁
              </div>
            </div>

            {/* Countdown Timer Text (Below picture) */}
            <div className="text-[#facc15] font-mono text-xs font-black tracking-wider drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]">
              {formatTimeMMSS(activeTimedBag.timeLeft)}
            </div>

            {/* "فَـتْـح" (Open / Claim) Action Button */}
            <button
              type="button"
              onClick={() => {
                if (!activeTimedBag.claimedUserIds.includes(currentUser.id)) {
                  setActiveTimedBag((prev) => prev ? { ...prev, claimedUserIds: [...prev.claimedUserIds, currentUser.id] } : prev);
                  showToast('🎉 تم تسجيل اسمك في قرعة حقيبة الهدايا الموقوتة!');
                } else {
                  showToast('✅ أنت مضاف بالفعل في قائمة المنتظرين للحقيبة!');
                }
              }}
              className={`w-full py-1 px-2 rounded-xl font-black text-xs transition-all active:scale-90 shadow-md cursor-pointer flex items-center justify-center gap-1 ${activeTimedBag.claimedUserIds.includes(currentUser.id)
                  ? 'bg-emerald-600 text-white border border-emerald-400/50'
                  : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-700 hover:brightness-110 text-white border border-purple-400/60 shadow-purple-900/50'
                }`}
            >
              {activeTimedBag.claimedUserIds.includes(currentUser.id) ? (
                <span>مسجّل ✓</span>
              ) : (
                <span>فَـتْـح</span>
              )}
            </button>

            <span className="text-[9px] text-purple-200/90 font-bold block truncate max-w-full">
              {activeTimedBag.totalCoins.toLocaleString()} 🪙
            </span>
          </div>
        </div>
      )}

      {/* 🚀 FLOATING CIRCULAR MULTI-SEND COMBO BUTTON (الزر الدائري لإعادة الإرسال السريع والكومبو) */}
      {floatingCombo && (
        <div className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 z-50 animate-in zoom-in-75 duration-150 pointer-events-auto select-none">
          <div className="relative flex flex-col items-center">
            
            {/* Top Combo Streak Badge */}
            <div className="absolute -top-3 z-20 flex items-center gap-1 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full border border-yellow-300 shadow-[0_0_15px_rgba(239,68,68,0.9)] animate-pulse">
              <span>🔥 COMBO x{floatingCombo.comboStreak}</span>
            </div>

            {/* Glowing Circular Button */}
            <button
              type="button"
              onClick={handleQuickComboSend}
              className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-slate-950/95 border-2 border-amber-400/90 shadow-[0_0_35px_rgba(245,158,11,0.7)] flex items-center justify-center cursor-pointer hover:scale-110 active:scale-90 transition-transform group"
              title={`إرسال سريع: ${floatingCombo.gift.name}`}
            >
              {/* Radial countdown ring around the button */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5">
                <circle
                  cx="50%"
                  cy="50%"
                  r="44%"
                  className="stroke-amber-500/20"
                  strokeWidth="3"
                  fill="transparent"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="44%"
                  className="stroke-amber-400 transition-all duration-75"
                  strokeWidth="3.5"
                  strokeDasharray="276"
                  strokeDashoffset={276 - (276 * comboProgress) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Gift Icon / Image */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                {floatingCombo.gift.icon?.startsWith('/') || floatingCombo.gift.icon?.startsWith('http') ? (
                  <img
                    src={floatingCombo.gift.icon}
                    alt={floatingCombo.gift.name}
                    className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-md group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl filter drop-shadow">
                    {floatingCombo.gift.icon || '🎁'}
                  </span>
                )}
                <span className="text-[9px] font-black text-amber-300 font-mono -mt-0.5">
                  {(floatingCombo.gift.priceCoins || floatingCombo.gift.priceDiamonds || 10).toLocaleString()} 🪙
                </span>
              </div>
            </button>

            {/* Recipient Target label pill */}
            <div className="mt-1 bg-slate-950/90 border border-purple-500/40 px-2 py-0.2 rounded-full shadow text-[9px] font-bold text-slate-200 truncate max-w-[100px] text-center">
              {floatingCombo.recipientName}
            </div>
          </div>
        </div>
      )}

      {/* 5. USER PROFILE CARD MODAL */}
      {selectedUserProfileCard && (
        <UserProfileCard
          targetUserId={selectedUserProfileCard.user.id}
          initialUserData={{
            id: selectedUserProfileCard.user.id,
            name: selectedUserProfileCard.user.name,
            avatar: selectedUserProfileCard.user.avatar,
            diamonds: selectedUserProfileCard.user.diamonds || (selectedUserProfileCard.seatId !== null ? currentRoom.seats.find((s) => s.seatId === selectedUserProfileCard.seatId)?.speakerUser?.diamonds : 0) || (selectedUserProfileCard.user.id === currentUser.id ? currentUser.diamonds : 0) || 0,
            equippedFrame: selectedUserProfileCard.user.equippedFrame,
            vipLevel: selectedUserProfileCard.user.vipLevel || 3,
            wealthLevel: selectedUserProfileCard.user.wealthLevel || 15,
            seatId: selectedUserProfileCard.seatId,
            bio: selectedUserProfileCard.user.bio,
            country: selectedUserProfileCard.user.country,
            gender: selectedUserProfileCard.user.gender,
          }}
          currentUser={user}
          isHost={isHost}
          isMod={isMod}
          isSeatMuted={
            selectedUserProfileCard.seatId !== null
              ? currentRoom.seats.find((s) => s.seatId === selectedUserProfileCard.seatId)?.isMuted || false
              : false
          }
          onClose={() => {
            setSelectedUserProfileCard(null);
            setShowProfileOptionsMenu(false);
          }}
          onOpenGiftSelector={() => {
            setSelectedUserProfileCard(null);
            setShowGiftSelector(true);
          }}
          onToggleMuteSeat={(seatId) => handleToggleMuteSeat(seatId)}
          onLowerFromSeat={(seatId) => handleKickSeatUser(seatId)}
          onKickUser={(uid) => handleKickUserFromRoomDirect(uid, selectedUserProfileCard.user.name, selectedUserProfileCard.seatId)}
          onBlacklistUser={(uid) => handleBlacklistUserDirect(uid, selectedUserProfileCard.user.name, selectedUserProfileCard.seatId)}
          onToggleModerator={(uid) => handleToggleModeratorRole(uid, selectedUserProfileCard.user.name)}
          onMentionInChat={(name) => {
            setChatMessage(`@${name} `);
            showToast(`📣 تمت الإشارة إلى @${name}`);
          }}
          showToast={showToast}
        />
      )}

      {/* Gift Selector Modal Overlay */}
      {showGiftSelector && (
        <GiftSelectorModal
          user={currentUser}
          seats={currentRoom.seats}
          onClose={() => setShowGiftSelector(false)}
          onOpenRecharge={() => {
            setShowGiftSelector(false);
            if (onOpenCoinStore) onOpenCoinStore();
          }}
          onUpdateCoins={(delta) => {
            const newCoins = Math.max(0, currentUser.coins + delta);
            setCurrentUser((prev) => ({ ...prev, coins: newCoins }));
            if (onUpdateUser) onUpdateUser({ coins: newCoins });
          }}
          onUpdateUserBalance={(newDiamonds, newXp, newLevel) => {
            const updated = { diamonds: newDiamonds, wealthXp: newXp, wealthLevel: newLevel };
            setCurrentUser((prev) => ({ ...prev, ...updated }));
            if (onUpdateUser) onUpdateUser(updated);
          }}
          onSendGift={(gift, recipient, amount, luckyReward) => {
            handleRichGiftSend(gift, recipient, amount, luckyReward);
          }}
        />
      )}

      {/* Host Target Modal Overlay */}
      {showHostTargetModal && (
        <HostTargetModal
          user={currentUser}
          room={currentRoom}
          onClose={() => setShowHostTargetModal(false)}
          onOpenWithdrawal={() => {
            setShowHostTargetModal(false);
            if (onOpenWithdrawalModal) {
              onOpenWithdrawalModal();
            }
          }}
        />
      )}

      {/* Red Packet Drop Modal Overlay */}
      {showRedPacketModal && (
        <RedPacketModal
          user={currentUser}
          activePacket={activeRedPacket}
          onClose={() => setShowRedPacketModal(false)}
          onDropPacket={(packet) => {
            setActiveRedPacket(packet);
            showToast(`🧧 قام ${currentUser.name} بإسقاط ظرف أحمر بقيمة ${packet.totalCoins} عملة!`);
          }}
          onClaimPacket={(packetId) => {
            showToast('🎉 تم فتح الظرف الأحمر واستلام العملات بنجاح!');
          }}
          onOpenRecharge={() => {
            setShowRedPacketModal(false);
            if (onOpenCoinStore) onOpenCoinStore();
          }}
        />
      )}

      {/* 5. SEAT MANAGEMENT POPUP MENU (لوحة التحكم بالمقاعد للمالك) */}
      {selectedSeatForAction && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-80 bg-slate-900 border-2 border-purple-500/60 rounded-3xl p-4 space-y-3.5 text-right shadow-2xl relative overflow-hidden">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-black text-xs text-amber-300">
                  لوحة إشراف المقعد رقم #{selectedSeatForAction.seatId}
                </span>
              </div>
              <button
                onClick={() => setSelectedSeatForAction(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedSeatForAction.speakerUser ? (
              /* Occupied Seat Actions (خارات الكرسي المشغول) */
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-800/90 border border-slate-700/60 rounded-2xl">
                  <img
                    src={selectedSeatForAction.speakerUser.avatar}
                    alt={selectedSeatForAction.speakerUser.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-xs text-white truncate">
                      {selectedSeatForAction.speakerUser.name}
                    </p>
                    <p className="text-[10px] text-amber-300 font-mono mt-0.5">
                      نقاط الدعم: {selectedSeatForAction.points || 0} ⭐
                    </p>
                  </div>
                </div>

                {/* Mute / Unmute Mic Button */}
                <button
                  onClick={() => handleToggleMuteSeat(selectedSeatForAction.seatId)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors border border-slate-700/50"
                >
                  <div className="flex items-center gap-2">
                    {selectedSeatForAction.isMuted ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-amber-400" />}
                    <span>{selectedSeatForAction.isMuted ? 'إلغاء كتم المايك' : 'كتم صوت المايك (Mute Mic)'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">إجباري</span>
                </button>

                {/* Kick to Audience Button */}
                <button
                  onClick={() => handleKickSeatUser(selectedSeatForAction.seatId)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-300 border border-amber-500/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <UserX className="w-4 h-4" />
                    <span>إنزال إلى المستمعين (Kick to Audience)</span>
                  </div>
                </button>

                {/* Ban / Kick Out Room Button */}
                <button
                  onClick={() => handleBanUserFromRoom(selectedSeatForAction.seatId)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-xs font-bold text-rose-300 border border-rose-500/40 transition-colors shadow"
                >
                  <div className="flex items-center gap-2">
                    <UserMinus className="w-4 h-4 text-rose-400" />
                    <span>طرد نهائي من الغرفة (Ban / Kick Out)</span>
                  </div>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                </button>
              </div>
            ) : (
              /* Empty Seat Actions (خيارات الكرسي الفارغ) */
              <div className="space-y-2.5">
                <p className="text-[11px] text-slate-300 font-medium">هذا المقعد شاغر حالياً. اختر إجراءً للتحكم:</p>

                {/* Lock / Unlock Seat Button */}
                <button
                  onClick={() => handleToggleLockSeat(selectedSeatForAction.seatId)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all ${selectedSeatForAction.isLocked
                      ? 'bg-purple-950/80 border-purple-400 text-purple-200 hover:bg-purple-900'
                      : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedSeatForAction.isLocked ? <Unlock className="w-4 h-4 text-purple-300" /> : <Lock className="w-4 h-4 text-amber-400" />}
                    <span>{selectedSeatForAction.isLocked ? 'فتح المقعد للجمهور (Unlock)' : 'تسكير / قفل المقعد (Lock Seat)'}</span>
                  </div>
                  <span className="text-[10px] opacity-70">
                    {selectedSeatForAction.isLocked ? '🔒 مقفل' : '🔓 مفتوح'}
                  </span>
                </button>

                {/* Invite Audience User to Seat Button */}
                <button
                  onClick={() => {
                    setTargetSeatForInvite(selectedSeatForAction.seatId);
                    setShowAudiencePicker(true);
                    setSelectedSeatForAction(null);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg transition-all active:scale-95"
                >
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    <span>دعوة مستخدم للمقعد (Invite User)</span>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. AUDIENCE PICKER MODAL (قائمة اختيار المستمعين لإرسال دعوة) */}
      {showAudiencePicker && targetSeatForInvite !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-purple-500/60 rounded-3xl p-4 space-y-3 text-right shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-2.5">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm text-amber-200">
                  دعوة صعود للمقعد #{targetSeatForInvite}
                </h3>
              </div>
              <button
                onClick={() => setShowAudiencePicker(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-300">اختر أحـد المستمعين لإرسال إشعار تنبيه صعود مباشر لشاشته:</p>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {audienceList.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-2xl hover:bg-slate-700/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-9 h-9 rounded-full object-cover border border-amber-400/60"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{member.name}</p>
                      <span className="text-[9px] text-amber-300 font-mono">رتبة: {member.role}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendSeatInvite(member, targetSeatForInvite)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl shadow active:scale-95 transition-transform flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>إرسال دعوة</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. INVITATION POP-UP MODAL (تنبيه دعوة الصعود المنبثق في منتصف شاشة المستخدم) */}
      {pendingSeatInvite && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in duration-300">
          <div className="w-full max-w-xs bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950 border-2 border-amber-400 rounded-3xl p-5 text-center space-y-4 shadow-2xl relative overflow-hidden">
            {/* Ambient Spotlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center shadow-xl ring-4 ring-amber-400/30 animate-bounce">
              <Mic className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-black text-base text-amber-300 flex items-center justify-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>دعوة صعود للمقعد 🎙️</span>
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                يدعوك المضيف <span className="font-bold text-amber-300">{pendingSeatInvite.inviterName}</span> للصعود والتحدث على المقعد رقم <span className="font-mono text-cyan-300 font-bold">#{pendingSeatInvite.seatId}</span>
              </p>
            </div>

            {/* Accept / Reject Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={handleAcceptInvite}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs py-2.5 rounded-xl shadow-lg active:scale-95 transition-all border border-emerald-400/40 flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" />
                <span>قبول الدعوة</span>
              </button>

              <button
                onClick={handleRejectInvite}
                className="w-full bg-slate-800/80 hover:bg-rose-950/80 text-rose-300 border border-rose-500/50 font-bold text-xs py-2.5 rounded-xl shadow active:scale-95 transition-all flex items-center justify-center gap-1"
              >
                <X className="w-4 h-4" />
                <span>رفض الدعوة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. PENDING MIC REQUESTS MODAL (قائمة الانتظار والطلبات للمالك) */}
      {showMicRequestsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-purple-500/60 rounded-3xl p-4 space-y-3 text-right shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-2.5">
              <div className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm text-amber-200">
                  طلبات صعود المايك المعلقة ({pendingMicRequests.length})
                </h3>
              </div>
              <button
                onClick={() => setShowMicRequestsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {pendingMicRequests.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Hand className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs font-bold">لا توجد طلبات صعود معلقة حالياً</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                {pendingMicRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-2xl"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={req.userAvatar}
                        alt={req.userName}
                        className="w-9 h-9 rounded-full object-cover border border-amber-400/60"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{req.userName}</p>
                        <p className="text-[10px] text-amber-300">يرغب بالصعود للمقعد #{req.requestedSeatId || 'أي مقعد'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleApproveMicRequest(req.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow active:scale-95"
                      >
                        قبول
                      </button>
                      <button
                        onClick={() => handleRejectMicRequest(req.id)}
                        className="bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-bold text-[10px] px-2.5 py-1 rounded-lg shadow active:scale-95"
                      >
                        رفض
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Room Info BottomSheet Dialog */}
      {showRoomInfoModal && (
        <RoomInfoModal
          room={currentRoom}
          user={user}
          onClose={() => setShowRoomInfoModal(false)}
          onUpdateAnnouncement={(newAnn) => {
            setCurrentRoom((prev) => ({ ...prev, announcement: newAnn }));
            if (onUpdateRoomAnnouncement) {
              onUpdateRoomAnnouncement(currentRoom.id, newAnn);
            }
          }}
          onUpdateRoom={(updatedRoom) => {
            const updated = { ...currentRoom, ...updatedRoom };
            setCurrentRoom(updated);
            saveRoomToRealtimeDb(updated);
            showToast('✅ تم حفظ وتطبيق إعدادات الغرفة بنجاح لجميع الحاضرين!');
          }}
        />
      )}

      {/* Seat Layout Customization Modal (activity_seat_settings.xml) */}
      {showSeatSettingsModal && (
        <SeatGridSettingsModal
          currentLayout={currentRoom.seatLayout || { type: 'basic', count: currentRoom.seats.length }}
          userLevel={user.vipLevel || 5}
          onSave={handleSaveSeatLayout}
          onClose={() => setShowSeatSettingsModal(false)}
        />
      )}

      {/* Task Center Modal (مركز المهام) */}
      {showTaskCenter && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#120f24] border border-amber-500/40 rounded-3xl p-4 space-y-3 text-right shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm text-amber-200">مركز المهام والمكافآت اليومية</h3>
              </div>
              <button onClick={() => setShowTaskCenter(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-300">أكمل المهام الصوتية اليومية واجمع الذهب والماس لرفع مستوى حسابك!</p>

            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl">
                <div>
                  <p className="text-xs font-bold text-white">تسجيل الدخول للغرفة</p>
                  <p className="text-[10px] text-amber-400 font-medium">مكافأة: +100 🪙 ذهب</p>
                </div>
                <button
                  onClick={() => showToast('🎉 تم استلام 100 ذهبة بنجاح!')}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[11px] px-3 py-1 rounded-xl shadow active:scale-95 transition-transform"
                >
                  استلام
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl">
                <div>
                  <p className="text-xs font-bold text-white">التحدث على المايك 3 دقائق</p>
                  <p className="text-[10px] text-amber-400 font-medium">مكافأة: +250 🪙 ذهب + 5 💎 ماس</p>
                </div>
                <button
                  onClick={() => showToast('🎉 تم استلام 250 ذهبة و 5 ماسات!')}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[11px] px-3 py-1 rounded-xl shadow active:scale-95 transition-transform"
                >
                  استلام
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl">
                <div>
                  <p className="text-xs font-bold text-white">إرسال هدية لأحد المستمعين</p>
                  <p className="text-[10px] text-purple-400 font-medium">مكافأة: +500 🪙 ذهب + شارة ملكية</p>
                </div>
                <button
                  onClick={() => {
                    setShowTaskCenter(false);
                    setShowGiftSelector(true);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] px-3 py-1 rounded-xl border border-amber-500/30"
                >
                  ذهاب
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TIMED LUCKY BAG DROP SETUP MODAL (إسقاط حقيبة الهدايا الموقوتة) */}
      {/* ============================================================ */}
      {showLuckyBag && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="w-full max-w-md bg-[#160c22] border-2 border-purple-500/50 rounded-3xl p-5 space-y-4 text-right shadow-[0_0_40px_rgba(168,85,247,0.3)] relative overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-amber-400 rounded-2xl text-white shadow-lg">
                  <Gift className="w-5 h-5 text-white animate-bounce" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">إسقاط حقيبة الهدايا الموقوتة 🎁</h3>
                  <p className="text-[10px] text-purple-300">حدد قيمة الجائزة والمؤقت للعد التنازلي الحماسي</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLuckyBag(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Coin Price Selection (قيمة الحقيبة بالعملات) */}
            <div className="space-y-2">
              <label className="text-xs font-black text-amber-300 flex items-center justify-between">
                <span>1. اختر قيمة الحقيبة الإجمالية بالعملات الصفراء:</span>
                <span className="text-[10px] text-purple-200 font-mono bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-500/30">
                  رصيدك: {currentUser.coins.toLocaleString()} 🪙
                </span>
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 5000, 10000].map((priceVal) => (
                  <button
                    key={priceVal}
                    type="button"
                    onClick={() => setLuckyBagSetupPrice(priceVal)}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${luckyBagSetupPrice === priceVal
                        ? 'bg-gradient-to-b from-amber-500/30 to-purple-900/60 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/20 scale-105 font-black'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                  >
                    <span className="text-lg">🪙</span>
                    <span className="text-xs font-black font-mono mt-0.5">{priceVal.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Time Limit Duration Selection (مؤقت العد التنازلي) */}
            <div className="space-y-2">
              <label className="text-xs font-black text-purple-200 block">
                2. حدد الوقت المسموح للتسجيل والعد التنازلي:
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '20 ثانية', sec: 20, badge: 'اختبار ⚡' },
                  { label: 'دقيقتان', sec: 120, badge: '02:00 ⏱️' },
                  { label: '5 دقائق', sec: 300, badge: '05:00 ⏱️' },
                  { label: '10 دقائق', sec: 600, badge: '10:00 ⏱️' }
                ].map((dur) => (
                  <button
                    key={dur.sec}
                    type="button"
                    onClick={() => setLuckyBagSetupDuration(dur.sec)}
                    className={`p-2 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${luckyBagSetupDuration === dur.sec
                        ? 'bg-gradient-to-b from-purple-600/40 to-indigo-900/60 border-purple-400 text-purple-200 shadow-lg shadow-purple-500/20 scale-105 font-black'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                  >
                    <span className="text-[11px] font-black text-white">{dur.label}</span>
                    <span className="text-[9px] text-amber-300 font-mono mt-0.5">{dur.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Winners Count Selection (عدد الفائزين) */}
            <div className="space-y-2">
              <label className="text-xs font-black text-purple-200 block">
                3. عدد الأشخاص المحظوظين للفوز بالعملات:
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { count: 10, label: '10 أعضاء' },
                  { count: 20, label: '20 عضواً' },
                  { count: 50, label: '50 عضواً' }
                ].map((w) => (
                  <button
                    key={w.count}
                    type="button"
                    onClick={() => setLuckyBagSetupWinners(w.count)}
                    className={`py-2 px-3 rounded-2xl border text-center transition-all cursor-pointer text-xs font-bold ${luckyBagSetupWinners === w.count
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-black'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400'
                      }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Banner */}
            <div className="bg-slate-950/90 p-3 rounded-2xl border border-purple-500/30 flex items-center justify-between text-xs">
              <div className="text-slate-300">
                <span>المبلغ: <strong className="text-amber-300 font-mono">{luckyBagSetupPrice.toLocaleString()} 🪙</strong></span>
                <span className="mx-1.5">•</span>
                <span>المؤقت: <strong className="text-purple-300 font-mono">{formatTimeMMSS(luckyBagSetupDuration)}</strong></span>
              </div>
              <span className="text-[10px] bg-purple-900/60 text-purple-200 px-2 py-0.5 rounded-full border border-purple-500/40 font-bold">
                توزيع عشوائي 🎁
              </span>
            </div>

            {/* Drop Button */}
            <button
              type="button"
              onClick={handleDropTimedLuckyBag}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:brightness-110 active:scale-95 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 cursor-pointer transition-all flex items-center justify-center gap-2 border border-amber-300/50"
            >
              <Gift className="w-5 h-5 text-slate-950 animate-bounce" />
              <span>إسقاط الحقيبة الموقوتة الآن 🎁</span>
            </button>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TIMED BAG WINNERS RESULTS POPUP (إعلان الفائزين بالجوائز) */}
      {/* ============================================================ */}
      {bagWinnersResult && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in duration-300">
          <div className="w-full max-w-sm bg-[#180a24] border-2 border-amber-400/80 rounded-3xl p-5 space-y-4 text-center shadow-[0_0_50px_rgba(245,158,11,0.4)] relative overflow-hidden">

            {/* Top Confetti / Trophy Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-3xl flex items-center justify-center text-3xl shadow-xl shadow-amber-500/30 border border-amber-200/60 animate-bounce">
                🎉
              </div>
            </div>

            <div>
              <h3 className="font-black text-lg text-white">انتهى الوقت وتم فتح الحقيبة! 🎁</h3>
              <p className="text-xs text-amber-300 font-bold mt-1">
                تم توزيع <span className="font-mono">{bagWinnersResult.totalCoins.toLocaleString()} 🪙</span> عشوائياً بـ {bagWinnersResult.dropperName}
              </p>
            </div>

            {/* Highlight Card if Current User Won */}
            {bagWinnersResult.userWonAmount > 0 && (
              <div className="bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-amber-500/30 border-2 border-amber-400 rounded-2xl p-3 shadow-lg animate-pulse">
                <span className="text-xs font-black text-amber-200 block">🏆 مبروك! لقد حالفك الحظ وربحت:</span>
                <span className="text-xl font-black text-amber-300 font-mono block mt-0.5">
                  +{bagWinnersResult.userWonAmount.toLocaleString()} عملة صفراء 🪙
                </span>
                <span className="text-[10px] text-emerald-300 font-bold block mt-1">تم إضافتها إلى محفظتك بنجاح ✓</span>
              </div>
            )}

            {/* Winners List Table */}
            <div className="space-y-1.5 text-right">
              <span className="text-xs font-bold text-slate-300 block">جدول المحظوظين ({bagWinnersResult.winners.length}):</span>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {bagWinnersResult.winners.map((w, idx) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between bg-slate-950/80 p-2 rounded-2xl border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-amber-400 font-mono w-4">#{idx + 1}</span>
                      <img src={w.avatar} alt={w.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-amber-400/50" />
                      <span className="font-bold text-white truncate max-w-[120px]">{w.name}</span>
                    </div>

                    <span className="text-amber-300 font-mono font-black text-xs bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                      +{w.coinsWon.toLocaleString()} 🪙
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setBagWinnersResult(null)}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs cursor-pointer transition-all shadow-md"
            >
              حسناً، استلام الفرحة 🎉
            </button>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VOICE ROOM SETTINGS MODAL (إعدادات الغرفة الصوتية) */}
      {/* ============================================================ */}
      {showRoomSettingsModal && isMod && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="w-full max-w-md bg-[#160c22] border-2 border-purple-500/50 rounded-3xl p-5 space-y-4 text-right shadow-[0_0_40px_rgba(168,85,247,0.3)] relative overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-400 rounded-2xl text-white shadow-lg">
                  <Settings className="w-5 h-5 text-white animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">إعدادات الغرفة الصوتية ⚙️</h3>
                  <p className="text-[10px] text-purple-300">خيارات التحكم المتقدمة بطاقم الغرفة والأمان</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRoomSettingsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Options List */}
            <div className="space-y-2.5">
              {/* 0. تعديل غلاف الغرفة والبيانات الكاملة */}
              <button
                type="button"
                onClick={() => {
                  setShowRoomSettingsModal(false);
                  setShowFullRoomSettings(true);
                }}
                className="w-full p-3.5 bg-gradient-to-r from-purple-950/90 via-slate-950/90 to-amber-950/90 border-2 border-amber-500/60 hover:border-amber-400 rounded-2xl flex items-center justify-between group transition-all active:scale-98 cursor-pointer shadow-lg shadow-purple-950/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-right">
                    <h4 className="font-black text-sm text-amber-200 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                      <span>تغيير غلاف وبيانات الغرفة 🖼️</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-bold">
                        صورة الغلاف والاسم ✨
                      </span>
                    </h4>
                    <p className="text-[10px] text-amber-200/80">تغيير صورة غلاف الغرفة لتظهر بالصفحة الرئيسية وتعديل الإعلان</p>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-amber-400 group-hover:text-amber-300 group-hover:-translate-x-1 transition-all" />
              </button>

              {/* 1. خلفيات الغرفة الصوتية الملكية */}
              <button
                type="button"
                onClick={() => {
                  setShowRoomSettingsModal(false);
                  setShowBackgroundsModal(true);
                }}
                className="w-full p-3.5 bg-gradient-to-r from-amber-950/80 via-slate-950/90 to-purple-950/80 border-2 border-amber-500/60 hover:border-amber-400 rounded-2xl flex items-center justify-between group transition-all active:scale-98 cursor-pointer shadow-lg shadow-amber-950/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                    <Palette className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-right">
                    <h4 className="font-black text-sm text-amber-200 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                      <span>خلفيات الغرفة الصوتية الملكية 🎨</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-bold">
                        10 خلفيات 👑
                      </span>
                    </h4>
                    <p className="text-[10px] text-amber-200/80">اختر من بين 10 خلفيات أسطورية مع حفظ فوري لجميع الحضور</p>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-amber-400 group-hover:text-amber-300 group-hover:-translate-x-1 transition-all" />
              </button>

              {/* 1. خيمة المشرفين / إدارة المشرفين */}
              <button
                type="button"
                onClick={() => {
                  setShowRoomSettingsModal(false);
                  setShowModeratorsListModal(true);
                }}
                className="w-full p-3.5 bg-gradient-to-r from-purple-900/80 via-indigo-950/90 to-purple-900/80 border-2 border-purple-500/60 hover:border-amber-400 rounded-2xl flex items-center justify-between group transition-all active:scale-98 cursor-pointer shadow-lg shadow-purple-950/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-900/80 border border-purple-400/50 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                    <Shield className="w-5 h-5 text-amber-300" />
                  </div>
                  <div className="text-right">
                    <h4 className="font-black text-sm text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                      <span>إدارة المشرفين (إدارة المشرفين)</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-bold">
                        {safeMods.length} مشرف
                      </span>
                    </h4>
                    <p className="text-[10px] text-purple-200/90">عرض طاقم المشرفين وسحب رتب الإشراف بنقرة واحدة</p>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-purple-400 group-hover:text-amber-300 group-hover:-translate-x-1 transition-all" />
              </button>

              {/* 2. قفل / فتح صعود المقاعد */}
              <button
                type="button"
                onClick={() => {
                  setIsMicModeLocked(!isMicModeLocked);
                  showToast(
                    !isMicModeLocked
                      ? '🔒 تم قفل المقاعد وتحويلها لطلب الإذن'
                      : '🔓 تم فتح المقاعد للجميع فوراً'
                  );
                }}
                className="w-full p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between group transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${isMicModeLocked ? 'bg-amber-950/60 border-amber-500 text-amber-300' : 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    }`}>
                    {isMicModeLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-xs text-white">نظام صعود المقاعد والمايكات</h4>
                    <p className="text-[10px] text-slate-400">
                      {isMicModeLocked ? 'الحالة الحالية: بالطلب والموافقة (مغلق)' : 'الحالة الحالية: صعود مباشر (مفتوح)'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-400">{isMicModeLocked ? 'تغيير للمفتوح' : 'تغيير للطلب'}</span>
              </button>

              {/* 3. تخصيص هيكلية المقاعد (شبكة المايكات) */}
              <button
                type="button"
                onClick={() => {
                  setShowRoomSettingsModal(false);
                  setShowSeatSettingsModal(true);
                }}
                className="w-full p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between group transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-xs text-white">تنسيق وهيكلية المقاعد</h4>
                    <p className="text-[10px] text-slate-400">تغيير العدد (10, 15, 20, 30) ونظام مايك البوس</p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>

              {/* 4. كتم صوت الجميع */}
              <button
                type="button"
                onClick={() => {
                  setIsRoomAudioMuted(!isRoomAudioMuted);
                  showToast(isRoomAudioMuted ? 'تم تشغيل صوت الغرفة 🔊' : 'تم كتم الصوت العام للغرفة 🔇');
                }}
                className="w-full p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between group transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
                    <VolumeX className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-xs text-white">الصوت العام للغرفة</h4>
                    <p className="text-[10px] text-slate-400">{isRoomAudioMuted ? 'الصوت مكتوم حالياً' : 'الصوت يعمل بشكل طبيعي'}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-400">{isRoomAudioMuted ? 'تشغيل' : 'كتم'}</span>
              </button>

              {/* 5. مسح الشات والرسائل */}
              {isHost && (
                <button
                  type="button"
                  onClick={async () => {
                    setShowRoomSettingsModal(false);
                    const success = await clearRoomMessagesInRealtimeDb(currentRoom.id);
                    if (success) {
                      const updated = { ...currentRoom, messages: [] };
                      setCurrentRoom(updated);
                      saveRoomToRealtimeDb(updated);
                      showToast('🧹 تم مسح جميع رسائل الدردشة بالغرفة بنجاح وتصفير الشات للجميع!');
                    }
                  }}
                  className="w-full p-3 bg-red-950/30 border border-red-500/30 hover:border-red-500/60 rounded-2xl flex items-center justify-between group transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-900/40 border border-red-500/50 flex items-center justify-center text-red-300">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-xs text-red-200">مسح رسائل الغرفة</h4>
                      <p className="text-[10px] text-red-300/70">تصفير الشات فوراً لجميع الحاضرين</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-red-400">تنظيف</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODERATORS MANAGEMENT PANEL (خيمة المشرفين / لوحة إدارة المشرفين) */}
      {/* ============================================================ */}
      {showModeratorsListModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="w-full max-w-md bg-[#160c22] border-2 border-amber-500/60 rounded-3xl p-5 space-y-4 text-right shadow-[0_0_50px_rgba(245,158,11,0.3)] relative overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 rounded-2xl text-white shadow-lg">
                  <Shield className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">خيمة المشرفين وطاقم العمل 🛡️</h3>
                  <p className="text-[10px] text-amber-200">قائمة الأعضاء الحاليين الذين يمتلكون رتبة مشرف بالغرفة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModeratorsListModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Moderators List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {safeMods.length === 0 ? (
                <div className="text-center py-8 space-y-2 bg-slate-950/60 rounded-2xl border border-slate-800 p-4">
                  <ShieldOff className="w-10 h-10 text-slate-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-300">لا يوجد مشرفين حالياً في هذه الغرفة</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    يمكنك تعيين أي عضو كمشرف من خلال الضغط على صورته الرمزية في الغرفة واختيار [تعيين مشرف 🛡️].
                  </p>
                </div>
              ) : (
                safeMods.map((modId) => {
                  const seatUser = currentRoom.seats.find((s) => s.speakerUser?.id === modId)?.speakerUser;
                  const modUser = KNOWN_ROOM_USERS[modId] || (seatUser ? {
                    name: seatUser.name,
                    avatar: seatUser.avatar,
                    level: seatUser.level || 40,
                    tag: 'مشرف معتمد 🛡️'
                  } : {
                    name: modId === currentUser.id ? `${currentUser.name} (أنت)` : `مشرف الغرفة #${modId.slice(-4)}`,
                    avatar: modId === currentUser.id ? currentUser.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                    level: 40,
                    tag: 'مشرف معتمد 🛡️'
                  });

                  return (
                    <div
                      key={modId}
                      className="flex items-center justify-between bg-slate-950/90 border border-purple-500/30 p-2.5 rounded-2xl hover:border-amber-400/50 transition-all group"
                    >
                      {/* Right Info: Avatar & Name & Badges */}
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={modUser.avatar}
                            alt={modUser.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400/80 shadow-md"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full text-[9px]">
                            🛡️
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-xs text-white group-hover:text-amber-300 transition-colors">
                              {modUser.name}
                            </span>
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 font-mono font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                              Lvl {modUser.level}
                            </span>
                          </div>
                          <div className="text-[9px] text-purple-300 font-medium mt-0.5">
                            {modUser.tag} • ID: {modId.slice(-6)}
                          </div>
                        </div>
                      </div>

                      {/* Left Action: Red "إزالة من الإشراف" Button */}
                      {isHost && (
                        <button
                          type="button"
                          onClick={() => {
                            handleToggleModeratorRole(modId, modUser.name);
                          }}
                          className="py-1.5 px-3 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 hover:border-red-400 rounded-xl font-black text-xs active:scale-95 transition-all shadow cursor-pointer flex items-center gap-1 shrink-0"
                          title="سحب رتبة الإشراف وإلغاء الصلاحيات فوراً"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>إزالة من الإشراف</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Info Notice */}
            <div className="bg-purple-950/60 p-2.5 rounded-2xl border border-purple-500/30 text-[10px] text-purple-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              <span>عند الضغط على [إزالة من الإشراف]، يتم سحب الصلاحيات الإدارية فوراً من العضو ويصبح مستمعاً عادياً.</span>
            </div>

          </div>
        </div>
      )}

      {/* Share Modal (مشاركة) */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#121020] border border-purple-500/40 rounded-3xl p-4 space-y-3 text-right shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-300" />
                <h3 className="font-black text-sm text-amber-200">مشاركة الغرفة والدعوة</h3>
              </div>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-300">ادعُ أصدقاءك للانضمام فوراً لهذه الغرفة الصوتية المميزة!</p>

            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                onClick={() => {
                  setShowShareModal(false);
                  showToast('تم فتح واتساب لمشاركة الرابط 📱');
                }}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-emerald-900/40 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-900/60 cursor-pointer"
              >
                <span className="text-xl">💬</span>
                <span className="text-[10px] font-bold">واتساب</span>
              </button>

              <button
                onClick={() => {
                  setShowShareModal(false);
                  showToast('تم فتح تليجرام لمشاركة الرابط ✈️');
                }}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-sky-900/40 border border-sky-500/40 text-sky-200 hover:bg-sky-900/60 cursor-pointer"
              >
                <span className="text-xl">✈️</span>
                <span className="text-[10px] font-bold">تليجرام</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  setShowShareModal(false);
                  showToast('📋 تم نسخ رابط الغرفة بنجاح!');
                }}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                <Copy className="w-5 h-5 text-amber-300" />
                <span className="text-[10px] font-bold">نسخ الرابط</span>
              </button>

              <button
                onClick={() => {
                  setShowShareModal(false);
                  showToast('📣 تم إرسال دعوة للأصدقاء المتابعين بنجاح!');
                }}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-purple-900/40 border border-purple-500/40 text-purple-200 hover:bg-purple-900/60 cursor-pointer"
              >
                <Users className="w-5 h-5 text-pink-300" />
                <span className="text-[10px] font-bold">دعوة أصدقاء</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Local Audio File Input */}
      <input
        ref={musicFileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleCustomAudioFileUpload}
        className="hidden"
      />

      {/* Music Player Modal (موسيقى - قائمة سحابية مثبتة Cloud-Persistent Playlist) */}
      {showMusicModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="w-full max-w-md bg-[#120f23] border border-purple-500/50 rounded-3xl p-4 space-y-3.5 text-right shadow-2xl relative overflow-hidden text-white">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-purple-600/30 border border-purple-400 flex items-center justify-center text-purple-300 shadow-inner">
                  <Music className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-sm text-purple-200">مستعرض الموسيقى والسحاب 🎵</h3>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                      <Cloud className="w-2.5 h-2.5" /> مثبت بالسحاب
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">قائمة أغاني محفوظة بحسابك بشكل دائم عبر Firebase</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMusicModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setMusicTab('cloud')}
                className={`flex-1 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${musicTab === 'cloud'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>السحاب ({cloudPlaylist.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setMusicTab('youtube')}
                className={`flex-1 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${musicTab === 'youtube'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                    : 'text-rose-400/80 hover:text-rose-300'
                  }`}
              >
                <Youtube className="w-3.5 h-3.5 text-red-400" />
                <span>يوتيوب 🎬</span>
              </button>
              <button
                type="button"
                onClick={() => setMusicTab('featured')}
                className={`flex-1 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${musicTab === 'featured'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>المقترحة</span>
              </button>
            </div>

            {/* Tab Content 1: My Cloud Playlist */}
            {musicTab === 'cloud' && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {cloudPlaylist.length === 0 ? (
                  <div className="text-center py-6 px-4 bg-slate-950/60 rounded-2xl border border-dashed border-purple-500/30 space-y-2">
                    <Cloud className="w-8 h-8 text-purple-400 mx-auto opacity-60" />
                    <p className="text-xs font-bold text-slate-300">قائمتك السحابية فارغة حالياً!</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      الصق رابط فيديو من <span className="text-rose-400 font-bold">YouTube</span>، أو اضغط زر <span className="text-amber-300 font-bold">(+)</span> بالمقترحة، أو ارفع ملفات صوتية من هاتفك لتثبيتها بحسابك تلقائياً وبشكل دائم.
                    </p>
                  </div>
                ) : (
                  cloudPlaylist.map((track) => {
                    const isCurrentlyPlayingThis = isMusicPlaying && activeTrack?.id === track.id;
                    return (
                      <div
                        key={track.id}
                        className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${isCurrentlyPlayingThis
                            ? 'bg-purple-900/50 border-purple-400 shadow-lg shadow-purple-950/50'
                            : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/40'
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (isCurrentlyPlayingThis) {
                                handleToggleMusicPlayback();
                              } else {
                                handlePlayMusicTrack(track);
                              }
                            }}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden transition-transform active:scale-90 relative ${isCurrentlyPlayingThis
                                ? 'bg-purple-500 text-white shadow-md'
                                : 'bg-slate-800 text-purple-300 hover:bg-purple-600 hover:text-white'
                              }`}
                          >
                            {track.thumbnail ? (
                              <>
                                <img src={track.thumbnail} alt={track.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  {isCurrentlyPlayingThis ? <Pause className="w-3.5 h-3.5 text-amber-300 fill-current" /> : <Play className="w-3.5 h-3.5 text-white fill-current ml-0.5" />}
                                </div>
                              </>
                            ) : (
                              isCurrentlyPlayingThis ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </button>
                          <div className="min-w-0 text-right">
                            <div className="flex items-center gap-1.5">
                              {track.isYouTube ? (
                                <span className="text-[10px] bg-red-600/90 text-white px-1.5 py-0.2 rounded font-black">YouTube</span>
                              ) : (
                                <span className="text-sm">{track.icon || '🎵'}</span>
                              )}
                              <span className="text-xs font-bold text-white truncate max-w-[140px]">{track.name}</span>
                            </div>
                            <span className="text-[9px] text-purple-300/80 font-mono">
                              {track.dur || 'سحابي'} • {track.isYouTube ? 'فيديو يوتيوب 🎬' : 'سحابي ☁️'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {track.isYouTube && (
                            <>
                              <button
                                type="button"
                                title="تشغيل فيديو على شاشة الغرفة 🎬"
                                onClick={() => {
                                  handlePlayMusicTrack(track, 'video');
                                  setIsYoutubePipMinimized(false);
                                }}
                                className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/30 transition-colors flex items-center gap-1 text-[10px] font-bold"
                              >
                                <Youtube className="w-3.5 h-3.5 text-red-400" />
                                <span>فيديو</span>
                              </button>
                              <button
                                type="button"
                                title="تشغيل صوت فقط بالخلفية 🎧"
                                onClick={() => {
                                  handlePlayMusicTrack(track, 'audio_only');
                                }}
                                className="p-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-900/70 text-purple-300 border border-purple-500/30 transition-colors flex items-center gap-1 text-[10px] font-bold"
                              >
                                <Headphones className="w-3.5 h-3.5" />
                                <span>صوت</span>
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            title="حذف الأغنية من السحاب"
                            onClick={() => handleRemoveTrackFromCloud(track.id, track.name)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/80 text-rose-300 hover:text-white border border-rose-500/30 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab Content 2: YouTube Video Link Input & Suggestions */}
            {musicTab === 'youtube' && (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {/* YouTube URL Paste Box */}
                <div className="bg-slate-950/90 border border-rose-500/40 rounded-2xl p-3 space-y-2.5 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-rose-300">
                      <Youtube className="w-4 h-4 text-red-500" />
                      <span>إضافة رابط من اليوتيوب (YouTube URL)</span>
                    </div>
                    <span className="text-[9px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-bold">
                      حفظ دائم بالسحاب ☁️
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="relative">
                      <input
                        type="url"
                        value={youtubeUrlInput}
                        onChange={(e) => setYoutubeUrlInput(e.target.value)}
                        placeholder="https://youtu.be/... أو https://youtube.com/watch?v=..."
                        className="w-full bg-slate-900 border border-rose-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 dir-ltr"
                      />
                      {youtubeUrlInput && (
                        <button
                          type="button"
                          onClick={() => setYoutubeUrlInput('')}
                          className="absolute right-2 top-2 text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={youtubeTitleInput}
                      onChange={(e) => setYoutubeTitleInput(e.target.value)}
                      placeholder="اسم الأغنية / المقطع (اختياري)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  {/* Dual Playback Choice Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleAddYouTubeTrackToCloud('video')}
                      disabled={!youtubeUrlInput.trim()}
                      className={`py-2 px-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer ${youtubeUrlInput.trim()
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-rose-900/50 hover:brightness-110'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                      <Youtube className="w-4 h-4" />
                      <span>🎬 عرض شاشة وفيديو</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddYouTubeTrackToCloud('audio_only')}
                      disabled={!youtubeUrlInput.trim()}
                      className={`py-2 px-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer ${youtubeUrlInput.trim()
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-900/50 hover:brightness-110'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                      <Headphones className="w-4 h-4" />
                      <span>🎧 تشغيل صوت فقط</span>
                    </button>
                  </div>
                </div>

                {/* Helpful Tip */}
                <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-2.5 flex items-start gap-2 text-[10px] text-purple-200">
                  <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-amber-300">خيارات تشغيل اليوتيوب:</strong> يمكنك اختيار <strong className="text-rose-300">عرض الفيديو</strong> للجميع على شاشة سينمائية أو نافذة عائمة، أو <strong className="text-purple-300">صوت فقط</strong> ليعمل كخلفية موسيقية نقية في الغرفة دون حجز مساحة من الشاشة!
                  </p>
                </div>

                {/* Curated YouTube Tracks */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-black text-slate-300 flex items-center gap-1">
                    <span>🌟 مقاطع يوتيوب مقترحة بنقرة واحدة:</span>
                  </p>
                  <div className="space-y-1.5">
                    {FEATURED_YOUTUBE_TRACKS.map((track) => {
                      const isSaved = cloudPlaylist.some(t => t.youtubeId === track.youtubeId || t.name === track.name);
                      return (
                        <div
                          key={track.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-red-500/40 transition-all"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-10 h-7 rounded-lg overflow-hidden shrink-0 relative bg-slate-800">
                              <img src={track.thumbnail} alt={track.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 text-right">
                              <p className="text-xs font-bold text-white truncate">{track.name}</p>
                              <span className="text-[9px] text-red-300 font-mono">يوتيوب • {track.dur}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                handlePlayMusicTrack(track, 'video');
                                setIsYoutubePipMinimized(false);
                              }}
                              className="text-[10px] font-bold text-amber-200 bg-amber-900/40 hover:bg-amber-600/80 border border-amber-500/40 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                              title="تشغيل كفيديو وشاشة سينما"
                            >
                              <Youtube className="w-3 h-3 text-red-400" />
                              <span>فيديو</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handlePlayMusicTrack(track, 'audio_only')}
                              className="text-[10px] font-bold text-purple-200 bg-purple-900/50 hover:bg-purple-700/80 border border-purple-500/40 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                              title="تشغيل صوت فقط بالخلفية"
                            >
                              <Headphones className="w-3 h-3 text-purple-300" />
                              <span>صوت</span>
                            </button>

                            {isSaved ? (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/40 p-1 rounded-lg flex items-center" title="محفوظ بالسحاب">
                                <Check className="w-3 h-3" />
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddTrackToCloud(track)}
                                className="text-[10px] font-bold text-rose-200 bg-rose-900/60 hover:bg-rose-600 border border-rose-500/40 p-1 rounded-lg flex items-center transition-colors cursor-pointer"
                                title="حفظ بالسحاب"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content 3: Featured System Songs */}
            {musicTab === 'featured' && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {FEATURED_MUSIC_TRACKS.map((track) => {
                  const isSavedInCloud = cloudPlaylist.some(t => t.id === track.id || t.name === track.name);
                  const isCurrentlyPlayingThis = isMusicPlaying && activeTrack?.id === track.id;

                  return (
                    <div
                      key={track.id}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${isCurrentlyPlayingThis
                          ? 'bg-purple-900/50 border-purple-400'
                          : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/40'
                        }`}
                    >
                      <div
                        onClick={() => handlePlayMusicTrack(track)}
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isCurrentlyPlayingThis ? 'bg-purple-500 text-white' : 'bg-slate-800 text-purple-300'
                          }`}>
                          {isCurrentlyPlayingThis ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </div>
                        <div className="min-w-0 text-right">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{track.icon}</span>
                            <span className="text-xs font-bold text-white truncate">{track.name}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono">{track.dur}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {isSavedInCloud ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/40 px-2 py-1 rounded-xl">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>محفوظة</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            title="إضافة وتثبيت الأغنية بالسحاب"
                            onClick={() => handleAddTrackToCloud(track)}
                            className="flex items-center gap-1 text-[10px] font-bold text-purple-200 bg-purple-900/60 hover:bg-purple-600 border border-purple-500/50 px-2.5 py-1 rounded-xl transition-all active:scale-95 shadow-md hover:shadow-purple-500/30 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>سحاب</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Local Phone File Uploader Button */}
            <div
              onClick={() => musicFileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/50 hover:border-purple-400 p-2.5 rounded-2xl cursor-pointer text-purple-200 hover:text-white font-bold text-xs transition-all active:scale-95 shadow-lg"
            >
              <FolderPlus className="w-4 h-4 text-purple-300" />
              <span>📂 اختيار ملف صوتي من الهاتف (+ تثبيت بالسحاب)</span>
            </div>

            {/* Active Playback & Seeking Control Panel */}
            {activeTrack && (
              <div className="bg-slate-950/95 border border-amber-500/50 rounded-2xl p-3 space-y-2.5 mt-1 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-400 flex items-center justify-center shrink-0">
                      <Music className="w-4 h-4 text-amber-300 animate-spin" />
                    </div>
                    <div className="min-w-0 text-right">
                      <p className="text-xs text-amber-200 font-black truncate">🎵 {activeTrack.name}</p>
                      <p className="text-[9px] text-purple-300/80">خلفية صوتية مباشرة للحاضرين</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsMusicLooping(!isMusicLooping)}
                      className={`p-1.5 rounded-xl border text-[10px] font-bold transition-all ${isMusicLooping
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      title={isMusicLooping ? 'التكرار مفعّل' : 'التكرار معطّل'}
                    >
                      <Repeat className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      {musicVolume}%
                    </span>
                  </div>
                </div>

                {/* Interactive Seeking Progress Bar */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min="0"
                    max={musicDuration || 100}
                    value={musicCurrentTime}
                    onChange={(e) => handleMusicSeek(Number(e.target.value))}
                    className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] font-mono text-amber-300/90 dir-ltr">
                    <span>{formatAudioTime(musicCurrentTime)}</span>
                    <span>{formatAudioTime(musicDuration)}</span>
                  </div>
                </div>

                {/* Control Buttons Row: Prev, -10s, Play/Pause, +10s, Next */}
                <div className="flex items-center justify-center gap-3 pt-1 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={handlePlayPrevTrack}
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 transition-transform active:scale-90 cursor-pointer"
                    title="الأغنية السابقة"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeekBackward(10)}
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-bold transition-transform active:scale-90 cursor-pointer flex items-center gap-0.5"
                    title="ترجيع 10 ثوانٍ"
                  >
                    <span>10-</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleMusicPlayback}
                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30 font-bold active:scale-90 transition-transform cursor-pointer"
                  >
                    {isMusicPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeekForward(10)}
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-bold transition-transform active:scale-90 cursor-pointer flex items-center gap-0.5"
                    title="تقديم 10 ثوانٍ"
                  >
                    <span>10+</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePlayNextTrack}
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 transition-transform active:scale-90 cursor-pointer"
                    title="الأغنية التالية"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                  <Volume2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={musicVolume}
                    onChange={(e) => handleMusicVolumeChange(Number(e.target.value))}
                    className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 14. CINEMA YOUTUBE & MOVIE SELECTOR MODAL (نافذة اختيار أفلام ومقاطع سينما الغرفة) */}
      {showCinemaModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-[#180d28] to-slate-950 border-2 border-amber-400/80 rounded-3xl p-5 space-y-4 text-right shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm text-amber-200">سينما الغرفة واليوتيوب 🎬🍿</h3>
              </div>
              <button
                onClick={() => setShowCinemaModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* URL Input Box */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-300">
                ضع رابط أي فيديو يوتيوب أو فيلم (YouTube URL):
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-amber-500/40 rounded-2xl p-1.5 focus-within:border-amber-400">
                <input
                  type="text"
                  value={cinemaInputUrl}
                  onChange={(e) => setCinemaInputUrl(e.target.value)}
                  placeholder="https://youtu.be/... أو رابط يوتيوب"
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none px-2 text-right"
                />
                <button
                  type="button"
                  onClick={() => {
                    const vid = extractYoutubeVideoId(cinemaInputUrl);
                    if (vid) {
                      const title = 'فيديو سينما مختار 🎬';
                      setCinemaVideoId(vid);
                      setCinemaVideoTitle(title);
                      setIsCinemaMode(true);
                      setShowCinemaModal(false);
                      setCinemaInputUrl('');
                      if (currentRoom?.id) {
                        broadcastRoomCinema(currentRoom.id, {
                          active: true,
                          videoId: vid,
                          title,
                          startedAt: Date.now(),
                          startedBy: user.name,
                        });
                      }
                      showToast('🎬 تم تشغيل الفيديو في سينما الغرفة للجميع!');
                    } else {
                      showToast('⚠️ يرجى إدخال رابط يوتيوب صالح');
                    }
                  }}
                  className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-transform active:scale-95 cursor-pointer flex items-center gap-1 shadow"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>تشغيل</span>
                </button>
              </div>
            </div>

            {/* Quick Trending Suggestions */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-amber-300">
                أو اختر من المقاطع والأفلام المقترحة:
              </label>

              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar pr-0.5">
                {[
                  { id: 'jfKfPfyJRdk', title: 'موسيقى ريلاكس وسينما هادئة 🎶', icon: '🎧' },
                  { id: 'kJQP7kiw5Fk', title: 'كليب حماسي ومشاهد سينمائية 🔥', icon: '🎬' },
                  { id: '5qap5aO4i9A', title: 'موسيقى طرب وأجواء سهرة 🎵', icon: '✨' },
                  { id: 'DWcJFNfaw9A', title: 'سورة الكهف - تلاوة خاشعة 📖', icon: '🕌' },
                  { id: '9bZkp7q19f0', title: 'أغاني وناسة وفرفشة 🥳', icon: '🍿' },
                  { id: 'L_LUpnjgPso', title: 'أجمل أهداف ولقطات كروية ⚽', icon: '🏆' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCinemaVideoId(item.id);
                      setCinemaVideoTitle(item.title);
                      setIsCinemaMode(true);
                      setShowCinemaModal(false);
                      if (currentRoom?.id) {
                        broadcastRoomCinema(currentRoom.id, {
                          active: true,
                          videoId: item.id,
                          title: item.title,
                          startedAt: Date.now(),
                          startedBy: user.name,
                        });
                      }
                      showToast(`🎬 تم تشغيل: ${item.title}`);
                    }}
                    className="flex items-center gap-2 p-2.5 bg-slate-900/90 hover:bg-purple-950/80 border border-slate-800 hover:border-amber-400/60 rounded-2xl text-right transition-all cursor-pointer group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                    <span className="text-[10.5px] font-bold text-slate-200 group-hover:text-amber-200 line-clamp-2 leading-tight">
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsCinemaMode(true);
                  setShowCinemaModal(false);
                  if (currentRoom?.id) {
                    broadcastRoomCinema(currentRoom.id, {
                      active: true,
                      videoId: cinemaVideoId,
                      title: cinemaVideoTitle,
                      startedAt: Date.now(),
                      startedBy: user.name,
                    });
                  }
                  showToast('🍿 تم تفعيل وضع السينما و10 مقاعد');
                }}
                className="py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow active:scale-95 cursor-pointer"
              >
                تفعيل السينما 🍿
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsCinemaMode(false);
                  setShowCinemaModal(false);
                  if (currentRoom?.id) {
                    stopRoomCinema(currentRoom.id);
                  }
                  showToast('تم إيقاف وضع السينما والعودة للوضع الطبيعي');
                }}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                إيقاف السينما ⏹️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PK Battle Setup Modal */}
      {showPKSetupModal && (
        <PKSetupModal
          room={currentRoom}
          currentUser={currentUser}
          onStartPK={(newPk) => {
            if (currentRoom.id) {
              broadcastPKBattle(currentRoom.id, newPk);
            }
            setPkBattleState(newPk);
            setIsPKActive(true);
          }}
          onClose={() => setShowPKSetupModal(false)}
          showToast={showToast}
        />
      )}

      {/* Party Schedule and Rewards Modal */}
      {showPartyScheduleModal && (
        <PartyScheduleModal
          room={currentRoom}
          currentUser={currentUser}
          isHost={isHost}
          activeParty={activePartyEvent}
          onSaveParty={(party) => {
            setActivePartyEvent(party);
            const updatedRoom = {
              ...currentRoom,
              partyEvent: party,
              category: 'غرف الحفلات' as any,
            };
            setCurrentRoom(updatedRoom);
            saveRoomToRealtimeDb(updatedRoom);
          }}
          onClose={() => setShowPartyScheduleModal(false)}
          showToast={showToast}
        />
      )}

      {/* Room Top Supporters Modal Overlay */}
      {showRoomTopSupportersModal && (
        <RoomTopSupportersModal
          room={currentRoom}
          currentUser={currentUser}
          supporters={roomSupporters}
          onClose={() => setShowRoomTopSupportersModal(false)}
          onOpenUserProfile={(usr) => {
            setSelectedUserProfileCard({
              user: {
                id: usr.id,
                name: usr.name,
                avatar: usr.avatar,
              },
              seatId: null,
            });
            setShowRoomTopSupportersModal(false);
          }}
          showToast={showToast}
        />
      )}

      {/* Room Ranking Cup Modal Overlay */}
      {showRoomRankingCupModal && (
        <RoomRankingCupModal
          currentRoom={currentRoom}
          onClose={() => setShowRoomRankingCupModal(false)}
          showToast={showToast}
        />
      )}


      {/* 🎁 Communal Lucky Room Chest Modal */}
      {showLuckyRoomChestModal && (
        <LuckyRoomChestModal
          user={currentUser}
          room={currentRoom}
          onClose={() => setShowLuckyRoomChestModal(false)}
          onDropChest={(amount, msg) => {
            const newMsg = {
              id: Date.now().toString(),
              senderName: 'صندوق الكنز 🎁',
              senderAvatar: '',
              senderVip: 10,
              text: `👑 قام ${currentUser.name} بإسقاط صندوق كنز بقيمة ${amount} كوينز في الغرفة! "${msg}"`,
              timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
              isSystemNotice: true,
            };
            const updated = {
              ...currentRoom,
              messages: [...currentRoom.messages, newMsg],
            };
            setCurrentRoom(updated);
            saveRoomToRealtimeDb(updated);
            const newBalance = Math.max(0, currentUser.coins - amount);
            setCurrentUser((prev) => ({ ...prev, coins: newBalance }));
            if (onUpdateUser) onUpdateUser({ coins: newBalance });
          }}
          onClaimCoins={(coins) => {
            const newBalance = currentUser.coins + coins;
            setCurrentUser((prev) => ({ ...prev, coins: newBalance }));
            if (onUpdateUser) onUpdateUser({ coins: newBalance });
            showToast(`🎉 مبروك! حصلت على ${coins} عملة من صندوق الكنز!`);
          }}
        />
      )}

      {/* 🎙️ Voice Effects & Soundboard Modal */}
      {showVoiceFxModal && (
        <VoiceFxModal
          currentEffect={currentVoiceEffect}
          onSelectEffect={(effectId) => {
            setCurrentVoiceEffect(effectId);
            showToast(`🎙️ تم تفعيل مؤثر الصوت: ${effectId}`);
          }}
          onClose={() => setShowVoiceFxModal(false)}
        />
      )}

      {/* Consolidated Room Live HTML5 Audio Player (Web & Android WebView Optimized) */}
      <audio
        id="room-live-audio-player"
        ref={audioRef}
        loop={isMusicLooping}
        playsInline
        preload="auto"
        autoPlay
        crossOrigin="anonymous"
        onTimeUpdate={() => {
          if (audioRef.current) {
            setMusicCurrentTime(audioRef.current.currentTime);
            setMusicDuration(audioRef.current.duration || 0);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setMusicDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={() => {
          if (!isMusicLooping) {
            handlePlayNextTrack();
          }
        }}
        onError={(e) => {
          console.warn('⚠️ [VoiceRoomModal] Audio playback error:', e);
        }}
      />

      {/* 👑 ROOM INFO & DETAILS MODAL (لوحة تفاصيل ومعلومات الغرفة) */}
      {showRoomInfoModal && (
        <RoomInfoModal
          room={currentRoom}
          user={currentUser}
          onClose={() => setShowRoomInfoModal(false)}
          onUpdateAnnouncement={(newAnnouncement) => {
            handleUpdateRoomData({ announcement: newAnnouncement });
            if (onUpdateRoomAnnouncement) {
              onUpdateRoomAnnouncement(newAnnouncement);
            }
          }}
          onUpdateRoom={(updatedFields) => {
            handleUpdateRoomData(updatedFields);
          }}
        />
      )}

      {/* ⚙️ FULL ADVANCED ROOM SETTINGS MODAL (تغيير الغلاف، الاسم، الثيمات، المشرفين، البلاك ليست) */}
      {showFullRoomSettings && isMod && (
        <RoomSettingsModal
          room={currentRoom}
          user={currentUser}
          onClose={() => setShowFullRoomSettings(false)}
          onUpdateRoom={(updatedFields) => {
            handleUpdateRoomData(updatedFields);
          }}
        />
      )}

      {/* 🚀 LUXURY ROOM ENTRANCE ANIMATION OVERLAY (Jets, Supercars, Dragons, Helicopters) */}
      <LuxuryEntranceOverlay
        entrance={activeEntranceAnimation}
        onComplete={() => setActiveEntranceAnimation(null)}
      />
    </div>
  );
};
