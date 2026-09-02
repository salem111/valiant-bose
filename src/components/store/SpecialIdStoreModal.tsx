import React, { useState } from 'react';
import {
  X,
  Crown,
  Sparkles,
  Search,
  CheckCircle2,
  Coins,
  Gem,
  Flame,
  Award,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useI18n } from '../../lib/i18n';

interface SpecialIdStoreModalProps {
  user: UserProfile;
  onClose: () => void;
  onPurchaseId: (newId: string, costCoins: number) => void;
  onOpenCoinStore?: () => void;
}

interface SpecialIdItem {
  id: string;
  displayId: string;
  category: 'super_rare' | 'lucky' | 'golden' | 'pairs';
  categoryLabel: string;
  priceCoins: number;
  badge: string;
  minVip: number;
  description: string;
}

export const SpecialIdStoreModal: React.FC<SpecialIdStoreModalProps> = ({
  user,
  onClose,
  onPurchaseId,
  onOpenCoinStore,
}) => {
  const { t, dir } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [purchasedId, setPurchasedId] = useState<string | null>(null);

  const SPECIAL_IDS: SpecialIdItem[] = [
    // Super Rare 3-Digit
    {
      id: 'id-777',
      displayId: '777',
      category: 'super_rare',
      categoryLabel: 'ثلاثي أسطوري 👑',
      priceCoins: 50000,
      badge: 'إمبراطوري 🌟',
      minVip: 5,
      description: 'معرف الحظ الأعظم ثلاثي نادر جداً في السيرفر',
    },
    {
      id: 'id-999',
      displayId: '999',
      category: 'super_rare',
      categoryLabel: 'ثلاثي أسطوري 👑',
      priceCoins: 45000,
      badge: 'ملكي 💎',
      minVip: 4,
      description: 'معرف ثلاثي فخم يمنحك هيبة فورية في جميع الغرف',
    },
    {
      id: 'id-100',
      displayId: '100',
      category: 'super_rare',
      categoryLabel: 'ثلاثي أسطوري 👑',
      priceCoins: 40000,
      badge: 'نادر ⚡',
      minVip: 4,
      description: 'المعرف المئوي رقم 1 في الأناقة والفخامة',
    },

    // Lucky 4-Digit
    {
      id: 'id-8888',
      displayId: '8888',
      category: 'lucky',
      categoryLabel: 'رباعي محظوظ 🍀',
      priceCoins: 25000,
      badge: 'رباعي الذهب ✨',
      minVip: 3,
      description: 'رمز الثراء والازدهار العالمي مكرر 4 مرات',
    },
    {
      id: 'id-1000',
      displayId: '1000',
      category: 'lucky',
      categoryLabel: 'رباعي محظوظ 🍀',
      priceCoins: 20000,
      badge: 'ألفي أصيل 🏆',
      minVip: 2,
      description: 'معرف ألفي كلاسيكي مميز وسهل الحفظ',
    },
    {
      id: 'id-2026',
      displayId: '2026',
      category: 'lucky',
      categoryLabel: 'رباعي محظوظ 🍀',
      priceCoins: 15000,
      badge: 'عام الإطلاق 🚀',
      minVip: 1,
      description: 'معرف سنة إطلاق تطبيق SALEEM الرسمي',
    },

    // Pairs & Consecutive
    {
      id: 'id-123456',
      displayId: '123456',
      category: 'pairs',
      categoryLabel: 'تسلسلي مميز 💎',
      priceCoins: 12000,
      badge: 'متسلسل 🎲',
      minVip: 1,
      description: 'سلسلة رقمية تصاعدية جذابة وسهلة النطق',
    },
    {
      id: 'id-909090',
      displayId: '909090',
      category: 'pairs',
      categoryLabel: 'تسلسلي مميز 💎',
      priceCoins: 10000,
      badge: 'ثنائي مكرر 🪞',
      minVip: 1,
      description: 'تناغم ثنائي مكرر لإبراز حسابك بين الأصدقاء',
    },

    // Golden 5-Digit
    {
      id: 'id-55555',
      displayId: '55555',
      category: 'golden',
      categoryLabel: 'خماسي ذهبي ✨',
      priceCoins: 18000,
      badge: 'خماسي النخبة 🌟',
      minVip: 2,
      description: 'خمس خمسات ذهبية لحساب استثنائي',
    },
    {
      id: 'id-99999',
      displayId: '99999',
      category: 'golden',
      categoryLabel: 'خماسي ذهبي ✨',
      priceCoins: 22000,
      badge: 'قمة الفخامة 👑',
      minVip: 3,
      description: 'رمز القوة والسيطرة في كبار الداعمين',
    },
  ];

  const filteredIds = SPECIAL_IDS.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.displayId.includes(searchQuery) || item.categoryLabel.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  const handleBuy = (item: SpecialIdItem) => {
    if (user.coins < item.priceCoins) {
      alert('رصيدك من العملات الذهبية غير كافٍ! يرجى الشحن أولاً.');
      if (onOpenCoinStore) onOpenCoinStore();
      return;
    }

    if ((user.vipLevel || 0) < item.minVip) {
      alert(`هذا المعرف يتطلب رتبة VIP ${item.minVip} على الأقل!`);
      return;
    }

    onPurchaseId(item.displayId, item.priceCoins);
    setPurchasedId(item.displayId);
    alert(`🎉 مبروك! تم تعيين المعرف الملكي الجديد الخاص بك بنجاح: ID: ${item.displayId} 👑`);
  };

  return (
    <div dir={dir} className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-sans select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#1b1429] via-[#0e0a19] to-[#080510] border-2 border-amber-500/70 rounded-3xl p-5 text-start shadow-[0_0_45px_rgba(245,158,11,0.35)] space-y-4 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-amber-900/50 pb-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-400 animate-bounce" />
            <div>
              <h3 className="font-black text-base text-amber-300">{t('specialIdStore')}</h3>
              <span className="text-[10px] text-slate-400 block">سوق المعرفات الرقمية الحصرية والفخمة</span>
            </div>
          </div>

          <div className="w-8" />
        </div>

        {/* Current ID & Coins Balance Bar */}
        <div className="bg-slate-900/90 border border-amber-500/40 p-3 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">معرفك الحالي:</span>
            <span className="font-mono font-black text-amber-300 bg-black/60 px-2.5 py-0.5 rounded-lg border border-amber-500/40">
              ID: {user.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 font-mono font-black text-xs text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-xl">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{user.coins.toLocaleString()}</span>
            </div>
            {onOpenCoinStore && (
              <button
                onClick={onOpenCoinStore}
                className="p-1 px-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] rounded-xl shadow cursor-pointer transition-transform active:scale-95"
              >
                + شحن
              </button>
            )}
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن رقم أو معرف مميز..."
              className="w-full bg-[#140e24] border border-amber-500/30 focus:border-amber-400 rounded-2xl pr-10 pl-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'الكل 🌟' },
              { id: 'super_rare', label: 'ثلاثي ملكي 👑' },
              { id: 'lucky', label: 'رباعي محظوظ 🍀' },
              { id: 'golden', label: 'خماسي ذهبي ✨' },
              { id: 'pairs', label: 'تسلسلي مميز 💎' },
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-950/60'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* IDs Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-80">
          {filteredIds.map((item) => {
            const isOwned = user.id === item.displayId || purchasedId === item.displayId;
            const canAfford = user.coins >= item.priceCoins;
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isOwned
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg'
                    : 'bg-gradient-to-r from-slate-900/90 via-slate-950 to-slate-950 border-amber-500/30 hover:border-amber-400/60 shadow-md'
                }`}
              >
                {/* ID Badge & Info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 font-mono font-black text-sm shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-white/60 shrink-0">
                    {item.displayId}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-sm text-white">ID: {item.displayId}</span>
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black px-1.5 py-0.2 rounded-md">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{item.description}</p>
                    <span className="text-[9px] text-purple-300 font-bold block">
                      يتطلب رتبة VIP {item.minVip}+
                    </span>
                  </div>
                </div>

                {/* Price & Action Button */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center gap-1 text-xs font-mono font-black text-amber-300">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.priceCoins.toLocaleString()}</span>
                  </div>

                  {isOwned ? (
                    <span className="px-3 py-1 bg-emerald-600 text-white font-black text-[10px] rounded-xl flex items-center gap-1 shadow">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>مُفعّل ✓</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-[11px] rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      امتلاك المعرف 👑
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
