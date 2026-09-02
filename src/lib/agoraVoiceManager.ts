import AgoraRTC, { IAgoraRTCClient, IMicrophoneAudioTrack, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { agoraNativeBridge } from './agoraNativeBridge';
import { fetchAgoraRtcToken, AGORA_CONFIG } from '../utils/agoraToken';
import { initAndroidAudioUnlocker } from './nativeAudio';
import { requestMicrophonePermissionUnified, getCachedAudioStream, clearCachedAudioStream } from './permissions';
import { audioSyncEngine } from './audioSyncEngine';

export const AGORA_APP_ID = (import.meta as any).env?.VITE_AGORA_APP_ID || AGORA_CONFIG.appId;

/**
 * Consistently generates a unique numeric UID for Agora RTC from a string userId.
 * Used identically across Web and Android to guarantee seamless matching and synchronization.
 */
export function getAgoraNumericUid(userId: string): number {
  let hash = 2166136261;
  for (let i = 0; i < userId.length; i++) {
    hash ^= userId.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 2000000000) + 1;
}

/**
 * Sanitizes channel names so both Web and Android always join the exact same ASCII channel
 */
export function sanitizeAgoraChannelName(rawName: string): string {
  if (!rawName) return 'room_main';
  const clean = rawName.replace(/[^a-zA-Z0-9_-]/g, '');
  if (clean.length >= 3) {
    return clean.substring(0, 64);
  }
  let hash = 0;
  for (let i = 0; i < rawName.length; i++) {
    hash = (hash << 5) - hash + rawName.charCodeAt(i);
    hash |= 0;
  }
  return `room_${Math.abs(hash)}`;
}

export interface JoinVoiceRoomParams {
  channelName: string;
  token?: string | null;
  userId: string;
  isHostOrSeated: boolean;
  isMuted: boolean;
  onRemoteUserSpeaking?: (uid: string | number, level: number) => void;
  onConnectionStateChange?: (state: string) => void;
  onToastNotice?: (message: string) => void;
}

class AgoraVoiceManager {
  private client: IAgoraRTCClient | null = null;
  private localMicTrack: IMicrophoneAudioTrack | null = null;
  private musicAudioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private musicSourceNode: MediaElementAudioSourceNode | null = null;
  private musicTrack: any = null;
  private currentChannel: string | null = null;
  private currentUserId: string | null = null;
  private isJoined: boolean = false;
  private isPublishing: boolean = false;
  private isMusicPublishing: boolean = false;
  private currentRole: 'host' | 'audience' = 'audience';
  private onSpeakingCallback: ((uid: string | number, level: number) => void) | null = null;
  private localVolumeInterval: any = null;
  private localAnalyser: AnalyserNode | null = null;
  private localAudioContext: AudioContext | null = null;
  private localSourceNode: MediaStreamAudioSourceNode | null = null;
  private pendingAutoplayTracks: Set<IAgoraRTCRemoteUser> = new Set();

  constructor() {
    // Initialize Android/Web Audio context unlocker on first load
    initAndroidAudioUnlocker();
    this.setupGlobalAutoplayUnlocker();
  }

  /**
   * إنشاء Track صوتي للميكروفون مباشرة عبر Agora SDK مع طبقات احتياطية لضمان عمل المايك
   */
  private async createMicrophoneTrackFromCachedStream(): Promise<IMicrophoneAudioTrack | any | null> {
    console.log('🎙️ [AgoraVoice] Creating microphone track with Agora SDK...');

    // محاولة 1: إنشاء Track مع إعدادات إلغاء الضوضاء والصدى
    try {
      const track = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: {
          sampleRate: 48000,
          stereo: false,
          bitrate: 64,
        },
        AEC: true,
        ANS: true,
        AGC: true,
      });

      console.log('✅ [AgoraVoice] Agora microphone track created with studio AEC/ANS');
      return track;
    } catch (createErr1) {
      console.warn('⚠️ [AgoraVoice] Primary microphone track creation failed, trying basic config:', createErr1);
    }

    // محاولة 2: إنشاء Track مع إعدادات أساسية بدون قيود معقدة
    try {
      const track = await AgoraRTC.createMicrophoneAudioTrack();
      console.log('✅ [AgoraVoice] Agora basic microphone track created successfully');
      return track;
    } catch (createErr2) {
      console.warn('⚠️ [AgoraVoice] Basic microphone track creation failed, trying CustomAudioTrack from stream:', createErr2);
    }

    // محاولة 3: استخراج MediaStreamTrack من الـ cached stream أو getUserMedia وإنشاء CustomAudioTrack
    try {
      let stream = getCachedAudioStream();
      if (!stream || !stream.active) {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
      }

      if (stream && stream.getAudioTracks().length > 0) {
        const mediaStreamTrack = stream.getAudioTracks()[0];
        const customTrack = await AgoraRTC.createCustomAudioTrack({
          mediaStreamTrack,
        });
        console.log('✅ [AgoraVoice] Agora CustomAudioTrack created from browser MediaStream');
        return customTrack;
      }
    } catch (customErr) {
      console.error('❌ [AgoraVoice] All microphone track creation attempts failed:', customErr);
    }

    return null;
  }

  /**
   * Global unlocker for browser/WebView autoplay restrictions
   */
  private setupGlobalAutoplayUnlocker() {
    if (typeof window === 'undefined') return;

    const unlockPendingAudio = () => {
      if (this.pendingAutoplayTracks.size > 0) {
        console.log(`🔊 [AgoraVoice] Resuming ${this.pendingAutoplayTracks.size} pending remote audio tracks...`);
        this.pendingAutoplayTracks.forEach((remoteUser) => {
          try {
            if (remoteUser.audioTrack && !remoteUser.audioTrack.isPlaying) {
              remoteUser.audioTrack.play();
            }
          } catch (err) {
            console.warn('[AgoraVoice] Track play retry error:', err);
          }
        });
        this.pendingAutoplayTracks.clear();
      }
    };

    window.addEventListener('touchstart', unlockPendingAudio, { passive: true });
    window.addEventListener('pointerdown', unlockPendingAudio, { passive: true });
    window.addEventListener('click', unlockPendingAudio, { passive: true });
  }

  /**
   * Monitor live hardware microphone volume from Agora Track & Web Audio Analyser
   */
  private startLocalVolumeMonitoring(): void {
    this.stopLocalVolumeMonitoring();

    try {
      let stream: MediaStream | null = null;
      if (this.localMicTrack) {
        const mediaStreamTrack = this.localMicTrack.getMediaStreamTrack();
        if (mediaStreamTrack) {
          stream = new MediaStream([mediaStreamTrack]);
        }
      }

      if (!stream) {
        stream = getCachedAudioStream();
      }

      if (stream) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.localAudioContext = new AudioCtx();
          if (this.localAudioContext.state === 'suspended') {
            this.localAudioContext.resume().catch(() => {});
          }
          this.localSourceNode = this.localAudioContext.createMediaStreamSource(stream);
          this.localAnalyser = this.localAudioContext.createAnalyser();
          this.localAnalyser.fftSize = 256;
          this.localAnalyser.smoothingTimeConstant = 0.3;
          this.localSourceNode.connect(this.localAnalyser);
        }
      }
    } catch (e) {
      console.warn('[AgoraVoice] AudioContext analyser init notice:', e);
    }

    const dataArray = new Uint8Array(128);

    this.localVolumeInterval = setInterval(() => {
      if (!this.onSpeakingCallback) return;

      let level = 0;

      // 1. Web Audio AnalyserNode (ultra-responsive 60fps waveform detection)
      if (this.localAnalyser) {
        try {
          this.localAnalyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          if (avg > 2) {
            level = Math.min(100, Math.round((avg / 100) * 100));
          }
        } catch (e) {}
      }

      // 2. Fallback to Agora getVolumeLevel
      if (level === 0 && this.localMicTrack) {
        try {
          const levelFloat = this.localMicTrack.getVolumeLevel();
          if (levelFloat > 0.003) {
            level = Math.min(100, Math.round(levelFloat * 100 * 3));
          }
        } catch {}
      }

      const numUid = this.currentUserId ? getAgoraNumericUid(this.currentUserId) : 0;
      this.onSpeakingCallback(numUid, level);
    }, 60);
  }

  private stopLocalVolumeMonitoring(): void {
    if (this.localVolumeInterval) {
      clearInterval(this.localVolumeInterval);
      this.localVolumeInterval = null;
    }
    if (this.localSourceNode) {
      try { this.localSourceNode.disconnect(); } catch (e) {}
      this.localSourceNode = null;
    }
    if (this.localAnalyser) {
      try { this.localAnalyser.disconnect(); } catch (e) {}
      this.localAnalyser = null;
    }
    if (this.localAudioContext) {
      try { this.localAudioContext.close(); } catch (e) {}
      this.localAudioContext = null;
    }
    if (this.onSpeakingCallback) {
      const numUid = this.currentUserId ? getAgoraNumericUid(this.currentUserId) : 0;
      this.onSpeakingCallback(numUid, 0);
    }
  }

  /**
   * Request Microphone Permission on Android & Web Browsers
   */
  async requestMicrophonePermission(): Promise<boolean> {
    // Also unlock AudioContext when requesting mic
    await audioSyncEngine.unlockAudio();
    const res = await requestMicrophonePermissionUnified();
    return res.granted;
  }

  /**
   * Join Agora RTC Channel with synchronization for Web and Android
   */
  async joinVoiceRoom(params: JoinVoiceRoomParams): Promise<boolean> {
    const {
      channelName,
      token,
      userId,
      isHostOrSeated,
      isMuted,
      onRemoteUserSpeaking,
      onConnectionStateChange,
      onToastNotice,
    } = params;

    const safeChannelName = sanitizeAgoraChannelName(channelName);
    const numericUid = getAgoraNumericUid(userId);
    this.currentChannel = safeChannelName;
    this.currentUserId = userId;
    this.onSpeakingCallback = onRemoteUserSpeaking || null;

    console.log('🎙️ [AgoraVoice] Initializing Voice Room connection:', {
      rawChannelName: channelName,
      safeChannelName,
      userId,
      numericUid,
      isHostOrSeated,
      isMuted,
    });

    try {
      // Step 1: Clean up any existing session
      if (this.isJoined) {
        await this.leaveVoiceRoom();
      }

      // Step 2: Request microphone permission if host or seated
      if (isHostOrSeated) {
        const hasMicPerm = await this.requestMicrophonePermission();
        if (!hasMicPerm && onToastNotice) {
          onToastNotice('⚠️ يرجى السماح بصلاحية الميكروفون لتتمكن من التحدث في الغرفة.');
        }

        console.log('🔍 [DEBUG] After permission request:');
        console.log('  - hasMicPerm:', hasMicPerm);
        console.log('  - cachedStream exists:', !!getCachedAudioStream());
        console.log('  - cachedStream active:', getCachedAudioStream()?.active);
      }

      // Step 3: Start Android Foreground Service for persistent background voice
      if (agoraNativeBridge.isAndroidPlatform()) {
        await agoraNativeBridge.startForegroundAudioService(safeChannelName);
      }

      // Step 4: Create Agora Web RTC Client (live mode for low-latency broadcast & seat transitions)
      const client = AgoraRTC.createClient({
        mode: 'live',
        codec: 'vp8',
      });
      this.client = client;

      // Handle Autoplay Failures gracefully (especially on Android WebView)
      AgoraRTC.onAutoplayFailed = () => {
        console.warn('⚠️ [AgoraVoice] Autoplay was blocked by browser. Queuing tracks for gesture unlock.');
        if (this.client) {
          this.client.remoteUsers.forEach((user) => {
            if (user.audioTrack) {
              this.pendingAutoplayTracks.add(user);
            }
          });
        }
      };

      // Event: Remote user published audio track
      client.on('user-published', async (remoteUser: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        console.log('================================');
        console.log('📥 REMOTE USER PUBLISHED');
        console.log('REMOTE UID:', remoteUser.uid);
        console.log('MEDIA TYPE:', mediaType);
        console.log('================================');

        try {
          await client.subscribe(remoteUser, mediaType);
          if (mediaType === 'audio' && remoteUser.audioTrack) {
            try {
              remoteUser.audioTrack.play();
              console.log('🔊 REMOTE AUDIO PLAYING:', remoteUser.uid);
            } catch (playErr) {
              console.warn('⚠️ [AgoraVoice] Autoplay blocked for user', remoteUser.uid, 'queuing...');
              this.pendingAutoplayTracks.add(remoteUser);
            }
          }
        } catch (subErr) {
          console.error('❌ [AgoraVoice] Error subscribing to remote user:', subErr);
        }
      });

      // Event: Remote user unpublished
      client.on('user-unpublished', (remoteUser: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        console.log('🔇 [AgoraVoice] Remote user unpublished track:', remoteUser.uid, mediaType);
        this.pendingAutoplayTracks.delete(remoteUser);
      });

      // Event: Active Speaker Indicators (smooth real-time volume sync)
      client.enableAudioVolumeIndicator();
      client.on('volume-indicator', (volumes) => {
        volumes.forEach((volume) => {
          if (this.onSpeakingCallback) {
            const rawLvl = volume.level;
            const lvl = rawLvl <= 1 ? Math.round(rawLvl * 100 * 2.5) : Math.round(rawLvl);
            this.onSpeakingCallback(volume.uid, Math.min(100, lvl));
          }
        });
      });

      // Event: Connection State Changes
      client.on('connection-state-change', (curState, prevState) => {
        console.log(`🔄 [AgoraVoice] Connection state: ${prevState} -> ${curState}`);
        if (onConnectionStateChange) {
          onConnectionStateChange(curState);
        }
        if (curState === 'RECONNECTING' && onToastNotice) {
          onToastNotice('📶 جارٍ إعادة الاتصال بالصوت...');
        } else if (curState === 'CONNECTED' && prevState === 'RECONNECTING' && onToastNotice) {
          onToastNotice('✅ تم استعادة الاتصال الصوتي بنجاح');
        }
      });

      // Step 5: Obtain dynamic token for exact UID & channel
      let dynamicToken: string | null = null;
      try {
        dynamicToken = await fetchAgoraRtcToken(
          safeChannelName,
          numericUid,
          isHostOrSeated ? 'publisher' : 'subscriber'
        );
      } catch (e) {
        console.warn('[AgoraVoice] Fresh role-specific token fetch failed:', e);
      }
      if (!dynamicToken) dynamicToken = token?.trim() || null;
      if (!dynamicToken) {
        throw new Error('Agora RTC token unavailable for this UID/channel/role');
      }

      // Set initial role (host if seated, audience if listening) - MUST BE BEFORE JOIN
      const initialRole: 'host' | 'audience' = isHostOrSeated ? 'host' : 'audience';
      if (initialRole === 'host') {
        await client.setClientRole('host');
      } else {
        // level: 1 (Audience Latency Level Low Latency) is only allowed for audience
        await client.setClientRole('audience', { level: 1 });
      }
      this.currentRole = initialRole;

      // Join the channel
      await client.join(AGORA_APP_ID, safeChannelName, dynamicToken, numericUid);
      this.isJoined = true;

      console.log('================ AGORA DEBUG ================');
      console.log('APP ID:', AGORA_APP_ID);
      console.log('CHANNEL:', safeChannelName);
      console.log('LOCAL UID:', numericUid);
      console.log('ROLE:', this.currentRole);
      console.log('==============================================');

      // ===== إعدادات الصوت الإضافية للأندرويد =====
      if (agoraNativeBridge.isAndroidPlatform()) {
        // استخدام مكبر الصوت (يفضل في الغرف الجماعية)
        agoraNativeBridge.setAudioRoute(true);
        // تفعيل الجودة العالية
        agoraNativeBridge.enableHighQualityAudio();
      }

      // Subscribe to any users already present in the channel
      for (const remoteUser of client.remoteUsers) {
        if (remoteUser.hasAudio) {
          try {
            await client.subscribe(remoteUser, 'audio');
            remoteUser.audioTrack?.play();
            console.log('▶️ [AgoraVoice] Subscribed & playing existing remote user:', remoteUser.uid);
          } catch (existingErr) {
            console.warn('⚠️ [AgoraVoice] Error subscribing to existing user:', existingErr);
          }
        }
      }

      // Step 6: If seated/host and not muted, publish microphone
      if (isHostOrSeated && !isMuted) {
        await this.publishMicrophone();
      }

      return true;
    } catch (err: any) {
      console.error('❌ [AgoraVoice] FAILED TO JOIN:', err);

      this.isJoined = false;
      this.isPublishing = false;

      // Start local volume monitoring fallback so UI speaking soundwaves continue to function seamlessly
      if (isHostOrSeated && !isMuted) {
        this.startLocalVolumeMonitoring();
      }

      return false;
    }
  }

  private async renewTokenForRole(
    role: 'publisher' | 'subscriber'
  ): Promise<boolean> {
    if (!this.client || !this.currentChannel || !this.currentUserId) {
      return false;
    }

    const numericUid = getAgoraNumericUid(this.currentUserId);

    try {
      const newToken = await fetchAgoraRtcToken(
        this.currentChannel,
        numericUid,
        role
      );

      if (!newToken) {
        console.error('❌ [AgoraVoice] No fresh token returned for role:', role);
        return false;
      }
      await this.client.renewToken(newToken);
      console.log('🔑 [AgoraVoice] Token renewed:', {
        channel: this.currentChannel,
        uid: numericUid,
        role,
      });
      return true;
    } catch (error) {
      console.warn('⚠️ [AgoraVoice] Token renewal failed:', error);
      return false;
    }
  }

  /**
   * Publish Local Microphone Track with Studio Quality & Noise Suppression
   */
  async publishMicrophone(): Promise<boolean> {
    if (!this.client || !this.isJoined) {
      console.warn('⚠️ [AgoraVoice] Cannot publish: Not joined to room.');
      return false;
    }

    try {
      if (this.isPublishing && this.localMicTrack) {
        await this.localMicTrack.setEnabled(true);
        this.startLocalVolumeMonitoring();
        return true;
      }

      const hasMicPerm = await this.requestMicrophonePermission();
      if (!hasMicPerm) {
        console.warn('⚠️ [AgoraVoice] Microphone permission denied.');
        return false;
      }

      // إذا كان المستخدم Audience ثم أخذ مقعداً، نجدد الـ Token قبل التحول إلى Host
      if (this.currentRole !== 'host') {
        const renewed = await this.renewTokenForRole('publisher');
        if (!renewed) {
          console.error('❌ [AgoraVoice] Cannot switch to host without valid publisher token.');
          return false;
        }

        await this.client.setClientRole('host');
        this.currentRole = 'host';
      }

      console.log('🎙️ [AgoraVoice] Creating microphone audio track...');

      // Agora owns the microphone device exclusively. Permission probes must
      // not be reused as the published track because Android/WebView can keep
      // the probe stream locked or detached from the Agora publisher.
      const micTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: 'high_quality',
        AEC: true,
        ANS: true,
        AGC: true,
      });
      if (!micTrack) {
        console.error('❌ [AgoraVoice] Failed to create Agora microphone track.');
        return false;
      }

      this.localMicTrack = micTrack;
      try { this.localMicTrack.setVolume(100); } catch {}

      let connState = (this.client as any).connectionState || this.client.connectionState;
      if (connState === 'CONNECTING' || connState === 'DISCONNECTED') {
        // Wait up to 3 seconds for connection to establish
        for (let i = 0; i < 30; i++) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          connState = (this.client as any).connectionState || this.client.connectionState;
          if (connState === 'CONNECTED') break;
        }
      }

      if (connState !== 'CONNECTED') {
        console.error('❌ [AgoraVoice] Client is not CONNECTED; microphone publish aborted:', connState);
        try { micTrack.stop(); micTrack.close(); } catch {}
        this.localMicTrack = null;
        return false;
      }

      await this.client.publish([micTrack]);
      this.isPublishing = true;
      this.startLocalVolumeMonitoring();

      console.log('================================');
      console.log('🎤 AGORA MICROPHONE PUBLISHED');
      console.log('UID:', this.currentUserId ? getAgoraNumericUid(this.currentUserId) : 'unknown');
      console.log('CHANNEL:', this.currentChannel);
      console.log('ROLE:', this.currentRole);
      console.log('================================');

      return true;
    } catch (err) {
      console.error('❌ [AgoraVoice] Failed to publish microphone:', err);
      this.isPublishing = false;
      return false;
    }
  }

  /**
   * Mute or Unmute Local Microphone
   */
  async setMuted(muted: boolean): Promise<void> {
    console.log('🎙️ [AgoraVoice] Set muted:', muted);

    if (muted) {
      this.stopLocalVolumeMonitoring();
      if (this.localMicTrack) {
        await this.localMicTrack.setEnabled(false);
      }
    } else {
      if (this.localMicTrack) {
        await this.localMicTrack.setEnabled(true);
        this.startLocalVolumeMonitoring();
      } else {
        await this.publishMicrophone();
      }
    }
  }

  /**
   * Unpublish Local Microphone (when switching to audience / leaving seat)
   */
  async unpublishMicrophone(): Promise<void> {
    this.stopLocalVolumeMonitoring();

    if (this.localMicTrack) {
      console.log('🔇 [AgoraVoice] Unpublishing local microphone...');
      const trackToClean = this.localMicTrack;
      try {
        const connState = (this.client as any)?.connectionState || this.client?.connectionState;
        if (this.client && this.isPublishing && connState === 'CONNECTED') {
          await this.client.unpublish([trackToClean]);
        }
      } catch (err) {
        console.warn('⚠️ [AgoraVoice] Unpublish warning:', err);
      } finally {
        try {
          trackToClean.stop();
          trackToClean.close();
        } catch (cleanErr) {
          console.warn('⚠️ [AgoraVoice] Track close warning:', cleanErr);
        }
        this.localMicTrack = null;
        this.isPublishing = false;
      }
    }

    // إذا لم تكن الموسيقى تعمل وتُنشر، يمكن تحويل الـ Role إلى audience
    if (this.client && this.isJoined && !this.isMusicPublishing) {
      try {
        await this.client.setClientRole('audience');
        this.currentRole = 'audience';
      } catch {
        // ignore
      }
    }
  }

  /**
   * Play Cloud Music Track in Room and broadcast to all members via Agora Audio Track
   */
  async playCloudMusic(audioUrl: string, volume: number = 100): Promise<boolean> {
    try {
      await this.stopCloudMusic();

      if (!this.client || !this.isJoined) {
        console.error('❌ [AgoraVoice] Cannot play music: Agora not connected');
        return false;
      }

      if (this.currentRole !== 'host') {
        console.warn('⚠️ [AgoraVoice] Music requires host role, renewing token...');
        const renewed = await this.renewTokenForRole('publisher');
        if (!renewed) {
          return false;
        }
        await this.client.setClientRole('host');
        this.currentRole = 'host';
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        console.error('❌ [AgoraVoice] AudioContext unavailable');
        return false;
      }

      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const audio = new Audio();
      audio.src = audioUrl;
      audio.crossOrigin = 'anonymous';
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = Math.max(0, Math.min(1, volume / 100));

      const source = this.audioContext.createMediaElementSource(audio);
      const destination = this.audioContext.createMediaStreamDestination();

      // إرسال الموسيقى إلى Agora فقط.
      // التشغيل المحلي للمستخدم يتم عبر audioRef في VoiceRoomModal حتى لا يسمع الناشر الموسيقى مرتين.
      source.connect(destination);

      const mediaStreamTrack = destination.stream.getAudioTracks()[0];
      if (!mediaStreamTrack) {
        throw new Error('Music MediaStreamTrack not created');
      }

      const musicTrack = await AgoraRTC.createCustomAudioTrack({
        mediaStreamTrack,
      });

      this.musicAudioElement = audio;
      this.musicSourceNode = source;
      this.musicTrack = musicTrack;

      await audio.play();

      await this.client.publish([this.musicTrack]);
      this.isMusicPublishing = true;

      console.log('================================');
      console.log('🎵 MUSIC PUBLISHED TO AGORA');
      console.log('CHANNEL:', this.currentChannel);
      console.log('UID:', this.currentUserId ? getAgoraNumericUid(this.currentUserId) : 'unknown');
      console.log('================================');

      return true;
    } catch (err) {
      console.error('❌ [AgoraVoice] Music publish failed:', err);
      return false;
    }
  }

  /**
   * Stop Cloud Music Track and unpublish from Agora
   */
  async stopCloudMusic(): Promise<void> {
    try {
      if (this.client && this.musicTrack && this.isMusicPublishing) {
        try {
          await this.client.unpublish([this.musicTrack]);
        } catch (err) {
          console.warn('⚠️ [AgoraVoice] Music unpublish warning:', err);
        }
      }

      this.isMusicPublishing = false;

      if (this.musicAudioElement) {
        this.musicAudioElement.pause();
        this.musicAudioElement.src = '';
        this.musicAudioElement = null;
      }

      if (this.musicSourceNode) {
        try {
          this.musicSourceNode.disconnect();
        } catch {
          // ignore
        }
        this.musicSourceNode = null;
      }

      if (this.musicTrack) {
        try {
          this.musicTrack.stop();
          this.musicTrack.close();
        } catch {
          // ignore
        }
        this.musicTrack = null;
      }

      console.log('🎵 [AgoraVoice] Music stopped & unpublished');
    } catch (err) {
      console.error('❌ [AgoraVoice] stopCloudMusic error:', err);
    }
  }

  /**
   * Leave Voice Room and cleanly release all hardware & network resources
   */
  async leaveVoiceRoom(): Promise<void> {
    console.log('🚪 [AgoraVoice] Leaving Voice Room...');

    await this.stopCloudMusic();
    await this.unpublishMicrophone();

    // إغلاق وتنظيف AudioContext إن وجد
    if (this.audioContext) {
      try {
        if (this.audioContext.state !== 'closed') {
          await this.audioContext.close();
        }
      } catch {
        // ignore
      }
      this.audioContext = null;
    }

    // ===== تنظيف الـ Stream المخزن =====
    clearCachedAudioStream();

    if (this.client && this.isJoined) {
      try {
        await this.client.leave();
      } catch (err) {
        console.warn('⚠️ [AgoraVoice] Client leave error:', err);
      } finally {
        this.client = null;
        this.isJoined = false;
      }
    }

    if (agoraNativeBridge.isAndroidPlatform()) {
      await agoraNativeBridge.stopForegroundAudioService();
    }

    this.pendingAutoplayTracks.clear();
    this.currentChannel = null;
    this.currentUserId = null;
    this.currentRole = 'audience';
    console.log('✅ [AgoraVoice] Voice Room exited cleanly.');
  }
}

export const agoraVoiceManager = new AgoraVoiceManager();
