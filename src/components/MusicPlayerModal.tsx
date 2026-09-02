import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  Upload,
  Link as LinkIcon,
  Trash2,
  Plus,
  Radio,
  ListMusic,
  RotateCcw,
  Sparkles,
  Tv,
  Mic,
  Smile,
  Bell,
  Flame,
  Volume1,
} from 'lucide-react';

export interface Track {
  id: string;
  name: string;
  artist?: string;
  url: string;
  dur?: string;
  icon?: string;
  isCustom?: boolean;
  isYoutube?: boolean;
  youtubeId?: string;
}

export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const raw = url.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = raw.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }
  return null;
}

const DEFAULT_TRACKS: Track[] = [
  {
    id: 'track-1',
    name: 'تقاسيم عود شرقي هادئ',
    artist: 'طرب شرقي الأصيل',
    dur: '03:45',
    icon: '🪕',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'track-2',
    name: 'ريمكس نغمات سهرة وطرب',
    artist: 'دي جي الخليج',
    dur: '04:20',
    icon: '🎧',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 'track-3',
    name: 'موسيقى روقان واسترخاء لوفي',
    artist: 'سليم لوفي بيتس',
    dur: '05:10',
    icon: '☕',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 'track-4',
    name: 'بيانو كلاسيكي ساحر',
    artist: 'عزف هادئ',
    dur: '03:15',
    icon: '🎹',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
];

const LOCAL_STORAGE_KEY = 'saleem_voice_room_playlist_v2';

// 🎵 Web Audio Sound Effect Synthesizer
function playLiveSoundEffect(type: string) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'airhorn') {
      const freqs = [466.16, 622.25]; // Bb4 and Eb5
      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      });
    } else if (type === 'fanfare') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.5);
      });
    } else if (type === 'bell') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime); // E6
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } else if (type === 'drumroll') {
      for (let i = 0; i < 15; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(140 + Math.random() * 40, ctx.currentTime + i * 0.06);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.06 + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.05);
      }
    } else if (type === 'applause') {
      // White noise bursts
      const bufferSize = ctx.sampleRate * 1.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();
    } else {
      // Default upbeat chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    console.warn('Sound effect audio error:', e);
  }
}

interface MusicPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  volume: number;
  setVolume: (vol: number) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  repeatMode: 'none' | 'one' | 'all' | 'shuffle';
  setRepeatMode: (mode: 'none' | 'one' | 'all' | 'shuffle') => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export const MusicPlayerModal: React.FC<MusicPlayerModalProps> = ({
  isOpen,
  onClose,
  showToast,
  currentTrack,
  setCurrentTrack,
  isPlaying,
  setIsPlaying,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  repeatMode,
  setRepeatMode,
  audioRef,
}) => {
  const [modalMainTab, setModalMainTab] = useState<'music' | 'soundboard'>('music');
  const [isKaraokeEchoOn, setIsKaraokeEchoOn] = useState<boolean>(false);

  const [playlist, setPlaylist] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load playlist from localStorage', e);
    }
    return DEFAULT_TRACKS;
  });

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [addTab, setAddTab] = useState<'file' | 'link'>('link');

  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackUrl, setNewTrackUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(playlist));
    } catch (e) {
      console.error('Failed to save playlist to localStorage', e);
    }
  }, [playlist]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => handleNextTrack(true);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef.current, currentTrack, repeatMode, playlist]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, audioRef.current]);

  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (audioRef.current) audioRef.current.play().catch(console.warn);
        setIsPlaying(true);
      }
      return;
    }

    setCurrentTrack(track);
    setIsPlaying(true);

    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.load();
      audioRef.current.play().catch((err) => {
        console.warn('Audio play request interrupted:', err);
      });
    }

    showToast(`🎵 جاري تشغيل: ${track.name}`);
  };

  const handleNextTrack = (isAutoEnd = false) => {
    if (playlist.length === 0) return;
    if (repeatMode === 'one' && isAutoEnd && currentTrack) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.warn);
      }
      return;
    }

    if (repeatMode === 'shuffle') {
      const randIdx = Math.floor(Math.random() * playlist.length);
      handlePlayTrack(playlist[randIdx]);
      return;
    }

    const currentIndex = playlist.findIndex((t) => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    handlePlayTrack(playlist[nextIndex]);
  };

  const handlePrevTrack = () => {
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    handlePlayTrack(playlist[prevIndex]);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const newTrack: Track = {
      id: `custom-file-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'ملف صوتي محلي 📁',
      url: fileUrl,
      dur: 'صوتي',
      icon: '🎵',
      isCustom: true,
    };

    setPlaylist((prev) => [newTrack, ...prev]);
    handlePlayTrack(newTrack);
    showToast(`📂 تم إضافة وتعيين "${newTrack.name}" لغرفة الصوت`);
    setShowAddForm(false);
  };

  const handleAddLinkTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const rawUrl = newTrackUrl.trim();
    if (!rawUrl) {
      showToast('⚠️ يرجى إدخال رابط صوتي أو رابط يوتيوب صحيح');
      return;
    }

    const ytId = getYouTubeVideoId(rawUrl);
    const isYt = Boolean(ytId) || rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be');

    const defaultTitle = isYt
      ? `مقطع يوتيوب ${ytId ? `(${ytId})` : 'مبثوث'} 🔴`
      : 'موسيقى أونلاين 🌐';

    const trackName = newTrackName.trim() || defaultTitle;

    const newTrack: Track = {
      id: `custom-url-${Date.now()}`,
      name: trackName,
      artist: isYt ? 'بث يوتيوب مباشر 🔴' : 'رابط ويب خارجي 🔗',
      url: rawUrl,
      dur: isYt ? 'يوتيوب 🎬' : 'أونلاين',
      icon: isYt ? '🔴' : '🔗',
      isCustom: true,
      isYoutube: isYt,
      youtubeId: ytId || undefined,
    };

    setPlaylist((prev) => [newTrack, ...prev]);
    handlePlayTrack(newTrack);
    showToast(`🔗 تم إضافة وحفظ المقطع "${newTrack.name}" في المكتبة!`);

    setNewTrackName('');
    setNewTrackUrl('');
    setShowAddForm(false);
  };

  const handleRemoveTrack = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    setPlaylist((prev) => prev.filter((t) => t.id !== trackId));
    if (currentTrack?.id === trackId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setCurrentTrack(null);
    }
    showToast('🗑️ تم حذف الأغنية من القائمة المحفوظة');
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const cycleRepeatMode = () => {
    if (repeatMode === 'none') {
      setRepeatMode('all');
      showToast('🔁 وضع التكرار: تكرار كل القائمة');
    } else if (repeatMode === 'all') {
      setRepeatMode('one');
      showToast('🔂 وضع التكرار: تكرار المقطع الحالي');
    } else if (repeatMode === 'one') {
      setRepeatMode('shuffle');
      showToast('🔀 وضع التكرار: تشغيل عشوائي');
    } else {
      setRepeatMode('none');
      showToast('➡️ وضع التكرار: إيقاف التكرار');
    }
  };

  if (!isOpen) return null;

  const currentYtId = currentTrack?.youtubeId || (currentTrack ? getYouTubeVideoId(currentTrack.url) : null);

  const SOUND_EFFECTS = [
    { id: 'applause', name: 'تصفيق وهتاف 👏', icon: '👏', color: 'from-amber-600 to-yellow-600' },
    { id: 'airhorn', name: 'صفارة إنذار 📢', icon: '📢', color: 'from-rose-600 to-red-600' },
    { id: 'fanfare', name: 'زغاريد واحتفال 🎉', icon: '🎉', color: 'from-purple-600 to-pink-600' },
    { id: 'drumroll', name: 'طبلة وتشويق 🥁', icon: '🥁', color: 'from-indigo-600 to-purple-600' },
    { id: 'bell', name: 'جرس تنبيه 🛎️', icon: '🛎️', color: 'from-emerald-600 to-teal-600' },
    { id: 'flame', name: 'حماس ولهب 🔥', icon: '🔥', color: 'from-orange-600 to-amber-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in zoom-in duration-200 dir-rtl">
      <div className="w-full max-w-md bg-gradient-to-b from-[#18132b] to-[#0d0a18] border border-purple-500/40 rounded-3xl p-4 sm:p-5 space-y-3.5 text-right shadow-2xl relative overflow-hidden max-h-[92vh] flex flex-col">
        {/* Glowing Background Orbs */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-2.5 z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-lg shadow-purple-900/30">
              <Music className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-base text-purple-100 flex items-center gap-1.5">
                مركز الصوتيات والمؤثرات 🎧
              </h3>
              <p className="text-[11px] text-purple-300/70 font-medium">
                مشغل الموسيقى، اليوتيوب، والمؤثرات التفاعلية المباشرة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Navigation Tabs: Music vs Soundboard */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-950/80 p-1 rounded-2xl border border-purple-900/50 z-10 shrink-0">
          <button
            type="button"
            onClick={() => setModalMainTab('music')}
            className={`py-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              modalMainTab === 'music'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>مشغل الموسيقى 🎵</span>
          </button>

          <button
            type="button"
            onClick={() => setModalMainTab('soundboard')}
            className={`py-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              modalMainTab === 'soundboard'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>المؤثرات والكاريوكي 🥁👏</span>
          </button>
        </div>

        {/* TAB 1: MUSIC & PLAYLIST */}
        {modalMainTab === 'music' && (
          <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar z-10">
            {/* Embedded YouTube Live Player Container */}
            {currentYtId && isPlaying && (
              <div className="bg-black border border-red-500/50 rounded-2xl overflow-hidden shadow-xl shrink-0 relative aspect-video w-full">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${currentYtId}?autoplay=1&enablejsapi=1`}
                  title={currentTrack?.name || 'YouTube Player'}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Now Playing Banner Card */}
            <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-3 space-y-2.5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-2xl shadow-md shrink-0">
                    {currentTrack?.icon || '🎶'}
                  </div>
                  <div className="min-w-0 text-right">
                    <h4 className="font-black text-sm text-white truncate">
                      {currentTrack?.name || 'لم يتم تشغيل أي مقطع بعد'}
                    </h4>
                    <p className="text-[11px] text-purple-300/80 truncate">
                      {currentTrack?.artist || 'اختر من القائمة بالأسفل للبدء'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={cycleRepeatMode}
                    className="p-1.5 text-purple-300 hover:text-white rounded-lg bg-slate-800/60 border border-purple-500/20 cursor-pointer"
                  >
                    {repeatMode === 'one' ? <Repeat1 className="w-4 h-4 text-amber-400" /> : <Repeat className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Seek Bar */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-slate-800 accent-purple-500 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevTrack}
                    className="p-2 text-slate-300 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => currentTrack && handlePlayTrack(currentTrack)}
                    className="p-3 text-white rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 hover:brightness-110 shadow-lg shadow-purple-900/40 transition active:scale-95 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNextTrack(false)}
                    className="p-2 text-slate-300 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-purple-300" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                    className="w-16 h-1 bg-slate-700 accent-purple-500 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Action Bar: Add Music */}
            <div className="flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1 text-xs font-black text-purple-200">
                <ListMusic className="w-4 h-4 text-purple-400" />
                <span>المكتبة الصوتية ({playlist.length})</span>
              </div>

              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة موسيقى / يوتيوب</span>
              </button>
            </div>

            {/* Expandable Add Form */}
            {showAddForm && (
              <div className="bg-slate-900/95 border border-purple-500/40 rounded-2xl p-3 space-y-2.5 animate-in fade-in">
                <div className="flex border-b border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAddTab('link')}
                    className={`flex-1 py-1.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 ${
                      addTab === 'link' ? 'border-red-400 text-red-200 bg-red-900/20' : 'border-transparent text-slate-400'
                    }`}
                  >
                    <Tv className="w-3.5 h-3.5 text-red-400" />
                    <span>رابط يوتيوب / أونلاين</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddTab('file')}
                    className={`flex-1 py-1.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 ${
                      addTab === 'file' ? 'border-purple-400 text-purple-200 bg-purple-900/20' : 'border-transparent text-slate-400'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع ملف صوتي</span>
                  </button>
                </div>

                {addTab === 'file' ? (
                  <div className="text-center py-2 space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 bg-purple-900/40 hover:bg-purple-900/70 border border-dashed border-purple-400/60 rounded-xl text-purple-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-purple-300" />
                      <span>اختر ملف صوتي (MP3, WAV, AAC)</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAddLinkTrack} className="space-y-2">
                    <input
                      type="text"
                      value={newTrackName}
                      onChange={(e) => setNewTrackName(e.target.value)}
                      placeholder="اسم المقطع (اختياري)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTrackUrl}
                        onChange={(e) => setNewTrackUrl(e.target.value)}
                        placeholder="الصق رابط YouTube أو رابط MP3"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                      <button
                        type="submit"
                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        حفظ
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Tracks List */}
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto no-scrollbar pr-1">
              {playlist.map((track) => (
                <div
                  key={track.id}
                  onClick={() => handlePlayTrack(track)}
                  className={`p-2 rounded-xl flex items-center justify-between gap-2 border transition-all cursor-pointer ${
                    currentTrack?.id === track.id
                      ? 'bg-purple-950/80 border-purple-400 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg shrink-0">{track.icon || '🎵'}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-white truncate">{track.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono">{track.dur || 'صوتي'}</span>
                    {track.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveTrack(e, track.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SOUNDBOARD & KARAOKE ECHO */}
        {modalMainTab === 'soundboard' && (
          <div className="space-y-3.5 flex-1 overflow-y-auto no-scrollbar z-10 animate-in fade-in">
            {/* Karaoke Echo / Reverb Toggle Banner */}
            <div className="bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-slate-950/90 border border-purple-500/50 rounded-2xl p-3 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                  <Mic className={`w-5 h-5 ${isKaraokeEchoOn ? 'text-amber-400 animate-pulse' : ''}`} />
                </div>
                <div>
                  <h4 className="font-black text-xs text-white flex items-center gap-1.5">
                    <span>صدى الصوت وكاريوكي المايك 🎙️</span>
                    {isKaraokeEchoOn && (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-1.5 py-0.2 rounded-full font-bold">
                        مفعل
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-slate-300">إضافة صدى استوديو احترافي لصوت المايك والغناء</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsKaraokeEchoOn(!isKaraokeEchoOn);
                  showToast(!isKaraokeEchoOn ? '🎙️ تم تفعيل صدى الصوت والكاريوكي للمايك!' : '🔇 تم إيقاف صدى الصوت');
                }}
                className={`px-3 py-1.5 rounded-xl font-black text-xs border transition-all cursor-pointer ${
                  isKaraokeEchoOn
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isKaraokeEchoOn ? 'إيقاف' : 'تفعيل'}
              </button>
            </div>

            {/* Instant Live Sound Effects Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>المؤثرات الصوتية الفورية المباشرة (Soundboard):</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SOUND_EFFECTS.map((fx) => (
                  <button
                    key={fx.id}
                    type="button"
                    onClick={() => {
                      playLiveSoundEffect(fx.id);
                      showToast(`🎵 مؤثر: ${fx.name}`);
                    }}
                    className={`py-3 px-2 rounded-2xl bg-gradient-to-r ${fx.color} text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-95 transition-all border border-white/20 cursor-pointer`}
                  >
                    <span className="text-xl">{fx.icon}</span>
                    <span className="truncate">{fx.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
