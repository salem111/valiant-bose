import { FRAME_PNG_URLS } from './mockData';

export interface AvatarFrame {
  id: string;
  name: string;
  rarity: 'SSR' | 'SR' | 'R' | 'VIP';
  description: string;
  badge?: string;
  duration: string;
  priceCoins?: number;
  unlocked: boolean;
  glowColor: string; // e.g. rgba(245, 158, 11, 0.6)
  borderColor: string;
  type:
    | 'purple_emperor'
    | 'imperial'
    | 'flame'
    | 'dragon'
    | 'crown'
    | 'neon'
    | 'galaxy'
    | 'diamond'
    | 'sakura'
    | 'emerald'
    | 'phoenix'
    | 'valkyrie'
    | 'demon'
    | 'frost'
    | 'celestial'
    | 'gundam'
    | 'ruby'
    | 'sultan'
    | 'vortex'
    | 'golden_dragon_head'
    | 'cosmic_dragon_sc89'
    | 'wings_gold_ruby'
    | 'ruby_king_wings'
    | 'sapphire_shield_wings'
    | 'emerald_crest_wings'
    | 'heart';
  frameImgUrl?: string; // Optional custom transparent frame image
  frameScale?: number; // Custom scale percentage for PNG frames
  frameOffsetTop?: string; // Custom top offset (e.g. '50%')
  frameOffsetLeft?: string; // Custom left offset (e.g. '50%')
}

export const RAW_AVATAR_FRAMES: Omit<AvatarFrame, 'frameImgUrl'>[] = [
  {
    id: 'frame_royal_gold_crown',
    name: 'إطار التاج الملكي الذهبي الفاخر 👑💎',
    rarity: 'SSR',
    description: 'إطار ملكي فاخر ثلاثي الأبعاد مرصع بالألماس والياقوت مع تاج إمبراطوري متوهج',
    badge: 'التاج الملكي 👑',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(245, 158, 11, 0.95)',
    borderColor: '#f59e0b',
    type: 'crown',
  },
  {
    id: 'frame_cyber_neon',
    name: 'إطار السايبربانك النيون ⚡🔮',
    rarity: 'SSR',
    description: 'إطار تكنولوجي مستقبلي مشع بألوان النيون والأزرق الفضائي',
    badge: 'سايبر نيون ⚡',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(6, 182, 212, 0.95)',
    borderColor: '#06b6d4',
    type: 'neon',
  },
  {
    id: 'frame_fire_dragon',
    name: 'إطار التنين الناري الأسطوري 🔥🐉',
    rarity: 'SSR',
    description: 'إطار ناري ملحمي بأجنحة التنين وتوهج اللهب البركاني',
    badge: 'لهب التنين 🔥',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(239, 68, 68, 0.95)',
    borderColor: '#ef4444',
    type: 'dragon',
  },
  {
    id: 'frame_emperor_crown',
    name: 'إطار تاج الإمبراطور والياقوت الملكي 👑💎',
    rarity: 'SSR',
    description: 'تاج ذهبي إمبراطوري مرصع بالياقوت الأحمر والأحجار الكريمة مع هالة نيون مشعة متمركزة بدقة',
    badge: 'تاج الإمبراطور 👑',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(234, 179, 8, 0.95)',
    borderColor: '#eab308',
    type: 'crown',
  },
  {
    id: 'frame_01',
    name: 'إطار الأسطورة الملكي 01 👑✨',
    rarity: 'SSR',
    description: 'إطار ملكي ذهبي محفور بزخارف أسطورية يلتف بتناسق تام حول الأفاتار',
    badge: 'الأسطورة 🌟',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(245, 158, 11, 0.95)',
    borderColor: '#f59e0b',
    type: 'imperial',
  },
  {
    id: 'frame_02',
    name: 'إطار التاج الإمبراطوري 02 👑',
    rarity: 'SSR',
    description: 'إطار التاج الذهبي الفاخر مع أجنحة الملوك وجواهر الزمرد',
    badge: 'التاج الملكي 👑',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(168, 85, 247, 0.95)',
    borderColor: '#a855f7',
    type: 'crown',
  },
  {
    id: 'frame_03',
    name: 'إطار أجنحة العنقاء الملكية 03 🦅🔥',
    rarity: 'SSR',
    description: 'أجنحة العنقاء النارية المتوهجة مع طوق ذهبي مضيء',
    badge: 'العنقاء 🔥',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(239, 68, 68, 0.95)',
    borderColor: '#ef4444',
    type: 'phoenix',
  },
  {
    id: 'frame_04',
    name: 'إطار ماسة الأميرة الوردية 04 💎🌸',
    rarity: 'SR',
    description: 'إطار من الألماس الوردي البراق مع لمسات البتلات المتناثرة',
    badge: 'الماسة الوردي 💎',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(236, 72, 153, 0.9)',
    borderColor: '#ec4899',
    type: 'sakura',
  },
  {
    id: 'frame_05',
    name: 'إطار درع التنين الأسطوري 05 🐉⚔️',
    rarity: 'SSR',
    description: 'درع التنين الأسطوري الصلب المرصع بالطاقة الكونية الزرقاء',
    badge: 'درع التنين 🐉',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(59, 130, 246, 0.95)',
    borderColor: '#3b82f6',
    type: 'dragon',
  },
  {
    id: 'golden_dragon_head',
    name: 'إطار رأس التنين الذهبي الياقوتي الأسطوري',
    rarity: 'SSR',
    description: 'رأس التنين الإمبراطوري الذهبي الشامخ بالعينين الياقوتيتين والجواهر الحمراء المضيئة',
    badge: 'التنين الإمبراطوري 🐲',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(245, 158, 11, 0.95)',
    borderColor: '#f59e0b',
    type: 'golden_dragon_head',
  },
  {
    id: 'cosmic_dragon_sc89',
    name: 'إطار التنين الياقوتي الكوني SC89',
    rarity: 'SSR',
    description: 'تنين الكوزميك السماوي الأزرق مع التاج الملكي الذهبي وشعار SC89 الياقوتي المضيء',
    badge: 'SC89 VIP 🐉',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(59, 130, 246, 0.95)',
    borderColor: '#3b82f6',
    type: 'cosmic_dragon_sc89',
  },
  {
    id: 'purple_emperor',
    name: 'إطار الأجنحة البنفسجية الأسطورية',
    rarity: 'SSR',
    description: 'إطار الأجنحة الإمبراطورية الأرجوانية مع أسد الذهب والتاج المجنح المضيء خالي من أي خلفية سوداء',
    badge: 'أسطورة القيصر 🔮',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(168, 85, 247, 0.9)',
    borderColor: '#a855f7',
    type: 'purple_emperor',
  },
  {
    id: 'golden_imperial',
    name: 'إطار الإمبراطور الذهبي الملكي',
    rarity: 'SSR',
    description: 'تاج ملكي ذهبي مرصع بالياقوت مع هالة بصرية متلألئة تليق بالملوك والملكات',
    badge: 'ملك الملكية 👑',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(245, 158, 11, 0.8)',
    borderColor: '#f59e0b',
    type: 'imperial',
  },
  {
    id: 'wings_flame',
    name: 'إطار أجنحة العنقود النارية',
    rarity: 'SSR',
    description: 'أجنحة لهب متوهجة تحيط بالصورة الشخصية مع طوق من النيران والشرار المتطاير',
    badge: 'ناري 🔥',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(239, 68, 68, 0.85)',
    borderColor: '#ef4444',
    type: 'flame',
  },
  {
    id: 'phoenix_blaze',
    name: 'إطار طائر العنقاء الملكي',
    rarity: 'SSR',
    description: 'عنقاء متوهجة تنفث ألسنة النيران الوردية والذهبية حول بروفايلك',
    badge: 'العنقاء 🦅',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(249, 115, 22, 0.9)',
    borderColor: '#f97316',
    type: 'phoenix',
  },
  {
    id: 'dragon_fire',
    name: 'إطار التنين الذهبي الأسطوري',
    rarity: 'SSR',
    description: 'تنين ذهبي ملتف حول الإطار ينفث طاقة الأساطير والأنوار البرّاقة',
    badge: 'أسطوري 🐉',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(234, 179, 8, 0.9)',
    borderColor: '#eab308',
    type: 'dragon',
  },
  {
    id: 'royal_crown',
    name: 'إطار التاج الملكي الياقوتي',
    rarity: 'SSR',
    description: 'تاج من الياقوت الأرجواني والألماس يمنح الصورة الشخصية هيبة استثنائية',
    badge: 'VIP 💎',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(168, 85, 247, 0.85)',
    borderColor: '#a855f7',
    type: 'crown',
  },
  {
    id: 'valkyrie_wings',
    name: 'إطار أجنحة الفالكيري السماوية',
    rarity: 'SSR',
    description: 'أجنحة فالكيري ملائكية بفيض من الضياء والأنوار السماوية البراقة',
    badge: 'سماوي 🕊️',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(14, 165, 233, 0.85)',
    borderColor: '#0ea5e9',
    type: 'valkyrie',
  },
  {
    id: 'demon_lord',
    name: 'إطار قرون أمير الظلام النيون',
    rarity: 'SSR',
    description: 'قرون الشياطين الأرجوانية المضيئة بذبذبات الشرار الناري في العتمة',
    badge: 'أمير الظلام 😈',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(217, 70, 239, 0.9)',
    borderColor: '#d946ef',
    type: 'demon',
  },
  {
    id: 'frost_queen',
    name: 'إطار بلورات ملكة الجليد',
    rarity: 'SSR',
    description: 'بلورات ثلجية وزجاجية متجمدة حول الصورة تشع برودة برّاقة',
    badge: 'جليدي ❄️',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(56, 189, 248, 0.9)',
    borderColor: '#38bdf8',
    type: 'frost',
  },
  {
    id: 'celestial_angel',
    name: 'إطار ملاك الفردوس الذهبي',
    rarity: 'SSR',
    description: 'أجنحة ملاك بلورية ناصعة البياض مع هالة النور والنجوم الذهبية',
    badge: 'ملاك 👼',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(253, 224, 71, 0.9)',
    borderColor: '#fde047',
    type: 'celestial',
  },
  {
    id: 'cyber_neon',
    name: 'إطار طوق السايبر النيون',
    rarity: 'SR',
    description: 'طوق مستقبلي هولوجرام مضيء بألوان السايبر والنيون مع ذبذبات رقمية',
    badge: 'Cyber ⚡',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(6, 182, 212, 0.85)',
    borderColor: '#06b6d4',
    type: 'neon',
  },
  {
    id: 'gundam_mecha',
    name: 'إطار المحارب الميكانيكي الخارق',
    rarity: 'SR',
    description: 'دروع آلي هجومي مستقبلي مع أنوار ليزر أزرق ونظام دفاعي رقمي',
    badge: 'Mecha 🤖',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(59, 130, 246, 0.85)',
    borderColor: '#3b82f6',
    type: 'gundam',
  },
  {
    id: 'galaxy_nebula',
    name: 'إطار مجرة السديم الكونية',
    rarity: 'SSR',
    description: 'سديم كوني نفاث محاط بالنجوم والكواكب المتلألئة في عمق الفضاء',
    badge: 'Space 🌌',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(147, 51, 234, 0.85)',
    borderColor: '#9333ea',
    type: 'galaxy',
  },
  {
    id: 'diamond_star',
    name: 'إطار النجمة الماسية البراقة',
    rarity: 'SSR',
    description: 'بلورات الماس البلاتيني النادرة التي تشع أضواءً ماسية خالبة للأنظار',
    badge: 'Diamond 💎',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(56, 189, 248, 0.9)',
    borderColor: '#38bdf8',
    type: 'diamond',
  },
  {
    id: 'ruby_blood',
    name: 'إطار جوهرة الياقوت القرمزي',
    rarity: 'SR',
    description: 'أحجار ياقوت حمراء ملكية تتلألأ بأضواء متوهجة تحيط بالبروفايل',
    badge: 'Ruby ❤️',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(225, 29, 72, 0.9)',
    borderColor: '#e11d48',
    type: 'ruby',
  },
  {
    id: 'sultan_gold',
    name: 'إطار تاج السلطان الذهبي',
    rarity: 'SSR',
    description: 'زخارف عثمانية وسلطانية ذهبية فاخرة تعكس الفخامة الملكية',
    badge: 'سلطان 🕌',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(202, 138, 4, 0.9)',
    borderColor: '#ca8a04',
    type: 'sultan',
  },
  {
    id: 'vortex_cosmic',
    name: 'إطار دوامة الثقب الكوني',
    rarity: 'SR',
    description: 'دوامة طاقة حلزونية تدور بسرعة هائلة مع جزيئات الطاقة المتناثرة',
    badge: 'Vortex 🌀',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(124, 58, 237, 0.9)',
    borderColor: '#7c3aed',
    type: 'vortex',
  },
  {
    id: 'sakura_blossom',
    name: 'إطار زهور الساكورا الوردي',
    rarity: 'SR',
    description: 'زهور كرز وردية ناعمة تحيط بالصورة الشخصية مع بتلات متطايرة برقة',
    badge: 'Sakura 🌸',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(244, 114, 182, 0.85)',
    borderColor: '#f472b6',
    type: 'sakura',
  },
  {
    id: 'emerald_king',
    name: 'إطار طوق زمرد الملوك',
    rarity: 'SR',
    description: 'حلقة من أحجار الزمرد الأخضر الفاخر المزخرفة بالذهب الخالص',
    badge: 'Emerald 💚',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(16, 185, 129, 0.85)',
    borderColor: '#10b981',
    type: 'emerald',
  },
  {
    id: 'heart_neon',
    name: 'إطار القلوب الوردي المضيء',
    rarity: 'R',
    description: 'قلوب رومانسية نيون تنبض بالحياة والدفء تحيط بصورتك الشخصية',
    badge: 'Love 💕',
    duration: 'دائم',
    unlocked: true,
    glowColor: 'rgba(244, 63, 94, 0.85)',
    borderColor: '#f43f5e',
    type: 'heart',
  },
];

export const AVATAR_FRAMES: AvatarFrame[] = RAW_AVATAR_FRAMES.map((item) => {
  const match = FRAME_PNG_URLS.find((p) => p.id === item.id);
  if (match) {
    return { 
      ...item, 
      frameImgUrl: match.url,
      frameScale: match.frameScale,
      frameOffsetTop: match.frameOffsetTop,
      frameOffsetLeft: match.frameOffsetLeft
    };
  }
  return item;
});
