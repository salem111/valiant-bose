import React, { useState } from 'react';
import { ChevronLeft, HelpCircle, Sparkles, Crown } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface HotNewsModalProps {
  onClose: () => void;
}

const TABS = ['Gift', 'VIP', 'Charm', 'Couples', 'Updates'];

export const HotNewsModal: React.FC<HotNewsModalProps> = ({ onClose }) => {
  const { t, dir } = useI18n();
  const [activeTab, setActiveTab] = useState('Charm');

  // Placeholders
  const newsItems = [1, 2, 3, 4, 5];

  return (
    <div dir={dir} className="fixed inset-0 z-50 bg-[#030108] flex flex-col font-sans overflow-hidden animate-scaleUp">
      {/* Dark Purple Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-[#1e0a3c] to-fuchsia-950 opacity-80" />
      
      {/* Header */}
      <div className="relative z-10 px-4 pt-safe pb-4 flex justify-between items-center text-white">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full backdrop-blur-md border border-white/20">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Hot news</h1>
        <button className="p-2 bg-white/10 rounded-full backdrop-blur-md border border-white/20">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="relative z-10 px-4 flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-sm transition-all duration-300 whitespace-nowrap ${
              activeTab === tab ? 'luxury-tab-active' : 'luxury-tab-inactive'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar pb-24 px-4 space-y-4">
        {newsItems.map((item) => (
          <div key={item} className="hot-news-card rounded-2xl p-4 flex flex-col gap-2">
            
            {/* Top Label */}
            <div className="flex justify-between items-center">
              <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20">
                <span className="text-[10px] text-fuchsia-200 font-bold uppercase tracking-wider">{activeTab}</span>
              </div>
              <button className="text-[10px] text-fuchsia-300/80 hover:text-fuchsia-200 flex items-center gap-1">
                About {activeTab} level <ChevronLeft className="w-3 h-3 rotate-180" />
              </button>
            </div>

            {/* Content */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                {/* Avatar Placeholder */}
                <div className="w-12 h-12 rounded-full bg-white/20 ring-2 ring-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,0.5)] flex items-center justify-center">
                   <Sparkles className="w-5 h-5 text-white/50" />
                </div>
                
                <div>
                  <div className="w-24 h-3 bg-white/30 rounded mb-2" /> {/* Name Placeholder */}
                  <span className="text-xs text-white font-medium">Upgrade charm level {50 + item}</span>
                </div>
              </div>

              {/* Big Icon Right */}
              <div className="flex flex-col items-center">
                <Crown className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)] mb-1" />
                <span className="text-[10px] font-black text-yellow-300 bg-yellow-900/50 px-2 rounded-full border border-yellow-500/50">
                  Lv{50 + item}
                </span>
              </div>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};
