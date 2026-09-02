import React from 'react';
import { Crown, Trophy, Coins, Plus, Mic, Flame, Gamepad2, Sparkles, Gift } from 'lucide-react';
import { UserProfile } from '../types';
import { useI18n } from '../lib/i18n';

interface QuickCategoriesProps {
  user?: UserProfile;
  onOpenVip: () => void;
  onOpenLeaderboard: () => void;
  onOpenGifts: () => void;
  onOpenAgencies: () => void;
  onOpenEvents: () => void;
  onOpenGames: () => void;
  onOpenMoments?: () => void;
  onOpenSpecialIdStore?: () => void;
}

export const QuickCategories: React.FC<QuickCategoriesProps> = ({
  user,
  onOpenVip,
  onOpenLeaderboard,
  onOpenGifts,
  onOpenAgencies,
  onOpenEvents,
  onOpenGames,
  onOpenMoments,
  onOpenSpecialIdStore,
}) => {
  const { t } = useI18n();

  const CATEGORIES = [
    {
      id: 'moments',
      label: `${t('navMoments')} 📸`,
      icon: Sparkles,
      color: 'from-fuchsia-600 via-purple-600 to-indigo-700',
      shadow: 'shadow-fuchsia-500/20',
      badge: 'جديد 🌟',
      badgeBg: 'bg-fuchsia-600 text-white',
      action: onOpenMoments || onOpenEvents,
    },
    {
      id: 'games',
      label: `${t('gamesRoom')} 🎮`,
      icon: Gamepad2,
      color: 'from-purple-600 via-indigo-600 to-purple-800',
      shadow: 'shadow-purple-500/25',
      badge: 'HOT 🔥',
      badgeBg: 'bg-rose-600 text-white',
      action: onOpenGames,
    },
    {
      id: 'special_id',
      label: `${t('specialIdStore')} 👑`,
      icon: Crown,
      color: 'from-amber-500 via-yellow-500 to-amber-600',
      shadow: 'shadow-amber-500/20',
      badge: 'VIP ID 💎',
      badgeBg: 'bg-amber-400 text-slate-950 font-black',
      action: onOpenSpecialIdStore || onOpenVip,
    },
    {
      id: 'ranking',
      label: `${t('leaderboard')} 🏆`,
      icon: Trophy,
      color: 'from-yellow-500 via-amber-500 to-amber-600',
      shadow: 'shadow-yellow-500/20',
      badge: 'TOP 3 👑',
      badgeBg: 'bg-amber-400 text-slate-950 font-black',
      action: onOpenLeaderboard,
    },
    {
      id: 'gifts',
      label: `${t('giftsStore')} 🪙`,
      icon: Coins,
      color: 'from-rose-500 via-pink-600 to-rose-700',
      shadow: 'shadow-rose-500/20',
      badge: '+100% 🎁',
      badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black',
      action: onOpenGifts,
    },
    {
      id: 'vip',
      label: `${t('vipClub')} 👑`,
      icon: Crown,
      color: 'from-amber-500 via-orange-500 to-yellow-600',
      shadow: 'shadow-amber-500/20',
      badge: 'VIP',
      badgeBg: 'bg-slate-950 text-amber-300 border border-amber-500/40 font-black',
      action: onOpenVip,
    },
  ];

  return (
    <div id="saleem-quick-categories" className="my-2.5 select-none">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={cat.action}
            className={`group relative flex flex-col items-center justify-between p-2.5 rounded-2xl bg-[#140c2e]/70 hover:bg-[#1f1345]/90 border border-purple-500/15 hover:border-amber-400/60 backdrop-blur-md transition-all duration-300 shadow-lg ${cat.shadow} hover:-translate-y-1 active:translate-y-0 cursor-pointer`}
          >
            {/* Top Mini Badge */}
            {cat.badge && (
              <span className={`absolute -top-1.5 start-1.5 text-[8.5px] font-black px-1.5 py-0.2 rounded-full shadow-md z-10 ${cat.badgeBg}`}>
                {cat.badge}
              </span>
            )}

            {/* Icon Bubble */}
            <div
              className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white mb-1.5 shadow-lg group-hover:scale-110 transition-transform`}
            >
              <cat.icon className="w-5 h-5" />
            </div>

            {/* Label */}
            <span className="text-[11px] font-black text-slate-200 group-hover:text-amber-300 transition-colors tracking-tight truncate w-full text-center">
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
