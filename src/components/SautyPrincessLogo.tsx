import React from 'react';
import { Sparkles, Gem } from 'lucide-react';

interface SautyPrincessLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  animate?: boolean;
}

export const SautyPrincessLogo: React.FC<SautyPrincessLogoProps> = ({
  size = 'lg',
  showSubtitle = true,
  className = '',
  animate = true,
}) => {
  const sizeMap = {
    sm: {
      emblem: 'w-20 h-20',
      letter: 'text-3xl',
      titleArabic: 'text-lg',
      titleEnglish: 'text-sm tracking-[0.2em]',
      subArabic: 'text-sm',
      subEnglish: 'text-xs font-serif italic',
    },
    md: {
      emblem: 'w-32 h-32',
      letter: 'text-5xl',
      titleArabic: 'text-2xl',
      titleEnglish: 'text-lg tracking-[0.25em]',
      subArabic: 'text-lg',
      subEnglish: 'text-sm font-serif italic',
    },
    lg: {
      emblem: 'w-44 h-44 sm:w-48 sm:h-48',
      letter: 'text-7xl sm:text-8xl',
      titleArabic: 'text-3xl sm:text-4xl',
      titleEnglish: 'text-xl sm:text-2xl tracking-[0.25em]',
      subArabic: 'text-2xl sm:text-3xl',
      subEnglish: 'text-base sm:text-lg font-serif italic',
    },
    xl: {
      emblem: 'w-56 h-56 sm:w-64 sm:h-64',
      letter: 'text-8xl sm:text-9xl',
      titleArabic: 'text-4xl sm:text-5xl',
      titleEnglish: 'text-2xl sm:text-3xl tracking-[0.3em]',
      subArabic: 'text-3xl sm:text-4xl',
      subEnglish: 'text-lg sm:text-xl font-serif italic',
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* 3D Rose Gold Diamond Filigree Medallion */}
      <div className="relative group cursor-pointer">
        
        {/* Ambient Pulsing Rose Quartz Glow */}
        <div
          className={`absolute -inset-6 rounded-full bg-gradient-to-tr from-pink-500/40 via-rose-400/35 to-purple-400/30 blur-2xl opacity-90 ${
            animate ? 'animate-pulse' : ''
          }`}
        />

        {/* Floating 3D Crystal Hearts on corners */}
        <div className="absolute -top-3 -right-4 text-xl filter drop-shadow-[0_4px_8px_rgba(244,143,177,0.8)] animate-butterfly pointer-events-none">
          💖
        </div>
        <div className="absolute -bottom-2 -left-4 text-lg filter drop-shadow-[0_4px_8px_rgba(244,143,177,0.8)] animate-float-slow pointer-events-none">
          💗
        </div>
        <div className="absolute top-1/2 -left-6 text-xl filter drop-shadow-[0_4px_8px_rgba(244,143,177,0.8)] animate-butterfly pointer-events-none">
          🦋
        </div>
        <div className="absolute -top-4 -left-3 text-lg filter drop-shadow-[0_4px_8px_rgba(244,143,177,0.8)] animate-float-slow pointer-events-none">
          ✨
        </div>

        {/* Outer Filigree Floral Lace Crown Ring (Scalloped Pearl Edges) */}
        <div
          className={`relative ${currentSize.emblem} rounded-full p-2 bg-gradient-to-br from-[#FFE4E8] via-[#F8BBD0] to-[#E57373] shadow-[0_12px_45px_rgba(216,27,96,0.4),0_0_35px_rgba(255,192,203,0.8),inset_0_2px_4px_#ffffff] flex items-center justify-center`}
        >
          {/* Beaded Pearl Ring */}
          <div className="absolute inset-1 rounded-full border-2 border-dotted border-white/90 shadow-[0_0_8px_#ffffff] pointer-events-none" />

          {/* Middle Rose-Gold Engraved Filigree Disc */}
          <div className="relative w-full h-full rounded-full p-1.5 bg-gradient-to-tr from-[#D81B60] via-[#F06292] to-[#FF80AB] flex items-center justify-center shadow-inner border border-white/60">
            
            {/* Inner Pearl & Crystal Frame Ring */}
            <div className="w-full h-full rounded-full p-1.5 bg-gradient-to-b from-[#FFF0F3] via-[#FCE4EC] to-[#F8BBD0] flex items-center justify-center relative overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.15)] border-2 border-dashed border-[#F48FB1]">
              
              {/* Radial Starlight Shimmer */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.9)_0%,transparent_70%)] pointer-events-none" />

              {/* Diamond-Studded Monogram 'S' */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <span
                  className={`${currentSize.letter} font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-[#FFCDD2] to-[#E91E63] drop-shadow-[0_4px_12px_rgba(216,27,96,0.6)] leading-none select-none tracking-tight`}
                  style={{
                    textShadow: '0 0 10px rgba(255,255,255,0.9), 0 2px 5px rgba(216,27,96,0.8)',
                    WebkitTextStroke: '1px rgba(255,255,255,0.9)',
                  }}
                >
                  S
                </span>
              </div>

              {/* Sparkle Glints */}
              <Sparkles className="absolute top-2 right-3 w-4 h-4 text-white animate-pulse" />
              <Sparkles className="absolute bottom-2 left-3 w-3.5 h-3.5 text-pink-100 animate-bounce" />
            </div>
          </div>
        </div>
      </div>

      {/* Brand Typography: «سَوْتِي SAUTY» and «سليم Sleim» */}
      <div className="mt-4 flex flex-col items-center text-center space-y-0.5">
        
        {/* Row 1: سَوْتِي SAUTY */}
        <div className="flex items-center justify-center gap-2">
          <h1
            className={`${currentSize.titleArabic} font-cairo font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-[#FFE4E8] to-[#E91E63] drop-shadow-[0_3px_10px_rgba(216,27,96,0.5)]`}
            style={{
              textShadow: '0 2px 8px rgba(233,30,99,0.4)',
              WebkitTextStroke: '0.5px rgba(255,255,255,0.8)',
            }}
          >
            سَوْتِي
          </h1>
          <span
            className={`${currentSize.titleEnglish} font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-[#FFCDD2] to-[#C2185B] drop-shadow-[0_3px_10px_rgba(216,27,96,0.5)]`}
            style={{
              textShadow: '0 2px 8px rgba(233,30,99,0.4)',
              WebkitTextStroke: '0.5px rgba(255,255,255,0.8)',
            }}
          >
            SAUTY
          </span>
        </div>

        {/* Row 2: سليم Sleim */}
        <div className="flex items-center justify-center gap-2">
          <span
            className={`${currentSize.subArabic} font-cairo font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFF0F3] via-[#F8BBD0] to-[#AD1457] drop-shadow`}
            style={{
              textShadow: '0 2px 6px rgba(233,30,99,0.3)',
            }}
          >
            سليم
          </span>
          <span
            className={`${currentSize.subEnglish} text-transparent bg-clip-text bg-gradient-to-b from-[#FFF0F3] via-[#F48FB1] to-[#AD1457] font-serif italic drop-shadow`}
            style={{
              textShadow: '0 2px 6px rgba(233,30,99,0.3)',
            }}
          >
            Sleim
          </span>
        </div>

        {showSubtitle && (
          <p className="text-xs text-pink-200/90 font-bold mt-1 tracking-wide bg-pink-950/60 px-3.5 py-0.5 rounded-full border border-pink-400/40 shadow-sm backdrop-blur-sm">
            عالم الدردشة الصوتية الملكية والترفيه الراقي
          </p>
        )}
      </div>
    </div>
  );
};
