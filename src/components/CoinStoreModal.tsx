import React, { useState } from 'react';
import { UserProfile, CoinPackage, TransactionRecord } from '../types';
import { COIN_PACKAGES } from '../data/mockData';
import {
  X,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  Smartphone,
  Globe,
  Flame,
  Crown,
  ChevronRight,
  Gift,
  Coins,
  DollarSign,
  TrendingUp,
  MessageCircle,
  HelpCircle,
  Sliders,
  History,
  Zap,
} from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface CoinStoreModalProps {
  user: UserProfile;
  onClose: () => void;
  onPurchaseSuccess: (coinsAdded: number, tx: TransactionRecord) => void;
}

type PaymentGatewayTab = 'google_apple' | 'cards' | 'wallets' | 'crypto' | 'agents';
type StoreViewTab = 'packages' | 'custom' | 'history';

export const CoinStoreModal: React.FC<CoinStoreModalProps> = ({
  user,
  onClose,
  onPurchaseSuccess,
}) => {
  const { t, dir } = useI18n();

  // Active Tabs
  const [storeTab, setStoreTab] = useState<StoreViewTab>('packages');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayTab>('google_apple');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<'all' | 'popular' | 'vip' | 'whales'>('all');

  // Selected package and checkout state
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [purchaseStep, setPurchaseStep] = useState<'SELECT' | 'CHECKOUT' | 'VERIFYING' | 'SUCCESS'>('SELECT');
  const [lastTx, setLastTx] = useState<TransactionRecord | null>(null);

  // Form State for Checkout
  const [walletPhone, setWalletPhone] = useState<string>('');
  const [walletProvider, setWalletProvider] = useState<string>('zain_cash');
  const [walletOtp, setWalletOtp] = useState<string>('');
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Custom Amount Slider / Input State
  const [customCoins, setCustomCoins] = useState<number>(25000);

  // Filtered packages
  const filteredPackages = COIN_PACKAGES.filter((pkg) => {
    if (selectedFilterCategory === 'popular') return pkg.popular;
    if (selectedFilterCategory === 'vip') return pkg.coinsAmount >= 20000 && pkg.coinsAmount <= 100000;
    if (selectedFilterCategory === 'whales') return pkg.coinsAmount >= 200000;
    return true;
  });

  // Calculate VIP / Wealth Progression
  const currentCoins = user.coins || 0;
  const currentVip = user.vipLevel || 1;
  const nextVipCoinsNeeded = 50000 - (currentCoins % 50000);

  // Custom amount calculations
  const calculateCustomPrice = (coins: number) => {
    const usd = (coins / 1000) * 0.99;
    const bonus = Math.round(coins * 0.15); // 15% bonus
    return {
      priceUsd: usd.toFixed(2),
      priceSar: (usd * 3.75).toFixed(2),
      priceJod: (usd * 0.71).toFixed(2),
      priceEgp: (usd * 49.5).toFixed(0),
      bonusCoins: bonus,
      totalCoins: coins + bonus,
    };
  };

  const customCalc = calculateCustomPrice(customCoins);

  const handleSelectPackageToBuy = (pkg: CoinPackage) => {
    setSelectedPackage(pkg);
    setFormError('');
    setIsOtpSent(false);
    setWalletOtp('');
    setPurchaseStep('CHECKOUT');
  };

  const handleProcessFinalPayment = () => {
    if (!selectedPackage) return;
    setFormError('');

    // Validation per gateway
    if (selectedGateway === 'wallets') {
      if (!walletPhone.trim() || walletPhone.length < 8) {
        setFormError('يرجى إدخال رقم هاتف/محفظة صالح للاستمرار');
        return;
      }
      if (!isOtpSent) {
        setIsOtpSent(true);
        return;
      }
      if (!walletOtp.trim() || walletOtp.length < 4) {
        setFormError('يرجى إدخال رمز التحقق (OTP/PIN) المرسل إلى هاتفك');
        return;
      }
    } else if (selectedGateway === 'cards') {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (cleanCard.length < 15) {
        setFormError('يرجى إدخال رقم بطاقة صالح يتكون من 16 رقماً');
        return;
      }
      if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
        setFormError('يرجى إدخال تاريخ انتهاء البطاقة بالشكل (MM/YY)');
        return;
      }
      if (cardCvv.length < 3) {
        setFormError('يرجى إدخال رمز الأمان CVV (3 أرقام)');
        return;
      }
      if (!cardHolder.trim()) {
        setFormError('يرجى إدخال اسم حامل البطاقة');
        return;
      }
    }

    setIsProcessing(true);
    setPurchaseStep('VERIFYING');

    setTimeout(() => {
      const generatedOrderId = `GPA.${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10000 + Math.random() * 90000)}`;
      const generatedToken = `token_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const totalCoins = selectedPackage.coinsAmount + selectedPackage.bonusCoins;

      const newTx: TransactionRecord = {
        id: `tx-${Date.now()}`,
        googleOrderId: generatedOrderId,
        userId: user.id,
        userName: user.name,
        packageName: selectedPackage.title,
        amountCoins: totalCoins,
        priceUsd: selectedPackage.priceUsd,
        purchaseToken: generatedToken,
        status: 'SUCCESS',
        timestamp: new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }),
      };

      setLastTx(newTx);
      setIsProcessing(false);
      setPurchaseStep('SUCCESS');
      onPurchaseSuccess(totalCoins, newTx);
    }, 1800);
  };

  const handleBuyCustom = () => {
    const pkg: CoinPackage = {
      id: `pkg-custom-${customCoins}`,
      title: `شحن مخصص ${customCoins.toLocaleString()} كوينز`,
      coinsAmount: customCoins,
      bonusCoins: customCalc.bonusCoins,
      priceUsd: parseFloat(customCalc.priceUsd),
      priceSar: parseFloat(customCalc.priceSar),
      googlePlayProductId: 'com.saleem.app.custom_coins',
    };
    handleSelectPackageToBuy(pkg);
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 font-sans select-none">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="w-full max-w-2xl bg-gradient-to-b from-[#18102e] via-[#100a20] to-[#0a0716] border-2 border-amber-400/80 rounded-3xl p-4 sm:p-5 shadow-[0_0_60px_rgba(245,158,11,0.35)] relative z-10 overflow-hidden text-right text-white max-h-[94vh] flex flex-col space-y-3.5">
        
        {/* Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-gradient-to-b from-amber-500/25 via-purple-600/15 to-transparent blur-3xl pointer-events-none" />

        {/* 1. TOP HEADER & BALANCE */}
        <div className="flex items-center justify-between border-b border-purple-900/50 pb-3 relative z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 p-0.5 shadow-lg flex items-center justify-center">
              <Coins className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-base text-amber-300">متجر شحن العملات الملكي</h3>
                <span className="text-[9px] bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black px-2 py-0.5 rounded-full shadow">
                  بونص إضافي 🎁
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                شحن فوري ومضمون 100% معتمد عبر جميع بوابات الدفع
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* User Live Balance Pill */}
            <div className="bg-slate-950/80 border border-amber-500/50 rounded-2xl px-3 py-1 text-left font-mono">
              <span className="text-[8.5px] text-slate-400 block text-right">رصيدك الحالي:</span>
              <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                🪙 {user.coins.toLocaleString()}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. FIRST RECHARGE DOUBLE COINS BANNER */}
        <div className="bg-gradient-to-r from-amber-500/20 via-purple-600/30 to-pink-500/20 border border-amber-400/60 rounded-2xl p-2.5 flex items-center justify-between shadow-inner shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black text-xs shadow">
              🔥 x2
            </div>
            <div>
              <span className="text-xs font-black text-amber-200 block">
                عرض خاص: بونص مضاعف على جميع باقات الشحن!
              </span>
              <span className="text-[9.5px] text-slate-300">
                اشحن الآن واحصل على عملات بونص مجانية + نقاط ترقية فورية لمستوى الثراء (VIP) 👑
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-amber-500/30 text-amber-300 text-[10px] font-mono font-bold px-2 py-1 rounded-xl border border-amber-400/40">
            <Zap className="w-3 h-3 text-amber-300" />
            <span>تسليم فوري</span>
          </div>
        </div>

        {/* 3. STORE VIEW NAVIGATION TABS */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-2xl border border-slate-800 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => { setStoreTab('packages'); setPurchaseStep('SELECT'); }}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              storeTab === 'packages'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>باقات الشحن الرسمية</span>
          </button>

          <button
            type="button"
            onClick={() => { setStoreTab('custom'); setPurchaseStep('SELECT'); }}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              storeTab === 'custom'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>شحن مخصص بأي قيمة</span>
          </button>

          <button
            type="button"
            onClick={() => { setStoreTab('history'); setPurchaseStep('SELECT'); }}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              storeTab === 'history'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>سجل المعاملات</span>
          </button>
        </div>

        {/* 4. PAYMENT GATEWAY SELECTOR (WHEN IN PACKAGES OR CUSTOM) */}
        {storeTab !== 'history' && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar shrink-0">
            <button
              type="button"
              onClick={() => setSelectedGateway('google_apple')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 border ${
                selectedGateway === 'google_apple'
                  ? 'bg-slate-900 border-amber-400 text-amber-300 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Google Play / Apple Pay</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGateway('cards')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 border ${
                selectedGateway === 'cards'
                  ? 'bg-slate-900 border-amber-400 text-amber-300 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>فيزا / ماستركارد / مدى</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGateway('wallets')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 border ${
                selectedGateway === 'wallets'
                  ? 'bg-slate-900 border-amber-400 text-amber-300 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zain Cash / STC Pay / CliQ</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGateway('crypto')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 border ${
                selectedGateway === 'crypto'
                  ? 'bg-slate-900 border-amber-400 text-amber-300 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span>USDT / Binance Pay</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGateway('agents')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 border ${
                selectedGateway === 'agents'
                  ? 'bg-slate-900 border-amber-400 text-amber-300 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>وكيل معتمد (WhatsApp)</span>
            </button>
          </div>
        )}

        {/* 5. MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
          
          {/* CHECKOUT PAYMENT DIALOG */}
          {purchaseStep === 'CHECKOUT' && selectedPackage && (
            <div className="p-4 sm:p-5 bg-gradient-to-b from-[#1c1236] to-[#100a20] rounded-3xl border-2 border-amber-400/80 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-right">
              {/* Top Banner */}
              <div className="flex items-center justify-between border-b border-purple-900/60 pb-3">
                <div>
                  <h3 className="font-black text-amber-300 text-sm sm:text-base flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>تأكيد بيانات الدفع والشحن 💳</span>
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    الباقة المحددة: <strong className="text-white font-bold">{selectedPackage.title}</strong>
                  </p>
                </div>
                <div className="text-left font-mono">
                  <span className="text-xs text-slate-400 block">المبلغ المطلوب:</span>
                  <span className="text-sm sm:text-base font-black text-emerald-400 block">${selectedPackage.priceUsd} USD</span>
                </div>
              </div>

              {/* Error Banner */}
              {formError && (
                <div className="bg-rose-950/80 border border-rose-500/50 rounded-2xl p-2.5 text-xs text-rose-200 flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. WALLETS (Zain Cash, Vodafone Cash, CliQ, STC Pay) */}
              {selectedGateway === 'wallets' && (
                <div className="space-y-3">
                  {/* Provider Selector */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-300">اختر المحفظة الإلكترونية:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { id: 'zain_cash', name: 'زين كاش (الأردن) 🇯🇴', currency: `${(selectedPackage.priceUsd * 0.71).toFixed(2)} JOD` },
                        { id: 'vodafone_cash', name: 'فودافون كاش 🇪🇬', currency: `${(selectedPackage.priceUsd * 49.5).toFixed(0)} EGP` },
                        { id: 'stc_pay', name: 'STC Pay 🇸🇦', currency: `${(selectedPackage.priceUsd * 3.75).toFixed(2)} SAR` },
                        { id: 'cliq', name: 'CliQ فوري 🇯🇴', currency: `${(selectedPackage.priceUsd * 0.71).toFixed(2)} JOD` },
                      ].map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setWalletProvider(w.id)}
                          className={`p-2 rounded-xl border text-right transition-all cursor-pointer ${
                            walletProvider === w.id
                              ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-md'
                              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          <span className="font-bold text-[10px] block">{w.name}</span>
                          <span className="text-[9px] font-mono text-amber-300 block mt-0.5">{w.currency}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Phone / Wallet Number Input */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-300">
                      رقم الهاتف / رقم حساب المحفظة المسجل:
                    </label>
                    <input
                      type="tel"
                      value={walletPhone}
                      onChange={(e) => setWalletPhone(e.target.value)}
                      placeholder={walletProvider === 'vodafone_cash' ? '010XXXXXXXX' : '07XXXXXXXX'}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:border-amber-400 outline-none"
                    />
                  </div>

                  {/* OTP Step */}
                  {isOtpSent && (
                    <div className="bg-slate-900/90 border border-amber-500/50 rounded-2xl p-3 space-y-2 animate-in fade-in">
                      <label className="block text-[11px] font-bold text-amber-300 flex items-center justify-between">
                        <span>أدخل رمز التحقق (OTP) أو PIN المعاملة:</span>
                        <span className="text-[9px] text-emerald-400">تم إرسال الرمز للهاتف ✓</span>
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        value={walletOtp}
                        onChange={(e) => setWalletOtp(e.target.value)}
                        placeholder="••••••"
                        className="w-full bg-slate-950 border border-amber-400/60 rounded-xl px-3 py-2 text-center text-sm tracking-widest text-amber-300 font-mono focus:border-amber-300 outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 2. CREDIT / DEBIT CARDS (Visa, MasterCard, Mada) */}
              {selectedGateway === 'cards' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-300">رقم البطاقة الائتمانية (16 رقماً):</label>
                    <input
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
                        setCardNumber(val);
                      }}
                      placeholder="4532 •••• •••• ••••"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300">تاريخ الانتهاء:</label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-center text-white font-mono focus:border-amber-400 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300">رمز الأمان CVV:</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-center text-white font-mono focus:border-amber-400 outline-none"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1 space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300">اسم حامل البطاقة:</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="CARDHOLDER NAME"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. GOOGLE PLAY / IN-APP BILLING */}
              {selectedGateway === 'google_apple' && (
                <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-4 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center mx-auto text-cyan-300">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-xs text-cyan-200">الدفع المباشر عبر Google Play / Apple Pay</h4>
                  <p className="text-[10px] text-slate-300">
                    سيتم تأكيد الدفع عبر متجر التطبيقات الرسمي وإضافة العملات الذهبية فورياً لحسابك.
                  </p>
                </div>
              )}

              {/* 4. CRYPTO / USDT */}
              {selectedGateway === 'crypto' && (
                <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-3.5 space-y-2 text-center">
                  <span className="text-[10px] font-bold text-purple-300 block">عنوان محفظة USDT (TRC-20) الرسمي:</span>
                  <div className="bg-slate-950 p-2 rounded-xl font-mono text-[10px] text-amber-300 break-all select-all border border-slate-800">
                    TXYZ8829104RoyalSaleemPayOfficialTRC20
                  </div>
                  <p className="text-[9px] text-slate-400">يرجى تحويل المبلغ والمتابعة لتأكيد المعاملة تلقائياً.</p>
                </div>
              )}

              {/* Checkout Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleProcessFinalPayment}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-amber-950/50 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {selectedGateway === 'wallets' && !isOtpSent
                      ? 'متابعة وإرسال رمز التحقق SMS 📱'
                      : `تأكيد الدفع وخصم $${selectedPackage.priceUsd} 🪙`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPurchaseStep('SELECT')}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl cursor-pointer"
                >
                  رجوع
                </button>
              </div>
            </div>
          )}

          {/* VERIFYING MODAL STATE */}
          {purchaseStep === 'VERIFYING' && selectedPackage && (
            <div className="p-8 text-center space-y-4 bg-slate-950/90 rounded-3xl border-2 border-amber-400/60 animate-pulse my-auto">
              <div className="w-14 h-14 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mx-auto shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
              <div>
                <h3 className="font-black text-amber-300 text-base">جاري تأكيد عملية الشحن وتوثيق الفاتورة...</h3>
                <p className="text-xs text-slate-300 mt-1">
                  يتم التحقق الآمن عبر بوابة <strong className="text-white">{selectedGateway === 'google_apple' ? 'Google Play Billing' : 'بوابة الدفع الآمنة'}</strong> وإيداع <strong className="text-amber-300 font-mono">+{(selectedPackage.coinsAmount + selectedPackage.bonusCoins).toLocaleString()} 🪙</strong> في حسابك فورياً.
                </p>
              </div>
            </div>
          )}

          {/* SUCCESS MODAL STATE */}
          {purchaseStep === 'SUCCESS' && lastTx && (
            <div className="p-6 text-center space-y-4 bg-gradient-to-b from-emerald-950/80 via-slate-950 to-slate-950 rounded-3xl border-2 border-emerald-400/80 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-300 shadow-lg">
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </div>

              <div>
                <h3 className="font-black text-emerald-300 text-lg">مبروك! تمت عملية الشحن بنجاح 🎉</h3>
                <p className="text-xs text-slate-300 mt-0.5">تم إضافة العملات وتحديث رصيدك وحسابك بشكل فوري وسحابي.</p>
              </div>

              <div className="text-xs text-slate-200 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 font-mono text-right shadow-inner">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">رقم الفاتورة:</span>
                  <span className="text-white font-bold">{lastTx.googleOrderId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">باقة الشحن:</span>
                  <span className="text-amber-300 font-bold">{lastTx.packageName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">العملات المكتسبة:</span>
                  <span className="text-emerald-400 font-black text-sm">+{lastTx.amountCoins.toLocaleString()} 🪙</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="text-slate-400">الحالة:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>مكتملة وموثقة ✓</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setPurchaseStep('SELECT')}
                  className="py-2.5 px-6 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg cursor-pointer transition-all active:scale-95"
                >
                  شحن باقة أخرى 🪙
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-6 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl cursor-pointer"
                >
                  إغلاق المتجر
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB: PACKAGES GRID */}
          {/* ------------------------------------------------------------ */}
          {purchaseStep === 'SELECT' && storeTab === 'packages' && (
            <div className="space-y-3">
              
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedFilterCategory('all')}
                  className={`px-3 py-1 rounded-xl text-[10.5px] font-bold transition-all ${
                    selectedFilterCategory === 'all'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  جميع الباقات ({COIN_PACKAGES.length})
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFilterCategory('popular')}
                  className={`px-3 py-1 rounded-xl text-[10.5px] font-bold transition-all ${
                    selectedFilterCategory === 'popular'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  الأكثر طلباً 🔥
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFilterCategory('vip')}
                  className={`px-3 py-1 rounded-xl text-[10.5px] font-bold transition-all ${
                    selectedFilterCategory === 'vip'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  باقات VIP 👑
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFilterCategory('whales')}
                  className={`px-3 py-1 rounded-xl text-[10.5px] font-bold transition-all ${
                    selectedFilterCategory === 'whales'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  صناديق الحيتان 🐋
                </button>
              </div>

              {/* Grid of Packages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {filteredPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative rounded-2xl p-3.5 transition-all flex flex-col justify-between space-y-3 shadow-lg group border ${
                      pkg.popular
                        ? 'bg-gradient-to-b from-[#241842] to-[#120a22] border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-950/80 hover:bg-slate-900/90 border-slate-800/90 hover:border-amber-500/50'
                    }`}
                  >
                    {/* Badge */}
                    {pkg.badge && (
                      <span className="absolute -top-2.5 left-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-full shadow-md">
                        {pkg.badge}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{pkg.icon || '🪙'}</span>
                        <h4 className="font-black text-xs text-amber-200 truncate">{pkg.title}</h4>
                      </div>

                      {/* Coins Amount */}
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                          {pkg.coinsAmount.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-amber-400 font-bold">🪙 كوينز</span>
                      </div>

                      {/* Bonus Coins Tag */}
                      {pkg.bonusCoins > 0 && (
                        <div className="mt-1 flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg w-fit">
                          <span>+{pkg.bonusCoins.toLocaleString()} بونص مجاني 🎁</span>
                        </div>
                      )}
                    </div>

                    {/* Price and Buy Button */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="text-right font-mono">
                        <span className="text-xs font-black text-amber-300 block">
                          ${pkg.priceUsd} <span className="text-[9px] text-slate-400 font-normal">USD</span>
                        </span>
                        {pkg.priceSar && (
                          <span className="text-[9px] text-slate-400 block">
                            ≈ {pkg.priceSar} ر.س
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectPackageToBuy(pkg)}
                        className="py-1.5 px-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>شحن</span>
                        <ChevronRight className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB: CUSTOM AMOUNT RECHARGE */}
          {/* ------------------------------------------------------------ */}
          {purchaseStep === 'SELECT' && storeTab === 'custom' && (
            <div className="space-y-4 bg-[#191130]/90 border border-purple-500/40 rounded-3xl p-4 sm:p-5 shadow-xl">
              <div>
                <h4 className="font-black text-sm text-amber-300 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>تحديد كمية كوينزات مخصصة للشحن:</span>
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  اختر الكمية التي تريدها بالضبط، وسيقوم النظام باحتساب السعر والبونص التلقائي فورياً.
                </p>
              </div>

              {/* Slider & Display */}
              <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">الكمية المختارة:</span>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-2xl font-black text-amber-300">{customCoins.toLocaleString()}</span>
                    <span className="text-xs text-amber-400 font-bold">🪙 عملة</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="1000"
                  max="1000000"
                  step="1000"
                  value={customCoins}
                  onChange={(e) => setCustomCoins(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />

                {/* Quick amount presets */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 pt-1">
                  {[1000, 3500, 7000, 10000, 20000, 50000, 100000, 300000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCustomCoins(preset)}
                      className={`py-1 rounded-xl text-[10px] font-mono font-bold transition-all border ${
                        customCoins === preset
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculation Summary Card */}
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                  <span className="text-[9.5px] text-slate-400 block font-sans">السعر بالدولار</span>
                  <span className="text-sm font-black text-amber-300 mt-0.5 block">${customCalc.priceUsd} USD</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                  <span className="text-[9.5px] text-slate-400 block font-sans">بونص مجاني</span>
                  <span className="text-sm font-black text-emerald-400 mt-0.5 block">+{customCalc.bonusCoins.toLocaleString()} 🪙</span>
                </div>
                <div className="bg-amber-950/40 p-2.5 rounded-2xl border border-amber-400/40">
                  <span className="text-[9.5px] text-amber-300 font-bold block font-sans">إجمالي ما ستستلمه</span>
                  <span className="text-sm font-black text-white mt-0.5 block">{customCalc.totalCoins.toLocaleString()} 🪙</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBuyCustom}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-950/50 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>إتمام الشحن الآن (${customCalc.priceUsd} USD)</span>
              </button>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB: RECHARGE HISTORY */}
          {/* ------------------------------------------------------------ */}
          {purchaseStep === 'SELECT' && storeTab === 'history' && (
            <div className="space-y-3 bg-slate-950/90 border border-slate-800 rounded-3xl p-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-black text-xs text-amber-300 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-cyan-400" />
                  <span>سجل عمليات الشحن والفواتير السابقة:</span>
                </h4>
                <span className="text-[10px] text-slate-400">توثيق رسمي مشفر</span>
              </div>

              {lastTx ? (
                <div className="space-y-2">
                  <div className="bg-slate-900/90 p-3 rounded-2xl border border-emerald-500/40 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-white block">{lastTx.packageName}</span>
                      <span className="text-[9.5px] text-slate-400 font-mono block mt-0.5">
                        رقم الطلب: {lastTx.googleOrderId} • {lastTx.timestamp}
                      </span>
                    </div>

                    <div className="text-left font-mono">
                      <span className="text-xs font-black text-emerald-400 block">+{lastTx.amountCoins.toLocaleString()} 🪙</span>
                      <span className="text-[9px] text-slate-400 block">${lastTx.priceUsd} USD</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center space-y-2">
                  <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">لا توجد عمليات شحن سابقة مسجلة في هذه الجلسة بعد.</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* 6. MODAL FOOTER */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-900 shrink-0">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>بوابة شحن مشفرة ومحمية بالكامل 256-bit SSL</span>
          </span>
          <span className="font-mono text-amber-300">تسليم وتفعيل فوري للعملات ⚡</span>
        </div>

      </div>
    </div>
  );
};
