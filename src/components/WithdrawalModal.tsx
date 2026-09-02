import React, { useState, useEffect } from 'react';
import { UserProfile, WithdrawalPackage, WithdrawalGateway, WithdrawalRequest } from '../types';
import { useI18n } from '../lib/i18n';
import {
  X,
  Wallet,
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Building2,
  Smartphone,
  Globe,
  Clock,
  Sparkles,
  AlertCircle,
  Coins,
  Gem,
  Lock,
  ArrowDownLeft,
  ChevronLeft,
  Target,
  Unlock,
  Zap,
  TrendingUp,
  RotateCw,
} from 'lucide-react';
import { convertDiamondsToCoins, unlockTargetDiamonds, getUserAuthToken } from '../lib/firebase';
import { getApiBaseUrl } from '../config';

interface WithdrawalModalProps {
  user: UserProfile;
  withdrawalRequests: WithdrawalRequest[];
  onClose: () => void;
  onUpdateDiamonds: (delta: number) => void;
  onUpdateCoins: (delta: number) => void;
  onUpdateTargetRewardDiamonds?: (delta: number) => void;
  onSubmitWithdrawalRequest: (req: WithdrawalRequest) => void;
}

export const WITHDRAWAL_PACKAGES: WithdrawalPackage[] = [
  { id: 'wp-1', diamondsCount: 50000, usdAmount: 10.0, badge: 'المستوى البرونزي ⚡' },
  { id: 'wp-2', diamondsCount: 100000, usdAmount: 20.0 },
  { id: 'wp-3', diamondsCount: 250000, usdAmount: 50.0, popular: true, badge: 'الأكثر طلباً 🔥' },
  { id: 'wp-4', diamondsCount: 500000, usdAmount: 100.0, badge: 'باقة المذيع VIP' },
  { id: 'wp-5', diamondsCount: 1000000, usdAmount: 200.0 },
  { id: 'wp-6', diamondsCount: 2500000, usdAmount: 500.0, badge: 'باقة الحوت 💎' },
];

export interface RegionGatewayOption {
  id: WithdrawalGateway;
  title: string;
  regionCategory: 'gulf' | 'levant_egypt' | 'global';
  regionBadge: string;
  icon: string;
  description: string;
  inputLabel: string;
  placeholder: string;
  requiresExtraDetails?: boolean;
}

export const PAYMENT_GATEWAYS: RegionGatewayOption[] = [
  // GULF COUNTRIES (0% TAX DIRECT IBAN)
  {
    id: 'bank_transfer',
    title: 'حوالة بنكية مباشرة (Bank IBAN)',
    regionCategory: 'gulf',
    regionBadge: 'دول الخليج (السعودية، الإمارات، قطر، الكويت، عمان، البحرين)',
    icon: '🏦',
    description: 'تحويل بنكي مباشر بدون أي استقطاعات ضريبية (0% ضريبة دخل شخصي)',
    inputLabel: 'رقم الـ IBAN الدولي الحقيقي (International IBAN)',
    placeholder: 'SA00 0000 0000 0000 0000 0000',
    requiresExtraDetails: true,
  },
  // LEVANT & EGYPT (MOBILE WALLETS & INSTAPAY)
  {
    id: 'zain_cash',
    title: 'زين كاش (Zain Cash JO / IQ)',
    regionCategory: 'levant_egypt',
    regionBadge: 'الأردن والعراق',
    icon: '📱',
    description: 'محفظة زين كاش الوطنية - تحويل سريع ومعفي من الضرائب',
    inputLabel: 'رقم الهاتف المربوط بمحفظة زين كاش',
    placeholder: '079XXXXXXX (الأردن) أو 078XXXXXXX (العراق)',
  },
  {
    id: 'orange_money',
    title: 'أورانج ماني (Orange Money)',
    regionCategory: 'levant_egypt',
    regionBadge: 'الأردن',
    icon: '🍊',
    description: 'سحب كاش مباشر عبر رقم محفظة أورانج ماني الأردنية',
    inputLabel: 'رقم محفظة Orange Money',
    placeholder: '077XXXXXXX',
  },
  {
    id: 'cliq',
    title: 'نظام كليك الفوري (CliQ Jordan)',
    regionCategory: 'levant_egypt',
    regionBadge: 'الأردن',
    icon: '⚡',
    description: 'تحويل فوري لحظي 24/7 عبر اسم المستخدم (Alias) أو رقم الهاتف',
    inputLabel: 'معرف كليك (CliQ Alias) أو رقم الهاتف المربوط',
    placeholder: 'اسم المستخدم أو 079XXXXXXX',
  },
  {
    id: 'vodafone_cash',
    title: 'فودافون كاش (Vodafone Cash)',
    regionCategory: 'levant_egypt',
    regionBadge: 'مصر',
    icon: '🔴',
    description: 'تحويل مباشر وسريع على محفظة فودافون كاش مصر',
    inputLabel: 'رقم محفظة فودافون كاش',
    placeholder: '010XXXXXXXX',
  },
  {
    id: 'instapay',
    title: 'انستا باي (InstaPay Egypt)',
    regionCategory: 'levant_egypt',
    regionBadge: 'مصر',
    icon: '🟢',
    description: 'تحويل لحظي مباشر للبنك أو الحساب عبر InstaPay',
    inputLabel: 'عنوان الدفع اللحظي (IPA) أو رقم الهاتف',
    placeholder: 'user@instapay أو 011XXXXXXXX',
  },
  // GLOBAL CRYPTO & E-WALLETS
  {
    id: 'usdt_trc20',
    title: 'العملة الرقمية (USDT TRC-20)',
    regionCategory: 'global',
    regionBadge: 'جميع دول العالم 🌍',
    icon: '₮',
    description: 'سحب إلكتروني مشفر عبر شبكة TRC-20 بعمولة ثابتة $1 فقط مهما بلغ المبلغ',
    inputLabel: 'عنوان المحفظة الرقمية (TRC-20 Wallet Address)',
    placeholder: 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  },
  {
    id: 'paypal',
    title: 'بايبال (PayPal)',
    regionCategory: 'global',
    regionBadge: 'جميع دول العالم 🌍',
    icon: '🌐',
    description: 'تحويل عالمي إلكتروني لحساب PayPal الخاص بك',
    inputLabel: 'البريد الإلكتروني لحساب PayPal',
    placeholder: 'example@email.com',
  },
  {
    id: 'payoneer',
    title: 'بايونير (Payoneer)',
    regionCategory: 'global',
    regionBadge: 'جميع دول العالم 🌍',
    icon: '💳',
    description: 'سحب المبالغ الكبيرة لصناع المحتوى والمذيعين',
    inputLabel: 'بريد حساب Payoneer',
    placeholder: 'user@payoneer.com',
  },
];

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  user,
  withdrawalRequests,
  onClose,
  onUpdateDiamonds,
  onUpdateCoins,
  onUpdateTargetRewardDiamonds,
  onSubmitWithdrawalRequest,
}) => {
  const { t, dir } = useI18n();
  const [activeTab, setActiveTab] = useState<'withdraw' | 'exchange' | 'unlock_target' | 'combined' | 'history'>('exchange');

  // Withdrawal Selection State
  const [selectedPkg, setSelectedPkg] = useState<WithdrawalPackage | null>(null);
  const [regionFilter, setRegionFilter] = useState<'all' | 'gulf' | 'levant_egypt' | 'global'>('all');
  const [selectedGateway, setSelectedGateway] = useState<WithdrawalGateway | null>('zain_cash');
  const [accountDetailInput, setAccountDetailInput] = useState('');
  const [beneficiaryNameInput, setBeneficiaryNameInput] = useState('');
  const [bankNameInput, setBankNameInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Diamond to Coin Exchange State (25% Rate: 10,000 Diamonds = 2,500 Coins)
  const [exchangeDiamonds, setExchangeDiamonds] = useState<number>(10000);
  const [isExchanging, setIsExchanging] = useState(false);
  const [exchangeSuccessMsg, setExchangeSuccessMsg] = useState<string | null>(null);
  const [exchangeErrorMsg, setExchangeErrorMsg] = useState<string | null>(null);

  // Target Unlock State (50% Rate: 10,000 Target Diamonds = 5,000 Regular Diamonds)
  const [unlockAmount, setUnlockAmount] = useState<number>(10000);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockSuccessMsg, setUnlockSuccessMsg] = useState<string | null>(null);
  const [unlockErrorMsg, setUnlockErrorMsg] = useState<string | null>(null);

  // Combined Conversion State (🎯 50% + 💎 25% -> 7,500 🪙)
  const [combinedTargetAmount, setCombinedTargetAmount] = useState<number>(10000);
  const [combinedSupportAmount, setCombinedSupportAmount] = useState<number>(10000);
  const [isConverting, setIsConverting] = useState(false);
  const [combinedSuccessMsg, setCombinedSuccessMsg] = useState<string | null>(null);
  const [combinedErrorMsg, setCombinedErrorMsg] = useState<string | null>(null);

  // Server Withdrawal Records History State
  const [serverWithdrawals, setServerWithdrawals] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchUserWithdrawals = async () => {
    if (!user.id) return;
    setIsLoadingHistory(true);
    try {
      const apiBase = getApiBaseUrl();
      const token = await getUserAuthToken(user.id);
      if (!token) {
        throw new Error('جلسة تسجيل الدخول غير متاحة أو لا تطابق حساب المستخدم. يرجى تسجيل الدخول من جديد.');
      }
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      const res = await fetch(`${apiBase}/withdrawals/user/${user.id}`, {
        headers,
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.withdrawals)) {
        setServerWithdrawals(data.withdrawals);
      }
    } catch (err) {
      console.error('Failed to fetch withdrawal history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchUserWithdrawals();
    }
  }, [activeTab, user.id]);

  // Real-time balances
  const userDiamonds = Number(user.diamonds) || 0;
  const userCoins = Number(user.coins) || 0;
  const targetRewardDiamonds = Number(user.targetRewardDiamonds || 0);

  // Conversion calculations
  const estimatedUsdValue = (userDiamonds / 5000).toFixed(2);
  const calculatedCoinsYield = Math.floor((exchangeDiamonds / 10000) * 2500);
  const calculatedUnlockYield = Math.floor((unlockAmount / 10000) * 5000);
  const calculatedCombinedTargetCoins = Math.floor((combinedTargetAmount / 10000) * 5000);
  const calculatedCombinedSupportCoins = Math.floor((combinedSupportAmount / 10000) * 2500);
  const calculatedTotalCombinedCoins = calculatedCombinedTargetCoins + calculatedCombinedSupportCoins;

  const handleSelectPackage = (pkg: WithdrawalPackage) => {
    setSelectedPkg(pkg);
    setSubmissionSuccess(false);
  };

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg || !selectedGateway) return;

    if (userDiamonds < selectedPkg.diamondsCount) {
      alert(`رصيدك الحالي (${userDiamonds.toLocaleString()} ألماسة) غير كافٍ لسحب حزمة ${selectedPkg.diamondsCount.toLocaleString()} ألماسة!`);
      return;
    }

    if (!accountDetailInput.trim()) {
      alert('يرجى كتابة رقم المحفظة أو البريد الإلكتروني الخاص بجهة السحب!');
      return;
    }

    if (!user.id) {
      alert('⚠️ تعذر تحديد هوية المستخدم لإتمام طلب السحب.');
      return;
    }

    const gatewayObj = PAYMENT_GATEWAYS.find((g) => g.id === selectedGateway);

    setIsSubmitting(true);

    try {
      const apiBase = getApiBaseUrl();
      const token = await getUserAuthToken(user.id);
      if (!token) {
        throw new Error('جلسة تسجيل الدخول غير متاحة أو لا تطابق حساب المستخدم. يرجى تسجيل الدخول من جديد.');
      }
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiBase}/withdrawals/request`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: user.id,
          diamondsAmount: selectedPkg.diamondsCount,
          gateway: selectedGateway,
          accountDetails: accountDetailInput.trim(),
          beneficiaryName: beneficiaryNameInput.trim() || user.name,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'فشل تقديم طلب السحب');
      }

      // 🔒 خصم الألماسات المحجوزة فوراً في الواجهة بعد تأكيد السيرفر
      onUpdateDiamonds(-data.diamondsDeducted);

      const newRequest: WithdrawalRequest = {
        id: data.requestId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        diamondsAmount: data.diamondsDeducted,
        usdAmount: data.usdAmount,
        gateway: selectedGateway,
        gatewayTitle: gatewayObj?.title || selectedGateway,
        accountDetails: accountDetailInput.trim(),
        beneficiaryName: beneficiaryNameInput.trim() || user.name,
        status: 'PENDING',
        createdAt: new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }),
      };

      onSubmitWithdrawalRequest(newRequest);
      setSubmissionSuccess(true);
    } catch (err: any) {
      console.error('❌ Withdrawal request error:', err);
      alert(`❌ خطأ في طلب السحب: ${err?.message || 'تعذر إتمام العملية'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 💎 Execute Diamond to Coins Exchange (25% Ratio: 10,000 Diamonds = 2,500 Coins)
  const handleExecuteExchange = async () => {
    setExchangeErrorMsg(null);
    setExchangeSuccessMsg(null);

    if (exchangeDiamonds <= 0 || exchangeDiamonds % 10000 !== 0) {
      setExchangeErrorMsg('⚠️ يجب أن يكون الاستبدال بمضاعفات 10,000 ألماسة.');
      return;
    }

    if (userDiamonds < exchangeDiamonds) {
      setExchangeErrorMsg(`⚠️ رصيدك الحالي (${userDiamonds.toLocaleString()} 💎) غير كافٍ لاستبدال ${exchangeDiamonds.toLocaleString()} ألماسة.`);
      return;
    }

    if (!user.id) {
      setExchangeErrorMsg('⚠️ تعذر تحديد هوية المستخدم لإتمام العملية.');
      return;
    }

    setIsExchanging(true);

    try {
      const res = await convertDiamondsToCoins(user.id, exchangeDiamonds);
      if (!res.success) {
        throw new Error('فشل تحويل ألماسات الدعم');
      }

      // 🔒 تحديث العملات وألماسات الدعم فوراً بعد نجاح الـ Transaction
      onUpdateDiamonds(-res.diamondsUsed);
      onUpdateCoins(res.coinsAdded);

      console.log('💎 SUPPORT CONVERSION RESULT:', res);
      setExchangeSuccessMsg(`🎉 تم الاستبدال بنجاح! تم تحويل ${res.diamondsUsed.toLocaleString()} 💎 إلى +${res.coinsAdded.toLocaleString()} 🪙 (بنسبة 25%).`);
    } catch (err: any) {
      console.error('❌ Diamond conversion failed:', err);
      setExchangeErrorMsg(`❌ فشل الاستبدال: ${err?.message || 'تعذر إتمام العملية'}`);
    } finally {
      setIsExchanging(false);
    }
  };

  // 🎯 Execute Target Reward Diamonds Unlock (50% Ratio: 10,000 Target = 5,000 Coins)
  const handleExecuteUnlock = async () => {
    setUnlockErrorMsg(null);
    setUnlockSuccessMsg(null);

    if (unlockAmount <= 0 || unlockAmount % 10000 !== 0) {
      setUnlockErrorMsg('⚠️ يجب أن يكون فك ألماسات التارجت بمضاعفات 10,000.');
      return;
    }

    if (targetRewardDiamonds < unlockAmount) {
      setUnlockErrorMsg(`⚠️ رصيد ألماسات التارجت المستحقة (${targetRewardDiamonds.toLocaleString()} 🎯) غير كافٍ.`);
      return;
    }

    if (!user.id) {
      setUnlockErrorMsg('⚠️ تعذر تحديد هوية المستخدم لإتمام العملية.');
      return;
    }

    setIsUnlocking(true);

    try {
      const res = await unlockTargetDiamonds(user.id, unlockAmount);
      if (!res.success) {
        throw new Error('فشل فك ألماسات التارجت');
      }

      // 🔒 تحديث كل من ألماسات التارجت والعملات معاً فور نجاح الـ Transaction
      if (onUpdateTargetRewardDiamonds) {
        onUpdateTargetRewardDiamonds(-res.targetDiamondsUsed);
      }
      onUpdateCoins(res.coinsAdded);

      console.log('🎯 TARGET UNLOCK RESULT:', res);
      setUnlockSuccessMsg(`🎉 تم فك ${res.targetDiamondsUsed.toLocaleString()} ألماسة تارجت بنجاح وحصلت على +${res.coinsAdded.toLocaleString()} 🪙 عملة ذهبية مباشرة في محفظتك (بنسبة 50%).`);
    } catch (err: any) {
      console.error('❌ Target unlock failed:', err);
      setUnlockErrorMsg(`❌ فشل فك التارجت: ${err?.message || 'تعذر إتمام العملية'}`);
    } finally {
      setIsUnlocking(false);
    }
  };

  // 🎯💎 Execute Unified Combined Conversion (POST /diamonds/combined/convert)
  const handleExecuteCombined = async () => {
    setCombinedErrorMsg(null);
    setCombinedSuccessMsg(null);

    // 1. القيمة > 0
    if (combinedTargetAmount <= 0 && combinedSupportAmount <= 0) {
      setCombinedErrorMsg('⚠️ يجب تحديد قيمة لألماسات التارجت أو ألماسات الدعم (أكبر من 0).');
      return;
    }

    // 2. مضاعفات 10,000
    if (
      (combinedTargetAmount > 0 && combinedTargetAmount % 10000 !== 0) ||
      (combinedSupportAmount > 0 && combinedSupportAmount % 10000 !== 0)
    ) {
      setCombinedErrorMsg('⚠️ يجب أن تكون ألماسات التارجت والدعم من مضاعفات 10,000 ألماسة.');
      return;
    }

    // 3. رصيد Target كافٍ
    if (targetRewardDiamonds < combinedTargetAmount) {
      setCombinedErrorMsg(`⚠️ رصيد ألماسات التارجت المستحقة (${targetRewardDiamonds.toLocaleString()} 🎯) غير كافٍ.`);
      return;
    }

    // 4. رصيد Support كافٍ
    if (userDiamonds < combinedSupportAmount) {
      setCombinedErrorMsg(`⚠️ رصيد ألماسات الدعم الحالية (${userDiamonds.toLocaleString()} 💎) غير كافٍ.`);
      return;
    }

    // 5. user.id موجود
    if (!user.id) {
      setCombinedErrorMsg('⚠️ تعذر تحديد هوية المستخدم لإتمام العملية.');
      return;
    }

    setIsConverting(true);

    try {
      const apiBase = getApiBaseUrl();
      const response = await fetch(`${apiBase}/diamonds/combined/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          targetDiamonds: combinedTargetAmount,
          supportDiamonds: combinedSupportAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'فشلت عملية التحويل المزدوج');
      }

      // 6. تحديث الواجهة حصراً من استجابة السيرفر 200 OK
      if (onUpdateTargetRewardDiamonds) {
        onUpdateTargetRewardDiamonds(-data.targetDiamondsUsed);
      }
      onUpdateDiamonds(-data.supportDiamondsUsed);
      onUpdateCoins(data.totalCoinsAdded);

      console.log('🎯💎 COMBINED CONVERSION RESULT:', data);
      setCombinedSuccessMsg(
        `🎉 تم التحويل المزدوج بنجاح! تم فك ${data.targetDiamondsUsed.toLocaleString()} 🎯 واستبدال ${data.supportDiamondsUsed.toLocaleString()} 💎، وحصلت على +${data.totalCoinsAdded.toLocaleString()} 🪙 عملة ذهبية في محفظتك.`
      );
    } catch (err: any) {
      console.error('❌ Combined conversion failed:', err);
      setCombinedErrorMsg(`❌ فشل التحويل المزدوج: ${err?.message || 'تعذر إتمام العملية'}`);
    } finally {
      setIsConverting(false);
    }
  };

  const activeGatewayObj = PAYMENT_GATEWAYS.find((g) => g.id === selectedGateway);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 dir-rtl font-sans select-none">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="w-full max-w-lg bg-gradient-to-b from-[#191130] via-[#100a22] to-[#0a0717] border-2 border-amber-400/80 rounded-3xl p-4 sm:p-5 space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.35)] relative z-10 overflow-hidden text-right text-white max-h-[94vh] overflow-y-auto custom-scrollbar">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-24 bg-gradient-to-b from-amber-500/20 via-purple-500/10 to-transparent blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-purple-900/50 pb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 p-0.5 shadow-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-base text-amber-300">محفظة الألماسات واستبدال العملات</h3>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  سريع ⚡
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">نظام تحويل الألماسات وسحب الأرباح الفوري</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Balance Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 relative z-10">
          {/* Blue Support Diamonds Balance */}
          <div className="bg-slate-950/80 border border-cyan-500/50 p-2.5 rounded-2xl text-center shadow-lg shadow-cyan-950/30">
            <span className="text-[9px] text-cyan-300 font-bold block flex items-center justify-center gap-1">
              <Gem className="w-3.5 h-3.5 text-cyan-400" />
              <span>ألماسات الدعم (الزرقاء)</span>
            </span>
            <strong className="text-sm sm:text-base font-black text-cyan-300 font-mono block mt-0.5">
              💎 {userDiamonds.toLocaleString()}
            </strong>
            <span className="text-[8.5px] text-cyan-400/70 font-mono">استبدال بنسبة 25% 🪙</span>
          </div>

          {/* Golden Coins Balance */}
          <div className="bg-slate-950/80 border border-amber-500/50 p-2.5 rounded-2xl text-center shadow-lg shadow-amber-950/30">
            <span className="text-[9px] text-amber-300 font-bold block flex items-center justify-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>رصيد العملات</span>
            </span>
            <strong className="text-sm sm:text-base font-black text-amber-400 font-mono block mt-0.5">
              🪙 {userCoins.toLocaleString()}
            </strong>
            <span className="text-[8.5px] text-amber-300/80 font-mono">جاهزة للدعم والهدايا</span>
          </div>

          {/* Red Target Reward Diamonds */}
          <div className="col-span-2 sm:col-span-1 bg-slate-950/80 border border-rose-500/50 p-2.5 rounded-2xl text-center shadow-lg shadow-rose-950/30">
            <span className="text-[9px] text-rose-300 font-bold block flex items-center justify-center gap-1">
              <Target className="w-3.5 h-3.5 text-rose-400" />
              <span>ألماسات التارجت (الحمراء)</span>
            </span>
            <strong className="text-sm sm:text-base font-black text-rose-300 font-mono block mt-0.5">
              🔴 {targetRewardDiamonds.toLocaleString()}
            </strong>
            <span className="text-[8.5px] text-rose-400/80 font-mono">فك بنسبة 50% 🪙</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-5 gap-1 bg-slate-950/90 p-1 rounded-2xl border border-slate-800 text-[10px] sm:text-[11px] font-bold relative z-10">
          <button
            type="button"
            onClick={() => setActiveTab('exchange')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'exchange'
                ? 'bg-gradient-to-r from-cyan-600 via-sky-500 to-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="truncate">الزرقاء 💎</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('unlock_target')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'unlock_target'
                ? 'bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            <span className="truncate">الحمراء 🔴</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('combined')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'combined'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-md font-black'
                : 'text-amber-300/80 hover:text-amber-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="truncate">المزدوج 🎯💎</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('withdraw')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'withdraw'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span className="truncate">سحب كاش 💵</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-slate-800 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="truncate">السجل 📋</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: SUPPORT DIAMONDS (BLUE) TO COINS EXCHANGE (25% RATE) */}
        {/* ============================================================ */}
        {activeTab === 'exchange' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-950 border border-cyan-500/40 p-3.5 rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs sm:text-sm text-cyan-300 flex items-center gap-1.5">
                  <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
                  <span>استبدال ألماسات الدعم (الزرقاء 💎) إلى عملات ذهبية</span>
                </h4>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono font-bold px-2 py-0.5 rounded-full border border-cyan-400/30">
                  معدل 25% 🪙
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                القاعدة المعتمدة: كل <strong className="text-cyan-300">10,000 ألماسة زرقاء</strong> = <strong className="text-amber-400">2,500 عملة ذهبية 🪙</strong>. ولا يتم المساس بالألماسات الحمراء نهائياً.
              </p>
            </div>

            {/* Success & Error Messages */}
            {exchangeSuccessMsg && (
              <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-300 p-3 rounded-2xl text-xs font-bold text-center animate-in zoom-in flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{exchangeSuccessMsg}</span>
              </div>
            )}

            {exchangeErrorMsg && (
              <div className="bg-rose-950/90 border border-rose-500 text-rose-300 p-3 rounded-2xl text-xs font-bold text-center animate-in zoom-in flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{exchangeErrorMsg}</span>
              </div>
            )}

            {/* Interactive Exchange Engine */}
            <div className="bg-slate-950/90 p-4 rounded-3xl border-2 border-cyan-500/40 space-y-4 shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                {/* Input Diamonds to Convert */}
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-1">
                  <label className="block text-[11px] font-bold text-cyan-200">
                    الألماسات الزرقاء للاستبدال (مضاعفات 10,000 💎):
                  </label>
                  <input
                    type="number"
                    step="10000"
                    min="10000"
                    max={userDiamonds}
                    value={exchangeDiamonds || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setExchangeDiamonds(Math.max(0, val));
                    }}
                    placeholder="10000"
                    className="w-full bg-slate-950 border border-cyan-500/40 text-cyan-300 font-mono font-black text-xl p-2.5 rounded-xl text-center focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[9px] text-slate-500 block text-center">
                    رصيدك الأزرق المتاح: {userDiamonds.toLocaleString()} 💎
                  </span>
                </div>

                {/* Received Coins at 25% Rate */}
                <div className="bg-gradient-to-br from-cyan-950/80 to-slate-900 border border-cyan-500/40 p-3 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-amber-300 font-bold block">
                    العملات الذهبية المستلمة (25%):
                  </span>
                  <span className="font-mono text-2xl font-black text-amber-400 block tracking-tight">
                    +{calculatedCoinsYield.toLocaleString()} 🪙
                  </span>
                  <span className="text-[9px] text-slate-400 block">
                    (10,000 💎 = 2,500 🪙)
                  </span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold block">خيارات سريعة للاستبدال:</span>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {[10000, 20000, 50000, 100000, 250000, 500000, 1000000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setExchangeDiamonds(val)}
                      disabled={userDiamonds < val}
                      className={`py-2 px-1 rounded-xl text-[10px] font-mono font-black transition-all cursor-pointer ${
                        exchangeDiamonds === val
                          ? 'bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 shadow-lg scale-105 font-black'
                          : userDiamonds < val
                          ? 'bg-slate-900/40 text-slate-600 border border-slate-900 cursor-not-allowed'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-500/50 hover:text-white'
                      }`}
                    >
                      {val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}K`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleExecuteExchange}
                disabled={isExchanging || exchangeDiamonds <= 0 || exchangeDiamonds % 10000 !== 0 || userDiamonds < exchangeDiamonds}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-500 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeftRight className="w-5 h-5 text-slate-950" />
                <span>
                  {isExchanging
                    ? 'جاري استبدال الألماسات الزرقاء...'
                    : `استبدال ${exchangeDiamonds.toLocaleString()} ألماسة زرقاء إلى ${calculatedCoinsYield.toLocaleString()} 🪙 (25%)`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: TARGET REWARDS (RED) UNLOCK (50% RATE -> COINS) */}
        {/* ============================================================ */}
        {activeTab === 'unlock_target' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-950 border border-rose-500/40 p-3.5 rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs sm:text-sm text-rose-300 flex items-center gap-1.5">
                  <Unlock className="w-4 h-4 text-rose-400" />
                  <span>فك ألماسات التارجت (الحمراء 🔴) إلى عملات ذهبية</span>
                </h4>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 font-mono font-bold px-2 py-0.5 rounded-full border border-rose-400/30">
                  معدل 50% 🪙
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                القاعدة المعتمدة: كل <strong className="text-rose-300">10,000 ألماسة حمراء</strong> مستحقة = <strong className="text-amber-300">5,000 عملة ذهبية 🪙</strong> تضاف مباشرة لرصيد العملات. ولا يتم المساس بالألماسات الزرقاء.
              </p>
            </div>

            {/* Success & Error Messages */}
            {unlockSuccessMsg && (
              <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-300 p-3 rounded-2xl text-xs font-bold text-center animate-in zoom-in flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{unlockSuccessMsg}</span>
              </div>
            )}

            {unlockErrorMsg && (
              <div className="bg-rose-950/90 border border-rose-500 text-rose-300 p-3 rounded-2xl text-xs font-bold text-center animate-in zoom-in flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{unlockErrorMsg}</span>
              </div>
            )}

            {/* Interactive Unlock Engine */}
            <div className="bg-slate-950/90 p-4 rounded-3xl border-2 border-rose-500/40 space-y-4 shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                {/* Input Target Diamonds */}
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-1">
                  <label className="block text-[11px] font-bold text-rose-200">
                    الألماسات الحمراء لفكها (مضاعفات 10,000 🔴):
                  </label>
                  <input
                    type="number"
                    step="10000"
                    min="10000"
                    max={targetRewardDiamonds}
                    value={unlockAmount || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setUnlockAmount(Math.max(0, val));
                    }}
                    placeholder="10000"
                    className="w-full bg-slate-950 border border-rose-500/40 text-rose-300 font-mono font-black text-xl p-2.5 rounded-xl text-center focus:outline-none focus:border-rose-400"
                  />
                  <span className="text-[9px] text-slate-500 block text-center">
                    رصيدك الأحمر المستحق: {targetRewardDiamonds.toLocaleString()} 🔴
                  </span>
                </div>

                {/* Received Gold Coins */}
                <div className="bg-gradient-to-br from-rose-950/80 to-slate-900 border border-rose-500/40 p-3 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-rose-300/80 font-bold block">
                    العملات الذهبية المستلمة (50%):
                  </span>
                  <span className="font-mono text-2xl font-black text-amber-400 block tracking-tight">
                    +{calculatedUnlockYield.toLocaleString()} 🪙
                  </span>
                  <span className="text-[9px] text-slate-400 block">
                    (10,000 🔴 = 5,000 🪙)
                  </span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold block">خيارات سريعة لفك التارجت الأحمر:</span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                  {[10000, 20000, 50000, 100000, 250000, 500000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setUnlockAmount(val)}
                      disabled={targetRewardDiamonds < val}
                      className={`py-2 px-1 rounded-xl text-[10px] font-mono font-black transition-all cursor-pointer ${
                        unlockAmount === val
                          ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg scale-105 font-black'
                          : targetRewardDiamonds < val
                          ? 'bg-slate-900/40 text-slate-600 border border-slate-900 cursor-not-allowed'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-rose-500/50 hover:text-white'
                      }`}
                    >
                      {val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}K`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleExecuteUnlock}
                disabled={isUnlocking || unlockAmount <= 0 || unlockAmount % 10000 !== 0 || targetRewardDiamonds < unlockAmount}
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-red-600 to-rose-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm rounded-2xl shadow-xl hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Unlock className="w-5 h-5 text-white" />
                <span>
                  {isUnlocking
                    ? 'جاري فك ألماسات التارجت الحمراء...'
                    : `فك ${unlockAmount.toLocaleString()} ألماسة حمراء إلى ${calculatedUnlockYield.toLocaleString()} 🪙 عملة (50%)`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: UNIFIED COMBINED CONVERSION (TARGET 50% + SUPPORT 25%) */}
        {/* ============================================================ */}
        {activeTab === 'combined' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="bg-gradient-to-r from-amber-950/60 via-purple-950/60 to-slate-950 border-2 border-amber-500/40 p-3.5 rounded-2xl space-y-1 shadow-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs sm:text-sm text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>التحويل المزدوج الشامل (تارجت 🔴 + دعم 💎 ➔ عملات 🪙)</span>
                </h4>
                <span className="text-[10px] bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-mono font-black px-2.5 py-0.5 rounded-full shadow">
                  عملية ذرية واحدة ⚡
                </span>
              </div>
              <p className="text-[10px] text-slate-300">
                الحسبة المعتمدة: كل <strong className="text-rose-300">10,000 تارجت (5,000 🪙)</strong> + كل <strong className="text-cyan-300">10,000 دعم (2,500 🪙)</strong> = <strong className="text-yellow-300 font-mono font-bold">+7,500 عملة ذهبية 🪙</strong> في عملية تحويل موحدة مباشرة عبر السيرفر.
              </p>
            </div>

            {/* Success & Error Messages */}
            {combinedSuccessMsg && (
              <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-300 p-3 rounded-2xl text-xs font-bold text-center animate-in zoom-in flex items-center justify-center gap-2 shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{combinedSuccessMsg}</span>
              </div>
            )}

            {combinedErrorMsg && (
              <div className="bg-rose-950/90 border border-rose-500 text-rose-300 p-3 rounded-2xl text-xs font-bold text-center animate-in zoom-in flex items-center justify-center gap-2 shadow-lg">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{combinedErrorMsg}</span>
              </div>
            )}

            {/* Interactive Dual-Input Studio */}
            <div className="bg-slate-950/90 p-4 rounded-3xl border-2 border-amber-500/40 space-y-4 shadow-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Input Target Diamonds */}
                <div className="bg-slate-900/90 border border-rose-500/40 p-3 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-rose-200 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-rose-400" />
                      <span>ألماسات التارجت (50%):</span>
                    </label>
                    <span className="text-[9px] text-rose-400 font-mono font-bold">
                      +{calculatedCombinedTargetCoins.toLocaleString()} 🪙
                    </span>
                  </div>
                  <input
                    type="number"
                    step="10000"
                    min="0"
                    max={targetRewardDiamonds}
                    value={combinedTargetAmount || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setCombinedTargetAmount(Math.max(0, val));
                    }}
                    placeholder="10000"
                    className="w-full bg-slate-950 border border-rose-500/50 text-rose-300 font-mono font-black text-lg p-2 rounded-xl text-center focus:outline-none focus:border-rose-400"
                  />
                  <span className="text-[8.5px] text-slate-400 block text-center">
                    رصيدك المستحق: {targetRewardDiamonds.toLocaleString()} 🔴
                  </span>
                </div>

                {/* 2. Input Support Diamonds */}
                <div className="bg-slate-900/90 border border-cyan-500/40 p-3 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-cyan-200 flex items-center gap-1">
                      <Gem className="w-3.5 h-3.5 text-cyan-400" />
                      <span>ألماسات الدعم (25%):</span>
                    </label>
                    <span className="text-[9px] text-cyan-400 font-mono font-bold">
                      +{calculatedCombinedSupportCoins.toLocaleString()} 🪙
                    </span>
                  </div>
                  <input
                    type="number"
                    step="10000"
                    min="0"
                    max={userDiamonds}
                    value={combinedSupportAmount || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setCombinedSupportAmount(Math.max(0, val));
                    }}
                    placeholder="10000"
                    className="w-full bg-slate-950 border border-cyan-500/50 text-cyan-300 font-mono font-black text-lg p-2 rounded-xl text-center focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[8.5px] text-slate-400 block text-center">
                    رصيد الدعم: {userDiamonds.toLocaleString()} 💎
                  </span>
                </div>
              </div>

              {/* Total Output Banner */}
              <div className="bg-gradient-to-r from-amber-950/80 via-yellow-950/80 to-amber-950/80 border-2 border-yellow-500/60 p-3 rounded-2xl flex items-center justify-between shadow-lg">
                <div className="text-start">
                  <span className="text-[10px] text-amber-300 font-bold block">إجمالي العملات الذهبية الناتجة:</span>
                  <span className="text-[9px] text-slate-300">
                    ({calculatedCombinedTargetCoins.toLocaleString()} تارجت + {calculatedCombinedSupportCoins.toLocaleString()} دعم)
                  </span>
                </div>
                <div className="text-end">
                  <span className="font-mono text-2xl font-black text-yellow-300 drop-shadow">
                    +{calculatedTotalCombinedCoins.toLocaleString()} 🪙
                  </span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold block">خيارات سريعة للتحويل المزدوج:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { target: 10000, support: 10000, label: '10K + 10K', coins: '7,500 🪙' },
                    { target: 20000, support: 20000, label: '20K + 20K', coins: '15,000 🪙' },
                    { target: 50000, support: 50000, label: '50K + 50K', coins: '37,500 🪙' },
                    { target: 100000, support: 100000, label: '100K + 100K', coins: '75,000 🪙' },
                  ].map((preset, idx) => {
                    const isAffordable = targetRewardDiamonds >= preset.target && userDiamonds >= preset.support;
                    const isSelected = combinedTargetAmount === preset.target && combinedSupportAmount === preset.support;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCombinedTargetAmount(preset.target);
                          setCombinedSupportAmount(preset.support);
                        }}
                        disabled={!isAffordable}
                        className={`p-2 rounded-xl text-center transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-gradient-to-b from-amber-500 to-yellow-600 text-slate-950 border-amber-300 font-black shadow-lg scale-[1.02]'
                            : isAffordable
                            ? 'bg-slate-900 border-slate-800 text-amber-200 hover:border-amber-400/50'
                            : 'bg-slate-900/40 text-slate-600 border-slate-900 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-[10px] font-bold font-mono">{preset.label}</div>
                        <div className="text-[9px] text-amber-300 font-mono mt-0.5 font-bold">{preset.coins}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleExecuteCombined}
                disabled={
                  isConverting ||
                  (combinedTargetAmount <= 0 && combinedSupportAmount <= 0) ||
                  (combinedTargetAmount > 0 && combinedTargetAmount % 10000 !== 0) ||
                  (combinedSupportAmount > 0 && combinedSupportAmount % 10000 !== 0) ||
                  targetRewardDiamonds < combinedTargetAmount ||
                  userDiamonds < combinedSupportAmount
                }
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-2xl shadow-2xl hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
                <span>
                  {isConverting
                    ? 'جاري تنفيذ التحويل المزدوج في السيرفر...'
                    : `تأكيد التحويل المزدوج واستلام ${calculatedTotalCombinedCoins.toLocaleString()} 🪙`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: CASH WITHDRAWAL */}
        {/* ============================================================ */}
        {activeTab === 'withdraw' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Packages Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">اختر باقة السحب المالي (USD):</span>
                <span className="text-[10px] text-amber-300 font-mono">5,000 💎 = $1.00 USD</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {WITHDRAWAL_PACKAGES.map((pkg) => {
                  const isSelected = selectedPkg?.id === pkg.id;
                  const isAffordable = userDiamonds >= pkg.diamondsCount;

                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => handleSelectPackage(pkg)}
                      className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-b from-amber-500 to-yellow-600 border-amber-300 text-slate-950 shadow-xl scale-[1.02]'
                          : isAffordable
                          ? 'bg-slate-900 border-slate-800 text-white hover:border-amber-400/50'
                          : 'bg-slate-950 border-slate-900 text-slate-600 opacity-60'
                      }`}
                    >
                      {pkg.badge && (
                        <span className="absolute top-1 right-1 text-[8px] bg-black/40 text-amber-300 px-1.5 py-0.5 rounded-full font-bold">
                          {pkg.badge}
                        </span>
                      )}

                      <div className="font-mono font-black text-base sm:text-lg mt-2">
                        ${pkg.usdAmount.toFixed(2)}
                      </div>

                      <div className="text-[10px] font-mono text-cyan-300 mt-1">
                        💎 {pkg.diamondsCount.toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Package Details & Gateways */}
            {selectedPkg && (
              <form onSubmit={handleSubmitWithdrawal} className="space-y-3 bg-slate-950 p-4 rounded-3xl border border-slate-800">
                <h4 className="font-black text-xs text-amber-300 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>طريقة السحب وبوابات الدفع:</span>
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_GATEWAYS.slice(0, 6).map((gw) => (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => setSelectedGateway(gw.id)}
                      className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                        selectedGateway === gw.id
                          ? 'bg-emerald-950/80 border-emerald-400 text-white shadow'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <span>{gw.icon}</span>
                        <span className="truncate">{gw.title}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Account Details Input */}
                {activeGatewayObj && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="block text-[11px] font-bold text-slate-300">
                      {activeGatewayObj.inputLabel} *
                    </label>
                    <input
                      type="text"
                      required
                      value={accountDetailInput}
                      onChange={(e) => setAccountDetailInput(e.target.value)}
                      placeholder={activeGatewayObj.placeholder}
                      className="w-full bg-slate-900 border border-slate-700 text-xs rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400 font-mono"
                    />

                    <label className="block text-[11px] font-bold text-slate-300">
                      اسم المستفيد الثلاثي *
                    </label>
                    <input
                      type="text"
                      required
                      value={beneficiaryNameInput}
                      onChange={(e) => setBeneficiaryNameInput(e.target.value)}
                      placeholder="مثال: سليم محمد أحمد"
                      className="w-full bg-slate-900 border border-slate-700 text-xs rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-black text-sm rounded-2xl shadow-xl hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <DollarSign className="w-5 h-5 text-slate-950" />
                  <span>
                    {isSubmitting
                      ? 'جاري تأكيد السحب وتشفير البيانات...'
                      : `تأكيد طلب السحب بقيمة $${selectedPkg.usdAmount} USD (${selectedPkg.diamondsCount.toLocaleString()} 💎)`}
                  </span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: TRANSACTION STATUS & HISTORY */}
        {/* ============================================================ */}
        {/* TAB 5: TRANSACTION STATUS & HISTORY (LIVE FROM SERVER) */}
        {/* ============================================================ */}
        {activeTab === 'history' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-300">سجل طلبات السحب والمعاملات المعتمدة:</h3>
              <button
                type="button"
                onClick={fetchUserWithdrawals}
                disabled={isLoadingHistory}
                className="text-[10px] text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-xl cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`w-3 h-3 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                <span>تحديث السجل</span>
              </button>
            </div>

            {(() => {
              const displayList = serverWithdrawals.length > 0 ? serverWithdrawals : withdrawalRequests;

              if (isLoadingHistory && displayList.length === 0) {
                return (
                  <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs space-y-2">
                    <RotateCw className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
                    <p>جاري جلب سجل السحوبات المباشر من السيرفر...</p>
                  </div>
                );
              }

              if (displayList.length === 0) {
                return (
                  <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs space-y-2">
                    <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                    <p>لا توجد طلبات سحب سابقة لحسابك حالياً.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                  {displayList.map((req) => {
                    const formattedDate = req.createdAt ? new Date(req.createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }) : 'الآن';
                    const gatewayName = req.gatewayTitle || req.gateway;

                    return (
                      <div
                        key={req.id}
                        className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-white">{gatewayName}</span>
                            <span className="font-mono text-[10px] text-slate-400">({req.id})</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            الحساب / المحفظة: {typeof req.accountDetails === 'string' ? req.accountDetails : req.accountDetails?.phoneOrEmailOrIban}
                          </div>
                          {req.status === 'REJECTED' && req.rejectionReason && (
                            <div className="text-[10px] text-rose-400 bg-rose-950/60 border border-rose-500/30 px-2 py-1 rounded-lg">
                              ⚠️ سبب الرفض: {req.rejectionReason}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-500 font-mono">{formattedDate}</div>
                        </div>

                        <div className="text-right sm:text-left shrink-0">
                          <div className="font-mono font-black text-emerald-400 text-sm">${req.usdAmount}.00 USD</div>
                          <div className="text-[10px] text-cyan-300 font-mono">{req.diamondsAmount?.toLocaleString()} 💎</div>

                          <span
                            className={`inline-block text-[9.5px] font-black px-2.5 py-1 rounded-full mt-1.5 border shadow ${
                              req.status === 'PENDING'
                                ? 'bg-amber-950/90 text-amber-300 border-amber-500/50 animate-pulse'
                                : req.status === 'PROCESSING'
                                ? 'bg-sky-950/90 text-sky-300 border-sky-500/50 animate-pulse'
                                : req.status === 'SUCCESS'
                                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                                : 'bg-rose-950/90 text-rose-300 border-rose-500/50'
                            }`}
                          >
                            {req.status === 'PENDING'
                              ? '⏳ قيد المراجعة'
                              : req.status === 'PROCESSING'
                              ? '🔄 جارٍ تنفيذ السحب'
                              : req.status === 'SUCCESS'
                              ? '✅ تم السحب بنجاح'
                              : '❌ مرفوض'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>نظام موثق وسحابي 100% عبر Firebase Realtime DB</span>
          </span>
          <span className="font-mono text-amber-300">معدل التحويل: 25%</span>
        </div>

      </div>
    </div>
  );
};
