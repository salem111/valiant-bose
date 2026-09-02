import React, { useState, useEffect } from 'react';
import { UserProfile, TriviaQuestion } from '../../types';
import { X, HelpCircle, Award, CheckCircle2, XCircle, Timer, Sparkles } from 'lucide-react';

interface TriviaQuizModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateCoins: (deltaCoins: number) => void;
}

export const TriviaQuizModal: React.FC<TriviaQuizModalProps> = ({
  user,
  onClose,
  onUpdateCoins,
}) => {
  const quizBank: TriviaQuestion[] = [
    {
      id: 1,
      question: 'ما هي عاصمة سلطنة عُمان؟',
      options: ['مسقط', 'صلالة', 'نزوى', 'صحار'],
      correctIndex: 0,
      category: 'جغرافيا 🌍',
      rewardCoins: 150,
    },
    {
      id: 2,
      question: 'كم عدد كواكب المجموعة الشمسية؟',
      options: ['7 كواكب', '8 كواكب', '9 كواكب', '10 كواكب'],
      correctIndex: 1,
      category: 'علوم 🚀',
      rewardCoins: 150,
    },
    {
      id: 3,
      question: 'أي منتخب فاز بكأس العالم 2022 في قطر؟',
      options: ['فرنسا', 'البرازيل', 'الأرجنتين', 'كرواتيا'],
      correctIndex: 2,
      category: 'رياضة ⚽',
      rewardCoins: 200,
    },
    {
      id: 4,
      question: 'ما هو أكبر محيط في العالم من حيث المساحة؟',
      options: ['المحيط الأطلسي', 'المحيط الهندي', 'المحيط الهادئ', 'المحيط المتجمد'],
      correctIndex: 2,
      category: 'جغرافيا 🌊',
      rewardCoins: 200,
    },
    {
      id: 5,
      question: 'ما هو العنصر الكيميائي الذي رمزه (Au)؟',
      options: ['الفضة', 'الذهب', 'الحديد', 'النحاس'],
      correctIndex: 1,
      category: 'علوم 🧪',
      rewardCoins: 250,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [scoreCoinsWon, setScoreCoinsWon] = useState(0);
  const [streakCount, setStreakCount] = useState(0);

  const currentQ = quizBank[currentIndex];

  useEffect(() => {
    if (isAnswered) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isAnswered]);

  const handleTimeout = () => {
    setIsAnswered(true);
    setSelectedOption(-1); // timeout mark
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      onUpdateCoins(currentQ.rewardCoins);
      setScoreCoinsWon((prev) => prev + currentQ.rewardCoins);
      setStreakCount((prev) => prev + 1);
    } else {
      setStreakCount(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < quizBank.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(15);
    } else {
      // Finished all
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans text-white animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#111e38] via-[#091024] to-[#040814] border-2 border-cyan-500/80 rounded-3xl p-5 text-center shadow-[0_0_40px_rgba(6,182,212,0.3)] space-y-4 overflow-hidden">
        
        {/* Glow ambient */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-cyan-900/50 pb-2.5">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h3 className="font-black text-sm text-cyan-300">مسابقة الأسئلة السريعة 🧠</h3>
          </div>

          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-300">
            <span>🪙 +{scoreCoinsWon}</span>
          </div>
        </div>

        {/* Quiz Progress & Timer bar */}
        <div className="flex items-center justify-between text-xs text-slate-300 px-1">
          <span className="font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800">
            {currentQ.category}
          </span>
          <span className="text-[11px] text-slate-400">
            سؤال {currentIndex + 1} من {quizBank.length}
          </span>
          <div className="flex items-center gap-1 text-rose-400 font-mono font-bold">
            <Timer className="w-3.5 h-3.5 animate-spin" />
            <span>{timeLeft} ث</span>
          </div>
        </div>

        {/* ❓ QUESTION CARD */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-inner">
          <p className="text-sm font-black text-white leading-relaxed">{currentQ.question}</p>
        </div>

        {/* 🔘 4 MULTIPLE CHOICE OPTIONS */}
        <div className="space-y-2">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correctIndex;
            
            let btnClass = 'bg-slate-900/70 border-slate-700/80 text-slate-200 hover:border-cyan-400';
            if (isAnswered) {
              if (isCorrect) {
                btnClass = 'bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.5)]';
              } else if (isSelected && !isCorrect) {
                btnClass = 'bg-rose-950/90 border-rose-400 text-rose-200';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered}
                className={`w-full p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between active:scale-98 ${btnClass}`}
              >
                <span>{opt}</span>
                {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
              </button>
            );
          })}
        </div>

        {/* Next Question or Finish Button */}
        {isAnswered && (
          <button
            onClick={handleNextQuestion}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-black text-xs shadow-lg active:scale-95 transition-all"
          >
            {currentIndex < quizBank.length - 1 ? 'السؤال التالي ➡️' : 'إنهاء واستلام الجوائز 🏆'}
          </button>
        )}
      </div>
    </div>
  );
};
