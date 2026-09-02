import React, { useState } from 'react';
import { Search, Flame, Sparkles, Heart, Filter, X, Radio, Users, Globe, SlidersHorizontal, Check, RotateCcw } from 'lucide-react';
import { useI18n } from '../lib/i18n';

export type MemberFilterType = 'all' | 'high' | 'medium' | 'quiet';
export type FriendsFilterType = 'all' | 'friends_only';
export type RegionFilterType = 'all' | 'arabic' | 'foreign';

interface RoomTabsProps {
  activeTab: 'غرف شائعة' | 'غرف جديدة' | 'متابعة' | 'غرف اللايف 🔴' | 'غرف الحفلات';
  onTabChange: (tab: 'غرف شائعة' | 'غرف جديدة' | 'متابعة' | 'غرف اللايف 🔴' | 'غرف الحفلات') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  regionFilter?: RegionFilterType;
  onRegionFilterChange?: (region: RegionFilterType) => void;
  memberFilter?: MemberFilterType;
  onMemberFilterChange?: (filter: MemberFilterType) => void;
  languageFilter?: string;
  onLanguageFilterChange?: (lang: string) => void;
  friendsFilter?: FriendsFilterType;
  onFriendsFilterChange?: (friends: FriendsFilterType) => void;
  onResetFilters?: () => void;
}

export const RoomTabs: React.FC<RoomTabsProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  regionFilter = 'all',
  onRegionFilterChange,
  memberFilter = 'all',
  onMemberFilterChange,
  languageFilter = 'all',
  onLanguageFilterChange,
  friendsFilter = 'all',
  onFriendsFilterChange,
  onResetFilters,
}) => {
  const { t, dir } = useI18n();
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const TABS = [
    { id: 'غرف شائعة' as const, label: `${t('popularRooms')} 🔥`, icon: Flame },
    { id: 'غرف الحفلات' as const, label: `${t('partyRooms')} 🎉`, icon: Sparkles },
    { id: 'غرف اللايف 🔴' as const, label: `${t('navLive')} 🔴`, icon: Radio },
    { id: 'غرف جديدة' as const, label: `${t('newRooms')} ✨`, icon: Sparkles },
    { id: 'متابعة' as const, label: `${t('followingRooms')} ❤️`, icon: Heart },
  ];

  const REGIONS: { id: RegionFilterType; label: string; icon: string }[] = [
    { id: 'all', label: `${t('allRegions')} 🌍`, icon: '🌍' },
    { id: 'arabic', label: `${t('arabicRooms')} 🇸🇦`, icon: '🇸🇦' },
    { id: 'foreign', label: `${t('foreignRooms')} 🌐`, icon: '🌐' },
  ];

  const LANGUAGES = [
    { id: 'all', label: `All 🌐` },
    { id: 'العربية', label: '🇸🇦 العربية' },
    { id: 'English', label: '🇬🇧 English' },
    { id: 'التركية', label: '🇹🇷 Türkçe' },
    { id: 'الفرنسية', label: '🇫🇷 Français' },
  ];

  const MEMBER_OPTIONS: { id: MemberFilterType; label: string; desc: string }[] = [
    { id: 'all', label: 'All 👥', desc: 'All' },
    { id: 'high', label: 'Busy ⚡', desc: '+50' },
    { id: 'medium', label: 'Medium 🔥', desc: '15 - 50' },
    { id: 'quiet', label: 'Quiet ☕', desc: '< 15' },
  ];

  // Count active filters
  const activeFiltersCount =
    (memberFilter !== 'all' ? 1 : 0) +
    (languageFilter !== 'all' ? 1 : 0) +
    (friendsFilter !== 'all' ? 1 : 0);

  return (
    <div id="saleem-room-tabs" className="my-2.5 space-y-2 select-none">
      {/* Top Header Bar with Tabs, Filter Toggle & Search */}
      <div className="flex items-center justify-between gap-1.5 bg-[#140c2e]/80 p-1.5 rounded-2xl border border-purple-500/20 backdrop-blur-md shadow-lg">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 shadow-md scale-102 font-black ring-1 ring-amber-200'
                    : 'text-slate-300 hover:text-white hover:bg-purple-900/30'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-purple-300/70'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls (Filter & Search) */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Advanced Filter Drawer Button */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`relative p-1.5 rounded-lg border transition-all flex items-center gap-1 text-[10px] font-bold cursor-pointer ${
              showAdvancedFilters || activeFiltersCount > 0
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-400 shadow-md font-black'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
            }`}
            title="Filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Search Toggle Button */}
          <button
            onClick={() => setShowSearchInput(!showSearchInput)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              showSearchInput || searchQuery
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable Search Input */}
      {showSearchInput && (
        <div className="relative animate-fadeIn">
          <Search className={`absolute ${dir === 'rtl' ? 'right-2.5' : 'left-2.5'} top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className={`w-full bg-slate-900 border border-amber-500/40 rounded-lg ${dir === 'rtl' ? 'pr-8 pl-8' : 'pl-8 pr-8'} py-1.5 text-[10.5px] text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50`}
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className={`absolute ${dir === 'rtl' ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Region Switcher */}
      {activeTab !== 'غرف اللايف 🔴' && (
        <div className="grid grid-cols-3 gap-1 bg-slate-900/95 p-1 rounded-xl border border-slate-800/80 shadow-sm">
          {REGIONS.map((reg) => {
            const isSelected = regionFilter === reg.id;
            return (
              <button
                key={reg.id}
                type="button"
                onClick={() => onRegionFilterChange?.(reg.id)}
                className={`py-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  isSelected
                    ? reg.id === 'arabic'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-md'
                      : reg.id === 'foreign'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black shadow-md'
                      : 'bg-slate-800 text-amber-300 font-black border border-amber-400/40 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span>{reg.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Quick Filter Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 text-[10px]">
        {/* Friends Filter Chip */}
        <button
          onClick={() =>
            onFriendsFilterChange?.(
              friendsFilter === 'friends_only' ? 'all' : 'friends_only'
            )
          }
          className={`px-2.5 py-1 rounded-full border transition-all whitespace-nowrap flex items-center gap-1 font-bold cursor-pointer ${
            friendsFilter === 'friends_only'
              ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white border-pink-400 shadow-sm font-black'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-3 h-3" />
          <span>👥 {t('followingRooms')}</span>
        </button>

        {/* Member Count High Chip */}
        <button
          onClick={() =>
            onMemberFilterChange?.(memberFilter === 'high' ? 'all' : 'high')
          }
          className={`px-2.5 py-1 rounded-full border transition-all whitespace-nowrap flex items-center gap-1 font-bold cursor-pointer ${
            memberFilter === 'high'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-black'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Flame className="w-3 h-3" />
          <span>⚡ +50</span>
        </button>

        {/* Arabic Language Chip */}
        <button
          onClick={() =>
            onLanguageFilterChange?.(
              languageFilter === 'العربية' ? 'all' : 'العربية'
            )
          }
          className={`px-2.5 py-1 rounded-full border transition-all whitespace-nowrap flex items-center gap-1 font-bold cursor-pointer ${
            languageFilter === 'العربية'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm font-black'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>🇸🇦 العربية</span>
        </button>

        {/* English Language Chip */}
        <button
          onClick={() =>
            onLanguageFilterChange?.(
              languageFilter === 'English' ? 'all' : 'English'
            )
          }
          className={`px-2.5 py-1 rounded-full border transition-all whitespace-nowrap flex items-center gap-1 font-bold cursor-pointer ${
            languageFilter === 'English'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm font-black'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>🇬🇧 English</span>
        </button>

        {/* Turkish Language Chip */}
        <button
          onClick={() =>
            onLanguageFilterChange?.(
              languageFilter === 'التركية' ? 'all' : 'التركية'
            )
          }
          className={`px-2.5 py-1 rounded-full border transition-all whitespace-nowrap flex items-center gap-1 font-bold cursor-pointer ${
            languageFilter === 'التركية'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm font-black'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>🇹🇷 Türkçe</span>
        </button>

        {/* Reset Filters Chip */}
        {(activeFiltersCount > 0 || regionFilter !== 'all' || searchQuery) && (
          <button
            onClick={onResetFilters}
            className="px-2.5 py-1 rounded-full bg-red-950/40 text-rose-300 border border-rose-500/40 hover:bg-rose-900/50 transition-all whitespace-nowrap flex items-center gap-1 font-bold cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t('resetFilters')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
