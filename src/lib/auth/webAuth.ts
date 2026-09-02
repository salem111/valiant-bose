import {
  Auth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { webConfig } from '../../config/web.config';

/**
 * ============================================================================
 * 🌐 تسجيل الدخول الخاص بمتصفح الويب فقط (WEB BROWSER AUTHENTICATION)
 * ============================================================================
 * هذا الملف مسؤول حصرياً عن تسجيل الدخول في متصفح الويب (Chrome, Safari, Edge...).
 * أي تعديل أو ضبط هنا يخص الويب فقط ولا يمس الأندرويد إطلاقاً.
 */

export const webGoogleProvider = new GoogleAuthProvider();
export const webFacebookProvider = new FacebookAuthProvider();

// تخصيص إعدادات المزودات لمتصفح الويب
webGoogleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * تسجيل الدخول بحساب Google على المتصفح (Web Popup / Redirect)
 */
export async function loginWithGoogleWeb(authInstance: Auth): Promise<FirebaseUser | null> {
  console.log('🌐 [Web Auth] Starting Web Google Sign-In...');
  
  try {
    if (webConfig.auth.signInFlow === 'redirect') {
      await signInWithRedirect(authInstance, webGoogleProvider);
      return null;
    }

    const result = await signInWithPopup(authInstance, webGoogleProvider);
    if (result && result.user) {
      console.log('✅ [Web Auth] Google Web sign-in successful:', result.user.uid);
      return result.user;
    }
    return null;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      console.log('ℹ️ [Web Auth] User closed Google popup.');
      return null;
    }
    console.error('❌ [Web Auth] Google Sign-In Error:', error);
    throw error;
  }
}

/**
 * تسجيل الدخول بحساب Facebook على المتصفح
 */
export async function loginWithFacebookWeb(authInstance: Auth): Promise<FirebaseUser | null> {
  console.log('🌐 [Web Auth] Starting Web Facebook Sign-In...');
  
  try {
    if (webConfig.auth.signInFlow === 'redirect') {
      await signInWithRedirect(authInstance, webFacebookProvider);
      return null;
    }

    const result = await signInWithPopup(authInstance, webFacebookProvider);
    if (result && result.user) {
      console.log('✅ [Web Auth] Facebook Web sign-in successful:', result.user.uid);
      return result.user;
    }
    return null;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      console.log('ℹ️ [Web Auth] User closed Facebook popup.');
      return null;
    }
    console.error('❌ [Web Auth] Facebook Sign-In Error:', error);
    throw error;
  }
}

/**
 * تسجيل الخروج من متصفح الويب
 */
export async function logoutWeb(authInstance: Auth): Promise<void> {
  try {
    await firebaseSignOut(authInstance);
    console.log('✅ [Web Auth] Web sign-out completed.');
  } catch (err) {
    console.warn('⚠️ [Web Auth] Sign-out warning:', err);
  }
}
