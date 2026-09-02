import React, { useState, useEffect } from 'react';
import { UserProfile, HOST_TARGET_TIERS, HostTargetTier, VoiceRoom } from '../../types';
import {
  X,
  Target,
  Clock,
  Award,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  Flame,
  ChevronRight,
  HelpCircle,
  DollarSign,
  Wallet,
  Sparkles,
  Crown,
  Calendar,
  Lock,
  Unlock,
  Coins,
  AlertCircle,
  Zap,
  Check,
  ChevronDown,
} from 'lucide-react';
import { evaluateWeeklyTarget, claimTargetReward, WeeklyTargetEvaluation } from '../../lib/agencyService';

interface HostTargetModalProps {
  user: UserProfile;
  room?: VoiceRoom;
  onClose: () => void;
  onOpenWithdrawal?: () => void;
}

export const HostTargetModal: React.FC<HostTargetModalProps> = ({
  user,
  room,
  onClose,
  onOpenWithdrawal,
}) => {
  const [activeTab, setActiveTab] = useState<'target' | 'tiers' | 'rules'>('target');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('target_10k');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);
  const [claimErrorMsg, setClaimErrorMsg] = useState<string | null>(null);

  // Evaluate target progress in real time
  const evalData: WeeklyTargetEvaluation = evaluateWeeklyTarget(user, selectedTargetId);

  // Calculate days remaining in current weekly cycle (7 days)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday
  const daysRemainingInCycle = Math.max(1, 7 - (dayOfWeek % 7));

  // Determine current highest achieved target
  let highestAchievedIndex = -1;
  for (let i = HOST_TARGET_TIERS.length - 1; i >= 0; i--) {
    if (evalData.currentDiamonds >= HOST_TARGET_TIERS[i].requiredDiamonds) {
      highestAchievedIndex = i;
      break;
    }
  }
  const highestTier = highestAchievedIndex >= 0 ? HOST_TARGET_TIERS[highestAchievedIndex] : null;

  // Auto-select user's matching tier on initial open
  useEffect(() => {
    if (highestTier && selectedTargetId === 'target_10k') {
      setSelectedTargetId(highestTier.tierId);
    }
  }, [highestTier?.tierId]);

  const handleClaim = async () => {
    setClaimErrorMsg(null);
    setClaimSuccessMsg(null);
    setIsClaiming(true);

    try {
      if (user.id) {
        const res = await claimTargetReward(user.id, selectedTargetId);
        setClaimSuccessMsg(`🎉 مبروك! تم تسكير التارجت بنجاح وإيداع ${res.rewardDiamonds.toLocaleString()} 🎯 ألماسة تارجت في محفظتك جاهزة للفك بمعدل 50%!`);
      } else {
        setClaimSuccessMsg(`🎉 تم تسكير ${evalData.targetName} بنجاح!`);
      }
    } catch (err: any) {
      setClaimErrorMsg(err?.message || 'تعذر تسكير التارجت، يرجى التأكد من استيفاء جميع الشروط.');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 dir-rtl font-sans select-none">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="w-full max-w-lg bg-gradient-to-b from-[#191130] via-[#100a22] to-[#0a0717] border-2 border-amber-400/80 rounded-3xl p-4 sm:p-5 space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.35)] relative z-10 overflow-hidden text-right text-white max-h-[94vh] overflow-y-auto custom-scrollbar">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-28 bg-gradient-to-b from-amber-500/20 via-purple-500/10 to-transparent blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-purple-900/50 pb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 p-0.5 shadow-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-base text-amber-300">لوحة التارجت والتحقق البرمجي للأجور 🎯</h3>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  دورة 7 أيام ⚡
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                الوكالة: <strong className="text-amber-200">{user.agencyName || 'وكالة الصقور الملكية [ROYAL-88]'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Level Quick Selector Dropdown */}
        <div className="bg-slate-950/90 border border-amber-500/40 p-2.5 rounded-2xl flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>اختر التارجت المستهدف:</span>
          </div>

          <select
            value={selectedTargetId}
            onChange={(e) => setSelectedTargetId(e.target.value)}
            className="bg-slate-900 border border-amber-400/60 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-black font-mono focus:outline-none focus:border-amber-300 cursor-pointer text-left dir-ltr"
          >
            {HOST_TARGET_TIERS.map((tier) => (
              <option key={tier.tierId} value={tier.tierId} className="bg-slate-950 text-white font-mono">
                {tier.tierName} ({tier.requiredDiamonds.toLocaleString()} 💎) - ${tier.baseSalaryUsd} USD
              </option>
            ))}
          </select>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800 text-xs font-bold relative z-10">
          <button
            type="button"
            onClick={() => setActiveTab('target')}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'target'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>التحقق والتقدم الحي</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tiers')}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'tiers'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>سلم الرواتب (10K - 1M)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>شروط التسكير</span>
          </button>
        </div>

        {/* Success & Error Messages */}
        {claimSuccessMsg && (
          <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-300 p-3 rounded-2xl text-xs font-bold text-center animate-in zoom-in flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{claimSuccessMsg}</span>
          </div>
        )}

        {claimErrorMsg && (
          <div className="bg-rose-950/90 border border-rose-500 text-rose-300 p-3 rounded-2xl text-xs font-bold text-center animate-in zoom-in flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{claimErrorMsg}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 1: LIVE TARGET PROGRESSION & REAL VERIFICATION */}
        {/* ============================================================ */}
        {activeTab === 'target' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            
            {/* ROOM TARGET HIGHLIGHT CARD */}
            {room && (
              <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-cyan-950/80 border-2 border-cyan-500/50 rounded-3xl p-4 space-y-3 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-cyan-200 font-bold block">
                      تارجت الغرفة (Weekly Room Target)
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-tight">
                        💎 {(room.diamonds || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-black text-xs px-3 py-1 rounded-full shadow border flex items-center gap-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 border-white/40">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>نشط</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono mt-1">
                      باقي {daysRemainingInCycle} أيام
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-cyan-100/80 mt-1">
                  هذا الرقم يمثل مجموع الماسات التي تم جمعها في هذه الغرفة خلال الأسبوع الحالي.
                </div>
              </div>
            )}

            {/* HOST TARGET HIGHLIGHT CARD */}
            <div className="bg-gradient-to-r from-amber-950/80 via-purple-950/80 to-slate-950 border-2 border-amber-400/80 rounded-3xl p-4 space-y-3 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-200 font-bold block">
                    المستهدف: <strong className="text-amber-300">{evalData.targetName}</strong> ({evalData.diamondsTarget.toLocaleString()} 💎)
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono tracking-tight">
                      💎 {evalData.currentDiamonds.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-amber-300 font-mono">
                      (الراتب: ${evalData.hostRewardUsd} USD)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className={`font-black text-xs px-3 py-1 rounded-full shadow border flex items-center gap-1 ${
                    evalData.isFullyCompleted
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 border-white/40 animate-pulse'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-white/40'
                  }`}>
                    {evalData.isFullyCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Flame className="w-3.5 h-3.5" />}
                    <span>{evalData.isFullyCompleted ? 'مكتمل وجاهز للتسكير! 🏆' : 'قيد التقدم ⏳'}</span>
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono mt-1">
                    باقي {daysRemainingInCycle} أيام بالدورة
                  </span>
                </div>
              </div>

              {/* Progress to Current Target Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300">نسبة تقدم الألماسات:</span>
                  <span className="text-cyan-300 font-mono font-black">{evalData.diamondsPercent}%</span>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-cyan-500/40 p-0.5 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-cyan-500 via-blue-400 to-cyan-300 h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                    style={{ width: `${evalData.diamondsPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                  <span>{evalData.currentDiamonds.toLocaleString()} 💎</span>
                  <span className="text-amber-200">
                    {evalData.diamondsRemaining > 0
                      ? `باقي ${evalData.diamondsRemaining.toLocaleString()} 💎 لإكمال الألماسات`
                      : '✅ اكتملت الألماسات المطلوبة!'}
                  </span>
                  <span>{evalData.diamondsTarget.toLocaleString()} 💎</span>
                </div>
              </div>
            </div>

            {/* 2. THE 3 CORE TARGET CONDITIONS (VERIFICATION ENGINE) */}
            <div className="space-y-2">
              <h4 className="font-black text-xs text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>التحقق البرمجي من شروط التسكير الثلاثة:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                
                {/* Condition 1: Diamonds */}
                <div className={`p-3 rounded-2xl border transition-all ${
                  evalData.diamondsMet
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-md'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold flex items-center gap-1">
                      <span>💎 1. الألماسات</span>
                    </span>
                    {evalData.diamondsMet ? (
                      <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">محقق ✓</span>
                    ) : (
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded-full">غير مكتمل</span>
                    )}
                  </div>
                  <strong className="text-xs font-mono font-black block mt-1">
                    {evalData.currentDiamonds.toLocaleString()} / {evalData.diamondsTarget.toLocaleString()}
                  </strong>
                  <span className="text-[8.5px] text-slate-400 block mt-0.5">
                    {evalData.diamondsMet ? 'تم استيفاء الرصيد' : `باقي ${evalData.diamondsRemaining.toLocaleString()} 💎`}
                  </span>
                </div>

                {/* Condition 2: Streaming Hours (8h) */}
                <div className={`p-3 rounded-2xl border transition-all ${
                  evalData.hoursMet
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-md'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>2. الساعات (8س)</span>
                    </span>
                    {evalData.hoursMet ? (
                      <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">محقق ✓</span>
                    ) : (
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded-full font-mono">{evalData.hoursPercent}%</span>
                    )}
                  </div>
                  <strong className="text-xs font-mono font-black block mt-1">
                    {evalData.currentHours} / 8.0 ساعة
                  </strong>
                  <span className="text-[8.5px] text-slate-400 block mt-0.5">
                    {evalData.hoursMet ? 'اكتملت 8 ساعات بث' : `باقي ${evalData.hoursRemaining} ساعة`}
                  </span>
                </div>

                {/* Condition 3: Active Days (4 days >= 2h) */}
                <div className={`p-3 rounded-2xl border transition-all ${
                  evalData.daysMet
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-md'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-cyan-400" />
                      <span>3. الأيام (4 أيام)</span>
                    </span>
                    {evalData.daysMet ? (
                      <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">محقق ✓</span>
                    ) : (
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded-full font-mono">{evalData.daysPercent}%</span>
                    )}
                  </div>
                  <strong className="text-xs font-mono font-black block mt-1">
                    {evalData.validDays} / 4 أيام نشطة
                  </strong>
                  <span className="text-[8.5px] text-slate-400 block mt-0.5">
                    {evalData.daysMet ? 'تم إكمال 4 أيام نشاط' : `باقي ${evalData.daysRemaining} أيام نشطة`}
                  </span>
                </div>

              </div>
            </div>

            {/* 3. TODAY'S LIVE STREAM TRACKER (2 HOURS RULE & 13:00 RESET) */}
            <div className="bg-slate-950/90 border border-purple-900/50 p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span>جلسة بث اليوم (نافذة احتساب اليوم الفعال):</span>
                </span>
                <span className="text-[9px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded-full border border-purple-800">
                  بداية اليوم: 13:00 ظهراً
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">ساعات بثك اليوم: <strong>{evalData.todayLiveMinutes} دقيقة</strong> ({Math.round(evalData.todayLiveMinutes / 60 * 10) / 10} س)</span>
                <span className={evalData.todayMet ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {evalData.todayMet ? '✅ تم احتساب اليوم كيوم نشط (2س)' : `باقي ${evalData.todayMinutesRemaining} دقيقة`}
                </span>
              </div>

              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    evalData.todayMet
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-purple-500 to-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((evalData.todayLiveMinutes / 120) * 100))}%` }}
                />
              </div>
            </div>

            {/* 4. CLAIM / CLOSE TARGET REWARD ACTION BUTTON */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleClaim}
                disabled={isClaiming || !evalData.isFullyCompleted || evalData.isClaimed}
                className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  evalData.isClaimed
                    ? 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
                    : evalData.isFullyCompleted
                    ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 shadow-emerald-500/30 hover:brightness-110 active:scale-95 animate-bounce'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-500 cursor-not-allowed opacity-80'
                }`}
              >
                <Award className="w-5 h-5" />
                <span>
                  {evalData.isClaimed
                    ? '✓ تم استلام وتسكير تارجت هذه الدورة'
                    : isClaiming
                    ? 'جاري التسكير وإيداع المكافأة...'
                    : evalData.isFullyCompleted
                    ? `تسكير التارجت واستلام المكافأة (${evalData.diamondsTarget.toLocaleString()} 🎯 ألماسة تارجت + $${evalData.hostRewardUsd} USD) 🏆`
                    : `استكمال الشروط لتسكير التارجت (${evalData.diamondsPercent}% الألماسات • ${evalData.hoursPercent}% الساعات • ${evalData.daysPercent}% الأيام)`}
                </span>
              </button>
            </div>

            {/* 5. WALLET JUMP BUTTON */}
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-xs">
              <span className="text-[11px] text-slate-300 font-mono">
                رصيد ألماسات التارجت المستحقة للفك (50%): <strong className="text-purple-300 font-black">🎯 {(Number(user.targetRewardDiamonds) || 0).toLocaleString()}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenWithdrawal) onOpenWithdrawal();
                }}
                className="py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] rounded-xl shadow cursor-pointer flex items-center gap-1"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>فك التارجت بالمحفظة (50%)</span>
              </button>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: TIERS & SALARIES CHART (10K - 1M) */}
        {/* ============================================================ */}
        {activeTab === 'tiers' && (
          <div className="space-y-2.5 animate-in fade-in duration-200">
            <p className="text-[11px] text-slate-300 leading-relaxed">
              جدول التارجت الأسبوعي المعتمد لصناع المحتوى والمضيفين في تطبيق <strong>SALEEM</strong> (10K حتى 1M):
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {HOST_TARGET_TIERS.map((tier) => {
                const isSelected = selectedTargetId === tier.tierId;
                const isAchieved = evalData.currentDiamonds >= tier.requiredDiamonds;

                return (
                  <div
                    key={tier.tierId}
                    onClick={() => {
                      setSelectedTargetId(tier.tierId);
                      setActiveTab('target');
                    }}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/25 via-purple-900/40 to-amber-500/25 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.01]'
                        : isAchieved
                        ? 'bg-slate-900/90 border-emerald-500/50 text-slate-200 hover:border-emerald-400'
                        : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:border-slate-700 opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl shrink-0">{tier.badge.split(' ')[1] || '🎯'}</span>
                      <div className="text-right">
                        <div className="flex items-center gap-1.5">
                          <h5 className={`font-black text-xs ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                            {tier.tierName}
                          </h5>
                          {isSelected && (
                            <span className="text-[8.5px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                              محدد حالياً ⭐
                            </span>
                          )}
                          {isAchieved && !isSelected && (
                            <span className="text-[8.5px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                              تم التسكير ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">
                          مطلوب: {tier.requiredDiamonds.toLocaleString()} 💎 • 4 أيام • 8 ساعات
                        </p>
                      </div>
                    </div>

                    <div className="text-left font-mono">
                      <span className="text-sm font-black text-emerald-400 block">${tier.baseSalaryUsd} USD</span>
                      <span className="text-[8.5px] text-amber-300 font-bold block">مكافأة الوكالة: ${tier.baseSalaryUsd > 100 ? (tier.baseSalaryUsd * 0.4).toFixed(0) : (tier.baseSalaryUsd * 0.2).toFixed(0)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: RULES & REQUIREMENTS */}
        {/* ============================================================ */}
        {activeTab === 'rules' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300 animate-in fade-in duration-200 bg-slate-950/80 p-3.5 rounded-2xl border border-purple-900/40">
            <h4 className="font-black text-sm text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>قوانين وشروط استحقاق رواتب وتسكير تارجت الوكالة:</span>
            </h4>

            <ul className="space-y-2 pr-4 list-disc list-outside text-[11px] text-slate-300">
              <li>
                <strong className="text-white">دورة التارجت الأسبوعية:</strong> الدورة تمتد لـ 7 أيام متتالية تبدأ وتتجدد أسبوعياً.
              </li>
              <li>
                <strong className="text-white">الحد الأدنى لساعات البث:</strong> مطلوب إكمال 8 ساعات بث صوتي أو مرئي كحد أدنى خلال الأسبوع.
              </li>
              <li>
                <strong className="text-white">الأيام الفعالة:</strong> مطلوب 4 أيام فعالة كحد أدنى، ويُحسب اليوم فعالاً بإكمال ساعتين على الأقل (120 دقيقة).
              </li>
              <li>
                <strong className="text-white">ساعة بداية اليوم:</strong> يبدأ احتساب اليوم الجديد رسمياً عند الساعة 13:00 (1:00 ظهراً) بتوقيت السيرفر.
              </li>
              <li>
                <strong className="text-white">فصل ألماسات التارجت:</strong> ألماسات التارجت المحققة تودع في رصيد التارجت الخاص، ويمكن فكها في المحفظة بمعدل 50%.
              </li>
            </ul>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>نظام برمجي موثق وسحابي 100% عبر خوادم Firebase</span>
          </span>
          <span className="font-mono text-amber-300">تحديث فوري للساعات والأيام</span>
        </div>

      </div>
    </div>
  );
};
