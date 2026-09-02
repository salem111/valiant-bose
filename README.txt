SALEEM - Audio/Voice Room Fix

Replace these files using the same folder paths:
- src/lib/agoraVoiceManager.ts
- src/components/VoiceRoomModal.tsx
- src/components/LiveStreamModal.tsx

Main fixes:
- Reuse the authorized WebView microphone stream before opening another capture pipe.
- Ensure microphone is actually published only after Agora is CONNECTED.
- Force remote Agora audio playback to volume 100 with autoplay retry support.
- Subscribe to existing remote audio tracks after joining the voice room.
- Enable Agora volume indicator after successful join.
- Prevent every room member from trying to publish the same live music track; only the user who started it publishes.
- Make live-video viewers actually join the Agora channel and subscribe to broadcaster audio/video.

After replacement, rebuild the web app and run Capacitor sync before testing the Android APK.
