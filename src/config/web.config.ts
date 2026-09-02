/**
 * ============================================================================
 * 🌐 إعدادات وتكوين منصة الويب والمتصفح (WEB PLATFORM CONFIGURATION)
 * ============================================================================
 * هذا الملف مخصص حصرياً لجميع إعدادات نسخة المتصفح والويب (Browser / Web).
 * أي تعديل هنا يخص الويب فقط ولا يؤثر أبداً على تطبيق الأندرويد (Android).
 */

export const webConfig = {
  // 1. معلومات تطبيق الويب (Web App Metadata)
  app: {
    name: 'سليم لايف - نسخة الويب',
    domain: typeof window !== 'undefined' ? window?.location?.hostname || 'localhost' : 'localhost',
    url: typeof window !== 'undefined' ? window?.location?.origin || 'http://localhost:5173' : 'http://localhost:5173',
  },

  // 2. إعدادات Firebase الخاصة بالويب والمتصفح
  firebase: {
    projectId: 'salem-adae3',
    appId: '1:12660672530:web:c3f7deaba3b9e8188370cb',
    apiKey: 'AIzaSyDLT4oOo6GQ3JrXUzIWKGPO_DC9APbiD_o',
    authDomain: 'salem-adae3.firebaseapp.com',
    databaseURL: 'https://salem-adae3-default-rtdb.asia-southeast1.firebasedatabase.app',
    firestoreDatabaseId: '(default)',
    storageBucket: 'salem-adae3.firebasestorage.app',
    messagingSenderId: '12660672530',
  },

  // 3. إعدادات تسجيل الدخول للويب (Web Auth: Popup & Redirect)
  auth: {
    // طريقة ظهور نافذة تسجيل الدخول على الويب ('popup' أو 'redirect')
    signInFlow: 'popup' as 'popup' | 'redirect',

    // نطاقات الصلاحيات المطلوبة
    scopes: ['profile', 'email'],

    // معرّف عميل Google لمتصفحات الويب
    googleOAuthClientId: '12660672530-n9rlb05jha2rv93qui1mbnni19l2ei97.apps.googleusercontent.com',

    // اللغات المعتمدة للواجهة
    languageCode: 'ar',
  },

  // 4. إعدادات Agora للويب (Agora WebRTC Audio SDK)
  agora: {
    appId: '2bea0d6dbd304f6c9517215542b9aec1',
    mode: 'live' as 'live' | 'rtc',
    codec: 'vp8' as 'vp8' | 'h264',
    enableWebAudioFilter: true,
  },

  // 5. إعدادات محاكاة إطار الهاتف على الشاشات الكبيرة (Phone Frame Simulator)
  ui: {
    enableDesktopPhoneFrame: true,
    phoneFrameMaxWidth: 440,
    showWebBackgroundEffects: true,
  },
};

export default webConfig;
