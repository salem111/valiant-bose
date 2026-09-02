import { Capacitor } from '@capacitor/core';

/**
 * Platform Detection & Environment Helpers
 * أداة الكشف عن منصة التشغيل (أندرويد أو ويب)
 */

export const isNative = Capacitor.isNativePlatform();
export const isAndroid = Capacitor.getPlatform() === 'android';
export const isIOS = Capacitor.getPlatform() === 'ios';
export const isWeb = !isNative;

export function getActivePlatform(): 'android' | 'ios' | 'web' {
  if (isAndroid) return 'android';
  if (isIOS) return 'ios';
  return 'web';
}

export function isAndroidPlatform(): boolean {
  return isAndroid || (isNative && Capacitor.getPlatform() === 'android');
}

export function isWebPlatform(): boolean {
  return isWeb;
}

/**
 * Universal Backend API Base URL Resolver
 * - Android Native / Emulator: http://10.0.2.2:4000
 * - Web Browser / Localhost: http://127.0.0.1:4000
 * - Environment Variable Override: VITE_API_BASE_URL
 */
export function getApiBaseUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (isAndroidPlatform()) {
    return 'http://10.0.2.2:4000';
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://127.0.0.1:4000';
    }
    return `http://${host}:4000`;
  }
  return 'http://127.0.0.1:4000';
}
