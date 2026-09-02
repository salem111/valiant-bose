import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  CheckCheck,
  Sparkles,
  ArrowRight,
  Plus,
  Search,
  MoreVertical,
  Pin,
  Trash2,
  BellOff,
  Bell,
  Star,
  UserX,
  Flag,
  Phone,
  Video,
  Mic,
  Image as ImageIcon,
  Paperclip,
  Smile,
  Gift,
  MapPin,
  FileText,
  User as UserIcon,
  Share2,
  CornerUpLeft,
  Copy,
  Check,
  Play,
  Pause,
  Shield,
  Crown,
  CheckCircle2,
  ChevronLeft,
  X,
  Radio,
  Users,
  UserPlus,
  UserCheck,
  Heart,
  Settings,
  Edit3,
  Camera,
  Film,
  Download,
  AlertTriangle
} from 'lucide-react';
import { PrivateCallModal } from './call/PrivateCallModal';
import { listenToAllUsersPresence } from '../lib/firebase';
import { VoiceRoom, UserProfile } from '../types';
import { useI18n } from '../lib/i18n';


interface DirectChatsViewProps {
  currentUser?: UserProfile;
  rooms?: VoiceRoom[];
  onOpenRoom?: (room: VoiceRoom) => void;
  onBack?: () => void;
}

export interface GroupMember {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  role?: 'owner' | 'admin' | 'member';
}

export interface ChatMessage {
  id: string;
  senderId: 'me' | 'other';
  senderName: string;
  text?: string;
  type: 'text' | 'image' | 'video' | 'gif' | 'voice' | 'file' | 'location' | 'contact' | 'room' | 'gift';
  mediaUrl?: string;
  giftName?: string;
  giftIcon?: string;
  roomData?: { id: string; title: string; hostName: string; viewers: number };
  audioDuration?: string;
  fileName?: string;
  fileSize?: string;
  locationName?: string;
  contactName?: string;
  timestamp: string;
  status: 'sent' | 'read';
  isPinned?: boolean;
  reaction?: string;
  replyToText?: string;
}

export interface ChatContact {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  vipLevel: number;
  userLevel: number;
  isVerified: boolean;
  isModerator: boolean;
  isRoomOwner: boolean;
  countryFlag: string;
  bio: string;
  followers: string;
  following: string;
  giftsTotal: string;
  lastMsg: string;
  lastMsgType: 'text' | 'image' | 'video' | 'voice' | 'gift' | 'room' | 'file';
  time: string;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isFavorite: boolean;
  isFollowing: boolean;
  isBlocked: boolean;
  activeRoomId?: string;
  activeRoomTitle?: string;
  lastSeenText?: string;
  messages: ChatMessage[];
  // Group Chat Attributes
  isGroup?: boolean;
  groupOwnerId?: string;
  groupMembers?: GroupMember[];
}

export const DirectChatsView: React.FC<DirectChatsViewProps> = ({
  currentUser,
  rooms = [],
  onOpenRoom,
  onBack,
}) => {
  const { t, dir } = useI18n();
  // Active User Profile fallback
  const myProfile: UserProfile = currentUser || {
    id: 'user_salem',
    name: 'سالم',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    coins: 10000,
    diamonds: 5000,
    vipLevel: 5,
    userLevel: 25,
    country: 'SA',
    countryFlag: '🇸🇦',
    bio: '',
    role: 'user',
    isAgent: false,
  };

  // Presence Map from Firebase RTDB (.info/connected)
  const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsub = listenToAllUsersPresence((map) => {
      setPresenceMap(map);
    });
    return () => unsub();
  }, []);

  // Initialize Real Followed Contacts & System Bot (SALEEM Smart AI Assistant)
  const [chats, setChats] = useState<ChatContact[]>(() => {
    const sysChat: ChatContact = {
      id: 'chat_sys',
      userId: 'system_bot',
      name: 'مساعد سليم الذكي 🤖 (خدمة العملاء AI)',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      vipLevel: 10,
      userLevel: 99,
      isVerified: true,
      isModerator: true,
      isRoomOwner: false,
      countryFlag: '🇸🇦',
      bio: 'المساعد الذكي لخدمة العملاء والدعم الفني وإرشادات التطبيق على مدار 24 ساعة 🤖✨',
      followers: '1M',
      following: '0',
      giftsTotal: '99M 💎',
      lastMsg: 'أهلاً بك! أنا مساعد سليم الذكي، اسألني عن أي شيء في التطبيق وسأجيبك فوراً! 🌟',
      lastMsgType: 'text',
      time: 'الآن',
      unreadCount: 0,
      isPinned: true,
      isMuted: false,
      isFavorite: true,
      isFollowing: true,
      isBlocked: false,
      activeRoomId: undefined,
      activeRoomTitle: undefined,
      lastSeenText: 'متصل الآن 24/7 (ذكاء اصطناعي)',
      messages: [
        {
          id: 'sys1',
          senderId: 'other',
          senderName: 'مساعد سليم الذكي 🤖',
          text: `👑 مرحباً بك يا ${myProfile.name || 'صديقنا'} في تطبيق SALEEM!\nأنا مساعدك الذكي لخدمة العملاء والدعم الفني على مدار 24 ساعة 🤖✨\n\nاسألني عن:\n💎 كيفية شحن العملات وسحب الأرباح\n🎙️ إنشاء وإدارة الغرف الصوتية والمايكات\n🏢 الانضمام للوكالات وتحقيق التارجت\n👑 مستويات الـ VIP والإطارات الملكية\n🎲 الألعاب المصغرة والمكالمات الخاصة`,
          type: 'text',
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
        }
      ],
    };

    try {
      const storedFriends = localStorage.getItem('followed_friends_list');
      if (storedFriends) {
        const list = JSON.parse(storedFriends);
        const friendChats: ChatContact[] = list.map((f: any) => ({
          id: `chat_${f.userId}`,
          userId: f.userId,
          name: f.name,
          avatar: f.avatar,
          vipLevel: f.vipLevel || 0,
          userLevel: f.userLevel || 1,
          isVerified: true,
          isModerator: false,
          isRoomOwner: false,
          countryFlag: f.countryFlag || '🇸🇦',
          bio: f.bio || 'صديق في قائمة المتابعة ✨',
          followers: f.followers || '1',
          following: f.following || '0',
          giftsTotal: f.giftsTotal || '0 💎',
          lastMsg: 'بدأت بمتابعة الصديق، ابدأ الدردشة الآن! 👋',
          lastMsgType: 'text',
          time: 'الآن',
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
          isFavorite: false,
          isFollowing: true,
          isBlocked: false,
          lastSeenText: 'متصل الآن',
          messages: [
            {
              id: `msg_init_${f.userId}`,
              senderId: 'other',
              senderName: f.name,
              text: `👋 مرحباً بك! تمت المتابعة بنجاح، يمكنك إرسال رسالة خاصة أو هدية أو إجراء مكالمة الآن.`,
              type: 'text',
              timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
              status: 'read',
            }
          ]
        }));
        return [sysChat, ...friendChats];
      }
    } catch (e) {}

    return [sysChat];
  });

  // Listen to dynamic follow/unfollow events across the app
  useEffect(() => {
    const handleUserFollowed = (e: any) => {
      const f = e.detail;
      if (!f || !f.userId) return;

      setChats((prev) => {
        if (prev.some((c) => c.userId === f.userId || c.id === `chat_${f.userId}`)) {
          return prev.map((c) => (c.userId === f.userId ? { ...c, isFollowing: true } : c));
        }

        const newFriendChat: ChatContact = {
          id: `chat_${f.userId}`,
          userId: f.userId,
          name: f.name,
          avatar: f.avatar,
          vipLevel: f.vipLevel || 0,
          userLevel: f.userLevel || 1,
          isVerified: true,
          isModerator: false,
          isRoomOwner: false,
          countryFlag: f.countryFlag || '🇸🇦',
          bio: f.bio || 'صديق في قائمة المتابعة ✨',
          followers: f.followers || '1',
          following: f.following || '0',
          giftsTotal: f.giftsTotal || '0 💎',
          lastMsg: 'بدأت بمتابعة الصديق، ابدأ الدردشة الآن! 👋',
          lastMsgType: 'text',
          time: 'الآن',
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
          isFavorite: false,
          isFollowing: true,
          isBlocked: false,
          lastSeenText: 'متصل الآن',
          messages: [
            {
              id: `msg_init_${f.userId}_${Date.now()}`,
              senderId: 'other',
              senderName: f.name,
              text: `👋 مرحباً بك! تمت المتابعة بنجاح، يمكنك إرسال رسالة خاصة أو هدية أو إجراء مكالمة الآن.`,
              type: 'text',
              timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
              status: 'read',
            }
          ]
        };

        return [newFriendChat, ...prev];
      });
      showToast(`👤 تمت إضافة ${f.name} إلى قائمة محادثات الأصدقاء!`);
    };

    const handleUserUnfollowed = (e: any) => {
      const { userId } = e.detail || {};
      if (!userId) return;
      setChats((prev) => prev.map((c) => (c.userId === userId ? { ...c, isFollowing: false } : c)));
    };

    const handleRelationshipChanged = (e: any) => {
      const { targetUserId, status } = e.detail || {};
      if (!targetUserId) return;
      const isNowFollowing = status === 'following' || status === 'friend';
      setChats((prev) => prev.map((c) => (c.userId === targetUserId ? { ...c, isFollowing: isNowFollowing } : c)));
    };

    const handleOpenDirectChat = (e: any) => {
      const target = e.detail;
      if (!target || !target.userId) return;

      setChats((prev) => {
        let targetChat = prev.find((c) => c.userId === target.userId || c.id === `chat_${target.userId}`);
        if (!targetChat) {
          targetChat = {
            id: `chat_${target.userId}`,
            userId: target.userId,
            name: target.name || 'صديق',
            avatar: target.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
            vipLevel: target.vipLevel || 0,
            userLevel: target.userLevel || 1,
            isVerified: true,
            isModerator: false,
            isRoomOwner: false,
            countryFlag: target.countryFlag || '🇸🇦',
            bio: target.bio || 'صديق في قائمة المتابعة ✨',
            followers: '1',
            following: '0',
            giftsTotal: '0 💎',
            lastMsg: 'بدأت المحادثة الآن! 👋',
            lastMsgType: 'text',
            time: 'الآن',
            unreadCount: 0,
            isPinned: false,
            isMuted: false,
            isFavorite: false,
            isFollowing: true,
            isBlocked: false,
            lastSeenText: 'متصل الآن',
            messages: [],
          };
          setSelectedChatId(targetChat.id);
          setActiveSubView('chat');
          return [targetChat, ...prev];
        } else {
          setSelectedChatId(targetChat.id);
          setActiveSubView('chat');
          return prev;
        }
      });
    };

    window.addEventListener('app:user-followed', handleUserFollowed);
    window.addEventListener('app:user-unfollowed', handleUserUnfollowed);
    window.addEventListener('app:relationship-changed', handleRelationshipChanged);
    window.addEventListener('app:open-direct-chat', handleOpenDirectChat);

    return () => {
      window.removeEventListener('app:user-followed', handleUserFollowed);
      window.removeEventListener('app:user-unfollowed', handleUserUnfollowed);
      window.removeEventListener('app:relationship-changed', handleRelationshipChanged);
      window.removeEventListener('app:open-direct-chat', handleOpenDirectChat);
    };
  }, []);

  // View States
  const [activeSubView, setActiveSubView] = useState<'list' | 'chat'>('list');
  const [selectedChatId, setSelectedChatId] = useState<string>('chat_1');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & BottomSheets
  const [selectedChatForMenu, setSelectedChatForMenu] = useState<ChatContact | null>(null);
  const [selectedChatForProfile, setSelectedChatForProfile] = useState<ChatContact | null>(null);
  const [enlargedAvatarUrl, setEnlargedAvatarUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Chat Screen States
  const [messageInput, setMessageInput] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGiftMenu, setShowGiftMenu] = useState(false);
  const [showInChatSearch, setShowInChatSearch] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState('');
  const [showSharedMedia, setShowSharedMedia] = useState(false);
  const [selectedMsgForAction, setSelectedMsgForAction] = useState<ChatMessage | null>(null);
  const [replyingMsg, setReplyingMsg] = useState<ChatMessage | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [sentImagesCount, setSentImagesCount] = useState<number>(0);
  const [sentVideosCount, setSentVideosCount] = useState<number>(0);
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const recordingTimerRef = useRef<any>(null);

  // Active Call State (Voice / Video 1v1 & Group)
  const [activeCall, setActiveCall] = useState<{
    partner: { id: string; name: string; avatar: string };
    isVideo: boolean;
  } | null>(null);

  // Group Creation & Management States
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupTitleInput, setGroupTitleInput] = useState('مجموعة الأصدقاء 🎉');
  const [inviteUserIdInput, setInviteUserIdInput] = useState('');
  const [groupParticipants, setGroupParticipants] = useState<GroupMember[]>([
    {
      id: 'me',
      userId: '88001',
      name: 'سالم (أنت - المالك)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'owner'
    }
  ]);

  const [showGroupManageModal, setShowGroupManageModal] = useState(false);
  const [addMemberIdInGroupInput, setAddMemberIdInGroupInput] = useState('');

  // Add Participant By ID during group creation
  const handleAddParticipantById = (idStr?: string) => {
    const targetId = (idStr || inviteUserIdInput).trim();
    if (!targetId) {
      showToast('⚠️ يرجى إدخال معرف ID المستخدم أولاً');
      return;
    }

    if (groupParticipants.length >= 100) {
      showToast('⚠️ وصلت للحد الأقصى للمشاركين (100 عضو)');
      return;
    }

    if (groupParticipants.some(p => p.userId === targetId || p.id === targetId)) {
      showToast('⚠️ هذا العضو مضاف بالفعل في قائمة المجموعة');
      return;
    }

    const matchedContact = chats.find(c => c.userId === targetId || c.id === targetId);
    const newMember: GroupMember = matchedContact
      ? {
          id: matchedContact.id,
          userId: matchedContact.userId,
          name: matchedContact.name,
          avatar: matchedContact.avatar,
          role: 'member'
        }
      : {
          id: `user_${targetId}`,
          userId: targetId,
          name: `مستخدم #${targetId}`,
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
          role: 'member'
        };

    setGroupParticipants(prev => [...prev, newMember]);
    setInviteUserIdInput('');
    showToast(`✅ تم إضافة ${newMember.name} إلى قائمة المجموعة`);
  };

  const handleRemoveParticipant = (id: string) => {
    if (id === 'me') {
      showToast('⚠️ لا يمكن إزالة صاحب المجموعة');
      return;
    }
    setGroupParticipants(prev => prev.filter(p => p.id !== id));
    showToast('❌ تم إزالة العضو من القائمة');
  };

  const handleConfirmCreateGroup = () => {
    if (!groupTitleInput.trim()) {
      showToast('⚠️ يرجى كتابة اسم المجموعة');
      return;
    }

    const newGroupId = `group_${Date.now()}`;
    const newGroupChat: ChatContact = {
      id: newGroupId,
      userId: `gid_${Date.now()}`,
      name: groupTitleInput.trim(),
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80',
      vipLevel: 10,
      userLevel: 99,
      isVerified: true,
      isModerator: true,
      isRoomOwner: true,
      countryFlag: '🇸🇦',
      bio: `مجموعة جماعية تضم ${groupParticipants.length} عضو 🎉`,
      followers: `${groupParticipants.length}`,
      following: '0',
      giftsTotal: '0 💎',
      lastMsg: 'تم إنشاء المجموعة الجماعية بنجاح 🎉',
      lastMsgType: 'text',
      time: 'الآن',
      unreadCount: 0,
      isPinned: true,
      isMuted: false,
      isFavorite: true,
      isFollowing: true,
      isBlocked: false,
      isGroup: true,
      groupOwnerId: 'me',
      groupMembers: groupParticipants,
      messages: [
        {
          id: `m_init_${Date.now()}`,
          senderId: 'other',
          senderName: 'نظام المجموعة 🛡️',
          text: `🎉 مرحباً بكم في "${groupTitleInput.trim()}"! تم إنشاء المجموعة الجماعية بواسطة المالك سالم وتضم ${groupParticipants.length} أعضاء.`,
          type: 'text',
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          status: 'read'
        }
      ]
    };

    setChats(prev => [newGroupChat, ...prev]);
    setSelectedChatId(newGroupId);
    setActiveSubView('chat');
    setShowCreateGroupModal(false);
    showToast(`🎉 تم إنشاء المجموعة "${newGroupChat.name}" بنجاح!`);
  };

  const handleAddMemberToExistingGroup = (chatId: string) => {
    const targetId = addMemberIdInGroupInput.trim();
    if (!targetId) {
      showToast('⚠️ يرجى كتابة معرف ID العضو المراد دعوته');
      return;
    }

    setChats(prev =>
      prev.map(c => {
        if (c.id === chatId) {
          const members = c.groupMembers || [];
          if (members.length >= 100) {
            showToast('⚠️ وصلت المجموعة للحد الأقصى (100 عضو)');
            return c;
          }
          if (members.some(m => m.userId === targetId || m.id === targetId)) {
            showToast('⚠️ هذا العضو موجود بالفعل بالمجموعة');
            return c;
          }
          const matchedContact = prev.find(item => item.userId === targetId || item.id === targetId);
          const newMember: GroupMember = matchedContact
            ? { id: matchedContact.id, userId: matchedContact.userId, name: matchedContact.name, avatar: matchedContact.avatar, role: 'member' }
            : { id: `user_${targetId}`, userId: targetId, name: `مستخدم #${targetId}`, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', role: 'member' };

          showToast(`✅ تم دعوة وإضافة ${newMember.name} إلى المجموعة`);
          return {
            ...c,
            groupMembers: [...members, newMember]
          };
        }
        return c;
      })
    );
    setAddMemberIdInGroupInput('');
  };

  const handleRemoveMemberFromGroup = (chatId: string, memberId: string) => {
    setChats(prev =>
      prev.map(c => {
        if (c.id === chatId) {
          const updatedMembers = (c.groupMembers || []).filter(m => m.id !== memberId && m.userId !== memberId);
          showToast('❌ تم إزالة العضو من المجموعة بواسطة المالك');
          return {
            ...c,
            groupMembers: updatedMembers
          };
        }
        return c;
      })
    );
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeChat = chats.find(c => c.id === selectedChatId) || chats[0];
  const activeUserPresence = presenceMap[activeChat?.userId] ?? true;

  // Auto-scroll inside chat
  useEffect(() => {
    if (activeSubView === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSubView, activeChat?.messages?.length]);

  // Audio Recording Timer
  const startRecording = () => {
    setIsRecordingAudio(true);
    setRecordingSeconds(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds(s => s + 1);
    }, 1000);
  };

  const stopRecordingAndSend = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecordingAudio(false);
    if (recordingSeconds >= 1) {
      handleSendMessage('voice', undefined, undefined, undefined, `00:${recordingSeconds.toString().padStart(2, '0')}`);
      showToast('🎵 تم إرسال الرسالة الصوتية بنجاح!');
    }
    setRecordingSeconds(0);
  };

  const cancelRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecordingAudio(false);
    setRecordingSeconds(0);
    showToast('❌ تم إلغاء التسجيل الصوتي');
  };

  // Filtered Chats
  const filteredChats = chats.filter((c) => {
    if (activeTabFilter === 'unread' && c.unreadCount === 0) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.lastMsg.toLowerCase().includes(q) ||
      (c.activeRoomTitle && c.activeRoomTitle.toLowerCase().includes(q))
    );
  });

  const totalUnreadCount = chats.reduce((acc, curr) => acc + curr.unreadCount, 0);

  // Send Message Handler
  const handleSendMessage = (
    type: ChatMessage['type'] = 'text',
    textVal?: string,
    mediaUrlVal?: string,
    giftData?: { name: string; icon: string },
    audioDurationVal?: string,
    roomDataVal?: ChatMessage['roomData']
  ) => {
    const finalContent = textVal || messageInput;
    if (type === 'text' && !finalContent.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'me',
      senderName: 'سالم (أنت)',
      type,
      text: type === 'text' ? finalContent : textVal,
      mediaUrl: mediaUrlVal,
      giftName: giftData?.name,
      giftIcon: giftData?.icon,
      audioDuration: audioDurationVal,
      roomData: roomDataVal,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      replyToText: replyingMsg ? replyingMsg.text : undefined,
    };

    setChats(prev =>
      prev.map(c => {
        if (c.id === selectedChatId) {
          let previewText = finalContent;
          if (type === 'gift') previewText = `🎁 أرسل لك هدية: ${giftData?.name}`;
          if (type === 'image') previewText = '📷 صورة جديدة';
          if (type === 'voice') previewText = '🎵 رسالة صوتية';
          if (type === 'room') previewText = `🎤 دعاك للغرفة: ${roomDataVal?.title}`;

          return {
            ...c,
            lastMsg: previewText,
            lastMsgType: type,
            time: 'الآن',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setMessageInput('');
    setReplyingMsg(null);
    setShowAttachmentMenu(false);
    setShowEmojiPicker(false);
    setShowGiftMenu(false);

    // Handle SALEEM AI Assistant Chat Response
    const isAssistantChat = activeChat.userId === 'system_bot' || activeChat.id === 'chat_sys';
    if (isAssistantChat && type === 'text') {
      setIsBotTyping(true);
      Promise.resolve('شكراً لرسالتك! للدعم الفني تواصل معنا من خلال غرفة الإدارة في الصفحة الرئيسية. 🌟')
        .then((aiAnswer) => {
          const aiReplyMsg: ChatMessage = {
            id: `msg_ai_${Date.now()}`,
            senderId: 'other',
            senderName: 'مساعد سليم الذكي 🤖',
            type: 'text',
            text: aiAnswer,
            timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            status: 'read',
          };

          setChats((prev) =>
            prev.map((c) => {
              if (c.id === selectedChatId) {
                return {
                  ...c,
                  lastMsg: aiAnswer.slice(0, 45) + '...',
                  lastMsgType: 'text',
                  time: 'الآن',
                  messages: [...c.messages, aiReplyMsg],
                };
              }
              return c;
            })
          );
        })
        .finally(() => {
          setIsBotTyping(false);
        });
      return;
    }

    // Simulate friend response after 1.5 seconds for normal chats
    setTimeout(() => {
      setChats(prev =>
        prev.map(c => {
          if (c.id === selectedChatId) {
            const updatedMsgs = c.messages.map(m => (m.id === newMsg.id ? { ...m, status: 'read' as const } : m));
            return { ...c, messages: updatedMsgs };
          }
          return c;
        })
      );
    }, 1500);
  };

  // Toggle Chat Actions
  const handleTogglePin = (chatId: string) => {
    setChats(prev => prev.map(c => (c.id === chatId ? { ...c, isPinned: !c.isPinned } : c)));
    showToast('📌 تم تحديث التثبيت');
    setSelectedChatForMenu(null);
  };

  const handleToggleMute = (chatId: string) => {
    setChats(prev => prev.map(c => (c.id === chatId ? { ...c, isMuted: !c.isMuted } : c)));
    showToast('🔕 تم تحديث وضع الكتم');
    setSelectedChatForMenu(null);
  };

  const handleToggleFavorite = (chatId: string) => {
    setChats(prev => prev.map(c => (c.id === chatId ? { ...c, isFavorite: !c.isFavorite } : c)));
    showToast('⭐ تم تحديث المفضلة');
    setSelectedChatForMenu(null);
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    showToast('🗑️ تم حذف المحادثة بالكامل');
    setSelectedChatForMenu(null);
    if (selectedChatId === chatId) setActiveSubView('list');
  };

  const handleClearChatMessages = (chatId: string) => {
    setChats(prev => prev.map(c => (c.id === chatId ? { ...c, messages: [], lastMsg: 'تم مسح الرسائل' } : c)));
    showToast('🧹 تم مسح جميع الرسائل داخل المحادثة');
    setSelectedChatForMenu(null);
  };

  const handleToggleFollowUser = (chatId: string) => {
    setChats(prev =>
      prev.map(c => (c.id === chatId ? { ...c, isFollowing: !c.isFollowing } : c))
    );
    if (selectedChatForProfile) {
      setSelectedChatForProfile(prev => prev ? { ...prev, isFollowing: !prev.isFollowing } : null);
    }
    showToast('➕ تم تحديث حالة المتابعة');
  };

  // Helper to get active voice room for any contact dynamically
  const getContactActiveRoom = (contact: ChatContact): VoiceRoom | null => {
    if (!contact || contact.isGroup || contact.userId === 'system_bot') return null;
    if (contact.activeRoomId) {
      const found = rooms.find((r) => r.id === contact.activeRoomId);
      if (found) return found;
    }
    const hosted = rooms.find((r) => r.hostId === contact.userId || r.hostName === contact.name);
    if (hosted) return hosted;

    const inSeat = rooms.find((r) => r.seats?.some((s) => s.userId === contact.userId));
    if (inSeat) return inSeat;

    return null;
  };

  // Track / Jump to Voice Room handler (انتقال وتتبع مباشر لغرفة الصديق)
  const handleTrackToRoom = (chat: ChatContact, specificRoom?: VoiceRoom | null) => {
    const activeRoom = specificRoom || getContactActiveRoom(chat);
    const targetRoom: VoiceRoom = activeRoom || {
      id: chat.activeRoomId || `room_${chat.userId}`,
      title: chat.activeRoomTitle || `غرفة ${chat.name}`,
      announcement: `أهلاً بك في غرفة ${chat.name}!`,
      hostId: chat.userId,
      hostName: chat.name,
      hostAvatar: chat.avatar,
      category: 'غرف شائعة',
      tag: 'صوت',
      level: 1,
      rank: 1,
      listenersCount: 120,
      backgroundUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
      seats: [],
      messages: []
    };

    if (onOpenRoom) {
      onOpenRoom(targetRoom);
      showToast(`🎙️ جاري نقلك مباشرة إلى غرفة "${targetRoom.title}"... 🚀`);
    } else {
      showToast(`🎤 انضمام لغرفة "${targetRoom.title}"`);
    }
  };

  // Render GIF/Emoticons, Gifts, Attachments
  const GIFS_LIST = ['🔥', '💖', '👑', '🎉', '🌟', '🚀', '🎁', '🌹', '❤️', '😂', '👏', '😍'];
  const GIF_URLS = [
    'https://media.giphy.com/media/3o7TKsjN41iDfsu6M8/giphy.gif',
    'https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif',
    'https://media.giphy.com/media/l0HlA3iI7N6qTqPq8/giphy.gif'
  ];

  return (
    <div id="saleem-messages-system" dir={dir} className="space-y-3 text-start select-none">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 px-4 py-2 rounded-full font-black text-xs shadow-2xl border-2 border-yellow-300 animate-in fade-in slide-in-from-top duration-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 1: MESSAGES LIST VIEW (صفحة قائمة الرسائل) */}
      {/* ============================================================ */}
      {activeSubView === 'list' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-4 space-y-3 shadow-xl">
          {/* Top App Bar (الشريط العلوي) */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl text-slate-950 font-black shadow-md">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-base text-white">الرسائل والمحادثات 💬</h2>
                  <p className="text-[10px] text-slate-400">تواصل مباشر وآمن مع أصدقائك وكبار الشخصيات</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowCreateGroupModal(true)}
                className="px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/20 border border-amber-300/40"
              >
                <Users className="w-4 h-4" />
                <span>إنشاء غرفة جماعية</span>
              </button>
              <button
                type="button"
                onClick={() => showToast('⚙️ إعدادات الخصوصية والرسائل المباشرة')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs (التبويبات) */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTabFilter('all')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTabFilter === 'all'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>الرسائل كلها</span>
              <span className="bg-slate-900/60 px-2 py-0.5 rounded-full text-[10px]">
                {chats.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabFilter('unread')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTabFilter === 'unread'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>غير المقروءة</span>
              {totalUnreadCount > 0 && (
                <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                  {totalUnreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Search Bar (البحث أسفل التبويبات) */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 ابحث عن اسم، غرفة، أو محتوى رسالة..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Chats Cards List (قائمة بطاقات المحادثات) */}
          <div className="space-y-2 max-h-[62vh] overflow-y-auto pr-0.5">
            {filteredChats.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 p-6 space-y-2">
                <div className="text-4xl">📬</div>
                <h4 className="font-bold text-sm text-slate-300">
                  {activeTabFilter === 'unread' ? 'لا توجد رسائل غير مقروءة' : 'لا توجد محادثات مطابقة'}
                </h4>
                <p className="text-xs text-slate-500">
                  {activeTabFilter === 'unread'
                    ? 'لقد قرأت جميع الرسائل الواردة بانتظام!'
                    : 'جرب البحث باسم آخر أو ابدأ محادثة جديدة.'}
                </p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const contactRoom = getContactActiveRoom(chat);
                const isOnline = chat.isGroup ? true : presenceMap[chat.userId] ?? true;
                const isInRoom = Boolean(contactRoom || chat.activeRoomId);

                return (
                  <div
                    key={chat.id}
                    className={`group relative bg-slate-950 hover:bg-slate-900 border rounded-2xl p-3 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      chat.isPinned ? 'border-amber-500/40 bg-amber-500/[0.03]' : 'border-slate-800/80'
                    }`}
                  >
                    {/* Chat Left Side: Avatar + Details */}
                    <div
                      className="flex items-center gap-3 flex-1 min-w-0"
                      onClick={() => {
                        setSelectedChatId(chat.id);
                        setActiveSubView('chat');
                        // Mark as read
                        setChats(prev => prev.map(c => (c.id === chat.id ? { ...c, unreadCount: 0 } : c)));
                      }}
                    >
                      {/* Avatar with VIP Frame & Online Status & Room Soundwave Indicator */}
                      <div
                        className="relative cursor-pointer shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedChatForProfile(chat);
                        }}
                        title="انقر لفتح الملف الشخصي / تتبع للغرفة"
                      >
                        <div
                          className={`relative p-0.5 rounded-full ${
                            chat.vipLevel >= 8
                              ? 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 ring-2 ring-amber-400'
                              : 'ring-1 ring-slate-700'
                          }`}
                        >
                          <img
                            src={chat.avatar}
                            alt={chat.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        </div>

                        {/* Online Status Indicator (🟢 متصل الآن / ⚫ غير متصل) */}
                        <span
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                            isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                          }`}
                          title={isOnline ? 'متصل الآن' : 'غير متصل'}
                        />

                        {/* Voice Room Indicator (🎤 LIVE Badge when inside room) */}
                        {isInRoom && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTrackToRoom(chat, contactRoom);
                            }}
                            className="absolute -top-1.5 -left-1 bg-gradient-to-r from-purple-600 to-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-0.5 shadow-lg animate-pulse hover:scale-110 transition-transform cursor-pointer"
                            title={`داخل غرفة: ${contactRoom?.title || chat.activeRoomTitle} (انقر للدخول)`}
                          >
                            <Radio className="w-2.5 h-2.5 text-yellow-300 animate-spin" />
                            <span>LIVE</span>
                          </div>
                        )}
                      </div>

                      {/* Chat Details (Name, Badges, Last Msg) */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-xs text-white truncate">{chat.name}</h4>

                          {/* Country Flag */}
                          <span className="text-xs">{chat.countryFlag}</span>

                          {/* Verified Blue Check */}
                          {chat.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" title="حساب موثق" />
                          )}

                          {/* VIP Badge */}
                          {chat.vipLevel > 0 && (
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                              <span>VIP {chat.vipLevel}</span>
                            </span>
                          )}

                          {/* Moderator Badge */}
                          {chat.isModerator && (
                            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                              <Shield className="w-2.5 h-2.5 text-blue-400" />
                              <span>مشرف</span>
                            </span>
                          )}

                          {/* Room Owner Badge */}
                          {chat.isRoomOwner && (
                            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                              👑 مالك
                            </span>
                          )}
                        </div>

                        {/* Last Message Preview with Icon */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                          {chat.lastMsgType === 'gift' && <Gift className="w-3 h-3 text-amber-400 shrink-0" />}
                          {chat.lastMsgType === 'room' && <Radio className="w-3 h-3 text-purple-400 shrink-0" />}
                          {chat.lastMsgType === 'image' && <ImageIcon className="w-3 h-3 text-emerald-400 shrink-0" />}
                          {chat.lastMsgType === 'voice' && <Mic className="w-3 h-3 text-cyan-400 shrink-0" />}
                          <span className="truncate">{chat.lastMsg}</span>
                        </div>

                        {/* Online text status or room banner preview with Quick Jump Button */}
                        <div className="text-[9px] font-semibold flex items-center gap-1">
                          {contactRoom ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTrackToRoom(chat, contactRoom);
                              }}
                              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-950 border border-amber-400/60 hover:border-amber-300 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-pulse cursor-pointer hover:scale-105 transition-transform"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                              <span>🎙️ يبث الآن في: <strong>"{contactRoom.title}"</strong></span>
                              <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black">
                                انتقال 🚀
                              </span>
                            </button>
                          ) : isOnline ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              <span>متصل الآن</span>
                            </span>
                          ) : (
                            <span className="text-slate-500">{chat.lastSeenText || 'غير متصل'}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Chat Right Side: Time, Unread Badge & Options */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-500 font-mono">{chat.time}</span>

                      <div className="flex items-center gap-1">
                        {chat.isPinned && <Pin className="w-3 h-3 text-amber-400 fill-amber-400" title="مثبتة" />}
                        {chat.isMuted && <BellOff className="w-3 h-3 text-slate-500" title="مكتومة" />}
                        {chat.isFavorite && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" title="في المفضلة" />}

                        {/* Unread Message Count Badge */}
                        {chat.unreadCount > 0 && (
                          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-md animate-bounce">
                            {chat.unreadCount}
                          </span>
                        )}

                        {/* Options Menu Button (⋮) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedChatForMenu(chat);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 2: CHAT CONVERSATION SCREEN (شاشة المحادثة) */}
      {/* ============================================================ */}
      {activeSubView === 'chat' && activeChat && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-4 space-y-3 shadow-2xl flex flex-col h-[78vh] justify-between">
          {/* Chat Header (أعلى شاشة المحادثة) */}
          <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            {/* Header Left: Back + User Info */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setActiveSubView('list')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                title="الرجوع لقائمة الرسائل"
              >
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Avatar Click -> Enlarge Photo / Profile */}
              <div
                className="relative cursor-pointer shrink-0"
                onClick={() => setEnlargedAvatarUrl(activeChat.avatar)}
                title="انقر التكبير الصورة"
              >
                <img
                  src={activeChat.avatar}
                  alt={activeChat.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400"
                />
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${
                    activeUserPresence ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
              </div>

              {/* User Name & Sub-status Click -> Profile Sheet */}
              <div
                className="cursor-pointer min-w-0"
                onClick={() => setSelectedChatForProfile(activeChat)}
              >
                <div className="flex items-center gap-1 flex-wrap">
                  <h3 className="font-bold text-xs text-white truncate">{activeChat.name}</h3>
                  {activeChat.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />}
                  {activeChat.vipLevel > 0 && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-500/40">
                      VIP {activeChat.vipLevel}
                    </span>
                  )}
                </div>

                <div className="text-[10px] flex items-center gap-1 font-semibold">
                  {activeChat.isGroup ? (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Users className="w-3 h-3 text-amber-400" />
                      <span>غرفة جماعية ({activeChat.groupMembers?.length || 1}/100 عضو)</span>
                    </span>
                  ) : getContactActiveRoom(activeChat) ? (
                    <button
                      type="button"
                      onClick={() => handleTrackToRoom(activeChat, getContactActiveRoom(activeChat))}
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md animate-pulse hover:scale-105 transition-transform cursor-pointer border border-purple-300/40"
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                      <span>🎙️ يتحدث الآن داخل: <strong>{getContactActiveRoom(activeChat)?.title}</strong></span>
                      <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 rounded-full">متابعة 🚀</span>
                    </button>
                  ) : (
                    <>
                      <span className={`w-1.5 h-1.5 rounded-full ${activeUserPresence ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                      <span className="text-emerald-400">{activeUserPresence ? '🟢 متصل الآن' : 'غير متصل'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Header Right: Group Manage / Call Actions & Options */}
            <div className="flex items-center gap-1">
              {activeChat.isGroup && (
                <button
                  type="button"
                  onClick={() => setShowGroupManageModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  title="إدارة أعضاء المجموعة"
                >
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">إدارة الأعضاء</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveCall({
                    partner: {
                      id: activeChat.userId || activeChat.id,
                      name: activeChat.name,
                      avatar: activeChat.avatar,
                    },
                    isVideo: false,
                  });
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                title="اتصال صوتي HD"
              >
                <Phone className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCall({
                    partner: {
                      id: activeChat.userId || activeChat.id,
                      name: activeChat.name,
                      avatar: activeChat.avatar,
                    },
                    isVideo: true,
                  });
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                title="مكالمة فيديو خاصة"
              >
                <Video className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedChatForMenu(activeChat)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="خيارات المحادثة"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Banner: Active Voice Room Live Radar & Quick Jump (تتبع للغرفة إذا كان في غرفة) */}
          {(getContactActiveRoom(activeChat) || activeChat.activeRoomId) && (
            <div
              onClick={() => handleTrackToRoom(activeChat, getContactActiveRoom(activeChat))}
              className="bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-purple-950/90 border-2 border-amber-400/70 p-3 rounded-2xl flex items-center justify-between text-xs shadow-2xl animate-pulse cursor-pointer hover:border-amber-300 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/50 shadow group-hover:scale-110 transition-transform">
                  <Radio className="w-5 h-5 text-amber-400 animate-spin" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-300 font-black flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span>نبض الغرفة الحية:</span>
                    </span>
                    <span className="text-white font-bold">{activeChat.name} متواجد الآن داخل الغرفة</span>
                  </div>
                  <div className="text-[11px] text-purple-200 font-semibold mt-0.5">
                    الغرفة: <strong className="text-amber-300 font-black">"{getContactActiveRoom(activeChat)?.title || activeChat.activeRoomTitle}"</strong> ({getContactActiveRoom(activeChat)?.listenersCount || 142} مستمع 👥)
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1 hover:scale-105 active:scale-95 transition-transform shrink-0 cursor-pointer"
              >
                <span>متابعة وانتقال 🚀</span>
              </button>
            </div>
          )}

          {/* In-Chat Search Bar Overlay */}
          {showInChatSearch && (
            <div className="bg-slate-950 p-2 rounded-2xl border border-slate-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-400" />
              <input
                type="text"
                value={inChatSearchQuery}
                onChange={(e) => setInChatSearchQuery(e.target.value)}
                placeholder="ابحث في رسائل هذه المحادثة..."
                className="flex-1 bg-transparent text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowInChatSearch(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                إغلاق
              </button>
            </div>
          )}

          {/* Quick AI Assistant Questions Bar */}
          {(activeChat.userId === 'system_bot' || activeChat.id === 'chat_sys') && (
            <div className="py-1 px-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { label: '💎 كيف أسحب أرباحي؟', query: 'كيف أسحب أرباحي من التطبيق وما هي الشروط؟' },
                { label: '🪙 كيف أشحن العملات؟', query: 'كيف أقوم بشحن رصيد العملات وما هي وسائل الدفع؟' },
                { label: '🎙️ كيف أفتح غرفة صوتية؟', query: 'كيف أفتح وأدير غرفة صوتية وأتحكم بالمايكات؟' },
                { label: '🏢 كيف أنضم لوكالة مضيفين؟', query: 'كيف أنضم لوكالة مضيفين وما هو نظام الرواتب والتارجت؟' },
                { label: '👑 مميزات الـ VIP الملكية', query: 'ما هي مميزات مستويات الـ VIP والإطارات الفاخرة؟' },
                { label: '🎲 الألعاب والمسابقات', query: 'ما هي الألعاب المتوفرة في التطبيق مثل النرد والروليت؟' },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage('text', chip.query)}
                  className="shrink-0 px-3 py-1.5 rounded-full bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-200 hover:text-white text-[11px] font-bold active:scale-95 transition-all shadow-md cursor-pointer flex items-center gap-1"
                >
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Message Bubbles Container (فقاعات الرسائل) */}
          <div className="flex-1 my-2 overflow-y-auto space-y-3 p-2 bg-slate-950/70 rounded-2xl border border-slate-800/80">
            {activeChat.messages.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                لا توجد رسائل سابقة. ابدأ المحادثة الآن! 👋
              </div>
            ) : (
              activeChat.messages
                .filter(m => !inChatSearchQuery || (m.text && m.text.includes(inChatSearchQuery)))
                .map((msg) => {
                  const isMe = msg.senderId === 'me';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 group`}
                    >
                      {/* Replying Context snippet if exists */}
                      {msg.replyToText && (
                        <div className="text-[10px] bg-slate-800/80 text-amber-300 px-3 py-1 rounded-xl border-l-2 border-amber-400 max-w-xs truncate">
                          رد على: {msg.replyToText}
                        </div>
                      )}

                      <div className="relative max-w-[82%] sm:max-w-md">
                        <div
                          onClick={() => setSelectedMsgForAction(msg)}
                          className={`p-3 rounded-2xl text-xs space-y-1.5 shadow-md transition-transform active:scale-98 cursor-pointer ${
                            isMe
                              ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-bl-none'
                              : 'bg-slate-800 text-slate-100 rounded-br-none border border-slate-700'
                          }`}
                        >
                          {/* Text Message */}
                          {msg.text && (
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          )}

                          {/* Image Message */}
                          {msg.type === 'image' && msg.mediaUrl && (
                            <div className="rounded-xl overflow-hidden my-1">
                              <img
                                src={msg.mediaUrl}
                                alt="صورة"
                                className="w-full max-h-48 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEnlargedAvatarUrl(msg.mediaUrl || null);
                                }}
                              />
                            </div>
                          )}

                          {/* Voice Note Message */}
                          {msg.type === 'voice' && (
                            <div className="flex items-center gap-3 bg-black/30 p-2 rounded-xl">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showToast('▶️ تشغيل الرسالة الصوتية...');
                                }}
                                className="p-2 bg-amber-500 text-slate-950 rounded-full font-bold shadow hover:scale-105"
                              >
                                <Play className="w-3.5 h-3.5 fill-slate-950" />
                              </button>
                              <div className="flex-1 space-y-1">
                                <div className="h-2 bg-amber-500/30 rounded-full overflow-hidden flex items-center gap-0.5">
                                  <div className="h-full bg-amber-400 w-2/3 rounded-full animate-pulse" />
                                </div>
                                <span className="text-[9px] text-amber-200 font-mono block">
                                  🎵 تسجيل صوتي ({msg.audioDuration || '00:15'})
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Gift Message Card */}
                          {msg.type === 'gift' && (
                            <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/50 p-2.5 rounded-xl flex items-center gap-2.5">
                              <span className="text-3xl animate-bounce">{msg.giftIcon || '🎁'}</span>
                              <div>
                                <h5 className="font-black text-amber-300 text-xs">هدية فاخرة</h5>
                                <p className="text-[10px] text-white font-bold">{msg.giftName || 'هدية ملائكية'}</p>
                              </div>
                            </div>
                          )}

                          {/* Room Invite Card */}
                          {msg.type === 'room' && msg.roomData && (
                            <div className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border border-purple-400/50 p-3 rounded-xl space-y-2">
                              <div className="flex items-center gap-2">
                                <Radio className="w-4 h-4 text-yellow-300 animate-spin" />
                                <h5 className="font-bold text-xs text-white">{msg.roomData.title}</h5>
                              </div>
                              <p className="text-[10px] text-purple-200">المضيف: {msg.roomData.hostName}</p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTrackToRoom(activeChat);
                                }}
                                className="w-full bg-amber-500 text-slate-950 font-black text-xs py-1.5 rounded-xl shadow hover:bg-amber-400 transition-colors cursor-pointer"
                              >
                                🎤 انضمام للغرفة الآن
                              </button>
                            </div>
                          )}

                          {/* Reaction badge */}
                          {msg.reaction && (
                            <div className="absolute -bottom-2 -left-2 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded-full text-xs shadow-lg">
                              {msg.reaction}
                            </div>
                          )}
                        </div>

                        {/* Status & Timestamp */}
                        <div className={`flex items-center gap-1 text-[9px] text-slate-500 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span>{msg.timestamp}</span>
                          {isMe && (
                            <CheckCheck className={`w-3 h-3 ${msg.status === 'read' ? 'text-cyan-400' : 'text-slate-500'}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
            {/* AI Assistant Typing Indicator */}
            {isBotTyping && (activeChat.userId === 'system_bot' || activeChat.id === 'chat_sys') && (
              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-indigo-950 to-slate-900 rounded-2xl border border-indigo-500/40 text-xs text-indigo-300 w-fit shadow-lg animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="font-bold">مساعد سليم الذكي يكتب الإجابة... 🤖</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Replying Banner Preview */}
          {replyingMsg && (
            <div className="bg-slate-950 p-2 rounded-2xl border border-amber-500/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <CornerUpLeft className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-300 truncate">الرد على: {replyingMsg.text || 'مرفق'}</span>
              </div>
              <button
                type="button"
                onClick={() => setReplyingMsg(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* Voice Recorder Active Bar */}
          {isRecordingAudio && (
            <div className="bg-rose-950/80 border border-rose-500/50 p-3 rounded-2xl flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                <Mic className="w-5 h-5 text-rose-400 animate-bounce" />
                <span>جاري تسجيل صوتك... 00:{recordingSeconds.toString().padStart(2, '0')}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={stopRecordingAndSend}
                  className="px-3 py-1 bg-emerald-500 text-slate-950 text-xs font-black rounded-xl hover:bg-emerald-400"
                >
                  إرسال 🚀
                </button>
              </div>
            </div>
          )}

          {/* Attachment Quick Menu Popup */}
          {showAttachmentMenu && (
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 grid grid-cols-3 gap-3 animate-in slide-in-from-bottom duration-200">
              {/* Photo Button */}
              <button
                type="button"
                onClick={() => {
                  if (sentImagesCount === 0) {
                    handleSendMessage('image', 'صورة من المعرض 📸 (مجانية)', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80');
                    showToast('📸 تم إرسال الصورة الأولى بنجاح (مجاناً)!');
                  } else {
                    handleSendMessage('image', 'صورة من المعرض 📸 (تم خصم 500 عملة للبرنامج)', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80');
                    showToast('💰 تم خصم 500 عملة لصالح البرنامج مقابل إرسال هذه الصورة!');
                  }
                  setSentImagesCount(prev => prev + 1);
                  setShowAttachmentMenu(false);
                }}
                className="p-3 bg-slate-900 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/50 rounded-2xl flex flex-col items-center gap-1.5 text-xs text-amber-300 font-bold cursor-pointer transition-all active:scale-95 relative"
              >
                <span className={`absolute -top-2 -right-1 px-1.5 py-0.5 text-[9px] font-black rounded-full shadow ${
                  sentImagesCount === 0 ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                }`}>
                  {sentImagesCount === 0 ? 'مجاناً' : '500 🪙'}
                </span>
                <ImageIcon className="w-6 h-6 text-amber-400" />
                <span>صورة</span>
              </button>

              {/* Video Button */}
              <button
                type="button"
                onClick={() => {
                  if (sentVideosCount === 0) {
                    handleSendMessage('text', '🎬 مقطع فيديو مشارك (مجاني)');
                    showToast('🎬 تم إرسال مقطع الفيديو الأول بنجاح (مجاناً)!');
                  } else {
                    handleSendMessage('text', '🎬 مقطع فيديو مشارك (تم خصم 1000 عملة للبرنامج)');
                    showToast('💰 تم خصم 1000 عملة لصالح البرنامج مقابل إرسال الفيديو!');
                  }
                  setSentVideosCount(prev => prev + 1);
                  setShowAttachmentMenu(false);
                }}
                className="p-3 bg-slate-900 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-500/50 rounded-2xl flex flex-col items-center gap-1.5 text-xs text-cyan-300 font-bold cursor-pointer transition-all active:scale-95 relative"
              >
                <span className={`absolute -top-2 -right-1 px-1.5 py-0.5 text-[9px] font-black rounded-full shadow ${
                  sentVideosCount === 0 ? 'bg-emerald-500 text-slate-950' : 'bg-cyan-400 text-slate-950'
                }`}>
                  {sentVideosCount === 0 ? 'مجاناً' : '1000 🪙'}
                </span>
                <Film className="w-6 h-6 text-cyan-400" />
                <span>فيديو</span>
              </button>

              {/* Room Invite Button */}
              <button
                type="button"
                onClick={() => {
                  handleSendMessage('room', undefined, undefined, undefined, undefined, {
                    id: 'my_vip_room_01',
                    title: 'غرفة سـالـم الملكية 🎙️ VIP',
                    hostName: 'سالم (أنت)',
                    viewers: 188,
                  });
                  showToast('🎤 تم إرسال دعوة للانضمام إلى غرفتك بنجاح!');
                  setShowAttachmentMenu(false);
                }}
                className="p-3 bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/50 rounded-2xl flex flex-col items-center gap-1.5 text-xs text-rose-300 font-bold cursor-pointer transition-all active:scale-95 relative"
              >
                <Radio className="w-6 h-6 text-rose-400 animate-pulse" />
                <span>دعوة غرفة</span>
              </button>
            </div>
          )}

          {/* Emoji / GIF Selector Popup */}
          {showEmojiPicker && (
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-1">
                <span className="font-bold text-amber-300">اختر إيموجي أو ملصق</span>
                <button type="button" onClick={() => setShowEmojiPicker(false)}>✕</button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {GIFS_LIST.map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setMessageInput(prev => prev + emoji);
                    }}
                    className="p-2 text-xl hover:bg-slate-800 rounded-xl transition-transform active:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Gift Selector Popup */}
          {showGiftMenu && (
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-1">
                <span className="font-bold text-amber-300">أرسل هدية فاخرة في المحادثة 🎁</span>
                <button type="button" onClick={() => setShowGiftMenu(false)}>✕</button>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { name: 'وردة جورية', icon: '🌹', price: '100 عملة' },
                  { name: 'تاج VIP', icon: '👑', price: '1,000 عملة' },
                  { name: 'سيارة بوغاتي', icon: '🏎️', price: '5,000 عملة' },
                  { name: 'تنين أسطوري', icon: '🐉', price: '10,000 عملة' },
                ].map((g, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      handleSendMessage('gift', undefined, undefined, { name: g.name, icon: g.icon });
                      showToast(`🎁 تم إرسال ${g.name} بنجاح!`);
                    }}
                    className="p-2 bg-slate-900 border border-slate-800 rounded-2xl hover:border-amber-400 transition-all flex flex-col items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <span className="text-[10px] font-bold text-white">{g.name}</span>
                    <span className="text-[9px] text-amber-400 font-mono">{g.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Chat Input Bar (أسفل الشاشة) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage('text');
            }}
            className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800"
          >
            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowAttachmentMenu(false);
                setShowGiftMenu(false);
              }}
              className="p-2 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              title="الإيموجيات"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="اكتب رسالة..."
              className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />

            {/* Attachment Button (📎) */}
            <button
              type="button"
              onClick={() => {
                setShowAttachmentMenu(!showAttachmentMenu);
                setShowEmojiPicker(false);
                setShowGiftMenu(false);
              }}
              className="p-2 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              title="مرفقات"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Gift Store Selector Button (🎁) */}
            <button
              type="button"
              onClick={() => {
                setShowGiftMenu(!showGiftMenu);
                setShowAttachmentMenu(false);
                setShowEmojiPicker(false);
              }}
              className="p-2 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              title="إرسال هدية"
            >
              <Gift className="w-5 h-5 animate-pulse" />
            </button>

            {/* Microphone Button (Hold to record) */}
            <button
              type="button"
              onClick={startRecording}
              className="p-2 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
              title="تسجيل صوتي"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className={`p-2.5 rounded-xl font-bold transition-all ${
                messageInput.trim()
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md hover:scale-105 active:scale-95 cursor-pointer'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* USER PROFILE BOTTOM SHEET / MODAL (بطاقة الملف الشخصي + تتبع للغرفة) */}
      {/* ============================================================ */}
      {selectedChatForProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/30 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Sheet Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                <UserIcon className="w-4 h-4" />
                <span>بطاقة المستخدم الشخصية</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedChatForProfile(null)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Avatar & Primary Badges */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div
                className="relative cursor-pointer"
                onClick={() => setEnlargedAvatarUrl(selectedChatForProfile.avatar)}
              >
                <img
                  src={selectedChatForProfile.avatar}
                  alt={selectedChatForProfile.name}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-amber-400 shadow-xl"
                />
                <span
                  className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-slate-950 ${
                    (presenceMap[selectedChatForProfile.userId] ?? true) ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <h3 className="font-black text-base text-white">{selectedChatForProfile.name}</h3>
                  {selectedChatForProfile.isVerified && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  <span className="text-sm">{selectedChatForProfile.countryFlag}</span>
                </div>

                {/* VIP & Level Pills */}
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>VIP {selectedChatForProfile.vipLevel}</span>
                  </span>
                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                    المستوى {selectedChatForProfile.userLevel}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2 italic px-4">"{selectedChatForProfile.bio}"</p>
              </div>

              {/* Online / Offline status text */}
              <div className="text-xs font-bold">
                {(presenceMap[selectedChatForProfile.userId] ?? true) ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>متصل الآن</span>
                  </span>
                ) : (
                  <span className="text-slate-500">{selectedChatForProfile.lastSeenText || 'غير متصل حالياً'}</span>
                )}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-500 block">المتابِعون</span>
                <span className="font-black text-xs text-amber-300">{selectedChatForProfile.followers}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">المتابَعون</span>
                <span className="font-black text-xs text-white">{selectedChatForProfile.following}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">إجمالي الهدايا</span>
                <span className="font-black text-xs text-emerald-400">{selectedChatForProfile.giftsTotal}</span>
              </div>
            </div>

            {/* Key Feature: "تتبع إلى الغرفة" (Track / Join Room) Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleTrackToRoom(selectedChatForProfile)}
                className={`w-full py-2.5 px-4 rounded-2xl font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                  selectedChatForProfile.activeRoomId
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white animate-pulse border border-purple-300'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <Radio className="w-4 h-4 text-amber-300 animate-spin" />
                <span>
                  {selectedChatForProfile.activeRoomId
                    ? `📡 تتبع إلى الغرفة ("${selectedChatForProfile.activeRoomTitle}")`
                    : 'المستخدم غير موجود داخل أي غرفة حالياً'}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleFollowUser(selectedChatForProfile.id)}
                  className={`py-2 px-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedChatForProfile.isFollowing
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  }`}
                >
                  {selectedChatForProfile.isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>✓ تتم المتابعة</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>➕ متابعة</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedChatId(selectedChatForProfile.id);
                    setActiveSubView('chat');
                    setSelectedChatForProfile(null);
                  }}
                  className="py-2 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs hover:from-amber-400 hover:to-yellow-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>💬 إرسال رسالة</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 text-[10px] text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    showToast(`🚫 تم حظر ${selectedChatForProfile.name}`);
                    setSelectedChatForProfile(null);
                  }}
                  className="hover:text-rose-400 flex items-center gap-1"
                >
                  <UserX className="w-3 h-3" />
                  <span>حظر المستخدم</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    showToast(`⚠️ تم تقديم بلاغ عن الحساب بنجاح`);
                    setSelectedChatForProfile(null);
                  }}
                  className="hover:text-amber-400 flex items-center gap-1"
                >
                  <Flag className="w-3 h-3" />
                  <span>إبلاغ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CHAT OPTIONS & SWIPE ACTIONS POPUP MENU (قائمة خيارات المحادثة) */}
      {/* ============================================================ */}
      {selectedChatForMenu && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-xs text-white">خيارات المحادثة مع {selectedChatForMenu.name}</h4>
              <button type="button" onClick={() => setSelectedChatForMenu(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-200">
              <button
                type="button"
                onClick={() => handleTogglePin(selectedChatForMenu.id)}
                className="w-full p-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Pin className="w-4 h-4 text-amber-400" />
                <span>{selectedChatForMenu.isPinned ? 'إلغاء التثبيت 📌' : 'تثبيت المحادثة في الأعلى 📌'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleMute(selectedChatForMenu.id)}
                className="w-full p-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <BellOff className="w-4 h-4 text-purple-400" />
                <span>{selectedChatForMenu.isMuted ? 'إلغاء الكتم 🔔' : 'كتم الإشعارات 🔕'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleFavorite(selectedChatForMenu.id)}
                className="w-full p-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Star className="w-4 h-4 text-yellow-400" />
                <span>{selectedChatForMenu.isFavorite ? 'إزالة من المفضلة ⭐' : 'إضافة إلى المفضلة ⭐'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowInChatSearch(true);
                  setSelectedChatForMenu(null);
                }}
                className="w-full p-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4 text-cyan-400" />
                <span>بحث داخل المحادثة 🔍</span>
              </button>

              <button
                type="button"
                onClick={() => handleClearChatMessages(selectedChatForMenu.id)}
                className="w-full p-2.5 rounded-xl hover:bg-slate-800 text-yellow-300 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>مسح محتوى المحادثة 🧹</span>
              </button>

              <button
                type="button"
                onClick={() => handleDeleteChat(selectedChatForMenu.id)}
                className="w-full p-2.5 rounded-xl hover:bg-rose-500/20 text-rose-400 flex items-center gap-2 transition-colors cursor-pointer font-bold"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف المحادثة بالكامل 🗑️</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MESSAGE ACTION POPUP MENU (تفاصيل الرسالة: تفاعل، رد، نسخ...) */}
      {/* ============================================================ */}
      {selectedMsgForAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-300">خيارات الرسالة</span>
              <button type="button" onClick={() => setSelectedMsgForAction(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Emoji Reactions Bar */}
            <div className="flex items-center justify-around bg-slate-950 p-2 rounded-2xl border border-slate-800">
              {['❤️', '👍', '🔥', '😂', '😮', '🎁'].map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setChats(prev =>
                      prev.map(c => {
                        if (c.id === selectedChatId) {
                          const msgs = c.messages.map(m =>
                            m.id === selectedMsgForAction.id ? { ...m, reaction: emoji } : m
                          );
                          return { ...c, messages: msgs };
                        }
                        return c;
                      })
                    );
                    showToast(`تفاعلت بـ ${emoji}`);
                    setSelectedMsgForAction(null);
                  }}
                  className="text-xl hover:scale-125 transition-transform p-1 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Actions List */}
            <div className="space-y-1 text-xs text-slate-200">
              <button
                type="button"
                onClick={() => {
                  setReplyingMsg(selectedMsgForAction);
                  setSelectedMsgForAction(null);
                }}
                className="w-full p-2 rounded-xl hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <CornerUpLeft className="w-4 h-4 text-amber-400" />
                <span>رد على هذه الرسالة ↩️</span>
              </button>

              {selectedMsgForAction.text && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedMsgForAction.text || '');
                    showToast('📋 تم نسخ النص للحافظة');
                    setSelectedMsgForAction(null);
                  }}
                  className="w-full p-2 rounded-xl hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-cyan-400" />
                  <span>نسخ النص 📋</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  showToast('↗️ تم إعادة توجيه الرسالة بنجاح');
                  setSelectedMsgForAction(null);
                }}
                className="w-full p-2 rounded-xl hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-purple-400" />
                <span>إعادة توجيه ↗️</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setChats(prev =>
                    prev.map(c => {
                      if (c.id === selectedChatId) {
                        return { ...c, messages: c.messages.filter(m => m.id !== selectedMsgForAction.id) };
                      }
                      return c;
                    })
                  );
                  showToast('🗑️ تم حذف الرسالة');
                  setSelectedMsgForAction(null);
                }}
                className="w-full p-2 rounded-xl hover:bg-rose-500/20 text-rose-400 flex items-center gap-2 cursor-pointer font-bold"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف الرسالة 🗑️</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CREATE GROUP CHAT MODAL (إنشاء غرفة جماعية ودعوة مشاركين) */}
      {/* ============================================================ */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in zoom-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl text-slate-950 font-black">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">إنشاء غرفة جماعية 👥</h3>
                  <p className="text-[10px] text-slate-400">أضف حتى 100 عضو عن طريق معرف ID وشكل مجموعتك</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateGroupModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Group Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-300 block">عنوان المجموعة الجماعية:</label>
              <input
                type="text"
                value={groupTitleInput}
                onChange={(e) => setGroupTitleInput(e.target.value)}
                placeholder="أدخل اسم المجموعة (مثال: نخب الشرقية 🌟)"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/60"
              />
            </div>

            {/* Invite Participants Section (دعوة مشاركين) */}
            <div className="space-y-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  <span>دعوة مشاركين بالمُعرّف (ID)</span>
                </span>
                <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {groupParticipants.length} / 100 عضو
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inviteUserIdInput}
                  onChange={(e) => setInviteUserIdInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddParticipantById();
                    }
                  }}
                  placeholder="أدخل معرف ID الشخص (مثال: 88219 أو user_khaled)..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddParticipantById()}
                  disabled={groupParticipants.length >= 100}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  + إضافة
                </button>
              </div>

              {/* Quick Invite Suggestions from Followed Friends */}
              <div className="pt-1">
                <span className="text-[10px] text-slate-400 block mb-1 font-semibold">الأصدقاء المتابعون (انقر للإضافة المباشرة):</span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {chats
                    .filter((c) => !c.isGroup && c.userId !== 'system_bot')
                    .map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleAddParticipantById(c.userId)}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-amber-500 rounded-xl text-[10px] text-slate-200 flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
                      >
                        <img src={c.avatar} alt={c.name} className="w-4 h-4 rounded-full object-cover" />
                        <span className="font-bold">{c.name}</span>
                        <span className="text-amber-400 font-mono text-[9px]">+</span>
                      </button>
                    ))}
                  {chats.filter((c) => !c.isGroup && c.userId !== 'system_bot').length === 0 && (
                    <span className="text-[10px] text-slate-500">لا يوجد أصدقاء متابعون بعد، يمكنك إدخال الـ ID أعلاه</span>
                  )}
                </div>
              </div>
            </div>

            {/* List of Added Participants */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">المشاركون المضافون بالمجموعة:</span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {groupParticipants.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between bg-slate-950 p-2 rounded-2xl border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-400/50 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-white truncate">{member.name}</span>
                          {member.role === 'owner' && (
                            <span className="bg-amber-500/20 text-amber-300 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-amber-500/40">
                              صاحب المجموعة 👑
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono block">ID: {member.userId}</span>
                      </div>
                    </div>

                    {member.id !== 'me' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(member.id)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1"
                        title="إزالة العضو"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>إزالة</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Create Button */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateGroupModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateGroup}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Users className="w-4 h-4" />
                <span>إنشاء وتأكيد المجموعة 🎉</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* GROUP MANAGEMENT MODAL (إدارة الأعضاء والتحكم لصاحب المجموعة) */}
      {/* ============================================================ */}
      {showGroupManageModal && activeChat && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in zoom-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl text-slate-950 font-black">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">إدارة أعضاء المجموعة 🛡️</h3>
                  <p className="text-[10px] text-amber-300 font-bold">
                    {activeChat.groupOwnerId === 'me' ? 'أنت صاحب وصانع هذه المجموعة 👑' : 'عضو بالمجموعة'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGroupManageModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Owner Privilege: Add new participant by ID */}
            {activeChat.groupOwnerId === 'me' && (
              <div className="space-y-2 bg-slate-950 p-3 rounded-2xl border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white flex items-center gap-1">
                    <UserPlus className="w-4 h-4 text-amber-400" />
                    <span>دعوة مشارك جديد بالمُعرّف (ID)</span>
                  </span>
                  <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                    {(activeChat.groupMembers?.length || 0)} / 100 عضو
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={addMemberIdInGroupInput}
                    onChange={(e) => setAddMemberIdInGroupInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMemberToExistingGroup(activeChat.id);
                      }
                    }}
                    placeholder="أدخل معرف ID العضو المطلوب إضافته..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddMemberToExistingGroup(activeChat.id)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow cursor-pointer transition-all shrink-0"
                  >
                    + دعوة
                  </button>
                </div>
              </div>
            )}

            {/* Members List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">قائمة الأعضاء الحاليين ({activeChat.groupMembers?.length || 0}):</span>
                {activeChat.groupOwnerId === 'me' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleClearChatMessages(activeChat.id);
                      setShowGroupManageModal(false);
                    }}
                    className="text-[10px] text-rose-400 hover:text-rose-300 bg-rose-500/10 px-2 py-1 rounded-xl border border-rose-500/30 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>حذف جميع الرسائل</span>
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {(activeChat.groupMembers || []).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-400/50 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-white truncate">{m.name}</span>
                          {m.role === 'owner' && (
                            <span className="bg-amber-500/20 text-amber-300 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-amber-500/40">
                              صاحب المجموعة 👑
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono block">ID: {m.userId}</span>
                      </div>
                    </div>

                    {/* Owner Action: Remove Member */}
                    {activeChat.groupOwnerId === 'me' && m.id !== 'me' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMemberFromGroup(activeChat.id, m.id)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1 border border-rose-500/30"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>إزالة عضو</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => setShowGroupManageModal(false)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ENLARGED AVATAR MODAL (تكبير الصورة بالحجم الكامل) */}
      {/* ============================================================ */}
      {enlargedAvatarUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in zoom-in duration-200"
          onClick={() => setEnlargedAvatarUrl(null)}
        >
          <div className="relative max-w-md w-full">
            <img
              src={enlargedAvatarUrl}
              alt="صورة شخصية مكبرة"
              className="w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl ring-2 ring-amber-400"
            />
            <span className="absolute top-3 right-3 text-white text-xs bg-black/60 px-3 py-1 rounded-full">
              انقر لإغلاق الصورة ✕
            </span>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PRIVATE CALL MODAL (مكالمة صوتية أو فيديو خاصة) */}
      {/* ============================================================ */}
      {activeCall && (
        <PrivateCallModal
          user={myProfile}
          partner={activeCall.partner}
          isVideo={activeCall.isVideo}
          onEndCall={() => {
            setActiveCall(null);
            showToast('📞 تم إنهاء المكالمة بنجاح');
          }}
        />
      )}
    </div>
  );
};
