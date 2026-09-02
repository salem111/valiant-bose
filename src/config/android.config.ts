/**
 * ============================================================================
 * 📱 إعدادات وتكوين منصة الأندرويد (ANDROID PLATFORM CONFIGURATION)
 * ============================================================================
 * هذا الملف مخصص حصرياً لجميع إعدادات تطبيق الأندرويد (Android Native App).
 * أي تعديل هنا يخص تطبيق الأندرويد فقط ولا يؤثر أبداً على نسخة الويب (Web).
 */

export const androidConfig = {
  // 1. معلومات حزمة التطبيق (App Package & Identifiers)
  app: {
    packageName: 'com.saleem.saleemvoice2',
    appName: 'سليم لايف - غرف صوتية',
    versionName: '1.0.0',
    versionCode: 1,
  },

  // 2. إعدادات Firebase الخاصة بتطبيق الأندرويد
  firebase: {
    projectId: 'salem-adae3',
    appId: '1:12660672530:android:7603d3ca258e60a68370cb',
    apiKey: 'AIzaSyDLT4oOo6GQ3JrXUzIWKGPO_DC9APbiD_o',
    authDomain: 'salem-adae3.firebaseapp.com',
    databaseURL: 'https://salem-adae3-default-rtdb.asia-southeast1.firebasedatabase.app',
    firestoreDatabaseId: '(default)',
    storageBucket: 'salem-adae3.firebasestorage.app',
    messagingSenderId: '12660672530',
  },

  // 3. إعدادات تسجيل الدخول الأصلي للأندرويد (Native Auth: Google & Facebook)
  auth: {
    // معرّف عميل Google للأندرويد والسيرفر
    googleWebClientId: '12660672530-n9rlb05jha2rv93qui1mbnni19l2ei97.apps.googleusercontent.com',
    
    // بصمات الشهادة SHA لتسجيل الدخول بأندرويد (Debug & Release Fingerprints)
    debugSha1: '6b:70:8c:62:8f:5d:ec:42:51:39:d0:e8:41:84:1d:6e:fe:65:7c:4f',
    debugSha256: '75:67:f6:ef:dd:a1:8a:d4:ee:e2:42:17:96:5f:01:0f:2d:b4:ed:ff:fa:e6:64:68:17:6b:30:59:c3:f1:42:a5',
    releaseSha1: '70:35:c5:fa:eb:ef:8d:3f:d3:f7:c1:af:fb:3f:f9:cc:e2:31:ef:42',
    releaseSha256: 'a9:35:7f:83:93:09:3a:de:16:b1:70:66:45:27:2c:d5:b0:63:ac:c6:7a:11:f4:f9:a3:7d:8a:a0:ea:ac:04:30',

    // إجبار ظهور نافذة اختيار الحساب عند كل تسجيل دخول
    forceAccountPicker: true,

    // نطاقات الصلاحيات المطلوبة
    scopes: ['profile', 'email'],

    // إعدادات فيسبوك للأندرويد
    facebookAppId: '997427086443333',
  },

  // 4. إعدادات Agora الصوتية الأصلية للأندرويد (Agora Native Audio)
  agora: {
    appId: '2bea0d6dbd304f6c9517215542b9aec1',
    channelProfile: 'LIVE_BROADCASTING', // البث المباشر
    audioScenario: 'GAME_STREAMING',     // سيناريو الصوت المنخفض للألعاب والغرف
    sampleRate: 48000,
    channels: 2,
    enableHardwareAEC: true,             // عزل الصدى المادي
  },

  // 5. إعدادات شريط الحالة والتنقل في الأندرويد
  ui: {
    statusBarStyle: 'DARK',
    statusBarColor: '#0a0814',
    navigationBarColor: '#0a0814',
    enableGestureBar: true,
  },
};

export default androidConfig;
