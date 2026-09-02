import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, Video, VideoOff, SwitchCamera, Sparkles } from 'lucide-react';

interface PrivateCallModalProps {
  user: UserProfile;
  partner: {
    id: string;
    name: string;
    avatar: string;
  };
  isVideo: boolean;
  onEndCall: () => void;
}

export const PrivateCallModal: React.FC<PrivateCallModalProps> = ({
  user,
  partner,
  isVideo,
  onEndCall,
}) => {
  const [callStatus, setCallStatus] = useState<'calling' | 'connected'>('calling');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(isVideo);
  const localVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);

  // Auto connect after 2 seconds simulation and initialize local camera stream if video call
  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 2000);

    if (isVideo) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          mediaStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Camera/Mic permission in private call not granted:', err);
        });
    }

    return () => {
      clearTimeout(connectTimer);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideo]);

  // Handle video toggle track mute/unmute
  useEffect(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoEnabled;
      });
    }
  }, [isVideoEnabled]);

  // Handle mic toggle track mute/unmute
  useEffect(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  // Duration timer
  useEffect(() => {
    if (callStatus !== 'connected') return;

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [callStatus]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-6 font-sans text-white animate-in fade-in duration-200 select-none">
      {/* Top Header */}
      <div className="text-center space-y-1 mt-6">
        <span className="text-xs text-indigo-400 font-bold bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800/60 inline-block">
          {isVideo ? '📹 مكالمة فيديو خاصة مشفرة' : '📞 مكالمة صوتية خاصة مشفرة'}
        </span>
        <h2 className="text-xl font-black text-white mt-2">{partner.name}</h2>
        <p className="text-sm font-mono text-slate-400">
          {callStatus === 'calling' ? 'جاري الاتصال... 📡' : formatDuration(callDuration)}
        </p>
      </div>

      {/* Center Presentation: Video Stream or Avatar with Audio Waves */}
      <div className="flex flex-col items-center justify-center my-auto relative w-full">
        {isVideo && isVideoEnabled ? (
          <div className="relative w-full max-w-sm h-72 sm:h-80 rounded-3xl overflow-hidden border-2 border-indigo-500/60 shadow-[0_0_40px_rgba(99,102,241,0.4)] bg-slate-900 flex items-center justify-center">
            {/* Live Camera Stream */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
            {/* Overlay Pip Avatar of Partner */}
            <div className="absolute top-3 right-3 w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-lg bg-slate-950">
              <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover" />
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              {/* Pulsing Ripple Rings */}
              <div className="absolute w-44 h-44 rounded-full bg-indigo-500/20 animate-ping" />
              <div className="absolute w-36 h-36 rounded-full bg-purple-500/30 animate-pulse" />

              {/* Partner Avatar */}
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.6)]">
                <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Audio Wave Visualizer Simulation */}
            <div className="flex items-center gap-1.5 mt-8 h-8">
              {[12, 24, 32, 18, 28, 14, 30, 20].map((h, i) => (
                <div
                  key={i}
                  style={{ height: callStatus === 'connected' ? `${h}px` : '4px' }}
                  className="w-1.5 bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-full transition-all duration-300 animate-pulse"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="space-y-4 mb-4">
        <div className="flex items-center justify-center gap-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-3xl border border-slate-800 max-w-sm mx-auto shadow-2xl">
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-2xl transition-all ${isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
            title="كتم الصوت"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Speaker Button */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-3.5 rounded-2xl transition-all ${isSpeakerOn ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
            title="مكبر الصوت"
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Video Toggle */}
          {isVideo && (
            <button
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className={`p-3.5 rounded-2xl transition-all ${isVideoEnabled ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
              title="الكاميرا"
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.6)] active:scale-90 transition-all"
            title="إنهاء المكالمة"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
