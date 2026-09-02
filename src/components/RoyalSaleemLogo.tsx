import React from 'react';
import { Crown, Sparkles, Gem, Shield } from 'lucide-react';

interface RoyalSaleemLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  animate?: boolean;
}

export const RoyalSaleemLogo: React.FC<RoyalSaleemLogoProps> = ({
  size = 'lg',
  showSubtitle = true,
  className = '',
  animate = true,
}) => {
  const sizeMap = {
    sm: {
      emblem: 'w-16 h-16',
      crown: 'w-7 h-7 -top-3.5',
      letter: 'text-2xl',
      title: 'text-base tracking-[0.2em]',
      arabic: 'text-xs',
      tagline: 'text-[9px]',
      badge: 'px-2 py-0.5 text-[8px]',
    },
    md: {
      emblem: 'w-28 h-28',
      crown: 'w-12 h-12 -top-6',
      letter: 'text-4xl',
      title: 'text-2xl tracking-[0.25em]',
      arabic: 'text-sm font-bold',
      tagline: 'text-[11px]',
      badge: 'px-3 py-0.5 text-[10px]',
    },
    lg: {
      emblem: 'w-40 h-40 sm:w-44 sm:h-44',
      crown: 'w-16 h-16 sm:w-20 sm:h-20 -top-8 sm:-top-10',
      letter: 'text-6xl sm:text-7xl',
      title: 'text-3xl sm:text-4xl tracking-[0.25em]',
      arabic: 'text-base sm:text-lg font-black',
      tagline: 'text-xs sm:text-sm',
      badge: 'px-4 py-1 text-xs',
    },
    xl: {
      emblem: 'w-48 h-48 sm:w-56 sm:h-56',
      crown: 'w-20 h-20 sm:w-24 sm:h-24 -top-10 sm:-top-12',
      letter: 'text-7xl sm:text-8xl',
      title: 'text-4xl sm:text-5xl tracking-[0.3em]',
      arabic: 'text-lg sm:text-xl font-black',
      tagline: 'text-sm sm:text-base',
      badge: 'px-5 py-1 text-xs sm:text-sm',
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* 3D Royal Emblem Container */}
      <div className="relative group cursor-pointer">
        {/* Ambient Pulsing Glow Underlay */}
        <div
          className={`absolute -inset-4 rounded-full bg-gradient-to-tr from-amber-500/40 via-purple-600/30 to-yellow-400/40 blur-2xl opacity-75 ${
            animate ? 'animate-pulse' : ''
          }`}
        />

        {/* Outer Rotating Celestial / Filigree Ring */}
        <div
          className={`absolute -inset-2 rounded-full border border-dashed border-amber-400/30 ${
            animate ? 'animate-spin-slow' : ''
          } pointer-events-none`}
        />

        {/* Main Royal Shield / Emblem Frame */}
        <div
          className={`relative ${currentSize.emblem} rounded-full p-1 bg-gradient-to-b from-amber-300 via-amber-600 to-yellow-800 shadow-[0_0_40px_rgba(217,119,6,0.5),inset_0_2px_4px_rgba(255,255,255,0.7)] flex flex-col items-center justify-center`}
        >
          {/* Inner Velvet Onyx Disc */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950 p-2 flex flex-col items-center justify-center overflow-hidden border border-amber-400/40 shadow-inner">
            
            {/* Ray burst highlight inside emblem */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(245,208,97,0.25)_0%,transparent_60%)] pointer-events-none" />

            {/* Subtle Diamond Facet Lines */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#fff_25%,transparent_25%,transparent_50%,#fff_50%,#fff_75%,transparent_75%,transparent)] [background-size:16px_16px] pointer-events-none" />

            {/* Grand Gold 'S' Monogram & Arabic Touch */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <span
                className={`${currentSize.letter} font-cinzel font-black gold-text-luxury drop-shadow-[0_4px_16px_rgba(245,158,11,0.6)] leading-none`}
              >
                S
              </span>
            </div>

            {/* Mini Star Sparkles inside */}
            <Sparkles className="absolute top-3 right-3 w-3 h-3 text-amber-300 animate-bounce opacity-80" />
            <Gem className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 text-amber-400 opacity-70" />
          </div>

          {/* Majestic 3D Golden Crown with Gemstones */}
          <div
            className={`absolute ${currentSize.crown} flex items-center justify-center z-20 filter drop-shadow-[0_6px_14px_rgba(217,119,6,0.85)] ${
              animate ? 'animate-float-slow' : ''
            }`}
          >
            <div className="relative">
              {/* Crown Icon */}
              <Crown className="w-full h-full text-amber-300 fill-amber-400/50 stroke-[1.75]" />
              {/* Center Diamond Light in Crown */}
              <span className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full blur-[1px] shadow-[0_0_8px_#ffffff] animate-ping" />
              <span className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-300 rounded-full" />
            </div>
          </div>

          {/* Bottom Royal Ribbon / Tag */}
          <div className="absolute -bottom-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 font-cinzel font-black px-2.5 py-0.5 rounded-full text-[9px] tracking-wider shadow-lg border border-yellow-200">
            ★ VIP ROYAL ★
          </div>
        </div>
      </div>

      {/* Brand Name Typography */}
      <div className="mt-4 flex flex-col items-center text-center">
        <h1
          className={`${currentSize.title} font-cinzel font-black gold-text-luxury drop-shadow-[0_4px_18px_rgba(245,158,11,0.5)]`}
        >
          SALEEM
        </h1>

        <div className="flex items-center gap-2 mt-1">
          <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-amber-400" />
          <span className={`${currentSize.arabic} text-amber-200 font-cairo tracking-wide drop-shadow`}>
            سَلِيم • الفخامة والريادة
          </span>
          <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-amber-400" />
        </div>

        {showSubtitle && (
          <p className={`${currentSize.tagline} text-slate-300 font-medium mt-1 tracking-wide`}>
            عالم الدردشة الصوتية الملكية والألعاب الحصرية
          </p>
        )}
      </div>
    </div>
  );
};
