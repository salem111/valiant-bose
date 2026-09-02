import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Crown,
  Car,
  Award,
  Gift,
  Radio,
  MessageSquare,
  Image as ImageIcon,
  Home,
  Volume2,
  Flame,
  Ticket,
  Search,
  Check,
  Eye,
  Clock,
  Zap,
  Star,
  ChevronRight,
  Filter,
  ShieldCheck,
  Smile,
  Layers,
  Heart,
  Palette
} from 'lucide-react';
import { UserProfile } from '../../types';
import { AvatarWithFrame } from '../AvatarWithFrame';
import { getBackpackFrameItems } from '../../utils/framesRegistry';
import { equipInventoryItemInFirebase } from '../../lib/firebase';
import { LuxuryEntranceOverlay, EntranceData } from '../room/LuxuryEntranceOverlay';

export interface InventoryItem {
  id: string;
  name: string;
  category:
    | 'entrances'
    | 'frames'
    | 'badges'
    | 'titles'
    | 'gifts'
    | 'effects'
    | 'mic_auras'
    | 'crowns'
    | 'bubbles'
    | 'wallpapers'
    | 'room_decor'
    | 'sound_fx'
    | 'reactions'
    | 'coupons';
  categoryLabel: string;
  image: string;
  icon?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  rarityStars: number;
  rarityLabel: string;
  quantity?: number;
  expiresIn?: string; // 'دائم' or 'باقي 14 يوم'
  valueCoins?: number;
  description: string;
  isEquipped?: boolean;
  colorTheme?: string;
  previewType?: 'avatar' | 'ride' | 'bubble' | 'sound' | 'room';
}

interface BackpackModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
  onOpenStore?: () => void;
}

export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  // 1. الدخوليات والمراكب الفاخرة (Entrances, Jets & Rides)
  {
    id: 'ent_royal_jet',
    name: 'طائرة VIP النفاثة الملكية ✈️',
    category: 'entrances',
    categoryLabel: 'الدخوليات',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
    icon: '✈️',
    rarity: 'mythic',
    rarityStars: 5,
    rarityLabel: 'أسطوري فائق',
    expiresIn: 'دائم',
    description: 'طائرة نفاثة خاصة تحلق فوق الغرفة مع خطوط دخان نفاثة وأصوات هدير محركات وهبوط ملكي فاخر.',
    colorTheme: 'from-cyan-400 via-blue-500 to-indigo-600',
    previewType: 'ride',
  },
  {
    id: 'ent_lambo',
    name: 'لامبورغيني الملكية الذهبية 🏎️',
    category: 'entrances',
    categoryLabel: 'الدخوليات',
    image: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=400',
    icon: '🏎️',
    rarity: 'mythic',
    rarityStars: 5,
    rarityLabel: 'أسطوري فائق',
    expiresIn: 'دائم',
    description: 'موكب سيارة لامبورغيني ذهبية مع أصوات تسارع محرك V12 وشرارات لهب تحت العجلات عند دخول الغرفة.',
    colorTheme: 'from-amber-500 to-yellow-300',
    previewType: 'ride',
  },
  {
    id: 'car_ferrari',
    name: 'فيراري SF90 نيون 🏎️',
    category: 'entrances',
    categoryLabel: 'الدخوليات',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400',
    icon: '🏎️',
    rarity: 'legendary',
    rarityStars: 5,
    rarityLabel: 'أسطوري',
    expiresIn: 'دائم',
    description: 'سيارة فيراري حمراء سريعة جداً مع إضاءات نيون ساطعة وانعكاسات ضوئية على شاشة الغرفة.',
    colorTheme: 'from-rose-600 via-red-500 to-amber-500',
    previewType: 'ride',
  },
  {
    id: 'ent_dragon',
    name: 'التنين الناري المتوهج 🐉',
    category: 'entrances',
    categoryLabel: 'الدخوليات',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400',
    icon: '🐉',
    rarity: 'legendary',
    rarityStars: 5,
    rarityLabel: 'أسطوري',
    expiresIn: 'دائم',
    description: 'تنين ناري عملاق ينفث اللهب المقدس ويطوف في سماء الغرفة مع زئير مهيب.',
    colorTheme: 'from-red-600 to-orange-500',
    previewType: 'ride',
  },
  {
    id: 'ent_helicopter',
    name: 'طائرة الهليكوبتر الرئاسية 🚁',
    category: 'entrances',
    categoryLabel: 'الدخوليات',
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400',
    icon: '🚁',
    rarity: 'legendary',
    rarityStars: 5,
    rarityLabel: 'أسطوري',
    expiresIn: 'باقي 30 يوم',
    description: 'طائرة مروحية تنفيذية بكشافات بحث ليلية وصوت مراوح قوية تعلن حضورك القيادي.',
    colorTheme: 'from-emerald-400 via-teal-500 to-cyan-600',
    previewType: 'ride',
  },
  {
    id: 'ent_space_ufo',
    name: 'مركبة الفضاء السايبر المستقبلية 🛸',
    category: 'entrances',
    categoryLabel: 'الدخوليات',
    image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400',
    icon: '🛸',
    rarity: 'mythic',
    rarityStars: 5,
    rarityLabel: 'أسطوري فائق',
    expiresIn: 'دائم',
    description: 'مركبة فضائية قادمة من المستقبل عبر بوابة انتقال كمية مع أشعة ليزر نيون براقة.',
    colorTheme: 'from-fuchsia-500 via-purple-600 to-cyan-400',
    previewType: 'ride',
  },
  {
    id: 'ent_rolls_royce',
    name: 'رولز رويس فانتوم الملكية 🚗',
    category: 'entrances',
    categoryLabel: 'الدخوليات',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400',
    icon: '🚗',
    rarity: 'mythic',
    rarityStars: 5,
    rarityLabel: 'أسطوري فائق',
    expiresIn: 'دائم',
    description: 'سيارة رولز رويس فارهة مع سقف النجوم المضيء وموسيقى ترحيب ملكية خاصة.',
    colorTheme: 'from-slate-200 via-amber-300 to-yellow-500',
    previewType: 'ride',
  },
  {
    id: 'ent_carpet',
    name: 'بساط الريح السحري الملكي 🧞',
    category: 'entrances',
    categoryLabel: 'الدخوليات',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
    icon: '🧞',
    rarity: 'epic',
    rarityStars: 4,
    rarityLabel: 'نادر جداً',
    expiresIn: 'دائم',
    description: 'دخولية عربية ساحرة مع سحب ملونة ونجوم متلألئة وفوانيس مضيئة.',
    colorTheme: 'from-purple-600 to-indigo-400',
    previewType: 'ride',
  },
  {
    id: 'ent_phoenix',
    name: 'طائر الفينيق الذهبي المتوهج 🦅',
    category: 'entrances',
    categoryLabel: 'الدخوليات',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400',
    icon: '🦅',
    rarity: 'legendary',
    rarityStars: 5,
    rarityLabel: 'أسطوري',
    expiresIn: 'باقي 25 يوم',
    description: 'طائر الفينيق الأسطوري يرفرف بأجنحة مذهبة مع انفجار ريش ناري مذهل.',
    colorTheme: 'from-amber-400 via-rose-500 to-purple-600',
    previewType: 'ride',
  },

  // 2. الإطارات (Frames)
  {
    id: 'frame_01',
    name: 'إطار الأسطورة الملكي 01 👑💎',
    category: 'frames',
    categoryLabel: 'الإطارات',
    image: '/assets/frames/frame_01.png',
    icon: '👑',
    rarity: 'mythic',
    rarityStars: 5,
    rarityLabel: 'أسطوري فائق',
    expiresIn: 'دائم',
    description: 'إطار ملكي فاخر مخصص من مجلد الإطارات، يحيط بالصورة الشخصية بتصميم متقن ولمعان ملكي استثنائي.',
    colorTheme: 'from-amber-400 via-yellow-300 to-rose-500',
    previewType: 'avatar',
  },
  {
    id: 'frm_imperial',
    name: 'إطار الإمبراطور الذهبي 👑',
    category: 'frames',
    categoryLabel: 'الإطارات',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300',
    icon: '👑',
    rarity: 'mythic',
    rarityStars: 5,
    rarityLabel: 'أسطوري ملكي',
    expiresIn: 'دائم',
    description: 'إطار مرصع بالذهب الخالص والياقوت الأحمر يحيط بالصورة الشخصية مع بريق متحرك.',
    colorTheme: 'from-amber-400 to-yellow-600',
    previewType: 'avatar',
  },
  {
    id: 'frm_cyber_neon',
    name: 'إطار السايبر نيون المتوهج ⚡',
    category: 'frames',
    categoryLabel: 'الإطارات',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300',
    icon: '⚡',
    rarity: 'epic',
    rarityStars: 4,
    rarityLabel: 'نادر جداً',
    expiresIn: 'باقي 15 يوم',
    description: 'حلقات نيون بنفسجية وزرقاء نابضة بالكهرباء تدور حول صورتك.',
    colorTheme: 'from-cyan-400 to-purple-600',
    previewType: 'avatar',
  },
  {
    id: 'frm_flame_wings',
    name: 'إطار أجنحة اللهب الملكية 🔥',
    category: 'frames',
    categoryLabel: 'الإطارات',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300',
    icon: '🔥',
    rarity: 'legendary',
    rarityStars: 5,
    rarityLabel: 'أسطوري',
    expiresIn: 'دائم',
    description: 'أجنحة نار مشتعلة ترتفع خلف الصورة الشخصية وتشع حرارة وفخامة.',
    colorTheme: 'from-rose-500 to-amber-500',
    previewType: 'avatar',
  },

  // 3. الشارات (Badges)
  {
    id: 'bdg_owner_royal',
    name: 'شارة المالك الإمبراطوري 👑',
    category: 'badges',
    categoryLabel: 'الشارات',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300',
    icon: '👑',
    rarity: 'mythic',
    rarityStars: 5,
    rarityLabel: 'أسطوري',
    expiresIn: 'دائم',
    description: 'شارة رسمية تثبت ملكية الغرف وإدارة المنصة.',
    colorTheme: 'from-amber-400 to-yellow-500',
  },
  {
    id: 'bdg_svip',
    name: 'شارة كبار الشخصيات SVIP 💎',
    category: 'badges',
    categoryLabel: 'الشارات',
    image: 'https://images.unsplash.com/photo-1515260268569-9271009adfdb?w=300',
    icon: '💎',
    rarity: 'legendary',
    rarityStars: 5,
    rarityLabel: 'أسطوري',
    expiresIn: 'باقي 30 يوم',
    description: 'شارة خاصة بأعضاء نادي الصفوة والمشتركين المميزين.',
    colorTheme: 'from-cyan-400 to-blue-600',
  },
  {
    id: 'bdg_top_supporter',
    name: 'شارة داعم المليون 🏆',
    category: 'badges',
    categoryLabel: 'الشارات',
    image: 'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=300',
    icon: '🏆',
    rarity: 'epic',
    rarityStars: 4,
    rarityLabel: 'نادر جداً',
    expiresIn: 'دائم',
    description: 'تمنح لأصحاب الدعم السخي في الغرف والفعاليات.',
    colorTheme: 'from-purple-500 to-pink-500',
  },

  // 4. الألقاب (Titles)
  {
    id: 'ttl_legend',
    name: 'لقب: أسطورة SALEEM ⚡',
    category: 'titles',
    categoryLabel: 'الألقاب',
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300',
    icon: '⚡',
    rarity: 'mythic',
    rarityStars: 5,
    rarityLabel: 'أسطوري',
    expiresIn: 'دائم',
    description: 'يظهر هذا اللقب البراق بجانب اسمك في كل مكان داخل الغرفة والملف الشخصي.',
    colorTheme: 'from-amber-400 via-rose-500 to-purple-600',
  },
  {
    id: 'ttl_vip_royal',
    name: 'لقب: VIP الملكي 💎',
    category: 'titles',
    categoryLabel: 'الألقاب',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300',
    icon: '💎',
    rarity: 'legendary',
    rarityStars: 5,
    rarityLabel: 'أسطوري',
    expiresIn: 'دائم',
    description: 'لقب ذهبي متألق يمنحك هيبة وحضوراً بين جميع الحاضرين.',
    colorTheme: 'from-cyan-400 to-amber-300',
  },
  {
    id: 'ttl_influencer',
    name: 'لقب: المؤثر الذهبي ⭐',
    category: 'titles',
    categoryLabel: 'الألقاب',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300',
    icon: '⭐',
    rarity: 'epic',
    rarityStars: 4,
    rarityLabel: 'نادر',
    expiresIn: 'باقي 20 يوم',
    description: 'لقب مخصص لصناع المحتوى وأصحاب الشعبية العالية.',
    colorTheme: 'from-yellow-400 to-orange-500',
  },

  // 5. الهدايا المخزنة (Stored Gifts)
  {
    id: 'gft_lion_royal',
    name: 'أسد الملوك الذهبي 🦁',
    category: 'gifts',
    categoryLabel: 'الهدايا',
    image: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=300',
    icon: '🦁',
    rarity: 'mythic',
    rarityStars: 5,
    rarityLabel: 'أسطوري',
    quantity: 2,
    valueCoins: 50000,
    description: 'هدية أسطورية نادرة جداً يمكنك إرسالها لأي صديق أو استبدالها برصيد ماسات.',
    colorTheme: 'from-amber-400 to-yellow-600',
  },
  {
    id: 'gft_castle',
    name: 'قصر الأحلام الملكي 🏰',
    category: 'gifts',
    categoryLabel: 'الهدايا',
    image: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=300',
    icon: '🏰',
    rarity: 'mythic',
    rarityStars: 5,
    rarityLabel: 'أسطوري',
    quantity: 1,
    valueCoins: 100000,
    description: 'أعلى وأفخم هدية في SALEEM تشمل عرض فيديو سينمائي يغطي شاشة الغرفة.',
    colorTheme: 'from-purple-600 to-pink-500',
  },
  {
    id: 'gft_rocket',
    name: 'صاروخ الفضاء الذهبي 🚀',
    category: 'gifts',
    categoryLabel: 'الهدايا',
    image: 'https://images.unsplash.com/photo-1517976487507-5b3b4a450502?w=300',
    icon: '🚀',
    rarity: 'epic',
    rarityStars: 4,
    rarityLabel: 'نادر جداً',
    quantity: 5,
    valueCoins: 10000,
    description: 'هدية سريعة ومبهجة تطلق ألعاباً نارية في كل الغرفة.',
    colorTheme: 'from-blue-500 to-cyan-400',
  },

  // 6. مؤثرات وهالات المايك (Mic Auras & Waves)
  {
    id: 'eff_sound_wave_neon',
    name: 'موجات صوت النيون التفاعلية 🌊',
    category: 'mic_auras',
    categoryLabel: 'مؤثرات المايك',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300',
    icon: '🌊',
    rarity: 'legendary',
    rarityStars: 5,
    rarityLabel: 'أسطوري',
    expiresIn: 'دائم',
    description: 'تأثير أمواج نيون ملونة تنبض حول صورتك أثناء التحدث على المايك بحسب نبرة صوتك.',
    colorTheme: 'from-cyan-400 to-emerald-400',
  },
  {
    id: 'eff_fire_ring',
    name: 'خاتم النار المشتعل حول المايك 🔥',
    category: 'mic_auras',
    categoryLabel: 'مؤثرات المايك',
    image: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=300',
    icon: '🔥',
    rarity: 'epic',
    rarityStars: 4,
    rarityLabel: 'نادر',
    expiresIn: 'باقي 25 يوم',
    description: 'حلقة نار دوارة تشتعل كلما فتحت المايك وبدأت بالحديث.',
    colorTheme: 'from-orange-500 to-red-600',
  },

  // 7. التيجان والرتب (Crowns)
  {
    id: 'crw_ruby_emperor',
    name: 'تاج الإمبراطور المرصع بالياقوت 👑',
    category: 'crowns',
    categoryLabel: 'التيجان',
    image: 'https://images.unsplash.com/photo-1589271243958-d61e12b61b97?w=300',
    icon: '👑',
    rarity: 'mythic',
    rarityStars: 5,
    rarityLabel: 'أسطوري فائق',
    expiresIn: 'دائم',
    description: 'تاج ملكي ضخم يوضع فوق رأس الصورة الشخصية مع بريق ألماس ولمعان متحرك.',
    colorTheme: 'from-amber-400 via-rose-500 to-yellow-400',
  },
  {
    id: 'crw_star_celestial',
    name: 'تاج النجوم الخماسي المتلألئ ⭐',
    category: 'crowns',
    categoryLabel: 'التيجان',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300',
    icon: '⭐',
    rarity: 'epic',
    rarityStars: 4,
    rarityLabel: 'نادر',
    expiresIn: 'دائم',
    description: 'تاج من الكريستال والنجوم المتوهجة يعلو الأفاتار.',
    colorTheme: 'from-cyan-300 to-blue-500',
  },

  // 8. فقاعات الدردشة (Chat Bubbles)
  {
    id: 'bbl_gold_royal',
    name: 'فقاعة الذهب الإمبراطوري 💬',
    category: 'bubbles',
    categoryLabel: 'فقاعات الدردشة',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300',
    icon: '💬',
    rarity: 'legendary',
    rarityStars: 5,
    rarityLabel: 'أسطوري',
    expiresIn: 'دائم',
    description: 'فقاعة رسائل ذهبية متوهجة بحواف مرصعة بالنجوم تجعل رسائلك الأبرز في الشات.',
    colorTheme: 'from-amber-400 to-yellow-600',
    previewType: 'bubble',
  },
  {
    id: 'bbl_cyber_neon',
    name: 'فقاعة النيون البنفسجية 💜',
    category: 'bubbles',
    categoryLabel: 'فقاعات الدردشة',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300',
    icon: '💜',
    rarity: 'epic',
    rarityStars: 4,
    rarityLabel: 'نادر جداً',
    expiresIn: 'باقي 18 يوم',
    description: 'فقاعة محاطة بوهج أرجواني لامع وخطوط إلكترونية مضيئة.',
    colorTheme: 'from-purple-500 to-pink-500',
    previewType: 'bubble',
  },

  // 9. خلفيات الملف الشخصي (Profile Themes)
  {
    id: 'bg_royal_palace',
    name: 'خلفية القصر الملكي الليلي 🏰',
    category: 'wallpapers',
    categoryLabel: 'الخلفيات',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300',
    icon: '🏰',
    rarity: 'legendary',
    rarityStars: 5,
    rarityLabel: 'أسطوري',
    expiresIn: 'دائم',
    description: 'خلفية متحركة تزين بطاقة ملفك الشخصي وتظهر إطلالة قصر فاخر تحت ضوء القمر.',
    colorTheme: 'from-indigo-900 to-purple-950',
  },
  {
    id: 'bg_cosmic_nebula',
    name: 'خلفية السديم الكوني والمجرة 🌌',
    category: 'wallpapers',
    categoryLabel: 'الخلفيات',
    image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=300',
    icon: '🌌',
    rarity: 'epic',
    rarityStars: 4,
    rarityLabel: 'نادر',
    expiresIn: 'دائم',
    description: 'خلفية مجرات كونية وشهب تسبح في سماء بطاقتك الشخصية.',
    colorTheme: 'from-purple-900 via-slate-900 to-indigo-950',
  },

  // 10. ديكور الغرفة (Room Decor)
  {
    id: 'dcr_royal_stage',
    name: 'منصة المقاعد الملكية المضيئة 🏛️',
    category: 'room_decor',
    categoryLabel: 'ديكور الغرفة',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=300',
    icon: '🏛️',
    rarity: 'mythic',
    rarityStars: 5,
    rarityLabel: 'أسطوري',
    expiresIn: 'دائم',
    description: 'تصميم فاخر لمقاعد الغرفة الصوتية مع أرضية مضيئة وسجادة حمراء ملكية.',
    colorTheme: 'from-amber-500 to-rose-600',
  },
  {
    id: 'dcr_banner_vip',
    name: 'لافتة الترحيب المضيئة VIP 🎪',
    category: 'room_decor',
    categoryLabel: 'ديكور الغرفة',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300',
    icon: '🎪',
    rarity: 'epic',
    rarityStars: 4,
    rarityLabel: 'نادر',
    expiresIn: 'باقي 10 أيام',
    description: 'لافتة ترحيبية أعلى شاشة الغرفة ترحب بالزوار باسم صاحب الغرفة.',
    colorTheme: 'from-purple-500 to-cyan-400',
  },

  // 11. مؤثرات صوتية (Sound FX)
  {
    id: 'sfx_fanfare_royal',
    name: 'نغمة الدخول الإمبراطورية 🎺',
    category: 'sound_fx',
    categoryLabel: 'مؤثرات صوتية',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
    icon: '🎺',
    rarity: 'legendary',
    rarityStars: 5,
    rarityLabel: 'أسطوري',
    expiresIn: 'دائم',
    description: 'نغمة أبواق ملكية فخمة تعزف لمدة ثانيتين عند دخولك إلى أي غرفة صوتية.',
    colorTheme: 'from-amber-400 to-yellow-500',
    previewType: 'sound',
  },

  // 12. مؤثرات التفاعل (Reactions)
  {
    id: 'rec_meteor_storm',
    name: 'عاصفة الشهب والقلوب المتفجرة ❤️‍🔥',
    category: 'reactions',
    categoryLabel: 'مؤثرات التفاعل',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300',
    icon: '❤️‍🔥',
    rarity: 'epic',
    rarityStars: 4,
    rarityLabel: 'نادر جداً',
    expiresIn: 'دائم',
    description: 'مؤثر تفاعلي يملأ شاشة الغرفة بقلوب ونيران مشتعلة عند التفاعل في الشات.',
    colorTheme: 'from-rose-600 to-orange-500',
  },

  // 13. التذاكر والقسائم (Coupons & Tickets)
  {
    id: 'cpn_vip_7d',
    name: 'قسيمة اشتراك VIP لمدة 7 أيام 👑',
    category: 'coupons',
    categoryLabel: 'التذاكر والقسائم',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300',
    icon: '👑',
    rarity: 'legendary',
    rarityStars: 5,
    rarityLabel: 'أسطوري',
    quantity: 1,
    description: 'تمنحك مزايا VIP الكاملة مجاناً لمدة 7 أيام كاملة عند التفعيل.',
    colorTheme: 'from-amber-400 to-yellow-600',
  },
  {
    id: 'cpn_discount_50',
    name: 'قسيمة خصم 50% على متجر الهدايا 🎫',
    category: 'coupons',
    categoryLabel: 'التذاكر والقسائم',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300',
    icon: '🎫',
    rarity: 'epic',
    rarityStars: 4,
    rarityLabel: 'نادر',
    quantity: 2,
    description: 'تمنحك خصماً بنسبة 50% على أول هدية تشتريها من متجر الهدايا.',
    colorTheme: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'cpn_double_coins',
    name: 'كوبون مضاعفة كوينز الشحن x2 🎁',
    category: 'coupons',
    categoryLabel: 'التذاكر والقسائم',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300',
    icon: '🎁',
    rarity: 'mythic',
    rarityStars: 5,
    rarityLabel: 'أسطوري',
    quantity: 3,
    description: 'يضاعف عدد العملات الصفراء التي تشحنها مرتين مجاناً.',
    colorTheme: 'from-purple-500 to-pink-500',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: '🎒' },
  { id: 'entrances', label: 'الدخوليات', icon: '🎟️' },
  { id: 'frames', label: 'الإطارات', icon: '🖼️' },
  { id: 'badges', label: 'الشارات', icon: '✨' },
  { id: 'titles', label: 'الألقاب', icon: '🏷️' },
  { id: 'gifts', label: 'الهدايا', icon: '🎁' },
  { id: 'mic_auras', label: 'مؤثرات المايك', icon: '🎤' },
  { id: 'crowns', label: 'التيجان', icon: '👑' },
  { id: 'bubbles', label: 'فقاعات الدردشة', icon: '💬' },
  { id: 'wallpapers', label: 'الخلفيات', icon: '🎨' },
  { id: 'room_decor', label: 'ديكور الغرفة', icon: '🏠' },
  { id: 'sound_fx', label: 'مؤثرات صوتية', icon: '🎵' },
  { id: 'reactions', label: 'مؤثرات التفاعل', icon: '🔥' },
  { id: 'coupons', label: 'التذاكر والقسائم', icon: '🎫' },
];

export const BackpackModal: React.FC<BackpackModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUser,
  onOpenStore,
}) => {
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const dynamicFrames = getBackpackFrameItems();
    try {
      const saved = localStorage.getItem('saleem_user_inventory');
      if (saved) {
        const parsed: InventoryItem[] = JSON.parse(saved);
        // Merge dynamic frames so any newly added frame asset is always included
        const existingIds = new Set(parsed.map(i => i.id));
        const newFrames = dynamicFrames.filter(df => !existingIds.has(df.id));
        return [...newFrames, ...parsed];
      }
    } catch (e) {}
    // Filter out duplicate frame_01 from initial items if dynamic frames are loaded
    const initialNonFrames = INITIAL_INVENTORY_ITEMS.filter(i => i.category !== 'frames');
    return [...dynamicFrames, ...initialNonFrames];
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewItem, setPreviewItem] = useState<InventoryItem | null>(null);
  const [liveEntrancePreview, setLiveEntrancePreview] = useState<EntranceData | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Equipped State
  const [equippedItems, setEquippedItems] = useState<{
    frame: string;
    entrance: string;
    title: string;
    micAura: string;
    crown: string;
    bubble: string;
    wallpaper: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('saleem_equipped_items');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return {
      frame: 'frm_imperial',
      entrance: 'ent_lambo',
      title: 'ttl_legend',
      micAura: 'eff_sound_wave_neon',
      crown: 'crw_ruby_emperor',
      bubble: 'bbl_gold_royal',
      wallpaper: 'bg_royal_palace',
    };
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Handle Item Equip / Toggle
  const handleEquipItem = (item: InventoryItem) => {
    const isCurrentlyEquipped = isItemEquipped(item);

    let updatedEquipped = { ...equippedItems };

    if (item.category === 'frames') {
      updatedEquipped.frame = isCurrentlyEquipped ? '' : item.id;
    } else if (item.category === 'entrances') {
      updatedEquipped.entrance = isCurrentlyEquipped ? '' : item.id;
    } else if (item.category === 'titles') {
      updatedEquipped.title = isCurrentlyEquipped ? '' : item.id;
    } else if (item.category === 'mic_auras') {
      updatedEquipped.micAura = isCurrentlyEquipped ? '' : item.id;
    } else if (item.category === 'crowns') {
      updatedEquipped.crown = isCurrentlyEquipped ? '' : item.id;
    } else if (item.category === 'bubbles') {
      updatedEquipped.bubble = isCurrentlyEquipped ? '' : item.id;
    } else if (item.category === 'wallpapers') {
      updatedEquipped.wallpaper = isCurrentlyEquipped ? '' : item.id;
    } else if (item.category === 'coupons') {
      // Use coupon action
      showToast(`🎉 تم استخدام وتفعيل "${item.name}" بنجاح!`);
      return;
    } else if (item.category === 'gifts') {
      showToast(`🎁 لديك ${item.quantity || 1} من ${item.name} جاهزة للإهداء في الغرف الصوتية!`);
      return;
    }

    setEquippedItems(updatedEquipped);
    localStorage.setItem('saleem_equipped_items', JSON.stringify(updatedEquipped));

    // Sync equipment with Firebase Firestore & RTDB in real time
    if (user && user.id) {
      if (item.category === 'frames') {
        equipInventoryItemInFirebase(user.id, 'frame', updatedEquipped.frame || null);
      } else if (item.category === 'entrances') {
        equipInventoryItemInFirebase(user.id, 'entrance', updatedEquipped.entrance || null);
      } else if (item.category === 'titles' || item.category === 'crowns' || item.category === 'badges') {
        equipInventoryItemInFirebase(user.id, 'badge', updatedEquipped.title || updatedEquipped.crown || null);
      } else if (item.category === 'bubbles') {
        equipInventoryItemInFirebase(user.id, 'bubble', updatedEquipped.bubble || null);
      }
    }

    if (isCurrentlyEquipped) {
      showToast(`❌ تم إلغاء تجهيز ${item.name}`);
    } else {
      showToast(`✨ تم تجهيز وتفعيل ${item.name} بنجاح!`);
    }

    if (onUpdateUser) {
      onUpdateUser({
        equippedFrame: updatedEquipped.frame,
        equippedEntrance: updatedEquipped.entrance,
        equippedBadge: updatedEquipped.title || updatedEquipped.crown,
        equippedBubble: updatedEquipped.bubble,
        frameUrl: item.category === 'frames' ? (isCurrentlyEquipped ? '' : (item.image || '')) : user.frameUrl,
        role: updatedEquipped.title ? (item.name.replace('لقب: ', '') as any) : user.role,
      });
    }
  };

  const isItemEquipped = (item: InventoryItem) => {
    if (item.category === 'frames') return equippedItems.frame === item.id;
    if (item.category === 'entrances') return equippedItems.entrance === item.id;
    if (item.category === 'titles') return equippedItems.title === item.id;
    if (item.category === 'mic_auras') return equippedItems.micAura === item.id;
    if (item.category === 'crowns') return equippedItems.crown === item.id;
    if (item.category === 'bubbles') return equippedItems.bubble === item.id;
    if (item.category === 'wallpapers') return equippedItems.wallpaper === item.id;
    return false;
  };

  // Find Currently Equipped Item Objects for the top bar
  const equippedFrameObj = items.find((i) => i.id === equippedItems.frame);
  const equippedEntranceObj = items.find((i) => i.id === equippedItems.entrance);
  const equippedTitleObj = items.find((i) => i.id === equippedItems.title);
  const equippedMicAuraObj = items.find((i) => i.id === equippedItems.micAura);
  const equippedCrownObj = items.find((i) => i.id === equippedItems.crown);
  const equippedBubbleObj = items.find((i) => i.id === equippedItems.bubble);

  // Filtered List
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 dir-rtl text-white font-sans animate-in fade-in duration-200">
      
      {/* Main Backpack Container */}
      <div className="bg-gradient-to-b from-[#181126] via-[#121622] to-[#0d1017] border-2 border-purple-500/50 rounded-3xl w-full max-w-2xl max-h-[94vh] flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.25)] overflow-hidden">
        
        {/* 1. TOP HEADER */}
        <div className="shrink-0 bg-slate-900/90 border-b border-purple-900/50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-0.5 shadow-lg shadow-purple-900/40 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl">
                🎒
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide">حقيبتي ومستودع المقتنيات</h2>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {items.length} قطعة
                </span>
              </div>
              <p className="text-[11px] text-purple-300/80">إدارة وتجهيز كافة الدخوليات، الإطارات، التيجان والمقتنيات</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenStore && (
              <button
                onClick={onOpenStore}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>متجر المقتنيات</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST MESSAGE POPUP */}
        {toastMsg && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-purple-900 via-slate-900 to-amber-900 border-2 border-amber-400/80 text-amber-200 px-4 py-2 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top duration-200">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* 2. CURRENTLY EQUIPPED SUMMARY BAR (المقتنيات المستخدمة حالياً) */}
        <div className="shrink-0 bg-gradient-to-r from-purple-950/70 via-slate-950 to-indigo-950/70 border-b border-purple-800/40 px-4 py-2.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>المقتنيات والتجهيزات المفعّلة حالياً:</span>
            </span>
            <span className="text-[10px] text-purple-300 font-mono">تظهر في الغرف والشات فوراً</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center">
            {/* 1. Frame */}
            <div className="bg-slate-900/90 border border-purple-500/40 p-1.5 rounded-xl flex flex-col items-center">
              <span className="text-[9px] text-slate-400 block mb-0.5">🖼️ الإطار</span>
              <span className="text-[10px] font-bold text-amber-300 truncate w-full px-1">
                {equippedFrameObj ? equippedFrameObj.name.split(' ')[0] : 'غير محدد'}
              </span>
            </div>

            {/* 2. Entrance */}
            <div className="bg-slate-900/90 border border-purple-500/40 p-1.5 rounded-xl flex flex-col items-center">
              <span className="text-[9px] text-slate-400 block mb-0.5">🎟️ الدخولية</span>
              <span className="text-[10px] font-bold text-amber-300 truncate w-full px-1">
                {equippedEntranceObj ? equippedEntranceObj.name.split(' ')[0] : 'عادي'}
              </span>
            </div>

            {/* 3. Title */}
            <div className="bg-slate-900/90 border border-purple-500/40 p-1.5 rounded-xl flex flex-col items-center">
              <span className="text-[9px] text-slate-400 block mb-0.5">🏷️ اللقب</span>
              <span className="text-[10px] font-bold text-amber-300 truncate w-full px-1">
                {equippedTitleObj ? equippedTitleObj.name.replace('لقب: ', '').split(' ')[0] : 'عضو'}
              </span>
            </div>

            {/* 4. Mic Aura */}
            <div className="bg-slate-900/90 border border-purple-500/40 p-1.5 rounded-xl flex flex-col items-center">
              <span className="text-[9px] text-slate-400 block mb-0.5">🎤 المايك</span>
              <span className="text-[10px] font-bold text-amber-300 truncate w-full px-1">
                {equippedMicAuraObj ? equippedMicAuraObj.name.split(' ')[0] : 'عادي'}
              </span>
            </div>

            {/* 5. Crown */}
            <div className="bg-slate-900/90 border border-purple-500/40 p-1.5 rounded-xl flex flex-col items-center">
              <span className="text-[9px] text-slate-400 block mb-0.5">👑 التاج</span>
              <span className="text-[10px] font-bold text-amber-300 truncate w-full px-1">
                {equippedCrownObj ? equippedCrownObj.name.split(' ')[0] : 'بدون تاج'}
              </span>
            </div>

            {/* 6. Chat Bubble */}
            <div className="bg-slate-900/90 border border-purple-500/40 p-1.5 rounded-xl flex flex-col items-center">
              <span className="text-[9px] text-slate-400 block mb-0.5">💬 الفقاعة</span>
              <span className="text-[10px] font-bold text-amber-300 truncate w-full px-1">
                {equippedBubbleObj ? equippedBubbleObj.name.split(' ')[0] : 'عادي'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. SEARCH & HORIZONTAL CATEGORY SCROLLER */}
        <div className="shrink-0 bg-slate-950/90 px-3 py-2 space-y-2 border-b border-slate-800">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث في الحقيبة (الاسم، الندرة، التصنيف)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-purple-900/60 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Horizontal Categories Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {CATEGORIES.map((cat) => {
              const count = cat.id === 'all' ? items.length : items.filter((i) => i.category === cat.id).length;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/50 border border-purple-400/60 scale-102'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. INVENTORY ITEMS GRID */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 no-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-900 border border-purple-900/50 flex items-center justify-center text-3xl">
                🎒
              </div>
              <p className="text-sm font-bold text-slate-300">لا توجد مقتنيات مطابقة في الحقيبة</p>
              <p className="text-xs text-slate-500">جرب البحث بكلمة أخرى أو تصفح متجر المقتنيات لإضافة قطع جديدة.</p>
              {onOpenStore && (
                <button
                  onClick={onOpenStore}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-amber-500 text-white font-black text-xs rounded-xl shadow mt-2 cursor-pointer"
                >
                  الذهاب إلى متجر المقتنيات ✨
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredItems.map((item) => {
                const equipped = isItemEquipped(item);

                return (
                  <div
                    key={item.id}
                    className={`relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border transition-all hover:scale-101 flex flex-col justify-between p-3.5 shadow-xl ${
                      equipped
                        ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'border-slate-800 hover:border-purple-500/60'
                    }`}
                  >
                    {/* Top Badges: Category & Rarity */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-purple-300 bg-purple-950/80 border border-purple-800/60 px-2 py-0.5 rounded-full">
                        {item.categoryLabel}
                      </span>

                      <div className="flex items-center gap-1 bg-slate-950 border border-amber-500/40 px-2 py-0.5 rounded-full">
                        <span className="text-[10px] font-extrabold text-amber-300">{item.rarityLabel}</span>
                        <div className="flex text-amber-400 text-[9px]">
                          {Array.from({ length: item.rarityStars }).map((_, idx) => (
                            <span key={idx}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Central Item Display & Image */}
                    <div className="my-2 flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80">
                      {/* Avatar preview simulation for frames */}
                      {item.category === 'frames' ? (
                        <AvatarWithFrame
                          avatarUrl={user.avatar}
                          frameUrl={item.image || '/assets/frames/frame_01.png'}
                          customSizeClass="w-16 h-16"
                          avatarScalePercent={70}
                        />
                      ) : (
                        <div className="relative w-14 h-14 shrink-0 rounded-2xl overflow-hidden border border-purple-500/40 bg-slate-900">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {item.icon && (
                            <span className="absolute bottom-1 right-1 text-base drop-shadow">
                              {item.icon}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-xs text-white truncate">{item.name}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="flex items-center gap-2 mt-1 text-[10px]">
                          {item.quantity !== undefined ? (
                            <span className="text-cyan-300 font-bold font-mono">الكمية: {item.quantity}</span>
                          ) : (
                            <span className="text-amber-300 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>{item.expiresIn || 'دائم'}</span>
                            </span>
                          )}
                          {item.valueCoins && (
                            <span className="text-amber-400 font-bold font-mono">
                              {item.valueCoins.toLocaleString()} 🪙
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions: Preview & Equip Button */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                      {/* Live Preview Button */}
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 flex items-center justify-center cursor-pointer border border-slate-700"
                        title="معاينة حية للمقتنى"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Equip / Use Button */}
                      <button
                        onClick={() => handleEquipItem(item)}
                        className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                          equipped
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/50'
                            : item.category === 'coupons'
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg'
                            : item.category === 'gifts'
                            ? 'bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white shadow-lg'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-950/50'
                        }`}
                      >
                        {equipped ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>مُجهّز ومُفعّل (انقر للإلغاء)</span>
                          </>
                        ) : item.category === 'coupons' ? (
                          <>
                            <Zap className="w-4 h-4 fill-current" />
                            <span>استخدام القسيمة الآن</span>
                          </>
                        ) : item.category === 'gifts' ? (
                          <>
                            <Gift className="w-4 h-4" />
                            <span>إهداء في الغرفة</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>تجهيز واستخدام</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. LIVE PREVIEW MODAL */}
        {previewItem && (
          <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 dir-rtl text-right">
            <div className="bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950 border-2 border-amber-400/80 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
                  <Eye className="w-4 h-4" />
                  <span>معاينة حية: {previewItem.name}</span>
                </div>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Preview Canvas */}
              <div className="relative w-full h-48 rounded-2xl bg-slate-950 border border-purple-500/40 flex flex-col items-center justify-center p-4 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

                {previewItem.category === 'frames' ? (
                  <AvatarWithFrame
                    avatarUrl={user.avatar}
                    frameUrl={previewItem.image || '/assets/frames/frame_01.png'}
                    customSizeClass="w-36 h-36 sm:w-40 sm:h-40"
                    avatarScalePercent={70}
                  />
                ) : previewItem.category === 'crowns' ? (
                  <div className="relative w-24 h-24 rounded-full border-4 border-amber-400 p-1 shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-pulse">
                    <img src={user.avatar} className="w-full h-full rounded-full object-cover" />
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]">
                      👑
                    </span>
                  </div>
                ) : previewItem.category === 'bubbles' ? (
                  <div className="w-full max-w-[240px] bg-gradient-to-r from-amber-500/20 via-purple-900/60 to-slate-900 border-2 border-amber-400/80 p-3 rounded-2xl rounded-tr-none shadow-xl text-xs text-amber-200 font-bold space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-400">
                      <span>👑 {user.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono">الآن</span>
                    </div>
                    <p>أهلاً بكم جميعاً في غرفتي الصوتية على تطبيق SALEEM! 🎙️✨</p>
                  </div>
                ) : previewItem.category === 'entrances' ? (
                  <div className="text-center space-y-2 flex flex-col items-center">
                    <img
                      src={previewItem.image}
                      className="w-28 h-24 mx-auto rounded-2xl object-cover border-2 border-amber-400 shadow-xl"
                    />
                    <button
                      onClick={() => {
                        setLiveEntrancePreview({
                          id: `preview_${Date.now()}`,
                          userId: user.id,
                          userName: user.name,
                          userAvatar: user.avatar,
                          userFrame: equippedItems.frame || user.equippedFrame,
                          vipLevel: user.vipLevel || 5,
                          entranceId: previewItem.id,
                          entranceName: previewItem.name,
                          entranceIcon: previewItem.icon || '🚀',
                        });
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>تجربة ومحاكاة دخول الغرفة 🚀</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <img
                      src={previewItem.image}
                      className="w-24 h-24 mx-auto rounded-2xl object-cover border-2 border-amber-400 shadow-xl"
                    />
                    <p className="text-xs font-bold text-amber-300">{previewItem.name}</p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <p className="leading-relaxed">{previewItem.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400">الندرة:</span>
                  <span className="text-amber-300 font-bold">{previewItem.rarityLabel}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">فترة الصلاحية:</span>
                  <span className="text-cyan-300 font-bold">{previewItem.expiresIn || 'دائم'}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  handleEquipItem(previewItem);
                  setPreviewItem(null);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer"
              >
                {isItemEquipped(previewItem) ? 'إلغاء التجهيز' : 'تجهيز واستخدام هذا المقتنى الآن ✨'}
              </button>
            </div>
          </div>
        )}

        {/* 6. REAL-TIME LIVE LUXURY ENTRANCE OVERLAY SIMULATION */}
        <LuxuryEntranceOverlay
          entrance={liveEntrancePreview}
          onComplete={() => setLiveEntrancePreview(null)}
        />

      </div>
    </div>
  );
};
