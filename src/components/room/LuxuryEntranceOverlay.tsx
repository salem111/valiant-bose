import React, { useEffect, useState, useRef } from 'react';
import { AvatarWithFrame } from '../AvatarWithFrame';
import { Sparkles } from 'lucide-react';

export interface EntranceData {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userFrame?: string;
  vipLevel?: number;
  entranceId: string;
  entranceName: string;
  entranceIcon: string;
  entranceType?: 'jet' | 'car' | 'helicopter' | 'dragon' | 'ufo' | 'carpet' | 'carriage' | 'rolls' | 'phoenix';
  colorTheme?: string;
}

export interface LuxuryEntranceConfig {
  id: string;
  name: string;
  icon: string;
  type: 'jet' | 'car' | 'helicopter' | 'dragon' | 'ufo' | 'carpet' | 'carriage' | 'rolls' | 'phoenix';
  title: string;
  subtitle: string;
  gradient: string;
  accentColor: string;
  bgGlow: string;
  soundType: 'jet' | 'car' | 'magic' | 'fanfare' | 'dragon' | 'cyber';
}

export const ENTRANCE_CONFIGS: Record<string, LuxuryEntranceConfig> = {
  ent_lambo: {
    id: 'ent_lambo',
    name: 'لامبورغيني الملكية الذهبية 🏎️',
    icon: '🏎️',
    type: 'car',
    title: 'موكب اللامبورغيني الذهبية',
    subtitle: 'انطلق بأقصى سرعة وهيبة ملكية',
    gradient: 'from-amber-500 via-yellow-400 to-amber-600',
    accentColor: '#f59e0b',
    bgGlow: 'rgba(245, 158, 11, 0.4)',
    soundType: 'car',
  },
  ent_royal_jet: {
    id: 'ent_royal_jet',
    name: 'طائرة VIP النفاثة الملكية ✈️',
    icon: '✈️',
    type: 'jet',
    title: 'طائرة الملوك الخاصة VIP',
    subtitle: 'هبوط ملكي نفاث فوق سماء الغرفة',
    gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
    accentColor: '#06b6d4',
    bgGlow: 'rgba(6, 182, 212, 0.45)',
    soundType: 'jet',
  },
  vehicle_jet: {
    id: 'vehicle_jet',
    name: 'طائرة VIP النفاثة ✈️',
    icon: '✈️',
    type: 'jet',
    title: 'طائرة الملوك النفاثة',
    subtitle: 'وصول استثنائي عالي الفخامة',
    gradient: 'from-cyan-400 via-blue-600 to-indigo-700',
    accentColor: '#38bdf8',
    bgGlow: 'rgba(56, 189, 248, 0.45)',
    soundType: 'jet',
  },
  car_ferrari: {
    id: 'car_ferrari',
    name: 'فيراري SF90 نيون 🏎️',
    icon: '🏎️',
    type: 'car',
    title: 'فيراري إيطالية حمراء نفاثة',
    subtitle: 'دخول رياضي ساحق وصوت محرك هادر',
    gradient: 'from-red-600 via-rose-500 to-amber-500',
    accentColor: '#ef4444',
    bgGlow: 'rgba(239, 68, 68, 0.4)',
    soundType: 'car',
  },
  ent_dragon: {
    id: 'ent_dragon',
    name: 'التنين الناري الأسطوري 🐉',
    icon: '🐉',
    type: 'dragon',
    title: 'التنين الناري الأسطوري',
    subtitle: 'زئير التنين واللهب المقدس يضيء الغرفة',
    gradient: 'from-red-600 via-orange-500 to-amber-400',
    accentColor: '#f97316',
    bgGlow: 'rgba(249, 115, 22, 0.45)',
    soundType: 'dragon',
  },
  vehicle_dragon: {
    id: 'vehicle_dragon',
    name: 'التنين الذهبي الأسطوري 🐉',
    icon: '🐉',
    type: 'dragon',
    title: 'التنين الذهبي الأسطوري',
    subtitle: 'تحليق ملكي أسطوري مهيب',
    gradient: 'from-amber-400 via-yellow-500 to-orange-600',
    accentColor: '#fbbf24',
    bgGlow: 'rgba(251, 191, 36, 0.45)',
    soundType: 'dragon',
  },
  ent_helicopter: {
    id: 'ent_helicopter',
    name: 'طائرة الهليكوبتر الرئاسية 🚁',
    icon: '🚁',
    type: 'helicopter',
    title: 'الهليكوبتر الرئاسية الفاخرة',
    subtitle: 'كشافات الإنارة وهبوط كبار الشخصيات',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    accentColor: '#10b981',
    bgGlow: 'rgba(16, 185, 129, 0.4)',
    soundType: 'jet',
  },
  ent_space_ufo: {
    id: 'ent_space_ufo',
    name: 'مركبة الفضاء السايبر المستقبلية 🛸',
    icon: '🛸',
    type: 'ufo',
    title: 'مركبة الفضاء المجرات السايبر',
    subtitle: 'انتقال فوري عبر بوابات النجوم والنيون',
    gradient: 'from-fuchsia-500 via-purple-600 to-cyan-400',
    accentColor: '#d946ef',
    bgGlow: 'rgba(217, 70, 239, 0.45)',
    soundType: 'cyber',
  },
  ent_carpet: {
    id: 'ent_carpet',
    name: 'بساط الريح السحري الملكي 🧞',
    icon: '🧞',
    type: 'carpet',
    title: 'بساط الريح السحري الملكي',
    subtitle: 'أجواء ألف ليلة وليلة وغبار النجوم اللامع',
    gradient: 'from-purple-600 via-pink-500 to-indigo-500',
    accentColor: '#a855f7',
    bgGlow: 'rgba(168, 85, 247, 0.4)',
    soundType: 'magic',
  },
  ent_rolls_royce: {
    id: 'ent_rolls_royce',
    name: 'رولز رويس فانتوم الملكية 🚗',
    icon: '🚗',
    type: 'rolls',
    title: 'رولز رويس فانتوم دايموند',
    subtitle: 'قمة الفخامة والأناقة الأرستقراطية',
    gradient: 'from-slate-200 via-amber-300 to-yellow-500',
    accentColor: '#e2e8f0',
    bgGlow: 'rgba(226, 232, 240, 0.4)',
    soundType: 'fanfare',
  },
  ent_phoenix: {
    id: 'ent_phoenix',
    name: 'طائر الفينيق المتوهج 🦅',
    icon: '🦅',
    type: 'phoenix',
    title: 'طائر الفينيق الذهبي المتوهج',
    subtitle: 'أجنحة ذهبية ترفرف بالبريق والأنوار',
    gradient: 'from-amber-400 via-rose-500 to-purple-600',
    accentColor: '#f43f5e',
    bgGlow: 'rgba(244, 63, 94, 0.45)',
    soundType: 'magic',
  },
};

export const ALL_LUXURY_ENTRANCES: LuxuryEntranceConfig[] = Object.values(ENTRANCE_CONFIGS);

// Sound synthesizers using Web Audio API
function playEntranceAudio(soundType: string) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (soundType === 'car') {
      // Supercar engine revving synthesis
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.5);
      osc.frequency.exponentialRampToValueAtTime(180, now + 1.2);
      osc.frequency.exponentialRampToValueAtTime(450, now + 1.8);
      osc.frequency.exponentialRampToValueAtTime(60, now + 2.5);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.6);
    } else if (soundType === 'jet') {
      // Jet engine swoosh with white noise & rising resonance
      const bufferSize = ctx.sampleRate * 2.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(1600, now + 1.2);
      filter.frequency.exponentialRampToValueAtTime(400, now + 2.5);
      filter.Q.value = 4.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 2.5);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start(now);
      whiteNoise.stop(now + 2.6);
    } else if (soundType === 'dragon' || soundType === 'cyber') {
      // Deep majestic rumble and cosmic chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(110, now);
      osc1.frequency.exponentialRampToValueAtTime(440, now + 0.8);
      osc1.frequency.exponentialRampToValueAtTime(220, now + 2.2);

      osc2.frequency.setValueAtTime(550, now);
      osc2.frequency.exponentialRampToValueAtTime(880, now + 1.0);
      osc2.frequency.exponentialRampToValueAtTime(440, now + 2.2);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 2.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.5);
      osc2.stop(now + 2.5);
    } else {
      // Royal fanfare melody chord
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.01, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 2.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + 2.3);
      });
    }
  } catch {
    // Graceful fallback if AudioContext restricted
  }
}

interface LuxuryEntranceOverlayProps {
  entrance: EntranceData | null;
  onComplete?: () => void;
}

export const LuxuryEntranceOverlay: React.FC<LuxuryEntranceOverlayProps> = ({
  entrance,
  onComplete,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationStep, setAnimationStep] = useState<'enter' | 'show' | 'exit'>('enter');
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (entrance) {
      setIsVisible(true);
      setAnimationStep('enter');

      const config = ENTRANCE_CONFIGS[entrance.entranceId] || ENTRANCE_CONFIGS.ent_lambo;
      playEntranceAudio(config.soundType);

      const step1 = setTimeout(() => {
        setAnimationStep('show');
      }, 400);

      const step2 = setTimeout(() => {
        setAnimationStep('exit');
      }, 3600);

      const step3 = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, 4200);

      timerRef.current = { step1, step2, step3 };

      return () => {
        clearTimeout(step1);
        clearTimeout(step2);
        clearTimeout(step3);
      };
    } else {
      setIsVisible(false);
    }
  }, [entrance?.id, entrance?.entranceId]);

  if (!entrance || !isVisible) return null;

  const config = ENTRANCE_CONFIGS[entrance.entranceId] || ENTRANCE_CONFIGS.ent_lambo;
  const isJet = config.type === 'jet' || config.type === 'helicopter';
  const isDragon = config.type === 'dragon' || config.type === 'phoenix';
  const isCar = config.type === 'car' || config.type === 'rolls';

  return (
    <div className="fixed inset-x-0 top-16 sm:top-20 z-50 pointer-events-none flex flex-col items-center justify-start px-3 select-none">
      {/* 1. Dramatic Dark & Golden Backdrop Aura */}
      <div
        className={`absolute -top-10 inset-x-0 h-44 transition-opacity duration-500 pointer-events-none ${
          animationStep === 'show' ? 'opacity-90' : 'opacity-0'
        }`}
        style={{
          background: `radial-gradient(ellipse at center, ${config.bgGlow} 0%, rgba(15, 10, 30, 0.75) 55%, transparent 75%)`,
        }}
      />

      {/* 2. Main Animated Entrance Vehicle / Airplane Presentation */}
      <div
        className={`relative w-full max-w-lg transition-all duration-700 ease-out transform ${
          animationStep === 'enter'
            ? 'translate-x-full scale-75 opacity-0'
            : animationStep === 'show'
            ? 'translate-x-0 scale-100 opacity-100'
            : '-translate-x-full scale-90 opacity-0'
        }`}
      >
        {/* Animated Speed & Light Trails */}
        <div className="absolute -inset-2 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-md animate-pulse pointer-events-none" />

        {/* The Luxury Entrance Container Card */}
        <div
          className={`relative rounded-3xl p-3 sm:p-4 border-2 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden bg-gradient-to-r from-[#0d091a]/95 via-[#18112e]/95 to-[#0d091a]/95`}
          style={{ borderColor: config.accentColor }}
        >
          {/* Top Sparkling Light Beams */}
          <div
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r via-white to-transparent opacity-80 animate-pulse"
            style={{
              backgroundImage: `linear-gradient(to right, transparent, ${config.accentColor}, #ffffff, ${config.accentColor}, transparent)`,
            }}
          />

          <div className="flex items-center justify-between gap-3 relative z-10">
            {/* Right: User Avatar + Frame + VIP Badge */}
            <div className="relative shrink-0 flex items-center justify-center">
              <AvatarWithFrame
                src={entrance.userAvatar}
                frameId={entrance.userFrame || undefined}
                size="lg"
                isSpeaking={true}
              />
              <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full border border-amber-200 shadow-md">
                VIP {entrance.vipLevel || 5} 👑
              </span>
            </div>

            {/* Middle: Grand Announcement Typography */}
            <div className="flex-1 min-w-0 text-right space-y-0.5">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-[10px] sm:text-xs font-black text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                  <span>وصول ملكي فاخر</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </span>
              </div>

              {/* User Name */}
              <h3 className="font-black text-sm sm:text-base text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400 truncate drop-shadow">
                {entrance.userName}
              </h3>

              {/* Entrance Ride Name */}
              <div className="flex items-center gap-1.5 justify-end">
                <span
                  className="font-bold text-[11px] sm:text-xs px-2 py-0.5 rounded-full text-slate-950 shadow-md flex items-center gap-1 bg-gradient-to-r"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${config.accentColor}, #ffffff)`,
                  }}
                >
                  <span className="text-sm">{config.icon}</span>
                  <span className="font-black truncate">{config.name}</span>
                </span>
                <span className="text-[10px] text-purple-200/90 font-medium">وصل راكباً:</span>
              </div>
            </div>

            {/* Left: Animated 3D Vehicle / Airplane Graphic */}
            <div className="relative shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20">
              {/* Radial Glowing Core */}
              <div
                className="absolute inset-0 rounded-full blur-lg animate-ping opacity-50 pointer-events-none"
                style={{ backgroundColor: config.accentColor }}
              />

              {/* Detailed Animated Vehicle Graphic Render */}
              <div className="relative z-10 flex flex-col items-center justify-center transform hover:scale-110 transition-transform">
                {isJet && (
                  <div className="relative flex flex-col items-center animate-bounce">
                    {/* Golden Jet Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-700 p-2 text-white shadow-2xl border-2 border-cyan-300 flex items-center justify-center">
                      <span className="text-3xl filter drop-shadow-[0_0_12px_rgba(6,182,212,0.9)] transform -rotate-45">
                        ✈️
                      </span>
                    </div>
                    {/* Jet Trail Particles */}
                    <div className="absolute -bottom-2 flex gap-1 items-center">
                      <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    </div>
                  </div>
                )}

                {isCar && (
                  <div className="relative flex flex-col items-center animate-pulse">
                    {/* Supercar Icon with Headlight Flares */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-rose-600 p-2 text-white shadow-2xl border-2 border-amber-300 flex items-center justify-center">
                      <span className="text-3xl filter drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]">
                        🏎️
                      </span>
                    </div>
                    {/* Speed sparks */}
                    <div className="absolute -bottom-1 w-10 h-1 bg-amber-400/80 rounded-full blur-xs" />
                  </div>
                )}

                {isDragon && (
                  <div className="relative flex flex-col items-center animate-bounce">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 p-2 text-white shadow-2xl border-2 border-orange-300 flex items-center justify-center">
                      <span className="text-3xl filter drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]">
                        🐉
                      </span>
                    </div>
                    <div className="absolute -top-1 right-0 text-xs animate-ping">🔥</div>
                  </div>
                )}

                {!isJet && !isCar && !isDragon && (
                  <div className="relative flex flex-col items-center animate-bounce">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-indigo-600 p-2 text-white shadow-2xl border-2 border-purple-300 flex items-center justify-center">
                      <span className="text-3xl filter drop-shadow-[0_0_12px_rgba(168,85,247,0.9)]">
                        {config.icon}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Running Light Ticker */}
          <div className="mt-2 pt-1 border-t border-white/10 flex items-center justify-between text-[9px] text-amber-200/80 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>دخول مباشر للغرفة</span>
            </span>
            <span className="text-purple-300 font-bold">{config.subtitle}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
