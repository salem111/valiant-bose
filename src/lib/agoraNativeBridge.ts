import { Capacitor, registerPlugin } from '@capacitor/core';

interface BackgroundAudioPlugin {
  checkAndRequestPermissions(): Promise<void>;
  requestMicrophonePermission(): Promise<void>;
  requestCameraPermission(): Promise<void>;
  requestBluetoothPermission(): Promise<void>;
  startService(): Promise<void>;
  stopService(): Promise<void>;
}

const BackgroundAudio = registerPlugin<BackgroundAudioPlugin>('BackgroundAudio');

class AgoraNativeBridgeService {
  private isNativeAvailable: boolean = false;

  constructor() {
    this.isNativeAvailable = Capacitor.isNativePlatform();
  }

  public isAndroidPlatform(): boolean {
    return this.isNativeAvailable;
  }

  /**
   * طلب الميكروفون فقط على أندرويد
   */
  async requestMicrophonePermission(): Promise<boolean> {
    if (!this.isNativeAvailable) {
      return true;
    }

    try {
      await BackgroundAudio.requestMicrophonePermission();
      console.log('✅ [Android] Microphone permission granted');
      return true;
    } catch (err) {
      console.error('❌ [Android] Microphone permission denied:', err);
      return false;
    }
  }

  /**
   * طلب الكاميرا فقط على أندرويد
   */
  async requestCameraPermission(): Promise<boolean> {
    if (!this.isNativeAvailable) {
      return true;
    }

    try {
      await BackgroundAudio.requestCameraPermission();
      console.log('✅ [Android] Camera permission granted');
      return true;
    } catch (err) {
      console.error('❌ [Android] Camera permission denied:', err);
      return false;
    }
  }

  /**
   * طلب إذن البلوتوث عند الحاجة (Android 12+)
   */
  async requestBluetoothPermission(): Promise<boolean> {
    if (!this.isNativeAvailable) {
      return true;
    }

    try {
      await BackgroundAudio.requestBluetoothPermission();
      return true;
    } catch (err) {
      console.warn('⚠️ [Android] Bluetooth permission denied:', err);
      return false;
    }
  }

  /**
   * التوافق مع الكود القديم (طلب الميكروفون)
   */
  async requestPermissions(): Promise<boolean> {
    return await this.requestMicrophonePermission();
  }

  /**
   * Start native Android Foreground Service so voice chat continues in the background
   */
  async startForegroundAudioService(_channelName: string): Promise<boolean> {
    if (this.isNativeAvailable) {
      try {
        console.log('🔔 [ForegroundService] Starting background audio service...');
        await BackgroundAudio.startService();
        return true;
      } catch (err) {
        console.warn('⚠️ [ForegroundService] Start service error:', err);
        return false;
      }
    }
    return false;
  }

  /**
   * Stop native Android Foreground Service when exiting room
   */
  async stopForegroundAudioService(): Promise<boolean> {
    if (this.isNativeAvailable) {
      try {
        console.log('🛑 [ForegroundService] Stopping background audio service...');
        await BackgroundAudio.stopService();
        return true;
      } catch (err) {
        console.warn('⚠️ [ForegroundService] Stop service error:', err);
        return false;
      }
    }
    return false;
  }

  /**
   * Control audio route (Speakerphone vs Earpiece)
   */
  setAudioRoute(useSpeakerphone: boolean): void {
    if (typeof window !== 'undefined' && (window as any).Android?.setSpeakerphone) {
      try {
        (window as any).Android.setSpeakerphone(useSpeakerphone);
        console.log(`📢 [Android] Speakerphone set to: ${useSpeakerphone}`);
      } catch (e) {
        console.warn('⚠️ [Android] Failed to set audio route:', e);
      }
    }
  }

  /**
   * Enable high quality audio mode
   */
  enableHighQualityAudio(): void {
    if (typeof window !== 'undefined' && (window as any).Android?.enableHighQualityAudio) {
      try {
        (window as any).Android.enableHighQualityAudio();
        console.log('🎵 [Android] High quality audio enabled');
      } catch (e) {
        console.warn('⚠️ [Android] Failed to enable high quality audio:', e);
      }
    }
  }
}

export const agoraNativeBridge = new AgoraNativeBridgeService();
