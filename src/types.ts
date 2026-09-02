export interface CloudTrack {
  id: string;
  name: string;
  dur: string;
  icon?: string;
  url?: string;
  addedAt?: number;
  isCloud?: boolean;
  youtubeId?: string;
  thumbnail?: string;
  isYouTube?: boolean;
  youtubeMode?: 'video' | 'audio_only';
}

export interface RoomMusicState {
  track: CloudTrack | null;
  isPlaying: boolean;
  playedBy: string;
  playedByName: string;
  startedAt: number;
  currentTime?: number;
  volume?: number;
  isLooping?: boolean;
  youtubeMode?: 'video' | 'audio_only';
}

export type VipRank = 'None' | 'Silver' | 'Gold' | 'Diamond' | 'Crown VIP';

export interface UserProfile {
  id: string; // user_id
  name: string; // username
  avatar: string;
  equippedFrame?: string; // ID of active avatar frame overlay e.g. 'golden_imperial', 'wings_flame'
  equippedEntrance?: string; // ID of active entrance effect e.g. 'wish_pool_entrance', 'ent_lambo'
  equippedBadge?: string; // ID of active badge e.g. 'badge_vip_crown', 'badge_star'
  equippedBubble?: string; // ID of active chat bubble e.g. 'bubble_gold', 'bubble_neon'
  vipRank: VipRank;
  vipLevel: number;
  levelStatus: string; // level_status e.g. "ليفل 1", "ليفل 2"
  wealthLevel?: number; // مستوى الثراء e.g. 30
  wealthXp?: number; // نقاط خبرة الثراء
  coins: number;
  diamonds: number;
  targetDiamonds?: number; // Real-time monthly target diamonds accumulated for host/agency
  targetRewardDiamonds?: number; // Earned target diamonds available to unlock/convert
  monthlyDiamonds?: number; // Total diamonds earned in current month
  totalReceivedDiamonds?: number; // Lifetime diamonds received from gifts
  isAllowedToCreateRoom: boolean;
  hasActiveRoom: boolean;
  createdRoomId?: string;
  roomName?: string; // user's owned room name
  roomCoverImage?: string; // user's owned room cover photo
  bio?: string;
  followersCount: number;
  followingCount: number;
  provider?: string;
  email?: string;
  isLoggedIn?: boolean;
  isOnline?: boolean;
  lastLogin?: string;
  country?: string;
  gender?: string;
  role?: string;
  agencyId?: string;
  agencyRole?: 'owner' | 'assistant' | 'member';
  agencyMembershipStatus?: 'none' | 'pending' | 'active' | 'removed';
  agencyName?: string;
  agencyCode?: string;
  isAgencyOwner?: boolean;
  isAgencyHost?: boolean;
  isLive?: boolean;
  liveRoomId?: string;
  liveViewerCount?: number;
  cpPartnerId?: string;
  cpPartnerName?: string;
  cpPartnerAvatar?: string;
  cpLevel?: number;
  cpPoints?: number;
  cpRingId?: string;
  agencyStats?: AgencyActivityStats;
}

/** Values are maintained from gift and voice-room activity, never from the agency UI. */
export interface AgencyActivityStats {
  monthKey: string;
  touches: number;
  liveMinutes: number;
  validDays: number;
  targetRoomId?: string;
  activeDayKeys?: Record<string, number | boolean>;
  liveSessionStartedAt?: number;
  lastLiveEndedAt?: number;
  claimedTargets?: Record<string, number>;
  lastClaimedAt?: number;
}

export interface MicSeat {
  seatId: number;
  isHostSeat?: boolean;
  isLocked: boolean;
  isMuted: boolean;
  points?: number; // نقاط المقعد أو الهدايا المستلمة
  speakerUser?: {
    id: string;
    agoraUid?: number;
    name: string;
    avatar: string;
    equippedFrame?: string;
    isSpeaking?: boolean;
    audioLevel?: number; // 0-100
    vipLevel?: number;
    role?: 'مقدم' | 'مدير' | 'VIP' | 'عضو';
  };
}

export interface RoomMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  senderVip?: number;
  text: string;
  timestamp: string;
  isGiftNotice?: boolean;
  giftInfo?: {
    giftName: string;
    giftIcon: string;
    amount: number;
  };
  isSystemNotice?: boolean;
}

export interface SeatTemplate {
  id: string;
  type: 'basic' | 'boss';
  count: number;
  minLevel: number;
  label: string;
}

export interface RoomSupporter {
  id: string;
  name: string;
  avatar: string;
  coins: number;
  vipLevel?: number;
  userLevel?: number;
  lastSupportedAt?: number;
}

export interface VoiceRoom {
  id: string;
  title: string;
  announcement: string;
  hostId: string;
  ownerId?: string;
  creatorId?: string;
  hostName: string;
  hostAvatar: string;
  category: 'غرف شائعة' | 'غرف جديدة' | 'متابعة' | 'غرف الحفلات' | string;
  tag: string;
  level: number; // مستوى الغرفة e.g. 1, 5
  rank: number; // ترتيب الغرفة e.g. 1, 2, 3
  listenersCount: number;
  diamonds?: number; // إجمالي الدعم والماسات المستلمة بالغرفة لرفع الترتيب
  diamondsWeekStart?: number; // بداية دورة الأسبوع للألماسات لتصفيرها كل 7 أيام تلقائياً
  createdAt?: number; // وقت إنشاء الغرفة للانتقال التلقائي بعد 24 ساعة
  regionType?: 'arabic' | 'foreign'; // تصنيف المنطقة: عربية أو أجنبية
  country?: string; // اسم الدولة مثل السعودية، الإمارات، تركيا، أمريكا
  language?: string; // 'العربية' | 'English' | 'التركية' | 'الكردية' | 'الفرنسية'
  hasLiveStream?: boolean; // بث فيديو لايف نشط
  liveStreamId?: string;
  hasFriendsInside?: boolean; // هل يوجد أصدقاء داخل الغرفة
  friendsCountInside?: number; // عدد الأصدقاء المتواجدين حالياً
  seats: MicSeat[];
  seatLayout?: {
    type: 'basic' | 'boss';
    count: number;
  };
  backgroundUrl: string;
  coverImage?: string;
  welcomeMessage?: string;
  autoSitEnabled?: boolean;
  entryPermission?: string;
  pinCode?: string;
  isLockedWithPin?: boolean;
  messages: RoomMessage[];
  mods?: string[] | Record<string, boolean>; // list or map of user IDs who are moderators
  blackList?: string[]; // قائمة المستخدمين المحظورين نهائياً من الغرفة
  kickedUsers?: Record<string, { kickedAt: number; expiresAt: number; kickedBy?: string; reason?: string }>; // المطرودون لمدة 24 ساعة
  topSupporters?: RoomSupporter[]; // قائمة كبار الداعمين الفعلية للغرفة
  agoraChannel?: string;
  agoraToken?: string;
  managerPermissions?: {
    canManageLayout?: boolean;
  };
  partyEvent?: {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    targetCoins: number;
    currentCoins: number;
    status: 'upcoming' | 'live' | 'finished';
    bannerImage: string;
    topContributors?: {
      userId: string;
      name: string;
      avatar: string;
      amount: number;
      rank: number;
    }[];
  };
  pkState?: PKBattleState;
  cinema?: {
    active: boolean;
    videoId: string;
    title: string;
    startedAt?: number;
    startedBy?: string;
  };
  liveMusic?: {
    isPlaying: boolean;
    track: any;
    mode: 'video' | 'audio_only';
    startedAt?: number;
    startedBy?: string;
  };
}

export interface GiftItem {
  id: string;
  name: string;
  icon: string;
  priceCoins: number;
  priceDiamonds?: number;
  category?: 'gift' | 'lucky' | 'cp' | 'worldcup' | 'birthday' | 'svip' | 'member' | 'eid' | string;
  badge?: string; // e.g. 'CP', 'VIP', 'HOT'
  effectType: 'heart' | 'crown' | 'sports_car' | 'dragon' | 'fireworks' | 'rose_shower' | 'love_heart' | 'fireworks_boom' | 'jet_fly' | 'car_drive' | 'gold_coins' | 'castle_crown' | 'dragon_fire' | 'eid_ram' | 'bday_party' | string;
  videoUrl?: string; // e.g. '/assets/gifts/animations/dragon.mp4'
  animation?: string; // e.g. '/assets/gifts/animations/dragon.webm'
  animationUrl?: string; // e.g. '/assets/gifts/animations/dragon.webm'
  iconUrl?: string; // e.g. '/assets/gifts/icons/dragon.png'
}

export interface LuckyRewardResult {
  multiplier: number; // 0, 1.5, 3, 10, 50, 100, 500
  wonCoins: number;
  isJackpot: boolean;
  isBigWin: boolean;
}

export interface ActiveGiftAnimation {
  id: string;
  senderName: string;
  senderAvatar: string;
  recipientName: string;
  gift: GiftItem;
  amount: number;
  timestamp: number;
  luckyReward?: LuckyRewardResult;
}

export interface CoinPackage {
  id: string;
  title: string;
  coinsAmount: number;
  bonusCoins: number;
  priceUsd: number;
  priceSar?: number;
  badge?: string;
  tag?: string;
  popular?: boolean;
  vipBonusXp?: number;
  icon?: string;
  googlePlayProductId: string;
}

export interface TransactionRecord {
  id: string;
  googleOrderId: string;
  userId: string;
  userName: string;
  packageName: string;
  amountCoins: number;
  priceUsd: number;
  purchaseToken: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  timestamp: string;
}

export interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  vipLevel: number;
  scoreCoins: number;
  badge: string;
}

export type MainTab = 'home' | 'moments' | 'chats' | 'friends' | 'profile';

export type WithdrawalGateway = 
  | 'bank_transfer' 
  | 'zain_cash' 
  | 'orange_money' 
  | 'cliq'
  | 'vodafone_cash' 
  | 'instapay' 
  | 'usdt_trc20' 
  | 'paypal' 
  | 'payoneer';

export interface WithdrawalPackage {
  id: string;
  diamondsCount: number;
  usdAmount: number;
  badge?: string;
  popular?: boolean;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  diamondsAmount: number;
  usdAmount: number;
  gateway: string;
  gatewayTitle?: string;
  accountDetails: string;
  beneficiaryName?: string | null;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'REJECTED';
  payoutReference?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  processedAt?: string | null;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead?: boolean;
}

export interface PrivateConversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  partnerVip?: number;
  isOnline?: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: DirectMessage[];
}

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  role: 'Leader' | 'Elder' | 'Member';
  contribution: number;
  isOnline: boolean;
  joinDate: string;
}

export interface FamilyInfo {
  id: string;
  name: string;
  tag: string;
  badgeIcon: string;
  level: number;
  exp: number;
  maxExp: number;
  leaderId: string;
  leaderName: string;
  leaderAvatar: string;
  membersCount: number;
  maxMembers: number;
  rank: number;
  announcement: string;
  members: FamilyMember[];
}

export interface TargetTier {
  id: string;
  name: string;
  diamondsRequired: number;
  hoursRequired: number;
  validDaysRequired: number;
  rewardUsd: number;
  badge: string;
  color: string;
}

export interface HostTargetProgress {
  hostId: string;
  ownerId?: string;
  creatorId?: string;
  hostName: string;
  currentTierId: string;
  currentDiamonds: number;
  currentHours: number;
  currentValidDays: number;
  targetDiamonds: number;
  targetHours: number;
  targetValidDays: number;
  isCompleted: boolean;
  rewardClaimed: boolean;
  estimatedRewardUsd: number;
  daysRemainingInMonth: number;
}

export interface AgencyJoinRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userLevel: number;
  agencyCode: string;
  appliedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface AgencyHost {
  id: string;
  name: string;
  avatar: string;
  monthlyHours: number;
  targetHours: number;
  diamondsEarned: number;
  salaryUsd: number;
  status: 'active' | 'pending' | 'probation';
  validDays?: number;
  targetCompleted?: boolean;
  rewardClaimed?: boolean;
  joinedDate?: string;
  agencyRole?: 'owner' | 'assistant' | 'member';
}

export interface AgencyInfo {
  id: string;
  name: string;
  code: string;
  agentName?: string;
  ownerId?: string;
  ownerName?: string;
  logo?: string;
  level?: string;
  hostsCount: number;
  totalHoursMonth?: number;
  totalDiamondsMonth?: number;
  commissionRate?: number;
  monthlyCommissionRate?: string;
  totalMonthlyRevenueUsd?: number;
  hosts?: AgencyHost[];
  pendingRequests?: AgencyJoinRequest[];
}

export interface TriviaQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
  rewardCoins: number;
}

export interface PKTeam {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  winStreak?: number; // Number of consecutive wins
  topDonors?: Array<{ id?: string; name: string; avatar: string; amount: number }>;
}

export interface PKBattleState {
  isActive: boolean;
  startTime: number; // Server timestamp when PK started
  duration: number; // PK duration in seconds
  timeRemaining?: number; // For backward compatibility / local display
  redTeam: PKTeam;
  blueTeam: PKTeam;
  updatedAt?: number;
}

export interface AvatarFrame {
  id: string;
  name: string;
  icon?: string;
  frameClass?: string;
  glowColor?: string;
  imageUrl?: string;
  previewUrl?: string;
  priceCoins: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  vipLevelRequired?: number;
  isUnlocked?: boolean;
  description?: string;
}

export interface EntranceVehicle {
  id: string;
  name: string;
  icon: string;
  priceCoins: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  bannerGradient: string;
}

export interface ChatBubble {
  id: string;
  name: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  priceCoins: number;
}

export interface HostTargetTier {
  tierId: string;
  tierName: string;
  badge: string;
  requiredDiamonds: number;
  baseSalaryUsd: number;
  bonusRewardCoins: number;
  requiredDays: number;
  requiredHours: number;
  colorClass: string;
}

export const HOST_TARGET_TIERS: HostTargetTier[] = [
  { tierId: 'target_10k', tierName: 'Target 10K', badge: '10K 🥉', requiredDiamonds: 10000, baseSalaryUsd: 6, bonusRewardCoins: 1500, requiredDays: 4, requiredHours: 8, colorClass: 'from-amber-700 to-amber-900 border-amber-600' },
  { tierId: 'target_20k', tierName: 'Target 20K', badge: '20K 🥉', requiredDiamonds: 20000, baseSalaryUsd: 12, bonusRewardCoins: 3000, requiredDays: 4, requiredHours: 8, colorClass: 'from-amber-700 to-amber-900 border-amber-600' },
  { tierId: 'target_40k', tierName: 'Target 40K', badge: '40K 🥉', requiredDiamonds: 40000, baseSalaryUsd: 20, bonusRewardCoins: 5000, requiredDays: 4, requiredHours: 8, colorClass: 'from-amber-700 to-amber-900 border-amber-600' },
  { tierId: 'target_65k', tierName: 'Target 65K', badge: '65K 🥉', requiredDiamonds: 65000, baseSalaryUsd: 28, bonusRewardCoins: 7000, requiredDays: 4, requiredHours: 8, colorClass: 'from-amber-700 to-amber-900 border-amber-600' },
  { tierId: 'target_100k', tierName: 'Target 100K', badge: '100K 🥈', requiredDiamonds: 100000, baseSalaryUsd: 50, bonusRewardCoins: 12500, requiredDays: 4, requiredHours: 8, colorClass: 'from-slate-400 to-slate-600 border-slate-300' },
  { tierId: 'target_150k', tierName: 'Target 150K', badge: '150K 🥈', requiredDiamonds: 150000, baseSalaryUsd: 67, bonusRewardCoins: 16750, requiredDays: 4, requiredHours: 8, colorClass: 'from-slate-400 to-slate-600 border-slate-300' },
  { tierId: 'target_275k', tierName: 'Target 275K', badge: '275K 🥈', requiredDiamonds: 275000, baseSalaryUsd: 123, bonusRewardCoins: 30750, requiredDays: 4, requiredHours: 8, colorClass: 'from-slate-400 to-slate-600 border-slate-300' },
  { tierId: 'target_375k', tierName: 'Target 375K', badge: '375K 🥇', requiredDiamonds: 375000, baseSalaryUsd: 153, bonusRewardCoins: 38250, requiredDays: 4, requiredHours: 8, colorClass: 'from-yellow-500 to-amber-600 border-yellow-400' },
  { tierId: 'target_500k', tierName: 'Target 500K', badge: '500K 🥇', requiredDiamonds: 500000, baseSalaryUsd: 200, bonusRewardCoins: 50000, requiredDays: 4, requiredHours: 8, colorClass: 'from-yellow-500 to-amber-600 border-yellow-400' },
  { tierId: 'target_750k', tierName: 'Target 750K', badge: '750K 💎', requiredDiamonds: 750000, baseSalaryUsd: 310, bonusRewardCoins: 77500, requiredDays: 4, requiredHours: 8, colorClass: 'from-cyan-500 to-blue-600 border-cyan-400' },
  { tierId: 'target_1m', tierName: 'Target 1M', badge: '1M 👑', requiredDiamonds: 1000000, baseSalaryUsd: 375, bonusRewardCoins: 93750, requiredDays: 4, requiredHours: 8, colorClass: 'from-purple-600 to-pink-600 border-purple-400' },
];

export interface HostDailyTargetData {
  todayLiveMinutes: number;
  requiredDailyMinutes: number; // e.g. 180 (3 hours)
  todayDiamonds: number;
  requiredDailyDiamonds: number; // e.g. 100,000
  monthlyCompletedDays: number; // e.g. 18 / 25 days
  totalMonthlyDiamonds: number;
  currentSalaryTierUsd: number; // e.g. 120$
  nextSalaryTierUsd: number; // e.g. 250$
  isHoursCompleted: boolean;
  isDiamondsCompleted: boolean;
}

export interface RedPacketWinner {
  userId: string;
  userName: string;
  userAvatar: string;
  amount: number;
  wonAt: string;
  isBestLuck?: boolean;
}

export interface RedPacketItem {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  totalCoins: number;
  totalRecipients: number;
  remainingCoins: number;
  remainingRecipients: number;
  createdAt: number;
  durationSeconds: number;
  status: 'active' | 'completed' | 'expired';
  winners: RedPacketWinner[];
  blessingMessage: string;
}

export interface DailySpinReward {
  id: string;
  type: 'coins' | 'frame' | 'diamonds' | 'xp';
  amount: number;
  label: string;
  icon: string;
  color: string;
}
