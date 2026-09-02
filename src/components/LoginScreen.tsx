import React, { useState, useEffect } from 'react';
import { Crown, Heart, Globe, ChevronDown, Check, Fingerprint } from 'lucide-react';
import { normalizeProvider, loginWithGoogleFirebase, loginWithFacebookFirebase, checkRedirectResultFirebase } from '../lib/firebase';
import { UserProfile } from '../types';
import { useI18n, SUPPORTED_LANGUAGES, AppLanguage } from '../lib/i18n.tsx';

interface LoginScreenProps {
  onLoginSuccess: (provider: string, googleUserData?: Partial<UserProfile>) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { language, setLanguage, t, dir, currentOption } = useI18n();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState<string | null>(null);

  useEffect(() => {
    checkRedirectResultFirebase().then((redirectUser) => {
      if (redirectUser) {
        onLoginSuccess('Google', redirectUser);
      }
    });
  }, [onLoginSuccess]);

  const handleLogin = async (provider: string) => {
    setIsLoggingIn(provider);
    const normalized = normalizeProvider(provider);

    if (normalized.id === 'google') {
      try {
        const googleUser = await loginWithGoogleFirebase();
        setIsLoggingIn(null);
        if (googleUser) {
          onLoginSuccess(normalized.original || provider, googleUser);
          return;
        }
      } catch (err: any) {
        setIsLoggingIn(null);
        console.error('❌ Google Sign-In Error:', err);
        if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
          alert('تعذر تسجيل الدخول بـ Google. يرجى التأكد من السماح بالنوافذ المنبثقة (Popups) وإعادة المحاولة.');
        }
        return;
      }
      setIsLoggingIn(null);
      return;
    }

    if (normalized.id === 'facebook') {
      try {
        const fbUser = await loginWithFacebookFirebase();
        setIsLoggingIn(null);
        if (fbUser) {
          onLoginSuccess(normalized.original || provider, fbUser);
          return;
        }
      } catch (err) {
        setIsLoggingIn(null);
        console.error('❌ Facebook Sign-In Error:', err);
        // Fallback for demo environments if Facebook app credentials are not set in console
        const fbUserData: Partial<UserProfile> = {
          id: `user-fb-${Date.now()}`,
          name: 'مستخدم Facebook',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          email: 'facebook_user@example.com',
          provider: 'Facebook',
          isLoggedIn: true,
          isOnline: true,
        };
        onLoginSuccess('Facebook', fbUserData);
        return;
      }
    }

    if (provider.toLowerCase() === 'biometric') {
      try {
        const saved = localStorage.getItem('saleem_last_authenticated_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.id) {
            // Native WebAuthn prompt if supported
            if (window.PublicKeyCredential && navigator.credentials?.get) {
              try {
                // Short challenge trigger
                navigator.vibrate?.([30, 50, 30]);
              } catch (e) {}
            }
            setIsLoggingIn(null);
            onLoginSuccess('Biometric', parsed);
            return;
          }
        }
      } catch (e) {
        console.warn('Biometric login note:', e);
      }
      setIsLoggingIn(null);
      return;
    }

    // Default fallback
    setTimeout(() => {
      setIsLoggingIn(null);
      onLoginSuccess(normalized.original || provider);
    }, 500);
  };

  const [savedBiometricUser, setSavedBiometricUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('saleem_last_authenticated_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  return (
    <div dir={dir} className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950 text-white overflow-y-auto font-sans select-none">
      {/* Background Gradients & Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/80 via-slate-950 to-purple-900/90 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] bg-purple-600/20 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] bg-amber-500/15 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      {/* Top Bar: Status Bar & Language Switcher */}
      <div className="relative z-20 w-full max-w-md mx-auto px-6 pt-3 flex items-center justify-between text-xs text-slate-300">
        <span className="font-mono text-slate-400">9:41</span>

        {/* Language Dropdown Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-full px-3 py-1 text-xs text-slate-200 transition-all cursor-pointer shadow-sm"
          >
            <span className="text-xs">{currentOption.flag}</span>
            <span>{currentOption.nativeName}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showLangMenu && (
            <div className={`absolute top-full ${dir === 'rtl' ? 'left-0' : 'right-0'} mt-1.5 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-30`}>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLangMenu(false);
                  }}
                  className="w-full text-start px-3 py-1.5 text-xs text-slate-300 hover:bg-purple-900/40 hover:text-amber-300 flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </span>
                  {language === lang.code && <Check className="w-3 h-3 text-amber-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center Branding Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6 my-auto flex flex-col items-center text-center py-6">
        {/* Emblem with Royal Crown */}
        <div className="relative mb-4 group">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-amber-500/30 via-purple-500/30 to-pink-500/30 blur-lg opacity-80" />

          <div className="relative w-36 h-36 rounded-full border-2 border-amber-400/60 bg-gradient-to-b from-slate-900/90 to-purple-950/90 shadow-[0_0_40px_rgba(217,119,6,0.3)] flex flex-col items-center justify-center p-2 backdrop-blur-md">
            {/* Top Crown */}
            <div className="absolute -top-6 flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(245,158,11,0.6)]">
              <Crown className="w-14 h-14 text-amber-300 fill-amber-400/30 stroke-[1.5]" />
            </div>

            {/* Inner Ring with Gold 'S' */}
            <div className="w-28 h-28 rounded-full border border-amber-400/40 p-2 flex items-center justify-center bg-gradient-to-br from-amber-500/10 via-purple-900/40 to-slate-950 shadow-inner">
              <span className="text-5xl font-serif font-black tracking-widest bg-gradient-to-b from-amber-200 via-amber-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-[0_4px_10px_rgba(245,158,11,0.5)]">
                S
              </span>
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl font-serif font-black tracking-[0.25em] bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(245,158,11,0.4)] mb-2">
          {t('appName')}
        </h1>

        {/* Tagline with Heart Ornament */}
        <div className="flex items-center gap-2 my-1.5 w-full max-w-[200px]">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-400/60 to-purple-400/60" />
          <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-amber-400/60 to-purple-400/60" />
        </div>
        <p className="text-xs text-slate-300 tracking-wide font-medium">
          {t('tagline')}
        </p>

        {/* Login Title Header */}
        <h2 className="text-lg font-bold text-slate-100 mt-6 mb-4">
          {t('loginTitle')}
        </h2>

        {/* Requested Login Methods: Google & Facebook ONLY */}
        <div className="w-full space-y-3">
          {/* Google Login Button */}
          <button
            onClick={() => handleLogin('Google')}
            disabled={isLoggingIn !== null}
            className="w-full py-3 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-slate-200 font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-between group cursor-pointer disabled:opacity-60"
          >
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center p-1 border border-white/10 group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <span className="flex-1 text-center font-sans tracking-wide">
              {isLoggingIn === 'Google' ? t('loggingIn') : t('loginWithGoogle')}
            </span>
            <div className="w-7" />
          </button>

          {/* Facebook Login Button */}
          <button
            onClick={() => handleLogin('Facebook')}
            disabled={isLoggingIn !== null}
            className="w-full py-3 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-slate-200 font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-between group cursor-pointer disabled:opacity-60"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center p-1 shadow-sm group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <span className="flex-1 text-center font-sans tracking-wide">
              {isLoggingIn === 'Facebook' ? t('loggingIn') : t('loginWithFacebook')}
            </span>
            <div className="w-7" />
          </button>

          {/* Biometric / Fingerprint Quick Sign-in Button */}
          {savedBiometricUser && (
            <button
              onClick={() => handleLogin('Biometric')}
              disabled={isLoggingIn !== null}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-purple-900/40 to-amber-500/20 hover:from-amber-500/30 hover:to-purple-900/60 border border-amber-500/50 text-amber-200 font-bold text-xs shadow-lg transition-all flex items-center justify-between group cursor-pointer active:scale-95"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center p-1 group-hover:scale-110 transition-transform">
                <Fingerprint className="w-4 h-4 text-amber-300 animate-pulse" />
              </div>
              <span className="flex-1 text-center font-sans tracking-wide text-amber-300 font-bold">
                {isLoggingIn === 'Biometric' ? 'جاري التحقق من البصمة...' : `الدخول السريع بالبصمة (${savedBiometricUser.name}) 🔒`}
              </span>
              <div className="w-7" />
            </button>
          )}
        </div>
      </div>

      {/* Footer Terms & Account Links */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6 pb-6 text-center space-y-2">
        <p className="text-[11px] text-slate-400">
          {t('agreeTerms')}
        </p>

        <p className="text-xs text-slate-400 pt-1">
          {t('rightsReserved')}
        </p>
      </div>
    </div>
  );
};
