import React, { useState } from 'react';
import { ChevronLeft, HelpCircle, Shield, Crown, Flame, Gem, Star, Zap } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface LuxuryTiersModalProps {
  onClose: () => void;
}

const TIERS = [
  { id: 'billionaire', title: 'Billionaire', subtitle: 'Recharged Coins', icon: <Crown className="w-8 h-8 text-yellow-300" />, color: 'gold' },
  { id: 'powerful', title: 'Most powerful', subtitle: 'Gift & flowers sent', icon: <Flame className="w-8 h-8 text-red-400" />, color: 'ruby' },
  { id: 'power_tier', title: 'Power Tier', subtitle: 'Personal Leaderboard', icon: <Zap className="w-8 h-8 text-blue-300" />, color: 'sapphire' },
  { id: 'popular', title: 'Most Popular', subtitle: 'Gift & flowers received', icon: <Star className="w-8 h-8 text-fuchsia-300" />, color: 'amethyst' },
  { id: 'room_gifts', title: 'Room gifts', subtitle: 'Gifts & flowers sent in room', icon: <Gem className="w-8 h-8 text-emerald-300" />, color: 'emerald' },
  { id: 'room_tier', title: 'Room Tier', subtitle: 'Room Tier points', icon: <Shield className="w-8 h-8 text-orange-300" />, color: 'bronze' },
];

export const LuxuryTiersModal: React.FC<LuxuryTiersModalProps> = ({ onClose }) => {
  const { t, dir } = useI18n();

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'gold': return 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)] bg-gradient-to-b from-amber-600/40 to-amber-900/40';
      case 'ruby': return 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)] bg-gradient-to-b from-rose-600/40 to-rose-900/40';
      case 'sapphire': return 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] bg-gradient-to-b from-blue-600/40 to-blue-900/40';
      case 'amethyst': return 'border-fuchsia-500 shadow-[0_0_30px_rgba(217,70,239,0.3)] bg-gradient-to-b from-fuchsia-600/40 to-fuchsia-900/40';
      case 'emerald': return 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] bg-gradient-to-b from-emerald-600/40 to-emerald-900/40';
      case 'bronze': return 'border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)] bg-gradient-to-b from-orange-600/40 to-orange-900/40';
      default: return 'border-slate-500';
    }
  };

  return (
    <div dir={dir} className="fixed inset-0 z-50 bg-[#030108] flex flex-col font-sans overflow-hidden animate-scaleUp">
      {/* Dark Royal Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-[#030108] to-purple-950 opacity-80" />
      
      {/* Header */}
      <div className="relative z-10 px-4 pt-safe pb-4 flex justify-between items-center text-white">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full backdrop-blur-md border border-white/20">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Badges & Tiers</h1>
        <button className="p-2 bg-white/10 rounded-full backdrop-blur-md border border-white/20">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar pb-24 px-4">
        <div className="grid grid-cols-2 gap-4">
          {TIERS.map((tier) => (
            <div key={tier.id} className="flex flex-col items-center">
              {/* Shield/Badge Container */}
              <div className={`w-full aspect-[4/5] rounded-[2rem] border-2 backdrop-blur-md flex flex-col items-center justify-center p-2 mb-3 relative overflow-hidden ${getColorClasses(tier.color)}`}>
                {/* Glow effect */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 blur-xl rounded-full" />
                
                {/* Crown Icon Placeholder */}
                <div className="mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                  {tier.icon}
                </div>

                {/* 3 Avatar Placeholders in triangle formation */}
                <div className="flex justify-center -mb-2 z-10">
                  <div className="w-8 h-8 rounded-full bg-white/20 ring-2 ring-white/50 z-20" />
                </div>
                <div className="flex justify-center gap-2 z-0">
                  <div className="w-8 h-8 rounded-full bg-white/10 ring-1 ring-white/30" />
                  <div className="w-8 h-8 rounded-full bg-white/10 ring-1 ring-white/30" />
                </div>
                
                {/* Gold Ribbon Label */}
                <div className="mt-4 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 px-4 py-1.5 rounded-full border border-yellow-200 shadow-lg w-[90%] flex justify-center">
                  <span className="text-[10px] font-black text-amber-950 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                    {tier.title}
                  </span>
                </div>
              </div>
              
              <span className="text-[10px] text-white/50 font-medium text-center">{tier.subtitle}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
