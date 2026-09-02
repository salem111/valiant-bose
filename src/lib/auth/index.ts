import { Auth, User as FirebaseUser } from 'firebase/auth';
import { isAndroidPlatform } from '../../config/platform';
import { loginWithGoogleAndroid, loginWithFacebookAndroid, logoutAndroid } from './androidAuth';
import { loginWithGoogleWeb, loginWithFacebookWeb, logoutWeb } from './webAuth';

/**
 * ============================================================================
 * 🔄 المحوّل الموحد للمصادقة (UNIFIED AUTH DISPATCHER)
 * ============================================================================
 * يقوم بتوجيه طلب تسجيل الدخول للملف المخصص (أندرويد أو ويب) دون أي تداخل:
 * - إذا كان التطبيق يعمل على أندرويد -> يوجه إلى `src/lib/auth/androidAuth.ts`
 * - إذا كان التطبيق يعمل على المتصفح -> يوجه إلى `src/lib/auth/webAuth.ts`
 */

export async function loginWithGoogleUnified(
  authInstance: Auth,
  onUserSync: (user: FirebaseUser, provider: string) => Promise<any>
): Promise<any | null> {
  let user: FirebaseUser | null = null;

  if (isAndroidPlatform()) {
    console.log('📱 [Auth Dispatcher] Routing Google Login to Android Native Handler...');
    user = await loginWithGoogleAndroid(authInstance);
  } else {
    console.log('🌐 [Auth Dispatcher] Routing Google Login to Web Browser Handler...');
    user = await loginWithGoogleWeb(authInstance);
  }

  if (user) {
    return await onUserSync(user, 'Google');
  }
  return null;
}

export async function loginWithFacebookUnified(
  authInstance: Auth,
  onUserSync: (user: FirebaseUser, provider: string) => Promise<any>
): Promise<any | null> {
  let user: FirebaseUser | null = null;

  if (isAndroidPlatform()) {
    console.log('📱 [Auth Dispatcher] Routing Facebook Login to Android Native Handler...');
    user = await loginWithFacebookAndroid(authInstance);
  } else {
    console.log('🌐 [Auth Dispatcher] Routing Facebook Login to Web Browser Handler...');
    user = await loginWithFacebookWeb(authInstance);
  }

  if (user) {
    return await onUserSync(user, 'Facebook');
  }
  return null;
}

export async function logoutUnified(authInstance: Auth): Promise<void> {
  if (isAndroidPlatform()) {
    await logoutAndroid();
  }
  await logoutWeb(authInstance);
}

export * from './androidAuth';
export * from './webAuth';
