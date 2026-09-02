import React, { useState, useEffect } from 'react';
import { Sparkles, Radio, Gamepad2, Gift, Volume2, ShieldCheck, Play } from 'lucide-react';
import { useI18n } from '../lib/i18n';

const royalStageBannerAsset = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80';

interface BannerProps {
  onOpenGames: () => void;
  onOpenStore: () => void;
  onOpenVip: () => void;
}

export const Banner: React.FC<BannerProps> = ({ onOpenGames, onOpenStore, onOpenVip }) => {
  const { t, dir } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);

  const BANNER_SLIDES = [
    {
      id: 1,
      title: `${t('appName')} Live 👑`,
      slogan: t('bannerSubtitle'),
      tagline: t('bannerTitle'),
      badge: 'PROMO 💥',
      gradient: 'from-amber-600 via-purple-900 to-slate-950',
      icon: Volume2,
      actionText: t('rechargeNow'),
      actionType: 'store',
    },
    {
      id: 2,
      title: `${t('gamesRoom')} 🃏🔥`,
      slogan: t('miniGamesHall'),
      tagline: t('bannerSubtitle'),
      badge: 'TOP 🏆',
      gradient: 'from-emerald-700 via-slate-900 to-indigo-950',
      icon: Gamepad2,
      actionText: t('playNow'),
      actionType: 'games',
    },
    {
      id: 3,
      title: `${t('vipClub')} 💎`,
      slogan: t('bannerSubtitle'),
      tagline: t('bannerTitle'),
      badge: 'VIP 👑',
      gradient: 'from-rose-700 via-amber-950 to-slate-950',
      icon: Gift,
      actionText: t('joinVipNow'),
      actionType: 'vip',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = BANNER_SLIDES[currentIndex];

  const handleAction = (type: string) => {
    if (type === 'store') onOpenStore();
    else if (type === 'games') onOpenGames();
    else if (type === 'vip') onOpenVip();
  };

  return (
    <div id="saleem-top-banner" className="relative w-full overflow-hidden rounded-2xl my-2.5 shadow-2xl border border-amber-400/30 backdrop-blur-xl">
      <div
        className={`w-full bg-gradient-to-r ${slide.gradient} p-3.5 sm:p-5 transition-all duration-700 relative flex flex-col md:flex-row items-center justify-between gap-3`}
      >
        {/* Concept Background Image Layer */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={royalStageBannerAsset}
            alt="Royal Stage Concept"
            className="w-full h-full object-cover opacity-20 mix-blend-overlay scale-105"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 space-y-1 text-start w-full md:w-3/4">
          <div className="flex items-center gap-1.5 justify-start flex-wrap">
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.2 rounded-full shadow-md animate-pulse">
              {slide.badge}
            </span>
            <span className="flex items-center gap-0.5 bg-slate-900/60 text-amber-300 text-[9.5px] px-1.5 py-0.2 rounded-full border border-amber-400/20">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Official & Secure</span>
            </span>
          </div>

          <h2 className="text-sm sm:text-base font-black text-white tracking-wide flex items-center gap-1.5">
            <span>{slide.title}</span>
          </h2>

          <p className="text-amber-200 font-bold text-xs">
            ✨ {slide.slogan}
          </p>

          <p className="text-slate-300 text-[10.5px] font-normal leading-tight max-w-xl">
            {slide.tagline}
          </p>
        </div>

        {/* Interactive Button & Visual Icon */}
        <div className="relative z-10 flex flex-col items-center gap-1.5 w-full md:w-auto mt-1 md:mt-0">
          <button
            onClick={() => handleAction(slide.actionType)}
            className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black text-xs px-4 py-1.5 rounded-lg shadow-md hover:brightness-110 active:scale-95 transition-all border border-amber-200/50 cursor-pointer"
          >
            <slide.icon className="w-3.5 h-3.5 text-slate-950" />
            <span>{slide.actionText}</span>
          </button>

          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1 mt-0.5">
            {BANNER_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-slate-600 hover:bg-slate-400'
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
