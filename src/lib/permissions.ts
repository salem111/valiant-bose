import { agoraNativeBridge } from './agoraNativeBridge';
import { isAndroidPlatform } from '../config/platform';

/**
 * ============================================================================
 * 🎙️📷 نظام إدارة صلاحيات الميكروفون والكاميرا الموحد (Web & Android Permissions)
 * ============================================================================
 */

export interface PermissionResult {
  granted: boolean;
  error?: string;
}

export interface StartupPermissionsResult {
  microphone: boolean;
  camera: boolean;
}

// Cached audio stream for Web & WebView to keep the microphone pipe active and prevent re-prompting
let cachedAudioStream: MediaStream | null = null;
let cachedVideoStream: MediaStream | null = null;

export function getCachedAudioStream(): MediaStream | null {
  if (cachedAudioStream && cachedAudioStream.active && cachedAudioStream.getAudioTracks().some((t) => t.readyState === 'live')) {
    return cachedAudioStream;
  }
  return null;
}

export function clearCachedAudioStream(): void {
  if (cachedAudioStream) {
    try {
      cachedAudioStream.getTracks().forEach((track) => track.stop());
    } catch {
      // ignore
    }
    cachedAudioStream = null;
    console.log('🔇 [Permissions] Cached audio stream cleared & released.');
  }
}

// Aliases for compatibility
export const getGlobalAudioStream = getCachedAudioStream;
export const stopGlobalAudioStream = clearCachedAudioStream;

/**
 * طلب صلاحية الميكروفون الموحدة (يعمل على أندرويد والويب بدقة)
 */
export async function requestMicrophonePermissionUnified(): Promise<PermissionResult> {
  console.log('🎙️ [Permissions] Requesting Microphone permission for platform:', isAndroidPlatform() ? 'Android' : 'Web');

  // 1. طلب إذن الميكروفون على نظام أندرويد عبر الـ Native Plugin
  if (isAndroidPlatform()) {
    try {
      const granted = await agoraNativeBridge.requestMicrophonePermission();
      if (!granted) {
        return {
          granted: false,
          error: 'تم رفض صلاحية الميكروفون من Android. يرجى تفعيلها من إعدادات التطبيق.',
        };
      }
      // Android permission is already granted natively. Do NOT open a second
      // WebView getUserMedia stream here; Agora creates and owns the microphone
      // track itself. Keeping a test stream alive can lock the mic hardware.
      return { granted: true };
    } catch (e) {
      console.error('❌ [Permissions Android] Microphone permission error:', e);
      return {
        granted: false,
        error: 'فشل في طلب صلاحية الميكروفون على Android.',
      };
    }
  }

  // Web: getUserMedia is used only as a permission probe. Immediately release
  // the test stream so Agora remains the sole owner of the microphone device.
  // 2. التحقق الفعلي من صلاحية الميكروفون عبر getUserMedia
  if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (isAndroidPlatform()) {
      return { granted: true };
    }
    return {
      granted: false,
      error: 'خدمة تسجيل الصوت (getUserMedia) غير متاحة في هذا المتصفح.',
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1, // Mono لتقليل استهلاك البيانات والصدى
      },
    });

    stream.getTracks().forEach((track) => track.stop());
    console.log('✅ [Permissions] Microphone permission verified; test stream released for Agora.');
    return { granted: true };
  } catch (err: any) {
    console.error('❌ [Permissions] Microphone getUserMedia failed:', err);

    let friendlyMsg = 'يرجى السماح بالوصول إلى الميكروفون من إعدادات المتصفح أو التطبيق.';
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      friendlyMsg = 'تم رفض إذن الميكروفون. يرجى تفعيله من إعدادات الجهاز/المتصفح للمشاركة بالصوت.';
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      friendlyMsg = 'لم يتم العثور على ميكروفون متصل بجهازك.';
    }

    return {
      granted: false,
      error: friendlyMsg,
    };
  }
}

/**
 * طلب صلاحية الكاميرا الموحدة (يعمل على أندرويد والويب بدقة)
 */
export async function requestCameraPermissionUnified(): Promise<PermissionResult> {
  console.log('📷 [Permissions] Requesting Camera permission for platform:', isAndroidPlatform() ? 'Android' : 'Web');

  if (isAndroidPlatform()) {
    try {
      const granted = await agoraNativeBridge.requestCameraPermission();
      if (!granted) {
        return { granted: false, error: 'تم رفض صلاحية الكاميرا من Android.' };
      }
      // Do not keep a WebView camera stream alive; the actual broadcaster owns it.
      return { granted: true };
    } catch (e) {
      console.warn('⚠️ [Permissions Android] Native camera request error:', e);
      return { granted: false, error: 'فشل في طلب صلاحية الكاميرا على الأندرويد' };
    }
  }

  if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      granted: false,
      error: 'خدمة الكاميرا غير متاحة في هذا المتصفح.',
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });

    stream.getTracks().forEach((track) => track.stop());
    console.log('✅ [Permissions] Camera permission verified; test stream released.');
    return { granted: true };
  } catch (err: any) {
    console.error('❌ [Permissions] Camera access denied or failed:', err);

    let friendlyMsg = 'يرجى السماح بالوصول إلى الكاميرا من إعدادات المتصفح أو التطبيق.';
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      friendlyMsg = 'تم رفض إذن الكاميرا. يرجى تفعيله من إعدادات الجهاز/المتصفح لاستخدام الفيديو والبث المباشر.';
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      friendlyMsg = 'لم يتم العثور على كاميرا متصلة بجهازك.';
    }

    return {
      granted: false,
      error: friendlyMsg,
    };
  }
}

// دالة تنظيف شاملة
export function clearAllCachedStreams(): void {
  clearCachedAudioStream();
  if (cachedVideoStream) {
    try {
      cachedVideoStream.getTracks().forEach((track) => track.stop());
    } catch {
      // ignore
    }
    cachedVideoStream = null;
    console.log('📷 [Permissions] Cached video stream cleared & released.');
  }
}

/**
 * طلب صلاحيات الميكروفون والكاميرا عند فتح التطبيق
 */
export async function requestStartupPermissionsUnified(): Promise<StartupPermissionsResult> {
  console.log('🚀 [Permissions] Requesting startup permissions (Mic + Camera)...');

  if (isAndroidPlatform()) {
    const microphone = await agoraNativeBridge.requestMicrophonePermission();
    const camera = await agoraNativeBridge.requestCameraPermission();
    return {
      microphone,
      camera,
    };
  }

  const micRes = await requestMicrophonePermissionUnified();
  const camRes = await requestCameraPermissionUnified();

  return {
    microphone: micRes.granted,
    camera: camRes.granted,
  };
}

/**
 * فحص حالة صلاحية الميكروفون الحالية إن أمكن
 */
export async function checkMicrophonePermissionState(): Promise<'granted' | 'denied' | 'prompt'> {
  if (typeof navigator !== 'undefined' && (navigator as any).permissions && (navigator as any).permissions.query) {
    try {
      const status = await (navigator as any).permissions.query({ name: 'microphone' });
      return status.state as 'granted' | 'denied' | 'prompt';
    } catch {
      return 'prompt';
    }
  }
  return 'prompt';
}

/**
 * فحص حالة صلاحية الكاميرا الحالية إن أمكن
 */
export async function checkCameraPermissionState(): Promise<'granted' | 'denied' | 'prompt'> {
  if (typeof navigator !== 'undefined' && (navigator as any).permissions && (navigator as any).permissions.query) {
    try {
      const status = await (navigator as any).permissions.query({ name: 'camera' });
      return status.state as 'granted' | 'denied' | 'prompt';
    } catch {
      return 'prompt';
    }
  }
  return 'prompt';
}
