import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile } from '../../types';
import { getNativeAudioContext } from '../../lib/nativeAudio';
import {
  ArrowLeft,
  Coins,
  Plus,
  Minus,
  HelpCircle,
  Wifi,
  Sparkles,
  Flame,
  Volume2,
  Volume1,
  VolumeX,
  Vibrate,
  ShieldCheck,
  Lock,
  Zap,
  Gift,
  X,
  History,
  Trophy,
  Users,
  CheckCircle2,
  Crown,
  Layers,
  Music,
} from 'lucide-react';
import {
  placeRocketBetServer,
  cashoutRocketBetServer,
  listenToRocketServerRound,
  listenToRocketReactions,
  sendRocketReactionServer,
  startRocketRoundCoordinator,
  RocketServerState,
  RocketPlayerBet,
} from '../../lib/firebase';

export interface HypeTrack {
  id: string;
  name: string;
  artist: string;
  url: string;
  icon: string;
  youtubeId?: string;
}

export const HYPE_TRACKS: HypeTrack[] = [
  {
    id: 'hype-sherine-1',
    name: 'شيرين - تباعاً تباعاً 🔥',
    artist: 'شيرين عبد الوهاب (Sherine)',
    url: 'https://www.youtube.com/watch?v=-0RUAQAMUac',
    youtubeId: '-0RUAQAMUac',
    icon: '🎤',
  },
  {
    id: 'hype-tamally-remix',
    name: 'تملي معاك vs حبه جنة 🔥',
    artist: 'عمرو دياب × شيرين (Remix XVD)',
    url: 'https://www.youtube.com/watch?v=4vI0lf_SSIU',
    youtubeId: '4vI0lf_SSIU',
    icon: '🎧',
  },
  {
    id: 'hype-khodny-maak',
    name: 'خذني معك ريمكس 🚗⚡',
    artist: 'XVD - Bass Boosted Car Remix',
    url: 'https://www.youtube.com/watch?v=fb25pVHPBlA',
    youtubeId: 'fb25pVHPBlA',
    icon: '🚀',
  },
  {
    id: 'hype-ya-ghaly',
    name: 'يا غالي Ya Ghaly 🌟🔥',
    artist: 'فرقة جيتارا (XVD Remix 2026)',
    url: 'https://www.youtube.com/watch?v=_2uiUaUeRpQ',
    youtubeId: '_2uiUaUeRpQ',
    icon: '🎸',
  },
  {
    id: 'hype-haydi-haydi',
    name: 'شيماء الراسي - هيدي هيدي 💃🔥',
    artist: 'شيماء الراسي (Exclusive 2026)',
    url: 'https://www.youtube.com/watch?v=fw2hfXilD0U',
    youtubeId: 'fw2hfXilD0U',
    icon: '💃',
  },
  {
    id: 'hype-midnight-remix',
    name: 'Midnight Club Remix 🌌⚡',
    artist: 'Dj Umut Çevik (Car Music)',
    url: 'https://www.youtube.com/watch?v=mt_jtesCO5k',
    youtubeId: 'mt_jtesCO5k',
    icon: '⚡',
  },
  {
    id: 'hype-akcent-remix',
    name: "That's My Name Remix ⚡👑",
    artist: 'Akcent (Ömer Said Remix)',
    url: 'https://www.youtube.com/watch?v=tNgj8jKKY1o',
    youtubeId: 'tNgj8jKKY1o',
    icon: '👑',
  },
];

interface RocketGameProps {
  user: UserProfile;
  onUpdateCoins: (delta: number) => void;
  onBack?: () => void;
}

interface PlayerBet {
  id: string;
  name: string;
  avatar: string;
  amount: number;
  cashedOut: boolean;
  cashedMultiplier: number;
  cashoutTime?: number;
  rocketColor: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Ejection {
  id: string;
  name: string;
  avatar: string;
  mult: number;
  profit: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Reaction {
  id: string;
  emoji: string;
  text: string;
  name: string;
  avatar: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface PersonalHistoryItem {
  roundId: number;
  betAmount: number;
  cashMultiplier: number;
  crashTarget: number;
  won: boolean;
  netProfit: number;
  time: string;
}

const QUICK_CHIPS = [
  { label: '100', value: 100, bg: 'from-emerald-500 to-green-600 border-emerald-400/50' },
  { label: '500', value: 500, bg: 'from-emerald-600 to-teal-700 border-teal-400/50' },
  { label: '1K', value: 1000, bg: 'from-blue-600 to-indigo-700 border-blue-400/50' },
  { label: '5K', value: 5000, bg: 'from-purple-600 to-indigo-800 border-purple-400/50' },
  { label: '10K', value: 10000, bg: 'from-amber-500 to-orange-600 border-amber-400/50' },
  { label: '50K', value: 50000, bg: 'from-rose-600 to-red-700 border-rose-400/50' },
];

const AUTO_PRESETS = [1.5, 2.0, 3.0, 5.0, 10.0];

const SPACE_REACTIONS = [
  { emoji: '🔥', text: 'حريقة!' },
  { emoji: '🚀', text: 'طااار!' },
  { emoji: '😱', text: 'يا ساتر!' },
  { emoji: '💰', text: 'أرباح!' },
  { emoji: '👑', text: 'كفو!' },
];

export const RocketGame: React.FC<RocketGameProps> = ({ user, onUpdateCoins, onBack }) => {
  // Game Lifecycle States: 'WAITING' (5s) | 'FLYING' | 'CRASHED'
  const [gameState, setGameState] = useState<'WAITING' | 'FLYING' | 'CRASHED'>('WAITING');
  const [countdown, setCountdown] = useState<number>(5);
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [crashTarget, setCrashTarget] = useState<number>(2.45);
  const [roundId, setRoundId] = useState<number>(457080);
  const [currentHash, setCurrentHash] = useState<string>('e7f2b9a1c8430d4e92a549bf10c');
  const [ping, setPing] = useState<number>(48);

  // Bottom Interactive Tab: 'BETTING' | 'MY_HISTORY' | 'LEADERBOARD'
  const [activeBottomTab, setActiveBottomTab] = useState<'BETTING' | 'MY_HISTORY' | 'LEADERBOARD'>('BETTING');

  // Dual Bet System: Bet 1 & Bet 2
  const [dualBetMode, setDualBetMode] = useState<boolean>(false);

  // Bet 1 State
  const [bet1Amount, setBet1Amount] = useState<number>(1000);
  const [bet1Placed, setBet1Placed] = useState<boolean>(false);
  const [bet1Cashed, setBet1Cashed] = useState<boolean>(false);
  const [bet1CashMult, setBet1CashMult] = useState<number>(1.00);
  const [bet1WonCoins, setBet1WonCoins] = useState<number>(0);
  const [bet1AutoCashout, setBet1AutoCashout] = useState<boolean>(false);
  const [bet1AutoMult, setBet1AutoMult] = useState<number>(2.00);

  // Bet 2 State
  const [bet2Amount, setBet2Amount] = useState<number>(500);
  const [bet2Placed, setBet2Placed] = useState<boolean>(false);
  const [bet2Cashed, setBet2Cashed] = useState<boolean>(false);
  const [bet2CashMult, setBet2CashMult] = useState<number>(1.00);
  const [bet2WonCoins, setBet2WonCoins] = useState<number>(0);
  const [bet2AutoCashout, setBet2AutoCashout] = useState<boolean>(false);
  const [bet2AutoMult, setBet2AutoMult] = useState<number>(5.00);

  // Sound & Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showFairnessModal, setShowFairnessModal] = useState<boolean>(false);
  const [selectedTrackIdx, setSelectedTrackIdx] = useState<number>(0);
  const [showMusicModal, setShowMusicModal] = useState<boolean>(false);
  const [musicVolume, setMusicVolume] = useState<number>(70); // 0% - 100%
  const [showVolumePopover, setShowVolumePopover] = useState<boolean>(false);
  const audioTrackRef = useRef<HTMLAudioElement | null>(null);
  const youtubeIframeRef = useRef<HTMLIFrameElement | null>(null);

  // Helper to adjust volume (رفع الصوت / خفض الصوت / كتم الصوت)
  const handleVolumeChange = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newVol)));
    setMusicVolume(clamped);
    if (clamped > 0 && !soundEnabled) {
      setSoundEnabled(true);
    } else if (clamped === 0 && soundEnabled) {
      setSoundEnabled(false);
    }
    // Update HTML5 audio
    if (audioTrackRef.current) {
      audioTrackRef.current.volume = clamped / 100;
    }
    // Update YouTube player
    try {
      const iframe = youtubeIframeRef.current;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'setVolume', args: [clamped] }),
          '*'
        );
      }
    } catch (e) {}
  }, [soundEnabled]);

  // Real Active Player Bets (Only populated when real bets are placed)
  const [livePlayers, setLivePlayers] = useState<PlayerBet[]>([]);

  // Round Winners (Populated when rocket crashes for real players)
  const [roundWinners, setRoundWinners] = useState<Array<{ name: string; avatar: string; mult: number; profit: number; isMe?: boolean }>>([]);
  const [showWinnersOverlay, setShowWinnersOverlay] = useState<boolean>(false);

  // Personal Game History (Persistent)
  const [personalHistory, setPersonalHistory] = useState<PersonalHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('rocket_personal_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  // History Ribbon (Real Persistent Crash Multipliers Only - بدون أي أرقام وهمية)
  const [multiplierHistory, setMultiplierHistory] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('rocket_real_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });

  // Reactions Ref (Floating in Space)
  const reactionsRef = useRef<Reaction[]>([]);

  // Canvas & Particles Animation Refs
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Array<{ x: number; y: number; size: number; alpha: number; speed: number }>>([]);
  const shootingStarRef = useRef<{ x: number; y: number; vx: number; vy: number; length: number; alpha: number } | null>(null);
  const engineSoundOscRef = useRef<OscillatorNode | null>(null);
  const musicIntervalRef = useRef<any>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const crashStartTimeRef = useRef<number>(0);
  const lastCrashPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const ejectionsRef = useRef<Ejection[]>([]);
  const sessionProfitRef = useRef<number>(0);
  const consecutiveWinsRef = useRef<number>(0);
  const consecutiveLossesRef = useRef<number>(0);
  const flightStartTimeRef = useRef<number>(0);
  const bet1Ref = useRef({ bet1Placed, bet1Cashed, bet1AutoCashout, bet1AutoMult, bet1Amount, bet1CashMult, bet1WonCoins });
  const bet2Ref = useRef({ bet2Placed, bet2Cashed, bet2AutoCashout, bet2AutoMult, bet2Amount, bet2CashMult, bet2WonCoins, dualBetMode });
  bet1Ref.current = { bet1Placed, bet1Cashed, bet1AutoCashout, bet1AutoMult, bet1Amount, bet1CashMult, bet1WonCoins };
  bet2Ref.current = { bet2Placed, bet2Cashed, bet2AutoCashout, bet2AutoMult, bet2Amount, bet2CashMult, bet2WonCoins, dualBetMode };

  // Multiplayer Server State & Tracking Refs
  const initialNow = Date.now();
  const serverRoundRef = useRef<RocketServerState>({
    roundId: 457080,
    phase: 'WAITING',
    roundStartTime: initialNow,
    startTime: initialNow + 5000,
    crashMultiplier: 2.45,
    bets: {},
    history: [2.42, 1.85, 3.79, 1.46, 5.12, 1.32],
    updatedAt: initialNow,
  });
  const prevRoundIdRef = useRef<number | null>(null);
  const prevPhaseRef = useRef<'WAITING' | 'FLYING' | 'CRASHED' | null>(null);
  const prevBetsMapRef = useRef<Record<string, boolean>>({});
  const lastCountdownBeepRef = useRef<number>(-1);

  // Generate SHA-like random round hash
  const generateHash = () => {
    const chars = '0123456789abcdef';
    let res = '';
    for (let i = 0; i < 32; i++) res += chars[Math.floor(Math.random() * chars.length)];
    return res;
  };

  // Trigger haptic vibration with multiple intensity profiles
  const triggerHaptic = (pattern: number[] = [60, 80, 60]) => {
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  };

  // Helper to create white noise buffer for explosion & engine blast
  const createNoiseBuffer = (ctx: AudioContext, duration: number = 0.5) => {
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  // Sound Engine
  const playSound = useCallback((type: 'beep' | 'launch' | 'cashout' | 'crash' | 'chip' | 'milestone') => {
    if (!soundEnabled) return;
    try {
      const ctx = getNativeAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;

      if (type === 'beep') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, now);
        gain.gain.setValueAtTime(0.08, now);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'launch') {
        // 1. Futuristic Ascending Space Melody & Chords (لحن فضائي صاعد مبهر عند الإقلاع)
        const launchNotes = [261.63, 329.63, 392.0, 523.25, 659.25]; // C4, E4, G4, C5, E5
        launchNotes.forEach((freq, idx) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.type = 'triangle';
          noteOsc.frequency.setValueAtTime(freq, now + idx * 0.09);
          noteGain.gain.setValueAtTime(0.18, now + idx * 0.09);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.45);
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          noteOsc.start(now + idx * 0.09);
          noteOsc.stop(now + idx * 0.09 + 0.45);
        });

        // 2. Deep Sub Thruster Rumble
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.85);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.85);

        // 3. Thruster Whoosh Noise
        try {
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer(ctx, 0.8);
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(300, now);
          filter.frequency.exponentialRampToValueAtTime(1600, now + 0.8);
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.22, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(ctx.destination);
          noise.start(now);
        } catch (e) {}
      } else if (type === 'cashout') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.value = freq;
          o.connect(g);
          g.connect(ctx.destination);
          g.gain.setValueAtTime(0.18, now + i * 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
          o.start(now + i * 0.08);
          o.stop(now + i * 0.08 + 0.35);
        });
      } else if (type === 'crash') {
        // 1. Heavy Sub-bass Shockwave Thud (ضربة زلزال تحتية هابطة)
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(180, now);
        subOsc.frequency.exponentialRampToValueAtTime(22, now + 0.95);
        subGain.gain.setValueAtTime(0.75, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 1.0);

        // 2. Mid-Frequency Distortion Explosion Crack (صوت الفرقعة والانفجار الأولي الحاد)
        const crackOsc = ctx.createOscillator();
        const crackGain = ctx.createGain();
        crackOsc.type = 'sawtooth';
        crackOsc.frequency.setValueAtTime(360, now);
        crackOsc.frequency.exponentialRampToValueAtTime(30, now + 0.65);
        crackGain.gain.setValueAtTime(0.6, now);
        crackGain.gain.linearRampToValueAtTime(0.01, now + 0.65);
        crackOsc.connect(crackGain);
        crackGain.connect(ctx.destination);
        crackOsc.start(now);
        crackOsc.stop(now + 0.7);

        // 3. Debris & Fireball White Noise Rumble (دوي الرعد واللهب المتناثر المستمر)
        try {
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer(ctx, 1.2);
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1400, now);
          filter.frequency.exponentialRampToValueAtTime(80, now + 1.15);
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.7, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.15);
          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(ctx.destination);
          noise.start(now);
        } catch (e) {}

        // 4. Secondary Resonance Ring
        try {
          const ringOsc = ctx.createOscillator();
          const ringGain = ctx.createGain();
          ringOsc.type = 'triangle';
          ringOsc.frequency.setValueAtTime(520, now);
          ringOsc.frequency.exponentialRampToValueAtTime(110, now + 0.45);
          ringGain.gain.setValueAtTime(0.25, now);
          ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
          ringOsc.connect(ringGain);
          ringGain.connect(ctx.destination);
          ringOsc.start(now);
          ringOsc.stop(now + 0.5);
        } catch (e) {}
      } else if (type === 'chip') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, now);
        gain.gain.setValueAtTime(0.07, now);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'milestone') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {}
  }, [soundEnabled]);

  // Play Real Song / YouTube on Infinite Continuous Loop (موسيقى مستمرة بلا انقطاع طوال التواجد في اللعبة)
  useEffect(() => {
    const track = HYPE_TRACKS[selectedTrackIdx] || HYPE_TRACKS[0];

    if (soundEnabled && musicVolume > 0) {
      if (track.youtubeId) {
        // Command YouTube Player to play continuously & set volume
        try {
          const iframe = youtubeIframeRef.current;
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            iframe.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'setVolume', args: [musicVolume] }),
              '*'
            );
          }
        } catch (e) {}
      } else {
        // Regular audio file on loop
        try {
          if (!audioTrackRef.current) {
            audioTrackRef.current = new Audio(track.url);
          } else if (audioTrackRef.current.src !== track.url) {
            audioTrackRef.current.src = track.url;
          }
          audioTrackRef.current.loop = true;
          audioTrackRef.current.volume = musicVolume / 100;
          audioTrackRef.current.play().catch(() => {});
        } catch (e) {}
      }
    } else {
      if (track.youtubeId) {
        try {
          const iframe = youtubeIframeRef.current;
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          }
        } catch (e) {}
      }
      if (audioTrackRef.current) {
        try {
          audioTrackRef.current.pause();
        } catch (e) {}
      }
    }

    return () => {
      if (track.youtubeId) {
        try {
          const iframe = youtubeIframeRef.current;
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          }
        } catch (e) {}
      }
      if (audioTrackRef.current) {
        try {
          audioTrackRef.current.pause();
        } catch (e) {}
      }
    };
  }, [soundEnabled, selectedTrackIdx, musicVolume]);

  // Subtle Engine Hum (فقط أثناء طيران الصاروخ)
  useEffect(() => {
    if (gameState === 'FLYING' && soundEnabled) {
      const ctx = getNativeAudioContext();
      if (ctx) {
        try {
          const engineOsc = ctx.createOscillator();
          const engineGain = ctx.createGain();
          const engineFilter = ctx.createBiquadFilter();
          engineOsc.type = 'sine';
          engineOsc.frequency.setValueAtTime(52, ctx.currentTime);
          engineFilter.type = 'lowpass';
          engineFilter.frequency.setValueAtTime(110, ctx.currentTime);
          engineGain.gain.setValueAtTime(0.012, ctx.currentTime);
          engineOsc.connect(engineFilter);
          engineFilter.connect(engineGain);
          engineGain.connect(ctx.destination);
          engineOsc.start();
          engineSoundOscRef.current = engineOsc;
        } catch (e) {}
      }
    } else {
      if (engineSoundOscRef.current) {
        try {
          engineSoundOscRef.current.stop();
          engineSoundOscRef.current.disconnect();
        } catch (e) {}
        engineSoundOscRef.current = null;
      }
    }
    return () => {
      if (engineSoundOscRef.current) {
        try {
          engineSoundOscRef.current.stop();
          engineSoundOscRef.current.disconnect();
        } catch (e) {}
        engineSoundOscRef.current = null;
      }
    };
  }, [gameState, soundEnabled]);

  // Ping jitter simulation
  useEffect(() => {
    const pingTimer = setInterval(() => {
      setPing(Math.floor(35 + Math.random() * 25));
    }, 4000);
    return () => clearInterval(pingTimer);
  }, []);

  // Initialize Canvas Starfield (نجوم وبريق كوني كثيف)
  useEffect(() => {
    const stars: Array<{ x: number; y: number; size: number; alpha: number; speed: number }> = [];
    for (let i = 0; i < 160; i++) {
      stars.push({
        x: Math.random() * 800,
        y: Math.random() * 500,
        size: Math.random() * 2.6 + 0.6,
        alpha: Math.random() * 0.85 + 0.15,
        speed: Math.random() * 0.5 + 0.15,
      });
    }
    starsRef.current = stars;
  }, []);

  // =========================================================================
  // 1. SYNCHRONIZED MULTIPLAYER ROUND & PEER COORDINATOR ENGINE (FIREBASE RTDB)
  // =========================================================================
  useEffect(() => {
    // A. Listen to Realtime Centralized Server Round in Firebase RTDB
    const unsubRound = listenToRocketServerRound((srvState) => {
      serverRoundRef.current = srvState;
      setRoundId(srvState.roundId);
      setGameState(srvState.phase);
      setCrashTarget(srvState.crashMultiplier);
      if (srvState.history && srvState.history.length > 0) {
        setMultiplierHistory(srvState.history);
      }

      // Convert bets dictionary to array of active live players
      const betsList: PlayerBet[] = [];
      const currentBetsMap: Record<string, boolean> = {};

      if (srvState.bets) {
        Object.values(srvState.bets).forEach((b) => {
          betsList.push({
            id: b.id || `${b.userId}-${b.betNum}`,
            name: b.name,
            avatar: b.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
            amount: b.amount,
            cashedOut: !!b.cashedOut,
            cashedMultiplier: b.cashedMultiplier || 0,
            cashoutTime: b.cashedAt,
            rocketColor: b.rocketColor || (b.betNum === 2 ? '#c084fc' : '#fbbf24'),
          });

          // Check if this player JUST cashed out on server -> spawn parachute for everyone!
          const betKey = b.id || `${b.userId}-${b.betNum}`;
          const wasCashed = prevBetsMapRef.current[betKey];
          if (b.cashedOut && !wasCashed && srvState.phase === 'FLYING') {
            const currentX = lastCrashPosRef.current.x || 200;
            const currentY = lastCrashPosRef.current.y || 150;
            ejectionsRef.current.push({
              id: `${Date.now()}-${betKey}`,
              name: b.name,
              avatar: b.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
              mult: b.cashedMultiplier || 1.0,
              profit: Math.floor(b.amount * (b.cashedMultiplier || 1.0)),
              x: currentX + (Math.random() - 0.5) * 30,
              y: currentY,
              vx: (Math.random() - 0.5) * 1.2,
              vy: 0.8,
              alpha: 1,
              life: 0,
              maxLife: 100,
            });
          }
          currentBetsMap[betKey] = !!b.cashedOut;
        });
      }
      prevBetsMapRef.current = currentBetsMap;
      setLivePlayers(betsList);

      // Check if my bet status needs sync from server
      if (srvState.bets) {
        const myBet1 = srvState.bets[`${user.id}_1`];
        if (myBet1) {
          if (!bet1Ref.current.bet1Placed) setBet1Placed(true);
          if (myBet1.cashedOut && !bet1Ref.current.bet1Cashed) {
            setBet1Cashed(true);
            setBet1CashMult(myBet1.cashedMultiplier || 1);
            setBet1WonCoins(Math.floor(myBet1.amount * (myBet1.cashedMultiplier || 1)));
          }
        }
        const myBet2 = srvState.bets[`${user.id}_2`];
        if (myBet2) {
          if (!bet2Ref.current.bet2Placed) setBet2Placed(true);
          if (myBet2.cashedOut && !bet2Ref.current.bet2Cashed) {
            setBet2Cashed(true);
            setBet2CashMult(myBet2.cashedMultiplier || 1);
            setBet2WonCoins(Math.floor(myBet2.amount * (myBet2.cashedMultiplier || 1)));
          }
        }
      }

      // Round Transition triggers (New Round Initialized)
      if (prevRoundIdRef.current !== null && prevRoundIdRef.current !== srvState.roundId) {
        setBet1Placed(false);
        setBet2Placed(false);
        setBet1Cashed(false);
        setBet2Cashed(false);
        setBet1WonCoins(0);
        setBet2WonCoins(0);
        setRoundWinners([]);
        setShowWinnersOverlay(false);
        ejectionsRef.current = [];
      }
      prevRoundIdRef.current = srvState.roundId;

      // Phase transitions triggers
      if (prevPhaseRef.current !== srvState.phase) {
        if (srvState.phase === 'FLYING') {
          flightStartTimeRef.current = srvState.startTime;
          playSound('launch');
          triggerHaptic([80, 50, 140]);
        } else if (srvState.phase === 'CRASHED') {
          crashStartTimeRef.current = srvState.crashTime || Date.now();
          playSound('crash');
          triggerHaptic([180, 80, 220, 100, 380]);
          setIsScreenShaking(true);
          setTimeout(() => setIsScreenShaking(false), 650);

          // Spawn high-velocity explosion blast & sparks
          const crashX = lastCrashPosRef.current.x || 300;
          const crashY = lastCrashPosRef.current.y || 150;
          const burstColors = ['#fef08a', '#fbbf24', '#f97316', '#ef4444', '#dc2626', '#a855f7', '#38bdf8', '#ffffff'];
          for (let i = 0; i < 70; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.5 + Math.random() * 8.5;
            particlesRef.current.push({
              x: crashX + (Math.random() - 0.5) * 8,
              y: crashY + (Math.random() - 0.5) * 8,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: 3 + Math.random() * 6,
              color: burstColors[Math.floor(Math.random() * burstColors.length)],
              alpha: 1,
              life: 0,
              maxLife: 35 + Math.random() * 30,
            });
          }

          // Compute all real winners across the whole room
          const winnersList: Array<{ name: string; avatar: string; mult: number; profit: number; isMe?: boolean }> = [];
          if (srvState.bets) {
            Object.values(srvState.bets).forEach((b) => {
              if (b.cashedOut && (b.cashedMultiplier || 0) > 1.0) {
                const profit = Math.floor(b.amount * (b.cashedMultiplier || 1.0));
                winnersList.push({
                  name: b.name,
                  avatar: b.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
                  mult: b.cashedMultiplier || 1.0,
                  profit,
                  isMe: b.userId === user.id,
                });
              }
            });
          }
          setRoundWinners(winnersList);

          // Add to personal history if player played
          const b1 = bet1Ref.current;
          if (b1.bet1Placed) {
            const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
            const item: PersonalHistoryItem = {
              roundId: srvState.roundId,
              betAmount: b1.bet1Amount,
              cashMultiplier: b1.bet1Cashed ? b1.bet1CashMult : 0,
              crashTarget: srvState.crashMultiplier,
              won: b1.bet1Cashed,
              netProfit: b1.bet1Cashed ? b1.bet1WonCoins - b1.bet1Amount : -b1.bet1Amount,
              time: timeStr,
            };
            setPersonalHistory((prev) => {
              const updated = [item, ...prev.slice(0, 29)];
              try {
                localStorage.setItem('rocket_personal_history', JSON.stringify(updated));
              } catch (e) {}
              return updated;
            });
          }

          // Show winners overlay after 2 seconds
          setTimeout(() => {
            setShowWinnersOverlay(true);
          }, 2000);
        } else if (srvState.phase === 'WAITING') {
          setMultiplier(1.00);
          setShowWinnersOverlay(false);
        }
      }
      prevPhaseRef.current = srvState.phase;
    });

    // B. Listen to synchronized live reactions from all players
    const unsubReactions = listenToRocketReactions((rc) => {
      const canvas = canvasRef.current;
      const width = canvas?.parentElement?.clientWidth || 360;
      const height = canvas?.parentElement?.clientHeight || 300;

      reactionsRef.current.push({
        id: rc.id,
        emoji: rc.emoji,
        text: rc.text,
        name: rc.name,
        avatar: rc.avatar,
        x: width * 0.2 + Math.random() * width * 0.6,
        y: height * 0.82,
        vy: -1.3 - Math.random() * 0.7,
        alpha: 1,
        life: 0,
        maxLife: 85,
      });
    });

    // C. Start peer round coordinator
    const stopCoordinator = startRocketRoundCoordinator(user.id, () => serverRoundRef.current);

    return () => {
      unsubRound();
      unsubReactions();
      stopCoordinator();
    };
  }, [user.id, playSound]);

  // =========================================================================
  // 2. ULTRA-ACCURATE MULTIPLIER & COUNTDOWN TICKER (60 FPS CLOCK SYNC)
  // =========================================================================
  useEffect(() => {
    const ticker = setInterval(() => {
      const srv = serverRoundRef.current;
      if (!srv) return;

      const now = Date.now();

      if (srv.phase === 'WAITING') {
        const remainMs = srv.startTime - now;
        const remainSec = Math.max(0, Math.ceil(remainMs / 1000));
        setCountdown(remainSec);
        setMultiplier(1.00);

        // Countdown audio beep on 3, 2, 1
        if (remainSec <= 3 && remainSec > 0 && lastCountdownBeepRef.current !== remainSec) {
          lastCountdownBeepRef.current = remainSec;
          playSound('beep');
          triggerHaptic([35]);
        }

        // Advance to FLYING when countdown reaches 0
        if (now >= srv.startTime) {
          srv.phase = 'FLYING';
          srv.startTime = now;
          flightStartTimeRef.current = now;
          lastCountdownBeepRef.current = -1;
          setGameState('FLYING');
          playSound('launch');
          triggerHaptic([80, 50, 140]);
        }
      } else if (srv.phase === 'FLYING') {
        const elapsedSec = Math.max(0, (now - srv.startTime) / 1000);
        const curMult = parseFloat((1 + Math.pow(elapsedSec, 1.25) * 0.14).toFixed(2));
        setMultiplier(curMult);

        if (Math.abs(curMult - 2.0) < 0.04 || Math.abs(curMult - 5.0) < 0.04 || Math.abs(curMult - 10.0) < 0.04) {
          playSound('milestone');
          triggerHaptic([50, 30, 50]);
        }

        const b1 = bet1Ref.current;
        const b2 = bet2Ref.current;

        // Auto Cashout Bet 1
        if (b1.bet1Placed && !b1.bet1Cashed && b1.bet1AutoCashout && curMult >= b1.bet1AutoMult) {
          handleCashoutBet1(curMult);
        }

        // Auto Cashout Bet 2
        if (b2.dualBetMode && b2.bet2Placed && !b2.bet2Cashed && b2.bet2AutoCashout && curMult >= b2.bet2AutoMult) {
          handleCashoutBet2(curMult);
        }

        // Advance to CRASHED when target is reached
        if (curMult >= srv.crashMultiplier) {
          srv.phase = 'CRASHED';
          srv.crashTime = now;
          srv.nextRoundTime = now + 4500;
          crashStartTimeRef.current = now;
          setGameState('CRASHED');
          playSound('crash');
          triggerHaptic([180, 80, 220, 100, 380]);
          setIsScreenShaking(true);
          setTimeout(() => setIsScreenShaking(false), 650);

          // Spawn explosion blast & sparks
          const crashX = lastCrashPosRef.current.x || 300;
          const crashY = lastCrashPosRef.current.y || 150;
          const burstColors = ['#fef08a', '#fbbf24', '#f97316', '#ef4444', '#dc2626', '#a855f7', '#38bdf8', '#ffffff'];
          for (let i = 0; i < 70; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.5 + Math.random() * 8.5;
            particlesRef.current.push({
              x: crashX + (Math.random() - 0.5) * 8,
              y: crashY + (Math.random() - 0.5) * 8,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: 3 + Math.random() * 6,
              color: burstColors[Math.floor(Math.random() * burstColors.length)],
              alpha: 1,
              life: 0,
              maxLife: 35 + Math.random() * 30,
            });
          }

          // Compute winners
          const winnersList: Array<{ name: string; avatar: string; mult: number; profit: number; isMe?: boolean }> = [];
          if (srv.bets) {
            Object.values(srv.bets).forEach((rawB) => {
              const b = rawB as any;
              if (b && b.cashedOut && (b.cashedMultiplier || 0) > 1.0) {
                const profit = Math.floor(b.amount * (b.cashedMultiplier || 1.0));
                winnersList.push({
                  name: b.name,
                  avatar: b.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
                  mult: b.cashedMultiplier || 1.0,
                  profit,
                  isMe: b.userId === user.id,
                });
              }
            });
          }
          if (b1.bet1Placed && b1.bet1Cashed && !winnersList.some(w => w.isMe)) {
            winnersList.push({
              name: user.name || 'أنت',
              avatar: user.avatar,
              mult: b1.bet1CashMult,
              profit: b1.bet1WonCoins,
              isMe: true,
            });
          }
          setRoundWinners(winnersList);

          // Update Multiplier History
          setMultiplierHistory((prev) => {
            const updated = [srv.crashMultiplier, ...prev.slice(0, 14)];
            try { localStorage.setItem('rocket_real_history', JSON.stringify(updated)); } catch (e) {}
            return updated;
          });

          // Show winners overlay after 1.5s
          setTimeout(() => {
            setShowWinnersOverlay(true);
          }, 1500);
        }
      } else if (srv.phase === 'CRASHED') {
        const nextTime = srv.nextRoundTime || (srv.crashTime + 4500);
        if (now >= nextTime) {
          // Generate new crash target
          const rand = Math.random();
          let nextTarget = 2.45;
          if (rand < 0.04) nextTarget = parseFloat((1.01 + Math.random() * 0.15).toFixed(2));
          else if (rand < 0.55) nextTarget = parseFloat((1.20 + Math.random() * 1.30).toFixed(2));
          else if (rand < 0.85) nextTarget = parseFloat((2.50 + Math.random() * 3.50).toFixed(2));
          else if (rand < 0.97) nextTarget = parseFloat((6.00 + Math.random() * 10.00).toFixed(2));
          else nextTarget = parseFloat((16.00 + Math.random() * 50.00).toFixed(2));

          srv.roundId = (srv.roundId || 457080) + 1;
          srv.phase = 'WAITING';
          srv.roundStartTime = now;
          srv.startTime = now + 5000;
          srv.crashMultiplier = nextTarget;
          srv.bets = {};

          setRoundId(srv.roundId);
          setGameState('WAITING');
          setCountdown(5);
          setMultiplier(1.00);
          setCrashTarget(nextTarget);
          setBet1Placed(false);
          setBet2Placed(false);
          setBet1Cashed(false);
          setBet2Cashed(false);
          setBet1WonCoins(0);
          setBet2WonCoins(0);
          setRoundWinners([]);
          setShowWinnersOverlay(false);
          ejectionsRef.current = [];
          setCurrentHash(generateHash());
        }
      }
    }, 35);

    return () => clearInterval(ticker);
  }, [playSound, user.id, user.name, user.avatar]);

  // Handle Real Bet 1 Placement
  const handlePlaceBet1 = async () => {
    if (bet1Placed) return;
    if (user.coins < bet1Amount) {
      alert('رصيدك غير كافٍ للرهان الأول!');
      return;
    }
    onUpdateCoins(-bet1Amount);
    setBet1Placed(true);
    playSound('chip');

    // Add real player bet to live list immediately
    setLivePlayers((prev) => [
      ...prev.filter((p) => p.id !== `${user.id}_1`),
      {
        id: `${user.id}_1`,
        name: user.name || 'أنت',
        avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
        amount: bet1Amount,
        cashedOut: false,
        cashedMultiplier: 0,
        rocketColor: '#fbbf24',
      },
    ]);

    try {
      await placeRocketBetServer(roundId, user, 1, bet1Amount, '#fbbf24');
    } catch (e) {}
  };

  // Handle Real Bet 1 Cashout
  const handleCashoutBet1 = async (multOverride?: number) => {
    if (!bet1Placed || bet1Cashed || gameState !== 'FLYING') return;
    const mult = multOverride || multiplier;
    const winnings = Math.floor(bet1Amount * mult);
    setBet1Cashed(true);
    setBet1CashMult(mult);
    setBet1WonCoins(winnings);
    onUpdateCoins(winnings);
    playSound('cashout');
    triggerHaptic([60, 40, 80]);

    sessionProfitRef.current += (winnings - bet1Amount);
    consecutiveWinsRef.current += 1;
    consecutiveLossesRef.current = 0;

    // Spawn jumping astronaut parachute ejection
    const currentX = lastCrashPosRef.current.x || 200;
    const currentY = lastCrashPosRef.current.y || 150;
    ejectionsRef.current.push({
      id: `${Date.now()}-1`,
      name: user.name || 'أنت',
      avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
      mult: mult,
      profit: winnings,
      x: currentX,
      y: currentY,
      vx: -0.6 + Math.random() * 0.4,
      vy: 0.8,
      alpha: 1,
      life: 0,
      maxLife: 100,
    });

    // Update status in live list
    setLivePlayers((prev) =>
      prev.map((p) => (p.id === `${user.id}_1` ? { ...p, cashedOut: true, cashedMultiplier: mult } : p))
    );

    try {
      await cashoutRocketBetServer(roundId, user.id, 1, mult);
    } catch (e) {}
  };

  // Handle Real Bet 2 Placement
  const handlePlaceBet2 = async () => {
    if (bet2Placed) return;
    if (user.coins < bet2Amount) {
      alert('رصيدك غير كافٍ للرهان الثاني!');
      return;
    }
    onUpdateCoins(-bet2Amount);
    setBet2Placed(true);
    playSound('chip');

    // Add real player second bet to live list immediately
    setLivePlayers((prev) => [
      ...prev.filter((p) => p.id !== `${user.id}_2`),
      {
        id: `${user.id}_2`,
        name: `${user.name || 'أنت'} (2)`,
        avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
        amount: bet2Amount,
        cashedOut: false,
        cashedMultiplier: 0,
        rocketColor: '#c084fc',
      },
    ]);

    try {
      await placeRocketBetServer(roundId, user, 2, bet2Amount, '#c084fc');
    } catch (e) {}
  };

  // Handle Real Bet 2 Cashout
  const handleCashoutBet2 = async (multOverride?: number) => {
    if (!bet2Placed || bet2Cashed || gameState !== 'FLYING') return;
    const mult = multOverride || multiplier;
    const winnings = Math.floor(bet2Amount * mult);
    setBet2Cashed(true);
    setBet2CashMult(mult);
    setBet2WonCoins(winnings);
    onUpdateCoins(winnings);
    playSound('cashout');
    triggerHaptic([60, 40, 80]);

    sessionProfitRef.current += (winnings - bet2Amount);
    consecutiveWinsRef.current += 1;
    consecutiveLossesRef.current = 0;

    // Spawn jumping astronaut parachute ejection (2)
    const currentX2 = lastCrashPosRef.current.x || 200;
    const currentY2 = lastCrashPosRef.current.y || 150;
    ejectionsRef.current.push({
      id: `${Date.now()}-2`,
      name: `${user.name || 'أنت'} (2)`,
      avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
      mult: mult,
      profit: winnings,
      x: currentX2,
      y: currentY2,
      vx: 0.6 + Math.random() * 0.4,
      vy: 0.8,
      alpha: 1,
      life: 0,
      maxLife: 100,
    });

    // Update real player second bet status in live list
    setLivePlayers((prev) =>
      prev.map((p) => (p.id === `${user.id}_2` ? { ...p, cashedOut: true, cashedMultiplier: mult } : p))
    );

    try {
      await cashoutRocketBetServer(roundId, user.id, 2, mult);
    } catch (e) {}
  };

  // Handle Live Space Reaction (إرسال إيموجيات تفاعلية حية لجميع المستخدمين)
  const handleSendReaction = (emoji: string, text: string) => {
    playSound('chip');
    triggerHaptic([30, 20]);
    try {
      sendRocketReactionServer({
        emoji,
        text,
        name: user.name || 'أنت',
        avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
      });
    } catch (e) {}
  };

  // Canvas Parabolic Flight & Cosmic Particles Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = (canvas.width = canvas.parentElement?.clientWidth || 400);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 300);

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Twinkling Stars & Nebula
      starsRef.current.forEach((star) => {
        star.y += star.speed;
        if (star.y > height) star.y = 0;
        ctx.beginPath();
        ctx.arc(star.x % width, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * (0.6 + Math.sin(Date.now() / 300) * 0.4)})`;
        ctx.fill();
      });

      // 2. Shooting Star Animation
      if (Math.random() < 0.02 && !shootingStarRef.current) {
        shootingStarRef.current = {
          x: Math.random() * width * 0.8,
          y: Math.random() * height * 0.3,
          vx: 6 + Math.random() * 5,
          vy: 3 + Math.random() * 3.5,
          length: 45 + Math.random() * 35,
          alpha: 1,
        };
      }
      if (shootingStarRef.current) {
        const ss = shootingStarRef.current;
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.alpha -= 0.03;
        const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * 4, ss.y - ss.vy * 4);
        grad.addColorStop(0, `rgba(255, 255, 255, ${ss.alpha})`);
        grad.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.vx * 4, ss.y - ss.vy * 4);
        ctx.stroke();
        if (ss.alpha <= 0) shootingStarRef.current = null;
      }

      // =========================================================
      // DYNAMIC CELESTIAL STAGES & PLANETS (تدرج الكواكب والفضاء مع الارتفاع)
      // =========================================================

      // Stage 1: Earth Horizon & Clouds (1.0x - 2.5x)
      if (multiplier <= 3.0) {
        const earthOpacity = Math.max(0, 1 - (multiplier - 1) / 2.0);
        // Atmosphere Horizon Glow
        const atmGrad = ctx.createRadialGradient(width * 0.5, height * 1.1, 10, width * 0.5, height * 1.1, width * 0.7);
        atmGrad.addColorStop(0, `rgba(14, 165, 233, ${earthOpacity * 0.45})`);
        atmGrad.addColorStop(0.6, `rgba(3, 105, 161, ${earthOpacity * 0.2})`);
        atmGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = atmGrad;
        ctx.fillRect(0, 0, width, height);

        // Fluffy Low Altitude Passing Clouds
        const cloudOffset = (Date.now() / 60) % (width + 120) - 60;
        ctx.fillStyle = `rgba(241, 245, 249, ${earthOpacity * 0.25})`;
        ctx.beginPath();
        ctx.arc(cloudOffset, height * 0.88, 30, 0, Math.PI * 2);
        ctx.arc(cloudOffset + 24, height * 0.86, 22, 0, Math.PI * 2);
        ctx.arc(cloudOffset - 22, height * 0.89, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // Stage 2: Low Orbit Moon 🌕 & Satellite 🛰️ (2.0x - 7.0x)
      if (multiplier >= 1.8 && multiplier <= 8.0) {
        const moonProgress = Math.min(1, Math.max(0, (multiplier - 1.8) / 3.5));
        const moonAlpha = Math.sin(moonProgress * Math.PI) * 0.9;
        const moonX = width * 0.76 - (multiplier - 2) * 8;
        const moonY = height * 0.22 + (multiplier - 2) * 10;
        const moonRadius = 24;

        ctx.save();
        ctx.globalAlpha = moonAlpha;
        // Moon Glow
        const moonGlow = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.5, moonX, moonY, moonRadius * 2);
        moonGlow.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
        moonGlow.addColorStop(0.5, 'rgba(253, 224, 71, 0.15)');
        moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = moonGlow;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Moon Body
        const moonBody = ctx.createRadialGradient(moonX - 6, moonY - 6, 2, moonX, moonY, moonRadius);
        moonBody.addColorStop(0, '#fef9c3');
        moonBody.addColorStop(0.7, '#e2e8f0');
        moonBody.addColorStop(1, '#94a3b8');
        ctx.fillStyle = moonBody;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.fill();

        // Moon Craters
        ctx.fillStyle = 'rgba(100, 116, 139, 0.35)';
        ctx.beginPath();
        ctx.arc(moonX - 7, moonY - 5, 4, 0, Math.PI * 2);
        ctx.arc(moonX + 6, moonY + 4, 5, 0, Math.PI * 2);
        ctx.arc(moonX + 2, moonY - 9, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Passing Satellite 🛰️
        const satX = (width * 0.2 + (Date.now() / 90) % (width * 0.9));
        const satY = height * 0.42;
        ctx.save();
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = moonAlpha * 0.85;
        ctx.fillText('🛰️', satX, satY);
        // Blinking Red/Green Beacon
        const beaconOn = Math.sin(Date.now() / 150) > 0;
        if (beaconOn) {
          ctx.beginPath();
          ctx.arc(satX + 8, satY - 6, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 8;
          ctx.fill();
        }
        ctx.restore();
      }

      // Stage 3: Deep Solar System - Mars 🔴 & Saturn 🪐 (5.0x - 16.0x)
      if (multiplier >= 4.5 && multiplier <= 18.0) {
        const stage3Progress = Math.min(1, Math.max(0, (multiplier - 4.5) / 6.0));
        const stage3Alpha = Math.sin(stage3Progress * Math.PI) * 0.92;

        // 1. Red Planet Mars 🔴
        const marsX = width * 0.24 + (multiplier - 5) * 6;
        const marsY = height * 0.28 - (multiplier - 5) * 8;
        const marsRadius = 18;

        ctx.save();
        ctx.globalAlpha = stage3Alpha;
        const marsGlow = ctx.createRadialGradient(marsX, marsY, 4, marsX, marsY, marsRadius * 1.8);
        marsGlow.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
        marsGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = marsGlow;
        ctx.beginPath();
        ctx.arc(marsX, marsY, marsRadius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        const marsBody = ctx.createRadialGradient(marsX - 4, marsY - 4, 2, marsX, marsY, marsRadius);
        marsBody.addColorStop(0, '#fca5a5');
        marsBody.addColorStop(0.6, '#ef4444');
        marsBody.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = marsBody;
        ctx.beginPath();
        ctx.arc(marsX, marsY, marsRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. Ringed Planet Saturn 🪐
        const saturnX = width * 0.82 - (multiplier - 6) * 10;
        const saturnY = height * 0.35 + (multiplier - 6) * 6;
        const saturnRadius = 16;

        ctx.save();
        ctx.globalAlpha = stage3Alpha;
        // Saturn Body
        const saturnBody = ctx.createRadialGradient(saturnX - 4, saturnY - 4, 2, saturnX, saturnY, saturnRadius);
        saturnBody.addColorStop(0, '#fef08a');
        saturnBody.addColorStop(0.7, '#d97706');
        saturnBody.addColorStop(1, '#78350f');
        ctx.fillStyle = saturnBody;
        ctx.beginPath();
        ctx.arc(saturnX, saturnY, saturnRadius, 0, Math.PI * 2);
        ctx.fill();

        // Saturn Golden Elliptical Rings
        ctx.save();
        ctx.translate(saturnX, saturnY);
        ctx.rotate(-0.4);
        ctx.beginPath();
        ctx.ellipse(0, 0, 32, 9, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.75)';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();

        ctx.restore();
      }

      // Stage 4: Galactic Deep Nebula & Warp Speed Streaks 🌌 (14.0x فما فوق)
      if (multiplier >= 12.0) {
        const galaxyAlpha = Math.min(1, (multiplier - 12.0) / 5.0);

        ctx.save();
        ctx.globalAlpha = galaxyAlpha * 0.85;

        // 1. Rotating Galactic Spiral Vortex (مجرة حلزونية بنفسجية وذهبية تدور)
        const gX = width * 0.5;
        const gY = height * 0.3;
        const gRot = Date.now() / 1500;
        ctx.save();
        ctx.translate(gX, gY);
        ctx.rotate(gRot);
        const gGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 80);
        gGrad.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
        gGrad.addColorStop(0.3, 'rgba(168, 85, 247, 0.45)');
        gGrad.addColorStop(0.7, 'rgba(59, 130, 246, 0.25)');
        gGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 85, 38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. High-Speed Warp Speed Star Streaks (خطوط نجوم سريعة تشق الفضاء بسرعة الضوء)
        for (let i = 0; i < 14; i++) {
          const streakProgress = ((Date.now() * 0.8 + i * 180) % 1000) / 1000;
          const sx = (i * 59) % width + streakProgress * 40;
          const sy = streakProgress * height;
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.65)' : 'rgba(244, 114, 182, 0.65)';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx - 35, sy - 22);
          ctx.stroke();
        }

        ctx.restore();
      }

      // =========================================================
      // 3. EXACT USER ROCKET TRAJECTORY & FLIGHT DYNAMICS (حركة الصاروخ الدقيقة)
      // =========================================================
      const speed = 0.095;
      const elapsed = gameState === 'FLYING' ? (Date.now() - (flightStartTimeRef.current || Date.now())) / 1000 : 0;
      const progress = gameState === 'FLYING' ? Math.min(elapsed * speed, 1) : (gameState === 'CRASHED' ? 1 : 0);

      // Start & End Coordinates
      const startX = width * 0.12;
      const startY = height * 0.82;
      const endX = width * 0.90;
      const endY = height * 0.12;

      // Accelerated Upward Diagonal Curve (يبدأ ببطء من الأسفل ثم يصعد بشكل أسرع)
      const curve = Math.pow(progress, 1.35);
      const rx = startX + (endX - startX) * curve;
      const ry = startY - (startY - endY) * Math.pow(progress, 1.55);

      // Rocket Tilt Angle (ميل الصاروخ للأعلى تدريجياً: -8 - progress * 35)
      const angleDeg = (45 - 8 - progress * 35);
      const angle = (angleDeg * Math.PI) / 180;

      // =========================================================
      // 4. DOTTED / DASHED YELLOW ROCKET TRAIL (مسار الصاروخ المتقطع الأصفر)
      // =========================================================
      if ((gameState === 'FLYING' || gameState === 'CRASHED') && progress > 0.003) {
        const trailStartX = width * 0.02;
        const trailStartY = height * 0.88;
        const steps = 45;

        ctx.save();
        ctx.strokeStyle = '#ffd52f';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;

        for (let i = 0; i < steps; i++) {
          const p1 = (i / steps) * progress;
          const p2 = Math.min(p1 + 0.012, progress);

          if (p1 >= progress) break;

          const x1 = trailStartX + (endX - trailStartX) * Math.pow(p1, 1.35);
          const y1 = trailStartY - (trailStartY - endY) * Math.pow(p1, 1.55);

          const x2 = trailStartX + (endX - trailStartX) * Math.pow(p2, 1.35);
          const y2 = trailStartY - (trailStartY - endY) * Math.pow(p2, 1.55);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Emit Volumetric Billowing Smoke Clouds & Fiery Thruster Sparks
      if (gameState === 'FLYING') {
        const exhaustAngle = angle - Math.PI / 4 + Math.PI; // opposite to flight direction
        const nozzleX = rx + Math.cos(exhaustAngle) * (24 * (0.85 + progress * 0.25));
        const nozzleY = ry + Math.sin(exhaustAngle) * (24 * (0.85 + progress * 0.25));

        // 1. Billowing Fluffy Smoke Puffs
        for (let i = 0; i < 3; i++) {
          const spread = (Math.random() - 0.5) * 1.2;
          const sparkSpeed = 1.4 + Math.random() * 2.5;
          particlesRef.current.push({
            x: nozzleX + (Math.random() - 0.5) * 8,
            y: nozzleY + (Math.random() - 0.5) * 8,
            vx: Math.cos(exhaustAngle + spread) * sparkSpeed,
            vy: Math.sin(exhaustAngle + spread) * sparkSpeed + 0.3,
            size: 6 + Math.random() * 8,
            color: Math.random() < 0.5 ? 'rgba(241, 245, 249, 0.45)' : 'rgba(203, 213, 225, 0.35)',
            alpha: 0.7,
            life: 0,
            maxLife: 38 + Math.random() * 22,
          });
        }

        // 2. High-Speed Fiery Thruster Sparks
        for (let i = 0; i < 4; i++) {
          const sparkSpread = (Math.random() - 0.5) * 0.7;
          const sparkSpeed = 3.5 + Math.random() * 5.0;
          const sparkColors = ['#fef08a', '#ffd52f', '#f97316', '#ff4b18', '#38bdf8'];
          particlesRef.current.push({
            x: nozzleX,
            y: nozzleY,
            vx: Math.cos(exhaustAngle + sparkSpread) * sparkSpeed,
            vy: Math.sin(exhaustAngle + sparkSpread) * sparkSpeed,
            size: 2.5 + Math.random() * 4.0,
            color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
            alpha: 1,
            life: 0,
            maxLife: 16 + Math.random() * 14,
          });
        }
      }

      // Update & Draw Particles (Smoke expands smoothly)
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        // Smoke particles expand as they billow outward
        if (p.color.includes('rgba')) {
          p.size += 0.45;
        } else {
          p.size *= 0.94;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        if (!p.color.includes('rgba')) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
        }
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        return p.life < p.maxLife;
      });

      // Update & Draw Jumping Astronaut Parachute Ejections (نزول اللاعب بمظلة واسمه والمضاعف تحته)
      ejectionsRef.current = ejectionsRef.current.filter((ej) => {
        ej.x += ej.vx;
        ej.y += ej.vy;
        ej.life++;
        ej.alpha = Math.max(0, 1 - ej.life / ej.maxLife);

        ctx.save();
        ctx.globalAlpha = ej.alpha;

        // 1. Draw Parachute Icon
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🪂', ej.x, ej.y - 12);

        // 2. Draw Player Name Tag Box
        ctx.font = 'bold 11px sans-serif';
        const nameText = ej.name;
        const nameWidth = ctx.measureText(nameText).width;
        const nameBoxW = Math.max(54, nameWidth + 14);
        const nameBoxH = 18;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(ej.x - nameBoxW / 2, ej.y + 6, nameBoxW, nameBoxH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(nameText, ej.x, ej.y + 15);

        // 3. Draw Multiplier Tag Box Beneath Name (مثال: 5.00x)
        const multText = `${ej.mult.toFixed(2)}x (+${ej.profit.toLocaleString()} 🪙)`;
        ctx.font = 'bold 10px monospace';
        const multWidth = ctx.measureText(multText).width;
        const multBoxW = multWidth + 12;
        const multBoxH = 16;

        ctx.fillStyle = 'rgba(5, 150, 105, 0.95)';
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.2;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(ej.x - multBoxW / 2, ej.y + 27, multBoxW, multBoxH, 5);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ecfdf5';
        ctx.fillText(multText, ej.x, ej.y + 35);

        ctx.restore();

        return ej.life < ej.maxLife;
      });

      // Update & Draw Floating Space Reaction Bubbles (إيموجيات وردود فعل حية تطير في الفضاء)
      reactionsRef.current = reactionsRef.current.filter((rc) => {
        rc.y += rc.vy;
        rc.life++;
        rc.alpha = Math.max(0, 1 - rc.life / rc.maxLife);

        ctx.save();
        ctx.globalAlpha = rc.alpha;

        ctx.font = 'bold 11px sans-serif';
        const label = `${rc.emoji} ${rc.text}`;
        const w = ctx.measureText(label).width + 18;
        const h = 22;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(rc.x - w / 2, rc.y - h / 2, w, h, 11);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, rc.x, rc.y);
        ctx.restore();

        return rc.life < rc.maxLife;
      });

      // Draw Rocket or Explosion
      if (gameState === 'FLYING' || gameState === 'WAITING') {
        ctx.save();
        ctx.translate(rx, ry);
        ctx.rotate(angle);
        // Dynamic Rocket Scale (تكبير تدريجي للصاروخ مع الارتفاع)
        const currentScale = 1.65 * (0.85 + progress * 0.25);
        ctx.scale(currentScale, currentScale);

        // 1. Dual-Layer Jet Thruster Flame (نار خارجية برتقالية ونار داخلية صفراء)
        if (gameState === 'FLYING') {
          const flameLength = 25 + progress * 25;
          const flameFlicker = Math.sin(Date.now() / 25) * 4;

          // A. Outer Flame (#ff4b18)
          ctx.beginPath();
          ctx.moveTo(-10, 16);
          ctx.lineTo(0, 16 + flameLength + flameFlicker);
          ctx.lineTo(10, 16);
          ctx.closePath();
          ctx.fillStyle = '#ff4b18';
          ctx.shadowColor = '#ff4b18';
          ctx.shadowBlur = 24;
          ctx.fill();

          // B. Inner Flame (#ffe46b)
          ctx.beginPath();
          ctx.moveTo(-6, 16);
          ctx.lineTo(0, 16 + (flameLength + flameFlicker) * 0.65);
          ctx.lineTo(6, 16);
          ctx.closePath();
          ctx.fillStyle = '#ffe46b';
          ctx.shadowColor = '#ffe46b';
          ctx.shadowBlur = 14;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // 2. Cosmic Energy Shield Ring (هالة درع فضائي نيون)
        ctx.beginPath();
        ctx.arc(0, 0, 32 + Math.sin(Date.now() / 80) * 5, 0, Math.PI * 2);
        ctx.strokeStyle =
          multiplier >= 8
            ? 'rgba(251, 191, 36, 0.7)'
            : multiplier >= 3
            ? 'rgba(192, 132, 252, 0.7)'
            : 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 2;
        ctx.shadowColor = multiplier >= 8 ? '#f59e0b' : '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 3. Orbiting Sparkling Cosmic Stars (نجوم وبريق يطوف حول الصاروخ)
        const starTime = Date.now() / 220;
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✨', Math.cos(starTime) * 36, Math.sin(starTime) * 24);
        ctx.fillText('⭐', Math.cos(starTime + Math.PI) * 38, Math.sin(starTime + Math.PI) * 26);

        // 4. Vector Cyber Starship Fuselage & Wings (مركبة الفضاء الملكية المطلية بالذهب والكروم)
        // Wings
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-24, 18);
        ctx.lineTo(-12, 14);
        ctx.lineTo(12, 14);
        ctx.lineTo(24, 18);
        ctx.closePath();
        const wingGrad = ctx.createLinearGradient(-24, 0, 24, 0);
        wingGrad.addColorStop(0, '#1e293b');
        wingGrad.addColorStop(0.5, '#475569');
        wingGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = wingGrad;
        ctx.fill();
        ctx.strokeStyle = multiplier >= 8 ? '#fbbf24' : '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Fuselage Main Body
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.bezierCurveTo(12, -14, 12, 10, 8, 18);
        ctx.lineTo(-8, 18);
        ctx.bezierCurveTo(-12, 10, -12, -14, 0, -28);
        ctx.closePath();
        const bodyGrad = ctx.createLinearGradient(-12, -28, 12, 18);
        bodyGrad.addColorStop(0, '#ffffff');
        bodyGrad.addColorStop(0.3, '#cbd5e1');
        bodyGrad.addColorStop(0.7, '#64748b');
        bodyGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        ctx.strokeStyle = multiplier >= 8 ? '#f59e0b' : '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Gold Trim Racing Stripes
        ctx.beginPath();
        ctx.moveTo(-4, -10);
        ctx.lineTo(4, -10);
        ctx.lineTo(6, 12);
        ctx.lineTo(-6, 12);
        ctx.closePath();
        ctx.fillStyle = multiplier >= 8 ? '#fbbf24' : '#0284c7';
        ctx.fill();

        // Cockpit Glass Dome Canopy
        ctx.beginPath();
        ctx.ellipse(0, -14, 4.5, 9, 0, 0, Math.PI * 2);
        const glassGrad = ctx.createRadialGradient(0, -16, 1, 0, -14, 8);
        glassGrad.addColorStop(0, '#38bdf8');
        glassGrad.addColorStop(0.8, '#0369a1');
        glassGrad.addColorStop(1, '#082f49');
        ctx.fillStyle = glassGrad;
        ctx.fill();
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 5. Live Multiplier Floating Badge beside the Rocket (🚀 1.19x -> 2.28x -> 3.42x)
        if (gameState === 'FLYING') {
          ctx.save();
          // Un-rotate so the multiplier tag stays perfectly horizontal and legible
          ctx.rotate(-angle);
          ctx.font = 'bold 12px monospace';
          const label = `${multiplier.toFixed(2)}x`;
          const lw = ctx.measureText(label).width + 22;
          const lh = 20;
          const lx = 28;
          const ly = -18;

          ctx.fillStyle = 'rgba(10, 15, 44, 0.92)';
          ctx.strokeStyle = '#ffd52f';
          ctx.lineWidth = 1.5;
          ctx.shadowColor = '#ffd52f';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.roundRect(lx, ly - lh / 2, lw, lh, 6);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;

          ctx.fillStyle = '#ffd52f';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, lx + lw / 2, ly);
          ctx.restore();
        }

        lastCrashPosRef.current = { x: rx, y: ry };
        ctx.restore();
      } else if (gameState === 'CRASHED') {
        const crashX = lastCrashPosRef.current.x || rx;
        const crashY = lastCrashPosRef.current.y || ry;
        const crashElapsed = (Date.now() - crashStartTimeRef.current) / 1000;

        ctx.save();

        // 1. Multi-Layer Expanding Shockwave Rings
        if (crashElapsed < 1.5) {
          const ring1Radius = crashElapsed * 160;
          const ring1Alpha = Math.max(0, 1 - crashElapsed / 1.2);
          ctx.beginPath();
          ctx.arc(crashX, crashY, ring1Radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(56, 189, 248, ${ring1Alpha * 0.9})`;
          ctx.lineWidth = 3 * (1 - crashElapsed / 1.5);
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 15;
          ctx.stroke();

          const ring2Radius = crashElapsed * 110;
          const ring2Alpha = Math.max(0, 1 - crashElapsed / 0.9);
          ctx.beginPath();
          ctx.arc(crashX, crashY, ring2Radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(249, 115, 22, ${ring2Alpha * 0.8})`;
          ctx.lineWidth = 4 * (1 - crashElapsed / 1.2);
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 20;
          ctx.stroke();
        }

        // 2. Fiery Plasma Fireball Core
        if (crashElapsed < 1.8) {
          const coreAlpha = Math.max(0, 1 - crashElapsed / 1.6);
          const coreRadius = Math.max(5, 42 * (1 - Math.pow(crashElapsed / 1.8 - 0.2, 2)));
          const fireGrad = ctx.createRadialGradient(crashX, crashY, 0, crashX, crashY, coreRadius);
          fireGrad.addColorStop(0, `rgba(255, 255, 255, ${coreAlpha})`);
          fireGrad.addColorStop(0.25, `rgba(254, 240, 138, ${coreAlpha * 0.95})`);
          fireGrad.addColorStop(0.6, `rgba(249, 115, 22, ${coreAlpha * 0.8})`);
          fireGrad.addColorStop(0.85, `rgba(239, 68, 68, ${coreAlpha * 0.6})`);
          fireGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.beginPath();
          ctx.arc(crashX, crashY, coreRadius, 0, Math.PI * 2);
          ctx.fillStyle = fireGrad;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 25;
          ctx.fill();

          // 3. Four-point Rotating Star Blast Rays
          const rayLength = 35 * (1 - crashElapsed / 1.5);
          if (rayLength > 0) {
            ctx.save();
            ctx.translate(crashX, crashY);
            ctx.rotate(crashElapsed * 2.5);
            ctx.strokeStyle = `rgba(254, 240, 138, ${coreAlpha * 0.85})`;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-rayLength, 0);
            ctx.lineTo(rayLength, 0);
            ctx.moveTo(0, -rayLength);
            ctx.lineTo(0, rayLength);
            ctx.stroke();
            ctx.restore();
          }
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, multiplier, crashTarget]);

  return (
    <div className="w-full h-full min-h-screen bg-[#070a1a] text-white flex flex-col justify-between font-sans select-none dir-rtl relative overflow-y-auto">
      {/* ========================================================= */}
      {/* 1. HEADER STATUS BAR (العنوان | النزاهة | الرصيد) */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-[#0b0f2a] via-[#090d24] to-[#0b0f2a] border-b border-indigo-900/60 px-3 py-2 flex items-center justify-between z-20 sticky top-0 backdrop-blur-md">
        {/* Left Side: Back & Live Title */}
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-indigo-300 hover:text-white cursor-pointer transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                صاروخ الفضاء 🚀
              </span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                <Wifi className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                <span>{ping}ms</span>
              </span>
            </div>
            <div className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
              <span>الجولة #{roundId}</span>
              <span>•</span>
              <button
                onClick={() => setShowFairnessModal(true)}
                className="text-cyan-400 hover:underline flex items-center gap-0.5"
              >
                <ShieldCheck className="w-2.5 h-2.5 text-cyan-400" />
                <span>مشفّر عادل</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Coins & Action Tools */}
        <div className="flex items-center gap-1.5">
          <div className="bg-slate-950/90 border border-amber-500/50 px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-mono font-bold text-amber-300 shadow-inner">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
              🪙
            </span>
            <span>{user.coins.toLocaleString()}</span>
          </div>

          {/* Hype Music Track Selector Button */}
          <button
            onClick={() => setShowMusicModal(true)}
            className="p-1.5 px-2 rounded-xl border bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-purple-950/90 border-purple-500/50 text-purple-300 hover:text-white cursor-pointer transition-all active:scale-95 flex items-center gap-1 text-[10px] font-bold shadow-sm"
            title="اختيار أغنية الصاروخ الحماسية"
          >
            <Music className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            <span className="max-w-[70px] truncate">{HYPE_TRACKS[selectedTrackIdx].name}</span>
          </button>

          {/* ========================================================= */}
          {/* LUXURY VOLUME HUB (توطية الصوت | تعلاية الصوت | كتم الصوت) */}
          {/* ========================================================= */}
          <div className="relative flex items-center bg-slate-950/90 border border-indigo-500/40 rounded-xl p-0.5 shadow-inner">
            {/* Mute / Unmute Toggle */}
            <button
              onClick={() => {
                if (soundEnabled && musicVolume > 0) {
                  setSoundEnabled(false);
                } else {
                  setSoundEnabled(true);
                  if (musicVolume === 0) handleVolumeChange(50);
                }
              }}
              className={`p-1 rounded-lg transition-all cursor-pointer ${
                soundEnabled && musicVolume > 0
                  ? 'text-cyan-300 hover:text-white'
                  : 'text-rose-400 hover:text-rose-300'
              }`}
              title={soundEnabled && musicVolume > 0 ? 'كتم الصوت' : 'تشغيل الصوت'}
            >
              {!soundEnabled || musicVolume === 0 ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : musicVolume < 50 ? (
                <Volume1 className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Volume Down Button (-) */}
            <button
              onClick={() => handleVolumeChange(musicVolume - 10)}
              className="p-1 text-slate-400 hover:text-white cursor-pointer active:scale-90 transition-all hover:bg-slate-800 rounded"
              title="توطية الصوت (-10%)"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>

            {/* Volume Percentage Value & Slider Toggle */}
            <button
              onClick={() => setShowVolumePopover(!showVolumePopover)}
              className="px-1 text-[10px] font-mono font-bold text-amber-300 min-w-[28px] text-center cursor-pointer hover:text-amber-200 transition-all"
              title="التحكم بمستوى الصوت"
            >
              {soundEnabled ? `${musicVolume}%` : '0%'}
            </button>

            {/* Volume Up Button (+) */}
            <button
              onClick={() => handleVolumeChange(musicVolume + 10)}
              className="p-1 text-slate-400 hover:text-white cursor-pointer active:scale-90 transition-all hover:bg-slate-800 rounded"
              title="تعلاية الصوت (+10%)"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>

            {/* Interactive Volume Slider Dropdown Popover */}
            {showVolumePopover && (
              <div className="absolute top-full left-0 mt-2 z-50 bg-[#0d1338] border border-indigo-500/50 rounded-2xl p-3 shadow-2xl w-48 text-right space-y-2 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200 pb-1 border-b border-indigo-950">
                  <span className="flex items-center gap-1 text-cyan-300">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>مستوى الصوت</span>
                  </span>
                  <span className="font-mono text-amber-400">{musicVolume}%</span>
                </div>

                <div className="py-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundEnabled ? musicVolume : 0}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>

                <div className="flex items-center justify-between gap-1 pt-1">
                  <button
                    onClick={() => handleVolumeChange(0)}
                    className="flex-1 text-[10px] py-1 bg-slate-900 hover:bg-rose-950/70 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 rounded-lg transition-all"
                  >
                    كتم
                  </button>
                  <button
                    onClick={() => handleVolumeChange(50)}
                    className="flex-1 text-[10px] py-1 bg-slate-900 hover:bg-indigo-900/70 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white rounded-lg transition-all"
                  >
                    50%
                  </button>
                  <button
                    onClick={() => handleVolumeChange(100)}
                    className="flex-1 text-[10px] py-1 bg-slate-900 hover:bg-emerald-950/70 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 rounded-lg transition-all"
                  >
                    100%
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowRulesModal(true)}
            className="p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title="القواعد"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-300" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MULTIPLIER HISTORY RIBBON (شريط السجل العلوي) */}
      {/* ========================================================= */}
      <div className="bg-[#090d24] border-b border-indigo-950 px-2.5 py-1.5 flex items-center justify-between text-xs gap-2">
        <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
          <History className="w-3 h-3 text-indigo-400" />
          <span>السجل</span>
        </span>

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {multiplierHistory.length > 0 ? (
            multiplierHistory.map((m, idx) => {
              const isGold = m >= 10.0;
              const isPurple = m >= 5.0 && m < 10.0;
              const isGreen = m >= 2.0 && m < 5.0;
              return (
                <span
                  key={idx}
                  className={`font-mono font-black text-[10px] px-2 py-0.5 rounded-lg border shrink-0 transition-transform hover:scale-105 ${
                    isGold
                      ? 'bg-amber-950/90 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                      : isPurple
                      ? 'bg-purple-950/90 border-purple-400 text-purple-300 shadow-[0_0_8px_rgba(192,38,211,0.4)]'
                      : isGreen
                      ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300'
                      : 'bg-slate-900/90 border-slate-700 text-slate-400'
                  }`}
                >
                  {isGold && '🔥 '}
                  {m.toFixed(2)}x
                </span>
              );
            })
          ) : (
            <span className="text-[10px] text-slate-500 font-mono italic">
              في انتظار أول ضربة صاروخ... 🚀
            </span>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MAIN CANVAS STAGE (الفضاء + كوكب الأرض + الصاروخ) */}
      {/* ========================================================= */}
      <div
        className={`relative w-full flex-1 min-h-[360px] sm:min-h-[420px] bg-gradient-to-b from-[#030616] via-[#070d28] to-[#040612] overflow-hidden flex flex-col justify-between p-3 border-b border-indigo-950 transition-transform duration-100 ${
          isScreenShaking ? 'scale-[1.02] translate-x-1 -translate-y-1 rotate-[0.5deg]' : ''
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0,transparent_70%)] pointer-events-none" />

        {/* Earth Horizon Arc at Bottom with Atmosphere Glow */}
        <div className="absolute -bottom-28 left-1/2 -translate-x-1/2 w-[150%] h-[180px] rounded-[100%] bg-gradient-to-t from-[#0284c7]/50 via-[#0369a1]/25 to-transparent border-t-2 border-cyan-400/60 shadow-[0_0_60px_rgba(6,182,212,0.5)] pointer-events-none" />

        {/* Top-Left: Real Player Active Bets (الرهانات الحقيقية والحالة الحية) */}
        <div className="absolute left-3 top-3 z-20 space-y-1.5 min-w-[140px] max-w-[200px] pointer-events-none dir-ltr text-left">
          <div className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
            <Users className="w-3 h-3 text-cyan-400" />
            <span>الرهانات الحية</span>
          </div>

          {livePlayers.length > 0 ? (
            livePlayers.map((p) => {
              const wonAmount = Math.floor(p.amount * (p.cashedMultiplier || 1));
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between gap-1.5 text-[10px] font-mono px-2 py-1 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                    p.cashedOut
                      ? 'bg-emerald-600/90 border-emerald-300 text-white font-black shadow-[0_0_15px_rgba(16,185,129,0.8)] scale-105'
                      : 'bg-slate-950/80 border-indigo-500/40 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate max-w-[90px]">
                    <img
                      src={p.avatar}
                      alt=""
                      className="w-4 h-4 rounded-full object-cover border border-white/40 shrink-0"
                    />
                    <span className="truncate font-bold">{p.name}</span>
                  </div>

                  <div className="shrink-0 font-black">
                    {p.cashedOut ? (
                      <span className="text-emerald-100 flex items-center gap-0.5">
                        <span>+{wonAmount.toLocaleString()} 🪙</span>
                        <span className="text-[9px] text-emerald-200">({p.cashedMultiplier.toFixed(2)}x)</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-0.5">
                        <span>{p.amount.toLocaleString()}</span>
                        <span>🪙</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-[9px] text-slate-400 font-mono bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800">
              لا يوجد رهان نشط
            </div>
          )}
        </div>

        {/* Dynamic Right-Side Altitude Multipliers Ladder (تتفاعل وتصعد ديناميكياً مع الصاروخ) */}
        <div className="absolute right-2 top-3 bottom-12 z-20 flex flex-col justify-between items-end pointer-events-none dir-ltr">
          {(() => {
            const milestones =
              multiplier >= 15
                ? [50.0, 30.0, 20.0, 15.0, 10.0, 5.0]
                : multiplier >= 5
                ? [15.0, 10.0, 7.0, 5.0, 3.0, 2.0]
                : [5.0, 3.0, 2.0, 1.5, 1.2, 1.0];

            return milestones.map((m) => {
              const isReached = gameState !== 'WAITING' && multiplier >= m;
              const isCurrent = gameState === 'FLYING' && Math.abs(multiplier - m) < 0.25;

              return (
                <div
                  key={m}
                  className={`flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded-md border transition-all duration-300 ${
                    isReached
                      ? m >= 10
                        ? 'bg-amber-950/90 border-amber-400 text-amber-300 font-black shadow-[0_0_10px_rgba(251,191,36,0.6)] scale-105'
                        : m >= 5
                        ? 'bg-purple-950/90 border-purple-400 text-purple-300 font-black shadow-[0_0_8px_rgba(192,38,211,0.5)] scale-105'
                        : 'bg-emerald-950/90 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_6px_rgba(16,185,129,0.4)] scale-105'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-500'
                  } ${isCurrent ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-black animate-pulse' : ''}`}
                >
                  {isReached && <span className="text-[8px] text-emerald-400">✓</span>}
                  <span>{m.toFixed(1)}x</span>
                  {m >= 10 ? '🪐' : m >= 5 ? '🌌' : m >= 2 ? '⚡' : ''}
                </div>
              );
            });
          })()}
        </div>

        {/* HTML5 Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

        {/* Center Multiplier & Game Status HUD */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          {gameState === 'WAITING' ? (
            <div className="text-center space-y-1 animate-pulse">
              <div className="w-14 h-14 mx-auto rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-3xl font-black text-cyan-300 font-mono shadow-[0_0_25px_rgba(6,182,212,0.6)]">
                {countdown}
              </div>
              <span className="text-xs font-bold text-slate-300 block tracking-wide">
                استعد للإقلاع القادم 🚀
              </span>
            </div>
          ) : gameState === 'FLYING' ? (
            <div className="text-center">
              <div className="text-5xl sm:text-6xl font-black tracking-tight font-mono drop-shadow-[0_4px_24px_rgba(99,102,241,0.9)] flex items-center justify-center">
                <span
                  className={`text-transparent bg-clip-text bg-gradient-to-b ${
                    multiplier >= 10
                      ? 'from-amber-200 via-yellow-400 to-orange-500'
                      : multiplier >= 5
                      ? 'from-purple-200 via-pink-400 to-rose-500'
                      : multiplier >= 2
                      ? 'from-emerald-200 via-teal-300 to-emerald-400'
                      : 'from-white via-indigo-100 to-indigo-300'
                  }`}
                >
                  {multiplier.toFixed(2)}x
                </span>
              </div>
              <span className="text-[10px] font-bold text-cyan-300/80 uppercase tracking-widest block mt-0.5">
                {multiplier >= 10 ? '🔥 نحو المجرة البعيدة!' : multiplier >= 5 ? '⚡ سرعة فائقة!' : 'الصاروخ في تصاعد مستمر'}
              </span>
            </div>
          ) : (
            <div className="text-center space-y-1 animate-bounce">
              <span className="text-4xl sm:text-5xl font-black text-rose-500 font-mono drop-shadow-[0_0_30px_rgba(244,63,94,1)]">
                {crashTarget.toFixed(2)}x
              </span>
              <span className="text-xs font-black text-rose-400 block bg-rose-950/80 border border-rose-500/50 px-3 py-1 rounded-full shadow-lg">
                💥 انفجر الصاروخ!
              </span>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* WINNERS OVERLAY BOX (مربع الفائز الحقيقي عند انتهاء الجولة) */}
        {/* ========================================================= */}
        {gameState === 'CRASHED' && showWinnersOverlay && (
          <div className="absolute inset-x-3 inset-y-4 z-30 flex items-center justify-center p-2 animate-in zoom-in-95 duration-300 pointer-events-none">
            <div className="w-full max-w-xs bg-slate-950/95 border-2 border-amber-500/70 rounded-3xl p-3.5 shadow-[0_0_40px_rgba(245,158,11,0.5)] backdrop-blur-md space-y-2 text-right">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-1.5">
                <div className="flex items-center gap-1 text-xs font-black text-amber-300">
                  <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>نتيجة الجولة #{roundId}</span>
                </div>
                <span className="text-[10px] font-mono text-rose-400 font-bold">
                  سقط عند {crashTarget.toFixed(2)}x
                </span>
              </div>

              {roundWinners.length > 0 ? (
                <div className="space-y-1.5 font-mono text-[11px]">
                  {roundWinners.map((w, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl border bg-amber-950/70 border-amber-400/80 text-amber-200 shadow-md font-black"
                    >
                      <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                        <span>🏆</span>
                        <img src={w.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                        <span className="truncate">{w.name}</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold">
                        <span className="text-emerald-400">{w.mult.toFixed(2)}x</span>
                        <span className="text-amber-300">+{w.profit.toLocaleString()} 🪙</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-3 text-center text-xs text-slate-400 space-y-1">
                  <span className="text-xl block">💥</span>
                  <span>
                    {bet1Placed || (dualBetMode && bet2Placed)
                      ? 'لم تقم بسحب الأرباح قبل الانفجار!'
                      : 'لم يتم الرهان في هذه الجولة'}
                  </span>
                </div>
              )}

              <div className="text-center pt-1 border-t border-slate-800 text-[10px] text-cyan-300 font-mono">
                الجولة القادمة تبدأ قريباً... 🚀
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. LUXURY INTERACTIVE CONTROLS & TABS */}
      {/* ========================================================= */}
      <div className="p-3 bg-[#080c22] space-y-2.5">
        {/* INTERACTIVE FLOATING REACTIONS BAR (إيموجيات حية للفضاء) */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1 px-1.5 bg-[#0a0f2c]/80 border border-indigo-950 rounded-2xl">
          <span className="text-[10px] text-slate-400 font-bold shrink-0 px-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
            <span>تفاعل حي:</span>
          </span>
          {SPACE_REACTIONS.map((rc) => (
            <button
              key={rc.emoji}
              onClick={() => handleSendReaction(rc.emoji, rc.text)}
              className="flex items-center gap-1 bg-slate-900/90 hover:bg-indigo-950 border border-indigo-500/30 px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-200 hover:text-amber-300 transition-all active:scale-90 cursor-pointer shrink-0 shadow-sm"
            >
              <span>{rc.emoji}</span>
              <span>{rc.text}</span>
            </button>
          ))}
        </div>

        {/* BOTTOM TABS SWITCHER */}
        <div className="grid grid-cols-3 gap-1 bg-[#0b1030] p-1 rounded-2xl border border-indigo-500/30">
          <button
            onClick={() => setActiveBottomTab('BETTING')}
            className={`py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeBottomTab === 'BETTING'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>لوحة الرهان</span>
          </button>
          <button
            onClick={() => setActiveBottomTab('MY_HISTORY')}
            className={`py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeBottomTab === 'MY_HISTORY'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>سجل أرباحي</span>
          </button>
          <button
            onClick={() => setActiveBottomTab('LEADERBOARD')}
            className={`py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeBottomTab === 'LEADERBOARD'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>لوحة الأبطال 🏆</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: BETTING PANEL */}
        {/* ========================================================= */}
        {activeBottomTab === 'BETTING' && (
          <div className="space-y-2.5 animate-in fade-in-50 duration-200">
            {/* Toggle Single vs Dual Bet Mode */}
            <div className="flex items-center justify-between pb-0.5">
              <div className="flex items-center gap-1 bg-[#0f153a] p-0.5 rounded-xl border border-indigo-500/30">
                <button
                  onClick={() => setDualBetMode(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !dualBetMode ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  رهان واحد
                </button>
                <button
                  onClick={() => setDualBetMode(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    dualBetMode ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>رهان مزدوج 2X</span>
                </button>
              </div>

              <span className="text-[10px] text-slate-400">
                {gameState === 'FLYING' ? '⚡ الجولة جارية الآن' : '🟢 الرهان متاح للجولة القادمة'}
              </span>
            </div>

            {/* BET 1 CARD */}
            <div className="bg-[#0e1436] border border-indigo-500/30 rounded-2xl p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                  <span>رهان (1)</span>
                  {bet1Placed && (
                    <span className="text-[10px] bg-emerald-950 border border-emerald-500 text-emerald-300 px-1.5 py-0.2 rounded">
                      مؤكد ✓
                    </span>
                  )}
                </span>

                <div className="flex items-center gap-1.5 text-xs">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bet1AutoCashout}
                      onChange={(e) => setBet1AutoCashout(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span className="text-[11px] text-slate-300 font-bold">سحب تلقائي</span>
                  </label>
                  <div className="flex items-center bg-[#070a1a] border border-indigo-500/40 rounded-lg px-1.5 py-0.5 font-mono text-cyan-300 text-xs">
                    <input
                      type="number"
                      step="0.1"
                      min="1.05"
                      max="100"
                      value={bet1AutoMult}
                      onChange={(e) => setBet1AutoMult(parseFloat(e.target.value) || 1.1)}
                      disabled={!bet1AutoCashout}
                      className="w-10 bg-transparent text-left outline-none font-bold text-xs"
                    />
                    <span>x</span>
                  </div>
                </div>
              </div>

              {/* Auto Cashout Quick Presets */}
              {bet1AutoCashout && (
                <div className="flex items-center gap-1 pb-0.5 overflow-x-auto no-scrollbar">
                  <span className="text-[9px] text-slate-400 font-bold">المضاعف:</span>
                  {AUTO_PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setBet1AutoMult(p)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                        bet1AutoMult === p
                          ? 'bg-cyan-500 border-cyan-300 text-slate-950 shadow-sm'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      {p.toFixed(1)}x
                    </button>
                  ))}
                </div>
              )}

              {/* Amount Input & Buttons */}
              <div className="grid grid-cols-12 gap-1.5 items-center">
                <div className="col-span-7 flex items-center justify-between bg-[#070a1a] border border-indigo-500/40 rounded-xl px-2 py-1.5">
                  <span className="text-amber-400 text-xs">🪙</span>
                  <input
                    type="number"
                    value={bet1Amount}
                    onChange={(e) => setBet1Amount(Math.max(10, parseInt(e.target.value) || 0))}
                    disabled={bet1Placed && gameState === 'FLYING'}
                    className="w-full bg-transparent text-center font-mono font-black text-white text-xs outline-none"
                  />
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => setBet1Amount((b) => Math.max(10, Math.floor(b / 2)))}
                      className="px-1 py-0.5 rounded bg-slate-800 text-[9px] font-bold text-slate-300 hover:text-white"
                    >
                      ½
                    </button>
                    <button
                      onClick={() => setBet1Amount((b) => Math.min(user.coins, b * 2))}
                      className="px-1 py-0.5 rounded bg-slate-800 text-[9px] font-bold text-slate-300 hover:text-white"
                    >
                      2X
                    </button>
                    <button
                      onClick={() => setBet1Amount(user.coins)}
                      className="px-1 py-0.5 rounded bg-amber-950 border border-amber-500 text-[9px] font-bold text-amber-300"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Action Bet / Cashout Button */}
                {gameState === 'FLYING' && bet1Placed && !bet1Cashed ? (
                  <button
                    onClick={() => handleCashoutBet1()}
                    className="col-span-5 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(219,39,119,0.8)] border border-pink-300 bg-gradient-to-r from-pink-600 via-fuchsia-600 to-pink-600 text-white flex flex-col items-center justify-center gap-0.5 animate-pulse"
                  >
                    <span>سحب الرهان</span>
                    <span className="font-mono text-[10px] text-amber-300">
                      {(bet1Amount * multiplier).toFixed(0)} 🪙
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceBet1}
                    disabled={bet1Placed || (gameState === 'FLYING' && !bet1Placed)}
                    className={`col-span-5 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-1 ${
                      bet1Cashed
                        ? 'bg-emerald-600 text-white border border-emerald-400'
                        : bet1Placed
                        ? 'bg-emerald-700 text-white'
                        : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110'
                    } disabled:opacity-40`}
                  >
                    <span>
                      {bet1Cashed
                        ? `تم السحب ✓ (+${bet1WonCoins})`
                        : bet1Placed
                        ? 'تم الرهان (في الانتظار)'
                        : 'تثبيت الرهان'}
                    </span>
                    {!bet1Placed && <span>🚀</span>}
                  </button>
                )}
              </div>

              {/* Quick Chips Row */}
              <div className="grid grid-cols-6 gap-1">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => {
                      setBet1Amount(chip.value);
                      playSound('chip');
                    }}
                    disabled={bet1Placed && gameState === 'FLYING'}
                    className={`py-1 rounded-lg font-mono font-black text-[10px] text-white bg-gradient-to-b ${chip.bg} border shadow transition-transform active:scale-95 cursor-pointer disabled:opacity-40`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* BET 2 CARD (Conditional on Dual Bet Mode) */}
            {dualBetMode && (
              <div className="bg-[#120e36] border border-purple-500/30 rounded-2xl p-2.5 space-y-2 animate-in slide-in-from-top duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-300 flex items-center gap-1">
                    <span>رهان (2)</span>
                    {bet2Placed && (
                      <span className="text-[10px] bg-purple-950 border border-purple-500 text-purple-300 px-1.5 py-0.2 rounded">
                        مؤكد ✓
                      </span>
                    )}
                  </span>

                  <div className="flex items-center gap-1.5 text-xs">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bet2AutoCashout}
                        onChange={(e) => setBet2AutoCashout(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-0"
                      />
                      <span className="text-[11px] text-slate-300 font-bold">سحب تلقائي</span>
                    </label>
                    <div className="flex items-center bg-[#070a1a] border border-purple-500/40 rounded-lg px-1.5 py-0.5 font-mono text-purple-300 text-xs">
                      <input
                        type="number"
                        step="0.5"
                        min="1.1"
                        max="100"
                        value={bet2AutoMult}
                        onChange={(e) => setBet2AutoMult(parseFloat(e.target.value) || 2.0)}
                        disabled={!bet2AutoCashout}
                        className="w-10 bg-transparent text-left outline-none font-bold text-xs"
                      />
                      <span>x</span>
                    </div>
                  </div>
                </div>

                {/* Auto Cashout Quick Presets (2) */}
                {bet2AutoCashout && (
                  <div className="flex items-center gap-1 pb-0.5 overflow-x-auto no-scrollbar">
                    <span className="text-[9px] text-purple-300 font-bold">المضاعف:</span>
                    {AUTO_PRESETS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setBet2AutoMult(p)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                          bet2AutoMult === p
                            ? 'bg-purple-500 border-purple-300 text-white shadow-sm'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        {p.toFixed(1)}x
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-12 gap-1.5 items-center">
                  <div className="col-span-7 flex items-center justify-between bg-[#070a1a] border border-purple-500/40 rounded-xl px-2 py-1.5">
                    <span className="text-purple-400 text-xs">🪙</span>
                    <input
                      type="number"
                      value={bet2Amount}
                      onChange={(e) => setBet2Amount(Math.max(10, parseInt(e.target.value) || 0))}
                      disabled={bet2Placed && gameState === 'FLYING'}
                      className="w-full bg-transparent text-center font-mono font-black text-white text-xs outline-none"
                    />
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => setBet2Amount((b) => Math.max(10, Math.floor(b / 2)))}
                        className="px-1 py-0.5 rounded bg-slate-800 text-[9px] font-bold text-slate-300 hover:text-white"
                      >
                        ½
                      </button>
                      <button
                        onClick={() => setBet2Amount((b) => Math.min(user.coins, b * 2))}
                        className="px-1 py-0.5 rounded bg-slate-800 text-[9px] font-bold text-slate-300 hover:text-white"
                      >
                        2X
                      </button>
                    </div>
                  </div>

                  {/* Action Bet / Cashout Button (2) */}
                  {gameState === 'FLYING' && bet2Placed && !bet2Cashed ? (
                    <button
                      onClick={() => handleCashoutBet2()}
                      className="col-span-5 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.8)] border border-purple-300 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white flex flex-col items-center justify-center gap-0.5 animate-pulse"
                    >
                      <span>سحب الرهان (2)</span>
                      <span className="font-mono text-[10px] text-amber-300">
                        {(bet2Amount * multiplier).toFixed(0)} 🪙
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={handlePlaceBet2}
                      disabled={bet2Placed || (gameState === 'FLYING' && !bet2Placed)}
                      className={`col-span-5 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-1 ${
                        bet2Cashed
                          ? 'bg-purple-600 text-white border border-purple-400'
                          : bet2Placed
                          ? 'bg-purple-800 text-white'
                          : 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white hover:brightness-110'
                      } disabled:opacity-40`}
                    >
                      <span>
                        {bet2Cashed
                          ? `تم السحب ✓ (+${bet2WonCoins})`
                          : bet2Placed
                          ? 'تم الرهان (في الانتظار)'
                          : 'تثبيت الرهان (2)'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MY HISTORY & STATS */}
        {/* ========================================================= */}
        {activeBottomTab === 'MY_HISTORY' && (
          <div className="space-y-2.5 animate-in fade-in-50 duration-200">
            {/* Stats Summary Ribbon */}
            {(() => {
              const totalGames = personalHistory.length;
              const winGames = personalHistory.filter((h) => h.won).length;
              const winRate = totalGames > 0 ? Math.round((winGames / totalGames) * 100) : 0;
              const totalNet = personalHistory.reduce((acc, h) => acc + h.netProfit, 0);
              const maxMult = personalHistory.reduce((acc, h) => Math.max(acc, h.cashMultiplier), 0);

              return (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#0e1436] border border-indigo-500/30 p-2 rounded-2xl text-center">
                    <span className="text-[10px] text-slate-400 block font-bold">صافي الأرباح</span>
                    <span className={`font-mono font-black text-xs ${totalNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {totalNet >= 0 ? `+${totalNet.toLocaleString()}` : totalNet.toLocaleString()} 🪙
                    </span>
                  </div>
                  <div className="bg-[#0e1436] border border-indigo-500/30 p-2 rounded-2xl text-center">
                    <span className="text-[10px] text-slate-400 block font-bold">نسبة الفوز</span>
                    <span className="font-mono font-black text-xs text-cyan-300">
                      {winRate}% ({winGames}/{totalGames})
                    </span>
                  </div>
                  <div className="bg-[#0e1436] border border-indigo-500/30 p-2 rounded-2xl text-center">
                    <span className="text-[10px] text-slate-400 block font-bold">أعلى مضاعف</span>
                    <span className="font-mono font-black text-xs text-amber-300">
                      {maxMult > 0 ? `${maxMult.toFixed(2)}x` : '—'}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* History Table */}
            <div className="bg-[#0a0f2c] border border-indigo-950 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-5 bg-[#0f153a] p-2 text-[10px] font-bold text-slate-400 border-b border-indigo-900/60 text-center">
                <span>الجولة</span>
                <span>الرهان</span>
                <span>السحب</span>
                <span>السقوط</span>
                <span>الربح/الخسارة</span>
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-indigo-950/60 no-scrollbar">
                {personalHistory.length > 0 ? (
                  personalHistory.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-5 p-2 text-[10px] font-mono text-center items-center">
                      <span className="text-slate-400">#{item.roundId}</span>
                      <span className="text-slate-200">{item.betAmount.toLocaleString()}</span>
                      <span className={item.won ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {item.won ? `${item.cashMultiplier.toFixed(2)}x` : '—'}
                      </span>
                      <span className="text-rose-400 font-bold">{item.crashTarget.toFixed(2)}x</span>
                      <span className={`font-black ${item.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.netProfit >= 0 ? `+${item.netProfit.toLocaleString()}` : item.netProfit.toLocaleString()} 🪙
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500 font-mono">
                    لا يوجد سجل جولات سابقة حتى الآن 🚀
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: REAL LEADERBOARD & TOP RECORDS 🏆 */}
        {/* ========================================================= */}
        {activeBottomTab === 'LEADERBOARD' && (
          <div className="space-y-2 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between pb-1 text-xs">
              <span className="font-black text-amber-300 flex items-center gap-1">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>أعلى الأرقام القياسية المسجلة 🚀</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">سجل الأبطال</span>
            </div>

            {(() => {
              const winningRecords = personalHistory
                .filter((h) => h.won && h.cashMultiplier > 1.0)
                .sort((a, b) => b.cashMultiplier - a.cashMultiplier)
                .slice(0, 5);

              if (winningRecords.length === 0) {
                return (
                  <div className="py-8 text-center bg-[#0e1436]/50 border border-indigo-500/20 rounded-2xl p-4 space-y-2">
                    <span className="text-3xl block animate-bounce">🏆</span>
                    <span className="font-black text-xs text-amber-300 block">لا توجد أرقام قياسية مسجلة بعد</span>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      قم بوضع رهانك واسحب عند مضاعفات عالية لتسجيل اسمك في صدارة الأبطال! 🚀
                    </span>
                  </div>
                );
              }

              const rankBadges = ['🥇', '🥈', '🥉', '4', '5'];

              return (
                <div className="space-y-1.5 font-mono text-xs">
                  {winningRecords.map((rec, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-2xl flex items-center justify-between border shadow-md ${
                        idx === 0
                          ? 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-amber-500/70'
                          : idx === 1
                          ? 'bg-slate-900/90 border-slate-700/80'
                          : idx === 2
                          ? 'bg-slate-900/90 border-amber-900/50'
                          : 'bg-slate-950/70 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{rankBadges[idx]}</span>
                        <div className="flex items-center gap-1.5">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-5 h-5 rounded-full object-cover border border-amber-400/40" />
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-indigo-900/80 flex items-center justify-center text-[10px]">👤</span>
                          )}
                          <div>
                            <span className="font-bold text-white block text-[11px] font-sans">
                              {user.name || 'أنت'}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              جولة #{rec.roundId}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className="font-black text-amber-300 block text-xs">
                          {rec.cashMultiplier.toFixed(2)}x
                        </span>
                        <span className="text-[9px] text-emerald-400 font-bold">
                          +{rec.netProfit.toLocaleString()} 🪙
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Trust & Fairness Footer Badges */}
        <div className="pt-2 border-t border-indigo-950/80 flex items-center justify-around text-[10px] text-slate-400 font-bold">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>نظام عادل 100%</span>
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-purple-400" />
            <span>حماية مشفرة</span>
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>سحب فوري</span>
          </span>
          <span className="flex items-center gap-1">
            <Gift className="w-3 h-3 text-pink-400" />
            <span>مكافآت يومية</span>
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. PROVABLY FAIR SYSTEM MODAL */}
      {/* ========================================================= */}
      {showFairnessModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0a0f2c] border border-cyan-500/40 rounded-3xl p-5 shadow-2xl text-right space-y-3">
            <div className="flex items-center justify-between border-b border-indigo-900/60 pb-2">
              <h3 className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>نظام النزاهة والعدالة المشفر (Provably Fair)</span>
              </h3>
              <button
                onClick={() => setShowFairnessModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
              <p>
                تعتمد لعبة الصاروخ على خوارزمية تشفيرية عادلة ومثبتة مسبقاً (SHA-256 Seed). يتم توليد نقطة تحطم الصاروخ قبل بدء الجولة بشكل مشفر تماماً ولا يمكن لأي طرف التلاعب به.
              </p>
              <div className="bg-[#060a1f] border border-indigo-950 p-2.5 rounded-xl font-mono text-[10px] space-y-1">
                <span className="text-slate-400 block font-bold">رمز التشفير للجولة الحالية:</span>
                <span className="text-cyan-400 break-all select-all font-mono">{currentHash}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. RULES & INSTRUCTIONS MODAL */}
      {/* ========================================================= */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0a0f2c] border border-indigo-500/40 rounded-3xl p-5 shadow-2xl text-right space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                <span>قواعد واستراتيجيات لعبة الصاروخ 🚀</span>
              </h3>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold text-sm">1.</span>
                <p>اختر قيمة الرهان واضغط زر "تثبيت الرهان" خلال فترة العد التنازلي (5 ثوانٍ).</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold text-sm">2.</span>
                <p>مع انطلاق الصاروخ يتزايد معامل الأرباح (1.00x إلى 50.00x وأكثر).</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold text-sm">3.</span>
                <p>اضغط زر "سحب الأرباح" في أي لحظة قبل انفجار الصاروخ لحصد أرباحك فوراً.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold text-sm">4.</span>
                <p>
                  <strong>ميزة الرهان المزدوج:</strong> يمكنك تفعيل رهانين في نفس الجولة وتخصيص سحب تلقائي مختلف لكل منهما لتأمين الأرباح!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. HYPE MUSIC SELECTION MODAL */}
      {/* ========================================================= */}
      {showMusicModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0a0f2c] border border-purple-500/40 rounded-3xl p-5 shadow-2xl text-right space-y-3">
            <div className="flex items-center justify-between border-b border-indigo-900/60 pb-2">
              <h3 className="font-bold text-sm text-purple-300 flex items-center gap-1.5">
                <Music className="w-4 h-4 text-pink-400" />
                <span>اختر أغنية الصاروخ الحماسية 🚀</span>
              </h3>
              <button
                onClick={() => setShowMusicModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {HYPE_TRACKS.map((t, idx) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTrackIdx(idx);
                    playSound('chip');
                    setShowMusicModal(false);
                  }}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedTrackIdx === idx
                      ? 'bg-purple-950/80 border-purple-400 shadow-md scale-[1.02]'
                      : 'bg-slate-900/80 border-indigo-950 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{t.icon}</span>
                    <div>
                      <span className="font-bold text-xs text-white block">{t.name}</span>
                      <span className="text-[10px] text-slate-400">{t.artist}</span>
                    </div>
                  </div>
                  {selectedTrackIdx === idx && (
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                      المحددة ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hidden YouTube Audio Bridge for Rocket Continuous Loop Songs */}
      {HYPE_TRACKS[selectedTrackIdx]?.youtubeId && (
        <iframe
          ref={youtubeIframeRef}
          title="Rocket YouTube Music Player"
          src={`https://www.youtube.com/embed/${HYPE_TRACKS[selectedTrackIdx].youtubeId}?enablejsapi=1&autoplay=1&controls=0&disablekb=1&fs=0&rel=0&loop=1&playlist=${HYPE_TRACKS[selectedTrackIdx].youtubeId}`}
          allow="autoplay"
          className="w-0 h-0 opacity-0 pointer-events-none absolute"
        />
      )}
    </div>
  );
};
