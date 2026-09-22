import type { LiveStreamData } from './firebase';

/** A live card is displayable only while its owner explicitly reports it live. */
export const LIVE_STREAM_STALE_AFTER_MS = 90_000;

export function isLiveStreamActive(stream: LiveStreamData, now = Date.now()): boolean {
  if (!stream?.streamId || !stream.ownerId || stream.isLive !== true) return false;
  if (!Number.isFinite(stream.updatedAt)) return false;
  return now - stream.updatedAt <= LIVE_STREAM_STALE_AFTER_MS;
}

/**
 * Removes stale and duplicate cards. A user can have only one visible live room;
 * the newest record wins if old records were left behind by a crashed client.
 */
export function normalizeActiveLiveStreams(
  streams: LiveStreamData[],
  now = Date.now(),
): LiveStreamData[] {
  const byOwner = new Map<string, LiveStreamData>();

  for (const stream of streams) {
    if (!isLiveStreamActive(stream, now)) continue;
    const previous = byOwner.get(stream.ownerId);
    if (!previous || stream.updatedAt > previous.updatedAt) {
      byOwner.set(stream.ownerId, stream);
    }
  }

  return [...byOwner.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function canStartAnotherLiveStream(
  streams: LiveStreamData[],
  ownerId: string,
  now = Date.now(),
): boolean {
  return !normalizeActiveLiveStreams(streams, now).some((stream) => stream.ownerId === ownerId);
}

/** Likes/taps are social engagement only and must never update agency targets. */
export function clampLiveTapCount(value: number): number {
  return Math.max(1, Math.min(20, Math.floor(Number(value) || 1)));
}

export function getLiveEngagementDelta(previous: number, requested = 1): number {
  return Math.max(0, clampLiveTapCount(requested) + Math.max(0, previous) - Math.max(0, previous));
}
