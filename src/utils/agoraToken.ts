import { getUserAuthToken } from '../lib/firebase';

/**
 * Public Agora identifiers only. The App Certificate must stay on the token
 * service and is never included in the browser/Capacitor bundle.
 */
export const AGORA_CONFIG = {
  appId: (import.meta as any).env?.VITE_AGORA_APP_ID || '2bea0d6dbd304f6c9517215542b9aec1',
};

function getTokenServerBaseUrl(): string {
  const configured = (import.meta as any).env?.VITE_SERVER_API_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  if (typeof window !== 'undefined' && /^https?:$/.test(window.location.protocol)) {
    return window.location.origin;
  }

  return '';
}

/**
 * Obtains a short-lived token from the authenticated token service. A local
 * fallback is deliberately not provided: a fallback would expose the Agora App
 * Certificate and let any downloaded client mint publisher tokens.
 */
export async function fetchAgoraRtcToken(
  channelName: string,
  uid: number,
  role: 'publisher' | 'subscriber' = 'publisher'
): Promise<string> {
  if (!channelName || channelName.length > 64 || !Number.isSafeInteger(uid) || uid <= 0) {
    return '';
  }

  const idToken = await getUserAuthToken();
  const baseUrl = getTokenServerBaseUrl();
  if (!idToken || !baseUrl) {
    console.warn('⚠️ [AgoraToken] يتطلب الصوت جلسة Firebase مسجّلة و VITE_SERVER_API_BASE_URL.');
    return '';
  }

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(`${baseUrl}/api/agora/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ channelName, uid, role }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn('⚠️ [AgoraToken] Token service rejected the request:', response.status);
      return '';
    }

    const payload = await response.json();
    return payload?.uid === uid && typeof payload.token === 'string' ? payload.token : '';
  } catch (error) {
    console.warn('⚠️ [AgoraToken] Secure token request failed:', error);
    return '';
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
