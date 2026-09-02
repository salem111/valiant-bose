import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { RocketGame } from './MiniGames/RocketGame';
import { MinesGame } from './MiniGames/MinesGame';
import { WheelGame } from './MiniGames/WheelGame';
import { Slots777Game } from './MiniGames/Slots777Game';
import { ColorDiceGame } from './MiniGames/ColorDiceGame';
import { LudoQuickGame } from './MiniGames/LudoQuickGame';
import { DominoesGame } from './MiniGames/DominoesGame';
import { CardFlipGame } from './MiniGames/CardFlipGame';
import { VirtualRacingGame } from './MiniGames/VirtualRacingGame';
import { BountyFootballGame } from './MiniGames/BountyFootballGame';
import { GoldenPinataGame } from './MiniGames/GoldenPinataGame';
import { XoRockBalootGame } from './MiniGames/XoRockBalootGame';
import { LuckyDiceModal } from './games/LuckyDiceModal';
import { LuckyWheelModal } from './games/LuckyWheelModal';
import { TriviaQuizModal } from './games/TriviaQuizModal';
import { useI18n } from '../lib/i18n';
import {
  X,
  Gamepad2,
  Trophy,
  Coins,
  ShieldCheck,
  Flame,
  Sparkles,
  History,
  Lock,
  Plus,
  HelpCircle,
  Home,
  Crown,
  ChevronLeft,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

interface MiniGamesModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateCoins: (delta: number) => void;
  onOpenCoinStore?: () => void;
  onOpenWithdrawalModal?: () => void;
}

interface BetLogItem {
  id: string;
  gameName: string;
  amount: number;
  payout: number;
  status: 'WIN' | 'LOSS';
  time: string;
}

export const MiniGamesModal: React.FC<MiniGamesModalProps> = ({
  user,
  onClose,
  onUpdateCoins,
  onOpenCoinStore,
  onOpenWithdrawalModal,
}) => {
  const { t, dir } = useI18n();
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'recent'>('all');
  const [showLeaderboardModal, setShowLeaderboardModal] = useState<boolean>(false);

  // Betting Log History
  const [betLogs, setBetLogs] = useState<BetLogItem[]>([
    { id: 'b1', gameName: 'صاروخ 🚀', amount: 500, payout: 1250, status: 'WIN', time: 'منذ دقيقتين' },
    { id: 'b2', gameName: 'سوبر 777 🎰', amount: 200, payout: 2000, status: 'WIN', time: 'منذ 5 دقائق' },
    { id: 'b3', gameName: 'باونتي فوتبول ⚽', amount: 300, payout: 750, status: 'WIN', time: 'منذ 10 دقائق' },
  ]);

  // Update Coins & Log
  const handleUpdateCoinsWithLog = (delta: number, gameName: string = 'لعبة الرهان') => {
    onUpdateCoins(delta);

    if (delta > 0) {
      setBetLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          gameName,
          amount: 500,
          payout: delta,
          status: 'WIN',
          time: 'الآن',
        },
        ...prev,
      ]);
    }
  };

  // 1. Suggested Games List (الألعاب المقترحة)
  const SUGGESTED_GAMES = [
    {
      id: 'rocket',
      name: 'صاروخ الفضاء',
      icon: '🚀',
      badge: 'شائع 🔥',
      badgeBg: 'bg-amber-600',
      description: 'قفز قبل الانفجار واكسب حتى 100x',
      coverBg: 'from-indigo-900 via-purple-950 to-slate-950',
    },
    {
      id: 'bounty_football',
      name: 'باونتي فوتبول',
      icon: '⚽',
      badge: 'حار 🔥',
      badgeBg: 'bg-rose-600',
      description: 'سدد ركلة الجزاء وضاعف رهاناتك',
      coverBg: 'from-amber-900 via-yellow-950 to-slate-950',
    },
    {
      id: 'olympus',
      name: 'أوليمبوس',
      icon: '⚡',
      badge: '',
      badgeBg: '',
      description: 'أسطورة الآلهة والجاك بوت 50x',
      coverBg: 'from-amber-800 via-amber-950 to-slate-950',
    },
    {
      id: 'slots',
      name: 'سوبر 777',
      icon: '🎰',
      badge: '',
      badgeBg: '',
      description: 'طابق رموز الـ 777 واحصد الثروة',
      coverBg: 'from-blue-900 via-indigo-950 to-slate-950',
    },
  ];

  // 2. All Games List (جميع الألعاب)
  const ALL_GAMES = [
    {
      id: 'rocket',
      name: 'صاروخ الفضاء',
      icon: '🚀',
      badge: 'شائع 🔥',
      badgeBg: 'bg-amber-600',
      description: 'قفز قبل الانفجار واكسب حتى 100x',
      coverBg: 'from-indigo-900 via-purple-950 to-slate-950',
    },
    {
      id: 'wheel',
      name: 'عجل الحظ',
      icon: '🎡',
      badge: '',
      badgeBg: '',
      description: 'أدر العجلة وضاعف رصيدك فورياً',
      coverBg: 'from-yellow-900 via-amber-950 to-slate-950',
    },
    {
      id: 'pinata',
      name: 'البينايا الذهبية',
      icon: '🪅',
      badge: 'جديد ✨',
      badgeBg: 'bg-pink-600',
      description: 'اضرب البينايا واكسب مفاجآت الألماس',
      coverBg: 'from-emerald-900 via-teal-950 to-slate-950',
    },
    {
      id: 'slots_classic',
      name: 'سلوت 777',
      icon: '🎰',
      badge: '',
      badgeBg: '',
      description: 'ماكينة الحظ السريعة الكلاسيكية',
      coverBg: 'from-red-900 via-rose-950 to-slate-950',
    },
    {
      id: 'ludo',
      name: 'لودو المصغرة',
      icon: '🏆',
      badge: 'جماعي ⚔️',
      badgeBg: 'bg-blue-600',
      description: 'تحدّ أصدقاء الغرفة بـ 1v1',
      coverBg: 'from-cyan-900 via-slate-950 to-indigo-950',
    },
    {
      id: 'dominoes',
      name: 'الدومينو',
      icon: '🀄',
      badge: '',
      badgeBg: '',
      description: 'لعبة الدومينو العربية الكلاسيكية',
      coverBg: 'from-amber-900 via-yellow-950 to-slate-950',
    },
    {
      id: 'colordice',
      name: 'روليت الألوان',
      icon: '🎲',
      badge: '',
      badgeBg: '',
      description: 'تخمين الألوان ومجموع النرد',
      coverBg: 'from-rose-900 via-slate-950 to-purple-950',
    },
    {
      id: 'racing',
      name: 'سباق السيارات',
      icon: '🏎️',
      badge: '',
      badgeBg: '',
      description: 'رهان السباقات الافتراضية السريعة',
      coverBg: 'from-emerald-900 via-slate-950 to-teal-950',
    },
    {
      id: 'xo',
      name: 'تحدي XO',
      icon: '❌',
      badge: 'مواجهة ⚔️',
      badgeBg: 'bg-rose-600',
      description: 'لعبة X و O السريعة بالرهان',
      coverBg: 'from-rose-900 via-pink-950 to-slate-950',
    },
    {
      id: 'rps',
      name: 'حجر ورقة مقص',
      icon: '✂️',
      badge: 'تحدي 🔥',
      badgeBg: 'bg-amber-600',
      description: 'اختر حجر أو ورقة أو مقص لربح الرهان',
      coverBg: 'from-amber-900 via-yellow-950 to-slate-950',
    },
    {
      id: 'baloot',
      name: 'بلوت وأونو',
      icon: '🃏',
      badge: 'شبيبة 🎴',
      badgeBg: 'bg-purple-600',
      description: 'تحدي ورقي سريع ومضاعفة كوينز',
      coverBg: 'from-purple-900 via-indigo-950 to-slate-950',
    },
  ];

  // =========================================================================
  // IF A GAME IS SELECTED -> RENDER FULL-SCREEN GAME ARENA ONLY (NO HUB BANNERS)
  // =========================================================================
  if (selectedGameId) {
    return (
      <div dir={dir} className="fixed inset-0 z-50 bg-[#040714] flex flex-col w-full h-full p-0 m-0 font-sans select-none overflow-y-auto">
        <div className="w-full h-full flex-1 flex flex-col">
          {selectedGameId === 'rocket' && (
            <RocketGame
              user={user}
              onUpdateCoins={(d) => handleUpdateCoinsWithLog(d, 'صاروخ 🚀')}
              onBack={() => setSelectedGameId(null)}
            />
          )}

          {selectedGameId === 'bounty_football' && (
            <div className="space-y-3 p-4">
              <button
                onClick={() => setSelectedGameId(null)}
                className="text-xs font-black text-amber-300 hover:underline flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-500/30 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>العودة لمركز الألعاب</span>
              </button>
              <BountyFootballGame
                user={user}
                onUpdateCoins={(d) => handleUpdateCoinsWithLog(d, 'باونتي فوتبول ⚽')}
              />
            </div>
          )}

          {selectedGameId === 'pinata' && (
            <div className="space-y-3 p-4">
              <button
                onClick={() => setSelectedGameId(null)}
                className="text-xs font-black text-amber-300 hover:underline flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-500/30 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>العودة لمركز الألعاب</span>
              </button>
              <GoldenPinataGame
                user={user}
                onUpdateCoins={(d) => handleUpdateCoinsWithLog(d, 'البينايا الذهبية 🪅')}
              />
            </div>
          )}

          {(selectedGameId === 'slots' ||
            selectedGameId === 'slots_classic' ||
            selectedGameId === 'olympus' ||
            selectedGameId === 'star_treasure') && (
            <Slots777Game
              user={user}
              onUpdateCoins={(d) => handleUpdateCoinsWithLog(d, 'ماكينة السلوت 🎰')}
              onBack={() => setSelectedGameId(null)}
            />
          )}

          {selectedGameId === 'wheel' && (
            <WheelGame
              user={user}
              onUpdateCoins={(d) => handleUpdateCoinsWithLog(d, 'عجلة الحظ 🎡')}
              onBack={() => setSelectedGameId(null)}
            />
          )}

          {selectedGameId === 'lucky_wheel' && (
            <LuckyWheelModal
              user={user}
              onClose={() => setSelectedGameId(null)}
              onUpdateCoins={(d) => handleUpdateCoinsWithLog(d, 'عجلة الحظ الملكية 🎡')}
              onUpdateDiamonds={() => {}}
            />
          )}

          {selectedGameId === 'colordice' && (
            <div className="space-y-3 p-4">
              <button
                onClick={() => setSelectedGameId(null)}
                className="text-xs font-black text-amber-300 hover:underline flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-500/30 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>العودة لمركز الألعاب</span>
              </button>
              <ColorDiceGame
                user={user}
                onUpdateCoins={(d) => handleUpdateCoinsWithLog(d, 'روليت الألوان 🎲')}
              />
            </div>
          )}

          {selectedGameId === 'luckydice' && (
            <LuckyDiceModal
              user={user}
              onClose={() => setSelectedGameId(null)}
              onUpdateCoins={(d) => handleUpdateCoinsWithLog(d, 'النرد الذهبي 🎲')}
            />
          )}

          {selectedGameId === 'trivia' && (
            <TriviaQuizModal
              user={user}
              onClose={() => setSelectedGameId(null)}
              onUpdateCoins={(d) => handleUpdateCoinsWithLog(d, 'مسابقة الأسئلة 🧠')}
            />
          )}

          {selectedGameId === 'ludo' && (
            <div className="space-y-3 p-4">
              <button
                onClick={() => setSelectedGameId(null)}
                className="text-xs font-black text-amber-300 hover:underline flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-500/30 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>العودة لمركز الألعاب</span>
              </button>
              <LudoQuickGame
                user={user}
                onUpdateCoins={(d) => handleUpdateCoinsWithLog(d, 'لودو المصغرة 🏆')}
              />
            </div>
          )}

          {selectedGameId === 'dominoes' && (
            <div className="space-y-3 p-4">
              <button
                onClick={() => setSelectedGameId(null)}
                className="text-xs font-black text-amber-300 hover:underline flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-500/30 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>العودة لمركز الألعاب</span>
              </button>
              <DominoesGame
                user={user}
                onUpdateCoins={(d) => handleUpdateCoinsWithLog(d, 'دومينو 🀄')}
              />
            </div>
          )}

          {selectedGameId === 'racing' && (
            <div className="space-y-3 p-4">
              <button
                onClick={() => setSelectedGameId(null)}
                className="text-xs font-black text-amber-300 hover:underline flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-500/30 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>العودة لمركز الألعاب</span>
              </button>
              <VirtualRacingGame
                user={user}
                onUpdateCoins={(d) => handleUpdateCoinsWithLog(d, 'السباقات 🏎️')}
              />
            </div>
          )}

          {(selectedGameId === 'xo' || selectedGameId === 'rps' || selectedGameId === 'baloot') && (
            <div className="space-y-3 p-4">
              <button
                onClick={() => setSelectedGameId(null)}
                className="text-xs font-black text-amber-300 hover:underline flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-500/30 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>العودة لمركز الألعاب</span>
              </button>
              <XoRockBalootGame
                user={user}
                onUpdateCoins={(d) => handleUpdateCoinsWithLog(d, 'تحديات الألعاب 🎮')}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN GAMES LOBBY (SHOWS HUB HEADER, ROYAL WINNERS BANNER, STATS & GRID)
  // =========================================================================
  return (
    <div dir={dir} className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 font-sans select-none">
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-500/50 rounded-3xl shadow-2xl space-y-4 text-start max-h-[94vh] overflow-y-auto animate-in zoom-in-95 duration-200 relative pb-6">
        
        {/* 1. TOP ORNATE ROYAL HEADER (مركز الألعاب) */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b-2 border-amber-500/40 p-3.5 sm:p-4 rounded-t-3xl flex items-center justify-between shadow-xl sticky top-0 z-30 backdrop-blur-md">
          {/* Close button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900/80 border border-amber-500/40 text-amber-300 hover:text-white flex items-center justify-center cursor-pointer shadow"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Title */}
          <div className="text-center">
            <h2 className="font-black text-lg sm:text-xl text-amber-300 tracking-wide flex items-center gap-1.5 justify-center">
              <span>{t('miniGames')}</span>
            </h2>
          </div>

          {/* Help Button */}
          <button
            onClick={() => alert('مرحباً بك في مركز الألعاب! اختر أي لعبة للرهان بالعملات وتحقيق الأرباح.')}
            className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center cursor-pointer shadow hover:bg-amber-500/40"
            title="تعليمات الألعاب"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="px-3 sm:px-4 space-y-4">
          {/* 2. ROYAL WINNERS HERO BANNER ("الفائزون الملكيون / GO") */}
          <div className="relative bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 border-2 border-amber-500/60 rounded-2xl p-4 overflow-hidden shadow-2xl flex items-center justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full filter blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg">
                🐉
              </div>
              <div>
                <span className="font-black text-base sm:text-lg text-amber-300 block">
                  الفائزون الملكيون
                </span>
                <span className="text-[10px] text-slate-300 block">
                  لوحة الأبطال وأعلى الفائزين بالجائزة الكبرى
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowLeaderboardModal(true)}
              className="relative z-10 px-5 py-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs rounded-full shadow-xl hover:brightness-110 active:scale-95 cursor-pointer border border-white/40"
            >
              GO
            </button>
          </div>

          {/* 3. TWO QUICK HUB STATS CARDS (لاعب مكتسب / أفضل الغرف) */}
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => setShowLeaderboardModal(true)}
              className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 hover:border-amber-400 p-3 rounded-2xl flex items-center justify-between shadow-lg cursor-pointer transition-transform active:scale-98"
            >
              <div>
                <span className="text-slate-300 text-xs font-black block">لاعب مكتسب</span>
                <span className="text-amber-400 font-mono font-black text-xs">99+</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center text-xl">
                🏆
              </div>
            </div>

            <div
              onClick={() => setShowLeaderboardModal(true)}
              className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 hover:border-amber-400 p-3 rounded-2xl flex items-center justify-between shadow-lg cursor-pointer transition-transform active:scale-98"
            >
              <div>
                <span className="text-slate-300 text-xs font-black block">أفضل الغرف</span>
                <span className="text-amber-400 font-mono font-black text-xs">99+</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-300 border border-pink-500/40 flex items-center justify-center text-xl">
                🏠👑
              </div>
            </div>
          </div>

          {/* 4. RECENT & BALANCES SUB-BAR */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
            <button
              onClick={() => setActiveTab((prev) => (prev === 'recent' ? 'all' : 'recent'))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'recent'
                  ? 'bg-slate-800 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border border-amber-400 flex items-center justify-center ${
                  activeTab === 'recent' ? 'bg-amber-400' : 'bg-transparent'
                }`}
              >
                {activeTab === 'recent' && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />}
              </div>
              <span>الأخيرة</span>
            </button>

            <div className="flex items-center gap-2">
              <div
                onClick={onOpenWithdrawalModal}
                className="bg-slate-900/90 border border-cyan-500/40 p-1.5 px-2.5 rounded-full flex items-center gap-1.5 text-xs font-mono font-black text-cyan-300 cursor-pointer shadow hover:bg-slate-800"
              >
                <span>{user.diamonds.toLocaleString()}</span>
                <span className="text-sm">💎</span>
                <button className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-black">
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <div
                onClick={onOpenCoinStore}
                className="bg-slate-900/90 border border-amber-500/40 p-1.5 px-2.5 rounded-full flex items-center gap-1.5 text-xs font-mono font-black text-amber-300 cursor-pointer shadow hover:bg-slate-800"
              >
                <span>{user.coins.toLocaleString()}</span>
                <span className="text-sm">🪙</span>
                <button className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* 5. GAMES GRID */}
          <div className="space-y-5">
            {/* SECTION 1: SUGGESTED GAMES */}
            <div className="space-y-2.5">
              <h3 className="font-black text-sm text-amber-300">الألعاب المقترحة</h3>

              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {SUGGESTED_GAMES.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => setSelectedGameId(game.id)}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <div
                      className={`w-full aspect-square rounded-2xl bg-gradient-to-b ${game.coverBg} border-2 border-amber-500/40 group-hover:border-amber-400 p-2 flex flex-col items-center justify-center relative shadow-lg group-hover:scale-105 transition-all overflow-hidden`}
                    >
                      {game.badge && (
                        <span
                          className={`absolute top-1 right-1 ${game.badgeBg} text-white font-black text-[9px] px-1.5 py-0.2 rounded-full shadow`}
                        >
                          {game.badge}
                        </span>
                      )}

                      <span className="text-3xl sm:text-4xl mb-1 group-hover:scale-110 transition-transform">
                        {game.icon}
                      </span>
                    </div>

                    <span className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors mt-1 text-center line-clamp-1">
                      {game.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: ALL GAMES */}
            <div className="space-y-2.5">
              <h3 className="font-black text-sm text-amber-300">جميع الألعاب</h3>

              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {ALL_GAMES.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => setSelectedGameId(game.id)}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <div
                      className={`w-full aspect-square rounded-2xl bg-gradient-to-b ${game.coverBg} border-2 border-slate-800 group-hover:border-amber-500 p-2 flex flex-col items-center justify-center relative shadow-lg group-hover:scale-105 transition-all overflow-hidden`}
                    >
                      {game.badge && (
                        <span
                          className={`absolute top-1 right-1 ${
                            game.badgeBg || 'bg-amber-500 text-slate-950'
                          } font-black text-[9px] px-1.5 py-0.2 rounded-full shadow`}
                        >
                          {game.badge}
                        </span>
                      )}

                      <span className="text-3xl sm:text-4xl mb-1 group-hover:scale-110 transition-transform">
                        {game.icon}
                      </span>
                    </div>

                    <span className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors mt-1 text-center line-clamp-1">
                      {game.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* LEADERBOARD MODAL OVERLAY */}
        {showLeaderboardModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-4 space-y-3 text-right">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="font-black text-sm text-amber-300 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>لوحة الفائزين الملكيين والأبطال 👑</span>
                </h3>
                <button
                  onClick={() => setShowLeaderboardModal(false)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {[
                  { rank: 1, name: 'الشيخ خالد 👑', score: '1,450,000 🪙', badge: '🥇 البطل الملكي' },
                  { rank: 2, name: 'أميرة الشوق 💎', score: '980,000 🪙', badge: '🥈 الوصيف الأول' },
                  { rank: 3, name: 'أسطورة الصاروخ 🚀', score: '820,000 🪙', badge: '🥉 المركز الثالث' },
                  { rank: 4, name: 'سالم المجد (أنت)', score: '540,000 🪙', badge: '⭐ المرتبة الرابعة' },
                ].map((item) => (
                  <div
                    key={item.rank}
                    className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-black font-mono text-amber-400 text-sm">#{item.rank}</span>
                      <div>
                        <div className="font-black text-white">{item.name}</div>
                        <div className="text-[10px] text-amber-300">{item.badge}</div>
                      </div>
                    </div>
                    <span className="font-mono font-black text-emerald-400 text-xs">{item.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
