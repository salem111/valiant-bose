import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser
} from 'agora-rtc-sdk-ng';
import { UserProfile, GiftItem } from '../types';
import { MOCK_GIFTS } from '../data/mockData';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  RotateCcw,
  X,
  Send,
  Gift,
  Heart,
  Users,
  Swords,
  Crown,
  Sparkles,
  Shield,
  Coins,
  MessageSquare,
  Play,
  Square,
  Sliders,
  Wand2,
  Smile,
  Check,
  Sun,
  Eye,
  Maximize2,
  Radio,
  Plus,
  UserCheck,
  UserX,
  CheckCircle2,
  XCircle,
  Trophy,
  Settings,
  AlertTriangle,
  Share2,
  VolumeX,
  Volume2
} from 'lucide-react';
import {
  LiveStreamData,
  JoinRequestData,
  ChallengeRequestData,
  saveLiveStreamToFirebase,
  listenToLiveStreamsFromFirebase,
  endLiveStreamInFirebase,
  sendJoinRequestInFirebase,
  listenToJoinRequestsInFirebase,
  respondToJoinRequestInFirebase,
  sendChallengeRequestInFirebase,
  listenToIncomingChallengeRequests,
  respondToChallengeRequestInFirebase,
  listenToChallengeRequestStatus,
  updateLiveStreamInFirebase
} from '../lib/firebase';
import { fetchAgoraRtcToken } from '../utils/agoraToken';
import { getAgoraNumericUid } from '../lib/agoraVoiceManager';
import { requestCameraPermissionUnified, requestMicrophonePermissionUnified } from '../lib/permissions';
import { useI18n } from '../lib/i18n';

interface LiveStreamModalProps {
  user: UserProfile;
  initialStream?: LiveStreamData | null;
  onClose: () => void;
  onSendGift?: (gift: GiftItem, recipientName: string) => void;
  onOpenCoinStore?: () => void;
}

interface LiveComment {
  id: string;
  senderName: string;
  senderAvatar: string;
  senderVip?: number;
  text: string;
  timestamp: string;
  isGift?: boolean;
  giftIcon?: string;
  giftName?: string;
}

interface FloatingHeart {
  id: number;
  x: number;
  color: string;
}

const AGORA_APP_ID = (import.meta as any).env?.VITE_AGORA_APP_ID || "2bea0d6dbd304f6c9517215542b9aec1";

export const LiveStreamModal: React.FC<LiveStreamModalProps> = ({
  user,
  initialStream,
  onClose,
  onSendGift,
  onOpenCoinStore
}) => {
  const { t, dir } = useI18n();
  // Stream & Hardware States
  const isHost = !initialStream || initialStream.ownerId === user.id;
  const streamId = initialStream ? initialStream.streamId : `stream_${user.id}_${Date.now()}`;
  const agoraChannelName = initialStream?.streamId || streamId;

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // مؤشر مستوى الصوت الحقيقي

  // Stream Quality State
  const [streamQuality, setStreamQuality] = useState<'1080p' | '720p' | '480p' | '360p'>('720p');
  const [streamFps, setStreamFps] = useState<30 | 60>(30);
  const [showQualityModal, setShowQualityModal] = useState(false);

  // Filters & Retouching
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [filterSheetTab, setFilterSheetTab] = useState<'retouch' | 'color' | 'ar'>('retouch');
  const [smoothing, setSmoothing] = useState(65); // تنعيم البشرة
  const [brightening, setBrightening] = useState(45); // تفتيح وإضاءة
  const [rosyCheeks, setRosyCheeks] = useState(35); // توريد الخدود والشفاه
  const [sharpness, setSharpness] = useState(25); // حدة ونقاء الملامح
  const [colorPreset, setColorPreset] = useState<
    'none' | 'beauty' | 'warm' | 'cool' | 'vintage' | 'bw' | 'cinematic' | 'sunset' | 'royal_neon' | 'soft_glow'
  >('beauty');
  const [activeArMask, setActiveArMask] = useState<'none' | 'crown' | 'glasses' | 'cat' | 'halo' | 'stars' | 'cyber'>('none');

  // Stats & Overlays (Starts at zero for real live counting)
  const [viewerCount, setViewerCount] = useState(initialStream ? (initialStream.viewers || 0) : 0);
  const [likesCount, setLikesCount] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [showGiftSelector, setShowGiftSelector] = useState(false);

  // Co-Host & Join Requests
  const [isCoHostActive, setIsCoHostActive] = useState(Boolean(initialStream?.hasGuest));
  const [isGuestMuted, setIsGuestMuted] = useState(false);
  const [guestUser, setGuestUser] = useState<{ id: string; name: string; avatar: string } | null>(
    initialStream?.guestName ? { id: initialStream.guestId || 'guest', name: initialStream.guestName, avatar: initialStream.guestPhoto || '' } : null
  );
  const [joinRequests, setJoinRequests] = useState<JoinRequestData[]>([]);
  const [showJoinRequestsSheet, setShowJoinRequestsSheet] = useState(false);

  // PK Challenge State (Strict Real Users Only)
  const [showPkMode, setShowPkMode] = useState(false);
  const [showNoOpponentModal, setShowNoOpponentModal] = useState(false);
  const [showPkConfigModal, setShowPkConfigModal] = useState(false);
  const [pkDurationSetting, setPkDurationSetting] = useState<180 | 300 | 600>(300); // 3m, 5m, 10m
  const [showFindBroadcastersModal, setShowFindBroadcastersModal] = useState(false);
  const [activeLiveStreamsList, setActiveLiveStreamsList] = useState<LiveStreamData[]>([]);
  const [incomingChallengeReqs, setIncomingChallengeReqs] = useState<ChallengeRequestData[]>([]);
  const [pkOpponent, setPkOpponent] = useState<{ id: string; name: string; avatar: string } | null>(null);
  const [pkHostPoints, setPkHostPoints] = useState(0);
  const [pkChallengerPoints, setPkChallengerPoints] = useState(0);
  const [pkCountdown, setPkCountdown] = useState(300);
  const [sparkImpact, setSparkImpact] = useState(false);
  const [pkWinner, setPkWinner] = useState<'host' | 'challenger' | null>(null);
  const [showPunishmentWheel, setShowPunishmentWheel] = useState(false);
  const [selectedPunishment, setSelectedPunishment] = useState<string | null>(null);

  // Comments & Hearts (Starts clean without fake dummy users)
  const [comments, setComments] = useState<LiveComment[]>([
    { 
      id: 'c1', 
      senderName: 'نظام SALEEM 👑', 
      senderAvatar: '', 
      text: `أهلاً بك في البث المباشر لـ ${initialStream?.ownerName || user.name}! ابدأ الدردشة أو شارك الهدايا. ✨`, 
      timestamp: 'الآن' 
    },
  ]);
  const [inputComment, setInputComment] = useState('');
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);

  // Refs & Instances
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const agoraClientRef = useRef<IAgoraRTCClient | null>(null);
  const cameraTrackRef = useRef<ICameraVideoTrack | null>(null);
  const micTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const commentsEndRef = useRef<HTMLDivElement | null>(null);

  // Toast State
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  // Scroll comments
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  // Timer for PK Battle Countdown (5 Minutes)
  useEffect(() => {
    let timer: any;
    if (showPkMode && pkCountdown > 0) {
      timer = setInterval(() => {
        setPkCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            const winner = pkHostPoints >= pkChallengerPoints ? 'host' : 'challenger';
            setPkWinner(winner);
            showToast(winner === 'host' ? '🎉 انتهى التحدي برياضتك بالفوز بالتاج الذهبي!' : '🏁 انتهى التحدي بنتيجة الجولة!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showPkMode, pkCountdown, pkHostPoints, pkChallengerPoints]);

  const totalPkPoints = pkHostPoints + pkChallengerPoints;
  const pkHostPct = totalPkPoints === 0 ? 50 : Math.round((pkHostPoints / totalPkPoints) * 100);
  const pkChallengerPct = 100 - pkHostPct;

  // Host-only camera preview. Viewers must NOT open getUserMedia: doing so can
  // lock the Android camera/microphone and compete with Agora tracks.
  useEffect(() => {
    if (!isHost) return;
    let mounted = true;
    async function initPreview() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (mounted) {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch(() => {});
          }
        } else {
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (err) {
        console.warn('Camera preview unavailable:', err);
      }
    }
    initPreview();
    return () => {
      mounted = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [isHost]);

  // Viewer path: join Agora as audience and subscribe to the broadcaster's
  // audio/video. Previously viewers never joined Agora, so they could see the
  // Firebase live card but receive no real audio/video.
  useEffect(() => {
    if (isHost || !initialStream?.isLive || !user.id) return;
    let disposed = false;
    const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
    agoraClientRef.current = client;

    const handlePublished = async (remoteUser: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      try {
        await client.subscribe(remoteUser, mediaType);
        if (disposed) return;
        if (mediaType === 'audio') {
          remoteUser.audioTrack?.setVolume(100);
          remoteUser.audioTrack?.play();
        } else if (mediaType === 'video' && remoteUser.videoTrack && remoteVideoRef.current) {
          remoteUser.videoTrack.play(remoteVideoRef.current);
        }
      } catch (error) {
        console.error('[LiveStream] Failed to subscribe to remote track:', mediaType, error);
      }
    };

    const handleUnpublished = (remoteUser: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      if (mediaType === 'video' && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    };

    client.on('user-published', handlePublished);
    client.on('user-unpublished', handleUnpublished);

    (async () => {
      try {
        const uid = getAgoraNumericUid(user.id);
        const token = await fetchAgoraRtcToken(agoraChannelName, uid, 'subscriber');
        if (!token || disposed) throw new Error('تعذر إصدار توكن المشاهدة');
        await client.setClientRole('audience', { level: 1 });
        await client.join(AGORA_APP_ID, agoraChannelName, token, uid);

        // Tracks published before the event listeners/join can still be present.
        for (const remoteUser of client.remoteUsers) {
          if (remoteUser.hasAudio) await handlePublished(remoteUser, 'audio');
          if (remoteUser.hasVideo) await handlePublished(remoteUser, 'video');
        }
      } catch (error) {
        console.error('[LiveStream] Viewer Agora join failed:', error);
        if (!disposed) showToast('تعذر الاتصال بصوت وفيديو البث المباشر');
      }
    })();

    return () => {
      disposed = true;
      client.off('user-published', handlePublished);
      client.off('user-unpublished', handleUnpublished);
      void client.leave().catch(() => {});
      if (agoraClientRef.current === client) agoraClientRef.current = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    };
  }, [isHost, initialStream?.isLive, initialStream?.streamId, user.id, agoraChannelName]);

  // Publish / Sync Live Stream to Firebase
  useEffect(() => {
    if (isHost && isBroadcasting) {
      saveLiveStreamToFirebase({
        streamId,
        ownerId: user.id,
        ownerName: user.name,
        ownerPhoto: user.avatar,
        wealthLevel: user.wealthLevel || 30,
        vipLevel: user.vipLevel || 5,
        channelName: agoraChannelName,
        title: `${user.name} - بث مباشر وتحديات PK 🔥`,
        isLive: true,
        viewers: viewerCount,
        hasGuest: isCoHostActive,
        guestId: guestUser?.id,
        guestName: guestUser?.name,
        guestPhoto: guestUser?.avatar,
        updatedAt: Date.now(),
      });
    }
  }, [isBroadcasting, viewerCount, isCoHostActive, guestUser]);

  // Listen to incoming Join Requests for Host
  useEffect(() => {
    if (isHost && streamId) {
      const unsub = listenToJoinRequestsInFirebase(streamId, (reqs) => {
        setJoinRequests(reqs);
      });
      return () => {
        if (typeof unsub === 'function') unsub();
      };
    }
  }, [isHost, streamId]);

  // Listen to active streams list for PK challenge menu
  useEffect(() => {
    const unsub = listenToLiveStreamsFromFirebase((streams) => {
      setActiveLiveStreamsList(streams.filter((s) => s.ownerId !== user.id));
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [user.id]);

  // Listen to incoming PK challenge invitations for user
  useEffect(() => {
    if (user.id) {
      const unsub = listenToIncomingChallengeRequests(user.id, (reqs) => {
        setIncomingChallengeReqs(reqs);
      });
      return () => {
        if (typeof unsub === 'function') unsub();
      };
    }
  }, [user.id]);

  // CSS Filters & Real-time Beauty Matrix
  const getVideoFilterStyle = () => {
    // 1. Brightening & Glow
    const brightFactor = 1 + (brightening / 100) * 0.35;
    
    // 2. Contrast & Clarity
    const contrastFactor = 1 + (sharpness / 100) * 0.15;

    // 3. Rosy cheeks saturation
    const rosySaturation = 1 + (rosyCheeks / 100) * 0.25;

    // 4. Color Preset Calculations
    let presetFilter = '';
    switch (colorPreset) {
      case 'beauty':
        presetFilter = 'saturate(118%) contrast(106%) hue-rotate(-3deg)';
        break;
      case 'soft_glow':
        presetFilter = 'saturate(110%) contrast(102%) brightness(105%)';
        break;
      case 'warm':
        presetFilter = 'sepia(18%) saturate(130%) hue-rotate(-8deg) contrast(105%)';
        break;
      case 'cool':
        presetFilter = 'saturate(115%) hue-rotate(18deg) contrast(110%)';
        break;
      case 'sunset':
        presetFilter = 'sepia(25%) saturate(145%) hue-rotate(-15deg) contrast(112%)';
        break;
      case 'cinematic':
        presetFilter = 'contrast(125%) saturate(125%) brightness(96%) hue-rotate(5deg)';
        break;
      case 'royal_neon':
        presetFilter = 'contrast(135%) saturate(160%) hue-rotate(25deg)';
        break;
      case 'vintage':
        presetFilter = 'sepia(40%) contrast(115%) brightness(92%) saturate(90%)';
        break;
      case 'bw':
        presetFilter = 'grayscale(100%) contrast(130%) brightness(105%)';
        break;
      default:
        presetFilter = '';
        break;
    }

    return {
      filter: `brightness(${brightFactor}) contrast(${contrastFactor}) saturate(${rosySaturation}) ${presetFilter}`,
    };
  };

  // Flip Front/Back Camera
  const handleToggleFacingMode = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);

    // Stop existing mediaStream tracks to prevent memory leak
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (cameraTrackRef.current) {
      try {
        cameraTrackRef.current.stop();
        cameraTrackRef.current.close();

        const newCameraTrack = await AgoraRTC.createCameraVideoTrack({
          facingMode: newFacingMode
        });
        cameraTrackRef.current = newCameraTrack;

        if (agoraClientRef.current && (agoraClientRef.current as any).connectionState === 'CONNECTED') {
          await agoraClientRef.current.unpublish();
          const tracksToPublish = micTrackRef.current
            ? [micTrackRef.current, newCameraTrack]
            : [newCameraTrack];
          await agoraClientRef.current.publish(tracksToPublish);
        }

        if (videoRef.current) {
          newCameraTrack.play(videoRef.current);
        }
        showToast(`🔄 تم التبديل إلى الكاميرا ${newFacingMode === 'user' ? 'الأمامية 🤳' : 'الخلفية 📷'}`);
        return;
      } catch (e) {
        console.warn('Agora camera track switch error, fallback to getUserMedia:', e);
      }
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: isMicOn,
      });
      mediaStreamRef.current = newStream;
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      showToast(`🔄 تم التبديل إلى الكاميرا ${newFacingMode === 'user' ? 'الأمامية 🤳' : 'الخلفية 📷'}`);
    } catch (err) {
      showToast('تعذر تبديل الكاميرا');
    }
  };

  // Toggle Camera
  const handleToggleCamera = async () => {
    const nextState = !isCameraOn;
    setIsCameraOn(nextState);

    if (cameraTrackRef.current) {
      await cameraTrackRef.current.setEnabled(nextState);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }
    showToast(nextState ? '📹 تم تشغيل الكاميرا' : '📷 تم إيقاف الكاميرا');
  };

  // Toggle Mic
  const handleToggleMic = async () => {
    const nextState = !isMicOn;
    setIsMicOn(nextState);

    if (micTrackRef.current) {
      await micTrackRef.current.setEnabled(nextState);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }
    showToast(nextState ? '🎙️ تم تشغيل الميكروفون' : '🔇 تم كتم الميكروفون');
  };

  // Start Live Broadcast Session
  const handleStartBroadcast = async () => {
    setIsConnecting(true);
    try {
      const [microphonePermission, cameraPermission] = await Promise.all([
        requestMicrophonePermissionUnified(),
        requestCameraPermissionUnified(),
      ]);
      if (!microphonePermission.granted || !cameraPermission.granted) {
        throw new Error(microphonePermission.error || cameraPermission.error || 'تعذر الحصول على صلاحيات البث');
      }

      // Release the preview camera before Agora opens the real publishing track.
      // Keeping two camera captures alive is a common Android/WebView cause of
      // silent/black tracks and failed publications.
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }

      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      agoraClientRef.current = client;

      await client.setClientRole('host');

      client.on('user-published', async (remoteUser: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        await client.subscribe(remoteUser, mediaType);
        if (mediaType === 'audio') {
          remoteUser.audioTrack?.play();
        }
      });

      client.on('user-joined', () => {
        setViewerCount((prev) => prev + 1);
      });

      client.on('user-left', () => {
        setViewerCount((prev) => Math.max(1, prev - 1));
      });

      const uid = getAgoraNumericUid(user.id);
      const dynamicToken = await fetchAgoraRtcToken(agoraChannelName, uid, 'publisher');
      if (!dynamicToken) {
        throw new Error('تعذر إصدار توكن البث الآمن. تحقق من اتصال خدمة الصوت وتسجيل الدخول.');
      }
      await client.join(AGORA_APP_ID, agoraChannelName, dynamicToken, uid);

      try {
        const [micTrack, cameraTrack] = await Promise.all([
          AgoraRTC.createMicrophoneAudioTrack(),
          AgoraRTC.createCameraVideoTrack({ encoderConfig: '720p_1' })
        ]);

        micTrackRef.current = micTrack;
        cameraTrackRef.current = cameraTrack;

        if (videoRef.current) {
          cameraTrack.play(videoRef.current);
        }

        if (agoraClientRef.current && (agoraClientRef.current as any).connectionState === 'CONNECTED') {
          await agoraClientRef.current.publish([micTrack, cameraTrack]);

          // تفعيل مراقبة مستوى الصوت للتأكد أن الميكروفون يلتقط الصوت فعلاً
          agoraClientRef.current.enableAudioVolumeIndicator();
          agoraClientRef.current.on("volume-indicator", (volumes) => {
            volumes.forEach((volume) => {
              if (volume.uid === 0 || (agoraClientRef.current && volume.uid === agoraClientRef.current.uid)) {
                setAudioLevel(volume.level);
              }
            });
          });
        }
      } catch (trackErr) {
        console.error('Agora track publish failed:', trackErr);
        throw new Error('تعذر تشغيل صوت وكاميرا البث عبر Agora');
      }

      setIsBroadcasting(true);
      setIsConnecting(false);
      showToast('🚀 بدأ البث المباشر الحقيقي!');
    } catch (error) {
      console.error('Live broadcast start failed:', error);
      await cleanupResources();
      setIsBroadcasting(false);
      setIsConnecting(false);
      showToast(error instanceof Error ? error.message : 'تعذر بدء البث المباشر.');
    }
  };

  // Stop Broadcast Session
  const handleStopBroadcast = async () => {
    if (isHost) {
      endLiveStreamInFirebase(streamId);
    }
    cleanupResources();
    setIsBroadcasting(false);
    showToast('🛑 تم إيقاف البث المباشر');
  };

  const cleanupResources = async () => {
    // 1. Unpublish and stop microphone safely
    try {
      if (micTrackRef.current && agoraClientRef.current) {
        // نستخدم try/catch للـ unpublish لضمان استمرار التنظيف حتى لو فشل الاتصال
        try {
          await agoraClientRef.current.unpublish([micTrackRef.current]);
        } catch (unpubErr) {
          console.warn('Agora unpublish failed during cleanup:', unpubErr);
        }
      }
    } finally {
      // التنظيف الكامل للميكروفون بغض النظر عن نجاح أو فشل unpublish
      if (micTrackRef.current) {
        micTrackRef.current.stop();
        micTrackRef.current.close();
        micTrackRef.current = null;
      }
    }

    // 2. Clean up other resources
    try {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
      if (cameraTrackRef.current) {
        cameraTrackRef.current.stop();
        cameraTrackRef.current.close();
        cameraTrackRef.current = null;
      }
      if (agoraClientRef.current) {
        await agoraClientRef.current.leave();
        agoraClientRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      setAudioLevel(0);
    } catch (e) {
      console.log('General cleanup error:', e);
    }
  };

  // Send Join Request as Viewer
  const handleSendJoinSeatRequest = async () => {
    const success = await sendJoinRequestInFirebase(streamId, {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
    });
    if (success) {
      showToast('✉️ تم إرسال طلب الصعود للمالك بنجاح!');
    }
  };

  // Accept / Reject Join Request as Host
  const handleRespondToJoinReq = async (req: JoinRequestData, accept: boolean) => {
    await respondToJoinRequestInFirebase(streamId, req.userId, accept ? 'accepted' : 'rejected');
    if (accept) {
      setIsCoHostActive(true);
      setGuestUser({ id: req.userId, name: req.username, avatar: req.photo });
      showToast(`✅ تم قبول انضمام ${req.username} وتقسيم الشاشة!`);
    } else {
      showToast(`❌ تم رفض طلب انضمام ${req.username}`);
    }
    setShowJoinRequestsSheet(false);
  };

  // Send PK Invitation to Broadcaster
  const handleInviteBroadcasterForPk = async (targetStream: LiveStreamData) => {
    const reqId = await sendChallengeRequestInFirebase(
      { id: user.id, name: user.name, avatar: user.avatar, streamId },
      { id: targetStream.ownerId, name: targetStream.ownerName, avatar: targetStream.ownerPhoto, streamId: targetStream.streamId }
    );

    if (reqId) {
      setShowFindBroadcastersModal(false);
      showToast(`⚔️ تم إرسال دعوة التحدي المباشر لـ ${targetStream.ownerName}!`);
    }
  };

  // Respond to Incoming PK Challenge Request
  const handleRespondToChallengeReq = async (req: ChallengeRequestData, accept: boolean) => {
    await respondToChallengeRequestInFirebase(req.requestId, accept ? 'accepted' : 'rejected');

    if (accept) {
      setPkOpponent({ id: req.senderId, name: req.senderName, avatar: req.senderPhoto });
      setShowPkMode(true);
      setIsCoHostActive(true);
      setPkCountdown(300); // 5 minutes
      setPkWinner(null);
      showToast(`⚔️ تم قبول التحدي المباشر ضد ${req.senderName}! بدأت الجولة 🔥`);
    } else {
      showToast(`❌ تم رفض دعوة التحدي`);
    }

    setIncomingChallengeReqs((prev) => prev.filter((r) => r.requestId !== req.requestId));
  };

  // Send Comment
  const handleSendComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputComment.trim()) return;

    const newComment: LiveComment = {
      id: `comment-${Date.now()}`,
      senderName: user.name,
      senderAvatar: user.avatar,
      senderVip: user.vipLevel,
      text: inputComment.trim(),
      timestamp: 'الآن',
    };

    setComments((prev) => [...prev, newComment]);
    setInputComment('');
  };

  // Send Gift
  const handleSendGiftInStream = (gift: GiftItem) => {
    if (user.coins < gift.priceCoins) {
      showToast('⚠️ رصيد العملات غير كافٍ! جاري فتح متجر العملات...');
      if (onOpenCoinStore) onOpenCoinStore();
      return;
    }

    if (onSendGift) {
      onSendGift(gift, user.name);
    }

    setEarnedCoins((prev) => prev + gift.priceCoins);

    if (showPkMode) {
      const pts = gift.priceCoins * 10;
      setPkHostPoints((prev) => prev + pts);
      setSparkImpact(true);
      setTimeout(() => setSparkImpact(false), 900);
    }

    setComments((prev) => [
      ...prev,
      {
        id: `gift-${Date.now()}`,
        senderName: user.name,
        senderAvatar: user.avatar,
        senderVip: user.vipLevel,
        text: `أرسل هدية ${gift.name} ${gift.icon}`,
        timestamp: 'الآن',
        isGift: true,
        giftIcon: gift.icon,
        giftName: gift.name,
      },
    ]);

    triggerLikeAnimation();
    setShowGiftSelector(false);
    showToast(`🎁 تم إرسال هدية ${gift.name} بنجاح!`);
  };

  // Trigger Likes Animation
  const triggerLikeAnimation = () => {
    setLikesCount((prev) => prev + 1);
    const newHeart: FloatingHeart = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10,
      color: ['#ef4444', '#f43f5e', '#ec4899', '#a855f7', '#eab308'][Math.floor(Math.random() * 5)],
    };
    setFloatingHearts((prev) => [...prev, newHeart]);

    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 2000);
  };

  return (
    <div dir={dir} className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between overflow-hidden text-white font-sans select-none">
      {/* 1. TOP LIVE STREAM HEADER BAR */}
      <div className="relative z-20 px-3 py-2.5 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between">
        {/* Streamer Avatar & Info */}
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-rose-500/40 shadow-lg">
          <img
            src={initialStream ? initialStream.ownerPhoto : user.avatar}
            alt="Broadcaster"
            className="w-8 h-8 rounded-full border-2 border-rose-500 object-cover"
          />
          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">{initialStream ? initialStream.ownerName : user.name}</span>
              <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                {isBroadcasting || initialStream ? '🔴 لايف' : 'معاينة'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-rose-200">
              <span className="flex items-center gap-0.5">
                <Users className="w-3 h-3 text-rose-400" />
                <span>{viewerCount} مشاهد</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-amber-300">
                <Coins className="w-3 h-3 text-amber-400" />
                <span>{earnedCoins} عملة</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Top Action Controls */}
        <div className="flex items-center gap-2">
          {/* Join Requests Badge Button for Host */}
          {isHost && (
            <button
              onClick={() => setShowJoinRequestsSheet(true)}
              className="relative p-2 bg-black/60 hover:bg-slate-800 rounded-full text-amber-300 border border-amber-500/40 transition-all active:scale-95 cursor-pointer shadow-lg flex items-center justify-center"
              title="طلبات الصعود للبث المباشر"
            >
              <Users className="w-5 h-5" />
              {joinRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center border border-white animate-pulse">
                  {joinRequests.length}
                </span>
              )}
            </button>
          )}

          {/* Close / Exit Button */}
          <button
            onClick={() => {
              if (isHost) endLiveStreamInFirebase(streamId);
              cleanupResources();
              onClose();
            }}
            className="p-2 bg-black/60 hover:bg-rose-600 rounded-full text-white border border-white/20 transition-all active:scale-95 cursor-pointer shadow-lg"
            title="إغلاق البث"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. MAIN LIVE STREAM STAGE CANVAS (Vertical Split Screen 50:50 View) */}
      <div
        onClick={triggerLikeAnimation}
        className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer"
        title="انقر نقراً مزدوجاً أو متكرراً على الشاشة لإرسال القلوب والتفاعل 💖"
      >
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          
          {/* DUAL SPLIT-SCREEN CANVAS (50% Host : 50% Co-Host / Challenger) */}
          {showPkMode || isCoHostActive ? (
            <div className="w-full h-full flex flex-col sm:flex-row items-center justify-center bg-slate-950 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-rose-500/30">
              
              {/* Host Video Canvas (50% Split) */}
              <div className="relative w-full h-1/2 sm:h-full sm:w-1/2 flex items-center justify-center overflow-hidden bg-slate-900">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={getVideoFilterStyle()}
                  className={`w-full h-full object-cover transition-all duration-300 transform ${
                    facingMode === 'user' ? 'scale-x-[-1]' : ''
                  } ${isCameraOn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                />

                {!isCameraOn && (
                  <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-3 text-center">
                    <VideoOff className="w-8 h-8 text-rose-400 mb-1" />
                    <span className="text-xs font-bold text-rose-200">الكاميرا متوقفة</span>
                  </div>
                )}

                {/* Host Overlay Badge */}
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur border border-rose-500/60 px-2.5 py-0.5 rounded-full text-[10px] font-black text-rose-300 flex items-center gap-1 z-10 shadow">
                  <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>المضيف: {initialStream ? initialStream.ownerName : user.name}</span>
                </div>

                {/* PK WINNER CROWN & CONGRATULATIONS OVERLAY FOR HOST */}
                {pkWinner === 'host' && (
                  <div className="absolute inset-0 z-30 bg-amber-950/30 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center animate-in zoom-in duration-300 pointer-events-none">
                    <div className="relative animate-bounce">
                      <span className="text-8xl filter drop-shadow-[0_0_30px_rgba(245,158,11,1)]">👑</span>
                      <span className="absolute -top-3 -right-3 text-4xl animate-spin">✨</span>
                      <span className="absolute -bottom-2 -left-3 text-4xl animate-pulse">🏆</span>
                    </div>
                    <div className="mt-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 px-4 py-1.5 rounded-full font-black text-sm shadow-[0_0_25px_rgba(245,158,11,0.9)] border-2 border-white animate-pulse flex items-center gap-1.5">
                      <span>🎉</span>
                      <span>مبروك الفائز بالتاج {user.name}</span>
                      <span>🎉</span>
                    </div>
                  </div>
                )}

                {/* PK LOSER BOMB OVERLAY FOR HOST */}
                {pkWinner === 'challenger' && (
                  <div className="absolute inset-0 z-30 bg-rose-950/50 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center animate-in zoom-in duration-300 pointer-events-none">
                    <div className="relative animate-pulse">
                      <span className="text-8xl filter drop-shadow-[0_0_30px_rgba(239,68,68,1)]">💣</span>
                      <span className="absolute -top-2 -right-2 text-5xl animate-bounce">💥</span>
                    </div>
                    <div className="mt-2 bg-rose-600/90 text-white px-4 py-1 rounded-full font-black text-xs border border-rose-400 shadow-xl">
                      حظ أوفر 💔
                    </div>
                  </div>
                )}
              </div>

              {/* Challenger / Co-Host Video Canvas (50% Split) */}
              <div className="relative w-full h-1/2 sm:h-full sm:w-1/2 flex flex-col items-center justify-center overflow-hidden bg-slate-900/90 border-t sm:border-t-0 sm:border-r border-cyan-500/40">
                <div className="relative my-auto flex flex-col items-center">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-cyan-400 overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                    <img
                      src={pkOpponent ? pkOpponent.avatar : guestUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250'}
                      alt="Opponent"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-1">
                      <span className="text-[10px] font-black text-cyan-300">
                        {pkOpponent ? pkOpponent.name : guestUser?.name || 'مذيع مشارك'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-1 bg-cyan-950/80 border border-cyan-500/50 px-2.5 py-0.5 rounded-full text-[9px] font-mono text-cyan-300 font-bold shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>مذيع بث مشارك (Broadcaster)</span>
                  </div>
                </div>

                {/* Co-Host Overlay Badge */}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur border border-cyan-500/60 px-2.5 py-0.5 rounded-full text-[10px] font-black text-cyan-300 flex items-center gap-1 z-10 shadow">
                  <Swords className="w-3 h-3 text-cyan-400" />
                  <span>مُتحدي PK #2</span>
                </div>

                {/* PK WINNER CROWN & CONGRATULATIONS OVERLAY FOR CHALLENGER */}
                {pkWinner === 'challenger' && (
                  <div className="absolute inset-0 z-30 bg-amber-950/30 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center animate-in zoom-in duration-300 pointer-events-none">
                    <div className="relative animate-bounce">
                      <span className="text-8xl filter drop-shadow-[0_0_30px_rgba(245,158,11,1)]">👑</span>
                      <span className="absolute -top-3 -right-3 text-4xl animate-spin">✨</span>
                      <span className="absolute -bottom-2 -left-3 text-4xl animate-pulse">🏆</span>
                    </div>
                    <div className="mt-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 px-4 py-1.5 rounded-full font-black text-sm shadow-[0_0_25px_rgba(245,158,11,0.9)] border-2 border-white animate-pulse flex items-center gap-1.5">
                      <span>🎉</span>
                      <span>مبروك الفائز بالتاج {pkOpponent ? pkOpponent.name : guestUser?.name || 'المنافس'}</span>
                      <span>🎉</span>
                    </div>
                  </div>
                )}

                {/* PK LOSER BOMB OVERLAY FOR CHALLENGER */}
                {pkWinner === 'host' && (
                  <div className="absolute inset-0 z-30 bg-rose-950/50 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center animate-in zoom-in duration-300 pointer-events-none">
                    <div className="relative animate-pulse">
                      <span className="text-8xl filter drop-shadow-[0_0_30px_rgba(239,68,68,1)]">💣</span>
                      <span className="absolute -top-2 -right-2 text-5xl animate-bounce">💥</span>
                    </div>
                    <div className="mt-2 bg-rose-600/90 text-white px-4 py-1 rounded-full font-black text-xs border border-rose-400 shadow-xl">
                      حظ أوفر 💔
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* FULL SCREEN SINGLE VIDEO CANVAS WITH USER PHOTO BACKDROP */
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
              {/* Broadcaster HD Photo Backdrop (Always visible as background or when camera is off/connecting) */}
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <img
                  src={initialStream ? initialStream.ownerPhoto : user.avatar}
                  alt={initialStream ? initialStream.ownerName : user.name}
                  className="w-full h-full object-cover filter blur-md scale-105 opacity-60 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/90" />
              </div>

              {/* Real remote Agora video for viewers. The local host videoRef is intentionally separate. */}
              {!isHost && (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  muted={false}
                  className="relative z-0 w-full h-full object-cover"
                />
              )}

              {/* Broadcaster Profile Card Overlay (Visible when camera is off/connecting or muted) */}
              {!isCameraOn && (
                <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center space-y-3 animate-in fade-in zoom-in-95 duration-300">
                  <div className="relative group cursor-pointer">
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-pink-500 blur-md opacity-75 animate-pulse" />
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-amber-400 p-1 bg-slate-900 shadow-2xl overflow-hidden">
                      <img
                        src={initialStream ? initialStream.ownerPhoto : user.avatar}
                        alt={initialStream ? initialStream.ownerName : user.name}
                        className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute -bottom-2 right-2 bg-gradient-to-r from-rose-600 to-amber-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-lg border border-white/30 flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                      <span>{initialStream ? initialStream.ownerName : user.name}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-amber-200 tracking-wide">🔴 بث مباشر - شاشة المذيع</p>
                    <p className="text-xs text-rose-200/90 font-medium">صورة صاحب البث المباشر صادحة في المنتصف 📸</p>
                  </div>
                </div>
              )}

              {/* Live WebRTC Camera Stream */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={getVideoFilterStyle()}
                className={`relative z-0 w-full h-full object-cover transition-all duration-300 transform ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                } ${isCameraOn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              />
            </div>
          )}

          {/* AR Masks Layer */}
          {isCameraOn && activeArMask !== 'none' && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10 transition-all duration-300">
              {activeArMask === 'crown' && (
                <div className="relative -top-24 animate-bounce">
                  <span className="text-7xl filter drop-shadow-[0_10px_20px_rgba(234,179,8,0.8)]">👑</span>
                </div>
              )}
              {activeArMask === 'glasses' && (
                <div className="relative -top-8 animate-pulse">
                  <span className="text-7xl filter drop-shadow-[0_10px_20px_rgba(16,185,129,0.8)]">🕶️</span>
                </div>
              )}
              {activeArMask === 'cat' && (
                <div className="relative -top-28 flex justify-between w-48">
                  <span className="text-5xl transform -rotate-12">🐱</span>
                  <span className="text-5xl transform rotate-12">🐱</span>
                </div>
              )}
            </div>
          )}

          {/* PK Challenge Screen Header & Progress Bar */}
          {showPkMode && (
            <div className="absolute top-4 left-3 right-3 z-30 space-y-2 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-between text-xs font-black bg-slate-950/80 backdrop-blur-md p-2 rounded-2xl border border-amber-500/40 shadow-2xl">
                {/* Host A (Blue Side) */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-cyan-400 overflow-hidden shadow-lg">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-cyan-300 font-bold">{user.name} 🔵</div>
                    <div className="text-[10px] text-amber-300 font-mono">{pkHostPoints.toLocaleString()} نقطة</div>
                  </div>
                </div>

                {/* PK Timer & Winner Action */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] bg-rose-600 text-white font-black px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <span>⚔️ PK</span>
                    <span>{Math.floor(pkCountdown / 60)}:{(pkCountdown % 60).toString().padStart(2, '0')}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (pkWinner) {
                          setPkWinner(null);
                          setPkCountdown(pkDurationSetting);
                          setPkHostPoints(0);
                          setPkChallengerPoints(0);
                          showToast('🔄 تم إعادة جولة التحدي!');
                        } else {
                          const winner = pkHostPoints >= pkChallengerPoints ? 'host' : 'challenger';
                          setPkWinner(winner);
                          const winnerName = winner === 'host' ? user.name : (pkOpponent?.name || 'المنافس');
                          showToast(`👑 مبروك الفائز بالتاج: ${winnerName}!`);
                        }
                      }}
                      className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full shadow border border-amber-300 transition-all active:scale-95 cursor-pointer"
                    >
                      {pkWinner ? 'إعادة الجولة 🔄' : 'حسم التحدي 👑'}
                    </button>
                    {pkWinner && (
                      <button
                        type="button"
                        onClick={() => setShowPunishmentWheel(true)}
                        className="bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow transition-all active:scale-95 cursor-pointer flex items-center gap-0.5"
                      >
                        <span>عقاب الخاسر 🎡</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Host B (Red Side) */}
                <div className="flex items-center gap-2 text-left dir-ltr">
                  <div className="w-8 h-8 rounded-full border-2 border-rose-500 overflow-hidden shadow-lg">
                    <img
                      src={pkOpponent ? pkOpponent.avatar : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                      alt="Opponent"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-right dir-rtl">
                    <div className="text-rose-400 font-bold">{pkOpponent ? pkOpponent.name : 'المنافس'} 🔴</div>
                    <div className="text-[10px] text-amber-300 font-mono">{pkChallengerPoints.toLocaleString()} نقطة</div>
                  </div>
                </div>
              </div>

              {/* Dynamic Progress Bar */}
              <div className="relative h-6 bg-slate-950 rounded-full border-2 border-amber-400/80 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.5)] overflow-hidden flex">
                <div
                  style={{ width: `${pkHostPct}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 transition-all duration-500 ease-out flex items-center justify-start px-2 text-[10px] font-black text-white"
                >
                  {pkHostPct > 15 && <span>{pkHostPct}%</span>}
                </div>
                <div
                  style={{ width: `${pkChallengerPct}%` }}
                  className="h-full bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 transition-all duration-500 ease-out flex items-center justify-end px-2 text-[10px] font-black text-white"
                >
                  {pkChallengerPct > 15 && <span>{pkChallengerPct}%</span>}
                </div>
              </div>
            </div>
          )}

          {/* Floating Hearts */}
          <div className="absolute bottom-28 left-4 z-20 pointer-events-none h-64 w-24">
            {floatingHearts.map((h) => (
              <div
                key={h.id}
                style={{ left: `${h.x}%`, color: h.color }}
                className="absolute bottom-0 animate-bounce text-2xl transition-all duration-1000 opacity-90"
              >
                ❤️
              </div>
            ))}
          </div>
        </div>

        {/* Floating Right Controls Toolbar */}
        <div className="absolute right-3 top-16 z-20 flex flex-col gap-3">
          {/* Filters & Retouching */}
          <button
            onClick={() => setShowFilterSheet(!showFilterSheet)}
            className="w-11 h-11 rounded-full bg-black/60 border border-white/20 text-rose-300 hover:text-white flex items-center justify-center shadow-xl active:scale-90 transition-all cursor-pointer"
            title="فلاتر الوجه والتجميل"
          >
            <Wand2 className="w-5 h-5 animate-pulse" />
          </button>

          {/* Flip Camera */}
          <button
            onClick={handleToggleFacingMode}
            className="w-11 h-11 rounded-full bg-black/60 hover:bg-black backdrop-blur-md border border-white/20 text-amber-400 flex items-center justify-center shadow-xl active:scale-90 transition-all cursor-pointer"
            title="تبديل الكاميرا"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Camera On/Off */}
          <button
            onClick={handleToggleCamera}
            className={`w-11 h-11 rounded-full border flex items-center justify-center shadow-xl active:scale-90 transition-all cursor-pointer ${
              isCameraOn ? 'bg-black/60 border-emerald-500/50 text-emerald-400' : 'bg-rose-600 border-rose-400 text-white'
            }`}
            title="الكاميرا"
          >
            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Mic On/Off */}
          <button
            onClick={handleToggleMic}
            className={`w-11 h-11 rounded-full border flex items-center justify-center shadow-xl active:scale-90 transition-all cursor-pointer relative ${
              isMicOn ? 'bg-black/60 border-emerald-500/50 text-emerald-400' : 'bg-rose-600 border-rose-400 text-white'
            }`}
            title="الميكروفون"
          >
            {/* Live Volume indicator overlay */}
            {isMicOn && audioLevel > 5 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[8px] font-black px-1 rounded-full animate-bounce border border-white/20 shadow-lg">
                {Math.round(audioLevel)}%
              </span>
            )}
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* PK Challenge Button with Strict Guest/Opponent Check */}
          <button
            onClick={() => {
              if (showPkMode) {
                // If PK is already running, toggle or end it
                setShowPkMode(false);
                setPkWinner(null);
                showToast('تم إنهاء جولة التحدي');
              } else if (!isCoHostActive && !pkOpponent) {
                // NO real guest on screen! Show No Opponent modal
                setShowNoOpponentModal(true);
              } else {
                // Real guest or opponent exists! Open PK Setup
                setShowPkConfigModal(true);
              }
            }}
            className={`w-11 h-11 rounded-full border flex items-center justify-center shadow-xl active:scale-90 transition-all cursor-pointer ${
              showPkMode ? 'bg-amber-500 border-amber-300 text-slate-950 font-black animate-pulse' : 'bg-black/60 border-white/20 text-amber-400'
            }`}
            title="بدء تحدي PK مباشر ⚔️"
          >
            <Swords className="w-5 h-5" />
          </button>

          {/* Co-Host Dual Split Screen Toggle / Join Request */}
          <button
            onClick={() => {
              if (isHost) {
                if (joinRequests.length > 0) {
                  setShowJoinRequestsSheet(true);
                } else if (!isCoHostActive) {
                  setShowFindBroadcastersModal(true);
                } else {
                  setIsCoHostActive(false);
                  setGuestUser(null);
                  showToast('تم إنهاء البث المشترك وإغلاق الكاميرا الثانية');
                }
              } else {
                handleSendJoinSeatRequest();
              }
            }}
            className={`w-11 h-11 rounded-full border flex items-center justify-center shadow-xl active:scale-90 transition-all cursor-pointer relative ${
              isCoHostActive ? 'bg-cyan-500 border-cyan-300 text-slate-950 font-black' : 'bg-black/60 border-white/20 text-cyan-400'
            }`}
            title={isHost ? 'إدارة صعود الضيوف ودعوة المذيعين 👥' : 'طلب صعود للمقعد 📹'}
          >
            <Users className="w-5 h-5" />
            {joinRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white animate-bounce">
                {joinRequests.length}
              </span>
            )}
          </button>

          {/* Stream Quality & Settings */}
          <button
            onClick={() => setShowQualityModal(true)}
            className="w-11 h-11 rounded-full bg-black/60 hover:bg-black backdrop-blur-md border border-white/20 text-slate-300 hover:text-white flex items-center justify-center shadow-xl active:scale-90 transition-all cursor-pointer"
            title="إعدادات جودة البث والدقة ⚙️"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. LIVE COMMENTS STREAM & INTERACTIVE OVERLAY */}
      <div className="relative z-20 px-3 pb-2 pt-1 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex flex-col space-y-2">
        {/* Comments Box */}
        <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-xs">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-1.5 text-right animate-in fade-in duration-200">
              {c.senderAvatar ? (
                <img src={c.senderAvatar} alt={c.senderName} className="w-5 h-5 rounded-full border border-rose-400 object-cover mt-0.5" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-rose-600 text-[10px] font-bold flex items-center justify-center">👑</div>
              )}
              <div>
                <span className="font-black text-amber-300 ml-1">{c.senderName}:</span>
                <span className={c.isGift ? 'font-black text-rose-300' : 'text-slate-200'}>{c.text}</span>
              </div>
            </div>
          ))}
          <div ref={commentsEndRef} />
        </div>

        {/* 4. BOTTOM ACTION BAR */}
        <div className="flex items-center gap-2">
          {!isBroadcasting && isHost ? (
            <button
              onClick={handleStartBroadcast}
              disabled={isConnecting}
              className="flex-1 py-3 bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 text-white font-black text-xs rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-400"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isConnecting ? 'جاري الاتصال...' : 'بدء البث المباشر 🔴'}</span>
            </button>
          ) : isHost ? (
            <button
              onClick={handleStopBroadcast}
              className="flex-1 py-3 bg-rose-700 hover:bg-rose-800 text-white font-black text-xs rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-500"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>إيقاف البث 🛑</span>
            </button>
          ) : (
            <button
              onClick={handleSendJoinSeatRequest}
              className="px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-xs rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-cyan-400"
            >
              <Plus className="w-4 h-4" />
              <span>طلب صعود 📹</span>
            </button>
          )}

          {/* Comment Input Box */}
          <form onSubmit={handleSendComment} className="flex-1 flex items-center gap-1 bg-black/60 border border-white/20 rounded-2xl px-2.5 py-1.5">
            <input
              type="text"
              value={inputComment}
              onChange={(e) => setInputComment(e.target.value)}
              placeholder="اكتب تعليقاً..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="p-1.5 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Send Gift Button */}
          <button
            onClick={() => setShowGiftSelector(!showGiftSelector)}
            className="p-3 bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="إرسال هدية"
          >
            <Gift className="w-5 h-5" />
          </button>

          {/* Send Like Heart Button */}
          <button
            onClick={triggerLikeAnimation}
            className="p-3 bg-rose-600/90 text-white rounded-2xl font-black shadow-lg hover:scale-110 active:scale-90 transition-all cursor-pointer border border-rose-400"
            title="إرسال إعجاب"
          >
            <Heart className="w-5 h-5 fill-white" />
          </button>
        </div>
      </div>

      {/* 5. SEARCH ACTIVE BROADCASTERS FOR PK MODAL (👥 البحث عن مذيع مباشر) */}
      {showFindBroadcastersModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#161324] border border-amber-500/40 rounded-3xl p-4 shadow-2xl text-white text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm text-amber-200">البحث عن مذيع مباشر لتحدي PK 👥</h3>
              </div>
              <button
                onClick={() => setShowFindBroadcastersModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
              {activeLiveStreamsList.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  لا يوجد مذيعون مباشرون متاحون للتحدي حالياً
                </div>
              ) : (
                activeLiveStreamsList.map((stream) => (
                  <div
                    key={stream.streamId}
                    className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2.5 rounded-2xl hover:border-amber-400/50 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={stream.ownerPhoto}
                        alt={stream.ownerName}
                        className="w-10 h-10 rounded-full border border-amber-400 object-cover"
                      />
                      <div>
                        <div className="font-black text-xs text-white">{stream.ownerName}</div>
                        <div className="text-[10px] text-rose-300 font-mono">🔴 {stream.viewers} مشاهد</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInviteBroadcasterForPk(stream)}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow active:scale-95 transition-all flex items-center gap-1"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>دعوة</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowFindBroadcastersModal(false)}
              className="w-full py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* 6. INCOMING PK CHALLENGE INVITATION POPUP */}
      {incomingChallengeReqs.length > 0 && (
        <div className="fixed top-16 inset-x-4 z-50 bg-slate-900 border-2 border-amber-400 rounded-3xl p-4 shadow-2xl animate-in slide-in-from-top duration-300 text-right">
          {incomingChallengeReqs.map((req) => (
            <div key={req.requestId} className="space-y-3">
              <div className="flex items-center gap-3">
                <img src={req.senderPhoto} alt={req.senderName} className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover" />
                <div>
                  <h4 className="font-black text-sm text-amber-300">{req.senderName} يدعوك إلى تحدٍ مباشر ⚔️</h4>
                  <p className="text-xs text-slate-300">هل ترغب ببدء تحدي PK وانقسام الشاشة الآن؟</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRespondToChallengeReq(req, true)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition-all active:scale-95 flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>قبول التحدي 🔥</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRespondToChallengeReq(req, false)}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow transition-all active:scale-95 flex items-center justify-center gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  <span>رفض الدعوة</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7. JOIN REQUESTS SHEET FOR HOST */}
      {showJoinRequestsSheet && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-[#161324] border-t-2 border-amber-500/60 rounded-t-3xl p-4 text-right animate-in slide-in-from-bottom duration-300 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <h3 className="font-black text-sm text-amber-300 flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>طلبات الصعود للبث المباشر ({joinRequests.length})</span>
            </h3>
            <button onClick={() => setShowJoinRequestsSheet(false)} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
            {joinRequests.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">لا توجد طلبات صعود معلقة حالياً</div>
            ) : (
              joinRequests.map((req) => (
                <div key={req.userId} className="flex items-center justify-between bg-slate-900 p-2.5 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <img src={req.photo} alt={req.username} className="w-9 h-9 rounded-full border border-amber-400 object-cover" />
                    <span className="font-black text-xs text-white">{req.username} يريد الانضمام</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleRespondToJoinReq(req, true)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                    >
                      قبول ✅
                    </button>
                    <button
                      onClick={() => handleRespondToJoinReq(req, false)}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl"
                    >
                      رفض ❌
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 8. FACE FILTERS & RETOUCHING PANEL */}
      {showFilterSheet && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-[#0f0a1c]/95 border-t-2 border-rose-500/60 rounded-t-3xl p-4 text-right animate-in slide-in-from-bottom duration-300 shadow-2xl backdrop-blur-xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-amber-400 animate-spin-slow" />
              <h3 className="font-black text-sm text-amber-200">استوديو فلاتر وتجميل الكاميرا ✨</h3>
            </div>
            <button onClick={() => setShowFilterSheet(false)} className="p-1 text-slate-400 hover:text-white rounded-full cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Sub-Tabs Switcher */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-black mb-4">
            <button
              type="button"
              onClick={() => setFilterSheetTab('retouch')}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                filterSheetTab === 'retouch'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🌸 تجميل الوجه
            </button>

            <button
              type="button"
              onClick={() => setFilterSheetTab('color')}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                filterSheetTab === 'color'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🎨 ألوان الكاميرا
            </button>

            <button
              type="button"
              onClick={() => setFilterSheetTab('ar')}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                filterSheetTab === 'ar'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              👑 أقنعة AR
            </button>
          </div>

          {/* TAB 1: BEAUTY RETOUCHING SLIDERS */}
          {filterSheetTab === 'retouch' && (
            <div className="space-y-3.5 px-1 py-1">
              {/* 1. Smoothing */}
              <div className="space-y-1.5 bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-rose-300 flex items-center gap-1">
                    <span>✨ تنعيم البشرة والمسام (Smooth Skin)</span>
                  </span>
                  <span className="text-amber-400 font-mono font-black">{smoothing}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={smoothing}
                  onChange={(e) => setSmoothing(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              {/* 2. Brightening */}
              <div className="space-y-1.5 bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-amber-300 flex items-center gap-1">
                    <span>☀️ تفتيح وإضاءة الوجه (Glow & Bright)</span>
                  </span>
                  <span className="text-amber-400 font-mono font-black">{brightening}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brightening}
                  onChange={(e) => setBrightening(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              {/* 3. Rosy Cheeks */}
              <div className="space-y-1.5 bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-pink-300 flex items-center gap-1">
                    <span>💄 توريد الخدود والشفاه (Rosy Blush)</span>
                  </span>
                  <span className="text-pink-400 font-mono font-black">{rosyCheeks}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={rosyCheeks}
                  onChange={(e) => setRosyCheeks(Number(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              {/* 4. Sharpness */}
              <div className="space-y-1.5 bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-cyan-300 flex items-center gap-1">
                    <span>🔍 حدة ونقاء الملامح (Clarity)</span>
                  </span>
                  <span className="text-cyan-400 font-mono font-black">{sharpness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sharpness}
                  onChange={(e) => setSharpness(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setSmoothing(65);
                  setBrightening(45);
                  setRosyCheeks(35);
                  setSharpness(25);
                  showToast('✨ تم تطبيق الضبط التلقائي الذكي للجمال!');
                }}
                className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-xs rounded-xl shadow cursor-pointer transition-transform active:scale-95"
              >
                تطبيق الضبط المثالي التلقائي (Smart Beauty Auto) ✨
              </button>
            </div>
          )}

          {/* TAB 2: COLOR TONE PRESETS */}
          {filterSheetTab === 'color' && (
            <div className="grid grid-cols-3 gap-2.5 py-1">
              {[
                { id: 'none', label: 'طبيعي بدون فلتر', icon: '🌿', bg: 'from-slate-800 to-slate-900' },
                { id: 'beauty', label: 'وردي جمالي', icon: '🌸', bg: 'from-pink-900 to-rose-950' },
                { id: 'soft_glow', label: 'إشراق ناعم', icon: '✨', bg: 'from-purple-900 to-slate-950' },
                { id: 'warm', label: 'دافئ ذهبي', icon: '☀️', bg: 'from-amber-900 to-yellow-950' },
                { id: 'cool', label: 'بارد ثلجي', icon: '❄️', bg: 'from-cyan-900 to-blue-950' },
                { id: 'sunset', label: 'غروب رومانسي', icon: '🌇', bg: 'from-rose-900 to-orange-950' },
                { id: 'cinematic', label: 'سينمائي فاخر', icon: '🎬', bg: 'from-teal-900 to-slate-950' },
                { id: 'royal_neon', label: 'نيون ملكي', icon: '🔮', bg: 'from-fuchsia-900 to-purple-950' },
                { id: 'vintage', label: 'كلاسيكي عتيق', icon: '🎞️', bg: 'from-yellow-950 to-stone-950' },
                { id: 'bw', label: 'أبيض وأسود', icon: '🖤', bg: 'from-stone-900 to-black' },
              ].map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    setColorPreset(preset.id as any);
                    showToast(`🎨 تم تفعيل فلتر ${preset.label}`);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center space-y-1 ${
                    colorPreset === preset.id
                      ? 'bg-gradient-to-b ' + preset.bg + ' border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">{preset.icon}</span>
                  <span className="font-bold text-[11px] text-white block">{preset.label}</span>
                  {colorPreset === preset.id && (
                    <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full mt-0.5">
                      نشط ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: AR MASKS & HEADWEAR */}
          {filterSheetTab === 'ar' && (
            <div className="grid grid-cols-3 gap-2.5 py-1">
              {[
                { id: 'none', label: 'إلغاء القناع', icon: '🚫' },
                { id: 'crown', label: 'التاج الملكي VIP', icon: '👑' },
                { id: 'glasses', label: 'نظارة المشاهير', icon: '🕶️' },
                { id: 'cat', label: 'القطة اللطيفة', icon: '🐱' },
                { id: 'halo', label: 'هالة الملائكة', icon: '😇' },
                { id: 'stars', label: 'بريق النجوم', icon: '✨' },
                { id: 'cyber', label: 'قناع السايبر', icon: '🤖' },
              ].map((mask) => (
                <div
                  key={mask.id}
                  onClick={() => {
                    setActiveArMask(mask.id as any);
                    showToast(mask.id === 'none' ? 'تم إزالة القناع' : `🎭 تم تفعيل قناع ${mask.label}`);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center space-y-1 ${
                    activeArMask === mask.id
                      ? 'bg-purple-950 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-105'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-3xl">{mask.icon}</span>
                  <span className="font-bold text-[11px] text-white block">{mask.label}</span>
                  {activeArMask === mask.id && (
                    <span className="text-[9px] bg-purple-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full mt-0.5">
                      مفعل ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 9. GIFT SELECTOR SHEET */}
      {showGiftSelector && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-[#120d24] border-t-2 border-amber-500/60 rounded-t-3xl p-4 text-right animate-in slide-in-from-bottom duration-300 shadow-2xl">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-400" />
              <h3 className="font-black text-sm text-amber-200">إرسال هدية في البث المباشر 🎁</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-300 font-bold">رصيدك: {user.coins} 🪙</span>
              <button onClick={() => setShowGiftSelector(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {MOCK_GIFTS.map((g) => (
              <button
                key={g.id}
                onClick={() => handleSendGiftInStream(g)}
                className="flex flex-col items-center justify-center p-2.5 bg-slate-900/90 border border-slate-800 hover:border-amber-400 rounded-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer group"
              >
                <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">{g.icon}</span>
                <span className="text-[11px] font-bold text-white">{g.name}</span>
                <span className="text-[10px] font-black text-amber-400">{g.priceCoins} 🪙</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 10. NO OPPONENT MODAL WARNING (لا يوجد ضيف أو منافس) */}
      {showNoOpponentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-5 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center mx-auto text-3xl shadow">
              ⚔️
            </div>

            <div>
              <h3 className="font-black text-base text-amber-300">لا يوجد منافس صاعد على البث!</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                لبدء تحدي PK مباشر، يجب أولاً قبول صعود أحد المتابعين على الكاميرا والمايك، أو إرسال دعوة لمذيع نشط يبث الآن.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowNoOpponentModal(false);
                  setShowFindBroadcastersModal(true);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>دعوة مذيعين لايف نشطين 📡</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowNoOpponentModal(false);
                  setShowJoinRequestsSheet(true);
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>عرض طلبات صعود المايك والكاميرا ({joinRequests.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setShowNoOpponentModal(false)}
                className="w-full py-2 bg-transparent hover:bg-slate-800/60 text-slate-400 text-xs rounded-xl cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. PK CHALLENGE DURATION & SETUP MODAL */}
      {showPkConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500/60 rounded-3xl p-5 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 text-white flex items-center justify-center mx-auto text-2xl shadow-xl animate-pulse">
              <Swords className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-black text-base text-rose-300">بدء تحدي PK مباشر 🔥</h3>
              <p className="text-xs text-slate-300 mt-1">
                المنافس: <strong className="text-white">{guestUser ? guestUser.name : pkOpponent?.name}</strong>
              </p>
            </div>

            {/* Select Duration */}
            <div className="space-y-1.5 text-right">
              <label className="text-[11px] font-bold text-slate-300">اختر مدة الجولة:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '3 دقائق ⚡', val: 180 },
                  { label: '5 دقائق 🔥', val: 300 },
                  { label: '10 دقائق 🏆', val: 600 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setPkDurationSetting(item.val as any)}
                    className={`py-2 px-1 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      pkDurationSetting === item.val
                        ? 'bg-rose-600 text-white border-rose-400 shadow-lg'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPkCountdown(pkDurationSetting);
                  setPkHostPoints(0);
                  setPkChallengerPoints(0);
                  setPkWinner(null);
                  setShowPkMode(true);
                  setShowPkConfigModal(false);
                  showToast(`⚔️ انطلق تحدي الـ PK لمدة ${pkDurationSetting / 60} دقائق! ادعموا البث 🔥`);
                }}
                className="py-2.5 bg-gradient-to-r from-rose-600 to-amber-500 text-white font-black text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95 cursor-pointer"
              >
                انطلاق التحدي ⚔️
              </button>
              <button
                type="button"
                onClick={() => setShowPkConfigModal(false)}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. STREAM QUALITY & SETTINGS MODAL */}
      {showQualityModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-500/60 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-right animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                <h3 className="font-black text-sm text-cyan-300">إعدادات جودة البث والكاميرا ⚙️</h3>
              </div>
              <button onClick={() => setShowQualityModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quality Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 block">دقة الفيديو (Resolution):</label>
              {[
                { id: '1080p', label: '1080p Full HD (فائقة - 60 FPS)', desc: 'أعلى وضوح للاتصال السريع' },
                { id: '720p', label: '720p HD (موصى بها - 30 FPS)', desc: 'توازن ممتاز بين الجودة والسرعة' },
                { id: '480p', label: '480p SD (متوسطة - 30 FPS)', desc: 'استهلاك بيانات معتدل' },
                { id: '360p', label: '360p توفير البيانات (Data Saver)', desc: 'للشبكات الضعيفة لتفادي التقطيع' },
              ].map((q) => (
                <div
                  key={q.id}
                  onClick={() => {
                    setStreamQuality(q.id as any);
                    showToast(`📺 تم ضبط جودة البث إلى ${q.id}`);
                  }}
                  className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    streamQuality === q.id
                      ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs block text-white">{q.label}</span>
                    <span className="text-[10px] text-slate-400">{q.desc}</span>
                  </div>
                  {streamQuality === q.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
              ))}
            </div>

            {/* FPS Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-slate-300 block">معدل الإطارات (Frame Rate):</label>
              <div className="grid grid-cols-2 gap-2">
                {[30, 60].map((fps) => (
                  <button
                    key={fps}
                    type="button"
                    onClick={() => {
                      setStreamFps(fps as any);
                      showToast(`تم ضبط معدل الإطارات إلى ${fps} FPS`);
                    }}
                    className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      streamFps === fps
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {fps} FPS {fps === 60 ? '🔥 فائق السلاسة' : 'قياسي'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowQualityModal(false)}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer transition-transform active:scale-95"
            >
              حفظ وتطبيق الإعدادات ✅
            </button>
          </div>
        </div>
      )}

      {/* 13. PUNISHMENT WHEEL MODAL FOR LOSER */}
      {showPunishmentWheel && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-5 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center mx-auto text-3xl shadow">
              🎡
            </div>

            <div>
              <h3 className="font-black text-base text-amber-300">عجلة عقاب الخاسر 🎡</h3>
              <p className="text-xs text-slate-300 mt-1">انتهى التحدي! قم بتدوير العجلة لتحديد عقاب الخاسر:</p>
            </div>

            {/* Punishment Result Box */}
            <div className="bg-slate-950 border border-amber-500/40 p-3.5 rounded-2xl">
              <span className="text-[10px] text-slate-400 block mb-1">العقاب المختار:</span>
              <span className="font-black text-sm text-amber-300">
                {selectedPunishment || 'اضغط على زر التدوير لاختيار العقاب 🎲'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const punishments = [
                    'شرب كوب ماء كامل دفعة واحدة 🥛',
                    '10 تمرين ضغط على الكاميرا 💪',
                    'تقليد صوت قطة أو حيوان مضحك 🐱',
                    'غناء مقطع موال بصوت مرتفع 🎤',
                    'الاعتراف بأغرب موقف محرج حصل لك 🙈',
                    'إرسال هدية للمنافس الفائز 🎁',
                  ];
                  const pick = punishments[Math.floor(Math.random() * punishments.length)];
                  setSelectedPunishment(pick);
                  showToast(`🎲 تم اختيار العقاب: ${pick}`);
                }}
                className="py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow hover:brightness-110 active:scale-95 cursor-pointer"
              >
                تدوير العجلة 🎡
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPunishmentWheel(false);
                  setSelectedPunishment(null);
                }}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                إنهاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Alert */}
      {toast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-amber-500/60 text-amber-200 font-bold text-xs px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          {toast}
        </div>
      )}
    </div>
  );
};
