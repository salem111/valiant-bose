import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, HelpCircle } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { listenToAllUsersFromRealtimeDb } from '../lib/firebase';
import { UserProfile } from '../types';

interface LeaderboardModalProps {
  onClose: () => void;
  currentUser?: UserProfile | null;
}

const TABS = ['Power', 'Power Tier', 'Charm', 'Room Gifts'];
const SUB_TABS = ['Daily', 'Weekly', 'Monthly', 'Last week'];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose, currentUser }) => {
  const { t, dir } = useI18n();
  const [activeTab, setActiveTab] = useState('Charm');
  const [activeSubTab, setActiveSubTab] = useState('Weekly');
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const unsubscribe = listenToAllUsersFromRealtimeDb((data) => {
      setUsers(data);
    });
    return () => unsubscribe();
  }, []);

  const sortedUsers = useMemo(() => {
    let sorted = [...users];
    if (activeTab === 'Power' || activeTab === 'Power Tier') {
      sorted.sort((a, b) => (b.wealthXp || 0) - (a.wealthXp || 0));
    } else {
      // Charm or Room Gifts
      sorted.sort((a, b) => (b.totalReceivedDiamonds || 0) - (a.totalReceivedDiamonds || 0));
    }
    return sorted;
  }, [users, activeTab]);

  const getScore = (user: UserProfile) => {
    if (activeTab === 'Power' || activeTab === 'Power Tier') {
      return `${(user.wealthXp || 0).toLocaleString()}`;
    }
    return `${(user.totalReceivedDiamonds || 0).toLocaleString()}`;
  };

  const top3 = sortedUsers.slice(0, 3).map((u, i) => {
    let type = 'gold';
    if (i === 1) type = 'silver';
    if (i === 2) type = 'bronze';
    // Position re-mapping to put rank 1 in the middle (which is index 1 in the UI array)
    // Actually the UI renders them in the order of the array, so we want:
    // [Rank 2, Rank 1, Rank 3]
    return { ...u, rank: i + 1, type, score: getScore(u) };
  });

  const displayTop3 = [];
  if (top3[1]) displayTop3.push(top3[1]); // Rank 2
  if (top3[0]) displayTop3.push(top3[0]); // Rank 1
  if (top3[2]) displayTop3.push(top3[2]); // Rank 3

  const listItems = sortedUsers.slice(3);

  const myRankIndex = sortedUsers.findIndex((u) => u.id === currentUser?.id);
  const myRank = myRankIndex !== -1 ? myRankIndex + 1 : '99+';
  const myScore = currentUser ? getScore(currentUser) : '0';

  return (
    <div dir={dir} className="fixed inset-0 z-50 bg-[#030108] flex flex-col font-sans overflow-hidden animate-scaleUp">
      {/* Background with God Rays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030108]/60 to-[#030108]" />

      {/* Header */}
      <div className="relative z-10 px-4 pt-safe pb-4 flex justify-between items-center text-white">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full backdrop-blur-md border border-white/20">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Rankings</h1>
        <button className="p-2 bg-white/10 rounded-full backdrop-blur-md border border-white/20">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Tabs */}
      <div className="relative z-10 px-4 flex justify-between items-center text-sm font-medium mb-4">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`transition-colors duration-300 ${
              activeTab === tab ? 'text-white border-b-2 border-white pb-1' : 'text-white/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Secondary Tabs */}
      <div className="relative z-10 px-4 flex gap-2 mb-8 overflow-x-auto no-scrollbar">
        {SUB_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-1.5 text-xs transition-all duration-300 whitespace-nowrap ${
              activeSubTab === tab ? 'luxury-tab-active' : 'luxury-tab-inactive'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Top 3 Podium */}
        <div className="flex justify-center items-end gap-2 px-2 mb-8 h-64">
          {displayTop3.map((user) => (
            <div key={user.rank} className={`flex flex-col items-center relative ${user.rank === 1 ? 'w-1/3 z-20 -mb-6' : 'w-1/4 z-10'}`}>
              <div className={`relative flex items-center justify-center w-full aspect-square bg-white/5 rounded-full border ${
                user.type === 'gold' ? 'border-amber-400' : user.type === 'silver' ? 'border-slate-300' : 'border-orange-600'
              } shadow-lg mb-2`}>
                 <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover bg-black/40 backdrop-blur-sm" />
                 {/* Fake wings behind */}
                 <div className={`absolute -z-10 -left-6 -right-6 -top-4 -bottom-4 bg-[url('/vip_podium_crown_gold.jpg')] bg-contain bg-center bg-no-repeat opacity-80 ${user.rank === 1 ? 'block' : 'hidden'}`} />
              </div>
              
              <div className={`w-full p-2 rounded-t-xl text-center backdrop-blur-md ${
                user.type === 'gold' ? 'vip-podium-gold h-28' : user.type === 'silver' ? 'vip-podium-silver h-24' : 'vip-podium-bronze h-20'
              }`}>
                <span className="block text-[10px] font-black text-white/80 mb-1">TOP {user.rank}</span>
                <div className="w-full truncate text-xs font-bold text-white mb-2">{user.name}</div>
                <span className="text-xs font-bold text-amber-300">{user.score}</span>
              </div>
            </div>
          ))}
        </div>

        {/* List Ranks 4+ */}
        <div className="px-4 space-y-3 relative z-10">
          {listItems.map((user, idx) => (
            <div key={user.id} className="card-luxury-glass p-3 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm w-4 text-white/60">{idx + 4}</span>
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-white/10 ring-1 ring-white/20 object-cover" />
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-bold text-white">{user.name}</div>
                  <div className="text-[10px] text-white/50">{user.levelStatus}</div>
                </div>
              </div>
              <span className="text-amber-300 font-bold text-sm">{getScore(user)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Rank Bar */}
      {currentUser && (
        <div className="absolute bottom-0 left-0 right-0 z-50 sticky-user-rank p-4 pb-safe flex items-center justify-between border-t border-white/10">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white text-lg">{myRank}</span>
            <img src={currentUser.avatar} alt={currentUser.name} className="w-12 h-12 rounded-full object-cover bg-white/20 ring-2 ring-white/40" />
            <div className="flex flex-col gap-1">
              <div className="text-base font-bold text-white">{currentUser.name}</div>
              <div className="text-xs text-white/60">{currentUser.levelStatus}</div>
            </div>
          </div>
          <span className="text-white font-black text-lg">{myScore}</span>
        </div>
      )}
    </div>
  );
};
