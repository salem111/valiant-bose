import React, { useEffect, useState } from 'react';
import { AVATAR_FRAMES, AvatarFrame } from '../data/framesData';

interface AvatarWithFrameProps {
  src?: string;
  avatarUrl?: string;
  frameId?: string | null;
  frameUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | string;
  customSizeClass?: string;
  avatarScalePercent?: number;
  alt?: string;
  className?: string;
  isSpeaking?: boolean;
  audioLevel?: number; // 0 - 100 live Agora hardware audio level
  onClick?: () => void;
}

export const AvatarWithFrame: React.FC<AvatarWithFrameProps> = ({
  src,
  avatarUrl,
  frameId,
  frameUrl,
  size = 'md',
  customSizeClass,
  avatarScalePercent,
  alt = 'صورة المستخدم',
  className = '',
  isSpeaking = false,
  audioLevel = 0,
  onClick,
}) => {
  const effectiveSrc = avatarUrl || src || '';
  
  // Read equipped frame from localStorage fallback if none passed
  let fallbackFrame = '';
  try {
    const savedEq = localStorage.getItem('saleem_equipped_items');
    if (savedEq) {
      const eq = JSON.parse(savedEq);
      if (eq.frame) fallbackFrame = eq.frame;
    }
  } catch (e) {}

  const effectiveFrame = frameUrl || frameId || fallbackFrame;
  let activeFrame: AvatarFrame | undefined = AVATAR_FRAMES.find((f) => f.id === effectiveFrame);

  // If frame is a direct asset filename or path e.g. "frame_01" or "/assets/frames/frame_01.png"
  if (!activeFrame && effectiveFrame && effectiveFrame !== 'none') {
    const isDirectPath = effectiveFrame.includes('/') || effectiveFrame.includes('.');
    const resolvedUrl = isDirectPath ? effectiveFrame : `/assets/frames/${effectiveFrame}.png`;
    activeFrame = {
      id: effectiveFrame,
      name: 'إطار ملكي فاخر',
      type: 'phoenix',
      rarity: 'SSR',
      duration: 'دائم',
      unlocked: true,
      glowColor: '#f59e0b',
      borderColor: '#f59e0b',
      frameImgUrl: resolvedUrl,
      description: 'إطار مخصص فاخر من حقيبة المقتنيات',
    };
  }
  const speakingActive = isSpeaking || audioLevel > 5;
  const clampedLevel = Math.min(100, Math.max(0, audioLevel));
  const dynamicScale = 1 + (clampedLevel / 100) * 0.15; // 1.0 to 1.15 pulse

  // Determine size dimensions (px) - Adjusted so frames are larger, clear & prominent!
  let sizeClasses = 'w-12 h-12';
  let innerSizeClasses = 'w-8.5 h-8.5';
  let crownSize = 'w-6 h-6 -top-3';
  let wingWidth = 'w-[50%] h-[90%]';

  if (size === 'xs') {
    sizeClasses = 'w-7 h-7';
    innerSizeClasses = 'w-5 h-5';
    crownSize = 'w-4 h-4 -top-2.5';
    wingWidth = 'w-[50%] h-[90%]';
  } else if (size === 'sm') {
    sizeClasses = 'w-10 h-10';
    innerSizeClasses = 'w-7 h-7';
    crownSize = 'w-5 h-5 -top-2.5';
    wingWidth = 'w-[50%] h-[90%]';
  } else if (size === 'md') {
    sizeClasses = 'w-13 h-13';
    innerSizeClasses = 'w-9 h-9';
    crownSize = 'w-6.5 h-6.5 -top-3.5';
    wingWidth = 'w-[50%] h-[90%]';
  } else if (size === 'lg') {
    sizeClasses = 'w-17 h-17';
    innerSizeClasses = 'w-11.5 h-11.5';
    crownSize = 'w-8 h-8 -top-4';
    wingWidth = 'w-[50%] h-[90%]';
  } else if (size === 'xl') {
    sizeClasses = 'w-22 h-22';
    innerSizeClasses = 'w-14 h-14';
    crownSize = 'w-10 h-10 -top-5';
    wingWidth = 'w-[50%] h-[90%]';
  } else if (size === '2xl') {
    sizeClasses = 'w-26 h-26';
    innerSizeClasses = 'w-17 h-17';
    crownSize = 'w-12 h-12 -top-6';
    wingWidth = 'w-[50%] h-[90%]';
  } else if (size === '3xl') {
    sizeClasses = 'w-32 h-32';
    innerSizeClasses = 'w-20 h-20';
    crownSize = 'w-15 h-15 -top-7';
    wingWidth = 'w-[50%] h-[90%]';
  } else if (typeof size === 'string' && size.includes('w-')) {
    sizeClasses = size;
    innerSizeClasses = 'w-[72%] h-[72%]';
  }

  if (customSizeClass) {
    sizeClasses = customSizeClass;
    innerSizeClasses = 'w-[70%] h-[70%]';
  }

  const fallbackAvatar =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
  const imgUrl = effectiveSrc || fallbackAvatar;

  // If no frame equipped or frame not found, render clean avatar without background
  if (!effectiveFrame || effectiveFrame === 'none' || !activeFrame) {
    return (
      <div
        onClick={onClick}
        className={`relative rounded-full flex items-center justify-center shrink-0 ${sizeClasses} ${className} ${
          speakingActive ? 'ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]' : ''
        }`}
        style={{
          transform: speakingActive ? `scale(${dynamicScale})` : undefined,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <img
          src={imgUrl}
          alt={alt}
          className="w-full h-full rounded-full object-cover border border-slate-700 shadow"
        />
        {/* Equalizer audio bars badge */}
        {speakingActive && (
          <div className="absolute -bottom-1.5 bg-slate-950/90 border border-emerald-400 px-1 py-0.5 rounded-full flex items-end gap-0.5 shadow-md z-30 pointer-events-none">
            <span
              className="w-0.5 bg-emerald-400 rounded-full transition-all duration-75"
              style={{ height: `${Math.max(4, (clampedLevel / 100) * 12)}px` }}
            />
            <span
              className="w-0.5 bg-amber-400 rounded-full transition-all duration-75"
              style={{ height: `${Math.max(6, (clampedLevel / 100) * 14)}px` }}
            />
            <span
              className="w-0.5 bg-emerald-400 rounded-full transition-all duration-75"
              style={{ height: `${Math.max(4, (clampedLevel / 100) * 10)}px` }}
            />
          </div>
        )}
      </div>
    );
  }

  const frameType = activeFrame.type;

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center shrink-0 select-none ${sizeClasses} ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
      style={{
        transform: speakingActive ? `scale(${dynamicScale})` : undefined,
        transition: 'transform 0.1s ease-out',
      }}
    >
      {/* 1. SPEAKING / ACTIVE AMBIENT GLOW & RIPPLE WAVES */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-200 pointer-events-none ${
          speakingActive ? 'animate-ping scale-110 opacity-75' : ''
        }`}
        style={{
          boxShadow: speakingActive
            ? `0 0 20px ${Math.max(4, Math.round((clampedLevel / 100) * 8))}px ${activeFrame.glowColor || '#10b981'}`
            : undefined,
        }}
      />

      {/* 2. INNER AVATAR IMAGE (Clean circular crop with zero black background) */}
      <div className={`relative rounded-full overflow-hidden z-0 ${innerSizeClasses} bg-transparent`}>
        <img
          src={imgUrl}
          alt={alt}
          className="w-full h-full rounded-full object-cover transform scale-105"
        />
      </div>

      {/* 2.2 LIVE AUDIO EQUALIZER BARS BADGE */}
      {speakingActive && (
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-emerald-400/80 px-1 py-0.5 rounded-full flex items-end gap-0.5 shadow-lg z-30 pointer-events-none">
          <span
            className="w-0.5 bg-emerald-400 rounded-full transition-all duration-100"
            style={{ height: `${Math.max(4, (clampedLevel / 100) * 12)}px` }}
          />
          <span
            className="w-0.5 bg-amber-400 rounded-full transition-all duration-100"
            style={{ height: `${Math.max(6, (clampedLevel / 100) * 14)}px` }}
          />
          <span
            className="w-0.5 bg-emerald-400 rounded-full transition-all duration-100"
            style={{ height: `${Math.max(4, (clampedLevel / 100) * 10)}px` }}
          />
        </div>
      )}

      {/* 2.5 TRANSPARENT PNG FRAME OVERLAY WITH CSS SCALING */}
      {activeFrame.frameImgUrl && (
        <img
          src={activeFrame.frameImgUrl}
          alt={activeFrame.name}
          className="absolute inset-[-22%] w-[144%] h-[144%] max-w-none pointer-events-none z-20 object-contain select-none"
        />
      )}

      {/* 3. FRAME OVERLAY LAYERS (Transparent overlays, wings, crowns, gems - Only for SVG-based frames) */}
      {!activeFrame.frameImgUrl && (
        <>
          {/* FRAME NEW 0: GOLDEN DRAGON HEAD (إطار رأس التنين الذهبي الياقوتي الأسطوري) */}
          {frameType === 'golden_dragon_head' && (
        <>
          <div className={`absolute ${crownSize} left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_0_12px_rgba(245,158,11,1)]`}>
            <span className="text-base animate-pulse">🐲</span>
          </div>
          <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-[45%] h-[85%] z-10 pointer-events-none drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]">
            <svg viewBox="0 0 40 80">
              <path d="M35 40 C 15 10 0 25 0 40 C 0 55 15 70 35 40 Z" fill="#f59e0b" stroke="#dc2626" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-[45%] h-[85%] z-10 pointer-events-none transform scale-x-[-1] drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]">
            <svg viewBox="0 0 40 80">
              <path d="M35 40 C 15 10 0 25 0 40 C 0 55 15 70 35 40 Z" fill="#f59e0b" stroke="#dc2626" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_0_10px_rgba(220,38,38,1)]">
            <span className="text-xs animate-bounce">💎</span>
          </div>
          <div className="absolute inset-0 rounded-full border-[3px] border-amber-400 z-10 pointer-events-none shadow-[0_0_14px_rgba(245,158,11,0.95)]" />
        </>
      )}

      {/* FRAME 1: PURPLE EMPEROR WINGS (إطار الأجنحة البنفسجية الأسطورية) */}
      {frameType === 'purple_emperor' && (
        <>
          {/* Top Winged Imperial Gold Crown */}
          <div className={`absolute ${crownSize} left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_0_10px_rgba(234,179,8,1)] animate-bounce`}>
            <svg viewBox="0 0 100 80" className="w-full h-full">
              {/* Gold winged crown */}
              <path
                d="M10 50 Q25 20 50 10 Q75 20 90 50 Q75 40 50 45 Q25 40 10 50 Z"
                fill="url(#imperial-gold-grad)"
              />
              <circle cx="50" cy="18" r="6" fill="#ec4899" className="animate-pulse" />
              <circle cx="28" cy="30" r="4" fill="#a855f7" />
              <circle cx="72" cy="30" r="4" fill="#a855f7" />
              {/* Crown Wing Flourishes */}
              <path d="M5 45 C -10 25 15 10 30 25 Z" fill="#c084fc" />
              <path d="M95 45 C 110 25 85 10 70 25 Z" fill="#c084fc" />
              <defs>
                <linearGradient id="imperial-gold-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#854d0e" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Left Purple & Gold Wing */}
          <div className={`absolute -left-2 top-1/2 -translate-y-1/2 ${wingWidth} z-10 pointer-events-none drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]`}>
            <svg viewBox="0 0 50 100" className="w-full h-full">
              <path
                d="M45 50 C 20 10 5 25 0 45 C 0 70 25 85 45 60 C 35 75 15 65 20 50 Z"
                fill="url(#purple-wing-grad)"
              />
              <path d="M45 40 C 25 15 15 30 10 45 C 15 50 30 55 45 45 Z" fill="#fef08a" />
              <defs>
                <linearGradient id="purple-wing-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e9d5ff" />
                  <stop offset="40%" stopColor="#c084fc" />
                  <stop offset="80%" stopColor="#7e22ce" />
                  <stop offset="100%" stopColor="#3b0764" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Right Purple & Gold Wing */}
          <div className={`absolute -right-2 top-1/2 -translate-y-1/2 ${wingWidth} z-10 pointer-events-none transform scale-x-[-1] drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]`}>
            <svg viewBox="0 0 50 100" className="w-full h-full">
              <path
                d="M45 50 C 20 10 5 25 0 45 C 0 70 25 85 45 60 C 35 75 15 65 20 50 Z"
                fill="url(#purple-wing-grad)"
              />
              <path d="M45 40 C 25 15 15 30 10 45 C 15 50 30 55 45 45 Z" fill="#fef08a" />
            </svg>
          </div>

          {/* Bottom Lion/Dragon Beast Gold Crest */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[70%] h-[35%] z-20 pointer-events-none drop-shadow-[0_0_10px_rgba(234,179,8,1)]">
            <svg viewBox="0 0 100 50" className="w-full h-full">
              <path
                d="M10 40 L30 10 L50 35 L70 10 L90 40 L50 48 Z"
                fill="url(#imperial-gold-grad)"
              />
              <polygon points="50,15 42,32 58,32" fill="#ec4899" />
              <circle cx="35" cy="25" r="3" fill="#38bdf8" />
              <circle cx="65" cy="25" r="3" fill="#38bdf8" />
            </svg>
          </div>

          {/* Outer Glowing Ring */}
          <div className="absolute inset-0 rounded-full border-[2.5px] border-purple-500 z-10 pointer-events-none shadow-[0_0_12px_rgba(168,85,247,0.9)]" />
          <div className="absolute inset-[-1.5px] rounded-full border border-amber-300 z-10 pointer-events-none border-dashed animate-[spin_10s_linear_infinite]" />
        </>
      )}

      {/* FRAME 2: GOLDEN IMPERIAL (إطار الإمبراطور الذهبي) */}
      {frameType === 'imperial' && (
        <>
          <div className={`absolute ${crownSize} left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_2px_8px_rgba(245,158,11,0.9)]`}>
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-amber-400">
              <path
                d="M3 18L1 8L7 12L12 4L17 12L23 8L21 18H3Z"
                fill="url(#gold-grad-imp)"
                stroke="#fbbf24"
                strokeWidth="1.2"
              />
              <circle cx="12" cy="4" r="1.5" fill="#ef4444" />
              <circle cx="1" cy="8" r="1.2" fill="#38bdf8" />
              <circle cx="23" cy="8" r="1.2" fill="#38bdf8" />
              <defs>
                <linearGradient id="gold-grad-imp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="absolute inset-0 rounded-full border-[2.5px] border-amber-400 z-10 pointer-events-none shadow-[inset_0_0_8px_rgba(245,158,11,0.6)]" />
          <div className="absolute inset-0 rounded-full border border-amber-200/60 z-10 pointer-events-none scale-105 border-dashed animate-[spin_12s_linear_infinite]" />
        </>
      )}

      {/* FRAME 3: WINGS FLAME (أجنحة النار) */}
      {frameType === 'flame' && (
        <>
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-[38%] h-[75%] z-10 pointer-events-none drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]">
            <svg viewBox="0 0 24 24" fill="#ef4444">
              <path d="M22 12C22 12 14 2 4 4C2 10 8 16 12 18C16 16 18 14 22 12Z" fill="url(#flame-grad-1)" />
            </svg>
          </div>
          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-[38%] h-[75%] z-10 pointer-events-none transform scale-x-[-1] drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]">
            <svg viewBox="0 0 24 24" fill="#ef4444">
              <path d="M22 12C22 12 14 2 4 4C2 10 8 16 12 18C16 16 18 14 22 12Z" fill="url(#flame-grad-1)" />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-full border-[2.5px] border-rose-500 z-10 pointer-events-none shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
          <svg className="w-0 h-0 absolute pointer-events-none">
            <defs>
              <linearGradient id="flame-grad-1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
          </svg>
        </>
      )}

      {/* FRAME 4: PHOENIX BLAZE (العنقاء الملكية) */}
      {frameType === 'phoenix' && (
        <>
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-base z-20 drop-shadow-[0_0_8px_rgba(249,115,22,1)] animate-pulse">🔥</span>
          <div className="absolute inset-0 rounded-full border-[3px] border-orange-500 z-10 pointer-events-none shadow-[0_0_14px_rgba(249,115,22,0.9)]" />
          <div className="absolute inset-[-2px] rounded-full border border-amber-300 z-10 pointer-events-none border-dotted animate-[spin_6s_linear_infinite]" />
        </>
      )}

      {/* FRAME 5: GOLDEN DRAGON (التنين الذهبي) */}
      {frameType === 'dragon' && (
        <>
          <div className={`absolute ${crownSize} left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_0_8px_rgba(234,179,8,1)]`}>
            <span className="text-sm">🐉</span>
          </div>
          <div className="absolute inset-0 rounded-full border-[3px] border-amber-400 z-10 pointer-events-none shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
          <div className="absolute inset-[-2px] rounded-full border border-amber-300 z-10 pointer-events-none border-dotted animate-[spin_8s_linear_infinite]" />
        </>
      )}

      {/* FRAME 6: ROYAL CROWN (التاج الياقوتي) */}
      {frameType === 'crown' && (
        <>
          <div className={`absolute ${crownSize} left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]`}>
            <span className="text-sm">👑</span>
          </div>
          <div className="absolute inset-0 rounded-full border-[2.5px] border-purple-500 z-10 pointer-events-none shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
          <div className="absolute inset-[-1px] rounded-full border border-pink-400/80 z-10 pointer-events-none" />
        </>
      )}

      {/* FRAME 7: VALKYRIE WINGS (الفالكيري السماوية) */}
      {frameType === 'valkyrie' && (
        <>
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-[40%] h-[80%] z-10 pointer-events-none drop-shadow-[0_0_8px_rgba(14,165,233,0.9)]">
            <svg viewBox="0 0 30 60" fill="#0ea5e9">
              <path d="M30 30 C 10 0 0 20 0 30 C 0 40 10 60 30 30 Z" fill="#78716c" />
              <path d="M30 20 C 15 5 5 15 5 25 Z" fill="#38bdf8" />
            </svg>
          </div>
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-[40%] h-[80%] z-10 pointer-events-none transform scale-x-[-1] drop-shadow-[0_0_8px_rgba(14,165,233,0.9)]">
            <svg viewBox="0 0 30 60" fill="#0ea5e9">
              <path d="M30 30 C 10 0 0 20 0 30 C 0 40 10 60 30 30 Z" fill="#78716c" />
              <path d="M30 20 C 15 5 5 15 5 25 Z" fill="#38bdf8" />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-full border-[2.5px] border-sky-400 z-10 pointer-events-none shadow-[0_0_12px_rgba(14,165,233,0.9)]" />
        </>
      )}

      {/* FRAME 8: DEMON LORD (قرون أمير الظلام) */}
      {frameType === 'demon' && (
        <>
          <span className="absolute -top-3 left-1 z-20 text-xs">😈</span>
          <span className="absolute -top-3 right-1 z-20 text-xs transform scale-x-[-1]">😈</span>
          <div className="absolute inset-0 rounded-full border-[2.5px] border-fuchsia-600 z-10 pointer-events-none shadow-[0_0_12px_rgba(217,70,239,0.9)]" />
        </>
      )}

      {/* FRAME 9: FROST QUEEN (ملكة الجليد) */}
      {frameType === 'frost' && (
        <>
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 text-xs">❄️</span>
          <div className="absolute inset-0 rounded-full border-[2.5px] border-sky-300 z-10 pointer-events-none shadow-[0_0_12px_rgba(56,189,248,0.9)]" />
          <div className="absolute inset-[-2px] rounded-full border border-white z-10 pointer-events-none animate-pulse" />
        </>
      )}

      {/* FRAME 10: CELESTIAL ANGEL (ملاك الفردوس) */}
      {frameType === 'celestial' && (
        <>
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 text-xs animate-bounce">👼</span>
          <div className="absolute inset-0 rounded-full border-[2.5px] border-amber-300 z-10 pointer-events-none shadow-[0_0_12px_rgba(253,224,71,0.9)]" />
          <div className="absolute inset-[-2px] rounded-full border border-white z-10 pointer-events-none" />
        </>
      )}

      {/* FRAME 11: CYBER NEON (طوق السايبر) */}
      {frameType === 'neon' && (
        <>
          <div className="absolute inset-0 rounded-full border-[2.5px] border-cyan-400 z-10 pointer-events-none shadow-[0_0_12px_rgba(6,182,212,0.9)]" />
          <div className="absolute inset-[-2px] rounded-full border border-fuchsia-500 z-10 pointer-events-none animate-pulse" />
        </>
      )}

      {/* FRAME 12: GUNDAM MECHA (المحارب الميكانيكي) */}
      {frameType === 'gundam' && (
        <>
          <div className="absolute inset-0 rounded-full border-[3px] border-blue-500 z-10 pointer-events-none shadow-[0_0_10px_rgba(59,130,246,0.9)]" />
          <div className="absolute top-0 left-0 w-2 h-2 bg-blue-300 rounded-full z-20 animate-ping" />
        </>
      )}

      {/* FRAME 13: GALAXY NEBULA (مجرة السديم) */}
      {frameType === 'galaxy' && (
        <>
          <div className="absolute inset-0 rounded-full border-[2.5px] border-purple-600 z-10 pointer-events-none shadow-[0_0_12px_rgba(147,51,234,0.9)]" />
          <div className="absolute inset-[-2px] rounded-full border border-indigo-400 z-10 pointer-events-none border-dashed animate-[spin_10s_linear_infinite]" />
          <span className="absolute -top-1 -right-1 z-20 text-[10px]">✨</span>
        </>
      )}

      {/* FRAME 14: DIAMOND STAR (النجمة الماسية) */}
      {frameType === 'diamond' && (
        <>
          <div className={`absolute ${crownSize} left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_0_8px_rgba(56,189,248,1)]`}>
            <span className="text-sm">💎</span>
          </div>
          <div className="absolute inset-0 rounded-full border-[2.5px] border-sky-300 z-10 pointer-events-none shadow-[0_0_12px_rgba(56,189,248,0.9)]" />
        </>
      )}

      {/* FRAME 15: BLOOD RUBY (ياقوتة الدم) */}
      {frameType === 'ruby' && (
        <>
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 text-xs">❤️</span>
          <div className="absolute inset-0 rounded-full border-[2.5px] border-rose-600 z-10 pointer-events-none shadow-[0_0_12px_rgba(225,29,72,0.9)]" />
        </>
      )}

      {/* FRAME 16: GOLDEN SULTAN (السلطان الذهبي) */}
      {frameType === 'sultan' && (
        <>
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 text-xs">🕌</span>
          <div className="absolute inset-0 rounded-full border-[3px] border-yellow-600 z-10 pointer-events-none shadow-[0_0_12px_rgba(202,138,4,0.9)]" />
        </>
      )}

      {/* FRAME 17: COSMIC VORTEX (الدوامة الكونية) */}
      {frameType === 'vortex' && (
        <>
          <div className="absolute inset-0 rounded-full border-[3px] border-violet-600 z-10 pointer-events-none shadow-[0_0_14px_rgba(124,58,237,0.9)]" />
          <div className="absolute inset-[-3px] rounded-full border border-purple-400 z-10 pointer-events-none border-dashed animate-[spin_4s_linear_infinite]" />
        </>
      )}

      {/* FRAME 18: SAKURA BLOSSOM (زهور الساكورا) */}
      {frameType === 'sakura' && (
        <>
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 text-xs">🌸</span>
          <div className="absolute inset-0 rounded-full border-[2.5px] border-pink-400 z-10 pointer-events-none shadow-[0_0_10px_rgba(244,114,182,0.8)]" />
        </>
      )}

      {/* FRAME 19: EMERALD KING (زمرد الملوك) */}
      {frameType === 'emerald' && (
        <>
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 text-xs">💚</span>
          <div className="absolute inset-0 rounded-full border-[2.5px] border-emerald-400 z-10 pointer-events-none shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
        </>
      )}

      {/* FRAME 20: HEART NEON (القلوب الوردي) */}
      {frameType === 'heart' && (
        <>
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 text-xs animate-bounce">💕</span>
          <div className="absolute inset-0 rounded-full border-[2.5px] border-rose-400 z-10 pointer-events-none shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
        </>
      )}
        </>
      )}
    </div>
  );
};
