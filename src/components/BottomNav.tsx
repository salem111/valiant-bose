import React from 'react';
import { MainTab } from '../types';
import { Home, MessageSquare, Sparkles, User, Radio, Plus, Mic } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface BottomNavProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  hasActiveRoom?: boolean;
  onCenterAction: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  hasActiveRoom = false,
  onCenterAction,
}) => {
  const { t } = useI18n();

  const NAV_ITEMS = [
    { id: 'home', labelKey: 'navHome', icon: Home, isCentral: false },
    { id: 'moments', labelKey: 'navMoments', icon: Sparkles, isCentral: false },
    { id: 'center_action', labelKey: hasActiveRoom ? 'غرفتي' : 'إنشاء غرفة', icon: hasActiveRoom ? Radio : Plus, isCentral: true },
    { id: 'chats', labelKey: 'navChats', icon: MessageSquare, isCentral: false },
    { id: 'profile', labelKey: 'navProfile', icon: User, isCentral: false },
  ] as const;

  return (
    <nav id="saleem-bottom-navigation" className="w-full vip-toolbar-glass px-2 pt-2 pb-2 pb-safe text-white sticky bottom-0 z-30">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto flex items-center justify-around relative">
        {NAV_ITEMS.map((item) => {
          if (item.isCentral) {
            return (
              <div key={item.id} className="relative -top-4 flex flex-col items-center">
                {/* Distinctive Ambient Halo Glow behind central button */}
                <div
                  className={`absolute -inset-1 rounded-full blur-md opacity-75 animate-pulse pointer-events-none ${
                    hasActiveRoom
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-600'
                      : 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400'
                  }`}
                />

                <button
                  type="button"
                  onClick={onCenterAction}
                  className={`relative w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all border-4 border-slate-950 cursor-pointer ${
                    hasActiveRoom
                      ? 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-slate-950 ring-2 ring-amber-300/80 shadow-[0_0_25px_rgba(245,158,11,0.6)]'
                      : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 text-white ring-2 ring-purple-300/80 shadow-[0_0_25px_rgba(168,85,247,0.6)]'
                  }`}
                  title={hasActiveRoom ? 'غرفتي الصوتية' : 'إنشاء غرفة جديدة'}
                >
                  {hasActiveRoom ? (
                    <div className="relative flex items-center justify-center">
                      <Radio className="w-6 h-6 sm:w-7 sm:h-7 text-slate-950 stroke-[2.8] animate-pulse" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white animate-ping" />
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-center">
                      <Plus className="w-7 h-7 stroke-[3] text-white" />
                      <Sparkles className="w-3 h-3 text-amber-200 absolute -top-1.5 -right-1.5 animate-spin" style={{ animationDuration: '4s' }} />
                    </div>
                  )}
                </button>

                <span
                  className={`text-[10px] font-black mt-1 tracking-wide flex items-center gap-0.5 ${
                    hasActiveRoom ? 'text-amber-300 drop-shadow' : 'text-purple-300 drop-shadow'
                  }`}
                >
                  {hasActiveRoom ? (
                    <>
                      <span>غرفتي</span>
                      <span className="text-[9px]">🎙️</span>
                    </>
                  ) : (
                    <>
                      <span>إنشاء غرفة</span>
                      <span className="text-[9px]">✨</span>
                    </>
                  )}
                </span>
              </div>
            );
          }

          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as MainTab)}
              className={`flex flex-col items-center justify-center p-1.5 min-w-[50px] transition-all rounded-xl active:bg-slate-900 cursor-pointer ${
                isActive ? 'text-amber-400 scale-105 font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 sm:w-5 sm:h-5 ${isActive ? 'text-amber-400 stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-black' : 'font-medium'}`}>
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
