import React, { useState } from 'react';
import { GiftItem, UserProfile, MicSeat, LuckyRewardResult } from '../types';
import {
  X,
  Package,
  Zap,
  Plus,
  Sparkles,
  Trophy,
  Flame,
  Award,
} from 'lucide-react';

interface GiftSelectorModalProps {
  user: UserProfile;
  seats: MicSeat[];
  onClose: () => void;
  onSendGift: (gift: GiftItem, recipientName: string, amount: number, luckyReward?: LuckyRewardResult) => void;
  onOpenRecharge: () => void;
  onUpdateUserBalance?: (newDiamonds: number, newXp: number, newLevel: number) => void;
  onUpdateCoins?: (delta: number) => void;
}

export function calculateLuckyReward(totalBetCoins: number): LuckyRewardResult {
  const rand = Math.random() * 100; // 0.00 to 100.00%

  let multiplier = 0;
  if (rand < 0.05) {
    multiplier = 500; // 0.05% Mega Jackpot
  } else if (rand < 0.30) {
    multiplier = 100; // 0.25% Super Jackpot
  } else if (rand < 1.50) {
    multiplier = 50;  // 1.20% Big Win
  } else if (rand < 6.00) {
    multiplier = 10;  // 4.50% Great Win
  } else if (rand < 17.00) {
    multiplier = 3;   // 11.00% Good Win
  } else if (rand < 42.00) {
    multiplier = 1.5; // 25.00% Small Cashback
  } else {
    multiplier = 0;   // 58.00% No Win
  }

  const wonCoins = Math.round(totalBetCoins * multiplier);
  return {
    multiplier,
    wonCoins,
    isJackpot: multiplier >= 100,
    isBigWin: multiplier >= 50,
  };
}

export const RICH_GIFTS_DATA: GiftItem[] = [
  // 1. هدايا الشعبية (Popular / General - 15 Gifts)
  { id: 'g-rose-yellow', name: 'وردة الحب', icon: '🌹', priceCoins: 10, priceDiamonds: 10, category: 'gift', badge: 'شعبية 🌸', effectType: 'rose_shower' },
  { id: 'g-perfume', name: 'عطر الفخامة', icon: '🧴✨', priceCoins: 50, priceDiamonds: 50, category: 'gift', badge: 'مميز', effectType: 'love_heart' },
  { id: 'g-bomb-cat', name: 'قط القنابل', icon: '💣🐱', priceCoins: 99, priceDiamonds: 99, category: 'gift', badge: 'كوميدي 🤡', effectType: 'fireworks_boom' },
  { id: 'g-water-balloons', name: 'بالونات المطر', icon: '🎈💦', priceCoins: 299, priceDiamonds: 299, category: 'gift', effectType: 'rose_shower' },
  { id: 'g-gold-ring', name: 'خاتم الألماس', icon: '💍✨', priceCoins: 500, priceDiamonds: 500, category: 'gift', badge: 'فاخر 💎', effectType: 'love_heart' },
  { id: 'g-golden-falcon', name: 'الصقر الذهبي', icon: '🦅✨', priceCoins: 999, priceDiamonds: 999, category: 'gift', badge: 'أصيل 👑', effectType: 'jet_fly' },
  { id: 'g-sports-car', name: 'لامبورغيني فراري', icon: '🏎️💨', priceCoins: 1200, priceDiamonds: 1200, category: 'gift', badge: 'فاخر ⚡', effectType: 'car_drive' },
  { id: 'g-heli', name: 'طائرة هليكوبتر', icon: '🚁💨', priceCoins: 2500, priceDiamonds: 2500, category: 'gift', badge: 'VIP ⭐', effectType: 'jet_fly' },
  {
    id: 'g-gold-king',
    name: 'ملك الذهب 👑🪙',
    icon: '/assets/gifts/icons/2.png',
    priceCoins: 4000,
    priceDiamonds: 4000,
    category: 'gift',
    badge: 'فيديو 👑⚡',
    effectType: 'gold_king',
    animation: '/assets/gifts/animations/2.mp4',
    videoUrl: '/assets/gifts/animations/2.mp4',
    iconUrl: '/assets/gifts/icons/2.png',
  },
  {
    id: 'g-soul-lover',
    name: 'عاشق الروح ❤️🕊️',
    icon: '/assets/gifts/icons/3.png',
    priceCoins: 5000,
    priceDiamonds: 5000,
    category: 'gift',
    badge: 'فيديو ❤️🕊️',
    effectType: 'soul_lover',
    animation: '/assets/gifts/animations/3.mp4',
    videoUrl: '/assets/gifts/animations/3.mp4',
    iconUrl: '/assets/gifts/icons/3.png',
  },
  { id: 'g-aries-doll', name: 'دمية الذهبية', icon: '🧸✨', priceCoins: 5000, priceDiamonds: 5000, category: 'gift', badge: 'VIP ⭐', effectType: 'gold_coins' },
  { id: 'g-private-jet', name: 'طائرة نفاثة خاصة', icon: '🛩️✨', priceCoins: 8000, priceDiamonds: 8000, category: 'gift', badge: 'VIP ✈️', effectType: 'jet_fly' },
  { id: 'g-holy-ram', name: 'القصر الملكي', icon: '🏰✨', priceCoins: 10000, priceDiamonds: 10000, category: 'gift', badge: 'ملكي 👑', effectType: 'castle_crown' },
  {
    id: 'g-white-heart',
    name: 'القلب الأبيض 🤍',
    icon: '/assets/gifts/icons/1.png',
    priceCoins: 10000,
    priceDiamonds: 10000,
    category: 'gift',
    badge: 'فيديو 🤍✨',
    effectType: 'white_heart',
    animation: '/assets/gifts/animations/1.mp4',
    videoUrl: '/assets/gifts/animations/1.mp4',
    iconUrl: '/assets/gifts/icons/1.png',
  },
  { id: 'g-luxury-yacht', name: 'يخت الملياردير', icon: '🛥️🌊', priceCoins: 20000, priceDiamonds: 20000, category: 'gift', badge: 'ملكي 🌊', effectType: 'gold_coins' },
  { id: 'g-golden-lion', name: 'الأسد الذهبي', icon: '🦁👑', priceCoins: 30000, priceDiamonds: 30000, category: 'gift', badge: 'ملكي 👑', effectType: 'castle_crown' },
  {
    id: 'g-svip-dragon',
    name: 'تنين الذهب الإمبراطوري',
    icon: '/assets/gifts/icons/dragon.png',
    priceCoins: 50000,
    priceDiamonds: 50000,
    category: 'gift',
    badge: 'أسطوري 🐲',
    effectType: 'dragon_fire',
    animation: '/assets/gifts/animations/dragon.webm',
    videoUrl: '/assets/gifts/animations/dragon.mp4',
    iconUrl: '/assets/gifts/icons/dragon.png',
  },
  { id: 'g-galaxy-planet', name: 'كوكب المجرة العظمى', icon: '🪐✨', priceCoins: 50000, priceDiamonds: 50000, category: 'gift', badge: 'أسطوري 🪐', effectType: 'fireworks_boom' },

  // 2. هدايا عيد الأضحى والمناسبات (Eid Al-Adha & Holidays - 10 Gifts)
  { id: 'g-eid-mubarak', name: 'عيدية الذهب 🪙', icon: '🪙✨', priceCoins: 10, priceDiamonds: 10, category: 'eid', badge: 'عيد مبارك 🌙', effectType: 'gold_coins' },
  { id: 'g-eid-sweets', name: 'حلاوة العيد', icon: '🍬🍡', priceCoins: 50, priceDiamonds: 50, category: 'eid', badge: 'العيد', effectType: 'rose_shower' },
  { id: 'g-arabic-coffee', name: 'دلة القهوة الأصيلة', icon: '☕✨', priceCoins: 100, priceDiamonds: 100, category: 'eid', badge: 'الأصالة', effectType: 'gold_coins' },
  { id: 'g-dates-luxury', name: 'تمر السكري الفاخر', icon: '🌴🍯', priceCoins: 299, priceDiamonds: 299, category: 'eid', badge: 'فاخر', effectType: 'gold_coins' },
  { id: 'g-oud-incense', name: 'بخور العود الملكي', icon: '🪵💨', priceCoins: 500, priceDiamonds: 500, category: 'eid', badge: 'بخور 👑', effectType: 'castle_crown' },
  { id: 'g-crescent-moon', name: 'هلال العيد المضيء', icon: '🌙✨', priceCoins: 1000, priceDiamonds: 1000, category: 'eid', badge: 'العيد 🌙', effectType: 'eid_ram' },
  { id: 'g-eid-fireworks', name: 'ألعاب نارية للعيد', icon: '🎆🎇', priceCoins: 2500, priceDiamonds: 2500, category: 'eid', badge: 'احتفال 🎇', effectType: 'fireworks_boom' },
  { id: 'g-golden-sheep', name: 'خاروف العيد الذهبي', icon: '🐑✨', priceCoins: 5000, priceDiamonds: 5000, category: 'eid', badge: 'عيد الأضحى 🐑', effectType: 'eid_ram' },
  { id: 'g-royal-ram', name: 'كبش الفداء الملكي', icon: '🐏👑', priceCoins: 10000, priceDiamonds: 10000, category: 'eid', badge: 'ملكي 🐏', effectType: 'eid_ram' },
  { id: 'g-sheikh-tent', name: 'خيمة الشيوخ الذهبية', icon: '⛺✨', priceCoins: 25000, priceDiamonds: 25000, category: 'eid', badge: 'فخامة 👑', effectType: 'castle_crown' },

  // 3. هدايا أعياد الميلاد (Birthdays - 10 Gifts)
  { id: 'g-bday-card', name: 'بطاقة تهنئة', icon: '💌🎂', priceCoins: 20, priceDiamonds: 20, category: 'birthday', badge: 'ميلاد 🎉', effectType: 'bday_party' },
  { id: 'g-bday-candle', name: 'شمعة الأمل', icon: '🕯️✨', priceCoins: 50, priceDiamonds: 50, category: 'birthday', badge: 'ميلاد', effectType: 'bday_party' },
  { id: 'g-bday-balloons', name: 'بالونات الهيليوم', icon: '🎈🎉', priceCoins: 100, priceDiamonds: 100, category: 'birthday', badge: 'ميلاد', effectType: 'bday_party' },
  { id: 'g-bday-hat', name: 'قبعة الاحتفال', icon: '🥳🎩', priceCoins: 299, priceDiamonds: 299, category: 'birthday', badge: 'احتفال', effectType: 'bday_party' },
  { id: 'g-bday-surprise', name: 'صندوق المفاجآت', icon: '🎁✨', priceCoins: 500, priceDiamonds: 500, category: 'birthday', badge: 'مفاجأة 🎁', effectType: 'bday_party' },
  { id: 'g-bday-cake', name: 'كعكة الميلاد الماسية', icon: '🎂🎉', priceCoins: 1000, priceDiamonds: 1000, category: 'birthday', badge: 'ميلاد 🎂', effectType: 'bday_party' },
  { id: 'g-bday-music', name: 'فرقة الموسيقى', icon: '🎷🎺', priceCoins: 2500, priceDiamonds: 2500, category: 'birthday', badge: 'موسيقى 🎵', effectType: 'bday_party' },
  { id: 'g-bday-crown', name: 'تاج أعياد الميلاد', icon: '👑🎂', priceCoins: 5000, priceDiamonds: 5000, category: 'birthday', badge: 'تاج 👑', effectType: 'castle_crown' },
  { id: 'g-bday-fireworks', name: 'ألعاب ميلاد نارية', icon: '🎆🎉', priceCoins: 10000, priceDiamonds: 10000, category: 'birthday', badge: 'حفلة 🎆', effectType: 'fireworks_boom' },
  { id: 'g-bday-tower', name: 'برج الميلاد الأسطوري', icon: '🗼🎂', priceCoins: 30000, priceDiamonds: 30000, category: 'birthday', badge: 'أسطوري 🗼', effectType: 'castle_crown' },

  // 4. هدايا العشاق (CP / Romance - 10 Gifts)
  {
    id: 'g-eternal-love',
    name: 'الحب الأبدي',
    icon: '/assets/gifts/icons/eternal-love.png',
    priceCoins: 5000,
    priceDiamonds: 5000,
    category: 'cp',
    badge: 'أسطوري ❤️',
    effectType: 'eternal_love',
    animation: '/assets/gifts/animations/dragon.webm',
    videoUrl: '/assets/gifts/animations/dragon.mp4',
    iconUrl: '/assets/gifts/icons/eternal-love.png',
  },
  { id: 'g-cp-flower', name: 'ورود جورية', icon: '💐❤️', priceCoins: 20, priceDiamonds: 20, category: 'cp', badge: 'عشاق ❤️', effectType: 'rose_shower' },
  { id: 'g-cp-chocolate', name: 'شوكولاتة الحب', icon: '🍫❤️', priceCoins: 50, priceDiamonds: 50, category: 'cp', badge: 'عشاق', effectType: 'love_heart' },
  { id: 'g-cp-teddy', name: 'دب العشاق', icon: '🧸💖', priceCoins: 200, priceDiamonds: 200, category: 'cp', badge: 'عشاق', effectType: 'love_heart' },
  { id: 'g-cp-ring', name: 'دبلة الخطوبة', icon: '💍💖', priceCoins: 500, priceDiamonds: 500, category: 'cp', badge: 'خطوبة 💍', effectType: 'love_heart' },
  { id: 'g-cp-swans', name: 'بجعة الحب الماسية', icon: '🦢💖', priceCoins: 1000, priceDiamonds: 1000, category: 'cp', badge: 'عشاق 🦢', effectType: 'love_heart' },
  { id: 'g-cp-convertible', name: 'سيارة العشاق', icon: '🏎️❤️', priceCoins: 2500, priceDiamonds: 2500, category: 'cp', badge: 'رومانسية', effectType: 'car_drive' },
  { id: 'g-cp-castle', name: 'قلعة العشاق', icon: '🏰❤️', priceCoins: 5000, priceDiamonds: 5000, category: 'cp', badge: 'قلعة ❤️', effectType: 'castle_crown' },
  {
    id: 'g-soul-lover-cp',
    name: 'عاشق الروح ❤️🕊️',
    icon: '/assets/gifts/icons/3.png',
    priceCoins: 5000,
    priceDiamonds: 5000,
    category: 'cp',
    badge: 'فيديو عشاق ❤️',
    effectType: 'soul_lover',
    animation: '/assets/gifts/animations/3.mp4',
    videoUrl: '/assets/gifts/animations/3.mp4',
    iconUrl: '/assets/gifts/icons/3.png',
  },
  {
    id: 'g-white-heart-cp',
    name: 'القلب الأبيض 🤍',
    icon: '/assets/gifts/icons/1.png',
    priceCoins: 10000,
    priceDiamonds: 10000,
    category: 'cp',
    badge: 'فيديو أسطوري 🤍',
    effectType: 'white_heart',
    animation: '/assets/gifts/animations/1.mp4',
    videoUrl: '/assets/gifts/animations/1.mp4',
    iconUrl: '/assets/gifts/icons/1.png',
  },
  { id: 'g-cp-date', name: 'موعد تحت النجوم', icon: '🎠✨', priceCoins: 10000, priceDiamonds: 10000, category: 'cp', badge: 'CP ❤️', effectType: 'fireworks_boom' },
  { id: 'g-cp-trip', name: 'رحلة أصلية لشخصين', icon: '✈️💖', priceCoins: 20000, priceDiamonds: 20000, category: 'cp', badge: 'سفر ✈️', effectType: 'jet_fly' },
  { id: 'g-cp-diamond-heart', name: 'قلب الألماس الخالد', icon: '💎❤️', priceCoins: 40000, priceDiamonds: 40000, category: 'cp', badge: 'خالد 💎', effectType: 'love_heart' },

  // 5. قسم محظوظ (Lucky Gifts - 8 Gifts)
  { id: 'g-lucky-star', name: 'نجمة الحظ السعيدة', icon: '🌟🎁', priceCoins: 50, priceDiamonds: 50, category: 'lucky', badge: 'LUCKY', effectType: 'gold_coins' },
  { id: 'g-clover', name: 'نبتة الحظ الرباعية', icon: '🍀✨', priceCoins: 100, priceDiamonds: 100, category: 'lucky', badge: 'LUCKY', effectType: 'gold_coins' },
  { id: 'g-lucky-dice', name: 'النرد الذهبي المحظوظ', icon: '🎲✨', priceCoins: 299, priceDiamonds: 299, category: 'lucky', badge: 'LUCKY', effectType: 'gold_coins' },
  { id: 'g-lucky-chest', name: 'صندوق الكنز', icon: '🪙📦', priceCoins: 500, priceDiamonds: 500, category: 'lucky', badge: 'LUCKY 🪙', effectType: 'gold_coins' },
  { id: 'g-lucky-wheel', name: 'عجلة الحظ السحرية', icon: '🎡✨', priceCoins: 1000, priceDiamonds: 1000, category: 'lucky', badge: 'LUCKY 🎡', effectType: 'gold_coins' },
  { id: 'g-money-tree', name: 'شجرة المال والذهب', icon: '🌲🪙', priceCoins: 2500, priceDiamonds: 2500, category: 'lucky', badge: 'LUCKY 🌲', effectType: 'gold_coins' },
  { id: 'g-genie-lamp', name: 'مصباح علاء الدين', icon: '🧞✨', priceCoins: 5000, priceDiamonds: 5000, category: 'lucky', badge: 'LUCKY 🧞', effectType: 'fireworks_boom' },
  { id: 'g-turquoise-gem', name: 'جوهرة الفيروز', icon: '💎✨', priceCoins: 10000, priceDiamonds: 10000, category: 'lucky', badge: 'LUCKY 💎', effectType: 'castle_crown' },

  // 6. قسم النادي الملكي و SVIP (10 Gifts)
  {
    id: 'g-gold-king-svip',
    name: 'ملك الذهب 👑🪙',
    icon: '/assets/gifts/icons/2.png',
    priceCoins: 4000,
    priceDiamonds: 4000,
    category: 'svip',
    badge: 'SVIP فيديو 👑',
    effectType: 'gold_king',
    animation: '/assets/gifts/animations/2.mp4',
    videoUrl: '/assets/gifts/animations/2.mp4',
    iconUrl: '/assets/gifts/icons/2.png',
  },
  {
    id: 'g-soul-lover-svip',
    name: 'عاشق الروح ❤️🕊️',
    icon: '/assets/gifts/icons/3.png',
    priceCoins: 5000,
    priceDiamonds: 5000,
    category: 'svip',
    badge: 'SVIP فيديو ❤️',
    effectType: 'soul_lover',
    animation: '/assets/gifts/animations/3.mp4',
    videoUrl: '/assets/gifts/animations/3.mp4',
    iconUrl: '/assets/gifts/icons/3.png',
  },
  { id: 'g-svip-throne', name: 'العرش الملكي', icon: '👑🏛️', priceCoins: 5000, priceDiamonds: 5000, category: 'svip', badge: 'SVIP 👑', effectType: 'castle_crown' },
  {
    id: 'g-white-heart-svip',
    name: 'القلب الأبيض 🤍',
    icon: '/assets/gifts/icons/1.png',
    priceCoins: 10000,
    priceDiamonds: 10000,
    category: 'svip',
    badge: 'SVIP فيديو 🤍',
    effectType: 'white_heart',
    animation: '/assets/gifts/animations/1.mp4',
    videoUrl: '/assets/gifts/animations/1.mp4',
    iconUrl: '/assets/gifts/icons/1.png',
  },
  { id: 'g-svip-tiger', name: 'نمر بنغالي أبيض', icon: '🐅✨', priceCoins: 10000, priceDiamonds: 10000, category: 'svip', badge: 'SVIP 🐅', effectType: 'castle_crown' },
  { id: 'g-svip-emperor-crown', name: 'تاج الإمبراطور الماسي', icon: '👑💎', priceCoins: 15000, priceDiamonds: 15000, category: 'svip', badge: 'SVIP 💎', effectType: 'castle_crown' },
  { id: 'g-svip-golfstream', name: 'طائرة غولف ستريم', icon: '🛩️✨', priceCoins: 20000, priceDiamonds: 20000, category: 'svip', badge: 'SVIP 🛩️', effectType: 'jet_fly' },
  { id: 'g-lapis', name: 'الإلهة اللازوردية', icon: '👸🏼💎', priceCoins: 25000, priceDiamonds: 25000, category: 'svip', badge: 'SVIP 👑', effectType: 'castle_crown' },
  { id: 'g-svip-billionaire-yacht', name: 'يخت الملياردير الملكي', icon: '🛥️💎', priceCoins: 30000, priceDiamonds: 30000, category: 'svip', badge: 'SVIP 🛥️', effectType: 'gold_coins' },
  { id: 'g-svip-golden-tower', name: 'البرج الذهبي الإمبراطوري', icon: '🏛️👑', priceCoins: 35000, priceDiamonds: 35000, category: 'svip', badge: 'SVIP 🏛️', effectType: 'castle_crown' },
  { id: 'g-svip-dream-island', name: 'جزيرة الأحلام السحرية', icon: '🏝️✨', priceCoins: 40000, priceDiamonds: 40000, category: 'svip', badge: 'SVIP 🏝️', effectType: 'fireworks_boom' },
  { id: 'g-svip-space-shuttle', name: 'طائرة الفضاء الملكية', icon: '🚀✨', priceCoins: 45000, priceDiamonds: 45000, category: 'svip', badge: 'SVIP 🚀', effectType: 'jet_fly' },
  { id: 'g-svip-imperial-dragon', name: 'تنين الذهب الإمبراطوري الأعظم', icon: '🐲🔥', priceCoins: 50000, priceDiamonds: 50000, category: 'svip', badge: 'SVIP 🐲', effectType: 'dragon_fire' }
];

export const GiftSelectorModal: React.FC<GiftSelectorModalProps> = ({
  user,
  seats,
  onClose,
  onSendGift,
  onOpenRecharge,
  onUpdateUserBalance,
  onUpdateCoins,
}) => {
  const [activeTab, setActiveTab] = useState<'gift' | 'eid' | 'birthday' | 'cp' | 'lucky' | 'svip'>('gift');
  const [selectedGift, setSelectedGift] = useState<GiftItem>(RICH_GIFTS_DATA[0]);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>(['all']);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Room Support Level & Progress Stats
  const roomSupportLevel = 14;
  const currentLevelXp = 120;
  const xpNeeded = 180;
  const progressPercent = Math.min(Math.round((currentLevelXp / (currentLevelXp + xpNeeded)) * 100), 100);

  const filteredGifts = RICH_GIFTS_DATA.filter((g) => g.category === activeTab || (activeTab === 'gift' && (!g.category || g.category === 'gift')));

  // Filter ONLY occupied seats where a speaker/guest is actually seated in the room
  const occupiedSeats = (seats || []).filter((s) => s.speakerUser && s.speakerUser.name);

  // Fallback if no seats are currently occupied: use logged-in user or active host
  const presentSeats = occupiedSeats.length > 0 ? occupiedSeats : [
    {
      seatId: 1,
      isLocked: false,
      isMuted: false,
      points: 100,
      speakerUser: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      }
    }
  ];

  const isAllSelected = selectedSeats.includes('all') || selectedSeats.length === presentSeats.length;

  const handleToggleSeat = (seatIndexStr: string) => {
    if (seatIndexStr === 'all') {
      setSelectedSeats(['all']);
      return;
    }

    setSelectedSeats((prev) => {
      if (prev.includes('all')) {
        return [seatIndexStr];
      }
      if (prev.includes(seatIndexStr)) {
        const filtered = prev.filter((s) => s !== seatIndexStr);
        return filtered.length > 0 ? filtered : ['all'];
      }
      const updated = [...prev, seatIndexStr];
      if (updated.length === presentSeats.length) {
        return ['all'];
      }
      return updated;
    });
  };

  const targetCount = isAllSelected ? presentSeats.length : selectedSeats.length;

  const getRecipientLabel = () => {
    if (isAllSelected) {
      if (presentSeats.length === 1) {
        return `${presentSeats[0].speakerUser?.name} (المقعد #${presentSeats[0].seatId})`;
      }
      return `جميع الحاضرين (${presentSeats.length} أعضاء) 🎙️`;
    }
    if (selectedSeats.length === 1) {
      const targetIndex = selectedSeats[0];
      const seatObj = presentSeats.find((s) => String(s.seatId) === targetIndex);
      const speakerName = seatObj?.speakerUser?.name;
      return speakerName ? `${speakerName} (المقعد #${targetIndex})` : `المقعد #${targetIndex}`;
    }
    const names = selectedSeats.map((sNum) => {
      const seatObj = presentSeats.find((s) => String(s.seatId) === sNum);
      return seatObj?.speakerUser?.name || `#${sNum}`;
    });
    return names.join('، ');
  };

  // Unit & Total Cost in Yellow Golden Coins 🪙
  const unitCostCoins = selectedGift.priceCoins || selectedGift.priceDiamonds || 10;
  const totalCostCoins = unitCostCoins * multiplier * targetCount;
  const hasSufficientCoins = user.coins >= totalCostCoins;

  const handleSend = () => {
    if (!hasSufficientCoins) {
      setToastMessage(`⚠️ رصيدك الحالي (${user.coins.toLocaleString()} 🪙) لا يكفي لخصم (${totalCostCoins.toLocaleString()} 🪙). يرجى الشحن أولاً!`);
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    // 1. Deduct Yellow Golden Coins from Sender
    if (onUpdateCoins) {
      onUpdateCoins(-totalCostCoins);
    }

    // 2. Add Host Bonus Diamonds & Wealth XP
    const addedXp = totalCostCoins;
    const newXp = (user.wealthXp || 45200) + addedXp;
    const newLevel = Math.floor(newXp / 2000) + 1;

    if (onUpdateUserBalance) {
      onUpdateUserBalance(user.diamonds, newXp, newLevel);
    }

    const recipientLabel = getRecipientLabel();

    // Check if this is a Lucky Gift with instant cashback reward
    let luckyReward: LuckyRewardResult | undefined = undefined;
    if (selectedGift.category === 'lucky') {
      luckyReward = calculateLuckyReward(totalCostCoins);
      if (luckyReward.wonCoins > 0 && onUpdateCoins) {
        onUpdateCoins(luckyReward.wonCoins);
      }
    }

    onSendGift(selectedGift, recipientLabel, multiplier, luckyReward);
    // Immediately close gift box as requested so user sees stage and quick combo circle
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px] flex items-end justify-center p-0 sm:p-2 animate-in fade-in duration-200 dir-rtl font-sans">
      {/* Click outside to close modal */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="w-full max-w-md bg-[#181524]/95 backdrop-blur-xl border-t border-[#3e335d] rounded-t-3xl sm:rounded-3xl p-3 sm:p-4 space-y-3 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden text-right text-white">
        
        {/* Toast Alert Notice */}
        {toastMessage && (
          <div className="absolute top-2 left-3 right-3 z-30 bg-gradient-to-r from-amber-500 via-purple-600 to-pink-600 text-white font-bold text-xs px-3 py-2 rounded-2xl shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-amber-200 hover:text-white mr-1 font-mono">✕</button>
          </div>
        )}

        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="absolute top-2 left-3 z-20 text-slate-400 hover:text-white p-1 rounded-full bg-slate-900/60 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. ROOM LEVEL HEADER */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-amber-500/20">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500 shadow"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold">
            <p className="text-amber-300 font-medium text-[10px]">
              <span className="text-amber-400 font-black">+{currentLevelXp} نقطة دعم.</span> باقي {xpNeeded} نقطة للترقية للمستوى <span className="font-mono text-amber-300">lv15</span>
            </p>

            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 px-2.5 py-0.5 rounded-full shadow border border-amber-300/40 shrink-0 font-black">
              <span className="font-mono text-xs">{roomSupportLevel}</span>
              <span className="text-[10px]">🪙</span>
            </div>
          </div>
        </div>

        {/* 2. QUICK SEAT SELECTION BAR - ONLY OCCUPIED SEATS / PRESENT GUESTS */}
        <div className="flex flex-col gap-1.5 py-1 border-b border-[#292240] w-full min-w-0">
          <div className="flex items-center justify-between text-[10px] text-slate-300 font-bold px-1">
            <span>المستهدف بالهدية ({presentSeats.length} شخص حاضر):</span>
            <span className="text-amber-300 font-bold truncate max-w-[200px]">{getRecipientLabel()}</span>
          </div>

          <div className="flex items-center gap-2 w-full min-w-0">
            <button
              onClick={() => handleToggleSeat('all')}
              className={`px-3.5 py-1.5 rounded-full font-black text-xs shrink-0 transition-all cursor-pointer ${
                isAllSelected
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-900/60 scale-105 ring-2 ring-amber-300'
                  : 'bg-[#28213f] text-slate-300 hover:bg-[#342b52]'
              }`}
            >
              الكل ({presentSeats.length})
            </button>

            <div
              className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 min-w-0 flex-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {presentSeats.map((seat) => {
                const seatNum = seat.seatId;
                const seatNumStr = String(seatNum);
                const isItemTargeted = isAllSelected || selectedSeats.includes(seatNumStr);
                const userObj = seat.speakerUser!;

                return (
                  <div
                    key={seatNum}
                    onClick={() => handleToggleSeat(seatNumStr)}
                    className="relative flex flex-col items-center shrink-0 cursor-pointer group"
                  >
                    {isItemTargeted && (
                      <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center font-black text-[9px] z-20 shadow-md border border-slate-900 animate-in zoom-in">
                        ✓
                      </span>
                    )}

                    <div
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                        isItemTargeted
                          ? 'border-amber-400 ring-2 ring-amber-500 scale-105 shadow-md opacity-100'
                          : 'border-slate-700 opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={userObj.avatar}
                        alt={userObj.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex items-center gap-1 -mt-2 z-10">
                      <span
                        className={`text-[8px] font-mono font-black px-1.5 py-0.2 rounded-full border transition-colors ${
                          isItemTargeted
                            ? 'bg-amber-500 text-slate-950 border-amber-300'
                            : 'bg-slate-950 text-white border-slate-700'
                        }`}
                      >
                        #{seatNum}
                      </span>
                    </div>

                    <span className="text-[9px] font-bold text-slate-200 mt-0.5 line-clamp-1 max-w-[50px] text-center">
                      {userObj.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. CATEGORY TABS BAR */}
        <div className="flex items-center justify-between gap-2 border-b border-[#251f3b] pb-1 w-full min-w-0">
          <button
            onClick={() => setToastMessage('🎒 الحقيبة والمخزون الشخصي فارغ حالياً')}
            className="p-1.5 rounded-xl bg-[#201936] border border-slate-700 text-slate-300 hover:text-white shrink-0 cursor-pointer"
            title="المخزون"
          >
            <Package className="w-4 h-4" />
          </button>

          <div
            className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5 text-xs font-bold min-w-0 flex-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[
              { key: 'gift', label: 'هدايا الشعبية 🪙' },
              { key: 'lucky', label: 'محظوظ 🍀' },
              { key: 'cp', label: 'CP ❤️' },
              { key: 'birthday', label: 'أعياد الميلاد' },
              { key: 'svip', label: 'نادي SVIP 👑' },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-2 py-0.5 whitespace-nowrap rounded-lg transition-all relative shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-amber-300 font-black text-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lucky Category Reward Announcement Header */}
        {activeTab === 'lucky' && (
          <div className="bg-gradient-to-r from-emerald-950/90 via-amber-950/90 to-purple-950/90 border border-amber-400/60 rounded-2xl p-2.5 flex items-center justify-between text-xs shadow-inner animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-bounce">🎰</span>
              <div>
                <p className="font-black text-amber-300 text-[11px] flex items-center gap-1">
                  <span>هدايا الحظ والمردود السريع</span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[8px] font-mono px-1.5 py-0.2 rounded-full">LUCKY WIN</span>
                </p>
                <p className="text-[9px] text-slate-300">فرصة الفوز بمردود فوري يصل إلى <span className="text-amber-400 font-black font-mono">500x</span> ضعف! 🔥</p>
              </div>
            </div>
            <div className="bg-amber-500/20 border border-amber-400/40 px-2 py-1 rounded-xl text-[9px] font-black text-amber-300 font-mono shadow-inner text-center">
              <div>RTP 72%</div>
              <div className="text-[7.5px] text-slate-400 font-normal">مردود عالي</div>
            </div>
          </div>
        )}

        {/* 4. GIFTS GRID DISPLAY (Prices strictly in Yellow Golden Coins 🪙) */}
        <div
          className="grid grid-cols-4 gap-2.5 max-h-[280px] overflow-y-auto no-scrollbar p-1 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredGifts.map((gift) => {
            const isSelected = selectedGift.id === gift.id;
            const coinPrice = gift.priceCoins || gift.priceDiamonds || 10;
            const canAfford = user.coins >= coinPrice * multiplier;

            return (
              <div
                key={gift.id}
                onClick={() => setSelectedGift(gift)}
                className={`relative flex flex-col items-center justify-between p-2 rounded-2xl transition-all cursor-pointer group border ${
                  isSelected
                    ? 'bg-[#2d2258] border-amber-400 shadow-xl shadow-amber-950/50 scale-[1.02]'
                    : 'bg-[#1e1933]/90 border-[#2b2344] hover:bg-[#251e3f]'
                }`}
              >
                {/* Badge Tag */}
                {gift.badge && (
                  <span
                    className={`absolute top-1 right-1 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full shadow ${
                      gift.badge.includes('Fake')
                        ? 'bg-pink-600'
                        : gift.badge.includes('VIP')
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-amber-600'
                    }`}
                  >
                    {gift.badge}
                  </span>
                )}

                {/* Icon Graphic (Image PNG or Emoji) */}
                <div className="w-12 h-12 flex items-center justify-center text-3xl my-1 group-hover:scale-110 transition-transform">
                  {gift.iconUrl || gift.icon?.startsWith('/') || gift.icon?.startsWith('http') ? (
                    <img
                      src={gift.iconUrl || gift.icon}
                      alt={gift.name}
                      className="w-full h-full object-contain drop-shadow-md"
                    />
                  ) : (
                    <span>{gift.icon}</span>
                  )}
                </div>

                {/* Gift Name */}
                <span className="text-[10px] font-bold text-slate-100 text-center line-clamp-1 leading-tight">
                  {gift.name}
                </span>

                {/* Yellow Golden Coins Price 🪙 */}
                <div className="flex items-center gap-1 text-[10px] font-black mt-1">
                  <span className="text-[10px]">🪙</span>
                  <span className={`font-mono ${canAfford ? 'text-amber-400' : 'text-rose-400'}`}>
                    {coinPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5. BOTTOM NAVIGATION BAR */}
        <div className="pt-2 border-t border-[#292242] flex items-center justify-between gap-2">
          
          {/* Left: Final Send Button */}
          {hasSufficientCoins ? (
            <button
              onClick={handleSend}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/60 hover:brightness-110 active:scale-95 transition-all cursor-pointer border border-white/40"
            >
              إرسال الهدية
            </button>
          ) : (
            <button
              onClick={onOpenRecharge}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-xs shadow-lg flex items-center gap-1 animate-pulse hover:brightness-110 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>شحن سريع ⚡</span>
            </button>
          )}

          {/* Center: Multiplier Combos */}
          <div className="flex items-center gap-1 bg-[#151124] p-1 rounded-full border border-[#2e2646] overflow-x-auto no-scrollbar">
            {[1, 10, 66, 99, 520, 1314].map((val) => (
              <button
                key={val}
                onClick={() => setMultiplier(val)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer shrink-0 ${
                  multiplier === val
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-900/60 scale-105'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                x{val}
              </button>
            ))}
          </div>

          {/* Right: User Yellow Golden Coins Balance 🪙 with '+' recharge button */}
          <div
            onClick={onOpenRecharge}
            className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full shadow cursor-pointer hover:bg-amber-500/30 transition-colors"
            title="رصيد العملات الصفراء المتاح بالشراء واللعب"
          >
            <span className="text-xs">🪙</span>
            <span className="text-xs font-mono font-black">{user.coins.toLocaleString()}</span>
            <button className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[10px] mr-0.5">
              <Plus className="w-3 h-3" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
