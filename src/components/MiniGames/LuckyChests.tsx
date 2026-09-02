import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Gift, Clock, Sparkles } from 'lucide-react';

interface LuckyChestsProps {
  user: UserProfile;
  onUpdateCoins: (delta: number) => void;
}

export const LuckyChests: React.FC<LuckyChestsProps> = ({ user, onUpdateCoins }) => {
  const [openedChest, setOpenedChest] = useState<number | null>(null);
  const [rewardAmount, setRewardAmount] = useState<number>(0);

  const handleOpenChest = (id: number) => {
    if (openedChest !== null) return;
    const randomCoins = Math.floor(Math.random() * 800) + 200;
    setOpenedChest(id);
    setRewardAmount(randomCoins);
    onUpdateCoins(randomCoins);
  };

  const resetChests = () => {
    setOpenedChest(null);
    setRewardAmount(0);
  };

  return (
    <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-4 text-white space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-purple-400" />
          <h3 className="font-black text-sm text-purple-300">صناديق الحظ والتسابق (Lucky Chests) 🎁</h3>
        </div>
        <span className="text-xs text-slate-400">اختر صندوقاً قبل انتهاء الوقت!</span>
      </div>

      <div className="grid grid-cols-3 gap-3 my-2">
        {[1, 2, 3].map((chestId) => (
          <button
            key={chestId}
            disabled={openedChest !== null}
            onClick={() => handleOpenChest(chestId)}
            className={`h-24 rounded-2xl border-2 flex flex-col items-center justify-center p-2 transition-all shadow-xl ${
              openedChest === chestId
                ? 'bg-amber-500/20 border-amber-400 animate-bounce'
                : 'bg-slate-800 border-slate-700 hover:border-purple-400 hover:bg-slate-700'
            }`}
          >
            <span className="text-3xl mb-1">{openedChest === chestId ? '🔓' : '🎁'}</span>
            <span className="text-[10px] font-bold text-slate-300">صندوق {chestId}</span>
          </button>
        ))}
      </div>

      {openedChest !== null && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 text-center space-y-2">
          <p className="font-bold text-amber-300 text-xs">
            🎉 فتحت الصندوق وربحت {rewardAmount.toLocaleString()} عملة مجانية!
          </p>
          <button
            onClick={resetChests}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1 rounded-lg"
          >
            جولة جديدة
          </button>
        </div>
      )}
    </div>
  );
};
