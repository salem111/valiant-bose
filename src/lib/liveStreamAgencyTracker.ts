import { startAgencyLiveSession, stopAgencyLiveSession } from './agencyService';

const LIVE_AGENCY_TRACK_KEY = 'saleem_live_stream_agency_session';

function getLiveAgencySessionKey(userId: string, streamId: string): string {
  return `user:${userId}:stream:${streamId}`;
}

/**
 * Tracks a live stream as an agency activity session so it contributes to the same
 * target timer used by voice rooms.
 *
 * This is a guarded layer intended to avoid double-accounting when the live modal
 * opens/closes multiple times or when cleanup runs immediately after stop.
 */
export async function beginTrackedLiveAgencySession(userId: string, streamId: string): Promise<boolean> {
  if (!userId || !streamId) return false;

  const sessionKey = getLiveAgencySessionKey(userId, streamId);
  const current = sessionStorage.getItem(LIVE_AGENCY_TRACK_KEY);

  if (current === sessionKey) {
    return false;
  }

  sessionStorage.setItem(LIVE_AGENCY_TRACK_KEY, sessionKey);
  try {
    startAgencyLiveSession(userId, streamId);
    return true;
  } catch {
    sessionStorage.removeItem(LIVE_AGENCY_TRACK_KEY);
    return false;
  }
}

/**
 * Ends the currently tracked live stream agency session and prevents duplicate
 * time accumulation for the same session.
 */
export async function endTrackedLiveAgencySession(userId: string): Promise<boolean> {
  if (!userId) return false;

  const activeKey = sessionStorage.getItem(LIVE_AGENCY_TRACK_KEY);
  if (!activeKey || !activeKey.startsWith(`user:${userId}:stream:`)) {
    return false;
  }

  sessionStorage.removeItem(LIVE_AGENCY_TRACK_KEY);

  try {
    await stopAgencyLiveSession(userId);
    return true;
  } catch {
    return false;
  }
}

export function hasLiveAgencySessionTracking(userId: string): boolean {
  const activeKey = sessionStorage.getItem(LIVE_AGENCY_TRACK_KEY);
  return Boolean(activeKey && activeKey.startsWith(`user:${userId}:stream:`));
}
