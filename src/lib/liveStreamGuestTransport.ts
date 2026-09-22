import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { fetchAgoraRtcToken } from '../utils/agoraToken';
import { getAgoraNumericUid } from './agoraVoiceManager';

export interface LiveGuestTransport {
  client: IAgoraRTCClient;
  microphone: IMicrophoneAudioTrack;
  camera: ICameraVideoTrack;
  uid: number;
}

/**
 * Joins an accepted live-stream guest to the broadcaster's existing Agora
 * channel as a publisher and publishes the guest's audio/video tracks.
 *
 * The caller must invoke this only after the host has accepted the request and
 * the live_streams record contains guestId/hasGuest. The server then grants the
 * publisher token through its existing live-stream authorization path.
 */
export async function joinLiveStreamAsGuest(params: {
  channelName: string;
  userId: string;
  cameraFacingMode?: 'user' | 'environment';
  videoElement?: HTMLVideoElement | null;
}): Promise<LiveGuestTransport> {
  const { channelName, userId, cameraFacingMode = 'user', videoElement } = params;
  const uid = getAgoraNumericUid(userId);
  const token = await fetchAgoraRtcToken(channelName, uid, 'publisher');
  if (!token) throw new Error('تعذر إصدار توكن الناشر للضيف');

  const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
  await client.setClientRole('host');
  await client.join(
    (import.meta as any).env?.VITE_AGORA_APP_ID || '2bea0d6dbd304f6c9517215542b9aec1',
    channelName,
    token,
    uid,
  );

  const [microphone, camera] = await Promise.all([
    AgoraRTC.createMicrophoneAudioTrack({ encoderConfig: 'high_quality', AEC: true, ANS: true, AGC: true }),
    AgoraRTC.createCameraVideoTrack({ facingMode: cameraFacingMode, encoderConfig: '720p_1' }),
  ]);

  if (videoElement) camera.play(videoElement);
  await client.publish([microphone, camera]);

  return { client, microphone, camera, uid };
}

export async function leaveLiveStreamAsGuest(transport: LiveGuestTransport | null): Promise<void> {
  if (!transport) return;
  try {
    await transport.client.unpublish([transport.microphone, transport.camera]);
  } catch {
    // Continue cleanup even if the connection already dropped.
  }
  transport.microphone.stop();
  transport.microphone.close();
  transport.camera.stop();
  transport.camera.close();
  await transport.client.leave().catch(() => {});
}
