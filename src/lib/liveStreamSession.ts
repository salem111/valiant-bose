import { endTrackedLiveAgencySession, beginTrackedLiveAgencySession } from './liveStreamAgencyTracker';

const ACTIVE_STREAM_KEY = 'saleem_active_live_stream_id';

/**
 * Client-side lifecycle guard. The server/RTDB remains the source of truth;
 * this guard prevents duplicate start/stop calls caused by React cleanup cycles.
 */
export async function startLiveStreamSession(userId: string, streamId: string): Promise<boolean> {
  if (!userId || !streamId) return false;
  const active = sessionStorage.getItem(ACTIVE_STREAM_KEY);
  if (active === streamId) return false;

  sessionStorage.setItem(ACTIVE_STREAM_KEY, streamId);
  const tracked = await beginTrackedLiveAgencySession(userId, streamId);
  if (!tracked) sessionStorage.removeItem(ACTIVE_STREAM_KEY);
  return tracked;
}

export async function stopLiveStreamSession(userId: string): Promise<boolean> {
  if (!userId || !sessionStorage.getItem(ACTIVE_STREAM_KEY)) return false;
  sessionStorage.removeItem(ACTIVE_STREAM_KEY);
  return endTrackedLiveAgencySession(userId);
}

export function getActiveLiveStreamId(): string | null {
  return sessionStorage.getItem(ACTIVE_STREAM_KEY);
}
