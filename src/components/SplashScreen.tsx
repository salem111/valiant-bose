import React, { useState } from 'react';
import { Sparkles, Crown, Heart, ChevronRight, Volume2, ShieldCheck, Users } from 'lucide-react';

interface SplashScreenProps {
  onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: 'دردشة صوتية ... تواصل بلا حدود',
      desc: 'استمتع بأفضل غرف الصوت المباشرة، غنّي، العب وشارك لحظاتك مع أصدقائك من مختلف العالم العربي.',
      icon: <Volume2 className="w-5 h-5 text-amber-300" />,
    },
    {
      title: 'وكالات رسمية ودعم مباشر',
      desc: 'انضم لوكالات SALEEM الرسمية واحصل على مكافآت يومية ورواتب مضاعفة للمستضيفين.',
      icon: <Users className="w-5 h-5 text-purple-300" />,
    },
    {
      title: 'حماية وأمان مع مستويات VIP',
      desc: 'تميز بشارات ملكية وإطارات VIP فاخرة تعكس مكانتك وسلطتك داخل الغرف.',
      icon: <ShieldCheck className="w-5 h-5 text-amber-300" />,
    },
    {
      title: 'ألعاب وفعاليات حماسية 24/7',
      desc: 'خض تحديات الشدة واللودو والطرنيب، واجمع الجواهر والعملات مع أصدقائك.',
      icon: <Sparkles className="w-5 h-5 text-pink-300" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950 text-white overflow-hidden select-none font-sans dir-rtl">
      {/* Dynamic Animated Background Gradients & Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/80 via-slate-950 to-purple-950/90" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-purple-600/25 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] bg-amber-500/15 rounded-full blur-[80px] pointer-events-none" />
      
      {/* Background Micro Sparkling Dust / Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      {/* Top Mobile Status Header Bar Mock */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6 pt-3 flex items-center justify-between text-xs text-slate-300/80 font-mono">
        <span>9:41</span>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span>📶</span>
          <span>📡</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Main Center Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6 my-auto flex flex-col items-center text-center">
        {/* Royal Crown Emblem with S Logo */}
        <div className="relative mb-6 group cursor-pointer">
          {/* Glowing Aura Ring behind Crown */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-amber-500/30 via-purple-500/30 to-pink-500/30 blur-xl opacity-80 group-hover:opacity-100 transition-opacity animate-pulse" />

          {/* Emblem Container */}
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full border-2 border-amber-400/60 bg-gradient-to-b from-slate-900/90 to-purple-950/90 shadow-[0_0_50px_rgba(217,119,6,0.3)] flex flex-col items-center justify-center p-3 backdrop-blur-md">
            
            {/* Top Royal Crown */}
            <div className="absolute -top-7 sm:-top-8 flex items-center justify-center filter drop-shadow-[0_4px_10px_rgba(245,158,11,0.6)]">
              <div className="relative">
                <Crown className="w-16 h-16 sm:w-18 sm:h-18 text-amber-300 fill-amber-400/30 stroke-[1.5]" />
                <span className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-300 rounded-full blur-[1px] animate-ping" />
              </div>
            </div>

            {/* Inner Filigree Circle */}
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border border-amber-400/40 p-2 flex items-center justify-center bg-gradient-to-br from-amber-500/10 via-purple-900/40 to-slate-950 shadow-inner">
              
              {/* Grand 'S' Gold Typography */}
              <span className="text-6xl sm:text-7xl font-serif font-black tracking-widest bg-gradient-to-b from-amber-200 via-amber-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)]">
                S
              </span>
            </div>

            {/* Decorative Gold Side Filigree Swirl Accents */}
            <div className="absolute -bottom-2 text-amber-400/80 text-xs font-serif tracking-widest">
              ❖ SALEEM ❖
            </div>
          </div>
        </div>

        {/* SALEEM Brand Name Title */}
        <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-[0.25em] bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_4px_15px_rgba(245,158,11,0.4)] mb-3">
          SALEEM
        </h1>

        {/* Heart Diamond Divider Ornament */}
        <div className="flex items-center gap-2 my-2 w-full max-w-[220px]">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-400/60 to-purple-400/60" />
          <div className="w-5 h-5 rounded-full border border-amber-400/60 bg-purple-900/80 flex items-center justify-center shadow-md">
            <Heart className="w-3 h-3 text-pink-400 fill-pink-400 animate-bounce" />
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-amber-400/60 to-purple-400/60" />
        </div>

        {/* Active Slide Text */}
        <div className="min-h-[70px] flex flex-col items-center justify-center mt-2 px-2">
          <p className="text-sm sm:text-base font-bold text-slate-200 tracking-wide mb-1 leading-snug">
            {slides[activeSlide].title}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs line-clamp-2">
            {slides[activeSlide].desc}
          </p>
        </div>

        {/* Carousel Page Indicators (4 dots) */}
        <div className="flex items-center gap-2 mt-4 mb-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`transition-all duration-300 rounded-full ${
                activeSlide === idx
                  ? 'w-6 h-1.5 bg-gradient-to-r from-amber-400 to-pink-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                  : 'w-1.5 h-1.5 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6 pb-8 flex flex-col items-center gap-3">
        {/* Main CTA Pill Button "ابدأ الآن" */}
        <button
          onClick={onStart}
          className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-black text-base tracking-wide shadow-[0_10px_30px_rgba(168,85,247,0.4)] hover:shadow-[0_15px_40px_rgba(168,85,247,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer border border-pink-400/30"
        >
          <span>ابدأ الآن</span>
          <ChevronRight className="w-5 h-5 text-white/90 group-hover:-translate-x-1 transition-transform rotate-180" />
        </button>

        {/* Secondary Link "استكشف المزيد" */}
        <button
          onClick={onStart}
          className="text-xs font-bold text-slate-400 hover:text-amber-300 transition-colors py-1 hover:underline cursor-pointer tracking-wider"
        >
          استكشف المزيد
        </button>
      </div>
    </div>
  );
};
