import React, { useState } from 'react';
import { ChevronRight, HelpCircle, Crown, Check, X, Sparkles } from 'lucide-react';

export interface SeatLayoutSelection {
  type: 'basic' | 'boss';
  count: number;
}

interface SeatGridSettingsModalProps {
  currentLayout?: SeatLayoutSelection;
  userLevel?: number;
  onSave: (layout: SeatLayoutSelection) => void;
  onClose: () => void;
}

interface TemplateOption {
  id: string;
  type: 'basic' | 'boss';
  count: number;
  minLevel: number;
  title: string;
}

export const BASIC_TEMPLATES: TemplateOption[] = [
  { id: 'basic-10', type: 'basic', count: 10, minLevel: 1, title: '10 مقعد ميكروفون' },
  { id: 'basic-12', type: 'basic', count: 12, minLevel: 1, title: '12 مقعد ميكروفون' },
  { id: 'basic-15', type: 'basic', count: 15, minLevel: 4, title: '15 مقعد ميكروفون' },
  { id: 'basic-20', type: 'basic', count: 20, minLevel: 4, title: '20 مقعد ميكروفون' },
  { id: 'basic-25', type: 'basic', count: 25, minLevel: 5, title: '25 مقعد ميكروفون' },
  { id: 'basic-30', type: 'basic', count: 30, minLevel: 5, title: '30 مقعد ميكروفون' },
];

export const BOSS_TEMPLATES: TemplateOption[] = [
  { id: 'boss-10', type: 'boss', count: 10, minLevel: 1, title: '10 مقعد ميكروفون' },
  { id: 'boss-14', type: 'boss', count: 14, minLevel: 1, title: '14 مقعد ميكروفون' },
  { id: 'boss-20', type: 'boss', count: 20, minLevel: 4, title: '20 مقعد ميكروفون' },
  { id: 'boss-25', type: 'boss', count: 25, minLevel: 5, title: '25 مقعد ميكروفون' },
  { id: 'boss-30', type: 'boss', count: 30, minLevel: 5, title: '30 مقعد ميكروفون' },
];

export const SeatGridSettingsModal: React.FC<SeatGridSettingsModalProps> = ({
  currentLayout = { type: 'basic', count: 20 },
  userLevel = 5,
  onSave,
  onClose,
}) => {
  const [selectedType, setSelectedType] = useState<'basic' | 'boss'>(currentLayout.type);
  const [selectedCount, setSelectedCount] = useState<number>(currentLayout.count);
  const [showHelpAlert, setShowHelpAlert] = useState(false);

  const handleSelectTemplate = (type: 'basic' | 'boss', count: number) => {
    setSelectedType(type);
    setSelectedCount(count);
  };

  const handleSave = () => {
    onSave({ type: selectedType, count: selectedCount });
  };

  // Helper renderer for Dot Matrix Layout Graphics inside preview cards
  const renderDotMatrix = (type: 'basic' | 'boss', count: number) => {
    if (type === 'basic') {
      let rows = 2;
      let cols = 5;

      if (count === 10) { rows = 2; cols = 5; }
      else if (count === 12) { rows = 3; cols = 4; }
      else if (count === 15) { rows = 3; cols = 5; }
      else if (count === 20) { rows = 4; cols = 5; }
      else if (count === 25) { rows = 5; cols = 5; }
      else if (count === 30) { rows = 5; cols = 6; }

      const totalDots = rows * cols;

      return (
        <div
          className="grid gap-1.5 my-auto justify-center items-center py-2"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: totalDots }).map((_, idx) => (
            <div
              key={idx}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx < count ? 'bg-slate-200 shadow-sm' : 'bg-slate-700/30'
              }`}
            />
          ))}
        </div>
      );
    } else {
      // Boss Layout: Top central Boss Mic (Orange/Gold Crown) + Grid below
      let rows = 3;
      let cols = 3;

      if (count === 10) { rows = 3; cols = 3; }
      else if (count === 14) { rows = 3; cols = 4; }
      else if (count === 20) { rows = 4; cols = 5; }
      else if (count === 25) { rows = 4; cols = 6; }
      else if (count === 30) { rows = 5; cols = 6; }

      const gridDotsCount = count - 1;

      return (
        <div className="flex flex-col items-center justify-center my-auto py-1 space-y-1.5">
          {/* Top Boss Seat Icon */}
          <div className="w-4 h-4 rounded-md bg-amber-500 border border-amber-300 flex items-center justify-center shadow-md animate-pulse">
            <Crown className="w-2.5 h-2.5 text-slate-950 fill-slate-950" />
          </div>

          {/* Grid seats below boss */}
          <div
            className="grid gap-1.5 justify-center items-center"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: gridDotsCount }).map((_, idx) => (
              <div
                key={idx}
                className="w-2.5 h-2.5 rounded-full bg-slate-200 shadow-sm"
              />
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center font-sans dir-rtl text-white select-none animate-fadeIn">
      {/* Dim backdrop overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container matching screenshot layout */}
      <div className="relative z-10 w-full max-w-md bg-[#121215] border-t sm:border border-slate-800/90 sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/80 bg-[#16161a]">
          {/* Right side: Back arrow + Title */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-slate-100 hover:text-white transition-colors group"
          >
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
            <h2 className="text-base font-black tracking-wide">مقعد ميكروفون</h2>
          </button>

          {/* Left side: Help ? Button */}
          <button
            onClick={() => setShowHelpAlert(!showHelpAlert)}
            className="w-7 h-7 rounded-full bg-slate-800/90 border border-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors shadow"
            title="تعليمات تخصيص المقاعد"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Help Info Banner Toggle */}
        {showHelpAlert && (
          <div className="bg-purple-950/90 border-b border-purple-500/40 px-4 py-2.5 text-xs text-purple-200 flex items-start gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              تتيح لك هذه الواجهة تغيير عدد وشكل مقاعد الغرفة فوراً (من 10 إلى 30 مقعد). عند حفظ التغييرات، سيتم تحديث جميع المستخدمين المتواجدين في الغرفة تلقائياً في نفس اللحظة!
            </p>
          </div>
        )}

        {/* Scrollable Templates Grid Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar bg-[#121215]">
          
          {/* SECTION 1: مايك أساسي (Basic Mic Grid) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-300">مايك أساسي</h3>
              <span className="text-[10px] text-slate-500 font-medium">نماذج شبكية قياسية</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {BASIC_TEMPLATES.map((tmpl) => {
                const isSelected = selectedType === 'basic' && selectedCount === tmpl.count;

                return (
                  <div
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate('basic', tmpl.count)}
                    className={`relative rounded-2xl bg-[#212126] hover:bg-[#282830] transition-all p-3 flex flex-col items-center justify-between cursor-pointer min-h-[160px] border-2 shadow-md ${
                      isSelected
                        ? 'border-[#8b5cf6] bg-[#21212d] ring-2 ring-[#8b5cf6]/40 shadow-purple-900/40'
                        : 'border-transparent hover:border-slate-700'
                    }`}
                  >
                    {/* Level Requirement Badge at top-left */}
                    <div
                      className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-0.5 border shadow-sm ${
                        tmpl.minLevel === 1
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                          : tmpl.minLevel === 4
                          ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                          : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      <span>Lv.{tmpl.minLevel}</span>
                    </div>

                    {/* Dot Matrix Graphic Preview */}
                    <div className="w-full flex-1 flex items-center justify-center pt-5 pb-1">
                      {renderDotMatrix('basic', tmpl.count)}
                    </div>

                    {/* Title label at bottom */}
                    <span className={`text-xs font-bold tracking-tight text-center ${isSelected ? 'text-purple-300' : 'text-slate-200'}`}>
                      {tmpl.title}
                    </span>

                    {/* Selected Checkmark overlay dot */}
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center shadow">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: مايك البوس (Boss Mic Grid) */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <h3 className="text-xs font-bold text-slate-300">مايك البوس</h3>
              </div>
              <span className="text-[10px] text-amber-400/90 font-medium">تصميم يتضمن مايك قيادي مميز</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {BOSS_TEMPLATES.map((tmpl) => {
                const isSelected = selectedType === 'boss' && selectedCount === tmpl.count;

                return (
                  <div
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate('boss', tmpl.count)}
                    className={`relative rounded-2xl bg-[#212126] hover:bg-[#282830] transition-all p-3 flex flex-col items-center justify-between cursor-pointer min-h-[160px] border-2 shadow-md ${
                      isSelected
                        ? 'border-[#8b5cf6] bg-[#21212d] ring-2 ring-[#8b5cf6]/40 shadow-purple-900/40'
                        : 'border-transparent hover:border-slate-700'
                    }`}
                  >
                    {/* Level Requirement Badge at top-left */}
                    <div
                      className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-0.5 border shadow-sm ${
                        tmpl.minLevel === 1
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                          : tmpl.minLevel === 4
                          ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                          : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      <span>Lv.{tmpl.minLevel}</span>
                    </div>

                    {/* Dot Matrix Graphic Preview */}
                    <div className="w-full flex-1 flex items-center justify-center pt-5 pb-1">
                      {renderDotMatrix('boss', tmpl.count)}
                    </div>

                    {/* Title label at bottom */}
                    <span className={`text-xs font-bold tracking-tight text-center ${isSelected ? 'text-purple-300' : 'text-slate-200'}`}>
                      {tmpl.title}
                    </span>

                    {/* Selected Checkmark overlay dot */}
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center shadow">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Action Bar (Save & Cancel Buttons) */}
        <div className="p-4 bg-[#121215] border-t border-slate-800/80 grid grid-cols-2 gap-3">
          {/* Save Button (Right side in RTL) */}
          <button
            onClick={handleSave}
            className="w-full py-3 px-4 rounded-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-sm shadow-lg shadow-purple-900/30 transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>حفظ</span>
          </button>

          {/* Cancel Button (Left side in RTL) */}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-full bg-[#212126] hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700/60 transition-all active:scale-95 flex items-center justify-center"
          >
            <span>إلغاء</span>
          </button>
        </div>

      </div>
    </div>
  );
};
