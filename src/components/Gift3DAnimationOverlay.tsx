import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveGiftAnimation } from '../types';
import { Crown, Sparkles, Flame } from 'lucide-react';

interface Gift3DAnimationOverlayProps {
  animation: ActiveGiftAnimation | null;
  onComplete: () => void;
}

export const Gift3DAnimationOverlay: React.FC<Gift3DAnimationOverlayProps> = ({ animation, onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<'intro' | 'show' | 'outro'>('intro');
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to accurately identify real video streams/files
  const isVideoFile = (url?: string | null): boolean => {
    if (!url || typeof url !== 'string') return false;
    const clean = url.toLowerCase().split('?')[0].trim();
    return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.ogg');
  };

  const candidateUrl =
    animation?.gift.videoUrl ||
    animation?.gift.animationUrl ||
    animation?.gift.animation ||
    (animation?.gift.id.includes('dragon') || animation?.gift.name.includes('تنين')
      ? '/assets/gifts/animations/dragon.mp4'
      : null);

  const hasVideo = Boolean(candidateUrl && isVideoFile(candidateUrl));
  const videoSrc = hasVideo ? candidateUrl : null;

  const handleFinish = () => {
    setPhase('outro');
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  useEffect(() => {
    if (!animation) {
      setPhase('intro');
      return;
    }

    setPhase('intro');
    const introTimer = setTimeout(() => {
      setPhase('show');
    }, 150);

    // Play ONLY the gift video's natural audio track
    if (hasVideo && videoRef.current) {
      videoRef.current.volume = 1.0;
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }

    // Precise Timing Strategy:
    // 1) Small / Regular / Animated non-video gifts: exactly 1.7 seconds with smooth outro fade
    // 2) Video Gifts: Plays the video completely in full until onEnded event fires!
    if (!hasVideo) {
      const smallGiftDuration = 1700; // 1.7s total
      const outroTimer = setTimeout(() => {
        setPhase('outro');
      }, 1300);

      const finishTimer = setTimeout(() => {
        onComplete();
      }, smallGiftDuration);

      return () => {
        clearTimeout(introTimer);
        clearTimeout(outroTimer);
        clearTimeout(finishTimer);
      };
    } else {
      // Safe maximum fallback for video gifts in case onEnded fails
      fallbackTimerRef.current = setTimeout(() => {
        handleFinish();
      }, 15000);

      return () => {
        clearTimeout(introTimer);
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current);
        }
      };
    }
  }, [animation, hasVideo, onComplete]);

  if (!animation) return null;

  const { senderName, recipientName, gift, amount } = animation;
  const totalValue = (gift.priceDiamonds || gift.priceCoins || 100) * amount;
  const isSvipOrLegendary = gift.category === 'svip' || totalValue >= 5000 || hasVideo;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] pointer-events-none flex flex-col items-center justify-between overflow-hidden dir-rtl select-none">
        
        {/* 1. Seamless Cinematic Ambient Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'outro' ? 0 : isSvipOrLegendary ? 0.7 : 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0 bg-gradient-to-b from-black/85 via-slate-950/60 to-black/90 pointer-events-none"
        />

        {/* 2. Soft Ambient Radiant Glow Aura (No rigid borders or boxes) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
          <div
            className="w-[85vw] max-w-xl h-[45vh] rounded-full bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-cyan-500/20 blur-3xl animate-pulse pointer-events-none"
            style={{ animationDuration: '3s' }}
          />
        </div>

        {/* 3. Floating Sparkle Particles (مطر الذهب والنجوم المتناثرة) */}
        <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden">
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.span
              key={i}
              initial={{
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 80 + 10}%`,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                scale: [0, 1.25, 0],
                opacity: [0, 1, 0],
                y: [0, -35 - Math.random() * 45],
              }}
              transition={{
                duration: 1.8 + Math.random() * 1.2,
                repeat: Infinity,
                delay: i * 0.12,
                ease: 'easeInOut',
              }}
              className="absolute text-lg sm:text-2xl filter drop-shadow-[0_0_12px_rgba(245,158,11,0.85)]"
            >
              {i % 4 === 0 ? '✨' : i % 4 === 1 ? '💎' : i % 4 === 2 ? '🪙' : '⭐'}
            </motion.span>
          ))}
        </div>

        {/* 👑 4. TOP GLOBAL ROYAL BROADCAST BANNER (شريط الإعلان الملكي الفاخر أعلى الشاشة) */}
        <div className="relative z-40 w-full flex justify-center pt-5 sm:pt-7 px-3">
          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: phase === 'outro' ? 0 : 1, scale: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ type: 'spring', damping: 16, stiffness: 220 }}
            className="w-full max-w-lg bg-slate-950/90 border border-amber-400/60 rounded-2xl sm:rounded-full px-4 py-2 shadow-[0_0_30px_rgba(245,158,11,0.45)] backdrop-blur-xl flex items-center justify-between gap-2.5 text-white"
          >
            {/* Crown Icon & Label */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-600 p-0.5 shadow-md flex items-center justify-center">
                <Crown className="w-4 h-4 text-slate-950 fill-slate-950 animate-bounce" />
              </div>
              <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 rounded-full">
                إعلان ملكي 👑
              </span>
            </div>

            {/* Main Broadcast Message */}
            <div className="flex-1 text-center min-w-0">
              <p className="text-xs sm:text-sm font-black truncate leading-tight">
                <span className="text-amber-300 drop-shadow">{senderName}</span>
                <span className="text-slate-300 font-normal text-[11px] mx-1">أهدى</span>
                <span className="text-amber-400 font-black">{gift.name}</span>
                <span className="text-slate-300 font-normal text-[11px] mx-1">إلى</span>
                <span className="text-cyan-300 drop-shadow">{recipientName}</span>
              </p>
            </div>

            {/* Total Diamonds Value */}
            <div className="shrink-0 flex items-center gap-1 bg-amber-500/20 border border-amber-400/50 px-2.5 py-1 rounded-full text-[11px] font-mono font-black text-amber-300 shadow-inner">
              <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
              <span>{totalValue.toLocaleString()} 💎</span>
            </div>
          </motion.div>
        </div>

        {/* 🎬 5. CENTER GIFT PRESENTATION (عرض الفيديو عريضاً على طول المقاعد بدون مربعات أو حواف جامدة) */}
        <div className="relative z-30 flex-1 flex flex-col items-center justify-center w-full px-2 my-auto">
          
          {/* Flame Combo Multiplier Counter */}
          {amount > 1 && (
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: [1, 1.25, 1], rotate: 0 }}
              transition={{ duration: 0.35, type: 'spring' }}
              className="mb-3 flex items-center gap-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white font-black text-sm sm:text-lg px-4 py-1 rounded-full border border-amber-300/80 shadow-[0_0_25px_rgba(239,68,68,0.8)] animate-pulse"
            >
              <Flame className="w-4 h-4 text-amber-200 fill-amber-200" />
              <span>COMBO x{amount} 🔥</span>
            </motion.div>
          )}

          {/* 🎰 Lucky Reward Win Announcement Banner */}
          {animation.luckyReward && animation.luckyReward.multiplier > 0 && (
            <motion.div
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: [0.8, 1.15, 1], y: 0 }}
              transition={{ duration: 0.45, type: 'spring', damping: 10 }}
              className={`mb-3 flex flex-col items-center px-4 py-1.5 rounded-2xl border shadow-2xl backdrop-blur-md ${
                animation.luckyReward.isJackpot
                  ? 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 border-yellow-100 text-slate-950 shadow-[0_0_40px_rgba(250,204,21,0.9)] animate-bounce'
                  : animation.luckyReward.isBigWin
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 border-amber-300 text-white shadow-[0_0_30px_rgba(244,63,94,0.8)] animate-pulse'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-700 border-emerald-300 text-white shadow-[0_0_20px_rgba(16,185,129,0.7)]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
                <span className="text-lg">🎰</span>
                <span>{animation.luckyReward.isJackpot ? 'MEGA JACKPOT 🎰' : animation.luckyReward.isBigWin ? 'BIG WIN 🔥' : 'LUCKY WIN 🎉'}</span>
                <span className="font-mono text-sm sm:text-base">x{animation.luckyReward.multiplier}</span>
              </div>
              <div className="text-[11px] sm:text-xs font-black font-mono mt-0.5">
                +{animation.luckyReward.wonCoins.toLocaleString()} عملة ذهبية 🪙
              </div>
            </motion.div>
          )}

          {hasVideo ? (
            /* 🎥 Video Gift Full-Width Presentation (كبير على طول المقاعد وبحواف ضبابية ناعمة ومنسابة بدون أي حواف حادة) */
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: phase === 'outro' ? 0.95 : 1, opacity: phase === 'outro' ? 0 : 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, type: 'spring', damping: 20 }}
              className="relative w-full max-w-3xl sm:max-w-4xl h-[62vh] sm:h-[74vh] flex items-center justify-center pointer-events-none"
            >
              {/* Soft Multi-Layer Misty Aura Behind Video */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-cyan-500/20 rounded-full blur-[60px] pointer-events-none scale-110 animate-pulse" />
              <div className="absolute inset-4 bg-gradient-to-br from-white/10 via-amber-400/10 to-transparent rounded-full blur-[40px] pointer-events-none" />

              {/* Clean Video Element with Ultra-Soft Misty Feathered Organic Edges */}
              <div
                className="relative w-full h-full flex items-center justify-center overflow-visible"
                style={{
                  WebkitMaskImage:
                    'radial-gradient(ellipse 84% 84% at 50% 50%, #000 48%, rgba(0,0,0,0.85) 64%, rgba(0,0,0,0.45) 78%, rgba(0,0,0,0.12) 90%, transparent 100%)',
                  maskImage:
                    'radial-gradient(ellipse 84% 84% at 50% 50%, #000 48%, rgba(0,0,0,0.85) 64%, rgba(0,0,0,0.45) 78%, rgba(0,0,0,0.12) 90%, transparent 100%)',
                }}
              >
                <video
                  ref={videoRef}
                  src={videoSrc || ''}
                  autoPlay
                  playsInline
                  onLoadedMetadata={() => {
                    if (videoRef.current && videoRef.current.duration && !isNaN(videoRef.current.duration)) {
                      const durMs = Math.max(videoRef.current.duration * 1000 + 400, 3000);
                      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
                      fallbackTimerRef.current = setTimeout(() => {
                        handleFinish();
                      }, durMs);
                    }
                  }}
                  onEnded={() => {
                    handleFinish();
                  }}
                  className="w-full h-full object-contain filter drop-shadow-[0_20px_60px_rgba(0,0,0,0.95)] relative z-20 pointer-events-none"
                />
              </div>

              {/* Soft Perimeter Ambient Mist Vignette */}
              <div
                className="absolute inset-0 pointer-events-none z-30"
                style={{
                  background:
                    'radial-gradient(ellipse 86% 86% at 50% 50%, transparent 58%, rgba(15, 23, 42, 0.35) 80%, rgba(15, 23, 42, 0.95) 100%)',
                }}
              />
            </motion.div>
          ) : (
            /* 🎁 Snappy Pop-Up Animation for Small/Regular Gifts (سريعة وجميلة ثانية ونصف) */
            <motion.div
              initial={{ scale: 0.1, y: 40, opacity: 0 }}
              animate={{
                scale: phase === 'outro' ? 0.8 : [0.2, 1.3, 1.1],
                y: phase === 'outro' ? -40 : [40, -15, 0],
                opacity: phase === 'outro' ? 0 : 1,
              }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.5, type: 'spring', damping: 12 }}
              className="relative flex flex-col items-center justify-center my-auto"
            >
              {/* Radial Glow Halo */}
              <div className="absolute -inset-8 rounded-full bg-gradient-to-tr from-amber-500/25 via-rose-500/25 to-purple-500/25 blur-2xl animate-pulse" />

              {gift.icon?.startsWith('/') || gift.icon?.startsWith('http') ? (
                <img
                  src={gift.icon}
                  alt={gift.name}
                  className="w-40 h-40 sm:w-56 sm:h-56 object-contain filter drop-shadow-[0_0_40px_rgba(245,158,11,0.9)] relative z-10 animate-bounce"
                />
              ) : (
                <span className="text-8xl sm:text-[120px] filter drop-shadow-[0_0_40px_rgba(245,158,11,0.9)] relative z-10 animate-bounce">
                  {gift.icon || '🌹'}
                </span>
              )}

              {/* Gift Title Badge Under Icon */}
              <div className="mt-2.5 bg-slate-950/90 border border-amber-400/70 px-4 py-1 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                <span className="text-xs sm:text-sm font-black text-amber-300">{gift.name}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* 📜 6. REFINED BOTTOM INFO PILL (شريط معلومات الهدية الأنيق في الأسفل) */}
        <div className="relative z-40 w-full flex justify-center pb-6 sm:pb-8 px-4 mt-auto">
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: phase === 'outro' ? 0 : 1, scale: 1 }}
            exit={{ y: 25, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-md w-full bg-slate-950/85 border border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-2xl backdrop-blur-xl flex items-center justify-between text-center gap-3 text-white"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500/20 to-purple-600/20 border border-amber-400/50 flex items-center justify-center shrink-0 shadow-inner">
              {gift.icon?.startsWith('/') || gift.icon?.startsWith('http') ? (
                <img src={gift.icon} alt={gift.name} className="w-8 h-8 object-contain" />
              ) : (
                <span className="text-xl">{gift.icon || '🎁'}</span>
              )}
            </div>

            <div className="flex-1 text-right">
              <p className="text-xs sm:text-sm font-black text-white leading-relaxed">
                أرسل <span className="text-amber-300 font-extrabold">{senderName}</span> هدية <span className="text-amber-400 font-black">{gift.name}</span> إلى <span className="text-cyan-300 font-extrabold">{recipientName}</span>
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-purple-200 font-bold bg-purple-950/80 border border-purple-500/40 px-2 py-0.2 rounded-md">
                  العدد: x{amount}
                </span>
                <span className="text-[11px] text-amber-300 font-mono font-black">
                  💎 {totalValue.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </AnimatePresence>
  );
};
