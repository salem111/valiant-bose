import { RoomMusicState, CloudTrack } from '../types';

/**
 * ============================================================================
 * 🎵 محرك مزامنة وتشغيل الصوت والموسيقى الموحد (AUDIO SYNC & UNLOCK ENGINE)
 * ============================================================================
 * يضمن تشغيل الموسيقى ومزامنتها بين مستخدمي الأندرويد والويب في نفس الغرفة بدون أي تأخير،
 * ويفك حظر التشغيل التلقائي (Autoplay Policy) على المتصفحات ونظام الأندرويد فور أول لمسة.
 */

class AudioSyncEngine {
  private audioContext: AudioContext | null = null;
  private isUnlocked: boolean = false;
  private unlockListenersAttached: boolean = false;

  constructor() {
    this.initAutoUnlock();
  }

  /**
   * إرفاق مستمعات فك الحظر التلقائي عند أول تفاعل من المستخدم
   */
  public initAutoUnlock(): void {
    if (typeof window === 'undefined' || this.unlockListenersAttached) return;
    this.unlockListenersAttached = true;

    const unlockHandler = () => {
      this.unlockAudio();
      window.removeEventListener('click', unlockHandler);
      window.removeEventListener('touchstart', unlockHandler);
      window.removeEventListener('touchend', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);
    };

    window.addEventListener('click', unlockHandler, { once: true, passive: true });
    window.addEventListener('touchstart', unlockHandler, { once: true, passive: true });
    window.addEventListener('touchend', unlockHandler, { once: true, passive: true });
    window.addEventListener('keydown', unlockHandler, { once: true, passive: true });
  }

  /**
   * فك حظر نظام الصوت لـ Web Audio API و HTML5 Audio
   */
  public async unlockAudio(): Promise<boolean> {
    if (this.isUnlocked) return true;

    try {
      // 1. فك حظر AudioContext
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioContext || this.audioContext.state === 'closed') {
          this.audioContext = new AudioCtx();
        }
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }

        // تشغيل صوت صامت مدته جزء من الثانية لفك القفل نهائياً
        const buffer = this.audioContext.createBuffer(1, 1, 22050);
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);
      }

      this.isUnlocked = true;
      console.log('🔓 [AudioSyncEngine] Audio system successfully unlocked for Web & Android.');
      return true;
    } catch (err) {
      console.warn('⚠️ [AudioSyncEngine] Unlock audio warning:', err);
      return false;
    }
  }

  /**
   * حساب التوقيت الدقيق بالميلي ثانية للمزامنة اللحظية
   */
  public calculateSyncedOffset(startedAt?: number): number {
    if (!startedAt) return 0;
    const now = Date.now();
    const elapsedMs = Math.max(0, now - startedAt);
    return elapsedMs / 1000; // بالثواني
  }

  /**
   * توليد رابط YouTube مخصص للمزامنة مع بدء التشغيل عند الثانية المحددة
   */
  public buildSyncedYouTubeUrl(
    videoId: string,
    startedAt?: number,
    mode: 'video' | 'audio_only' = 'video'
  ): string {
    const startSec = Math.floor(this.calculateSyncedOffset(startedAt));
    const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';

    // إعدادات البث لضمان التشغيل التلقائي على الأندرويد والويب
    const params = new URLSearchParams({
      autoplay: '1',
      enablejsapi: '1',
      playsinline: '1',
      rel: '0',
      start: String(startSec),
      origin: origin || 'http://localhost',
      widget_referrer: origin || 'http://localhost',
    });

    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
  }

  /**
   * مزامنة وتشغيل عنصر HTML5 Audio
   */
  public async syncHtml5Audio(
    audioEl: HTMLAudioElement | null,
    track: CloudTrack,
    startedAt?: number,
    volume: number = 85
  ): Promise<boolean> {
    if (!audioEl || !track || !track.url) return false;

    try {
      await this.unlockAudio();

      const targetUrl = track.url;
      const syncedSeconds = this.calculateSyncedOffset(startedAt);

      if (audioEl.src !== targetUrl) {
        audioEl.src = targetUrl;
      }

      audioEl.volume = Math.max(0, Math.min(1, volume / 100));

      // ضبط التوقيت إذا كان الفارق أكثر من ثانية ونصف
      if (Math.abs(audioEl.currentTime - syncedSeconds) > 1.5) {
        try {
          audioEl.currentTime = syncedSeconds;
        } catch (e) {
          // قد يفشل التقديم قبل تحميل البيانات الوصفية (Metadata)
        }
      }

      await audioEl.play();
      console.log(`▶️ [AudioSyncEngine] Playing synced track "${track.name}" at ${syncedSeconds.toFixed(1)}s`);
      return true;
    } catch (err) {
      console.warn('⚠️ [AudioSyncEngine] HTML5 Audio play deferred until interaction:', err);
      return false;
    }
  }
}

export const audioSyncEngine = new AudioSyncEngine();
