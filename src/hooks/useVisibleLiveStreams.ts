import { useMemo } from 'react';
import type { LiveStreamData } from '../lib/firebase';
import { normalizeActiveLiveStreams } from '../lib/liveStreamPolicy';

export function useVisibleLiveStreams(streams: LiveStreamData[] | null | undefined) {
  return useMemo(() => normalizeActiveLiveStreams(Array.isArray(streams) ? streams : []), [streams]);
}
