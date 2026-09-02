import { registerPlugin } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { FacebookLogin } from '@capacitor-community/facebook-login';
import {
  Auth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithCredential,
  User as FirebaseUser,
} from 'firebase/auth';
import { androidConfig } from '../../config/android.config';

/**
 * ============================================================================
 * 📱 تسجيل الدخول الخاص بالأندرويد فقط (ANDROID NATIVE AUTHENTICATION)
 * ============================================================================
 * هذا الملف مسؤول حصرياً عن تسجيل الدخول الأصلي في تطبيق الأندرويد.
 * أي تعديل أو إصلاح هنا يخص الأندرويد فقط ولا يمس الويب إطلاقاً.
 */

interface GooglePlayServicesPlugin {
  isAvailable(): Promise<{ available: boolean }>;
}

const GooglePlayServices = registerPlugin<GooglePlayServicesPlugin>('GooglePlayServices');

/**
 * فحص توفر خدمات Google Play على جهاز الأندرويد
 */
export async function checkAndroidGooglePlayServices(): Promise<boolean> {
  try {
    const res = await GooglePlayServices.isAvailable();
    return Boolean(res && res.available);
  } catch (err) {
    console.warn('⚠️ [Android GMS] Check defaulted to available:', err);
    return true;
  }
}

/**
 * تسجيل الدخول بحساب Google على نظام أندرويد
 * يفتح نافذة النظام الرسمية (Native Account Picker) ويوحد جلسة Firebase Web SDK
 */
export async function loginWithGoogleAndroid(authInstance?: Auth): Promise<FirebaseUser | any | null> {
  console.log('📱 [Android Auth] Starting native Google Sign-In...');
  
  try {
    // 1. تسجيل الخروج للتأكد من ظهور نافذة اختيار الحسابات
    if (androidConfig.auth.forceAccountPicker) {
      try {
        await FirebaseAuthentication.signOut();
      } catch (e) {
        // تجاهل في حالة عدم تسجيل الدخول مسبقاً
      }
    }

    // 2. طلب تسجيل الدخول الأصلي من نظام أندرويد
    const result = await FirebaseAuthentication.signInWithGoogle({
      scopes: androidConfig.auth.scopes,
    });

    if (result && result.user) {
      console.log('✅ [Android Auth] Native Google sign-in successful:', result.user.uid);

      const normalizedUser = {
        ...result.user,
        id: result.user.uid,
        name: result.user.displayName || (result.user as any).name || 'مستخدم Google',
        avatar: (result.user as any).photoUrl || (result.user as any).photoURL || result.user.photoUrl || '',
        email: result.user.email || '',
      };

      // 3. مزامنة جلسة الـ Web Firebase Auth عبر ה- idToken في الخلفية بدون حجب
      if (authInstance && result.credential?.idToken) {
        try {
          const credential = GoogleAuthProvider.credential(result.credential.idToken);
          signInWithCredential(authInstance, credential).catch((credErr) => {
            console.warn('⚠️ [Android Auth] Credential bridge note:', credErr);
          });
        } catch (credErr) {
          console.warn('⚠️ [Android Auth] Credential bridge note:', credErr);
        }
      }

      return normalizedUser;
    }

    return null;
  } catch (error: any) {
    if (error.code === 'auth/cancelled' || error.message?.includes('cancel') || error.message?.includes('12501')) {
      console.log('ℹ️ [Android Auth] User cancelled Google Sign-In.');
      return null;
    }
    console.error('❌ [Android Auth] Google Sign-In Error:', error);
    throw error;
  }
}

/**
 * تسجيل الدخول بحساب Facebook على نظام أندرويد
 */
export async function loginWithFacebookAndroid(authInstance?: Auth): Promise<FirebaseUser | any | null> {
  console.log('📱 [Android Auth] Starting native Facebook Sign-In...');
  
  try {
    try {
      await FirebaseAuthentication.signOut();
    } catch (e) {}

    const result = await FirebaseAuthentication.signInWithFacebook({
      scopes: ['public_profile', 'email'],
    });

    if (result && result.user) {
      console.log('✅ [Android Auth] Native Facebook sign-in successful:', result.user.uid);

      const normalizedUser = {
        ...result.user,
        id: result.user.uid,
        name: result.user.displayName || (result.user as any).name || 'مستخدم Facebook',
        avatar: (result.user as any).photoUrl || (result.user as any).photoURL || result.user.photoUrl || '',
        email: result.user.email || '',
      };

      if (authInstance && result.credential?.idToken) {
        try {
          const credential = FacebookAuthProvider.credential(result.credential.idToken);
          signInWithCredential(authInstance, credential).catch((credErr) => {
            console.warn('⚠️ [Android Auth] Facebook credential bridge note:', credErr);
          });
        } catch (credErr) {
          console.warn('⚠️ [Android Auth] Facebook credential bridge note:', credErr);
        }
      }

      return normalizedUser;
    }

    return null;
  } catch (error: any) {
    if (error.code === 'auth/cancelled' || error.message?.includes('cancel')) {
      console.log('ℹ️ [Android Auth] User cancelled Facebook Sign-In.');
      return null;
    }
    console.error('❌ [Android Auth] Facebook Sign-In Error:', error);
    throw error;
  }
}

/**
 * تسجيل الخروج من أندرويد
 */
export async function logoutAndroid(): Promise<void> {
  try {
    await FirebaseAuthentication.signOut();
    try {
      await FacebookLogin.logout();
    } catch (e) {}
    console.log('✅ [Android Auth] Native sign-out completed.');
  } catch (err) {
    console.warn('⚠️ [Android Auth] Sign-out warning:', err);
  }
}
